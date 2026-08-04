#!/usr/bin/env node
/**
 * Trendseeker — Grilla agosto 2026 (12 contenidos).
 * Cada pieza = madre + Prompt Gemini (video) + Copys + Programar.
 *
 * Grilla (lun · mié · vie):
 *   04 ago · C1  Accesorios 40%     (PUBLICADO)
 *   07 ago · C2  Zapatillas
 *   10 ago · C3  Chelsea Commando gris pálido
 *   12 ago · C4  Sherpa verde
 *   14 ago · C5  Botas rojo militar
 *   17 ago · C6  Botas bajas rojas
 *   19 ago · C7  Botas altas hombre
 *   21 ago · C8  Calcetines
 *   24 ago · C9  Paraguas
 *   26 ago · C10 Botas jardinera
 *   28 ago · C11 Botas niños verdes
 *   31 ago · C12 Gorros
 *
 *   node scripts/add-ts-contenidos-agosto-2026.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILES = [
  path.join(ROOT, 'data', 'organizacion-live.json'),
  path.join(ROOT, 'data', 'organizacion-respaldo-2026-07-31.json'),
];

const CLIENTE = 'cli-trendseeker';
const ROL = 'rol-cm';
const MES = '2026-08';
const TOTAL = 12;

/** @type {Array<{
 *   n:number,fecha:string,grilla:string,producto:string,url:string,sku:string,
 *   caracteristicas:string,stem:string,publicado?:boolean,
 *   promptArchivo?:string,copyArchivo?:string
 * }>} */
const CONTENIDOS = [
  {
    n: 1,
    fecha: '2026-08-04',
    grilla: 'Accesorios 40%',
    producto: 'Accesorios Hunter 40% OFF (bodegón / selección)',
    url: 'https://trendseeker.cl/categoria-producto/accesorios/',
    sku: 'ACC-40OFF',
    caracteristicas:
      'Oferta debut 40% OFF en accesorios Hunter · piezales: gorros, calcetines bota, paraguas burbuja · banner bodegón 4000×1770',
    stem: 'accesorios-40off',
    // Abierta: hoy se trabaja en organizador (aunque la grilla externa diga publicado).
    publicado: false,
    promptArchivo: 'index/clientes/trendseeker/prompts/PROMPT-banner-accesorios-hunter-bodegon-gemini.txt',
    copyArchivo: 'index/clientes/trendseeker/copys/COPY-banner-accesorios-hunter-40off.txt',
  },
  {
    n: 2,
    fecha: '2026-08-07',
    grilla: 'Zapatillas',
    producto: 'Zapatilla Travel Trainer Black Hombre',
    url: 'https://trendseeker.cl/producto/zapatilla-travel-trainer-black-hombre/',
    sku: 'MFK1000PTP-BLK',
    caracteristicas:
      'Hunter · impermeable 100% · membrana interna · aislada hasta -5°C · nylon reciclado/neopreno/malla · suela caucho FSC · EVA reciclada · Ortholite · TPU lluvia · detalles reflectantes · logo tricolor',
    stem: 'zapatillas-travel-trainer-black',
  },
  {
    n: 3,
    fecha: '2026-08-10',
    grilla: 'Chelsea Commando gris pálido',
    producto: 'Botas Chelsea Commando Para Mujer Gris Pálido',
    url: 'https://trendseeker.cl/producto/botas-chelsea-commando-para-mujer-gris-palido/',
    sku: 'WFS1018RMA-CAS',
    caracteristicas:
      'Hunter Chelsea Commando mujer gris pálido · 100% waterproof · caucho natural FSC vegano · hechas a mano · forro/plantilla poliéster reciclado · suela Original · fuelles elásticos · perfil +15 mm',
    stem: 'chelsea-commando-gris-palido',
  },
  {
    n: 4,
    fecha: '2026-08-12',
    grilla: 'Sherpa verde',
    producto: 'Botas Estilo Sherpa Con Parte Superior Enrollable Para Mujer Verde Oliva',
    url: 'https://trendseeker.cl/producto/botas-estilo-sherpa-con-parte-superior-enrollable-para-mujer-verde-oliva/',
    sku: 'WFT2052NRE-DOV',
    caracteristicas:
      'Sherpa enrollable mujer verde oliva · vegano · impermeable abajo · caucho + neopreno · forro sherpa · Ortholite · aislante hasta -5°C · uso arriba/abajo',
    stem: 'sherpa-verde-oliva',
  },
  {
    n: 5,
    fecha: '2026-08-14',
    grilla: 'Botas rojo militar',
    producto: 'Botas de Agua Bajas para Mujer Rojo Militar',
    url: 'https://trendseeker.cl/producto/botas-de-agua-bajas-para-mujer-rojo-militar/',
    sku: 'WFS1000RMA-MLR',
    caracteristicas:
      'Hunter Original bajas mujer rojo militar · 100% impermeables · caucho natural mate · 28 piezas a mano · forro poliéster · suela Original · vulcanizado',
    stem: 'botas-rojo-militar',
    promptArchivo: 'index/clientes/trendseeker/prompts/PROMPT-botas-rojas-lluvia.txt',
    copyArchivo: 'index/clientes/trendseeker/copys/COPY-botas-hunter-rojo-militar-video.txt',
  },
  {
    n: 6,
    fecha: '2026-08-17',
    grilla: 'Botas bajas rojas',
    producto: 'Botas de Agua Bajas Play Mujer Rojo',
    url: 'https://trendseeker.cl/producto/botas-de-agua-bajas-play-para-mujer-rojo/',
    sku: 'WFS2020RMA-LRD',
    caracteristicas:
      'Hunter Play bajas · rojo · 100% impermeables · caucho natural · suela plataforma plana · caña corta (tobillo) · estilo urbano/festival',
    stem: 'botas-bajas-play-rojo',
  },
  {
    n: 7,
    fecha: '2026-08-19',
    grilla: 'Botas altas hombre',
    producto: 'Botas de Agua Altas Original Para Hombre Verde Oliva',
    url: 'https://trendseeker.cl/producto/botas-de-agua-altas-original-para-hombre-verde-oliva/',
    sku: 'MFT9000RMA-DOV',
    caracteristicas:
      'Hunter Original altas hombre verde oliva · 100% impermeables · 28 piezas a mano · caucho natural mate · forro poliéster · suela Original · vulcanizado',
    stem: 'botas-altas-hombre-verde-oliva',
  },
  {
    n: 8,
    fecha: '2026-08-21',
    grilla: 'Calcetines',
    producto: 'Hunter Calcetín Bota Rojo',
    url: 'https://trendseeker.cl/producto/hunter-calcetin-bota-rojo/',
    sku: 'UAS3000AAA-MLR',
    caracteristicas:
      'Calcetín bota Hunter rojo · vellón 100% poliéster · vuelta que se dobla · diseñado para botas Original altas · logo PVC · abriga y mejora ajuste',
    stem: 'calcetines-bota-rojo',
  },
  {
    n: 9,
    fecha: '2026-08-24',
    grilla: 'Paraguas',
    producto: 'Paraguas Burbuja Moustache Azul',
    url: 'https://trendseeker.cl/producto/paraguas-burbuja-moustache-azul/',
    sku: 'UAU1004UPM-PKB',
    caracteristicas:
      'Paraguas burbuja transparente · borde azul moustache Hunter · apertura manual · mango engomado · varillas resistentes al viento',
    stem: 'paraguas-burbuja-azul',
  },
  {
    n: 10,
    fecha: '2026-08-26',
    grilla: 'Botas jardinera',
    producto: 'Botín corto Gardener / Bota Corta de Jardinera · Mujer · Verde oliva',
    url: 'https://trendseeker.cl/producto/bota-corta-garden/',
    sku: 'WFS2018RMA-DOC',
    caracteristicas:
      'Gardener corto mujer verde oliva · trabajo outdoor · zona cavar · talón relieve · flexibilidad tobillo · forro algodón · invierno huerto/jardín',
    stem: 'botas-jardinera-gardener',
  },
  {
    n: 11,
    fecha: '2026-08-28',
    grilla: 'Botas niños verdes',
    producto: 'Botas de Agua Original Para Niños Verde',
    url: 'https://trendseeker.cl/producto/botas-de-agua-original-para-ninos-verde/',
    sku: 'JFT6000RMA-HGR',
    caracteristicas:
      'Hunter Original kids verde · 5–11 años (31–37) · 100% impermeables · caucho natural · forro poliéster · suela Original · parches reflectantes',
    stem: 'botas-ninos-verdes',
  },
  {
    n: 12,
    fecha: '2026-08-31',
    grilla: 'Gorros',
    producto: 'Gorro con Pon Pon Moustache Original Negro',
    url: 'https://trendseeker.cl/producto/gorro-con-pon-pon-moustache-original-negro/',
    sku: 'UAH3031WXA-GZB',
    caracteristicas:
      'Gorro Moustache · pompón · tejido suave · talla única · otoño/invierno · etiqueta Hunter · combina con botas y mochila',
    stem: 'gorros-ponpon-negro',
  },
];

const HORAS = {
  madre: ['09:00', '13:00'],
  prompt: ['09:00', '10:30'],
  copy: ['10:30', '12:00'],
  programar: ['12:00', '13:00'],
};

function pad(n) {
  return String(n).padStart(2, '0');
}

function nextNumero(tareas) {
  let max = 0;
  for (const t of tareas) {
    if (t.clienteId !== CLIENTE) continue;
    const n = parseInt(String(t.numeroHistorico || '0'), 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return max + 1;
}

function madreId(n) {
  return `tarea-ts-ago26-c${pad(n)}`;
}

function upsert(data, tarea, { forzarEstado } = {}) {
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
  const i = data.tareas.findIndex((t) => t.id === tarea.id);
  if (i >= 0) {
    const prev = data.tareas[i];
    const completada = forzarEstado
      ? !!tarea.completada
      : prev.completada === true || tarea.completada === true;
    data.tareas[i] = {
      ...prev,
      ...tarea,
      numeroHistorico: prev.numeroHistorico || tarea.numeroHistorico,
      completada,
      pendiente: false,
      sesionAgente: prev.sesionAgente,
    };
    if (forzarEstado && completada === false) {
      delete data.tareas[i].estadoFijado;
    }
    return 'upd';
  }
  data.tareas.push(tarea);
  return 'add';
}

function buildPieza(c, numStart) {
  const etiqueta = `${c.n}/${TOTAL}`;
  const mid = madreId(c.n);
  const done = !!c.publicado;
  let num = numStart;
  const piezas = [];

  const promptStem = `index/clientes/trendseeker/prompts/PROMPT-ago-c${pad(c.n)}-${c.stem}`;
  const copyStem = `index/clientes/trendseeker/copys/COPY-ago-c${pad(c.n)}-${c.stem}`;
  const promptArchivos = c.promptArchivo
    ? { A: c.promptArchivo }
    : { A: `${promptStem}-A.txt`, B: `${promptStem}-B.txt`, C: `${promptStem}-C.txt` };
  const copyArchivos = c.copyArchivo
    ? { A: c.copyArchivo }
    : { A: `${copyStem}-A.txt`, B: `${copyStem}-B.txt`, C: `${copyStem}-C.txt` };

  piezas.push({
    id: mid,
    titulo: `[TS] Ago C${etiqueta} · ${c.grilla}`,
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: c.fecha,
    horaInicio: HORAS.madre[0],
    horaFin: HORAS.madre[1],
    notas:
      `Tarea madre Ago C${etiqueta} (grilla agosto 2026 · serie ${TOTAL} pubs). ` +
      `Nombre en grilla: «${c.grilla}». ` +
      `Producto: ${c.producto} · SKU ${c.sku}. ` +
      `Link: ${c.url} · Características: ${c.caracteristicas}. ` +
      `Subtareas: 1) Prompt Gemini video · 2) Copys del video · 3) Programar. ` +
      `Con las 3 hechas → finalizar esta madre.` +
      (done ? ' Estado grilla: PUBLICADO (madre + subtareas cerradas).' : ' Estado: abierta en organizador.'),
    prioridad: 'alta',
    completada: done,
    pendiente: false,
    numeroHistorico: pad(num++),
    tipoEntregable: 'ecosistema',
    parentId: null,
    productoUrl: c.url,
    sku: c.sku,
    contenidoSerie: c.n,
    contenidoTotal: TOTAL,
    contenidoMes: MES,
    grillaLabel: c.grilla,
    agendaFijada: true,
    color: 'lavanda',
  });

  piezas.push({
    id: `${mid}-prompt`,
    titulo: `[TS] Ago C${etiqueta} — Prompt Gemini (video)`,
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: c.fecha,
    horaInicio: HORAS.prompt[0],
    horaFin: HORAS.prompt[1],
    notas:
      `Prompt Gemini VIDEO · tres TXT independientes (A/B/C) salvo banner/pieza especial. ` +
      `Producto: ${c.producto}. Link: ${c.url}. ` +
      `Primero fotos de producto reales. Edita y copia cada versión en la tarea.`,
    prioridad: 'alta',
    completada: done,
    pendiente: false,
    numeroHistorico: pad(num++),
    tipoEntregable: 'prompt-gemini-video',
    entregableArchivo: promptArchivos.A,
    entregableArchivosPrompt: promptArchivos,
    parentId: mid,
    productoUrl: c.url,
    sku: c.sku,
    agendaFijada: true,
  });

  piezas.push({
    id: `${mid}-copy`,
    titulo: `[TS] Ago C${etiqueta} — Copys video`,
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: c.fecha,
    horaInicio: HORAS.copy[0],
    horaFin: HORAS.copy[1],
    notas:
      `Copys video · tres TXT (A/B/C). Características: ${c.caracteristicas}. ` +
      `CTA con link ${c.url}. Edita/copia en la tarea.`,
    prioridad: 'alta',
    completada: done,
    pendiente: false,
    numeroHistorico: pad(num++),
    tipoEntregable: 'copys-txt',
    entregableArchivo: copyArchivos.A,
    entregableArchivosCopy: copyArchivos,
    parentId: mid,
    productoUrl: c.url,
    sku: c.sku,
    agendaFijada: true,
  });

  piezas.push({
    id: `${mid}-programar`,
    titulo: `[TS] Ago C${etiqueta} — Programar`,
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: c.fecha,
    horaInicio: HORAS.programar[0],
    horaFin: HORAS.programar[1],
    notas:
      `Dejar el contenido programado/listo para publicar (feed/Reels/historias según plan TS). ` +
      `Fecha grilla: ${c.fecha} · «${c.grilla}». ` +
      `Verificar copy + video + link producto. Al terminar → marcar hecha y finalizar madre Ago C${etiqueta}.`,
    prioridad: 'alta',
    completada: done,
    pendiente: false,
    numeroHistorico: pad(num++),
    tipoEntregable: 'programar',
    parentId: mid,
    productoUrl: c.url,
    sku: c.sku,
    agendaFijada: true,
  });

  return { piezas, nextNum: num };
}

let touched = 0;
for (const file of FILES) {
  if (!fs.existsSync(file)) {
    console.warn('Skip (no existe):', path.basename(file));
    continue;
  }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];

  let num = nextNumero(data.tareas);
  const ops = [];
  for (const c of CONTENIDOS) {
    // Si la madre ya existe, reutilizar su bloque de números
    const existing = data.tareas.find((t) => t.id === madreId(c.n));
    const start = existing
      ? parseInt(String(existing.numeroHistorico || num), 10) || num
      : num;
    const { piezas, nextNum } = buildPieza(c, start);
    for (const p of piezas) {
      // Si es upsert de hijos ya existentes, conservar su numeroHistorico
      const prev = data.tareas.find((t) => t.id === p.id);
      if (prev && prev.numeroHistorico) p.numeroHistorico = prev.numeroHistorico;
      // C1 (hoy) y piezas renombradas (C3/C5) fuerzan título/producto actualizado
      ops.push(upsert(data, p, { forzarEstado: c.n === 1 || c.n === 3 || c.n === 5 }));
    }
    if (!existing) num = nextNum;
    else num = Math.max(num, nextNum);
  }

  data.respaldoActualizado = new Date().toISOString().slice(0, 10);
  if (!data.meta || typeof data.meta !== 'object') data.meta = {};
  data.meta.actualizado = new Date().toISOString();
  data.meta.tsGrillaAgosto2026 = true;

  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  touched += 1;
  const adds = ops.filter((o) => o === 'add').length;
  const upds = ops.filter((o) => o === 'upd').length;
  console.log(`${path.basename(file)} · add ${adds} · upd ${upds}`);
}

console.log(`\nListo: grilla TS agosto 2026 · ${CONTENIDOS.length} madres × 3 subtareas (${touched} archivo/s).`);
console.log('C1 Accesorios 40% = abierta (hoy). Resto = CREADOS.');
console.log('Ver: http://127.0.0.1:8000/index.html?disco=1&fecha=2026-08-04&vista=dia');
console.log('Landing: http://127.0.0.1:8000/index/clientes/trendseeker/');
