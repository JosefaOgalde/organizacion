/* Organización v2 */
const STORAGE_KEY = 'organizacion_v2';
const RESPALDO_DEFECTO_URL = 'data/organizacion-respaldo-2026-06-24.json';
const AGENTES_RAMAS_URL = 'data/agentes-ramas.json';
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DIAS_CORTOS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
const MAX_TITULO_SEMANA = 40;

const COLORES = {
  lavanda: { border: '#c4b8e8', bg: '#f0ecfa', text: '#6a5a9e' },
  celeste: { border: '#98c8e0', bg: '#e8f4fc', text: '#4a7a9e' },
  menta: { border: '#a8dcc8', bg: '#eaf8f2', text: '#4a8a6e' },
  mentaSuave: { border: '#a4d4c8', bg: '#e8f4ef', text: '#4a8670' },
  durazno: { border: '#e8c4a8', bg: '#fdf4ec', text: '#9a6a4a' },
  agua: { border: '#a8d8dc', bg: '#e8f6f8', text: '#4a7a80' },
  rosa: { border: '#e8b8c8', bg: '#fdf0f4', text: '#9a5a6e' },
  grafito: { border: '#b8c0c8', bg: '#eef0f4', text: '#5a6a7a' },
  /** Salud — verde más definido, aún claro pero distinto de clientes menta/celeste */
  salud: { border: '#2f9d72', bg: '#c5e8d8', text: '#1a5c42' },
  /** Reuniones — azul pizarra, no usa el color del cliente */
  reunion: { border: '#4a6f9c', bg: '#cddced', text: '#243d5c' }
};

/** Una frase breve por día — índice según la fecha */
const FRASES_MOTIVACIONALES = [
  'Un paso a la vez 💪',
  'Hoy también suma ✨',
  'Enfócate en lo importante 🎯',
  'Pequeños avances, gran impacto 🌱',
  'Tú puedes con este día ☀️',
  'Respira y sigue 🌬️',
  'Hecho es mejor que perfecto ✅',
  'Una tarea menos, más cerca 🚀',
  'Constancia gana la carrera 🐢',
  'Tu futuro yo te lo agradecerá 🙌',
  'Menos scroll, más entregar 📵',
  'Prioriza, ejecuta, celebra 🎉',
  'El progreso es progreso 📈',
  'Mantén la calma y organiza 🧘',
  'Hoy es buen día para avanzar 🌤️',
  'Disciplina suave, resultados reales 💎',
  'Cierra lo que abriste 🔒',
  'Energía enfocada ⚡',
  'Menos ruido, más claridad 🎧',
  'Cada entrega cuenta 📦',
  'Confía en tu ritmo 🎵',
  'Empieza por lo más simple 🪜',
  'Buen trabajo se nota 👀',
  'Agenda clara, mente clara 🧠',
  'Pequeña victoria del día 🏆',
  'Sigue, estás más cerca 🔥',
  'Orden crea tranquilidad 🗂️',
  'Hoy mereces orgullo 💜',
  'Hazlo con calma, hazlo bien ✍️',
  'Un bloque, un logro ⏱️',
  'Menos multitarea, más foco 🔦',
  'Avanza aunque sea poquito 🌊',
  'Tu esfuerzo de hoy importa 💫',
  'Empieza: el resto fluye 🍃',
  'Celebra lo que ya hiciste 🥳'
];

const AGENTES_CLIENTE = {
  'cli-trendseeker': {
    nombre: 'Agente Trendseeker',
    emoji: '📊',
    especialidad: 'Community Manager, Metricool y WordPress',
    instrucciones: 'Eres el asistente de Trendseeker - Talk. Ayudas con publicaciones en redes, informes Metricool, historias, banners del sitio y tareas de WordPress (productos, precios, carga masiva).'
  },
  'cli-ecr': {
    nombre: 'Agente ECR',
    emoji: '📝',
    especialidad: 'Newsletter LinkedIn y desarrollo de blog',
    instrucciones: 'Eres el asistente de ECR. Ayudas con newsletters de LinkedIn, copys, carruseles, videos y propuestas o secciones del blog en Elementor / WordPress.'
  },
  'cli-piscineria': {
    nombre: 'Agente Piscineria',
    emoji: '🏊',
    especialidad: 'Publicación de contenidos en redes',
    instrucciones: 'Eres el asistente de Piscineria. Ayudas a publicar los 8 contenidos mensuales solo en días hábiles (lunes a viernes, sin feriados chilenos), en feed, repostear en historias con link y agregar música cuando no son videos.'
  },
  'cli-hotspring': {
    nombre: 'Agente Hotspring',
    emoji: '♨️',
    especialidad: 'Publicación de contenidos en redes',
    instrucciones: 'Eres el asistente de Hotspring. Ayudas a publicar los 8 contenidos mensuales solo en días hábiles (lunes a viernes, sin feriados chilenos), en feed, repostear en historias con link y agregar música cuando no son videos.'
  },
  'cli-mkof': {
    nombre: 'Agente MKOF',
    emoji: '📐',
    especialidad: 'Planificación y entregables de proyecto',
    instrucciones: 'Eres el asistente de MKOF. Ayudas con Gantt, cronogramas post auditoría, definición de tiempos y entregables del proyecto.'
  },
  'cli-joyas-mercury': {
    nombre: 'Agente Joyas Mercury',
    emoji: '💎',
    especialidad: 'Fase 2 — rediseño y desarrollo joyasmercury.cl',
    instrucciones: 'Eres el asistente de Joyas Mercury (Fase 2). Ayudas con el rediseño WooCommerce sin Elementor: menú limpio, 3 colecciones × 5 categorías, filtros Esencial/Gold/Deluxe, destacados, páginas legales, carrito, pruebas, guías y entrega. Sigue la etapa del día según el cronograma acordado.'
  },
  'cli-sie': {
    nombre: 'Agente SIE',
    emoji: '⚖️',
    especialidad: 'Buscador de sentencias judiciales',
    instrucciones: 'Eres el asistente de SIE. Ayudas a desarrollar el buscador de sentencias: ingesta de datos, indexación full-text, API, filtros (tribunal, fecha, materia), UI de resultados, vista detalle y despliegue. El avance es en sesiones de 1–2 h los sábados, domingos y feriados.'
  },
  'cli-desafio-latam': {
    nombre: 'Agente Desafío Latam',
    emoji: '🎨',
    especialidad: 'Diseño freelance',
    instrucciones: 'Eres el asistente de Desafío Latam. Ayudas con diseño freelance: piezas gráficas, presentaciones, identidad visual, banners, materiales para redes y entregables visuales según cada encargo esporádico.'
  }
};

const AGENTE_GENERICO = {
  nombre: 'Agente general',
  emoji: '🤖',
  especialidad: 'Organización y productividad',
  instrucciones: 'Eres un asistente de productividad. Ayudas a planificar, desglosar y completar la tarea del día.'
};

/** Skill / automatización por cliente — guía el prompt y el entregable */
const SKILL_GENERICO = {
  nombre: 'Productividad general',
  descripcion: 'Organizar la tarea y producir un entregable concreto.',
  usaManualMarca: false,
  checklist: ['Definir entregable y formato', 'Confirmar plazo', 'Ejecutar, revisar y cerrar'],
  ejemploSolicitud: 'Necesito [entregable] para esta tarea. Formato: [ej. copy, código, diseño]. Detalles: …'
};

const SKILLS_CLIENTE = {
  'cli-trendseeker': {
    nombre: 'CM + WordPress TS',
    descripcion: 'Redes, Metricool, historias, banners y mantenimiento WordPress.',
    usaManualMarca: true,
    checklist: ['Copies y gráficas del cliente', 'Horario de publicación', 'Manual de marca en banners', 'Repost en historias con link'],
    ejemploSolicitud: 'Necesito el copy y checklist para publicar [pieza] en redes / actualizar [banner o producto] en WP.'
  },
  'cli-ecr': {
    nombre: 'Newsletter + Blog ECR',
    descripcion: 'LinkedIn, copys, carruseles y secciones blog en Elementor.',
    usaManualMarca: true,
    checklist: ['Tono y estructura del NL', 'Copys feed / carrusel / video', 'Componentes Elementor reutilizables'],
    ejemploSolicitud: 'Ayúdame con el copy del carrusel / la estructura de la sección blog para [tema].'
  },
  'cli-piscineria': {
    nombre: 'Publicación contenidos PISC',
    descripcion: 'Feed, historias con link y música en días hábiles.',
    usaManualMarca: false,
    checklist: ['Material del cliente listo', 'Solo lun–vie sin feriados', 'Feed + historias + música si aplica'],
    ejemploSolicitud: 'Checklist y textos para publicar contenido #[n] de Piscineria.'
  },
  'cli-hotspring': {
    nombre: 'Publicación contenidos HS',
    descripcion: 'Igual que PISC: feed, historias y música en días hábiles.',
    usaManualMarca: false,
    checklist: ['Material del cliente listo', 'Solo lun–vie sin feriados', 'Feed + historias + música si aplica'],
    ejemploSolicitud: 'Checklist y textos para publicar contenido #[n] de Hotspring.'
  },
  'cli-mkof': {
    nombre: 'Planificación MKOF',
    descripcion: 'Gantt, cronogramas, entregables post auditoría.',
    usaManualMarca: false,
    checklist: ['Hitos con fechas', 'Dependencias', 'Criterios de aceptación'],
    ejemploSolicitud: 'Arma el Gantt / desglose de entregables para [etapa] con tiempos estimados.'
  },
  'cli-joyas-mercury': {
    nombre: 'Dev WooCommerce JM',
    descripcion: 'Rediseño tienda sin Elementor: menú, filtros, destacados, carrito.',
    usaManualMarca: true,
    checklist: ['Etapa del cronograma Fase 2', 'Responsive y UX', 'Colores/tipografía de marca', 'Pruebas antes de cerrar'],
    ejemploSolicitud: 'Audita el menú hamburguesa móvil de joyasmercury.cl (categorías repetidas) y entrégame un mapa conceptual + mockup del menú propuesto para que Camila lo apruebe. Adjunto capturas del sitio.'
  },
  'cli-sie': {
    nombre: 'Buscador sentencias SIE',
    descripcion: 'Ingesta, indexación, API, UI de búsqueda y filtros legales.',
    usaManualMarca: false,
    checklist: ['Formato de datos', 'Relevancia de búsqueda', 'Filtros tribunal/fecha/materia', 'Rendimiento'],
    ejemploSolicitud: 'Implementar / revisar [módulo] del buscador: [detalle técnico].'
  },
  'cli-desafio-latam': {
    nombre: 'Diseño con manual de marca',
    descripcion: 'Piezas gráficas, presentaciones y visuales según encargo esporádico.',
    usaManualMarca: true,
    checklist: ['Manual de marca cargado', 'Brief y formatos de entrega', 'Colores y tipografías oficiales', 'Márgenes de logo'],
    ejemploSolicitud: 'Diseña [pieza: banner / presentación / key visual] para [campaña]. Formato: [dimensiones]. Mensaje: …'
  }
};

const MAX_MANUAL_MARCA_CHARS = 80000;
const MAX_ARCHIVO_MANUAL_CHARS = 40000;

const NOTAS_PUB_CONTENIDO = 'Publicar en feed (solo días hábiles: lun–vie, sin feriados). Repostear en historias con link. Agregar música si no es video.';

const JM_FASE2_INICIO = '2026-06-24';
const JM_CLI_ID = 'cli-joyas-mercury';
const JM_ENTREGA_SITIO_ID = 'tarea-jm-entrega-sitio';

/** Texto extraído de «Manual de marca - Joyas Mercury.pdf» (17 pág.) — sin binario para ahorrar espacio */
const MANUAL_MARCA_JOYAS_MERCURY = `Manual de marca — Joyas Mercury
Fuente: Manual de marca - Joyas Mercury.pdf

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

/** Gantt Fase 2 — herramientas gratuitas (sin Elementor): 24 días · joyasmercury.cl */
const PLAN_JM_FASE2 = [
  { etapa: 1, titulo: '[JM] E1 — Auditoría menú y bloques repetidos', notas: 'Etapa 1 · Menú y limpieza visual (3d). Revisar menú actual, identificar bloques repetidos y definir estructura con colecciones como protagonista.' },
  { etapa: 1, titulo: '[JM] E1 — Menú limpio y navegación por colección', notas: 'Etapa 1 · Implementar menú limpio. Colecciones como eje principal de navegación (Inicio → Colección → Categoría).' },
  { etapa: 1, titulo: '[JM] E1 — Ajustes responsive y revisión visual', notas: 'Etapa 1 · Pulir menú en mobile/desktop, coherencia visual y flujo de navegación.' },
  { etapa: 2, titulo: '[JM] E2 — Estructura 3 colecciones × 5 categorías', notas: 'Etapa 2 · Categorías y etiquetas (3d). Definir 3 colecciones con 5 categorías c/u (Aros, Cadenas, etc.) = 15 combinaciones.' },
  { etapa: 2, titulo: '[JM] E2 — Configurar categorías y etiquetas WC', notas: 'Etapa 2 · Crear categorías, etiquetas y relaciones en WooCommerce según la estructura acordada.' },
  { etapa: 2, titulo: '[JM] E2 — Validar 15 combinaciones y URLs', notas: 'Etapa 2 · Probar cada combinación colección/categoría, slugs y enlaces internos.' },
  { etapa: 3, titulo: '[JM] E3 — Diseño filtros Esencial / Gold / Deluxe', notas: 'Etapa 3 · Filtros visuales (5–7d). Diseñar chips/botones de filtro para las 3 líneas de producto.' },
  { etapa: 3, titulo: '[JM] E3 — Landing filtros · colección 1', notas: 'Etapa 3 · Primera landing de colección con filtros visuales integrados.' },
  { etapa: 3, titulo: '[JM] E3 — Landing filtros · colección 2', notas: 'Etapa 3 · Segunda landing de colección con filtros visuales.' },
  { etapa: 3, titulo: '[JM] E3 — Landing filtros · colección 3', notas: 'Etapa 3 · Tercera landing de colección con filtros visuales (3 landings totales).' },
  { etapa: 3, titulo: '[JM] E3 — Filtrado AJAX sin recargar página', notas: 'Etapa 3 · Misma página, filtros Esencial/Gold/Deluxe sin recarga. Probar en las 3 colecciones.' },
  { etapa: 3, titulo: '[JM] E3 — Pruebas UX y ajustes de filtros', notas: 'Etapa 3 · QA filtros, estados activos, mobile y rendimiento.' },
  { etapa: 4, titulo: '[JM] E4 — Sección Productos Destacados en Inicio', notas: 'Etapa 4 · Destacados + capacitación (2d). Bloque en home donde Camila elige qué mostrar.' },
  { etapa: 4, titulo: '[JM] E4 — Capacitación productos destacados', notas: 'Etapa 4 · Documentar y capacitar cómo marcar/desmarcar productos destacados.' },
  { etapa: 5, titulo: '[JM] E5 — Nosotros, contacto y WhatsApp', notas: 'Etapa 5 · Páginas legales y contenidos (1–2d). Nosotros, contacto y enlace/botón WhatsApp.' },
  { etapa: 5, titulo: '[JM] E5 — Políticas legales y contenidos', notas: 'Etapa 5 · Políticas de envío, privacidad, términos y textos legales pendientes.' },
  { etapa: 6, titulo: '[JM] E6 — Maquetación página carrito', notas: 'Etapa 6 · Página carrito (3d). Layout carrito alineado al rediseño de la tienda.' },
  { etapa: 6, titulo: '[JM] E6 — Flujo checkout y resumen de pedido', notas: 'Etapa 6 · Checkout, totales, envío y experiencia de compra.' },
  { etapa: 6, titulo: '[JM] E6 — Ajustes mobile y pruebas carrito', notas: 'Etapa 6 · Pruebas carrito/checkout en mobile y correcciones.' },
  { etapa: 7, titulo: '[JM] E7 — Pruebas integrales del sitio', notas: 'Etapa 7 · Pruebas, guía y entrega (5d). Recorrido completo: menú, filtros, destacados, legales, carrito.' },
  { etapa: 7, titulo: '[JM] E7 — Corrección de bugs y refinamiento', notas: 'Etapa 7 · Resolver issues detectados en pruebas integrales.' },
  { etapa: 7, titulo: '[JM] E7 — Guía gestión de catálogo', notas: 'Etapa 7 · Redactar guía para que Camila gestione productos, colecciones y destacados sola.' },
  { etapa: 7, titulo: '[JM] E7 — Capacitación final con cliente', notas: 'Etapa 7 · Sesión de capacitación: catálogo, páginas, banners y pedidos.' },
  { etapa: 7, titulo: '[JM] E7 — Entrega Fase 2 y soporte inicial', notas: 'Etapa 7 · Entrega del sitio aprobado. Inicio de ventana de 10 días de soporte incluido.' }
];

const SIE_CLI_ID = 'cli-sie';
const SIE_INICIO = '2026-06-24';
const DLAT_CLI_ID = 'cli-desafio-latam';

/** Buscador de sentencias — sesiones solo sáb/dom/feriados */
const PLAN_SIE = [
  { titulo: '[SIE] Alcance y fuentes de datos', notas: 'Definir fuentes de sentencias, campos obligatorios y alcance del MVP del buscador.' },
  { titulo: '[SIE] Modelo de datos y metadatos', notas: 'Esquema: tribunal, rol, fecha, materia, extracto, texto completo y vínculos.' },
  { titulo: '[SIE] Pipeline ingesta y normalización', notas: 'Importar, limpiar y normalizar textos; manejo de duplicados y encoding.' },
  { titulo: '[SIE] Motor de indexación full-text', notas: 'Configurar índice de búsqueda (tokenización, stopwords, relevancia).' },
  { titulo: '[SIE] API búsqueda — endpoints base', notas: 'Endpoint de consulta por término con paginación y tiempo de respuesta.' },
  { titulo: '[SIE] API — filtros y ordenamiento', notas: 'Filtros por tribunal, rango de fechas, materia; sort por relevancia o fecha.' },
  { titulo: '[SIE] UI buscador — layout base', notas: 'Estructura de página: barra principal, filtros y zona de resultados.' },
  { titulo: '[SIE] UI — barra de búsqueda', notas: 'Input de búsqueda, envío, estados loading/error y sugerencias básicas.' },
  { titulo: '[SIE] UI — listado de resultados', notas: 'Tarjetas con rol, tribunal, fecha, extracto y enlace al detalle.' },
  { titulo: '[SIE] UI — panel de filtros', notas: 'Filtros laterales o colapsables: tribunal, fecha, materia.' },
  { titulo: '[SIE] Vista detalle de sentencia', notas: 'Página de detalle con texto completo, metadatos y navegación de vuelta.' },
  { titulo: '[SIE] Resaltado de coincidencias', notas: 'Highlight de términos buscados en extractos y vista detalle.' },
  { titulo: '[SIE] Paginación y estados vacíos', notas: 'Sin resultados, pocos resultados, paginación y mensajes claros al usuario.' },
  { titulo: '[SIE] Pruebas integrales del buscador', notas: 'QA end-to-end: búsquedas reales, filtros combinados y casos borde.' },
  { titulo: '[SIE] Optimización de consultas', notas: 'Perfil de rendimiento, índices y tiempos de respuesta en consultas pesadas.' },
  { titulo: '[SIE] Ajustes UX y mobile', notas: 'Responsive, accesibilidad básica y pulido visual del buscador.' },
  { titulo: '[SIE] Documentación técnica', notas: 'Documentar API, ingesta, despliegue y manual de operación.' },
  { titulo: '[SIE] Deploy y verificación producción', notas: 'Publicar, smoke tests en producción y checklist de entrega.' }
];

const FERIADOS_CHILE = new Set([
  '2025-01-01', '2025-04-18', '2025-04-19', '2025-05-01', '2025-05-21',
  '2025-06-20', '2025-06-29', '2025-07-16', '2025-08-15', '2025-09-18', '2025-09-19',
  '2025-10-12', '2025-10-31', '2025-11-01', '2025-12-08', '2025-12-25',
  '2026-01-01', '2026-04-03', '2026-04-04', '2026-05-01', '2026-05-21',
  '2026-06-21', '2026-06-29', '2026-07-16', '2026-08-15', '2026-09-18', '2026-09-19',
  '2026-10-12', '2026-10-31', '2026-11-01', '2026-12-08', '2026-12-25',
  '2027-01-01', '2027-03-26', '2027-03-27', '2027-05-01', '2027-05-21',
  '2027-06-21', '2027-06-28', '2027-07-16', '2027-08-15', '2027-09-18', '2027-09-19',
  '2027-10-11', '2027-10-31', '2027-11-01', '2027-12-08', '2027-12-25'
]);

const ESTADOS_CITA = {
  asisti: { label: 'Asistí', icon: '✓' },
  reagendada: { label: 'Reagendada', icon: '↻' },
  anulada: { label: 'Anulada', icon: '✕' }
};

const TOOLTIPS = {
  toggle: 'Marcar como hecha o deshacer',
  pendiente: 'Mover a pendientes (misma tarea, sin duplicar)',
  eliminar: 'Eliminar tarea',
  editar: 'Editar tarea',
  pend_hoy: 'Agendar en el calendario de hoy',
  pend_ok: 'Marcar como hecha',
  pend_del: 'Eliminar tarea',
  agendar: 'Volver al calendario en su fecha'
};

let semanaOffset = 0;
let mesOffset = 0;
let diaSeleccionado = null;
let tareaSeleccionada = null;
let clientePerfilAbierto = null;

const PERFILES_CLIENTE = {
  'cli-trendseeker': { nombre: 'Trendseeker - Talk (full time)', tipo: 'full-time' },
  'cli-ecr': { nombre: 'ECR - Talk (full time)', tipo: 'full-time' },
  'cli-piscineria': { nombre: 'Piscinería - Talk (full time)', tipo: 'full-time' },
  'cli-hotspring': { nombre: 'Hotspring - Talk (full time)', tipo: 'full-time' },
  'cli-mkof': { nombre: 'MKOF - Talk (full time)', tipo: 'full-time' },
  'cli-sie': { tipo: 'oportunidad' },
  'cli-desafio-latam': { abrev: 'ADL' }
};
let datos = null;

function id() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function hoy() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISO(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatFecha(d) {
  return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function fraseMotivacionalDelDia(fecha = hoy()) {
  const d = typeof fecha === 'string' ? parseISO(fecha) : fecha;
  const dias = Math.floor(d.getTime() / 86400000);
  const idx = ((dias % FRASES_MOTIVACIONALES.length) + FRASES_MOTIVACIONALES.length) % FRASES_MOTIVACIONALES.length;
  return FRASES_MOTIVACIONALES[idx];
}

function actualizarHeaderFecha() {
  const hoyDate = hoy();
  const fechaEl = document.getElementById('fecha-actual');
  const fraseEl = document.getElementById('header-frase-motivacional');
  if (fechaEl) fechaEl.textContent = formatFecha(hoyDate);
  if (fraseEl) fraseEl.textContent = fraseMotivacionalDelDia(hoyDate);
}

function escapeHtml(s) {
  const el = document.createElement('span');
  el.textContent = s ?? '';
  return el.innerHTML;
}

function inicioSemana(fecha) {
  const d = new Date(fecha);
  const n = d.getDay();
  d.setDate(d.getDate() + (n === 0 ? -6 : 1 - n));
  d.setHours(0, 0, 0, 0);
  return d;
}

function esDiaHabil(fecha) {
  const d = typeof fecha === 'string' ? parseISO(fecha) : new Date(fecha);
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return false;
  return !FERIADOS_CHILE.has(toISO(d));
}

function diasHabilesMes(anio, mes) {
  const habiles = [];
  const diasMes = new Date(anio, mes, 0).getDate();
  for (let dia = 1; dia <= diasMes; dia++) {
    const f = new Date(anio, mes - 1, dia);
    if (esDiaHabil(f)) habiles.push(toISO(f));
  }
  return habiles;
}

function yyyymm(anio, mes) {
  return `${anio}${String(mes).padStart(2, '0')}`;
}

function fechasContenidosMensuales(anio, mes, cantidad = 8, desfase = 0) {
  const habiles = diasHabilesMes(anio, mes);
  if (!habiles.length) return [];

  const fechas = [];
  const indices = new Set();
  for (let i = 0; i < cantidad; i++) {
    let idx = Math.round(((i + 0.5) / cantidad) * habiles.length - 0.5) + desfase;
    idx = Math.max(0, Math.min(habiles.length - 1, idx));
    while (indices.has(idx) && idx < habiles.length - 1) idx++;
    while (indices.has(idx) && idx > 0) idx--;
    indices.add(idx);
    fechas.push(habiles[idx]);
  }
  return fechas.sort();
}

function tareasContenidosMensuales(cliId, abrev, rolId, anio, mes, desfase = 0) {
  const ym = yyyymm(anio, mes);
  const fechas = fechasContenidosMensuales(anio, mes, 8, desfase);
  return fechas.map((fecha, i) => ({
    id: `tarea-${cliId}-${ym}-pub-${i + 1}`,
    titulo: `[${abrev}] Pub contenido ${i + 1}`,
    clienteId: cliId,
    rolId,
    fecha,
    horaInicio: '10:00',
    horaFin: '10:45',
    prioridad: 'media',
    completada: false,
    pendiente: false,
    notas: NOTAS_PUB_CONTENIDO
  }));
}

function datosIniciales() {
  const cliTS = 'cli-trendseeker';
  const cliECR = 'cli-ecr';
  const cliPISC = 'cli-piscineria';
  const cliHS = 'cli-hotspring';
  const cliMKOF = 'cli-mkof';
  const cliJM = 'cli-joyas-mercury';
  const cliSIE = 'cli-sie';
  const cliDLAT = 'cli-desafio-latam';
  const hoyStr = toISO(hoy());

  return {
    clientes: [
      {
        id: cliTS,
        nombre: 'Trendseeker - Talk (full time)',
        abrev: 'TS',
        tipo: 'full-time',
        color: 'lavanda',
        roles: [
          {
            id: 'rol-cm',
            nombre: 'Community Manager',
            abrev: 'CM',
            funciones: 'Manejar redes\nPublicar contenido\nHistorias redes\nInforme Metricool',
            tareasAlMes: 'Pub redes (x12)\nReporte mensual',
            plazosEntregables: '25/06 - Pub redes\n26/06 - Pub redes\n30/06 - Pub redes\n01/07 - Reporte junio'
          },
          {
            id: 'rol-wp',
            nombre: 'Desarrollo Wordpress',
            abrev: 'DEV',
            funciones: 'Editar frontend\nGestionar banners\nActualizar productos',
            tareasAlMes: 'Subir banner\nBajar banner\nCambiar precios\nCarga masiva',
            plazosEntregables: '28/06 - Carga masiva\n01/07 - Revisión término descuento'
          }
        ]
      },
      {
        id: cliECR,
        nombre: 'ECR - Talk (full time)',
        abrev: 'ECR',
        tipo: 'full-time',
        color: 'celeste',
        roles: [
          {
            id: 'rol-ecr-cm',
            nombre: 'Community Manager',
            abrev: 'CM',
            funciones: 'Newsletter LinkedIn\nArtículo con portada\nArtículo entregado listo',
            tareasAlMes: '2 NL al mes\n3 copys por NL',
            plazosEntregables: 'NL: copy feed invitación\nNL: copy carrusel + link\nNL: copy video artículo'
          },
          {
            id: 'rol-ecr-dev',
            nombre: 'Desarrollo Blog',
            abrev: 'DEV',
            funciones: 'Propuestas blog\nElementor\nWordPress',
            tareasAlMes: 'Propuestas según solicitud',
            plazosEntregables: 'Entregas puntuales del blog'
          }
        ]
      },
      {
        id: cliPISC,
        nombre: 'Piscinería - Talk (full time)',
        abrev: 'PISC',
        tipo: 'full-time',
        color: 'menta',
        roles: [
          {
            id: 'rol-pisc-cm',
            nombre: 'Community Manager',
            abrev: 'CM',
            funciones: 'Cliente entrega info, copys y gráficas\nPublicar contenidos en feed (solo días hábiles)\nRepostear en historias con link\nAgregar música si no son videos',
            tareasAlMes: '8 contenidos al mes\nSolo lun–vie, sin feriados',
            plazosEntregables: '8 publicaciones en días hábiles del mes'
          }
        ]
      },
      {
        id: cliHS,
        nombre: 'Hotspring - Talk (full time)',
        abrev: 'HS',
        tipo: 'full-time',
        color: 'mentaSuave',
        roles: [
          {
            id: 'rol-hs-cm',
            nombre: 'Community Manager',
            abrev: 'CM',
            funciones: 'Cliente entrega info, copys y gráficas\nPublicar contenidos en feed (solo días hábiles)\nRepostear en historias con link\nAgregar música si no son videos',
            tareasAlMes: '8 contenidos al mes\nSolo lun–vie, sin feriados',
            plazosEntregables: '8 publicaciones en días hábiles del mes'
          }
        ]
      },
      {
        id: cliMKOF,
        nombre: 'MKOF - Talk (full time)',
        abrev: 'MKOF',
        tipo: 'full-time',
        color: 'agua',
        roles: [
          {
            id: 'rol-mkof-dev',
            nombre: 'Desarrollo',
            abrev: 'DEV',
            funciones: 'Planificación de proyectos\nGantt y cronogramas\nDefinición de entregables',
            tareasAlMes: 'Entregables según etapa del proyecto',
            plazosEntregables: 'Según acuerdos del proyecto'
          }
        ]
      },
      {
        id: cliJM,
        nombre: 'Joyas Mercury',
        abrev: 'JM',
        tipo: 'freelance',
        color: 'rosa',
        roles: [
          {
            id: 'rol-jm-dev',
            nombre: 'Desarrollo Web',
            abrev: 'DEV',
            funciones: 'Rediseño del sitio web\nUX/UI y maquetación\nComponentes y páginas\nContenido y estructura',
            tareasAlMes: 'Avance según etapas del rediseño',
            plazosEntregables: '30/07 — Entrega sitio web'
          }
        ]
      },
      {
        id: cliSIE,
        nombre: 'SIE',
        abrev: 'SIE',
        tipo: 'oportunidad',
        color: 'grafito',
        roles: [
          {
            id: 'rol-sie-dev',
            nombre: 'Desarrollo',
            abrev: 'DEV',
            funciones: 'Buscador de sentencias\nIngesta e indexación\nAPI y frontend de búsqueda',
            tareasAlMes: 'Avance en sesiones fin de semana y feriados',
            plazosEntregables: 'Entregas según plan de desarrollo del buscador'
          }
        ]
      },
      {
        id: cliDLAT,
        nombre: 'Desafío Latam',
        abrev: 'ADL',
        tipo: 'freelance',
        color: 'durazno',
        roles: [
          {
            id: 'rol-dlat-dis',
            nombre: 'Diseño',
            abrev: 'DIS',
            funciones: 'Piezas gráficas y visuales\nPresentaciones y materiales\nBanners y piezas para redes\nEncargos esporádicos según proyecto',
            tareasAlMes: 'Según encargos del momento',
            plazosEntregables: 'Agregar cada tarea en + Nueva tarea cuando llegue un encargo'
          }
        ]
      }
    ],
    tareas: [],
    citasSalud: [
      { id: 'cita-psiq', fecha: '2026-06-25', hora: '18:00', especialidad: 'Psiquiatra', notas: 'Consulta online' },
      { id: 'cita-cesfam', fecha: '2026-06-26', hora: '08:30', especialidad: 'Exámenes Cesfam', notas: 'Cesfam Vitacura' }
    ],
    reunionesClientes: [
      {
        id: 'reunion-ecr-25jun',
        clienteId: 'cli-ecr',
        fecha: '2026-06-25',
        horaInicio: '12:00',
        horaFin: '13:00',
        titulo: 'Reunión ECR',
        notas: 'Reunión con cliente'
      }
    ],
    tareasEliminadas: [],
    meta: { autoGenerarTareas: false, modoTrabajo: 'manual' }
  };
}

function debeAutoGenerarTareas(data) {
  return data?.meta?.autoGenerarTareas === true;
}

function initMetaDatos(data) {
  if (!Array.isArray(data.tareasEliminadas)) data.tareasEliminadas = [];
  if (!Array.isArray(data.reunionesClientes)) data.reunionesClientes = [];
  if (!data.meta || typeof data.meta !== 'object') data.meta = {};
  if (data.meta.autoGenerarTareas == null) data.meta.autoGenerarTareas = false;
  return data;
}

/** v6: calendario vacío — tareas solo con + Nueva (jun 2026) */
const RESPALDO_VERSION_ACTUAL = 6;

function aplicarMigracionRespaldo(data) {
  const v = data.respaldoVersion || 0;
  if (v >= RESPALDO_VERSION_ACTUAL) return data;
  data.tareas = [];
  if (!data.meta) data.meta = {};
  data.meta.autoGenerarTareas = false;
  data.meta.modoTrabajo = 'manual';
  data.meta.nota = 'Calendario vacío — agrega encargos con + Nueva cuando avances';
  data.respaldoVersion = RESPALDO_VERSION_ACTUAL;
  data.respaldoActualizado = '2026-06-27';
  return data;
}

/** No pisar fecha/horario si el usuario ya ajustó la agenda (o viene del respaldo). */
function sincronizarAgendaTarea(tarea, { fecha, horaInicio, horaFin } = {}) {
  if (!tarea || tarea.agendaFijada) return;
  if (fecha != null) tarea.fecha = fecha;
  if (horaInicio != null) tarea.horaInicio = horaInicio;
  if (horaFin != null) tarea.horaFin = horaFin;
}

/** Las tareas existentes conservan hecha / pendiente — solo las nuevas usan valores por defecto. */
function sincronizarEstadoTarea(tarea, { completada, pendiente } = {}) {
  if (!tarea) return;
  if (tarea.estadoFijado) return;
  if (completada != null && tarea.completada == null) tarea.completada = completada;
  if (pendiente != null && tarea.pendiente == null) tarea.pendiente = pendiente;
}

function fijarAgendaUsuario(tarea) {
  if (!tarea) return;
  tarea.agendaFijada = true;
  tarea.estadoFijado = true;
}

function fijarEstadoUsuario(tarea) {
  if (tarea) tarea.estadoFijado = true;
}

function fingerprintTarea(t) {
  const titulo = nombreBaseTarea(t).toLowerCase().replace(/\s+/g, ' ').trim();
  const cli = t.clienteId || 'sin-cliente';
  const fecha = t.fecha || '';
  return `fp:${cli}:${fecha}:${titulo}`;
}

function clavesEliminacionTarea(t) {
  if (!t) return [];
  const claves = [];
  if (t.id) claves.push(t.id);
  claves.push(fingerprintTarea(t));

  const pub = (t.titulo || '').match(/pub contenido\s*(\d+)/i);
  if (pub && t.clienteId && t.fecha) {
    const [y, m] = t.fecha.split('-');
    claves.push(`tarea-${t.clienteId}-${y}${m}-pub-${pub[1]}`);
    claves.push(`tarea-${t.clienteId}-pub-${pub[1]}`);
  }
  if (/revisi[oó]n t[eé]rmino descuento/i.test(t.titulo || '')) claves.push('tarea-revision-descuento-jul');
  if (/propuesta.*blog/i.test(t.titulo || '') && t.clienteId === 'cli-ecr') claves.push('tarea-ecr-blog-24');
  if (/gantt.*etapa\s*2/i.test(t.titulo || '') && t.clienteId === 'cli-mkof') claves.push('tarea-mkof-gantt-etapa2');
  if ((t.id || '').startsWith('tarea-jm-f2-')) claves.push(t.id);
  if (/^\[JM\]/i.test(t.titulo || '') && t.clienteId === JM_CLI_ID && t.fecha) {
    claves.push(`fp-jm:${t.fecha}:${nombreBaseTarea(t).toLowerCase()}`);
  }
  if ((t.id || '').startsWith('tarea-sie-')) claves.push(t.id);
  if (/^\[SIE\]/i.test(t.titulo || '') && t.clienteId === SIE_CLI_ID && t.fecha) {
    claves.push(`fp-sie:${t.fecha}:${nombreBaseTarea(t).toLowerCase()}`);
  }
  if (/reporte/i.test(t.titulo || '') && t.clienteId === 'cli-trendseeker' && t.fecha) {
    claves.push(`tarea-ts-reporte-${t.fecha}`);
  }

  return [...new Set(claves.filter(Boolean))];
}

function registrarTareaEliminada(data, tarea) {
  initMetaDatos(data);
  clavesEliminacionTarea(tarea).forEach(k => {
    if (!data.tareasEliminadas.includes(k)) data.tareasEliminadas.push(k);
  });
  return data;
}

function tareaFueEliminada(data, taskId, tareaRef = null) {
  if (taskId && data.tareasEliminadas?.includes(taskId)) return true;
  const ref = tareaRef || (taskId ? { id: taskId } : null);
  if (!ref) return false;
  return clavesEliminacionTarea(ref).some(k => data.tareasEliminadas?.includes(k));
}

function eliminarTarea(tareaId) {
  if (!tareaId) return;
  initMetaDatos(datos);
  const t = tareaDe(tareaId);
  if (t) registrarTareaEliminada(datos, t);
  else if (!datos.tareasEliminadas.includes(tareaId)) datos.tareasEliminadas.push(tareaId);
  datos.tareas = datos.tareas.filter(t => t.id !== tareaId);
  if (tareaSeleccionada === tareaId) {
    tareaSeleccionada = null;
    volverADiaDesdeTarea();
  }
  guardar();
}

function aplicarTareasEliminadas(data) {
  initMetaDatos(data);
  data.tareas = data.tareas.filter(t => !tareaFueEliminada(data, t.id, t));
  return data;
}

function abrevDe(cliente) {
  if (!cliente) return '';
  if (cliente.abrev) return cliente.abrev;
  return cliente.nombre.split(/[\s-]+/).filter(Boolean).map(p => p[0]).join('').slice(0, 3).toUpperCase();
}

function abrevRolNombre(nombre) {
  const map = {
    'Community Manager': 'CM',
    'Desarrollo Wordpress': 'DEV',
    'Desarrollo Blog': 'DEV',
    'Desarrollo': 'DEV',
    'Desarrollo Web': 'DEV',
    'Diseño': 'DIS'
  };
  if (map[nombre]) return map[nombre];
  return (nombre || '').split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 4).toUpperCase();
}

function inferirRol(cliente, tarea) {
  if (!cliente?.roles?.length) return null;
  const t = (tarea.titulo || '').toLowerCase();
  if (/pub redes|pub contenido|reporte|metricool|historia|repost|redes|newsletter|linkedin|copy|carrusel|video|nl\b/i.test(t)) {
    return cliente.roles.find(r => /community manager/i.test(r.nombre)) || null;
  }
  if (/carga masiva|banner|wordpress|revisi[oó]n|precio|descuento|producto|subir|bajar|blog|elementor|propuesta|gantt|auditor|redise|sitio|web|maquet|componente|sentencia|buscador|indexaci/i.test(t)) {
    return cliente.roles.find(r => /wordpress|blog|desarrollo/i.test(r.nombre)) || null;
  }
  if (/diseñ|mockup|figma|illustr|visual|identidad|gráfic|grafic|pieza|presentaci|latam|desaf[ií]o|brand|portada|flyer|key\s*visual/i.test(t)) {
    return cliente.roles.find(r => /diseño/i.test(r.nombre)) || null;
  }
  if (cliente.roles.length === 1) return cliente.roles[0];
  return null;
}

function rolDe(tarea) {
  const cli = clienteDe(tarea.clienteId);
  if (!cli?.roles?.length) return null;
  if (tarea.rolId) return cli.roles.find(r => r.id === tarea.rolId) || null;
  return inferirRol(cli, tarea);
}

function abrevRolDe(tarea) {
  const rol = rolDe(tarea);
  if (!rol) return '';
  return rol.abrev || abrevRolNombre(rol.nombre);
}

function nombreBaseTarea(tarea) {
  return (tarea.titulo || '').replace(/^\[[^\]]+\]\s*/, '').trim();
}

function tituloMes(tarea, max = 24) {
  const rol = abrevRolDe(tarea);
  const cli = abrevDe(clienteDe(tarea.clienteId));
  const texto = [rol, cli, nombreBaseTarea(tarea)].filter(Boolean).join(' ');
  if (!max) return texto;
  return texto.length > max ? texto.slice(0, max - 1) + '…' : texto;
}

function asignarRolesATareas(data) {
  data.clientes.forEach(cli => {
    (cli.roles || []).forEach(r => {
      if (!r.abrev) r.abrev = abrevRolNombre(r.nombre);
    });
  });
  data.tareas.forEach(t => {
    if (!t.rolId) {
      const rol = inferirRol(clienteDe(t.clienteId), t);
      if (rol) t.rolId = rol.id;
    }
  });
  return data;
}

function normalizarTareasTS(data) {
  const cliId = 'cli-trendseeker';
  const cli = data.clientes.find(c => c.id === cliId);
  if (cli && !cli.abrev) cli.abrev = 'TS';
  const abrev = abrevDe(cli) || 'TS';

  data.tareas.forEach(t => {
    if (t.clienteId !== cliId) return;
    t.titulo = t.titulo
      .replace(/^\[(Community Manager|Desarrollo Wordpress)\]\s*/i, `[${abrev}] `)
      .replace(/^\[Trendseeker[^\]]*\]\s*/i, `[${abrev}] `);
    if (!t.agendaFijada) {
      if (/Pub redes\s*10/i.test(t.titulo)) t.fecha = '2026-06-25';
      if (/Pub redes\s*11/i.test(t.titulo)) t.fecha = '2026-06-26';
    }
  });

  data.tareas = data.tareas.filter(t => {
    if (t.clienteId !== cliId) return true;
    if (/Reporte mensual/i.test(t.titulo)) return false;
    if (/Reporte/i.test(t.titulo) && t.fecha === '2026-06-30') return false;
    return true;
  });

  const notasRevision = 'Verificar que los banners no estén publicados y que los productos que terminaron su descuento no se vean en precio promoción en el sitio.';
  let revision = data.tareas.find(t =>
    t.id === 'tarea-revision-descuento-jul' || /revisi[oó]n t[eé]rmino descuento/i.test(t.titulo)
  );
  if (!revision && debeAutoGenerarTareas(data) && !tareaFueEliminada(data, 'tarea-revision-descuento-jul', {
    id: 'tarea-revision-descuento-jul',
    titulo: `[${abrev}] Revisión término descuento`,
    clienteId: cliId,
    fecha: '2026-07-01'
  })) {
    data.tareas.push({
      id: 'tarea-revision-descuento-jul',
      titulo: `[${abrev}] Revisión término descuento`,
      clienteId: cliId,
      rolId: 'rol-wp',
      fecha: '2026-07-01',
      horaInicio: '09:00',
      horaFin: '10:30',
      notas: notasRevision,
      prioridad: 'alta',
      completada: false,
      pendiente: false
    });
  } else if (revision) {
    if (tareaFueEliminada(data, 'tarea-revision-descuento-jul', revision)) {
      data.tareas = data.tareas.filter(t => t.id !== revision.id);
    } else {
      revision.titulo = `[${abrev}] Revisión término descuento`;
      revision.fecha = '2026-07-01';
      revision.rolId = 'rol-wp';
      revision.notas = notasRevision;
    }
  }
  return data;
}

function asegurarClienteECR(data) {
  const cliId = 'cli-ecr';
  let cli = data.clientes.find(c => c.id === cliId);
  if (!cli) {
    const seed = datosIniciales().clientes.find(c => c.id === cliId);
    if (seed) data.clientes.push(seed);
    cli = data.clientes.find(c => c.id === cliId);
  }
  if (cli) {
    cli.abrev = 'ECR';
    if (!cli.color) cli.color = 'celeste';
  }

  if (!debeAutoGenerarTareas(data)) return data;

  const notasBlog = 'Revisar y entregar solicitud de una parte específica del blog (Elementor / WordPress).';
  const plantillaECR = {
    id: 'tarea-ecr-blog-24',
    titulo: '[ECR] Propuesta sección blog',
    clienteId: cliId,
    fecha: '2026-06-24'
  };
  let tarea = data.tareas.find(t => t.id === plantillaECR.id || (t.clienteId === cliId && /propuesta.*blog/i.test(t.titulo)));
  if (!tarea && !tareaFueEliminada(data, plantillaECR.id, plantillaECR)) {
    data.tareas.push({
      id: 'tarea-ecr-blog-24',
      titulo: '[ECR] Propuesta sección blog',
      clienteId: cliId,
      rolId: 'rol-ecr-dev',
      fecha: '2026-06-24',
      horaInicio: '15:00',
      horaFin: '17:00',
      notas: notasBlog,
      prioridad: 'alta',
      completada: false,
      pendiente: false
    });
  } else if (tarea) {
    if (tareaFueEliminada(data, plantillaECR.id, tarea)) {
      data.tareas = data.tareas.filter(t => t.id !== tarea.id);
    } else {
      tarea.id = tarea.id || 'tarea-ecr-blog-24';
      tarea.titulo = '[ECR] Propuesta sección blog';
      tarea.clienteId = cliId;
      tarea.rolId = 'rol-ecr-dev';
      sincronizarAgendaTarea(tarea, { fecha: '2026-06-24', horaInicio: '15:00', horaFin: '17:00' });
      tarea.notas = notasBlog;
    }
  }

  data.tareas.forEach(t => {
    if (t.clienteId === cliId) {
      t.horaInicio = '15:00';
      t.horaFin = '17:00';
    }
  });
  return data;
}

function migrarContenidosLegacy(data, cliId) {
  for (let n = 1; n <= 8; n++) {
    const oldId = `tarea-${cliId}-pub-${n}`;
    const t = data.tareas.find(x => x.id === oldId);
    if (!t) continue;
    const ref = t.fecha ? parseISO(t.fecha) : hoy();
    const newId = `tarea-${cliId}-${yyyymm(ref.getFullYear(), ref.getMonth() + 1)}-pub-${n}`;
    if (tareaFueEliminada(data, oldId, t)) {
      registrarTareaEliminada(data, { ...t, id: newId });
      data.tareas = data.tareas.filter(x => x.id !== oldId);
      continue;
    }
    if (!tareaFueEliminada(data, newId, { ...t, id: newId })) t.id = newId;
  }
}

function asegurarClienteContenidosMes(data, cliId, abrev, color, anio, mes, desfase) {
  let cli = data.clientes.find(c => c.id === cliId);
  if (!cli) {
    const seed = datosIniciales().clientes.find(c => c.id === cliId);
    if (seed) data.clientes.push(seed);
    cli = data.clientes.find(c => c.id === cliId);
  }
  if (!cli) return data;

  cli.abrev = abrev;
  if (!cli.color) cli.color = color;

  const rolId = cli.roles?.[0]?.id;
  if (!rolId) return data;

  const ym = yyyymm(anio, mes);
  const fechas = fechasContenidosMensuales(anio, mes, 8, desfase);

  fechas.forEach((fecha, i) => {
    const num = i + 1;
    const taskId = `tarea-${cliId}-${ym}-pub-${num}`;
    const plantilla = {
      id: taskId,
      titulo: `[${abrev}] Pub contenido ${num}`,
      clienteId: cliId,
      fecha
    };
    let tarea = data.tareas.find(t => t.id === taskId);
    if (!tarea) {
      tarea = data.tareas.find(t =>
        t.clienteId === cliId && t.fecha?.startsWith(`${anio}-${String(mes).padStart(2, '0')}`) &&
        new RegExp(`pub contenido\\s*${num}\\b`, 'i').test(t.titulo)
      );
    }
    if (!tarea && !tareaFueEliminada(data, taskId, plantilla)) {
      data.tareas.push({
        id: taskId,
        titulo: `[${abrev}] Pub contenido ${num}`,
        clienteId: cliId,
        rolId,
        fecha,
        horaInicio: '10:00',
        horaFin: '10:45',
        prioridad: 'media',
        completada: false,
        pendiente: false,
        notas: NOTAS_PUB_CONTENIDO
      });
    } else if (tarea) {
      if (tareaFueEliminada(data, taskId, tarea)) {
        data.tareas = data.tareas.filter(t => t.id !== tarea.id);
      } else {
        tarea.id = taskId;
        tarea.titulo = `[${abrev}] Pub contenido ${num}`;
        tarea.clienteId = cliId;
        tarea.rolId = rolId;
        sincronizarAgendaTarea(tarea, { fecha });
        tarea.notas = NOTAS_PUB_CONTENIDO;
      }
    }
  });
  return data;
}

function asegurarClientesRedes(data) {
  const clientes = [
    { id: 'cli-piscineria', abrev: 'PISC', color: 'menta', desfase: 0 },
    { id: 'cli-hotspring', abrev: 'HS', color: 'mentaSuave', desfase: 1 }
  ];
  const base = hoy();

  clientes.forEach(c => {
    const cli = data.clientes.find(x => x.id === c.id);
    if (cli) cli.color = c.color;
    migrarContenidosLegacy(data, c.id);
  });

  if (!debeAutoGenerarTareas(data)) return data;

  for (let offset = -1; offset <= 3; offset++) {
    const ref = new Date(base.getFullYear(), base.getMonth() + offset, 1);
    clientes.forEach(c => {
      asegurarClienteContenidosMes(data, c.id, c.abrev, c.color, ref.getFullYear(), ref.getMonth() + 1, c.desfase);
    });
  }
  return data;
}

const NOTAS_HISTORIA_WSP_PISC = 'Subir historia en Instagram (repost del feed) con link de WhatsApp. Verificar que el enlace WSP abra correctamente. Agregar música si no es video.';

/** Historias Piscinería — jun 2026 (25, 26, 29, 30) · 17:15–17:30 */
const FECHAS_HISTORIAS_PISC_JUN2026 = ['2026-06-25', '2026-06-26', '2026-06-29', '2026-06-30'];

function asegurarHistoriasPiscineria(data) {
  if (!debeAutoGenerarTareas(data)) return data;
  const cliId = 'cli-piscineria';
  const rolId = 'rol-pisc-cm';

  FECHAS_HISTORIAS_PISC_JUN2026.forEach(fecha => {
    const taskId = `tarea-pisc-historia-${fecha}`;
    const plantilla = {
      id: taskId,
      titulo: '[PISC] Subir historia con link WSP',
      clienteId: cliId,
      fecha
    };
    let tarea = data.tareas.find(t => t.id === taskId);
    if (!tarea) {
      tarea = data.tareas.find(t =>
        t.clienteId === cliId && t.fecha === fecha &&
        /historia.*wsp|historia.*whatsapp/i.test(t.titulo || '')
      );
    }
    if (!tarea && !tareaFueEliminada(data, taskId, plantilla)) {
      data.tareas.push({
        id: taskId,
        titulo: '[PISC] Subir historia con link WSP',
        clienteId: cliId,
        rolId,
        fecha,
        horaInicio: '17:15',
        horaFin: '17:30',
        prioridad: 'media',
        completada: false,
        pendiente: false,
        notas: NOTAS_HISTORIA_WSP_PISC
      });
    } else if (tarea) {
      if (tareaFueEliminada(data, taskId, tarea)) {
        data.tareas = data.tareas.filter(t => t.id !== tarea.id);
      } else {
        tarea.id = taskId;
        tarea.titulo = '[PISC] Subir historia con link WSP';
        tarea.clienteId = cliId;
        tarea.rolId = rolId;
        sincronizarAgendaTarea(tarea, {
          fecha,
          horaInicio: '17:15',
          horaFin: '17:30'
        });
        tarea.notas = NOTAS_HISTORIA_WSP_PISC;
        tarea.prioridad = tarea.prioridad || 'media';
      }
    }
  });
  return data;
}

const NOTAS_HISTORIA_WSP_HS = 'Subir historia en Instagram (repost del feed) con link de WhatsApp. Verificar que el enlace WSP abra correctamente. Agregar música si no es video.';

function asegurarHistoriasHotspring(data) {
  if (!debeAutoGenerarTareas(data)) return data;
  const cliId = 'cli-hotspring';
  const rolId = 'rol-hs-cm';
  const fecha = '2026-06-30';
  const taskId = `tarea-hs-historia-${fecha}`;
  const plantilla = {
    id: taskId,
    titulo: '[HS] Subir historia con link WSP',
    clienteId: cliId,
    fecha
  };
  let tarea = data.tareas.find(t => t.id === taskId);
  if (!tarea) {
    tarea = data.tareas.find(t =>
      t.clienteId === cliId && t.fecha === fecha &&
      /historia.*wsp|historia.*whatsapp/i.test(t.titulo || '')
    );
  }
  if (!tarea && !tareaFueEliminada(data, taskId, plantilla)) {
    data.tareas.push({
      id: taskId,
      titulo: '[HS] Subir historia con link WSP',
      clienteId: cliId,
      rolId,
      fecha,
      horaInicio: '17:15',
      horaFin: '17:30',
      prioridad: 'media',
      completada: false,
      pendiente: false,
      notas: NOTAS_HISTORIA_WSP_HS
    });
  } else if (tarea) {
    if (tareaFueEliminada(data, taskId, tarea)) {
      data.tareas = data.tareas.filter(t => t.id !== tarea.id);
    } else {
      tarea.id = taskId;
      tarea.titulo = '[HS] Subir historia con link WSP';
      tarea.clienteId = cliId;
      tarea.rolId = rolId;
      sincronizarAgendaTarea(tarea, {
        fecha,
        horaInicio: '17:15',
        horaFin: '17:30'
      });
      tarea.notas = NOTAS_HISTORIA_WSP_HS;
      tarea.prioridad = tarea.prioridad || 'media';
    }
  }
  return data;
}

function asegurarReportesMensuales(data) {
  if (!debeAutoGenerarTareas(data)) return data;
  const cliId = 'cli-trendseeker';
  const cli = data.clientes.find(c => c.id === cliId);
  const abrev = abrevDe(cli) || 'TS';
  const base = hoy();

  for (let offset = -1; offset <= 3; offset++) {
    const ref = new Date(base.getFullYear(), base.getMonth() + offset, 1);
    const fecha = toISO(ref);
    const mesRep = new Date(ref.getFullYear(), ref.getMonth() - 1, 1)
      .toLocaleDateString('es-CL', { month: 'long' });
    const titulo = `[${abrev}] Reporte ${mesRep}`;
    const reporteId = `tarea-ts-reporte-${fecha}`;
    const plantilla = { id: reporteId, titulo, clienteId: cliId, fecha };
    const existente = data.tareas.find(t =>
      t.id === reporteId || (t.clienteId === cliId && t.fecha === fecha && /Reporte/i.test(t.titulo))
    );
    if (existente) {
      if (tareaFueEliminada(data, reporteId, existente)) {
        data.tareas = data.tareas.filter(t => t.id !== existente.id);
      } else {
        existente.id = reporteId;
        existente.titulo = titulo;
        existente.rolId = existente.rolId || 'rol-cm';
        if (!existente.horaInicio) existente.horaInicio = '10:00';
        if (!existente.horaFin) existente.horaFin = '11:00';
      }
    } else if (!tareaFueEliminada(data, reporteId, plantilla)) {
      data.tareas.push({
        id: reporteId,
        titulo,
        clienteId: cliId,
        rolId: 'rol-cm',
        fecha,
        horaInicio: '10:00',
        horaFin: '11:00',
        prioridad: 'alta',
        completada: false,
        pendiente: false
      });
    }
  }
  return data;
}

function asegurarClienteMKOF(data) {
  const cliId = 'cli-mkof';
  let cli = data.clientes.find(c => c.id === cliId);
  if (!cli) {
    const seed = datosIniciales().clientes.find(c => c.id === cliId);
    if (seed) data.clientes.push(seed);
    cli = data.clientes.find(c => c.id === cliId);
  }
  if (cli) {
    cli.abrev = 'MKOF';
    if (!cli.color) cli.color = 'agua';
  }

  if (!debeAutoGenerarTareas(data)) return data;

  const notasGantt = 'Entregar Gantt de la etapa 2 post auditoría para establecer tiempos y entregables.';
  const hoyStr = toISO(hoy());
  const plantillaMKOF = {
    id: 'tarea-mkof-gantt-etapa2',
    titulo: '[MKOF] Gantt etapa 2 post auditoría',
    clienteId: cliId,
    fecha: hoyStr
  };
  let tarea = data.tareas.find(t =>
    t.id === plantillaMKOF.id || (t.clienteId === cliId && /gantt.*etapa\s*2/i.test(t.titulo))
  );
  if (!tarea && !tareaFueEliminada(data, plantillaMKOF.id, plantillaMKOF)) {
    data.tareas.push({
      id: 'tarea-mkof-gantt-etapa2',
      titulo: '[MKOF] Gantt etapa 2 post auditoría',
      clienteId: cliId,
      rolId: 'rol-mkof-dev',
      fecha: hoyStr,
      horaInicio: '17:00',
      horaFin: '18:00',
      notas: notasGantt,
      prioridad: 'alta',
      completada: false,
      pendiente: false
    });
  } else if (tarea) {
    if (tareaFueEliminada(data, plantillaMKOF.id, tarea)) {
      data.tareas = data.tareas.filter(t => t.id !== tarea.id);
    } else {
      tarea.id = tarea.id || 'tarea-mkof-gantt-etapa2';
      tarea.titulo = '[MKOF] Gantt etapa 2 post auditoría';
      tarea.clienteId = cliId;
      tarea.rolId = 'rol-mkof-dev';
      tarea.horaInicio = '17:00';
      tarea.horaFin = '18:00';
      tarea.notas = notasGantt;
      tarea.prioridad = tarea.prioridad || 'alta';
    }
  }
  return data;
}

function duracionMinutosTarea(t) {
  if (!t.horaInicio) return 60;
  const ini = minutosHora(t.horaInicio);
  const fin = t.horaFin ? minutosHora(t.horaFin) : ini + 60;
  return Math.max(15, fin - ini);
}

function minutosAHoraStr(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function esDiaCalendarioJM(fechaISO) {
  return !FERIADOS_CHILE.has(fechaISO);
}

function cargaAgendaDia(data, fechaISO, excluirClienteId = JM_CLI_ID) {
  let minutos = 0;
  data.citasSalud.filter(c => c.fecha === fechaISO).forEach(() => { minutos += 60; });
  (data.reunionesClientes || []).filter(r => r.fecha === fechaISO).forEach(r => {
    minutos += duracionMinutosReunion(r);
  });
  data.tareas
    .filter(t => t.fecha === fechaISO && !t.pendiente && t.clienteId !== excluirClienteId)
    .forEach(t => { minutos += duracionMinutosTarea(t); });
  return minutos;
}

function horasTrabajoJMFase2(data, fechaISO) {
  if (!esDiaCalendarioJM(fechaISO)) return 0;
  const dow = parseISO(fechaISO).getDay();
  if (dow === 0 || dow === 6) return 2;

  const carga = cargaAgendaDia(data, fechaISO);
  let horas = 3;
  if (carga < 120) horas += 1;
  if (carga >= 300) horas = Math.max(2, horas - 1);
  return horas;
}

function bloquesOcupadosDia(data, fechaISO, excluirClienteId = JM_CLI_ID) {
  const bloques = [];
  data.tareas
    .filter(t => t.fecha === fechaISO && !t.pendiente && t.clienteId !== excluirClienteId)
    .forEach(t => {
      const ini = minutosHora(t.horaInicio || '09:00');
      bloques.push([ini, ini + duracionMinutosTarea(t)]);
    });
  data.citasSalud.filter(c => c.fecha === fechaISO).forEach(c => {
    const ini = minutosHora(c.hora || '09:00');
    bloques.push([ini, ini + 60]);
  });
  (data.reunionesClientes || []).filter(r => r.fecha === fechaISO).forEach(r => {
    bloques.push([minutosHora(r.horaInicio), minutosHora(r.horaInicio) + duracionMinutosReunion(r)]);
  });
  return bloques.sort((a, b) => a[0] - b[0]);
}

function duracionMinutosReunion(r) {
  if (!r?.horaInicio) return 60;
  const ini = minutosHora(r.horaInicio);
  const fin = r.horaFin ? minutosHora(r.horaFin) : ini + 60;
  return Math.max(15, fin - ini);
}

function bloquesSolapan(iniA, finA, iniB, finB) {
  return iniA < finB && finA > iniB;
}

function reajustarTareasConflictosAgenda(data) {
  (data.reunionesClientes || []).forEach(reunion => {
    const rIni = minutosHora(reunion.horaInicio);
    const rFin = rIni + duracionMinutosReunion(reunion);
    const fecha = reunion.fecha;

    data.tareas.forEach(t => {
      if (t.fecha !== fecha || t.pendiente || t.completada || !t.horaInicio) return;
      const tIni = minutosHora(t.horaInicio);
      const tFin = tIni + duracionMinutosTarea(t);
      if (!bloquesSolapan(tIni, tFin, rIni, rFin)) return;

      const duracion = duracionMinutosTarea(t);
      const slot = buscarSlotAgenda(data, fecha, duracion, t.clienteId);
      t.horaInicio = slot.horaInicio;
      t.horaFin = slot.horaFin;
    });
  });
  return data;
}

function asegurarReunionesClientes(data) {
  const reuniones = [
    {
      id: 'reunion-ecr-25jun',
      clienteId: 'cli-ecr',
      fecha: '2026-06-25',
      horaInicio: '12:00',
      horaFin: '13:00',
      titulo: 'Reunión ECR',
      notas: 'Reunión con cliente'
    }
  ];

  reuniones.forEach(plantilla => {
    let r = data.reunionesClientes.find(x => x.id === plantilla.id);
    if (!r) {
      data.reunionesClientes.push({ ...plantilla });
    } else {
      Object.assign(r, plantilla);
    }
  });
  return data;
}

function buscarSlotAgenda(data, fechaISO, duracionMin, excluirClienteId) {
  const ocupados = bloquesOcupadosDia(data, fechaISO, excluirClienteId);
  const preferidos = [9 * 60, 11 * 60, 13 * 60, 15 * 60, 18 * 60, 20 * 60];

  for (const inicio of preferidos) {
    const fin = inicio + duracionMin;
    if (fin > 22 * 60 + 30) continue;
    const conflicto = ocupados.some(([a, b]) => inicio < b && fin > a);
    if (!conflicto) {
      return { horaInicio: minutosAHoraStr(inicio), horaFin: minutosAHoraStr(fin) };
    }
  }

  let inicio = 9 * 60;
  if (ocupados.length) inicio = Math.max(...ocupados.map(([, b]) => b)) + 15;
  return {
    horaInicio: minutosAHoraStr(inicio),
    horaFin: minutosAHoraStr(inicio + duracionMin)
  };
}

function esDiaSIE(fechaISO) {
  const dow = parseISO(fechaISO).getDay();
  if (dow === 0 || dow === 6) return true;
  return FERIADOS_CHILE.has(fechaISO);
}

function horasTrabajoSIE(data, fechaISO) {
  if (!esDiaSIE(fechaISO)) return 0;
  const carga = cargaAgendaDia(data, fechaISO, SIE_CLI_ID);
  return carga >= 120 ? 1 : 2;
}

function asegurarTareasSIE(data) {
  if (!debeAutoGenerarTareas(data)) return data;
  const rolId = 'rol-sie-dev';
  let fecha = parseISO(SIE_INICIO);
  let indice = 0;

  while (indice < PLAN_SIE.length) {
    const fechaStr = toISO(fecha);
    if (!esDiaSIE(fechaStr)) {
      fecha.setDate(fecha.getDate() + 1);
      continue;
    }

    const horas = horasTrabajoSIE(data, fechaStr);
    if (horas <= 0) {
      fecha.setDate(fecha.getDate() + 1);
      continue;
    }

    const plan = PLAN_SIE[indice];
    const taskId = `tarea-sie-${String(indice + 1).padStart(2, '0')}`;
    const duracionMin = horas * 60;
    const slot = buscarSlotAgenda(data, fechaStr, duracionMin, SIE_CLI_ID);
    const plantilla = { id: taskId, titulo: plan.titulo, clienteId: SIE_CLI_ID, fecha: fechaStr };

    let tarea = data.tareas.find(t => t.id === taskId);
    if (!tarea && !tareaFueEliminada(data, taskId, plantilla)) {
      data.tareas.push({
        id: taskId,
        titulo: plan.titulo,
        clienteId: SIE_CLI_ID,
        rolId,
        fecha: fechaStr,
        horaInicio: slot.horaInicio,
        horaFin: slot.horaFin,
        notas: plan.notas,
        prioridad: 'media',
        completada: false,
        pendiente: false
      });
    } else if (tarea) {
      if (tareaFueEliminada(data, taskId, tarea)) {
        data.tareas = data.tareas.filter(t => t.id !== taskId);
      } else {
        tarea.titulo = plan.titulo;
        tarea.clienteId = SIE_CLI_ID;
        tarea.rolId = rolId;
        sincronizarAgendaTarea(tarea, {
          fecha: fechaStr,
          horaInicio: slot.horaInicio,
          horaFin: slot.horaFin
        });
        tarea.notas = plan.notas;
        tarea.prioridad = tarea.prioridad || 'media';
      }
    }

    indice += 1;
    fecha.setDate(fecha.getDate() + 1);
  }

  return data;
}

function asegurarClienteSIE(data) {
  const cliId = SIE_CLI_ID;
  let cli = data.clientes.find(c => c.id === cliId);
  if (!cli) {
    const seed = datosIniciales().clientes.find(c => c.id === cliId);
    if (seed) data.clientes.push(seed);
    cli = data.clientes.find(c => c.id === cliId);
  }
  if (cli) {
    cli.abrev = 'SIE';
    cli.color = 'grafito';
  }
  asegurarTareasSIE(data);
  return data;
}

function formatearPlazoCorto(fechaISO) {
  const d = parseISO(fechaISO);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function asegurarTareaEntregaSitioJM(data, fechaEntrega) {
  if (!fechaEntrega) return data;
  const cli = data.clientes.find(c => c.id === JM_CLI_ID);
  const rolId = 'rol-jm-dev';
  const plazoLinea = `${formatearPlazoCorto(fechaEntrega)} — Entrega sitio web`;
  const fechaLarga = parseISO(fechaEntrega).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  if (cli) {
    const rol = (cli.roles || []).find(r => r.id === rolId);
    if (rol) {
      const otras = (rol.plazosEntregables || '')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !/entrega sitio web/i.test(l));
      rol.plazosEntregables = [...otras, plazoLinea].join('\n');
    }
  }

  const plantilla = {
    id: JM_ENTREGA_SITIO_ID,
    titulo: '[JM] Entrega sitio web',
    clienteId: JM_CLI_ID,
    rolId,
    fecha: fechaEntrega
  };
  const slot = buscarSlotAgenda(data, fechaEntrega, 120, JM_CLI_ID);
  let tarea = data.tareas.find(t => t.id === JM_ENTREGA_SITIO_ID);

  if (!tarea && !tareaFueEliminada(data, JM_ENTREGA_SITIO_ID, plantilla)) {
    data.tareas.push({
      id: JM_ENTREGA_SITIO_ID,
      titulo: '[JM] Entrega sitio web',
      clienteId: JM_CLI_ID,
      rolId,
      fecha: fechaEntrega,
      horaInicio: slot.horaInicio || '14:00',
      horaFin: slot.horaFin || '16:00',
      notas: `Entrega oficial del rediseño joyasmercury.cl · Fase 2 · ${fechaLarga}. Inicio ventana de 10 días de soporte incluido.`,
      prioridad: 'alta',
      completada: false,
      pendiente: false
    });
  } else if (tarea) {
    if (tareaFueEliminada(data, JM_ENTREGA_SITIO_ID, tarea)) {
      data.tareas = data.tareas.filter(t => t.id !== JM_ENTREGA_SITIO_ID);
    } else {
      tarea.titulo = '[JM] Entrega sitio web';
      tarea.clienteId = JM_CLI_ID;
      tarea.rolId = rolId;
      sincronizarAgendaTarea(tarea, {
        fecha: fechaEntrega,
        horaInicio: slot.horaInicio || tarea.horaInicio || '14:00',
        horaFin: slot.horaFin || tarea.horaFin || '16:00'
      });
      tarea.notas = `Entrega oficial del rediseño joyasmercury.cl · Fase 2 · ${fechaLarga}. Inicio ventana de 10 días de soporte incluido.`;
      tarea.prioridad = tarea.prioridad || 'alta';
    }
  }

  return data;
}

function asegurarTareasJoyasMercuryFase2(data) {
  if (!debeAutoGenerarTareas(data)) return data;
  const rolId = 'rol-jm-dev';
  let fecha = parseISO(JM_FASE2_INICIO);
  let indice = 0;
  let ultimaFechaJM = null;

  while (indice < PLAN_JM_FASE2.length) {
    const fechaStr = toISO(fecha);
    if (!esDiaCalendarioJM(fechaStr)) {
      fecha.setDate(fecha.getDate() + 1);
      continue;
    }

    const horas = horasTrabajoJMFase2(data, fechaStr);
    if (horas <= 0) {
      fecha.setDate(fecha.getDate() + 1);
      continue;
    }

    const plan = PLAN_JM_FASE2[indice];
    const taskId = `tarea-jm-f2-${String(indice + 1).padStart(2, '0')}`;
    const duracionMin = horas * 60;
    const slot = buscarSlotAgenda(data, fechaStr, duracionMin, JM_CLI_ID);
    const plantilla = { id: taskId, titulo: plan.titulo, clienteId: JM_CLI_ID, fecha: fechaStr };
    ultimaFechaJM = fechaStr;

    let tarea = data.tareas.find(t => t.id === taskId);
    if (!tarea && !tareaFueEliminada(data, taskId, plantilla)) {
      data.tareas.push({
        id: taskId,
        titulo: plan.titulo,
        clienteId: JM_CLI_ID,
        rolId,
        fecha: fechaStr,
        horaInicio: slot.horaInicio,
        horaFin: slot.horaFin,
        notas: plan.notas,
        prioridad: 'alta',
        completada: false,
        pendiente: false
      });
    } else if (tarea) {
      if (tareaFueEliminada(data, taskId, tarea)) {
        data.tareas = data.tareas.filter(t => t.id !== taskId);
      } else {
        tarea.titulo = plan.titulo;
        tarea.clienteId = JM_CLI_ID;
        tarea.rolId = rolId;
        sincronizarAgendaTarea(tarea, {
          fecha: fechaStr,
          horaInicio: slot.horaInicio,
          horaFin: slot.horaFin
        });
        tarea.notas = plan.notas;
        tarea.prioridad = tarea.prioridad || 'alta';
      }
    }

    indice += 1;
    fecha.setDate(fecha.getDate() + 1);
  }

  asegurarTareaEntregaSitioJM(data, ultimaFechaJM);

  return data;
}

function importarFichaBackupJoyasMercury(cli) {
  const backup = window.JM_BACKUP_FICHA;
  if (!cli || !backup) return;
  if (!cli.ficha || typeof cli.ficha !== 'object') {
    cli.ficha = { contacto: '', links: '', notas: '', seccionesExtra: [], documentos: [] };
  }
  const v = cli.ficha.backupJoyasMercuryV || 0;
  if (v >= backup.version) {
    if (typeof window.asegurarWireframesJM === 'function') window.asegurarWireframesJM(cli);
    return;
  }

  function mergeCampo(actual, nuevo) {
    if (!(nuevo || '').trim()) return actual || '';
    if (!(actual || '').trim()) return nuevo.trim();
    if (actual.includes('joyasmercury-backup') || actual.includes(backup.metas.slice(0, 30))) return actual;
    return `${actual.trim()}\n\n--- Backup joyasmercury ---\n${nuevo.trim()}`;
  }

  cli.metas = mergeCampo(cli.metas, backup.metas);
  cli.contextoPrompt = mergeCampo(cli.contextoPrompt, backup.contextoPrompt);
  cli.ficha.contacto = mergeCampo(cli.ficha.contacto, backup.contacto);
  cli.ficha.links = mergeCampo(cli.ficha.links, backup.links);
  cli.ficha.notas = mergeCampo(cli.ficha.notas, backup.notas);

  if (!Array.isArray(cli.ficha.seccionesExtra)) cli.ficha.seccionesExtra = [];
  (backup.seccionesExtra || []).forEach(sec => {
    if (!cli.ficha.seccionesExtra.some(s => s.id === sec.id || s.titulo === sec.titulo)) {
      cli.ficha.seccionesExtra.push({
        id: sec.id || id(),
        titulo: sec.titulo,
        contenido: sec.contenido
      });
    }
  });

  if (!Array.isArray(cli.ficha.documentos)) cli.ficha.documentos = [];
  (backup.documentos || []).forEach(doc => {
    if (!cli.ficha.documentos.some(d => d.id === doc.id)) {
      cli.ficha.documentos.push({
        ...doc,
        clienteId: cli.id,
        mime: 'text/markdown',
        tamano: 0,
        subido: toISO(hoy()),
        dataUrl: ''
      });
    }
  });

  if (Array.isArray(backup.wireframes) && backup.wireframes.length) {
    cli.ficha.wireframes = backup.wireframes.map(w => ({ ...w }));
  } else if (typeof window.asegurarWireframesJM === 'function') {
    window.asegurarWireframesJM(cli);
  }

  cli.ficha.backupJoyasMercuryV = backup.version;
  cli.ficha.actualizado = toISO(hoy());
}

function asegurarClienteJoyasMercury(data) {
  const cliId = 'cli-joyas-mercury';
  let cli = data.clientes.find(c => c.id === cliId);
  if (!cli) {
    const seed = datosIniciales().clientes.find(c => c.id === cliId);
    if (seed) data.clientes.push(seed);
    cli = data.clientes.find(c => c.id === cliId);
  }
  if (cli) {
    cli.abrev = 'JM';
    if (!cli.color) cli.color = 'rosa';
    initManualesMarca(data);
    if (!(cli.manualMarca.texto || '').trim()) {
      cli.manualMarca.texto = MANUAL_MARCA_JOYAS_MERCURY;
      cli.manualMarca.actualizado = toISO(hoy());
      cli.manualMarca.fuente = 'Manual de marca - Joyas Mercury.pdf';
    }
    if (!cli.ficha || typeof cli.ficha !== 'object') {
      cli.ficha = { contacto: '', links: '', notas: '', seccionesExtra: [], documentos: [] };
    }
    if (!Array.isArray(cli.ficha.documentos)) cli.ficha.documentos = [];
    const yaTieneManualDoc = cli.ficha.documentos.some(
      d => d.clienteId === cliId && /manual de marca/i.test(d.nombre || '')
    );
    if (!yaTieneManualDoc) {
      cli.ficha.documentos.push({
        id: 'doc-manual-marca-jm',
        clienteId: cliId,
        nombre: 'Manual de marca - Joyas Mercury.pdf',
        mime: 'application/pdf',
        categoria: 'pdf',
        tamano: 0,
        subido: toISO(hoy()),
        contenidoTexto: MANUAL_MARCA_JOYAS_MERCURY,
        dataUrl: '',
        notasAnalisis: 'Texto extraído del PDF (17 pág.) — sin archivo binario para no ocupar espacio',
        extraccionMetodo: 'pdf-texto',
        extraccionEstado: 'ok'
      });
      cli.ficha.actualizado = toISO(hoy());
    }
    importarFichaBackupJoyasMercury(cli);
    if (typeof window.asegurarWireframesJM === 'function') window.asegurarWireframesJM(cli);
  }
  asegurarTareasJoyasMercuryFase2(data);
  return data;
}

function asegurarClienteDesafioLatam(data) {
  const cliId = DLAT_CLI_ID;
  let cli = data.clientes.find(c => c.id === cliId);
  if (!cli) {
    const seed = datosIniciales().clientes.find(c => c.id === cliId);
    if (seed) data.clientes.push(seed);
    cli = data.clientes.find(c => c.id === cliId);
  }
  if (cli) {
    cli.abrev = 'ADL';
    cli.color = 'durazno';
  }
  return data;
}

function asegurarPerfilClientes(data) {
  data.clientes.forEach(cli => {
    const perfil = PERFILES_CLIENTE[cli.id];
    if (!perfil) return;
    if (perfil.nombre) cli.nombre = perfil.nombre;
    if (perfil.abrev) cli.abrev = perfil.abrev;
    if (perfil.tipo) cli.tipo = perfil.tipo;
  });
  data.tareas.forEach(t => {
    if (t.titulo?.includes('[DLAT]')) {
      t.titulo = t.titulo.replace(/\[DLAT\]/g, '[ADL]');
    }
  });
  return data;
}

function asegurarAgentesClientes(data) {
  data.clientes.forEach(cli => {
    const seed = AGENTES_CLIENTE[cli.id];
    if (seed) cli.agente = { ...seed, ...cli.agente };
  });
  return data;
}

function normalizarDatos(data) {
  initMetaDatos(data);
  aplicarMigracionRespaldo(data);
  initContextoCliente(data);
  aplicarTareasEliminadas(data);
  normalizarCitasSalud(data);
  normalizarReunionesClientes(data);
  asegurarReunionesClientes(data);
  normalizarTareasTS(data);
  asegurarClienteECR(data);
  asegurarClientesRedes(data);
  asegurarHistoriasPiscineria(data);
  asegurarHistoriasHotspring(data);
  asegurarClienteMKOF(data);
  asegurarClienteJoyasMercury(data);
  asegurarClienteSIE(data);
  asegurarClienteDesafioLatam(data);
  asegurarPerfilClientes(data);
  asegurarAgentesClientes(data);
  asignarRolesATareas(data);
  asegurarReportesMensuales(data);
  reajustarTareasConflictosAgenda(data);
  aplicarTareasEliminadas(data);
  asegurarNumerosHistoricosTareas(data);
  return data;
}

function cargar() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && Array.isArray(d.tareas) && Array.isArray(d.clientes)) return normalizarDatos(d);
    }
  } catch (e) {
    console.warn(e);
  }
  return normalizarDatos(datosIniciales());
}

/** ¿Hay datos guardados en este navegador? (borrados y ajustes del usuario) */
function tieneDatosLocales() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    return d && Array.isArray(d.tareas) && Array.isArray(d.clientes);
  } catch {
    return false;
  }
}

function guardar() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
    return true;
  } catch (e) {
    console.error('Error al guardar en localStorage', e);
    mostrarToast('No se pudo guardar — el almacenamiento del navegador puede estar lleno');
    return false;
  }
}

function clienteDe(idCliente) {
  return datos.clientes.find(c => c.id === idCliente);
}

function tareaDe(idTarea) {
  return datos.tareas.find(t => t.id === idTarea);
}

function marcarTareaPendiente(t) {
  if (!t) return;
  if (!t.pendiente) t.fechaOriginal = t.fecha;
  t.pendiente = true;
  fijarAgendaUsuario(t);
  fijarEstadoUsuario(t);
}

function quitarTareaPendiente(t, { fecha } = {}) {
  if (!t) return;
  t.pendiente = false;
  if (fecha) t.fecha = fecha;
  else if (t.fechaOriginal) t.fecha = t.fechaOriginal;
  fijarAgendaUsuario(t);
  fijarEstadoUsuario(t);
}

function completarTarea(t) {
  if (!t) return;
  t.completada = true;
  t.pendiente = false;
  fijarAgendaUsuario(t);
  fijarEstadoUsuario(t);
}

function agenteDe(cliente) {
  if (!cliente) return AGENTE_GENERICO;
  return cliente.agente || AGENTES_CLIENTE[cliente.id] || AGENTE_GENERICO;
}

function skillDe(cliente) {
  if (!cliente) return SKILL_GENERICO;
  return SKILLS_CLIENTE[cliente.id] || SKILL_GENERICO;
}

function initManualesMarca(data) {
  data.clientes.forEach(cli => {
    if (!cli.manualMarca || typeof cli.manualMarca !== 'object') {
      cli.manualMarca = { texto: '', archivos: [] };
    }
    if (!Array.isArray(cli.manualMarca.archivos)) cli.manualMarca.archivos = [];
    if (typeof cli.manualMarca.texto !== 'string') cli.manualMarca.texto = '';
  });
  return data;
}

function initContextoCliente(data) {
  initManualesMarca(data);
  data.clientes.forEach(cli => {
    if (typeof cli.metas !== 'string') cli.metas = '';
    if (typeof cli.contextoPrompt !== 'string') cli.contextoPrompt = '';
    if (!cli.ficha || typeof cli.ficha !== 'object') cli.ficha = { contacto: '', links: '', notas: '', seccionesExtra: [], documentos: [] };
    if (typeof cli.ficha.contacto !== 'string') cli.ficha.contacto = '';
    if (typeof cli.ficha.links !== 'string') cli.ficha.links = '';
    if (typeof cli.ficha.notas !== 'string') cli.ficha.notas = '';
    if (!Array.isArray(cli.ficha.seccionesExtra)) cli.ficha.seccionesExtra = [];
    if (!Array.isArray(cli.ficha.documentos)) cli.ficha.documentos = [];
  });
  return data;
}

function etiquetaTipoCliente(tipo) {
  const map = {
    'full-time': 'Full time',
    freelance: 'Freelance',
    oportunidad: 'Oportunidad',
    personal: 'Personal'
  };
  return map[tipo] || tipo;
}

function claseTipoCliente(tipo) {
  const map = {
    'full-time': 'cliente-card__tipo--full-time',
    freelance: 'cliente-card__tipo--freelance',
    oportunidad: 'cliente-card__tipo--oportunidad',
    personal: 'cliente-card__tipo--personal'
  };
  return map[tipo] || '';
}

function contextoClienteCargado(cli) {
  if (!cli) return false;
  const f = cli.ficha || {};
  const docs = (f.documentos || []).some(d => d.clienteId === cli.id || !d.clienteId);
  const extras = (f.seccionesExtra || []).some(s => (s.titulo || '').trim() || (s.contenido || '').trim());
  return manualMarcaCargado(cli)
    || !!(cli.metas || '').trim()
    || !!(cli.contextoPrompt || '').trim()
    || !!(f.contacto || '').trim()
    || !!(f.links || '').trim()
    || !!(f.notas || '').trim()
    || extras
    || docs;
}

function esClienteDiseno(cli) {
  if (!cli) return false;
  const skill = skillDe(cli);
  if (skill.usaManualMarca) return true;
  return (cli.roles || []).some(r => /diseño/i.test(r.nombre));
}

function manualMarcaCargado(cli) {
  if (!cli?.manualMarca) return false;
  const t = (cli.manualMarca.texto || '').trim();
  const archivos = cli.manualMarca.archivos?.length || 0;
  const docs = (cli.ficha?.documentos || []).filter(d => !d.clienteId || d.clienteId === cli.id).length;
  return t.length > 0 || archivos > 0 || docs > 0;
}

function textoManualMarcaCompleto(cli) {
  if (!cli?.manualMarca) return '';
  const partes = [];
  if (cli.manualMarca.texto?.trim()) partes.push(cli.manualMarca.texto.trim());
  (cli.manualMarca.archivos || []).forEach(a => {
    if (a.contenido?.trim()) partes.push(`--- ${a.nombre} ---\n${a.contenido.trim()}`);
  });
  if (window.extractoDocumentosFicha) {
    const docs = window.extractoDocumentosFicha(cli, 12000);
    if (docs) partes.push('--- Documentos adjuntos ---\n' + docs);
  }
  return partes.join('\n\n');
}

function extractoManualMarca(cli, max = 6000) {
  const texto = textoManualMarcaCompleto(cli);
  if (!texto) return '';
  return texto.length > max ? `${texto.slice(0, max)}\n\n[… manual recortado por tamaño …]` : texto;
}

function slugArchivo(texto) {
  return (texto || 'tarea').toLowerCase()
    .normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
}

function slugClienteUrl(cli) {
  if (!cli) return 'sin-cliente';
  if (cli.slugUrl) return cli.slugUrl;
  const desdeId = (cli.id || '').replace(/^cli-/, '');
  if (desdeId) return desdeId;
  return slugArchivo(cli.nombre);
}

/** Nombre de archivo: {cliente}-{palabra1}-{palabra2}.{ext} */
function nombreArchivoCliente(cli, palabras, extension = 'png') {
  const slug = slugClienteUrl(cli);
  const words = (Array.isArray(palabras) ? palabras : String(palabras || '').split(/\s+/))
    .map(w => slugArchivo(w))
    .filter(Boolean)
    .slice(0, 2);
  while (words.length < 2) words.push(words.length === 0 ? 'archivo' : 'cliente');
  const ext = String(extension || 'png').replace(/^\./, '');
  return `${slug}-${words[0]}-${words[1]}.${ext}`;
}

function clientePorSlugUrl(slug) {
  if (!slug) return null;
  const s = slug.toLowerCase();
  return datos.clientes.find(c => slugClienteUrl(c) === s) || null;
}

function extraerNumeroDesdeIdTarea(tarea) {
  const id = tarea?.id || '';
  const jm = id.match(/tarea-jm-f2-(\d+)/i);
  if (jm) return jm[1].padStart(2, '0');
  const sie = id.match(/tarea-sie-(\d+)/i);
  if (sie) return sie[1].padStart(2, '0');
  const pub = id.match(/pub-(\d+)/i);
  if (pub) return pub[1].padStart(2, '0');
  return null;
}

function asegurarNumeroHistoricoTarea(tarea, data = datos) {
  if (!tarea) return '00';
  if (tarea.numeroHistorico) return String(tarea.numeroHistorico).padStart(2, '0');

  const desdeId = extraerNumeroDesdeIdTarea(tarea);
  if (desdeId) {
    tarea.numeroHistorico = desdeId;
    return tarea.numeroHistorico;
  }

  const delCliente = (data?.tareas || []).filter(t => t.clienteId === tarea.clienteId && t.numeroHistorico);
  let max = 0;
  delCliente.forEach(t => {
    const n = parseInt(t.numeroHistorico, 10);
    if (!Number.isNaN(n) && n > max) max = n;
  });
  tarea.numeroHistorico = String(max + 1).padStart(2, '0');
  return tarea.numeroHistorico;
}

function asegurarNumerosHistoricosTareas(data) {
  (data.tareas || []).forEach(t => asegurarNumeroHistoricoTarea(t, data));
  return data;
}

function rutaHistoricaTarea(tarea) {
  if (!tarea) return '';
  const cli = clienteDe(tarea.clienteId);
  const slug = slugClienteUrl(cli);
  const numero = asegurarNumeroHistoricoTarea(tarea);
  return `${slug}/tarea/${numero}.html`;
}

/** Slug + número para query ?tarea=joyas-mercury/01 (funciona en file:// y sin servidor SPA) */
function slugNumeroTareaUrl(tarea) {
  if (!tarea) return '';
  const cli = clienteDe(tarea.clienteId);
  const slug = slugClienteUrl(cli);
  const numero = asegurarNumeroHistoricoTarea(tarea);
  return `${slug}/${numero}`;
}

function parsearSegmentoTareaUrl(segmento) {
  if (!segmento) return null;
  const s = decodeURIComponent(String(segmento).trim()).replace(/^#/, '');
  let m = s.match(/^([^/]+)\/tarea\/([^/.]+)(?:\.html)?$/i);
  if (m) return { slug: m[1], numero: m[2] };
  m = s.match(/^([^/]+)\/([^/.]+)$/);
  if (m) return { slug: m[1], numero: m[2] };
  return null;
}

function parsearQueryTareaDesdeUrl() {
  try {
    const params = new URLSearchParams(location.search || '');
    const t = params.get('tarea');
    if (t) return parsearSegmentoTareaUrl(t);
  } catch (_) { /* file:// u origen sin URL API */ }
  return null;
}

function baseIndexHtmlUrl() {
  const path = location.pathname || '';
  const idx = path.toLowerCase().lastIndexOf('index.html');
  if (idx >= 0) return path.slice(0, idx + 'index.html'.length);
  if (path.endsWith('/')) return path + 'index.html';
  const slash = path.lastIndexOf('/');
  return (slash >= 0 ? path.slice(0, slash + 1) : '/') + 'index.html';
}

function urlTareaAbsoluta(tarea) {
  if (!tarea) return baseIndexHtmlUrl();
  const base = baseIndexHtmlUrl();
  const seg = slugNumeroTareaUrl(tarea);
  return `${base}${base.includes('?') ? '&' : '?'}tarea=${encodeURIComponent(seg)}`;
}

/** Formato legible (path) — requiere serve.json o hash; preferir urlTareaAbsoluta al compartir */
function urlTareaPathLegible(tarea) {
  if (!tarea) return baseIndexHtmlUrl();
  return `${baseIndexHtmlUrl()}/${rutaHistoricaTarea(tarea)}`;
}

function parsearRutaTareaDesdeUrl() {
  const desdeQuery = parsearQueryTareaDesdeUrl();
  if (desdeQuery) return desdeQuery;

  const path = location.pathname || '';
  const idx = path.toLowerCase().indexOf('index.html');
  const rest = idx >= 0 ? path.slice(idx + 'index.html'.length) : path;
  let m = rest.match(/^\/?([^/]+)\/tarea\/([^/.]+)(?:\.html)?$/i);
  if (m) return { slug: m[1], numero: m[2], legacyPath: true };

  m = path.match(/\/([^/]+)\/tarea\/([^/.]+)(?:\.html)?$/i);
  if (m) return { slug: m[1], numero: m[2], legacyPath: true };

  const hash = (location.hash || '').replace(/^#\/?/, '');
  const desdeHash = parsearSegmentoTareaUrl(hash);
  if (desdeHash) return { ...desdeHash, legacy: true };
  return null;
}

function tareaPorRutaHistorica(slug, numero) {
  const cli = clientePorSlugUrl(slug);
  if (!cli) return null;
  const num = String(numero).padStart(2, '0');
  return datos.tareas.find(t =>
    t.clienteId === cli.id && String(t.numeroHistorico).padStart(2, '0') === num
  ) || null;
}

function escribirRutaTarea(tarea, { reemplazar = false } = {}) {
  const fn = reemplazar ? 'replaceState' : 'pushState';
  if (!tarea) {
    history[fn](null, '', baseIndexHtmlUrl());
    return;
  }
  history[fn]({ vista: 'tarea', tareaId: tarea.id }, '', urlTareaAbsoluta(tarea));
}

function aplicarRutaDesdeUrl() {
  const parsed = parsearRutaTareaDesdeUrl();
  if (!parsed) return false;
  const tarea = tareaPorRutaHistorica(parsed.slug, parsed.numero);
  if (!tarea) return false;
  tareaSeleccionada = tarea.id;
  if (tarea.fecha) diaSeleccionado = tarea.fecha;
  asegurarSesionAgente(tarea);
  if (parsed.legacy || parsed.legacyPath) escribirRutaTarea(tarea, { reemplazar: true });
  mostrarVista('tarea');
  render();
  return true;
}

function limpiarRutaTarea({ reemplazar = true } = {}) {
  escribirRutaTarea(null, { reemplazar });
}

function proximoDiaLaboralOffset(desdeStr, offsetDias = 1) {
  const d = parseISO(desdeStr || toISO(hoy()));
  let sumados = 0;
  while (sumados < offsetDias) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) sumados++;
  }
  return toISO(d);
}

function generarContextoClienteAislado(cli) {
  if (!cli) return '';
  initContextoCliente(datos);
  const agente = agenteDe(cli);
  const skill = skillDe(cli);
  const f = cli.ficha || {};
  const bloques = [
    `# Agente secundario · ${cli.nombre}`,
    `Solo información de **${cli.nombre}** (${cli.abrev}) — sin otros clientes.`,
    '',
    '## Agente dedicado',
    `${agente.emoji} ${agente.nombre}`,
    agente.especialidad,
    agente.instrucciones,
    '',
    '## Skill',
    `**${skill.nombre}**`,
    skill.descripcion,
    '',
    '### Checklist del skill',
    ...skill.checklist.map((c, i) => `${i + 1}. ${c}`)
  ];
  if ((cli.metas || '').trim()) bloques.push('', '## Metas', cli.metas.trim());
  if ((cli.contextoPrompt || '').trim()) bloques.push('', '## Contexto', cli.contextoPrompt.trim());
  if ((f.contacto || '').trim()) bloques.push('', '## Contacto', f.contacto.trim());
  if ((f.links || '').trim()) bloques.push('', '## Links', f.links.trim());
  if ((f.notas || '').trim()) bloques.push('', '## Notas', f.notas.trim());
  const manual = extractoManualMarca(cli, 20000);
  if (manual) bloques.push('', '## Manual de marca y documentos', manual);
  (f.seccionesExtra || []).forEach(s => {
    const t = (s.titulo || '').trim();
    const c = (s.contenido || '').trim();
    if (t || c) bloques.push('', `## ${t || 'Información adicional'}`, c);
  });
  if ((cli.roles || []).length) {
    bloques.push('', '## Roles');
    cli.roles.forEach(r => {
      bloques.push(`### ${r.abrev} · ${r.nombre}`, r.funciones || '', r.tareasAlMes ? `Tareas/mes: ${r.tareasAlMes}` : '');
    });
  }
  return bloques.filter(Boolean).join('\n');
}

const PASOS_POR_ETAPA_JM = {
  1: [
    ['Inventario del menú actual', 'Listar ítems del menú principal y secundario en joyasmercury.cl'],
    ['Detectar bloques repetidos', 'Recorrer home y plantillas; marcar bloques duplicados o redundantes'],
    ['Bosquejo navegación por colección', 'Proponer estructura: Inicio → Colección → Categoría'],
    ['Documentar cambios en WordPress', 'Menús, widgets y bloques a quitar o reordenar'],
    ['Prueba responsive del menú', 'Mobile, tablet y desktop; hamburger y accesibilidad']
  ],
  2: [
    ['Definir 3 colecciones × 5 categorías', 'Aros, cadenas, etc. — 15 combinaciones totales'],
    ['Crear categorías y etiquetas en WC', 'Relaciones según estructura acordada'],
    ['Validar URLs y slugs', 'Probar cada combinación colección/categoría'],
    ['Enlaces internos entre colecciones', 'Breadcrumbs y navegación cruzada']
  ],
  3: [
    ['Diseñar chips Esencial / Gold / Deluxe', 'Estilo según manual (#ECC54A, #C88F9C…)'],
    ['Landing colección 1 con filtros', 'Primera colección con filtros visuales'],
    ['Landing colección 2 con filtros', 'Segunda colección'],
    ['Landing colección 3 con filtros', 'Tercera colección'],
    ['Filtrado AJAX sin recarga', 'Probar en las 3 colecciones'],
    ['QA filtros mobile y rendimiento', 'Estados activos y UX']
  ],
  4: [
    ['Bloque Productos Destacados en Inicio', 'Donde Camila elige qué mostrar'],
    ['Documentar gestión de destacados', 'Guía para marcar/desmarcar productos']
  ],
  5: [
    ['Páginas Nosotros y Contacto', 'Contenido + botón WhatsApp'],
    ['Políticas legales', 'Envío, privacidad, términos']
  ],
  6: [
    ['Maquetación página carrito', 'Layout alineado al rediseño'],
    ['Flujo checkout y resumen', 'Totales, envío, experiencia de compra'],
    ['Pruebas carrito mobile', 'Correcciones responsive']
  ],
  7: [
    ['Pruebas integrales del sitio', 'Menú, filtros, destacados, legales, carrito'],
    ['Corrección de bugs', 'Issues detectados en QA'],
    ['Guía gestión de catálogo', 'Para que Camila gestione sola'],
    ['Capacitación final con cliente', 'Catálogo, páginas, banners, pedidos'],
    ['Entrega Fase 2 + soporte', 'Ventana de 10 días de soporte']
  ]
};

function generarPasosTarea(tarea, solicitudUsuario = '') {
  const cli = clienteDe(tarea.clienteId);
  const titulo = nombreBaseTarea(tarea) || tarea.titulo;
  const tituloL = titulo.toLowerCase();
  const notas = (tarea.notas || '').toLowerCase();
  const sol = (solicitudUsuario || '').toLowerCase();
  const abrev = cli?.abrev || 'CLI';
  let pasos = [];

  if (cli?.id === JM_CLI_ID || /\[JM\]/i.test(titulo)) {
    const matchEtapa = titulo.match(/E(\d)/i);
    const etapa = matchEtapa ? parseInt(matchEtapa[1], 10) : 1;
    const plantilla = PASOS_POR_ETAPA_JM[etapa] || PASOS_POR_ETAPA_JM[1];
    pasos = plantilla.map(([t, n]) => ({ titulo: `[JM] ${t}`, notas: n }));
    if (/resuelv|hoy|complet/i.test(sol)) {
      pasos.unshift({
        titulo: `[JM] Revisar alcance de hoy`,
        notas: `Tarea del día: ${titulo}. ${tarea.notas || ''}`.trim()
      });
    }
  } else if (/pub|redes|metricool|historia/i.test(tituloL + sol)) {
    pasos = [
      { titulo: `[${abrev}] Revisar material del cliente`, notas: 'Confirmar copy, imágenes y links antes de publicar' },
      { titulo: `[${abrev}] Publicar en feed`, notas: NOTAS_PUB_CONTENIDO },
      { titulo: `[${abrev}] Repost en historias`, notas: 'Historias con link al post' },
      { titulo: `[${abrev}] Verificar horario y métricas`, notas: 'Metricool / analytics según cliente' }
    ];
  } else if (/gantt|entregable|auditor|cronograma/i.test(tituloL + sol)) {
    pasos = [
      { titulo: `[${abrev}] Definir hitos`, notas: 'Fechas y dependencias del entregable' },
      { titulo: `[${abrev}] Criterios de aceptación`, notas: 'Qué debe cumplir cada hito' },
      { titulo: `[${abrev}] Documentar en Gantt`, notas: 'Actualizar cronograma del proyecto' }
    ];
  } else if (/sentencia|buscador|sie|indexaci/i.test(tituloL + sol)) {
    pasos = [
      { titulo: `[${abrev}] Revisar alcance del módulo`, notas: titulo },
      { titulo: `[${abrev}] Implementar / probar`, notas: tarea.notas || 'Según especificación SIE' },
      { titulo: `[${abrev}] Casos de prueba`, notas: 'Búsquedas reales y filtros combinados' }
    ];
  } else {
    pasos = skillDe(cli).checklist.map((c, i) => ({
      titulo: `[${abrev}] ${c}`,
      notas: `Paso ${i + 1} · ${titulo}`
    }));
  }

  return pasos.slice(0, 8).map((p, i) => ({
    id: `paso-${tarea.id}-${i}`,
    orden: i + 1,
    titulo: p.titulo,
    notas: p.notas,
    agendado: false
  }));
}

function evaluarRecomendacionesSkill(tarea, cli, solicitudUsuario = '') {
  const recs = [];
  const skill = skillDe(cli);
  const sol = (solicitudUsuario || '').toLowerCase();
  const titulo = (nombreBaseTarea(tarea) || '').toLowerCase();

  if (skill.usaManualMarca && !manualMarcaCargado(cli)) {
    recs.push({
      titulo: 'Cargar manual de marca en la ficha',
      porque: 'Sin manual, los entregables visuales no respetan colores ni logo. Ahorra revisiones.'
    });
  }
  if (cli?.id === JM_CLI_ID && /elementor|plugin premium/i.test(sol)) {
    recs.push({
      titulo: 'Mantener stack sin Elementor',
      porque: 'Fase 2 acordada con herramientas gratuitas y WooCommerce nativo — evita deuda técnica y retrabajo.'
    });
  }
  if (cli?.id === JM_CLI_ID && /e1|menú|menu/i.test(titulo) && !/colección|categoría/i.test(sol)) {
    recs.push({
      titulo: 'Skill: Dev WooCommerce JM',
      porque: 'Esta etapa es limpieza de menú antes de estructurar colecciones (E2). Enfócate en inventario y bloques repetidos primero.'
    });
  }
  if (/diseñ|figma|mockup|visual/i.test(sol) && !skill.usaManualMarca && esClienteDiseno(cli)) {
    recs.push({
      titulo: 'Usar skill de diseño con manual',
      porque: 'Para piezas visuales conviene tener el manual cargado en la ficha antes de generar el entregable.'
    });
  }
  return recs;
}

function mostrarModalRecomendacionSkill(recomendaciones, onCerrar) {
  let modal = document.getElementById('modal-skill-recomendacion');
  if (!modal) return onCerrar?.();
  const body = document.getElementById('modal-skill-recomendacion-body');
  if (body) {
    body.innerHTML = recomendaciones.map(r =>
      `<div class="skill-rec-item"><strong>${escapeHtml(r.titulo)}</strong><p>${escapeHtml(r.porque)}</p></div>`
    ).join('');
  }
  modal.hidden = false;
  modal.removeAttribute('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-abierto');
  const cerrar = () => {
    modal.hidden = true;
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-abierto');
    onCerrar?.();
  };
  modal.querySelectorAll('[data-cerrar-skill-rec]').forEach(el => {
    el.onclick = cerrar;
  });
}

function descargarInformacionAgente(tarea, solicitudUsuario = '') {
  const cli = clienteDe(tarea.clienteId);
  const ctx = generarContextoClienteAislado(cli);
  const pasos = tarea.sesionAgente?.pasosVisibles && tarea.sesionAgente?.pasosSugeridos?.length
    ? tarea.sesionAgente.pasosSugeridos
    : [];
  const prompt = generarPromptTrabajo(tarea, solicitudUsuario);
  const titulo = nombreBaseTarea(tarea) || tarea.titulo;
  const bloqueFinal = [
    [
      ctx,
      '',
      '---',
      '',
      '# Tarea activa',
      `Título: ${titulo}`,
      cli ? `Cliente: ${cli.nombre}` : '',
      `Fecha: ${tarea.fecha || 'sin fecha'}`,
      `Horario: ${etiquetaHoraTarea(tarea)}`,
      tarea.notas ? `Notas: ${tarea.notas}` : ''
    ].filter(Boolean).join('\n'),
    '',
    '# Tu solicitud',
    solicitudUsuario.trim() || '(sin solicitud escrita)',
    ...(tarea.sesionAgente?.ultimoEntregable ? [
      '',
      '# Entregable diseñado en la app',
      tarea.sesionAgente.ultimoEntregable
    ] : []),
    ...(pasos.length ? [
      '',
      '# Pasos a seguir',
      ...pasos.map((p, i) => `${i + 1}. **${p.titulo}**\n   ${p.notas}`)
    ] : []),
    '',
    '# Prompt de ejecución',
    prompt,
    '',
    '---',
    'Usa este archivo en un agente secundario de Cursor con solo el contexto de este cliente.'
  ].join('\n');

  const blob = new Blob([bloqueFinal], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombreArchivoCliente(cli, ['contexto', 'ejecucion'], 'md');
  a.click();
  URL.revokeObjectURL(a.href);
}

function agregarPasoAlCalendario(paso, tarea, indice = 0) {
  if (paso.agendado) {
    mostrarToast('Este paso ya está en el calendario');
    return;
  }
  const cli = clienteDe(tarea.clienteId);
  const fecha = proximoDiaLaboralOffset(tarea.fecha || toISO(hoy()), indice + 1);
  datos.tareas.push({
    id: id(),
    titulo: paso.titulo,
    clienteId: tarea.clienteId,
    rolId: tarea.rolId || cli?.roles?.[0]?.id,
    fecha,
    horaInicio: '09:00',
    horaFin: '11:00',
    prioridad: 'media',
    completada: false,
    pendiente: false,
    notas: paso.notas || ''
  });
  paso.agendado = true;
  datos = normalizarDatos(datos);
  guardar();
  mostrarToast(`«${paso.titulo}» agendada para ${parseISO(fecha).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}`);
}

function generarPromptTrabajo(tarea, solicitudUsuario = '') {
  const cli = clienteDe(tarea.clienteId);
  const agente = agenteDe(cli);
  const skill = skillDe(cli);
  const rol = rolDe(tarea);
  const titulo = nombreBaseTarea(tarea) || tarea.titulo;
  const manual = extractoManualMarca(cli, 12000);
  const historial = (tarea.sesionAgente?.mensajes || [])
    .filter(m => m.rol === 'usuario')
    .map(m => m.texto)
    .join('\n');

  const bloques = [
    'Eres un asistente experto. Ejecuta la solicitud y entrega el resultado listo para usar.',
    '',
    '## Rol del agente',
    agente.instrucciones,
    '',
    `## Skill: ${skill.nombre}`,
    skill.descripcion,
    '',
    '### Checklist',
    ...skill.checklist.map((c, i) => `${i + 1}. ${c}`),
    '',
    '## Tarea actual',
    `Título: ${titulo}`,
    cli ? `Cliente: ${cli.nombre}` : '',
    rol ? `Rol: ${rol.nombre}` : '',
    `Fecha: ${tarea.fecha || 'sin fecha'}`,
    `Horario: ${etiquetaHoraTarea(tarea)}`,
    tarea.notas ? `Notas de la tarea: ${tarea.notas}` : '',
    tarea.prioridad ? `Prioridad: ${tarea.prioridad}` : ''
  ].filter(Boolean);

  if (cli?.metas?.trim()) {
    bloques.push('', '## Metas del cliente', cli.metas.trim());
  }
  if (cli?.contextoPrompt?.trim()) {
    bloques.push('', '## Contexto del cliente', cli.contextoPrompt.trim());
  }

  if (skill.usaManualMarca || manual) {
    bloques.push('', '## Manual de marca');
    if (manual) {
      bloques.push(manual);
      if (skill.usaManualMarca) {
        bloques.push('', 'Respeta colores, tipografías, logo y tono del manual anterior.');
      }
    } else if (skill.usaManualMarca) {
      bloques.push('(No hay manual cargado — carga el perfil del cliente en la pestaña Clientes.)');
    }
  }

  const pedido = (solicitudUsuario || historial || '').trim();
  bloques.push('', '## Mi solicitud', pedido || '(describe aquí qué necesitas entregar)');

  const pasos = tarea.sesionAgente?.pasosSugeridos;
  if (pasos?.length) {
    bloques.push('', '## Pasos a seguir');
    pasos.forEach((p, i) => bloques.push(`${i + 1}. ${p.titulo} — ${p.notas}`));
  }

  bloques.push(
    '',
    '## Instrucción crítica',
    'ENTREGA el producto terminado en la primera respuesta. No devuelvas solo planes, pasos genéricos ni “qué voy a preparar”.',
    'Si piden mapa conceptual: dibújalo con nodos, ramas, colores de marca y criterios de aprobación para la contraparte.',
    'Si piden desarrollo, inventario, copy o código: entrégalo completo y accionable.',
    '',
    '## Entregable esperado',
    'Producción directa según la solicitud: mapa conceptual diseñado, copy listo, código, estructura HTML/CSS, inventario detallado, etc.',
    'Si es diseño visual, describe composición, colores hex, tipografías y medidas según el manual.',
    'Responde en español, de forma completa y accionable.'
  );

  return bloques.join('\n');
}

function htmlSkillResumen(cli, col) {
  if (!cli) return '';
  const skill = skillDe(cli);
  const agente = agenteDe(cli);
  const manualOk = manualMarcaCargado(cli);
  const perfilOk = contextoClienteCargado(cli);
  const checklist = skill.checklist.map(c => `<li>${escapeHtml(c)}</li>`).join('');
  let manualHtml = '';
  if (skill.usaManualMarca || perfilOk) {
    const extracto = extractoManualMarca(cli, 400);
    const metas = (cli.metas || '').trim();
    const contexto = (cli.contextoPrompt || '').trim();
    manualHtml = `<div class="skill-panel__manual ${perfilOk ? 'skill-panel__manual--ok' : 'skill-panel__manual--falta'}">
      <strong>Perfil del cliente</strong>
      ${perfilOk
        ? `<p class="skill-panel__manual-preview">${metas ? `Metas: ${escapeHtml(metas.slice(0, 120))}${metas.length > 120 ? '…' : ''}` : ''}${metas && contexto ? '<br>' : ''}${contexto ? `Contexto: ${escapeHtml(contexto.slice(0, 120))}${contexto.length > 120 ? '…' : ''}` : ''}${manualOk ? `<br>Manual: ${escapeHtml(extracto.slice(0, 120))}${extracto.length > 120 ? '…' : ''}` : ''}</p>
           <span class="skill-panel__badge skill-panel__badge--ok">Cargado</span>`
        : `<p class="skill-panel__manual-falta">Sin perfil — abre la <strong>ficha del cliente</strong> para cargar metas, contexto y manual de marca.</p>
           <button type="button" class="skill-panel__badge skill-panel__badge--falta skill-panel__btn-ficha" data-abrir-ficha-cliente="${cli.id}">Ficha cliente</button>`}
    </div>`;
  }
  return `<div class="skill-panel" style="border-color:${col.border};background:${col.bg}">
    <div class="skill-panel__head">
      <span class="skill-panel__emoji">${agente.emoji}</span>
      <div>
        <h3 class="skill-panel__titulo" style="color:${col.text}">Skill · ${escapeHtml(skill.nombre)}</h3>
        <p class="skill-panel__desc">${escapeHtml(skill.descripcion)}</p>
      </div>
    </div>
    <ul class="skill-panel__checklist">${checklist}</ul>
    ${manualHtml}
  </div>`;
}

function htmlFormManualMarca(cli) {
  const skill = skillDe(cli);
  if (!skill.usaManualMarca && !esClienteDiseno(cli)) return '';
  const mm = cli.manualMarca || { texto: '', archivos: [] };
  const archivos = (mm.archivos || []).map(a =>
    `<li class="manual-archivo-item">
      <span>${escapeHtml(a.nombre)}</span>
      <button type="button" class="btn btn--small archivo-btn--del" data-del-manual-archivo="${cli.id}" data-archivo-id="${a.id}" title="Quitar archivo">✕</button>
    </li>`
  ).join('');
  return `<div class="cliente-card__manual" data-manual-cliente="${cli.id}">
    <h4 class="cliente-card__manual-titulo">Manual de marca</h4>
    <p class="cliente-card__manual-hint">Pega directrices o sube imágenes, PDFs, videos y otros archivos. Se usa al realizar tareas de diseño.</p>
    <textarea class="manual-marca-texto" data-manual-texto="${cli.id}" rows="4" placeholder="Colores, tipografías, logo, tono, ejemplos…">${escapeHtml(mm.texto || '')}</textarea>
    <div class="manual-marca-archivos">
      <label class="btn btn--small btn--ghost manual-marca-upload">
        + Subir archivos
        <input type="file" multiple accept="image/*,video/*,audio/*,application/pdf,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.csv,.zip,.rar" data-manual-file="${cli.id}" hidden>
      </label>
      ${archivos ? `<ul class="manual-archivo-lista">${archivos}</ul>` : ''}
    </div>
    <button type="button" class="btn btn--primary btn--small" data-guardar-manual="${cli.id}">Guardar manual</button>
  </div>`;
}

function guardarManualMarcaCliente(cliId) {
  const cli = clienteDe(cliId);
  if (!cli) return;
  initManualesMarca(datos);
  const ta = document.querySelector(`[data-manual-texto="${cliId}"]`);
  let texto = ta ? ta.value.trim() : (cli.manualMarca.texto || '');
  if (texto.length > MAX_MANUAL_MARCA_CHARS) {
    texto = texto.slice(0, MAX_MANUAL_MARCA_CHARS);
    mostrarToast('Manual recortado al límite de almacenamiento');
  }
  cli.manualMarca.texto = texto;
  cli.manualMarca.actualizado = toISO(hoy());
  guardar();
  mostrarToast('Manual de marca guardado');
  render();
}

async function agregarArchivoManual(cliId, file) {
  if (window.agregarDocumentoFicha) {
    await window.agregarDocumentoFicha(cliId, file);
    return;
  }
  if (!file) return;
  const cli = clienteDe(cliId);
  if (!cli) return;
  const tiposOk = /\.(txt|md|csv|pdf|png|jpe?g|gif|webp|mp4|webm|mov|docx?|pptx?|xlsx?)$/i.test(file.name)
    || /^(text|image|video|audio|application)\//.test(file.type);
  if (!tiposOk) {
    mostrarToast('Formato no reconocido — prueba imagen, PDF, video o texto');
    return;
  }
  if (/^text\//.test(file.type) || /\.(txt|md|csv)$/i.test(file.name)) {
    const contenido = await file.text();
    const recorte = contenido.length > MAX_ARCHIVO_MANUAL_CHARS
      ? contenido.slice(0, MAX_ARCHIVO_MANUAL_CHARS)
      : contenido;
    initManualesMarca(datos);
    cli.manualMarca.archivos.push({
      id: id(),
      nombre: file.name,
      tipo: file.type || 'text/plain',
      contenido: recorte
    });
    cli.manualMarca.actualizado = toISO(hoy());
    guardar();
    mostrarToast(`Archivo «${file.name}» agregado`);
    render();
    return;
  }
  mostrarToast('Recarga la página (Ctrl+F5) para subir imágenes, PDFs y videos');
}

function bindManualesMarca(contenedor) {
  if (!contenedor) return;
  contenedor.querySelectorAll('[data-guardar-manual]').forEach(btn => {
    btn.addEventListener('click', () => guardarManualMarcaCliente(btn.dataset.guardarManual));
  });
  contenedor.querySelectorAll('[data-manual-file]').forEach(input => {
    input.addEventListener('change', async () => {
      const files = [...(input.files || [])];
      input.value = '';
      for (const f of files) await agregarArchivoManual(input.dataset.manualFile, f);
    });
  });
  contenedor.querySelectorAll('[data-del-manual-archivo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cli = clienteDe(btn.dataset.delManualArchivo);
      if (!cli?.manualMarca) return;
      cli.manualMarca.archivos = cli.manualMarca.archivos.filter(a => a.id !== btn.dataset.archivoId);
      guardar();
      render();
    });
  });
}

function renderListaArchivosPerfil(cli) {
  const lista = document.getElementById('perfil-manual-archivos-lista');
  if (!lista) return;
  const archivos = cli.manualMarca?.archivos || [];
  lista.innerHTML = archivos.map(a =>
    `<li class="manual-archivo-item">
      <span>${escapeHtml(a.nombre)}</span>
      <button type="button" class="btn btn--small archivo-btn--del" data-del-perfil-archivo="${a.id}" title="Quitar archivo">✕</button>
    </li>`
  ).join('');
  lista.querySelectorAll('[data-del-perfil-archivo]').forEach(btn => {
    btn.addEventListener('click', () => {
      cli.manualMarca.archivos = cli.manualMarca.archivos.filter(a => a.id !== btn.dataset.delPerfilArchivo);
      guardar();
      renderListaArchivosPerfil(cli);
    });
  });
}

function abrirPerfilCliente(cliId) {
  if (window.abrirFichaCliente) {
    window.abrirFichaCliente(cliId);
    return;
  }
  const cli = clienteDe(cliId);
  if (!cli) return;
  clientePerfilAbierto = cliId;
  initContextoCliente(datos);
  const col = colorDe(cli);
  const idInput = document.getElementById('perfil-cliente-id');
  if (idInput) idInput.value = cliId;
  const titulo = document.getElementById('modal-perfil-titulo');
  if (titulo) titulo.textContent = cli.nombre;
  const metas = document.getElementById('perfil-metas');
  if (metas) metas.value = cli.metas || '';
  const contexto = document.getElementById('perfil-contexto');
  if (contexto) contexto.value = cli.contextoPrompt || '';
  const manual = document.getElementById('perfil-manual');
  if (manual) manual.value = cli.manualMarca?.texto || '';
  const header = document.getElementById('perfil-cliente-header');
  if (header) {
    header.innerHTML = `<span class="cliente-card__tipo ${claseTipoCliente(cli.tipo)}" style="background:${col.border};color:#fff">${escapeHtml(etiquetaTipoCliente(cli.tipo))}</span>
      <span class="perfil-cliente__abrev">${escapeHtml(cli.abrev || abrevDe(cli))}</span>`;
    header.style.borderLeftColor = col.border;
    header.style.background = col.bg;
  }
  renderListaArchivosPerfil(cli);
  const modal = document.getElementById('modal-cliente-perfil');
  if (!modal) return;
  modal.hidden = false;
  modal.removeAttribute('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-abierto');
  setTimeout(() => document.getElementById('perfil-metas')?.focus(), 50);
}

function cerrarPerfilCliente() {
  const modal = document.getElementById('modal-cliente-perfil');
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute('hidden', '');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-abierto');
  document.getElementById('form-perfil-cliente')?.reset();
  clientePerfilAbierto = null;
}

function guardarPerfilCliente(e) {
  if (e) e.preventDefault();
  const cliId = document.getElementById('perfil-cliente-id')?.value || clientePerfilAbierto;
  const cli = clienteDe(cliId);
  if (!cli) return;
  initContextoCliente(datos);
  let textoManual = document.getElementById('perfil-manual')?.value.trim() || '';
  if (textoManual.length > MAX_MANUAL_MARCA_CHARS) {
    textoManual = textoManual.slice(0, MAX_MANUAL_MARCA_CHARS);
    mostrarToast('Manual recortado al límite de almacenamiento');
  }
  cli.manualMarca.texto = textoManual;
  cli.metas = document.getElementById('perfil-metas')?.value.trim() || '';
  cli.contextoPrompt = document.getElementById('perfil-contexto')?.value.trim() || '';
  cli.manualMarca.actualizado = toISO(hoy());
  guardar();
  mostrarToast('Perfil del cliente guardado');
  cerrarPerfilCliente();
  render();
}

function asegurarSesionAgente(tarea) {
  if (!tarea.sesionAgente?.mensajes?.length) {
    const cli = clienteDe(tarea.clienteId);
    const agente = agenteDe(cli);
    const rol = rolDe(tarea);
    tarea.sesionAgente = {
      mensajes: [{
        rol: 'agente',
        texto: mensajeAperturaAgente(tarea, cli, agente, rol),
        ts: Date.now()
      }]
    };
  }
  return tarea.sesionAgente;
}

function mensajeAperturaAgente(tarea, cli, agente, rol) {
  const titulo = nombreBaseTarea(tarea) || tarea.titulo;
  const fecha = tarea.fecha ? parseISO(tarea.fecha).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }) : 'sin fecha';
  const hora = etiquetaHoraTarea(tarea);
  const skill = skillDe(cli);
  const partes = [
    `Hola, soy **${agente.nombre}** — skill **${skill.nombre}**.`,
    `Vamos a trabajar en: **${titulo}**.`,
    cli ? `Cliente: ${cli.nombre}.` : '',
    rol ? `Rol: ${rol.nombre}.` : '',
    `Fecha: ${fecha} · ${hora}.`,
    tarea.notas ? `Notas: ${tarea.notas}` : '',
    skill.usaManualMarca
      ? (contextoClienteCargado(cli)
        ? 'Perfil del cliente cargado (metas, contexto, manual).'
        : '**Tip:** haz clic en el cliente en Clientes para cargar metas, contexto y manual de marca.')
      : (contextoClienteCargado(cli)
        ? 'Perfil del cliente cargado — lo usaré en el prompt.'
        : '**Tip:** carga el perfil del cliente en Clientes para mejores prompts.'),
  '',
    'Escribe qué necesitas entregar (mapa conceptual, inventario, código, copy…). **Lo armo y lo diseño aquí** en el chat — listo para compartir con tu contraparte.',
    '',
    '**Tip:** adjunta capturas del sitio o mockups con **+ Imágenes de referencia** debajo del prompt (por ejemplo, menú actual vs. propuesta).'
  ];
  return partes.filter(Boolean).join('\n');
}

function generarContextoCursor(tarea) {
  const ultimoUsuario = [...(tarea.sesionAgente?.mensajes || [])].reverse().find(m => m.rol === 'usuario');
  return generarPromptTrabajo(tarea, ultimoUsuario?.texto || '');
}

function solicitaProductoTerminado(mensaje) {
  return /entreg|desarroll|arm(a|e|é)|diseñ|crea|genera|mapa|diagrama|propuesta|implement|necesito el|contraparte|aprueb|inventario|auditor|muestra|visualiz|preview|c[oó]mo se ver|ver[ií]a|ver el mapa|hamburguesa|men[uú]|sitio\s*web|joyasmercury|categor[ií]as|mockup|captura/i.test((mensaje || '').toLowerCase());
}

function svgMenuHamburguesaJM() {
  const filas = [
    { y: 88, t: 'Inicio', bold: true },
    { y: 112, t: 'Colecciones ▾', bold: true, rosa: true },
    { y: 132, t: 'Esencial', sub: true },
    { y: 148, t: 'Aros', mini: true },
    { y: 162, t: 'Cadenas', mini: true },
    { y: 176, t: 'Anillos', mini: true },
    { y: 190, t: 'Pulseras', mini: true },
    { y: 204, t: 'Conjuntos', mini: true },
    { y: 224, t: 'Gold', sub: true },
    { y: 240, t: 'Aros · Cadenas · Anillos', mini: true },
    { y: 254, t: 'Pulseras · Conjuntos', mini: true },
    { y: 274, t: 'Deluxe', sub: true },
    { y: 290, t: 'Aros · Cadenas · Anillos', mini: true },
    { y: 304, t: 'Pulseras · Conjuntos', mini: true },
    { y: 328, t: 'Productos Destacados', bold: true },
    { y: 352, t: 'Historias que Brillan', bold: true },
    { y: 376, t: 'Contacto', bold: true },
    { y: 400, t: 'Mi Carrito', bold: true }
  ];
  const filasSvg = filas.map(it => {
    const fill = it.rosa ? '#C88F9C' : it.mini ? '#888' : it.sub ? '#A97E23' : '#2d2d2d';
    const weight = it.bold ? '700' : '400';
    const size = it.mini ? 8 : 9.5;
    const x = it.mini && !it.t.includes('·') ? 78 : 62;
    return `<text x="${x}" y="${it.y}" font-size="${size}" font-weight="${weight}" fill="${fill}" font-family="Georgia, serif">${escapeSvgText(it.t)}</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 480" width="320" height="480" class="mapa-previa-svg" role="img" aria-label="Menú hamburguesa Joyas Mercury">
  <rect width="320" height="480" fill="#FBFBFB" rx="12"/>
  <rect x="24" y="20" width="272" height="440" rx="16" fill="#fff" stroke="#ECC54A" stroke-width="2"/>
  <rect x="24" y="20" width="272" height="48" fill="#ECC54A" rx="16"/>
  <text x="160" y="50" text-anchor="middle" font-size="11" font-weight="700" fill="#2d2d2d" font-family="Georgia, serif">JOYAS MERCURY</text>
  <text x="286" y="44" font-size="14" fill="#2d2d2d">×</text>
  ${filasSvg}
</svg>`;
}

function svgMockupMenuJMPropuesta() {
  return svgMenuHamburguesaJM();
}

function svgVistaPreviaMapaJMAuditoria() {
  return svgMockupMenuJMPropuesta();
}

function escapeSvgText(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function svgVistaPreviaMapaGenerico(titulo) {
  const centro = escapeSvgText((titulo || 'Tarea').slice(0, 28));
  const centroCorto = escapeSvgText((titulo || 'Tarea').slice(0, 20));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400" class="mapa-previa-svg" role="img" aria-label="Mapa conceptual ${centro}">
  <rect width="640" height="400" fill="#FBFBFB" rx="10"/>
  <text x="320" y="24" text-anchor="middle" font-family="Segoe UI, system-ui, sans-serif" font-size="12" font-weight="700" fill="#5a5a5a">Mapa conceptual · ${centro}</text>
  <circle cx="320" cy="200" r="48" fill="#7ec8e3" stroke="#5ab4d4" stroke-width="2"/>
  <text x="320" y="205" text-anchor="middle" font-family="Segoe UI, system-ui, sans-serif" font-size="10" font-weight="600" fill="#2d2d2d">${centroCorto}</text>
  <line x1="280" y1="175" x2="120" y2="90" stroke="#5ab4d4" stroke-width="2"/>
  <line x1="360" y1="175" x2="520" y2="90" stroke="#5ab4d4" stroke-width="2"/>
  <line x1="280" y1="225" x2="120" y2="310" stroke="#5ab4d4" stroke-width="2"/>
  <line x1="360" y1="225" x2="520" y2="310" stroke="#5ab4d4" stroke-width="2"/>
  <rect x="50" y="65" width="120" height="50" rx="8" fill="#b8e4f2" stroke="#7ec8e3"/><text x="110" y="95" text-anchor="middle" font-size="10" fill="#2d2d2d">Alcance</text>
  <rect x="470" y="65" width="120" height="50" rx="8" fill="#b8e4f2" stroke="#7ec8e3"/><text x="530" y="95" text-anchor="middle" font-size="10" fill="#2d2d2d">Entregable</text>
  <rect x="50" y="285" width="120" height="50" rx="8" fill="#b8e4f2" stroke="#7ec8e3"/><text x="110" y="315" text-anchor="middle" font-size="10" fill="#2d2d2d">Contexto</text>
  <rect x="470" y="285" width="120" height="50" rx="8" fill="#b8e4f2" stroke="#7ec8e3"/><text x="530" y="315" text-anchor="middle" font-size="10" fill="#2d2d2d">Aprobación</text>
</svg>`;
}

function bloqueVistaPrevia(svgHtml) {
  return [
    '### Vista previa',
    '',
    '```preview',
    svgHtml,
    '```'
  ].join('\n');
}

function detectarTipoEntregable(tarea, mensaje) {
  const m = (mensaje || '').toLowerCase();
  const titulo = (nombreBaseTarea(tarea) || tarea.titulo || '').toLowerCase();
  const comb = `${m} ${titulo} ${tarea.notas || ''}`.toLowerCase();
  if (/mapa\s*conceptual|mind\s*map|diagrama\s*conceptual|hamburguesa|men[uú]\s*(m[oó]vil|hamburguesa)/.test(comb)) return 'mapa-conceptual';
  if (/diagrama|flowchart|flujo\s+de|mermaid/.test(comb)) return 'diagrama-flujo';
  if (/inventario|auditor[ií]a|bloques?\s+repetid/.test(comb)) return 'inventario';
  if (/gantt|cronograma|timeline/.test(comb)) return 'gantt';
  if (/wireframe|maqueta\s+visual|mockup/.test(comb)) return 'wireframe';
  if (/copy|texto|redacci|publicar/.test(comb)) return 'copy';
  if (/código|code|html|css|php|woocommerce/.test(comb)) return 'codigo';
  if (/mapa/.test(m)) return 'mapa-conceptual';
  return 'generico';
}

function palabrasIdentificadorasEntregable(tarea, solicitudUsuario = '') {
  const porTipo = {
    'mapa-conceptual': ['mapa', 'conceptual'],
    'diagrama-flujo': ['diagrama', 'flujo'],
    inventario: ['inventario', 'auditoria'],
    gantt: ['gantt', 'cronograma'],
    wireframe: ['menu', 'hamburguesa'],
    copy: ['copy', 'entregable'],
    codigo: ['codigo', 'desarrollo'],
    generico: ['entregable', 'tarea']
  };
  const tipo = detectarTipoEntregable(tarea, solicitudUsuario);
  return porTipo[tipo] || ['entregable', 'tarea'];
}

function solicitudUsuarioTarea(tarea) {
  return [...(tarea?.sesionAgente?.mensajes || [])].reverse().find(m => m.rol === 'usuario')?.texto || '';
}

function asegurarImagenesAgente(sesion) {
  if (!sesion.imagenesPendientes) sesion.imagenesPendientes = [];
  if (!sesion.imagenesReferencia) sesion.imagenesReferencia = [];
}

function leerImagenComoDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('No se pudo leer la imagen'));
    reader.readAsDataURL(file);
  });
}

function htmlMiniaturasImagenes(imagenes, { quitar = false, prefix = 'ref' } = {}) {
  if (!imagenes?.length) return '';
  const items = imagenes.map((img, i) => `
    <figure class="agente-ref-img">
      <img src="${img.dataUrl}" alt="${escapeHtml(img.nombre || 'Referencia')}" loading="lazy" />
      ${quitar ? `<button type="button" class="agente-ref-img__quitar" data-quitar-img="${prefix}-${i}" title="Quitar">×</button>` : ''}
      ${img.nombre ? `<figcaption>${escapeHtml(img.nombre)}</figcaption>` : ''}
    </figure>
  `).join('');
  return `<div class="agente-ref-imgs">${items}</div>`;
}

function htmlInputImagenesAgente(tarea) {
  asegurarImagenesAgente(tarea.sesionAgente);
  const pendientes = tarea.sesionAgente.imagenesPendientes;
  return `
    <div class="agente-imgs-form">
      <label class="agente-imgs-form__label">
        <input type="file" id="agente-imagenes-input" accept="image/*" multiple hidden />
        <span class="btn btn--ghost btn--small">+ Imágenes de referencia</span>
      </label>
      <p class="agente-imgs-form__hint">Capturas del sitio actual, mockups o referencias visuales para el entregable.</p>
      <div id="agente-imgs-pendientes">${htmlMiniaturasImagenes(pendientes, { quitar: true, prefix: 'pend' })}</div>
    </div>`;
}

function paletaMarcaJM() {
  return [
    'Dorado principal #ECC54A',
    'Dorado oscuro #A97E23',
    'Rosa marca #C88F9C',
    'Nude #D8BFB1',
    'Gris apoyo #C4C4C4',
    'Fondo claro #FBFBFB'
  ];
}

function guardarImagenesEnFichaCliente(cli, imagenes, tarea) {
  if (!cli || !imagenes?.length) return;
  if (!cli.ficha || typeof cli.ficha !== 'object') {
    cli.ficha = { contacto: '', links: '', notas: '', seccionesExtra: [], documentos: [] };
  }
  if (!Array.isArray(cli.ficha.documentos)) cli.ficha.documentos = [];
  const tituloTarea = nombreBaseTarea(tarea) || tarea?.titulo || 'tarea';

  imagenes.forEach(img => {
    if (!img?.dataUrl) return;
    const nombre = img.nombre || `referencia-${Date.now()}.png`;
    const ya = cli.ficha.documentos.some(d =>
      d.origen === 'agente-ref' && d.tareaId === tarea?.id && d.nombre === nombre && d.dataUrl === img.dataUrl
    );
    if (ya) return;
    cli.ficha.documentos.push({
      id: id(),
      clienteId: cli.id,
      origen: 'agente-ref',
      tareaId: tarea?.id,
      nombre,
      mime: img.dataUrl.match(/^data:([^;]+)/)?.[1] || 'image/png',
      categoria: 'imagen',
      tamano: img.dataUrl.length,
      subido: toISO(hoy()),
      dataUrl: img.dataUrl,
      notasAnalisis: `Referencia agente · ${tituloTarea}`,
      extraccionEstado: 'ok',
      extraccionMetodo: 'agente-ref'
    });
  });
  cli.ficha.actualizado = toISO(hoy());
}

function guardarGraficoEnFichaCliente(cli, tarea, svgHtml, etiqueta = 'entregable') {
  if (!cli || !svgHtml) return null;
  if (!cli.ficha || typeof cli.ficha !== 'object') {
    cli.ficha = { contacto: '', links: '', notas: '', seccionesExtra: [], documentos: [] };
  }
  if (!Array.isArray(cli.ficha.documentos)) cli.ficha.documentos = [];

  const nombre = nombreArchivoCliente(cli, [etiqueta, 'agente'], 'svg');
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgHtml)}`;
  const tituloTarea = nombreBaseTarea(tarea) || tarea.titulo;

  let doc = cli.ficha.documentos.find(d =>
    d.origen === 'agente' && d.tareaId === tarea.id && d.etiqueta === etiqueta
  );
  if (!doc) {
    doc = { id: id(), clienteId: cli.id, origen: 'agente', tareaId: tarea.id, etiqueta };
    cli.ficha.documentos.push(doc);
  }
  Object.assign(doc, {
    nombre,
    mime: 'image/svg+xml',
    categoria: 'imagen',
    tamano: svgHtml.length,
    subido: toISO(hoy()),
    dataUrl,
    notasAnalisis: `Gráfico agente · ${tituloTarea}`,
    extraccionEstado: 'ok',
    extraccionMetodo: 'agente-svg'
  });
  cli.ficha.actualizado = toISO(hoy());
  return doc;
}

function mapaConceptualJMAuditoriaMenu(tarea, cli) {
  const svg = svgMenuHamburguesaJM();
  guardarGraficoEnFichaCliente(cli, tarea, svg, 'menu-hamburguesa');
  return [
    bloqueVistaPrevia(svg),
    '',
    '**Menú hamburguesa — ítems**',
    '',
    '- Inicio',
    '- Colecciones ▾',
    '  - Esencial',
    '    - Aros',
    '    - Cadenas',
    '    - Anillos',
    '    - Pulseras',
    '    - Conjuntos',
    '  - Gold',
    '    - Aros',
    '    - Cadenas',
    '    - Anillos',
    '    - Pulseras',
    '    - Conjuntos',
    '  - Deluxe',
    '    - Aros',
    '    - Cadenas',
    '    - Anillos',
    '    - Pulseras',
    '    - Conjuntos',
    '- Productos Destacados',
    '- Historias que Brillan',
    '- Contacto',
    '- Mi Carrito'
  ].join('\n');
}

function mapaConceptualGenerico(tarea, cli, mensajeUsuario) {
  const titulo = nombreBaseTarea(tarea) || tarea.titulo;
  const svg = svgVistaPreviaMapaGenerico(titulo);
  guardarGraficoEnFichaCliente(cli, tarea, svg, 'mapa-conceptual');
  const metas = (cli?.metas || '').trim().split('\n').filter(Boolean).slice(0, 4);
  const contexto = (cli?.contextoPrompt || '').trim().split('\n').filter(Boolean).slice(0, 4);
  const ramas = [
    `**Tarea:** ${titulo}`,
    tarea.notas ? `**Alcance:** ${tarea.notas}` : '',
    ...metas.map(l => `**Meta cliente:** ${l.replace(/^[-•]\s*/, '')}`),
    ...contexto.map(l => `**Contexto:** ${l.replace(/^[-•]\s*/, '')}`),
    `**Tu solicitud:** ${mensajeUsuario.trim()}`
  ].filter(Boolean);
  return [
    bloqueVistaPrevia(svg),
    '',
    `**Mapa conceptual — ${titulo}**`,
    '',
    '#### Nodo central',
    titulo,
    '',
    '#### Ramas',
    ...ramas.map((r, i) => `${i + 1}. ${r}`),
    '',
    '#### Diseño sugerido',
    '- Nodo central destacado con color de marca del cliente',
    '- Subnodos en segunda jerarquía con notas breves',
    '- Pie de página con criterios de aprobación numerados',
    '',
    '```mermaid',
    'mindmap',
    `  root((${titulo.slice(0, 40)}))`,
    '    Alcance',
    '    Entregable',
    '    Aprobación',
    '```'
  ].join('\n');
}

function inventarioAuditoriaMenuJM(tarea, cli) {
  const titulo = nombreBaseTarea(tarea) || tarea.titulo;
  return [
    `**Inventario — ${titulo}**`,
    '',
    '| # | Elemento actual | Problema | Acción propuesta |',
    '|---|-----------------|----------|------------------|',
    '| 1 | Bloques categoría con conteo en home | Repetición visual | Eliminar o unificar en un solo bloque |',
    '| 2 | Menú principal | Demasiados ítems, sin eje colección | Reducir a 7 ítems; Colecciones como dropdown |',
    '| 3 | Landings Esencial/Gold/Deluxe | Desconectadas del menú | Enlazar desde Colecciones → subcategorías |',
    '| 4 | Destacados | Landing separada | Integrar en Inicio con selector WC |',
    '| 5 | Cabecera móvil | Franja negra “Encima de cabecera” | Ocultar fila en Astra |',
    '| 6 | WhatsApp | No consistente en navbar | Icono verde oficial en header |',
    '| 7 | Búsqueda + carrito | Ubicación inconsistente | Lupa + carrito siempre visibles a la derecha |',
    '',
    '**Criterio de cierre:** Camila aprueba el inventario y el mapa conceptual antes de implementar el menú limpio (siguiente tarea E1).'
  ].join('\n');
}

function entregableGenericoTarea(tarea, cli, mensajeUsuario) {
  const titulo = nombreBaseTarea(tarea) || tarea.titulo;
  const skill = skillDe(cli);
  return [
    `**${titulo}**`,
    '',
    '#### Resumen ejecutivo',
    mensajeUsuario.trim(),
    '',
    '#### Entregable estructurado',
    `1. **Contexto:** ${cli?.nombre || 'Cliente'} — ${skill.nombre}`,
    `2. **Alcance:** ${tarea.notas || 'Según tarea programada'}`,
    '3. **Formato:** Documento listo para revisión de contraparte',
    '4. **Contenido:** Desarrollo completo según tu solicitud (sin dejar pasos pendientes)',
    '',
    '#### Próxima iteración',
    'Indica qué cambiar y regenero la versión ajustada en este mismo hilo.'
  ].join('\n');
}

function generarEntregableTarea(tarea, cli, mensajeUsuario) {
  const tipo = detectarTipoEntregable(tarea, mensajeUsuario);
  const titulo = (nombreBaseTarea(tarea) || tarea.titulo || '').toLowerCase();
  const esJME1Menu = cli?.id === JM_CLI_ID && /auditor|menú|menu|bloques|e1/i.test(`${titulo} ${tarea.notas || ''}`);

  if ((tipo === 'mapa-conceptual' || tipo === 'wireframe') && esJME1Menu) return mapaConceptualJMAuditoriaMenu(tarea, cli, mensajeUsuario);
  if (tipo === 'mapa-conceptual') return mapaConceptualGenerico(tarea, cli, mensajeUsuario);
  if (tipo === 'inventario' && esJME1Menu) return inventarioAuditoriaMenuJM(tarea, cli);
  if (tipo === 'inventario') return inventarioAuditoriaMenuJM(tarea, cli);
  if (esJME1Menu && /hamburguesa|men[uú]|mockup|categor[ií]as?\s*repetid|joyasmercury|propuesta/i.test(mensajeUsuario || '')) {
    return mapaConceptualJMAuditoriaMenu(tarea, cli, mensajeUsuario);
  }
  return entregableGenericoTarea(tarea, cli, mensajeUsuario);
}

function generarRespuestaAgente(tarea, mensajeUsuario) {
  const cli = clienteDe(tarea.clienteId);
  const tituloTarea = nombreBaseTarea(tarea) || tarea.titulo;

  if (!tarea.sesionAgente) tarea.sesionAgente = { mensajes: [] };
  const promptListo = generarPromptTrabajo(tarea, mensajeUsuario);
  tarea.sesionAgente.ultimoPrompt = promptListo;

  if (solicitaProductoTerminado(mensajeUsuario)) {
    const entregable = generarEntregableTarea(tarea, cli, mensajeUsuario);
    tarea.sesionAgente.ultimoEntregable = entregable;
    guardar();
    if (cli && window.renderFichaCliente) {
      const modalFicha = document.getElementById('modal-cliente-perfil');
      if (modalFicha && !modalFicha.hidden) window.renderFichaCliente(cli);
    }
    return entregable;
  }

  const skill = skillDe(cli);
  return [
    `**Solicitud recibida** para *${tituloTarea}*`,
    '',
    'Pídeme el entregable concreto: por ejemplo «entrégame el mapa conceptual para que lo aprueben» y **lo armo y diseño aquí**, no solo un plan.',
    '',
    `Skill activo: **${skill.nombre}** · ${skill.descripcion}`
  ].join('\n');
}

function mostrarProximosPasos(tarea, solicitudUsuario = '') {
  if (!tarea.sesionAgente) tarea.sesionAgente = { mensajes: [] };
  tarea.sesionAgente.pasosSugeridos = generarPasosTarea(tarea, solicitudUsuario);
  tarea.sesionAgente.pasosVisibles = true;
  tarea.sesionAgente.ultimoPrompt = generarPromptTrabajo(tarea, solicitudUsuario);
}

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = texto;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}

function mostrarToast(mensaje) {
  let toast = document.getElementById('toast-app');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-app';
    toast.className = 'toast-app';
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.classList.add('toast-app--visible');
  clearTimeout(mostrarToast._timer);
  mostrarToast._timer = setTimeout(() => toast.classList.remove('toast-app--visible'), 2800);
}

function colorDe(cliente) {
  return COLORES[cliente?.color] || COLORES.lavanda;
}

function colorReunion() {
  return COLORES.reunion;
}

function mostrarVista(vista, { activarTab = false } = {}) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('view--active'));
  document.getElementById('view-' + vista)?.classList.add('view--active');
  if (activarTab) {
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.toggle('tab--active', t.dataset.view === vista);
    });
  } else if (VISTAS_CALENDARIO.has(vista)) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('tab--active'));
  }
  actualizarVistaCalendarioNav(vista);
}

const VISTAS_CALENDARIO = new Set(['mes', 'semana', 'dia', 'tarea']);

function actualizarVistaCalendarioNav(vista) {
  const nav = document.getElementById('vista-calendario-nav');
  if (!nav) return;
  const visible = VISTAS_CALENDARIO.has(vista);
  nav.hidden = !visible;
  nav.setAttribute('aria-hidden', visible ? 'false' : 'true');
  const activa = vista === 'tarea' ? 'dia' : vista;
  nav.querySelectorAll('[data-vista-nav]').forEach(btn => {
    const on = btn.dataset.vistaNav === activa;
    btn.classList.toggle('vista-switch__btn--active', on);
    btn.setAttribute('aria-current', on ? 'page' : 'false');
  });
}

function irAVistaCalendario(vista) {
  if (vista === 'mes') volverAMes();
  else if (vista === 'semana') volverASemana();
  else if (vista === 'dia') {
    if (tareaSeleccionada) volverADiaDesdeTarea();
    else if (diaSeleccionado) irADia(diaSeleccionado);
    else irADia(toISO(hoy()));
  }
}

function semanaOffsetPara(fecha) {
  const base = inicioSemana(hoy());
  const objetivo = inicioSemana(fecha);
  return Math.round((objetivo - base) / (7 * 24 * 60 * 60 * 1000));
}

function irASemanaDe(fechaISO) {
  semanaOffset = semanaOffsetPara(parseISO(fechaISO));
  diaSeleccionado = null;
  mostrarVista('semana');
  renderCalendario();
}

function irADia(fechaISO) {
  diaSeleccionado = fechaISO;
  const fecha = parseISO(fechaISO);
  semanaOffset = semanaOffsetPara(fecha);
  const hoyRef = hoy();
  hoyRef.setDate(1);
  mesOffset = (fecha.getFullYear() - hoyRef.getFullYear()) * 12 + (fecha.getMonth() - hoyRef.getMonth());
  mostrarVista('dia');
  renderDia();
}

function cambiarDia(delta) {
  if (!diaSeleccionado) return;
  const d = parseISO(diaSeleccionado);
  d.setDate(d.getDate() + delta);
  irADia(toISO(d));
}

function irATarea(tareaId, { actualizarHistorial = true } = {}) {
  const tarea = tareaDe(tareaId);
  if (!tarea) return;
  tareaSeleccionada = tareaId;
  if (tarea.fecha) diaSeleccionado = tarea.fecha;
  asegurarNumeroHistoricoTarea(tarea);
  asegurarSesionAgente(tarea);
  guardar();
  if (actualizarHistorial) escribirRutaTarea(tarea);
  mostrarVista('tarea');
  renderTarea();
}

function volverADiaDesdeTarea() {
  tareaSeleccionada = null;
  limpiarRutaTarea();
  if (diaSeleccionado) {
    mostrarVista('dia');
    renderDia();
  } else {
    volverAMes();
  }
}

function volverAMes() {
  tareaSeleccionada = null;
  diaSeleccionado = null;
  limpiarRutaTarea();
  mostrarVista('mes');
  renderCalendarioMes();
}

function volverASemana() {
  if (diaSeleccionado) {
    semanaOffset = semanaOffsetPara(parseISO(diaSeleccionado));
  }
  mostrarVista('semana');
  renderCalendario();
}

function mesReferencia() {
  const d = hoy();
  d.setDate(1);
  d.setMonth(d.getMonth() + mesOffset);
  return d;
}

function semanaActual() {
  const base = hoy();
  base.setDate(base.getDate() + semanaOffset * 7);
  const inicio = inicioSemana(base);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 6);
  return { inicio, fin };
}

function htmlBotonesTarea(t, { modo = 'cal' } = {}) {
  if (modo === 'pend') {
    return `<div class="tarea__acciones tarea__acciones--dia">
      <button type="button" class="tarea-accion tarea-accion--realizar" data-realizar="${t.id}" title="Abrir la misma tarea con el agente del cliente">
        <span class="tarea-accion__icon" aria-hidden="true">▶</span>
        <span class="tarea-accion__label">Realizar tarea</span>
      </button>
      <button type="button" class="tarea-accion tarea-accion--editar" data-act="editar" data-id="${t.id}" title="${TOOLTIPS.editar}">
        <span class="tarea-accion__icon" aria-hidden="true">✎</span>
        <span class="tarea-accion__label">Editar</span>
      </button>
      <button type="button" class="tarea-accion tarea-accion--pendiente" data-pend="hoy" data-id="${t.id}" title="${TOOLTIPS.pend_hoy}">
        <span class="tarea-accion__icon" aria-hidden="true">📅</span>
        <span class="tarea-accion__label">Agendar hoy</span>
      </button>
      <button type="button" class="tarea-accion tarea-accion--hecha" data-act="toggle" data-id="${t.id}" title="${TOOLTIPS.pend_ok}">
        <span class="tarea-accion__icon" aria-hidden="true">✓</span>
        <span class="tarea-accion__label">Marcar hecha</span>
      </button>
      <button type="button" class="tarea-accion tarea-accion--eliminar" data-act="eliminar" data-id="${t.id}" title="${TOOLTIPS.pend_del}">
        <span class="tarea-accion__icon" aria-hidden="true">✕</span>
        <span class="tarea-accion__label">Eliminar</span>
      </button>
    </div>`;
  }

  if (modo === 'dia' || modo === 'detalle') {
    const realizar = modo === 'detalle'
      ? `<button type="button" class="tarea-accion tarea-accion--realizar" data-resolver-agente data-id="${t.id}" title="Ir al agente para resolver la tarea">
        <span class="tarea-accion__icon" aria-hidden="true">▶</span>
        <span class="tarea-accion__label">Resolver tarea</span>
      </button>`
      : `<button type="button" class="tarea-accion tarea-accion--realizar" data-realizar="${t.id}" title="Abrir tarea con el agente del cliente">
        <span class="tarea-accion__icon" aria-hidden="true">▶</span>
        <span class="tarea-accion__label">Realizar tarea</span>
      </button>`;
    const hechaLabel = t.completada ? 'Deshacer' : 'Marcar hecha';
    const hechaIcon = t.completada ? '↩' : '✓';
    const editarBtn = `
      <button type="button" class="tarea-accion tarea-accion--editar" data-act="editar" data-id="${t.id}" title="${TOOLTIPS.editar}">
        <span class="tarea-accion__icon" aria-hidden="true">✎</span>
        <span class="tarea-accion__label">Editar</span>
      </button>`;
    const pendienteBtn = t.pendiente
      ? `<button type="button" class="tarea-accion tarea-accion--pendiente" data-act="agendar" data-id="${t.id}" title="${TOOLTIPS.agendar}">
        <span class="tarea-accion__icon" aria-hidden="true">📅</span>
        <span class="tarea-accion__label">Volver al calendario</span>
      </button>`
      : `<button type="button" class="tarea-accion tarea-accion--pendiente" data-act="pendiente" data-id="${t.id}" title="${TOOLTIPS.pendiente}">
        <span class="tarea-accion__icon" aria-hidden="true">→</span>
        <span class="tarea-accion__label">Pendiente</span>
      </button>`;
    return `<div class="tarea__acciones tarea__acciones--dia">
      ${realizar}
      ${editarBtn}
      <button type="button" class="tarea-accion tarea-accion--hecha" data-act="toggle" data-id="${t.id}" title="${TOOLTIPS.toggle}">
        <span class="tarea-accion__icon" aria-hidden="true">${hechaIcon}</span>
        <span class="tarea-accion__label">${hechaLabel}</span>
      </button>
      ${pendienteBtn}
      <button type="button" class="tarea-accion tarea-accion--eliminar" data-act="eliminar" data-id="${t.id}" title="${TOOLTIPS.eliminar}">
        <span class="tarea-accion__icon" aria-hidden="true">✕</span>
        <span class="tarea-accion__label">Eliminar</span>
      </button>
    </div>`;
  }

  return `<div class="tarea__acciones">
    <button class="tarea__btn" data-act="toggle" data-id="${t.id}" title="${TOOLTIPS.toggle}">${t.completada ? '↩' : '✓'}</button>
    <button class="tarea__btn" data-act="pendiente" data-id="${t.id}" title="${TOOLTIPS.pendiente}">→</button>
    <button class="tarea__btn tarea__btn--del" data-act="eliminar" data-id="${t.id}" title="${TOOLTIPS.eliminar}">✕</button>
  </div>`;
}

function minutosHora(hora) {
  if (!hora) return 24 * 60;
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + (m || 0);
}

function compararPorFechaHora(a, b) {
  const fa = a.fecha || '9999-12-31';
  const fb = b.fecha || '9999-12-31';
  if (fa !== fb) return fa.localeCompare(fb);
  const diff = minutosHora(a.horaInicio) - minutosHora(b.horaInicio);
  if (diff !== 0) return diff;
  return (a.titulo || '').localeCompare(b.titulo || '', 'es');
}

function tareasOrdenadasPorHorario(lista) {
  return [...lista].sort(compararPorFechaHora);
}

function compararItemsDia(a, b) {
  if (a.minutos !== b.minutos) return a.minutos - b.minutos;
  const ordenTipo = { cita: 0, reunion: 1, tarea: 2 };
  const ta = ordenTipo[a.tipo] ?? 9;
  const tb = ordenTipo[b.tipo] ?? 9;
  if (ta !== tb) return ta - tb;
  const tituloA = a.data?.titulo || a.data?.especialidad || '';
  const tituloB = b.data?.titulo || b.data?.especialidad || '';
  return tituloA.localeCompare(tituloB, 'es');
}

function etiquetaHoraTarea(t) {
  if (!t.horaInicio) return 'Sin hora';
  return t.horaFin ? `${t.horaInicio} – ${t.horaFin}` : t.horaInicio;
}

function itemsDiaOrdenados(fechaISO) {
  const items = [];
  datos.citasSalud.filter(c => c.fecha === fechaISO).forEach(c => {
    items.push({ tipo: 'cita', minutos: minutosHora(c.hora), data: c });
  });
  (datos.reunionesClientes || []).filter(r => r.fecha === fechaISO).forEach(r => {
    items.push({ tipo: 'reunion', minutos: minutosHora(r.horaInicio), data: r });
  });
  datos.tareas.filter(t => t.fecha === fechaISO && !t.pendiente).forEach(t => {
    items.push({ tipo: 'tarea', minutos: minutosHora(t.horaInicio), data: t });
  });
  return items.sort(compararItemsDia);
}

function normalizarCitasSalud(data) {
  data.citasSalud.forEach(c => {
    if (c.estado && !ESTADOS_CITA[c.estado]) delete c.estado;
  });
  return data;
}

function normalizarReunionesClientes(data) {
  if (!Array.isArray(data.reunionesClientes)) data.reunionesClientes = [];
  data.reunionesClientes.forEach(r => {
    if (r.estado && !ESTADOS_CITA[r.estado]) delete r.estado;
  });
  return data;
}

function etiquetaEstadoReunion(r) {
  return ESTADOS_CITA[r.estado]?.label || '';
}

function claseReunionEstado(r) {
  return r.estado ? ` reunion--${r.estado}` : '';
}

function htmlBadgeEstadoReunion(r) {
  if (!r.estado) return '';
  const e = ESTADOS_CITA[r.estado];
  return `<span class="cita-estado cita-estado--${r.estado}">${e.icon} ${e.label}</span>`;
}

function htmlBotonesReunion(r) {
  const fechaOrig = r.fechaOriginal && r.fechaOriginal !== r.fecha
    ? `<span class="reunion-fecha-orig">Antes: ${escapeHtml(formatFecha(parseISO(r.fechaOriginal)))}</span>`
    : '';
  return `<div class="cita__acciones cita__acciones--dia reunion__acciones">
    <button type="button" class="cita-accion cita-accion--asisti${r.estado === 'asisti' ? ' cita-accion--activa' : ''}" data-reunion-estado="asisti" data-id="${r.id}" title="Marcar si asististe">
      <span class="cita-accion__icon" aria-hidden="true">✓</span>
      <span class="cita-accion__label">Asistí</span>
    </button>
    <label class="reunion-cambiar-fecha" title="Mover a otro día">
      <span class="cita-accion__icon" aria-hidden="true">↻</span>
      <span class="cita-accion__label">Otro día</span>
      <input type="date" data-reunion-fecha data-id="${r.id}" value="${escapeHtml(r.fecha)}" class="reunion-fecha-input">
    </label>
    <button type="button" class="cita-accion cita-accion--anulada reunion-accion--del" data-reunion-del data-id="${r.id}" title="Eliminar reunión">
      <span class="cita-accion__icon" aria-hidden="true">✕</span>
      <span class="cita-accion__label">Eliminar</span>
    </button>
    ${fechaOrig}
  </div>`;
}

function setEstadoReunion(reunionId, estado) {
  const r = (datos.reunionesClientes || []).find(x => x.id === reunionId);
  if (!r || !ESTADOS_CITA[estado]) return;
  r.estado = r.estado === estado ? undefined : estado;
  guardar();
  render();
}

function cambiarFechaReunion(reunionId, nuevaFecha) {
  const r = (datos.reunionesClientes || []).find(x => x.id === reunionId);
  if (!r || !nuevaFecha || nuevaFecha === r.fecha) return;
  if (!r.fechaOriginal) r.fechaOriginal = r.fecha;
  r.fecha = nuevaFecha;
  r.estado = 'reagendada';
  datos = normalizarDatos(datos);
  guardar();
  render();
  mostrarToast(`Reunión movida al ${formatFecha(parseISO(nuevaFecha))}`);
}

function eliminarReunion(reunionId) {
  if (!confirm('¿Eliminar esta reunión?')) return;
  datos.reunionesClientes = (datos.reunionesClientes || []).filter(r => r.id !== reunionId);
  datos = normalizarDatos(datos);
  guardar();
  render();
  mostrarToast('Reunión eliminada');
}

function bindAccionesReunion(contenedor) {
  if (!contenedor) return;
  contenedor.querySelectorAll('[data-reunion-estado]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      setEstadoReunion(btn.dataset.id, btn.dataset.reunionEstado);
    });
  });
  contenedor.querySelectorAll('[data-reunion-fecha]').forEach(input => {
    input.addEventListener('change', () => {
      cambiarFechaReunion(input.dataset.id, input.value);
    });
  });
  contenedor.querySelectorAll('[data-reunion-del]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      eliminarReunion(btn.dataset.id);
    });
  });
}

function etiquetaEstadoCita(c) {
  return ESTADOS_CITA[c.estado]?.label || '';
}

function claseCitaEstado(c) {
  return c.estado ? ` cita--${c.estado}` : '';
}

function htmlBadgeEstadoCita(c) {
  if (!c.estado) return '';
  const e = ESTADOS_CITA[c.estado];
  return `<span class="cita-estado cita-estado--${c.estado}">${e.icon} ${e.label}</span>`;
}

function htmlBotonesCita(c) {
  return `<div class="cita__acciones cita__acciones--dia">
    ${Object.entries(ESTADOS_CITA).map(([key, e]) => `
      <button type="button" class="cita-accion cita-accion--${key}${c.estado === key ? ' cita-accion--activa' : ''}" data-cita-estado="${key}" data-id="${c.id}" title="Marcar como ${e.label}">
        <span class="cita-accion__icon" aria-hidden="true">${e.icon}</span>
        <span class="cita-accion__label">${e.label}</span>
      </button>`).join('')}
  </div>`;
}

function setEstadoCita(citaId, estado) {
  const c = datos.citasSalud.find(x => x.id === citaId);
  if (!c || !ESTADOS_CITA[estado]) return;
  c.estado = c.estado === estado ? undefined : estado;
  guardar();
  render();
}

function bindAccionesCita(contenedor) {
  contenedor.querySelectorAll('[data-cita-estado]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      setEstadoCita(btn.dataset.id, btn.dataset.citaEstado);
    });
  });
}

function textoCitaCompacto(c, maxLen = 10) {
  const e = ESTADOS_CITA[c.estado];
  const pref = e ? `${e.icon} ` : '🏥 ';
  if (!maxLen) return pref + c.especialidad;
  return pref + c.especialidad.slice(0, maxLen);
}

function textoReunionCompacto(r, maxLen = 14) {
  const e = ESTADOS_CITA[r.estado];
  const pref = e ? `${e.icon} ` : '📅 ';
  const titulo = (r.titulo || 'Reunión').replace(/^\[.*?\]\s*/, '');
  if (!maxLen) return pref + titulo;
  return pref + titulo.slice(0, maxLen);
}

function htmlCitaDia(c) {
  const s = COLORES.salud;
  return `<article class="dia-item dia-item--cita${claseCitaEstado(c)}" style="border-left-color:${s.border};background:${s.bg}">
    <div class="dia-item__hora" style="color:${s.text}">${escapeHtml(c.hora)}</div>
    <div class="dia-item__cuerpo">
      <div class="dia-item__tipo" style="color:${s.text}">Cita médica${etiquetaEstadoCita(c) ? ` · ${etiquetaEstadoCita(c)}` : ''}</div>
      <h3 class="dia-item__titulo">${escapeHtml(c.especialidad)}</h3>
      ${htmlBadgeEstadoCita(c)}
      ${c.notas ? `<p class="dia-item__detalle">${escapeHtml(c.notas)}</p>` : ''}
      ${htmlBotonesCita(c)}
    </div>
  </article>`;
}

function htmlReunionDia(r) {
  const cli = clienteDe(r.clienteId);
  const col = colorReunion();
  const hora = r.horaFin ? `${r.horaInicio} – ${r.horaFin}` : r.horaInicio;
  const titulo = r.titulo || `Reunión ${cli?.nombre || 'cliente'}`;
  return `<article class="dia-item dia-item--reunion${claseReunionEstado(r)}" style="border-left-color:${col.border};background:${col.bg}">
    <div class="dia-item__hora" style="color:${col.text}">${escapeHtml(hora)}</div>
    <div class="dia-item__cuerpo">
      <div class="dia-item__tipo" style="color:${col.text}">Reunión con cliente${etiquetaEstadoReunion(r) ? ` · ${etiquetaEstadoReunion(r)}` : ''}</div>
      <h3 class="dia-item__titulo">${escapeHtml(titulo)}</h3>
      ${cli ? `<p class="dia-item__detalle">${escapeHtml(cli.nombre)}</p>` : ''}
      ${r.notas ? `<p class="dia-item__detalle">${escapeHtml(r.notas)}</p>` : ''}
      ${htmlBadgeEstadoReunion(r)}
      ${htmlBotonesReunion(r)}
    </div>
  </article>`;
}

function htmlTareaDia(t) {
  const cli = clienteDe(t.clienteId);
  const col = colorDe(cli);
  const rol = rolDe(t);
  const titulo = nombreBaseTarea(t) || t.titulo;

  return `<article class="dia-item dia-item--tarea dia-item--clic tarea--${t.prioridad}${t.completada ? ' tarea--completada' : ''}" data-id="${t.id}" style="border-left-color:${col.border};background:${col.bg}" title="Clic para ver detalle y realizar tarea">
    <div class="dia-item__hora" style="color:${col.text}">${escapeHtml(etiquetaHoraTarea(t))}</div>
    <div class="dia-item__cuerpo">
      <div class="dia-item__tipo" style="color:${col.text}">Tarea${cli ? ` · ${escapeHtml(cli.nombre)}` : ''}</div>
      <h3 class="dia-item__titulo">${escapeHtml(titulo)}</h3>
      ${rol ? `<p class="dia-item__rol">${escapeHtml(rol.nombre)}</p>` : ''}
      ${t.prioridad ? `<p class="dia-item__meta">Prioridad: ${escapeHtml(t.prioridad)}</p>` : ''}
      ${t.notas ? `<p class="dia-item__detalle">${escapeHtml(t.notas)}</p>` : ''}
      ${htmlBotonesTarea(t, { modo: 'dia' })}
    </div>
  </article>`;
}

function tituloConCliente(clienteId, tituloRaw) {
  const limpio = (tituloRaw || '').replace(/^\[[^\]]+\]\s*/, '').trim();
  const cli = clienteDe(clienteId);
  if (cli?.abrev && limpio) return `[${cli.abrev}] ${limpio}`;
  return limpio || tituloRaw;
}

function llenarSelectClientesEditar() {
  const select = document.getElementById('edit-tarea-cliente');
  if (!select) return;
  select.innerHTML = '<option value="">Sin cliente</option>' +
    datos.clientes.map(c => `<option value="${c.id}">${escapeHtml(c.nombre)}</option>`).join('');
}

function abrirEditarTarea(tareaId) {
  const t = tareaDe(tareaId);
  if (!t) return;
  llenarSelectClientesEditar();
  document.getElementById('edit-tarea-id').value = t.id;
  document.getElementById('edit-tarea-titulo').value = nombreBaseTarea(t) || t.titulo;
  document.getElementById('edit-tarea-cliente').value = t.clienteId || '';
  document.getElementById('edit-tarea-fecha').value = t.fecha || '';
  document.getElementById('edit-tarea-hora-inicio').value = t.horaInicio || '';
  document.getElementById('edit-tarea-hora-fin').value = t.horaFin || '';
  document.getElementById('edit-tarea-notas').value = t.notas || '';
  document.getElementById('edit-tarea-prioridad').value = t.prioridad || 'media';
  const completada = document.getElementById('edit-tarea-completada');
  if (completada) completada.checked = !!t.completada;
  const pendiente = document.getElementById('edit-tarea-pendiente');
  if (pendiente) pendiente.checked = !!t.pendiente;
  const modal = document.getElementById('modal-editar-tarea');
  if (!modal) return;
  modal.hidden = false;
  modal.removeAttribute('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-abierto');
  setTimeout(() => document.getElementById('edit-tarea-titulo')?.focus(), 50);
}

function cerrarEditarTarea() {
  const modal = document.getElementById('modal-editar-tarea');
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute('hidden', '');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-abierto');
  document.getElementById('form-editar-tarea')?.reset();
}

function enfocarAgenteTarea() {
  const panel = document.getElementById('agente-contenido');
  const input = document.getElementById('agente-input');
  panel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  input?.focus();
}

function bindAccionesTarea(contenedor) {
  contenedor.querySelectorAll('[data-resolver-agente]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      enfocarAgenteTarea();
    });
  });
  contenedor.querySelectorAll('[data-realizar]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      irATarea(btn.dataset.realizar);
    });
  });
  contenedor.querySelectorAll('.dia-item--clic').forEach(item => {
    item.addEventListener('click', e => {
      if (e.target.closest('[data-act], [data-realizar], [data-resolver-agente], .tarea__acciones, .tarea-accion')) return;
      irATarea(item.dataset.id);
    });
  });
  contenedor.querySelectorAll('[data-act]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const t = datos.tareas.find(x => x.id === btn.dataset.id);
      if (!t) return;
      if (btn.dataset.act === 'editar') abrirEditarTarea(t.id);
      else if (btn.dataset.act === 'toggle') {
        t.completada = !t.completada;
        if (t.completada) t.pendiente = false;
        fijarAgendaUsuario(t);
        fijarEstadoUsuario(t);
      } else if (btn.dataset.act === 'pendiente') {
        marcarTareaPendiente(t);
        mostrarToast('Tarea en Pendientes — es la misma tarea, sin duplicar');
      } else if (btn.dataset.act === 'agendar') {
        quitarTareaPendiente(t);
        mostrarToast('Tarea de vuelta en el calendario');
      } else if (btn.dataset.act === 'eliminar' && confirm('¿Eliminar tarea?')) eliminarTarea(t.id);
      guardar();
      render();
    });
  });
}

function bindAccionesPendiente(contenedor) {
  contenedor.querySelectorAll('[data-pend]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const t = datos.tareas.find(x => x.id === btn.dataset.id);
      if (!t) return;
      if (btn.dataset.pend === 'hoy') {
        quitarTareaPendiente(t, { fecha: toISO(hoy()) });
        mostrarToast('Tarea agendada para hoy en el calendario');
      } else if (btn.dataset.pend === 'ok') completarTarea(t);
      else if (btn.dataset.pend === 'del' && confirm('¿Eliminar?')) eliminarTarea(t.id);
      guardar();
      render();
    });
  });
}

function htmlTareaPendiente(t) {
  const cli = clienteDe(t.clienteId);
  const col = colorDe(cli);
  const titulo = nombreBaseTarea(t) || t.titulo;
  const fechaRef = t.fechaOriginal || t.fecha;
  const fechaLabel = fechaRef ? formatFecha(parseISO(fechaRef)) : 'Sin fecha';
  const horaLabel = t.horaInicio ? ` · ${etiquetaHoraTarea(t)}` : '';
  return `<article class="tarea tarea--pendiente tarea--${t.prioridad} dia-item--clic" data-id="${t.id}" style="border-left-color:${col.border};background:${col.bg}" title="Clic para abrir la misma tarea">
    <div class="tarea-pendiente__meta">
      ${cli ? `<span class="tarea-pendiente__cliente">${escapeHtml(cli.nombre)}</span>` : ''}
      <span class="tarea-pendiente__fecha">Fecha prevista: ${escapeHtml(fechaLabel)}${escapeHtml(horaLabel)}</span>
    </div>
    <div class="tarea__titulo">${escapeHtml(titulo)}</div>
    ${t.notas ? `<p class="tarea__notas">${escapeHtml(t.notas)}</p>` : ''}
    ${htmlBotonesTarea(t, { modo: 'pend' })}
  </article>`;
}

function renderCalendarioMes() {
  const cont = document.getElementById('calendario-mes');
  const rango = document.getElementById('rango-mes');
  if (!cont || !rango) return;

  const ref = mesReferencia();
  const y = ref.getFullYear();
  const m = ref.getMonth();
  const hoyStr = toISO(hoy());

  rango.textContent = ref.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });

  const primerDia = new Date(y, m, 1);
  const inicioGrid = inicioSemana(primerDia);

  let html = DIAS_CORTOS.map(d => `<div class="mes-cabecera">${d}</div>`).join('');

  for (let i = 0; i < 42; i++) {
    const dia = new Date(inicioGrid);
    dia.setDate(dia.getDate() + i);
    const diaStr = toISO(dia);
    const esMesActual = dia.getMonth() === m;
    const esHoy = diaStr === hoyStr;

    const citas = datos.citasSalud.filter(c => c.fecha === diaStr);
    const reuniones = (datos.reunionesClientes || []).filter(r => r.fecha === diaStr);
    const tareas = datos.tareas.filter(t => t.fecha === diaStr && !t.pendiente);

    const items = [
      ...citas.map(c => ({
        minutos: minutosHora(c.hora),
        html: `<span class="mes-item mes-item--salud${claseCitaEstado(c)}" style="background:${COLORES.salud.bg};border-left-color:${COLORES.salud.border};color:${COLORES.salud.text}" title="${escapeHtml(c.especialidad + ' ' + c.hora + (etiquetaEstadoCita(c) ? ' · ' + etiquetaEstadoCita(c) : ''))}">${escapeHtml(textoCitaCompacto(c, 0))}</span>`
      })),
      ...reuniones.map(r => {
        const col = colorReunion();
        const hora = r.horaFin ? `${r.horaInicio}–${r.horaFin}` : r.horaInicio;
        return {
          minutos: minutosHora(r.horaInicio),
          html: `<span class="mes-item mes-item--reunion${claseReunionEstado(r)}" style="background:${col.bg};border-left-color:${col.border};color:${col.text}" title="${escapeHtml((r.titulo || 'Reunión') + ' ' + hora + (etiquetaEstadoReunion(r) ? ' · ' + etiquetaEstadoReunion(r) : ''))}">${escapeHtml(textoReunionCompacto(r, 0))}</span>`
        };
      }),
      ...tareas.map(t => {
        const cli = clienteDe(t.clienteId);
        const col = colorDe(cli);
        const cls = t.completada ? ' mes-item--completada' : '';
        return {
          minutos: minutosHora(t.horaInicio),
          html: `<span class="mes-item${cls}" style="background:${col.bg};border-left-color:${col.border};color:${col.text}" title="${escapeHtml(t.titulo)}">${escapeHtml(tituloMes(t, 0))}</span>`
        };
      })
    ].sort(compararItemsDia);

    const itemsHtml = items.map(x => x.html).join('');
    const alturaMin = items.length === 0 ? 108 : 36 + items.length * 26;

    html += `<div class="mes-dia${esHoy ? ' mes-dia--hoy' : ''}${!esMesActual ? ' mes-dia--fuera' : ''}" data-fecha="${diaStr}" data-items="${items.length}" style="min-height:${alturaMin}px" title="Ver semana del ${dia.toLocaleDateString('es-CL')}">
      <div class="mes-dia__num">${dia.getDate()}</div>
      <div class="mes-dia__items">${itemsHtml}</div>
    </div>`;
  }

  cont.innerHTML = html;
  cont.querySelectorAll('.mes-dia').forEach(celda => {
    celda.addEventListener('click', () => irASemanaDe(celda.dataset.fecha));
  });
}

function htmlItemCalendarioSemana(item) {
  if (item.tipo === 'cita') {
    const c = item.data;
    const s = COLORES.salud;
    return `<div class="cita-cal${claseCitaEstado(c)}" style="background:${s.bg};border-left-color:${s.border}"><span class="cita-cal__icon">${ESTADOS_CITA[c.estado]?.icon || '🏥'}</span><span class="cita-cal__text" style="color:${s.text}">${escapeHtml(c.especialidad)} · ${escapeHtml(c.hora)}${etiquetaEstadoCita(c) ? ' · ' + escapeHtml(etiquetaEstadoCita(c)) : ''}</span></div>`;
  }
  if (item.tipo === 'reunion') {
    const r = item.data;
    const col = colorReunion();
    const hora = r.horaFin ? `${r.horaInicio}–${r.horaFin}` : r.horaInicio;
    const icon = ESTADOS_CITA[r.estado]?.icon || '📅';
    return `<div class="cita-cal cita-cal--reunion${claseReunionEstado(r)}" style="background:${col.bg};border-left-color:${col.border}"><span class="cita-cal__icon">${icon}</span><span class="cita-cal__text" style="color:${col.text}">${escapeHtml(r.titulo || 'Reunión')} · ${escapeHtml(hora)}${etiquetaEstadoReunion(r) ? ' · ' + escapeHtml(etiquetaEstadoReunion(r)) : ''}</span></div>`;
  }
  const t = item.data;
  const col = colorDe(clienteDe(t.clienteId));
  const texto = tituloMes(t, MAX_TITULO_SEMANA);
  const completo = tituloMes(t, 200);
  const cls = t.completada ? ' tarea-mini--completada' : '';
  const hora = etiquetaHoraTarea(t);
  return `<div class="tarea-mini tarea-mini--clic${cls}" data-tarea-id="${t.id}" style="background:${col.bg};border-color:${col.border};color:${col.text}" title="${escapeHtml(hora + ' · ' + completo)} — Clic para resolver">${escapeHtml(texto)}</div>`;
}

function renderCalendario() {
  const cont = document.getElementById('calendario-semana');
  const rango = document.getElementById('rango-semana');
  if (!cont || !rango) return;

  const { inicio, fin } = semanaActual();
  const hoyStr = toISO(hoy());

  rango.textContent = `${inicio.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} — ${fin.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  cont.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const dia = new Date(inicio);
    dia.setDate(dia.getDate() + i);
    const diaStr = toISO(dia);

    const items = itemsDiaOrdenados(diaStr);
    const resumen = items.length
      ? items.map(htmlItemCalendarioSemana).join('')
      : '<p class="task-list--empty" style="font-size:0.7rem">Sin tareas</p>';

    const div = document.createElement('div');
    div.className = `dia dia--clic${diaStr === hoyStr ? ' dia--hoy' : ''}`;
    div.innerHTML = `
      <div class="dia__header dia__header--clic" data-fecha="${diaStr}" title="Ver detalle del día">
        <div class="dia__nombre">${DIAS[i]}</div>
        <div class="dia__numero">${dia.getDate()}</div>
      </div>
      <div class="dia__tareas dia__tareas--resumen">${resumen}</div>`;
    cont.appendChild(div);
  }

  cont.querySelectorAll('.dia__header--clic').forEach(hdr => {
    hdr.addEventListener('click', () => irADia(hdr.dataset.fecha));
  });
  cont.querySelectorAll('.tarea-mini--clic').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      irATarea(el.dataset.tareaId);
    });
  });
  cont.querySelectorAll('.dia__tareas--resumen').forEach(zona => {
    zona.addEventListener('click', e => {
      if (e.target.closest('.tarea-mini--clic')) return;
      const hdr = zona.closest('.dia')?.querySelector('.dia__header--clic');
      if (hdr) irADia(hdr.dataset.fecha);
    });
  });
}

function semanaDeDia(fechaISO) {
  const inicio = inicioSemana(parseISO(fechaISO));
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 6);
  return { inicio, fin };
}

function renderSemanaMini() {
  const cont = document.getElementById('calendario-semana-mini');
  const rango = document.getElementById('rango-semana-mini');
  if (!cont || !diaSeleccionado) return;

  const { inicio, fin } = semanaDeDia(diaSeleccionado);
  const hoyStr = toISO(hoy());

  if (rango) {
    rango.textContent = `${inicio.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} — ${fin.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }

  cont.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const dia = new Date(inicio);
    dia.setDate(dia.getDate() + i);
    const diaStr = toISO(dia);

    const items = itemsDiaOrdenados(diaStr);
    let itemsHtml = items.map(item => {
      if (item.tipo === 'cita') {
        const c = item.data;
        const s = COLORES.salud;
        return `<span class="semana-mini-item semana-mini-item--salud${claseCitaEstado(c)}" style="background:${s.bg};border-color:${s.border};color:${s.text}" title="${escapeHtml(c.especialidad + ' ' + c.hora + (etiquetaEstadoCita(c) ? ' · ' + etiquetaEstadoCita(c) : ''))}">${escapeHtml(textoCitaCompacto(c, 12))}</span>`;
      }
      if (item.tipo === 'reunion') {
        const r = item.data;
        const col = colorReunion();
        const hora = r.horaFin ? `${r.horaInicio}–${r.horaFin}` : r.horaInicio;
        return `<span class="semana-mini-item semana-mini-item--reunion${claseReunionEstado(r)}" style="background:${col.bg};border-color:${col.border};color:${col.text}" title="${escapeHtml((r.titulo || 'Reunión') + ' ' + hora + (etiquetaEstadoReunion(r) ? ' · ' + etiquetaEstadoReunion(r) : ''))}">${escapeHtml(textoReunionCompacto(r, 14))}</span>`;
      }
      const t = item.data;
      const col = colorDe(clienteDe(t.clienteId));
      const cls = t.completada ? ' semana-mini-item--completada semana-mini-item--clic' : ' semana-mini-item--clic';
      return `<span class="semana-mini-item${cls}" data-tarea-id="${t.id}" style="background:${col.bg};border-color:${col.border};color:${col.text}" title="${escapeHtml(tituloMes(t, 200))} — Clic para resolver">${escapeHtml(tituloMes(t, 22))}</span>`;
    }).join('');

    if (!itemsHtml) {
      itemsHtml = '<span class="semana-mini-item semana-mini-item--vacio">—</span>';
    }

    const clases = [
      'dia',
      'dia--mini',
      'dia--clic',
      diaStr === hoyStr ? 'dia--hoy' : '',
      diaStr === diaSeleccionado ? 'dia--seleccionado' : ''
    ].filter(Boolean).join(' ');

    const div = document.createElement('div');
    div.className = clases;
    div.innerHTML = `
      <div class="dia__header dia__header--clic" data-fecha="${diaStr}" title="Ver ${dia.toLocaleDateString('es-CL')}">
        <div class="dia__nombre">${DIAS_CORTOS[i]}</div>
        <div class="dia__numero">${dia.getDate()}</div>
      </div>
      <div class="dia__tareas dia__tareas--mini">${itemsHtml}</div>`;
    cont.appendChild(div);
  }

  cont.querySelectorAll('.dia__header--clic').forEach(hdr => {
    hdr.addEventListener('click', () => irADia(hdr.dataset.fecha));
  });
  cont.querySelectorAll('.semana-mini-item--clic').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      irATarea(el.dataset.tareaId);
    });
  });
  cont.querySelectorAll('.dia--mini').forEach(celda => {
    celda.addEventListener('click', e => {
      if (e.target.closest('.dia__header--clic, .semana-mini-item--clic')) return;
      const hdr = celda.querySelector('.dia__header--clic');
      if (hdr) irADia(hdr.dataset.fecha);
    });
  });
}

function renderDia() {
  if (!diaSeleccionado) return;
  const fecha = parseISO(diaSeleccionado);
  const titulo = document.getElementById('dia-titulo');
  const subtitulo = document.getElementById('dia-subtitulo');
  const cont = document.getElementById('dia-contenido');
  if (!titulo || !cont) return;

  const items = itemsDiaOrdenados(diaSeleccionado);
  const numTareas = items.filter(i => i.tipo === 'tarea').length;
  const numCitas = items.filter(i => i.tipo === 'cita').length;
  const numReuniones = items.filter(i => i.tipo === 'reunion').length;

  titulo.textContent = formatFecha(fecha);
  subtitulo.textContent = `${numTareas} tarea(s) · ${numReuniones} reunión(es) · ${numCitas} cita(s) · ordenado por hora`;

  if (!items.length) {
    cont.innerHTML = '<p class="task-list--empty">No hay tareas, reuniones ni citas este día.</p>';
  } else {
    cont.innerHTML = `<div class="dia-timeline">${items.map(item => {
      if (item.tipo === 'cita') return htmlCitaDia(item.data);
      if (item.tipo === 'reunion') return htmlReunionDia(item.data);
      return htmlTareaDia(item.data);
    }).join('')}</div>`;
    bindAccionesTarea(cont);
  }
  bindAccionesCita(cont);
  bindAccionesReunion(cont);
  renderSemanaMini();
}

function renderPasosSugeridos(tarea) {
  if (!tarea.sesionAgente?.pasosVisibles) return '';
  const pasos = tarea.sesionAgente?.pasosSugeridos || [];
  if (!pasos.length) return '';
  const items = pasos.map(p => `
    <li class="agente-pasos__item ${p.agendado ? 'agente-pasos__item--agendado' : ''}" data-paso-id="${p.id}">
      <div class="agente-pasos__item-head">
        <span class="agente-pasos__orden">${p.orden}</span>
        <strong>${escapeHtml(p.titulo)}</strong>
      </div>
      <p class="agente-pasos__notas">${escapeHtml(p.notas)}</p>
      ${p.agendado
        ? '<span class="agente-pasos__badge">En calendario</span>'
        : `<button type="button" class="btn btn--small btn--ghost" data-agendar-paso="${p.id}">+ Agregar al calendario</button>`}
    </li>`).join('');
  const pendientes = pasos.filter(p => !p.agendado).length;
  return `<div class="agente-pasos" id="agente-pasos-panel">
    <h4 class="agente-pasos__titulo">Pasos a seguir · futuras tareas</h4>
    <ol class="agente-pasos__lista">${items}</ol>
    ${pendientes > 1 ? '<button type="button" id="btn-agendar-todos-pasos" class="btn btn--small btn--accent">Agendar todos al calendario</button>' : ''}
  </div>`;
}

function renderMarkdownSimple(texto) {
  const partes = [];
  const re = /```(\w+)?\n?([\s\S]*?)```/g;
  let ultimo = 0;
  let match;
  while ((match = re.exec(texto)) !== null) {
    partes.push({ tipo: 'texto', valor: texto.slice(ultimo, match.index) });
    partes.push({ tipo: (match[1] || 'codigo').toLowerCase(), valor: match[2].trim() });
    ultimo = match.index + match[0].length;
  }
  partes.push({ tipo: 'texto', valor: texto.slice(ultimo) });

  function renderTexto(t) {
    return escapeHtml(t)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/^#### (.+)$/gm, '<h5 class="agente-md-h5">$1</h5>')
      .replace(/^### (.+)$/gm, '<h4 class="agente-md-h4">$1</h4>')
      .replace(/\n/g, '<br>');
  }

  return partes.map(p => {
    if (p.tipo === 'preview') {
      return `<div class="agente-vista-previa" data-vista-previa>
        <div class="agente-vista-previa__canvas">${p.valor}</div>
        <button type="button" class="btn btn--small btn--ghost agente-vista-previa__dl" data-descargar-preview>Descargar imagen</button>
      </div>`;
    }
    if (p.tipo === 'mermaid') {
      return `<pre class="agente-mermaid-src" hidden>${escapeHtml(p.valor)}</pre><div class="agente-mermaid-render" data-mermaid-pendiente></div>`;
    }
    if (p.tipo === 'codigo') {
      return `<pre class="agente-code">${escapeHtml(p.valor)}</pre>`;
    }
    return renderTexto(p.valor);
  }).join('');
}

function descargarSvgComoPng(svgEl, nombreArchivo = 'mapa-conceptual.png') {
  if (!svgEl) return;
  const clone = svgEl.cloneNode(true);
  if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const svgData = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 820;
    canvas.height = img.naturalHeight || 500;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FBFBFB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(pngBlob => {
      if (!pngBlob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(pngBlob);
      a.download = nombreArchivo;
      a.click();
      URL.revokeObjectURL(a.href);
      mostrarToast('Imagen descargada');
    }, 'image/png');
    URL.revokeObjectURL(url);
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    mostrarToast('No se pudo exportar la imagen');
  };
  img.src = url;
}

async function renderDiagramasAgente(contenedor) {
  const root = contenedor || document.getElementById('agente-contenido');
  if (!root) return;

  root.querySelectorAll('[data-descargar-preview]').forEach(btn => {
    btn.onclick = () => {
      const wrap = btn.closest('[data-vista-previa]');
      const svg = wrap?.querySelector('svg');
      const t = tareaDe(tareaSeleccionada);
      const cli = clienteDe(t?.clienteId);
      const solicitud = solicitudUsuarioTarea(t);
      const nombre = nombreArchivoCliente(cli, palabrasIdentificadorasEntregable(t, solicitud), 'png');
      descargarSvgComoPng(svg, nombre);
    };
  });

  if (!window.mermaid) return;

  const pendientes = root.querySelectorAll('[data-mermaid-pendiente]');
  for (const dest of pendientes) {
    const pre = dest.previousElementSibling;
    if (!pre?.classList.contains('agente-mermaid-src')) continue;
    const codigo = pre.textContent.trim();
    pre.remove();
    dest.removeAttribute('data-mermaid-pendiente');
    try {
      const mermaidId = 'mmd-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const { svg } = await mermaid.render(mermaidId, codigo);
      dest.innerHTML = svg;
      dest.classList.add('agente-mermaid-render--ok');
    } catch (e) {
      dest.innerHTML = `<pre class="agente-code">${escapeHtml(codigo)}</pre>`;
      console.warn('Mermaid:', e);
    }
  }
}

function renderTarea() {
  if (!tareaSeleccionada) return;
  const tarea = tareaDe(tareaSeleccionada);
  if (!tarea) return;

  asegurarSesionAgente(tarea);
  const cli = clienteDe(tarea.clienteId);
  const col = colorDe(cli);
  const rol = rolDe(tarea);
  const agente = agenteDe(cli);
  const titulo = nombreBaseTarea(tarea) || tarea.titulo;
  const fecha = tarea.fecha ? formatFecha(parseISO(tarea.fecha)) : 'Sin fecha';

  const detalle = document.getElementById('tarea-detalle-contenido');
  const agentePanel = document.getElementById('agente-contenido');
  if (!detalle || !agentePanel) return;

  const rutaRef = urlTareaAbsoluta(tarea);

  detalle.innerHTML = `
    <div class="tarea-detalle" style="border-left-color:${col.border}">
      <p class="tarea-detalle__ref" title="Abre o comparte este enlace para ir directo a la tarea">
        <a href="${escapeHtml(rutaRef)}" class="tarea-detalle__ref-link">${escapeHtml(rutaRef)}</a>
        <button type="button" class="btn btn--small btn--ghost tarea-detalle__ref-copiar" data-copiar-ruta-tarea title="Copiar enlace">Copiar</button>
      </p>
      <p class="tarea-detalle__fecha">${escapeHtml(fecha)} · ${escapeHtml(etiquetaHoraTarea(tarea))}</p>
      <h2 class="tarea-detalle__titulo">${escapeHtml(titulo)}</h2>
      ${cli ? `<p class="tarea-detalle__cliente"><strong>Cliente:</strong> ${escapeHtml(cli.nombre)}</p>` : ''}
      ${rol ? `<p class="tarea-detalle__rol"><strong>Rol:</strong> ${escapeHtml(rol.nombre)}</p>` : ''}
      ${tarea.prioridad ? `<p class="tarea-detalle__meta"><strong>Prioridad:</strong> ${escapeHtml(tarea.prioridad)}</p>` : ''}
      ${tarea.pendiente ? '<p class="tarea-detalle__meta tarea-detalle__meta--pendiente"><strong>Estado:</strong> En pendientes (no visible en calendario)</p>' : ''}
      ${tarea.notas ? `<div class="tarea-detalle__notas"><strong>Notas</strong><p>${escapeHtml(tarea.notas)}</p></div>` : ''}
      ${cli ? htmlSkillResumen(cli, col) : ''}
      <div class="tarea-detalle__acciones">
        ${htmlBotonesTarea(tarea, { modo: 'detalle' })}
      </div>
    </div>`;

  const skill = skillDe(cli);
  const mensajes = tarea.sesionAgente.mensajes.map(m => `
    <div class="agente-msg agente-msg--${m.rol}">
      <div class="agente-msg__autor">${m.rol === 'agente' ? `${agente.emoji} ${escapeHtml(agente.nombre)}` : 'Tú'}</div>
      ${m.imagenes?.length ? htmlMiniaturasImagenes(m.imagenes) : ''}
      <div class="agente-msg__texto">${renderMarkdownSimple(m.texto)}</div>
    </div>
  `).join('');

  const ultimoPrompt = tarea.sesionAgente.ultimoPrompt || '';
  const tieneSolicitud = tarea.sesionAgente.mensajes.some(m => m.rol === 'usuario');
  const pasosPanel = renderPasosSugeridos(tarea);
  const promptPreview = ultimoPrompt
    ? `<details class="agente-prompt-preview">
        <summary>Ver contexto generado (incluido en la descarga)</summary>
        <pre class="agente-prompt-pre">${escapeHtml(ultimoPrompt)}</pre>
      </details>`
    : '';

  agentePanel.innerHTML = `
    <div class="agente-header" style="border-color:${col.border};background:${col.bg}">
      <span class="agente-header__emoji">${agente.emoji}</span>
      <div>
        <h3 class="agente-header__nombre" style="color:${col.text}">${escapeHtml(agente.nombre)}</h3>
        <p class="agente-header__esp">${escapeHtml(agente.especialidad)} · ${escapeHtml(skill.nombre)}</p>
      </div>
    </div>
    <div class="agente-chat" id="agente-chat-mensajes">${mensajes}</div>
    ${promptPreview}
    ${pasosPanel}
    <form id="form-agente" class="agente-form">
      <label for="agente-input" class="agente-form__label">Tu prompt — qué necesitas entregar</label>
      <textarea id="agente-input" rows="3" placeholder="${escapeHtml(skill.ejemploSolicitud)}"></textarea>
      ${htmlInputImagenesAgente(tarea)}
      <div class="agente-form__acciones">
        <button type="submit" class="btn btn--primary">Enviar solicitud</button>
        <button type="button" id="btn-plantilla-prompt" class="btn btn--ghost">Usar plantilla</button>
        <button type="button" id="btn-descargar-info" class="btn btn--accent">Descargar la información</button>
        ${tieneSolicitud ? '<button type="button" id="btn-proximos-pasos" class="btn btn--ghost">Próximos pasos</button>' : ''}
      </div>
    </form>`;

  bindAccionesTarea(detalle);
  detalle.querySelector('[data-copiar-ruta-tarea]')?.addEventListener('click', async () => {
    const ok = await copiarTexto(urlTareaAbsoluta(tarea));
    mostrarToast(ok ? 'Enlace copiado' : 'No se pudo copiar — selecciona el enlace manualmente');
  });
  detalle.querySelectorAll('[data-abrir-ficha-cliente]').forEach(btn => {
    btn.addEventListener('click', () => (window.abrirFichaCliente || abrirPerfilCliente)(btn.dataset.abrirFichaCliente));
  });
  bindAgenteTarea(tarea);
  ajustarAlturaTextarea(document.getElementById('agente-input'));
  requestAnimationFrame(() => {
    syncAlturaPanelesTarea();
    observarAlturaPanelTarea();
    renderDiagramasAgente(agentePanel);
  });
}

function ajustarAlturaTextarea(ta) {
  if (!ta) return;
  ta.style.height = 'auto';
  ta.style.height = `${ta.scrollHeight}px`;
}

let _observerAlturaTarea = null;

function syncAlturaPanelesTarea() {
  const vista = document.getElementById('view-tarea');
  if (!vista?.classList.contains('view--active')) return;

  const left = document.querySelector('#view-tarea .panel--tarea-detalle');
  const right = document.querySelector('#view-tarea .panel--agente');
  if (!left || !right) return;

  if (window.matchMedia('(max-width: 900px)').matches) {
    right.style.height = '';
    return;
  }

  right.style.height = `${left.offsetHeight}px`;
}

function observarAlturaPanelTarea() {
  const left = document.querySelector('#view-tarea .panel--tarea-detalle');
  if (!left || typeof ResizeObserver === 'undefined') return;

  if (_observerAlturaTarea) _observerAlturaTarea.disconnect();

  _observerAlturaTarea = new ResizeObserver(() => syncAlturaPanelesTarea());
  _observerAlturaTarea.observe(left);
}

function bindAgenteTarea(tarea) {
  const form = document.getElementById('form-agente');
  const input = document.getElementById('agente-input');
  const btnDescargar = document.getElementById('btn-descargar-info');
  const btnPlantilla = document.getElementById('btn-plantilla-prompt');
  const btnProximosPasos = document.getElementById('btn-proximos-pasos');
  if (!form || !input) return;

  const cli = clienteDe(tarea.clienteId);
  const skill = skillDe(cli);

  input.addEventListener('input', () => ajustarAlturaTextarea(input));

  if (btnPlantilla) {
    btnPlantilla.onclick = () => {
      const titulo = nombreBaseTarea(tarea) || tarea.titulo;
      input.value = skill.ejemploSolicitud.replace('[entregable]', titulo).replace('[tema]', titulo);
      ajustarAlturaTextarea(input);
      input.focus();
    };
  }

  const procesarSolicitud = (texto) => {
    const t = tareaDe(tarea.id);
    if (!t || !texto) return;
    asegurarSesionAgente(t);
    asegurarImagenesAgente(t.sesionAgente);
    const imgs = [...(t.sesionAgente.imagenesPendientes || [])];
    const msgUsuario = { rol: 'usuario', texto, ts: Date.now() };
    if (imgs.length) {
      msgUsuario.imagenes = imgs.map(({ nombre, dataUrl }) => ({ nombre, dataUrl }));
      t.sesionAgente.imagenesReferencia.push(...msgUsuario.imagenes);
      t.sesionAgente.imagenesPendientes = [];
      guardarImagenesEnFichaCliente(cli, msgUsuario.imagenes, t);
    }
    t.sesionAgente.mensajes.push(msgUsuario);
    const respuesta = generarRespuestaAgente(t, texto);
    t.sesionAgente.mensajes.push({ rol: 'agente', texto: respuesta, ts: Date.now() });
    input.value = '';
    guardar();
    renderTarea();
  };

  const inputImgs = document.getElementById('agente-imagenes-input');
  if (inputImgs) {
    inputImgs.onchange = async (e) => {
      const t = tareaDe(tarea.id);
      if (!t) return;
      asegurarSesionAgente(t);
      asegurarImagenesAgente(t.sesionAgente);
      const files = [...(e.target.files || [])].filter(f => f.type.startsWith('image/'));
      for (const file of files) {
        try {
          const dataUrl = await leerImagenComoDataUrl(file);
          t.sesionAgente.imagenesPendientes.push({
            nombre: file.name,
            dataUrl
          });
        } catch {
          mostrarToast('No se pudo cargar una imagen');
        }
      }
      inputImgs.value = '';
      guardar();
      renderTarea();
    };
  }

  document.getElementById('agente-imgs-pendientes')?.querySelectorAll('[data-quitar-img]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = tareaDe(tarea.id);
      if (!t?.sesionAgente?.imagenesPendientes) return;
      const idx = Number(btn.dataset.quitarImg?.replace('pend-', ''));
      if (Number.isNaN(idx)) return;
      t.sesionAgente.imagenesPendientes.splice(idx, 1);
      guardar();
      renderTarea();
    });
  });

  form.onsubmit = e => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto) return;
    procesarSolicitud(texto);
  };

  if (btnProximosPasos) {
    btnProximosPasos.onclick = () => {
      const t = tareaDe(tarea.id);
      if (!t) return;
      asegurarSesionAgente(t);
      const ultimoUsuario = [...(t.sesionAgente.mensajes || [])].reverse().find(m => m.rol === 'usuario');
      const solicitud = input.value.trim() || ultimoUsuario?.texto || '';
      mostrarProximosPasos(t, solicitud);
      guardar();
      renderTarea();
      mostrarToast('Pasos futuros listos — puedes agendarlos al calendario');
    };
  }

  document.getElementById('agente-pasos-panel')?.querySelectorAll('[data-agendar-paso]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = tareaDe(tarea.id);
      if (!t?.sesionAgente?.pasosSugeridos) return;
      const paso = t.sesionAgente.pasosSugeridos.find(p => p.id === btn.dataset.agendarPaso);
      const idx = t.sesionAgente.pasosSugeridos.indexOf(paso);
      if (paso) agregarPasoAlCalendario(paso, t, idx);
      guardar();
      renderTarea();
    });
  });

  document.getElementById('btn-agendar-todos-pasos')?.addEventListener('click', () => {
    const t = tareaDe(tarea.id);
    if (!t?.sesionAgente?.pasosSugeridos) return;
    t.sesionAgente.pasosSugeridos.filter(p => !p.agendado).forEach((p, i) => {
      agregarPasoAlCalendario(p, t, i);
    });
    guardar();
    renderTarea();
  });

  if (btnDescargar) {
    btnDescargar.onclick = () => {
      const t = tareaDe(tarea.id);
      if (!t) return;
      asegurarSesionAgente(t);
      const ultimoUsuario = [...(t.sesionAgente.mensajes || [])].reverse().find(m => m.rol === 'usuario');
      const solicitud = input.value.trim() || ultimoUsuario?.texto || '';
      t.sesionAgente.ultimoPrompt = generarPromptTrabajo(t, solicitud);
      guardar();
      descargarInformacionAgente(t, solicitud);
      mostrarToast('Archivo descargado — contexto solo de ' + (cli?.abrev || 'cliente'));
      renderTarea();
    };
  }
}

function renderPendientes() {
  const lista = document.getElementById('lista-pendientes');
  if (!lista) return;
  const items = tareasOrdenadasPorHorario(datos.tareas.filter(t => t.pendiente && !t.completada));
  if (!items.length) {
    lista.innerHTML = '<p class="task-list--empty">No hay tareas pendientes</p>';
    return;
  }
  lista.innerHTML = items.map(t => htmlTareaPendiente(t)).join('');
  bindAccionesTarea(lista);
  bindAccionesPendiente(lista);
}

function renderReunionesClientes() {
  const lista = document.getElementById('lista-reuniones');
  const select = document.getElementById('reunion-cliente');
  if (!lista) return;

  const hoyStr = toISO(hoy());
  const ordenadas = [...(datos.reunionesClientes || [])].sort((a, b) =>
    a.fecha.localeCompare(b.fecha) || minutosHora(a.horaInicio) - minutosHora(b.horaInicio)
  );

  if (!ordenadas.length) {
    lista.innerHTML = '<p class="task-list--empty">No hay reuniones agendadas</p>';
  } else {
    lista.innerHTML = ordenadas.map(r => {
      const cli = clienteDe(r.clienteId);
      const col = colorReunion();
      const hora = r.horaFin ? `${r.horaInicio} – ${r.horaFin}` : r.horaInicio;
      return `<div class="reunion-card ${r.fecha < hoyStr ? 'reunion-card--pasada' : ''}${claseReunionEstado(r)}" style="border-left-color:${col.border}">
        <div class="reunion-card__fecha">
          <span>${parseISO(r.fecha).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          <span style="color:${col.text}">${escapeHtml(hora)}</span>
        </div>
        <div class="reunion-card__body">
          <strong style="color:${col.text}">${escapeHtml(r.titulo || 'Reunión')}</strong>
          <span class="reunion-card__cli">${escapeHtml(cli?.nombre || '')}</span>
          ${htmlBadgeEstadoReunion(r)}
          ${r.notas ? `<p class="reunion-card__notas">${escapeHtml(r.notas)}</p>` : ''}
          <div class="reunion-card__acciones">${htmlBotonesReunion(r)}</div>
        </div>
      </div>`;
    }).join('');
  }

  lista.querySelectorAll('[data-reunion-estado]').forEach(btn => {
    btn.addEventListener('click', () => setEstadoReunion(btn.dataset.id, btn.dataset.reunionEstado));
  });
  lista.querySelectorAll('[data-reunion-fecha]').forEach(input => {
    input.addEventListener('change', () => cambiarFechaReunion(input.dataset.id, input.value));
  });
  lista.querySelectorAll('[data-reunion-del]').forEach(btn => {
    btn.addEventListener('click', () => eliminarReunion(btn.dataset.id));
  });

  const opts = '<option value="">Elegir cliente</option>' +
    datos.clientes.map(c => `<option value="${c.id}">${escapeHtml(c.nombre)}</option>`).join('');
  if (select) select.innerHTML = opts;
}

function renderClientes() {
  const grid = document.getElementById('lista-clientes');
  const select = document.getElementById('tarea-cliente');
  if (!grid) return;

  grid.innerHTML = datos.clientes.map(c => {
    const col = colorDe(c);
    const skill = skillDe(c);
    const roles = (c.roles || []).map(r =>
      `<div class="cliente-card__rol"><strong>${escapeHtml(r.abrev || '')} · ${escapeHtml(r.nombre)}</strong></div>`
    ).join('');
    const ag = agenteDe(c);
    const perfilOk = contextoClienteCargado(c);
    const badge = perfilOk
      ? '<span class="cliente-card__badge cliente-card__badge--ok">Ficha con datos</span>'
      : '<span class="cliente-card__badge cliente-card__badge--pending">Ver ficha · sin datos</span>';
    return `<button type="button" class="cliente-card cliente-card--clic" data-cliente-id="${c.id}" style="background:${col.bg};border-color:${col.border};--cliente-text:${col.text}">
      <div class="cliente-card__nombre">${escapeHtml(c.nombre)} <span class="cliente-card__abrev">(${escapeHtml(c.abrev || abrevDe(c))})</span></div>
      <span class="cliente-card__tipo ${claseTipoCliente(c.tipo)}" style="background:${col.border};color:#fff">${escapeHtml(etiquetaTipoCliente(c.tipo))}</span>
      <div class="cliente-card__agente">${ag.emoji} ${escapeHtml(ag.nombre)}</div>
      <div class="cliente-card__skill-tag">Skill: ${escapeHtml(skill.nombre)}</div>
      <div class="cliente-card__roles">${roles}</div>
      ${badge}
    </button>`;
  }).join('');

  grid.querySelectorAll('[data-cliente-id]').forEach(btn => {
    btn.addEventListener('click', () => (window.abrirFichaCliente || abrirPerfilCliente)(btn.dataset.clienteId));
  });

  if (select) {
    select.innerHTML = '<option value="">Sin cliente</option>' +
      datos.clientes.map(c => `<option value="${c.id}">${escapeHtml(c.nombre)}</option>`).join('');
  }
}

let cacheAgentesRamas = null;

async function fetchAgentesRamas() {
  if (cacheAgentesRamas) return cacheAgentesRamas;
  try {
    const res = await fetch(AGENTES_RAMAS_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    cacheAgentesRamas = await res.json();
    return cacheAgentesRamas;
  } catch (e) {
    console.warn('No se pudo cargar agentes-ramas.json', e);
    return null;
  }
}

function renderAgentesRamas() {
  const cont = document.getElementById('lista-agentes-ramas');
  if (!cont) return;
  cont.innerHTML = '<p class="agentes-loading">Cargando ramas…</p>';
  fetchAgentesRamas().then(data => {
    if (!data || !Array.isArray(data.agentes)) {
      cont.innerHTML = '<p class="agentes-error">No se encontró data/agentes-ramas.json — abre con npx serve .</p>';
      return;
    }
    const repo = data.repo || '';
    const act = data.actualizado
      ? `<p class="agentes-meta">Actualizado: ${escapeHtml(data.actualizado)} · <a href="${escapeHtml(repo)}" target="_blank" rel="noopener">${escapeHtml(repo)}</a></p>`
      : '';
    cont.innerHTML = data.agentes.map(ag => {
      const ramas = (ag.ramas || []).map(r => {
        const pr = r.pr ? `<a class="agente-rama__pr" href="${repo}/pull/${r.pr}" target="_blank" rel="noopener">PR #${r.pr}</a>` : '';
        const estado = r.estado === 'activa'
          ? '<span class="agente-rama__estado agente-rama__estado--activa">activa</span>'
          : '<span class="agente-rama__estado">histórica</span>';
        return `<li class="agente-rama">
          <code class="agente-rama__nombre">${escapeHtml(r.nombre)}</code>
          <span class="agente-rama__titulo">${escapeHtml(r.titulo || '')}</span>
          ${estado} ${pr}
        </li>`;
      }).join('');
      const portal = ag.portal
        ? `<a class="agente-card__portal" href="${escapeHtml(ag.portal)}" target="_blank" rel="noopener">Abrir portal</a>`
        : '';
      return `<article class="agente-card">
        <header class="agente-card__head">
          <span class="agente-card__invocar">${escapeHtml(ag.invocar)}</span>
          <span class="agente-card__abrev">${escapeHtml(ag.abrev || '')}</span>
        </header>
        <h3 class="agente-card__cliente">${escapeHtml(ag.cliente)}</h3>
        <p class="agente-card__desc">${escapeHtml(ag.descripcion || '')}</p>
        ${portal}
        <ul class="agente-card__ramas">${ramas || '<li>Sin ramas registradas</li>'}</ul>
      </article>`;
    }).join('') + act;
  });
}

function vaciarTareasLocales() {
  if (!confirm('¿Vaciar todas las tareas del calendario en este navegador? Los clientes y fichas se mantienen.')) return;
  datos.tareas = [];
  if (!datos.meta) datos.meta = {};
  datos.meta.autoGenerarTareas = false;
  datos.meta.modoTrabajo = 'manual';
  guardar();
  render();
  mostrarToast('Calendario vacío — crea tareas con + Nueva cuando avances');
}

function renderSalud() {
  const lista = document.getElementById('lista-citas-salud');
  if (!lista) return;
  const hoyStr = toISO(hoy());
  lista.innerHTML = [...datos.citasSalud].sort((a, b) => b.fecha.localeCompare(a.fecha)).map(c => {
    const s = COLORES.salud;
    return `<div class="cita-card${claseCitaEstado(c)} ${c.fecha < hoyStr ? 'cita-card--pasada' : ''}" style="border-left-color:${s.border}">
      <div class="cita-card__fecha">
        <span class="cita-card__dia">${parseISO(c.fecha).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
        <span class="cita-card__hora" style="color:${s.text}">${escapeHtml(c.hora)}</span>
      </div>
      <div class="cita-card__body">
        <strong style="color:${s.text}">${escapeHtml(c.especialidad)}</strong>
        ${htmlBadgeEstadoCita(c)}
        ${c.notas ? `<p class="cita-card__notas">${escapeHtml(c.notas)}</p>` : ''}
        ${htmlBotonesCita(c)}
      </div>
      <button type="button" class="btn btn--small archivo-btn--del" data-del-cita="${c.id}" title="Eliminar cita">Eliminar</button>
    </div>`;
  }).join('');

  bindAccionesCita(lista);
  lista.querySelectorAll('[data-del-cita]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('¿Eliminar cita?')) return;
      datos.citasSalud = datos.citasSalud.filter(c => c.id !== btn.dataset.delCita);
      guardar();
      render();
    });
  });
}

function render() {
  actualizarHeaderFecha();
  renderCalendarioMes();
  renderCalendario();
  if (diaSeleccionado && document.getElementById('view-dia')?.classList.contains('view--active')) {
    renderDia();
  }
  if (tareaSeleccionada && document.getElementById('view-tarea')?.classList.contains('view--active')) {
    renderTarea();
  }
  renderPendientes();
  renderClientes();
  renderAgentesRamas();
  renderReunionesClientes();
  renderSalud();
}

function mostrarTipoNueva(tipo) {
  const esTarea = tipo === 'tarea';
  document.getElementById('nueva-panel-tarea')?.toggleAttribute('hidden', !esTarea);
  document.getElementById('nueva-panel-reunion')?.toggleAttribute('hidden', esTarea);
  document.querySelectorAll('[data-nueva-tipo]').forEach(btn => {
    const activo = btn.dataset.nuevaTipo === tipo;
    btn.classList.toggle('nueva-switch__btn--active', activo);
    btn.setAttribute('aria-selected', activo ? 'true' : 'false');
  });
}

function setupUI() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (!tab.dataset.view) return;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('tab--active'));
      tab.classList.add('tab--active');
      mostrarVista(tab.dataset.view, { activarTab: true });
      render();
    });
  });

  document.querySelectorAll('[data-vista-nav]').forEach(btn => {
    btn.addEventListener('click', () => irAVistaCalendario(btn.dataset.vistaNav));
  });

  document.getElementById('btn-semana-anterior').addEventListener('click', () => { semanaOffset--; renderCalendario(); });
  document.getElementById('btn-semana-siguiente').addEventListener('click', () => { semanaOffset++; renderCalendario(); });
  document.getElementById('btn-semana-hoy').addEventListener('click', () => { semanaOffset = 0; renderCalendario(); });

  document.getElementById('btn-mes-anterior').addEventListener('click', () => { mesOffset--; renderCalendarioMes(); });
  document.getElementById('btn-mes-siguiente').addEventListener('click', () => { mesOffset++; renderCalendarioMes(); });
  document.getElementById('btn-mes-hoy').addEventListener('click', () => { mesOffset = 0; renderCalendarioMes(); });

  document.getElementById('btn-dia-anterior')?.addEventListener('click', () => cambiarDia(-1));
  document.getElementById('btn-dia-siguiente')?.addEventListener('click', () => cambiarDia(1));
  document.getElementById('btn-dia-hoy')?.addEventListener('click', () => irADia(toISO(hoy())));

  document.getElementById('btn-vaciar-tareas')?.addEventListener('click', vaciarTareasLocales);

  document.getElementById('form-salud').addEventListener('submit', e => {
    e.preventDefault();
    datos.citasSalud.push({
      id: id(),
      fecha: document.getElementById('cita-fecha').value,
      hora: document.getElementById('cita-hora').value,
      especialidad: document.getElementById('cita-especialidad').value.trim(),
      notas: document.getElementById('cita-notas').value.trim()
    });
    e.target.reset();
    guardar();
    render();
  });

  document.querySelectorAll('[data-nueva-tipo]').forEach(btn => {
    btn.addEventListener('click', () => mostrarTipoNueva(btn.dataset.nuevaTipo));
  });
  mostrarTipoNueva('tarea');

  document.getElementById('form-reunion')?.addEventListener('submit', e => {
    e.preventDefault();
    const clienteId = document.getElementById('reunion-cliente').value;
    const cli = clienteDe(clienteId);
    const fecha = document.getElementById('reunion-fecha').value;
    const horaInicio = document.getElementById('reunion-inicio').value;
    const horaFin = document.getElementById('reunion-fin').value;
    const tituloRaw = document.getElementById('reunion-titulo').value.trim();
    const titulo = tituloRaw || (cli ? `Reunión ${cli.nombre}` : 'Reunión');

    datos.reunionesClientes.push({
      id: id(),
      clienteId,
      fecha,
      horaInicio,
      horaFin,
      titulo,
      notas: document.getElementById('reunion-notas').value.trim()
    });
    datos = normalizarDatos(datos);
    e.target.reset();
    const reunionFechaInput = document.getElementById('reunion-fecha');
    if (reunionFechaInput) reunionFechaInput.value = toISO(hoy());
    guardar();
    render();
    mostrarToast('Reunión agendada');
  });

  document.getElementById('form-tarea')?.addEventListener('submit', e => {
    e.preventDefault();
    const clienteId = document.getElementById('tarea-cliente').value || null;
    const cli = clienteDe(clienteId);
    const tituloRaw = document.getElementById('tarea-titulo').value.trim();
    const titulo = tituloConCliente(clienteId, tituloRaw);

    datos.tareas.push({
      id: id(),
      titulo,
      clienteId,
      fecha: document.getElementById('tarea-fecha').value,
      horaInicio: document.getElementById('tarea-hora-inicio').value,
      horaFin: document.getElementById('tarea-hora-fin').value,
      notas: document.getElementById('tarea-notas').value.trim() || undefined,
      prioridad: 'media',
      completada: false,
      pendiente: false
    });
    e.target.reset();
    document.getElementById('tarea-fecha').value = toISO(hoy());
    asignarRolesATareas(datos);
    guardar();
    render();
    mostrarToast('Tarea creada');
  });

  const tareaFecha = document.getElementById('tarea-fecha');
  if (tareaFecha) tareaFecha.value = toISO(hoy());
  const reunionFecha = document.getElementById('reunion-fecha');
  if (reunionFecha) reunionFecha.value = toISO(hoy());

  document.getElementById('btn-descargar-respaldo')?.addEventListener('click', () => {
    descargarRespaldo();
  });

  document.getElementById('form-editar-tarea')?.addEventListener('submit', e => {
    e.preventDefault();
    const tareaId = document.getElementById('edit-tarea-id').value;
    const t = tareaDe(tareaId);
    if (!t) return;
    const clienteId = document.getElementById('edit-tarea-cliente').value || null;
    const tituloRaw = document.getElementById('edit-tarea-titulo').value.trim();
    if (!tituloRaw) return;

    const eraPendiente = !!t.pendiente;
    t.titulo = tituloConCliente(clienteId, tituloRaw);
    t.clienteId = clienteId;
    t.fecha = document.getElementById('edit-tarea-fecha').value;
    t.horaInicio = document.getElementById('edit-tarea-hora-inicio').value;
    t.horaFin = document.getElementById('edit-tarea-hora-fin').value;
    t.notas = document.getElementById('edit-tarea-notas').value.trim() || undefined;
    t.prioridad = document.getElementById('edit-tarea-prioridad').value || 'media';
    t.completada = !!document.getElementById('edit-tarea-completada')?.checked;
    t.pendiente = !!document.getElementById('edit-tarea-pendiente')?.checked;
    if (t.completada) t.pendiente = false;
    if (t.pendiente && !eraPendiente) t.fechaOriginal = t.fecha;
    if (!t.pendiente && t.fechaOriginal) delete t.fechaOriginal;
    fijarAgendaUsuario(t);
    fijarEstadoUsuario(t);
    t.rolId = null;

    asignarRolesATareas(datos);
    if (document.getElementById('view-dia')?.classList.contains('view--active')) {
      diaSeleccionado = t.fecha;
    }
    if (tareaSeleccionada === t.id && t.fecha) diaSeleccionado = t.fecha;
    guardar();
    cerrarEditarTarea();
    render();
    if (tareaSeleccionada === t.id) renderTarea();
  });

  document.querySelectorAll('[data-cerrar-editar]').forEach(btn => {
    btn.addEventListener('click', cerrarEditarTarea);
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!document.getElementById('modal-editar-tarea')?.hidden) {
      cerrarEditarTarea();
      return;
    }
    if (!document.getElementById('modal-cliente-perfil')?.hidden) {
      cerrarPerfilCliente();
    }
  });

  if (!window.guardarFichaCliente) {
    document.getElementById('form-perfil-cliente')?.addEventListener('submit', guardarPerfilCliente);
    document.querySelectorAll('[data-cerrar-perfil]').forEach(btn => {
      btn.addEventListener('click', cerrarPerfilCliente);
    });
    document.getElementById('perfil-manual-file')?.addEventListener('change', e => {
      const f = e.target.files?.[0];
      const cliId = document.getElementById('perfil-cliente-id')?.value || clientePerfilAbierto;
      if (f && cliId) {
        agregarArchivoManual(cliId, f).then(() => {
          const cli = clienteDe(cliId);
          if (cli) renderListaArchivosPerfil(cli);
        });
      }
      e.target.value = '';
    });
  }

  window.addEventListener('resize', syncAlturaPanelesTarea);

  window.addEventListener('popstate', () => {
    if (aplicarRutaDesdeUrl()) return;
    if (tareaSeleccionada) {
      tareaSeleccionada = null;
      mostrarVista('mes');
      render();
    }
  });
}

async function fetchRespaldoDefecto() {
  try {
    const res = await fetch(RESPALDO_DEFECTO_URL, { cache: 'no-store' });
    if (!res.ok) return null;
    const obj = await res.json();
    if (obj && Array.isArray(obj.clientes) && Array.isArray(obj.tareas)) return obj;
  } catch (e) {
    console.warn('No se pudo leer el respaldo en data/ (abre con npx serve .)', e);
  }
  return null;
}

async function cargarDatosInicio() {
  const params = new URLSearchParams(location.search || '');

  // Forzar respaldo del repo (?respaldo=1) — ignora cambios locales del navegador
  const forzarRespaldo = params.get('respaldo') === '1';
  if (!forzarRespaldo && params.get('local') === '1') {
    return { datos: cargar(), origen: 'local' };
  }

  // Por defecto: conservar lo del navegador (borrados, fechas, estados)
  if (!forzarRespaldo && tieneDatosLocales()) {
    console.info('Datos cargados desde localStorage (tus cambios locales)');
    return { datos: cargar(), origen: 'local' };
  }

  const remoto = await fetchRespaldoDefecto();
  if (remoto) {
    const datos = normalizarDatos(remoto);
    datos.respaldoVersion = remoto.respaldoVersion || 1;
    datos.respaldoActualizado = remoto.respaldoActualizado || '';
    console.info('Respaldo oficial cargado:', RESPALDO_DEFECTO_URL);
    return { datos, origen: 'respaldo' };
  }

  return { datos: cargar(), origen: 'local' };
}

function init() {
  iniciarApp();
}

async function iniciarApp() {
  let origenCarga = 'local';
  try {
    const res = await cargarDatosInicio();
    datos = res.datos;
    origenCarga = res.origen;
  } catch (e) {
    console.error('Error al cargar datos', e);
    datos = normalizarDatos(datosIniciales());
    origenCarga = 'semilla';
  }

  const params = new URLSearchParams(location.search || '');
  if (params.get('vaciar-tareas') === '1') {
    datos.tareas = [];
    if (!datos.meta) datos.meta = {};
    datos.meta.autoGenerarTareas = false;
    datos.meta.modoTrabajo = 'manual';
    origenCarga = 'vaciar';
  }

  try {
    guardar();
  } catch (e) {
    console.warn('No se pudo guardar en localStorage', e);
  }

  if (params.get('vaciar-tareas') === '1') {
    const clean = location.pathname + (location.hash || '');
    history.replaceState({}, '', clean);
  }

  if (window.mermaid) {
    mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });
  }
  setupUI();
  if (!aplicarRutaDesdeUrl()) {
    mostrarVista('mes');
    render();
  }
  if (origenCarga === 'respaldo') {
    mostrarToast('Calendario vacío desde respaldo — modo manual (+ Nueva tarea)');
  } else if (origenCarga === 'local') {
    mostrarToast('Calendario con tus cambios guardados');
  } else if (origenCarga === 'vaciar') {
    mostrarToast('Tareas eliminadas — modo manual activo');
  } else if (location.protocol === 'file:') {
    mostrarToast('Abre con npx serve . para cargar el respaldo automáticamente');
  }
}

document.addEventListener('DOMContentLoaded', init);

window.reiniciarDatos = () => {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
};

/** Respaldo JSON (tareas, clientes, manuales de marca en localStorage) */
window.exportarDatos = () => {
  const d = datos || JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  console.log(JSON.stringify(d, null, 2));
  return d;
};

window.importarDatos = (obj) => {
  if (!obj || !Array.isArray(obj.tareas) || !Array.isArray(obj.clientes)) {
    console.error('Objeto inválido: necesita clientes[] y tareas[]');
    return false;
  }
  datos = normalizarDatos(obj);
  guardar();
  render();
  console.log('Datos importados OK');
  return true;
};

/** Recarga el respaldo oficial desde data/ (requiere npx serve .) */
window.importarRespaldoDefecto = async () => {
  const remoto = await fetchRespaldoDefecto();
  if (!remoto) {
    console.error('No se encontró', RESPALDO_DEFECTO_URL);
    mostrarToast('No se pudo cargar el respaldo — usa npx serve .');
    return false;
  }
  importarDatos(remoto);
  mostrarToast('Respaldo 24-jun importado');
  return true;
};

window.descargarRespaldo = () => {
  const d = exportarDatos();
  if (!d) return;
  d.respaldoVersion = (d.respaldoVersion || 0) + 1;
  d.respaldoActualizado = toISO(hoy());
  const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `organizacion-respaldo-${toISO(hoy())}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  mostrarToast('Respaldo descargado — guárdalo en data/ y haz commit');
};

/** Consola: abrirTareaPorSlug('joyas-mercury', '01') */
window.abrirTareaPorSlug = (slug, numero) => {
  const t = tareaPorRutaHistorica(slug, numero);
  if (!t) {
    console.error(`Tarea no encontrada: ${slug}/${numero}. Recarga la página (F5) para regenerar el cronograma JM.`);
    return null;
  }
  irATarea(t.id);
  return t;
};
