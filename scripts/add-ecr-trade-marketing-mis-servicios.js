#!/usr/bin/env node
/**
 * Tarea ECR: sección «Mis servicios» en landing Trade Marketing (Elementor)
 * Fijada: miércoles 29 jul 2026 · mañana (09:00–12:00 Chile).
 *
 *   node scripts/add-ecr-trade-marketing-mis-servicios.js
 *   node scripts/add-ecr-trade-marketing-mis-servicios.js --also-respaldo
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const LIVE = path.join(DATA, 'organizacion-live.json');
/** Miércoles 29 jul 2026 — mañana */
const FECHA = '2026-07-29';
const HORA_INICIO = '09:00';
const HORA_FIN = '12:00';
const CLIENTE = 'cli-ecr';
const ROL = 'rol-ecr-dev';
const ID = 'tarea-ecr-trade-marketing-mis-servicios-2026-07-28';

function nextNumero(tareas) {
  let max = 0;
  for (const t of tareas) {
    if (t.clienteId !== CLIENTE) continue;
    const n = parseInt(String(t.numeroHistorico || '0'), 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return String(max + 1).padStart(2, '0');
}

function upsert(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error('No existe', filePath);
    return false;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
  const num = nextNumero(data.tareas);
  const tarea = {
    id: ID,
    titulo: '[ECR] Landing Trade Marketing · sección Mis servicios (Elementor)',
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: FECHA,
    horaInicio: HORA_INICIO,
    horaFin: HORA_FIN,
    notas:
      'Agregar en Elementor la sección «Mis servicios» en la landing de Trade Marketing. ' +
      'Montar el bloque de servicios en la página WP (Elementor), alinear a marca ECR y al layout vigente de la landing. ' +
      'Revisar desktop + mobile. Programada: miércoles 29 jul mañana.',
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    numeroHistorico: num,
    tipoEntregable: 'landing-elementor',
    parentId: null,
    agendaFijada: true,
    estadoFijado: true,
    color: 'celeste',
  };

  const idx = data.tareas.findIndex((t) => t.id === ID);
  if (idx >= 0) {
    const prev = data.tareas[idx];
    tarea.numeroHistorico = prev.numeroHistorico || num;
    // No reabrir si ya la cerraron
    if (prev.completada === true) {
      tarea.completada = true;
      tarea.pendiente = false;
      tarea.estadoFijado = true;
    }
    data.tareas[idx] = { ...prev, ...tarea };
    console.log('Actualizada', path.basename(filePath), tarea.titulo, '#' + tarea.numeroHistorico, FECHA, HORA_INICIO);
  } else {
    data.tareas.push(tarea);
    console.log('Creada', path.basename(filePath), tarea.titulo, '#' + tarea.numeroHistorico, FECHA, HORA_INICIO);
  }

  data.respaldoActualizado = new Date().toISOString();
  if (!data.meta || typeof data.meta !== 'object') data.meta = {};
  data.meta.actualizado = data.respaldoActualizado;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  return true;
}

upsert(LIVE);
if (process.argv.includes('--also-respaldo')) {
  // Solo el respaldo con fecha más nueva (evita pisar 21/24/28/29 y bloquear git)
  const latest = fs
    .readdirSync(DATA)
    .filter((name) => /^organizacion-respaldo-\d{4}-\d{2}-\d{2}\.json$/i.test(name))
    .sort()
    .reverse()[0];
  if (latest) upsert(path.join(DATA, latest));
}

if (fs.existsSync(LIVE)) {
  const live = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  const t = (live.tareas || []).find((x) => x.id === ID);
  const num = t ? t.numeroHistorico : '?';
  console.log(`Ver: http://127.0.0.1:8000/index.html?disco=1&tarea=ecr/${num}`);
}
