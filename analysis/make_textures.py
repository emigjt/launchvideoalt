#!/usr/bin/env python3
"""Builds the background plates + grain tiles for the video from the poster (1.png).

- concrete plate: procedural mottled concrete (poster palette) + ornament detail
  (filigree / stars) lifted from the clean, type-free strips of the poster via a
  high-pass filter, stamped around the plate.
- ink plate: same ornament, printed faintly on the ink colour (for the drop inversion).
- grain tiles: 6 tileable noise tiles, swapped on hats.

Usage: python3 analysis/make_textures.py 1.png video/public/tex
"""
import os
import sys

import cv2
import numpy as np

src = sys.argv[1] if len(sys.argv) > 1 else "1.png"
out = sys.argv[2] if len(sys.argv) > 2 else "video/public/tex"
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(7)

poster = cv2.imread(src, cv2.IMREAD_GRAYSCALE).astype(np.float32)

# ------------------------------------------------------------- ornament patches
# Strips of the poster that contain only background (no type / marks).
clean = [
    (0, 0, 1080, 128),      # top band: stars + flowers (above "EVERY")
    (0, 330, 135, 1000),    # left margin below "EVERY": filigree + big stars
    (940, 120, 1080, 600),  # right margin
    (180, 935, 390, 1005),  # between VZN and the eye
]
details = []
for x0, y0, x1, y1 in clean:
    p = poster[y0:y1, x0:x1]
    hp = p - cv2.GaussianBlur(p, (0, 0), 14)           # ornament lines + stars
    hp = cv2.GaussianBlur(hp, (0, 0), 0.8)              # kill pixel grain, keep lines
    details.append(hp)

W, H = 1400, 2400  # oversized so scenes can drift / punch without showing edges


def fbm(h, w, octaves, base_sigma, seed):
    r = np.random.default_rng(seed)
    acc = np.zeros((h, w), np.float32)
    amp = 1.0
    for o in range(octaves):
        n = r.standard_normal((h, w)).astype(np.float32)
        s = base_sigma / (2 ** o)
        n = cv2.GaussianBlur(n, (0, 0), max(0.6, s))
        n /= n.std() + 1e-6
        acc += amp * n
        amp *= 0.55
    return acc / acc.std()


def stamp_ornaments(canvas, strength, n=26):
    for _ in range(n):
        d = details[rng.integers(len(details))]
        if rng.random() < 0.5:
            d = d[:, ::-1]
        if rng.random() < 0.3:
            d = d.T
        sc = rng.uniform(0.9, 1.6)
        d = cv2.resize(d, None, fx=sc, fy=sc)
        h, w = d.shape
        h, w = min(h, H), min(w, W)
        d = d[:h, :w]
        y = rng.integers(0, H - h + 1)
        x = rng.integers(0, W - w + 1)
        # feathered window so stamps blend
        wy = np.hanning(h)[:, None] ** 0.5
        wx = np.hanning(w)[None, :] ** 0.5
        canvas[y:y + h, x:x + w] += d * wy * wx * strength
    return canvas


def star(canvas, cx, cy, r, val, rot):
    pts = []
    for i in range(8):
        a = rot + i * np.pi / 4
        rr = r if i % 2 == 0 else r * 0.18
        pts.append([cx + rr * np.cos(a), cy + rr * np.sin(a)])
    pts = np.array(pts, np.int32)
    m = np.zeros_like(canvas)
    cv2.fillPoly(m, [pts], 1.0)
    m = cv2.GaussianBlur(m, (0, 0), 2.0)
    canvas[:] = canvas * (1 - m * 0.55) + val * m * 0.55


# ------------------------------------------------------------- concrete plate
mottle = fbm(H, W, 3, 120, 1) * 6 + fbm(H, W, 3, 6, 2) * 6
plate = np.full((H, W), 139.0, np.float32) + mottle   # lands on #928f8b after tint
plate = stamp_ornaments(plate, 1.35, n=34)
for _ in range(9):
    star(plate, rng.uniform(0, W), rng.uniform(0, H), rng.uniform(40, 120), 112.0, rng.uniform(0, np.pi))
plate += cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0, 0), 0.6) * 22      # baked fine grain
plate = np.clip(plate, 0, 255)
# warm-grey tint from the poster (R slightly > G > B)
rgb = np.stack([plate - 4.0, plate + 0.0, plate + 3.0], -1)  # BGR, warm grey
cv2.imwrite(os.path.join(out, "concrete.jpg"), np.clip(rgb, 0, 255).astype(np.uint8),
            [cv2.IMWRITE_JPEG_QUALITY, 92])

# ------------------------------------------------------------- ink plate
ink = np.full((H, W), 35.0, np.float32) + fbm(H, W, 4, 90, 3) * 3.5
ink = stamp_ornaments(ink, 0.32, n=18)
for _ in range(6):
    star(ink, rng.uniform(0, W), rng.uniform(0, H), rng.uniform(40, 120), 52.0, rng.uniform(0, np.pi))
ink += rng.standard_normal((H, W)).astype(np.float32) * 5
ink = np.clip(ink, 0, 255)
rgb = np.stack([ink - 1, ink - 0.5, ink + 0.5], -1)
cv2.imwrite(os.path.join(out, "ink.jpg"), np.clip(rgb, 0, 255).astype(np.uint8),
            [cv2.IMWRITE_JPEG_QUALITY, 92])

# ------------------------------------------------------------- grain tiles
# Grey-centred noise with a few bright/dark specks; used with mix-blend overlay.
for i in range(6):
    T = 512
    n = rng.standard_normal((T, T)).astype(np.float32)
    n = cv2.GaussianBlur(n, (0, 0), 0.7)
    n = n / n.std() * 34
    specks = (rng.random((T, T)) < 0.004) * rng.choice([-90, 90], (T, T))
    g = np.clip(128 + n + specks, 0, 255).astype(np.uint8)
    cv2.imwrite(os.path.join(out, f"grain{i}.png"), g)

print("wrote", sorted(os.listdir(out)))
