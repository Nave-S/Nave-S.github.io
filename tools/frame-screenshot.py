#!/usr/bin/env python3
"""
frame-screenshot.py — drop a raw app screenshot into an Apple device bezel PNG.

WHAT THIS IS FOR
-----------------
apps/screenshots/framed/*.png on this site are studio-website marketing shots:
a plain in-app screenshot pasted inside an official Apple device bezel image
(iPhone / iPad / Mac), so the frame renders as a photo-real device. The tool
that originally produced them (commit 19af936, "overlay screenshots in real
orange iPhone bezel") was never checked into this repo — only the finished
PNGs were. This script is the recovered/rebuilt version of that tool, written
2026-08-03 while fixing an outdated brand list in sl-01.png. Keep it here so
the next screenshot refresh doesn't require re-deriving the geometry method
below from scratch again.

SOURCE BEZELS
-------------
Official Apple Design Resources, kept locally (not in this repo, not
versioned) at:
    /Users/nawiedsyed/DEV/Apple Bezels/<Device>/<Device Variant>.png
e.g. "Apple Bezels/Iphone 17/iPhone 17 Pro/iPhone 17 Pro - Cosmic Orange - Portrait.png"
These PNGs are much larger than the final asset (e.g. 1350x2760 for the
iPhone 17 Pro) with a transparent margin around the phone silhouette, and a
transparent "hole" where the screen content shows through — including a
transparent channel through the Dynamic Island notch that connects the
screen's transparent hole to the outer transparent margin.

Apple's marketing guidelines forbid recoloring, tilting, cropping the device
silhouette, or adding reflections/gloss to these bezel images. This script
does none of that: it only trims the fully-transparent margin (a lossless,
non-destructive crop — the phone silhouette itself is untouched) and pastes
screenshot content into the existing transparent hole.

GEOMETRY: HOW THE SCREEN REGION IS FOUND
-----------------------------------------
Two naive approaches were tried first and BOTH FAILED — documented here so
nobody re-walks into the same trap:

1. Flood fill from a seed pixel inside the screen area, filling contiguous
   transparent pixels to find the screen's bounding box.
   FAILS: the Dynamic Island cutout connects the screen's transparent region
   to the fully-transparent outer margin of the canvas. The flood fill leaks
   straight out through the notch and floods the entire background, so the
   "bounding box" it finds is the whole canvas, not the screen.

2. Take the bounding box of all OPAQUE pixels (the phone silhouette) and
   assume the screen is a fixed inset from that box.
   FAILS: this overshoots by several pixels because it doesn't account for
   the actual rounded-corner + notch geometry, and it doesn't handle
   antialiased edge pixels correctly. In an earlier pass at this problem the
   screen content ended up ~8px larger than the true hole, so the pasted
   content overhung the bezel and a dark rectangular sliver was visible
   past the rounded corners (exactly the defect commit 7d9077f,
   "remove black corner overhang", had to paper over afterwards for the
   OLD compositing pipeline).

THE METHOD THAT WORKS: longest contiguous transparent run.
    - For the screen's X range: scan a row through the vertical MIDDLE of
      the canvas (safely below the Dynamic Island / above any home
      indicator or, on Mac, below the menu-bar area) and find the longest
      unbroken run of alpha==0 pixels. That run's [start, end) is the
      screen's left/right edge. The middle row never crosses the notch
      cutout, so this run is exactly the screen hole and nothing else.
    - For the screen's Y range: scan a COLUMN at roughly 1/4 of the canvas
      width (off-center, so it avoids the Dynamic Island / camera notch
      which sits centered at the top) and find the longest unbroken run of
      alpha==0 pixels. That gives the screen's top/bottom edge.
    - On Mac bezels the same method still works: below the screen is the
      opaque keyboard/trackpad deck, which breaks the transparent run
      exactly at the screen's bottom edge, same as the phone case.

This was verified two independent ways before trusting it:
    a) Applied directly to the raw Apple bezel PNG.
    b) Cross-checked against the pixel-diff bounding box between two
       EXISTING framed screenshots that share the same bezel but different
       content (sl-01.png vs sl-02.png) — the diff region matched the
       transparent-run measurement exactly, with zero differing pixels
       outside it.

USAGE
-----
    python3 tools/frame-screenshot.py \
        --bezel "/Users/nawiedsyed/DEV/Apple Bezels/Iphone 17/iPhone 17 Pro/iPhone 17 Pro - Cosmic Orange - Portrait.png" \
        --content path/to/raw_screenshot.png \
        --out apps/screenshots/framed/sl-01.png

Optional flags:
    --mid-row-frac FLOAT     row (as a fraction of canvas height) used to
                              find the screen's left/right edge. Default 0.5.
    --quarter-col-frac FLOAT column (as a fraction of canvas width) used to
                              find the screen's top/bottom edge. Default 0.25.
    --screen-rect X Y W H    skip auto-detection and use an explicit screen
                              rect (in the trimmed-canvas coordinate space).
                              Use this for devices where the default
                              mid-row/quarter-col probes land on a bezel
                              landmark (camera bump, speaker grille, etc.)
                              instead of open canvas.
    --alpha-threshold INT    alpha value at/below which a pixel counts as
                              "transparent" for the run search. Default 0
                              (only literally fully-transparent pixels).

The script always prints the trimmed canvas size and the detected screen
rect — check that output against the target device's known screen
resolution (e.g. iPhone 17 Pro = 1206x2622 px, 3x) before trusting the
result blindly.
"""

import argparse
import sys
from PIL import Image, ImageDraw, ImageFilter


def screen_hole_mask(canvas, sx, sy, sw, sh, alpha_threshold):
    """Return an L-mode mask of the screen's ACTUAL shape inside the screen rect.

    WHY THIS EXISTS
    ---------------
    `detect_screen_rect` returns a rectangle — the bounding box of the screen
    hole. The hole itself is a rounded rectangle. Pasting the screenshot as a
    plain rectangle therefore leaves four black corner wedges sticking out past
    the device silhouette, because the bezel is transparent there and covers
    nothing. On the iPhone 17 Pro bezel that is 70,627 pixels, 2.23% of the
    rect — small in area, glaringly visible against a light page background.

    Every framed shot on this site carried those wedges until 2026-08-12.

    HOW THE SHAPE IS FOUND
    ----------------------
    Flood fill outward from the centre of the screen rect across transparent
    pixels, confined to the rect. The rounded corners are cut off from the
    centre by the opaque bezel frame, so the fill never reaches them. Confining
    it to the rect also means the Dynamic Island channel — the leak documented
    above that defeats a whole-canvas flood fill — cannot carry it outside.

    The alpha channel is binarised first, so the fill marker (128) can never
    collide with a real alpha value.
    """
    alpha = canvas.split()[3].crop((sx, sy, sx + sw, sy + sh))
    binary = alpha.point(lambda v: 0 if v <= alpha_threshold else 255)
    ImageDraw.floodfill(binary, (sw // 2, sh // 2), 128, thresh=0)
    mask = binary.point(lambda v: 255 if v == 128 else 0)

    # Grow the mask by 2px. The bezel's inner edge is antialiased, so a band of
    # partly-transparent pixels sits between "hole" (alpha 0) and "frame"
    # (alpha 255). The flood fill stops at the first of them, and without this
    # the page background shows through as a hairline along the corner curve —
    # the exact artefact this function was written to remove, one pixel over.
    # Growing is safe: the surplus lands under the opaque frame, which is drawn
    # on top afterwards and is far thicker than 2px.
    mask = mask.filter(ImageFilter.MaxFilter(5))

    covered = sum(mask.point(lambda v: 1 if v else 0).getdata())
    if covered < sw * sh * 0.90:
        raise ValueError(
            f"Screen hole mask covers only {covered} of {sw * sh} rect pixels "
            f"({covered / (sw * sh) * 100:.1f}%). Expected ~98%. The flood fill "
            f"probably started on an opaque pixel or the rect is wrong."
        )
    return mask


def longest_transparent_run(values, threshold):
    """Return (start, end_exclusive, length) of the longest contiguous run
    of positions where alpha <= threshold."""
    best = (0, 0, 0)
    cur_start = None
    for i, v in enumerate(values):
        transparent = v <= threshold
        if transparent:
            if cur_start is None:
                cur_start = i
        else:
            if cur_start is not None:
                length = i - cur_start
                if length > best[2]:
                    best = (cur_start, i, length)
                cur_start = None
    if cur_start is not None:
        length = len(values) - cur_start
        if length > best[2]:
            best = (cur_start, len(values), length)
    return best


def trim_transparent_margin(bezel: Image.Image) -> Image.Image:
    """Crop the fully-transparent margin around the phone/tablet/laptop
    silhouette. This is a lossless crop of empty canvas only — the device
    artwork itself is never touched, resized, or resampled."""
    alpha = bezel.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        raise ValueError("Bezel image has no opaque pixels at all — wrong file?")
    return bezel.crop(bbox)


def detect_screen_rect(canvas: Image.Image, mid_row_frac: float,
                        quarter_col_frac: float, alpha_threshold: int):
    w, h = canvas.size
    alpha = canvas.getchannel("A")
    pixels = alpha.load()

    row_y = int(h * mid_row_frac)
    row_vals = [pixels[x, row_y] for x in range(w)]
    x0, x1, xlen = longest_transparent_run(row_vals, alpha_threshold)
    if xlen == 0:
        raise ValueError(
            f"No transparent run found in row y={row_y}. Try a different "
            f"--mid-row-frac (current probe may be crossing a notch/camera "
            f"bump or landing outside the screen entirely)."
        )

    col_x = int(w * quarter_col_frac)
    col_vals = [pixels[col_x, y] for y in range(h)]
    y0, y1, ylen = longest_transparent_run(col_vals, alpha_threshold)
    if ylen == 0:
        raise ValueError(
            f"No transparent run found in column x={col_x}. Try a different "
            f"--quarter-col-frac."
        )

    return (x0, y0, x1 - x0, y1 - y0)


def compose(bezel_path, content_path, out_path, mid_row_frac, quarter_col_frac,
            alpha_threshold, screen_rect_override):
    bezel_raw = Image.open(bezel_path).convert("RGBA")
    canvas = trim_transparent_margin(bezel_raw)
    print(f"Trimmed bezel canvas: {canvas.size[0]}x{canvas.size[1]} "
          f"(raw bezel was {bezel_raw.size[0]}x{bezel_raw.size[1]})")

    if screen_rect_override:
        sx, sy, sw, sh = screen_rect_override
    else:
        sx, sy, sw, sh = detect_screen_rect(
            canvas, mid_row_frac, quarter_col_frac, alpha_threshold
        )
    print(f"Screen rect: x={sx} y={sy} w={sw} h={sh} "
          f"(aspect {sw / sh:.4f})")

    content = Image.open(content_path).convert("RGBA")
    if content.size != (sw, sh):
        print(f"Resizing content {content.size[0]}x{content.size[1]} -> "
              f"{sw}x{sh} (Lanczos)")
        content = content.resize((sw, sh), Image.LANCZOS)

    # Paste through the screen's real (rounded) shape, not the bounding box —
    # otherwise the corners stick out past the device silhouette.
    mask = screen_hole_mask(canvas, sx, sy, sw, sh, alpha_threshold)
    trimmed = sw * sh - sum(mask.point(lambda v: 1 if v else 0).getdata())
    print(f"Corner trim: {trimmed} px ({trimmed / (sw * sh) * 100:.2f}% of the rect)")

    result = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    result.paste(content, (sx, sy), mask)
    result = Image.alpha_composite(result, canvas)

    result.save(out_path)
    print(f"Wrote {out_path} ({result.size[0]}x{result.size[1]})")


def parse_args():
    p = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--bezel", required=True, help="Path to the raw Apple bezel PNG")
    p.add_argument("--content", required=True, help="Path to the raw app screenshot to paste in")
    p.add_argument("--out", required=True, help="Output path for the framed PNG")
    p.add_argument("--mid-row-frac", type=float, default=0.5)
    p.add_argument("--quarter-col-frac", type=float, default=0.25)
    p.add_argument("--alpha-threshold", type=int, default=0)
    p.add_argument("--screen-rect", type=int, nargs=4, metavar=("X", "Y", "W", "H"),
                    default=None,
                    help="Explicit screen rect in trimmed-canvas coordinates; "
                         "skips auto-detection")
    return p.parse_args()


def main():
    args = parse_args()
    compose(args.bezel, args.content, args.out,
             args.mid_row_frac, args.quarter_col_frac,
             args.alpha_threshold, args.screen_rect)


if __name__ == "__main__":
    sys.exit(main())
