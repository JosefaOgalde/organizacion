(function () {
  const proyecto = window.HERRAMIENTAS_PROYECTOS?.TEND;
  if (!proyecto) return;

  const root = document.getElementById('tendencias-root');
  if (!root) return;

  const col = proyecto.colores;
  const feedCfg = proyecto.feed || {};
  const FEED_URL = feedCfg.url || '../../../data/tendencias-comida-chile.json';
  const CACHE_KEY = 'tendencias-comida-chile-cache';
  const CACHE_TTL_MS = (feedCfg.cacheMinutos || 30) * 60 * 1000;

  const PLATAFORMAS = {
    tiktok: { label: 'TikTok', icon: '♪', clase: 'tiktok' },
    instagram: { label: 'Instagram', icon: '◎', clase: 'instagram' },
    youtube: { label: 'YouTube Shorts', icon: '▶', clase: 'youtube' }
  };

  let feedActual = null;

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatoFecha(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('es-CL', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return iso;
    }
  }

  function leerCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL_MS) return null;
      return data;
    } catch {
      return null;
    }
  }

  function guardarCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch {
      /* ignore */
    }
  }

  async function cargarFeed(forzar = false) {
    if (!forzar) {
      const cache = leerCache();
      if (cache) return cache;
    }

    const url = `${FEED_URL}${FEED_URL.includes('?') ? '&' : '?'}t=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo cargar el feed (${res.status})`);
    const data = await res.json();
    guardarCache(data);
    return data;
  }

  function renderKpis(kpis) {
    if (!kpis) return '';
    const items = [
      { val: kpis.vistas, lbl: 'Vistas' },
      { val: kpis.engagement, lbl: 'Engagement' },
      { val: kpis.crecimiento, lbl: 'Crecimiento' }
    ].filter((x) => x.val);
    if (!items.length) return '';
    return `<div class="tend-kpis">${items
      .map(
        (x) =>
          `<div class="tend-kpi"><span class="tend-kpi__val">${escapeHtml(x.val)}</span><span class="tend-kpi__lbl">${escapeHtml(x.lbl)}</span></div>`
      )
      .join('')}</div>`;
  }

  function renderCard(t) {
    const senal = (t.kpis?.senal || 'medio').replace(/\s+/g, '-');
    const tags = (t.hashtags || [])
      .map((h) => `<span class="tend-tag">${escapeHtml(h)}</span>`)
      .join('');
    const link = t.fuente
      ? `<a class="tend-card__link" href="${escapeHtml(t.fuente)}" target="_blank" rel="noopener">Ver referencia →</a>`
      : '';

    return `
      <article class="tend-card">
        <div class="tend-card__top">
          <h3>${escapeHtml(t.titulo)}</h3>
          <span class="tend-card__senal tend-card__senal--${escapeHtml(senal)}">${escapeHtml((t.kpis?.senal || 'medio').replace('-', ' '))}</span>
        </div>
        <p class="tend-card__formato">${escapeHtml(t.formato)}</p>
        ${renderKpis(t.kpis)}
        <p class="tend-card__label">Por qué funciona</p>
        <p>${escapeHtml(t.porQueFunciona)}</p>
        <p class="tend-card__label">Ángulo de contenido</p>
        <p>${escapeHtml(t.anguloContenido)}</p>
        ${t.ejemploChile ? `<p class="tend-card__label">Señal Chile</p><p>${escapeHtml(t.ejemploChile)}</p>` : ''}
        <div class="tend-tags">${tags}</div>
        ${link}
      </article>`;
  }

  function renderPlataforma(plataforma, items) {
    const meta = PLATAFORMAS[plataforma] || { label: plataforma, icon: '•', clase: '' };
    return `
      <section class="tend-plataforma" aria-labelledby="tend-plat-${escapeHtml(plataforma)}">
        <div class="tend-plataforma__header">
          <span class="tend-plataforma__icon tend-plataforma__icon--${meta.clase}" aria-hidden="true">${meta.icon}</span>
          <h2 id="tend-plat-${escapeHtml(plataforma)}">${escapeHtml(meta.label)}</h2>
          <span class="tend-plataforma__count">${items.length} tendencia${items.length === 1 ? '' : 's'}</span>
        </div>
        <div class="tend-grid">${items.map(renderCard).join('')}</div>
      </section>`;
  }

  function renderFeed(feed) {
    feedActual = feed;
    const orden = feedCfg.plataformas || ['tiktok', 'instagram', 'youtube'];
    const porPlataforma = {};
    orden.forEach((p) => {
      porPlataforma[p] = [];
    });

    (feed.tendencias || []).forEach((t) => {
      const p = t.plataforma || 'tiktok';
      if (!porPlataforma[p]) porPlataforma[p] = [];
      porPlataforma[p].push(t);
    });

    Object.values(porPlataforma).forEach((lista) => {
      lista.sort((a, b) => (a.prioridad || 99) - (b.prioridad || 99));
    });

    const plataformasHtml = orden
      .filter((p) => porPlataforma[p]?.length)
      .map((p) => renderPlataforma(p, porPlataforma[p]))
      .join('');

    const total = (feed.tendencias || []).length;

    root.innerHTML = `
      <article class="portal-cliente tend-dashboard portal-cliente--landing"
        style="--card-border:${col.primario};--card-bg:${col.fondo};--card-text:${col.texto}">
        <span class="portal-badge">Proyecto ${escapeHtml(proyecto.codigo)} · ${escapeHtml(feed.region || 'Chile')}</span>

        <div class="tend-dashboard__hero">
          <h1>Tendencias comida · Chile</h1>
          <p class="portal-cliente__meta">Recetas y formatos virales — propuestos al entrar, sin buscar palabras</p>
          <p class="tend-dashboard__meta">
            <span class="tend-dashboard__estado" id="tend-estado">Listo</span>
            <span>${total} tendencias · TikTok, Instagram y YouTube Shorts</span>
            <time datetime="${escapeHtml(feed.actualizado)}">Actualizado: ${escapeHtml(formatoFecha(feed.actualizado))}</time>
          </p>
        </div>

        <div class="tend-resumen-box">
          <strong>Qué hace esta herramienta:</strong> al abrir esta página carga automáticamente tendencias de comida con buenos KPIs o viralidad en Chile. No necesitas buscar hashtags ni revisar red por red — solo entra y elige qué producir hoy.
        </div>

        <div class="tend-toolbar">
          <button type="button" class="portal-btn" id="tend-btn-refresh">↻ Actualizar tendencias</button>
          <a href="../../../index.html?tarea=herramientas/01" class="portal-btn portal-btn--ghost">Ir al organizador</a>
        </div>

        <div class="tend-plataformas">${plataformasHtml}</div>

        <details>
          <summary>Configuración y mantenimiento</summary>
          <p style="margin-top:0.75rem;font-size:0.88rem;color:var(--muted)">
            El feed vive en <code>data/tendencias-comida-chile.json</code>.
            Para refrescar datos: <code>python3 scripts/actualizar-tendencias-comida.py</code>
          </p>
        </details>
      </article>`;

    document.getElementById('tend-btn-refresh')?.addEventListener('click', () => boot(true));
  }

  function renderCargando() {
    root.innerHTML = `
      <article class="portal-cliente tend-dashboard" style="--card-border:${col.primario};--card-bg:${col.fondo};--card-text:${col.texto}">
        <h1>Tendencias comida · Chile</h1>
        <p class="tend-dashboard__meta">
          <span class="tend-dashboard__estado tend-dashboard__estado--cargando">Cargando tendencias…</span>
        </p>
        <p style="color:var(--muted)">Buscando recetas virales en TikTok, Instagram y YouTube Shorts…</p>
      </article>`;
  }

  function renderError(err) {
    root.innerHTML = `
      <article class="portal-cliente tend-dashboard" style="--card-border:${col.primario};--card-bg:${col.fondo};--card-text:${col.texto}">
        <h1>Tendencias comida · Chile</h1>
        <div class="tend-error" role="alert">
          No se pudieron cargar las tendencias. Abre con <code>npx serve .</code> en la raíz del proyecto.
          <br><small>${escapeHtml(err.message)}</small>
        </div>
        <p style="margin-top:1rem"><button type="button" class="portal-btn" id="tend-btn-retry">Reintentar</button></p>
      </article>`;
    document.getElementById('tend-btn-retry')?.addEventListener('click', () => boot(true));
  }

  async function boot(forzar = false) {
    renderCargando();
    try {
      const feed = await cargarFeed(forzar);
      renderFeed(feed);
    } catch (e) {
      console.error(e);
      renderError(e);
    }
  }

  boot();
})();
