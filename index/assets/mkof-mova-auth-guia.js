(function () {
  const G = () => window.MKOF_MOVA_AUTH_GUIA || null;

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function imgHtml(src, alt, destacar) {
    if (!src) return '';
    const base = G()?.imagenesBase || 'guia-mova-auth/img/';
    return `<figure class="mkof-auth-img">
      <img src="${escapeHtml(base + src)}" alt="${escapeHtml(alt)}" loading="lazy" />
      ${destacar ? `<p class="mkof-auth-img__destacar">👆 ${escapeHtml(destacar)}</p>` : ''}
    </figure>`;
  }

  function checklistHtml(items) {
    if (!items?.length) return '';
    return `<ul class="mkof-auth-checklist">${items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
  }

  function pasoHtml(p) {
    return `<article class="mkof-auth-paso" id="paso-${p.num}">
      <span class="mkof-auth-paso__num">Paso ${p.num}</span>
      <h3>${escapeHtml(p.titulo)}</h3>
      <p class="mkof-auth-paso__texto">${escapeHtml(p.texto)}</p>
      ${imgHtml(p.imagen, p.titulo, p.destacar)}
      ${p.codigo ? `<pre class="mkof-auth-codigo">${escapeHtml(p.codigo)}</pre>` : ''}
      ${checklistHtml(p.checklist)}
    </article>`;
  }

  function render() {
    const g = G();
    const root = document.getElementById('mkof-mova-auth-guia-root');
    if (!g || !root) return;

    const fasesHtml = g.fases
      .map(
        (f) => `<section class="mkof-auth-fase-block">
          <div class="mkof-auth-fase">
            <h2 class="mkof-auth-fase__titulo">Fase ${escapeHtml(f.id)} · ${escapeHtml(f.titulo)}</h2>
            <p class="mkof-auth-fase__dias">${escapeHtml(f.dias)}</p>
          </div>
          ${f.pasos.map(pasoHtml).join('')}
        </section>`
      )
      .join('');

    const erroresHtml = g.erroresComunes
      .map((e) => `<tr><td>${escapeHtml(e.error)}</td><td>${escapeHtml(e.solucion)}</td></tr>`)
      .join('');

    root.innerHTML = `
      <nav class="mkof-auth-breadcrumb mkof-guia-breadcrumb">
        <a href="index.html">← MKOF / MOVA</a>
      </nav>
      <header class="mkof-guia-header">
        <h1>mova_auth · Login unificado</h1>
        <p class="mkof-guia-header__meta">${escapeHtml(g.hito)} · Paso a paso con diagramas</p>
        <p class="mkof-guia-header__descargas">
          ${g.pdf ? `<a href="${escapeHtml(g.pdf)}" target="_blank">⬇ PDF</a>` : ''}
          · <a href="${escapeHtml(g.referencias.playbook)}" target="_blank" rel="noopener">Playbook cliente</a>
        </p>
      </header>

      <div class="mkof-auth-problema">
        <div class="mkof-auth-card mkof-auth-card--warn">
          <h2>${escapeHtml(g.problema.titulo)}</h2>
          <p>${escapeHtml(g.problema.texto)}</p>
        </div>
        ${imgHtml(g.problema.imagen, 'Problema actual')}
      </div>

      <div class="mkof-auth-objetivo">
        <div class="mkof-auth-card">
          <h2>${escapeHtml(g.objetivo.titulo)}</h2>
          <p>${escapeHtml(g.objetivo.texto)}</p>
        </div>
        ${imgHtml(g.objetivo.imagen, 'Objetivo')}
      </div>

      ${fasesHtml}

      <section class="mkof-auth-errores">
        <h2>Errores comunes y solución</h2>
        <table>
          <thead><tr><th>Error</th><th>Qué hacer</th></tr></thead>
          <tbody>${erroresHtml}</tbody>
        </table>
      </section>

      <section class="mkof-auth-no-hacer">
        <h2>⚠ No hacer</h2>
        <ul>${g.noHacer.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}</ul>
      </section>

      <section class="mkof-guia-checklist">
        <h2>Checklist final — hito 2.1 + 2.2</h2>
        <ul>${g.checklistFinal.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
      </section>`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
