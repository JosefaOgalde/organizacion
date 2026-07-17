#!/usr/bin/env node
/**
 * ECR — nombres de tareas madre según artículo:
 *   1) Tecnologías de la información → NL 1 de agosto
 *   2) Equipos en terreno → segundo NL
 *
 * Renombra la madre de hoy (17 jul) + subtareas, y crea/actualiza
 * la madre Equipos en terreno (próximo viernes 24 jul) con 4 subtareas.
 *
 *   node scripts/renombrar-ecr-madres-articulos.js
 * Luego: http://localhost:3000/index.html?disco=1 → vista Semana o Día
 */
const fs = require('fs');
const path = require('path');

const LIVE = path.join(__dirname, '..', 'data', 'organizacion-live.json');
const CLIENTE = 'cli-ecr';
const ROL = 'rol-ecr-cm';

const MADRE_TI_ID = 'tarea-ecr-ecosistema-nl-agosto-2026-07-17';
const FECHA_TI = '2026-07-17';

const MADRE_ET_ID = 'tarea-ecr-ecosistema-equipos-terreno-2026-07-24';
const FECHA_ET = '2026-07-24';

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
      // no pisar progreso local
      completada: prev.completada === true || tarea.completada === true,
      pendiente: prev.pendiente,
      sesionAgente: prev.sesionAgente || tarea.sesionAgente,
      agendaFijada: prev.agendaFijada,
      estadoFijado: prev.estadoFijado,
    };
    console.log('Actualizada:', data.tareas[i].titulo);
  } else {
    data.tareas.push(tarea);
    console.log('Agregada:', tarea.titulo);
  }
}

/** —— 1) NL 1 agosto · Tecnologías de la información —— */
upsert({
  id: MADRE_TI_ID,
  titulo: '[ECR] NL 1 ago · Tecnologías de la información',
  clienteId: CLIENTE,
  rolId: ROL,
  fecha: FECHA_TI,
  horaInicio: '09:00',
  horaFin: '18:00',
  notas:
    'Tarea madre · artículo «Tecnologías de la información» (publicación NL LinkedIn 1 de agosto). ' +
    'Subtareas indexadas: 1 Copys · 2 Portada · 3 Carrusel · 4 Video. ' +
    'Vista Semana o Día para ver el bloque madre + hijas con colores.',
  prioridad: 'alta',
  completada: false,
  pendiente: false,
  numeroHistorico: '04',
  tipoEntregable: 'ecosistema',
  articuloSlug: 'tecnologias-de-la-informacion',
  articuloPublicacion: '2026-08-01',
  parentId: null,
});

const hijosTI = [
  {
    id: 'tarea-ecr-nl-agosto-copys-2026-07-17',
    titulo: '[ECR] TI — Copys (TXT)',
    horaInicio: '09:00',
    horaFin: '11:00',
    numeroHistorico: '05',
    tipoEntregable: 'copys-txt',
    ordenHijo: 1,
    notas: 'Copys feed / carrusel / video del artículo Tecnologías de la información (NL 1 ago).',
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
    notas:
      'Fondos Midjourney NL 1 ago · Tecnologías de la información. Armar portada en Canva (título + logo).',
  },
  {
    id: 'tarea-ecr-nl-agosto-carrusel-2026-07-17',
    titulo: '[ECR] TI — Carrusel',
    horaInicio: '13:00',
    horaFin: '15:30',
    numeroHistorico: '07',
    tipoEntregable: 'carrusel',
    ordenHijo: 3,
    notas: 'Carrusel Canva del artículo Tecnologías de la información.',
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

for (const h of hijosTI) {
  upsert({
    ...h,
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: FECHA_TI,
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    parentId: MADRE_TI_ID,
    articuloSlug: 'tecnologias-de-la-informacion',
  });
}

/** —— 2) Equipos en terreno (segundo artículo) —— */
upsert({
  id: MADRE_ET_ID,
  titulo: '[ECR] NL · Equipos en terreno',
  clienteId: CLIENTE,
  rolId: ROL,
  fecha: FECHA_ET,
  horaInicio: '09:00',
  horaFin: '18:00',
  notas:
    'Tarea madre · segundo artículo: «Equipos en terreno: la ventaja de ajustar a tiempo». ' +
    'Subtareas indexadas: 1 Copys · 2 Portada · 3 Carrusel · 4 Video. ' +
    'Copys ART23 listos en newsletter/COPY-ART23-equipos-en-terreno.txt.',
  prioridad: 'alta',
  completada: false,
  pendiente: false,
  numeroHistorico: '09',
  tipoEntregable: 'ecosistema',
  articuloSlug: 'equipos-en-terreno',
  parentId: null,
});

const hijosET = [
  {
    id: 'tarea-ecr-et-copys-2026-07-24',
    titulo: '[ECR] ET — Copys (TXT)',
    horaInicio: '09:00',
    horaFin: '11:00',
    numeroHistorico: '10',
    tipoEntregable: 'copys-txt',
    ordenHijo: 1,
    entregableArchivo: 'index/clientes/ecr/newsletter/COPY-ART23-equipos-en-terreno.txt',
    notas: 'Usar COPY-ART23-equipos-en-terreno.txt (feed / carrusel / video).',
  },
  {
    id: 'tarea-ecr-et-portada-2026-07-24',
    titulo: '[ECR] ET — Portada (fondos)',
    horaInicio: '11:00',
    horaFin: '13:00',
    numeroHistorico: '11',
    tipoEntregable: 'portada-imgs',
    ordenHijo: 2,
    entregableArchivo: 'index/clientes/ecr/newsletter/portadas-guardadas/ART23-equipos-en-terreno.md',
    notas: 'Prompts/fondos ART23 · Equipos en terreno.',
  },
  {
    id: 'tarea-ecr-et-carrusel-2026-07-24',
    titulo: '[ECR] ET — Carrusel',
    horaInicio: '13:00',
    horaFin: '15:30',
    numeroHistorico: '12',
    tipoEntregable: 'carrusel',
    ordenHijo: 3,
    entregableArchivo: 'index/clientes/ecr/newsletter/COPY-ART23-equipos-en-terreno.txt',
    notas: 'Carrusel con slides del artículo Equipos en terreno.',
  },
  {
    id: 'tarea-ecr-et-video-2026-07-24',
    titulo: '[ECR] ET — Video',
    horaInicio: '15:30',
    horaFin: '18:00',
    numeroHistorico: '13',
    tipoEntregable: 'video',
    ordenHijo: 4,
    entregableArchivo: 'index/clientes/ecr/newsletter/COPY-ART23-equipos-en-terreno.txt',
    notas: 'Video = carrusel animado · Equipos en terreno.',
  },
];

for (const h of hijosET) {
  upsert({
    ...h,
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: FECHA_ET,
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    parentId: MADRE_ET_ID,
    articuloSlug: 'equipos-en-terreno',
  });
}

data.respaldoActualizado = new Date().toISOString().slice(0, 10);
fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');

const madres = data.tareas.filter((t) => t.clienteId === CLIENTE && !t.parentId && t.tipoEntregable === 'ecosistema');
console.log('\nMadres ecosistema ECR:');
madres.forEach((m) => {
  const kids = data.tareas
    .filter((h) => h.parentId === m.id)
    .sort((a, b) => (a.ordenHijo || 0) - (b.ordenHijo || 0));
  console.log(`  ${m.fecha}  ${m.titulo}  (${kids.length} subtareas)`);
  kids.forEach((k, i) => console.log(`    ${i + 1}. ${k.titulo}`));
});
console.log('\nAbre Semana o Día: http://localhost:3000/index.html?disco=1');
