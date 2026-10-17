"""Replace the old A³ boxes in a CV PDF with the أحمد · Ahmed icon (brand kit 02-Icon/favicon.svg).

Usage: python -I cvlogo.py <in.pdf> <out.pdf> <page:x0,y0,x1,y1> [<page:x0,y0,x1,y1> ...]
Each box is a 1-based page number and a rectangle in PDF points from the top-left corner. Each old box is painted over with white,
then the brand icon (emerald rounded square + mark) is drawn at the same place and size.
The CVs in public/ were made with (originals kept in tools/source/*.old-logo.pdf):
  cvlogo.py tools/source/Ahmed-Abbas-Ashour-CV.old-logo.pdf public/Ahmed-Abbas-Ashour-CV.pdf     1:42.75,33.75,72.0,63.25 1:42.75,803.5,55.5,816.0 2:42.75,803.5,55.5,816.0
  cvlogo.py tools/source/Ahmed-Abbas-Ashour-CV-ar.old-logo.pdf public/Ahmed-Abbas-Ashour-CV-ar.pdf     1:523.5,33.75,552.5,63.25 1:540.0,803.5,552.5,816.0 2:540.0,803.5,552.5,816.0
"""
import io
import re
import sys

from pypdf import PdfReader, PdfWriter
from reportlab.lib.colors import HexColor, white
from reportlab.pdfgen import canvas

src, out = sys.argv[1], sys.argv[2]
boxes = []
for arg in sys.argv[3:]:
    pg, rect = arg.split(':')
    boxes.append((int(pg) - 1, tuple(map(float, rect.split(',')))))

# The mark, as in favicon.svg: drawn in a 64-unit box with transform translate(-82.6 55.7) scale(0.04545).
MARK = [
    ('#EFE6CC', 'M2305.5 -730 L2465.8 -730 L2810.8 0 L2650.5 0 Z M2405.8 -285 L2535.8 -285 L2592.5 -165 L2405.8 -165 Z'),
    ('#5FE0C8', 'M2275.8 0 L2425.8 0 L2425.8 -730 L2275.8 -730 Z'),
    ('#D9C18D', 'M2231.2 -850.4 2294.9 -860.4Q2272.5 -872.1 2258.7 -891.9Q2245 -911.7 2245 -937.6Q2245 -987.1 2279.2 -1014.6Q2313.3 -1042.1 2370 -1042.1Q2424.5 -1042.1 2461.3 -1021.9L2439.2 -964.4Q2424.8 -972.3 2409.5 -975.7Q2394.2 -979.2 2377.9 -979.2Q2352.6 -979.2 2337.3 -964.3Q2321.9 -949.5 2321.9 -923.4Q2321.9 -904.8 2331.7 -891.5Q2341.5 -878.2 2356.4 -871.3Q2385.2 -876.8 2406.7 -879.7Q2428.3 -882.6 2443.9 -884.4Q2459.5 -886.2 2470.5 -886.2V-821.3Q2449.6 -820.1 2414.2 -816.3Q2378.8 -812.4 2340.5 -808Q2302.1 -803.6 2272.1 -799.5Q2242.1 -795.4 2231.2 -792.7Z'),
]


def tokens(d):
    return re.findall(r'[MLQVHZ]|-?\d+(?:\.\d+)?', d)


reader = PdfReader(src)
writer = PdfWriter(clone_from=reader)


def overlay_for(page_index, x0, y0, x1, y1):
    page = reader.pages[page_index]
    W, H = float(page.mediabox.width), float(page.mediabox.height)
    size = min(x1 - x0, y1 - y0)
    bx, by = x0 + (x1 - x0 - size) / 2, y0 + (y1 - y0 - size) / 2
    k = size / 64

    def to_pdf(sx, sy):
        """SVG mark coordinates -> PDF points (origin bottom-left)."""
        ux, uy = sx * 0.04545 - 82.6, sy * 0.04545 + 55.7  # into the 64-unit icon box (y down)
        return bx + ux * k, H - (by + uy * k)

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(W, H))
    pad = max(0.8, size * 0.04)
    c.setFillColor(white)
    c.rect(x0 - pad, H - y1 - pad, (x1 - x0) + 2 * pad, (y1 - y0) + 2 * pad, stroke=0, fill=1)
    c.setFillColor(HexColor('#0C4A3E'))
    c.roundRect(bx, H - by - size, size, size, radius=14 * k, stroke=0, fill=1)
    for color, d in MARK:
        p = c.beginPath()
        t = tokens(d)
        i, cmd, cx, cy = 0, None, 0.0, 0.0
        while i < len(t):
            if t[i] in 'MLQVHZ':
                cmd = t[i]
                i += 1
                if cmd == 'Z':
                    p.close()
                    continue
            if cmd == 'M':
                cx, cy = float(t[i]), float(t[i + 1]); i += 2
                p.moveTo(*to_pdf(cx, cy))
                cmd = 'L'  # extra pairs after M are line-tos
            elif cmd == 'L':
                cx, cy = float(t[i]), float(t[i + 1]); i += 2
                p.lineTo(*to_pdf(cx, cy))
            elif cmd == 'V':
                cy = float(t[i]); i += 1
                p.lineTo(*to_pdf(cx, cy))
            elif cmd == 'H':
                cx = float(t[i]); i += 1
                p.lineTo(*to_pdf(cx, cy))
            elif cmd == 'Q':
                qx, qy, ex, ey = map(float, t[i:i + 4]); i += 4
                c1 = (cx + 2 / 3 * (qx - cx), cy + 2 / 3 * (qy - cy))  # quadratic -> cubic
                c2 = (ex + 2 / 3 * (qx - ex), ey + 2 / 3 * (qy - ey))
                p.curveTo(*to_pdf(*c1), *to_pdf(*c2), *to_pdf(ex, ey))
                cx, cy = ex, ey
        c.setFillColor(HexColor(color))
        c.drawPath(p, stroke=0, fill=1, fillMode=1)
    c.save()
    return PdfReader(io.BytesIO(buf.getvalue())).pages[0]


for page_index, rect in boxes:
    writer.pages[page_index].merge_page(overlay_for(page_index, *rect))
# merge_page rewrites content streams uncompressed; compress them and drop duplicate objects.
for page in writer.pages:
    page.compress_content_streams()
writer.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
writer.write(out)
print('saved', out, len(boxes), 'boxes')
