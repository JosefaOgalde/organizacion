/**
 * Persistencia en disco vía /api/organizacion (scripts/organizacion-server.js).
 * Sin costo · archivo local en data/organizacion-live.json
 */
(function () {
  const API = '/api/organizacion';
  let debounceTimer = null;
  let lastPost = 0;

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

  window.fetchOrganizacionLive = async function fetchOrganizacionLive() {
    try {
      const res = await fetch(API + '?t=' + Date.now(), { cache: 'no-store' });
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
    debounceTimer = setTimeout(() => {
      const payload = JSON.stringify(datos);
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      })
        .then((res) => {
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
