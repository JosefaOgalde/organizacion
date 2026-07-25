#!/usr/bin/env node
/**
 * Sincroniza pedidos Impresoreando → tareas del organizador.
 * Pedidos transferidos → tarea completada (no cuentan como activos).
 *
 * Uso:
 *   node scripts/sync-impresoreando-pedidos-organizacion.js
 *   node scripts/sync-impresoreando-pedidos-organizacion.js --also-respaldo
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IMP_LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');
const IMP_SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const ORG_LIVE = path.join(ROOT, 'data', 'organizacion-live.json');
const ORG_RESPALDO = path.join(ROOT, 'data', 'organizacion-respaldo-2026-07-21.json');

const MADRE_ID = 'tarea-imp-pedidos-hoy';
const CLI = 'cli-impresoreando';
const ROL = 'rol-imp-dis';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function loadImp() {
  const file = fs.existsSync(IMP_LIVE) ? IMP_LIVE : IMP_SEED;
  if (!fs.existsSync(file)) throw new Error('Falta impresoreando live/seed');
  return { data: readJson(file), file };
}

function pedidoActivo(estado) {
  return ['pendiente', 'listo', 'en_impresion'].includes(estado || 'pendiente');
}

function itemsTxt(ped) {
  return (ped.items || [])
    .map((it) => `${it.cantidad || 1}× ${it.nombre || it.sku || 'ítem'}`)
    .join(' + ');
}

function money(n) {
  return Number(n || 0).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });
}

function taskIdForPedido(ped) {
  const map = {
    'ped-rebe-plmons-001': 'tarea-imp-ped-rebe-plmons-001',
    'ped-gianni-bulldog-002': 'tarea-imp-ped-gianni-bulldog-002',
    'ped-naves-espaciales-003': 'tarea-imp-ped-juan-naves-003',
  };
  if (map[ped.id]) return map[ped.id];
  const slug = String(ped.numero || ped.id || 'x')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  return `tarea-imp-ped-${slug}`;
}

function syncOrgFile(orgPath, pedidos, impActualizado) {
  if (!fs.existsSync(orgPath)) {
    console.log('[sync-imp] Skip (no existe):', path.basename(orgPath));
    return false;
  }
  const org = readJson(orgPath);
  org.tareas = Array.isArray(org.tareas) ? org.tareas : [];
  let changed = false;

  const activos = pedidos.filter((p) => pedidoActivo(p.estado));
  const nActivos = activos.length;
  const resumenActivos = activos
    .map((p) => `${p.numero} ${p.cliente || ''} ${p.estado}`)
    .join(' · ');

  let madre = org.tareas.find((t) => t && t.id === MADRE_ID);
  const madreTitulo = `[IMP] Pedidos activos · ${nActivos}`;
  const madreNotas =
    nActivos === 0
      ? `Sin pedidos activos. Panel: /index/clientes/impresoreando/panel/ · Imp live ${impActualizado || '—'}`
      : `Panel socios 50/50 · ${resumenActivos}. Abrir panel: /index/clientes/impresoreando/panel/ · Transferir a venta baja la deuda. Imp live ${impActualizado || '—'}`;

  if (!madre) {
    if (nActivos === 0) {
      // no crear madre vacía
    } else {
      madre = {
        id: MADRE_ID,
        titulo: madreTitulo,
        clienteId: CLI,
        rolId: ROL,
        fecha: (activos[0] && activos[0].fecha) || new Date().toISOString().slice(0, 10),
        horaInicio: '10:00',
        horaFin: '18:00',
        notas: madreNotas,
        prioridad: 'alta',
        completada: false,
        pendiente: false,
        numeroHistorico: '01',
        tipoEntregable: 'impresoreando-pedidos',
        parentId: null,
        linkPanel: '/index/clientes/impresoreando/panel/',
        fechaFin: (activos[0] && activos[0].fecha) || undefined,
      };
      org.tareas.push(madre);
      changed = true;
    }
  } else {
    if (madre.titulo !== madreTitulo) {
      madre.titulo = madreTitulo;
      changed = true;
    }
    if (madre.notas !== madreNotas) {
      madre.notas = madreNotas;
      changed = true;
    }
    const shouldDone = nActivos === 0;
    if (Boolean(madre.completada) !== shouldDone) {
      madre.completada = shouldDone;
      changed = true;
    }
  }

  const byPedidoId = new Map();
  const byPedidoNum = new Map();
  for (const t of org.tareas) {
    if (!t || t.tipoEntregable !== 'impresoreando-pedido') continue;
    if (t.pedidoId) byPedidoId.set(t.pedidoId, t);
    if (t.pedidoNumero) byPedidoNum.set(t.pedidoNumero, t);
  }

  let orden = 1;
  for (const ped of pedidos) {
    const activo = pedidoActivo(ped.estado);
    let t = byPedidoId.get(ped.id) || byPedidoNum.get(ped.numero);
    const titulo = `[IMP] ${ped.numero} ${ped.cliente || '—'} · ${itemsTxt(ped)}`;
    const notas = activo
      ? `Estado pedido: ${ped.estado}. Total ${money(ped.montoNeto)}. ${ped.notas || ''} · Panel: /index/clientes/impresoreando/panel/`
      : `Transferido a venta (${ped.ventaId || 'ok'}). Total cobrado ${money(ped.montoNeto)}. ${ped.notas || ''} · Ya no es pedido activo.`;

    if (!t) {
      if (!activo) continue; // no crear tarea para transferidos nuevos
      t = {
        id: taskIdForPedido(ped),
        titulo,
        clienteId: CLI,
        rolId: ROL,
        fecha: ped.fecha || new Date().toISOString().slice(0, 10),
        horaInicio: '10:00',
        horaFin: '13:00',
        notas,
        prioridad: activo ? 'alta' : 'baja',
        completada: !activo,
        pendiente: false,
        tipoEntregable: 'impresoreando-pedido',
        parentId: MADRE_ID,
        ordenHijo: orden,
        pedidoId: ped.id,
        pedidoNumero: ped.numero,
        pedidoEstado: ped.estado || 'pendiente',
        linkPanel: '/index/clientes/impresoreando/panel/',
      };
      org.tareas.push(t);
      changed = true;
    } else {
      const next = {
        titulo,
        notas,
        completada: !activo,
        pedidoEstado: ped.estado || 'pendiente',
        pedidoId: ped.id,
        pedidoNumero: ped.numero,
        parentId: MADRE_ID,
        ordenHijo: orden,
        prioridad: activo ? t.prioridad || 'alta' : 'baja',
      };
      for (const [k, v] of Object.entries(next)) {
        if (t[k] !== v) {
          t[k] = v;
          changed = true;
        }
      }
    }
    orden += 1;
  }

  // Tareas de pedido huérfanas (ya no están en live) → completar
  const liveIds = new Set(pedidos.map((p) => p.id));
  const liveNums = new Set(pedidos.map((p) => p.numero));
  for (const t of org.tareas) {
    if (!t || t.tipoEntregable !== 'impresoreando-pedido') continue;
    const still = (t.pedidoId && liveIds.has(t.pedidoId)) || (t.pedidoNumero && liveNums.has(t.pedidoNumero));
    if (!still && !t.completada) {
      t.completada = true;
      t.pedidoEstado = 'transferido';
      t.notas = `${t.notas || ''} · Marcado completado (pedido ya no activo).`.trim();
      changed = true;
    }
  }

  if (changed) {
    org.respaldoActualizado = new Date().toISOString();
    writeJson(orgPath, org);
    console.log(
      `[sync-imp] ${path.basename(orgPath)}: pedidos activos ${nActivos} · madre «${madreTitulo}»`
    );
  } else {
    console.log(`[sync-imp] ${path.basename(orgPath)}: sin cambios`);
  }
  return changed;
}

function main() {
  const alsoRespaldo = process.argv.includes('--also-respaldo');
  const { data: imp, file } = loadImp();
  const pedidos = Array.isArray(imp.pedidos) ? imp.pedidos : [];
  const actualizado = imp.meta?.actualizado || path.basename(file);
  console.log(`[sync-imp] Fuente pedidos: ${path.basename(file)} (${pedidos.length})`);

  syncOrgFile(ORG_LIVE, pedidos, actualizado);
  if (alsoRespaldo) syncOrgFile(ORG_RESPALDO, pedidos, actualizado);
}

main();
