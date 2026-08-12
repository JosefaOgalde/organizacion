#!/usr/bin/env node
/**
 * PED-010 / PED-012 → ventas I000022 / I000023.
 * PED-016 honguito Gianni → listo para entregar (NO venta).
 * PED-017 posalibro Harry Potter Rebe SIE → listo para entregar.
 * PED-018 porta fotos burbuja Gianni → en impresión $6.000.
 *
 *   node scripts/force-imp-ped-010-012-016-ventas.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');
const NOW = new Date().toISOString();
const FECHA = '2026-08-11';
const TRANSFERIDO_EN = '2026-08-12T00:30:00.000Z';

function rebuildClientesHistorial(d) {
  d.meta = d.meta && typeof d.meta === 'object' ? d.meta : {};
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
}

function upsertVenta(d, venta) {
  d.ventas = Array.isArray(d.ventas) ? d.ventas : [];
  const i = d.ventas.findIndex((v) => v && (v.id === venta.id || v.codigo === venta.codigo));
  if (i < 0) d.ventas.push(venta);
  else d.ventas[i] = { ...d.ventas[i], ...venta };
}

function transferir(d, spec) {
  d.pedidos = Array.isArray(d.pedidos) ? d.pedidos : [];
  let ped = d.pedidos.find((p) => p && (p.id === spec.pedId || p.numero === spec.numero));
  if (!ped) {
    ped = { id: spec.pedId, numero: spec.numero, ...spec.pedidoBase };
    d.pedidos.push(ped);
  }
  ped.estado = 'transferido';
  ped.fiado = false;
  delete ped.fechaPagoEsperada;
  ped.ventaId = spec.venId;
  ped.transferidoEn = ped.transferidoEn || TRANSFERIDO_EN;
  ped.montoBruto = spec.monto;
  ped.descuentoClp = spec.descuentoClp || 0;
  ped.montoNeto = spec.montoNeto != null ? spec.montoNeto : spec.monto;
  ped.costoTotal = spec.costoTotal;
  ped.pagoNotas = spec.pagoNotas;
  ped.notas = spec.notasPedido;
  ped.cliente = spec.cliente;
  ped.clienteNombre = spec.clienteNombre;
  ped.clienteOrigen = spec.clienteOrigen;
  ped.canal = ped.canal || 'WhatsApp';
  ped.socioRegistro = ped.socioRegistro || 'Ambos';
  if (!Array.isArray(ped.items) || !ped.items.length) ped.items = spec.items;
  else {
    ped.items = spec.items.map((it, idx) => ({ ...(ped.items[idx] || {}), ...it, estado: 'listo', listos: it.cantidad, enImpresion: 0 }));
  }
  upsertVenta(d, {
    id: spec.venId,
    codigo: spec.codigo,
    fecha: FECHA,
    cliente: spec.cliente,
    clienteNombre: spec.clienteNombre,
    clienteOrigen: spec.clienteOrigen,
    descripcion: spec.descripcion,
    cantidad: spec.items.reduce((s, it) => s + Number(it.cantidad || 0), 0),
    montoBruto: spec.monto,
    descuentoClp: spec.descuentoClp || 0,
    montoNeto: spec.montoNeto != null ? spec.montoNeto : spec.monto,
    costoTotal: spec.costoTotal,
    canal: 'WhatsApp',
    notas: spec.notasVenta,
    socioRegistro: 'Ambos',
    pedidoId: spec.pedId,
    pedidoNumero: spec.numero,
    items: spec.items.map(({ estado, listos, enImpresion, ...it }) => it),
  });
}

function apply(d) {
  d.meta = d.meta && typeof d.meta === 'object' ? d.meta : {};
  transferir(d, {
    pedId: 'ped-gianni-soporte-010',
    numero: 'PED-010',
    venId: 'ven-gianni-soporte-022',
    codigo: 'I000022',
    cliente: 'Gianni SIE',
    clienteNombre: 'Gianni',
    clienteOrigen: 'SIE',
    monto: 8000,
    costoTotal: 1367.38,
    pagoNotas: 'Pagado · transferido a venta I000022',
    notasPedido: '2× Soporte celular negro · transferido a venta I000022 · pagado $8.000 · SIE (Nico)',
    descripcion: 'PED-010 · 2× Soporte celular negro · Gianni SIE',
    notasVenta: 'Transferido desde PED-010 · fiado cobrado · 2× Soporte celular negro · pagado $8.000',
    pedidoBase: { fecha: '2026-07-28', creado: '2026-07-28T15:40:00.000Z' },
    items: [
      {
        sku: 'SOPCEL001',
        nombre: 'Soporte celular',
        cantidad: 2,
        precioUnitarioClp: 4000,
        costoUnitarioClp: 683.69,
        filamento: 'PLA+ negro',
        estado: 'listo',
        listos: 2,
        enImpresion: 0,
      },
    ],
  });
  transferir(d, {
    pedId: 'ped-marcia-limpiador-012',
    numero: 'PED-012',
    venId: 'ven-marcia-limpiador-023',
    codigo: 'I000023',
    cliente: 'Marcia SIE',
    clienteNombre: 'Marcia',
    clienteOrigen: 'SIE',
    monto: 7000,
    costoTotal: 2163.67,
    pagoNotas: 'Pagado · transferido a venta I000023',
    notasPedido: '1× Limpiador de brochas morado pastel · transferido a venta I000023 · pagado $7.000 · SIE (Nico)',
    descripcion: 'PED-012 · 1× Limpiador de brochas morado pastel · Marcia SIE',
    notasVenta: 'Transferido desde PED-012 · fiado cobrado · 1× Limpiador de brochas · pagado $7.000',
    pedidoBase: { fecha: '2026-07-31', creado: '2026-07-31T00:30:00.000Z' },
    items: [
      {
        sku: 'LMBROC001',
        nombre: 'Limpiador de brochas',
        cantidad: 1,
        precioUnitarioClp: 7000,
        costoUnitarioClp: 2163.67,
        filamento: 'PLA morado pastel',
        estado: 'listo',
        listos: 1,
        enImpresion: 0,
      },
    ],
  });
  // PED-016: listo para entregar, no venta
  d.pedidos = Array.isArray(d.pedidos) ? d.pedidos : [];
  let ped016 = d.pedidos.find((p) => p && (p.id === 'ped-gianni-honguito-016' || p.numero === 'PED-016'));
  if (!ped016) {
    ped016 = {
      id: 'ped-gianni-honguito-016',
      numero: 'PED-016',
      fecha: FECHA,
      cliente: 'Gianni SIE',
      clienteNombre: 'Gianni',
      clienteOrigen: 'SIE',
      canal: 'WhatsApp',
      creado: '2026-08-11T22:28:18.388Z',
    };
    d.pedidos.push(ped016);
  }
  ped016.cliente = 'Gianni SIE';
  ped016.clienteNombre = 'Gianni';
  ped016.clienteOrigen = 'SIE';
  ped016.estado = 'listo';
  ped016.fiado = false;
  delete ped016.fechaPagoEsperada;
  delete ped016.ventaId;
  delete ped016.transferidoEn;
  ped016.montoBruto = 16000;
  ped016.descuentoClp = 0;
  ped016.montoNeto = 16000;
  ped016.costoTotal = 9797;
  ped016.pagoNotas = '';
  ped016.notas = '1× Lámpara honguito · listo para entregar · PVP $16.000 · aún no cobrado · SIE (Nico)';
  ped016.items = [
    {
      sku: 'LMMUSH001',
      nombre: 'Lámpara honguito',
      cantidad: 1,
      precioUnitarioClp: 16000,
      costoUnitarioClp: 9797,
      filamento: 'PLA blanco',
      estado: 'listo',
      listos: 1,
      enImpresion: 0,
    },
  ];
  d.ventas = (d.ventas || []).filter(
    (v) => v && v.id !== 'ven-gianni-honguito-024' && v.codigo !== 'I000024'
  );

  d.productos = Array.isArray(d.productos) ? d.productos : [];
  const COSTO_HP = 2609.52; // 132,81 g PLA+ negro + 3 h 3 m + bolsa
  const PRECIO_HP = 9000;
  const prodHp = {
    id: 'prod-posalibro-harry-potter',
    sku: 'PSHARR001',
    nombre: 'Posalibro Harry Potter',
    activo: true,
    impresoraId: 'imp-centauri-carbon-2',
    filamentoModeloGramos: 119.68,
    filamentoSoportesGramos: 12.67,
    filamentoPurgeGramos: 0.46,
    filamentoMetros: 44.17,
    filamentoGramos: 132.81,
    costoFilamentoKgClp: 17986,
    horasImpresion: 3.05,
    minutosPintado: 0,
    unidadesMetal: 0,
    unidadesBolsa: 1,
    precioVentaSugeridoClp: PRECIO_HP,
    costoSlicerRef: 2.66,
    pendienteCosto: false,
    aliasSku: ['ALHARR001', 'APHARR001'],
    notas:
      'Slicer 1 ud (PLA+ negro primeros rollos): modelo 119,68 g (39,80 m) + soportes 12,36 g + interfaz 0,31 g + resto/falda 0,46 g = 132,81 g · 44,17 m · 3 h 3 m · coste slicer 2,66. PLA+ negro $17.986/kg · Elegoo. Fil ~$2.389 + luz ~$171 + bolsa $50 = costo ~$2.610 · PVP $9.000. PED-017 Rebe SIE · listo para entregar.',
  };
  const pi = d.productos.findIndex((p) => p && (p.id === prodHp.id || p.sku === 'PSHARR001'));
  if (pi < 0) d.productos.push(prodHp);
  else {
    const prev = d.productos[pi];
    d.productos[pi] = prev.editadoLocal
      ? { ...prev, sku: prodHp.sku, nombre: prodHp.nombre, precioVentaSugeridoClp: PRECIO_HP }
      : { ...prev, ...prodHp };
  }

  let ped017 = d.pedidos.find(
    (p) =>
      p &&
      (p.id === 'ped-rebe-posalibro-017' ||
        p.id === 'ped-gianni-posalibro-017' ||
        p.numero === 'PED-017')
  );
  if (!ped017) {
    ped017 = { id: 'ped-rebe-posalibro-017', numero: 'PED-017', creado: NOW };
    d.pedidos.push(ped017);
  }
  Object.assign(ped017, {
    id: 'ped-rebe-posalibro-017',
    fecha: FECHA,
    cliente: 'Rebe SIE',
    clienteNombre: 'Rebe',
    clienteOrigen: 'SIE',
    canal: 'WhatsApp',
    estado: 'listo',
    fiado: false,
    ventaId: null,
    montoBruto: PRECIO_HP,
    descuentoClp: 0,
    montoNeto: PRECIO_HP,
    costoTotal: COSTO_HP,
    pagoNotas: '',
    notas: '1× Posalibro Harry Potter · listo para entregar · PVP $9.000 · costo ~$2.610 · aún no cobrado · Rebe SIE (Nico)',
    socioRegistro: 'Ambos',
    items: [
      {
        sku: 'PSHARR001',
        nombre: 'Posalibro Harry Potter',
        cantidad: 1,
        precioUnitarioClp: PRECIO_HP,
        costoUnitarioClp: COSTO_HP,
        filamento: 'PLA+ negro',
        estado: 'listo',
        listos: 1,
        enImpresion: 0,
      },
    ],
  });
  delete ped017.fechaPagoEsperada;
  delete ped017.transferidoEn;

  const COSTO_BURB = 3203.95;
  const PRECIO_BURB = 6000;
  const prodBurb = {
    id: 'prod-porta-fotos-burbuja',
    sku: 'PFBURB001',
    nombre: 'Porta fotos burbuja',
    activo: true,
    impresoraId: 'imp-centauri-carbon-2',
    filamentoModeloGramos: 148.24,
    filamentoSoportesGramos: 12.63,
    filamentoPurgeGramos: 0.94,
    filamentoMetros: 53.82,
    filamentoGramos: 161.81,
    costoFilamentoKgClp: 17986,
    horasImpresion: 4.35,
    minutosPintado: 0,
    unidadesMetal: 0,
    unidadesBolsa: 1,
    precioVentaSugeridoClp: PRECIO_BURB,
    costoSlicerRef: 3.24,
    pendienteCosto: false,
    aliasSku: ['PTFBUR001', 'PFOTBUR001'],
    notas:
      'Slicer 2 piezas (PLA+ negro $17.986/kg · Elegoo): burbujas 68,98 g (22,94 m · 2 h 14 m · coste 1,38) + base 92,83 g (30,88 m · 2 h 7 m · coste 1,86) = 161,81 g · 53,82 m · 4 h 21 m. Fil ~$2.910 + luz ~$244 + bolsa $50 = costo ~$3.204 · PVP $6.000. PED-018 Gianni SIE · en impresión.',
  };
  const pb = d.productos.findIndex((p) => p && (p.id === prodBurb.id || p.sku === 'PFBURB001'));
  if (pb < 0) d.productos.push(prodBurb);
  else if (!d.productos[pb].editadoLocal) d.productos[pb] = { ...d.productos[pb], ...prodBurb };
  else d.productos[pb].precioVentaSugeridoClp = PRECIO_BURB;

  let ped018 = d.pedidos.find((p) => p && (p.id === 'ped-gianni-porta-fotos-018' || p.numero === 'PED-018'));
  if (!ped018) {
    ped018 = { id: 'ped-gianni-porta-fotos-018', numero: 'PED-018', creado: NOW };
    d.pedidos.push(ped018);
  }
  Object.assign(ped018, {
    fecha: FECHA,
    cliente: 'Gianni SIE',
    clienteNombre: 'Gianni',
    clienteOrigen: 'SIE',
    canal: 'WhatsApp',
    estado: 'en_impresion',
    fiado: false,
    ventaId: null,
    montoBruto: PRECIO_BURB,
    descuentoClp: 0,
    montoNeto: PRECIO_BURB,
    costoTotal: COSTO_BURB,
    pagoNotas: '',
    notas: '1× Porta fotos burbuja · en impresión · PVP $6.000 · costo ~$3.204 · SIE (Nico)',
    socioRegistro: 'Ambos',
    items: [
      {
        sku: 'PFBURB001',
        nombre: 'Porta fotos burbuja',
        cantidad: 1,
        precioUnitarioClp: PRECIO_BURB,
        costoUnitarioClp: COSTO_BURB,
        filamento: 'PLA+ negro',
        estado: 'en_impresion',
        listos: 0,
        enImpresion: 1,
      },
    ],
  });
  delete ped018.fechaPagoEsperada;
  delete ped018.transferidoEn;

  const maxVen = (d.ventas || []).reduce((m, v) => {
    const n = Number(String(v.codigo || '').replace(/^I0*/, '') || 0);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  d.meta.ventaSeq = Math.max(maxVen, 23);
  if (Number(d.meta.pedidoSeq || 0) < 18) d.meta.pedidoSeq = 18;
  d.meta.actualizado = NOW;
  rebuildClientesHistorial(d);
  return d;
}

function writeJson(file, d) {
  fs.writeFileSync(file, JSON.stringify(d, null, 2) + '\n', 'utf8');
}

function pendientes(d) {
  return (d.pedidos || []).filter(
    (p) => p && !['transferido', 'anulado'].includes(String(p.estado || '').toLowerCase())
  );
}

function main() {
  if (!fs.existsSync(SEED)) {
    console.error('Falta seed');
    process.exit(1);
  }
  const seed = apply(JSON.parse(fs.readFileSync(SEED, 'utf8')));
  writeJson(SEED, seed);

  if (!fs.existsSync(LIVE)) {
    writeJson(LIVE, seed);
    console.log('Creado live desde seed');
  } else {
    const live = apply(JSON.parse(fs.readFileSync(LIVE, 'utf8')));
    writeJson(LIVE, live);
  }

  const live = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  const activos = pendientes(live);
  const ventas = (live.ventas || []).filter((v) => ['I000022', 'I000023', 'I000024'].includes(v.codigo));
  const total = (live.ventas || []).reduce((s, v) => s + Number(v.montoNeto || 0), 0);
  const p16 = (live.pedidos || []).find((p) => p.numero === 'PED-016');
  const p17 = (live.pedidos || []).find((p) => p.numero === 'PED-017');
  const p18 = (live.pedidos || []).find((p) => p.numero === 'PED-018');
  console.log(
    'OK · ventas',
    ventas.map((v) => `${v.codigo} $${v.montoNeto}`).join(' · ') || '(sin 022-024 extra)',
    `· total $${total}`,
    `· PED-016 ${p16?.estado} · PED-017 ${p17?.estado} · PED-018 ${p18?.estado}`,
    `· activos ${activos.map((p) => `${p.numero} ${p.estado}`).join(', ')}`
  );
  if (p16?.estado === 'transferido' || ventas.some((v) => v.codigo === 'I000024')) {
    console.error('ERROR: honguito sigue en venta');
    process.exit(1);
  }
}

main();
