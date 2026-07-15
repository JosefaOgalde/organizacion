#!/usr/bin/env node
/**
 * Agrega (idempotente) tareas del 2026-07-15 en data/organizacion-live.json:
 * - [TS] Cambiar banner
 * - [TS] Crear contenido
 * - [ECR] Crear copys
 * - [ECR] Portada newsletter
 *
 *   node scripts/add-ts-banner-task.js
 *
 * Luego: http://localhost:3000/index.html?disco=1
 */
const fs = require('fs');
const path = require('path');

const LIVE = path.join(__dirname, '..', 'data', 'organizacion-live.json');
const FECHA = '2026-07-15';
const TAREAS = [
  {
    id: 'tarea-ts-banner-2026-07-15',
    titulo: '[TS] Cambiar banner',
    clienteId: 'cli-trendseeker',
    rolId: 'rol-wp',
    fecha: FECHA,
    horaInicio: '10:00',
    horaFin: '11:00',
    notas: 'Cambiar banner del sitio TrendSeeker (WordPress).',
    prioridad: 'media',
    completada: false,
    pendiente: false,
  },
  {
    id: 'tarea-ts-contenido-2026-07-15',
    titulo: '[TS] Crear contenido',
    clienteId: 'cli-trendseeker',
    rolId: 'rol-cm',
    fecha: FECHA,
    horaInicio: '11:00',
    horaFin: '13:00',
    notas: 'Crear contenido para redes TrendSeeker (copies, piezas o publicaciones del día).',
    prioridad: 'media',
    completada: false,
    pendiente: false,
  },
  {
    id: 'tarea-ecr-copys-2026-07-15',
    titulo: '[ECR] Crear copys',
    clienteId: 'cli-ecr',
    rolId: 'rol-ecr-cm',
    fecha: FECHA,
    horaInicio: '14:00',
    horaFin: '16:00',
    notas: 'Crear copys para ECR (newsletter / feed / carrusel según necesidad del día).',
    prioridad: 'media',
    completada: false,
    pendiente: false,
  },
  {
    id: 'tarea-ecr-portada-nl-2026-07-15',
    titulo: '[ECR] Portada newsletter',
    clienteId: 'cli-ecr',
    rolId: 'rol-ecr-cm',
    fecha: FECHA,
    horaInicio: '16:00',
    horaFin: '17:00',
    notas: 'Crear / preparar portada del newsletter ECR.',
    prioridad: 'media',
    completada: false,
    pendiente: false,
  },
];

if (!fs.existsSync(LIVE)) {
  console.error('No existe data/organizacion-live.json — abre el organizador una vez o importa un respaldo.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
data.tareas = Array.isArray(data.tareas) ? data.tareas : [];

for (const tarea of TAREAS) {
  const i = data.tareas.findIndex((t) => t.id === tarea.id);
  if (i >= 0) {
    data.tareas[i] = { ...data.tareas[i], ...tarea };
    console.log('Actualizada:', tarea.titulo, FECHA);
  } else {
    data.tareas.push(tarea);
    console.log('Agregada:', tarea.titulo, FECHA);
  }
}

data.respaldoActualizado = FECHA;
fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Listo. Abre http://localhost:3000/index.html?disco=1');
