#!/usr/bin/env node
/**
 * Trendseeker — Grilla agosto 2026 (vigente 12 ago).
 *   node scripts/add-ts-contenidos-agosto-2026.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LIVE = path.join(ROOT, 'data', 'organizacion-live.json');
const CLIENTE = 'cli-trendseeker';
const ROL = 'rol-cm';
const MES = '2026-08';
const TOTAL = 12;

/** publicado = cerrar · programado = abierta con nota · crear = abierta */
const CONTENIDOS = [
  {
    n: 1,
    fecha: '2026-08-07',
    grilla: 'Zapatillas 2x1',
    producto: 'Zapatillas Hunter 2x1',
    url: 'https://trendseeker.cl/categoria-producto/zapatillas/',
    sku: 'ZAP-2X1',
    caracteristicas: 'Promo 2x1 zapatillas Hunter · publicado 7 ago',
    stem: 'zapatillas-2x1',
    estado: 'publicado',
  },
  {
    n: 2,
    fecha: '2026-08-09',
    grilla: 'Accesorios 40% OFF',
    producto: 'Accesorios Hunter 40% OFF',
    url: 'https://trendseeker.cl/categoria-producto/accesorios/',
    sku: 'ACC-40OFF',
    caracteristicas: '40% OFF accesorios Hunter · gorros, calcetines, paraguas · publicado 9 ago',
    stem: 'accesorios-40off',
    estado: 'publicado',
    promptArchivo: 'index/clientes/trendseeker/prompts/PROMPT-banner-accesorios-hunter-bodegon-gemini.txt',
    copyArchivo: 'index/clientes/trendseeker/copys/COPY-banner-accesorios-hunter-40off.txt',
  },
  {
    n: 3,
    fecha: '2026-08-11',
    grilla: 'Botas 40% OFF',
    producto: 'Botas Hunter 40% OFF',
    url: 'https://trendseeker.cl/categoria-producto/botas/',
    sku: 'BOTAS-40OFF',
    caracteristicas: '40% OFF botas Hunter · publicado 11 ago',
    stem: 'botas-40off',
    estado: 'publicado',
  },
  {
    n: 4,
    fecha: '2026-08-11',
    grilla: 'Grundéns colaboración',
    producto: 'Grundéns · colaboración',
    url: 'https://trendseeker.cl/marca/grundens/',
    sku: 'GRUNDENS-COLAB',
    caracteristicas: 'Colaboración Grundéns · publicado 11 ago',
    stem: 'grundens-colaboracion',
    estado: 'publicado',
  },
  {
    n: 5,
    fecha: '2026-08-12',
    grilla: 'Zapatillas 2x1 hasta el domingo',
    producto: 'Zapatillas Hunter 2x1 (hasta domingo 16 ago)',
    url: 'https://trendseeker.cl/categoria-producto/zapatillas/',
    sku: 'ZAP-2X1',
    caracteristicas: 'Recordatorio 2x1 zapatillas Hunter vigente hasta el domingo 16 ago',
    stem: 'zapatillas-2x1-domingo',
    estado: 'crear',
  },
  {
    n: 6,
    fecha: '2026-08-14',
    grilla: 'Zapatillas 2x1 hasta el domingo',
    producto: 'Zapatillas Hunter 2x1 (hasta domingo 16 ago)',
    url: 'https://trendseeker.cl/categoria-producto/zapatillas/',
    sku: 'ZAP-2X1',
    caracteristicas: 'Cierre de promo 2x1 zapatillas Hunter · hasta domingo 16 ago',
    stem: 'zapatillas-2x1-cierre',
    estado: 'crear',
  },
  {
    n: 7,
    fecha: '2026-08-17',
    grilla: 'Botas blancas',
    producto: 'Botas Play altas con forro de shearling white mujer',
    url: 'https://trendseeker.cl/producto/botas-play-altas-con-forro-de-shearling-white-para-mujer/',
    sku: 'WFT2235RMA-WHW',
    caracteristicas: 'Hunter Play altas white/shearling · vegano · impermeable · forro borrego vegano · aislante -5°C',
    stem: 'botas-blancas-play-shearling',
    estado: 'programado',
    promptArchivo: 'index/clientes/trendseeker/prompts/PROMPT-c11-play-altas-shearling-white-mujer-A.txt',
    copyArchivo: 'index/clientes/trendseeker/copys/COPY-c11-play-altas-shearling-white-mujer-A.txt',
  },
  {
    n: 8,
    fecha: '2026-08-19',
    grilla: 'Chelsea Commando gris pálido',
    producto: 'Botas Chelsea Commando Para Mujer Gris Pálido',
    url: 'https://trendseeker.cl/producto/botas-chelsea-commando-para-mujer-gris-palido/',
    sku: 'WFS1018RMA-CAS',
    caracteristicas:
      'Hunter Chelsea Commando mujer gris pálido · 100% waterproof · caucho natural FSC vegano · suela Original · fuelles elásticos',
    stem: 'chelsea-commando-gris-palido',
    estado: 'crear',
  },
  {
    n: 9,
    fecha: '2026-08-21',
    grilla: 'Chaquetas 15%',
    producto: 'Chaquetas Hunter 15% OFF',
    url: 'https://trendseeker.cl/categoria-producto/chaquetas/',
    sku: 'CHAQ-15OFF',
    caracteristicas: '15% OFF chaquetas Hunter',
    stem: 'chaquetas-15off',
    estado: 'crear',
  },
  {
    n: 10,
    fecha: '2026-08-24',
    grilla: 'Calcetines 40%',
    producto: 'Hunter Calcetín Bota Rojo · 40% OFF',
    url: 'https://trendseeker.cl/producto/hunter-calcetin-bota-rojo/',
    sku: 'UAS3000AAA-MLR',
    caracteristicas: 'Calcetín bota Hunter rojo · 40% OFF · vellón poliéster · para botas Original altas',
    stem: 'calcetines-40off',
    estado: 'crear',
  },
  {
    n: 11,
    fecha: '2026-08-26',
    grilla: 'Paraguas 40%',
    producto: 'Paraguas Burbuja Moustache Azul · 40% OFF',
    url: 'https://trendseeker.cl/producto/paraguas-burbuja-moustache-azul/',
    sku: 'UAU1004UPM-PKB',
    caracteristicas: 'Paraguas burbuja · borde azul moustache · 40% OFF',
    stem: 'paraguas-40off',
    estado: 'crear',
  },
  {
    n: 12,
    fecha: '2026-08-28',
    grilla: 'Gorros 40%',
    producto: 'Gorro con Pon Pon Moustache Original Negro · 40% OFF',
    url: 'https://trendseeker.cl/producto/gorro-con-pon-pon-moustache-original-negro/',
    sku: 'UAH3031WXA-GZB',
    caracteristicas: 'Gorro Moustache pompón negro · 40% OFF · talla única',
    stem: 'gorros-40off',
    estado: 'crear',
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

function upsert(data, tarea, forzarEstado) {
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
  const i = data.tareas.findIndex((t) => t.id === tarea.id);
  if (i >= 0) {
    const prev = data.tareas[i];
    const completada = forzarEstado ? !!tarea.completada : prev.completada === true || tarea.completada === true;
    data.tareas[i] = {
      ...prev,
      ...tarea,
      numeroHistorico: prev.numeroHistorico || tarea.numeroHistorico,
      completada,
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
  const done = c.estado === 'publicado';
  const notaEstado =
    c.estado === 'publicado'
      ? ' Estado grilla: PUBLICADO.'
      : c.estado === 'programado'
        ? ' Estado grilla: PROGRAMADO (ya en Meta/IG).'
        : ' Estado grilla: FALTA CREAR.';
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
      `Tarea madre Ago C${etiqueta} (grilla agosto 2026). ` +
      `Producto: ${c.producto} · SKU ${c.sku}. Link: ${c.url}. ` +
      `Características: ${c.caracteristicas}. ` +
      `Subtareas: Prompt Gemini video · Copys · Programar.` +
      notaEstado,
    prioridad: c.estado === 'crear' ? 'alta' : 'media',
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
    estadoGrilla: c.estado,
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
    notas: `Prompt Gemini VIDEO · ${c.producto}. Link: ${c.url}.${notaEstado}`,
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
    notas: `Copys video A/B/C · ${c.caracteristicas}. CTA ${c.url}.${notaEstado}`,
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
    notas: `Programar feed/Reels/historias · ${c.fecha} · «${c.grilla}».${notaEstado}`,
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

if (!fs.existsSync(LIVE)) {
  console.error('No existe data/organizacion-live.json');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
data.tareas = Array.isArray(data.tareas) ? data.tareas : [];

let num = nextNumero(data.tareas);
const ops = [];
for (const c of CONTENIDOS) {
  const existing = data.tareas.find((t) => t.id === madreId(c.n));
  const start = existing ? parseInt(String(existing.numeroHistorico || num), 10) || num : num;
  const { piezas, nextNum } = buildPieza(c, start);
  for (const p of piezas) {
    const prev = data.tareas.find((t) => t.id === p.id);
    if (prev && prev.numeroHistorico) p.numeroHistorico = prev.numeroHistorico;
    ops.push(upsert(data, p, true));
  }
  if (!existing) num = nextNum;
  else num = Math.max(num, nextNum);
}

if (!data.meta || typeof data.meta !== 'object') data.meta = {};
data.meta.actualizado = new Date().toISOString();
data.meta.tsGrillaAgosto2026 = true;
data.respaldoActualizado = new Date().toISOString().slice(0, 10);

fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
const adds = ops.filter((o) => o === 'add').length;
const upds = ops.filter((o) => o === 'upd').length;
console.log(`Live · add ${adds} · upd ${upds}`);
console.log('C1–C4 publicados · C7 programado · C5/C6/C8–C12 falta crear');
console.log('Ver: http://127.0.0.1:8000/index.html?disco=1&fecha=2026-08-12&vista=dia');
