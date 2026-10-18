"""Build public/galaxy/ngc6217.webp, the Galaxy tab background.

ESA/Hubble heic0910s (NGC 6217), CC BY 4.0. Rotates the photo so its disc's long axis follows the planet cloud's
principal axis, scales it so the disc covers the cloud's bounding ellipse (+10%), centres the core on the output
image, and prints the numbers GalaxyMap's BG_CONFIG needs (map-unit width/height, cloud centroid).

Usage: python scripts/galaxy-bg.py <heic0910s.jpg> <ref_systems_xy.json>
  <ref_systems_xy.json> is a list of {x, y} rows from ref_systems (all 1220).
"""
import json
import sys

import numpy as np
from PIL import Image, ImageFilter

MARGIN = 1.10
MAX_PX = 2400
QUALITY = 70
COVER = 98  # percent of planets the disc must cover

src, xy_path = sys.argv[1], sys.argv[2]
out = 'public/galaxy/ngc6217.webp'

# --- planet cloud: centroid, principal axis, enclosing ellipse
pts = np.array([[p['x'], p['y']] for p in json.load(open(xy_path)) if p['x'] is not None])
centroid = pts.mean(0)
w, v = np.linalg.eigh(np.cov((pts - centroid).T))
cloud_axis = v[:, 1]  # major
cloud_deg = float(np.degrees(np.arctan2(cloud_axis[1], cloud_axis[0])))
local = (pts - centroid) @ v
sig = np.sqrt(w)
r = np.percentile(np.sqrt((local[:, 1] / sig[1]) ** 2 + (local[:, 0] / sig[0]) ** 2), COVER)  # outliers would inflate a strict max
ell_major, ell_minor = r * sig[1] * MARGIN, r * sig[0] * MARGIN

# --- photo: core and disc axis from a heavily blurred luminance (point stars wash out)
im = Image.open(src).convert('RGB')
lum = im.convert('L').resize((im.width // 4, im.height // 4)).filter(ImageFilter.GaussianBlur(6))
L = np.asarray(lum, dtype=float)
thr = L.max() * 0.22
ys, xs = np.nonzero(L > thr)
wts = L[ys, xs]
mx, my = np.average(xs, weights=wts), np.average(ys, weights=wts)
cov = np.cov(np.vstack([xs - mx, ys - my]), aweights=wts)
dw, dv = np.linalg.eigh(cov)
img_axis = dv[:, 1]
img_deg = float(np.degrees(np.arctan2(img_axis[1], img_axis[0])))
top = L >= np.percentile(L, 99.9)
ty, tx = np.nonzero(top)
core = (tx.mean() * 4, ty.mean() * 4)  # full-res px

# disc semi-axes (px, full-res) from the same mask
proj = np.vstack([xs - mx, ys - my]).T @ dv
disc_major = np.percentile(np.abs(proj[:, 1]), 99) * 4
disc_minor = np.percentile(np.abs(proj[:, 0]), 99) * 4

# --- rotate about the core so the disc axis lands on the cloud axis (smallest turn, axes are mod 180)
delta = (cloud_deg - img_deg + 90) % 180 - 90  # clockwise on screen
rot = im.rotate(-delta, resample=Image.BICUBIC, center=core, expand=False, fillcolor=(0, 0, 0))

# --- scale: map units per source px so the disc covers the ellipse
upp = max(ell_major / disc_major, ell_minor / disc_minor)

# --- crop symmetric about the core, then downscale to MAX_PX
half = min(core[0], core[1], im.width - core[0], im.height - core[1])
crop = rot.crop((int(core[0] - half), int(core[1] - half), int(core[0] + half), int(core[1] + half)))
f = min(1.0, MAX_PX / crop.width)
crop = crop.resize((round(crop.width * f), round(crop.height * f)), Image.LANCZOS)
crop.save(out, 'WEBP', quality=QUALITY, method=6)

import os
size_kb = os.path.getsize(out) / 1024
map_w = 2 * half * upp
print(json.dumps({
    'cloud_centroid': [round(float(centroid[0]), 1), round(float(centroid[1]), 1)],
    'cloud_axis_deg': round(cloud_deg, 2),
    'cloud_ellipse_semi_major_minor': [round(float(ell_major)), round(float(ell_minor))],
    'photo_axis_deg': round(img_deg, 2),
    'rotation_applied_deg_clockwise': round(float(delta), 2),
    'photo_core_px': [round(core[0]), round(core[1])],
    'disc_semi_major_minor_px': [round(float(disc_major)), round(float(disc_minor))],
    'map_units_per_source_px': round(float(upp), 3),
    'output_px': list(crop.size),
    'output_map_units': round(float(map_w)),
    'size_kb': round(size_kb, 1),
}, indent=2))
