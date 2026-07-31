/**
 * Copia Joyas Mercury a %USERPROFILE%/joyasmercury-archivo-organizacion/
 * Si la carpeta del repo ya está vacía, restaura desde el tag git y luego archiva.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'index', 'clientes', 'joyasmercury');
const TAG = 'archivo-joyas-mercury-2026-07-31';
const home = process.env.USERPROFILE || process.env.HOME || '';
const stamp = new Date().toISOString().slice(0, 10);
const DEST = path.join(home, 'joyasmercury-archivo-organizacion', stamp);

const extra = [
  'data/jm-backup-contenido.js',
  'docs/JM-LANDING-HANDOFF.md',
  'index/assets/jm-landing.js',
  'index/assets/jm-landing.css',
  'index/assets/jm-wireframes-page.js',
];

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

function main() {
  if (!home) {
    console.error('[jm-archivo] No hay USERPROFILE/HOME');
    process.exit(1);
  }

  if (!hasBulk(SRC)) {
    try {
      restoreFromTag();
    } catch (e) {
      console.error('[jm-archivo] No hay carpeta JM llena ni tag git. Nada que archivar.');
      console.error(String(e && e.message ? e.message : e));
      process.exit(1);
    }
  }

  fs.mkdirSync(DEST, { recursive: true });
  const destJm = path.join(DEST, 'joyasmercury');
  console.log(`[jm-archivo] Copiando ${SRC}`);
  console.log(`[jm-archivo] → ${destJm}`);
  copyRecursive(SRC, destJm);

  for (const rel of extra) {
    const from = path.join(ROOT, rel);
    if (!fs.existsSync(from)) continue;
    const to = path.join(DEST, rel.replace(/\//g, path.sep));
    copyRecursive(from, to);
    console.log(`[jm-archivo] + ${rel}`);
  }

  const nota = [
    'Joyas Mercury — archivo local (no va a Git)',
    `Fecha: ${new Date().toISOString()}`,
    `Origen repo: ${ROOT}`,
    `Tag git de respaldo: ${TAG}`,
    '',
    'Para volver a poner en el repo (solo si retomas JM):',
    `  git checkout ${TAG} -- index/clientes/joyasmercury data/jm-backup-contenido.js`,
    'o copia desde esta carpeta hacia index/clientes/joyasmercury/',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(DEST, 'LEEME.txt'), nota, 'utf8');

  // Dejar el working tree como en HEAD (no reintroducir JM al repo)
  try {
    execSync(
      'git restore --source=HEAD --staged --worktree -- index/clientes/joyasmercury data/jm-backup-contenido.js docs/JM-LANDING-HANDOFF.md',
      { cwd: ROOT, stdio: 'ignore' }
    );
  } catch {
    /* ok si algún path ya no existe en HEAD */
  }

  console.log('');
  console.log('[jm-archivo] Listo. Copia actualizada en:');
  console.log(`  ${DEST}`);
  console.log('No hace falta volver a subir esto a GitHub.');
}

main();
