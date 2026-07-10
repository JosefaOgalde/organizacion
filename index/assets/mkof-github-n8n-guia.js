(function () {
  const GUIA = () => window.MKOF_GITHUB_N8N_GUIA || null;

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function visualHtml(paso) {
    if (window.MKOF_GITHUB_MOCKUPS?.n8nPaso) {
      return window.MKOF_GITHUB_MOCKUPS.n8nPaso(paso.num, paso);
    }
    return '';
  }

  function render() {
    const g = GUIA();
    const root = document.getElementById('mkof-github-n8n-guia-root');
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
    const prev = g.pasoAnterior;
    const pedidosHtml = g.tresPedidos.items
      .map(
        (item) => `<div class="mkof-guia-pedido-card">
          <span class="mkof-guia-pedido-card__id">${escapeHtml(item.id)}</span>
          <strong>${escapeHtml(item.titulo)}</strong>
          <p>${escapeHtml(item.desc)}</p>
        </div>`
      )
      .join('');

    root.innerHTML = `
      <nav class="mkof-guia-breadcrumb">
        <a href="index.html">← MKOF / MOVA</a>
        <span aria-hidden="true"> · </span>
        <a href="github-cuenta.html">Paso 1</a>
        <span aria-hidden="true"> · </span>
        <a href="github-repo.html">Paso 2</a>
      </nav>
      <header class="mkof-guia-header">
        <h1>MOVA · Paso 3: solicitud al equipo n8n</h1>
        <p class="mkof-guia-header__meta">${escapeHtml(g.hito)} · Tabla + JSON + capturas · mockup por paso</p>
        <p class="mkof-guia-header__descargas">
          <a href="MOVA-GitHub-N8n-Checklist.pdf" target="_blank" rel="noopener">⬇ PDF checklist completo</a>
          <a href="MOVA-GitHub-N8n-Checklist.pptx" download>⬇ PPT checklist</a>
        </p>
      </header>

      <div class="mkof-guia-progreso mkof-guia-progreso--tres">
        <div class="mkof-guia-progreso__item mkof-guia-progreso__item--hecho">
          <div class="mkof-guia-progreso__num">Paso 1</div>
          <a href="github-cuenta.html">Cuenta GitHub</a>
        </div>
        <div class="mkof-guia-progreso__item mkof-guia-progreso__item--hecho">
          <div class="mkof-guia-progreso__num">Paso 2</div>
          <a href="github-repo.html">Repo privado</a>
        </div>
        <div class="mkof-guia-progreso__item mkof-guia-progreso__item--activo">
          <div class="mkof-guia-progreso__num">Paso 3 · Ahora</div>
          Solicitud n8n
        </div>
      </div>

      <section class="mkof-guia-correo">
        <h2>${escapeHtml(g.requisitos.titulo)}</h2>
        <ul>${g.requisitos.items.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
      </section>

      <section class="mkof-guia-pedidos">
        <h2>${escapeHtml(g.tresPedidos.titulo)}</h2>
        <div class="mkof-guia-pedidos__grid">${pedidosHtml}</div>
      </section>

      ${pasosHtml}

      <section class="mkof-guia-correo mkof-guia-correo--acceso">
        <h2>Acceso colaborador — confirmado</h2>
        <p>Ya puedes ver y subir archivos al repo <code>mova-n8n-workflows</code>. Cuando lleguen los JSON de n8n, haz el primer push ahí.</p>
        <pre class="mkof-guia-correo__pre">git clone https://github.com/[owner]/mova-n8n-workflows.git
cd mova-n8n-workflows
mkdir workflows
# copiar *.json del equipo n8n en workflows/
git add workflows/
git commit -m "backup: workflows n8n MOVA"
git push origin main</pre>
      </section>

      <section class="mkof-guia-correo mkof-guia-correo--plantilla">
        <h2>Texto listo para el correo</h2>
        <pre class="mkof-guia-correo__pre">${escapeHtml(g.textoCorreo)}</pre>
      </section>

      <section class="mkof-guia-checklist">
        <h2>Checklist Paso 3</h2>
        <ul>${checklistHtml}</ul>
      </section>

      <section class="mkof-guia-siguiente mkof-guia-siguiente--ok">
        <h2>Después del Paso 3</h2>
        <p>Cuando responda el equipo n8n: actualiza <code>Inventario-MOVA-modulos.md</code>, sube JSON al repo
        <code>mova-n8n-workflows</code> y continúa <strong>mova_auth</strong> (D3 archivos núcleo) en paralelo.</p>
        <p><a class="mkof-guia-btn-siguiente" href="index.html">← Volver a ficha MOVA</a></p>
      </section>`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
