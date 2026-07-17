#!/usr/bin/env node
/**
 * Ecosistema Newsletter 1 agosto — Tecnologías de la información
 * (madre + 4 subtareas). El segundo artículo es Equipos en terreno
 * → scripts/renombrar-ecr-madres-articulos.js
 *
 *   node scripts/add-ecr-ecosistema-nl-agosto.js
 */
const fs = require('fs');
const path = require('path');

const LIVE = path.join(__dirname, '..', 'data', 'organizacion-live.json');
const FECHA = '2026-07-17';
const CLIENTE = 'cli-ecr';
const ROL = 'rol-ecr-cm';
const MADRE_ID = 'tarea-ecr-ecosistema-nl-agosto-2026-07-17';

const MADRE = {
  id: MADRE_ID,
  titulo: '[ECR] NL 1 ago · Tecnologías de la información',
  clienteId: CLIENTE,
  rolId: ROL,
  fecha: FECHA,
  horaInicio: '09:00',
  horaFin: '18:00',
  notas:
    'Tarea madre · artículo «Tecnologías de la información» (NL LinkedIn 1 de agosto). ' +
    'Subtareas: Copys · Portada · Carrusel · Video. ' +
    'Segundo artículo (otra madre): Equipos en terreno.',
  prioridad: 'alta',
  completada: false,
  pendiente: false,
  numeroHistorico: '04',
  tipoEntregable: 'ecosistema',
  articuloSlug: 'tecnologias-de-la-informacion',
  articuloPublicacion: '2026-08-01',
  parentId: null,
};

const HIJOS = [
  {
    id: 'tarea-ecr-nl-agosto-copys-2026-07-17',
    titulo: '[ECR] TI — Copys (TXT)',
    horaInicio: '09:00',
    horaFin: '11:00',
    numeroHistorico: '05',
    tipoEntregable: 'copys-txt',
    ordenHijo: 1,
    notas: 'Copys feed / carrusel / video · Tecnologías de la información.',
  },
  {
    id: 'tarea-ecr-nl-agosto-portada-2026-07-17',
    titulo: '[ECR] TI — Portada (fondos)',
    horaInicio: '11:00',
    horaFin: '13:00',
    numeroHistorico: '06',
    tipoEntregable: 'portada-imgs',
    ordenHijo: 2,
    entregableArchivo: 'index/clientes/ecr/newsletter/portadas-guardadas/NL-2026-08-01-fondos-elegidos.md',
    notas: 'Fondos Midjourney NL 1 ago · Tecnologías de la información. Armar en Canva.',
  },
  {
    id: 'tarea-ecr-nl-agosto-carrusel-2026-07-17',
    titulo: '[ECR] TI — Carrusel',
    horaInicio: '13:00',
    horaFin: '15:30',
    numeroHistorico: '07',
    tipoEntregable: 'carrusel',
    ordenHijo: 3,
    notas: 'Carrusel Canva · Tecnologías de la información.',
  },
  {
    id: 'tarea-ecr-nl-agosto-video-2026-07-17',
    titulo: '[ECR] TI — Video',
    horaInicio: '15:30',
    horaFin: '18:00',
    numeroHistorico: '08',
    tipoEntregable: 'video',
    ordenHijo: 4,
    notas: 'Video = carrusel animado · Tecnologías de la información.',
  },
];

if (!fs.existsSync(LIVE)) {
  console.error('No existe data/organizacion-live.json');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
data.tareas = Array.isArray(data.tareas) ? data.tareas : [];

function upsert(tarea) {
  const i = data.tareas.findIndex((t) => t.id === tarea.id);
  if (i >= 0) {
    const prev = data.tareas[i];
    data.tareas[i] = {
      ...prev,
      ...tarea,
      completada: prev.completada === true,
      sesionAgente: prev.sesionAgente,
    };
    console.log('Actualizada:', tarea.titulo);
  } else {
    data.tareas.push(tarea);
    console.log('Agregada:', tarea.titulo);
  }
}

upsert(MADRE);
for (const h of HIJOS) {
  upsert({
    ...h,
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: FECHA,
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    parentId: MADRE_ID,
    articuloSlug: 'tecnologias-de-la-informacion',
  });
}

const OLD = 'tarea-ecr-portada-nl-agosto-2026-07-17';
const oi = data.tareas.findIndex((t) => t.id === OLD);
if (oi >= 0) {
  data.tareas.splice(oi, 1);
  console.log('Eliminada tarea suelta antigua:', OLD);
}

data.respaldoActualizado = new Date().toISOString().slice(0, 10);
fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Listo TI. Para Equipos en terreno: node scripts/renombrar-ecr-madres-articulos.js');
