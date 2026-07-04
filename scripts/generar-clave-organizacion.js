#!/usr/bin/env node
/**
 * Genera ORGANIZACION_ACCESS_KEY en .env (no se sube a Git).
 * Uso: node scripts/generar-clave-organizacion.js [--mostrar]
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const envPath = path.join(ROOT, '.env');
const examplePath = path.join(ROOT, '.env.example');
const mostrar = process.argv.includes('--mostrar');

const nuevaClave = crypto.randomBytes(32).toString('hex');

function leerLineas(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\r?\n/);
}

function upsertEnv(lines, key, value) {
  let found = false;
  const out = lines.map((line) => {
    if (line.trim().startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });
  if (!found) out.push(`${key}=${value}`);
  return out;
}

let lines = leerLineas(envPath);
if (!lines.length && fs.existsSync(examplePath)) {
  lines = leerLineas(examplePath);
}

lines = upsertEnv(lines, 'ORGANIZACION_ACCESS_KEY', nuevaClave);
if (!lines.some((l) => l.trim().startsWith('HOST='))) {
  lines.push('HOST=127.0.0.1');
}
if (!lines.some((l) => l.trim().startsWith('PORT='))) {
  lines.push('PORT=3000');
}

fs.writeFileSync(envPath, `${lines.filter((l, i, a) => !(i === a.length - 1 && l === '')).join('\n')}\n`, 'utf8');

console.log('Clave generada y guardada en .env (ORGANIZACION_ACCESS_KEY)');
console.log('Reinicia el servidor (SERVIR.bat o ABRIR-ORGANIZADOR.bat).');
if (mostrar) {
  console.log('');
  console.log('=== GUARDA ESTA CLAVE EN UN LUGAR SEGURO ===');
  console.log(nuevaClave);
  console.log('============================================');
} else {
  console.log('Ejecuta con --mostrar si necesitas ver la clave en pantalla una vez.');
}
