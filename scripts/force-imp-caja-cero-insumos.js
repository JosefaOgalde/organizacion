#!/usr/bin/env node
/**
 * Fuerza retiro de caja $176.000 → insumos (caja = ventas − retiros = $0).
 * No suma a gastos de socios.
 *
 *   node scripts/force-imp-caja-cero-insumos.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');

const RETIRO = {
  id: 'retiro-caja-insumos-176000',
  fecha: '2026-08-31',
  montoNeto: 176000,
  descripcion: 'Retiro de caja para insumos',
  notas:
    'Se sacó de caja todo lo cobrado en ventas ($176.000) para comprar insumos. Caja = ventas − retiros → $0. No suma a gastos de socios (no es capital nuevo).',
  socioRegistro: 'Ambos',
  motivo: 'insumos',
};

function upsertRetiro(d) {
  d.retirosCaja = Array.isArray(d.retirosCaja) ? d.retirosCaja : [];
  const i = d.retirosCaja.findIndex((r) => r && r.id === RETIRO.id);
  if (i < 0) d.retirosCaja.push({ ...RETIRO });
  else d.retirosCaja[i] = { ...d.retirosCaja[i], ...RETIRO };
  d.meta = d.meta && typeof d.meta === 'object' ? d.meta : {};
  d.meta.actualizado = new Date().toISOString();
}

function cajaDe(d) {
  const ventas = (d.ventas || []).reduce((a, v) => a + Number(v.montoNeto || 0), 0);
  const retiros = (d.retirosCaja || []).reduce((a, r) => a + Number(r.montoNeto || 0), 0);
  return { ventas, retiros, caja: Math.max(0, ventas - retiros) };
}

function main() {
  if (!fs.existsSync(SEED)) {
    console.error('Falta seed');
    process.exit(1);
  }
  const seed = JSON.parse(fs.readFileSync(SEED, 'utf8'));
  upsertRetiro(seed);
  fs.writeFileSync(SEED, JSON.stringify(seed, null, 2) + '\n', 'utf8');

  let live;
  if (!fs.existsSync(LIVE)) {
    live = JSON.parse(JSON.stringify(seed));
  } else {
    live = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
    upsertRetiro(live);
  }
  fs.writeFileSync(LIVE, JSON.stringify(live, null, 2) + '\n', 'utf8');

  const s = cajaDe(seed);
  const l = cajaDe(live);
  if (l.caja !== 0) {
    console.error('Fallo: caja live debería ser 0, got', l.caja, l);
    process.exit(1);
  }
  console.log('OK caja $0 · ventas', l.ventas, '· retiros insumos', l.retiros, '· seed caja', s.caja);
}

main();
