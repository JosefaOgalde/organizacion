/**
 * MOVA · Post-auditoría · Carta Gantt comprimida a 3 semanas (15 días hábiles).
 * Día 1 = 30 jun 2026. Basado en playbook cliente acme-chile.cl/documentos/auditoria_mova.html
 */
window.MKOF_MOVA_GANTT = {
  version: '1.0',
  inicio: '2026-06-30',
  fin: '2026-07-18',
  diasHabiles: 15,
  referencias: {
    entregado: 'Auditoría MOVA - Presentación Final.pdf',
    respuestaCliente: 'https://acme-chile.cl/documentos/auditoria_mova.html'
  },
  veredicto: [
    { propuesta: 'Respaldo n8n → Git', veredicto: 'Correcto', prioridad: 'Inmediato', incluido: true },
    { propuesta: 'Login unificado mova_auth', veredicto: 'Lo más valioso', prioridad: 'Alta', incluido: true },
    { propuesta: 'MySQL como fuente', veredicto: 'Válido, no urgente', prioridad: 'Media', incluido: true },
    { propuesta: 'Migrar de GoDaddy ya', veredicto: 'Sobredimensionado', prioridad: 'Diferir', incluido: false },
    { propuesta: 'VPS / cloud (~12 meses)', veredicto: 'Salto real', prioridad: 'Diferir', incluido: false }
  ],
  fases: [
    {
      id: 1,
      codigo: '1.1',
      nombre: 'Respaldo n8n → GitHub',
      fase: 'Fase 0 · Quick wins',
      dias: 2,
      inicio: 0,
      fechaInicio: '2026-06-30',
      fechaFin: '2026-07-01',
      entregable: 'Repo privado mova-n8n-workflows + backup semanal automatizado',
      tareas: [
        'Crear repo privado mova-n8n-workflows',
        'Exportar workflows activos a JSON (manual, primera vez)',
        'Workflow n8n: export vía API + commit semanal'
      ]
    },
    {
      id: 2,
      codigo: '1.2',
      nombre: 'Cloudflare delante de GoDaddy',
      fase: 'Fase 0 · Quick wins',
      dias: 3,
      inicio: 1,
      fechaInicio: '2026-07-01',
      fechaFin: '2026-07-03',
      entregable: 'DNS en Cloudflare, SSL Full, WAF básico y reglas anti-bot',
      tareas: [
        'Agregar dominios y apuntar nameservers',
        'Activar SSL Full (strict)',
        'WAF básico + reglas anti-bot'
      ]
    },
    {
      id: 3,
      codigo: '2.1',
      nombre: 'Centralizar mova_auth',
      fase: 'Fase 1 · Login unificado',
      dias: 5,
      inicio: 2,
      fechaInicio: '2026-07-02',
      fechaFin: '2026-07-08',
      entregable: 'mova_auth como único validador de sesión para todos los módulos',
      tareas: [
        'Definir mova_auth como validador único',
        'Login único → token de sesión propio',
        'Cada módulo consulta mova_auth (no permisos parciales)'
      ]
    },
    {
      id: 4,
      codigo: '2.2',
      nombre: 'Sesión server-side',
      fase: 'Fase 1 · Login unificado',
      dias: 4,
      inicio: 5,
      fechaInicio: '2026-07-07',
      fechaFin: '2026-07-10',
      entregable: 'Cookie httpOnly + Secure emitida por PHP; sin JWT en localStorage',
      tareas: [
        'Emitir cookie httpOnly + Secure desde PHP (GoDaddy)',
        'Retirar JWT del localStorage en cliente',
        'Validar sesión en cada módulo vía mova_auth'
      ]
    },
    {
      id: 5,
      codigo: '3.1',
      nombre: 'Modelar mova_datos (MySQL)',
      fase: 'Fase 2 · Capa de datos',
      dias: 3,
      inicio: 7,
      fechaInicio: '2026-07-09',
      fechaFin: '2026-07-11',
      entregable: 'Esquema MySQL desde INGRESOS/EGRESOS de MOVA MAESTRO + whitelist IP',
      tareas: [
        'Diseñar tablas, relaciones y llaves',
        'Provisionar MySQL gestionada (cloud)',
        'Definir whitelist de IP para acceso'
      ]
    },
    {
      id: 6,
      codigo: '3.2',
      nombre: 'MySQL fuente → Sheets vista',
      fase: 'Fase 2 · Capa de datos',
      dias: 4,
      inicio: 8,
      fechaInicio: '2026-07-10',
      fechaFin: '2026-07-15',
      entregable: 'n8n escribe primero a MySQL y replica a Google Sheets',
      tareas: [
        'Nodo MySQL en n8n como fuente primaria',
        'Replicar a Sheets como vista de lectura',
        'Probar concurrencia e historial de cambios'
      ]
    },
    {
      id: 7,
      codigo: '4.0',
      nombre: 'Rutinas de operación',
      fase: 'Fase 3 · Operación',
      dias: 4,
      inicio: 11,
      fechaInicio: '2026-07-15',
      fechaFin: '2026-07-18',
      entregable: 'Checklist operativo documentado y primera ronda ejecutada',
      tareas: [
        'Diario: revisar ejecuciones n8n + alertas servidor',
        'Semanal: validar backups MySQL + Git + pruebas sandbox',
        'Mensual: vigencia SSL/DNS + reporte de incidencias (plantilla)'
      ]
    }
  ],
  excluido: [
    {
      accion: 'Migración a IONOS / Bluehost (shared hosting)',
      motivo: 'Movimiento lateral; Cloudflare tapa el hueco de seguridad sin migrar dos veces'
    },
    {
      accion: 'Migración a VPS / cloud',
      motivo: 'Proyecto a ~12 meses; una sola migración cuando el servidor real esté listo'
    }
  ],
  semanas: [
    {
      num: 1,
      label: 'Semana 1',
      dias: '30 jun – 4 jul',
      foco: 'Quick wins: respaldo n8n + Cloudflare. Arranque mova_auth.'
    },
    {
      num: 2,
      label: 'Semana 2',
      dias: '7 – 11 jul',
      foco: 'Login unificado completo + sesión server-side. Inicio modelado MySQL.'
    },
    {
      num: 3,
      label: 'Semana 3',
      dias: '14 – 18 jul',
      foco: 'Capa de datos MySQL→Sheets + arranque rutinas de operación.'
    }
  ]
};
