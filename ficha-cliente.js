/**
 * Ficha de cliente — vista tipo documento / PDF editable.
 * Requiere app.js cargado antes (datos, clienteDe, escapeHtml, etc.).
 */
(function () {
  const MAX_DOC_BYTES = 4 * 1024 * 1024;
  const MAX_DOC_TEXTO = 50000;
  const MAX_DOC_DATAURL = 700 * 1024;

  function asegurarFichaCliente(cli) {
    if (!cli) return;
    initContextoCliente(datos);
    if (!cli.ficha.documentos) cli.ficha.documentos = [];
    cli.ficha.documentos.forEach(d => {
      if (!d.clienteId) d.clienteId = cli.id;
    });
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  const ACCEPT_ARCHIVOS_FICHA = 'image/*,video/*,audio/*,application/pdf,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.csv,.html,.json,.zip,.rar,.7z';

  function categoriaDocumento(file) {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (/^image\//.test(file.type) || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'imagen';
    if (file.type === 'application/pdf' || ext === 'pdf') return 'pdf';
    if (/^video\//.test(file.type) || ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
    if (/^audio\//.test(file.type) || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
    if (/^text\//.test(file.type) || ['txt', 'md', 'csv', 'html', 'json'].includes(ext)) return 'texto';
    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) return 'office';
    return 'otro';
  }

  function integrarTextoEnFicha(cli, nombreArchivo, texto) {
    if (!texto?.trim()) return null;
    initContextoCliente(datos);
    const bloque = '\n\n--- Extraído de «' + nombreArchivo + '» ---\n' + texto.trim();
    if (esClienteDiseno(cli)) {
      cli.manualMarca = cli.manualMarca || { texto: '', archivos: [], actualizado: '' };
      cli.manualMarca.texto = ((cli.manualMarca.texto || '').trim() + bloque).trim();
      cli.manualMarca.actualizado = toISO(hoy());
      return 'manual de marca';
    }
    cli.ficha.notas = ((cli.ficha.notas || '').trim() + bloque).trim();
    return 'notas generales';
  }

  function etiquetaMetodoExtraccion(metodo) {
    const map = {
      'pdf-texto': 'Texto extraído del PDF',
      'pdf-ocr': 'Texto leído del PDF (OCR)',
      'ocr': 'Texto leído de la imagen (OCR)',
      'pdf-vacio': 'PDF sin texto detectable',
      'sin-pdfjs': 'PDF guardado — falta cargar pdf.js',
      'sin-tesseract': 'Imagen guardada — falta cargar OCR',
      error: 'No se pudo leer el archivo'
    };
    return map[metodo] || 'Archivo guardado';
  }

  async function agregarDocumentoFicha(cliId, file) {
    const cli = clienteDe(cliId);
    if (!cli || !file) return;
    if (file.size > MAX_DOC_BYTES) {
      mostrarToast('Archivo muy grande (máx. 4 MB por archivo)');
      return;
    }
    asegurarFichaCliente(cli);
    const cat = categoriaDocumento(file);
    const doc = {
      id: id(),
      clienteId: cli.id,
      nombre: file.name,
      mime: file.type || 'application/octet-stream',
      categoria: cat,
      tamano: file.size,
      subido: toISO(hoy()),
      contenidoTexto: '',
      dataUrl: '',
      notasAnalisis: '',
      extraccionMetodo: '',
      extraccionEstado: 'pendiente'
    };
    const necesitaExtraccion = cat === 'imagen' || cat === 'pdf';
    if (necesitaExtraccion) {
      mostrarToast('Leyendo «' + file.name + '»…');
    }
    try {
      if (cat === 'texto') {
        const texto = await file.text();
        doc.contenidoTexto = texto.length > MAX_DOC_TEXTO ? texto.slice(0, MAX_DOC_TEXTO) : texto;
        doc.notasAnalisis = 'Texto extraído y guardado para este cliente.';
        doc.extraccionEstado = 'ok';
        doc.extraccionMetodo = 'texto';
      } else if (cat === 'imagen') {
        if (file.size <= MAX_DOC_DATAURL) doc.dataUrl = await readFileAsDataURL(file);
        if (window.fichaExtraerTexto) {
          const res = await window.fichaExtraerTexto(file, 'imagen', pct => {
            mostrarToast('Leyendo imagen «' + file.name + '»… ' + pct + '%');
          });
          doc.extraccionMetodo = res.metodo;
          if (res.texto) {
            doc.contenidoTexto = res.texto.length > MAX_DOC_TEXTO ? res.texto.slice(0, MAX_DOC_TEXTO) : res.texto;
            doc.extraccionEstado = 'ok';
            doc.notasAnalisis = etiquetaMetodoExtraccion(res.metodo);
            const destino = integrarTextoEnFicha(cli, file.name, doc.contenidoTexto);
            if (destino) doc.notasAnalisis += ' · agregado a ' + destino;
          } else {
            doc.extraccionEstado = res.metodo === 'error' ? 'error' : 'vacio';
            doc.notasAnalisis = etiquetaMetodoExtraccion(res.metodo);
          }
        } else {
          doc.extraccionEstado = 'vacio';
          doc.notasAnalisis = 'Imagen · ' + Math.round(file.size / 1024) + ' KB';
        }
      } else if (cat === 'pdf') {
        if (window.fichaExtraerTexto) {
          const res = await window.fichaExtraerTexto(file, 'pdf', (pct, tipo, pag, total) => {
            if (tipo === 'pdf-ocr' && pag) {
              mostrarToast('Leyendo PDF «' + file.name + '» pág. ' + pag + '/' + total + '…');
            } else {
              mostrarToast('Leyendo PDF «' + file.name + '»… ' + pct + '%');
            }
          });
          doc.extraccionMetodo = res.metodo;
          if (res.texto) {
            doc.contenidoTexto = res.texto.length > MAX_DOC_TEXTO ? res.texto.slice(0, MAX_DOC_TEXTO) : res.texto;
            doc.extraccionEstado = 'ok';
            doc.notasAnalisis = etiquetaMetodoExtraccion(res.metodo);
            const destino = integrarTextoEnFicha(cli, file.name, doc.contenidoTexto);
            if (destino) doc.notasAnalisis += ' · agregado a ' + destino;
          } else {
            doc.extraccionEstado = res.metodo === 'error' ? 'error' : 'vacio';
            doc.notasAnalisis = etiquetaMetodoExtraccion(res.metodo) + ' · ' + Math.round(file.size / 1024) + ' KB';
          }
        } else {
          doc.extraccionEstado = 'vacio';
          doc.notasAnalisis = 'PDF · ' + Math.round(file.size / 1024) + ' KB';
        }
      } else if (cat === 'video') {
        doc.notasAnalisis = `Video · ${Math.round(file.size / 1024 / 1024 * 10) / 10} MB · referencia guardada`;
      } else if (cat === 'audio') {
        doc.notasAnalisis = `Audio · ${Math.round(file.size / 1024)} KB · referencia guardada`;
      } else if (cat === 'office') {
        doc.notasAnalisis = `Office · ${file.name} · referencia guardada para ${cli.abrev || cli.nombre}`;
      } else {
        doc.notasAnalisis = `Documento · ${file.name}`;
        if (/^text\//.test(file.type) || file.name.match(/\.(txt|md|csv)$/i)) {
          const texto = await file.text();
          doc.contenidoTexto = texto.slice(0, MAX_DOC_TEXTO);
        }
      }
    } catch (err) {
      console.warn(err);
      doc.extraccionEstado = 'error';
      doc.notasAnalisis = 'Archivo registrado: ' + file.name;
    }
    cli.ficha.documentos.push(doc);
    cli.ficha.actualizado = toISO(hoy());
    guardar();
    if (doc.contenidoTexto?.trim()) {
      mostrarToast('«' + file.name + '» leído y agregado a la ficha de ' + (cli.abrev || cli.nombre));
    } else {
      mostrarToast('«' + file.name + '» guardado en ficha de ' + (cli.abrev || cli.nombre));
    }
    if (clientePerfilAbierto === cliId) renderFichaCliente(cli);
    render();
  }

  function extractoDocumentosFicha(cli, maxChars = 8000) {
    asegurarFichaCliente(cli);
    const partes = (cli.ficha.documentos || [])
      .filter(d => d.clienteId === cli.id)
      .map(d => {
        const cab = `- ${d.nombre} (${d.categoria})`;
        if (d.contenidoTexto?.trim()) return cab + ':\n' + d.contenidoTexto.trim();
        if (d.notasAnalisis) return cab + ': ' + d.notasAnalisis;
        return cab;
      });
    let out = partes.join('\n\n');
    if (out.length > maxChars) out = out.slice(0, maxChars) + '\n…';
    return out;
  }

  function htmlListaDocumentos(cli) {
    asegurarFichaCliente(cli);
    const docs = (cli.ficha.documentos || []).filter(d => d.clienteId === cli.id);
    if (!docs.length) {
      return '<p class="ficha-documentos-vacio ficha-solo-edicion">Sin archivos aún. Sube <strong>imágenes, PDFs, videos, audio, textos</strong> u otros — solo en la ficha de <strong>' + escapeHtml(cli.nombre) + '</strong>.</p>';
    }
    return '<ul class="ficha-documentos-lista">' + docs.map(d => {
      const iconos = { imagen: '🖼', pdf: '📄', video: '🎬', audio: '🎵', texto: '📝', office: '📊', otro: '📎' };
      const preview = d.categoria === 'imagen' && d.dataUrl
        ? '<img src="' + d.dataUrl + '" alt="" class="ficha-doc-thumb">'
        : '<span class="ficha-doc-icono">' + (iconos[d.categoria] || '📎') + '</span>';
      const estadoCls = d.extraccionEstado === 'ok' ? ' ficha-documento-item--extraido'
        : d.extraccionEstado === 'error' ? ' ficha-documento-item--error' : '';
      const badge = d.extraccionEstado === 'ok'
        ? '<span class="ficha-doc-badge ficha-doc-badge--ok">Texto extraído</span>'
        : d.extraccionEstado === 'vacio'
          ? '<span class="ficha-doc-badge ficha-doc-badge--vacio">Sin texto detectado</span>'
          : '';
      const esRefManual = d.id === 'doc-manual-marca-jm' || /manual de marca/i.test(d.nombre || '');
      const extractoVista = d.contenidoTexto && !esRefManual
        ? '<div class="ficha-documento-item__vista">' + formatearTextoFichaVista(d.contenidoTexto) + '</div>'
        : esRefManual
          ? '<p class="ficha-documento-item__ref">Contenido integrado en <strong>Manual de marca</strong></p>'
          : '';
      const extractoEdicion = d.contenidoTexto
        ? '<details class="ficha-documento-item__detalle ficha-solo-edicion"><summary>Ver texto extraído</summary><pre class="ficha-documento-item__extracto">' +
          escapeHtml(d.contenidoTexto) + '</pre></details>'
        : '';
      return '<li class="ficha-documento-item' + estadoCls + '" data-doc-id="' + d.id + '">' +
        preview +
        '<div class="ficha-documento-item__info">' +
        '<strong>' + escapeHtml(d.nombre) + '</strong> ' + badge +
        '<span class="ficha-documento-item__meta">' + escapeHtml(d.notasAnalisis || d.categoria) + '</span>' +
        extractoVista +
        extractoEdicion +
        '</div>' +
        '<button type="button" class="btn btn--small archivo-btn--del ficha-solo-edicion" data-del-doc-ficha="' + d.id + '" title="Quitar">✕</button></li>';
    }).join('') + '</ul>';
  }

  function htmlSeccionDocumentos(cli) {
    const docs = (cli.ficha.documentos || []).filter(d => d.clienteId === cli.id);
    const sinDocs = !docs.length;
    return '<section id="ficha-seccion-documentos" class="ficha-seccion ficha-seccion--documentos' + (sinDocs ? ' ficha-seccion--sin-contenido' : '') + '">' +
      '<div class="ficha-seccion__headline">' +
      '<h3 class="ficha-seccion__titulo">Documentos del cliente</h3>' +
      '<span class="ficha-seccion__estado ficha-seccion__estado--cliente ficha-solo-edicion">Solo ' + escapeHtml(cli.abrev || abrevDe(cli)) + '</span>' +
      '</div>' +
      '<p class="ficha-doc__hint ficha-solo-edicion">Sube <strong>imágenes</strong> o <strong>PDFs</strong> y el texto se leerá automáticamente y se agregará a la ficha de <strong>' + escapeHtml(cli.nombre) + '</strong> (manual de marca o notas).</p>' +
      '<div class="ficha-documentos-upload ficha-solo-edicion">' +
      '<label class="btn btn--small btn--primary">+ Imagen<input type="file" id="ficha-imagen-file" multiple accept="image/*" hidden></label>' +
      '<label class="btn btn--small btn--primary">+ PDF<input type="file" id="ficha-pdf-file" multiple accept="application/pdf,.pdf" hidden></label>' +
      '<label class="btn btn--small btn--ghost">+ Otro archivo<input type="file" id="ficha-documentos-file" multiple accept="' + ACCEPT_ARCHIVOS_FICHA + '" hidden></label>' +
      '</div>' +
      htmlListaDocumentos(cli) +
      '</section>';
  }

  function aplicarTemaClienteFicha(cli) {
    const col = colorDe(cli);
    const modal = document.getElementById('modal-cliente-perfil');
    if (!modal || !cli) return;
    modal.dataset.clienteId = cli.id;
    modal.dataset.clienteColor = cli.color || 'lavanda';
    const vars = [
      ['--ficha-accent', col.border],
      ['--ficha-bg', col.bg],
      ['--ficha-text', col.text]
    ];
    const nodos = [
      modal,
      modal.querySelector('.ficha-shell'),
      modal.querySelector('.modal__panel--ficha'),
      document.getElementById('ficha-scroll'),
      document.getElementById('ficha-doc')
    ];
    nodos.forEach(el => {
      if (!el) return;
      vars.forEach(([k, v]) => el.style.setProperty(k, v));
    });
    const toolbar = modal.querySelector('.ficha-toolbar');
    if (toolbar) {
      toolbar.style.background = col.border;
      toolbar.style.borderColor = col.text;
    }
    const footer = modal.querySelector('.ficha-footer');
    if (footer) {
      footer.style.background = col.bg;
      footer.style.borderTopColor = col.border;
    }
    const panel = modal.querySelector('.modal__panel--ficha');
    if (panel) panel.style.background = col.bg;
    const scroll = document.getElementById('ficha-scroll');
    if (scroll) scroll.style.background = col.bg;
  }

  function formatearTextoFichaVista(texto) {
    if (!texto?.trim()) return '<em class="ficha-campo-vista--vacio">Sin información</em>';
    const resaltarColores = s => s.replace(
      /(#[0-9A-Fa-f]{6})/g,
      '<span class="ficha-vista__color" style="background:$1" title="$1"></span> <code class="ficha-vista__hex">$1</code>'
    );
    const lines = texto.trim().split('\n');
    let html = '';
    let enLista = false;
    for (const line of lines) {
      const t = line.trim();
      if (!t) {
        if (enLista) { html += '</ul>'; enLista = false; }
        continue;
      }
      if (/^##\s+/.test(t)) {
        if (enLista) { html += '</ul>'; enLista = false; }
        html += '<h4 class="ficha-vista__h">' + escapeHtml(t.replace(/^##\s+/, '')) + '</h4>';
      } else if (/^[-•*]\s+/.test(t)) {
        if (!enLista) { html += '<ul class="ficha-vista__lista">'; enLista = true; }
        html += '<li>' + resaltarColores(escapeHtml(t.replace(/^[-•*]\s+/, ''))) + '</li>';
      } else {
        if (enLista) { html += '</ul>'; enLista = false; }
        html += '<p class="ficha-vista__p">' + resaltarColores(escapeHtml(t)) + '</p>';
      }
    }
    if (enLista) html += '</ul>';
    return html;
  }

  function htmlBloqueVistaCampo(inputId, valor) {
    return '<div class="ficha-campo-vista" id="' + inputId + '-vista">' +
      formatearTextoFichaVista(valor) + '</div>';
  }

  function htmlSeccionFichaExtra(seccion) {
    const sid = seccion.id || id();
    const titulo = (seccion.titulo || '').trim();
    const contenido = (seccion.contenido || '').trim();
    const sinContenido = !titulo && !contenido;
    return '<section class="ficha-seccion ficha-seccion--extra' + (sinContenido ? ' ficha-seccion--sin-contenido' : '') + '" data-seccion-id="' + sid + '">' +
      '<div class="ficha-seccion__head ficha-solo-edicion">' +
      '<input type="text" class="ficha-seccion__titulo-input" data-seccion-titulo value="' + escapeHtml(seccion.titulo || '') + '" placeholder="Título de la sección">' +
      '<button type="button" class="btn btn--small archivo-btn--del ficha-seccion__eliminar" data-eliminar-seccion="' + sid + '" title="Eliminar sección">✕</button>' +
      '</div>' +
      '<h3 class="ficha-seccion__titulo ficha-seccion__titulo--vista">' + escapeHtml(titulo || 'Nueva sección') + '</h3>' +
      htmlBloqueVistaCampo('seccion-extra-' + sid, contenido) +
      '<textarea class="ficha-campo ficha-solo-edicion" data-seccion-cuerpo rows="4" placeholder="Contenido de esta sección…">' + escapeHtml(seccion.contenido || '') + '</textarea>' +
      '</section>';
  }

  function sincronizarTitulosSeccionesExtra(contenedor) {
    if (!contenedor) return;
    contenedor.querySelectorAll('.ficha-seccion--extra').forEach(sec => {
      const input = sec.querySelector('[data-seccion-titulo]');
      const vista = sec.querySelector('.ficha-seccion__titulo--vista');
      if (!input || !vista) return;
      const actualizar = () => { vista.textContent = input.value.trim() || 'Nueva sección'; };
      if (input._fichaTituloHandler) input.removeEventListener('input', input._fichaTituloHandler);
      input._fichaTituloHandler = actualizar;
      input.addEventListener('input', actualizar);
      actualizar();
    });
  }

  function bindFichaEventos(doc, cli) {
    doc.querySelectorAll('[data-del-perfil-archivo]').forEach(btn => {
      const nuevo = btn.cloneNode(true);
      btn.replaceWith(nuevo);
      nuevo.addEventListener('click', () => {
        cli.manualMarca.archivos = cli.manualMarca.archivos.filter(a => a.id !== nuevo.dataset.delPerfilArchivo);
        guardar();
        renderFichaCliente(cli);
      });
    });
    doc.querySelectorAll('[data-eliminar-seccion]').forEach(btn => {
      const nuevo = btn.cloneNode(true);
      btn.replaceWith(nuevo);
      nuevo.addEventListener('click', () => {
        const sid = nuevo.dataset.eliminarSeccion;
        cli.ficha.seccionesExtra = cli.ficha.seccionesExtra.filter(s => s.id !== sid);
        nuevo.closest('.ficha-seccion--extra')?.remove();
        guardar();
      });
    });
    doc.querySelectorAll('[data-del-doc-ficha]').forEach(btn => {
      const nuevo = btn.cloneNode(true);
      btn.replaceWith(nuevo);
      nuevo.addEventListener('click', () => {
        const docId = nuevo.dataset.delDocFicha;
        cli.ficha.documentos = (cli.ficha.documentos || []).filter(d => d.id !== docId);
        guardar();
        renderFichaCliente(cli);
      });
    });
  }

  function bindDocumentosFicha(cli) {
    function enlazarInput(inputId) {
      const input = document.getElementById(inputId);
      if (!input) return;
      const nuevo = input.cloneNode(true);
      input.replaceWith(nuevo);
      nuevo.addEventListener('change', async e => {
        const cliId = document.getElementById('perfil-cliente-id')?.value || clientePerfilAbierto;
        if (cliId !== cli.id) return;
        const files = [...(e.target.files || [])];
        e.target.value = '';
        for (const f of files) await agregarDocumentoFicha(cliId, f);
      });
    }
    enlazarInput('ficha-imagen-file');
    enlazarInput('ficha-pdf-file');
    enlazarInput('ficha-documentos-file');
  }

  function definicionCamposFicha(cli) {
    const f = cli.ficha || {};
    const campos = [
      { id: 'metas', label: 'Metas a lograr', seccionId: 'ficha-seccion-metas', inputId: 'perfil-metas', valor: cli.metas || '', placeholder: 'Objetivos del mes, KPIs, entregables clave…', rows: 3, critico: true },
      { id: 'contexto', label: 'Contexto para prompts', seccionId: 'ficha-seccion-contexto', inputId: 'perfil-contexto', valor: cli.contextoPrompt || '', placeholder: 'Tono, audiencia, restricciones, preferencias…', rows: 3, critico: true },
      { id: 'contacto', label: 'Contacto y stakeholders', seccionId: 'ficha-seccion-contacto', inputId: 'perfil-contacto', valor: f.contacto || '', placeholder: 'Contactos, correos, quién aprueba…', rows: 3 },
      { id: 'links', label: 'Links y recursos', seccionId: 'ficha-seccion-links', inputId: 'perfil-links', valor: f.links || '', placeholder: 'Drive, Figma, sitio web, carpetas…', rows: 3 },
      { id: 'notas', label: 'Notas generales', seccionId: 'ficha-seccion-notas', inputId: 'perfil-notas', valor: f.notas || '', placeholder: 'Detalles relevantes del cliente…', rows: 3 }
    ];
    if (esClienteDiseno(cli)) {
      campos.splice(4, 0, {
        id: 'manual',
        label: 'Manual de marca',
        seccionId: 'ficha-seccion-manual',
        inputId: 'perfil-manual',
        valor: cli.manualMarca?.texto || '',
        placeholder: 'Colores, tipografías, logo, tono visual…',
        rows: 6,
        esManual: true,
        critico: true
      });
    }
    return campos.map(c => ({
      ...c,
      completo: c.esManual
        ? (manualMarcaCargado(cli) || (cli.ficha?.documentos || []).some(d => d.clienteId === cli.id))
        : !!(c.valor || '').trim()
    }));
  }

  function camposFichaFaltantes(cli) {
    return definicionCamposFicha(cli).filter(c => !c.completo);
  }

  function camposFichaSugeridos(cli) {
    return definicionCamposFicha(cli).map(c => c.label);
  }

  function fichaTieneContenido(cli) {
    return contextoClienteCargado(cli);
  }

  function fichaEstaCompleta(cli) {
    return camposFichaFaltantes(cli).length === 0;
  }

  function htmlSeccionCampo(campo, extraHtml) {
    const tieneValor = !!(campo.valor || '').trim();
    const claseSec = campo.completo ? 'ficha-seccion--ok' : 'ficha-seccion--falta';
    const claseVacia = !tieneValor ? ' ficha-seccion--sin-contenido' : '';
    const badge = campo.completo
      ? '<span class="ficha-seccion__estado ficha-seccion__estado--ok ficha-solo-edicion">Completo</span>'
      : '<span class="ficha-seccion__estado ficha-seccion__estado--falta ficha-solo-edicion">Falta información</span>';
    const claseCampo = campo.completo ? '' : ' ficha-campo--vacio';
    const manualClass = campo.esManual ? ' ficha-campo--manual' : '';
  return '<section id="' + campo.seccionId + '" class="ficha-seccion ' + claseSec + claseVacia + '" data-campo-ficha="' + campo.id + '">' +
      '<div class="ficha-seccion__headline">' +
      '<h3 class="ficha-seccion__titulo">' + escapeHtml(campo.label) + '</h3>' + badge +
      '</div>' +
      htmlBloqueVistaCampo(campo.inputId, campo.valor) +
      '<textarea id="' + campo.inputId + '" class="ficha-campo ficha-solo-edicion' + claseCampo + manualClass + '" rows="' + campo.rows + '" ' +
      'data-placeholder-vacio="Agrega ' + escapeHtml(campo.label.toLowerCase()) + '…" ' +
      'placeholder="' + escapeHtml(campo.placeholder) + '">' + escapeHtml(campo.valor) + '</textarea>' +
      (extraHtml ? extraHtml.replace('no-print', 'ficha-solo-edicion') : '') +
      '</section>';
  }

  function htmlAvisoCompletarFicha(cli) {
    const campos = definicionCamposFicha(cli);
    const faltantes = campos.filter(c => !c.completo);
    if (!faltantes.length) {
      return '<aside class="ficha-completar ficha-completar--ok ficha-solo-edicion">' +
        '<p class="ficha-completar__titulo">Ficha completa</p>' +
        '<p class="ficha-completar__texto">Puedes seguir editando para actualizar cualquier dato del cliente.</p>' +
        '</aside>';
    }
    const sinNada = !fichaTieneContenido(cli);
    const titulo = sinNada
      ? 'Necesito información de este cliente'
      : 'Puedes agregar más información';
    const texto = sinNada
      ? 'Completa lo que puedas — no es obligatorio llenar todo. Guarda con lo que tengas y sigue después.'
      : 'Puedes guardar con lo que ya cargaste y agregar más cuando quieras. Cada cliente guarda su info por separado.';
    return '<aside class="ficha-completar ficha-completar--pendiente ficha-solo-edicion" id="ficha-aviso-completar">' +
      '<p class="ficha-completar__titulo">' + titulo + '</p>' +
      '<p class="ficha-completar__texto">' + texto + '</p>' +
      '<ul class="ficha-completar__lista">' +
      campos.map(c =>
        '<li class="ficha-completar__item ficha-completar__item--' + (c.completo ? 'ok' : 'falta') + '">' +
        '<span class="ficha-completar__icono">' + (c.completo ? '✓' : '○') + '</span>' +
        '<span class="ficha-completar__label">' + escapeHtml(c.label) + '</span>' +
        (c.completo ? '' : '<button type="button" class="ficha-completar__ir btn btn--ghost btn--small" data-ir-campo="' + c.inputId + '">Completar</button>') +
        '</li>'
      ).join('') +
      '</ul>' +
      '<div class="ficha-completar__acciones">' +
      '<button type="button" class="btn btn--primary btn--small" id="btn-ficha-comenzar-carga">' +
      (sinNada ? 'Comenzar a cargar' : 'Agregar lo que falta') +
      '</button></div></aside>';
  }

  function irACampoFicha(inputId) {
    setModoFicha('edicion');
    const el = document.getElementById(inputId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => el.focus(), 200);
  }

  function actualizarVistaDesdeFormulario() {
    const doc = document.getElementById('ficha-doc');
    if (!doc) return;
    doc.querySelectorAll('.ficha-campo[id]').forEach(ta => {
      const vista = document.getElementById(ta.id + '-vista');
      if (vista) vista.innerHTML = formatearTextoFichaVista(ta.value);
      const sec = ta.closest('.ficha-seccion');
      if (sec) sec.classList.toggle('ficha-seccion--sin-contenido', !ta.value.trim());
    });
    doc.querySelectorAll('.ficha-seccion--extra').forEach(sec => {
      const body = sec.querySelector('[data-seccion-cuerpo]');
      const titulo = sec.querySelector('.ficha-seccion__titulo--vista');
      const sid = sec.dataset.seccionId;
      const vista = document.getElementById('seccion-extra-' + sid + '-vista');
      if (vista && body) vista.innerHTML = formatearTextoFichaVista(body.value);
      const tiene = (body?.value || '').trim() || (titulo?.textContent || '').trim();
      sec.classList.toggle('ficha-seccion--sin-contenido', !tiene || titulo?.textContent === 'Nueva sección');
    });
    const docSec = document.getElementById('ficha-seccion-documentos');
    if (docSec) {
      const tieneDocs = !!docSec.querySelector('.ficha-documentos-lista');
      docSec.classList.toggle('ficha-seccion--sin-contenido', !tieneDocs);
    }
  }

  function sincronizarCamposVacios() {
    const doc = document.getElementById('ficha-doc');
    if (!doc || !doc.classList.contains('ficha-doc--vista')) return;
    actualizarVistaDesdeFormulario();
  }

  function actualizarToolbarFicha(cli) {
    const faltantes = camposFichaFaltantes(cli);
    const btnEditar = document.getElementById('btn-ficha-modo-editar');
    if (btnEditar) {
      btnEditar.classList.toggle('btn--warning', faltantes.length > 0);
      btnEditar.title = faltantes.length
        ? 'Faltan ' + faltantes.length + ' campo(s) — puedes guardar igual con lo que tengas'
        : 'Editar ficha del cliente';
    }
    const btnFooter = document.getElementById('btn-ficha-guardar-footer');
    const lblFooter = document.getElementById('ficha-footer-cliente');
    if (btnFooter) btnFooter.textContent = faltantes.length ? 'Guardar lo que tengo' : 'Guardar ficha';
    if (lblFooter && cli) {
      lblFooter.textContent = 'Cliente: ' + (cli.nombre || cli.abrev || '—');
      lblFooter.title = 'Los datos se guardan solo para este cliente';
    }
    const toolbarCliente = document.getElementById('ficha-toolbar-cliente');
    if (toolbarCliente && cli) {
      const col = colorDe(cli);
      toolbarCliente.innerHTML =
        '<span class="ficha-toolbar__badge">' + escapeHtml(etiquetaTipoCliente(cli.tipo)) + '</span>' +
        '<span class="ficha-toolbar__abrev">' + escapeHtml(cli.abrev || abrevDe(cli)) + '</span>';
      toolbarCliente.style.color = col.text;
      const badge = toolbarCliente.querySelector('.ficha-toolbar__badge');
      if (badge) {
        badge.style.background = col.border;
        badge.style.color = '#fff';
      }
    }
  }

  function bindCompletarFicha() {
    document.getElementById('btn-ficha-comenzar-carga')?.addEventListener('click', () => {
      const cli = clienteDe(clientePerfilAbierto);
      const primero = camposFichaFaltantes(cli)[0];
      if (primero) irACampoFicha(primero.inputId);
      else setModoFicha('edicion');
    });
    document.querySelectorAll('[data-ir-campo]').forEach(btn => {
      btn.addEventListener('click', () => irACampoFicha(btn.dataset.irCampo));
    });
  }

  function htmlRolesDetalle(cli) {
    const roles = cli.roles || [];
    if (!roles.length) return '';
    return roles.map(r => {
      const funcs = (r.funciones || '').split('\n').filter(Boolean);
      const plazos = (r.plazosEntregables || '').split('\n').filter(Boolean);
      return '<article class="ficha-rol">' +
        '<h4 class="ficha-rol__titulo"><span class="ficha-rol__abrev">' + escapeHtml(r.abrev || '') + '</span> ' + escapeHtml(r.nombre || '') + '</h4>' +
        (funcs.length
          ? '<div class="ficha-rol__bloque"><span class="ficha-rol__label">Funciones</span><ul class="ficha-rol__lista">' +
            funcs.map(f => '<li>' + escapeHtml(f) + '</li>').join('') + '</ul></div>'
          : '') +
        (plazos.length
          ? '<div class="ficha-rol__bloque"><span class="ficha-rol__label">Plazos y entregables</span><ul class="ficha-rol__lista">' +
            plazos.map(p => '<li>' + escapeHtml(p) + '</li>').join('') + '</ul></div>'
          : '') +
        '</article>';
    }).join('');
  }

  function htmlAvisoFichaVacia(cli) {
    return htmlAvisoCompletarFicha(cli);
  }

  function setModoFicha(modo) {
    const doc = document.getElementById('ficha-doc');
    if (!doc) return;
    doc.classList.toggle('ficha-doc--vista', modo === 'vista');
    doc.classList.toggle('ficha-doc--edicion', modo === 'edicion');
    document.getElementById('btn-ficha-modo-vista')?.classList.toggle('btn--accent', modo === 'vista');
    document.getElementById('btn-ficha-modo-editar')?.classList.toggle('btn--accent', modo === 'edicion');
    if (modo === 'vista') actualizarVistaDesdeFormulario();
    else sincronizarCamposVacios();
    const cli = clienteDe(clientePerfilAbierto);
    if (cli) actualizarToolbarFicha(cli);
  }

  function leerFichaDesdeFormulario(cli) {
    initContextoCliente(datos);
    let textoManual = document.getElementById('perfil-manual')?.value?.trim() || '';
    if (textoManual.length > MAX_MANUAL_MARCA_CHARS) {
      textoManual = textoManual.slice(0, MAX_MANUAL_MARCA_CHARS);
      mostrarToast('Manual recortado al límite de almacenamiento');
    }
    cli.metas = document.getElementById('perfil-metas')?.value?.trim() || '';
    cli.contextoPrompt = document.getElementById('perfil-contexto')?.value?.trim() || '';
    cli.manualMarca.texto = textoManual;
    cli.ficha.contacto = document.getElementById('perfil-contacto')?.value?.trim() || '';
    cli.ficha.links = document.getElementById('perfil-links')?.value?.trim() || '';
    cli.ficha.notas = document.getElementById('perfil-notas')?.value?.trim() || '';
    cli.ficha.seccionesExtra = [...document.querySelectorAll('.ficha-seccion--extra')].map(sec => ({
      id: sec.dataset.seccionId || id(),
      titulo: sec.querySelector('[data-seccion-titulo]')?.value.trim() || '',
      contenido: sec.querySelector('[data-seccion-cuerpo]')?.value.trim() || ''
    }));
    const ahora = toISO(hoy());
    cli.manualMarca.actualizado = ahora;
    cli.ficha.actualizado = ahora;
  }

  function renderFichaCliente(cli) {
    const doc = document.getElementById('ficha-doc');
    if (!doc || !cli) return;
    asegurarFichaCliente(cli);
    initContextoCliente(datos);
    const col = colorDe(cli);
    const skill = skillDe(cli);
    const agente = agenteDe(cli);
    const f = cli.ficha || {};
    const rolesResumen = (cli.roles || []).map(r =>
      '<li><strong>' + escapeHtml(r.abrev || '') + '</strong> · ' + escapeHtml(r.nombre) + '</li>'
    ).join('');
    const rolesDetalle = htmlRolesDetalle(cli);
    const avisoCompletar = htmlAvisoCompletarFicha(cli);
    const campos = definicionCamposFicha(cli);
    const tieneContenido = fichaTieneContenido(cli);
    const extras = (f.seccionesExtra || []).map(htmlSeccionFichaExtra).join('');
    const manualExtra = '<p class="ficha-manual-hint ficha-solo-edicion">También puedes subir imágenes, PDFs y videos en <strong>Documentos del cliente</strong> (más abajo).</p>';
    const seccionesCampos = campos.map(c =>
      htmlSeccionCampo(c, c.esManual ? manualExtra : '')
    ).join('');
    const modoActual = doc.classList.contains('ficha-doc--edicion') ? 'edicion' : 'vista';
    const actualizado = cli.manualMarca?.actualizado || f.actualizado;
    const fechaAct = actualizado
      ? parseISO(actualizado).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'Sin guardar aún';

    doc.classList.toggle('ficha-doc--sin-datos', !tieneContenido);
    doc.classList.toggle('ficha-doc--incompleta', !fichaEstaCompleta(cli));
    aplicarTemaClienteFicha(cli);
    doc.innerHTML =
      '<header class="ficha-doc__encabezado" style="border-bottom-color:' + col.border + '">' +
      '<div class="ficha-doc__marca" style="background:' + col.border + '"></div>' +
      '<div class="ficha-doc__head-grid"><div>' +
      '<p class="ficha-doc__tipo">' + escapeHtml(etiquetaTipoCliente(cli.tipo)) + '</p>' +
      '<h2 id="modal-perfil-titulo" class="ficha-doc__titulo">' + escapeHtml(cli.nombre) + '</h2>' +
      '<p class="ficha-doc__codigo">Código: <strong>' + escapeHtml(cli.abrev || abrevDe(cli)) + '</strong></p>' +
      '</div><div class="ficha-doc__meta-block">' +
      '<p><span class="ficha-doc__meta-label">Agente</span> ' + agente.emoji + ' ' + escapeHtml(agente.nombre) + '</p>' +
      '<p><span class="ficha-doc__meta-label">Skill</span> ' + escapeHtml(skill.nombre) + '</p>' +
      '</div></div>' +
      (rolesResumen ? '<ul class="ficha-doc__roles ficha-doc__roles--resumen">' + rolesResumen + '</ul>' : '') +
      '</header>' +
      (rolesDetalle
        ? '<section class="ficha-seccion ficha-seccion--operativa"><h3 class="ficha-seccion__titulo">Información operativa</h3>' +
          '<div class="ficha-roles-detalle">' + rolesDetalle + '</div></section>'
        : '') +
      avisoCompletar +
      '<p class="ficha-doc__intro ficha-solo-edicion">Esta ficha se incluye al generar prompts en <strong>Realizar tarea</strong>. Puedes guardar solo lo que tengas — no hace falta completar todo.</p>' +
      seccionesCampos +
      htmlSeccionDocumentos(cli) +
      '<div id="ficha-secciones-extra">' + extras + '</div>' +
      '<footer class="ficha-doc__pie"><span>Última actualización: ' + escapeHtml(fechaAct) + '</span>' +
      '<span class="ficha-doc__pie-marca">Organización · Ficha de cliente</span></footer>';

    bindFichaEventos(doc, cli);
    sincronizarTitulosSeccionesExtra(doc);
    bindDocumentosFicha(cli);
    bindCompletarFicha();
    actualizarToolbarFicha(cli);
    setModoFicha(modoActual);
    sincronizarCamposVacios();
  }

  function agregarSeccionFicha() {
    const cont = document.getElementById('ficha-secciones-extra');
    const cli = clienteDe(clientePerfilAbierto);
    if (!cont || !cli) return;
    initContextoCliente(datos);
    const seccion = { id: id(), titulo: '', contenido: '' };
    cli.ficha.seccionesExtra.push(seccion);
    cont.insertAdjacentHTML('beforeend', htmlSeccionFichaExtra(seccion));
    const doc = document.getElementById('ficha-doc');
    if (doc) {
      bindFichaEventos(doc, cli);
      sincronizarTitulosSeccionesExtra(doc);
    }
    setModoFicha('edicion');
    cont.lastElementChild?.querySelector('[data-seccion-titulo]')?.focus();
  }

  function imprimirFichaCliente() {
    const eraEdicion = document.getElementById('ficha-doc')?.classList.contains('ficha-doc--edicion');
    setModoFicha('vista');
    sincronizarTitulosSeccionesExtra(document.getElementById('ficha-doc'));
    window.print();
    if (eraEdicion) setModoFicha('edicion');
  }

  window.abrirFichaCliente = function (cliId) {
    const cli = clienteDe(cliId);
    if (!cli) return;
    const modal = document.getElementById('modal-cliente-perfil');
    if (modal && !modal.querySelector('.ficha-shell')) upgradeModalFicha();
    if (window.initFichaClienteUI) window.initFichaClienteUI();
    clientePerfilAbierto = cliId;
    initContextoCliente(datos);
    if (!modal) return;
    modal.hidden = false;
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-abierto');
    const idInput = document.getElementById('perfil-cliente-id');
    if (idInput) idInput.value = cliId;
    renderFichaCliente(cli);
    if (!document.getElementById('ficha-doc')) {
      mostrarToast('No se pudo cargar la ficha — recarga la página (Ctrl+F5)');
      return;
    }
    const faltantes = camposFichaFaltantes(cli);
    if (!fichaTieneContenido(cli)) {
      setModoFicha('edicion');
      const primero = faltantes[0];
      setTimeout(() => {
        if (primero) irACampoFicha(primero.inputId);
        else document.getElementById('perfil-metas')?.focus();
      }, 120);
      mostrarToast('Completa la información del cliente — se guarda en su ficha');
    } else if (faltantes.length) {
      setModoFicha('vista');
      mostrarToast('Faltan ' + faltantes.length + ' dato(s) — puedes agregarlos desde la ficha');
    } else {
      setModoFicha('vista');
    }
  };

  window.cerrarFichaCliente = function () {
    const modal = document.getElementById('modal-cliente-perfil');
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-abierto');
    const doc = document.getElementById('ficha-doc');
    if (doc) doc.innerHTML = '';
    clientePerfilAbierto = null;
  };

  window.guardarFichaCliente = function (e) {
    if (e) e.preventDefault();
    const cliId = document.getElementById('perfil-cliente-id')?.value || clientePerfilAbierto;
    const cli = clienteDe(cliId);
    if (!cli) return;
    leerFichaDesdeFormulario(cli);
    guardar();
    renderFichaCliente(cli);
    const faltantes = camposFichaFaltantes(cli);
    if (faltantes.length) {
      mostrarToast('Guardado para «' + (cli.abrev || cli.nombre) + '» — puedes avanzar con lo que cargaste');
      setModoFicha('edicion');
    } else {
      mostrarToast('Ficha de «' + (cli.abrev || cli.nombre) + '» guardada');
      setModoFicha('vista');
    }
    render();
  };

  window.agregarDocumentoFicha = agregarDocumentoFicha;
  window.extractoDocumentosFicha = extractoDocumentosFicha;
  window.aplicarTemaClienteFicha = aplicarTemaClienteFicha;
  window.renderFichaCliente = renderFichaCliente;

  window.initFichaClienteUI = function () {
    if (window._fichaUiBound) return;
    window._fichaUiBound = true;
    const modal = document.getElementById('modal-cliente-perfil');
    modal?.addEventListener('click', e => {
      if (e.target.closest('[data-cerrar-perfil]')) {
        window.cerrarFichaCliente();
        return;
      }
      const t = e.target.closest('#btn-ficha-modo-vista');
      if (t) { setModoFicha('vista'); return; }
      if (e.target.closest('#btn-ficha-modo-editar')) { setModoFicha('edicion'); return; }
      if (e.target.closest('#btn-ficha-agregar-seccion')) { agregarSeccionFicha(); return; }
      if (e.target.closest('#btn-ficha-imprimir')) { imprimirFichaCliente(); }
    });
    document.addEventListener('submit', e => {
      if (e.target?.id === 'form-perfil-cliente') window.guardarFichaCliente(e);
    });
  };

  function upgradeModalFicha() {
    const modal = document.getElementById('modal-cliente-perfil');
    if (!modal) return;
    if (modal.querySelector('.ficha-shell')) return;
    modal.className = 'modal modal--ficha';
    modal.innerHTML =
      '<div class="modal__backdrop" data-cerrar-perfil></div>' +
      '<div class="modal__panel modal__panel--ficha" role="dialog" aria-labelledby="modal-perfil-titulo">' +
      '<div class="ficha-shell">' +
      '<div class="ficha-toolbar no-print">' +
      '<div class="ficha-toolbar__izq">' +
      '<button type="button" class="btn btn--ghost btn--small" data-cerrar-perfil>← Volver</button>' +
      '<span id="ficha-toolbar-cliente" class="ficha-toolbar__cliente" aria-hidden="true"></span>' +
      '</div>' +
      '<div class="ficha-toolbar__acciones">' +
      '<button type="button" class="btn btn--ghost btn--small" id="btn-ficha-modo-vista">Vista ficha</button>' +
      '<button type="button" class="btn btn--ghost btn--small" id="btn-ficha-modo-editar">Editar</button>' +
      '<button type="button" class="btn btn--ghost btn--small" id="btn-ficha-agregar-seccion">+ Sección</button>' +
      '<button type="button" class="btn btn--ghost btn--small" id="btn-ficha-imprimir">Imprimir / PDF</button>' +
      '</div></div>' +
      '<form id="form-perfil-cliente" class="ficha-form">' +
      '<input type="hidden" id="perfil-cliente-id">' +
      '<div class="ficha-scroll" id="ficha-scroll">' +
      '<article id="ficha-doc" class="ficha-doc ficha-doc--vista" aria-label="Ficha del cliente"></article>' +
      '</div>' +
      '<footer class="ficha-footer no-print">' +
      '<span id="ficha-footer-cliente" class="ficha-footer__cliente"></span>' +
      '<button type="submit" class="btn btn--primary" id="btn-ficha-guardar-footer">Guardar ficha</button>' +
      '</footer></form></div></div>';
    window._fichaUiBound = false;
  }

  function bindTarjetasClienteFicha() {
    const grid = document.getElementById('lista-clientes');
    if (!grid) return;
    grid.querySelectorAll('[data-cliente-id]').forEach(btn => {
      const cliId = btn.dataset.clienteId;
      const nuevo = btn.cloneNode(true);
      btn.replaceWith(nuevo);
      nuevo.addEventListener('click', () => window.abrirFichaCliente(cliId));
    });
  }

  function patchInitContexto() {
    const orig = window.initContextoCliente || initContextoCliente;
    window.initContextoCliente = function (data) {
      orig(data);
      data.clientes.forEach(cli => {
        if (!cli.ficha || typeof cli.ficha !== 'object') cli.ficha = { contacto: '', links: '', notas: '', seccionesExtra: [], documentos: [] };
        if (typeof cli.ficha.contacto !== 'string') cli.ficha.contacto = '';
        if (typeof cli.ficha.links !== 'string') cli.ficha.links = '';
        if (typeof cli.ficha.notas !== 'string') cli.ficha.notas = '';
        if (!Array.isArray(cli.ficha.seccionesExtra)) cli.ficha.seccionesExtra = [];
        if (!Array.isArray(cli.ficha.documentos)) cli.ficha.documentos = [];
      });
      return data;
    };
  }

  function patchContextoCargado() {
    const orig = window.contextoClienteCargado || contextoClienteCargado;
    window.contextoClienteCargado = function (cli) {
      if (!cli) return false;
      const f = cli.ficha || {};
      const extras = (f.seccionesExtra || []).some(s => (s.titulo || '').trim() || (s.contenido || '').trim());
      const docs = (f.documentos || []).some(d => (d.clienteId === cli.id || !d.clienteId) && (d.contenidoTexto || d.notasAnalisis || d.nombre));
      return orig(cli)
        || !!(f.contacto || '').trim()
        || !!(f.links || '').trim()
        || !!(f.notas || '').trim()
        || extras
        || docs;
    };
  }

  function patchGenerarPrompt() {
    const orig = window.generarPromptTrabajo || generarPromptTrabajo;
    window.generarPromptTrabajo = function (tarea, solicitudUsuario) {
      const texto = orig(tarea, solicitudUsuario);
      const cli = clienteDe(tarea.clienteId);
      const f = cli?.ficha || {};
      const extra = [];
      if (f.contacto?.trim()) extra.push('', '## Contacto y stakeholders', f.contacto.trim());
      if (f.links?.trim()) extra.push('', '## Links y recursos', f.links.trim());
      if (f.notas?.trim()) extra.push('', '## Notas del cliente', f.notas.trim());
      (f.seccionesExtra || []).forEach(s => {
        const t = (s.titulo || '').trim() || 'Información adicional';
        const c = (s.contenido || '').trim();
        if (t || c) extra.push('', '## ' + t, c || '(sin contenido)');
      });
      const docs = extractoDocumentosFicha(cli, 6000);
      if (docs) extra.push('', '## Documentos del cliente', docs);
      if (!extra.length) return texto;
      const idx = texto.indexOf('## Manual de marca');
      if (idx >= 0) return texto.slice(0, idx) + extra.join('\n') + '\n' + texto.slice(idx);
      const idx2 = texto.indexOf('## Mi solicitud');
      if (idx2 >= 0) return texto.slice(0, idx2) + extra.join('\n') + '\n' + texto.slice(idx2);
      return texto + extra.join('\n');
    };
  }

  function patchAgregarArchivo() {
    const orig = window.agregarArchivoManual || agregarArchivoManual;
    window.agregarArchivoManual = async function (cliId, file) {
      await orig(cliId, file);
      if (clientePerfilAbierto === cliId && !document.getElementById('modal-cliente-perfil')?.hidden) {
        const cli = clienteDe(cliId);
        if (cli) renderFichaCliente(cli);
      }
    };
  }

  function bootstrapFicha() {
    const modal = document.getElementById('modal-cliente-perfil');
    if (modal && !modal.querySelector('.ficha-shell')) upgradeModalFicha();
    patchInitContexto();
    patchContextoCargado();
    patchGenerarPrompt();
    patchAgregarArchivo();
    window.initFichaClienteUI();
    if (typeof datos !== 'undefined' && datos) initContextoCliente(datos);
    const origRender = window.render;
    if (origRender) {
      window.render = function () {
        origRender();
        bindTarjetasClienteFicha();
      };
    }
    bindTarjetasClienteFicha();
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !document.getElementById('modal-cliente-perfil')?.hidden) {
        window.cerrarFichaCliente();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapFicha);
  } else {
    bootstrapFicha();
  }
})();
