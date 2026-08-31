#!/usr/bin/env node
/**
 * Fuerza PED-016 Ines Quintero → I000021 $7.000 y PED-017 Patito → I000022 $4.000,
 * más productos JGDINO001 / LLNORUE001. Pisa live con el seed.
 *
 *   node scripts/force-imp-ventas-021-022.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');

const FORCE_PED_IDS = ['ped-ines-juego-dinos-016', 'ped-patito-noruega-017'];
const FORCE_VEN_IDS = ['ven-ines-dinos-021', 'ven-patito-noruega-022'];
const FORCE_PROD_SKUS = ['JGDINO001', 'LLNORUE001'];

function main() {
  if (!fs.existsSync(SEED)) {
    console.error('Falta seed');
    process.exit(1);
  }
  const seed = JSON.parse(fs.readFileSync(SEED, 'utf8'));
  if (!fs.existsSync(LIVE)) {
    fs.writeFileSync(LIVE, JSON.stringify(seed, null, 2) + '\n', 'utf8');
    console.log('Creado live desde seed');
    return;
  }
  const live = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  live.pedidos = Array.isArray(live.pedidos) ? live.pedidos : [];
  live.ventas = Array.isArray(live.ventas) ? live.ventas : [];
  live.productos = Array.isArray(live.productos) ? live.productos : [];
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
      console.log('+ pedido', sp.numero, sp.cliente, sp.estado);
    } else {
      live.pedidos[idx] = { ...live.pedidos[idx], ...JSON.parse(JSON.stringify(sp)) };
      n += 1;
      console.log('~ pedido', sp.numero, sp.cliente, sp.estado);
    }
  }

  for (const id of FORCE_VEN_IDS) {
    const sv = (seed.ventas || []).find((v) => v && v.id === id);
    if (!sv) continue;
    const idx = live.ventas.findIndex((v) => v && (v.id === id || v.codigo === sv.codigo));
    if (idx < 0) {
      live.ventas.push(JSON.parse(JSON.stringify(sv)));
      n += 1;
      console.log('+ venta', sv.codigo, sv.cliente, sv.montoNeto);
    } else {
      live.ventas[idx] = { ...live.ventas[idx], ...JSON.parse(JSON.stringify(sv)) };
      n += 1;
      console.log('~ venta', sv.codigo, sv.cliente, sv.montoNeto);
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
  live.meta.actualizado = new Date().toISOString();

  fs.writeFileSync(LIVE, JSON.stringify(live, null, 2) + '\n', 'utf8');

  const ines = live.ventas.find((v) => v && (v.id === 'ven-ines-dinos-021' || v.codigo === 'I000021'));
  const patito = live.ventas.find((v) => v && (v.id === 'ven-patito-noruega-022' || v.codigo === 'I000022'));
  const origenInes = String(ines?.clienteOrigen || '').toUpperCase();
  if (!ines || ines.cliente !== 'Ines Quintero' || origenInes !== 'QUINTERO' || Number(ines.montoNeto) !== 7000) {
    console.error('Fallo: I000021 debe ser Ines Quintero $7.000 (no SIE/MKOF)');
    process.exit(1);
  }
  if (/SIE|MKOF/.test(String(ines.cliente || '')) || origenInes === 'SIE' || origenInes === 'MKOF') {
    console.error('Fallo: Ines quedó asociada a SIE o MKOF');
    process.exit(1);
  }
  if (!patito || Number(patito.montoNeto) !== 4000 || Number(patito.cantidad) !== 2) {
    console.error('Fallo: I000022 debe ser Patito 2× llaveros $4.000');
    process.exit(1);
  }
  console.log('OK Ines Quintero → I000021 $7.000 · Patito → I000022 $4.000 · cambios', n);
}

main();
