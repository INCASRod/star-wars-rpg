#!/usr/bin/env python3
"""
convert-equipment-images.py

Converts equipment illustrations in public/images/equipment/ from
ink-on-paper to white-ink-on-transparent, so the SVG/CSS layer can tint them
per theme (var(--hud-accent) etc).

Algorithm (settled -- do not substitute a different curve):
  luminance = 0.2126*R + 0.7152*G + 0.0722*B   (0..1)
  darkness  = 1 - luminance
  alpha     = clamp((darkness - (THRESH - SOFT)) / SOFT, 0, 1)
  alpha    *= (original_alpha > 0)
  output RGB = pure white (255,255,255), output A = alpha

This produces hard-thresholded solid white ink with a narrow antialias ramp
at the edge. A graduated/gamma alpha curve was tried and rejected: it made
legibility depend on the darkness of whatever background sat behind it.

Behaviour:
  - Converts public/images/equipment/*.png IN PLACE. The untouched originals
    remain in oggdude/DataCustom/EquipmentImages (the source
    scripts/process-images.ts copies from), so this is re-runnable from
    scratch if ever needed. Refuses to run if that source directory is
    missing or has a suspiciously low file count vs. the destination.
  - Skips files already converted (already-converted := no fully-opaque
    non-white pixel remains -- i.e. every opaque pixel is pure white).
  - Quarantines photographic sources (detected by high opaque-pixel
    coverage vs. line art's low coverage) into public/images/equipment/photographic/
    instead of converting them. Nothing is deleted.
  - Emits a contact sheet (grid of every converted image on a dark
    background, filename below each) to a path OUTSIDE public/.
  - --dry-run reports per-file what would happen and writes nothing.

Usage:
  python scripts/convert-equipment-images.py --dry-run
  python scripts/convert-equipment-images.py
"""

import argparse
import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
EQUIPMENT_DIR = ROOT / "public" / "images" / "equipment"
SOURCE_DIR = ROOT / "oggdude" / "DataCustom" / "EquipmentImages"
QUARANTINE_DIR = EQUIPMENT_DIR / "photographic"
CONTACT_SHEET_PATH = ROOT / "scratch" / "equipment-icons-contact-sheet.png"

DEFAULT_THRESH = 0.30
DEFAULT_SOFT = 0.14

# Photographic-source detection: empirically calibrated against this actual
# image set (see docs/architecture.md for the calibration notes). These
# source PNGs are NOT alpha-masked line art with transparent backgrounds --
# nearly all are fully opaque (baked-in paper/studio background), so opaque
# pixel coverage cannot distinguish photo vs. line art here (an earlier
# version of this script tried that and mis-flagged ~97% of files).
# Instead: a photograph/3D-render has a broad luminance midtone band
# (shading/gradients) and/or real color saturation (colored studio
# backgrounds, skin tones, materials); flat ink line art is near-bimodal
# (paper-white / ink-black) with little saturation. Verified by eyeballing
# samples across the full midtone_frac/avg_sat range before picking these
# cutoffs -- neither signal alone is sufficient (a grayscale photo on a
# colored background can have low midtone_frac but high saturation, and vice
# versa), hence the OR.
PHOTO_MIDTONE_FRAC_THRESHOLD = 0.46
PHOTO_SATURATION_THRESHOLD = 0.30
# Luminance band that counts as "midtone" (i.e. not near-paper-white or
# near-ink-black).
MIDTONE_LUM_LO = 0.15
MIDTONE_LUM_HI = 0.85

# gear-BEAST* is a known exception the pixel heuristic above cannot catch:
# manually inspected a sample spanning nearly the full midtone/saturation
# range within this prefix (BEASTHORSE, BEASTDEWBACK, BEASTLAVAFLEA) and all
# three are painted/rendered creature portraits, not line art -- yet their
# pixel stats land inside the same range as legitimate line art (e.g.
# gear-RIBRACK, weapon-CSPL12GREN), so no pixel threshold can separate this
# category without also false-positiving on real line art elsewhere. This is
# a narrow, visually-verified filename exception, not a stat-based rule.
# armor-BEASTHIDE is NOT included -- confirmed by inspection to be genuine
# line art despite the "BEAST" substring.
FORCE_QUARANTINE_PREFIXES = ("gear-BEAST",)

# Individually visually-verified misses found during manual contact-sheet
# review (dark-clothed/desaturated studio photography lands inside the same
# midtone/saturation range as legitimate shaded line art -- no global
# threshold separates this specific case without also false-positiving on
# real line art). Add further confirmed misses here as they're found.
FORCE_QUARANTINE_EXACT = {"armor-ALLIANCELTSTEALTH.png"}


def luminance(r, g, b):
    return 0.2126 * (r / 255.0) + 0.7152 * (g / 255.0) + 0.0722 * (b / 255.0)


def clamp(v, lo=0.0, hi=1.0):
    return max(lo, min(hi, v))


def is_photographic(im: Image.Image, mid_thresh: float, sat_thresh: float) -> bool:
    """Broad midtone band and/or real saturation => photo/render, not line art."""
    px = im.load()
    w, h = im.size
    mid = 0
    sat_sum = 0.0
    total = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            total += 1
            l = luminance(r, g, b)
            if MIDTONE_LUM_LO < l < MIDTONE_LUM_HI:
                mid += 1
            mx, mn = max(r, g, b), min(r, g, b)
            sat_sum += 0.0 if mx == 0 else (mx - mn) / mx
    if total == 0:
        return False
    midtone_frac = mid / total
    avg_sat = sat_sum / total
    return midtone_frac >= mid_thresh or avg_sat >= sat_thresh


def is_already_converted(im: Image.Image) -> bool:
    """Already-converted := every opaque pixel is pure white."""
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if not (r == 255 and g == 255 and b == 255):
                return False
    # No opaque non-white pixel found -- either fully transparent (nothing
    # to convert) or already pure white ink. Either way, nothing to do.
    return True


def convert_pixels(im: Image.Image, thresh: float, soft: float) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    out = Image.new("RGBA", (w, h))
    out_px = out.load()
    lo = thresh - soft
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                out_px[x, y] = (255, 255, 255, 0)
                continue
            darkness = 1.0 - luminance(r, g, b)
            alpha = clamp((darkness - lo) / soft)
            out_a = int(round(alpha * 255)) if a > 0 else 0
            out_px[x, y] = (255, 255, 255, out_a)
    return out


def build_contact_sheet(entries, cell_size=140, cols=12):
    """entries: list of (filename, PIL.Image RGBA) already converted."""
    if not entries:
        return None
    rows = (len(entries) + cols - 1) // cols
    pad = 10
    label_h = 22
    cell_w = cell_size + pad
    cell_h = cell_size + label_h + pad
    sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), (24, 24, 28))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None

    for i, (name, im) in enumerate(entries):
        col = i % cols
        row = i // cols
        thumb = im.copy()
        thumb.thumbnail((cell_size, cell_size))
        # Composite onto a mid-gray tile so white ink is visible.
        tile = Image.new("RGBA", (cell_size, cell_size), (60, 60, 66, 255))
        ox = (cell_size - thumb.width) // 2
        oy = (cell_size - thumb.height) // 2
        tile.paste(thumb, (ox, oy), thumb)
        x0 = col * cell_w + pad // 2
        y0 = row * cell_h + pad // 2
        sheet.paste(tile.convert("RGB"), (x0, y0))
        label = name if len(name) <= 22 else name[:19] + "..."
        draw.text((x0, y0 + cell_size + 2), label, fill=(200, 200, 205), font=font)

    return sheet


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--thresh", type=float, default=DEFAULT_THRESH)
    parser.add_argument("--soft", type=float, default=DEFAULT_SOFT)
    parser.add_argument("--photo-midtone-thresh", type=float, default=PHOTO_MIDTONE_FRAC_THRESHOLD)
    parser.add_argument("--photo-sat-thresh", type=float, default=PHOTO_SATURATION_THRESHOLD)
    args = parser.parse_args()

    if not EQUIPMENT_DIR.is_dir():
        print(f"HARD STOP: {EQUIPMENT_DIR} does not exist.", file=sys.stderr)
        sys.exit(1)

    dest_files = [f for f in EQUIPMENT_DIR.iterdir() if f.suffix.lower() == ".png"]

    if not SOURCE_DIR.is_dir():
        print(f"HARD STOP: source directory {SOURCE_DIR} does not exist; "
              f"refusing to overwrite public/images/equipment/ without a "
              f"recoverable source.", file=sys.stderr)
        sys.exit(1)

    source_files = [f for f in SOURCE_DIR.iterdir() if f.suffix.lower() == ".png"]
    if len(source_files) < len(dest_files) * 0.9:
        print(f"HARD STOP: source dir has {len(source_files)} PNGs, "
              f"destination has {len(dest_files)} -- source count is "
              f"suspiciously low relative to destination. Refusing to "
              f"overwrite without a recoverable source.", file=sys.stderr)
        sys.exit(1)

    print(f"{'DRY RUN -- ' if args.dry_run else ''}"
          f"Converting {len(dest_files)} files in {EQUIPMENT_DIR} "
          f"(thresh={args.thresh}, soft={args.soft})")
    print(f"Source (originals, untouched): {SOURCE_DIR} ({len(source_files)} files)")

    if not args.dry_run:
        QUARANTINE_DIR.mkdir(exist_ok=True)

    converted_count = 0
    skipped_count = 0
    quarantined_count = 0
    contact_entries = []

    for f in sorted(dest_files):
        try:
            im = Image.open(f)
        except Exception as e:
            print(f"  ! {f.name}: failed to open ({e}), skipping")
            continue
        im = im.convert("RGBA")

        if is_already_converted(im):
            skipped_count += 1
            print(f"  = {f.name} (already converted, skipped)")
            contact_entries.append((f.name, im))
            continue

        forced = f.name.startswith(FORCE_QUARANTINE_PREFIXES) or f.name in FORCE_QUARANTINE_EXACT
        if forced or is_photographic(im, args.photo_midtone_thresh, args.photo_sat_thresh):
            quarantined_count += 1
            dest = QUARANTINE_DIR / f.name
            reason = "manual override (known non-line-art)" if forced else "photographic detector"
            print(f"  Q {f.name} -> photographic/ (quarantined, not converted -- {reason})")
            if not args.dry_run:
                f.rename(dest)
            continue

        converted = convert_pixels(im, args.thresh, args.soft)
        converted_count += 1
        print(f"  + {f.name} (converted)")
        if not args.dry_run:
            converted.save(f)
        contact_entries.append((f.name, converted))

    print(f"\nTotals: converted={converted_count} skipped={skipped_count} "
          f"quarantined={quarantined_count}")

    if not args.dry_run:
        sheet = build_contact_sheet(contact_entries)
        if sheet:
            CONTACT_SHEET_PATH.parent.mkdir(parents=True, exist_ok=True)
            sheet.save(CONTACT_SHEET_PATH)
            print(f"Contact sheet written to {CONTACT_SHEET_PATH}")
    else:
        print("(dry run -- no contact sheet written, no files moved or overwritten)")


if __name__ == "__main__":
    main()
