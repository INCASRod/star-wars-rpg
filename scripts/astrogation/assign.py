"""Step 4 - assign detected dots to systems (closed-vocabulary OCR matching), split touching dots, drop nebula icons.

Every match is restricted to the candidate names of the cells around the label, and a dot may only take a
system whose own grid cell contains it (+CELL_MARGIN_PX). Ambiguity => leave the system unassigned (falls
through to the catalogue / cell tiers). Nothing here guesses.
"""
import re
import cv2
import numpy as np
from rapidfuzz import fuzz
from scipy.optimize import linear_sum_assignment
from common import COLS, CELL_MARGIN_PX

NEB = re.compile(r'(neb\.?|nebula)\s*$', re.I)
MAX_LABEL_DIST = 45.0
ACCEPT, GAP = 85, 5


def norm(s):
    s = s.lower().replace('-', ' ').replace("'", '').replace('’', '')
    s = re.sub(r'[^a-z0-9 ]', '', s).strip()
    return s.replace('l', 'i').replace('1', 'i')   # OCR cannot tell capital I from l; fold both sides so the closed-vocab compare is fair


def cell_of(tf, px, py):
    ci = int((px - tf.cal['x_c_left']) // tf.pitch)
    ri = int((py - tf.cal['y_row1_top']) // tf.pitch)
    if 0 <= ci < len(COLS) and 0 <= ri < 21:
        return f'{COLS[ci]}-{ri + 1}'
    return None


def neighbours(grid):
    col, row = grid.split('-')
    ci, ri = COLS.index(col), int(row)
    out = []
    for dc in (-1, 0, 1):
        for dr in (-1, 0, 1):
            c, r = ci + dc, ri + dr
            if 0 <= c < len(COLS) and 1 <= r <= 21:
                out.append(f'{COLS[c]}-{r}')
    return out


def score(label, name):
    a, b = norm(label), norm(name)
    if not a or not b:
        return 0
    s = fuzz.ratio(a, b)
    if s >= 95:
        s += 10   # a full-string match beats a mere substring match (Kessel vs Little Kessel)
    if len(a) >= 5 and len(b) >= 5:
        s = max(s, 0.95 * fuzz.partial_ratio(a, b))
    if len(a) >= 4 and b.startswith(a.rstrip('.').strip()):
        s = max(s, 90)
    return s


def match_labels(lines, systems, tf):
    """OCR line -> system index (or 'NEB'). Candidates = systems in the label's cell +/- 1."""
    by_cell = {}
    for i, s in enumerate(systems):
        by_cell.setdefault(s['grid'], []).append(i)
    out = []
    for l in lines:
        cx, cy = (l['x0'] + l['x1']) / 2, (l['y0'] + l['y1']) / 2
        if NEB.search(l['text']):
            out.append({**l, 'match': 'NEB', 'conf': 100})
            continue
        g = cell_of(tf, cx, cy)
        if g is None:
            continue
        cands = [i for n in neighbours(g) for i in by_cell.get(n, [])]
        sc = sorted(((score(l['text'], systems[i]['name']), i) for i in cands), reverse=True)
        if not sc or sc[0][0] < ACCEPT:
            continue
        if len(sc) > 1 and sc[1][0] >= sc[0][0] - GAP and systems[sc[1][1]]['name'] != systems[sc[0][1]]['name']:
            continue   # two different names tie: ambiguous, do not guess
        out.append({**l, 'match': sc[0][1], 'conf': sc[0][0]})
    # tile overlaps give the same label twice (e.g. "Bar'leth" and "r'leth"): the duplicate would steal a neighbouring
    # dot in the assignment, so per system keep the best reading and drop overlapping/near duplicates
    out.sort(key=lambda l: (-l['conf'], -len(l['text'])))
    kept = []
    for l in out:
        if l['match'] != 'NEB' and any(k['match'] == l['match'] and abs((k['x0'] + k['x1']) / 2 - (l['x0'] + l['x1']) / 2) < 80
                                       and abs((k['y0'] + k['y1']) / 2 - (l['y0'] + l['y1']) / 2) < 40 for k in kept):
            continue
        kept.append(l)
    return kept


def rect_dist(px, py, l):
    dx = max(l['x0'] - px, 0, px - l['x1'])
    dy = max(l['y0'] - py, 0, py - l['y1'])
    return float(np.hypot(dx, dy))


def split_clusters(im, D, labels, M):
    """Touching dots merge into one blob. Hough proposes discs inside the cluster; the number kept is
    max(existing dots, matched labels sitting on the cluster). Returns (dots, report)."""
    n = len(D)
    parent = list(range(n))

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a
    for i in range(n):
        for j in range(i + 1, n):
            if np.hypot(D[i]['px'] - D[j]['px'], D[i]['py'] - D[j]['py']) < 1.25 * (D[i]['r'] + D[j]['r']):
                parent[find(i)] = find(j)
    groups = {}
    for i in range(n):
        groups.setdefault(find(i), []).append(i)
    g_all = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    b_all = im[..., 0].copy()
    new, report = [], []
    for members in groups.values():
        grp = [D[i] for i in members]
        if len(grp) == 1 and grp[0]['r'] < 9.5:
            new.extend(grp)
            continue
        xs = [d['px'] for d in grp]
        ys = [d['py'] for d in grp]
        cx, cy = float(np.mean(xs)), float(np.mean(ys))
        ext = max(d['r'] for d in grp) + 12
        x0, x1, y0, y1 = int(min(xs) - ext), int(max(xs) + ext), int(min(ys) - ext), int(max(ys) + ext)
        nlab = sum(1 for l in labels if l['match'] not in (None, 'NEB') and any(rect_dist(d['px'], d['py'], l) <= MAX_LABEL_DIST for d in grp))
        cand = []

        def hough(chan, p1, p2):
            crop = cv2.GaussianBlur(cv2.resize(chan[y0:y1, x0:x1], None, fx=4, fy=4, interpolation=cv2.INTER_CUBIC), (0, 0), 2)
            cir = cv2.HoughCircles(crop, cv2.HOUGH_GRADIENT, dp=1, minDist=16, param1=p1, param2=p2, minRadius=16, maxRadius=52)
            for x, y, r in (cir[0] if cir is not None else []):
                px, py = x / 4 + x0, y / 4 + y0
                if M[int(py), int(px)] and any(np.hypot(px - d['px'], py - d['py']) < d['r'] + 4 for d in grp)                         and all(np.hypot(px - c[0], py - c[1]) > 5 for c in cand):
                    cand.append((px, py, r / 4))
        hough(g_all, 60, 26)
        if len(cand) < max(2, nlab):            # overlapping gold discs (Corellia/Duro/Nubia): the blue channel separates them
            hough(b_all, 60, 26)
        target = max(len(grp), min(nlab, len(cand)))
        if len(cand) >= 2 and target >= 2 and nlab >= 2:
            proto = max(grp, key=lambda d: d['r'])
            for px, py, r in cand[:target]:
                new.append({**proto, 'px': float(px), 'py': float(py), 'r': float(r), 'split': True})
            report.append({'centre': [cx, cy], 'was': len(grp), 'labels': nlab, 'hough': len(cand), 'now': target})
        else:
            new.extend(grp)
    return new, report


def assign_dots(D, labels, systems, tf):
    """Hungarian label->dot (cost = distance to label rectangle) then name check against the dot's own cell."""
    L = [l for l in labels if l['match'] is not None]
    assigned, rejected = {}, []
    cost = np.full((len(L), len(D)), 1e6)
    for i, l in enumerate(L):
        for j, d in enumerate(D):
            dd = rect_dist(d['px'], d['py'], l)
            if dd <= MAX_LABEL_DIST:
                cost[i, j] = dd
    ri, ci = linear_sum_assignment(cost)
    neb = set()
    cand = {}
    for i, j in zip(ri, ci):
        if cost[i, j] >= 1e6:
            continue
        l, d = L[i], D[j]
        if l['match'] == 'NEB':
            neb.add(j)
            continue
        s = systems[l['match']]
        x0, x1, y0, y1 = tf.cell_bounds(s['grid'])
        m = CELL_MARGIN_PX
        if not (x0 - m <= d['px'] <= x1 + m and y0 - m <= d['py'] <= y1 + m):
            rejected.append({'name': s['name'], 'grid': s['grid'], 'label': l['text'], 'reason': 'dot outside cell+margin'})
            continue
        cand.setdefault(l['match'], []).append((float(cost[i, j]), j, l))
    taken = set()
    for sidx, opts in sorted(cand.items(), key=lambda kv: min(o[0] for o in kv[1])):
        dist, j, l = min(opts, key=lambda o: o[0])
        if j in taken:
            rejected.append({'name': systems[sidx]['name'], 'grid': systems[sidx]['grid'], 'label': l['text'], 'reason': 'dot already taken'})
            continue
        taken.add(j)
        assigned[sidx] = {'dot': j, 'dist': dist, 'label': l['text'], 'conf': l['conf']}
    # drop nebula icons (index remap)
    keep_idx = [j for j in range(len(D)) if j not in neb]
    remap = {j: k for k, j in enumerate(keep_idx)}
    nebd = [D[j] for j in sorted(neb)]
    for a in assigned.values():
        a['dot'] = remap[a['dot']]
    return [D[j] for j in keep_idx], assigned, nebd, rejected
