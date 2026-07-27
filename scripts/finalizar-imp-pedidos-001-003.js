#!/usr/bin/env node
/**
 * Finaliza pedidos Impresoreando PED-001 / PED-002 / PED-003 + madre.
 *
 *   node scripts/finalizar-imp-pedidos-001-003.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const LIVE = path.join(DATA, 'organizacion-live.json');
const FILES = [
  LIVE,
  path.join(DATA, 'organizacion-respaldo-2026-07-27.json'),
  path.join(DATA, 'organizacion-respaldo-2026-07-27-aplicado.json'),
  path.join(DATA, 'organizacion-respaldo-2026-07-24.json'),
];

const IDS = new Set([
  'tarea-imp-pedidos-hoy',
  'tarea-imp-ped-rebe-plmons-001',
  'tarea-imp-ped-gianni-bulldog-002',
  'tarea-imp-ped-juan-naves-003',
  'tarea-imp-ped-nave-003',
  'tarea-imp-ped-por-confirmar-003',
]);

function matchPedido(t) {
  if (IDS.has(t.id)) return true;
  const ped = String(t.pedidoNumero || '');
  if (['PED-001', 'PED-002', 'PED-003'].includes(ped)) return true;
  const tit = String(t.titulo || '');
  if (/PED-00[123]/i.test(tit)) return true;
  if (t.id === 'tarea-imp-pedidos-hoy' || /Pedidos activos/i.test(tit)) return true;
  return false;
}

function ensurePed003(tareas) {
  const id = 'tarea-imp-ped-juan-naves-003';
  if (tareas.some((t) => t.id === id || t.pedidoNumero === 'PED-003' || /PED-003/i.test(t.titulo || ''))) {
    return;
  }
  tareas.push({
    id,
    titulo: '[IMP] PED-003 Juan · 1× Nave Espacial Horizontal + 1× Nave Espacial Vertical',
    clienteId: 'cli-impresoreando',
    rolId: 'rol-imp-dis',
    fecha: '2026-07-19',
    horaInicio: '10:00',
    horaFin: '13:00',
    notas: 'Estado: transferido a venta. Finalizada 27 jul a pedido de la usuaria.',
    prioridad: 'media',
    completada: true,
    pendiente: false,
    numeroHistorico: '04',
    tipoEntregable: 'impresoreando-pedido',
    parentId: 'tarea-imp-pedidos-hoy',
    pedidoNumero: 'PED-003',
    pedidoId: 'ped-naves-espaciales-003',
    agendaFijada: true,
  });
  console.log('[creada finalizada] PED-003');
}

function finalizeFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
  ensurePed003(data.tareas);
  let n = 0;
  for (const t of data.tareas) {
    if (!matchPedido(t)) continue;
    const antes = t.completada === true;
    t.completada = true;
    t.pendiente = false;
    if (t.id === 'tarea-imp-pedidos-hoy') {
      t.titulo = '[IMP] Pedidos activos · 0';
      t.notas =
        'Sin pedidos activos (PED-001/002/003 finalizados). Panel: /index/clientes/impresoreando/panel/';
    }
    if (!antes) {
      n += 1;
      console.log('[finalizada]', path.basename(filePath), t.titulo);
    } else {
      console.log('[ya ok]', path.basename(filePath), t.titulo);
    }
  }
  data.respaldoActualizado = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  return true;
}

for (const f of FILES) finalizeFile(f);
console.log('Listo. Recargá organizador: http://127.0.0.1:8000/index.html?disco=1&fecha=2026-07-18');
