#!/usr/bin/env node
/**
 * Garantiza NL 1 y NL 2 de ECR en el calendario de JULIO:
 *   NL 1 → 2026-07-21 · NL 2 → 2026-07-23 · Portada NL1 hecha
 *
 *   node scripts/asegurar-ecr-nl-calendario.js
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ORG = path.join(ROOT, 'data', 'organizacion-live.json');
const MADRE_NL1 = 'tarea-ecr-ecosistema-nl-agosto-2026-07-17';
const MADRE_NL2 = 'tarea-ecr-ecosistema-equipos-terreno-2026-07-24';
const FECHA_NL1 = '2026-07-21';
const FECHA_NL2 = '2026-07-23';

function run(name) {
  const abs = path.join(__dirname, name);
  if (!fs.existsSync(abs)) {
    console.error('Falta script:', name);
    process.exit(1);
  }
  console.log('\n→', name);
  const r = spawnSync(process.execPath, [abs], { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0) {
    console.error('Falló', name, 'código', r.status);
    process.exit(r.status || 1);
  }
}

function main() {
  if (!fs.existsSync(ORG)) {
    console.error('No existe data/organizacion-live.json');
    process.exit(1);
  }

  run('add-ecr-ecosistema-nl-agosto.js');
  run('renombrar-ecr-madres-articulos.js');
  run('actualizar-fechas-ecr-nl-agosto.js');

  const data = JSON.parse(fs.readFileSync(ORG, 'utf8'));
  const t1 = (data.tareas || []).find((t) => t.id === MADRE_NL1);
  const t2 = (data.tareas || []).find((t) => t.id === MADRE_NL2);
  const hijos1 = (data.tareas || []).filter((t) => t.parentId === MADRE_NL1);
  const hijos2 = (data.tareas || []).filter((t) => t.parentId === MADRE_NL2);

  if (!t1 || !t2) {
    console.error('\nERROR: no quedaron las madres ECR en el live');
    process.exit(1);
  }

  console.log('\n=== ECR en calendario (julio) ===');
  console.log(`NL 1  ${t1.fecha}  ${t1.titulo}  (${hijos1.length} subtareas)`);
  hijos1
    .sort((a, b) => (a.ordenHijo || 0) - (b.ordenHijo || 0))
    .forEach((h) => console.log(`       ${h.completada ? '[x]' : '[ ]'} ${h.titulo}`));
  console.log(`NL 2  ${t2.fecha}  ${t2.titulo}  (${hijos2.length} subtareas)`);
  hijos2
    .sort((a, b) => (a.ordenHijo || 0) - (b.ordenHijo || 0))
    .forEach((h) => console.log(`       ${h.completada ? '[x]' : '[ ]'} ${h.titulo}`));

  if (t1.fecha !== FECHA_NL1 || t2.fecha !== FECHA_NL2) {
    console.error('\nERROR: fechas incorrectas', t1.fecha, t2.fecha);
    process.exit(1);
  }

  console.log('\nMíralas en julio: martes 21 (NL1) y jueves 23 (NL2)');
  console.log('  http://localhost:3000/index.html?disco=1&fecha=2026-07-21&vista=mes');
}

main();
