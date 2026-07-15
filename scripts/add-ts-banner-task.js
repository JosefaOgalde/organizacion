#!/usr/bin/env node
/**
 * Agrega (idempotente) la tarea TrendSeeker "[TS] Cambiar banner" para 2026-07-15
 * en data/organizacion-live.json. Uso:
 *   node scripts/add-ts-banner-task.js
 * Luego abre: http://localhost:3000/index.html?disco=1
 */
const fs = require('fs');
const path = require('path');

const LIVE = path.join(__dirname, '..', 'data', 'organizacion-live.json');
const FECHA = '2026-07-15';
const TAREA = {
  id: 'tarea-ts-banner-2026-07-15',
  titulo: '[TS] Cambiar banner',
  clienteId: 'cli-trendseeker',
  rolId: 'rol-wp',
  fecha: FECHA,
  horaInicio: '10:00',
  horaFin: '11:00',
  notas: 'Cambiar banner del sitio TrendSeeker (WordPress).',
  prioridad: 'media',
  completada: false,
  pendiente: false,
};

if (!fs.existsSync(LIVE)) {
  console.error('No existe data/organizacion-live.json — abre el organizador una vez o importa un respaldo.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
const i = data.tareas.findIndex((t) => t.id === TAREA.id);
if (i >= 0) {
  data.tareas[i] = { ...data.tareas[i], ...TAREA };
  console.log('Actualizada:', TAREA.titulo, FECHA);
} else {
  data.tareas.push(TAREA);
  console.log('Agregada:', TAREA.titulo, FECHA);
}
data.respaldoActualizado = FECHA;
fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Listo. Abre http://localhost:3000/index.html?disco=1');
