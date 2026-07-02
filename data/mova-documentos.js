/**
 * Catálogo MOVA — ver en HTML (editable en repo); PDF/PPT solo para exportar.
 */
window.MOVA_DOCUMENTOS = {
  version: '2.0',
  baseMkof: '../../../mkof/',
  baseData: '../../../../../data/',
  categorias: [
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
          editar: 'mkof-mova-auth-guia.js'
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
