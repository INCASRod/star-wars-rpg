"""Step 0.2-0.5: compile Wookieepedia hyperlane articles into routes over the DK named planets, then audit.

    python scripts/astrogation/wook/compile.py        (after fetch.py)

  extract   each article's stops with provenance: infobox fields (endpoints, transitpoints, otherobjects, stellar), the lead paragraph, and body
            sections named Route/Course/Geography/Description/Systems/Locations/Path. History, Behind the scenes, Appearances, Sources are NOT read.
  match     stop name -> DK named planet (systems.json, precision "dot"). EXACT or ALIAS only, no fuzzy matching:
              title    the link target and the DK name are the same Wookieepedia page (after redirects)
              display  the link's display text equals the DK name exactly
            Before either test the suffixes "/Legends", " system", " (planet)", " (system)" are stripped from the Wookieepedia name too (C2, Rodrigo's
            decision 1): the exact form is tried first, the stripped form second. Still no fuzzy matching.
            An ambiguous DK name (two dots) is never matched. Everything unmatched is listed.
  select    ONE route per name (C2 decision 2): the canon article when it has >= 2 matched stops, otherwise the Legends article; edition_used is recorded.
  order     nearest-neighbour chain from one extreme end through the matched stops' DK pixel coordinates, then 2-opt on the open path.
  class     the five majors (Perlemian, Corellian Run, Corellian Trade Spine, Rimma, Hydian Way) = major, all else minor.
Writes data/astrogation/wook/{routes.json, graph.json, AUDIT.md, preview.png, aliases.json}.
"""
import collections
import heapq
import json
import os
import re
import statistics
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
import wiki

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
WOOK = os.path.join(ROOT, 'data', 'astrogation', 'wook')
RAW = os.path.join(WOOK, 'raw')
MAJORS = ['Perlemian Trade Route', 'Corellian Run', 'Corellian Trade Spine', 'Rimma Trade Route', 'Hydian Way']
BODY_SECTIONS = {'route', 'course', 'geography', 'description', 'systems', 'locations', 'path', 'overview', 'layout'}
INFOBOX_STOP_FIELDS = ('endpoints', 'transitpoints', 'otherobjects', 'stellar')
LONG_HOP_PX = 600
CHECK_PAIRS = [('Coruscant', 'Corellia'), ('Coruscant', 'Fedalle'), ('Coruscant', 'Ord Mantell'), ('Ryloth', 'Arkanis'), ('Kessel', 'Formos'),
               ('Ryloth', 'Tatooine')]

LINK = re.compile(r'\[\[([^\[\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]*))?\]\]')


def clean(text):
    text = re.sub(r'<!--.*?-->', '', text, flags=re.S)
    text = re.sub(r'<ref[^>]*/>', '', text)
    text = re.sub(r'<ref[^>]*>.*?</ref>', '', text, flags=re.S)
    return text


def links(text):
    """-> [(target, display)] in order, skipping File:/Category:/other namespaces"""
    out = []
    for m in LINK.finditer(clean(text)):
        t = m.group(1).strip()
        if ':' in t and t.split(':')[0] in ('File', 'Category', 'Image', 'Template', 'Wookieepedia', 'Help', 'User', 'Special', 'Media'):
            continue
        out.append((t, (m.group(2) or t).strip()))
    return out


def infobox(text):
    """The {{TradeRoute ...}} template -> {field: raw value}. Balanced-brace scan; fields split on newline + '|' at depth 0."""
    i = text.find('{{TradeRoute')
    if i < 0:
        return None
    depth, j = 0, i
    while j < len(text):
        if text.startswith('{{', j):
            depth += 1
            j += 2
        elif text.startswith('}}', j):
            depth -= 1
            j += 2
            if depth == 0:
                break
        else:
            j += 1
    body = text[i + 2:j - 2]
    fields, cur, d = {}, None, 0
    for line in body.split('\n')[1:]:
        if d == 0 and line.startswith('|') and '=' in line:
            k, v = line[1:].split('=', 1)
            cur = k.strip()
            fields[cur] = v
        elif cur is not None:
            fields[cur] += '\n' + line
        d += line.count('{{') - line.count('}}')
    return fields


def sections(text):
    """-> (lead text after the infobox, {lowercased heading: text})"""
    i = text.find('{{TradeRoute')
    if i >= 0:
        depth, j = 0, i
        while j < len(text):
            if text.startswith('{{', j):
                depth += 1
                j += 2
            elif text.startswith('}}', j):
                depth -= 1
                j += 2
                if depth == 0:
                    break
            else:
                j += 1
        text = text[j:]
    parts = re.split(r'^==\s*([^=\n]+?)\s*==\s*$', text, flags=re.M)
    lead = parts[0]
    secs = {parts[k].lower(): parts[k + 1] for k in range(1, len(parts) - 1, 2)}
    return lead, secs


def extract(article):
    text = open(os.path.join(RAW, article['file']), encoding='utf-8').read()
    ib = infobox(text)
    lead, secs = sections(text)
    stops = []                                                         # (target, display, source)
    if ib:
        for f in INFOBOX_STOP_FIELDS:
            for t, d in links(ib.get(f, '')):
                stops.append((t, d, 'infobox:' + f))
    for t, d in links(lead):
        stops.append((t, d, 'lead'))
    for h, body in secs.items():
        if h in BODY_SECTIONS:
            for t, d in links(body):
                stops.append((t, d, 'section:' + h))
    return stops, bool(ib)


# ------------------------------------------------------------------ matching (shared with c4_positions.py)
SUFFIXES = ('/Legends', ' system', ' (planet)', ' (system)')


def dk_title_variants(n):
    v = [n]
    if n.endswith(', The'):
        v.append('The ' + n[:-5])
    return v


def strip_suffix(t):
    for suf in SUFFIXES:
        if t.endswith(suf):
            return t[:-len(suf)]
    return t


def forms(t):
    """the exact name first, then its suffix-stripped form (when different)"""
    u = strip_suffix(t)
    return [(t, 'exact')] + ([(u, 'suffix')] if u != t else [])


def make_matcher(names, canon):
    """names: {planet name: [entries]}. -> match(target, display) -> (name or None, kind or reason).
    Per form (exact, then suffix-stripped): same page after redirects ('title'), else display text equals the name ('display').
    The kind carries '+suffix' when the stripped form was needed."""
    by_canon = collections.defaultdict(set)
    for n in names:
        for v in dk_title_variants(n):
            c = canon.get(v)
            if c:
                by_canon[c].add(n)

    def match(target, display):
        reason = 'no DK planet'
        for (tt, how), (dd, _) in zip(forms(target), forms(display) if len(forms(display)) == len(forms(target)) else [(display, 'exact')] * len(forms(target))):
            c = canon.get(tt)
            found, kind = set(), None
            if c and c in by_canon:
                found, kind = by_canon[c], 'title'
            elif dd in names:
                found, kind = {dd}, 'display'
            if not found:
                continue
            if len(found) > 1:
                reason = 'ambiguous name'
                continue
            n = next(iter(found))
            if len(names[n]) > 1:
                reason = 'two DK dots share the name'
                continue
            return n, kind + ('+suffix' if how == 'suffix' else '')
        return None, reason

    return match


# ------------------------------------------------------------------ alias resolution (Wookieepedia redirects)
def resolve(titles, cache_path):
    """canonical page title for each title (follows redirects); None when the page does not exist. Cached, so a re-run needs no network."""
    cache = json.load(open(cache_path, encoding='utf-8')) if os.path.exists(cache_path) else {}
    todo = sorted({t for t in titles if t not in cache})
    for i in range(0, len(todo), 50):
        chunk = todo[i:i + 50]
        r = wiki.api(action='query', titles='|'.join(chunk), redirects=1)
        norm = {x['from']: x['to'] for x in r['query'].get('normalized', [])}
        red = {x['from']: x['to'] for x in r['query'].get('redirects', [])}
        missing = {pg['title'] for pg in r['query']['pages'].values() if 'missing' in pg}
        for t in chunk:
            c = norm.get(t, t)
            c = red.get(c, c)
            cache[t] = None if c in missing else c
        print(f'  resolved {min(i + 50, len(todo))}/{len(todo)}', end='\r')
    json.dump(cache, open(cache_path, 'w', encoding='utf-8'), indent=0, ensure_ascii=False, sort_keys=True)
    return cache


# ------------------------------------------------------------------ ordering
def order_stops(pts):
    """Nearest-neighbour chain from one extreme end (the stop farthest from the centroid), then 2-opt on the open path. -> index order"""
    n = len(pts)
    if n <= 2:
        return list(range(n))
    P = np.array(pts, float)
    D = np.hypot(*(P[:, None, :] - P[None, :, :]).transpose(2, 0, 1))
    cur = int(np.argmax(np.hypot(*(P - P.mean(0)).T)))
    path, left = [cur], set(range(n)) - {cur}
    while left:
        cur = min(left, key=lambda k: D[path[-1], k])
        path.append(cur)
        left.discard(cur)
    improved = True
    while improved:
        improved = False
        for i in range(0, n - 1):
            for j in range(i + 1, n):
                a = D[path[i - 1], path[i]] if i > 0 else 0.0
                b = D[path[j], path[j + 1]] if j < n - 1 else 0.0
                a2 = D[path[i - 1], path[j]] if i > 0 else 0.0
                b2 = D[path[i], path[j + 1]] if j < n - 1 else 0.0
                if a2 + b2 < a + b - 1e-9:
                    path[i:j + 1] = path[i:j + 1][::-1]
                    improved = True
    return path


def main():
    idx = json.load(open(os.path.join(RAW, 'index.json'), encoding='utf-8'))['articles']
    systems = json.load(open(os.path.join(ROOT, 'data', 'astrogation', 'systems.json'), encoding='utf-8'))
    dots = [s for s in systems if s['precision'] == 'dot']
    # C4: route-stop planets that have no named dot (c4_positions.py): a snapped unnamed DK dot, or the catalogue position. Never cell centres.
    added_path = os.path.join(WOOK, 'c4_planets.json')
    added = json.load(open(added_path, encoding='utf-8')) if os.path.exists(added_path) else []
    dk = dots + [{'id': a['id'], 'name': a['name'], 'px': a['x'], 'py': a['y'], 'x': a['gx'], 'y': a['gy'], 'region': a['region'], 'sector': a['sector'],
                  'precision': a['precision']} for a in added]
    print(len(idx), 'articles;', len(dots), 'DK named planets +', len(added), 'route planets')

    # ---- extract
    arts = []
    for a in idx:
        stops, has_ib = extract(a)
        base = re.sub(r'/Legends$', '', a['title'])
        arts.append({**a, 'route': base, 'edition': 'legends' if a['legends'] else ('canon' if a['canon'] else 'unflagged'), 'raw_stops': stops, 'has_infobox': has_ib})

    # ---- aliases: every link target, plus every DK name (and "The X" for "X, The")
    dk_names = collections.defaultdict(list)
    for s in dk:
        dk_names[s['name']].append(s)

    want = {f for a in arts for t, d, _ in a['raw_stops'] for x in (t, d) for f, _ in forms(x)} | {v for n in dk_names for v in dk_title_variants(n)}
    print(len(want), 'titles to resolve')
    canon = resolve(sorted(want), os.path.join(WOOK, 'aliases.json'))
    match = make_matcher(dk_names, canon)

    # ---- build routes
    routes_all, unmatched, unmatched_ib = [], collections.defaultdict(set), collections.defaultdict(set)
    for a in arts:
        seen, stops = set(), []
        for t, d, src in a['raw_stops']:
            n, kind = match(t, d)
            if n is None:
                unmatched[t].add(a['title'])
                if src.startswith('infobox'):
                    unmatched_ib[t].add(a['title'])
                continue
            if n in seen:
                continue
            seen.add(n)
            s = dk_names[n][0]
            stops.append({'name': n, 'id': s['id'], 'px': [s['px'], s['py']], 'source': src, 'matched_by': kind, 'link': t})
        order = order_stops([s['px'] for s in stops]) if len(stops) >= 2 else list(range(len(stops)))
        ordered = [stops[k] for k in order]
        hops = [float(np.hypot(*(np.array(ordered[k]['px']) - np.array(ordered[k + 1]['px'])))) for k in range(len(ordered) - 1)]
        routes_all.append({'route': a['route'], 'title': a['title'], 'edition': a['edition'], 'class': 'major' if a['route'] in MAJORS else 'minor',
                       'matched_stops': len(ordered), 'stops': [{k: v for k, v in s.items() if k != 'px'} | {'px': [round(v, 1) for v in s['px']]} for s in ordered],
                       'unmatched': sorted({t for t, d, _ in a['raw_stops'] if match(t, d)[0] is None}),
                       'hops_px': [round(h, 1) for h in hops], 'max_hop_px': round(max(hops), 1) if hops else 0.0,
                       'suspicious_long_hops': [{'from': ordered[k]['name'], 'to': ordered[k + 1]['name'], 'px': round(h, 1)} for k, h in enumerate(hops) if h > LONG_HOP_PX],
                       'has_infobox': a['has_infobox'], 'source_url': a['url'], 'revision_id': a['revid'], 'revision_timestamp': a['timestamp'], 'licence': 'CC BY-SA 3.0'})
    # ---- canon first, Legends fills gaps: each route appears ONCE
    by_name = collections.defaultdict(dict)
    for r in routes_all:
        by_name[r['route']][r['edition']] = r
    routes = []
    for name, eds in by_name.items():
        canon_r, leg_r = eds.get('canon'), eds.get('legends')
        if canon_r and canon_r['matched_stops'] >= 2:
            used, why = canon_r, 'canon has >= 2 matched stops'
        elif leg_r and leg_r['matched_stops'] >= 2:
            used, why = leg_r, ('canon article has %d matched stops' % canon_r['matched_stops'] if canon_r else 'Legends-only route')
        else:
            used, why = (canon_r or leg_r), 'neither edition has >= 2 matched stops'
        routes.append({**used, 'edition_used': used['edition'], 'edition_reason': why, 'editions_available': sorted(eds),
                       'canon_matched_stops': canon_r['matched_stops'] if canon_r else None, 'legends_matched_stops': leg_r['matched_stops'] if leg_r else None})
    routes.sort(key=lambda r: r['route'])
    json.dump({'meta': {'generated_from': 'data/astrogation/wook/raw (Wookieepedia, CC BY-SA 3.0; see raw/SOURCES.md)', 'dk_planets': len(dots), 'route_planets_added': len(added),
                        'majors': MAJORS, 'long_hop_px': LONG_HOP_PX, 'rule': 'one route per name; canon article if >= 2 matched stops, else Legends'}, 'routes': routes},
              open(os.path.join(WOOK, 'routes.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)

    # ---- seed check: the five majors vs private/major_routes_wookieepedia.json
    seed = json.load(open(os.path.join(ROOT, 'private', 'major_routes_wookieepedia.json'), encoding='utf-8'))['routes']
    seed_rows = []
    for m in MAJORS:
        for ed in ('canon', 'legends'):
            r = next((x for x in routes if x['route'] == m and x['edition'] == ed), None)
            if r is None:
                continue
            have = {s['name'] for s in r['stops']}
            ref = set(seed.get(m, {}).get('stops', []))
            miss = sorted(ref - have)
            seed_rows.append((m, ed, len(have), len(ref), len(have & ref), [x for x in miss if x in dk_names], [x for x in miss if x not in dk_names], sorted(have - ref)))

    # ---- graph
    def edge_list(rs):
        E = []
        for r in rs:
            for k in range(len(r['stops']) - 1):
                E.append((r['stops'][k]['id'], r['stops'][k + 1]['id'], r['class'], r['route'], r['edition']))
        return E
    E = edge_list(routes)
    ly_per_px = json.load(open(os.path.join(ROOT, 'data', 'astrogation', 'regions.json'), encoding='utf-8'))['meta']['ly_per_px']
    pxy = {s['id']: (s['px'], s['py']) for s in dk}
    on_ids = {n for e in E for n in e[:2]}
    graph = {'meta': {'units': 'x, y are DK map pixels (4000x4000); gx, gy are galactic light-years (Coruscant = 0, 0); length_px is in pixels',
                      'ly_per_px': ly_per_px, 'source': 'routes.json (Wookieepedia, CC BY-SA 3.0) over the DK named planets plus the C4 route planets', 'rule': 'one route per name, canon first'},
             'nodes': [{'id': s['id'], 'name': s['name'], 'x': s['px'], 'y': s['py'], 'gx': s['x'], 'gy': s['y'], 'region': s['region'], 'sector': s['sector'],
                        'on_lane': s['id'] in on_ids, 'precision': s['precision']}
                       for s in dk if s['precision'] == 'dot' or s['id'] in on_ids],
             'edges': [{'a': a, 'b': b, 'route': rn, 'class': cl, 'length_px': round(float(np.hypot(pxy[a][0] - pxy[b][0], pxy[a][1] - pxy[b][1])), 1)}
                       for a, b, cl, rn, ed in E]}
    json.dump(graph, open(os.path.join(WOOK, 'graph.json'), 'w', encoding='utf-8'), indent=0, ensure_ascii=False)
    adj = collections.defaultdict(list)
    for a, b, cl, rn, ed in E:
        adj[a].append((b, cl, rn))
        adj[b].append((a, cl, rn))
    comp, comps = {}, []
    for n in adj:
        if n in comp:
            continue
        stack, members = [n], []
        comp[n] = len(comps)
        while stack:
            x = stack.pop()
            members.append(x)
            for y, _, _ in adj[x]:
                if y not in comp:
                    comp[y] = len(comps)
                    stack.append(y)
        comps.append(members)
    sizes = sorted((len(c) for c in comps), reverse=True)
    sid = {s['name']: s['id'] for s in dk}

    def best_path(a, b):
        """Dijkstra: minor edge = 1, major edge = 0.001 (so a major-only path wins when there is one). -> (edges, minors, majors) or None"""
        if a not in adj or b not in adj:
            return None
        dist, prev, pq = {a: 0.0}, {}, [(0.0, a)]
        while pq:
            d, x = heapq.heappop(pq)
            if d > dist.get(x, 1e18):
                continue
            if x == b:
                break
            for y, cl, rn in adj[x]:
                nd = d + (0.001 if cl == 'major' else 1.0)
                if nd < dist.get(y, 1e18):
                    dist[y], prev[y] = nd, (x, cl, rn)
                    heapq.heappush(pq, (nd, y))
        if b not in dist:
            return None
        out, x = [], b
        while x != a:
            p, cl, rn = prev[x]
            out.append((p, x, cl, rn))
            x = p
        return out[::-1]
    id2name = {s['id']: s['name'] for s in dk}
    pair_rows = []
    for a, b in CHECK_PAIRS:
        p = best_path(sid[a], sid[b])
        if p is None:
            pair_rows.append((a, b, None))
        else:
            mj = sum(1 for e in p if e[2] == 'major')
            pair_rows.append((a, b, {'hops': len(p), 'major_hops': mj, 'routes': list(dict.fromkeys(e[3] for e in p)), 'via': [id2name[e[1]] for e in p]}))

    # ---- stats
    ed_count = collections.Counter(r['edition'] for r in routes_all)
    used_count = collections.Counter(r['edition_used'] for r in routes if r['matched_stops'] >= 2)
    ge2 = [r for r in routes if r['matched_stops'] >= 2]
    st = [r['matched_stops'] for r in routes]
    on = {s['id'] for r in routes for s in r['stops']}
    un_rank = sorted(((len(v), t) for t, v in unmatched_ib.items()), reverse=True)[:50]
    sus = [r for r in routes if r['suspicious_long_hops']]
    mj_edges = sum(1 for e in E if e[2] == 'major')
    stop_src = collections.Counter(s['source'].split(':')[0] for r in routes for s in r['stops'])
    matched_by = collections.Counter(s['matched_by'] for r in routes for s in r['stops'])

    L = ['# Wookieepedia lanes: audit (Step 0)', '',
         'Source: Wookieepedia hyperlane articles through the MediaWiki API (CC BY-SA 3.0; URLs and revision ids in `raw/SOURCES.md` and `routes.json`).',
         'Positions: the DK named planets (`systems.json`, precision "dot") plus, from C4, route-stop planets with no named dot (`c4_planets.json`: snapped to an unnamed DK dot, or the SWGalacticMap catalogue position; never a cell centre). Matching is exact or alias (redirect) only.', '',
         '**Deviation from the prompt:** the category "Hyperspace routes" does not exist on Wookieepedia. The crawl used `Hyperlanes`, `Super-hyperroutes` and '
         '`Hyperlanes by region` plus every subcategory (depth 3): 33 categories, 389 articles.', '',
         '## Routes',
         f"- Articles found: {len(routes_all)} (canon {ed_count['canon']}, Legends {ed_count['legends']}); distinct routes after canon-first selection: {len(routes)}",
         f"- Edition used among routes with >= 2 matched stops: canon {used_count['canon']}, Legends {used_count['legends']}",
         f"- Routes with >= 2 matched stops: {len(ge2)}",
         f"- Matched stops per route: min {min(st)}, median {statistics.median(st)}, max {max(st)}; over routes with >= 2: min {min(r['matched_stops'] for r in ge2)}, median {statistics.median(r['matched_stops'] for r in ge2)}, max {max(r['matched_stops'] for r in ge2)}",
         f"- Stop provenance (matched stops): " + ', '.join(f'{k} {v}' for k, v in stop_src.most_common()) + '; matched by ' + ', '.join(f'{k} {v}' for k, v in matched_by.items()),
         '', '## DK planets on a route',
         f"- On at least one route: {len(on)} of {len(dk)} ({100 * len(on) / len(dk):.0f}%). On none: {len(dk) - len(on)}.", '',
         '## Seed check (`private/major_routes_wookieepedia.json`, the five majors)', '',
         'The seed lists stops from the 6,752-system JSON; only 704 of those worlds have a DK dot, so most seed stops cannot match. The last two columns separate the two cases.', '',
         '| Route | Edition | Stops now | Seed stops | In both | Seed stop WITH a DK dot, not matched | Seed stop with no DK dot |', '|---|---|---|---|---|---|---|']
    for m, ed, nh, nr, nb, miss_dot, miss_nodot, extra in seed_rows:
        L.append(f"| {m} | {ed} | {nh} | {nr} | {nb} | {', '.join(miss_dot) or '-'} | {len(miss_nodot)} |")
    L += ['', '## Unmatched Wookieepedia names (top 50 by number of routes naming them)', '',
          f'Infobox stop fields only (endpoints, transitpoints, otherobjects, stellar): {len(unmatched_ib)} distinct unmatched names. '
          f'Counting lead and section links as well there are {len(unmatched)}, but those are mostly generic links ("planet", "hyperspace route", region names), so they are not ranked.', '',
          '| Routes | Name |', '|---|---|']
    L += [f'| {n} | {t} |' for n, t in un_rank]
    gained = collections.Counter(s['name'] for r in routes for s in r['stops'] if s['matched_by'].endswith('+suffix'))
    L += ['', '## Suffix rule (C2 decision 1)', '',
          f"Stripping `/Legends`, ` system`, ` (planet)`, ` (system)` before the exact/redirect match added {sum(gained.values())} stop memberships on {len(gained)} DK planets "
          f"in the selected routes. Examples: " + ', '.join(f'{n} ({c})' for n, c in gained.most_common(25)) + '.']
    L += ['', f'## Suspicious hops (> {LONG_HOP_PX} px between consecutive ordered stops)', '', f'{len(sus)} routes:', '']
    for r in sorted(sus, key=lambda r: -r['max_hop_px']):
        L.append(f"- {r['route']} ({r['edition']}, {r['matched_stops']} stops): " + '; '.join(f"{h['from']} to {h['to']} {h['px']:.0f} px" for h in r['suspicious_long_hops']))
    L += ['', '## Connectivity (all routes, canon + Legends)',
          f"- Edges: {len(E)} ({mj_edges} on majors). Planets with a lane: {len(adj)}. Components: {len(comps)}; largest {sizes[0]} planets ({100 * sizes[0] / len(adj):.0f}% of planets with a lane); next {sizes[1:6]}.", '',
          '| Pair | Connected | Hops (major hops) | Routes used |', '|---|---|---|---|']
    for a, b, r in pair_rows:
        L.append(f"| {a} - {b} | {'no' if r is None else 'yes'} | " + ('-' if r is None else f"{r['hops']} ({r['major_hops']})") + ' | ' + ('-' if r is None else ', '.join(r['routes'])) + ' |')
    L += ['', "Rodrigo's checks (what the data says, nothing forced):"]
    for a, b, r in pair_rows:
        if r is None:
            L.append(f'- {a} - {b}: NOT connected by these routes.')
        else:
            L.append(f"- {a} - {b}: {r['hops']} hop(s), {r['major_hops']} on a major, {100 * r['major_hops'] // max(r['hops'], 1)}% major; via {' > '.join([a] + r['via'])}; routes {', '.join(r['routes'])}.")
    bp = os.path.join(WOOK, 'c4_before.json')    # numbers of the C3 graph (704 dots), written once before C4
    if os.path.exists(bp):
        bf = json.load(open(bp, encoding='utf-8'))
        old_hops = {(h[1], h[2], h[3]) for h in bf['suspicious_hops']}
        new_sus = [(h['px'], h['from'], h['to'], r['route']) for r in routes for h in r['suspicious_long_hops'] if (h['from'], h['to'], r['route']) not in old_hops]
        now = {'planets': len(graph['nodes']), 'routes_ge2': len(ge2), 'edges': len(E), 'planets_on_lane': len(adj), 'components': len(comps), 'largest': sizes[0]}
        L += ['', '## C4 before / after (route planets added: ' + str(len(added)) + ', of which on a selected lane: ' + str(sum(1 for a in added if a['id'] in adj)) + ')', '',
              '| | Before (C3) | After (C4) |', '|---|---|---|']
        for k, lab in (('planets', 'Graph nodes'), ('routes_ge2', 'Routes with >= 2 stops'), ('edges', 'Edges'), ('planets_on_lane', 'Planets with a lane'), ('components', 'Components'), ('largest', 'Largest component (planets)')):
            L.append(f'| {lab} | {bf[k]} | {now[k]} |')
        L += ['', f'New suspicious hops (> {LONG_HOP_PX} px, not in the C3 list): {len(new_sus)}'] + [f'- {a} to {b}, {px:.0f} px ({rn})' for px, a, b, rn in sorted(new_sus, reverse=True)]
    open(os.path.join(WOOK, 'AUDIT.md'), 'w', encoding='utf-8', newline='\n').write('\n'.join(L) + '\n')

    # ---- preview: plain check image (DK dot positions, majors thick, minors thin, labels for matched planets)
    S = 0.5
    img = np.full((2000, 2000, 3), 24, np.uint8)
    for s in dk:
        cv2.circle(img, (int(s['px'] * S), int(s['py'] * S)), 1, (90, 90, 90), -1)
    pos = {s['id']: (int(s['px'] * S), int(s['py'] * S)) for s in dk}
    for a, b, cl, rn, ed in E:
        if cl == 'minor':
            cv2.line(img, pos[a], pos[b], (170, 120, 40), 1, cv2.LINE_AA)
    for a, b, cl, rn, ed in E:
        if cl == 'major':
            cv2.line(img, pos[a], pos[b], (0, 215, 255), 3, cv2.LINE_AA)
    for n in adj:
        cv2.circle(img, pos[n], 2, (255, 255, 255), -1)
        cv2.putText(img, id2name[n], (pos[n][0] + 3, pos[n][1] - 2), cv2.FONT_HERSHEY_SIMPLEX, 0.25, (200, 200, 200), 1, cv2.LINE_AA)
    cv2.putText(img, 'check image: DK dot positions, Wookieepedia routes. major = thick yellow, minor = thin blue', (20, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv2.LINE_AA)
    cv2.imwrite(os.path.join(WOOK, 'preview.png'), img)
    print('routes', len(routes), 'with >=2 stops', len(ge2), 'planets on routes', len(on), 'components', len(comps), 'largest', sizes[0])


if __name__ == '__main__':
    main()
