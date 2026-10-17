"""Step 3 - system dot detection (shape based).

Dots are filled discs (r ~6-12px). Label glyph strokes are ~4-5px wide (distance-transform peak <= ~2.5),
minor lanes ~2-4px, stars r<=3. So: bright mask -> distance transform -> peaks with radius >= R_MIN, then a
roundness test (annulus just outside the disc must not be mostly bright: rejects blobs/boxes/lane stubs).
Inside the galaxy mask (from regions.py) every such disc counts. Outside it (Unknown Regions / Wild Space
systems are drawn as lone white dots in dark space) only strict white discs count - reported as tier 'outside'.
"""
import cv2
import numpy as np

R_MIN = 5.0
R_MAX = 16.0
LEGEND = (820, 960, 1350, 1260)  # x0,y0,x1,y1 legend box (text-heavy, not map)
MAP_Y = (880, 3800)
MAP_X = (250, 3800)


def bright_mask(im):
    V = im.max(2).astype(np.float32)
    bg = cv2.medianBlur(V.astype(np.uint8), 61).astype(np.float32)
    return (((V - bg) > 20) & (V > 150)).astype(np.uint8), V


def _refine(M, S, x, y, r):
    """Sub-pixel centre: iterate the centroid of mask pixels inside the disc (lane/label stubs barely enter it)."""
    H, W = M.shape
    cx, cy = float(x), float(y)
    rr = min(r * 1.4 + 1.5, 15.0)
    for _ in range(3):
        x0, x1, y0, y1 = int(max(0, cx - rr - 2)), int(min(W, cx + rr + 3)), int(max(0, cy - rr - 2)), int(min(H, cy + rr + 3))
        yy, xx = np.mgrid[y0:y1, x0:x1]
        sel = (np.hypot(xx - cx, yy - cy) <= rr) & (M[y0:y1, x0:x1] > 0)
        if S is not None:   # coloured dot: use its own colour so adjacent white label glyphs / lanes don't drag the centre
            col = sel & (S[y0:y1, x0:x1] > 50)
            if col.sum() >= 8:
                sel = col
        if sel.sum() < 5:
            break
        cx, cy = float(xx[sel].mean()), float(yy[sel].mean())
    return cx, cy


def detect(im, galaxy_mask_full, chain_rule=False, contrast_rule=False, dropped=None):
    M, V = bright_mask(im)
    bgV = cv2.medianBlur(im.max(2), 61).astype(np.float32)
    M[:MAP_Y[0]] = 0; M[MAP_Y[1]:] = 0; M[:, :MAP_X[0]] = 0; M[:, MAP_X[1]:] = 0
    M[LEGEND[1]:LEGEND[3], LEGEND[0]:LEGEND[2]] = 0
    dt = cv2.distanceTransform(M, cv2.DIST_L2, 5)
    peak = (dt >= R_MIN) & (dt >= cv2.dilate(dt, np.ones((9, 9), np.uint8)))
    ys, xs = np.nonzero(peak)
    S = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)[..., 1]
    inside = cv2.dilate(galaxy_mask_full, np.ones((25, 25), np.uint8))
    out, seen = [], []
    H, Wd = M.shape
    for x, y in zip(xs, ys):
        r = float(dt[y, x])
        if r > R_MAX:
            continue
        # roundness: annulus [1.15r, 1.7r] mean of mask
        y0, y1, x0, x1 = max(0, y - 30), min(H, y + 31), max(0, x - 30), min(Wd, x + 31)
        yy, xx = np.mgrid[y0:y1, x0:x1]
        d = np.hypot(xx - x, yy - y)
        ann = (d >= 1.15 * r + 1) & (d <= 1.7 * r + 2)
        cover = M[y0:y1, x0:x1][ann].mean()
        if cover > 0.55:
            continue
        cx0, cy0 = float(x), float(y)
        core = d <= max(2.0, r * 0.7)
        px = im[y0:y1, x0:x1][core].reshape(-1, 3).mean(0)[::-1]
        sat = S[y0:y1, x0:x1][core].mean()
        contrast = float((V[y0:y1, x0:x1][core] - bgV[y0:y1, x0:x1][core]).mean())
        if contrast_rule and r < 6.0 and contrast < 33:   # faint nebula-texture blob, not a drawn dot
            if dropped is not None:
                dropped.append({'px': cx0, 'py': cy0, 'r': r, 'rule': 'contrast'})
            continue
        tier = 'inside' if inside[y, x] else 'outside'
        if tier == 'outside' and not (sat < 40 and V[y, x] >= 235 and 5.5 <= r <= 12):
            continue
        cx, cy = _refine(M, S if sat > 40 else None, x, y, r)
        out.append({'px': cx, 'py': cy, 'r': r, 'rgb': [int(v) for v in px], 'sat': float(sat), 'contrast': contrast, 'tier': tier})
    # merge peaks closer than 0.8*r (flat DT plateaus can yield twin maxima)
    out.sort(key=lambda d: -d['r'])
    kept = []
    for d in out:
        if all(np.hypot(d['px'] - k['px'], d['py'] - k['py']) > 0.8 * max(d['r'], k['r']) for k in kept):
            kept.append(d)
    # chains of tiny peaks (r<6) at <=10px spacing are major-lane stubs / glyph strokes, not dots
    tiny = [k for k in kept if k['r'] < 6.0]
    drop = {id(a) for a in tiny if sum(1 for b in tiny if b is not a and np.hypot(a['px'] - b['px'], a['py'] - b['py']) <= 10) >= 1}
    if not chain_rule:
        return kept
    if dropped is not None:
        dropped.extend({**k, 'rule': 'chain'} for k in kept if id(k) in drop)
    return [k for k in kept if id(k) not in drop]
