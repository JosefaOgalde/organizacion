(function () {
  const proyecto = window.SAKURA_PROYECTOS?.CASCO;
  const root = document.getElementById('sakura-casco-root');
  if (!proyecto || !root) return;

  const col = proyecto.colores;

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function estadoLabel(estado) {
    const map = {
      'en-progreso': 'En progreso',
      pendiente: 'Pendiente',
      listo: 'Listo'
    };
    return map[estado] || estado;
  }

  const entregablesHtml = proyecto.entregables
    .map(
      (e) => `
      <li class="sakura-entregable sakura-entregable--${escapeHtml(e.estado)}">
        <strong>${escapeHtml(e.titulo)}</strong>
        <span class="sakura-badge">${escapeHtml(estadoLabel(e.estado))}</span>
        <p>${escapeHtml(e.notas)}</p>
      </li>`
    )
    .join('');

  const medidasHtml = proyecto.medidas
    ? `<section>
        <h2>Medidas registradas</h2>
        <p><em>${escapeHtml(proyecto.principioDiseno || '')}</em></p>
        <ul>
          <li>Circ. craneal: ${escapeHtml(proyecto.medidas.circunferenciaCraneal)}</li>
          <li>Circ. cuello: ${escapeHtml(proyecto.medidas.circunferenciaCuello)}</li>
          <li>Cabeza: ${escapeHtml(proyecto.medidas.largoCabeza)} × ${escapeHtml(proyecto.medidas.anchoCabeza)} × ${escapeHtml(proyecto.medidas.alturaCabeza)}</li>
          <li>Orejas: ${escapeHtml(proyecto.medidas.oreja)}</li>
          <li>Zona rascado: ${escapeHtml(proyecto.medidas.zonaRascado)}</li>
          <li>Peso: ${escapeHtml(proyecto.medidas.peso)}</li>
        </ul>
      </section>`
    : '';

  root.innerHTML = `
    <article class="portal-cliente portal-cliente--proyecto"
      style="--card-border:${col.secundario};--card-bg:${col.fondo};--card-text:${col.texto}">
      <span class="portal-badge">${escapeHtml(proyecto.codigo)} · Fase ${proyecto.fase || 1}</span>
      <h1>${escapeHtml(proyecto.nombre)}</h1>
      <p class="portal-cliente__meta">${escapeHtml(proyecto.cliente)} · ${escapeHtml(proyecto.descripcion)}</p>

      ${medidasHtml}

      <section>
        <h2>Entregables</h2>
        <ul class="sakura-entregables">${entregablesHtml}</ul>
      </section>

      <section>
        <h2>Recursos en el repo</h2>
        <ul>
          ${proyecto.recursos
            .map((r) => `<li><code>index/clientes/Sakura/${escapeHtml(r.ruta)}</code> — ${escapeHtml(r.titulo)}</li>`)
            .join('')}
        </ul>
      </section>

      <section>
        <h2>Trabajar en Cursor</h2>
        <p>Invoca <code>@sakura-casco</code> o abre archivos en <code>index/clientes/Sakura/prototipo-casco/</code>.</p>
        <pre class="sakura-plantilla">Cliente: Sakura
Proyecto: Prototipo Casco
Tarea de hoy: [concepto / modelo / renders]
Necesito: [lo concreto]</pre>
      </section>

      <section>
        <h2>Enlaces</h2>
        <ul>
          <li><a href="../Sakura.html">Volver a Sakura</a></li>
          <li><a href="../../clientes.html">Listado de clientes</a></li>
          <li><a href="../../../index.html">Organizador principal</a></li>
        </ul>
      </section>
    </article>`;
})();
