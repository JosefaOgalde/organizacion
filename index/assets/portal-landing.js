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

  function archivoDe(c) {
    const estatico = typeof CLIENTES_PORTAL !== 'undefined'
      ? CLIENTES_PORTAL.find((x) => x.slug === c.slug || x.id === `cli-${c.slug}`)
      : null;
    return estatico?.archivo || `${c.slug}.html`;
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
        const estatico = typeof CLIENTES_PORTAL !== 'undefined'
          ? CLIENTES_PORTAL.find((x) => x.slug === c.slug)
          : null;
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
        grid.innerHTML = '<p class="portal-paso">Sin API ni datos estáticos. Arranca php artisan serve.</p>';
        return;
      }
      renderTarjetas(CLIENTES_PORTAL, 'static');
      console.warn('Portal: usando clientes-data.js (API no disponible)', e.message);
    }
  }

  cargar();
})();
