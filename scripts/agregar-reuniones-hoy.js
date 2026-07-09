#!/usr/bin/env node
/**
 * Agrega reuniones del día (09 jul 2026) al respaldo/live más reciente.
 * Uso: node scripts/agregar-reuniones-hoy.js [ruta-archivo.json]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FECHA = '2026-07-09';
const REUNIONES = [
  {
    id: 'reunion-dgc-20260709',
    clienteId: null,
    fecha: FECHA,
    horaInicio: '10:00',
    horaFin: '11:00',
    titulo: 'Prueba técnica DGC',
    notas: 'Prueba técnica de la DGC · duración 1 h',
  },
  {
    id: 'reunion-mkof-mova-20260709',
    clienteId: 'cli-mkof',
    fecha: FECHA,
    horaInicio: '12:00',
    horaFin: '12:45',
    titulo: 'Reunión MKOF / MOVA',
    notas: 'MKOF · proyecto MOVA · máximo 45 min',
  },
];

function candidato() {
  const arg = process.argv[2];
  if (arg && fs.existsSync(arg)) return path.resolve(arg);
  const live = path.join(ROOT, 'data', 'organizacion-live.json');
  if (fs.existsSync(live)) return live;
  try {
    const { execSync } = require('child_process');
    const p = execSync('node scripts/respaldo-reciente.js', { cwd: ROOT, encoding: 'utf8' }).trim();
    if (p && fs.existsSync(p)) return p;
  } catch { /* ignore */ }
  return null;
}

function upsertReunion(lista, reunion) {
  const idx = lista.findIndex((r) => r.id === reunion.id);
  if (idx >= 0) lista[idx] = reunion;
  else lista.push(reunion);
}

const archivo = candidato();
if (!archivo) {
  console.error('No se encontró JSON. Pasa la ruta: node scripts/agregar-reuniones-hoy.js "ruta\\respaldo.json"');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(archivo, 'utf8'));
if (!Array.isArray(data.reunionesClientes)) data.reunionesClientes = [];
REUNIONES.forEach((r) => upsertReunion(data.reunionesClientes, r));
data.respaldoActualizado = FECHA;

fs.writeFileSync(archivo, JSON.stringify(data, null, 2), 'utf8');
console.log('[ok] Reuniones agregadas en:', archivo);
REUNIONES.forEach((r) => {
  console.log(`  · ${r.horaInicio}–${r.horaFin}  ${r.titulo}`);
});
