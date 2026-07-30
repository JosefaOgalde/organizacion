#!/usr/bin/env node
/**
 * Tarea TS: subir Sherpa verde oliva (WFT2052NRE-DOV) a destacado / primera posición.
 * Miércoles 29 jul 2026 · tarde (después de C11/12 Gardener).
 *
 *   node scripts/add-ts-sherpa-destacado-landing.js
 *   node scripts/add-ts-sherpa-destacado-landing.js --also-respaldo
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const LIVE = path.join(DATA, 'organizacion-live.json');
const FECHA = '2026-07-29';
const HORA_INICIO = '14:00';
const HORA_FIN = '15:30';
const CLIENTE = 'cli-trendseeker';
const ROL = 'rol-cm';
const ID = 'tarea-ts-sherpa-verde-destacado-landing-2026-07-29';
const SKU = 'WFT2052NRE-DOV';
const URL =
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
    titulo: '[TS] WP · Sherpa verde oliva a destacado / primera en Botas mujer',
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: FECHA,
    horaInicio: HORA_INICIO,
    horaFin: HORA_FIN,
    notas:
      'WooCommerce / catálogo Trendseeker. Producto: Botas Estilo Sherpa Con Parte Superior Enrollable Para Mujer Verde Oliva · SKU ' +
      SKU +
      '. Link: ' +
      URL +
      '\n\n' +
      'Pedido cliente: está muy abajo; hay que subirla.\n' +
      'Checklist:\n' +
      '1) Marcar como Destacado (featured) en la landing / home si aplica.\n' +
      '2) En la marca Hunter: dejarla visible/arriba (orden de catálogo o menú_order).\n' +
      '3) En Botas de mujer: primera posición (o entre las primeras) — hoy está muy abajo.\n' +
      '4) Verificar en front: Inicio (destacados), archivo Hunter, categoría Botas + filtro Mujer.\n' +
      '5) Desktop + mobile. Al terminar → marcar hecha.',
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    numeroHistorico: num,
    tipoEntregable: 'wordpress-catalogo',
    parentId: null,
    productoUrl: URL,
    sku: SKU,
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
  const name = 'organizacion-respaldo-2026-07-28.json';
  upsert(path.join(DATA, name));
}

if (fs.existsSync(LIVE)) {
  const live = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  const t = (live.tareas || []).find((x) => x.id === ID);
  const num = t ? t.numeroHistorico : '?';
  console.log(`Ver: http://127.0.0.1:8000/index.html?disco=1&tarea=ts/${num}`);
  console.log(`Producto: ${URL}`);
}
