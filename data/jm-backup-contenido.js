/**
 * Contenido importado de joyasmercury-backup → ficha Joyas Mercury.
 * Cargado por app.js y landing JM
 */
window.JM_MANUAL_MARCA = `Manual de marca — Joyas Mercury
Fuente: Manual de marca - Joyas Mercury.pdf (17 páginas)

## Propósito
Este manual reúne las herramientas básicas para el correcto uso y aplicación gráfica de la marca en todas sus posibles expresiones. Pensado para quienes interpretan, articulan, comunican y aplican la marca. El uso consistente refuerza la identidad de Joyas Mercury.

## Logotipo
- Marca: JOYAS MERCURY
- Margen obligatorio: la distancia entre el logo y el siguiente elemento debe ser la cuarta parte (¼) del tamaño del logo.

## Isotipo
- Isotipo: letra «M»
- Mismo margen obligatorio que el logotipo (¼ del tamaño).

## Paleta de colores
- #ECC54A — dorado / amarillo
- #A97E23 — dorado oscuro
- #C88F9C — rosa
- #D8BFB1 — beige / nude
- #C4C4C4 — gris

## Aplicación web (Fase 2 WooCommerce)
- Líneas de producto en filtros: Esencial · Gold · Deluxe
- Usar la paleta en chips de filtro, destacados, botones y componentes del rediseño joyasmercury.cl
- Respetar márgenes del logo e isotipo en headers, favicon y piezas gráficas`;

window.JM_BACKUP_FICHA = {
  version: 6,
  metas: `Etapa 2 — Rediseño joyasmercury.cl
- Navegación limpia y elegante (referencia joyería premium)
- Filtros visuales Esencial / Gold / Deluxe en la misma vista (sin cambiar de página)
- Menú simplificado con colecciones como protagonista
- Productos Destacados dentro de Inicio (no landing aparte)
- Páginas legales, Nosotros, Contacto y carrito con estética de marca
- Entrega Fase 2 + guías para que Camila gestione catálogo sola
- Inversión acordada: $200.000 CLP · plazo 4–5 semanas hábiles`,

  contextoPrompt: `Stack: WordPress + WooCommerce + Astra + Elementor Free + Smart Slider. Fase 2 sin Elementor Pro salvo que la clienta contrate licencia (~$58.000/año).

Colecciones: Esencial · Gold · Deluxe.
Categorías por colección: Aros, Cadenas, Anillos, Pulseras, Conjuntos (15 combinaciones).

Menú objetivo: Inicio (con Destacados) · Colecciones → Esencial/Gold/Deluxe · Historias que Brillan · Mi Cuenta · Contacto · Mi Carrito. Navbar: lupa + carrito. WhatsApp canal principal (icono verde oficial).

Filtros: misma landing, AJAX o plugin (Filter Everything / desarrollo custom). Productos deben estar categorizados y etiquetados antes de verse como referencia Pandora.

Páginas legales: Políticas de compra, Cambios y garantías, Despachos, Cuidados de joyas, Contacto — con redes en páginas de ayuda.

Backup técnico local: C:\\Users\\josef\\joyasmercury-backup (wordpress/, database/, exports/, docs/). Repo privado GitHub: JosefaOgalde/joyasmercury-backup.`,

  contacto: `Cliente: Camila — Joyas Mercury
Canal principal: WhatsApp (icono verde, no personalizar color)
Correo: alternativa secundaria / respaldo WooCommerce en compras
Formulario contacto: no prioritario si no hay capacidad de revisar correos`,

  links: `Sitio en producción: https://joyasmercury.cl
Backup local: C:\\Users\\josef\\joyasmercury-backup
Repo backup (privado): https://github.com/JosefaOgalde/joyasmercury-backup
Inicio v2 (post trabajo): página Inicio v2 · plantilla Elementor «inicio»
Inventario exportado: exports/site-inventory.json`,

  notas: `Etapa 1 ya hecha: Inicio v2 Elementor, landings Esencial/Gold/Deluxe base, Smart Slider, CSS círculos móvil, categoría Esencial parcial (~3 productos).

Pendiente Etapa 2: quitar bloques categorías con conteo, menú definitivo, 15 combinaciones WC, filtros AJAX, destacados en home, legales, carrito visual, pruebas y entrega.

Cabecera Astra: ocultar franja negra móvil (fila «Encima de cabecera»), logo centro, carrito derecha, menú horizontal debajo en desktop.

Preguntas abiertas clienta: cantidad productos a cargar, textos legales, contenido Nosotros, productos destacados iniciales, referencia visual carrito.`,

  seccionesExtra: [
    {
      id: 'jm-sec-requerimientos',
      titulo: 'Requerimientos Etapa 2',
      contenido: `Decisiones confirmadas (Camila):
1. Eliminar bloques de categorías con conteo — el menú es protagonista.
2. Productos Destacados solo en Inicio; clienta necesita capacitación.
3. Filtros en misma vista: Esencial/Gold/Deluxe × Aros/Cadenas/Anillos/Pulseras/Conjuntos.
4. Clienta carga productos primero; luego filtros.
5. Menú: Inicio, Colecciones (3), Historias que Brillan, Mi Cuenta, Contacto, Mi Carrito.
6. Carrito: funcionalidad WC intacta; personalizar parte visual superior.
7. Nosotros + Historias que Brillan (reseñas con el tiempo).
8. Páginas legales + redes en páginas de ayuda.
9. WhatsApp principal; correo secundario.

Flujo usuario: Inicio → Destacados + círculos colección → Landing colección → filtros visuales → producto → carrito → checkout.`
    },
    {
      id: 'jm-sec-cotizacion',
      titulo: 'Cotización Fase 2',
      contenido: `Total desarrollo: $200.000 CLP · 22–25 días hábiles · 4–5 semanas.
Pago: 50% anticipo ($100.000) / 50% entrega ($100.000).
Herramientas gratuitas (Elementor Free + WooCommerce + Astra).

Fases: 1 Menú $20k · 2 Categorías $30k · 3 Filtros $50k · 4 Destacados $25k · 5 Legales $15k · 6 Carrito $25k · 7 Pruebas/entrega $35k.

Opcional carga productos: hasta 20 = $28.000. Elementor Pro opcional ~$58.000/año.
Incluye 15 días soporte post-entrega y guías de catálogo/destacados.`
    },
    {
      id: 'jm-sec-cambios-v2',
      titulo: 'Cambios técnicos v2',
      contenido: `Páginas: Inicio (respaldo), Inicio v2 (trabajo activo), plantillas Elementor «inicio» y «Backup Inicio - Original».

Cambios: sección banners 1920×600 bajo header; quitar metadato Por/fecha; publicar Inicio v2 en Ajustes→Lectura; cabecera Astra 3 filas; categorías GOLD/ESENCIAL/DELUXE círculos (#categorias-destacadas).

Plugins: Elementor, WooCommerce, Astra, WP Bottom Menu, Smart Slider.`
    }
  ],

  documentos: [
    {
      id: 'doc-jm-backup-requerimientos',
      nombre: 'REQUERIMIENTOS-CLIENTE.md (backup)',
      categoria: 'texto',
      notasAnalisis: 'Importado de joyasmercury-backup/docs/',
      extraccionEstado: 'ok',
      extraccionMetodo: 'backup',
      contenidoTexto: `Requerimientos Etapa 2 — joyasmercury.cl — Camila — jun 2026.
Objetivo: e-commerce joyería con filtros visuales en colección, menú limpio, páginas de confianza.
Estructura: 3 colecciones × 5 categorías. Filtros sin recargar página.
Menú sin landings de categorías sueltas ni Destacados como ítem aparte.
WhatsApp principal. Páginas legales listadas. Etapa 1 completada parcialmente con Elementor.`
    },
    {
      id: 'doc-jm-backup-inventario',
      nombre: 'site-inventory.json (backup)',
      categoria: 'texto',
      notasAnalisis: 'Inventario del sitio — exports/',
      extraccionEstado: 'ok',
      extraccionMetodo: 'backup',
      contenidoTexto: `Sitio: joyasmercury.cl · Tema Astra · Elementor · WooCommerce.
Páginas: Inicio (post 4387), Inicio v2, Blog, Contacto, Mi Carrito, Mi Cuenta, Newsletter, Nosotros, Políticas, Checkout, Tienda.
Plantillas Elementor: inicio, Backup Inicio - Original.
Plugins: Elementor, WooCommerce, Astra, WP Bottom Menu.`
    },
    {
      id: 'doc-jm-backup-readme',
      nombre: 'README backup joyasmercury',
      categoria: 'texto',
      notasAnalisis: 'Estructura del respaldo técnico',
      extraccionEstado: 'ok',
      extraccionMetodo: 'backup',
      contenidoTexto: `Carpeta joyasmercury-backup: wordpress/ (archivos sitio), database/ (SQL), exports/ (Elementor, CSS, inventario), docs/ (cambios, requerimientos, cotización), scripts/ (GitHub).
Restaurar: subir wordpress, importar SQL, wp-config en servidor, guardar enlaces permanentes.
No subir wp-config a git. Repo privado GitHub JosefaOgalde/joyasmercury-backup.`
    }
  ],

  wireframes: [
    { grupo: 'Landings referencia · Desktop', carpeta: 'interfaces/referencia-landings', archivo: '01-inicio-referencia.png', titulo: 'Inicio' },
    { grupo: 'Landings referencia · Desktop', carpeta: 'interfaces/referencia-landings', archivo: '02-esencial-referencia.png', titulo: 'Esencial' },
    { grupo: 'Landings referencia · Desktop', carpeta: 'interfaces/referencia-landings', archivo: '03-gold-referencia.png', titulo: 'Gold' },
    { grupo: 'Landings referencia · Desktop', carpeta: 'interfaces/referencia-landings', archivo: '04-deluxe-referencia.png', titulo: 'Deluxe' },
    { grupo: 'Landings referencia · Desktop', carpeta: 'interfaces/referencia-landings', archivo: '05-carrito-referencia.png', titulo: 'Carrito' },
    { grupo: 'Landings referencia · Desktop', carpeta: 'interfaces/referencia-landings', archivo: '06-ayuda-referencia.png', titulo: 'Ayuda' },
    { grupo: 'Landings referencia · Desktop', carpeta: 'interfaces/referencia-landings', archivo: '07-productos-referencia.png', titulo: 'Productos' }
  ]
};

/** Base absoluta de assets JM (evita rutas rotas según desde dónde se abre la ficha) */
window.jmAssetBase = (function jmDetectAssetBase() {
  if (typeof window.JM_ASSET_BASE === 'string' && window.JM_ASSET_BASE) {
    return window.JM_ASSET_BASE.replace(/\/?$/, '/');
  }
  const m = (typeof location !== 'undefined' && location.pathname || '').match(/^(.*\/index\/clientes\/)[^/]+\/?/i);
  if (m) return m[1] + 'joyasmercury/';
  return '/index/clientes/joyasmercury/';
})();

window.jmWireframeSrc = function jmWireframeSrc(carpeta, archivo, opts) {
  const file = `${carpeta}/${archivo}`.replace(/^\/+/, '');
  let url = `${window.jmAssetBase}${file}`;
  if (opts && opts.cacheBust) {
    if (carpeta === 'interfaces/referencia-landings') {
      const v = window.JM_LANDINGS_CARRUSEL_VERSION || 1;
      url += (url.includes('?') ? '&' : '?') + 'v=' + v;
    }
  }
  return url;
};


/** Copia wireframes al objeto ficha (persisten en localStorage al guardar) */
window.asegurarWireframesJM = function asegurarWireframesJM(cli) {
  if (!cli || cli.id !== 'cli-joyas-mercury') return;
  if (!cli.ficha || typeof cli.ficha !== 'object') {
    cli.ficha = { contacto: '', links: '', notas: '', seccionesExtra: [], documentos: [] };
  }
  if (!cli.ficha.landing || typeof cli.ficha.landing !== 'object') {
    cli.ficha.landing = {};
  }
  if (!cli.ficha.landing.imagenesOverrides || typeof cli.ficha.landing.imagenesOverrides !== 'object') {
    cli.ficha.landing.imagenesOverrides = {};
  }
  if (!Array.isArray(cli.ficha.landing.imagenesOcultas)) cli.ficha.landing.imagenesOcultas = [];
  if (!cli.ficha.landing.imagenesMeta || typeof cli.ficha.landing.imagenesMeta !== 'object') {
    cli.ficha.landing.imagenesMeta = {};
  }
  if (!Array.isArray(cli.ficha.landing.imagenes)) cli.ficha.landing.imagenes = [];
  const src = window.JM_BACKUP_FICHA?.wireframes;
  if (!src?.length) return;
  if (!Array.isArray(cli.ficha.wireframes) || !cli.ficha.wireframes.length) {
    cli.ficha.wireframes = src.map(w => ({ ...w }));
  }
};

/** Escapar texto para atributos HTML */
function jmEscapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

/** Clave estable para reemplazo de imagen en localStorage */
function jmImgKeyDePath(carpeta, archivo) {
  const path = carpeta
    ? `${carpeta}/${archivo}`.replace(/\/+/g, '/')
    : String(archivo || '').replace(/^\/+/, '');
  return 'jm:' + path.replace(/^\/+/, '');
}

/** Atributos data-jm-img-* para editor de imágenes */
function jmImgAttrs(carpeta, archivo, src) {
  const key = jmImgKeyDePath(carpeta, archivo);
  return ` data-jm-img-key="${jmEscapeHtml(key)}" data-jm-img-default="${jmEscapeHtml(src)}"`;
}

/** Landings referencia · carrusel ficha (fallback si no hay carrusel.manifest.js) */
if (!window.JM_LANDINGS_CARRUSEL || !window.JM_LANDINGS_CARRUSEL.length) {
  window.JM_LANDINGS_CARRUSEL = [
    { carpeta: 'interfaces/referencia-landings', archivo: '01-inicio-referencia.png', titulo: 'Inicio' },
    { carpeta: 'interfaces/referencia-landings', archivo: '02-esencial-referencia.png', titulo: 'Esencial' },
    { carpeta: 'interfaces/referencia-landings', archivo: '03-gold-referencia.png', titulo: 'Gold' },
    { carpeta: 'interfaces/referencia-landings', archivo: '04-deluxe-referencia.png', titulo: 'Deluxe' },
    { carpeta: 'interfaces/referencia-landings', archivo: '05-carrito-referencia.png', titulo: 'Carrito' },
    { carpeta: 'interfaces/referencia-landings', archivo: '06-ayuda-referencia.png', titulo: 'Ayuda' },
    { carpeta: 'interfaces/referencia-landings', archivo: '07-productos-referencia.png', titulo: 'Productos' }
  ];
}
if (typeof window.JM_LANDINGS_CARRUSEL_VERSION !== 'number') {
  window.JM_LANDINGS_CARRUSEL_VERSION = 1;
}

function jmLandingCarruselSrc(item) {
  if (item?.carpeta && item?.archivo) {
    return jmWireframeSrc(item.carpeta, item.archivo, { cacheBust: true });
  }
  return '';
}

function jmTituloLandingArchivo(archivo) {
  const lower = String(archivo || '').toLowerCase();
  const map = [
    ['inicio', 'Inicio'],
    ['esencial', 'Esencial'],
    ['gold', 'Gold'],
    ['deluxe', 'Deluxe'],
    ['carrito', 'Carrito'],
    ['ayuda', 'Ayuda'],
    ['producto', 'Productos']
  ];
  for (const [clave, titulo] of map) {
    if (lower.includes(clave)) return titulo;
  }
  return String(archivo || '')
    .replace(/\.png$/i, '')
    .replace(/^\d+[-_]/, '')
    .replace(/-referencia/gi, '')
    .replace(/[-_]/g, ' ')
    .trim() || archivo;
}

/** Escanea el listado HTML del directorio (npx serve) y detecta todos los PNG */
window.jmCargarLandingsCarruselDesdeDirectorio = function jmCargarLandingsCarruselDesdeDirectorio() {
  const base = window.jmAssetBase || '/index/clientes/joyasmercury/';
  const dirUrl = base + 'interfaces/referencia-landings/?t=' + Date.now();
  return fetch(dirUrl, { cache: 'no-store' })
    .then((res) => (res.ok ? res.text() : ''))
    .then((html) => {
      if (!html || !/\.png/i.test(html)) return false;
      const pngs = [...new Set(
        [...html.matchAll(/href="([^"?]+\.png)"/gi)]
          .map((m) => decodeURIComponent(m[1].split('/').pop() || ''))
          .filter((name) => name && !name.includes('..'))
      )].sort();
      if (!pngs.length) return false;
      window.JM_LANDINGS_CARRUSEL = pngs.map((archivo) => ({
        carpeta: 'interfaces/referencia-landings',
        archivo,
        titulo: jmTituloLandingArchivo(archivo)
      }));
      window.JM_LANDINGS_CARRUSEL_VERSION = (window.JM_LANDINGS_CARRUSEL_VERSION || 0) + 1;
      return true;
    })
    .catch(() => false);
};

/** Actualiza carrusel: 1) escanea carpeta PNG  2) carrusel.json  3) manifest.js */
window.jmActualizarLandingsCarrusel = function jmActualizarLandingsCarrusel() {
  const cargarDir = typeof window.jmCargarLandingsCarruselDesdeDirectorio === 'function'
    ? window.jmCargarLandingsCarruselDesdeDirectorio()
    : Promise.resolve(false);

  return cargarDir.then((okDir) => {
    if (okDir) return true;
    const base = window.jmAssetBase || '/index/clientes/joyasmercury/';
    const url = base + 'interfaces/referencia-landings/carrusel.json?t=' + Date.now();
    return fetch(url, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.items) && data.items.length) {
          window.JM_LANDINGS_CARRUSEL = data.items;
          if (typeof data.version === 'number') {
            window.JM_LANDINGS_CARRUSEL_VERSION = data.version;
          }
          return true;
        }
        return !!(window.JM_LANDINGS_CARRUSEL && window.JM_LANDINGS_CARRUSEL.length);
      })
      .catch(() => !!(window.JM_LANDINGS_CARRUSEL && window.JM_LANDINGS_CARRUSEL.length));
  });
};

/** @deprecated usar jmActualizarLandingsCarrusel */
window.jmCargarLandingsCarruselDesdeJson = window.jmActualizarLandingsCarrusel;

window.jmLandingsCarruselReady = window.jmActualizarLandingsCarrusel();


/** HTML carrusel landings referencia (desktop o móvil) */
function jmHtmlLandingsCarruselBlock(items, opts) {
  if (!items.length) return '';
  const o = opts || {};
  const ordenTitulos = items.map((w) => w.titulo).join(' → ');
  const grupo = o.grupo || 'landings';
  const claseExtra = o.claseExtra || '';

  const cards = items.map((w, i) => {
    const src = jmLandingCarruselSrc(w);
    const activa = i === 0 ? ' jm-interfaces__card--activa' : '';
    return `<figure class="jm-interfaces__card${activa}" data-jm-int-index="${i}" data-jm-int-src="${jmEscapeHtml(src)}" data-jm-int-titulo="${jmEscapeHtml(w.titulo)}" data-jm-int-grupo="${jmEscapeHtml(grupo)}">
      <button type="button" class="jm-interfaces__card-btn" title="${jmEscapeHtml(w.titulo)}">
        <img src="${src}" alt="${jmEscapeHtml(w.titulo)}"${jmImgAttrs(w.carpeta, w.archivo, src)} loading="${i === 0 ? 'eager' : 'lazy'}">
      </button>
      <figcaption>${jmEscapeHtml(w.titulo)}<span class="jm-interfaces__archivo jm-solo-edicion">${jmEscapeHtml(w.archivo)}</span></figcaption>
    </figure>`;
  }).join('');

  const primera = items[0];
  const visorSrc = jmLandingCarruselSrc(primera);
  const wireframeLink = o.wireframeLink
    ? o.wireframeLink
    : (o.wireframeReadme
      ? `<p class="jm-interfaces__wireframe-link"><a href="${jmEscapeHtml(o.wireframeReadme)}" target="_blank" rel="noopener">${jmEscapeHtml(o.wireframeLinkText || 'Abrir wireframes interactivos →')}</a></p>`
      : '');

  return `<div class="jm-interfaces jm-interfaces--landings-ref ${claseExtra}" data-jm-interfaces tabindex="0" aria-label="${jmEscapeHtml(o.ariaLabel || o.titulo || 'Landings referencia')}">
    <div class="jm-interfaces__head">
      <h4 class="jm-interfaces__titulo-seccion">${jmEscapeHtml(o.titulo || 'Landings referencia')}</h4>
      <p class="jm-interfaces__intro">${items.length} capturas · orden: <strong>${jmEscapeHtml(ordenTitulos)}</strong> · clic en miniatura o flechas.${o.introExtra ? ' ' + o.introExtra : ''}</p>
      ${wireframeLink}
      <p class="jm-interfaces__hint-reemplazo jm-solo-vista">Puedes reemplazar cada una por tu diseño actualizado. Pulsa <button type="button" class="jm-interfaces__link-editar" data-jm-activar-edicion-imagenes>Editar datos</button> arriba a la derecha.</p>
      <p class="jm-interfaces__hint-reemplazo jm-interfaces__hint-reemplazo--activo jm-solo-edicion">Imagen activa: usa <strong>Cambiar imagen</strong> en el recuadro de abajo o en cada miniatura.</p>
    </div>
    <div class="jm-interfaces__visor" data-jm-int-visor>
      <a href="${jmEscapeHtml(visorSrc)}" target="_blank" rel="noopener" class="jm-interfaces__visor-link" title="Abrir en tamaño completo">
        <img class="jm-interfaces__visor-img" src="${jmEscapeHtml(visorSrc)}" alt="${jmEscapeHtml(primera.titulo)}"${jmImgAttrs(primera.carpeta, primera.archivo, visorSrc)} data-jm-int-visor-img>
      </a>
      <div class="jm-interfaces__visor-pie">
        <div class="jm-interfaces__visor-meta">
          <strong class="jm-interfaces__visor-caption" data-jm-int-visor-caption>${jmEscapeHtml(primera.titulo)}</strong>
        </div>
        <div class="jm-interfaces__visor-nav">
          <button type="button" class="jm-interfaces__flecha" data-jm-int-prev aria-label="Imagen anterior">‹</button>
          <span class="jm-interfaces__contador" data-jm-int-contador>1 / ${items.length}</span>
          <button type="button" class="jm-interfaces__flecha" data-jm-int-next aria-label="Imagen siguiente">›</button>
        </div>
      </div>
      <div class="jm-interfaces__visor-edit jm-solo-edicion" data-jm-int-visor-edit aria-live="polite">
        <p class="jm-interfaces__visor-edit-label">Reemplazar esta captura</p>
      </div>
    </div>
    <div class="jm-interfaces__grid" data-jm-int-grid>${cards}</div>
  </div>`;
}

function jmHtmlLandingsCarrusel() {
  const desktop = window.JM_LANDINGS_CARRUSEL || [];
  if (!desktop.length) return '';
  return jmHtmlLandingsCarruselBlock(desktop, {
    titulo: 'Wireframes · Desktop',
    ariaLabel: 'Wireframes desktop Joyas Mercury',
    grupo: 'landings-desktop',
    claseExtra: 'jm-interfaces--landings-ref-desktop',
    introExtra: '7 pantallas · vista desktop.',
  });
}

/** HTML carrusel interfaces (auditoría + estado actual) con miniaturas — legacy */
function jmHtmlInterfacesCarrusel(wf) {
  const items = (wf || []).filter(w => w.carpeta === 'interfaces');
  if (!items.length) return '';
  const grupos = [];
  items.forEach(item => { if (!grupos.includes(item.grupo)) grupos.push(item.grupo); });

  const cards = items.map((w, i) => {
    const src = jmWireframeSrc(w.carpeta, w.archivo);
    const activa = i === 0 ? ' jm-interfaces__card--activa' : '';
    const gid = (w.grupo || '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    return `<figure class="jm-interfaces__card${activa}" data-jm-int-index="${i}" data-jm-int-src="${jmEscapeHtml(src)}" data-jm-int-titulo="${jmEscapeHtml(w.titulo)}" data-jm-int-grupo="${jmEscapeHtml(w.grupo || '')}">
      <button type="button" class="jm-interfaces__card-btn" title="${jmEscapeHtml(w.titulo)}">
        <img src="${src}" alt="${jmEscapeHtml(w.titulo)}"${jmImgAttrs(w.carpeta, w.archivo, src)} loading="${i < 4 ? 'eager' : 'lazy'}">
      </button>
      <figcaption>
        <span class="jm-interfaces__card-grupo">${jmEscapeHtml(w.grupo || 'Interfaces')}</span>
        ${jmEscapeHtml(w.titulo)}
      </figcaption>
    </figure>`;
  }).join('');

  const filtros = `<button type="button" class="jm-interfaces__filtro is-active" data-jm-int-filtro="all">Todas · ${items.length}</button>`
    + grupos.map(g => {
      const n = items.filter(w => w.grupo === g).length;
      return `<button type="button" class="jm-interfaces__filtro" data-jm-int-filtro="${jmEscapeHtml(g)}">${jmEscapeHtml(g)} · ${n}</button>`;
    }).join('');

  const primera = items[0];
  const visorSrc = jmWireframeSrc(primera.carpeta, primera.archivo);

  return `<div class="jm-interfaces" data-jm-interfaces tabindex="0" aria-label="Inventario interfaces joyasmercury.cl">
    <div class="jm-interfaces__head">
      <h4 class="jm-interfaces__titulo-seccion">Interfaces · inventario del sitio</h4>
      <p class="jm-interfaces__intro">Capturas de la carpeta <code>interfaces/</code> — auditoría técnica y estado actual en producción. Clic en miniatura o flechas del carrusel.</p>
    </div>
    <div class="jm-interfaces__filtros" role="tablist">${filtros}</div>
    <div class="jm-interfaces__visor" data-jm-int-visor>
      <a href="${jmEscapeHtml(visorSrc)}" target="_blank" rel="noopener" class="jm-interfaces__visor-link" title="Abrir en tamaño completo">
        <img class="jm-interfaces__visor-img" src="${jmEscapeHtml(visorSrc)}" alt="${jmEscapeHtml(primera.titulo)}" data-jm-int-visor-img>
      </a>
      <div class="jm-interfaces__visor-pie">
        <div class="jm-interfaces__visor-meta">
          <strong class="jm-interfaces__visor-caption" data-jm-int-visor-caption>${jmEscapeHtml(primera.titulo)}</strong>
          <span class="jm-interfaces__visor-grupo" data-jm-int-visor-grupo>${jmEscapeHtml(primera.grupo || '')}</span>
        </div>
        <div class="jm-interfaces__visor-nav">
          <button type="button" class="jm-interfaces__flecha" data-jm-int-prev aria-label="Imagen anterior">‹</button>
          <span class="jm-interfaces__contador" data-jm-int-contador>1 / ${items.length}</span>
          <button type="button" class="jm-interfaces__flecha" data-jm-int-next aria-label="Imagen siguiente">›</button>
        </div>
      </div>
    </div>
    <div class="jm-interfaces__grid" data-jm-int-grid>${cards}</div>
  </div>`;
}

/** HTML carrusel con flechas y clic izquierda/derecha */
function jmHtmlGaleriaWireframes(grupo, items) {
  if (!items.length) return '';
  const slides = items.map((w, i) => {
    const src = jmWireframeSrc(w.carpeta, w.archivo);
    const titulo = jmEscapeHtml(w.titulo);
    return `<figure class="jm-galeria__slide${i === 0 ? ' jm-galeria__slide--activa' : ''}" data-index="${i}">
      <a href="${src}" target="_blank" rel="noopener" class="jm-galeria__link" title="Abrir ${titulo} en tamaño completo">
        <img src="${src}" alt="${titulo}"${jmImgAttrs(w.carpeta, w.archivo, src)} loading="${i === 0 ? 'eager' : 'lazy'}">
      </a>
    </figure>`;
  }).join('');
  const gid = 'jm-galeria-' + grupo.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  return `<div class="jm-galeria" id="${gid}" data-jm-galeria tabindex="0" role="region" aria-label="${jmEscapeHtml(grupo)}">
    <h4 class="ficha-wireframes__sub">${jmEscapeHtml(grupo)}</h4>
    <p class="jm-galeria__hint">Flechas o clic en el <strong>lado izquierdo / derecho</strong> de la imagen para recorrer el sitio · ${items.length} pantallas</p>
    <div class="jm-galeria__viewport">
      <button type="button" class="jm-galeria__flecha jm-galeria__flecha--izq" aria-label="Pantalla anterior">‹</button>
      <div class="jm-galeria__stage">
        <div class="jm-galeria__slides">${slides}</div>
        <button type="button" class="jm-galeria__zona jm-galeria__zona--izq" aria-label="Anterior"></button>
        <button type="button" class="jm-galeria__zona jm-galeria__zona--der" aria-label="Siguiente"></button>
      </div>
      <button type="button" class="jm-galeria__flecha jm-galeria__flecha--der" aria-label="Pantalla siguiente">›</button>
    </div>
    <div class="jm-galeria__pie">
      <strong class="jm-galeria__titulo">${jmEscapeHtml(items[0].titulo)}</strong>
      <span class="jm-galeria__contador">1 / ${items.length}</span>
    </div>
  </div>`;
}

/** Fases Gantt Fase 2 (días hábiles acumulados) */
window.JM_GANTT_FASES = [
  { id: 1, nombre: 'Menú y limpieza', dias: 3, inicio: 0, monto: '$20.000' },
  { id: 2, nombre: 'Categorías WC', dias: 3, inicio: 3, monto: '$30.000' },
  { id: 3, nombre: 'Filtros visuales', dias: 7, inicio: 6, monto: '$50.000' },
  { id: 4, nombre: 'Destacados', dias: 2, inicio: 13, monto: '$25.000' },
  { id: 5, nombre: 'Legales y contenidos', dias: 2, inicio: 15, monto: '$15.000' },
  { id: 6, nombre: 'Carrito', dias: 3, inicio: 17, monto: '$25.000' },
  { id: 7, nombre: 'Pruebas y entrega', dias: 5, inicio: 20, monto: '$35.000' }
];

/** Objetivos estructurados Fase 2 */
window.JM_OBJETIVOS = {
  general: 'Rediseñar joyasmercury.cl (Fase 2) con navegación limpia tipo joyería premium, filtros Esencial/Gold/Deluxe en la misma vista, menú con colecciones como protagonista, destacados en Inicio, páginas legales y carrito alineados a la marca — entrega en 22–25 días hábiles.',
  especificos: [
    'Eliminar bloques de categorías con conteo; el menú es protagonista.',
    'Productos Destacados solo en Inicio (con capacitación para Camila).',
    'Filtros en misma landing: 3 colecciones × 5 categorías (15 combinaciones), sin recargar página.',
    'Menú objetivo: Inicio → Novedades · Colecciones (Esencial/Gold/Deluxe × 5 categorías) · Últimas unidades · Mi Carrito.',
    'Carrito WooCommerce funcional con personalización visual superior.',
    'Páginas legales + Nosotros + WhatsApp como canal principal.',
    'Pruebas integrales, guías de catálogo y entrega con soporte post-entrega.'
  ]
};

/** Inicio calendario JM — tarea 1 = este día */
window.JM_CALENDARIO_INICIO = '2026-06-23';
window.JM_CLI_SYNC_ID = 'cli-joyas-mercury';

/** Checklist Fase 2 — 20 tareas · 1 por día · sincronizado con el organizador */
window.JM_TODO_SEED = [
  { id: 'jm-todo-01', titulo: 'Auditoría menú actual + mapa de navegación', dias: '1', fase: 1, completada: false, notas: 'Etapa 1 · Inventario menú desktop/móvil y mapa de navegación propuesto.' },
  { id: 'jm-todo-02', titulo: 'Implementar menú limpio (desktop + móvil)', dias: '2', fase: 1, completada: false, notas: 'Etapa 1 · Menú limpio con colecciones como eje principal.' },
  { id: 'jm-todo-03', titulo: 'Menú objetivo (paso 4) + mapa de navegación (paso 5)', dias: '3', fase: 1, completada: false, notas: 'Estructura acordada: Inicio, Colecciones, Últimas unidades, Mi Carrito + rutas.' },
  { id: 'jm-todo-04', titulo: '3 colecciones × 5 categorías en WooCommerce', dias: '4', fase: 2, completada: false, notas: 'Etapa 2 · Esencial, Gold y Deluxe con Aros, Cadenas, Anillos, Pulseras, Conjuntos.' },
  { id: 'jm-todo-05', titulo: 'Validar URLs y slugs de colecciones', dias: '5', fase: 2, completada: false, notas: 'Probar las 15 combinaciones colección/categoría.' },
  { id: 'jm-todo-06', titulo: 'Diseñar chips filtro Esencial / Gold / Deluxe', dias: '6', fase: 3, completada: false, notas: 'Etapa 3 · Filtros visuales en la misma landing.' },
  { id: 'jm-todo-07', titulo: 'Landings colección · layout y estructura', dias: '7', fase: 3, completada: false, notas: 'Maquetación base de las 3 landings de colección.' },
  { id: 'jm-todo-08', titulo: 'Filtrado AJAX sin recargar página', dias: '8', fase: 3, completada: false, notas: 'Filtros activos, estados y UX en misma vista.' },
  { id: 'jm-todo-09', titulo: 'QA filtros (mobile, UX y rendimiento)', dias: '9', fase: 3, completada: false, notas: 'Pruebas mobile, touch, estados activos y rendimiento.' },
  { id: 'jm-todo-10', titulo: 'Destacados / Novedades en Inicio', dias: '10', fase: 4, completada: false, notas: 'Etapa 4 · Bloque en home para productos destacados.' },
  { id: 'jm-todo-11', titulo: 'Guía para Camila · gestionar destacados', dias: '11', fase: 4, completada: false, notas: 'Documentar cómo marcar/desmarcar destacados.' },
  { id: 'jm-todo-12', titulo: 'Últimas unidades + páginas legales', dias: '12', fase: 5, completada: false, notas: 'Etapa 5 · Stock limitado, políticas, despachos y garantías.' },
  { id: 'jm-todo-13', titulo: 'Nosotros + WhatsApp canal principal', dias: '13', fase: 5, completada: false, notas: 'Página Nosotros y botón WhatsApp oficial.' },
  { id: 'jm-todo-14', titulo: 'Maquetación carrito · parte visual superior', dias: '14', fase: 6, completada: false, notas: 'Etapa 6 · Carrito alineado al rediseño de la tienda.' },
  { id: 'jm-todo-15', titulo: 'Carrito · pruebas checkout WooCommerce', dias: '15', fase: 6, completada: false, notas: 'Checkout, totales, envío y flujo de compra.' },
  { id: 'jm-todo-16', titulo: 'Pruebas integrales del sitio', dias: '16', fase: 7, completada: false, notas: 'Etapa 7 · Recorrido menú → filtros → destacados → legales → carrito.' },
  { id: 'jm-todo-17', titulo: 'Corrección de bugs y refinamiento', dias: '17', fase: 7, completada: false, notas: 'Resolver issues detectados en pruebas.' },
  { id: 'jm-todo-18', titulo: 'Guías de catálogo y documentación', dias: '18', fase: 7, completada: false, notas: 'Guía para que Camila gestione catálogo y colecciones.' },
  { id: 'jm-todo-19', titulo: 'Revisión con Camila + ajustes finales', dias: '19', fase: 7, completada: false, notas: 'Sesión de revisión y últimos ajustes.' },
  { id: 'jm-todo-20', titulo: 'Entrega Fase 2 + soporte post-entrega', dias: '20', fase: 7, completada: false, notas: 'Entrega oficial joyasmercury.cl · inicio ventana 10 días de soporte.' }
];

/** Progreso confirmado en repo → se fusiona al cargar (checklist + calendario) */
window.JM_TODO_PROGRESO = {
  'jm-todo-01': { completada: true },
  'jm-todo-03': { completada: true },
  'jm-todo-04': { completada: true }
};

/** Ítems de sesión en checklist landing (sin tarea en calendario) */
window.JM_TODO_EXTRA = [
  {
    id: 'jm-sesion-01-carrusel-desktop',
    titulo: 'Validar carrusel referencia desktop (7 pantallas)',
    dias: 'hoy',
    fase: 0,
    completada: true,
    comentario: 'OK · Inicio, Esencial, Gold, Deluxe, Carrito, Ayuda, Productos.',
    sinCalendario: true
  }
];

/** Marca completadas las tareas del plan JM según JM_TODO_PROGRESO */
window.jmAplicarProgresoChecklist = function jmAplicarProgresoChecklist(data) {
  const prog = window.JM_TODO_PROGRESO;
  if (!prog || !data?.clientes) return data;
  const cli = data.clientes.find((c) => c.id === window.JM_CLI_SYNC_ID);
  if (!cli?.ficha?.landing) return data;
  if (!Array.isArray(cli.ficha.landing.todos)) {
    cli.ficha.landing.todos = (window.JM_TODO_SEED || []).map((t) => ({
      ...t,
      comentario: t.comentario || ''
    }));
  }
  Object.entries(prog).forEach(([todoId, patch]) => {
    const todo = cli.ficha.landing.todos.find((x) => x.id === todoId);
    if (todo && patch.completada) {
      todo.completada = true;
      if (patch.comentario) todo.comentario = patch.comentario;
    }
    if (data.tareas) {
      const tarea = data.tareas.find((t) => t.jmTodoId === todoId);
      if (tarea && patch.completada) {
        tarea.completada = true;
        if (patch.comentario) tarea.notas = patch.comentario;
      }
    }
  });
  return data;
};

/** Agrega ítems de sesión al checklist de la landing */
window.jmFusionarTodosExtra = function jmFusionarTodosExtra(data) {
  const extras = window.JM_TODO_EXTRA;
  if (!extras?.length || !data?.clientes) return data;
  const cli = data.clientes.find((c) => c.id === window.JM_CLI_SYNC_ID);
  if (!cli?.ficha) return data;
  if (!cli.ficha.landing) cli.ficha.landing = {};
  if (!Array.isArray(cli.ficha.landing.todos)) {
    cli.ficha.landing.todos = (window.JM_TODO_SEED || []).map((t) => ({
      ...t,
      comentario: t.comentario || ''
    }));
  }
  extras.forEach((extra) => {
    const todo = cli.ficha.landing.todos.find((x) => x.id === extra.id);
    if (!todo) {
      cli.ficha.landing.todos.push({ ...extra });
    } else {
      Object.assign(todo, extra);
    }
  });
  return data;
};

/** Asegura tareas JM en datos (landing sin abrir organizador) */
window.jmAsegurarDatosMinimos = function jmAsegurarDatosMinimos(data) {
  if (!data || typeof data !== 'object') return data;
  if (!Array.isArray(data.tareas)) data.tareas = [];
  if (!Array.isArray(data.clientes)) data.clientes = [];
  const seeds = window.JM_TODO_SEED || [];
  const inicio = window.JM_CALENDARIO_INICIO || '2026-06-23';
  seeds.forEach((todo, indice) => {
    const id = window.jmTareaCalendarioId(indice);
    const d = new Date(`${inicio}T12:00:00`);
    d.setDate(d.getDate() + indice);
    const fecha = d.toISOString().slice(0, 10);
    const titulo = window.jmTituloCalendario(todo);
    let t = data.tareas.find((x) => x.id === id);
    if (!t) {
      data.tareas.push({
        id,
        titulo,
        clienteId: window.JM_CLI_SYNC_ID,
        rolId: 'rol-jm-dev',
        fecha,
        horaInicio: '09:00',
        horaFin: '12:00',
        notas: todo.notas || '',
        prioridad: 'alta',
        completada: !!todo.completada,
        pendiente: false,
        jmTodoId: todo.id,
        jmChecklistDia: todo.dias
      });
    } else {
      t.jmTodoId = todo.id;
      t.clienteId = window.JM_CLI_SYNC_ID;
      if (!t.fecha) t.fecha = fecha;
    }
  });
  if (typeof window.jmAplicarProgresoChecklist === 'function') window.jmAplicarProgresoChecklist(data);
  if (typeof window.jmFusionarTodosExtra === 'function') window.jmFusionarTodosExtra(data);
  window.jmSyncLandingDesdeTareas(data);
  return data;
};

/** Sincroniza checklist ← tareas del organizador (completada + notas) */
window.jmSyncLandingDesdeTareas = function jmSyncLandingDesdeTareas(data) {
  if (!data?.clientes || !data?.tareas) return data;
  const cli = data.clientes.find((c) => c.id === window.JM_CLI_SYNC_ID);
  const todos = cli?.ficha?.landing?.todos;
  if (!Array.isArray(todos)) return data;
  data.tareas.forEach((t) => {
    if (t.clienteId !== window.JM_CLI_SYNC_ID || !t.jmTodoId) return;
    const todo = todos.find((x) => x.id === t.jmTodoId);
    if (!todo) return;
    todo.completada = !!t.completada;
    const notas = (t.notas || '').trim();
    todo.comentario = notas;
  });
  return data;
};

/** Sincroniza tareas del organizador ← checklist (completada + comentario → notas) */
window.jmSyncTareasDesdeLanding = function jmSyncTareasDesdeLanding(data) {
  if (!data?.clientes || !data?.tareas) return data;
  const cli = data.clientes.find((c) => c.id === window.JM_CLI_SYNC_ID);
  const todos = cli?.ficha?.landing?.todos;
  if (!Array.isArray(todos)) return data;
  todos.forEach((todo) => {
    const t = data.tareas.find((x) => x.jmTodoId === todo.id);
    if (!t) return;
    t.completada = !!todo.completada;
    const com = (todo.comentario || '').trim();
    t.notas = com || undefined;
  });
  return data;
};

/** ID de tarea calendario para índice 0-based del checklist */
window.jmTareaCalendarioId = function jmTareaCalendarioId(indice) {
  return `tarea-jm-f2-${String(indice + 1).padStart(2, '0')}`;
};

/** Título corto para el calendario */
window.jmTituloCalendario = function jmTituloCalendario(todo) {
  return `[JM] D${todo.dias} — ${todo.titulo}`;
};

/** Categorías por colección */
window.JM_CATEGORIAS_MENU = ['Aros', 'Cadenas', 'Anillos', 'Pulseras', 'Conjuntos'];

/** Menú objetivo Fase 2 — Paso 4 */
window.JM_MENU_OBJETIVO = {
  titulo: 'Menú',
  inicio: {
    titulo: 'Inicio',
    hijos: [
      { titulo: 'Novedades' },
      {
        titulo: 'Colecciones',
        colecciones: [
          { nombre: 'Esencial', categorias: ['Aros', 'Cadenas', 'Anillos', 'Pulseras', 'Conjuntos'] },
          { nombre: 'Gold', categorias: ['Aros', 'Cadenas', 'Anillos', 'Pulseras', 'Conjuntos'] },
          { nombre: 'Deluxe', categorias: ['Aros', 'Cadenas', 'Anillos', 'Pulseras', 'Conjuntos'] }
        ]
      },
      { titulo: 'Últimas unidades' },
      { titulo: 'Mi Carrito' }
    ]
  }
};

/** Rutas del mapa de navegación — derivadas del menú (Paso 5) */
window.JM_MAPA_NAVEGACION = (function () {
  const menu = window.JM_MENU_OBJETIVO;
  const rutas = [{ nivel: 0, ruta: 'Inicio', detalle: 'Home joyasmercury.cl' }];
  (menu.inicio.hijos || []).forEach((item) => {
    if (item.titulo === 'Novedades') {
      rutas.push({ nivel: 1, ruta: 'Inicio → Novedades', detalle: 'Productos nuevos / destacados recientes' });
    } else if (item.titulo === 'Últimas unidades') {
      rutas.push({ nivel: 1, ruta: 'Inicio → Últimas unidades', detalle: 'Stock limitado' });
    } else if (item.titulo === 'Mi Carrito') {
      rutas.push({ nivel: 1, ruta: 'Inicio → Mi Carrito', detalle: 'Checkout WooCommerce' });
    } else if (item.colecciones) {
      item.colecciones.forEach((col) => {
        rutas.push({ nivel: 1, ruta: `Inicio → Colecciones → ${col.nombre}`, detalle: 'Landing de colección' });
        (col.categorias || []).forEach((cat) => {
          rutas.push({
            nivel: 2,
            ruta: `Inicio → Colecciones → ${col.nombre} → ${cat}`,
            detalle: 'Filtro / categoría en misma vista'
          });
        });
      });
    }
  });
  return rutas;
})();

/** Resumen breve identidad (landing) */
window.JM_IDENTIDAD_RESUMEN = 'La identidad de Joyas Mercury exige uso consistente del logotipo JOYAS MERCURY, isotipo «M» con márgenes de ¼, y paleta dorado (#ECC54A, #A97E23), rosa (#C88F9C), nude (#D8BFB1) y gris (#C4C4C4). En Fase 2 aplicamos estos tokens en filtros Esencial/Gold/Deluxe, destacados, botones y cabecera del e-commerce.';

/** Galería HTML wireframes JM — solo desktop referencia */
window.jmHtmlWireframes = function jmHtmlWireframes(opts) {
  const claseExtra = (opts && opts.claseExtra) || '';
  const cuerpo = jmHtmlLandingsCarrusel();
  if (!cuerpo) return '';
  const atajos = `<p class="ficha-wireframes__atajos"><a href="wireframes.html">Wireframes pantalla completa</a></p>`;
  return `<section id="ficha-wireframes-jm" class="ficha-seccion ficha-seccion--wireframes ${claseExtra}">
    <div class="ficha-seccion__headline">
      <h3 class="ficha-seccion__titulo">Wireframes · Desktop</h3>
      <span class="ficha-seccion__estado">joyasmercury.cl · Fase 2</span>
    </div>
    <p class="ficha-wireframes__intro">7 pantallas de referencia en desktop: Inicio, Esencial, Gold, Deluxe, Carrito, Ayuda y Productos.</p>
    ${atajos}
    ${cuerpo}
  </section>`;
};
/** Inicializa carrusel interfaces (miniaturas + visor) */
window.initJMInterfacesUI = function initJMInterfacesUI(root) {
  const scope = root && root.querySelectorAll ? root : document;
  scope.querySelectorAll('[data-jm-interfaces]').forEach((sec) => {
    if (sec.dataset.jmInterfacesBound === '1') return;
    sec.dataset.jmInterfacesBound = '1';

    const visorImg = sec.querySelector('[data-jm-int-visor-img]');
    const visorCap = sec.querySelector('[data-jm-int-visor-caption]');
    const visorGrupo = sec.querySelector('[data-jm-int-visor-grupo]');
    const visorLink = sec.querySelector('.jm-interfaces__visor-link');
    const contadorEl = sec.querySelector('[data-jm-int-contador]');
    const cards = [...sec.querySelectorAll('.jm-interfaces__card')];
    let filtro = 'all';

    function actualizarVisor(card) {
      if (!card) return;
      const img = card.querySelector('img[data-jm-img-key]');
      const src = card.dataset.jmIntSrc || '';
      const titulo = card.dataset.jmIntTitulo || '';
      const grupo = card.dataset.jmIntGrupo || '';
      if (visorImg && src) {
        visorImg.src = src;
        visorImg.alt = titulo;
        if (img?.dataset.jmImgKey) {
          visorImg.dataset.jmImgKey = img.dataset.jmImgKey;
          visorImg.dataset.jmImgDefault = img.dataset.jmImgDefault || '';
        }
      }
      if (visorCap) visorCap.textContent = titulo;
      if (visorGrupo) visorGrupo.textContent = grupo;
      if (visorLink && src) visorLink.href = src;
      cards.forEach(c => c.classList.remove('jm-interfaces__card--activa'));
      card.classList.add('jm-interfaces__card--activa');
      const vis = cardsVisibles();
      const i = vis.indexOf(card);
      if (contadorEl && i >= 0) contadorEl.textContent = `${i + 1} / ${vis.length}`;
      if (typeof window.jmSyncVisorEditBar === 'function') window.jmSyncVisorEditBar(sec);
    }

    function cardsVisibles() {
      return cards.filter(c => filtro === 'all' || c.dataset.jmIntGrupo === filtro);
    }

    function idxActivo() {
      return cardsVisibles().findIndex(c => c.classList.contains('jm-interfaces__card--activa'));
    }

    function ir(delta) {
      const vis = cardsVisibles();
      if (!vis.length) return;
      let i = idxActivo();
      if (i < 0) i = 0;
      i = (i + delta + vis.length) % vis.length;
      actualizarVisor(vis[i]);
    }

    cards.forEach(card => {
      card.querySelector('.jm-interfaces__card-btn')?.addEventListener('click', () => actualizarVisor(card));
    });

    sec.querySelector('[data-jm-int-prev]')?.addEventListener('click', () => ir(-1));
    sec.querySelector('[data-jm-int-next]')?.addEventListener('click', () => ir(1));

    sec.querySelectorAll('[data-jm-int-filtro]').forEach(btn => {
      btn.addEventListener('click', () => {
        filtro = btn.dataset.jmIntFiltro || 'all';
        sec.querySelectorAll('.jm-interfaces__filtro').forEach(b => {
          b.classList.toggle('is-active', b.dataset.jmIntFiltro === filtro);
        });
        cards.forEach(c => {
          const show = filtro === 'all' || c.dataset.jmIntGrupo === filtro;
          c.classList.toggle('jm-interfaces__card--oculta', !show);
        });
        const vis = cardsVisibles();
        actualizarVisor(vis[0] || null);
      });
    });

    sec.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); ir(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); ir(1); }
    });
  });
};

/** Inicializa carrusel wireframes desktop JM */
window.initJMWireframesUI = function initJMWireframesUI(root) {
  if (typeof window.initJMInterfacesUI === 'function') window.initJMInterfacesUI(root);
};

/** Aplica reemplazos guardados y, en modo edición, permite cambiar imágenes del prototipo */
window.initJMImagenesEditorUI = function initJMImagenesEditorUI(root, opts) {
  opts = opts || {};
  const overrides = opts.imagenesOverrides && typeof opts.imagenesOverrides === 'object'
    ? opts.imagenesOverrides
    : {};
  const ocultas = Array.isArray(opts.imagenesOcultas) ? opts.imagenesOcultas : [];
  const meta = opts.imagenesMeta && typeof opts.imagenesMeta === 'object' ? opts.imagenesMeta : {};
  const onChange = typeof opts.onChange === 'function' ? opts.onChange : null;
  const onError = typeof opts.onError === 'function' ? opts.onError : null;
  const maxBytes = opts.maxBytes || 700 * 1024;
  const scope = root && root.querySelectorAll ? root : document;

  function emitChange() {
    if (!onChange) return;
    onChange({
      imagenesOverrides: { ...overrides },
      imagenesOcultas: [...ocultas],
      imagenesMeta: { ...meta }
    });
  }

  function syncParentLinks(img, src) {
    const card = img.closest('[data-jm-int-src], [data-jm-nuevo-src]');
    if (card) {
      if ('jmIntSrc' in card.dataset) card.dataset.jmIntSrc = src;
      if ('jmNuevoSrc' in card.dataset) card.dataset.jmNuevoSrc = src;
    }
    const link = img.closest('a');
    if (link) link.href = src;
  }

  function syncVisorSiActiva(img, src) {
    const card = img.closest('.jm-interfaces__card--activa, .jm-nuevo-proto__card--activa');
    if (!card) return;
    const sec = img.closest('[data-jm-interfaces], [data-jm-nuevo-prototipo]');
    if (!sec) return;
    const visorImg = sec.querySelector('[data-jm-int-visor-img], [data-jm-nuevo-visor-img]');
    const visorLink = sec.querySelector('.jm-interfaces__visor-link, .jm-nuevo-proto__visor-link');
    if (visorImg) {
      visorImg.src = src;
      visorImg.alt = img.alt || '';
    }
    if (visorLink) visorLink.href = src;
  }

  function applyMetaToImg(img, key) {
    const m = meta[key];
    if (!m) return;
    if (m.titulo) img.alt = m.titulo;
    const card = img.closest('.jm-nuevo-proto__card, .jm-interfaces__card, .ficha-wireframe, figure');
    if (!card) return;
    if (m.notas && !card.querySelector('.jm-img-meta-nota')) {
      const cap = card.querySelector('figcaption');
      if (cap) {
        const nota = document.createElement('span');
        nota.className = 'jm-img-meta-nota';
        nota.textContent = m.notas;
        cap.appendChild(nota);
      }
    }
  }

  function applyToImg(img) {
    const key = img.dataset.jmImgKey;
    if (!key) return null;
    const host = img.closest('.jm-nuevo-proto__card, .jm-interfaces__card, .ficha-wireframe, .jm-galeria__slide, .jm-prototipo__pantalla, figure');
    if (ocultas.includes(key)) {
      if (host) host.style.display = 'none';
      return { key, hidden: true };
    }
    if (host) host.style.display = '';
    const def = img.dataset.jmImgDefault || img.src;
    const src = overrides[key] || def;
    if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    syncParentLinks(img, src);
    syncVisorSiActiva(img, src);
    applyMetaToImg(img, key);
    return { key, hasOverride: !!overrides[key] };
  }

  function bindOcultaRestore(key) {
    if (!key || scope.querySelector(`[data-jm-img-restore-key="${key}"]`)) return;
    let panel = scope.querySelector('[data-jm-img-ocultas-panel]');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'jm-img-ocultas-panel landing-img__solo-edicion';
      panel.dataset.jmImgOcultasPanel = '1';
      panel.innerHTML = '<p class="jm-img-ocultas-panel__titulo">Imágenes ocultas</p>';
      const wire = scope.querySelector('#ficha-wireframes-jm, #jm-nuevo-prototipo, .jm-landing--ficha');
      (wire || scope).appendChild(panel);
    }
    if (panel.querySelector(`[data-jm-img-restore-key="${key}"]`)) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'jm-img-editable__btn jm-img-editable__btn--ghost';
    btn.dataset.jmImgRestoreKey = key;
    btn.textContent = 'Mostrar: ' + key.replace(/^jm:/, '').split('/').pop();
    btn.addEventListener('click', () => {
      const idx = ocultas.indexOf(key);
      if (idx >= 0) ocultas.splice(idx, 1);
      const imgEl = scope.querySelector(`[data-jm-img-key="${key}"]`);
      if (imgEl) {
        imgEl.dataset.jmImgEditorBound = '0';
        const host = imgEl.closest('.jm-nuevo-proto__card, .jm-interfaces__card, .ficha-wireframe, .jm-galeria__slide, .jm-prototipo__pantalla, figure');
        if (host) host.style.display = '';
      }
      btn.remove();
      if (!panel.querySelector('[data-jm-img-restore-key]')) panel.remove();
      emitChange();
      window.initJMImagenesEditorUI(scope, opts);
    });
    panel.appendChild(btn);
  }

  function applyKeyToAll(key) {
    scope.querySelectorAll('[data-jm-img-key]').forEach((el) => {
      if (el.dataset.jmImgKey === key) applyToImg(el);
    });
  }

  function buildImgEditBar(img, info) {
    const bar = document.createElement('div');
    bar.className = 'jm-img-editable__bar';
    bar.dataset.jmImgBarFor = info.key;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.hidden = true;

    const btnChange = document.createElement('button');
    btnChange.type = 'button';
    btnChange.className = 'jm-img-editable__btn';
    btnChange.textContent = 'Cambiar imagen';

    const btnRestore = document.createElement('button');
    btnRestore.type = 'button';
    btnRestore.className = 'jm-img-editable__btn jm-img-editable__btn--ghost';
    btnRestore.textContent = 'Restaurar original';
    btnRestore.hidden = !info.hasOverride;

    const btnEdit = document.createElement('button');
    btnEdit.type = 'button';
    btnEdit.className = 'jm-img-editable__btn';
    btnEdit.textContent = 'Editar';

    const btnDelete = document.createElement('button');
    btnDelete.type = 'button';
    btnDelete.className = 'jm-img-editable__btn jm-img-editable__btn--danger';
    btnDelete.textContent = 'Borrar';

    btnChange.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      input.click();
    });

    btnRestore.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      delete overrides[info.key];
      applyKeyToAll(info.key);
      btnRestore.hidden = true;
      emitChange();
    });

    btnEdit.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const actual = meta[info.key] || { titulo: img.alt || '', notas: '' };
      const titulo = prompt('Título de la imagen:', actual.titulo || '');
      if (titulo === null) return;
      const notas = prompt('Notas (opcional):', actual.notas || '');
      if (notas === null) return;
      meta[info.key] = { titulo: titulo.trim(), notas: notas.trim() };
      applyKeyToAll(info.key);
      emitChange();
    });

    btnDelete.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!confirm('¿Ocultar esta imagen de la landing?')) return;
      if (!ocultas.includes(info.key)) ocultas.push(info.key);
      applyKeyToAll(info.key);
      bindOcultaRestore(info.key);
      emitChange();
    });

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      input.value = '';
      if (!file || !/^image\//.test(file.type)) return;
      if (file.size > maxBytes) {
        if (onError) onError('Imagen muy grande (máx. ' + Math.round(maxBytes / 1024) + ' KB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        overrides[info.key] = reader.result;
        applyKeyToAll(info.key);
        btnRestore.hidden = false;
        emitChange();
      };
      reader.onerror = () => {
        if (onError) onError('No se pudo leer la imagen');
      };
      reader.readAsDataURL(file);
    });

    bar.appendChild(btnChange);
    bar.appendChild(btnEdit);
    bar.appendChild(btnRestore);
    bar.appendChild(btnDelete);
    bar.appendChild(input);
    return bar;
  }

  function attachImgEditBar(img, bar) {
    const visorRoot = img.closest('[data-jm-int-visor], [data-jm-nuevo-visor]');
    if (visorRoot && (img.hasAttribute('data-jm-int-visor-img') || img.classList.contains('jm-interfaces__visor-img'))) {
      return;
    }

    const thumbCard = img.closest('.jm-interfaces__card');
    if (thumbCard) {
      const cap = thumbCard.querySelector('figcaption');
      if (cap) cap.insertAdjacentElement('afterend', bar);
      else thumbCard.appendChild(bar);
      return;
    }

    const interactiveParent = img.closest('a, button');
    const card = img.closest('.jm-nuevo-proto__card, .ficha-wireframe, .jm-galeria__slide, .jm-prototipo__pantalla, figure');
    if (interactiveParent && card) {
      interactiveParent.insertAdjacentElement('afterend', bar);
      return;
    }

    const parent = img.parentNode;
    if (!parent) return;
    const wrap = document.createElement('div');
    wrap.className = 'jm-img-editable';
    parent.insertBefore(wrap, img);
    wrap.appendChild(img);
    wrap.appendChild(bar);
  }

  function syncCarouselVisorBar(sec) {
    const slot = sec.querySelector('[data-jm-int-visor-edit]');
    if (!slot) return;
    const label = slot.querySelector('.jm-interfaces__visor-edit-label');
    slot.querySelectorAll('.jm-img-editable__bar').forEach((el) => el.remove());
    const activeImg = sec.querySelector('.jm-interfaces__card--activa img[data-jm-img-key]');
    if (!activeImg) return;
    const info = applyToImg(activeImg);
    if (!info || info.hidden) return;
    const visorImg = sec.querySelector('[data-jm-int-visor-img]');
    if (visorImg && activeImg.dataset.jmImgKey) {
      visorImg.dataset.jmImgKey = activeImg.dataset.jmImgKey;
      visorImg.dataset.jmImgDefault = activeImg.dataset.jmImgDefault || '';
      applyToImg(visorImg);
    }
    const archivo = activeImg.dataset.jmImgKey?.replace(/^jm:/, '').split('/').pop() || '';
    if (label) {
      label.textContent = archivo
        ? `Reemplazar «${activeImg.alt || 'captura'}» · ${archivo}`
        : `Reemplazar «${activeImg.alt || 'captura'}»`;
    }
    const bar = buildImgEditBar(activeImg, info);
    bar.classList.add('jm-img-editable__bar--visor');
    slot.appendChild(bar);
  }

  window.jmSyncVisorEditBar = syncCarouselVisorBar;

  function syncPrototipoVisorEditBar(protoEl) {
    if (!protoEl) return;
    const slot = protoEl.querySelector('[data-jm-proto-visor-edit]');
    if (!slot) return;
    const label = slot.querySelector('.jm-prototipo__visor-edit-label');
    slot.querySelectorAll('.jm-img-editable__bar').forEach((el) => el.remove());
    const activeImg = protoEl.querySelector('.jm-prototipo__pantalla--activa img[data-jm-img-key]');
    if (!activeImg) return;
    const info = applyToImg(activeImg);
    if (!info || info.hidden) return;
    const pasoTitulo = activeImg.alt || 'captura';
    const archivo = info.key?.replace(/^jm:/, '').split('/').pop() || '';
    if (label) {
      label.textContent = archivo
        ? `Reemplazar «${pasoTitulo}» · ${archivo}`
        : `Reemplazar «${pasoTitulo}»`;
    }
    const bar = buildImgEditBar(activeImg, info);
    bar.classList.add('jm-img-editable__bar--visor');
    slot.appendChild(bar);
  }

  window.jmSyncPrototipoVisorEditBar = syncPrototipoVisorEditBar;

  scope.querySelectorAll('[data-jm-img-key]').forEach((img) => {
    if (img.hasAttribute('data-jm-int-visor-img') || img.classList.contains('jm-interfaces__visor-img')) {
      applyToImg(img);
      return;
    }
    if (img.closest('.jm-prototipo__pantalla')) {
      if (img.dataset.jmImgEditorBound !== '1') img.dataset.jmImgEditorBound = '1';
      applyToImg(img);
      return;
    }
    if (img.dataset.jmImgEditorBound === '1') {
      applyToImg(img);
      const btnRestore = scope.querySelector(`[data-jm-img-bar-for="${img.dataset.jmImgKey}"] .jm-img-editable__btn--ghost`);
      if (btnRestore) btnRestore.hidden = !overrides[img.dataset.jmImgKey];
      return;
    }
    img.dataset.jmImgEditorBound = '1';
    const info = applyToImg(img);
    if (!info || info.hidden) {
      if (info?.hidden) bindOcultaRestore(info.key);
      return;
    }

    attachImgEditBar(img, buildImgEditBar(img, info));
  });

  scope.querySelectorAll('[data-jm-interfaces]').forEach((sec) => {
    syncCarouselVisorBar(sec);
  });

  scope.querySelectorAll('[data-jm-prototipo]').forEach((protoEl) => {
    syncPrototipoVisorEditBar(protoEl);
  });

  scope.querySelectorAll('[data-jm-interfaces], [data-jm-nuevo-prototipo]').forEach((sec) => {
    const active = sec.querySelector('.jm-interfaces__card--activa img[data-jm-img-key], .jm-nuevo-proto__card--activa img[data-jm-img-key]');
    if (active) syncVisorSiActiva(active, active.src);
  });

  ocultas.forEach((key) => bindOcultaRestore(key));
};

/** Inicializa carruseles JM (ficha, Clientes, portal) */
window.initJMGalerias = function initJMGalerias(root) {
  const scope = root && root.querySelectorAll ? root : document;
  const nodos = scope.querySelectorAll ? scope.querySelectorAll('[data-jm-galeria]') : [];
  nodos.forEach(galeria => {
    if (galeria.dataset.jmGaleriaBound === '1') return;
    galeria.dataset.jmGaleriaBound = '1';
    const slides = [...galeria.querySelectorAll('.jm-galeria__slide')];
    if (!slides.length) return;
    const tituloEl = galeria.querySelector('.jm-galeria__titulo');
    const contadorEl = galeria.querySelector('.jm-galeria__contador');
    const titulos = slides.map(s => s.querySelector('img')?.getAttribute('alt') || '');
    let idx = slides.findIndex(s => s.classList.contains('jm-galeria__slide--activa'));
    if (idx < 0) idx = 0;

    function ir(n) {
      slides[idx]?.classList.remove('jm-galeria__slide--activa');
      idx = (n + slides.length) % slides.length;
      slides[idx]?.classList.add('jm-galeria__slide--activa');
      if (tituloEl) tituloEl.textContent = titulos[idx] || '';
      if (contadorEl) contadorEl.textContent = `${idx + 1} / ${slides.length}`;
    }

    galeria.querySelector('.jm-galeria__flecha--izq')?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      ir(idx - 1);
    });
    galeria.querySelector('.jm-galeria__flecha--der')?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      ir(idx + 1);
    });
    galeria.querySelector('.jm-galeria__zona--izq')?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      ir(idx - 1);
    });
    galeria.querySelector('.jm-galeria__zona--der')?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      ir(idx + 1);
    });
    galeria.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); ir(idx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); ir(idx + 1); }
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.initJMWireframesUI === 'function') window.initJMWireframesUI();
});
