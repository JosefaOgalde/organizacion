#!/usr/bin/env node
/**
 * Alinea el live al trabajo vigente:
 *   - Quita solo MOVA auth (auditoría vieja)
 *   - TS Contenidos 7–12
 *   - ECR NL: NL 1 → 20 ago · NL 2 → 22 ago · Portada NL 1 hecha
 *   - JM Fase 2: se conserva (no archivar); el progreso va en JM_TODO_PROGRESO
 *
 *   node scripts/calendario-enfoque-actual.js
 * Luego: http://localhost:3000/index.html?disco=1
 *   o Laravel: http://127.0.0.1:8000/index.html
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const LIVE = path.join(ROOT, 'data', 'organizacion-live.json');

/** Solo series descartadas; JM y ECR/TS se actualizan, no se borran. */
const PREFIJOS_ARCHIVAR = [/^tarea-mova-auth-/];

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
    'Vigente: TS 7–12 · ECR NL1=20 ago / NL2=22 ago · JM Fase 2 (progreso en jm-backup).';
  data.respaldoActualizado = new Date().toISOString().slice(0, 10);

  fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Archivadas ${quitadas.length} tareas MOVA (de ${antes}). JM se conserva.`);
  quitadas.forEach((l) => console.log('  -', l));

  const scripts = [
    'add-ts-contenidos-7-12.js',
    'add-ecr-ecosistema-nl-agosto.js',
    'renombrar-ecr-madres-articulos.js',
    'actualizar-fechas-ecr-nl-agosto.js',
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

  // Refrescar progreso JM desde JM_TODO_PROGRESO (sin pisar fechas agendaFijada)
  try {
    const live = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
    // Cargar progreso vía eval del archivo browser (solo la parte PROGRESO)
    const jmSrc = fs.readFileSync(path.join(ROOT, 'data', 'jm-backup-contenido.js'), 'utf8');
    const m = jmSrc.match(/window\.JM_TODO_PROGRESO\s*=\s*(\{[\s\S]*?\});/);
    if (m) {
      const prog = Function(`return (${m[1]})`)();
      let n = 0;
      for (const [todoId, patch] of Object.entries(prog)) {
        if (!patch?.completada) continue;
        const tarea = (live.tareas || []).find((t) => t.jmTodoId === todoId);
        if (tarea && !tarea.completada) {
          tarea.completada = true;
          n++;
        }
      }
      fs.writeFileSync(LIVE, JSON.stringify(live, null, 2) + '\n', 'utf8');
      console.log(`\nJM: aplicadas ${n} completadas desde JM_TODO_PROGRESO`);
    }
  } catch (e) {
    console.warn('No se pudo aplicar progreso JM:', e.message);
  }

  const after = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  const porCli = {};
  const ecr = [];
  for (const t of after.tareas || []) {
    porCli[t.clienteId || '(sin)'] = (porCli[t.clienteId || '(sin)'] || 0) + 1;
    if (t.clienteId === 'cli-ecr' && !t.parentId) {
      ecr.push(`${t.fecha}  ${t.titulo}${t.completada ? ' [x]' : ''}`);
    }
  }
  console.log('\nTareas en live:', (after.tareas || []).length, porCli);
  console.log('Madres ECR:');
  ecr.forEach((l) => console.log(' ', l));
  console.log('\nAbre: http://localhost:3000/index.html?disco=1');
  console.log('  o Laravel: http://127.0.0.1:8000/index.html');
}

main();
