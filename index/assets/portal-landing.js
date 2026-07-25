(function () {
  const grid = document.getElementById('clientes-grid');
  if (!grid) return;

  const API_URL = '/api/clientes';

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Une slugs cortos de la API (ts, ecr, tw…) con CLIENTES_PORTAL. */
  function findEstatico(c) {
    if (typeof CLIENTES_PORTAL === 'undefined') return null;
    const slug = String(c.slug || '').toLowerCase();
    const id = String(c.id || '');
    const abrev = String(c.abrev || '').toLowerCase();
    return (
      CLIENTES_PORTAL.find((x) => x.id === id) ||
      CLIENTES_PORTAL.find((x) => x.slug === slug) ||
      CLIENTES_PORTAL.find((x) => (x.slugAliases || []).includes(slug)) ||
      CLIENTES_PORTAL.find((x) => String(x.abrev || '').toLowerCase() === abrev) ||
      CLIENTES_PORTAL.find((x) => x.id === `cli-${slug}`) ||
      null
    );
  }

  function colorDe(c, estatico) {
    if (c.color_border && c.color_bg && c.color_text) {
      return { border: c.color_border, bg: c.color_bg, text: c.color_text };
    }
    if (estatico?.color) return estatico.color;
    return { border: '#0285E2', bg: '#E5F3FC', text: '#0A4A7A' };
  }

  function landingJoyasMercury() {
    return 'joyasmercury/index.html?v=secciones3';
  }

  function archivoDe(c) {
    if (c.id === 'cli-joyas-mercury' || c.slug === 'joyas-mercury' || c.slug === 'joyasmercury' || c.slug === 'jm') {
      return landingJoyasMercury();
    }
    const estatico = findEstatico(c);
    return estatico?.archivo || `${c.slug}/index.html`;
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

  function renderTarjetas(lista, origen) {
    const unica = dedupeClientes(lista);
    grid.innerHTML = unica
      .map((c) => {
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
      })
      .join('');
  }

  async function cargar() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('API no disponible');
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) throw new Error('API vacía');
      renderTarjetas(data, 'api');
      console.info('Portal: clientes desde API Laravel', API_URL);
    } catch (e) {
      if (typeof CLIENTES_PORTAL === 'undefined') {
        grid.innerHTML = '<p class="portal-paso">Sin API ni datos estáticos. Arranca ABRIR-LARAVEL.bat.</p>';
        return;
      }
      renderTarjetas(CLIENTES_PORTAL, 'static');
      console.warn('Portal: usando clientes-data.js (API no disponible)', e.message);
    }
  }

  cargar();
})();
