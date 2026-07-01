(function () {
  const GUIA = () => window.MKOF_GITHUB_GUIA || null;

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function mockupBrowser(url, bodyHtml) {
    return `<div class="mkof-mockup" role="img" aria-label="Vista simulada de GitHub">
      <div class="mkof-mockup__bar">
        <span class="mkof-mockup__dot"></span>
        <span class="mkof-mockup__dot"></span>
        <span class="mkof-mockup__dot"></span>
        <div class="mkof-mockup__url">${escapeHtml(url)}</div>
      </div>
      <div class="mkof-mockup__body">${bodyHtml}</div>
    </div>`;
  }

  function mockupHtml(tipo, paso) {
    switch (tipo) {
      case 'signup-url':
        return mockupBrowser(
          'github.com/signup',
          `<div class="mkof-mockup__logo">GitHub <span>·</span> Sign up</div>
           <p style="margin:0;font-size:0.82rem;color:#656d76">Crear tu cuenta</p>
           <div style="margin-top:1rem;padding:0.6rem;background:#fff8c5;border-radius:6px;font-size:0.78rem;border:1px dashed #d4a72c">
             👆 Escribe <strong>github.com/signup</strong> en la barra del navegador
           </div>`
        );
      case 'signup-email':
        return mockupBrowser(
          'github.com/signup',
          `<div class="mkof-mockup__logo">GitHub</div>
           <div class="mkof-mockup__field">
             <label class="mkof-mockup__label">Email <span class="mkof-mockup__arrow">←</span></label>
             <input class="mkof-mockup__input mkof-mockup__input--highlight" readonly value="infra@mova.cl" />
           </div>
           <div class="mkof-mockup__field">
             <label class="mkof-mockup__label">Password</label>
             <input class="mkof-mockup__input" readonly value="••••••••••••" type="password" />
           </div>`
        );
      case 'signup-password':
        return mockupBrowser(
          'github.com/signup',
          `<div class="mkof-mockup__field">
             <label class="mkof-mockup__label">Email</label>
             <input class="mkof-mockup__input" readonly value="infra@mova.cl" />
           </div>
           <div class="mkof-mockup__field">
             <label class="mkof-mockup__label">Password <span class="mkof-mockup__arrow">←</span></label>
             <input class="mkof-mockup__input mkof-mockup__input--highlight" readonly value="Mova-2026-Segura!" />
             <div style="font-size:0.7rem;color:#1a7f37;margin-top:0.25rem">●●●●● Fuerte</div>
           </div>`
        );
      case 'signup-username':
        return mockupBrowser(
          'github.com/signup',
          `<div class="mkof-mockup__field">
             <label class="mkof-mockup__label">Username <span class="mkof-mockup__arrow">←</span></label>
             <input class="mkof-mockup__input mkof-mockup__input--highlight" readonly value="mova-infra" />
             <div style="font-size:0.7rem;color:#656d76;margin-top:0.25rem">github.com/mova-infra</div>
           </div>
           <div style="font-size:0.75rem;color:#656d76">Email preferences…</div>`
        );
      case 'signup-submit':
        return mockupBrowser(
          'github.com/signup',
          `<div style="font-size:0.8rem;margin-bottom:0.75rem;padding:0.5rem;background:#f6f8fa;border-radius:6px;text-align:center">
             🤖 Verificar que no eres un robot
           </div>
           <button type="button" class="mkof-mockup__btn mkof-mockup__btn--highlight">Create account</button>`
        );
      case 'verify-email':
        return mockupBrowser(
          'github.com/signup',
          `<div style="font-size:0.88rem;font-weight:600;margin-bottom:0.35rem">Verify your email</div>
           <p style="margin:0 0 0.75rem;font-size:0.78rem;color:#656d76">Ingresa el código enviado a infra@mova.cl</p>
           <div class="mkof-mockup__codes">
             <div class="mkof-mockup__code-box">4</div>
             <div class="mkof-mockup__code-box">8</div>
             <div class="mkof-mockup__code-box">2</div>
             <div class="mkof-mockup__code-box">9</div>
             <div class="mkof-mockup__code-box">1</div>
             <div class="mkof-mockup__code-box">5</div>
             <div class="mkof-mockup__code-box">7</div>
             <div class="mkof-mockup__code-box">3</div>
           </div>
           <button type="button" class="mkof-mockup__btn">Continue</button>`
        );
      case 'onboarding-skip':
        return mockupBrowser(
          'github.com',
          `<div style="font-size:0.88rem;font-weight:600;margin-bottom:0.5rem">Welcome to GitHub!</div>
           <p style="margin:0 0 0.75rem;font-size:0.78rem;color:#656d76">¿Cuántas personas trabajan contigo?</p>
           <button type="button" class="mkof-mockup__btn mkof-mockup__btn--ghost">Skip this step →</button>`
        );
      case 'plan-free':
        return mockupBrowser(
          'github.com',
          `<div style="font-size:0.88rem;font-weight:600;margin-bottom:0.5rem">Pick a plan</div>
           <div style="border:2px solid #0969da;border-radius:8px;padding:0.75rem;background:#f0f6ff;margin-bottom:0.5rem">
             <div style="font-weight:700;font-size:0.85rem">Free</div>
             <div style="font-size:0.75rem;color:#656d76">Repos privados ilimitados</div>
           </div>
           <button type="button" class="mkof-mockup__btn mkof-mockup__btn--highlight">Continue for free</button>`
        );
      case 'dashboard-ready':
        return mockupBrowser(
          'github.com',
          `<div class="mkof-mockup__check">✓</div>
           <div class="mkof-mockup__ok-text">¡Cuenta creada!</div>
           <div class="mkof-mockup__dash">
             <div class="mkof-mockup__avatar"></div>
             <div>
               <div style="font-weight:600;font-size:0.85rem">mova-infra</div>
               <div style="font-size:0.72rem;color:#656d76">infra@mova.cl</div>
             </div>
           </div>`
        );
      default:
        return '';
    }
  }

  function render() {
    const g = GUIA();
    const root = document.getElementById('mkof-github-guia-root');
    if (!g || !root) return;

    const correoEjemplos = g.correoRecomendado.ejemplos
      .map((e) => `<span class="mkof-guia-correo__tag">${escapeHtml(e)}</span>`)
      .join('');

    const pasosHtml = g.pasos
      .map(
        (p) => `<article class="mkof-guia-paso" id="paso-${p.num}">
          <div class="mkof-guia-paso__head">
            <span class="mkof-guia-paso__badge">${p.num}</span>
            <h2 class="mkof-guia-paso__titulo">${escapeHtml(p.titulo)}</h2>
          </div>
          <p class="mkof-guia-paso__texto">${escapeHtml(p.texto)}</p>
          ${mockupHtml(p.mockup, p)}
          <p class="mkof-guia-paso__tip"><strong>Tip:</strong> ${escapeHtml(p.tip)}</p>
        </article>`
      )
      .join('');

    const checklistHtml = g.checklist
      .map((c) => `<li>${escapeHtml(c)}</li>`)
      .join('');

    root.innerHTML = `
      <nav class="mkof-guia-breadcrumb">
        <a href="../MKOF.html">← MKOF / MOVA</a>
      </nav>
      <header class="mkof-guia-header">
        <h1>GitHub para MOVA · Paso 1: crear cuenta</h1>
        <p class="mkof-guia-header__meta">${escapeHtml(g.hito)} · Guía visual paso a paso</p>
        <p style="margin:0.5rem 0 0;font-size:0.9rem">
          <a href="MOVA-GitHub-Paso1-Crear-Cuenta.pptx" download>⬇ Descargar presentación PPT</a>
        </p>
      </header>

      <div class="mkof-guia-progreso">
        <div class="mkof-guia-progreso__item mkof-guia-progreso__item--activo">
          <div class="mkof-guia-progreso__num">Paso 1 · Ahora</div>
          Crear cuenta con correo general
        </div>
        <div class="mkof-guia-progreso__item mkof-guia-progreso__item--pendiente">
          <div class="mkof-guia-progreso__num">Paso 2 · Próximo</div>
          Repo privado <code>${escapeHtml(g.pasoSiguiente.nombreRepo)}</code>
        </div>
      </div>

      <section class="mkof-guia-correo">
        <h2>${escapeHtml(g.correoRecomendado.titulo)}</h2>
        <div class="mkof-guia-correo__ejemplos">${correoEjemplos}</div>
        <ul>${g.correoRecomendado.reglas.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
      </section>

      ${pasosHtml}

      <section class="mkof-guia-checklist">
        <h2>Checklist antes de seguir al Paso 2</h2>
        <ul>${checklistHtml}</ul>
      </section>

      <section class="mkof-guia-siguiente" id="paso-2-pendiente">
        <h2>Paso 2 · Crear repositorio privado (próximamente)</h2>
        <p>Cuando la cuenta esté lista, el siguiente paso será crear el repo privado
        <strong>${escapeHtml(g.pasoSiguiente.nombreRepo)}</strong> para respaldar los workflows de n8n.
        Esa guía se publicará aquí como continuación de este documento.</p>
      </section>`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
