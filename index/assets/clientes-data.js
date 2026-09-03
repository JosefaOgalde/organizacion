/** Datos del portal de clientes — Paso 1 (estático). Luego vendrá de Laravel + SQL. */
window.CLIENTES_PORTAL = [
  {
    archivo: 'trendseeker/index.html',
    id: 'cli-trendseeker',
    slug: 'trendseeker',
    slugAliases: ['ts'],
    nombre: 'Trendseeker - Talk',
    abrev: 'TS',
    tipo: 'Full time',
    color: { border: '#6B5FC7', bg: '#EDEAFA', text: '#2F2B5C' },
    agente: 'Community Manager + WordPress',
    resumen: 'Redes, Metricool, historias, banners y mantenimiento WordPress.',
    landing: {
      tagline: 'Confía en tu ritmo',
      entregables: ['12 publicaciones al mes', 'Informe Metricool', 'Historias en redes', 'Banners y WordPress'],
      secciones: [
        { titulo: 'Community Manager', texto: 'Publicaciones, historias y reportes mensuales en redes sociales.' },
        { titulo: 'Contenidos 7–12', texto: 'Cada pieza = Prompt Gemini video + Copys + Programar. Serie visible en la landing y en el organizador (vie AM/PM → lun → mié → vie → lun).' },
        { titulo: 'Prompts Gemini (producto / video)', texto: 'Siempre Gemini para marcas/productos TS (nunca Midjourney; eso es ECR). Ver trendseeker/prompts/.' },
        { titulo: 'Copys + video', texto: 'Copys en trendseeker/copys/. El MP4 se sube en la tarea (+ Subir video) y aparece en Registro Trendseeker.' },
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
    color: { border: '#0285E2', bg: '#E5F3FC', text: '#0A4A7A' },
    agente: 'Newsletter LinkedIn + Blog',
    resumen: 'Newsletters, copys, carruseles y secciones blog en Elementor.',
    landing: {
      tagline: 'Contenido que posiciona',
      entregables: ['2 newsletters al mes', 'Copys feed y carrusel', 'Artículos de blog', 'Secciones Elementor'],
      secciones: [
        { titulo: 'Newsletter LinkedIn', texto: 'Ecosistema NL 1 ago: madre + subtareas Copys (TXT), Portada, Carrusel y Video — visibles en landing y organizador (viernes).' },
        { titulo: 'Portada Midjourney', texto: 'Desde este perfil: PDF/título → 3 prompts por tema → Midjourney (solo fondo) → Canva (título/logo). Historial en newsletter/portadas-guardadas/. NL 1 ago: 4 fondos elegidos (NL-2026-08-01-fondos-elegidos.md).' },
        { titulo: 'Rutas de aprendizaje', texto: 'Finalizado — modal por sector con textos y links validados (HTML Elementor listo).' },
        { titulo: 'Blog', texto: 'Propuestas, maquetación y publicación en WordPress.' }
      ]
    }
  },
  {
    archivo: 'piscineria/index.html',
    id: 'cli-piscineria',
    slug: 'piscineria',
    slugAliases: ['pisc'],
    nombre: 'Piscinería - Talk',
    abrev: 'PISC',
    tipo: 'Full time',
    color: { border: '#0D9B6C', bg: '#E0F6EC', text: '#0F5A40' },
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
    slugAliases: ['hs'],
    nombre: 'Hotspring - Talk',
    abrev: 'HS',
    tipo: 'Full time',
    color: { border: '#1F8F7A', bg: '#DFF3EE', text: '#145548' },
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
    color: { border: '#1A8F98', bg: '#DCF4F6', text: '#0F555C' },
    agente: 'Planificación de proyectos',
    resumen: 'Gantt, cronogramas y entregables post auditoría.',
    landing: {
      tagline: 'Orden en cada entrega',
      entregables: ['Gantt de proyectos', 'Cronogramas por fase', 'Seguimiento post-auditoría'],
      secciones: [
        { titulo: 'Planificación', texto: 'Diagramas de tiempo y dependencias entre hitos.' },
        { titulo: 'Entregables', texto: 'Control de avance y fechas comprometidas con el cliente.' }
      ]
    },
    proyectos: [
      {
        codigo: 'MOVA',
        nombre: 'Auditoría Charlas',
        archivo: 'MKOF/MOVA',
        resumen: 'MOVA-Auditoria-Charlas — revisión de charlas, hallazgos e informes.',
        color: { border: '#7A5AA8', bg: '#F0EAF7', text: '#3D2A58' },
        identidad: {
          primario: '#7A5AA8',
          secundario: '#5A4080',
          acento: '#B898D8',
          fondo: '#F0EAF7'
        },
        entregables: [
          'Criterios y rúbrica de auditoría',
          'Charlas revisadas',
          'Informe de hallazgos'
        ]
      },
      {
        codigo: 'WEB',
        nombre: 'Sitio web',
        archivo: 'mkof/sitio-web',
        resumen: 'Trabajo del sitio web Making Of — briefs, alcance y entregables web.',
        color: { border: '#1A8F98', bg: '#DCF4F6', text: '#0F555C' },
        identidad: {
          primario: '#1A8F98',
          secundario: '#0F555C',
          acento: '#3DB8C1',
          fondo: '#DCF4F6'
        },
        entregables: [
          'Brief y alcance',
          'Referencias / wireframes',
          'Entregables de implementación'
        ]
      }
    ]
  },
  {
    archivo: 'joyasmercury/index.html?v=secciones3',
    id: 'cli-joyas-mercury',
    slug: 'joyasmercury',
    slugAliases: ['jm', 'joyas-mercury'],
    nombre: 'Joyas Mercury',
    abrev: 'JM',
    tipo: 'Freelance',
    /** Etapa 2 entregada — portal: gris / sección inactivos */
    activo: false,
    color: { border: '#C45A7A', bg: '#F8E8EE', text: '#6E2A40' },
    agente: 'Dev WooCommerce Fase 2',
    resumen: 'Rediseño joyasmercury.cl — menú, filtros, carrito, entrega. Etapa 2 cerrada.',
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
    color: { border: '#5A6674', bg: '#E8EBEE', text: '#2A323C' },
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
    slugAliases: ['adl'],
    nombre: 'Desafío Latam',
    abrev: 'ADL',
    tipo: 'Freelance',
    color: { border: '#D4893A', bg: '#F7EBDD', text: '#6B3E14' },
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
      },
      {
        codigo: 'CChC',
        nombre: 'CChC · Alfabetización Digital',
        archivo: 'DesafioLatam/CChC-Alfabetizacion/reporte-impacto/index.html',
        resumen: 'Reporte de impacto piloto 2026 — presentación 15 slides, Antofagasta.',
        color: { border: '#729E2E', bg: '#f5f9f0', text: '#0F2E81' },
        identidad: {
          primario: '#729E2E',
          secundario: '#0F2E81',
          acento: '#FFCD56',
          fondo: '#FFFFFF'
        },
        entregables: [
          'Presentación 15 slides',
          'Prompts por slide',
          'Identidad ADL oficial'
        ]
      },
      {
        codigo: 'FF',
        nombre: 'Formación para Facilitadores',
        archivo: 'DesafioLatam/formacion-facilitadores',
        resumen: 'Certificado de aprobación 1123×794 px para emisión en LMS Empieza / Proyecto.',
        color: { border: '#0F2E81', bg: '#f5f7fb', text: '#0F2E81' },
        identidad: {
          primario: '#729E2E',
          secundario: '#0F2E81',
          acento: '#FFCD56',
          fondo: '#FFFFFF'
        },
        entregables: [
          'Plantilla horizontal',
          'Fondo LMS sin campos variables',
          'Zonas para nombre, formación, fecha e ID'
        ]
      }
    ]
  },
  {
    archivo: 'impresoreando/index.html',
    id: 'cli-impresoreando',
    slug: 'impresoreando',
    slugAliases: ['imp'],
    nombre: 'Impresoreando',
    abrev: 'IMP',
    tipo: 'Freelance',
    color: { border: '#C4922A', bg: '#F6EFDC', text: '#5A4014' },
    agente: 'Impresión 3D + ecommerce',
    resumen: 'Emprendimiento 3D (@impresoreando). Panel socios 50/50: gastos, ventas, luz, costos de producto y plan paid.',
    landing: {
      tagline: 'Ideas que se imprimen',
      entregables: ['Panel financiero 50/50', 'Costos de producción', 'Catálogo IG 1080×1350', 'Plan paid bajo presupuesto'],
      secciones: [
        { titulo: 'Panel socios', texto: 'Gastos, ventas, operación y bitácora compartida entre Josefa y Nicolás (50/50).' },
        { titulo: 'Producción', texto: 'Filamento, horas de impresión, pintado, metal de llaveros y bolsas.' },
        {
          titulo: 'Catálogo Instagram',
          texto: 'Carrusel 1080×1350: portada con logo, 10 productos (nombre + SKU + imagen referencial) y cierre “pide los tuyos” con @impresoreando. Todo es a pedido. Descargar PDF: catalogo/export/catalogo-impresoreando.pdf · ver catalogo/.',
        },
      ]
    }
  },
  {
    archivo: 'tronwell/index.html',
    id: 'cli-tronwell',
    slug: 'tronwell',
    slugAliases: ['tw'],
    nombre: 'Tronwell',
    abrev: 'TW',
    tipo: 'Freelance',
    color: { border: '#1E5AA8', bg: '#D6E5F6', text: '#143A6B' },
    agente: 'Ajuste de textos',
    resumen: 'Revisión y ajuste de documentos (Word) por encargo.',
    landing: {
      tagline: 'Textos claros, listos para publicar',
      entregables: ['Ajuste de textos', 'Revisión por documento', 'Entrega Word'],
      secciones: [
        {
          titulo: 'Ajustar textos (19 jul)',
          texto: 'Madre + subtareas: Contacto.docx (✓) · curso adultos.docx (✓) · Home.docx (✓) · tutor ia.docx.'
        }
      ]
    }
  },
  {
    archivo: 'herramientas/index.html',
    id: 'cli-herramientas',
    slug: 'herramientas',
    slugAliases: ['her'],
    nombre: 'Herramientas',
    abrev: 'HER',
    tipo: 'Freelance',
    color: { border: '#3D4A6B', bg: '#E2E6F0', text: '#1E2638' },
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
        resumen: 'Tendencias virales de recetas Chile — TikTok, Instagram y YouTube Shorts.',
        descripcion: 'Análisis de tendencias virales de recetas en Chile para apoyar decisiones de contenido y producto.',
        color: { border: '#2E7D6E', bg: '#DFF0EC', text: '#1A4A40' },
        identidad: {
          primario: '#2E7D6E',
          secundario: '#3D9A88',
          acento: '#C4962A',
          fondo: '#DFF0EC'
        },
        entregables: [
          'Dashboard de tendencias',
          'Fuentes de datos configurables',
          'Exportación de reportes'
        ]
      },
      {
        codigo: 'CRC',
        nombre: 'Carga recetas Cencosud',
        archivo: 'Herramientas/Carga-recetas',
        resumen: 'Word → Business Manager → publicar (automatización interna).',
        descripcion: 'Parsea el Word de recetas, completa la ficha y publica en Business Manager Cencosud sin cambiar el flujo del cliente.',
        color: { border: '#3D4A6B', bg: '#E2E6F0', text: '#1E2638' },
        identidad: {
          primario: '#3D4A6B',
          secundario: '#5A6A8A',
          acento: '#C4962A',
          fondo: '#EEF1F7'
        },
        entregables: [
          'Parser Word → JSON',
          'Mapa de campos BM',
          'Publicación asistida / automática'
        ]
      }
    ]
  }
];
