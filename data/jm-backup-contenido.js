/**
 * Contenido importado de joyasmercury-backup → ficha Joyas Mercury.
 * Cargado por app.js
 */
window.JM_BACKUP_FICHA = {
  version: 2,
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
    { grupo: 'Estado actual del sitio', carpeta: 'interfaces', archivo: '01-arquitectura-sitio-1080x1080.png', titulo: 'Arquitectura del sitio' },
    { grupo: 'Estado actual del sitio', carpeta: 'interfaces', archivo: '02-home-produccion-desktop-1080x1080.png', titulo: 'Home producción (desktop)' },
    { grupo: 'Estado actual del sitio', carpeta: 'interfaces', archivo: '03-home-produccion-mobile-1080x1080.png', titulo: 'Home producción (móvil)' },
    { grupo: 'Estado actual del sitio', carpeta: 'interfaces', archivo: '04-menu-hamburguesa-actual-1080x1080.png', titulo: 'Menú hamburguesa actual' },
    { grupo: 'Estado actual del sitio', carpeta: 'interfaces', archivo: '05-wp-admin-paginas-1080x1080.png', titulo: 'WP Admin — páginas' },
    { grupo: 'Estado actual del sitio', carpeta: 'interfaces', archivo: '06-elementor-inicio-v2-1080x1080.png', titulo: 'Elementor Inicio v2' },
    { grupo: 'Estado actual del sitio', carpeta: 'interfaces', archivo: '07-landing-esencial-1080x1080.png', titulo: 'Landing Esencial' },
    { grupo: 'Estado actual del sitio', carpeta: 'interfaces', archivo: '08-woocommerce-carrito-1080x1080.png', titulo: 'Carrito WooCommerce' },
    { grupo: 'Estado actual del sitio', carpeta: 'interfaces', archivo: '09-astra-cabecera-3-filas-1080x1080.png', titulo: 'Cabecera Astra (3 filas)' },
    { grupo: 'Estado actual del sitio', carpeta: 'interfaces', archivo: '10-flujo-actual-vs-objetivo-1080x1080.png', titulo: 'Flujo actual vs objetivo' },
    { grupo: 'Objetivo (Fase 2)', carpeta: 'dia-1', archivo: '05-mockup-menu-propuesto-1080x1080.png', titulo: 'Menú propuesto' },
    { grupo: 'Objetivo (Fase 2)', carpeta: 'dia-1', archivo: '06-mapa-navegacion-1080x1080.png', titulo: 'Mapa de navegación' }
  ],

  /** Prototipo interactivo — zonas clicables (%). Calidad media: vista 720px */
  prototipo: {
    calidadPx: 720,
    inicio: 'home-desktop',
    pantallas: {
      'home-desktop': {
        carpeta: 'interfaces',
        archivo: '02-home-produccion-desktop-1080x1080.png',
        titulo: 'Inicio · producción (desktop)',
        hotspots: [
          { x: 3, y: 10, w: 9, h: 10, destino: 'menu-mobile', etiqueta: 'Menú hamburguesa' },
          { x: 88, y: 10, w: 10, h: 10, destino: 'carrito', etiqueta: 'Mi carrito' },
          { x: 8, y: 48, w: 26, h: 32, destino: 'landing-esencial', etiqueta: 'Colección Esencial' },
          { x: 37, y: 48, w: 26, h: 32, destino: 'landing-esencial', etiqueta: 'Colección Gold' },
          { x: 66, y: 48, w: 26, h: 32, destino: 'landing-esencial', etiqueta: 'Colección Deluxe' },
          { x: 18, y: 26, w: 12, h: 6, destino: 'landing-esencial', etiqueta: 'Nav · Tienda' },
          { x: 78, y: 90, w: 18, h: 8, destino: 'mapa-flujo', etiqueta: 'Ver mapa de flujo' }
        ]
      },
      'home-mobile': {
        carpeta: 'interfaces',
        archivo: '03-home-produccion-mobile-1080x1080.png',
        titulo: 'Inicio · móvil',
        hotspots: [
          { x: 3, y: 12, w: 12, h: 10, destino: 'menu-mobile', etiqueta: 'Menú' },
          { x: 86, y: 12, w: 12, h: 10, destino: 'carrito', etiqueta: 'Carrito' },
          { x: 28, y: 36, w: 44, h: 12, destino: 'landing-esencial', etiqueta: 'Esencial' },
          { x: 28, y: 50, w: 44, h: 12, destino: 'landing-esencial', etiqueta: 'Gold' },
          { x: 28, y: 64, w: 44, h: 12, destino: 'landing-esencial', etiqueta: 'Deluxe' },
          { x: 38, y: 6, w: 24, h: 6, destino: 'home-desktop', etiqueta: 'Vista desktop' }
        ]
      },
      'menu-mobile': {
        carpeta: 'interfaces',
        archivo: '04-menu-hamburguesa-actual-1080x1080.png',
        titulo: 'Menú hamburguesa',
        hotspots: [
          { x: 8, y: 16, w: 84, h: 8, destino: 'home-mobile', etiqueta: 'Inicio' },
          { x: 8, y: 26, w: 84, h: 8, destino: 'landing-esencial', etiqueta: 'Tienda' },
          { x: 8, y: 36, w: 84, h: 8, destino: 'home-mobile', etiqueta: 'Contacto' },
          { x: 8, y: 46, w: 84, h: 8, destino: 'carrito', etiqueta: 'Mi Carrito' },
          { x: 0, y: 0, w: 22, h: 100, destino: 'home-mobile', etiqueta: 'Cerrar menú' }
        ]
      },
      'landing-esencial': {
        carpeta: 'interfaces',
        archivo: '07-landing-esencial-1080x1080.png',
        titulo: 'Colección Esencial',
        hotspots: [
          { x: 38, y: 8, w: 24, h: 8, destino: 'home-desktop', etiqueta: 'Inicio' },
          { x: 88, y: 8, w: 10, h: 8, destino: 'carrito', etiqueta: 'Carrito' },
          { x: 4, y: 40, w: 24, h: 7, destino: 'landing-esencial', etiqueta: 'Filtro · Aros' },
          { x: 4, y: 48, w: 24, h: 7, destino: 'landing-esencial', etiqueta: 'Filtro · Cadenas' },
          { x: 32, y: 38, w: 24, h: 28, destino: 'carrito', etiqueta: 'Producto 1' },
          { x: 58, y: 38, w: 24, h: 28, destino: 'carrito', etiqueta: 'Producto 2' },
          { x: 84, y: 38, w: 14, h: 28, destino: 'carrito', etiqueta: 'Producto 3' }
        ]
      },
      'carrito': {
        carpeta: 'interfaces',
        archivo: '08-woocommerce-carrito-1080x1080.png',
        titulo: 'Mi Carrito',
        hotspots: [
          { x: 38, y: 6, w: 24, h: 8, destino: 'home-desktop', etiqueta: 'Volver al inicio' },
          { x: 3, y: 10, w: 9, h: 10, destino: 'menu-mobile', etiqueta: 'Menú' },
          { x: 28, y: 68, w: 44, h: 10, destino: 'home-desktop', etiqueta: 'Seguir comprando' }
        ]
      },
      'inicio-v2': {
        carpeta: 'interfaces',
        archivo: '06-elementor-inicio-v2-1080x1080.png',
        titulo: 'Inicio v2 · borrador Elementor',
        hotspots: [
          { x: 10, y: 88, w: 35, h: 8, destino: 'home-desktop', etiqueta: 'Comparar con producción' },
          { x: 55, y: 88, w: 35, h: 8, destino: 'mapa-flujo', etiqueta: 'Mapa de flujo' }
        ]
      },
      'mapa-flujo': {
        carpeta: 'interfaces',
        archivo: '10-flujo-actual-vs-objetivo-1080x1080.png',
        titulo: 'Flujo actual vs objetivo',
        hotspots: [
          { x: 5, y: 88, w: 40, h: 10, destino: 'home-desktop', etiqueta: 'Volver al inicio' },
          { x: 55, y: 88, w: 40, h: 10, destino: 'inicio-v2', etiqueta: 'Ver Inicio v2' }
        ]
      }
    }
  }
};

/** Ruta relativa según página (organizador, portal o wireframes.html) */
window.jmWireframeSrc = function jmWireframeSrc(carpeta, archivo) {
  const file = `${carpeta}/${archivo}`;
  const p = (location.pathname || '').replace(/\\/g, '/');
  if (/\/index\/clientes\//i.test(p)) {
    return `JoyasMercury/${file}`;
  }
  return `index/clientes/JoyasMercury/${file}`;
};

/** Copia wireframes al objeto ficha (persisten en localStorage al guardar) */
window.asegurarWireframesJM = function asegurarWireframesJM(cli) {
  if (!cli || cli.id !== 'cli-joyas-mercury') return;
  if (!cli.ficha || typeof cli.ficha !== 'object') {
    cli.ficha = { contacto: '', links: '', notas: '', seccionesExtra: [], documentos: [] };
  }
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

/** HTML carrusel con flechas y clic izquierda/derecha */
function jmHtmlGaleriaWireframes(grupo, items) {
  if (!items.length) return '';
  const slides = items.map((w, i) => {
    const src = jmWireframeSrc(w.carpeta, w.archivo);
    const titulo = jmEscapeHtml(w.titulo);
    return `<figure class="jm-galeria__slide${i === 0 ? ' jm-galeria__slide--activa' : ''}" data-index="${i}">
      <a href="${src}" target="_blank" rel="noopener" class="jm-galeria__link" title="Abrir ${titulo} en tamaño completo">
        <img src="${src}" alt="${titulo}" loading="${i === 0 ? 'eager' : 'lazy'}">
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

/** HTML prototipo interactivo (calidad media 720px) */
function jmHtmlPrototipoInteractivo() {
  const proto = window.JM_BACKUP_FICHA?.prototipo;
  if (!proto?.pantallas) return '';
  const inicio = proto.inicio || 'home-desktop';
  const pantallasHtml = Object.entries(proto.pantallas).map(([id, p]) => {
    const src = jmWireframeSrc(p.carpeta, p.archivo);
    const activa = id === inicio ? ' jm-prototipo__pantalla--activa' : '';
    const hotspots = (p.hotspots || []).map((h, i) =>
      `<button type="button" class="jm-prototipo__hotspot" data-destino="${jmEscapeHtml(h.destino)}" ` +
      `style="left:${h.x}%;top:${h.y}%;width:${h.w}%;height:${h.h}%" ` +
      `title="${jmEscapeHtml(h.etiqueta)}" aria-label="${jmEscapeHtml(h.etiqueta)}"></button>`
    ).join('');
    return `<div class="jm-prototipo__pantalla${activa}" data-pantalla-id="${jmEscapeHtml(id)}" role="tabpanel">
      <img class="jm-prototipo__img" src="${src}" alt="${jmEscapeHtml(p.titulo)}" width="720" height="720" loading="${id === inicio ? 'eager' : 'lazy'}">
      <div class="jm-prototipo__hotspots">${hotspots}</div>
    </div>`;
  }).join('');
  const tituloInicio = proto.pantallas[inicio]?.titulo || 'Inicio';
  return `<div class="jm-prototipo" data-jm-prototipo tabindex="0" role="application" aria-label="Prototipo interactivo joyasmercury.cl">
    <div class="jm-prototipo__bar">
      <span class="jm-prototipo__badge">Prototipo interactivo · calidad media (720px)</span>
      <div class="jm-prototipo__acciones">
        <button type="button" class="btn btn--ghost btn--sm jm-prototipo__btn-zonas" data-jm-toggle-zonas aria-pressed="true">Zonas clicables</button>
        <button type="button" class="btn btn--ghost btn--sm" data-jm-reiniciar>Reiniciar recorrido</button>
      </div>
    </div>
    <p class="jm-prototipo__hint">Haz clic en las áreas resaltadas del wireframe para navegar como en el sitio · Pasa el mouse para ver cada zona</p>
    <div class="jm-prototipo__viewport" style="max-width:${proto.calidadPx || 720}px">
      <div class="jm-prototipo__stack">${pantallasHtml}</div>
    </div>
    <div class="jm-prototipo__pie">
      <strong class="jm-prototipo__titulo">${jmEscapeHtml(tituloInicio)}</strong>
      <span class="jm-prototipo__breadcrumb" data-jm-breadcrumb>Inicio</span>
    </div>
  </div>`;
}

function jmHtmlObjetivoMini(wf) {
  const items = wf.filter(w => w.grupo === 'Objetivo (Fase 2)');
  if (!items.length) return '';
  const mini = items.map(w => {
    const src = jmWireframeSrc(w.carpeta, w.archivo);
    return `<figure class="ficha-wireframe">
      <a href="${src}" target="_blank" rel="noopener" title="Abrir ${jmEscapeHtml(w.titulo)}">
        <img src="${src}" alt="${jmEscapeHtml(w.titulo)}" loading="lazy">
      </a>
      <figcaption>${jmEscapeHtml(w.titulo)}</figcaption>
    </figure>`;
  }).join('');
  return `<div class="ficha-wireframes__grupo ficha-wireframes__grupo--mini ficha-wireframes__grupo--objetivo">
    <h4 class="ficha-wireframes__sub">Objetivo Fase 2 (referencia)</h4>
    <div class="ficha-wireframes__grid ficha-wireframes__grid--mini">${mini}</div>
  </div>`;
}

/** Galería HTML de wireframes JM (ficha cliente + portal) */
window.jmHtmlWireframes = function jmHtmlWireframes(opts) {
  const fromOpts = opts && opts.wireframes;
  const wf = (Array.isArray(fromOpts) && fromOpts.length)
    ? fromOpts
    : (window.JM_BACKUP_FICHA?.wireframes || []);
  if (!wf?.length && !window.JM_BACKUP_FICHA?.prototipo) return '';
  const claseExtra = (opts && opts.claseExtra) || '';
  const usarPrototipo = !opts || opts.interactivo !== false;
  const cuerpo = usarPrototipo
    ? jmHtmlPrototipoInteractivo() + jmHtmlObjetivoMini(wf)
    : (() => {
      const grupos = [];
      wf.forEach(item => { if (!grupos.includes(item.grupo)) grupos.push(item.grupo); });
      return grupos.map(grupo => {
        const items = wf.filter(w => w.grupo === grupo);
        if (grupo === 'Estado actual del sitio' || items.length >= 3) return jmHtmlGaleriaWireframes(grupo, items);
        const mini = items.map(w => {
          const src = jmWireframeSrc(w.carpeta, w.archivo);
          return `<figure class="ficha-wireframe"><a href="${src}" target="_blank" rel="noopener"><img src="${src}" alt="${jmEscapeHtml(w.titulo)}"></a><figcaption>${jmEscapeHtml(w.titulo)}</figcaption></figure>`;
        }).join('');
        return `<div class="ficha-wireframes__grupo ficha-wireframes__grupo--mini"><h4 class="ficha-wireframes__sub">${jmEscapeHtml(grupo)}</h4><div class="ficha-wireframes__grid ficha-wireframes__grid--mini">${mini}</div></div>`;
      }).join('');
    })();
  const intro = usarPrototipo
    ? 'Prototipo navegable del estado actual de joyasmercury.cl — wireframes en calidad media.'
    : 'Recorre el estado actual del sitio con las flechas o clic izquierda/derecha sobre la imagen.';
  return `<section id="ficha-wireframes-jm" class="ficha-seccion ficha-seccion--wireframes ${claseExtra}${usarPrototipo ? ' ficha-seccion--prototipo' : ''}">
    <div class="ficha-seccion__headline">
      <h3 class="ficha-seccion__titulo">Wireframes actuales</h3>
      <span class="ficha-seccion__estado">Prototipo · joyasmercury.cl</span>
    </div>
    <p class="ficha-wireframes__intro">${intro}</p>
    ${cuerpo}
  </section>`;
};

/** Navegación del prototipo interactivo */
window.initJMPrototipo = function initJMPrototipo(root) {
  const scope = root && root.querySelectorAll ? root : document;
  const nodos = scope.querySelectorAll ? scope.querySelectorAll('[data-jm-prototipo]') : [];
  const proto = window.JM_BACKUP_FICHA?.prototipo;
  if (!proto) return;

  nodos.forEach(el => {
    if (el.dataset.jmPrototipoBound === '1') return;
    el.dataset.jmPrototipoBound = '1';
    const pantallas = [...el.querySelectorAll('.jm-prototipo__pantalla')];
    const tituloEl = el.querySelector('.jm-prototipo__titulo');
    const breadcrumbEl = el.querySelector('[data-jm-breadcrumb]');
    const historial = [];
    let actualId = proto.inicio || 'home-desktop';

    function tituloDe(id) {
      return proto.pantallas[id]?.titulo || id;
    }

    function ir(id, { pushHistory = true } = {}) {
      if (!proto.pantallas[id]) return;
      if (pushHistory && actualId !== id) historial.push(actualId);
      actualId = id;
      pantallas.forEach(p => {
        p.classList.toggle('jm-prototipo__pantalla--activa', p.dataset.pantallaId === id);
      });
      if (tituloEl) tituloEl.textContent = tituloDe(id);
      if (breadcrumbEl) {
        const trail = [...historial, id].map(tituloDe).slice(-3);
        breadcrumbEl.textContent = trail.join(' → ');
      }
      el.classList.add('jm-prototipo--transicion');
      setTimeout(() => el.classList.remove('jm-prototipo--transicion'), 220);
    }

    el.querySelectorAll('.jm-prototipo__hotspot').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const dest = btn.dataset.destino;
        if (dest) ir(dest);
      });
    });

    el.querySelector('[data-jm-reiniciar]')?.addEventListener('click', () => {
      historial.length = 0;
      ir(proto.inicio || 'home-desktop', { pushHistory: false });
    });

    el.querySelector('[data-jm-toggle-zonas]')?.addEventListener('click', e => {
      const on = el.classList.toggle('jm-prototipo--mostrar-zonas');
      e.currentTarget.setAttribute('aria-pressed', on ? 'true' : 'false');
      e.currentTarget.textContent = on ? 'Zonas clicables' : 'Ocultar zonas';
    });

    el.addEventListener('keydown', e => {
      if (e.key === 'Escape' && historial.length) {
        e.preventDefault();
        const prev = historial.pop();
        ir(prev, { pushHistory: false });
      }
    });

    el.classList.add('jm-prototipo--mostrar-zonas');
    ir(actualId, { pushHistory: false });
  });
};

/** Inicializa carruseles y prototipos JM */
window.initJMWireframesUI = function initJMWireframesUI(root) {
  if (typeof window.initJMPrototipo === 'function') window.initJMPrototipo(root);
  if (typeof window.initJMGalerias === 'function') window.initJMGalerias(root);
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
