#!/usr/bin/env node
/**
 * Fusiona data/impresoreando-seed.json → data/impresoreando-live.json
 * sin pisar pedidos/ventas/productos que ya existan en live.
 * Así, tras git pull, los PED nuevos del repo aparecen en el panel.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main() {
  if (!fs.existsSync(SEED)) {
    console.error('[imp-sync] Falta', SEED);
    process.exit(1);
  }
  const seed = readJson(SEED);
  let live;
  if (!fs.existsSync(LIVE)) {
    fs.mkdirSync(path.dirname(LIVE), { recursive: true });
    fs.writeFileSync(LIVE, JSON.stringify(seed, null, 2) + '\n', 'utf8');
    console.log('[imp-sync] Creado live desde seed');
    return;
  }
  try {
    live = readJson(LIVE);
  } catch (e) {
    console.error('[imp-sync] live inválido:', e.message);
    process.exit(1);
  }

  let changed = 0;
  live.meta = live.meta && typeof live.meta === 'object' ? live.meta : {};
  live.productos = Array.isArray(live.productos) ? live.productos : [];
  live.pedidos = Array.isArray(live.pedidos) ? live.pedidos : [];
  live.ventas = Array.isArray(live.ventas) ? live.ventas : [];
  live.gastos = Array.isArray(live.gastos) ? live.gastos : [];
  live.impresoras = Array.isArray(live.impresoras) ? live.impresoras : [];

  // Perfiles de impresora (Centauri + Ender): agrega faltantes; no pisa $/kg ni consumo editados.
  const impById = new Map(live.impresoras.filter((i) => i && i.id).map((i) => [i.id, i]));
  for (const si of seed.impresoras || []) {
    if (!si || !si.id) continue;
    const existing = impById.get(si.id);
    if (!existing) {
      live.impresoras.push(JSON.parse(JSON.stringify(si)));
      impById.set(si.id, si);
      changed += 1;
      continue;
    }
    let touched = false;
    if (!existing.nombre && si.nombre) {
      existing.nombre = si.nombre;
      touched = true;
    }
    if (!existing.extrusor && si.extrusor) {
      existing.extrusor = si.extrusor;
      touched = true;
    }
    if (!existing.alias && si.alias) {
      existing.alias = si.alias;
      touched = true;
    }
    if (!(Number(existing.consumoImpresoraKw) > 0) && Number(si.consumoImpresoraKw) > 0) {
      existing.consumoImpresoraKw = si.consumoImpresoraKw;
      touched = true;
    }
    if (!(Number(existing.tarifaKwhClp) > 0) && Number(si.tarifaKwhClp) > 0) {
      existing.tarifaKwhClp = si.tarifaKwhClp;
      touched = true;
    }
    if (existing.recargoFijoClp == null && si.recargoFijoClp != null) {
      existing.recargoFijoClp = si.recargoFijoClp;
      touched = true;
    }
    if (existing.filamentoOtro == null && si.filamentoOtro) {
      existing.filamentoOtro = true;
      touched = true;
    }
    if (!existing.notas && si.notas) {
      existing.notas = si.notas;
      touched = true;
    }
    if (touched) changed += 1;
  }

  const prodById = new Map(live.productos.filter((p) => p && p.id).map((p) => [p.id, p]));
  const prodBySku = new Map(
    live.productos.filter((p) => p && p.sku).map((p) => [String(p.sku).toUpperCase(), p])
  );
  for (const sp of seed.productos || []) {
    if (!sp || !sp.id) continue;
    const existing = prodById.get(sp.id) || prodBySku.get(String(sp.sku || '').toUpperCase());
    if (!existing) {
      live.productos.push(JSON.parse(JSON.stringify(sp)));
      changed += 1;
      continue;
    }
    // Completa g/h/precio si el live quedó vacío y el seed ya tiene cálculo.
    if (!(Number(existing.filamentoGramos) > 0) && Number(sp.filamentoGramos) > 0) {
      Object.assign(existing, sp);
      changed += 1;
    } else if (!(Number(existing.precioVentaSugeridoClp) > 0) && Number(sp.precioVentaSugeridoClp) > 0) {
      existing.precioVentaSugeridoClp = sp.precioVentaSugeridoClp;
      changed += 1;
    }
    if (!existing.impresoraId && sp.impresoraId) {
      existing.impresoraId = sp.impresoraId;
      changed += 1;
    }
  }

  const pedByKey = new Map();
  for (const p of live.pedidos) {
    if (!p) continue;
    if (p.id) pedByKey.set(String(p.id), p);
    if (p.numero) pedByKey.set(String(p.numero), p);
  }
  for (const sp of seed.pedidos || []) {
    if (!sp) continue;
    const keys = [sp.id, sp.numero].filter(Boolean).map(String);
    const existing = keys.map((k) => pedByKey.get(k)).find(Boolean);
    if (!existing) {
      live.pedidos.push(JSON.parse(JSON.stringify(sp)));
      keys.forEach((k) => pedByKey.set(k, sp));
      changed += 1;
      continue;
    }
    // Si el seed ya marcó transferido (o apunta venta), propaga al live sin pisar ventas nuevas.
    if (sp.estado === 'transferido' && existing.estado !== 'transferido') {
      existing.estado = 'transferido';
      if (sp.ventaId) existing.ventaId = sp.ventaId;
      if (sp.transferidoEn) existing.transferidoEn = sp.transferidoEn;
      if (sp.notas) existing.notas = sp.notas;
      if (sp.montoNeto != null) existing.montoNeto = sp.montoNeto;
      if (sp.montoBruto != null) existing.montoBruto = sp.montoBruto;
      if (sp.descuentoClp != null) existing.descuentoClp = sp.descuentoClp;
      if (Array.isArray(sp.items) && sp.items.length) {
        existing.items = JSON.parse(JSON.stringify(sp.items));
      }
      changed += 1;
    } else if (sp.estado === 'transferido' && existing.estado === 'transferido') {
      let touched = false;
      if (sp.ventaId && existing.ventaId !== sp.ventaId) {
        existing.ventaId = sp.ventaId;
        touched = true;
      }
      if (sp.montoNeto != null && Number(existing.montoNeto) !== Number(sp.montoNeto)) {
        existing.montoNeto = sp.montoNeto;
        if (sp.montoBruto != null) existing.montoBruto = sp.montoBruto;
        touched = true;
      }
      if (sp.notas && existing.notas !== sp.notas) {
        existing.notas = sp.notas;
        touched = true;
      }
      const seedIt = (sp.items || [])[0];
      const liveIt = (existing.items || [])[0];
      if (seedIt && liveIt) {
        if (
          seedIt.filamento &&
          liveIt.filamento !== seedIt.filamento
        ) {
          liveIt.filamento = seedIt.filamento;
          touched = true;
        }
        if (
          seedIt.precioUnitarioClp != null &&
          Number(liveIt.precioUnitarioClp) !== Number(seedIt.precioUnitarioClp)
        ) {
          liveIt.precioUnitarioClp = seedIt.precioUnitarioClp;
          touched = true;
        }
        if (seedIt.estado && liveIt.estado !== seedIt.estado) {
          liveIt.estado = seedIt.estado;
          touched = true;
        }
        if (seedIt.listos != null && Number(liveIt.listos) !== Number(seedIt.listos)) {
          liveIt.listos = seedIt.listos;
          liveIt.enImpresion = seedIt.enImpresion != null ? seedIt.enImpresion : 0;
          touched = true;
        }
      }
      if (touched) changed += 1;
    } else if (sp.ventaId && existing.ventaId !== sp.ventaId) {
      existing.ventaId = sp.ventaId;
      changed += 1;
    }
  }

  // Actualiza ventas seed existentes (p. ej. pedidoId consolidado) sin pisar montos locales distintos.
  const venIds = new Set(live.ventas.filter((v) => v && v.id).map((v) => v.id));
  for (const sv of seed.ventas || []) {
    if (!sv || !sv.id) continue;
    if (!venIds.has(sv.id)) {
      live.ventas.push(JSON.parse(JSON.stringify(sv)));
      venIds.add(sv.id);
      changed += 1;
      continue;
    }
    const existing = live.ventas.find((v) => v && v.id === sv.id);
    if (!existing) continue;
    let touched = false;
    if (sv.pedidoId && existing.pedidoId !== sv.pedidoId) {
      existing.pedidoId = sv.pedidoId;
      existing.pedidoNumero = sv.pedidoNumero;
      touched = true;
    }
    if (sv.descripcion && existing.descripcion !== sv.descripcion) {
      existing.descripcion = sv.descripcion;
      touched = true;
    }
    if (sv.notas && existing.notas !== sv.notas) {
      existing.notas = sv.notas;
      touched = true;
    }
    if (sv.montoNeto != null && Number(existing.montoNeto) !== Number(sv.montoNeto)) {
      existing.montoNeto = sv.montoNeto;
      if (sv.montoBruto != null) existing.montoBruto = sv.montoBruto;
      touched = true;
    }
    if (Array.isArray(sv.items) && sv.items.length) {
      existing.items = JSON.parse(JSON.stringify(sv.items));
      touched = true;
    }
    if (touched) changed += 1;
  }

  // Quitar solo el id viejo ped-ele-pesa-012 (Ele consolidado en PED-004).
  // NO borrar por número PED-012: ese número ahora es Marcia limpia brochas.
  const dropDupIds = new Set(['ped-ele-pesa-012']);
  const beforeDrop = live.pedidos.length;
  live.pedidos = live.pedidos.filter((p) => {
    if (!p) return false;
    if (dropDupIds.has(p.id)) return false;
    return true;
  });
  if (live.pedidos.length !== beforeDrop) changed += 1;

  // Historial clientes del seed (si live aún no lo tiene o le faltan códigos).
  if (Array.isArray(seed.meta?.clientesHistorial) && seed.meta.clientesHistorial.length) {
    const liveHist = Array.isArray(live.meta.clientesHistorial) ? live.meta.clientesHistorial : [];
    const liveCodes = new Set(liveHist.flatMap((h) => h.ventaCodigos || []));
    const seedCodes = seed.meta.clientesHistorial.flatMap((h) => h.ventaCodigos || []);
    if (!liveHist.length || seedCodes.some((c) => c && !liveCodes.has(c))) {
      live.meta.clientesHistorial = JSON.parse(JSON.stringify(seed.meta.clientesHistorial));
      changed += 1;
    }
  }

  // Gastos nuevos del seed (p. ej. diseños Cults) sin pisar montos editados en live.
  const gasIds = new Set(live.gastos.filter((g) => g && g.id).map((g) => g.id));
  for (const sg of seed.gastos || []) {
    if (!sg || !sg.id || gasIds.has(sg.id)) continue;
    live.gastos.push(JSON.parse(JSON.stringify(sg)));
    gasIds.add(sg.id);
    changed += 1;
  }

  const maxPed = live.pedidos.reduce((m, p) => {
    const n = Number(String(p.numero || '').replace(/\D/g, '')) || 0;
    return Math.max(m, n);
  }, 0);
  if (Number(live.meta.pedidoSeq || 0) < maxPed) {
    live.meta.pedidoSeq = maxPed;
    changed += 1;
  }
  const maxVen = live.ventas.reduce((m, v) => {
    const n = Number(String(v.codigo || '').replace(/^I0*/, '') || 0);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  if (Number(live.meta.ventaSeq || 0) < maxVen) {
    live.meta.ventaSeq = maxVen;
    changed += 1;
  }

  if (!changed) {
    console.log('[imp-sync] Live ya tenía los pedidos/productos del seed');
    return;
  }

  live.meta.actualizado = new Date().toISOString();
  fs.writeFileSync(LIVE, JSON.stringify(live, null, 2) + '\n', 'utf8');
  console.log(
    `[imp-sync] Live actualizado (+${changed}) · pedidos ${live.pedidos.length} · productos ${live.productos.length} · ventas ${live.ventas.length}`
  );
}

main();
