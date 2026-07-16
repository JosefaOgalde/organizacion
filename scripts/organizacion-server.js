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
const HOST = process.env.HOST || '127.0.0.1';
const LIVE_FILE = path.join(ROOT, 'data', 'organizacion-live.json');
const ECR_PORTADA_HISTORIAL = path.join(ROOT, 'index', 'clientes', 'ecr', 'newsletter', 'historial-portadas.json');
const ECR_PORTADA_MD = path.join(ROOT, 'index', 'clientes', 'ecr', 'newsletter', 'HISTORIAL-PORTADAS.md');
const ECR_PORTADA_DIR = path.join(ROOT, 'index', 'clientes', 'ecr', 'newsletter', 'portadas-guardadas');
const MAX_BODY_BYTES = Number(process.env.MAX_BODY_BYTES) || 12 * 1024 * 1024;
const API_TOKEN = (process.env.ORGANIZACION_TOKEN || '').trim();

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
};

/** Rutas que no se sirven por HTTP (aunque existan en disco) */
const STATIC_DENY = [
  /^\.git(?:\/|$)/i,
  /^\.env$/i,
  /^\.organizacion-token$/i,
  /^backend(?:\/|$)/i,
  /^node_modules(?:\/|$)/i,
  /^data\/organizacion-live\.json$/i,
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

function slugSeguro(s) {
  return String(s || 'x')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'x';
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

const server = http.createServer((req, res) => {
  const url = req.url || '/';

  if (url.startsWith('/api/organizacion-config')) {
    return handleApiConfig(res);
  }

  if (url.startsWith('/api/tarea-imagen')) {
    return handleApiTareaImagen(req, res);
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
  console.log(`Organización · http://${RUNTIME_HOST}:${PORT}`);
  console.log(`  Solo accesible desde esta PC (${RUNTIME_HOST})`);
  console.log(`  Organizador: http://localhost:${PORT}/index.html`);
  console.log(`  Portal clientes: http://localhost:${PORT}/index/clientes/`);
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
