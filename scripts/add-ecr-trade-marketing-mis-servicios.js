#!/usr/bin/env node
/**
 * Tarea ECR: sección «Mis servicios» en landing Trade Marketing (Elementor)
 *
 *   node scripts/add-ecr-trade-marketing-mis-servicios.js
 *   node scripts/add-ecr-trade-marketing-mis-servicios.js --also-respaldo
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const LIVE = path.join(DATA, 'organizacion-live.json');
/** Día Chile (YYYY-MM-DD) — la tarea queda en el calendario de hoy al asegurar. */
function fechaChileHoy() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
const FECHA = fechaChileHoy();
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
    horaInicio: '10:00',
    horaFin: '14:00',
    notas:
      'Agregar en Elementor la sección «Mis servicios» en la landing de Trade Marketing. ' +
      'Montar el bloque de servicios en la página WP (Elementor), alinear a marca ECR y al layout vigente de la landing. ' +
      'Revisar desktop + mobile.',
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    numeroHistorico: num,
    tipoEntregable: 'landing-elementor',
    parentId: null,
    agendaFijada: true,
    estadoFijado: false,
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
      tarea.estadoFijado = prev.estadoFijado === true ? true : tarea.estadoFijado;
    }
    data.tareas[idx] = { ...prev, ...tarea };
    console.log('Actualizada', path.basename(filePath), tarea.titulo, '#' + tarea.numeroHistorico);
  } else {
    data.tareas.push(tarea);
    console.log('Creada', path.basename(filePath), tarea.titulo, '#' + tarea.numeroHistorico);
  }

  data.respaldoActualizado = new Date().toISOString();
  if (!data.meta || typeof data.meta !== 'object') data.meta = {};
  data.meta.actualizado = data.respaldoActualizado;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  return true;
}

upsert(LIVE);
if (process.argv.includes('--also-respaldo')) {
  for (const name of fs.readdirSync(DATA)) {
    if (!/^organizacion-respaldo-.*\.json$/i.test(name)) continue;
    if (/ejemplo/i.test(name)) continue;
    upsert(path.join(DATA, name));
  }
}

const live = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
const t = (live.tareas || []).find((x) => x.id === ID);
const num = t ? t.numeroHistorico : '?';
console.log(`Ver: http://127.0.0.1:8000/index.html?disco=1&tarea=ecr/${num}`);
