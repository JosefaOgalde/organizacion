(function () {
  const GUIA = () => window.MKOF_GITHUB_REPO_GUIA || null;

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function imgBase() {
    const g = GUIA();
    return g?.imagenesBase || 'guia-github-repo/img/';
  }

  function visualHtml(paso) {
    if (window.MKOF_GITHUB_MOCKUPS?.repoPaso) {
      return window.MKOF_GITHUB_MOCKUPS.repoPaso(paso.num, paso);
    }
    return imagenHtml(paso);
  }

  function imagenHtml(paso) {
    if (!paso.imagen) return '';
    const src = `${imgBase()}${paso.imagen}`;
    const destacar = paso.destacar
      ? `<p class="mkof-guia-img__destacar">👆 ${escapeHtml(paso.destacar)}</p>`
      : '';
    return `<figure class="mkof-guia-img">
      <div class="mkof-guia-img__url">${escapeHtml(paso.url || 'github.com')}</div>
      <img src="${escapeHtml(src)}" alt="Paso ${paso.num}: ${escapeHtml(paso.titulo)} — captura GitHub" loading="lazy" />
      ${destacar}
      <figcaption class="mkof-guia-img__caption">Referencia visual · ${escapeHtml(paso.url || '')}</figcaption>
    </figure>`;
  }

  function render() {
    const g = GUIA();
    const root = document.getElementById('mkof-github-repo-guia-root');
    if (!g || !root) return;

    const pasosHtml = g.pasos
      .map(
        (p) => `<article class="mkof-guia-paso" id="paso-${p.num}">
          <div class="mkof-guia-paso__head">
            <span class="mkof-guia-paso__badge">${p.num}</span>
            <h2 class="mkof-guia-paso__titulo">${escapeHtml(p.titulo)}</h2>
          </div>
          <p class="mkof-guia-paso__texto">${escapeHtml(p.texto)}</p>
          ${visualHtml(p)}
          <p class="mkof-guia-paso__tip"><strong>Tip:</strong> ${escapeHtml(p.tip)}</p>
        </article>`
      )
      .join('');

    const checklistHtml = g.checklist.map((c) => `<li>${escapeHtml(c)}</li>`).join('');
    const pdfLink = g.pdf
      ? `<a href="${escapeHtml(g.pdf)}" download="${escapeHtml(g.pdf)}">⬇ Descargar PDF</a>`
      : '';
    const prev = g.pasoAnterior;
    const next = g.pasoSiguiente;

    root.innerHTML = `
      <nav class="mkof-guia-breadcrumb">
        <a href="index.html">← MKOF / MOVA</a>
        <span aria-hidden="true"> · </span>
        <a href="${escapeHtml(prev.url)}">Paso 1: cuenta</a>
      </nav>
      <header class="mkof-guia-header">
        <h1>GitHub para MOVA · Paso 2: repositorio privado</h1>
        <p class="mkof-guia-header__meta">${escapeHtml(g.hito)} · Repo <code>${escapeHtml(g.repo.nombre)}</code> · mockup por paso</p>
        <p class="mkof-guia-header__descargas">
          ${pdfLink}
          <a href="MOVA-GitHub-Paso2-Repo-Privado.pptx" download>⬇ Presentación PPT</a>
        </p>
      </header>

      <div class="mkof-guia-progreso mkof-guia-progreso--tres">
        <div class="mkof-guia-progreso__item mkof-guia-progreso__item--hecho">
          <div class="mkof-guia-progreso__num">Paso 1 · Listo</div>
          <a href="${escapeHtml(prev.url)}">${escapeHtml(prev.titulo)}</a>
        </div>
        <div class="mkof-guia-progreso__item mkof-guia-progreso__item--activo">
          <div class="mkof-guia-progreso__num">Paso 2 · Ahora</div>
          Repo privado <code>${escapeHtml(g.repo.nombre)}</code>
        </div>
        <div class="mkof-guia-progreso__item mkof-guia-progreso__item--pendiente">
          <div class="mkof-guia-progreso__num">Paso 3 · Siguiente</div>
          <a href="${escapeHtml(next?.url || 'github-n8n.html')}">${escapeHtml(next?.titulo || 'Solicitud n8n')}</a>
        </div>
      </div>

      <section class="mkof-guia-correo">
        <h2>${escapeHtml(g.requisitos.titulo)}</h2>
        <ul>${g.requisitos.items.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
      </section>

      <section class="mkof-guia-repo-resumen">
        <h2>Datos del repositorio</h2>
        <table class="mkof-guia-repo-tabla">
          <tbody>
            <tr><th>Nombre</th><td><code>${escapeHtml(g.repo.nombre)}</code></td></tr>
            <tr><th>Descripción</th><td>${escapeHtml(g.repo.descripcion)}</td></tr>
            <tr><th>Visibilidad</th><td><strong>${escapeHtml(g.repo.visibilidad)}</strong></td></tr>
            <tr><th>README inicial</th><td>No (repo vacío)</td></tr>
          </tbody>
        </table>
      </section>

      ${pasosHtml}

      <section class="mkof-guia-checklist">
        <h2>Checklist final</h2>
        <ul>${checklistHtml}</ul>
      </section>

      <section class="mkof-guia-siguiente mkof-guia-siguiente--ok">
        <h2>Paso 3 · Solicitud al equipo n8n</h2>
        <p>Con el repo listo, continúa con la <strong>solicitud al equipo n8n</strong>: tabla de webhooks,
        export JSON y <strong>capturas de pantalla</strong> por workflow.</p>
        <p><a class="mkof-guia-btn-siguiente" href="${escapeHtml(next?.url || 'github-n8n.html')}">Ir al Paso 3 →</a></p>
      </section>`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
