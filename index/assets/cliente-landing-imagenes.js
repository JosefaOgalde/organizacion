/**
 * Imágenes en landings de clientes — agregar, reemplazar, borrar, editar.
 * Persistencia: localStorage organizacion_v2 → cli.ficha.landing
 */
(function () {
  const STORAGE_KEY = 'organizacion_v2';
  const MAX_BYTES = 700 * 1024;

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function uid() {
    return 'img-' + Math.random().toString(36).slice(2, 10);
  }

  function loadDatos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return { clientes: [], tareas: [], version: 2 };
  }

  function saveDatos(datos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
  }

  window.LandingImagenesStore = {
    STORAGE_KEY,
    MAX_BYTES,

    asegurarLanding(cli) {
      if (!cli) return null;
      if (!cli.ficha || typeof cli.ficha !== 'object') cli.ficha = {};
      if (!cli.ficha.landing || typeof cli.ficha.landing !== 'object') cli.ficha.landing = {};
      const l = cli.ficha.landing;
      if (!Array.isArray(l.imagenes)) l.imagenes = [];
      if (!l.imagenesOverrides || typeof l.imagenesOverrides !== 'object') l.imagenesOverrides = {};
      if (!Array.isArray(l.imagenesOcultas)) l.imagenesOcultas = [];
      if (!l.imagenesMeta || typeof l.imagenesMeta !== 'object') l.imagenesMeta = {};
      return l;
    },

    loadDatos,
    saveDatos,
    uid
  };

  /** HTML sección «Imágenes cargadas» */
  window.htmlLandingImagenesSeccion = function htmlLandingImagenesSeccion(landing, opts) {
    opts = opts || {};
    const imgs = landing?.imagenes || [];
    const claseExtra = opts.claseExtra || '';
    const cards = imgs.map((img) => {
      const titulo = img.titulo || 'Sin título';
      const notas = img.notas ? `<p class="landing-img__notas">${escapeHtml(img.notas)}</p>` : '';
      return `<figure class="landing-img__card" data-landing-img-id="${escapeHtml(img.id)}">
        <a href="${escapeHtml(img.dataUrl)}" target="_blank" rel="noopener" title="${escapeHtml(titulo)}">
          <img src="${escapeHtml(img.dataUrl)}" alt="${escapeHtml(titulo)}" loading="lazy">
        </a>
        <figcaption class="landing-img__caption">
          <strong class="landing-img__titulo">${escapeHtml(titulo)}</strong>
          ${notas}
        </figcaption>
      </figure>`;
    }).join('');

    const vacio = !imgs.length
      ? '<p class="landing-img__vacio">Sin imágenes cargadas aún. En modo edición puedes agregar capturas, mockups o referencias.</p>'
      : '';

    return `<section class="landing-img ficha-seccion ${claseExtra}" data-landing-imagenes-seccion>
      <div class="ficha-seccion__headline">
        <h3 class="ficha-seccion__titulo">Imágenes cargadas</h3>
        <span class="ficha-seccion__estado">${imgs.length} imagen${imgs.length === 1 ? '' : 'es'}</span>
      </div>
      <p class="landing-img__intro landing-img__intro--vista">Referencias visuales guardadas para este cliente.</p>
      <p class="landing-img__intro landing-img__solo-edicion">Agrega, reemplaza, edita título/notas o borra imágenes. Se guardan en tu organizador.</p>
      <div class="landing-img__grid" data-landing-img-grid>${cards}</div>
      ${vacio}
      <div class="landing-img__acciones landing-img__solo-edicion">
        <button type="button" class="landing-img__btn landing-img__btn--primary" data-landing-img-agregar>+ Agregar imagen</button>
        <input type="file" data-landing-img-file accept="image/*" multiple hidden>
      </div>
    </section>`;
  };

  function editarMetaImagen(actual) {
    const titulo = prompt('Título de la imagen:', actual?.titulo || '');
    if (titulo === null) return null;
    const notas = prompt('Notas (opcional):', actual?.notas || '');
    if (notas === null) return null;
    return { titulo: titulo.trim() || 'Sin título', notas: notas.trim() };
  }

  function leerArchivoImagen(file) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) {
        reject(new Error('Archivo no válido'));
        return;
      }
      if (file.size > MAX_BYTES) {
        reject(new Error('Imagen muy grande (máx. ' + Math.round(MAX_BYTES / 1024) + ' KB)'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
      reader.readAsDataURL(file);
    });
  }

  /** CRUD galería custom + persistencia */
  window.initLandingImagenesGaleriaUI = function initLandingImagenesGaleriaUI(root, opts) {
    opts = opts || {};
    const scope = root && root.querySelectorAll ? root : document;
    const landing = opts.landing;
    const onChange = typeof opts.onChange === 'function' ? opts.onChange : null;
    const onError = typeof opts.onError === 'function' ? opts.onError : (msg) => alert(msg);
    if (!landing || !Array.isArray(landing.imagenes)) return;

    scope.querySelectorAll('[data-landing-imagenes-seccion]').forEach((sec) => {
      if (sec.dataset.landingImgBound === '1') return;
      sec.dataset.landingImgBound = '1';

      const grid = sec.querySelector('[data-landing-img-grid]');
      const fileInput = sec.querySelector('[data-landing-img-file]');
      const btnAgregar = sec.querySelector('[data-landing-img-agregar]');

      function persist() {
        if (onChange) onChange(landing);
      }

      function renderCard(img) {
        const fig = document.createElement('figure');
        fig.className = 'landing-img__card';
        fig.dataset.landingImgId = img.id;
        const titulo = img.titulo || 'Sin título';
        const notasHtml = img.notas
          ? `<p class="landing-img__notas">${escapeHtml(img.notas)}</p>`
          : '';
        fig.innerHTML =
          `<a href="${escapeHtml(img.dataUrl)}" target="_blank" rel="noopener" title="${escapeHtml(titulo)}">` +
          `<img src="${escapeHtml(img.dataUrl)}" alt="${escapeHtml(titulo)}" loading="lazy"></a>` +
          `<figcaption class="landing-img__caption">` +
          `<strong class="landing-img__titulo">${escapeHtml(titulo)}</strong>${notasHtml}</figcaption>`;
        bindCard(fig, img);
        return fig;
      }

      function actualizarCard(fig, img) {
        const titulo = img.titulo || 'Sin título';
        const imgEl = fig.querySelector('img');
        const link = fig.querySelector('a');
        if (imgEl) {
          imgEl.src = img.dataUrl;
          imgEl.alt = titulo;
        }
        if (link) {
          link.href = img.dataUrl;
          link.title = titulo;
        }
        let cap = fig.querySelector('.landing-img__caption');
        if (!cap) {
          cap = document.createElement('figcaption');
          cap.className = 'landing-img__caption';
          fig.appendChild(cap);
        }
        cap.innerHTML =
          `<strong class="landing-img__titulo">${escapeHtml(titulo)}</strong>` +
          (img.notas ? `<p class="landing-img__notas">${escapeHtml(img.notas)}</p>` : '');
      }

      function bindCard(fig, img) {
        if (fig.querySelector('.landing-img__bar')) return;
        const bar = document.createElement('div');
        bar.className = 'landing-img__bar landing-img__solo-edicion';

        const inputReplace = document.createElement('input');
        inputReplace.type = 'file';
        inputReplace.accept = 'image/*';
        inputReplace.hidden = true;

        const btnReplace = document.createElement('button');
        btnReplace.type = 'button';
        btnReplace.className = 'landing-img__btn';
        btnReplace.textContent = 'Reemplazar';

        const btnEdit = document.createElement('button');
        btnEdit.type = 'button';
        btnEdit.className = 'landing-img__btn';
        btnEdit.textContent = 'Editar';

        const btnDelete = document.createElement('button');
        btnDelete.type = 'button';
        btnDelete.className = 'landing-img__btn landing-img__btn--danger';
        btnDelete.textContent = 'Borrar';

        btnReplace.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          inputReplace.click();
        });

        inputReplace.addEventListener('change', async () => {
          const file = inputReplace.files?.[0];
          inputReplace.value = '';
          if (!file) return;
          try {
            img.dataUrl = await leerArchivoImagen(file);
            actualizarCard(fig, img);
            persist();
          } catch (err) {
            onError(err.message || 'Error al cargar');
          }
        });

        btnEdit.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const meta = editarMetaImagen(img);
          if (!meta) return;
          img.titulo = meta.titulo;
          img.notas = meta.notas;
          actualizarCard(fig, img);
          persist();
        });

        btnDelete.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!confirm('¿Borrar esta imagen de la landing?')) return;
          landing.imagenes = landing.imagenes.filter((x) => x.id !== img.id);
          fig.remove();
          actualizarContador(sec, landing.imagenes.length);
          actualizarVacio(sec, landing.imagenes.length);
          persist();
        });

        bar.appendChild(btnReplace);
        bar.appendChild(btnEdit);
        bar.appendChild(btnDelete);
        bar.appendChild(inputReplace);
        fig.appendChild(bar);
      }

      sec.querySelectorAll('.landing-img__card').forEach((fig) => {
        const img = landing.imagenes.find((x) => x.id === fig.dataset.landingImgId);
        if (img) bindCard(fig, img);
      });

      btnAgregar?.addEventListener('click', () => fileInput?.click());

      fileInput?.addEventListener('change', async () => {
        const files = [...(fileInput.files || [])];
        fileInput.value = '';
        for (const file of files) {
          try {
            const dataUrl = await leerArchivoImagen(file);
            const meta = editarMetaImagen({ titulo: file.name.replace(/\.[^.]+$/, '') });
            if (!meta) continue;
            const item = {
              id: uid(),
              titulo: meta.titulo,
              notas: meta.notas,
              dataUrl,
              creado: new Date().toISOString()
            };
            landing.imagenes.push(item);
            const fig = renderCard(item);
            grid?.appendChild(fig);
          } catch (err) {
            onError(err.message || 'Error al cargar');
          }
        }
        actualizarContador(sec, landing.imagenes.length);
        actualizarVacio(sec, landing.imagenes.length);
        if (files.length) persist();
      });
    });
  };

  function actualizarContador(sec, n) {
    const el = sec.querySelector('.ficha-seccion__estado');
    if (el) el.textContent = n + ' imagen' + (n === 1 ? '' : 'es');
  }

  function actualizarVacio(sec, n) {
    let vacio = sec.querySelector('.landing-img__vacio');
    if (n === 0 && !vacio) {
      vacio = document.createElement('p');
      vacio.className = 'landing-img__vacio';
      vacio.textContent = 'Sin imágenes cargadas aún. En modo edición puedes agregar capturas, mockups o referencias.';
      sec.querySelector('.landing-img__acciones')?.before(vacio);
    } else if (n > 0 && vacio) {
      vacio.remove();
    }
  }
})();
