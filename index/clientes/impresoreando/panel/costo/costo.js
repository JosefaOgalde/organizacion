/* Calculadora de costo Impresoreando — misma fórmula que panel Costos */
(function () {
  const API = '/api/impresoreando';
  const COSTO_PLA_NEGRO_KG = 17986;
  const LUZ = { tarifaKwhClp: 200, consumoImpresoraKw: 0.28 };
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
    },
  ];

  const $ = (id) => document.getElementById(id);
  const money = (n) =>
    Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  const round2 = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0;
    return Math.round(x * 100) / 100;
  };
  const uid = (p) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  let data = {
    parametros: {
      tarifaKwhClp: LUZ.tarifaKwhClp,
      consumoImpresoraKw: LUZ.consumoImpresoraKw,
      valorHoraManoObraClp: 5000,
      costoAnilloMetalLlaveroClp: 50,
      costoBolsaEntregaClp: 50,
      margenObjetivoPct: 100,
    },
    impresoras: IMPRESORAS_SEED,
    productos: [],
  };

  function setStatus(msg, kind) {
    const el = $('costo-status');
    if (!el) return;
    el.textContent = msg;
    el.className = 'imp-status' + (kind ? ` is-${kind}` : '');
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function impresoraPorId(id) {
    return (data.impresoras || []).find((x) => x.id === id) || null;
  }

  function impresoraDefault() {
    const list = data.impresoras || IMPRESORAS_SEED;
    return list.find((x) => x.activaDefault) || list[0] || IMPRESORAS_SEED[0];
  }

  function impresoraDeProducto(prod) {
    const id = prod?.impresoraId || '';
    return (id && impresoraPorId(id)) || impresoraDefault();
  }

  function horasDesdePartes(horas, minutos) {
    return round2(Number(horas || 0) + Number(minutos || 0) / 60);
  }

  function costoHoraImpresora(imp) {
    const p = data.parametros || {};
    const tarifa = Number(imp?.tarifaKwhClp > 0 ? imp.tarifaKwhClp : p.tarifaKwhClp || LUZ.tarifaKwhClp);
    const consumo = Number(
      imp?.consumoImpresoraKw > 0 ? imp.consumoImpresoraKw : p.consumoImpresoraKw || LUZ.consumoImpresoraKw
    );
    return tarifa * consumo;
  }

  function costoProducto(prod) {
    const p = data.parametros || {};
    const imp = impresoraDeProducto(prod);
    const modelo = Number(prod.filamentoModeloGramos || 0);
    const soportes = Number(prod.filamentoSoportesGramos || 0);
    const purge = Number(prod.filamentoPurgeGramos || 0);
    const gramos = round2(modelo + soportes + purge) || round2(prod.filamentoGramos || 0);
    let kgFil = Number(prod.costoFilamentoKgClp || 0);
    if (!(kgFil > 0) && Number(imp?.costoFilamentoDefaultKgClp) > 0) {
      kgFil = Number(imp.costoFilamentoDefaultKgClp);
    }
    if (!(kgFil > 0)) kgFil = COSTO_PLA_NEGRO_KG;
    const filamento = round2((gramos / 1000) * kgFil);
    const luz = round2(Number(prod.horasImpresion || 0) * costoHoraImpresora(imp));
    const pintado = round2(
      (Number(prod.minutosPintado || 0) / 60) * Number(p.valorHoraManoObraClp || 0)
    );
    const metal = round2(Number(prod.unidadesMetal || 0) * Number(p.costoAnilloMetalLlaveroClp || 50));
    const bolsa = round2(Number(prod.unidadesBolsa || 0) * Number(p.costoBolsaEntregaClp || 50));
    const recargoProd = Number(prod.recargoImpresoraAntiguaClp || 0);
    const recargoPerfil = Number(imp?.recargoFijoClp || 0);
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
      gramos,
      impresoraId: imp?.id || '',
      impresoraNombre: imp?.nombre || '',
    };
  }

  function precioSugeridoDesdeCosto(costoTotal) {
    const pct = Number(data?.parametros?.margenObjetivoPct ?? 100);
    const markup = Number.isFinite(pct) ? pct / 100 : 1;
    return round2(Number(costoTotal || 0) * (1 + markup));
  }

  function kgDesdeForm(fd) {
    const preset = String(fd.get('kgPreset') || '');
    if (preset && preset !== 'otro') return Number(preset);
    return Number(fd.get('kg') || 0);
  }

  function leerProd(form) {
    const fd = new FormData(form);
    const modelo = round2(fd.get('modelo'));
    const soportes = round2(fd.get('soportes'));
    const purge = round2(fd.get('purge'));
    return {
      impresoraId: String(fd.get('impresoraId') || '').trim() || impresoraDefault().id,
      filamentoModeloGramos: modelo,
      filamentoSoportesGramos: soportes,
      filamentoPurgeGramos: purge,
      filamentoGramos: round2(modelo + soportes + purge),
      costoFilamentoKgClp: kgDesdeForm(fd),
      horasImpresion: horasDesdePartes(fd.get('horasPart'), fd.get('minutosPart')),
      minutosPintado: round2(fd.get('m')),
      unidadesMetal: round2(fd.get('metal')),
      unidadesBolsa: round2(fd.get('bolsa')),
      nombre: String(fd.get('nombre') || '').trim(),
    };
  }

  function pintarLive() {
    const form = $('form-calc-online');
    const el = $('costo-live');
    if (!form || !el) return;
    const prod = leerProd(form);
    const c = costoProducto(prod);
    const pctObj = Number(data.parametros?.margenObjetivoPct ?? 100);
    const sugerido = precioSugeridoDesdeCosto(c.total);
    const recargoHtml =
      Number(c.recargo) > 0
        ? `<div class="imp-kpi"><span>Recargo impresora</span><strong>${money(c.recargo)}</strong></div>`
        : '';
    el.innerHTML = `
      <p class="imp-muted" style="margin:0 0 0.35rem">Impresora: <strong>${escapeHtml(c.impresoraNombre || '—')}</strong> · luz/h ${money(costoHoraImpresora(impresoraDeProducto(prod)))}</p>
      <div class="imp-grid imp-grid--costo-live">
        <div class="imp-kpi"><span>Filamento (${c.gramos.toFixed(2)} g)</span><strong>${money(c.filamento)}</strong></div>
        <div class="imp-kpi"><span>Luz (impresión)</span><strong>${money(c.luz)}</strong></div>
        ${recargoHtml}
        <div class="imp-kpi"><span>Pintado / MO</span><strong>${money(c.pintado)}</strong></div>
        <div class="imp-kpi"><span>Metal / argolla</span><strong>${money(c.metal)}</strong></div>
        <div class="imp-kpi"><span>Bolsa</span><strong>${money(c.bolsa)}</strong></div>
        <div class="imp-kpi"><span>Costo unitario</span><strong>${money(c.total)}</strong></div>
        <div class="imp-kpi imp-kpi--accent"><span>Precio sugerido (+${pctObj}% sobre costo)</span><strong>${money(sugerido)}</strong></div>
      </div>`;
  }

  function skuPrefijoDesdeTexto(nombre) {
    const t = String(nombre || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (/abre\s*lata/.test(t) && /(flor|esmalte)/.test(t)) return 'ALESFL';
    if (/abre\s*lata/.test(t)) return 'ABLATA';
    if (/llavero/.test(t)) return 'LLAV';
    if (/soporte/.test(t)) return 'SOPCEL';
    const words = t
      .replace(/[^a-z0-9\s]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!words.length) return 'PROD';
    return (
      words
        .map((w) => w.slice(0, 3))
        .join('')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 8) || 'PROD'
    );
  }

  function siguienteSku(nombre, lista) {
    const pref = skuPrefijoDesdeTexto(nombre);
    const re = new RegExp(`^${pref}(\\d{3})$`, 'i');
    let max = 0;
    for (const p of lista || []) {
      const m = String(p.sku || '').match(re);
      if (m) max = Math.max(max, Number(m[1]));
    }
    return `${pref}${String(max + 1).padStart(3, '0')}`;
  }

  function llenarImpresoras() {
    const sel = $('sel-impresora');
    if (!sel) return;
    const list = data.impresoras && data.impresoras.length ? data.impresoras : IMPRESORAS_SEED;
    const current = sel.value;
    sel.innerHTML = list
      .map((im) => {
        const tag =
          im.alias === 'antigua' ? 'Antigua · ' : im.alias === 'nueva' || im.activaDefault ? 'Nueva · ' : '';
        const selAttr = (current ? im.id === current : im.activaDefault) ? ' selected' : '';
        return `<option value="${escapeHtml(im.id)}"${selAttr}>${tag}${escapeHtml(im.nombre)}${im.extrusor ? ` · ${escapeHtml(im.extrusor)}` : ''}</option>`;
      })
      .join('');
  }

  function syncKgOtro() {
    const form = $('form-calc-online');
    const wrap = $('lbl-kg-otro');
    if (!form || !wrap) return;
    const otro = form.kgPreset.value === 'otro';
    wrap.hidden = !otro;
    if (!otro) form.kg.value = form.kgPreset.value;
  }

  async function cargar() {
    setStatus('Cargando…');
    try {
      const res = await fetch(API, { cache: 'no-store' });
      if (!res.ok) throw new Error(`GET ${res.status}`);
      const json = await res.json();
      data.parametros = { ...data.parametros, ...(json.parametros || {}) };
      if (Array.isArray(json.impresoras) && json.impresoras.length) data.impresoras = json.impresoras;
      data.productos = Array.isArray(json.productos) ? json.productos : [];
      data._raw = json;
      llenarImpresoras();
      const when = json.meta?.actualizado ? new Date(json.meta.actualizado).toLocaleString('es-CL') : 'ahora';
      setStatus(`Online · ${when}`, 'ok');
    } catch (e) {
      llenarImpresoras();
      setStatus('Sin API · fórmula local (Centauri)', 'warn');
    }
    pintarLive();
  }

  async function guardarProducto() {
    const form = $('form-calc-online');
    const prod = leerProd(form);
    const nombre = prod.nombre;
    if (!nombre) {
      setStatus('Ponle un nombre para guardar', 'warn');
      form.nombre?.focus();
      return;
    }
    if (!(prod.filamentoGramos > 0)) {
      setStatus('Faltan gramos del slicer', 'warn');
      return;
    }
    setStatus('Guardando producto…', 'warn');
    const resGet = await fetch(API, { cache: 'no-store' });
    if (!resGet.ok) throw new Error(`GET ${resGet.status}`);
    const live = await resGet.json();
    live.productos = Array.isArray(live.productos) ? live.productos : [];
    const c = costoProducto(prod);
    const sku = siguienteSku(nombre, live.productos);
    const pvp = Math.round(precioSugeridoDesdeCosto(c.total) / 10) * 10;
    const item = {
      id: uid('prod'),
      sku,
      nombre,
      activo: true,
      impresoraId: prod.impresoraId,
      filamentoModeloGramos: prod.filamentoModeloGramos,
      filamentoSoportesGramos: prod.filamentoSoportesGramos,
      filamentoPurgeGramos: prod.filamentoPurgeGramos,
      filamentoGramos: prod.filamentoGramos,
      costoFilamentoKgClp: prod.costoFilamentoKgClp,
      horasImpresion: prod.horasImpresion,
      minutosPintado: prod.minutosPintado,
      unidadesMetal: prod.unidadesMetal,
      unidadesBolsa: prod.unidadesBolsa,
      precioVentaSugeridoClp: pvp,
      pendienteCosto: false,
      editadoLocal: true,
      notas: `Calculadora online: modelo ${prod.filamentoModeloGramos} g + soportes ${prod.filamentoSoportesGramos} g + purge ${prod.filamentoPurgeGramos} g = ${prod.filamentoGramos} g · ${prod.horasImpresion} h · costo ${c.total}`,
    };
    live.productos.push(item);
    live.meta = live.meta && typeof live.meta === 'object' ? live.meta : {};
    live.meta.actualizado = new Date().toISOString();
    const resPost = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(live),
    });
    if (!resPost.ok) throw new Error(await resPost.text());
    data.productos = live.productos;
    $('costo-ok').classList.add('is-on');
    $('costo-ok').textContent = `Guardado ${sku} · ${nombre} · costo ${money(c.total)} · PVP ${money(pvp)}`;
    setStatus('Guardado online ✓', 'ok');
  }

  const form = $('form-calc-online');
  form?.addEventListener('input', () => {
    syncKgOtro();
    pintarLive();
  });
  form?.addEventListener('change', () => {
    syncKgOtro();
    pintarLive();
  });
  $('btn-guardar-prod')?.addEventListener('click', () => {
    guardarProducto().catch((e) => setStatus(String(e.message || e), 'warn'));
  });

  syncKgOtro();
  cargar().finally(() => {
    setTimeout(pintarLive, 80);
    setTimeout(pintarLive, 400);
  });
})();
