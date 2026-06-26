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
      primario: '#0A1E46',
      secundario: '#0066FF',
      acento: '#FFD200',
      fondo: '#FFFFFF',
      texto: '#0A1E46',
      textoClaro: '#FFFFFF',
      teal: '#00A878'
    },
    firmas: {
      cla: { nombre: 'Catalina Araya', cargo: 'Directora Centro de Educación y Habilidades para el Futuro' },
      dl: { nombre: 'Andrés Gallardo', cargo: 'Director General Desafío Latam' }
    },
    textosDiploma: {
      encabezado: 'Se certifica a',
      f1Participacion: 'ha participado en la Fase 1: Webinars de exploración tecnológica, del Programa de Formación en Inteligencia Artificial de Caja Los Andes, con una asistencia de {asistencia}%, cumpliendo el requisito mínimo del 50%.',
      f1Aprobacion: 'ha aprobado la Fase 1: Webinars de exploración tecnológica, del Programa de Formación en Inteligencia Artificial de Caja Los Andes, con una asistencia de {asistencia}%, cumpliendo el requisito mínimo del 75%.',
      f2Aprobacion: 'ha aprobado la Fase 2: Transformación Digital con IA y Automatización, del Programa de Formación en Inteligencia Artificial de Caja Los Andes, completando satisfactoriamente el módulo asincrónico de 32 horas.',
      f3Aprobacion: 'ha aprobado la Fase 3: Especialización aplicada en {especializacion}, del Programa de Formación en Inteligencia Artificial de Caja Los Andes, con una calificación de {nota}/10, cumpliendo el requisito mínimo de 6,0.',
      final: 'ha completado y aprobado las tres fases del Programa de Formación en Inteligencia Artificial de Caja Los Andes, obteniendo el Certificado Final del programa.'
    },
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
            etiqueta: 'Diploma de aprobación',
            tituloDiploma: 'DIPLOMA DE APROBACIÓN',
            requisito: 'Asistencia ≥ 75%',
            validar: (d) => Number(d.asistencia) >= 75
          },
          {
            id: 'f1-participacion',
            tipo: 'participacion',
            etiqueta: 'Diploma de participación',
            tituloDiploma: 'DIPLOMA DE PARTICIPACIÓN',
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
            etiqueta: 'Diploma de aprobación',
            tituloDiploma: 'DIPLOMA DE APROBACIÓN',
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
            etiqueta: 'Diploma de aprobación',
            tituloDiploma: 'DIPLOMA DE APROBACIÓN',
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
