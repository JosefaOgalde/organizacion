/**
 * Generador de prompt Midjourney — Portada newsletter ECR
 * Alcance: SOLO imagen de fondo de la portada (luego se abre en Canva y se pone título/logo).
 * No genera la portada completa ni tipografías.
 * Flujo:
 * 1) Cargar PDF/DOCX (o escribir el nombre del artículo)
 * 2) Leer texto → sugerir título + mundo visual
 * 3) Unir con BASE guardada → mostrar prompt listo para copiar
 */
(function () {
  /**
   * Solo ilustración de fondo. Nunca incluir marca, títulos ES, hex codes ni “LinkedIn cover”:
   * Midjourney los pinta como tipografía (p. ej. en el costado de camiones).
   */
  const BASE =
    'Pure editorial flat-vector BACKGROUND ILLUSTRATION ONLY, glyphless and anepigraphic, modern corporate illustration with depth, stylized faceless characters, clean geometric shapes, warm orange and amber accents with deep teal and navy, large empty unmarked negative space as blank sky or solid color block, polished professional composition, wide landscape';

  /** Cierre fuerte anti-tipografía (MJ suele rotular vehículos; hay que insistir al final). */
  const ANTITEXT =
    'critical: the entire image has zero text of any language, zero letters, zero numbers, zero hex codes, zero logos, zero wordmarks, zero watermarks, zero captions, zero street signs with writing, zero UI labels; every vehicle has solid blank unmarked side panels with no graphics, no fleet names, no slogans; walls boxes screens and maps are unlabeled abstract shapes only';

  /** No pegar flags de Midjourney en el prompt: en este flujo Midjourney no los lee. */
  const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.min.mjs';
  const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs';
  const MAMMOTH_CDN = 'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js';

  /** Alternativas cercanas por mundo (para armar siempre 3 opciones distintas). */
  const ALTERNAS = {
    A: ['G', 'J'],
    B: ['D', 'C'],
    C: ['M', 'I'],
    D: ['O', 'P'],
    E: ['N', 'G'],
    F: ['L', 'H'],
    G: ['A', 'E'],
    H: ['F', 'E'],
    I: ['C', 'M'],
    J: ['A', 'L'],
    K: ['M', 'C'],
    L: ['F', 'J'],
    M: ['C', 'K'],
    N: ['E', 'G'],
    O: ['D', 'P'],
    P: ['D', 'O']
  };

  /** Conceptos en inglés sin citar el título en español (si se cita, Midjourney lo dibuja como tipografía). */
  const CONCEPTOS = [
    'timely coordination of mobile field teams, decisions flowing in real time, calm productive energy',
    'operations adjusting across distant locations, clarity replacing delay, soft ambient glow',
    'people guided by simple abstract digital signals, agile work rhythm, open blank upper area'
  ];

  const MUNDOS = [
    { id: 'A', nombre: 'Retail / supermercado bajo presión', escena: 'long supermarket aisle with stylized faceless shoppers and carts, reflective floor, warm orange backlight at the far end, cool teal shelves, calm blank unmarked space in the upper third' },
    { id: 'B', nombre: 'Sala de control / industria tech', escena: 'industrial control room with glowing abstract orange panels that show only shapes not characters, stylized helmeted workers at consoles, clean orange color block occupying the upper half as empty unmarked space, deep navy shadows' },
    { id: 'C', nombre: 'Liderazgo sobre operación', escena: 'stylized leader silhouette in profile overlooking plain unlabeled crates and a simplified industrial skyline, sunset orange rim light, teal atmosphere, generous open blank sky' },
    { id: 'D', nombre: 'Data / ciber / infraestructura', escena: 'isometric soft 3D data infrastructure with geometric cubes and motherboard-like grid, glowing orange circuit lines, deep teal base, clean blank unmarked space to one side' },
    { id: 'E', nombre: 'Bodega / stockroom', escena: 'warehouse stockroom aisle with plain orange crates on teal shelving, flat stylized workers, central corridor perspective, duotone orange and teal, open blank ceiling area' },
    { id: 'F', nombre: 'Mapa / ruta logística', escena: 'abstract route diagram with an orange ribbon path over teal terrain, simple pin shapes, tiny unmarked vehicles, a tablet with abstract glowing shapes only, amber horizon, wide blank unmarked space above' },
    { id: 'G', nombre: 'Warehouse + retail humano', escena: 'warm warehouse-retail hybrid scene with stacked plain boxes and a simple counter display, hanging orange lamps, cyan clean upper block as empty unmarked space, faceless staff' },
    { id: 'H', nombre: 'Automatización logística', escena: 'isometric navy and orange automated warehouse with conveyors and blank AGV robots, glowing accents, racking in background, open blank upper area' },
    { id: 'I', nombre: 'Crecimiento / ambición', escena: 'ascending stylized silhouettes climbing geometric bar-like steps toward an orange sky with soft clouds, teal ground plane, strong blank unmarked space on the left' },
    { id: 'J', nombre: 'Retail costero / temporada', escena: 'minimal flat retail interior in cool blue with a coastal view through glass, orange accents, generous blank unmarked space, calm seasonal mood' },
    { id: 'K', nombre: 'Oficina colaborativa', escena: 'collaborative office profiles at laptops along a teal and beige diagonal split, orange accents, subtle paper texture, open blank corner' },
    { id: 'L', nombre: 'Logística urbana limpia', escena: 'quiet teal urban street at dusk, solid unmarked orange cargo box vehicle with completely blank side panels parked beside a sage building, thin trees, soft doorway glow, open empty sky, faceless silhouettes, no graphics on any surface' },
    { id: 'M', nombre: 'Equipo diverso', escena: 'centered group of diverse stylized field workers with simple industrial props, solid beige-teal background, orange highlights, balanced blank unmarked space around them' },
    { id: 'N', nombre: 'Warehouse texturizado', escena: 'textured warehouse with stacked plain orange-blue crates, reflective floor, overhead lamp glow, pigment-like texture, open blank upper band' },
    { id: 'O', nombre: 'Cerebro / ideas / IA', escena: 'soft peach brain-like form with blue neural network lines and orange nodes on a clean cream background, generous blank unmarked space' },
    { id: 'P', nombre: 'Seguridad / data urbana', escena: 'central server cylinder with abstract keyhole shields and flat skyline, navy orange and beige palette, clean blank unmarked space' }
  ];

  const KEYWORDS = [
    // Específicos primero (evitar que "tecnología" o "equipo" ganen demasiado pronto)
    { re: /equipos en terreno|ajustar a tiempo|cobertura|asistencia|equipos m[oó]viles|en terreno/i, id: 'F' },
    { re: /retail|sala|supermercado|tienda|punto de venta|tpv/i, id: 'A' },
    { re: /control|industria|monitoreo|tiempo real|operaci[oó]n en vivo/i, id: 'B' },
    { re: /liderazgo|supervisi[oó]n experta|decisi[oó]n estrat/i, id: 'C' },
    { re: /bodega|stock|inventario|almac[eé]n/i, id: 'E' },
    { re: /ruta|distribuid|log[ií]stica|m[oó]vil/i, id: 'F' },
    { re: /automatizaci[oó]n|agv|robot/i, id: 'H' },
    { re: /data|datos|ciber|infraestructura digital/i, id: 'D' },
    { re: /tecnolog[ií]a/i, id: 'D' },
    { re: /crecimiento|ambici[oó]n|escala|meta/i, id: 'I' },
    { re: /temporada|verano|playa|costero/i, id: 'J' },
    { re: /oficina|colaboraci[oó]n|rr\.?hh|personas administrativas/i, id: 'K' },
    { re: /urbano|despac|camion|entrega/i, id: 'L' },
    { re: /staff|dotaci[oó]n|outsourcing/i, id: 'M' },
    { re: /\bia\b|innovaci[oó]n|cerebro/i, id: 'O' },
    { re: /seguridad|trazabilidad|protecci[oó]n/i, id: 'P' }
  ];

  const LS_KEY = 'ecr-portada-historial-v1';
  const HISTORIAL_API = '/api/ecr-portada-historial';
  const HISTORIAL_JSON = 'newsletter/historial-portadas.json';

  function slugSafe(titulo) {
    return String(titulo || 'portada')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'portada';
  }

  function leerLocalHistorial() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function escribirLocalHistorial(items) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items.slice(0, 80)));
    } catch {
      /* ignore quota */
    }
  }

  function upsertLocal(item) {
    const items = leerLocalHistorial();
    const i = items.findIndex((x) => x.id === item.id || (x.titulo === item.titulo && x.prompt === item.prompt));
    if (i >= 0) items[i] = { ...items[i], ...item };
    else items.unshift(item);
    escribirLocalHistorial(items);
    return items;
  }

  async function cargarHistorialRemoto() {
    try {
      const r = await fetch(HISTORIAL_API, { cache: 'no-store' });
      if (r.ok) {
        const data = await r.json();
        return Array.isArray(data.items) ? data.items.slice().reverse() : [];
      }
    } catch {
      /* fallthrough */
    }
    try {
      const r2 = await fetch(HISTORIAL_JSON, { cache: 'no-store' });
      if (r2.ok) {
        const data = await r2.json();
        return Array.isArray(data.items) ? data.items.slice().reverse() : [];
      }
    } catch {
      /* ignore */
    }
    return leerLocalHistorial();
  }

  async function persistirResultado(payload) {
    const opciones = Array.isArray(payload.opciones) ? payload.opciones : null;
    const item = {
      id: payload.id || `portada-${slugSafe(payload.titulo)}-${Date.now().toString(36)}`,
      fecha: payload.fecha || new Date().toISOString().slice(0, 10),
      titulo: String(payload.titulo || '').trim(),
      mundoId: payload.mundoId || (opciones && opciones[0] && opciones[0].mundoId) || '',
      mundoNombre: payload.mundoNombre || (opciones && opciones[0] && opciones[0].mundoNombre) || '',
      prompt: String(payload.prompt || (opciones && opciones[0] && opciones[0].prompt) || '').trim(),
      opciones: opciones || undefined,
      notas: payload.notas || 'Solo fondo de portada. Sin flags Midjourney.',
      origen: payload.origen || 'ui',
    };
    upsertLocal(item);
    try {
      const r = await fetch(HISTORIAL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (r.ok) {
        const data = await r.json();
        if (data && data.item) upsertLocal(data.item);
        return { ok: true, item: (data && data.item) || item, remoto: true };
      }
    } catch {
      /* local only */
    }
    return { ok: true, item, remoto: false };
  }

  let pdfjsLibPromise = null;
  let mammothPromise = null;
  let ultimoTextoArticulo = '';

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function mundoPorId(id) {
    return MUNDOS.find((m) => m.id === id) || MUNDOS[5];
  }

  function sugerirMundo(texto) {
    const t = String(texto || '');
    for (const k of KEYWORDS) {
      if (k.re.test(t)) return k.id;
    }
    return 'F';
  }

  function elegirTresMundos(preferido) {
    const primero = preferido || 'F';
    const alts = ALTERNAS[primero] || ['F', 'L'];
    const ids = [primero];
    for (const a of alts) {
      if (!ids.includes(a)) ids.push(a);
      if (ids.length === 3) break;
    }
    // Relleno si falta
    for (const m of MUNDOS) {
      if (ids.length === 3) break;
      if (!ids.includes(m.id)) ids.push(m.id);
    }
    return ids.slice(0, 3);
  }

  function conceptoDesdeTitulo(_titulo, variante) {
    return CONCEPTOS[variante % CONCEPTOS.length];
  }

  function armarPrompt(titulo, mundoId, variante) {
    const mundo = mundoPorId(mundoId || sugerirMundo(titulo));
    const concepto = conceptoDesdeTitulo(titulo, variante || 0);
    // Solo inglés de escena. Sin marca, sin título ES, sin hex, sin “cover”: MJ los pinta.
    return `${BASE}, scene: ${mundo.escena}, thematic mood: ${concepto}, ${ANTITEXT}`;
  }

  /** Siempre 3 opciones. El mundo principal se define desde el texto del artículo (no se elige a mano). */
  function armarTresOpciones(titulo, textoArticulo) {
    const preferido = sugerirMundo([titulo, textoArticulo].filter(Boolean).join('\n'));
    const ids = elegirTresMundos(preferido);
    return {
      mundoDetectado: mundoPorId(preferido),
      opciones: ids.map((id, i) => {
        const mundo = mundoPorId(id);
        return {
          opcion: i + 1,
          mundoId: mundo.id,
          mundoNombre: mundo.nombre,
          prompt: armarPrompt(titulo, mundo.id, i),
        };
      }),
    };
  }

  function limpiarLinea(raw) {
    return String(raw || '')
      .replace(/\u0000/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tituloDesdeNombreArchivo(name) {
    return String(name || '')
      .replace(/\.[^.]+$/, '')
      .replace(/[_]+/g, ' ')
      .replace(/^\s*ART[\s_\-]*\d+\s*[-–—:]?\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Heurística: título = primera línea sustancial (salta portada "ART 23", page markers, etc.). */
  function inferirTitulo(texto, nombreArchivo) {
    const fromFile = tituloDesdeNombreArchivo(nombreArchivo);
    // Preferir nombre de archivo si es un ART_xx descriptivo
    if (fromFile && fromFile.length >= 20 && /[a-záéíóúñ]/i.test(fromFile)) {
      return fromFile;
    }

    const lines = String(texto || '')
      .split(/\r?\n/)
      .map(limpiarLinea)
      .filter(Boolean);

    const skip = /^(art(?:[ií]culo)?\s*\d+|page\s*\d+|--\s*\d+\s+of\s+\d+\s*--|ecr\s*group|www\.|http)/i;
    const candidatos = [];

    for (const line of lines.slice(0, 40)) {
      if (line.length < 18 || line.length > 160) continue;
      if (skip.test(line)) continue;
      if (/^[•\-\d.…]+\s*$/.test(line)) continue;
      if (/^(durante|hoy|en una|muchas|el terreno|la gesti)/i.test(line) && line.length > 90) continue;
      candidatos.push(line);
      if (candidatos.length >= 5) break;
    }

    if (candidatos.length) {
      const conDosPuntos = candidatos.find((c) => /:/.test(c) && c.length < 120);
      if (conDosPuntos) return conDosPuntos;
      return [...candidatos].sort((a, b) => a.length - b.length)[0];
    }

    return fromFile || '';
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-ecr-lib="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === '1') return resolve();
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('No se pudo cargar ' + src)));
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.dataset.ecrLib = src;
      s.onload = () => {
        s.dataset.loaded = '1';
        resolve();
      };
      s.onerror = () => reject(new Error('No se pudo cargar ' + src));
      document.head.appendChild(s);
    });
  }

  async function getPdfjs() {
    if (!pdfjsLibPromise) {
      pdfjsLibPromise = import(PDFJS_CDN).then((mod) => {
        const lib = mod.default || mod;
        if (lib.GlobalWorkerOptions) {
          lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        }
        return lib;
      });
    }
    return pdfjsLibPromise;
  }

  async function getMammoth() {
    if (window.mammoth) return window.mammoth;
    if (!mammothPromise) {
      mammothPromise = loadScript(MAMMOTH_CDN).then(() => {
        if (!window.mammoth) throw new Error('Mammoth no disponible');
        return window.mammoth;
      });
    }
    return mammothPromise;
  }

  async function leerPdf(file) {
    const pdfjs = await getPdfjs();
    const buf = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buf }).promise;
    const maxPages = Math.min(pdf.numPages, 8);
    const partes = [];
    for (let i = 1; i <= maxPages; i += 1) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((it) => it.str).join(' ');
      partes.push(pageText);
    }
    return partes.join('\n').replace(/[ \t]+/g, ' ').trim();
  }

  async function leerDocx(file) {
    const mammoth = await getMammoth();
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return String(result.value || '').trim();
  }

  async function leerTxt(file) {
    return String(await file.text()).trim();
  }

  async function leerArchivoArticulo(file) {
    const name = (file.name || '').toLowerCase();
    const type = (file.type || '').toLowerCase();

    if (name.endsWith('.doc') && !name.endsWith('.docx')) {
      throw new Error(
        'El formato .doc antiguo no se puede leer aquí. Guárdalo como PDF o .docx e inténtalo de nuevo.'
      );
    }

    if (name.endsWith('.pdf') || type === 'application/pdf') {
      return leerPdf(file);
    }
    if (
      name.endsWith('.docx') ||
      type.includes('wordprocessingml') ||
      type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return leerDocx(file);
    }
    if (name.endsWith('.txt') || type.startsWith('text/')) {
      return leerTxt(file);
    }

    throw new Error('Formato no soportado. Usa PDF, DOCX o TXT.');
  }

  window.ECR_PORTADA_PROMPT = {
    BASE,
    MUNDOS,
    sugerirMundo,
    armarPrompt,
    armarTresOpciones,
    mundoPorId,
    inferirTitulo,
    leerArchivoArticulo
  };

  window.ecrHtmlPortadaPrompt = function ecrHtmlPortadaPrompt() {
    return `<section class="ecr-portada ficha-seccion ficha-seccion--portal" data-ecr-portada-prompt>
      <div class="ficha-seccion__headline">
        <h2 class="ficha-seccion__titulo">Portada Midjourney</h2>
        <span class="ficha-seccion__estado">Solo fondo · 3 opciones</span>
      </div>
      <p class="ecr-portada__intro">
        1) Entrega el <strong>PDF/DOCX</strong> del artículo (o el nombre).<br>
        2) Pulsa <strong>Generar prompt</strong>.<br>
        3) El sistema <strong>define el mundo visual</strong> según el contenido y te entrega
        <strong>3 opciones</strong> (solo ilustración de fondo).
        El prompt <strong>no incluye</strong> nombres de marca ni tipografía en español
        (si se escriben, Midjourney los dibuja como logo/texto).
        Sin flags <code>--ar</code>/<code>--style</code>/<code>--v</code>/<code>--no</code>.
      </p>

      <div class="ecr-portada__upload" data-ecr-portada-upload>
        <label class="ecr-portada__label" for="ecr-portada-archivo">Documento del artículo</label>
        <div class="ecr-portada__drop" data-ecr-portada-drop>
          <input
            id="ecr-portada-archivo"
            class="ecr-portada__file"
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            data-ecr-portada-archivo
          >
          <p class="ecr-portada__drop-text">
            Arrastra aquí el PDF/DOCX o <strong>elige archivo</strong>
          </p>
          <p class="ecr-portada__drop-hint">PDF recomendado · DOCX ok · .doc antiguo no soportado</p>
        </div>
        <p class="ecr-portada__file-status" data-ecr-portada-file-status></p>
        <details class="ecr-portada__extracto" data-ecr-portada-extracto-wrap hidden>
          <summary>Vista previa del texto leído</summary>
          <pre class="ecr-portada__extracto-text" data-ecr-portada-extracto></pre>
        </details>
      </div>

      <form class="ecr-portada__form" data-ecr-portada-form>
        <label class="ecr-portada__label" for="ecr-portada-titulo">Nombre del artículo</label>
        <input
          id="ecr-portada-titulo"
          class="ecr-portada__input"
          type="text"
          name="titulo"
          required
          autocomplete="off"
          placeholder="Se completa al leer el PDF, o escríbelo aquí"
          data-ecr-portada-titulo
        >
        <p class="ecr-portada__hint" data-ecr-portada-hint>
          El mundo visual se define automáticamente al generar, según el documento.
        </p>
        <button type="submit" class="portal-btn ecr-portada__submit">Generar prompt</button>
      </form>
      <div class="ecr-portada__resultado" data-ecr-portada-resultado hidden>
        <div class="ecr-portada__resultado-head">
          <h3 class="ecr-portada__resultado-titulo">3 prompts listos (solo fondo)</h3>
          <button type="button" class="portal-btn portal-btn--ghost" data-ecr-portada-guardar>Guardar de nuevo</button>
        </div>
        <p class="ecr-portada__mundo-detectado" data-ecr-portada-mundo-detectado></p>
        <p class="ecr-portada__meta" data-ecr-portada-meta></p>
        <p class="ecr-portada__save-status" data-ecr-portada-save-status></p>
        <div class="ecr-portada__opciones" data-ecr-portada-opciones></div>
      </div>
      <div class="ecr-portada__historial" data-ecr-portada-historial>
        <div class="ecr-portada__historial-head">
          <h3 class="ecr-portada__historial-titulo">Resultados guardados</h3>
          <a class="portal-btn portal-btn--ghost" href="newsletter/HISTORIAL-PORTADAS.md" target="_blank" rel="noopener">Ver historial</a>
        </div>
        <p class="ecr-portada__historial-intro">Cada prompt que generes (o que se entregue) queda aquí para no perderlo.</p>
        <ul class="ecr-portada__historial-lista" data-ecr-portada-historial-lista></ul>
      </div>
    </section>`;
  };

  window.initEcrPortadaPromptUI = function initEcrPortadaPromptUI(root, opts) {
    opts = opts || {};
    const sec = root?.querySelector?.('[data-ecr-portada-prompt]');
    if (!sec || sec.dataset.bound === '1') return;
    sec.dataset.bound = '1';

    const form = sec.querySelector('[data-ecr-portada-form]');
    const input = sec.querySelector('[data-ecr-portada-titulo]');
    const hint = sec.querySelector('[data-ecr-portada-hint]');
    const resultado = sec.querySelector('[data-ecr-portada-resultado]');
    const meta = sec.querySelector('[data-ecr-portada-meta]');
    const mundoDetectadoEl = sec.querySelector('[data-ecr-portada-mundo-detectado]');
    const opcionesEl = sec.querySelector('[data-ecr-portada-opciones]');
    const btnGuardar = sec.querySelector('[data-ecr-portada-guardar]');
    const saveStatus = sec.querySelector('[data-ecr-portada-save-status]');
    const fileInput = sec.querySelector('[data-ecr-portada-archivo]');
    const drop = sec.querySelector('[data-ecr-portada-drop]');
    const fileStatus = sec.querySelector('[data-ecr-portada-file-status]');
    const extractoWrap = sec.querySelector('[data-ecr-portada-extracto-wrap]');
    const extractoEl = sec.querySelector('[data-ecr-portada-extracto]');
    const historialLista = sec.querySelector('[data-ecr-portada-historial-lista]');

    let ultimoPayload = null;

    function textoParaSugerir() {
      return [input.value, ultimoTextoArticulo].filter(Boolean).join('\n');
    }

    function renderOpciones(opciones) {
      if (!opcionesEl) return;
      opcionesEl.innerHTML = (opciones || [])
        .map(
          (op) => `<article class="ecr-portada__opcion" data-opcion="${op.opcion}">
            <div class="ecr-portada__opcion-head">
              <h4 class="ecr-portada__opcion-titulo">Opción ${op.opcion} · Mundo visual ${escapeHtml(op.mundoId)} — ${escapeHtml(op.mundoNombre)}</h4>
              <button type="button" class="portal-btn" data-ecr-copiar-opcion="${op.opcion}">Copiar</button>
            </div>
            <pre class="ecr-portada__prompt" data-ecr-prompt-opcion="${op.opcion}">${escapeHtml(op.prompt)}</pre>
          </article>`
        )
        .join('');
      opcionesEl.querySelectorAll('[data-ecr-copiar-opcion]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const n = btn.getAttribute('data-ecr-copiar-opcion');
          const pre = opcionesEl.querySelector(`[data-ecr-prompt-opcion="${n}"]`);
          const text = pre?.textContent || '';
          try {
            await navigator.clipboard.writeText(text);
            if (typeof opts.onCopy === 'function') opts.onCopy(true);
          } catch {
            if (typeof opts.onCopy === 'function') opts.onCopy(false);
          }
        });
      });
    }

    function renderHistorial(items) {
      if (!historialLista) return;
      if (!items || !items.length) {
        historialLista.innerHTML = '<li class="ecr-portada__historial-vacio">Aún no hay resultados guardados.</li>';
        return;
      }
      historialLista.innerHTML = items.slice(0, 12).map((it) => {
        const md = it.archivoMarkdown ? `newsletter/${it.archivoMarkdown}` : '';
        const link = md
          ? `<a href="${escapeHtml(md)}" target="_blank" rel="noopener">abrir</a>`
          : '';
        const nOps = Array.isArray(it.opciones) ? it.opciones.length : 1;
        return `<li class="ecr-portada__historial-item">
          <div>
            <strong>${escapeHtml(it.titulo || 'Sin título')}</strong>
            <span>${escapeHtml(it.fecha || '')} · ${nOps} opción(es) · Mundo ${escapeHtml(it.mundoId || '?')}</span>
          </div>
          <div class="ecr-portada__historial-item-actions">
            ${link}
            <button type="button" class="portal-btn portal-btn--ghost" data-ecr-cargar-guardado data-id="${escapeHtml(it.id)}">Usar</button>
          </div>
        </li>`;
      }).join('');
      historialLista.querySelectorAll('[data-ecr-cargar-guardado]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const it = items.find((x) => x.id === btn.getAttribute('data-id'));
          if (!it) return;
          input.value = it.titulo || '';
          const ops =
            Array.isArray(it.opciones) && it.opciones.length
              ? it.opciones
              : [{ opcion: 1, mundoId: it.mundoId, mundoNombre: it.mundoNombre, prompt: it.prompt }];
          if (mundoDetectadoEl) {
            mundoDetectadoEl.innerHTML =
              '<strong>Mundo visual definido:</strong> ' +
              escapeHtml(it.mundoId || ops[0]?.mundoId || '?') +
              ' — ' +
              escapeHtml(it.mundoNombre || ops[0]?.mundoNombre || '');
          }
          meta.textContent = `Artículo: ${it.titulo} · ${ops.length} opciones · cargado del historial`;
          renderOpciones(ops);
          resultado.hidden = false;
          ultimoPayload = { ...it, opciones: ops, prompt: ops[0]?.prompt || it.prompt };
          if (saveStatus) saveStatus.textContent = 'Cargado desde historial guardado.';
        });
      });
    }

    async function refrescarHistorial() {
      const items = await cargarHistorialRemoto();
      const local = leerLocalHistorial();
      const byId = new Map();
      [...items, ...local].forEach((it) => {
        if (!it || !it.id) return;
        if (!byId.has(it.id)) byId.set(it.id, it);
      });
      const merged = Array.from(byId.values()).sort((a, b) =>
        String(b.fecha || '').localeCompare(String(a.fecha || ''))
      );
      renderHistorial(merged);
    }

    async function guardarActual(origen) {
      if (!ultimoPayload || !(ultimoPayload.prompt || (ultimoPayload.opciones && ultimoPayload.opciones[0]))) return;
      if (saveStatus) saveStatus.textContent = 'Guardando…';
      const res = await persistirResultado({ ...ultimoPayload, origen: origen || 'ui' });
      if (saveStatus) {
        saveStatus.textContent = res.remoto
          ? '✓ Guardado en historial del proyecto (disco).'
          : '✓ Guardado en este navegador (servidor no disponible para disco).';
      }
      await refrescarHistorial();
      if (typeof opts.onSaved === 'function') opts.onSaved(res);
      return res;
    }

    async function generar(e) {
      if (e) e.preventDefault();
      const titulo = String(input.value || '').trim();
      if (!titulo) {
        if (typeof opts.onError === 'function') {
          opts.onError('Entrega el PDF/DOCX o escribe el nombre del artículo');
        }
        input.focus();
        return;
      }
      const pack = armarTresOpciones(titulo, textoParaSugerir());
      const mundo = pack.mundoDetectado;
      const opciones = pack.opciones;
      const desdeArchivo = ultimoTextoArticulo ? ' · desde documento' : '';
      if (mundoDetectadoEl) {
        mundoDetectadoEl.innerHTML =
          '<strong>Mundo visual definido:</strong> ' +
          escapeHtml(mundo.id) +
          ' — ' +
          escapeHtml(mundo.nombre);
      }
      if (hint) {
        hint.textContent = `Definido al generar: mundo ${mundo.id} · ${mundo.nombre}`;
      }
      meta.textContent =
        `Artículo: ${titulo} · 3 opciones con mundo visual incluido en el prompt${desdeArchivo}`;
      renderOpciones(opciones);
      resultado.hidden = false;
      ultimoPayload = {
        id: `portada-${slugSafe(titulo)}`,
        titulo,
        mundoId: mundo.id,
        mundoNombre: mundo.nombre,
        prompt: opciones[0].prompt,
        opciones,
        notas:
          'Solo fondo. Mundo visual definido automáticamente desde el documento. Sin flags Midjourney.',
        origen: 'ui',
      };
      if (typeof opts.onGenerate === 'function') {
        opts.onGenerate({
          titulo,
          mundoId: mundo.id,
          mundoNombre: mundo.nombre,
          opciones,
          prompt: opciones[0].prompt,
          texto: ultimoTextoArticulo,
        });
      }
      await guardarActual('ui');
    }

    async function procesarArchivo(file) {
      if (!file) return;
      fileStatus.textContent = `Leyendo «${file.name}»…`;
      fileStatus.classList.remove('ecr-portada__file-status--error');
      extractoWrap.hidden = true;
      resultado.hidden = true;
      try {
        const texto = await leerArchivoArticulo(file);
        if (!texto || texto.length < 20) {
          throw new Error('No se pudo extraer texto útil del archivo.');
        }
        ultimoTextoArticulo = texto;
        const titulo = inferirTitulo(texto, file.name);
        if (titulo) input.value = titulo;

        const preview = texto.slice(0, 900) + (texto.length > 900 ? '…' : '');
        extractoEl.textContent = preview;
        extractoWrap.hidden = false;
        if (hint) {
          hint.textContent =
            'Documento listo. Pulsa «Generar prompt» para definir el mundo visual y recibir las 3 opciones.';
        }
        fileStatus.textContent =
          `✓ Documento leído: ${file.name}` +
          (titulo ? ` · título: ${titulo}` : '') +
          ' · ahora genera el prompt';
        if (typeof opts.onFileLoaded === 'function') {
          opts.onFileLoaded({ file, titulo, texto });
        }
      } catch (err) {
        console.error(err);
        fileStatus.textContent = err?.message || 'No se pudo leer el archivo';
        fileStatus.classList.add('ecr-portada__file-status--error');
        if (typeof opts.onError === 'function') opts.onError(fileStatus.textContent);
      }
    }

    form?.addEventListener('submit', generar);
    btnGuardar?.addEventListener('click', () => guardarActual('ui-manual'));

    fileInput?.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      procesarArchivo(file);
    });

    if (drop) {
      ['dragenter', 'dragover'].forEach((ev) => {
        drop.addEventListener(ev, (e) => {
          e.preventDefault();
          e.stopPropagation();
          drop.classList.add('ecr-portada__drop--active');
        });
      });
      ['dragleave', 'drop'].forEach((ev) => {
        drop.addEventListener(ev, (e) => {
          e.preventDefault();
          e.stopPropagation();
          drop.classList.remove('ecr-portada__drop--active');
        });
      });
      drop.addEventListener('drop', (e) => {
        const file = e.dataTransfer?.files?.[0];
        if (file && fileInput) {
          const dt = new DataTransfer();
          dt.items.add(file);
          fileInput.files = dt.files;
        }
        procesarArchivo(file);
      });
    }

    if (opts.tituloInicial) {
      input.value = opts.tituloInicial;
    }

    refrescarHistorial();
  };
})();
