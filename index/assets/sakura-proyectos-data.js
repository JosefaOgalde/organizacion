/** Proyectos segmentados bajo Sakura — cada uno con su identidad y entregables. */
window.SAKURA_PROYECTOS = {
  CASCO: {
    codigo: 'CASCO',
    nombre: 'Prototipo Casco',
    descripcion:
      'Casco modular anti-rascado para felina — barrera lisa en nuca/dorso, ranuras para orejas, anillo TPU en cuello.',
    cliente: 'Sakura',
    carpeta: 'prototipo-casco',
    fase: 1,
    principioDiseno:
      'Barrera abovedada de huella mínima: la pata resbala; no encapsular orejas (ranuras, no cavidades).',
    colores: {
      primario: '#C45C7A',
      secundario: '#E8A8B8',
      acento: '#F5D0DC',
      fondo: '#FDF4F6',
      texto: '#5A2A3A',
      textoClaro: '#FFFFFF'
    },
    medidas: {
      circunferenciaCraneal: '230 mm',
      circunferenciaCuello: '200 mm',
      largoCabeza: '120 mm',
      anchoCabeza: '100 mm',
      alturaCabeza: '60 mm',
      oreja: '70 mm largo · base 20 mm · separación bases 30 mm',
      zonaRascado: '30 mm detrás de base oreja',
      peso: '3,5 kg'
    },
    entregables: [
      {
        id: 'medidas',
        titulo: 'Medidas + réplica 3D',
        estado: 'en-progreso',
        notas: 'Medidas base registradas. Pendiente: fotos, video, validación ±2 mm.'
      },
      {
        id: 'mockup-digital',
        titulo: 'Mockup digital bóveda A+C',
        estado: 'pendiente',
        notas: 'Modelar sobre réplica; ranuras orejas; chequeo interferencias.'
      },
      {
        id: 'prototipo-impreso',
        titulo: 'Prototipo impreso (PLA → PETG+TPU)',
        estado: 'pendiente',
        notas: 'Tras validar digital y plantilla cartón 1:1.'
      }
    ],
    recursos: [
      { titulo: 'Análisis video', ruta: 'prototipo-casco/VIDEO-ANALISIS.md' },
      { titulo: 'Frames clave', ruta: 'prototipo-casco/referencias/video-2026-06-29/clave/' },
      { titulo: 'Medidas gatita', ruta: 'prototipo-casco/medidas-gatita.md' },
      { titulo: 'Parámetros CAD (JSON)', ruta: 'prototipo-casco/parametros-cad.json' },
      { titulo: 'Carpeta identidad', ruta: 'prototipo-casco/identidad/' }
    ]
  }
};
