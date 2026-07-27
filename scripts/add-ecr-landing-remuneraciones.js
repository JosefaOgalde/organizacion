#!/usr/bin/env node
/**
 * Tarea ECR: Landing Elementor Remuneraciones (software)
 *
 *   node scripts/add-ecr-landing-remuneraciones.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LIVE = path.join(ROOT, 'data', 'organizacion-live.json');
const FECHA = '2026-07-27';
const CLIENTE = 'cli-ecr';
const ROL = 'rol-ecr-dev';
const ID = 'tarea-ecr-landing-remuneraciones-2026-07-27';
const GUIA = 'index/clientes/ecr/remuneraciones/AJUSTES-ELEMENTOR.md';
const CHECK = 'index/clientes/ecr/remuneraciones/DEJAR-OK.md';
const URL = 'https://ecrgroup.cl/remuneraciones/';

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
    titulo: '[ECR] Landing remuneraciones',
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: FECHA,
    horaInicio: '15:00',
    horaFin: '18:00',
    notas:
      'Ajustar landing software Remuneraciones en Elementor. ' +
      'URL: ' +
      URL +
      ' (no confundir con /soluciones/remuneraciones/). ' +
      'Prioridad: H1 duplicado, headings vacíos, 2 cols móvil, tipografía. ' +
      'Guía: ' +
      GUIA +
      ' · Checklist: ' +
      CHECK +
      ' · Tipografía: index/clientes/ecr/remuneraciones/RESPONSIVE-TEXTO.md',
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    numeroHistorico: num,
    tipoEntregable: 'landing-elementor',
    entregableArchivo: CHECK,
    productoUrl: URL,
    parentId: null,
    agendaFijada: true,
  };

  const idx = data.tareas.findIndex((t) => t.id === ID);
  if (idx >= 0) {
    tarea.numeroHistorico = data.tareas[idx].numeroHistorico || num;
    data.tareas[idx] = { ...data.tareas[idx], ...tarea };
    console.log('Actualizada', tarea.titulo, '#' + tarea.numeroHistorico);
  } else {
    data.tareas.push(tarea);
    console.log('Creada', tarea.titulo, '#' + tarea.numeroHistorico);
  }

  data.respaldoActualizado = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  return true;
}

upsert(LIVE);
console.log('Listo. Abrí organizador con ?disco=1');
