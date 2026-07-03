/** Proyectos segmentados bajo Desafío Latam (ADL) — cada uno con su identidad y reglas. */
window.ADL_PROYECTOS = {
  CLA: {
    codigo: 'CLA',
    nombre: 'Caja Los Andes',
    programa:
      'Programa de Formación en Inteligencia Artificial y Productividad Digital',
    diplomasPdf: 'CLA/identidad/CLA-Diplomas.pdf',
    cliente: 'Desafío Latam',
    identidadPdf: 'CLA/identidad/manual-marca-caja-los-andes.pdf',
    identidadOrigen: 'screencapture-localhost-3002-2026-06-18-13_21_00.pdf',
    canvas: { ancho: 1123, alto: 794 },
    colores: {
      primario: '#007A3D',
      secundario: '#00A651',
      acento: '#F5B335',
      fondo: '#F7FAF8',
      texto: '#1A2E24',
      textoClaro: '#FFFFFF'
    },
    fases: [
      {
        id: 'fase-1',
        numero: 1,
        titulo: 'Exploración Tecnológica',
        modalidad: 'sincrónico',
        horas: 16,
        certificados: [
          {
            id: 'f1-aprobacion',
            tipo: 'aprobacion',
            etiqueta: 'Certificado de aprobación modular — Fase 1',
            requisito: 'Asistencia ≥ 75%',
            validar: (d) => Number(d.asistencia) >= 75,
            aprobado: true,
            plantilla: {
              tituloVisual: 'CERTIFICADO DE APROBACIÓN MODULAR',
              emisor: 'DESAFÍO LATAM Certifica que:',
              placeholderParticipante: ['NOMBRE', 'RUT'],
              parrafos: [
                'Ha cumplido exitosamente con los requisitos académicos y el 75% de asistencia obligatoria establecidos para el módulo "Fase 1: Exploración Tecnológica", parte del Programa de Formación en Inteligencia Artificial y Productividad Digital para afiliados de Caja Los Andes.',
                'Contenidos acreditados: Introducción a la inteligencia artificial, productividad con herramientas de IA, automatización de tareas repetitivas, análisis de datos básico, marketing digital y tendencias, y tecnologías emergentes.'
              ],
              duracion: '16 horas académicas',
              fechaEmisionFormato: '[Mes, Año]',
              firma: {
                nombre: 'Andrés Gallardo',
                cargo: 'Director General Desafío Latam'
              }
            }
          },
          {
            id: 'f1-participacion',
            tipo: 'participacion',
            etiqueta: 'Diploma de participación — Fase 1',
            requisito: 'Asistencia ≥ 50%',
            validar: (d) => Number(d.asistencia) >= 50,
            aprobado: true,
            plantilla: {
              tituloVisual: 'DIPLOMA DE PARTICIPACIÓN',
              emisor:
                'DESAFÍO LATAM concede la presente constancia de participación a:',
              placeholderParticipante: 'NOMBRE / RUT',
              parrafos: [
                'Por haber asistido al ciclo de webinars sincrónicos "Fase 1: Exploración Tecnológica", dictado en modalidad remota en el marco del Programa de Formación en Inteligencia Artificial y Productividad Digital desarrollado en convenio con Caja Los Andes.',
                'Se extiende el presente documento en reconocimiento a su asistencia e interés por actualizar sus competencias frente a las nuevas demandas del mercado tecnológico.'
              ],
              duracion: '16 horas académicas',
              fechaEmisionFormato: '[Mes, Año]',
              firma: {
                nombre: 'Andrés Gallardo',
                cargo: 'Director General Desafío Latam'
              }
            }
          }
        ]
      },
      {
        id: 'fase-2',
        numero: 2,
        titulo: 'Formación Base',
        modalidad: 'asincrónico',
        horas: 32,
        certificados: [
          {
            id: 'f2-participacion',
            tipo: 'participacion',
            etiqueta: 'Diploma de participación — Fase 2',
            requisito: 'Acceso a contenidos LMS',
            validar: () => true,
            aprobado: true,
            plantilla: {
              tituloVisual: 'DIPLOMA DE PARTICIPACIÓN',
              emisor:
                'DESAFÍO LATAM concede la presente constancia de participación a:',
              placeholderParticipante: ['NOMBRE', 'RUT'],
              parrafos: [
                'Por haber cursado la instancia asincrónica del módulo "Fase 2: Formación Base", accediendo a los contenidos interactivos dispuestos en nuestra plataforma virtual de aprendizaje (LMS) correspondientes al Programa de Formación en Inteligencia Artificial y Productividad Digital.'
              ],
              duracion: '32 horas de autoaprendizaje',
              fechaEmisionFormato: '[Mes, Año]',
              firma: {
                nombre: 'Andrés Gallardo',
                cargo: 'Director General Desafío Latam'
              }
            }
          },
          {
            id: 'f2-aprobacion',
            tipo: 'aprobacion',
            etiqueta: 'Certificado de aprobación modular — Fase 2',
            requisito: 'Aprobar el módulo',
            validar: (d) => d.estado === 'aprobado',
            aprobado: true,
            plantilla: {
              tituloVisual: 'CERTIFICADO DE APROBACIÓN MODULAR',
              emisor: 'DESAFÍO LATAM Certifica que:',
              placeholderParticipante: ['NOMBRE', 'RUT'],
              parrafos: [
                'Ha aprobado de forma sobresaliente las evaluaciones y contenidos obligatorios del cohorte asincrónico del módulo "Fase 2: Formación Base - Curso Transformación Digital con IA", dictado a través de nuestra plataforma LMS para el programa institucional de Caja Los Andes.',
                'Contenidos acreditados: Fundamentos de IA generativa, metodologías de transformación digital, uso de asistentes virtuales (ChatGPT, Claude) y optimización avanzada de flujos digitales individuales.'
              ],
              duracion: '32 horas académicas (asincrónicas)',
              fechaEmisionFormato: '[Mes, Año]',
              firma: {
                nombre: 'Andrés Gallardo',
                cargo: 'Director General Desafío Latam'
              }
            }
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
