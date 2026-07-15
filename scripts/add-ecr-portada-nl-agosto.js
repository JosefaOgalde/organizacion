#!/usr/bin/env node
/**
 * Agrega/actualiza (idempotente) la tarea ECR del viernes:
 * armar portada NL 1 de agosto con los 4 fondos Midjourney ya elegidos.
 *
 *   node scripts/add-ecr-portada-nl-agosto.js
 * Luego: http://localhost:3000/index.html?disco=1
 */
const fs = require('fs');
const path = require('path');

const LIVE = path.join(__dirname, '..', 'data', 'organizacion-live.json');

const TAREA = {
  id: 'tarea-ecr-portada-nl-agosto-2026-07-17',
  titulo: '[ECR] Portada NL 1 agosto — fondos + Canva',
  clienteId: 'cli-ecr',
  rolId: 'rol-ecr-cm',
  fecha: '2026-07-17',
  horaInicio: '10:00',
  horaFin: '13:00',
  notas:
    'Armar portada del newsletter LinkedIn del 1 de agosto en Canva. ' +
    'Fondos ya elegidos (4) según prompts Midjourney del generador en perfil ECR → Portada Midjourney ' +
    '(artículo equipos en terreno / ajustar a tiempo). Ver: index/clientes/ecr/newsletter/portadas-guardadas/NL-2026-08-01-fondos-elegidos.md. ' +
    'En Canva: título + logo encima; el MJ es solo fondo. ' +
    'Este mismo flujo (PDF → generar 3 mundos por tema → MJ → elegir fondo → Canva) se puede repetir en otras ocasiones desde el perfil del cliente ECR.',
  prioridad: 'alta',
  completada: false,
  pendiente: false,
  numeroHistorico: '04',
};

const HOY_PORTADA = {
  id: 'tarea-ecr-portada-nl-2026-07-15',
  notas:
    'Fondos Midjourney elegidos (4) para NL 1 agosto — ver NL-2026-08-01-fondos-elegidos.md. ' +
    'Armado final en Canva queda para viernes 17 en tarea tarea-ecr-portada-nl-agosto-2026-07-17.',
  completada: true,
  pendiente: false,
};

if (!fs.existsSync(LIVE)) {
  console.error('No existe data/organizacion-live.json');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
data.tareas = Array.isArray(data.tareas) ? data.tareas : [];

function upsert(partial) {
  const i = data.tareas.findIndex((t) => t.id === partial.id);
  if (i >= 0) {
    data.tareas[i] = { ...data.tareas[i], ...partial };
    console.log('Actualizada:', data.tareas[i].titulo, data.tareas[i].fecha);
  } else {
    data.tareas.push(partial);
    console.log('Agregada:', partial.titulo, partial.fecha);
  }
}

upsert(TAREA);

const hoyIdx = data.tareas.findIndex((t) => t.id === HOY_PORTADA.id);
if (hoyIdx >= 0) {
  data.tareas[hoyIdx] = { ...data.tareas[hoyIdx], ...HOY_PORTADA };
  console.log('Hoy portada marcada hecha (fondos elegidos):', HOY_PORTADA.id);
}

data.respaldoActualizado = new Date().toISOString().slice(0, 10);
fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Listo. Abre http://localhost:3000/index.html?disco=1 (viernes 2026-07-17).');
