/**
 * Persistencia en disco vía /api/organizacion (scripts/organizacion-server.js).
 * Sin costo · archivo local en data/organizacion-live.json
 */
(function () {
  const API = '/api/organizacion';
  const TOKEN_KEY = 'organizacion_api_token';
  let debounceTimer = null;
  let lastPost = 0;
  let authRequired = false;

  function apiHeaders(json) {
    const h = json ? { 'Content-Type': 'application/json' } : {};
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) h['X-Organizacion-Token'] = token;
    return h;
  }

  function maxActualizado(datos) {
    if (!datos) return '';
    let max = datos.respaldoActualizado || '';
    (datos.clientes || []).forEach((cli) => {
      const f = cli.ficha?.actualizado || '';
      const m = cli.manualMarca?.actualizado || '';
      [f, m].forEach((t) => {
        if (t && String(t) > String(max)) max = t;
      });
    });
    return max;
  }

  async function ensureApiConfig() {
    try {
      const res = await fetch('/api/organizacion-config?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return;
      const cfg = await res.json();
      authRequired = !!cfg.authRequired;
    } catch {
      /* servidor sin config — compatibilidad */
    }
  }

  /** Consola: setOrganizacionApiToken('tu-token-del-env') */
  window.setOrganizacionApiToken = function setOrganizacionApiToken(token) {
    if (!token) {
      sessionStorage.removeItem(TOKEN_KEY);
      console.info('Token API eliminado de sessionStorage');
      return;
    }
    sessionStorage.setItem(TOKEN_KEY, String(token));
    console.info('Token API guardado en sessionStorage (solo esta pestaña)');
  };

  window.fetchOrganizacionLive = async function fetchOrganizacionLive() {
    await ensureApiConfig();
    try {
      const res = await fetch(API + '?t=' + Date.now(), {
        cache: 'no-store',
        headers: apiHeaders(false),
      });
      if (res.status === 401) {
        console.warn('API requiere token — usa setOrganizacionApiToken("...") en consola (F12)');
        return null;
      }
      if (!res.ok) return null;
      const obj = await res.json();
      if (!obj || !Array.isArray(obj.clientes) || !Array.isArray(obj.tareas)) return null;
      return obj;
    } catch {
      return null;
    }
  };

  window.persistOrganizacionToDisk = function persistOrganizacionToDisk(datos) {
    if (!datos || typeof fetch !== 'function') return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      await ensureApiConfig();
      const payload = JSON.stringify(datos);
      fetch(API, {
        method: 'POST',
        headers: apiHeaders(true),
        body: payload,
      })
        .then((res) => {
          if (res.status === 401 && authRequired) {
            console.warn('No se guardó en disco — falta token API (setOrganizacionApiToken)');
            return;
          }
          if (res.ok) lastPost = Date.now();
        })
        .catch(() => {});
    }, 600);
  };

  window.organizacionLiveEsMasReciente = function organizacionLiveEsMasReciente(local, live) {
    if (!live) return false;
    if (!local) return true;
    return maxActualizado(live) > maxActualizado(local);
  };

  window.maxActualizadoOrganizacion = maxActualizado;
})();
