(function () {
  const GUIA = () => window.MKOF_GITHUB_GUIA || null;

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function imgBase() {
    const g = GUIA();
    return g?.imagenesBase || 'guia-github/img/';
  }

  function imagenHtml(paso) {
    if (!paso.imagen) return '';
    const src = `${imgBase()}${paso.imagen}`;
    const destacar = paso.destacar
      ? `<p class="mkof-guia-img__destacar">👆 ${escapeHtml(paso.destacar)}</p>`
      : '';
    return `<figure class="mkof-guia-img">
      <div class="mkof-guia-img__url">${escapeHtml(paso.url || 'github.com')}</div>
      <img src="${escapeHtml(src)}" alt="Paso ${paso.num}: ${escapeHtml(paso.titulo)} — captura real de GitHub" loading="lazy" />
      ${destacar}
      <figcaption class="mkof-guia-img__caption">Captura real del sitio · ${escapeHtml(paso.url || '')}</figcaption>
    </figure>`;
  }

  function render() {
    const g = GUIA();
    const root = document.getElementById('mkof-github-guia-root');
    if (!g || !root) return;

    const correoEjemplos = g.correoRecomendado.ejemplos
      .map((e) => `<span class="mkof-guia-correo__tag">${escapeHtml(e)}</span>`)
      .join('');

    const pasosHtml = g.pasos
      .map(
        (p) => `<article class="mkof-guia-paso" id="paso-${p.num}">
          <div class="mkof-guia-paso__head">
            <span class="mkof-guia-paso__badge">${p.num}</span>
            <h2 class="mkof-guia-paso__titulo">${escapeHtml(p.titulo)}</h2>
          </div>
          <p class="mkof-guia-paso__texto">${escapeHtml(p.texto)}</p>
          ${imagenHtml(p)}
          <p class="mkof-guia-paso__tip"><strong>Tip:</strong> ${escapeHtml(p.tip)}</p>
        </article>`
      )
      .join('');

    const checklistHtml = g.checklist.map((c) => `<li>${escapeHtml(c)}</li>`).join('');
    const pdfLink = g.pdf
      ? `<a href="${escapeHtml(g.pdf)}" target="_blank" rel="noopener">⬇ Ver / descargar PDF</a>`
      : '';

    root.innerHTML = `
      <nav class="mkof-guia-breadcrumb">
        <a href="index.html">← MKOF / MOVA</a>
      </nav>
      <header class="mkof-guia-header">
        <h1>GitHub para MOVA · Paso 1: crear cuenta</h1>
        <p class="mkof-guia-header__meta">${escapeHtml(g.hito)} · Capturas reales de github.com</p>
        <p class="mkof-guia-header__descargas">
          ${pdfLink}
          <a href="MOVA-GitHub-Paso1-Crear-Cuenta.pptx" download>⬇ Presentación PPT</a>
        </p>
      </header>

      <div class="mkof-guia-progreso">
        <div class="mkof-guia-progreso__item mkof-guia-progreso__item--activo">
          <div class="mkof-guia-progreso__num">Paso 1 · Ahora</div>
          Crear cuenta con correo general
        </div>
        <div class="mkof-guia-progreso__item mkof-guia-progreso__item--pendiente">
          <div class="mkof-guia-progreso__num">Paso 2 · Próximo</div>
          Repo privado <code>${escapeHtml(g.pasoSiguiente.nombreRepo)}</code>
        </div>
      </div>

      <section class="mkof-guia-correo">
        <h2>${escapeHtml(g.correoRecomendado.titulo)}</h2>
        <div class="mkof-guia-correo__ejemplos">${correoEjemplos}</div>
        <ul>${g.correoRecomendado.reglas.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
      </section>

      ${pasosHtml}

      <section class="mkof-guia-checklist">
        <h2>Checklist antes de seguir al Paso 2</h2>
        <ul>${checklistHtml}</ul>
      </section>

      <section class="mkof-guia-siguiente" id="paso-2-pendiente">
        <h2>Paso 2 · Crear repositorio privado (próximamente)</h2>
        <p>Cuando la cuenta esté lista, el siguiente paso será crear el repo privado
        <strong>${escapeHtml(g.pasoSiguiente.nombreRepo)}</strong> para respaldar los workflows de n8n.</p>
      </section>`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
