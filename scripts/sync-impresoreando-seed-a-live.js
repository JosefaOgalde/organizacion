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

  const pedKeys = new Set(
    live.pedidos.flatMap((p) => [p.id, p.numero].filter(Boolean).map(String))
  );
  for (const sp of seed.pedidos || []) {
    if (!sp) continue;
    const keys = [sp.id, sp.numero].filter(Boolean).map(String);
    if (keys.some((k) => pedKeys.has(k))) continue;
    live.pedidos.push(JSON.parse(JSON.stringify(sp)));
    keys.forEach((k) => pedKeys.add(k));
    changed += 1;
  }

  const venIds = new Set(live.ventas.filter((v) => v && v.id).map((v) => v.id));
  for (const sv of seed.ventas || []) {
    if (!sv || !sv.id || venIds.has(sv.id)) continue;
    live.ventas.push(JSON.parse(JSON.stringify(sv)));
    venIds.add(sv.id);
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
