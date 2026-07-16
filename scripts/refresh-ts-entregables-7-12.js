#!/usr/bin/env node
/**
 * Refresh completo Contenidos 7–12 (prompts + copys A/B/C).
 *
 *   node scripts/refresh-ts-entregables-7-12.js
 *
 * Luego reinicia el server y abre:
 *   http://localhost:3000/index.html?disco=1
 *   Ctrl+F5
 */
const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function run(rel) {
  console.log('\n===', rel, '===');
  const r = spawnSync(process.execPath, [path.join(ROOT, rel)], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });
  if (r.status !== 0) {
    console.error('Falló:', rel, 'código', r.status);
    process.exit(r.status || 1);
  }
}

run('scripts/generar-ts-prompts-contenidos-7-12.js');
run('scripts/generar-ts-copys-contenidos-7-12.js');

console.log(`
Listo.

1) Para el server (Ctrl+C) y vuelve a levantarlo:
   node scripts/organizacion-server.js

2) Abre (importante disco=1 + Ctrl+F5):
   http://localhost:3000/index.html?disco=1

3) Semana → subtarea:
   · Prompt Gemini  → bloque A/B/C de prompts
   · Copys video    → bloque A/B/C de copys
`);
