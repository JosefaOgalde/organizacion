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
        </section>`
      : '';

  const wireframesHtml =
    c.slug === 'joyas-mercury' && typeof window.jmHtmlWireframes === 'function'
      ? window.jmHtmlWireframes({ claseExtra: 'ficha-seccion--portal' })
      : '';

  root.innerHTML = `
    <article class="portal-cliente"
      style="--card-border:${c.color.border};--card-bg:${c.color.bg};--card-text:${c.color.text}">
      <span class="portal-badge">${c.tipo}</span>
      <h1>${c.nombre}</h1>
      <p class="portal-cliente__meta">${c.abrev} · ${c.agente}</p>
      <section>
        <h2>Resumen</h2>
        <p>${c.resumen}</p>
      </section>
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
      ${c.slug !== 'joyas-mercury' ? `<p class="portal-paso">
        <strong>ADL multi-proyecto:</strong> usa las fichas de proyecto arriba para no confundir identidades visuales.
      </p>` : ''}
    </article>
  `;
  if (typeof window.initJMWireframesUI === 'function') window.initJMWireframesUI(root);
})();
