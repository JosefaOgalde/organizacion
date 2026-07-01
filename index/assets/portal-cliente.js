(function () {
  if (typeof CLIENTES_PORTAL === 'undefined') return;

  const slug = document.body.dataset.clienteSlug;
  const archivoLegacy = document.body.dataset.cliente;
  const depth = Number(document.body.dataset.portalDepth || (slug ? 1 : 0));

  const c = slug
    ? CLIENTES_PORTAL.find((x) => x.slug === slug)
    : CLIENTES_PORTAL.find((x) => x.archivo === archivoLegacy || x.archivo?.startsWith(archivoLegacy));

  const root = document.getElementById('portal-root');
  if (!root) return;

  if (!c) {
    root.innerHTML = '<p class="portal-paso">Cliente no encontrado.</p>';
    return;
  }

  const STORAGE_KEY = 'organizacion_v2';
  let datos = null;
  let modoEdicion = false;

  const pathUp = depth ? '../'.repeat(depth) : './';
  const pathOrganizador = depth ? '../../../index.html' : '../../index.html';
  const pathListado = depth ? '../' : '../clientes.html';

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

  function hrefProyecto(archivo) {
    if (!archivo) return '#';
    if (/^https?:\/\//i.test(archivo) || archivo.startsWith('/')) return archivo;
    const limpio = archivo.replace(/\.html$/i, '');
    return depth ? `${pathUp}${limpio}` : limpio;
  }

  function contarTareasCliente() {
    if (!datos?.tareas) return { total: 0, pendientes: 0 };
    const delCliente = datos.tareas.filter((t) => t.clienteId === c.id);
    return {
      total: delCliente.length,
      pendientes: delCliente.filter((t) => !t.completada && !t.pendiente).length
    };
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
        onChange() { guardar(cli); },
        onError(msg) { toast(msg); }
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
        onError(msg) { toast(msg); }
      });
    }
  }

  function heroHtml(cfg, stats) {
    const tagline = cfg?.tagline || c.agente;
    return `<header class="portal-landing-hero">
      <span class="portal-badge">${escapeHtml(c.tipo)}</span>
      <h1 class="portal-landing-hero__titulo">${escapeHtml(c.nombre)}</h1>
      <p class="portal-landing-hero__tagline">${escapeHtml(tagline)}</p>
      <p class="portal-landing-hero__meta">${escapeHtml(c.abrev)} · ${escapeHtml(c.agente)}</p>
      ${stats.total ? `<div class="portal-landing-stats">
        <span class="portal-landing-stat"><strong>${stats.total}</strong> tareas</span>
        ${stats.pendientes ? `<span class="portal-landing-stat"><strong>${stats.pendientes}</strong> activas</span>` : ''}
      </div>` : ''}
    </header>`;
  }

  function entregablesHtml(cfg) {
    const items = cfg?.entregables || [];
    if (!items.length) return '';
    return `<section class="portal-landing-entregables">
      <h2>Entregables</h2>
      <ul class="portal-landing-chips">
        ${items.map((e) => `<li class="portal-landing-chip">${escapeHtml(e)}</li>`).join('')}
      </ul>
    </section>`;
  }

  function seccionesHtml(cfg) {
    const secs = cfg?.secciones || [];
    if (!secs.length) {
      return `<section>
        <h2>Resumen</h2>
        <p>${escapeHtml(c.resumen)}</p>
      </section>`;
    }
    return secs.map((s) => `<section>
      <h2>${escapeHtml(s.titulo)}</h2>
      <p>${escapeHtml(s.texto)}</p>
    </section>`).join('');
  }

  function render() {
    const cli = cargarDatos();
    const landingCfg = c.landing || {};
    const landing = cli.ficha.landing;
    const stats = contarTareasCliente();

    document.title = `${c.nombre} · Landing`;
    if (typeof window.aplicarTemaPortal === 'function') {
      window.aplicarTemaPortal(c.color);
    }

    const proyectosHtml = c.proyectos?.length
      ? `<section>
          <h2>Proyectos</h2>
          <p>Cada proyecto tiene su propia landing e identidad visual.</p>
          <div class="portal-grid portal-grid--proyectos">
            ${c.proyectos.map((p) => `
              <a href="${hrefProyecto(p.archivo)}" class="portal-card"
                 style="--card-border:${p.color.border};--card-bg:${p.color.bg};--card-text:${p.color.text}">
                <div class="portal-card__tipo">${escapeHtml(p.codigo)}</div>
                <h2 class="portal-card__nombre">${escapeHtml(p.nombre)}</h2>
                <div class="portal-card__abrev">${escapeHtml(p.resumen)}</div>
              </a>`).join('')}
          </div>
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
          <a href="${pathListado}" class="portal-btn portal-btn--ghost">← Clientes</a>
          <a href="${pathOrganizador}" class="portal-btn portal-btn--ghost">Organizador</a>
          <button type="button" class="portal-btn${modoEdicion ? ' portal-btn--active' : ''}" id="portal-btn-editar">
            ${modoEdicion ? 'Listo' : 'Editar landing'}
          </button>
        </div>
        ${modoEdicion ? '<p class="portal-cliente__hint landing-img__solo-edicion">Agrega imágenes, mockups o referencias. Se guardan en tu organizador local.</p>' : ''}
        ${heroHtml(landingCfg, stats)}
        ${entregablesHtml(landingCfg)}
        ${seccionesHtml(landingCfg)}
        ${imagenesHtml}
        ${wireframesHtml}
        ${proyectosHtml}
        <section>
          <h2>Enlaces</h2>
          <ul>
            <li><a href="${pathOrganizador}">Abrir organizador principal</a></li>
            <li><a href="${pathOrganizador}#clientes">Ficha completa en Clientes</a></li>
            <li><a href="${pathListado}">Volver al listado de clientes</a></li>
          </ul>
        </section>
        <a href="${pathOrganizador}" class="portal-app-link">Ir al organizador →</a>
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
