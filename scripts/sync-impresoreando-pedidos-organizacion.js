#!/usr/bin/env node
/**
 * Sincroniza pedidos Impresoreando → tareas del organizador.
 *
 * Reglas:
 * - Cada pedido ACTIVO (pendiente|listo|en_impresion) = 1 subtarea con número PED-00n
 * - Pedidos transferidos → tarea completada (tachada; no cuentan en «Pedidos activos · N»)
 * - Madre `tarea-imp-pedidos-hoy` resume solo los activos
 * - Pedidos **fiados** (`fiado` o `fechaPagoEsperada`) → tarea de cobro el día de pago
 *   (`tipoEntregable: impresoreando-cobro`). Al transferir a venta se completa.
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
const DATA_DIR = path.join(ROOT, 'data');

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
  return ['pendiente', 'listo', 'en_impresion'].includes(String(estado || 'pendiente').toLowerCase());
}

function pedidoAnulado(estado) {
  const e = String(estado || '').toLowerCase();
  return e === 'anulado' || e === 'cancelado';
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

function clienteCorto(ped) {
  return String(ped.cliente || ped.clienteNombre || '—')
    .replace(/\s+/g, ' ')
    .trim();
}

function taskIdForPedido(ped) {
  const map = {
    'ped-rebe-plmons-001': 'tarea-imp-ped-rebe-plmons-001',
    'ped-gianni-bulldog-002': 'tarea-imp-ped-gianni-bulldog-002',
    'ped-naves-espaciales-003': 'tarea-imp-ped-juan-naves-003',
    'ped-ele-pesa-rusa-004': 'tarea-imp-ped-ele-pesa-004',
    'ped-maria-paz-soporte-005': 'tarea-imp-ped-mpaz-soporte-005',
    'ped-rebe-dragon-006': 'tarea-imp-ped-rebe-dragon-006',
    'ped-juan-torreon-007': 'tarea-imp-ped-juan-torreon-007',
    'ped-juan-bob-008': 'tarea-imp-ped-juan-bob-008',
    'ped-rebe-soporte-009': 'tarea-imp-ped-rebe-soporte-009',
    'ped-gianni-soporte-010': 'tarea-imp-ped-gianni-soporte-010',
    'ped-marcia-soporte-011': 'tarea-imp-ped-marcia-soporte-011',
    'ped-ele-pesa-012': 'tarea-imp-ped-ele-pesa-012',
  };
  if (map[ped.id]) return map[ped.id];
  const slug = String(ped.numero || ped.id || 'x')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  return `tarea-imp-ped-${slug}`;
}

function tituloPedido(ped) {
  const num = ped.numero || 'PED-???';
  return `[IMP] ${num} · ${clienteCorto(ped)} · ${itemsTxt(ped)}`;
}

function listOrgTargets(alsoRespaldo) {
  const files = [ORG_LIVE];
  if (!alsoRespaldo) return files.filter((f) => fs.existsSync(f));
  try {
    for (const name of fs.readdirSync(DATA_DIR)) {
      if (!/^organizacion-respaldo-.*\.json$/i.test(name)) continue;
      if (/ejemplo/i.test(name)) continue;
      files.push(path.join(DATA_DIR, name));
    }
  } catch {
    /* ignore */
  }
  return [...new Set(files)].filter((f) => fs.existsSync(f));
}

/** Fecha calendario Chile (YYYY-MM-DD). Madre de pedidos = siempre hoy. */
function hoyChile() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Día en que se finalizó/transferió/anuló el pedido (para congelar la subtarea). */
function fechaFinalizacionPedido(ped, tareaExistente) {
  const raw = ped.anuladoEn || ped.transferidoEn || ped.actualizado || ped.ventaFecha || '';
  if (raw) {
    const d = String(raw).slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const parsed = Date.parse(raw);
    if (Number.isFinite(parsed)) {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Santiago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(parsed));
    }
  }
  // Si ya estaba completada, no moverla de su día.
  if (tareaExistente?.completada && tareaExistente.fecha) return tareaExistente.fecha;
  if (tareaExistente?.fechaFinalizado) return tareaExistente.fechaFinalizado;
  return hoyChile();
}

function taskIdForCobro(ped) {
  const num = String(ped.numero || ped.id || 'x')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  return `tarea-imp-cobro-${num}`;
}

function fechaPagoPedido(ped) {
  const raw = ped.fechaPagoEsperada || ped.fechaPago || ped.pagaEl || '';
  const d = String(raw).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : '';
}

function esFiado(ped) {
  if (ped.fiado === true) return true;
  if (fechaPagoPedido(ped)) return true;
  const blob = `${ped.pagoNotas || ''} ${ped.notas || ''}`.toLowerCase();
  return /\bfiado\b|\bpaga(r)?\s+el\b|\bcobra(r)?\b/.test(blob) && !!fechaPagoPedido(ped);
}

function tituloCobro(ped) {
  const num = ped.numero || 'PED-???';
  return `[IMP] Cobrar ${num} · ${clienteCorto(ped)} · ${money(ped.montoNeto)}`;
}

function syncOrgFile(orgPath, pedidos, impActualizado) {
  const org = readJson(orgPath);
  org.tareas = Array.isArray(org.tareas) ? org.tareas : [];
  let changed = false;
  const hoy = hoyChile();

  const activos = pedidos.filter((p) => pedidoActivo(p.estado));
  const nActivos = activos.length;
  const resumenActivos = activos
    .map((p) => `${p.numero} ${clienteCorto(p)} (${p.estado})`)
    .join(' · ');

  let madre = org.tareas.find((t) => t && t.id === MADRE_ID);
  const madreTitulo = `[IMP] Pedidos activos · ${nActivos}`;
  const madreNotas =
    nActivos === 0
      ? `Sin pedidos activos. Panel: /index/clientes/impresoreando/panel/ · Imp live ${impActualizado || '—'}`
      : `Panel socios 50/50 · ${resumenActivos}. Abrir panel: /index/clientes/impresoreando/panel/ · Transferir a venta baja la deuda. Imp live ${impActualizado || '—'}`;
  // Madre siempre en HOY (Chile) mientras haya activos; si no hay, queda el día en que se vació.
  const fechaMadre = nActivos > 0 ? hoy : madre?.fecha || hoy;

  if (!madre) {
    if (nActivos > 0) {
      madre = {
        id: MADRE_ID,
        titulo: madreTitulo,
        clienteId: CLI,
        rolId: ROL,
        fecha: fechaMadre,
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
        fechaFin: fechaMadre,
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
    if (madre.fecha !== fechaMadre) {
      madre.fecha = fechaMadre;
      changed = true;
    }
    if (madre.fechaFin !== fechaMadre) {
      madre.fechaFin = fechaMadre;
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
  const byTaskId = new Map();
  for (const t of org.tareas) {
    if (!t || t.tipoEntregable !== 'impresoreando-pedido') continue;
    if (t.pedidoId) byPedidoId.set(t.pedidoId, t);
    if (t.pedidoNumero) byPedidoNum.set(t.pedidoNumero, t);
    if (t.id) byTaskId.set(t.id, t);
  }

  let ordenActivo = 1;
  let ordenHecho = 1;
  for (const ped of pedidos) {
    const activo = pedidoActivo(ped.estado);
    const anulado = pedidoAnulado(ped.estado);
    const tid = taskIdForPedido(ped);
    let t =
      byPedidoId.get(ped.id) ||
      byPedidoNum.get(ped.numero) ||
      byTaskId.get(tid);
    const titulo = tituloPedido(ped);
    const notas = activo
      ? `Estado: ${ped.estado}. Total ${money(ped.montoNeto)}. ${ped.notas || ''} · Panel: /index/clientes/impresoreando/panel/`
      : anulado
        ? `ANULADO. Total era ${money(ped.montoNeto)}. ${ped.notas || ''} · Ya no es pedido activo.`
        : `Transferido a venta (${ped.ventaId || ped.ventaCodigo || 'ok'}). Total cobrado ${money(ped.montoNeto)}. ${ped.notas || ''} · Ya no es pedido activo.`;
    const ordenHijo = activo ? ordenActivo : 900 + ordenHecho;
    // Activas van con la madre (hoy). Finalizadas se congelan en el día de cierre.
    const fechaHijo = activo ? hoy : fechaFinalizacionPedido(ped, t);

    if (!t) {
      if (!activo) continue; // no crear tarea nueva solo para transferidos/anulados
      t = {
        id: tid,
        titulo,
        clienteId: CLI,
        rolId: ROL,
        fecha: fechaHijo,
        horaInicio: '10:00',
        horaFin: '13:00',
        notas,
        prioridad: 'alta',
        completada: false,
        pendiente: false,
        tipoEntregable: 'impresoreando-pedido',
        parentId: MADRE_ID,
        ordenHijo,
        pedidoId: ped.id,
        pedidoNumero: ped.numero,
        pedidoEstado: ped.estado || 'pendiente',
        linkPanel: '/index/clientes/impresoreando/panel/',
        numeroHistorico: String(ped.numero || '').replace(/\D/g, '').padStart(2, '0') || undefined,
      };
      org.tareas.push(t);
      byPedidoId.set(ped.id, t);
      byPedidoNum.set(ped.numero, t);
      byTaskId.set(tid, t);
      changed = true;
    } else {
      const next = {
        titulo,
        notas,
        fecha: fechaHijo,
        completada: !activo,
        pedidoEstado: ped.estado || 'pendiente',
        pedidoId: ped.id,
        pedidoNumero: ped.numero,
        parentId: MADRE_ID,
        ordenHijo,
        prioridad: activo ? t.prioridad || 'alta' : 'baja',
        clienteId: CLI,
        rolId: ROL,
        tipoEntregable: 'impresoreando-pedido',
      };
      if (!activo) {
        next.fechaFinalizado = t.fechaFinalizado || fechaHijo;
      }
      for (const [k, v] of Object.entries(next)) {
        if (t[k] !== v) {
          t[k] = v;
          changed = true;
        }
      }
    }
    if (activo) ordenActivo += 1;
    else ordenHecho += 1;
  }

  // Tareas de pedido huérfanas (ya no están en live) → completar
  const liveIds = new Set(pedidos.map((p) => p.id));
  const liveNums = new Set(pedidos.map((p) => p.numero));
  for (const t of org.tareas) {
    if (!t || t.tipoEntregable !== 'impresoreando-pedido') continue;
    const still =
      (t.pedidoId && liveIds.has(t.pedidoId)) ||
      (t.pedidoNumero && liveNums.has(t.pedidoNumero));
    if (!still && !t.completada) {
      t.completada = true;
      t.pedidoEstado = 'transferido';
      t.prioridad = 'baja';
      t.notas = `${t.notas || ''} · Marcado completado (pedido ya no en live).`.trim();
      changed = true;
    }
  }

  // Recordatorios de cobro (fiados): tarea el día de pago esperado.
  const byCobroId = new Map();
  for (const t of org.tareas) {
    if (!t || t.tipoEntregable !== 'impresoreando-cobro') continue;
    if (t.id) byCobroId.set(t.id, t);
    if (t.pedidoId) byCobroId.set(`ped:${t.pedidoId}`, t);
    if (t.pedidoNumero) byCobroId.set(`num:${t.pedidoNumero}`, t);
  }
  const cobroLiveIds = new Set();
  for (const ped of pedidos) {
    const fechaPago = fechaPagoPedido(ped);
    if (!esFiado(ped) || !fechaPago) continue;
    const cobroId = taskIdForCobro(ped);
    cobroLiveIds.add(cobroId);
    const pagado = String(ped.estado || '').toLowerCase() === 'transferido' || !!ped.ventaId;
    let t =
      byCobroId.get(cobroId) ||
      byCobroId.get(`ped:${ped.id}`) ||
      byCobroId.get(`num:${ped.numero}`);
    const titulo = tituloCobro(ped);
    const notas = pagado
      ? `Pagado / transferido a venta (${ped.ventaId || ped.ventaCodigo || 'ok'}). Total ${money(ped.montoNeto)}. ${ped.pagoNotas || ped.notas || ''}`
      : `Fiado · cobrar el ${fechaPago}. Pedido ${ped.numero} · ${itemsTxt(ped)}. Total ${money(ped.montoNeto)}. ${ped.pagoNotas || ped.notas || ''} · Panel: /index/clientes/impresoreando/panel/?tab=pedidos`;
    if (!t) {
      t = {
        id: cobroId,
        titulo,
        clienteId: CLI,
        rolId: ROL,
        fecha: fechaPago,
        horaInicio: '09:00',
        horaFin: '12:00',
        notas,
        prioridad: pagado ? 'baja' : 'alta',
        completada: pagado,
        pendiente: !pagado,
        tipoEntregable: 'impresoreando-cobro',
        parentId: null,
        pedidoId: ped.id,
        pedidoNumero: ped.numero,
        pedidoEstado: ped.estado || 'pendiente',
        fechaPagoEsperada: fechaPago,
        fiado: true,
        linkPanel: '/index/clientes/impresoreando/panel/?tab=pedidos',
        numeroHistorico: String(ped.numero || '').replace(/\D/g, '').padStart(2, '0') || undefined,
      };
      org.tareas.push(t);
      changed = true;
    } else {
      const next = {
        titulo,
        notas,
        fecha: fechaPago,
        fechaPagoEsperada: fechaPago,
        completada: pagado,
        pendiente: !pagado,
        prioridad: pagado ? 'baja' : 'alta',
        pedidoId: ped.id,
        pedidoNumero: ped.numero,
        pedidoEstado: ped.estado || 'pendiente',
        fiado: true,
        clienteId: CLI,
        rolId: ROL,
        tipoEntregable: 'impresoreando-cobro',
        linkPanel: '/index/clientes/impresoreando/panel/?tab=pedidos',
      };
      for (const [k, v] of Object.entries(next)) {
        if (t[k] !== v) {
          t[k] = v;
          changed = true;
        }
      }
    }
  }
  for (const t of org.tareas) {
    if (!t || t.tipoEntregable !== 'impresoreando-cobro') continue;
    if (cobroLiveIds.has(t.id)) continue;
    // Cobro huérfano: completar si el pedido ya no existe o ya no es fiado.
    if (!t.completada) {
      t.completada = true;
      t.pendiente = false;
      t.prioridad = 'baja';
      t.notas = `${t.notas || ''} · Completado (fiado ya no vigente en live).`.trim();
      changed = true;
    }
  }

  if (changed) {
    org.respaldoActualizado = new Date().toISOString();
    writeJson(orgPath, org);
    console.log(
      `[sync-imp] ${path.basename(orgPath)}: activos ${nActivos} · madre «${madreTitulo}»`
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
  console.log(`[sync-imp] Fuente: ${path.basename(file)} · ${pedidos.length} pedidos`);
  console.log(
    `[sync-imp] Activos: ${pedidos.filter((p) => pedidoActivo(p.estado)).map((p) => p.numero).join(', ') || '(ninguno)'}`
  );
  console.log(
    `[sync-imp] Transferidos: ${pedidos.filter((p) => !pedidoActivo(p.estado)).map((p) => p.numero).join(', ') || '(ninguno)'}`
  );
  const fiados = pedidos.filter((p) => esFiado(p) && fechaPagoPedido(p));
  console.log(
    `[sync-imp] Fiados (cobro): ${fiados.map((p) => `${p.numero}@${fechaPagoPedido(p)}`).join(', ') || '(ninguno)'}`
  );

  const targets = listOrgTargets(alsoRespaldo);
  if (!targets.length) {
    console.error('[sync-imp] No hay organizacion-live.json ni respaldos');
    process.exit(1);
  }
  for (const orgPath of targets) {
    syncOrgFile(orgPath, pedidos, actualizado);
  }
}

main();
