(function () {
  const proyecto = window.HERRAMIENTAS_PROYECTOS?.TEND;
  if (!proyecto) return;

  const root = document.getElementById('tendencias-root');
  if (!root) return;

  const col = proyecto.colores;
  const feedCfg = proyecto.feed || {};
  const FEED_URL = feedCfg.url || '../../../data/tendencias-comida-chile.json';
  const CACHE_KEY = 'tendencias-comida-chile-cache';
  const PANEL_KEY = 'tendencias-panel';
  const VISTA_KEY = 'tendencias-vista';
  const PERIODO_KEY = 'tendencias-periodo';
  const PLATAFORMA_KEY = 'tendencias-plataforma';
  const CACHE_TTL_MS = (feedCfg.cacheMinutos || 30) * 60 * 1000;

  const PERIODOS = [
    { id: 'hoy', label: 'Hoy' },
    { id: 'semana', label: 'Esta semana' },
    { id: 'quince', label: 'Quince días' },
    { id: 'mes', label: 'Mes' },
    { id: 'tres-meses', label: 'Tres meses' }
  ];

  const PLATAFORMAS = {
    todas: { label: 'Todas las redes', icon: '◉', clase: 'todas' },
    tiktok: { label: 'TikTok', icon: '♪', clase: 'tiktok' },
    instagram: { label: 'Instagram', icon: '◎', clase: 'instagram' },
    youtube: { label: 'YouTube Shorts', icon: '▶', clase: 'youtube' },
    pinterest: { label: 'Pinterest', icon: 'P', clase: 'pinterest' }
  };

  let feedActual = null;
  let panelActual = leerPanel();
  let vistaActual = leerVista();
  let periodoActual = leerPeriodo();
  let plataformaActual = leerPlataforma();

  function leerPanel() {
    try {
      const p = localStorage.getItem(PANEL_KEY);
      return p === 'buscador' ? 'buscador' : 'brief';
    } catch {
      return 'brief';
    }
  }

  function guardarPanel(p) {
    panelActual = p;
    try {
      localStorage.setItem(PANEL_KEY, p);
    } catch {
      /* ignore */
    }
    const url = new URL(location.href);
    if (p === 'buscador') url.searchParams.set('vista', 'buscador');
    else url.searchParams.delete('vista');
    history.replaceState(null, '', url);
  }

  function leerVista() {
    try {
      return localStorage.getItem(VISTA_KEY) === 'tabla' ? 'tabla' : 'tarjetas';
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

  function leerPlataforma() {
    try {
      const p = localStorage.getItem(PLATAFORMA_KEY);
      return PLATAFORMAS[p] ? p : 'todas';
    } catch {
      return 'todas';
    }
  }

  function guardarPlataforma(p) {
    plataformaActual = p;
    try {
      localStorage.setItem(PLATAFORMA_KEY, p);
    } catch {
      /* ignore */
    }
  }

  function extraerFechaDeUrl(url) {
    if (!url) return null;
    const m = String(url).match(/\/(20\d{2})[/-](\d{2})[/-](\d{2})/);
    return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
  }

  /** Fecha de la noticia/fuente — nunca inventada */
  function fechaFuenteDe(t) {
    if (t.fechaFuente) return t.fechaFuente;
    if (t.fechaViral) return t.fechaViral;
    return extraerFechaDeUrl(t.fuente);
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
    if (!f) return false;
    const inicio = inicioPeriodo(periodoId);
    const fin = new Date();
    fin.setHours(23, 59, 59, 999);
    return f >= inicio && f <= fin;
  }

  function resumenRecetaDe(t) {
    return t.resumenReceta || t.anguloContenido || '—';
  }

  function feedFiltrado(feed) {
    const lista = (feed.tendencias || [])
      .filter((t) => {
        const fecha = fechaFuenteDe(t);
        if (!fecha) return false;
        if (plataformaActual !== 'todas' && t.plataforma !== plataformaActual) return false;
        return enPeriodo(fecha, periodoActual);
      })
      .sort((a, b) => fechaFuenteDe(b).localeCompare(fechaFuenteDe(a)));
    return { ...feed, tendencias: lista };
  }

  function textoIngredientes(t) {
    if (Array.isArray(t.ingredientes)) return t.ingredientes.join(', ');
    if (typeof t.ingredientes === 'string') return t.ingredientes;
    return '—';
  }

  function renderIngredientes(t) {
    if (Array.isArray(t.ingredientes) && t.ingredientes.length) {
      return `<ul class="tend-ingredientes">${t.ingredientes.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
    }
    return `<p>${escapeHtml(textoIngredientes(t))}</p>`;
  }

  function renderHashtags(t) {
    const tags = t.hashtags || [];
    if (!tags.length) return '';
    return `
      <div class="tend-hashtags-block">
        <p class="tend-card__label">Hashtags</p>
        <div class="tend-tags tend-tags--full">${tags.map((h) => `<span class="tend-tag">${escapeHtml(h)}</span>`).join('')}</div>
      </div>`;
  }

  function labelPlataforma(p) {
    return PLATAFORMAS[p]?.label || p;
  }

  function agruparPorPlataforma(feed) {
    const orden = (feedCfg.plataformas || ['tiktok', 'instagram', 'youtube', 'pinterest']).filter((p) => p !== 'todas');
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
      lista.sort((a, b) => fechaFuenteDe(b).localeCompare(fechaFuenteDe(a)));
    });

    return { orden, porPlataforma };
  }

  function feedVacioHtml() {
    const pl = PLATAFORMAS[plataformaActual]?.label || 'Todas';
    const pe = PERIODOS.find((p) => p.id === periodoActual)?.label || periodoActual;
    return `<p class="tend-vacio">No hay tendencias con fecha de fuente en <strong>${escapeHtml(pe)}</strong>${plataformaActual !== 'todas' ? ` en <strong>${escapeHtml(pl)}</strong>` : ''}. Prueba otro filtro o actualiza el feed.</p>`;
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
      return new Date(`${iso}T12:00:00`).toLocaleDateString('es-CL', { dateStyle: 'medium' });
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

  function renderNavPanel() {
    return `
      <nav class="tend-panel-nav" role="tablist" aria-label="Vista del proyecto">
        <button type="button" role="tab" aria-selected="${panelActual === 'brief' ? 'true' : 'false'}"
          class="portal-btn tend-panel-btn${panelActual === 'brief' ? ' tend-panel-btn--active' : ''}"
          data-panel="brief" id="tend-panel-brief">Brief</button>
        <button type="button" role="tab" aria-selected="${panelActual === 'buscador' ? 'true' : 'false'}"
          class="portal-btn tend-panel-btn${panelActual === 'buscador' ? ' tend-panel-btn--active' : ''}"
          data-panel="buscador" id="tend-panel-buscador">Buscador</button>
      </nav>`;
  }

  function bindNavPanel() {
    root.querySelectorAll('.tend-panel-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = btn.dataset.panel;
        if (!p || p === panelActual) return;
        guardarPanel(p);
        if (p === 'brief') renderBrief();
        else if (feedActual) renderFeed(feedActual);
        else boot(false);
      });
    });
  }

  function renderBrief() {
    const brief = proyecto.brief || {};
    const bloques = (brief.cuerpo || [])
      .map(
        (b) => `
        <section class="tend-brief__bloque">
          <h3>${escapeHtml(b.titulo)}</h3>
          <p>${escapeHtml(b.texto)}</p>
        </section>`
      )
      .join('');

    const secciones = (proyecto.secciones || [])
      .map(
        (s) => `
        <li>
          <strong>${escapeHtml(s.titulo)}</strong> — ${escapeHtml(s.descripcion)}
        </li>`
      )
      .join('');

    root.innerHTML = `
      <article class="portal-cliente tend-dashboard tend-brief"
        style="--card-border:${col.primario};--card-bg:${col.fondo};--card-text:${col.texto}">
        <span class="portal-badge">Proyecto ${escapeHtml(proyecto.codigo)} · Chile</span>
        ${renderNavPanel()}
        <div class="tend-brief__hero">
          <h1>${escapeHtml(brief.titulo || 'Brief del proyecto')}</h1>
          <p class="tend-brief__intro">${escapeHtml(brief.intro || proyecto.descripcion || '')}</p>
        </div>
        <div class="tend-brief__cuerpo">${bloques}</div>
        ${secciones ? `<ul class="tend-brief__lista">${secciones}</ul>` : ''}
        <div class="tend-brief__acciones">
          <button type="button" class="portal-btn tend-btn-principal" id="tend-btn-abrir-buscador">
            Abrir buscador de tendencias
          </button>
          <a href="../../../index.html?tarea=herramientas/01" class="portal-btn portal-btn--ghost">Ir al organizador</a>
        </div>
        <p class="tend-inicio__ruta">Página: <code>Herramientas/Tendencias.html</code></p>
      </article>`;

    bindNavPanel();
    document.getElementById('tend-btn-abrir-buscador')?.addEventListener('click', () => {
      guardarPanel('buscador');
      if (feedActual) renderFeed(feedActual);
      else boot(false);
    });
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
    const fecha = fechaFuenteDe(t);
    const link = t.fuente
      ? `<a class="tend-card__link" href="${escapeHtml(t.fuente)}" target="_blank" rel="noopener">Fuente (${escapeHtml(formatoFecha(fecha))}) →</a>`
      : '';

    return `
      <article class="tend-card">
        <div class="tend-card__top">
          <h3>${escapeHtml(t.titulo)}</h3>
          <span class="tend-card__senal tend-card__senal--${escapeHtml(senal)}">${escapeHtml((t.kpis?.senal || 'medio').replace('-', ' '))}</span>
        </div>
        <p class="tend-card__formato">${escapeHtml(t.formato)} · <time datetime="${escapeHtml(fecha)}">${escapeHtml(formatoFecha(fecha))}</time></p>
        ${renderKpis(t.kpis)}
        <p class="tend-card__label">Ingredientes</p>
        ${renderIngredientes(t)}
        <p class="tend-card__label">Resumen receta</p>
        <p>${escapeHtml(resumenRecetaDe(t))}</p>
        ${renderHashtags(t)}
        ${link}
      </article>`;
  }

  function renderTablaFila(t) {
    const senal = (t.kpis?.senal || 'medio').replace(/\s+/g, '-');
    const fecha = fechaFuenteDe(t);
    const hashtags = (t.hashtags || []).join(' ');
    const link = t.fuente
      ? `<a href="${escapeHtml(t.fuente)}" target="_blank" rel="noopener">Ver</a>`
      : '—';

    return `
      <tr>
        <td data-label="Plataforma"><span class="tend-tabla__plat tend-tabla__plat--${escapeHtml(t.plataforma || '')}">${escapeHtml(labelPlataforma(t.plataforma))}</span></td>
        <td data-label="Tendencia"><strong>${escapeHtml(t.titulo)}</strong></td>
        <td data-label="Fecha fuente"><time datetime="${escapeHtml(fecha)}">${escapeHtml(formatoFecha(fecha))}</time></td>
        <td data-label="Formato">${escapeHtml(t.formato)}</td>
        <td data-label="Vistas">${escapeHtml(t.kpis?.vistas || '—')}</td>
        <td data-label="Engagement">${escapeHtml(t.kpis?.engagement || '—')}</td>
        <td data-label="Crecimiento">${escapeHtml(t.kpis?.crecimiento || '—')}</td>
        <td data-label="Señal"><span class="tend-card__senal tend-card__senal--${escapeHtml(senal)}">${escapeHtml((t.kpis?.senal || 'medio').replace('-', ' '))}</span></td>
        <td data-label="Ingredientes" class="tend-tabla__ing">${escapeHtml(textoIngredientes(t))}</td>
        <td data-label="Resumen receta">${escapeHtml(resumenRecetaDe(t))}</td>
        <td data-label="Hashtags" class="tend-tabla__tags tend-tabla__tags--full">${escapeHtml(hashtags)}</td>
        <td data-label="Ref.">${link}</td>
      </tr>`;
  }

  function renderTabla(feed) {
    const items = listaPlana(feed);
    if (!items.length) return feedVacioHtml();
    return `
      <div class="tend-tabla-wrap">
        <table class="tend-tabla">
          <thead>
            <tr>
              <th>Plataforma</th>
              <th>Tendencia</th>
              <th>Fecha fuente</th>
              <th>Formato</th>
              <th>Vistas</th>
              <th>Engagement</th>
              <th>Crecimiento</th>
              <th>Señal</th>
              <th>Ingredientes</th>
              <th>Resumen receta</th>
              <th>Hashtags</th>
              <th>Ref.</th>
            </tr>
          </thead>
          <tbody>${items.map(renderTablaFila).join('')}</tbody>
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

  function renderSelectFiltros() {
    const optsPeriodo = PERIODOS.map(
      (p) => `<option value="${p.id}"${periodoActual === p.id ? ' selected' : ''}>${escapeHtml(p.label)}</option>`
    ).join('');
    const optsPlat = Object.entries(PLATAFORMAS)
      .map(([id, meta]) => `<option value="${id}"${plataformaActual === id ? ' selected' : ''}>${escapeHtml(meta.label)}</option>`)
      .join('');

    return `
      <div class="tend-filtros-select">
        <label class="tend-filtro-label">
          <span>Período</span>
          <select id="tend-select-periodo" class="tend-select">${optsPeriodo}</select>
        </label>
        <label class="tend-filtro-label">
          <span>Red social</span>
          <select id="tend-select-plataforma" class="tend-select">${optsPlat}</select>
        </label>
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
      const pl = plataformaActual !== 'todas' ? ` · ${PLATAFORMAS[plataformaActual].label}` : '';
      contador.textContent = `${total} tendencia${total === 1 ? '' : 's'} · ${PERIODOS.find((p) => p.id === periodoActual)?.label || ''}${pl}`;
    }
  }

  function bindSelectFiltros() {
    document.getElementById('tend-select-periodo')?.addEventListener('change', (e) => {
      guardarPeriodo(e.target.value);
      actualizarContenido();
    });
    document.getElementById('tend-select-plataforma')?.addEventListener('change', (e) => {
      guardarPlataforma(e.target.value);
      actualizarContenido();
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
        actualizarContenido();
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
        ${renderNavPanel()}

        <div class="tend-dashboard__hero">
          <h1>Tendencias comida · Chile</h1>
          <p class="portal-cliente__meta">Fecha según la noticia enlazada · ingredientes y hashtags completos</p>
          <p class="tend-dashboard__meta">
            <span class="tend-dashboard__estado" id="tend-estado">Listo</span>
            <span id="tend-contador">${total} tendencia${total === 1 ? '' : 's'} · ${escapeHtml(PERIODOS.find((p) => p.id === periodoActual)?.label || '')}</span>
            <time datetime="${escapeHtml(feed.actualizado)}">Feed: ${escapeHtml(formatoFecha(feed.actualizado?.slice(0, 10)))}</time>
          </p>
        </div>

        <div class="tend-resumen-box">
          Solo se listan tendencias cuya <strong>fecha de publicación de la fuente</strong> cae en el período elegido. Sin fechas de 2025 ni datos sin enlace fechado.
        </div>

        <div class="tend-toolbar tend-toolbar--wrap">
          ${renderSelectFiltros()}
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
            Datos en <code>data/tendencias-comida-chile.json</code> con campo <code>fechaFuente</code> (fecha de la noticia).
            Actualizar: <code>python3 scripts/actualizar-tendencias-comida.py</code>
          </p>
        </details>
      </article>`;

    bindNavPanel();
    bindSelectFiltros();
    bindVistaToggle();
    document.getElementById('tend-btn-refresh')?.addEventListener('click', () => boot(true));
  }

  function renderCargando() {
    root.innerHTML = `
      <article class="portal-cliente tend-dashboard" style="--card-border:${col.primario};--card-bg:${col.fondo};--card-text:${col.texto}">
        ${renderNavPanel()}
        <h1>Tendencias comida · Chile</h1>
        <p class="tend-dashboard__meta">
          <span class="tend-dashboard__estado tend-dashboard__estado--cargando">Cargando tendencias…</span>
        </p>
      </article>`;
    bindNavPanel();
  }

  function renderError(err) {
    root.innerHTML = `
      <article class="portal-cliente tend-dashboard" style="--card-border:${col.primario};--card-bg:${col.fondo};--card-text:${col.texto}">
        ${renderNavPanel()}
        <h1>Tendencias comida · Chile</h1>
        <div class="tend-error" role="alert">
          No se pudieron cargar las tendencias. Abre con <code>npx serve .</code>
          <br><small>${escapeHtml(err.message)}</small>
        </div>
        <p style="margin-top:1rem">
          <button type="button" class="portal-btn tend-btn-principal" id="tend-btn-retry">Reintentar</button>
          <button type="button" class="portal-btn portal-btn--ghost" id="tend-btn-volver-brief">Volver al brief</button>
        </p>
      </article>`;
    bindNavPanel();
    document.getElementById('tend-btn-retry')?.addEventListener('click', () => boot(true));
    document.getElementById('tend-btn-volver-brief')?.addEventListener('click', () => {
      guardarPanel('brief');
      renderBrief();
    });
  }

  async function boot(forzar = false) {
    guardarPanel('buscador');
    if (forzar) {
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch {
        /* ignore */
      }
    }
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
  const abrirBuscador = params.get('vista') === 'buscador' || params.get('ver') === '1';
  if (abrirBuscador) {
    guardarPanel('buscador');
    boot();
  } else if (panelActual === 'buscador' && leerCache()) {
    guardarPanel('buscador');
    boot();
  } else {
    guardarPanel('brief');
    renderBrief();
  }
})();
