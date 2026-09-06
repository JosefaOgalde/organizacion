const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');

function leer(nombre) {
  return fs.readFileSync(path.join(root, nombre), 'utf8');
}

test('el flujo diario abre Laravel sin forzar una restauración', () => {
  const traerCambios = leer('TRAER-CAMBIOS.bat');

  assert.match(
    traerCambios,
    /call "%~dp0ABRIR-LARAVEL\.bat"\s*(?:\r?\n)/i,
    'TRAER-CAMBIOS debe conservar el live existente al abrir Laravel',
  );
  assert.doesNotMatch(
    traerCambios,
    /call "%~dp0ABRIR-LARAVEL\.bat"\s+restaurar/i,
    'La restauración destructiva debe quedar como una acción explícita',
  );
});
