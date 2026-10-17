"""Pixel routing (prompts B and B2): routes found directly on the DK map pixels, no lane graph.

    python scripts/astrogation/routes.py [image]

Rodrigo's routing rule (B2): lanes exist because the space between them is NOT empty. So
  1. if origin and destination can be joined entirely through lanes, that is the route, however long (majors first, then minors);
  2. only if no all-lane path exists may the route leave a lane, and then for the shortest possible off-lane stretch;
  3. a planet a lane passes through is ON the lane.
Implemented as a LEXICOGRAPHIC cost: major lane pixel 1, minor lane pixel MINOR_COST (3), off-lane pixel OFF_COST (100000).

  1. cost raster   lane pixel (existing detection, masks.py); occluded run <= BRIDGE_PX flanked by lane pixels in a straight line = lane;
                   a dot disc is lane when a lane pixel touches its rim (within DOT_TOUCH_PX), otherwise it stays off-lane.
  2. major / minor every lane pixel is MINOR; MAJOR = stroke width (FWHM of the perpendicular profile), grown from the numbered markers.
  3. router        8-connected minimum-cost path (skimage MCP, float64) between dot centres.
  4. test trips    drawn on the map; named stops, mask-gap flags, hazards (hazards.json), difficulty and travel band.
"""
import hashlib
import json
import os
import sys
import time

import cv2
import numpy as np
from scipy import ndimage as ndi
from scipy.ndimage import map_coordinates
from skimage.graph import route_through_array

sys.path.insert(0, os.path.dirname(__file__))
import masks
from common import OUT_DIR, ROOT

EV_DIR = os.path.join(OUT_DIR, 'evidence', 'routes')
CACHE_DIR = os.path.join(ROOT, 'private', 'astro_cache')   # regenerable; private/ is git-ignored
BRIDGE_PX = 12          # an occluded run up to this long, flanked by lane pixels in a straight line, costs as lane
OFF_COST = 100000.0     # lexicographic: minimise off-lane distance first, then lane cost
MAJOR_COST = 1.0
MINOR_COSTS = (2.0, 3.0, 5.0)   # major:minor 1:2, 1:3, 1:5 (information only)
DECISION_MINOR_COST = 3.0
DOT_TOUCH_PX = 3        # a dot disc is lane if a lane pixel lies within this many px of its rim
LONG_ROUTE_RATIO = 2.5  # a route longer than this x the straight line is flagged as a possible mask gap
HAZARDS = os.path.join(OUT_DIR, 'hazards.json')
MAJOR_W = (4.0, 7.0)    # FWHM band (px) of a CONFIRMED major stroke: majors peak at 4.5-5.5 px, minors at 2-3 px (see report 'major_signal')
MAJOR_W_LOOSE = (3.5, 8.0)   # growth band: a lane pixel this wide, linked to a confirmed major, is major too (junctions and shaded stretches read narrower)
MAJOR_SEED_PX = 120     # a major component must have a candidate pixel this close to a numbered marker
MAJOR_LINK_PX = 14      # candidate pixels this close are one component (bridges labels / dots on a major)
MAJOR_GROW_LINK_PX = 26 # ... in the growth pass (a major's lane is often broken longer than that under a label)
MAJOR_MIN_BLOB_PX = 30  # a candidate blob smaller than this is texture (region fills, stars), not a stroke
MAJOR_BRIDGE_PX = 13    # a bridged pixel is major when a major lane pixel is this close
MIN_AMP = 15.0          # perpendicular profile peak must stand this far above its base to count as a stroke
ROUTE_NAMES = {1: 'Perlemian Trade Route', 2: 'Corellian Run', 3: 'Corellian Trade Spine', 4: 'Rimma Trade Route', 5: 'Hydian Way'}

# Table 7-14 bands (AoE Core), hours except where noted. Class-1 hyperdrive = table value; other classes multiply it.
BANDS = ['within a sector', 'within a region', 'between regions', 'across the galaxy']
BAND_TIME = ['10 to 24 hours', '10 to 72 hours', '3 days to 1 week', '1 to 3 weeks']
# radial order of the DK map's regions, used only to tell "between regions" from "across the galaxy"
RING = {'Deep Core': 0, 'Core Worlds': 1, 'Colonies': 2, 'Inner Rim': 3, 'Expansion Region': 4, 'Mid Rim': 5, 'Outer Rim Territories': 6}
ACROSS_RING_GAP = 5      # CC choice (the table does not define it): regions >= this many rings apart count as across the galaxy

TRIPS = [('Coruscant', 'Corellia'), ('Kessel', 'Formos'), ('Coruscant', 'Ord Mantell'), ('Corellia', 'Nal Hutta'), ('Brentaal', 'Corsin'),
         ('Bandomeer', 'Daiyu'), ('Coruscant', "Bar'leth"), ('Fedalle', 'Coruscant'), ('Ryloth', 'Tatooine'), ('Coruscant', 'PIN')]
PIN_XY = (1100.0, 2100.0)   # test pin: black space west of the galaxy, by the "Unknown Regions" label


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for c in iter(lambda: f.read(1 << 20), b''):
            h.update(c)
    return h.hexdigest()


# ------------------------------------------------------------------ 1. bridging occluded runs
def _bridge_axis(lane, occ):
    """Occluded pixels lying in an occluded run (along axis 1) of <= BRIDGE_PX whose two flanking pixels are both lane."""
    H, W = lane.shape
    ar = np.arange(W, dtype=np.int32)[None, :]
    free = ~occ
    left = np.maximum.accumulate(np.where(free, ar, -1), axis=1)                       # last non-occluded column at or before x
    right = np.minimum.accumulate(np.where(free, ar, W + 1)[:, ::-1], axis=1)[:, ::-1]  # next non-occluded column at or after x
    lc, rc = np.clip(left, 0, W - 1), np.clip(right, 0, W - 1)
    rows = np.arange(H)[:, None]
    ok = occ & (left >= 0) & (right <= W - 1) & lane[rows, lc] & lane[rows, rc] & ((right - left - 1) <= BRIDGE_PX)
    return ok


def bridged(lane, occ):
    """Horizontal, vertical and both diagonal straight runs (diagonals by shearing, so each diagonal becomes a row)."""
    out = _bridge_axis(lane, occ) | _bridge_axis(lane.T, occ.T).T
    H, W = lane.shape
    for sign in (1, -1):
        wide = np.zeros((H, W + H), bool), np.zeros((H, W + H), bool)
        for i in range(H):
            o = i if sign == 1 else H - 1 - i
            wide[0][i, o:o + W] = lane[i]
            wide[1][i, o:o + W] = occ[i]
        b = _bridge_axis(*wide)
        for i in range(H):
            o = i if sign == 1 else H - 1 - i
            out[i] |= b[i, o:o + W]
    return out


# ------------------------------------------------------------------ 2. major / minor
def stroke_widths(im, lane_ok, ori):
    """FWHM (px) and amplitude of the perpendicular luminance profile at every lane pixel. -> (ys, xs, width, amp)"""
    gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
    ys, xs = np.nonzero(lane_ok)
    th = ori[ys, xs]
    nx, ny = -np.sin(th), np.cos(th)
    t = np.arange(-10, 10.01, 0.5)
    prof = np.empty((len(ys), len(t)), np.float32)
    for k, tt in enumerate(t):
        prof[:, k] = map_coordinates(gray, [ys + tt * ny, xs + tt * nx], order=1, mode='nearest')
    win = np.abs(t) <= 3
    pk = prof[:, win].max(1)
    base = np.median(prof[:, np.abs(t) >= 7], axis=1)
    above = prof >= (base + (pk - base) / 2)[:, None]
    pkidx = np.where(win)[0][prof[:, win].argmax(1)]
    # run of `above` around the peak: first False to the left / right of it
    idx = np.arange(len(t))[None, :]
    lft = np.where(~above & (idx < pkidx[:, None]), idx, -1).max(1)
    rgt = np.where(~above & (idx > pkidx[:, None]), idx, len(t)).min(1)
    return ys, xs, (rgt - lft - 1) * 0.5, pk - base


def major_mask(lane_ok, ys, xs, wid, amp, markers):
    """MAJOR = lane pixels with a major-width stroke, grown from the numbered route markers 1-5. Two passes:
      1. confirmed: width in MAJOR_W, in components (linked across MAJOR_LINK_PX) that touch a marker;
      2. growth: pixels with width in MAJOR_W_LOOSE that link (across MAJOR_LINK_PX) to a confirmed pixel.
    -> bool mask"""
    se = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (MAJOR_LINK_PX, MAJOR_LINK_PX))

    def cands(lo, hi):
        c = np.zeros(lane_ok.shape, bool)
        sel = (amp >= MIN_AMP) & (wid >= lo) & (wid <= hi)
        c[ys[sel], xs[sel]] = True
        lab0, n0 = ndi.label(c, structure=np.ones((3, 3)))
        size = np.bincount(lab0.ravel(), minlength=n0 + 1)
        return c & (size[lab0] >= MAJOR_MIN_BLOB_PX)

    strict = cands(*MAJOR_W)
    lab, _ = ndi.label(cv2.dilate(strict.astype(np.uint8), se), structure=np.ones((3, 3)))
    keep = set()
    for (cx, cy) in markers.values():
        y0, y1, x0, x1 = int(cy) - MAJOR_SEED_PX, int(cy) + MAJOR_SEED_PX + 1, int(cx) - MAJOR_SEED_PX, int(cx) + MAJOR_SEED_PX + 1
        keep |= set(np.unique(lab[y0:y1, x0:x1][strict[y0:y1, x0:x1]]).tolist())
    keep.discard(0)
    confirmed = strict & np.isin(lab, list(keep))
    loose = cands(*MAJOR_W_LOOSE) | confirmed
    se2 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (MAJOR_GROW_LINK_PX, MAJOR_GROW_LINK_PX))
    lab2, _ = ndi.label(cv2.dilate(loose.astype(np.uint8), se2), structure=np.ones((3, 3)))
    grown = set(np.unique(lab2[confirmed]).tolist())
    grown.discard(0)
    return loose & np.isin(lab2, list(grown))


# ------------------------------------------------------------------ 3. cost raster + router
def classes(lane, occ, major):
    """-> (lane_class uint8: 0 off-lane, 1 minor lane, 2 major lane; bridged bool)"""
    br = bridged(lane, occ)
    ls = lane & ~occ
    near_major = cv2.dilate(major.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * MAJOR_BRIDGE_PX + 1,) * 2)) > 0
    cls = np.zeros(lane.shape, np.uint8)
    cls[ls | br] = 1
    cls[major | (br & near_major)] = 2
    return cls, br


def dot_discs(cls, lane_ok, major, P, RIM):
    """Rule 3: a planet a lane passes through is ON the lane. A dot disc (measured rim + DOT_TOUCH_PX) becomes lane (major when a major lane
    pixel touches it, else minor) when at least one lane pixel lies within DOT_TOUCH_PX of its rim. Dots no lane touches stay off-lane, so a
    nearby dot cannot fuse two lanes that do not meet. -> (cls, number of dots made lane)"""
    cls = cls.copy()
    n = 0
    for k in range(len(P)):
        x, y, r = P[k][0], P[k][1], RIM[k] + DOT_TOUCH_PX
        x0, x1, y0, y1 = int(x - r - 2), int(x + r + 3), int(y - r - 2), int(y + r + 3)
        if x0 < 0 or y0 < 0 or x1 > 4000 or y1 > 4000:
            continue
        yy, xx = np.mgrid[y0:y1, x0:x1]
        d = np.hypot(xx - x, yy - y)
        near = d <= r + 1
        if not (lane_ok[y0:y1, x0:x1] & near).any():
            continue
        v = 2 if (major[y0:y1, x0:x1] & near).any() else 1
        sub_ = cls[y0:y1, x0:x1]
        sub_[d <= r] = np.maximum(sub_[d <= r], v)
        n += 1
    return cls, n


def cost_of(cls, minor_cost):
    """major lane 1, minor lane `minor_cost`, off-lane OFF_COST. float64 (the lexicographic spread needs it)."""
    c = np.full(cls.shape, OFF_COST, np.float64)
    c[cls == 1] = minor_cost
    c[cls == 2] = MAJOR_COST
    return c


def route(cost, a, b, free_r=(0, 0)):
    """Minimum-cost 8-connected path from pixel a to b (x, y). The ROI around the pair grows until the path stays clear of its border,
    because an all-lane route can be much longer than the straight line. The two endpoint discs always cost as lane (the path starts and ends
    at a dot centre). -> (N, 2) float xy"""
    L = float(np.hypot(b[0] - a[0], b[1] - a[1]))
    m = int(max(300, 1.0 * L))
    while True:
        x0, x1 = int(max(min(a[0], b[0]) - m, 0)), int(min(max(a[0], b[0]) + m, cost.shape[1] - 1))
        y0, y1 = int(max(min(a[1], b[1]) - m, 0)), int(min(max(a[1], b[1]) + m, cost.shape[0] - 1))
        roi = cost[y0:y1 + 1, x0:x1 + 1].copy()
        for p, r in ((a, free_r[0]), (b, free_r[1])):
            cv2.circle(roi, (int(round(p[0])) - x0, int(round(p[1])) - y0), int(np.ceil(r)), MAJOR_COST, -1)
        idx, _ = route_through_array(roi, (int(round(a[1])) - y0, int(round(a[0])) - x0), (int(round(b[1])) - y0, int(round(b[0])) - x0),
                                     fully_connected=True, geometric=True)
        path = np.array([(c + x0, r + y0) for r, c in idx], float)
        full = x0 == 0 and y0 == 0 and x1 == cost.shape[1] - 1 and y1 == cost.shape[0] - 1
        touches = ((path[:, 0] <= x0 + 2) & (x0 > 0)).any() or ((path[:, 0] >= x1 - 2) & (x1 < cost.shape[1] - 1)).any() or \
                  ((path[:, 1] <= y0 + 2) & (y0 > 0)).any() or ((path[:, 1] >= y1 - 2) & (y1 < cost.shape[0] - 1)).any()
        if full or not touches:
            return path
        m *= 2


# ------------------------------------------------------------------ 4. difficulty and travel
def travel_band(oreg, osec, dreg, dsec):
    if oreg is None or dreg is None:
        return 3          # an uncharted endpoint: the farthest band
    if osec is not None and osec == dsec:
        return 0
    if oreg == dreg:
        return 1
    ga, gb = RING.get(oreg), RING.get(dreg)
    if ga is not None and gb is not None and abs(ga - gb) >= ACROSS_RING_GAP:
        return 3
    return 2


DIFF_NAMES = {0: 'Simple', 1: 'Easy', 2: 'Average', 3: 'Hard', 4: 'Daunting', 5: 'Formidable'}


def difficulty(f_major, f_minor, f_off, band, uncharted):
    """The brief's house model. base Easy (1); lane composition +0 all major / +1 any minor legs / +2 off-lane < 1/4 / +3 1/4..2/3 / +4 > 2/3;
    distance +0..+3 by band; +2 for an uncharted pin endpoint. Score above 5 -> the excess becomes UPGRADES (no cap)."""
    if f_off <= 0.0:
        lane = 0 if f_minor <= 0.0 else 1
    elif f_off < 0.25:
        lane = 2
    elif f_off <= 2 / 3:
        lane = 3
    else:
        lane = 4
    raw = 1 + lane + band + (2 if uncharted else 0)
    return {'raw_score': raw, 'lane_term': lane, 'distance_term': band, 'uncharted_term': 2 if uncharted else 0,
            'difficulty': DIFF_NAMES[min(raw, 5)], 'difficulty_dice': min(raw, 5), 'upgrades': max(0, raw - 5)}


def off_stretches(path, c, discs):
    """Every contiguous off-lane stretch outside the endpoint discs. -> [{start_xy, end_xy, length_px, mid_xy}]"""
    inside = np.zeros(len(path), bool)
    for xy, r in discs:
        inside |= np.hypot(*(path - xy).T) <= r
    out, k = [], 0
    seg = np.r_[0.0, np.hypot(*np.diff(path, axis=0).T)]
    while k < len(path):
        if c[k] == 0 and not inside[k]:
            j = k
            while j + 1 < len(path) and c[j + 1] == 0 and not inside[j + 1]:
                j += 1
            out.append({'start_xy': [round(float(v), 1) for v in path[k]], 'end_xy': [round(float(v), 1) for v in path[j]],
                        'mid_xy': [round(float(v), 1) for v in path[(k + j) // 2]], 'length_px': round(float(seg[k + 1:j + 1].sum()) + 1.0, 1)})
            k = j + 1
        else:
            k += 1
    return out


def stops_along(path, dot_names, P, R):
    """Named systems whose dot the path passes through, in path order. dot_names: {dot index: [system names]}"""
    found = []
    for k, names in dot_names.items():
        d = np.hypot(*(path - P[k]).T)
        i = int(d.argmin())
        if d[i] <= R[k] + 2:
            found.append((i, names))
    found.sort(key=lambda t: t[0])
    return [n for _, names in found for n in names]


def hazard_for(stops, hazards):
    """Hazards whose system is a stop on the route (start, end or passed through). -> list of hazard dicts"""
    return [h for h in hazards if h['_name'] in stops]


def analyse(path, cls, ly_per_px, discs):
    """Fractions are by arc length over the path OUTSIDE the endpoint dot discs (`discs` = [(xy, radius)]; the path starts and ends at a dot
    centre, and the disc itself is neither lane nor background). `endpoint_disc_px` reports what was left out. -> (info, per-pixel class)"""
    ys, xs = np.clip(path[:, 1].round().astype(int), 0, 3999), np.clip(path[:, 0].round().astype(int), 0, 3999)
    seg = np.r_[0.0, np.hypot(*np.diff(path, axis=0).T)]
    c = cls[ys, xs].copy()
    inside = np.zeros(len(path), bool)
    for xy, r in discs:
        inside |= np.hypot(*(path - xy).T) <= r
    c[inside] = 1                                                           # drawn as lane; not counted below
    w = np.where(inside, 0.0, seg)
    tot = float(w.sum()) or 1.0
    return {'length_px': round(float(seg.sum()), 1), 'length_ly': round(float(seg.sum()) * ly_per_px, 0),
            'endpoint_disc_px': round(float(seg[inside].sum()), 1),
            'frac_major': round(float(w[c == 2].sum()) / tot, 3), 'frac_minor': round(float(w[(c == 1) & ~inside].sum()) / tot, 3),
            'frac_off_lane': round(float(w[c == 0].sum()) / tot, 3)}, c


# ------------------------------------------------------------------ drawing
def _wrap(text, width):
    words, lines, cur = text.split(' '), [], ''
    for w in words:
        if len(cur) + len(w) + 1 > width and cur:
            lines.append(cur)
            cur = w
        else:
            cur = (cur + ' ' + w).strip()
    return lines + ([cur] if cur else [])


def draw_trip(im, path, c, a_name, b_name, info, fname):
    pad = 60
    x0, y0 = int(max(path[:, 0].min() - pad, 0)), int(max(path[:, 1].min() - pad, 0))
    x1, y1 = int(min(path[:, 0].max() + pad, 4000)), int(min(path[:, 1].max() + pad, 4000))
    crop = im[y0:y1, x0:x1].copy()
    pts = (path - [x0, y0]).round().astype(np.int32)
    col = {2: (0, 255, 255), 1: (255, 255, 0), 0: (0, 0, 255)}                 # major yellow, minor cyan, off-lane red (BGR)
    dash = 0
    for k in range(1, len(pts)):
        cc = int(c[k])
        if cc == 0:
            dash += 1
            if (dash // 5) % 2:                                                 # dashed
                continue
        else:
            dash = 0
        cv2.line(crop, tuple(pts[k - 1]), tuple(pts[k]), col[cc], 2 if cc else 1, cv2.LINE_AA)
    lines = [f"{a_name} - {b_name}   {info['length_px']:.0f} px ({info['straight_px']:.0f} straight, x{info['length_px'] / max(info['straight_px'], 1):.2f})  {info['length_ly']:.0f} ly   major {info['frac_major']:.0%}  minor {info['frac_minor']:.0%}  off-lane {info['frac_off_lane']:.0%}",
             f"{info['band']} ({info['time_class1']}, class 1)   difficulty {info['difficulty']} (raw {info['raw_score']}, upgrades {info['upgrades']} + hazard {info['hazard_upgrades']} = {info['total_upgrades']})   cost major 1 : minor {info['minor_cost']:g} : off-lane {info['off_cost']:g}"]
    lines += _wrap('stops: ' + (' > '.join(info['stops']) or '(none named)'), 110)
    pw = max(crop.shape[1], 900)
    bar = np.zeros((20 * len(lines) + 6, pw, 3), np.uint8)
    for n, t in enumerate(lines):
        cv2.putText(bar, t, (6, 18 + 20 * n), cv2.FONT_HERSHEY_SIMPLEX, 0.46, (255, 255, 255), 1, cv2.LINE_AA)
    body = np.zeros((crop.shape[0], pw, 3), np.uint8)
    body[:, :crop.shape[1]] = crop
    cv2.imwrite(os.path.join(EV_DIR, fname), np.vstack([bar, body]))


def draw_gap(im, path, c, stretch, label, fname):
    """Native-resolution crop around one flagged off-lane stretch; the route drawn as in the trip crop, the stretch ringed."""
    mx, my = stretch['mid_xy']
    half = int(max(70, stretch['length_px'] / 2 + 50))
    x0, y0, x1, y1 = int(max(mx - half, 0)), int(max(my - half, 0)), int(min(mx + half, 4000)), int(min(my + half, 4000))
    crop = im[y0:y1, x0:x1].copy()
    pts = (path - [x0, y0]).round().astype(np.int32)
    col = {2: (0, 255, 255), 1: (255, 255, 0), 0: (0, 0, 255)}
    for k in range(1, len(pts)):
        cv2.line(crop, tuple(pts[k - 1]), tuple(pts[k]), col[int(c[k])], 1, cv2.LINE_AA)
    cv2.circle(crop, (int(mx - x0), int(my - y0)), int(stretch['length_px'] / 2 + 8), (255, 0, 255), 1, cv2.LINE_AA)
    bar = np.zeros((26, max(crop.shape[1], 560), 3), np.uint8)
    cv2.putText(bar, f"{label}: off-lane {stretch['length_px']:.0f} px at ({mx:.0f}, {my:.0f})", (4, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)
    body = np.zeros((crop.shape[0], bar.shape[1], 3), np.uint8)
    body[:, :crop.shape[1]] = crop
    cv2.imwrite(fname, np.vstack([bar, body]))


def slug(s):
    return ''.join(ch.lower() if ch.isalnum() else '-' for ch in s).strip('-').replace('--', '-')


def main():
    t0 = time.time()
    img = sys.argv[1] if len(sys.argv) > 1 else None
    priv = os.path.join(ROOT, 'private')
    if img is None:
        img = os.path.join(priv, [f for f in os.listdir(priv) if f.startswith('star_wars_galaxy_map') and f.endswith('.jpeg')][0])
    # 0. inputs: HARD STOP on any mismatch with inputs.sha256
    want = {l.split()[1]: l.split()[0] for l in open(os.path.join(OUT_DIR, 'inputs.sha256')).read().splitlines() if l.strip()}
    got = {os.path.basename(p): sha256(p) for p in (img, os.path.join(priv, 'galaxy_systems.json'), os.path.join(priv, 'planets.json'))}
    if got != want:
        sys.exit(f'HARD STOP: input checksum mismatch\n want {want}\n got  {got}')
    print('inputs match inputs.sha256:', {k: v[:12] for k, v in got.items()})
    im = cv2.imread(img)
    assert im.shape[:2] == (4000, 4000)
    os.makedirs(EV_DIR, exist_ok=True)
    os.makedirs(CACHE_DIR, exist_ok=True)

    m = masks.build(im, os.path.join(CACHE_DIR, 'masks.npz'))
    import edges
    _, ori, _ = edges.ridge_field(im)
    lane, occ = m['lane'], m['occ']
    ys, xs, wid, amp = stroke_widths(im, lane & ~occ, ori)
    major = major_mask(lane & ~occ, ys, xs, wid, amp, m['markers'])
    cls, br = classes(lane, occ, major)
    cls, n_dot_lane = dot_discs(cls, lane & ~occ, major, m['P'], m['RIM'])
    print('lane px', int((lane & ~occ).sum()), 'major px', int(major.sum()), 'bridged px', int(br.sum()), 'dots made lane', n_dot_lane, f'({time.time() - t0:.0f}s)')

    regions_meta = json.load(open(os.path.join(OUT_DIR, 'regions.json')))['meta']
    ly = regions_meta['ly_per_px']
    systems = json.load(open(os.path.join(OUT_DIR, 'systems.json')))
    by = {s['name']: s for s in systems if s['precision'] == 'dot'}
    P, RIM, R = m['P'], m['RIM'], m['R']
    dot_names = {}
    for s_ in systems:
        if s_['precision'] != 'dot':
            continue
        d_ = np.hypot(*(P - np.array([s_['px'], s_['py']])).T)
        k_ = int(d_.argmin())
        if d_[k_] < 8:
            dot_names.setdefault(k_, []).append(s_['name'])
    hazards = json.load(open(HAZARDS))
    id2name = {s_['id']: s_['name'] for s_ in systems}
    for h in hazards:
        h['_name'] = id2name[h['system']]

    def endpoint(name):
        if name == 'PIN':
            return {'name': 'PIN (uncharted, Unknown Regions)', 'xy': np.array(PIN_XY), 'region': None, 'sector': None, 'rim': 0.0, 'pin': True}
        s = by[name]
        xy = np.array([s['px'], s['py']])
        d = np.hypot(*(P - xy).T)
        k = int(d.argmin())
        return {'name': name, 'xy': xy, 'region': s['region'], 'sector': s['sector'], 'rim': float(RIM[k]) if d[k] < 6 else 10.0, 'pin': False}

    # ---- evidence: major mask and cost raster
    mm = np.zeros((4000, 4000), np.uint8)
    mm[(cls == 1)] = 110
    mm[(cls == 2)] = 255
    cv2.imwrite(os.path.join(EV_DIR, 'major_mask.png'), mm)
    prev = np.zeros((4000, 4000, 3), np.uint8)
    prev[cls > 0] = (255, 255, 255)
    prev[br] = (0, 200, 0)
    prev = cv2.dilate(prev, np.ones((3, 3), np.uint8))
    cv2.imwrite(os.path.join(EV_DIR, 'cost_raster.png'), cv2.resize(prev, (2000, 2000), interpolation=cv2.INTER_AREA))

    gaps_dir = os.path.join(EV_DIR, 'gaps')
    os.makedirs(gaps_dir, exist_ok=True)
    for old in os.listdir(gaps_dir):
        os.remove(os.path.join(gaps_dir, old))
    results, sens, flags = [], {f'1:{mc:g}': [] for mc in MINOR_COSTS}, []
    for a_name, b_name in TRIPS:
        A, B = endpoint(a_name), endpoint(b_name)
        row_for = {}
        for mc in MINOR_COSTS:
            path = route(cost_of(cls, mc), A['xy'], B['xy'], (A['rim'], B['rim']))
            discs = [(A['xy'], A['rim']), (B['xy'], B['rim'])]
            info, c = analyse(path, cls, ly, discs)
            band = travel_band(A['region'], A['sector'], B['region'], B['sector'])
            stops = stops_along(path, dot_names, P, R)
            hz = hazard_for(stops, hazards)
            info.update({'band': BANDS[band], 'time_class1': BAND_TIME[band], 'minor_cost': mc, 'off_cost': OFF_COST,
                         'straight_px': round(float(np.hypot(*(B['xy'] - A['xy']))), 1), 'stops': stops,
                         **difficulty(info['frac_major'], info['frac_minor'], info['frac_off_lane'], band, A['pin'] or B['pin'])})
            info['hazards'] = [{'system': h['system'], 'upgrades': h['upgrades'], 'note': h['note']} for h in hz]
            info['hazard_upgrades'] = sum(h['upgrades'] for h in hz)
            info['total_upgrades'] = info['upgrades'] + info['hazard_upgrades']
            info['off_lane_stretches'] = off_stretches(path, c, discs)
            info['long_route'] = bool(info['length_px'] > LONG_ROUTE_RATIO * max(info['straight_px'], 1.0))
            row = {'origin': A['name'], 'destination': B['name'], 'origin_region': A['region'], 'origin_sector': A['sector'],
                   'destination_region': B['region'], 'destination_sector': B['sector'], **info}
            sens[f'1:{mc:g}'].append(row)
            row_for[mc] = (path, c, info)
        path, c, info = row_for[DECISION_MINOR_COST]
        tag = f"{slug(a_name)}-{slug(b_name)}"
        draw_trip(im, path, c, A['name'], B['name'], info, f"{tag}.png")
        for n_, st in enumerate(info['off_lane_stretches'], 1):
            draw_gap(im, path, c, st, f'{a_name} - {b_name} stretch {n_}', os.path.join(gaps_dir, f'{tag}-{n_}.png'))
        if info['off_lane_stretches'] or info['long_route']:
            flags.append({'trip': f'{a_name} - {b_name}', 'off_lane_stretches': len(info['off_lane_stretches']),
                          'off_lane_px': round(sum(s_['length_px'] for s_ in info['off_lane_stretches']), 1), 'long_route': info['long_route'],
                          'length_over_straight': round(info['length_px'] / max(info['straight_px'], 1.0), 2),
                          'crops': [f'gaps/{tag}-{n_}.png' for n_ in range(1, len(info['off_lane_stretches']) + 1)]})
        results.append(next(r for r in sens[f'1:{DECISION_MINOR_COST:g}'] if r['origin'] == A['name'] and r['destination'] == B['name']))
        print(f"{A['name']:>12} - {B['name']:<30} {info['length_px']:6.0f}px x{info['length_px'] / max(info['straight_px'], 1):.2f} major {info['frac_major']:.2f} minor {info['frac_minor']:.2f} off {info['frac_off_lane']:.2f} stretches {len(info['off_lane_stretches'])} {info['band']:<17} {info['difficulty']} +{info['upgrades']} haz+{info['hazard_upgrades']}")

    wsel = (amp >= MIN_AMP)
    out = {'inputs_sha256': got, 'cost': {'major': MAJOR_COST, 'minor_decision': DECISION_MINOR_COST, 'off_lane': OFF_COST}, 'dots_made_lane': n_dot_lane,
           'params': {'bridge_px': BRIDGE_PX, 'dot_touch_px': DOT_TOUCH_PX, 'long_route_ratio': LONG_ROUTE_RATIO, 'major_width_px': MAJOR_W, 'major_seed_px': MAJOR_SEED_PX,
           'major_link_px': MAJOR_LINK_PX, 'major_grow_link_px': MAJOR_GROW_LINK_PX, 'major_min_blob_px': MAJOR_MIN_BLOB_PX, 'major_width_loose_px': MAJOR_W_LOOSE, 'major_bridge_px': MAJOR_BRIDGE_PX, 'across_galaxy_ring_gap': ACROSS_RING_GAP, 'pin_xy': PIN_XY},
           'major_signal': {'signal': 'stroke width: FWHM of the perpendicular luminance profile on the original image at each lane pixel (majors are drawn ~5 px wide with a bright core, minors ~2 px)',
                            'width_histogram_px': {str(float(v)): int(n) for v, n in zip(*np.unique(wid[wsel], return_counts=True))},
                            'major_px': int(major.sum()), 'lane_px': int((lane & ~occ).sum()), 'bridged_px': int(br.sum())},
           'flagged_mask_gaps': flags, 'trips': results, 'sensitivity_major_to_minor_cost': sens}
    json.dump(out, open(os.path.join(OUT_DIR, 'routes_test.json'), 'w'), indent=1)
    print(f'done in {time.time() - t0:.0f}s')


if __name__ == '__main__':
    main()
