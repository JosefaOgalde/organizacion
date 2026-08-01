#!/usr/bin/env node
/**
 * Monta pieza IG 1080×1350 Alcancía chanchito (ALCHAN001).
 * Misma tipografía/layout del catálogo Impresoreando (Nunito 800, navy/naranja).
 * Texto mínimo: SKU · nombre · Todo es a pedido · @impresoreando
 *
 * Foto preferida: piezas/foto-producto-chanchito.jpg
 * Fallback: piezas/alcancia-chanchito-producto-ref.jpg
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
    path.join(PIEZAS, 'alcancia-chanchito-producto-ref.jpg'),
    path.join(PIEZAS, 'alcancia-chanchito-producto-ref.png'),
  ].find((p) => fs.existsSync(p)) || null;

if (!foto) {
  console.error('Falta foto. Poné: index/clientes/impresoreando/piezas/foto-producto-chanchito.jpg');
  process.exit(1);
}

const fontCandidates = [
  '/tmp/Nunito.ttf',
  path.join(ROOT, 'fonts/Nunito.ttf'),
].filter((p) => fs.existsSync(p));
const NUNITO = fontCandidates[0] || '';

const py = `
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
from pathlib import Path

# Layout idéntico a catálogo slide--producto (catalogo.css)
W, H = 1080, 1350
NAVY = (22, 58, 107)       # #163a6b
ORANGE = (240, 122, 40)    # #f07a28
CREAM_TOP = (255, 253, 249)
CREAM_BOT = (247, 241, 230)
WHITE = (255, 255, 255)
HANDLE = (90, 120, 150)

prod_path = r'''${foto.replace(/\\/g, '/')}'''
out1 = r'''${OUT.replace(/\\/g, '/')}'''
out2 = r'''${OUT2.replace(/\\/g, '/')}'''
nunito = r'''${NUNITO.replace(/\\/g, '/')}'''

def font(size, weight='ExtraBold'):
    if nunito and Path(nunito).exists():
        f = ImageFont.truetype(nunito, size)
        for w in (weight, weight.encode() if isinstance(weight, str) else weight):
            try:
                f.set_variation_by_name(w)
                break
            except Exception:
                pass
        return f
    p = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
    return ImageFont.truetype(p, size) if Path(p).exists() else ImageFont.load_default()

img = Image.new('RGB', (W, H), CREAM_BOT)
draw = ImageDraw.Draw(img)
for y in range(H):
    t = y / (H - 1)
    draw.line([(0, y), (W, y)], fill=(
        int(CREAM_TOP[0] * (1 - t) + CREAM_BOT[0] * t),
        int(CREAM_TOP[1] * (1 - t) + CREAM_BOT[1] * t),
        int(CREAM_TOP[2] * (1 - t) + CREAM_BOT[2] * t),
    ))

# Visual: margin 48/56, 780px alto, radius 36, border navy 12%
mx, my = 56, 48
vw, vh = W - mx * 2, 780
# border
draw.rounded_rectangle([mx, my, mx + vw - 1, my + vh - 1], radius=36, outline=(22, 58, 107, 30), width=3)
# white fill under photo
draw.rounded_rectangle([mx + 3, my + 3, mx + vw - 4, my + vh - 4], radius=33, fill=WHITE)

prod = Image.open(prod_path).convert('RGB')
prod = ImageEnhance.Color(prod).enhance(1.06)
prod = ImageEnhance.Contrast(prod).enhance(1.04)
inner = 20
aw, ah = vw - inner * 2, vh - inner * 2
scale = min(aw / prod.width, ah / prod.height)
nw, nh = int(prod.width * scale), int(prod.height * scale)
prod_r = prod.resize((nw, nh), Image.Resampling.LANCZOS)
mask = Image.new('L', (nw, nh), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, nw - 1, nh - 1], radius=28, fill=255)
px = mx + (vw - nw) // 2
py = my + (vh - nh) // 2
img.paste(prod_r, (px, py), mask)

draw = ImageDraw.Draw(img)

# Meta: padding 36/64 — solo SKU + nombre + pedido + @
f_sku = font(28, 'ExtraBold')
f_nombre = font(56, 'ExtraBold')
f_pedido = font(28, 'ExtraBold')
f_ig = font(24, 'Bold')

meta_x = 64
meta_y = my + vh + 36

sku = 'ALCHAN001'
bb = draw.textbbox((0, 0), sku, font=f_sku)
pw, ph = bb[2] - bb[0] + 44, bb[3] - bb[1] + 24
draw.rounded_rectangle([meta_x, meta_y, meta_x + pw, meta_y + ph], radius=999, fill=NAVY)
draw.text((meta_x + 22, meta_y + 10), sku, font=f_sku, fill=WHITE)

nombre = 'Alcancía chanchito'
ny = meta_y + ph + 18
draw.text((meta_x, ny), nombre, font=f_nombre, fill=NAVY)

foot_y = ny + 70
draw.text((meta_x, foot_y), 'Todo es a pedido', font=f_pedido, fill=ORANGE)

ig = '@impresoreando'
ibb = draw.textbbox((0, 0), ig, font=f_ig)
draw.text((W - 64 - (ibb[2] - ibb[0]), foot_y + 4), ig, font=f_ig, fill=HANDLE)

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
