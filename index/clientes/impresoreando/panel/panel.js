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
    if (asegurarParametrosLuzChileCentauri(d)) changed = true;
    if (asegurarProductoPortacompletosGato(d)) changed = true;
    if (asegurarProductoPortacompletosPerro(d)) changed = true;
    if (asegurarProductoPortaLataMonster(d)) changed = true;
    if (asegurarSkusProductos(d)) changed = true;
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

  /** Defaults luz Chile 2026 + Elegoo Centauri Carbon 2 (220 V). */
  const LUZ_CHILE = {
    tarifaKwhClp: 200,
    consumoImpresoraKw: 0.28,
    impresoraModelo: 'Elegoo Centauri Carbon 2',
    impresoraNotas:
      'Pico nominal 1100 W @ 220 V. Promedio estimado en impresión PLA con cama caliente: 0,28 kW. Tarifa ~$200/kWh (precio efectivo boleta residencial Chile 2026; ajústala a tu cuenta).',
  };

  function asegurarParametrosLuzChileCentauri(d) {
    d.parametros = d.parametros && typeof d.parametros === 'object' ? d.parametros : {};
    const p = d.parametros;
    let changed = false;
    const tarifa = Number(p.tarifaKwhClp);
    const consumo = Number(p.consumoImpresoraKw);
    // Migra defaults antiguos (180 / 0,22) o vacíos → Chile + Centauri Carbon 2.
    if (!Number.isFinite(tarifa) || tarifa === 180) {
      p.tarifaKwhClp = LUZ_CHILE.tarifaKwhClp;
      changed = true;
    }
    if (!Number.isFinite(consumo) || consumo === 0.22) {
      p.consumoImpresoraKw = LUZ_CHILE.consumoImpresoraKw;
      changed = true;
    }
    if (p.impresoraModelo !== LUZ_CHILE.impresoraModelo) {
      p.impresoraModelo = LUZ_CHILE.impresoraModelo;
      changed = true;
    }
    if (p.impresoraNotas !== LUZ_CHILE.impresoraNotas) {
      p.impresoraNotas = LUZ_CHILE.impresoraNotas;
      changed = true;
    }
    return changed;
  }

  function avgCostoFilamentoKg(d) {
    const fils = (d.productos || []).map((p) => Number(p.costoFilamentoKgClp || 0)).filter((n) => n > 0);
    if (fils.length) return Math.round(fils.reduce((a, b) => a + b, 0) / fils.length);
    return 12950;
  }

  function asegurarProductoPortacompletosGato(d) {
    d.productos = Array.isArray(d.productos) ? d.productos : [];
    const id = 'prod-portacompletos-gato';
    const existing = d.productos.find((p) => p.id === id || /portacompletos?\s*gato/i.test(p.nombre || ''));
    const avgFilKg = avgCostoFilamentoKg(d);
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

  function asegurarProductoPortacompletosPerro(d) {
    d.productos = Array.isArray(d.productos) ? d.productos : [];
    const id = 'prod-portacompletos-perro';
    const existing = d.productos.find((p) => p.id === id || /portacompletos?\s*perro/i.test(p.nombre || ''));
    const avgFilKg = avgCostoFilamentoKg(d);
    if (!existing) {
      d.productos.push({
        id,
        nombre: 'Portacompletos perro',
        activo: true,
        filamentoGramos: 132,
        costoFilamentoKgClp: avgFilKg,
        horasImpresion: 6,
        minutosPintado: 20,
        unidadesMetal: 0,
        unidadesBolsa: 1,
        precioVentaSugeridoClp: 0,
        notas: '6 h de impresión. Precio de venta a público se carga a mano.',
      });
      return true;
    }
    let changed = false;
    if (Number(existing.horasImpresion) !== 6) {
      existing.horasImpresion = 6;
      changed = true;
    }
    if (!existing.id) {
      existing.id = id;
      changed = true;
    }
    if (!/6\s*h/i.test(existing.notas || '')) {
      existing.notas = '6 h de impresión. Precio de venta a público se carga a mano.';
      changed = true;
    }
    return changed;
  }

  /** Porta lata Monster — seed inicial desde slicer; no pisa ediciones posteriores. */
  function asegurarProductoPortaLataMonster(d) {
    d.productos = Array.isArray(d.productos) ? d.productos : [];
    const id = 'prod-porta-lata-monster';
    const existing = d.productos.find(
      (p) => p.id === id || /porta\s*lata.*monster|monster.*porta\s*lata/i.test(p.nombre || '')
    );
    const seed = {
      id,
      nombre: 'Porta lata Monster',
      activo: true,
      filamentoModeloGramos: 135.55,
      filamentoSoportesGramos: 8.43,
      filamentoPurgeGramos: 0.47,
      filamentoMetros: 48.04,
      filamentoGramos: 144.45,
      costoFilamentoKgClp: 12690,
      horasImpresion: 3.4167,
      minutosPintado: 0,
      unidadesMetal: 0,
      unidadesBolsa: 1,
      precioVentaSugeridoClp: 0,
      costoSlicerRef: 2.89,
      notas:
        'Slicer: modelo 135,55 g + soportes 8,43 g + purge 0,47 g = 144,45 g · 48,04 m · 3 h 25 m · coste slicer 2,89 (ref). PLA amarillo. Logo en relieve.',
    };
    if (!existing) {
      d.productos.push(seed);
      return true;
    }
    let changed = false;
    if (!existing.id) {
      existing.id = id;
      changed = true;
    }
    // Solo rellena campos slicer si aún no existen (respetar ediciones de la usuaria).
    const backfill = [
      'filamentoModeloGramos',
      'filamentoSoportesGramos',
      'filamentoPurgeGramos',
      'filamentoMetros',
      'costoSlicerRef',
    ];
    for (const k of backfill) {
      if (existing[k] == null && seed[k] != null) {
        existing[k] = seed[k];
        changed = true;
      }
    }
    return changed;
  }

  /** Prefijos SKU legibles: PCGATO, PCPERRO, PCPERROBU, MCPERROBU, PLMONS… */
  function skuPrefijoDesdeTexto(nombre, id) {
    const t = `${nombre || ''} ${id || ''}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (/macetero/.test(t) && /bull/.test(t)) return 'MCPERROBU';
    if (/(porta\s*completos?|portacompleto)/.test(t) && /bull/.test(t)) return 'PCPERROBU';
    if (/(porta\s*completos?|portacompleto)/.test(t) && /gato/.test(t)) return 'PCGATO';
    if (/(porta\s*completos?|portacompleto)/.test(t) && /perro/.test(t)) return 'PCPERRO';
    if (/porta\s*lata/.test(t) && /monster|mons/.test(t)) return 'PLMONS';
    if (/porta\s*lata/.test(t)) return 'PLATA';
    if (/llavero/.test(t)) return 'LLAV';
    if (/figura|souvenir/.test(t)) return 'FIG';
    const words = t
      .replace(/[^a-z0-9\s]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!words.length) return 'PROD';
    return words
      .map((w) => w.slice(0, 3))
      .join('')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8) || 'PROD';
  }

  function esSkuSimple(sku) {
    return /^[A-Z]{2,10}\d{3}$/i.test(String(sku || ''));
  }

  function siguienteSkuProducto(nombre, id, listaBase) {
    const pref = skuPrefijoDesdeTexto(nombre, id);
    const list = listaBase || data?.productos || [];
    const re = new RegExp(`^${pref}(\\d{3})$`, 'i');
    let max = 0;
    for (const p of list) {
      const m = String(p.sku || '').match(re);
      if (m) max = Math.max(max, Number(m[1]));
    }
    return `${pref}${String(max + 1).padStart(3, '0')}`;
  }

  function asegurarSkusProductos(d) {
    d.productos = Array.isArray(d.productos) ? d.productos : [];
    let changed = false;
    const CANON = {
      'prod-portacompletos-gato': 'PCGATO001',
      'prod-portacompletos-perro': 'PCPERRO001',
      'prod-porta-lata-monster': 'PLMONS001',
    };
    for (const p of d.productos) {
      const fijo = CANON[p.id];
      if (fijo && p.sku !== fijo) {
        p.sku = fijo;
        changed = true;
      }
    }
    for (const p of d.productos) {
      if (CANON[p.id]) continue;
      if (!p.sku || !esSkuSimple(p.sku) || /^IMP-/i.test(p.sku)) {
        const otros = d.productos.filter((x) => x !== p && esSkuSimple(x.sku) && !/^IMP-/i.test(x.sku));
        p.sku = siguienteSkuProducto(p.nombre, p.id, otros);
        changed = true;
      }
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

  function partesHoras(horas) {
    const totalMin = Math.max(0, Math.round(Number(horas || 0) * 60));
    return { horas: Math.floor(totalMin / 60), minutos: totalMin % 60 };
  }

  function horasDesdePartes(horas, minutos) {
    return Number(horas || 0) + Number(minutos || 0) / 60;
  }

  function gramosDesdeDesglose(prod) {
    const modelo = Number(prod.filamentoModeloGramos);
    const soportes = Number(prod.filamentoSoportesGramos);
    const purge = Number(prod.filamentoPurgeGramos);
    const tieneDesglose =
      prod.filamentoModeloGramos != null ||
      prod.filamentoSoportesGramos != null ||
      prod.filamentoPurgeGramos != null;
    if (!tieneDesglose) return Number(prod.filamentoGramos || 0);
    return (Number.isFinite(modelo) ? modelo : 0) +
      (Number.isFinite(soportes) ? soportes : 0) +
      (Number.isFinite(purge) ? purge : 0);
  }

  function costoProducto(prod) {
    const p = data.parametros || {};
    const gramos = gramosDesdeDesglose(prod) || Number(prod.filamentoGramos || 0);
    const filamento = (gramos / 1000) * Number(prod.costoFilamentoKgClp || 0);
    const luz = Number(prod.horasImpresion || 0) * costoHoraImpresora();
    const pintado =
      (Number(prod.minutosPintado || 0) / 60) * Number(p.valorHoraManoObraClp || 0);
    const metal = Number(prod.unidadesMetal || 0) * Number(p.costoAnilloMetalLlaveroClp || 0);
    const bolsa = Number(prod.unidadesBolsa || 0) * Number(p.costoBolsaEntregaClp || 0);
    const total = filamento + luz + pintado + metal + bolsa;
    return { filamento, luz, pintado, metal, bolsa, total, gramos };
  }

  function leerProductoDesdeForm(form) {
    if (!form) return null;
    const fd = new FormData(form);
    const modelo = Number(fd.get('filamentoModeloGramos') || 0);
    const soportes = Number(fd.get('filamentoSoportesGramos') || 0);
    const purge = Number(fd.get('filamentoPurgeGramos') || 0);
    const totalDesglose = modelo + soportes + purge;
    const gramosManual = Number(fd.get('filamentoGramos') || 0);
    const usarDesglose = fd.get('usarDesglose') === '1';
    const filamentoGramos = usarDesglose ? totalDesglose : gramosManual;
    const horasImpresion = horasDesdePartes(fd.get('horasPart'), fd.get('minutosPart'));
    return {
      nombre: String(fd.get('nombre') || '').trim(),
      filamentoModeloGramos: modelo,
      filamentoSoportesGramos: soportes,
      filamentoPurgeGramos: purge,
      filamentoMetros: Number(fd.get('filamentoMetros') || 0),
      filamentoGramos,
      costoFilamentoKgClp: Number(fd.get('costoFilamentoKgClp') || 0),
      horasImpresion,
      minutosPintado: Number(fd.get('minutosPintado') || 0),
      unidadesMetal: Number(fd.get('unidadesMetal') || 0),
      unidadesBolsa: Number(fd.get('unidadesBolsa') || 0),
      precioVentaSugeridoClp: Number(fd.get('precioVentaSugeridoClp') || 0),
      costoSlicerRef: Number(fd.get('costoSlicerRef') || 0),
      notas: String(fd.get('notas') || '').trim(),
      usarDesglose,
    };
  }

  function htmlCostoLive(c, margen, precioVenta) {
    const sugerido = c.total / (1 - margen);
    const margenReal =
      Number(precioVenta) > 0 ? ((Number(precioVenta) - c.total) / Number(precioVenta)) * 100 : null;
    return `
      <div class="imp-grid imp-grid--costo-live">
        <div class="imp-kpi"><span>Filamento (${Number(c.gramos || 0).toFixed(2)} g)</span><strong>${money(c.filamento)}</strong></div>
        <div class="imp-kpi"><span>Luz (impresión)</span><strong>${money(c.luz)}</strong></div>
        <div class="imp-kpi"><span>Pintado / MO</span><strong>${money(c.pintado)}</strong></div>
        <div class="imp-kpi"><span>Metal</span><strong>${money(c.metal)}</strong></div>
        <div class="imp-kpi"><span>Bolsa</span><strong>${money(c.bolsa)}</strong></div>
        <div class="imp-kpi imp-kpi--accent"><span>Costo unitario</span><strong>${money(c.total)}</strong></div>
        <div class="imp-kpi"><span>Precio sugerido c/ margen ${Math.round(margen * 100)}%</span><strong>${money(sugerido)}</strong></div>
        <div class="imp-kpi ${margenReal == null ? '' : margenReal >= Number(data.parametros?.margenObjetivoPct || 40) ? 'imp-kpi--ok' : 'imp-kpi--warn'}"><span>Margen real</span><strong>${margenReal == null ? '—' : `${margenReal.toFixed(0)}%`}</strong></div>
      </div>`;
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
    const metaRecuperar = gastos + operacion;
    /** Saldo por recuperar = gastos + operación − ventas (baja cada vez que venden). */
    const saldoPendiente = Math.max(0, metaRecuperar - ventas);
    const pctRecuperado = metaRecuperar > 0 ? Math.min(100, (ventas / metaRecuperar) * 100) : 100;
    const sinDeuda = saldoPendiente <= 0;
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
    const denom = Math.max(metaRecuperar, ventas, 1);
    const pctGastos = Math.min(100, (metaRecuperar / denom) * 100);
    const pctVentas = Math.min(100, (ventas / denom) * 100);
    const linkVenta = `${location.origin}/index/clientes/impresoreando/panel/venta/`;
    const esLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(location.hostname);
    const portaLata = (data.productos || []).find((p) => p.id === 'prod-porta-lata-monster');
    const costoPortaLata = portaLata ? costoProducto(portaLata) : null;

    $('#tab-resumen').innerHTML = `
      <div class="imp-balance ${sinDeuda ? 'imp-balance--ok' : 'imp-balance--deuda'}">
        <div class="imp-balance__label">${sinDeuda ? 'Sin deuda de sociedad' : 'Para salir de deuda falta recuperar'}</div>
        <div class="imp-balance__valor">${money(saldoPendiente)}</div>
        <p class="imp-balance__meta">
          ${sinDeuda
            ? `Ya recuperaron ${money(ventas)} — las ventas cubren gastos + operación.`
            : `Ya recuperaron <strong>${money(ventas)}</strong> de <strong>${money(metaRecuperar)}</strong>
               · progreso <strong>${pctRecuperado.toFixed(1)}%</strong>
               · meta: llegar a ${money(metaRecuperar)} en ventas.`}
        </p>
        <div class="imp-balance__progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pctRecuperado.toFixed(0)}" aria-label="Progreso hacia salir de deuda">
          <div class="imp-balance__progress-fill" style="width:${pctRecuperado}%"></div>
        </div>
        <div class="imp-balance__bar" title="Al vender, este saldo baja">
          <div class="imp-balance__fill--gastos" style="width:${pctGastos}%"></div>
          <div class="imp-balance__fill--ventas" style="width:${pctVentas}%"></div>
        </div>
        <div class="imp-balance__legend">
          <span><i class="imp-dot imp-dot--gastos"></i>Gastos + op. ${money(metaRecuperar)}</span>
          <span><i class="imp-dot imp-dot--ventas"></i>Ventas ${money(ventas)} · cada venta baja lo que falta</span>
        </div>
      </div>
      ${
        costoPortaLata && portaLata
          ? `<div class="imp-card imp-card--costo-destacado">
        <h2>Último costo de pieza · Porta lata Monster</h2>
        <p class="imp-muted">Slicer: modelo ${portaLata.filamentoModeloGramos ?? '—'} g + soportes ${portaLata.filamentoSoportesGramos ?? '—'} g + purge ${portaLata.filamentoPurgeGramos ?? '—'} g = <strong>${Number(costoPortaLata.gramos || portaLata.filamentoGramos || 0).toFixed(2)} g</strong>
          · ${portaLata.filamentoMetros ? `${portaLata.filamentoMetros} m · ` : ''}${partesHoras(portaLata.horasImpresion).horas} h ${partesHoras(portaLata.horasImpresion).minutos} m
          ${portaLata.costoSlicerRef ? ` · coste slicer ref. ${portaLata.costoSlicerRef}` : ''}</p>
        <div class="imp-grid">
          <div class="imp-kpi"><span>Filamento</span><strong>${money(costoPortaLata.filamento)}</strong></div>
          <div class="imp-kpi"><span>Luz</span><strong>${money(costoPortaLata.luz)}</strong></div>
          <div class="imp-kpi"><span>Bolsa</span><strong>${money(costoPortaLata.bolsa)}</strong></div>
          <div class="imp-kpi imp-kpi--accent"><span>Costo de hacer el vaso</span><strong>${money(costoPortaLata.total)}</strong></div>
        </div>
        <p class="imp-muted">Editable en <button type="button" class="imp-linkish" data-goto-tab="costos">Costos producto</button> — al cambiar parámetros se recalcula.</p>
      </div>`
          : ''
      }
      <div class="imp-grid">
        <div class="imp-kpi"><span>Gastos totales (ambos)</span><strong>${money(gastos)}</strong></div>
        <div class="imp-kpi imp-kpi--ok"><span>Ventas</span><strong>${money(ventas)}</strong></div>
        <div class="imp-kpi"><span>Operación (luz etc.)</span><strong>${money(operacion)}</strong></div>
        <div class="imp-kpi ${resultado >= 0 ? 'imp-kpi--ok' : 'imp-kpi--warn'}"><span>Resultado (ventas − gastos)</span><strong>${money(resultado)}</strong></div>
      </div>
      <div class="imp-socios" aria-label="Detalle por socio">
        <article class="imp-socio imp-socio--josefa">
          <header class="imp-socio__head">
            <h3>Josefa</h3>
            <span class="imp-socio__tag">50%</span>
          </header>
          <p class="imp-socio__deuda">Le debe a Nicolás <strong>${money(deuda)}</strong></p>
          <ul class="imp-socio__detalle">
            <li><span>Su 50% de los gastos</span><strong>${money(cadaUnoGastos)}</strong></li>
            <li><span>Su 50% del resultado</span><strong class="${cadaUnoResultado >= 0 ? 'is-ok' : 'is-warn'}">${money(cadaUnoResultado)}</strong></li>
            <li><span>Capital que aportó</span><strong>$0</strong></li>
          </ul>
          <p class="imp-socio__nota">Nicolás puso el capital; a Josefa le corresponde el 50% (${money(deuda)}).</p>
        </article>
        <article class="imp-socio imp-socio--nicolas">
          <header class="imp-socio__head">
            <h3>Nicolás</h3>
            <span class="imp-socio__tag">50%</span>
          </header>
          <p class="imp-socio__deuda imp-socio__deuda--ok">Josefa le debe <strong>${money(deuda)}</strong></p>
          <ul class="imp-socio__detalle">
            <li><span>Su 50% de los gastos</span><strong>${money(cadaUnoGastos)}</strong></li>
            <li><span>Su 50% del resultado</span><strong class="${cadaUnoResultado >= 0 ? 'is-ok' : 'is-warn'}">${money(cadaUnoResultado)}</strong></li>
            <li><span>Capital que aportó</span><strong>${money(gastos)}</strong></li>
          </ul>
          <p class="imp-socio__nota">Aportó el capital del negocio. Tiene por cobrar de Josefa ${money(deuda)}.</p>
        </article>
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
        <p class="imp-muted">Esa deuda entre socios es distinta del saldo de arriba: el saldo baja con cada venta del negocio; la deuda 50% de Josefa se actualiza con el capital aportado.</p>
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

    $('#tab-resumen')?.querySelectorAll('[data-goto-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-goto-tab');
        document.querySelector(`#imp-tabs button[data-tab="${tab}"]`)?.click();
      });
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
        <p class="imp-muted"><strong>${escapeHtml(p.impresoraModelo || LUZ_CHILE.impresoraModelo)}</strong> · Chile 220 V</p>
        <p class="imp-muted">${escapeHtml(p.impresoraNotas || LUZ_CHILE.impresoraNotas)}</p>
        <form class="imp-form" id="form-params">
          <label>Tarifa luz Chile $/kWh
            <input name="tarifaKwhClp" type="number" min="0" step="1" value="${p.tarifaKwhClp ?? LUZ_CHILE.tarifaKwhClp}" />
          </label>
          <label>Consumo Centauri Carbon 2 (kW promedio)
            <input name="consumoImpresoraKw" type="number" min="0" step="0.01" value="${p.consumoImpresoraKw ?? LUZ_CHILE.consumoImpresoraKw}" />
          </label>
          <label>Mano de obra $/h<input name="valorHoraManoObraClp" type="number" value="${p.valorHoraManoObraClp || 5000}" /></label>
          <label>Anillo metal llavero $<input name="costoAnilloMetalLlaveroClp" type="number" value="${p.costoAnilloMetalLlaveroClp || 150}" /></label>
          <label>Bolsa entrega $<input name="costoBolsaEntregaClp" type="number" value="${p.costoBolsaEntregaClp || 50}" /></label>
          <label>Margen objetivo %<input name="margenObjetivoPct" type="number" value="${p.margenObjetivoPct || 40}" /></label>
          <div class="imp-form-actions">
            <button class="imp-btn imp-btn--primary" type="submit">Guardar parámetros</button>
            <span class="imp-muted">Luz/hora ≈ <strong>${money(costoHoraImpresora())}</strong> (= ${p.tarifaKwhClp ?? LUZ_CHILE.tarifaKwhClp} × ${p.consumoImpresoraKw ?? LUZ_CHILE.consumoImpresoraKw} kW)</span>
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
      const prev = data.parametros || {};
      data.parametros = {
        ...prev,
        tarifaKwhClp: Number(fd.get('tarifaKwhClp')),
        consumoImpresoraKw: Number(fd.get('consumoImpresoraKw')),
        valorHoraManoObraClp: Number(fd.get('valorHoraManoObraClp')),
        costoAnilloMetalLlaveroClp: Number(fd.get('costoAnilloMetalLlaveroClp')),
        costoBolsaEntregaClp: Number(fd.get('costoBolsaEntregaClp')),
        margenObjetivoPct: Number(fd.get('margenObjetivoPct')),
        impresoraModelo: prev.impresoraModelo || LUZ_CHILE.impresoraModelo,
        impresoraNotas: prev.impresoraNotas || LUZ_CHILE.impresoraNotas,
      };
      markDirty();
      renderAll();
      setStatus(`Parámetros luz actualizados — ${money(costoHoraImpresora())}/h · guarda online`, 'warn');
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

  function leerCalcPieza() {
    const form = $('#form-calc-pieza');
    if (!form) return null;
    const fd = new FormData(form);
    const modelo = Number(fd.get('modelo') || 0);
    const soportes = Number(fd.get('soportes') || 0);
    const purge = Number(fd.get('purge') || 0);
    const prod = {
      filamentoModeloGramos: modelo,
      filamentoSoportesGramos: soportes,
      filamentoPurgeGramos: purge,
      filamentoGramos: modelo + soportes + purge,
      costoFilamentoKgClp: Number(fd.get('kg')),
      horasImpresion: horasDesdePartes(fd.get('horasPart'), fd.get('minutosPart')),
      minutosPintado: Number(fd.get('m')),
      unidadesMetal: Number(fd.get('metal')),
      unidadesBolsa: Number(fd.get('bolsa')),
    };
    const c = costoProducto(prod);
    const margen = Number(data.parametros?.margenObjetivoPct || 40) / 100;
    const sugerido = Math.round(c.total / (1 - margen) / 10) * 10;
    return { prod, c, sugerido };
  }

  function leerProductoDesdeModal() {
    const form = $('#form-producto-modal');
    if (!form) return null;
    const fd = new FormData(form);
    const prod = {
      filamentoGramos: Number(fd.get('filamentoGramos')),
      costoFilamentoKgClp: Number(fd.get('costoFilamentoKgClp')),
      horasImpresion: Number(fd.get('horasImpresion')),
      minutosPintado: Number(fd.get('minutosPintado')),
      unidadesMetal: Number(fd.get('unidadesMetal')),
      unidadesBolsa: Number(fd.get('unidadesBolsa')),
    };
    return { prod, c: costoProducto(prod) };
  }

  function actualizarCostoModal() {
    const est = $('#imp-modal-costo-est');
    const leido = leerProductoDesdeModal();
    if (!est || !leido) return;
    est.innerHTML = `Costo estimado: <strong>${money(leido.c.total)}</strong>
      · Filamento ${money(leido.c.filamento)} · Luz ${money(leido.c.luz)} · Pintado ${money(leido.c.pintado)}
      · Metal ${money(leido.c.metal)} · Bolsa ${money(leido.c.bolsa)}`;
  }

  function cerrarModalProducto() {
    const modal = $('#imp-modal-producto');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('imp-modal-open');
  }

  let calcDraft = null;

  function abrirModalDesdeCalculadora() {
    const calc = leerCalcPieza();
    if (!calc) {
      setStatus('Completa la calculadora primero', 'warn');
      return;
    }
    const modal = $('#imp-modal-producto');
    if (!modal) return;
    calcDraft = { ...calc.prod };
    modal.querySelector('[name=sku]').value = siguienteSkuProducto('Producto');
    modal.querySelector('[name=nombre]').value = '';
    modal.querySelector('[name=filamentoGramos]').value = calc.prod.filamentoGramos;
    modal.querySelector('[name=costoFilamentoKgClp]').value = calc.prod.costoFilamentoKgClp;
    modal.querySelector('[name=horasImpresion]').value = Number(calc.prod.horasImpresion || 0).toFixed(4);
    modal.querySelector('[name=minutosPintado]').value = calc.prod.minutosPintado;
    modal.querySelector('[name=unidadesMetal]').value = calc.prod.unidadesMetal;
    modal.querySelector('[name=unidadesBolsa]').value = calc.prod.unidadesBolsa;
    modal.querySelector('[name=precioVentaSugeridoClp]').value = calc.sugerido;
    modal.querySelector('[name=notas]').value =
      `Desde calculadora · modelo ${calc.prod.filamentoModeloGramos}g + soportes ${calc.prod.filamentoSoportesGramos}g + purge ${calc.prod.filamentoPurgeGramos}g · costo est. ${Math.round(calc.c.total)} CLP`;
    actualizarCostoModal();
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.classList.add('imp-modal-open');
    modal.querySelector('[name=nombre]')?.focus();
  }

  function renderCostos() {
    const margen = Number(data.parametros?.margenObjetivoPct || 40) / 100;
    const p = data.parametros || {};
    const avgFilKg = avgCostoFilamentoKg(data) || 12950;

    const blocks = (data.productos || [])
      .map((prod) => {
        const c = costoProducto(prod);
        const pid = escapeHtml(prod.id || '');
        const sku = escapeHtml(prod.sku || prod.id || '—');
        const th = partesHoras(prod.horasImpresion);
        const tieneDesglose =
          prod.filamentoModeloGramos != null ||
          prod.filamentoSoportesGramos != null ||
          prod.filamentoPurgeGramos != null;
        const usarDesglose = tieneDesglose ? '1' : '0';
        return `
        <div class="imp-card imp-card--prod" data-prod-id="${pid}">
          <div class="imp-prod-head">
            <h3>${escapeHtml(prod.nombre)}</h3>
            <div class="imp-prod-head__meta">
              <span class="imp-sku" title="SKU del producto">SKU ${sku}</span>
              <button type="button" class="imp-btn imp-btn--danger imp-btn--sm" data-del-prod="${pid}">Eliminar</button>
            </div>
          </div>
          <div class="imp-costo-live" data-costo-live="${pid}">${htmlCostoLive(c, margen, prod.precioVentaSugeridoClp)}</div>
          <form class="imp-form imp-form--prod" data-editar-prod="${pid}">
            <label>Nombre<input name="nombre" required value="${escapeHtml(prod.nombre || '')}" /></label>
            <label>SKU
              <input name="sku" required pattern="[A-Za-z]{2,10}[0-9]{3}" title="Ej. PCGATO001, PLMONS001" value="${sku}" />
            </label>
            <label>$ / kg filamento (CLP)<input name="costoFilamentoKgClp" type="number" min="0" step="1" value="${Number(prod.costoFilamentoKgClp) || 0}" /></label>
            <label class="imp-form-span">Desglose slicer (como en la foto)
              <select name="usarDesglose">
                <option value="1"${usarDesglose === '1' ? ' selected' : ''}>Usar modelo + soportes + purge</option>
                <option value="0"${usarDesglose === '0' ? ' selected' : ''}>Usar solo total de gramos</option>
              </select>
            </label>
            <label>Modelo (g)<input name="filamentoModeloGramos" type="number" min="0" step="0.01" value="${Number(prod.filamentoModeloGramos || 0)}" /></label>
            <label>Soportes (g)<input name="filamentoSoportesGramos" type="number" min="0" step="0.01" value="${Number(prod.filamentoSoportesGramos || 0)}" /></label>
            <label>Purge / descargado (g)<input name="filamentoPurgeGramos" type="number" min="0" step="0.01" value="${Number(prod.filamentoPurgeGramos || 0)}" /></label>
            <label>Total filamento (g)<input name="filamentoGramos" type="number" min="0" step="0.01" value="${Number(prod.filamentoGramos || c.gramos || 0)}" /></label>
            <label>Metros filamento<input name="filamentoMetros" type="number" min="0" step="0.01" value="${Number(prod.filamentoMetros || 0)}" /></label>
            <label>Horas impresión<input name="horasPart" type="number" min="0" step="1" value="${th.horas}" /></label>
            <label>Minutos impresión<input name="minutosPart" type="number" min="0" max="59" step="1" value="${th.minutos}" /></label>
            <label>Minutos pintado / MO<input name="minutosPintado" type="number" min="0" step="1" value="${Number(prod.minutosPintado || 0)}" /></label>
            <label>Unidades metal<input name="unidadesMetal" type="number" min="0" step="1" value="${Number(prod.unidadesMetal || 0)}" /></label>
            <label>Bolsas<input name="unidadesBolsa" type="number" min="0" step="1" value="${Number(prod.unidadesBolsa || 0)}" /></label>
            <label>Precio venta público (CLP)<input name="precioVentaSugeridoClp" type="number" min="0" step="10" value="${Number(prod.precioVentaSugeridoClp) || ''}" placeholder="Ej. 8990" /></label>
            <label>Coste slicer (ref.)<input name="costoSlicerRef" type="number" min="0" step="0.01" value="${Number(prod.costoSlicerRef || 0)}" title="Valor que muestra el slicer; no es CLP" /></label>
            <label class="imp-form-span">Notas<textarea name="notas" rows="2">${escapeHtml(prod.notas || '')}</textarea></label>
            <div class="imp-form-actions">
              <button type="submit" class="imp-btn imp-btn--primary">Guardar parámetros</button>
              <button type="button" class="imp-btn" data-regen-sku="${pid}">Regenerar SKU</button>
              <span class="imp-muted">Al editar se recalcula el costo · luz/h ≈ ${money(costoHoraImpresora())} · MO ${money(p.valorHoraManoObraClp || 0)}/h</span>
            </div>
          </form>
        </div>`;
      })
      .join('');

    $('#tab-costos').innerHTML = `
      <div class="imp-card">
        <h2>Costos por pieza (luz + materiales)</h2>
        <p class="imp-muted">Edita los parámetros del slicer (modelo, soportes, purge, tiempo) y el costo se recalcula al instante. Luego <strong>Guardar parámetros</strong> y <strong>Guardar online</strong>.</p>
        <p class="imp-muted">$/kg filamento ref.: <strong>${money(avgFilKg)}</strong> · luz/hora ≈ <strong>${money(costoHoraImpresora())}</strong> · tarifa Chile <strong>${p.tarifaKwhClp ?? LUZ_CHILE.tarifaKwhClp}</strong> $/kWh · ${p.impresoraModelo || 'Centauri Carbon 2'} <strong>${p.consumoImpresoraKw ?? LUZ_CHILE.consumoImpresoraKw}</strong> kW</p>
      </div>
      ${blocks || '<div class="imp-card">Sin productos aún — usa la calculadora y Guarda como producto</div>'}
      <div class="imp-card">
        <h3>Calculadora rápida de pieza</h3>
        <form class="imp-form" id="form-calc-pieza">
          <label>Modelo (g)<input name="modelo" type="number" step="0.01" value="135.55" /></label>
          <label>Soportes (g)<input name="soportes" type="number" step="0.01" value="8.43" /></label>
          <label>Purge (g)<input name="purge" type="number" step="0.01" value="0.47" /></label>
          <label>$ / kg filamento<input name="kg" type="number" value="${avgFilKg}" /></label>
          <label>Horas<input name="horasPart" type="number" min="0" step="1" value="3" /></label>
          <label>Minutos<input name="minutosPart" type="number" min="0" max="59" step="1" value="25" /></label>
          <label>Minutos pintado<input name="m" type="number" value="0" /></label>
          <label>Unidades metal<input name="metal" type="number" value="0" /></label>
          <label>Bolsas<input name="bolsa" type="number" value="1" /></label>
        </form>
        <div class="imp-calc-live" id="calc-pieza-live">Calculando…</div>
        <div class="imp-form-actions" style="margin-top:0.75rem">
          <button type="button" class="imp-btn imp-btn--primary" id="btn-calc-guardar">Guardar como producto</button>
          <span class="imp-muted">Total g = modelo + soportes + purge · abre modal con SKU y nombre</span>
        </div>
      </div>
    `;

    const updateCalc = () => {
      const form = $('#form-calc-pieza');
      const el = $('#calc-pieza-live');
      if (!form || !el) return;
      const fd = new FormData(form);
      const g =
        Number(fd.get('modelo') || 0) + Number(fd.get('soportes') || 0) + Number(fd.get('purge') || 0);
      const prod = {
        filamentoGramos: g,
        costoFilamentoKgClp: Number(fd.get('kg')),
        horasImpresion: horasDesdePartes(fd.get('horasPart'), fd.get('minutosPart')),
        minutosPintado: Number(fd.get('m')),
        unidadesMetal: Number(fd.get('metal')),
        unidadesBolsa: Number(fd.get('bolsa')),
      };
      const c = costoProducto(prod);
      const sugerido = c.total / (1 - margen);
      el.innerHTML = `
          Total filamento <strong>${g.toFixed(2)} g</strong>
          · Filamento ${money(c.filamento)} · Luz ${money(c.luz)} · Pintado ${money(c.pintado)} · Metal ${money(c.metal)} · Bolsa ${money(c.bolsa)}
          <br><strong>Costo unitario: ${money(c.total)}</strong> · precio sugerido c/ margen ${Math.round(margen * 100)}%: <strong>${money(sugerido)}</strong>
          <div class="imp-muted" style="margin-top:0.35rem">Tarifa Chile ${p.tarifaKwhClp ?? LUZ_CHILE.tarifaKwhClp} $/kWh · ${p.impresoraModelo || 'Centauri Carbon 2'} ${p.consumoImpresoraKw ?? LUZ_CHILE.consumoImpresoraKw} kW</div>`;
      form.dataset.calcSnapshot = JSON.stringify({ ...prod, sugerido, c });
    };
    $('#form-calc-pieza')?.addEventListener('input', updateCalc);
    updateCalc();
    $('#btn-calc-guardar')?.addEventListener('click', abrirModalDesdeCalculadora);

    $('#tab-costos').querySelectorAll('[data-del-prod]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-prod');
        const prod = (data.productos || []).find((x) => x.id === id);
        if (!prod) return;
        const ok = confirm(`¿Eliminar «${prod.nombre}» (${prod.sku || id})?\nEsta acción no se puede deshacer (guarda online después).`);
        if (!ok) return;
        data.productos = (data.productos || []).filter((x) => x.id !== id);
        markDirty();
        renderAll();
        activarTab('costos');
        setStatus(`Producto «${prod.nombre}» eliminado — guarda online`, 'warn');
      });
    });

    $('#tab-costos').querySelectorAll('[data-editar-prod]').forEach((form) => {
      const id = form.getAttribute('data-editar-prod');
      const live = form.closest('.imp-card')?.querySelector('[data-costo-live]');
      const syncTotalFromDesglose = () => {
        const usar = form.querySelector('[name=usarDesglose]')?.value === '1';
        const totalInput = form.querySelector('[name=filamentoGramos]');
        if (!usar || !totalInput) return;
        const modelo = Number(form.querySelector('[name=filamentoModeloGramos]')?.value || 0);
        const soportes = Number(form.querySelector('[name=filamentoSoportesGramos]')?.value || 0);
        const purge = Number(form.querySelector('[name=filamentoPurgeGramos]')?.value || 0);
        totalInput.value = String(Math.round((modelo + soportes + purge) * 100) / 100);
      };
      const refreshLive = () => {
        syncTotalFromDesglose();
        const leido = leerProductoDesdeForm(form);
        if (!leido || !live) return;
        const c = costoProducto(leido);
        live.innerHTML = htmlCostoLive(c, margen, leido.precioVentaSugeridoClp);
      };
      form.querySelector('[data-regen-sku]')?.addEventListener('click', () => {
        const nombre = form.querySelector('[name=nombre]')?.value || '';
        const skuInput = form.querySelector('[name=sku]');
        if (!skuInput) return;
        const otros = (data.productos || []).filter((x) => x.id !== id);
        skuInput.value = siguienteSkuProducto(nombre, id, otros);
        setStatus(`SKU sugerido: ${skuInput.value}`, 'ok');
      });
      form.addEventListener('input', refreshLive);
      form.addEventListener('change', refreshLive);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const leido = leerProductoDesdeForm(form);
        const prod = (data.productos || []).find((x) => x.id === id);
        if (!prod || !leido || !leido.nombre) return;
        const skuNuevo = String(form.querySelector('[name=sku]')?.value || '')
          .trim()
          .toUpperCase();
        if (!esSkuSimple(skuNuevo)) {
          setStatus('SKU inválido — usa formato tipo PCGATO001 / PLMONS001', 'warn');
          return;
        }
        if ((data.productos || []).some((x) => x.id !== id && String(x.sku || '').toUpperCase() === skuNuevo)) {
          setStatus(`El SKU ${skuNuevo} ya existe en otro producto`, 'warn');
          return;
        }
        Object.assign(prod, {
          nombre: leido.nombre,
          sku: skuNuevo,
          filamentoModeloGramos: leido.filamentoModeloGramos,
          filamentoSoportesGramos: leido.filamentoSoportesGramos,
          filamentoPurgeGramos: leido.filamentoPurgeGramos,
          filamentoMetros: leido.filamentoMetros,
          filamentoGramos: leido.filamentoGramos,
          costoFilamentoKgClp: leido.costoFilamentoKgClp,
          horasImpresion: leido.horasImpresion,
          minutosPintado: leido.minutosPintado,
          unidadesMetal: leido.unidadesMetal,
          unidadesBolsa: leido.unidadesBolsa,
          precioVentaSugeridoClp: leido.precioVentaSugeridoClp,
          costoSlicerRef: leido.costoSlicerRef,
          notas: leido.notas,
        });
        markDirty();
        refreshLive();
        const card = form.closest('.imp-card');
        const head = card?.querySelector('.imp-prod-head h3');
        const skuPill = card?.querySelector('.imp-sku');
        if (head) head.textContent = leido.nombre;
        if (skuPill) skuPill.textContent = `SKU ${skuNuevo}`;
        setStatus(`«${leido.nombre}» actualizado (${skuNuevo}) — costo ${money(costoProducto(prod).total)} · guarda online`, 'warn');
      });
      refreshLive();
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

  const TABS_VALIDOS = new Set(['resumen', 'gastos', 'ventas', 'operacion', 'costos', 'ads', 'bitacora']);

  function activarTab(tab) {
    const name = TABS_VALIDOS.has(tab) ? tab : 'resumen';
    document.querySelectorAll('#imp-tabs button').forEach((b) => b.classList.remove('is-active'));
    document.querySelectorAll('.imp-panel').forEach((p) => p.classList.remove('is-active'));
    const btn = $(`#imp-tabs button[data-tab="${name}"]`);
    const panel = $(`#tab-${name}`);
    if (btn) btn.classList.add('is-active');
    if (panel) panel.classList.add('is-active');
    try {
      const url = new URL(window.location.href);
      if (name === 'resumen') url.searchParams.delete('tab');
      else url.searchParams.set('tab', name);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (_) {
      /* ignore */
    }
  }

  function tabDesdeUrl() {
    try {
      const q = new URLSearchParams(window.location.search).get('tab');
      if (q && TABS_VALIDOS.has(q)) return q;
    } catch (_) {
      /* ignore */
    }
    return 'resumen';
  }

  document.querySelectorAll('#imp-tabs button').forEach((btn) => {
    btn.addEventListener('click', () => activarTab(btn.dataset.tab));
  });

  $('#btn-guardar').addEventListener('click', () => {
    save().catch((e) => setStatus(String(e.message || e), 'err'));
  });
  $('#btn-recargar').addEventListener('click', () => {
    if (dirty && !confirm('Hay cambios sin guardar. ¿Recargar igual?')) return;
    load().catch((e) => setStatus(String(e.message || e), 'err'));
  });

  $('#form-producto-modal')?.querySelector('[name=nombre]')?.addEventListener('input', (e) => {
    const modal = $('#imp-modal-producto');
    const skuInput = modal?.querySelector('[name=sku]');
    if (!skuInput) return;
    const nombre = String(e.target.value || '').trim();
    if (!nombre) return;
    skuInput.value = siguienteSkuProducto(nombre);
  });

  $('#form-producto-modal')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const nombre = String(fd.get('nombre') || '').trim();
    if (!nombre) return;
    let sku = String(fd.get('sku') || '')
      .trim()
      .toUpperCase();
    if (!esSkuSimple(sku)) sku = siguienteSkuProducto(nombre);
    if ((data.productos || []).some((p) => String(p.sku || '').toUpperCase() === sku)) {
      sku = siguienteSkuProducto(nombre);
    }
    data.productos = data.productos || [];
    data.productos.push({
      id: uid('prod'),
      sku,
      nombre,
      activo: true,
      filamentoModeloGramos: Number(calcDraft?.filamentoModeloGramos ?? 0),
      filamentoSoportesGramos: Number(calcDraft?.filamentoSoportesGramos ?? 0),
      filamentoPurgeGramos: Number(calcDraft?.filamentoPurgeGramos ?? 0),
      filamentoMetros: Number(calcDraft?.filamentoMetros ?? 0),
      filamentoGramos: Number(fd.get('filamentoGramos')),
      costoFilamentoKgClp: Number(fd.get('costoFilamentoKgClp')),
      horasImpresion: Number(fd.get('horasImpresion')),
      minutosPintado: Number(fd.get('minutosPintado')),
      unidadesMetal: Number(fd.get('unidadesMetal')),
      unidadesBolsa: Number(fd.get('unidadesBolsa')),
      precioVentaSugeridoClp: Number(fd.get('precioVentaSugeridoClp') || 0),
      costoSlicerRef: Number(calcDraft?.costoSlicerRef ?? 0),
      notas: String(fd.get('notas') || '').trim(),
    });
    calcDraft = null;
    cerrarModalProducto();
    markDirty();
    renderAll();
    setStatus(`Producto «${nombre}» agregado (${sku}) — guarda online`, 'warn');
    activarTab('costos');
  });

  $('#form-producto-modal')?.addEventListener('input', actualizarCostoModal);
  $('#btn-modal-producto-cerrar')?.addEventListener('click', cerrarModalProducto);
  $('#btn-modal-producto-cancelar')?.addEventListener('click', cerrarModalProducto);
  $('#imp-modal-producto')?.addEventListener('click', (e) => {
    if (e.target?.id === 'imp-modal-producto') cerrarModalProducto();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#imp-modal-producto')?.classList.contains('is-open')) {
      cerrarModalProducto();
    }
  });

  window.addEventListener('beforeunload', (e) => {
    if (dirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  load()
    .then(() => activarTab(tabDesdeUrl()))
    .catch((e) => setStatus(String(e.message || e), 'err'));
})();
