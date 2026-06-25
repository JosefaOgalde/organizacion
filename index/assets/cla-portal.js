/**
 * Portal CLA — UI para generar y previsualizar certificados
 */
(function () {
  'use strict';

  var root = document.getElementById('cla-root');
  if (!root || !window.ADL_PROYECTOS || !window.ADL_PROYECTOS.CLA) return;

  var CLA = window.ADL_PROYECTOS.CLA;
  var cert = window.CLA_CERTIFICADOS;

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function render() {
    var idPdf = CLA.identidadPdf || 'CLA/identidad/manual-marca-caja-los-andes.pdf';
    var fasesHtml = CLA.fases.map(function (f) {
      var certs = f.certificados.map(function (c) {
        return (
          '<li><strong>' + esc(c.etiqueta) + '</strong> — ' + esc(c.requisito) +
          ' <button type="button" class="cla-btn cla-btn--sm" data-fase="' + esc(f.id) + '" data-cert="' + esc(c.id) + '">Vista previa</button></li>'
        );
      }).join('');
      return (
        '<section class="cla-fase">' +
        '<h3>Fase ' + f.numero + ': ' + esc(f.titulo) + '</h3>' +
        '<p class="cla-fase__meta">' + f.horas + ' h · ' + esc(f.modalidad) + '</p>' +
        '<ul class="cla-fase__certs">' + certs + '</ul></section>'
      );
    }).join('');

    root.innerHTML =
      '<div class="cla-wrap">' +
      '<section class="cla-hero">' +
      '<span class="cla-badge">' + esc(CLA.codigo) + '</span>' +
      '<h1>' + esc(CLA.nombre) + '</h1>' +
      '<p class="cla-hero__meta">' + esc(CLA.programa) + ' · Certificados ' + CLA.canvas.ancho + '×' + CLA.canvas.alto + ' px</p>' +
      '<p class="cla-hero__links">' +
      '<a href="' + esc(idPdf) + '" target="_blank" rel="noopener">Manual de marca</a> · ' +
      '<a href="' + esc(CLA.fondoCertificado) + '" target="_blank" rel="noopener">Fondo certificado (PNG)</a> · ' +
      '<a href="CLA/identidad/plantilla-certificado-1123x794.svg" target="_blank" rel="noopener">Plantilla SVG</a>' +
      '</p></section>' +
      '<div class="cla-grid">' +
      '<div class="cla-panel">' +
      '<h2>Datos del participante</h2>' +
      '<label class="cla-field">Nombre completo<input type="text" id="cla-nombre" value="María González Pérez" /></label>' +
      '<label class="cla-field">Fase / certificado<select id="cla-fase">' +
      CLA.fases.map(function (f) {
        return '<option value="' + esc(f.id) + '">Fase ' + f.numero + ' — ' + esc(f.titulo) + '</option>';
      }).join('') +
      '</select></label>' +
      '<label class="cla-field">Nota (Fase 3)<input type="text" id="cla-nota" placeholder="6,5" /></label>' +
      '<div class="cla-actions">' +
      '<button type="button" class="cla-btn" id="cla-generar">Generar vista previa</button>' +
      '<button type="button" class="cla-btn cla-btn--sec" id="cla-descargar">Descargar PNG</button>' +
      '</div>' +
      '<h2>Fases y certificados</h2>' + fasesHtml +
      '</div>' +
      '<div class="cla-panel cla-panel--preview">' +
      '<h2>Vista previa</h2>' +
      '<p class="cla-preview-hint">Fondo con borde de marca; el centro blanco es donde va el texto.</p>' +
      '<div class="cla-canvas-wrap"><canvas id="cla-canvas" width="1123" height="794"></canvas></div>' +
      '</div></div></div>';

    document.getElementById('cla-generar').addEventListener('click', generar);
    document.getElementById('cla-descargar').addEventListener('click', descargar);
    root.querySelectorAll('[data-fase]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.getElementById('cla-fase').value = btn.getAttribute('data-fase');
        generar();
      });
    });

    if (cert && cert.precargarFondo) cert.precargarFondo().then(generar);
    else generar();
  }

  function leerDatos() {
    var faseId = document.getElementById('cla-fase').value;
    var fase = CLA.fases.find(function (f) { return f.id === faseId; });
    var participante = {
      nombre: document.getElementById('cla-nombre').value.trim(),
      nota: document.getElementById('cla-nota').value.trim(),
    };
    var base = cert.datosDesdeFase(faseId, participante) || {};
    if (fase) {
      base.tituloFase = fase.certificados[0] ? fase.certificados[0].etiqueta : 'Certificado';
      base.textoCuerpo = 'ha completado satisfactoriamente la ' + fase.titulo + ' (' + fase.horas + ' horas, modalidad ' + fase.modalidad + ') del programa de formación en Inteligencia Artificial.';
    }
    return base;
  }

  function generar() {
    var canvas = document.getElementById('cla-canvas');
    if (!canvas || !cert) return;
    cert.dibujarCertificado(canvas, leerDatos());
  }

  function descargar() {
    var canvas = document.getElementById('cla-canvas');
    if (!canvas || !cert) return;
    cert.dibujarCertificado(canvas, leerDatos()).then(function () {
      var nombre = (document.getElementById('cla-nombre').value.trim() || 'certificado').replace(/\s+/g, '-').toLowerCase();
      cert.descargarPng(canvas, 'cla-' + nombre);
    });
  }

  render();
})();
