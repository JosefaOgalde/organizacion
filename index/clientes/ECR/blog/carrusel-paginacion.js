/**
 * ECR Blog — Widget HTML debajo del Loop Grid 3 (carrusel central)
 * ECR_CARRUSEL_PAGINACION
 */
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
    });
});
