/**
 * MOVA · Guía GitHub — Paso 1: crear cuenta con correo general.
 * Imágenes reales capturadas de github.com/signup (Jun 2026).
 */
window.MKOF_GITHUB_GUIA = {
  version: '2.0',
  proyecto: 'MOVA',
  hito: '1.1 · Respaldo n8n → GitHub',
  pasoActual: 1,
  imagenesBase: 'guia-github/img/',
  pdf: 'MOVA-GitHub-Paso1-Crear-Cuenta.pdf',
  pasoSiguiente: {
    num: 2,
    titulo: 'Crear repositorio privado',
    nombreRepo: 'mova-n8n-workflows',
    estado: 'pendiente'
  },
  correoRecomendado: {
    titulo: 'Usar un correo general del proyecto (no personal)',
    ejemplos: [
      'infra@mova.cl',
      'tecnologia@grupomakingof.cl',
      'devops@mova.cl',
      'sistemas@empresa.cl'
    ],
    reglas: [
      'Que varias personas del equipo puedan recibir el código de verificación (buzón compartido o alias).',
      'Guardar la contraseña en un gestor de contraseñas del equipo (1Password, Bitwarden, etc.).',
      'Anotar usuario de GitHub y correo en la ficha del proyecto MOVA.',
      'Activar verificación en dos pasos (2FA) cuando la cuenta esté creada.'
    ]
  },
  pasos: [
    {
      num: 1,
      titulo: 'Abrir la página de registro',
      texto: 'En Chrome, Edge o Firefox escribe github.com/signup y presiona Enter.',
      url: 'https://github.com/signup',
      imagen: '01-signup-pagina-completa.png',
      destacar: 'Barra de dirección → github.com/signup',
      tip: 'Si ya tienes otra sesión de GitHub, usa ventana de incógnito o cierra sesión primero.'
    },
    {
      num: 2,
      titulo: 'Ingresar el correo general',
      texto: 'En el campo Email * escribe el correo del proyecto (no personal de una sola persona).',
      url: 'https://github.com/signup',
      imagen: '03-campo-email.png',
      destacar: 'Campo Email * → correo del equipo (ej. infra@mova.cl)',
      tip: 'Debe ser un buzón al que varias personas del equipo tengan acceso.'
    },
    {
      num: 3,
      titulo: 'Crear una contraseña segura',
      texto: 'En Password * elige una contraseña larga (mínimo 15 caracteres). Guárdala en el gestor del equipo.',
      url: 'https://github.com/signup',
      imagen: '04-campo-password.png',
      destacar: 'Campo Password * → contraseña fuerte (indicador verde)',
      tip: 'No reutilices contraseñas de otros servicios.'
    },
    {
      num: 4,
      titulo: 'Elegir nombre de usuario (username)',
      texto: 'En Username * escribe un nombre del proyecto, por ejemplo mova-infra.',
      url: 'https://github.com/signup',
      imagen: '05-campo-username.png',
      destacar: 'Campo Username * → mova-infra (solo letras, números y guiones)',
      tip: 'Aparece debajo: github.com/tu-usuario — cuesta cambiarlo después.'
    },
    {
      num: 5,
      titulo: 'Completar captcha y crear cuenta',
      texto: 'Resuelve el puzzle «Verify your account» si aparece. Luego haz clic en el botón verde Create account.',
      url: 'https://github.com/signup',
      imagen: '06-formulario-completo.png',
      destacar: 'Botón verde Create account al final del formulario',
      tip: 'Si el correo ya existe, GitHub dirá que el email ya está en uso.'
    },
    {
      num: 6,
      titulo: 'Verificar el correo',
      texto: 'GitHub envía un código de 8 dígitos al correo. Ingrésalo en la pantalla «Verify your email address».',
      url: 'https://github.com/signup',
      imagen: '09-docs-signup-oficial.png',
      destacar: 'Pantalla siguiente al Create account → código de 8 dígitos del correo',
      tip: 'Revisa Spam. El código vence en pocos minutos.'
    },
    {
      num: 7,
      titulo: 'Omitir preguntas opcionales',
      texto: 'GitHub puede preguntar tamaño del equipo o si eres estudiante. Haz clic en Skip o Continue sin completar.',
      url: 'https://github.com',
      imagen: '09-docs-signup-oficial.png',
      destacar: 'Preguntas de onboarding → Skip / Omitir',
      tip: 'No afecta el uso para MOVA.'
    },
    {
      num: 8,
      titulo: 'Elegir plan gratuito',
      texto: 'En «Pick a plan» elige la opción Free y pulsa Continue for free.',
      url: 'https://github.com',
      imagen: '09-docs-signup-oficial.png',
      destacar: 'Plan Free → Continue for free (gratis, repos privados incluidos)',
      tip: 'No necesitas plan de pago para repos privados en equipos pequeños.'
    },
    {
      num: 9,
      titulo: 'Cuenta lista — anotar datos',
      texto: 'Ya puedes iniciar sesión. Anota en la ficha MOVA: correo, usuario @ y dónde guardaste la contraseña.',
      url: 'https://github.com/login',
      imagen: '07-pagina-login.png',
      destacar: 'Tras verificar → verás el inicio de sesión o el dashboard de GitHub',
      tip: 'Siguiente entrega: repo privado mova-n8n-workflows (Paso 2).'
    }
  ],
  checklist: [
    'Correo general del proyecto definido y accesible por el equipo',
    'Cuenta creada en github.com/signup',
    'Correo verificado con el código de 8 dígitos',
    'Plan Free activo',
    'Usuario y contraseña guardados en gestor del equipo',
    'Pendiente: Paso 2 — crear repo privado mova-n8n-workflows'
  ]
};
