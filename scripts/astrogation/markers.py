"""The five numbered route markers (black discs, r=12px, printed ON each major route)."""
import logging
import cv2
import numpy as np

# legend order on the map
ROUTE_NAMES = {1: 'Perlemian Trade Route', 2: 'Corellian Run', 3: 'Corellian Trade Spine', 4: 'Rimma Trade Route', 5: 'Hydian Way'}
# approximate marker positions read off the map; each is refined to the disc centre below
SEEDS = [(2777, 1771), (2425, 2696), (2123, 2509), (2123, 3008), (2588, 1317)]


def find_markers(im, seeds=SEEDS):
    """Locate the black numbered discs near the seeds. Returns {seed: (cx, cy)}."""
    V = im.max(2)
    out = {}
    for (x, y) in seeds:
        w = 45
        sub = (V[y - w:y + w, x - w:x + w] < 70).astype(np.uint8)
        cnt, _ = cv2.findContours(sub, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        f = np.zeros_like(sub)
        cv2.drawContours(f, cnt, -1, 1, -1)
        dt = cv2.distanceTransform(f, cv2.DIST_L2, 5)
        if dt.max() < 10:
            raise SystemExit(f'HARD STOP: no marker disc near seed {(x, y)}')
        yy, xx = np.unravel_index(dt.argmax(), dt.shape)
        out[(x, y)] = (float(x - w + xx), float(y - w + yy))
    return out


def read_digit(im, cx, cy):
    logging.disable(logging.INFO)
    from rapidocr import RapidOCR
    c = im[int(cy) - 11:int(cy) + 11, int(cx) - 11:int(cx) + 11]
    c = cv2.copyMakeBorder(cv2.resize(c, None, fx=6, fy=6, interpolation=cv2.INTER_CUBIC), 40, 40, 40, 40, cv2.BORDER_CONSTANT, value=(0, 0, 0))
    r = RapidOCR()(c, use_det=False, use_cls=False, use_rec=True)
    digits = [ch for t in (r.txts or []) for ch in t if ch in '12345']
    return int(digits[0]) if digits else None
