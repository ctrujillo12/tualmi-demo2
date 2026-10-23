# Link preview (Open Graph) images

The 1200×630 images in `public/og/` are screenshots of the HTML files here:

| Template | Output | Used for |
|---|---|---|
| `home.html` | `public/og/home-og.jpg` | homepage, and every page without its own |
| `sierra.html` | `public/og/sierra-shorts-og.jpg` | Sierra Shorts page |
| `juniper.html` | `public/og/juniper-pant-og.jpg` | Juniper Pant page |

The text that shows under the image (title, description) is NOT in these
images. It's in `src/app/layout.tsx` (homepage) and `PAGE_METADATA` in
`src/app/products/[id]/page.tsx` (products).

To change a picture or the words on a card: edit the template (photo paths are
relative to this folder), open it in Chrome at 1200×630 to check it, then
screenshot it at exactly 1200×630 and save it over the file in `public/og/` as
a JPEG under ~300 KB. Keep the claims true: only the Sierra Shorts are recycled.

Replaces `scripts/make-og-images.py`, which needed Python Pillow and Linux fonts.
