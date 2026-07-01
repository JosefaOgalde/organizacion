/** Proyectos segmentados bajo Herramientas (HER) — cada uno con su identidad y reglas. */
window.HERRAMIENTAS_PROYECTOS = {
  TEND: {
    codigo: 'TEND',
    nombre: 'Tendencias',
    descripcion: 'Herramientas de análisis y seguimiento de tendencias',
    cliente: 'Herramientas',
    identidadPdf: 'tendencias/identidad/manual-marca-tendencias.pdf',
    colores: {
      primario: '#5B4FCF',
      secundario: '#7B6FE8',
      acento: '#F0A830',
      fondo: '#F5F4FC',
      texto: '#2A2548',
      textoClaro: '#FFFFFF'
    },
    secciones: [
      {
        id: 'resumen',
        titulo: 'Resumen',
        descripcion: 'Seguimiento y análisis de tendencias del mercado y la industria.'
      },
      {
        id: 'fuentes',
        titulo: 'Fuentes de datos',
        descripcion: 'Define las fuentes, APIs y canales de información a monitorear.'
      },
      {
        id: 'entregables',
        titulo: 'Entregables',
        descripcion: 'Reportes, dashboards, alertas y resúmenes periódicos.'
      }
    ]
  }
};
