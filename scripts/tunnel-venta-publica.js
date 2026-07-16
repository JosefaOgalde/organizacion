#!/usr/bin/env node
/**
 * Expone el servidor local con un túnel público (localtunnel)
 * para que Josefa/Nicolás abran el registrador de ventas desde cualquier celular
 * (otra WiFi, 4G/5G). Las ventas se guardan en data/impresoreando-live.json
 * vía POST /api/impresoreando/venta.
 *
 * Uso (con el servidor ya corriendo en el puerto 3000):
 *   node scripts/tunnel-venta-publica.js
 *
 * O con ABRIR-VENTA-PUBLICA.bat en Windows.
 */
const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 3000;
const VENTA_PATH = '/index/clientes/impresoreando/panel/venta/';

function lanUrls() {
  const out = [];
  const ifaces = os.networkInterfaces();
  for (const list of Object.values(ifaces)) {
    for (const info of list || []) {
      if (info.family !== 'IPv4' || info.internal) continue;
      out.push(`http://${info.address}:${PORT}${VENTA_PATH}`);
    }
  }
  return out;
}

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port: PORT, path: '/api/impresoreando', timeout: 2500 }, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

function postJson(pathname, body) {
  const data = Buffer.from(JSON.stringify(body), 'utf8');
  return new Promise((resolve) => {
    const req = http.request(
      {
        host: '127.0.0.1',
        port: PORT,
        path: pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
        timeout: 4000,
      },
      (res) => {
        res.resume();
        resolve(res.statusCode);
      }
    );
    req.on('error', () => resolve(0));
    req.on('timeout', () => {
      req.destroy();
      resolve(0);
    });
    req.end(data);
  });
}

async function registerPublicUrl(base) {
  const venta = `${base.replace(/\/$/, '')}${VENTA_PATH}`;
  const code = await postJson('/api/acceso/tunnel', { base, venta });
  if (code >= 200 && code < 300) {
    console.log('  ✓ Link registrado en el panel (Resumen → Copiar link público)');
  } else {
    console.log('  (aviso) no se pudo registrar en /api/acceso/tunnel — igual puedes usar el link de abajo');
  }
  return venta;
}

async function clearPublicUrl() {
  await postJson('/api/acceso/tunnel', { clear: true });
}

async function main() {
  console.log('');
  console.log('  Impresoreando — túnel público para registrar ventas');
  console.log('  --------------------------------------------------');
  const ok = await checkServer();
  if (!ok) {
    console.log('  ERROR: no hay servidor en el puerto', PORT);
    console.log('  Primero ejecuta SERVIR.bat (o: node scripts/organizacion-server.js)');
    console.log('  y deja esa ventana abierta.');
    console.log('');
    process.exit(1);
  }

  const lan = lanUrls();
  if (lan.length) {
    console.log('  Misma WiFi (celular en la misma red):');
    lan.forEach((u) => console.log('   ', u));
    console.log('');
  }
  console.log('  Abriendo túnel público (cualquier red / 4G)…');
  console.log('  Deja SERVIR.bat + esta ventana abiertas mientras usen el link.');
  console.log('  Cada venta se guarda online en el panel (impresoreando-live.json).');
  console.log('');

  const child = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['--yes', 'localtunnel', '--port', String(PORT)],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32' }
  );

  let printed = false;
  const onChunk = (buf) => {
    const text = String(buf);
    process.stdout.write(text);
    const m =
      text.match(/https?:\/\/[a-z0-9.-]+\.loca\.lt/i) ||
      text.match(/your url is:\s*(https?:\/\/\S+)/i) ||
      text.match(/https?:\/\/[a-z0-9.-]+\.trycloudflare\.com/i);
    if (m && !printed) {
      printed = true;
      const base = (m[1] || m[0]).replace(/\/$/, '');
      registerPublicUrl(base).then((venta) => {
        console.log('');
        console.log('  ==============================================');
        console.log('  LINK PARA JOSEFA / NICOLÁS (cualquier lugar):');
        console.log('  ' + venta);
        console.log('  ==============================================');
        console.log('  Compártelo por WhatsApp. No uses localhost en el celular.');
        console.log('  También aparece en el panel → Resumen (link público).');
        console.log('');
      });
    }
  };
  child.stdout.on('data', onChunk);
  child.stderr.on('data', onChunk);
  child.on('exit', async (code) => {
    await clearPublicUrl();
    console.log('  Túnel cerrado (código', code, ') — link público quitado del panel');
    process.exit(code || 0);
  });

  const shutdown = async () => {
    await clearPublicUrl();
    try {
      child.kill('SIGTERM');
    } catch {
      /* ignore */
    }
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
