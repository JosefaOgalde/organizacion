/**
 * Aplica automáticamente la paleta del cliente/proyecto en cualquier página del portal.
 * Usa data-cliente-slug / data-proyecto-codigo o infiere la ruta (MKOF/MOVA, etc.).
 */
(function () {
  const SLUG_ALIASES = {
    mkof: 'mkof',
    herramientas: 'herramientas',
    trendseeker: 'trendseeker',
    piscineria: 'piscineria',
    hotspring: 'hotspring',
    ecr: 'ecr',
    sie: 'sie',
    'desafio-latam': 'desafio-latam',
    desafiolatam: 'desafio-latam',
    joyasmercury: 'joyas-mercury',
    'joyas-mercury': 'joyas-mercury',
  };

  function normalizarSegmento(seg) {
    return String(seg || '').replace(/\.html$/i, '').toLowerCase();
  }

  function inferirDesdeRuta(pathname) {
    if (typeof CLIENTES_PORTAL === 'undefined') return null;
    const partes = String(pathname || '').replace(/\\/g, '/').split('/').filter(Boolean);
    const i = partes.findIndex((p) => normalizarSegmento(p) === 'clientes');
    if (i < 0) return null;

    const resto = partes.slice(i + 1).map(normalizarSegmento);
    if (!resto.length) return null;

    const slugDirecto = SLUG_ALIASES[resto[0]] || resto[0];
    let cli = CLIENTES_PORTAL.find((c) => c.slug === slugDirecto);
    if (!cli) {
      cli = CLIENTES_PORTAL.find((c) => {
        const arch = (c.archivo || '').split('?')[0].replace(/\.html$/i, '').split('/').pop();
        return arch && arch.toLowerCase() === resto[0];
      });
    }
    if (!cli) return null;

    let proyectoCodigo = null;
    if (cli.proyectos?.length) {
      for (const proy of cli.proyectos) {
        const arch = (proy.archivo || '').replace(/\.html$/i, '');
        const segmentos = arch.split('/').map(normalizarSegmento);
        if (!segmentos.length) continue;
        const coincide = segmentos.every((seg, idx) => resto[idx + 1] === seg || resto.includes(seg));
        if (coincide || resto.includes(segmentos[segmentos.length - 1])) {
          proyectoCodigo = proy.codigo;
          break;
        }
      }
      if (!proyectoCodigo && resto.includes('mova')) proyectoCodigo = 'MOVA';
      if (!proyectoCodigo && resto.some((s) => s.includes('tendencias'))) proyectoCodigo = 'TEND';
      if (!proyectoCodigo && resto.includes('cla')) proyectoCodigo = 'CLA';
    }

    return { cliente: cli, proyectoCodigo };
  }

  function resolverPaleta() {
    const body = document.body;
    if (!body || typeof CLIENTES_PORTAL === 'undefined') return null;

    const slug = body.dataset.clienteSlug;
    const codigo = body.dataset.proyectoCodigo;

    if (slug) {
      const cli = CLIENTES_PORTAL.find((c) => c.slug === slug);
      if (cli) {
        if (codigo && cli.proyectos?.length) {
          const proy = cli.proyectos.find((p) => p.codigo === codigo);
          if (proy?.color) return { color: proy.color, cliente: cli, proyecto: proy };
        }
        if (cli.color) return { color: cli.color, cliente: cli, proyecto: null };
      }
    }

    const inferido = inferirDesdeRuta(location.pathname);
    if (!inferido) return null;

    const { cliente, proyectoCodigo } = inferido;
    if (proyectoCodigo && cliente.proyectos?.length) {
      const proy = cliente.proyectos.find((p) => p.codigo === proyectoCodigo);
      if (proy?.color) return { color: proy.color, cliente, proyecto: proy };
    }
    if (cliente.color) return { color: cliente.color, cliente, proyecto: null };
    return null;
  }

  function aplicar() {
    const res = resolverPaleta();
    if (!res || typeof window.aplicarTemaPortal !== 'function') return;
    window.aplicarTemaPortal(res.color);
    document.body.classList.add('portal-header--themed');
    if (res.proyecto?.nombre) {
      document.body.dataset.proyectoNombre = res.proyecto.nombre;
    }
  }

  window.resolverTemaPortalPagina = resolverPaleta;

  if (document.body) aplicar();
  else document.addEventListener('DOMContentLoaded', aplicar);
})();
