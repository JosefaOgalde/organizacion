/**
 * Mockups visuales — guía nodo MySQL en n8n (MOVA hito 3.2).
 */
(function () {
  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function shell(url, body) {
    return `<div class="mkof-mockup mkof-mockup--wide">
      <div class="mkof-mockup__bar">
        <span class="mkof-mockup__dot"></span><span class="mkof-mockup__dot"></span><span class="mkof-mockup__dot"></span>
        <div class="mkof-mockup__url">${escapeHtml(url)}</div>
      </div>
      <div class="mkof-mockup__body">${body}</div>
    </div>`;
  }

  function field(label, value, highlight) {
    const cls = highlight ? ' mkof-mockup__input--highlight' : '';
    return `<div class="mkof-mockup__field">
      <label class="mkof-mockup__label">${escapeHtml(label)}</label>
      <div class="mkof-mockup__input${cls}">${escapeHtml(value)}</div>
    </div>`;
  }

  const MOCKS = {
    1: () =>
      shell(
        'n8n → Workflows',
        `<div class="mkof-mockup__list">
          <div class="mkof-mockup__list-item">MOVA · Ingresos / Egresos <span class="mkof-mockup__badge">Active</span></div>
          <div class="mkof-mockup__list-item mkof-mockup__list-item--hi">↗ Abrir en editor</div>
          <div class="mkof-mockup__list-item">Google Sheets (hoy = destino)</div>
        </div>`
      ),
    2: () =>
      shell(
        'n8n → canvas',
        `<div class="mkof-mockup__flow">
          <span class="mkof-mockup__node">Webhook</span>
          <span class="mkof-mockup__arrow">→</span>
          <span class="mkof-mockup__node mkof-mockup__node--hi">＋ Add node</span>
          <span class="mkof-mockup__arrow">→</span>
          <span class="mkof-mockup__node">Google Sheets</span>
        </div>`
      ),
    3: () =>
      shell(
        'n8n → Add node',
        `${field('Search nodes', 'MySQL', true)}
         <div class="mkof-mockup__list">
           <div class="mkof-mockup__list-item mkof-mockup__list-item--hi">MySQL · oficial</div>
           <div class="mkof-mockup__list-item">Postgres</div>
           <div class="mkof-mockup__list-item">Microsoft SQL</div>
         </div>`
      ),
    4: () =>
      shell(
        'n8n → MySQL → Credential',
        `${field('Credential', 'Create New', true)}
         ${field('Name', 'MOVA MySQL prod', true)}`
      ),
    5: () =>
      shell(
        'n8n → MySQL credential',
        `${field('Host', 'xxx.mysql.cloud', true)}
         ${field('Database', 'mova_datos', true)}
         ${field('User', 'mova_app', false)}
         ${field('Password', '••••••••••••', true)}
         ${field('Port', '3306', false)}`
      ),
    6: () =>
      shell(
        'n8n → Credential → Test',
        `<div class="mkof-mockup__success">✓ Connection successful</div>
         <div class="mkof-mockup__btn">Save</div>`
      ),
    7: () =>
      shell(
        'n8n → MySQL node',
        `${field('Operation', 'Insert or Update', true)}
         ${field('Table', 'ingresos', true)}`
      ),
    8: () =>
      shell(
        'n8n → MySQL → Columns',
        `${field('fecha', '{{ $json.fecha }}', true)}
         ${field('monto', '{{ $json.monto }}', true)}
         ${field('tipo', '{{ $json.tipo }}', false)}`
      ),
    9: () =>
      shell(
        'n8n → canvas',
        `<div class="mkof-mockup__flow">
          <span class="mkof-mockup__node">Lógica</span>
          <span class="mkof-mockup__arrow">→</span>
          <span class="mkof-mockup__node mkof-mockup__node--hi">MySQL (fuente)</span>
          <span class="mkof-mockup__arrow">→</span>
          <span class="mkof-mockup__node">Sheets (vista)</span>
        </div>`
      ),
    10: () =>
      shell(
        'n8n → Google Sheets',
        `${field('Operation', 'Append', true)}
         ${field('Sheet', 'INGRESOS / EGRESOS', false)}
         <p class="mkof-mockup__hint">Mismos campos que MySQL · solo réplica</p>`
      ),
    11: () =>
      shell(
        'n8n → Executions',
        `<div class="mkof-mockup__list">
          <div class="mkof-mockup__list-item">Execute Workflow</div>
          <div class="mkof-mockup__list-item mkof-mockup__list-item--hi">MySQL · Success</div>
          <div class="mkof-mockup__list-item mkof-mockup__list-item--hi">Sheets · Success</div>
        </div>`
      )
  };

  window.MKOF_MYSQL_NODO_MOCKUPS = {
    paso(num) {
      const fn = MOCKS[num];
      return fn ? fn() : '';
    }
  };
})();
