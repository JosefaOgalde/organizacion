/**
 * ECR Blog — Widget HTML debajo del Loop Grid 3 (carrusel central)
 * Paginación + badges + fechas reales (ligero, sin bucles)
 *
 * ECR_CARRUSEL_PAGINACION
 * ECR_BLOG_DECORATE
 */

/* ========== ECR_BLOG_DECORATE ========== */
(function () {
    var LOOP_CARRUSEL = 'bc0cdd5';
    var THUMB_ID = '5e4f8fb';
    var ICONS = null;
    var META_CACHE = {};
    var decorateTimer = null;
    var isDecorating = false;
    var loopObserver = null;

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
            '  position: relative !important; overflow: hidden !important;',
            '}',
            '.elementor-element-' + LOOP_CARRUSEL + ' .ecr-carrusel-badges {',
            '  position: absolute !important; top: 8px !important; left: 8px !important;',
            '  z-index: 6 !important; display: flex !important; flex-direction: column !important;',
            '  gap: 4px !important; max-width: calc(100% - 16px) !important; pointer-events: none !important;',
            '}',
            '.elementor-element-' + LOOP_CARRUSEL + ' .ecr-carrusel-badges .ecr-card-blog__badge {',
            '  display: inline-flex !important; align-items: center !important; gap: 4px !important;',
            '  padding: 4px 10px !important; border-radius: 999px !important;',
            '  border: 1px solid #fff !important; background: rgba(0,0,0,0.65) !important;',
            '  color: #fff !important; font-size: 11px !important; font-weight: 600 !important;',
            '  white-space: nowrap !important;',
            '}',
            '.elementor-element-' + LOOP_CARRUSEL + ' .ecr-carrusel-badges .ecr-card-blog__badge svg {',
            '  width: 12px !important; height: 12px !important; flex-shrink: 0 !important;',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function formatDate(iso) {
        if (!iso || typeof iso !== 'string') return '';
        var bits = iso.split('T')[0].split('-');
        if (bits.length !== 3) return '';
        var day = parseInt(bits[2], 10);
        var month = parseInt(bits[1], 10) - 1;
        var year = parseInt(bits[0], 10);
        if (isNaN(day) || month < 0 || month > 11) return '';
        return day + ' ' + MESES[month] + ' ' + year;
    }

    function getPostId(item) {
        var m = (item.className || '').match(/\bpost-(\d+)\b/);
        return m ? m[1] : null;
    }

    function getDateEl(item) {
        return item.querySelector('.elementor-element-bc5fe2f .elementor-shortcode')
            || item.querySelector('[data-id="bc5fe2f"] .elementor-shortcode');
    }

    function getThumb(item) {
        return item.querySelector('.elementor-element-' + THUMB_ID)
            || item.querySelector('[data-id="' + THUMB_ID + '"]');
    }

    function getSlugsFromClasses(item) {
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
            return (SLUG_ORDER[a] || 99) - (SLUG_ORDER[b] || 99);
        });
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

    function slugsFromEmbedded(post) {
        var slugs = [];
        var embedded = post._embedded && post._embedded['wp:term'];
        if (!embedded) return slugs;
        embedded.forEach(function (group) {
            group.forEach(function (term) {
                if (term.taxonomy === 'category' && term.slug && !SKIP_SLUGS[term.slug]) {
                    slugs.push(term.slug);
                }
            });
        });
        return slugs;
    }

    function fetchPostsBatch(postIds) {
        var missing = postIds.filter(function (id) {
            return !Object.prototype.hasOwnProperty.call(META_CACHE, id);
        });
        if (!missing.length) {
            return Promise.resolve(META_CACHE);
        }

        var url = '/wp-json/wp/v2/posts?include=' + missing.join(',')
            + '&_fields=id,date&_embed=wp:term&per_page=' + missing.length;

        return fetch(url)
            .then(function (r) {
                if (!r.ok) throw new Error('batch');
                return r.json();
            })
            .then(function (posts) {
                if (!Array.isArray(posts)) return META_CACHE;
                posts.forEach(function (p) {
                    META_CACHE[String(p.id)] = {
                        date: formatDate(p.date),
                        slugs: slugsFromEmbedded(p)
                    };
                });
                missing.forEach(function (id) {
                    if (!META_CACHE[id]) {
                        META_CACHE[id] = { date: '', slugs: [] };
                    }
                });
                return META_CACHE;
            })
            .catch(function () {
                return META_CACHE;
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
        var key = sortSlugs(slugs).slice(0, 2).join(',');
        if (thumb.dataset.ecrBadges === key) return;

        var existing = thumb.querySelector('.ecr-carrusel-badges');
        if (existing) existing.remove();

        var wrap = document.createElement('div');
        wrap.className = 'ecr-carrusel-badges';
        wrap.setAttribute('aria-hidden', 'true');
        wrap.innerHTML = sortSlugs(slugs).slice(0, 2).map(function (s) {
            return buildBadgeHtml(s, icons);
        }).join('');

        thumb.appendChild(wrap);
        thumb.dataset.ecrBadges = key;
    }

    function injectDate(item, dateTxt) {
        if (!dateTxt) return;
        var dateEl = getDateEl(item);
        if (!dateEl || dateEl.getAttribute('data-ecr-date') === dateTxt) return;
        dateEl.textContent = dateTxt;
        dateEl.setAttribute('data-ecr-date', dateTxt);
    }

    function applyItem(item, icons, meta) {
        var thumb = getThumb(item);
        if (thumb) {
            thumb.style.position = 'relative';
            thumb.style.overflow = 'hidden';
        }

        var slugs = (meta && meta.slugs && meta.slugs.length)
            ? meta.slugs
            : getSlugsFromClasses(item);

        if (thumb && slugs.length) {
            renderBadges(thumb, slugs, icons);
        }

        if (meta && meta.date) {
            injectDate(item, meta.date);
        }
    }

    function pauseObserver() {
        if (loopObserver) loopObserver.disconnect();
    }

    function resumeObserver(loop) {
        if (loopObserver && loop) {
            loopObserver.observe(loop, { childList: true, subtree: false });
        }
    }

    function getCarruselGrid(root) {
        return (root || document).querySelector('.elementor-element-' + LOOP_CARRUSEL);
    }

    function decorateCarrusel(root) {
        if (isDecorating) return;

        var grid = getCarruselGrid(root);
        if (!grid) return;

        var items = grid.querySelectorAll('.e-loop-item');
        if (!items.length) return;

        var work = [];
        items.forEach(function (item) {
            var postId = getPostId(item);
            if (!postId) return;
            if (item.dataset.ecrDecorated === postId) return;
            work.push({ item: item, postId: postId });
        });

        if (!work.length) return;

        isDecorating = true;
        var loop = grid.querySelector('.elementor-loop-container');
        pauseObserver();

        loadIcons()
            .then(function (icons) {
                return fetchPostsBatch(work.map(function (w) { return w.postId; }))
                    .then(function () {
                        work.forEach(function (w) {
                            var meta = META_CACHE[w.postId] || { date: '', slugs: [] };
                            applyItem(w.item, icons, meta);
                            w.item.dataset.ecrDecorated = w.postId;
                        });
                    });
            })
            .finally(function () {
                isDecorating = false;
                resumeObserver(loop);
            });
    }

    function scheduleDecorate() {
        if (decorateTimer) clearTimeout(decorateTimer);
        decorateTimer = setTimeout(function () {
            decorateCarrusel(document);
        }, 250);
    }

    function resetAndDecorate() {
        var grid = getCarruselGrid(document);
        if (grid) {
            grid.querySelectorAll('.e-loop-item').forEach(function (item) {
                delete item.dataset.ecrDecorated;
            });
        }
        scheduleDecorate();
    }

    function bindObserver() {
        var grid = getCarruselGrid(document);
        if (!grid || grid.dataset.ecrDecorateObserved) return;

        var loop = grid.querySelector('.elementor-loop-container');
        if (!loop) return;

        grid.dataset.ecrDecorateObserved = '1';
        loopObserver = new MutationObserver(function (mutations) {
            var added = false;
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
                    added = true;
                    break;
                }
            }
            if (added) scheduleDecorate();
        });
        loopObserver.observe(loop, { childList: true, subtree: false });
    }

    injectStyles();

    window.ECR = window.ECR || {};
    window.ECR.decorateCarrusel = resetAndDecorate;

    function init() {
        bindObserver();
        scheduleDecorate();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    if (window.jQuery) {
        jQuery(window).on('elementor/frontend/init', function () {
            if (window.elementorFrontend && elementorFrontend.hooks) {
                elementorFrontend.hooks.addAction('frontend/element_ready/loop-grid.default', function ($scope) {
                    var el = $scope[0];
                    if (el && el.classList.contains('elementor-element-' + LOOP_CARRUSEL)) {
                        scheduleDecorate();
                    }
                });
            }
        });
        jQuery(document).on('elementor/loop/query_filter_end', resetAndDecorate);
    }
})();

/* ========== ECR_CARRUSEL_PAGINACION ========== */
jQuery(document).ready(function ($) {
    var LOOP_CARRUSEL = 'bc0cdd5';

    function getCarruselGrid() {
        return $('.elementor-element-' + LOOP_CARRUSEL);
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

        if (!$nav.find('.prev').length && !$nav.find('.page-numbers.prev.disabled').length) {
            $nav.prepend('<span class="page-numbers prev disabled">Anterior</span>');
        }
        if (!$nav.find('.next').length && !$nav.find('.page-numbers.next.disabled').length) {
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
        setCargando(getCarruselGrid(), false);
    });
});
