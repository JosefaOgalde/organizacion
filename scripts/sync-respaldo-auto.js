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
  const force = process.argv.includes('--force');
  const all = candidatos().filter((c) => !c.esLive);
  if (!all.length) {
    if (fs.existsSync(LIVE) && leerJson(LIVE)) {
      console.log('[sync] Usando organizacion-live.json existente');
      return;
    }
    console.log('[sync] Sin respaldos organizacion-respaldo-*.json en data/ ni Descargas');
    return;
  }

  all.sort((a, b) => b.score - a.score || b.mtime - a.mtime);
  const mejor = all[0];

  if (!force && fs.existsSync(LIVE)) {
    const liveMtime = fs.statSync(LIVE).mtimeMs;
    const liveObj = leerJson(LIVE);
    const liveScore = liveObj ? marcaTiempo(liveObj, liveMtime) : 0;
    if (mejor.mtime <= liveMtime && mejor.score <= liveScore) {
      console.log('[sync] Live ya al día ←', path.basename(mejor.path));
      return;
    }
  }

  fs.mkdirSync(path.dirname(LIVE), { recursive: true });
  fs.copyFileSync(mejor.path, LIVE);
  console.log('[sync] Actualizado data/organizacion-live.json ←', mejor.path);
  console.log('[sync] Fecha respaldo:', mejor.obj.respaldoActualizado || '(sin fecha)');
  if (force) console.log('[sync] Modo --force (ignoró comparación con live anterior)');
}

main();
