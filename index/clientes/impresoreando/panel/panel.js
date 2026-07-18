/* Impresoreando — panel socios (persistencia /api/impresoreando) */
(function () {
  const API = '/api/impresoreando';
  let data = null;
  let dirty = false;

  const $ = (sel) => document.querySelector(sel);
  const money = (n) =>
    Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  const uid = (p) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  /** Productos: todos los dígitos se trabajan con máx. 2 decimales. */
  const round2 = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0;
    return Math.round(x * 100) / 100;
  };
  const num2 = (n) => round2(n).toFixed(2);

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
    if (asegurarProductoMaceteroPerroBulldog(d)) changed = true;
    if (asegurarProductoPortacompletoPerroBulldog(d)) changed = true;
    if (asegurarPedidos(d)) changed = true;
    if (asegurarSkusProductos(d)) changed = true;
    if (asegurarDecimalesProductos(d)) changed = true;
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
    // Precio sugerido = costo × (1 + %/100). Default 100% sobre el costo (×2).
    const margen = Number(p.margenObjetivoPct);
    if (!Number.isFinite(margen) || margen === 40) {
      p.margenObjetivoPct = 100;
      changed = true;
    }
    return changed;
  }

  /** Precio sugerido: +margen% sobre el costo (100% ⇒ precio = costo × 2). */
  function precioSugeridoDesdeCosto(costoTotal) {
    const pct = Number(data?.parametros?.margenObjetivoPct ?? 100);
    const markup = Number.isFinite(pct) ? pct / 100 : 1;
    return round2(Number(costoTotal || 0) * (1 + markup));
  }

  function markupRealPct(precioVenta, costoTotal) {
    const costo = Number(costoTotal || 0);
    const precio = Number(precioVenta || 0);
    if (!(precio > 0) || !(costo > 0)) return null;
    return ((precio - costo) / costo) * 100;
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

  function upsertProductoSeed(d, id, seed) {
    d.productos = Array.isArray(d.productos) ? d.productos : [];
    const existing = d.productos.find((p) => p.id === id);
    if (!existing) {
      d.productos.push({ id, ...seed });
      return true;
    }
    let changed = false;
    if (!existing.id) {
      existing.id = id;
      changed = true;
    }
    const backfill = [
      'filamentoModeloGramos',
      'filamentoSoportesGramos',
      'filamentoPurgeGramos',
      'filamentoMetros',
      'costoSlicerRef',
      'sku',
    ];
    for (const k of backfill) {
      if (existing[k] == null && seed[k] != null) {
        existing[k] = seed[k];
        changed = true;
      }
    }
    return changed;
  }

  const COSTO_PLA_NEGRO_KG = 17986; // PLA+ Negro Elegoo (orden #312435)

  /** Macetero perro bulldog — slicer: 96,95 g · 3 h 21 m · PLA+ negro. */
  function asegurarProductoMaceteroPerroBulldog(d) {
    const changed = upsertProductoSeed(d, 'prod-macetero-perro-bulldog', {
      sku: 'MCPERROBU001',
      nombre: 'Macetero perro bulldog',
      activo: true,
      filamentoModeloGramos: 95.36,
      filamentoSoportesGramos: 1.12,
      filamentoPurgeGramos: 0.47,
      filamentoMetros: 32.24,
      filamentoGramos: 96.95,
      costoFilamentoKgClp: COSTO_PLA_NEGRO_KG,
      horasImpresion: 3.35,
      minutosPintado: 0,
      unidadesMetal: 0,
      unidadesBolsa: 1,
      precioVentaSugeridoClp: 0,
      costoSlicerRef: 1.94,
      notas:
        'Slicer: modelo 95,36 g + soportes 1,12 g + purge 0,47 g = 96,95 g · 32,24 m · 3 h 21 m · coste slicer 1,94 (ref). PLA+ negro $17.986/kg.',
    });
    return migrarFilamentoNegroProducto(d, 'prod-macetero-perro-bulldog') || changed;
  }

  /** Portacompleto perro bulldog — placa 2 uds: 122,70 g / 4 h 2 m → costo por unidad. */
  function asegurarProductoPortacompletoPerroBulldog(d) {
    const changed = upsertProductoSeed(d, 'prod-portacompleto-perro-bulldog', {
      sku: 'PCPERROBU001',
      nombre: 'Portacompleto perro bulldog',
      activo: true,
      filamentoModeloGramos: 59.88,
      filamentoSoportesGramos: 1.25,
      filamentoPurgeGramos: 0.24,
      filamentoMetros: 20.41,
      filamentoGramos: 61.35,
      costoFilamentoKgClp: COSTO_PLA_NEGRO_KG,
      horasImpresion: 2.02,
      minutosPintado: 0,
      unidadesMetal: 0,
      unidadesBolsa: 1,
      precioVentaSugeridoClp: 0,
      costoSlicerRef: 1.225,
      notas:
        'Slicer placa ×2: 122,70 g / 4 h 2 m → por unidad 61,35 g / 2 h 1 m. PLA+ negro $17.986/kg. Coste slicer placa 2,45 (ref). Sin pintado (editable).',
    });
    return migrarFilamentoNegroProducto(d, 'prod-portacompleto-perro-bulldog') || changed;
  }

  /** Si quedó con $/kg amarillo (12.690), pasa a PLA+ negro. */
  function migrarFilamentoNegroProducto(d, id) {
    const p = (d.productos || []).find((x) => x.id === id);
    if (!p) return false;
    if (Number(p.costoFilamentoKgClp) === 12690) {
      p.costoFilamentoKgClp = COSTO_PLA_NEGRO_KG;
      if (p.notas && /amarillo/i.test(p.notas)) {
        p.notas = String(p.notas).replace(/PLA amarillo[^.]*/i, 'PLA+ negro $17.986/kg');
      }
      return true;
    }
    return false;
  }

  function asegurarPedidos(d) {
    let changed = false;
    if (!Array.isArray(d.pedidos)) {
      d.pedidos = [];
      changed = true;
    }
    d.meta = d.meta || {};
    if (d.meta.pedidoSeq == null) {
      const maxNum = (d.pedidos || []).reduce((m, p) => {
        const n = Number(String(p.numero || '').replace(/\D/g, '')) || 0;
        return Math.max(m, n);
      }, 0);
      d.meta.pedidoSeq = maxNum;
      changed = true;
    }
    return changed;
  }

  function siguienteNumeroPedido() {
    data.meta = data.meta || {};
    data.meta.pedidoSeq = Number(data.meta.pedidoSeq || 0) + 1;
    return `PED-${String(data.meta.pedidoSeq).padStart(3, '0')}`;
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
      sku: 'PLMONS001',
      nombre: 'Porta lata Monster',
      activo: true,
      filamentoModeloGramos: 135.55,
      filamentoSoportesGramos: 8.43,
      filamentoPurgeGramos: 0.47,
      filamentoMetros: 48.04,
      filamentoGramos: 144.45,
      costoFilamentoKgClp: COSTO_PLA_NEGRO_KG,
      horasImpresion: 3.42,
      minutosPintado: 0,
      unidadesMetal: 0,
      unidadesBolsa: 1,
      precioVentaSugeridoClp: 0,
      costoSlicerRef: 2.89,
      notas:
        'Slicer: modelo 135,55 g + soportes 8,43 g + purge 0,47 g = 144,45 g · 48,04 m · 3 h 25 m · coste slicer 2,89 (ref). PLA+ negro $17.986/kg. Logo en relieve.',
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
      'sku',
    ];
    for (const k of backfill) {
      if (existing[k] == null && seed[k] != null) {
        existing[k] = seed[k];
        changed = true;
      }
    }
    if (migrarFilamentoNegroProducto(d, id)) changed = true;
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
      'prod-macetero-perro-bulldog': 'MCPERROBU001',
      'prod-portacompleto-perro-bulldog': 'PCPERROBU001',
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
    const totalMin = Math.max(0, Math.round(round2(horas) * 60));
    return { horas: Math.floor(totalMin / 60), minutos: totalMin % 60 };
  }

  function horasDesdePartes(horas, minutos) {
    return round2(Number(horas || 0) + Number(minutos || 0) / 60);
  }

  function gramosDesdeDesglose(prod) {
    const modelo = Number(prod.filamentoModeloGramos);
    const soportes = Number(prod.filamentoSoportesGramos);
    const purge = Number(prod.filamentoPurgeGramos);
    const tieneDesglose =
      prod.filamentoModeloGramos != null ||
      prod.filamentoSoportesGramos != null ||
      prod.filamentoPurgeGramos != null;
    if (!tieneDesglose) return round2(prod.filamentoGramos || 0);
    return round2(
      (Number.isFinite(modelo) ? modelo : 0) +
        (Number.isFinite(soportes) ? soportes : 0) +
        (Number.isFinite(purge) ? purge : 0)
    );
  }

  const CAMPOS_NUM_PRODUCTO = [
    'filamentoModeloGramos',
    'filamentoSoportesGramos',
    'filamentoPurgeGramos',
    'filamentoMetros',
    'filamentoGramos',
    'costoFilamentoKgClp',
    'horasImpresion',
    'minutosPintado',
    'unidadesMetal',
    'unidadesBolsa',
    'precioVentaSugeridoClp',
    'costoSlicerRef',
  ];

  function normalizarDecimalesProducto(prod) {
    if (!prod || typeof prod !== 'object') return false;
    let changed = false;
    for (const k of CAMPOS_NUM_PRODUCTO) {
      if (prod[k] == null || prod[k] === '') continue;
      const next = round2(prod[k]);
      if (Number(prod[k]) !== next) {
        prod[k] = next;
        changed = true;
      } else {
        prod[k] = next;
      }
    }
    return changed;
  }

  function asegurarDecimalesProductos(d) {
    d.productos = Array.isArray(d.productos) ? d.productos : [];
    let changed = false;
    for (const p of d.productos) {
      if (normalizarDecimalesProducto(p)) changed = true;
    }
    return changed;
  }

  function costoProducto(prod) {
    const p = data.parametros || {};
    const gramos = gramosDesdeDesglose(prod) || round2(prod.filamentoGramos || 0);
    const filamento = round2((gramos / 1000) * Number(prod.costoFilamentoKgClp || 0));
    const luz = round2(Number(prod.horasImpresion || 0) * costoHoraImpresora());
    const pintado = round2(
      (Number(prod.minutosPintado || 0) / 60) * Number(p.valorHoraManoObraClp || 0)
    );
    const metal = round2(Number(prod.unidadesMetal || 0) * Number(p.costoAnilloMetalLlaveroClp || 0));
    const bolsa = round2(Number(prod.unidadesBolsa || 0) * Number(p.costoBolsaEntregaClp || 0));
    const total = round2(filamento + luz + pintado + metal + bolsa);
    return { filamento, luz, pintado, metal, bolsa, total, gramos: round2(gramos) };
  }

  function leerProductoDesdeForm(form) {
    if (!form) return null;
    const fd = new FormData(form);
    const modelo = round2(fd.get('filamentoModeloGramos') || 0);
    const soportes = round2(fd.get('filamentoSoportesGramos') || 0);
    const purge = round2(fd.get('filamentoPurgeGramos') || 0);
    const totalDesglose = round2(modelo + soportes + purge);
    const gramosManual = round2(fd.get('filamentoGramos') || 0);
    const usarDesglose = fd.get('usarDesglose') === '1';
    const filamentoGramos = usarDesglose ? totalDesglose : gramosManual;
    const horasImpresion = horasDesdePartes(fd.get('horasPart'), fd.get('minutosPart'));
    return {
      nombre: String(fd.get('nombre') || '').trim(),
      filamentoModeloGramos: modelo,
      filamentoSoportesGramos: soportes,
      filamentoPurgeGramos: purge,
      filamentoMetros: round2(fd.get('filamentoMetros') || 0),
      filamentoGramos,
      costoFilamentoKgClp: round2(fd.get('costoFilamentoKgClp') || 0),
      horasImpresion,
      minutosPintado: round2(fd.get('minutosPintado') || 0),
      unidadesMetal: round2(fd.get('unidadesMetal') || 0),
      unidadesBolsa: round2(fd.get('unidadesBolsa') || 0),
      precioVentaSugeridoClp: round2(fd.get('precioVentaSugeridoClp') || 0),
      costoSlicerRef: round2(fd.get('costoSlicerRef') || 0),
      notas: String(fd.get('notas') || '').trim(),
      usarDesglose,
    };
  }

  function htmlCostoLive(c, _margenUnused, precioVenta) {
    const pctObj = Number(data?.parametros?.margenObjetivoPct ?? 100);
    const sugerido = precioSugeridoDesdeCosto(c.total);
    const markupReal = markupRealPct(precioVenta, c.total);
    return `
      <div class="imp-grid imp-grid--costo-live">
        <div class="imp-kpi"><span>Filamento (${Number(c.gramos || 0).toFixed(2)} g)</span><strong>${money(c.filamento)}</strong></div>
        <div class="imp-kpi"><span>Luz (impresión)</span><strong>${money(c.luz)}</strong></div>
        <div class="imp-kpi"><span>Pintado / MO</span><strong>${money(c.pintado)}</strong></div>
        <div class="imp-kpi"><span>Metal</span><strong>${money(c.metal)}</strong></div>
        <div class="imp-kpi"><span>Bolsa</span><strong>${money(c.bolsa)}</strong></div>
        <div class="imp-kpi"><span>Costo unitario</span><strong>${money(c.total)}</strong></div>
        <div class="imp-kpi imp-kpi--accent"><span>Precio sugerido (+${pctObj}% sobre costo)</span><strong>${money(sugerido)}</strong></div>
        <div class="imp-kpi ${markupReal == null ? '' : markupReal >= pctObj ? 'imp-kpi--ok' : 'imp-kpi--warn'}"><span>Markup real sobre costo</span><strong>${markupReal == null ? '—' : `${markupReal.toFixed(0)}%`}</strong></div>
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
    const pedidosActivos = (data.pedidos || []).filter((p) =>
      pedidoActivo(p.estado || 'pendiente')
    );
    const pedidosPendientes = pedidosActivos;
    const montoPedidosPend = pedidosActivos.reduce((a, p) => a + Number(p.montoNeto || 0), 0);
    const pctMarkup = Number(data.parametros?.margenObjetivoPct ?? 100);
    const filasCostoProd = (data.productos || [])
      .map((prod) => {
        const c = costoProducto(prod);
        const sugerido = precioSugeridoDesdeCosto(c.total);
        return `<tr>
          <td><span class="imp-sku">${escapeHtml(prod.sku || '—')}</span></td>
          <td>${escapeHtml(prod.nombre || '')}</td>
          <td class="num">${money(c.total)}</td>
          <td class="num"><strong>${money(sugerido)}</strong></td>
        </tr>`;
      })
      .join('');

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
          <span><i class="imp-dot imp-dot--ventas"></i>Ventas ${money(ventas)} · solo cuentan al transferir pedido → venta</span>
        </div>
      </div>
      <div class="imp-card">
        <h2>Costos de producto (resumen)</h2>
        <p class="imp-muted">Costo y precio sugerido con <strong>+${pctMarkup}% sobre el costo</strong> (×${(1 + pctMarkup / 100).toFixed(0)}). Detalle en <button type="button" class="imp-linkish" data-goto-tab="costos">Costos producto</button>.</p>
        <div class="imp-table-wrap">
          <table class="imp-table">
            <thead><tr><th>SKU</th><th>Producto</th><th>Costo</th><th>Precio sugerido (+${pctMarkup}%)</th></tr></thead>
            <tbody>${filasCostoProd || '<tr><td colspan="4">Sin productos</td></tr>'}</tbody>
          </table>
        </div>
      </div>
      <div class="imp-grid">
        <div class="imp-kpi"><span>Gastos totales (ambos)</span><strong>${money(gastos)}</strong></div>
        <div class="imp-kpi imp-kpi--ok"><span>Ventas (contabilizadas)</span><strong>${money(ventas)}</strong></div>
        <div class="imp-kpi"><span>Pedidos activos</span><strong>${pedidosActivos.length} · ${money(montoPedidosPend)}</strong></div>
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

  function badgeEstadoPedido(estado) {
    if (estado === 'transferido') return '<span class="imp-badge imp-badge--ok">Transferido → venta</span>';
    if (estado === 'listo') return '<span class="imp-badge imp-badge--listo">Listo para entregar</span>';
    if (estado === 'en_impresion') return '<span class="imp-badge imp-badge--print">En impresión</span>';
    if (estado === 'cancelado') return '<span class="imp-badge">Cancelado</span>';
    return '<span class="imp-badge imp-badge--warn">Pendiente</span>';
  }

  function pedidoActivo(estado) {
    return ['pendiente', 'listo', 'en_impresion'].includes(estado || 'pendiente');
  }

  function textoEstadoItem(it) {
    const cant = Math.max(1, Number(it.cantidad || 1));
    const listos = Math.min(cant, Math.max(0, Number(it.listos ?? (it.estado === 'listo' ? cant : 0))));
    const enImp = Math.min(
      cant - listos,
      Math.max(0, Number(it.enImpresion ?? (it.estado === 'en_impresion' ? cant : 0)))
    );
    if (listos >= cant) return 'Listo';
    if (enImp > 0) return `${enImp}/${cant} en impresión${listos ? ` · ${listos} listo${listos === 1 ? '' : 's'}` : ''}`;
    if (listos > 0) return `${listos}/${cant} listo${listos === 1 ? '' : 's'}`;
    return 'Pendiente';
  }

  function badgeEstadoItem(it) {
    const txt = textoEstadoItem(it);
    const cant = Math.max(1, Number(it.cantidad || 1));
    const listos = Math.min(cant, Math.max(0, Number(it.listos ?? (it.estado === 'listo' ? cant : 0))));
    if (listos >= cant) return `<span class="imp-badge imp-badge--listo">${escapeHtml(txt)}</span>`;
    if (/impresión/i.test(txt)) return `<span class="imp-badge imp-badge--print">${escapeHtml(txt)}</span>`;
    return `<span class="imp-badge imp-badge--warn">${escapeHtml(txt)}</span>`;
  }

  /** Recalcula estado del pedido según ítems (no toca transferido/cancelado). */
  function sincronizarEstadoPedido(ped) {
    if (!ped || ['transferido', 'cancelado'].includes(ped.estado)) return ped?.estado;
    const items = ped.items || [];
    if (!items.length) {
      ped.estado = ped.estado || 'pendiente';
      return ped.estado;
    }
    // Pedidos viejos sin progreso por ítem: heredar del estado del pedido.
    items.forEach((it) => {
      const cant = Math.max(1, Number(it.cantidad || 1));
      if (it.listos == null && it.enImpresion == null && !it.estado) {
        if (ped.estado === 'listo') {
          it.listos = cant;
          it.enImpresion = 0;
          it.estado = 'listo';
        } else if (ped.estado === 'en_impresion') {
          it.listos = 0;
          it.enImpresion = cant;
          it.estado = 'en_impresion';
        }
      }
    });
    const todosListos = items.every((it) => {
      const cant = Math.max(1, Number(it.cantidad || 1));
      const listos = Number(it.listos ?? (it.estado === 'listo' ? cant : 0));
      return listos >= cant || it.estado === 'listo';
    });
    if (todosListos) {
      ped.estado = 'listo';
      return ped.estado;
    }
    const algoImp = items.some((it) => {
      const enImp = Number(it.enImpresion ?? 0);
      return enImp > 0 || it.estado === 'en_impresion';
    });
    ped.estado = algoImp ? 'en_impresion' : ped.estado === 'listo' ? 'pendiente' : ped.estado || 'pendiente';
    return ped.estado;
  }

  function asegurarCostosItem(it) {
    if (!it) return it;
    if (!(Number(it.costoUnitarioClp) > 0) && it.sku) {
      const prod = (data.productos || []).find((p) => p.sku === it.sku);
      if (prod) it.costoUnitarioClp = round2(costoProducto(prod).total);
    }
    if (!(Number(it.precioUnitarioClp) > 0) && Number(it.costoUnitarioClp) > 0) {
      it.precioUnitarioClp = precioSugeridoDesdeCosto(it.costoUnitarioClp);
    }
    return it;
  }

  function recalcularMontoPedido(ped) {
    if (!ped) return 0;
    let venta = 0;
    let costo = 0;
    (ped.items || []).forEach((it) => {
      asegurarCostosItem(it);
      const cant = Number(it.cantidad || 0);
      venta += cant * Number(it.precioUnitarioClp || 0);
      costo += cant * Number(it.costoUnitarioClp || 0);
    });
    ped.montoNeto = round2(venta);
    ped.costoTotal = round2(costo);
    return ped.montoNeto;
  }

  function renderItemsPedido(p) {
    const activo = pedidoActivo(p.estado);
    const lines = (p.items || [])
      .map((it, idx) => {
        asegurarCostosItem(it);
        const cant = it.cantidad || 1;
        const fil = it.filamento ? ` · ${escapeHtml(it.filamento)}` : '';
        const costoU = Number(it.costoUnitarioClp || 0);
        const precioU = Number(it.precioUnitarioClp || 0);
        const subtotal = round2(cant * precioU);
        const controls = activo
          ? `<span class="imp-item-actions">
              <button type="button" class="imp-btn imp-btn--sm" data-item-prog="${escapeHtml(p.id)}" data-idx="${idx}" data-accion="print" title="+1 en impresión">+ imp</button>
              <button type="button" class="imp-btn imp-btn--sm" data-item-prog="${escapeHtml(p.id)}" data-idx="${idx}" data-accion="listo" title="+1 listo">+ listo</button>
            </span>`
          : '';
        const precioField = activo
          ? `<label class="imp-item-precio">Precio venta/u
              <input type="number" min="0" step="0.01" value="${num2(precioU)}"
                data-precio-item="${escapeHtml(p.id)}" data-idx="${idx}" />
            </label>`
          : `<span>Precio venta/u <strong>${money(precioU)}</strong></span>`;
        return `<div class="imp-pedido-item">
          <div class="imp-pedido-item__head">
            <span>${cant}× ${escapeHtml(it.sku || '')} ${escapeHtml(it.nombre || '')}${fil}</span>
            ${badgeEstadoItem(it)}
            ${controls}
          </div>
          <div class="imp-pedido-item__money">
            <span>Costo/u <strong>${money(costoU)}</strong></span>
            ${precioField}
            <span>Subtotal <strong>${money(subtotal)}</strong></span>
          </div>
        </div>`;
      })
      .join('');
    return lines || '<div class="imp-muted">Sin ítems</div>';
  }

  let pedidoEditDraft = null;

  function optsSkuProducto(selected) {
    return (data.productos || [])
      .map((p) => {
        const sel = p.sku === selected ? ' selected' : '';
        return `<option value="${escapeHtml(p.sku || '')}"${sel}>${escapeHtml(p.sku || '')} · ${escapeHtml(p.nombre || '')}</option>`;
      })
      .join('');
  }

  function cerrarModalPedido() {
    const modal = $('#imp-modal-pedido');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('imp-modal-open');
    pedidoEditDraft = null;
    const body = $('#imp-modal-pedido-body');
    if (body) body.innerHTML = '';
  }

  function capturarDraftDesdeModal() {
    if (!pedidoEditDraft) return null;
    const form = $('#form-editar-pedido');
    if (!form) return pedidoEditDraft;
    const fd = new FormData(form);
    pedidoEditDraft.fecha = String(fd.get('fecha') || pedidoEditDraft.fecha || '');
    pedidoEditDraft.cliente = String(fd.get('cliente') || '').trim();
    pedidoEditDraft.canal = String(fd.get('canal') || '').trim();
    pedidoEditDraft.notas = String(fd.get('notas') || '').trim();
    pedidoEditDraft.socioRegistro = String(fd.get('socioRegistro') || 'Ambos');
    pedidoEditDraft.estado = String(fd.get('estado') || pedidoEditDraft.estado || 'pendiente');
    const rows = form.querySelectorAll('[data-edit-item]');
    const items = [];
    rows.forEach((row) => {
      const sku = String(row.querySelector('[name="sku"]')?.value || '').trim();
      const prod = (data.productos || []).find((p) => p.sku === sku);
      const cantidad = round2(row.querySelector('[name="cantidad"]')?.value || 1);
      const precioUnitarioClp = round2(row.querySelector('[name="precioUnitarioClp"]')?.value || 0);
      let costoUnitarioClp = round2(row.querySelector('[name="costoUnitarioClp"]')?.value || 0);
      if (!(costoUnitarioClp > 0) && prod) costoUnitarioClp = round2(costoProducto(prod).total);
      const listos = Math.max(0, Math.min(cantidad, Number(row.querySelector('[name="listos"]')?.value || 0)));
      const enImpresion = Math.max(
        0,
        Math.min(cantidad - listos, Number(row.querySelector('[name="enImpresion"]')?.value || 0))
      );
      let estadoItem = String(row.querySelector('[name="estadoItem"]')?.value || 'pendiente');
      if (listos >= cantidad) estadoItem = 'listo';
      else if (enImpresion > 0) estadoItem = 'en_impresion';
      items.push({
        sku,
        nombre: prod?.nombre || row.querySelector('[name="nombre"]')?.value || sku,
        cantidad,
        precioUnitarioClp,
        costoUnitarioClp,
        filamento: String(row.querySelector('[name="filamento"]')?.value || '').trim(),
        estado: estadoItem,
        listos,
        enImpresion,
      });
    });
    pedidoEditDraft.items = items;
    sincronizarEstadoPedido(pedidoEditDraft);
    recalcularMontoPedido(pedidoEditDraft);
    return pedidoEditDraft;
  }

  function renderModalPedido() {
    const ped = pedidoEditDraft;
    const body = $('#imp-modal-pedido-body');
    const title = $('#imp-modal-pedido-title');
    if (!ped || !body) return;
    if (title) title.textContent = `Editar ${ped.numero || 'pedido'}`;
    recalcularMontoPedido(ped);
    const itemBlocks = (ped.items || [])
      .map((it, idx) => {
        asegurarCostosItem(it);
        const cant = Number(it.cantidad || 1);
        const listos = Number(it.listos ?? (it.estado === 'listo' ? cant : 0));
        const enImp = Number(it.enImpresion ?? (it.estado === 'en_impresion' ? cant : 0));
        const est = it.estado || (listos >= cant ? 'listo' : enImp > 0 ? 'en_impresion' : 'pendiente');
        return `<div class="imp-pedido-edit-item" data-edit-item="${idx}">
          <div class="imp-form">
            <label>Producto (SKU)
              <select name="sku"><option value="">Elegir…</option>${optsSkuProducto(it.sku)}</select>
            </label>
            <input type="hidden" name="nombre" value="${escapeHtml(it.nombre || '')}" />
            <label>Cantidad<input name="cantidad" type="number" min="0.01" step="0.01" value="${num2(cant)}" /></label>
            <label>Costo / u<input name="costoUnitarioClp" type="number" min="0" step="0.01" value="${num2(it.costoUnitarioClp || 0)}" readonly /></label>
            <label>Precio venta / u<input name="precioUnitarioClp" type="number" min="0" step="0.01" value="${num2(it.precioUnitarioClp || 0)}" /></label>
            <label>Listos<input name="listos" type="number" min="0" step="1" value="${listos}" /></label>
            <label>En impresión<input name="enImpresion" type="number" min="0" step="1" value="${enImp}" /></label>
            <label>Estado ítem
              <select name="estadoItem">
                <option value="pendiente"${est === 'pendiente' ? ' selected' : ''}>Pendiente</option>
                <option value="en_impresion"${est === 'en_impresion' ? ' selected' : ''}>En impresión</option>
                <option value="listo"${est === 'listo' ? ' selected' : ''}>Listo</option>
              </select>
            </label>
            <label>Filamento<input name="filamento" value="${escapeHtml(it.filamento || '')}" placeholder="PLA+ negro" /></label>
            <div class="imp-form-actions">
              <button type="button" class="imp-btn imp-btn--danger imp-btn--sm" data-quitar-item="${idx}">Quitar ítem</button>
              <span class="imp-muted">Subtotal ${money(round2(cant * Number(it.precioUnitarioClp || 0)))}</span>
            </div>
          </div>
        </div>`;
      })
      .join('');

    body.innerHTML = `
      <form class="imp-form" id="form-editar-pedido">
        <p class="imp-muted">Podés cambiar cliente, ítems, cantidades, precios y avance. Al guardar se actualiza el pedido online.</p>
        <label>Fecha<input name="fecha" type="date" required value="${escapeHtml(ped.fecha || today())}" /></label>
        <label>Cliente<input name="cliente" value="${escapeHtml(ped.cliente || '')}" required /></label>
        <label>Canal<input name="canal" value="${escapeHtml(ped.canal || '')}" /></label>
        <label>Quién
          <select name="socioRegistro">
            ${['Ambos', 'Josefa', 'Nicolás']
              .map(
                (s) =>
                  `<option value="${s}"${(ped.socioRegistro || 'Ambos') === s ? ' selected' : ''}>${s}</option>`
              )
              .join('')}
          </select>
        </label>
        <label>Estado del pedido
          <select name="estado">
            <option value="pendiente"${ped.estado === 'pendiente' ? ' selected' : ''}>Pendiente</option>
            <option value="en_impresion"${ped.estado === 'en_impresion' ? ' selected' : ''}>En impresión</option>
            <option value="listo"${ped.estado === 'listo' ? ' selected' : ''}>Listo para entregar</option>
          </select>
        </label>
        <label class="imp-form-span">Notas<textarea name="notas" rows="2">${escapeHtml(ped.notas || '')}</textarea></label>
        <h3 style="margin:0.5rem 0 0">Ítems</h3>
        <div class="imp-pedido-edit-items">${itemBlocks || '<p class="imp-muted">Sin ítems</p>'}</div>
        <button type="button" class="imp-btn imp-btn--sm" id="btn-pedido-add-item">+ Agregar ítem</button>
        <p class="imp-pedido-edit-total"><strong>Total venta ${money(ped.montoNeto)}</strong> · costo ${money(ped.costoTotal || 0)}</p>
        <div class="imp-form-actions">
          <button type="submit" class="imp-btn imp-btn--primary">Guardar cambios</button>
          <button type="button" class="imp-btn" id="btn-modal-pedido-cancelar">Cancelar</button>
        </div>
      </form>
    `;

    const form = $('#form-editar-pedido');
    const refreshFromForm = () => {
      capturarDraftDesdeModal();
      renderModalPedido();
    };

    form?.querySelectorAll('[name="sku"]').forEach((sel) => {
      sel.addEventListener('change', () => {
        const row = sel.closest('[data-edit-item]');
        const prod = (data.productos || []).find((p) => p.sku === sel.value);
        if (!prod || !row) return;
        const costo = round2(costoProducto(prod).total);
        const costoEl = row.querySelector('[name="costoUnitarioClp"]');
        const precioEl = row.querySelector('[name="precioUnitarioClp"]');
        const nombreEl = row.querySelector('[name="nombre"]');
        if (costoEl) costoEl.value = num2(costo);
        if (nombreEl) nombreEl.value = prod.nombre || '';
        if (precioEl && (!(Number(precioEl.value) > 0) || precioEl.dataset.auto === '1')) {
          precioEl.value = num2(precioSugeridoDesdeCosto(costo));
          precioEl.dataset.auto = '1';
        }
        if (
          Number(prod.costoFilamentoKgClp) === COSTO_PLA_NEGRO_KG &&
          row.querySelector('[name="filamento"]') &&
          !row.querySelector('[name="filamento"]').value
        ) {
          row.querySelector('[name="filamento"]').value = 'PLA+ negro';
        }
        refreshFromForm();
      });
    });
    form?.querySelectorAll('[name="precioUnitarioClp"]').forEach((inp) => {
      inp.addEventListener('input', () => {
        inp.dataset.auto = '0';
      });
      inp.addEventListener('change', refreshFromForm);
    });
    form?.querySelectorAll('[name="cantidad"], [name="listos"], [name="enImpresion"], [name="estadoItem"]').forEach((inp) => {
      inp.addEventListener('change', refreshFromForm);
    });
    form?.querySelectorAll('[data-quitar-item]').forEach((btn) => {
      btn.addEventListener('click', () => {
        capturarDraftDesdeModal();
        const idx = Number(btn.getAttribute('data-quitar-item'));
        pedidoEditDraft.items = (pedidoEditDraft.items || []).filter((_, i) => i !== idx);
        renderModalPedido();
      });
    });
    $('#btn-pedido-add-item')?.addEventListener('click', () => {
      capturarDraftDesdeModal();
      const prod = (data.productos || [])[0];
      const costo = prod ? round2(costoProducto(prod).total) : 0;
      pedidoEditDraft.items = pedidoEditDraft.items || [];
      pedidoEditDraft.items.push({
        sku: prod?.sku || '',
        nombre: prod?.nombre || '',
        cantidad: 1,
        costoUnitarioClp: costo,
        precioUnitarioClp: precioSugeridoDesdeCosto(costo),
        filamento: Number(prod?.costoFilamentoKgClp) === COSTO_PLA_NEGRO_KG ? 'PLA+ negro' : '',
        estado: 'pendiente',
        listos: 0,
        enImpresion: 0,
      });
      renderModalPedido();
    });
    $('#btn-modal-pedido-cancelar')?.addEventListener('click', cerrarModalPedido);
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      capturarDraftDesdeModal();
      if (!pedidoEditDraft?.items?.length) {
        setStatus('El pedido necesita al menos un ítem', 'warn');
        return;
      }
      if (!(pedidoEditDraft.montoNeto > 0)) {
        setStatus('Revisa precios de venta / unidad', 'warn');
        return;
      }
      const ped = (data.pedidos || []).find((p) => p.id === pedidoEditDraft.id);
      if (!ped || !pedidoActivo(ped.estado)) {
        cerrarModalPedido();
        return;
      }
      const estForm = pedidoActivo(pedidoEditDraft.estado)
        ? pedidoEditDraft.estado
        : 'pendiente';
      ped.fecha = pedidoEditDraft.fecha;
      ped.cliente = pedidoEditDraft.cliente;
      ped.canal = pedidoEditDraft.canal;
      ped.notas = pedidoEditDraft.notas;
      ped.socioRegistro = pedidoEditDraft.socioRegistro;
      ped.items = pedidoEditDraft.items;
      if (estForm === 'listo') {
        (ped.items || []).forEach((it) => {
          const cant = Math.max(1, Number(it.cantidad || 1));
          it.listos = cant;
          it.enImpresion = 0;
          it.estado = 'listo';
        });
        ped.estado = 'listo';
      } else {
        ped.estado = estForm;
        sincronizarEstadoPedido(ped);
        // Si eligió en_impresión/pendiente a mano, respetarlo aunque los ítems digan otra cosa.
        if (estForm === 'en_impresion' || estForm === 'pendiente') ped.estado = estForm;
      }
      recalcularMontoPedido(ped);
      ped.actualizado = new Date().toISOString();
      cerrarModalPedido();
      markDirty();
      renderAll();
      activarTab('pedidos');
      setStatus(`${ped.numero} actualizado · venta ${money(ped.montoNeto)} · guardando…`, 'warn');
      save()
        .then(() => setStatus(`${ped.numero} guardado ✓`, 'ok'))
        .catch((err) => setStatus(String(err.message || err), 'err'));
    });
  }

  function abrirModalEditarPedido(id) {
    try {
      const ped = (data.pedidos || []).find((p) => p.id === id);
      if (!ped) {
        setStatus('Pedido no encontrado', 'warn');
        return;
      }
      if (!pedidoActivo(ped.estado)) {
        setStatus('Solo se editan pedidos activos (no transferidos)', 'warn');
        return;
      }
      pedidoEditDraft = JSON.parse(JSON.stringify(ped));
      (pedidoEditDraft.items || []).forEach(asegurarCostosItem);
      recalcularMontoPedido(pedidoEditDraft);
      const modal = $('#imp-modal-pedido');
      if (!modal) {
        setStatus('No se encontró el modal de edición', 'err');
        return;
      }
      renderModalPedido();
      modal.removeAttribute('hidden');
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('is-open');
      document.body.classList.add('imp-modal-open');
      setStatus(`Editando ${ped.numero}…`, 'ok');
    } catch (err) {
      console.error(err);
      setStatus(`Error al abrir editor: ${err.message || err}`, 'err');
    }
  }

  function renderPedidos() {
    (data.pedidos || []).forEach(sincronizarEstadoPedido);
    const productos = data.productos || [];
    const optsProd = productos
      .map((p) => `<option value="${escapeHtml(p.sku || '')}">${escapeHtml(p.sku || '')} · ${escapeHtml(p.nombre || '')}</option>`)
      .join('');
    const rows = (data.pedidos || [])
      .slice()
      .reverse()
      .map((p) => {
        recalcularMontoPedido(p);
        const estado = p.estado || 'pendiente';
        const badge = badgeEstadoPedido(estado);
        let acciones = `<span class="imp-muted">${escapeHtml(p.ventaId || '—')}</span>`;
        if (pedidoActivo(estado)) {
          const btnListo =
            estado === 'listo'
              ? `<button type="button" class="imp-btn imp-btn--sm" data-estado-pedido="${escapeHtml(p.id)}" data-estado="pendiente">Volver a pendiente</button>`
              : `<button type="button" class="imp-btn imp-btn--sm" data-estado-pedido="${escapeHtml(p.id)}" data-estado="listo">Marcar listo</button>`;
          acciones = `<button type="button" class="imp-btn imp-btn--sm" data-edit-pedido="${escapeHtml(p.id)}" onclick="window.abrirModalEditarPedido && window.abrirModalEditarPedido('${escapeHtml(p.id)}')">Editar</button>
            ${btnListo}
            <button type="button" class="imp-btn imp-btn--primary imp-btn--sm" data-transferir-pedido="${escapeHtml(p.id)}">Transferir a venta</button>
            <button type="button" class="imp-btn imp-btn--danger imp-btn--sm" data-del-pedido="${escapeHtml(p.id)}">✕</button>`;
        }
        return `<tr>
          <td><strong>${escapeHtml(p.numero || '')}</strong><div class="imp-muted">${escapeHtml(p.fecha || '')}</div></td>
          <td>
            <strong>${escapeHtml(p.cliente || '—')}</strong>
            <div class="imp-pedido-items">${renderItemsPedido(p)}</div>
            ${p.notas ? `<div class="imp-muted">${escapeHtml(p.notas)}</div>` : ''}
          </td>
          <td class="num">
            <strong>${money(p.montoNeto)}</strong>
            <div class="imp-muted">venta</div>
            <div class="imp-muted">costo ${money(p.costoTotal || 0)}</div>
          </td>
          <td>${badge}</td>
          <td class="imp-pedidos-actions">${acciones}</td>
        </tr>`;
      })
      .join('');

    $('#tab-pedidos').innerHTML = `
      <div class="imp-card">
        <h2>Pedidos</h2>
        <p class="imp-muted">Por ítem: <strong>costo/u</strong> y <strong>precio venta/u</strong> (editable). Usa <strong>Editar</strong> para cambiar cliente, ítems, cantidades o estado. Al <strong>Transferir a venta</strong> se guarda el registro y baja la deuda.</p>
        <div class="imp-table-wrap">
          <table class="imp-table">
            <thead><tr><th>ID</th><th>Cliente / ítems</th><th>Total</th><th>Estado</th><th></th></tr></thead>
            <tbody>${rows || '<tr><td colspan="5">Sin pedidos aún</td></tr>'}</tbody>
          </table>
        </div>
      </div>
      <div class="imp-card">
        <h3>Nuevo pedido</h3>
        <form class="imp-form" id="form-pedido">
          <label>Fecha<input name="fecha" type="date" required value="${today()}" /></label>
          <label>Cliente<input name="cliente" placeholder="Nombre o @instagram" /></label>
          <label>Producto (SKU)
            <select name="sku" required id="pedido-sku">
              <option value="">Elegir…</option>
              ${optsProd}
            </select>
          </label>
          <label>Cantidad<input name="cantidad" type="number" min="1" step="0.01" value="1" required id="pedido-cant" /></label>
          <label>Costo / unidad
            <input name="costoUnitarioClp" type="number" min="0" step="0.01" id="pedido-costo" readonly />
          </label>
          <label>Precio venta / unidad
            <input name="precioUnitarioClp" type="number" min="0" step="0.01" required id="pedido-precio" placeholder="Editable si cobras más" />
          </label>
          <label>Total venta
            <input name="montoNeto" type="number" min="0" step="0.01" id="pedido-total" readonly />
          </label>
          <label>Estado
            <select name="estado">
              <option value="pendiente">Pendiente</option>
              <option value="en_impresion">En impresión</option>
              <option value="listo" selected>Listo para entregar</option>
            </select>
          </label>
          <label>Canal<input name="canal" placeholder="WhatsApp / Instagram / feria" value="WhatsApp" /></label>
          <label>Quién
            <select name="socioRegistro">
              <option value="Ambos" selected>Ambos</option>
              <option value="Josefa">Josefa</option>
              <option value="Nicolás">Nicolás</option>
            </select>
          </label>
          <label class="imp-form-span">Notas<textarea name="notas" rows="2" placeholder="Ej. PLA negro"></textarea></label>
          <div class="imp-form-actions">
            <button class="imp-btn imp-btn--primary" type="submit">Registrar pedido</button>
            <span class="imp-muted">Se asigna el siguiente PED-xxx automáticamente</span>
          </div>
        </form>
      </div>
    `;

    const syncFormPedidoPrecios = () => {
      const sku = String($('#pedido-sku')?.value || '').trim();
      const prod = (data.productos || []).find((p) => p.sku === sku);
      const cant = Math.max(0.01, Number($('#pedido-cant')?.value || 1));
      const costoEl = $('#pedido-costo');
      const precioEl = $('#pedido-precio');
      const totalEl = $('#pedido-total');
      if (!prod) {
        if (costoEl) costoEl.value = '';
        if (totalEl) totalEl.value = '';
        return;
      }
      const costo = round2(costoProducto(prod).total);
      if (costoEl) costoEl.value = num2(costo);
      let precio = Number(precioEl?.value || 0);
      if (!(precio > 0) || precioEl?.dataset.auto === '1') {
        precio = precioSugeridoDesdeCosto(costo);
        if (precioEl) {
          precioEl.value = num2(precio);
          precioEl.dataset.auto = '1';
        }
      }
      if (totalEl) totalEl.value = num2(round2(cant * Number(precioEl?.value || 0)));
    };
    $('#pedido-sku')?.addEventListener('change', () => {
      const precioEl = $('#pedido-precio');
      if (precioEl) precioEl.dataset.auto = '1';
      syncFormPedidoPrecios();
    });
    $('#pedido-cant')?.addEventListener('input', syncFormPedidoPrecios);
    $('#pedido-precio')?.addEventListener('input', () => {
      const precioEl = $('#pedido-precio');
      if (precioEl) precioEl.dataset.auto = '0';
      syncFormPedidoPrecios();
    });

    $('#form-pedido')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const sku = String(fd.get('sku') || '').trim();
      const prod = (data.productos || []).find((p) => p.sku === sku);
      const cantidad = round2(fd.get('cantidad') || 1);
      const costoUnitarioClp = round2(fd.get('costoUnitarioClp') || (prod ? costoProducto(prod).total : 0));
      const precioUnitarioClp = round2(fd.get('precioUnitarioClp') || 0);
      const montoNeto = round2(cantidad * precioUnitarioClp);
      const estado = String(fd.get('estado') || 'pendiente');
      if (!sku || !prod || !(precioUnitarioClp > 0)) {
        setStatus('Elige producto y precio de venta / unidad', 'warn');
        return;
      }
      const numero = siguienteNumeroPedido();
      data.pedidos = data.pedidos || [];
      const estadoOk = pedidoActivo(estado) ? estado : 'pendiente';
      const listos = estadoOk === 'listo' ? cantidad : 0;
      const enImpresion = estadoOk === 'en_impresion' ? cantidad : 0;
      const ped = {
        id: uid('ped'),
        numero,
        fecha: fd.get('fecha'),
        cliente: String(fd.get('cliente') || '').trim(),
        canal: String(fd.get('canal') || ''),
        items: [
          {
            sku,
            nombre: prod.nombre,
            cantidad,
            precioUnitarioClp,
            costoUnitarioClp,
            filamento:
              Number(prod.costoFilamentoKgClp) === COSTO_PLA_NEGRO_KG ? 'PLA+ negro' : '',
            estado: estadoOk,
            listos,
            enImpresion,
          },
        ],
        montoNeto,
        costoTotal: round2(cantidad * costoUnitarioClp),
        estado: estadoOk,
        ventaId: null,
        notas: String(fd.get('notas') || '').trim(),
        socioRegistro: fd.get('socioRegistro') || 'Ambos',
        creado: new Date().toISOString(),
      };
      data.pedidos.push(ped);
      markDirty();
      renderAll();
      activarTab('pedidos');
      setStatus(`Pedido ${numero} creado · venta ${money(montoNeto)} · guarda online`, 'warn');
      save().catch((err) => setStatus(String(err.message || err), 'err'));
    });

    $('#tab-pedidos')?.querySelectorAll('[data-precio-item]').forEach((inp) => {
      inp.addEventListener('change', () => {
        const id = inp.getAttribute('data-precio-item');
        const idx = Number(inp.getAttribute('data-idx'));
        const ped = (data.pedidos || []).find((p) => p.id === id);
        if (!ped || !pedidoActivo(ped.estado)) return;
        const it = (ped.items || [])[idx];
        if (!it) return;
        it.precioUnitarioClp = round2(inp.value || 0);
        recalcularMontoPedido(ped);
        markDirty();
        renderAll();
        activarTab('pedidos');
        setStatus(
          `${ped.numero}: precio/u ${money(it.precioUnitarioClp)} · total ${money(ped.montoNeto)}`,
          'warn'
        );
        save().catch((err) => setStatus(String(err.message || err), 'err'));
      });
    });

    $('#tab-pedidos')?.querySelectorAll('[data-item-prog]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-item-prog');
        const idx = Number(btn.getAttribute('data-idx'));
        const accion = btn.getAttribute('data-accion');
        const ped = (data.pedidos || []).find((p) => p.id === id);
        if (!ped || !pedidoActivo(ped.estado)) return;
        const it = (ped.items || [])[idx];
        if (!it) return;
        const cant = Math.max(1, Number(it.cantidad || 1));
        let listos = Math.min(cant, Math.max(0, Number(it.listos ?? (it.estado === 'listo' ? cant : 0))));
        let enImp = Math.min(
          cant - listos,
          Math.max(0, Number(it.enImpresion ?? (it.estado === 'en_impresion' ? 1 : 0)))
        );
        if (accion === 'listo') {
          if (listos >= cant) return;
          if (enImp > 0) enImp -= 1;
          listos += 1;
        } else if (accion === 'print') {
          if (listos + enImp >= cant) return;
          enImp += 1;
        }
        it.listos = listos;
        it.enImpresion = enImp;
        it.estado = listos >= cant ? 'listo' : enImp > 0 ? 'en_impresion' : 'pendiente';
        sincronizarEstadoPedido(ped);
        markDirty();
        renderAll();
        activarTab('pedidos');
        setStatus(`${ped.numero}: ${textoEstadoItem(it)} · guarda online`, 'warn');
        save().catch((err) => setStatus(String(err.message || err), 'err'));
      });
    });

    $('#tab-pedidos')?.querySelectorAll('[data-estado-pedido]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-estado-pedido');
        const next = btn.getAttribute('data-estado');
        const ped = (data.pedidos || []).find((p) => p.id === id);
        if (!ped || !pedidoActivo(ped.estado)) return;
        ped.estado = next;
        (ped.items || []).forEach((it) => {
          const cant = Math.max(1, Number(it.cantidad || 1));
          if (next === 'listo') {
            it.listos = cant;
            it.enImpresion = 0;
            it.estado = 'listo';
          } else if (next === 'pendiente') {
            it.listos = 0;
            it.enImpresion = 0;
            it.estado = 'pendiente';
          }
        });
        sincronizarEstadoPedido(ped);
        markDirty();
        renderAll();
        activarTab('pedidos');
        setStatus(
          `${ped.numero}: ${next === 'listo' ? 'listo para entregar' : 'pendiente'} · guarda online`,
          'warn'
        );
      });
    });

    $('#tab-pedidos')?.querySelectorAll('[data-transferir-pedido]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-transferir-pedido');
        const ped = (data.pedidos || []).find((p) => p.id === id);
        if (!ped || !pedidoActivo(ped.estado)) return;
        recalcularMontoPedido(ped);
        const ok = confirm(
          `¿Transferir ${ped.numero} a venta?\nCliente: ${ped.cliente || '—'}\nVenta: ${money(ped.montoNeto)}\nCosto: ${money(ped.costoTotal || 0)}\nSe guarda el registro y baja la deuda.`
        );
        if (!ok) return;
        const itemsSnap = (ped.items || []).map((it) => ({
          sku: it.sku,
          nombre: it.nombre,
          cantidad: Number(it.cantidad || 0),
          precioUnitarioClp: round2(it.precioUnitarioClp || 0),
          costoUnitarioClp: round2(it.costoUnitarioClp || 0),
          filamento: it.filamento || '',
        }));
        const itemsTxt = itemsSnap
          .map(
            (it) =>
              `${it.cantidad}× ${it.nombre || it.sku} @ ${money(it.precioUnitarioClp)} (costo ${money(it.costoUnitarioClp)})`
          )
          .join(', ');
        const cant = itemsSnap.reduce((a, it) => a + Number(it.cantidad || 0), 0) || 1;
        const venta = {
          id: uid('ven'),
          fecha: ped.fecha || today(),
          descripcion: `${ped.numero} · ${itemsTxt}${ped.cliente ? ` · ${ped.cliente}` : ''}`,
          cantidad: cant,
          montoNeto: Number(ped.montoNeto || 0),
          costoTotal: Number(ped.costoTotal || 0),
          canal: ped.canal || '',
          cliente: ped.cliente || '',
          notas: ped.notas || `Desde pedido ${ped.numero}`,
          socioRegistro: ped.socioRegistro || 'Ambos',
          pedidoId: ped.id,
          pedidoNumero: ped.numero,
          items: itemsSnap,
          creado: new Date().toISOString(),
        };
        data.ventas = data.ventas || [];
        data.ventas.push(venta);
        ped.estado = 'transferido';
        ped.ventaId = venta.id;
        ped.transferidoEn = new Date().toISOString();
        ped.montoNeto = venta.montoNeto;
        ped.costoTotal = venta.costoTotal;
        markDirty();
        renderAll();
        activarTab('ventas');
        setStatus(`${ped.numero} → venta · ${money(venta.montoNeto)} · guardando…`, 'warn');
        save()
          .then(() => setStatus(`${ped.numero} → venta · ${money(venta.montoNeto)} contabilizado y guardado ✓`, 'ok'))
          .catch((err) => setStatus(String(err.message || err), 'err'));
      });
    });

    $('#tab-pedidos')?.querySelectorAll('[data-del-pedido]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-pedido');
        const ped = (data.pedidos || []).find((p) => p.id === id);
        if (!ped || !pedidoActivo(ped.estado)) return;
        if (!confirm(`¿Eliminar pedido ${ped.numero}?`)) return;
        data.pedidos = (data.pedidos || []).filter((p) => p.id !== id);
        markDirty();
        renderAll();
        activarTab('pedidos');
        setStatus(`Pedido ${ped.numero} eliminado`, 'warn');
      });
    });
  }

  function renderVentas() {
    const rows = (data.ventas || [])
      .map((v) => {
        const itemsHtml = (v.items || [])
          .map(
            (it) =>
              `<div class="imp-muted">${it.cantidad || 1}× ${escapeHtml(it.nombre || it.sku || '')} · venta/u ${money(it.precioUnitarioClp)} · costo/u ${money(it.costoUnitarioClp)}</div>`
          )
          .join('');
        return `
      <tr>
        <td>${escapeHtml(v.fecha || '')}</td>
        <td>${escapeHtml(v.cliente || v.descripcion || '')}${
          v.pedidoNumero
            ? `<div class="imp-muted">Desde pedido <strong>${escapeHtml(v.pedidoNumero)}</strong></div>`
            : ''
        }${itemsHtml || (v.descripcion && v.cliente ? `<div class="imp-muted">${escapeHtml(v.descripcion)}</div>` : '')}</td>
        <td class="num">${v.cantidad || 1}</td>
        <td class="num"><strong>${money(v.montoNeto)}</strong>${
          v.costoTotal != null ? `<div class="imp-muted">costo ${money(v.costoTotal)}</div>` : ''
        }</td>
        <td>${escapeHtml(v.canal || '')}</td>
        <td><button type="button" class="imp-btn imp-btn--danger" data-del-venta="${v.id}">✕</button></td>
      </tr>`;
      })
      .join('');

    $('#tab-ventas').innerHTML = `
      <div class="imp-card imp-kpi--accent" style="padding:0.9rem 1rem">
        <p style="margin:0"><strong>Flujo recomendado:</strong> registra en <button type="button" class="imp-linkish" data-goto-tab="pedidos">Pedidos</button>
        (ajustá el precio venta/u si cobraste más) y al transferir se guarda la venta. Solo las ventas bajan la deuda.</p>
      </div>
      <div class="imp-card">
        <h2>Ventas contabilizadas (${money(sum(data.ventas))})</h2>
        <p class="imp-muted">Estas sí entran al dashboard: <strong>saldo = gastos − ventas</strong>.</p>
        <div class="imp-table-wrap">
          <table class="imp-table">
            <thead><tr><th>Fecha</th><th>Cliente / detalle</th><th>Cant.</th><th>Total</th><th>Canal</th><th></th></tr></thead>
            <tbody>${rows || '<tr><td colspan="6">Sin ventas aún</td></tr>'}</tbody>
          </table>
        </div>
      </div>
      <div class="imp-card">
        <h3>Venta directa (sin pedido)</h3>
        <p class="imp-muted">Úsalo solo si no pasaste por Pedidos. Prefiere Pedidos → Transferir a venta.</p>
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

    $('#tab-ventas')?.querySelectorAll('[data-goto-tab]').forEach((btn) => {
      btn.addEventListener('click', () => activarTab(btn.getAttribute('data-goto-tab')));
    });

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
          <label>Markup sobre costo %
            <input name="margenObjetivoPct" type="number" min="0" step="1" value="${p.margenObjetivoPct ?? 100}" />
          </label>
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
    const modelo = round2(fd.get('modelo') || 0);
    const soportes = round2(fd.get('soportes') || 0);
    const purge = round2(fd.get('purge') || 0);
    const prod = {
      filamentoModeloGramos: modelo,
      filamentoSoportesGramos: soportes,
      filamentoPurgeGramos: purge,
      filamentoGramos: round2(modelo + soportes + purge),
      costoFilamentoKgClp: round2(fd.get('kg')),
      horasImpresion: horasDesdePartes(fd.get('horasPart'), fd.get('minutosPart')),
      minutosPintado: round2(fd.get('m')),
      unidadesMetal: round2(fd.get('metal')),
      unidadesBolsa: round2(fd.get('bolsa')),
    };
    const c = costoProducto(prod);
    const sugerido = Math.round(precioSugeridoDesdeCosto(c.total) / 10) * 10;
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
    modal.querySelector('[name=filamentoGramos]').value = num2(calc.prod.filamentoGramos);
    modal.querySelector('[name=costoFilamentoKgClp]').value = num2(calc.prod.costoFilamentoKgClp);
    modal.querySelector('[name=horasImpresion]').value = num2(calc.prod.horasImpresion || 0);
    modal.querySelector('[name=minutosPintado]').value = num2(calc.prod.minutosPintado);
    modal.querySelector('[name=unidadesMetal]').value = num2(calc.prod.unidadesMetal);
    modal.querySelector('[name=unidadesBolsa]').value = num2(calc.prod.unidadesBolsa);
    modal.querySelector('[name=precioVentaSugeridoClp]').value = num2(calc.sugerido);
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
    const margen = Number(data.parametros?.margenObjetivoPct ?? 100) / 100;
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
            <label>$ / kg filamento (CLP)<input name="costoFilamentoKgClp" type="number" min="0" step="0.01" value="${num2(prod.costoFilamentoKgClp || 0)}" /></label>
            <label class="imp-form-span">Desglose slicer (como en la foto)
              <select name="usarDesglose">
                <option value="1"${usarDesglose === '1' ? ' selected' : ''}>Usar modelo + soportes + purge</option>
                <option value="0"${usarDesglose === '0' ? ' selected' : ''}>Usar solo total de gramos</option>
              </select>
            </label>
            <label>Modelo (g)<input name="filamentoModeloGramos" type="number" min="0" step="0.01" value="${num2(prod.filamentoModeloGramos || 0)}" /></label>
            <label>Soportes (g)<input name="filamentoSoportesGramos" type="number" min="0" step="0.01" value="${num2(prod.filamentoSoportesGramos || 0)}" /></label>
            <label>Purge / descargado (g)<input name="filamentoPurgeGramos" type="number" min="0" step="0.01" value="${num2(prod.filamentoPurgeGramos || 0)}" /></label>
            <label>Total filamento (g)<input name="filamentoGramos" type="number" min="0" step="0.01" value="${num2(prod.filamentoGramos || c.gramos || 0)}" /></label>
            <label>Metros filamento<input name="filamentoMetros" type="number" min="0" step="0.01" value="${num2(prod.filamentoMetros || 0)}" /></label>
            <label>Horas impresión<input name="horasPart" type="number" min="0" step="1" value="${th.horas}" /></label>
            <label>Minutos impresión<input name="minutosPart" type="number" min="0" max="59" step="1" value="${th.minutos}" /></label>
            <label>Minutos pintado / MO<input name="minutosPintado" type="number" min="0" step="0.01" value="${num2(prod.minutosPintado || 0)}" /></label>
            <label>Unidades metal<input name="unidadesMetal" type="number" min="0" step="0.01" value="${num2(prod.unidadesMetal || 0)}" /></label>
            <label>Bolsas<input name="unidadesBolsa" type="number" min="0" step="0.01" value="${num2(prod.unidadesBolsa || 0)}" /></label>
            <label>Precio venta público (CLP)<input name="precioVentaSugeridoClp" type="number" min="0" step="0.01" value="${prod.precioVentaSugeridoClp ? num2(prod.precioVentaSugeridoClp) : ''}" placeholder="Ej. 8990.00" /></label>
            <label>Coste slicer (ref.)<input name="costoSlicerRef" type="number" min="0" step="0.01" value="${num2(prod.costoSlicerRef || 0)}" title="Valor que muestra el slicer; no es CLP" /></label>
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
      const sugerido = precioSugeridoDesdeCosto(c.total);
      const pctObj = Number(p.margenObjetivoPct ?? 100);
      el.innerHTML = `
          Total filamento <strong>${g.toFixed(2)} g</strong>
          · Filamento ${money(c.filamento)} · Luz ${money(c.luz)} · Pintado ${money(c.pintado)} · Metal ${money(c.metal)} · Bolsa ${money(c.bolsa)}
          <br><strong>Costo unitario: ${money(c.total)}</strong> · precio sugerido (+${pctObj}% sobre costo): <strong>${money(sugerido)}</strong>
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
        totalInput.value = num2(modelo + soportes + purge);
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
    renderPedidos();
    renderVentas();
    renderOperacion();
    renderCostos();
    renderAds();
    renderBitacora();
  }

  const TABS_VALIDOS = new Set([
    'resumen',
    'gastos',
    'pedidos',
    'ventas',
    'operacion',
    'costos',
    'ads',
    'bitacora',
  ]);

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
      filamentoModeloGramos: round2(calcDraft?.filamentoModeloGramos ?? 0),
      filamentoSoportesGramos: round2(calcDraft?.filamentoSoportesGramos ?? 0),
      filamentoPurgeGramos: round2(calcDraft?.filamentoPurgeGramos ?? 0),
      filamentoMetros: round2(calcDraft?.filamentoMetros ?? 0),
      filamentoGramos: round2(fd.get('filamentoGramos')),
      costoFilamentoKgClp: round2(fd.get('costoFilamentoKgClp')),
      horasImpresion: round2(fd.get('horasImpresion')),
      minutosPintado: round2(fd.get('minutosPintado')),
      unidadesMetal: round2(fd.get('unidadesMetal')),
      unidadesBolsa: round2(fd.get('unidadesBolsa')),
      precioVentaSugeridoClp: round2(fd.get('precioVentaSugeridoClp') || 0),
      costoSlicerRef: round2(calcDraft?.costoSlicerRef ?? 0),
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
  $('#btn-modal-pedido-cerrar')?.addEventListener('click', cerrarModalPedido);
  $('#imp-modal-pedido')?.addEventListener('click', (e) => {
    if (e.target?.id === 'imp-modal-pedido') cerrarModalPedido();
  });
  // Delegación: sobrevive a re-renders del tab Pedidos
  document.addEventListener('click', (e) => {
    const btn = e.target?.closest?.('[data-edit-pedido]');
    if (!btn) return;
    e.preventDefault();
    abrirModalEditarPedido(btn.getAttribute('data-edit-pedido'));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if ($('#imp-modal-pedido')?.classList.contains('is-open')) {
      cerrarModalPedido();
      return;
    }
    if ($('#imp-modal-producto')?.classList.contains('is-open')) {
      cerrarModalProducto();
    }
  });
  window.abrirModalEditarPedido = abrirModalEditarPedido;

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
