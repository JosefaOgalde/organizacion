#!/usr/bin/env node
/**
 * Monta pieza IG 1080×1350 Alcancía chanchito (ALCHAN001).
 *
 * Tipografía: Nunito ExtraBold/Bold (misma familia del catálogo Impresoreando).
 * Colores: navy #163a6b · naranja #f07a28 · crema #f7f1e6
 *
 * Preferencia: foto real del producto
 *   index/clientes/impresoreando/piezas/foto-producto-chanchito.jpg
 * Fallback: piezas/alcancia-chanchito-producto-ref.jpg
 *
 *   node scripts/montar-pieza-alcancia-chanchito.js
 *
 * Requiere: Python3 + Pillow (pip install pillow)
 * Fuente Nunito (opcional): /tmp/Nunito.ttf o fonts/Nunito.ttf
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PIEZAS = path.join(ROOT, 'index/clientes/impresoreando/piezas');
const REDES = path.join(ROOT, 'index/clientes/impresoreando/redes');
const LOGO = path.join(ROOT, 'index/clientes/impresoreando/identidad/logo-ima2.png');
const OUT = path.join(PIEZAS, 'alcancia-chanchito-1080x1350.png');
const OUT2 = path.join(REDES, 'alcancia-chanchito-1080x1350.png');

const foto =
  [
    path.join(PIEZAS, 'foto-producto-chanchito.jpg'),
    path.join(PIEZAS, 'foto-producto-chanchito.jpeg'),
    path.join(PIEZAS, 'foto-producto-chanchito.png'),
    path.join(PIEZAS, 'alcancia-chanchito-producto-ref.jpg'),
    path.join(PIEZAS, 'alcancia-chanchito-producto-ref.png'),
  ].find((p) => fs.existsSync(p)) || null;

if (!foto) {
  console.error('Falta foto del producto. Poné la del chanchito en:');
  console.error('  index/clientes/impresoreando/piezas/foto-producto-chanchito.jpg');
  process.exit(1);
}

const fontCandidates = [
  '/tmp/Nunito.ttf',
  path.join(ROOT, 'fonts/Nunito.ttf'),
  path.join(ROOT, 'index/clientes/impresoreando/identidad/Nunito.ttf'),
].filter((p) => fs.existsSync(p));
const NUNITO = fontCandidates[0] || '';

const py = `
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
from pathlib import Path

W, H = 1080, 1350
NAVY = (22, 58, 107)
ORANGE = (240, 122, 40)
CREAM = (247, 241, 230)
WHITE = (255, 255, 255)

logo_path = r'''${LOGO.replace(/\\/g, '/')}'''
prod_path = r'''${foto.replace(/\\/g, '/')}'''
out1 = r'''${OUT.replace(/\\/g, '/')}'''
out2 = r'''${OUT2.replace(/\\/g, '/')}'''
nunito = r'''${NUNITO.replace(/\\/g, '/')}'''

def font(size, weight='Bold'):
    if nunito and Path(nunito).exists():
        f = ImageFont.truetype(nunito, size)
        for w in (weight, weight.encode() if isinstance(weight, str) else weight):
            try:
                f.set_variation_by_name(w)
                break
            except Exception:
                pass
        return f
    bold = weight in ('Bold', 'ExtraBold', 'Black')
    for p in (
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    ):
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

img = Image.new('RGB', (W, H), CREAM)
draw = ImageDraw.Draw(img)
for y in range(H):
    t = y / H
    r = int(CREAM[0] * (1 - 0.04 * t) + 255 * 0.02 * t)
    g = int(CREAM[1] * (1 - 0.03 * t) + 250 * 0.02 * t)
    b = int(CREAM[2] * (1 - 0.02 * t))
    draw.line([(0, y), (W, y)], fill=(r, g, b))

draw.rectangle([0, 0, W, 10], fill=ORANGE)

logo = Image.open(logo_path).convert('RGBA')
lw = 420
lh = int(logo.height * (lw / logo.width))
logo = logo.resize((lw, lh), Image.Resampling.LANCZOS)
lx = (W - lw) // 2
ly = 36
img.paste(logo, (lx, ly), logo)

f_head = font(64, 'ExtraBold')
f_sub = font(34, 'Bold')
f_sku = font(28, 'Bold')
f_name = font(52, 'ExtraBold')
f_meta = font(30, 'SemiBold')
f_cta = font(36, 'ExtraBold')

y = ly + lh + 18
line1 = '¡Mirá este diseño!'
bbox = draw.textbbox((0, 0), line1, font=f_head)
draw.text(((W - (bbox[2] - bbox[0])) // 2, y), line1, font=f_head, fill=NAVY)

y += 72
line2 = 'Alcancía chanchito'
bbox = draw.textbbox((0, 0), line2, font=f_sub)
draw.text(((W - (bbox[2] - bbox[0])) // 2, y), line2, font=f_sub, fill=ORANGE)

prod = Image.open(prod_path).convert('RGB')
prod = ImageEnhance.Color(prod).enhance(1.08)
prod = ImageEnhance.Contrast(prod).enhance(1.05)

panel_w, panel_h = 920, 780
px = (W - panel_w) // 2
py = y + 56

shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
sd = ImageDraw.Draw(shadow)
sd.rounded_rectangle([px + 8, py + 12, px + panel_w + 8, py + panel_h + 12], radius=36, fill=(22, 58, 107, 45))
shadow = shadow.filter(ImageFilter.GaussianBlur(18))
img = Image.alpha_composite(img.convert('RGBA'), shadow).convert('RGB')
draw = ImageDraw.Draw(img)

frame = Image.new('RGBA', (W, H), (0, 0, 0, 0))
fd = ImageDraw.Draw(frame)
fd.rounded_rectangle([px, py, px + panel_w, py + panel_h], radius=36, fill=(255, 255, 255, 255))
img = Image.alpha_composite(img.convert('RGBA'), frame).convert('RGB')
draw = ImageDraw.Draw(img)

inner = 28
avail_w = panel_w - inner * 2
avail_h = panel_h - inner * 2
cw, ch = prod.size
side = min(cw, ch)
left = (cw - side) // 2
top = max(0, (ch - side) // 2 - 40)
prod_sq = prod.crop((left, top, left + side, min(ch, top + side)))
scale = min(avail_w / prod_sq.width, avail_h / prod_sq.height)
nw = int(prod_sq.width * scale)
nh = int(prod_sq.height * scale)
prod_r = prod_sq.resize((nw, nh), Image.Resampling.LANCZOS)

mask = Image.new('L', (nw, nh), 0)
md = ImageDraw.Draw(mask)
md.rounded_rectangle([0, 0, nw - 1, nh - 1], radius=28, fill=255)
paste_x = px + (panel_w - nw) // 2
paste_y = py + (panel_h - nh) // 2
img.paste(prod_r, (paste_x, paste_y), mask)

draw = ImageDraw.Draw(img)
by = py + panel_h + 28
pill = 'SKU  ALCHAN001'
pb = draw.textbbox((0, 0), pill, font=f_sku)
pw = pb[2] - pb[0] + 36
ph = 44
px0 = (W - pw) // 2
draw.rounded_rectangle([px0, by, px0 + pw, by + ph], radius=22, fill=ORANGE)
draw.text((px0 + 18, by + 6), pill, font=f_sku, fill=WHITE)

by += 58
name = 'Alcancía chanchito'
bbox = draw.textbbox((0, 0), name, font=f_name)
draw.text(((W - (bbox[2] - bbox[0])) // 2, by), name, font=f_name, fill=NAVY)

by += 62
meta = 'Todo es a pedido  ·  PLA+  ·  Multicolor'
bbox = draw.textbbox((0, 0), meta, font=f_meta)
draw.text(((W - (bbox[2] - bbox[0])) // 2, by), meta, font=f_meta, fill=(90, 100, 120))

by += 48
cta = 'Pedidos por DM  →  @impresoreando'
bbox = draw.textbbox((0, 0), cta, font=f_cta)
draw.text(((W - (bbox[2] - bbox[0])) // 2, by), cta, font=f_cta, fill=NAVY)

draw.rectangle([0, H - 14, W, H], fill=ORANGE)

Path(out1).parent.mkdir(parents=True, exist_ok=True)
Path(out2).parent.mkdir(parents=True, exist_ok=True)
img.save(out1, 'PNG', optimize=True)
img.save(out2, 'PNG', optimize=True)
print('OK', out1, img.size)
print('OK', out2)
print('foto', prod_path)
`;

const r = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);
if (r.status !== 0) process.exit(r.status || 1);
