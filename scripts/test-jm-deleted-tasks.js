#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');

global.window = global;
global.document = { addEventListener() {} };
global.sessionStorage = {
  getItem() { return null; },
  setItem() {},
  removeItem() {},
};

vm.runInThisContext(
  fs.readFileSync(path.join(ROOT, 'data', 'jm-backup-contenido.js'), 'utf8'),
  { filename: 'data/jm-backup-contenido.js' }
);

const todos = window.JM_TODO_SEED.map((todo) => ({ ...todo }));
const data = {
  version: 2,
  clientes: [{
    id: window.JM_CLI_SYNC_ID,
    ficha: { landing: { todos } },
  }],
  tareas: [{
    id: 'tarea-jm-f2-01',
    clienteId: window.JM_CLI_SYNC_ID,
    jmTodoId: 'jm-todo-01',
    completada: true,
  }],
  tareasEliminadas: [
    'tarea-jm-f2-01',
    'jm-todo-01',
    'jm-todo-02',
  ],
};

window.jmAsegurarDatosMinimos(data);

assert.equal(
  data.tareas.some((tarea) => tarea.id === 'tarea-jm-f2-01'),
  false,
  'debe retirar una tarea eliminada que ya había sido resucitada'
);
assert.equal(
  data.tareas.some((tarea) => tarea.id === 'tarea-jm-f2-02'),
  false,
  'no debe recrear una tarea marcada por el ID de su checklist'
);
assert.equal(
  data.tareas.some((tarea) => tarea.id === 'tarea-jm-f2-03'),
  true,
  'debe seguir creando tareas que nunca fueron eliminadas'
);

console.log('OK: la landing JM respeta tareas eliminadas del organizador.');
