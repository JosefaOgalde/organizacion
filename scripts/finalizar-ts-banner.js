#!/usr/bin/env node
/**
 * Marca como hecha la tarea [TS] Cambiar banner.
 *
 *   node scripts/finalizar-ts-banner.js
 * Luego: http://localhost:3000/index.html?disco=1&tarea=trendseeker/01
 */
const fs = require('fs');
const path = require('path');

const LIVE = path.join(__dirname, '..', 'data', 'organizacion-live.json');
const ID = 'tarea-ts-banner-2026-07-15';

if (!fs.existsSync(LIVE)) {
  console.error('No existe data/organizacion-live.json');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
const i = data.tareas.findIndex((t) => t.id === ID);

const patch = {
  id: ID,
  titulo: '[TS] Cambiar banner',
  clienteId: 'cli-trendseeker',
  rolId: 'rol-wp',
  fecha: '2026-07-15',
  horaInicio: '10:00',
  horaFin: '11:00',
  notas:
    'FINALIZADO 2026-07-16. Banner actualizado en el sitio TrendSeeker (WordPress).',
  prioridad: 'media',
  completada: true,
  pendiente: false,
  numeroHistorico: '01',
};

if (i >= 0) {
  data.tareas[i] = { ...data.tareas[i], ...patch };
  console.log('Actualizada y marcada hecha:', data.tareas[i].titulo);
} else {
  data.tareas.push(patch);
  console.log('Agregada como hecha:', patch.titulo);
}

data.respaldoActualizado = new Date().toISOString().slice(0, 10);
fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Listo. Abre http://localhost:3000/index.html?disco=1&tarea=trendseeker/01');
