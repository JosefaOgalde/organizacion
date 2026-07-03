(function () {
  const STORAGE_KEY = 'cla-certificados-emitidos';
  const STORAGE_IMAGENES = 'cla-certificados-imagenes';
  const CONFIG_URL = '../../data/cla-certificados-imagenes.json';
  const proyecto = window.ADL_PROYECTOS?.CLA;
  if (!proyecto) return;

  const root = document.getElementById('cla-root');
  if (!root) return;

  const { ancho: W, alto: H } = proyecto.canvas;
  let imagenesRepo = {};

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

  function formatFecha(tipoFinal, fechaInput) {
    const d = fechaInput
      ? new Date(fechaInput + 'T12:00:00')
      : new Date();
    if (tipoFinal) {
      return d.toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    const mes = d.toLocaleDateString('es-CL', { month: 'long' });
    const anio = d.getFullYear();
    return `${mes.charAt(0).toUpperCase() + mes.slice(1)}, ${anio}`;
  }

  function leerFormulario() {
    const nombre = document.getElementById('cla-participante')?.value?.trim() || 'Nombre Apellido';
    const rut = document.getElementById('cla-rut')?.value?.trim() || '12.345.678-9';
    const fechaInput = document.getElementById('cla-fecha')?.value;
    return { nombre, rut, fechaInput };
  }

  function configImagenDefault() {
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

  function leerImagenes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_IMAGENES) || '{}');
    } catch {
      return {};
    }
  }

  function leerImagenCert(certId) {
    const local = leerImagenes()[certId] || {};
    const repo = imagenesRepo[certId] || {};
    return { ...configImagenDefault(), ...repo, ...local };
  }

  const CERT_IDS_LIST = [
    'f1-participacion',
    'f1-aprobacion',
    'f2-participacion',
    'f2-aprobacion',
    'f3-participacion',
    'f3-aprobacion',
    'final'
  ];

  async function cargarImagenesRepo() {
    try {
      const res = await fetch(`${CONFIG_URL}?v=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.certificados && typeof data.certificados === 'object') {
        imagenesRepo = data.certificados;
      }
    } catch {
      /* sin archivo en disco */
    }
  }

  async function persistirImagenesDisco() {
    const certificados = { ...imagenesRepo };
    CERT_IDS_LIST.forEach((id) => {
      certificados[id] = leerImagenCert(id);
    });
    try {
      await fetch('/api/cla-imagenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualizado: new Date().toISOString().slice(0, 10),
          certificados
        })
      });
    } catch {
      /* servidor estático sin API */
    }
  }

  function guardarImagenCert(certId, config) {
    const merged = { ...configImagenDefault(), ...config };
    const all = leerImagenes();
    all[certId] = merged;
    localStorage.setItem(STORAGE_IMAGENES, JSON.stringify(all));
    imagenesRepo[certId] = merged;
    persistirImagenesDisco();
  }

  function exportarImagenesCla() {
    const certificados = {};
    CERT_IDS_LIST.forEach((id) => {
      certificados[id] = leerImagenCert(id);
    });
    const payload = {
      actualizado: new Date().toISOString().slice(0, 10),
      claCertificadosImagenes: certificados,
      certificados
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cla-diplomas-imagenes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function imgStyle(cfg, prefix) {
    const scale = (cfg[`${prefix}Scale`] ?? 100) / 100;
    const x = cfg[`${prefix}X`] ?? 0;
    const y = cfg[`${prefix}Y`] ?? 0;
    return `transform: translate(${x}px, ${y}px) scale(${scale});`;
  }

  function leerArchivoComoDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function aplicarMencion(texto, mencion) {
    if (!texto.includes('[la que cursó el alumno]')) return texto;
    return texto.replace('[la que cursó el alumno]', mencion || '—');
  }

  function buildModelo(plantilla, opts) {
    const { nombre, rut, fechaInput, esFinal, mencion, certId } = opts;
    const fechaTexto = formatFecha(esFinal, fechaInput);
    const parrafos = (plantilla.parrafos || []).map((p) => aplicarMencion(p, mencion));

    return {
      certId: certId || '',
      tituloVisual: plantilla.tituloVisual,
      emisor: plantilla.emisor,
      nombre,
      rut,
      parrafos,
      duracion: plantilla.duracion,
      cierre: plantilla.cierre
        ? plantilla.cierre.replace('[Día] de [Mes] de [Año]', fechaTexto)
        : '',
      cargaHorariaTotal: plantilla.cargaHorariaTotal,
      fechaEmision: esFinal ? fechaTexto : fechaTexto,
      firma: plantilla.firma,
      imagen: certId ? leerImagenCert(certId) : configImagenDefault()
    };
  }

  function capaImagen(src, clase, cfg, prefix) {
    if (!src) return '';
    return `<img class="${clase}" src="${src}" alt="" style="${imgStyle(cfg, prefix)}" draggable="false">`;
  }

  function renderCertificadoHtml(modelo) {
    const cfg = modelo.imagen || configImagenDefault();
    const ocultar = cfg.ocultarTexto ? ' cla-cert__contenido--hidden' : '';
    const parrafos = modelo.parrafos
      .map((p) => `<p class="cla-cert__p">${escapeHtml(p)}</p>`)
      .join('');

    const pieIzq = [
      modelo.duracion ? `<p><strong>Duración:</strong> ${escapeHtml(modelo.duracion)}.</p>` : '',
      modelo.cierre
        ? `<p>${escapeHtml(modelo.cierre)}${modelo.cargaHorariaTotal ? ` Carga Horaria Total Acreditada: ${escapeHtml(modelo.cargaHorariaTotal)}.` : ''}</p>`
        : `<p><strong>Fecha de emisión:</strong> ${escapeHtml(modelo.fechaEmision)}</p>`
    ]
      .filter(Boolean)
      .join('');

    return `
      <article class="cla-cert" aria-label="${escapeHtml(modelo.tituloVisual)}">
        <div class="cla-cert__frame">
          <div class="cla-cert__inner">
            ${capaImagen(cfg.fondo, 'cla-cert__fondo', cfg, 'fondo')}
            <div class="cla-cert__contenido${ocultar}">
              ${cfg.logo ? capaImagen(cfg.logo, 'cla-cert__logo-img', cfg, 'logo') : `<div class="cla-cert__logo" aria-hidden="true">
              <span class="cla-cert__logo-mark"></span>
              <span class="cla-cert__logo-text">CAJA LOS ANDES</span>
            </div>`}
            <h2 class="cla-cert__titulo">${escapeHtml(modelo.tituloVisual)}</h2>
            <p class="cla-cert__emisor">${escapeHtml(modelo.emisor)}</p>
            <p class="cla-cert__nombre">${escapeHtml(modelo.nombre)}</p>
            <p class="cla-cert__rut">${escapeHtml(modelo.rut)}</p>
            <div class="cla-cert__cuerpo">${parrafos}</div>
            <footer class="cla-cert__pie">
              <div class="cla-cert__pie-izq">${pieIzq}</div>
              <div class="cla-cert__firma">
                ${cfg.firmaImg ? capaImagen(cfg.firmaImg, 'cla-cert__firma-img', cfg, 'firmaImg') : `<span class="cla-cert__firma-linea" aria-hidden="true"></span>`}
                <strong>${escapeHtml(modelo.firma.nombre)}</strong>
                <span>${escapeHtml(modelo.firma.cargo)}</span>
              </div>
            </footer>
            </div>
          </div>
        </div>
      </article>`;
  }

  function ajustarEscalaPreview() {
    const wrap = document.getElementById('cla-preview-wrap');
    const cert = wrap?.querySelector('.cla-cert');
    if (!wrap || !cert) return;
    const scale = Math.min(1, (wrap.clientWidth - 16) / W);
    cert.style.setProperty('--cla-scale', String(scale));
  }

  function mostrarPreview(modelo, meta) {
    const wrap = document.getElementById('cla-preview-wrap');
    const hint = document.getElementById('cla-size-hint');
    if (!wrap) return;
    wrap.innerHTML = renderCertificadoHtml(modelo);
    ultimoModelo = modelo;
    ultimoMeta = meta;
    requestAnimationFrame(ajustarEscalaPreview);
    if (hint) {
      hint.textContent = meta?.etiqueta
        ? `Vista previa · ${meta.etiqueta} · ${W} × ${H} px`
        : `Vista previa · exportación ${W} × ${H} px`;
    }
  }

  function todosLosCertificados() {
    const list = [];
    proyecto.fases.forEach((fase) => {
      const ordenados = [...fase.certificados].sort((a, b) => {
        if (a.tipo === b.tipo) return 0;
        return a.tipo === 'participacion' ? -1 : 1;
      });
      ordenados.forEach((cert) => list.push({ fase, cert, esFinal: false }));
    });
    list.push({
      fase: null,
      cert: { ...proyecto.certificadoFinal, id: 'final', tipo: 'final' },
      esFinal: true
    });
    return list;
  }

  function camposExtra(fase, cert) {
    if (cert.id === 'f1-participacion') {
      return `<label>Asistencia (%)</label><input type="number" min="0" max="100" data-field="asistencia" data-fase="${fase.id}" data-cert="${cert.id}" value="75">`;
    }
    if (cert.id === 'f1-aprobacion') {
      return `<label>Asistencia (%)</label><input type="number" min="0" max="100" data-field="asistencia" data-fase="${fase.id}" data-cert="${cert.id}" value="80">`;
    }
    if (cert.id === 'f2-aprobacion') {
      return `<label>Estado del módulo</label><select data-field="estado" data-fase="${fase.id}" data-cert="${cert.id}"><option value="aprobado">Aprobado</option><option value="reprobado">Reprobado</option></select>`;
    }
    if (cert.id === 'f3-aprobacion') {
      return `<label>Mención de especialidad</label><select data-field="mencion" data-fase="${fase.id}" data-cert="${cert.id}">${fase.especializaciones.map((e) => `<option>${escapeHtml(e)}</option>`).join('')}</select>
              <label>Nota portafolio (0–10)</label><input type="number" min="0" max="10" step="0.1" data-field="nota" data-fase="${fase.id}" data-cert="${cert.id}" value="7">`;
    }
    return '';
  }

  function formFase(fase) {
    const ordenados = [...fase.certificados].sort((a, b) => {
      if (a.tipo === b.tipo) return 0;
      return a.tipo === 'participacion' ? -1 : 1;
    });

    const certs = ordenados
      .map((cert) => {
        const badge = cert.aprobado
          ? '<span class="cla-cert-badge">Aprobado</span>'
          : '';
        return `<div class="cla-fase__cert" data-cert-card="${cert.id}">
          <div class="cla-fase__cert-head">
            <strong>${escapeHtml(cert.etiqueta)}</strong>${badge}
          </div>
          <p class="cla-fase__meta">${escapeHtml(cert.plantilla?.tituloVisual || '')}</p>
          <p class="cla-fase__meta">Requisito: ${escapeHtml(cert.requisito)}</p>
          ${camposExtra(fase, cert)}
          <div class="cla-fase__acciones">
            <button type="button" class="cla-btn cla-btn--ghost" data-preview="${cert.id}" data-fase="${fase.id}">Vista previa</button>
            <button type="button" class="cla-btn cla-btn--ghost" data-editar="${cert.id}" data-fase="${fase.id}">Editar imagen</button>
            <button type="button" class="cla-btn" data-generar="${cert.id}" data-fase="${fase.id}">Generar</button>
          </div>
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

  function renderCatalogo() {
    return todosLosCertificados()
      .map(({ fase, cert, esFinal }) => {
        const titulo = cert.plantilla?.tituloVisual || cert.etiqueta;
        const faseLabel = esFinal ? 'Final' : `F${fase.numero}`;
        const faseId = esFinal ? 'final' : fase.id;
        const tieneImg = !!leerImagenCert(cert.id).fondo;
        return `<div class="cla-catalogo__card">
          <button type="button" class="cla-catalogo__item${tieneImg ? ' has-imagen' : ''}" data-catalogo="${cert.id}" data-fase="${faseId}">
            <span class="cla-catalogo__fase">${faseLabel}</span>
            <span class="cla-catalogo__titulo">${escapeHtml(titulo)}</span>
            <span class="cla-catalogo__tipo">${escapeHtml(cert.etiqueta)}</span>
          </button>
          <button type="button" class="cla-btn cla-btn--edit" data-editar="${cert.id}" data-fase="${faseId}" title="Editar imágenes">Editar</button>
        </div>`;
      })
      .join('');
  }

  async function initCla() {
    await cargarImagenesRepo();

  root.innerHTML = `
    <div class="cla-wrap">
      <header class="cla-hero">
        <span class="cla-badge">${proyecto.codigo} · ${proyecto.certificadosAprobados?.total || 7} certificados aprobados</span>
        <h1>${escapeHtml(proyecto.nombre)}</h1>
        <p class="cla-hero__meta">${escapeHtml(proyecto.programa)}</p>
        <div class="cla-hero__links">
          <a class="cla-identidad-link" href="${proyecto.identidadPdf}" target="_blank" rel="noopener">Manual de marca (PDF)</a>
          <a class="cla-identidad-link" href="CLA/certificados-aprobados.md" target="_blank" rel="noopener">Textos oficiales (MD)</a>
          <button type="button" class="cla-identidad-link cla-identidad-link--btn" id="cla-exportar-imagenes">↓ Exportar imágenes (JSON)</button>
        </div>
      </header>

      <section class="cla-catalogo">
        <h2>Catálogo de certificados</h2>
        <div class="cla-catalogo__grid">${renderCatalogo()}</div>
      </section>

      <div class="cla-grid">
        <section class="cla-panel">
          <h2>Generar certificado</h2>
          <div class="cla-form">
            <label>Nombre completo</label>
            <input type="text" id="cla-participante" placeholder="Nombre Apellido" value="">
            <label>RUT</label>
            <input type="text" id="cla-rut" placeholder="12.345.678-9" value="">
            <label>Fecha de emisión</label>
            <input type="date" id="cla-fecha" value="${new Date().toISOString().slice(0, 10)}">
          </div>
          ${proyecto.fases.map(formFase).join('')}
          <article class="cla-fase">
            <h3>Diploma final del programa</h3>
            <p class="cla-fase__meta">${escapeHtml(proyecto.certificadoFinal.requisito)} · ${escapeHtml(proyecto.certificadoFinal.plantilla?.cargaHorariaTotal || '108 horas')}</p>
            <div class="cla-fase__acciones">
              <button type="button" class="cla-btn cla-btn--ghost" data-preview="final" data-fase="final">Vista previa</button>
              <button type="button" class="cla-btn cla-btn--ghost" data-editar="final" data-fase="final">Editar imagen</button>
              <button type="button" class="cla-btn cla-btn--acento" id="cla-generar-final">Generar diploma final</button>
            </div>
            <div class="cla-alerta" id="alert-final" hidden></div>
          </article>
        </section>

        <section class="cla-panel cla-panel--preview">
          <div class="cla-panel__head">
            <h2>Vista previa · ${W} × ${H} px</h2>
            <button type="button" class="cla-btn cla-btn--edit cla-btn--sm" id="cla-editar-activo" hidden>Editar imagen</button>
          </div>
          <div class="cla-preview-wrap" id="cla-preview-wrap"></div>
          <p class="cla-size-hint" id="cla-size-hint">Selecciona un certificado del catálogo o genera uno</p>
          <button type="button" class="cla-btn cla-btn--ghost" id="cla-descargar" style="width:100%;margin-top:0.75rem">Descargar PNG (${W}×${H})</button>
          <h2 class="cla-subtitle">Emitidos (local)</h2>
          <ul class="cla-emitidos" id="cla-emitidos"></ul>
        </section>
      </div>

      <dialog class="cla-editor" id="cla-editor">
        <form method="dialog" class="cla-editor__box" id="cla-editor-form">
          <header class="cla-editor__head">
            <h2>Editar imágenes</h2>
            <p class="cla-editor__cert" id="cla-editor-cert-label"></p>
            <button type="button" class="cla-editor__close" id="cla-editor-cerrar" aria-label="Cerrar">×</button>
          </header>
          <div class="cla-editor__body">
            <section class="cla-editor__bloque">
              <h3>Plantilla de fondo (1123×794)</h3>
              <p class="cla-fase__meta">PNG o JPG del diseño aprobado. Ajusta escala y posición.</p>
              <input type="file" id="cla-ed-fondo" accept="image/png,image/jpeg,image/webp">
              <div class="cla-editor__sliders">
                <label>Escala %<input type="range" id="cla-ed-fondo-scale" min="50" max="150" value="100"></label>
                <label>Posición X<input type="range" id="cla-ed-fondo-x" min="-200" max="200" value="0"></label>
                <label>Posición Y<input type="range" id="cla-ed-fondo-y" min="-200" max="200" value="0"></label>
              </div>
            </section>
            <section class="cla-editor__bloque">
              <h3>Logo (opcional)</h3>
              <input type="file" id="cla-ed-logo" accept="image/png,image/jpeg,image/webp,image/svg+xml">
              <div class="cla-editor__sliders">
                <label>Escala %<input type="range" id="cla-ed-logo-scale" min="20" max="200" value="100"></label>
                <label>Posición X<input type="range" id="cla-ed-logo-x" min="-400" max="400" value="0"></label>
                <label>Posición Y<input type="range" id="cla-ed-logo-y" min="-200" max="200" value="0"></label>
              </div>
            </section>
            <section class="cla-editor__bloque">
              <h3>Firma (opcional)</h3>
              <input type="file" id="cla-ed-firma" accept="image/png,image/jpeg,image/webp">
              <div class="cla-editor__sliders">
                <label>Escala %<input type="range" id="cla-ed-firma-scale" min="20" max="200" value="100"></label>
                <label>Posición X<input type="range" id="cla-ed-firma-x" min="-400" max="400" value="0"></label>
                <label>Posición Y<input type="range" id="cla-ed-firma-y" min="-200" max="200" value="0"></label>
              </div>
            </section>
            <label class="cla-editor__check">
              <input type="checkbox" id="cla-ed-ocultar-texto">
              Ocultar textos generados (solo mostrar imagen de fondo)
            </label>
          </div>
          <footer class="cla-editor__foot">
            <button type="button" class="cla-btn cla-btn--ghost" id="cla-editor-reset">Restablecer</button>
            <button type="button" class="cla-btn" id="cla-editor-guardar">Guardar y aplicar</button>
          </footer>
        </form>
      </dialog>
    </div>
  `;

  let ultimoModelo = null;
  let ultimoMeta = { certId: 'f1-participacion', etiqueta: 'Diploma de participación — Fase 1' };

  function resolverCert(faseId, certId) {
    if (faseId === 'final' || certId === 'final') {
      return { fase: null, cert: proyecto.certificadoFinal, esFinal: true };
    }
    const fase = proyecto.fases.find((f) => f.id === faseId);
    const cert = fase?.certificados.find((c) => c.id === certId);
    return fase && cert ? { fase, cert, esFinal: false } : null;
  }

  function datosDeCert(faseId, certId, soloPreview) {
    const res = resolverCert(faseId, certId);
    if (!res?.cert?.plantilla) return null;

    const campos = {};
    if (!res.esFinal && res.fase) {
      root.querySelectorAll(`[data-fase="${res.fase.id}"][data-cert="${certId}"]`).forEach((el) => {
        campos[el.dataset.field] = el.value;
      });
    }

    const ok = soloPreview || res.esFinal ? true : res.cert.validar(campos);
    const form = leerFormulario();
    const mencion = campos.mencion || res.fase?.especializaciones?.[0] || '';

    const modelo = buildModelo(res.cert.plantilla, {
      nombre: form.nombre,
      rut: form.rut,
      fechaInput: form.fechaInput,
      esFinal: res.esFinal,
      mencion,
      certId
    });

    return {
      ok,
      cert: res.cert,
      fase: res.fase,
      esFinal: res.esFinal,
      campos,
      modelo,
      meta: { certId, etiqueta: res.cert.etiqueta }
    };
  }

  function previewCert(faseId, certId) {
    const res = datosDeCert(faseId, certId, true);
    if (!res) return;
    ultimoMeta = { ...res.meta, faseId };
    mostrarPreview(res.modelo, res.meta);
    document.querySelectorAll('.cla-catalogo__item').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.catalogo === certId);
    });
    const btnEdit = document.getElementById('cla-editar-activo');
    if (btnEdit) {
      btnEdit.hidden = false;
      btnEdit.dataset.editar = certId;
      btnEdit.dataset.fase = faseId;
    }
  }

  let editorCertId = null;
  let editorFaseId = null;
  let editorDraft = configImagenDefault();

  function syncEditorDraftToForm() {
    const map = [
      ['fondo', 'cla-ed-fondo-scale', 'fondoScale'],
      ['fondo', 'cla-ed-fondo-x', 'fondoX'],
      ['fondo', 'cla-ed-fondo-y', 'fondoY'],
      ['logo', 'cla-ed-logo-scale', 'logoScale'],
      ['logo', 'cla-ed-logo-x', 'logoX'],
      ['logo', 'cla-ed-logo-y', 'logoY'],
      ['firma', 'cla-ed-firma-scale', 'firmaScale'],
      ['firma', 'cla-ed-firma-x', 'firmaX'],
      ['firma', 'cla-ed-firma-y', 'firmaY']
    ];
    map.forEach(([, id, key]) => {
      const el = document.getElementById(id);
      if (el) el.value = editorDraft[key];
    });
    const chk = document.getElementById('cla-ed-ocultar-texto');
    if (chk) chk.checked = !!editorDraft.ocultarTexto;
  }

  function leerEditorDraftFromForm() {
    return {
      ...editorDraft,
      fondoScale: Number(document.getElementById('cla-ed-fondo-scale')?.value ?? 100),
      fondoX: Number(document.getElementById('cla-ed-fondo-x')?.value ?? 0),
      fondoY: Number(document.getElementById('cla-ed-fondo-y')?.value ?? 0),
      logoScale: Number(document.getElementById('cla-ed-logo-scale')?.value ?? 100),
      logoX: Number(document.getElementById('cla-ed-logo-x')?.value ?? 0),
      logoY: Number(document.getElementById('cla-ed-logo-y')?.value ?? 0),
      firmaScale: Number(document.getElementById('cla-ed-firma-scale')?.value ?? 100),
      firmaX: Number(document.getElementById('cla-ed-firma-x')?.value ?? 0),
      firmaY: Number(document.getElementById('cla-ed-firma-y')?.value ?? 0),
      ocultarTexto: !!document.getElementById('cla-ed-ocultar-texto')?.checked
    };
  }

  function abrirEditorImagen(faseId, certId) {
    const res = resolverCert(faseId, certId);
    if (!res?.cert) return;

    editorCertId = certId;
    editorFaseId = faseId;
    editorDraft = leerImagenCert(certId);
    syncEditorDraftToForm();

    const label = document.getElementById('cla-editor-cert-label');
    if (label) label.textContent = res.cert.etiqueta;

    previewCert(faseId, certId);
    document.getElementById('cla-editor')?.showModal();
  }

  function aplicarEditorDraftPreview() {
    if (!editorCertId) return;
    editorDraft = leerEditorDraftFromForm();
    guardarImagenCert(editorCertId, editorDraft);
    previewCert(editorFaseId, editorCertId);
    actualizarIndicadoresImagen();
  }

  function actualizarIndicadoresImagen() {
    document.querySelectorAll('[data-catalogo]').forEach((el) => {
      const cfg = leerImagenCert(el.dataset.catalogo);
      el.classList.toggle('has-imagen', !!cfg.fondo);
    });
  }

  function bindEditorImagen() {
    const dialog = document.getElementById('cla-editor');
    if (!dialog) return;

    ['cla-ed-fondo-scale', 'cla-ed-fondo-x', 'cla-ed-fondo-y', 'cla-ed-logo-scale', 'cla-ed-logo-x', 'cla-ed-logo-y', 'cla-ed-firma-scale', 'cla-ed-firma-x', 'cla-ed-firma-y', 'cla-ed-ocultar-texto'].forEach((id) => {
      document.getElementById(id)?.addEventListener('input', () => {
        editorDraft = leerEditorDraftFromForm();
        guardarImagenCert(editorCertId, editorDraft);
        previewCert(editorFaseId, editorCertId);
      });
    });

    async function cargarImagen(inputId, key) {
      const input = document.getElementById(inputId);
      input?.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        editorDraft[key] = await leerArchivoComoDataUrl(file);
        guardarImagenCert(editorCertId, editorDraft);
        previewCert(editorFaseId, editorCertId);
        actualizarIndicadoresImagen();
        input.value = '';
      });
    }

    cargarImagen('cla-ed-fondo', 'fondo');
    cargarImagen('cla-ed-logo', 'logo');
    cargarImagen('cla-ed-firma', 'firmaImg');

    document.getElementById('cla-editor-guardar')?.addEventListener('click', () => {
      aplicarEditorDraftPreview();
      dialog.close();
    });

    document.getElementById('cla-editor-cerrar')?.addEventListener('click', () => dialog.close());

    document.getElementById('cla-editor-reset')?.addEventListener('click', () => {
      editorDraft = configImagenDefault();
      guardarImagenCert(editorCertId, editorDraft);
      syncEditorDraftToForm();
      previewCert(editorFaseId, editorCertId);
      actualizarIndicadoresImagen();
    });
  }

  const primer = resolverCert('fase-1', 'f1-participacion');
  if (primer?.cert?.plantilla) {
    const form = leerFormulario();
    mostrarPreview(
      buildModelo(primer.cert.plantilla, {
        nombre: form.nombre,
        rut: form.rut,
        fechaInput: form.fechaInput,
        esFinal: false,
        mencion: '',
        certId: 'f1-participacion'
      }),
      { certId: 'f1-participacion', etiqueta: primer.cert.etiqueta }
    );
  }
  renderEmitidos();

  root.querySelectorAll('#cla-participante, #cla-rut, #cla-fecha').forEach((el) => {
    el.addEventListener('input', () => {
      if (ultimoMeta?.certId) {
        previewCert(
          ultimoMeta.certId === 'final' ? 'final' : ultimoMeta.faseId || 'fase-1',
          ultimoMeta.certId
        );
      }
    });
  });

  root.querySelectorAll('[data-preview]').forEach((btn) => {
    btn.addEventListener('click', () => previewCert(btn.dataset.fase, btn.dataset.preview));
  });

  root.querySelectorAll('[data-editar]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      abrirEditorImagen(btn.dataset.fase, btn.dataset.editar);
    });
  });

  bindEditorImagen();

  root.querySelectorAll('[data-catalogo]').forEach((btn) => {
    btn.addEventListener('click', () => previewCert(btn.dataset.fase, btn.dataset.catalogo));
  });

  root.querySelectorAll('[data-generar]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const res = datosDeCert(btn.dataset.fase, btn.dataset.generar, false);
      const alert = document.getElementById(`alert-${btn.dataset.generar}`);
      if (!res) return;

      if (!res.ok) {
        alert.hidden = false;
        alert.className = 'cla-alerta cla-alerta--error';
        alert.textContent = `No cumple requisito: ${res.cert.requisito}`;
        return;
      }

      alert.hidden = false;
      alert.className = 'cla-alerta cla-alerta--ok';
      alert.textContent = 'Certificado generado.';
      mostrarPreview(res.modelo, res.meta);
      guardarEmitido({
        certId: btn.dataset.generar,
        participante: res.modelo.nombre,
        rut: res.modelo.rut,
        etiqueta: res.cert.etiqueta,
        fase: res.fase?.numero ?? 'final'
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
        'Faltan certificados de aprobación. Se requieren: Fase 1, Fase 2 y Fase 3.';
      return;
    }

    const res = datosDeCert('final', 'final', true);
    if (!res) return;

    mostrarPreview(res.modelo, res.meta);
    alert.hidden = false;
    alert.className = 'cla-alerta cla-alerta--ok';
    alert.textContent = 'Diploma final generado.';
    guardarEmitido({
      certId: 'final',
      participante: res.modelo.nombre,
      rut: res.modelo.rut,
      etiqueta: proyecto.certificadoFinal.etiqueta,
      fase: 'final'
    });
  });

  document.getElementById('cla-descargar')?.addEventListener('click', async () => {
    if (!ultimoModelo) return;

    const slug = (ultimoModelo.nombre || 'participante').replace(/\s+/g, '-').toLowerCase();
    const fileName = `CLA-${ultimoMeta.certId || 'cert'}-${slug}-${W}x${H}.png`;

    if (!window.html2canvas) {
      const hint = document.getElementById('cla-size-hint');
      if (hint) hint.textContent = 'No se pudo cargar html2canvas. Revisa tu conexión.';
      return;
    }

    const off = document.createElement('div');
    off.style.cssText = 'position:fixed;left:-9999px;top:0;';
    off.innerHTML = renderCertificadoHtml(ultimoModelo);
    document.body.appendChild(off);
    const certEl = off.querySelector('.cla-cert');
    certEl.style.setProperty('--cla-scale', '1');

    try {
      const canvas = await html2canvas(certEl, {
        scale: 1,
        width: W,
        height: H,
        useCORS: true,
        backgroundColor: '#0c2340'
      });
      const a = document.createElement('a');
      a.download = fileName;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } finally {
      document.body.removeChild(off);
    }
  });

  document.getElementById('cla-exportar-imagenes')?.addEventListener('click', exportarImagenesCla);

  window.addEventListener('resize', ajustarEscalaPreview);
  }

  initCla();
})();
