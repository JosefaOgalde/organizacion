(function () {
  const GUIA = () => window.MKOF_MYSQL_NODO_GUIA || null;

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function visualHtml(paso) {
    if (window.MKOF_MYSQL_NODO_MOCKUPS?.paso) {
      return window.MKOF_MYSQL_NODO_MOCKUPS.paso(paso.num);
    }
    return '';
  }

  function render() {
    const g = GUIA();
    const root = document.getElementById('mkof-mysql-nodo-guia-root');
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
          ${p.destacar ? `<p class="mkof-guia-img__destacar">👆 ${escapeHtml(p.destacar)}</p>` : ''}
        </article>`
      )
      .join('');

    const checklistHtml = g.checklist.map((c) => `<li>${escapeHtml(c)}</li>`).join('');
    const objHtml = g.objetivo.items.map((i) => `<li>${escapeHtml(i)}</li>`).join('');
    const reqHtml = g.requisitos.items.map((i) => `<li>${escapeHtml(i)}</li>`).join('');

    root.innerHTML = `
      <nav class="mkof-guia-breadcrumb">
        <a href="index.html">← MKOF / MOVA</a>
      </nav>
      <header class="mkof-guia-header">
        <h1>MOVA · Agregar nodo MySQL en n8n</h1>
        <p class="mkof-guia-header__meta">${escapeHtml(g.hito)} · 11 pasos · mockup por paso</p>
        <p class="mkof-guia-header__descargas">
          <a href="${escapeHtml(g.pptx)}" download>⬇ Presentación PPT</a>
        </p>
      </header>

      <section class="mkof-guia-correo">
        <h2>${escapeHtml(g.objetivo.titulo)}</h2>
        <ul>${objHtml}</ul>
      </section>

      <section class="mkof-guia-correo">
        <h2>${escapeHtml(g.requisitos.titulo)}</h2>
        <ul>${reqHtml}</ul>
      </section>

      ${pasosHtml}

      <section class="mkof-guia-checklist">
        <h2>Checklist final</h2>
        <ul>${checklistHtml}</ul>
      </section>

      <section class="mkof-guia-siguiente mkof-guia-siguiente--ok">
        <h2>${escapeHtml(g.siguiente.titulo)}</h2>
        <p>${escapeHtml(g.siguiente.texto)}</p>
        <p><a class="mkof-guia-btn-siguiente" href="index.html">← Volver a ficha MOVA</a></p>
      </section>
    `;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
