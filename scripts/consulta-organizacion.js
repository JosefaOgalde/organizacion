#!/usr/bin/env node
/**
 * Consulta liviana de organizacion-live.json (sin pegar el archivo al chat).
 *
 * Uso:
 *   node scripts/consulta-organizacion.js resumen
 *   node scripts/consulta-organizacion.js cliente ecr
 *   node scripts/consulta-organizacion.js buscar "hunter"
 *   node scripts/consulta-organizacion.js tarea ecr/04
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const livePath = path.join(root, 'data', 'organizacion-live.json');

function load() {
  if (!fs.existsSync(livePath)) {
    console.error('No existe data/organizacion-live.json');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(livePath, 'utf8'));
}

function tasksOf(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.tareas)) return data.tareas;
  if (Array.isArray(data.tasks)) return data.tasks;
  if (data && typeof data === 'object') {
    for (const v of Object.values(data)) {
      if (Array.isArray(v) && v.length && v[0] && (v[0].titulo || v[0].title || v[0].id)) {
        return v;
      }
    }
  }
  return [];
}

function clientsOf(data) {
  if (Array.isArray(data.clientes)) return data.clientes;
  if (Array.isArray(data.clients)) return data.clients;
  return [];
}

function norm(s) {
  return String(s || '').toLowerCase();
}

function shortTask(t) {
  return {
    id: t.id || t.tareaId || null,
    clienteId: t.clienteId || t.cliente || null,
    titulo: t.titulo || t.title || null,
    estado: t.estado || t.status || null,
    fecha: t.fecha || t.date || t.cuando || null,
    numeroHistorico: t.numeroHistorico || null,
  };
}

const [cmd, ...args] = process.argv.slice(2);
const data = load();
const tareas = tasksOf(data);
const clientes = clientsOf(data);

if (!cmd || cmd === 'resumen' || cmd === 'help') {
  const byCliente = {};
  for (const t of tareas) {
    const k = String(t.clienteId || t.cliente || 'sin-cliente');
    byCliente[k] = (byCliente[k] || 0) + 1;
  }
  console.log(JSON.stringify({
    archivo: 'data/organizacion-live.json',
    clientes: clientes.length,
    tareas: tareas.length,
    porCliente: byCliente,
    tip: 'cliente <id> | buscar <texto> | tarea <id>',
  }, null, 2));
  process.exit(0);
}

if (cmd === 'cliente') {
  const q = norm(args[0]);
  if (!q) {
    console.error('Uso: node scripts/consulta-organizacion.js cliente <id|nombre>');
    process.exit(1);
  }
  const matchCli = clientes.filter((c) =>
    norm(c.id).includes(q) ||
    norm(c.nombre).includes(q) ||
    norm(c.abreviatura).includes(q) ||
    norm(c.slug).includes(q)
  );
  const matchTasks = tareas
    .filter((t) =>
      norm(t.clienteId).includes(q) ||
      norm(t.cliente).includes(q) ||
      norm(t.titulo).includes(q)
    )
    .map(shortTask)
    .slice(0, 40);
  console.log(JSON.stringify({ clientes: matchCli.slice(0, 10), tareas: matchTasks, totalTareas: matchTasks.length }, null, 2));
  process.exit(0);
}

if (cmd === 'buscar') {
  const q = norm(args.join(' '));
  if (!q) {
    console.error('Uso: node scripts/consulta-organizacion.js buscar <texto>');
    process.exit(1);
  }
  const hits = tareas
    .filter((t) => JSON.stringify(t).toLowerCase().includes(q))
    .map(shortTask)
    .slice(0, 30);
  console.log(JSON.stringify({ query: q, resultados: hits.length, tareas: hits }, null, 2));
  process.exit(0);
}

if (cmd === 'tarea') {
  const q = norm(args[0]);
  if (!q) {
    console.error('Uso: node scripts/consulta-organizacion.js tarea <id>');
    process.exit(1);
  }
  const hit = tareas.find((t) =>
    norm(t.id) === q ||
    norm(t.tareaId) === q ||
    norm(`${t.clienteId}/${t.numeroHistorico}`) === q ||
    norm(t.titulo).includes(q)
  );
  if (!hit) {
    console.error('No encontrada');
    process.exit(1);
  }
  console.log(JSON.stringify(shortTask(hit), null, 2));
  process.exit(0);
}

console.error('Comando desconocido. Usá: resumen | cliente | buscar | tarea');
process.exit(1);
