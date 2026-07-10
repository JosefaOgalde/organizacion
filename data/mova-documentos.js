/**
 * Catálogo MOVA — ver en HTML (editable en repo); PDF/PPT solo para exportar.
 */
window.MOVA_DOCUMENTOS = {
  version: '2.0',
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
          descripcion: 'Crear mova-n8n-workflows · visibilidad Private',
          hito: '1.1',
          fecha: 'Jul 2026',
          verHtml: 'github-repo.html',
          pdf: 'MOVA-GitHub-Paso2-Repo-Privado.pdf',
          pptx: 'MOVA-GitHub-Paso2-Repo-Privado.pptx',
          editar: 'mkof-github-repo-guia.js'
        },
        {
          id: 'github-n8n-checklist',
          titulo: 'GitHub + n8n — Checklist paso a paso',
          descripcion: 'Cuenta · repo privado · 3 pedidos n8n · texto correo · checklists',
          hito: '1.1',
          fecha: '10 jul 2026',
          pdf: 'MOVA-GitHub-N8n-Checklist.pdf',
          pptx: 'MOVA-GitHub-N8n-Checklist.pptx'
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
