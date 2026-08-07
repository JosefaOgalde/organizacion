/** Proyectos segmentados bajo Herramientas (HER) — cada uno con su identidad y reglas. */
window.HERRAMIENTAS_PROYECTOS = {
  TEND: {
    codigo: 'TEND',
    nombre: 'Tendencias',
    descripcion: 'Tendencias virales de recetas en Chile — carga automática al entrar',
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
      titulo: 'Brief · Tendencias recetas Chile',
      intro:
        'Herramienta interna de autogestión para detectar y consultar tendencias virales de recetas en Chile. Está pensada como HTML simple sobre las plantillas del portal, con costo mínimo de mantenimiento y sin depender de APIs de redes sociales.',
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
  },
  CRC: {
    codigo: 'CRC',
    nombre: 'Carga recetas Cencosud',
    descripcion: 'Word → completar ficha → Business Manager → publicar (operación interna)',
    cliente: 'Herramientas',
    colores: {
      primario: '#3D4A6B',
      secundario: '#5A6A8A',
      acento: '#C4962A',
      fondo: '#EEF1F7',
      texto: '#1E2638',
      textoClaro: '#FFFFFF'
    },
    destino: {
      url: 'https://business-manager.ecomm.cencosud.com/',
      banderaPublica: 'https://www.jumbo.cl/recetas',
      carpeta: 'index/clientes/Herramientas/carga-recetas-cencosud/'
    },
    secciones: [
      {
        id: 'inbox',
        titulo: 'Inbox Word',
        descripcion: 'Dejas el .docx en inbox/. El cliente no envía ni usa el BM.'
      },
      {
        id: 'parse',
        titulo: 'Parser',
        descripcion: 'python3 scripts/parse-receta-word.py → JSON en out/ según schema-receta.json'
      },
      {
        id: 'publicar',
        titulo: 'Publicar',
        descripcion: 'Playwright contra BM cuando el mapa de selectores esté completo (secrets/.env local).'
      }
    ],
    brief: {
      titulo: 'Brief · Carga recetas Cencosud',
      intro:
        'Automatización interna: tú tienes el Word y los accesos ADFS. El agente completa la información de la interfaz y publica sin pedirle cambios al cliente.',
      cuerpo: [
        {
          titulo: 'Qué hace',
          texto:
            'Extrae título, descripción, tiempos, ingredientes y pasos del Word; genera un JSON listo; (fase 2) rellena Business Manager y publica.'
        },
        {
          titulo: 'Qué no hace',
          texto:
            'No pide al cliente que use otra plantilla ni que entre al BM. Credenciales nunca van a Git.'
        }
      ]
    }
  }
};
