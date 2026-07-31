#!/usr/bin/env node
/**
 * Elimina PED-007 (Juan SIE · Torreón) del live Impresoreando.
 * También quita la subtarea del organizador si está en live/respaldo.
 *
 *   node scripts/force-imp-eliminar-ped-007.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');
const ORG_LIVE = path.join(ROOT, 'data', 'organizacion-live.json');

function quitarPedidos(obj) {
  if (!obj || !Array.isArray(obj.pedidos)) return 0;
  const before = obj.pedidos.length;
  obj.pedidos = obj.pedidos.filter(
    (p) => p.id !== 'ped-juan-torreon-007' && p.numero !== 'PED-007'
  );
  return before - obj.pedidos.length;
}

function quitarTareasOrg(obj) {
  if (!obj || !Array.isArray(obj.tareas)) return 0;
  const before = obj.tareas.length;
  obj.tareas = obj.tareas.filter((t) => {
    const n = String(t.pedidoNumero || '');
    const tit = String(t.titulo || '');
    if (n === 'PED-007') return false;
    if (/PED-007/i.test(tit) && /Torre[oó]n/i.test(tit)) return false;
    return true;
  });
  // archivar en eliminadas si existe el array
  if (!Array.isArray(obj.tareasEliminadas)) obj.tareasEliminadas = [];
  return before - obj.tareas.length;
}

function main() {
  let nPed = 0;
  if (fs.existsSync(LIVE)) {
    const live = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
    nPed = quitarPedidos(live);
    if (nPed) {
      if (!live.meta) live.meta = {};
      live.meta.actualizado = new Date().toISOString();
      fs.writeFileSync(LIVE, JSON.stringify(live, null, 2) + '\n', 'utf8');
    }
  }
  let nOrg = 0;
  if (fs.existsSync(ORG_LIVE)) {
    const org = JSON.parse(fs.readFileSync(ORG_LIVE, 'utf8'));
    nOrg = quitarTareasOrg(org);
    if (nOrg) {
      org.respaldoActualizado = new Date().toISOString();
      fs.writeFileSync(ORG_LIVE, JSON.stringify(org, null, 2) + '\n', 'utf8');
    }
  }
  console.log(`[imp] PED-007 eliminado: pedidos=${nPed}, tareas org=${nOrg}`);
}

main();
