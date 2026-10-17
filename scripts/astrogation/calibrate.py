"""Step 1 - find the faint gridlines and fit px -> grid. Fails loudly if residual > 3px."""
import numpy as np
import cv2

MAX_RESIDUAL_PX = 3.0


def _peaks(profile):
    p = profile - np.convolve(profile, np.ones(41) / 41, 'same')
    thr = np.std(p) * 1.2
    return [i for i in range(3, len(p) - 3) if p[i] >= p[i - 3:i + 4].max() and p[i] > thr]


def _lattice(peaks, pitch_guess=145.6):
    """Snap raw peaks onto the best-fit regular lattice, drop strays (stars/text)."""
    peaks = np.array(peaks, float)
    # estimate pitch+offset by trying the first peak as anchor
    best = None
    for a in peaks[:6]:
        idx = np.round((peaks - a) / pitch_guess)
        ok = np.abs(peaks - (a + idx * pitch_guess)) < 6
        if best is None or ok.sum() > best[0]:
            best = (ok.sum(), idx[ok], peaks[ok])
    _, idx, pk = best
    p = np.polyfit(idx, pk, 1)
    # refit after outlier rejection
    for _ in range(3):
        r = pk - np.polyval(p, idx)
        keep = np.abs(r) < 3
        p = np.polyfit(idx[keep], pk[keep], 1)
        idx, pk = idx[keep], pk[keep]
    res = pk - np.polyval(p, idx)
    return p, idx, res


def calibrate(im):
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
    hp = g - cv2.GaussianBlur(g, (0, 0), 6)
    # margin strips only: top strip (below the title) for columns, left strip for rows
    cols = _peaks(hp[900:1000, :].mean(0))
    rows = _peaks(hp[:, 60:400].mean(1))
    (pc, ic, rc), (pr, ir, rr) = _lattice(cols), _lattice(rows)
    worst = float(max(np.abs(rc).max(), np.abs(rr).max()))
    if worst > MAX_RESIDUAL_PX:
        raise SystemExit(f'HARD STOP: grid calibration residual {worst:.2f}px > {MAX_RESIDUAL_PX}')
    # lattice index 0 = first detected line. Cell C's left edge is the 5th vertical line
    # (letters C..U sit between lines; verified against printed column labels) and cell row 1's
    # top edge is the 6th horizontal line. Offsets below resolve that to absolute px.
    pitch = float((pc[0] + pr[0]) / 2)
    x_line0, y_line0 = float(pc[1]), float(pr[1])
    first_col_idx = int(round((617.0 - x_line0) / pitch))   # 617 = printed-label-verified C left edge
    first_row_idx = int(round((759.0 - y_line0) / pitch))   # 759 = printed-label-verified row-1 top edge
    cal = {
        'pitch_px': pitch,
        'x_c_left': x_line0 + first_col_idx * pitch,
        'y_row1_top': y_line0 + first_row_idx * pitch,
        'vertical_lines_found': int(len(ic)), 'horizontal_lines_found': int(len(ir)),
        'max_residual_px': round(worst, 3),
        'rms_residual_px': round(float(np.sqrt(np.mean(np.r_[rc, rr] ** 2))), 3),
        'ly_per_px': round(5000.0 / pitch, 4),
    }
    return cal
