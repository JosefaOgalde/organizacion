/**
 * Joyas Mercury — forzar icono carrito → /mi-carrito/
 * Pegar en: WPCode / Insert Headers and Footers → Footer, o HTML de Elementor en Inicio.
 *
 * Usa esto SI después del CSS el icono sigue abriendo/cerrando el drawer
 * y no llega a la página Mi Carrito.
 */
(function () {
  function goCart(e) {
    var a = e.target.closest(
      "#ast-mobile-header a.cart-container, " +
        ".ast-header-break-point a.cart-container, " +
        "header a.cart-container, " +
        ".ast-site-header-cart a.cart-container"
    );
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    window.location.href = a.getAttribute("href") || "https://joyasmercury.cl/mi-carrito/";
  }
  document.addEventListener("click", goCart, true);
  document.addEventListener("touchend", goCart, true);
})();
