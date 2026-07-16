#!/usr/bin/env node
/**
 * Crea/actualiza la tarea TS #04: copy video + subida MP4 botas Hunter rojo militar.
 *
 *   node scripts/add-ts-copy-video-botas.js
 * Luego: http://localhost:3000/index.html?disco=1&tarea=trendseeker/04
 */
const fs = require('fs');
const path = require('path');

const LIVE = path.join(__dirname, '..', 'data', 'organizacion-live.json');
const ARCHIVO = 'index/clientes/trendseeker/copys/COPY-botas-hunter-rojo-militar-video.txt';
const LINK =
  'https://trendseeker.cl/producto/botas-de-agua-bajas-para-mujer-rojo-militar/';

const TAREA = {
  id: 'tarea-ts-copy-video-botas-2026-07-16',
  titulo: '[TS] Copy + video botas Hunter rojo militar',
  clienteId: 'cli-trendseeker',
  rolId: 'rol-cm',
  fecha: '2026-07-16',
  horaInicio: '12:30',
  horaFin: '14:00',
  notas:
    'Copy del video Gemini (botas Hunter bajas mujer Rojo Militar). ' +
    'Ficha: ' +
    LINK +
    ' · Entregable TXT con características + 3 versiones de copy. ' +
    'Subir el MP4 en esta tarea (+ Subir video) para verlo en Registro Trendseeker. ' +
    'Prompt relacionado: tarea #03.',
  prioridad: 'alta',
  completada: false,
  pendiente: false,
  numeroHistorico: '04',
  tipoEntregable: 'copys-txt',
  entregableArchivo: ARCHIVO,
  productoUrl: LINK,
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

const prompt = data.tareas.find((t) => t.id === 'tarea-ts-prompt-botas-rojas-2026-07-16');
if (prompt) {
  const marca = ' · Copy + video → tarea #04 y ' + ARCHIVO;
  if (!(prompt.notas || '').includes('tarea #04')) {
    prompt.notas = (prompt.notas || '') + marca;
  }
}

const cont = data.tareas.find((t) => t.id === 'tarea-ts-contenido-2026-07-15');
if (cont && !(cont.notas || '').includes('copy video botas')) {
  cont.notas =
    (cont.notas || '') +
    ' · Copy video botas Hunter listo → ver tarea #04 (subir MP4 ahí).';
}

data.respaldoActualizado = new Date().toISOString().slice(0, 10);
fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Listo:', ARCHIVO);
console.log('Abre http://localhost:3000/index.html?disco=1&tarea=trendseeker/04');
console.log('Landing: http://localhost:3000/index/clientes/trendseeker/');
