"""Colour gate: a ridge pixel counts as LANE only if it is near-white (low saturation, high value) on the ORIGINAL image.
Lanes are near-white; band outlines are saturated yellow/orange/pink. Both thresholds are DERIVED, at run time, from
hand-labelled samples, never hand-tuned:
  * 50 px of known lane in the open            (10 spots x 5 px)
  * 50 px of known lane in LABEL SHADOW        (10 spots x 5 px) - lanes run under printed names and are darker there
  * 50 px of known band outline                (10 spots x 5 px)

Spots were picked by eye on gridded native-resolution crops (evidence/colour_gate_samples.png shows every sampled pixel).
Open-lane and outline spots are >= 10 px clear of every dot and label stroke. Shaded-lane spots are on the grey strip a lane
leaves beneath a label's drop shadow (the Core lane under "Fedalle"/"Aargau"/"Cerberon", and under "Trellen"). A spot is the
local lane/outline centre; the 5 pixels are
  lane    : 5 px along the local ridge direction through the spot centre
  outline : the 5 most saturated pixels in the 5x5 window around the spot centre (the outline is only ~3 px wide)
"""
import json
import os

import cv2
import numpy as np

LANE_SPOTS = [(1952, 2065), (1976, 2071), (2103, 2117), (2125, 2233), (2131, 2251),
              (2145, 2172), (2088, 2102), (2154, 2190), (1957, 2044), (2147, 2101)]
LANE_SHADE_SPOTS = [(2043, 2106), (2048, 2109), (2078, 2136), (2069, 2129), (2073, 2134),
                    (2087, 2154), (2091, 2158), (2115, 2205), (2052, 2109)]
OUTLINE_SPOTS = [(1955, 2094), (2101, 2228), (2105, 2252), (1748, 2305), (1759, 2335),
                 (1772, 2365), (1784, 2385), (1803, 2405), (1847, 2435), (1925, 2092)]


def hsv_of(im):
    return cv2.cvtColor(im, cv2.COLOR_BGR2HSV).astype(np.float32)      # H 0-179, S 0-255, V 0-255


def _lane_line(ori, spots):
    out = []
    for (x, y) in spots:
        th = float(ori[y, x])
        d = np.array([np.cos(th), np.sin(th)])
        out += [(int(round(x + k * d[0])), int(round(y + k * d[1]))) for k in (-2, -1, 0, 1, 2)]
    return out


def sample_pixels(im, ori):
    """-> (open-lane px, shaded-lane px, outline px), each a list of (x, y)."""
    S = hsv_of(im)[..., 1]
    lane = _lane_line(ori, LANE_SPOTS)
    shade = _lane_line(ori, LANE_SHADE_SPOTS)
    outl = []
    for (x, y) in OUTLINE_SPOTS:
        win = [(x + dx, y + dy) for dy in range(-2, 3) for dx in range(-2, 3)]
        outl += sorted(win, key=lambda q: -S[q[1], q[0]])[:5]
    shade = [p for p in dict.fromkeys(shade) if p not in set(lane)]          # a pixel is only ever one sample
    assert len(set(lane)) == 50 and len(set(outl)) == 50 and len(shade) >= 40, \
        f'colour-gate sample counts: lane {len(set(lane))}, shade {len(shade)}, outline {len(set(outl))}'
    return lane, shade, outl


def derive(im, ori):
    """-> dict with S_max, V_min and the evidence they came from.
    S_max = midpoint between the most saturated lane sample (open or shaded) and the least saturated outline sample (the classes
            must not overlap).
    V_min = the lowest V over ALL samples (open lane, shaded lane, outline), rounded down to a multiple of 5. The shaded lane is
            what sets it: value separates lanes from dark shadow edges, not from outlines."""
    hsv = hsv_of(im)
    lane, shade, outl = sample_pixels(im, ori)
    S = lambda pts: np.array([hsv[y, x, 1] for x, y in pts])
    V = lambda pts: np.array([hsv[y, x, 2] for x, y in pts])
    lane_all = lane + shade
    assert S(lane_all).max() < S(outl).min(), f'lane/outline saturation overlap: lane max {S(lane_all).max()}, outline min {S(outl).min()}'
    s_max = int(round((S(lane_all).max() + S(outl).min()) / 2))
    v_min = int(np.floor(min(V(lane).min(), V(shade).min(), V(outl).min()) / 5) * 5)
    v_min_derived = v_min
    if os.environ.get('ASTRO_V_MIN'):                       # sensitivity runs only; unset = derived from the samples
        v_min = int(os.environ['ASTRO_V_MIN'])
    pct = lambda a: [int(v) for v in np.percentile(a, [0, 5, 50, 95, 100])]
    return {'S_max': s_max, 'V_min': v_min, 'V_min_derived': v_min_derived,
            'lane_open': {'n': len(lane), 'spots': LANE_SPOTS, 'S_pct_0_5_50_95_100': pct(S(lane)), 'V_pct_0_5_50_95_100': pct(V(lane))},
            'lane_shaded': {'n': len(shade), 'spots': LANE_SHADE_SPOTS, 'S_pct_0_5_50_95_100': pct(S(shade)), 'V_pct_0_5_50_95_100': pct(V(shade))},
            'outline': {'n': len(outl), 'spots': OUTLINE_SPOTS, 'S_pct_0_5_50_95_100': pct(S(outl)), 'V_pct_0_5_50_95_100': pct(V(outl))},
            'lane_pixels': lane, 'shade_pixels': shade, 'outline_pixels': outl}


def gate_map(im, cg):
    hsv = hsv_of(im)
    return (hsv[..., 1] <= cg['S_max']) & (hsv[..., 2] >= cg['V_min'])


def render_samples(im, cg, path):
    """evidence image: the sample regions, native pixels x4; open lane green, shaded lane cyan, outline magenta."""
    tiles = []
    for (x0, y0, x1, y1) in ((1925, 2040, 2175, 2290), (1700, 2300, 1950, 2550)):
        c = cv2.resize(im[y0:y1, x0:x1], None, fx=4, fy=4, interpolation=cv2.INTER_CUBIC)
        for pts, col in ((cg['lane_pixels'], (0, 255, 0)), (cg['shade_pixels'], (255, 255, 0)), (cg['outline_pixels'], (255, 0, 255))):
            for (x, y) in pts:
                if x0 <= x < x1 and y0 <= y < y1:
                    cv2.circle(c, ((x - x0) * 4 + 2, (y - y0) * 4 + 2), 3, col, -1)
        tiles.append(c)
    cv2.imwrite(path, np.hstack(tiles))


def write_json(cg, path):
    out = {k: v for k, v in cg.items() if k not in ('lane_pixels', 'shade_pixels', 'outline_pixels')}
    out['lane_pixels'] = [list(p) for p in cg['lane_pixels']]
    out['shade_pixels'] = [list(p) for p in cg['shade_pixels']]
    out['outline_pixels'] = [list(p) for p in cg['outline_pixels']]
    json.dump(out, open(path, 'w'), indent=1)
