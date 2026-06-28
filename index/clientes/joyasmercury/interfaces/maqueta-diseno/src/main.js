/** Maqueta diseño JM · init mínimo */
const params = new URLSearchParams(window.location.search);
if (params.get('shot') === 'desktop' || params.get('shot') === '1') {
  document.body.dataset.shot = 'desktop';
}
