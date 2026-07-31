#!/usr/bin/env node
/**
 * Fuerza PED-014/015 (ventas), PED-008 → venta I000019, PED-007 anulado,
 * producto LLONEPI001, ventas I000017/018/019 y gasto entrada evento 3D.
 *
 *   node scripts/force-imp-ventas-014-015-fiado-008.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');

const FORCE_PED_IDS = [
  'ped-rebe-chanchito-014',
  'ped-cata-onepiece-015',
  'ped-juan-bob-008',
  'ped-juan-torreon-007',
];
const FORCE_VEN_IDS = ['ven-rebe-chanchito-017', 'ven-cata-onepiece-018', 'ven-juan-bob-019'];
const FORCE_GAS_IDS = ['gas-entrada-evento-3d-16100'];
const FORCE_PROD_SKUS = ['LLONEPI001', 'ALCHAN001'];

function main() {
  if (!fs.existsSync(SEED)) {
    console.error('Falta seed');
    process.exit(1);
  }
  const seed = JSON.parse(fs.readFileSync(SEED, 'utf8'));
  let live;
  if (!fs.existsSync(LIVE)) {
    fs.writeFileSync(LIVE, JSON.stringify(seed, null, 2) + '\n', 'utf8');
    console.log('Creado live desde seed');
    return;
  }
  live = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  live.pedidos = Array.isArray(live.pedidos) ? live.pedidos : [];
  live.ventas = Array.isArray(live.ventas) ? live.ventas : [];
  live.productos = Array.isArray(live.productos) ? live.productos : [];
  live.gastos = Array.isArray(live.gastos) ? live.gastos : [];
  live.meta = live.meta && typeof live.meta === 'object' ? live.meta : {};

  let n = 0;
  for (const id of FORCE_PED_IDS) {
    const sp = (seed.pedidos || []).find((p) => p && p.id === id);
    if (!sp) {
      console.warn('No en seed:', id);
      continue;
    }
    const idx = live.pedidos.findIndex((p) => p && (p.id === id || p.numero === sp.numero));
    if (idx < 0) {
      live.pedidos.push(JSON.parse(JSON.stringify(sp)));
      n += 1;
      console.log('+ pedido', sp.numero, sp.cliente, sp.estado, sp.fiado ? 'fiado' : '');
    } else {
      live.pedidos[idx] = { ...live.pedidos[idx], ...JSON.parse(JSON.stringify(sp)) };
      n += 1;
      console.log('~ pedido', sp.numero, sp.cliente, sp.estado, sp.fiado ? 'fiado' : '');
    }
  }

  for (const id of FORCE_VEN_IDS) {
    const sv = (seed.ventas || []).find((v) => v && v.id === id);
    if (!sv) continue;
    const idx = live.ventas.findIndex((v) => v && (v.id === id || v.codigo === sv.codigo));
    if (idx < 0) {
      live.ventas.push(JSON.parse(JSON.stringify(sv)));
      n += 1;
      console.log('+ venta', sv.codigo);
    } else {
      live.ventas[idx] = { ...live.ventas[idx], ...JSON.parse(JSON.stringify(sv)) };
      n += 1;
      console.log('~ venta', sv.codigo);
    }
  }

  for (const id of FORCE_GAS_IDS) {
    const sg = (seed.gastos || []).find((g) => g && g.id === id);
    if (!sg) continue;
    const idx = live.gastos.findIndex((g) => g && g.id === id);
    if (idx < 0) {
      live.gastos.push(JSON.parse(JSON.stringify(sg)));
      n += 1;
      console.log('+ gasto', sg.id, sg.montoNeto);
    } else {
      live.gastos[idx] = JSON.parse(JSON.stringify(sg));
      n += 1;
      console.log('~ gasto', sg.id);
    }
  }

  for (const sku of FORCE_PROD_SKUS) {
    const sp = (seed.productos || []).find((p) => p && p.sku === sku);
    if (!sp) continue;
    const idx = live.productos.findIndex((p) => p && (p.sku === sku || p.id === sp.id));
    if (idx < 0) {
      live.productos.push(JSON.parse(JSON.stringify(sp)));
      n += 1;
      console.log('+ producto', sku);
    }
  }

  if (Array.isArray(seed.meta?.clientesHistorial)) {
    live.meta.clientesHistorial = JSON.parse(JSON.stringify(seed.meta.clientesHistorial));
    n += 1;
  }
  if (Number(seed.meta?.pedidoSeq || 0) > Number(live.meta.pedidoSeq || 0)) {
    live.meta.pedidoSeq = seed.meta.pedidoSeq;
  }
  if (Number(seed.meta?.ventaSeq || 0) > Number(live.meta.ventaSeq || 0)) {
    live.meta.ventaSeq = seed.meta.ventaSeq;
  }

  fs.writeFileSync(LIVE, JSON.stringify(live, null, 2) + '\n', 'utf8');
  console.log('Listo. Cambios:', n);
}

main();
