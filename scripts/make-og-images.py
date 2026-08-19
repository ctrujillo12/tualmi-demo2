#!/usr/bin/env python3
"""
Generate 1200x630 Open Graph preview images.

Run:  python3 scripts/make-og-images.py

Outputs into public/og/. Re-run after swapping any source photo below.

Why cards instead of plain crops: the product photography is portrait (2:3),
and cropping that to 1.91:1 slices off the model's head or the garment. So the
product images are composed as a card — brand blush background, text on the
left, photo panel on the right. The homepage image is landscape already, so it
gets a full-bleed treatment instead.
"""

from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630

BLUSH = (251, 241, 245)
MAROON = (169, 68, 92)
SOFT = (201, 132, 154)

BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
REG = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "public", "og")


def font(path, size):
    return ImageFont.truetype(path, size)


def cover(img, box_w, box_h):
    """Resize + center-crop so the image fills box_w x box_h without distortion."""
    src_ratio = img.width / img.height
    box_ratio = box_w / box_h
    if src_ratio > box_ratio:
        new_h = box_h
        new_w = int(new_h * src_ratio)
    else:
        new_w = box_w
        new_h = int(new_w / src_ratio)
    img = img.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - box_w) // 2
    # Bias slightly above centre — heads and garments sit high in these frames.
    top = int((new_h - box_h) * 0.35)
    return img.crop((left, top, left + box_w, top + box_h))


def wrap(draw, text, fnt, max_w):
    words, lines, cur = text.split(), [], ""
    for word in words:
        trial = f"{cur} {word}".strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def product_card(photo_path, title, subtitle, out_name):
    canvas = Image.new("RGB", (W, H), BLUSH)
    draw = ImageDraw.Draw(canvas)

    # ── Photo, right side ──
    # CONTAIN, not cover: the whole garment stays visible. Cover-cropping a 2:3
    # portrait into a fixed panel sliced ~20% off the frame and pushed the
    # shorts to the bottom edge. Here the photo is scaled to the full card
    # height and the panel takes whatever width that needs.
    photo = Image.open(photo_path).convert("RGB")
    MAX_PANEL_W = 560
    scale = H / photo.height
    new_w, new_h = int(photo.width * scale), H
    if new_w > MAX_PANEL_W:  # very wide source — fit by width instead
        scale = MAX_PANEL_W / photo.width
        new_w, new_h = MAX_PANEL_W, int(photo.height * scale)
    photo = photo.resize((new_w, new_h), Image.LANCZOS)
    canvas.paste(photo, (W - new_w, (H - new_h) // 2))

    panel_w = new_w
    pad = 64
    text_w = W - panel_w - pad * 2

    # Eyebrow
    f_eyebrow = font(BOLD, 22)
    draw.text((pad, 96), "TUALMI", font=f_eyebrow, fill=SOFT)

    # Title — shrink to fit two lines max
    size = 62
    while size > 34:
        f_title = font(BOLD, size)
        lines = wrap(draw, title, f_title, text_w)
        if len(lines) <= 2:
            break
        size -= 4
    y = 150
    for line in lines:
        draw.text((pad, y), line, font=f_title, fill=MAROON)
        y += int(size * 1.15)

    # Subtitle
    f_sub = font(REG, 25)
    y += 18
    for line in wrap(draw, subtitle, f_sub, text_w)[:4]:
        draw.text((pad, y), line, font=f_sub, fill=SOFT)
        y += 38

    # Small rule as a brand mark
    draw.rectangle([pad, H - 96, pad + 56, H - 92], fill=MAROON)

    path = os.path.join(OUT, out_name)
    canvas.save(path, "JPEG", quality=88, optimize=True)
    print(f"  {out_name}  {os.path.getsize(path)//1024} KB")


def hero_plain(photo_path, out_name):
    """
    Full-bleed landscape photo, nothing composited over it.

    Used for the homepage preview. The card treatment below (hero_card) put
    "actually cute hiking gear" over a dark scrim; this drops both. The reason
    to prefer it: every platform that renders a link preview already draws the
    page title and description right underneath the image, so baked-in text is
    the same words twice — and it's the copy that gets cropped or covered when
    a platform decides to letterbox or overlay the thumbnail.

    Still generated rather than pointing the meta tag at the source photo:
    shorts-holdinghands.jpg is 6240x4160 and 12.5 MB. Facebook rejects anything
    over 8 MB outright, and iMessage / WhatsApp / Slack give up on large files
    before they finish downloading, so a raw link would often preview with no
    image at all. 1200x630 at ~175 KB always renders.
    """
    photo = Image.open(photo_path).convert("RGB")
    canvas = cover(photo, W, H)
    path = os.path.join(OUT, out_name)
    canvas.save(path, "JPEG", quality=86, optimize=True, progressive=True)
    print(f"  {out_name}  {os.path.getsize(path)//1024} KB  (plain, no overlay)")


def hero_card(photo_path, title, subtitle, out_name):
    """
    Full-bleed landscape photo with a dark scrim and text over it.

    No longer used for the homepage — see hero_plain. Kept because it's the
    right treatment if you ever need a preview to carry a message the page
    title doesn't (a sale, a launch date, a campaign).
    """
    photo = Image.open(photo_path).convert("RGB")
    canvas = cover(photo, W, H)

    # Gradient scrim across the bottom half so text stays readable.
    scrim = Image.new("L", (1, H), 0)
    for y in range(H):
        t = max(0.0, (y - H * 0.35) / (H * 0.65))
        scrim.putpixel((0, y), int(200 * t**1.5))
    scrim = scrim.resize((W, H))
    canvas = Image.composite(Image.new("RGB", (W, H), (46, 20, 30)), canvas, scrim)

    draw = ImageDraw.Draw(canvas)
    pad = 64
    f_title = font(BOLD, 60)
    f_sub = font(REG, 27)

    lines = wrap(draw, title, f_title, W - pad * 2)[:2]
    sub_lines = wrap(draw, subtitle, f_sub, W - pad * 2)[:2]

    block_h = len(lines) * 70 + len(sub_lines) * 40
    y = H - pad - block_h
    for line in lines:
        draw.text((pad, y), line, font=f_title, fill=(255, 255, 255))
        y += 70
    y += 6
    for line in sub_lines:
        draw.text((pad, y), line, font=f_sub, fill=(255, 232, 240))
        y += 40

    path = os.path.join(OUT, out_name)
    canvas.save(path, "JPEG", quality=86, optimize=True)
    print(f"  {out_name}  {os.path.getsize(path)//1024} KB")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    img = lambda p: os.path.join(ROOT, "public", "images-2", p)
    print("Writing OG images to public/og/ ...")

    # Homepage: the photo on its own. The title and description that used to be
    # burned into it are already in the metadata, so every platform renders them
    # below the image anyway.
    hero_plain(
        img("shorts-holdinghands.jpg"),
        "home-og.jpg",
    )

    product_card(
        img("model/confetti-1.jpg"),
        "sierra shorts",
        "Mid-rise, relaxed fit. 100% recycled, fast-dry and ultra-light.",
        "sierra-shorts-og.jpg",
    )

    product_card(
        img("model/birch-3.jpg"),
        "juniper pant",
        "Flare cargo hiking pants, engineered for women. Recycled materials.",
        "juniper-pant-og.jpg",
    )

    print("Done.")
