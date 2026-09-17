#!/usr/bin/env python3
"""
Measure where the model stands in each card's lead photo.

Prints the PRODUCT_CARD_SUBJECT block for src/lib/productColors.ts. Paste the
output over the existing one when a lead photo changes.

    python3 scripts/measure-card-framing.py

WHY THIS EXISTS
The studio set is not framed to a common scale -- the model fills 87% of
birch-front-1 and 73% of olive-front-1 -- so two colourways side by side in a
recommendation row showed the same garment at two different sizes. The cards
correct for it by scaling each photo, and this is what they scale from. See the
comment above PRODUCT_CARD_SUBJECT in src/lib/productColors.ts.

HOW IT MEASURES
Every frame in the set is one subject on white paper, so the model is simply
"the pixels that are not paper". Any row with more than a handful of non-white
pixels is part of her; the first and last such rows are her top and bottom. The
threshold sits at 238/255 so that paper with a little falloff at the edges of
the sweep still counts as paper, while the palest garment -- Birch -- does not.

The speck filter (a row needs more than 0.4% of the width to count) is what
keeps a stray sensor pixel or a fleck of dust on the sweep from reporting the
model as a foot taller than she is.

Only the LEAD photo of each colourway is measured, because only the lead photo
is what a card shows. Everything else in the gallery is cropped by the page
itself and never needs this.
"""

import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("This needs Pillow:  pip install pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTOS = os.path.join(ROOT, "public", "images-2", "reedited-photos", "Highlights")

# Keep in step with the first entry of each colourway in PRODUCT_COLOR_IMAGES
# (src/lib/productColors.ts). A card shows that photo, so that is the one to
# measure.
LEADS = [
    ("sierra-shorts", "Jam",      "jam-front-5.jpg"),
    ("sierra-shorts", "Picnic",   "picnic-front-1.jpg"),
    ("sierra-shorts", "Confetti", "confetti-front-1.jpg"),
    ("juniper-pant",  "Birch",    "birch-front-1.jpg"),
    ("juniper-pant",  "Olive",    "olive-front-1.jpg"),
]

PAPER = 238          # per channel; above this on all three is "white paper"
SPECK = 0.004        # a row needs this share of the width to count as subject


def subject_box(path):
    """Return (top, bottom) as fractions of the frame height."""
    im = Image.open(path).convert("L")
    w, h = im.size
    px = im.load()
    need = max(3, int(w * SPECK))

    def is_subject_row(y):
        count = 0
        for x in range(0, w, 2):          # every other column: 2x faster, same answer
            if px[x, y] < PAPER:
                count += 2
                if count > need:
                    return True
        return False

    top = next((y for y in range(h) if is_subject_row(y)), None)
    if top is None:
        raise ValueError("no subject found -- is this frame blank?")
    bottom = next(y for y in range(h - 1, -1, -1) if is_subject_row(y))
    return top / h, bottom / h


def main():
    by_handle = {}
    report = []
    for handle, color, filename in LEADS:
        path = os.path.join(PHOTOS, filename)
        if not os.path.exists(path):
            sys.exit(f"missing: {path}")
        top, bottom = subject_box(path)
        by_handle.setdefault(handle, []).append((color, top, bottom))
        report.append((color, filename, (bottom - top) * 100))

    print("# measured\n")
    for color, filename, pct in report:
        print(f"#   {color:9} {filename:22} model fills {pct:5.1f}% of the frame")

    width = max(len(c) for _, rows in by_handle.items() for c, _, _ in rows) + 2
    print("\nexport const PRODUCT_CARD_SUBJECT: "
          "Record<string, Record<string, SubjectBox>> = {")
    for handle, rows in by_handle.items():
        print(f"  '{handle}': {{")
        for color, top, bottom in rows:
            label = (color + ":").ljust(width)
            print(f"    {label}{{ top: {top:.4f}, bottom: {bottom:.4f} }},")
        print("  },")
    print("};")


if __name__ == "__main__":
    main()
