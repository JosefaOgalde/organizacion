(function () {
  const DATA = () => window.MOVA_DOCUMENTOS || null;

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function findDoc(id) {
    const d = DATA();
    if (!d) return null;
    for (const cat of d.categorias) {
      const item = cat.items.find((x) => x.id === id);
      if (item) return { item, base: d.baseMkof || '../../../mkof/', baseData: d.baseData || '../../../../../data/' };
    }
    return null;
  }

  function render() {
    const root = document.getElementById('mova-doc-ver-root');
    if (!root) return;

    const id = new URLSearchParams(location.search).get('id');
    const found = id ? findDoc(id) : null;

    if (!found || !found.item.verHtml) {
      root.innerHTML = `<p class="portal-paso">Documento no encontrado. <a href="index.html">← Volver</a></p>`;
      return;
    }

    const { item, base, baseData } = found;
    const src = `${base}${item.verHtml}?embed=1`;
    const pdfHref = item.pdf ? `${base}${item.pdf}` : '';
    const editPath = item.editar ? `${baseData}${item.editar}` : '';

    root.innerHTML = `
      <div class="mova-doc-ver__toolbar">
        <a href="index.html" class="mova-doc-btn mova-doc-btn--sec">← Documentos</a>
        <span class="mova-doc-ver__titulo">${escapeHtml(item.titulo)}</span>
        <div class="mova-doc-ver__acciones">
          ${editPath ? `<code class="mova-doc-ver__edit-hint" title="Abre este archivo en Cursor">${escapeHtml(editPath)}</code>` : ''}
          <button type="button" class="mova-doc-btn mova-doc-btn--sec" id="mova-btn-imprimir">Imprimir / Guardar PDF</button>
          ${pdfHref ? `<a class="mova-doc-btn mova-doc-btn--sec" href="${escapeHtml(pdfHref)}" download="${escapeHtml(item.pdf)}">Descargar PDF</a>` : ''}
        </div>
      </div>
      <iframe id="mova-doc-ver-frame" class="mova-doc-ver__frame" src="${escapeHtml(src)}" title="${escapeHtml(item.titulo)}"></iframe>`;

    document.getElementById('mova-btn-imprimir')?.addEventListener('click', () => {
      const frame = document.getElementById('mova-doc-ver-frame');
      try {
        frame?.contentWindow?.print();
      } catch {
        window.open(src.replace('?embed=1', ''), '_blank');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
