#!/usr/bin/env node
/**
 * Trendseeker — Grilla septiembre 2026 (10 contenidos).
 * Cada pieza = madre + subtareas (collab vs propio).
 *
 *   node scripts/add-ts-contenidos-septiembre-2026.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILES = [
  path.join(ROOT, 'data', 'organizacion-live.json'),
  path.join(ROOT, 'data', 'organizacion-respaldo-2026-07-31.json'),
  path.join(ROOT, 'data', 'organizacion-respaldo-2026-08-05.json'),
];

const CLIENTE = 'cli-trendseeker';
const ROL = 'rol-cm';
const MES = '2026-09';
const TOTAL = 10;

const HORAS = {
  madre: ['09:00', '09:30'],
  prompt: ['09:30', '11:00'],
  copy: ['11:00', '12:00'],
  programar: ['12:00', '12:30'],
};

/** @type {Array<{
 *   n:number,fecha:string,grilla:string,producto:string,url:string,sku:string,
 *   caracteristicas:string,stem:string,origen:'collab'|'propio'|'tbd',
 *   collab?:string,publicado?:boolean,copyArchivo?:string,piezaArchivo?:string
 * }>} */
const CONTENIDOS = [
  {
    n: 1,
    fecha: '2026-09-02',
    grilla: 'emergerdelpescador',
    producto: 'Contenido collab · @emergerdelpescador',
    url: 'https://trendseeker.cl/',
    sku: 'COLLAB-EMERGER',
    caracteristicas: 'UGC / collab Instagram @emergerdelpescador · coordinar material + copy + programar',
    stem: 'emergerdelpescador',
    origen: 'collab',
    collab: '@emergerdelpescador',
  },
  {
    n: 2,
    fecha: '2026-09-04',
    grilla: 'Fernando Mosso',
    producto: 'Contenido Fernando Mosso (creado por nosotros)',
    url: 'https://trendseeker.cl/',
    sku: 'PROPIO-MOSSO',
    caracteristicas: 'Pieza propia · Fernando Mosso · prompt/pieza + copys + programar',
    stem: 'fernando-mosso',
    origen: 'propio',
  },
  {
    n: 3,
    fecha: '2026-09-08',
    grilla: 'rivertrout',
    producto: 'Contenido collab · @rivertrout (pieza 1)',
    url: 'https://trendseeker.cl/',
    sku: 'COLLAB-RIVERTROUT-1',
    caracteristicas: 'UGC / collab Instagram @rivertrout · 1/3 en grilla septiembre',
    stem: 'rivertrout-1',
    origen: 'collab',
    collab: '@rivertrout',
  },
  {
    n: 4,
    fecha: '2026-09-10',
    grilla: 'rivertrout',
    producto: 'Contenido collab · @rivertrout (pieza 2)',
    url: 'https://trendseeker.cl/',
    sku: 'COLLAB-RIVERTROUT-2',
    caracteristicas: 'UGC / collab Instagram @rivertrout · 2/3 en grilla septiembre',
    stem: 'rivertrout-2',
    origen: 'collab',
    collab: '@rivertrout',
  },
  {
    n: 5,
    fecha: '2026-09-12',
    grilla: 'Chaqueta Neptune',
    producto: 'Chaqueta Neptune (creado por nosotros)',
    url: 'https://trendseeker.cl/',
    sku: 'PROPIO-NEPTUNE',
    caracteristicas: 'Pieza propia · Chaqueta Neptune · confirmar URL producto WP + prompt/pieza + copys',
    stem: 'chaqueta-neptune',
    origen: 'propio',
  },
  {
    n: 6,
    fecha: '2026-09-15',
    grilla: 'rivertrout',
    producto: 'Contenido collab · @rivertrout (pieza 3)',
    url: 'https://trendseeker.cl/',
    sku: 'COLLAB-RIVERTROUT-3',
    caracteristicas: 'UGC / collab Instagram @rivertrout · 3/3 en grilla septiembre',
    stem: 'rivertrout-3',
    origen: 'collab',
    collab: '@rivertrout',
  },
  {
    n: 7,
    fecha: '2026-09-18',
    grilla: 'Primavera · Cambia de aire',
    producto: 'Banner/feed primavera multi-marca «Cambia de aire»',
    url: 'https://trendseeker.cl/',
    sku: 'PROPIO-PRIMAVERA',
    caracteristicas:
      'Pieza propia 1080×1920 · headline CAMBIA DE AIRE · Hunter + Grundéns + Blowfish + The Indian Face + bkr · campaña estación (sin %)',
    stem: 'primavera-cambia-de-aire',
    origen: 'propio',
    copyArchivo: 'index/clientes/trendseeker/copys/COPY-sep-c07-primavera-cambia-de-aire.txt',
    piezaArchivo: 'index/clientes/trendseeker/banners/banner-primavera-cambia-de-aire-2026-09.jpg',
  },
  {
    n: 8,
    fecha: '2026-09-22',
    grilla: 'Por definir',
    producto: 'Sep C8 — por definir con usuaria',
    url: 'https://trendseeker.cl/',
    sku: 'TBD-C8',
    caracteristicas: 'Placeholder grilla septiembre · completar producto / collab / fecha',
    stem: 'tbd-c8',
    origen: 'tbd',
  },
  {
    n: 9,
    fecha: '2026-09-24',
    grilla: 'Por definir',
    producto: 'Sep C9 — por definir con usuaria',
    url: 'https://trendseeker.cl/',
    sku: 'TBD-C9',
    caracteristicas: 'Placeholder grilla septiembre · completar producto / collab / fecha',
    stem: 'tbd-c9',
    origen: 'tbd',
  },
  {
    n: 10,
    fecha: '2026-09-26',
    grilla: 'Por definir',
    producto: 'Sep C10 — por definir con usuaria',
    url: 'https://trendseeker.cl/',
    sku: 'TBD-C10',
    caracteristicas: 'Placeholder grilla septiembre · completar producto / collab / fecha',
    stem: 'tbd-c10',
    origen: 'tbd',
  },
];

function pad(n) {
  return String(n).padStart(2, '0');
}

function nextNumero(tareas) {
  let max = 0;
  for (const t of tareas || []) {
    const n = parseInt(String(t.numeroHistorico || ''), 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return max + 1;
}

function madreId(n) {
  return `tarea-ts-sep26-c${pad(n)}`;
}

function upsert(data, tarea) {
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
  const i = data.tareas.findIndex((t) => t.id === tarea.id);
  if (i >= 0) {
    const prev = data.tareas[i];
    data.tareas[i] = {
      ...prev,
      ...tarea,
      numeroHistorico: prev.numeroHistorico || tarea.numeroHistorico,
      completada: prev.completada === true || tarea.completada === true,
      pendiente: false,
      sesionAgente: prev.sesionAgente,
    };
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

  const copyArchivo =
    c.copyArchivo || `index/clientes/trendseeker/copys/COPY-sep-c${pad(c.n)}-${c.stem}.txt`;

  let subtareasNota;
  if (c.origen === 'collab') {
    subtareasNota = `Subtareas: 1) Revisar material ${c.collab || 'collab'} · 2) Copys · 3) Programar.`;
  } else if (c.origen === 'tbd') {
    subtareasNota = 'Placeholder: definir pieza con usuaria antes de producir.';
  } else {
    subtareasNota = 'Subtareas: 1) Pieza / prompt · 2) Copys · 3) Programar.';
  }

  piezas.push({
    id: mid,
    titulo: `[TS] Sep C${etiqueta} · ${c.grilla}`,
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: c.fecha,
    horaInicio: HORAS.madre[0],
    horaFin: HORAS.madre[1],
    notas:
      `Tarea madre Sep C${etiqueta} (grilla septiembre 2026 · serie ${TOTAL} pubs). ` +
      `Origen: ${c.origen}. Nombre: «${c.grilla}». ` +
      `Producto: ${c.producto} · SKU ${c.sku}. Link: ${c.url}. ` +
      `${c.caracteristicas}. ${subtareasNota}` +
      (c.piezaArchivo ? ` Pieza: ${c.piezaArchivo}.` : '') +
      (c.copyArchivo ? ` Copy: ${c.copyArchivo}.` : ''),
    prioridad: c.origen === 'tbd' ? 'media' : 'alta',
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

  const sub1Titulo =
    c.origen === 'collab'
      ? `[TS] Sep C${etiqueta} — Revisar material collab`
      : c.origen === 'tbd'
        ? `[TS] Sep C${etiqueta} — Definir pieza`
        : `[TS] Sep C${etiqueta} — Pieza / prompt`;

  piezas.push({
    id: `${mid}-pieza`,
    titulo: sub1Titulo,
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: c.fecha,
    horaInicio: HORAS.prompt[0],
    horaFin: HORAS.prompt[1],
    notas:
      c.origen === 'collab'
        ? `Recibir/revisar material de ${c.collab}. Verificar marca visible, calidad y derechos de uso.`
        : c.origen === 'tbd'
          ? 'Completar qué producto/collab va en este slot de la grilla.'
          : `Producir o cerrar la pieza propia. ${c.piezaArchivo ? `Archivo: ${c.piezaArchivo}` : 'Pendiente archivo/prompt.'}`,
    prioridad: 'alta',
    completada: done || (c.n === 7 && !!c.piezaArchivo),
    pendiente: false,
    numeroHistorico: pad(num++),
    tipoEntregable: c.origen === 'collab' ? 'revision-collab' : 'pieza-propia',
    entregableArchivo: c.piezaArchivo || undefined,
    parentId: mid,
    productoUrl: c.url,
    sku: c.sku,
    agendaFijada: true,
  });

  piezas.push({
    id: `${mid}-copy`,
    titulo: `[TS] Sep C${etiqueta} — Copys`,
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: c.fecha,
    horaInicio: HORAS.copy[0],
    horaFin: HORAS.copy[1],
    notas:
      `Copys feed/Reels/Stories. ${c.caracteristicas}. CTA con link ${c.url}.` +
      (c.copyArchivo ? ` Archivo listo: ${c.copyArchivo}` : ` Crear: ${copyArchivo}`),
    prioridad: 'alta',
    completada: done || (c.n === 7 && !!c.copyArchivo),
    pendiente: false,
    numeroHistorico: pad(num++),
    tipoEntregable: 'copys-txt',
    entregableArchivo: copyArchivo,
    parentId: mid,
    productoUrl: c.url,
    sku: c.sku,
    agendaFijada: true,
  });

  piezas.push({
    id: `${mid}-programar`,
    titulo: `[TS] Sep C${etiqueta} — Programar`,
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: c.fecha,
    horaInicio: HORAS.programar[0],
    horaFin: HORAS.programar[1],
    notas:
      `Programar/publicar (feed/Reels/historias). Fecha grilla: ${c.fecha} · «${c.grilla}». ` +
      `Verificar pieza + copy + link. Al terminar → finalizar madre Sep C${etiqueta}.`,
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

// Si no hay live, clonarlo desde el respaldo canónico
const live = path.join(ROOT, 'data', 'organizacion-live.json');
const canon = path.join(ROOT, 'data', 'organizacion-respaldo-2026-07-31.json');
if (!fs.existsSync(live) && fs.existsSync(canon)) {
  fs.copyFileSync(canon, live);
  console.log('Creado organizacion-live.json desde respaldo canónico');
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
    const existing = data.tareas.find((t) => t.id === madreId(c.n));
    const start = existing
      ? parseInt(String(existing.numeroHistorico || num), 10) || num
      : num;
    const { piezas, nextNum } = buildPieza(c, start);
    for (const p of piezas) {
      const prev = data.tareas.find((t) => t.id === p.id);
      if (prev && prev.numeroHistorico) p.numeroHistorico = prev.numeroHistorico;
      ops.push(upsert(data, p));
    }
    if (!existing) num = nextNum;
    else num = Math.max(num, nextNum);
  }

  data.respaldoActualizado = new Date().toISOString().slice(0, 10);
  if (!data.meta || typeof data.meta !== 'object') data.meta = {};
  data.meta.actualizado = new Date().toISOString();
  data.meta.tsGrillaSeptiembre2026 = true;

  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  touched += 1;
  const adds = ops.filter((o) => o === 'add').length;
  const upds = ops.filter((o) => o === 'upd').length;
  console.log(`${path.basename(file)} · add ${adds} · upd ${upds}`);
}

console.log(`\nListo: grilla TS septiembre 2026 · ${CONTENIDOS.length} madres × 3 subtareas (${touched} archivo/s).`);
console.log('C7 Primavera = pieza + copy listos. C8–C10 = por definir.');
console.log('Doc: index/clientes/trendseeker/GRILLA-SEPTIEMBRE-2026.md');
console.log('Copy C7: index/clientes/trendseeker/copys/COPY-sep-c07-primavera-cambia-de-aire.txt');
