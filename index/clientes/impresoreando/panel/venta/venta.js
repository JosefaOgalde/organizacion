/* Registrador rápido de ventas Impresoreando — POST /api/impresoreando/venta */
(function () {
  const API = '/api/impresoreando';
  const API_VENTA = '/api/impresoreando/venta';
  const money = (n) =>
    Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  const $ = (id) => document.getElementById(id);

  function setStatus(msg, kind) {
    const el = $('venta-status');
    if (!el) return;
    el.textContent = msg;
    el.className = 'imp-status' + (kind ? ` is-${kind}` : '');
  }

  function pintarTotales(gastos, ventas) {
    const saldo = Math.max(0, gastos - ventas);
    $('venta-gastos').textContent = money(gastos);
    $('venta-ventas').textContent = money(ventas);
    $('venta-saldo').textContent = money(saldo);
  }

  function pintarLista(ventas) {
    const rows = (ventas || [])
      .slice()
      .reverse()
      .slice(0, 12)
      .map(
        (v) => `<tr>
          <td>${v.fecha || ''}</td>
          <td>${escapeHtml(v.descripcion || '')}<div class="imp-muted">${escapeHtml(v.canal || '')}</div></td>
          <td class="num">${money(v.montoNeto)}</td>
          <td>${escapeHtml(v.socioRegistro || '')}</td>
        </tr>`
      )
      .join('');
    $('venta-lista').innerHTML = rows || '<tr><td colspan="4">Sin ventas aún</td></tr>';
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function cargar() {
    setStatus('Cargando…');
    const res = await fetch(API, { cache: 'no-store' });
    if (!res.ok) throw new Error(`GET ${res.status}`);
    const data = await res.json();
    const gastos = (data.gastos || []).reduce((a, g) => a + Number(g.montoNeto || 0), 0);
    const ventas = (data.ventas || []).reduce((a, v) => a + Number(v.montoNeto || 0), 0);
    pintarTotales(gastos, ventas);
    pintarLista(data.ventas || []);
    const when = data.meta?.actualizado ? new Date(data.meta.actualizado).toLocaleString('es-CL') : '—';
    setStatus(`Online · ${when}`, 'ok');
    return data;
  }

  const form = $('form-venta-rapida');
  const fecha = form?.querySelector('[name=fecha]');
  if (fecha) fecha.value = new Date().toISOString().slice(0, 10);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      fecha: fd.get('fecha'),
      descripcion: fd.get('descripcion'),
      cantidad: Number(fd.get('cantidad') || 1),
      montoNeto: Number(fd.get('montoNeto')),
      canal: fd.get('canal') || '',
      notas: fd.get('notas') || '',
      socioRegistro: fd.get('socioRegistro') || 'Ambos',
    };
    setStatus('Guardando venta…', 'warn');
    try {
      const res = await fetch(API_VENTA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `POST ${res.status}`);
      const ok = $('venta-ok');
      if (ok) {
        ok.textContent = `Venta guardada online ✓ · saldo ahora ${money(json.totales?.saldo || 0)}`;
        ok.classList.add('is-on');
      }
      form.reset();
      if (fecha) fecha.value = new Date().toISOString().slice(0, 10);
      form.querySelector('[name=cantidad]').value = 1;
      form.querySelector('[name=socioRegistro]').value = payload.socioRegistro;
      await cargar();
      setStatus('Venta guardada ✓', 'ok');
    } catch (err) {
      setStatus(String(err.message || err), 'err');
    }
  });

  cargar().catch((e) => setStatus(String(e.message || e), 'err'));
})();
