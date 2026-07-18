#!/usr/bin/env node
/**
 * Ajusta el live a la agenda vigente (sin borrar otros clientes):
 *  - TS Contenidos 7 y 8 → hechas (madre + subtareas)
 *  - Cita Nutriologa lunes 27 jul 2026
 *  - ECR NL1 = 20 jul · NL2 = 22 jul · Portada NL1 hecha
 *  - Sync pedidos Impresoreando → calendario
 *  - JM F2 (D1–D20) → fuera del calendario (serie antigua)
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

function run(name) {
  const abs = path.join(__dirname, name);
  console.log('\n→', name);
  const r = spawnSync(process.execPath, [abs], { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0) {
    console.error('Falló', name);
    process.exit(r.status || 1);
  }
}

function main() {
  if (!fs.existsSync(ORG)) {
    console.error('No existe data/organizacion-live.json');
    process.exit(1);
  }

  run('asegurar-ecr-nl-calendario.js');
  run('sync-impresoreando-organizador.js');
  run('archivar-jm-fase2-calendario.js');

  const data = JSON.parse(fs.readFileSync(ORG, 'utf8'));
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
  data.citasSalud = Array.isArray(data.citasSalud) ? data.citasSalud : [];
  data.especialistasSalud = Array.isArray(data.especialistasSalud)
    ? data.especialistasSalud
    : [];

  let nTs = 0;
  for (const t of data.tareas) {
    const id = String(t.id || '');
    if (TS_PREFIXES.some((p) => id === p || id.startsWith(p + '-'))) {
      if (!t.completada) nTs++;
      t.completada = true;
      t.pendiente = false;
    }
  }
  console.log(`TS C7/C8: ${nTs} tareas marcadas hechas`);

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
  if (ix >= 0) data.citasSalud[ix] = { ...data.citasSalud[ix], ...nutri };
  else if (!data.citasSalud.some((c) => c.fecha === '2026-07-27' && /nutri/i.test(c.especialidad || ''))) {
    data.citasSalud.push(nutri);
  }
  console.log('Nutrióloga: 2026-07-27', nutri.hora);

  data.respaldoActualizado = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(ORG, JSON.stringify(data, null, 2) + '\n', 'utf8');

  const ecrMadres = data.tareas.filter((t) => t.clienteId === 'cli-ecr' && !t.parentId);
  console.log('\nMadres ECR:');
  ecrMadres.forEach((t) => console.log(' ', t.fecha, t.titulo));
  console.log('\nAbre: http://localhost:3000/index.html?disco=1&fecha=2026-07-20&vista=mes');
  console.log('ECR NL1 = lunes 20 jul · NL2 = miércoles 22 jul');
}

main();
