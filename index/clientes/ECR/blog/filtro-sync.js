/**
 * ECR Blog — Widget HTML debajo de #filtro-principal
 * Sincroniza categorías → #filtro-oculto (Loop Grid 3 / carrusel)
 */
document.addEventListener('DOMContentLoaded', function () {
  var TAXONOMY = 'category';
  var FILTRO_PRINCIPAL = '#filtro-principal';
  var FILTRO_OCULTO = '#filtro-oculto';

  fetch('/wp-admin/admin-ajax.php?action=ecr_get_term_icons&taxonomy=' + TAXONOMY)
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (!res.success) return;

      var icons = res.data;
      var observer;
      var injecting = false;

      function getLabel(btn) {
        var filter = btn.dataset.filter || '';
        return filter.charAt(0).toUpperCase() + filter.slice(1);
      }

      /** Por data-filter, no por índice (Sin categoría oculto desalinea índices) */
      function syncToHidden(filter) {
        if (!filter) return;
        var target = document.querySelector(
          FILTRO_OCULTO + ' .e-filter-item[data-filter="' + filter + '"]'
        );
        if (target) target.click();
      }

      function bindSync() {
        document.querySelectorAll(FILTRO_PRINCIPAL + ' .e-filter-item').forEach(function (btn) {
          if (btn.dataset.synced) return;
          btn.dataset.synced = 'true';

          btn.addEventListener('click', function () {
            var filter = btn.dataset.filter;
            setTimeout(function () {
              syncToHidden(filter);
            }, 80);
          });
        });
      }

      function injectIcons() {
        if (injecting) return;
        injecting = true;

        if (observer) observer.disconnect();

        document.querySelectorAll(FILTRO_PRINCIPAL + ' .e-filter-item').forEach(function (btn) {
          var label = getLabel(btn);
          var svg = icons[label];
          if (!svg) {
            btn.textContent = label;
            return;
          }
          btn.innerHTML =
            '<span class="ecr-tax-icon">' + svg + '</span>' +
            '<span class="ecr-tax-label">' + label + '</span>';
        });

        document.querySelectorAll(FILTRO_PRINCIPAL + ' .e-filter-item').forEach(function (btn) {
          var label = (btn.dataset.filter || '').toLowerCase();
          if (label === 'sin-categoria' || label === 'uncategorized') {
            btn.style.display = 'none';
          }
        });

        injecting = false;
        bindSync();

        var filterEl = document.querySelector(FILTRO_PRINCIPAL + ' .e-filter');
        if (filterEl && observer) {
          observer.observe(filterEl, { childList: true, subtree: false });
        }
      }

      injectIcons();

      var filterEl = document.querySelector(FILTRO_PRINCIPAL + ' .e-filter');
      if (filterEl) {
        observer = new MutationObserver(function () {
          injectIcons();
        });
        observer.observe(filterEl, { childList: true, subtree: false });
      }

      var filtroOcultoEl = document.querySelector(FILTRO_OCULTO);
      if (filtroOcultoEl) {
        new MutationObserver(function () {
          bindSync();
        }).observe(filtroOcultoEl, { childList: true, subtree: true });
      }
    });
});
