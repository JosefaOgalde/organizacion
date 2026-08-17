(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.prepend(progress);

  const header = document.querySelector('header');
  function onScroll() {
    const y = window.scrollY || 0;
    if (header) header.classList.toggle('is-scrolled', y > 20);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const watch =
    '[data-reveal], [data-stagger], .flow, .logos, .servicios, .bento, .faq, #faqList, .contacto, .flip-grid, .stats-band';

  if (reduce) {
    document.querySelectorAll(watch).forEach((el) => el.classList.add('is-in'));
    const bandR = document.querySelector('.stats-band');
    if (bandR) bandR.classList.add('is-in', 'is-words');
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -4% 0px' }
  );
  document.querySelectorAll(watch).forEach((el) => io.observe(el));

  /* Video más lento + integración */
  const video = document.querySelector('.hero-video');
  const heroRight = document.querySelector('.hero-right');
  if (video) {
    const setSlow = () => {
      try { video.playbackRate = 0.72; } catch (_) {}
    };
    setSlow();
    video.addEventListener('play', setSlow);
    video.addEventListener('loadeddata', setSlow);
  }
  if (video && heroRight && !reduce) {
    window.addEventListener(
      'scroll',
      () => {
        const rect = heroRight.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const mid = rect.top + rect.height / 2 - window.innerHeight / 2;
        const s = 1.03 + Math.min(0.04, Math.abs(mid) * 0.0001);
        video.style.transform = `scale(${s})`;
      },
      { passive: true }
    );
  }

  /* Magnetic CTA fuerte */
  document.querySelectorAll('.cta-btn').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px) scale(1.04)`;
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = '';
    });
  });

  /* Stats: bloque verde siempre visible; texto palabra a palabra */
  const band = document.querySelector('.stats-band');
  if (band) {
    const p = band.querySelector('p');
    if (p) {
      function wrapInPlace(el) {
        Array.from(el.childNodes).forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            const parts = child.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            parts.forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) {
                frag.appendChild(document.createTextNode(part));
                return;
              }
              const span = document.createElement('span');
              span.className = 'w';
              span.textContent = part;
              frag.appendChild(span);
            });
            el.replaceChild(frag, child);
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            wrapInPlace(child);
          }
        });
      }
      wrapInPlace(p);
      band.classList.add('is-ready');
    }

    function playWords() {
      if (band.dataset.played) return;
      band.dataset.played = '1';
      band.classList.add('is-in');
      const words = band.querySelectorAll('.w');
      band.classList.add('is-words');
      words.forEach((w, i) => {
        setTimeout(() => w.classList.add('is-on'), 60 + i * 32);
      });
    }

    if (reduce) {
      band.classList.add('is-in', 'is-words');
      band.querySelectorAll('.w').forEach((w) => w.classList.add('is-on'));
    } else {
      const once = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          playWords();
          once.disconnect();
        },
        { threshold: 0.15, rootMargin: '0px 0px -5% 0px' }
      );
      once.observe(band);
    }
  }
})();
