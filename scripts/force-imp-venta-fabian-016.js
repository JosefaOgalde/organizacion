#!/usr/bin/env node
/**
 * Fuerza venta I000016 Fabian MKOF en data/impresoreando-live.json
 *   node scripts/force-imp-venta-fabian-016.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');

const VENTA = {
  id: 'ven-fabian-bob-016',
  codigo: 'I000016',
  fecha: '2026-07-31',
  cliente: 'Fabian MKOF',
  clienteNombre: 'Fabian',
  clienteOrigen: 'MKOF',
  descripcion: '1× Porta Bob Esponja · Fabian MKOF',
  cantidad: 1,
  montoBruto: 7000,
  descuentoClp: 0,
  montoNeto: 7000,
  costoTotal: 998.17,
  canal: 'WhatsApp',
  notas: '1× Porta Bob Esponja · cobrado $7.000 · MKOF (Josefa)',
  socioRegistro: 'Ambos',
  items: [
    {
      sku: 'PTBOBES001',
      nombre: 'Porta Bob Esponja',
      cantidad: 1,
      precioUnitarioClp: 7000,
      costoUnitarioClp: 998.17,
      filamento: 'multicolor',
    },
  ],
};

function rebuildHistorial(d) {
  const by = {};
  for (const v of d.ventas || []) {
    const c = String(v.cliente || '—').trim() || '—';
    if (!by[c]) by[c] = { cliente: c, ventaCodigos: [], ventaIds: [], totalNeto: 0, compras: 0 };
    const h = by[c];
    h.compras += 1;
    h.totalNeto += Number(v.montoNeto || 0);
    if (v.codigo) h.ventaCodigos.push(v.codigo);
    if (v.id) h.ventaIds.push(v.id);
  }
  d.meta = d.meta && typeof d.meta === 'object' ? d.meta : {};
  d.meta.clientesHistorial = Object.values(by).sort(
    (a, b) => b.compras - a.compras || a.cliente.localeCompare(b.cliente, 'es')
  );
}

function main() {
  if (!fs.existsSync(SEED)) {
    console.error('ERROR: falta data/impresoreando-seed.json — hacé git pull en la rama correcta');
    process.exit(1);
  }
  const seed = JSON.parse(fs.readFileSync(SEED, 'utf8'));
  const fromSeed = (seed.ventas || []).find((v) => v && (v.id === VENTA.id || v.codigo === 'I000016'));
  const venta = fromSeed ? JSON.parse(JSON.stringify(fromSeed)) : { ...VENTA, items: VENTA.items.map((i) => ({ ...i })) };

  let live;
  if (!fs.existsSync(LIVE)) {
    live = JSON.parse(JSON.stringify(seed));
    console.log('Creado live desde seed');
  } else {
    live = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  }
  live.ventas = Array.isArray(live.ventas) ? live.ventas : [];
  live.meta = live.meta && typeof live.meta === 'object' ? live.meta : {};

  const idx = live.ventas.findIndex(
    (v) => v && (v.id === venta.id || v.codigo === 'I000016' || /^fabian/i.test(String(v.cliente || '')))
  );
  if (idx < 0) {
    live.ventas.push(venta);
    console.log('AGREGADA venta I000016 Fabian MKOF $7000');
  } else {
    live.ventas[idx] = { ...live.ventas[idx], ...venta, items: venta.items };
    console.log('ACTUALIZADA venta I000016 Fabian MKOF $7000');
  }

  if (Number(live.meta.ventaSeq || 0) < 16) live.meta.ventaSeq = 16;
  rebuildHistorial(live);
  live.meta.actualizado = new Date().toISOString();
  fs.writeFileSync(LIVE, JSON.stringify(live, null, 2) + '\n', 'utf8');

  const ok = live.ventas.find((v) => v && v.codigo === 'I000016');
  const hist = (live.meta.clientesHistorial || []).find((h) => /fabian/i.test(h.cliente || ''));
  console.log('OK →', ok.codigo, ok.cliente, '$' + ok.montoNeto, ok.descripcion);
  console.log('Historial →', hist ? `${hist.cliente} · ${hist.compras} compra(s) · $${hist.totalNeto}` : 'sin historial');
  console.log('Archivo →', LIVE);
  console.log('Abrí: http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=ventas');
  console.log('Filtro Origen: elegí «Todos» o «MKOF» (no dejes solo SIE).');
}

main();
