#!/usr/bin/env node
/**
 * Monta pieza IG 1080×1920 Porta Completo Bulldog (PCPEBUL001).
 *
 * Preferencia: foto real del producto (la de Instagram).
 *   index/clientes/impresoreando/piezas/foto-producto-bulldog.jpg
 * Fallback: piezas/porta-completo-bulldog-producto-ref.png
 *
 *   node scripts/montar-pieza-porta-completos-bulldog.js
 *
 * Requiere: Python3 + Pillow (pip install pillow)
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PIEZAS = path.join(ROOT, 'index/clientes/impresoreando/piezas');
const REDES = path.join(ROOT, 'index/clientes/impresoreando/redes');
const LOGO = path.join(ROOT, 'index/clientes/impresoreando/identidad/logo-ima2.png');
const OUT = path.join(PIEZAS, 'porta-completos-bulldog-1080x1920.png');
const OUT2 = path.join(REDES, 'porta-completos-bulldog-1080x1920.png');

const foto =
  [
    path.join(PIEZAS, 'foto-producto-bulldog.jpg'),
    path.join(PIEZAS, 'foto-producto-bulldog.jpeg'),
    path.join(PIEZAS, 'foto-producto-bulldog.png'),
    path.join(PIEZAS, 'porta-completo-bulldog-producto-ref.jpg'),
    path.join(PIEZAS, 'porta-completo-bulldog-producto-ref.png'),
  ].find((p) => fs.existsSync(p)) || null;

if (!foto) {
  console.error('Falta foto del producto. Poné la de Instagram en:');
  console.error('  index/clientes/impresoreando/piezas/foto-producto-bulldog.jpg');
  process.exit(1);
}

const py = `
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
W,H=1080,1920
NAVY=(22,58,107); ORANGE=(240,122,40); CREAM=(247,241,230); CREAM2=(238,230,214); WHITE=(255,253,247)
img=Image.new('RGB',(W,H),CREAM)
d=ImageDraw.Draw(img)
for y in range(H):
  t=y/(H-1)
  d.line([(0,y),(W,y)], fill=(int(CREAM[0]*(1-t)+CREAM2[0]*t), int(CREAM[1]*(1-t)+CREAM2[1]*t), int(CREAM[2]*(1-t)+CREAM2[2]*t)))
d.rectangle([0,0,W,12], fill=ORANGE)
logo=Image.open(r'''${LOGO.replace(/\\/g, '/')}''').convert('RGBA')
lw=560; lh=int(logo.height*(lw/logo.width)); logo=logo.resize((lw,lh), Image.Resampling.LANCZOS)
pad_x,pad_y=32,24; cw,ch=lw+pad_x*2, lh+pad_y*2
card=Image.new('RGBA',(cw,ch),(255,253,247,255)); cd=ImageDraw.Draw(card)
cd.rounded_rectangle([0,0,cw-1,ch-1], radius=26, outline=(22,58,107,90), width=3)
lx=(W-cw)//2; ly=56
img.paste(card,(lx,ly),card); img.paste(logo,(lx+pad_x,ly+pad_y),logo)
prod=Image.open(r'''${foto.replace(/\\/g, '/')}''').convert('RGB')
tw,th=920,1120
scale=max(tw/prod.width, th/prod.height)
prod=prod.resize((int(prod.width*scale), int(prod.height*scale)), Image.Resampling.LANCZOS)
prod=prod.crop(((prod.width-tw)//2,(prod.height-th)//2,(prod.width-tw)//2+tw,(prod.height-th)//2+th))
mask=Image.new('L',(tw,th),0); ImageDraw.Draw(mask).rounded_rectangle([0,0,tw-1,th-1], radius=40, fill=255)
frame=Image.new('RGB',(tw+10,th+10),WHITE); fd=ImageDraw.Draw(frame)
fd.rounded_rectangle([0,0,tw+9,th+9], radius=44, outline=NAVY, width=5)
fx=(W-frame.width)//2; fy=ly+ch+36
img.paste(frame,(fx,fy)); img.paste(prod,(fx+5,fy+5),mask)
def font(sz,bold=False):
  p='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
  return ImageFont.truetype(p,sz) if Path(p).exists() else ImageFont.load_default()
f_sku,f_title,f_meta,f_handle=font(34,True),font(48,True),font(30,True),font(28,False)
sku='PCPEBUL001'; bb=d.textbbox((0,0),sku,font=f_sku); pw,ph=bb[2]-bb[0]+48, bb[3]-bb[1]+26
px=(W-pw)//2; py=fy+frame.height+32
d.rounded_rectangle([px,py,px+pw,py+ph], radius=999, fill=NAVY)
d.text((px+24,py+10),sku,font=f_sku,fill=WHITE)
title='Porta Completo Perro Bulldog'; tb=d.textbbox((0,0),title,font=f_title)
tx=(W-(tb[2]-tb[0]))//2; ty=py+ph+22
d.text((tx,ty),title,font=f_title,fill=NAVY)
rb=d.textbbox((0,0),'@impresoreando',font=f_handle); my=ty+(tb[3]-tb[1])+28
d.text((72,my),'Todo es a pedido',font=f_meta,fill=ORANGE)
d.text((W-72-(rb[2]-rb[0]),my),'@impresoreando',font=f_handle,fill=NAVY)
d.rectangle([0,H-16,W,H], fill=NAVY); d.rectangle([0,H-16,240,H], fill=ORANGE)
Path(r'''${OUT.replace(/\\/g, '/')}''').parent.mkdir(parents=True, exist_ok=True)
Path(r'''${OUT2.replace(/\\/g, '/')}''').parent.mkdir(parents=True, exist_ok=True)
img.save(r'''${OUT.replace(/\\/g, '/')}''','PNG',optimize=True)
img.save(r'''${OUT2.replace(/\\/g, '/')}''','PNG',optimize=True)
print('OK', r'''${OUT.replace(/\\/g, '/')}''')
print('foto:', r'''${foto.replace(/\\/g, '/')}''')
`;

const r = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);
if (r.status) process.exit(r.status);
console.log('Ver: index/clientes/impresoreando/piezas/porta-completos-bulldog-1080x1920.png');
console.log('IG:  http://127.0.0.1:8000/index/clientes/impresoreando/piezas/porta-completos-bulldog-1080x1920.png');
