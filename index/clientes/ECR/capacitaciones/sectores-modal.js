/**
 * ECR Capacitaciones — modal ruta de aprendizaje
 * Requiere: window.ECR_SECTORES (sectores-data.js)
 */
(function () {
    var modalEl = null;
    var ultimoFoco = null;

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function crearModal() {
        if (document.getElementById('ecr-ruta-modal')) {
            modalEl = document.getElementById('ecr-ruta-modal');
            return;
        }

        modalEl = document.createElement('div');
        modalEl.id = 'ecr-ruta-modal';
        modalEl.className = 'ecr-ruta-modal';
        modalEl.setAttribute('hidden', '');
        modalEl.setAttribute('aria-hidden', 'true');
        modalEl.innerHTML =
            '<div class="ecr-ruta-modal__backdrop" data-ecr-cerrar-modal></div>' +
            '<div class="ecr-ruta-modal__panel" role="dialog" aria-modal="true" aria-labelledby="ecr-ruta-modal-titulo">' +
            '  <button type="button" class="ecr-ruta-modal__cerrar" data-ecr-cerrar-modal aria-label="Cerrar">&times;</button>' +
            '  <div class="ecr-ruta-modal__contenido"></div>' +
            '</div>';
        document.body.appendChild(modalEl);

        modalEl.addEventListener('click', function (e) {
            if (e.target.closest('[data-ecr-cerrar-modal]')) cerrarModal();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modalEl && !modalEl.hasAttribute('hidden')) cerrarModal();
        });
    }

    function renderContenido(sector) {
        var cursosHtml = (sector.cursos || []).map(function (c, i) {
            var url = c.url || '#';
            return (
                '<li class="ecr-ruta-modal__item">' +
                '<span class="ecr-ruta-modal__item-nombre">' + escapeHtml(c.nombre) + '</span>' +
                '<a class="ecr-ruta-modal__curso-btn" href="' + escapeHtml(url) + '" target="_blank" rel="noopener">' +
                'Ir al curso <span aria-hidden="true">→</span>' +
                '</a></li>'
            );
        }).join('');

        return (
            '<h2 id="ecr-ruta-modal-titulo" class="ecr-ruta-modal__titulo">' + escapeHtml(sector.titulo) + '</h2>' +
            '<p class="ecr-ruta-modal__subtitulo">' + escapeHtml(sector.subtitulo) + '</p>' +
            '<p class="ecr-ruta-modal__descripcion">' + escapeHtml(sector.descripcion) + '</p>' +
            '<p class="ecr-ruta-modal__competencias">' + escapeHtml(sector.competencias) + '</p>' +
            '<h3 class="ecr-ruta-modal__ruta-titulo">Ruta de aprendizaje:</h3>' +
            '<ol class="ecr-ruta-modal__lista">' + cursosHtml + '</ol>'
        );
    }

    function abrirModal(slug) {
        var data = window.ECR_SECTORES && window.ECR_SECTORES[slug];
        if (!data) {
            console.warn('ECR sectores: no hay datos para', slug);
            return;
        }

        crearModal();
        ultimoFoco = document.activeElement;

        var contenido = modalEl.querySelector('.ecr-ruta-modal__contenido');
        if (contenido) contenido.innerHTML = renderContenido(data);

        modalEl.removeAttribute('hidden');
        modalEl.setAttribute('aria-hidden', 'false');
        modalEl.classList.add('ecr-ruta-modal--abierto');
        document.body.classList.add('ecr-ruta-modal-abierto');

        var cerrar = modalEl.querySelector('.ecr-ruta-modal__cerrar');
        if (cerrar) cerrar.focus();
    }

    function cerrarModal() {
        if (!modalEl) return;
        modalEl.classList.remove('ecr-ruta-modal--abierto');
        modalEl.setAttribute('hidden', '');
        modalEl.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('ecr-ruta-modal-abierto');
        if (ultimoFoco && typeof ultimoFoco.focus === 'function') ultimoFoco.focus();
    }

    function resolverSlug(el) {
        var card = el.closest('[data-ecr-sector]');
        if (card) return card.getAttribute('data-ecr-sector');
        return null;
    }

    function bindTriggers() {
        document.addEventListener('click', function (e) {
            var verMas = e.target.closest('.ecr-sector-ver-mas, [data-ecr-sector-trigger]');
            var card = e.target.closest('[data-ecr-sector]');

            if (verMas) {
                var slug = resolverSlug(verMas) || (card && card.getAttribute('data-ecr-sector'));
                if (slug) {
                    e.preventDefault();
                    abrirModal(slug);
                }
                return;
            }

            if (card && !e.target.closest('a[href]:not([data-ecr-sector-trigger])')) {
                var slugCard = card.getAttribute('data-ecr-sector');
                if (slugCard) {
                    e.preventDefault();
                    abrirModal(slugCard);
                }
            }
        });
    }

    window.ECR = window.ECR || {};
    window.ECR.abrirRutaSector = abrirModal;
    window.ECR.cerrarRutaModal = cerrarModal;

    function init() {
        crearModal();
        bindTriggers();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
