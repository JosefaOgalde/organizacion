(function () {
  const proyecto = window.HERRAMIENTAS_PROYECTOS?.TEND;
  if (!proyecto) return;

  const root = document.getElementById('tendencias-root');
  if (!root) return;

  const col = proyecto.colores;

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const seccionesHtml = (proyecto.secciones || [])
    .map(
      (s) => `
      <section class="portal-cliente__seccion" style="--card-border:${col.primario};--card-bg:${col.fondo};--card-text:${col.texto}">
        <h2>${escapeHtml(s.titulo)}</h2>
        <p>${escapeHtml(s.descripcion)}</p>
      </section>`
    )
    .join('');

  const coloresHtml = Object.entries(proyecto.colores)
    .filter(([k]) => !k.startsWith('texto'))
    .map(
      ([k, hex]) =>
        `<li><span class="tend-color-swatch" style="background:${hex}"></span> <strong>${escapeHtml(k)}</strong> — ${escapeHtml(hex)}</li>`
    )
    .join('');

  root.innerHTML = `
    <article class="portal-cliente portal-cliente--landing"
      style="--card-border:${col.primario};--card-bg:${col.fondo};--card-text:${col.texto}">
      <span class="portal-badge">Proyecto ${escapeHtml(proyecto.codigo)}</span>
      <h1>${escapeHtml(proyecto.nombre)}</h1>
      <p class="portal-cliente__meta">${escapeHtml(proyecto.cliente)} · ${escapeHtml(proyecto.descripcion)}</p>

      <section>
        <h2>Resumen del proyecto</h2>
        <p>${escapeHtml(proyecto.descripcion)}</p>
      </section>

      ${seccionesHtml}

      <section>
        <h2>Identidad visual</h2>
        <ul class="tend-colores-list">${coloresHtml}</ul>
        <p>
          <a href="${escapeHtml(proyecto.identidadPdf)}" target="_blank" rel="noopener">
            Manual de marca / identidad visual
          </a>
          (coloca el PDF en <code>tendencias/identidad/</code>)
        </p>
      </section>

      <section>
        <h2>Enlaces</h2>
        <ul>
          <li><a href="../../../index.html?tarea=herramientas/01">Abrir en organizador</a></li>
          <li><a href="../Herramientas.html">Volver a Herramientas</a></li>
          <li><a href="../../clientes.html">Listado de clientes</a></li>
        </ul>
      </section>
    </article>`;
})();
