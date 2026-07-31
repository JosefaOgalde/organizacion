/**
 * Copia Joyas Mercury a la nube local (OneDrive/iCloud si existe) + carpeta usuario.
 * Preferencia: OneDrive → iCloud Drive → %USERPROFILE%
 * Así el iPad/iPhone puede verlo en la app Archivos.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'index', 'clientes', 'joyasmercury');
const TAG = 'archivo-joyas-mercury-2026-07-31';
const home = process.env.USERPROFILE || process.env.HOME || '';
const stamp = new Date().toISOString().slice(0, 10);

const extra = [
  'data/jm-backup-contenido.js',
  'docs/JM-LANDING-HANDOFF.md',
  'index/assets/jm-landing.js',
  'index/assets/jm-landing.css',
  'index/assets/jm-wireframes-page.js',
];

function existsDir(p) {
  try {
    return p && fs.existsSync(p) && fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function cloudRoots() {
  const roots = [];
  const envOd = process.env.OneDrive || process.env.OneDriveConsumer || process.env.OneDriveCommercial;
  if (envOd) roots.push(envOd);
  if (home) {
    for (const name of ['OneDrive', 'OneDrive - Personal', 'OneDrive - Pessoal']) {
      roots.push(path.join(home, name));
    }
    // iCloud Drive en Windows (si está instalado)
    roots.push(path.join(home, 'iCloudDrive'));
    roots.push(path.join(home, 'iCloud Drive'));
  }
  const seen = new Set();
  return roots.filter((r) => {
    const k = path.resolve(r);
    if (seen.has(k) || !existsDir(r)) return false;
    seen.add(k);
    return true;
  });
}

function hasBulk(dir) {
  try {
    return fs.existsSync(path.join(dir, 'identidad')) || fs.existsSync(path.join(dir, 'CSS-COMPLETO-ASTRA.css'));
  } catch {
    return false;
  }
}

function copyRecursive(src, dest) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      if (name === '.' || name === '..') continue;
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function restoreFromTag() {
  console.log(`[jm-archivo] Restaurando desde tag ${TAG} (temporal)...`);
  execSync(`git checkout ${TAG} -- index/clientes/joyasmercury data/jm-backup-contenido.js docs/JM-LANDING-HANDOFF.md`, {
    cwd: ROOT,
    stdio: 'inherit',
  });
}

function archiveTo(baseDir) {
  const DEST = path.join(baseDir, 'joyasmercury-archivo-organizacion', stamp);
  fs.mkdirSync(DEST, { recursive: true });
  const destJm = path.join(DEST, 'joyasmercury');
  console.log(`[jm-archivo] → ${destJm}`);
  copyRecursive(SRC, destJm);
  for (const rel of extra) {
    const from = path.join(ROOT, rel);
    if (!fs.existsSync(from)) continue;
    copyRecursive(from, path.join(DEST, rel.replace(/\//g, path.sep)));
  }
  const nota = [
    'Joyas Mercury — archivo para PC + iPad/iPhone',
    `Fecha: ${new Date().toISOString()}`,
    `Origen repo: ${ROOT}`,
    `Tag git: ${TAG}`,
    '',
    'Nube GitHub (desde el celu/iPad):',
    '  https://github.com/JosefaOgalde/organizacion/tree/main/index/clientes/joyasmercury',
    '  Release zip: https://github.com/JosefaOgalde/organizacion/releases/tag/jm-archivo-2026-07-31',
    '',
    'Si esta carpeta está en OneDrive/iCloud, abrila en la app Archivos del iPhone/iPad.',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(DEST, 'LEEME.txt'), nota, 'utf8');
  return DEST;
}

function main() {
  if (!home) {
    console.error('[jm-archivo] No hay USERPROFILE/HOME');
    process.exit(1);
  }

  if (!hasBulk(SRC)) {
    try {
      restoreFromTag();
    } catch (e) {
      console.error('[jm-archivo] No hay carpeta JM ni tag git.');
      console.error(String(e && e.message ? e.message : e));
      process.exit(1);
    }
  }

  const targets = [...cloudRoots(), home];
  const written = [];
  const seen = new Set();
  for (const base of targets) {
    const key = path.resolve(base);
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      written.push(archiveTo(base));
    } catch (e) {
      console.warn(`[jm-archivo] No se pudo escribir en ${base}: ${e.message || e}`);
    }
  }

  if (!written.length) {
    console.error('[jm-archivo] No se escribió ninguna copia.');
    process.exit(1);
  }

  console.log('');
  console.log('[jm-archivo] Copias listas:');
  written.forEach((d) => console.log(`  ${d}`));
  console.log('');
  console.log('En iPad/iPhone:');
  console.log('  • App Archivos → OneDrive/iCloud → joyasmercury-archivo-organizacion');
  console.log('  • O GitHub → JosefaOgalde/organizacion → index/clientes/joyasmercury');
}

main();
