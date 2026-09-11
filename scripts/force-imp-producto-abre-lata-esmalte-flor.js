#!/usr/bin/env node
/**
 * Fuerza Abre lata esmalte flor (ALESFL001) en impresoreando-live.json
 * y restaura LLONEPI001 a pendiente de costo (el slicer no era One Piece).
 *
 *   node scripts/force-imp-producto-abre-lata-esmalte-flor.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');

const PRODUCTO = {
  id: 'prod-abre-lata-esmalte-flor',
  sku: 'ALESFL001',
  nombre: 'Abre lata esmalte flor',
  activo: true,
  impresoraId: 'imp-centauri-carbon-2',
  filamentoModeloGramos: 7.31,
  filamentoSoportesGramos: 0.11,
  filamentoPurgeGramos: 1.52,
  filamentoMetros: 2.97,
  filamentoGramos: 8.94,
  costoFilamentoKgClp: 17986,
  horasImpresion: 0.29,
  minutosPintado: 0,
  unidadesMetal: 0,
  unidadesBolsa: 1,
  precioVentaSugeridoClp: 454,
  costoSlicerRef: 0.18,
  pendienteCosto: false,
  editadoLocal: true,
  notas:
    'Slicer 1 ud (todo al costo): modelo 7.31 g (2,43 m) + soportes 0.11 g (0,04 m) + descargado 0,71 g + torre 0,80 g = 8.94 g · 2,97 m · 17 m 23 s · coste slicer 0,18 · 2 cambios filamento. Multicolor: fil.1 1,32 g + fil.2 rojo 7,62 g. PLA+ negro/rojo $17.986/kg · Elegoo. Fil ~$161 (incl. purga/torre) + luz ~$16 + bolsa $50 = costo ~$227 · PVP sugerido $454. Sin argolla (no es llavero).',
};

const ONE_PIECE_PENDIENTE = {
  id: 'prod-llavero-one-piece',
  sku: 'LLONEPI001',
  nombre: 'Llavero One Piece',
  activo: true,
  unidadesMetal: 1,
  unidadesBolsa: 1,
  precioVentaSugeridoClp: 1667,
  pendienteCosto: true,
  notas: '3 uds cobradas a Cata SIE $5.000 total ($1.667/u). Costo pendiente (sin imagen slicer).',
};

function upsertProducto(list, prod) {
  const i = list.findIndex((p) => p && (p.id === prod.id || p.sku === prod.sku));
  if (i < 0) {
    list.push({ ...prod });
    return 'add';
  }
  list[i] = { ...list[i], ...prod };
  return 'upd';
}

function resetOnePiece(list) {
  const i = list.findIndex((p) => p && (p.id === ONE_PIECE_PENDIENTE.id || p.sku === ONE_PIECE_PENDIENTE.sku));
  if (i < 0) {
    list.push({ ...ONE_PIECE_PENDIENTE });
    return 'add';
  }
  const prev = list[i];
  const looksMisassigned =
    Number(prev.filamentoGramos) === 8.94 ||
    Number(prev.costoSlicerRef) === 0.18 ||
    prev.pendienteCosto === false;
  if (!looksMisassigned && prev.pendienteCosto) return 'skip';
  list[i] = { ...ONE_PIECE_PENDIENTE };
  return 'reset';
}

function main() {
  if (!fs.existsSync(SEED)) {
    console.error('Falta seed', SEED);
    process.exit(1);
  }
  const seed = JSON.parse(fs.readFileSync(SEED, 'utf8'));
  seed.productos = Array.isArray(seed.productos) ? seed.productos : [];

  let live;
  if (!fs.existsSync(LIVE)) {
    live = JSON.parse(JSON.stringify(seed));
    console.log('Creado live desde seed');
  } else {
    live = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  }
  live.productos = Array.isArray(live.productos) ? live.productos : [];
  live.ventas = Array.isArray(live.ventas) ? live.ventas : [];
  live.pedidos = Array.isArray(live.pedidos) ? live.pedidos : [];

  console.log(upsertProducto(live.productos, PRODUCTO), 'ALESFL001');
  console.log(resetOnePiece(live.productos), 'LLONEPI001');

  const ven = live.ventas.find((v) => v && v.codigo === 'I000018');
  if (ven) {
    ven.costoTotal = 0;
    if (ven.items && ven.items[0]) {
      ven.items[0].costoUnitarioClp = 0;
      ven.items[0].filamento = '';
    }
  }
  const ped = live.pedidos.find((p) => p && p.numero === 'PED-015');
  if (ped) {
    ped.costoTotal = 0;
    if (ped.items && ped.items[0]) {
      ped.items[0].costoUnitarioClp = 0;
      ped.items[0].filamento = '';
    }
  }

  live.meta = live.meta && typeof live.meta === 'object' ? live.meta : {};
  live.meta.actualizado = new Date().toISOString();
  fs.writeFileSync(LIVE, JSON.stringify(live, null, 2) + '\n');
  console.log('OK · productos:', live.productos.length);
  console.log('Ver: http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=costos&v=alesfl');
}

main();
