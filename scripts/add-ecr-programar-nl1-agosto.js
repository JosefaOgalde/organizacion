#!/usr/bin/env node
/**
 * ECR — Programar NL1 agosto (madre miércoles 29 jul + 3 subtareas)
 *
 *   05 ago — Artículo
 *   10 ago — Carrusel
 *   12 ago — Video
 *
 *   node scripts/add-ecr-programar-nl1-agosto.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const FILES = [
  path.join(DATA, 'organizacion-live.json'),
  path.join(DATA, 'organizacion-respaldo-2026-07-27.json'),
  path.join(DATA, 'organizacion-respaldo-2026-07-27-aplicado.json'),
];

const CLIENTE = 'cli-ecr';
const ROL = 'rol-ecr-cm';
const MADRE_ID = 'tarea-ecr-programar-nl1-agosto-2026-07-29';
const MADRE_FECHA = '2026-07-29';

function nextNumero(tareas) {
  let max = 0;
  for (const t of tareas) {
    if (t.clienteId !== CLIENTE) continue;
    const n = parseInt(String(t.numeroHistorico || '0'), 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return max;
}

function upsert(tareas, tarea) {
  const idx = tareas.findIndex((t) => t.id === tarea.id);
  if (idx >= 0) {
    const prev = tareas[idx];
    if (prev.completada === true) {
      console.log('[respetar finalizada]', tarea.titulo);
      return;
    }
    tareas[idx] = {
      ...prev,
      ...tarea,
      numeroHistorico: prev.numeroHistorico || tarea.numeroHistorico,
      completada: prev.completada === true ? true : tarea.completada,
    };
    console.log('[upd]', tarea.titulo, '#' + tareas[idx].numeroHistorico);
  } else {
    tareas.push(tarea);
    console.log('[new]', tarea.titulo, '#' + tarea.numeroHistorico);
  }
}

function apply(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('[skip]', filePath);
    return;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
  let n = nextNumero(data.tareas);

  const madreNum = String(++n).padStart(2, '0');
  upsert(data.tareas, {
    id: MADRE_ID,
    titulo: '[ECR] Programar NL1 agosto',
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: MADRE_FECHA,
    horaInicio: '09:00',
    horaFin: '12:00',
    notas:
      'Programación NL1 agosto (LinkedIn). Subtareas por fecha de publicación: ' +
      '05 ago Artículo · 10 ago Carrusel · 12 ago Video. ' +
      'Relacionado: NL 1 ago · Tecnología sin integración.',
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    numeroHistorico: madreNum,
    tipoEntregable: 'programar-nl',
    articuloSlug: 'tecnologia-sin-integracion',
    articuloPublicacion: '2026-08-01',
    parentId: null,
    agendaFijada: true,
  });

  const hijos = [
    {
      id: 'tarea-ecr-programar-nl1-articulo-2026-08-05',
      titulo: '[ECR] NL1 — Artículo (programar)',
      fecha: '2026-08-05',
      horaInicio: '09:00',
      horaFin: '11:00',
      tipoEntregable: 'programar-articulo',
      notas: 'Programar artículo NL1 agosto · fecha publicación 05 ago 2026.',
    },
    {
      id: 'tarea-ecr-programar-nl1-carrusel-2026-08-10',
      titulo: '[ECR] NL1 — Carrusel (programar)',
      fecha: '2026-08-10',
      horaInicio: '09:00',
      horaFin: '11:00',
      tipoEntregable: 'programar-carrusel',
      notas: 'Programar carrusel NL1 agosto · fecha publicación 10 ago 2026.',
    },
    {
      id: 'tarea-ecr-programar-nl1-video-2026-08-12',
      titulo: '[ECR] NL1 — Video (programar)',
      fecha: '2026-08-12',
      horaInicio: '09:00',
      horaFin: '11:00',
      tipoEntregable: 'programar-video',
      notas: 'Programar video NL1 agosto · fecha publicación 12 ago 2026.',
    },
  ];

  hijos.forEach((h, i) => {
    const num = String(++n).padStart(2, '0');
    upsert(data.tareas, {
      ...h,
      clienteId: CLIENTE,
      rolId: ROL,
      prioridad: 'alta',
      completada: false,
      pendiente: false,
      numeroHistorico: num,
      parentId: MADRE_ID,
      ordenHijo: i + 1,
      agendaFijada: true,
      articuloSlug: 'tecnologia-sin-integracion',
    });
  });

  data.respaldoActualizado = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  console.log('[ok]', path.basename(filePath));
}

for (const f of FILES) apply(f);
console.log('Ver madre: http://127.0.0.1:8000/index.html?disco=1&fecha=2026-07-29');
console.log('Subtareas: 2026-08-05 · 2026-08-10 · 2026-08-12');
