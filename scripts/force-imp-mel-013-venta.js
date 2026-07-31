#!/usr/bin/env node
/** Mel MKOF PED-013 → venta I000020 $4.000 (pagado). Pisa live aunque diga fiado. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');

const PED_ID = 'ped-mel-soporte-013';
const VEN_ID = 'ven-mel-soporte-020';
const CODIGO = 'I000020';

function main() {
  if (!fs.existsSync(LIVE) && fs.existsSync(SEED)) {
    fs.copyFileSync(SEED, LIVE);
  }
  if (!fs.existsSync(LIVE)) {
    console.error('Falta impresoreando-live.json');
    process.exit(1);
  }
  const d = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  d.pedidos = Array.isArray(d.pedidos) ? d.pedidos : [];
  d.ventas = Array.isArray(d.ventas) ? d.ventas : [];
  d.meta = d.meta && typeof d.meta === 'object' ? d.meta : {};

  let ped = d.pedidos.find((p) => p && (p.id === PED_ID || p.numero === 'PED-013'));
  if (!ped) {
    ped = {
      id: PED_ID,
      numero: 'PED-013',
      fecha: '2026-07-31',
      cliente: 'Mel MKOF',
      clienteNombre: 'Mel',
      clienteOrigen: 'MKOF',
      canal: 'WhatsApp',
      items: [
        {
          sku: 'SOPCEL001',
          nombre: 'Soporte celular',
          cantidad: 1,
          precioUnitarioClp: 4000,
          costoUnitarioClp: 683.69,
          filamento: 'PLA+ negro',
          estado: 'listo',
          listos: 1,
          enImpresion: 0,
        },
      ],
      montoBruto: 4000,
      descuentoClp: 0,
      montoNeto: 4000,
      costoTotal: 683.69,
      socioRegistro: 'Ambos',
      creado: '2026-07-31T00:30:00.000Z',
    };
    d.pedidos.push(ped);
  }

  ped.estado = 'transferido';
  ped.fiado = false;
  delete ped.fechaPagoEsperada;
  ped.ventaId = VEN_ID;
  ped.transferidoEn = ped.transferidoEn || new Date().toISOString();
  ped.montoNeto = 4000;
  ped.montoBruto = 4000;
  ped.pagoNotas = 'Pagado · transferido a venta I000020';
  ped.notas =
    '1× Soporte celular negro · transferido a venta I000020 · pagado $4.000 · MKOF (Josefa)';

  const venta = {
    id: VEN_ID,
    codigo: CODIGO,
    fecha: '2026-07-31',
    cliente: 'Mel MKOF',
    clienteNombre: 'Mel',
    clienteOrigen: 'MKOF',
    descripcion: 'PED-013 · 1× Soporte celular negro · Mel MKOF',
    cantidad: 1,
    montoBruto: 4000,
    descuentoClp: 0,
    montoNeto: 4000,
    costoTotal: 683.69,
    canal: 'WhatsApp',
    notas: 'Transferido desde PED-013 · fiado cobrado · 1× Soporte celular negro · pagado $4.000',
    socioRegistro: 'Ambos',
    pedidoId: PED_ID,
    pedidoNumero: 'PED-013',
    items: [
      {
        sku: 'SOPCEL001',
        nombre: 'Soporte celular',
        cantidad: 1,
        precioUnitarioClp: 4000,
        costoUnitarioClp: 683.69,
        filamento: 'PLA+ negro',
      },
    ],
  };
  const vi = d.ventas.findIndex((v) => v && (v.id === VEN_ID || v.codigo === CODIGO));
  if (vi < 0) d.ventas.push(venta);
  else d.ventas[vi] = { ...d.ventas[vi], ...venta };

  if (Number(d.meta.ventaSeq || 0) < 20) d.meta.ventaSeq = 20;
  d.meta.actualizado = new Date().toISOString();

  fs.writeFileSync(LIVE, JSON.stringify(d, null, 2) + '\n', 'utf8');
  const stillFiado = d.pedidos.some(
    (p) => p && p.numero === 'PED-013' && p.fiado && p.estado !== 'transferido'
  );
  console.log('OK Mel → I000020 $4.000 · estado', ped.estado, '· fiado', !!ped.fiado);
  if (stillFiado) {
    console.error('AVISO: PED-013 sigue fiado');
    process.exit(1);
  }
}

main();
