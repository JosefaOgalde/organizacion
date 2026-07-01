(function () {
  const grid = document.getElementById('clientes-grid');
  if (!grid) return;

  const API_URL = 'http://127.0.0.1:8000/api/clientes';

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function colorDe(c, estatico) {
    if (c.color_border && c.color_bg && c.color_text) {
      return { border: c.color_border, bg: c.color_bg, text: c.color_text };
    }
    if (estatico?.color) return estatico.color;
    return { border: '#98c8e0', bg: '#e8f4fc', text: '#4a7a9e' };
  }

  function slugDe(c) {
    if (c.slug) return c.slug;
    if (c.id?.startsWith('cli-')) return c.id.slice(4);
    return '';
  }

  function estaticoDe(c) {
    if (typeof CLIENTES_PORTAL === 'undefined') return null;
    const slug = slugDe(c);
    return CLIENTES_PORTAL.find((x) => x.slug === slug || x.id === c.id || x.id === `cli-${slug}`) || null;
  }

  function mergeClientes(api, estatico) {
    const map = new Map();
    estatico.forEach((c) => map.set(c.slug, { ...c }));
    api.forEach((c) => {
      const slug = slugDe(c);
      if (!slug) return;
      const base = map.get(slug) || estaticoDe(c) || {};
      map.set(slug, { ...base, ...c, slug });
    });
    return Array.from(map.values());
  }

  function landingJoyasMercury() {
    return 'joyasmercury/index.html?v=secciones3';
  }

  function archivoDe(c) {
    if (c.id === 'cli-joyas-mercury' || c.slug === 'joyas-mercury' || c.slug === 'joyasmercury') {
      return landingJoyasMercury();
    }
    const estatico = estaticoDe(c);
    return estatico?.archivo || `${slugDe(c) || c.slug}.html`;
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

  function renderTarjetas(lista, origen) {
    grid.innerHTML = lista
      .map((c) => {
        const estatico = estaticoDe(c);
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
    const estatico = typeof CLIENTES_PORTAL !== 'undefined' ? CLIENTES_PORTAL : [];

    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('API no disponible');
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) throw new Error('API vacía');
      const lista = estatico.length ? mergeClientes(data, estatico) : data;
      renderTarjetas(lista, 'api');
      console.info('Portal: clientes API + estáticos', API_URL, lista.length);
    } catch (e) {
      if (!estatico.length) {
        grid.innerHTML = '<p class="portal-paso">Sin API ni datos estáticos. Arranca php artisan serve.</p>';
        return;
      }
      renderTarjetas(estatico, 'static');
      console.warn('Portal: usando clientes-data.js (API no disponible)', e.message);
    }
  }

  cargar();
})();
