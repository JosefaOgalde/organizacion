/**
 * Generador de certificados CLA — Caja Los Andes
 * Fondo: identidad/fondo-certificado-1123x794.png (borde marca, centro blanco)
 * Tamaño: 1123 × 794 px
 */
(function () {
  'use strict';

  var W = 1123;
  var H = 794;
  var fondoCache = null;
  var fondoCargando = null;

  /* Zona blanca del fondo (área segura para texto) */
  var AREA = { x: 88, y: 118, w: 947, h: 558 };

  function getCla() {
    return window.ADL_PROYECTOS && window.ADL_PROYECTOS.CLA;
  }

  function getIdentidad() {
    var cla = getCla();
    if (!cla) {
      return {
        colores: { navy: '#051933', azul: '#0066FF', dorado: '#FFD200', blanco: '#FFFFFF' },
        fondoCertificado: 'CLA/identidad/fondo-certificado-1123x794.png',
      };
    }
    var c = cla.colores || {};
    return {
      colores: {
        navy: c.primario || '#051933',
        azul: c.secundario || '#0066FF',
        dorado: c.acento || '#FFD200',
        blanco: c.fondo || '#FFFFFF',
      },
      fondoCertificado: cla.fondoCertificado || 'CLA/identidad/fondo-certificado-1123x794.png',
    };
  }

  function rutaFondo() {
    return getIdentidad().fondoCertificado;
  }

  function cargarFondo() {
    if (fondoCache) return Promise.resolve(fondoCache);
    if (fondoCargando) return fondoCargando;
    fondoCargando = new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        fondoCache = img;
        resolve(img);
      };
      img.onerror = function () {
        fondoCargando = null;
        reject(new Error('No se pudo cargar el fondo del certificado'));
      };
      img.src = rutaFondo();
    });
    return fondoCargando;
  }

  function dibujarFondoFallback(ctx) {
    var c = getIdentidad().colores;
    ctx.fillStyle = c.blanco || '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = c.navy || '#051933';
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    ctx.strokeStyle = c.dorado || '#FFD200';
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 32, W - 64, H - 64);
  }

  function dibujarTextoCertificado(ctx, datos) {
    var c = getIdentidad().colores;
    var navy = c.navy || '#051933';
    var azul = c.azul || '#0066FF';
    var dorado = c.dorado || '#FFD200';
    var cx = AREA.x + AREA.w / 2;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    /* Línea decorativa superior */
    ctx.strokeStyle = dorado;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 200, AREA.y + 28);
    ctx.lineTo(cx + 200, AREA.y + 28);
    ctx.stroke();

    ctx.fillStyle = azul;
    ctx.font = '600 13px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('CAJA LOS ANDES', cx, AREA.y + 52);

    ctx.fillStyle = navy;
    ctx.font = '700 38px Georgia, "Times New Roman", serif';
    ctx.fillText('CERTIFICADO', cx, AREA.y + 100);

    ctx.fillStyle = azul;
    ctx.font = '600 20px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(datos.tituloFase || 'Certificado', cx, AREA.y + 142);

    ctx.fillStyle = '#334155';
    ctx.font = '400 16px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('Se certifica que', cx, AREA.y + 195);

    ctx.fillStyle = navy;
    ctx.font = '700 30px Georgia, "Times New Roman", serif';
    var nombre = datos.nombreParticipante || 'Nombre del participante';
    ctx.fillText(nombre, cx, AREA.y + 248);

    ctx.fillStyle = '#475569';
    ctx.font = '400 15px "Segoe UI", system-ui, sans-serif';
    var lineas = wrapText(ctx, datos.textoCuerpo || '', AREA.w - 120);
    var y = AREA.y + 310;
    lineas.forEach(function (linea) {
      ctx.fillText(linea, cx, y);
      y += 24;
    });

  if (datos.nota != null && datos.nota !== '') {
      ctx.fillStyle = azul;
      ctx.font = '600 16px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('Nota: ' + datos.nota, cx, y + 16);
      y += 40;
    }

    /* Firmas */
    var yFirma = AREA.y + AREA.h - 72;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 220, yFirma);
    ctx.lineTo(cx - 60, yFirma);
    ctx.moveTo(cx + 60, yFirma);
    ctx.lineTo(cx + 220, yFirma);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '400 12px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(datos.firma1 || 'Desafío Latam', cx - 140, yFirma + 22);
    ctx.fillText(datos.firma2 || 'Caja Los Andes', cx + 140, yFirma + 22);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 11px "Segoe UI", system-ui, sans-serif';
    var fecha = datos.fecha || new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillText(fecha, cx, AREA.y + AREA.h - 18);
  }

  function wrapText(ctx, text, maxWidth) {
    var words = text.split(' ');
    var lines = [];
    var current = '';
    words.forEach(function (w) {
      var test = current ? current + ' ' + w : w;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = w;
      } else {
        current = test;
      }
    });
    if (current) lines.push(current);
    return lines.length ? lines : [text];
  }

  function dibujarCertificado(canvas, datos) {
    var ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    return cargarFondo()
      .then(function (img) {
        ctx.drawImage(img, 0, 0, W, H);
        dibujarTextoCertificado(ctx, datos);
        return canvas;
      })
      .catch(function () {
        dibujarFondoFallback(ctx);
        dibujarTextoCertificado(ctx, datos);
        return canvas;
      });
  }

  function descargarPng(canvas, nombreArchivo) {
    var a = document.createElement('a');
    a.download = (nombreArchivo || 'certificado-cla') + '.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  }

  function datosDesdeFase(faseId, participante) {
    var cla = getCla();
    if (!cla || !cla.fases) return null;
    var fase = cla.fases.find(function (f) { return f.id === faseId; });
    if (!fase) return null;
    var p = participante || {};
    var cert0 = fase.certificados && fase.certificados[0];
    return {
      tituloFase: cert0 ? cert0.etiqueta : 'Certificado',
      textoCuerpo: 'ha completado satisfactoriamente la ' + fase.titulo + ' (' + fase.horas + ' horas, modalidad ' + fase.modalidad + ').',
      nombreParticipante: p.nombre || 'Participante',
      nota: p.nota,
      fecha: p.fecha,
      firma1: 'Desafío Latam',
      firma2: 'Caja Los Andes',
    };
  }

  function precargarFondo() {
    return cargarFondo().catch(function () {});
  }

  window.CLA_CERTIFICADOS = {
    W: W,
    H: H,
    AREA: AREA,
    dibujarCertificado: dibujarCertificado,
    descargarPng: descargarPng,
    datosDesdeFase: datosDesdeFase,
    precargarFondo: precargarFondo,
    rutaFondo: rutaFondo,
  };
})();
