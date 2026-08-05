#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const panelPath = path.join(__dirname, '..', 'index', 'clientes', 'impresoreando', 'panel', 'panel.js');
const source = fs.readFileSync(panelPath, 'utf8');
const start = source.indexOf('  function renderRedes() {');
const end = source.indexOf('\n  function escapeHtml(', start);

assert.ok(start >= 0 && end > start, 'No se pudo extraer renderRedes() desde panel.js');

const renderSource = source.slice(start, end);
const campana = {
  mes: 'Agosto 2026',
  canal: '@impresoreando',
  meta: 'Publicar tres veces por semana',
  kpi: 'Publicaciones y pedidos',
  pilares: [{ nombre: 'Producto', detalle: 'Mostrar catálogo' }],
  semana: [{ dia: 'Lunes', formato: 'Reel', ejemplo: 'Producto destacado' }],
  pendientes: ['Programar publicaciones'],
};
const escapeHtml = (value) => String(value || '');

function cargarRenderRedes(tabRedes) {
  const querySelector = (selector) => (selector === '#tab-redes' ? tabRedes : null);
  return new Function(
    '$',
    'CAMPANA_REDES_IMP',
    'escapeHtml',
    `${renderSource}\nreturn renderRedes;`
  )(querySelector, campana, escapeHtml);
}

assert.doesNotThrow(
  () => cargarRenderRedes(null)(),
  'El panel debe cargar aunque el HTML viejo no tenga #tab-redes'
);

const tabRedes = {
  innerHTML: '',
  querySelectorAll: () => [],
};
cargarRenderRedes(tabRedes)();
assert.match(tabRedes.innerHTML, /Redes sociales/);

console.log('OK: renderRedes tolera HTML viejo y renderiza cuando la pestaña existe.');
