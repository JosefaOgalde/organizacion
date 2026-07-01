(function () {
  const clienteSlug = document.body.dataset.clienteSlug;
  const codigo = document.body.dataset.proyectoCodigo;
  const root = document.getElementById('portal-proyecto-root');
  if (!root || !clienteSlug || !codigo) return;

  const found = typeof window.buscarProyectoPortal === 'function'
    ? window.buscarProyectoPortal(clienteSlug, codigo)
    : null;
  if (!found) {
    root.innerHTML = '<p class="portal-paso">Proyecto no encontrado.</p>';
    return;
  }

  const { cliente, proyecto: p } = found;
  const col = p.color || cliente.color;
  const id = p.identidad || {};
  const archivoCliente = (cliente.archivo || '').split('?')[0].replace(/\.html$/i, '');
  const hrefCliente = `../${archivoCliente}`;

  if (typeof window.aplicarTemaPortal === 'function') {
    window.aplicarTemaPortal(col);
  }

  document.title = `${p.nombre} · ${cliente.nombre}`;

  const paletaItems = [
    ['primario', id.primario || col.border],
    ['secundario', id.secundario || col.text],
    ['acento', id.acento],
    ['fondo', id.fondo || col.bg]
  ].filter(([, hex]) => hex);

  const paletaHtml = paletaItems.length
    ? `<section>
        <h2>Identidad visual</h2>
        <ul class="portal-paleta">
          ${paletaItems.map(([nombre, hex]) =>
            `<li><span class="portal-paleta__muestra" style="background:${hex}"></span>${nombre} · <code>${hex}</code></li>`
          ).join('')}
        </ul>
        ${p.manual ? `<p style="margin-top:0.65rem"><a href="${p.manual}">Manual de marca / identidad visual</a></p>` : ''}
      </section>`
    : '';

  const entregables = (p.entregables || []).map((e) => `<li>${e}</li>`).join('');
  const entregablesHtml = entregables
    ? `<section><h2>Entregables</h2><ul>${entregables}</ul></section>`
    : '';

  root.innerHTML = `
    <article class="portal-proyecto"
      style="--card-border:${col.border};--card-bg:${col.bg};--card-text:${col.text}">
      <span class="portal-badge">${p.codigo}</span>
      <h1>${p.nombre}</h1>
      <p class="portal-proyecto__meta">${cliente.nombre} · ${p.resumen}</p>
      <section>
        <h2>Resumen del proyecto</h2>
        <p>${p.descripcion || p.resumen}</p>
      </section>
      ${paletaHtml}
      ${entregablesHtml}
      <section>
        <h2>Enlaces</h2>
        <ul>
          <li><a href="../../../index.html">Abrir en organizador</a></li>
          <li><a href="${hrefCliente}">Volver a ${cliente.nombre}</a></li>
          <li><a href="../../clientes.html">Listado de clientes</a></li>
        </ul>
      </section>
      <a href="${hrefCliente}" class="portal-app-link">Volver a ${cliente.abrev} →</a>
    </article>`;
})();
