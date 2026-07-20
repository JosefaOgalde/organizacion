/**
 * Catálogo MOVA — ver en HTML (editable en repo); PDF/PPT solo para exportar.
 */
window.MOVA_DOCUMENTOS = {
  version: '4.2',
  baseMkof: '../../../mkof/',
  baseData: '../../../../../data/',
  categorias: [
    {
      id: 'inventario',
      titulo: 'Día 1 — Inventario módulos M',
      items: [
        {
          id: 'd1-inventario-status',
          titulo: 'Día 1 — Status inventario (entregable)',
          descripcion: 'mkof/01 · cPanel acme-chile.cl · auth fragmentada · localStorage axon_chats',
          hito: 'D1',
          fecha: '8 jul 2026',
          verHtml: 'mova-d1-status.html',
          pdf: 'MOVA-D1-Inventario-Status.pdf',
          pptx: 'MOVA-D1-Inventario-Status.pptx'
        }
      ]
    },
    {
      id: 'reglas',
      titulo: 'Día 2 — Reglas mova_auth',
      items: [
        {
          id: 'd2-reglas-mova-auth',
          titulo: 'Día 2 — Reglas mova_auth (entregable)',
          descripcion: 'mkof/02 · regla único validador · excepciones · acuerdo equipo · solo auditoría',
          hito: 'D2',
          fecha: '8 jul 2026',
          verHtml: 'mova-d2-reglas.html',
          pdf: 'MOVA-D2-Reglas-mova_auth.pdf',
          pptx: 'MOVA-D2-Reglas-mova_auth.pptx',
          editar: 'Reglas-mova_auth.md'
        }
      ]
    },
    {
      id: 'nucleo',
      titulo: 'Día 3 — Carpetas y archivos núcleo',
      items: [
        {
          id: 'd3-nucleo-mova-auth',
          titulo: 'Día 3 — Mapa núcleo mova_auth (entregable)',
          descripcion: 'mkof/03 · 6 PHP núcleo · gap cPanel · secretos vs públicos · solo auditoría',
          hito: 'D3',
          fecha: '19 jul 2026',
          verHtml: 'mova-d3-nucleo.html',
          editar: 'Mapa-mova_auth-nucleo.md'
        }
      ]
    },
    {
      id: 'cookie',
      titulo: 'Día 4 — Login único + cookie',
      items: [
        {
          id: 'd4-login-cookie',
          titulo: 'Día 4 — Flujo login + cookie (entregable)',
          descripcion: 'mkof/04 · HttpOnly+Secure · Google sin fragmentar · 10 casos de prueba',
          hito: 'D4',
          fecha: '19 jul 2026',
          verHtml: 'mova-d4-login-cookie.html',
          editar: 'Flujo-login-cookie-mova_auth.md'
        }
      ]
    },
    {
      id: 'validacion',
      titulo: 'Día 5 — Validación por módulo',
      items: [
        {
          id: 'd5-validacion-modulos',
          titulo: 'Día 5 — Matriz validación + cierre auditoría',
          descripcion: 'mkof/05 · hoy vs debería · sandbox ERP · criterios cierre D1–D5',
          hito: 'D5',
          fecha: '19 jul 2026',
          verHtml: 'mova-d5-validacion.html',
          editar: 'Matriz-validacion-modulos-mova_auth.md'
        }
      ]
    },
    {
      id: 'auth',
      titulo: 'Login unificado · mova_auth',
      items: [
        {
          id: 'auth',
          titulo: 'mova_auth — Login unificado',
          descripcion: '12 pasos · diagramas · checklist · errores comunes',
          hito: '2.1 + 2.2',
          fecha: 'Jul 2026',
          verHtml: 'mova-auth-guia.html',
          pdf: 'MOVA-Auth-Login-Unificado.pdf',
          pptx: 'MOVA-Auth-Plan-Ejecucion.pptx',
          editar: 'mkof-mova-auth-guia.js'
        },
        {
          id: 'mova-auth-plan',
          titulo: 'Plan 7 días — Login mova_auth',
          descripcion: 'PPT ejecución · acme-chile.cl · D1 inventario → D7 cierre',
          hito: '2.1 + 2.2',
          fecha: 'Jul 2026',
          verHtml: 'mova-auth-guia.html',
          pptx: 'MOVA-Auth-Plan-Ejecucion.pptx',
          editar: 'mkof-mova-auth-plan.js'
        }
      ]
    },
    {
      id: 'github',
      titulo: 'Respaldo n8n → GitHub',
      items: [
        {
          id: 'github',
          titulo: 'GitHub Paso 1 — Crear cuenta',
          descripcion: 'Capturas reales de github.com/signup',
          hito: '1.1',
          fecha: 'Jul 2026',
          verHtml: 'github-cuenta.html',
          pdf: 'MOVA-GitHub-Paso1-Crear-Cuenta.pdf',
          pptx: 'MOVA-GitHub-Paso1-Crear-Cuenta.pptx',
          editar: 'mkof-github-guia.js'
        },
        {
          id: 'github-repo',
          titulo: 'GitHub Paso 2 — Repo privado',
          descripcion: 'Repo mova-n8n-workflows · flujos ya respaldados',
          hito: '1.1',
          fecha: 'Jul 2026',
          verHtml: 'github-repo.html',
          pdf: 'MOVA-GitHub-Paso2-Repo-Privado.pdf',
          pptx: 'MOVA-GitHub-Paso2-Repo-Privado.pptx',
          editar: 'mkof-github-repo-guia.js'
        },
        {
          id: 'github-n8n-checklist',
          titulo: 'GitHub + n8n — Checklist (cerrado)',
          descripcion: 'HECHO: flujos n8n versionados en GitHub',
          hito: '1.1',
          fecha: '19 jul 2026',
          pdf: 'MOVA-GitHub-N8n-Checklist.pdf',
          pptx: 'MOVA-GitHub-N8n-Checklist.pptx'
        },
        {
          id: 'github-n8n',
          titulo: 'Paso 3 — Solicitud n8n',
          descripcion: 'Guía histórica · flujos ya en repo',
          hito: '1.1',
          fecha: '10 jul 2026',
          verHtml: 'github-n8n.html',
          pdf: 'MOVA-GitHub-N8n-Checklist.pdf',
          pptx: 'MOVA-GitHub-N8n-Checklist.pptx',
          editar: 'mkof-github-n8n-guia.js'
        }
      ]
    },
    {
      id: 'infra',
      titulo: 'Infra · Cloudflare + espejo cPanel',
      items: [
        {
          id: 'cloudflare-facil',
          titulo: 'Cloudflare — ¿para qué y es necesario?',
          descripcion: 'Escudo delante de GoDaddy · conclusión fácil · paso a paso activación',
          hito: '1.2',
          fecha: '19 jul 2026',
          verHtml: 'cloudflare-mova.html',
          editar: 'Cloudflare-MOVA-facil.md'
        },
        {
          id: 'artefactos-pendientes',
          titulo: 'Artefactos que aún faltan',
          descripcion: 'Espejo cPanel · Cloudflare · firma D2 · PHP núcleo · checklist',
          hito: 'Ops',
          fecha: '20 jul 2026',
          verHtml: 'artefactos-pendientes.html',
          editar: 'docs/mova/ARTEFACTOS-PENDIENTES.md'
        },
        {
          id: 'cpanel-espejo',
          titulo: 'Descargar cPanel → repo (espejo)',
          descripcion: 'ZIP File Manager → espejo-cpanel/ · sin secretos',
          hito: 'Ops',
          fecha: '19 jul 2026',
          verHtml: 'cpanel-espejo.html',
          editar: 'Guia-descargar-cpanel-al-repo.md'
        }
      ]
    },
    {
      id: 'presentacion',
      titulo: 'Presentación etapa 2',
      items: [
        {
          id: 'etapa2-presentacion',
          titulo: 'Deck etapa 2 (~20 min · 19 slides)',
          descripcion: 'Etapa 1 · Cloudflare · D1–D5 · n8n · cPanel · siguientes pasos',
          hito: 'Etapa 2',
          fecha: '19 jul 2026',
          verHtml: 'mova-etapa2-presentacion.html',
          editar: 'docs/mova/GUION-PRESENTACION-ETAPA2.md'
        }
      ]
    },
    {
      id: 'plan',
      titulo: 'Planificación post-auditoría',
      items: [
        {
          id: 'gantt',
          titulo: 'Carta Gantt MOVA — 3 semanas',
          descripcion: 'Cronograma según playbook del cliente',
          hito: 'Gantt',
          fecha: 'Jun 2026',
          verHtml: 'index.html',
          editar: 'mkof-mova-gantt.js'
        },
        {
          id: 'playbook',
          titulo: 'Playbook cliente (externo)',
          descripcion: 'Post-Auditoría MOVA — acme-chile.cl',
          hito: 'Referencia',
          fecha: 'Jun 2026',
          externo: 'https://acme-chile.cl/documentos/auditoria_mova.html'
        }
      ]
    }
  ]
};
