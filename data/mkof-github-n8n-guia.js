/**
 * MOVA · Guía — Paso 3: solicitud al equipo n8n (tabla + JSON + capturas).
 * Visual: mockup por paso (mkof-github-mockups.js → n8nPaso).
 */
window.MKOF_GITHUB_N8N_GUIA = {
  version: '1.0',
  proyecto: 'MOVA',
  hito: '1.1 · Respaldo n8n → GitHub',
  pasoActual: 3,
  pdf: 'MOVA-GitHub-N8n-Checklist.pdf',
  pasoAnterior: {
    num: 2,
    titulo: 'Repo privado mova-n8n-workflows',
    url: 'github-repo.html'
  },
  requisitos: {
    titulo: 'Antes de empezar (Pasos 1 y 2 completados)',
    items: [
      'Cuenta GitHub MOVA creada (Paso 1).',
      'Repo privado mova-n8n-workflows creado y URL anotada (Paso 2).',
      'Contacto del equipo que administra n8n identificado.',
      'Inventario D1 revisado — columna «¿n8n?» pendiente de completar.'
    ]
  },
  tresPedidos: {
    titulo: 'Los 3 pedidos en un solo correo',
    items: [
      { id: 'tabla', titulo: 'Tabla inventario', desc: 'Webhook URL · módulo MOVA · tipo de auth · responsable' },
      { id: 'json', titulo: 'Export JSON', desc: 'Backup de workflows activos → repo mova-n8n-workflows' },
      { id: 'capturas', titulo: 'Capturas de pantalla', desc: 'Flujo visual por workflow — complemento a tabla y JSON' }
    ]
  },
  pasos: [
    {
      num: 1,
      titulo: 'Identificar contacto n8n',
      texto: 'Confirma quién administra la instancia n8n de acme-chile.cl (nombre, correo). Sin acceso admin tuyo — solo solicitas documentación.',
      url: 'Correo / reunión',
      destacar: 'Responsable n8n → anotar en ficha MOVA',
      tip: 'Josefa no administra n8n — este paso es coordinación, no configuración.'
    },
    {
      num: 2,
      titulo: 'Pedido 1 — Tabla de webhooks',
      texto: 'Solicita una tabla con todos los workflows activos que sirven a acme-chile.cl o módulos M. Columnas: nombre, URL webhook, módulo, auth, responsable, notas.',
      url: 'Solicitud por correo',
      destacar: 'Tabla → complementa Inventario-MOVA-modulos.md',
      tip: 'Sin contraseñas en la tabla — solo tipo de auth (token, API key, ninguna…).'
    },
    {
      num: 3,
      titulo: 'Pedido 2 — Export JSON',
      texto: 'Pide export .json de cada workflow activo en producción. Destino: repo privado mova-n8n-workflows en GitHub.',
      url: 'n8n → workflow → ⋯ → Download',
      destacar: 'JSON = estructura · credenciales reales siguen en n8n',
      tip: 'Entrega en .zip o push directo al repo cuando tengan acceso Write.'
    },
    {
      num: 4,
      titulo: 'Pedido 3 — Captura: lista de workflows',
      texto: 'Pide captura de la vista general de n8n con workflows activos visibles (nombres y estado ON).',
      url: 'n8n → Workflows',
      destacar: 'Screenshot de la lista — todos los activos en producción',
      tip: 'Ayuda a cruzar con la tabla: ¿falta algún workflow?'
    },
    {
      num: 5,
      titulo: 'Captura: canvas del workflow',
      texto: 'Por cada workflow activo: captura del canvas completo (todos los nodos visibles). Entender trigger → lógica → respuesta.',
      url: 'n8n → abrir workflow',
      destacar: 'Vista zoom out o varias capturas si es muy largo',
      tip: 'Clave para entender el flujo sin leer JSON línea por línea.'
    },
    {
      num: 6,
      titulo: 'Captura: nodo Webhook',
      texto: 'Captura del panel del nodo Webhook: URL de producción, método HTTP (GET/POST), path y si está activo.',
      url: 'n8n → nodo Webhook',
      destacar: 'Debe coincidir con la URL de la tabla (Pedido 1)',
      tip: 'Tapar tokens en la captura si aparecen en query params.'
    },
    {
      num: 7,
      titulo: 'Captura: validación de auth',
      texto: 'Si el workflow valida usuario o token: captura de nodos IF, Code o HTTP Request donde ocurre la validación.',
      url: 'n8n → nodos de validación',
      destacar: 'Importante para D5 — validación por módulo MOVA',
      tip: 'Si no hay validación, que lo indiquen por escrito en la tabla.'
    },
    {
      num: 8,
      titulo: 'Captura: ejecución reciente',
      texto: 'Opcional pero útil: Executions → una ejecución Success reciente. Muestra que el flujo corre en producción.',
      url: 'n8n → Executions',
      destacar: 'Success reciente — sin datos personales visibles',
      tip: 'Tapar payloads con datos sensibles antes de enviar.'
    },
    {
      num: 9,
      titulo: 'Regla: tapar secretos',
      texto: 'Pedir explícitamente que tapen contraseñas, API keys y tokens antes de enviar capturas o JSON por correo.',
      url: 'Seguridad',
      destacar: 'Prohibido: secretos en texto plano por chat/correo',
      tip: 'Pueden nombrar la credencial en n8n sin mostrar el valor.'
    },
    {
      num: 10,
      titulo: 'Organizar entregables',
      texto: 'Al recibir: carpeta por workflow (tabla.xlsx + .json + capturas/). Actualizar Inventario-MOVA-modulos.md y subir JSON al repo si corresponde.',
      url: 'Ficha MOVA',
      destacar: 'Integrar tabla n8n al inventario D1',
      tip: 'Seguimiento: agendar revisión cuando responda el equipo.'
    }
  ],
  checklist: [
    'Contacto equipo n8n confirmado',
    'Correo enviado con los 3 pedidos (tabla + JSON + capturas)',
    'Plantilla de columnas de tabla acordada',
    'Lista de capturas requeridas incluida en el correo',
    'Plazo de respuesta indicado',
    'Carpeta local lista para recibir entregables',
    'Inventario-MOVA-modulos.md preparado para actualizar columna n8n',
    'Seguimiento agendado — no bloquea mova_auth (D3–D5)'
  ],
  textoCorreo: `Asunto: Solicitud MOVA — inventario, backup y capturas n8n (acme-chile.cl)

Hola,

Para la auditoría MOVA necesitamos:

1) TABLA de workflows en producción (acme-chile.cl / módulos M):
   Nombre · URL webhook · Módulo · Auth · Responsable · Notas

2) EXPORT JSON de workflows activos (backup → repo GitHub mova-n8n-workflows).

3) CAPTURAS por workflow activo:
   · Lista de workflows (vista general)
   · Canvas completo del flujo
   · Nodo Webhook (URL y método)
   · Nodos de validación de auth (si existen)
   · Ejecución Success reciente (opcional)

Tapar secretos antes de enviar. No enviar contraseñas por correo.

Plazo sugerido: [FECHA]
Contacto MOVA: [TU CORREO]

Gracias.`
};
