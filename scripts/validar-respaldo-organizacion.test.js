'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.join(__dirname, '..');
const VALIDATOR = path.join(__dirname, 'validar-respaldo-organizacion.js');

function runValidator(contents) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'validar-respaldo-'));
  const file = path.join(dir, 'respaldo.json');
  fs.writeFileSync(file, contents, 'utf8');
  const result = spawnSync(process.execPath, [VALIDATOR, file], { encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  return result;
}

test('acepta un respaldo de organización válido', () => {
  const result = runValidator(JSON.stringify({ clientes: [], tareas: [] }));

  assert.equal(result.status, 0);
  assert.match(result.stdout, /JSON válido/);
});

test('rechaza JSON truncado', () => {
  const result = runValidator('{"clientes":[],"tareas":[');

  assert.equal(result.status, 1);
  assert.match(result.stderr, /JSON inválido/);
});

test('rechaza JSON sin la estructura de organización', () => {
  const result = runValidator(JSON.stringify({ clientes: [] }));

  assert.equal(result.status, 1);
  assert.match(result.stderr, /"clientes" y "tareas"/);
});

test('el importador aborta tras validar y antes de copiar', () => {
  const bat = fs.readFileSync(path.join(ROOT, 'IMPORTAR-RESPALDO.bat'), 'utf8');
  const validation = bat.indexOf('node scripts\\validar-respaldo-organizacion.js "%ORIGEN%"');
  const abort = bat.indexOf('if errorlevel 1 (', validation);
  const firstCopy = bat.indexOf('copy /Y "%ORIGEN%"');

  assert.ok(validation >= 0, 'falta ejecutar el validador');
  assert.ok(abort > validation, 'falta abortar si el validador falla');
  assert.ok(firstCopy > abort, 'no se debe copiar antes de validar');
});
