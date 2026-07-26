(function () {
  const year = document.getElementById('y');
  if (year) year.textContent = String(new Date().getFullYear());

  document.querySelectorAll('[data-work]').forEach((item) => {
    const btn = item.querySelector('.work__btn');
    const panel = item.querySelector('.work__panel');
    if (!btn || !panel) return;

    btn.addEventListener('click', () => {
      const open = item.classList.contains('is-open');
      document.querySelectorAll('[data-work].is-open').forEach((other) => {
        if (other === item) return;
        other.classList.remove('is-open');
        const ob = other.querySelector('.work__btn');
        const op = other.querySelector('.work__panel');
        if (ob) ob.setAttribute('aria-expanded', 'false');
        if (op) op.hidden = true;
      });
      item.classList.toggle('is-open', !open);
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  let channel = 'whatsapp';

  form?.querySelectorAll('[data-channel]').forEach((btn) => {
    btn.addEventListener('click', () => {
      channel = btn.getAttribute('data-channel') || 'whatsapp';
    });
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nombre = String(data.get('nombre') || '').trim();
    const email = String(data.get('email') || '').trim();
    const mensaje = String(data.get('mensaje') || '').trim();

    if (!nombre || !email || !mensaje) {
      if (status) status.textContent = 'Completá nombre, email y mensaje.';
      return;
    }

    const texto = `Hola Josefa, soy ${nombre} (${email}).\n\n${mensaje}`;

    if (channel === 'email') {
      const subject = encodeURIComponent(`Contacto web · ${nombre}`);
      const body = encodeURIComponent(texto);
      window.location.href = `mailto:josefaogalde@gmail.com?subject=${subject}&body=${body}`;
      if (status) status.textContent = 'Abriendo tu correo…';
      return;
    }

    const wa = `https://wa.me/56966047614?text=${encodeURIComponent(texto)}`;
    window.open(wa, '_blank', 'noopener,noreferrer');
    if (status) status.textContent = 'Abriendo WhatsApp…';
  });
})();
