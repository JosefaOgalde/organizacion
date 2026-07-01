(function () {
  const archivo = document.body.dataset.cliente;
  if (!archivo || typeof CLIENTES_PORTAL === 'undefined') return;

  const c = CLIENTES_PORTAL.find((x) => x.archivo === archivo);
  const root = document.getElementById('portal-root');
  if (!root) return;

  if (!c) {
    root.innerHTML = '<p class="portal-paso">Cliente no encontrado.</p>';
    return;
  }

  const STORAGE_KEY = 'organizacion_v2';
  let datos = null;
  let modoEdicion = false;

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toast(msg) {
    let el = document.getElementById('portal-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'portal-toast';
      el.className = 'portal-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('portal-toast--visible');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('portal-toast--visible'), 2400);
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
    let cli = datos.clientes.find((x) => x.id === c.id);
    if (!cli) {
      cli = {
        id: c.id,
        nombre: c.nombre,
        abrev: c.abrev,
        tipo: c.tipo,
        color: c.color,
        ficha: { documentos: [], seccionesExtra: [] }
      };
      datos.clientes.push(cli);
    }
    if (!cli.ficha) cli.ficha = { documentos: [], seccionesExtra: [] };
    if (typeof window.LandingImagenesStore !== 'undefined') {
      window.LandingImagenesStore.asegurarLanding(cli);
    } else if (!cli.ficha.landing) {
      cli.ficha.landing = { imagenes: [] };
    }
    return cli;
  }

  function guardar(cli) {
    try {
      cli.ficha.actualizado = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
      toast('Cambios guardados');
    } catch (e) {
      toast('No se pudo guardar');
      console.error(e);
    }
  }

  function imagenesSeccionHtml(landing) {
    if (typeof window.htmlLandingImagenesSeccion !== 'function') return '';
    return window.htmlLandingImagenesSeccion(landing, { claseExtra: 'ficha-seccion--portal' });
  }

  function initImagenes(rootEl, cli) {
    const landing = cli.ficha.landing;
    if (typeof window.initLandingImagenesGaleriaUI === 'function') {
      window.initLandingImagenesGaleriaUI(rootEl, {
        landing,
        onChange() {
          guardar(cli);
        },
        onError(msg) {
          toast(msg);
        }
      });
    }
    if (typeof window.initJMImagenesEditorUI === 'function') {
      window.initJMImagenesEditorUI(rootEl, {
        imagenesOverrides: landing.imagenesOverrides || {},
        imagenesOcultas: landing.imagenesOcultas || [],
        imagenesMeta: landing.imagenesMeta || {},
        onChange(state) {
          Object.assign(landing, state);
          guardar(cli);
        },
        onError(msg) {
          toast(msg);
        }
      });
    }
  }

  function render() {
    const cli = cargarDatos();
    const landing = cli.ficha.landing;
    document.title = `${c.nombre} · Clientes`;

    const proyectosHtml =
      c.proyectos?.length
        ? `<section>
            <h2>Proyectos (identidad separada)</h2>
            <p>Cada proyecto mantiene su manual de marca y entregables sin mezclar gráficas.</p>
            <div class="portal-grid portal-grid--proyectos">
              ${c.proyectos
                .map(
                  (p) => `
                <a href="${p.archivo}" class="portal-card"
                   style="--card-border:${p.color.border};--card-bg:${p.color.bg};--card-text:${p.color.text}">
                  <div class="portal-card__tipo">${p.codigo}</div>
                  <h2 class="portal-card__nombre">${p.nombre}</h2>
                  <div class="portal-card__abrev">${p.resumen}</div>
                </a>`
                )
                .join('')}
            </div>
            ${c.slug === 'herramientas' ? `
            <p style="margin-top:1rem">
              <a href="Herramientas/Tendencias.html" class="portal-btn portal-btn--ghost" style="display:inline-block;text-decoration:none;margin-right:0.5rem">
                Ver brief del proyecto
              </a>
              <a href="Herramientas/Tendencias.html?vista=buscador" class="portal-btn tend-btn-principal" style="display:inline-block;text-decoration:none">
                Abrir buscador de tendencias →
              </a>
              <span style="display:block;margin-top:0.5rem;font-size:0.82rem;color:var(--muted)">
                En <code>Herramientas/Tendencias.html</code> puedes leer el brief o abrir el buscador con filtros por fecha y red
              </span>
            </p>` : ''}
          </section>`
        : '';

    const wireframesHtml =
      c.slug === 'joyas-mercury' && typeof window.jmHtmlWireframes === 'function'
        ? window.jmHtmlWireframes({ claseExtra: 'ficha-seccion--portal' })
        : '';

    const imagenesHtml = imagenesSeccionHtml(landing);

    root.innerHTML = `
      <article class="portal-cliente portal-cliente--landing${modoEdicion ? ' portal-cliente--edicion' : ''}"
        style="--card-border:${c.color.border};--card-bg:${c.color.bg};--card-text:${c.color.text}">
        <div class="portal-cliente__toolbar">
          <a href="../../index.html" class="portal-btn portal-btn--ghost">Organizador</a>
          <button type="button" class="portal-btn${modoEdicion ? ' portal-btn--active' : ''}" id="portal-btn-editar">
            ${modoEdicion ? 'Listo' : 'Editar landing'}
          </button>
        </div>
        ${modoEdicion ? '<p class="portal-cliente__hint landing-img__solo-edicion">Agrega imágenes propias, reemplázalas, edita título/notas o bórralas. Todo queda guardado en tu organizador.</p>' : ''}
        <span class="portal-badge">${c.tipo}</span>
        <h1>${escapeHtml(c.nombre)}</h1>
        <p class="portal-cliente__meta">${escapeHtml(c.abrev)} · ${escapeHtml(c.agente)}</p>
        <section>
          <h2>Resumen</h2>
          <p>${escapeHtml(c.resumen)}</p>
        </section>
        ${imagenesHtml}
        ${wireframesHtml}
        ${proyectosHtml}
        <section>
          <h2>Enlaces</h2>
          <ul>
            <li><a href="../../index.html">Abrir organizador principal</a></li>
            <li><a href="../../index.html#clientes">Ficha completa en Clientes</a></li>
            <li><a href="../clientes.html">Volver al listado de clientes</a></li>
          </ul>
        </section>
        <a href="../../index.html" class="portal-app-link">Ir al organizador →</a>
        ${c.slug !== 'joyas-mercury' && c.proyectos?.length ? `<p class="portal-paso">
          <strong>ADL multi-proyecto:</strong> usa las fichas de proyecto arriba para no confundir identidades visuales.
        </p>` : ''}
      </article>`;

    document.getElementById('portal-btn-editar')?.addEventListener('click', () => {
      modoEdicion = !modoEdicion;
      render();
    });

    if (typeof window.initJMWireframesUI === 'function') window.initJMWireframesUI(root);
    initImagenes(root, cli);
  }

  function boot() {
    const wait = c.slug === 'joyas-mercury' && window.jmLandingsCarruselReady
      ? window.jmLandingsCarruselReady
      : Promise.resolve();
    wait.finally(() => render());
  }

  boot();
})();
