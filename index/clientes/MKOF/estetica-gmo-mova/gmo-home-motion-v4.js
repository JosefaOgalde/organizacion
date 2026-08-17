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
    '[data-reveal], [data-stagger], .flow, .stats-band, .logos, .servicios, .bento, #faqList, .contacto, .flip-grid';

  if (reduce) {
    document.querySelectorAll(watch).forEach((el) => el.classList.add('is-in'));
    const bandR = document.querySelector('.stats-band');
    if (bandR) {
      bandR.classList.add('is-in', 'is-words', 'is-ready');
      bandR.querySelectorAll('.w').forEach((w) => w.classList.add('is-on'));
    }
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
    { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
  );
  document.querySelectorAll(watch).forEach((el) => io.observe(el));

  /* Video caras: salta frames iniciales raros del loop */
  const video = document.querySelector('.hero-video');
  const heroRight = document.querySelector('.hero-right');
  const FACE_START = 3.5;
  if (video) {
    const snapGoodFrame = () => {
      try {
        if (video.currentTime < FACE_START) video.currentTime = FACE_START;
      } catch (_) {}
    };
    video.addEventListener('loadedmetadata', snapGoodFrame);
    video.addEventListener('seeked', () => {
      video.classList.add('is-ready');
    });
    video.addEventListener('timeupdate', () => {
      if (video.currentTime > 0 && video.currentTime < FACE_START * 0.55) {
        snapGoodFrame();
      }
    });
    video.addEventListener('play', snapGoodFrame);
    if (video.readyState >= 1) snapGoodFrame();
  }
  if (video && heroRight) {
    window.addEventListener(
      'scroll',
      () => {
        const rect = heroRight.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const mid = rect.top + rect.height / 2 - window.innerHeight / 2;
        const y = Math.max(-28, Math.min(28, mid * 0.06));
        const s = 1.22 + Math.min(0.05, Math.abs(mid) * 0.0001);
        video.style.transform = `translateY(${y}px) scale(${s})`;
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

  /* Stats: bloque visible; texto palabra a palabra (igual v2) */
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

  /* Spotlight global: degradé sigue el cursor en todo el sitio */
  if (!reduce) {
    const siteSpot = document.createElement('div');
    siteSpot.className = 'gmo-site-spot';
    siteSpot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(siteSpot);
    document.documentElement.classList.add('has-site-spot');

    window.addEventListener(
      'pointermove',
      (e) => {
        siteSpot.style.left = e.clientX + 'px';
        siteSpot.style.top = e.clientY + 'px';
        document.documentElement.classList.add('is-pointer');
      },
      { passive: true }
    );
    window.addEventListener('pointerleave', () => {
      document.documentElement.classList.remove('is-pointer');
    });
    document.addEventListener('pointerout', (e) => {
      if (!e.relatedTarget) document.documentElement.classList.remove('is-pointer');
    });
  }

  /* Process vanguard: magnetic orb + hot state */
  const process = document.querySelector('.process-vanguard');
  const flow = document.querySelector('.flow-vanguard');
  if (process && flow && !reduce) {
    process.addEventListener('pointerleave', () => {
      flow.querySelectorAll('.step').forEach((s) => s.classList.remove('is-hot'));
    });

    flow.querySelectorAll('.step').forEach((step) => {
      const orb = step.querySelector('.step-orb');
      step.addEventListener('pointerenter', () => {
        flow.querySelectorAll('.step').forEach((s) => s.classList.toggle('is-hot', s === step));
      });
      step.addEventListener('pointermove', (e) => {
        if (!orb) return;
        const r = step.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        orb.style.transform = `translate(${x * 14}px, ${y * 14}px)`;
      });
      step.addEventListener('pointerleave', () => {
        if (orb) orb.style.transform = '';
      });
    });
  }
})();
