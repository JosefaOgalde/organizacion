#!/usr/bin/env node
/**
 * ECR — fechas calendario NL agosto:
 *   NL 1 (TI) → 2026-08-20
 *   NL 2 (ET) → 2026-08-22
 * Marca Portada NL 1 como hecha (Canva finales).
 *
 *   node scripts/actualizar-fechas-ecr-nl-agosto.js
 * Luego: ?disco=1
 */
const fs = require('fs');
const path = require('path');

const LIVE = path.join(__dirname, '..', 'data', 'organizacion-live.json');
const FECHA_NL1 = '2026-08-20';
const FECHA_NL2 = '2026-08-22';
const PORTADA_NL1 = 'tarea-ecr-nl-agosto-portada-2026-07-17';
const ENTREGABLE_PORTADA =
  'index/clientes/ecr/newsletter/portadas-guardadas/NL1-ago-portadas-canva-finales.md';

const IDS_NL1 = [
  'tarea-ecr-ecosistema-nl-agosto-2026-07-17',
  'tarea-ecr-nl-agosto-copys-2026-07-17',
  'tarea-ecr-nl-agosto-portada-2026-07-17',
  'tarea-ecr-nl-agosto-carrusel-2026-07-17',
  'tarea-ecr-nl-agosto-video-2026-07-17',
];
const IDS_NL2 = [
  'tarea-ecr-ecosistema-equipos-terreno-2026-07-24',
  'tarea-ecr-et-copys-2026-07-24',
  'tarea-ecr-et-portada-2026-07-24',
  'tarea-ecr-et-carrusel-2026-07-24',
  'tarea-ecr-et-video-2026-07-24',
];

if (!fs.existsSync(LIVE)) {
  console.error('No existe data/organizacion-live.json');
  console.error('Corre antes: node scripts/add-ecr-ecosistema-nl-agosto.js && node scripts/renombrar-ecr-madres-articulos.js');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
const now = new Date().toISOString();
const byId = new Map(data.tareas.map((t) => [t.id, t]));

function setFecha(id, fecha, extra = {}) {
  const t = byId.get(id);
  if (!t) {
    console.warn('No encontrada:', id);
    return;
  }
  t.fecha = fecha;
  if (t.parentId == null) t.fechaFin = fecha;
  Object.assign(t, extra);
  console.log(`  ${fecha}  ${t.titulo}${t.completada ? ' [x]' : ''}`);
}

console.log('NL 1 →', FECHA_NL1);
for (const id of IDS_NL1) {
  const extra = {};
  if (id === IDS_NL1[0]) extra.articuloPublicacion = FECHA_NL1;
  if (id === PORTADA_NL1) {
    extra.completada = true;
    extra.pendiente = false;
    extra.completadaEn = now;
    extra.entregableArchivo = ENTREGABLE_PORTADA;
    extra.notas =
      'Portadas Canva FINALES (3) con logo ECR + título. ' +
      'Archivo: NL1-ago-portadas-canva-finales.md · imágenes en nl1-ago-finales/.';
  }
  setFecha(id, FECHA_NL1, extra);
}

console.log('NL 2 →', FECHA_NL2);
for (const id of IDS_NL2) {
  const extra = {};
  if (id === IDS_NL2[0]) extra.articuloPublicacion = FECHA_NL2;
  setFecha(id, FECHA_NL2, extra);
}

fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('\nOK · live actualizado. Abre el organizador con ?disco=1');
