#!/usr/bin/env node
/**
 * Quita del calendario las series antiguas JM F2 / MOVA auth
 * y restaura el trabajo actual (TS Contenidos 7–12 + ECR NL agosto).
 *
 *   node scripts/calendario-enfoque-actual.js
 * Luego: http://localhost:3000/index.html?disco=1
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const LIVE = path.join(ROOT, 'data', 'organizacion-live.json');

const PREFIJOS_ARCHIVAR = [/^tarea-jm-f2-/, /^tarea-mova-auth-/];

function main() {
  if (!fs.existsSync(LIVE)) {
    console.error('No existe data/organizacion-live.json');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  const antes = (data.tareas || []).length;
  const quitadas = [];
  data.tareas = (data.tareas || []).filter((t) => {
    const id = String(t.id || '');
    if (PREFIJOS_ARCHIVAR.some((re) => re.test(id))) {
      quitadas.push(`${id} · ${(t.titulo || '').slice(0, 50)}`);
      return false;
    }
    return true;
  });

  data.meta = data.meta || {};
  data.meta.modoTrabajo = 'manual';
  data.meta.autoGenerarTareas = false;
  data.meta.nota =
    'Enfoque actual: TS Contenidos 7–12 + ECR NL agosto. Series JM F2 / MOVA auth archivadas del calendario.';
  data.respaldoActualizado = new Date().toISOString().slice(0, 10);

  fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Archivadas ${quitadas.length} tareas antiguas (de ${antes}).`);
  quitadas.forEach((l) => console.log('  -', l));

  const scripts = [
    'add-ts-contenidos-7-12.js',
    'add-ecr-ecosistema-nl-agosto.js',
    'renombrar-ecr-madres-articulos.js',
  ];
  for (const name of scripts) {
    const abs = path.join(__dirname, name);
    if (!fs.existsSync(abs)) {
      console.warn('Script no encontrado, se omite:', name);
      continue;
    }
    console.log('\n→', name);
    const r = spawnSync(process.execPath, [abs], { cwd: ROOT, stdio: 'inherit' });
    if (r.status !== 0) {
      console.warn('Avisó o falló', name, '(código', r.status, ') — sigue.');
    }
  }

  const after = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  const porCli = {};
  for (const t of after.tareas || []) {
    porCli[t.clienteId || '(sin)'] = (porCli[t.clienteId || '(sin)'] || 0) + 1;
  }
  console.log('\nTareas en live:', (after.tareas || []).length, porCli);
  console.log('Abre: http://localhost:3000/index.html?disco=1');
  console.log('(En Windows también: CALENDARIO-ENFOQUE-ACTUAL.bat)');
}

main();
