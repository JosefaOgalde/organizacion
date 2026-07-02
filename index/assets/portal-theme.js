/** Aplica variables de identidad al body (misma paleta que las tarjetas del portal). */
window.aplicarTemaPortal = function aplicarTemaPortal(color) {
  const col = color || {};
  const border = col.border || '#98c8e0';
  const bg = col.bg || '#e8f4fc';
  const text = col.text || '#4a7a9e';
  document.body.style.setProperty('--card-border', border);
  document.body.style.setProperty('--card-bg', bg);
  document.body.style.setProperty('--card-text', text);
  document.body.style.setProperty('--portal-page-bg', bg);
  document.body.style.setProperty('--accent', border);
  document.body.classList.add('portal-body--themed', 'portal-page--light');
};

window.buscarProyectoPortal = function buscarProyectoPortal(clienteSlug, codigo) {
  if (typeof CLIENTES_PORTAL === 'undefined') return null;
  const cli = CLIENTES_PORTAL.find((x) => x.slug === clienteSlug);
  if (!cli?.proyectos?.length) return null;
  const proy = cli.proyectos.find((p) => p.codigo === codigo);
  if (!proy) return null;
  return { cliente: cli, proyecto: proy };
};
