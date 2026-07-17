#!/usr/bin/env node
/**
 * Agrega/actualiza (idempotente) la tarea ECR de rutas de aprendizaje.
 * Estado actual: FINALIZADA (2026-07-15).
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
  fecha: '2026-07-15',
  horaInicio: '10:00',
  horaFin: '18:00',
  notas:
    'FINALIZADO 2026-07-15. Modal por sector listo (textos 8 sectores, Excel/Power BI unificados, HTML Elementor en index/clientes/ecr/capacitaciones/modal-ruta-sectores.html).',
  prioridad: 'alta',
  completada: true,
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
  console.log('Actualizada:', TAREA.titulo, TAREA.fecha, 'completada=', TAREA.completada);
} else {
  data.tareas.push(TAREA);
  console.log('Agregada:', TAREA.titulo, TAREA.fecha);
}
data.respaldoActualizado = new Date().toISOString().slice(0, 10);
fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Listo. Abre http://localhost:3000/index.html?disco=1');
