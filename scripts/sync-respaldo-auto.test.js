const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const SYNC_SOURCE = path.join(__dirname, 'sync-respaldo-auto.js');
const ROOT = path.join(__dirname, '..');

function datos(titulo, respaldoActualizado) {
  return {
    respaldoActualizado,
    clientes: [],
    tareas: [{ id: titulo, titulo }],
  };
}

function entornoTemporal(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-respaldo-'));
  const scripts = path.join(root, 'scripts');
  const data = path.join(root, 'data');
  const home = path.join(root, 'home');

  fs.mkdirSync(scripts);
  fs.mkdirSync(data);
  fs.mkdirSync(path.join(home, 'Downloads'), { recursive: true });
  fs.copyFileSync(SYNC_SOURCE, path.join(scripts, 'sync-respaldo-auto.js'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  return {
    data,
    ejecutar() {
      return execFileSync(process.execPath, [path.join(scripts, 'sync-respaldo-auto.js')], {
        encoding: 'utf8',
        env: { ...process.env, HOME: home, USERPROFILE: home },
      });
    },
  };
}

function escribirJson(ruta, valor, fechaMtime) {
  fs.writeFileSync(ruta, `${JSON.stringify(valor)}\n`);
  fs.utimesSync(ruta, fechaMtime, fechaMtime);
}

test('conserva el live nuevo aunque el respaldo viejo tenga un mtime reciente', (t) => {
  const env = entornoTemporal(t);
  const live = path.join(env.data, 'organizacion-live.json');
  const respaldo = path.join(env.data, 'organizacion-respaldo-viejo.json');

  escribirJson(live, datos('Trabajo nuevo', '2026-07-21T10:00:00Z'), new Date('2026-07-21T10:00:00Z'));
  escribirJson(respaldo, datos('Respaldo viejo', '2026-07-17T10:00:00Z'), new Date('2026-07-21T11:00:00Z'));

  const salida = env.ejecutar();

  assert.match(salida, /Live ya al día/);
  assert.equal(JSON.parse(fs.readFileSync(live, 'utf8')).tareas[0].titulo, 'Trabajo nuevo');
});

test('actualiza el live cuando el contenido del respaldo sí es más nuevo', (t) => {
  const env = entornoTemporal(t);
  const live = path.join(env.data, 'organizacion-live.json');
  const respaldo = path.join(env.data, 'organizacion-respaldo-nuevo.json');

  escribirJson(live, datos('Trabajo viejo', '2026-07-17T10:00:00Z'), new Date('2026-07-21T11:00:00Z'));
  escribirJson(respaldo, datos('Trabajo nuevo', '2026-07-21T10:00:00Z'), new Date('2026-07-17T10:00:00Z'));

  const salida = env.ejecutar();

  assert.match(salida, /Actualizado data\/organizacion-live\.json/);
  assert.equal(JSON.parse(fs.readFileSync(live, 'utf8')).tareas[0].titulo, 'Trabajo nuevo');
});

test('crea el live desde el respaldo cuando todavía no existe', (t) => {
  const env = entornoTemporal(t);
  const live = path.join(env.data, 'organizacion-live.json');
  const respaldo = path.join(env.data, 'organizacion-respaldo-base.json');

  escribirJson(respaldo, datos('Respaldo base', '2026-07-17T10:00:00Z'), new Date('2026-07-17T10:00:00Z'));

  env.ejecutar();

  assert.equal(JSON.parse(fs.readFileSync(live, 'utf8')).tareas[0].titulo, 'Respaldo base');
});

test('los lanzadores de uso diario nunca fuerzan un respaldo sobre el live', () => {
  for (const archivo of ['ABRIR-LARAVEL.bat', 'ABRIR-ORGANIZADOR-HOY.bat', 'ABRIR-IMPRESOREANDO.bat']) {
    const contenido = fs.readFileSync(path.join(ROOT, archivo), 'utf8');
    assert.doesNotMatch(contenido, /sync-respaldo-auto\.js\s+--force/, archivo);
  }
});
