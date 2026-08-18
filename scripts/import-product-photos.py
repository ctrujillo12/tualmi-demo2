#!/usr/bin/env python3
"""
Import the product photoshoot into public/images-2/model/.

Run:  python3 scripts/import-product-photos.py

Source: the "Website Photos" folder (HEIC/PNG/JPG straight off a phone and
Facetune). Output: web-ready progressive JPEGs sized for ecommerce.

Sizing rationale — mobile first: the product gallery renders at 100vw on phones
and about 50vw on desktop. 1600px on the long edge covers a 3x-density phone
without shipping anything larger than needed. next/image resizes further per
device and serves AVIF/WebP on top of this, so these are the master files, not
what a visitor downloads.

Order matters: the first entry per colorway is the lead shot (clean full-body
front), followed by back, lifestyle, then detail crops. That order is mirrored
in src/lib/productColors.ts.
"""

from PIL import Image
import pillow_heif
import os

pillow_heif.register_heif_opener()  # lets PIL read .heic / .HEIC

ROOT = os.path.join(os.path.dirname(__file__), "..")
# The shoot folder. Defaults to where it lives in the repo; override with
# PHOTOS_SRC=/some/path when running from a machine that has it elsewhere.
SRC = os.environ.get(
    "PHOTOS_SRC",
    os.path.join(ROOT, "public", "images-2", "Website Photos"),
)
OUT = os.path.join(ROOT, "public", "images-2", "model")

# 2000px on the long edge → 1333px wide for a 2:3 portrait. The gallery is
# 100vw on phones, so a 430pt phone at 3x density asks for ~1290px — 1600px
# masters (1067 wide) were being upscaled by the browser on exactly the device
# most people shop on. These are master files: next/image resizes per device
# and serves AVIF/WebP on top, so a visitor never downloads this.
#
# Sources are NEVER upscaled. Anything below 2000px comes out at native size
# and is reported at the end of the run.
MAX_EDGE = 2000
QUALITY = 82

# destination stem -> (source folder, filename), in gallery order
#
# The shoot folder also contains older, lower-resolution duplicates of some of
# these colorways — "Jam - Sierra Shorts", "Picnic - Sierra Shorts",
# "Confetti - Sierra Shorts" and "Birch - Juniper Pants". Nothing below points
# at them on purpose. If you add a colorway, take it from the newer folders
# (the ones named by colour, plus "fixed photos").
PLAN = {
    # Sierra Shorts — Jam. Uses "fixed photos" (retouched) rather than the
    # raw "Red Shorts" folder; same six shots, cleaner grade.
    #
    # NOTE: these retouched exports are only 828x1242 — less than half the
    # resolution of every other colorway, and below what a modern phone
    # gallery asks for. Re-export them from the retouching app at full size
    # and Jam stops being the soft one. The raw "Red Shorts" folder has the
    # same frames at 3000px+ if you'd rather go back to those.
    "jam-1": ("fixed photos", "3.png"),
    "jam-2": ("fixed photos", "6.png"),
    "jam-3": ("fixed photos", "4.png"),
    "jam-4": ("fixed photos", "5.png"),
    "jam-5": ("fixed photos", "1.png"),
    "jam-6": ("fixed photos", "2.png"),

    # Sierra Shorts — Picnic (pink gingham).
    # Moved off the "Pink Shorts" HEICs onto the retouched "fixed photos"
    # exports, so all three shorts colourways now come from one graded set and
    # match each other. These are 2588x3881 — no resolution given up, unlike
    # Jam above. Order: full-body front, full-body side/back, side, back
    # detail, side detail.
    "picnic-1": ("fixed photos", "6 (1).png"),
    "picnic-2": ("fixed photos", "8.png"),
    "picnic-3": ("fixed photos", "10.png"),
    "picnic-4": ("fixed photos", "9.png"),
    "picnic-5": ("fixed photos", "7.png"),

    # Sierra Shorts — Confetti. Also moved onto "fixed photos".
    "confetti-1": ("fixed photos", "11.png"),
    "confetti-2": ("fixed photos", "12.png"),
    "confetti-3": ("fixed photos", "13.png"),
    "confetti-4": ("fixed photos", "14.png"),
    "confetti-5": ("fixed photos", "15.png"),

    # Juniper Pant — Birch (beige)
    "birch-1": ("Beige Pants", "Facetune_24-07-2026-21-57-29.HEIC"),
    "birch-2": ("Beige Pants", "Facetune_24-07-2026-21-58-38.heic"),
    "birch-3": ("Beige Pants", "Facetune_24-07-2026-21-59-24.HEIC"),
    "birch-4": ("Beige Pants", "Facetune_26-07-2026-12-56-41.heic"),
    "birch-5": ("Beige Pants", "Facetune_26-07-2026-13-38-27.heic"),
    "birch-6": ("Beige Pants", "A7402598.jpg"),
    "birch-7": ("Beige Pants", "A7402600.jpg"),

    # Juniper Pant — Olive (green)
    "olive-1": ("Green Pants", "2.png"),
    "olive-2": ("Green Pants", "1.png"),
    "olive-3": ("Green Pants", "3.png"),
    "olive-4": ("Green Pants", "4.png"),

    # Coming-soon teasers used elsewhere on the site
    "frolic-1": ("Fleece Coming Soon", "1.png"),
    "tioga-1": ("Top Coming Soon", "2.png"),
}

# ─── Lifestyle strip ────────────────────────────────────────────────────────
#
# The outdoor shots — trail, rocks, clothesline — that run in a small row under
# the description on the product page. Deliberately NOT in PLAN: they'd sit in
# the same gallery as the studio shots, and mixing a white-background product
# frame with a backlit hillside makes both look like mistakes.
#
# They render as ~150px thumbnails, so 1200px on the long edge is already
# generous (retina on the largest thumbnail) and keeps the whole strip near
# 150KB a photo instead of 250KB+.
LIFESTYLE_OUT = os.path.join(ROOT, "public", "images-2", "lifestyle")
LIFESTYLE_MAX_EDGE = 1200

LIFESTYLE_PLAN = {
    "jam-life-1": ("fixed photos/additional pics", "red 3.png"),
    "jam-life-2": ("fixed photos/additional pics", "red 4.png"),
    "jam-life-3": ("fixed photos/additional pics", "red 2.png"),
    "jam-life-4": ("fixed photos/additional pics", "red 1.png"),

    "picnic-life-1": ("fixed photos/additional pics", "pink 4.png"),
    "picnic-life-2": ("fixed photos/additional pics", "pink 3.png"),
    "picnic-life-3": ("fixed photos/additional pics", "pink 5.png"),
    "picnic-life-4": ("fixed photos/additional pics", "pink 6.png"),
    "picnic-life-5": ("fixed photos/additional pics", "pink 2.png"),
    "picnic-life-6": ("fixed photos/additional pics", "pink 1.png"),

    "confetti-life-1": ("fixed photos/additional pics", "confetti 3.png"),
    "confetti-life-2": ("fixed photos/additional pics", "confetti 5.png"),
    "confetti-life-3": ("fixed photos/additional pics", "confetti 4.png"),
    "confetti-life-4": ("fixed photos/additional pics", "confetti 2.png"),
    "confetti-life-5": ("fixed photos/additional pics", "confetti 6.png"),
    "confetti-life-6": ("fixed photos/additional pics", "confetti 1.png"),

    # Not used: "use this one for pink.png" / "use this one for red shorts.png".
    # They're byte-identical copies of one frame showing both colourways, which
    # makes them a hero candidate rather than a per-colourway strip photo.
    # Parked until there's a decision on where it goes.
}


def convert(src_path: str, dest_path: str, max_edge: int = MAX_EDGE) -> tuple[int, int, int]:
    img = Image.open(src_path)

    # Phone photos carry EXIF rotation; bake it in or portraits come out sideways.
    try:
        from PIL import ImageOps
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass

    # Flatten transparency onto white (PNG exports) before saving as JPEG.
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[-1])
        img = bg
    else:
        img = img.convert("RGB")

    w, h = img.size
    scale = min(1.0, max_edge / max(w, h))
    if scale < 1.0:
        img = img.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

    img.save(dest_path, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    return img.width, img.height, os.path.getsize(dest_path)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)

    # Clear the old shoot so nothing stale is left behind.
    removed = 0
    for f in os.listdir(OUT):
        if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            os.remove(os.path.join(OUT, f))
            removed += 1
    print(f"removed {removed} old photos from public/images-2/model/\n")

    total = 0
    missing = []
    for stem, (folder, fname) in PLAN.items():
        src = os.path.join(SRC, folder, fname)
        if not os.path.exists(src):
            missing.append(f"{folder}/{fname}")
            continue
        dest = os.path.join(OUT, f"{stem}.jpg")
        w, h, size = convert(src, dest)
        total += size
        print(f"  {stem}.jpg  {w}x{h}  {size // 1024} KB   <- {folder}/{fname}")

    print(f"\n{len(PLAN) - len(missing)} photos, {total / 1048576:.1f} MB total")

    # ── Lifestyle strip ──
    os.makedirs(LIFESTYLE_OUT, exist_ok=True)
    for f in os.listdir(LIFESTYLE_OUT):
        if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            os.remove(os.path.join(LIFESTYLE_OUT, f))

    life_total = 0
    print(f"\nlifestyle strip -> public/images-2/lifestyle/ (max {LIFESTYLE_MAX_EDGE}px)")
    for stem, (folder, fname) in LIFESTYLE_PLAN.items():
        src = os.path.join(SRC, folder, fname)
        if not os.path.exists(src):
            missing.append(f"{folder}/{fname}")
            continue
        dest = os.path.join(LIFESTYLE_OUT, f"{stem}.jpg")
        w, h, size = convert(src, dest, LIFESTYLE_MAX_EDGE)
        life_total += size
        print(f"  {stem}.jpg  {w}x{h}  {size // 1024} KB   <- {folder}/{fname}")
    print(f"\n{len(LIFESTYLE_PLAN)} lifestyle photos, {life_total / 1048576:.1f} MB total")

    if missing:
        print("\nMISSING SOURCES:")
        for m in missing:
            print("   ", m)
