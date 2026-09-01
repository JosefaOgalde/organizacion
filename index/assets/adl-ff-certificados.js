/**
 * Certificado Formación para Facilitadores — Desafío Latam.
 * Canvas 1123×794. Identidad ADL (no mezclar con CLA).
 */
(function () {
  const proyecto = window.ADL_PROYECTOS?.FF;
  if (!proyecto) return;

  const root = document.getElementById('ff-root');
  const { ancho: W, alto: H } = proyecto.canvas;
  const col = proyecto.colores;
  const FONT = 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif';

  const ZONAS = {
    formacion: { x: 80, y: 108, w: 963, h: 50 },
    nombre: { x: 80, y: 270, w: 963, h: 100 },
    fecha: { x: 120, y: 668, w: 320, h: 32 },
    id: { x: 683, y: 668, w: 320, h: 32 }
  };

  const EJEMPLOS = [
    { etiqueta: 'Corto', nombre: 'Ana Díaz' },
    { etiqueta: 'Medio', nombre: 'Camila Vicencio Miranda' },
    { etiqueta: 'Extenso', nombre: 'María Fernanda de la Cruz González Sepúlveda' }
  ];

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function spacedText(ctx, text, x, y, trackingPx) {
    const chars = String(text).split('');
    const gaps = chars.length - 1;
    let total = 0;
    chars.forEach((ch) => {
      total += ctx.measureText(ch).width;
    });
    total += Math.max(0, gaps) * trackingPx;
    let cursor = x - total / 2;
    const align = ctx.textAlign;
    ctx.textAlign = 'left';
    chars.forEach((ch) => {
      ctx.fillText(ch, cursor, y);
      cursor += ctx.measureText(ch).width + trackingPx;
    });
    ctx.textAlign = align;
  }

  function wrapWords(ctx, text, maxWidth) {
    const words = String(text).trim().split(/\s+/);
    const lines = [];
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const test = line ? `${line} ${words[i]}` : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function layoutNombre(ctx, nombre, maxWidth, maxLines) {
    const sizes = [46, 40, 34, 30, 26, 22];
    for (const size of sizes) {
      ctx.font = `800 ${size}px ${FONT}`;
      if (ctx.measureText(nombre).width <= maxWidth) {
        return { size, lines: [nombre] };
      }
      const lines = wrapWords(ctx, nombre, maxWidth);
      if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= maxWidth)) {
        return { size, lines };
      }
    }
    ctx.font = `800 22px ${FONT}`;
    const fallback = wrapWords(ctx, nombre, maxWidth).slice(0, maxLines);
    return { size: 22, lines: fallback };
  }

  function wrapCuerpo(ctx, text, maxWidth) {
    ctx.font = `400 15px ${FONT}`;
    return wrapWords(ctx, text, maxWidth);
  }

  function drawCorner(ctx, x, y, dx, dy, len) {
    ctx.beginPath();
    ctx.moveTo(x + dx * len, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * len);
    ctx.stroke();
  }

  function dibujarFondo(ctx, { mostrarZonas }) {
    ctx.fillStyle = col.fondo;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = col.primario;
    ctx.fillRect(0, 0, 10, H);
    ctx.fillStyle = col.acento;
    ctx.fillRect(10, 0, 6, H);

    ctx.strokeStyle = col.secundario;
    ctx.lineWidth = 2;
    ctx.lineCap = 'square';
    drawCorner(ctx, 48, 48, 1, 1, 52);
    drawCorner(ctx, W - 48, 48, -1, 1, 52);
    drawCorner(ctx, 48, H - 48, 1, -1, 52);
    drawCorner(ctx, W - 48, H - 48, -1, -1, 52);

    const gx = 980;
    const gy = 86;
    ctx.strokeStyle = 'rgba(15, 46, 129, 0.35)';
    ctx.lineWidth = 1.5;
    [[0, 0], [22, 0], [44, 0]].forEach(([ox, oy]) => {
      ctx.strokeRect(gx + ox, gy + oy, 14, 14);
    });
    ctx.fillStyle = col.primario;
    ctx.fillRect(gx + 22, gy + 22, 14, 14);
    ctx.fillStyle = col.acento;
    ctx.fillRect(gx + 44, gy, 14, 14);

    ctx.fillStyle = col.primario;
    ctx.font = `600 12px ${FONT}`;
    ctx.textAlign = 'center';
    spacedText(ctx, 'CERTIFICADO DE APROBACIÓN', W / 2, 92, 3.2);

    ctx.fillStyle = col.secundario;
    ctx.font = `800 15px ${FONT}`;
    spacedText(ctx, 'DESAFÍO LATAM', W / 2, 186, 3.4);

    ctx.fillStyle = col.primario;
    ctx.fillRect(W / 2 - 40, 202, 80, 3);

    ctx.fillStyle = 'rgba(15, 46, 129, 0.62)';
    ctx.font = `400 16px ${FONT}`;
    ctx.fillText('Certifica que', W / 2, 246);

    ctx.fillStyle = col.primario;
    ctx.fillRect(W / 2 - 140, 372, 280, 3);

    ctx.fillStyle = 'rgba(15, 46, 129, 0.82)';
    ctx.font = `400 15px ${FONT}`;
    const cuerpo =
      'ha aprobado satisfactoriamente el proceso de formación para Facilitador/a Bootcamp, cumpliendo los criterios formativos y de evaluación establecidos por la Academia.';
    const lineasCuerpo = wrapCuerpo(ctx, cuerpo, 720);
    lineasCuerpo.forEach((linea, i) => {
      ctx.fillText(linea, W / 2, 432 + i * 24);
    });

    ctx.strokeStyle = 'rgba(15, 46, 129, 0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(180, 620);
    ctx.lineTo(943, 620);
    ctx.stroke();

    ctx.fillStyle = col.primario;
    ctx.font = `600 10px ${FONT}`;
    spacedText(ctx, 'FECHA DE EMISIÓN', 280, 658, 1.8);
    spacedText(ctx, 'CERTIFICADO N°', 843, 658, 1.8);

    ctx.fillStyle = 'rgba(15, 46, 129, 0.45)';
    ctx.font = `400 11px ${FONT}`;
    ctx.fillText('Academia Desafío Latam · Formación docente', W / 2, 748);

    if (mostrarZonas) {
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = 'rgba(233, 80, 29, 0.55)';
      ctx.lineWidth = 1;
      Object.values(ZONAS).forEach((z) => ctx.strokeRect(z.x, z.y, z.w, z.h));
      ctx.restore();
    }

    ctx.textAlign = 'left';
  }

  function dibujarVariables(ctx, datos) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    if (datos.formacion) {
      ctx.fillStyle = col.secundario;
      ctx.font = `500 26px ${FONT}`;
      const z = ZONAS.formacion;
      const lines = wrapWords(ctx, datos.formacion, z.w);
      const startY = z.y + 32 - (lines.length - 1) * 14;
      lines.slice(0, 2).forEach((linea, i) => {
        ctx.fillText(linea, W / 2, startY + i * 28);
      });
    }

    if (datos.nombre) {
      const z = ZONAS.nombre;
      const { size, lines } = layoutNombre(ctx, datos.nombre, z.w - 20, 2);
      ctx.fillStyle = col.secundario;
      ctx.font = `800 ${size}px ${FONT}`;
      const lineH = size * 1.12;
      const totalH = lines.length * lineH;
      const startY = z.y + (z.h + size * 0.35 - totalH) / 2 + size * 0.78;
      lines.forEach((linea, i) => {
        ctx.fillText(linea, W / 2, startY + i * lineH);
      });
    }

    ctx.fillStyle = col.secundario;
    ctx.font = `600 16px ${FONT}`;
    if (datos.fecha) ctx.fillText(datos.fecha, 280, 686);
    if (datos.codigo) ctx.fillText(String(datos.codigo), 843, 686);

    ctx.textAlign = 'left';
  }

  function dibujarCertificado(canvas, datos) {
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';
    dibujarFondo(ctx, { mostrarZonas: Boolean(datos.mostrarZonas) });
    if (!datos.soloFondo) dibujarVariables(ctx, datos);
  }

  function descargarPng(canvas, nombre) {
    const a = document.createElement('a');
    a.download = nombre;
    a.href = canvas.toDataURL('image/png');
    a.click();
  }

  function slug(s) {
    return String(s || 'certificado')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }

  function fechaHoyInput() {
    return new Date().toISOString().slice(0, 10);
  }

  function formatearFecha(iso) {
    const d = iso ? new Date(`${iso}T12:00:00`) : new Date();
    return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function leerFormulario() {
    return {
      nombre: document.getElementById('ff-nombre')?.value.trim() || 'Nombre Facilitador/a',
      formacion: document.getElementById('ff-formacion')?.value.trim() || proyecto.programa,
      fecha: formatearFecha(document.getElementById('ff-fecha')?.value),
      codigo: document.getElementById('ff-codigo')?.value.trim() || '00000',
      soloFondo: document.getElementById('ff-solo-fondo')?.checked,
      mostrarZonas: document.getElementById('ff-zonas')?.checked
    };
  }

  function cuandoFuentesListas(fn) {
    if (document.fonts?.ready) document.fonts.ready.then(fn);
    else fn();
  }

  window.ADL_FF_CERT = {
    ZONAS,
    layoutNombre,
    wrapWords,
    dibujarCertificado,
    formatearFecha,
    W,
    H
  };

  if (!root) return;

  root.innerHTML = `
    <div class="ff-wrap">
      <header class="ff-hero">
        <span class="ff-badge">${escapeHtml(proyecto.codigo)}</span>
        <h1>${escapeHtml(proyecto.nombre)}</h1>
        <p class="ff-hero__meta">${escapeHtml(proyecto.programa)} · identidad ADL · ${W} × ${H} px · compatible Empieza / Proyecto</p>
        <p class="ff-hero__links">
          <a href="formacion-facilitadores/identidad/fondo-lms-1123x794.svg">Fondo LMS (SVG)</a>
          ·
          <a href="formacion-facilitadores/identidad/plantilla-certificado-1123x794.svg">Maqueta con datos</a>
          ·
          <a href="formacion-facilitadores/identidad/ESPECIFICACION-LMS.md">Especificación de campos</a>
        </p>
      </header>

      <div class="ff-grid">
        <section class="ff-panel">
          <h2>Campos variables</h2>
          <div class="ff-form">
            <label for="ff-nombre">Nombre completo</label>
            <input id="ff-nombre" type="text" value="María Fernanda González Sepúlveda" autocomplete="name">
            <div class="ff-chips" id="ff-ejemplos">
              ${EJEMPLOS.map((e) => `<button type="button" class="ff-chip" data-nombre="${escapeHtml(e.nombre)}">${escapeHtml(e.etiqueta)}</button>`).join('')}
            </div>
            <label for="ff-formacion">Nombre de la formación</label>
            <input id="ff-formacion" type="text" value="${escapeHtml(proyecto.programa)}">
            <label for="ff-fecha">Fecha de emisión</label>
            <input id="ff-fecha" type="date" value="${fechaHoyInput()}">
            <label for="ff-codigo">Identificador / Certificado N°</label>
            <input id="ff-codigo" type="text" value="41773">
            <p class="ff-hint">Empieza ya usa número de certificado (ej. 41773). Si el LMS no lo expone, dejar el campo vacío en el overlay.</p>
            <label class="ff-check"><input id="ff-solo-fondo" type="checkbox"> Ver solo fondo LMS (sin datos)</label>
            <label class="ff-check"><input id="ff-zonas" type="checkbox"> Mostrar cajas de overlay</label>
          </div>
          <button type="button" class="ff-btn" id="ff-descargar">Descargar PNG maqueta (${W}×${H})</button>
          <button type="button" class="ff-btn ff-btn--ghost" id="ff-descargar-fondo">Descargar PNG fondo LMS</button>
        </section>

        <section class="ff-panel">
          <h2>Vista previa</h2>
          <div class="ff-preview-wrap">
            <canvas id="ff-canvas" width="${W}" height="${H}"></canvas>
          </div>
          <p class="ff-size-hint" id="ff-hint">1123 × 794 px · A4 horizontal</p>
        </section>
      </div>
    </div>
  `;

  const canvas = document.getElementById('ff-canvas');

  function render() {
    dibujarCertificado(canvas, leerFormulario());
    const datos = leerFormulario();
    const hint = document.getElementById('ff-hint');
    if (hint) {
      hint.textContent = datos.soloFondo
        ? `Fondo LMS · zonas libres para overlay · ${W} × ${H} px`
        : `Maqueta · ${datos.nombre} · ${W} × ${H} px`;
    }
  }

  ['ff-nombre', 'ff-formacion', 'ff-fecha', 'ff-codigo', 'ff-solo-fondo', 'ff-zonas'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', render);
    document.getElementById(id)?.addEventListener('change', render);
  });

  document.getElementById('ff-ejemplos')?.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-nombre]');
    if (!btn) return;
    const input = document.getElementById('ff-nombre');
    if (input) {
      input.value = btn.dataset.nombre;
      render();
    }
  });

  document.getElementById('ff-descargar')?.addEventListener('click', () => {
    const datos = { ...leerFormulario(), soloFondo: false, mostrarZonas: false };
    dibujarCertificado(canvas, datos);
    descargarPng(canvas, `ADL-FF-certificado-${slug(datos.nombre)}-${W}x${H}.png`);
    render();
  });

  document.getElementById('ff-descargar-fondo')?.addEventListener('click', () => {
    dibujarCertificado(canvas, { soloFondo: true, mostrarZonas: false });
    descargarPng(canvas, `ADL-FF-fondo-lms-${W}x${H}.png`);
    render();
  });

  cuandoFuentesListas(render);
})();
