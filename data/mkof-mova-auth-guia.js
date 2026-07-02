/**
 * MOVA · Guía mova_auth — Login unificado (Fase 1 · hitos 2.1 y 2.2)
 * Basado en playbook acme-chile.cl/documentos/auditoria_mova.html
 */
window.MKOF_MOVA_AUTH_GUIA = {
  version: '1.0',
  proyecto: 'MOVA',
  hito: '2.1 + 2.2 · Centralizar mova_auth + sesión server-side',
  imagenesBase: 'guia-mova-auth/img/',
  pdf: 'MOVA-Auth-Login-Unificado.pdf',
  referencias: {
    playbook: 'https://acme-chile.cl/documentos/auditoria_mova.html',
    gantt: 'Carta Gantt 3 semanas · Semana 1–2'
  },
  problema: {
    titulo: 'El problema real (según el cliente)',
    texto: 'Ya validan en backend (n8n vía tokeninfo + whitelist). El problema no es "falta de validación", es la fragmentación: Google + mova_auth con controles parciales por módulo, y JWT en localStorage.',
    imagen: '01-problema-fragmentado.png'
  },
  objetivo: {
    titulo: 'La meta',
    texto: 'mova_auth como único validador de sesión para todos los módulos M. Login único, token de sesión propio, cookie httpOnly en PHP (GoDaddy). Sin migrar de hosting.',
    imagen: '02-objetivo-centralizado.png'
  },
  fases: [
    {
      id: 'A',
      titulo: 'Fase A — Inventario (no tocar código aún)',
      dias: 'Día 1',
      pasos: [
        {
          num: 1,
          titulo: 'Listar todos los módulos M',
          texto: 'Abre cPanel → Administrador de archivos → public_html. Anota cada carpeta/módulo MOVA (MAESTRO, INGRESOS, EGRESOS, etc.) y su URL.',
          imagen: '05-estructura-carpetas.png',
          destacar: 'Crear tabla: Módulo | URL | ¿Cómo valida hoy? | ¿Usa localStorage?',
          checklist: ['Tabla de módulos completa', 'URLs anotadas', 'Responsable asignado por módulo']
        },
        {
          num: 2,
          titulo: 'Documentar el flujo actual de cada módulo',
          texto: 'Por cada módulo revisa el código (o pregunta al dev): ¿usa Google OAuth? ¿mova_auth? ¿JWT en localStorage? ¿llama a n8n?',
          imagen: '01-problema-fragmentado.png',
          destacar: 'Marcar en rojo todo lo que NO pase por mova_auth',
          checklist: ['Flujo actual dibujado o anotado', 'JWT/localStorage identificados', 'Endpoints n8n listados']
        }
      ]
    },
    {
      id: 'B',
      titulo: 'Fase B — Diseñar mova_auth (día 2–3)',
      dias: 'Días 2–3',
      pasos: [
        {
          num: 3,
          titulo: 'Definir mova_auth como único validador',
          texto: 'Acuerdo de equipo: ningún módulo valida permisos por su cuenta. Todos incluyen guard.php al inicio y consultan validate.php.',
          imagen: '02-objetivo-centralizado.png',
          destacar: 'Regla: si no pasó por mova_auth → redirect a login',
          checklist: ['Regla escrita y compartida', 'Lista de archivos a crear acordada']
        },
        {
          num: 4,
          titulo: 'Crear carpeta mova_auth en GoDaddy',
          texto: 'En cPanel → Administrador de archivos → public_html → Nueva carpeta: mova_auth. Sube los archivos base (ver Paso 5).',
          imagen: '05-estructura-carpetas.png',
          destacar: 'public_html/mova_auth/',
          checklist: ['Carpeta creada', 'Permisos 755 en carpeta', 'URL https://tudominio.cl/mova_auth/ responde']
        },
        {
          num: 5,
          titulo: 'Subir archivos núcleo de mova_auth',
          texto: 'Crear en mova_auth/: config.php (secretos), session.php (manejo sesión PHP), login.php (pantalla login), validate.php (API), guard.php (include módulos), logout.php.',
          codigo: `// guard.php — incluir AL INICIO de cada módulo
<?php
require_once __DIR__ . '/../mova_auth/session.php';
if (!mova_session_valida()) {
  header('Location: /mova_auth/login.php?redirect=' . urlencode($_SERVER['REQUEST_URI']));
  exit;
}`,
          imagen: '05-estructura-carpetas.png',
          destacar: 'guard.php es la pieza que unifica todos los módulos',
          checklist: ['6 archivos PHP creados', 'config.php con secret fuera de Git público', 'login.php abre en navegador']
        }
      ]
    },
    {
      id: 'C',
      titulo: 'Fase C — Login único y sesión (día 4–7)',
      dias: 'Días 4–7',
      pasos: [
        {
          num: 6,
          titulo: 'Implementar login único',
          texto: 'login.php: el usuario entra una sola vez. Si usas Google, valida con tokeninfo + whitelist (como hoy en n8n) pero el resultado se guarda en sesión PHP, no en localStorage.',
          imagen: '03-flujo-login.png',
          destacar: 'Flujo: login.php → (Google opcional) → crear sesión → redirect al módulo',
          checklist: ['Login funciona en navegador', 'Redirect vuelve al módulo pedido', 'Google tokeninfo probado']
        },
        {
          num: 7,
          titulo: 'Token de sesión propio (no solo Google)',
          texto: 'Tras login exitoso, genera un ID de sesión PHP (session_start) o token aleatorio guardado en servidor. No depender solo del token de Google en el cliente.',
          codigo: `// session.php — emitir cookie segura
session_set_cookie_params([
  'lifetime' => 0,
  'path' => '/',
  'secure' => true,      // solo HTTPS
  'httponly' => true,    // JS no puede leerla
  'samesite' => 'Lax'
]);
session_start();`,
          imagen: '03-flujo-login.png',
          destacar: 'Cookie httpOnly + Secure — el cliente NO guarda JWT',
          checklist: ['Cookie visible en DevTools (HttpOnly ✓)', 'Sin JWT en localStorage', 'Sesión persiste al recargar']
        },
        {
          num: 8,
          titulo: 'Endpoint validate.php',
          texto: 'validate.php devuelve JSON { ok: true, usuario, permisos } si la sesión es válida. Los módulos HTML/JS pueden llamarlo con fetch (credentials: include) para AJAX.',
          imagen: '04-validacion-modulo.png',
          destacar: 'Cada petición AJAX del módulo → validate.php primero',
          checklist: ['validate.php responde 200 con sesión', 'Responde 401 sin sesión', 'Permisos correctos por rol']
        },
        {
          num: 9,
          titulo: 'Migrar módulos uno por uno',
          texto: 'Orden sugerido: 1) módulo menos crítico (sandbox), 2) resto. En cada index.php agrega require guard.php arriba. Elimina validación duplicada del módulo.',
          imagen: '04-validacion-modulo.png',
          destacar: 'Un módulo a la vez — probar antes de pasar al siguiente',
          checklist: ['Módulo 1 migrado y probado', 'Módulo 2 migrado', 'Todos los M usan guard.php']
        }
      ]
    },
    {
      id: 'D',
      titulo: 'Fase D — Limpieza y pruebas (día 8–10)',
      dias: 'Días 8–10',
      pasos: [
        {
          num: 10,
          titulo: 'Retirar JWT de localStorage',
          texto: 'Busca en cada módulo: localStorage.setItem, localStorage.getItem con token/jwt. Elimina y reemplaza por sesión PHP (el navegador envía la cookie sola).',
          imagen: '06-antes-despues.png',
          destacar: 'DevTools → Application → Local Storage → debe quedar vacío de tokens',
          checklist: ['localStorage sin JWT', 'Código viejo comentado/eliminado', 'Sin regresiones en módulos']
        },
        {
          num: 11,
          titulo: 'Pruebas por módulo',
          texto: 'Por cada M: (1) sin login → redirect login, (2) con login → entra, (3) logout → no puede volver, (4) otra pestaña incógnito → pide login.',
          imagen: '06-antes-despues.png',
          destacar: 'Probar en Chrome normal + ventana incógnito',
          checklist: ['4 pruebas OK por módulo', 'Logout funciona', 'Sesión expira según config']
        },
        {
          num: 12,
          titulo: 'Documentar y cerrar hito 2.1 + 2.2',
          texto: 'Actualiza ficha MOVA: URL login, dónde está config.php, quién tiene acceso cPanel. Marca en Gantt como completado.',
          imagen: '02-objetivo-centralizado.png',
          destacar: 'Entregable: mova_auth operativo + todos los M centralizados',
          checklist: ['Documentación actualizada', 'Equipo capacitado', 'Gantt hito 2.1 y 2.2 cerrados']
        }
      ]
    }
  ],
  erroresComunes: [
    { error: 'Bucle de redirect infinito', solucion: 'login.php no debe incluir guard.php. Excluir /mova_auth/ del guard.' },
    { error: 'Cookie no se guarda', solucion: 'Verificar HTTPS activo (Cloudflare SSL Full). secure => true requiere HTTPS.' },
    { error: 'Módulo sigue pidiendo login', solucion: 'Misma cookie path=/ y dominio. Revisar que guard.php apunte a la misma carpeta mova_auth.' },
    { error: 'AJAX devuelve 401', solucion: 'fetch debe usar credentials: "include" para enviar la cookie.' },
    { error: 'Google OK pero sesión no persiste', solucion: 'session_start() antes de cualquier output. Revisar session.save_path en PHP.' }
  ],
  checklistFinal: [
    'mova_auth es el único punto de login',
    'Todos los módulos M incluyen guard.php',
    'Cookie httpOnly + Secure activa',
    'Sin JWT en localStorage',
    'validate.php operativo',
    'Pruebas OK en todos los módulos',
    'Documentación en ficha MOVA'
  ],
  noHacer: [
    'No migrar de GoDaddy ahora (movimiento lateral)',
    'No validar permisos dentro de cada módulo',
    'No guardar tokens en localStorage',
    'No migrar todos los módulos el mismo día sin probar'
  ]
};
