#!/usr/bin/env node
/**
 * Arma catalogo-impresoreando.pdf desde los PNG de export/ (1080×1350).
 * Requiere: pip install img2pdf  (o python3 -m img2pdf)
 *
 * Uso:
 *   node index/clientes/impresoreando/catalogo/exportar-pdf.js
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'export');
const PDF = path.join(OUT_DIR, 'catalogo-impresoreando.pdf');

const files = fs
  .readdirSync(OUT_DIR)
  .filter((f) => f.endsWith('.png'))
  .sort()
  .map((f) => path.join(OUT_DIR, f));

if (files.length < 1) {
  console.error('No hay PNG en export/. Primero exportá las páginas.');
  process.exit(1);
}

const py = `
import img2pdf, sys
files = sys.argv[1:-1]
out = sys.argv[-1]
with open(out, 'wb') as f:
    f.write(img2pdf.convert(files))
print(out, len(files), 'páginas')
`;

try {
  execFileSync('python3', ['-c', py, ...files, PDF], { stdio: 'inherit' });
} catch (e) {
  console.error('Falta img2pdf. En la PC: pip install img2pdf');
  process.exit(1);
}

console.log('OK', PDF, `${Math.round(fs.statSync(PDF).size / 1024)} KB`);
