#!/usr/bin/env node
'use strict';

const fs = require('node:fs');

const file = process.argv[2];

if (!file) {
  console.error('[respaldo] Falta la ruta del JSON a validar.');
  process.exit(1);
}

try {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!data || !Array.isArray(data.clientes) || !Array.isArray(data.tareas)) {
    throw new Error('debe contener arreglos "clientes" y "tareas"');
  }
  console.log(`[respaldo] JSON válido: ${data.clientes.length} clientes · ${data.tareas.length} tareas`);
} catch (error) {
  console.error(`[respaldo] JSON inválido: ${error.message}`);
  process.exit(1);
}
