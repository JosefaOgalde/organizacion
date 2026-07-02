/**
 * Catálogo de entregables MOVA alojados en el proyecto.
 * PDF/PPT en index/clientes/mkof/ · guías HTML en la misma carpeta.
 */
window.MOVA_DOCUMENTOS = {
  version: '1.0',
  baseMkof: '../../../mkof/',
  categorias: [
    {
      id: 'auth',
      titulo: 'Login unificado · mova_auth',
      items: [
        {
          id: 'auth-pdf',
          titulo: 'mova_auth — Login unificado (PDF)',
          descripcion: '12 pasos · diagramas · checklist · errores comunes',
          tipo: 'pdf',
          archivo: 'MOVA-Auth-Login-Unificado.pdf',
          fecha: 'Jul 2026',
          hito: '2.1 + 2.2'
        },
        {
          id: 'auth-web',
          titulo: 'mova_auth — Guía web interactiva',
          descripcion: 'Misma guía con diagramas en el navegador',
          tipo: 'html',
          archivo: 'mova-auth-guia.html',
          fecha: 'Jul 2026',
          hito: '2.1 + 2.2'
        }
      ]
    },
    {
      id: 'github',
      titulo: 'Respaldo n8n → GitHub',
      items: [
        {
          id: 'gh-pdf',
          titulo: 'GitHub Paso 1 — Crear cuenta (PDF)',
          descripcion: 'Capturas reales de github.com/signup',
          tipo: 'pdf',
          archivo: 'MOVA-GitHub-Paso1-Crear-Cuenta.pdf',
          fecha: 'Jul 2026',
          hito: '1.1'
        },
        {
          id: 'gh-ppt',
          titulo: 'GitHub Paso 1 — Presentación (PPT)',
          descripcion: 'Para entregar al encargado',
          tipo: 'pptx',
          archivo: 'MOVA-GitHub-Paso1-Crear-Cuenta.pptx',
          fecha: 'Jul 2026',
          hito: '1.1'
        },
        {
          id: 'gh-web',
          titulo: 'GitHub Paso 1 — Guía web',
          descripcion: 'Paso a paso con capturas en pantalla',
          tipo: 'html',
          archivo: 'github-cuenta.html',
          fecha: 'Jul 2026',
          hito: '1.1'
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
          descripcion: 'Cronograma comprimido según playbook del cliente',
          tipo: 'html',
          archivo: 'index.html',
          fecha: 'Jun 2026',
          hito: 'Gantt'
        },
        {
          id: 'playbook',
          titulo: 'Playbook cliente (externo)',
          descripcion: 'Post-Auditoría MOVA — acme-chile.cl',
          tipo: 'externo',
          url: 'https://acme-chile.cl/documentos/auditoria_mova.html',
          fecha: 'Jun 2026',
          hito: 'Referencia'
        }
      ]
    }
  ]
};
