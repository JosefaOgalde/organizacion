(function () {
  const grid = document.getElementById('clientes-grid');
  if (!grid) return;

  const API_URL = '/api/clientes';
  const ACTIVO_KEY = 'portal_clientes_activo_v1';

  /** Abreviaturas / slugs cortos → carpeta real (por si la API aún trae legacy). */
  const SLUG_CARPETA = {
    ts: 'trendseeker',
    pisc: 'piscineria',
    hs: 'hotspring',
    jm: 'joyasmercury',
    'joyas-mercury': 'joyasmercury',
    adl: 'desafio-latam',
    imp: 'impresoreando',
    tw: 'tronwell',
    her: 'herramientas',
  };

  const GRIS = { border: '#9a9a9a', bg: '#ececec', text: '#5a5a5a' };

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function leerOverridesActivo() {
    try {
      const raw = localStorage.getItem(ACTIVO_KEY);
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === 'object' ? data : {};
    } catch {
      return {};
    }
  }

  function guardarOverrideActivo(id, activo) {
    if (!id) return;
    const map = leerOverridesActivo();
    map[id] = !!activo;
    try {
      localStorage.setItem(ACTIVO_KEY, JSON.stringify(map));
    } catch {
      /* ignore */
    }
  }

  /** Quita overrides de clientes cerrados fijos (p. ej. JM reactivado por error). */
  function purgarOverridesCerrados(lista) {
    const map = leerOverridesActivo();
    let changed = false;
    for (const c of lista || []) {
      const estatico = findEstatico(c);
      if (!esClienteCerradoFijo(c, estatico)) continue;
      for (const id of [c.id, estatico?.id].filter(Boolean).map(String)) {
        if (Object.prototype.hasOwnProperty.call(map, id)) {
          delete map[id];
          changed = true;
        }
      }
    }
    if (!changed) return;
    try {
      localStorage.setItem(ACTIVO_KEY, JSON.stringify(map));
    } catch {
      /* ignore */
    }
  }

  /** Une slugs de la API con CLIENTES_PORTAL (id, slug, aliases, abrev). */
  function findEstatico(c) {
    if (typeof CLIENTES_PORTAL === 'undefined') return null;
    const slug = String(c.slug || '').toLowerCase();
    const id = String(c.id || '');
    const abrev = String(c.abrev || '').toLowerCase();
    const nombre = String(c.nombre || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    return (
      CLIENTES_PORTAL.find((x) => x.id === id) ||
      CLIENTES_PORTAL.find((x) => x.slug === slug) ||
      CLIENTES_PORTAL.find((x) => (x.slugAliases || []).includes(slug)) ||
      CLIENTES_PORTAL.find((x) => String(x.abrev || '').toLowerCase() === abrev) ||
      CLIENTES_PORTAL.find((x) => x.id === `cli-${slug}`) ||
      CLIENTES_PORTAL.find((x) => {
        const n = String(x.nombre || '')
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .trim();
        return n && nombre && (n === nombre || nombre.startsWith(n) || n.startsWith(nombre.split(' - ')[0]));
      }) ||
      null
    );
  }

  /** Colores del portal estático (v2) ganan: no depender de SQLite viejo. */
  function colorDe(c, estatico) {
    if (estatico?.color?.border && estatico.color.bg && estatico.color.text) {
      return estatico.color;
    }
    if (c.color_border && c.color_bg && c.color_text) {
      return { border: c.color_border, bg: c.color_bg, text: c.color_text };
    }
    return { border: '#0285E2', bg: '#E5F3FC', text: '#0A4A7A' };
  }

  function landingJoyasMercury() {
    return 'joyasmercury/index.html?v=secciones3';
  }

  function archivoDe(c) {
    if (
      c.id === 'cli-joyas-mercury' ||
      c.slug === 'joyas-mercury' ||
      c.slug === 'joyasmercury' ||
      c.slug === 'jm'
    ) {
      return landingJoyasMercury();
    }
    const estatico = findEstatico(c);
    if (estatico?.archivo) return estatico.archivo;
    const slug = String(c.slug || '').toLowerCase();
    const carpeta = SLUG_CARPETA[slug] || slug;
    return `${carpeta}/index.html`;
  }

  function tipoLabel(tipo) {
    if (!tipo) return 'Cliente';
    return tipo.replace('full-time', 'Full time').replace('-', ' ');
  }

  function hrefFicha(archivo) {
    const p = (location.pathname || '').replace(/\\/g, '/');
    const enListadoClientes = /\/index\/clientes\/?(index\.html)?$/i.test(p);
    if (enListadoClientes) return archivo;
    return `clientes/${archivo}`;
  }

  function flagActivo(val) {
    if (val === false || val === 0 || val === '0' || val === 'false') return false;
    if (val === true || val === 1 || val === '1' || val === 'true') return true;
    return null;
  }

  /** Clientes cerrados aunque la API Laravel aún no tenga columna `activo`. */
  function esClienteCerradoFijo(c, estatico) {
    const slug = String(c.slug || estatico?.slug || '')
      .toLowerCase()
      .replace(/\s+/g, '');
    const abrev = String(c.abrev || estatico?.abrev || '')
      .toLowerCase()
      .trim();
    const nombre = String(c.nombre || estatico?.nombre || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    const id = String(c.id || estatico?.id || '').toLowerCase();
    if (id === 'cli-joyas-mercury') return true;
    if (abrev === 'jm') return true;
    if (slug === 'joyasmercury' || slug === 'joyas-mercury' || slug === 'jm') return true;
    if (nombre === 'joyas mercury' || nombre.startsWith('joyas mercury')) return true;
    return false;
  }

  /**
   * Activo salvo:
   * - lista fija de cerrados (Joyas Mercury) — siempre gana, ignora Reactivar,
   * - flag `activo: false` en estático (gana sobre API),
   * - flag en API,
   * - override localStorage (Reactivar) solo para el resto.
   */
  function esActivo(c) {
    const estatico = findEstatico(c);
    if (esClienteCerradoFijo(c, estatico)) return false;

    const estFlag = estatico ? flagActivo(estatico.activo) : null;
    if (estFlag === false) return false;

    const apiFlag = flagActivo(c.activo);
    if (apiFlag === false) return false;

    const overrides = leerOverridesActivo();
    const idsOverride = [c.id, estatico?.id].filter(Boolean).map(String);
    for (const id of idsOverride) {
      if (Object.prototype.hasOwnProperty.call(overrides, id)) {
        return !!overrides[id];
      }
    }

    return true;
  }

  /** Evita tarjetas repetidas (p. ej. slug ts + trendseeker). */
  function dedupeClientes(lista) {
    const out = [];
    const visto = new Set();
    for (const c of lista || []) {
      const key = String(c.abrev || c.slug || c.id || c.nombre || '')
        .trim()
        .toUpperCase();
      if (!key || visto.has(key)) continue;
      visto.add(key);
      out.push(c);
    }
    return out;
  }

  function tarjetaActivaHtml(c, origen) {
    const estatico = findEstatico(c);
    const col = colorDe(c, estatico);
    const archivo = archivoDe(c);
    const agente = c.agente || estatico?.agente || '';
    return `
    <a href="${hrefFicha(archivo)}" class="portal-card"
       style="--card-border:${col.border};--card-bg:${col.bg};--card-text:${col.text}">
      <div class="portal-card__tipo">${escapeHtml(tipoLabel(c.tipo))}${origen === 'api' ? ' · API' : ''}</div>
      <h2 class="portal-card__nombre">${escapeHtml(c.nombre)}</h2>
      <div class="portal-card__abrev">${escapeHtml(c.abrev)}${agente ? ` · ${escapeHtml(agente)}` : ''}</div>
    </a>`;
  }

  function tarjetaInactivaHtml(c, origen) {
    const estatico = findEstatico(c);
    const archivo = archivoDe(c);
    const agente = c.agente || estatico?.agente || '';
    /** Preferir id estático para que Reactivar / overrides coincidan con clientes-data. */
    const idRaw = String(estatico?.id || c.id || '');
    const id = escapeHtml(idRaw);
    const cerradoFijo = esClienteCerradoFijo(c, estatico);
    const accion = cerradoFijo
      ? '<span class="portal-card__cerrado">Cerrado · etapa entregada</span>'
      : `<button type="button" class="portal-card__reactivar" data-reactivar="${id}">Reactivar</button>`;
    return `
    <article class="portal-card portal-card--inactivo"${cerradoFijo ? ' data-cerrado-fijo="1"' : ''}
       style="--card-border:${GRIS.border};--card-bg:${GRIS.bg};--card-text:${GRIS.text}">
      <a href="${hrefFicha(archivo)}" class="portal-card__link">
        <div class="portal-card__tipo">Inactivo · ${escapeHtml(tipoLabel(c.tipo))}${origen === 'api' ? ' · API' : ''}</div>
        <h2 class="portal-card__nombre">${escapeHtml(c.nombre)}</h2>
        <div class="portal-card__abrev">${escapeHtml(c.abrev)}${agente ? ` · ${escapeHtml(agente)}` : ''}</div>
      </a>
      ${accion}
    </article>`;
  }

  function asegurarSeccionInactivos() {
    let sec = document.getElementById('clientes-inactivos');
    if (sec) return sec;
    sec = document.createElement('section');
    sec.id = 'clientes-inactivos';
    sec.className = 'portal-inactivos';
    sec.hidden = true;
    sec.innerHTML = `
      <header class="portal-inactivos__head">
        <h2 class="portal-inactivos__titulo">Clientes inactivos</h2>
        <p class="portal-inactivos__texto">Sin pendientes ni cotización. Podés reactivarlos cuando haga falta.</p>
      </header>
      <div id="clientes-grid-inactivos" class="portal-grid portal-grid--inactivos"></div>`;
    grid.insertAdjacentElement('afterend', sec);
    return sec;
  }

  function renderTarjetas(lista, origen) {
    const unica = dedupeClientes(lista);
    purgarOverridesCerrados(unica);
    const activos = [];
    const inactivos = [];
    unica.forEach((c) => (esActivo(c) ? activos : inactivos).push(c));

    grid.innerHTML = activos.map((c) => tarjetaActivaHtml(c, origen)).join('');

    const sec = asegurarSeccionInactivos();
    const gridIn = document.getElementById('clientes-grid-inactivos');
    if (!inactivos.length) {
      sec.hidden = true;
      if (gridIn) gridIn.innerHTML = '';
      return;
    }
    sec.hidden = false;
    if (gridIn) {
      gridIn.innerHTML = inactivos.map((c) => tarjetaInactivaHtml(c, origen)).join('');
    }
  }

  let listaActual = [];
  let origenActual = 'static';

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-reactivar]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const id = btn.getAttribute('data-reactivar');
    if (!id) return;
    const cli = (listaActual || []).find(
      (c) => String(c.id) === id || String(findEstatico(c)?.id || '') === id
    );
    if (cli && esClienteCerradoFijo(cli, findEstatico(cli))) {
      console.info('Portal: Joyas Mercury permanece cerrada (no se reactiva desde UI)');
      return;
    }
    guardarOverrideActivo(id, true);
    renderTarjetas(listaActual, origenActual);
  });

  async function cargar() {
    try {
      const res = await fetch(API_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error('API no disponible');
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) throw new Error('API vacía');
      listaActual = data;
      origenActual = 'api';
      renderTarjetas(listaActual, origenActual);
      console.info('Portal: clientes desde API Laravel', API_URL);
    } catch (e) {
      if (typeof CLIENTES_PORTAL === 'undefined') {
        grid.innerHTML = '<p class="portal-paso">Sin API ni datos estáticos. Arranca ABRIR-LARAVEL.bat.</p>';
        return;
      }
      listaActual = CLIENTES_PORTAL;
      origenActual = 'static';
      renderTarjetas(listaActual, origenActual);
      console.warn('Portal: usando clientes-data.js (API no disponible)', e.message);
    }
  }

  cargar();
})();
