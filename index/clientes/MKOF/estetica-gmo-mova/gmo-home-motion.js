(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Curtain */
  const curtain = document.createElement('div');
  curtain.className = 'page-curtain';
  curtain.innerHTML = '<span>Making Of</span>';
  document.body.prepend(curtain);

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.prepend(progress);

  function finishCurtain() {
    if (reduce) {
      curtain.classList.add('is-done');
      return;
    }
    requestAnimationFrame(() => {
      setTimeout(() => curtain.classList.add('is-done'), 480);
    });
  }
  if (document.readyState === 'complete') finishCurtain();
  else window.addEventListener('load', finishCurtain);

  /* Header */
  const header = document.querySelector('header');
  function onScroll() {
    const y = window.scrollY || 0;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (y / max) * 100 : 0;
    progress.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (reduce) {
    document.querySelectorAll('[data-reveal], [data-stagger], .flow, .stats-band, .logos, .bento, #faqList, .contacto')
      .forEach((el) => el.classList.add('is-in'));
    return;
  }

  /* Intersection Observer reveals */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  document.querySelectorAll('[data-reveal], [data-stagger], .flow, .stats-band, .logos, .bento, #faqList, .contacto')
    .forEach((el) => io.observe(el));

  /* Parallax suave en brújula */
  const compass = document.querySelector('.hero-right .compass');
  const heroRight = document.querySelector('.hero-right');
  if (compass && heroRight) {
    window.addEventListener(
      'scroll',
      () => {
        const rect = heroRight.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const mid = rect.top + rect.height / 2 - window.innerHeight / 2;
        const t = Math.max(-18, Math.min(18, mid * 0.04));
        compass.style.transform = `translateY(${t}px)`;
      },
      { passive: true }
    );
  }

  /* Magnetic CTA */
  document.querySelectorAll('.cta-btn').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = '';
    });
  });
})();
