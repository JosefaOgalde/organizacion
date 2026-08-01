/* Impresoreando — panel socios (persistencia /api/impresoreando) */
(function () {
  const API = '/api/impresoreando';
  let data = null;
  let dirty = false;
  /** Filtros tab Ventas: compras por cliente / origen. */
  let ventasFiltroCliente = '';
  let ventasFiltroOrigen = '';
  let ventasFiltroTexto = '';

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
    if (asegurarImpresoras(d)) changed = true;
    if (asegurarProductoPortacompletosGato(d)) changed = true;
    if (asegurarProductoPortacompletosPerro(d)) changed = true;
    if (asegurarProductoPortaLataMonster(d)) changed = true;
    if (asegurarProductoMaceteroPerroBulldog(d)) changed = true;
    if (asegurarProductoPortacompletoPerroBulldog(d)) changed = true;
    if (asegurarProductoPortaBobEsponja(d)) changed = true;
    if (asegurarProductoNaveEspacialHorizontal(d)) changed = true;
    if (asegurarProductoNaveEspacialVertical(d)) changed = true;
    if (asegurarProductoLlaveroEscudoRanger(d)) changed = true;
    if (asegurarProductoLlaveroPortaLipstickStanley(d)) changed = true;
    if (asegurarProductoLlaveroPesaRusa(d)) changed = true;
    if (asegurarProductoSoporteCelular(d)) changed = true;
    if (asegurarRenombrarRosadoPastelAMorado(d)) changed = true;
    if (asegurarProductoDragon(d)) changed = true;
    if (asegurarProductoTorreon(d)) changed = true;
    if (asegurarProductoLimpiadorBrochas(d)) changed = true;
    if (asegurarProductoAlcanciaChanchito(d)) changed = true;
    if (eliminarProductosPlantillaObsoletos(d)) changed = true;
    if (asegurarGastosDisenosCults(d)) changed = true;
    if (asegurarGastosCompras20260729(d)) changed = true;
    if (asegurarGastoMlBolsasEnchufeLed20260731(d)) changed = true;
    if (asegurarGastoEntradaEvento3d16100(d)) changed = true;
    if (asegurarMelVenta020(d)) changed = true;
    if (asegurarVentasSeed(d)) changed = true;
    if (asegurarPedidos(d)) changed = true;
    if (asegurarPedidosImpresosYNaves(d)) changed = true;
    if (asegurarSkusProductos(d)) changed = true;
    if (asegurarDecimalesProductos(d)) changed = true;
    if (asegurarCostoAnilloLlavero50(d)) changed = true;
    const gastos = d.gastos;
    for (const g of gastos) {
      const quien = String(g.socioRegistro || '').trim();
      if (!quien || /^josefa$/i.test(quien) || /^socio$/i.test(quien)) {
        g.socioRegistro = 'Ambos';
        changed = true;
      }
    }
    const capitalNeto = gastos.reduce((a, g) => a + Number(g.montoNeto || 0), 0);
    let capitalJosefa = 0;
    let capitalNicolas = 0;
    for (const g of gastos) {
      const monto = Number(g.montoNeto || 0);
      if (/josefa/i.test(String(g.pagadoPor || ''))) capitalJosefa += monto;
      else capitalNicolas += monto;
    }
    const mitad = Math.round(capitalNeto * 0.5);
    const deudaJosefaClp = Math.max(0, mitad - Math.round(capitalJosefa));
    const cap = d.meta.capital && typeof d.meta.capital === 'object' ? d.meta.capital : {};
    const nextCap = {
      aportadoPor: capitalJosefa > 0 ? 'Nicolás + Josefa' : 'Nicolás',
      aportadoJosefaClp: Math.round(capitalJosefa),
      aportadoNicolasClp: Math.round(capitalNicolas),
      deudaPctJosefa: 50,
      montoNetoClp: capitalNeto,
      deudaJosefaClp,
      nota:
        capitalJosefa > 0
          ? `Sociedad 50/50. Nicolás aportó ${Math.round(capitalNicolas).toLocaleString('es-CL')} y Josefa ${Math.round(capitalJosefa).toLocaleString('es-CL')}. Josefa debe el 50% de los gastos menos lo que ya pagó.`
          : 'Nicolás puso el capital. «Ambos» = sociedad 50/50 (Josefa debe el 50% a Nicolás).',
    };
    if (
      cap.aportadoPor !== nextCap.aportadoPor ||
      Number(cap.deudaJosefaClp) !== nextCap.deudaJosefaClp ||
      Number(cap.montoNetoClp) !== nextCap.montoNetoClp ||
      Number(cap.aportadoJosefaClp || 0) !== nextCap.aportadoJosefaClp ||
      Number(cap.aportadoNicolasClp || 0) !== nextCap.aportadoNicolasClp ||
      cap.nota !== nextCap.nota
    ) {
      d.meta.capital = { ...cap, ...nextCap };
      changed = true;
    }
    const notasMetaOk =
      /sociedad 50\/50/i.test(String(d.meta.notas || '')) && /josefa/i.test(String(d.meta.notas || ''));
    if (!notasMetaOk || /pagado todos Nicolás/i.test(String(d.meta.notas || ''))) {
      d.meta.notas =
        'Emprendimiento 3D · sociedad 50/50 Josefa + Nicolás. Los gastos son de ambos. El capital aportado se calcula por quién pagó cada gasto (pagadoPor).';
      changed = true;
    }
    return changed;
  }

  /**
   * Gastos agrupados por registro de compra (no ítem a ítem):
   * 1) Orden #312435 $652.290 · 2) AliExpress $60.000 · 3) Líder $20.000
   * 4) Mercado Libre $64.750 · 5) Mercado Libre 21-jul $40.970 · 6) ML Creality $50.119
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
      {
        id: 'gas-reg-mercadolibre-2026-07-21',
        fecha: '2026-07-21',
        categoria: 'filamento',
        descripcion:
          'Mercado Libre — TPU Creality verde + PLA PPC naranjo + PLA PPC piel claro (PAGADO)',
        proveedor: 'Mercado Libre',
        cantidad: 3,
        montoNeto: 40970,
        notas:
          'Orden #2000014122225779. Productos: 1× TPU Creality 1kg 1.75mm Verde · 1× PLA PPC 1kg 1.75mm Naranjo · 1× PLA PPC 1kg 1.75mm Piel Claro. Envío gratis meli+ (Gluck 3257). Pago: Visa Débito ****5845 $39.642 + Meli Dólar $1.328 (MUSD 1.42461691) = $40.970.',
        ordenId: '2000014122225779',
        socioRegistro: 'Ambos',
        items: [
          {
            descripcion:
              'Pago Visa Débito ****5845 (TPU Creality Verde · PLA PPC Naranjo · PLA PPC Piel Claro)',
            monto: 39642,
          },
          { descripcion: 'Pago Meli Dólar (MUSD 1.42461691)', monto: 1328 },
        ],
      },
      {
        id: 'gas-reg-mercadolibre-creality-50119',
        fecha: '2026-07-23',
        categoria: 'filamento',
        descripcion:
          'Mercado Libre — 4× PLA Creality 1kg (negro mate · morado · blanco · verde) (PAGADO)',
        proveedor: 'Mercado Libre',
        cantidad: 4,
        montoNeto: 50119,
        notas:
          '1× PLA Ultra Mate Alta Velocidad Negro Creality · 1× PLA Ultra Alta Velocidad Morado/Rosa Oscuro Creality · 1× Soleyin Ultra PLA Blanco Creality · 1× PLA Creality Verde 1.75mm. Total $50.119.',
        ordenId: 'ml-creality-pla-50119',
        socioRegistro: 'Ambos',
        items: [
          { descripcion: 'Filamento PLA Ultra Mate Alta Velocidad Negro 1kg Creality', monto: 0 },
          {
            descripcion: 'Filamento PLA Ultra Alta Velocidad Morado/Rosa Oscuro 1kg Creality',
            monto: 0,
          },
          { descripcion: 'Filamento Soleyin Ultra PLA Blanco 1kg Creality 1.75mm', monto: 0 },
          { descripcion: 'Filamento PLA Creality Verde 1kg 1.75mm', monto: 0 },
          { descripcion: 'Total compra (sin desglose unitario)', monto: 50119 },
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

  /**
   * Perfiles de impresora para costos.
   * Alias usuaria: «nueva» / Elegoo = Centauri · «antigua» = Ender 3 V2 Neo (Sprite Neo).
   */
  const IMPRESORAS_SEED = [
    {
      id: 'imp-centauri-carbon-2',
      nombre: 'Elegoo Centauri Carbon 2',
      alias: 'nueva',
      activaDefault: true,
      extrusor: 'Sistema stock / multicolor',
      consumoImpresoraKw: 0.28,
      tarifaKwhClp: 200,
      recargoFijoClp: 0,
      costoFilamentoDefaultKgClp: 0,
      notas:
        'Impresora NUEVA (Elegoo). Pico ~1100 W @ 220 V · promedio PLA ~0,28 kW. Default salvo que digan antigua/Ender.',
    },
    {
      id: 'imp-ender-3-v2-neo',
      nombre: 'Creality Ender 3 V2 Neo',
      alias: 'antigua',
      activaDefault: false,
      extrusor: 'Sprite Neo (extrusión directa)',
      consumoImpresoraKw: 0.16,
      tarifaKwhClp: 200,
      recargoFijoClp: 1000,
      costoFilamentoDefaultKgClp: 0,
      filamentoOtro: true,
      notas:
        'Impresora ANTIGUA (Ender 3 V2 Neo · Sprite Neo). Suele usar otro filamento (definir $/kg en el producto o en este perfil). Recargo fijo $1.000 + consumo ~0,16 kW. Si dicen «impresora antigua» → esta.',
    },
  ];

  function asegurarImpresoras(d) {
    d.impresoras = Array.isArray(d.impresoras) ? d.impresoras : [];
    let changed = false;
    const byId = new Map(d.impresoras.filter((x) => x && x.id).map((x) => [x.id, x]));
    for (const seed of IMPRESORAS_SEED) {
      const existing = byId.get(seed.id);
      if (!existing) {
        d.impresoras.push({ ...seed });
        byId.set(seed.id, seed);
        changed = true;
        continue;
      }
      // Completa campos canónicos sin pisar $/kg ni consumo editados a mano.
      if (!existing.nombre) {
        existing.nombre = seed.nombre;
        changed = true;
      }
      if (!existing.extrusor) {
        existing.extrusor = seed.extrusor;
        changed = true;
      }
      if (!existing.alias && seed.alias) {
        existing.alias = seed.alias;
        changed = true;
      }
      if (!(Number(existing.consumoImpresoraKw) > 0)) {
        existing.consumoImpresoraKw = seed.consumoImpresoraKw;
        changed = true;
      }
      if (!(Number(existing.tarifaKwhClp) > 0)) {
        existing.tarifaKwhClp = seed.tarifaKwhClp;
        changed = true;
      }
      if (existing.recargoFijoClp == null) {
        existing.recargoFijoClp = seed.recargoFijoClp;
        changed = true;
      }
      if (existing.filamentoOtro == null && seed.filamentoOtro) {
        existing.filamentoOtro = true;
        changed = true;
      }
      if (!existing.notas) {
        existing.notas = seed.notas;
        changed = true;
      }
    }
    return changed;
  }

  function impresoraPorId(id) {
    const list = data?.impresoras || IMPRESORAS_SEED;
    return list.find((x) => x.id === id) || null;
  }

  function impresoraDefault() {
    const list = data?.impresoras || IMPRESORAS_SEED;
    return list.find((x) => x.activaDefault) || list[0] || IMPRESORAS_SEED[0];
  }

  function impresoraDeProducto(prod) {
    const id = prod?.impresoraId || '';
    return (id && impresoraPorId(id)) || impresoraDefault();
  }

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

  /** Argolla + metales llavero: $50 (antes $150 plantilla). */
  function asegurarCostoAnilloLlavero50(d) {
    d.parametros = d.parametros || {};
    const cur = Number(d.parametros.costoAnilloMetalLlaveroClp);
    if (!Number.isFinite(cur) || cur === 150) {
      d.parametros.costoAnilloMetalLlaveroClp = 50;
      return true;
    }
    return false;
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
        nombre: 'Porta Completos Gato',
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
        nombre: 'Porta Completos Perro',
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
  const COSTO_PLA_AMARILLO_KG = 16829; // PLA Amarillo Elegoo (#312435)
  const COSTO_PLA_CAFE_KG = 16829; // PLA Café Elegoo (#312435)
  const COSTO_PLA_BLANCO_KG = 12690; // PLA blanco Elegoo (ML)
  const COSTO_PLA_ROJO_KG = 17986; // PLA+ Rojo Elegoo (#312435)
  const COSTO_PLA_ROSADO_KG = 10990; // Filamento rosado 1kg (compra 29 jul)

  /**
   * Upsert que pisa parámetros slicer del seed (respeta precioVenta si ya > 0).
   * Si el producto tiene editadoLocal, solo alinea sku/nombre canónicos (no pisa g/h/$).
   */
  function forzarProductoSeed(d, id, seed) {
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
    if (existing.editadoLocal) {
      for (const k of ['sku', 'nombre']) {
        if (seed[k] != null && existing[k] !== seed[k]) {
          existing[k] = seed[k];
          changed = true;
        }
      }
      return changed;
    }
    for (const [k, v] of Object.entries(seed)) {
      if (v == null) continue;
      if (k === 'precioVentaSugeridoClp' && Number(existing[k]) > 0) continue;
      if (JSON.stringify(existing[k]) !== JSON.stringify(v)) {
        existing[k] = v;
        changed = true;
      }
    }
    return changed;
  }

  /** Precio a mostrar: venta pública si está definida; si no, sugerido (+margen). */
  function precioVentaProducto(prod, costoTotal) {
    if (Number(prod?.precioVentaSugeridoClp) > 0) return Number(prod.precioVentaSugeridoClp);
    return precioSugeridoDesdeCosto(costoTotal != null ? costoTotal : costoProducto(prod).total);
  }

  /**
   * Porta Bob Esponja (unidad armada) — prorrateo slicer:
   * brazos+piernas 31,50 g / 20 pzas → 4 pzas (2+2); zapatos 55,09 g /20 → 2;
   * corbata 12,44 g /20 → 1; pantalones 80,43 g /3 → 1; camisa 15,06 g → 1.
   * $/kg ponderado amarillo·negro·café·blanco.
   */
  function seedPortaBobEsponja() {
    const partes = [
      { pieza: 'brazos+piernas', color: 'amarillo', batchG: 31.5, batchN: 20, usa: 4, batchMin: 83, kgKg: COSTO_PLA_AMARILLO_KG },
      { pieza: 'zapatos', color: 'negro', batchG: 55.09, batchN: 20, usa: 2, batchMin: 119, kgKg: COSTO_PLA_NEGRO_KG },
      { pieza: 'corbata', color: 'negro', batchG: 12.44, batchN: 20, usa: 1, batchMin: 33 + 20 / 60, kgKg: COSTO_PLA_NEGRO_KG },
      { pieza: 'pantalones', color: 'café', batchG: 80.43, batchN: 3, usa: 1, batchMin: 112, kgKg: COSTO_PLA_CAFE_KG },
      { pieza: 'camisa', color: 'blanco', batchG: 15.06, batchN: 1, usa: 1, batchMin: 28 + 18 / 60, kgKg: COSTO_PLA_BLANCO_KG },
    ];
    const detalle = partes.map((p) => {
      const g = round2((p.batchG * p.usa) / p.batchN);
      const min = round2((p.batchMin * p.usa) / p.batchN);
      return { ...p, g, min, filClp: round2((g / 1000) * p.precioKg) };
    });
    const filamentoGramos = round2(detalle.reduce((a, p) => a + p.g, 0));
    const minutos = detalle.reduce((a, p) => a + p.min, 0);
    const horasImpresion = round2(minutos / 60);
    const filCosto = detalle.reduce((a, p) => a + p.filClp, 0);
    const costoFilamentoKgClp = filamentoGramos > 0 ? round2((filCosto / filamentoGramos) * 1000) : COSTO_PLA_AMARILLO_KG;
    return {
      sku: 'PTBOBES001',
      nombre: 'Porta Bob Esponja',
      activo: true,
      filamentoGramos,
      costoFilamentoKgClp,
      horasImpresion,
      minutosPintado: 0,
      unidadesMetal: 0,
      unidadesBolsa: 1,
      precioVentaSugeridoClp: 0,
      partesSlicer: detalle.map((p) => ({
        pieza: p.pieza,
        color: p.color,
        gramos: p.g,
        minutos: p.min,
        precioKg: p.precioKg,
      })),
      notas:
        `Unidad armada 19 jul 2026. Prorrateo: brazos+piernas ${detalle[0].g} g amarillo (4/20 de 31,50 g) · zapatos ${detalle[1].g} g negro (2/20 de 55,09 g) · corbata ${detalle[2].g} g negro (1/20 de 12,44 g) · pantalones ${detalle[3].g} g café (1/3 de 80,43 g) · camisa ${detalle[4].g} g blanco. Total ${filamentoGramos} g · ${horasImpresion} h · $/kg ponderado $${costoFilamentoKgClp}. Diseño Cults en gastos socios (no en costo producto).`,
    };
  }

  function asegurarProductoPortaBobEsponja(d) {
    // Soft upsert: respeta g/h/$ si la usuaria bajó el costo en Costos producto.
    const seed = seedPortaBobEsponja();
    let changed = upsertProductoSeed(d, 'prod-porta-bob-esponja', seed);
    const p = (d.productos || []).find((x) => x.id === 'prod-porta-bob-esponja');
    if (p) {
      if (p.sku !== seed.sku) {
        p.sku = seed.sku;
        changed = true;
      }
      if (!p.nombre) {
        p.nombre = seed.nombre;
        changed = true;
      }
    }
    return changed;
  }

  /** Nave espacial horizontal — 40,91 g blanco · 1 h 24 m. */
  function asegurarProductoNaveEspacialHorizontal(d) {
    return forzarProductoSeed(d, 'prod-nave-espacial-horizontal', {
      sku: 'NAVEHOR001',
      nombre: 'Nave Espacial Horizontal',
      activo: true,
      filamentoModeloGramos: 40.45,
      filamentoPurgeGramos: 0.47,
      filamentoMetros: 13.61,
      filamentoGramos: 40.91,
      costoFilamentoKgClp: COSTO_PLA_BLANCO_KG,
      horasImpresion: 1.4, // 1 h 24 m
      minutosPintado: 0,
      unidadesMetal: 0,
      unidadesBolsa: 1,
      precioVentaSugeridoClp: 0,
      costoSlicerRef: 0.82,
      notas:
        'Slicer 1 ud: modelo 40,45 g + purge 0,47 g = 40,91 g · 13,61 m · 1 h 24 m · coste slicer 0,82 (ref). PLA blanco $12.690/kg. Diseño en gastos socios.',
    });
  }

  /** Nave espacial vertical — 59,79 g blanco · 1 h 54 m. */
  function asegurarProductoNaveEspacialVertical(d) {
    return forzarProductoSeed(d, 'prod-nave-espacial-vertical', {
      sku: 'NAVEVERT001',
      nombre: 'Nave Espacial Vertical',
      activo: true,
      filamentoModeloGramos: 56.54,
      filamentoSoportesGramos: 2.77,
      filamentoPurgeGramos: 0.47,
      filamentoMetros: 19.88,
      filamentoGramos: 59.79,
      costoFilamentoKgClp: COSTO_PLA_BLANCO_KG,
      horasImpresion: 1.9, // 1 h 54 m
      minutosPintado: 0,
      unidadesMetal: 0,
      unidadesBolsa: 1,
      precioVentaSugeridoClp: 0,
      costoSlicerRef: 1.2,
      notas:
        'Slicer 1 ud: modelo 56,54 g + soportes 2,77 g + purge 0,47 g = 59,79 g · 19,88 m · 1 h 54 m · coste slicer 1,20 (ref). PLA blanco $12.690/kg.',
    });
  }

  /**
   * Llavero Escudo Ranger — multicolor 10,06 g · 43 m 52 s + $50 argolla.
   * Slicer color1→amarillo, color2→rojo, color3+4→negro.
   */
  function seedLlaveroEscudoRanger() {
    const colores = [
      { color: 'amarillo', g: 6.27, precioKg: COSTO_PLA_AMARILLO_KG },
      { color: 'rojo', g: 2.4, precioKg: COSTO_PLA_ROJO_KG },
      { color: 'negro', g: 0.77, precioKg: COSTO_PLA_NEGRO_KG },
      { color: 'negro', g: 0.62, precioKg: COSTO_PLA_NEGRO_KG },
    ];
    const filamentoGramos = round2(colores.reduce((a, c) => a + c.g, 0));
    const filCosto = colores.reduce((a, c) => a + (c.g / 1000) * c.precioKg, 0);
    const costoFilamentoKgClp = round2((filCosto / filamentoGramos) * 1000);
    return {
      sku: 'LLRANGER001',
      nombre: 'Llavero Escudo Ranger',
      activo: true,
      filamentoGramos,
      costoFilamentoKgClp,
      horasImpresion: round2((43 + 52 / 60) / 60), // 43 m 52 s
      minutosPintado: 0,
      unidadesMetal: 1,
      unidadesBolsa: 1,
      precioVentaSugeridoClp: 0,
      costoSlicerRef: 0.2,
      partesSlicer: colores,
      notas:
        `Multicolor 1 impresión: amarillo 6,27 g · rojo 2,40 g · negro 0,77+0,62 g = ${filamentoGramos} g · 43 m 52 s · $/kg ponderado $${costoFilamentoKgClp}. +$50 argolla/metales.`,
    };
  }

  function asegurarProductoLlaveroEscudoRanger(d) {
    return forzarProductoSeed(d, 'prod-llavero-escudo-ranger', seedLlaveroEscudoRanger());
  }

  /** Plantillas genéricas que ya no se usan (no son productos reales del catálogo). */
  function eliminarProductosPlantillaObsoletos(d) {
    d.productos = Array.isArray(d.productos) ? d.productos : [];
    const dropIds = new Set(['prod-llavero', 'prod-figura-chica']);
    const dropSkus = new Set(['LLAV001', 'FIG001']);
    const before = d.productos.length;
    d.productos = d.productos.filter(
      (p) => !dropIds.has(p.id) && !dropSkus.has(String(p.sku || '').toUpperCase())
    );
    return d.productos.length !== before;
  }

  /** Llavero Porta Lipstick Stanley — placa 2 uds (52,65 g / 1 h 34 m) → 1 ud = mitad + $50 argolla. */
  function asegurarProductoLlaveroPortaLipstickStanley(d) {
    return forzarProductoSeed(d, 'prod-llavero-porta-lipstick-stanley', {
      sku: 'LLSTANDL001',
      nombre: 'Llavero Porta Lipstick Stanley',
      activo: true,
      filamentoModeloGramos: round2(47.32 / 2),
      filamentoSoportesGramos: round2(4.87 / 2),
      filamentoPurgeGramos: round2(0.47 / 2),
      filamentoMetros: round2(17.51 / 2),
      filamentoGramos: round2(52.65 / 2),
      costoFilamentoKgClp: COSTO_PLA_BLANCO_KG,
      horasImpresion: round2(94 / 60 / 2), // (1 h 34 m) / 2
      minutosPintado: 0,
      unidadesMetal: 1,
      unidadesBolsa: 1,
      precioVentaSugeridoClp: 0,
      costoSlicerRef: round2(1.05 / 2),
      notas:
        'Slicer placa 2 uds: 52,65 g · 17,51 m · 1 h 34 m · coste 1,05 → 1 ud = 26,33 g · 0,78 h. PLA blanco $12.690/kg. +$50 argolla/metales.',
    });
  }

  /** Llavero Pesa Rusa — slicer 16,78 g · 35 m 31 s · PLA amarillo + $50 argolla. Soft: no pisa si editadoLocal con g. */
  function seedLlaveroPesaRusa() {
    const filamentoModeloGramos = 16.31;
    const filamentoPurgeGramos = 0.47;
    const filamentoGramos = round2(filamentoModeloGramos + filamentoPurgeGramos); // 16,78
    return {
      sku: 'LLPESRU001',
      nombre: 'Llavero Pesa Rusa',
      activo: true,
      filamentoModeloGramos,
      filamentoSoportesGramos: 0,
      filamentoPurgeGramos,
      filamentoMetros: 5.58,
      filamentoGramos,
      costoFilamentoKgClp: COSTO_PLA_AMARILLO_KG,
      horasImpresion: round2((35 + 31 / 60) / 60), // 35 m 31 s → 0,59 h
      minutosPintado: 0,
      unidadesMetal: 1,
      unidadesBolsa: 1,
      precioVentaSugeridoClp: 1000,
      costoSlicerRef: 0.34,
      pendienteCosto: false,
      notas:
        `Slicer 1 ud: modelo ${filamentoModeloGramos} g + descargado ${filamentoPurgeGramos} g = ${filamentoGramos} g · 5,58 m · 35 m 31 s · coste slicer 0,34. PLA amarillo $16.829/kg. +$50 argolla. PVP $1.000.`,
    };
  }

  function asegurarProductoLlaveroPesaRusa(d) {
    d.productos = Array.isArray(d.productos) ? d.productos : [];
    const id = 'prod-llavero-pesa-rusa';
    const seed = seedLlaveroPesaRusa();
    const existing = d.productos.find((p) => p.id === id || p.sku === seed.sku);
    if (!existing) {
      d.productos.push({ id, ...seed });
      return true;
    }
    let changed = false;
    if (existing.sku !== seed.sku) {
      existing.sku = seed.sku;
      changed = true;
    }
    if (existing.nombre !== seed.nombre) {
      existing.nombre = seed.nombre;
      changed = true;
    }
    // Si aún no tenía g/h (pendiente) o quedó en 0, aplica slicer.
    if (!(Number(existing.filamentoGramos) > 0) || existing.pendienteCosto) {
      Object.assign(existing, seed);
      return true;
    }
    if (existing.unidadesMetal == null) {
      existing.unidadesMetal = 1;
      changed = true;
    }
    if (existing.pendienteCosto) {
      existing.pendienteCosto = false;
      changed = true;
    }
    return changed;
  }

  /** Soporte celular — slicer 34,46 g · 57 m 30 s · PLA color (morado pastel). Soft: no pisa si ya tiene g. */
  function seedSoporteCelular() {
    const filamentoModeloGramos = 33.99;
    const filamentoPurgeGramos = 0.47;
    const filamentoGramos = round2(filamentoModeloGramos + filamentoPurgeGramos); // 34,46
    return {
      sku: 'SOPCEL001',
      nombre: 'Soporte celular',
      activo: true,
      filamentoModeloGramos,
      filamentoSoportesGramos: 0,
      filamentoPurgeGramos,
      filamentoMetros: 11.46,
      filamentoGramos,
      costoFilamentoKgClp: COSTO_PLA_AMARILLO_KG, // ref PLA color (morado pastel)
      horasImpresion: round2((57 + 30 / 60) / 60), // 57 m 30 s → 0,96 h
      minutosPintado: 0,
      unidadesMetal: 0,
      unidadesBolsa: 1,
      precioVentaSugeridoClp: 4000,
      costoSlicerRef: 0.69,
      pendienteCosto: false,
      notas:
        `Slicer 1 ud: modelo ${filamentoModeloGramos} g + descargado ${filamentoPurgeGramos} g = ${filamentoGramos} g · 11,46 m · 57 m 30 s · coste slicer 0,69. PLA morado pastel (ref $/kg color $16.829). Precio venta $4.000.`,
    };
  }

  function asegurarProductoSoporteCelular(d) {
    d.productos = Array.isArray(d.productos) ? d.productos : [];
    const id = 'prod-soporte-celular';
    const seed = seedSoporteCelular();
    const existing = d.productos.find((p) => p.id === id || p.sku === seed.sku);
    if (!existing) {
      d.productos.push({ id, ...seed });
      return true;
    }
    let changed = false;
    if (existing.sku !== seed.sku) {
      existing.sku = seed.sku;
      changed = true;
    }
    if (existing.nombre !== seed.nombre) {
      existing.nombre = seed.nombre;
      changed = true;
    }
    if (!(Number(existing.filamentoGramos) > 0) || existing.pendienteCosto) {
      Object.assign(existing, seed);
      return true;
    }
    return changed;
  }

  /** Color vigente: «rosado pastel» → «morado pastel» (producto / pedidos / ventas). */
  function renombrarRosadoPastel(texto) {
    let s = String(texto || '');
    if (!s) return s;
    s = s.replace(/PLA rosado pastel/gi, 'PLA morado pastel');
    s = s.replace(/rosado pastel/gi, 'morado pastel');
    s = s.replace(/Soporte celular rosado(?!\s*pastel)/gi, 'Soporte celular morado pastel');
    s = s.replace(/morado pastel pastel/gi, 'morado pastel');
    return s;
  }

  function asegurarRenombrarRosadoPastelAMorado(d) {
    let changed = false;
    const touchStr = (obj, key) => {
      if (!obj || obj[key] == null) return;
      const next = renombrarRosadoPastel(obj[key]);
      if (next !== obj[key]) {
        obj[key] = next;
        changed = true;
      }
    };
    for (const p of d.productos || []) {
      touchStr(p, 'notas');
    }
    for (const ped of d.pedidos || []) {
      touchStr(ped, 'notas');
      for (const it of ped.items || []) touchStr(it, 'filamento');
    }
    for (const v of d.ventas || []) {
      touchStr(v, 'descripcion');
      touchStr(v, 'notas');
      for (const it of v.items || []) touchStr(it, 'filamento');
    }
    for (const b of d.bitacora || []) touchStr(b, 'texto');
    return changed;
  }

  /** Dragón — slicer alto 275,41 g · 14 h 7 m · PVP $20.000. Soft seed. */
  function seedDragon() {
    const filamentoModeloGramos = 192.38;
    const filamentoGramos = 275.41;
    const filamentoSoportesGramos = round2(filamentoGramos - filamentoModeloGramos);
    return {
      sku: 'DRAGON001',
      nombre: 'Dragón',
      activo: true,
      filamentoModeloGramos,
      filamentoSoportesGramos,
      filamentoPurgeGramos: 0,
      filamentoMetros: 91.6,
      filamentoGramos,
      costoFilamentoKgClp: COSTO_PLA_AMARILLO_KG,
      horasImpresion: round2((14 * 60 + 7) / 60), // 14 h 7 m
      minutosPintado: 0,
      unidadesMetal: 0,
      unidadesBolsa: 1,
      precioVentaSugeridoClp: 20000,
      costoSlicerRef: 5.51,
      pendienteCosto: false,
      notas:
        `Slicer (medición alta): modelo ${filamentoModeloGramos} g + soportes ${filamentoSoportesGramos} g = ${filamentoGramos} g · 91,6 m · 14 h 7 m · coste slicer 5,51. PLA color $16.829/kg. PVP $20.000.`,
    };
  }

  function asegurarProductoDragon(d) {
    d.productos = Array.isArray(d.productos) ? d.productos : [];
    const id = 'prod-dragon';
    const seed = seedDragon();
    const existing = d.productos.find((p) => p.id === id || p.sku === seed.sku);
    if (!existing) {
      d.productos.push({ id, ...seed });
      return true;
    }
    let changed = false;
    if (existing.sku !== seed.sku) {
      existing.sku = seed.sku;
      changed = true;
    }
    if (existing.nombre !== seed.nombre) {
      existing.nombre = seed.nombre;
      changed = true;
    }
    if (!(Number(existing.filamentoGramos) > 0) || existing.pendienteCosto) {
      Object.assign(existing, seed);
      return true;
    }
    if (!(Number(existing.precioVentaSugeridoClp) > 0)) {
      existing.precioVentaSugeridoClp = seed.precioVentaSugeridoClp;
      changed = true;
    } else if (Number(existing.precioVentaSugeridoClp) === 11000) {
      // Migrar PVP viejo del seed → cobrado vigente $20.000
      existing.precioVentaSugeridoClp = 20000;
      changed = true;
    }
    return changed;
  }

  /**
   * Torreón — sin slicer (impresora antigua). Estimación ~120 g / 4 h + $1.000 recargo.
   * Soft seed: no pisa si ya hay g reales de slicer.
   */
  function seedTorreon() {
    const filamentoGramos = 120;
    const horasImpresion = 4;
    return {
      sku: 'TORREON001',
      nombre: 'Torreón',
      activo: true,
      impresoraId: 'imp-ender-3-v2-neo',
      filamentoGramos,
      costoFilamentoKgClp: COSTO_PLA_AMARILLO_KG,
      horasImpresion,
      minutosPintado: 0,
      unidadesMetal: 0,
      unidadesBolsa: 1,
      precioVentaSugeridoClp: 6500,
      pendienteCosto: false,
      estimacionSinSlicer: true,
      notas:
        `Estimación sin registro slicer · Ender 3 V2 Neo (Sprite Neo): ~${filamentoGramos} g · ~${horasImpresion} h · PLA color $16.829/kg + recargo perfil Ender. PVP $6.500.`,
    };
  }

  function asegurarProductoTorreon(d) {
    d.productos = Array.isArray(d.productos) ? d.productos : [];
    const id = 'prod-torreon';
    const seed = seedTorreon();
    const existing = d.productos.find((p) => p.id === id || p.sku === seed.sku);
    if (!existing) {
      d.productos.push({ id, ...seed });
      return true;
    }
    let changed = false;
    if (existing.sku !== seed.sku) {
      existing.sku = seed.sku;
      changed = true;
    }
    if (existing.nombre !== seed.nombre) {
      existing.nombre = seed.nombre;
      changed = true;
    }
    if (existing.impresoraId !== seed.impresoraId) {
      existing.impresoraId = seed.impresoraId;
      changed = true;
    }
    if (existing.recargoImpresoraAntiguaClp != null) {
      delete existing.recargoImpresoraAntiguaClp;
      changed = true;
    }
    if (!(Number(existing.filamentoGramos) > 0) || existing.estimacionSinSlicer) {
      // Solo completa huecos; no pisa si después hay slicer real (estimacionSinSlicer false + g).
      if (existing.estimacionSinSlicer !== false) {
        Object.assign(existing, seed);
        delete existing.recargoImpresoraAntiguaClp;
        return true;
      }
    }
    return changed;
  }

  /** Limpiador de brochas — slicer 114,05 g · 3 h 28 m · PLA morado pastel · Elegoo. Soft seed. */
  function seedLimpiadorBrochas() {
    const filamentoModeloGramos = 113.58;
    const filamentoPurgeGramos = 0.47;
    const filamentoGramos = round2(filamentoModeloGramos + filamentoPurgeGramos); // 114,05
    return {
      sku: 'LMBROC001',
      nombre: 'Limpiador de brochas',
      activo: true,
      impresoraId: 'imp-centauri-carbon-2',
      filamentoModeloGramos,
      filamentoSoportesGramos: 0,
      filamentoPurgeGramos,
      filamentoMetros: 37.93,
      filamentoGramos,
      costoFilamentoKgClp: COSTO_PLA_AMARILLO_KG, // PLA color / morado pastel
      horasImpresion: round2((3 * 60 + 28) / 60), // 3 h 28 m → 3,47 h
      minutosPintado: 0,
      unidadesMetal: 0,
      unidadesBolsa: 1,
      precioVentaSugeridoClp: 4300,
      costoSlicerRef: 2.28,
      pendienteCosto: false,
      notas:
        `Slicer 1 ud: modelo ${filamentoModeloGramos} g + descargado ${filamentoPurgeGramos} g = ${filamentoGramos} g · 37,93 m · 3 h 28 m · coste slicer 2,28. PLA morado pastel (ref $/kg color $16.829) · Elegoo Centauri. Costo ~$2.163 · PVP sugerido $4.300.`,
    };
  }

  function asegurarProductoLimpiadorBrochas(d) {
    d.productos = Array.isArray(d.productos) ? d.productos : [];
    const id = 'prod-limpiador-brochas';
    const seed = seedLimpiadorBrochas();
    const existing = d.productos.find((p) => p.id === id || p.sku === seed.sku);
    if (!existing) {
      d.productos.push({ id, ...seed });
      return true;
    }
    let changed = false;
    if (existing.sku !== seed.sku) {
      existing.sku = seed.sku;
      changed = true;
    }
    if (existing.nombre !== seed.nombre) {
      existing.nombre = seed.nombre;
      changed = true;
    }
    if (!(Number(existing.filamentoGramos) > 0) || existing.pendienteCosto) {
      Object.assign(existing, seed);
      return true;
    }
    if (!(Number(existing.precioVentaSugeridoClp) > 0)) {
      existing.precioVentaSugeridoClp = seed.precioVentaSugeridoClp;
      changed = true;
    }
    return changed;
  }

  /** Alcancía chanchito — slicer 315,88 g · 12 h 9 m · PLA rosado · Elegoo. Soft seed. */
  function seedAlcanciaChanchito() {
    const filamentoModeloGramos = 280.74;
    const filamentoSoportesGramos = 33.75;
    const filamentoPurgeGramos = 1.4;
    const filamentoGramos = 315.88; // total slicer
    const horasImpresion = round2((12 * 60 + 9) / 60); // 12 h 9 m → 12,15 h
    // Costo approx: fil 3471,52 + luz 680,40 + bolsa 50 ≈ 4201,92 → PVP +100% $8.400
    return {
      sku: 'ALCHAN001',
      nombre: 'Alcancía chanchito',
      activo: true,
      impresoraId: 'imp-centauri-carbon-2',
      filamentoModeloGramos,
      filamentoSoportesGramos,
      filamentoPurgeGramos,
      filamentoMetros: 105.06,
      filamentoGramos,
      costoFilamentoKgClp: COSTO_PLA_ROSADO_KG,
      horasImpresion,
      minutosPintado: 0,
      unidadesMetal: 0,
      unidadesBolsa: 1,
      precioVentaSugeridoClp: 8400,
      costoSlicerRef: 6.32,
      pendienteCosto: false,
      notas:
        `Slicer 1 ud: modelo ${filamentoModeloGramos} g + soportes ${filamentoSoportesGramos} g + descargado ${filamentoPurgeGramos} g = ${filamentoGramos} g · 105,06 m · 12 h 9 m · coste slicer 6,32. PLA rosado $10.990/kg · Elegoo Centauri. Costo ~$4.202 · PVP sugerido $8.400.`,
    };
  }

  function asegurarProductoAlcanciaChanchito(d) {
    d.productos = Array.isArray(d.productos) ? d.productos : [];
    const id = 'prod-alcancia-chanchito';
    const seed = seedAlcanciaChanchito();
    const existing = d.productos.find((p) => p.id === id || p.sku === seed.sku);
    if (!existing) {
      d.productos.push({ id, ...seed });
      return true;
    }
    let changed = false;
    if (existing.sku !== seed.sku) {
      existing.sku = seed.sku;
      changed = true;
    }
    if (existing.nombre !== seed.nombre) {
      existing.nombre = seed.nombre;
      changed = true;
    }
    if (!(Number(existing.filamentoGramos) > 0) || existing.pendienteCosto) {
      Object.assign(existing, seed);
      return true;
    }
    if (!(Number(existing.precioVentaSugeridoClp) > 0)) {
      existing.precioVentaSugeridoClp = seed.precioVentaSugeridoClp;
      changed = true;
    }
    return changed;
  }

  function formatearCodigoVenta(n) {
    return `I${String(n).padStart(6, '0')}`;
  }

  /** Nombre + origen: SIE = trabajo Nicolás · MKOF = trabajo Josefa. No auto-poner SIE. */
  function formatearClienteImp(nombre, segundoNombre, origen) {
    const n = String(nombre || '').trim();
    const s = String(segundoNombre || '').trim();
    const o = String(origen || '').trim().toUpperCase();
    const origenOk = o === 'SIE' || o === 'MKOF' ? o : '';
    const parts = [n, s, origenOk].filter(Boolean);
    return parts.join(' ');
  }

  /** Columna gastos: Ambos = sociedad 50/50; hasta ahora pagó Nicolás. */
  function labelQuienGasto(g) {
    const socio = String(g.socioRegistro || 'Ambos').trim() || 'Ambos';
    const pago = String(g.pagadoPor || '').trim();
    if (pago) {
      if (/^ambos$/i.test(socio)) return `Ambos · pagó ${pago}`;
      return `${socio} · pagó ${pago}`;
    }
    if (/^ambos$/i.test(socio)) return 'Ambos · pagó Nicolás';
    if (/^nicol/i.test(socio)) return 'Nicolás (pagó)';
    return socio;
  }

  function labelOrigenCliente(origen) {
    const o = String(origen || '').toUpperCase();
    if (o === 'SIE') return 'SIE · trabajo Nicolás';
    if (o === 'MKOF') return 'MKOF · trabajo Josefa';
    return '';
  }

  /** Separa "María José MKOF" → { nombre, segundoNombre, origen } (origen al final si es SIE/MKOF). */
  function parseClienteImp(cliente, meta) {
    if (meta && (meta.clienteNombre || meta.clienteOrigen)) {
      return {
        nombre: String(meta.clienteNombre || '').trim(),
        segundoNombre: String(meta.clienteSegundoNombre || '').trim(),
        origen: String(meta.clienteOrigen || '').trim().toUpperCase(),
      };
    }
    const parts = String(cliente || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return { nombre: '', segundoNombre: '', origen: '' };
    const last = parts[parts.length - 1].toUpperCase();
    if (last === 'SIE' || last === 'MKOF') {
      const nameParts = parts.slice(0, -1);
      return {
        nombre: nameParts[0] || '',
        segundoNombre: nameParts.slice(1).join(' '),
        origen: last,
      };
    }
    return { nombre: parts[0] || '', segundoNombre: parts.slice(1).join(' '), origen: '' };
  }

  function nextVentaCodigo(d) {
    if (!d.meta || typeof d.meta !== 'object') d.meta = {};
    const n = Number(d.meta.ventaSeq || 0) + 1;
    d.meta.ventaSeq = n;
    return formatearCodigoVenta(n);
  }

  function rebuildClientesHistorial(d) {
    if (!d.meta || typeof d.meta !== 'object') d.meta = {};
    const by = {};
    for (const v of d.ventas || []) {
      const c = String(v.cliente || '—').trim() || '—';
      if (!by[c]) by[c] = { cliente: c, ventaCodigos: [], ventaIds: [], totalNeto: 0, compras: 0 };
      const h = by[c];
      h.compras += 1;
      h.totalNeto += Number(v.montoNeto || 0);
      if (v.codigo) h.ventaCodigos.push(v.codigo);
      if (v.id) h.ventaIds.push(v.id);
    }
    d.meta.clientesHistorial = Object.values(by).sort(
      (a, b) => b.compras - a.compras || a.cliente.localeCompare(b.cliente, 'es')
    );
    return d.meta.clientesHistorial;
  }

  /** Mel MKOF PED-013 pagado → I000020 (siempre; live viejos la dejan fuera). */
  function asegurarMelVenta020(d) {
    d.ventas = Array.isArray(d.ventas) ? d.ventas : [];
    d.pedidos = Array.isArray(d.pedidos) ? d.pedidos : [];
    let changed = false;
    const precio = 4000;
    const costo = 683.69;
    let ped = d.pedidos.find((p) => p && (p.id === 'ped-mel-soporte-013' || p.numero === 'PED-013'));
    if (!ped) {
      ped = {
        id: 'ped-mel-soporte-013',
        numero: 'PED-013',
        fecha: '2026-07-31',
        cliente: 'Mel MKOF',
        clienteNombre: 'Mel',
        clienteOrigen: 'MKOF',
        canal: 'WhatsApp',
        items: [
          {
            sku: 'SOPCEL001',
            nombre: 'Soporte celular',
            cantidad: 1,
            precioUnitarioClp: precio,
            costoUnitarioClp: costo,
            filamento: 'PLA+ negro',
            estado: 'listo',
            listos: 1,
            enImpresion: 0,
          },
        ],
        montoBruto: precio,
        descuentoClp: 0,
        montoNeto: precio,
        costoTotal: costo,
        socioRegistro: 'Ambos',
        creado: '2026-07-31T00:30:00.000Z',
      };
      d.pedidos.push(ped);
      changed = true;
    }
    if (ped.estado !== 'transferido' || ped.fiado || ped.ventaId !== 'ven-mel-soporte-020') {
      ped.estado = 'transferido';
      ped.fiado = false;
      delete ped.fechaPagoEsperada;
      ped.ventaId = 'ven-mel-soporte-020';
      ped.transferidoEn = ped.transferidoEn || new Date().toISOString();
      ped.montoNeto = precio;
      ped.montoBruto = precio;
      ped.cliente = 'Mel MKOF';
      ped.clienteOrigen = 'MKOF';
      ped.notas =
        '1× Soporte celular negro · transferido a venta I000020 · pagado $4.000 · MKOF (Josefa)';
      ped.pagoNotas = 'Pagado · transferido a venta I000020';
      changed = true;
    }
    const vi = d.ventas.findIndex(
      (v) => v && (v.id === 'ven-mel-soporte-020' || v.codigo === 'I000020')
    );
    const venta = {
      id: 'ven-mel-soporte-020',
      codigo: 'I000020',
      fecha: '2026-07-31',
      cliente: 'Mel MKOF',
      clienteNombre: 'Mel',
      clienteOrigen: 'MKOF',
      descripcion: 'PED-013 · 1× Soporte celular negro · Mel MKOF',
      cantidad: 1,
      montoBruto: precio,
      descuentoClp: 0,
      montoNeto: precio,
      costoTotal: costo,
      canal: 'WhatsApp',
      notas: 'Transferido desde PED-013 · fiado cobrado · 1× Soporte celular negro · pagado $4.000',
      socioRegistro: 'Ambos',
      pedidoId: 'ped-mel-soporte-013',
      pedidoNumero: 'PED-013',
      items: [
        {
          sku: 'SOPCEL001',
          nombre: 'Soporte celular',
          cantidad: 1,
          precioUnitarioClp: precio,
          costoUnitarioClp: costo,
          filamento: 'PLA+ negro',
        },
      ],
    };
    if (vi < 0) {
      d.ventas.push(venta);
      changed = true;
    }
    if (Number(d.meta?.ventaSeq || 0) < 20) {
      d.meta = d.meta || {};
      d.meta.ventaSeq = 20;
      changed = true;
    }
    return changed;
  }

  /** Ventas base del seed: si el live quedó vacío (o sin ese id), las reinyecta. No pisa ventas nuevas. */
  function asegurarVentasSeed(d) {
    d.ventas = Array.isArray(d.ventas) ? d.ventas : [];
    d.pedidos = Array.isArray(d.pedidos) ? d.pedidos : [];
    const SEED_VENTAS = [
      {
        id: 'ven-mrpqov4c',
        codigo: 'I000001',
        fecha: '2026-07-18',
        cliente: 'Tito MKOF',
        descripcion: 'Portacompletos ×6 (4 perros + 2 gatos)',
        cantidad: 6,
        montoNeto: 15000,
        canal: 'WhatsApp',
        notas: 'Cliente Tito MKOF · 4 Portacompletos perro + 2 Portacompletos gato · total cobrado $15.000',
        socioRegistro: 'Ambos',
      },
      {
        id: 'ven-gianni-bulldog-002',
        codigo: 'I000002',
        fecha: '2026-07-18',
        cliente: 'Gianni SIE',
        descripcion: 'PED-002 · 1× Macetero + 4× Porta Completo Bulldog · Gianni SIE',
        cantidad: 5,
        montoBruto: 15000,
        descuentoClp: 0,
        montoNeto: 15000,
        costoTotal: 7324.78,
        canal: 'WhatsApp',
        notas: 'Transferido desde PED-002 · 4 bulldogs porta completo + 1 macetero · cobrado $15.000',
        socioRegistro: 'Ambos',
        pedidoId: 'ped-gianni-bulldog-002',
        pedidoNumero: 'PED-002',
        items: [
          { sku: 'MCPEBUL001', nombre: 'Macetero Perro Bulldog', cantidad: 1, precioUnitarioClp: 3000, costoUnitarioClp: 1981.34, filamento: 'PLA+ negro' },
          { sku: 'PCPEBUL001', nombre: 'Porta Completo Perro Bulldog', cantidad: 4, precioUnitarioClp: 3000, costoUnitarioClp: 1335.86, filamento: 'PLA+ negro' },
        ],
      },
      {
        id: 'ven-juan-naves-003',
        codigo: 'I000003',
        fecha: '2026-07-19',
        cliente: 'Juan SIE',
        descripcion: 'PED-003 · 2× Naves espaciales · Juan SIE',
        cantidad: 2,
        montoBruto: 15000,
        descuentoClp: 0,
        montoNeto: 15000,
        costoTotal: 1562.69,
        canal: 'WhatsApp',
        notas: 'Transferido desde PED-003 · 1× horizontal + 1× vertical · cobrado $15.000',
        socioRegistro: 'Ambos',
        pedidoId: 'ped-naves-espaciales-003',
        pedidoNumero: 'PED-003',
        items: [
          { sku: 'NAVEHOR001', nombre: 'Nave Espacial Horizontal', cantidad: 1, precioUnitarioClp: 7500, costoUnitarioClp: 647.55, filamento: 'PLA blanco' },
          { sku: 'NAVEVERT001', nombre: 'Nave Espacial Vertical', cantidad: 1, precioUnitarioClp: 7500, costoUnitarioClp: 915.14, filamento: 'PLA blanco' },
        ],
      },
      {
        id: 'ven-cata-gatos-001',
        codigo: 'I000004',
        fecha: '2026-07-23',
        cliente: 'Cata SIE',
        descripcion: '4× Porta Completos Gato (2 negros + 2 naranjos)',
        cantidad: 4,
        montoBruto: 10000,
        descuentoClp: 0,
        montoNeto: 10000,
        costoTotal: 13684.68,
        canal: 'WhatsApp',
        notas: '2× gatos negros + 2× gatos naranjos (porta completo) · cobrado $10.000',
        socioRegistro: 'Ambos',
        items: [
          { sku: 'PCGATO001', nombre: 'Porta Completos Gato (negro)', cantidad: 2, precioUnitarioClp: 2500, costoUnitarioClp: 3421.17, filamento: 'PLA negro' },
          { sku: 'PCGATO001', nombre: 'Porta Completos Gato (naranjo)', cantidad: 2, precioUnitarioClp: 2500, costoUnitarioClp: 3421.17, filamento: 'PLA naranjo' },
        ],
      },
      {
        id: 'ven-marcia-stanley-001',
        codigo: 'I000005',
        fecha: '2026-07-23',
        cliente: 'Marcia SIE',
        descripcion: '1× Llavero Porta Lipstick Stanley',
        cantidad: 1,
        montoBruto: 3000,
        descuentoClp: 0,
        montoNeto: 3000,
        costoTotal: 477.93,
        canal: 'WhatsApp',
        notas: '1× llavero Stanley · cobrado $3.000',
        socioRegistro: 'Ambos',
        items: [
          { sku: 'LLSTANDL001', nombre: 'Llavero Porta Lipstick Stanley', cantidad: 1, precioUnitarioClp: 3000, costoUnitarioClp: 477.93, filamento: 'PLA blanco' },
        ],
      },
      {
        id: 'ven-gianni-bob-001',
        codigo: 'I000006',
        fecha: '2026-07-23',
        cliente: 'Gianni SIE',
        descripcion: '1× Porta Bob Esponja',
        cantidad: 1,
        montoBruto: 7000,
        descuentoClp: 0,
        montoNeto: 7000,
        costoTotal: 998.17,
        canal: 'WhatsApp',
        notas: '1× Porta Bob Esponja · cobrado $7.000',
        socioRegistro: 'Ambos',
        items: [
          { sku: 'PTBOBES001', nombre: 'Porta Bob Esponja', cantidad: 1, precioUnitarioClp: 7000, costoUnitarioClp: 998.17, filamento: 'multicolor' },
        ],
      },
      {
        id: 'ven-rebe-monster-007',
        codigo: 'I000007',
        fecha: '2026-07-26',
        cliente: 'Rebe SIE',
        descripcion: 'PED-001 · 1× Porta Lata Monster · Rebe SIE',
        cantidad: 1,
        montoBruto: 7000,
        descuentoClp: 0,
        montoNeto: 7000,
        costoTotal: 2839.6,
        canal: 'WhatsApp',
        notas: 'Transferido desde PED-001 · 1× vaso/porta Monster · cobrado $7.000',
        socioRegistro: 'Ambos',
        pedidoId: 'ped-rebe-plmons-001',
        pedidoNumero: 'PED-001',
        items: [
          { sku: 'PLMONS001', nombre: 'Porta Lata Monster', cantidad: 1, precioUnitarioClp: 7000, costoUnitarioClp: 2839.6, filamento: 'PLA+ negro' },
        ],
      },
      {
        id: 'ven-rebe-stanley-008',
        codigo: 'I000008',
        fecha: '2026-07-26',
        cliente: 'Rebe SIE',
        descripcion: '2× Llavero Porta Lipstick Stanley (rojo / círculo blanco)',
        cantidad: 2,
        montoBruto: 6000,
        descuentoClp: 0,
        montoNeto: 6000,
        costoTotal: 955.86,
        canal: 'WhatsApp',
        notas: '2× Stanley impresos en rojo con círculo blanco · cobrado $6.000',
        socioRegistro: 'Ambos',
        items: [
          { sku: 'LLSTANDL001', nombre: 'Llavero Porta Lipstick Stanley', cantidad: 2, precioUnitarioClp: 3000, costoUnitarioClp: 477.93, filamento: 'PLA+ rojo · círculo blanco' },
        ],
      },
      {
        id: 'ven-marcia-soporte-009',
        codigo: 'I000009',
        fecha: '2026-07-26',
        cliente: 'Marcia SIE',
        descripcion: '1× Soporte celular (filamento blanco)',
        cantidad: 1,
        montoBruto: 3000,
        descuentoClp: 0,
        montoNeto: 3000,
        canal: 'WhatsApp',
        notas: '1× soporte celular · filamento blanco · cobrado $3.000',
        socioRegistro: 'Ambos',
        items: [
          { sku: 'SOPCEL001', nombre: 'Soporte celular', cantidad: 1, precioUnitarioClp: 3000, filamento: 'PLA blanco' },
        ],
      },
      {
        id: 'ven-cata-bob-010',
        codigo: 'I000010',
        fecha: '2026-07-26',
        cliente: 'Cata SIE',
        descripcion: '1× Porta Bob Esponja',
        cantidad: 1,
        montoBruto: 7000,
        descuentoClp: 0,
        montoNeto: 7000,
        costoTotal: 998.17,
        canal: 'WhatsApp',
        notas: '1× Porta Bob Esponja · costo ya calculado · cobrado $7.000',
        socioRegistro: 'Ambos',
        items: [
          { sku: 'PTBOBES001', nombre: 'Porta Bob Esponja', cantidad: 1, precioUnitarioClp: 7000, costoUnitarioClp: 998.17, filamento: 'multicolor' },
        ],
      },
      {
        id: 'ven-maria-paz-soporte-011',
        codigo: 'I000011',
        fecha: '2026-07-28',
        cliente: 'María Paz SIE',
        descripcion: 'PED-005 · 1× Soporte celular morado pastel · María Paz SIE',
        cantidad: 1,
        montoBruto: 4000,
        descuentoClp: 0,
        montoNeto: 4000,
        costoTotal: 683.69,
        canal: 'WhatsApp',
        notas: 'Transferido desde PED-005 · 1× Soporte celular morado pastel · pagado $4.000',
        socioRegistro: 'Ambos',
        pedidoId: 'ped-maria-paz-soporte-005',
        pedidoNumero: 'PED-005',
        items: [
          {
            sku: 'SOPCEL001',
            nombre: 'Soporte celular',
            cantidad: 1,
            precioUnitarioClp: 4000,
            costoUnitarioClp: 683.69,
            filamento: 'PLA morado pastel',
          },
        ],
      },
      {
        id: 'ven-rebe-soporte-012',
        codigo: 'I000012',
        fecha: '2026-07-28',
        cliente: 'Rebe SIE',
        descripcion: 'PED-009 · 1× Soporte celular negro · Rebe SIE',
        cantidad: 1,
        montoBruto: 4000,
        descuentoClp: 0,
        montoNeto: 4000,
        costoTotal: 683.69,
        canal: 'WhatsApp',
        notas: 'Transferido desde PED-009 · 1× Soporte celular negro · pagado $4.000',
        socioRegistro: 'Ambos',
        pedidoId: 'ped-rebe-soporte-009',
        pedidoNumero: 'PED-009',
        items: [
          {
            sku: 'SOPCEL001',
            nombre: 'Soporte celular',
            cantidad: 1,
            precioUnitarioClp: 4000,
            costoUnitarioClp: 683.69,
            filamento: 'PLA+ negro',
          },
        ],
      },
      {
        id: 'ven-rebe-dragon-013',
        codigo: 'I000013',
        fecha: '2026-07-28',
        cliente: 'Rebe SIE',
        descripcion: 'PED-006 · 1× Dragón morado · Rebe SIE',
        cantidad: 1,
        montoBruto: 20000,
        descuentoClp: 0,
        montoNeto: 20000,
        costoTotal: 5475.59,
        canal: 'WhatsApp',
        notas: 'Transferido desde PED-006 · 1× Dragón morado · pagado $20.000',
        socioRegistro: 'Ambos',
        pedidoId: 'ped-rebe-dragon-006',
        pedidoNumero: 'PED-006',
        items: [
          {
            sku: 'DRAGON001',
            nombre: 'Dragón',
            cantidad: 1,
            precioUnitarioClp: 20000,
            costoUnitarioClp: 5475.59,
            filamento: 'PLA morado',
          },
        ],
      },
      {
        id: 'ven-ele-pesa-014',
        codigo: 'I000014',
        fecha: '2026-07-28',
        cliente: 'Ele SIE',
        descripcion: 'PED-004 · 2× Llavero Pesa Rusa amarillo · Ele SIE',
        cantidad: 2,
        montoBruto: 5000,
        descuentoClp: 0,
        montoNeto: 5000,
        costoTotal: 830.86,
        canal: 'WhatsApp',
        notas: 'Transferido desde PED-004 · 2× Llavero Pesa Rusa amarillo · pagado $5.000',
        socioRegistro: 'Ambos',
        pedidoId: 'ped-ele-pesa-rusa-004',
        pedidoNumero: 'PED-004',
        items: [
          {
            sku: 'LLPESRU001',
            nombre: 'Llavero Pesa Rusa',
            cantidad: 2,
            precioUnitarioClp: 2500,
            costoUnitarioClp: 415.43,
            filamento: 'PLA amarillo',
          },
        ],
      },
      {
        id: 'ven-marcia-soporte-015',
        codigo: 'I000015',
        fecha: '2026-07-28',
        cliente: 'Marcia SIE',
        descripcion: 'PED-011 · 1× Soporte celular morado · Marcia SIE',
        cantidad: 1,
        montoBruto: 3000,
        descuentoClp: 0,
        montoNeto: 3000,
        costoTotal: 683.69,
        canal: 'WhatsApp',
        notas: 'Transferido desde PED-011 · 1× Soporte celular morado · pagado $3.000',
        socioRegistro: 'Ambos',
        pedidoId: 'ped-marcia-soporte-011',
        pedidoNumero: 'PED-011',
        items: [
          {
            sku: 'SOPCEL001',
            nombre: 'Soporte celular',
            cantidad: 1,
            precioUnitarioClp: 3000,
            costoUnitarioClp: 683.69,
            filamento: 'PLA morado',
          },
        ],
      },
      {
        id: 'ven-fabian-bob-016',
        codigo: 'I000016',
        fecha: '2026-07-31',
        cliente: 'Fabian MKOF',
        clienteNombre: 'Fabian',
        clienteOrigen: 'MKOF',
        descripcion: '1× Porta Bob Esponja · Fabian MKOF',
        cantidad: 1,
        montoBruto: 7000,
        descuentoClp: 0,
        montoNeto: 7000,
        costoTotal: 998.17,
        canal: 'WhatsApp',
        notas: '1× Porta Bob Esponja · cobrado $7.000 · MKOF (Josefa)',
        socioRegistro: 'Ambos',
        items: [
          {
            sku: 'PTBOBES001',
            nombre: 'Porta Bob Esponja',
            cantidad: 1,
            precioUnitarioClp: 7000,
            costoUnitarioClp: 998.17,
            filamento: 'multicolor',
          },
        ],
      },
      {
        id: 'ven-mel-soporte-020',
        codigo: 'I000020',
        fecha: '2026-07-31',
        cliente: 'Mel MKOF',
        clienteNombre: 'Mel',
        clienteOrigen: 'MKOF',
        descripcion: 'PED-013 · 1× Soporte celular negro · Mel MKOF',
        cantidad: 1,
        montoBruto: 4000,
        descuentoClp: 0,
        montoNeto: 4000,
        costoTotal: 683.69,
        canal: 'WhatsApp',
        notas: 'Transferido desde PED-013 · fiado cobrado · 1× Soporte celular negro · pagado $4.000',
        socioRegistro: 'Ambos',
        pedidoId: 'ped-mel-soporte-013',
        pedidoNumero: 'PED-013',
        items: [
          {
            sku: 'SOPCEL001',
            nombre: 'Soporte celular',
            cantidad: 1,
            precioUnitarioClp: 4000,
            costoUnitarioClp: 683.69,
            filamento: 'PLA+ negro',
          },
        ],
      },
    ];

    let changed = false;
    const byId = new Map(d.ventas.filter((v) => v && v.id).map((v) => [v.id, v]));
    for (const seed of SEED_VENTAS) {
      const existing = byId.get(seed.id);
      if (!existing) {
        d.ventas.push({ ...seed, items: seed.items ? seed.items.map((it) => ({ ...it })) : undefined });
        byId.set(seed.id, seed);
        changed = true;
      } else {
        if (seed.cliente && String(existing.cliente || '').trim() !== seed.cliente) {
          existing.cliente = seed.cliente;
          changed = true;
        }
        if (seed.codigo && existing.codigo !== seed.codigo) {
          existing.codigo = seed.codigo;
          changed = true;
        }
        if (Number(existing.montoNeto) !== Number(seed.montoNeto)) {
          existing.montoNeto = seed.montoNeto;
          if (seed.montoBruto != null) existing.montoBruto = seed.montoBruto;
          changed = true;
        }
        if (seed.pedidoId && existing.pedidoId !== seed.pedidoId) {
          existing.pedidoId = seed.pedidoId;
          existing.pedidoNumero = seed.pedidoNumero;
          changed = true;
        }
        if (seed.items && !Array.isArray(existing.items)) {
          existing.items = seed.items.map((it) => ({ ...it }));
          changed = true;
        }
      }
    }

    // PED-002 / PED-003 → transferido + link a venta (live que aún estaba en listo).
    const transfers = [
      {
        pedId: 'ped-rebe-plmons-001',
        numero: 'PED-001',
        ventaId: 'ven-rebe-monster-007',
        cliente: 'Rebe SIE',
        montoNeto: 7000,
        notas: '1× Porta Lata Monster · transferido a venta I000007 · $7.000',
      },
      {
        pedId: 'ped-gianni-bulldog-002',
        numero: 'PED-002',
        ventaId: 'ven-gianni-bulldog-002',
        cliente: 'Gianni SIE',
        montoNeto: 15000,
        notas: 'Macetero + 4× portacompleto bulldog · transferido a venta I000002 · $15.000',
      },
      {
        pedId: 'ped-naves-espaciales-003',
        numero: 'PED-003',
        ventaId: 'ven-juan-naves-003',
        cliente: 'Juan SIE',
        montoNeto: 15000,
        notas: '2× naves espaciales · Juan SIE · transferido a venta I000003 · $15.000',
      },
      {
        pedId: 'ped-maria-paz-soporte-005',
        numero: 'PED-005',
        ventaId: 'ven-maria-paz-soporte-011',
        cliente: 'María Paz SIE',
        montoNeto: 4000,
        notas: '1× Soporte celular morado pastel · transferido a venta I000011 · $4.000',
        transferidoEn: '2026-07-28T15:20:00.000Z',
      },
      {
        pedId: 'ped-rebe-soporte-009',
        numero: 'PED-009',
        ventaId: 'ven-rebe-soporte-012',
        cliente: 'Rebe SIE',
        montoNeto: 4000,
        notas: '1× Soporte celular negro · transferido a venta I000012 · $4.000',
        transferidoEn: '2026-07-28T15:30:00.000Z',
        itemPrecioUnitarioClp: 4000,
        itemFilamento: 'PLA+ negro',
      },
      {
        pedId: 'ped-rebe-dragon-006',
        numero: 'PED-006',
        ventaId: 'ven-rebe-dragon-013',
        cliente: 'Rebe SIE',
        montoNeto: 20000,
        notas: '1× Dragón morado · transferido a venta I000013 · $20.000',
        transferidoEn: '2026-07-28T15:30:00.000Z',
        itemPrecioUnitarioClp: 20000,
        itemFilamento: 'PLA morado',
        itemSku: 'DRAGON001',
        itemNombre: 'Dragón',
      },
      {
        pedId: 'ped-ele-pesa-rusa-004',
        numero: 'PED-004',
        ventaId: 'ven-ele-pesa-014',
        cliente: 'Ele SIE',
        montoNeto: 5000,
        notas: '2× Llavero Pesa Rusa amarillo · transferido a venta I000014 · $5.000',
        transferidoEn: '2026-07-28T15:50:00.000Z',
        itemPrecioUnitarioClp: 2500,
        itemFilamento: 'PLA amarillo',
        itemCantidad: 2,
      },
      {
        pedId: 'ped-marcia-soporte-011',
        numero: 'PED-011',
        ventaId: 'ven-marcia-soporte-015',
        cliente: 'Marcia SIE',
        montoNeto: 3000,
        notas: '1× Soporte celular morado · transferido a venta I000015 · $3.000',
        transferidoEn: '2026-07-28T21:30:00.000Z',
        itemPrecioUnitarioClp: 3000,
        itemFilamento: 'PLA morado',
        itemSku: 'SOPCEL001',
        itemNombre: 'Soporte celular',
      },
    ];
    for (const t of transfers) {
      let ped = d.pedidos.find((p) => p.id === t.pedId || p.numero === t.numero);
      // Live viejo: mismo Dragón Rebe pero id distinto / aún en_impresion $11.000
      if (!ped && t.numero === 'PED-006') {
        ped = d.pedidos.find((p) => {
          if (p.estado === 'transferido') return false;
          const cli = String(p.cliente || '');
          if (!/rebe/i.test(cli)) return false;
          return (p.items || []).some(
            (it) =>
              String(it.sku || '').toUpperCase() === 'DRAGON001' ||
              /drag[oó]n/i.test(String(it.nombre || ''))
          );
        });
      }
      if (!ped) continue;
      let pedChanged = false;
      if (ped.numero !== t.numero) {
        ped.numero = t.numero;
        pedChanged = true;
      }
      if (ped.id !== t.pedId) {
        ped.id = t.pedId;
        pedChanged = true;
      }
      if (ped.estado !== 'transferido') {
        ped.estado = 'transferido';
        pedChanged = true;
      }
      if (ped.ventaId !== t.ventaId) {
        ped.ventaId = t.ventaId;
        pedChanged = true;
      }
      if (String(ped.cliente || '') !== t.cliente) {
        ped.cliente = t.cliente;
        pedChanged = true;
      }
      if (Number(ped.montoNeto) !== t.montoNeto) {
        ped.montoBruto = t.montoNeto;
        ped.descuentoClp = 0;
        ped.descuentoPct = 0;
        ped.montoNeto = t.montoNeto;
        pedChanged = true;
      }
      if (!ped.transferidoEn) {
        ped.transferidoEn = t.transferidoEn || '2026-07-23T14:50:00.000Z';
        pedChanged = true;
      }
      if (ped.notas !== t.notas) {
        ped.notas = t.notas;
        pedChanged = true;
      }
      if (
        t.itemPrecioUnitarioClp != null ||
        t.itemFilamento ||
        t.itemCantidad != null ||
        t.itemSku ||
        t.itemNombre
      ) {
        if (!Array.isArray(ped.items) || !ped.items.length) {
          ped.items = [
            {
              sku: t.itemSku || '',
              nombre: t.itemNombre || '',
              cantidad: t.itemCantidad != null ? t.itemCantidad : 1,
              precioUnitarioClp: t.itemPrecioUnitarioClp != null ? t.itemPrecioUnitarioClp : t.montoNeto,
              costoUnitarioClp: 0,
              filamento: t.itemFilamento || '',
              estado: 'listo',
              listos: t.itemCantidad != null ? t.itemCantidad : 1,
              enImpresion: 0,
            },
          ];
          pedChanged = true;
        }
        const it = (ped.items || [])[0];
        if (it) {
          if (t.itemSku && String(it.sku || '').toUpperCase() !== String(t.itemSku).toUpperCase()) {
            it.sku = t.itemSku;
            pedChanged = true;
          }
          if (t.itemNombre && it.nombre !== t.itemNombre) {
            it.nombre = t.itemNombre;
            pedChanged = true;
          }
          if (
            t.itemPrecioUnitarioClp != null &&
            Number(it.precioUnitarioClp) !== Number(t.itemPrecioUnitarioClp)
          ) {
            it.precioUnitarioClp = t.itemPrecioUnitarioClp;
            pedChanged = true;
          }
          if (t.itemFilamento && it.filamento !== t.itemFilamento) {
            it.filamento = t.itemFilamento;
            pedChanged = true;
          }
          if (t.itemCantidad != null && Number(it.cantidad) !== Number(t.itemCantidad)) {
            it.cantidad = t.itemCantidad;
            it.listos = t.itemCantidad;
            it.enImpresion = 0;
            it.estado = 'listo';
            pedChanged = true;
          }
          if (it.estado !== 'listo' || Number(it.listos) !== Number(it.cantidad || 1) || Number(it.enImpresion) > 0) {
            it.estado = 'listo';
            it.listos = Number(it.cantidad || 1);
            it.enImpresion = 0;
            pedChanged = true;
          }
        }
      }
      if (pedChanged) changed = true;
    }
    // Secuencia correlativa I00000n
    const maxCod = (d.ventas || []).reduce((m, v) => {
      const n = Number(String(v.codigo || '').replace(/^I0*/, '') || 0);
      return Number.isFinite(n) ? Math.max(m, n) : m;
    }, 0);
    if (!d.meta || typeof d.meta !== 'object') d.meta = {};
    if (Number(d.meta.ventaSeq || 0) < maxCod) {
      d.meta.ventaSeq = maxCod;
      changed = true;
    }
    d.meta.ventaCodigoPrefijo = 'I';
    rebuildClientesHistorial(d);
    return changed;
  }

  /** Compras 29 jul 2026 — llaveros, filamento rosado, ganchos aros, mueble esquinero EASY. Sociedad 50/50 · pagó Nicolás. */
  function asegurarGastosCompras20260729(d) {
    d.gastos = Array.isArray(d.gastos) ? d.gastos : [];
    const regs = [
      {
        id: 'gas-llaveros-100-6978',
        fecha: '2026-07-29',
        categoria: 'metal',
        descripcion: 'Llaveros ×100 unidades (PAGADO)',
        proveedor: 'Insumos',
        cantidad: 100,
        montoNeto: 6978,
        notas: '100 unidades de llaveros. Sociedad 50/50 · pagó Nicolás.',
        socioRegistro: 'Ambos',
        pagadoPor: 'Nicolás',
        items: [{ descripcion: 'Llaveros ×100', monto: 6978 }],
      },
      {
        id: 'gas-filamento-rosado-10990',
        fecha: '2026-07-29',
        categoria: 'filamento',
        descripcion: 'Filamento rosado 1kg (PAGADO)',
        proveedor: 'Insumos',
        cantidad: 1,
        montoNeto: 10990,
        notas: 'Filamento PLA rosado. Sociedad 50/50 · pagó Nicolás.',
        socioRegistro: 'Ambos',
        pagadoPor: 'Nicolás',
        items: [{ descripcion: 'Filamento rosado 1kg', monto: 10990 }],
      },
      {
        id: 'gas-gancho-aros-tope-3490',
        fecha: '2026-07-29',
        categoria: 'metal',
        descripcion: 'Gancho aros con tope ×100 ud / 50 pares (PAGADO)',
        proveedor: 'Insumos',
        cantidad: 100,
        montoNeto: 3490,
        notas: '100 unidades = 50 pares de gancho aros con tope. Sociedad 50/50 · pagó Nicolás.',
        socioRegistro: 'Ambos',
        pagadoPor: 'Nicolás',
        items: [{ descripcion: 'Gancho aros con tope ×100 ud (50 pares)', monto: 3490 }],
      },
      {
        id: 'gas-mueble-esquinero-easy-35990',
        fecha: '2026-07-29',
        categoria: 'equipo',
        descripcion: 'Mueble esquinero — EASY INTERNET (PAGADO)',
        proveedor: 'EASY INTERNET',
        cantidad: 1,
        montoNeto: 35990,
        notas:
          'Compra TC ****7022 · Nicolás Romero · 29/07/2026 00:28. Mueble esquinero para Impresoreando. Sociedad 50/50 · pagó Nicolás.',
        socioRegistro: 'Ambos',
        pagadoPor: 'Nicolás',
        items: [{ descripcion: 'Mueble esquinero EASY', monto: 35990 }],
      },
    ];
    let changed = false;
    const byId = new Map(d.gastos.map((g) => [g.id, g]));
    for (const reg of regs) {
      const existing = byId.get(reg.id);
      if (!existing) {
        d.gastos.push({ ...reg });
        changed = true;
      } else if (Number(existing.montoNeto) !== reg.montoNeto || existing.descripcion !== reg.descripcion) {
        Object.assign(existing, reg);
        changed = true;
      }
    }
    d.bitacora = Array.isArray(d.bitacora) ? d.bitacora : [];
    const bitGastoEasy = {
      id: 'bit-gasto-mueble-esquinero-2026-07-29',
      fecha: '2026-07-29',
      texto:
        'Gasto: mueble esquinero EASY INTERNET $35.990 (TC ****7022). Pagó Nicolás · sociedad 50/50.',
    };
    if (!d.bitacora.some((b) => b.id === bitGastoEasy.id)) {
      d.bitacora.unshift(bitGastoEasy);
      changed = true;
    }
    if (!d.bitacora.some((b) => b.id === 'bit-gastos-2026-07-29')) {
      d.bitacora.unshift({
        id: 'bit-gastos-2026-07-29',
        fecha: '2026-07-29',
        texto:
          'Gastos: llaveros ×100 $6.978 · filamento rosado $10.990 · gancho aros con tope ×100/50 pares $3.490 · mueble esquinero EASY $35.990. Pagó Nicolás · sociedad 50/50.',
      });
      changed = true;
    } else {
      const bit = d.bitacora.find((b) => b.id === 'bit-gastos-2026-07-29');
      if (bit && !String(bit.texto || '').includes('mueble esquinero')) {
        bit.texto =
          'Gastos: llaveros ×100 $6.978 · filamento rosado $10.990 · gancho aros con tope ×100/50 pares $3.490 · mueble esquinero EASY $35.990. Pagó Nicolás · sociedad 50/50.';
        changed = true;
      }
    }
    return changed;
  }

  /** Mercado Libre — bolsas kraft + enchufe inteligente + tira LED RGB. Sociedad 50/50 · pagó Nicolás. */
  function asegurarGastoMlBolsasEnchufeLed20260731(d) {
    d.gastos = Array.isArray(d.gastos) ? d.gastos : [];
    const reg = {
      id: 'gas-ml-bolsas-enchufe-led-32569',
      fecha: '2026-07-31',
      categoria: 'equipo',
      descripcion:
        'Mercado Libre — bolsas kraft ×100 + enchufe inteligente WiFi + tira LED RGB 20 m (PAGADO)',
      proveedor: 'Mercado Libre',
      cantidad: 3,
      montoNeto: 32569,
      notas:
        'Envío 1: bolsas kraft heladería/panadería pack 100 $4.590 · enchufe inteligente medidor consumo WiFi 16A Alexa $9.989 · tira LED RGB Bluetooth Maxwell 20 m $17.990. Total $32.569. Sociedad 50/50 · pagó Nicolás.',
      ordenId: 'ml-bolsas-enchufe-led-32569',
      socioRegistro: 'Ambos',
      pagadoPor: 'Nicolás',
      items: [
        {
          descripcion: 'Bolsa papel kraft heladería/panadería pack 100 ud marrón claro',
          monto: 4590,
        },
        {
          descripcion: 'Enchufe inteligente medidor de consumo WiFi 16A Alexa',
          monto: 9989,
        },
        {
          descripcion: 'Tira cinta luces LED RGB Bluetooth Maxwell 20 m',
          monto: 17990,
        },
      ],
    };
    let changed = false;
    const existing = d.gastos.find((g) => g.id === reg.id);
    if (!existing) {
      d.gastos.push({ ...reg });
      changed = true;
    } else if (
      Number(existing.montoNeto) !== reg.montoNeto ||
      existing.descripcion !== reg.descripcion ||
      !Array.isArray(existing.items)
    ) {
      Object.assign(existing, reg);
      changed = true;
    }
    d.bitacora = Array.isArray(d.bitacora) ? d.bitacora : [];
    const bit = {
      id: 'bit-gasto-ml-bolsas-enchufe-led-2026-07-31',
      fecha: '2026-07-31',
      texto:
        'Gasto ML: bolsas kraft ×100 $4.590 · enchufe WiFi 16A $9.989 · tira LED RGB 20 m $17.990. Total $32.569. Pagó Nicolás · sociedad 50/50.',
    };
    if (!d.bitacora.some((b) => b.id === bit.id)) {
      d.bitacora.unshift(bit);
      changed = true;
    }
    return changed;
  }

  /** Entrada evento 3D 29-ago · pagó Josefa $16.100 · cuenta como capital aportado. */
  function asegurarGastoEntradaEvento3d16100(d) {
    d.gastos = Array.isArray(d.gastos) ? d.gastos : [];
    const reg = {
      id: 'gas-entrada-evento-3d-16100',
      fecha: '2026-08-29',
      categoria: 'marketing',
      descripcion: '1 entrada a evento 3D (29 agosto)',
      proveedor: 'Evento 3D',
      cantidad: 1,
      montoNeto: 16100,
      notas: '1 entrada evento 3D el 29 de agosto 2026. Sociedad 50/50 · pagó Josefa.',
      socioRegistro: 'Ambos',
      pagadoPor: 'Josefa',
      items: [{ descripcion: 'Entrada evento 3D', monto: 16100 }],
    };
    let changed = false;
    const existing = d.gastos.find((g) => g.id === reg.id);
    if (!existing) {
      d.gastos.push({ ...reg });
      changed = true;
    } else if (
      Number(existing.montoNeto) !== reg.montoNeto ||
      String(existing.pagadoPor || '') !== 'Josefa'
    ) {
      Object.assign(existing, reg);
      changed = true;
    }
    return changed;
  }

  /** Diseños Cults / digitales — gastos socios (no entran al costo de producto). Pagó Nicolás · 50/50. */
  function asegurarGastosDisenosCults(d) {
    d.gastos = Array.isArray(d.gastos) ? d.gastos : [];
    const regs = [
      {
        id: 'gas-diseno-porta-bob-esponja',
        fecha: '2026-07-19',
        categoria: 'diseño',
        descripcion: 'Cults3D — Bob esponja porta esponja (diseño)',
        proveedor: 'Cults3D',
        cantidad: 1,
        montoNeto: 1402,
        notas: 'Diseño digital. No se suma al costo unitario del producto. Pagó Nicolás · sociedad 50/50.',
        socioRegistro: 'Nicolás',
        items: [{ descripcion: 'Bob esponja porta esponja — SpongeBob SquarePants — Sponge Holder', monto: 1402 }],
      },
      {
        id: 'gas-diseno-porta-bulldog',
        fecha: '2026-07-19',
        categoria: 'diseño',
        descripcion: 'Diseño Porta completo bulldog',
        proveedor: 'Diseño digital',
        cantidad: 1,
        montoNeto: 1000,
        notas: 'Diseño digital. No se suma al costo unitario. Pagó Nicolás · sociedad 50/50.',
        socioRegistro: 'Nicolás',
        items: [{ descripcion: 'Porta completo bulldog (diseño)', monto: 1000 }],
      },
      {
        id: 'gas-diseno-nave-espacial-horizontal',
        fecha: '2026-07-19',
        categoria: 'diseño',
        descripcion: 'Diseño Nave espacial horizontal',
        proveedor: 'Diseño digital',
        cantidad: 1,
        montoNeto: 1000,
        notas: 'Diseño digital. No se suma al costo unitario. Pagó Nicolás · sociedad 50/50.',
        socioRegistro: 'Nicolás',
        items: [{ descripcion: 'Nave espacial horizontal (diseño)', monto: 1000 }],
      },
      {
        id: 'gas-diseno-dragon',
        fecha: '2026-07-26',
        categoria: 'diseño',
        descripcion: 'Diseño Dragón (comprado)',
        proveedor: 'Diseño digital',
        cantidad: 1,
        montoNeto: 3000,
        notas:
          'Diseño digital del Dragón (DRAGON001). No se suma al costo unitario del producto. Gastos socios · sociedad 50/50.',
        socioRegistro: 'Ambos',
        pagadoPor: 'Nicolás',
        items: [{ descripcion: 'Diseño Dragón', monto: 3000 }],
      },
      {
        id: 'gas-diseno-alcancia-chanchito',
        fecha: '2026-07-31',
        categoria: 'diseño',
        descripcion: 'Diseño Alcancía chanchito (comprado)',
        proveedor: 'Diseño digital',
        cantidad: 1,
        montoNeto: 13000,
        notas:
          'Diseño digital de la Alcancía chanchito (ALCHAN001). No se suma al costo unitario del producto. Gastos socios · sociedad 50/50 · pagó Nicolás.',
        socioRegistro: 'Ambos',
        pagadoPor: 'Nicolás',
        items: [{ descripcion: 'Diseño Alcancía chanchito', monto: 13000 }],
      },
    ];
    let changed = false;
    const byId = new Map(d.gastos.map((g) => [g.id, g]));
    for (const reg of regs) {
      const existing = byId.get(reg.id);
      if (!existing) {
        d.gastos.push({ ...reg });
        changed = true;
      } else if (Number(existing.montoNeto) !== reg.montoNeto) {
        Object.assign(existing, reg);
        changed = true;
      }
    }
    d.bitacora = Array.isArray(d.bitacora) ? d.bitacora : [];
    const bitDisenoChanchito = {
      id: 'bit-gasto-diseno-alcancia-chanchito-2026-07-31',
      fecha: '2026-07-31',
      texto:
        'Gasto diseño: Alcancía chanchito $13.000 (ALCHAN001). No va al costo/u. Pagó Nicolás · sociedad 50/50.',
    };
    if (!d.bitacora.some((b) => b.id === bitDisenoChanchito.id)) {
      d.bitacora.unshift(bitDisenoChanchito);
      changed = true;
    }
    return changed;
  }

  /** PED-002 → listo (ya impresos) · PED-003 naves horizontal+vertical. */
  function asegurarPedidosImpresosYNaves(d) {
    d.pedidos = Array.isArray(d.pedidos) ? d.pedidos : [];
    d.meta = d.meta || {};
    let changed = false;

    const ped002 = d.pedidos.find((p) => p.numero === 'PED-002' || p.id === 'ped-gianni-bulldog-002');
    if (ped002 && ped002.estado !== 'listo' && ped002.estado !== 'transferido') {
      ped002.estado = 'listo';
      ped002.notas = 'Macetero + 4× portacompleto bulldog · PLA+ negro · impresos / listos';
      for (const it of ped002.items || []) {
        it.estado = 'listo';
        it.listos = Number(it.cantidad || 0);
        it.enImpresion = 0;
      }
      changed = true;
    }

    const id003 = 'ped-naves-espaciales-003';
    if (!d.pedidos.some((p) => p.id === id003 || p.numero === 'PED-003')) {
      const prodH = (d.productos || []).find((p) => p.id === 'prod-nave-espacial-horizontal');
      const prodV = (d.productos || []).find((p) => p.id === 'prod-nave-espacial-vertical');
      const costoH = prodH ? costoProdRough(d, prodH) : 647.55;
      const costoV = prodV ? costoProdRough(d, prodV) : 915.14;
      d.pedidos.push({
        id: id003,
        numero: 'PED-003',
        fecha: '2026-07-19',
        cliente: 'Juan',
        canal: 'WhatsApp',
        items: [
          {
            sku: 'NAVEHOR001',
            nombre: 'Nave Espacial Horizontal',
            cantidad: 1,
            precioUnitarioClp: 7500,
            costoUnitarioClp: round2(costoH),
            filamento: 'PLA blanco',
            estado: 'listo',
            listos: 1,
            enImpresion: 0,
          },
          {
            sku: 'NAVEVERT001',
            nombre: 'Nave Espacial Vertical',
            cantidad: 1,
            precioUnitarioClp: 7500,
            costoUnitarioClp: round2(costoV),
            filamento: 'PLA blanco',
            estado: 'listo',
            listos: 1,
            enImpresion: 0,
          },
        ],
        montoBruto: 15000,
        descuentoClp: 0,
        descuentoPct: 0,
        montoNeto: 15000,
        estado: 'transferido',
        ventaId: 'ven-juan-naves-003',
        transferidoEn: '2026-07-23T14:50:00.000Z',
        notas: '2× naves espaciales · Juan · transferido a venta $15.000',
        socioRegistro: 'Ambos',
        creado: '2026-07-19T19:40:00.000Z',
        costoTotal: round2(costoH + costoV),
      });
      changed = true;
    }

    // PED-004 · Ele SIE · 2× Llavero Pesa Rusa amarillo · transferido I000014 $5.000 (pagado)
    const id004 = 'ped-ele-pesa-rusa-004';
    const prodPesa = (d.productos || []).find(
      (p) => p.id === 'prod-llavero-pesa-rusa' || p.sku === 'LLPESRU001'
    );
    const costoPesa = prodPesa ? costoProdRough(d, prodPesa) : 415.43;
    const cant004 = 2;
    const precioU004 = 2500;
    const total004 = 5000;
    if (!d.pedidos.some((p) => p.id === id004 || p.numero === 'PED-004')) {
      d.pedidos.push({
        id: id004,
        numero: 'PED-004',
        fecha: '2026-07-26',
        cliente: 'Ele SIE',
        clienteNombre: 'Ele',
        clienteOrigen: 'SIE',
        canal: 'WhatsApp',
        items: [
          {
            sku: 'LLPESRU001',
            nombre: 'Llavero Pesa Rusa',
            cantidad: cant004,
            precioUnitarioClp: precioU004,
            costoUnitarioClp: round2(costoPesa),
            filamento: 'PLA amarillo',
            estado: 'listo',
            listos: cant004,
            enImpresion: 0,
          },
        ],
        montoBruto: total004,
        descuentoClp: 0,
        montoNeto: total004,
        costoTotal: round2(costoPesa * cant004),
        estado: 'transferido',
        ventaId: 'ven-ele-pesa-014',
        transferidoEn: '2026-07-28T15:50:00.000Z',
        notas: `2× Llavero Pesa Rusa amarillo · transferido a venta I000014 · $${total004}`,
        socioRegistro: 'Ambos',
        creado: '2026-07-26T01:40:00.000Z',
      });
      changed = true;
    }
    // Quitar solo el id viejo ped-ele-pesa-012 (Ele → PED-004 / I000014).
    // No borrar por número PED-012: vigente = Marcia limpia brochas.
    const before012 = (d.pedidos || []).length;
    d.pedidos = (d.pedidos || []).filter((p) => p && p.id !== 'ped-ele-pesa-012');
    if (d.pedidos.length !== before012) changed = true;

    // PED-005 · María Paz SIE · Soporte celular morado pastel · transferido I000011 $4.000 (pagado)
    const id005 = 'ped-maria-paz-soporte-005';
    const prodSop = (d.productos || []).find(
      (p) => p.id === 'prod-soporte-celular' || p.sku === 'SOPCEL001'
    );
    const costoSop = prodSop ? costoProdRough(d, prodSop) : 683.69;
    const precioSop = 4000;
    if (!d.pedidos.some((p) => p.id === id005 || p.numero === 'PED-005')) {
      d.pedidos.push({
        id: id005,
        numero: 'PED-005',
        fecha: '2026-07-26',
        cliente: 'María Paz SIE',
        clienteNombre: 'María',
        clienteSegundoNombre: 'Paz',
        clienteOrigen: 'SIE',
        canal: 'WhatsApp',
        items: [
          {
            sku: 'SOPCEL001',
            nombre: 'Soporte celular',
            cantidad: 1,
            precioUnitarioClp: precioSop,
            costoUnitarioClp: round2(costoSop),
            filamento: 'PLA morado pastel',
            estado: 'listo',
            listos: 1,
            enImpresion: 0,
          },
        ],
        montoBruto: precioSop,
        descuentoClp: 0,
        montoNeto: precioSop,
        costoTotal: round2(costoSop),
        estado: 'transferido',
        ventaId: 'ven-maria-paz-soporte-011',
        transferidoEn: '2026-07-28T15:20:00.000Z',
        notas: `1× Soporte celular morado pastel · transferido a venta I000011 · $${precioSop}`,
        socioRegistro: 'Ambos',
        creado: '2026-07-26T01:43:00.000Z',
      });
      changed = true;
    }

    // PED-006 · Rebe SIE · Dragón morado · transferido I000013 $20.000
    const id006 = 'ped-rebe-dragon-006';
    const prodDra = (d.productos || []).find((p) => p.id === 'prod-dragon' || p.sku === 'DRAGON001');
    const costoDra = prodDra ? costoProdRough(d, prodDra) : 5475.59;
    const precioDra = 20000;
    if (!d.pedidos.some((p) => p.id === id006 || p.numero === 'PED-006')) {
      d.pedidos.push({
        id: id006,
        numero: 'PED-006',
        fecha: '2026-07-26',
        cliente: 'Rebe SIE',
        clienteNombre: 'Rebe',
        clienteOrigen: 'SIE',
        canal: 'WhatsApp',
        items: [
          {
            sku: 'DRAGON001',
            nombre: 'Dragón',
            cantidad: 1,
            precioUnitarioClp: precioDra,
            costoUnitarioClp: round2(costoDra),
            filamento: 'PLA morado',
            estado: 'listo',
            listos: 1,
            enImpresion: 0,
          },
        ],
        montoBruto: precioDra,
        descuentoClp: 0,
        montoNeto: precioDra,
        costoTotal: round2(costoDra),
        estado: 'transferido',
        ventaId: 'ven-rebe-dragon-013',
        transferidoEn: '2026-07-28T15:30:00.000Z',
        notas: `1× Dragón morado · transferido a venta I000013 · $${precioDra}`,
        socioRegistro: 'Ambos',
        creado: '2026-07-26T01:49:00.000Z',
      });
      changed = true;
    }

    // PED-007 · Juan SIE · Torreón · anulado (forzar siempre salvo ya transferido)
    const id007 = 'ped-juan-torreon-007';
    const prodTorre = (d.productos || []).find((p) => p.id === 'prod-torreon' || p.sku === 'TORREON001');
    const costoTorre = prodTorre ? costoProdRough(d, prodTorre) : 3293.48;
    const precioTorre =
      Number(prodTorre?.precioVentaSugeridoClp) > 0 ? Number(prodTorre.precioVentaSugeridoClp) : 6500;
    const notas007 = `1× Torreón · ANULADO · costo estimado $${round2(costoTorre)} · PVP sugerido $${precioTorre}`;
    const ped007 = d.pedidos.find((p) => p.id === id007 || p.numero === 'PED-007');
    if (!ped007) {
      d.pedidos.push({
        id: id007,
        numero: 'PED-007',
        fecha: '2026-07-26',
        cliente: 'Juan SIE',
        clienteNombre: 'Juan',
        clienteOrigen: 'SIE',
        canal: 'WhatsApp',
        items: [
          {
            sku: 'TORREON001',
            nombre: 'Torreón',
            cantidad: 1,
            precioUnitarioClp: precioTorre,
            costoUnitarioClp: round2(costoTorre),
            filamento: 'PLA color',
            estado: 'anulado',
            listos: 1,
            enImpresion: 0,
          },
        ],
        montoBruto: precioTorre,
        descuentoClp: 0,
        montoNeto: precioTorre,
        costoTotal: round2(costoTorre),
        estado: 'anulado',
        ventaId: null,
        anuladoEn: '2026-07-31T20:30:00.000Z',
        notas: notas007,
        socioRegistro: 'Ambos',
        creado: '2026-07-26T02:00:00.000Z',
      });
      changed = true;
    } else if (ped007.estado !== 'transferido') {
      let touch007 = false;
      if (ped007.estado !== 'anulado') {
        ped007.estado = 'anulado';
        touch007 = true;
      }
      if (ped007.ventaId) {
        ped007.ventaId = null;
        touch007 = true;
      }
      if (!ped007.anuladoEn) {
        ped007.anuladoEn = '2026-07-31T20:30:00.000Z';
        touch007 = true;
      }
      if (ped007.notas !== notas007) {
        ped007.notas = notas007;
        touch007 = true;
      }
      if (Array.isArray(ped007.items)) {
        for (const it of ped007.items) {
          if (it.estado !== 'anulado') {
            it.estado = 'anulado';
            touch007 = true;
          }
          if (it.filamento !== 'PLA color') {
            it.filamento = 'PLA color';
            touch007 = true;
          }
        }
      }
      if (touch007) changed = true;
    }

    // PED-008 · Juan MKOF · Porta Bob Esponja · transferido I000019 $7.000 (era fiado, pagó)
    const id008 = 'ped-juan-bob-008';
    const prodBob = (d.productos || []).find(
      (p) => p.id === 'prod-porta-bob-esponja' || p.sku === 'PTBOBES001'
    );
    const costoBob = prodBob ? costoProdRough(d, prodBob) : 998.17;
    const precioBob = 7000;
    const ped008 = d.pedidos.find((p) => p.id === id008 || p.numero === 'PED-008');
    const notas008 = `1× Porta Bob Esponja · transferido a venta I000019 · pagado $${precioBob} · MKOF (Josefa)`;
    if (!ped008) {
      d.pedidos.push({
        id: id008,
        numero: 'PED-008',
        fecha: '2026-07-26',
        cliente: 'Juan MKOF',
        clienteNombre: 'Juan',
        clienteOrigen: 'MKOF',
        canal: 'WhatsApp',
        items: [
          {
            sku: 'PTBOBES001',
            nombre: 'Porta Bob Esponja',
            cantidad: 1,
            precioUnitarioClp: precioBob,
            costoUnitarioClp: round2(costoBob),
            filamento: 'multicolor',
            estado: 'listo',
            listos: 1,
            enImpresion: 0,
          },
        ],
        montoBruto: precioBob,
        descuentoClp: 0,
        montoNeto: precioBob,
        costoTotal: round2(costoBob),
        estado: 'transferido',
        fiado: false,
        ventaId: 'ven-juan-bob-019',
        transferidoEn: '2026-07-31T22:20:00.000Z',
        notas: notas008,
        socioRegistro: 'Ambos',
        creado: '2026-07-26T02:00:00.000Z',
      });
      changed = true;
    } else if (ped008.estado !== 'transferido') {
      ped008.estado = 'transferido';
      ped008.fiado = false;
      delete ped008.fechaPagoEsperada;
      ped008.ventaId = 'ven-juan-bob-019';
      ped008.transferidoEn = ped008.transferidoEn || '2026-07-31T22:20:00.000Z';
      ped008.montoNeto = precioBob;
      ped008.montoBruto = precioBob;
      ped008.notas = notas008;
      changed = true;
    }
    // Asegurar venta I000019
    d.ventas = Array.isArray(d.ventas) ? d.ventas : [];
    if (!d.ventas.some((v) => v.id === 'ven-juan-bob-019' || v.codigo === 'I000019')) {
      d.ventas.push({
        id: 'ven-juan-bob-019',
        codigo: 'I000019',
        fecha: '2026-07-31',
        cliente: 'Juan MKOF',
        clienteNombre: 'Juan',
        clienteOrigen: 'MKOF',
        descripcion: 'PED-008 · 1× Porta Bob Esponja · Juan MKOF',
        cantidad: 1,
        montoBruto: precioBob,
        descuentoClp: 0,
        montoNeto: precioBob,
        costoTotal: round2(costoBob),
        canal: 'WhatsApp',
        notas: 'Transferido desde PED-008 · fiado cobrado · 1× Porta Bob Esponja · pagado $7.000',
        socioRegistro: 'Ambos',
        pedidoId: id008,
        pedidoNumero: 'PED-008',
        items: [
          {
            sku: 'PTBOBES001',
            nombre: 'Porta Bob Esponja',
            cantidad: 1,
            precioUnitarioClp: precioBob,
            costoUnitarioClp: round2(costoBob),
            filamento: 'multicolor',
          },
        ],
      });
      changed = true;
    }

    // PED-009 · Rebe SIE · Soporte celular negro · transferido I000012 $4.000
    const id009 = 'ped-rebe-soporte-009';
    const prodSop009 = (d.productos || []).find(
      (p) => p.id === 'prod-soporte-celular' || p.sku === 'SOPCEL001'
    );
    const costoSop009 = prodSop009 ? costoProdRough(d, prodSop009) : 683.69;
    const precioSop009 = 4000;
    if (!d.pedidos.some((p) => p.id === id009 || p.numero === 'PED-009')) {
      d.pedidos.push({
        id: id009,
        numero: 'PED-009',
        fecha: '2026-07-28',
        cliente: 'Rebe SIE',
        clienteNombre: 'Rebe',
        clienteOrigen: 'SIE',
        canal: 'WhatsApp',
        items: [
          {
            sku: 'SOPCEL001',
            nombre: 'Soporte celular',
            cantidad: 1,
            precioUnitarioClp: precioSop009,
            costoUnitarioClp: round2(costoSop009),
            filamento: 'PLA+ negro',
            estado: 'listo',
            listos: 1,
            enImpresion: 0,
          },
        ],
        montoBruto: precioSop009,
        descuentoClp: 0,
        montoNeto: precioSop009,
        costoTotal: round2(costoSop009),
        estado: 'transferido',
        ventaId: 'ven-rebe-soporte-012',
        transferidoEn: '2026-07-28T15:30:00.000Z',
        notas: `1× Soporte celular negro · transferido a venta I000012 · $${precioSop009}`,
        socioRegistro: 'Ambos',
        creado: '2026-07-28T15:30:00.000Z',
      });
      changed = true;
    }

    // PED-010 · Gianni SIE · 2× Soporte celular negro · fiado (paga 18 ago) · $8.000
    const id010 = 'ped-gianni-soporte-010';
    const prodSop010 = (d.productos || []).find(
      (p) => p.id === 'prod-soporte-celular' || p.sku === 'SOPCEL001'
    );
    const costoSop010 = prodSop010 ? costoProdRough(d, prodSop010) : 683.69;
    const precioSop010 = 4000;
    const cant010 = 2;
    if (!d.pedidos.some((p) => p.id === id010 || p.numero === 'PED-010')) {
      d.pedidos.push({
        id: id010,
        numero: 'PED-010',
        fecha: '2026-07-28',
        cliente: 'Gianni SIE',
        clienteNombre: 'Gianni',
        clienteOrigen: 'SIE',
        canal: 'WhatsApp',
        items: [
          {
            sku: 'SOPCEL001',
            nombre: 'Soporte celular',
            cantidad: cant010,
            precioUnitarioClp: precioSop010,
            costoUnitarioClp: round2(costoSop010),
            filamento: 'PLA+ negro',
            estado: 'pendiente',
            listos: 0,
            enImpresion: 0,
          },
        ],
        montoBruto: precioSop010 * cant010,
        descuentoClp: 0,
        montoNeto: precioSop010 * cant010,
        costoTotal: round2(costoSop010 * cant010),
        estado: 'pendiente',
        ventaId: null,
        fiado: true,
        fechaPagoEsperada: '2026-08-18',
        pagoNotas: 'Paga el 18 de agosto',
        notas: `2× Soporte celular negro · fiado · paga 2026-08-18 · PVP $${precioSop010}/u · total $${precioSop010 * cant010}`,
        socioRegistro: 'Ambos',
        creado: '2026-07-28T15:40:00.000Z',
      });
      changed = true;
    }

    // PED-011 · Marcia SIE · 1× Soporte celular morado · transferido I000015 $3.000 (pagado)
    const id011 = 'ped-marcia-soporte-011';
    const prodSop011 = (d.productos || []).find(
      (p) => p.id === 'prod-soporte-celular' || p.sku === 'SOPCEL001'
    );
    const costoSop011 = prodSop011 ? costoProdRough(d, prodSop011) : 683.69;
    const precioSop011 = 3000;
    if (!d.pedidos.some((p) => p.id === id011 || p.numero === 'PED-011')) {
      d.pedidos.push({
        id: id011,
        numero: 'PED-011',
        fecha: '2026-07-28',
        cliente: 'Marcia SIE',
        clienteNombre: 'Marcia',
        clienteOrigen: 'SIE',
        canal: 'WhatsApp',
        items: [
          {
            sku: 'SOPCEL001',
            nombre: 'Soporte celular',
            cantidad: 1,
            precioUnitarioClp: precioSop011,
            costoUnitarioClp: round2(costoSop011),
            filamento: 'PLA morado',
            estado: 'listo',
            listos: 1,
            enImpresion: 0,
          },
        ],
        montoBruto: precioSop011,
        descuentoClp: 0,
        montoNeto: precioSop011,
        costoTotal: round2(costoSop011),
        estado: 'transferido',
        ventaId: 'ven-marcia-soporte-015',
        transferidoEn: '2026-07-28T21:30:00.000Z',
        notas: `1× Soporte celular morado · transferido a venta I000015 · $${precioSop011}`,
        socioRegistro: 'Ambos',
        creado: '2026-07-28T15:45:00.000Z',
      });
      changed = true;
    }

    // PED-012 · Marcia SIE · 1× Limpiador de brochas morado pastel · fiado · $7.000
    const id012 = 'ped-marcia-limpiador-012';
    const prodLb012 = (d.productos || []).find(
      (p) => p.id === 'prod-limpiador-brochas' || p.sku === 'LMBROC001'
    );
    const costoLb012 = prodLb012 ? costoProdRough(d, prodLb012) : 2163.67;
    const precioLb012 = 7000;
    if (!d.pedidos.some((p) => p.id === id012 || p.numero === 'PED-012')) {
      d.pedidos.push({
        id: id012,
        numero: 'PED-012',
        fecha: '2026-07-31',
        cliente: 'Marcia SIE',
        clienteNombre: 'Marcia',
        clienteOrigen: 'SIE',
        canal: 'WhatsApp',
        items: [
          {
            sku: 'LMBROC001',
            nombre: 'Limpiador de brochas',
            cantidad: 1,
            precioUnitarioClp: precioLb012,
            costoUnitarioClp: round2(costoLb012),
            filamento: 'PLA morado pastel',
            estado: 'pendiente',
            listos: 0,
            enImpresion: 0,
          },
        ],
        montoBruto: precioLb012,
        descuentoClp: 0,
        montoNeto: precioLb012,
        costoTotal: round2(costoLb012),
        estado: 'pendiente',
        ventaId: null,
        fiado: true,
        pagoNotas: 'Fiado · fecha de pago por confirmar',
        notas: `1× Limpiador de brochas morado pastel · fiado · PVP $${precioLb012} · fecha de pago por confirmar`,
        socioRegistro: 'Ambos',
        creado: '2026-07-31T00:30:00.000Z',
      });
      changed = true;
    }

    // PED-013 · Mel MKOF · SIEMPRE venta I000020 $4.000 (pagó; no dejar fiado en live viejo)
    const id013 = 'ped-mel-soporte-013';
    const prodSop013 = (d.productos || []).find(
      (p) => p.id === 'prod-soporte-celular' || p.sku === 'SOPCEL001'
    );
    const costoSop013 = prodSop013 ? costoProdRough(d, prodSop013) : 683.69;
    const precioSop013 = 4000;
    let ped013 = d.pedidos.find((p) => p.id === id013 || p.numero === 'PED-013');
    const notas013 = `1× Soporte celular negro · transferido a venta I000020 · pagado $${precioSop013} · MKOF (Josefa)`;
    if (!ped013) {
      ped013 = {
        id: id013,
        numero: 'PED-013',
        fecha: '2026-07-31',
        cliente: 'Mel MKOF',
        clienteNombre: 'Mel',
        clienteOrigen: 'MKOF',
        canal: 'WhatsApp',
        items: [
          {
            sku: 'SOPCEL001',
            nombre: 'Soporte celular',
            cantidad: 1,
            precioUnitarioClp: precioSop013,
            costoUnitarioClp: round2(costoSop013),
            filamento: 'PLA+ negro',
            estado: 'listo',
            listos: 1,
            enImpresion: 0,
          },
        ],
        montoBruto: precioSop013,
        descuentoClp: 0,
        montoNeto: precioSop013,
        costoTotal: round2(costoSop013),
        socioRegistro: 'Ambos',
        creado: '2026-07-31T00:30:00.000Z',
      };
      d.pedidos.push(ped013);
      changed = true;
    }
    if (
      ped013.estado !== 'transferido' ||
      ped013.fiado ||
      ped013.ventaId !== 'ven-mel-soporte-020'
    ) {
      ped013.estado = 'transferido';
      ped013.fiado = false;
      delete ped013.fechaPagoEsperada;
      ped013.ventaId = 'ven-mel-soporte-020';
      ped013.transferidoEn = ped013.transferidoEn || '2026-07-31T23:00:00.000Z';
      ped013.montoNeto = precioSop013;
      ped013.montoBruto = precioSop013;
      ped013.notas = notas013;
      ped013.pagoNotas = 'Pagado · transferido a venta I000020';
      ped013.cliente = 'Mel MKOF';
      ped013.clienteOrigen = 'MKOF';
      changed = true;
    }
    d.ventas = Array.isArray(d.ventas) ? d.ventas : [];
    const viMel = d.ventas.findIndex(
      (v) => v && (v.id === 'ven-mel-soporte-020' || v.codigo === 'I000020')
    );
    const ventaMel = {
      id: 'ven-mel-soporte-020',
      codigo: 'I000020',
      fecha: '2026-07-31',
      cliente: 'Mel MKOF',
      clienteNombre: 'Mel',
      clienteOrigen: 'MKOF',
      descripcion: 'PED-013 · 1× Soporte celular negro · Mel MKOF',
      cantidad: 1,
      montoBruto: precioSop013,
      descuentoClp: 0,
      montoNeto: precioSop013,
      costoTotal: round2(costoSop013),
      canal: 'WhatsApp',
      notas: 'Transferido desde PED-013 · fiado cobrado · 1× Soporte celular negro · pagado $4.000',
      socioRegistro: 'Ambos',
      pedidoId: id013,
      pedidoNumero: 'PED-013',
      items: [
        {
          sku: 'SOPCEL001',
          nombre: 'Soporte celular',
          cantidad: 1,
          precioUnitarioClp: precioSop013,
          costoUnitarioClp: round2(costoSop013),
          filamento: 'PLA+ negro',
        },
      ],
    };
    if (viMel < 0) {
      d.ventas.push(ventaMel);
      changed = true;
    } else if (
      d.ventas[viMel].codigo !== 'I000020' ||
      Number(d.ventas[viMel].montoNeto) !== precioSop013
    ) {
      d.ventas[viMel] = { ...d.ventas[viMel], ...ventaMel };
      changed = true;
    }

    const maxNum = d.pedidos.reduce((m, p) => {
      const n = Number(String(p.numero || '').replace(/\D/g, '')) || 0;
      return Math.max(m, n);
    }, 0);
    if (Number(d.meta.pedidoSeq || 0) < maxNum) {
      d.meta.pedidoSeq = maxNum;
      changed = true;
    }
    return changed;
  }

  /** Macetero perro bulldog — slicer: 96,95 g · 3 h 21 m · PLA+ negro. */
  function asegurarProductoMaceteroPerroBulldog(d) {
    const changed = upsertProductoSeed(d, 'prod-macetero-perro-bulldog', {
      sku: 'MCPEBUL001',
      nombre: 'Macetero Perro Bulldog',
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

  /** Portacompleto perro bulldog — slicer 1 ud: 64,58 g · 2 h 13 m · PLA+ negro (costo alto). */
  function seedPortacompletoPerroBulldog() {
    return {
      sku: 'PCPEBUL001',
      nombre: 'Porta Completo Perro Bulldog',
      activo: true,
      filamentoModeloGramos: 59.85,
      filamentoSoportesGramos: 4.26,
      filamentoPurgeGramos: 0.47,
      filamentoMetros: 21.48,
      filamentoGramos: 64.58,
      costoFilamentoKgClp: COSTO_PLA_NEGRO_KG,
      horasImpresion: 2.22, // 2 h 13 m
      minutosPintado: 0,
      unidadesMetal: 0,
      unidadesBolsa: 1,
      precioVentaSugeridoClp: 0,
      costoSlicerRef: 1.29,
      notas:
        'Slicer 1 ud: modelo 59,85 g + soportes 4,26 g + purge 0,47 g = 64,58 g · 21,48 m · 2 h 13 m · coste slicer 1,29 (ref). PLA+ negro $17.986/kg. Sin pintado (editable). Se eligió frente al cálculo anterior (61,35 g / 2 h 1 m) por mayor costo.',
    };
  }

  function costoProdRough(d, prod) {
    const p = d.parametros || {};
    const imps = Array.isArray(d.impresoras) ? d.impresoras : IMPRESORAS_SEED;
    const imp =
      imps.find((x) => x.id === prod.impresoraId) ||
      imps.find((x) => x.activaDefault) ||
      imps[0] ||
      {};
    const g = Number(prod.filamentoGramos || 0);
    let kg = Number(prod.costoFilamentoKgClp || 0);
    if (!(kg > 0) && Number(imp.costoFilamentoDefaultKgClp) > 0) {
      kg = Number(imp.costoFilamentoDefaultKgClp);
    }
    const fil = (g / 1000) * kg;
    const tarifa = Number(imp.tarifaKwhClp > 0 ? imp.tarifaKwhClp : p.tarifaKwhClp || 0);
    const consumo = Number(
      imp.consumoImpresoraKw > 0 ? imp.consumoImpresoraKw : p.consumoImpresoraKw || 0
    );
    const luz = Number(prod.horasImpresion || 0) * tarifa * consumo;
    const bolsa = Number(prod.unidadesBolsa || 0) * Number(p.costoBolsaEntregaClp || 50);
    const metal = Number(prod.unidadesMetal || 0) * Number(p.costoAnilloMetalLlaveroClp || 0);
    const recargoProd = Number(prod.recargoImpresoraAntiguaClp || 0);
    const recargo = recargoProd > 0 ? recargoProd : Number(imp.recargoFijoClp || 0);
    return round2(fil + luz + bolsa + metal + recargo);
  }

  function asegurarProductoPortacompletoPerroBulldog(d) {
    const seed = seedPortacompletoPerroBulldog();
    let changed = upsertProductoSeed(d, 'prod-portacompleto-perro-bulldog', seed);
    changed = migrarFilamentoNegroProducto(d, 'prod-portacompleto-perro-bulldog') || changed;
    const p = (d.productos || []).find((x) => x.id === 'prod-portacompleto-perro-bulldog');
    if (!p) return changed;
    const costoActual = costoProdRough(d, p);
    const costoSeed = costoProdRough(d, seed);
    // Conservar el set de parámetros con costo más alto (nuevo slicer 64,58 g / 2 h 13 m).
    if (costoSeed > costoActual + 0.01 || Number(p.filamentoGramos) === 61.35) {
      Object.assign(p, seed);
      return true;
    }
    return changed;
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
      nombre: 'Porta Lata Monster',
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

  /** Prefijos SKU legibles: PCGATO, PCPERRO, PCPEBUL, MCPEBUL, PLMONS… */
  function skuPrefijoDesdeTexto(nombre, id) {
    const t = `${nombre || ''} ${id || ''}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (/macetero/.test(t) && /bull/.test(t)) return 'MCPEBUL';
    if (/(porta\s*completos?|portacompleto)/.test(t) && /bull/.test(t)) return 'PCPEBUL';
    if (/(porta\s*completos?|portacompleto)/.test(t) && /gato/.test(t)) return 'PCGATO';
    if (/(porta\s*completos?|portacompleto)/.test(t) && /perro/.test(t)) return 'PCPERRO';
    if (/porta\s*lata/.test(t) && /monster|mons/.test(t)) return 'PLMONS';
    if (/bob|esponja/.test(t)) return 'PTBOBES';
    if (/nave/.test(t) && /horiz/.test(t)) return 'NAVEHOR';
    if (/nave/.test(t) && /vert/.test(t)) return 'NAVEVERT';
    if (/llavero/.test(t) && /ranger|escudo/.test(t)) return 'LLRANGER';
    if (/llavero/.test(t) && /lipstick|stanley|standley/.test(t)) return 'LLSTANDL';
    if (/llavero/.test(t) && /(pesa|kettlebell|rusa)/.test(t)) return 'LLPESRU';
    if (/soporte/.test(t) && /celular|telefono|tel[eé]fono|phone/.test(t)) return 'SOPCEL';
    if (/soporte/.test(t)) return 'SOPCEL';
    if (/drag[oó]n/.test(t)) return 'DRAGON';
    if (/torre[oó]n|torreon/.test(t)) return 'TORREON';
    if (/alcanc[ií]a|chanchito|cerdito|piggy/.test(t)) return 'ALCHAN';
    if (/limpiador|secador/.test(t) && /brocha/.test(t)) return 'LMBROC';
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
      'prod-portacompletos-gato': { sku: 'PCGATO001', nombre: 'Porta Completos Gato' },
      'prod-portacompletos-perro': { sku: 'PCPERRO001', nombre: 'Porta Completos Perro' },
      'prod-porta-lata-monster': { sku: 'PLMONS001', nombre: 'Porta Lata Monster' },
      'prod-macetero-perro-bulldog': { sku: 'MCPEBUL001', nombre: 'Macetero Perro Bulldog' },
      'prod-portacompleto-perro-bulldog': { sku: 'PCPEBUL001', nombre: 'Porta Completo Perro Bulldog' },
      'prod-porta-bob-esponja': { sku: 'PTBOBES001', nombre: 'Porta Bob Esponja' },
      'prod-nave-espacial-horizontal': { sku: 'NAVEHOR001', nombre: 'Nave Espacial Horizontal' },
      'prod-nave-espacial-vertical': { sku: 'NAVEVERT001', nombre: 'Nave Espacial Vertical' },
      'prod-llavero-escudo-ranger': { sku: 'LLRANGER001', nombre: 'Llavero Escudo Ranger' },
      'prod-llavero-porta-lipstick-stanley': { sku: 'LLSTANDL001', nombre: 'Llavero Porta Lipstick Stanley' },
      'prod-llavero-pesa-rusa': { sku: 'LLPESRU001', nombre: 'Llavero Pesa Rusa' },
      'prod-soporte-celular': { sku: 'SOPCEL001', nombre: 'Soporte celular' },
      'prod-dragon': { sku: 'DRAGON001', nombre: 'Dragón' },
      'prod-torreon': { sku: 'TORREON001', nombre: 'Torreón' },
      'prod-limpiador-brochas': { sku: 'LMBROC001', nombre: 'Limpiador de brochas' },
      'prod-alcancia-chanchito': { sku: 'ALCHAN001', nombre: 'Alcancía chanchito' },
    };
    const SKU_ALIAS = {
      MCPERROBU001: 'MCPEBUL001',
      PCPERROBU001: 'PCPEBUL001',
      PTBOBESP001: 'PTBOBES001',
      NVESPHOR001: 'NAVEHOR001',
      NVESPVER001: 'NAVEVERT001',
      LLAVRANGER001: 'LLRANGER001',
      LLAVSTAN001: 'LLSTANDL001',
    };
    for (const p of d.productos) {
      const fijo = CANON[p.id];
      if (!fijo) continue;
      if (p.sku !== fijo.sku) {
        p.sku = fijo.sku;
        changed = true;
      }
      if (p.nombre !== fijo.nombre) {
        p.nombre = fijo.nombre;
        changed = true;
      }
    }
    for (const p of d.productos) {
      if (CANON[p.id]) continue;
      const alias = SKU_ALIAS[String(p.sku || '').toUpperCase()];
      if (alias) {
        p.sku = alias;
        changed = true;
      }
      if (!p.sku || !esSkuSimple(p.sku) || /^IMP-/i.test(p.sku)) {
        const otros = d.productos.filter((x) => x !== p && esSkuSimple(x.sku) && !/^IMP-/i.test(x.sku));
        p.sku = siguienteSkuProducto(p.nombre, p.id, otros);
        changed = true;
      }
    }
    // Pedidos: alinear SKU antiguos → canónicos
    for (const ped of d.pedidos || []) {
      for (const it of ped.items || []) {
        const next = SKU_ALIAS[String(it.sku || '').toUpperCase()];
        if (next && it.sku !== next) {
          it.sku = next;
          changed = true;
        }
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

  function costoHoraImpresora(impresoraOrId) {
    const p = data.parametros || {};
    let imp = null;
    if (impresoraOrId && typeof impresoraOrId === 'object') imp = impresoraOrId;
    else if (impresoraOrId) imp = impresoraPorId(impresoraOrId);
    const tarifa = Number(imp?.tarifaKwhClp > 0 ? imp.tarifaKwhClp : p.tarifaKwhClp || 0);
    const consumo = Number(
      imp?.consumoImpresoraKw > 0 ? imp.consumoImpresoraKw : p.consumoImpresoraKw || 0
    );
    return tarifa * consumo;
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
    const imp = impresoraDeProducto(prod);
    const gramos = gramosDesdeDesglose(prod) || round2(prod.filamentoGramos || 0);
    let kgFil = Number(prod.costoFilamentoKgClp || 0);
    if (!(kgFil > 0) && Number(imp?.costoFilamentoDefaultKgClp) > 0) {
      kgFil = Number(imp.costoFilamentoDefaultKgClp);
    }
    const filamento = round2((gramos / 1000) * kgFil);
    const luz = round2(Number(prod.horasImpresion || 0) * costoHoraImpresora(imp));
    const pintado = round2(
      (Number(prod.minutosPintado || 0) / 60) * Number(p.valorHoraManoObraClp || 0)
    );
    const metal = round2(Number(prod.unidadesMetal || 0) * Number(p.costoAnilloMetalLlaveroClp || 0));
    const bolsa = round2(Number(prod.unidadesBolsa || 0) * Number(p.costoBolsaEntregaClp || 0));
    const recargoProd = Number(prod.recargoImpresoraAntiguaClp || 0);
    const recargoPerfil = Number(imp?.recargoFijoClp || 0);
    // Si el producto ya trae recargo explícito, no duplicar el del perfil.
    const recargo = round2(recargoProd > 0 ? recargoProd : recargoPerfil);
    const total = round2(filamento + luz + pintado + metal + bolsa + recargo);
    return {
      filamento,
      luz,
      pintado,
      metal,
      bolsa,
      recargo,
      total,
      gramos: round2(gramos),
      impresoraId: imp?.id || '',
      impresoraNombre: imp?.nombre || '',
    };
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
      impresoraId: String(fd.get('impresoraId') || '').trim() || impresoraDefault()?.id || '',
      notas: String(fd.get('notas') || '').trim(),
      usarDesglose,
    };
  }

  function htmlCostoLive(c, _margenUnused, precioVenta) {
    const pctObj = Number(data?.parametros?.margenObjetivoPct ?? 100);
    const sugerido = precioSugeridoDesdeCosto(c.total);
    const markupReal = markupRealPct(precioVenta, c.total);
    const recargoHtml =
      Number(c.recargo) > 0
        ? `<div class="imp-kpi"><span>Recargo impresora</span><strong>${money(c.recargo)}</strong></div>`
        : '';
    const impLbl = c.impresoraNombre
      ? `<p class="imp-muted" style="margin:0 0 0.35rem">Impresora: <strong>${escapeHtml(c.impresoraNombre)}</strong></p>`
      : '';
    return `
      ${impLbl}
      <div class="imp-grid imp-grid--costo-live">
        <div class="imp-kpi"><span>Filamento (${Number(c.gramos || 0).toFixed(2)} g)</span><strong>${money(c.filamento)}</strong></div>
        <div class="imp-kpi"><span>Luz (impresión)</span><strong>${money(c.luz)}</strong></div>
        ${recargoHtml}
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
    const capitalJosefa = (data.gastos || []).reduce((a, g) => {
      if (/josefa/i.test(String(g.pagadoPor || ''))) return a + Number(g.montoNeto || 0);
      return a;
    }, 0);
    const capitalNicolas = Math.max(0, gastos - capitalJosefa);
    const deuda = Math.max(
      0,
      Number(
        cap.deudaJosefaClp != null
          ? cap.deudaJosefaClp
          : Math.round(cadaUnoGastos - capitalJosefa)
      )
    );
    const orden = (data.gastos || []).find((g) => g.id === 'gas-reg-312435' || g.ordenId === '312435');
    const ali = (data.gastos || []).find((g) => g.id === 'gas-reg-aliexpress');
    const lider = (data.gastos || []).find((g) => g.id === 'gas-reg-lider');
    const ml = (data.gastos || []).find((g) => g.id === 'gas-reg-mercadolibre' || g.ordenId === 'ml-pla-2026-07-14');
    const ml21 = (data.gastos || []).find(
      (g) => g.id === 'gas-reg-mercadolibre-2026-07-21' || g.ordenId === '2000014122225779'
    );
    const mlCreality = (data.gastos || []).find(
      (g) => g.id === 'gas-reg-mercadolibre-creality-50119' || g.ordenId === 'ml-creality-pla-50119'
    );
    const totalOrden = Number(orden?.montoNeto || 0);
    const totalMl = Number(ml?.montoNeto || 0);
    const totalMl21 = Number(ml21?.montoNeto || 0);
    const totalMlCreality = Number(mlCreality?.montoNeto || 0);
    const cats = gastosPorCategoria();
    const pedidosActivos = (data.pedidos || []).filter((p) =>
      pedidoActivo(p.estado || 'pendiente')
    );
    const montoPedidosPend = pedidosActivos.reduce((a, p) => a + Number(p.montoNeto || 0), 0);
    /** Barra inferior: ventas contabilizadas + pedidos pendientes (pipeline de recupero). */
    const ventasMasPedidos = ventas + montoPedidosPend;
    const denom = Math.max(metaRecuperar, ventas, ventasMasPedidos, 1);
    const pctGastos = Math.min(100, (metaRecuperar / denom) * 100);
    const pctVentas = Math.min(100, (ventas / denom) * 100);
    const pctVentasEnPipeline = Math.min(100, (ventas / denom) * 100);
    const pctPedidosEnPipeline = Math.min(
      Math.max(0, 100 - pctVentasEnPipeline),
      (montoPedidosPend / denom) * 100
    );
    /** Si se cobraran/transferieran los pedidos activos: % de progreso hacia la meta. */
    const pctPipeline =
      metaRecuperar > 0 ? Math.min(100, (ventasMasPedidos / metaRecuperar) * 100) : 100;
    const pctMarkup = Number(data.parametros?.margenObjetivoPct ?? 100);
    const filasCostoProd = (data.productos || [])
      .map((prod) => {
        const c = costoProducto(prod);
        const precio = precioVentaProducto(prod, c.total);
        return `<tr>
          <td><span class="imp-sku">${escapeHtml(prod.sku || '—')}</span></td>
          <td>${escapeHtml(prod.nombre || '')}</td>
          <td class="num">${money(c.total)}</td>
          <td class="num"><strong>${money(precio)}</strong></td>
        </tr>`;
      })
      .join('');

    const todosPedidos = (data.pedidos || []).slice();
    const countEst = { pendiente: 0, en_impresion: 0, listo: 0, transferido: 0, anulado: 0 };
    for (const p of todosPedidos) {
      const e = p.estado || 'pendiente';
      if (countEst[e] != null) countEst[e] += 1;
      else if (e === 'cancelado') countEst.anulado += 1;
    }
    const nVentas = (data.ventas || []).length;
    const nClientesHist = (data.meta?.clientesHistorial || []).length;

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
        <div class="imp-balance__pct" aria-hidden="true">${pctRecuperado.toFixed(1)}%</div>
        <div class="imp-balance__bar" title="Gastos + operación vs ventas contabilizadas">
          <div class="imp-balance__fill--gastos" style="width:${pctGastos}%"></div>
          <div class="imp-balance__fill--ventas" style="width:${pctVentas}%"></div>
        </div>
        <div class="imp-balance__legend">
          <span><i class="imp-dot imp-dot--gastos"></i>Gastos + op. ${money(metaRecuperar)}</span>
          <span><i class="imp-dot imp-dot--ventas"></i>Ventas ${money(ventas)} · solo cuentan al transferir pedido → venta</span>
        </div>
        <div class="imp-balance__bar imp-balance__bar--pipeline" title="Ventas contabilizadas + pedidos pendientes" aria-label="Ventas más pedidos pendientes" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pctPipeline.toFixed(0)}">
          <div class="imp-balance__fill--ventas" style="width:${pctVentasEnPipeline}%"></div>
          <div class="imp-balance__fill--pedidos" style="width:${pctPedidosEnPipeline}%"></div>
        </div>
        <div class="imp-balance__legend">
          <span><i class="imp-dot imp-dot--ventas"></i>Ventas ${money(ventas)}</span>
          <span><i class="imp-dot imp-dot--pedidos"></i>Pedidos pendientes ${money(montoPedidosPend)} (${pedidosActivos.length})</span>
          <span class="imp-balance__total-pct"><strong>Total ${money(ventasMasPedidos)}</strong> · progreso <strong>${pctPipeline.toFixed(1)}%</strong></span>
        </div>
        <p class="imp-balance__meta imp-balance__meta--pipeline">
          Si se cobran los ${pedidosActivos.length} pedidos pendientes → progreso proyectado <strong>${pctPipeline.toFixed(1)}%</strong>
        </p>
      </div>
      <div class="imp-grid imp-grid--2">
        <div class="imp-card imp-card--resumen-gen">
          <h2>Ventas</h2>
          <p class="imp-muted">Vista general. El detalle (IDs, ítems, descuentos, historial) está en <button type="button" class="imp-linkish" data-goto-tab="ventas">Ventas</button>.</p>
          <div class="imp-kpi imp-kpi--ok"><span>Contabilizadas</span><strong>${nVentas} · ${money(ventas)}</strong></div>
          <p class="imp-muted" style="margin:0.65rem 0 0">${nClientesHist} cliente${nClientesHist === 1 ? '' : 's'} en historial</p>
        </div>
        <div class="imp-card imp-card--resumen-gen">
          <h2>Pedidos</h2>
          <p class="imp-muted">Pipeline. Detalle y fiados en <button type="button" class="imp-linkish" data-goto-tab="pedidos">Pedidos</button>.</p>
          <div class="imp-pedido-status-counts" aria-label="Conteo por estado">
            <span class="imp-badge imp-badge--warn">Pendiente ${countEst.pendiente}</span>
            <span class="imp-badge imp-badge--print">En impresión ${countEst.en_impresion}</span>
            <span class="imp-badge imp-badge--listo">Listo ${countEst.listo}</span>
            <span class="imp-badge imp-badge--ok">Transferido ${countEst.transferido}</span>
            ${countEst.anulado ? `<span class="imp-badge imp-badge--anulado">Anulado ${countEst.anulado}</span>` : ''}
          </div>
          <div class="imp-kpi" style="margin-top:0.75rem"><span>Activos (aún no bajan deuda)</span><strong>${pedidosActivos.length} · ${money(montoPedidosPend)}</strong></div>
        </div>
      </div>
      <div class="imp-grid">
        <div class="imp-kpi"><span>Gastos totales (ambos)</span><strong>${money(gastos)}</strong></div>
        <div class="imp-kpi imp-kpi--ok"><span>Ventas (contabilizadas)</span><strong>${money(ventas)}</strong></div>
        <div class="imp-kpi"><span>Pedidos activos</span><strong>${pedidosActivos.length} · ${money(montoPedidosPend)}</strong></div>
        <div class="imp-kpi ${resultado >= 0 ? 'imp-kpi--ok' : 'imp-kpi--warn'}"><span>Resultado (ventas − gastos)</span><strong>${money(resultado)}</strong></div>
      </div>
      <div class="imp-card">
        <h2>Costos de producto (resumen)</h2>
        <p class="imp-muted">Mismos costo y precio que en <button type="button" class="imp-linkish" data-goto-tab="costos">Costos producto</button>. Si no hay precio manual, se sugiere <strong>+${pctMarkup}%</strong> sobre el costo.</p>
        <div class="imp-table-wrap">
          <table class="imp-table">
            <thead><tr><th>SKU</th><th>Producto</th><th>Costo</th><th>Precio venta</th></tr></thead>
            <tbody>${filasCostoProd || '<tr><td colspan="4">Sin productos</td></tr>'}</tbody>
          </table>
        </div>
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
            <li><span>Capital que aportó</span><strong>${money(capitalJosefa)}</strong></li>
          </ul>
          <p class="imp-socio__nota">Le corresponde el 50% de los gastos; ya aportó ${money(capitalJosefa)} · saldo a Nicolás ${money(deuda)}.</p>
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
            <li><span>Capital que aportó</span><strong>${money(capitalNicolas)}</strong></li>
          </ul>
          <p class="imp-socio__nota">Aportó ${money(capitalNicolas)}. Tiene por cobrar de Josefa ${money(deuda)}.</p>
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
          <li>Mercado Libre 21-jul (TPU+PLA PPC): <strong>${money(totalMl21)}</strong></li>
          <li>Mercado Libre Creality (4 PLA): <strong>${money(totalMlCreality)}</strong></li>
        </ul>
        <p class="imp-deuda"><strong>Capital:</strong> lo aportó <strong>Nicolás</strong>. Todos los gastos son de <strong>ambos</strong>. Josefa le debe a Nicolás el <strong>50%</strong> del capital (${money(deuda)}).</p>
        <p class="imp-muted">Esa deuda entre socios es distinta del saldo de arriba: el saldo baja con cada venta del negocio; la deuda 50% de Josefa se actualiza con el capital aportado.</p>
      </div>
    `;

    $('#tab-resumen')?.querySelectorAll('[data-goto-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-goto-tab');
        document.querySelector(`#imp-tabs button[data-tab="${tab}"]`)?.click();
      });
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
        <td>${escapeHtml(labelQuienGasto(g))}</td>
        <td><button type="button" class="imp-btn imp-btn--danger" data-del-gasto="${g.id}">✕</button></td>
      </tr>`;
      })
      .join('');

    $('#tab-gastos').innerHTML = `
      <div class="imp-card">
        <h2>Gastos por registro (${money(sum(data.gastos))})</h2>
        <p class="imp-muted">Cada compra se guarda como <strong>un solo registro</strong> (orden / AliExpress / Líder / Mercado Libre…). El detalle de ítems queda desplegable.</p>
        <p class="imp-muted"><strong>«Ambos»</strong> = gasto de la sociedad (deuda 50/50). Hasta ahora <strong>todo lo ha pagado Nicolás</strong>; Josefa debe el 50%.</p>
        <div class="imp-table-wrap">
          <table class="imp-table">
            <thead><tr><th>Fecha</th><th>Cat.</th><th>Registro</th><th>Monto</th><th>Quién / pagó</th><th></th></tr></thead>
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
          <label>Sociedad (deuda)
            <select name="socioRegistro">
              <option value="Ambos" selected>Ambos (50/50)</option>
              <option value="Josefa">Josefa</option>
              <option value="Nicolás">Nicolás</option>
            </select>
          </label>
          <label>Quién pagó
            <select name="pagadoPor">
              <option value="Nicolás" selected>Nicolás</option>
              <option value="Josefa">Josefa</option>
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
      const pagadoPor = String(fd.get('pagadoPor') || 'Nicolás').trim() || 'Nicolás';
      const socioRegistro = String(fd.get('socioRegistro') || 'Ambos').trim() || 'Ambos';
      const notasBase = String(fd.get('notas') || '').trim();
      const notasPago = `Sociedad ${socioRegistro} · pagó ${pagadoPor}.`;
      data.gastos.push({
        id: uid('gas'),
        fecha: fd.get('fecha'),
        categoria: fd.get('categoria'),
        descripcion: fd.get('descripcion'),
        proveedor: fd.get('proveedor') || '',
        cantidad: 1,
        montoNeto: Number(fd.get('montoNeto')),
        notas: notasBase ? `${notasBase} ${notasPago}` : notasPago,
        ordenId: '',
        socioRegistro,
        pagadoPor,
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
    if (estado === 'anulado' || estado === 'cancelado') {
      return '<span class="imp-badge imp-badge--anulado">Anulado</span>';
    }
    if (estado === 'listo') return '<span class="imp-badge imp-badge--listo">Listo para entregar</span>';
    if (estado === 'en_impresion') return '<span class="imp-badge imp-badge--print">En impresión</span>';
    return '<span class="imp-badge imp-badge--warn">Pendiente</span>';
  }

  function pedidoActivo(estado) {
    return ['pendiente', 'listo', 'en_impresion'].includes(estado || 'pendiente');
  }

  function fechaPagoPedidoUi(p) {
    const d = String(p?.fechaPagoEsperada || p?.fechaPago || p?.pagaEl || '').slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : '';
  }

  function esPedidoFiado(p) {
    if (!p) return false;
    if (p.fiado === true) return true;
    if (fechaPagoPedidoUi(p)) return true;
    return false;
  }

  function fiadoPendiente(p) {
    return esPedidoFiado(p) && pedidoActivo(p.estado || 'pendiente');
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

  function selectEstadoPedido(p) {
    const estado = p.estado || 'pendiente';
    if (!pedidoActivo(estado)) return badgeEstadoPedido(estado);
    return `<select class="imp-select-estado" data-estado-select="${escapeHtml(p.id)}" aria-label="Estado ${escapeHtml(p.numero || '')}">
      <option value="pendiente"${estado === 'pendiente' ? ' selected' : ''}>Pendiente</option>
      <option value="en_impresion"${estado === 'en_impresion' ? ' selected' : ''}>En impresión</option>
      <option value="listo"${estado === 'listo' ? ' selected' : ''}>Listo para entregar</option>
      <option value="anulado"${estado === 'anulado' ? ' selected' : ''}>Anulado</option>
    </select>`;
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
        const precioField = activo
          ? `<label class="imp-item-precio">Precio venta/u
              <input type="number" min="0" step="0.01" value="${num2(precioU)}"
                data-precio-item="${escapeHtml(p.id)}" data-idx="${idx}" />
            </label>`
          : `<span>Precio venta/u <strong>${money(precioU)}</strong></span>`;
        return `<div class="imp-pedido-item">
          <div class="imp-pedido-item__head">
            <span>${cant}× ${escapeHtml(it.sku || '')} ${escapeHtml(it.nombre || '')}${fil}</span>
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
    const cn = String(fd.get('clienteNombre') || '').trim();
    const cs = String(fd.get('clienteSegundoNombre') || '').trim();
    const co = String(fd.get('clienteOrigen') || '')
      .trim()
      .toUpperCase();
    if (cn || co) {
      pedidoEditDraft.clienteNombre = cn;
      pedidoEditDraft.clienteSegundoNombre = cs || undefined;
      pedidoEditDraft.clienteOrigen = co === 'SIE' || co === 'MKOF' ? co : '';
      pedidoEditDraft.cliente = formatearClienteImp(cn, cs, pedidoEditDraft.clienteOrigen);
    } else {
      pedidoEditDraft.cliente = String(fd.get('cliente') || '').trim();
    }
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
      items.push({
        sku,
        nombre: prod?.nombre || row.querySelector('[name="nombre"]')?.value || sku,
        cantidad,
        precioUnitarioClp,
        costoUnitarioClp,
        filamento: String(row.querySelector('[name="filamento"]')?.value || '').trim(),
      });
    });
    pedidoEditDraft.items = items;
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
        return `<div class="imp-pedido-edit-item" data-edit-item="${idx}">
          <div class="imp-form">
            <label>Producto (SKU)
              <select name="sku"><option value="">Elegir…</option>${optsSkuProducto(it.sku)}</select>
            </label>
            <input type="hidden" name="nombre" value="${escapeHtml(it.nombre || '')}" />
            <label>Cantidad<input name="cantidad" type="number" min="0.01" step="0.01" value="${num2(cant)}" /></label>
            <label>Costo / u<input name="costoUnitarioClp" type="number" min="0" step="0.01" value="${num2(it.costoUnitarioClp || 0)}" readonly /></label>
            <label>Precio venta / u<input name="precioUnitarioClp" type="number" min="0" step="0.01" value="${num2(it.precioUnitarioClp || 0)}" /></label>
            <label>Filamento<input name="filamento" value="${escapeHtml(it.filamento || '')}" placeholder="PLA+ negro" /></label>
            <div class="imp-form-actions">
              <button type="button" class="imp-btn imp-btn--danger imp-btn--sm" data-quitar-item="${idx}">Quitar ítem</button>
              <span class="imp-muted">Subtotal ${money(round2(cant * Number(it.precioUnitarioClp || 0)))}</span>
            </div>
          </div>
        </div>`;
      })
      .join('');

    const cliParsed = parseClienteImp(ped.cliente, ped);
    body.innerHTML = `
      <form class="imp-form" id="form-editar-pedido">
        <p class="imp-muted">Nombre + origen (SIE = Nico · MKOF = Josefa). Precio venta/u se puede subir. El estado también está en Resumen.</p>
        <label>Fecha<input name="fecha" type="date" required value="${escapeHtml(ped.fecha || today())}" /></label>
        <label>Nombre<input name="clienteNombre" value="${escapeHtml(cliParsed.nombre)}" required /></label>
        <label>Segundo nombre<input name="clienteSegundoNombre" value="${escapeHtml(cliParsed.segundoNombre)}" placeholder="Opcional" /></label>
        <label>Origen
          <select name="clienteOrigen" required>
            <option value="">Elegir…</option>
            <option value="SIE"${cliParsed.origen === 'SIE' ? ' selected' : ''}>SIE · trabajo Nicolás</option>
            <option value="MKOF"${cliParsed.origen === 'MKOF' ? ' selected' : ''}>MKOF · trabajo Josefa</option>
          </select>
        </label>
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
            <option value="anulado"${ped.estado === 'anulado' ? ' selected' : ''}>Anulado</option>
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
    form?.querySelectorAll('[name="cantidad"]').forEach((inp) => {
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
      ped.clienteNombre = pedidoEditDraft.clienteNombre;
      ped.clienteSegundoNombre = pedidoEditDraft.clienteSegundoNombre;
      ped.clienteOrigen = pedidoEditDraft.clienteOrigen;
      ped.canal = pedidoEditDraft.canal;
      ped.notas = pedidoEditDraft.notas;
      ped.socioRegistro = pedidoEditDraft.socioRegistro;
      ped.items = pedidoEditDraft.items;
      ped.estado = estForm;
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

  let transferPedidoId = null;

  function cerrarModalTransferir() {
    const modal = $('#imp-modal-transferir');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('imp-modal-open');
    transferPedidoId = null;
    const body = $('#imp-modal-transferir-body');
    if (body) body.innerHTML = '';
  }

  function abrirModalTransferir(id) {
    const ped = (data.pedidos || []).find((p) => p.id === id);
    if (!ped || !pedidoActivo(ped.estado)) return;
    recalcularMontoPedido(ped);
    transferPedidoId = ped.id;
    const bruto = round2(ped.montoNeto || 0);
    const body = $('#imp-modal-transferir-body');
    const title = $('#imp-modal-transferir-title');
    const modal = $('#imp-modal-transferir');
    if (!body || !modal) return;
    if (title) title.textContent = `Transferir ${ped.numero || 'pedido'}`;
    const itemsTxt = (ped.items || [])
      .map((it) => `${it.cantidad || 1}× ${it.nombre || it.sku || ''}`)
      .join(', ');
    body.innerHTML = `
      <form class="imp-form" id="form-transferir-venta">
        <p class="imp-muted">Cliente: <strong>${escapeHtml(ped.cliente || '—')}</strong><br>${escapeHtml(itemsTxt)}</p>
        <label>Subtotal (sin descuento)
          <input type="number" id="tr-bruto" value="${num2(bruto)}" readonly />
        </label>
        <label>Descuento %
          <input type="number" name="descuentoPct" id="tr-desc-pct" min="0" max="100" step="0.01" value="0" />
        </label>
        <label>Descuento CLP
          <input type="number" name="descuentoClp" id="tr-desc-clp" min="0" step="0.01" value="0" />
        </label>
        <label>Total a cobrar
          <input type="number" id="tr-total" value="${num2(bruto)}" readonly />
        </label>
        <p class="imp-muted">Costo del pedido: <strong>${money(ped.costoTotal || 0)}</strong>. El descuento baja solo el total de venta (la deuda baja con ese monto).</p>
        <div class="imp-form-actions">
          <button type="submit" class="imp-btn imp-btn--primary">Confirmar venta</button>
          <button type="button" class="imp-btn" id="btn-modal-transferir-cancelar">Cancelar</button>
        </div>
      </form>
    `;

    const syncDesc = (from) => {
      const pctEl = $('#tr-desc-pct');
      const clpEl = $('#tr-desc-clp');
      const totEl = $('#tr-total');
      if (!pctEl || !clpEl || !totEl) return;
      let desc = 0;
      if (from === 'pct') {
        const pct = Math.max(0, Math.min(100, Number(pctEl.value || 0)));
        desc = round2((bruto * pct) / 100);
        clpEl.value = num2(desc);
      } else {
        desc = Math.max(0, Math.min(bruto, round2(clpEl.value || 0)));
        clpEl.value = num2(desc);
        pctEl.value = bruto > 0 ? num2((desc / bruto) * 100) : '0.00';
      }
      totEl.value = num2(round2(bruto - desc));
    };
    $('#tr-desc-pct')?.addEventListener('input', () => syncDesc('pct'));
    $('#tr-desc-clp')?.addEventListener('input', () => syncDesc('clp'));
    $('#btn-modal-transferir-cancelar')?.addEventListener('click', cerrarModalTransferir);

    $('#form-transferir-venta')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const pedNow = (data.pedidos || []).find((p) => p.id === transferPedidoId);
      if (!pedNow || !pedidoActivo(pedNow.estado)) {
        cerrarModalTransferir();
        return;
      }
      recalcularMontoPedido(pedNow);
      const montoBruto = round2(pedNow.montoNeto || 0);
      let descuentoClp = round2($('#tr-desc-clp')?.value || 0);
      if (descuentoClp < 0) descuentoClp = 0;
      if (descuentoClp > montoBruto) descuentoClp = montoBruto;
      const descuentoPct = montoBruto > 0 ? round2((descuentoClp / montoBruto) * 100) : 0;
      const montoNeto = round2(montoBruto - descuentoClp);

      const itemsSnap = (pedNow.items || []).map((it) => ({
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
      const notaDesc =
        descuentoClp > 0 ? `Descuento ${money(descuentoClp)} (${descuentoPct}%). ` : '';
      const codigo = nextVentaCodigo(data);
      const venta = {
        id: uid('ven'),
        codigo,
        fecha: pedNow.fecha || today(),
        descripcion: `${pedNow.numero} · ${itemsTxt}${pedNow.cliente ? ` · ${pedNow.cliente}` : ''}`,
        cantidad: cant,
        montoBruto,
        descuentoClp,
        descuentoPct,
        montoNeto,
        costoTotal: Number(pedNow.costoTotal || 0),
        canal: pedNow.canal || '',
        cliente: pedNow.cliente || '',
        notas: `${notaDesc}${pedNow.notas || `Desde pedido ${pedNow.numero}`}`.trim(),
        socioRegistro: pedNow.socioRegistro || 'Ambos',
        pedidoId: pedNow.id,
        pedidoNumero: pedNow.numero,
        items: itemsSnap,
        creado: new Date().toISOString(),
      };
      data.ventas = data.ventas || [];
      data.ventas.push(venta);
      rebuildClientesHistorial(data);
      pedNow.estado = 'transferido';
      pedNow.ventaId = venta.id;
      pedNow.transferidoEn = new Date().toISOString();
      pedNow.montoBruto = montoBruto;
      pedNow.descuentoClp = descuentoClp;
      pedNow.descuentoPct = descuentoPct;
      pedNow.montoNeto = montoNeto;
      pedNow.costoTotal = venta.costoTotal;
      cerrarModalTransferir();
      markDirty();
      renderAll();
      activarTab('ventas');
      const msgDesc = descuentoClp > 0 ? ` (desc. ${money(descuentoClp)})` : '';
      setStatus(`${pedNow.numero} → ${codigo} · ${money(montoNeto)}${msgDesc} · guardando…`, 'warn');
      save()
        .then(() =>
          setStatus(`${pedNow.numero} → ${codigo} · ${money(montoNeto)}${msgDesc} contabilizado y guardado ✓`, 'ok')
        )
        .catch((err) => setStatus(String(err.message || err), 'err'));
    });

    modal.removeAttribute('hidden');
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.classList.add('imp-modal-open');
    $('#tr-desc-clp')?.focus();
  }

  function renderPedidos() {
    const productos = data.productos || [];
    const optsProd = productos
      .map((p) => `<option value="${escapeHtml(p.sku || '')}">${escapeHtml(p.sku || '')} · ${escapeHtml(p.nombre || '')}</option>`)
      .join('');

    const filaPedido = (p, { mostrarPagaEl = false } = {}) => {
      recalcularMontoPedido(p);
      const estado = p.estado || 'pendiente';
      let acciones = `<span class="imp-muted">${escapeHtml(p.ventaId || '—')}</span>`;
      if (pedidoActivo(estado)) {
        acciones = `<button type="button" class="imp-btn imp-btn--sm" data-edit-pedido="${escapeHtml(p.id)}">Editar</button>
          <button type="button" class="imp-btn imp-btn--primary imp-btn--sm" data-transferir-pedido="${escapeHtml(p.id)}">Transferir a venta</button>
          <button type="button" class="imp-btn imp-btn--danger imp-btn--sm" data-del-pedido="${escapeHtml(p.id)}">✕</button>`;
      }
      const pagaCell = mostrarPagaEl
        ? `<td><strong>${escapeHtml(fechaPagoPedidoUi(p) || '—')}</strong></td>`
        : '';
      return `<tr>
        <td><strong>${escapeHtml(p.numero || '')}</strong><div class="imp-muted">${escapeHtml(p.fecha || '')}</div></td>
        <td>
          <strong>${escapeHtml(p.cliente || '—')}</strong>
          ${
            !mostrarPagaEl && (p.fiado || p.fechaPagoEsperada)
              ? `<div class="imp-badge">Fiado · paga ${escapeHtml(fechaPagoPedidoUi(p) || '—')}</div>`
              : ''
          }
          <div class="imp-pedido-items">${renderItemsPedido(p)}</div>
          ${p.notas ? `<div class="imp-muted">${escapeHtml(p.notas)}</div>` : ''}
        </td>
        ${pagaCell}
        <td class="num">
          <strong>${money(p.montoNeto)}</strong>
          <div class="imp-muted">venta</div>
          <div class="imp-muted">costo ${money(p.costoTotal || 0)}</div>
        </td>
        <td>${selectEstadoPedido(p)}</td>
        <td class="imp-pedidos-actions">${acciones}</td>
      </tr>`;
    };

    const pedidosOrden = (data.pedidos || []).slice().reverse();
    const fiadosPendientes = pedidosOrden.filter(fiadoPendiente);
    const pedidosResto = pedidosOrden.filter((p) => !fiadoPendiente(p));
    const totalFiados = fiadosPendientes.reduce((s, p) => {
      recalcularMontoPedido(p);
      return s + Number(p.montoNeto || 0);
    }, 0);

    const rowsFiados = fiadosPendientes.map((p) => filaPedido(p, { mostrarPagaEl: true })).join('');
    const rows = pedidosResto.map((p) => filaPedido(p)).join('');

    const bloqueFiados = `
      <div class="imp-card imp-card--fiados">
        <h2>Fiados</h2>
        <p class="imp-muted">Pedidos entregados o en curso que <strong>aún no se cobraron</strong>. La fecha «Paga el» crea el recordatorio en el organizador. Cuando paguen → <strong>Transferir a venta</strong>.</p>
        <div class="imp-table-wrap">
          <table class="imp-table">
            <thead><tr><th>ID</th><th>Cliente / ítems</th><th>Paga el</th><th>Monto</th><th>Estado</th><th></th></tr></thead>
            <tbody>${
              rowsFiados ||
              '<tr><td colspan="6" class="imp-muted">Sin fiados pendientes</td></tr>'
            }</tbody>
          </table>
        </div>
        <p class="imp-kpi"><span>Por cobrar</span><strong>${money(totalFiados)}</strong></p>
      </div>`;

    $('#tab-pedidos').innerHTML = `
      ${bloqueFiados}
      <div class="imp-card">
        <h2>Pedidos</h2>
        <p class="imp-muted">Por ítem: <strong>costo/u</strong> y <strong>precio venta/u</strong> (editable). El <strong>estado</strong> se elige en el menú. Al <strong>Transferir a venta</strong> podés aplicar un <strong>descuento</strong>; el total cobrado es el que baja la deuda. Los fiados pendientes están arriba en <strong>Fiados</strong>.</p>
        <div class="imp-table-wrap">
          <table class="imp-table">
            <thead><tr><th>ID</th><th>Cliente / ítems</th><th>Total</th><th>Estado</th><th></th></tr></thead>
            <tbody>${rows || '<tr><td colspan="5">Sin pedidos aún</td></tr>'}</tbody>
          </table>
        </div>
      </div>
      <div class="imp-card">
        <h3>Nuevo pedido</h3>
        <p class="imp-muted">Mínimo: <strong>nombre</strong> + <strong>origen</strong> (SIE = trabajo Nicolás · MKOF = trabajo Josefa). Segundo nombre opcional. Precio venta se puede subir a mano.</p>
        <form class="imp-form" id="form-pedido">
          <label>Fecha<input name="fecha" type="date" required value="${today()}" /></label>
          <label>Nombre<input name="clienteNombre" required placeholder="Ej. Rebe" /></label>
          <label>Segundo nombre<input name="clienteSegundoNombre" placeholder="Opcional" /></label>
          <label>Origen (dónde viene)
            <select name="clienteOrigen" required>
              <option value="">Elegir…</option>
              <option value="SIE">SIE · trabajo Nicolás</option>
              <option value="MKOF">MKOF · trabajo Josefa</option>
            </select>
          </label>
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
              <option value="pendiente" selected>Pendiente</option>
              <option value="en_impresion">En impresión</option>
              <option value="listo">Listo para entregar</option>
              <option value="anulado">Anulado</option>
            </select>
          </label>
          <label>Canal<input name="canal" placeholder="WhatsApp / Instagram / feria" value="WhatsApp" /></label>
          <label>Fiado (paga después)
            <select name="fiado" id="pedido-fiado">
              <option value="no" selected>No · cobrado / al contado</option>
              <option value="si">Sí · paga más adelante</option>
            </select>
          </label>
          <label>Fecha de pago (si fiado)
            <input name="fechaPagoEsperada" type="date" id="pedido-fecha-pago" />
          </label>
          <label>Quién
            <select name="socioRegistro">
              <option value="Ambos" selected>Ambos</option>
              <option value="Josefa">Josefa</option>
              <option value="Nicolás">Nicolás</option>
            </select>
          </label>
          <label class="imp-form-span">Notas<textarea name="notas" rows="2" placeholder="Ej. PLA negro · paga el 18 ago"></textarea></label>
          <div class="imp-form-actions">
            <button class="imp-btn imp-btn--primary" type="submit">Registrar pedido</button>
            <span class="imp-muted">Fiado → crea recordatorio de cobro en el organizador el día de pago</span>
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
      const clienteNombre = String(fd.get('clienteNombre') || '').trim();
      const clienteSegundoNombre = String(fd.get('clienteSegundoNombre') || '').trim();
      const clienteOrigen = String(fd.get('clienteOrigen') || '')
        .trim()
        .toUpperCase();
      if (!clienteNombre) {
        setStatus('Falta el nombre del cliente', 'warn');
        return;
      }
      if (clienteOrigen !== 'SIE' && clienteOrigen !== 'MKOF') {
        setStatus('Elige origen: SIE (Nico) o MKOF (Josefa)', 'warn');
        return;
      }
      const cliente = formatearClienteImp(clienteNombre, clienteSegundoNombre, clienteOrigen);
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
      if (!(costoUnitarioClp > 0)) {
        setStatus('Ese producto no tiene costo calculado — carga parámetros o imagen en Costos', 'warn');
        return;
      }
      const numero = siguienteNumeroPedido();
      data.pedidos = data.pedidos || [];
      const estadoOk = pedidoActivo(estado) ? estado : 'pendiente';
      const fiadoSi = String(fd.get('fiado') || 'no') === 'si';
      const fechaPagoEsperada = String(fd.get('fechaPagoEsperada') || '').slice(0, 10);
      if (fiadoSi && !/^\d{4}-\d{2}-\d{2}$/.test(fechaPagoEsperada)) {
        setStatus('Si es fiado, indica la fecha de pago (día en que cobramos)', 'warn');
        return;
      }
      const ped = {
        id: uid('ped'),
        numero,
        fecha: fd.get('fecha'),
        cliente,
        clienteNombre,
        clienteSegundoNombre: clienteSegundoNombre || undefined,
        clienteOrigen,
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
      if (fiadoSi) {
        ped.fiado = true;
        ped.fechaPagoEsperada = fechaPagoEsperada;
        ped.pagoNotas = `Paga el ${fechaPagoEsperada}`;
        if (!ped.notas) ped.notas = `Fiado · paga ${fechaPagoEsperada}`;
      }
      data.pedidos.push(ped);
      markDirty();
      renderAll();
      activarTab('pedidos');
      setStatus(
        fiadoSi
          ? `${numero} · ${cliente} · fiado · cobra ${fechaPagoEsperada} · ${money(montoNeto)} (recordatorio en organizador al sync)`
          : `${numero} · ${cliente} · ${estadoOk} · ${money(montoNeto)} · visible en Resumen`,
        'warn'
      );
      save().catch((err) => setStatus(String(err.message || err), 'err'));
    });

    $('#tab-pedidos')?.querySelectorAll('[data-edit-pedido]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        abrirModalEditarPedido(btn.getAttribute('data-edit-pedido'));
      });
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

    $('#tab-pedidos')?.querySelectorAll('[data-estado-select]').forEach((sel) => {
      sel.addEventListener('change', () => {
        const id = sel.getAttribute('data-estado-select');
        const next = String(sel.value || 'pendiente');
        const ped = (data.pedidos || []).find((p) => p.id === id);
        if (!ped || !pedidoActivo(ped.estado)) return;
        if (!pedidoActivo(next) && next !== 'anulado') {
          sel.value = ped.estado || 'pendiente';
          return;
        }
        ped.estado = next;
        if (next === 'anulado') {
          ped.anuladoEn = ped.anuladoEn || new Date().toISOString();
          ped.ventaId = null;
          if (ped.notas && !/anulado/i.test(ped.notas)) {
            ped.notas = `${ped.notas} · ANULADO`.trim();
          }
        }
        markDirty();
        renderAll();
        activarTab('pedidos');
        const label =
          next === 'anulado'
            ? 'anulado'
            : next === 'listo'
              ? 'listo para entregar'
              : next === 'en_impresion'
                ? 'en impresión'
                : 'pendiente';
        setStatus(`${ped.numero}: ${label} · guardando…`, 'warn');
        save()
          .then(() => setStatus(`${ped.numero}: ${label} ✓`, 'ok'))
          .catch((err) => setStatus(String(err.message || err), 'err'));
      });
    });

    $('#tab-pedidos')?.querySelectorAll('[data-transferir-pedido]').forEach((btn) => {
      btn.addEventListener('click', () => {
        abrirModalTransferir(btn.getAttribute('data-transferir-pedido'));
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

  function origenDesdeCliente(cliente) {
    const parts = String(cliente || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return '';
    const last = parts[parts.length - 1].toUpperCase();
    if (last === 'SIE' || last === 'MKOF') return last;
    return '';
  }

  function ventaPasaFiltros(v) {
    const cliente = String(v.cliente || '').trim();
    if (ventasFiltroCliente && cliente !== ventasFiltroCliente) return false;
    if (ventasFiltroOrigen) {
      const orig = origenDesdeCliente(cliente);
      if (orig !== ventasFiltroOrigen) return false;
    }
    if (ventasFiltroTexto) {
      const q = ventasFiltroTexto.toLowerCase();
      const blob = [
        v.codigo,
        v.cliente,
        v.descripcion,
        v.pedidoNumero,
        v.notas,
        ...(v.items || []).map((it) => `${it.nombre || ''} ${it.sku || ''} ${it.filamento || ''}`),
      ]
        .join(' ')
        .toLowerCase();
      if (!blob.includes(q)) return false;
    }
    return true;
  }

  function renderVentas() {
    rebuildClientesHistorial(data);
    // Más reciente arriba (I000020…), más antigua abajo (I000001)
    const ventasSorted = (data.ventas || []).slice().sort((a, b) => {
      const na = Number(String(a.codigo || '').replace(/^I0*/, '') || 0);
      const nb = Number(String(b.codigo || '').replace(/^I0*/, '') || 0);
      if (na && nb && na !== nb) return nb - na;
      return String(b.fecha || '').localeCompare(String(a.fecha || ''));
    });
    const ventasFiltradas = ventasSorted.filter(ventaPasaFiltros);
    const clientesOpts = Array.from(
      new Set(
        (data.ventas || [])
          .map((v) => String(v.cliente || '').trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, 'es'));

    const rows = ventasFiltradas
      .map((v) => {
        const itemsHtml = (v.items || [])
          .map(
            (it) =>
              `<div class="imp-muted">${it.cantidad || 1}× ${escapeHtml(it.nombre || it.sku || '')} · venta/u ${money(it.precioUnitarioClp)} · costo/u ${money(it.costoUnitarioClp)}</div>`
          )
          .join('');
        return `
      <tr>
        <td><strong>${escapeHtml(v.codigo || '—')}</strong><div class="imp-muted">${escapeHtml(v.fecha || '')}</div></td>
        <td><strong>${escapeHtml(v.cliente || '—')}</strong>${
          v.pedidoNumero
            ? `<div class="imp-muted">Desde pedido <strong>${escapeHtml(v.pedidoNumero)}</strong></div>`
            : ''
        }${itemsHtml || (v.descripcion ? `<div class="imp-muted">${escapeHtml(v.descripcion)}</div>` : '')}</td>
        <td class="num">${v.cantidad || 1}</td>
        <td class="num"><strong>${money(v.montoNeto)}</strong>${
          Number(v.descuentoClp) > 0
            ? `<div class="imp-muted">bruto ${money(v.montoBruto ?? Number(v.montoNeto) + Number(v.descuentoClp))} · desc. −${money(v.descuentoClp)}</div>`
            : ''
        }${v.costoTotal != null ? `<div class="imp-muted">costo ${money(v.costoTotal)}</div>` : ''}</td>
        <td>${escapeHtml(v.canal || '')}</td>
        <td><button type="button" class="imp-btn imp-btn--danger" data-del-venta="${v.id}">✕</button></td>
      </tr>`;
      })
      .join('');

    const hist = data.meta?.clientesHistorial || [];
    const histFiltrado = hist.filter((h) => {
      if (ventasFiltroCliente && h.cliente !== ventasFiltroCliente) return false;
      if (ventasFiltroOrigen && origenDesdeCliente(h.cliente) !== ventasFiltroOrigen) return false;
      if (ventasFiltroTexto) {
        const q = ventasFiltroTexto.toLowerCase();
        const blob = `${h.cliente} ${(h.ventaCodigos || []).join(' ')}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
    const histRows = histFiltrado
      .map((h) => {
        const activo = ventasFiltroCliente === h.cliente;
        return `<tr class="imp-hist-row${activo ? ' is-active' : ''}" data-filtro-cliente="${escapeHtml(h.cliente)}" title="Ver compras de ${escapeHtml(h.cliente)}">
        <td><strong>${escapeHtml(h.cliente)}</strong>${activo ? ' <span class="imp-badge">filtro</span>' : ''}</td>
        <td class="num">${h.compras}</td>
        <td>${(h.ventaCodigos || [])
          .slice()
          .sort((a, b) => {
            const na = Number(String(a || '').replace(/^I0*/, '') || 0);
            const nb = Number(String(b || '').replace(/^I0*/, '') || 0);
            return nb - na;
          })
          .map((c) => escapeHtml(c))
          .join(', ') || '—'}</td>
        <td class="num"><strong>${money(h.totalNeto)}</strong></td>
      </tr>`;
      })
      .join('');

    const totalFiltrado = ventasFiltradas.reduce((a, v) => a + Number(v.montoNeto || 0), 0);
    const totalGlobal = sum(data.ventas);
    const hayFiltro = !!(ventasFiltroCliente || ventasFiltroOrigen || ventasFiltroTexto);
    const clienteOptionsHtml = clientesOpts
      .map(
        (c) =>
          `<option value="${escapeHtml(c)}"${c === ventasFiltroCliente ? ' selected' : ''}>${escapeHtml(c)}</option>`
      )
      .join('');

    $('#tab-ventas').innerHTML = `
      <div class="imp-card imp-kpi--accent" style="padding:0.9rem 1rem">
        <p style="margin:0"><strong>Flujo recomendado:</strong> registra en <button type="button" class="imp-linkish" data-goto-tab="pedidos">Pedidos</button>
        (ajustá el precio venta/u si cobraste más) y al transferir se guarda la venta con ID <strong>I00000n</strong>. Solo las ventas bajan la deuda. <strong>«Pagado»</strong> = venta.</p>
      </div>
      <div class="imp-card">
        <h2>Filtro · compras por cliente</h2>
        <p class="imp-muted">Elegí un cliente o origen, o hacé clic en una fila del historial. El total de abajo refleja el filtro.</p>
        <div class="imp-ventas-filtros" id="imp-ventas-filtros">
          <label>Cliente
            <select id="filtro-venta-cliente" class="imp-select-estado" style="max-width:16rem">
              <option value="">Todos</option>
              ${clienteOptionsHtml}
            </select>
          </label>
          <label>Origen
            <select id="filtro-venta-origen" class="imp-select-estado">
              <option value=""${ventasFiltroOrigen === '' ? ' selected' : ''}>Todos</option>
              <option value="SIE"${ventasFiltroOrigen === 'SIE' ? ' selected' : ''}>SIE (Nico)</option>
              <option value="MKOF"${ventasFiltroOrigen === 'MKOF' ? ' selected' : ''}>MKOF (Josefa)</option>
            </select>
          </label>
          <label>Buscar
            <input id="filtro-venta-texto" type="search" placeholder="código, producto…" value="${escapeHtml(ventasFiltroTexto)}" />
          </label>
          <button type="button" class="imp-btn" id="btn-filtro-venta-limpiar"${hayFiltro ? '' : ' disabled'}>Limpiar</button>
        </div>
        <p class="imp-muted" style="margin-top:0.6rem">
          Mostrando <strong>${ventasFiltradas.length}</strong> de ${ventasSorted.length} ventas ·
          total filtrado <strong>${money(totalFiltrado)}</strong>
          ${hayFiltro ? ` · global ${money(totalGlobal)}` : ''}
        </p>
      </div>
      <div class="imp-card">
        <h2>Ventas contabilizadas (${money(hayFiltro ? totalFiltrado : totalGlobal)})</h2>
        <p class="imp-muted">ID correlativo: primera = <strong>I000001 Tito MKOF</strong>. Clientes nuevos = <strong>nombre + origen</strong> (SIE = Nico · MKOF = Josefa); no se auto-agrega SIE.</p>
        <div class="imp-table-wrap">
          <table class="imp-table">
            <thead><tr><th>ID / Fecha</th><th>Cliente / detalle</th><th>Cant.</th><th>Total</th><th>Canal</th><th></th></tr></thead>
            <tbody>${rows || `<tr><td colspan="6">${hayFiltro ? 'Sin ventas con este filtro' : 'Sin ventas aún'}</td></tr>`}</tbody>
          </table>
        </div>
      </div>
      <div class="imp-card">
        <h2>Historial por cliente</h2>
        <p class="imp-muted">Clic en un cliente para filtrar sus compras. Quién compró más de una vez y el total acumulado.</p>
        <div class="imp-table-wrap">
          <table class="imp-table">
            <thead><tr><th>Cliente</th><th>Compras</th><th>IDs venta</th><th>Total</th></tr></thead>
            <tbody>${histRows || `<tr><td colspan="4">${hayFiltro ? 'Sin clientes con este filtro' : 'Sin historial aún'}</td></tr>`}</tbody>
          </table>
        </div>
      </div>
      <div class="imp-card">
        <h3>Venta directa (sin pedido)</h3>
        <p class="imp-muted">Úsalo solo si no pasaste por Pedidos. Prefiere Pedidos → Transferir a venta. Se asigna el siguiente ID I00000n.</p>
        <form class="imp-form" id="form-venta">
          <label>Fecha<input name="fecha" type="date" required value="${today()}" /></label>
          <label>Cliente<input name="cliente" required placeholder="Nombre ORIGEN · ej. Ana MKOF" /></label>
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

    const aplicarFiltrosYRender = () => {
      ventasFiltroCliente = String($('#filtro-venta-cliente')?.value || '').trim();
      ventasFiltroOrigen = String($('#filtro-venta-origen')?.value || '').trim();
      ventasFiltroTexto = String($('#filtro-venta-texto')?.value || '').trim();
      renderVentas();
    };

    $('#filtro-venta-cliente')?.addEventListener('change', aplicarFiltrosYRender);
    $('#filtro-venta-origen')?.addEventListener('change', aplicarFiltrosYRender);
    let textoTimer = null;
    $('#filtro-venta-texto')?.addEventListener('input', () => {
      clearTimeout(textoTimer);
      textoTimer = setTimeout(aplicarFiltrosYRender, 180);
    });
    $('#btn-filtro-venta-limpiar')?.addEventListener('click', () => {
      ventasFiltroCliente = '';
      ventasFiltroOrigen = '';
      ventasFiltroTexto = '';
      renderVentas();
    });
    $('#tab-ventas')?.querySelectorAll('[data-filtro-cliente]').forEach((row) => {
      row.addEventListener('click', () => {
        const c = row.getAttribute('data-filtro-cliente') || '';
        ventasFiltroCliente = ventasFiltroCliente === c ? '' : c;
        renderVentas();
      });
    });

    $('#tab-ventas')?.querySelectorAll('[data-goto-tab]').forEach((btn) => {
      btn.addEventListener('click', () => activarTab(btn.getAttribute('data-goto-tab')));
    });

    $('#form-venta').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const monto = Number(fd.get('montoNeto'));
      const desc = String(fd.get('descripcion') || '').trim();
      const cliente = String(fd.get('cliente') || '').trim();
      if (!cliente) {
        setStatus('Escribe el nombre del cliente (ej. Rebe SIE)', 'warn');
        return;
      }
      if (!desc) {
        setStatus('Escribe qué se vendió', 'warn');
        return;
      }
      if (!(monto > 0)) {
        setStatus('Falta el Total cobrado CLP (debe ser mayor a 0)', 'warn');
        return;
      }
      const codigo = nextVentaCodigo(data);
      data.ventas = data.ventas || [];
      data.ventas.push({
        id: uid('ven'),
        codigo,
        fecha: fd.get('fecha'),
        cliente,
        descripcion: desc,
        cantidad: Number(fd.get('cantidad') || 1),
        montoNeto: monto,
        montoBruto: monto,
        descuentoClp: 0,
        canal: fd.get('canal') || '',
        notas: fd.get('notas') || '',
        socioRegistro: fd.get('socioRegistro') || '',
      });
      rebuildClientesHistorial(data);
      markDirty();
      renderAll();
      setStatus(`${codigo} · ${cliente} · venta agregada — pulsa «Guardar online» para fijarla`, 'warn');
    });

    $('#tab-ventas').querySelectorAll('[data-del-venta]').forEach((btn) => {
      btn.addEventListener('click', () => {
        data.ventas = data.ventas.filter((v) => v.id !== btn.getAttribute('data-del-venta'));
        rebuildClientesHistorial(data);
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

    const imps = data.impresoras || IMPRESORAS_SEED;
    const filasImp = imps
      .map((im) => {
        const luzH = Number(im.tarifaKwhClp || p.tarifaKwhClp || 0) * Number(im.consumoImpresoraKw || 0);
        const aliasLbl =
          im.alias === 'antigua'
            ? '<div class="imp-badge">Antigua</div>'
            : im.alias === 'nueva' || im.activaDefault
              ? '<div class="imp-badge imp-badge--ok">Nueva · default</div>'
              : '';
        return `<tr>
          <td><strong>${escapeHtml(im.nombre)}</strong>
            <div class="imp-muted">${escapeHtml(im.extrusor || '')}</div>
            ${aliasLbl}
          </td>
          <td class="num">${Number(im.consumoImpresoraKw || 0).toFixed(2)} kW</td>
          <td class="num">${money(luzH)}/h</td>
          <td class="num">${Number(im.recargoFijoClp) > 0 ? money(im.recargoFijoClp) : '—'}</td>
          <td class="num">${Number(im.costoFilamentoDefaultKgClp) > 0 ? money(im.costoFilamentoDefaultKgClp) : (im.filamentoOtro ? 'definir' : '—')}</td>
          <td class="imp-muted">${escapeHtml(im.notas || '')}</td>
        </tr>`;
      })
      .join('');
    const ender = imps.find((x) => x.id === 'imp-ender-3-v2-neo');

    $('#tab-operacion').innerHTML = `
      <div class="imp-card">
        <h2>Impresoras (perfiles de costo)</h2>
        <p class="imp-muted"><strong>Nueva</strong> = Elegoo Centauri · <strong>Antigua</strong> = Ender 3 V2 Neo (Sprite Neo, otro filamento + recargo). Elegí la impresora en cada producto (Costos).</p>
        <div class="imp-table-wrap">
          <table class="imp-table">
            <thead><tr><th>Impresora</th><th>Consumo</th><th>Luz/h</th><th>Recargo</th><th>$/kg default</th><th>Notas</th></tr></thead>
            <tbody>${filasImp}</tbody>
          </table>
        </div>
        <form class="imp-form" id="form-ender-filamento" style="margin-top:0.75rem">
          <label>$ / kg filamento Ender (otro filamento)
            <input name="costoFilamentoDefaultKgClp" type="number" min="0" step="0.01" value="${num2(ender?.costoFilamentoDefaultKgClp || 0)}" placeholder="Ej. 12990" />
          </label>
          <label>Consumo Ender kW promedio
            <input name="consumoImpresoraKw" type="number" min="0" step="0.01" value="${num2(ender?.consumoImpresoraKw || 0.16)}" />
          </label>
          <label>Recargo fijo Ender CLP
            <input name="recargoFijoClp" type="number" min="0" step="1" value="${Math.round(Number(ender?.recargoFijoClp || 1000))}" />
          </label>
          <div class="imp-form-actions">
            <button class="imp-btn imp-btn--primary" type="submit">Guardar perfil Ender</button>
            <span class="imp-muted">Se usa al calcular productos con impresora Ender (si el producto no trae $/kg propio).</span>
          </div>
        </form>
      </div>
      <div class="imp-card">
        <h2>Parámetros (luz / mano de obra / empaque)</h2>
        <p class="imp-muted"><strong>${escapeHtml(p.impresoraModelo || LUZ_CHILE.impresoraModelo)}</strong> · Chile 220 V · default Centauri</p>
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
            <span class="imp-muted">Luz/hora Centauri ≈ <strong>${money(costoHoraImpresora('imp-centauri-carbon-2'))}</strong></span>
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

    $('#form-ender-filamento')?.addEventListener('submit', (e) => {
      e.preventDefault();
      asegurarImpresoras(data);
      const ender = (data.impresoras || []).find((x) => x.id === 'imp-ender-3-v2-neo');
      if (!ender) {
        setStatus('No se encontró el perfil Ender 3 V2 Neo', 'err');
        return;
      }
      const fd = new FormData(e.target);
      ender.costoFilamentoDefaultKgClp = Math.max(
        0,
        Number(fd.get('costoFilamentoDefaultKgClp')) || 0
      );
      ender.consumoImpresoraKw = Math.max(0, Number(fd.get('consumoImpresoraKw')) || 0.16);
      ender.recargoFijoClp = Math.max(0, Number(fd.get('recargoFijoClp')) || 0);
      ender.filamentoOtro = true;
      if (!ender.extrusor) ender.extrusor = 'Sprite Neo (extrusión directa)';
      markDirty();
      renderAll();
      activarTab('operacion');
      setStatus(
        `Perfil Ender 3 V2 Neo guardado · $/kg ${money(ender.costoFilamentoDefaultKgClp)} · recargo ${money(ender.recargoFijoClp)} · guarda online`,
        'warn'
      );
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
      impresoraId: String(fd.get('impresoraId') || '').trim() || impresoraDefault()?.id || '',
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
        const precioVenta = precioVentaProducto(prod, c.total);
        const impId = prod.impresoraId || impresoraDefault()?.id || 'imp-centauri-carbon-2';
        const optsImp = (data.impresoras || IMPRESORAS_SEED)
          .map((im) => {
            const tag =
              im.alias === 'antigua' ? 'Antigua · ' : im.alias === 'nueva' || im.activaDefault ? 'Nueva · ' : '';
            return `<option value="${escapeHtml(im.id)}"${im.id === impId ? ' selected' : ''}>${tag}${escapeHtml(im.nombre)}${im.extrusor ? ` · ${escapeHtml(im.extrusor)}` : ''}</option>`;
          })
          .join('');
        return `
        <div class="imp-card imp-card--prod" data-prod-id="${pid}">
          <div class="imp-prod-summary">
            <div class="imp-prod-summary__title">
              <h3 data-prod-nombre>${escapeHtml(prod.nombre)}</h3>
              <span class="imp-sku" data-prod-sku title="SKU del producto">SKU ${sku}</span>
              ${c.impresoraNombre ? `<span class="imp-muted">${escapeHtml(c.impresoraNombre)}</span>` : ''}
            </div>
            <div class="imp-prod-summary__nums">
              <span class="imp-prod-kpi">Costo <strong data-prod-costo>${money(c.total)}</strong></span>
              <span class="imp-prod-kpi">Precio venta <strong data-prod-precio>${money(precioVenta)}</strong></span>
              <button type="button" class="imp-btn imp-btn--danger imp-btn--sm" data-del-prod="${pid}">Eliminar</button>
            </div>
          </div>
          <details class="imp-prod-details">
            <summary>Parámetros y desglose</summary>
            <div class="imp-prod-details__body">
              <div class="imp-costo-live" data-costo-live="${pid}">${htmlCostoLive(c, margen, prod.precioVentaSugeridoClp)}</div>
              <form class="imp-form imp-form--prod" data-editar-prod="${pid}">
                <label>Nombre<input name="nombre" required value="${escapeHtml(prod.nombre || '')}" /></label>
                <label>SKU
                  <input name="sku" required pattern="[A-Za-z]{2,10}[0-9]{3}" title="Ej. PCGATO001, PLMONS001" value="${sku}" />
                </label>
                <label class="imp-form-span">Impresora
                  <select name="impresoraId">${optsImp}</select>
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
            </div>
          </details>
        </div>`;
      })
      .join('');

    $('#tab-costos').innerHTML = `
      <div class="imp-card">
        <h2>Costos por pieza (luz + materiales)</h2>
        <p class="imp-muted">Cada producto muestra <strong>nombre, SKU, costo y precio venta</strong>. Abrí <strong>Parámetros y desglose</strong> para editar. Luego <strong>Guardar parámetros</strong> y <strong>Guardar online</strong>.</p>
        <p class="imp-muted">$/kg filamento ref.: <strong>${money(avgFilKg)}</strong> · luz/hora ≈ <strong>${money(costoHoraImpresora())}</strong> · tarifa Chile <strong>${p.tarifaKwhClp ?? LUZ_CHILE.tarifaKwhClp}</strong> $/kWh · ${p.impresoraModelo || 'Centauri Carbon 2'} <strong>${p.consumoImpresoraKw ?? LUZ_CHILE.consumoImpresoraKw}</strong> kW</p>
      </div>
      ${blocks || '<div class="imp-card">Sin productos aún — usa la calculadora y Guarda como producto</div>'}
      <div class="imp-card">
        <h3>Calculadora rápida de pieza</h3>
        <form class="imp-form" id="form-calc-pieza">
          <label class="imp-form-span">Impresora
            <select name="impresoraId">${(data.impresoras || IMPRESORAS_SEED)
              .map((im) => {
                const tag =
                  im.alias === 'antigua'
                    ? 'Antigua · '
                    : im.alias === 'nueva' || im.activaDefault
                      ? 'Nueva · '
                      : '';
                return `<option value="${escapeHtml(im.id)}"${im.activaDefault ? ' selected' : ''}>${tag}${escapeHtml(im.nombre)}${im.extrusor ? ` · ${escapeHtml(im.extrusor)}` : ''}</option>`;
              })
              .join('')}</select>
          </label>
          <label>Modelo (g)<input name="modelo" type="number" step="0.01" value="135.55" /></label>
          <label>Soportes (g)<input name="soportes" type="number" step="0.01" value="8.43" /></label>
          <label>Purge (g)<input name="purge" type="number" step="0.01" value="0.47" /></label>
          <label>$ / kg filamento<input name="kg" type="number" value="${avgFilKg}" placeholder="0 = default impresora" /></label>
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
        impresoraId: String(fd.get('impresoraId') || '').trim() || impresoraDefault()?.id || '',
        horasImpresion: horasDesdePartes(fd.get('horasPart'), fd.get('minutosPart')),
        minutosPintado: Number(fd.get('m')),
        unidadesMetal: Number(fd.get('metal')),
        unidadesBolsa: Number(fd.get('bolsa')),
      };
      const c = costoProducto(prod);
      const sugerido = precioSugeridoDesdeCosto(c.total);
      const pctObj = Number(p.margenObjetivoPct ?? 100);
      const recargoTxt = Number(c.recargo) > 0 ? ` · Recargo ${money(c.recargo)}` : '';
      el.innerHTML = `
          Total filamento <strong>${g.toFixed(2)} g</strong>
          · Filamento ${money(c.filamento)} · Luz ${money(c.luz)}${recargoTxt} · Pintado ${money(c.pintado)} · Metal ${money(c.metal)} · Bolsa ${money(c.bolsa)}
          <br><strong>Costo unitario: ${money(c.total)}</strong> · precio sugerido (+${pctObj}% sobre costo): <strong>${money(sugerido)}</strong>
          <div class="imp-muted" style="margin-top:0.35rem">Impresora: <strong>${escapeHtml(c.impresoraNombre || '—')}</strong> · luz/h ${money(costoHoraImpresora(prod.impresoraId))}</div>`;
      form.dataset.calcSnapshot = JSON.stringify({ ...prod, sugerido, c });
    };
    $('#form-calc-pieza')?.addEventListener('input', updateCalc);
    $('#form-calc-pieza')?.addEventListener('change', updateCalc);
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
        setStatus(`Producto «${prod.nombre}» eliminado — resumen actualizado · guarda online`, 'warn');
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
        if (!leido) return;
        const c = costoProducto(leido);
        if (live) live.innerHTML = htmlCostoLive(c, margen, leido.precioVentaSugeridoClp);
        const card = form.closest('.imp-card');
        const precioShown =
          Number(leido.precioVentaSugeridoClp) > 0
            ? Number(leido.precioVentaSugeridoClp)
            : precioSugeridoDesdeCosto(c.total);
        const elCosto = card?.querySelector('[data-prod-costo]');
        const elPrecio = card?.querySelector('[data-prod-precio]');
        const elNombre = card?.querySelector('[data-prod-nombre]');
        const elSku = card?.querySelector('[data-prod-sku]');
        if (elCosto) elCosto.textContent = money(c.total);
        if (elPrecio) elPrecio.textContent = money(precioShown);
        if (elNombre && leido.nombre) elNombre.textContent = leido.nombre;
        const skuVal = String(form.querySelector('[name=sku]')?.value || '').trim().toUpperCase();
        if (elSku && skuVal) elSku.textContent = `SKU ${skuVal}`;
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
          impresoraId: leido.impresoraId,
          horasImpresion: leido.horasImpresion,
          minutosPintado: leido.minutosPintado,
          unidadesMetal: leido.unidadesMetal,
          unidadesBolsa: leido.unidadesBolsa,
          precioVentaSugeridoClp: leido.precioVentaSugeridoClp,
          costoSlicerRef: leido.costoSlicerRef,
          notas: leido.notas,
          editadoLocal: true,
        });
        // Si usa perfil Ender, el recargo vive en el perfil (evitar duplicar).
        if (prod.impresoraId === 'imp-ender-3-v2-neo' && prod.recargoImpresoraAntiguaClp != null) {
          delete prod.recargoImpresoraAntiguaClp;
        }
        markDirty();
        refreshLive();
        renderResumen();
        setStatus(`«${leido.nombre}» actualizado (${skuNuevo}) — costo ${money(costoProducto(prod).total)} · resumen sincronizado · guarda online`, 'warn');
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

  /** Campaña IG agosto — Impresoreando (ver docs/ESTRATEGIA-REDES-AGOSTO-2026.md). */
  const CAMPANA_REDES_IMP = {
    mes: 'Agosto 2026',
    canal: 'Instagram @impresoreando',
    meta: '3 posts/semana (lun · mié · vie) o stories diarias cortas. Priorizar SKUs con stock/venta real.',
    pilares: [
      { nombre: 'Producto hero', detalle: '1080×1920 — ej. Porta completos bulldog, Soporte celular, Bob' },
      { nombre: 'Prueba social', detalle: 'Pedido entregado / “se fue a…” (sin datos sensibles)' },
      { nombre: 'Proceso', detalle: 'Time-lapse impresora / filamento / mesa' },
      { nombre: 'Oferta suave', detalle: 'Precio + CTA WhatsApp' },
    ],
    semana: [
      { dia: 'Lunes', formato: 'Reel / carrusel producto', ejemplo: 'Soporte celular · Bob · Bulldog' },
      { dia: 'Miércoles', formato: 'Story proceso + CTA', ejemplo: '¿Cuál pedís?' },
      { dia: 'Viernes', formato: 'Post estático catálogo', ejemplo: '1 SKU + precio' },
    ],
    pendientes: [
      'Terminar pieza IG Porta completos bulldog 1080×1920',
      'Programar los 3 posts de la semana en Meta / Creator',
      'Rotar pilares: no solo producto, también proceso y prueba social',
    ],
    kpi: 'Posts publicados / semana + DMs o pedidos atribuidos',
  };

  function renderRedes() {
    const c = CAMPANA_REDES_IMP;
    const pilares = c.pilares
      .map(
        (p, i) =>
          `<li><span class="imp-redes-num">${i + 1}</span> <strong>${escapeHtml(p.nombre)}</strong> — ${escapeHtml(p.detalle)}</li>`
      )
      .join('');
    const semana = c.semana
      .map(
        (s) => `<tr>
        <th scope="row">${escapeHtml(s.dia)}</th>
        <td><strong>${escapeHtml(s.formato)}</strong></td>
        <td class="imp-muted">${escapeHtml(s.ejemplo)}</td>
      </tr>`
      )
      .join('');
    const pendientes = c.pendientes.map((p) => `<li>${escapeHtml(p)}</li>`).join('');

    $('#tab-redes').innerHTML = `
      <div class="imp-card imp-card--redes">
        <p class="imp-redes-kicker">Campaña · ${escapeHtml(c.mes)}</p>
        <h2>Redes sociales — ${escapeHtml(c.canal)}</h2>
        <p class="imp-redes-meta"><strong>Meta:</strong> ${escapeHtml(c.meta)}</p>
        <p class="imp-muted">Paid ads van en la pestaña <button type="button" class="imp-linkish" data-goto-tab="ads">Plan paid</button>. Aquí es el plan orgánico.</p>
      </div>

      <div class="imp-card">
        <h3>Pilares (rotar cada semana)</h3>
        <ul class="imp-list imp-redes-pilares">${pilares}</ul>
      </div>

      <div class="imp-card">
        <h3>Calendario tipo de la semana</h3>
        <div class="imp-table-wrap">
          <table class="imp-table imp-redes-semana">
            <thead><tr><th>Día</th><th>Formato</th><th>Ejemplo</th></tr></thead>
            <tbody>${semana}</tbody>
          </table>
        </div>
      </div>

      <div class="imp-card">
        <h3>Pendiente ahora</h3>
        <ul class="imp-list">${pendientes}</ul>
        <p class="imp-muted" style="margin-top:0.75rem"><strong>KPI:</strong> ${escapeHtml(c.kpi)}</p>
      </div>

      <div class="imp-card">
        <h3>Atajos</h3>
        <p class="imp-redes-atajos">
          <a class="imp-btn" href="../catalogo/">Catálogo IG</a>
          <a class="imp-btn" href="/docs/ESTRATEGIA-REDES-AGOSTO-2026.md" target="_blank" rel="noopener">Estrategia completa (TS · ECR · IMP)</a>
          <a class="imp-btn" href="https://www.instagram.com/impresoreando/" target="_blank" rel="noopener">Abrir @impresoreando</a>
        </p>
      </div>
    `;

    $('#tab-redes')?.querySelectorAll('[data-goto-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-goto-tab');
        document.querySelector(`#imp-tabs button[data-tab="${tab}"]`)?.click();
      });
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
    renderRedes();
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
    'redes',
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
    // Releer datos vivos al entrar al tab (p. ej. costos → resumen).
    if (name === 'resumen') renderResumen();
    if (name === 'costos') {
      renderCostos();
      requestAnimationFrame(() => {
        $('#form-calc-pieza')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  function tabDesdeUrl() {
    try {
      const q = new URLSearchParams(window.location.search).get('tab');
      if (q && TABS_VALIDOS.has(q)) return q;
      const hash = String(window.location.hash || '').replace(/^#/, '');
      if (hash && TABS_VALIDOS.has(hash)) return hash;
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
      impresoraId: calcDraft?.impresoraId || impresoraDefault()?.id || 'imp-centauri-carbon-2',
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
  $('#btn-modal-transferir-cerrar')?.addEventListener('click', cerrarModalTransferir);
  $('#imp-modal-transferir')?.addEventListener('click', (e) => {
    if (e.target?.id === 'imp-modal-transferir') cerrarModalTransferir();
  });
  // Delegación en captura: respaldo si el listener del re-render no corre
  document.addEventListener(
    'click',
    (e) => {
      const btn = e.target?.closest?.('[data-edit-pedido]');
      if (!btn) return;
      e.preventDefault();
      abrirModalEditarPedido(btn.getAttribute('data-edit-pedido'));
    },
    true
  );
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if ($('#imp-modal-transferir')?.classList.contains('is-open')) {
      cerrarModalTransferir();
      return;
    }
    if ($('#imp-modal-pedido')?.classList.contains('is-open')) {
      cerrarModalPedido();
      return;
    }
    if ($('#imp-modal-producto')?.classList.contains('is-open')) {
      cerrarModalProducto();
    }
  });
  window.abrirModalEditarPedido = abrirModalEditarPedido;
  window.abrirModalTransferir = abrirModalTransferir;

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
