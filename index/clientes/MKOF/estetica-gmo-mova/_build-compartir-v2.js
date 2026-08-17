const fs = require('fs');
const path = require('path');

const dir = __dirname;
let html = fs.readFileSync(path.join(dir, 'home-osada.html'), 'utf8');
const css = fs.readFileSync(path.join(dir, 'gmo-home-motion-osada.css'), 'utf8');
const js = fs.readFileSync(path.join(dir, 'gmo-home-motion-osada.js'), 'utf8');

html = html.replace(
  /<link rel="stylesheet" href="gmo-home-motion-osada\.css">/,
  '<style>\n/* motion v2 osada */\n' + css + '\n</style>'
);
html = html.replace(
  /<script src="gmo-home-motion-osada\.js"><\/script>/,
  '<script>\n' + js + '\n</script>'
);

const imgs = [
  'bento-estrategia.png',
  'bento-seo.png',
  'bento-productos.png',
  'bento-creatividad.png',
];
for (const name of imgs) {
  const buf = fs.readFileSync(path.join(dir, 'img', name));
  const b64 = 'data:image/png;base64,' + buf.toString('base64');
  html = html.split('img/' + name).join(b64);
  console.log(name, Math.round(buf.length / 1024) + 'KB');
}

html = html.replace(
  /href="(contactanos|blog|estrategia|seo-geo|productos-digitales|creatividad-diseno|sobre-nosotros)\.html"/g,
  'href="#"'
);

const banner =
  '<!-- Demo compartible GMO Home v2 — abrir en Chrome/Edge (doble clic). Internet solo para fuentes, video y logos del carrusel. -->\n';
html = html.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n' + banner);

const out = path.join(dir, 'COMPARTIR-GMO-Home-v2.html');
fs.writeFileSync(out, html);
console.log('OK', out, Math.round(fs.statSync(out).size / 1024) + 'KB');
