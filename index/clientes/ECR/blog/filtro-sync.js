/**
 * ECR Blog — Sincroniza #filtro-principal → #filtro-oculto (carrusel)
 * Pegar en widget HTML de Elementor junto al filtro visible.
 */
document.addEventListener('DOMContentLoaded', function () {
  const TAXONOMY = 'category';
  const FILTRO_PRINCIPAL = '#filtro-principal';
  const FILTRO_OCULTO = '#filtro-oculto';

  fetch('/wp-admin/admin-ajax.php?action=ecr_get_term_icons&taxonomy=' + TAXONOMY)
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (!res.success) return;

      const icons = res.data;
      let observer;
      let injecting = false;

      function getLabel(btn) {
        const filter = btn.dataset.filter || '';
        return filter.charAt(0).toUpperCase() + filter.slice(1);
      }

      /** Clic en filtro visible → mismo filtro en el oculto (carrusel) */
      function bindSync() {
        document.querySelectorAll(FILTRO_PRINCIPAL + ' .e-filter-item').forEach(function (btn) {
          if (btn.dataset.synced) return;
          btn.dataset.synced = 'true';

          btn.addEventListener('click', function () {
            const filter = btn.dataset.filter;
            if (!filter) return;

            setTimeout(function () {
              const target = document.querySelector(
                FILTRO_OCULTO + ' .e-filter-item[data-filter="' + filter + '"]'
              );
              if (target) target.click();
            }, 50);
          });
        });
      }

      function injectIcons() {
        if (injecting) return;
        injecting = true;

        if (observer) observer.disconnect();

        document.querySelectorAll(FILTRO_PRINCIPAL + ' .e-filter-item').forEach(function (btn) {
          const label = getLabel(btn);
          const svg = icons[label];
          if (!svg) {
            btn.textContent = label;
            return;
          }
          btn.innerHTML =
            '<span class="ecr-tax-icon">' + svg + '</span>' +
            '<span class="ecr-tax-label">' + label + '</span>';
        });

        document.querySelectorAll(FILTRO_PRINCIPAL + ' .e-filter-item').forEach(function (btn) {
          const label = (btn.dataset.filter || '').toLowerCase();
          if (label === 'sin-categoria' || label === 'uncategorized') {
            btn.style.display = 'none';
          }
        });

        injecting = false;
        bindSync();

        const filterEl = document.querySelector(FILTRO_PRINCIPAL + ' .e-filter');
        if (filterEl && observer) {
          observer.observe(filterEl, { childList: true, subtree: false });
        }
      }

      injectIcons();

      const filterEl = document.querySelector(FILTRO_PRINCIPAL + ' .e-filter');
      if (filterEl) {
        observer = new MutationObserver(function () {
          injectIcons();
        });
        observer.observe(filterEl, { childList: true, subtree: false });
      }

      const filtroOcultoEl = document.querySelector(FILTRO_OCULTO);
      if (filtroOcultoEl) {
        new MutationObserver(function () {
          bindSync();
        }).observe(filtroOcultoEl, { childList: true, subtree: true });
      }
    });
});
