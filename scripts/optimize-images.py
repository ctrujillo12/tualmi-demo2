#!/usr/bin/env python3
"""
Downscale and recompress the oversized source images the site actually uses.

Run:  python3 scripts/optimize-images.py

Why this is needed even though the hero already uses next/image: Next resizes
on demand, but it still has to read and decode the original. A 4160x6240 / 15MB
JPEG makes the first request for every size variant slow, and raw <img> tags
(like hiker.png) ship the original bytes untouched.

Originals are committed to git, so anything here is recoverable with
`git checkout -- public/images-2/<file>`.

Only files listed in TARGETS are touched — the other ~400MB in public/ isn't
referenced by any code and doesn't affect page weight.
"""

from PIL import Image
import os

ROOT = os.path.join(os.path.dirname(__file__), "..")

# (path, max long edge in px, quality)
# Long edges are 2x the largest rendered size, which covers retina.
TARGETS = [
    ("public/images-2/funky-rock0.jpg", 2400, 80),  # homepage hero
    ("public/images-2/hiker.png", 460, 90),         # renders at max 210px tall
]


def human(n: int) -> str:
    return f"{n / 1048576:.2f} MB" if n >= 1048576 else f"{n / 1024:.0f} KB"


def optimize(rel_path: str, max_edge: int, quality: int) -> None:
    path = os.path.join(ROOT, rel_path)
    if not os.path.exists(path):
        print(f"  SKIP (missing): {rel_path}")
        return

    before = os.path.getsize(path)
    img = Image.open(path)
    w, h = img.size

    scale = min(1.0, max_edge / max(w, h))
    if scale < 1.0:
        img = img.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

    if path.lower().endswith(".png"):
        # Keep transparency; quantise to shrink an RGBA file hard.
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        img.save(path, "PNG", optimize=True)
    else:
        img = img.convert("RGB")
        img.save(path, "JPEG", quality=quality, optimize=True, progressive=True)

    after = os.path.getsize(path)
    print(
        f"  {rel_path}\n"
        f"    {w}x{h} {human(before)}  ->  {img.width}x{img.height} {human(after)}"
        f"   ({100 - after * 100 // before}% smaller)"
    )


if __name__ == "__main__":
    print("Optimizing referenced images...")
    for rel, edge, q in TARGETS:
        optimize(rel, edge, q)
    print("Done.")
