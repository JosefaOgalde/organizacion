#!/usr/bin/env node
/**
 * Quita del calendario la serie JM F2 (tarea-jm-f2-*) — ya no es el trabajo actual.
 * Las deja en tareasEliminadas para que el organizador no las vuelva a generar.
 *
 *   node scripts/archivar-jm-fase2-calendario.js
 */
const fs = require('fs');
const path = require('path');

const ORG = path.join(__dirname, '..', 'data', 'organizacion-live.json');

function main() {
  if (!fs.existsSync(ORG)) {
    console.error('No existe data/organizacion-live.json');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(ORG, 'utf8'));
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
  data.tareasEliminadas = Array.isArray(data.tareasEliminadas) ? data.tareasEliminadas : [];

  const jm = data.tareas.filter((t) => (t.id || '').startsWith('tarea-jm-f2-'));
  for (const t of jm) {
    if (!data.tareasEliminadas.includes(t.id)) data.tareasEliminadas.push(t.id);
    if (t.jmTodoId && !data.tareasEliminadas.includes(t.jmTodoId)) {
      data.tareasEliminadas.push(t.jmTodoId);
    }
  }
  data.tareas = data.tareas.filter((t) => !(t.id || '').startsWith('tarea-jm-f2-'));

  // También la entrega sitio auto si existe
  const ENTREGA = 'tarea-jm-entrega-sitio';
  const entrega = data.tareas.find((t) => t.id === ENTREGA);
  if (entrega) {
    data.tareas = data.tareas.filter((t) => t.id !== ENTREGA);
    if (!data.tareasEliminadas.includes(ENTREGA)) data.tareasEliminadas.push(ENTREGA);
  }

  data.meta = data.meta || {};
  data.meta.jmFase2ArchivadaCalendario = true;
  data.respaldoActualizado = new Date().toISOString().slice(0, 10);

  fs.writeFileSync(ORG, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`JM F2: archivadas ${jm.length} tareas del calendario (no se regeneran).`);
  console.log('Cliente Joyas Mercury y ficha se conservan. Nuevas tareas: + Nueva.');
}

main();
