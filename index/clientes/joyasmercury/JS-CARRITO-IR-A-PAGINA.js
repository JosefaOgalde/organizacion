/**
 * Joyas Mercury — forzar icono carrito → /mi-carrito/
 * (evita el drawer que se abre y se esconde)
 *
 * Pegar en WP:
 *   Apariencia → Personalizar → JS adicional (si existe)
 *   o plugin WPCode / Insert Headers and Footers → Footer
 *   o Elementor → HTML en el footer de Inicio
 */
(function () {
  var CART_URL = "https://joyasmercury.cl/mi-carrito/";

  function cartLink(el) {
    if (!el || !el.closest) return null;
    return el.closest(
      "a.cart-container, " +
        ".ast-site-header-cart a, " +
        "#ast-mobile-header .ast-header-woo-cart a, " +
        ".ast-header-woo-cart a, " +
        "a[href*='mi-carrito']"
    );
  }

  function goCart(e) {
    var a = cartLink(e.target);
    if (!a) return;
    // Solo icono del header, no otros links de menú con texto
    var inHeader =
      a.closest(".ast-site-header-cart, .ast-header-woo-cart, #ast-mobile-header, #masthead");
    if (!inHeader) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
    window.location.assign(a.getAttribute("href") || CART_URL);
  }

  document.addEventListener("click", goCart, true);
  document.addEventListener("touchstart", goCart, true);
})();
