(function () {
  const grid = document.getElementById('clientes-grid');
  if (!grid || typeof CLIENTES_PORTAL === 'undefined') return;

  grid.innerHTML = CLIENTES_PORTAL.map(
    (c) => `
    <a href="clientes/${c.archivo}" class="portal-card"
       style="--card-border:${c.color.border};--card-bg:${c.color.bg};--card-text:${c.color.text}">
      <div class="portal-card__tipo">${c.tipo}</div>
      <h2 class="portal-card__nombre">${c.nombre}</h2>
      <div class="portal-card__abrev">${c.abrev} · ${c.agente}</div>
    </a>
  `
  ).join('');
})();
