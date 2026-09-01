#!/usr/bin/env node
/**
 * Expone el servidor local (:8000) con túnel público (localtunnel)
 * para abrir Impresoreando desde cualquier celular / red.
 *
 * Uso (Laravel o servidor ya en :8000):
 *   node scripts/tunnel-impresoreando-publico.js
 *   PUBLIC_PATH=/index/clientes/impresoreando/calcular-costo/ node scripts/tunnel-impresoreando-publico.js
 *
 * Windows:
 *   ABRIR-VENTA-PUBLICA.bat
 *   ABRIR-CALCULAR-COSTO-PUBLICO.bat
 */
const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 8000;
const PATHS = {
  venta: '/index/clientes/impresoreando/panel/venta/',
  costo: '/index/clientes/impresoreando/calcular-costo/',
  panel: '/index/clientes/impresoreando/panel/',
};
const FOCUS =
  process.env.PUBLIC_PATH ||
  (String(process.env.TUNNEL_FOCUS || '').toLowerCase() === 'costo' ? PATHS.costo : PATHS.venta);

function lanBaseUrls() {
  const out = [];
  const ifaces = os.networkInterfaces();
  for (const list of Object.values(ifaces)) {
    for (const info of list || []) {
      if (info.family !== 'IPv4' || info.internal) continue;
      out.push(`http://${info.address}:${PORT}`);
    }
  }
  return out;
}

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(
      { host: '127.0.0.1', port: PORT, path: '/index/clientes/impresoreando/calcular-costo/', timeout: 2500 },
      (res) => {
        res.resume();
        resolve(res.statusCode >= 200 && res.statusCode < 500);
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

function printLinks(base) {
  const b = String(base || '').replace(/\/$/, '');
  console.log('');
  console.log('  ==============================================');
  console.log('  LINK PRINCIPAL (compartir por WhatsApp):');
  console.log('  ' + b + FOCUS);
  console.log('  ----------------------------------------------');
  console.log('  Calcular costo:  ' + b + PATHS.costo);
  console.log('  Registrar venta: ' + b + PATHS.venta);
  console.log('  Panel socios:    ' + b + PATHS.panel);
  console.log('  ==============================================');
  console.log('  Dejá esta ventana abierta mientras usen el link.');
  console.log('  No uses localhost en el celular.');
  console.log('');
}

async function main() {
  console.log('');
  console.log('  Impresoreando — túnel público (cualquier dispositivo)');
  console.log('  ----------------------------------------------------');
  const ok = await checkServer();
  if (!ok) {
    console.log('  ERROR: no hay servidor en el puerto', PORT);
    console.log('  Primero ejecutá ABRIR-LARAVEL.bat (dejá :8000 corriendo)');
    console.log('');
    process.exit(1);
  }

  const lan = lanBaseUrls();
  if (lan.length) {
    console.log('  Misma WiFi (celular en la misma red):');
    lan.forEach((u) => console.log('   ', u + FOCUS));
    console.log('');
  }
  console.log('  Abriendo túnel público (cualquier red / 4G)…');
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
      text.match(/your url is:\s*(https?:\/\/\S+)/i);
    if (m && !printed) {
      printed = true;
      printLinks(m[1] || m[0]);
    }
  };
  child.stdout.on('data', onChunk);
  child.stderr.on('data', onChunk);
  child.on('exit', (code) => {
    console.log('  Túnel cerrado (código', code, ')');
    process.exit(code || 0);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
