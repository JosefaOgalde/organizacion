/**
 * MOVA · Guía GitHub — Paso 2: crear repositorio privado mova-n8n-workflows.
 * Visual: mockup HTML distinto por paso (mkof-github-mockups.js).
 * Las rutas imagen/* son respaldo legacy si mockups no cargan.
 */
window.MKOF_GITHUB_REPO_GUIA = {
  version: '1.0',
  proyecto: 'MOVA',
  hito: '1.1 · Respaldo n8n → GitHub',
  pasoActual: 2,
  imagenesBase: 'guia-github-repo/img/',
  pdf: 'MOVA-GitHub-Paso2-Repo-Privado.pdf',
  pasoAnterior: {
    num: 1,
    titulo: 'Crear cuenta GitHub',
    url: 'github-cuenta.html'
  },
  pasoSiguiente: {
    num: 3,
    titulo: 'Solicitud al equipo n8n',
    url: 'github-n8n.html'
  },
  repo: {
    nombre: 'mova-n8n-workflows',
    descripcion: 'Respaldo de workflows n8n — proyecto MOVA',
    visibilidad: 'Private',
    inicializarReadme: false
  },
  requisitos: {
    titulo: 'Antes de empezar (Paso 1 completado)',
    items: [
      'Cuenta GitHub creada con correo general del equipo (Paso 1).',
      'Usuario y contraseña disponibles en el gestor del equipo.',
      'Sesión iniciada en el navegador o listo para entrar en github.com/login.',
      'Nombre del repo acordado: mova-n8n-workflows (no cambiar sin avisar al equipo).'
    ]
  },
  pasos: [
    {
      num: 1,
      titulo: 'Iniciar sesión con la cuenta MOVA',
      texto: 'Abre github.com/login e ingresa el correo y la contraseña de la cuenta creada en el Paso 1.',
      url: 'https://github.com/login',
      imagen: '01-login-cuenta-mova.png',
      destacar: 'Sign in → correo general + contraseña del Paso 1',
      tip: 'Si no recuerdas la contraseña, usa Forgot password con el correo del equipo.'
    },
    {
      num: 2,
      titulo: 'Abrir «New repository»',
      texto: 'En la esquina superior derecha haz clic en + y elige New repository. También puedes ir directo a github.com/new.',
      url: 'https://github.com/new',
      imagen: '02-menu-new-repository.png',
      destacar: 'Botón + (arriba derecha) → New repository',
      tip: 'Debes estar logueado; si no, GitHub te pedirá iniciar sesión primero.'
    },
    {
      num: 3,
      titulo: 'Confirmar el propietario (Owner)',
      texto: 'En Owner debe aparecer la cuenta del Paso 1 (ej. mova-infra). No cambies a otra organización si no la conoces.',
      url: 'https://github.com/new',
      imagen: '03-formulario-nuevo-repo.png',
      destacar: 'Campo Owner → tu usuario MOVA',
      tip: 'Si solo ves tu cuenta personal, está bien — ese es el owner correcto.'
    },
    {
      num: 4,
      titulo: 'Nombre del repositorio',
      texto: 'En Repository name escribe exactamente: mova-n8n-workflows (minúsculas, guiones). GitHub validará que esté disponible.',
      url: 'https://github.com/new',
      imagen: '04-campo-nombre-repo.png',
      destacar: 'Repository name → mova-n8n-workflows',
      tip: 'Sin espacios ni mayúsculas. Este nombre lo usará n8n para el backup.'
    },
    {
      num: 5,
      titulo: 'Descripción (opcional)',
      texto: 'En Description puedes poner: Respaldo de workflows n8n — proyecto MOVA. Ayuda al equipo a identificar el repo.',
      url: 'https://github.com/new',
      imagen: '05-campo-descripcion.png',
      destacar: 'Description → texto corto del proyecto',
      tip: 'Es opcional pero recomendado para auditorías futuras.'
    },
    {
      num: 6,
      titulo: 'Elegir visibilidad Private',
      texto: 'Marca la opción Private. Los workflows de n8n pueden contener credenciales — nunca debe ser público.',
      url: 'https://github.com/new',
      imagen: '06-opcion-private.png',
      destacar: 'Visibility → Private (candado)',
      tip: 'Con plan Free puedes tener repos privados ilimitados.'
    },
    {
      num: 7,
      titulo: 'Dejar el repo vacío (sin README)',
      texto: 'No marques Add a README file, .gitignore ni license. El primer push vendrá desde n8n o desde el equipo técnico.',
      url: 'https://github.com/new',
      imagen: '07-sin-readme-inicial.png',
      destacar: 'Initialize → dejar todo sin marcar',
      tip: 'Si marcas README, el primer backup puede requerir un merge extra.'
    },
    {
      num: 8,
      titulo: 'Crear el repositorio',
      texto: 'Revisa: nombre mova-n8n-workflows, Private, sin archivos iniciales. Haz clic en el botón verde Create repository.',
      url: 'https://github.com/new',
      imagen: '08-boton-create-repository.png',
      destacar: 'Botón verde Create repository',
      tip: 'Si el nombre ya existe en tu cuenta, añade un sufijo solo si el equipo lo autoriza.'
    },
    {
      num: 9,
      titulo: 'Copiar la URL del repo',
      texto: 'Tras crearlo verás la página del repo vacío. Copia la URL (ej. github.com/mova-infra/mova-n8n-workflows) y anótala en la ficha MOVA.',
      url: 'https://github.com',
      imagen: '09-repo-creado-vacio.png',
      destacar: 'Barra del navegador o botón Code → URL HTTPS',
      tip: 'La necesitarás para configurar el backup automático de n8n (siguiente hito técnico).'
    },
    {
      num: 10,
      titulo: 'Invitar al equipo (opcional)',
      texto: 'En Settings → Collaborators → Add people puedes invitar a quienes deban ver o subir workflows. Rol sugerido: Write o Maintain.',
      url: 'https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-access-to-your-personal-repositories/inviting-collaborators-to-a-personal-repository',
      imagen: '10-docs-colaboradores.png',
      destacar: 'Settings → Collaborators → Add people',
      tip: 'Solo invita correos del equipo; el repo es privado y contiene lógica sensible.'
    }
  ],
  checklist: [
    'Sesión iniciada con la cuenta del Paso 1',
    'Repositorio mova-n8n-workflows creado',
    'Visibilidad Private confirmada (candado)',
    'Repo vacío — sin README inicial',
    'URL del repo anotada en ficha MOVA',
    '✓ Acceso como colaborador confirmado (jul 2026)',
    'Equipo técnico avisado — repo listo para recibir backup n8n'
  ],
  accesoColaborador: {
    estado: 'confirmado',
    fecha: '10 jul 2026',
    titulo: 'Acceso colaborador — OK',
    descripcion: 'Ya tienes permiso en el repo privado mova-n8n-workflows. Siguiente: clonar localmente y subir JSON cuando el equipo n8n responda.',
    pasos: [
      'Abrir el repo en GitHub y confirmar que ves la pestaña Code (no 404).',
      'Clonar en tu PC: git clone https://github.com/[owner]/mova-n8n-workflows.git',
      'Crear carpeta workflows/ y subir los .json que envíe el equipo n8n.',
      'Commit + push: git add . && git commit -m "backup n8n workflows" && git push',
      'Avisar al equipo n8n que el destino del backup ya está operativo.'
    ]
  }
};
