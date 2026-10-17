"""preview_trips.png: trips 1-6 and 10 from trips.json over a plain dark background (no DK map image). major yellow, minor cyan, off-lane red dashed.

    python scripts/astrogation/wook/render_trips.py
"""
import json
import os

import cv2
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
WOOK = os.path.join(ROOT, 'data', 'astrogation', 'wook')
SHOW = (1, 2, 3, 4, 5, 6, 10)
S = 0.5
CLS = {'major': (0, 215, 255), 'minor': (255, 220, 0)}     # BGR


def main():
    g = json.load(open(os.path.join(WOOK, 'graph.json'), encoding='utf-8'))
    trips = json.load(open(os.path.join(WOOK, 'trips.json'), encoding='utf-8'))['trips']
    pos = {n['id']: (n['x'], n['y']) for n in g['nodes']}
    img = np.full((2000, 2000, 3), 24, np.uint8)
    for n in g['nodes']:
        cv2.circle(img, (int(n['x'] * S), int(n['y'] * S)), 1, (80, 80, 80), -1)
    for e in g['edges']:                                                  # the whole lane graph, faint
        a, b = pos[e['a']], pos[e['b']]
        cv2.line(img, (int(a[0] * S), int(a[1] * S)), (int(b[0] * S), int(b[1] * S)), (70, 60, 40) if e['class'] == 'minor' else (60, 90, 100), 1, cv2.LINE_AA)
    xy = {}
    for t in trips:
        for i, sid in enumerate(t['stop_ids']):
            xy[sid] = tuple(t['stop_xy'][i])
    for t in trips:
        if t['n'] not in SHOW:
            continue
        for l in t['legs']:
            a, b = xy[l['from']], xy[l['to']]
            p, q = (int(a[0] * S), int(a[1] * S)), (int(b[0] * S), int(b[1] * S))
            if l['kind'] == 'off':
                d = np.hypot(q[0] - p[0], q[1] - p[1])
                k = max(int(d // 8), 1)
                for j in range(0, k, 2):
                    pa = (int(p[0] + (q[0] - p[0]) * j / k), int(p[1] + (q[1] - p[1]) * j / k))
                    pb = (int(p[0] + (q[0] - p[0]) * (j + 1) / k), int(p[1] + (q[1] - p[1]) * (j + 1) / k))
                    cv2.line(img, pa, pb, (0, 0, 255), 2, cv2.LINE_AA)
            else:
                cv2.line(img, p, q, CLS[l['class']], 3 if l['class'] == 'major' else 2, cv2.LINE_AA)
        for i, name in enumerate(t['stops']):
            x, y = int(t['stop_xy'][i][0] * S), int(t['stop_xy'][i][1] * S)
            cv2.circle(img, (x, y), 3, (255, 255, 255), -1)
            cv2.putText(img, name, (x + 4, y - 3), cv2.FONT_HERSHEY_SIMPLEX, 0.33, (235, 235, 235), 1, cv2.LINE_AA)
        x, y = int(t['stop_xy'][0][0] * S), int(t['stop_xy'][0][1] * S)
        cv2.putText(img, str(t['n']), (x - 14, y + 14), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (80, 255, 80), 2, cv2.LINE_AA)
    cv2.putText(img, 'trips 1-6 and 10 (number = origin). major yellow, minor cyan, off-lane red dashed. faint = whole lane graph', (20, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1, cv2.LINE_AA)
    cv2.imwrite(os.path.join(WOOK, 'preview_trips.png'), img)


if __name__ == '__main__':
    main()
