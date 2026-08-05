#!/usr/bin/env node
/**
 * Agencia Mel — cliente activo con proyectos Secuoyas (cotización enviada)
 * y Tronwell (desactivado / cerrado).
 *
 *   node scripts/add-agencia-mel.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILES = [
  path.join(ROOT, 'data', 'organizacion-live.json'),
  path.join(ROOT, 'data', 'organizacion-respaldo-2026-07-31.json'),
];

const MEL = {
  id: 'cli-agencia-mel',
  nombre: 'Agencia Mel',
  abrev: 'MEL',
  tipo: 'freelance',
  color: 'menta',
  activo: true,
  roles: [
    {
      id: 'rol-mel-web',
      nombre: 'Desarrollo web',
      abrev: 'WEB',
      funciones: 'Wireframes\nLandings\nResponsive\nSoporte post-entrega',
      tareasAlMes: 'Según proyecto',
      plazosEntregables: 'Por cotización',
    },
    {
      id: 'rol-mel-contenido',
      nombre: 'Contenidos / SEO',
      abrev: 'SEO',
      funciones: 'Redacción SEO\nMeta data\nEstrategia de contenidos',
      tareasAlMes: 'Según proyecto',
      plazosEntregables: 'Por cotización',
    },
  ],
  agente: {
    nombre: 'Agente Agencia Mel',
    emoji: '🌿',
    especialidad: 'Web + contenidos para proyectos de agencia',
    instrucciones:
      'Eres el asistente de Agencia Mel. Ayudas con cotizaciones, landings (Secuoyas.cl), desarrollo web responsive y contenidos SEO. Tronwell está cerrado/desactivado.',
  },
  manualMarca: { texto: '', archivos: [] },
  metas: 'Secuoyas.cl — cotización enviada 4 ago 2026 · Total $790.000 CLP.',
  contextoPrompt:
    'Proyectos: Secuoyas.cl (activo, cotización enviada) · Tronwell (cerrado, desactivado).\n' +
    'Cotización Secuoyas: desarrollo $440.000 (6×$20k wireframes + 6×$45k landings + $30k soporte + $20k manual) · contenido $300.000 · estrategia $50.000.',
  ficha: {
    contacto: 'dario.fdez1998@gmail.com · josefa.ogalde@gmail.com',
    links: 'https://secuoyas.cl/\nLanding: /index/clientes/agencia-mel/\nCotización: /index/clientes/agencia-mel/secuoyas/',
    notas:
      'Cotización Secuoyas enviada 4 ago 2026.\n' +
      'Desarrollo $440.000 · Contenido $300.000 · Estrategia $50.000 · Total $790.000.\n' +
      'Tronwell quedó OK → desactivado bajo esta agencia.',
    seccionesExtra: [
      {
        id: 'mel-sec-cotizacion-secuoyas',
        titulo: 'Cotización Secuoyas.cl (enviada)',
        contenido:
          'Total: $790.000 CLP\n' +
          'Desarrollo: $120.000 (wireframes 6×$20k) + $270.000 (landings 6×$45k) + $30.000 (soporte 15 días) + $20.000 (manual) = $440.000\n' +
          'Contenido: $300.000\n' +
          'Estrategia: $50.000\n' +
          'Landings: Home · Categorías · Recursos · Nosotros · Noticias · Contacto',
      },
    ],
    documentos: [],
  },
};

function upsertCliente(data, cliente) {
  data.clientes = Array.isArray(data.clientes) ? data.clientes : [];
  const i = data.clientes.findIndex((c) => c.id === cliente.id);
  if (i >= 0) {
    data.clientes[i] = { ...data.clientes[i], ...cliente };
    return 'upd';
  }
  data.clientes.push(cliente);
  return 'add';
}

function desactivarTronwell(data) {
  data.clientes = Array.isArray(data.clientes) ? data.clientes : [];
  const i = data.clientes.findIndex((c) => c.id === 'cli-tronwell');
  if (i < 0) return 'skip';
  data.clientes[i] = {
    ...data.clientes[i],
    activo: false,
    ficha: {
      ...(data.clientes[i].ficha || {}),
      notas:
        ((data.clientes[i].ficha && data.clientes[i].ficha.notas) || '') +
        (String((data.clientes[i].ficha && data.clientes[i].ficha.notas) || '').includes('Agencia Mel')
          ? ''
          : '\nCerrado OK · desactivado bajo Agencia Mel (ago 2026).'),
    },
  };
  return 'off';
}

let touched = 0;
for (const file of FILES) {
  if (!fs.existsSync(file)) {
    console.warn('Skip:', path.basename(file));
    continue;
  }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const opMel = upsertCliente(data, MEL);
  const opTw = desactivarTronwell(data);
  data.respaldoActualizado = new Date().toISOString().slice(0, 10);
  if (!data.meta || typeof data.meta !== 'object') data.meta = {};
  data.meta.actualizado = new Date().toISOString();
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  touched += 1;
  console.log(path.basename(file), 'mel=' + opMel, 'tronwell=' + opTw);
}

console.log(`OK (${touched} archivo/s) · Agencia Mel + Tronwell desactivado`);
console.log('Portal: http://127.0.0.1:8000/index/clientes/agencia-mel/');
console.log('Secuoyas: http://127.0.0.1:8000/index/clientes/agencia-mel/secuoyas/');
