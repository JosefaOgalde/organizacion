<?php
/**
 * WPCode → PHP Snippet → Auto Insert → Run everywhere
 * Hook: Frontend Footer (wp_footer) · Priority 99 · Active
 *
 * El menú hamburguesa ya va a /mi-carrito/.
 * Este código hace que el ICONO del header haga lo mismo.
 */
add_action('wp_footer', function () {
	if (is_admin()) {
		return;
	}
	?>
	<script id="jm-carrito-ir-pagina">
	(function () {
	  var CART_URL = "https://joyasmercury.cl/mi-carrito/";

	  function findCartAnchor(el) {
	    if (!el || !el.closest) return null;
	    // clic en svg / span / i dentro del icono
	    var wrap = el.closest(
	      ".ast-site-header-cart, .ast-header-woo-cart, .ast-addon-cart-wrap, .ast-site-header-cart-li"
	    );
	    if (!wrap) return null;
	    return (
	      wrap.querySelector("a.cart-container") ||
	      wrap.querySelector("a[href*='mi-carrito']") ||
	      wrap.querySelector("a[href*='cart']") ||
	      (wrap.tagName === "A" ? wrap : null)
	    );
	  }

	  function go(e) {
	    var a = findCartAnchor(e.target);
	    if (!a) return;
	    e.preventDefault();
	    e.stopImmediatePropagation();
	    e.stopPropagation();
	    window.location.href = a.getAttribute("href") || CART_URL;
	    return false;
	  }

	  // capture=true: gana a Astra
	  document.addEventListener("click", go, true);
	  document.addEventListener("touchend", go, true);

	  // por si Astra re-renderiza el header
	  document.addEventListener("DOMContentLoaded", function () {
	    document.querySelectorAll(
	      ".ast-site-header-cart a, .ast-header-woo-cart a, a.cart-container"
	    ).forEach(function (a) {
	      a.addEventListener("click", go, true);
	    });
	  });
	})();
	</script>
	<?php
}, 99);
