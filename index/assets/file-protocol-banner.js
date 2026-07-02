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
    '<li>Ejecuta: <code>SERVIR.bat</code></li>' +
    '<li>Organizador: <a href="http://localhost:3000/index.html">http://localhost:3000/index.html</a></li>' +
    '<li>Portal clientes: <a href="http://localhost:3000/index/clientes/">http://localhost:3000/index/clientes/</a></li>' +
    '</ol>' +
    '<p class="file-protocol-banner__nota">Todas las landings (JM, MKOF, ECR, etc.) están en el portal de clientes.</p>';

  document.body.prepend(banner);
})();
