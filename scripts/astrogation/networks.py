"""Full-map overlays of the extracted lane network, for judging by eye. Reads edges.json files (galactic ly) and draws them over the
DK map. Nothing here decides anything.

    network_before.png : edges of the baseline pipeline (kink rule), orange
    network_after.png  : edges after the continuity rule, blue
    network_diff.png   : only in before = red, only in after = green, in both = grey
"""
import json
import os

import cv2
import numpy as np

LINE_PX = 3
ALPHA = 0.6          # strength of the drawn layer over the printed map (the printed lanes stay visible underneath)
NODE_R = 5
ORANGE, BLUE, RED, GREEN, GREY = (0, 165, 255), (255, 200, 0), (0, 0, 255), (0, 200, 0), (150, 150, 150)   # BGR


def _px(path_xy, meta):
    ox, oy = meta['origin_px']
    k = meta['ly_per_px']
    return np.array([[ox + x / k, oy - y / k] for x, y in path_xy])


def load(path, meta):
    """-> {frozenset({a, b}): polyline (px)}"""
    return {frozenset((e['a'], e['b'])): _px(e['path_xy'], meta) for e in json.load(open(path))}


def _draw(im, layers):
    """layers = [(edges dict, colour)]; lines and node dots drawn on a blank layer, then blended over `im`."""
    lay = np.zeros_like(im)
    nodes = set()
    for edges, col in layers:
        for pts in edges.values():
            cv2.polylines(lay, [pts.round().astype(np.int32)], False, col, LINE_PX, cv2.LINE_AA)
            nodes.add((round(pts[0][0]), round(pts[0][1])))
            nodes.add((round(pts[-1][0]), round(pts[-1][1])))
    m = lay.any(axis=2)
    out = im.copy()
    out[m] = (ALPHA * lay[m] + (1 - ALPHA) * im[m]).astype(np.uint8)
    for (x, y) in nodes:
        cv2.circle(out, (int(x), int(y)), NODE_R, (255, 255, 255), -1, cv2.LINE_AA)
        cv2.circle(out, (int(x), int(y)), NODE_R, (0, 0, 0), 1, cv2.LINE_AA)
    return out


def render(im, meta, before_path, after_path, ev_dir):
    """Writes the three PNGs. -> counts"""
    b, a = load(before_path, meta), load(after_path, meta)
    both = {k: a[k] for k in b.keys() & a.keys()}
    only_b = {k: b[k] for k in b.keys() - a.keys()}
    only_a = {k: a[k] for k in a.keys() - b.keys()}
    cv2.imwrite(os.path.join(ev_dir, 'network_before.png'), _draw(im, [(b, ORANGE)]))
    cv2.imwrite(os.path.join(ev_dir, 'network_after.png'), _draw(im, [(a, BLUE)]))
    cv2.imwrite(os.path.join(ev_dir, 'network_diff.png'), _draw(im, [(both, GREY), (only_b, RED), (only_a, GREEN)]))
    return {'before': len(b), 'after': len(a), 'both': len(both), 'only_before': len(only_b), 'only_after': len(only_a)}
