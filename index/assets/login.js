(function () {
  const form = document.getElementById('form-login');
  const input = document.getElementById('clave');
  const errorEl = document.getElementById('login-error');
  const btn = document.getElementById('btn-login');

  const params = new URLSearchParams(window.location.search);
  const next = params.get('next') || '/index.html';

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = !msg;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showError('');
    btn.disabled = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ key: input.value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(data.error || 'Clave incorrecta');
        input.select();
        return;
      }
      window.location.replace(next);
    } catch {
      showError('No se pudo conectar al servidor. ¿Está corriendo SERVIR.bat?');
    } finally {
      btn.disabled = false;
    }
  });
})();
