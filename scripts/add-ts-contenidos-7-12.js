#!/usr/bin/env node
/**
 * Trendseeker — Contenidos 7/12 … 12/12 (tarea madre + 3 subtareas cada uno).
 *
 * Calendario (desde vie 17 jul 2026):
 *   Vie AM  · Contenido 7
 *   Vie PM  · Contenido 8
 *   Lun     · Contenido 9
 *   Mié     · Contenido 10
 *   Vie     · Contenido 11
 *   Lun     · Contenido 12
 *
 * Subtareas por madre:
 *   1) Prompt Gemini (video) del link de producto
 *   2) Copys del video (versiones + características de la ficha)
 *   3) Programar / dejar listo para publicar
 * Con las 3 hechas → se puede finalizar la madre.
 *
 *   node scripts/add-ts-contenidos-7-12.js
 * Luego: http://localhost:3000/index.html?disco=1&fecha=2026-07-17&vista=dia
 */
const fs = require('fs');
const path = require('path');

const LIVE = path.join(__dirname, '..', 'data', 'organizacion-live.json');
const CLIENTE = 'cli-trendseeker';
const ROL = 'rol-cm';

/** @type {Array<{n:number,fecha:string,bloque:'am'|'pm'|'dia',producto:string,url:string,sku:string,caracteristicas:string}>} */
const CONTENIDOS = [
  {
    n: 7,
    fecha: '2026-07-17',
    bloque: 'am',
    producto: 'Zapatilla Travel Trainer Black Hombre',
    url: 'https://trendseeker.cl/producto/zapatilla-travel-trainer-black-hombre/',
    sku: 'MFK1000PTP-BLK',
    caracteristicas:
      'Hunter · impermeable 100% · membrana interna · aislada hasta -5°C · nylon reciclado/neopreno/malla · suela caucho FSC · EVA reciclada · Ortholite · TPU lluvia · detalles reflectantes · logo tricolor',
  },
  {
    n: 8,
    fecha: '2026-07-17',
    bloque: 'pm',
    producto: 'Botas Chelsea Commando Negras Brillantes Mujer',
    url: 'https://trendseeker.cl/producto/botas-chelsea-commando-negras-brillantes-para-mujer/',
    sku: 'WFS1018RGL-BLK',
    caracteristicas:
      'Hunter Chelsea militar · 100% waterproof · caucho natural FSC · vegano certificado · hechas a mano · forro/plantilla poliéster reciclado · suela Original · fuelles elásticos · perfil +15 mm',
  },
  {
    n: 9,
    fecha: '2026-07-20',
    bloque: 'dia',
    producto: 'Botas de Agua Bajas Play Mujer Rojo',
    url: 'https://trendseeker.cl/producto/botas-de-agua-bajas-play-para-mujer-rojo/',
    sku: 'WFS2020RMA-LRD',
    caracteristicas:
      'Hunter Play bajas · rojo · 100% impermeables · caucho natural · suela plataforma plana · caña corta (tobillo) · estilo urbano/festival',
  },
  {
    n: 10,
    fecha: '2026-07-22',
    bloque: 'dia',
    producto: 'Botas de Agua Original para Niños',
    url: 'https://trendseeker.cl/producto/botas-de-agua-original-para-ninos/',
    sku: 'JFT6000RMA-BLK',
    caracteristicas:
      'Hunter Original kids · 5–11 años (31–37) · 100% impermeables · caucho natural mate · hechas a mano · forro poliéster · suela Original · parches reflectantes',
  },
  {
    n: 11,
    fecha: '2026-07-24',
    bloque: 'dia',
    producto: 'Botas Play Altas Shearling White Mujer',
    url: 'https://trendseeker.cl/producto/botas-play-altas-con-forro-de-shearling-white-para-mujer/',
    sku: 'WFT2235RMA-WHW',
    caracteristicas:
      'Hunter Play altas · white/shearling · vegano · impermeable · hechas a mano · forro borrego vegano · aislante hasta -5°C · plantilla térmica · suela plana · lengüeta de entrada',
  },
  {
    n: 12,
    fecha: '2026-07-27',
    bloque: 'dia',
    producto: 'Botas de Agua Original Niños Rosado Brillante',
    url: 'https://trendseeker.cl/producto/botas-de-agua-original-para-ninos-rosado-brillante/',
    sku: 'JFT6000RMA-RBP',
    caracteristicas:
      'Hunter Original kids · rosado brillante · 5–11 años (31–37) · 100% impermeables · caucho natural · hechas a mano · forro poliéster · suela Original · parches reflectantes',
  },
];

function horasBloque(bloque) {
  if (bloque === 'am') {
    return {
      madre: ['09:00', '12:30'],
      prompt: ['09:00', '10:15'],
      copy: ['10:15', '11:30'],
      programar: ['11:30', '12:30'],
    };
  }
  if (bloque === 'pm') {
    return {
      madre: ['14:00', '17:30'],
      prompt: ['14:00', '15:15'],
      copy: ['15:15', '16:30'],
      programar: ['16:30', '17:30'],
    };
  }
  return {
    madre: ['09:00', '13:00'],
    prompt: ['09:00', '10:30'],
    copy: ['10:30', '12:00'],
    programar: ['12:00', '13:00'],
  };
}

function pad(n) {
  return String(n).padStart(2, '0');
}

if (!fs.existsSync(LIVE)) {
  console.error('No existe data/organizacion-live.json');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
data.tareas = Array.isArray(data.tareas) ? data.tareas : [];

function upsert(tarea) {
  const i = data.tareas.findIndex((t) => t.id === tarea.id);
  if (i >= 0) {
    data.tareas[i] = { ...data.tareas[i], ...tarea };
    console.log('Actualizada:', tarea.titulo, `#${tarea.numeroHistorico}`);
  } else {
    data.tareas.push(tarea);
    console.log('Agregada:', tarea.titulo, `#${tarea.numeroHistorico}`);
  }
}

let num = 5; // sigue a #04 copy botas

for (const c of CONTENIDOS) {
  const h = horasBloque(c.bloque);
  const madreId = `tarea-ts-contenido-${c.n}-de-12`;
  const etiqueta = `${c.n}/12`;
  const bloqueTxt =
    c.bloque === 'am' ? 'viernes AM' : c.bloque === 'pm' ? 'viernes PM' : c.fecha;

  const madreNum = pad(num++);
  upsert({
    id: madreId,
    titulo: `[TS] Contenido ${etiqueta} · ${c.producto}`,
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: c.fecha,
    horaInicio: h.madre[0],
    horaFin: h.madre[1],
    notas:
      `Tarea madre Contenido ${etiqueta} (serie mensual 12 pubs). ` +
      `Producto: ${c.producto} · SKU ${c.sku}. ` +
      `Link: ${c.url} · ` +
      `Características: ${c.caracteristicas}. ` +
      `Subtareas: 1) Prompt Gemini video · 2) Copys del video · 3) Programar. ` +
      `Con las 3 hechas → finalizar esta madre. Bloque: ${bloqueTxt}.`,
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    numeroHistorico: madreNum,
    tipoEntregable: 'ecosistema',
    parentId: null,
    productoUrl: c.url,
    contenidoSerie: c.n,
    contenidoTotal: 12,
  });

  const promptStem = `index/clientes/trendseeker/prompts/PROMPT-c${String(c.n).padStart(2, '0')}-${
    {
      7: 'travel-trainer-black-hombre',
      8: 'chelsea-commando-negras-mujer',
      9: 'play-bajas-rojo-mujer',
      10: 'original-ninos',
      11: 'play-altas-shearling-white-mujer',
      12: 'original-ninos-rosado-brillante',
    }[c.n]
  }`;
  const promptArchivos = {
    A: `${promptStem}-A.txt`,
    B: `${promptStem}-B.txt`,
    C: `${promptStem}-C.txt`,
  };
  const promptArchivo = promptArchivos.A;

  const promptNum = pad(num++);
  upsert({
    id: `${madreId}-prompt`,
    titulo: `[TS] C${etiqueta} — Prompt Gemini (video)`,
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: c.fecha,
    horaInicio: h.prompt[0],
    horaFin: h.prompt[1],
    notas:
      `Prompt Gemini VIDEO · tres TXT independientes (A/B/C). ` +
      `Producto: ${c.producto}. Link: ${c.url}. ` +
      `Edita y copia cada versión por separado en la tarea.`,
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    numeroHistorico: promptNum,
    tipoEntregable: 'prompt-gemini',
    entregableArchivo: promptArchivo,
    entregableArchivosPrompt: promptArchivos,
    parentId: madreId,
    productoUrl: c.url,
  });

  const copyStem = `index/clientes/trendseeker/copys/COPY-c${String(c.n).padStart(2, '0')}-${
    {
      7: 'travel-trainer-black-hombre',
      8: 'chelsea-commando-negras-mujer',
      9: 'play-bajas-rojo-mujer',
      10: 'original-ninos',
      11: 'play-altas-shearling-white-mujer',
      12: 'original-ninos-rosado-brillante',
    }[c.n]
  }`;
  const copyArchivos = {
    A: `${copyStem}-A.txt`,
    B: `${copyStem}-B.txt`,
    C: `${copyStem}-C.txt`,
  };

  const copyNum = pad(num++);
  upsert({
    id: `${madreId}-copy`,
    titulo: `[TS] C${etiqueta} — Copys video`,
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: c.fecha,
    horaInicio: h.copy[0],
    horaFin: h.copy[1],
    notas:
      `Copys video · tres TXT (A/B/C). Características: ${c.caracteristicas}. ` +
      `CTA con link ${c.url}. Edita/copia en la tarea.`,
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    numeroHistorico: copyNum,
    tipoEntregable: 'copys-txt',
    entregableArchivo: copyArchivos.A,
    entregableArchivosCopy: copyArchivos,
    parentId: madreId,
    productoUrl: c.url,
  });

  const progNum = pad(num++);
  upsert({
    id: `${madreId}-programar`,
    titulo: `[TS] C${etiqueta} — Programar`,
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: c.fecha,
    horaInicio: h.programar[0],
    horaFin: h.programar[1],
    notas:
      `Dejar el contenido programado/listo para publicar (feed/Reels/historias según plan TS). ` +
      `Verificar copy + video + link producto. Al terminar → marcar hecha y finalizar madre Contenido ${etiqueta}.`,
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    numeroHistorico: progNum,
    tipoEntregable: 'programar',
    parentId: madreId,
    productoUrl: c.url,
  });
}

const crear = data.tareas.find((t) => t.id === 'tarea-ts-contenido-2026-07-15');
if (crear) {
  const extra =
    ' · Serie Contenidos 7–12 agendada (vie 17 AM/PM → lun 20 → mié 22 → vie 24 → lun 27). Cada madre tiene Prompt + Copys + Programar.';
  if (!(crear.notas || '').includes('Contenidos 7–12')) {
    crear.notas = (crear.notas || '') + extra;
  }
}

data.respaldoActualizado = new Date().toISOString().slice(0, 10);
fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');

// Genera TXT de prompts A/B/C y refresca índice
try {
  const gen = require('./generar-ts-prompts-contenidos-7-12.js');
  const items = gen.escribirPrompts();
  gen.actualizarTareasYIndice(items);
} catch (e) {
  console.warn('No se pudieron generar prompts TXT:', e.message);
}

// Genera TXT de copys A/B/C
try {
  const genCopy = require('./generar-ts-copys-contenidos-7-12.js');
  const itemsCopy = genCopy.escribirCopys();
  genCopy.actualizarTareas(itemsCopy);
} catch (e) {
  console.warn('No se pudieron generar copys TXT:', e.message);
}

console.log('\nListo: contenidos 7/12 … 12/12 (madres + subtareas).');
console.log('Vie 17 AM → C7 · Vie 17 PM → C8 · Lun 20 → C9 · Mié 22 → C10 · Vie 24 → C11 · Lun 27 → C12');
console.log('Abre http://localhost:3000/index.html?disco=1&fecha=2026-07-17&vista=dia');
console.log('Landing: http://localhost:3000/index/clientes/trendseeker/');
