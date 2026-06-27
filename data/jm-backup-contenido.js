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
  ]
};

/** Ruta absoluta a PNG (funciona desde index.html y portal clientes con npx serve .) */
window.jmWireframeSrc = function jmWireframeSrc(carpeta, archivo) {
  return `/index/clientes/JoyasMercury/${carpeta}/${archivo}`;
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

/** Galería HTML de wireframes JM (ficha cliente + portal) */
window.jmHtmlWireframes = function jmHtmlWireframes(opts) {
  const wf = (opts && opts.wireframes) || window.JM_BACKUP_FICHA?.wireframes;
  if (!wf?.length) return '';
  const claseExtra = (opts && opts.claseExtra) || '';
  const grupos = [];
  wf.forEach(item => {
    if (!grupos.includes(item.grupo)) grupos.push(item.grupo);
  });
  const bloques = grupos.map(grupo => {
    const items = wf.filter(w => w.grupo === grupo).map(w => {
      const src = jmWireframeSrc(w.carpeta, w.archivo);
      return `<figure class="ficha-wireframe">
        <a href="${src}" target="_blank" rel="noopener" title="Abrir ${w.titulo}">
          <img src="${src}" alt="${w.titulo}" loading="lazy" width="540" height="540">
        </a>
        <figcaption>${w.titulo}</figcaption>
      </figure>`;
    }).join('');
    return `<div class="ficha-wireframes__grupo">
      <h4 class="ficha-wireframes__sub">${grupo}</h4>
      <div class="ficha-wireframes__grid">${items}</div>
    </div>`;
  }).join('');
  return `<section id="ficha-wireframes-jm" class="ficha-seccion ficha-seccion--wireframes ${claseExtra}">
    <div class="ficha-seccion__headline">
      <h3 class="ficha-seccion__titulo">Wireframes actuales</h3>
      <span class="ficha-seccion__estado">Diagramación · joyasmercury.cl</span>
    </div>
    <p class="ficha-wireframes__intro">Estado actual del sitio y objetivo Fase 2. Clic en una imagen para verla en tamaño completo. Esta sección permanece al guardar la ficha.</p>
    ${bloques}
  </section>`;
};
