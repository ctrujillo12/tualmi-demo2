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
SRC = "/sessions/zen-fervent-shannon/mnt/Website Photos"
OUT = os.path.join(ROOT, "public", "images-2", "model")

MAX_EDGE = 1600
QUALITY = 82

# destination stem -> (source folder, filename), in gallery order
PLAN = {
    # Sierra Shorts — Jam. Uses "fixed photos" (retouched) rather than the
    # raw "Red Shorts" folder; same six shots, cleaner grade.
    "jam-1": ("fixed photos", "3.png"),
    "jam-2": ("fixed photos", "6.png"),
    "jam-3": ("fixed photos", "4.png"),
    "jam-4": ("fixed photos", "5.png"),
    "jam-5": ("fixed photos", "1.png"),
    "jam-6": ("fixed photos", "2.png"),

    # Sierra Shorts — Picnic (pink gingham)
    "picnic-1": ("Pink Shorts", "Facetune_24-07-2026-16-22-56.HEIC"),
    "picnic-2": ("Pink Shorts", "Facetune_24-07-2026-21-40-45.HEIC"),
    "picnic-3": ("Pink Shorts", "Facetune_21-07-2026-00-03-14 2.heic"),
    "picnic-4": ("Pink Shorts", "Untitled design (2).PNG"),

    # Sierra Shorts — Confetti
    "confetti-1": ("Confetti Shorts", "Facetune_24-07-2026-21-51-27.HEIC"),
    "confetti-2": ("Confetti Shorts", "Facetune_24-07-2026-21-54-29.HEIC"),
    "confetti-3": ("Confetti Shorts", "Facetune_24-07-2026-21-55-59.HEIC"),
    "confetti-4": ("Confetti Shorts", "Facetune_22-07-2026-10-39-13.heic"),
    "confetti-5": ("Confetti Shorts", "Facetune_22-07-2026-10-24-13.heic"),

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


def convert(src_path: str, dest_path: str) -> tuple[int, int, int]:
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
    scale = min(1.0, MAX_EDGE / max(w, h))
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
    if missing:
        print("\nMISSING SOURCES:")
        for m in missing:
            print("   ", m)
