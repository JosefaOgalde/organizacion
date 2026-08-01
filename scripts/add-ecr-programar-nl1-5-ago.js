#!/usr/bin/env node
/**
 * 5 ago 2026 — Programar NL1 ECR (madre) + subtareas carrusel y video.
 *
 *   node scripts/add-ecr-programar-nl1-5-ago.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILES = [
  path.join(ROOT, 'data', 'organizacion-live.json'),
  path.join(ROOT, 'data', 'organizacion-respaldo-2026-07-31.json'),
];

const FECHA = '2026-08-05';
const CLIENTE = 'cli-ecr';
const ROL = 'rol-ecr-cm';
const MADRE_ID = 'tarea-ecr-programar-nl1-2026-08-05';

const MADRE = {
  id: MADRE_ID,
  titulo: '[ECR] Programar NL1',
  clienteId: CLIENTE,
  rolId: ROL,
  fecha: FECHA,
  horaInicio: '09:00',
  horaFin: '13:00',
  notas:
    'Programar en LinkedIn / Meta el ecosistema NL 1 ago · Tecnología sin integración. ' +
    'Subtareas: Programar carrusel · Programar video.',
  prioridad: 'alta',
  completada: false,
  pendiente: false,
  numeroHistorico: '17',
  tipoEntregable: 'programar',
  articuloSlug: 'tecnologia-sin-integracion',
  articuloPublicacion: '2026-08-01',
  articuloTitulo: 'Tecnología sin integración: el principal freno de la eficiencia',
  parentId: null,
  agendaFijada: true,
};

const HIJOS = [
  {
    id: 'tarea-ecr-programar-nl1-carrusel-2026-08-05',
    titulo: '[ECR] Programar carrusel',
    horaInicio: '09:00',
    horaFin: '11:00',
    numeroHistorico: '18',
    tipoEntregable: 'programar-carrusel',
    ordenHijo: 1,
    notas: 'Programar carrusel NL1 · Tecnología sin integración (LinkedIn).',
  },
  {
    id: 'tarea-ecr-programar-nl1-video-2026-08-05',
    titulo: '[ECR] Programar video',
    horaInicio: '11:00',
    horaFin: '13:00',
    numeroHistorico: '19',
    tipoEntregable: 'programar-video',
    ordenHijo: 2,
    notas: 'Programar video NL1 · Tecnología sin integración (LinkedIn).',
  },
];

function upsert(data, tarea) {
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
  const i = data.tareas.findIndex((t) => t.id === tarea.id);
  if (i >= 0) {
    const prev = data.tareas[i];
    data.tareas[i] = {
      ...prev,
      ...tarea,
      completada: prev.completada === true ? true : !!tarea.completada,
      sesionAgente: prev.sesionAgente,
    };
    return 'upd';
  }
  data.tareas.push({ ...tarea, completada: false, pendiente: false });
  return 'add';
}

let touched = 0;
for (const file of FILES) {
  if (!fs.existsSync(file)) {
    console.warn('Skip (no existe):', path.basename(file));
    continue;
  }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const ops = [];
  ops.push(upsert(data, MADRE));
  for (const h of HIJOS) {
    ops.push(
      upsert(data, {
        ...h,
        clienteId: CLIENTE,
        rolId: ROL,
        fecha: FECHA,
        prioridad: 'alta',
        completada: false,
        pendiente: false,
        parentId: MADRE_ID,
        articuloSlug: MADRE.articuloSlug,
        articuloPublicacion: MADRE.articuloPublicacion,
        articuloTitulo: MADRE.articuloTitulo,
        agendaFijada: true,
      })
    );
  }
  if (data.respaldoActualizado !== undefined) data.respaldoActualizado = '2026-07-31';
  if (data.meta && typeof data.meta === 'object') {
    data.meta.actualizado = new Date().toISOString();
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  touched += 1;
  console.log(path.basename(file), ops.join('/'));
}

console.log(
  `OK (${touched} archivo/s) · ${FECHA} · madre «${MADRE.titulo}» + ${HIJOS.length} subtareas`
);
console.log('Ver: http://127.0.0.1:8000/index.html?disco=1&tarea=ecr/17');
