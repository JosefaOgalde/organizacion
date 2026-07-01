/** Proyectos segmentados bajo Herramientas (HER) — cada uno con su identidad y reglas. */
window.HERRAMIENTAS_PROYECTOS = {
  TEND: {
    codigo: 'TEND',
    nombre: 'Tendencias',
    descripcion: 'Tendencias virales de comida y recetas en Chile — carga automática al entrar',
    cliente: 'Herramientas',
    identidadPdf: 'tendencias/identidad/manual-marca-tendencias.pdf',
    colores: {
      primario: '#2E7D6E',
      secundario: '#3D9A88',
      acento: '#C4962A',
      fondo: '#DFF0EC',
      texto: '#1A4A40',
      textoClaro: '#FFFFFF'
    },
    feed: {
      url: '../../../data/tendencias-comida-chile.json',
      nicho: 'recetas-comida-chile',
      plataformas: ['tiktok', 'instagram', 'youtube', 'pinterest'],
      cacheMinutos: 30,
      autoCargar: true
    },
    secciones: [
      {
        id: 'auto',
        titulo: 'Carga automática',
        descripcion: 'Al abrir Tendencias.html se proponen formatos virales sin buscar hashtags ni revisar red por red.'
      },
      {
        id: 'fuentes',
        titulo: 'Redes monitoreadas',
        descripcion: 'TikTok, Instagram (Reels), YouTube Shorts y Pinterest — filtro por fecha de la fuente.'
      },
      {
        id: 'kpis',
        titulo: 'KPIs y señal',
        descripcion: 'Cada tarjeta muestra vistas, engagement, crecimiento y ángulo de contenido listo para producir.'
      }
    ]
  }
};
