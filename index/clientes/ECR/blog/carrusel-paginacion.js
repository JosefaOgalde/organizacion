/**
 * ECR Blog — Widget HTML debajo del Loop Grid 3 (carrusel central)
 * ECR_CARRUSEL_PAGINACION
 */
jQuery(document).ready(function ($) {
  function getCarruselGrid() {
    // Este script vive en el HTML justo debajo del loop → hermano anterior
    var $htmlWidget = $('script').filter(function () {
      return this.textContent.indexOf('ECR_CARRUSEL_PAGINACION') !== -1;
    }).last().closest('.elementor-widget-html');

    if ($htmlWidget.length) {
      var $sibling = $htmlWidget.prev('.elementor-widget-loop-grid');
      if ($sibling.length) return $sibling;
    }

    // Fallback: loop con paginación Anterior/Siguiente (no el de arriba)
    var $conPaginacion = $('.elementor-widget-loop-grid').filter(function () {
      return $(this).find('.elementor-pagination .prev, .elementor-pagination .next').length > 0;
    });
    return $conPaginacion.length > 1 ? $conPaginacion.eq(1) : $conPaginacion.eq(0);
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

  $(document).on('click', '.elementor-widget-loop-grid .elementor-pagination a', function (e) {
    var $grid = getCarruselGrid();
    if (!$.contains($grid[0], this)) return;

    if ($(this).hasClass('disabled') || $(this).parent().hasClass('disabled')) {
      e.preventDefault();
      return false;
    }
    $grid.find('.elementor-loop-container').addClass('bucle-bloqueado-abajo');
  });

  $(document).on('elementor/loop/query_filter_end', function () {
    forzarBotonesAbajo();
    setTimeout(function () {
      getCarruselGrid().find('.elementor-loop-container').removeClass('bucle-bloqueado-abajo');
    }, 40);
  });
});
