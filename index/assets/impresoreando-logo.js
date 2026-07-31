/**
 * Logo Impresoreando — fuente única + override editable.
 * Override en organizacion_v2 → cli-impresoreando.ficha.landing.logoUrl
 * (URL relativa o data URL). Fallback: identidad/logo-ima2.png
 */
(function () {
  const STORAGE_KEY = 'organizacion_v2';
  const CLI_ID = 'cli-impresoreando';
  const DEFAULT_FILE = 'logo-ima2.png';
  const DEFAULT_V = 'imp-logo-20260731';

  function leerOverride() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return '';
      const datos = JSON.parse(raw);
      const cli = (datos.clientes || []).find((x) => x.id === CLI_ID);
      const url = cli?.ficha?.landing?.logoUrl;
      return typeof url === 'string' && url.trim() ? url.trim() : '';
    } catch {
      return '';
    }
  }

  /** @param {string} [base] ruta relativa a identidad/ (ej. './identidad/' o '../identidad/') */
  window.impresoreandoLogoSrc = function impresoreandoLogoSrc(base) {
    const override = leerOverride();
    if (override) {
      if (/^data:image\//i.test(override) || /^https?:\/\//i.test(override) || override.startsWith('/')) {
        return override;
      }
      // relativo al cliente
      return override;
    }
    const root = base != null ? base : './identidad/';
    return `${root}${DEFAULT_FILE}?v=${DEFAULT_V}`;
  };

  window.impresoreandoLogoOverride = leerOverride;
})();
