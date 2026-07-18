#!/usr/bin/env node
/**
 * Refleja el panel Impresoreando (pedidos de hoy) en el calendario del organizador.
 * NO borra tareas de otros clientes (TS, ECR, JM, etc.).
 *
 *   node scripts/sync-impresoreando-organizador.js
 * Luego: http://localhost:3000/index.html?disco=1&fecha=2026-07-18&vista=dia
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ORG = path.join(ROOT, 'data', 'organizacion-live.json');
const IMP = path.join(ROOT, 'data', 'impresoreando-live.json');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const CLI = 'cli-impresoreando';
const ROL = 'rol-imp-dis';
const MADRE_ID = 'tarea-imp-pedidos-hoy';
const PANEL = '/index/clientes/impresoreando/panel/';

const EST_LABEL = {
  pendiente: 'pendiente',
  en_impresion: 'en impresión',
  listo: 'listo',
  transferido: 'transferido a venta',
};

function money(n) {
  return `$${Math.round(Number(n) || 0).toLocaleString('es-CL')}`;
}

function leerImp() {
  const p = fs.existsSync(IMP) ? IMP : SEED;
  if (!fs.existsSync(p)) {
    console.error('No hay data/impresoreando-live.json ni seed');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function nextHistorico(data) {
  let max = 0;
  for (const t of data.tareas || []) {
    if (t.clienteId !== CLI) continue;
    const n = parseInt(String(t.numeroHistorico || ''), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return max + 1;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function resumenItems(items) {
  return (items || [])
    .map((it) => `${it.cantidad || 1}× ${it.nombre || it.sku}`)
    .join(' + ');
}

function main() {
  if (!fs.existsSync(ORG)) {
    console.error('No existe data/organizacion-live.json');
    process.exit(1);
  }

  // Asegurar cliente
  require('./asegurar-impresoreando-live.js');

  const data = JSON.parse(fs.readFileSync(ORG, 'utf8'));
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
  const imp = leerImp();
  const pedidos = Array.isArray(imp.pedidos) ? imp.pedidos : [];
  const activos = pedidos.filter((p) => p.estado !== 'transferido');
  const fecha =
    (activos[0] && activos[0].fecha) ||
    (pedidos[0] && pedidos[0].fecha) ||
    new Date().toISOString().slice(0, 10);

  let hist = nextHistorico(data);

  const madreTitulo = `[IMP] Pedidos activos · ${activos.length || pedidos.length}`;
  const madreNotas =
    `Panel socios 50/50 · pedidos del live (${imp.meta?.actualizado || 'hoy'}). ` +
    `Abrir panel: ${PANEL} · Transferir a venta baja la deuda. ` +
    `PED-001 Rebe listo · PED-002 Gianni en impresión (macetero + 4× portacompleto bulldog).`;

  function upsert(tarea) {
    const i = data.tareas.findIndex((t) => t.id === tarea.id);
    if (i >= 0) {
      const prev = data.tareas[i];
      data.tareas[i] = {
        ...prev,
        ...tarea,
        completada: tarea.completada != null ? tarea.completada : prev.completada,
        numeroHistorico: prev.numeroHistorico || tarea.numeroHistorico,
      };
      console.log('Actualizada:', data.tareas[i].titulo);
    } else {
      data.tareas.push(tarea);
      console.log('Agregada:', tarea.titulo);
    }
  }

  upsert({
    id: MADRE_ID,
    titulo: madreTitulo,
    clienteId: CLI,
    rolId: ROL,
    fecha,
    horaInicio: '10:00',
    horaFin: '18:00',
    notas: madreNotas,
    prioridad: 'alta',
    completada: activos.length === 0,
    pendiente: false,
    numeroHistorico: pad(hist++),
    tipoEntregable: 'impresoreando-pedidos',
    parentId: null,
    linkPanel: PANEL,
  });

  // Quitar subtareas viejas de esta madre que ya no existan
  const idsPed = new Set(pedidos.map((p) => `tarea-imp-${p.id || p.numero}`));
  data.tareas = data.tareas.filter((t) => {
    if (t.parentId !== MADRE_ID) return true;
    return idsPed.has(t.id);
  });

  let orden = 1;
  for (const p of pedidos) {
    const tid = `tarea-imp-${p.id || p.numero}`;
    const est = EST_LABEL[p.estado] || p.estado || '—';
    const items = resumenItems(p.items);
    // Solo “transferido” cierra la subtarea; “listo” sigue visible (falta entregar/venta)
    const cerrada = p.estado === 'transferido';
    const notaExtra =
      p.estado === 'listo' ? ' · Listo — falta entregar / transferir a venta.' : '';
    upsert({
      id: tid,
      titulo: `[IMP] ${p.numero || ''} ${p.cliente || ''} · ${items}`.replace(/\s+/g, ' ').trim(),
      clienteId: CLI,
      rolId: ROL,
      fecha: p.fecha || fecha,
      horaInicio: orden === 1 ? '10:00' : '14:00',
      horaFin: orden === 1 ? '13:00' : '18:00',
      notas:
        `Estado pedido: ${est}. Total ${money(p.montoNeto)}. ` +
        `${p.notas || ''} · Panel: ${PANEL}${notaExtra}`,
      prioridad: p.estado === 'en_impresion' ? 'alta' : 'media',
      completada: cerrada,
      pendiente: false,
      numeroHistorico: pad(hist++),
      tipoEntregable: 'impresoreando-pedido',
      parentId: MADRE_ID,
      ordenHijo: orden,
      pedidoId: p.id,
      pedidoNumero: p.numero,
      pedidoEstado: p.estado,
      linkPanel: PANEL,
    });
    orden++;
  }

  data.respaldoActualizado = new Date().toISOString().slice(0, 10);
  data.meta = data.meta || {};
  data.meta.nota = [
    data.meta.nota,
    `Impresoreando pedidos sincronizados ${fecha} → madre ${MADRE_ID}.`,
  ]
    .filter(Boolean)
    .join(' · ');

  fs.writeFileSync(ORG, JSON.stringify(data, null, 2) + '\n', 'utf8');

  const impT = data.tareas.filter((t) => t.clienteId === CLI);
  console.log(`\nOK · ${impT.length} tareas Impresoreando en el organizador`);
  console.log(`Fecha: ${fecha}`);
  console.log(`Abre: http://localhost:3000/index.html?disco=1&fecha=${fecha}&vista=dia`);
  console.log(`Panel: http://localhost:3000${PANEL}`);
}

main();
