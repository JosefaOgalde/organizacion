/**
 * ECR Blog — Widget HTML debajo de #filtro-principal
 * Íconos + refresh bloque izquierdo (7f45e18) + carrusel (bc0cdd5)
 */
document.addEventListener('DOMContentLoaded', function () {

    var TAXONOMY = 'category';
    var FILTRO_PRINCIPAL = '#filtro-principal';
    var LOOP_IZQUIERDO = '7f45e18';
    var LOOP_CARRUSEL = 'bc0cdd5';
    var abortByWidget = {};
    var seqByWidget = {};
    var lastKeyByWidget = {};

    (function injectStyles() {
        if (document.getElementById('ecr-carrusel-sync-css')) return;
        var style = document.createElement('style');
        style.id = 'ecr-carrusel-sync-css';
        style.textContent = [
            '.elementor-element-' + LOOP_CARRUSEL + ' .elementor-widget-container {',
            '  position: relative; transition: opacity 0.28s ease;',
            '}',
            '.elementor-element-' + LOOP_CARRUSEL + ' .elementor-widget-container.ecr-carrusel-cargando {',
            '  opacity: 0.88; pointer-events: none;',
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

    function setLoading(widgetEl, on) {
        var parts = getWidgetParts(widgetEl);
        if (!parts) return;
        if (on) {
            var h = parts.wrap.offsetHeight;
            if (h > 0) parts.wrap.style.minHeight = h + 'px';
            parts.wrap.classList.add('ecr-carrusel-cargando');
            parts.wrap.classList.remove('ecr-carrusel-listo');
        } else {
            parts.wrap.classList.remove('ecr-carrusel-cargando');
            parts.wrap.classList.add('ecr-carrusel-listo');
            requestAnimationFrame(function () { parts.wrap.style.minHeight = ''; });
        }
    }

    function applyResponse(widgetEl, htmlString, widgetId) {
        var parts = getWidgetParts(widgetEl);
        if (!parts) return;

        var tmp = document.createElement('div');
        tmp.innerHTML = htmlString.trim();
        var newWrap = tmp.firstElementChild;
        if (!newWrap) return;

        var newLoop = newWrap.querySelector('.elementor-loop-container');
        var newNav = newWrap.querySelector('.elementor-pagination');
        var newAnchor = newWrap.querySelector('.e-load-more-anchor');

        if (newLoop && parts.loop) parts.loop.replaceWith(newLoop);
        if (newNav && parts.nav) parts.nav.replaceWith(newNav);
        else if (newNav && !parts.nav) parts.wrap.appendChild(newNav);
        if (newAnchor && parts.anchor) parts.anchor.replaceWith(newAnchor);
        else if (newAnchor && !parts.anchor) {
            var nav = parts.wrap.querySelector('.elementor-pagination');
            if (nav) nav.parentNode.insertBefore(newAnchor, nav);
        }

        if (window.elementorFrontend && elementorFrontend.elementsHandler) {
            elementorFrontend.elementsHandler.runReadyTrigger(widgetEl);
        }

        if (widgetId === LOOP_CARRUSEL && window.ECR && typeof window.ECR.decorateCarrusel === 'function') {
            setTimeout(function () { window.ECR.decorateCarrusel(document); }, 100);
            setTimeout(function () { window.ECR.decorateCarrusel(document); }, 450);
        }
    }

    function refreshLoopWidget(widgetId, filterSlug, paginationPage) {
        var widgetEl = document.querySelector('.elementor-element-' + widgetId);
        if (!widgetEl) return Promise.resolve();

        var page = paginationPage || 1;
        var requestKey = (filterSlug || '') + '|' + page;
        if (lastKeyByWidget[widgetId] === requestKey) return Promise.resolve();
        lastKeyByWidget[widgetId] = requestKey;

        if (abortByWidget[widgetId]) abortByWidget[widgetId].abort();
        abortByWidget[widgetId] = new AbortController();
        if (!seqByWidget[widgetId]) seqByWidget[widgetId] = 0;
        var seq = ++seqByWidget[widgetId];

        if (widgetId === LOOP_CARRUSEL) setLoading(widgetEl, true);

        var widgetFilters = {};
        if (filterSlug) {
            widgetFilters = {
                taxonomy: {
                    category: { terms: [filterSlug], logicalJoin: 'AND' }
                }
            };
        }

        var headers = { 'Content-Type': 'application/json' };
        var nonce = getNonce();
        if (nonce) headers['X-WP-Nonce'] = nonce;

        return fetch(getRestUrl() + 'elementor-pro/v1/refresh-loop', {
            method: 'POST',
            headers: headers,
            credentials: 'same-origin',
            signal: abortByWidget[widgetId].signal,
            body: JSON.stringify({
                post_id: getPostId(),
                widget_id: widgetId,
                widget_filters: widgetFilters,
                pagination_base_url: getBaseUrl(),
                pagination_page: page
            })
        })
            .then(function (r) {
                return r.json().then(function (data) {
                    return { ok: r.ok, status: r.status, data: data };
                });
            })
            .then(function (res) {
                if (seq !== seqByWidget[widgetId]) return;
                if (!res.ok || !res.data || typeof res.data.data !== 'string') {
                    delete lastKeyByWidget[widgetId];
                    return;
                }
                applyResponse(widgetEl, res.data.data, widgetId);
            })
            .catch(function (err) {
                if (err && err.name === 'AbortError') return;
                delete lastKeyByWidget[widgetId];
            })
            .finally(function () {
                if (seq !== seqByWidget[widgetId]) return;
                if (widgetId === LOOP_CARRUSEL) setLoading(widgetEl, false);
                if (window.jQuery) {
                    jQuery(document).trigger('elementor/loop/query_filter_end');
                }
            });
    }

    function syncLoopsFromFilter(page) {
        var slug = getActiveSlug();
        refreshLoopWidget(LOOP_IZQUIERDO, slug, page || 1);
        refreshLoopWidget(LOOP_CARRUSEL, slug, page || 1);
    }

    function scheduleSync(page) {
        setTimeout(function () { syncLoopsFromFilter(page); }, 150);
    }

    function bindFilterSync() {
        var filterRoot = document.querySelector(FILTRO_PRINCIPAL);
        if (!filterRoot || filterRoot.dataset.ecrFilterSync) return;
        filterRoot.dataset.ecrFilterSync = 'true';

        filterRoot.addEventListener('click', function (e) {
            if (!e.target.closest('.e-filter-item')) return;
            delete lastKeyByWidget[LOOP_IZQUIERDO];
            delete lastKeyByWidget[LOOP_CARRUSEL];
            scheduleSync(1);
        });
    }

    window.ECR = window.ECR || {};
    window.ECR.getActiveFilterSlug = getActiveSlug;
    window.ECR.refreshCarruselLoop = function (filterSlug, page) {
        return refreshLoopWidget(LOOP_CARRUSEL, filterSlug, page);
    };

    bindFilterSync();

    function getLabel(btn) {
        var filter = btn.dataset.filter || '';
        return filter.charAt(0).toUpperCase() + filter.slice(1);
    }

    function injectIcons(icons) {
        document.querySelectorAll(FILTRO_PRINCIPAL + ' .e-filter-item').forEach(function (btn) {
            var slug = (btn.dataset.filter || '').toLowerCase();
            if (slug === 'sin-categoria' || slug === 'uncategorized') {
                btn.style.display = 'none';
                return;
            }
            if (btn.querySelector('.ecr-tax-icon')) return;

            var label = getLabel(btn);
            var svg = icons[label];
            if (!svg) return;

            btn.innerHTML =
                '<span class="ecr-tax-icon">' + svg + '</span>' +
                '<span class="ecr-tax-label">' + label + '</span>';
        });
    }

    fetch('/wp-admin/admin-ajax.php?action=ecr_get_term_icons&taxonomy=' + TAXONOMY)
        .then(function (r) { return r.json(); })
        .then(function (res) {
            injectIcons((res && res.success && res.data) ? res.data : {});
        })
        .catch(function () { injectIcons({}); });
});
