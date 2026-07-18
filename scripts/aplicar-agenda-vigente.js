#!/usr/bin/env node
/**
 * Ajusta el live a la agenda vigente (sin borrar otros clientes):
 *  - TS Contenidos 7 y 8 → hechas (madre + subtareas)
 *  - Cita Nutriologa lunes 27 jul 2026
 *  - ECR NL1 = 20 ago · NL2 = 22 ago · Portada NL1 hecha
 *  - Sync pedidos Impresoreando → calendario
 *  - JM Fase 2 → D1–D20 hechas (como en tu vista actual)
 *
 *   node scripts/aplicar-agenda-vigente.js
 * Luego: http://localhost:3000/index.html?disco=1  (Ctrl+F5)
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ORG = path.join(ROOT, 'data', 'organizacion-live.json');

const TS_PREFIXES = ['tarea-ts-contenido-7-de-12', 'tarea-ts-contenido-8-de-12'];

function main() {
  if (!fs.existsSync(ORG)) {
    console.error('No existe data/organizacion-live.json');
    process.exit(1);
  }

  // 1) ECR fechas vigentes + portada hecha
  const ecr = spawnSync(process.execPath, [path.join(__dirname, 'actualizar-fechas-ecr-nl-agosto.js')], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (ecr.status !== 0) {
    console.warn('ECR fechas: corre antes add-ecr + renombrar si faltan tareas');
  }

  // 2) Impresoreando → calendario
  spawnSync(process.execPath, [path.join(__dirname, 'sync-impresoreando-organizador.js')], {
    cwd: ROOT,
    stdio: 'inherit',
  });

  const data = JSON.parse(fs.readFileSync(ORG, 'utf8'));
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
  data.citasSalud = Array.isArray(data.citasSalud) ? data.citasSalud : [];
  data.especialistasSalud = Array.isArray(data.especialistasSalud)
    ? data.especialistasSalud
    : [];

  // 3) TS C7 + C8 finalizados
  let nTs = 0;
  for (const t of data.tareas) {
    const id = String(t.id || '');
    if (TS_PREFIXES.some((p) => id === p || id.startsWith(p + '-'))) {
      if (!t.completada) nTs++;
      t.completada = true;
      t.pendiente = false;
    }
  }
  console.log(`TS C7/C8: ${nTs} tareas marcadas hechas (madre + subtareas)`);

  // 4) JM D1–D20 hechas
  let nJm = 0;
  for (const t of data.tareas) {
    if (!(t.id || '').startsWith('tarea-jm-f2-')) continue;
    if (!t.completada) nJm++;
    t.completada = true;
    t.pendiente = false;
  }
  console.log(`JM Fase 2: ${nJm} tareas marcadas hechas`);

  // 5) Nutriologa lunes 27 jul
  if (!data.especialistasSalud.includes('Nutrióloga')) {
    data.especialistasSalud.push('Nutrióloga');
  }
  const NUTRI_ID = 'cita-nutri-2026-07-27';
  const nutri = {
    id: NUTRI_ID,
    fecha: '2026-07-27',
    hora: '10:00',
    especialidad: 'Nutrióloga',
    notas: 'Cita lunes 27 jul · si la hora no es 10:00, edítala en Salud',
    estado: 'agendada',
  };
  const ix = data.citasSalud.findIndex((c) => c.id === NUTRI_ID);
  if (ix >= 0) {
    data.citasSalud[ix] = { ...data.citasSalud[ix], ...nutri };
    console.log('Nutrióloga: actualizada 2026-07-27', nutri.hora);
  } else {
    // Evitar duplicar otra nutri el mismo día
    const otra = data.citasSalud.find(
      (c) => c.fecha === '2026-07-27' && /nutri/i.test(c.especialidad || '')
    );
    if (otra) {
      otra.especialidad = 'Nutrióloga';
      console.log('Nutrióloga: ya había cita ese día →', otra.hora);
    } else {
      data.citasSalud.push(nutri);
      console.log('Nutrióloga: agregada 2026-07-27', nutri.hora);
    }
  }

  data.respaldoActualizado = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(ORG, JSON.stringify(data, null, 2) + '\n', 'utf8');

  const ecrMadres = data.tareas.filter((t) => t.clienteId === 'cli-ecr' && !t.parentId);
  console.log('\nMadres ECR (ve a agosto en el mes):');
  ecrMadres.forEach((t) => console.log(' ', t.fecha, t.titulo, t.completada ? '[x]' : ''));
  console.log('\nAbre: http://localhost:3000/index.html?disco=1');
  console.log('ECR NL1/NL2: http://localhost:3000/index.html?disco=1&fecha=2026-08-20&vista=mes');
  console.log('Lunes 27 (TS C12 + nutri): ?disco=1&fecha=2026-07-27&vista=dia');
}

main();
