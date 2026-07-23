#!/usr/bin/env node
/**
 * Tarea ECR hoy: Landing Elementor Ley Karin (PDF 1A Desktop)
 *
 *   node scripts/add-ecr-ley-karin-elementor.js
 *   node scripts/add-ecr-ley-karin-elementor.js --also-respaldo
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LIVE = path.join(ROOT, 'data', 'organizacion-live.json');
const RESPALDO = path.join(ROOT, 'data', 'organizacion-respaldo-2026-07-21.json');
const FECHA = '2026-07-23';
const CLIENTE = 'cli-ecr';
const ROL = 'rol-ecr-dev';
const ID = 'tarea-ecr-ley-karin-elementor-1a-2026-07-23';
const PDF = 'index/clientes/ecr/ley-karin/1A-Ley-Karin-ECR-GROUP-Desktop.pdf';
const GUIA = 'index/clientes/ecr/ley-karin/AJUSTES-ELEMENTOR.md';

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
    titulo: '[ECR] Landing Elementor Ley Karin · 1A Desktop',
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: FECHA,
    horaInicio: '10:00',
    horaFin: '14:00',
    notas:
      'Ajustar landing Ley Karin en Elementor para que quede igual al PDF Desktop. ' +
      'Referencia: 1A-Ley-Karin-ECR-GROUP-Desktop.pdf. ' +
      'Guía de ajustes (solo Elementor, sin código): ' +
      GUIA +
      '. PDF: ' +
      PDF,
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    numeroHistorico: num,
    tipoEntregable: 'landing-elementor',
    entregableArchivo: PDF,
    parentId: null,
    agendaFijada: true,
    estadoFijado: false,
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
if (process.argv.includes('--also-respaldo')) upsert(RESPALDO);

const live = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
const t = (live.tareas || []).find((x) => x.id === ID);
const num = t ? t.numeroHistorico : '?';
console.log(`Ver: http://127.0.0.1:8000/index.html?disco=1&tarea=ecr/${num}`);
console.log('Guía:', GUIA);
console.log('PDF:', PDF);
