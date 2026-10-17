"""OCR the printed system labels (RapidOCR). Output used ONLY for closed-vocabulary matching against each
cell's candidate names - never as open-vocabulary text."""
import logging
import cv2
import numpy as np

STRIDE, TILE = 900, 1100
Y0, Y1, X0, X1 = 850, 3800, 250, 3800


def run_ocr(im):
    logging.disable(logging.INFO)
    from rapidocr import RapidOCR
    eng = RapidOCR()
    lines = []
    for y in range(Y0, Y1, STRIDE):
        for x in range(X0, X1, STRIDE):
            r = eng(im[y:y + TILE, x:x + TILE])
            if not r.txts:
                continue
            for tx, b, sc in zip(r.txts, r.boxes, r.scores):
                b = np.array(b, float)
                lines.append({'text': tx.strip(), 'x0': float(b[:, 0].min() + x), 'y0': float(b[:, 1].min() + y),
                              'x1': float(b[:, 0].max() + x), 'y1': float(b[:, 1].max() + y), 'score': float(sc)})
    # de-duplicate tile overlaps: same text + heavily overlapping box
    out = []
    for l in sorted(lines, key=lambda l: -l['score']):
        dup = False
        for o in out:
            if o['text'].lower() != l['text'].lower():
                continue
            ix = min(o['x1'], l['x1']) - max(o['x0'], l['x0']); iy = min(o['y1'], l['y1']) - max(o['y0'], l['y0'])
            if ix > 0 and iy > 0:
                dup = True; break
        if not dup:
            out.append(l)
    return out
