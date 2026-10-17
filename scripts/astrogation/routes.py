"""Pixel routing test (prompt B): routes found directly on the DK map pixels, no lane graph.

    python scripts/astrogation/routes.py [image]

  1. cost raster   lane pixel (existing detection, masks.py) = 1; occluded pixel bridged between lane pixels along a straight run <= BRIDGE_PX = 1;
                   everything else = OFF_COST (default 25; 10 / 25 / 50 reported).
  2. major / minor every lane pixel is MINOR; MAJOR = stroke width (FWHM of the perpendicular profile on the original image) in the major band,
                   grown only from components that touch the numbered route markers 1-5.
  3. router        8-connected minimum-cost path (skimage MCP) between dot centres, ROI-limited.
  4. test trips    drawn on the map; difficulty and travel band from the brief's house model + AoE Core Table 7-14.
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
OFF_COSTS = (10, 25, 50)
DECISION_OFF_COST = 25
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


def cost_of(cls, off_cost):
    return np.where(cls > 0, 1.0, float(off_cost)).astype(np.float32)


def route(cost, a, b, free_r=(0, 0)):
    """Minimum-cost 8-connected path from pixel a to b (x, y), on an ROI around them. The two dot discs cost as lane (the path has to
    start and end at a dot centre; the disc is occluded and would otherwise charge the off-lane rate for leaving it). -> (N, 2) float xy"""
    L = float(np.hypot(b[0] - a[0], b[1] - a[1]))
    m = int(max(200, 0.6 * L))
    x0, x1 = int(max(min(a[0], b[0]) - m, 0)), int(min(max(a[0], b[0]) + m, cost.shape[1] - 1))
    y0, y1 = int(max(min(a[1], b[1]) - m, 0)), int(min(max(a[1], b[1]) + m, cost.shape[0] - 1))
    roi = cost[y0:y1 + 1, x0:x1 + 1].copy()
    for p, r in ((a, free_r[0]), (b, free_r[1])):
        cv2.circle(roi, (int(round(p[0])) - x0, int(round(p[1])) - y0), int(np.ceil(r)), 1.0, -1)
    idx, _ = route_through_array(roi, (int(round(a[1])) - y0, int(round(a[0])) - x0), (int(round(b[1])) - y0, int(round(b[0])) - x0),
                                 fully_connected=True, geometric=True)
    return np.array([(c + x0, r + y0) for r, c in idx], float)


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
    lines = [f"{a_name} - {b_name}   {info['length_px']:.0f} px  {info['length_ly']:.0f} ly   major {info['frac_major']:.0%}  minor {info['frac_minor']:.0%}  off-lane {info['frac_off_lane']:.0%}",
             f"{info['band']} ({info['time_class1']}, class 1)   difficulty {info['difficulty']} (raw {info['raw_score']}, upgrades {info['upgrades']})   off-lane cost {info['off_cost']}"]
    bar = np.zeros((22 * len(lines) + 6, max(crop.shape[1], 760), 3), np.uint8)
    for n, t in enumerate(lines):
        cv2.putText(bar, t, (6, 20 + 22 * n), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
    pw = max(crop.shape[1], 760)
    body = np.zeros((crop.shape[0], pw, 3), np.uint8)
    body[:, :crop.shape[1]] = crop
    cv2.imwrite(os.path.join(EV_DIR, fname), np.vstack([bar, body]))


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
    print('lane px', int((lane & ~occ).sum()), 'major px', int(major.sum()), 'bridged px', int(br.sum()), f'({time.time() - t0:.0f}s)')

    regions_meta = json.load(open(os.path.join(OUT_DIR, 'regions.json')))['meta']
    ly = regions_meta['ly_per_px']
    systems = json.load(open(os.path.join(OUT_DIR, 'systems.json')))
    by = {s['name']: s for s in systems if s['precision'] == 'dot'}
    P, RIM = m['P'], m['RIM']

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

    results, sens = [], {str(oc): [] for oc in OFF_COSTS}
    for a_name, b_name in TRIPS:
        A, B = endpoint(a_name), endpoint(b_name)
        row_for = {}
        for oc in OFF_COSTS:
            path = route(cost_of(cls, oc), A['xy'], B['xy'], (A['rim'], B['rim']))
            info, c = analyse(path, cls, ly, [(A['xy'], A['rim']), (B['xy'], B['rim'])])
            band = travel_band(A['region'], A['sector'], B['region'], B['sector'])
            info.update({'band': BANDS[band], 'time_class1': BAND_TIME[band], 'off_cost': oc,
                         **difficulty(info['frac_major'], info['frac_minor'], info['frac_off_lane'], band, A['pin'] or B['pin'])})
            row = {'origin': A['name'], 'destination': B['name'], 'origin_region': A['region'], 'origin_sector': A['sector'],
                   'destination_region': B['region'], 'destination_sector': B['sector'], **info}
            sens[str(oc)].append(row)
            row_for[oc] = (path, c, info)
        path, c, info = row_for[DECISION_OFF_COST]
        draw_trip(im, path, c, A['name'], B['name'], info, f"{slug(a_name)}-{slug(b_name)}.png")
        results.append(next(r for r in sens[str(DECISION_OFF_COST)] if r['origin'] == A['name'] and r['destination'] == B['name']))
        print(f"{A['name']:>12} - {B['name']:<34} {info['length_px']:7.0f}px major {info['frac_major']:.2f} minor {info['frac_minor']:.2f} off {info['frac_off_lane']:.2f} {info['band']:<18} {info['difficulty']} +{info['upgrades']}")

    wsel = (amp >= MIN_AMP)
    out = {'inputs_sha256': got, 'decision_off_cost': DECISION_OFF_COST, 'params': {'bridge_px': BRIDGE_PX, 'major_width_px': MAJOR_W, 'major_seed_px': MAJOR_SEED_PX,
           'major_link_px': MAJOR_LINK_PX, 'major_grow_link_px': MAJOR_GROW_LINK_PX, 'major_min_blob_px': MAJOR_MIN_BLOB_PX, 'major_width_loose_px': MAJOR_W_LOOSE, 'major_bridge_px': MAJOR_BRIDGE_PX, 'across_galaxy_ring_gap': ACROSS_RING_GAP, 'pin_xy': PIN_XY},
           'major_signal': {'signal': 'stroke width: FWHM of the perpendicular luminance profile on the original image at each lane pixel (majors are drawn ~5 px wide with a bright core, minors ~2 px)',
                            'width_histogram_px': {str(float(v)): int(n) for v, n in zip(*np.unique(wid[wsel], return_counts=True))},
                            'major_px': int(major.sum()), 'lane_px': int((lane & ~occ).sum()), 'bridged_px': int(br.sum())},
           'trips': results, 'sensitivity_off_lane_cost': sens}
    json.dump(out, open(os.path.join(OUT_DIR, 'routes_test.json'), 'w'), indent=1)
    print(f'done in {time.time() - t0:.0f}s')


if __name__ == '__main__':
    main()
