(function () {
  const cfg = window.IMP_CATALOGO_LLAVEROS;
  if (!cfg) return;

  const stage = document.getElementById('cat-stage');
  const counter = document.getElementById('cat-counter');
  if (!stage) return;

  const productos = cfg.productos || [];
  const pares = [];
  for (let i = 0; i < productos.length; i += 2) {
    pares.push(productos.slice(i, i + 2));
  }
  const total = 2 + pares.length; // portada + dúos + cierre

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, '&#39;');
  }

  function cardProducto(p) {
    const nota = p.seleccionarDiseno
      ? `<p class="duo-nota">(debes seleccionar un diseño)</p>`
      : '';
    return `
      <div class="duo-card">
        <div class="duo-visual">
          <img src="${escapeAttr(p.ref)}" alt="${escapeAttr(p.nombre)}" width="560" height="480" />
        </div>
        <div class="duo-meta">
          <span class="duo-sku">${escapeHtml(p.sku)}</span>
          <h2 class="duo-nombre">${escapeHtml(p.nombre)}</h2>
          ${nota}
          <p class="duo-pedido">${escapeHtml(cfg.taglinePedido)}</p>
          <span class="duo-brand">@${escapeHtml(cfg.instagram)}</span>
        </div>
      </div>
    `;
  }

  function slidePortada() {
    return `
      <article class="slide slide--portada" data-slide="0" aria-label="Portada Llaveros">
        <img class="slide-logo" src="../identidad/logo-impresoreando.png?v=imp-logo-trans1" alt="impresoreando" width="820" height="280" />
        <p class="slide-kicker">Catálogo</p>
        <h1 class="slide-title">${escapeHtml(cfg.titulo)}</h1>
        <p class="slide-pedido">${escapeHtml(cfg.taglinePedido)}</p>
        <p class="slide-ig">@${escapeHtml(cfg.instagram)}</p>
        <span class="slide-num">01 / ${String(total).padStart(2, '0')}</span>
      </article>
    `;
  }

  function slideDuo(par, idx) {
    const n = idx + 2;
    return `
      <article class="slide slide--duo" data-slide="${idx + 1}" aria-label="Llaveros ${par.map((p) => p.nombre).join(' · ')}">
        ${par.map(cardProducto).join('')}
        <span class="slide-num">${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
      </article>
    `;
  }

  function slideCierre() {
    return `
      <article class="slide slide--cierre" data-slide="${total - 1}" aria-label="Cierre">
        <div class="slide-cierre-logo-wrap">
          <img class="slide-logo-cierre" src="../identidad/logo-impresoreando.png?v=imp-logo-trans1" alt="impresoreando" width="720" height="240" />
        </div>
        <h2 class="slide-cierre-title">Pide tus <span>llaveros</span> en impresoreando</h2>
        <div class="slide-ig-box">
          <p class="slide-ig-handle">@${escapeHtml(cfg.instagram)}</p>
          <p class="slide-ig-url">instagram.com/${escapeHtml(cfg.instagram)}</p>
        </div>
        <p class="slide-pedido-final">${escapeHtml(cfg.taglinePedido)}</p>
        <span class="slide-num">${String(total).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
      </article>
    `;
  }

  stage.innerHTML =
    slidePortada() + pares.map((par, i) => slideDuo(par, i)).join('') + slideCierre();

  if (counter) counter.textContent = `${total} páginas · 24 llaveros · 2 por página · 1080×1350`;

  const params = new URLSearchParams(location.search);
  const exp = params.get('export');
  if (exp != null && exp !== '') {
    document.body.classList.add('export-mode');
    const slides = stage.querySelectorAll('.slide');
    const i = Number(exp);
    slides.forEach((el, idx) => {
      if (idx === i) el.classList.add('is-export-target');
    });
  }

  document.getElementById('btn-imprimir-pdf')?.addEventListener('click', () => window.print());
})();
