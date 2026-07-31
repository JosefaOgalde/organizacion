#!/usr/bin/env node
/**
 * Fuerza PED-010/012/013/014 (fiados) + venta I000016 + producto LLONEP001 → live.
 * Uso si el panel no muestra los fiados tras git pull:
 *   node scripts/force-imp-fiados-012-013.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');

const FORCE_PED_IDS = [
  'ped-gianni-soporte-010',
  'ped-marcia-limpiador-012',
  'ped-mel-soporte-013',
  'ped-cata-onepiece-014',
];
const FORCE_VEN_IDS = ['ven-fabian-bob-016'];
const FORCE_PROD_IDS = ['prod-llavero-one-piece'];

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

  // Quitar solo el id viejo de Ele, nunca el PED-012 vigente de Marcia.
  live.pedidos = live.pedidos.filter((p) => p && p.id !== 'ped-ele-pesa-012');

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
      console.log('+ pedido', sp.numero, sp.cliente);
    } else {
      live.pedidos[idx] = { ...live.pedidos[idx], ...JSON.parse(JSON.stringify(sp)) };
      n += 1;
      console.log('~ pedido', sp.numero, sp.cliente);
    }
  }

  for (const id of FORCE_VEN_IDS) {
    const sv = (seed.ventas || []).find((v) => v && v.id === id);
    if (!sv) continue;
    const idx = live.ventas.findIndex((v) => v && v.id === id);
    if (idx < 0) {
      live.ventas.push(JSON.parse(JSON.stringify(sv)));
      n += 1;
      console.log('+ venta', sv.codigo);
    }
  }

  // Productos canónicos (limpia brochas + llavero One Piece)
  for (const forceId of FORCE_PROD_IDS.concat(['prod-limpiador-brochas'])) {
    const sp = (seed.productos || []).find((p) => p && p.id === forceId);
    if (!sp) continue;
    const idx = live.productos.findIndex(
      (p) => p && (p.id === sp.id || (sp.sku && p.sku === sp.sku))
    );
    if (idx < 0) {
      live.productos.push(JSON.parse(JSON.stringify(sp)));
      n += 1;
      console.log('+ producto', sp.sku || sp.id);
    } else if (FORCE_PROD_IDS.includes(forceId)) {
      live.productos[idx] = { ...live.productos[idx], ...JSON.parse(JSON.stringify(sp)) };
      n += 1;
      console.log('~ producto', sp.sku || sp.id);
    }
  }
  // Fallback si el seed local aún no trae LLONEP001
  if (!live.productos.some((p) => p && (p.id === 'prod-llavero-one-piece' || p.sku === 'LLONEP001'))) {
    live.productos.push({
      id: 'prod-llavero-one-piece',
      sku: 'LLONEP001',
      nombre: 'Llavero One Piece',
      activo: true,
      impresoraId: 'imp-centauri-carbon-2',
      filamentoGramos: 0,
      costoFilamentoKgClp: 16829,
      horasImpresion: 0,
      minutosPintado: 0,
      unidadesMetal: 1,
      unidadesBolsa: 1,
      precioVentaSugeridoClp: 2000,
      pendienteCosto: true,
      editadoLocal: true,
      notas:
        'Llavero One Piece (Mugiwara / sombrero de paja). Sin registro slicer aún — falta g/h para costo. Incluye $50 argolla. PVP ref. ~$2.000/u (pedido Cata 3× $5.000).',
    });
    n += 1;
    console.log('+ producto LLONEP001 (fallback)');
  }

  const maxPed = live.pedidos.reduce((m, p) => {
    const num = Number(String(p.numero || '').replace(/\D/g, '')) || 0;
    return Math.max(m, num);
  }, 0);
  if (Number(live.meta.pedidoSeq || 0) < maxPed) live.meta.pedidoSeq = maxPed;
  const maxVen = live.ventas.reduce((m, v) => {
    const num = Number(String(v.codigo || '').replace(/^I0*/, '') || 0);
    return Number.isFinite(num) ? Math.max(m, num) : m;
  }, 0);
  if (Number(live.meta.ventaSeq || 0) < maxVen) live.meta.ventaSeq = maxVen;

  live.meta.actualizado = new Date().toISOString();
  fs.writeFileSync(LIVE, JSON.stringify(live, null, 2) + '\n', 'utf8');
  const fiados = live.pedidos.filter((p) => p.fiado && p.estado !== 'transferido');
  console.log(
    `OK (+${n}) · fiados activos:`,
    fiados.map((p) => `${p.numero} ${p.cliente} $${p.montoNeto}`).join(' · ')
  );
}

main();
