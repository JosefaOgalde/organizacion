#!/usr/bin/env node
/**
 * Inyecta I000016 Fabian sí o sí en impresoreando-live.json
 * y muestra verificación en consola.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');

const FABIAN = {
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

function main() {
  console.log('ROOT =', ROOT);
  console.log('LIVE =', LIVE);
  console.log('SEED exists =', fs.existsSync(SEED));
  console.log('LIVE exists =', fs.existsSync(LIVE));

  let live;
  if (fs.existsSync(LIVE)) {
    live = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  } else if (fs.existsSync(SEED)) {
    live = JSON.parse(fs.readFileSync(SEED, 'utf8'));
    console.log('Live no existía → copiado desde seed');
  } else {
    console.error('ERROR: no hay seed ni live');
    process.exit(1);
  }

  live.ventas = Array.isArray(live.ventas) ? live.ventas : [];
  live.meta = live.meta && typeof live.meta === 'object' ? live.meta : {};

  // Si hay seed, mezclar TODAS las ventas del seed que falten por código.
  if (fs.existsSync(SEED)) {
    const seed = JSON.parse(fs.readFileSync(SEED, 'utf8'));
    const byCod = new Map(
      live.ventas.filter((v) => v && v.codigo).map((v) => [String(v.codigo).toUpperCase(), v])
    );
    for (const sv of seed.ventas || []) {
      if (!sv || !sv.codigo) continue;
      const key = String(sv.codigo).toUpperCase();
      if (!byCod.has(key)) {
        live.ventas.push(JSON.parse(JSON.stringify(sv)));
        byCod.set(key, sv);
        console.log('+ venta seed', sv.codigo, sv.cliente);
      }
    }
  }

  const idx = live.ventas.findIndex(
    (v) =>
      v &&
      (v.id === FABIAN.id ||
        String(v.codigo || '').toUpperCase() === 'I000016' ||
        /^fabian\b/i.test(String(v.cliente || '')))
  );
  if (idx < 0) {
    live.ventas.push(JSON.parse(JSON.stringify(FABIAN)));
    console.log('AGREGADA Fabian I000016');
  } else {
    live.ventas[idx] = { ...live.ventas[idx], ...JSON.parse(JSON.stringify(FABIAN)) };
    console.log('SOBRESCRITA Fabian I000016 en índice', idx);
  }

  // Historial
  const by = {};
  for (const v of live.ventas) {
    const c = String(v.cliente || '—').trim() || '—';
    if (!by[c]) by[c] = { cliente: c, ventaCodigos: [], ventaIds: [], totalNeto: 0, compras: 0 };
    by[c].compras += 1;
    by[c].totalNeto += Number(v.montoNeto || 0);
    if (v.codigo) by[c].ventaCodigos.push(v.codigo);
    if (v.id) by[c].ventaIds.push(v.id);
  }
  live.meta.clientesHistorial = Object.values(by).sort(
    (a, b) => b.compras - a.compras || a.cliente.localeCompare(b.cliente, 'es')
  );
  live.meta.ventaSeq = Math.max(16, Number(live.meta.ventaSeq || 0));
  live.meta.actualizado = new Date().toISOString();

  fs.writeFileSync(LIVE, JSON.stringify(live, null, 2) + '\n', 'utf8');

  const fab = live.ventas.find((v) => v && v.codigo === 'I000016');
  const codigos = live.ventas.map((v) => v.codigo).filter(Boolean).sort();
  console.log('');
  console.log('=== VERIFICACIÓN ===');
  console.log('Total ventas:', live.ventas.length);
  console.log('Códigos:', codigos.join(', '));
  console.log('Fabian:', fab ? JSON.stringify({ codigo: fab.codigo, cliente: fab.cliente, monto: fab.montoNeto }, null, 0) : 'NULL');
  console.log('Historial Fabian:', (live.meta.clientesHistorial || []).find((h) => /fabian/i.test(h.cliente)));
  console.log('Bytes live:', fs.statSync(LIVE).size);
  if (!fab) {
    console.error('FALLÓ la inyección');
    process.exit(1);
  }
  console.log('OK — Fabian quedó en el archivo live');
}

main();
