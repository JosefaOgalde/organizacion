#!/usr/bin/env node
/**
 * Genera copys A/B/C (TXT separados) para contenidos TS 7–12
 * y los enlaza a las subtareas «Copys video».
 *
 * Regla obligatoria TS (copys video):
 * 1) Primera línea = contexto de la escena/video CON emoji(s).
 * 2) Después: producto / características (sin inventar specs).
 * 3) Emojis obligatorios en el cuerpo (no solo hashtags).
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
    hookA: 'Cuando la calle se moja… él sigue igual. 🖤☔',
    hookB: 'No es “otra zapatilla negra”. Es la Travel Trainer Black para hombre.',
    hookC: 'Checklist para él ⚡ lluvia · frío · Ortholite · negro que no falla',
    ctaA: '👉 Elige tu talla de hombre y llévatelas:',
    ctaB: '🛒 Entra y reserva tu talla de hombre ahora:',
    ctaC: '🔥 CTA: haz clic, elige tu talla de hombre y llévatelas hoy',
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
    hookA: 'Gloss negro. Invierno con lluvia. Sin miedo al charco.',
    hookB: 'Brillo que se nota. Caucho que no se rinde. Invierno lluvioso, paso firme.',
    hookC: 'Día de lluvia ≠ día en pausa.',
    /** C8: formatos visualmente distintos (no plantilla única A=B=C) */
    formatosDistintos: true,
    cortoLinea: 'Hunter Chelsea Commando · 100% waterproof · hechas a mano.',
    historiaParrafo:
      'Las Chelsea Commando negras brillantes para mujer son 100% waterproof,\nen caucho natural FSC (vegano certificado), hechas a mano, con fuelles\nelásticos, suela Hunter Original y un perfil +15 mm más alto que la\nChelsea brillante clásica — para que el gloss mande y el agua no.',
    checklistTitulo: 'Hunter Chelsea Commando · gloss negro · mujer',
    hashtagsA: '#Hunter #TrendSeeker #TrendSeekerChile #ChelseaCommando',
    hashtagsB:
      '#HunterBoots #BotasImpermeables #TrendSeekerChile #ModaLluvia #ChelseaCommando',
    hashtagsC: '#Hunter #Waterproof #TrendSeeker #BotasMujer',
  },

  {
    n: 9,
    stem: 'COPY-c09-play-bajas-rojo-mujer',
    producto: 'Botas de Agua Bajas Play Mujer Rojo',
    url: 'https://trendseeker.cl/producto/botas-de-agua-bajas-play-para-mujer-rojo/',
    sku: 'WFS2020RMA-LRD',
    bullets: [
      '100% impermeables',
      'Caucho natural de alta calidad',
      'Suela plataforma plana (confort)',
      'Caña corta al tobillo',
      'Estilo urbano / festival',
    ],
    hookA: 'Cielo gris, paso firme y las Play rojas mandando ☁️🔴☔',
    hookB: 'Primero las ves puestas… después el close-up: lateral, frontal y el detalle 👀🔴☔',
    hookC: 'Día nublado ≠ día en pausa: Play rojas en acción ☁️🔴✨',
    formatosDistintos: true,
    cortoLinea: 'Hunter Play bajas · caña corta · 100% impermeables · suela plataforma plana.',
    historiaParrafo:
      'Hunter Play bajas: silueta dinámica de caña corta (al tobillo), suela de\nplataforma más plana para confort, caucho natural de alta calidad y\n100% impermeables — ciudad, festival o el charco del camino ✨',
    checklistTitulo: 'Hunter Play bajas · mujer',
    hashtagsA: '#Hunter #TrendSeeker #TrendSeekerChile #HunterPlay',
    hashtagsB:
      '#HunterBoots #BotasImpermeables #TrendSeekerChile #ModaFestival #HunterPlay',
    hashtagsC: '#Hunter #Waterproof #TrendSeeker #BotasMujer #HunterPlay',
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

function buildVersion(c, ver, hook, cuerpoExtra, cta) {
  const bullets = c.bullets.map((b) => `✓ ${b}`).join('\n');
  const ctaLine = cta || 'Shop:';
  return `COPY VIDEO · Trendseeker · C${c.n}/12 · Versión ${ver}
Producto: ${c.producto}
SKU: ${c.sku}
Link: ${c.url}

${hook}

${cuerpoExtra}

${bullets}

${ctaLine}
${c.url}

#Hunter #TrendSeeker #TrendSeekerChile
`;
}

function buildADistinto(c) {
  const linea =
    c.cortoLinea || 'Hunter · 100% waterproof · características de ficha.';
  const tags =
    c.hashtagsA || '#Hunter #TrendSeeker #TrendSeekerChile';
  return `COPY VIDEO · Trendseeker · C${c.n}/12 · Versión A
Producto: ${c.producto}
SKU: ${c.sku}
Formato: CORTA · feed / Reels (1–3 líneas + link)
Link: ${c.url}

${c.hookA}

${linea}

👉 ${c.url}

${tags}
`;
}

function buildBDistinto(c) {
  const parrafo =
    c.historiaParrafo ||
    `${c.producto}: solo características reales de ficha. Disponibles en TrendSeeker.`;
  const tags =
    c.hashtagsB ||
    '#HunterBoots #BotasImpermeables #TrendSeekerChile';
  return `COPY VIDEO · Trendseeker · C${c.n}/12 · Versión B
Producto: ${c.producto}
SKU: ${c.sku}
Formato: HISTORIA · caption IG / TikTok (párrafo + CTA comentario)
Link: ${c.url}

${c.hookB}

${parrafo}

Disponibles en TrendSeeker 👇
${c.url}

¿Talla? Comenta y te ayudamos 💬

${tags}
`;
}

function buildCDistinto(c) {
  const bullets = c.bullets.map((b) => `✓ ${b}`).join('\n');
  const titulo = c.checklistTitulo || c.producto;
  const tags = c.hashtagsC || '#Hunter #Waterproof #TrendSeeker';
  return `COPY VIDEO · Trendseeker · C${c.n}/12 · Versión C
Producto: ${c.producto}
SKU: ${c.sku}
Formato: CHECKLIST · stories / caption con bullets + CTA
Link: ${c.url}

${c.hookC}

${titulo}
${bullets}

Shop ahora:
${c.url}

${tags}
`;
}

function buildA(c) {
  if (c.formatosDistintos) return buildADistinto(c);
  return buildVersion(
    c,
    'A',
    c.hookA,
    'Copy corta para feed / Reels — pega debajo del video o en el primer comentario.',
    c.ctaA || '👉 Elige tu talla:'
  );
}

function buildB(c) {
  if (c.formatosDistintos) return buildBDistinto(c);
  return buildVersion(
    c,
    'B',
    c.hookB,
    'Copy con más historia para IG / TikTok. Nombra solo características reales de ficha.',
    c.ctaB || '🛒 Entra y reserva la tuya:'
  );
}

function buildC(c) {
  if (c.formatosDistintos) return buildCDistinto(c);
  return buildVersion(
    c,
    'C',
    c.hookC,
    'Copy beneficio + CTA directo. Ideal stories o caption corto con checklist.',
    c.ctaC || '🔥 CTA: elige talla y llévatelas hoy'
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
