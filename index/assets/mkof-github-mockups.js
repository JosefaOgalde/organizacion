/**
 * Mockups visuales por paso — guías GitHub MOVA (sin capturas duplicadas).
 */
(function () {
  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function shell(url, body, wide) {
    return `<div class="mkof-mockup${wide ? ' mkof-mockup--wide' : ''}">
      <div class="mkof-mockup__bar">
        <span class="mkof-mockup__dot"></span><span class="mkof-mockup__dot"></span><span class="mkof-mockup__dot"></span>
        <div class="mkof-mockup__url">${escapeHtml(url)}</div>
      </div>
      <div class="mkof-mockup__body">${body}</div>
    </div>`;
  }

  function field(label, value, highlight, hint) {
    const cls = highlight ? ' mkof-mockup__input--highlight' : '';
    const hintHtml = hint ? `<span class="mkof-mockup__hint">${escapeHtml(hint)}</span>` : '';
    return `<div class="mkof-mockup__field">
      <label class="mkof-mockup__label">${escapeHtml(label)}</label>
      <div class="mkof-mockup__input${cls}">${escapeHtml(value)}</div>
      ${hintHtml}
    </div>`;
  }

  function ghHeader(showMenu) {
    const menu = showMenu
      ? `<div class="mkof-mockup__dropdown mkof-mockup__dropdown--open">
          <span class="mkof-mockup__dropdown-item">New issue</span>
          <span class="mkof-mockup__dropdown-item mkof-mockup__dropdown-item--hi">＋ New repository</span>
          <span class="mkof-mockup__dropdown-item">Import repository</span>
        </div>`
      : '';
    return `<div class="mkof-mockup__gh-header">
      <span class="mkof-mockup__gh-logo">GitHub</span>
      <span class="mkof-mockup__gh-plus mkof-mockup__gh-plus--hi">＋${menu}</span>
      <span class="mkof-mockup__gh-avatar">M</span>
    </div>`;
  }

  const REPO_MOCKUPS = {
    1: () =>
      shell(
        'github.com/login',
        `${ghHeader(false)}
        <p class="mkof-mockup__h2">Sign in to GitHub</p>
        ${field('Username or email address', 'infra@mova.cl', true)}
        ${field('Password', '•••••••••••••••', false)}
        <span class="mkof-mockup__btn mkof-mockup__btn--highlight">Sign in</span>`
      ),

    2: () =>
      shell(
        'github.com → + → New repository',
        `${ghHeader(true)}
        <p class="mkof-mockup__note">Clic en <strong>＋</strong> arriba a la derecha → elegir <strong>New repository</strong></p>
        <p class="mkof-mockup__note mkof-mockup__note--alt">Atajo directo: <code>github.com/new</code></p>`,
        true
      ),

    3: () =>
      shell(
        'github.com/new',
        `<p class="mkof-mockup__h2">Create a new repository</p>
        ${field('Owner *', '▼ mova-infra', true, 'Debe ser la cuenta creada en el Paso 1')}
        ${field('Repository name', '(siguiente paso)', false)}`
      ),

    4: () =>
      shell(
        'github.com/new',
        `<p class="mkof-mockup__h2">Create a new repository</p>
        ${field('Owner *', 'mova-infra', false)}
        ${field('Repository name *', 'mova-n8n-workflows', true, '✓ mova-n8n-workflows is available')}
        <p class="mkof-mockup__preview">github.com/<strong>mova-infra</strong>/<strong>mova-n8n-workflows</strong></p>`
      ),

    5: () =>
      shell(
        'github.com/new',
        `<p class="mkof-mockup__h2">Create a new repository</p>
        ${field('Repository name *', 'mova-n8n-workflows', false)}
        ${field('Description', 'Respaldo de workflows n8n — proyecto MOVA', true, 'Opcional pero recomendado')}`
      ),

    6: () =>
      shell(
        'github.com/new — Visibility',
        `<p class="mkof-mockup__h3">Choose visibility *</p>
        <div class="mkof-mockup__radio">
          <label><span class="mkof-mockup__radio-dot"></span> Public — Anyone on the internet can see</label>
          <label class="mkof-mockup__radio mkof-mockup__radio--hi">
            <span class="mkof-mockup__radio-dot mkof-mockup__radio-dot--on"></span>
            🔒 Private — You choose who can see and commit
          </label>
        </div>
        <p class="mkof-mockup__warn">Obligatorio: los workflows pueden tener lógica sensible.</p>`
      ),

    7: () =>
      shell(
        'github.com/new — Initialize',
        `<p class="mkof-mockup__h3">Initialize this repository with:</p>
        <div class="mkof-mockup__checks">
          <label class="mkof-mockup__check-row"><span class="mkof-mockup__box"></span> Add a README file</label>
          <label class="mkof-mockup__check-row"><span class="mkof-mockup__box"></span> Add .gitignore</label>
          <label class="mkof-mockup__check-row"><span class="mkof-mockup__box"></span> Choose a license</label>
        </div>
        <p class="mkof-mockup__note mkof-mockup__note--hi">Dejar <strong>todo sin marcar</strong> — repo vacío para el primer push de n8n.</p>`
      ),

    8: () =>
      shell(
        'github.com/new',
        `<p class="mkof-mockup__h2">Create a new repository</p>
        ${field('Repository name *', 'mova-n8n-workflows', false)}
        <p class="mkof-mockup__mini">Private · sin README</p>
        <span class="mkof-mockup__btn mkof-mockup__btn--highlight mkof-mockup__btn--lg">Create repository</span>
        <p class="mkof-mockup__note">Revisar nombre y Private antes de crear.</p>`
      ),

    9: () =>
      shell(
        'github.com/mova-infra/mova-n8n-workflows',
        `<div class="mkof-mockup__repo-head">
          <span class="mkof-mockup__repo-lock">🔒</span>
          <strong>mova-infra / mova-n8n-workflows</strong>
          <span class="mkof-mockup__tag">Private</span>
        </div>
        <div class="mkof-mockup__empty-repo">
          <p class="mkof-mockup__h3">Quick setup — if you've done this kind of thing before</p>
          <div class="mkof-mockup__input mkof-mockup__input--highlight mkof-mockup__copy">
            https://github.com/mova-infra/mova-n8n-workflows.git
            <span class="mkof-mockup__copy-btn">Copy</span>
          </div>
          <p class="mkof-mockup__ok-text">✓ Repo vacío — copiar URL y anotar en ficha MOVA</p>
        </div>`,
        true
      ),

    10: () =>
      shell(
        'github.com/.../settings/access',
        `<div class="mkof-mockup__settings">
          <nav class="mkof-mockup__settings-nav">
            <span>General</span>
            <span class="mkof-mockup__settings-nav--hi">Collaborators</span>
            <span>Branches</span>
          </nav>
          <div class="mkof-mockup__settings-main">
            <p class="mkof-mockup__h3">Collaborators</p>
            <p class="mkof-mockup__note">Add people by GitHub username or email.</p>
            <span class="mkof-mockup__btn">Add people</span>
            <p class="mkof-mockup__mini">Rol sugerido: <strong>Write</strong> o <strong>Maintain</strong></p>
          </div>
        </div>`,
        true
      ),
  };

  function wrapMockup(num, paso, fn) {
    if (!fn) return '';
    const destacar = paso?.destacar
      ? `<p class="mkof-guia-img__destacar">👆 ${escapeHtml(paso.destacar)}</p>`
      : '';
    return `<figure class="mkof-guia-img mkof-guia-img--mockup">
      ${fn()}
      ${destacar}
      <figcaption class="mkof-guia-img__caption">Referencia visual paso ${num} · ${escapeHtml(paso?.url || '')}</figcaption>
    </figure>`;
  }

  function repoPaso(num, paso) {
    return wrapMockup(num, paso, REPO_MOCKUPS[num]);
  }

  const N8N_MOCKUPS = {
    1: () =>
      shell(
        'Contacto equipo',
        `<div class="mkof-mockup__contact">
          <div class="mkof-mockup__contact-row"><span>Admin n8n</span><strong>[nombre]</strong></div>
          <div class="mkof-mockup__contact-row"><span>Correo</span><strong>[correo@empresa.cl]</strong></div>
          <div class="mkof-mockup__contact-row mkof-mockup__contact-row--hi"><span>Instancia</span><strong>n8n.[empresa].cl</strong></div>
        </div>`
      ),

    2: () =>
      shell(
        'Pedido 1 · Tabla',
        `<table class="mkof-mockup__tabla">
          <thead><tr><th>Workflow</th><th>Webhook URL</th><th>Módulo</th><th>Auth</th></tr></thead>
          <tbody>
            <tr><td>portal-facturas</td><td>https://…/webhook/…</td><td>/mova/</td><td>API key</td></tr>
            <tr><td>axon-chat</td><td>https://…/webhook/…</td><td>/axon/</td><td>ninguna</td></tr>
          </tbody>
        </table>
        <p class="mkof-mockup__note">Completar filas por cada workflow en producción.</p>`,
        true
      ),

    3: () =>
      shell(
        'n8n → Export JSON',
        `<div class="mkof-mockup__n8n-bar">
          <span>Workflow: portal-facturas</span>
          <span class="mkof-mockup__n8n-menu mkof-mockup__n8n-menu--hi">⋯ Download</span>
        </div>
        <div class="mkof-mockup__file">portal-facturas.json</div>
        <div class="mkof-mockup__file">axon-chat.json</div>
        <p class="mkof-mockup__mini">→ carpeta zip o repo mova-n8n-workflows</p>`
      ),

    4: () =>
      shell(
        'n8n → Workflows',
        `<div class="mkof-mockup__n8n-list">
          <div class="mkof-mockup__n8n-row mkof-mockup__n8n-row--hi"><span class="mkof-mockup__n8n-on">ON</span> portal-facturas</div>
          <div class="mkof-mockup__n8n-row"><span class="mkof-mockup__n8n-on">ON</span> axon-chat</div>
          <div class="mkof-mockup__n8n-row"><span class="mkof-mockup__n8n-off">off</span> test-borrador</div>
        </div>
        <p class="mkof-mockup__note">Captura: solo workflows <strong>activos</strong> en producción.</p>`,
        true
      ),

    5: () =>
      shell(
        'n8n → Canvas workflow',
        `<div class="mkof-mockup__n8n-canvas">
          <span class="mkof-mockup__n8n-node mkof-mockup__n8n-node--trigger">Webhook</span>
          <span class="mkof-mockup__n8n-arrow">→</span>
          <span class="mkof-mockup__n8n-node">IF auth</span>
          <span class="mkof-mockup__n8n-arrow">→</span>
          <span class="mkof-mockup__n8n-node">HTTP Request</span>
          <span class="mkof-mockup__n8n-arrow">→</span>
          <span class="mkof-mockup__n8n-node">Respond</span>
        </div>
        <p class="mkof-mockup__note">Zoom out para ver todo el flujo en una captura.</p>`,
        true
      ),

    6: () =>
      shell(
        'n8n → Nodo Webhook',
        `<div class="mkof-mockup__n8n-split">
          <div class="mkof-mockup__n8n-canvas-mini">
            <span class="mkof-mockup__n8n-node mkof-mockup__n8n-node--hi">Webhook</span>
          </div>
          <div class="mkof-mockup__n8n-panel">
            ${field('HTTP Method', 'POST', true)}
            ${field('Path', '/webhook/mova-facturas', true)}
            ${field('Production URL', 'https://n8n…/webhook/mova-facturas', false)}
          </div>
        </div>`,
        true
      ),

    7: () =>
      shell(
        'n8n → Validación auth',
        `<div class="mkof-mockup__n8n-canvas">
          <span class="mkof-mockup__n8n-node">Webhook</span>
          <span class="mkof-mockup__n8n-arrow">→</span>
          <span class="mkof-mockup__n8n-node mkof-mockup__n8n-node--hi">IF token válido</span>
          <span class="mkof-mockup__n8n-arrow">→</span>
          <span class="mkof-mockup__n8n-node">continúa</span>
        </div>
        <p class="mkof-mockup__warn">Si no valida → documentar «sin auth» en la tabla.</p>`,
        true
      ),

    8: () =>
      shell(
        'n8n → Executions',
        `<div class="mkof-mockup__n8n-exec">
          <div class="mkof-mockup__n8n-exec-row mkof-mockup__n8n-exec-row--ok"><span>✓ Success</span> portal-facturas · hace 2 h</div>
          <div class="mkof-mockup__n8n-exec-row"><span>✓ Success</span> axon-chat · hace 5 h</div>
          <div class="mkof-mockup__n8n-exec-row mkof-mockup__n8n-exec-row--err"><span>✗ Error</span> test · hace 1 d</div>
        </div>
        <p class="mkof-mockup__note">Capturar Success reciente — tapar datos del payload.</p>`
      ),

    9: () =>
      shell(
        'Seguridad',
        `<div class="mkof-mockup__shield">
          <p class="mkof-mockup__warn">✗ No enviar por correo:</p>
          <ul class="mkof-mockup__shield-list">
            <li>API keys · tokens · contraseñas</li>
            <li>Capturas con secretos visibles</li>
          </ul>
          <p class="mkof-mockup__ok-text">✓ Sí: nombre de credencial en n8n · tipo de auth</p>
        </div>`
      ),

    10: () =>
      shell(
        'Organizar entregables',
        `<div class="mkof-mockup__folder-tree">
          <div>📁 entregables-n8n/</div>
          <div class="mkof-mockup__indent">📄 inventario-webhooks.xlsx</div>
          <div class="mkof-mockup__indent">📁 portal-facturas/</div>
          <div class="mkof-mockup__indent2">workflow.json · canvas.png · webhook.png</div>
          <div class="mkof-mockup__indent">📁 axon-chat/ …</div>
        </div>
        <p class="mkof-mockup__mini">→ Inventario-MOVA-modulos.md · repo GitHub</p>`,
        true
      ),
  };

  function n8nPaso(num, paso) {
    return wrapMockup(num, paso, N8N_MOCKUPS[num]);
  }

  window.MKOF_GITHUB_MOCKUPS = { repoPaso, n8nPaso };
})();
