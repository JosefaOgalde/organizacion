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
        descripcion: 'Cada tarjeta muestra vistas, engagement, crecimiento y resumen de receta listo para producir.'
      }
    ],
    brief: {
      titulo: 'Brief · Tendencias comida Chile',
      intro:
        'Herramienta interna de autogestión para detectar y consultar tendencias virales de comida y recetas en Chile. Está pensada como HTML simple sobre las plantillas del portal, con costo mínimo de mantenimiento y sin depender de APIs de redes sociales.',
      cuerpo: [
        {
          titulo: 'Qué hace',
          texto:
            'Al abrir el buscador se cargan tendencias curadas desde un feed JSON. Cada ítem muestra ingredientes, resumen de receta, KPIs estimados, hashtags completos y enlace a la fuente (noticia o medio chileno que reporta el viral). No hace falta buscar hashtags ni revisar red por red.'
        },
        {
          titulo: 'De dónde salen los datos',
          texto:
            'El input principal son noticias, blogs y medios chilenos que cubren virales de TikTok, Instagram, YouTube Shorts y Pinterest. Google Trends queda previsto como capa de descubrimiento para ampliar el feed. El archivo vive en data/tendencias-comida-chile.json y se actualiza con un script local.'
        },
        {
          titulo: 'Criterios del panel',
          texto:
            'Solo se listan tendencias con fecha de publicación verificable en la fuente enlazada. Los filtros de período y red social se aplican sobre esa fecha real, no sobre datos inventados. Vista en tarjetas o tabla, con caché local de 30 minutos.'
        },
        {
          titulo: 'Alcance y limitaciones',
          texto:
            'Es una herramienta de consulta y referencia para producción de contenido, no un monitor en tiempo real. Sin diseño elevado: reutiliza estilos del portal y prioriza claridad sobre pulido visual.'
        }
      ]
    }
  }
};
