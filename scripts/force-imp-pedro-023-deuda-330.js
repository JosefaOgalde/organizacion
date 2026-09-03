#!/usr/bin/env node
/**
 * Fuerza PED-018 Pedro MKOF → I000023 $7.000 (Porta Bob Esponja)
 * y deuda Josefa → Nicolás = $330.000 (abono $100.000 ya pagado).
 *
 *   node scripts/force-imp-pedro-023-deuda-330.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');

const PED_ID = 'ped-pedro-bob-018';
const VEN_ID = 'ven-pedro-bob-023';
const CODIGO = 'I000023';

function upsert(arr, pred, obj) {
  const i = arr.findIndex(pred);
  if (i < 0) arr.push(obj);
  else arr[i] = { ...arr[i], ...obj };
}

function apply(d) {
  d.pedidos = Array.isArray(d.pedidos) ? d.pedidos : [];
  d.ventas = Array.isArray(d.ventas) ? d.ventas : [];
  d.meta = d.meta && typeof d.meta === 'object' ? d.meta : {};

  const ped = {
    id: PED_ID,
    numero: 'PED-018',
    fecha: '2026-08-31',
    cliente: 'Pedro MKOF',
    clienteNombre: 'Pedro',
    clienteOrigen: 'MKOF',
    canal: 'WhatsApp',
    items: [
      {
        sku: 'PTBOBES001',
        nombre: 'Porta Bob Esponja',
        cantidad: 1,
        precioUnitarioClp: 7000,
        costoUnitarioClp: 998.17,
        filamento: 'multicolor',
        estado: 'listo',
        listos: 1,
        enImpresion: 0,
      },
    ],
    montoBruto: 7000,
    descuentoClp: 0,
    montoNeto: 7000,
    costoTotal: 998.17,
    estado: 'transferido',
    ventaId: VEN_ID,
    notas: '1× Porta Bob Esponja · transferido a venta I000023 · pagado $7.000 · MKOF (Josefa)',
    socioRegistro: 'Ambos',
    creado: '2026-08-31T23:30:00.000Z',
    fiado: false,
    transferidoEn: '2026-08-31T23:30:00.000Z',
  };
  const ven = {
    id: VEN_ID,
    codigo: CODIGO,
    fecha: '2026-08-31',
    cliente: 'Pedro MKOF',
    clienteNombre: 'Pedro',
    clienteOrigen: 'MKOF',
    descripcion: 'PED-018 · 1× Porta Bob Esponja · Pedro MKOF',
    cantidad: 1,
    montoBruto: 7000,
    descuentoClp: 0,
    montoNeto: 7000,
    costoTotal: 998.17,
    canal: 'WhatsApp',
    notas: 'Transferido desde PED-018 · 1× Porta Bob Esponja · pagado $7.000 · MKOF (Josefa)',
    socioRegistro: 'Ambos',
    pedidoId: PED_ID,
    pedidoNumero: 'PED-018',
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

  upsert(d.pedidos, (p) => p && (p.id === PED_ID || p.numero === 'PED-018'), ped);
  upsert(d.ventas, (v) => v && (v.id === VEN_ID || v.codigo === CODIGO), ven);

  d.meta.pedidoSeq = Math.max(Number(d.meta.pedidoSeq || 0), 18);
  d.meta.ventaSeq = Math.max(Number(d.meta.ventaSeq || 0), 23);

  const gastos = (d.gastos || []).reduce((a, g) => a + Number(g.montoNeto || 0), 0);
  const capJ = (d.gastos || []).reduce(
    (a, g) => a + (/josefa/i.test(String(g.pagadoPor || '')) ? Number(g.montoNeto || 0) : 0),
    0
  );
  d.meta.capital = {
    ...(d.meta.capital || {}),
    aportadoPor: capJ > 0 ? 'Nicolás + Josefa' : 'Nicolás',
    aportadoJosefaClp: Math.round(capJ),
    aportadoNicolasClp: Math.round(gastos - capJ),
    deudaPctJosefa: 50,
    montoNetoClp: Math.round(gastos),
    abonosDeudaJosefaClp: 100000,
    deudaJosefaClp: 330000,
    deudaJosefaManual: true,
    nota: 'Abono $100.000 ya pagado a Nicolás. Deuda Josefa → Nicolás fijada en $330.000 (manual).',
  };
  d.meta.actualizado = new Date().toISOString();
}

function main() {
  if (!fs.existsSync(SEED)) {
    console.error('Falta seed');
    process.exit(1);
  }
  const seed = JSON.parse(fs.readFileSync(SEED, 'utf8'));
  apply(seed);
  fs.writeFileSync(SEED, JSON.stringify(seed, null, 2) + '\n', 'utf8');

  let live = fs.existsSync(LIVE)
    ? JSON.parse(fs.readFileSync(LIVE, 'utf8'))
    : JSON.parse(JSON.stringify(seed));
  apply(live);
  fs.writeFileSync(LIVE, JSON.stringify(live, null, 2) + '\n', 'utf8');

  const v = live.ventas.find((x) => x && x.codigo === CODIGO);
  const deuda = Number(live.meta?.capital?.deudaJosefaClp);
  if (!v || v.cliente !== 'Pedro MKOF' || Number(v.montoNeto) !== 7000) {
    console.error('Fallo venta Pedro');
    process.exit(1);
  }
  if (deuda !== 330000 || !live.meta.capital.deudaJosefaManual) {
    console.error('Fallo deuda 330000', live.meta.capital);
    process.exit(1);
  }
  console.log('OK Pedro MKOF → I000023 $7.000 · deuda Josefa→Nicolás $330.000 (abono $100.000)');
}

main();
