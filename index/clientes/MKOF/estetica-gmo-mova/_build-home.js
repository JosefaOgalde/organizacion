const fs = require('fs');
const path =
  'C:/Users/josef/.cursor/projects/c-Users-josef-organizacion/agent-transcripts/251722a6-ead1-493b-99cc-8f43e3a8dbb1/251722a6-ead1-493b-99cc-8f43e3a8dbb1.jsonl';
const lines = fs.readFileSync(path, 'utf8').split(/\n/);
let html = null;
for (const line of lines) {
  if (!line.includes('<!DOCTYPE html>') || !line.includes('Grupo Making Of')) continue;
  try {
    const j = JSON.parse(line);
    const t = j.message?.content?.[0]?.text || '';
    const start = t.indexOf('<!DOCTYPE html>');
    const end = t.lastIndexOf('</html>');
    if (start >= 0 && end > start) {
      html = t.slice(start, end + 7);
      break;
    }
  } catch (e) {}
}
if (!html) {
  console.error('not found');
  process.exit(1);
}
html = html.replace(
  /src="data:image\/[^"]+"/g,
  'src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=60"'
);
if (html.includes('</style>')) {
  html = html.replace(
    '</style>',
    '</style>\n<link rel="stylesheet" href="gmo-home-motion.css">'
  );
}
html = html.replace('</body>', '<script src="gmo-home-motion.js"></script>\n</body>');
const replacements = [
  ['<section class="intro">', '<section class="intro" data-reveal>'],
  ['<section class="process">', '<section class="process" data-reveal>'],
  ['<div class="flow">', '<div class="flow" data-stagger>'],
  ['<section class="stats-band">', '<section class="stats-band" data-reveal="clip">'],
  ['<section class="logos">', '<section class="logos" data-reveal>'],
  ['<p class="servicios-intro">', '<p class="servicios-intro" data-reveal>'],
  ['<div class="bento">', '<div class="bento" data-stagger>'],
  [
    '<section class="contacto" id="contacto">',
    '<section class="contacto" id="contacto" data-reveal>',
  ],
  ['<div id="faqList">', '<div id="faqList" data-stagger>'],
  ['<div class="hero-left">', '<div class="hero-left" data-reveal="left">'],
  ['<div class="hero-right">', '<div class="hero-right" data-reveal="right">'],
];
for (const [a, b] of replacements) html = html.replace(a, b);
const out =
  'C:/Users/josef/organizacion/index/clientes/mkof/estetica-gmo-mova/home.html';
fs.writeFileSync(out, html);
console.log('wrote', out, 'bytes', fs.statSync(out).size);
