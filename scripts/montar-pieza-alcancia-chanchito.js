#!/usr/bin/env node
/**
 * Pieza IG 1080×1350 — Alcancía chanchito
 * Misma estética que el post 1 de @impresoreando ("Porta completos"):
 * fondo beige, título serif (Playfair), subtítulo sans (Montserrat),
 * producto centrado, pie "Hecho a pedido" entre líneas.
 *
 * Foto preferida (fondo beige/studio):
 *   piezas/foto-producto-chanchito.jpg
 * Fallback:
 *   piezas/alcancia-chanchito-producto-beige.png
 *
 *   node scripts/montar-pieza-alcancia-chanchito.js
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PIEZAS = path.join(ROOT, 'index/clientes/impresoreando/piezas');
const REDES = path.join(ROOT, 'index/clientes/impresoreando/redes');
const OUT = path.join(PIEZAS, 'alcancia-chanchito-1080x1350.png');
const OUT2 = path.join(REDES, 'alcancia-chanchito-1080x1350.png');

const foto =
  [
    path.join(PIEZAS, 'foto-producto-chanchito.jpg'),
    path.join(PIEZAS, 'foto-producto-chanchito.jpeg'),
    path.join(PIEZAS, 'foto-producto-chanchito.png'),
    path.join(PIEZAS, 'alcancia-chanchito-producto-beige.png'),
    path.join(PIEZAS, 'alcancia-chanchito-producto-beige.jpg'),
    path.join(PIEZAS, 'alcancia-chanchito-producto-ref.jpg'),
  ].find((p) => fs.existsSync(p)) || null;

if (!foto) {
  console.error('Falta foto. Poné: index/clientes/impresoreando/piezas/foto-producto-chanchito.jpg');
  process.exit(1);
}

const PLAYFAIR =
  [
    '/tmp/ig-fonts/ttf/PlayfairDisplay-Regular.ttf',
    path.join(ROOT, 'fonts/PlayfairDisplay.ttf'),
  ].find((p) => fs.existsSync(p)) || '';

const MONTSERRAT =
  [
    '/tmp/ig-fonts/ttf/Montserrat-Regular.ttf',
    path.join(ROOT, 'fonts/Montserrat.ttf'),
  ].find((p) => fs.existsSync(p)) || '';

const py = `
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter, ImageChops
from pathlib import Path

W, H = 1080, 1350
# Fondo post 1 Impresoreando
BEIGE = (235, 217, 193)  # #EBD9C1
INK = (46, 33, 26)       # #2E211A

prod_path = r'''${foto.replace(/\\/g, '/')}'''
out1 = r'''${OUT.replace(/\\/g, '/')}'''
out2 = r'''${OUT2.replace(/\\/g, '/')}'''
playfair = r'''${PLAYFAIR.replace(/\\/g, '/')}'''
montserrat = r'''${MONTSERRAT.replace(/\\/g, '/')}'''

def load_font(path, size, weight_name='Regular'):
    if path and Path(path).exists():
        f = ImageFont.truetype(path, size)
        for w in (weight_name, weight_name.encode()):
            try:
                f.set_variation_by_name(w)
                break
            except Exception:
                pass
        return f
    fallback = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
    if 'Montserrat' in (path or '') or weight_name in ('Light', 'Regular', 'Medium'):
        fallback = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    return ImageFont.truetype(fallback, size) if Path(fallback).exists() else ImageFont.load_default()

img = Image.new('RGB', (W, H), BEIGE)
draw = ImageDraw.Draw(img)

f_title = load_font(playfair, 78, 'Medium')
f_sub = load_font(montserrat, 28, 'Light')
f_foot = load_font(montserrat, 26, 'Regular')

# —— Título (serif, centrado) ——
title = 'Alcancía chanchito'
tb = draw.textbbox((0, 0), title, font=f_title)
tw, th = tb[2] - tb[0], tb[3] - tb[1]
title_y = 110
draw.text(((W - tw) // 2, title_y), title, font=f_title, fill=INK)

# —— Subtítulo (sans, centrado) ——
sub = 'Diseño adorable para cuidar tus ahorros'
# wrap if needed
sb = draw.textbbox((0, 0), sub, font=f_sub)
sw = sb[2] - sb[0]
sub_y = title_y + th + 28
draw.text(((W - sw) // 2, sub_y), sub, font=f_sub, fill=INK)

# —— Producto centrado ——
prod = Image.open(prod_path).convert('RGBA')

# Si la foto trae fondo distinto al beige, intentar “recortar” por similitud
# y pegar sobre beige (mejora fotos de impresora). Si ya es beige/studio, se ve limpio.
rgb = prod.convert('RGB')
# auto-crop márgenes muy claros/beige
def content_bbox(im, thresh=18):
    bg = Image.new('RGB', im.size, BEIGE)
    diff = ImageChops.difference(im, bg).convert('L')
    diff = diff.point(lambda p: 255 if p > thresh else 0)
    return diff.getbbox()

bbox = content_bbox(rgb)
if bbox:
    # padding pequeño
    pad = 12
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad); y0 = max(0, y0 - pad)
    x1 = min(rgb.width, x1 + pad); y1 = min(rgb.height, y1 + pad)
    prod = prod.crop((x0, y0, x1, y1))

# Escala: producto ocupa ~58% del alto útil
max_w, max_h = 820, 720
scale = min(max_w / prod.width, max_h / prod.height)
nw, nh = int(prod.width * scale), int(prod.height * scale)
prod = prod.resize((nw, nh), Image.Resampling.LANCZOS)

# Si el fondo de la foto no es beige, suavizar bordes: opcional feather no crítico
prod_x = (W - nw) // 2
prod_y = sub_y + 70 + (720 - nh) // 2
# clamp so it doesn't collide with footer
footer_zone = H - 160
if prod_y + nh > footer_zone:
    prod_y = max(sub_y + 50, footer_zone - nh)

img.paste(prod, (prod_x, prod_y), prod if prod.mode == 'RGBA' else None)

draw = ImageDraw.Draw(img)

# —— Pie: líneas + "Hecho a pedido" ——
foot = 'Hecho a pedido'
fb = draw.textbbox((0, 0), foot, font=f_foot)
fw, fh = fb[2] - fb[0], fb[3] - fb[1]
foot_y = H - 110
fx = (W - fw) // 2
gap = 28
line_y = foot_y + fh // 2 + 2
# líneas finas a ambos lados
left_x1 = 90
left_x2 = fx - gap
right_x1 = fx + fw + gap
right_x2 = W - 90
draw.line([(left_x1, line_y), (left_x2, line_y)], fill=INK, width=2)
draw.line([(right_x1, line_y), (right_x2, line_y)], fill=INK, width=2)
draw.text((fx, foot_y), foot, font=f_foot, fill=INK)

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
