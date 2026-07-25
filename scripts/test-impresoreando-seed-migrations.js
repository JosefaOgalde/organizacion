#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const panelPath = path.join(
  __dirname,
  '..',
  'index',
  'clientes',
  'impresoreando',
  'panel',
  'panel.js'
);
const marker =
  "  document.querySelectorAll('#imp-tabs button').forEach((btn) => {";
const source = fs.readFileSync(panelPath, 'utf8');
assert(source.includes(marker), 'No se encontró el punto de carga de pruebas en panel.js');

const instrumented = source.replace(
  marker,
  `  globalThis.__impresoreandoMigraciones = {
    agruparGastosPorRegistro,
    asegurarVentasSeed,
  };
  return;

${marker}`
);
const context = { console };
context.globalThis = context;
vm.runInNewContext(instrumented, context, { filename: panelPath });

const { agruparGastosPorRegistro, asegurarVentasSeed } =
  context.__impresoreandoMigraciones;

{
  const gastoExistente = {
    id: 'gas-manual-ml-21',
    fecha: '2026-07-21',
    proveedor: 'Mercado Libre',
    montoNeto: 40970,
    ordenId: '2000014122225779',
    items: [],
  };
  const gastoDuplicadoPorSeed = {
    id: 'gas-reg-mercadolibre-2026-07-21',
    fecha: '2026-07-21',
    proveedor: 'Mercado Libre',
    montoNeto: 40970,
    ordenId: '2000014122225779',
    items: [],
  };
  const data = { gastos: [gastoExistente, gastoDuplicadoPorSeed] };

  agruparGastosPorRegistro(data);

  const mismaOrden = data.gastos.filter(
    (g) => g.ordenId === '2000014122225779'
  );
  assert.equal(mismaOrden.length, 1, 'Una orden existente no debe duplicarse');
  assert.equal(
    mismaOrden[0].id,
    gastoExistente.id,
    'La migración debe conservar el registro live existente'
  );
  assert.equal(
    data.gastos.some((g) => g.id === gastoDuplicadoPorSeed.id),
    false,
    'Debe retirar el duplicado que una migración anterior ya insertó'
  );
}

{
  const ventaExistente = {
    id: 'ven-transferida-desde-ui',
    fecha: '2026-07-18',
    cliente: 'Gianni corregido',
    montoBruto: 12000,
    montoNeto: 12000,
    pedidoId: 'ped-gianni-bulldog-002',
    pedidoNumero: 'PED-002',
  };
  const pedidoExistente = {
    id: 'ped-gianni-bulldog-002',
    numero: 'PED-002',
    cliente: 'Gianni corregido',
    estado: 'transferido',
    ventaId: 'ven-gianni-bulldog-002',
    montoBruto: 12000,
    montoNeto: 12000,
    notas: 'Monto corregido en el live',
    transferidoEn: '2026-07-22T12:00:00.000Z',
  };
  const ventaDuplicadaPorSeed = {
    id: 'ven-gianni-bulldog-002',
    fecha: '2026-07-18',
    cliente: 'Gianni',
    montoBruto: 15000,
    montoNeto: 15000,
    pedidoId: 'ped-gianni-bulldog-002',
    pedidoNumero: 'PED-002',
  };
  const data = {
    ventas: [ventaExistente, ventaDuplicadaPorSeed],
    pedidos: [pedidoExistente],
  };

  asegurarVentasSeed(data);

  assert.equal(
    data.ventas.filter(
      (v) => v.pedidoId === 'ped-gianni-bulldog-002'
    ).length,
    1,
    'Un pedido transferido no debe generar una segunda venta'
  );
  assert.equal(
    data.ventas.some((v) => v.id === 'ven-gianni-bulldog-002'),
    false,
    'No debe insertarse el id seed si el pedido ya tiene venta'
  );
  assert.equal(ventaExistente.montoNeto, 12000, 'Debe conservar el monto corregido');
  assert.equal(
    ventaExistente.cliente,
    'Gianni corregido',
    'Debe conservar el cliente corregido'
  );
  assert.equal(
    pedidoExistente.ventaId,
    ventaExistente.id,
    'Debe conservar el vínculo a la venta real'
  );
  assert.equal(pedidoExistente.montoNeto, 12000, 'Debe conservar el total del pedido');
  assert.equal(
    pedidoExistente.notas,
    'Monto corregido en el live',
    'Debe conservar las notas del pedido'
  );
}

{
  const ventaCorregida = {
    id: 'ven-cata-gatos-001',
    fecha: '2026-07-23',
    cliente: 'Catalina',
    montoBruto: 9000,
    montoNeto: 9000,
    items: [],
  };
  const data = { ventas: [ventaCorregida], pedidos: [] };

  asegurarVentasSeed(data);

  assert.equal(ventaCorregida.montoNeto, 9000, 'No debe revertir un monto live');
  assert.equal(ventaCorregida.montoBruto, 9000, 'No debe revertir el bruto live');
  assert.equal(ventaCorregida.cliente, 'Catalina', 'No debe revertir el cliente live');
}

{
  const data = { ventas: [], pedidos: [] };

  asegurarVentasSeed(data);

  assert(
    data.ventas.some((v) => v.id === 'ven-gianni-bulldog-002'),
    'La venta seed debe insertarse cuando realmente falta'
  );
}

console.log('OK: migraciones Impresoreando preservan gastos y ventas live');
