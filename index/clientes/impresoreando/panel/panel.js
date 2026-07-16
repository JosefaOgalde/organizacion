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
    if (normalizarSociedad(data)) {
      dirty = true;
      try {
        await save();
      } catch (e) {
        setStatus(`Datos migrados — guarda manual: ${e.message || e}`, 'warn');
      }
    } else {
      dirty = false;
      const when = data.meta?.actualizado ? new Date(data.meta.actualizado).toLocaleString('es-CL') : '—';
      setStatus(`Actualizado: ${when}`, 'ok');
    }
    renderAll();
  }

  /** Gastos de ambos; socios Josefa + Nicolás; capital aportado por Nicolás; filamentos ML. */
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
    d.gastos = Array.isArray(d.gastos) ? d.gastos : [];
    if (agruparGastosPorRegistro(d)) changed = true;
    if (asegurarProductoPortacompletosGato(d)) changed = true;
    const gastos = d.gastos;
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

  /**
   * Gastos agrupados por registro de compra (no ítem a ítem):
   * 1) Orden #312435 $652.290 · 2) AliExpress $60.000 · 3) Líder $20.000 · 4) Mercado Libre $64.750
   */
  function agruparGastosPorRegistro(d) {
    const REGISTROS = [
      {
        id: 'gas-reg-312435',
        fecha: '2026-07-14',
        categoria: 'equipo',
        descripcion: 'Orden #312435 — Impresora Centauri + filamentos + boquillas (PAGADO)',
        proveedor: 'Orden #312435',
        cantidad: 1,
        montoNeto: 652290,
        notas: 'Registro único. Subtotal $820.613 + envío $5.990 − descuento $174.313 = $652.290',
        ordenId: '312435',
        socioRegistro: 'Ambos',
        items: [
          { descripcion: 'Centauri Carbon 2 Combo Multicolor Elegoo | Impresora 3D', monto: 699988 },
          { descripcion: 'Filamento ABS Blanco 1kg Elegoo', monto: 14271 },
          { descripcion: 'Filamento PLA+ Negro 1kg Elegoo', monto: 17986 },
          { descripcion: 'Filamento PLA+ Rojo 1kg Elegoo', monto: 17986 },
          { descripcion: 'Centauri Carbon 2 Kit Boquillas Elegoo', monto: 18738 },
          { descripcion: 'Filamento PLA Amarillo 1kg Elegoo', monto: 16829 },
          { descripcion: 'Filamento PLA+ Azul Oscuro 1kg Elegoo', monto: 17986 },
          { descripcion: 'Filamento PLA Café 1kg Elegoo', monto: 16829 },
          { descripcion: 'Envío', monto: 5990 },
          { descripcion: 'Descuento', monto: -174313 },
        ],
      },
      {
        id: 'gas-reg-aliexpress',
        fecha: '2026-07-14',
        categoria: 'equipo',
        descripcion: 'AliExpress — placa cama + torno y cortador',
        proveedor: 'AliExpress',
        cantidad: 1,
        montoNeto: 60000,
        notas: 'Registro único AliExpress: placa cama $30.000 + torno y cortador $30.000',
        ordenId: 'aliexpress-inicial',
        socioRegistro: 'Ambos',
        items: [
          { descripcion: 'Placa cama', monto: 30000 },
          { descripcion: 'Torno y cortador', monto: 30000 },
        ],
      },
      {
        id: 'gas-reg-lider',
        fecha: '2026-07-14',
        categoria: 'empaque',
        descripcion: 'Líder — cajas de plástico',
        proveedor: 'Líder',
        cantidad: 1,
        montoNeto: 20000,
        notas: 'Registro único Líder',
        ordenId: 'lider-cajas',
        socioRegistro: 'Ambos',
        items: [{ descripcion: 'Cajas de plástico', monto: 20000 }],
      },
      {
        id: 'gas-reg-mercadolibre',
        fecha: '2026-07-14',
        categoria: 'filamento',
        descripcion: 'Mercado Libre — 5 filamentos PLA 1kg (PAGADO)',
        proveedor: 'Mercado Libre',
        cantidad: 5,
        montoNeto: 64750,
        notas: 'Registro único ML. Pagó Nicolás (Visa Banco de Chile + Meli Dólar). Envío gratis. Total $64.750',
        ordenId: 'ml-pla-2026-07-14',
        socioRegistro: 'Ambos',
        items: [
          { descripcion: 'Filamento PLA Rojo 1.75mm × 1kg', monto: 13690 },
          { descripcion: 'Filamento eSun PLA 1kg', monto: 12990 },
          { descripcion: 'Filamento Elegoo PLA 1kg (amarillo)', monto: 12690 },
          { descripcion: 'Filamento Elegoo PLA 1.75mm 1kg (azul)', monto: 12690 },
          { descripcion: 'Filamento Elegoo PLA 1kg (blanco)', monto: 12690 },
        ],
      },
    ];

    const OLD_LINE_IDS = new Set([
      'gas-312435-1', 'gas-312435-2', 'gas-312435-3', 'gas-312435-4', 'gas-312435-5',
      'gas-312435-6', 'gas-312435-7', 'gas-312435-8', 'gas-312435-envio', 'gas-312435-desc',
      'gas-ali-placa', 'gas-ali-torno', 'gas-lider-cajas',
      'gas-ml-pla-rojo', 'gas-ml-pla-esun', 'gas-ml-pla-elegoo-amarillo',
      'gas-ml-pla-elegoo-azul', 'gas-ml-pla-elegoo-blanco',
    ]);

    let changed = false;
    const before = d.gastos.length;
    d.gastos = d.gastos.filter((g) => !OLD_LINE_IDS.has(g.id));
    if (d.gastos.length !== before) changed = true;

    const byId = new Map(d.gastos.map((g) => [g.id, g]));
    for (const reg of REGISTROS) {
      const existing = byId.get(reg.id);
      if (!existing) {
        d.gastos.push({ ...reg });
        byId.set(reg.id, reg);
        changed = true;
      } else if (Number(existing.montoNeto) !== reg.montoNeto || !Array.isArray(existing.items)) {
        Object.assign(existing, reg);
        changed = true;
      }
    }
    return changed;
  }

  function asegurarProductoPortacompletosGato(d) {
    d.productos = Array.isArray(d.productos) ? d.productos : [];
    const id = 'prod-portacompletos-gato';
    const existing = d.productos.find((p) => p.id === id || /portacompletos?\s*gato/i.test(p.nombre || ''));
    const avgFilKg = (() => {
      const fils = d.productos.map((p) => Number(p.costoFilamentoKgClp || 0)).filter((n) => n > 0);
      if (fils.length) return Math.round(fils.reduce((a, b) => a + b, 0) / fils.length);
      return 12950;
    })();
    if (!existing) {
      d.productos.push({
        id,
        nombre: 'Portacompletos gato',
        activo: true,
        filamentoGramos: 110,
        costoFilamentoKgClp: avgFilKg,
        horasImpresion: 5,
        minutosPintado: 20,
        unidadesMetal: 0,
        unidadesBolsa: 1,
        precioVentaSugeridoClp: 0,
        notas: '5 h de impresión. Precio de venta a público se carga a mano.',
      });
      return true;
    }
    let changed = false;
    if (Number(existing.horasImpresion) !== 5) {
      existing.horasImpresion = 5;
      changed = true;
    }
    if (!existing.id) {
      existing.id = id;
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

  function gastosPorCategoria() {
    const map = {};
    for (const g of data.gastos || []) {
      const cat = g.categoria || 'otro';
      const m = Number(g.montoNeto || 0);
      if (m <= 0) continue;
      map[cat] = (map[cat] || 0) + m;
    }
    return Object.entries(map)
      .map(([cat, monto]) => ({ cat, monto }))
      .sort((a, b) => b.monto - a.monto);
  }

  const CHART_COLORS = ['#c47a3a', '#3d8b6e', '#7a6bb0', '#b85c6e', '#5a8fb8', '#9a7a3a', '#6b8f5a', '#8a6a9a'];

  function svgBarrasComparativa(gastos, ventas, operacion) {
    const max = Math.max(gastos, ventas, operacion, 1);
    const h = 140;
    const bar = (x, val, color, label) => {
      const bh = Math.max(4, Math.round((val / max) * 100));
      const y = 120 - bh;
      return `
        <rect x="${x}" y="${y}" width="48" height="${bh}" rx="6" fill="${color}" />
        <text x="${x + 24}" y="134" text-anchor="middle" font-size="11" fill="#8a7350">${label}</text>
        <text x="${x + 24}" y="${y - 6}" text-anchor="middle" font-size="10" fill="#7a5c28" font-weight="700">${Math.round(val / 1000)}k</text>`;
    };
    return `<svg class="imp-chart-svg" viewBox="0 0 220 150" role="img" aria-label="Comparativa gastos ventas operación">
      ${bar(20, gastos, '#c47a3a', 'Gastos')}
      ${bar(86, ventas, '#3d8b6e', 'Ventas')}
      ${bar(152, operacion, '#7a6bb0', 'Operac.')}
    </svg>`;
  }

  function svgDonutCategorias(cats) {
    const total = cats.reduce((a, c) => a + c.monto, 0) || 1;
    const r = 54;
    const cx = 70;
    const cy = 70;
    let ang = -Math.PI / 2;
    const parts = cats.slice(0, 7).map((c, i) => {
      const slice = (c.monto / total) * Math.PI * 2;
      const a0 = ang;
      const a1 = ang + slice;
      ang = a1;
      const x0 = cx + r * Math.cos(a0);
      const y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      const large = slice > Math.PI ? 1 : 0;
      const color = CHART_COLORS[i % CHART_COLORS.length];
      return `<path d="M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z" fill="${color}" stroke="#fffdf7" stroke-width="2" />`;
    });
    return `<svg class="imp-chart-svg" viewBox="0 0 140 140" role="img" aria-label="Gastos por categoría">
      ${parts.join('')}
      <circle cx="${cx}" cy="${cy}" r="28" fill="#fffdf7" />
      <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="11" fill="#7a5c28" font-weight="700">100%</text>
    </svg>`;
  }

  function htmlBarrasCategorias(cats) {
    const max = cats[0]?.monto || 1;
    return `<div class="imp-cat-bars">
      ${cats
        .map(
          (c) => `
        <div class="imp-cat-row">
          <span>${escapeHtml(c.cat)}</span>
          <div class="imp-cat-row__bar"><div class="imp-cat-row__fill" style="width:${Math.max(3, (c.monto / max) * 100)}%"></div></div>
          <span class="imp-cat-row__amt">${money(c.monto)}</span>
        </div>`
        )
        .join('')}
    </div>`;
  }

  function renderResumen() {
    const gastos = sum(data.gastos);
    const ventas = sum(data.ventas);
    const operacion = sum((data.operacion || []).filter((x) => Number(x.montoNeto) !== 0));
    const ads = Number(data.planAds?.presupuestoMensualClp || 0);
    /** Resultado = ventas − gastos − operación (sube al vender; más negativo si solo hay gastos). */
    const resultado = ventas - gastos - operacion;
    /** Saldo por recuperar = gastos + operación − ventas (baja cada vez que venden). */
    const saldoPendiente = Math.max(0, gastos + operacion - ventas);
    const cadaUnoGastos = gastos / 2;
    const cadaUnoResultado = resultado / 2;
    const cap = data.meta?.capital || {};
    const deuda = Number(cap.deudaJosefaClp != null ? cap.deudaJosefaClp : cadaUnoGastos);
    const orden = (data.gastos || []).find((g) => g.id === 'gas-reg-312435' || g.ordenId === '312435');
    const ali = (data.gastos || []).find((g) => g.id === 'gas-reg-aliexpress');
    const lider = (data.gastos || []).find((g) => g.id === 'gas-reg-lider');
    const ml = (data.gastos || []).find((g) => g.id === 'gas-reg-mercadolibre' || g.ordenId === 'ml-pla-2026-07-14');
    const totalOrden = Number(orden?.montoNeto || 0);
    const totalMl = Number(ml?.montoNeto || 0);
    const cats = gastosPorCategoria();
    const denom = Math.max(gastos + operacion, ventas, 1);
    const pctGastos = Math.min(100, ((gastos + operacion) / denom) * 100);
    const pctVentas = Math.min(100, (ventas / denom) * 100);
    const linkVenta = `${location.origin}/index/clientes/impresoreando/panel/venta/`;
    const esLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(location.hostname);

    $('#tab-resumen').innerHTML = `
      <div class="imp-balance">
        <div class="imp-balance__label">Saldo por recuperar (gastos − ventas)</div>
        <div class="imp-balance__valor">${money(saldoPendiente)}</div>
        <div class="imp-balance__bar" title="Al vender, este saldo baja">
          <div class="imp-balance__fill--gastos" style="width:${pctGastos}%"></div>
          <div class="imp-balance__fill--ventas" style="width:${pctVentas}%"></div>
        </div>
        <div class="imp-balance__legend">
          <span><i class="imp-dot imp-dot--gastos"></i>Gastos + op. ${money(gastos + operacion)}</span>
          <span><i class="imp-dot imp-dot--ventas"></i>Ventas ${money(ventas)} · cada venta baja el saldo</span>
        </div>
      </div>
      <div class="imp-grid">
        <div class="imp-kpi"><span>Gastos totales (ambos)</span><strong>${money(gastos)}</strong></div>
        <div class="imp-kpi imp-kpi--ok"><span>Ventas</span><strong>${money(ventas)}</strong></div>
        <div class="imp-kpi"><span>Operación (luz etc.)</span><strong>${money(operacion)}</strong></div>
        <div class="imp-kpi ${resultado >= 0 ? 'imp-kpi--ok' : 'imp-kpi--warn'}"><span>Resultado (ventas − gastos)</span><strong>${money(resultado)}</strong></div>
        <div class="imp-kpi"><span>50% cada socio (gastos)</span><strong>${money(cadaUnoGastos)}</strong></div>
        <div class="imp-kpi"><span>50% cada socio (resultado)</span><strong>${money(cadaUnoResultado)}</strong></div>
      </div>
      <div class="imp-charts">
        <div class="imp-card imp-chart-card">
          <h3>Comparativa</h3>
          ${svgBarrasComparativa(gastos, ventas, operacion)}
          <p class="imp-muted">Cada venta suma al verde y baja el saldo por recuperar.</p>
        </div>
        <div class="imp-card imp-chart-card">
          <h3>Gastos por categoría</h3>
          <div style="display:flex;gap:0.75rem;align-items:flex-start;flex-wrap:wrap">
            <div style="flex:0 0 140px">${svgDonutCategorias(cats)}</div>
            <div style="flex:1;min-width:160px">${htmlBarrasCategorias(cats)}</div>
          </div>
        </div>
      </div>
      <div class="imp-card">
        <h2>Sociedad</h2>
        <p class="imp-muted">${(data.meta?.socios || []).map((s) => `${s.nombre} ${s.pct}%`).join(' · ') || 'Josefa 50% · Nicolás 50%'}</p>
        <p>Instagram: <strong>${data.meta?.instagram || '@impresoreando'}</strong></p>
        <p class="imp-muted">Registros de compra (agrupados):</p>
        <ul class="imp-list">
          <li>Orden #312435: <strong>${money(totalOrden)}</strong></li>
          <li>AliExpress: <strong>${money(ali?.montoNeto || 0)}</strong></li>
          <li>Líder: <strong>${money(lider?.montoNeto || 0)}</strong></li>
          <li>Mercado Libre (5 PLA): <strong>${money(totalMl)}</strong></li>
        </ul>
        <p class="imp-deuda"><strong>Capital:</strong> lo aportó <strong>Nicolás</strong>. Todos los gastos son de <strong>ambos</strong>. Josefa le debe a Nicolás el <strong>50%</strong> del capital (${money(deuda)}).</p>
      </div>
      <div class="imp-card">
        <h2>Link para registrar ventas (celular)</h2>
        <p class="imp-aviso-local"${esLocalhost ? '' : ' hidden'}>
          <strong>Importante:</strong> <code>localhost</code> solo funciona en esta PC.
          En el celular falla con ERR_CONNECTION_FAILED. Usa la IP WiFi o el túnel público.
        </p>
        <p class="imp-muted">Misma WiFi — abre en el celular (no localhost):</p>
        <div class="imp-share" id="imp-links-lan"><span class="imp-muted">Cargando IPs…</span></div>
        <p class="imp-muted" style="margin-top:0.75rem">Cualquier lugar / datos móviles:</p>
        <ol class="imp-list">
          <li>En la PC deja <strong>SERVIR.bat</strong> corriendo.</li>
          <li>Abre <strong>ABRIR-VENTA-PUBLICA.bat</strong> (segunda ventana).</li>
          <li>Copia el link <code>https://….loca.lt/…/venta/</code> y envíalo por WhatsApp.</li>
        </ol>
        <div class="imp-share">
          <code id="imp-link-venta">${escapeHtml(linkVenta)}</code>
          <button type="button" class="imp-btn imp-btn--primary" id="btn-copiar-link-venta">Copiar link de esta ventana</button>
          <a class="imp-btn" href="./venta/">Abrir registrador</a>
        </div>
        <p class="imp-muted">Presupuesto ads mes (plan): ${money(ads)}</p>
      </div>
    `;

    $('#btn-copiar-link-venta')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(linkVenta);
        setStatus('Link de ventas copiado', 'ok');
      } catch {
        setStatus('No se pudo copiar — selecciónalo a mano', 'warn');
      }
    });

    fetch('/api/acceso', { cache: 'no-store' })
      .then((r) => r.json())
      .then((info) => {
        const box = $('#imp-links-lan');
        if (!box) return;
        const urls = info.lan || [];
        if (!urls.length) {
          box.innerHTML = '<span class="imp-muted">No se detectó IP de red — usa ABRIR-VENTA-PUBLICA.bat</span>';
          return;
        }
        box.innerHTML = urls
          .map(
            (u) =>
              `<code class="imp-lan-url">${escapeHtml(u)}</code><button type="button" class="imp-btn" data-copy="${escapeHtml(u)}">Copiar</button>`
          )
          .join('');
        box.querySelectorAll('[data-copy]').forEach((btn) => {
          btn.addEventListener('click', async () => {
            try {
              await navigator.clipboard.writeText(btn.getAttribute('data-copy'));
              setStatus('Link WiFi copiado', 'ok');
            } catch {
              setStatus('Copia manual del link', 'warn');
            }
          });
        });
      })
      .catch(() => {
        const box = $('#imp-links-lan');
        if (box) box.innerHTML = '<span class="imp-muted">No se pudo leer /api/acceso</span>';
      });
  }

  function renderGastos() {
    const rows = (data.gastos || [])
      .slice()
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
      .map((g) => {
        const detalle =
          Array.isArray(g.items) && g.items.length
            ? `<details class="imp-gasto-items"><summary>${g.items.length} ítems en este registro</summary><ul class="imp-list">${g.items
                .map(
                  (it) =>
                    `<li>${escapeHtml(it.descripcion || '')} · <strong>${money(it.monto)}</strong></li>`
                )
                .join('')}</ul></details>`
            : '';
        return `
      <tr>
        <td>${escapeHtml(g.fecha || '')}</td>
        <td>${escapeHtml(g.categoria || '')}</td>
        <td>
          <strong>${escapeHtml(g.proveedor || 'Sin proveedor')}</strong>
          <div>${escapeHtml(g.descripcion || '')}</div>
          <div class="imp-muted">${escapeHtml(g.notas || '')}</div>
          ${detalle}
        </td>
        <td class="num ${Number(g.montoNeto) < 0 ? 'imp-neg' : 'imp-pos'}">${money(g.montoNeto)}</td>
        <td>${escapeHtml(g.socioRegistro || '')}</td>
        <td><button type="button" class="imp-btn imp-btn--danger" data-del-gasto="${g.id}">✕</button></td>
      </tr>`;
      })
      .join('');

    $('#tab-gastos').innerHTML = `
      <div class="imp-card">
        <h2>Gastos por registro (${money(sum(data.gastos))})</h2>
        <p class="imp-muted">Cada compra se guarda como <strong>un solo registro</strong> (orden / AliExpress / Líder / Mercado Libre…). El detalle de ítems queda desplegable.</p>
        <div class="imp-table-wrap">
          <table class="imp-table">
            <thead><tr><th>Fecha</th><th>Cat.</th><th>Registro</th><th>Monto</th><th>Quién</th><th></th></tr></thead>
            <tbody>${rows || '<tr><td colspan="6">Sin gastos</td></tr>'}</tbody>
          </table>
        </div>
      </div>
      <div class="imp-card">
        <h3>Agregar gasto (registro)</h3>
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
          <label>Proveedor / registro<input name="proveedor" required placeholder="Ej. Mercado Libre / AliExpress" /></label>
          <label>Descripción<input name="descripcion" required placeholder="Resumen de la compra" /></label>
          <label>Monto total CLP<input name="montoNeto" type="number" required step="1" /></label>
          <label>Quién
            <select name="socioRegistro">
              <option value="Ambos" selected>Ambos</option>
              <option value="Josefa">Josefa</option>
              <option value="Nicolás">Nicolás</option>
            </select>
          </label>
          <label>Notas / ítems<textarea name="notas" placeholder="Opcional: listar productos del ticket"></textarea></label>
          <div class="imp-form-actions">
            <button class="imp-btn imp-btn--primary" type="submit">Agregar registro de gasto</button>
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
        items: [],
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
      <div class="imp-card imp-kpi--accent" style="padding:0.9rem 1rem">
        <p style="margin:0"><strong>Link rápido para socios:</strong> <a href="./venta/">Abrir registrador de ventas</a>
        — cada venta baja el saldo por recuperar en Resumen.</p>
      </div>
      <div class="imp-card">
        <h2>Ventas (${money(sum(data.ventas))})</h2>
        <p class="imp-muted">Las ventas se restan de los gastos en el dashboard: <strong>saldo = gastos − ventas</strong>.</p>
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
    const p = data.parametros || {};
    const avgFilKg =
      (() => {
        const fils = (data.gastos || []).filter((g) => g.categoria === 'filamento' && Number(g.montoNeto) > 0);
        if (!fils.length) return 17986;
        return Math.round(sum(fils) / fils.length);
      })();

    const blocks = (data.productos || [])
      .map((prod) => {
        const c = costoProducto(prod);
        const sugeridoCosto = c.total / (1 - margen);
        const margenReal =
          Number(prod.precioVentaSugeridoClp) > 0
            ? ((Number(prod.precioVentaSugeridoClp) - c.total) / Number(prod.precioVentaSugeridoClp)) * 100
            : 0;
        const pid = escapeHtml(prod.id || '');
        return `
        <div class="imp-card" data-prod-id="${pid}">
          <h3>${escapeHtml(prod.nombre)}</h3>
          <div class="imp-grid">
            <div class="imp-kpi"><span>Filamento</span><strong>${money(c.filamento)}</strong></div>
            <div class="imp-kpi"><span>Luz (impresión)</span><strong>${money(c.luz)}</strong></div>
            <div class="imp-kpi"><span>Pintado / MO</span><strong>${money(c.pintado)}</strong></div>
            <div class="imp-kpi"><span>Metal</span><strong>${money(c.metal)}</strong></div>
            <div class="imp-kpi"><span>Bolsa</span><strong>${money(c.bolsa)}</strong></div>
            <div class="imp-kpi imp-kpi--accent"><span>Costo unitario</span><strong>${money(c.total)}</strong></div>
            <div class="imp-kpi"><span>Precio sugerido c/ margen ${Math.round(margen * 100)}%</span><strong>${money(sugeridoCosto)}</strong></div>
            <div class="imp-kpi ${Number(prod.precioVentaSugeridoClp) > 0 && margenReal >= Number(data.parametros?.margenObjetivoPct || 40) ? 'imp-kpi--ok' : Number(prod.precioVentaSugeridoClp) > 0 ? 'imp-kpi--warn' : ''}"><span>Margen real</span><strong>${Number(prod.precioVentaSugeridoClp) > 0 ? `${margenReal.toFixed(0)}%` : '—'}</strong></div>
          </div>
          <form class="imp-form imp-form--precio" data-precio-prod="${pid}">
            <label>Precio venta a público (CLP)
              <input name="precioVenta" type="number" min="0" step="10" value="${Number(prod.precioVentaSugeridoClp) || ''}" placeholder="Ej. 8990 — editable a mano" />
            </label>
            <div class="imp-form-actions">
              <button type="submit" class="imp-btn imp-btn--primary">Guardar precio</button>
              <span class="imp-muted">Costo ${money(c.total)} · si dejas 0, solo ves el costo</span>
            </div>
          </form>
          <p class="imp-muted">${prod.filamentoGramos || 0}g · ${prod.horasImpresion || 0}h impresión · ${prod.minutosPintado || 0} min pintado · metal×${prod.unidadesMetal || 0} · bolsa×${prod.unidadesBolsa || 0} · luz/h ≈ ${money(costoHoraImpresora())}${prod.notas ? ` · ${escapeHtml(prod.notas)}` : ''}</p>
        </div>`;
      })
      .join('');

    $('#tab-costos').innerHTML = `
      <div class="imp-card">
        <h2>Costos por pieza (luz + materiales)</h2>
        <p class="imp-muted">Cada pieza = filamento + luz (kWh × horas) + pintado + metal + bolsa. El <strong>precio a público</strong> se carga a mano en cada producto.</p>
        <p class="imp-muted">Promedio reciente $/kg filamento (desde gastos): <strong>${money(avgFilKg)}</strong> · luz/hora impresora ≈ <strong>${money(costoHoraImpresora())}</strong></p>
      </div>
      ${blocks || '<div class="imp-card">Sin productos</div>'}
      <div class="imp-card">
        <h3>Calculadora rápida de pieza</h3>
        <form class="imp-form" id="form-calc-pieza">
          <label>Gramos filamento<input name="g" type="number" step="0.1" value="110" /></label>
          <label>$ / kg filamento<input name="kg" type="number" value="${avgFilKg}" /></label>
          <label>Horas impresión<input name="h" type="number" step="0.1" value="5" /></label>
          <label>Minutos pintado<input name="m" type="number" value="20" /></label>
          <label>Unidades metal<input name="metal" type="number" value="0" /></label>
          <label>Bolsas<input name="bolsa" type="number" value="1" /></label>
        </form>
        <div class="imp-calc-live" id="calc-pieza-live">Calculando…</div>
      </div>
      <div class="imp-card">
        <h3>Agregar producto al catálogo</h3>
        <form class="imp-form" id="form-prod">
          <label>Nombre<input name="nombre" required placeholder="Llavero perro" /></label>
          <label>Gramos filamento<input name="filamentoGramos" type="number" step="0.1" value="12" /></label>
          <label>$ / kg filamento<input name="costoFilamentoKgClp" type="number" value="${avgFilKg}" /></label>
          <label>Horas impresión<input name="horasImpresion" type="number" step="0.1" value="1.2" /></label>
          <label>Minutos pintado<input name="minutosPintado" type="number" value="15" /></label>
          <label>Unidades metal<input name="unidadesMetal" type="number" value="1" /></label>
          <label>Bolsas<input name="unidadesBolsa" type="number" value="1" /></label>
          <label>Precio venta a público $<input name="precioVentaSugeridoClp" type="number" value="" placeholder="Opcional — editable después" /></label>
          <div class="imp-form-actions"><button class="imp-btn imp-btn--primary" type="submit">Agregar producto</button></div>
        </form>
      </div>
    `;

    const updateCalc = () => {
      const form = $('#form-calc-pieza');
      if (!form) return;
      const fd = new FormData(form);
      const fake = {
        filamentoGramos: Number(fd.get('g')),
        costoFilamentoKgClp: Number(fd.get('kg')),
        horasImpresion: Number(fd.get('h')),
        minutosPintado: Number(fd.get('m')),
        unidadesMetal: Number(fd.get('metal')),
        unidadesBolsa: Number(fd.get('bolsa')),
      };
      const c = costoProducto(fake);
      const sug = c.total / (1 - margen);
      const el = $('#calc-pieza-live');
      if (el) {
        el.innerHTML = `
          Filamento ${money(c.filamento)} · Luz ${money(c.luz)} · Pintado ${money(c.pintado)} · Metal ${money(c.metal)} · Bolsa ${money(c.bolsa)}
          <br><strong>Costo unitario: ${money(c.total)}</strong> · precio sugerido c/ margen ${Math.round(margen * 100)}%: <strong>${money(sug)}</strong>
          <div class="imp-muted" style="margin-top:0.35rem">Tarifa ${p.tarifaKwhClp || 180} $/kWh · consumo ${p.consumoImpresoraKw || 0.22} kW</div>`;
      }
    };
    $('#form-calc-pieza')?.addEventListener('input', updateCalc);
    updateCalc();

    $('#tab-costos').querySelectorAll('[data-precio-prod]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = form.getAttribute('data-precio-prod');
        const fd = new FormData(form);
        const prod = (data.productos || []).find((x) => x.id === id);
        if (!prod) return;
        prod.precioVentaSugeridoClp = Number(fd.get('precioVenta') || 0);
        markDirty();
        renderAll();
        setStatus('Precio de venta actualizado — guarda online', 'warn');
      });
    });

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
        precioVentaSugeridoClp: Number(fd.get('precioVentaSugeridoClp') || 0),
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
