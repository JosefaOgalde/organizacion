#!/usr/bin/env node
/**
 * Vuelve a marcar como completadas las tareas que ya estaban cerradas
 * (un sync --force / respaldo viejo las puede reabrir).
 *
 *   node scripts/asegurar-tareas-cerradas.js
 *   node scripts/asegurar-tareas-cerradas.js --also-respaldo
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const LIVE = path.join(DATA, 'organizacion-live.json');

/** IDs que deben permanecer cerradas (no reabrir). */
const CERRADAS = [
  // Trendseeker C7–C10 + C12 (madres + subtareas)
  'tarea-ts-contenido-7-de-12',
  'tarea-ts-contenido-7-de-12-prompt',
  'tarea-ts-contenido-7-de-12-copy',
  'tarea-ts-contenido-7-de-12-programar',
  'tarea-ts-contenido-8-de-12',
  'tarea-ts-contenido-8-de-12-prompt',
  'tarea-ts-contenido-8-de-12-copy',
  'tarea-ts-contenido-8-de-12-programar',
  'tarea-ts-contenido-9-de-12',
  'tarea-ts-contenido-9-de-12-prompt',
  'tarea-ts-contenido-9-de-12-copy',
  'tarea-ts-contenido-9-de-12-programar',
  'tarea-ts-contenido-10-de-12',
  'tarea-ts-contenido-10-de-12-prompt',
  'tarea-ts-contenido-10-de-12-copy',
  'tarea-ts-contenido-10-de-12-programar',
  'tarea-ts-contenido-12-de-12',
  'tarea-ts-contenido-12-de-12-prompt',
  'tarea-ts-contenido-12-de-12-copy',
  'tarea-ts-contenido-12-de-12-programar',
  // ECR
  'tarea-ecr-ley-karin-elementor-1a-2026-07-23',
  'tarea-ecr-landing-canal-denuncias-2026-07-27',
  'tarea-ecr-nl-agosto-copys-2026-07-17',
  'tarea-ecr-nl-agosto-portada-2026-07-17',
  'tarea-ecr-nl-agosto-carrusel-2026-07-17',
  'tarea-ecr-nl-agosto-video-2026-07-17',
  // JM / ADL / TW
  'tarea-jm-novedades-mobile-actual',
  'tarea-dlat-edicion-diseno-2026-07-27',
  'tarea-dlat-boleta-formulario-2026-07-27',
  'tarea-tw-ajustar-textos-2026-07-19',
  'tarea-tw-ajustar-textos-contacto-2026-07-19',
  'tarea-tw-ajustar-textos-curso-adultos-2026-07-19',
  'tarea-tw-ajustar-textos-home-2026-07-19',
  'tarea-tw-ajustar-textos-tutor-ia-2026-07-19',
  // IMP pedidos ya transferidos / pieza hecha
  'tarea-imp-ped-rebe-plmons-001',
  'tarea-imp-ped-gianni-bulldog-002',
  'tarea-imp-ped-juan-naves-003',
  'tarea-imp-ped-ped-004',
  'tarea-imp-ped-ped-005',
  'tarea-imp-ped-ped-006',
  'tarea-imp-pieza-porta-celular-bulldog-2026-07-27',
];

const SET = new Set(CERRADAS);

function upsert(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
  let n = 0;
  for (const t of data.tareas) {
    if (!t || !SET.has(t.id)) continue;
    if (t.completada === true && t.pendiente !== true) continue;
    t.completada = true;
    t.pendiente = false;
    t.estadoFijado = true;
    n += 1;
  }
  if (n) {
    data.respaldoActualizado = new Date().toISOString();
    if (!data.meta || typeof data.meta !== 'object') data.meta = {};
    data.meta.actualizado = data.respaldoActualizado;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  }
  console.log(path.basename(filePath) + ':', n ? `re-cerradas ${n}` : 'ok (sin cambios)');
  return n;
}

let total = upsert(LIVE);
if (process.argv.includes('--also-respaldo')) {
  const latest = fs
    .readdirSync(DATA)
    .filter((name) => /^organizacion-respaldo-\d{4}-\d{2}-\d{2}\.json$/i.test(name))
    .sort()
    .reverse()[0];
  if (latest) total += upsert(path.join(DATA, latest));
}
console.log('Total re-cerradas:', total);
console.log('Ver: http://127.0.0.1:8000/index.html?disco=1');
