#!/usr/bin/env node
/**
 * Ecosistema Newsletter 1 agosto (viernes) — tarea madre + 4 subtareas.
 *
 *   node scripts/add-ecr-ecosistema-nl-agosto.js
 * Luego: http://localhost:3000/index.html?disco=1
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
  titulo: '[ECR] Ecosistema newsletter 1 agosto',
  clienteId: CLIENTE,
  rolId: ROL,
  fecha: FECHA,
  horaInicio: '09:00',
  horaFin: '18:00',
  notas:
    'Tarea madre del ciclo NL LinkedIn del 1 de agosto (artículo: Equipos en terreno — la ventaja de ajustar a tiempo). ' +
    'Subtareas: Copys · Portada · Carrusel · Video. ' +
    'Contenido también visible desde el perfil ECR → sección Ecosistema NL.',
  prioridad: 'alta',
  completada: false,
  pendiente: false,
  numeroHistorico: '04',
  tipoEntregable: 'ecosistema',
  parentId: null,
};

const HIJOS = [
  {
    id: 'tarea-ecr-nl-agosto-copys-2026-07-17',
    titulo: '[ECR] NL 1 ago — Copys (TXT)',
    horaInicio: '09:00',
    horaFin: '11:00',
    numeroHistorico: '05',
    tipoEntregable: 'copys-txt',
    entregableArchivo: 'index/clientes/ecr/newsletter/COPY-ART23-equipos-en-terreno.txt',
    notas:
      '2 versiones feed + 2 carrusel + 2 video. Archivo TXT listo para pegar (emojis/hashtags/CTA). ' +
      'Ver bloque «Entregable» en esta tarea o descargar el .txt.',
  },
  {
    id: 'tarea-ecr-nl-agosto-portada-2026-07-17',
    titulo: '[ECR] NL 1 ago — Portada (fondos)',
    horaInicio: '11:00',
    horaFin: '13:00',
    numeroHistorico: '06',
    tipoEntregable: 'portada-imgs',
    entregableArchivo: 'index/clientes/ecr/newsletter/portadas-guardadas/NL-2026-08-01-fondos-elegidos.md',
    notas:
      'Subir los 4 fondos Midjourney en «Imágenes de la tarea». Armar portada en Canva (título + logo). ' +
      'Ref: portadas-guardadas/NL-2026-08-01-fondos-elegidos.md',
  },
  {
    id: 'tarea-ecr-nl-agosto-carrusel-2026-07-17',
    titulo: '[ECR] NL 1 ago — Carrusel',
    horaInicio: '13:00',
    horaFin: '15:30',
    numeroHistorico: '07',
    tipoEntregable: 'carrusel',
    entregableArchivo: 'index/clientes/ecr/newsletter/COPY-ART23-equipos-en-terreno.txt',
    notas:
      'Armar carrusel Canva con slides del artículo. Copys de acompañamiento: sección 2 del TXT de copys. ' +
      'Puedes guardar capturas/export del carrusel en Imágenes de la tarea.',
  },
  {
    id: 'tarea-ecr-nl-agosto-video-2026-07-17',
    titulo: '[ECR] NL 1 ago — Video',
    horaInicio: '15:30',
    horaFin: '18:00',
    numeroHistorico: '08',
    tipoEntregable: 'video',
    entregableArchivo: 'index/clientes/ecr/newsletter/COPY-ART23-equipos-en-terreno.txt',
    notas:
      'Video = carrusel animado. Copys de video: sección 3 del TXT. ' +
      'Guarda preview/thumbnail o export en Imágenes de la tarea.',
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
    data.tareas[i] = { ...data.tareas[i], ...tarea };
    console.log('Actualizada:', tarea.titulo, `#${tarea.numeroHistorico}`);
  } else {
    data.tareas.push(tarea);
    console.log('Agregada:', tarea.titulo, `#${tarea.numeroHistorico}`);
  }
}

// Madre reemplaza la antigua “Portada NL 1 agosto” suelta
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
  });
}

// Limpiar id viejo duplicado si quedó otro
const OLD = 'tarea-ecr-portada-nl-agosto-2026-07-17';
if (OLD !== MADRE_ID) {
  const oi = data.tareas.findIndex((t) => t.id === OLD);
  if (oi >= 0) {
    data.tareas.splice(oi, 1);
    console.log('Eliminada tarea suelta antigua:', OLD);
  }
}

data.respaldoActualizado = new Date().toISOString().slice(0, 10);
fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Listo. Abre http://localhost:3000/index.html?disco=1 (viernes 2026-07-17).');
console.log('Madre #04 · subtareas #05 copys · #06 portada · #07 carrusel · #08 video');
