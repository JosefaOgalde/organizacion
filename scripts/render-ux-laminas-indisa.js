#!/usr/bin/env node
/**
 * Regenera PNG 1920×1080 de las láminas UX/UI (plantilla MKOF).
 * Uso: node scripts/render-ux-laminas-indisa.js
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(
  ROOT,
  'index/clientes/mkof/prospecto/clientes/clinica-indisa/UX-UI/laminas'
);

const FILES = [
  '01-portada-diagnostico',
  '02-portada-competencia',
  '03-rendimiento',
  '04-estructura-navegacion',
  '05-referentes',
  '06-estetico-vs-funcional',
  '07-recomendaciones',
  '07a-recomendaciones-contacto',
  '07b-recomendaciones-reserva',
  '07c-recomendaciones-orden',
  '08-proteccion-datos',
  '09-oportunidades-uxui',
];

const PORT = 8765;
const chrome =
  process.env.CHROME ||
  ['/usr/local/bin/google-chrome', '/usr/bin/google-chrome', 'google-chrome'].find(
    (p) => {
      try {
        return fs.existsSync(p) || p === 'google-chrome';
      } catch {
        return false;
      }
    }
  );

function serve() {
  return http.createServer((req, res) => {
    const rel = decodeURIComponent((req.url || '/').split('?')[0]).replace(/^\//, '');
    const file = path.join(DIR, rel);
    if (!file.startsWith(DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    const ext = path.extname(file);
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.json': 'application/json',
    };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
}

async function main() {
  const server = serve().listen(PORT);
  await new Promise((r) => setTimeout(r, 200));

  for (const name of FILES) {
    const url = `http://127.0.0.1:${PORT}/${name}.html`;
    const out = path.join(DIR, `${name}.png`);
    const tmp = path.join(DIR, `${name}.shot.png`);
    const profile = path.join('/tmp', `chrome-ux-render-${process.pid}`);
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--user-data-dir=${profile}`,
      `--window-size=1920,1080`,
      '--virtual-time-budget=4000',
      `--screenshot=${tmp}`,
      url,
    ];
    console.log('render', name);
    const r = spawnSync(chrome, args, { encoding: 'utf8', timeout: 60000 });
    if (r.status !== 0) {
      console.error(r.stderr || r.stdout);
      throw new Error('chrome failed for ' + name);
    }
    // Chrome may capture full page; crop/ensure via rename
    fs.renameSync(tmp, out);
    console.log('  →', out, fs.statSync(out).size);
  }

  server.close();
  console.log('OK', FILES.length, 'láminas');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
