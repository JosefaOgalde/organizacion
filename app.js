/* Organización v2 */
const STORAGE_KEY = 'organizacion_v2';
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DIAS_CORTOS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
const MAX_ITEMS_MES = 4;
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
  salud: { border: '#98d4bc', bg: '#e8f6f0', text: '#4a8a72' }
};

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
    ejemploSolicitud: 'Necesito implementar [componente/página] de la etapa [n] según la cotización Fase 2.'
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
  pendiente: 'Mover a pendientes',
  eliminar: 'Eliminar tarea',
  editar: 'Editar tarea',
  pend_hoy: 'Asignar a hoy',
  pend_ok: 'Marcar como hecha',
  pend_del: 'Eliminar tarea'
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
            plazosEntregables: 'Entregas según cronograma del proyecto'
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
    tareas: [
      { id: id(), titulo: '[TS] Pub redes 10', clienteId: cliTS, rolId: 'rol-cm', fecha: '2026-06-25', horaInicio: '10:00', horaFin: '10:30', prioridad: 'alta', completada: false, pendiente: false },
      { id: id(), titulo: '[TS] Pub redes 11', clienteId: cliTS, rolId: 'rol-cm', fecha: '2026-06-26', horaInicio: '11:00', horaFin: '11:30', prioridad: 'alta', completada: false, pendiente: false },
      { id: id(), titulo: '[TS] Pub redes 12', clienteId: cliTS, rolId: 'rol-cm', fecha: '2026-06-30', horaInicio: '10:00', horaFin: '10:30', prioridad: 'alta', completada: false, pendiente: false },
      { id: id(), titulo: '[TS] Reporte junio', clienteId: cliTS, rolId: 'rol-cm', fecha: '2026-07-01', horaInicio: '10:00', horaFin: '11:00', prioridad: 'alta', completada: false, pendiente: false },
      { id: 'tarea-revision-descuento-jul', titulo: '[TS] Revisión término descuento', clienteId: cliTS, rolId: 'rol-wp', fecha: '2026-07-01', horaInicio: '09:00', horaFin: '10:30', prioridad: 'alta', completada: false, pendiente: false, notas: 'Verificar que los banners no estén publicados y que los productos que terminaron su descuento no se vean en precio promoción en el sitio.' },
      { id: id(), titulo: '[TS] Carga masiva', clienteId: cliTS, rolId: 'rol-wp', fecha: '2026-06-28', horaInicio: '09:30', horaFin: '12:00', prioridad: 'alta', completada: false, pendiente: false },
      {
        id: 'tarea-ecr-blog-24',
        titulo: '[ECR] Propuesta sección blog',
        clienteId: cliECR,
        rolId: 'rol-ecr-dev',
        fecha: '2026-06-24',
        horaInicio: '15:00',
        horaFin: '17:00',
        prioridad: 'alta',
        completada: false,
        pendiente: false,
        notas: 'Revisar y entregar solicitud de una parte específica del blog (Elementor / WordPress).'
      },
      ...tareasContenidosMensuales(cliPISC, 'PISC', 'rol-pisc-cm', 2026, 6, 0),
      ...tareasContenidosMensuales(cliHS, 'HS', 'rol-hs-cm', 2026, 6, 1),
      {
        id: 'tarea-mkof-gantt-etapa2',
        titulo: '[MKOF] Gantt etapa 2 post auditoría',
        clienteId: cliMKOF,
        rolId: 'rol-mkof-dev',
        fecha: hoyStr,
        horaInicio: '17:00',
        horaFin: '18:00',
        prioridad: 'alta',
        completada: false,
        pendiente: false,
        notas: 'Entregar Gantt de la etapa 2 post auditoría para establecer tiempos y entregables.'
      }
    ],
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
    tareasEliminadas: []
  };
}

function initMetaDatos(data) {
  if (!Array.isArray(data.tareasEliminadas)) data.tareasEliminadas = [];
  if (!Array.isArray(data.reunionesClientes)) data.reunionesClientes = [];
  return data;
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
    if (/Pub redes\s*10/i.test(t.titulo)) t.fecha = '2026-06-25';
    if (/Pub redes\s*11/i.test(t.titulo)) t.fecha = '2026-06-26';
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
  if (!revision && !tareaFueEliminada(data, 'tarea-revision-descuento-jul', {
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
      tarea.fecha = '2026-06-24';
      tarea.horaInicio = '15:00';
      tarea.horaFin = '17:00';
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
        tarea.fecha = fecha;
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

  for (let offset = -1; offset <= 3; offset++) {
    const ref = new Date(base.getFullYear(), base.getMonth() + offset, 1);
    clientes.forEach(c => {
      asegurarClienteContenidosMes(data, c.id, c.abrev, c.color, ref.getFullYear(), ref.getMonth() + 1, c.desfase);
    });
  }
  return data;
}

function asegurarReportesMensuales(data) {
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
        tarea.fecha = fechaStr;
        tarea.horaInicio = slot.horaInicio;
        tarea.horaFin = slot.horaFin;
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

function asegurarTareasJoyasMercuryFase2(data) {
  const rolId = 'rol-jm-dev';
  let fecha = parseISO(JM_FASE2_INICIO);
  let indice = 0;

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
        tarea.fecha = fechaStr;
        tarea.horaInicio = slot.horaInicio;
        tarea.horaFin = slot.horaFin;
        tarea.notas = plan.notas;
        tarea.prioridad = tarea.prioridad || 'alta';
      }
    }

    indice += 1;
    fecha.setDate(fecha.getDate() + 1);
  }

  return data;
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
  initContextoCliente(data);
  aplicarTareasEliminadas(data);
  normalizarCitasSalud(data);
  asegurarReunionesClientes(data);
  normalizarTareasTS(data);
  asegurarClienteECR(data);
  asegurarClientesRedes(data);
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

function guardar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
}

function clienteDe(idCliente) {
  return datos.clientes.find(c => c.id === idCliente);
}

function tareaDe(idTarea) {
  return datos.tareas.find(t => t.id === idTarea);
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
  return manualMarcaCargado(cli)
    || !!(cli.metas || '').trim()
    || !!(cli.contextoPrompt || '').trim();
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
  return t.length > 0 || archivos > 0;
}

function textoManualMarcaCompleto(cli) {
  if (!cli?.manualMarca) return '';
  const partes = [];
  if (cli.manualMarca.texto?.trim()) partes.push(cli.manualMarca.texto.trim());
  (cli.manualMarca.archivos || []).forEach(a => {
    if (a.contenido?.trim()) partes.push(`--- ${a.nombre} ---\n${a.contenido.trim()}`);
  });
  return partes.join('\n\n');
}

function extractoManualMarca(cli, max = 6000) {
  const texto = textoManualMarcaCompleto(cli);
  if (!texto) return '';
  return texto.length > max ? `${texto.slice(0, max)}\n\n[… manual recortado por tamaño …]` : texto;
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

  bloques.push(
    '',
    '## Entregable esperado',
    'Producción directa según la solicitud: copy listo, código, estructura HTML/CSS, brief de diseño detallado, checklist de pasos, etc.',
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
        : `<p class="skill-panel__manual-falta">Sin perfil — haz clic en el cliente en <strong>Clientes</strong> para cargar metas, contexto y manual de marca.</p>
           <span class="skill-panel__badge skill-panel__badge--falta">Pendiente</span>`}
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
    <p class="cliente-card__manual-hint">Pega directrices o sube .txt / .md. Se usa al realizar tareas de diseño.</p>
    <textarea class="manual-marca-texto" data-manual-texto="${cli.id}" rows="4" placeholder="Colores, tipografías, logo, tono, ejemplos…">${escapeHtml(mm.texto || '')}</textarea>
    <div class="manual-marca-archivos">
      <label class="btn btn--small btn--ghost manual-marca-upload">
        + Archivo de texto
        <input type="file" accept=".txt,.md,.csv,text/plain,text/markdown" data-manual-file="${cli.id}" hidden>
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
  if (!file) return;
  const cli = clienteDe(cliId);
  if (!cli) return;
  const tiposOk = /\.(txt|md|csv)$/i.test(file.name) || /^text\//.test(file.type);
  if (!tiposOk) {
    mostrarToast('Solo archivos de texto (.txt, .md, .csv)');
    return;
  }
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
  mostrarToast(`Archivo «${file.name}» agregado al manual`);
  render();
}

function bindManualesMarca(contenedor) {
  if (!contenedor) return;
  contenedor.querySelectorAll('[data-guardar-manual]').forEach(btn => {
    btn.addEventListener('click', () => guardarManualMarcaCliente(btn.dataset.guardarManual));
  });
  contenedor.querySelectorAll('[data-manual-file]').forEach(input => {
    input.addEventListener('change', () => {
      const f = input.files?.[0];
      if (f) agregarArchivoManual(input.dataset.manualFile, f);
      input.value = '';
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
    'Escribe tu **prompt** abajo (qué necesitas entregar) y te preparo el resultado. También puedes **Copiar prompt para Cursor** para ejecutarlo en el IDE.'
  ];
  return partes.filter(Boolean).join('\n');
}

function generarContextoCursor(tarea) {
  const ultimoUsuario = [...(tarea.sesionAgente?.mensajes || [])].reverse().find(m => m.rol === 'usuario');
  return generarPromptTrabajo(tarea, ultimoUsuario?.texto || '');
}

function generarRespuestaAgente(tarea, mensajeUsuario) {
  const cli = clienteDe(tarea.clienteId);
  const agente = agenteDe(cli);
  const skill = skillDe(cli);
  const titulo = (nombreBaseTarea(tarea) || tarea.titulo).toLowerCase();
  const msg = mensajeUsuario.toLowerCase();
  const tips = [];
  const entregables = [];

  if (skill.usaManualMarca && !manualMarcaCargado(cli)) {
    tips.push('Carga el **manual de marca** en la pestaña Clientes antes de cerrar piezas visuales.');
  } else if (skill.usaManualMarca && manualMarcaCargado(cli)) {
    tips.push('Aplicaré las directrices del manual de marca cargado (colores, tipografía, logo).');
  }

  skill.checklist.forEach(c => tips.push(c));

  if (/pub|redes|historia|metricool|copy/i.test(titulo + msg)) {
    entregables.push('Copy listo para publicar + checklist horario y repost en historias.');
  }
  if (/gantt|entregable|auditor|cronograma/i.test(titulo + msg)) {
    entregables.push('Tabla de hitos con fechas, dependencias y criterios de aceptación.');
  }
  if (/blog|elementor|wordpress|propuesta/i.test(titulo + msg)) {
    entregables.push('Estructura de secciones + notas para Elementor/WordPress.');
  }
  if (/redise|sitio|web|maquet|componente|joyas|filtro|carrito/i.test(titulo + msg)) {
    entregables.push('Plan de implementación + criterios UX/responsive para la etapa.');
  }
  if (/sentencia|buscador|sie|indexaci|tribunal/i.test(titulo + msg)) {
    entregables.push('Especificación técnica del módulo + casos de prueba de búsqueda.');
  }
  if (/diseñ|mockup|figma|visual|gráfic|grafic|pieza|presentaci|identidad|brand|flyer|key\s*visual|latam|banner/i.test(titulo + msg)) {
    entregables.push('Brief visual detallado: layout, colores hex, tipografías, medidas y variantes según manual.');
  }

  if (!entregables.length) {
    entregables.push('Entregable concreto según tu prompt (texto, código, estructura o brief listo para ejecutar).');
  }

  const promptListo = generarPromptTrabajo(tarea, mensajeUsuario);
  if (!tarea.sesionAgente) tarea.sesionAgente = { mensajes: [] };
  tarea.sesionAgente.ultimoPrompt = promptListo;

  return [
    `**Solicitud recibida** para *${nombreBaseTarea(tarea) || tarea.titulo}*`,
    '',
    '### Qué voy a preparar',
    ...entregables.map((e, i) => `${i + 1}. ${e}`),
    '',
    '### Checklist del skill',
    ...tips.slice(0, 6).map((t, i) => `${i + 1}. ${t}`),
    '',
    '### Siguiente paso',
    'Pulsa **Copiar prompt para Cursor** (abajo). Incluye skill, manual de marca si aplica, la tarea y tu solicitud. Pégalo en Cursor Agent para obtener el entregable.'
  ].join('\n');
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

function mostrarVista(vista, { activarTab = false } = {}) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('view--active'));
  document.getElementById('view-' + vista)?.classList.add('view--active');
  if (activarTab) {
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.toggle('tab--active', t.dataset.view === vista);
    });
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

function irATarea(tareaId) {
  const tarea = tareaDe(tareaId);
  if (!tarea) return;
  tareaSeleccionada = tareaId;
  if (tarea.fecha) diaSeleccionado = tarea.fecha;
  asegurarSesionAgente(tarea);
  guardar();
  mostrarVista('tarea');
  renderTarea();
}

function volverADiaDesdeTarea() {
  tareaSeleccionada = null;
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
  mostrarVista('mes', { activarTab: true });
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
    return `<div class="tarea__acciones">
      <button class="tarea__btn" data-pend="hoy" data-id="${t.id}" title="${TOOLTIPS.pend_hoy}">→ Hoy</button>
      <button class="tarea__btn" data-pend="ok" data-id="${t.id}" title="${TOOLTIPS.pend_ok}">✓</button>
      <button class="tarea__btn tarea__btn--del" data-pend="del" data-id="${t.id}" title="${TOOLTIPS.pend_del}">✕</button>
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
    return `<div class="tarea__acciones tarea__acciones--dia">
      ${realizar}
      ${editarBtn}
      <button type="button" class="tarea-accion tarea-accion--hecha" data-act="toggle" data-id="${t.id}" title="${TOOLTIPS.toggle}">
        <span class="tarea-accion__icon" aria-hidden="true">${hechaIcon}</span>
        <span class="tarea-accion__label">${hechaLabel}</span>
      </button>
      <button type="button" class="tarea-accion tarea-accion--pendiente" data-act="pendiente" data-id="${t.id}" title="${TOOLTIPS.pendiente}">
        <span class="tarea-accion__icon" aria-hidden="true">→</span>
        <span class="tarea-accion__label">Pendiente</span>
      </button>
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
  return items.sort((a, b) => a.minutos - b.minutos);
}

function normalizarCitasSalud(data) {
  data.citasSalud.forEach(c => {
    if (c.estado && !ESTADOS_CITA[c.estado]) delete c.estado;
  });
  return data;
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
  return pref + c.especialidad.slice(0, maxLen);
}

function textoReunionCompacto(r, maxLen = 14) {
  const cli = clienteDe(r.clienteId);
  const abrev = cli?.abrev || 'Reunión';
  const titulo = (r.titulo || `Reunión ${abrev}`).replace(/^\[.*?\]\s*/, '');
  return `📅 ${titulo.slice(0, maxLen)}`;
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
  const col = colorDe(cli);
  const hora = r.horaFin ? `${r.horaInicio} – ${r.horaFin}` : r.horaInicio;
  const titulo = r.titulo || `Reunión ${cli?.nombre || 'cliente'}`;
  return `<article class="dia-item dia-item--reunion" style="border-left-color:${col.border};background:${col.bg}">
    <div class="dia-item__hora" style="color:${col.text}">${escapeHtml(hora)}</div>
    <div class="dia-item__cuerpo">
      <div class="dia-item__tipo" style="color:${col.text}">Reunión con cliente</div>
      <h3 class="dia-item__titulo">${escapeHtml(titulo)}</h3>
      ${cli ? `<p class="dia-item__detalle">${escapeHtml(cli.nombre)}</p>` : ''}
      ${r.notas ? `<p class="dia-item__detalle">${escapeHtml(r.notas)}</p>` : ''}
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
      else if (btn.dataset.act === 'toggle') t.completada = !t.completada;
      else if (btn.dataset.act === 'pendiente') { t.pendiente = true; t.fechaOriginal = t.fecha; }
      else if (btn.dataset.act === 'eliminar' && confirm('¿Eliminar tarea?')) eliminarTarea(t.id);
      guardar();
      render();
    });
  });
}

function bindAccionesPendiente(contenedor) {
  contenedor.querySelectorAll('[data-pend]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = datos.tareas.find(x => x.id === btn.dataset.id);
      if (!t) return;
      if (btn.dataset.pend === 'hoy') { t.fecha = toISO(hoy()); t.pendiente = false; }
      else if (btn.dataset.pend === 'ok') t.completada = true;
      else if (btn.dataset.pend === 'del' && confirm('¿Eliminar?')) eliminarTarea(t.id);
      guardar();
      render();
    });
  });
}

function alertasHoy() {
  const hoyStr = toISO(hoy());
  const manana = new Date(hoy());
  manana.setDate(manana.getDate() + 1);
  const mananaStr = toISO(manana);
  const lista = [];

  datos.citasSalud.forEach(c => {
    if (c.fecha === hoyStr) lista.push({ titulo: `Hoy: ${c.especialidad}`, texto: `${c.hora} — ${c.notas || ''}`, prioridad: 'alta' });
    if (c.fecha === mananaStr) lista.push({ titulo: `Mañana: ${c.especialidad}`, texto: `${c.hora} — recordatorio 24h`, prioridad: 'alta' });
  });

  (datos.reunionesClientes || []).forEach(r => {
    const cli = clienteDe(r.clienteId);
    const hora = r.horaFin ? `${r.horaInicio}–${r.horaFin}` : r.horaInicio;
    const nombre = r.titulo || cli?.nombre || 'Cliente';
    if (r.fecha === hoyStr) lista.push({ titulo: `Hoy: ${nombre}`, texto: `${hora} — reunión`, prioridad: 'alta' });
    if (r.fecha === mananaStr) lista.push({ titulo: `Mañana: ${nombre}`, texto: `${hora} — reunión con ${cli?.nombre || 'cliente'}`, prioridad: 'alta' });
  });

  const pendientes = datos.tareas.filter(t => t.pendiente && !t.completada);
  if (pendientes.length) {
    lista.push({ titulo: 'Tareas pendientes', texto: `${pendientes.length} sin completar`, prioridad: 'media' });
  }
  return lista;
}

function renderAlertasHoy() {
  const items = alertasHoy();
  const html = items.length
    ? items.map(a => `<div class="alerta-chip alerta-chip--${a.prioridad}"><strong>${escapeHtml(a.titulo)}</strong><span>${escapeHtml(a.texto)}</span></div>`).join('')
    : '';
  ['alertas-hoy', 'alertas-hoy-mes'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = html;
    el.classList.toggle('alertas-hoy--activa', items.length > 0);
  });
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
        html: `<span class="mes-item mes-item--salud${claseCitaEstado(c)}" style="background:${COLORES.salud.bg};border-left-color:${COLORES.salud.border};color:${COLORES.salud.text}" title="${escapeHtml(c.especialidad + ' ' + c.hora + (etiquetaEstadoCita(c) ? ' · ' + etiquetaEstadoCita(c) : ''))}">${escapeHtml(textoCitaCompacto(c, 10))}</span>`
      })),
      ...reuniones.map(r => {
        const cli = clienteDe(r.clienteId);
        const col = colorDe(cli);
        const hora = r.horaFin ? `${r.horaInicio}–${r.horaFin}` : r.horaInicio;
        return {
          minutos: minutosHora(r.horaInicio),
          html: `<span class="mes-item mes-item--reunion" style="background:${col.bg};border-left-color:${col.border};color:${col.text}" title="${escapeHtml((r.titulo || 'Reunión') + ' ' + hora)}">${escapeHtml(textoReunionCompacto(r, 12))}</span>`
        };
      }),
      ...tareas.map(t => {
        const cli = clienteDe(t.clienteId);
        const col = colorDe(cli);
        const cls = t.completada ? ' mes-item--completada' : '';
        return {
          minutos: minutosHora(t.horaInicio),
          html: `<span class="mes-item${cls}" style="background:${col.bg};border-left-color:${col.border};color:${col.text}" title="${escapeHtml(t.titulo)}">${escapeHtml(tituloMes(t))}</span>`
        };
      })
    ].sort((a, b) => a.minutos - b.minutos);

    const visibles = items.slice(0, MAX_ITEMS_MES);
    const restantes = items.length - visibles.length;
    const itemsHtml = visibles.map(x => x.html).join('') +
      (restantes > 0 ? `<span class="mes-item mes-item--mas">+${restantes} más</span>` : '');

    html += `<div class="mes-dia${esHoy ? ' mes-dia--hoy' : ''}${!esMesActual ? ' mes-dia--fuera' : ''}" data-fecha="${diaStr}" title="Ver semana del ${dia.toLocaleDateString('es-CL')}">
      <div class="mes-dia__num">${dia.getDate()}</div>
      <div class="mes-dia__items">${itemsHtml}</div>
    </div>`;
  }

  cont.innerHTML = html;
  cont.querySelectorAll('.mes-dia').forEach(celda => {
    celda.addEventListener('click', () => irASemanaDe(celda.dataset.fecha));
  });
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

    const citas = datos.citasSalud.filter(c => c.fecha === diaStr).map(c => {
      const s = COLORES.salud;
      return `<div class="cita-cal${claseCitaEstado(c)}" style="background:${s.bg};border-left-color:${s.border}"><span class="cita-cal__icon">${ESTADOS_CITA[c.estado]?.icon || '🏥'}</span><span class="cita-cal__text" style="color:${s.text}">${escapeHtml(c.especialidad)} · ${escapeHtml(c.hora)}${etiquetaEstadoCita(c) ? ' · ' + escapeHtml(etiquetaEstadoCita(c)) : ''}</span></div>`;
    }).join('');

    const reuniones = (datos.reunionesClientes || []).filter(r => r.fecha === diaStr).map(r => {
      const cli = clienteDe(r.clienteId);
      const col = colorDe(cli);
      const hora = r.horaFin ? `${r.horaInicio}–${r.horaFin}` : r.horaInicio;
      return `<div class="cita-cal cita-cal--reunion" style="background:${col.bg};border-left-color:${col.border}"><span class="cita-cal__icon">📅</span><span class="cita-cal__text" style="color:${col.text}">${escapeHtml(r.titulo || 'Reunión')} · ${escapeHtml(hora)}</span></div>`;
    }).join('');

    const tareas = datos.tareas.filter(t => t.fecha === diaStr && !t.pendiente);
    const resumen = tareas.length
      ? tareas.map(t => {
          const col = colorDe(clienteDe(t.clienteId));
          const texto = tituloMes(t, MAX_TITULO_SEMANA);
          const completo = tituloMes(t, 200);
          const cls = t.completada ? ' tarea-mini--completada' : '';
          return `<div class="tarea-mini tarea-mini--clic${cls}" data-tarea-id="${t.id}" style="background:${col.bg};border-color:${col.border};color:${col.text}" title="${escapeHtml(completo)} — Clic para resolver">${escapeHtml(texto)}</div>`;
        }).join('')
      : '<p class="task-list--empty" style="font-size:0.7rem">Sin tareas</p>';

    const div = document.createElement('div');
    div.className = `dia dia--clic${diaStr === hoyStr ? ' dia--hoy' : ''}`;
    div.innerHTML = `
      <div class="dia__header dia__header--clic" data-fecha="${diaStr}" title="Ver detalle del día">
        <div class="dia__nombre">${DIAS[i]}</div>
        <div class="dia__numero">${dia.getDate()}</div>
      </div>
      <div class="dia__tareas dia__tareas--resumen">${citas}${reuniones}${resumen}</div>`;
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
        const col = colorDe(clienteDe(r.clienteId));
        const hora = r.horaFin ? `${r.horaInicio}–${r.horaFin}` : r.horaInicio;
        return `<span class="semana-mini-item semana-mini-item--reunion" style="background:${col.bg};border-color:${col.border};color:${col.text}" title="${escapeHtml((r.titulo || 'Reunión') + ' ' + hora)}">${escapeHtml(textoReunionCompacto(r, 14))}</span>`;
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
  renderSemanaMini();
}

function renderMarkdownSimple(texto) {
  return escapeHtml(texto)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<h4 class="agente-md-h4">$1</h4>')
    .replace(/\n/g, '<br>');
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

  detalle.innerHTML = `
    <div class="tarea-detalle" style="border-left-color:${col.border}">
      <p class="tarea-detalle__fecha">${escapeHtml(fecha)} · ${escapeHtml(etiquetaHoraTarea(tarea))}</p>
      <h2 class="tarea-detalle__titulo">${escapeHtml(titulo)}</h2>
      ${cli ? `<p class="tarea-detalle__cliente"><strong>Cliente:</strong> ${escapeHtml(cli.nombre)}</p>` : ''}
      ${rol ? `<p class="tarea-detalle__rol"><strong>Rol:</strong> ${escapeHtml(rol.nombre)}</p>` : ''}
      ${tarea.prioridad ? `<p class="tarea-detalle__meta"><strong>Prioridad:</strong> ${escapeHtml(tarea.prioridad)}</p>` : ''}
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
      <div class="agente-msg__texto">${renderMarkdownSimple(m.texto)}</div>
    </div>
  `).join('');

  const ultimoPrompt = tarea.sesionAgente.ultimoPrompt || '';
  const promptPreview = ultimoPrompt
    ? `<details class="agente-prompt-preview" open>
        <summary>Prompt generado (listo para Cursor)</summary>
        <pre class="agente-prompt-pre">${escapeHtml(ultimoPrompt.slice(0, 8000))}${ultimoPrompt.length > 8000 ? '\n…' : ''}</pre>
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
    <form id="form-agente" class="agente-form">
      <label for="agente-input" class="agente-form__label">Tu prompt — qué necesitas entregar</label>
      <textarea id="agente-input" rows="4" placeholder="${escapeHtml(skill.ejemploSolicitud)}"></textarea>
      <div class="agente-form__acciones">
        <button type="submit" class="btn btn--primary">Enviar solicitud</button>
        <button type="button" id="btn-plantilla-prompt" class="btn btn--ghost">Usar plantilla</button>
        <button type="button" id="btn-copiar-contexto" class="btn btn--accent">Copiar prompt para Cursor</button>
      </div>
    </form>`;

  bindAccionesTarea(detalle);
  bindAgenteTarea(tarea);
  const chat = document.getElementById('agente-chat-mensajes');
  if (chat) chat.scrollTop = chat.scrollHeight;
}

function bindAgenteTarea(tarea) {
  const form = document.getElementById('form-agente');
  const input = document.getElementById('agente-input');
  const btnCopiar = document.getElementById('btn-copiar-contexto');
  const btnPlantilla = document.getElementById('btn-plantilla-prompt');
  if (!form || !input) return;

  const cli = clienteDe(tarea.clienteId);
  const skill = skillDe(cli);

  if (btnPlantilla) {
    btnPlantilla.onclick = () => {
      const titulo = nombreBaseTarea(tarea) || tarea.titulo;
      input.value = skill.ejemploSolicitud.replace('[entregable]', titulo).replace('[tema]', titulo);
      input.focus();
    };
  }

  form.onsubmit = e => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto) return;
    const t = tareaDe(tarea.id);
    if (!t) return;
    asegurarSesionAgente(t);
    t.sesionAgente.mensajes.push({ rol: 'usuario', texto, ts: Date.now() });
    const respuesta = generarRespuestaAgente(t, texto);
    t.sesionAgente.mensajes.push({
      rol: 'agente',
      texto: respuesta,
      ts: Date.now()
    });
    input.value = '';
    guardar();
    renderTarea();
  };

  if (btnCopiar) {
    btnCopiar.onclick = async () => {
      const t = tareaDe(tarea.id);
      if (!t) return;
      asegurarSesionAgente(t);
      const ultimoUsuario = [...(t.sesionAgente.mensajes || [])].reverse().find(m => m.rol === 'usuario');
      const solicitud = input.value.trim() || ultimoUsuario?.texto || '';
      const prompt = generarPromptTrabajo(t, solicitud);
      t.sesionAgente.ultimoPrompt = prompt;
      guardar();
      await copiarTexto(prompt);
      mostrarToast('Prompt copiado — pégalo en Cursor Agent (Ctrl+L)');
      renderTarea();
    };
  }
}

function renderPendientes() {
  const lista = document.getElementById('lista-pendientes');
  if (!lista) return;
  const items = datos.tareas.filter(t => t.pendiente && !t.completada);
  if (!items.length) {
    lista.innerHTML = '<p class="task-list--empty">No hay tareas pendientes</p>';
    return;
  }
  lista.innerHTML = items.map(t => {
    const cli = clienteDe(t.clienteId);
    const col = colorDe(cli);
    return `<div class="tarea tarea--${t.prioridad}" style="border-left-color:${col.border};background:${col.bg}">
      <div class="tarea__titulo">${escapeHtml(t.titulo)}</div>
      ${htmlBotonesTarea(t, { modo: 'pend' })}
    </div>`;
  }).join('');
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
      const col = colorDe(cli);
      const hora = r.horaFin ? `${r.horaInicio} – ${r.horaFin}` : r.horaInicio;
      return `<div class="reunion-card ${r.fecha < hoyStr ? 'reunion-card--pasada' : ''}" style="border-left-color:${col.border}">
        <div class="reunion-card__fecha">
          <span>${parseISO(r.fecha).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          <span style="color:${col.text}">${escapeHtml(hora)}</span>
        </div>
        <div class="reunion-card__body">
          <strong style="color:${col.text}">${escapeHtml(r.titulo || 'Reunión')}</strong>
          <span class="reunion-card__cli">${escapeHtml(cli?.nombre || '')}</span>
          ${r.notas ? `<p class="reunion-card__notas">${escapeHtml(r.notas)}</p>` : ''}
        </div>
        <button type="button" class="btn btn--small archivo-btn--del" data-del-reunion="${r.id}" title="Eliminar reunión">Eliminar</button>
      </div>`;
    }).join('');
  }

  lista.querySelectorAll('[data-del-reunion]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('¿Eliminar reunión?')) return;
      datos.reunionesClientes = datos.reunionesClientes.filter(r => r.id !== btn.dataset.delReunion);
      datos = normalizarDatos(datos);
      guardar();
      render();
    });
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
      ? '<span class="cliente-card__badge cliente-card__badge--ok">Perfil cargado</span>'
      : '<span class="cliente-card__badge cliente-card__badge--pending">Clic para cargar perfil</span>';
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
    btn.addEventListener('click', () => abrirPerfilCliente(btn.dataset.clienteId));
  });

  if (select) {
    select.innerHTML = '<option value="">Sin cliente</option>' +
      datos.clientes.map(c => `<option value="${c.id}">${escapeHtml(c.nombre)}</option>`).join('');
  }
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
  document.getElementById('fecha-actual').textContent = formatFecha(hoy());
  renderAlertasHoy();
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
  renderReunionesClientes();
  renderSalud();
}

function setupUI() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (!tab.dataset.view) return;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('tab--active'));
      tab.classList.add('tab--active');
      if (tab.dataset.view === 'semana') { semanaOffset = 0; diaSeleccionado = null; tareaSeleccionada = null; }
      if (tab.dataset.view === 'mes') { mesOffset = 0; diaSeleccionado = null; tareaSeleccionada = null; }
      mostrarVista(tab.dataset.view, { activarTab: true });
      render();
    });
  });

  document.querySelectorAll('[data-nav="mes"]').forEach(btn => {
    btn.addEventListener('click', volverAMes);
  });
  document.querySelectorAll('[data-nav="semana"]').forEach(btn => {
    btn.addEventListener('click', volverASemana);
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

  document.getElementById('btn-volver-dia')?.addEventListener('click', volverADiaDesdeTarea);

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
    guardar();
    render();
  });

  document.getElementById('form-tarea').addEventListener('submit', e => {
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
  });

  document.getElementById('tarea-fecha').value = toISO(hoy());

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

    t.titulo = tituloConCliente(clienteId, tituloRaw);
    t.clienteId = clienteId;
    t.fecha = document.getElementById('edit-tarea-fecha').value;
    t.horaInicio = document.getElementById('edit-tarea-hora-inicio').value;
    t.horaFin = document.getElementById('edit-tarea-hora-fin').value;
    t.notas = document.getElementById('edit-tarea-notas').value.trim() || undefined;
    t.prioridad = document.getElementById('edit-tarea-prioridad').value || 'media';
    t.completada = !!document.getElementById('edit-tarea-completada')?.checked;
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

function init() {
  datos = cargar();
  guardar();
  setupUI();
  mostrarVista('mes', { activarTab: true });
  render();
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

window.descargarRespaldo = () => {
  const d = exportarDatos();
  if (!d) return;
  const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `organizacion-respaldo-${toISO(hoy())}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  mostrarToast('Respaldo descargado — guárdalo en data/ y haz commit');
};
