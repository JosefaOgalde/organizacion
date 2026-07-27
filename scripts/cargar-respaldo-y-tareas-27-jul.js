#!/usr/bin/env node
/**
 * 27 jul 2026 — Cargar respaldo reciente + tareas del día.
 *
 * Prioridad de base (la más nueva primero):
 *   1) Downloads o data / organizacion-respaldo-2026-07-27.json  ← vigente
 *   2) …-2026-07-26.json
 *   3) …-2026-07-24.json
 *   4) organizacion-live.json
 *
 * En la PC (josef) — OBLIGATORIO usar el del 27:
 *   copy %USERPROFILE%\Downloads\organizacion-respaldo-2026-07-27.json data\
 *   node scripts\cargar-respaldo-y-tareas-27-jul.js
 *   .\ABRIR-LARAVEL.bat
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
    'organizacion-respaldo-2026-07-27.json',
    'organizacion-respaldo-2026-07-26.json',
    'organizacion-respaldo-2026-07-24.json',
    'organizacion-respaldo-2026-07-21.json',
  ];
  const dirs = [downloads, DATA].filter((d) => d && fs.existsSync(d));
  const found = [];
  for (const dir of dirs) {
    for (const name of names) {
      const abs = path.join(dir, name);
      if (!fs.existsSync(abs)) continue;
      const obj = leerJson(abs);
      if (!obj) continue;
      found.push({ path: abs, obj, name, dir });
    }
  }
  if (fs.existsSync(LIVE)) {
    const obj = leerJson(LIVE);
    if (obj) found.push({ path: LIVE, obj, name: 'organizacion-live.json', dir: DATA });
  }
  // Preferir 27 > 26 > 24 > 21 > live; si hay dos del mismo nombre, preferir Downloads
  const rank = (c) => {
    let r = 9;
    if (/2026-07-27/.test(c.name)) r = 0;
    else if (/2026-07-26/.test(c.name)) r = 1;
    else if (/2026-07-24/.test(c.name)) r = 2;
    else if (/2026-07-21/.test(c.name)) r = 3;
    else r = 4;
    const fromDl = /Downloads/i.test(c.path) ? 0 : 1;
    return r * 10 + fromDl;
  };
  found.sort((a, b) => rank(a) - rank(b));
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
    const yaFinalizada = prev.completada === true;
    tareas[idx] = {
      ...prev,
      ...tarea,
      numeroHistorico: prev.numeroHistorico || tarea.numeroHistorico,
      // Nunca reabrir una tarea que la usuaria ya dejó finalizada
      completada: yaFinalizada ? true : tarea.completada,
      pendiente: yaFinalizada ? false : tarea.pendiente,
    };
    if (yaFinalizada) {
      console.log('[respetar finalizada]', prev.titulo || tarea.titulo);
      return 'keep-done';
    }
    return 'upd';
  }
  tareas.push(tarea);
  return 'new';
}

function patchTsMadre(tareas, madreId, producto, fecha, horas) {
  const madre = tareas.find((t) => t.id === madreId);
  if (!madre) return false;
  // Si ya estaba finalizada en el respaldo, no tocar
  if (madre.completada === true) {
    console.log('[TS skip finalizada]', madreId, madre.titulo);
    return false;
  }
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
    if (child.completada === true) {
      console.log('[TS skip hija finalizada]', id);
      continue;
    }
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
  const madre = tareas.find((t) => t.id === madreId);
  // Si ya estaba finalizada, no agregar notas de "archivada" ni tocar
  if (madre && madre.completada === true) {
    console.log('[TS ya finalizada, no archivar de nuevo]', madreId);
    return;
  }
  const ids = new Set([madreId, `${madreId}-prompt`, `${madreId}-copy`, `${madreId}-programar`]);
  for (const t of tareas) {
    if (!ids.has(t.id)) continue;
    if (t.completada === true) continue;
    t.completada = true;
    t.pendiente = false;
    t.notas = `${(t.notas || '').trim()}\n\n[27 jul] Archivada: ${motivo}`.trim();
  }
}

function main() {
  const cands = candidatosBase();
  if (!cands.length) {
    console.error('No hay respaldo base. Copiá organizacion-respaldo-2026-07-27.json a data/');
    process.exit(1);
  }
  const base = cands[0];
  console.log('[base]', base.path);
  if (!/2026-07-27/.test(base.name)) {
    console.warn(
      '[aviso] No está organizacion-respaldo-2026-07-27.json. Usando',
      base.name,
      '— en la PC: copy %USERPROFILE%\\Downloads\\organizacion-respaldo-2026-07-27.json data\\ y re-ejecutá.'
    );
  } else {
    console.log('[ok] Usando respaldo vigente 2026-07-27');
  }

  // Si vino de Downloads, copiar a data/ para que quede en el repo local
  const copy27 = path.join(DATA, 'organizacion-respaldo-2026-07-27.json');
  if (/2026-07-27/.test(base.name) && path.resolve(base.path) !== path.resolve(copy27)) {
    fs.copyFileSync(base.path, copy27);
    console.log('[copy]', copy27);
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

  // —— Trendseeker: solo tocar madres AÚN NO finalizadas ——
  // Respetar C7–C10 (u otras) si ya están completada=true en el respaldo del 27.
  const tsMadresIncompletas = data.tareas.filter(
    (t) =>
      t.clienteId === 'cli-trendseeker' &&
      !t.parentId &&
      t.completada !== true &&
      /contenido-\d+-de-12$/i.test(t.id)
  );
  console.log(
    '[TS incompletas]',
    tsMadresIncompletas.map((t) => t.id + ' · ' + (t.titulo || '')).join(' | ') || '(ninguna)'
  );

  // No archivar ni reabrir finalizadas. Solo reasignar productos a incompletas.
  const slots = [
    { producto: PRODUCTOS_TS[0], fecha: HOY, horas: { madre: ['09:30', '13:00'], prompt: ['09:30', '10:45'], copy: ['10:45', '12:00'], programar: ['12:00', '13:00'] } },
    { producto: PRODUCTOS_TS[1], fecha: MIE, horas: { madre: ['09:30', '13:00'], prompt: ['09:30', '10:45'], copy: ['10:45', '12:00'], programar: ['12:00', '13:00'] } },
  ];

  // Preferir C12 → hoy, C11 → mié si siguen incompletas; si no, la primera incompleta disponible
  const pick = (preferId) => {
    const hit = tsMadresIncompletas.find((t) => t.id === preferId);
    if (hit) return hit;
    return tsMadresIncompletas.find((t) => !t._usado);
  };

  const hoyMadre = pick('tarea-ts-contenido-12-de-12');
  if (hoyMadre) {
    hoyMadre._usado = true;
    patchTsMadre(data.tareas, hoyMadre.id, slots[0].producto, slots[0].fecha, slots[0].horas);
  } else {
    console.log('[TS] No hay madre incompleta para hoy — no se crea ni se reabre nada finalizado');
  }

  const mieMadre = pick('tarea-ts-contenido-11-de-12');
  if (mieMadre) {
    mieMadre._usado = true;
    patchTsMadre(data.tareas, mieMadre.id, slots[1].producto, slots[1].fecha, slots[1].horas);
  } else {
    console.log('[TS] No hay madre incompleta para miércoles — no se reabre finalizada');
  }

  // Limpiar flag temporal
  for (const t of data.tareas) delete t._usado;

  console.log('[TS próximo SKU sin tarea]', PRODUCTOS_TS[2].sku, PRODUCTOS_TS[2].url);

  // —— Impresoreando: pieza 1080×1920 ——
  const nImp = nextNumero(data.tareas, 'cli-impresoreando');
  upsert(data.tareas, {
    id: 'tarea-imp-pieza-porta-celular-bulldog-2026-07-27',
    titulo: '[IMP] Pieza IG Porta completos bulldog 1080×1920',
    clienteId: 'cli-impresoreando',
    rolId: 'rol-imp-dis',
    fecha: HOY,
    horaInicio: '17:00',
    horaFin: '18:00',
    notas:
      'Pieza 1080×1920 identidad Porta completos. Producto = foto real (montaje). ' +
      'Archivo final: index/clientes/impresoreando/piezas/porta-completos-bulldog-1080x1920.png · ' +
      'Script: node scripts/montar-pieza-porta-completos-bulldog.js (requiere foto-producto-bulldog.jpg)',
    prioridad: 'media',
    completada: false,
    pendiente: false,
    numeroHistorico: nImp,
    tipoEntregable: 'pieza-ig',
    entregableArchivo: 'index/clientes/impresoreando/piezas/porta-completos-bulldog-1080x1920.png',
    parentId: null,
    agendaFijada: true,
  });

  data.respaldoVersion = data.respaldoVersion || 1;
  data.respaldoActualizado = new Date().toISOString();
  data.meta = data.meta || {};
  data.meta.ultimaCargaRespaldo = {
    fuente: base.path,
    fecha: data.respaldoActualizado,
    nota: 'Tareas 27 jul 2026 sobre respaldo vigente (preferir Downloads …-07-27.json)',
  };

  fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n');
  // No pisar el JSON fuente del usuario: live + copia con sufijo aplicado
  const outAplicado = path.join(DATA, 'organizacion-respaldo-2026-07-27-aplicado.json');
  fs.writeFileSync(outAplicado, JSON.stringify(data, null, 2) + '\n');
  // Si la base NO era el 27 del usuario, también escribir OUT_RESPALDO legacy
  if (!/2026-07-27/.test(base.name)) {
    fs.writeFileSync(OUT_RESPALDO, JSON.stringify(data, null, 2) + '\n');
  }

  console.log('[ok] live →', LIVE);
  console.log('[ok] aplicado →', outAplicado);
  console.log('Hoy:', HOY, '| Miércoles:', MIE);
  console.log('TS hoy:', PRODUCTOS_TS[0].sku, PRODUCTOS_TS[0].url);
  console.log('TS mié:', PRODUCTOS_TS[1].sku, PRODUCTOS_TS[1].url);
  console.log('TS próximo:', PRODUCTOS_TS[2].sku, PRODUCTOS_TS[2].url);
  console.log('Ver: http://127.0.0.1:8000/index.html?disco=1&fecha=' + HOY);
}

main();
