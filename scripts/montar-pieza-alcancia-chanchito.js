#!/usr/bin/env node
/**
 * Pieza IG 1080×1350 — Alcancía chanchito
 * Misma estética que el post 1 de @impresoreando ("Porta completos"):
 *   · fondo beige #EBD9C1
 *   · título serif Playfair Display
 *   · subtítulo + pie sans Montserrat
 *   · producto centrado (sin marco)
 *   · pie: —— Hecho a pedido ——
 *
 * Foto preferida:
 *   piezas/foto-producto-chanchito.jpg  (o .png)
 * Fallback studio beige:
 *   piezas/alcancia-chanchito-producto-beige.png
 *
 * Fuentes (variable TTF):
 *   /tmp/ig-fonts/ttf/PlayfairDisplay-Regular.ttf
 *   /tmp/ig-fonts/ttf/Montserrat-Regular.ttf
 *   o fonts/PlayfairDisplay.ttf + fonts/Montserrat.ttf
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

if (!PLAYFAIR || !MONTSERRAT) {
  console.error('Faltan fuentes Playfair/Montserrat (estilo post 1 IG).');
  console.error('Descargá variable TTF a fonts/ o /tmp/ig-fonts/ttf/');
  process.exit(1);
}

const py = `
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path

W, H = 1080, 1350
BEIGE = (235, 217, 193)
INK = (46, 33, 26)

prod_path = r'''${foto.replace(/\\/g, '/')}'''
out1 = r'''${OUT.replace(/\\/g, '/')}'''
out2 = r'''${OUT2.replace(/\\/g, '/')}'''
playfair = r'''${PLAYFAIR.replace(/\\/g, '/')}'''
montserrat = r'''${MONTSERRAT.replace(/\\/g, '/')}'''

def load_font(path, size, weight='Regular'):
    f = ImageFont.truetype(path, size)
    for w in (weight, weight.encode()):
        try:
            f.set_variation_by_name(w)
            break
        except Exception:
            pass
    return f

src = Image.open(prod_path).convert('RGBA')
px = src.load()
w0, h0 = src.size
for y in range(h0):
    for x in range(w0):
        r, g, b, a = px[x, y]
        db = abs(r - BEIGE[0]) + abs(g - BEIGE[1]) + abs(b - BEIGE[2])
        warm = r > 200 and g > 180 and b > 150 and abs(r - g) < 45
        if db < 55 or (warm and db < 90) or (r > 245 and g > 235 and b > 220):
            alpha = 0 if db < 35 or warm else max(0, min(255, int((db - 35) * 6)))
            px[x, y] = (r, g, b, alpha)

bbox = src.split()[-1].getbbox()
if bbox:
    pad = 8
    x0, y0, x1, y1 = bbox
    src = src.crop((max(0, x0 - pad), max(0, y0 - pad), min(w0, x1 + pad), min(h0, y1 + pad)))
a = src.split()[-1].filter(ImageFilter.GaussianBlur(0.6))
src.putalpha(a)

img = Image.new('RGB', (W, H), BEIGE)
draw = ImageDraw.Draw(img)
f_title = load_font(playfair, 82, 'Medium')
f_sub = load_font(montserrat, 27, 'Light')
f_foot = load_font(montserrat, 25, 'Regular')

title = 'Alcancía chanchito'
tb = draw.textbbox((0, 0), title, font=f_title)
tw, th = tb[2] - tb[0], tb[3] - tb[1]
title_y = 118
draw.text(((W - tw) // 2, title_y), title, font=f_title, fill=INK)

sub = 'Diseño adorable para cuidar tus ahorros'
sb = draw.textbbox((0, 0), sub, font=f_sub)
sub_y = title_y + th + 26
draw.text(((W - (sb[2] - sb[0])) // 2, sub_y), sub, font=f_sub, fill=INK)

max_w, max_h = 780, 780
scale = min(max_w / src.width, max_h / src.height)
nw, nh = int(src.width * scale), int(src.height * scale)
prod = src.resize((nw, nh), Image.Resampling.LANCZOS)
top = sub_y + 55
bottom = H - 150
prod_y = top + (bottom - top - nh) // 2
prod_x = (W - nw) // 2
img.paste(prod, (prod_x, prod_y), prod)

draw = ImageDraw.Draw(img)
foot = 'Hecho a pedido'
fb = draw.textbbox((0, 0), foot, font=f_foot)
fw, fh = fb[2] - fb[0], fb[3] - fb[1]
foot_y = H - 108
fx = (W - fw) // 2
gap = 30
line_y = foot_y + fh // 2 + 2
draw.line([(88, line_y), (fx - gap, line_y)], fill=INK, width=2)
draw.line([(fx + fw + gap, line_y), (W - 88, line_y)], fill=INK, width=2)
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
