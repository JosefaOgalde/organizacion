#!/usr/bin/env node
/**
 * Importa imágenes de diplomas CLA desde organizacion-respaldo-*.json
 * Uso: node scripts/importar-cla-diplomas.js [ruta/al/respaldo.json]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PLANTILLAS = path.join(ROOT, 'index/clientes/DesafioLatam/CLA/plantillas');
const CONFIG_OUT = path.join(ROOT, 'data/cla-certificados-imagenes.json');

const CERT_IDS = [
  'f1-participacion',
  'f1-aprobacion',
  'f2-participacion',
  'f2-aprobacion',
  'f3-participacion',
  'f3-aprobacion',
  'final'
];

function leerJson(ruta) {
  return JSON.parse(fs.readFileSync(ruta, 'utf8'));
}

function buscarImagenes(obj, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 8) return null;

  if (obj.claCertificadosImagenes && typeof obj.claCertificadosImagenes === 'object') {
    return obj.claCertificadosImagenes;
  }
  if (obj.proyectos?.CLA?.certificadosImagenes) return obj.proyectos.CLA.certificadosImagenes;
  if (obj.proyectos?.CLA?.imagenes) return obj.proyectos.CLA.imagenes;

  const ls = obj.localStorage || obj.portalLocalStorage;
  if (ls) {
    const raw = ls['cla-certificados-imagenes'] ?? ls.claCertificadosImagenes;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        /* ignore */
      }
    }
    if (raw && typeof raw === 'object') return raw;
  }

  if (obj.certificados && typeof obj.certificados === 'object') {
    const keys = Object.keys(obj.certificados);
    if (keys.some((k) => CERT_IDS.includes(k))) return obj.certificados;
  }

  const keys = Object.keys(obj);
  if (keys.some((k) => CERT_IDS.includes(k)) && keys.some((k) => obj[k]?.fondo)) {
    return obj;
  }

  for (const k of keys) {
    const v = obj[k];
    if (v && typeof v === 'object') {
      const found = buscarImagenes(v, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function dataUrlABuffer(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const m = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!m) return null;
  let ext = m[1].toLowerCase();
  if (ext === 'jpeg') ext = 'jpg';
  return { ext, buf: Buffer.from(m[2], 'base64') };
}

function configDefault() {
  return {
    fondo: '',
    fondoScale: 100,
    fondoX: 0,
    fondoY: 0,
    logo: '',
    logoScale: 100,
    logoX: 0,
    logoY: 0,
    firmaImg: '',
    firmaScale: 100,
    firmaX: 0,
    firmaY: 0,
    ocultarTexto: false
  };
}

function guardarCapa(dataUrl, certId, capa) {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl || '';
  const parsed = dataUrlABuffer(dataUrl);
  if (!parsed) return '';
  const nombre = capa === 'fondo' ? `${certId}.png` : `${certId}-${capa}.png`;
  const abs = path.join(PLANTILLAS, nombre);
  fs.writeFileSync(abs, parsed.buf);
  return `CLA/plantillas/${nombre}`;
}

function normalizarCert(certId, cfg) {
  const base = { ...configDefault(), ...cfg };
  base.fondo = guardarCapa(base.fondo, certId, 'fondo');
  base.logo = guardarCapa(base.logo, certId, 'logo');
  base.firmaImg = guardarCapa(base.firmaImg, certId, 'firma');
  return base;
}

function main() {
  const arg = process.argv[2];
  const downloads = path.join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads');
  const candidatos = [
    arg,
    path.join(downloads, 'organizacion-respaldo-2026-07-03.json'),
    path.join(downloads, 'cla-diplomas-imagenes-2026-07-03.json'),
    path.join(ROOT, 'data/organizacion-respaldo-2026-07-03.json'),
    path.join(ROOT, 'data/organizacion-live.json')
  ].filter(Boolean);

  let origen = null;
  for (const c of candidatos) {
    if (c && fs.existsSync(c)) {
      origen = c;
      break;
    }
  }

  if (!origen) {
    console.error('[CLA] No se encontró respaldo. Uso:');
    console.error('  node scripts/importar-cla-diplomas.js "C:\\Users\\josef\\Downloads\\organizacion-respaldo-2026-07-03.json"');
    process.exit(1);
  }

  console.log('[CLA] Leyendo', origen);
  const raw = leerJson(origen);
  const imagenes = buscarImagenes(raw);

  if (!imagenes || !Object.keys(imagenes).length) {
    console.error('[CLA] El JSON no contiene imágenes CLA (cla-certificados-imagenes).');
    console.error('[CLA] Abre CLA.html → carga imágenes → exporta desde el organizador o guarda localStorage.');
    process.exit(1);
  }

  fs.mkdirSync(PLANTILLAS, { recursive: true });
  fs.mkdirSync(path.dirname(CONFIG_OUT), { recursive: true });

  const certificados = {};
  let guardados = 0;

  Object.entries(imagenes).forEach(([certId, cfg]) => {
    if (!cfg || typeof cfg !== 'object') return;
    certificados[certId] = normalizarCert(certId, cfg);
    if (certificados[certId].fondo) guardados += 1;
  });

  const out = {
    actualizado: new Date().toISOString().slice(0, 10),
    origen: path.basename(origen),
    certificados
  };

  fs.writeFileSync(CONFIG_OUT, JSON.stringify(out, null, 2), 'utf8');

  console.log('[CLA] Importación OK');
  console.log('[CLA] Config:', CONFIG_OUT);
  console.log('[CLA] PNG en:', PLANTILLAS);
  console.log('[CLA] Certificados con fondo:', guardados, '/', Object.keys(certificados).length);
  console.log('[CLA] Recarga CLA.html (Ctrl+F5) para ver las imágenes.');
}

main();
