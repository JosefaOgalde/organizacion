const test = require('node:test');
const assert = require('node:assert/strict');

const { addMissingForcedOrders } = require('./force-imp-fiados-012-013');

test('conserva pedidos live existentes y solo agrega los ausentes', () => {
  const seed = {
    pedidos: [
      {
        id: 'ped-gianni-soporte-010',
        numero: 'PED-010',
        cliente: 'Gianni SIE',
        estado: 'pendiente',
        fiado: true,
        ventaId: null,
      },
      {
        id: 'ped-marcia-limpiador-012',
        numero: 'PED-012',
        cliente: 'Marcia SIE',
        estado: 'pendiente',
        fiado: true,
        fechaPagoEsperada: null,
      },
      {
        id: 'ped-mel-soporte-013',
        numero: 'PED-013',
        cliente: 'Mel MKOF',
        estado: 'pendiente',
        fiado: true,
      },
    ],
  };
  const transferido = {
    id: 'ped-gianni-soporte-010',
    numero: 'PED-010',
    cliente: 'Gianni SIE',
    estado: 'transferido',
    fiado: false,
    ventaId: 'ven-gianni-017',
    transferidoEn: '2026-08-18T15:00:00.000Z',
  };
  const reprogramado = {
    id: 'pedido-local-marcia',
    numero: 'PED-012',
    cliente: 'Marcia SIE',
    estado: 'en_impresion',
    fiado: true,
    fechaPagoEsperada: '2026-08-22',
  };
  const live = {
    pedidos: [structuredClone(transferido), structuredClone(reprogramado)],
  };

  const added = addMissingForcedOrders(seed, live);

  assert.equal(added, 1);
  assert.deepEqual(live.pedidos[0], transferido);
  assert.deepEqual(live.pedidos[1], reprogramado);
  assert.deepEqual(live.pedidos[2], seed.pedidos[2]);
  assert.notEqual(live.pedidos[2], seed.pedidos[2]);
});
