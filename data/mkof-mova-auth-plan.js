/**
 * MOVA · Login unificado mova_auth — plan 7 días hábiles.
 * Sitio cliente: https://acme-chile.cl/ · Playbook: acme-chile.cl/documentos/auditoria_mova.html
 * Inicio: 6 jul 2026 (día 1 = hoy al publicar).
 */
window.MOVA_AUTH_CALENDARIO_INICIO = '2026-07-06';
window.MOVA_AUTH_PLAN_VERSION = '2.0';
window.MOVA_AUTH_SITIO = 'https://acme-chile.cl/';
window.MOVA_AUTH_CLI_SYNC_ID = 'cli-mkof';

window.MOVA_AUTH_TODO_SEED = [
  {
    id: 'mova-auth-d1',
    dia: 1,
    fase: 'A',
    titulo: 'Inventario módulos M (acme-chile.cl)',
    notas: 'Día 1 · Sin tocar código. cPanel → public_html. Tabla: Módulo | URL | Cómo valida | ¿JWT/localStorage? | ¿n8n? | Responsable. Marcar en rojo lo que no pase por mova_auth.',
    entregable: 'Hoja «Inventario-MOVA-modulos» (Sheets o .md) con todas las URLs bajo acme-chile.cl',
    checklist: [
      'Acceso cPanel / FTP del hosting GoDaddy confirmado',
      'Listado de carpetas en public_html (MAESTRO, INGRESOS, EGRESOS, etc.)',
      'URL completa de cada módulo anotada',
      'Flujo actual documentado por módulo (Google / mova_auth / otro)',
      'JWT o localStorage identificados donde existan',
      'Endpoints n8n usados listados',
      'Tabla compartida con el equipo técnico'
    ],
    enlaces: [
      'https://acme-chile.cl/',
      'https://acme-chile.cl/mova/',
      'https://acme-chile.cl/documentos/auditoria_mova.html',
      'index/clientes/mkof/mova-auth-guia.html',
      'index/clientes/mkof/Inventario-MOVA-modulos.md'
    ],
    inventario: 'index/clientes/mkof/Inventario-MOVA-modulos.md'
  },
  {
    id: 'mova-auth-d2',
    dia: 2,
    fase: 'B',
    titulo: 'Acuerdo + diseño mova_auth',
    notas: 'Día 2 · Regla escrita: ningún módulo valida solo. Lista de 6 archivos PHP: config, session, login, validate, guard, logout. Definir URL base /mova_auth/.',
    entregable: 'Documento «Reglas-mova_auth» + lista de archivos a crear',
    checklist: [
      'Regla «único validador» acordada con el equipo',
      'Diagrama flujo objetivo revisado (guía MOVA)',
      'Lista de archivos PHP confirmada',
      'Módulo sandbox elegido para primera migración (día 5)'
    ]
  },
  {
    id: 'mova-auth-d3',
    dia: 3,
    fase: 'B',
    titulo: 'Crear carpeta y archivos núcleo en GoDaddy',
    notas: 'Día 3 · public_html/mova_auth/ · Subir config.php (secretos), session.php, login.php, validate.php, guard.php, logout.php. Permisos 755. Probar que login.php abre.',
    entregable: 'Carpeta mova_auth en servidor con 6 archivos PHP',
    checklist: [
      'Carpeta mova_auth creada',
      'config.php fuera de repos públicos',
      'login.php responde en HTTPS',
      'guard.php listo para incluir en módulos'
    ]
  },
  {
    id: 'mova-auth-d4',
    dia: 4,
    fase: 'C',
    titulo: 'Login único + cookie httpOnly',
    notas: 'Día 4 · login.php con sesión PHP (Google opcional vía tokeninfo + whitelist). Cookie Secure + HttpOnly. Sin JWT en localStorage.',
    entregable: 'Login funcional con redirect al módulo pedido',
    checklist: [
      'Login entra con usuario de prueba',
      'Redirect ?redirect= funciona',
      'Cookie HttpOnly visible en DevTools',
      'localStorage sin tokens'
    ]
  },
  {
    id: 'mova-auth-d5',
    dia: 5,
    fase: 'C',
    titulo: 'validate.php + migrar módulo sandbox',
    notas: 'Día 5 · validate.php JSON (200/401). Primer módulo con require guard.php al inicio. fetch con credentials: include en AJAX.',
    entregable: 'Un módulo M migrado y probado en sandbox',
    checklist: [
      'validate.php responde 200 con sesión',
      'validate.php responde 401 sin sesión',
      'Módulo sandbox con guard.php',
      'Prueba manual OK en ese módulo'
    ]
  },
  {
    id: 'mova-auth-d6',
    dia: 6,
    fase: 'C',
    titulo: 'Migrar resto de módulos + quitar JWT',
    notas: 'Día 6 · Un módulo a la vez. Eliminar validación duplicada. Buscar y borrar localStorage JWT en todos los M.',
    entregable: 'Todos los módulos M usan guard.php · localStorage limpio',
    checklist: [
      'Cada módulo del inventario migrado',
      'Validación vieja eliminada por módulo',
      'localStorage sin JWT en ningún módulo',
      'Sin bucles de redirect infinito'
    ]
  },
  {
    id: 'mova-auth-d7',
    dia: 7,
    fase: 'D',
    titulo: 'Pruebas finales + cierre hitos 2.1 y 2.2',
    notas: 'Día 7 · Por módulo: sin login→redirect, con login→entra, logout, incógnito. Actualizar ficha MOVA y Gantt.',
    entregable: 'mova_auth operativo · documentación en ficha MOVA',
    checklist: [
      '4 pruebas OK por cada módulo M',
      'Logout funciona en todos',
      'Ficha MOVA actualizada (URL login, config, cPanel)',
      'Hitos 2.1 y 2.2 marcados cerrados en Gantt'
    ]
  }
];

window.movaAuthTituloCalendario = function (todo) {
  return `[MOVA] D${todo.dia} — ${todo.titulo}`;
};

window.movaAuthTareaCalendarioId = function (indice) {
  return `tarea-mova-auth-${String(indice + 1).padStart(2, '0')}`;
};

/** Día 1 — referencia rápida para el encargado */
window.MOVA_AUTH_DIA_1 = window.MOVA_AUTH_TODO_SEED[0];
