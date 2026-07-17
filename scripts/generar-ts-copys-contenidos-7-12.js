#!/usr/bin/env node
/**
 * Genera copys A/B/C (TXT separados) para contenidos TS 7–12
 * y los enlaza a las subtareas «Copys video».
 *
 *   node scripts/generar-ts-copys-contenidos-7-12.js
 *   FORCE=1 node scripts/generar-ts-copys-contenidos-7-12.js   # sobrescribe
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COPYS_DIR = path.join(ROOT, 'index', 'clientes', 'trendseeker', 'copys');
const LIVE = path.join(ROOT, 'data', 'organizacion-live.json');

const CONTENIDOS = [
  {
    n: 7,
    stem: 'COPY-c07-travel-trainer-black-hombre',
    producto: 'Zapatilla Travel Trainer Black Hombre',
    url: 'https://trendseeker.cl/producto/zapatilla-travel-trainer-black-hombre/',
    sku: 'MFK1000PTP-BLK',
    bullets: [
      '100% impermeables con membrana interna',
      'Aisladas hasta -5°C',
      'Nylon reciclado, neopreno y malla',
      'Suela caucho FSC + Ortholite',
      'Detalles reflectantes · logo tricolor Hunter',
    ],
    hookA: 'Negro que rinde bajo la lluvia ☔',
    hookB: 'Travel Trainer Black: el día sigue aunque caiga agua.',
    hookC: 'Impermeable · aislada · lista para la ciudad.',
  },
  {
    n: 8,
    stem: 'COPY-c08-chelsea-commando-negras-mujer',
    producto: 'Botas Chelsea Commando Negras Brillantes Mujer',
    url: 'https://trendseeker.cl/producto/botas-chelsea-commando-negras-brillantes-para-mujer/',
    sku: 'WFS1018RGL-BLK',
    bullets: [
      '100% waterproof',
      'Caucho natural FSC · vegano certificado',
      'Hechas a mano',
      'Fuelles elásticos · suela Original',
      'Perfil +15 mm vs Chelsea clásica',
    ],
    hookA: 'Brillo militar. Paso seguro. ✨',
    hookB: 'Chelsea Commando: waterproof con actitud.',
    hookC: 'Gloss negro · hechas a mano · 100% waterproof.',
  },
  {
    n: 9,
    stem: 'COPY-c09-play-bajas-rojo-mujer',
    producto: 'Botas de Agua Bajas Play Mujer Rojo',
    url: 'https://trendseeker.cl/producto/botas-de-agua-bajas-play-para-mujer-rojo/',
    sku: 'WFS2020RMA-LRD',
    bullets: [
      '100% impermeables',
      'Caucho natural',
      'Suela plataforma plana',
      'Caña corta (tobillo)',
      'Estilo urbano / festival',
    ],
    hookA: 'Rojo Play. Caña baja. Sin miedo al charco 🔴',
    hookB: 'Hunter Play bajas: impermeable con vibe festival.',
    hookC: 'Rojo · caña corta · plataforma plana · 100% waterproof.',
  },
  {
    n: 10,
    stem: 'COPY-c10-original-ninos',
    producto: 'Botas de Agua Original para Niños',
    url: 'https://trendseeker.cl/producto/botas-de-agua-original-para-ninos/',
    sku: 'JFT6000RMA-BLK',
    bullets: [
      'Para kids ~5–11 años (31–37)',
      '100% impermeables',
      'Caucho natural mate · hechas a mano',
      'Suela Hunter Original',
      'Parches reflectantes',
    ],
    hookA: 'Charcos autorizados splash ☔🧒',
    hookB: 'Original kids: la clásica Hunter, a su medida.',
    hookC: 'Impermeables · reflectantes · hechas a mano.',
  },
  {
    n: 11,
    stem: 'COPY-c11-play-altas-shearling-white-mujer',
    producto: 'Botas Play Altas Shearling White Mujer',
    url: 'https://trendseeker.cl/producto/botas-play-altas-con-forro-de-shearling-white-para-mujer/',
    sku: 'WFT2235RMA-WHW',
    bullets: [
      'Vegano certificado · impermeables',
      'Forro shearling vegano',
      'Aisladas hasta -5°C',
      'Suela plana cómoda',
      'Hechas a mano en caucho natural',
    ],
    hookA: 'Blanco cozy. Frío afuera, abrigo adentro 🤍',
    hookB: 'Play altas shearling: waterproof con forro suave.',
    hookC: 'Shearling vegano · -5°C · suela plana · white.',
  },
  {
    n: 12,
    stem: 'COPY-c12-original-ninos-rosado-brillante',
    producto: 'Botas de Agua Original Niños Rosado Brillante',
    url: 'https://trendseeker.cl/producto/botas-de-agua-original-para-ninos-rosado-brillante/',
    sku: 'JFT6000RMA-RBP',
    bullets: [
      'Rosado brillante · kids 5–11 (31–37)',
      '100% impermeables',
      'Caucho natural · hechas a mano',
      'Suela Original',
      'Parches reflectantes',
    ],
    hookA: 'Rosado brillante para saltar charcos 💗☔',
    hookB: 'Original kids en gloss rosa: impermeable y visible.',
    hookC: 'Rosa gloss · reflectantes · 100% waterproof.',
  },
];

function buildVersion(c, ver, hook, cuerpoExtra) {
  const bullets = c.bullets.map((b) => `✓ ${b}`).join('\n');
  return `COPY VIDEO · Trendseeker · C${c.n}/12 · Versión ${ver}
Producto: ${c.producto}
SKU: ${c.sku}
Link: ${c.url}

${hook}

${cuerpoExtra}

${bullets}

Shop:
${c.url}

#Hunter #TrendSeeker #TrendSeekerChile
`;
}

function buildA(c) {
  return buildVersion(
    c,
    'A',
    c.hookA,
    'Copy corta para feed / Reels — pega debajo del video o en el primer comentario.'
  );
}

function buildB(c) {
  return buildVersion(
    c,
    'B',
    c.hookB,
    'Copy con más historia para IG / TikTok. Nombra solo características reales de ficha.'
  );
}

function buildC(c) {
  return buildVersion(
    c,
    'C',
    c.hookC,
    'Copy beneficio + CTA directo. Ideal stories o caption corto con checklist.'
  );
}

function escribirCopys() {
  fs.mkdirSync(COPYS_DIR, { recursive: true });
  const force = process.env.FORCE === '1';
  const items = [];
  for (const c of CONTENIDOS) {
    const builders = { A: buildA, B: buildB, C: buildC };
    const rels = {};
    for (const v of ['A', 'B', 'C']) {
      const name = `${c.stem}-${v}.txt`;
      const abs = path.join(COPYS_DIR, name);
      const rel = `index/clientes/trendseeker/copys/${name}`;
      if (!force && fs.existsSync(abs)) {
        console.log('TXT (conservado):', rel);
      } else {
        fs.writeFileSync(abs, builders[v](c), 'utf8');
        console.log('TXT:', rel);
      }
      rels[v] = rel;
    }
    items.push({ n: c.n, rels, url: c.url, producto: c.producto });
  }
  return items;
}

function actualizarTareas(items) {
  if (!fs.existsSync(LIVE)) {
    console.warn('Sin organizacion-live.json — solo se escribieron TXT.');
    return;
  }
  const data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
  for (const it of items) {
    const task = data.tareas.find((t) => t.id === `tarea-ts-contenido-${it.n}-de-12-copy`);
    if (!task) {
      console.warn('No existe subtarea copy C' + it.n);
      continue;
    }
    task.tipoEntregable = 'copys-txt';
    task.entregableArchivo = it.rels.A;
    task.entregableArchivosCopy = it.rels;
    task.productoUrl = it.url;
    task.notas =
      `Copys video C${it.n}/12 · tres TXT (A/B/C). Producto: ${it.producto}. ` +
      `Edita, guarda y copia cada versión. Link: ${it.url}`;
    console.log('Tarea copy actualizada:', task.titulo, '→ A/B/C');
  }
  data.respaldoActualizado = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

if (require.main === module) {
  const items = escribirCopys();
  actualizarTareas(items);
  console.log('Listo. Abre la subtarea Copys video y verás A/B/C editables.');
}

module.exports = { CONTENIDOS, escribirCopys, actualizarTareas };
