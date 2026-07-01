/** Datos del portal de clientes — Paso 1 (estático). Luego vendrá de Laravel + SQL. */
window.CLIENTES_PORTAL = [
  {
    archivo: 'trendseeker/index.html',
    id: 'cli-trendseeker',
    slug: 'trendseeker',
    nombre: 'Trendseeker - Talk',
    abrev: 'TS',
    tipo: 'Full time',
    color: { border: '#c4b8e8', bg: '#f0ecfa', text: '#6a5a9e' },
    agente: 'Community Manager + WordPress',
    resumen: 'Redes, Metricool, historias, banners y mantenimiento WordPress.',
    landing: {
      tagline: 'Confía en tu ritmo',
      entregables: ['12 publicaciones al mes', 'Informe Metricool', 'Historias en redes', 'Banners y WordPress'],
      secciones: [
        { titulo: 'Community Manager', texto: 'Publicaciones, historias y reportes mensuales en redes sociales.' },
        { titulo: 'WordPress', texto: 'Banners, productos, precios y cargas masivas en el sitio.' }
      ]
    }
  },
  {
    archivo: 'ecr/index.html',
    id: 'cli-ecr',
    slug: 'ecr',
    nombre: 'ECR - Talk',
    abrev: 'ECR',
    tipo: 'Full time',
    color: { border: '#98c8e0', bg: '#e8f4fc', text: '#4a7a9e' },
    agente: 'Newsletter LinkedIn + Blog',
    resumen: 'Newsletters, copys, carruseles y secciones blog en Elementor.',
    landing: {
      tagline: 'Contenido que posiciona',
      entregables: ['2 newsletters al mes', 'Copys feed y carrusel', 'Artículos de blog', 'Secciones Elementor'],
      secciones: [
        { titulo: 'Newsletter LinkedIn', texto: 'Invitación, carrusel y video del artículo cada ciclo.' },
        { titulo: 'Blog', texto: 'Propuestas, maquetación y publicación en WordPress.' }
      ]
    }
  },
  {
    archivo: 'piscineria/index.html',
    id: 'cli-piscineria',
    slug: 'piscineria',
    nombre: 'Piscinería - Talk',
    abrev: 'PISC',
    tipo: 'Full time',
    color: { border: '#a8dcc8', bg: '#eaf8f2', text: '#4a8a6e' },
    agente: 'Publicación de contenidos',
    resumen: '8 contenidos al mes en feed e historias (días hábiles).',
    landing: {
      tagline: 'Contenido constante en redes',
      entregables: ['8 publicaciones al mes', 'Historias en días hábiles', 'Calendario editorial'],
      secciones: [
        { titulo: 'Feed', texto: 'Piezas visuales y copy alineados a la marca Piscinería.' },
        { titulo: 'Historias', texto: 'Refuerzo diario en Instagram y formatos efímeros.' }
      ]
    }
  },
  {
    archivo: 'hotspring/index.html',
    id: 'cli-hotspring',
    slug: 'hotspring',
    nombre: 'Hotspring - Talk',
    abrev: 'HS',
    tipo: 'Full time',
    color: { border: '#a4d4c8', bg: '#e8f4ef', text: '#4a8670' },
    agente: 'Publicación de contenidos',
    resumen: '8 contenidos al mes en feed e historias (días hábiles).',
    landing: {
      tagline: 'Presencia digital sostenida',
      entregables: ['8 publicaciones al mes', 'Historias en días hábiles', 'Calendario editorial'],
      secciones: [
        { titulo: 'Feed', texto: 'Contenido de producto y bienestar para redes.' },
        { titulo: 'Historias', texto: 'Cobertura en días hábiles con piezas ligeras.' }
      ]
    }
  },
  {
    archivo: 'mkof/index.html',
    id: 'cli-mkof',
    slug: 'mkof',
    nombre: 'MKOF - Talk',
    abrev: 'MKOF',
    tipo: 'Full time',
    color: { border: '#a8d8dc', bg: '#e8f6f8', text: '#4a7a80' },
    agente: 'Planificación de proyectos',
    resumen: 'Gantt MOVA post-auditoría (3 semanas), cronogramas y entregables.',
    landing: {
      tagline: 'MOVA · Post-auditoría',
      entregables: ['Carta Gantt 3 semanas', 'Guía GitHub Paso 1', 'PPT para encargado'],
      secciones: [
        { titulo: 'Planificación MOVA', texto: 'Cronograma según playbook del cliente: Cloudflare, mova_auth y MySQL.' },
        { titulo: 'Entregables', texto: 'Gantt, guías visuales y presentaciones para el equipo.' }
      ]
    }
  },
  {
    archivo: 'joyasmercury/index.html?v=secciones3',
    id: 'cli-joyas-mercury',
    slug: 'joyas-mercury',
    nombre: 'Joyas Mercury',
    abrev: 'JM',
    tipo: 'Freelance',
    color: { border: '#e8b8c8', bg: '#fdf0f4', text: '#9a5a6e' },
    agente: 'Dev WooCommerce Fase 2',
    resumen: 'Rediseño joyasmercury.cl — menú, filtros, carrito, entrega.',
    landing: {
      tagline: 'Fase 2 · joyasmercury.cl',
      entregables: ['Menú y colecciones', 'Filtros AJAX', 'Carrito y checkout', 'Entrega 30/07'],
      secciones: [
        { titulo: 'WooCommerce', texto: 'Rediseño completo de la tienda con Esencial, Gold y Deluxe.' },
        { titulo: 'Wireframes', texto: 'Referencias desktop y mobile integradas en la landing del proyecto.' }
      ]
    }
  },
  {
    archivo: 'sie/index.html',
    id: 'cli-sie',
    slug: 'sie',
    nombre: 'SIE',
    abrev: 'SIE',
    tipo: 'Oportunidad',
    color: { border: '#b8c0c8', bg: '#eef0f4', text: '#5a6a7a' },
    agente: 'Buscador de sentencias',
    resumen: 'Ingesta, API, UI de búsqueda — avance fines de semana.',
    landing: {
      tagline: 'Buscador jurídico',
      entregables: ['Pipeline de ingesta', 'API de búsqueda', 'UI con filtros', 'Vista detalle'],
      secciones: [
        { titulo: 'Backend', texto: 'Normalización, indexación full-text y endpoints REST.' },
        { titulo: 'Frontend', texto: 'Barra de búsqueda, resultados, filtros y detalle de sentencia.' }
      ]
    }
  },
  {
    archivo: 'desafio-latam/index.html',
    id: 'cli-desafio-latam',
    slug: 'desafio-latam',
    nombre: 'Desafío Latam',
    abrev: 'ADL',
    tipo: 'Freelance',
    color: { border: '#e8c4a8', bg: '#fdf4ec', text: '#9a6a4a' },
    agente: 'Diseño freelance',
    resumen: 'Encargos esporádicos. Cada proyecto tiene su propia identidad y manual de marca.',
    landing: {
      tagline: 'Diseño por proyecto',
      entregables: ['Identidad por encargo', 'Manuales de marca', 'Piezas gráficas'],
      secciones: [
        { titulo: 'Multi-proyecto', texto: 'Cada cliente ADL mantiene paleta y entregables separados.' }
      ]
    },
    proyectos: [
      {
        codigo: 'CLA',
        nombre: 'Caja Los Andes',
        archivo: 'DesafioLatam/CLA',
        resumen: 'Programa IA — certificados modulares Fase 1, 2, 3 y final (1123×794 px).',
        color: { border: '#1a6b4a', bg: '#edf7f2', text: '#1a5c40' },
        identidad: {
          primario: '#007A3D',
          secundario: '#00A651',
          acento: '#F5B335',
          fondo: '#F7FAF8'
        }
      }
    ]
  },
  {
    archivo: 'herramientas/index.html',
    id: 'cli-herramientas',
    slug: 'herramientas',
    nombre: 'Herramientas',
    abrev: 'HER',
    tipo: 'Freelance',
    color: { border: '#b8aee8', bg: '#f5f4fc', text: '#5b4fcf' },
    agente: 'Herramientas internas',
    resumen: 'Proyectos de herramientas y utilidades. Cada proyecto mantiene su identidad y entregables.',
    landing: {
      tagline: 'Utilidades internas',
      entregables: ['Prototipos rápidos', 'Dashboards', 'Análisis de datos'],
      secciones: [
        { titulo: 'Laboratorio', texto: 'Herramientas propias para apoyar trabajo con clientes.' }
      ]
    },
    proyectos: [
      {
        codigo: 'TEND',
        nombre: 'Tendencias',
        archivo: 'Herramientas/Tendencias',
        resumen: 'Herramientas de análisis y seguimiento de tendencias.',
        descripcion: 'Análisis de mercado, señales y seguimiento de tendencias para apoyar decisiones de contenido y producto.',
        color: { border: '#5B4FCF', bg: '#F5F4FC', text: '#5B4FCF' },
        identidad: {
          primario: '#5B4FCF',
          secundario: '#7B6FE8',
          acento: '#F0A830',
          fondo: '#F5F4FC'
        },
        entregables: [
          'Dashboard de tendencias',
          'Fuentes de datos configurables',
          'Exportación de reportes'
        ]
      }
    ]
  }
];
