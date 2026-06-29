/** Proyectos segmentados bajo Sakura — cada uno con su identidad y entregables. */
window.SAKURA_PROYECTOS = {
  CASCO: {
    codigo: 'CASCO',
    nombre: 'Prototipo Casco',
    descripcion: 'Prototipo de casco — diseño, modelado y entregables visuales.',
    cliente: 'Sakura',
    carpeta: 'prototipo-casco',
    colores: {
      primario: '#C45C7A',
      secundario: '#E8A8B8',
      acento: '#F5D0DC',
      fondo: '#FDF4F6',
      texto: '#5A2A3A',
      textoClaro: '#FFFFFF'
    },
    entregables: [
      {
        id: 'concepto',
        titulo: 'Concepto inicial',
        estado: 'en-progreso',
        notas: 'Definir referencias, silueta y materiales del casco.'
      },
      {
        id: 'modelo-3d',
        titulo: 'Modelo 3D / wireframe',
        estado: 'pendiente',
        notas: 'Volumetría y proporciones del prototipo.'
      },
      {
        id: 'renders',
        titulo: 'Renders / vistas',
        estado: 'pendiente',
        notas: 'Vistas frontales, laterales y detalle de acabados.'
      }
    ],
    recursos: [
      { titulo: 'README del proyecto', ruta: 'prototipo-casco/README.md' },
      { titulo: 'Carpeta identidad', ruta: 'prototipo-casco/identidad/' }
    ]
  }
};
