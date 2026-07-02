#!/usr/bin/env node
/**
 * Sincroniza el respaldo más reciente → data/organizacion-live.json
 * Busca en data/ y en Descargas del usuario. Sin intervención manual.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LIVE = path.join(ROOT, 'data', 'organizacion-live.json');
const DATA_DIR = path.join(ROOT, 'data');
const DOWNLOADS = path.join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads');

function leerJson(ruta) {
  try {
    const raw = fs.readFileSync(ruta, 'utf8');
    const obj = JSON.parse(raw);
    if (!obj || !Array.isArray(obj.clientes) || !Array.isArray(obj.tareas)) return null;
    return obj;
  } catch {
    return null;
  }
}

function marcaTiempo(obj, mtimeMs) {
  const d = obj.respaldoActualizado || '';
  const parsed = Date.parse(d);
  return Number.isFinite(parsed) ? parsed : mtimeMs;
}

function candidatos() {
  const list = [];
  const dirs = [DATA_DIR, DOWNLOADS].filter((d) => d && fs.existsSync(d));

  dirs.forEach((dir) => {
    let files = [];
    try {
      files = fs.readdirSync(dir);
    } catch {
      return;
    }
    files.forEach((name) => {
      if (!/^organizacion-respaldo-.*\.json$/i.test(name)) return;
      const abs = path.join(dir, name);
      try {
        const st = fs.statSync(abs);
        if (!st.isFile()) return;
        const obj = leerJson(abs);
        if (!obj) return;
        list.push({ path: abs, obj, mtime: st.mtimeMs, score: marcaTiempo(obj, st.mtimeMs) });
      } catch {
        /* ignore */
      }
    });
  });

  if (fs.existsSync(LIVE)) {
    try {
      const st = fs.statSync(LIVE);
      const obj = leerJson(LIVE);
      if (obj) {
        list.push({ path: LIVE, obj, mtime: st.mtimeMs, score: marcaTiempo(obj, st.mtimeMs), esLive: true });
      }
    } catch {
      /* ignore */
    }
  }

  return list;
}

function main() {
  const all = candidatos();
  if (!all.length) {
    console.log('[sync] Sin respaldos organizacion-respaldo-*.json — se usará live vacío o datos del navegador');
    return;
  }

  all.sort((a, b) => b.score - a.score || b.mtime - a.mtime);
  const mejor = all[0];

  let liveMtime = 0;
  if (fs.existsSync(LIVE)) {
    try {
      liveMtime = fs.statSync(LIVE).mtimeMs;
    } catch {
      liveMtime = 0;
    }
  }

  // Actualizar si el candidato es más nuevo por fecha O por hora de archivo en disco
  if (mejor.esLive) {
    console.log('[sync] organizacion-live.json ya es el más reciente en disco');
    return;
  }

  if (mejor.mtime <= liveMtime && mejor.score <= (liveMtime || 0)) {
    const liveObj = leerJson(LIVE);
    const liveScore = liveObj ? marcaTiempo(liveObj, liveMtime) : 0;
    if (mejor.score <= liveScore && mejor.mtime <= liveMtime) {
      console.log('[sync] Live en disco ya está al día (', path.basename(mejor.path), ')');
      return;
    }
  }

  if (!mejor.esLive && fs.existsSync(LIVE)) {
    const liveObj = leerJson(LIVE);
    const liveScore = liveObj ? marcaTiempo(liveObj, liveMtime) : 0;
    if (mejor.score < liveScore && mejor.mtime <= liveMtime) {
      console.log('[sync] Live en disco ya está al día (', path.basename(mejor.path), ')');
      return;
    }
  }

  fs.mkdirSync(path.dirname(LIVE), { recursive: true });
  fs.copyFileSync(mejor.path, LIVE);
  console.log('[sync] Actualizado data/organizacion-live.json ←', mejor.path);
  console.log('[sync] Fecha respaldo:', mejor.obj.respaldoActualizado || '(sin fecha)');
}

main();
