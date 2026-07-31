(function () {
  if (location.protocol !== 'file:') return;

  const p = (location.pathname || '').replace(/\\/g, '/');
  let destino = 'http://127.0.0.1:8000/';
  if (/\/index\/clientes\/joyasmercury/i.test(p)) {
    destino = 'http://127.0.0.1:8000/index/clientes/joyasmercury/';
  } else if (/\/index\/clientes/i.test(p)) {
    destino = 'http://127.0.0.1:8000/index/clientes/';
  }

  const banner = document.createElement('div');
  banner.className = 'file-protocol-banner';
  banner.setAttribute('role', 'alert');
  banner.innerHTML =
    '<p><strong>Estás abriendo archivos desde el disco (file://).</strong> ' +
    'Por eso ves listados de carpetas o enlaces rotos. El flujo continuo solo funciona con Laravel en :8000.</p>' +
    '<ol class="file-protocol-banner__pasos">' +
    '<li>En la carpeta <code>organizacion</code> ejecuta: <code>ABRIR-LARAVEL.bat</code></li>' +
    '<li>Organizador: <a href="http://127.0.0.1:8000/index.html">http://127.0.0.1:8000/index.html</a></li>' +
    '<li>Portal clientes: <a href="http://127.0.0.1:8000/index/clientes/">http://127.0.0.1:8000/index/clientes/</a></li>' +
    '</ol>' +
    '<p class="file-protocol-banner__nota">Todas las landings (JM, MKOF, ECR, etc.) están en el portal de clientes.</p>';

  document.body.prepend(banner);
})();
