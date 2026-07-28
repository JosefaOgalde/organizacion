(function () {
  const cfg = window.IMP_CATALOGO;
  if (!cfg) return;

  const stage = document.getElementById('cat-stage');
  const counter = document.getElementById('cat-counter');
  if (!stage) return;

  const total = 2 + cfg.productos.length; // portada + productos + cierre

  function slidePortada() {
    return `
      <article class="slide slide--portada" data-slide="0" aria-label="Portada">
        <img class="slide-logo" src="../identidad/logo-oficial.png?v=ima2-20260728" alt="impresoreando" width="820" height="172" />
        <p class="slide-kicker">Catálogo</p>
        <h1 class="slide-title">Piezas 3D<br>hechas con cariño</h1>
        <p class="slide-pedido">${cfg.taglinePedido}</p>
        <p class="slide-ig">@${cfg.instagram}</p>
        <span class="slide-num">01 / ${String(total).padStart(2, '0')}</span>
      </article>
    `;
  }

  function slideProducto(p, idx) {
    const n = idx + 2; // after cover
    return `
      <article class="slide slide--producto" data-slide="${idx + 1}" aria-label="${escapeHtml(p.nombre)}">
        <div class="slide-visual">
          <span class="slide-visual__badge">referencial</span>
          <img src="${escapeAttr(p.ref)}" alt="Referencia ${escapeAttr(p.nombre)}" width="968" height="860" />
        </div>
        <div class="slide-meta">
          <span class="slide-sku">${escapeHtml(p.sku)}</span>
          <h2 class="slide-nombre">${escapeHtml(p.nombre)}</h2>
          <div class="slide-meta__foot">
            <span class="slide-pedido-mini">${escapeHtml(cfg.taglinePedido)}</span>
            <span class="slide-brand-mini">@${escapeHtml(cfg.instagram)}</span>
          </div>
        </div>
        <span class="slide-num">${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
      </article>
    `;
  }

  function slideCierre() {
    const n = total;
    return `
      <article class="slide slide--cierre" data-slide="${total - 1}" aria-label="Cierre">
        <div class="slide-cierre-logo-wrap">
          <img class="slide-logo-cierre" src="../identidad/logo-oficial.png?v=ima2-20260728" alt="impresoreando" width="720" height="151" />
        </div>
        <h2 class="slide-cierre-title">Pide los tuyos en <span>impresoreando</span></h2>
        <div class="slide-ig-box">
          <p class="slide-ig-handle">@${escapeHtml(cfg.instagram)}</p>
          <p class="slide-ig-url">instagram.com/${escapeHtml(cfg.instagram)}</p>
        </div>
        <p class="slide-pedido-final">${escapeHtml(cfg.taglinePedido)}</p>
        <span class="slide-num">${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
      </article>
    `;
  }

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

  stage.innerHTML =
    slidePortada() + cfg.productos.map((p, i) => slideProducto(p, i)).join('') + slideCierre();

  if (counter) counter.textContent = `${total} páginas · 1080×1350 px`;

  // Export mode: ?export=N shows only that slide
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

  // Imprimir → Guardar como PDF (fallback del archivo .pdf)
  document.getElementById('btn-imprimir-pdf')?.addEventListener('click', () => {
    window.print();
  });
})();
