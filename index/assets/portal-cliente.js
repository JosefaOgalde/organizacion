(function () {
  if (typeof CLIENTES_PORTAL === 'undefined') return;

  document.body.classList.add('portal-page--light');

  const slug = document.body.dataset.clienteSlug;
  const archivoLegacy = document.body.dataset.cliente;
  const depth = Number(document.body.dataset.portalDepth || (slug ? 1 : 0));

  const c = slug
    ? CLIENTES_PORTAL.find((x) => x.slug === slug)
    : CLIENTES_PORTAL.find((x) => x.archivo === archivoLegacy || x.archivo?.startsWith(archivoLegacy));

  const root = document.getElementById('portal-root');
  if (!root) return;

  if (!c) {
    root.innerHTML = '<p class="portal-paso">Cliente no encontrado.</p>';
    return;
  }

  const STORAGE_KEY = 'organizacion_v2';
  let datos = null;
  let modoEdicion = false;
  let mostrarNuevaTarea = false;

  /** Color del organizador (string) — no usar el RGB del portal en datos.clientes */
  const COLOR_ORG_POR_ID = {
    'cli-trendseeker': 'lavanda',
    'cli-ecr': 'celeste',
    'cli-piscineria': 'menta',
    'cli-hotspring': 'mentaSuave',
    'cli-mkof': 'agua',
    'cli-joyas-mercury': 'rosa',
    'cli-sie': 'grafito',
    'cli-desafio-latam': 'durazno',
    'cli-impresoreando': 'ambar',
    'cli-herramientas': 'grafito',
    'cli-tronwell': 'azul',
  };

  const pathUp = depth ? '../'.repeat(depth) : './';
  const pathOrganizador = depth ? '../../../index.html' : '../../index.html';
  const pathListado = depth ? '../' : '../clientes.html';

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toast(msg) {
    let el = document.getElementById('portal-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'portal-toast';
      el.className = 'portal-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('portal-toast--visible');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('portal-toast--visible'), 2400);
  }

  function hoyISO() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function idTarea() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function colorOrgCliente() {
    return COLOR_ORG_POR_ID[c.id] || 'lavanda';
  }

  function tituloConCliente(raw) {
    const t = String(raw || '').trim();
    const abrev = (datos?.clientes?.find((x) => x.id === c.id)?.abrev || c.abrev || '').trim();
    if (!t) return abrev ? `[${abrev}]` : '';
    if (abrev && t.toUpperCase().startsWith(`[${abrev.toUpperCase()}]`)) return t;
    return abrev ? `[${abrev}] ${t}` : t;
  }

  function siguienteNumeroHistorico(clienteId) {
    let max = 0;
    (datos.tareas || []).forEach((t) => {
      if (t.clienteId !== clienteId) return;
      const n = parseInt(String(t.numeroHistorico || '').replace(/\D/g, ''), 10);
      if (!Number.isNaN(n) && n > max) max = n;
    });
    return String(max + 1).padStart(2, '0');
  }

  function slugClienteUrl() {
    return String(c.id || '').replace(/^cli-/, '') || c.slug || 'cliente';
  }

  function asegurarClienteEnDatos() {
    if (!datos || !Array.isArray(datos.clientes)) {
      datos = { clientes: [], tareas: [], version: 2 };
    }
    if (!Array.isArray(datos.tareas)) datos.tareas = [];
    let cli = datos.clientes.find((x) => x.id === c.id);
    if (!cli) {
      cli = {
        id: c.id,
        nombre: c.nombre,
        abrev: c.abrev,
        tipo: c.tipo || 'full-time',
        color: colorOrgCliente(),
        ficha: { documentos: [], seccionesExtra: [] },
      };
      datos.clientes.push(cli);
    } else {
      if (!cli.nombre) cli.nombre = c.nombre;
      if (!cli.abrev) cli.abrev = c.abrev;
      // No pisar color string del organizador con objeto RGB del portal
      if (!cli.color || typeof cli.color === 'object') cli.color = colorOrgCliente();
    }
    if (!cli.ficha) cli.ficha = { documentos: [], seccionesExtra: [] };
    if (typeof window.LandingImagenesStore !== 'undefined') {
      window.LandingImagenesStore.asegurarLanding(cli);
    } else if (!cli.ficha.landing) {
      cli.ficha.landing = { imagenes: [] };
    }
    return cli;
  }

  function cargarDesdeLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) datos = JSON.parse(raw);
    } catch {
      datos = null;
    }
    if (!datos || !Array.isArray(datos.clientes)) {
      datos = { clientes: [], tareas: [], version: 2 };
    }
    return asegurarClienteEnDatos();
  }

  async function cargarDatos() {
    let live = null;
    if (typeof window.fetchOrganizacionLive === 'function') {
      try {
        live = await window.fetchOrganizacionLive();
      } catch {
        live = null;
      }
    }
    let local = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) local = JSON.parse(raw);
    } catch {
      local = null;
    }

    if (live && Array.isArray(live.clientes) && Array.isArray(live.tareas)) {
      const preferLive =
        typeof window.organizacionLiveEsMasReciente === 'function'
          ? window.organizacionLiveEsMasReciente(local, live)
          : !local;
      datos = preferLive || !local ? live : local;
    } else if (local && Array.isArray(local.clientes)) {
      datos = local;
    } else {
      datos = { clientes: [], tareas: [], version: 2 };
    }
    return asegurarClienteEnDatos();
  }

  function persistir(msg) {
    try {
      datos.respaldoActualizado = new Date().toISOString().slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
      if (typeof window.persistOrganizacionToDisk === 'function') {
        window.persistOrganizacionToDisk(datos);
      }
      if (msg) toast(msg);
      return true;
    } catch (e) {
      toast('No se pudo guardar');
      console.error(e);
      return false;
    }
  }

  function guardar(cli) {
    try {
      cli.ficha.actualizado = new Date().toISOString();
      persistir('Cambios guardados');
    } catch (e) {
      toast('No se pudo guardar');
      console.error(e);
    }
  }

  function crearTareaDesdePortal(fields) {
    const cli = asegurarClienteEnDatos();
    const numero = siguienteNumeroHistorico(c.id);
    const tarea = {
      id: idTarea(),
      titulo: tituloConCliente(fields.titulo),
      clienteId: c.id,
      fecha: fields.fecha || hoyISO(),
      horaInicio: fields.horaInicio || '09:00',
      horaFin: fields.horaFin || '11:00',
      notas: String(fields.notas || '').trim(),
      prioridad: fields.prioridad || 'media',
      completada: false,
      pendiente: false,
      numeroHistorico: numero,
    };
    datos.tareas.push(tarea);
    persistir(`Tarea ${numero} creada · ${cli.abrev || c.abrev}`);
    return tarea;
  }

  function hrefProyecto(archivo) {
    if (!archivo) return '#';
    if (/^https?:\/\//i.test(archivo) || archivo.startsWith('/')) return archivo;
    const limpio = archivo.replace(/\.html$/i, '');
    return depth ? `${pathUp}${limpio}` : limpio;
  }

  function contarTareasCliente() {
    if (!datos?.tareas) return { total: 0, pendientes: 0 };
    const delCliente = datos.tareas.filter((t) => t.clienteId === c.id);
    return {
      total: delCliente.length,
      pendientes: delCliente.filter((t) => !t.completada && !t.pendiente).length,
    };
  }

  function imagenesDeTarea(t) {
    const out = [];
    const seen = new Set();
    const push = (img) => {
      const src = img?.url || img?.dataUrl;
      if (!src || seen.has(src)) return;
      seen.add(src);
      out.push({ nombre: img.nombre || img.titulo || 'Imagen', url: img.url, dataUrl: img.dataUrl });
    };
    for (const img of t?.sesionAgente?.imagenesReferencia || []) push(img);
    for (const m of t?.sesionAgente?.mensajes || []) {
      for (const img of m.imagenes || []) push(img);
    }
    const cli = (datos.clientes || []).find((x) => x.id === c.id);
    for (const d of cli?.ficha?.documentos || []) {
      if (d.tareaId === t.id && d.categoria === 'imagen' && (d.url || d.dataUrl)) {
        push({ nombre: d.nombre, url: d.url, dataUrl: d.dataUrl });
      }
    }
    for (const img of cli?.ficha?.landing?.imagenes || []) {
      if (img.tareaId === t.id && (img.url || img.dataUrl)) {
        push({ nombre: img.titulo, url: img.url, dataUrl: img.dataUrl });
      }
    }
    return out;
  }

  function videosDeTarea(t) {
    const out = [];
    const seen = new Set();
    const push = (v) => {
      const src = v?.url;
      if (!src || seen.has(src)) return;
      const isVideo =
        v.kind === 'video' ||
        String(v.mime || '').startsWith('video/') ||
        /\.(mp4|webm|mov)(\?|$)/i.test(src) ||
        v.origen === 'tarea-video';
      if (!isVideo) return;
      seen.add(src);
      out.push({ nombre: v.nombre || v.titulo || 'video.mp4', url: src, mime: v.mime });
    };
    for (const a of t?.sesionAgente?.archivosAdjuntos || []) push(a);
    const cli = (datos.clientes || []).find((x) => x.id === c.id);
    for (const d of cli?.ficha?.documentos || []) {
      if (d.tareaId === t.id) push(d);
    }
    return out;
  }

  function tareasConImagenes() {
    if (!datos?.tareas) return [];
    return datos.tareas
      .filter((t) => t.clienteId === c.id && imagenesDeTarea(t).length > 0)
      .sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')));
  }

  function hrefTareaOrganizador(t) {
    const params = new URLSearchParams({ disco: '1', vista: 'dia' });
    if (t.fecha) params.set('fecha', t.fecha);
    const num = t.numeroHistorico || '';
    const slug = slugClienteUrl();
    if (num) {
      params.set('tarea', `${slug}/${num}`);
    } else if (t.id) {
      params.set('tarea', t.id);
    }
    return `${pathOrganizador}?${params.toString()}`;
  }

  function htmlTareasConImagenes() {
    const lista = tareasConImagenes();
    if (!lista.length) return '';
    const cards = lista
      .map((t) => {
        const imgs = imagenesDeTarea(t);
        const thumbs = imgs
          .slice(0, 4)
          .map((img) => {
            const src = img.url || img.dataUrl || '';
            return `<a class="portal-tarea-img__thumb" href="${escapeHtml(src)}" target="_blank" rel="noopener" title="${escapeHtml(img.nombre || 'Ver')}">
                <img src="${escapeHtml(src)}" alt="${escapeHtml(img.nombre || 'Imagen')}" loading="lazy">
              </a>`;
          })
          .join('');
        const extra = imgs.length > 4 ? `<span class="portal-tarea-img__extra">+${imgs.length - 4}</span>` : '';
        const titulo = String(t.titulo || 'Tarea').replace(/^\[[^\]]+\]\s*/, '');
        return `<article class="portal-tarea-img__card">
          <div class="portal-tarea-img__meta">
            <h3 class="portal-tarea-img__titulo">${escapeHtml(titulo)}</h3>
            <p class="portal-tarea-img__fecha">${escapeHtml(t.fecha || '')} · ${imgs.length} imagen${imgs.length === 1 ? '' : 'es'}</p>
            <a class="portal-btn portal-btn--ghost" href="${hrefTareaOrganizador(t)}">Abrir tarea${t.numeroHistorico ? ' #' + escapeHtml(t.numeroHistorico) : ''}</a>
          </div>
          <div class="portal-tarea-img__thumbs">${thumbs}${extra}</div>
        </article>`;
      })
      .join('');

    return `<section class="portal-tarea-img ficha-seccion ficha-seccion--portal" data-portal-tareas-imagenes>
      <div class="ficha-seccion__headline">
        <h2 class="ficha-seccion__titulo">Tareas con imágenes</h2>
        <span class="ficha-seccion__estado">${lista.length} tarea${lista.length === 1 ? '' : 's'}</span>
      </div>
      <p class="portal-tarea-img__intro">Fondos y referencias guardados en tareas de este cliente. Haz clic en una miniatura para verla o abre la tarea.</p>
      <div class="portal-tarea-img__lista">${cards}</div>
    </section>`;
  }

  function htmlEcosistemaNewsletter() {
    if (c.slug !== 'ecr' || !datos?.tareas) return '';
    const madre =
      datos.tareas.find((t) => t.tipoEntregable === 'ecosistema' && t.clienteId === c.id) ||
      datos.tareas.find((t) => /ecosistema newsletter/i.test(t.titulo || '') && t.clienteId === c.id);
    if (!madre) return '';
    const hijos = datos.tareas
      .filter((t) => t.parentId === madre.id)
      .sort((a, b) => String(a.numeroHistorico || '').localeCompare(String(b.numeroHistorico || '')));

    const icono = (tipo) =>
      ({
        'copys-txt': '📝',
        'portada-imgs': '🖼️',
        carrusel: '🎠',
        video: '🎬',
      }[tipo] || '•');

    const cards = hijos
      .map((h) => {
        const titulo = String(h.titulo || '').replace(/^\[[^\]]+\]\s*/, '');
        const imgs = imagenesDeTarea(h);
        const thumb =
          imgs[0] && (imgs[0].url || imgs[0].dataUrl)
            ? `<img class="portal-eco__thumb" src="${escapeHtml(imgs[0].url || imgs[0].dataUrl)}" alt="" loading="lazy">`
            : `<span class="portal-eco__emoji">${icono(h.tipoEntregable)}</span>`;
        const extra =
          h.tipoEntregable === 'copys-txt' && h.entregableArchivo
            ? `<a class="portal-btn portal-btn--ghost" href="/${escapeHtml(String(h.entregableArchivo).replace(/^\/+/, ''))}" target="_blank" rel="noopener">Ver TXT</a>`
            : '';
        return `<article class="portal-eco__card">
          <div class="portal-eco__visual">${thumb}</div>
          <div class="portal-eco__body">
            <h3 class="portal-eco__titulo">${escapeHtml(titulo)}</h3>
            <p class="portal-eco__meta">#${escapeHtml(h.numeroHistorico || '?')} · ${escapeHtml(h.tipoEntregable || 'subtarea')}${h.completada ? ' · hecha' : ''}</p>
            <div class="portal-eco__actions">
              <a class="portal-btn" href="${hrefTareaOrganizador(h)}">Abrir subtarea</a>
              ${extra}
            </div>
          </div>
        </article>`;
      })
      .join('');

    return `<section class="portal-eco ficha-seccion ficha-seccion--portal" data-portal-ecosistema-nl>
      <div class="ficha-seccion__headline">
        <h2 class="ficha-seccion__titulo">Ecosistema NL 1 agosto</h2>
        <span class="ficha-seccion__estado">${hijos.length} subtareas</span>
      </div>
      <p class="portal-eco__intro">
        Tarea madre del newsletter LinkedIn (copys TXT, portada, carrusel y video).
        Entra a cada subtarea desde aquí o desde el organizador.
      </p>
      <p class="portal-eco__madre">
        <a class="portal-btn portal-btn--ghost" href="${hrefTareaOrganizador(madre)}">Abrir tarea madre #${escapeHtml(madre.numeroHistorico || '04')}</a>
      </p>
      <div class="portal-eco__grid">${cards}</div>
    </section>`;
  }

  /** Serie mensual TS: Contenidos 7/12 … 12/12 (madre + Prompt / Copys / Programar). */
  function htmlContenidosTsSerie() {
    if (c.slug !== 'trendseeker' || !datos?.tareas) return '';
    const madres = datos.tareas
      .filter(
        (t) =>
          t.clienteId === c.id &&
          t.tipoEntregable === 'ecosistema' &&
          !t.parentId &&
          (t.contenidoSerie || /Contenido \d+\/12/i.test(t.titulo || ''))
      )
      .sort((a, b) => Number(a.contenidoSerie || 0) - Number(b.contenidoSerie || 0));
    if (!madres.length) return '';

    const bloques = madres
      .map((madre) => {
        const hijos = datos.tareas
          .filter((t) => t.parentId === madre.id)
          .sort((a, b) => String(a.numeroHistorico || '').localeCompare(String(b.numeroHistorico || '')));
        const hechas = hijos.filter((h) => h.completada).length;
        const titulo = String(madre.titulo || '').replace(/^\[[^\]]+\]\s*/, '');
        const linkProd = madre.productoUrl
          ? `<a class="portal-btn portal-btn--ghost" href="${escapeHtml(madre.productoUrl)}" target="_blank" rel="noopener">Ver producto</a>`
          : '';
        const sub = hijos
          .map((h) => {
            const t = String(h.titulo || '').replace(/^\[[^\]]+\]\s*/, '');
            return `<li class="portal-ts-cont__sub${h.completada ? ' portal-ts-cont__sub--hecha' : ''}">
              <a href="${hrefTareaOrganizador(h)}">#${escapeHtml(h.numeroHistorico || '?')} · ${escapeHtml(t)}</a>
              ${h.completada ? '<span>hecha</span>' : ''}
            </li>`;
          })
          .join('');
        return `<article class="portal-ts-cont__card">
          <div class="portal-ts-cont__head">
            <h3 class="portal-ts-cont__titulo">${escapeHtml(titulo)}</h3>
            <p class="portal-ts-cont__meta">${escapeHtml(madre.fecha || '')} · ${hechas}/${hijos.length || 3} subtareas${madre.completada ? ' · madre hecha' : ''}</p>
          </div>
          <div class="portal-ts-cont__actions">
            <a class="portal-btn" href="${hrefTareaOrganizador(madre)}">Abrir madre #${escapeHtml(madre.numeroHistorico || '?')}</a>
            ${linkProd}
          </div>
          <ul class="portal-ts-cont__subs">${sub}</ul>
        </article>`;
      })
      .join('');

    return `<section class="portal-ts-cont ficha-seccion ficha-seccion--portal" data-portal-ts-contenidos>
      <div class="ficha-seccion__headline">
        <h2 class="ficha-seccion__titulo">Contenidos 7–12</h2>
        <span class="ficha-seccion__estado">${madres.length} madres</span>
      </div>
      <p class="portal-ts-cont__intro">
        Cada contenido = Prompt Gemini (video) + Copys del video + Programar.
        Con las 3 subtareas hechas se puede finalizar la madre.
      </p>
      <div class="portal-ts-cont__lista">${bloques}</div>
    </section>`;
  }

  /** Registro compacto: solo título tipo “#08 · C7/12 — Programar”; acordeón + ir a la tarea. */
  function htmlRegistroCliente() {
    if (!datos?.tareas) return '';
    const lista = datos.tareas
      .filter((t) => t.clienteId === c.id)
      .sort((a, b) => {
        const fd = String(b.fecha || '').localeCompare(String(a.fecha || ''));
        if (fd) return fd;
        return String(a.numeroHistorico || '').localeCompare(String(b.numeroHistorico || ''));
      });

    const rows = lista
      .map((t) => {
        const titulo = String(t.titulo || 'Tarea').replace(/^\[[^\]]+\]\s*/, '');
        const num = t.numeroHistorico || '?';
        const label = `#${num} · ${titulo}`;
        const estado = t.completada ? 'Hecha' : t.pendiente ? 'Pendiente' : 'Activa';
        const imgs = imagenesDeTarea(t);
        const videos = videosDeTarea(t);
        const archLinks = (() => {
          const map =
            (t.entregableArchivosCopy && typeof t.entregableArchivosCopy === 'object' && t.entregableArchivosCopy) ||
            (t.entregableArchivosPrompt && typeof t.entregableArchivosPrompt === 'object' && t.entregableArchivosPrompt) ||
            null;
          if (map && (map.A || map.B || map.C)) {
            return ['A', 'B', 'C']
              .filter((v) => map[v])
              .map(
                (v) =>
                  `<a class="portal-btn portal-btn--ghost" href="/${escapeHtml(String(map[v]).replace(/^\/+/, ''))}" target="_blank" rel="noopener">TXT ${v}</a>`
              )
              .join(' ');
          }
          if (t.entregableArchivo) {
            return `<a class="portal-btn portal-btn--ghost" href="/${escapeHtml(String(t.entregableArchivo).replace(/^\/+/, ''))}" target="_blank" rel="noopener">Ver entregable</a>`;
          }
          return '';
        })();
        const metaBits = [
          t.fecha || '',
          estado,
          t.tipoEntregable || '',
          imgs.length ? `${imgs.length} img` : '',
          videos.length ? `${videos.length} video` : '',
        ].filter(Boolean);
        const notas =
          t.notas
            ? `<p class="portal-reg__notas">${escapeHtml(String(t.notas).slice(0, 220))}${t.notas.length > 220 ? '…' : ''}</p>`
            : '';

        return `<details class="portal-reg__item" data-tarea-id="${escapeHtml(t.id)}">
          <summary class="portal-reg__summary">
            <span class="portal-reg__summary-text">${escapeHtml(label)}</span>
            <span class="portal-reg__chev" aria-hidden="true"></span>
          </summary>
          <div class="portal-reg__panel">
            <p class="portal-reg__meta">${escapeHtml(metaBits.join(' · '))}</p>
            ${notas}
            <div class="portal-reg__actions">
              <a class="portal-btn" href="${hrefTareaOrganizador(t)}">Ir a la tarea</a>
              ${archLinks}
            </div>
          </div>
        </details>`;
      })
      .join('');

    const vacio = !lista.length
      ? '<p class="portal-reg__vacio">Aún no hay tareas registradas para este cliente.</p>'
      : '';

    const tituloSec =
      c.slug === 'trendseeker' ? 'Registro Trendseeker' : 'Registro de tareas';

    return `<section class="portal-reg ficha-seccion ficha-seccion--portal" data-portal-registro-cliente>
      <div class="ficha-seccion__headline">
        <h2 class="ficha-seccion__titulo">${escapeHtml(tituloSec)}</h2>
        <span class="ficha-seccion__estado">${lista.length} tarea${lista.length === 1 ? '' : 's'}</span>
      </div>
      <p class="portal-reg__intro">Clic en una fila para ver el detalle. Usa «Ir a la tarea» para abrirla en el organizador.</p>
      <div class="portal-reg__lista" data-portal-registro-lista>${rows}</div>
      ${vacio}
    </section>`;
  }

  function imagenesSeccionHtml(landing) {
    if (typeof window.htmlLandingImagenesSeccion !== 'function') return '';
    return window.htmlLandingImagenesSeccion(landing, { claseExtra: 'ficha-seccion--portal' });
  }

  function initImagenes(rootEl, cli) {
    const landing = cli.ficha.landing;
    if (typeof window.initLandingImagenesGaleriaUI === 'function') {
      window.initLandingImagenesGaleriaUI(rootEl, {
        landing,
        onChange() { guardar(cli); },
        onError(msg) { toast(msg); }
      });
    }
    if (typeof window.initJMImagenesEditorUI === 'function') {
      window.initJMImagenesEditorUI(rootEl, {
        imagenesOverrides: landing.imagenesOverrides || {},
        imagenesOcultas: landing.imagenesOcultas || [],
        imagenesMeta: landing.imagenesMeta || {},
        onChange(state) {
          Object.assign(landing, state);
          guardar(cli);
        },
        onError(msg) { toast(msg); }
      });
    }
  }

  /** CTAs Impresoreando: Resumen 50/50 + Calculadora de productos. */
  function impPanelCtaHtml() {
    if (c.slug !== 'impresoreando') return '';
    return `<div class="portal-imp-cta-row" id="portal-imp-panel-cta">
      <a href="./panel/" class="portal-imp-panel-cta">Resumen 50/50</a>
      <a href="./panel/?tab=costos" class="portal-imp-panel-cta portal-imp-panel-cta--calc">Calculadora de productos</a>
      <a href="./catalogo/" class="portal-imp-panel-cta">Catálogo IG</a>
    </div>`;
  }

  function heroHtml(cfg, stats) {
    const tagline = cfg?.tagline || c.agente;
    const logoImp =
      c.slug === 'impresoreando'
        ? `<img class="portal-landing-hero__logo" src="./identidad/logo-impresoreando.png?v=imp-logo3" width="640" height="136" alt="impresoreando" />`
        : '';
    const titulo = logoImp
      ? `<h1 class="portal-landing-hero__titulo portal-landing-hero__titulo--logo">${logoImp}</h1>`
      : `<h1 class="portal-landing-hero__titulo">${escapeHtml(c.nombre)}</h1>`;
    return `<header class="portal-landing-hero">
      <span class="portal-badge">${escapeHtml(c.tipo)}</span>
      ${titulo}
      <p class="portal-landing-hero__tagline">${escapeHtml(tagline)}</p>
      <p class="portal-landing-hero__meta">${escapeHtml(c.abrev)} · ${escapeHtml(c.agente)}</p>
      ${stats.total ? `<div class="portal-landing-stats">
        <span class="portal-landing-stat"><strong>${stats.total}</strong> tareas</span>
        ${stats.pendientes ? `<span class="portal-landing-stat"><strong>${stats.pendientes}</strong> activas</span>` : ''}
      </div>` : ''}
    </header>`;
  }

  function entregablesHtml(cfg) {
    const items = cfg?.entregables || [];
    if (!items.length) return '';
    return `<section class="portal-landing-entregables">
      <h2>Entregables</h2>
      <ul class="portal-landing-chips">
        ${items
          .map((e) => {
            if (c.slug === 'impresoreando' && /panel financiero/i.test(e)) {
              return `<li class="portal-landing-chip portal-landing-chip--link">
                <a href="./panel/" class="portal-landing-chip__a">${escapeHtml(e)}</a>
              </li>`;
            }
            if (c.slug === 'impresoreando' && /costos de producci/i.test(e)) {
              return `<li class="portal-landing-chip portal-landing-chip--link">
                <a href="./panel/?tab=costos" class="portal-landing-chip__a">${escapeHtml(e)}</a>
              </li>`;
            }
            if (c.slug === 'impresoreando' && /cat[aá]logo/i.test(e)) {
              return `<li class="portal-landing-chip portal-landing-chip--link">
                <a href="./catalogo/" class="portal-landing-chip__a">${escapeHtml(e)}</a>
              </li>`;
            }
            return `<li class="portal-landing-chip">${escapeHtml(e)}</li>`;
          })
          .join('')}
      </ul>
    </section>`;
  }

  function seccionesHtml(cfg) {
    const secs = cfg?.secciones || [];
    if (!secs.length) {
      return `<section>
        <h2>Resumen</h2>
        <p>${escapeHtml(c.resumen)}</p>
      </section>`;
    }
    return secs
      .map((s) => {
        const esPanelImp =
          c.slug === 'impresoreando' && /panel socios/i.test(String(s.titulo || ''));
        const esCalcImp =
          c.slug === 'impresoreando' && /producci[oó]n/i.test(String(s.titulo || ''));
        const esCatImp =
          c.slug === 'impresoreando' && /cat[aá]logo/i.test(String(s.titulo || ''));
        return `<section${esPanelImp || esCalcImp || esCatImp ? ' class="portal-imp-panel-sec"' : ''}>
      <h2>${escapeHtml(s.titulo)}</h2>
      <p>${escapeHtml(s.texto)}</p>
      ${esPanelImp ? `<p class="portal-imp-panel-sec__action"><a class="portal-btn" href="./panel/">Resumen 50/50 →</a></p>` : ''}
      ${esCalcImp ? `<p class="portal-imp-panel-sec__action"><a class="portal-btn" href="./panel/?tab=costos">Calculadora de productos →</a></p>` : ''}
      ${esCatImp ? `<p class="portal-imp-panel-sec__action"><a class="portal-btn" href="./catalogo/">Ver catálogo 1080×1350 →</a></p>` : ''}
    </section>`;
      })
      .join('');
  }

  function render() {
    const cli = asegurarClienteEnDatos();
    const landingCfg = c.landing || {};
    const landing = cli.ficha.landing;
    const stats = contarTareasCliente();
    const proxNum = siguienteNumeroHistorico(c.id);
    const abrev = cli.abrev || c.abrev || '';

    document.title = `${c.nombre} · Landing`;
    if (typeof window.aplicarTemaPortal === 'function') {
      window.aplicarTemaPortal(c.color);
    }

    const proyectosHtml = c.proyectos?.length
      ? `<section>
          <h2>Proyectos</h2>
          <p>Cada proyecto tiene su propia landing e identidad visual.</p>
          <div class="portal-grid portal-grid--proyectos">
            ${c.proyectos.map((p) => `
              <a href="${hrefProyecto(p.archivo)}" class="portal-card"
                 style="--card-border:${p.color.border};--card-bg:${p.color.bg};--card-text:${p.color.text}">
                <div class="portal-card__tipo">${escapeHtml(p.codigo)}</div>
                <h2 class="portal-card__nombre">${escapeHtml(p.nombre)}</h2>
                <div class="portal-card__abrev">${escapeHtml(p.resumen)}</div>
              </a>`).join('')}
          </div>
          ${c.slug === 'herramientas' ? (() => {
            const tendHref = hrefProyecto('Herramientas/Tendencias');
            return `<p style="margin-top:1rem">
              <a href="${tendHref}" class="portal-btn portal-btn--ghost" style="display:inline-block;text-decoration:none;margin-right:0.5rem">
                Ver brief del proyecto
              </a>
              <a href="${tendHref}?vista=buscador" class="portal-btn tend-btn-principal" style="display:inline-block;text-decoration:none">
                Abrir buscador de tendencias →
              </a>
              <span style="display:block;margin-top:0.5rem;font-size:0.82rem;color:var(--muted)">
                Brief del proyecto o buscador con filtros por fecha y red social
              </span>
            </p>`;
          })() : ''}
        </section>`
      : '';

    const wireframesHtml =
      c.slug === 'joyas-mercury' && typeof window.jmHtmlWireframes === 'function'
        ? window.jmHtmlWireframes({ claseExtra: 'ficha-seccion--portal' })
        : '';

    const mkofLandingHtml =
      c.slug === 'mkof' && typeof window.mkofHtmlLandingSections === 'function'
        ? window.mkofHtmlLandingSections()
        : '';

    const ecrPortadaHtml =
      c.slug === 'ecr' && typeof window.ecrHtmlPortadaPrompt === 'function'
        ? window.ecrHtmlPortadaPrompt()
        : '';

    const ecrRutasHtml = c.slug === 'ecr'
      ? `<section class="ecr-rutas ficha-seccion ficha-seccion--portal">
          <div class="ficha-seccion__headline">
            <h2 class="ficha-seccion__titulo">Rutas de aprendizaje</h2>
            <span class="ficha-seccion__estado">Finalizado</span>
          </div>
          <p>Modal por sector listo (Retail, Financiero, Salud, Tecnología, Gestión, Logística, Datos + In Company). Textos y links validados; HTML para Elementor en el archivo del entregable.</p>
          <p style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.75rem">
            <a class="portal-btn" href="capacitaciones/preview-modal.html" target="_blank" rel="noopener">Abrir preview del modal</a>
            <a class="portal-btn portal-btn--ghost" href="capacitaciones/REVISION-TEXTOS-Y-LINKS-MODALES.txt" target="_blank" rel="noopener">Ver textos (.txt)</a>
            <a class="portal-btn portal-btn--ghost" href="capacitaciones/modal-ruta-sectores.html" target="_blank" rel="noopener">HTML Elementor</a>
          </p>
        </section>`
      : '';

    const imagenesHtml = imagenesSeccionHtml(landing);

    const panelNuevaTarea = mostrarNuevaTarea
      ? `<section class="portal-nueva-tarea ficha-seccion ficha-seccion--portal" data-portal-nueva-tarea>
          <div class="ficha-seccion__headline">
            <h2 class="ficha-seccion__titulo">Nueva tarea</h2>
            <span class="ficha-seccion__estado">${escapeHtml(abrev)} · #${proxNum}</span>
          </div>
          <p class="portal-nueva-tarea__meta">
            Se hereda <strong>${escapeHtml(cli.nombre || c.nombre)}</strong>
            (color organizador: <code>${escapeHtml(cli.color || colorOrgCliente())}</code>).
            Al guardar se publica en el organizador.
          </p>
          <form class="portal-nueva-tarea__form" id="portal-form-nueva-tarea">
            <label class="portal-nueva-tarea__label">Título
              <input class="portal-nueva-tarea__input" name="titulo" required maxlength="160"
                placeholder="Ej: Crear copys newsletter" autocomplete="off">
            </label>
            <div class="portal-nueva-tarea__grid">
              <label class="portal-nueva-tarea__label">Fecha
                <input class="portal-nueva-tarea__input" type="date" name="fecha" required value="${hoyISO()}">
              </label>
              <label class="portal-nueva-tarea__label">Inicio
                <input class="portal-nueva-tarea__input" type="time" name="horaInicio" value="09:00" required>
              </label>
              <label class="portal-nueva-tarea__label">Fin
                <input class="portal-nueva-tarea__input" type="time" name="horaFin" value="11:00" required>
              </label>
              <label class="portal-nueva-tarea__label">Prioridad
                <select class="portal-nueva-tarea__input" name="prioridad">
                  <option value="alta">Alta</option>
                  <option value="media" selected>Media</option>
                  <option value="baja">Baja</option>
                </select>
              </label>
            </div>
            <label class="portal-nueva-tarea__label">Notas
              <textarea class="portal-nueva-tarea__input portal-nueva-tarea__textarea" name="notas" rows="3"
                placeholder="Detalle breve (opcional)"></textarea>
            </label>
            <div class="portal-nueva-tarea__actions">
              <button type="submit" class="portal-btn">Guardar y publicar</button>
              <button type="button" class="portal-btn portal-btn--ghost" id="portal-btn-cancelar-tarea">Cancelar</button>
            </div>
          </form>
        </section>`
      : '';

    const toolbarPanelBtn =
      c.slug === 'impresoreando'
        ? `<a href="./panel/" class="portal-btn portal-btn--imp-panel">Resumen 50/50</a>
           <a href="./panel/?tab=costos" class="portal-btn portal-btn--imp-calc">Calculadora</a>
           <a href="./catalogo/" class="portal-btn">Catálogo IG</a>`
        : '';

    root.innerHTML = `
      <article class="portal-cliente portal-cliente--landing${modoEdicion ? ' portal-cliente--edicion' : ''}"
        style="--card-border:${c.color.border};--card-bg:${c.color.bg};--card-text:${c.color.text}">
        ${impPanelCtaHtml()}
        <div class="portal-cliente__toolbar">
          ${toolbarPanelBtn}
          <a href="${pathListado}" class="portal-btn portal-btn--ghost">← Clientes</a>
          <a href="${pathOrganizador}?disco=1" class="portal-btn portal-btn--ghost">Organizador</a>
          <button type="button" class="portal-btn portal-btn--nueva-tarea${mostrarNuevaTarea ? ' portal-btn--active' : ''}" id="portal-btn-nueva-tarea">
            Nueva tarea
          </button>
          <button type="button" class="portal-btn${modoEdicion ? ' portal-btn--active' : ''}" id="portal-btn-editar">
            ${modoEdicion ? 'Listo' : 'Editar landing'}
          </button>
        </div>
        ${panelNuevaTarea}
        ${modoEdicion ? '<p class="portal-cliente__hint landing-img__solo-edicion">Agrega imágenes, mockups o referencias. Se guardan en tu organizador local.</p>' : ''}
        ${heroHtml(landingCfg, stats)}
        ${entregablesHtml(landingCfg)}
        ${seccionesHtml(landingCfg)}
        ${ecrPortadaHtml}
        ${ecrRutasHtml}
        ${htmlEcosistemaNewsletter()}
        ${htmlContenidosTsSerie()}
        ${htmlRegistroCliente()}
        ${htmlTareasConImagenes()}
        ${imagenesHtml}
        ${mkofLandingHtml}
        ${wireframesHtml}
        ${proyectosHtml}
        <section>
          <h2>Enlaces</h2>
          <ul>
            <li><a href="${pathOrganizador}?disco=1">Abrir organizador principal</a></li>
            <li><a href="${pathOrganizador}?disco=1#clientes">Ficha completa en Clientes</a></li>
            <li><a href="${pathListado}">Volver al listado de clientes</a></li>
          </ul>
        </section>
        <a href="${pathOrganizador}?disco=1" class="portal-app-link">Ir al organizador →</a>
      </article>`;

    document.getElementById('portal-btn-editar')?.addEventListener('click', () => {
      modoEdicion = !modoEdicion;
      render();
    });

    document.getElementById('portal-btn-nueva-tarea')?.addEventListener('click', () => {
      mostrarNuevaTarea = !mostrarNuevaTarea;
      render();
    });

    document.getElementById('portal-btn-cancelar-tarea')?.addEventListener('click', () => {
      mostrarNuevaTarea = false;
      render();
    });

    document.getElementById('portal-form-nueva-tarea')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const tituloRaw = String(fd.get('titulo') || '').trim();
      if (!tituloRaw) {
        toast('Indica un título');
        return;
      }
      const tarea = crearTareaDesdePortal({
        titulo: tituloRaw,
        fecha: String(fd.get('fecha') || hoyISO()),
        horaInicio: String(fd.get('horaInicio') || '09:00'),
        horaFin: String(fd.get('horaFin') || '11:00'),
        notas: String(fd.get('notas') || ''),
        prioridad: String(fd.get('prioridad') || 'media'),
      });
      mostrarNuevaTarea = false;
      render();
      const params = new URLSearchParams({ disco: '1', vista: 'dia' });
      if (tarea.fecha) params.set('fecha', tarea.fecha);
      if (tarea.numeroHistorico) {
        params.set('tarea', `${slugClienteUrl()}/${tarea.numeroHistorico}`);
      }
      const url = `${pathOrganizador}?${params.toString()}`;
      toast(`Publicada · ver en organizador (#${tarea.numeroHistorico})`);
      // Enlace rápido: no navegar automáticamente; dejar toast. Opcional abrir:
      const link = document.createElement('a');
      link.href = url;
      link.className = 'portal-btn';
      link.textContent = `Abrir tarea #${tarea.numeroHistorico} en organizador`;
      link.style.marginTop = '0.5rem';
      const toolbar = root.querySelector('.portal-cliente__toolbar');
      if (toolbar && !root.querySelector('[data-portal-link-tarea]')) {
        const wrap = document.createElement('p');
        wrap.dataset.portalLinkTarea = '1';
        wrap.style.margin = '0.5rem 0 0';
        wrap.appendChild(link);
        toolbar.after(wrap);
      }
    });

    if (typeof window.initJMWireframesUI === 'function') window.initJMWireframesUI(root);
    if (typeof window.initEcrPortadaPromptUI === 'function') {
      window.initEcrPortadaPromptUI(root, {
        onCopy(ok) { toast(ok ? 'Prompt copiado' : 'No se pudo copiar'); },
        onError(msg) { toast(msg); },
        onGenerate() { toast('Prompt generado y guardado'); },
        onSaved(res) {
          toast(res && res.remoto ? 'Portada guardada en el proyecto' : 'Portada guardada en este navegador');
        }
      });
    }
    initImagenes(root, cli);
  }

  async function boot() {
    const wait =
      c.slug === 'joyas-mercury' && window.jmLandingsCarruselReady
        ? window.jmLandingsCarruselReady
        : Promise.resolve();
    await wait;
    try {
      await cargarDatos();
    } catch (e) {
      console.warn(e);
      cargarDesdeLocalStorage();
    }
    render();
  }

  boot();
})();
