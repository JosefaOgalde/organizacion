#!/usr/bin/env node
/**
 * Pieza IG 1080×1350 — Porta Bob Esponja (PTBOBES001)
 * Misma tipografía que Alcancía chanchito:
 *   · título Playfair Display
 *   · subtítulo + pie Montserrat
 *   · fondo blush #F0E2DD
 *   · pie: —— Hecho a pedido ——
 *
 * Foto preferida (tal cual):
 *   piezas/foto-producto-porta-bob.jpg
 * Fallback: ilustración referencial del catálogo
 *
 *   node scripts/montar-pieza-porta-bob-esponja.js
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PIEZAS = path.join(ROOT, 'index/clientes/impresoreando/piezas');
const REDES = path.join(ROOT, 'index/clientes/impresoreando/redes');
const OUT = path.join(PIEZAS, 'porta-bob-esponja-1080x1350.png');
const OUT2 = path.join(REDES, 'porta-bob-esponja-1080x1350.png');

const foto =
  [
    path.join(PIEZAS, 'foto-producto-porta-bob.jpg'),
    path.join(PIEZAS, 'foto-producto-porta-bob.jpeg'),
    path.join(PIEZAS, 'foto-producto-porta-bob.png'),
    path.join(PIEZAS, 'porta-bob-esponja-producto-ref.png'),
  ].find((p) => fs.existsSync(p)) || null;

const PLAYFAIR =
  [
    path.join(ROOT, 'fonts/PlayfairDisplay.ttf'),
    '/tmp/ig-fonts/ttf/PlayfairDisplay-Regular.ttf',
  ].find((p) => fs.existsSync(p)) || '';

const MONTSERRAT =
  [
    path.join(ROOT, 'fonts/Montserrat.ttf'),
    '/tmp/ig-fonts/ttf/Montserrat-Regular.ttf',
  ].find((p) => fs.existsSync(p)) || '';

if (!PLAYFAIR || !MONTSERRAT) {
  console.error('Faltan Playfair/Montserrat en fonts/');
  process.exit(1);
}

const py = `
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path

W, H = 1080, 1350
BG = (240, 226, 221)
INK = (46, 33, 26)
foto = r'''${(foto || '').replace(/\\/g, '/')}'''
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

def draw_ref():
    pw, ph = 640, 720
    prod = Image.new('RGBA', (pw, ph), (0, 0, 0, 0))
    d = ImageDraw.Draw(prod)
    d.ellipse([170, 556, 470, 604], fill=(22, 58, 107, 28))
    d.rounded_rectangle([220, 200, 420, 420], radius=28, fill=(245, 213, 71), outline=(22, 58, 107), width=8)
    d.ellipse([262, 262, 298, 298], fill=(22, 58, 107))
    d.ellipse([342, 262, 378, 298], fill=(22, 58, 107))
    d.arc([270, 310, 370, 390], start=20, end=160, fill=(22, 58, 107), width=8)
    d.rounded_rectangle([240, 420, 400, 470], radius=8, fill=(61, 107, 179))
    d.rounded_rectangle([250, 470, 300, 540], radius=10, fill=(245, 213, 71), outline=(22, 58, 107), width=5)
    d.rounded_rectangle([340, 470, 390, 540], radius=10, fill=(245, 213, 71), outline=(22, 58, 107), width=5)
    d.rounded_rectangle([245, 530, 305, 554], radius=8, fill=(22, 58, 107))
    d.rounded_rectangle([335, 530, 395, 554], radius=8, fill=(22, 58, 107))
    d.rounded_rectangle([160, 300, 210, 324], radius=10, fill=(245, 213, 71), outline=(22, 58, 107), width=5)
    d.rounded_rectangle([430, 300, 480, 324], radius=10, fill=(245, 213, 71), outline=(22, 58, 107), width=5)
    bbox = prod.split()[-1].getbbox()
    if bbox:
        pad = 10
        x0,y0,x1,y1 = bbox
        prod = prod.crop((max(0,x0-pad), max(0,y0-pad), min(pw,x1+pad), min(ph,y1+pad)))
    return prod

if foto and Path(foto).exists():
    src = Image.open(foto).convert('RGBA')
    # si es foto con fondo claro, intentar fundir
    OLD = [(240, 226, 221), (235, 217, 193), (255, 255, 255), (238, 246, 255)]
    px = src.load()
    w0, h0 = src.size
    for y in range(h0):
        for x in range(w0):
            r, g, b, a = px[x, y]
            near = False
            for br, bg, bb in OLD:
                if abs(r-br)+abs(g-bg)+abs(b-bb) < 40:
                    near = True
                    break
            if near or (r > 248 and g > 248 and b > 248):
                px[x, y] = (r, g, b, 0)
    bbox = src.split()[-1].getbbox()
    prod = src.crop(bbox) if bbox else src
else:
    prod = draw_ref()
    Path(r'''${path.join(PIEZAS, 'porta-bob-esponja-producto-ref.png').replace(/\\/g, '/')}''').parent.mkdir(parents=True, exist_ok=True)

img = Image.new('RGB', (W, H), BG)
draw = ImageDraw.Draw(img)
f_title = load_font(playfair, 78, 'Medium')
f_sub = load_font(montserrat, 27, 'Light')
f_foot = load_font(montserrat, 25, 'Regular')

title = 'Porta Bob Esponja'
tb = draw.textbbox((0, 0), title, font=f_title)
tw, th = tb[2] - tb[0], tb[3] - tb[1]
if tw > W - 100:
    f_title = load_font(playfair, 68, 'Medium')
    tb = draw.textbbox((0, 0), title, font=f_title)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
title_y = 118
draw.text(((W - tw) // 2, title_y), title, font=f_title, fill=INK)

sub = 'Diseño divertido para tu cocina'
sb = draw.textbbox((0, 0), sub, font=f_sub)
sub_y = title_y + th + 26
draw.text(((W - (sb[2] - sb[0])) // 2, sub_y), sub, font=f_sub, fill=INK)

max_w, max_h = 780, 780
scale = min(max_w / prod.width, max_h / prod.height)
nw, nh = int(prod.width * scale), int(prod.height * scale)
prod_r = prod.resize((nw, nh), Image.Resampling.LANCZOS)
top = sub_y + 55
bottom = H - 150
prod_y = top + (bottom - top - nh) // 2
prod_x = (W - nw) // 2
img.paste(prod_r, (prod_x, prod_y), prod_r)

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
`;

const r = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);
if (r.status !== 0) process.exit(r.status || 1);
