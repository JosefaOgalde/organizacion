#!/usr/bin/env node
/**
 * Fuerza Llavero One Piece (LLONEPI001) en impresoreando-live.json
 * aunque el live local esté desfasado del seed (pendienteCosto).
 *
 *   node scripts/force-imp-producto-llavero-one-piece.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');

const PRODUCTO = {
  id: 'prod-llavero-one-piece',
  sku: 'LLONEPI001',
  nombre: 'Llavero One Piece',
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
  unidadesMetal: 1,
  unidadesBolsa: 1,
  precioVentaSugeridoClp: 1667,
  costoSlicerRef: 0.18,
  pendienteCosto: false,
  editadoLocal: true,
  notas:
    'Slicer 1 ud (todo al costo): modelo 7.31 g (2,43 m) + soportes 0.11 g (0,04 m) + descargado 0,71 g + torre 0,80 g = 8.94 g · 2,97 m · 17 m 23 s · coste slicer 0,18 · 2 cambios filamento. Multicolor: fil.1 1,32 g + fil.2 rojo 7,62 g. PLA+ negro/rojo $17.986/kg · Elegoo. Fil ~$161 (incl. purga/torre) + luz ~$16 + argolla $50 + bolsa $50 = costo ~$277 · PVP fórmula +100% ~$554 · cobrado $1.667/u (3× Cata SIE $5.000).',
};

function main() {
  if (!fs.existsSync(SEED)) {
    console.error('Falta seed', SEED);
    process.exit(1);
  }
  const seed = JSON.parse(fs.readFileSync(SEED, 'utf8'));
  seed.productos = Array.isArray(seed.productos) ? seed.productos : [];
  const si = seed.productos.findIndex((p) => p.id === PRODUCTO.id || p.sku === PRODUCTO.sku);
  let seedTouched = false;
  if (si < 0) {
    seed.productos.push({ ...PRODUCTO });
    seedTouched = true;
  } else if (!(Number(seed.productos[si].filamentoGramos) > 0) || seed.productos[si].pendienteCosto) {
    seed.productos[si] = { ...seed.productos[si], ...PRODUCTO };
    seedTouched = true;
  }
  if (seedTouched) {
    fs.writeFileSync(SEED, JSON.stringify(seed, null, 2) + '\n');
    console.log('Actualizado LLONEPI001 en seed');
  }

  let live;
  if (!fs.existsSync(LIVE)) {
    live = JSON.parse(JSON.stringify(seed));
    console.log('Creado live desde seed');
  } else {
    live = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  }
  live.productos = Array.isArray(live.productos) ? live.productos : [];
  const i = live.productos.findIndex((p) => p.id === PRODUCTO.id || p.sku === PRODUCTO.sku);
  if (i < 0) {
    live.productos.push({ ...PRODUCTO });
    console.log('Agregado LLONEPI001 al live');
  } else {
    live.productos[i] = { ...live.productos[i], ...PRODUCTO };
    console.log('Actualizado LLONEPI001 en live');
  }
  live.meta = live.meta && typeof live.meta === 'object' ? live.meta : {};
  live.meta.actualizado = new Date().toISOString();
  fs.writeFileSync(LIVE, JSON.stringify(live, null, 2) + '\n');
  console.log('OK · productos:', live.productos.length);
  console.log('Ver: http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=costos&v=llonepi');
}

main();
