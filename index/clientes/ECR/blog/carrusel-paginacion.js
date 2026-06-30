/**
 * ECR Blog — Paginación AJAX del carrusel central (loop bc0cdd5)
 * Pegar en widget HTML debajo del Loop Grid del carrusel.
 */
jQuery(document).ready(function ($) {
  var CARRUSEL_SELECTOR = '[data-id="bc0cdd5"]';

  function getCarruselGrid() {
    return $(CARRUSEL_SELECTOR).closest('.elementor-widget-loop-grid');
  }

  function forzarBotonesCarrusel() {
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

  forzarBotonesCarrusel();

  $(document).on('click', CARRUSEL_SELECTOR + ' .elementor-pagination a', function (e) {
    if ($(this).hasClass('disabled') || $(this).parent().hasClass('disabled')) {
      e.preventDefault();
      return false;
    }
    getCarruselGrid().find('.elementor-loop-container').addClass('bucle-bloqueado-abajo');
  });

  /** Tras filtro o paginación AJAX: restaurar botones del carrusel */
  $(document).on('elementor/loop/query_filter_end', function () {
    forzarBotonesCarrusel();
    setTimeout(function () {
      getCarruselGrid().find('.elementor-loop-container').removeClass('bucle-bloqueado-abajo');
    }, 40);
  });
});
