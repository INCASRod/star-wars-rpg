"""Minimal Wookieepedia MediaWiki API client (starwars.fandom.com/api.php). Polite: identifies itself, throttles, never scrapes HTML.
Article text is CC BY-SA 3.0; raw wikitext is saved with URL and revision id for attribution (see data/astrogation/wook/raw/SOURCES.md)."""
import json
import time
import urllib.parse
import urllib.request

API = 'https://starwars.fandom.com/api.php'
UA = {'User-Agent': 'HolocronAstrogation/0.1 (r.a.pesenti@gmail.com; Star Wars RPG campaign tool; keeps CC BY-SA attribution)'}
_last = [0.0]


def api(**p):
    p['format'] = 'json'
    wait = 0.6 - (time.time() - _last[0])
    if wait > 0:
        time.sleep(wait)
    u = API + '?' + urllib.parse.urlencode(p)
    for attempt in range(4):
        try:
            _last[0] = time.time()
            return json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=90).read())
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 * (attempt + 1))


def category_members(cat, ns=None):
    """All members of Category:`cat` -> list of {title, ns}"""
    out, cont = [], {}
    while True:
        p = dict(action='query', list='categorymembers', cmtitle='Category:' + cat, cmlimit=500, cmprop='title|type', **cont)
        if ns is not None:
            p['cmnamespace'] = ns
        r = api(**p)
        out += [{'title': m['title'], 'type': m['type']} for m in r['query']['categorymembers']]
        if 'continue' not in r:
            return out
        cont = r['continue']


def wikitext(titles):
    """-> {title: {revid, timestamp, text, categories}} (redirects resolved; `from` kept)"""
    out = {}
    for i in range(0, len(titles), 20):
        chunk = titles[i:i + 20]
        r = api(action='query', titles='|'.join(chunk), prop='revisions|categories', rvprop='ids|timestamp|content', rvslots='main', redirects=1, cllimit=200)
        redir = {x['to']: x['from'] for x in r['query'].get('redirects', [])}
        for pg in r['query']['pages'].values():
            if 'revisions' not in pg:
                out[pg['title']] = {'missing': True}
                continue
            rv = pg['revisions'][0]
            out[pg['title']] = {'revid': rv['revid'], 'timestamp': rv['timestamp'], 'text': rv['slots']['main']['*'],
                                'categories': [c['title'].replace('Category:', '') for c in pg.get('categories', [])], 'redirected_from': redir.get(pg['title'])}
    return out
