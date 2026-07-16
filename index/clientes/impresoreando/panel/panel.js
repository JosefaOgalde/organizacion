/* Impresoreando — panel socios (persistencia /api/impresoreando) */
(function () {
  const API = '/api/impresoreando';
  let data = null;
  let dirty = false;

  const $ = (sel) => document.querySelector(sel);
  const money = (n) =>
    Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  const uid = (p) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  function setStatus(msg, kind) {
    const el = $('#imp-status');
    el.textContent = msg;
    el.className = 'imp-status' + (kind ? ` is-${kind}` : '');
  }

  function markDirty() {
    dirty = true;
    setStatus('Cambios sin guardar', 'warn');
  }

  async function load() {
    setStatus('Cargando…');
    const res = await fetch(API, { cache: 'no-store' });
    if (!res.ok) throw new Error(`GET ${res.status}`);
    data = await res.json();
    if (normalizarSociedad(data)) dirty = true;
    else dirty = false;
    const when = data.meta?.actualizado ? new Date(data.meta.actualizado).toLocaleString('es-CL') : '—';
    setStatus(dirty ? 'Datos actualizados (guardar para fijar)' : `Actualizado: ${when}`, dirty ? 'warn' : 'ok');
    renderAll();
  }

  /** Gastos de ambos; socios Josefa + Nicolás; capital aportado por Nicolás. */
  function normalizarSociedad(d) {
    if (!d || typeof d !== 'object') return false;
    let changed = false;
    d.meta = d.meta || {};
    const sociosOk =
      Array.isArray(d.meta.socios) &&
      d.meta.socios.some((s) => /nicol/i.test(s.nombre || '')) &&
      d.meta.socios.some((s) => /josefa/i.test(s.nombre || ''));
    if (!sociosOk) {
      d.meta.socios = [
        { id: 'socio-a', nombre: 'Josefa', pct: 50 },
        { id: 'socio-b', nombre: 'Nicolás', pct: 50 },
      ];
      changed = true;
    }
    const gastos = Array.isArray(d.gastos) ? d.gastos : [];
    for (const g of gastos) {
      const quien = String(g.socioRegistro || '').trim();
      if (!quien || /^josefa$/i.test(quien) || /^socio$/i.test(quien)) {
        g.socioRegistro = 'Ambos';
        changed = true;
      }
    }
    const capitalNeto = gastos.reduce((a, g) => a + Number(g.montoNeto || 0), 0);
    const cap = d.meta.capital && typeof d.meta.capital === 'object' ? d.meta.capital : {};
    const nextCap = {
      aportadoPor: 'Nicolás',
      deudaPctJosefa: 50,
      montoNetoClp: capitalNeto,
      deudaJosefaClp: Math.round(capitalNeto * 0.5),
      nota:
        'Nicolás puso el capital. Josefa debe el 50% de ese capital a Nicolás. Todos los gastos de la sociedad son de ambos.',
    };
    if (
      cap.aportadoPor !== nextCap.aportadoPor ||
      Number(cap.deudaJosefaClp) !== nextCap.deudaJosefaClp ||
      Number(cap.montoNetoClp) !== nextCap.montoNetoClp
    ) {
      d.meta.capital = { ...cap, ...nextCap };
      changed = true;
    }
    if (!/nicol/i.test(String(d.meta.notas || ''))) {
      d.meta.notas =
        'Emprendimiento 3D · sociedad 50/50 Josefa + Nicolás. Todos los gastos son de ambos. Nicolás aportó el capital; Josefa le debe el 50%.';
      changed = true;
    }
    return changed;
  }

  async function save() {
    if (!data) return;
    setStatus('Guardando…');
    data.meta = data.meta || {};
    data.meta.actualizado = new Date().toISOString();
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || `POST ${res.status}`);
    }
    dirty = false;
    setStatus('Guardado online ✓', 'ok');
  }

  function sum(arr, key = 'montoNeto') {
    return (arr || []).reduce((a, x) => a + Number(x[key] || 0), 0);
  }

  function costoHoraImpresora() {
    const p = data.parametros || {};
    return Number(p.tarifaKwhClp || 0) * Number(p.consumoImpresoraKw || 0);
  }

  function costoProducto(prod) {
    const p = data.parametros || {};
    const filamento =
      (Number(prod.filamentoGramos || 0) / 1000) * Number(prod.costoFilamentoKgClp || 0);
    const luz = Number(prod.horasImpresion || 0) * costoHoraImpresora();
    const pintado =
      (Number(prod.minutosPintado || 0) / 60) * Number(p.valorHoraManoObraClp || 0);
    const metal = Number(prod.unidadesMetal || 0) * Number(p.costoAnilloMetalLlaveroClp || 0);
    const bolsa = Number(prod.unidadesBolsa || 0) * Number(p.costoBolsaEntregaClp || 0);
    const total = filamento + luz + pintado + metal + bolsa;
    return { filamento, luz, pintado, metal, bolsa, total };
  }

  function renderResumen() {
    const gastos = sum(data.gastos);
    const ventas = sum(data.ventas);
    const operacion = sum((data.operacion || []).filter((x) => Number(x.montoNeto) !== 0));
    const ads = Number(data.planAds?.presupuestoMensualClp || 0);
    const resultado = ventas - gastos - operacion;
    const cadaUnoGastos = gastos / 2;
    const cadaUnoResultado = resultado / 2;
    const cap = data.meta?.capital || {};
    const deuda = Number(cap.deudaJosefaClp != null ? cap.deudaJosefaClp : cadaUnoGastos);

    const orden = (data.gastos || []).filter((g) => g.ordenId === '312435');
    const totalOrden = sum(orden);

    $('#tab-resumen').innerHTML = `
      <div class="imp-grid">
        <div class="imp-kpi"><span>Gastos totales (ambos)</span><strong>${money(gastos)}</strong></div>
        <div class="imp-kpi"><span>Ventas</span><strong>${money(ventas)}</strong></div>
        <div class="imp-kpi"><span>Operación (luz etc.)</span><strong>${money(operacion)}</strong></div>
        <div class="imp-kpi"><span>Resultado aprox.</span><strong>${money(resultado)}</strong></div>
        <div class="imp-kpi"><span>50% cada socio (gastos)</span><strong>${money(cadaUnoGastos)}</strong></div>
        <div class="imp-kpi"><span>50% cada socio (resultado)</span><strong>${money(cadaUnoResultado)}</strong></div>
      </div>
      <div class="imp-card">
        <h2>Sociedad</h2>
        <p class="imp-muted">${(data.meta?.socios || []).map((s) => `${s.nombre} ${s.pct}%`).join(' · ') || 'Josefa 50% · Nicolás 50%'}</p>
        <p>Instagram: <strong>${data.meta?.instagram || '@impresoreando'}</strong></p>
        <p class="imp-muted">Orden #312435 (PAGADO): <strong>${money(totalOrden)}</strong> — coincide con total boleta $652.290 si los ítems están completos.</p>
        <p class="imp-deuda"><strong>Capital:</strong> lo aportó <strong>Nicolás</strong>. Todos los gastos son de <strong>ambos</strong>. Josefa le debe a Nicolás el <strong>50%</strong> del capital (${money(deuda)}).</p>
      </div>
      <div class="imp-card">
        <h2>Cómo usar con tu socio</h2>
        <ol class="imp-list">
          <li>Abrir este panel en el navegador (misma red o túnel público).</li>
          <li>Agregar gastos/ventas/notas en las pestañas (quien = Ambos).</li>
          <li>Pulsar <strong>Guardar online</strong> — queda en <code>data/impresoreando-live.json</code>.</li>
          <li>El otro socio recarga o entra al mismo link y ve lo actualizado.</li>
        </ol>
        <p class="imp-muted">Presupuesto ads mes (plan): ${money(ads)}</p>
      </div>
    `;
  }

  function renderGastos() {
    const rows = (data.gastos || [])
      .slice()
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
      .map(
        (g) => `
      <tr>
        <td>${escapeHtml(g.fecha || '')}</td>
        <td>${escapeHtml(g.categoria || '')}</td>
        <td>${escapeHtml(g.descripcion || '')}<div class="imp-muted">${escapeHtml(g.proveedor || '')}</div></td>
        <td class="num ${Number(g.montoNeto) < 0 ? 'imp-neg' : 'imp-pos'}">${money(g.montoNeto)}</td>
        <td>${escapeHtml(g.socioRegistro || '')}</td>
        <td><button type="button" class="imp-btn imp-btn--danger" data-del-gasto="${g.id}">✕</button></td>
      </tr>`
      )
      .join('');

    $('#tab-gastos').innerHTML = `
      <div class="imp-card">
        <h2>Gastos registrados (${money(sum(data.gastos))})</h2>
        <p class="imp-muted">Todos los gastos de la sociedad son de <strong>ambos</strong> (Josefa + Nicolás).</p>
        <div class="imp-table-wrap">
          <table class="imp-table">
            <thead><tr><th>Fecha</th><th>Cat.</th><th>Descripción</th><th>Monto</th><th>Quién</th><th></th></tr></thead>
            <tbody>${rows || '<tr><td colspan="6">Sin gastos</td></tr>'}</tbody>
          </table>
        </div>
      </div>
      <div class="imp-card">
        <h3>Agregar gasto</h3>
        <form class="imp-form" id="form-gasto">
          <label>Fecha<input name="fecha" type="date" required value="${today()}" /></label>
          <label>Categoría
            <select name="categoria">
              <option value="equipo">equipo</option>
              <option value="filamento">filamento</option>
              <option value="repuesto">repuesto</option>
              <option value="herramienta">herramienta</option>
              <option value="empaque">empaque</option>
              <option value="metal">metal / herrajes</option>
              <option value="envio">envío</option>
              <option value="marketing">marketing</option>
              <option value="otro">otro</option>
            </select>
          </label>
          <label>Descripción<input name="descripcion" required placeholder="Ej. anillos metal llaveros" /></label>
          <label>Proveedor<input name="proveedor" placeholder="AliExpress / Líder / …" /></label>
          <label>Monto CLP<input name="montoNeto" type="number" required step="1" /></label>
          <label>Quién
            <select name="socioRegistro">
              <option value="Ambos" selected>Ambos</option>
              <option value="Josefa">Josefa</option>
              <option value="Nicolás">Nicolás</option>
            </select>
          </label>
          <label>Notas<textarea name="notas" placeholder="Opcional"></textarea></label>
          <div class="imp-form-actions">
            <button class="imp-btn imp-btn--primary" type="submit">Agregar gasto</button>
          </div>
        </form>
      </div>
    `;

    $('#form-gasto').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      data.gastos.push({
        id: uid('gas'),
        fecha: fd.get('fecha'),
        categoria: fd.get('categoria'),
        descripcion: fd.get('descripcion'),
        proveedor: fd.get('proveedor') || '',
        cantidad: 1,
        montoNeto: Number(fd.get('montoNeto')),
        notas: fd.get('notas') || '',
        ordenId: '',
        socioRegistro: fd.get('socioRegistro') || '',
      });
      markDirty();
      renderAll();
    });

    $('#tab-gastos').querySelectorAll('[data-del-gasto]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-gasto');
        data.gastos = data.gastos.filter((g) => g.id !== id);
        markDirty();
        renderAll();
      });
    });
  }

  function renderVentas() {
    const rows = (data.ventas || [])
      .map(
        (v) => `
      <tr>
        <td>${escapeHtml(v.fecha || '')}</td>
        <td>${escapeHtml(v.descripcion || '')}</td>
        <td class="num">${v.cantidad || 1}</td>
        <td class="num">${money(v.montoNeto)}</td>
        <td>${escapeHtml(v.canal || '')}</td>
        <td><button type="button" class="imp-btn imp-btn--danger" data-del-venta="${v.id}">✕</button></td>
      </tr>`
      )
      .join('');

    $('#tab-ventas').innerHTML = `
      <div class="imp-card">
        <h2>Ventas (${money(sum(data.ventas))})</h2>
        <p class="imp-muted">Aún no hay ecommerce vivo — registra aquí pedidos IG / WhatsApp / ferias.</p>
        <div class="imp-table-wrap">
          <table class="imp-table">
            <thead><tr><th>Fecha</th><th>Detalle</th><th>Cant.</th><th>Total</th><th>Canal</th><th></th></tr></thead>
            <tbody>${rows || '<tr><td colspan="6">Sin ventas aún</td></tr>'}</tbody>
          </table>
        </div>
      </div>
      <div class="imp-card">
        <h3>Registrar venta</h3>
        <form class="imp-form" id="form-venta">
          <label>Fecha<input name="fecha" type="date" required value="${today()}" /></label>
          <label>Descripción<input name="descripcion" required placeholder="Llavero x3" /></label>
          <label>Cantidad<input name="cantidad" type="number" min="1" value="1" /></label>
          <label>Total cobrado CLP<input name="montoNeto" type="number" required /></label>
          <label>Canal<input name="canal" placeholder="Instagram / WhatsApp / feria" /></label>
          <label>Quién
            <select name="socioRegistro">
              <option value="Ambos" selected>Ambos</option>
              <option value="Josefa">Josefa</option>
              <option value="Nicolás">Nicolás</option>
            </select>
          </label>
          <label>Notas<textarea name="notas"></textarea></label>
          <div class="imp-form-actions"><button class="imp-btn imp-btn--primary" type="submit">Agregar venta</button></div>
        </form>
      </div>
    `;

    $('#form-venta').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      data.ventas = data.ventas || [];
      data.ventas.push({
        id: uid('ven'),
        fecha: fd.get('fecha'),
        descripcion: fd.get('descripcion'),
        cantidad: Number(fd.get('cantidad') || 1),
        montoNeto: Number(fd.get('montoNeto')),
        canal: fd.get('canal') || '',
        notas: fd.get('notas') || '',
        socioRegistro: fd.get('socioRegistro') || '',
      });
      markDirty();
      renderAll();
    });

    $('#tab-ventas').querySelectorAll('[data-del-venta]').forEach((btn) => {
      btn.addEventListener('click', () => {
        data.ventas = data.ventas.filter((v) => v.id !== btn.getAttribute('data-del-venta'));
        markDirty();
        renderAll();
      });
    });
  }

  function renderOperacion() {
    const p = data.parametros || {};
    const rows = (data.operacion || [])
      .map(
        (o) => `
      <tr>
        <td>${escapeHtml(o.fecha || '')}</td>
        <td>${escapeHtml(o.categoria || '')}</td>
        <td>${escapeHtml(o.descripcion || '')}</td>
        <td class="num">${money(o.montoNeto)}</td>
        <td><button type="button" class="imp-btn imp-btn--danger" data-del-op="${o.id}">✕</button></td>
      </tr>`
      )
      .join('');

    $('#tab-operacion').innerHTML = `
      <div class="imp-card">
        <h2>Parámetros (luz / mano de obra / empaque)</h2>
        <form class="imp-form" id="form-params">
          <label>Tarifa luz $/kWh<input name="tarifaKwhClp" type="number" value="${p.tarifaKwhClp || 180}" /></label>
          <label>Consumo impresora kW<input name="consumoImpresoraKw" type="number" step="0.01" value="${p.consumoImpresoraKw || 0.22}" /></label>
          <label>Valor hora pintado/mano obra<input name="valorHoraManoObraClp" type="number" value="${p.valorHoraManoObraClp || 5000}" /></label>
          <label>Anillo metal llavero $<input name="costoAnilloMetalLlaveroClp" type="number" value="${p.costoAnilloMetalLlaveroClp || 150}" /></label>
          <label>Bolsa entrega $<input name="costoBolsaEntregaClp" type="number" value="${p.costoBolsaEntregaClp || 50}" /></label>
          <label>Margen objetivo %<input name="margenObjetivoPct" type="number" value="${p.margenObjetivoPct || 40}" /></label>
          <div class="imp-form-actions">
            <button class="imp-btn imp-btn--primary" type="submit">Guardar parámetros</button>
            <span class="imp-muted">Costo luz/hora impresora ≈ ${money(costoHoraImpresora())}</span>
          </div>
        </form>
      </div>
      <div class="imp-card">
        <h2>Costos operacionales</h2>
        <div class="imp-table-wrap">
          <table class="imp-table">
            <thead><tr><th>Fecha</th><th>Cat.</th><th>Detalle</th><th>Monto</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <form class="imp-form" id="form-op">
          <label>Fecha<input name="fecha" type="date" value="${today()}" required /></label>
          <label>Categoría
            <select name="categoria">
              <option value="luz">luz</option>
              <option value="internet">internet</option>
              <option value="arriendo">arriendo</option>
              <option value="transporte">transporte</option>
              <option value="otro">otro</option>
            </select>
          </label>
          <label>Descripción<input name="descripcion" required /></label>
          <label>Monto CLP<input name="montoNeto" type="number" required /></label>
          <div class="imp-form-actions"><button class="imp-btn imp-btn--primary" type="submit">Agregar</button></div>
        </form>
      </div>
    `;

    $('#form-params').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      data.parametros = {
        tarifaKwhClp: Number(fd.get('tarifaKwhClp')),
        consumoImpresoraKw: Number(fd.get('consumoImpresoraKw')),
        valorHoraManoObraClp: Number(fd.get('valorHoraManoObraClp')),
        costoAnilloMetalLlaveroClp: Number(fd.get('costoAnilloMetalLlaveroClp')),
        costoBolsaEntregaClp: Number(fd.get('costoBolsaEntregaClp')),
        margenObjetivoPct: Number(fd.get('margenObjetivoPct')),
      };
      markDirty();
      renderAll();
    });

    $('#form-op').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      data.operacion = data.operacion || [];
      data.operacion.push({
        id: uid('op'),
        fecha: fd.get('fecha'),
        categoria: fd.get('categoria'),
        descripcion: fd.get('descripcion'),
        montoNeto: Number(fd.get('montoNeto')),
        notas: '',
        socioRegistro: 'Socio',
      });
      markDirty();
      renderAll();
    });

    $('#tab-operacion').querySelectorAll('[data-del-op]').forEach((btn) => {
      btn.addEventListener('click', () => {
        data.operacion = data.operacion.filter((o) => o.id !== btn.getAttribute('data-del-op'));
        markDirty();
        renderAll();
      });
    });
  }

  function renderCostos() {
    const margen = Number(data.parametros?.margenObjetivoPct || 40) / 100;
    const blocks = (data.productos || [])
      .map((prod) => {
        const c = costoProducto(prod);
        const sugeridoCosto = c.total / (1 - margen);
        return `
        <div class="imp-card">
          <h3>${escapeHtml(prod.nombre)}</h3>
          <div class="imp-grid">
            <div class="imp-kpi"><span>Filamento</span><strong>${money(c.filamento)}</strong></div>
            <div class="imp-kpi"><span>Luz (impresión)</span><strong>${money(c.luz)}</strong></div>
            <div class="imp-kpi"><span>Pintado / MO</span><strong>${money(c.pintado)}</strong></div>
            <div class="imp-kpi"><span>Metal</span><strong>${money(c.metal)}</strong></div>
            <div class="imp-kpi"><span>Bolsa</span><strong>${money(c.bolsa)}</strong></div>
            <div class="imp-kpi"><span>Costo unitario</span><strong>${money(c.total)}</strong></div>
            <div class="imp-kpi"><span>Precio lista actual</span><strong>${money(prod.precioVentaSugeridoClp)}</strong></div>
            <div class="imp-kpi"><span>Precio c/ margen ${Math.round(margen * 100)}%</span><strong>${money(sugeridoCosto)}</strong></div>
          </div>
          <p class="imp-muted">${prod.filamentoGramos || 0}g · ${prod.horasImpresion || 0}h impresión · ${prod.minutosPintado || 0} min pintado · metal×${prod.unidadesMetal || 0} · bolsa×${prod.unidadesBolsa || 0}</p>
        </div>`;
      })
      .join('');

    $('#tab-costos').innerHTML = `
      <div class="imp-card">
        <h2>Costos por producto</h2>
        <p class="imp-muted">Incluye filamento, luz por horas de impresión, tiempo de pintado, metal (llaveros) y bolsa de entrega.</p>
      </div>
      ${blocks || '<div class="imp-card">Sin productos</div>'}
      <div class="imp-card">
        <h3>Agregar / ajustar producto</h3>
        <form class="imp-form" id="form-prod">
          <label>Nombre<input name="nombre" required placeholder="Llavero perro" /></label>
          <label>Gramos filamento<input name="filamentoGramos" type="number" step="0.1" value="12" /></label>
          <label>$ / kg filamento<input name="costoFilamentoKgClp" type="number" value="17986" /></label>
          <label>Horas impresión<input name="horasImpresion" type="number" step="0.1" value="1.2" /></label>
          <label>Minutos pintado<input name="minutosPintado" type="number" value="15" /></label>
          <label>Unidades metal<input name="unidadesMetal" type="number" value="1" /></label>
          <label>Bolsas<input name="unidadesBolsa" type="number" value="1" /></label>
          <label>Precio venta $<input name="precioVentaSugeridoClp" type="number" value="4990" /></label>
          <div class="imp-form-actions"><button class="imp-btn imp-btn--primary" type="submit">Agregar producto</button></div>
        </form>
      </div>
    `;

    $('#form-prod').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      data.productos = data.productos || [];
      data.productos.push({
        id: uid('prod'),
        nombre: fd.get('nombre'),
        activo: true,
        filamentoGramos: Number(fd.get('filamentoGramos')),
        costoFilamentoKgClp: Number(fd.get('costoFilamentoKgClp')),
        horasImpresion: Number(fd.get('horasImpresion')),
        minutosPintado: Number(fd.get('minutosPintado')),
        unidadesMetal: Number(fd.get('unidadesMetal')),
        unidadesBolsa: Number(fd.get('unidadesBolsa')),
        precioVentaSugeridoClp: Number(fd.get('precioVentaSugeridoClp')),
        notas: '',
      });
      markDirty();
      renderAll();
    });
  }

  function renderAds() {
    const plan = data.planAds || {};
    const canales = (plan.canales || [])
      .map(
        (c) => `<li><strong>${escapeHtml(c.canal)}</strong> — ${money(c.presupuestoClp)} · ${escapeHtml(c.objetivo || '')}<div class="imp-muted">${escapeHtml(c.notas || '')}</div></li>`
      )
      .join('');
    const hitos = (plan.hitos || []).map((h) => `<li>${escapeHtml(h)}</li>`).join('');
    const kpi = (plan.kpi || []).map((k) => `<li>${escapeHtml(k)}</li>`).join('');

    $('#tab-ads').innerHTML = `
      <div class="imp-card">
        <h2>Plan paid — bajo presupuesto (arranque)</h2>
        <p>Fase: <strong>${escapeHtml(plan.fase || '')}</strong></p>
        <p>Presupuesto mensual sugerido: <strong>${money(plan.presupuestoMensualClp || 0)}</strong></p>
        <h3>Canales</h3>
        <ul class="imp-list">${canales}</ul>
        <h3>Hitos</h3>
        <ul class="imp-list">${hitos}</ul>
        <h3>KPIs</h3>
        <ul class="imp-list">${kpi}</ul>
      </div>
      <div class="imp-card">
        <h3>Actualizar presupuesto mensual</h3>
        <form class="imp-form" id="form-ads">
          <label>Presupuesto CLP / mes<input name="presupuestoMensualClp" type="number" value="${plan.presupuestoMensualClp || 30000}" /></label>
          <div class="imp-form-actions"><button class="imp-btn imp-btn--primary" type="submit">Actualizar</button></div>
        </form>
        <p class="imp-muted">Regla: no subir inversión hasta que el costo por mensaje/pedido sea saludable.</p>
      </div>
    `;

    $('#form-ads').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      data.planAds = data.planAds || {};
      data.planAds.presupuestoMensualClp = Number(fd.get('presupuestoMensualClp'));
      markDirty();
      renderAll();
    });
  }

  function renderBitacora() {
    const items = (data.bitacora || [])
      .slice()
      .reverse()
      .map(
        (b) => `
      <div class="imp-card">
        <strong>${escapeHtml(b.autor || '')}</strong> · <span class="imp-muted">${escapeHtml(b.fecha || '')}</span>
        <p>${escapeHtml(b.texto || '')}</p>
      </div>`
      )
      .join('');

    $('#tab-bitacora').innerHTML = `
      ${items || '<div class="imp-card">Sin notas</div>'}
      <div class="imp-card">
        <h3>Agregar nota (visible para ambos)</h3>
        <form class="imp-form" id="form-bit">
          <label>Autor<input name="autor" value="Socio" required /></label>
          <label>Fecha<input name="fecha" type="date" value="${today()}" /></label>
          <label>Nota<textarea name="texto" required placeholder="Ej. compramos 100 anillos metal a $X"></textarea></label>
          <div class="imp-form-actions"><button class="imp-btn imp-btn--primary" type="submit">Publicar nota</button></div>
        </form>
      </div>
    `;

    $('#form-bit').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      data.bitacora = data.bitacora || [];
      data.bitacora.push({
        id: uid('bit'),
        fecha: fd.get('fecha'),
        autor: fd.get('autor'),
        texto: fd.get('texto'),
      });
      markDirty();
      renderAll();
    });
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function renderAll() {
    if (!data) return;
    renderResumen();
    renderGastos();
    renderVentas();
    renderOperacion();
    renderCostos();
    renderAds();
    renderBitacora();
  }

  document.querySelectorAll('#imp-tabs button').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#imp-tabs button').forEach((b) => b.classList.remove('is-active'));
      document.querySelectorAll('.imp-panel').forEach((p) => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      $(`#tab-${btn.dataset.tab}`).classList.add('is-active');
    });
  });

  $('#btn-guardar').addEventListener('click', () => {
    save().catch((e) => setStatus(String(e.message || e), 'err'));
  });
  $('#btn-recargar').addEventListener('click', () => {
    if (dirty && !confirm('Hay cambios sin guardar. ¿Recargar igual?')) return;
    load().catch((e) => setStatus(String(e.message || e), 'err'));
  });

  window.addEventListener('beforeunload', (e) => {
    if (dirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  load().catch((e) => setStatus(String(e.message || e), 'err'));
})();
