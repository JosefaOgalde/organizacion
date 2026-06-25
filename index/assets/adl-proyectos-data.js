/** Proyectos segmentados bajo Desafío Latam (ADL) — cada uno con su identidad y reglas. */
window.ADL_PROYECTOS = {
  CLA: {
    codigo: 'CLA',
    nombre: 'Caja Los Andes',
    programa: 'Programa de Formación en Inteligencia Artificial',
    cliente: 'Desafío Latam',
    identidadPdf: 'CLA/identidad/manual-marca-caja-los-andes.pdf',
    identidadOrigen: 'screencapture-localhost-3002-2026-06-18-13_21_00.pdf',
    canvas: { ancho: 1123, alto: 794 },
    colores: {
      primario: '#051933',
      secundario: '#0066FF',
      acento: '#FFD200',
      fondo: '#FFFFFF',
      texto: '#051933',
      textoClaro: '#FFFFFF',
      teal: '#00A878'
    },
    fondoCertificado: 'CLA/identidad/fondo-certificado-1123x794.png',
    fases: [
      {
        id: 'fase-1',
        numero: 1,
        titulo: 'Webinars de exploración tecnológica',
        modalidad: 'sincrónico',
        horas: 16,
        certificados: [
          {
            id: 'f1-aprobacion',
            tipo: 'aprobacion',
            etiqueta: 'Certificado de aprobación',
            requisito: 'Asistencia ≥ 75%',
            validar: (d) => Number(d.asistencia) >= 75
          },
          {
            id: 'f1-participacion',
            tipo: 'participacion',
            etiqueta: 'Certificado de participación',
            requisito: 'Asistencia ≥ 50%',
            validar: (d) => Number(d.asistencia) >= 50
          }
        ]
      },
      {
        id: 'fase-2',
        numero: 2,
        titulo: 'Transformación Digital con IA y Automatización',
        modalidad: 'asincrónico',
        horas: 32,
        certificados: [
          {
            id: 'f2-aprobacion',
            tipo: 'aprobacion',
            etiqueta: 'Certificado de aprobación',
            requisito: 'Aprobar el módulo',
            validar: (d) => d.estado === 'aprobado'
          }
        ]
      },
      {
        id: 'fase-3',
        numero: 3,
        titulo: 'Especialización aplicada',
        modalidad: 'sincrónico',
        horas: 60,
        especializaciones: [
          'Automatización con IA',
          'Data Analytics',
          'IA para Productividad Diaria',
          'IA para Marketing y Ventas'
        ],
        certificados: [
          {
            id: 'f3-aprobacion',
            tipo: 'aprobacion',
            etiqueta: 'Certificado de aprobación',
            requisito: 'Nota ≥ 6,0 / 10,0',
            validar: (d) => Number(d.nota) >= 6
          }
        ]
      }
    ],
    certificadoFinal: {
      id: 'final',
      etiqueta: 'Certificado final del programa',
      requisito: '3 certificados de aprobación (Fase 1 + Fase 2 + Fase 3)',
      idsRequeridos: ['f1-aprobacion', 'f2-aprobacion', 'f3-aprobacion'],
      validar: (emitidos) => {
        const req = ['f1-aprobacion', 'f2-aprobacion', 'f3-aprobacion'];
        return req.every((id) => emitidos.includes(id));
      }
    }
  }
};
