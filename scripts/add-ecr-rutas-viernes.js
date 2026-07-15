#!/usr/bin/env node
/**
 * Agrega (idempotente) tarea ECR del viernes 2026-07-17:
 * [ECR] Implementación rutas de aprendizaje (rol programación/dev)
 *
 *   node scripts/add-ecr-rutas-viernes.js
 * Luego: http://localhost:3000/index.html?disco=1
 */
const fs = require('fs');
const path = require('path');

const LIVE = path.join(__dirname, '..', 'data', 'organizacion-live.json');
const TAREA = {
  id: 'tarea-ecr-rutas-aprendizaje-2026-07-17',
  titulo: '[ECR] Implementación rutas de aprendizaje',
  clienteId: 'cli-ecr',
  rolId: 'rol-ecr-dev',
  fecha: '2026-07-17',
  horaInicio: '10:00',
  horaFin: '13:00',
  notas: 'Implementación/programación de rutas de aprendizaje (modal sectores, links, front).',
  prioridad: 'alta',
  completada: false,
  pendiente: false,
};

if (!fs.existsSync(LIVE)) {
  console.error('No existe data/organizacion-live.json');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
const i = data.tareas.findIndex((t) => t.id === TAREA.id);
if (i >= 0) {
  data.tareas[i] = { ...data.tareas[i], ...TAREA };
  console.log('Actualizada:', TAREA.titulo, TAREA.fecha);
} else {
  data.tareas.push(TAREA);
  console.log('Agregada:', TAREA.titulo, TAREA.fecha);
}
data.respaldoActualizado = new Date().toISOString().slice(0, 10);
fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Listo. Abre http://localhost:3000/index.html?disco=1');
