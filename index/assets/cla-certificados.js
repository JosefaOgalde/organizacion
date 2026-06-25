(function () {
  const STORAGE_KEY = 'cla-certificados-emitidos';
  const proyecto = window.ADL_PROYECTOS?.CLA;
  if (!proyecto) return;

  const root = document.getElementById('cla-root');
  if (!root) return;

  const { ancho: W, alto: H } = proyecto.canvas;
  const col = proyecto.colores;

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function leerEmitidos() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function guardarEmitido(entry) {
    const list = leerEmitidos();
    list.push({ ...entry, fechaEmision: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    renderEmitidos();
  }

  function idsEmitidos() {
    return leerEmitidos().map((e) => e.certId);
  }

  function renderEmitidos() {
    const ul = document.getElementById('cla-emitidos');
    if (!ul) return;
    const list = leerEmitidos();
    if (!list.length) {
      ul.innerHTML = '<li>Ninguno aún</li>';
      return;
    }
    ul.innerHTML = list
      .map(
        (e) =>
          `<li><strong>${escapeHtml(e.participante)}</strong> — ${escapeHtml(e.etiqueta)} (${escapeHtml(e.fechaEmision.slice(0, 10))})</li>`
      )
      .join('');
  }

  function dibujarCertificado(canvas, datos) {
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, col.primario);
    g.addColorStop(1, col.secundario);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, 140);

    ctx.fillStyle = col.fondo;
    ctx.fillRect(0, 140, W, H - 140);

    ctx.strokeStyle = col.acento;
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, W - 48, H - 48);

    ctx.fillStyle = col.textoClaro;
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText(proyecto.nombre, 48, 58);
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillText(proyecto.programa, 48, 92);
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText(`Proyecto ${proyecto.codigo} · Desafío Latam`, 48, 118);

    ctx.fillStyle = col.texto;
    ctx.font = 'bold 42px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICADO', W / 2, 210);

    const tipoLabel =
      datos.tipo === 'final'
        ? 'Certificado Final'
        : datos.tipo === 'participacion'
          ? 'de Participación'
          : 'de Aprobación';
    ctx.font = '24px system-ui, sans-serif';
    ctx.fillStyle = col.primario;
    ctx.fillText(tipoLabel, W / 2, 250);

    ctx.fillStyle = col.texto;
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillText('Se certifica que', W / 2, 310);

    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillText(datos.participante, W / 2, 365);

    ctx.font = '18px system-ui, sans-serif';
    const linea1 = datos.faseTitulo || 'Programa completo de formación en IA';
    wrapText(ctx, linea1, W / 2, 420, W - 160, 26);

    if (datos.especializacion) {
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillStyle = col.secundario;
      ctx.fillText(`Especialización: ${datos.especializacion}`, W / 2, 480);
    }

    ctx.fillStyle = col.texto;
    ctx.font = '15px system-ui, sans-serif';
    const detalle = [
      datos.horas ? `${datos.horas} horas · ${datos.modalidad || ''}` : '',
      datos.requisitoCumplido || '',
      `Fecha: ${datos.fecha}`
    ]
      .filter(Boolean)
      .join('  ·  ');
    wrapText(ctx, detalle, W / 2, datos.especializacion ? 520 : 490, W - 120, 22);

    ctx.fillStyle = col.acento;
    ctx.fillRect(W / 2 - 120, H - 120, 240, 3);

    ctx.fillStyle = '#6a7a72';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText('Caja Los Andes · CLA · Desafío Latam', W / 2, H - 85);
    ctx.fillText(`${W} × ${H} px`, W / 2, H - 62);

    ctx.textAlign = 'left';
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text).split(' ');
    let line = '';
    let yy = y;
    ctx.textAlign = 'center';
    for (let i = 0; i < words.length; i++) {
      const test = line + words[i] + ' ';
      if (ctx.measureText(test).width > maxWidth && i > 0) {
        ctx.fillText(line.trim(), x, yy);
        line = words[i] + ' ';
        yy += lineHeight;
      } else {
        line = test;
      }
    }
    ctx.fillText(line.trim(), x, yy);
    ctx.textAlign = 'left';
  }

  function descargarPng(canvas, nombre) {
    const a = document.createElement('a');
    a.download = nombre;
    a.href = canvas.toDataURL('image/png');
    a.click();
  }

  function mostrarPreview(datos) {
    const canvas = document.getElementById('cla-canvas');
    if (!canvas) return;
    dibujarCertificado(canvas, datos);
    const hint = document.getElementById('cla-size-hint');
    if (hint) hint.textContent = `Vista previa · exportación ${W} × ${H} px`;
  }

  function formFase(fase) {
    const certs = fase.certificados
      .map((cert) => {
        const extra =
          fase.id === 'fase-1'
            ? `<label>Asistencia (%)</label><input type="number" min="0" max="100" data-field="asistencia" data-fase="${fase.id}" data-cert="${cert.id}" value="75">`
            : fase.id === 'fase-2'
              ? `<label>Estado</label><select data-field="estado" data-fase="${fase.id}" data-cert="${cert.id}"><option value="aprobado">Aprobado</option><option value="reprobado">Reprobado</option></select>`
              : `<label>Especialización</label><select data-field="especializacion" data-fase="${fase.id}" data-cert="${cert.id}">${fase.especializaciones.map((e) => `<option>${escapeHtml(e)}</option>`).join('')}</select>
                 <label>Nota (0–10)</label><input type="number" min="0" max="10" step="0.1" data-field="nota" data-fase="${fase.id}" data-cert="${cert.id}" value="6">`;

        return `<div class="cla-fase__cert">
          <strong>${escapeHtml(cert.etiqueta)}</strong>
          <p class="cla-fase__meta">Requisito: ${escapeHtml(cert.requisito)}</p>
          ${extra}
          <button type="button" class="cla-btn" data-generar="${cert.id}" data-fase="${fase.id}">Generar certificado</button>
          <div class="cla-alerta" id="alert-${cert.id}" hidden></div>
        </div>`;
      })
      .join('');

    return `<article class="cla-fase">
      <h3>Fase ${fase.numero}: ${escapeHtml(fase.titulo)}</h3>
      <p class="cla-fase__meta">${fase.horas} h · ${escapeHtml(fase.modalidad)}</p>
      ${certs}
    </article>`;
  }

  root.innerHTML = `
    <div class="cla-wrap" style="--cla-primario:${col.primario};--cla-sec:${col.secundario};--cla-acento:${col.acento};--cla-bg:${col.fondo};--cla-text:${col.texto}">
      <header class="cla-hero">
        <span class="cla-badge">${proyecto.codigo}</span>
        <h1>${escapeHtml(proyecto.nombre)}</h1>
        <p class="cla-hero__meta">${escapeHtml(proyecto.programa)} · Identidad propia del proyecto (no mezclar con otros encargos ADL)</p>
        <a class="cla-identidad-link" href="${proyecto.identidadPdf}" target="_blank" rel="noopener">📄 Manual de marca / identidad visual (PDF)</a>
      </header>

      <div class="cla-grid">
        <section class="cla-panel">
          <h2>Generar certificados modulares</h2>
          <div class="cla-form">
            <label>Nombre del participante</label>
            <input type="text" id="cla-participante" placeholder="Nombre Apellido" value="">
            <label>Fecha del certificado</label>
            <input type="date" id="cla-fecha" value="${new Date().toISOString().slice(0, 10)}">
          </div>
          ${proyecto.fases.map(formFase).join('')}
          <article class="cla-fase">
            <h3>Certificado final</h3>
            <p class="cla-fase__meta">${escapeHtml(proyecto.certificadoFinal.requisito)}</p>
            <button type="button" class="cla-btn cla-btn--acento" id="cla-generar-final">Generar certificado final</button>
            <div class="cla-alerta" id="alert-final" hidden></div>
          </article>
        </section>

        <section class="cla-panel">
          <h2>Vista previa · ${W} × ${H} px</h2>
          <div class="cla-preview-wrap">
            <canvas id="cla-canvas" width="${W}" height="${H}"></canvas>
          </div>
          <p class="cla-size-hint" id="cla-size-hint">Formato fijo para impresión y entrega</p>
          <button type="button" class="cla-btn cla-btn--ghost" id="cla-descargar" style="width:100%;margin-top:0.75rem">Descargar PNG (${W}×${H})</button>
          <h2 style="margin-top:1.25rem">Certificados emitidos (local)</h2>
          <ul class="cla-emitidos" id="cla-emitidos"></ul>
        </section>
      </div>
    </div>
  `;

  let ultimoDatos = {
    participante: 'Participante',
    fecha: new Date().toLocaleDateString('es-CL'),
    faseTitulo: proyecto.programa,
    tipo: 'aprobacion',
    requisitoCumplido: ''
  };

  mostrarPreview(ultimoDatos);
  renderEmitidos();

  function leerFormulario() {
    const participante = document.getElementById('cla-participante')?.value?.trim();
    const fechaInput = document.getElementById('cla-fecha')?.value;
    const fecha = fechaInput
      ? new Date(fechaInput + 'T12:00:00').toLocaleDateString('es-CL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : new Date().toLocaleDateString('es-CL');
    return { participante: participante || 'Participante', fecha };
  }

  function datosDeFase(faseId, certId) {
    const fase = proyecto.fases.find((f) => f.id === faseId);
    const cert = fase?.certificados.find((c) => c.id === certId);
    if (!fase || !cert) return null;

    const campos = {};
    root.querySelectorAll(`[data-fase="${faseId}"][data-cert="${certId}"]`).forEach((el) => {
      campos[el.dataset.field] = el.value;
    });

    const ok = cert.validar(campos);
    return {
      ok,
      cert,
      fase,
      campos,
      datos: {
        participante: leerFormulario().participante,
        fecha: leerFormulario().fecha,
        faseTitulo: `Fase ${fase.numero}: ${fase.titulo}`,
        horas: fase.horas,
        modalidad: fase.modalidad,
        tipo: cert.tipo,
        especializacion: campos.especializacion || '',
        requisitoCumplido: cert.requisito + (campos.asistencia ? ` (${campos.asistencia}%)` : campos.nota ? ` (${campos.nota}/10)` : '')
      }
    };
  }

  root.querySelectorAll('[data-generar]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const { fase, cert } = { fase: btn.dataset.fase, cert: btn.dataset.generar };
      const res = datosDeFase(fase, cert);
      const alert = document.getElementById(`alert-${cert}`);
      if (!res) return;

      if (!res.ok) {
        alert.hidden = false;
        alert.className = 'cla-alerta cla-alerta--error';
        alert.textContent = `No cumple requisito: ${res.cert.requisito}`;
        return;
      }

      alert.hidden = false;
      alert.className = 'cla-alerta cla-alerta--ok';
      alert.textContent = 'Requisito cumplido. Certificado generado.';
      ultimoDatos = res.datos;
      mostrarPreview(ultimoDatos);
      guardarEmitido({
        certId: cert,
        participante: res.datos.participante,
        etiqueta: res.cert.etiqueta,
        fase: res.fase.numero
      });
    });
  });

  document.getElementById('cla-generar-final')?.addEventListener('click', () => {
    const alert = document.getElementById('alert-final');
    const emitidos = idsEmitidos();
    const ok = proyecto.certificadoFinal.validar(emitidos);

    if (!ok) {
      alert.hidden = false;
      alert.className = 'cla-alerta cla-alerta--error';
      alert.textContent =
        'Faltan certificados de aprobación. Se requieren: Fase 1, Fase 2 y Fase 3 (una especialización).';
      return;
    }

    const form = leerFormulario();
    ultimoDatos = {
      participante: form.participante,
      fecha: form.fecha,
      faseTitulo: 'Programa completo — 3 fases aprobadas',
      tipo: 'final',
      requisitoCumplido: proyecto.certificadoFinal.requisito
    };
    mostrarPreview(ultimoDatos);
    alert.hidden = false;
    alert.className = 'cla-alerta cla-alerta--ok';
    alert.textContent = 'Certificado final generado.';
    guardarEmitido({
      certId: 'final',
      participante: form.participante,
      etiqueta: proyecto.certificadoFinal.etiqueta,
      fase: 'final'
    });
  });

  document.getElementById('cla-descargar')?.addEventListener('click', () => {
    const canvas = document.getElementById('cla-canvas');
    const slug = (ultimoDatos.participante || 'participante').replace(/\s+/g, '-').toLowerCase();
    descargarPng(canvas, `CLA-certificado-${slug}-${W}x${H}.png`);
  });
})();
