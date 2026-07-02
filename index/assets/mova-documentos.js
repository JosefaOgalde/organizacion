(function () {
  const DATA = () => window.MOVA_DOCUMENTOS || null;

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function urlItem(item, base) {
    if (item.tipo === 'externo') return item.url;
    return base + item.archivo;
  }

  function tipoLabel(tipo) {
    const map = { pdf: 'PDF', pptx: 'PowerPoint', html: 'Guía web', externo: 'Enlace' };
    return map[tipo] || tipo;
  }

  function cardHtml(item, base) {
    const url = urlItem(item, base);
    const verBtn =
      item.tipo === 'pdf'
        ? `<button type="button" class="mova-doc-btn mova-doc-btn--ver" data-ver="${escapeHtml(url)}" data-titulo="${escapeHtml(item.titulo)}">Ver aquí</button>`
        : item.tipo === 'html'
          ? `<a class="mova-doc-btn mova-doc-btn--ver" href="${escapeHtml(url)}" target="_blank" rel="noopener">Abrir guía</a>`
          : item.tipo === 'externo'
            ? `<a class="mova-doc-btn mova-doc-btn--ver" href="${escapeHtml(url)}" target="_blank" rel="noopener">Abrir</a>`
            : '';

    const descargarBtn =
      item.tipo === 'pdf' || item.tipo === 'pptx'
        ? `<a class="mova-doc-btn mova-doc-btn--sec" href="${escapeHtml(url)}" target="_blank" rel="noopener" download>Descargar</a>`
        : '';

    const nuevaPestana =
      item.tipo === 'pdf'
        ? `<a class="mova-doc-btn mova-doc-btn--sec" href="${escapeHtml(url)}" target="_blank" rel="noopener">Nueva pestaña</a>`
        : '';

    return `<article class="mova-doc-card" data-id="${escapeHtml(item.id)}">
      <div class="mova-doc-card__tipo mova-doc-card__tipo--${escapeHtml(item.tipo)}">${escapeHtml(tipoLabel(item.tipo))}</div>
      <h3>${escapeHtml(item.titulo)}</h3>
      <p class="mova-doc-card__desc">${escapeHtml(item.descripcion)}</p>
      <p class="mova-doc-card__meta">Hito ${escapeHtml(item.hito)} · ${escapeHtml(item.fecha)}</p>
      <div class="mova-doc-card__acciones">
        ${verBtn}
        ${nuevaPestana}
        ${descargarBtn}
      </div>
    </article>`;
  }

  function render() {
    const d = DATA();
    const root = document.getElementById('mova-documentos-root');
    if (!d || !root) return;

    const base = d.baseMkof || '../../../mkof/';
    const categoriasHtml = d.categorias
      .map(
        (cat) => `<section class="mova-docs-categoria">
          <h2>${escapeHtml(cat.titulo)}</h2>
          <div class="mova-docs-grid">${cat.items.map((item) => cardHtml(item, base)).join('')}</div>
        </section>`
      )
      .join('');

    root.innerHTML = `
      <div class="mova-docs-aviso">
        Todos los entregables MOVA viven en <code>index/clientes/mkof/</code>.
        Los PDF y PPT se pueden <strong>ver aquí</strong> o descargar para enviar al cliente.
      </div>
      ${categoriasHtml}
      <div id="mova-doc-viewer" class="mova-doc-viewer mova-doc-viewer--hidden" aria-live="polite">
        <div class="mova-doc-viewer__bar">
          <span id="mova-doc-viewer-titulo">Documento</span>
          <button type="button" id="mova-doc-viewer-cerrar">Cerrar visor</button>
        </div>
        <iframe id="mova-doc-viewer-frame" title="Visor de documento MOVA"></iframe>
      </div>`;

    const viewer = document.getElementById('mova-doc-viewer');
    const frame = document.getElementById('mova-doc-viewer-frame');
    const tituloEl = document.getElementById('mova-doc-viewer-titulo');

    root.querySelectorAll('[data-ver]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-ver');
        const titulo = btn.getAttribute('data-titulo') || 'Documento';
        if (!frame || !viewer) return;
        frame.src = url;
        tituloEl.textContent = titulo;
        viewer.classList.remove('mova-doc-viewer--hidden');
        viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    document.getElementById('mova-doc-viewer-cerrar')?.addEventListener('click', () => {
      viewer?.classList.add('mova-doc-viewer--hidden');
      if (frame) frame.src = 'about:blank';
    });

    const params = new URLSearchParams(location.search);
    const ver = params.get('ver');
    if (ver) {
      const match = root.querySelector(`[data-ver$="${CSS.escape(ver)}"]`);
      match?.click();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
