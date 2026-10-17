"""Step 2 - region band polygons, galaxy outline, named territory overlays (pixel coords, full-res).

Bands are concentric flat fills: classify each pixel to the nearest band colour (Lab), then build
CUMULATIVE unions (DC, DC+Core, ... , whole galaxy) so bands nest by construction; band k = U_k - U_(k-1).
Seed colours were sampled along rays out from the Deep Core centre.
"""
import cv2
import numpy as np
from scipy import ndimage as ndi

W = 2000  # working resolution (half of source)
BAND_ORDER = ['Deep Core', 'Core Worlds', 'Colonies', 'Inner Rim', 'Expansion Region', 'Mid Rim', 'Outer Rim']
SEEDS = {  # RGB
    'DC': (205, 208, 215), 'CORE': (222, 192, 148), 'COL': (178, 157, 180), 'INNER': (172, 142, 130),
    'EXP': (112, 150, 170), 'MID': (128, 95, 118), 'MIDd': (118, 72, 90),
    'OUT': (60, 95, 120), 'OUT2': (75, 102, 126),
    'ARM': (35, 55, 80), 'ARM2': (25, 40, 60), 'BG': (15, 15, 22), 'BG2': (5, 8, 18),
}
BAND_OF = {'DC': 0, 'CORE': 1, 'COL': 2, 'INNER': 3, 'EXP': 4, 'MID': 5, 'MIDd': 5, 'OUT': 6, 'OUT2': 6}


def classify(im):
    bl = cv2.medianBlur(cv2.resize(im, (W, W), interpolation=cv2.INTER_AREA), 21)
    names = list(SEEDS)
    rgb = np.array([SEEDS[n] for n in names], np.uint8)[None]
    seeds_lab = cv2.cvtColor(rgb[..., ::-1].copy(), cv2.COLOR_BGR2LAB).astype(np.float32)[0]
    lab = cv2.cvtColor(bl, cv2.COLOR_BGR2LAB).astype(np.float32).reshape(-1, 3)
    d = ((lab[:, None, :] - seeds_lab[None]) ** 2).sum(2)
    idx = d.argmin(1).reshape(W, W)
    band = np.full((W, W), -1, np.int8)
    for ni, n in enumerate(names):
        if n in BAND_OF:
            band[idx == ni] = BAND_OF[n]
    return band


def _clean(mask, close, open_):
    m = mask.astype(np.uint8)
    m[:900 // 2] = 0   # title block lives above the galaxy; never part of a band
    if open_:
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (open_, open_)))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close, close)))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    if n > 1:
        m = (lab == 1 + np.argmax(st[1:, 4])).astype(np.uint8)
    cnt, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    out = np.zeros_like(m)
    cv2.drawContours(out, cnt, -1, 1, -1)   # fill holes
    return out


def build_masks(band):
    """cumulative unions U_0..U_6 at working res."""
    masks = []
    for k in range(7):
        close, open_ = (41, 0) if k < 5 else (61, 15)
        masks.append(_clean(band.__le__(k) & (band >= 0), close, open_))
    for k in range(1, 7):                      # enforce nesting
        masks[k] = masks[k] | masks[k - 1]
    return masks


def polys(mask, eps=1.5, min_area=400):
    """mask -> list of rings (outer + holes) as full-res px Nx2, via RETR_CCOMP."""
    cnt, hier = cv2.findContours(mask.astype(np.uint8), cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    out = []
    for c, h in zip(cnt, hier[0]):
        if cv2.contourArea(c) < min_area:
            continue
        a = cv2.approxPolyDP(c, eps, True)[:, 0, :] * (4000 / W)
        out.append({'ring': a.tolist(), 'hole': bool(h[3] >= 0)})
    return out


def extract(im):
    band = classify(im)
    U = build_masks(band)
    bands = {}
    for k, name in enumerate(BAND_ORDER):
        ring = U[k] & (1 - U[k - 1]) if k else U[0]
        ring = cv2.morphologyEx(ring.astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
        bands[name] = {'mask': ring, 'polys': polys(ring)}
    return {'band_idx': band, 'union': U, 'bands': bands, 'galaxy_mask': U[6],
            'outline': polys(U[6], eps=2.0)}


def territories(im):
    """Hutt Space, Corporate Sector, Bothan Space: closed bright-red overlay outlines/fills (full-res px).

    Unknown Regions and Wild Space are printed as labels only - the map draws no fill or outline for them -
    so no polygon can be extracted; they are returned as null and listed as a known gap.
    """
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    m = (((h >= 163) | (h <= 4)) & (s > 110) & (v > 130)).astype(np.uint8)
    m[:900] = 0
    # outlines are broken by JPEG/labels: dilate to bridge gaps, take outer contours, fill, erode back
    ker = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31))
    cnt, _ = cv2.findContours(cv2.dilate(m, ker), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    filled = np.zeros_like(m)
    cv2.drawContours(filled, cnt, -1, 1, -1)
    filled = cv2.erode(filled, ker)
    cnt, _ = cv2.findContours(filled, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cnt = [c for c in cnt if cv2.contourArea(c) > 2500]

    def centre(c):
        x, y, w, h_ = cv2.boundingRect(c)
        return x + w / 2, y + h_ / 2

    def nearest(anchor, tol):
        c = min(cnt, key=lambda c: np.hypot(*(np.array(centre(c)) - anchor)), default=None)
        if c is None or np.hypot(*(np.array(centre(c)) - anchor)) > tol:
            raise SystemExit(f'HARD STOP: no territory overlay near printed-label anchor {anchor}')
        return c

    # anchors = printed label positions on the map (HUTT SPACE ~ (3040,2300), CORPORATE SECTOR ~ (2990,1190), BOTHAN SPACE ~ (2830,2690))
    named = {'Hutt Space': nearest((3040, 2290), 200), 'Corporate Sector': nearest((2990, 1190), 120),
             'Bothan Space': nearest((2830, 2690), 120)}
    if cv2.contourArea(named['Hutt Space']) < 30000:
        raise SystemExit('HARD STOP: Hutt Space overlay outline did not close')
    return {k: [{'ring': cv2.approxPolyDP(c, 2.0, True)[:, 0, :].tolist(), 'hole': False}] for k, c in named.items()}


# ---------------------------------------------------------------- per-band refinement (supervised, cross-validated)
def _ring_samples(lab, G, pts):
    X, y = [], []
    for k, px, py in pts:
        for a in np.linspace(0, 2 * np.pi, 12, endpoint=False):
            for r in (22, 30):
                x, yy = int((px + r * np.cos(a)) / 2), int((py + r * np.sin(a)) / 2)
                if 0 <= x < W and 0 <= yy < W and G[yy, x]:
                    X.append(lab[yy, x])
                    y.append(k)
    return np.array(X), np.array(y)


def _plates(lab_bgr, G):
    """dark label plates ('COLONIES', 'CORE', ...) are not bands: mask them out of the classification."""
    dark = ((lab_bgr.max(2) < 70) & G).astype(np.uint8)
    n, lb, st, _ = cv2.connectedComponentsWithStats(dark)
    keep = np.zeros(n, bool)
    keep[1:] = st[1:, 4] >= 120
    return cv2.dilate(keep[lb].astype(np.uint8), np.ones((7, 7), np.uint8)) > 0


def _knn_image(lab, X, y, K=25):
    from scipy.spatial import cKDTree
    t = cKDTree(X)
    flat = lab.reshape(-1, 3)
    pred = np.zeros(len(flat), np.int8)
    for s in range(0, len(flat), 400000):
        _, i = t.query(flat[s:s + 400000], k=K)
        v = y[i]
        pred[s:s + 400000] = np.apply_along_axis(lambda r: np.bincount(r, minlength=7).argmax(), 1, v)
    return pred.reshape(W, W)


def _smooth(pred, G, win=41):
    oh = np.stack([cv2.blur((pred == k).astype(np.float32), (win, win)) for k in range(7)]).argmax(0).astype(np.int8)
    oh[~G] = -1
    return oh


def refine_bands(im, base, training, seed=1):
    """Per-band classification (NOT nested). A kNN on the colour of the band fill around dots whose JSON region is
    known (a ring 22-30px out, so the dot itself is excluded) labels every pixel inside the galaxy outline; a
    41px majority filter removes speckle. training = [(band_idx, px, py), ...] (full-res dot positions).
    Returns (label_image, cv) where cv is a 2-fold cross-validated agreement on dots the model never saw -
    the honest accuracy figure, since a plain re-probe of the training dots would be optimistic."""
    G = base['galaxy_mask'].astype(bool)
    bl = cv2.medianBlur(cv2.resize(im, (W, W), interpolation=cv2.INTER_AREA), 21)
    lab = cv2.cvtColor(bl, cv2.COLOR_BGR2LAB).astype(np.float32)
    perm = np.random.RandomState(seed).permutation(len(training))
    folds = [perm[::2], perm[1::2]]
    n = ok = 0
    two_apart = []
    for f in range(2):
        tr = [training[i] for i in folds[1 - f]]
        te = [training[i] for i in folds[f]]
        X, y = _ring_samples(lab, G, tr)
        L = _smooth(_knn_image(lab, X, y), G)
        for k, px, py in te:
            p = int(L[int(py / 2), int(px / 2)])
            n += 1
            ok += int(p == k)
            if p >= 0 and abs(p - k) >= 2:
                two_apart.append((k, p, px, py))
    X, y = _ring_samples(lab, G, training)
    pred = _knn_image(lab, X, y)
    pred[_plates(bl, G)] = -2          # excluded from the vote, filled from the surroundings below
    L = _smooth(pred, G)
    # specks (<800px) take the label of their surroundings
    for k in range(7):
        m = (L == k).astype(np.uint8)
        cnt, lb, st, _ = cv2.connectedComponentsWithStats(m)
        for i in range(1, cnt):
            if st[i][4] < 2500:
                L[lb == i] = -2
    if (L == -2).any():
        idx = ndi.distance_transform_edt(L < 0, return_distances=False, return_indices=True)
        fill = L[idx[0], idx[1]]
        L = np.where(L == -2, fill, L).astype(np.int8)
        L[~G] = -1
    bands = {}
    for k, name in enumerate(BAND_ORDER):
        mk = (L == k).astype(np.uint8)
        bands[name] = {'mask': mk, 'polys': polys(mk)}
    return {'label': L, 'bands': bands, 'cv_pct': round(100 * ok / n, 1), 'cv_n': n, 'cv_two_apart': len(two_apart)}
