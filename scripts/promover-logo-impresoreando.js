#!/usr/bin/env node
/**
 * Promueve el logo Impresoreando guardado (landing.logoUrl / logo-ui-custom.*)
 * a los archivos canónicos de identidad/ para que UI y agentes usen siempre ese.
 *
 * Fuentes (en orden):
 * 1. data/organizacion-live.json → cli-impresoreando.ficha.landing.logoUrl
 * 2. data/organizacion-respaldo-*.json más reciente con logoUrl
 * 3. identidad/logo-ui-custom.png|.jpg|.webp (si existe)
 *
 * Escribe:
 *  - identidad/logo-ima2.png (default UI)
 *  - identidad/logo-impresoreando-claro.png
 *  - identidad/logo-oficial-ui.png (copia estable con nombre claro)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const IDIR = path.join(ROOT, 'index', 'clientes', 'impresoreando', 'identidad');
const CLI_ID = 'cli-impresoreando';

function leerJson(ruta) {
  try {
    return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  } catch {
    return null;
  }
}

function logoUrlDesdeDatos(obj) {
  if (!obj || !Array.isArray(obj.clientes)) return '';
  const cli = obj.clientes.find((c) => c.id === CLI_ID || c.slug === 'impresoreando');
  const url = cli?.ficha?.landing?.logoUrl;
  return typeof url === 'string' ? url.trim() : '';
}

function candidatosLive() {
  const list = [];
  const live = path.join(DATA, 'organizacion-live.json');
  if (fs.existsSync(live)) list.push(live);
  try {
    fs.readdirSync(DATA)
      .filter((n) => /^organizacion-respaldo-.*\.json$/i.test(n) && !/ejemplo/i.test(n))
      .forEach((n) => list.push(path.join(DATA, n)));
  } catch {
    /* ignore */
  }
  // Preferir live, luego fecha en nombre
  list.sort((a, b) => {
    if (a.endsWith('organizacion-live.json')) return -1;
    if (b.endsWith('organizacion-live.json')) return 1;
    const ma = a.match(/(\d{4}-\d{2}-\d{2})/);
    const mb = b.match(/(\d{4}-\d{2}-\d{2})/);
    return String(mb?.[1] || '').localeCompare(String(ma?.[1] || ''));
  });
  return list;
}

function bufferDesdeLogoUrl(url) {
  if (!url) return null;
  if (/^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(url)) {
    const m = url.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/i);
    if (!m) return null;
    const mime = m[1].toLowerCase();
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
    return { buf: Buffer.from(m[2], 'base64'), ext };
  }
  // Ruta absoluta del sitio o relativa
  let rel = url.split('?')[0];
  if (rel.startsWith('/')) rel = rel.slice(1);
  if (rel.startsWith('index/')) {
    /* ok */
  } else if (rel.includes('identidad/')) {
    const i = rel.indexOf('identidad/');
    rel = path.join('index', 'clientes', 'impresoreando', rel.slice(i)).replace(/\\/g, '/');
  } else if (/^logo-ui-custom/i.test(path.basename(rel))) {
    rel = path.join('index', 'clientes', 'impresoreando', 'identidad', path.basename(rel));
  }
  const abs = path.join(ROOT, rel.replace(/\//g, path.sep));
  if (!fs.existsSync(abs)) return null;
  const ext = path.extname(abs).replace('.', '').toLowerCase() || 'png';
  return { buf: fs.readFileSync(abs), ext: ext === 'jpeg' ? 'jpg' : ext };
}

function bufferDesdeCustomFiles() {
  for (const name of ['logo-ui-custom.png', 'logo-ui-custom.webp', 'logo-ui-custom.jpg', 'logo-ui-custom.jpeg']) {
    const abs = path.join(IDIR, name);
    if (fs.existsSync(abs)) {
      const ext = name.split('.').pop().toLowerCase() === 'jpeg' ? 'jpg' : name.split('.').pop().toLowerCase();
      return { buf: fs.readFileSync(abs), ext, from: abs };
    }
  }
  return null;
}

function main() {
  fs.mkdirSync(IDIR, { recursive: true });

  let source = null;
  let fromLabel = '';

  for (const ruta of candidatosLive()) {
    const obj = leerJson(ruta);
    const url = logoUrlDesdeDatos(obj);
    if (!url) continue;
    const got = bufferDesdeLogoUrl(url);
    if (got && got.buf && got.buf.length > 32) {
      source = got;
      fromLabel = path.basename(ruta) + ' → logoUrl';
      break;
    }
  }

  if (!source) {
    const custom = bufferDesdeCustomFiles();
    if (custom) {
      source = custom;
      fromLabel = custom.from;
    }
  }

  if (!source) {
    console.log('[logo-imp] No hay logo custom en live/respaldo ni logo-ui-custom.* — nada que promover.');
    process.exit(0);
  }

  // Siempre PNG canónico para UI (si viene jpg/webp, igual se guarda como .png bytes? better keep ext)
  // Guardamos bytes tal cual como logo-ima2.png solo si es png; si no, convertimos nombre pero bytes iguales
  // (browsers serve by content). Prefer write as png name always for defaults.
  const targets = [
    path.join(IDIR, 'logo-ima2.png'),
    path.join(IDIR, 'logo-impresoreando-claro.png'),
    path.join(IDIR, 'logo-oficial-ui.png'),
  ];
  // Si no es png, también guardar logo-ui-custom con su ext y copiar bytes a .png filenames
  // (válido si el upload fue png; si jpg, el archivo .png tendrá bytes jpeg — OK para <img>)
  for (const t of targets) {
    fs.writeFileSync(t, source.buf);
  }
  const customOut = path.join(IDIR, `logo-ui-custom.${source.ext === 'jpg' ? 'jpg' : source.ext}`);
  fs.writeFileSync(customOut, source.buf);

  const meta = {
    promovido: new Date().toISOString(),
    desde: fromLabel,
    bytes: source.buf.length,
    ext: source.ext,
    archivos: targets.map((t) => path.relative(ROOT, t).replace(/\\/g, '/')),
  };
  fs.writeFileSync(path.join(IDIR, 'logo-oficial-ui.meta.json'), JSON.stringify(meta, null, 2) + '\n');

  console.log('[logo-imp] Logo canónico actualizado desde', fromLabel);
  console.log('[logo-imp]', Math.round(source.buf.length / 1024) + ' KB → logo-ima2.png + logo-oficial-ui.png');
  console.log('[logo-imp] Siguiente: git add index/clientes/impresoreando/identidad/logo-ima2.png index/clientes/impresoreando/identidad/logo-oficial-ui.png && git commit && git push');
}

main();
