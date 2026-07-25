<?php
/**
 * WPCode → PHP Snippet → Auto Insert → Run everywhere
 * Hook: Frontend Footer · Priority 99 · Active
 *
 * Reemplazá el contenido del fragmento JM-CARRITO-IR-PAGINA por este.
 */
add_action('wp_footer', function () {
	if (is_admin()) {
		return;
	}
	?>
	<script id="jm-carrito-ir-pagina">
	(function () {
	  var CART_URL = "https://joyasmercury.cl/mi-carrito/";
	  var going = false;

	  function isCartTarget(el) {
	    if (!el || !el.closest) return false;
	    return !!el.closest(
	      ".ast-site-header-cart, .ast-header-woo-cart, .ast-addon-cart-wrap, .ast-site-header-cart-li, a.cart-container"
	    );
	  }

	  function go(e) {
	    if (!isCartTarget(e.target)) return;
	    if (going) return;
	    going = true;
	    e.preventDefault();
	    e.stopImmediatePropagation();
	    e.stopPropagation();
	    // Cerrar drawer si Astra lo abrió
	    document.documentElement.classList.remove("ast-cart-drawer-open");
	    document.body.classList.remove("ast-cart-drawer-open");
	    var drawer = document.querySelector(".astra-cart-drawer");
	    if (drawer) drawer.classList.remove("active");
	    var overlay = document.querySelector(".astra-mobile-cart-overlay");
	    if (overlay) overlay.classList.remove("active");
	    window.location.replace(CART_URL);
	  }

	  document.addEventListener("click", go, true);
	  document.addEventListener("touchstart", go, true);
	  document.addEventListener("touchend", go, true);
	})();
	</script>
	<?php
}, 99);
