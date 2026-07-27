#!/usr/bin/env node
/**
 * 27 jul 2026 — Cargar respaldo reciente + tareas del día.
 *
 * Prioridad de base:
 *   1) data/organizacion-respaldo-2026-07-26.json  (o Descargas del usuario)
 *   2) data/organizacion-respaldo-2026-07-24.json
 *   3) data/organizacion-live.json
 *
 * En la PC (josef):
 *   copy %USERPROFILE%\Downloads\organizacion-respaldo-2026-07-26.json data\
 *   node scripts/cargar-respaldo-y-tareas-27-jul.js
 *
 *   node scripts/cargar-respaldo-y-tareas-27-jul.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const LIVE = path.join(DATA, 'organizacion-live.json');
const OUT_RESPALDO = path.join(DATA, 'organizacion-respaldo-2026-07-27.json');
const HOY = '2026-07-27';
const MIE = '2026-07-29';

const PRODUCTOS_TS = [
  {
    sku: 'WFT2052NRE-DOV',
    nombre: 'Botas Estilo Sherpa Con Parte Superior Enrollable Para Mujer Verde Oliva',
    url: 'https://trendseeker.cl/producto/botas-estilo-sherpa-con-parte-superior-enrollable-para-mujer-verde-oliva/',
    caracteristicas:
      'Hunter Roll Top Sherpa · verde oliva (DOV) · 100% impermeable · caucho natural + neopreno · forro sherpa · Ortholite · aislante hasta -5°C · vegano · caña enrollable',
  },
  {
    sku: 'WFT2235RMA-WHW',
    nombre: 'Botas Play Altas Aislante Con Forro - Shearling White - Mujer',
    url: 'https://trendseeker.cl/producto/botas-play-altas-con-forro-de-shearling-white-para-mujer/',
    caracteristicas:
      'Hunter Play altas · shearling white · vegano · impermeable · hechas a mano · forro borrego vegano · aislante hasta -5°C · plantilla térmica · suela plana · lengüeta de entrada',
  },
  {
    sku: 'WFF1088RMA-DOC',
    nombre: 'Zueco de Jardín para Mujer Verde Oliva',
    url: 'https://trendseeker.cl/producto/zueco-de-jardin-para-mujer-verde-oliva/',
    caracteristicas:
      'Hunter Gardener Clog · verde oliva · 100% impermeable · caucho natural mate · forro neopreno · poliéster reciclado · suela con logo Hunter · sin cierres · hechas a mano',
  },
];

function leerJson(ruta) {
  try {
    const obj = JSON.parse(fs.readFileSync(ruta, 'utf8'));
    if (!obj || !Array.isArray(obj.clientes) || !Array.isArray(obj.tareas)) return null;
    return obj;
  } catch {
    return null;
  }
}

function candidatosBase() {
  const downloads = path.join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads');
  const names = [
    'organizacion-respaldo-2026-07-26.json',
    'organizacion-respaldo-2026-07-24.json',
    'organizacion-respaldo-2026-07-21.json',
  ];
  const dirs = [DATA, downloads].filter((d) => d && fs.existsSync(d));
  const found = [];
  for (const dir of dirs) {
    for (const name of names) {
      const abs = path.join(dir, name);
      if (!fs.existsSync(abs)) continue;
      const obj = leerJson(abs);
      if (!obj) continue;
      found.push({ path: abs, obj, name });
    }
  }
  if (fs.existsSync(LIVE)) {
    const obj = leerJson(LIVE);
    if (obj) found.push({ path: LIVE, obj, name: 'organizacion-live.json' });
  }
  // Preferir 26 > 24 > 21 > live
  const rank = (n) => {
    if (/2026-07-26/.test(n)) return 0;
    if (/2026-07-24/.test(n)) return 1;
    if (/2026-07-21/.test(n)) return 2;
    return 3;
  };
  found.sort((a, b) => rank(a.name) - rank(b.name));
  return found;
}

function nextNumero(tareas, clienteId) {
  let max = 0;
  for (const t of tareas) {
    if (t.clienteId !== clienteId) continue;
    const n = parseInt(String(t.numeroHistorico || '0'), 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return String(max + 1).padStart(2, '0');
}

function upsert(tareas, tarea) {
  const idx = tareas.findIndex((t) => t.id === tarea.id);
  if (idx >= 0) {
    const prev = tareas[idx];
    tareas[idx] = {
      ...prev,
      ...tarea,
      numeroHistorico: prev.numeroHistorico || tarea.numeroHistorico,
    };
    return 'upd';
  }
  tareas.push(tarea);
  return 'new';
}

function patchTsMadre(tareas, madreId, producto, fecha, horas) {
  const madre = tareas.find((t) => t.id === madreId);
  if (!madre) return false;
  const nSerie = madre.contenidoSerie || madreId.match(/(\d+)-de-12/)?.[1] || '?';
  madre.titulo = `[TS] Contenido ${nSerie}/12 · ${producto.nombre}`;
  madre.fecha = fecha;
  madre.horaInicio = horas.madre[0];
  madre.horaFin = horas.madre[1];
  madre.productoUrl = producto.url;
  madre.sku = producto.sku;
  madre.completada = false;
  madre.pendiente = false;
  madre.notas =
    `Tarea madre Contenido ${nSerie}/12 (serie mensual). Producto: ${producto.nombre} · SKU ${producto.sku}. ` +
    `Link: ${producto.url} · Características: ${producto.caracteristicas}. ` +
    `Subtareas: 1) Prompt Gemini video · 2) Copys del video · 3) Programar. Con las 3 hechas → finalizar esta madre.`;

  const kids = {
    prompt: {
      titulo: `[TS] C${nSerie}/12 — Prompt Gemini (video)`,
      horas: horas.prompt,
      tipo: 'prompt-gemini-video',
    },
    copy: {
      titulo: `[TS] C${nSerie}/12 — Copys video`,
      horas: horas.copy,
      tipo: 'copy-video',
    },
    programar: {
      titulo: `[TS] C${nSerie}/12 — Programar`,
      horas: horas.programar,
      tipo: 'programar',
    },
  };

  for (const [suf, meta] of Object.entries(kids)) {
    const id = `${madreId}-${suf}`;
    const child = tareas.find((t) => t.id === id);
    if (!child) continue;
    child.titulo = meta.titulo;
    child.fecha = fecha;
    child.horaInicio = meta.horas[0];
    child.horaFin = meta.horas[1];
    child.productoUrl = producto.url;
    child.sku = producto.sku;
    child.completada = false;
    child.pendiente = false;
    child.tipoEntregable = meta.tipo;
    child.notas =
      suf === 'prompt'
        ? `Prompt Gemini VIDEO del producto. SKU ${producto.sku}. Link: ${producto.url}. Características: ${producto.caracteristicas}.`
        : suf === 'copy'
          ? `Copys video · Producto: ${producto.nombre}. Link: ${producto.url}`
          : `Programar publicación. Producto: ${producto.nombre}. Link: ${producto.url}`;
  }
  return true;
}

function archivarTsMadre(tareas, madreId, motivo) {
  const ids = new Set([madreId, `${madreId}-prompt`, `${madreId}-copy`, `${madreId}-programar`]);
  for (const t of tareas) {
    if (!ids.has(t.id)) continue;
    t.completada = true;
    t.pendiente = false;
    t.notas = `${(t.notas || '').trim()}\n\n[27 jul] Archivada: ${motivo}`.trim();
  }
}

function main() {
  const cands = candidatosBase();
  if (!cands.length) {
    console.error('No hay respaldo base. Copiá organizacion-respaldo-2026-07-26.json a data/');
    process.exit(1);
  }
  const base = cands[0];
  console.log('[base]', base.path);
  if (!/2026-07-26/.test(base.name)) {
    console.warn(
      '[aviso] No está el respaldo 2026-07-26. Usando',
      base.name,
      '— en la PC: copy Downloads\\organizacion-respaldo-2026-07-26.json data\\ y re-ejecutá.'
    );
  }

  const data = JSON.parse(JSON.stringify(base.obj));
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];

  // —— Desafío Latam (hoy) ——
  const nDl1 = nextNumero(data.tareas, 'cli-desafio-latam');
  upsert(data.tareas, {
    id: 'tarea-dlat-edicion-diseno-2026-07-27',
    titulo: '[ADL] Edición diseño',
    clienteId: 'cli-desafio-latam',
    rolId: 'rol-dlat-dis',
    fecha: HOY,
    horaInicio: '09:00',
    horaFin: '11:00',
    notas: 'Edición de diseño Desafío Latam — solo diseño, sin IA (regla del cliente).',
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    numeroHistorico: nDl1,
    tipoEntregable: 'diseno',
    parentId: null,
    agendaFijada: true,
  });
  const nDl2 = nextNumero(data.tareas, 'cli-desafio-latam');
  upsert(data.tareas, {
    id: 'tarea-dlat-boleta-formulario-2026-07-27',
    titulo: '[ADL] Enviar boleta y formulario',
    clienteId: 'cli-desafio-latam',
    rolId: 'rol-dlat-dis',
    fecha: HOY,
    horaInicio: '11:00',
    horaFin: '12:00',
    notas: 'Enviar boleta y formulario Desafío Latam.',
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    numeroHistorico: nDl2,
    tipoEntregable: 'admin',
    parentId: null,
    agendaFijada: true,
  });

  // —— ECR Canal denuncias (hoy) ——
  const nEcr = nextNumero(data.tareas, 'cli-ecr');
  upsert(data.tareas, {
    id: 'tarea-ecr-landing-canal-denuncias-2026-07-27',
    titulo: '[ECR] Landing canal denuncias',
    clienteId: 'cli-ecr',
    rolId: 'rol-ecr-dev',
    fecha: HOY,
    horaInicio: '14:00',
    horaFin: '17:00',
    notas:
      'Revisar y ajustar tipografía/layout responsive en https://ecrgroup.cl/canaldenuncias/ ' +
      '(Elementor). Guía: index/clientes/ecr/canal-denuncias/RESPONSIVE-TEXTO.md. ' +
      'Relacionado Ley Karin: index/clientes/ecr/ley-karin/AJUSTES-ELEMENTOR.md',
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    numeroHistorico: nEcr,
    tipoEntregable: 'landing-elementor',
    entregableArchivo: 'index/clientes/ecr/canal-denuncias/RESPONSIVE-TEXTO.md',
    productoUrl: 'https://ecrgroup.cl/canaldenuncias/',
    parentId: null,
    agendaFijada: true,
  });

  // —— Trendseeker: incompletas → 1 hoy + 1 miércoles (pedido explícito) ——
  // 3 SKU en la imagen → 2 activas (DOV hoy, WHW mié); DOC queda como próximo.
  archivarTsMadre(
    data.tareas,
    'tarea-ts-contenido-10-de-12',
    'solo 2 TS activas (hoy + miércoles). Próximo SKU: WFF1088RMA-DOC · https://trendseeker.cl/producto/zueco-de-jardin-para-mujer-verde-oliva/'
  );

  patchTsMadre(data.tareas, 'tarea-ts-contenido-12-de-12', PRODUCTOS_TS[0], HOY, {
    madre: ['09:30', '13:00'],
    prompt: ['09:30', '10:45'],
    copy: ['10:45', '12:00'],
    programar: ['12:00', '13:00'],
  });

  patchTsMadre(data.tareas, 'tarea-ts-contenido-11-de-12', PRODUCTOS_TS[1], MIE, {
    madre: ['09:30', '13:00'],
    prompt: ['09:30', '10:45'],
    copy: ['10:45', '12:00'],
    programar: ['12:00', '13:00'],
  });

  // —— Impresoreando: pieza 1080×1920 ——
  const nImp = nextNumero(data.tareas, 'cli-impresoreando');
  upsert(data.tareas, {
    id: 'tarea-imp-pieza-porta-celular-bulldog-2026-07-27',
    titulo: '[IMP] Pieza IG Porta celular bulldog 1080×1920',
    clienteId: 'cli-impresoreando',
    rolId: 'rol-imp-dis',
    fecha: HOY,
    horaInicio: '17:00',
    horaFin: '18:00',
    notas:
      'Pieza vertical 1080×1920 identidad “Porta completos” (beige + serif + Hecho a pedido) ' +
      'con producto porta celular bulldog francés negro. Archivo: ' +
      'index/clientes/impresoreando/piezas/porta-celular-bulldog-1080x1920.png',
    prioridad: 'media',
    completada: true,
    pendiente: false,
    numeroHistorico: nImp,
    tipoEntregable: 'pieza-ig',
    entregableArchivo: 'index/clientes/impresoreando/piezas/porta-celular-bulldog-1080x1920.png',
    parentId: null,
    agendaFijada: true,
  });

  data.respaldoVersion = data.respaldoVersion || 1;
  data.respaldoActualizado = new Date().toISOString();
  data.meta = data.meta || {};
  data.meta.ultimaCargaRespaldo = {
    fuente: base.path,
    fecha: data.respaldoActualizado,
    nota: 'Tareas 27 jul 2026 (ADL + ECR canal + TS productos + IMP pieza)',
  };

  fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n');
  fs.writeFileSync(OUT_RESPALDO, JSON.stringify(data, null, 2) + '\n');
  // También dejar copia con nombre del 26 si vino de ahí, para cadena de respaldos
  if (/2026-07-26/.test(base.name)) {
    const copy26 = path.join(DATA, 'organizacion-respaldo-2026-07-26.json');
    if (base.path !== copy26) {
      fs.copyFileSync(base.path, copy26);
      console.log('[copy]', copy26);
    }
  }

  console.log('[ok] live →', LIVE);
  console.log('[ok] respaldo →', OUT_RESPALDO);
  console.log('Hoy:', HOY, '| Miércoles:', MIE);
  console.log('TS hoy:', PRODUCTOS_TS[0].sku, PRODUCTOS_TS[0].url);
  console.log('TS mié:', PRODUCTOS_TS[1].sku, PRODUCTOS_TS[1].url);
  console.log('TS próximo:', PRODUCTOS_TS[2].sku, PRODUCTOS_TS[2].url);
  console.log('Ver: http://127.0.0.1:8000/index.html?disco=1&fecha=' + HOY);
}

main();
