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

const server = http.createServer((req, res) => {
  const url = req.url || '/';

  if (url.startsWith('/api/organizacion-config')) {
    return handleApiConfig(res);
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
  console.log(`  Landing JM: http://localhost:${PORT}/index/clientes/joyasmercury/`);
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
