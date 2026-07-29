#!/usr/bin/env node
/** Imprime la ruta del respaldo organizacion-respaldo-*.json más reciente (data/ + Descargas). */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const DOWNLOADS = path.join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads');

function leerJson(ruta) {
  try {
    const obj = JSON.parse(fs.readFileSync(ruta, 'utf8'));
    if (!obj || !Array.isArray(obj.clientes) || !Array.isArray(obj.tareas)) return null;
    return obj;
  } catch {
    return null;
  }
}

function score(ruta, obj, st) {
  // Preferir fecha del nombre (…-YYYY-MM-DD…) para no ganar respaldos viejos
  // solo porque un script les tocó el mtime / respaldoActualizado.
  const m = ruta.match(/organizacion-respaldo-(\d{4}-\d{2}-\d{2})/i);
  const fileDate = m ? Date.parse(m[1] + 'T23:59:59.999Z') : 0;
  const d = obj.respaldoActualizado || '';
  const stamp = Date.parse(d);
  const t = Number.isFinite(stamp) ? stamp : 0;
  if (fileDate) return fileDate * 1e6 + t + (st.mtimeMs % 1e6);
  return Math.max(t, st.mtimeMs);
}

function candidatos() {
  const list = [];
  [DATA_DIR, DOWNLOADS].filter((d) => d && fs.existsSync(d)).forEach((dir) => {
    let files = [];
    try {
      files = fs.readdirSync(dir);
    } catch {
      return;
    }
    files.forEach((name) => {
      if (!/^organizacion-respaldo-.*\.json$/i.test(name)) return;
      if (/ejemplo/i.test(name)) return;
      const abs = path.join(dir, name);
      try {
        const st = fs.statSync(abs);
        if (!st.isFile()) return;
        const obj = leerJson(abs);
        if (!obj) return;
        list.push({ path: abs, score: score(abs, obj, st), mtime: st.mtimeMs });
      } catch {
        /* ignore */
      }
    });
  });
  list.sort((a, b) => b.score - a.score || b.mtime - a.mtime);
  return list;
}

const all = candidatos();
if (!all.length) {
  process.exit(2);
}
process.stdout.write(all[0].path);
