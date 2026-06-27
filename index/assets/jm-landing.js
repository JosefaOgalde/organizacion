(function () {
  const CLI_ID = 'cli-joyas-mercury';
  const STORAGE_KEY = 'organizacion_v2';
  const root = document.getElementById('jm-landing-root');
  if (!root) return;

  const colores = { border: '#e8b8c8', bg: '#fdf0f4', text: '#9a5a6e' };
  const prototipoUrl = '../../prototipo-joyas-mercury.html';

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
      cli.ficha.landing.todos = (window.JM_TODO_SEED || []).map((t) => ({ ...t, completada: false }));
      cli.ficha.landingVersion = backupV;
    }
    if (!Array.isArray(cli.ficha.landing.todos) || !cli.ficha.landing.todos.length) {
      cli.ficha.landing.todos = (window.JM_TODO_SEED || []).map((t) => ({ ...t }));
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
    let cli = datos.clientes.find((c) => c.id === CLI_ID);
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
    return cli;
  }

  function guardar() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
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
              <span class="jm-todo__meta">Días ${escapeHtml(t.dias || '—')} · Fase ${t.fase || '—'}</span>
            </span>
            <button type="button" class="jm-todo__eliminar jm-solo-edicion" data-eliminar-todo="${escapeHtml(t.id)}" title="Eliminar">×</button>
          </li>`
      )
      .join('');
    return `<p class="jm-todo__intro">Tareas pequeñas cada ~2 días hábiles, alineadas al Gantt y a los objetivos de Fase 2. Marca lo que ya avanzaste.</p>
      <ul class="jm-todo__lista">${lista}</ul>
      <p class="jm-todo__progreso">${hechos} / ${items.length} completadas</p>
      <div class="jm-todo__add jm-solo-edicion">
        <input type="text" id="jm-todo-nuevo" placeholder="Nueva tarea (~2 días)…">
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

  function render() {
    const cli = cargarDatos();
    root.innerHTML = `
      <div class="jm-landing${modoEdicion ? ' jm-landing--edicion' : ''}" style="--jm-border:${colores.border};--jm-bg:${colores.bg};--jm-text:${colores.text}">
        <header class="jm-landing__hero">
          <div class="jm-landing__hero-top">
            <div>
              <span class="jm-landing__badge">Landing cliente</span>
              <h1>${escapeHtml(cli.nombre)}</h1>
              <p class="jm-landing__meta">JM · ${escapeHtml(cli.tipo || 'Freelance')} · Fase 2 joyasmercury.cl · @joyas-mercury</p>
            </div>
            <div class="jm-landing__toolbar">
              <button type="button" class="jm-btn${modoEdicion ? ' jm-btn--active' : ''}" id="jm-btn-editar" title="Editar identidad, objetivos y tareas">
                ${modoEdicion ? 'Guardar JM' : 'Editar JM'}
              </button>
              <a href="../../index.html#clientes" class="jm-btn">Organizador</a>
            </div>
          </div>
        </header>

        <section class="jm-block" id="jm-seccion-identidad">
          <div class="jm-block__head"><h2>Identidad de marca</h2></div>
          <div class="jm-block__body">${identidadHtml(cli)}</div>
        </section>

        <section class="jm-block" id="jm-seccion-prototipo">
          <div class="jm-block__head"><h2>Prototipo interactivo</h2></div>
          <div class="jm-block__body jm-block__body--compact">
            <a href="${prototipoUrl}" target="_blank" rel="noopener" class="jm-prototipo-card">
              <h3 class="jm-prototipo-card__titulo">Prototipo interactivo</h3>
              <p class="jm-prototipo-card__desc">Flujo actual de joyasmercury.cl en orden: Inicio → Esencial / Gold / Deluxe → Tienda → Mi Carrito → Nosotros. Se abre en pestaña aparte; haz clic en el panel lateral o en las zonas de cada captura.</p>
              <span class="jm-prototipo-card__cta">Abrir prototipo interactivo →</span>
            </a>
          </div>
        </section>

        <section class="jm-block" id="jm-seccion-objetivos">
          <div class="jm-block__body">${objetivosHtml()}</div>
        </section>

        <section class="jm-block" id="jm-seccion-menu">
          <div class="jm-block__head"><h2>Menú objetivo · Paso 4</h2></div>
          <div class="jm-block__body">${menuObjetivoHtml()}</div>
        </section>

        <section class="jm-block" id="jm-seccion-mapa">
          <div class="jm-block__head"><h2>Mapa de navegación · Paso 5</h2></div>
          <div class="jm-block__body">${mapaNavegacionHtml()}</div>
        </section>

        <section class="jm-block" id="jm-seccion-gantt">
          <div class="jm-block__head"><h2>Carta Gantt · tiempos Fase 2</h2></div>
          <div class="jm-block__body">${ganttHtml()}</div>
        </section>

        <section class="jm-block" id="jm-seccion-todo">
          <div class="jm-block__head"><h2>Tareas · checklist (~2 días)</h2></div>
          <div class="jm-block__body">${todosHtml()}</div>
        </section>
      </div>`;

    bindEvents(cli);
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
    document.getElementById('jm-btn-editar')?.addEventListener('click', () => {
      if (modoEdicion) {
        aplicarEdicion(cli);
        modoEdicion = false;
      } else {
        modoEdicion = true;
      }
      render();
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
  render();
})();
