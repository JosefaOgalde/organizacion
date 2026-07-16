#!/usr/bin/env node
/**
 * Crea/actualiza la tarea TS del prompt botas rojas + marca contenido en progreso.
 *
 *   node scripts/add-ts-prompt-botas-rojas.js
 * Luego: http://localhost:3000/index.html?disco=1&tarea=trendseeker/03
 */
const fs = require('fs');
const path = require('path');

const LIVE = path.join(__dirname, '..', 'data', 'organizacion-live.json');
const ARCHIVO = 'index/clientes/trendseeker/prompts/PROMPT-botas-rojas-lluvia.txt';

const TAREA = {
  id: 'tarea-ts-prompt-botas-rojas-2026-07-16',
  titulo: '[TS] Prompt botas rojas (lluvia)',
  clienteId: 'cli-trendseeker',
  rolId: 'rol-cm',
  fecha: '2026-07-16',
  horaInicio: '11:00',
  horaFin: '12:30',
  notas:
    'Prompt Midjourney: mujer caminando bajo mucha lluvia; ÉNFASIS en el producto (botas rojas) y fidelidad máxima a fotos de producto. ' +
    'Archivo: ' +
    ARCHIVO +
    ' (3 versiones A/B/C + instrucciones de referencia de imagen).',
  prioridad: 'alta',
  completada: false,
  pendiente: false,
  numeroHistorico: '03',
  tipoEntregable: 'copys-txt',
  entregableArchivo: ARCHIVO,
};

if (!fs.existsSync(LIVE)) {
  console.error('No existe data/organizacion-live.json');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
const i = data.tareas.findIndex((t) => t.id === TAREA.id);
if (i >= 0) {
  data.tareas[i] = { ...data.tareas[i], ...TAREA };
  console.log('Actualizada:', TAREA.titulo);
} else {
  data.tareas.push(TAREA);
  console.log('Agregada:', TAREA.titulo, `#${TAREA.numeroHistorico}`);
}

const cont = data.tareas.find((t) => t.id === 'tarea-ts-contenido-2026-07-15');
if (cont) {
  cont.notas =
    (cont.notas || '') +
    ' · Prompt botas rojas en curso → ver tarea #03 y ' +
    ARCHIVO;
}

data.respaldoActualizado = new Date().toISOString().slice(0, 10);
fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Listo:', ARCHIVO);
console.log('Abre http://localhost:3000/index.html?disco=1&tarea=trendseeker/03');
