/**
 * MOVA · Login unificado mova_auth — plan auditoría (sin tocar código en servidor).
 * Sitio: https://acme-chile.cl/
 * Fase actual: documentar reglas, diseño y validación antes de implementar.
 */
window.MOVA_AUTH_CALENDARIO_INICIO = '2026-07-06';
window.MOVA_AUTH_PLAN_VERSION = '3.0-auditoria';
window.MOVA_AUTH_SITIO = 'https://acme-chile.cl/';
window.MOVA_AUTH_CLI_SYNC_ID = 'cli-mkof';
window.MOVA_AUTH_SOLO_AUDITORIA = true;

window.MOVA_AUTH_TODO_SEED = [
  {
    id: 'mova-auth-d1',
    dia: 1,
    fecha: '2026-07-06',
    fase: 'A',
    titulo: 'Inventario módulos M',
    notas: 'Auditoría · Sin tocar código. cPanel + navegador en acme-chile.cl. Documentar auth fragmentada, localStorage y estructura.',
    entregable: 'MOVA-D1-Inventario-Status (PPT/PDF) + Inventario-MOVA-modulos.md',
    checklist: [
      'Acceso cPanel / FTP GoDaddy confirmado',
      'Árbol public_html/acme-chile.cl/ documentado',
      'Tabla módulos M con URL, auth, localStorage, mova_auth',
      'localStorage revisado en /mova/ (axon_chats)',
      'n8n delegado al equipo correspondiente',
      'Status compartido con equipo técnico',
      'Tarea mkof/01 marcada completada'
    ],
    enlaces: [
      'https://acme-chile.cl/',
      'https://acme-chile.cl/mova/',
      'index/clientes/MKOF/MOVA/documentos/ver.html?id=d1-inventario-status',
      'index/clientes/mkof/Inventario-MOVA-modulos.md'
    ],
    inventario: 'index/clientes/mkof/Inventario-MOVA-modulos.md',
    inventarioTxt: 'index/clientes/mkof/Inventario-MOVA-modulos.txt'
  },
  {
    id: 'mova-auth-d2',
    dia: 2,
    fecha: '2026-07-08',
    fase: 'B',
    titulo: 'Reglas mova_auth',
    notas: 'Auditoría · Sin tocar código. Redactar y acordar la regla: si no pasó por mova_auth, no entra. Definir excepciones, roles y módulos públicos.',
    entregable: 'Documento «Reglas-mova_auth» (borrador acordado con el equipo)',
    checklist: [
      'Regla «único validador» escrita en lenguaje claro',
      'Lista de módulos que deben pasar por mova_auth',
      'Módulos públicos o excepciones documentados (ej. /documentos/)',
      'Acuerdo del equipo técnico (correo, acta o comentario en ficha)',
      'Sin cambios en servidor — solo documentación'
    ],
    enlaces: [
      'https://acme-chile.cl/documentos/auditoria_mova.html',
      'index/clientes/mkof/mova-auth-guia.html',
      'index/clientes/mkof/Inventario-MOVA-modulos.md',
      'index/clientes/mkof/Reglas-mova_auth.md',
      'index/clientes/MKOF/MOVA/documentos/ver.html?id=d2-reglas-mova-auth'
    ],
    reglas: 'index/clientes/mkof/Reglas-mova_auth.md'
  },
  {
    id: 'mova-auth-d3',
    dia: 3,
    fecha: '2026-07-09',
    fase: 'B',
    titulo: 'Carpetas y archivos núcleo',
    notas: 'Auditoría · Sin tocar código. Definir qué debe existir en public_html/mova_auth/: carpeta, 6 archivos PHP núcleo (config, session, login, validate, guard, logout) y permisos esperados.',
    entregable: 'Mapa mova_auth/ + lista de archivos núcleo con responsabilidad de cada uno',
    checklist: [
      'Ruta base acordada: /mova_auth/ bajo acme-chile.cl',
      '6 archivos PHP núcleo listados y descritos (sin subirlos aún)',
      'Dónde van secretos (config) vs archivos públicos',
      'Permisos esperados documentados (755 carpetas, etc.)',
      'Comparado con lo que ya existe en cPanel (gap analysis)'
    ],
    enlaces: [
      'index/clientes/mkof/mova-auth-guia.html',
      'index/clientes/mkof/Inventario-MOVA-modulos.md'
    ]
  },
  {
    id: 'mova-auth-d4',
    dia: 4,
    fecha: '2026-07-11',
    fase: 'C',
    titulo: 'Login único + cookie',
    notas: 'Auditoría · Sin tocar código. Diseñar flujo objetivo: un solo login, sesión PHP server-side, cookie Secure + HttpOnly, sin JWT en localStorage. Incluir redirect ?redirect=.',
    entregable: 'Diagrama de flujo login único + especificación de cookie y sesión',
    checklist: [
      'Flujo dibujado: usuario → mova_auth → módulo destino',
      'Cookie HttpOnly + Secure documentada (nombre, duración, dominio)',
      'Confirmado: sin jwt/token en localStorage del cliente',
      'Google OAuth (si aplica) integrado en el diseño sin fragmentar',
      'Casos de prueba escritos (logueado / sin sesión / logout)'
    ],
    enlaces: [
      'index/clientes/mkof/guia-mova-auth/diagramas.html',
      'index/clientes/mkof/mova-auth-guia.html'
    ]
  },
  {
    id: 'mova-auth-d5',
    dia: 5,
    fecha: '2026-07-14',
    fase: 'C',
    titulo: 'Validación por módulo',
    notas: 'Auditoría · Sin tocar código. Definir cómo debería validar cada módulo M: guard.php al inicio, validate.php JSON 200/401, fetch con credentials:include.',
    entregable: 'Matriz «cómo debería validar» por módulo del inventario',
    checklist: [
      'Por cada módulo M: ¿quién valida hoy vs quién debería validar?',
      'Especificación validate.php (respuestas 200 / 401)',
      'Especificación guard.php (redirect si no hay sesión)',
      'Módulo sandbox sugerido para primera migración futura',
      'Criterios de cierre de auditoría fase B–C documentados'
    ],
    enlaces: [
      'index/clientes/mkof/Inventario-MOVA-modulos.md',
      'index/clientes/mkof/mova-auth-guia.html'
    ]
  }
];

window.movaAuthTituloCalendario = function (todo) {
  const aud = window.MOVA_AUTH_SOLO_AUDITORIA ? ' · auditoría' : '';
  return `[MOVA] D${todo.dia} — ${todo.titulo}${aud}`;
};

window.movaAuthTareaCalendarioId = function (indice) {
  return `tarea-mova-auth-${String(indice + 1).padStart(2, '0')}`;
};

window.movaAuthFechaCalendario = function (todo, indice) {
  if (todo.fecha) return todo.fecha;
  const inicio = window.MOVA_AUTH_CALENDARIO_INICIO || '2026-07-06';
  let d = new Date(inicio + 'T12:00:00');
  const esHabil = (dt) => {
    const day = dt.getDay();
    return day !== 0 && day !== 6;
  };
  while (!esHabil(d)) d.setDate(d.getDate() + 1);
  let n = 0;
  while (n < indice) {
    d.setDate(d.getDate() + 1);
    if (esHabil(d)) n++;
  }
  return d.toISOString().slice(0, 10);
};

/** Día 1 — referencia rápida */
window.MOVA_AUTH_DIA_1 = window.MOVA_AUTH_TODO_SEED[0];
