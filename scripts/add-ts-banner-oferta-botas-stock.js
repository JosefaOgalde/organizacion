#!/usr/bin/env node
/**
 * Tarea TS: banner oferta + ordenar Botas mujer por stock (más stock primero).
 * Miércoles 29 jul 2026 · tarde (después de Sherpa destacado).
 *
 *   node scripts/add-ts-banner-oferta-botas-stock.js
 *   node scripts/add-ts-banner-oferta-botas-stock.js --also-respaldo
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const LIVE = path.join(DATA, 'organizacion-live.json');
const FECHA = '2026-07-29';
const HORA_INICIO = '15:30';
const HORA_FIN = '17:00';
const CLIENTE = 'cli-trendseeker';
const ROL = 'rol-cm';
const ID = 'tarea-ts-banner-oferta-botas-stock-2026-07-29';
const SHERPA_SKU = 'WFT2052NRE-DOV';
const SHERPA_URL =
  'https://trendseeker.cl/producto/botas-estilo-sherpa-con-parte-superior-enrollable-para-mujer-verde-oliva/';

function nextNumero(tareas) {
  let max = 0;
  for (const t of tareas) {
    if (t.clienteId !== CLIENTE) continue;
    const n = parseInt(String(t.numeroHistorico || '0'), 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return String(max + 1).padStart(2, '0');
}

function buildTarea(num) {
  return {
    id: ID,
    titulo: '[TS] WP · Banner oferta + Botas mujer por stock (Sherpa arriba)',
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: FECHA,
    horaInicio: HORA_INICIO,
    horaFin: HORA_FIN,
    notas:
      'WooCommerce / catálogo Trendseeker — pedido cliente 2026-07-28.\n\n' +
      '1) Banner oferta: revisar/actualizar el banner de oferta en landing (o sección correspondiente) para que quede coherente y visible.\n' +
      '2) Botas de mujer: poner las botas con MÁS STOCK en los primeros puestos (ordenar por stock disponible, no dejar productos con poco stock arriba).\n' +
      '3) Caso citado: Sherpa verde oliva (SKU ' +
      SHERPA_SKU +
      ') se visualiza muy abajo — subirla según stock/orden. Link: ' +
      SHERPA_URL +
      '\n' +
      '4) Verificar front: landing (banner), categoría Botas + Mujer, y que el orden se vea bien en desktop + mobile.\n' +
      '5) Relacionada: tarea #29 (Sherpa a destacado / primera). Coordinar para no pisar el orden.\n' +
      'Al terminar → marcar hecha.',
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    numeroHistorico: num,
    tipoEntregable: 'wordpress-catalogo',
    parentId: null,
    productoUrl: SHERPA_URL,
    sku: SHERPA_SKU,
    agendaFijada: true,
    color: 'lavanda',
  };
}

function upsert(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error('No existe', filePath);
    return false;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
  const num = nextNumero(data.tareas);
  const tarea = buildTarea(num);

  const idx = data.tareas.findIndex((t) => t.id === ID);
  if (idx >= 0) {
    const prev = data.tareas[idx];
    tarea.numeroHistorico = prev.numeroHistorico || num;
    if (prev.completada === true) {
      tarea.completada = true;
      tarea.pendiente = false;
    }
    data.tareas[idx] = { ...prev, ...tarea };
    console.log('Actualizada', path.basename(filePath), tarea.titulo, '#' + tarea.numeroHistorico);
  } else {
    data.tareas.push(tarea);
    console.log('Creada', path.basename(filePath), tarea.titulo, '#' + tarea.numeroHistorico);
  }

  data.respaldoActualizado = new Date().toISOString();
  if (!data.meta || typeof data.meta !== 'object') data.meta = {};
  data.meta.actualizado = data.respaldoActualizado;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  return true;
}

upsert(LIVE);
if (process.argv.includes('--also-respaldo')) {
  upsert(path.join(DATA, 'organizacion-respaldo-2026-07-28.json'));
}

if (fs.existsSync(LIVE)) {
  const live = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  const t = (live.tareas || []).find((x) => x.id === ID);
  const num = t ? t.numeroHistorico : '?';
  console.log(`Ver: http://127.0.0.1:8000/index.html?disco=1&tarea=ts/${num}`);
}
