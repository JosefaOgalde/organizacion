#!/usr/bin/env node
/**
 * Joyas Mercury — tarea: 3 círculos colecciones del HOME con Elementor Free (sin CSS).
 *
 *   node scripts/add-jm-home-circulos-elementor.js
 * Luego: http://127.0.0.1:8000/index.html?disco=1&tarea=joyas-mercury/22
 */
const fs = require('fs');
const path = require('path');

const LIVE = path.join(__dirname, '..', 'data', 'organizacion-live.json');
const ID = 'tarea-jm-home-circulos-elementor-free';
const NUM = '22';
const FECHA = '2026-07-21';

const GUIA =
  'index/clientes/joyasmercury/HOME-CIRCULOS-ELEMENTOR-FREE.md';

if (!fs.existsSync(LIVE)) {
  console.error('No existe data/organizacion-live.json');
  console.error('Arranca ABRIR-LARAVEL.bat o copia un respaldo a live.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
if (!Array.isArray(data.tareas)) data.tareas = [];

const notas = [
  'Home joyasmercury.cl: configurar los 3 círculos de colecciones (Esencial · Gold · Deluxe) SOLO con Elementor Free (radio 50%, contenedores, imágenes 1:1, links).',
  'NO usar CSS adicional de Apariencia → Personalizar para estos círculos: el CSS se desconfigura a los 1–2 días.',
  `Guía paso a paso: ${GUIA}`,
  'Validar desktop + móvil tras publicar. Al terminar → marcar hecha.',
].join(' ');

const tarea = {
  id: ID,
  titulo: '[JM] Home · 3 círculos colecciones (Elementor Free, sin CSS)',
  clienteId: 'cli-joyas-mercury',
  rolId: 'rol-jm-dev',
  fecha: FECHA,
  horaInicio: '10:00',
  horaFin: '13:00',
  notas,
  prioridad: 'alta',
  completada: false,
  pendiente: false,
  numeroHistorico: NUM,
  tipoEntregable: 'jm-elementor-home-circulos',
  entregableArchivo: GUIA,
  agendaFijada: true,
  parentId: null,
  estadoFijado: true,
};

const idx = data.tareas.findIndex((t) => t.id === ID);
if (idx >= 0) {
  data.tareas[idx] = { ...data.tareas[idx], ...tarea };
  console.log('Actualizada:', tarea.titulo, `#${NUM}`);
} else {
  data.tareas.push(tarea);
  console.log('Creada:', tarea.titulo, `#${NUM}`);
}

data.respaldoActualizado = new Date().toISOString().slice(0, 10);
fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Guardado en data/organizacion-live.json');
console.log(`Abrir: http://127.0.0.1:8000/index.html?disco=1&tarea=joyas-mercury/${NUM}`);
console.log(`Guía: ${GUIA}`);
