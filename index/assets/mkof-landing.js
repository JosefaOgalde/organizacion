(function () {
  const G = () => window.MKOF_MOVA_GANTT || null;

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatFecha(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${d} ${meses[m - 1]} ${y}`;
  }

  function contextoHtml() {
    const g = G();
    if (!g) return '';
    return `<div class="mkof-landing__contexto">
      <strong>Contexto:</strong> Se entregó <em>${escapeHtml(g.referencias.entregado)}</em>.
      El cliente respondió con su playbook técnico
      (<a href="${escapeHtml(g.referencias.respuestaCliente)}" target="_blank" rel="noopener">Post-Auditoría MOVA</a>).
      Esta carta Gantt comprime el plan original (8+ semanas) a <strong>3 semanas / 15 días hábiles</strong>,
      con día 1 = <strong>${formatFecha(g.inicio)}</strong>.
      Se excluye migración de hosting intermedio; Cloudflare + GoDaddy hasta el VPS (~12 meses).
    </div>`;
  }

  function veredictoHtml() {
    const g = G();
    if (!g?.veredicto?.length) return '';
    const filas = g.veredicto
      .map((v) => {
        const cls = v.incluido ? 'mkof-veredicto__ok' : 'mkof-veredicto__defer';
        const estado = v.incluido ? 'En Gantt' : 'Fuera de alcance';
        return `<tr>
          <td>${escapeHtml(v.propuesta)}</td>
          <td>${escapeHtml(v.veredicto)}</td>
          <td>${escapeHtml(v.prioridad)}</td>
          <td class="${cls}">${estado}</td>
        </tr>`;
      })
      .join('');
    return `<table class="mkof-veredicto">
      <thead><tr><th>Propuesta auditoría</th><th>Veredicto cliente</th><th>Prioridad</th><th>Plan 3 sem.</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>`;
  }

  function semanasHtml() {
    const g = G();
    if (!g?.semanas?.length) return '';
    return `<div class="mkof-semanas">${g.semanas
      .map(
        (s) => `<div class="mkof-semana">
          <div class="mkof-semana__num">${escapeHtml(s.label)}</div>
          <div class="mkof-semana__dias">${escapeHtml(s.dias)}</div>
          <p class="mkof-semana__foco">${escapeHtml(s.foco)}</p>
        </div>`
      )
      .join('')}</div>`;
  }

  function ganttHtml() {
    const g = G();
    const fases = g?.fases || [];
    const totalDias = g?.diasHabiles || (fases.length ? Math.max(...fases.map((f) => f.inicio + f.dias)) : 15);
    const filas = fases
      .map((f) => {
        const left = (f.inicio / totalDias) * 100;
        const width = (f.dias / totalDias) * 100;
        const tooltip = `${f.dias} días · ${formatFecha(f.fechaInicio)} – ${formatFecha(f.fechaFin)}`;
        return `<div class="mkof-gantt__fila-label">${escapeHtml(f.codigo)} · ${escapeHtml(f.nombre)}<small>${escapeHtml(f.fase)}</small></div>
          <div class="mkof-gantt__track" title="${escapeHtml(tooltip)}">
            <div class="mkof-gantt__bar mkof-gantt__bar--f${f.id}" style="left:${left}%;width:${width}%"></div>
          </div>`;
      })
      .join('');
    return `<div class="mkof-gantt">
      <div class="mkof-gantt__leyenda">15 días hábiles · ${formatFecha(g.inicio)} → ${formatFecha(g.fin)} · sin migración de hosting</div>
      <div class="mkof-gantt__grid">${filas}</div>
      <div class="mkof-gantt__escala"><span>Día 1 · ${formatFecha(g.inicio)}</span><span>Día ${totalDias} · ${formatFecha(g.fin)}</span></div>
      <div class="mkof-gantt__semana-marks"><span>Sem 1</span><span>Sem 2</span><span>Sem 3</span></div>
      <p class="mkof-gantt__total">7 hitos: backup n8n · Cloudflare · mova_auth · sesión server-side · MySQL · Sheets vista · operación</p>
    </div>`;
  }

  function excluidoHtml() {
    const g = G();
    if (!g?.excluido?.length) return '';
    return `<div class="mkof-excluido">
      <h3>Fuera de las 3 semanas (posición del cliente)</h3>
      <ul>${g.excluido
        .map((e) => `<li><strong>${escapeHtml(e.accion)}</strong> — ${escapeHtml(e.motivo)}</li>`)
        .join('')}</ul>
    </div>`;
  }

  function fasesDetalleHtml() {
    const g = G();
    if (!g?.fases?.length) return '';
    return `<div class="mkof-fases-detalle">${g.fases
      .map(
        (f) => `<article class="mkof-fase-card">
          <div class="mkof-fase-card__head">
            <span class="mkof-fase-card__codigo">${escapeHtml(f.codigo)}</span>
            <span class="mkof-fase-card__nombre">${escapeHtml(f.nombre)}</span>
            <span class="mkof-fase-card__fechas">${formatFecha(f.fechaInicio)} – ${formatFecha(f.fechaFin)} · ${f.dias} días</span>
          </div>
          <p class="mkof-fase-card__entregable"><strong>Entregable:</strong> ${escapeHtml(f.entregable)}</p>
          <ul>${(f.tareas || []).map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
        </article>`
      )
      .join('')}</div>`;
  }

  function guiasHtml() {
    return `<section class="ficha-seccion ficha-seccion--portal">
        <h2>Guías en curso · MOVA</h2>
        <p style="margin:0 0 0.85rem;font-size:0.9rem">
          <a href="../MKOF/MOVA/documentos/">📁 Todos los documentos MOVA</a>
        </p>
        <div class="mkof-guias-grid">
          <a href="../MKOF/MOVA/documentos/ver.html?id=d1-inventario-status" class="mkof-guia-card">
            <span class="mkof-guia-card__paso">Día 1 · Entregable</span>
            <strong>Status inventario módulos</strong>
            <span class="mkof-guia-card__desc">Ver · PDF · PPT · mkof/01</span>
          </a>
          <a href="../MKOF/MOVA/documentos/ver.html?id=d2-reglas-mova-auth" class="mkof-guia-card">
            <span class="mkof-guia-card__paso">Día 2 · Entregable</span>
            <strong>Reglas mova_auth</strong>
            <span class="mkof-guia-card__desc">Ver · PDF · PPT · mkof/02</span>
          </a>
          <a href="../MKOF/MOVA/documentos/ver.html?id=d3-nucleo-mova-auth" class="mkof-guia-card mkof-guia-card--activa">
            <span class="mkof-guia-card__paso">Día 3 · Entregable</span>
            <strong>Núcleo mova_auth (6 archivos)</strong>
            <span class="mkof-guia-card__desc">Gap cPanel · mkof/03 · 19 jul</span>
          </a>
          <a href="../MKOF/MOVA/documentos/ver.html?id=d4-login-cookie" class="mkof-guia-card mkof-guia-card--activa">
            <span class="mkof-guia-card__paso">Día 4 · Entregable</span>
            <strong>Login único + cookie</strong>
            <span class="mkof-guia-card__desc">HttpOnly · casos de prueba · mkof/04</span>
          </a>
          <a href="../MKOF/MOVA/documentos/ver.html?id=d5-validacion-modulos" class="mkof-guia-card mkof-guia-card--activa">
            <span class="mkof-guia-card__paso">Día 5 · Cierre auditoría</span>
            <strong>Matriz validación por módulo</strong>
            <span class="mkof-guia-card__desc">Sandbox ERP · mkof/05 · 19 jul</span>
          </a>
          <a href="../MKOF/MOVA/documentos/ver.html?id=etapa2-presentacion" class="mkof-guia-card mkof-guia-card--activa">
            <span class="mkof-guia-card__paso">Hoy · Presentación</span>
            <strong>Deck etapa 2 · 20 min</strong>
            <span class="mkof-guia-card__desc">19 slides · guion incluido</span>
          </a>
          <a href="../MKOF/MOVA/documentos/ver.html?id=cloudflare-facil" class="mkof-guia-card mkof-guia-card--activa">
            <span class="mkof-guia-card__paso">Hito 1.2 · Cloudflare</span>
            <strong>¿Para qué y es necesario?</strong>
            <span class="mkof-guia-card__desc">Explicación fácil + conclusión</span>
          </a>
          <a href="../MKOF/MOVA/documentos/ver.html?id=cpanel-espejo" class="mkof-guia-card mkof-guia-card--activa">
            <span class="mkof-guia-card__paso">Ops · cPanel</span>
            <strong>Descargar al repo (espejo)</strong>
            <span class="mkof-guia-card__desc">ZIP → espejo-cpanel/ · sin secretos</span>
          </a>
          <a href="../MKOF/MOVA/documentos/ver.html?id=repos-externos" class="mkof-guia-card mkof-guia-card--activa">
            <span class="mkof-guia-card__paso">Git · Externo</span>
            <strong>mova-repo (Juan) registrado</strong>
            <span class="mkof-guia-card__desc">Respaldos PHP/n8n · colaboradora</span>
          </a>
          <a href="../MKOF/MOVA/documentos/ver.html?id=seguimiento-admin" class="mkof-guia-card mkof-guia-card--activa">
            <span class="mkof-guia-card__paso">Hoy · Admin</span>
            <strong>Seguimiento + textos para pegar</strong>
            <span class="mkof-guia-card__desc">MySQL · ZIP cPanel · firma D2</span>
          </a>
          <a href="../MKOF/MOVA/documentos/ver.html?id=mysql-nodo-n8n" class="mkof-guia-card mkof-guia-card--activa">
            <span class="mkof-guia-card__paso">Hito 3.2 · Nodo SQL</span>
            <strong>Agregar nodo MySQL en n8n</strong>
            <span class="mkof-guia-card__desc">Ver · PPT · 11 pasos</span>
          </a>
          <a href="github-repo.html" class="mkof-guia-card">
            <span class="mkof-guia-card__paso">Hito 1.1 · HECHO</span>
            <strong>n8n en GitHub</strong>
            <span class="mkof-guia-card__desc">Flujos respaldados en repo</span>
          </a>
          <a href="mova-auth-guia.html" class="mkof-guia-card">
            <span class="mkof-guia-card__paso">Fase 1 · En curso</span>
            <strong>Login unificado mova_auth</strong>
            <span class="mkof-guia-card__desc">12 pasos · diagramas · PDF</span>
          </a>
          <a href="MOVA-Auth-Login-Unificado.pdf" target="_blank" rel="noopener" class="mkof-guia-card">
            <span class="mkof-guia-card__paso">PDF directo</span>
            <strong>mova_auth paso a paso</strong>
            <span class="mkof-guia-card__desc">Para entregar al encargado</span>
          </a>
        </div>
      </section>`;
  }

  function mkofLandingSectionsHtml() {
    if (!G()) return '';
    return `
      ${guiasHtml()}
      <section class="ficha-seccion ficha-seccion--portal">
        <h2>MOVA · Post-auditoría</h2>
        ${contextoHtml()}
        ${veredictoHtml()}
      </section>
      <section class="ficha-seccion ficha-seccion--portal">
        <h2>Resumen por semana</h2>
        ${semanasHtml()}
      </section>
      <section class="ficha-seccion ficha-seccion--portal">
        <h2>Carta Gantt · 3 semanas</h2>
        ${ganttHtml()}
        ${excluidoHtml()}
      </section>
      <section class="ficha-seccion ficha-seccion--portal">
        <h2>Detalle de hitos y entregables</h2>
        ${fasesDetalleHtml()}
      </section>`;
  }

  window.mkofHtmlLandingSections = mkofLandingSectionsHtml;
})();
