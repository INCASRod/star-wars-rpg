"""Step 0.1: crawl Wookieepedia's hyperlane categories and save every article's raw wikitext + revision id.

    python scripts/astrogation/wook/fetch.py

Categories: Hyperlanes, Super-hyperroutes, Hyperlanes by region (and every subcategory, depth <= 3). NOTE: the prompt names "Hyperspace routes";
that category does not exist on Wookieepedia, these are the real ones. Output: data/astrogation/wook/raw/<slug>.wikitext, raw/index.json,
raw/SOURCES.md (URL, revision id, licence per article).
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
import wiki

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
RAW = os.path.join(ROOT, 'data', 'astrogation', 'wook', 'raw')
ROOT_CATS = ('Hyperlanes', 'Super-hyperroutes', 'Hyperlanes by region')
MAX_DEPTH = 3


def slug(title):
    return re.sub(r'[^A-Za-z0-9]+', '_', title).strip('_')[:90]


def main():
    os.makedirs(RAW, exist_ok=True)
    cats, pages, queue = {}, {}, [(c, 0) for c in ROOT_CATS]
    while queue:
        c, d = queue.pop(0)
        if c in cats:
            continue
        members = wiki.category_members(c)
        cats[c] = len(members)
        for m in members:
            if m['type'] == 'subcat' and d < MAX_DEPTH:
                queue.append((m['title'].replace('Category:', ''), d + 1))
            elif m['type'] == 'page':
                pages.setdefault(m['title'], []).append(c)
    print(len(cats), 'categories,', len(pages), 'pages')
    titles = sorted(pages)
    got = wiki.wikitext(titles)
    index, used = [], set()
    for t in titles:
        g = got.get(t)
        if g is None or g.get('missing'):
            print('missing', t)
            continue
        sl = slug(t)
        if sl in used:
            sl += f"_{g['revid']}"
        used.add(sl)
        open(os.path.join(RAW, sl + '.wikitext'), 'w', encoding='utf-8', newline='\n').write(g['text'])
        legends = 'Legends articles' in g['categories']
        index.append({'title': t, 'file': sl + '.wikitext', 'revid': g['revid'], 'timestamp': g['timestamp'],
                      'url': 'https://starwars.fandom.com/wiki/' + t.replace(' ', '_'), 'canon': ('Canon articles' in g['categories']), 'legends': legends,
                      'found_in': pages[t], 'categories': g['categories']})
    json.dump({'categories': cats, 'articles': index}, open(os.path.join(RAW, 'index.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    lines = ['# Sources', '',
             'Every file here is the raw wikitext of a Wookieepedia article (https://starwars.fandom.com), fetched through the MediaWiki API on 2026-10-17.',
             'Text is available under the Creative Commons Attribution-ShareAlike 3.0 licence (CC BY-SA 3.0); see https://starwars.fandom.com/wiki/Wookieepedia:Copyrights.',
             'Per-article attribution: the URL and revision id below identify the exact text used. The page history lists its authors.', '',
             '| Article | Revision | Edition | URL | Licence |', '|---|---|---|---|---|']
    for a in index:
        ed = 'Legends' if a['legends'] else ('Canon' if a['canon'] else 'unflagged')
        lines.append(f"| {a['title']} | {a['revid']} | {ed} | {a['url']} | CC BY-SA 3.0 |")
    open(os.path.join(RAW, 'SOURCES.md'), 'w', encoding='utf-8', newline='\n').write('\n'.join(lines) + '\n')
    print('saved', len(index), 'articles')


if __name__ == '__main__':
    main()
