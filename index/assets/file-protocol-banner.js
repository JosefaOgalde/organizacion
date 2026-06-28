(function () {
  if (location.protocol !== 'file:') return;

  const p = (location.pathname || '').replace(/\\/g, '/');
  let destino = 'http://localhost:3000/';
  if (/\/index\/clientes\/joyasmercury/i.test(p)) {
    destino = 'http://localhost:3000/index/clientes/joyasmercury/';
  } else if (/\/index\/clientes/i.test(p)) {
    destino = 'http://localhost:3000/index/clientes/';
  }

  const banner = document.createElement('div');
  banner.className = 'file-protocol-banner';
  banner.setAttribute('role', 'alert');
  banner.innerHTML =
    '<p><strong>Estás abriendo archivos desde el disco (file://).</strong> ' +
    'Por eso ves listados de carpetas o enlaces rotos. El flujo continuo solo funciona con servidor local.</p>' +
    '<ol class="file-protocol-banner__pasos">' +
    '<li>Abre <strong>PowerShell</strong> o <strong>Terminal</strong> en la carpeta <code>organizacion</code></li>' +
    '<li>Ejecuta: <code>npx serve .</code></li>' +
    '<li>Entra en el navegador a: <a href="' + destino + '">' + destino + '</a></li>' +
    '</ol>' +
    '<p class="file-protocol-banner__nota">Landing JM: <code>/index/clientes/joyasmercury/</code> · ' +
    'Wireframes y prototipo también viven en esa carpeta.</p>';

  document.body.prepend(banner);
})();
