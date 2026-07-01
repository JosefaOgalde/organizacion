/**
 * ECR Blog — Widget HTML debajo de #filtro-principal
 * Íconos + ocultar Sin categoría + refreshCarrusel (bc0cdd5) con paginación filtrada
 */
document.addEventListener('DOMContentLoaded', function () {

    var TAXONOMY = 'category';
    var FILTRO_PRINCIPAL = '#filtro-principal';
    var LOOP_CARRUSEL = 'bc0cdd5';
    var fetchAbort = null;
    var fetchSeq = 0;
    var lastRequestKey = '';

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

    function getNonce() {
        if (window.elementorFrontend && elementorFrontend.config.nonce) {
            return elementorFrontend.config.nonce;
        }
        return '';
    }

    function getPostId() {
        if (window.elementorFrontend && elementorFrontend.config.post) {
            return String(elementorFrontend.config.post.id);
        }
        return '1072';
    }

    function getBaseUrl() {
        var filterEl = document.querySelector(FILTRO_PRINCIPAL + ' .e-filter');
        if (filterEl && filterEl.dataset.baseUrl) {
            return filterEl.dataset.baseUrl.split('?')[0];
        }
        return window.location.href.split('?')[0];
    }

    function getActiveSlug() {
        var slug = null;
        document.querySelectorAll(FILTRO_PRINCIPAL + ' .e-filter-item[aria-pressed="true"]').forEach(function (btn) {
            slug = btn.dataset.filter || null;
        });
        return slug;
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
            setTimeout(function () { window.ECR.decorateCarrusel(document); }, 100);
            setTimeout(function () { window.ECR.decorateCarrusel(document); }, 450);
        }
    }

    function refreshCarruselLoop(filterSlug, paginationPage) {
        var widgetEl = document.querySelector('.elementor-element-' + LOOP_CARRUSEL);
        if (!widgetEl) return Promise.resolve();

        var page = paginationPage || 1;
        var requestKey = (filterSlug || '') + '|' + page;
        if (requestKey === lastRequestKey) return Promise.resolve();
        lastRequestKey = requestKey;

        if (fetchAbort) fetchAbort.abort();
        fetchAbort = new AbortController();
        var seq = ++fetchSeq;

        setLoading(widgetEl, true);

        var widgetFilters = {};
        if (filterSlug) {
            widgetFilters = {
                taxonomy: {
                    category: {
                        terms: [filterSlug],
                        logicalJoin: 'AND'
                    }
                }
            };
        }

        var headers = { 'Content-Type': 'application/json' };
        var nonce = getNonce();
        if (nonce) headers['X-WP-Nonce'] = nonce;

        var body = {
            post_id: getPostId(),
            widget_id: LOOP_CARRUSEL,
            widget_filters: widgetFilters,
            pagination_base_url: getBaseUrl(),
            pagination_page: page
        };

        return fetch(getRestUrl() + 'elementor-pro/v1/refresh-loop', {
            method: 'POST',
            headers: headers,
            credentials: 'same-origin',
            signal: fetchAbort.signal,
            body: JSON.stringify(body)
        })
            .then(function (r) {
                return r.json().then(function (data) {
                    return { ok: r.ok, status: r.status, data: data };
                });
            })
            .then(function (res) {
                if (seq !== fetchSeq) return;
                if (!res.ok) {
                    console.error('ECR carrusel filter HTTP ' + res.status, res.data);
                    lastRequestKey = '';
                    return;
                }
                if (!res.data || typeof res.data.data !== 'string') {
                    console.error('ECR carrusel filter: respuesta inesperada', res.data);
                    lastRequestKey = '';
                    return;
                }
                applyResponse(widgetEl, res.data.data);
            })
            .catch(function (err) {
                if (err && err.name === 'AbortError') return;
                console.error('ECR carrusel filter:', err);
                lastRequestKey = '';
            })
            .finally(function () {
                if (seq !== fetchSeq) return;
                setLoading(widgetEl, false);
            });
    }

    function handleFilterClick(btn) {
        var slug = btn.dataset.filter || null;
        var wasActive = btn.getAttribute('aria-pressed') === 'true';
        lastRequestKey = '';
        refreshCarruselLoop(wasActive ? null : slug, 1);
    }

    function bindCarruselSync() {
        var filterRoot = document.querySelector(FILTRO_PRINCIPAL);
        if (!filterRoot || filterRoot.dataset.ecrCarruselSync) return;
        filterRoot.dataset.ecrCarruselSync = 'true';

        filterRoot.addEventListener('click', function (e) {
            var btn = e.target.closest('.e-filter-item');
            if (!btn) return;
            setTimeout(function () { handleFilterClick(btn); }, 80);
        });

        if (window.jQuery) {
            jQuery(document).on('click', FILTRO_PRINCIPAL + ' .e-filter-item', function () {
                var btn = this;
                setTimeout(function () { handleFilterClick(btn); }, 80);
            });
        }
    }

    window.ECR = window.ECR || {};
    window.ECR.getActiveFilterSlug = getActiveSlug;
    window.ECR.refreshCarruselLoop = refreshCarruselLoop;

    bindCarruselSync();

    var iconObserver;
    var injecting = false;

    function getLabel(btn) {
        var filter = btn.dataset.filter || '';
        return filter.charAt(0).toUpperCase() + filter.slice(1);
    }

    function injectIcons(icons) {
        if (injecting) return;
        injecting = true;

        if (iconObserver) iconObserver.disconnect();

        document.querySelectorAll(FILTRO_PRINCIPAL + ' .e-filter-item').forEach(function (btn) {
            var label = getLabel(btn);
            var slug = (btn.dataset.filter || '').toLowerCase();
            if (slug === 'sin-categoria' || slug === 'uncategorized') {
                btn.style.display = 'none';
                return;
            }
            var svg = icons[label];
            if (!svg) {
                btn.textContent = label;
                return;
            }
            btn.innerHTML =
                '<span class="ecr-tax-icon">' + svg + '</span>' +
                '<span class="ecr-tax-label">' + label + '</span>';
        });

        injecting = false;

        var filterEl = document.querySelector(FILTRO_PRINCIPAL + ' .e-filter');
        if (filterEl && iconObserver) {
            iconObserver.observe(filterEl, { childList: true, subtree: false });
        }
    }

    function loadIcons() {
        fetch('/wp-admin/admin-ajax.php?action=ecr_get_term_icons&taxonomy=' + TAXONOMY)
            .then(function (r) { return r.json(); })
            .then(function (res) {
                var icons = (res && res.success && res.data) ? res.data : {};
                injectIcons(icons);

                var filterEl = document.querySelector(FILTRO_PRINCIPAL + ' .e-filter');
                if (filterEl) {
                    iconObserver = new MutationObserver(function () {
                        injectIcons(icons);
                    });
                    iconObserver.observe(filterEl, { childList: true, subtree: false });
                }
            })
            .catch(function () {
                injectIcons({});
            });
    }

    loadIcons();
});
