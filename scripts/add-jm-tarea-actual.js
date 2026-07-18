#!/usr/bin/env node
/**
 * Única tarea JM vigente en el calendario (la serie F2 D1–D20 queda archivada).
 * Trabajo actual: Novedades / Destacados mobile (grilla 2×2) + cierre de validación.
 *
 *   node scripts/add-jm-tarea-actual.js
 * Luego: http://localhost:3000/index.html?disco=1&fecha=2026-07-18&vista=dia
 */
const fs = require('fs');
const path = require('path');

const ORG = path.join(__dirname, '..', 'data', 'organizacion-live.json');
const CLI = 'cli-joyas-mercury';
const ROL = 'rol-jm-dev';
const ID = 'tarea-jm-novedades-mobile-actual';
const FECHA = '2026-07-18';

function main() {
  if (!fs.existsSync(ORG)) {
    console.error('No existe data/organizacion-live.json');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(ORG, 'utf8'));
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
  data.meta = data.meta || {};
  data.meta.jmFase2ArchivadaCalendario = true;
  data.meta.autoGenerarTareas = false;

  // Asegurar que F2 no vuelva
  data.tareasEliminadas = Array.isArray(data.tareasEliminadas) ? data.tareasEliminadas : [];
  for (let i = 1; i <= 20; i++) {
    const tid = `tarea-jm-f2-${String(i).padStart(2, '0')}`;
    if (!data.tareasEliminadas.includes(tid)) data.tareasEliminadas.push(tid);
  }
  data.tareas = data.tareas.filter((t) => !(t.id || '').startsWith('tarea-jm-f2-'));

  const tarea = {
    id: ID,
    titulo: '[JM] Novedades mobile · grilla 2×2 + cierre',
    clienteId: CLI,
    rolId: ROL,
    fecha: FECHA,
    horaInicio: '11:00',
    horaFin: '14:00',
    notas:
      'Última tarea JM vigente (la serie F2 D1–D20 ya no va en el calendario). ' +
      'Cerrar Novedades/Destacados en mobile: grilla 2×2, ocultar clones Slick, ' +
      'validar hero/banner sin recorte MERCURY, paridad con wireframes. ' +
      'CSS: index/clientes/joyasmercury/CSS-COMPLETO-ASTRA.css · landing JM. ' +
      'Al terminar → marcar hecha.',
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    numeroHistorico: '21',
    tipoEntregable: 'jm-novedades-mobile',
    agendaFijada: true,
    parentId: null,
  };

  const i = data.tareas.findIndex((t) => t.id === ID);
  if (i >= 0) {
    const prev = data.tareas[i];
    data.tareas[i] = {
      ...prev,
      ...tarea,
      completada: prev.completada === true,
      numeroHistorico: prev.numeroHistorico || tarea.numeroHistorico,
    };
    console.log('Actualizada:', data.tareas[i].titulo, data.tareas[i].fecha);
  } else {
    data.tareas.push(tarea);
    console.log('Agregada:', tarea.titulo, tarea.fecha);
  }

  data.respaldoActualizado = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(ORG, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('Abre: http://localhost:3000/index.html?disco=1&fecha=' + FECHA + '&vista=dia');
}

main();
