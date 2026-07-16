#!/usr/bin/env node
/**
 * Genera prompts Gemini VIDEO listos para pegar (C7–C12) según ficha/género
 * y los asocia a las subtareas de prompt.
 *
 *   node scripts/generar-ts-prompts-contenidos-7-12.js
 * (también se llama desde add-ts-contenidos-7-12.js)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROMPTS_DIR = path.join(ROOT, 'index', 'clientes', 'trendseeker', 'prompts');
const LIVE = path.join(ROOT, 'data', 'organizacion-live.json');
const INDICE = path.join(PROMPTS_DIR, 'indice.json');

const CONTENIDOS = [
  {
    n: 7,
    genero: 'hombre',
    producto: 'Zapatilla Travel Trainer Black Hombre',
    url: 'https://trendseeker.cl/producto/zapatilla-travel-trainer-black-hombre/',
    sku: 'MFK1000PTP-BLK',
    archivo: 'PROMPT-c07-travel-trainer-black-hombre.txt',
    specs: [
      'Hunter Travel Trainer negras para hombre',
      '100% impermeables con membrana interna',
      'Aisladas hasta -5°C',
      'Nylon reciclado, neopreno y malla transpirable',
      'Suela de caucho FSC con agarre',
      'Entresuela EVA reciclada y plantilla Ortholite',
      'Línea protectora TPU contra lluvia',
      'Detalles reflectantes y lengüeta con logo tricolor Hunter',
    ],
    escenaA:
      'un hombre camina con paso seguro por una calle urbana mojada / ambiente fresco; zapatillas negras Hunter Travel Trainer como héroe del plano',
    escenaB:
      'hombre en movimiento (viaje/ciudad) cruzando un charco o piso mojado; se nota impermeabilidad y agarre',
    escenaC:
      'close-up de la Travel Trainer negra: textura, suela FSC, detalle reflectante y logo tricolor en la lengüeta',
  },
  {
    n: 8,
    genero: 'mujer',
    producto: 'Botas Chelsea Commando Negras Brillantes Mujer',
    url: 'https://trendseeker.cl/producto/botas-chelsea-commando-negras-brillantes-para-mujer/',
    sku: 'WFS1018RGL-BLK',
    archivo: 'PROMPT-c08-chelsea-commando-negras-mujer.txt',
    specs: [
      'Hunter Chelsea Commando / militar negras brillantes para mujer',
      '100% waterproof',
      'Caucho natural vulcanizado con certificado FSC (vegano certificado)',
      'Hechas a mano',
      'Forro y plantilla de poliéster reciclado',
      'Suela moldeada con patrón Hunter Original',
      'Fuelles laterales elásticos y lengüeta de nylon',
      'Perfil más alto (+15 mm) que la Chelsea brillante clásica',
    ],
    escenaA:
      'una mujer camina con estilo por calle urbana; botas Chelsea negras brillantes Hunter en primer plano, acabado gloss fiel a las fotos',
    escenaB:
      'mujer a mitad de zancada; se destaca el brillo del caucho, fuelles elásticos y suela Original en piso mojado',
    escenaC:
      'close-up del brillo, fuelle lateral, plantilla/forro y suela Hunter; sin rediseñar la silueta Commando',
  },
  {
    n: 9,
    genero: 'mujer',
    producto: 'Botas de Agua Bajas Play Mujer Rojo',
    url: 'https://trendseeker.cl/producto/botas-de-agua-bajas-play-para-mujer-rojo/',
    sku: 'WFS2020RMA-LRD',
    archivo: 'PROMPT-c09-play-bajas-rojo-mujer.txt',
    specs: [
      'Hunter Play bajas para mujer en rojo',
      '100% impermeables',
      'Caucho natural de alta calidad',
      'Suela de plataforma más plana (confort)',
      'Caña corta que roza la parte superior del tobillo',
      'Silueta dinámica estilo urbano / festival',
    ],
    escenaA:
      'una mujer camina en ciudad o ambiente festival con botas Play bajas rojas Hunter; caña corta y suela plana visibles',
    escenaB:
      'mujer cruzando un charco con seguridad; rojo fiel a las fotos, impermeabilidad y confort de la plataforma plana',
    escenaC:
      'close-up de las Play bajas rojas: textura del caucho, tobillo, suela plana Hunter',
  },
  {
    n: 10,
    genero: 'ninos',
    producto: 'Botas de Agua Original para Niños',
    url: 'https://trendseeker.cl/producto/botas-de-agua-original-para-ninos/',
    sku: 'JFT6000RMA-BLK',
    archivo: 'PROMPT-c10-original-ninos.txt',
    specs: [
      'Hunter Original para niños (aprox. 5–11 años, tallas 31–37)',
      'Versión reducida de la bota alta Original',
      'Completamente impermeables',
      'Fabricación artesanal en caucho vulcanizado natural (acabado mate)',
      'Forro de poliéster',
      'Suela de goma con dibujo Hunter Original',
      'Parches reflectantes para mayor visibilidad',
    ],
    escenaA:
      'un niño o niña (edad escolar) salta o camina en un charco / patio; botas Original kids Hunter mate con parches reflectantes visibles',
    escenaB:
      'niño explorando (patio o bosque ligero) con botas impermeables; se nota agarre y reflectantes un instante',
    escenaC:
      'close-up de botas kids: caucho mate, parche reflectante, suela Original; sin tipografía inventada',
  },
  {
    n: 11,
    genero: 'mujer',
    producto: 'Botas Play Altas Shearling White Mujer',
    url: 'https://trendseeker.cl/producto/botas-play-altas-con-forro-de-shearling-white-para-mujer/',
    sku: 'WFT2235RMA-WHW',
    archivo: 'PROMPT-c11-play-altas-shearling-white-mujer.txt',
    specs: [
      'Hunter Play altas aislantes Shearling White para mujer',
      'Vegano certificado e impermeables',
      'Hechas a mano en caucho natural',
      'Forro tipo borrego vegano (piel sintética de poliéster)',
      'Plantilla de aislamiento térmico',
      'Suela más plana para comodidad',
      'Aisladas hasta -5°C',
      'Lengüeta para facilitar la entrada del pie',
    ],
    escenaA:
      'una mujer en clima frío / mañana fresca con botas Play altas blancas shearling Hunter; se intuye el forro cozy sin inventar logos',
    escenaB:
      'mujer caminando en entorno invernal urbano; destaca impermeabilidad, forro shearling vegano y suela plana',
    escenaC:
      'close-up del blanco, textura del forro shearling, lengüeta de entrada y suela plana',
  },
  {
    n: 12,
    genero: 'ninos',
    producto: 'Botas de Agua Original Niños Rosado Brillante',
    url: 'https://trendseeker.cl/producto/botas-de-agua-original-para-ninos-rosado-brillante/',
    sku: 'JFT6000RMA-RBP',
    archivo: 'PROMPT-c12-original-ninos-rosado-brillante.txt',
    specs: [
      'Hunter Original para niños en rosado brillante',
      'Edad aprox. 5–11 años (tallas 31–37)',
      'Completamente impermeables',
      'Fabricación artesanal en caucho natural',
      'Forro de poliéster',
      'Suela Hunter Original',
      'Parches reflectantes para visibilidad',
      'Acabado brillante / color rosado fiel a las fotos de producto',
    ],
    escenaA:
      'una niña (edad escolar) juega en charcos con botas Original kids rosado brillante Hunter; color y brillo fieles a las fotos',
    escenaB:
      'niña caminando con alegría bajo lluvia ligera; impermeabilidad, reflectantes y suela Original',
    escenaC:
      'close-up del rosado brillante, parche reflectante y suela; sin rediseñar el producto',
  },
];

function etiquetaGenero(g) {
  if (g === 'hombre') return 'HOMBRE (adulto)';
  if (g === 'mujer') return 'MUJER (adulta)';
  return 'NIÑOS / NIÑAS (aprox. 5–11 años)';
}

function vestuario(g) {
  if (g === 'hombre') {
    return `- Hombre adulto
- Pantalón (jeans o cargo) que no tape por completo el calzado: debe verse la zapatilla/bota
- Sin tipografía ni logos inventados fuera de los del producto real`;
  }
  if (g === 'mujer') {
    return `- Mujer adulta
- Outfit coherente (jeans, falda con medias o pantalón) que deje ver el calzado Hunter
- Si son botas de agua: preferible que pantalón/jeans vayan metidos o no oculten la caña
- Sin tipografía ni logos inventados fuera de los del producto real`;
  }
  return `- Niño o niña de edad escolar (5–11), aspecto natural
- Ropa de juego / lluvia infantil (no disfraz)
- Priorizar seguridad y juego (charcos), no dramatizar
- Sin tipografía ni logos inventados fuera de los del producto real`;
}

function buildPrompt(c) {
  const specs = c.specs.map((s) => `- ${s}`).join('\n');
  return `PROMPTS GEMINI VIDEO — Trendseeker · Contenido ${c.n}/12
Herramienta fija Trendseeker: Google Gemini en modo VIDEO (no imagen fija; no Midjourney).
Enfoque: el PRODUCTO es el héroe. Respetar al máximo las fotos de producto adjuntas.

PRODUCTO: ${c.producto}
SKU: ${c.sku}
Link: ${c.url}
Público / género del producto: ${etiquetaGenero(c.genero)}

CARACTERÍSTICAS (ficha — usar en el prompt, no inventar otras):
${specs}

VESTUARIO / MODELO:
${vestuario(c.genero)}

============================================================
CÓMO USAR EN GEMINI (VIDEO)
============================================================
1) Abre Gemini en generación de VIDEO.
2) Sube primero las FOTOS DE PRODUCTO reales (referencia obligatoria).
3) Pega UNA versión (A, B o C) en el mismo mensaje.
4) Si cambia el diseño, reitera: “replica exactamente el calzado de las fotos”.

============================================================
VERSIÓN A — Video producto héroe (recomendado)
============================================================

Genera un VIDEO publicitario fotorrealista corto. Usa las fotos de producto adjuntas como referencia obligatoria del calzado Hunter (${c.producto}). No rediseñes el producto: misma silueta, mismo color, mismos detalles.

Acción: ${c.escenaA}.

Cámara: ángulo que priorice el calzado (a menudo bajo o a la altura del pie), nítido, product-first. Muestra cualidades reales de la ficha (impermeabilidad, agarre, textura, detalles reflectantes o forro si aplica). Sin tipografía ni logos inventados. Ritmo cinematográfico comercial corto.

============================================================
VERSIÓN B — Video cualidades en movimiento
============================================================

Crea un VIDEO comercial basándote estrictamente en las fotos de producto. ${c.escenaB}.

Destaca en movimiento las características reales: ${c.specs.slice(0, 4).join('; ')}. El calzado domina el cuadro; fondo coherente y secundario. No alterar el diseño.

============================================================
VERSIÓN C — Video close-up de detalle
============================================================

Genera un VIDEO corto tipo close-up publicitario. ${c.escenaC}.

Enfoque en textura, color fiel a las refs, detalles de ficha y contacto con el piso. Cámara lenta, product-first. Sin rediseñar el calzado.

============================================================
NOTAS
============================================================
- Trendseeker = Gemini VIDEO. ECR portadas = Midjourney.
- Primero fotos de producto, después el texto.
- Copiar/pegar una sola versión por generación.
`;
}

function escribirPrompts() {
  fs.mkdirSync(PROMPTS_DIR, { recursive: true });
  const items = [];
  for (const c of CONTENIDOS) {
    const abs = path.join(PROMPTS_DIR, c.archivo);
    fs.writeFileSync(abs, buildPrompt(c), 'utf8');
    const rel = `index/clientes/trendseeker/prompts/${c.archivo}`;
    console.log('TXT:', rel);
    items.push({
      id: `contenido-${c.n}-prompt`,
      titulo: `C${c.n}/12 · ${c.producto}`,
      archivo: `prompts/${c.archivo}`,
      descripcion: `VIDEO Gemini · ${etiquetaGenero(c.genero)} · listo para pegar (A/B/C).`,
      tareaNumero: null, // se rellena si hay live
      productoUrl: c.url,
      contenidoSerie: c.n,
    });
  }
  return items;
}

function actualizarTareasYIndice(items) {
  if (!fs.existsSync(LIVE)) {
    console.warn('Sin organizacion-live.json — solo se escribieron TXT.');
    return;
  }
  const data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];

  for (const c of CONTENIDOS) {
    const rel = `index/clientes/trendseeker/prompts/${c.archivo}`;
    const promptTask = data.tareas.find(
      (t) => t.id === `tarea-ts-contenido-${c.n}-de-12-prompt`
    );
    if (promptTask) {
      promptTask.entregableArchivo = rel;
      promptTask.tipoEntregable = 'prompt-gemini';
      promptTask.productoUrl = c.url;
      promptTask.notas =
        `Prompt Gemini VIDEO listo para copiar/pegar (${etiquetaGenero(c.genero)}). ` +
        `Producto: ${c.producto}. Link: ${c.url}. ` +
        `Archivo: ${rel}. Usa «Copiar todo» o «Mejorar prompt» si quieres ajustar ideas.`;
      const item = items.find((i) => i.contenidoSerie === c.n);
      if (item) item.tareaNumero = promptTask.numeroHistorico || null;
      console.log('Tarea prompt actualizada:', promptTask.titulo, '→', rel);
    } else {
      console.warn('No existe subtarea prompt C' + c.n + ' — corre antes add-ts-contenidos-7-12.js');
    }
  }

  data.respaldoActualizado = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');

  let indice = { herramienta: 'Gemini', nota: '', items: [] };
  if (fs.existsSync(INDICE)) {
    try {
      indice = JSON.parse(fs.readFileSync(INDICE, 'utf8'));
    } catch (_) { /* keep default */ }
  }
  if (!Array.isArray(indice.items)) indice.items = [];
  indice.herramienta = 'Gemini';
  indice.nota =
    'Prompts de producto/video Trendseeker — siempre Gemini (no Midjourney). Contenidos 7–12 con TXT listo al crear la tarea.';

  for (const it of items) {
    const i = indice.items.findIndex((x) => x.id === it.id);
    if (i >= 0) indice.items[i] = { ...indice.items[i], ...it };
    else indice.items.push(it);
  }
  fs.writeFileSync(INDICE, JSON.stringify(indice, null, 2) + '\n', 'utf8');
  console.log('Actualizado:', path.relative(ROOT, INDICE));
}

if (require.main === module) {
  const items = escribirPrompts();
  actualizarTareasYIndice(items);
  console.log('Listo. Abre una subtarea Prompt (ej. trendseeker/06) y usa Copiar / Mejorar prompt.');
}

module.exports = { CONTENIDOS, escribirPrompts, actualizarTareasYIndice, buildPrompt };
