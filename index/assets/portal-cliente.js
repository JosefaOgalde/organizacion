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
      <section>
        <h2>Enlaces</h2>
        <ul>
          <li><a href="../../index.html">Abrir organizador principal</a></li>
          <li><a href="../../index.html?tarea=${c.slug}/01">Primera tarea (si existe)</a></li>
          <li><a href="../clientes.html">Volver al listado de clientes</a></li>
        </ul>
      </section>
      <a href="../../index.html" class="portal-app-link">Ir al organizador →</a>
      <p class="portal-paso">
        <strong>Paso 1 completado:</strong> ficha estática. En el Paso 2 conectaremos Laravel + SQL
        para cargar tareas y documentos desde el servidor.
      </p>
    </article>
  `;
})();
