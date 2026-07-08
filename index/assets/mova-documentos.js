(function () {
  const DATA = () => window.MOVA_DOCUMENTOS || null;

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function cardHtml(item, base, baseData) {
    const verUrl = item.externo
      ? item.externo
      : item.verHtml
        ? `ver.html?id=${encodeURIComponent(item.id)}`
        : null;

    const editPath = item.editar ? `${baseData}${item.editar}` : '';

    const acciones = [];
    if (verUrl && !item.externo) {
      acciones.push(
        `<a class="mova-doc-btn mova-doc-btn--ver" href="${escapeHtml(verUrl)}">Ver completo</a>`
      );
    } else if (item.externo) {
      acciones.push(
        `<a class="mova-doc-btn mova-doc-btn--ver" href="${escapeHtml(item.externo)}" target="_blank" rel="noopener">Abrir</a>`
      );
    }
    if (editPath) {
      acciones.push(
        `<span class="mova-doc-btn mova-doc-btn--sec mova-doc-btn--editar" title="Editar en Cursor: ${escapeHtml(editPath)}">Editar: ${escapeHtml(item.editar)}</span>`
      );
    }
    if (item.pdf) {
      acciones.push(
        `<a class="mova-doc-btn mova-doc-btn--sec" href="${escapeHtml(base + item.pdf)}" target="_blank" rel="noopener">Ver PDF</a>`
      );
      acciones.push(
        `<a class="mova-doc-btn mova-doc-btn--sec" href="${escapeHtml(base + item.pdf)}" download="${escapeHtml(item.pdf)}">Descargar PDF</a>`
      );
    }
    if (item.pptx) {
      acciones.push(
        `<a class="mova-doc-btn mova-doc-btn--sec" href="${escapeHtml(base + item.pptx)}" download="${escapeHtml(item.pptx)}">Descargar PPT</a>`
      );
    }

    return `<article class="mova-doc-card">
      <div class="mova-doc-card__tipo mova-doc-card__tipo--html">Documento vivo</div>
      <h3>${escapeHtml(item.titulo)}</h3>
      <p class="mova-doc-card__desc">${escapeHtml(item.descripcion)}</p>
      <p class="mova-doc-card__meta">Hito ${escapeHtml(item.hito)} · ${escapeHtml(item.fecha)}</p>
      <p class="mova-doc-card__nota">Ver completo en pantalla · editar el .js en el repo · PDF solo si lo pides</p>
      <div class="mova-doc-card__acciones">${acciones.join('')}</div>
    </article>`;
  }

  function render() {
    const d = DATA();
    const root = document.getElementById('mova-documentos-root');
    if (!d || !root) return;

    const base = d.baseMkof || '../../../mkof/';
    const baseData = d.baseData || '../../../../../data/';

    root.innerHTML = `
      <div class="mova-docs-aviso">
        <strong>Ver completo</strong> abre la guía HTML en pantalla (no descarga).
        Para cambiar textos, edita el archivo <code>.js</code> en <code>data/</code> con Cursor.
        <strong>Descargar PDF</strong> o <strong>Imprimir → Guardar como PDF</strong> solo cuando lo necesites.
      </div>
      ${d.categorias
        .map(
          (cat) => `<section class="mova-docs-categoria">
            <h2>${escapeHtml(cat.titulo)}</h2>
            <div class="mova-docs-grid">${cat.items.map((i) => cardHtml(i, base, baseData)).join('')}</div>
          </section>`
        )
        .join('')}`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
