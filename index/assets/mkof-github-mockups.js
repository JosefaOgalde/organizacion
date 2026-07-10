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

  function repoPaso(num, paso) {
    const fn = REPO_MOCKUPS[num];
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

  window.MKOF_GITHUB_MOCKUPS = { repoPaso };
})();
