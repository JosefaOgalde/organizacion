#!/usr/bin/env node
/**
 * Reinversión de caja → tab Operación (no capital de socios):
 * soquetes $22.254 · filamento dorado/plateado/transparente $42.970 (ML 12 ago)
 * · insumos $23.493 · Cine/Hidalgo $41.936
 * Caja = ventas − op → alinea con saldo ML (Rebe HP $8.000 + anuncio IG $920)
 *
 *   node scripts/force-imp-gastos-caja-ventas.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');
const FECHA = '2026-08-11';
const FECHA_FIL = '2026-08-12';

const OLD_GAS_IDS = [
  'gas-soquetes-ventas-22254',
  'gas-filamento-dorado-plateado-19429',
  'gas-filamento-dorado-plateado-transparente-42970',
  'gas-insumos-ventas-6381',
  'gas-insumos-ventas-24493',
  'gas-insumos-ventas-23493',
  'gas-cine-hidalgo-41936',
  'gas-anuncio-instagram-920',
];

const OLD_OP_IDS = [
  'op-filamento-dorado-plateado-19429',
  'op-insumos-ventas-6381',
  'op-insumos-ventas-24493',
];

const OPS = [
  {
    id: 'op-soquetes-ventas-22254',
    fecha: FECHA,
    categoria: 'repuesto',
    descripcion: 'Soquetes (operación · caja ventas)',
    montoNeto: 22254,
    notas: 'Reinversión de caja de ventas · no es capital de socios · nadie se debe.',
    socioRegistro: 'Ambos',
    pagadoPor: 'Ventas',
    pagadoConVentas: true,
  },
  {
    id: 'op-filamento-dorado-plateado-transparente-42970',
    fecha: FECHA_FIL,
    categoria: 'filamento',
    descripcion: 'Filamento dorado, plateado y transparente (operación · caja ventas)',
    montoNeto: 42970,
    notas:
      'ML #2000014506093733 · 12 ago · 3 u. · Mercado Pago · reinversión de ganancias · no es capital de socios.',
    socioRegistro: 'Ambos',
    pagadoPor: 'Ventas',
    pagadoConVentas: true,
  },
  {
    id: 'op-insumos-ventas-23493',
    fecha: FECHA,
    categoria: 'insumo',
    descripcion: 'Insumos (operación · caja ventas)',
    montoNeto: 23493,
    notas:
      'Reinversión de caja · Insumos $23.493 (ajuste tras Rebe HP cobrado $8.000 + anuncio IG) · no es capital de socios.',
    socioRegistro: 'Ambos',
    pagadoPor: 'Ventas',
    pagadoConVentas: true,
  },
  {
    id: 'op-cine-hidalgo-41936',
    fecha: FECHA,
    categoria: 'otro',
    descripcion: 'Cine / Hidalgo (operación · caja ventas)',
    montoNeto: 41936,
    notas: 'Reinversión de caja · Cine / Hidalgo $41.936 · no es capital de socios.',
    socioRegistro: 'Ambos',
    pagadoPor: 'Ventas',
    pagadoConVentas: true,
  },
  {
    id: 'op-anuncio-instagram-920',
    fecha: '2026-08-13',
    categoria: 'ads',
    descripcion: 'Anuncio Instagram (operación · caja ventas)',
    montoNeto: 920,
    notas: 'Pauta IG @impresoreando · $920 · pagado con caja de ventas · no es capital de socios.',
    socioRegistro: 'Ambos',
    pagadoPor: 'Ventas',
    pagadoConVentas: true,
  },
];

function upsertOp(d, reg) {
  d.operacion = Array.isArray(d.operacion) ? d.operacion : [];
  const i = d.operacion.findIndex((o) => o && o.id === reg.id);
  if (i < 0) d.operacion.push(JSON.parse(JSON.stringify(reg)));
  else d.operacion[i] = { ...d.operacion[i], ...JSON.parse(JSON.stringify(reg)) };
}

function apply(d) {
  d.meta = d.meta && typeof d.meta === 'object' ? d.meta : {};
  d.gastos = Array.isArray(d.gastos) ? d.gastos : [];
  d.gastos = d.gastos.filter(
    (g) => g && !OLD_GAS_IDS.includes(g.id) && !OPS.some((o) => o.id === g.id)
  );
  d.operacion = Array.isArray(d.operacion) ? d.operacion : [];
  d.operacion = d.operacion.filter((o) => o && !OLD_OP_IDS.includes(o.id));
  for (const o of OPS) upsertOp(d, o);

  const rein = (d.operacion || [])
    .filter((o) => o && o.pagadoConVentas)
    .reduce((s, o) => s + Number(o.montoNeto || 0), 0);
  const ventas = (d.ventas || []).reduce((s, v) => s + Number(v.montoNeto || 0), 0);
  const teorico = Math.max(0, ventas - rein);
  d.meta.caja = {
    saldoDeclaradoClp: teorico,
    fecha: FECHA_FIL,
    nota: 'Saldo teórico = ventas − operación pagada con ventas · actualizado tras filamento ML $42.970',
  };
  d.meta.actualizado = new Date().toISOString();
  return d;
}

function writeJson(file, d) {
  fs.writeFileSync(file, JSON.stringify(d, null, 2) + '\n', 'utf8');
}

function esRein(x) {
  return !!(x && (x.pagadoConVentas === true || /^ventas$/i.test(String(x.pagadoPor || ''))));
}

function main() {
  if (!fs.existsSync(SEED)) {
    console.error('Falta seed');
    process.exit(1);
  }
  writeJson(SEED, apply(JSON.parse(fs.readFileSync(SEED, 'utf8'))));
  if (!fs.existsSync(LIVE)) {
    writeJson(LIVE, JSON.parse(fs.readFileSync(SEED, 'utf8')));
    console.log('Creado live desde seed');
  } else {
    writeJson(LIVE, apply(JSON.parse(fs.readFileSync(LIVE, 'utf8'))));
  }
  const live = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  const reinG = (live.gastos || []).filter(esRein).reduce((s, g) => s + Number(g.montoNeto || 0), 0);
  const reinO = (live.operacion || []).filter(esRein).reduce((s, g) => s + Number(g.montoNeto || 0), 0);
  const rein = reinG + reinO;
  const ventas = (live.ventas || []).reduce((s, v) => s + Number(v.montoNeto || 0), 0);
  const teorico = ventas - rein;
  const decl = Number(live.meta?.caja?.saldoDeclaradoClp || 0);
  console.log(
    `OK · ventas $${ventas} − operación caja $${rein} (gastos $${reinG} + op $${reinO}) = teórico $${teorico} · declarado $${decl} · diff $${teorico - decl}`
  );
}

main();
