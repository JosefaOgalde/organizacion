/**
 * MOVA · Guía GitHub — Paso 1: crear cuenta con correo general.
 * Paso 2 (repo privado) queda como siguiente entrega.
 */
window.MKOF_GITHUB_GUIA = {
  version: '1.0',
  proyecto: 'MOVA',
  hito: '1.1 · Respaldo n8n → GitHub',
  pasoActual: 1,
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
      texto: 'En el navegador (Chrome, Edge o Firefox), escribe la dirección y presiona Enter.',
      url: 'https://github.com/signup',
      mockup: 'signup-url',
      tip: 'Si ya tienes sesión en GitHub con otra cuenta, abre una ventana de incógnito o cierra sesión primero.'
    },
    {
      num: 2,
      titulo: 'Ingresar el correo general',
      texto: 'En el campo Email, escribe el correo del proyecto (no un correo personal de una sola persona).',
      mockup: 'signup-email',
      tip: 'Ejemplo: infra@mova.cl — debe ser un buzón al que el equipo tenga acceso.'
    },
    {
      num: 3,
      titulo: 'Crear una contraseña segura',
      texto: 'Elige una contraseña larga (mínimo 15 caracteres). Guárdala en el gestor de contraseñas del equipo.',
      mockup: 'signup-password',
      tip: 'No uses la misma contraseña de otro servicio. GitHub mostrará si es débil o fuerte.'
    },
    {
      num: 4,
      titulo: 'Elegir nombre de usuario (username)',
      texto: 'Este será el @público de la cuenta. Usa algo del proyecto, por ejemplo mova-infra o makingof-mova.',
      mockup: 'signup-username',
      tip: 'Solo letras, números y guiones. Una vez creado, cuesta cambiarlo.'
    },
    {
      num: 5,
      titulo: 'Confirmar que no eres un robot',
      texto: 'GitHub puede pedir un puzzle o captcha. Complétalo y haz clic en Create account (Crear cuenta).',
      mockup: 'signup-submit',
      tip: 'Si aparece error de correo ya usado, ese email ya tiene cuenta — recupera acceso o usa otro correo general.'
    },
    {
      num: 6,
      titulo: 'Verificar el correo',
      texto: 'GitHub envía un código de 8 dígitos al correo. Ábrelo, copia el código y pégalo en la pantalla.',
      mockup: 'verify-email',
      tip: 'Revisa carpeta Spam si no llega en 2 minutos. El código vence en pocos minutos.'
    },
    {
      num: 7,
      titulo: 'Omitir preguntas opcionales',
      texto: 'GitHub puede preguntar cuántos integrantes tiene el equipo o si eres estudiante. Puedes saltar (Skip) todo.',
      mockup: 'onboarding-skip',
      tip: 'No afecta el uso. Lo importante es llegar al dashboard principal.'
    },
    {
      num: 8,
      titulo: 'Elegir plan gratuito',
      texto: 'Selecciona Continue for free (Continuar gratis). No necesitas plan de pago para repos privados en equipos pequeños.',
      mockup: 'plan-free',
      tip: 'GitHub Free permite repos privados ilimitados con colaboradores limitados — suficiente para MOVA.'
    },
    {
      num: 9,
      titulo: 'Cuenta lista — anotar datos',
      texto: 'Ya estás dentro. Anota en la ficha MOVA: correo, usuario @, y dónde guardaste la contraseña.',
      mockup: 'dashboard-ready',
      tip: 'Siguiente paso: crear el repo privado mova-n8n-workflows (Paso 2 de esta guía).'
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
