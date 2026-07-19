#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

function puertoLibre() {
  return new Promise((resolve, reject) => {
    const socket = net.createServer();
    socket.once('error', reject);
    socket.listen(0, '127.0.0.1', () => {
      const { port } = socket.address();
      socket.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

async function esperarApi(url, proceso, salida) {
  for (let intento = 0; intento < 60; intento += 1) {
    if (proceso.exitCode != null) {
      throw new Error(`El servidor terminó antes de iniciar:\n${salida.join('')}`);
    }
    try {
      const respuesta = await fetch(url);
      if (respuesta.ok) return;
    } catch {
      // El proceso todavía está iniciando.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`La API no inició:\n${salida.join('')}`);
}

async function postJson(url, body) {
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await respuesta.json();
  assert.equal(respuesta.status, 200, JSON.stringify(json));
  return json;
}

async function main() {
  const temporal = fs.mkdtempSync(path.join(os.tmpdir(), 'imp-concurrencia-'));
  const scriptsDir = path.join(temporal, 'scripts');
  const dataDir = path.join(temporal, 'data');
  fs.mkdirSync(scriptsDir);
  fs.mkdirSync(dataDir);
  fs.copyFileSync(path.join(__dirname, 'organizacion-server.js'), path.join(scriptsDir, 'organizacion-server.js'));
  fs.writeFileSync(
    path.join(dataDir, 'impresoreando-seed.json'),
    JSON.stringify({
      meta: { actualizado: '2026-07-19T00:00:00.000Z' },
      gastos: [],
      ventas: [{ id: 'ven-base', descripcion: 'Venta base', montoNeto: 1000 }],
      pedidos: [],
    })
  );

  const port = await puertoLibre();
  const salida = [];
  const proceso = spawn(process.execPath, ['scripts/organizacion-server.js'], {
    cwd: temporal,
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  proceso.stdout.on('data', (chunk) => salida.push(String(chunk)));
  proceso.stderr.on('data', (chunk) => salida.push(String(chunk)));

  const api = `http://127.0.0.1:${port}/api/impresoreando`;
  try {
    await esperarApi(api, proceso, salida);
    const base = await fetch(api).then((respuesta) => respuesta.json());
    const idsBase = base.ventas.map((venta) => venta.id);

    await postJson(`${api}/venta`, {
      id: 'ven-concurrente',
      descripcion: 'Venta registrada desde el enlace rápido',
      montoNeto: 9999,
    });

    const guardado = await postJson(api, {
      ...base,
      _sync: { ventasBaseIds: idsBase },
    });
    assert.equal(guardado.ventasPreservadas, 1);
    assert.deepEqual(
      guardado.ventas.map((venta) => venta.id),
      ['ven-base', 'ven-concurrente']
    );

    const trasConflicto = await fetch(api).then((respuesta) => respuesta.json());
    assert.equal(trasConflicto._sync, undefined);
    assert.ok(trasConflicto.ventas.some((venta) => venta.id === 'ven-concurrente'));

    await postJson(api, {
      ...trasConflicto,
      ventas: trasConflicto.ventas.filter((venta) => venta.id !== 'ven-concurrente'),
      _sync: { ventasBaseIds: trasConflicto.ventas.map((venta) => venta.id) },
    });
    const trasBorrado = await fetch(api).then((respuesta) => respuesta.json());
    assert.equal(trasBorrado.ventas.some((venta) => venta.id === 'ven-concurrente'), false);
    assert.ok(trasBorrado.ventas.some((venta) => venta.id === 'ven-base'));

    console.log('OK: conserva ventas concurrentes y permite borrar ventas conocidas.');
  } finally {
    if (proceso.exitCode == null) {
      proceso.kill('SIGTERM');
      await new Promise((resolve) => proceso.once('exit', resolve));
    }
    fs.rmSync(temporal, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
