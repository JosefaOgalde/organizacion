/* Home 1B Alt — dropdown Servicios + tabs + reveals */
(function () {
  const SERVICES = [
    {
      n: "01",
      t: "Estrategia 360°",
      d: "Diagnóstico, hoja de ruta y gobernanza de canales sobre un mismo tablero de datos.",
      items: ["Roadmap", "OKRs", "Medición", "Squads"],
      kpiN: "▲ +1 modelo",
      kpiL: "de decisión compartida",
      img: "Imagen — tablero de decisión / workshop",
      tone: "a",
    },
    {
      n: "02",
      t: "Posicionamiento SEO",
      d: "Construimos la autoridad de la marca para que tus clientes te encuentren de forma orgánica y sostenida.",
      items: ["Auditoría técnica", "Contenidos", "Linkbuilding", "IA aplicada"],
      kpiN: "▲ +180%",
      kpiL: "tráfico orgánico (caso ref.)",
      img: "Imagen — SERP / arquitectura de contenidos",
      tone: "b",
    },
    {
      n: "03",
      t: "Paid Media",
      d: "Inversión eficiente con lectura de incrementalidad, no solo de last click.",
      items: ["Google Ads", "Meta", "Retail media", "Incrementality"],
      kpiN: "▲ CPA -34%",
      kpiL: "con reasignación (caso ref.)",
      img: "Imagen — dashboards de medios",
      tone: "c",
    },
    {
      n: "04",
      t: "Content & Social",
      d: "Narrativa de marca y contenido que alimenta SEO, paid y comunidad con la misma voz.",
      items: ["Editorial", "Social", "UGC", "Calendario"],
      kpiN: "▲ +1 voz",
      kpiL: "consistente en todos los canales",
      img: "Imagen — piezas editoriales / feed",
      tone: "a",
    },
    {
      n: "05",
      t: "Productos Digitales",
      d: "Sitios, landings y herramientas que convierten la estrategia en experiencia medible.",
      items: ["Web", "CRO", "Analytics", "Integraciones"],
      kpiN: "▲ +52%",
      kpiL: "ventas atribuidas (caso ref.)",
      img: "Imagen — mockups de producto digital",
      tone: "b",
    },
    {
      n: "06",
      t: "Creatividad y Diseño",
      d: "Identidad, campañas y sistemas visuales al servicio del objetivo de negocio.",
      items: ["Brand", "Campaign", "Design system", "Motion"],
      kpiN: "▲ +1 sistema",
      kpiL: "visual reutilizable",
      img: "Imagen — moodboard / piezas de campaña",
      tone: "c",
    },
  ];

  /* Dropdown Servicios */
  const dropWrap = document.querySelector(".menu__item--drop");
  const toggle = document.getElementById("svc-toggle");
  const drop = document.getElementById("svc-drop");

  function closeDrop() {
    if (!drop || !toggle || !dropWrap) return;
    drop.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    dropWrap.classList.remove("is-open");
  }

  function openDrop() {
    drop.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    dropWrap.classList.add("is-open");
  }

  if (toggle && drop && dropWrap) {
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      if (drop.hidden) openDrop();
      else closeDrop();
    });
    document.addEventListener("click", function (e) {
      if (!dropWrap.contains(e.target)) closeDrop();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrop();
    });
  }

  /* Tabs + stage */
  const media = document.getElementById("svc-media");
  const label = document.getElementById("svc-label");
  const title = document.getElementById("svc-title");
  const desc = document.getElementById("svc-desc");
  const tags = document.getElementById("svc-tags");
  const kpi = document.getElementById("svc-kpi");
  const kpiL = document.getElementById("svc-kpi-l");
  const tabs = document.querySelectorAll(".svc-tab");

  function render(index) {
    const s = SERVICES[index];
    if (!s || !media) return;
    media.className = "svc-stage__media is-tone-" + s.tone;
    media.innerHTML = "<span>" + s.img + "</span>";
    label.textContent = s.n + " — " + s.t;
    title.textContent = s.t;
    desc.textContent = s.d;
    tags.innerHTML = s.items.map(function (it) {
      return "<span>" + it + "</span>";
    }).join("");
    kpi.textContent = s.kpiN;
    kpiL.textContent = "· " + s.kpiL;
  }

  function activate(index) {
    tabs.forEach(function (tab) {
      const on = Number(tab.getAttribute("data-svc")) === index;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    render(index);
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activate(Number(tab.getAttribute("data-svc")));
    });
  });

  if (drop) {
    drop.querySelectorAll("[data-jump]").forEach(function (a) {
      a.addEventListener("click", function () {
        activate(Number(a.getAttribute("data-jump")));
        closeDrop();
      });
    });
  }

  render(0);

  /* Reveal */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) {
    const els = document.querySelectorAll(
      ".strip, .svc-stage, .about__grid, .caso, .post, .cta"
    );
    els.forEach(function (el) {
      el.classList.add("reveal");
    });
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }
})();
