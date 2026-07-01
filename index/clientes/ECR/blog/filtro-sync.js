/**
 * ECR Blog — Widget HTML debajo de #filtro-principal
 * Actualiza bloque izquierdo (Elementor nativo) + carrusel vía API REST
 */
document.addEventListener('DOMContentLoaded', function () {

    var TAXONOMY = 'category';
    var FILTRO_PRINCIPAL = '#filtro-principal';
    var LOOP_CARRUSEL = 'bc0cdd5';

    function getRestUrl() {
        if (window.elementorProFrontend && elementorProFrontend.config.urls.rest) {
            return elementorProFrontend.config.urls.rest;
        }
        return '/wp-json/';
    }

    function getPostId() {
        if (window.elementorFrontend && elementorFrontend.config.post) {
            return elementorFrontend.config.post.id;
        }
        return 1072;
    }

    function getBaseUrl() {
        var filterEl = document.querySelector(FILTRO_PRINCIPAL + ' .e-filter');
        if (filterEl && filterEl.dataset.baseUrl) {
            return filterEl.dataset.baseUrl;
        }
        return window.location.href.split('?')[0];
    }

    function refreshCarrusel(filterSlug) {
        var widgetEl = document.querySelector('.elementor-element-' + LOOP_CARRUSEL);
        if (!widgetEl) return Promise.resolve();

        var loopContainer = widgetEl.querySelector('.elementor-loop-container');
        if (loopContainer) loopContainer.classList.add('bucle-bloqueado-abajo');

        var widgetFilters = {};
        if (filterSlug) {
            widgetFilters = {
                taxonomy: {
                    category: { terms: [filterSlug] }
                }
            };
        }

        return fetch(getRestUrl() + 'elementor-pro/v1/refresh-loop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                post_id: getPostId(),
                widget_id: LOOP_CARRUSEL,
                widget_filters: widgetFilters,
                pagination_base_url: getBaseUrl()
            })
        })
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (!res || typeof res.data !== 'string') return;

                var oldContainer = widgetEl.querySelector('.elementor-widget-container');
                if (!oldContainer) return;

                var tmp = document.createElement('div');
                tmp.innerHTML = res.data.trim();
                var newContainer = tmp.firstElementChild;
                if (!newContainer) return;

                widgetEl.replaceChild(newContainer, oldContainer);

                if (window.elementorFrontend && elementorFrontend.elementsHandler) {
                    elementorFrontend.elementsHandler.runReadyTrigger(widgetEl);
                }

                if (window.jQuery) {
                    jQuery(document).trigger('elementor/loop/query_filter_end');
                }
            })
            .catch(function (err) {
                console.error('ECR carrusel filter:', err);
            })
            .finally(function () {
                setTimeout(function () {
                    var c = widgetEl.querySelector('.elementor-loop-container');
                    if (c) c.classList.remove('bucle-bloqueado-abajo');
                }, 40);
            });
    }

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

            function bindCarruselSync() {
                document.querySelectorAll(FILTRO_PRINCIPAL + ' .e-filter-item').forEach(function (btn) {
                    if (btn.dataset.ecrCarruselSync) return;
                    btn.dataset.ecrCarruselSync = 'true';

                    btn.addEventListener('click', function () {
                        var filter = btn.dataset.filter;
                        setTimeout(function () {
                            var activo = btn.getAttribute('aria-pressed') === 'true';
                            refreshCarrusel(activo ? filter : null);
                        }, 120);
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
                bindCarruselSync();

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
        });
});
