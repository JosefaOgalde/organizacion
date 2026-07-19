#!/usr/bin/env node
/**
 * Exporta cada slide del catálogo a PNG 1080×1350 con Chrome headless.
 *
 * Preferí el script bash si falla el puerto:
 *   bash /tmp/export-cat.sh  (o el bloque en README)
 *
 * Uso desde la raíz del repo (con `python3 -m http.server 8765` en /workspace):
 *   CAT_BASE=http://127.0.0.1:8765/index/clientes/impresoreando node …/exportar-pngs.js
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname);
const OUT = path.join(ROOT, 'export');
const PORT = Number(process.env.CAT_PORT || 8877);
const TOTAL = 12;
const EXTERNAL_BASE = process.env.CAT_BASE || '';

const LABELS = [
  '00-portada',
  '01-pcgato001',
  '02-pcperro001',
  '03-plmons001',
  '04-mcpebul001',
  '05-pcpebul001',
  '06-ptbobes001',
  '07-navehor001',
  '08-navevert001',
  '09-llranger001',
  '10-llstandl001',
  '11-cierre',
];

fs.mkdirSync(OUT, { recursive: true });

function contentType(file) {
  if (file.endsWith('.html')) return 'text/html; charset=utf-8';
  if (file.endsWith('.css')) return 'text/css; charset=utf-8';
  if (file.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (file.endsWith('.svg')) return 'image/svg+xml';
  if (file.endsWith('.png')) return 'image/png';
  return 'application/octet-stream';
}

function startServer() {
  const base = path.resolve(ROOT, '..');
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      if (urlPath === '/') urlPath = '/catalogo/index.html';
      const file = path.join(base, urlPath.replace(/^\//, ''));
      if (!file.startsWith(base) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType(file) });
      fs.createReadStream(file).pipe(res);
    });
    server.once('error', reject);
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

function chromeBin() {
  for (const c of ['google-chrome', 'chromium', 'chromium-browser']) {
    try {
      execFileSync('which', [c], { stdio: 'ignore' });
      return c;
    } catch (_) {}
  }
  throw new Error('No se encontró Chrome/Chromium');
}

function shot(base, i) {
  const out = path.join(OUT, `${LABELS[i]}.png`);
  const url = `${base}/catalogo/index.html?export=${i}`;
  const bin = chromeBin();
  const profile = path.join('/tmp', `imp-cat-chrome-${Date.now()}-${i}`);
  fs.mkdirSync(profile, { recursive: true });
  execFileSync(
    'timeout',
    [
      '60',
      bin,
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--user-data-dir=${profile}`,
      `--window-size=1080,1350`,
      `--screenshot=${out}`,
      url,
    ],
    { stdio: 'inherit' }
  );
  if (!fs.existsSync(out)) throw new Error(`No se generó ${out}`);
  console.log('OK', path.basename(out), `${Math.round(fs.statSync(out).size / 1024)} KB`);
}

function writeIndex() {
  const files = fs
    .readdirSync(OUT)
    .filter((f) => f.endsWith('.png'))
    .sort();
  const items = files
    .map(
      (f) =>
        `<li><a href="./${f}"><img src="./${f}" width="216" height="270" alt="${f}"/><span>${f}</span></a></li>`
    )
    .join('\n');
  fs.writeFileSync(
    path.join(OUT, 'index.html'),
    `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><title>Export catálogo</title>
<style>
body{font-family:system-ui,sans-serif;background:#121820;color:#eee;margin:0;padding:1.5rem}
h1{font-size:1.2rem} ul{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem}
a{color:#f0c090;text-decoration:none;display:flex;flex-direction:column;gap:.4rem}
img{border-radius:8px;background:#000;width:100%;height:auto}
</style></head><body>
<h1>Catálogo Impresoreando — PNG 1080×1350</h1>
<p>Carrusel Instagram · Todo es a pedido · @impresoreando</p>
<ul>${items}</ul>
</body></html>`
  );
}

(async () => {
  let server = null;
  let base = EXTERNAL_BASE;
  if (!base) {
    server = await startServer();
    base = `http://127.0.0.1:${PORT}`;
  }
  try {
    for (let i = 0; i < TOTAL; i++) shot(base.replace(/\/$/, ''), i);
    writeIndex();
    console.log(`\nListo: ${OUT} (${TOTAL} PNGs 1080×1350)`);
  } finally {
    if (server) server.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
