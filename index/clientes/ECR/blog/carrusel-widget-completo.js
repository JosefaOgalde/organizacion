/**
 * ECR Blog — Widget HTML debajo del Loop Grid 3 (carrusel central)
 * Incluye: paginación + etiquetas de categoría + fechas reales
 * Reemplazar el widget HTML actual del carrusel con ESTE archivo completo.
 *
 * ECR_CARRUSEL_PAGINACION
 * ECR_BLOG_DECORATE
 */

/* ========== ECR_BLOG_DECORATE ========== */
(function () {
    var LOOP_CARRUSEL = 'bc0cdd5';
    var THUMB_ID = '5e4f8fb';
    var ICONS = null;
    var DATE_CACHE = {};
    var CAT_CACHE = {};
    var decorateTimer = null;

    var SLUG_LABEL = {
        articulos: 'Articulos',
        editorial: 'Editorial',
        eventos: 'Eventos',
        prensa: 'Prensa',
        'sin-categoria': 'Sin categoría',
        uncategorized: 'Sin categoría'
    };

    var SKIP_SLUGS = { 'sin-categoria': true, uncategorized: true };
    var SLUG_ORDER = { articulos: 1, editorial: 2, eventos: 3, prensa: 4 };
    var MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    function injectStyles() {
        if (document.getElementById('ecr-blog-decorate-css')) return;
        var style = document.createElement('style');
        style.id = 'ecr-blog-decorate-css';
        style.textContent = [
            '.elementor-element-' + LOOP_CARRUSEL + ' .elementor-element-' + THUMB_ID + ' {',
            '  position: relative !important;',
            '  overflow: hidden !important;',
            '}',
            '.elementor-element-' + LOOP_CARRUSEL + ' .ecr-carrusel-badges {',
            '  position: absolute !important;',
            '  top: 8px !important;',
            '  left: 8px !important;',
            '  z-index: 6 !important;',
            '  display: flex !important;',
            '  flex-direction: column !important;',
            '  flex-wrap: nowrap !important;',
            '  align-items: flex-start !important;',
            '  gap: 4px !important;',
            '  max-width: calc(100% - 16px) !important;',
            '  pointer-events: none !important;',
            '}',
            '.elementor-element-' + LOOP_CARRUSEL + ' .ecr-carrusel-badges .ecr-card-blog__badge {',
            '  display: inline-flex !important;',
            '  align-items: center !important;',
            '  gap: 4px !important;',
            '  padding: 4px 10px !important;',
            '  border-radius: 999px !important;',
            '  border: 1px solid #fff !important;',
            '  background: rgba(0, 0, 0, 0.65) !important;',
            '  color: #fff !important;',
            '  font-size: 11px !important;',
            '  font-weight: 600 !important;',
            '  line-height: 1 !important;',
            '  white-space: nowrap !important;',
            '}',
            '.elementor-element-' + LOOP_CARRUSEL + ' .ecr-carrusel-badges .ecr-card-blog__badge svg {',
            '  display: inline-block !important;',
            '  width: 12px !important;',
            '  height: 12px !important;',
            '  flex-shrink: 0 !important;',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function formatDate(iso) {
        var d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        return d.getDate() + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear();
    }

    function getPostId(item) {
        var m = (item.className || '').match(/\bpost-(\d+)\b/);
        return m ? m[1] : null;
    }

    function getCategorySlugsFromClass(item) {
        return (item.className || '').split(/\s+/).filter(function (c) {
            return c.indexOf('category-') === 0;
        }).map(function (c) {
            return c.replace('category-', '');
        }).filter(function (slug) {
            return !SKIP_SLUGS[slug];
        });
    }

    function slugToLabel(slug) {
        return SLUG_LABEL[slug] || (slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '));
    }

    function sortSlugs(slugs) {
        return slugs.slice().sort(function (a, b) {
            var oa = SLUG_ORDER[a] || 99;
            var ob = SLUG_ORDER[b] || 99;
            return oa - ob;
        });
    }

    function getThumb(item) {
        return item.querySelector('.elementor-element-' + THUMB_ID)
            || item.querySelector('[data-id="' + THUMB_ID + '"]');
    }

    function loadIcons() {
        if (ICONS) return Promise.resolve(ICONS);
        return fetch('/wp-admin/admin-ajax.php?action=ecr_get_term_icons&taxonomy=category')
            .then(function (r) { return r.json(); })
            .then(function (res) {
                ICONS = (res && res.success && res.data) ? res.data : {};
                return ICONS;
            })
            .catch(function () {
                ICONS = {};
                return ICONS;
            });
    }

    function fetchPostMeta(postId) {
        if (DATE_CACHE[postId] && CAT_CACHE[postId]) {
            return Promise.resolve({ date: DATE_CACHE[postId], slugs: CAT_CACHE[postId] });
        }

        return fetch('/wp-json/wp/v2/posts/' + postId + '?_fields=date,categories')
            .then(function (r) { return r.json(); })
            .then(function (p) {
                var dateTxt = formatDate(p.date);
                DATE_CACHE[postId] = dateTxt;

                if (CAT_CACHE[postId]) {
                    return { date: dateTxt, slugs: CAT_CACHE[postId] };
                }

                if (!p.categories || !p.categories.length) {
                    CAT_CACHE[postId] = [];
                    return { date: dateTxt, slugs: [] };
                }

                return Promise.all(p.categories.map(function (catId) {
                    return fetch('/wp-json/wp/v2/categories/' + catId + '?_fields=slug,name')
                        .then(function (r) { return r.json(); })
                        .catch(function () { return null; });
                })).then(function (cats) {
                    var slugs = cats.filter(Boolean).map(function (c) { return c.slug; })
                        .filter(function (slug) { return !SKIP_SLUGS[slug]; });
                    CAT_CACHE[postId] = slugs;
                    return { date: dateTxt, slugs: slugs };
                });
            })
            .catch(function () {
                return { date: '', slugs: [] };
            });
    }

    function buildBadgeHtml(slug, icons) {
        var label = slugToLabel(slug);
        var svg = icons[label] || '';
        if (!svg) return '<div class="ecr-card-blog__badge">' + label + '</div>';
        return '<div class="ecr-card-blog__badge">' + svg + label + '</div>';
    }

    function renderBadges(thumb, slugs, icons) {
        if (!thumb || !slugs.length) return false;

        var existing = thumb.querySelector('.ecr-carrusel-badges');
        if (existing) existing.remove();

        var wrap = document.createElement('div');
        wrap.className = 'ecr-carrusel-badges';
        wrap.setAttribute('aria-hidden', 'true');
        wrap.innerHTML = sortSlugs(slugs).slice(0, 2).map(function (s) {
            return buildBadgeHtml(s, icons);
        }).join('');

        thumb.appendChild(wrap);
        return true;
    }

    function injectDate(item, dateTxt) {
        var dateEl = item.querySelector('.elementor-element-bc5fe2f .elementor-shortcode');
        if (!dateEl) return;
        if (dateTxt) dateEl.textContent = dateTxt;
    }

    function decorateItem(item, icons) {
        var thumb = getThumb(item);
        if (thumb) {
            thumb.style.position = 'relative';
            thumb.style.overflow = 'hidden';
        }

        var slugs = getCategorySlugsFromClass(item);
        if (slugs.length && thumb) {
            renderBadges(thumb, slugs, icons);
        }

        var postId = getPostId(item);
        if (!postId) return;

        fetchPostMeta(postId).then(function (meta) {
            if (meta.slugs && meta.slugs.length && thumb) {
                renderBadges(thumb, meta.slugs, icons);
            }
            injectDate(item, meta.date);
        });
    }

    function getCarruselGrid(root) {
        return (root || document).querySelector('.elementor-element-' + LOOP_CARRUSEL);
    }

    function decorateCarrusel(root) {
        var grid = getCarruselGrid(root);
        if (!grid) return;

        loadIcons().then(function (icons) {
            var items = grid.querySelectorAll('.e-loop-item');
            if (!items.length) return;
            items.forEach(function (item) {
                decorateItem(item, icons);
            });
        });
    }

    function scheduleDecorate() {
        if (decorateTimer) clearTimeout(decorateTimer);
        decorateCarrusel(document);
        decorateTimer = setTimeout(function () { decorateCarrusel(document); }, 150);
    }

    function bindObserver() {
        var grid = getCarruselGrid(document);
        if (!grid || grid.dataset.ecrDecorateObserved) return;

        var loop = grid.querySelector('.elementor-loop-container');
        if (!loop) return;

        grid.dataset.ecrDecorateObserved = '1';
        new MutationObserver(function () {
            scheduleDecorate();
        }).observe(loop, { childList: true, subtree: true });
    }

    injectStyles();

    window.ECR = window.ECR || {};
    window.ECR.decorateCarrusel = decorateCarrusel;

    document.addEventListener('DOMContentLoaded', function () {
        scheduleDecorate();
        bindObserver();
        [350, 800, 1500].forEach(function (ms) {
            setTimeout(scheduleDecorate, ms);
        });
    });

    window.addEventListener('load', scheduleDecorate);

    if (window.jQuery) {
        jQuery(window).on('elementor/frontend/init', scheduleDecorate);
        jQuery(document).on('elementor/loop/query_filter_end', function () {
            setTimeout(scheduleDecorate, 100);
        });
    }
})();

/* ========== ECR_CARRUSEL_PAGINACION ========== */
jQuery(document).ready(function ($) {
    var LOOP_CARRUSEL = 'bc0cdd5';

    function getCarruselGrid() {
        var $byId = $('.elementor-element-' + LOOP_CARRUSEL);
        if ($byId.length) return $byId;

        var $htmlWidget = $('script').filter(function () {
            return this.textContent.indexOf('ECR_CARRUSEL_PAGINACION') !== -1;
        }).last().closest('.elementor-widget-html');

        if ($htmlWidget.length) {
            var $sibling = $htmlWidget.prev('.elementor-widget-loop-grid');
            if ($sibling.length) return $sibling;
        }

        var $conPaginacion = $('.elementor-widget-loop-grid').filter(function () {
            return $(this).find('.elementor-pagination .prev, .elementor-pagination .next').length > 0;
        });
        return $conPaginacion.length > 1 ? $conPaginacion.eq(1) : $conPaginacion.eq(0);
    }

    function setCargando($grid, on) {
        var $wrap = $grid.find('.elementor-widget-container');
        if (!$wrap.length) return;
        if (on) {
            var h = $wrap.outerHeight();
            if (h > 0) $wrap.css('min-height', h);
            $wrap.addClass('ecr-carrusel-cargando').removeClass('ecr-carrusel-listo');
        } else {
            $wrap.removeClass('ecr-carrusel-cargando').addClass('ecr-carrusel-listo');
            setTimeout(function () { $wrap.css('min-height', ''); }, 300);
        }
    }

    function forzarBotonesAbajo() {
        var $grid = getCarruselGrid();
        var $nav = $grid.find('.elementor-pagination');
        if (!$nav.length) return;

        if ($nav.find('.prev').length === 0 && $nav.find('.page-numbers.prev.disabled').length === 0) {
            $nav.prepend('<span class="page-numbers prev disabled">Anterior</span>');
        }
        if ($nav.find('.next').length === 0 && $nav.find('.page-numbers.next.disabled').length === 0) {
            $nav.append('<span class="page-numbers next disabled">Siguiente</span>');
        }
    }

    forzarBotonesAbajo();

    $(document).on('click', '.elementor-element-' + LOOP_CARRUSEL + ' .elementor-pagination a', function (e) {
        var $grid = getCarruselGrid();
        if (!$grid.length || !$.contains($grid[0], this)) return;

        if ($(this).hasClass('disabled') || $(this).parent().hasClass('disabled')) {
            e.preventDefault();
            return false;
        }
        setCargando($grid, true);
    });

    $(document).on('elementor/loop/query_filter_end', function () {
        forzarBotonesAbajo();
        var $grid = getCarruselGrid();
        setCargando($grid, false);
        if (window.ECR && typeof window.ECR.decorateCarrusel === 'function') {
            window.ECR.decorateCarrusel(document);
        }
    });
});
