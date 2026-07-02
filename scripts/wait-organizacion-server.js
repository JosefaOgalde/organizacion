#!/usr/bin/env node
/** Espera a que organizacion-server.js responda en :3000 */
const http = require('http');

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT) || 3000;
const PATH = '/api/organizacion-config';
const MAX_INTENTOS = 40;
const INTERVALO_MS = 500;

let intentos = 0;

function probar() {
  intentos += 1;
  const req = http.get(
    { host: HOST, port: PORT, path: PATH + '?t=' + Date.now(), timeout: 2000 },
    (res) => {
      res.resume();
      if (res.statusCode === 200) {
        console.log('[wait] Servidor listo en http://' + HOST + ':' + PORT);
        process.exit(0);
        return;
      }
      reintentar();
    }
  );
  req.on('error', reintentar);
  req.on('timeout', () => {
    req.destroy();
    reintentar();
  });
}

function reintentar() {
  if (intentos >= MAX_INTENTOS) {
    console.error('[wait] Timeout: el servidor no respondió a tiempo');
    process.exit(1);
    return;
  }
  setTimeout(probar, INTERVALO_MS);
}

probar();
