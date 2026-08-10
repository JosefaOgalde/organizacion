(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Nav · dropdown servicios */
  const btn = document.getElementById("v1-svc");
  const list = document.getElementById("v1-svc-list");
  if (btn && list) {
    const close = () => {
      list.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    };
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = list.hidden;
      list.hidden = !open;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  /* Nav · sombra al scrollear */
  const nav = document.querySelector(".v1-nav");
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Smooth scroll anclas */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      if (list && !list.hidden) {
        list.hidden = true;
        btn?.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* Reveal al entrar en viewport */
  const reveals = document.querySelectorAll("[data-reveal]");
  if (reveals.length) {
    if (reduce) {
      reveals.forEach((el) => el.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
      );
      reveals.forEach((el) => io.observe(el));
    }
  }

  /* Te acompañamos · flip cards */
  const flips = document.querySelectorAll("[data-flip]");
  flips.forEach((card) => {
    card.setAttribute("aria-pressed", "false");
    card.addEventListener("click", () => {
      const willOpen = !card.classList.contains("is-flipped");
      flips.forEach((c) => {
        c.classList.remove("is-flipped");
        c.setAttribute("aria-pressed", "false");
      });
      if (willOpen) {
        card.classList.add("is-flipped");
        card.setAttribute("aria-pressed", "true");
      }
    });
  });

  /* Servicios · chips: hover/focus ya en CSS; click resalta */
  document.querySelectorAll(".v1-svc__chips article").forEach((chip) => {
    chip.setAttribute("tabindex", "0");
    chip.addEventListener("click", () => {
      document.querySelectorAll(".v1-svc__chips article").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
    });
    chip.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        chip.click();
      }
    });
  });

  /* FAQ · solo uno abierto a la vez */
  const faqs = document.querySelectorAll(".v1-faq details");
  faqs.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqs.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  /* Formulario · feedback */
  const form = document.querySelector(".v1-form");
  if (form) {
    const status = document.createElement("p");
    status.className = "v1-form__status";
    status.setAttribute("role", "status");
    status.hidden = true;
    form.appendChild(status);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const submit = form.querySelector('[type="submit"]');
      if (submit) {
        submit.disabled = true;
        submit.textContent = "Enviando…";
      }
      window.setTimeout(() => {
        form.reset();
        if (submit) {
          submit.disabled = false;
          submit.textContent = "Enviar";
        }
        status.hidden = false;
        status.textContent = "Gracias. Te contactamos a la brevedad.";
        status.classList.add("is-ok");
      }, 650);
    });
  }
})();
