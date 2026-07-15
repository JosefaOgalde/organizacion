/**
 * Generador de prompt Midjourney — Portada newsletter ECR
 * Flujo:
 * 1) Cargar PDF/DOCX (o escribir el nombre del artículo)
 * 2) Leer texto → sugerir título + mundo visual
 * 3) Unir con BASE guardada → mostrar prompt listo para copiar
 */
(function () {
  const BASE =
    'Editorial LinkedIn newsletter cover background illustration for ECR Capacitacion brand system, NO text, NO logos, NO letters, NO watermarks, modern corporate flat vector illustration with depth, stylized faceless characters, clean geometric shapes, high-contrast complementary palette of warm orange/amber (#E85D04 family) and deep teal/navy blue, generous negative space for later headline overlay, professional Chilean corporate learning mood, polished editorial composition, wide landscape';

  const FLAGS = '--ar 1.91:1 --style raw --v 6.1 --no text, typography, letters, logo, watermark, signage, UI words, brand marks';

  const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.min.mjs';
  const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs';
  const MAMMOTH_CDN = 'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js';

  const MUNDOS = [
    { id: 'A', nombre: 'Retail / supermercado bajo presión', escena: 'long supermarket aisle with stylized faceless shoppers and carts, reflective floor, warm orange backlight at the far end, cool teal shelves, calm negative space in the upper third' },
    { id: 'B', nombre: 'Sala de control / industria tech', escena: 'industrial control room with glowing orange monitor screens, stylized helmeted workers at consoles, clean orange color block occupying the upper half for title space, deep navy shadows' },
    { id: 'C', nombre: 'Liderazgo sobre operación', escena: 'stylized leader silhouette in profile overlooking logistics boxes and a simplified industrial skyline, sunset orange rim light, teal atmosphere, generous open sky for headline' },
    { id: 'D', nombre: 'Data / ciber / infraestructura', escena: 'isometric soft 3D data infrastructure with geometric cubes and motherboard-like grid, glowing orange circuit lines, deep teal base, clean negative space to one side' },
    { id: 'E', nombre: 'Bodega / stockroom', escena: 'warehouse stockroom aisle with orange crates on teal shelving, flat stylized workers, central corridor perspective, duotone orange and teal, open ceiling space for overlay' },
    { id: 'F', nombre: 'Mapa / ruta logística', escena: 'abstract logistics map with an orange route ribbon over teal terrain, location pins, tiny vehicles, a tablet with simple charts, amber horizon, wide negative space above' },
    { id: 'G', nombre: 'Warehouse + retail humano', escena: 'warm warehouse-retail hybrid scene with stacked boxes and a simple counter display, hanging orange lamps, cyan clean upper block for title space, faceless staff' },
    { id: 'H', nombre: 'Automatización logística', escena: 'isometric navy and orange automated warehouse with conveyors and AGV robots, glowing accents, racking in background, open upper area for headline' },
    { id: 'I', nombre: 'Crecimiento / ambición', escena: 'ascending stylized silhouettes climbing geometric bar-like steps toward an orange sky with soft clouds, teal ground plane, strong negative space on the left' },
    { id: 'J', nombre: 'Retail costero / temporada', escena: 'minimal flat retail interior in cool blue with a coastal view through glass, orange accents, generous negative space, calm seasonal mood' },
    { id: 'K', nombre: 'Oficina colaborativa', escena: 'collaborative office profiles at laptops along a teal and beige diagonal split, orange accents, subtle paper texture, open corner for title' },
    { id: 'L', nombre: 'Logística urbana limpia', escena: 'clean urban logistics scene with an orange delivery truck beside a sage-teal building and thin trees, soft glow at the entrance, open sky for overlay' },
    { id: 'M', nombre: 'Equipo diverso', escena: 'centered group of diverse stylized field workers with simple industrial props, solid beige-teal background, orange highlights, balanced negative space around them' },
    { id: 'N', nombre: 'Warehouse texturizado', escena: 'textured warehouse with stacked orange-blue crates, reflective floor, overhead lamp glow, pigment-like texture, open upper band for headline' },
    { id: 'O', nombre: 'Cerebro / ideas / IA', escena: 'soft peach brain-like form with blue neural network lines and orange nodes on a clean cream background, generous negative space' },
    { id: 'P', nombre: 'Seguridad / data urbana', escena: 'central server cylinder with abstract keyhole shields and flat skyline, navy orange and beige palette, clean negative space for typography' }
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

  function conceptoDesdeTitulo(titulo) {
    const limpio = String(titulo || '').trim().replace(/\s+/g, ' ');
    if (!limpio) return 'field operations adjusting decisions in real time';
    return `visual metaphor for the newsletter theme "${limpio}": coordinated field teams, timely operational adjustment, people data and decisions connecting without any readable text`;
  }

  function armarPrompt(titulo, mundoId) {
    const mundo = mundoPorId(mundoId || sugerirMundo(titulo));
    const concepto = conceptoDesdeTitulo(titulo);
    return `${BASE}, scene: ${mundo.escena}, thematic concept: ${concepto} ${FLAGS}`;
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
    if (fromFile && /equipos|terreno|ventaja|retail|log[ií]st/i.test(fromFile) && fromFile.length >= 20) {
      return fromFile.replace(/\s*la ventaja de ajustar a tiempo\.?/i, (m) => m.replace(/\.$/, '')).trim()
        || fromFile;
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
      // Evitar párrafos narrativos largos como "título"
      if (/^(durante|hoy|en una|muchas|el terreno|la gesti)/i.test(line) && line.length > 90) continue;
      candidatos.push(line);
      if (candidatos.length >= 5) break;
    }

    if (candidatos.length) {
      const conDosPuntos = candidatos.find((c) => /:/.test(c) && c.length < 120);
      if (conDosPuntos) return conDosPuntos;
      // Línea corta tipo titular
      const corto = [...candidatos].sort((a, b) => a.length - b.length)[0];
      return corto;
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
    FLAGS,
    MUNDOS,
    sugerirMundo,
    armarPrompt,
    mundoPorId,
    inferirTitulo,
    leerArchivoArticulo
  };

  window.ecrHtmlPortadaPrompt = function ecrHtmlPortadaPrompt() {
    const options = MUNDOS.map(
      (m) => `<option value="${m.id}">${m.id} — ${escapeHtml(m.nombre)}</option>`
    ).join('');

    return `<section class="ecr-portada ficha-seccion ficha-seccion--portal" data-ecr-portada-prompt>
      <div class="ficha-seccion__headline">
        <h2 class="ficha-seccion__titulo">Portada Midjourney</h2>
        <span class="ficha-seccion__estado">1.91:1 · sin textos ni logos</span>
      </div>
      <p class="ecr-portada__intro">
        Carga el <strong>PDF o DOCX</strong> del artículo (o escribe el nombre). Se lee el texto,
        se sugiere el título y se arma el prompt con la
        <a href="newsletter/BASE-ESTILO-PORTADAS.md" target="_blank" rel="noopener">base de estilo guardada</a>.
      </p>

      <div class="ecr-portada__upload" data-ecr-portada-upload>
        <label class="ecr-portada__label" for="ecr-portada-archivo">Archivo del artículo</label>
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
          placeholder="Ej: Equipos en terreno: la ventaja de ajustar a tiempo"
          data-ecr-portada-titulo
        >
        <label class="ecr-portada__label" for="ecr-portada-mundo">Mundo visual</label>
        <div class="ecr-portada__row">
          <select id="ecr-portada-mundo" class="ecr-portada__select" data-ecr-portada-mundo>
            ${options}
          </select>
          <button type="button" class="portal-btn portal-btn--ghost" data-ecr-portada-auto>Auto según texto</button>
        </div>
        <p class="ecr-portada__hint" data-ecr-portada-hint>Sugerencia: mundo F · Mapa / ruta logística (ajústalo si quieres otro).</p>
        <button type="submit" class="portal-btn ecr-portada__submit">Generar prompt</button>
      </form>
      <div class="ecr-portada__resultado" data-ecr-portada-resultado hidden>
        <div class="ecr-portada__resultado-head">
          <h3 class="ecr-portada__resultado-titulo">Prompt listo</h3>
          <button type="button" class="portal-btn" data-ecr-portada-copiar>Copiar</button>
        </div>
        <p class="ecr-portada__meta" data-ecr-portada-meta></p>
        <pre class="ecr-portada__prompt" data-ecr-portada-prompt-text></pre>
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
    const select = sec.querySelector('[data-ecr-portada-mundo]');
    const hint = sec.querySelector('[data-ecr-portada-hint]');
    const resultado = sec.querySelector('[data-ecr-portada-resultado]');
    const meta = sec.querySelector('[data-ecr-portada-meta]');
    const promptEl = sec.querySelector('[data-ecr-portada-prompt-text]');
    const btnAuto = sec.querySelector('[data-ecr-portada-auto]');
    const btnCopiar = sec.querySelector('[data-ecr-portada-copiar]');
    const fileInput = sec.querySelector('[data-ecr-portada-archivo]');
    const drop = sec.querySelector('[data-ecr-portada-drop]');
    const fileStatus = sec.querySelector('[data-ecr-portada-file-status]');
    const extractoWrap = sec.querySelector('[data-ecr-portada-extracto-wrap]');
    const extractoEl = sec.querySelector('[data-ecr-portada-extracto]');

    function textoParaSugerir() {
      return [input.value, ultimoTextoArticulo].filter(Boolean).join('\n');
    }

    function refreshHint() {
      const mundo = mundoPorId(select.value);
      hint.textContent = `Mundo ${mundo.id} · ${mundo.nombre}`;
    }

    function aplicarSugerencia() {
      const id = sugerirMundo(textoParaSugerir());
      select.value = id;
      refreshHint();
    }

    function generar(e) {
      if (e) e.preventDefault();
      const titulo = String(input.value || '').trim();
      if (!titulo) {
        if (typeof opts.onError === 'function') opts.onError('Indica el nombre del artículo o carga un PDF/DOCX');
        input.focus();
        return;
      }
      aplicarSugerencia();
      const mundo = mundoPorId(select.value);
      const prompt = armarPrompt(titulo, mundo.id);
      const desdeArchivo = ultimoTextoArticulo ? ' · leído desde archivo' : '';
      meta.textContent = `Artículo: ${titulo} · Mundo ${mundo.id} (${mundo.nombre}) · base ECR sin textos/logos${desdeArchivo}`;
      promptEl.textContent = prompt;
      resultado.hidden = false;
      if (typeof opts.onGenerate === 'function') {
        opts.onGenerate({ titulo, mundoId: mundo.id, prompt, texto: ultimoTextoArticulo });
      }
    }

    async function procesarArchivo(file) {
      if (!file) return;
      fileStatus.textContent = `Leyendo «${file.name}»…`;
      fileStatus.classList.remove('ecr-portada__file-status--error');
      extractoWrap.hidden = true;
      try {
        const texto = await leerArchivoArticulo(file);
        if (!texto || texto.length < 20) {
          throw new Error('No se pudo extraer texto útil del archivo.');
        }
        ultimoTextoArticulo = texto;
        const titulo = inferirTitulo(texto, file.name);
        if (titulo) input.value = titulo;
        aplicarSugerencia();

        const preview = texto.slice(0, 900) + (texto.length > 900 ? '…' : '');
        extractoEl.textContent = preview;
        extractoWrap.hidden = false;
        fileStatus.textContent = `✓ Leído: ${file.name} · ${texto.length.toLocaleString('es-CL')} caracteres${titulo ? ` · título sugerido listo` : ''}`;
        if (typeof opts.onFileLoaded === 'function') {
          opts.onFileLoaded({ file, titulo, texto });
        }
        // Generar de inmediato si ya hay título
        if (titulo) generar();
      } catch (err) {
        console.error(err);
        fileStatus.textContent = err?.message || 'No se pudo leer el archivo';
        fileStatus.classList.add('ecr-portada__file-status--error');
        if (typeof opts.onError === 'function') opts.onError(fileStatus.textContent);
      }
    }

    input.addEventListener('change', aplicarSugerencia);
    input.addEventListener('blur', () => {
      if (input.value.trim()) aplicarSugerencia();
    });
    select.addEventListener('change', refreshHint);
    btnAuto?.addEventListener('click', aplicarSugerencia);
    form?.addEventListener('submit', generar);
    btnCopiar?.addEventListener('click', async () => {
      const text = promptEl.textContent || '';
      try {
        await navigator.clipboard.writeText(text);
        if (typeof opts.onCopy === 'function') opts.onCopy(true);
      } catch {
        if (typeof opts.onCopy === 'function') opts.onCopy(false);
      }
    });

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
      aplicarSugerencia();
    } else {
      select.value = 'F';
      refreshHint();
    }
  };
})();
