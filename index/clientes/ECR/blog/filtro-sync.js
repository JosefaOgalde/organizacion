/**
 * ECR Blog — Widget HTML debajo de #filtro-principal
 * Carrusel vía API REST con carga suave y sin parpadeo brusco
 */
document.addEventListener('DOMContentLoaded', function () {

    var TAXONOMY = 'category';
    var FILTRO_PRINCIPAL = '#filtro-principal';
    var LOOP_CARRUSEL = 'bc0cdd5';
    var fetchAbort = null;
    var fetchSeq = 0;

    (function injectStyles() {
        if (document.getElementById('ecr-carrusel-sync-css')) return;
        var style = document.createElement('style');
        style.id = 'ecr-carrusel-sync-css';
        style.textContent = [
            '.elementor-element-' + LOOP_CARRUSEL + ' .elementor-widget-container {',
            '  position: relative;',
            '  transition: opacity 0.28s ease;',
            '}',
            '.elementor-element-' + LOOP_CARRUSEL + ' .elementor-widget-container.ecr-carrusel-cargando {',
            '  opacity: 0.88;',
            '  pointer-events: none;',
            '}',
            '.elementor-element-' + LOOP_CARRUSEL + ' .elementor-widget-container.ecr-carrusel-listo {',
            '  opacity: 1;',
            '}',
            '.elementor-element-' + LOOP_CARRUSEL + ' .elementor-loop-container {',
            '  transition: opacity 0.28s ease;',
            '}',
            '.elementor-element-' + LOOP_CARRUSEL + ' .ecr-carrusel-cargando .elementor-loop-container {',
            '  opacity: 0.75;',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    })();

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

    function getWidgetParts(widgetEl) {
        var wrap = widgetEl.querySelector('.elementor-widget-container');
        if (!wrap) return null;
        return {
            wrap: wrap,
            loop: wrap.querySelector('.elementor-loop-container'),
            nav: wrap.querySelector('.elementor-pagination'),
            anchor: wrap.querySelector('.e-load-more-anchor')
        };
    }

    function lockHeight(wrap) {
        var h = wrap.offsetHeight;
        if (h > 0) wrap.style.minHeight = h + 'px';
    }

    function unlockHeight(wrap) {
        wrap.style.minHeight = '';
    }

    function setLoading(widgetEl, on) {
        var parts = getWidgetParts(widgetEl);
        if (!parts) return;
        if (on) {
            lockHeight(parts.wrap);
            parts.wrap.classList.add('ecr-carrusel-cargando');
            parts.wrap.classList.remove('ecr-carrusel-listo');
        } else {
            parts.wrap.classList.remove('ecr-carrusel-cargando');
            parts.wrap.classList.add('ecr-carrusel-listo');
            requestAnimationFrame(function () {
                unlockHeight(parts.wrap);
            });
        }
    }

    function applyResponse(widgetEl, htmlString) {
        var parts = getWidgetParts(widgetEl);
        if (!parts) return;

        var tmp = document.createElement('div');
        tmp.innerHTML = htmlString.trim();
        var newWrap = tmp.firstElementChild;
        if (!newWrap) return;

        var newLoop = newWrap.querySelector('.elementor-loop-container');
        var newNav = newWrap.querySelector('.elementor-pagination');
        var newAnchor = newWrap.querySelector('.e-load-more-anchor');

        if (newLoop && parts.loop) {
            parts.loop.replaceWith(newLoop);
        }
        if (newNav && parts.nav) {
            parts.nav.replaceWith(newNav);
        } else if (newNav && !parts.nav) {
            parts.wrap.appendChild(newNav);
        }
        if (newAnchor && parts.anchor) {
            parts.anchor.replaceWith(newAnchor);
        } else if (newAnchor && !parts.anchor) {
            var nav = parts.wrap.querySelector('.elementor-pagination');
            if (nav) nav.parentNode.insertBefore(newAnchor, nav);
        }

        if (window.elementorFrontend && elementorFrontend.elementsHandler) {
            elementorFrontend.elementsHandler.runReadyTrigger(widgetEl);
        }
        if (window.jQuery) {
            jQuery(document).trigger('elementor/loop/query_filter_end');
        }
        if (window.ECR && typeof window.ECR.decorateCarrusel === 'function') {
            setTimeout(function () { window.ECR.decorateCarrusel(document); }, 150);
        }
    }

    function refreshCarrusel(filterSlug) {
        var widgetEl = document.querySelector('.elementor-element-' + LOOP_CARRUSEL);
        if (!widgetEl) return Promise.resolve();

        if (fetchAbort) fetchAbort.abort();
        fetchAbort = new AbortController();
        var seq = ++fetchSeq;

        setLoading(widgetEl, true);

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
            signal: fetchAbort.signal,
            body: JSON.stringify({
                post_id: getPostId(),
                widget_id: LOOP_CARRUSEL,
                widget_filters: widgetFilters,
                pagination_base_url: getBaseUrl()
            })
        })
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (seq !== fetchSeq) return;
                if (!res || typeof res.data !== 'string') return;
                applyResponse(widgetEl, res.data);
            })
            .catch(function (err) {
                if (err && err.name === 'AbortError') return;
                console.error('ECR carrusel filter:', err);
            })
            .finally(function () {
                if (seq !== fetchSeq) return;
                setLoading(widgetEl, false);
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
                        var slug = btn.dataset.filter;
                        var yaActivo = btn.getAttribute('aria-pressed') === 'true';
                        refreshCarrusel(yaActivo ? null : slug);
                    }, true);
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
