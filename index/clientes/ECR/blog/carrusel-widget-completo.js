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
    var ICONS = null;
    var DATE_CACHE = {};
    var CAT_CACHE = {};

    var SLUG_LABEL = {
        articulos: 'Articulos',
        editorial: 'Editorial',
        eventos: 'Eventos',
        prensa: 'Prensa',
        'sin-categoria': 'Sin categoría',
        uncategorized: 'Sin categoría'
    };

    var SKIP_SLUGS = { 'sin-categoria': true, uncategorized: true };

    var MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

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
            return Promise.resolve({
                date: DATE_CACHE[postId],
                slugs: CAT_CACHE[postId]
            });
        }

        return fetch('/wp-json/wp/v2/posts/' + postId + '?_fields=date,categories')
            .then(function (r) { return r.json(); })
            .then(function (p) {
                var dateTxt = formatDate(p.date);
                DATE_CACHE[postId] = dateTxt;

                var slugs = CAT_CACHE[postId];
                if (!slugs && p.categories && p.categories.length) {
                    return Promise.all(p.categories.map(function (catId) {
                        return fetch('/wp-json/wp/v2/categories/' + catId + '?_fields=slug,name')
                            .then(function (r) { return r.json(); })
                            .catch(function () { return null; });
                    })).then(function (cats) {
                        slugs = cats.filter(Boolean).map(function (c) { return c.slug; })
                            .filter(function (slug) { return !SKIP_SLUGS[slug]; });
                        CAT_CACHE[postId] = slugs;
                        return { date: dateTxt, slugs: slugs };
                    });
                }

                CAT_CACHE[postId] = slugs || [];
                return { date: dateTxt, slugs: CAT_CACHE[postId] };
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
        if (!thumb || !slugs.length) return;

        var existing = thumb.querySelector('.ecr-carrusel-badges');
        if (existing) existing.remove();

        var wrap = document.createElement('div');
        wrap.className = 'ecr-carrusel-badges';
        wrap.setAttribute('aria-hidden', 'true');
        wrap.innerHTML = slugs.slice(0, 2).map(function (s) {
            return buildBadgeHtml(s, icons);
        }).join('');

        thumb.appendChild(wrap);
    }

    function injectBadges(item, icons, slugs) {
        var thumb = item.querySelector('.elementor-element-5e4f8fb');
        if (!thumb) return;

        if (slugs && slugs.length) {
            renderBadges(thumb, slugs, icons);
            return;
        }

        var fromClass = getCategorySlugsFromClass(item);
        if (fromClass.length) {
            renderBadges(thumb, fromClass, icons);
        }
    }

    function injectDate(item, dateTxt) {
        var dateEl = item.querySelector('.elementor-element-bc5fe2f .elementor-shortcode');
        if (!dateEl) return;
        if (dateTxt) dateEl.textContent = dateTxt;
    }

    function decorateItem(item, icons) {
        var postId = getPostId(item);
        var classSlugs = getCategorySlugsFromClass(item);

        injectBadges(item, icons, classSlugs);

        if (!postId) return;

        fetchPostMeta(postId).then(function (meta) {
            if (meta.slugs && meta.slugs.length) {
                var thumb = item.querySelector('.elementor-element-5e4f8fb');
                if (thumb) renderBadges(thumb, meta.slugs, icons);
            }
            injectDate(item, meta.date);
        });
    }

    function getCarruselGrid(root) {
        var scope = root || document;
        return scope.querySelector('.elementor-element-' + LOOP_CARRUSEL);
    }

    function decorateCarrusel(root) {
        var grid = getCarruselGrid(root);
        if (!grid) return;

        loadIcons().then(function (icons) {
            grid.querySelectorAll('.e-loop-item').forEach(function (item) {
                decorateItem(item, icons);
            });
        });
    }

    window.ECR = window.ECR || {};
    window.ECR.decorateCarrusel = decorateCarrusel;

    document.addEventListener('DOMContentLoaded', function () {
        decorateCarrusel(document);
    });

    if (window.jQuery) {
        jQuery(document).on('elementor/loop/query_filter_end', function () {
            setTimeout(function () { decorateCarrusel(document); }, 80);
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
