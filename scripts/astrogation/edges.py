"""Lane network by EDGE TESTING.

THE RULE: only record what the map shows. An edge exists only where the DK map draws a lane between two dots.
Nothing is snapped, inferred, or taken from any list. Ambiguous evidence = NO edge, reported as ambiguous.

Method (no line following: a label or dot over a lane cannot break anything, it only makes those pixels UNKNOWN):
  1. candidates  - every pair of detected dots <= 2 cells apart (a superset of the Delaunay edges). Hypotheses only.
  2. lane image  - Hessian ridge strength + local orientation of the 'whiteness' field (V-S), sigmas 1.5-4.5 px, blobs suppressed,
                   then COLOUR-GATED: a ridge pixel is lane only if it is near-white on the ORIGINAL image (low saturation, high
                   value; thresholds DERIVED from labelled lane / shaded-lane / outline samples, see colour_gate.py) AND
                   TWO-SIDED CONTRAST: brighter than both flanks (perpendicular to the ridge, ~1.5 x the local lane half-width), which
                   keeps broad pale fills (the Deep Core) out. Band outlines are saturated, so they never count; no location mask.
  3. occlusion   - UNKNOWN pixels, never 'absent': dot discs (detected radius), label LETTER STROKES (a lane passing through a
                   label is evidence, not occlusion), the faint grid, the route markers.
  4. per-dot rim - every dot has a ring and a shadow around its detected disc. The MEASURED rim of a dot is where lanes that
                   arrive radially at it actually start (median over its radial lane onsets, see measure_rims). Path analysis
                   starts at the measured rim, not at the detected radius.
  5. path test   - minimum-cost path between the two dots over a cost image (lane cheap, background dear, occluded moderate, third
                   dots forbidden; gridlines are NOT cheap). ACCEPT only if ALL hold: (a) >= 85% of the path's non-occluded pixels are lane;
                   (b) RADIAL ARRIVAL at both ends: the lane in the last 12 px before the measured rim points at the dot centre
                   within 25 deg (a lane that terminates at a dot arrives radially; one that passes BESIDE a dot is tangential);
                   (c) path length / chord <= 1.35; (d) the path never enters a third dot's radius; (e) >= 60% of the path
                   beyond the two rims is visible (not occluded); (f) NO KINK: the heading never changes by more than 40 deg over
                   12 px outside the rim zones (measured rim + 12 px at each end) - a bend there is a hop between lanes at a
                   crossing; inside the rim zones it is arrival geometry. Visible < 60% = AMBIGUOUS, else REJECTED.
  6. short gap   - dots whose measured rims are < 6 px apart have no testable gap. Decided in a FINAL pass, from the accepted
                   edges around them: accept A-B only if an accepted edge X-A arrives radially at A, an accepted edge B-Y leaves B
                   radially, and X-A, A-B, B-Y are collinear within 25 deg (tagged short_gap).
  7. no skipping - an accepted A-B with a third dot C within 4 px of its path is dropped when A-C and C-B are accepted.
  8. class       - lane width = FWHM of the perpendicular LUMINANCE profile on the ORIGINAL image, clean visible samples only,
                   median per edge; split at the trough of the histogram only when the distribution is bimodal.
"""
import collections
import json
import os
import shutil
import tempfile

import cv2
import numpy as np
from scipy.spatial import Delaunay, cKDTree

import colour_gate
import markers as mk_mod

SIGMAS = (1.5, 2.5, 3.5, 4.5)
STRENGTH_T = 45.0       # ridge-strength threshold (calibrated; reported in report.json)
ORI_TOL = np.deg2rad(20)
VIS_MIN = 0.60
MAX_PAIR_PX = 291.0     # 2 cells
STEP = 2.0
STROKE_DILATE = 2       # px a label's letter strokes are dilated by when masked
SHORT_GAP_PX = 6.0      # rim-to-rim (measured rims) distance under which a gap is untestable
SG_COLLINEAR_DEG = 25   # short-gap pass: X-A, A-B, B-Y must be collinear within this
LANE_FRAC_MIN = 0.85    # (a)
ARRIVAL_WINDOW_PX = 12  # (b) the lane examined before each measured rim
ARRIVAL_DEG = 25        # (b) max angle between the lane's direction and the direction to the dot centre
MAX_PATH_RATIO = 1.35   # (c) a lane may bend, it may not wander
MAX_KINK_DEG = 40       # (f) heading change over KINK_WINDOW_PX anywhere outside the rim zones rejects the edge
KINK_WINDOW_PX = 12
SMOOTH_SIGMA_PX = 4.5   # Gaussian smoothing of the path coordinates (endpoints pinned); ALL directions come from this curve
KINK_SWEEP = (40, 50, 60, 70, None)   # candidate kink thresholds; the lowest meeting the selection rule is used (None = no kink rule)
NO_CONTRAST = bool(os.environ.get('ASTRO_NO_CONTRAST'))   # diagnostics only: skip the two-sided contrast gate
GRID_CHEAP = bool(os.environ.get('ASTRO_GRID_CHEAP'))     # diagnostics only: the old cost (gridlines as cheap as any occluded pixel)
KINK_ZONE_PX = 12       # (f) rim zone = measured rim + this many px, at each end
CONTRAST_MIN = 15.0     # two-sided contrast: lane whiteness must exceed BOTH flanks by this much
CONTRAST_FLANK = 1.5    # ... flanks sampled at this x the local lane half-width (min 2 px) either side
MARKER_RADIUS_PX = 80   # route markers sit ON the lane and occlude it: look for major edges this far from the marker
RIM_RAYS = 36           # per-dot rim measurement: rays cast from the dot centre
RIM_SEARCH_PX = 14      # ... searched this far beyond the detected radius
RIM_RADIAL_DEG = 30     # ... a lane ridge counts as radial when within this of the ray
RIM_MIN_RAYS = 2        # ... a dot needs this many radial onsets to get its own rim; otherwise the median over all dots
RIM_MAX_PX = 10.0       # ... clamp


# ------------------------------------------------------------------ lane image
def whiteness(im):
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV).astype(np.float32)
    return hsv[..., 2] - hsv[..., 1]


def ridge_field(im, with_scale=False):
    """-> (strength float32, orientation float32 in [0, pi), whiteness float32[, best-scale sigma float32])."""
    g = whiteness(im)
    best = np.zeros(g.shape, np.float32)
    ori = np.zeros(g.shape, np.float32)
    scale = np.zeros(g.shape, np.float32)
    for s in SIGMAS:
        b = cv2.GaussianBlur(g, (0, 0), s)
        gxx = cv2.Sobel(b, cv2.CV_32F, 2, 0, ksize=3)
        gyy = cv2.Sobel(b, cv2.CV_32F, 0, 2, ksize=3)
        gxy = cv2.Sobel(b, cv2.CV_32F, 1, 1, ksize=3)
        d = np.sqrt(((gxx - gyy) / 2) ** 2 + gxy ** 2)
        lmin = (gxx + gyy) / 2 - d
        lmax = (gxx + gyy) / 2 + d
        st = np.where((lmin < 0) & (np.abs(lmax) < 0.5 * np.abs(lmin)), -lmin, 0) * s * s   # line-like, not blob-like
        # direction ALONG the ridge = eigenvector of the larger eigenvalue (~0 along a ridge)
        phi = 0.5 * np.arctan2(2 * gxy, gxx - gyy)
        up = st > best
        best = np.where(up, st, best)
        ori = np.where(up, np.mod(phi, np.pi), ori)
        scale = np.where(up, s, scale)
    return (best, ori, g, scale) if with_scale else (best, ori, g)


def contrast_ok(g, ori, scale, cand, occ):
    """Two-sided contrast for the candidate ridge pixels `cand` (bool map): the pixel's whiteness must exceed the whiteness at BOTH
    flanks by CONTRAST_MIN. Flanks lie perpendicular to the ridge direction at CONTRAST_FLANK x the local lane half-width (1.18 x the
    detection scale, min 2 px). A flank that falls on an occluded pixel (label stroke, dot, grid, marker) is unknown and does not
    count against the pixel. -> bool map, True where a candidate pixel passes (non-candidates are False)."""
    from scipy.ndimage import map_coordinates
    H, W = g.shape
    ys, xs = np.nonzero(cand)
    th = ori[ys, xs]
    nx, ny = -np.sin(th), np.cos(th)
    d = np.maximum(2.0, CONTRAST_FLANK * np.maximum(1.0, 1.18 * scale[ys, xs]))
    samp = lambda off: map_coordinates(g, [ys + off * ny, xs + off * nx], order=1, mode='nearest')
    centre = np.maximum.reduce([samp(-1.0), samp(0.0), samp(1.0)])          # the ridge may sit a pixel off the sampled centre
    ok = np.ones(len(ys), bool)
    for sgn in (-1.0, 1.0):
        fy = np.clip(np.round(ys + sgn * d * ny).astype(int), 0, H - 1)
        fx = np.clip(np.round(xs + sgn * d * nx).astype(int), 0, W - 1)
        ok &= (centre - samp(sgn * d) >= CONTRAST_MIN) | (occ[fy, fx] > 0)
    out = np.zeros(g.shape, bool)
    out[ys, xs] = ok
    return out


# ------------------------------------------------------------------ occlusion
def label_components(g, bbox, tol=1, pad=8):
    """Split the bright text-coloured pixels around one OCR box into connected components.
    A component lying ENTIRELY inside the box (allow `tol` px) is a letter stroke; a component that touches the box and continues
    outside it is a lane (or a neighbouring label) passing through, and is NOT a stroke. Text-coloured = whiteness >= 170 and >= 55
    above the window median. -> (stroke pixel (ys, xs) or None, [pass-through pixel (ys, xs) ...])"""
    x0, y0, x1, y1 = [int(round(v)) for v in bbox]
    X0, Y0, X1, Y1 = max(0, x0 - pad), max(0, y0 - pad), min(g.shape[1], x1 + pad), min(g.shape[0], y1 + pad)
    sub = g[Y0:Y1, X0:X1]
    if sub.size == 0:
        return None, []
    m = ((sub >= 170) & (sub >= np.median(sub) + 55)).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    bx0, by0, bx1, by1 = x0 - X0, y0 - Y0, x1 - X0, y1 - Y0
    strokes, passing = [], []
    for k in range(1, n):
        x, y, w, h, area = st[k]
        if area < 3 or x >= bx1 or y >= by1 or x + w <= bx0 or y + h <= by0:      # noise, or does not touch this box
            continue
        ys, xs = np.nonzero(lab == k)
        pix = (ys + Y0, xs + X0)
        if x >= bx0 - tol and y >= by0 - tol and x + w <= bx1 + tol and y + h <= by1 + tol:
            strokes.append(pix)
        else:
            passing.append(pix)
    if not strokes:
        return None, passing
    return (np.concatenate([p[0] for p in strokes]), np.concatenate([p[1] for p in strokes])), passing


def build_label_mask(im, boxes, dilate=STROKE_DILATE):
    """Per-stroke label occlusion for every OCR line. -> (uint8 mask 0/1, per-box counts, report dict).
    A box with no text-coloured component at all (grey grid-margin digits) is masked as the full OCR box."""
    gw = whiteness(im)
    raw = np.zeros(gw.shape, np.uint8)
    fb = np.zeros(gw.shape, np.uint8)
    per, pass_all = [], []
    for b in boxes:
        sp, passing = label_components(gw, b['bbox'])
        if sp is None:
            x0, y0, x1, y1 = [int(round(v)) for v in b['bbox']]
            fb[max(0, y0):y1 + 1, max(0, x0):x1 + 1] = 1
        else:
            raw[sp] = 1
        per.append({'strokes_masked': sp is not None, 'pass_through': len(passing)})
        pass_all.extend(passing)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * dilate + 1, 2 * dilate + 1))
    mask = np.maximum(cv2.dilate(raw, k), fb)
    # a "pass-through" component that is mostly covered by ANOTHER label's strokes is that label's letters, not a lane
    other = sum(1 for (ys, xs) in pass_all if mask[ys, xs].mean() > 0.5)
    return mask, per, {'lines': len(boxes), 'lines_with_stroke_mask': sum(p['strokes_masked'] for p in per),
                       'lines_fallback_full_box': sum(not p['strokes_masked'] for p in per),
                       'pass_through_components': len(pass_all), 'pass_through_other_label_letters': other,
                       'pass_through_lane_candidates': len(pass_all) - other, 'stroke_pixels': int(raw.sum()), 'mask_pixels': int(mask.sum())}


def occlusion_mask(shape, D, label_mask, cal, markers):
    """UNKNOWN pixels. -> (all uint8, per-source pixel counts, unknown-without-dots uint8, grid-only uint8).
    There is deliberately NO band-outline or Deep Core halo mask: the colour gate keeps outlines from counting as lane."""
    H, W = shape
    parts = {}
    unknown = np.zeros(shape, np.uint8)

    def add(name, mk, into):
        parts[name] = int(mk.sum())
        np.maximum(into, mk, out=into)
    dots = np.zeros(shape, np.uint8)
    for d in D:
        cv2.circle(dots, (int(round(d['px'])), int(round(d['py']))), int(round(d['r'])), 1, -1)
    parts['dot_discs'] = int(dots.sum())
    add('label_strokes', label_mask, unknown)
    grid = np.zeros(shape, np.uint8)
    p = cal['pitch_px']
    for i in range(-5, 40):
        x = int(round(cal['x_c_left'] + i * p))
        y = int(round(cal['y_row1_top'] + i * p))
        if 0 <= x < W:
            grid[:, max(0, x - 2):x + 3] = 1
        if 0 <= y < H:
            grid[max(0, y - 2):y + 3, :] = 1
    add('grid', grid, unknown)
    mk = np.zeros(shape, np.uint8)
    for (cx, cy) in markers:
        cv2.circle(mk, (int(cx), int(cy)), 20, 1, -1)
    add('route_markers', mk, unknown)
    return np.maximum(dots, unknown), parts, unknown, grid


# ------------------------------------------------------------------ per-dot rim
def measure_rims(strength, ori, occ, P, R):
    """Per-dot MEASURED rim: how far beyond its detected radius a dot's ring + shadow extend before a lane that ARRIVES at it
    starts. Cast RIM_RAYS rays from each dot centre; along each, the first colour-gated lane ridge (skipping unknown pixels) that is
    oriented RADIALLY (within RIM_RADIAL_DEG of the ray) marks an onset; a first ridge that is NOT radial (a lane passing beside the
    dot) ends that ray with no onset. The dot's rim offset is the median onset distance over its rays (>= RIM_MIN_RAYS of them);
    a dot with fewer takes the median over all dots. -> (rim offset px per dot, info dict)."""
    H, W = strength.shape
    th = np.linspace(0, 2 * np.pi, RIM_RAYS, endpoint=False)
    cs, sn = np.cos(th), np.sin(th)
    tol = np.deg2rad(RIM_RADIAL_DEG)
    off = np.full(len(P), np.nan)
    nr = np.zeros(len(P), int)
    for k in range(len(P)):
        cx, cy = P[k]
        found = []
        for a in range(RIM_RAYS):
            for r in np.arange(R[k] + 1, R[k] + 1 + RIM_SEARCH_PX, 1.0):
                x, y = int(round(cx + r * cs[a])), int(round(cy + r * sn[a]))
                if not (0 <= x < W and 0 <= y < H) or occ[y, x] > 0:
                    continue
                if strength[y, x] > STRENGTH_T:
                    if abs(np.angle(np.exp(2j * (ori[y, x] - th[a])))) / 2 <= tol:
                        found.append(r - R[k])
                    break
        nr[k] = len(found)
        if len(found) >= RIM_MIN_RAYS:
            off[k] = float(np.median(found))
    own = ~np.isnan(off)
    fallback = float(np.median(off[own])) if own.any() else 3.0
    off = np.clip(np.where(own, off, fallback), 0, RIM_MAX_PX)
    return off, {'dots_with_own_rim': int(own.sum()), 'dots_total': len(P), 'fallback_offset_px': round(fallback, 2),
                 'offset_px_pct_5_25_50_75_95': [round(float(v), 2) for v in np.percentile(off[own], [5, 25, 50, 75, 95])] if own.any() else None,
                 'radial_onsets_per_dot_median': float(np.median(nr))}


# ------------------------------------------------------------------ candidates
def candidates(D, mode='delaunay'):
    """mode 'delaunay' = the originally specified generator; 'all' = every pair within 2 cells (superset of Delaunay)."""
    P = np.array([[d['px'], d['py']] for d in D])
    pairs = set()
    if mode == 'delaunay':
        tri = Delaunay(P)
        for s in tri.simplices:
            for a, b in ((0, 1), (1, 2), (0, 2)):
                i, j = int(s[a]), int(s[b])
                if np.hypot(*(P[i] - P[j])) <= MAX_PAIR_PX:
                    pairs.add((min(i, j), max(i, j)))
    else:
        for i, j in cKDTree(P).query_pairs(MAX_PAIR_PX):
            pairs.add((min(i, j), max(i, j)))
    return sorted(pairs), P


def _angdiff(a, b):
    return abs(float(np.angle(np.exp(1j * (a - b)))))


# ------------------------------------------------------------------ path test
def smooth_path(path, sigma=SMOOTH_SIGMA_PX):
    """Gaussian-smooth the path coordinates along its length. Endpoints are pinned (odd reflection about each end keeps them exact).
    The raw path is still what pixels are sampled on; only DIRECTION comes from this curve."""
    from scipy.ndimage import gaussian_filter1d
    n = len(path)
    if n < 3:
        return path.astype(float)
    k = min(int(4 * sigma), n - 1)
    pad = np.pad(path.astype(float), ((k, k), (0, 0)), mode='reflect', reflect_type='odd')
    sm = gaussian_filter1d(pad, sigma, axis=0, mode='nearest')[k:k + n]
    sm[0], sm[-1] = path[0], path[-1]
    return sm


def _kink(path, ang, in_zone):
    """(f) Largest heading change over KINK_WINDOW_PX of path length, counting only windows that lie entirely OUTSIDE the rim zones
    (`in_zone` True = inside a rim zone). -> (degrees, (x, y) of the window's start) or (0.0, None)."""
    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(path, axis=0).T))]
    j2 = np.searchsorted(s, s + KINK_WINDOW_PX)
    ok = j2 < len(s)
    j2c = np.minimum(j2, len(s) - 1)
    ok &= ~in_zone & ~in_zone[j2c]
    if not ok.any():
        return 0.0, None
    d = np.abs(np.angle(np.exp(1j * (ang[j2c] - ang))))
    d = np.where(ok, d, 0.0)
    k = int(d.argmax())
    return float(np.rad2deg(d[k])), (float(path[k, 0]), float(path[k, 1]))


def _arrival(sel, px, C, lane, occp, o_best, outward_last):
    """Radial-arrival measurement for one end. `sel` = indices (into the beyond-rim pixel list) of the ARRIVAL_WINDOW_PX before the
    measured rim, ordered along the path. The lane there arrives radially when the ridge orientation of its lane pixels is within
    ARRIVAL_DEG of the direction to the dot centre C. -> dict."""
    if len(sel) < 3:
        return {'angle': None, 'radial': False, 'unknown': True, 'out': None, 'n': int(len(sel)), 'lane_px': 0, 'vis': 0.0}
    vis = 1.0 - float(occp[sel].mean())
    ls = sel[lane[sel]]
    ang = None
    if len(ls):
        rad = np.arctan2(C[1] - px[ls, 1], C[0] - px[ls, 0])
        d = np.abs(np.angle(np.exp(2j * (o_best[ls] - rad)))) / 2
        ang = float(np.rad2deg(np.median(d)))
    inner, outer = (sel[0], sel[-1]) if outward_last else (sel[-1], sel[0])
    v = px[outer] - px[inner]                                 # direction pointing AWAY from the dot along the lane
    return {'angle': ang, 'radial': bool(ang is not None and ang <= ARRIVAL_DEG),
            'unknown': bool(ang is None and vis < 0.5), 'out': float(np.arctan2(v[1], v[0])), 'n': int(len(sel)),
            'lane_px': int(len(ls)), 'vis': vis}


def test_pair(i, j, G):
    """Minimum-cost path between the measured rims of dots i and j, judged by criteria (a)-(e) in the module docstring.
    -> metrics dict (status is derived later by classify(), so the visibility floor can be varied for the report)."""
    from scipy.ndimage import gaussian_filter1d
    from skimage.graph import route_through_array
    P, R, RIM = G['P'], G['R'], G['RIM']
    A, B = P[i], P[j]
    L = float(np.hypot(*(B - A)))
    if L - RIM[i] - RIM[j] < SHORT_GAP_PX:                       # untestable gap: decided later from the accepted neighbours
        return {'short_gap': True, 'pending': True, 'ok_other': False, 'ok_wo_kink': False, 'fail': ['short_gap_pending'], 'score': 0.0, 'visible': 1.0,
                'ratio': 1.0, 'arc': False, 'kinked': False, 'kink_deg': 0.0, 'kink_xy': None, 'pts': np.array([A, B]).round().astype(np.int16),
                'mpts': np.zeros((0, 2)), 'mtang': np.zeros(0), 'mmask': np.zeros(0, bool), 'gap_px': round(L - RIM[i] - RIM[j], 2)}
    H, W = G['cost'].shape
    m = int(0.46 * L + 8)                                       # a path longer than 1.35 x chord can never be accepted
    x0, x1 = max(int(min(A[0], B[0])) - m, 0), min(int(max(A[0], B[0])) + m, W - 1)
    y0, y1 = max(int(min(A[1], B[1])) - m, 0), min(int(max(A[1], B[1])) + m, H - 1)
    roi = np.array(G['cost'][y0:y1 + 1, x0:x1 + 1], np.float32)
    mid = (A + B) / 2
    for k in G['tree'].query_ball_point(mid, L / 2 + 1.5 * m + 20):
        if k not in (i, j):                                     # third dots are walls: no skipping over planets
            cv2.circle(roi, (int(round(P[k][0])) - x0, int(round(P[k][1])) - y0), int(round(R[k])) + 1, 50.0, -1)
    idx, _ = route_through_array(roi, (int(round(A[1])) - y0, int(round(A[0])) - x0), (int(round(B[1])) - y0, int(round(B[0])) - x0),
                                 fully_connected=True, geometric=True)
    path = np.array([(c + x0, r + y0) for r, c in idx], float)
    plen = float(np.hypot(*np.diff(path, axis=0).T).sum())
    ratio = plen / L
    sm = smooth_path(path)
    ang_all = np.arctan2(np.gradient(sm[:, 1]), np.gradient(sm[:, 0]))          # smoothed tangent: lane-orientation, kink and arrival use this
    dA, dB = np.hypot(*(path - A).T), np.hypot(*(path - B).T)
    out = (dA > RIM[i]) & (dB > RIM[j])                         # beyond BOTH measured rims
    oi = np.nonzero(out)[0]
    kink_deg, kink_xy = _kink(path, ang_all, (dA <= RIM[i] + KINK_ZONE_PX) | (dB <= RIM[j] + KINK_ZONE_PX))
    rec = {'short_gap': False, 'pending': False, 'ratio': ratio, 'arc': bool(ratio > 1.03), 'kinked': bool(kink_deg > MAX_KINK_DEG),
           'kink_deg': kink_deg, 'kink_xy': kink_xy, 'pts': path.round().astype(np.int16)}
    if len(oi) < 4:
        return {**rec, 'ok_other': False, 'ok_wo_kink': False, 'fail': ['no_path_outside_dots'], 'score': 0.0, 'visible': 0.0,
                'mpts': np.zeros((0, 2)), 'mtang': np.zeros(0), 'mmask': np.zeros(0, bool), 'arr': None}
    px, ang = path[oi], ang_all[oi]
    xi = np.clip(px[:, 0].round().astype(int), 0, W - 1)
    yi = np.clip(px[:, 1].round().astype(int), 0, H - 1)
    occp = G['occ'][yi, xi] > 0
    offs = [(dx, dy) for dy in (-1, 0, 1) for dx in (-1, 0, 1)]
    s9 = np.stack([G['strength'][np.clip(yi + dy, 0, H - 1), np.clip(xi + dx, 0, W - 1)] for dx, dy in offs], 1)
    o9 = np.stack([G['ori'][np.clip(yi + dy, 0, H - 1), np.clip(xi + dx, 0, W - 1)] for dx, dy in offs], 1)
    ar = np.arange(len(oi))
    b9 = s9.argmax(1)
    o_best = o9[ar, b9]
    dif = np.abs(np.angle(np.exp(2j * (o_best - ang)))) / 2
    lane = (s9[ar, b9] > STRENGTH_T) & (dif <= ORI_TOL)                       # colour-gated ridge, oriented along the path
    vis = ~occp
    nvis = int(vis.sum())
    visible = nvis / len(oi)
    lane_frac = float((lane & vis).sum() / nvis) if nvis else 0.0
    half = len(oi) // 2
    dAo, dBo = dA[oi], dB[oi]
    sel_a = np.nonzero((dAo <= RIM[i] + ARRIVAL_WINDOW_PX) & (ar < half))[0]            # path order: A end first
    sel_b = np.nonzero((dBo <= RIM[j] + ARRIVAL_WINDOW_PX) & (ar >= half))[0]           # ... B end last
    arr_a = _arrival(sel_a, px, A, lane, occp, o_best, outward_last=True)
    arr_b = _arrival(sel_b, px, B, lane, occp, o_best, outward_last=False)
    third = False
    for k in G['tree'].query_ball_point(mid, plen / 2 + 20):
        if k not in (i, j) and np.min(np.hypot(*(path - P[k]).T)) <= R[k]:
            third = True
            break
    fail = [name for name, bad in (('lane_fraction', lane_frac < LANE_FRAC_MIN),
                                   ('arrival_a', not (arr_a['radial'] or arr_a['unknown'])),
                                   ('arrival_b', not (arr_b['radial'] or arr_b['unknown'])),
                                   ('path_ratio', ratio > MAX_PATH_RATIO), ('third_dot', third)) if bad]
    return {**rec, 'ok_other': not fail, 'ok_wo_kink': not fail, 'fail': fail, 'score': lane_frac, 'visible': visible, 'arr': {'a': arr_a, 'b': arr_b},
            'mpts': px, 'mtang': ang, 'mmask': lane & vis & (ar % 2 == 0)}


def apply_kink(R, th):
    """Set the kink verdict on every tested pair for threshold `th` degrees (None = no kink rule). Pure bookkeeping on stored metrics."""
    for r in R.values():
        if r.get('pending') or 'ok_wo_kink' not in r:
            continue
        kinked = bool(th is not None and r.get('kink_deg', 0.0) > th)
        r['kinked'] = kinked
        r['fail'] = [f for f in r['fail'] if f != 'kink'] + (['kink'] if kinked and r['ok_wo_kink'] else [])
        r['ok_other'] = bool(r['ok_wo_kink'] and not kinked)


def classify(r, vis_min=VIS_MIN, ignore_kink=False):
    if r.get('pending'):
        return 'pending'
    if r['visible'] < vis_min:
        return 'ambiguous'
    return 'accepted' if (r['ok_other'] or (ignore_kink and r.get('ok_wo_kink'))) else 'rejected'


# ------------------------------------------------------------------ short-gap final pass
def short_gap_pass(res, acc_keys, P):
    """Decide every pending short-gap pair from the ACCEPTED edges around it (never from raw pixels): A-B is accepted only if an
    accepted edge X-A arrives radially at A, an accepted edge B-Y leaves B radially, and X-A, A-B, B-Y are collinear within
    SG_COLLINEAR_DEG. -> dict {(i, j): {'accepted': bool, 'x': X, 'y': Y, 'worst_angle_deg': ..., 'candidates': n}}."""
    inc = collections.defaultdict(list)
    for (i, j) in acc_keys:
        r = res[(i, j)]
        if r.get('pending') or not r.get('arr'):
            continue
        inc[i].append((r['arr']['a'], j))
        inc[j].append((r['arr']['b'], i))
    tol = np.deg2rad(SG_COLLINEAR_DEG)
    out = {}
    for (i, j), r in res.items():
        if not r.get('pending'):
            continue
        u = np.arctan2(P[j][1] - P[i][1], P[j][0] - P[i][0])
        best = None
        n_cand = 0
        for ea, x in inc[i]:
            if x == j or not ea['radial'] or ea['out'] is None:
                continue
            if _angdiff(ea['out'], u + np.pi) > tol:                      # X-A must run in line with A-B
                continue
            for eb, y in inc[j]:
                if y == i or y == x or not eb['radial'] or eb['out'] is None:
                    continue
                if _angdiff(eb['out'], u) > tol or _angdiff(ea['out'] + np.pi, eb['out']) > tol:
                    continue
                n_cand += 1
                worst = max(_angdiff(ea['out'], u + np.pi), _angdiff(eb['out'], u), _angdiff(ea['out'] + np.pi, eb['out']))
                if best is None or worst < best[0]:
                    best = (worst, x, y)
        out[(i, j)] = {'accepted': best is not None, 'x': None if best is None else best[1], 'y': None if best is None else best[2],
                       'worst_angle_deg': None if best is None else round(float(np.rad2deg(best[0])), 1), 'candidates': n_cand}
    return out


# ------------------------------------------------------------------ parallel driver
_G = None
_ARRAYS = ('strength', 'ori', 'occ', 'occ_unknown', 'cost', 'P', 'R', 'RIM')


def _init(dirpath):
    global _G
    _G = {k: np.load(os.path.join(dirpath, k + '.npy'), mmap_mode='r') for k in _ARRAYS}
    for k in ('P', 'R', 'RIM'):
        _G[k] = np.array(_G[k])
    _G['tree'] = cKDTree(_G['P'])


def _work(chunk):
    return [((i, j), test_pair(i, j, _G)) for i, j in chunk]


def test_pairs(F, pairs, workers=None, log=print):
    """Run test_pair over `pairs`. Arrays go to the workers through memory-mapped .npy files, not pickles."""
    from concurrent.futures import ProcessPoolExecutor
    workers = workers or max(1, (os.cpu_count() or 2) - 1)
    if workers == 1:
        return {(i, j): test_pair(i, j, F) for i, j in pairs}
    d = tempfile.mkdtemp(prefix='astro_F_')
    try:
        for k in _ARRAYS:
            np.save(os.path.join(d, k + '.npy'), F[k])
        chunks = [pairs[k:k + 150] for k in range(0, len(pairs), 150)]
        res = {}
        with ProcessPoolExecutor(max_workers=workers, initializer=_init, initargs=(d,)) as ex:
            for part in ex.map(_work, chunks):
                res.update(part)
        return res
    finally:
        shutil.rmtree(d, ignore_errors=True)


def prepare(im, D, label_mask, cal, marker_xy):
    strength, ori, W_img, scale = ridge_field(im, with_scale=True)
    cg = colour_gate.derive(im, ori)
    gate = colour_gate.gate_map(im, cg)
    occ, occ_parts, unknown, grid = occlusion_mask(strength.shape, D, label_mask, cal, marker_xy)
    cand = gate & (strength > STRENGTH_T)                                     # ridge pixels that pass the colour gate
    c_ok = np.ones_like(cand) if NO_CONTRAST else contrast_ok(W_img, ori, scale, cand, occ)
    contrast_info = {'ridge_px_after_colour_gate': int(cand.sum()), 'removed_by_two_sided_contrast': int((cand & ~c_ok).sum()),
                     'enabled': not NO_CONTRAST}
    # a ridge only counts where the pixel is near-white AND brighter than both flanks
    strength_g = np.where(gate & ~(cand & ~c_ok), strength, 0).astype(np.float32)
    P = np.array([[d['px'], d['py']] for d in D])
    R = np.array([d['r'] for d in D])
    rim_off, rim_info = measure_rims(strength_g, ori, occ, P, R)
    cost = np.ones(strength.shape, np.float32)                                # background: dear
    lane = strength_g > STRENGTH_T
    lc = 0.1 + 0.4 * (1.0 - np.clip(strength_g / 90.0, 0, 1))                 # lane: cheap, cheapest on the ridge centre
    cost[lane] = lc[lane]
    cost[occ > 0] = 0.5                                                      # unknown: moderate
    if not GRID_CHEAP:
        cost[(grid > 0) & (label_mask == 0)] = 1.0     # a gridline is known geometry, not evidence: a path gains nothing by riding it
    return {'strength': strength_g, 'strength_raw': strength, 'ori': ori, 'W': W_img, 'occ': occ, 'occ_unknown': unknown,
            'occ_parts': occ_parts, 'P': P, 'cost': cost, 'colour_gate': cg, 'gate_pixels': int(gate.sum()),
            'gray': cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32),     # the ORIGINAL image's luminance, for widths
            'R': R, 'RIM': R + rim_off, 'rim_offset': rim_off, 'rim_info': rim_info, 'contrast_info': contrast_info, 'tree': cKDTree(P)}


def no_skipping(T, P, tree):
    """drop an accepted A-B when a third dot C sits within 4 px of its path and A-C and C-B are both accepted."""
    acc = {k for k, v in T.items() if v['status'] == 'accepted'}
    dropped = []
    for (i, j) in sorted(acc):
        pts = T[(i, j)]['pts'].astype(float)
        mid = pts.mean(0)
        for k in tree.query_ball_point(mid, np.hypot(*(P[i] - P[j])) / 2 + 12):
            if k in (i, j):
                continue
            if np.min(np.hypot(*(pts - P[k]).T)) <= 4:
                if (min(i, k), max(i, k)) in acc and (min(k, j), max(k, j)) in acc:
                    dropped.append(((i, j), k))
                    break
    return dropped


# ------------------------------------------------------------------ width
WIDTH_WIN = 10          # px each side of the lane: the profile window; it must contain no occluded pixel to count as clean
WIDTH_MIN_CLEAN = 3     # clean samples an edge needs before its median width is trusted


def lane_width(pts, tang, mask, gray, occ):
    """Lane width = FWHM of the perpendicular intensity profile on the ORIGINAL image (grayscale luminance, no blur), measured
    only at clean visible samples (on the lane, and the whole +-WIDTH_WIN window free of occluded pixels), median per edge.
    -> (width px or None, number of clean samples used)."""
    from scipy.ndimage import map_coordinates
    t = np.arange(-WIDTH_WIN, WIDTH_WIN + 0.01, 0.5)
    ws = []
    for k in np.nonzero(mask)[0]:
        n = np.array([-np.sin(tang[k]), np.cos(tang[k])])
        xs = pts[k, 0] + t * n[0]
        ys = pts[k, 1] + t * n[1]
        if map_coordinates(occ.astype(np.float32), [ys, xs], order=0, mode='nearest').any():
            continue
        prof = map_coordinates(gray, [ys, xs], order=1, mode='nearest')
        win = np.nonzero(np.abs(t) <= 3)[0]
        pk = int(win[np.argmax(prof[win])])
        base = float(np.median(prof[np.abs(t) >= 7]))
        peak = float(prof[pk])
        if peak - base < 15:
            continue
        half = base + (peak - base) / 2
        l = pk
        while l > 0 and prof[l] > half:
            l -= 1
        r = pk
        while r < len(prof) - 1 and prof[r] > half:
            r += 1
        if l == 0 or r == len(prof) - 1:
            continue                                   # profile never fell to half height inside the window: not a clean lane
        xl = t[l] + (half - prof[l]) / (prof[l + 1] - prof[l]) * 0.5       # sub-pixel half-level crossings
        xr = t[r - 1] + (prof[r - 1] - half) / (prof[r - 1] - prof[r]) * 0.5
        ws.append(xr - xl)
    if len(ws) < WIDTH_MIN_CLEAN:
        return None, len(ws)
    return float(np.median(ws)), len(ws)


def split_widths(ws):
    """Otsu split of the width distribution plus a bimodality check. Returns (threshold or None, info)."""
    ws = np.array([w for w in ws if w is not None], float)
    if len(ws) < 10:
        return None, {'n': int(len(ws)), 'bimodal': False, 'reason': 'too few edges'}
    hist, edges_ = np.histogram(ws, bins=np.arange(0, 21, 1.0))
    best, bt = -1, None
    for t in np.arange(2, 15, 0.5):
        lo, hi = ws[ws < t], ws[ws >= t]
        if len(lo) < 3 or len(hi) < 3:
            continue
        sb = len(lo) * len(hi) * (lo.mean() - hi.mean()) ** 2 / len(ws) ** 2
        if sb > best:
            best, bt = sb, t
    ratio = best / ws.var() if ws.var() else 0
    lo_peak = hist[:int(bt)].max() if bt else 0
    hi_peak = hist[int(bt):].max() if bt else 0
    valley = hist[max(0, int(bt) - 1):int(bt) + 1].min() if bt else 0
    bimodal = bool(ratio >= 0.6 and valley <= 0.6 * min(lo_peak, hi_peak))
    return (float(bt) if bimodal else None), {'n': int(len(ws)), 'otsu_threshold': bt, 'between_class_ratio': round(float(ratio), 3),
                                              'valley': int(valley), 'peaks': [int(lo_peak), int(hi_peak)], 'bimodal': bimodal,
                                              'histogram_1px': hist.tolist(), 'median': float(np.median(ws)),
                                              'histogram_0p5px': {'bin_starts': np.arange(0, 20, 0.5).tolist(), 'counts': np.histogram(ws, bins=np.arange(0, 20.5, 0.5))[0].tolist()},
                                              'percentiles_5_25_50_75_95': [round(float(v), 2) for v in np.percentile(ws, [5, 25, 50, 75, 95])]}


def components(nodes, edge_pairs):
    par = {n: n for n in nodes}

    def f(a):
        while par[a] != a:
            par[a] = par[par[a]]
            a = par[a]
        return a
    for a, b in edge_pairs:
        par[f(a)] = f(b)
    c = collections.Counter(f(n) for n in nodes)
    return c


def chain_from_marker(mxy, E, radius=MARKER_RADIUS_PX):
    """Trace a major route from a numbered marker along major-class edges only. E = list of dicts with a,b,pts(np array),class."""
    major = [e for e in E if e['class'] == 'major']
    if not major:
        return None, 'no major-class edges'
    best, bd = None, 1e9
    for e in major:
        d = float(np.min(np.hypot(*(e['pts'] - np.array(mxy)).T)))
        if d < bd:
            best, bd = e, d
    if bd > radius:
        return None, f'no major edge within {radius} px of the marker (nearest {bd:.0f} px)'
    adj = collections.defaultdict(list)
    for e in major:
        adj[e['a']].append(e)
        adj[e['b']].append(e)

    def heading(e, at):
        p = e['pts']
        if at == e['b']:
            v = p[-1] - p[max(0, len(p) - 6)]
        else:
            v = p[0] - p[min(len(p) - 1, 5)]
        return np.arctan2(v[1], v[0])

    def extend(start_node, came_edge):
        seq, cur, last = [], start_node, came_edge
        seen = {id(last)}
        while True:
            hin = heading(last, cur)
            opts = [e for e in adj[cur] if id(e) not in seen]
            if not opts:
                return seq

            def turn(e):
                p = e['pts'] if e['a'] == cur else e['pts'][::-1]
                v = p[min(len(p) - 1, 5)] - p[0]
                return abs(np.angle(np.exp(1j * (np.arctan2(v[1], v[0]) - hin))))
            e = min(opts, key=turn)
            if turn(e) > np.deg2rad(75):
                return seq
            seen.add(id(e))
            nxt = e['b'] if e['a'] == cur else e['a']
            seq.append(nxt)
            cur, last = nxt, e
    fwd = extend(best['b'], best)
    bwd = extend(best['a'], best)
    return list(reversed(bwd)) + [best['a'], best['b']] + fwd, None


def run_edge_stage(im, tf, D, asg, systems, out, label, lines, labels, cal, out_dir, wk_path, log=print):
    """Everything after dot detection: persist OCR boxes + label-stroke mask, test edges, classify, chain majors, gates, outputs."""
    import assign as _assign
    # ---- node ids: system id for named dots, waypoint id for unnamed ones
    dot_sys = {a['dot']: i for i, a in asg.items()}
    cnt = collections.Counter()
    ids = []
    for j, d in enumerate(D):
        if j in dot_sys:
            ids.append(out[dot_sys[j]]['id'])
        else:
            g = (_assign.cell_of(tf, d['px'], d['py']) or 'x-0').lower()
            cnt[g] += 1
            ids.append(f'wp-{g}-{cnt[g]}')
    assert len(set(ids)) == len(ids)
    # ---- persist OCR boxes + the per-stroke label mask (the occlusion mask is rebuilt FROM THESE FILES: inspectable / reproducible)
    lm = {(l['text'], round(l['x0']), round(l['y0'])): l['match'] for l in labels}
    boxes = []
    for l in lines:
        m = lm.get((l['text'], round(l['x0']), round(l['y0'])))
        boxes.append({'text': l['text'], 'bbox': [round(l['x0'], 1), round(l['y0'], 1), round(l['x1'], 1), round(l['y1'], 1)],
                      'confidence': round(l['score'], 4), 'system_id': out[m]['id'] if isinstance(m, int) else None,
                      'nebula_label': m == 'NEB'})
    lmask, per, lrep = build_label_mask(im, boxes)
    for b, p in zip(boxes, per):
        b.update(p)
    path = os.path.join(out_dir, 'ocr_boxes.json')
    json.dump(boxes, open(path, 'w'), indent=0)
    cv2.imwrite(os.path.join(out_dir, 'label_strokes.png'), lmask * 255)
    label_mask = (cv2.imread(os.path.join(out_dir, 'label_strokes.png'), cv2.IMREAD_GRAYSCALE) > 0).astype(np.uint8)
    assert np.array_equal(label_mask, lmask)
    # ---- markers
    mk = mk_mod.find_markers(im)
    marker_info = {}
    for seed, (cx, cy) in mk.items():
        dg = mk_mod.read_digit(im, cx, cy)
        assert dg in mk_mod.ROUTE_NAMES, f'marker at {seed} read as {dg}'
        marker_info[dg] = (cx, cy)
    F = prepare(im, D, label_mask, cal, list(marker_info.values()))
    cg = F['colour_gate']
    colour_gate.write_json(cg, os.path.join(out_dir, 'colour_gate.json'))
    os.makedirs(os.path.join(out_dir, 'evidence'), exist_ok=True)
    colour_gate.render_samples(im, cg, os.path.join(out_dir, 'evidence', 'colour_gate_samples.png'))
    name2j = {}
    for j, d in enumerate(D):
        if j in dot_sys:
            name2j.setdefault(out[dot_sys[j]]['name'], j)

    # ---- test every candidate pair ONCE (the Delaunay variant is a subset of 'all')
    pairs_all, _ = candidates(D, 'all')
    pairs_del = set(candidates(D, 'delaunay')[0])
    R_ = test_pairs(F, pairs_all, log=log)

    # ---- kink threshold chosen BY RULE: lowest of KINK_SWEEP with Gate B largest >= 70% AND zero Gate-A must-not pairs accepted
    MUST_NOT = [('Kessel', 'Formos')] + [(x, y) for x in ('Vardos', 'Aargau', 'Fedalle', 'Trellen', 'Rendili')
                                         for y in ('Coruscant', "Bar'leth", 'Hodi', 'Corellia')]
    MUST_BE = [("Coruscant", "Bar'leth"), ("Bar'leth", 'Hodi'), ('Hodi', 'Corellia')]
    kessel_j = name2j.get('Kessel')
    sweep_rows = []
    for th in KINK_SWEEP:
        apply_kink(R_, th)
        Tf = {k: {**v, 'status': classify(v, VIS_MIN)} for k, v in R_.items()}
        drop = {k for k, _ in no_skipping(Tf, F['P'], F['tree'])}
        acc = [k for k, v in Tf.items() if v['status'] == 'accepted' and k not in drop]
        sgk = short_gap_pass(Tf, acc, F['P'])
        acc = set(acc) | {k for k, v in sgk.items() if v['accepted']}
        nodes_c = {n for (i, j) in acc for n in (ids[i], ids[j])}
        sizes = sorted(components(nodes_c, [(ids[i], ids[j]) for i, j in acc]).values(), reverse=True)
        key = lambda a, b: (min(name2j[a], name2j[b]), max(name2j[a], name2j[b]))
        bad = [f'{a} - {b}' for a, b in MUST_NOT if a in name2j and b in name2j and key(a, b) in acc]
        if kessel_j is not None and any(kessel_j in k for k in acc):
            bad.append('Kessel has an edge')
        frac = sizes[0] / len(nodes_c) if nodes_c else 0.0
        sweep_rows.append({'threshold_deg': th, 'accepted': len(acc), 'connected_nodes': len(nodes_c), 'components': len(sizes),
                           'largest': sizes[0] if sizes else 0, 'largest_fraction': round(frac, 3),
                           'must_not_accepted': bad, 'must_be_accepted': [f'{a} - {b}' for a, b in MUST_BE if key(a, b) in acc],
                           'meets_rule': bool(frac >= 0.70 and not bad)})
        log(f"kink sweep {th}: accepted {len(acc)}, largest {frac:.3f}, must-not accepted {bad}")
    chosen = next((r for r in sweep_rows if r['meets_rule']), None)
    KINK_SELECTION = {'rule': 'lowest threshold with Gate B largest component >= 70% AND zero Gate-A must-not accepted', 'sweep': sweep_rows,
                      'selected_deg': None if chosen is None else chosen['threshold_deg'], 'any_selected': chosen is not None,
                      'smooth_sigma_px': SMOOTH_SIGMA_PX}
    if chosen is None:
        rp = os.path.join(out_dir, 'report.json')
        rep_old = json.load(open(rp)) if os.path.exists(rp) else {}
        rep_old['kink_selection'] = KINK_SELECTION
        json.dump(rep_old, open(rp, 'w'), indent=1)
        log('NO kink threshold meets the selection rule: STOP')
        return {'stopped': True, 'kink_selection': KINK_SELECTION}
    SEL_TH = chosen['threshold_deg']
    apply_kink(R_, SEL_TH)
    for r in R_.values():
        r['status'] = classify(r, VIS_MIN)

    def evaluate(pairset):
        res = {k: R_[k] for k in pairs_all if k in pairset}
        skipped = no_skipping(res, F['P'], F['tree'])
        drop = {k for k, _ in skipped}
        acc = [k for k, v in res.items() if v['status'] == 'accepted' and k not in drop]
        # final pass: untestable short gaps, decided from the accepted edges around them
        sg = short_gap_pass(res, acc, F['P'])
        for k, v in sg.items():
            res[k] = {**res[k], 'status': 'accepted' if v['accepted'] else 'rejected', 'sg': v,
                      'fail': [] if v['accepted'] else ['no_collinear_radial_neighbours']}
            if v['accepted']:
                acc.append(k)
        statuses = collections.Counter(v['status'] for v in res.values())
        E = []
        for (i, j) in acc:
            r = res[(i, j)]
            w, wn = lane_width(r['mpts'], r['mtang'], r['mmask'], F['gray'], F['occ'])
            E.append({'i': i, 'j': j, 'a': ids[i], 'b': ids[j], 'score': r['score'], 'visible': r['visible'], 'arc': r['arc'],
                      'width': w, 'width_n': wn, 'short_gap': bool(r.get('short_gap')), 'kinked': bool(r['kinked']), 'pts': r['pts'].astype(float)})
        thr, winfo = split_widths([e['width'] for e in E])
        for e in E:
            e['class'] = None if thr is None else ('major' if (e['width'] or 0) >= thr else 'minor')
        return {'T': res, 'statuses': statuses, 'skipped': skipped, 'E': E, 'thr': thr, 'winfo': winfo, 'sg': sg}

    def end_text(e):
        if not e:
            return None
        return {'angle_deg': None if e['angle'] is None else round(e['angle'], 1), 'radial': e['radial'], 'unknown_occluded': e['unknown'],
                'window_px': e['n'], 'lane_px': e['lane_px']}

    def pair_state(T, acc, a, b, vis_min=VIS_MIN):
        """-> (text, detail dict) for the pair a-b under metrics T and accepted-edge set acc."""
        if a not in name2j or b not in name2j:
            return 'node missing', {}
        i, j = sorted((name2j[a], name2j[b]))
        r = T.get((i, j))
        if r is None:
            return ('ACCEPTED' if (i, j) in acc else 'not a candidate'), {}
        st = r['status'] if r.get('short_gap') else classify(r, vis_min)
        det = {'status': st, 'lane_fraction': round(r['score'], 3), 'visible': round(r['visible'], 3), 'path_ratio': round(r['ratio'], 3),
               'failed': r['fail'], 'short_gap': bool(r.get('short_gap')), 'kinked': bool(r['kinked']), 'kink_deg': round(float(r.get('kink_deg', 0.0)), 1),
               'rim_offset_px': [round(float(F['rim_offset'][i]), 2), round(float(F['rim_offset'][j]), 2)]}
        if r.get('arr'):
            det['arrival'] = {name_of(i): end_text(r['arr']['a']), name_of(j): end_text(r['arr']['b'])}
        if r.get('sg') is not None:
            det['short_gap_evidence'] = {'accepted': r['sg']['accepted'], 'x': None if r['sg']['x'] is None else ids[r['sg']['x']],
                                         'y': None if r['sg']['y'] is None else ids[r['sg']['y']], 'worst_angle_deg': r['sg']['worst_angle_deg'],
                                         'candidate_chains': r['sg']['candidates']}
        if (i, j) in acc:
            return 'ACCEPTED', det
        return f"{st} (lane {r['score']:.2f}, visible {r['visible']:.2f}, failed {r['fail'] or '-'})", det

    def name_of(j):
        return out[dot_sys[j]]['name'] if j in dot_sys else ids[j]

    GATE_MUST = [("Coruscant", "Bar'leth"), ("Bar'leth", 'Hodi'), ('Hodi', 'Corellia')]
    # Kessel-Formos is a MUST-NOT: the Sleheyron lane runs beneath Kessel and ends at Formos; Kessel has no lane.
    GATE_MUST_NOT_EXTRA = [('Kessel', 'Formos')]
    GATE_BESIDE = ['Vardos', 'Aargau', 'Fedalle', 'Trellen', 'Rendili']
    GATE_LANE = ['Coruscant', "Bar'leth", 'Hodi', 'Corellia']
    NAMED_SIX = GATE_MUST + [('Coruscant', 'Aargau'), ('Coruscant', 'Trellen'), ('Kessel', 'Formos')]

    def gate_a(ev):
        T = ev['T']
        acc = {(e['i'], e['j']): e for e in ev['E']}
        res = {'must_be_edges': {f'{a} - {b}': pair_state(T, acc, a, b)[0] for a, b in GATE_MUST}, 'must_not_be_edges': {}, 'neighbours': {},
               'named_pair_detail': {f'{a} - {b}': pair_state(T, acc, a, b)[1] for a, b in NAMED_SIX}}
        for a, b in GATE_MUST_NOT_EXTRA:
            res['must_not_be_edges'][f'{a} - {b}'] = pair_state(T, acc, a, b)[0]
        for x in GATE_BESIDE:
            for y in GATE_LANE:
                if x in name2j and y in name2j:
                    res['must_not_be_edges'][f'{x} - {y}'] = pair_state(T, acc, x, y)[0]
        for x in ('Fedalle', 'Trellen', 'Vardos', 'Aargau', 'Rendili', 'Kessel', 'Formos'):
            if x in name2j:
                j = name2j[x]
                res['neighbours'][x] = [ids[e['j'] if e['i'] == j else e['i']] for e in ev['E'] if j in (e['i'], e['j'])]
        res['kessel_unconnected'] = not res['neighbours'].get('Kessel')
        res['passed'] = bool(all(v == 'ACCEPTED' for v in res['must_be_edges'].values()) and
                             not any(v == 'ACCEPTED' for v in res['must_not_be_edges'].values()) and res['kessel_unconnected'])
        return res

    results = {}
    for mode, pset in (('delaunay', pairs_del), ('all', set(pairs_all))):
        ev = evaluate(pset)
        nodes_conn = {n for e in ev['E'] for n in (e['a'], e['b'])}
        comp = components(nodes_conn, [(e['a'], e['b']) for e in ev['E']])
        sizes = sorted(comp.values(), reverse=True)
        ev['gateA'] = gate_a(ev)
        ev['gateB'] = {'connected_nodes': len(nodes_conn), 'components': len(sizes), 'largest': sizes[0] if sizes else 0,
                       'largest_fraction': round(sizes[0] / len(nodes_conn), 3) if nodes_conn else 0,
                       'passed': bool(nodes_conn and sizes[0] / len(nodes_conn) >= 0.70), 'component_sizes_top10': sizes[:10],
                       'nodes_with_zero_edges': len(D) - len(nodes_conn)}
        results[mode] = ev
    prim = results['all']            # every pair <= 2 cells (superset of Delaunay)
    var = results['delaunay']        # the originally specified generator, kept as a reported variant

    # ---- visibility-floor sensitivity (REPORT ONLY: the decision stays at VIS_MIN). Short gaps are decided only at VIS_MIN.
    sensitivity = {}
    for fl in (0.40, 0.50, 0.60):
        for mode, pset in (('all', set(pairs_all)), ('delaunay', pairs_del)):
            T = {k: R_[k] for k in pairs_all if k in pset}
            Tf = {k: {**v, 'status': classify(v, fl)} for k, v in T.items()}
            st = collections.Counter(v['status'] for v in Tf.values())
            drop = {k for k, _ in no_skipping(Tf, F['P'], F['tree'])}
            acc = [k for k, v in Tf.items() if v['status'] == 'accepted' and k not in drop]
            sgf = short_gap_pass(Tf, acc, F['P'])
            acc += [k for k, v in sgf.items() if v['accepted']]
            acc = set(acc)
            nodes_c = {n for (i, j) in acc for n in (ids[i], ids[j])}
            sizes = sorted(components(nodes_c, [(ids[i], ids[j]) for i, j in acc]).values(), reverse=True)
            sensitivity.setdefault(mode, {})[f'{fl:.2f}'] = {
                'candidates': len(T), 'accepted_before_no_skipping': st['accepted'], 'accepted_final': len(acc),
                'rejected': st['rejected'], 'ambiguous': st['ambiguous'], 'connected_nodes': len(nodes_c),
                'components': len(sizes), 'largest_component': sizes[0] if sizes else 0,
                'gateA_pairs': {f'{a} - {b}': ('ACCEPTED' if (min(name2j[a], name2j[b]), max(name2j[a], name2j[b])) in acc else 'no')
                                for a, b in GATE_MUST + GATE_MUST_NOT_EXTRA + [('Coruscant', 'Aargau'), ('Coruscant', 'Trellen')]
                                if a in name2j and b in name2j}}

    # ---- kink rule: effect on the accepted set and on Gate B, plus 10 random examples of what it rejects
    def accepted_keys(Tmap, ignore_kink):
        Tf = {k: {**v, 'status': classify(v, VIS_MIN, ignore_kink)} for k, v in Tmap.items()}
        drop = {k for k, _ in no_skipping(Tf, F['P'], F['tree'])}
        acc = [k for k, v in Tf.items() if v['status'] == 'accepted' and k not in drop]
        sgk = short_gap_pass(Tf, acc, F['P'])
        return set(acc) | {k for k, v in sgk.items() if v['accepted']}

    def gate_b_of(acc):
        nodes_c = {n for (i, j) in acc for n in (ids[i], ids[j])}
        sizes = sorted(components(nodes_c, [(ids[i], ids[j]) for i, j in acc]).values(), reverse=True)
        return {'accepted': len(acc), 'connected_nodes': len(nodes_c), 'components': len(sizes), 'largest': sizes[0] if sizes else 0,
                'largest_fraction': round(sizes[0] / len(nodes_c), 3) if nodes_c else 0}
    Tall = {k: R_[k] for k in pairs_all}
    kb, ka = gate_b_of(accepted_keys(Tall, True)), gate_b_of(accepted_keys(Tall, False))
    kink_only = sorted(k for k, v in Tall.items() if not v.get('pending') and v['visible'] >= VIS_MIN and v.get('ok_wo_kink') and not v['ok_other'])
    sample_path = os.environ.get('ASTRO_KINK_SAMPLE')
    id2j = {nid: j for j, nid in enumerate(ids)}
    if sample_path and os.path.exists(sample_path):          # re-score the SAME pairs as the previous round
        prev = json.load(open(sample_path))
        picks = [tuple(sorted((id2j[e['a']], id2j[e['b']]))) for e in prev]
        prev_kink = {tuple(sorted((id2j[e['a']], id2j[e['b']]))): e['kink_deg'] for e in prev}
    else:
        import random
        picks = random.Random(20261012).sample(kink_only, min(10, len(kink_only)))
        prev_kink = {}
    tiles, examples = [], []
    for n, (i, j) in enumerate(picks, 1):
        r = Tall[(i, j)]
        pts = r['pts'].astype(float)
        mrg = 30
        x0, y0 = int(max(0, pts[:, 0].min() - mrg)), int(max(0, pts[:, 1].min() - mrg))
        x1, y1 = int(min(4000, pts[:, 0].max() + mrg)), int(min(4000, pts[:, 1].max() + mrg))
        c = cv2.resize(im[y0:y1, x0:x1], None, fx=4, fy=4, interpolation=cv2.INTER_CUBIC)
        cv2.polylines(c, [((pts - [x0, y0]) * 4).astype(np.int32)], False, (0, 0, 255), 2)
        if r['kink_xy'] is not None:
            kx, ky = r['kink_xy']
            cv2.circle(c, (int((kx - x0) * 4), int((ky - y0) * 4)), 26, (0, 255, 255), 2)
        for k in (i, j):
            cv2.circle(c, (int((F['P'][k][0] - x0) * 4), int((F['P'][k][1] - y0) * 4)), int(F['RIM'][k] * 4), (255, 255, 255), 1)
        verdict = r['status'] if r['status'] != 'rejected' else 'rejected: ' + ','.join(r['fail'])
        txt = f"{n}. {ids[i]} - {ids[j]}  kink {r['kink_deg']:.0f}deg  lane {r['score']:.2f}  {verdict}"
        cv2.putText(c, txt, (6, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 3)
        cv2.putText(c, txt, (6, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)
        os.makedirs(os.path.join(out_dir, 'evidence'), exist_ok=True)
        cv2.imwrite(os.path.join(out_dir, 'evidence', f'kink_rejected_{n:02d}.png'), c)
        sc = 520.0 / max(c.shape[:2])
        t = cv2.resize(c, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
        pad = np.zeros((520, 520, 3), np.uint8)
        pad[:t.shape[0], :t.shape[1]] = t
        tiles.append(pad)
        examples.append({'a': ids[i], 'b': ids[j], 'kink_deg': round(r['kink_deg'], 1), 'prev_kink_deg': prev_kink.get((i, j)),
                         'lane_fraction': round(r['score'], 3), 'path_ratio': round(r['ratio'], 3), 'visible': round(r['visible'], 3),
                         'status_at_selected_threshold': r['status'], 'failed': r['fail']})
    if tiles:
        while len(tiles) % 2:
            tiles.append(np.zeros_like(tiles[0]))
        cv2.imwrite(os.path.join(out_dir, 'evidence', 'kink_rejected_sheet.png'),
                    np.vstack([np.hstack(tiles[k:k + 2]) for k in range(0, len(tiles), 2)]))
    kink_report = {'rule': f'smoothed-path heading change > {SEL_TH} deg over {KINK_WINDOW_PX} px outside the rim zones (measured rim + {KINK_ZONE_PX} px)',
                   'selection': KINK_SELECTION,
                   'pairs_rejected_only_by_this_rule': len(kink_only), 'accepted_and_gateB_before': kb, 'accepted_and_gateB_after': ka,
                   'stop_rule_gateB_below_70pct': bool(ka['largest_fraction'] < 0.70), 'random_examples': examples}

    # ---- why pairs fail (rejected = visible enough but failed a criterion)
    why = collections.Counter(f for r in prim['T'].values() if r['status'] == 'rejected' for f in r['fail'])
    why_first = collections.Counter(r['fail'][0] for r in prim['T'].values() if r['status'] == 'rejected' and r['fail'])

    # ---- short-gap pairs (measured rims < SHORT_GAP_PX): every one, with its outcome and evidence
    accset = {(e['i'], e['j']) for e in prim['E']}
    short_gap = []
    for (i, j), r in sorted(prim['T'].items()):
        if r.get('short_gap'):
            v = r['sg']
            short_gap.append({'a': ids[i], 'b': ids[j], 'accepted': (i, j) in accset, 'gap_px': r.get('gap_px'),
                              'x': None if v['x'] is None else ids[v['x']], 'y': None if v['y'] is None else ids[v['y']],
                              'worst_angle_deg': v['worst_angle_deg'], 'candidate_chains': v['candidates']})

    # ---- radial-arrival summary over every tested pair
    arr_stats = collections.Counter()
    for r in prim['T'].values():
        if r.get('arr'):
            for e in (r['arr']['a'], r['arr']['b']):
                arr_stats['ends'] += 1
                arr_stats['radial'] += bool(e['radial'])
                arr_stats['unknown_occluded'] += bool(e['unknown'])
                arr_stats['no_lane_px_visible'] += bool(e['angle'] is None and not e['unknown'])

    # ---- lanes: five majors traced from their markers along major-class edges (primary)
    E = prim['E']
    id2name = {out[i]['id']: out[i]['name'] for i in range(len(out))}
    lanes_out, gateC = [], {}
    wk = json.load(open(wk_path))['routes']
    plotted = {n for n in name2j}
    for dg in sorted(mk_mod.ROUTE_NAMES):
        name = mk_mod.ROUTE_NAMES[dg]
        seq, why_c = chain_from_marker(marker_info[dg], E) if prim['thr'] is not None else (None, 'width distribution is not bimodal: no class split, so no major-class chain')
        stops = [] if seq is None else [{'id': n, 'named': n in id2name, **({'name': id2name[n]} if n in id2name else {})} for n in seq]
        lanes_out.append({'route': dg, 'name': name, 'major': True, 'marker_px': [round(v, 1) for v in marker_info[dg]],
                          'stop_count': len(stops), 'named_stops': sum(s['named'] for s in stops), 'waypoints': sum(not s['named'] for s in stops),
                          'stops': stops, 'note': why_c})
        chain_names = [s['name'] for s in stops if s['named']]
        wk_names = wk[name]['stops']
        wk_plotted = [n for n in wk_names if n in plotted]
        gateC[name] = {'chain_named_stops': chain_names, 'wookieepedia_stops': wk_names, 'wookieepedia_not_in_dk': wk[name].get('not_in_dk', []),
                       'on_both': [n for n in chain_names if n in wk_names],
                       'on_map_chain_not_in_wookieepedia': [n for n in chain_names if n not in wk_names],
                       'wookieepedia_plotted_but_not_on_chain': [n for n in wk_plotted if n not in chain_names],
                       'wookieepedia_not_plotted_as_dot': [n for n in wk_names if n not in plotted],
                       'chain_note': why_c}

    # ---- widths / marker cross-check (marker radius = MARKER_RADIUS_PX)
    marker_check = {}
    for dg, mxy in marker_info.items():
        near = [(float(np.min(np.hypot(*(e['pts'] - np.array(mxy)).T))), e) for e in E]
        near = sorted([t for t in near if t[0] <= MARKER_RADIUS_PX], key=lambda t: t[0])
        marker_check[mk_mod.ROUTE_NAMES[dg]] = [{'edge': f"{e['a']} - {e['b']}", 'dist_px': round(d, 1), 'width': e['width'], 'class': e['class']} for d, e in near[:5]]

    # ---- outputs
    def edge_rec(e):
        P = e['pts']
        sel = list(range(0, len(P), 4))
        if sel[-1] != len(P) - 1:
            sel.append(len(P) - 1)
        return {'a': e['a'], 'b': e['b'], 'class': e['class'], 'score': round(e['score'], 3), 'visible_fraction': round(e['visible'], 3),
                'median_width_px': None if e['width'] is None else round(e['width'], 2), 'width_clean_samples': e['width_n'],
                'arc': bool(e['arc']), 'short_gap': e['short_gap'], 'kinked': e['kinked'],
                'path_xy': [[round(v, 1) for v in tf.to_galactic(float(x), float(y))] for x, y in P[sel]]}
    json.dump([edge_rec(e) for e in E], open(os.path.join(out_dir, 'edges.json'), 'w'))
    os.makedirs(os.path.join(out_dir, 'variants'), exist_ok=True)
    json.dump([edge_rec(e) for e in var['E']], open(os.path.join(out_dir, 'variants', 'edges_delaunay_variant.json'), 'w'))
    json.dump(lanes_out, open(os.path.join(out_dir, 'lanes.json'), 'w'), indent=1)
    on = {n for e in E for n in (e['a'], e['b'])}
    sys_out = []
    for r in out:
        rr = dict(r)
        rr['on_lane'] = r['id'] in on
        sys_out.append(rr)
    json.dump(sys_out, open(os.path.join(out_dir, 'systems.json'), 'w'), indent=0)

    # ---- evidence
    ev_dir = os.path.join(out_dir, 'evidence')
    for old in ('gateA_core_stretch.png', 'gateA_kessel_formos.png'):
        if os.path.exists(os.path.join(ev_dir, old)):
            os.remove(os.path.join(ev_dir, old))
    pal = {'major': (0, 255, 255), 'minor': (0, 255, 0), None: (255, 200, 0)}
    full = im.copy()
    for e in E:
        cv2.polylines(full, [e['pts'].astype(np.int32)], False, pal[e['class']], 4)
    for dg, (cx, cy) in marker_info.items():
        cv2.circle(full, (int(cx), int(cy)), 22, (0, 0, 255), 4)
    cv2.imwrite(os.path.join(ev_dir, 'edges_overlay.png'), cv2.resize(full, (1600, 1600), interpolation=cv2.INTER_AREA))

    def pair_crop(a, b, scale=4):
        """native-resolution crop around the pair with the tested PATH drawn (green accepted / red rejected / orange ambiguous);
        white circles = detected radius, yellow circles = measured rim."""
        if a not in name2j or b not in name2j:
            return
        i, j = sorted((name2j[a], name2j[b]))
        r = prim['T'].get((i, j))
        if r is None:
            return
        pts = r['pts'].astype(float)
        mrg = 40
        x0, y0 = int(max(0, min(pts[:, 0].min(), F['P'][i][0], F['P'][j][0]) - mrg)), int(max(0, min(pts[:, 1].min(), F['P'][i][1], F['P'][j][1]) - mrg))
        x1, y1 = int(min(4000, max(pts[:, 0].max(), F['P'][i][0], F['P'][j][0]) + mrg)), int(min(4000, max(pts[:, 1].max(), F['P'][i][1], F['P'][j][1]) + mrg))
        c = cv2.resize(im[y0:y1, x0:x1], None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
        occ = cv2.resize(F['occ_unknown'][y0:y1, x0:x1], None, fx=scale, fy=scale, interpolation=cv2.INTER_NEAREST) > 0
        c[occ] = (0.75 * c[occ] + 0.25 * np.array((255, 128, 0))).astype(np.uint8)       # label strokes / grid / markers tinted blue
        st = r['status']
        col = (0, 255, 0) if (i, j) in accset else ((0, 0, 255) if st == 'rejected' else (0, 165, 255))
        cv2.polylines(c, [((pts - [x0, y0]) * scale).astype(np.int32)], False, col, 2)
        for k in (i, j):
            ctr = (int((F['P'][k][0] - x0) * scale), int((F['P'][k][1] - y0) * scale))
            cv2.circle(c, ctr, int(F['R'][k] * scale), (255, 255, 255), 1)
            cv2.circle(c, ctr, int(F['RIM'][k] * scale), (0, 255, 255), 1)
        arrs = ''
        if r.get('arr'):
            f_ = lambda e: 'n/a' if e['angle'] is None else f"{e['angle']:.0f}deg"
            arrs = f" arrive {f_(r['arr']['a'])}/{f_(r['arr']['b'])}"
        txt = f"{a} - {b}: {'ACCEPTED' if (i, j) in accset else st} lane {r['score']:.2f} vis {r['visible']:.2f}{arrs} {r['fail'] or ''}"
        cv2.putText(c, txt, (6, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 3)
        cv2.putText(c, txt, (6, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        cv2.imwrite(os.path.join(ev_dir, 'gateA_' + (a + '_' + b).replace("'", '').replace(' ', '') + '.png'), c)
    for a, b in NAMED_SIX:
        pair_crop(a, b)

    summary = {}
    for mode, ev in results.items():
        summary[mode] = {'candidates': len(ev['T']), 'accepted_before_no_skipping': ev['statuses']['accepted'],
                         'rejected': ev['statuses']['rejected'], 'ambiguous': ev['statuses']['ambiguous'],
                         'dropped_by_no_skipping': len(ev['skipped']), 'accepted_final': len(ev['E']),
                         'short_gap_accepted': sum(e['short_gap'] for e in ev['E']),
                         'accepted_kinked_diagnostic': sum(e['kinked'] for e in ev['E']),
                         'width': ev['winfo'], 'width_threshold': ev['thr'], 'gateA': ev['gateA'], 'gateB': ev['gateB']}
    amb = [{'a': ids[i], 'b': ids[j], 'lane_fraction': round(r['score'], 2), 'visible': round(r['visible'], 2)}
           for (i, j), r in prim['T'].items() if r['status'] == 'ambiguous']
    rim_named = {n: round(float(F['rim_offset'][name2j[n]]), 2) for n in ('Coruscant', "Bar'leth", 'Hodi', 'Corellia', 'Kessel', 'Formos', 'Aargau', 'Trellen') if n in name2j}
    return {
        'params': {'strength_threshold': STRENGTH_T, 'orientation_tolerance_deg': 20, 'visible_min': VIS_MIN, 'lane_fraction_min': LANE_FRAC_MIN,
                   'arrival_window_px': ARRIVAL_WINDOW_PX, 'arrival_deg': ARRIVAL_DEG, 'max_path_ratio': MAX_PATH_RATIO,
                   'max_pair_px': MAX_PAIR_PX, 'sigmas': list(SIGMAS), 'short_gap_px': SHORT_GAP_PX, 'short_gap_collinear_deg': SG_COLLINEAR_DEG,
                   'width_window_px': WIDTH_WIN, 'stroke_dilate_px': STROKE_DILATE, 'marker_radius_px': MARKER_RADIUS_PX,
                   'contrast_min': CONTRAST_MIN, 'contrast_flank': CONTRAST_FLANK, 'kink_deg': MAX_KINK_DEG, 'kink_window_px': KINK_WINDOW_PX,
                   'kink_zone_px': KINK_ZONE_PX, 'rim_rays': RIM_RAYS, 'rim_search_px': RIM_SEARCH_PX, 'rim_radial_deg': RIM_RADIAL_DEG, 'rim_min_rays': RIM_MIN_RAYS},
        'colour_gate': {k: v for k, v in cg.items() if k not in ('lane_pixels', 'shade_pixels', 'outline_pixels')} | {'gate_pixels': F['gate_pixels']},
        'per_dot_rim': {**F['rim_info'], 'named_dot_offsets_px': rim_named},
        'radial_arrival_all_tested_pairs': dict(arr_stats), 'contrast_gate': F['contrast_info'], 'kink_rule': kink_report, 'kink_selection': KINK_SELECTION,
        'label_strokes': lrep, 'visibility_floor_sensitivity': sensitivity, 'short_gap_pairs': short_gap,
        'rejection_reasons_all_pairs': dict(why), 'rejection_first_reason_all_pairs': dict(why_first),
        'occlusion_pixels_by_source': F['occ_parts'], 'primary_generator': 'all pairs within 2 cells (291 px)', 'variants': summary,
        'gateC': gateC, 'marker_cross_check': marker_check, 'ambiguous_primary': amb,
        'ambiguous_primary_with_evidence': [a for a in amb if a['lane_fraction'] >= LANE_FRAC_MIN],
        'edges_with_edges': len(on), 'dots': len(D), 'waypoint_nodes': sum(1 for n in ids if n.startswith('wp-')),
    }
