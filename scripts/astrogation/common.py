"""Shared constants + pixel<->galactic transform for the astrogation extraction."""
import json, os, sys
import cv2
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT_DIR = os.path.join(ROOT, 'data', 'astrogation')
DEFAULT_IMAGE_DIR = os.path.join(ROOT, 'private')
CELL_LY = 5000.0
COLS = 'CDEFGHIJKLMNOPQRSTU'   # 19 columns, left->right
ROWS = 21                      # rows 1..21, top->bottom
CORUSCANT_CELL = 'L-9'
# A dot centre may sit this many px outside its assigned cell (dots have radius,
# labels sit beside them). Beyond this = cross-cell misassignment = hard failure.
CELL_MARGIN_PX = 8.0


def load_image(path):
    im = cv2.imread(path)
    if im is None:
        sys.exit(f'cannot read image: {path}')
    return im


def resolve_inputs(argv):
    """image path + systems json path. Usage: run.py [image] [systems.json]"""
    img = argv[1] if len(argv) > 1 else None
    sysj = argv[2] if len(argv) > 2 else os.path.join(DEFAULT_IMAGE_DIR, 'galaxy_systems.json')
    if img is None:
        cands = [f for f in os.listdir(DEFAULT_IMAGE_DIR) if f.startswith('star_wars_galaxy_map') and f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if len(cands) != 1:
            sys.exit(f'pass the image path explicitly; found {cands}')
        img = os.path.join(DEFAULT_IMAGE_DIR, cands[0])
    return img, sysj


class Transform:
    """px -> galactic ly. Origin = Coruscant's dot (set once detected). +x right, +y up."""

    def __init__(self, cal, origin_px=None):
        self.cal = cal
        self.pitch = cal['pitch_px']
        self.ly_per_px = CELL_LY / self.pitch
        self.origin_px = origin_px  # (px, py) or None until Coruscant located

    def cell_bounds(self, grid):
        """(x0, x1, y0, y1) px bounds of a grid ref like 'L-9'."""
        col, row = grid.split('-')
        ci, ri = COLS.index(col), int(row) - 1
        x0 = self.cal['x_c_left'] + ci * self.pitch
        y0 = self.cal['y_row1_top'] + ri * self.pitch
        return x0, x0 + self.pitch, y0, y0 + self.pitch

    def cell_centre_px(self, grid):
        x0, x1, y0, y1 = self.cell_bounds(grid)
        return (x0 + x1) / 2, (y0 + y1) / 2

    def to_galactic(self, px, py):
        ox, oy = self.origin_px
        return (px - ox) * self.ly_per_px, -(py - oy) * self.ly_per_px

    def to_px(self, gx, gy):
        ox, oy = self.origin_px
        return gx / self.ly_per_px + ox, oy - gy / self.ly_per_px
