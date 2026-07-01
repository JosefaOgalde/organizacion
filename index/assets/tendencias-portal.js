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
  const PERIODO_KEY = 'tendencias-periodo';
  const CACHE_TTL_MS = (feedCfg.cacheMinutos || 30) * 60 * 1000;

  const PERIODOS = [
    { id: 'hoy', label: 'Hoy' },
    { id: 'semana', label: 'Esta semana' },
    { id: 'quince', label: 'Quince días' },
    { id: 'mes', label: 'Mes' },
    { id: 'tres-meses', label: 'Tres meses' }
  ];

  const PLATAFORMAS = {
    tiktok: { label: 'TikTok', icon: '♪', clase: 'tiktok' },
    instagram: { label: 'Instagram', icon: '◎', clase: 'instagram' },
    youtube: { label: 'YouTube Shorts', icon: '▶', clase: 'youtube' }
  };

  let feedActual = null;
  let vistaActual = leerVista();
  let periodoActual = leerPeriodo();

  function leerPeriodo() {
    try {
      const p = localStorage.getItem(PERIODO_KEY);
      return PERIODOS.some((x) => x.id === p) ? p : 'mes';
    } catch {
      return 'mes';
    }
  }

  function guardarPeriodo(p) {
    periodoActual = p;
    try {
      localStorage.setItem(PERIODO_KEY, p);
    } catch {
      /* ignore */
    }
  }

  function parseFecha(str) {
    if (!str) return null;
    const d = new Date(`${str}T12:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function hoyLocal() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function inicioPeriodo(id) {
    const hoy = hoyLocal();
    if (id === 'hoy') return hoy;
    if (id === 'semana') {
      const d = new Date(hoy);
      const dia = d.getDay();
      const desdeLunes = dia === 0 ? 6 : dia - 1;
      d.setDate(d.getDate() - desdeLunes);
      return d;
    }
    const dias = { quince: 15, mes: 30, 'tres-meses': 90 }[id] || 30;
    const d = new Date(hoy);
    d.setDate(d.getDate() - dias);
    return d;
  }

  function enPeriodo(fechaStr, periodoId) {
    const f = parseFecha(fechaStr);
    if (!f) return periodoId === 'tres-meses';
    const inicio = inicioPeriodo(periodoId);
    const fin = new Date();
    fin.setHours(23, 59, 59, 999);
    return f >= inicio && f <= fin;
  }

  function feedFiltrado(feed) {
    const lista = (feed.tendencias || []).filter((t) => enPeriodo(t.fechaViral, periodoActual));
    return { ...feed, tendencias: lista };
  }

  function textoIngredientes(t) {
    if (Array.isArray(t.ingredientes)) return t.ingredientes.join(', ');
    if (typeof t.ingredientes === 'string') return t.ingredientes;
    return t.porQueFunciona || '—';
  }

  function renderIngredientes(t) {
    if (Array.isArray(t.ingredientes) && t.ingredientes.length) {
      return `<ul class="tend-ingredientes">${t.ingredientes.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
    }
    return `<p>${escapeHtml(textoIngredientes(t))}</p>`;
  }

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

  function feedVacioHtml() {
    const label = PERIODOS.find((p) => p.id === periodoActual)?.label || periodoActual;
    return `<p class="tend-vacio">No hay tendencias en el período <strong>${escapeHtml(label)}</strong>. Prueba otro filtro o actualiza el feed.</p>`;
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
        <p class="tend-card__label">Ingredientes</p>
        ${renderIngredientes(t)}
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
        <td data-label="Fecha">${escapeHtml(t.fechaViral || '—')}</td>
        <td data-label="Formato">${escapeHtml(t.formato)}</td>
        <td data-label="Vistas">${escapeHtml(t.kpis?.vistas || '—')}</td>
        <td data-label="Engagement">${escapeHtml(t.kpis?.engagement || '—')}</td>
        <td data-label="Crecimiento">${escapeHtml(t.kpis?.crecimiento || '—')}</td>
        <td data-label="Señal"><span class="tend-card__senal tend-card__senal--${escapeHtml(senal)}">${escapeHtml((t.kpis?.senal || 'medio').replace('-', ' '))}</span></td>
        <td data-label="Ingredientes" class="tend-tabla__ing">${escapeHtml(textoIngredientes(t))}</td>
        <td data-label="Ángulo">${escapeHtml(t.anguloContenido)}</td>
        <td data-label="Chile">${escapeHtml(t.ejemploChile || '—')}</td>
        <td data-label="Hashtags" class="tend-tabla__tags">${escapeHtml(hashtags)}</td>
        <td data-label="Ref.">${link}</td>
      </tr>`;
  }

  function renderTabla(feed) {
    const items = listaPlana(feed);
    if (!items.length) return feedVacioHtml();
    const filas = items.map(renderTablaFila).join('');
    return `
      <div class="tend-tabla-wrap">
        <table class="tend-tabla">
          <thead>
            <tr>
              <th>Plataforma</th>
              <th>Tendencia</th>
              <th>Fecha</th>
              <th>Formato</th>
              <th>Vistas</th>
              <th>Engagement</th>
              <th>Crecimiento</th>
              <th>Señal</th>
              <th>Ingredientes</th>
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
    const html = orden
      .filter((p) => porPlataforma[p]?.length)
      .map((p) => renderPlataforma(p, porPlataforma[p]))
      .join('');
    return html || feedVacioHtml();
  }

  function renderFiltroPeriodo() {
    return `
      <div class="tend-filtro-periodo" role="group" aria-label="Filtrar por período">
        ${PERIODOS.map(
          (p) =>
            `<button type="button" class="portal-btn tend-periodo-btn${periodoActual === p.id ? ' tend-periodo-btn--active' : ''}" data-periodo="${p.id}">${escapeHtml(p.label)}</button>`
        ).join('')}
      </div>`;
  }

  function renderVistaToggle() {
    return `
      <div class="tend-vista-toggle" role="group" aria-label="Tipo de vista">
        <button type="button" class="portal-btn tend-vista-btn${vistaActual === 'tarjetas' ? ' tend-vista-btn--active' : ''}" data-vista="tarjetas">Tarjetas</button>
        <button type="button" class="portal-btn tend-vista-btn${vistaActual === 'tabla' ? ' tend-vista-btn--active' : ''}" data-vista="tabla">Tabla</button>
      </div>`;
  }

  function renderContenido(feed) {
    const filtrado = feedFiltrado(feed);
    return vistaActual === 'tabla'
      ? renderTabla(filtrado)
      : `<div class="tend-plataformas">${renderTarjetas(filtrado)}</div>`;
  }

  function actualizarContenido() {
    if (!feedActual) return;
    const filtrado = feedFiltrado(feedActual);
    const total = filtrado.tendencias.length;
    const cont = document.getElementById('tend-contenido');
    const contador = document.getElementById('tend-contador');
    if (cont) cont.innerHTML = renderContenido(feedActual);
    if (contador) {
      contador.textContent = `${total} tendencia${total === 1 ? '' : 's'} en ${PERIODOS.find((p) => p.id === periodoActual)?.label || periodoActual}`;
    }
  }

  function bindFiltroPeriodo() {
    root.querySelectorAll('.tend-periodo-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = btn.dataset.periodo;
        if (!p || p === periodoActual) return;
        guardarPeriodo(p);
        root.querySelectorAll('.tend-periodo-btn').forEach((b) => {
          b.classList.toggle('tend-periodo-btn--active', b.dataset.periodo === p);
        });
        actualizarContenido();
      });
    });
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
        if (cont) actualizarContenido();
      });
    });
  }

  function renderFeed(feed) {
    feedActual = feed;
    const filtrado = feedFiltrado(feed);
    const total = filtrado.tendencias.length;

    root.innerHTML = `
      <article class="portal-cliente tend-dashboard portal-cliente--landing"
        style="--card-border:${col.primario};--card-bg:${col.fondo};--card-text:${col.texto}">
        <span class="portal-badge">Proyecto ${escapeHtml(proyecto.codigo)} · ${escapeHtml(feed.region || 'Chile')}</span>

        <div class="tend-dashboard__hero">
          <h1>Tendencias comida · Chile</h1>
          <p class="portal-cliente__meta">Ingredientes, KPIs y filtros por período</p>
          <p class="tend-dashboard__meta">
            <span class="tend-dashboard__estado" id="tend-estado">Listo</span>
            <span id="tend-contador">${total} tendencia${total === 1 ? '' : 's'} en ${escapeHtml(PERIODOS.find((p) => p.id === periodoActual)?.label || '')}</span>
            <time datetime="${escapeHtml(feed.actualizado)}">Actualizado: ${escapeHtml(formatoFecha(feed.actualizado))}</time>
          </p>
        </div>

        <div class="tend-resumen-box">
          Filtra por <strong>hoy</strong>, <strong>esta semana</strong>, <strong>quince días</strong>, <strong>mes</strong> o <strong>tres meses</strong>. Cada tendencia muestra sus <strong>ingredientes</strong> listos para producir.
        </div>

        <div class="tend-toolbar tend-toolbar--wrap">
          ${renderFiltroPeriodo()}
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
    bindFiltroPeriodo();
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
