(function () {
  const CLI_ID = 'cli-joyas-mercury';
  const STORAGE_KEY = 'organizacion_v2';
  const root = document.getElementById('jm-landing-root');
  if (!root) return;

  const colores = { border: '#e8b8c8', bg: '#fdf0f4', text: '#9a5a6e' };
  const AGENTE_JM = { emoji: '💎', nombre: 'Agente Joyas Mercury' };
  const SKILL_JM = { nombre: 'Dev WooCommerce JM' };

  let datos = null;
  let landing = null;
  let modoEdicion = false;

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function id() {
    return 'jm-' + Math.random().toString(36).slice(2, 10);
  }

  function toast(msg) {
    let el = document.getElementById('jm-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'jm-toast';
      el.className = 'jm-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('jm-toast--visible');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('jm-toast--visible'), 2400);
  }

  function asegurarLandingJM(cli) {
    const v = cli.ficha.landingVersion || 0;
    const backupV = window.JM_BACKUP_FICHA?.version || 0;
    if (v < backupV) {
      cli.ficha.landing.objetivosEspecificos = [...(window.JM_OBJETIVOS?.especificos || [])];
      cli.ficha.landing.todos = (window.JM_TODO_SEED || []).map((t) => ({ ...t, completada: false, comentario: '' }));
      cli.ficha.landingVersion = backupV;
    }
    if (!Array.isArray(cli.ficha.landing.todos) || !cli.ficha.landing.todos.length) {
      cli.ficha.landing.todos = (window.JM_TODO_SEED || []).map((t) => ({ ...t, comentario: t.comentario || '' }));
    }
  }

  function menuObjetivoHtml() {
    const menu = window.JM_MENU_OBJETIVO;
    if (!menu?.inicio) return '';
    const hijosHtml = (menu.inicio.hijos || []).map((item) => {
      if (item.colecciones) {
        const cols = item.colecciones.map((col) => {
          const cats = (col.categorias || [])
            .map((c) => `<li class="jm-menu__cat">${escapeHtml(c)}</li>`)
            .join('');
          return `<li class="jm-menu__coleccion"><span class="jm-menu__coleccion-nombre">${escapeHtml(col.nombre)}</span>
            <ul class="jm-menu__categorias">${cats}</ul></li>`;
        }).join('');
        return `<li class="jm-menu__item"><span>Colecciones</span><ul class="jm-menu__colecciones">${cols}</ul></li>`;
      }
      return `<li class="jm-menu__item"><span>${escapeHtml(item.titulo)}</span></li>`;
    }).join('');
    return `<div class="jm-menu">
      <p class="jm-menu__intro">Estructura acordada para Fase 2 · <strong>Paso 4</strong></p>
      <ul class="jm-menu__arbol">
        <li class="jm-menu__item jm-menu__item--raiz"><strong>${escapeHtml(menu.titulo || 'Menú')}</strong>
          <ul class="jm-menu__nivel">
            <li class="jm-menu__item jm-menu__item--raiz"><strong>${escapeHtml(menu.inicio.titulo)}</strong>
              <ul class="jm-menu__nivel">${hijosHtml}</ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>`;
  }

  function mapaNavegacionHtml() {
    const rutas = window.JM_MAPA_NAVEGACION || [];
    if (!rutas.length) return '';
    const filas = rutas.map((r) =>
      `<tr class="jm-mapa__fila jm-mapa__fila--n${r.nivel}">
        <td class="jm-mapa__ruta">${escapeHtml(r.ruta)}</td>
        <td class="jm-mapa__detalle">${escapeHtml(r.detalle || '')}</td>
      </tr>`
    ).join('');
    return `<div class="jm-mapa">
      <p class="jm-mapa__intro">Recorridos de usuario derivados del menú · <strong>Paso 5</strong></p>
      <table class="jm-mapa__tabla">
        <thead><tr><th>Ruta</th><th>Qué es</th></tr></thead>
        <tbody>${filas}</tbody>
      </table>
      <p class="jm-mapa__total">${rutas.length} rutas · 3 colecciones × 5 categorías = 15 combinaciones + Novedades + Últimas unidades + Carrito</p>
    </div>`;
  }

  function cargarDatos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) datos = JSON.parse(raw);
    } catch {
      datos = null;
    }
    if (!datos || !Array.isArray(datos.clientes)) {
      datos = { clientes: [], tareas: [], version: 2 };
    }
    if (!Array.isArray(datos.tareas)) datos.tareas = [];
    if (typeof window.jmAsegurarDatosMinimos === 'function') window.jmAsegurarDatosMinimos(datos);
    let cli = datos.clientes.find((c) => c.id === CLI_ID);
    if (cli && typeof window.jmMigrarLandingJM === 'function' && window.jmMigrarLandingJM(cli)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
        if (typeof window.persistOrganizacionToDisk === 'function') {
          window.persistOrganizacionToDisk(datos);
        }
      } catch {
        /* ignore */
      }
    }
    cli = datos.clientes.find((c) => c.id === CLI_ID);
    if (!cli) {
      const seed = typeof CLIENTES_PORTAL !== 'undefined'
        ? CLIENTES_PORTAL.find((c) => c.id === CLI_ID)
        : null;
      cli = {
        id: CLI_ID,
        nombre: seed?.nombre || 'Joyas Mercury',
        abrev: 'JM',
        tipo: 'Freelance',
        color: 'rosa',
        metas: window.JM_BACKUP_FICHA?.metas || '',
        manualMarca: { texto: window.JM_MANUAL_MARCA || '' },
        ficha: {
          contacto: window.JM_BACKUP_FICHA?.contacto || '',
          links: window.JM_BACKUP_FICHA?.links || '',
          notas: window.JM_BACKUP_FICHA?.notas || '',
          seccionesExtra: [...(window.JM_BACKUP_FICHA?.seccionesExtra || [])],
          documentos: [...(window.JM_BACKUP_FICHA?.documentos || [])]
        }
      };
      datos.clientes.push(cli);
    }
    if (!cli.ficha) cli.ficha = { documentos: [], seccionesExtra: [] };
    if (!cli.ficha.landing) {
      cli.ficha.landing = {
        identidadResumen: window.JM_IDENTIDAD_RESUMEN || '',
        identidadExpandida: (cli.manualMarca?.texto || window.JM_MANUAL_MARCA || '').trim(),
        objetivoGeneral: window.JM_OBJETIVOS?.general || '',
        objetivosEspecificos: [...(window.JM_OBJETIVOS?.especificos || [])],
        todos: (window.JM_TODO_SEED || []).map((t) => ({ ...t }))
      };
    }
    asegurarLandingJM(cli);
    if (typeof window.asegurarWireframesJM === 'function') window.asegurarWireframesJM(cli);
    landing = cli.ficha.landing;
    asegurarSeccionesLanding();
    if (typeof window.jmAplicarProgresoChecklist === 'function') window.jmAplicarProgresoChecklist(datos);
    if (typeof window.jmFusionarTodosExtra === 'function') window.jmFusionarTodosExtra(datos);
    if (typeof window.jmSyncLandingDesdeTareas === 'function') window.jmSyncLandingDesdeTareas(datos);
    return cli;
  }

  function guardar() {
    try {
      if (typeof window.jmSyncTareasDesdeLanding === 'function') {
        window.jmSyncTareasDesdeLanding(datos);
      }
      const cli = datos.clientes.find((c) => c.id === CLI_ID);
      if (cli?.ficha) cli.ficha.actualizado = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
      if (typeof window.persistOrganizacionToDisk === 'function') {
        window.persistOrganizacionToDisk(datos);
      }
      toast('Cambios guardados');
    } catch (e) {
      toast('No se pudo guardar');
      console.error(e);
    }
  }

  function documentosHtml(cli) {
    const docs = cli.ficha?.documentos || [];
    if (!docs.length) return '<p class="jm-docs__nota">Sin documentos aún.</p>';
    return `<ul class="jm-docs">${docs
      .map(
        (d) =>
          `<li><span class="jm-docs__nombre">${escapeHtml(d.nombre)}</span>` +
          (d.notasAnalisis ? `<br><span class="jm-docs__nota">${escapeHtml(d.notasAnalisis)}</span>` : '') +
          '</li>'
      )
      .join('')}</ul>`;
  }

  function ganttHtml() {
    const fases = window.JM_GANTT_FASES || [];
    const totalDias = fases.length ? Math.max(...fases.map((f) => f.inicio + f.dias)) : 25;
    const filas = fases
      .map((f) => {
        const left = (f.inicio / totalDias) * 100;
        const width = (f.dias / totalDias) * 100;
        return `<div class="jm-gantt__fila-label">F${f.id} · ${escapeHtml(f.nombre)}</div>
          <div class="jm-gantt__track" title="${f.dias} días · ${escapeHtml(f.monto)}">
            <div class="jm-gantt__bar jm-gantt__bar--f${f.id}" style="left:${left}%;width:${width}%"></div>
          </div>`;
      })
      .join('');
    return `<div class="jm-gantt">
      <div class="jm-gantt__leyenda">22–25 días hábiles · $200.000 CLP · herramientas gratuitas</div>
      <div class="jm-gantt__grid">${filas}</div>
      <div class="jm-gantt__escala"><span>Día 0</span><span>Día ${totalDias}</span></div>
      <p class="jm-gantt__total">7 fases: Menú · Categorías · Filtros · Destacados · Legales · Carrito · Pruebas/entrega</p>
    </div>`;
  }

  function todosHtml() {
    const items = landing.todos || [];
    const hechos = items.filter((t) => t.completada).length;
    const lista = items
      .map(
        (t) =>
          `<li class="jm-todo__item${t.completada ? ' jm-todo__item--done' : ''}" data-todo-id="${escapeHtml(t.id)}">
            <input type="checkbox" class="jm-todo-check jm-solo-vista" ${t.completada ? 'checked' : ''} aria-label="Marcar tarea">
            <span class="jm-todo__texto">
              ${escapeHtml(t.titulo)}
              <span class="jm-todo__meta">Día ${escapeHtml(t.dias || '—')} · Fase ${t.fase || '—'}</span>
              ${t.comentario ? `<span class="jm-todo__comentario">${escapeHtml(t.comentario)}</span>` : ''}
            </span>
            <button type="button" class="jm-todo__eliminar jm-solo-edicion" data-eliminar-todo="${escapeHtml(t.id)}" title="Eliminar">×</button>
          </li>`
      )
      .join('');
    return `<p class="jm-todo__intro">20 tareas · 1 por día desde el 23 jun 2026 · sincronizadas con el calendario del organizador (color rosa JM). Marca lo que avances aquí o en el calendario.</p>
      <ul class="jm-todo__lista">${lista}</ul>
      <p class="jm-todo__progreso">${hechos} / ${items.length} completadas</p>
      <div class="jm-todo__add jm-solo-edicion">
        <input type="text" id="jm-todo-nuevo" placeholder="Nueva tarea (1 día)…">
        <button type="button" class="jm-btn" id="jm-todo-agregar">Agregar</button>
      </div>`;
  }

  function objetivosHtml() {
    const esp = landing.objetivosEspecificos || [];
    const lista = esp.map((o) => `<li>${escapeHtml(o)}</li>`).join('');
    return `<details class="jm-objetivos" open>
        <summary>Objetivos · Fase 2</summary>
        <div class="jm-objetivos__contenido">
          <p class="jm-objetivos__general jm-solo-vista"><strong>Objetivo general:</strong> ${escapeHtml(landing.objetivoGeneral)}</p>
          <div class="jm-solo-edicion">
            <label><strong>Objetivo general</strong></label>
            <textarea class="jm-field jm-field--area" id="jm-edit-obj-general">${escapeHtml(landing.objetivoGeneral)}</textarea>
            <label><strong>Objetivos específicos (uno por línea)</strong></label>
            <textarea class="jm-field jm-field--large" id="jm-edit-obj-especificos">${escapeHtml(esp.join('\n'))}</textarea>
          </div>
          <p class="jm-solo-vista" style="margin:0.5rem 0 0.35rem;font-weight:600;color:var(--jm-text)">Objetivos específicos:</p>
          <ol class="jm-objetivos__lista jm-solo-vista">${lista}</ol>
        </div>
      </details>`;
  }

  function identidadHtml(cli) {
    return `<p class="jm-identidad__resumen jm-solo-vista">${escapeHtml(landing.identidadResumen)}</p>
      <div class="jm-solo-edicion">
        <label><strong>Resumen identidad (visible siempre)</strong></label>
        <textarea class="jm-field jm-field--area" id="jm-edit-identidad-resumen">${escapeHtml(landing.identidadResumen)}</textarea>
        <label><strong>Detalle identidad + manual</strong></label>
        <textarea class="jm-field jm-field--large" id="jm-edit-identidad-expandida">${escapeHtml(landing.identidadExpandida)}</textarea>
      </div>
      <button type="button" class="jm-identidad__toggle jm-solo-vista" id="jm-identidad-toggle" aria-expanded="false">
        Ver identidad completa y documentos ↓
      </button>
      <div class="jm-identidad__detalle" id="jm-identidad-detalle" hidden>
        <div class="jm-identidad__manual jm-solo-vista">${escapeHtml(landing.identidadExpandida)}</div>
        <h3 style="margin:1rem 0 0.5rem;font-size:0.95rem;color:var(--jm-text)">Documentos relacionados</h3>
        ${documentosHtml(cli)}
      </div>`;
  }

  const JM_SECCIONES = {
    wireframes: { titulo: 'Wireframes · Desktop', etiqueta: 'los wireframes desktop' },
    identidad: { titulo: 'Identidad de marca', etiqueta: 'la identidad de marca' },
    objetivos: { titulo: 'Objetivos · Fase 2', etiqueta: 'los objetivos' },
    menu: { titulo: 'Menú objetivo · Paso 4', etiqueta: 'el menú objetivo' },
    mapa: { titulo: 'Mapa de navegación · Paso 5', etiqueta: 'el mapa de navegación' },
    gantt: { titulo: 'Carta Gantt · tiempos Fase 2', etiqueta: 'la carta Gantt' },
    todo: { titulo: 'Tareas · checklist (20 días)', etiqueta: 'el checklist de tareas' }
  };

  let seccionPendienteEliminar = null;

  function asegurarSeccionesLanding() {
    if (!landing) return;
    if (!Array.isArray(landing.seccionesEliminadas)) landing.seccionesEliminadas = [];
  }

  function seccionVisible(id) {
    asegurarSeccionesLanding();
    return !landing.seccionesEliminadas.includes(id);
  }

  function toolbarSeccionHtml(id) {
    return `<div class="jm-seccion__acciones" role="group" aria-label="Acciones de sección">
      <button type="button" class="jm-btn jm-btn--seccion jm-btn--sm" data-jm-seccion-editar="${escapeHtml(id)}">Editar</button>
      <button type="button" class="jm-btn jm-btn--seccion jm-btn--sm jm-btn--seccion-danger" data-jm-seccion-eliminar="${escapeHtml(id)}">Eliminar</button>
    </div>`;
  }

  function htmlModalEliminar() {
    return `<div id="jm-modal-eliminar" class="jm-modal" hidden aria-hidden="true">
      <div class="jm-modal__backdrop" data-jm-modal-cerrar></div>
      <div class="jm-modal__panel" role="dialog" aria-labelledby="jm-modal-eliminar-titulo" aria-modal="true">
        <h3 id="jm-modal-eliminar-titulo" class="jm-modal__titulo">Eliminar sección</h3>
        <p id="jm-modal-eliminar-msg" class="jm-modal__texto"></p>
        <p class="jm-modal__aviso">Se borrará el contenido guardado de esta sección en tu organizador.</p>
        <div class="jm-modal__acciones">
          <button type="button" class="jm-btn jm-btn--ghost" data-jm-modal-cerrar>Cancelar</button>
          <button type="button" class="jm-btn jm-btn--danger" id="jm-modal-confirmar-eliminar">Eliminar</button>
        </div>
      </div>
    </div>`;
  }

  function limpiarDatosSeccion(id) {
    if (id === 'wireframes') {
      const pref = 'jm:interfaces/referencia-landings';
      if (landing.imagenesOverrides) {
        Object.keys(landing.imagenesOverrides).forEach((k) => {
          if (k.startsWith(pref)) delete landing.imagenesOverrides[k];
        });
      }
      if (Array.isArray(landing.imagenesOcultas)) {
        landing.imagenesOcultas = landing.imagenesOcultas.filter((k) => !k.startsWith(pref));
      }
      if (landing.imagenesMeta) {
        Object.keys(landing.imagenesMeta).forEach((k) => {
          if (k.startsWith(pref)) delete landing.imagenesMeta[k];
        });
      }
    } else if (id === 'identidad') {
      landing.identidadResumen = '';
      landing.identidadExpandida = '';
      const cli = datos.clientes.find((c) => c.id === CLI_ID);
      if (cli?.manualMarca) cli.manualMarca.texto = '';
    } else if (id === 'objetivos') {
      landing.objetivoGeneral = '';
      landing.objetivosEspecificos = [];
    } else if (id === 'todo') {
      landing.todos = [];
      if (Array.isArray(datos.tareas)) {
        datos.tareas = datos.tareas.filter(
          (t) => !(t.clienteId === CLI_ID && (t.jmTodoId || /^tarea-jm-f2-/.test(t.id || '')))
        );
      }
    }
  }

  function eliminarSeccion(cli, id) {
    if (!JM_SECCIONES[id] || !seccionVisible(id)) return;
    asegurarSeccionesLanding();
    limpiarDatosSeccion(id);
    landing.seccionesEliminadas.push(id);
    cli.ficha.actualizado = new Date().toISOString();
    guardar();
    render();
    toast('Sección eliminada');
  }

  function abrirModalEliminar(id) {
    const meta = JM_SECCIONES[id];
    if (!meta) return;
    seccionPendienteEliminar = id;
    const modal = document.getElementById('jm-modal-eliminar');
    const msg = document.getElementById('jm-modal-eliminar-msg');
    if (msg) {
      msg.textContent = `¿Eliminar ${meta.etiqueta}? Esta acción no se puede deshacer.`;
    }
    if (modal) {
      modal.hidden = false;
      modal.removeAttribute('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('jm-modal-abierto');
    }
  }

  function cerrarModalEliminar() {
    seccionPendienteEliminar = null;
    const modal = document.getElementById('jm-modal-eliminar');
    if (modal) {
      modal.hidden = true;
      modal.setAttribute('hidden', '');
      modal.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('jm-modal-abierto');
  }

  function editarSeccion(id) {
    if (!modoEdicion) {
      modoEdicion = true;
      render();
    }
    const el = root.querySelector(`[data-jm-seccion="${id}"], #jm-seccion-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const focusable = el?.querySelector('textarea, input, button, [tabindex]');
    if (focusable && typeof focusable.focus === 'function') {
      setTimeout(() => focusable.focus(), 300);
    }
  }

  function blockSeccion(id, titulo, bodyHtml) {
    if (!seccionVisible(id)) return '';
    return `<section class="jm-block" id="jm-seccion-${id}" data-jm-seccion="${id}">
      <div class="jm-block__head">
        <h2>${escapeHtml(titulo)}</h2>
        ${toolbarSeccionHtml(id)}
      </div>
      <div class="jm-block__body">${bodyHtml}</div>
    </section>`;
  }

  function wireframesEmbebidosHtml() {
    if (!seccionVisible('wireframes')) return '';
    if (typeof window.jmHtmlWireframes !== 'function') return '';
    return window.jmHtmlWireframes({
      claseExtra: 'ficha-seccion--portal',
      accionesHtml: toolbarSeccionHtml('wireframes')
    });
  }

  function fechaGuardadoTexto(cli) {
    const raw = cli.ficha?.actualizado;
    if (!raw) return '';
    const d = new Date(raw.includes('T') ? raw : raw + 'T12:00:00');
    if (Number.isNaN(d.getTime())) return '';
    return 'Guardada · ' + d.toLocaleString('es-CL', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  function wireframeMenuHtml() {
    if (typeof window.jmHtmlWireframeMenu === 'function') return window.jmHtmlWireframeMenu('');
    return '<a href="wireframes.html" class="jm-btn jm-btn--ghost">Wireframe</a>';
  }

  function render() {
    const cli = cargarDatos();
    const wireframes = wireframesEmbebidosHtml();
    const guardadoTxt = fechaGuardadoTexto(cli);
    root.innerHTML = `
      <div class="jm-landing jm-landing--ficha${modoEdicion ? ' jm-landing--edicion' : ''}" style="--jm-border:${colores.border};--jm-bg:${colores.bg};--jm-text:${colores.text}">
        <header class="jm-ficha-top">
          <a href="../" class="jm-btn jm-btn--ghost">← Volver</a>
          <span class="jm-ficha-top__tipo">Freelance · JM</span>
          <div class="jm-landing__toolbar">
            ${wireframeMenuHtml()}
            <a href="../../../" class="jm-btn jm-btn--celeste" title="Ir al calendario mensual">Organizador</a>
            <button type="button" class="jm-btn${modoEdicion ? ' jm-btn--active' : ''}" id="jm-btn-editar">
              ${modoEdicion ? 'Guardar datos' : 'Editar datos'}
            </button>
          </div>
        </header>
        ${modoEdicion ? '<p class="jm-landing__hint-edicion jm-solo-edicion">Imágenes cargadas: agregar, reemplazar, editar título/notas o borrar en los wireframes desktop.</p>' : ''}

        <article class="ficha-doc ficha-doc--jm ficha-doc--wireframes jm-ficha-doc${modoEdicion ? ' ficha-doc--edicion' : ''}">
          <header class="ficha-doc__encabezado" style="border-bottom-color:${colores.border}">
            <div class="ficha-doc__marca" style="background:${colores.border}"></div>
            <div class="ficha-doc__head-grid">
              <div>
                <p class="ficha-doc__tipo">Freelance</p>
                <h1 class="ficha-doc__titulo">${escapeHtml(cli.nombre)}</h1>
                <p class="ficha-doc__subtitulo">joyasmercury.cl · diagramación del sitio</p>
              </div>
              <div class="ficha-doc__meta-block">
                <p><span class="ficha-doc__meta-label">Agente</span> ${AGENTE_JM.emoji} ${escapeHtml(AGENTE_JM.nombre)}</p>
                <p><span class="ficha-doc__meta-label">Skill</span> ${escapeHtml(SKILL_JM.nombre)}</p>
              </div>
            </div>
          </header>

          ${wireframes}

          ${blockSeccion('identidad', JM_SECCIONES.identidad.titulo, identidadHtml(cli))}

          ${blockSeccion('objetivos', JM_SECCIONES.objetivos.titulo, objetivosHtml())}

          ${blockSeccion('menu', JM_SECCIONES.menu.titulo, menuObjetivoHtml())}

          ${blockSeccion('mapa', JM_SECCIONES.mapa.titulo, mapaNavegacionHtml())}

          ${blockSeccion('gantt', JM_SECCIONES.gantt.titulo, ganttHtml())}

          ${blockSeccion('todo', JM_SECCIONES.todo.titulo, todosHtml())}

          <footer class="jm-ficha-pie">
            <div class="jm-ficha-pie__info">
              <span>Cliente: ${escapeHtml(cli.nombre)}</span>
              ${guardadoTxt ? `<span class="jm-ficha-pie__fecha">${escapeHtml(guardadoTxt)}</span>` : ''}
            </div>
            <button type="button" class="jm-btn jm-btn--primary" id="jm-btn-guardar">Guardar ficha</button>
          </footer>
        </article>
        ${htmlModalEliminar()}
      </div>`;

    bindEvents(cli);
    if (typeof window.initJMWireframesUI === 'function') window.initJMWireframesUI(root);
    initImagenesEditor(cli);
    initImagenesGaleria(cli);
  }

  function initImagenesGaleria(cli) {
    if (typeof window.initLandingImagenesGaleriaUI !== 'function') return;
    if (typeof window.LandingImagenesStore !== 'undefined') {
      window.LandingImagenesStore.asegurarLanding(cli);
    }
    window.initLandingImagenesGaleriaUI(root, {
      landing,
      onChange() {
        cli.ficha.actualizado = new Date().toISOString();
        guardar();
      },
      onError(msg) {
        toast(msg);
      }
    });
  }

  function imagenesGaleriaHtml() {
    if (typeof window.htmlLandingImagenesSeccion !== 'function') return '';
    return window.htmlLandingImagenesSeccion(landing, { claseExtra: 'ficha-seccion--portal' });
  }

  function initImagenesEditor(cli) {
    if (typeof window.initJMImagenesEditorUI !== 'function') return;
    if (!landing.imagenesOverrides || typeof landing.imagenesOverrides !== 'object') {
      landing.imagenesOverrides = {};
    }
    if (!Array.isArray(landing.imagenesOcultas)) landing.imagenesOcultas = [];
    if (!landing.imagenesMeta || typeof landing.imagenesMeta !== 'object') {
      landing.imagenesMeta = {};
    }
    window.initJMImagenesEditorUI(root, {
      imagenesOverrides: landing.imagenesOverrides,
      imagenesOcultas: landing.imagenesOcultas,
      imagenesMeta: landing.imagenesMeta,
      maxBytes: 2.5 * 1024 * 1024,
      onChange(state) {
        Object.assign(landing, state);
        cli.ficha.actualizado = new Date().toISOString();
        guardar();
      },
      onError(msg) {
        toast(msg);
      }
    });
  }

  function aplicarEdicion(cli) {
    landing.identidadResumen = document.getElementById('jm-edit-identidad-resumen')?.value?.trim() || landing.identidadResumen;
    landing.identidadExpandida = document.getElementById('jm-edit-identidad-expandida')?.value?.trim() || landing.identidadExpandida;
    landing.objetivoGeneral = document.getElementById('jm-edit-obj-general')?.value?.trim() || landing.objetivoGeneral;
    const espRaw = document.getElementById('jm-edit-obj-especificos')?.value || '';
    landing.objetivosEspecificos = espRaw.split('\n').map((l) => l.trim()).filter(Boolean);
    if (cli.manualMarca) cli.manualMarca.texto = landing.identidadExpandida;
    cli.ficha.actualizado = new Date().toISOString().slice(0, 10);
    guardar();
  }

  function bindEvents(cli) {
    document.getElementById('jm-btn-guardar')?.addEventListener('click', () => {
      guardar();
      render();
    });

    document.getElementById('jm-btn-editar')?.addEventListener('click', () => {
      if (modoEdicion) {
        aplicarEdicion(cli);
        modoEdicion = false;
      } else {
        modoEdicion = true;
      }
      render();
    });

    const modalEliminar = document.getElementById('jm-modal-eliminar');
    if (modalEliminar && modalEliminar.dataset.jmModalBound !== '1') {
      modalEliminar.dataset.jmModalBound = '1';
      modalEliminar.querySelectorAll('[data-jm-modal-cerrar]').forEach((btn) => {
        btn.addEventListener('click', cerrarModalEliminar);
      });
      document.getElementById('jm-modal-confirmar-eliminar')?.addEventListener('click', () => {
        if (seccionPendienteEliminar) eliminarSeccion(cli, seccionPendienteEliminar);
        cerrarModalEliminar();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const m = document.getElementById('jm-modal-eliminar');
        if (m && !m.hidden) cerrarModalEliminar();
      });
    }

    root.querySelectorAll('[data-jm-seccion-editar]').forEach((btn) => {
      btn.addEventListener('click', () => editarSeccion(btn.dataset.jmSeccionEditar));
    });

    root.querySelectorAll('[data-jm-seccion-eliminar]').forEach((btn) => {
      btn.addEventListener('click', () => abrirModalEliminar(btn.dataset.jmSeccionEliminar));
    });

    root.querySelectorAll('[data-jm-activar-edicion-imagenes]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!modoEdicion) {
          modoEdicion = true;
          render();
        }
        const carrusel = root.querySelector('.jm-interfaces--landings-ref');
        carrusel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        carrusel?.querySelector('[data-jm-int-visor-edit]')?.classList.add('jm-interfaces__visor-edit--pulse');
        setTimeout(() => {
          carrusel?.querySelector('[data-jm-int-visor-edit]')?.classList.remove('jm-interfaces__visor-edit--pulse');
        }, 2000);
      });
    });

    document.getElementById('jm-identidad-toggle')?.addEventListener('click', () => {
      const det = document.getElementById('jm-identidad-detalle');
      const btn = document.getElementById('jm-identidad-toggle');
      if (!det || !btn) return;
      const open = det.hasAttribute('hidden');
      if (open) {
        det.removeAttribute('hidden');
        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = 'Ocultar identidad y documentos ↑';
      } else {
        det.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = 'Ver identidad completa y documentos ↓';
      }
    });

    root.querySelectorAll('.jm-todo-check').forEach((cb) => {
      cb.addEventListener('change', () => {
        const li = cb.closest('[data-todo-id]');
        const tid = li?.dataset.todoId;
        const item = landing.todos.find((t) => t.id === tid);
        if (item) {
          item.completada = cb.checked;
          guardar();
          render();
        }
      });
    });

    document.getElementById('jm-todo-agregar')?.addEventListener('click', () => {
      const inp = document.getElementById('jm-todo-nuevo');
      const titulo = inp?.value?.trim();
      if (!titulo) return;
      landing.todos.push({ id: id(), titulo, dias: '—', fase: 0, completada: false });
      guardar();
      render();
    });

    root.querySelectorAll('[data-eliminar-todo]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tid = btn.dataset.eliminarTodo;
        landing.todos = landing.todos.filter((t) => t.id !== tid);
        guardar();
        render();
      });
    });
  }

  document.title = 'Joyas Mercury · Landing cliente';
  const boot = () => {
    try {
      const ready = window.jmLandingsCarruselReady;
      if (ready && typeof ready.then === 'function') ready.finally(() => render());
      else render();
    } catch (err) {
      console.error('[jm-landing]', err);
      root.innerHTML = `<div class="jm-landing jm-landing--error" style="padding:1.5rem;background:#fff;border-radius:12px;margin:1rem">
        <h1 style="margin:0 0 0.5rem;font-size:1.1rem">No se pudo cargar la landing</h1>
        <p style="margin:0 0 0.75rem;color:#666">Actualiza el proyecto (<code>git pull origin main</code>) y recarga con <strong>Ctrl+Shift+R</strong>.</p>
        <p style="margin:0;font-size:0.85rem;color:#a33">${escapeHtml(err && err.message ? err.message : String(err))}</p>
      </div>`;
    }
  };
  boot();
})();
