(function () {
  const root = document.getElementById('mova-resumen-root');
  if (!root) return;

  const resumenPath = root.dataset.resumen || 'RESUMEN.md';

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Markdown mínimo → HTML (títulos, listas, párrafos, negrita, tablas simples) */
  function markdownToHtml(md) {
    const lines = String(md).replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let inUl = false;
    let inOl = false;
    let inTable = false;
    let tableRows = [];

    function flushList() {
      if (inUl) {
        out.push('</ul>');
        inUl = false;
      }
      if (inOl) {
        out.push('</ol>');
        inOl = false;
      }
    }

    function flushTable() {
      if (!inTable || !tableRows.length) return;
      const [head, ...body] = tableRows;
      const cells = (row) => row.split('|').map((c) => c.trim()).filter(Boolean);
      const th = cells(head);
      out.push('<table class="mova-resumen__table"><thead><tr>');
      th.forEach((c) => {
        out.push(`<th>${inline(c)}</th>`);
      });
      out.push('</tr></thead><tbody>');
      body.forEach((row) => {
        if (/^[-|:\s]+$/.test(row)) return;
        const td = cells(row);
        if (!td.length) return;
        out.push('<tr>');
        td.forEach((c) => {
          out.push(`<td>${inline(c)}</td>`);
        });
        out.push('</tr>');
      });
      out.push('</tbody></table>');
      inTable = false;
      tableRows = [];
    }

    function inline(text) {
      return escapeHtml(text)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
    }

    for (const raw of lines) {
      const line = raw.trimEnd();
      const t = line.trim();

      if (t.startsWith('|') && t.endsWith('|')) {
        flushList();
        inTable = true;
        tableRows.push(t);
        continue;
      }
      if (inTable && !t) {
        flushTable();
        continue;
      }
      if (inTable) flushTable();

      if (!t) {
        flushList();
        continue;
      }

      if (t === '---' || t === '***') {
        flushList();
        out.push('<hr class="mova-resumen__hr">');
        continue;
      }

      const h = t.match(/^(#{1,3})\s+(.+)$/);
      if (h) {
        flushList();
        const level = h[1].length + 1;
        const tag = `h${Math.min(level, 4)}`;
        out.push(`<${tag} class="mova-resumen__${tag}">${inline(h[2])}</${tag}>`);
        continue;
      }

      if (t.startsWith('> ')) {
        flushList();
        out.push(`<blockquote class="mova-resumen__quote">${inline(t.slice(2))}</blockquote>`);
        continue;
      }

      const ul = t.match(/^[-*]\s+(.+)$/);
      if (ul) {
        if (!inUl) {
          flushList();
          out.push('<ul class="mova-resumen__ul">');
          inUl = true;
        }
        out.push(`<li>${inline(ul[1])}</li>`);
        continue;
      }

      const ol = t.match(/^\d+\.\s+(.+)$/);
      if (ol) {
        if (!inOl) {
          flushList();
          out.push('<ol class="mova-resumen__ol">');
          inOl = true;
        }
        out.push(`<li>${inline(ol[1])}</li>`);
        continue;
      }

      flushList();
      out.push(`<p class="mova-resumen__p">${inline(t)}</p>`);
    }

    flushList();
    flushTable();
    return out.join('\n');
  }

  function render(md, origen) {
    root.innerHTML = `
      <section class="mova-resumen">
        <div class="mova-resumen__head">
          <h2>Resumen del agente</h2>
          <span class="mova-resumen__origen">${escapeHtml(origen)}</span>
        </div>
        <div class="mova-resumen__body">${markdownToHtml(md)}</div>
        <p class="mova-resumen__edit">
          Edita <code>${escapeHtml(resumenPath)}</code> para actualizar este bloque.
        </p>
      </section>`;
  }

  async function cargar() {
    const urls = [resumenPath];
    if (!resumenPath.includes('/')) {
      urls.push(`../${resumenPath}`);
    }

    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) continue;
        const text = await res.text();
        if (text.trim()) {
          render(text, url);
          return;
        }
      } catch (_) {
        /* file:// o sin servidor */
      }
    }

    const data = window.MKOF_MOVA || {};
    const md = data.resumenMarkdown || data.resumenFallback || 'Sin resumen.';
    render(md, 'mkof-mova-data.js');
  }

  cargar();
})();
