#!/usr/bin/env node
/**
 * Servidor local: archivos estáticos + API que guarda organizacion_v2 en disco.
 * Uso: node scripts/organizacion-server.js
 * Puerto: 3000 (o PORT) · Solo localhost por defecto (HOST=127.0.0.1)
 *
 * Seguridad opcional: define ORGANIZACION_TOKEN en .env para exigir cabecera
 * X-Organizacion-Token en GET/POST /api/organizacion
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 3000;
/** Por defecto abierto a la LAN (celular en misma WiFi). Usar HOST=127.0.0.1 para solo esta PC. */
const HOST = process.env.HOST || '0.0.0.0';
const LIVE_FILE = path.join(ROOT, 'data', 'organizacion-live.json');
const IMP_LIVE_FILE = path.join(ROOT, 'data', 'impresoreando-live.json');
const IMP_SEED_FILE = path.join(ROOT, 'data', 'impresoreando-seed.json');
const ECR_PORTADA_HISTORIAL = path.join(ROOT, 'index', 'clientes', 'ecr', 'newsletter', 'historial-portadas.json');
const ECR_PORTADA_MD = path.join(ROOT, 'index', 'clientes', 'ecr', 'newsletter', 'HISTORIAL-PORTADAS.md');
const ECR_PORTADA_DIR = path.join(ROOT, 'index', 'clientes', 'ecr', 'newsletter', 'portadas-guardadas');
const MAX_BODY_BYTES = Number(process.env.MAX_BODY_BYTES) || 12 * 1024 * 1024;
const API_TOKEN = (process.env.ORGANIZACION_TOKEN || '').trim();
const VENTA_PATH = '/index/clientes/impresoreando/panel/venta/';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

/** Rutas que no se sirven por HTTP (aunque existan en disco) */
const STATIC_DENY = [
  /^\.git(?:\/|$)/i,
  /^\.env$/i,
  /^\.organizacion-token$/i,
  /^backend(?:\/|$)/i,
  /^node_modules(?:\/|$)/i,
  /^data\/organizacion-live\.json$/i,
  /^data\/impresoreando-live\.json$/i,
  /\.log$/i,
  /^GIT_RESULT\.txt$/i,
  /^git-log\.txt$/i,
  /^run-git\.ps1$/i,
];

function loadEnvFile() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) return;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  });
}

loadEnvFile();

const RUNTIME_TOKEN = (process.env.ORGANIZACION_TOKEN || API_TOKEN || '').trim();
const RUNTIME_HOST = process.env.HOST || HOST;
const RUNTIME_MAX_BODY = Number(process.env.MAX_BODY_BYTES) || MAX_BODY_BYTES;

function lanAddresses() {
  const os = require('os');
  const out = [];
  const ifaces = os.networkInterfaces();
  for (const list of Object.values(ifaces)) {
    for (const info of list || []) {
      if (info.family !== 'IPv4' || info.internal) continue;
      out.push(info.address);
    }
  }
  return out;
}

function accesoInfo() {
  const lan = lanAddresses();
  return {
    port: PORT,
    host: RUNTIME_HOST,
    ventaPath: VENTA_PATH,
    localhost: `http://localhost:${PORT}${VENTA_PATH}`,
    lan: lan.map((ip) => `http://${ip}:${PORT}${VENTA_PATH}`),
    panelLan: lan.map((ip) => `http://${ip}:${PORT}/index/clientes/impresoreando/panel/`),
    hint:
      'localhost solo funciona en esta PC. En el celular usa la IP de la WiFi o ABRIR-VENTA-PUBLICA.bat para un link de cualquier lugar.',
  };
}

function securityHeaders() {
  return {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

function send(res, code, body, type) {
  res.writeHead(code, {
    ...securityHeaders(),
    'Content-Type': type || 'text/plain; charset=utf-8',
  });
  res.end(body);
}

function relFromUrl(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  return decoded.replace(/^\/+/, '') || 'index.html';
}

function isPathDenied(rel) {
  const normalized = rel.replace(/\\/g, '/');
  return STATIC_DENY.some((re) => re.test(normalized));
}

function safePath(urlPath) {
  let rel = relFromUrl(urlPath);
  if (rel === 'index' || rel === 'index/') rel = 'index.html';
  if (isPathDenied(rel)) return null;
  const abs = path.normalize(path.join(ROOT, rel));
  if (!abs.startsWith(ROOT)) return null;
  const relCheck = path.relative(ROOT, abs).replace(/\\/g, '/');
  if (isPathDenied(relCheck)) return null;
  return abs;
}

/** Resuelve ruta sin .html, carpetas con index.html, etc. */
function resolveStaticFile(urlPath) {
  const base = safePath(urlPath);
  if (!base) return null;

  const candidates = [];
  if (fs.existsSync(base)) {
    const stat = fs.statSync(base);
    if (stat.isFile()) return base;
    if (stat.isDirectory()) candidates.push(path.join(base, 'index.html'));
  }
  if (!base.endsWith('.html')) candidates.push(`${base}.html`);
  candidates.push(path.join(base, 'index.html'));

  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

function redirectJoyasMercury(res, urlPath) {
  const q = urlPath.includes('?') ? urlPath.slice(urlPath.indexOf('?')) : '';
  const target = `/index/clientes/joyasmercury/index.html${q || '?v=secciones3'}`;
  res.writeHead(302, { Location: target, ...securityHeaders() });
  res.end();
}

function tokensMatch(given, expected) {
  if (!expected) return true;
  if (!given || typeof given !== 'string') return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function checkApiAuth(req, res) {
  if (!RUNTIME_TOKEN) return true;
  const given = req.headers['x-organizacion-token'];
  if (tokensMatch(given, RUNTIME_TOKEN)) return true;
  send(res, 401, JSON.stringify({ error: 'No autorizado — falta X-Organizacion-Token' }), 'application/json');
  return false;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > RUNTIME_MAX_BODY) {
        reject(new Error('BODY_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/** Lectura binaria (videos MP4, etc.) con tope propio. */
function readBodyBinary(req, maxBytes) {
  const limit = Number(maxBytes) || RUNTIME_MAX_BODY;
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('BODY_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function slugPortada(titulo) {
  return String(titulo || 'portada')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'portada';
}

function leerHistorialPortada() {
  if (!fs.existsSync(ECR_PORTADA_HISTORIAL)) {
    return { version: 1, updatedAt: null, items: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(ECR_PORTADA_HISTORIAL, 'utf8'));
  } catch {
    return { version: 1, updatedAt: null, items: [] };
  }
}

function escribirIndiceMarkdown(data) {
  const lines = [
    '# Historial de portadas Midjourney (solo fondo)',
    '',
    'Cada prompt/resultado entregado o generado queda guardado aquí y en',
    '[`historial-portadas.json`](./historial-portadas.json).',
    'Archivos individuales: carpeta [`portadas-guardadas/`](./portadas-guardadas/).',
    '',
    '**Regla:** Midjourney = **solo imagen de fondo**. Tipografía/logo → Canva.',
    '',
  ];
  const items = Array.isArray(data.items) ? data.items.slice().reverse() : [];
  for (const it of items) {
    lines.push(`## ${it.titulo || it.id}`);
    lines.push('');
    lines.push(`- **Fecha:** ${it.fecha || ''}`);
    lines.push(`- **Mundo:** ${it.mundoId || ''} — ${it.mundoNombre || ''}`);
    lines.push(`- **Origen:** ${it.origen || 'ui'}`);
    if (it.archivoMarkdown) {
      lines.push(`- **Detalle:** [${it.archivoMarkdown}](./${it.archivoMarkdown})`);
    }
    lines.push('');
  }
  fs.writeFileSync(ECR_PORTADA_MD, lines.join('\n') + '\n', 'utf8');
}

function guardarItemPortada(item) {
  const data = leerHistorialPortada();
  data.version = 1;
  data.items = Array.isArray(data.items) ? data.items : [];
  data.nota = 'Historial de prompts Midjourney — SOLO imagen de fondo de portada. Cada resultado entregado o generado queda aquí.';

  const id = item.id || `portada-${slugPortada(item.titulo)}-${Date.now().toString(36)}`;
  const fecha = item.fecha || new Date().toISOString().slice(0, 10);
  const slug = slugPortada(item.titulo || id);
  const mdRel = `portadas-guardadas/${slug}.md`;
  const mdAbs = path.join(ROOT, 'index', 'clientes', 'ecr', 'newsletter', mdRel);

  const entry = {
    id,
    fecha,
    titulo: String(item.titulo || '').trim(),
    mundoId: item.mundoId || '',
    mundoNombre: item.mundoNombre || '',
    prompt: String(item.prompt || '').trim(),
    opciones: Array.isArray(item.opciones) ? item.opciones : undefined,
    notas: item.notas || 'Solo fondo de portada. Sin flags Midjourney.',
    origen: item.origen || 'ui',
    archivoMarkdown: mdRel,
  };

  const idx = data.items.findIndex((x) => x.id === id || (x.titulo && x.titulo === entry.titulo && x.prompt === entry.prompt));
  if (idx >= 0) data.items[idx] = { ...data.items[idx], ...entry };
  else data.items.push(entry);

  data.updatedAt = new Date().toISOString();

  fs.mkdirSync(ECR_PORTADA_DIR, { recursive: true });
  const ops = Array.isArray(entry.opciones) && entry.opciones.length
    ? entry.opciones
    : [{ opcion: 1, mundoId: entry.mundoId, mundoNombre: entry.mundoNombre, prompt: entry.prompt }];
  const mdOps = ops.map((op) => [
    `### Opción ${op.opcion || ''} · Mundo ${op.mundoId || ''} — ${op.mundoNombre || ''}`,
    '',
    '```',
    op.prompt || '',
    '```',
    '',
  ].join('\n')).join('\n');
  const mdBody = [
    `# Portada guardada — ${entry.titulo}`,
    '',
    '**Alcance:** solo imagen de **fondo** (sin tipografía ni logo).',
    '**Formato:** 3 opciones de prompt. **Sin flags** `--ar` / `--style` / `--v` / `--no` (Midjourney no los lee en este flujo).',
    `**Artículo:** ${entry.titulo}`,
    `**Fecha:** ${entry.fecha}`,
    `**Mundo preferido:** ${entry.mundoId} — ${entry.mundoNombre}`,
    `**Origen:** ${entry.origen}`,
    '',
    '## Prompts Midjourney',
    '',
    mdOps,
    '## Notas',
    '',
    entry.notas,
    '',
  ].join('\n');
  fs.writeFileSync(mdAbs, mdBody, 'utf8');
  fs.writeFileSync(ECR_PORTADA_HISTORIAL, JSON.stringify(data, null, 2) + '\n', 'utf8');
  escribirIndiceMarkdown(data);
  return entry;
}

function handleApiEcrPortadaHistorial(req, res) {
  if (req.method === 'GET') {
    const data = leerHistorialPortada();
    return send(res, 200, JSON.stringify(data), 'application/json');
  }

  if (req.method === 'POST') {
    return readBody(req).then((raw) => {
      let obj;
      try {
        obj = JSON.parse(raw);
      } catch {
        return send(res, 400, JSON.stringify({ error: 'JSON inválido' }), 'application/json');
      }
      if (!obj || !String(obj.titulo || '').trim() || !String(obj.prompt || '').trim()) {
        return send(res, 400, JSON.stringify({ error: 'faltan titulo o prompt' }), 'application/json');
      }
      const saved = guardarItemPortada(obj);
      console.log('[api] Portada guardada', saved.id, saved.titulo);
      return send(res, 200, JSON.stringify({ ok: true, item: saved }), 'application/json');
    }).catch((e) => {
      if (e && e.message === 'BODY_TOO_LARGE') {
        return send(res, 413, JSON.stringify({ error: 'cuerpo demasiado grande' }), 'application/json');
      }
      return send(res, 500, String(e), 'text/plain');
    });
  }

  send(res, 405, 'Método no permitido');
}

function handleApiOrganizacion(req, res) {
  if (!checkApiAuth(req, res)) return;

  if (req.method === 'GET') {
    if (!fs.existsSync(LIVE_FILE)) {
      return send(res, 404, JSON.stringify({ error: 'sin archivo live' }), 'application/json');
    }
    const body = fs.readFileSync(LIVE_FILE, 'utf8');
    return send(res, 200, body, 'application/json');
  }

  if (req.method === 'POST') {
    return readBody(req).then((raw) => {
      let obj;
      try {
        obj = JSON.parse(raw);
      } catch {
        return send(res, 400, JSON.stringify({ error: 'JSON inválido' }), 'application/json');
      }
      if (!obj || !Array.isArray(obj.clientes) || !Array.isArray(obj.tareas)) {
        return send(res, 400, JSON.stringify({ error: 'faltan clientes[] o tareas[]' }), 'application/json');
      }
      obj.respaldoActualizado = obj.respaldoActualizado || new Date().toISOString().slice(0, 10);
      fs.mkdirSync(path.dirname(LIVE_FILE), { recursive: true });
      fs.writeFileSync(LIVE_FILE, JSON.stringify(obj, null, 2), 'utf8');
      console.log('[api] Guardado', LIVE_FILE, `(${obj.tareas.length} tareas, ${obj.clientes.length} clientes)`);
      return send(res, 200, JSON.stringify({ ok: true, path: 'data/organizacion-live.json' }), 'application/json');
    }).catch((e) => {
      if (e && e.message === 'BODY_TOO_LARGE') {
        return send(res, 413, JSON.stringify({ error: 'cuerpo demasiado grande' }), 'application/json');
      }
      return send(res, 500, String(e), 'text/plain');
    });
  }

  send(res, 405, 'Método no permitido');
}

function handleApiConfig(res) {
  send(res, 200, JSON.stringify({
    authRequired: !!RUNTIME_TOKEN,
    maxBodyBytes: RUNTIME_MAX_BODY,
  }), 'application/json');
}

function ensureImpresoreandoLive() {
  if (fs.existsSync(IMP_LIVE_FILE)) return;
  if (!fs.existsSync(IMP_SEED_FILE)) {
    throw new Error('Falta data/impresoreando-seed.json');
  }
  fs.mkdirSync(path.dirname(IMP_LIVE_FILE), { recursive: true });
  fs.copyFileSync(IMP_SEED_FILE, IMP_LIVE_FILE);
  console.log('[api] Seed Impresoreando → data/impresoreando-live.json');
}

function handleApiImpresoreando(req, res) {
  if (!checkApiAuth(req, res)) return;

  const urlPath = String(req.url || '').split('?')[0];

  /** Append de una venta (link compartido Josefa/Nicolás) — evita pisar datos concurrentes. */
  if (urlPath === '/api/impresoreando/venta' && req.method === 'POST') {
    return readBody(req).then((raw) => {
      let item;
      try {
        item = JSON.parse(raw);
      } catch {
        return send(res, 400, JSON.stringify({ error: 'JSON inválido' }), 'application/json');
      }
      if (!item || typeof item !== 'object' || !item.descripcion || item.montoNeto == null) {
        return send(res, 400, JSON.stringify({ error: 'faltan descripcion / montoNeto' }), 'application/json');
      }
      try {
        ensureImpresoreandoLive();
      } catch (e) {
        return send(res, 500, JSON.stringify({ error: String(e.message || e) }), 'application/json');
      }
      let obj;
      try {
        obj = JSON.parse(fs.readFileSync(IMP_LIVE_FILE, 'utf8'));
      } catch (e) {
        return send(res, 500, JSON.stringify({ error: String(e.message || e) }), 'application/json');
      }
      obj.ventas = Array.isArray(obj.ventas) ? obj.ventas : [];
      const venta = {
        id: String(item.id || `ven-${Date.now().toString(36)}`),
        fecha: String(item.fecha || new Date().toISOString().slice(0, 10)),
        descripcion: String(item.descripcion),
        cantidad: Number(item.cantidad || 1),
        montoNeto: Number(item.montoNeto),
        canal: String(item.canal || ''),
        notas: String(item.notas || ''),
        socioRegistro: String(item.socioRegistro || 'Ambos'),
      };
      obj.ventas.push(venta);
      obj.meta = obj.meta || {};
      obj.meta.actualizado = new Date().toISOString();
      fs.writeFileSync(IMP_LIVE_FILE, JSON.stringify(obj, null, 2), 'utf8');
      const totalVentas = obj.ventas.reduce((a, v) => a + Number(v.montoNeto || 0), 0);
      const totalGastos = (obj.gastos || []).reduce((a, g) => a + Number(g.montoNeto || 0), 0);
      console.log('[api] Venta Impresoreando', venta.id, venta.montoNeto);
      return send(
        res,
        200,
        JSON.stringify({
          ok: true,
          venta,
          totales: { ventas: totalVentas, gastos: totalGastos, saldo: Math.max(0, totalGastos - totalVentas) },
          actualizado: obj.meta.actualizado,
        }),
        'application/json'
      );
    }).catch((e) => {
      if (e && e.message === 'BODY_TOO_LARGE') {
        return send(res, 413, JSON.stringify({ error: 'cuerpo demasiado grande' }), 'application/json');
      }
      return send(res, 500, String(e), 'text/plain');
    });
  }

  if (req.method === 'GET') {
    try {
      ensureImpresoreandoLive();
    } catch (e) {
      return send(res, 500, JSON.stringify({ error: String(e.message || e) }), 'application/json');
    }
    const body = fs.readFileSync(IMP_LIVE_FILE, 'utf8');
    return send(res, 200, body, 'application/json');
  }

  if (req.method === 'POST') {
    return readBody(req).then((raw) => {
      let obj;
      try {
        obj = JSON.parse(raw);
      } catch {
        return send(res, 400, JSON.stringify({ error: 'JSON inválido' }), 'application/json');
      }
      if (!obj || typeof obj !== 'object' || !Array.isArray(obj.gastos)) {
        return send(res, 400, JSON.stringify({ error: 'faltan gastos[] (estructura Impresoreando)' }), 'application/json');
      }
      if (!obj.meta) obj.meta = {};
      obj.meta.actualizado = new Date().toISOString();
      fs.mkdirSync(path.dirname(IMP_LIVE_FILE), { recursive: true });
      fs.writeFileSync(IMP_LIVE_FILE, JSON.stringify(obj, null, 2), 'utf8');
      console.log('[api] Guardado Impresoreando', IMP_LIVE_FILE, `(${obj.gastos.length} gastos, ${(obj.ventas || []).length} ventas)`);
      return send(res, 200, JSON.stringify({ ok: true, path: 'data/impresoreando-live.json', actualizado: obj.meta.actualizado }), 'application/json');
    }).catch((e) => {
      if (e && e.message === 'BODY_TOO_LARGE') {
        return send(res, 413, JSON.stringify({ error: 'cuerpo demasiado grande' }), 'application/json');
      }
      return send(res, 500, String(e), 'text/plain');
    });
  }

  send(res, 405, 'Método no permitido');
}

function slugSeguro(s) {
  return String(s || 'x')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'x';
}

/** Guarda logo de marca del cliente en identidad/ (p. ej. Impresoreando). */
function handleApiClienteLogo(req, res) {
  if (!checkApiAuth(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, 'Método no permitido');

  return readBody(req).then((raw) => {
    let obj;
    try {
      obj = JSON.parse(raw);
    } catch {
      return send(res, 400, JSON.stringify({ error: 'JSON inválido' }), 'application/json');
    }
    const slug = String(obj.slug || '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    const dataUrl = String(obj.dataUrl || '');
    if (!['impresoreando'].includes(slug)) {
      return send(res, 400, JSON.stringify({ error: 'slug no permitido' }), 'application/json');
    }
    const m = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!m) {
      return send(res, 400, JSON.stringify({ error: 'dataUrl no válida' }), 'application/json');
    }
    const mime = m[1].toLowerCase();
    const ext =
      mime.includes('png') ? 'png' :
      mime.includes('webp') ? 'webp' :
      mime.includes('gif') ? 'gif' : 'jpg';
    let buf;
    try {
      buf = Buffer.from(m[2], 'base64');
    } catch {
      return send(res, 400, JSON.stringify({ error: 'base64 inválido' }), 'application/json');
    }
    if (!buf.length || buf.length > 8 * 1024 * 1024) {
      return send(res, 413, JSON.stringify({ error: 'imagen demasiado grande (máx 8 MB)' }), 'application/json');
    }
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const fileName = `logo-ui-custom-${stamp}.${ext}`;
    const relDir = path.join('index', 'clientes', slug, 'identidad');
    const absDir = path.join(ROOT, relDir);
    fs.mkdirSync(absDir, { recursive: true });
    fs.writeFileSync(path.join(absDir, fileName), buf);
    fs.writeFileSync(path.join(absDir, `logo-ui-custom.${ext}`), buf);
    const url = `/${relDir.replace(/\\/g, '/')}/${fileName}`;
    const stableUrl = `/${relDir.replace(/\\/g, '/')}/logo-ui-custom.${ext}?v=${stamp}`;
    console.log('[api] Logo cliente', url, `(${Math.round(buf.length / 1024)} KB)`);
    return send(
      res,
      200,
      JSON.stringify({ ok: true, url, stableUrl, bytes: buf.length }),
      'application/json'
    );
  }).catch((e) => {
    if (e && e.message === 'BODY_TOO_LARGE') {
      return send(res, 413, JSON.stringify({ error: 'cuerpo demasiado grande' }), 'application/json');
    }
    return send(res, 500, String(e), 'text/plain');
  });
}

/** Guarda imagen de tarea en disco (evita saturar localStorage con data URLs). */
function handleApiTareaImagen(req, res) {
  if (!checkApiAuth(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, 'Método no permitido');

  return readBody(req).then((raw) => {
    let obj;
    try {
      obj = JSON.parse(raw);
    } catch {
      return send(res, 400, JSON.stringify({ error: 'JSON inválido' }), 'application/json');
    }
    const tareaId = String(obj.tareaId || '').trim();
    const clienteId = String(obj.clienteId || '').trim() || 'sin-cliente';
    const dataUrl = String(obj.dataUrl || '');
    if (!tareaId || !dataUrl.startsWith('data:image/')) {
      return send(res, 400, JSON.stringify({ error: 'faltan tareaId o dataUrl de imagen' }), 'application/json');
    }
    const m = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!m) {
      return send(res, 400, JSON.stringify({ error: 'dataUrl no válida' }), 'application/json');
    }
    const mime = m[1].toLowerCase();
    const ext =
      mime.includes('png') ? 'png' :
      mime.includes('webp') ? 'webp' :
      mime.includes('gif') ? 'gif' : 'jpg';
    let buf;
    try {
      buf = Buffer.from(m[2], 'base64');
    } catch {
      return send(res, 400, JSON.stringify({ error: 'base64 inválido' }), 'application/json');
    }
    if (!buf.length || buf.length > 8 * 1024 * 1024) {
      return send(res, 413, JSON.stringify({ error: 'imagen demasiado grande (máx 8 MB)' }), 'application/json');
    }

    const baseName = slugSeguro(String(obj.nombre || '').replace(/\.[^.]+$/, '')) || 'imagen';
    const fileName = `${Date.now()}-${baseName}.${ext}`;
    const relDir = path.join('index', 'uploads', 'tarea-imagenes', slugSeguro(clienteId), slugSeguro(tareaId));
    const absDir = path.join(ROOT, relDir);
    fs.mkdirSync(absDir, { recursive: true });
    const absFile = path.join(absDir, fileName);
    fs.writeFileSync(absFile, buf);
    const url = `/${relDir.replace(/\\/g, '/')}/${fileName}`;
    console.log('[api] Imagen tarea', url, `(${Math.round(buf.length / 1024)} KB)`);
    return send(
      res,
      200,
      JSON.stringify({ ok: true, url, nombre: obj.nombre || fileName, bytes: buf.length }),
      'application/json'
    );
  }).catch((e) => {
    if (e && e.message === 'BODY_TOO_LARGE') {
      return send(res, 413, JSON.stringify({ error: 'cuerpo demasiado grande' }), 'application/json');
    }
    return send(res, 500, String(e), 'text/plain');
  });
}

const MAX_TAREA_ARCHIVO_BYTES = Number(process.env.MAX_TAREA_ARCHIVO_BYTES) || 120 * 1024 * 1024;

const zlib = require('zlib');

/** Extrae texto plano de un .docx (ZIP con word/document.xml). */
function textoDesdeDocxBuffer(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 30) return '';
  const nameWanted = 'word/document.xml';

  // Preferir directorio central: Office suele poner tamaños 0 en el local header (data descriptor).
  let end = -1;
  const searchFrom = Math.max(0, buf.length - 65557);
  for (let i = buf.length - 22; i >= searchFrom; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end >= 0) {
    const cdOffset = buf.readUInt32LE(end + 16);
    const cdEntries = buf.readUInt16LE(end + 10);
    let o = cdOffset;
    for (let i = 0; i < cdEntries; i++) {
      if (o + 46 > buf.length || buf.readUInt32LE(o) !== 0x02014b50) break;
      const method = buf.readUInt16LE(o + 10);
      const compSize = buf.readUInt32LE(o + 20);
      const nameLen = buf.readUInt16LE(o + 28);
      const extraLen = buf.readUInt16LE(o + 30);
      const commentLen = buf.readUInt16LE(o + 32);
      const localOff = buf.readUInt32LE(o + 42);
      const name = buf.slice(o + 46, o + 46 + nameLen).toString('utf8');
      if (name === nameWanted && localOff + 30 <= buf.length && buf.readUInt32LE(localOff) === 0x04034b50) {
        const lNameLen = buf.readUInt16LE(localOff + 26);
        const lExtra = buf.readUInt16LE(localOff + 28);
        const dataStart = localOff + 30 + lNameLen + lExtra;
        const dataEnd = dataStart + compSize;
        if (dataEnd > buf.length) break;
        let xmlBuf;
        try {
          if (method === 0) xmlBuf = buf.slice(dataStart, dataEnd);
          else if (method === 8) xmlBuf = zlib.inflateRawSync(buf.slice(dataStart, dataEnd));
          else return '';
        } catch {
          return '';
        }
        let xml = xmlBuf.toString('utf8');
        xml = xml.replace(/<\/w:p>/g, '\n');
        xml = xml.replace(/<[^>]+>/g, '');
        xml = xml
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#xa0;/gi, ' ')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        return xml;
      }
      o += 46 + nameLen + extraLen + commentLen;
    }
  }

  // Fallback: recorrer local headers (útil en ZIP sin data descriptor).
  let offset = 0;
  while (offset + 30 < buf.length) {
    if (buf.readUInt32LE(offset) !== 0x04034b50) break;
    const method = buf.readUInt16LE(offset + 8);
    const compSize = buf.readUInt32LE(offset + 18);
    const uncompSize = buf.readUInt32LE(offset + 22);
    const nameLen = buf.readUInt16LE(offset + 26);
    const extraLen = buf.readUInt16LE(offset + 28);
    const name = buf.slice(offset + 30, offset + 30 + nameLen).toString('utf8');
    const dataStart = offset + 30 + nameLen + extraLen;
    const dataEnd = dataStart + compSize;
    if (name === nameWanted && compSize > 0) {
      let xmlBuf;
      try {
        if (method === 0) xmlBuf = buf.slice(dataStart, dataEnd);
        else if (method === 8) xmlBuf = zlib.inflateRawSync(buf.slice(dataStart, dataEnd));
        else return '';
      } catch {
        return '';
      }
      let xml = xmlBuf.toString('utf8');
      xml = xml.replace(/<\/w:p>/g, '\n');
      xml = xml.replace(/<[^>]+>/g, '');
      xml = xml
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#xa0;/gi, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      return xml;
    }
    if (compSize === 0) break;
    offset = dataEnd;
    if (compSize === 0 && uncompSize === 0 && nameLen === 0) break;
  }
  return '';
}

function textoDesdeArticuloAbs(absPath) {
  if (!absPath || !fs.existsSync(absPath)) return '';
  const ext = path.extname(absPath).toLowerCase();
  try {
    if (ext === '.txt') return fs.readFileSync(absPath, 'utf8');
    if (ext === '.docx') return textoDesdeDocxBuffer(fs.readFileSync(absPath));
  } catch {
    return '';
  }
  return '';
}

/**
 * Lee texto de un artículo en disco (txt/docx bajo index/).
 * GET /api/articulo-texto?path=index/...
 */
function handleApiArticuloTexto(req, res) {
  if (!checkApiAuth(req, res)) return;
  if (req.method !== 'GET') return send(res, 405, 'Método no permitido');
  const u = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  let rel = String(u.searchParams.get('path') || '')
    .replace(/^\/+/, '')
    .replace(/\\/g, '/');
  if (!rel || rel.includes('..')) {
    return send(res, 400, JSON.stringify({ error: 'path inválido' }), 'application/json');
  }
  if (!/^(index\/(clientes|uploads)\/)/i.test(rel)) {
    return send(res, 403, JSON.stringify({ error: 'ruta no permitida' }), 'application/json');
  }
  if (!/\.(txt|docx)$/i.test(rel)) {
    return send(res, 415, JSON.stringify({ error: 'solo .txt o .docx' }), 'application/json');
  }
  const abs = path.join(ROOT, rel);
  if (!abs.startsWith(ROOT) || !fs.existsSync(abs)) {
    return send(res, 404, JSON.stringify({ error: 'archivo no encontrado' }), 'application/json');
  }
  const texto = textoDesdeArticuloAbs(abs);
  if (!texto) {
    return send(res, 422, JSON.stringify({ error: 'no se pudo extraer texto' }), 'application/json');
  }
  return send(res, 200, JSON.stringify({ ok: true, path: rel, texto, chars: texto.length }), 'application/json');
}

/**
 * Sube archivo binario de tarea (video MP4/WebM/MOV u otros).
 * POST /api/tarea-archivo?tareaId=&clienteId=&nombre=
 * Body: bytes crudos · Content-Type: video/mp4 (etc.)
 */
function handleApiTareaArchivo(req, res) {
  if (!checkApiAuth(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, 'Método no permitido');

  const u = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const tareaId = String(u.searchParams.get('tareaId') || '').trim();
  const clienteId = String(u.searchParams.get('clienteId') || '').trim() || 'sin-cliente';
  const nombreParam = String(u.searchParams.get('nombre') || '').trim();
  const rolParam = String(u.searchParams.get('rol') || '').trim().toLowerCase();
  if (!tareaId) {
    return send(res, 400, JSON.stringify({ error: 'falta tareaId' }), 'application/json');
  }

  const mime = String(req.headers['content-type'] || 'application/octet-stream').split(';')[0].trim().toLowerCase();
  const nombreLower = nombreParam.toLowerCase();
  const esArticuloExt = /\.(pdf|txt|docx?|odt|md|rtf|png|jpe?g|webp|gif|bmp|heic)$/i.test(nombreLower);
  const forzarArticulo = rolParam === 'articulo';
  const allowed =
    mime.startsWith('video/') ||
    mime.startsWith('image/') ||
    mime.startsWith('text/') ||
    mime === 'application/octet-stream' ||
    mime === 'application/pdf' ||
    mime === 'application/msword' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mime === 'application/vnd.oasis.opendocument.text' ||
    esArticuloExt;
  if (!allowed) {
    return send(res, 415, JSON.stringify({ error: 'tipo no permitido: ' + mime }), 'application/json');
  }

  const extFromName = path.extname(nombreParam).toLowerCase().replace(/^\./, '');
  const extFromMime =
    mime.includes('webm') ? 'webm' :
    mime.includes('quicktime') || mime.includes('mov') ? 'mov' :
    mime.includes('mp4') ? 'mp4' :
    mime.includes('png') ? 'png' :
    mime.includes('webp') ? 'webp' :
    mime.includes('gif') ? 'gif' :
    mime.includes('pdf') ? 'pdf' :
    mime.includes('wordprocessingml') || mime.includes('msword') ? (mime.includes('wordprocessingml') ? 'docx' : 'doc') :
    mime.includes('opendocument.text') ? 'odt' :
    mime.includes('text/plain') || mime.includes('text/markdown') ? (mime.includes('markdown') ? 'md' : 'txt') :
    mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : '';
  const ext = extFromName || extFromMime || 'bin';
  if (/^(mp4|webm|mov)$/i.test(ext) === false && mime.startsWith('video/')) {
    // aún permitir videos con extensión rara
  }

  return readBodyBinary(req, MAX_TAREA_ARCHIVO_BYTES).then((buf) => {
    if (!buf.length) {
      return send(res, 400, JSON.stringify({ error: 'archivo vacío' }), 'application/json');
    }
    const baseName = slugSeguro(nombreParam.replace(/\.[^.]+$/, '')) || 'archivo';
    const fileName = `${Date.now()}-${baseName}.${ext}`;
    const esArticuloDoc = /^(pdf|txt|docx?|odt|md|rtf)$/i.test(ext);
    const esArticulo = forzarArticulo || esArticuloDoc;
    const sub = mime.startsWith('video/') && !forzarArticulo
      ? 'tarea-videos'
      : esArticulo
        ? 'tarea-articulos'
        : 'tarea-archivos';
    const relDir = path.join('index', 'uploads', sub, slugSeguro(clienteId), slugSeguro(tareaId));
    const absDir = path.join(ROOT, relDir);
    fs.mkdirSync(absDir, { recursive: true });
    const absFile = path.join(absDir, fileName);
    fs.writeFileSync(absFile, buf);
    const url = `/${relDir.replace(/\\/g, '/')}/${fileName}`;
    const kind = mime.startsWith('video/') && !forzarArticulo
      ? 'video'
      : esArticulo
        ? 'articulo'
        : mime.startsWith('image/')
          ? 'image'
          : 'file';
    let txtUrl = null;
    let textoPreview = null;
    if (kind === 'articulo' && /\.(txt|docx|md)$/i.test(fileName)) {
      try {
        const texto = textoDesdeArticuloAbs(absFile);
        if (texto && String(texto).trim()) {
          const txtName = fileName.replace(/\.[^.]+$/, '') + '.txt';
          const absTxt = path.join(absDir, txtName);
          // Si ya subieron un .txt, no pisar con otro nombre; el propio archivo es el texto.
          if (/\.txt$/i.test(fileName)) {
            txtUrl = url;
          } else {
            fs.writeFileSync(absTxt, texto, 'utf8');
            txtUrl = `/${relDir.replace(/\\/g, '/')}/${txtName}`;
          }
          textoPreview = String(texto).slice(0, 400);
        }
      } catch (e) {
        console.warn('[api] No se pudo extraer texto del artículo:', e && e.message);
      }
    }
    console.log('[api] Archivo tarea', kind, url, `(${Math.round(buf.length / 1024)} KB)`);
    return send(
      res,
      200,
      JSON.stringify({
        ok: true,
        url,
        txtUrl,
        textoPreview,
        nombre: nombreParam || fileName,
        bytes: buf.length,
        mime,
        kind,
      }),
      'application/json'
    );
  }).catch((e) => {
    if (e && e.message === 'BODY_TOO_LARGE') {
      return send(
        res,
        413,
        JSON.stringify({ error: 'archivo demasiado grande (máx ~120 MB)' }),
        'application/json'
      );
    }
    return send(res, 500, String(e), 'text/plain');
  });
}

/**
 * Guarda un TXT de prompt (solo bajo index/clientes/<cliente>/prompts/*.txt).
 * POST /api/prompt-txt  JSON { archivo, texto }
 */
function handleApiPromptTxt(req, res) {
  if (!checkApiAuth(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, 'Método no permitido');

  return readBody(req)
    .then((raw) => {
      let obj;
      try {
        obj = JSON.parse(raw);
      } catch {
        return send(res, 400, JSON.stringify({ error: 'JSON inválido' }), 'application/json');
      }
      const archivo = String(obj.archivo || '')
        .replace(/^\/+/, '')
        .replace(/\\/g, '/');
      const texto = String(obj.texto ?? '');
      if (!archivo || !/\.txt$/i.test(archivo)) {
        return send(res, 400, JSON.stringify({ error: 'archivo .txt requerido' }), 'application/json');
      }
      if (!/^index\/clientes\/[a-z0-9_-]+\/(prompts|copys)\/[A-Za-z0-9._-]+\.txt$/i.test(archivo)) {
        return send(res, 403, JSON.stringify({ error: 'ruta no permitida' }), 'application/json');
      }
      if (archivo.includes('..')) {
        return send(res, 403, JSON.stringify({ error: 'ruta inválida' }), 'application/json');
      }
      if (Buffer.byteLength(texto, 'utf8') > 400 * 1024) {
        return send(res, 413, JSON.stringify({ error: 'texto demasiado grande' }), 'application/json');
      }
      const abs = path.normalize(path.join(ROOT, archivo));
      if (!abs.startsWith(ROOT)) {
        return send(res, 403, JSON.stringify({ error: 'ruta inválida' }), 'application/json');
      }
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, texto, 'utf8');
      console.log('[api] Prompt TXT guardado', archivo, `(${Buffer.byteLength(texto, 'utf8')} B)`);
      return send(
        res,
        200,
        JSON.stringify({ ok: true, archivo, bytes: Buffer.byteLength(texto, 'utf8') }),
        'application/json'
      );
    })
    .catch((e) => {
      if (e && e.message === 'BODY_TOO_LARGE') {
        return send(res, 413, JSON.stringify({ error: 'cuerpo demasiado grande' }), 'application/json');
      }
      return send(res, 500, String(e), 'text/plain');
    });
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';

  if (url.startsWith('/api/acceso')) {
    return send(res, 200, JSON.stringify(accesoInfo()), 'application/json');
  }

  if (url.startsWith('/api/organizacion-config')) {
    return handleApiConfig(res);
  }

  if (url.startsWith('/api/impresoreando')) {
    return handleApiImpresoreando(req, res);
  }

  if (url.startsWith('/api/cliente-logo')) {
    return handleApiClienteLogo(req, res);
  }

  if (url.startsWith('/api/tarea-imagen')) {
    return handleApiTareaImagen(req, res);
  }

  if (url.startsWith('/api/tarea-archivo')) {
    return handleApiTareaArchivo(req, res);
  }

  if (url.startsWith('/api/articulo-texto')) {
    return handleApiArticuloTexto(req, res);
  }

  if (url.startsWith('/api/prompt-txt')) {
    return handleApiPromptTxt(req, res);
  }

  if (url.startsWith('/api/ecr-portada-historial')) {
    return handleApiEcrPortadaHistorial(req, res);
  }

  if (url.startsWith('/api/organizacion')) {
    return handleApiOrganizacion(req, res);
  }

  const urlPath = url.split('?')[0];
  if (/\/index\/clientes\/JoyasMercury\/?$/i.test(urlPath)) {
    return redirectJoyasMercury(res, url);
  }

  const filePath = resolveStaticFile(url);
  if (!filePath) return send(res, 404, 'Not found');

  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (e, data) => {
    if (e) return send(res, 500, 'Error');
    send(res, 200, data, MIME[ext] || 'application/octet-stream');
  });
});

server.listen(PORT, RUNTIME_HOST, () => {
  const acceso = accesoInfo();
  console.log(`Organización · http://${RUNTIME_HOST === '0.0.0.0' ? 'localhost' : RUNTIME_HOST}:${PORT}`);
  console.log(`  Host: ${RUNTIME_HOST}`);
  console.log(`  Organizador: http://localhost:${PORT}/index.html`);
  console.log(`  Portal clientes: http://localhost:${PORT}/index/clientes/`);
  console.log(`  Impresoreando panel: http://localhost:${PORT}/index/clientes/impresoreando/panel/`);
  if (acceso.lan.length) {
    console.log('  Misma WiFi (celular) — NO uses localhost en el teléfono:');
    acceso.lan.forEach((u) => console.log(`    ${u}`));
  } else {
    console.log('  (sin IP LAN detectada)');
  }
  console.log('  Cualquier lugar / 4G: ejecuta ABRIR-VENTA-PUBLICA.bat (túnel) y comparte ese link');
  console.log(`  API Impresoreando: /api/impresoreando · /api/acceso`);
  console.log(`  Guardado live: data/organizacion-live.json (solo vía API)`);
  if (RUNTIME_TOKEN) {
    console.log('  API protegida con ORGANIZACION_TOKEN (.env)');
  } else {
    console.log('  API sin token — define ORGANIZACION_TOKEN en .env para más seguridad');
  }
  if (!fs.existsSync(LIVE_FILE)) {
    console.log('  (sin organizacion-live.json aún — se creará al primer guardado)');
  }
});
