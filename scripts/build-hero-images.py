#!/usr/bin/env python3
"""
Build the responsive AVIF/WebP files the hero actually serves.

Run after replacing any .jpg in public/images-2/hero/:

    python3 scripts/build-hero-images.py

WHY
The hero is a <picture> with a different CROP per breakpoint, which next/image
cannot express -- it serves one source at every width. So the hero opted out of
next/image entirely and, with it, out of the AVIF/WebP conversion and the
responsive widths that every product photo on the site gets for free. A phone
downloaded the same 1440px 554KB JPEG as a tablet in order to paint it about
780px wide.

This puts both back without giving up the crops. Pre-built rather than resized
on demand, because the desktop hero is the page's LCP and the first visitor
after a deploy should not be the one waiting for it to be encoded.

The originals stay exactly where they are and stay the fallback, so a browser
with neither format still gets a hero, and `git checkout -- public/images-2/hero`
still undoes anything.

KEEPING IT HONEST
WIDE_WIDTHS and TALL_WIDTHS are duplicated in src/components/HeroCarousel.tsx,
because the component has to write the same numbers into its srcset. This
script reads that file and fails if the two lists have drifted apart -- a
mismatch would mean the markup pointing at files that do not exist, which is a
broken hero and no error anywhere.
"""

import os
import re
import sys

try:
    from PIL import Image, features
except ImportError:
    sys.exit("This needs Pillow:  pip install pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERO = os.path.join(ROOT, "public", "images-2", "hero")
OPT = os.path.join(HERO, "opt")
COMPONENT = os.path.join(ROOT, "src", "components", "HeroCarousel.tsx")

# The desktop crop is landscape and runs the full width of a big screen; the
# phone crop is portrait and never needs more than a tall phone at 3x.
WIDE_WIDTHS = [1280, 1600, 1920, 2560]
TALL_WIDTHS = [640, 828, 1080, 1440]

# AVIF at 55 and WebP at 78 are visually indistinguishable from the source at
# hero size -- this is a photo behind a dark scrim and a headline, not a
# garment detail shot someone is inspecting.
AVIF_Q = 55
WEBP_Q = 78

SOURCES = [
    ("pants-wide.jpg",  WIDE_WIDTHS),
    ("shorts-wide.jpg", WIDE_WIDTHS),
    ("pants-tall.jpg",  TALL_WIDTHS),
    ("shorts-tall.jpg", TALL_WIDTHS),
]


def check_component_widths():
    """Fail loudly if the component's width lists no longer match this one."""
    try:
        src = open(COMPONENT, encoding="utf-8").read()
    except OSError:
        print("! could not read HeroCarousel.tsx -- skipping the width check")
        return
    for name, expected in (("WIDE_WIDTHS", WIDE_WIDTHS), ("TALL_WIDTHS", TALL_WIDTHS)):
        m = re.search(rf"const {name} = \[([0-9,\s]+)\]", src)
        if not m:
            sys.exit(f"{name} not found in HeroCarousel.tsx -- did it get renamed?")
        found = [int(n) for n in m.group(1).replace(" ", "").split(",") if n]
        if found != expected:
            sys.exit(
                f"{name} disagrees.\n"
                f"  HeroCarousel.tsx: {found}\n"
                f"  this script:      {expected}\n"
                "Make them the same and re-run."
            )


def main():
    if not features.check("avif"):
        sys.exit("Pillow has no AVIF support:  pip install --upgrade pillow")

    check_component_widths()
    os.makedirs(OPT, exist_ok=True)

    total = 0
    for filename, widths in SOURCES:
        path = os.path.join(HERO, filename)
        if not os.path.exists(path):
            sys.exit(f"missing source: {path}")

        im = Image.open(path).convert("RGB")
        w0, h0 = im.size
        stem = filename[: -len(".jpg")]
        origin = os.path.getsize(path) / 1024
        print(f"\n{filename}  {w0}x{h0}  {origin:.0f}KB")

        for w in widths:
            if w > w0:
                # Upscaling invents detail and costs bytes for it. Better to
                # let the browser pick the next size down.
                print(f"  {w:5}  skipped -- wider than the source")
                continue
            resized = im.resize((w, round(h0 * w / w0)), Image.LANCZOS)
            line = f"  {w:5}"
            for ext, kwargs in (
                ("avif", dict(quality=AVIF_Q)),
                ("webp", dict(quality=WEBP_Q, method=6)),
            ):
                out = os.path.join(OPT, f"{stem}-{w}.{ext}")
                resized.save(out, ext.upper(), **kwargs)
                size = os.path.getsize(out) / 1024
                total += size
                line += f"  {ext} {size:6.0f}KB"
            print(line)

    print(f"\nwrote {total / 1024:.1f}MB into public/images-2/hero/opt/")


if __name__ == "__main__":
    main()
