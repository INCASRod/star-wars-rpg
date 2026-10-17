"""One-command extraction.

    python scripts/astrogation/run.py [image] [galaxy_systems.json] [planets.json]

Stages: 1 calibrate -> 2 regions -> 3 dots -> OCR/assign/split -> origin (Coruscant dot) -> systems.json
        -> region validation against assigned dots -> lane network by edge testing (edges.py).
Writes data/astrogation/{regions,systems,edges,lanes,ocr_boxes,report}.json (+ variants/, evidence/).
"""
import collections
import json
import os
import re
import sys
import time
import unicodedata

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from common import *
import assign
import calibrate
import dots
import edges
import ocr
import regions

REGION_TO_BAND = {'Deep Core': 'Deep Core', 'Core Worlds': 'Core Worlds', 'Colonies': 'Colonies', 'Inner Rim': 'Inner Rim',
                  'Expansion Region': 'Expansion Region', 'Mid Rim': 'Mid Rim', 'Outer Rim Territories': 'Outer Rim'}


def slug(name):
    s = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def key(name):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode().lower())


def band_image(rg):
    img = np.full((4000, 4000), -1, np.int8)
    for k, name in enumerate(regions.BAND_ORDER):
        img[cv2.resize(rg['bands'][name]['mask'], (4000, 4000), interpolation=cv2.INTER_NEAREST) > 0] = k
    return img


def validate_regions(systems, placed, bimg):
    """Point-accurate: probe each DOT-placed system's pixel against the band polygons; truth = JSON region."""
    n = ok = 0
    misses = []
    per = collections.defaultdict(lambda: [0, 0])
    for i, s in enumerate(systems):
        if placed[i]['precision'] != 'dot' or s['region'] not in REGION_TO_BAND:
            continue
        k = int(bimg[int(placed[i]['py']), int(placed[i]['px'])])
        want = regions.BAND_ORDER.index(REGION_TO_BAND[s['region']])
        n += 1
        per[s['region']][1] += 1
        if k == want:
            ok += 1
            per[s['region']][0] += 1
        else:
            misses.append({'name': s['name'], 'grid': s['grid'], 'json': s['region'], 'polygon': regions.BAND_ORDER[k] if k >= 0 else 'outside', 'bands_apart': abs(k - want) if k >= 0 else None})
    return n, ok, misses, {k: v for k, v in per.items()}


def main():
    t0 = time.time()
    img, sj = resolve_inputs(sys.argv)
    cat_path = sys.argv[3] if len(sys.argv) > 3 else os.path.join(DEFAULT_IMAGE_DIR, 'planets.json')
    im = load_image(img)
    assert im.shape[:2] == (4000, 4000), f'image is {im.shape}, expected 4000x4000'
    systems = json.load(open(sj))
    assert len(systems) == 6752, f'expected 6752 systems, got {len(systems)}'
    names_in = [s['name'] for s in systems]

    cal = calibrate.calibrate(im)
    tf = Transform(cal)
    rg = regions.extract(im)
    terr = regions.territories(im)
    gm = cv2.resize(rg['galaxy_mask'], (4000, 4000), interpolation=cv2.INTER_NEAREST)
    D = dots.detect(im, gm)
    n_raw = len(D)

    lines = ocr.run_ocr(im)
    labels = assign.match_labels(lines, systems, tf)
    M, _ = dots.bright_mask(im)
    D, split_report = assign.split_clusters(im, D, labels, M)
    D, asg, neb, rejected = assign.assign_dots(D, labels, systems, tf)

    # origin = Coruscant's dot
    cidx = [i for i, s in enumerate(systems) if s['name'] == 'Coruscant' and s['grid'] == CORUSCANT_CELL]
    assert len(cidx) == 1 and cidx[0] in asg, 'Coruscant dot was not assigned - cannot fix origin'
    cd = D[asg[cidx[0]]['dot']]
    tf.origin_px = (cd['px'], cd['py'])

    # catalogue (SWGalacticMap): cell derived from Coord only; X/Y ignored; sub-cell offset from SubGridX/Y
    cat = json.load(open(cat_path))
    cat_by = collections.defaultdict(list)
    for p in cat:
        cat_by[key(p['Name'])].append(p)

    placed = []
    cell_disagree = 0
    for i, s in enumerate(systems):
        x0, x1, y0, y1 = tf.cell_bounds(s['grid'])
        if i in asg:
            d = D[asg[i]['dot']]
            px, py, prec, src = d['px'], d['py'], 'dot', 'dk-map-dot'
        else:
            cands = cat_by.get(key(s['name']), [])
            same = [p for p in cands if p['Coord'] == s['grid']]
            if cands and not same:
                cell_disagree += 1
            if len(same) == 1:
                p = same[0]
                px, py = x0 + p['SubGridX'] * tf.pitch, y0 + p['SubGridY'] * tf.pitch
                prec, src = 'catalogue', 'swgalacticmap'
            else:
                px, py = tf.cell_centre_px(s['grid'])
                prec, src = 'cell', 'cell-centre'
        gx, gy = tf.to_galactic(px, py)
        placed.append({'px': px, 'py': py, 'x': gx, 'y': gy, 'precision': prec, 'source': src})

    # ---------------- invariants (fail loudly)
    out = []
    ids = set()
    margin = []
    for i, s in enumerate(systems):
        p = placed[i]
        rec = dict(s)
        rec['id'] = f"{slug(s['name'])}-{s['grid'].lower()}"
        assert rec['id'] not in ids, f"duplicate id {rec['id']}"
        ids.add(rec['id'])
        rec.update({'x': round(p['x'], 1), 'y': round(p['y'], 1), 'precision': p['precision'], 'source': p['source'],
                    'px': round(p['px'], 1), 'py': round(p['py'], 1)})
        x0, x1, y0, y1 = tf.cell_bounds(s['grid'])
        inside = x0 <= p['px'] <= x1 and y0 <= p['py'] <= y1
        in_bound = x0 - CELL_MARGIN_PX <= p['px'] <= x1 + CELL_MARGIN_PX and y0 - CELL_MARGIN_PX <= p['py'] <= y1 + CELL_MARGIN_PX
        assert in_bound, f"HARD FAILURE: {s['name']} ({s['grid']}) placed outside cell+{CELL_MARGIN_PX}px at {p['px']:.1f},{p['py']:.1f}"
        if not inside:
            margin.append({'id': rec['id'], 'name': s['name'], 'grid': s['grid'], 'precision': p['precision'],
                           'overshoot_px': round(max(x0 - p['px'], p['px'] - x1, y0 - p['py'], p['py'] - y1), 2)})
        out.append(rec)
    assert len(out) == 6752
    assert [r['name'] for r in out] == names_in, 'systems renamed or reordered'
    cor = out[cidx[0]]
    assert cor['x'] == 0 and cor['y'] == 0, 'Coruscant must be exactly 0,0'

    training = [(regions.BAND_ORDER.index(REGION_TO_BAND[systems[i]['region']]), D[a['dot']]['px'], D[a['dot']]['py'])
                for i, a in asg.items() if systems[i]['region'] in REGION_TO_BAND]
    rf = regions.refine_bands(im, rg, training)
    rg['bands'] = rf['bands']          # per-band polygons replace the nested ones
    bimg = band_image(rg)
    n_rv, ok_rv, misses, per_region = validate_regions(systems, placed, bimg)

    def conv(polys):
        return [{'ring': [[round(v, 1) for v in tf.to_galactic(x, y)] for x, y in p['ring']], 'hole': p['hole']} for p in polys]

    meta = {'convention': 'origin = Coruscant dot (0,0); +x right (toward col U); +y up (toward row 1); units light-years; 1 cell = 5000 ly',
            'calibration': cal, 'origin_px': [round(tf.origin_px[0], 2), round(tf.origin_px[1], 2)], 'ly_per_px': cal['ly_per_px'],
            'image_size_px': [4000, 4000], 'cell_margin_px': CELL_MARGIN_PX}
    os.makedirs(OUT_DIR, exist_ok=True)
    json.dump({'meta': meta, 'bands': {n: conv(b['polys']) for n, b in rg['bands'].items()},
               'galaxy_outline': conv(rg['outline']),
               'territories': {**{k: conv(v) for k, v in terr.items()}, 'Unknown Regions': None, 'Wild Space': None}},
              open(os.path.join(OUT_DIR, 'regions.json'), 'w'))
    json.dump(out, open(os.path.join(OUT_DIR, 'systems.json'), 'w'), indent=0)

    # ---------------- lane network by edge testing (evidence-only; see edges.py)
    wk_path = os.path.join(os.path.dirname(img), 'major_routes_wookieepedia.json')
    edge_report = edges.run_edge_stage(im, tf, D, asg, systems, out, rf['label'], lines, labels, cal, OUT_DIR, wk_path)

    prec = collections.Counter(r['precision'] for r in out)
    report = {
        'calibration': cal, 'origin_px': meta['origin_px'],
        'dots_raw': n_raw, 'dots_after_split': len(D) + len(neb), 'clusters_split': len(split_report), 'nebula_icons_dropped': len(neb),
        'dots_final': len(D), 'ocr_lines': len(lines), 'labels_matched': sum(1 for l in labels if l['match'] not in (None, 'NEB')),
        'precision': dict(prec), 'rejected_assignments': rejected, 'catalogue_cell_disagree_discarded': cell_disagree,
        'margin_cases': margin, 'split_report': split_report,
        'edge_network': edge_report,
        'region_validation': {'dots_tested': n_rv, 'agree_resubstitution': ok_rv, 'pct_resubstitution': round(100 * ok_rv / n_rv, 1),
                              'cv_holdout_pct': rf['cv_pct'], 'cv_holdout_two_apart': rf['cv_two_apart'], 'per_region': per_region,
                              'outside_every_band': [m for m in misses if m['polygon'] == 'outside'],
                              'misses': misses, 'two_or_more_bands_apart': [m for m in misses if m['bands_apart'] and m['bands_apart'] >= 2]},
    }
    json.dump(report, open(os.path.join(OUT_DIR, 'report.json'), 'w'), indent=1)
    print(json.dumps({k: v for k, v in report.items() if k not in ('rejected_assignments', 'margin_cases', 'split_report', 'calibration', 'region_validation', 'edge_network')}, indent=1)[:1500])
    print('done in', round(time.time() - t0), 's')
    return im, tf, D, asg, systems, out, rg


if __name__ == '__main__':
    main()
