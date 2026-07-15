/**
 * Generador de prompt Midjourney — Portada newsletter ECR
 * Flujo: pedir nombre del artículo → elegir mundo visual → unir con BASE guardada → mostrar prompt.
 */
(function () {
  const BASE =
    'Editorial LinkedIn newsletter cover background illustration for ECR Capacitacion brand system, NO text, NO logos, NO letters, NO watermarks, modern corporate flat vector illustration with depth, stylized faceless characters, clean geometric shapes, high-contrast complementary palette of warm orange/amber (#E85D04 family) and deep teal/navy blue, generous negative space for later headline overlay, professional Chilean corporate learning mood, polished editorial composition, wide landscape';

  const FLAGS = '--ar 1.91:1 --style raw --v 6.1 --no text, typography, letters, logo, watermark, signage, UI words, brand marks';

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
    { re: /retail|sala|supermercado|tienda|campaña|punto de venta|tpv/i, id: 'A' },
    { re: /control|industria|monitoreo|tiempo real|operaci[oó]n en vivo/i, id: 'B' },
    { re: /liderazgo|supervisi[oó]n|criterio|decisi[oó]n estrat/i, id: 'C' },
    { re: /data|datos|ciber|digital|tecnolog[ií]a|infraestructura/i, id: 'D' },
    { re: /bodega|stock|inventario|almac[eé]n/i, id: 'E' },
    { re: /terreno|ruta|cobertura|distribuid|m[oó]vil|log[ií]stica|asistencia|ajustar a tiempo|equipos en terreno/i, id: 'F' },
    { re: /automatizaci[oó]n|agv|robot/i, id: 'H' },
    { re: /crecimiento|ambici[oó]n|escala|meta/i, id: 'I' },
    { re: /temporada|verano|playa|costero/i, id: 'J' },
    { re: /oficina|colaboraci[oó]n|rr\.?hh|personas administrativas/i, id: 'K' },
    { re: /urbano|despac|camion|entrega/i, id: 'L' },
    { re: /equipo|staff|dotaci[oó]n|outsourcing|personas/i, id: 'M' },
    { re: /\bia\b|idea|innovaci[oó]n|cerebro/i, id: 'O' },
    { re: /seguridad|trazabilidad|protecci[oó]n/i, id: 'P' }
  ];

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

  function sugerirMundo(titulo) {
    const t = String(titulo || '');
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

  window.ECR_PORTADA_PROMPT = {
    BASE,
    FLAGS,
    MUNDOS,
    sugerirMundo,
    armarPrompt,
    mundoPorId
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
        Escribe el <strong>nombre del artículo</strong>. El sistema une esa temática con la
        <a href="newsletter/BASE-ESTILO-PORTADAS.md" target="_blank" rel="noopener">base de estilo guardada</a>
        y te entrega el prompt listo para Midjourney.
      </p>
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
          <button type="button" class="portal-btn portal-btn--ghost" data-ecr-portada-auto>Auto según título</button>
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

    function refreshHint() {
      const mundo = mundoPorId(select.value);
      hint.textContent = `Mundo ${mundo.id} · ${mundo.nombre}`;
    }

    function aplicarSugerencia() {
      const id = sugerirMundo(input.value);
      select.value = id;
      refreshHint();
    }

    function generar(e) {
      if (e) e.preventDefault();
      const titulo = String(input.value || '').trim();
      if (!titulo) {
        if (typeof opts.onError === 'function') opts.onError('Indica el nombre del artículo');
        input.focus();
        return;
      }
      const mundo = mundoPorId(select.value);
      const prompt = armarPrompt(titulo, mundo.id);
      meta.textContent = `Artículo: ${titulo} · Mundo ${mundo.id} (${mundo.nombre}) · base ECR sin textos/logos`;
      promptEl.textContent = prompt;
      resultado.hidden = false;
      if (typeof opts.onGenerate === 'function') {
        opts.onGenerate({ titulo, mundoId: mundo.id, prompt });
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

    if (opts.tituloInicial) {
      input.value = opts.tituloInicial;
      aplicarSugerencia();
    } else {
      select.value = 'F';
      refreshHint();
    }
  };
})();
