"""C4 Step 0 + positions: route-stop planets that have no named DK dot.

    python scripts/astrogation/wook/c4_positions.py        (after fetch.py; compile.py then reads the output)

  candidates  a Wookieepedia route stop that the DK-dot matcher (compile.make_matcher over the 704 named dots) does NOT match, but the SAME matcher
              (same redirect + suffix rules, no fuzzy matching) matches to ONE entry of systems.json whose precision is "catalogue" or "cell".
              A name used by two such entries is ambiguous and is never added. A name that is also a named DK dot is never taken from the catalogue.
  snap        the planets are drawn on the DK map but only 704 dots carry a name. UNNAMED dots (data/astrogation/wook/unnamed_dots.json, the dots the
              OCR could not name) inside the planet's grid cell are looked at: exactly one within SNAP_PX of the catalogue position snaps; with 2+ the
              nearest snaps only when it is at least SNAP_RATIO x closer than the next; else no snap. A dot wanted by two planets goes to neither.
  precision   dot-snapped | catalogue | cell   (the original 704 stay "dot")
Writes data/astrogation/wook/{c4_planets.json, c4_step0.json}. Prints the Step 0 report.
"""
import collections
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import compile as wc  # noqa: E402  (scripts/astrogation/wook/compile.py)
from common import Transform  # noqa: E402

ROOT = wc.ROOT
WOOK = wc.WOOK
SNAP_PX = 60.0
SNAP_RATIO = 2.0
CELL_MARGIN_PX = 8.0
SELECTED = {r['title'] for r in json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'data', 'astrogation', 'wook', 'routes.json'), encoding='utf-8'))['routes']}
EXAMPLES = ['Alderaan', 'Esseles', 'Alsakan', 'Balmorra', 'Atzerri']


def main():
    idx = json.load(open(os.path.join(wc.RAW, 'index.json'), encoding='utf-8'))['articles']
    systems = json.load(open(os.path.join(ROOT, 'data', 'astrogation', 'systems.json'), encoding='utf-8'))
    report = json.load(open(os.path.join(ROOT, 'data', 'astrogation', 'report.json'), encoding='utf-8'))
    unnamed = json.load(open(os.path.join(WOOK, 'unnamed_dots.json'), encoding='utf-8'))
    tf = Transform(report['calibration'], tuple(report['origin_px']))

    dots = [s for s in systems if s['precision'] == 'dot']
    dot_names = collections.defaultdict(list)
    for s in dots:
        dot_names[s['name']].append(s)
    pool_names = collections.defaultdict(list)
    for s in systems:
        if s['precision'] != 'dot' and s['name'] not in dot_names:
            pool_names[s['name']].append(s)

    arts = []
    for a in idx:
        stops, _ = wc.extract(a)
        arts.append({**a, 'route': a['title'][:-len('/Legends')] if a['title'].endswith('/Legends') else a['title'], 'raw_stops': stops})
    want = {f for a in arts for t, d, _ in a['raw_stops'] for x in (t, d) for f, _ in wc.forms(x)}
    want |= {v for names in (dot_names, pool_names) for n in names for v in wc.dk_title_variants(n)}
    canon = wc.resolve(sorted(want), os.path.join(WOOK, 'aliases.json'))
    match_dot = wc.make_matcher(dot_names, canon)
    match_pool = wc.make_matcher(pool_names, canon)

    cand = {}                                  # system id -> {entry, routes:set, via:set}
    ambiguous = collections.defaultdict(set)   # name -> routes
    for a in arts:
        for t, d, src in a['raw_stops']:
            if match_dot(t, d)[0] is not None:
                continue
            n, why = match_pool(t, d)
            if n is None:
                if why == 'two DK dots share the name':
                    # the name resolves to a pool name with 2+ entries: find it again to list it
                    for (tt, _h) in wc.forms(t):
                        c = canon.get(tt)
                        for pn in pool_names:
                            if len(pool_names[pn]) > 1 and (canon.get(pn) == c and c or pn == d):
                                ambiguous[pn].add(a['route'])
                continue
            s = pool_names[n][0]
            c = cand.setdefault(s['id'], {'entry': s, 'routes': set(), 'via': set(), 'src': set(), 'selected': False})
            c['src'].add(src.split(':')[0])
            c['selected'] = c.get('selected', False) or a['title'] in SELECTED
            c['routes'].add(a['route'])
            c['via'].add(kind := match_pool(t, d)[1])

    # ---- snap to an UNNAMED DK dot of the same cell
    def cell_dots(grid):
        x0, x1, y0, y1 = tf.cell_bounds(grid)
        m = CELL_MARGIN_PX
        return [k for k, u in enumerate(unnamed) if x0 - m <= u['px'] <= x1 + m and y0 - m <= u['py'] <= y1 + m]

    pick = {}     # system id -> (dot index, dist) | None
    ambig_snap = {}
    for sid, c in cand.items():
        s = c['entry']
        near = sorted((math.hypot(unnamed[k]['px'] - s['px'], unnamed[k]['py'] - s['py']), k) for k in cell_dots(s['grid']))
        near = [(d, k) for d, k in near if d <= SNAP_PX]
        if len(near) == 1:
            pick[sid] = near[0][::-1]
        elif len(near) >= 2:
            if near[0][0] * SNAP_RATIO <= near[1][0]:
                pick[sid] = near[0][::-1]
            else:
                ambig_snap[sid] = [round(d, 1) for d, _ in near]
    # a dot wanted by two planets goes to neither
    wanted = collections.defaultdict(list)
    for sid, (k, d) in pick.items():
        wanted[k].append(sid)
    clash = {sid for sids in wanted.values() if len(sids) > 1 for sid in sids}
    for sid in clash:
        ambig_snap[sid] = ['shared dot']
        pick.pop(sid)

    out, rows = [], []
    for sid, c in sorted(cand.items()):
        s = c['entry']
        if sid in pick:
            k, dist = pick[sid]
            px, py, prec = unnamed[k]['px'], unnamed[k]['py'], 'dot-snapped'
            gx, gy = tf.to_galactic(px, py)
            gx, gy = round(gx, 1), round(gy, 1)
        else:
            dist, px, py, prec, gx, gy = None, s['px'], s['py'], s['precision'], s['x'], s['y']
        out.append({'id': sid, 'name': s['name'], 'grid': s['grid'], 'x': round(px, 1), 'y': round(py, 1), 'gx': gx, 'gy': gy, 'region': s['region'],
                    'sector': s['sector'], 'precision': prec, 'catalogue_precision': s['precision'], 'catalogue_px': [s['px'], s['py']],
                    'snap_px': None if dist is None else round(dist, 1), 'routes': len(c['routes'])})
    # Rodrigo's amendment (run 2): only stops on the articles C3 selected (a stop on a selected article, any source), and no cell-centre positions
    sel = {sid for sid, c in cand.items() if c['selected']}
    cell_dropped = [o for o in out if o['id'] in sel and o['precision'] == 'cell']
    keep = [o for o in out if o['id'] in sel and o['precision'] != 'cell']
    json.dump(keep, open(os.path.join(WOOK, 'c4_planets.json'), 'w', encoding='utf-8'), indent=0, ensure_ascii=False)

    cnt = collections.Counter(o['precision'] for o in keep)
    amb_rows = [{'id': sid, 'name': cand[sid]['entry']['name'], 'dists': d} for sid, d in sorted(ambig_snap.items()) if sid in sel]
    json.dump({'snap_px': SNAP_PX, 'snap_ratio': SNAP_RATIO, 'candidates_all_articles': len(out), 'candidates_selected_articles': len(sel),
               'added': len(keep), 'precision_added': dict(cnt), 'cell_excluded': [o['name'] + ' ' + o['grid'] for o in cell_dropped],
               'ambiguous_snap_left_at_catalogue': amb_rows, 'ambiguous_names': {k: sorted(v) for k, v in sorted(ambiguous.items())},
               'unnamed_dots': len(unnamed), 'unnamed_dots_used': len(pick)},
              open(os.path.join(WOOK, 'c4_step0.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)

    print(f'candidates {len(out)} on all articles, {len(sel)} on the C3-selected articles; cell-centre excluded {len(cell_dropped)}; added {len(keep)} {dict(cnt)}')
    print(f'unnamed dots {len(unnamed)}, used {len(pick)}; ambiguous snap (left at catalogue) {len(amb_rows)}; ambiguous names {sorted(ambiguous)}')
    for nme in EXAMPLES:
        o = next((x for x in keep if x['name'] == nme), None)
        print(' ', nme, '->', o and {k: o[k] for k in ('grid', 'precision', 'snap_px', 'x', 'y', 'routes')} or 'not added')


if __name__ == '__main__':
    main()
