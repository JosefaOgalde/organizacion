#!/usr/bin/env node
/**
 * Tronwell — tarea madre «Ajustar textos» (mañana) + subtareas por documento.
 *
 *   node scripts/add-tronwell-ajustar-textos.js
 */
const fs = require('fs');
const path = require('path');

const LIVE = path.join(__dirname, '..', 'data', 'organizacion-live.json');
const RESPALDO = path.join(__dirname, '..', 'data', 'organizacion-respaldo-2026-07-18.json');
const FECHA = '2026-07-19';
const CLIENTE = 'cli-tronwell';
const ROL = 'rol-tw-textos';
const MADRE_ID = 'tarea-tw-ajustar-textos-2026-07-19';

const CLIENTE_OBJ = {
  id: CLIENTE,
  nombre: 'Tronwell',
  abrev: 'TW',
  tipo: 'freelance',
  color: 'indigo',
  roles: [
    {
      id: ROL,
      nombre: 'Textos / contenidos',
      abrev: 'TXT',
      funciones: 'Ajuste de textos\nRevisión de documentos\nEntrega de copys',
      tareasAlMes: 'Según encargos',
      plazosEntregables: 'Por tarea en el calendario',
    },
  ],
  agente: {
    nombre: 'Agente Tronwell',
    emoji: '📄',
    especialidad: 'Ajuste de textos y documentos',
    instrucciones:
      'Eres el asistente de Tronwell. Ayudas a revisar y ajustar textos de documentos (Word), mantener tono claro y entregar versiones listas.',
  },
  manualMarca: { texto: '', archivos: [] },
  metas: '',
  contextoPrompt: '',
  ficha: {
    contacto: '',
    links: '',
    notas: 'Docs de trabajo: Contacto, curso adultos, Home, tutor ia.',
    seccionesExtra: [],
    documentos: [],
  },
};

const DOCS = [
  { id: 'contacto', titulo: 'Contacto.docx', horaInicio: '09:00', horaFin: '11:00', num: '02' },
  { id: 'curso-adultos', titulo: 'curso adultos.docx', horaInicio: '11:00', horaFin: '13:00', num: '03' },
  { id: 'home', titulo: 'Home.docx', horaInicio: '13:00', horaFin: '15:00', num: '04' },
  { id: 'tutor-ia', titulo: 'tutor ia.docx', horaInicio: '15:00', horaFin: '17:00', num: '05' },
];

const MADRE = {
  id: MADRE_ID,
  titulo: '[TW] Ajustar textos',
  clienteId: CLIENTE,
  rolId: ROL,
  fecha: FECHA,
  fechaFin: FECHA,
  horaInicio: '09:00',
  horaFin: '17:00',
  notas:
    'Tarea madre · ajustar textos Tronwell (domingo 19 jul). ' +
    'Subtareas = un documento cada una: Contacto.docx · curso adultos.docx · Home.docx · tutor ia.docx. ' +
    'Completar la madre cuando terminen las 4 subtareas.',
  prioridad: 'alta',
  completada: false,
  pendiente: false,
  numeroHistorico: '01',
  tipoEntregable: 'ecosistema',
  parentId: null,
};

function upsertTarea(data, tarea) {
  const i = data.tareas.findIndex((t) => t && t.id === tarea.id);
  if (i >= 0) {
    const prev = data.tareas[i];
    data.tareas[i] = {
      ...prev,
      ...tarea,
      completada: prev.completada === true,
      pendiente: prev.pendiente === true,
    };
    console.log('Actualizada:', tarea.titulo, `#${tarea.numeroHistorico}`);
  } else {
    data.tareas.push(tarea);
    console.log('Agregada:', tarea.titulo, `#${tarea.numeroHistorico}`);
  }
}

function ensureCliente(data) {
  const i = data.clientes.findIndex((c) => c && c.id === CLIENTE);
  if (i >= 0) {
    data.clientes[i] = { ...data.clientes[i], ...CLIENTE_OBJ, roles: CLIENTE_OBJ.roles };
    console.log('Cliente actualizado: Tronwell');
  } else {
    data.clientes.push(CLIENTE_OBJ);
    console.log('Cliente agregado: Tronwell');
  }
}

function apply(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn('No existe', filePath, '— se omite');
    return;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.clientes = Array.isArray(data.clientes) ? data.clientes : [];
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
  data.meta = data.meta && typeof data.meta === 'object' ? data.meta : {};

  ensureCliente(data);
  upsertTarea(data, MADRE);

  DOCS.forEach((doc, idx) => {
    upsertTarea(data, {
      id: `tarea-tw-ajustar-textos-${doc.id}-2026-07-19`,
      titulo: `[TW] ${doc.titulo}`,
      clienteId: CLIENTE,
      rolId: ROL,
      fecha: FECHA,
      horaInicio: doc.horaInicio,
      horaFin: doc.horaFin,
      notas: `Subtarea de «Ajustar textos» · documento ${doc.titulo}.`,
      prioridad: 'alta',
      completada: false,
      pendiente: false,
      numeroHistorico: doc.num,
      tipoEntregable: 'texto-doc',
      parentId: MADRE_ID,
      ordenHijo: idx + 1,
      documentoNombre: doc.titulo,
    });
  });

  const nota =
    'Tronwell · madre Ajustar textos 2026-07-19 + 4 docs (Contacto, curso adultos, Home, tutor ia).';
  const prev = String(data.meta.nota || '');
  if (!prev.includes('Tronwell · madre Ajustar textos')) {
    data.meta.nota = prev ? `${prev} · ${nota}` : nota;
  }

  data.respaldoActualizado = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('OK →', path.relative(path.join(__dirname, '..'), filePath));
}

if (!fs.existsSync(LIVE)) {
  console.error('No existe data/organizacion-live.json — copiá el respaldo 18-07 primero.');
  process.exit(1);
}

apply(LIVE);
if (fs.existsSync(RESPALDO)) apply(RESPALDO);

console.log('\nVer: http://127.0.0.1:8000/index.html?disco=1&tarea=tw/01');
console.log('Portal: http://127.0.0.1:8000/index/clientes/tronwell/');
