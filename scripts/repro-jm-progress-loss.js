#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const LOG_PATH = '/opt/cursor/logs/debug.log';
const FIXED = 'OK · cerrado 25-jul 2026';
const posts = [];

global.window = global;
global.location = { pathname: '/index.html', search: '' };
global.document = { addEventListener() {} };
global.sessionStorage = {
  getItem() { return null; },
  setItem() {},
  removeItem() {},
};
global.fetch = async (url, options = {}) => {
  if (String(url).startsWith('/api/organizacion-config')) {
    return { ok: true, status: 200, json: async () => ({ authRequired: false }) };
  }
  if (String(url) === '/api/organizacion' && options.method === 'POST') {
    posts.push(JSON.parse(options.body));
    return { ok: true, status: 200, json: async () => ({ ok: true }) };
  }
  return { ok: false, status: 404, text: async () => '', json: async () => null };
};

window.__agentDebugLog = (payload) => {
  // #region agent log
  fs.appendFileSync(LOG_PATH, JSON.stringify(payload) + '\n');
  // #endregion
};

function load(relativePath) {
  const filename = path.join(ROOT, relativePath);
  vm.runInThisContext(fs.readFileSync(filename, 'utf8'), { filename });
}

function fixture({ comentario = 'NOTA-USUARIO-REPRO', incluirProgreso = true, incluirTodos = true } = {}) {
  const todo = {
    id: 'jm-todo-01',
    titulo: 'Auditoría menú actual + mapa de navegación',
  };
  const tarea = {
    id: 'tarea-jm-f2-01',
    clienteId: 'cli-joyas-mercury',
    jmTodoId: 'jm-todo-01',
  };
  if (incluirProgreso) {
    todo.completada = false;
    todo.comentario = comentario;
    tarea.completada = false;
    tarea.notas = comentario;
  }
  return {
    version: 2,
    clientes: [{
      id: 'cli-joyas-mercury',
      ficha: {
        landing: incluirTodos ? { todos: [todo] } : {},
      },
    }],
    tareas: [tarea],
  };
}

function target(data) {
  return {
    todo: data.clientes[0].ficha.landing.todos[0],
    tarea: data.tareas[0],
  };
}

async function main() {
  load('data/jm-backup-contenido.js');
  load('index/assets/organizacion-persist.js');

  const organizador = fixture();
  window.jmAplicarProgresoChecklist(organizador);
  window.jmSyncLandingDesdeTareas(organizador);

  const landing = fixture();
  window.persistOrganizacionToDisk(landing);
  window.jmAplicarProgresoChecklist(landing);
  window.jmSyncTareasDesdeLanding(landing);

  await new Promise((resolve) => setTimeout(resolve, 750));

  const org = target(organizador);
  const sent = posts[0] && target(posts[0]);
  assert.deepEqual(
    [org.todo.completada, org.todo.comentario, org.tarea.completada, org.tarea.notas],
    [false, 'NOTA-USUARIO-REPRO', false, 'NOTA-USUARIO-REPRO'],
    'el organizador debe conservar el progreso explícito del usuario'
  );
  assert.deepEqual(
    [sent?.todo.completada, sent?.todo.comentario, sent?.tarea.completada, sent?.tarea.notas],
    [false, 'NOTA-USUARIO-REPRO', false, 'NOTA-USUARIO-REPRO'],
    'el POST diferido debe conservar el progreso explícito del usuario'
  );

  const vacioExplicito = fixture({ comentario: '' });
  window.jmAplicarProgresoChecklist(vacioExplicito);
  const vacio = target(vacioExplicito);
  assert.deepEqual(
    [vacio.todo.completada, vacio.todo.comentario, vacio.tarea.completada, vacio.tarea.notas],
    [false, '', false, ''],
    'un comentario vaciado explícitamente también es estado de usuario'
  );

  const sinCampos = fixture({ incluirProgreso: false });
  window.jmAplicarProgresoChecklist(sinCampos);
  const migrado = target(sinCampos);
  assert.deepEqual(
    [migrado.todo.completada, migrado.todo.comentario, migrado.tarea.completada, migrado.tarea.notas],
    [true, FIXED, true, FIXED],
    'los registros que no tienen campos de progreso deben migrarse'
  );

  const sinChecklist = fixture({ incluirProgreso: false, incluirTodos: false });
  window.jmAplicarProgresoChecklist(sinChecklist);
  const todoCreado = sinChecklist.clientes[0].ficha.landing.todos[0];
  assert.deepEqual(
    [todoCreado.completada, todoCreado.comentario],
    [true, FIXED],
    'un checklist inexistente debe crearse con el progreso confirmado'
  );

  console.log('OK: 4 regresiones JM — estado explícito y POST preservados; datos sin progreso migrados.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
