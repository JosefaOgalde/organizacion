#!/usr/bin/env node
/**
 * Servidor local: archivos estáticos + API que guarda organizacion_v2 en disco.
 * Uso: node scripts/organizacion-server.js
 * Puerto: 3000 (o PORT) · Solo localhost por defecto (HOST=127.0.0.1)
 *
 * Seguridad opcional (.env):
 * - ORGANIZACION_ACCESS_KEY → login en /login.html + protege todo el sitio y la API
 * - ORGANIZACION_TOKEN (legacy) → solo API si no hay ACCESS_KEY
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
const SESSION_COOKIE = 'org_session';
const SESSION_MAX_AGE = Number(process.env.ORGANIZACION_SESSION_HOURS || 24) * 3600;

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

const PUBLIC_PATHS = new Set([
  '/login.html',
  '/index/assets/login.css',
  '/index/assets/login.js',
]);

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

const ACCESS_KEY = (process.env.ORGANIZACION_ACCESS_KEY || '').trim();
const LEGACY_TOKEN = (process.env.ORGANIZACION_TOKEN || '').trim();
const RUNTIME_TOKEN = ACCESS_KEY || LEGACY_TOKEN;
const SITE_LOCKED = !!ACCESS_KEY;
const SESSION_VALUE = ACCESS_KEY
  ? crypto.createHash('sha256').update(`organizacion:${ACCESS_KEY}`).digest('hex')
  : '';
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

function send(res, code, body, type, extraHeaders) {
  res.writeHead(code, {
    ...securityHeaders(),
    'Content-Type': type || 'text/plain; charset=utf-8',
    ...(extraHeaders || {}),
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

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx <= 0) return;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  });
  return out;
}

function sessionCookieHeader() {
  return `${SESSION_COOKIE}=${SESSION_VALUE}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${SESSION_MAX_AGE}`;
}

function clearSessionCookieHeader() {
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0`;
}

function hasValidSession(req) {
  if (!RUNTIME_TOKEN) return true;

  if (SITE_LOCKED) {
    const cookies = parseCookies(req.headers.cookie);
    if (tokensMatch(cookies[SESSION_COOKIE], SESSION_VALUE)) return true;
  }

  const header = req.headers['x-organizacion-token'];
  if (tokensMatch(header, RUNTIME_TOKEN)) return true;

  return false;
}

function isPublicRequest(urlPath, req) {
  if (PUBLIC_PATHS.has(urlPath)) return true;
  if (urlPath === '/api/organizacion-config') return true;
  if (urlPath === '/api/auth/login' && req.method === 'POST') return true;
  if (urlPath === '/api/auth/logout' && req.method === 'POST') return true;
  return false;
}

function wantsHtml(req) {
  const accept = req.headers.accept || '';
  return accept.includes('text/html') || accept === '*/*' || !accept.includes('application/json');
}

function redirectToLogin(res, req) {
  const next = encodeURIComponent((req.url || '/index.html').split('?')[0] || '/index.html');
  res.writeHead(302, { Location: `/login.html?next=${next}`, ...securityHeaders() });
  res.end();
}

function denyUnauthorized(req, res) {
  if (wantsHtml(req)) return redirectToLogin(res, req);
  return send(res, 401, JSON.stringify({ error: 'No autorizado — inicia sesión en /login.html' }), 'application/json');
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

function handleAuthLogin(req, res) {
  if (!ACCESS_KEY) {
    return send(res, 400, JSON.stringify({ error: 'Login desactivado — define ORGANIZACION_ACCESS_KEY en .env' }), 'application/json');
  }
  return readBody(req).then((raw) => {
    let body;
    try {
      body = JSON.parse(raw || '{}');
    } catch {
      return send(res, 400, JSON.stringify({ error: 'JSON inválido' }), 'application/json');
    }
    if (!tokensMatch(String(body.key || ''), ACCESS_KEY)) {
      return send(res, 401, JSON.stringify({ error: 'Clave incorrecta' }), 'application/json');
    }
    return send(res, 200, JSON.stringify({ ok: true }), 'application/json', {
      'Set-Cookie': sessionCookieHeader(),
    });
  }).catch((e) => {
    if (e && e.message === 'BODY_TOO_LARGE') {
      return send(res, 413, JSON.stringify({ error: 'cuerpo demasiado grande' }), 'application/json');
    }
    return send(res, 500, String(e), 'text/plain');
  });
}

function handleAuthLogout(res) {
  return send(res, 200, JSON.stringify({ ok: true }), 'application/json', {
    'Set-Cookie': clearSessionCookieHeader(),
  });
}

function handleApiOrganizacion(req, res) {
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
    loginRequired: SITE_LOCKED,
    maxBodyBytes: RUNTIME_MAX_BODY,
  }), 'application/json');
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';
  const urlPath = url.split('?')[0];

  if (urlPath === '/api/auth/login') {
    return handleAuthLogin(req, res);
  }

  if (urlPath === '/api/auth/logout' && req.method === 'POST') {
    return handleAuthLogout(res);
  }

  if (urlPath.startsWith('/api/organizacion-config')) {
    return handleApiConfig(res);
  }

  if (!isPublicRequest(urlPath, req) && !hasValidSession(req)) {
    return denyUnauthorized(req, res);
  }

  if (urlPath.startsWith('/api/organizacion')) {
    return handleApiOrganizacion(req, res);
  }

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
  if (SITE_LOCKED) {
    console.log('  Sitio protegido con login — ORGANIZACION_ACCESS_KEY (.env)');
    console.log('  Entrada: http://localhost:' + PORT + '/login.html');
  } else if (RUNTIME_TOKEN) {
    console.log('  API protegida con ORGANIZACION_TOKEN (.env) — sin login de sitio');
  } else {
    console.log('  Sin clave — ejecuta CONFIGURAR-CLAVE.bat para activar login');
  }
  if (!fs.existsSync(LIVE_FILE)) {
    console.log('  (sin organizacion-live.json aún — se creará al primer guardado)');
  }
});
