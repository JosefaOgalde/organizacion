/**
 * ECR Blog — Etiquetas de categoría + fechas reales en carrusel (Loop Grid 3)
 * Pegar en widget HTML (junto al filtro o debajo del carrusel).
 * ECR_BLOG_DECORATE
 */
(function () {
    var LOOP_CARRUSEL = 'bc0cdd5';
    var ICONS = null;
    var DATE_CACHE = {};

    var SLUG_LABEL = {
        articulos: 'Articulos',
        editorial: 'Editorial',
        eventos: 'Eventos',
        prensa: 'Prensa',
        'sin-categoria': 'Sin categoría',
        uncategorized: 'Sin categoría'
    };

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

    function getCategorySlugs(item) {
        return (item.className || '').split(/\s+/).filter(function (c) {
            return c.indexOf('category-') === 0;
        }).map(function (c) {
            return c.replace('category-', '');
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

    function fetchPostDate(postId) {
        if (DATE_CACHE[postId]) return Promise.resolve(DATE_CACHE[postId]);
        return fetch('https://ecrgroup.cl/wp-json/wp/v2/posts/' + postId + '?_fields=date')
            .then(function (r) { return r.json(); })
            .then(function (p) {
                var txt = formatDate(p.date);
                DATE_CACHE[postId] = txt;
                return txt;
            })
            .catch(function () { return ''; });
    }

    function buildBadgeHtml(slug, icons) {
        var label = SLUG_LABEL[slug] || (slug.charAt(0).toUpperCase() + slug.slice(1));
        var svg = icons[label] || '';
        if (!svg) return '<div class="ecr-card-blog__badge">' + label + '</div>';
        return '<div class="ecr-card-blog__badge">' + svg + label + '</div>';
    }

    function injectBadges(item, icons) {
        var thumb = item.querySelector('.elementor-element-5e4f8fb');
        if (!thumb) return;

        var slugs = getCategorySlugs(item);
        if (!slugs.length) return;

        var existing = thumb.querySelector('.ecr-carrusel-badges');
        if (existing) existing.remove();

        var wrap = document.createElement('div');
        wrap.className = 'ecr-carrusel-badges';
        wrap.innerHTML = slugs.map(function (s) {
            return buildBadgeHtml(s, icons);
        }).join('');

        thumb.appendChild(wrap);
    }

    function injectDate(item, postId) {
        var dateEl = item.querySelector('.elementor-element-bc5fe2f .elementor-shortcode');
        if (!dateEl || !postId) return;

        fetchPostDate(postId).then(function (txt) {
            if (txt) dateEl.textContent = txt;
        });
    }

    function decorateItem(item, icons) {
        var postId = getPostId(item);
        injectBadges(item, icons);
        injectDate(item, postId);
    }

    function decorateCarrusel(root) {
        var scope = root || document;
        var grid = scope.querySelector('.elementor-element-' + LOOP_CARRUSEL);
        if (!grid) return;

        loadIcons().then(function (icons) {
            grid.querySelectorAll('.e-loop-item').forEach(function (item) {
                decorateItem(item, icons);
            });
        });
    }

    function injectStyles() {
        if (document.getElementById('ecr-blog-decorate-css')) return;
        var style = document.createElement('style');
        style.id = 'ecr-blog-decorate-css';
        style.textContent = [
            '.elementor-element-' + LOOP_CARRUSEL + ' .elementor-element-5e4f8fb {',
            '  position: relative !important;',
            '  overflow: hidden !important;',
            '}',
            '.elementor-element-' + LOOP_CARRUSEL + ' .ecr-carrusel-badges {',
            '  position: absolute;',
            '  top: 10px;',
            '  left: 10px;',
            '  z-index: 5;',
            '  display: flex;',
            '  flex-wrap: wrap;',
            '  gap: 6px;',
            '  max-width: calc(100% - 20px);',
            '}',
            '.elementor-element-' + LOOP_CARRUSEL + ' .ecr-carrusel-badges .ecr-card-blog__badge {',
            '  display: inline-flex !important;',
            '  align-items: center;',
            '  gap: 6px;',
            '  padding: 5px 10px;',
            '  border-radius: 999px;',
            '  border: 1px solid #fff;',
            '  background: rgba(0,0,0,0.45);',
            '  color: #fff;',
            '  font-size: 12px;',
            '  font-weight: 600;',
            '  line-height: 1;',
            '}',
            '.elementor-element-' + LOOP_CARRUSEL + ' .ecr-carrusel-badges .ecr-card-blog__badge svg {',
            '  display: inline-block !important;',
            '  width: 14px !important;',
            '  height: 14px !important;',
            '  flex-shrink: 0;',
            '}',
            '.elementor-element-' + LOOP_CARRUSEL + ' .elementor-element-bc5fe2f .elementor-shortcode {',
            '  font-size: 13px;',
            '  font-weight: 600;',
            '  color: #133854;',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    injectStyles();

    document.addEventListener('DOMContentLoaded', function () {
        decorateCarrusel(document);
    });

    if (window.jQuery) {
        jQuery(document).on('elementor/loop/query_filter_end', function () {
            setTimeout(function () { decorateCarrusel(document); }, 50);
        });
    }
})();
