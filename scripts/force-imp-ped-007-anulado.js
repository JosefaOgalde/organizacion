#!/usr/bin/env node
/** Fuerza PED-007 Torreón → anulado en live. */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');

const seed = JSON.parse(fs.readFileSync(SEED, 'utf8'));
const sp = (seed.pedidos || []).find((p) => p && (p.id === 'ped-juan-torreon-007' || p.numero === 'PED-007'));
if (!sp) {
  console.error('PED-007 no está en seed');
  process.exit(1);
}
let live = fs.existsSync(LIVE)
  ? JSON.parse(fs.readFileSync(LIVE, 'utf8'))
  : JSON.parse(JSON.stringify(seed));
live.pedidos = Array.isArray(live.pedidos) ? live.pedidos : [];
const idx = live.pedidos.findIndex((p) => p && (p.id === sp.id || p.numero === 'PED-007'));
const copy = JSON.parse(JSON.stringify(sp));
copy.estado = 'anulado';
copy.ventaId = null;
copy.anuladoEn = copy.anuladoEn || new Date().toISOString();
copy.notas = '1× Torreón · ANULADO · costo estimado $3.293,48 · PVP sugerido $6.500';
if (Array.isArray(copy.items)) {
  for (const it of copy.items) {
    it.estado = 'anulado';
    it.filamento = 'PLA color';
  }
}
if (idx < 0) live.pedidos.push(copy);
else live.pedidos[idx] = { ...live.pedidos[idx], ...copy };
fs.writeFileSync(LIVE, JSON.stringify(live, null, 2) + '\n');
console.log('OK PED-007 → anulado');
