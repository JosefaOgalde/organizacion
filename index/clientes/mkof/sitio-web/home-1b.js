/* Home 1B — panel de servicios + reveals */
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

  const list = document.getElementById("svc-list");
  const panelMedia = document.getElementById("svc-panel-media");
  const panelLabel = document.getElementById("svc-panel-label");
  const panelDesc = document.getElementById("svc-panel-desc");
  const panelTags = document.getElementById("svc-panel-tags");
  const panelKpi = document.getElementById("svc-panel-kpi");
  const panelKpiL = document.getElementById("svc-panel-kpi-l");

  function renderPanel(index) {
    const s = SERVICES[index];
    if (!s || !panelMedia) return;

    panelMedia.className = "svc-panel__media is-tone-" + s.tone;
    panelMedia.innerHTML = "<span>" + s.img + "</span>";
    panelLabel.textContent = s.n + " — " + s.t;
    panelDesc.textContent = s.d;
    panelTags.innerHTML = s.items.map(function (it) {
      return "<span>" + it + "</span>";
    }).join("");
    panelKpi.textContent = s.kpiN;
    panelKpiL.textContent = "· " + s.kpiL;
  }

  if (list) {
    list.addEventListener("mouseover", function (e) {
      const item = e.target.closest(".svc-item");
      if (!item) return;
      const idx = Number(item.getAttribute("data-svc"));
      list.querySelectorAll(".svc-item").forEach(function (el) {
        el.classList.toggle("is-active", el === item);
      });
      renderPanel(idx);
    });

    list.addEventListener("focusin", function (e) {
      const item = e.target.closest(".svc-item");
      if (!item) return;
      item.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    });

    list.querySelectorAll(".svc-item").forEach(function (el) {
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
    });

    renderPanel(0);
  }

  /* Reveal on scroll — motion de presencia */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll(
      ".verb, .insight, .caso, .faq__item, .section-head, .svc-panel"
    );
    targets.forEach(function (el) {
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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    targets.forEach(function (el) {
      io.observe(el);
    });
  }
})();
