(function () {
  const proyecto = window.HERRAMIENTAS_PROYECTOS?.TEND;
  if (!proyecto) return;

  const root = document.getElementById('tendencias-root');
  if (!root) return;

  const col = proyecto.colores;
  const feedCfg = proyecto.feed || {};
  const FEED_URL = feedCfg.url || '../../../data/tendencias-comida-chile.json';
  const CACHE_KEY = 'tendencias-comida-chile-cache';
  const VISTA_KEY = 'tendencias-vista';
  const CACHE_TTL_MS = (feedCfg.cacheMinutos || 30) * 60 * 1000;

  const PLATAFORMAS = {
    tiktok: { label: 'TikTok', icon: '♪', clase: 'tiktok' },
    instagram: { label: 'Instagram', icon: '◎', clase: 'instagram' },
    youtube: { label: 'YouTube Shorts', icon: '▶', clase: 'youtube' }
  };

  let feedActual = null;
  let vistaActual = leerVista();

  function leerVista() {
    try {
      const v = localStorage.getItem(VISTA_KEY);
      return v === 'tabla' ? 'tabla' : 'tarjetas';
    } catch {
      return 'tarjetas';
    }
  }

  function guardarVista(v) {
    vistaActual = v;
    try {
      localStorage.setItem(VISTA_KEY, v);
    } catch {
      /* ignore */
    }
  }

  function labelPlataforma(p) {
    return PLATAFORMAS[p]?.label || p;
  }

  function agruparPorPlataforma(feed) {
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

    return { orden, porPlataforma };
  }

  function listaPlana(feed) {
    const { orden, porPlataforma } = agruparPorPlataforma(feed);
    return orden.flatMap((p) => porPlataforma[p] || []);
  }

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

  function renderTablaFila(t) {
    const senal = (t.kpis?.senal || 'medio').replace(/\s+/g, '-');
    const hashtags = (t.hashtags || []).join(' ');
    const link = t.fuente
      ? `<a href="${escapeHtml(t.fuente)}" target="_blank" rel="noopener">Ver</a>`
      : '—';

    return `
      <tr>
        <td data-label="Plataforma"><span class="tend-tabla__plat tend-tabla__plat--${escapeHtml(t.plataforma || '')}">${escapeHtml(labelPlataforma(t.plataforma))}</span></td>
        <td data-label="Tendencia"><strong>${escapeHtml(t.titulo)}</strong></td>
        <td data-label="Formato">${escapeHtml(t.formato)}</td>
        <td data-label="Vistas">${escapeHtml(t.kpis?.vistas || '—')}</td>
        <td data-label="Engagement">${escapeHtml(t.kpis?.engagement || '—')}</td>
        <td data-label="Crecimiento">${escapeHtml(t.kpis?.crecimiento || '—')}</td>
        <td data-label="Señal"><span class="tend-card__senal tend-card__senal--${escapeHtml(senal)}">${escapeHtml((t.kpis?.senal || 'medio').replace('-', ' '))}</span></td>
        <td data-label="Ángulo">${escapeHtml(t.anguloContenido)}</td>
        <td data-label="Chile">${escapeHtml(t.ejemploChile || '—')}</td>
        <td data-label="Hashtags" class="tend-tabla__tags">${escapeHtml(hashtags)}</td>
        <td data-label="Ref.">${link}</td>
      </tr>`;
  }

  function renderTabla(feed) {
    const filas = listaPlana(feed).map(renderTablaFila).join('');
    return `
      <div class="tend-tabla-wrap">
        <table class="tend-tabla">
          <thead>
            <tr>
              <th>Plataforma</th>
              <th>Tendencia</th>
              <th>Formato</th>
              <th>Vistas</th>
              <th>Engagement</th>
              <th>Crecimiento</th>
              <th>Señal</th>
              <th>Ángulo de contenido</th>
              <th>Señal Chile</th>
              <th>Hashtags</th>
              <th>Ref.</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </div>`;
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

  function renderTarjetas(feed) {
    const { orden, porPlataforma } = agruparPorPlataforma(feed);
    return orden
      .filter((p) => porPlataforma[p]?.length)
      .map((p) => renderPlataforma(p, porPlataforma[p]))
      .join('');
  }

  function renderVistaToggle() {
    return `
      <div class="tend-vista-toggle" role="group" aria-label="Tipo de vista">
        <button type="button" class="portal-btn tend-vista-btn${vistaActual === 'tarjetas' ? ' tend-vista-btn--active' : ''}" data-vista="tarjetas">Tarjetas</button>
        <button type="button" class="portal-btn tend-vista-btn${vistaActual === 'tabla' ? ' tend-vista-btn--active' : ''}" data-vista="tabla">Tabla</button>
      </div>`;
  }

  function renderContenido(feed) {
    return vistaActual === 'tabla'
      ? renderTabla(feed)
      : `<div class="tend-plataformas">${renderTarjetas(feed)}</div>`;
  }

  function bindVistaToggle() {
    root.querySelectorAll('.tend-vista-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.vista;
        if (!v || v === vistaActual || !feedActual) return;
        guardarVista(v);
        root.querySelectorAll('.tend-vista-btn').forEach((b) => {
          b.classList.toggle('tend-vista-btn--active', b.dataset.vista === v);
        });
        const cont = document.getElementById('tend-contenido');
        if (cont) cont.innerHTML = renderContenido(feedActual);
      });
    });
  }

  function renderFeed(feed) {
    feedActual = feed;
    const total = (feed.tendencias || []).length;

    root.innerHTML = `
      <article class="portal-cliente tend-dashboard portal-cliente--landing"
        style="--card-border:${col.primario};--card-bg:${col.fondo};--card-text:${col.texto}">
        <span class="portal-badge">Proyecto ${escapeHtml(proyecto.codigo)} · ${escapeHtml(feed.region || 'Chile')}</span>

        <div class="tend-dashboard__hero">
          <h1>Tendencias comida · Chile</h1>
          <p class="portal-cliente__meta">Recetas y formatos virales — elige vista tarjetas o tabla</p>
          <p class="tend-dashboard__meta">
            <span class="tend-dashboard__estado" id="tend-estado">Listo</span>
            <span>${total} tendencias · TikTok, Instagram y YouTube Shorts</span>
            <time datetime="${escapeHtml(feed.actualizado)}">Actualizado: ${escapeHtml(formatoFecha(feed.actualizado))}</time>
          </p>
        </div>

        <div class="tend-resumen-box">
          <strong>Qué hace esta herramienta:</strong> propone tendencias de comida con buenos KPIs o viralidad en Chile. Cambia entre <strong>tarjetas</strong> y <strong>tabla</strong> según cómo prefieras revisarlas.
        </div>

        <div class="tend-toolbar">
          ${renderVistaToggle()}
          <button type="button" class="portal-btn" id="tend-btn-refresh">↻ Actualizar</button>
          <a href="../../../index.html?tarea=herramientas/01" class="portal-btn portal-btn--ghost">Ir al organizador</a>
        </div>

        <div id="tend-contenido">${renderContenido(feed)}</div>

        <details>
          <summary>Configuración y mantenimiento</summary>
          <p style="margin-top:0.75rem;font-size:0.88rem;color:var(--muted)">
            El feed vive en <code>data/tendencias-comida-chile.json</code>.
            Para refrescar datos: <code>python3 scripts/actualizar-tendencias-comida.py</code>
          </p>
        </details>
      </article>`;

    bindVistaToggle();
    document.getElementById('tend-btn-refresh')?.addEventListener('click', () => boot(true));
  }

  function renderInicio() {
    const btn = document.getElementById('tend-btn-ver');
    const inicio = document.getElementById('tendencias-inicio');
    if (inicio && btn) {
      btn.disabled = false;
      btn.classList.remove('tend-btn-principal--cargando');
      btn.textContent = 'Ver tendencias de comida';
      btn.onclick = () => boot(true);
      return;
    }

    root.innerHTML = `
      <article class="portal-cliente tend-dashboard tend-inicio"
        style="--card-border:${col.primario};--card-bg:${col.fondo};--card-text:${col.texto}">
        <span class="portal-badge">Proyecto ${escapeHtml(proyecto.codigo)} · Chile</span>
        <h2>Tendencias comida · Chile</h2>
        <p class="portal-cliente__meta">TikTok, Instagram y YouTube Shorts — recetas virales con KPIs</p>
        <p class="tend-inicio__texto">Pulsa el botón para cargar las tendencias del momento. No necesitas buscar hashtags ni revisar red por red.</p>
        <button type="button" class="portal-btn tend-btn-principal" id="tend-btn-ver">Ver tendencias de comida</button>
        <p class="tend-inicio__ruta">Página: <code>Herramientas/Tendencias.html</code></p>
      </article>`;
    document.getElementById('tend-btn-ver')?.addEventListener('click', () => boot(true));
  }

  function renderCargando() {
    const btn = document.getElementById('tend-btn-ver');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('tend-btn-principal--cargando');
      btn.textContent = 'Cargando tendencias…';
      return;
    }

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
        <p style="margin-top:1rem">
          <button type="button" class="portal-btn tend-btn-principal" id="tend-btn-retry">Ver tendencias de comida</button>
        </p>
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

  const params = new URLSearchParams(location.search);
  const btnInicio = document.getElementById('tend-btn-ver');
  if (btnInicio) {
    btnInicio.addEventListener('click', () => boot(true));
  }
  if (params.get('ver') === '1') {
    boot();
  } else {
    renderInicio();
  }
})();
