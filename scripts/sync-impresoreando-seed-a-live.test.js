const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const SCRIPT = path.join(__dirname, 'sync-impresoreando-seed-a-live.js');

function ejecutarSync(seed, live) {
  const source = fs.readFileSync(SCRIPT, 'utf8');
  let resultado = null;
  const fakeFs = {
    existsSync: () => true,
    readFileSync: (file) =>
      JSON.stringify(String(file).endsWith('impresoreando-seed.json') ? seed : live),
    mkdirSync: () => {},
    writeFileSync: (_file, data) => {
      resultado = JSON.parse(data);
    },
  };

  vm.runInNewContext(source, {
    __dirname,
    console: { error: () => {}, log: () => {} },
    process,
    require: (moduleName) => (moduleName === 'fs' ? fakeFs : require(moduleName)),
  });

  return resultado;
}

test('elimina el duplicado histórico sin borrar otro PED-012', () => {
  const seed = {
    meta: {},
    productos: [],
    pedidos: [],
    ventas: [],
    gastos: [],
    impresoras: [],
  };
  const pedidoLegitimo = {
    id: 'ped-cliente-real-012',
    numero: 'PED-012',
    cliente: 'Cliente real',
    estado: 'pendiente',
  };
  const live = {
    meta: { pedidoSeq: 12 },
    productos: [],
    pedidos: [
      { id: 'ped-ele-pesa-012', numero: 'PED-012', cliente: 'Ele SIE' },
      pedidoLegitimo,
    ],
    ventas: [],
    gastos: [],
    impresoras: [],
  };

  const resultado = ejecutarSync(seed, live);

  assert.deepEqual(resultado.pedidos, [pedidoLegitimo]);
});
