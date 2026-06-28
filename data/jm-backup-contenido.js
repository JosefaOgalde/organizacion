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
    { grupo: 'Flujo actual (prototipo)', carpeta: 'flujo-actual', archivo: '01-inicio-home.png', titulo: '1 · Inicio' },
    { grupo: 'Flujo actual (prototipo)', carpeta: 'flujo-actual', archivo: '02-coleccion-esencial.png', titulo: '2 · Esencial' },
    { grupo: 'Flujo actual (prototipo)', carpeta: 'flujo-actual', archivo: '03-coleccion-gold.png', titulo: '3 · Gold' },
    { grupo: 'Flujo actual (prototipo)', carpeta: 'flujo-actual', archivo: '04-coleccion-deluxe.png', titulo: '4 · Deluxe' },
    { grupo: 'Flujo actual (prototipo)', carpeta: 'flujo-actual', archivo: '05-tienda-catalogo.png', titulo: '5 · Tienda' },
    { grupo: 'Flujo actual (prototipo)', carpeta: 'flujo-actual', archivo: '06-mi-carrito.png', titulo: '6 · Mi Carrito' },
    { grupo: 'Flujo actual (prototipo)', carpeta: 'flujo-actual', archivo: '07-nosotros.png', titulo: '7 · Nosotros' },
    { grupo: 'Flujo actual (prototipo)', carpeta: 'flujo-actual', archivo: '08-pie-garantia-footer.png', titulo: '8 · Pie y garantía' },
    { grupo: 'Auditoría técnica', carpeta: 'interfaces', archivo: '01-arquitectura-sitio-1080x1080.png', titulo: 'Arquitectura del sitio' },
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

  /** Prototipo interactivo — flujo actual producción (capturas en flujo-actual/) */
  prototipo: {
    tituloFlujo: 'Flujo actual · joyasmercury.cl',
    inicio: 'inicio',
    pasos: [
      { id: 'inicio', orden: 1, carpeta: 'flujo-actual', archivo: '01-inicio-home.png', titulo: '1 · Inicio' },
      { id: 'esencial', orden: 2, carpeta: 'flujo-actual', archivo: '02-coleccion-esencial.png', titulo: '2 · Esencial' },
      { id: 'gold', orden: 3, carpeta: 'flujo-actual', archivo: '03-coleccion-gold.png', titulo: '3 · Gold' },
      { id: 'deluxe', orden: 4, carpeta: 'flujo-actual', archivo: '04-coleccion-deluxe.png', titulo: '4 · Deluxe' },
      { id: 'tienda', orden: 5, carpeta: 'flujo-actual', archivo: '05-tienda-catalogo.png', titulo: '5 · Tienda' },
      { id: 'carrito', orden: 6, carpeta: 'flujo-actual', archivo: '06-mi-carrito.png', titulo: '6 · Mi Carrito' },
      { id: 'nosotros', orden: 7, carpeta: 'flujo-actual', archivo: '07-nosotros.png', titulo: '7 · Nosotros' },
      { id: 'pie', orden: 8, carpeta: 'flujo-actual', archivo: '08-pie-garantia-footer.png', titulo: '8 · Pie y garantía' }
    ],
    pantallas: {
      inicio: {
        carpeta: 'flujo-actual',
        archivo: '01-inicio-home.png',
        titulo: 'Inicio · joyasmercury.cl',
        hotspots: [
          { x: 22, y: 7, w: 14, h: 4, destino: 'nosotros', etiqueta: 'Nosotros' },
          { x: 52, y: 7, w: 16, h: 4, destino: 'carrito', etiqueta: 'Mi Carrito' },
          { x: 12, y: 48, w: 24, h: 14, destino: 'esencial', etiqueta: 'Colección Esencial' },
          { x: 38, y: 48, w: 24, h: 14, destino: 'gold', etiqueta: 'Colección Gold' },
          { x: 64, y: 48, w: 24, h: 14, destino: 'deluxe', etiqueta: 'Colección Deluxe' },
          { x: 40, y: 92, w: 20, h: 5, destino: 'tienda', etiqueta: 'Ir a Tienda' }
        ]
      },
      esencial: {
        carpeta: 'flujo-actual',
        archivo: '02-coleccion-esencial.png',
        titulo: 'Colección Esencial',
        hotspots: [
          { x: 42, y: 5, w: 16, h: 5, destino: 'inicio', etiqueta: 'Volver al Inicio' },
          { x: 52, y: 7, w: 16, h: 4, destino: 'carrito', etiqueta: 'Mi Carrito' },
          { x: 8, y: 32, w: 18, h: 7, destino: 'tienda', etiqueta: 'Categoría · Pulseras' },
          { x: 35, y: 58, w: 28, h: 14, destino: 'carrito', etiqueta: 'Producto destacado' },
          { x: 38, y: 48, w: 24, h: 14, destino: 'gold', etiqueta: 'Ver Gold' }
        ]
      },
      gold: {
        carpeta: 'flujo-actual',
        archivo: '03-coleccion-gold.png',
        titulo: 'Colección Gold',
        hotspots: [
          { x: 42, y: 5, w: 16, h: 5, destino: 'inicio', etiqueta: 'Volver al Inicio' },
          { x: 12, y: 48, w: 24, h: 14, destino: 'esencial', etiqueta: 'Ver Esencial' },
          { x: 64, y: 48, w: 24, h: 14, destino: 'deluxe', etiqueta: 'Ver Deluxe' },
          { x: 35, y: 58, w: 28, h: 14, destino: 'tienda', etiqueta: 'Ver catálogo' }
        ]
      },
      deluxe: {
        carpeta: 'flujo-actual',
        archivo: '04-coleccion-deluxe.png',
        titulo: 'Colección Deluxe',
        hotspots: [
          { x: 42, y: 5, w: 16, h: 5, destino: 'inicio', etiqueta: 'Volver al Inicio' },
          { x: 12, y: 48, w: 24, h: 14, destino: 'gold', etiqueta: 'Ver Gold' },
          { x: 35, y: 58, w: 28, h: 14, destino: 'tienda', etiqueta: 'Ver catálogo' }
        ]
      },
      tienda: {
        carpeta: 'flujo-actual',
        archivo: '05-tienda-catalogo.png',
        titulo: 'Tienda · catálogo',
        hotspots: [
          { x: 42, y: 5, w: 16, h: 5, destino: 'inicio', etiqueta: 'Inicio' },
          { x: 52, y: 7, w: 16, h: 4, destino: 'carrito', etiqueta: 'Mi Carrito' },
          { x: 8, y: 28, w: 22, h: 22, destino: 'carrito', etiqueta: 'Añadir al carrito' },
          { x: 32, y: 28, w: 22, h: 22, destino: 'carrito', etiqueta: 'Producto 2' },
          { x: 12, y: 48, w: 24, h: 14, destino: 'esencial', etiqueta: 'Filtro Esencial' }
        ]
      },
      carrito: {
        carpeta: 'flujo-actual',
        archivo: '06-mi-carrito.png',
        titulo: 'Mi Carrito',
        hotspots: [
          { x: 35, y: 36, w: 30, h: 6, destino: 'tienda', etiqueta: 'Volver a la tienda' },
          { x: 42, y: 5, w: 16, h: 5, destino: 'inicio', etiqueta: 'Inicio' },
          { x: 22, y: 7, w: 14, h: 4, destino: 'nosotros', etiqueta: 'Nosotros' }
        ]
      },
      nosotros: {
        carpeta: 'flujo-actual',
        archivo: '07-nosotros.png',
        titulo: 'Nosotros',
        hotspots: [
          { x: 42, y: 5, w: 16, h: 5, destino: 'inicio', etiqueta: 'Inicio' },
          { x: 52, y: 7, w: 16, h: 4, destino: 'carrito', etiqueta: 'Mi Carrito' },
          { x: 85, y: 88, w: 12, h: 10, destino: 'pie', etiqueta: 'Ver pie y garantía' }
        ]
      },
      pie: {
        carpeta: 'flujo-actual',
        archivo: '08-pie-garantia-footer.png',
        titulo: 'Pie · garantía y footer',
        hotspots: [
          { x: 42, y: 5, w: 16, h: 5, destino: 'inicio', etiqueta: 'Volver al Inicio' },
          { x: 88, y: 75, w: 10, h: 12, destino: 'carrito', etiqueta: 'WhatsApp / contacto' }
        ]
      }
    }
  }
};

/** Ruta relativa según página (organizador, portal o wireframes.html) */
window.jmWireframeSrc = function jmWireframeSrc(carpeta, archivo) {
  const file = `${carpeta}/${archivo}`;
  const p = (location.pathname || '').replace(/\\/g, '/');
  if (/\/index\/clientes\/joyasmercury/i.test(p)) {
    return `../JoyasMercury/${file}`;
  }
  if (/\/index\/clientes/i.test(p)) {
    return `JoyasMercury/${file}`;
  }
  return `index/clientes/JoyasMercury/${file}`;
};

/** Pantallas del diseño Fase 2 (se van agregando aquí) */
window.JM_NUEVO_PROTOTIPO = {
  version: 1,
  intro: 'Diseño propuesto Fase 2 · footer E claro premium (default) · también A y D.',
  secciones: [
    {
      id: 'inicio',
      titulo: 'Inicio · wireframe completo',
      descripcion: 'Header, carrusel, colecciones, Novedades, Últimas unidades, Historias. Footer E (default) sin marco dorado · A y D con ?footer=a o ?footer=d.',
      wireframe: 'interfaces/mockups-inicio/wireframe-inicio.html',
      pantallas: [
        {
          id: 'inicio-mobile-e',
          vista: 'mobile',
          titulo: 'Mobile · footer E',
          archivo: 'interfaces/mockups-inicio/jm-inicio-wireframe-mobile.png'
        },
        {
          id: 'inicio-desktop-e',
          vista: 'desktop',
          titulo: 'Desktop · footer E',
          archivo: 'interfaces/mockups-inicio/jm-inicio-wireframe-desktop.png'
        },
        {
          id: 'inicio-mobile-a',
          vista: 'mobile',
          titulo: 'Mobile · footer A',
          archivo: 'interfaces/mockups-inicio/jm-inicio-footer-a-mobile.png'
        },
        {
          id: 'inicio-desktop-a',
          vista: 'desktop',
          titulo: 'Desktop · footer A',
          archivo: 'interfaces/mockups-inicio/jm-inicio-footer-a-desktop.png'
        },
        {
          id: 'inicio-mobile-d',
          vista: 'mobile',
          titulo: 'Mobile · footer D',
          archivo: 'interfaces/mockups-inicio/jm-inicio-footer-d-mobile.png'
        },
        {
          id: 'inicio-desktop-d',
          vista: 'desktop',
          titulo: 'Desktop · footer D',
          archivo: 'interfaces/mockups-inicio/jm-inicio-footer-d-desktop.png'
        }
      ]
    },
    {
      id: 'colecciones',
      titulo: 'Colecciones · Esencial / Gold / Deluxe',
      descripcion: 'Misma identidad que inicio: banner por línea, pills colección (misma vista), filtros en 4 modos (círculos/chips/tabs/panel), grilla igual a Novedades, footer E.',
      wireframe: 'interfaces/mockups-coleccion/wireframe-coleccion.html',
      pantallas: [
        { id: 'col-esencial-m', vista: 'mobile', titulo: 'Esencial · mobile', archivo: 'interfaces/mockups-coleccion/jm-coleccion-esencial-mobile.png' },
        { id: 'col-esencial-d', vista: 'desktop', titulo: 'Esencial · desktop', archivo: 'interfaces/mockups-coleccion/jm-coleccion-esencial-desktop.png' },
        { id: 'col-gold-m', vista: 'mobile', titulo: 'Gold · mobile', archivo: 'interfaces/mockups-coleccion/jm-coleccion-gold-mobile.png' },
        { id: 'col-gold-d', vista: 'desktop', titulo: 'Gold · desktop', archivo: 'interfaces/mockups-coleccion/jm-coleccion-gold-desktop.png' },
        { id: 'col-deluxe-m', vista: 'mobile', titulo: 'Deluxe · mobile', archivo: 'interfaces/mockups-coleccion/jm-coleccion-deluxe-mobile.png' },
        { id: 'col-deluxe-d', vista: 'desktop', titulo: 'Deluxe · desktop', archivo: 'interfaces/mockups-coleccion/jm-coleccion-deluxe-desktop.png' }
      ]
    },
    {
      id: 'carrito',
      titulo: 'Mi Carrito · banner vacío 1000×500',
      descripcion: 'Banner carrito vacío: bolsa + corazón, título bicolor, CTA Ver colecciones, foto lifestyle. Incluye sección Favoritos Mercury.',
      wireframe: 'interfaces/mockups-carrito/wireframe-carrito-vacio.html',
      pantallas: [
        { id: 'carrito-banner', vista: 'desktop', titulo: 'Banner · 1000×500 px', archivo: 'interfaces/mockups-carrito/jm-banner-carrito-vacio-1000x500.png' },
        { id: 'carrito-pagina', vista: 'desktop', titulo: 'Página carrito vacío', archivo: 'interfaces/mockups-carrito/jm-carrito-vacio-desktop.png' }
      ]
    },
    {
      id: 'footer-opciones',
      titulo: 'Footer · E (nuevo) · A · D',
      descripcion: 'E claro premium sin marco dorado (recomendado) · A editorial horizontal · D columnas + contacto.',
      wireframe: 'interfaces/mockups-inicio/wireframe-footer-opciones.html',
      pantallas: [
        {
          id: 'footer-opciones-desktop',
          vista: 'desktop',
          titulo: 'Comparativa · desktop',
          archivo: 'interfaces/mockups-inicio/jm-footer-opciones-desktop.png'
        },
        {
          id: 'footer-opciones-mobile',
          vista: 'mobile',
          titulo: 'Comparativa · mobile',
          archivo: 'interfaces/mockups-inicio/jm-footer-opciones-mobile.png'
        }
      ]
    }
  ]
};

/** Ruta asset nuevo prototipo */
window.jmNuevoPrototipoSrc = function jmNuevoPrototipoSrc(archivo) {
  const file = String(archivo || '').replace(/^\/+/, '');
  const p = (location.pathname || '').replace(/\\/g, '/');
  if (/\/index\/clientes\/joyasmercury/i.test(p)) {
    return `../JoyasMercury/${file}`;
  }
  if (/\/index\/clientes/i.test(p)) {
    return `JoyasMercury/${file}`;
  }
  return `index/clientes/JoyasMercury/${file}`;
};

/** HTML sección «Nuevo prototipo» */
window.jmHtmlNuevoPrototipo = function jmHtmlNuevoPrototipo(opts) {
  const data = window.JM_NUEVO_PROTOTIPO;
  if (!data?.secciones?.length) return '';
  const claseExtra = (opts && opts.claseExtra) || '';
  const bloques = data.secciones.map((sec) => {
    const pantallas = sec.pantallas || [];
    const cards = pantallas.map((p, i) => {
      const src = jmNuevoPrototipoSrc(p.archivo);
      const activa = i === 0 ? ' jm-nuevo-proto__card--activa' : '';
      return `<figure class="jm-nuevo-proto__card${activa}" data-jm-nuevo-id="${jmEscapeHtml(p.id)}" data-jm-nuevo-src="${jmEscapeHtml(src)}">
        <a href="${src}" target="_blank" rel="noopener" title="Abrir ${jmEscapeHtml(p.titulo)}">
          <img src="${src}" alt="${jmEscapeHtml(p.titulo)}" loading="${i === 0 ? 'eager' : 'lazy'}">
        </a>
        <figcaption>
          <span class="jm-nuevo-proto__vista jm-nuevo-proto__vista--${jmEscapeHtml(p.vista || 'all')}">${jmEscapeHtml(p.vista || 'pantalla')}</span>
          ${jmEscapeHtml(p.titulo)}
        </figcaption>
      </figure>`;
    }).join('');
    const wf = sec.wireframe
      ? `<a class="jm-nuevo-proto__link" href="${jmNuevoPrototipoSrc(sec.wireframe)}" target="_blank" rel="noopener">Abrir wireframe interactivo →</a>`
      : '';
    return `<article class="jm-nuevo-proto__bloque" data-jm-nuevo-seccion="${jmEscapeHtml(sec.id)}">
      <h4 class="jm-nuevo-proto__bloque-titulo">${jmEscapeHtml(sec.titulo)}</h4>
      <p class="jm-nuevo-proto__bloque-desc">${jmEscapeHtml(sec.descripcion || '')}</p>
      <div class="jm-nuevo-proto__grid">${cards}</div>
      ${wf}
    </article>`;
  }).join('');
  const primera = data.secciones[0]?.pantallas?.[0];
  const visorSrc = primera ? jmNuevoPrototipoSrc(primera.archivo) : '';
  const visorTitulo = primera?.titulo || '';
  return `<section id="jm-nuevo-prototipo" class="ficha-seccion ficha-seccion--nuevo-prototipo ${claseExtra}" data-jm-nuevo-prototipo>
    <div class="ficha-seccion__headline">
      <h3 class="ficha-seccion__titulo">Nuevo prototipo</h3>
      <span class="ficha-seccion__estado">Fase 2 · diseño JM</span>
    </div>
    <p class="jm-nuevo-proto__intro">${jmEscapeHtml(data.intro || '')}</p>
    <div class="jm-nuevo-proto__visor" data-jm-nuevo-visor>
      <a href="${jmEscapeHtml(visorSrc)}" target="_blank" rel="noopener" class="jm-nuevo-proto__visor-link" title="Abrir en tamaño completo">
        <img class="jm-nuevo-proto__visor-img" src="${jmEscapeHtml(visorSrc)}" alt="${jmEscapeHtml(visorTitulo)}" data-jm-nuevo-visor-img>
      </a>
      <p class="jm-nuevo-proto__visor-caption" data-jm-nuevo-visor-caption>${jmEscapeHtml(visorTitulo)}</p>
    </div>
    ${bloques}
  </section>`;
};

/** Clic en miniaturas → actualiza visor principal */
window.initJMNuevoPrototipoUI = function initJMNuevoPrototipoUI(root) {
  const scope = root && root.querySelectorAll ? root : document;
  scope.querySelectorAll('[data-jm-nuevo-prototipo]').forEach((sec) => {
    if (sec.dataset.jmNuevoBound === '1') return;
    sec.dataset.jmNuevoBound = '1';
    const visorImg = sec.querySelector('[data-jm-nuevo-visor-img]');
    const visorCap = sec.querySelector('[data-jm-nuevo-visor-caption]');
    const visorLink = sec.querySelector('.jm-nuevo-proto__visor-link');
    sec.querySelectorAll('.jm-nuevo-proto__card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a[target="_blank"]') && e.target.tagName === 'A') return;
        e.preventDefault();
        const src = card.dataset.jmNuevoSrc;
        const cap = card.querySelector('figcaption')?.textContent?.trim() || '';
        if (visorImg && src) {
          visorImg.src = src;
          visorImg.alt = cap;
        }
        if (visorCap) visorCap.textContent = cap;
        if (visorLink && src) visorLink.href = src;
        sec.querySelectorAll('.jm-nuevo-proto__card').forEach((c) => c.classList.remove('jm-nuevo-proto__card--activa'));
        card.classList.add('jm-nuevo-proto__card--activa');
      });
    });
  });
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

/** HTML prototipo interactivo — flujo actual ordenado */
function jmHtmlPrototipoInteractivo() {
  const proto = window.JM_BACKUP_FICHA?.prototipo;
  if (!proto?.pantallas) return '';
  const inicio = proto.inicio || 'inicio';
  const pasos = proto.pasos || [];
  const pantallasHtml = Object.entries(proto.pantallas).map(([id, p]) => {
    const src = jmWireframeSrc(p.carpeta, p.archivo);
    const activa = id === inicio ? ' jm-prototipo__pantalla--activa' : '';
    return `<div class="jm-prototipo__pantalla${activa}" data-pantalla-id="${jmEscapeHtml(id)}" role="tabpanel">
      <img class="jm-prototipo__img" src="${src}" alt="${jmEscapeHtml(p.titulo)}" loading="${id === inicio ? 'eager' : 'lazy'}">
    </div>`;
  }).join('');
  const flujoHtml = pasos.length
    ? `<ol class="jm-prototipo__flujo-lista">${pasos.map(p =>
        `<li><button type="button" class="jm-prototipo__flujo-paso${p.id === inicio ? ' jm-prototipo__flujo-paso--activo' : ''}" data-jm-paso="${jmEscapeHtml(p.id)}" data-orden="${p.orden}">${jmEscapeHtml(p.titulo)}</button></li>`
      ).join('')}</ol>`
    : '';
  const tituloInicio = proto.pantallas[inicio]?.titulo || 'Inicio';
  const totalPasos = pasos.length || Object.keys(proto.pantallas).length;
  const pasoActual = pasos.find(p => p.id === inicio)?.orden || 1;
  return `<div class="jm-prototipo jm-prototipo--flujo" data-jm-prototipo tabindex="0" role="application" aria-label="Prototipo interactivo joyasmercury.cl">
    <div class="jm-prototipo__layout">
      <aside class="jm-prototipo__flujo" aria-label="Orden del flujo">
        <h4 class="jm-prototipo__flujo-titulo">${jmEscapeHtml(proto.tituloFlujo || 'Flujo actual')}</h4>
        ${flujoHtml}
      </aside>
      <div class="jm-prototipo__main">
        <div class="jm-prototipo__bar">
          <span class="jm-prototipo__badge">Prototipo interactivo</span>
          <div class="jm-prototipo__acciones">
            <button type="button" class="btn btn--ghost btn--sm" data-jm-reiniciar>Reiniciar recorrido</button>
          </div>
        </div>
        <p class="jm-prototipo__hint">Recorre el flujo con el panel izquierdo (pasos 1–8). Por ahora solo capturas, sin zonas clicables.</p>
        <div class="jm-prototipo__viewport">
          <div class="jm-prototipo__stack">${pantallasHtml}</div>
        </div>
        <div class="jm-prototipo__pie">
          <strong class="jm-prototipo__titulo">${jmEscapeHtml(tituloInicio)}</strong>
          <span class="jm-prototipo__paso" data-jm-paso-contador>Paso ${pasoActual} / ${totalPasos}</span>
          <span class="jm-prototipo__breadcrumb" data-jm-breadcrumb>Inicio</span>
        </div>
      </div>
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
    <h4 class="ficha-wireframes__sub">Objetivo Fase 2</h4>
    <div class="ficha-wireframes__grid ficha-wireframes__grid--mini">${mini}</div>
  </div>`;
}

/** Solo prototipo interactivo (página dedicada, sin galería embebida) */
window.jmHtmlPrototipoPagina = function jmHtmlPrototipoPagina() {
  const cuerpo = jmHtmlPrototipoInteractivo();
  if (!cuerpo) return '';
  return `<section id="ficha-prototipo-jm" class="ficha-seccion ficha-seccion--wireframes ficha-seccion--prototipo ficha-seccion--prototipo-solo">
    ${cuerpo}
  </section>`;
};

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

/** Galería HTML de wireframes JM (ficha cliente + portal) */
window.jmHtmlWireframes = function jmHtmlWireframes(opts) {
  const fromOpts = opts && opts.wireframes;
  const wf = (Array.isArray(fromOpts) && fromOpts.length)
    ? fromOpts
    : (window.JM_BACKUP_FICHA?.wireframes || []);
  if (!wf?.length && !window.JM_BACKUP_FICHA?.prototipo) return '';
  const claseExtra = (opts && opts.claseExtra) || '';
  const usarPrototipo = !opts || opts.interactivo !== false;
  const mostrarObjetivoMini = !opts || opts.objetivoMini !== false;
  const cuerpo = usarPrototipo
    ? jmHtmlPrototipoInteractivo() + (mostrarObjetivoMini ? jmHtmlObjetivoMini(wf) : '')
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
    ? 'Prototipo navegable del flujo actual de joyasmercury.cl (Inicio → colecciones → Tienda → Carrito).'
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
    const pasoContadorEl = el.querySelector('[data-jm-paso-contador]');
    const pasos = proto.pasos || [];
    const historial = [];
    let actualId = proto.inicio || 'inicio';

    function ordenDe(id) {
      const p = pasos.find(x => x.id === id);
      return p ? p.orden : 0;
    }

    function tituloDe(id) {
      return proto.pantallas[id]?.titulo || id;
    }

    function actualizarFlujoUI(id) {
      el.querySelectorAll('.jm-prototipo__flujo-paso').forEach(btn => {
        btn.classList.toggle('jm-prototipo__flujo-paso--activo', btn.dataset.jmPaso === id);
      });
      if (pasoContadorEl && pasos.length) {
        const n = ordenDe(id) || 1;
        pasoContadorEl.textContent = `Paso ${n} / ${pasos.length}`;
      }
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
      actualizarFlujoUI(id);
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

    el.querySelectorAll('[data-jm-paso]').forEach(btn => {
      btn.addEventListener('click', () => {
        historial.length = 0;
        ir(btn.dataset.jmPaso, { pushHistory: false });
      });
    });

    el.querySelector('[data-jm-reiniciar]')?.addEventListener('click', () => {
      historial.length = 0;
      ir(proto.inicio || 'inicio', { pushHistory: false });
    });

    el.addEventListener('keydown', e => {
      if (e.key === 'Escape' && historial.length) {
        e.preventDefault();
        const prev = historial.pop();
        ir(prev, { pushHistory: false });
      }
    });

    ir(actualId, { pushHistory: false });
  });
};

/** Inicializa carruseles y prototipos JM */
window.initJMWireframesUI = function initJMWireframesUI(root) {
  if (typeof window.initJMPrototipo === 'function') window.initJMPrototipo(root);
  if (typeof window.initJMGalerias === 'function') window.initJMGalerias(root);
  if (typeof window.initJMNuevoPrototipoUI === 'function') window.initJMNuevoPrototipoUI(root);
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
