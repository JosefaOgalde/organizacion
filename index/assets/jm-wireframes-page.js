/**
 * Página wireframes JM (desktop / mobile): carrusel + reemplazo de imágenes.
 * Uso: body[data-jm-wf-mode="desktop"|"mobile"]
 */
(function () {
  const CLI_ID = 'cli-joyas-mercury';
  const STORAGE_KEY = 'organizacion_v2';
  const mode = (document.body.dataset.jmWfMode || 'desktop').toLowerCase();
  const root = document.getElementById('galeria-root');
  if (!root) return;

  let datos = null;
  let landing = null;
  let modoEdicion = false;

  function toast(msg) {
    let el = document.getElementById('jm-wf-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'jm-wf-toast';
      el.className = 'jm-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('jm-toast--visible');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('jm-toast--visible'), 2400);
  }

  function cargarDatos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) datos = JSON.parse(raw);
    } catch {
      datos = null;
    }
    if (!datos || !Array.isArray(datos.clientes)) {
      datos = { clientes: [], tareas: [], version: 2 };
    }
    if (typeof window.jmAsegurarDatosMinimos === 'function') window.jmAsegurarDatosMinimos(datos);
    let cli = datos.clientes.find((c) => c.id === CLI_ID);
    if (!cli) {
      cli = {
        id: CLI_ID,
        nombre: 'Joyas Mercury',
        abrev: 'JM',
        tipo: 'Freelance',
        ficha: { documentos: [], seccionesExtra: [], landing: {} }
      };
      datos.clientes.push(cli);
    }
    if (!cli.ficha) cli.ficha = { documentos: [], seccionesExtra: [] };
    if (!cli.ficha.landing) cli.ficha.landing = {};
    if (typeof window.jmMigrarLandingJM === 'function') window.jmMigrarLandingJM(cli);
    landing = cli.ficha.landing;
    if (!landing.imagenesOverrides || typeof landing.imagenesOverrides !== 'object') {
      landing.imagenesOverrides = {};
    }
    if (!Array.isArray(landing.imagenesOcultas)) landing.imagenesOcultas = [];
    if (!landing.imagenesMeta || typeof landing.imagenesMeta !== 'object') {
      landing.imagenesMeta = {};
    }
    return cli;
  }

  function guardar(cli) {
    try {
      cli.ficha.actualizado = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
      if (typeof window.persistOrganizacionToDisk === 'function') {
        window.persistOrganizacionToDisk(datos);
      }
      toast('Imagen guardada');
    } catch (e) {
      toast('No se pudo guardar');
      console.error(e);
    }
  }

  function carruselHtml() {
    if (mode === 'mobile') {
      return typeof window.jmHtmlLandingsCarruselMobile === 'function'
        ? window.jmHtmlLandingsCarruselMobile()
        : '';
    }
    return typeof window.jmHtmlLandingsCarrusel === 'function'
      ? window.jmHtmlLandingsCarrusel()
      : '';
  }

  function render(cli) {
    const editClass = modoEdicion ? ' jm-landing--edicion ficha-doc--edicion' : '';
    root.innerHTML = `<div class="jm-landing jm-landing--ficha ficha-doc--jm${editClass}">${carruselHtml()}</div>`;
    document.body.classList.toggle('jm-wf-edicion', modoEdicion);
    const btn = document.getElementById('jm-wf-btn-editar');
    if (btn) btn.textContent = modoEdicion ? 'Listo' : 'Cambiar imágenes';
    if (typeof window.initJMWireframesUI === 'function') window.initJMWireframesUI(root);
    initImagenesEditor(cli);
  }

  function initImagenesEditor(cli) {
    if (typeof window.initJMImagenesEditorUI !== 'function') return;
    window.initJMImagenesEditorUI(root, {
      imagenesOverrides: landing.imagenesOverrides,
      imagenesOcultas: landing.imagenesOcultas,
      imagenesMeta: landing.imagenesMeta,
      maxBytes: 2.5 * 1024 * 1024,
      onChange(state) {
        Object.assign(landing, state);
        guardar(cli);
      },
      onError(msg) {
        toast(msg);
      }
    });
  }

  function bindToolbar(cli) {
    document.getElementById('jm-wf-btn-editar')?.addEventListener('click', () => {
      modoEdicion = !modoEdicion;
      render(cli);
      if (modoEdicion) {
        toast('Selecciona una captura y usa «Cambiar imagen»');
      }
    });
  }

  function boot() {
    const cli = cargarDatos();
    bindToolbar(cli);
    render(cli);
  }

  const ready = mode === 'mobile'
    ? window.jmLandingsCarruselMobileReady
    : window.jmLandingsCarruselReady;
  if (ready && typeof ready.then === 'function') ready.finally(boot);
  else boot();
})();
