#!/usr/bin/env node
/**
 * Fuerza Limpiador de brochas (LMBROC001) en impresoreando-live.json
 * aunque el live local esté desfasado del seed.
 *
 *   node scripts/force-imp-producto-limpiador-brochas.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');

const PRODUCTO = {
  id: 'prod-limpiador-brochas',
  sku: 'LMBROC001',
  nombre: 'Limpiador de brochas',
  activo: true,
  impresoraId: 'imp-centauri-carbon-2',
  filamentoModeloGramos: 113.58,
  filamentoSoportesGramos: 0,
  filamentoPurgeGramos: 0.47,
  filamentoMetros: 37.93,
  filamentoGramos: 114.05,
  costoFilamentoKgClp: 16829,
  horasImpresion: 3.47,
  minutosPintado: 0,
  unidadesMetal: 0,
  unidadesBolsa: 1,
  precioVentaSugeridoClp: 4300,
  costoSlicerRef: 2.28,
  pendienteCosto: false,
  editadoLocal: true,
  notas:
    'Slicer 1 ud: modelo 113.58 g + descargado 0.47 g = 114.05 g · 37.93 m · 3 h 28 m · coste slicer 2,28. PLA morado pastel (ref $/kg color $16.829) · Elegoo Centauri. Costo ~$2.163 · PVP sugerido $4.300.',
};

function main() {
  if (!fs.existsSync(SEED)) {
    console.error('Falta seed', SEED);
    process.exit(1);
  }
  // Asegurar en seed también
  const seed = JSON.parse(fs.readFileSync(SEED, 'utf8'));
  seed.productos = Array.isArray(seed.productos) ? seed.productos : [];
  const si = seed.productos.findIndex((p) => p.id === PRODUCTO.id || p.sku === PRODUCTO.sku);
  if (si < 0) seed.productos.push({ ...PRODUCTO });
  else seed.productos[si] = { ...seed.productos[si], ...PRODUCTO };
  fs.writeFileSync(SEED, JSON.stringify(seed, null, 2) + '\n');

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
    console.log('Agregado LMBROC001 al live');
  } else {
    live.productos[i] = { ...live.productos[i], ...PRODUCTO };
    console.log('Actualizado LMBROC001 en live');
  }
  live.meta = live.meta && typeof live.meta === 'object' ? live.meta : {};
  live.meta.actualizado = new Date().toISOString();
  fs.writeFileSync(LIVE, JSON.stringify(live, null, 2) + '\n');
  console.log('OK · productos:', live.productos.length);
  console.log('Ver: http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=costos&v=lmbroc');
}

main();
