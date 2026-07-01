#!/usr/bin/env node
/**
 * Servidor local: archivos estáticos + API que guarda organizacion_v2 en disco.
 * Uso: node scripts/organizacion-server.js
 * Puerto: 3000 (o PORT)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 3000;
const LIVE_FILE = path.join(ROOT, 'data', 'organizacion-live.json');

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

function send(res, code, body, type) {
  res.writeHead(code, {
    'Content-Type': type || 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  let rel = decoded.replace(/^\/+/, '') || 'index.html';
  if (rel === 'index' || rel === 'index/') rel = 'index.html';
  const abs = path.normalize(path.join(ROOT, rel));
  if (!abs.startsWith(ROOT)) return null;
  return abs;
}

function redirectJoyasMercury(res, urlPath) {
  const q = urlPath.includes('?') ? urlPath.slice(urlPath.indexOf('?')) : '';
  const target = `/index/clientes/joyasmercury/index.html${q || '?v=secciones3'}`;
  res.writeHead(302, { Location: target, 'Cache-Control': 'no-store' });
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
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
    }).catch((e) => send(res, 500, String(e), 'text/plain'));
  }
  send(res, 405, 'Método no permitido');
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';

  if (url.startsWith('/api/organizacion')) {
    return handleApiOrganizacion(req, res);
  }

  const urlPath = url.split('?')[0];
  if (/\/index\/clientes\/JoyasMercury\/?$/i.test(urlPath)) {
    return redirectJoyasMercury(res, url);
  }

  const filePath = safePath(url);
  if (!filePath) return send(res, 403, 'Forbidden');

  fs.stat(filePath, (err, stat) => {
    if (err) return send(res, 404, 'Not found');
    if (stat.isDirectory()) {
      const index = path.join(filePath, 'index.html');
      if (fs.existsSync(index)) {
        return fs.readFile(index, (e, data) => {
          if (e) return send(res, 500, 'Error');
          send(res, 200, data, MIME['.html']);
        });
      }
      return send(res, 404, 'Not found');
    }
    const ext = path.extname(filePath).toLowerCase();
    fs.readFile(filePath, (e, data) => {
      if (e) return send(res, 500, 'Error');
      send(res, 200, data, MIME[ext] || 'application/octet-stream');
    });
  });
});

server.listen(PORT, () => {
  console.log(`Organización · http://localhost:${PORT}`);
  console.log(`  Landing JM: http://localhost:${PORT}/index/clientes/joyasmercury/`);
  console.log(`  Guardado live: data/organizacion-live.json`);
  if (!fs.existsSync(LIVE_FILE)) {
    console.log('  (sin organizacion-live.json aún — se creará al primer guardado)');
  }
});
