#!/usr/bin/env node
/**
 * Marca [ECR] TI — Portada como hecha y apunta al entregable Canva final.
 * Uso (con el live local): node scripts/marcar-ecr-nl1-portada-hecha.js
 */
const fs = require('fs');
const path = require('path');

const LIVE = path.join(__dirname, '..', 'data', 'organizacion-live.json');
const PORTADA_ID = 'tarea-ecr-nl-agosto-portada-2026-07-17';
const ENTREGABLE =
  'index/clientes/ecr/newsletter/portadas-guardadas/NL1-ago-portadas-canva-finales.md';

if (!fs.existsSync(LIVE)) {
  console.error('No existe data/organizacion-live.json — corre antes add-ecr-ecosistema-nl-agosto.js');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
const now = new Date().toISOString();
let t = data.tareas.find((x) => x.id === PORTADA_ID);
if (!t) {
  // asegurar ecosistema
  require('./add-ecr-ecosistema-nl-agosto.js');
  const data2 = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  t = data2.tareas.find((x) => x.id === PORTADA_ID);
  if (!t) {
    console.error('No se encontró la subtarea Portada');
    process.exit(1);
  }
  Object.assign(data, data2);
  t = data.tareas.find((x) => x.id === PORTADA_ID);
}

t.completada = true;
t.pendiente = false;
t.completadaEn = now;
t.entregableArchivo = ENTREGABLE;
t.notas =
  'Portadas Canva FINALES con logo ECR + título «Tecnología sin integración: el principal freno de la eficiencia». ' +
  '3 opciones en portadas-guardadas/nl1-ago-finales/ + NL1-ago-portadas-canva-finales.md.';

fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('OK · Portada marcada hecha →', ENTREGABLE);
console.log('Abre: http://127.0.0.1:8000/index.html?disco=1  (o :3000)');
