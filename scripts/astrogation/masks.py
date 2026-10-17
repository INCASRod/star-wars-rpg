"""Lane / occlusion / marker masks for routing, built from the EXISTING detection code (edges.prepare: ridge field, colour gate V_min 170 /
S_max 92 derived by colour_gate.py, two-sided contrast, occlusion from dots + label strokes + gridlines + route markers). Nothing is re-tuned.

build(im) -> dict(lane, occ, white, markers, P, R, cal) ; cached to an .npz so routing experiments do not redo the ridge field.
"""
import json
import os

import cv2
import numpy as np

import calibrate
import colour_gate
import dots
import edges
import markers as mk_mod
import regions
from common import OUT_DIR


def build(im, cache=None):
    if cache and os.path.exists(cache):
        z = np.load(cache, allow_pickle=True)
        return {k: z[k] for k in z.files} | {'markers': {int(k): tuple(v) for k, v in json.loads(str(z['markers_json'])).items()}}
    cal = calibrate.calibrate(im)
    rg = regions.extract(im)
    gm = cv2.resize(rg['galaxy_mask'], (4000, 4000), interpolation=cv2.INTER_NEAREST)
    D = dots.detect(im, gm)
    label_mask = (cv2.imread(os.path.join(OUT_DIR, 'label_strokes.png'), cv2.IMREAD_GRAYSCALE) > 0).astype(np.uint8)
    mk = mk_mod.find_markers(im)
    marker_xy = {}
    for seed, (cx, cy) in mk.items():
        marker_xy[mk_mod.read_digit(im, cx, cy)] = (cx, cy)
    F = edges.prepare(im, D, label_mask, cal, list(marker_xy.values()))
    cg = F['colour_gate']
    white = colour_gate.gate_map(im, cg)                                   # near-white pixels (lane colour), before the ridge test
    lane = F['strength'] > edges.STRENGTH_T                                # colour-gated, two-sided-contrast ridge pixels
    out = {'lane': lane, 'occ': F['occ'] > 0, 'white': white > 0, 'P': F['P'], 'R': F['R'], 'RIM': F['RIM'], 'strength': F['strength'].astype(np.float16)}
    if cache:
        np.savez_compressed(cache, **out, markers_json=json.dumps({str(k): list(v) for k, v in marker_xy.items()}))
    out['markers'] = marker_xy
    return out
