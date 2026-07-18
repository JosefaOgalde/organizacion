#!/usr/bin/env node
/**
 * Cierra la subtarea 1 (Prompt Gemini video) de la madre [TS] Contenido 8/12.
 *
 *   node scripts/finalizar-ts-c08-prompt.js
 * Luego: http://127.0.0.1:8000/index.html?disco=1&tarea=trendseeker/10
 *    o:  http://localhost:3000/index.html?disco=1&tarea=trendseeker/10
 */
const fs = require('fs');
const path = require('path');

const LIVE = path.join(__dirname, '..', 'data', 'organizacion-live.json');
const ID = 'tarea-ts-contenido-8-de-12-prompt';
const MADRE_ID = 'tarea-ts-contenido-8-de-12';

if (!fs.existsSync(LIVE)) {
  console.error('No existe data/organizacion-live.json');
  console.error('Cópialo desde tu respaldo o corre antes: node scripts/add-ts-contenidos-7-12.js');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
const i = data.tareas.findIndex((t) => t.id === ID);

const patch = {
  completada: true,
  pendiente: false,
  notas:
    'FINALIZADO 2026-07-18. Prompt Gemini VIDEO entregado (Chelsea Commando negras · día de invierno con lluvia · A/B/C). Video ya generado. TXT: index/clientes/trendseeker/prompts/PROMPT-c08-chelsea-commando-negras-mujer-{A,B,C}.txt',
};

if (i >= 0) {
  const prev = data.tareas[i];
  data.tareas[i] = { ...prev, ...patch };
  console.log('Subtarea cerrada:', data.tareas[i].titulo, `#${data.tareas[i].numeroHistorico || '?'}`);
} else {
  console.error('No existe la subtarea', ID);
  console.error('Corre antes: node scripts/add-ts-contenidos-7-12.js');
  process.exit(1);
}

const madre = data.tareas.find((t) => t.id === MADRE_ID);
if (madre) {
  const hijas = data.tareas.filter((t) => t.parentId === MADRE_ID);
  const hechas = hijas.filter((t) => t.completada === true).length;
  console.log(
    `Madre C8/12: ${hechas}/${hijas.length} subtareas hechas` +
      (hechas === hijas.length
        ? ' → puedes finalizar la madre.'
        : ' (quedan Copys y/o Programar).')
  );
}

data.respaldoActualizado = new Date().toISOString().slice(0, 10);
fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Guardado en data/organizacion-live.json');
console.log('Abre el organizador con ?disco=1 para ver el cambio.');
