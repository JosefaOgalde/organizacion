#!/usr/bin/env node
/**
 * Sincroniza el respaldo más reciente → data/organizacion-live.json
 *
 * Por defecto busca en data/ y en Descargas.
 * --solo-repo → solo data/ del repo (no Descargas; evita pisar con JSON viejo de Downloads).
 * --force → sobrescribe live aunque sea más nuevo (usar con cuidado; ABRIR ya NO lo usa).
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

function main() {
  const force = process.argv.includes('--force');
  const soloRepo = process.argv.includes('--solo-repo');
  const all = candidatos({ soloRepo }).filter((c) => !c.esLive);
  if (!all.length) {
    if (fs.existsSync(LIVE) && leerJson(LIVE)) {
      console.log('[sync] Usando organizacion-live.json existente');
      return;
    }
    console.log('[sync] Sin respaldos organizacion-respaldo-*.json en data/' + (soloRepo ? '' : ' ni Descargas'));
    return;
  }

  all.sort((a, b) => b.score - a.score || b.mtime - a.mtime);
  const mejor = all[0];

  if (!force && fs.existsSync(LIVE)) {
    const liveMtime = fs.statSync(LIVE).mtimeMs;
    const liveObj = leerJson(LIVE);
    if (liveObj) {
      const liveScore = marcaTiempo(liveObj, liveMtime);
      const liveN = liveObj.tareas.length;
      const mejorN = mejor.obj.tareas.length;
      // Nunca degradar: live con más tareas, o live igual de fresco.
      if (liveN > mejorN) {
        console.log('[sync] Live conservado (' + liveN + ' tareas > respaldo ' + mejorN + ') ←', path.basename(mejor.path));
        return;
      }
      if (liveScore >= mejor.score) {
        console.log('[sync] Live ya al día ←', path.basename(mejor.path));
        return;
      }
      if (mejor.mtime <= liveMtime && mejor.score <= liveScore) {
        console.log('[sync] Live ya al día ←', path.basename(mejor.path));
        return;
      }
    }
  }

  fs.mkdirSync(path.dirname(LIVE), { recursive: true });

  /** No reabrir tareas que en el live actual ya estaban cerradas / fijadas. */
  let prevLive = null;
  if (fs.existsSync(LIVE)) {
    prevLive = leerJson(LIVE);
  }

  fs.copyFileSync(mejor.path, LIVE);

  if (prevLive && Array.isArray(prevLive.tareas)) {
    const nuevo = leerJson(LIVE);
    if (nuevo && Array.isArray(nuevo.tareas)) {
      const prevById = new Map(prevLive.tareas.filter((t) => t && t.id).map((t) => [t.id, t]));
      let preserved = 0;
      for (const t of nuevo.tareas) {
        if (!t || !t.id) continue;
        const prev = prevById.get(t.id);
        if (!prev) continue;
        if (prev.completada === true || prev.estadoFijado === true) {
          if (t.completada !== true || t.pendiente === true || t.estadoFijado !== prev.estadoFijado) {
            t.completada = prev.completada === true;
            t.pendiente = false;
            if (prev.estadoFijado === true) t.estadoFijado = true;
            preserved += 1;
          }
        }
      }
      if (preserved) {
        nuevo.respaldoActualizado = new Date().toISOString();
        if (!nuevo.meta || typeof nuevo.meta !== 'object') nuevo.meta = {};
        nuevo.meta.actualizado = nuevo.respaldoActualizado;
        fs.writeFileSync(LIVE, JSON.stringify(nuevo, null, 2) + '\n', 'utf8');
        console.log('[sync] Preservadas', preserved, 'tareas ya cerradas/fijadas del live anterior');
      }
    }
  }

  console.log('[sync] Actualizado data/organizacion-live.json ←', mejor.path);
  console.log('[sync] Fecha respaldo:', mejor.obj.respaldoActualizado || '(sin fecha)');
  if (force) console.log('[sync] Modo --force' + (soloRepo ? ' --solo-repo (solo data/ del repo)' : ''));
}

function candidatos({ soloRepo = false } = {}) {
  const list = [];
  const dirs = soloRepo
    ? [DATA_DIR].filter((d) => d && fs.existsSync(d))
    : [DATA_DIR, DOWNLOADS].filter((d) => d && fs.existsSync(d));

  dirs.forEach((dir) => {
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

main();
