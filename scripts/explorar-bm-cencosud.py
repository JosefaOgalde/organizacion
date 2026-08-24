#!/usr/bin/env python3
"""
Exploración LOCAL del Business Manager Cencosud (Playwright).

Abre el navegador en TU PC, entra con tu sesión (login manual ADFS o
usuario/clave en secrets/.env) y vuelca la estructura del formulario
(labels, inputs, botones, URLs) para poder completar recetas después.

Uso (en tu máquina, carpeta del repo):

  # 1) Credenciales locales (NUNCA las pegues en el chat ni las subas a Git)
  copy secrets\\env.example → secrets\\.env   (Windows)
  # o: cp …/secrets/env.example …/secrets/.env

  # 2) Instalar una vez
  pip install playwright
  playwright install chromium

  # 3) Explorar (navegador visible)
  python3 scripts/explorar-bm-cencosud.py

Flujo:
  - Abre el Gestor de contenido de recetas Jumbo (view-manager)
  - Si ADFS pide interacción: inicia sesión TÚ en la ventana
  - Cuando estés dentro, navega hasta «Nueva receta» (o el formulario)
  - Vuelve a la terminal y pulsa ENTER → guarda estructura + screenshot
  - Opcional: --fill-json out/anticuchos….json  intenta rellenar campos ya mapeados

Salidas (locales, gitignored):
  secrets/bm-session.json      — cookies de sesión
  secrets/bm-estructura.json   — dump de campos de la página actual
  secrets/bm-screenshot.png    — captura
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _crc_rutas():
    path = Path(__file__).resolve().parent / "crc_rutas.py"
    spec = importlib.util.spec_from_file_location("crc_rutas", path)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


_RUTAS = _crc_rutas()
CRC = _RUTAS.resolver_crc(ROOT)
SECRETS = _RUTAS.resolver_secrets(CRC)
ENV_PATH = SECRETS / ".env"
SESSION_PATH = SECRETS / "bm-session.json"
ESTRUCTURA_PATH = SECRETS / "bm-estructura.json"
DIAGNOSTICO_PATH = SECRETS / "bm-diagnostico.json"
SCREENSHOT_PATH = SECRETS / "bm-screenshot.png"
MAPA_SELECTORES_PATH = SECRETS / "bm-selectores.json"
CAMPOS_REQUERIDOS_PUBLICACION = ("titulo", "descripcion", "ingredientes", "pasos")
CAMPOS_FALTANTES_NO_BLOQUEANTES = {"ingredientes.skuCencosud"}

# CMS Jumbo Recetas: cada bloque se edita con su lápiz (no es un formulario plano).
COMPONENTES_CMS = (
    {
        "clave": "cabecera",
        "lapiz_key": "lapiz_cabecera",
        "aliases": ("Cabecera", "Header", "header"),
        "campos": (
            "field_titulo",
            "field_descripcion",
            "field_porciones",
            "field_dificultad",
            "field_tiempo",
            "field_alt",
        ),
    },
    {
        "clave": "tags",
        "lapiz_key": "lapiz_tags",
        "aliases": ("tags", "Tags", "TAGS", "etiquetas", "Etiquetas"),
        "campos": ("field_tags",),
    },
    {
        "clave": "ingredientes",
        "lapiz_key": "lapiz_ingredientes",
        "aliases": ("Lista Ingredientes", "list_ingredients", "Ingredientes"),
        "campos": ("field_ingredientes",),
    },
    {
        "clave": "instrucciones",
        "lapiz_key": "lapiz_instrucciones",
        "aliases": (
            "Lista de Instrucciones",
            "Lista de instrucciones",
            "list_instructions",
            "Instrucciones",
        ),
        "campos": ("field_pasos",),
    },
    {
        "clave": "seo",
        "lapiz_key": "lapiz_seo",
        "aliases": ("SEO HTML", "seo_html", "SEO HTML Bottom"),
        "campos": ("field_seo_html", "field_meta_titulo", "field_meta_descripcion"),
    },
)

# El lienzo de la receta está al centro. A la izquierda está la paleta
# («Cabecera», «tags»…): un clic ahí saca a /cms/projects.
LIENZO_MIN_X = 240

MENSAJE_ENTER_FICHA = (
    "\n>>> En Chromium abre la receta (5 bloques al CENTRO):\n"
    "    Cabecera / tags / Ingredientes / Instrucciones / SEO.\n"
    "    Da igual si están vacíos: el script recarga TODOS desde el lápiz\n"
    "    (primer icono a la derecha de cada bloque, no el basurero).\n"
    "    NO pulses la paleta izquierda (esos mismos nombres).\n"
    "    NO pulses «Proyectos» ni el breadcrumb.\n"
    "    NO entres a «Edición de Lista…».\n"
    "    Cuando veas los 5 bloques, pulsa ENTER aquí.\n"
)


def url_actual(page) -> str:
    return (getattr(page, "url", None) or "") if page is not None else ""


def es_lista_proyectos_cms(url: str | None) -> bool:
    """Lista «Proyectos en JUMBO», no el Gestor de una receta."""
    u = url or ""
    if "view-manager" in u:
        return False
    return "/cms/projects" in u


def _url_sin_query(url: str | None) -> str:
    return (url or "").split("#")[0].split("?")[0].rstrip("/")


def salio_de_la_ficha(actual: str | None, url_ficha: str | None) -> bool:
    """Solo la lista Proyectos. El editor del lápiz no es salir de default."""
    if not url_ficha or not actual:
        return False
    return es_lista_proyectos_cms(actual)


def caja_en_lienzo(box: dict | None, *, min_x: float = LIENZO_MIN_X) -> bool:
    """True si el nodo está en el lienzo central, no en la paleta izquierda."""
    if not box:
        return False
    try:
        x = float(box.get("x") or 0)
        w = float(box.get("width") or 0)
        h = float(box.get("height") or 0)
    except (TypeError, ValueError):
        return False
    return x >= min_x and w >= 20 and h >= 8


def en_vista_default_cms(page) -> bool:
    """True si seguimos en la vista default: 5 bloques o el editor del lápiz."""
    if editor_actual(page) is not None:
        return True
    if _contar_placeholder_vacio(page) >= 1:
        return True
    if recoger_ids_componentes(page):
        return True
    return lienzo_con_bloques_cms(page)


def esperar_ficha_en_lienzo(page, *, headed: bool = True) -> str:
    """Tras ENTER: si Chromium está en Proyectos o el Gestor vacío, pedir la receta."""
    url_ficha = url_actual(page)
    if en_vista_default_cms(page):
        print("  · Default con los 5 bloques. Empiezo a completar Cabecera.")
        return url_ficha
    if not es_lista_proyectos_cms(url_ficha) and not gestor_sin_ficha(url_ficha):
        return url_ficha
    if gestor_sin_ficha(url_ficha):
        print(
            "\n>>> Chromium está en el Gestor (sin /view/id).\n"
            "    Entrá a Recetas_Jumbo → la receta (5 bloques al centro).\n"
            "    Dejá el desplegable en «default». ENTER cuando los veas.\n"
        )
    else:
        print(
            "\n>>> Chromium está en «Proyectos en JUMBO», no en la receta.\n"
            "    Entrá otra vez a Recetas_Jumbo → la receta (5 bloques al centro).\n"
            "    No pulses la paleta izquierda. ENTER cuando la veas.\n"
        )
    if headed and sys.stdin.isatty():
        try:
            input()
        except EOFError:
            try:
                page.wait_for_timeout(8_000)
            except Exception:
                pass
    return url_actual(page)


def restaurar_ficha_si_salio(page, url_ficha: str | None) -> bool:
    """Solo si caímos en Proyectos. Nunca recarga la vista default."""
    if not url_ficha or page is None:
        return False
    if en_vista_default_cms(page):
        return False
    actual = url_actual(page)
    if not salio_de_la_ficha(actual, url_ficha):
        return False
    if not url_tiene_vista_receta(url_ficha):
        print("  · Estoy en Proyectos. No recargo el Gestor pelado ni salgo de default.")
        return False
    print("  · El navegador salió a Proyectos; vuelvo a la ficha (vista default).")
    try:
        page.goto(url_ficha, wait_until="domcontentloaded", timeout=60_000)
        try:
            page.wait_for_timeout(400)
        except Exception:
            pass
        return True
    except Exception as e:
        print(f"  · No pude volver a la ficha: {e}")
        return False


def _bounding_box(loc) -> dict | None:
    if loc is None or not hasattr(loc, "bounding_box"):
        return None
    try:
        return loc.bounding_box()
    except Exception:
        return None


def clic_locator_en_lienzo(page, selector: str, timeout: int = 5_000) -> bool:
    """Clic del primer match que esté en el lienzo (nunca la paleta)."""
    if not selector:
        return False
    try:
        loc = page.locator(selector)
    except Exception:
        return False
    try:
        n = loc.count()
    except Exception:
        n = 1
    if n == 0:
        return False
    for i in range(min(max(n, 1), 16)):
        item = loc.nth(i) if hasattr(loc, "nth") else loc
        box = _bounding_box(item)
        if box is None:
            continue
        if caja_en_lienzo(box):
            item.click(timeout=timeout)
            return True
    return False


def load_env(path: Path) -> dict[str, str]:
    data: dict[str, str] = {}
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            data[k.strip()] = v.strip().strip('"').strip("'")
    for k in (
        "CENCOSUD_BM_USER",
        "CENCOSUD_BM_PASSWORD",
        "CENCOSUD_BM_URL",
        "CENCOSUD_BM_BANDERA",
        "CENCOSUD_BM_HEADED",
        "CENCOSUD_BM_DRY_RUN",
        "CENCOSUD_BM_LOGIN_USER_SEL",
        "CENCOSUD_BM_LOGIN_PASS_SEL",
        "CENCOSUD_BM_LOGIN_SUBMIT_SEL",
    ):
        if os.environ.get(k):
            data[k] = os.environ[k]
    return data


def errores_prepublicacion(receta: dict) -> list[str]:
    errores = []
    if receta.get("estado") != "listo-para-cargar":
        errores.append(f"estado={receta.get('estado')!s} (se requiere listo-para-cargar)")

    campos_faltantes = [
        str(campo)
        for campo in receta.get("camposFaltantes") or []
        if str(campo).strip() and str(campo) not in CAMPOS_FALTANTES_NO_BLOQUEANTES
    ]
    if campos_faltantes:
        errores.append("camposFaltantes=" + ", ".join(campos_faltantes))

    vacios = [campo for campo in CAMPOS_REQUERIDOS_PUBLICACION if not receta.get(campo)]
    if vacios:
        errores.append("campos requeridos vacíos=" + ", ".join(vacios))
    return errores


def dump_estructura(page) -> dict:
    """Extrae campos visibles de la página actual (sin datos sensibles de valor)."""
    return page.evaluate(
        """() => {
      const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim().slice(0, 200);
      const abs = (el) => {
        if (!el) return null;
        if (el.id) return '#' + CSS.escape(el.id);
        const testId = el.getAttribute('data-testid') || el.getAttribute('data-cy') || el.getAttribute('data-test');
        if (testId) return '[data-testid="' + testId.replace(/"/g, '\\\\"') + '"]';
        const name = el.getAttribute('name');
        if (name) return el.tagName.toLowerCase() + '[name="' + name.replace(/"/g, '\\\\"') + '"]';
        const aria = el.getAttribute('aria-label');
        if (aria) return el.tagName.toLowerCase() + '[aria-label="' + aria.replace(/"/g, '\\\\"') + '"]';
        const ph = el.getAttribute('placeholder');
        if (ph) return el.tagName.toLowerCase() + '[placeholder="' + ph.replace(/"/g, '\\\\"') + '"]';
        // SPA sin id/name: ruta CSS corta con nth-of-type
        const parts = [];
        let cur = el;
        for (let depth = 0; cur && cur.nodeType === 1 && depth < 7; depth++) {
          let part = cur.tagName.toLowerCase();
          if (cur.id) {
            parts.unshift('#' + CSS.escape(cur.id));
            break;
          }
          const parent = cur.parentElement;
          if (parent) {
            const siblings = Array.from(parent.children).filter((c) => c.tagName === cur.tagName);
            if (siblings.length > 1) {
              part += ':nth-of-type(' + (siblings.indexOf(cur) + 1) + ')';
            }
          }
          parts.unshift(part);
          cur = parent;
        }
        return parts.length ? parts.join(' > ') : null;
      };
      const fields = [];
      document.querySelectorAll('input, textarea, select, [contenteditable="true"]').forEach((el, i) => {
        if (el.type === 'hidden' || el.type === 'password') return;
        const st = window.getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden') return;
        const rect = el.getBoundingClientRect();
        if (rect.width < 1 && rect.height < 1) return;
        // editor cerrado (ancestro display:none)
        let p = el.parentElement;
        let oculto = false;
        while (p) {
          const ps = window.getComputedStyle(p);
          if (ps.display === 'none' || ps.visibility === 'hidden') { oculto = true; break; }
          p = p.parentElement;
        }
        if (oculto) return;
        const id = el.id || '';
        let label = '';
        if (id) {
          const lab = document.querySelector('label[for="' + CSS.escape(id) + '"]');
          if (lab) label = clean(lab.innerText);
        }
        if (!label) {
          const wrap = el.closest('label');
          if (wrap) label = clean(wrap.innerText);
        }
        if (!label) {
          const prev = el.closest('div, td, li, section, form, [class*="field"], [class*="Field"], [class*="form"]');
          if (prev) {
            const lab2 = prev.querySelector('label, .label, [class*="label"], [class*="Label"], legend, span, p, div');
            if (lab2) label = clean(lab2.innerText);
          }
        }
        if (!label) {
          const prevSib = el.previousElementSibling;
          if (prevSib) label = clean(prevSib.innerText);
        }
        if (!label) {
          const parent = el.parentElement;
          if (parent) {
            const clone = parent.cloneNode(true);
            clone.querySelectorAll('input, textarea, select, button').forEach((n) => n.remove());
            label = clean(clone.innerText);
          }
        }
        const className = (el.className && typeof el.className === 'string') ? el.className.slice(0, 120) : '';
        fields.push({
          index: i,
          tag: el.tagName.toLowerCase(),
          type: el.type || (el.getAttribute('contenteditable') ? 'contenteditable' : ''),
          id: id || null,
          name: el.getAttribute('name'),
          placeholder: el.getAttribute('placeholder'),
          ariaLabel: el.getAttribute('aria-label'),
          className: className || null,
          label,
          selectorSugerido: abs(el),
          disabled: !!el.disabled,
          required: !!el.required
        });
      });
      const buttons = [];
      document.querySelectorAll('button, a[role="button"], input[type="submit"], input[type="button"]').forEach((el, i) => {
        const text = clean(el.innerText || el.value || '');
        if (!text) return;
        buttons.push({
          index: i,
          tag: el.tagName.toLowerCase(),
          text,
          id: el.id || null,
          selectorSugerido: abs(el) || (text ? 'text=' + JSON.stringify(text) : null)
        });
      });
      const links = [];
      document.querySelectorAll('a[href]').forEach((el) => {
        const text = clean(el.innerText);
        const href = el.getAttribute('href') || '';
        if (!text || text.length < 2) return;
        if (/receta|recipe|contenido|content|cms|catalogo|catálogo/i.test(text + ' ' + href)) {
          links.push({ text, href });
        }
      });
      const nav = [];
      document.querySelectorAll('nav a, [role="navigation"] a, aside a, .menu a, [class*="sidebar"] a').forEach((el) => {
        const text = clean(el.innerText);
        if (text) nav.push({ text, href: el.getAttribute('href') });
      });
      return {
        url: location.href,
        title: document.title,
        fields,
        buttons: buttons.slice(0, 80),
        linksReceta: links.slice(0, 40),
        nav: nav.slice(0, 60)
      };
    }"""
    )


def frames_unicos(page) -> list:
    """Frames a inspeccionar. `page.frames` ya incluye el principal.

    El lienzo del Gestor vive en un iframe: si solo se mira el documento
    principal, los 5 bloques no existen para el script.
    """
    try:
        frames = [fr for fr in (getattr(page, "frames", None) or []) if fr is not None]
    except Exception:
        frames = []
    return frames or [page]


def es_frame_principal(page, frame) -> bool:
    if frame is page:
        return True
    try:
        return frame is page.main_frame
    except Exception:
        return False


def evaluar_en_cada_frame(page, script, arg=None) -> list[tuple]:
    """(frame, resultado) por cada frame que respondió sin error."""
    salida = []
    for fr in frames_unicos(page):
        try:
            salida.append((fr, fr.evaluate(script, arg) if arg is not None else fr.evaluate(script)))
        except Exception:
            continue
    return salida


JS_CONTAR_EDITABLES = """() => [...document.querySelectorAll('input, textarea, select, [contenteditable="true"]')]
          .filter((el) => {
            if (el.type === 'hidden' || el.type === 'password' || el.disabled) return false;
            const st = getComputedStyle(el);
            if (st.display === 'none' || st.visibility === 'hidden') return false;
            let p = el.parentElement;
            while (p) {
              const ps = getComputedStyle(p);
              if (ps.display === 'none' || ps.visibility === 'hidden') return false;
              p = p.parentElement;
            }
            const r = el.getBoundingClientRect();
            return r.width > 0 || r.height > 0;
          }).length"""


def contar_campos_editables(page) -> int:
    total = 0
    for _fr, n in evaluar_en_cada_frame(page, JS_CONTAR_EDITABLES):
        if isinstance(n, bool) or not isinstance(n, (int, float)):
            continue
        total += int(n)
    return total


JS_LISTAR_COMPONENTES = """(payload) => {
      const aliasesFlat = payload.aliasesFlat || [];
      const filtrarPaleta = !!payload.filtrarPaleta;
      const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
      const norm = (s) => clean(s).toLowerCase();
      const enChrome = (el) => {
        let n = el;
        while (n && n !== document.body) {
          const tag = (n.tagName || '').toLowerCase();
          const cls = String(n.className || '');
          const role = (n.getAttribute && n.getAttribute('role')) || '';
          const lab = (n.getAttribute && (n.getAttribute('aria-label') || '')) || '';
          if (tag === 'nav' || tag === 'header' || tag === 'aside') return true;
          if (/breadcrumb|sidebar|drawer|palette|paleta/i.test(cls + ' ' + role + ' ' + lab)) return true;
          n = n.parentElement;
        }
        return false;
      };
      const found = [];
      const seen = new Set();
      const nodes = Array.from(
        document.querySelectorAll(
          '[data-component], [data-type], [class*="component"], [class*="Component"], section, article, li, div'
        )
      );
      for (const el of nodes) {
        const box = el.getBoundingClientRect();
        // La paleta solo existe en el documento principal: dentro del iframe
        // del lienzo las coordenadas parten en 0 y este filtro descartaria todo.
        if ((filtrarPaleta && box.left < 240) || enChrome(el)) continue;
        const dataName = clean(el.getAttribute('data-component') || el.getAttribute('data-type') || '');
        const titleEl = el.querySelector(
          '.bloque-nombre, [class*="title"], [class*="Title"], [class*="name"], h1, h2, h3, h4, h5, strong'
        );
        const titleText = clean(titleEl ? titleEl.innerText : '');
        const ownText = clean(el.childNodes && el.childNodes.length
          ? Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ')
          : '');
        const blob = norm([dataName, titleText, ownText].filter(Boolean).join(' | '));
        if (!blob || blob.length > 120) continue;
        for (const item of aliasesFlat) {
          const a = norm(item.alias);
          if (!(blob === a || blob.startsWith(a + ' ') || blob.endsWith(' ' + a) || titleText && norm(titleText) === a || dataName && norm(dataName) === a)) {
            continue;
          }
          if (seen.has(item.clave)) break;
          const editBtn = el.querySelector(
            'button.btn-lapiz, button[aria-label*="Editar" i], button[aria-label*="edit" i], button[title*="Editar" i], button[title*="edit" i], [data-testid*="edit" i], [aria-label*="lápiz" i], [aria-label*="lapiz" i]'
          );
          let lapizSelector = null;
          if (editBtn) {
            if (editBtn.id) lapizSelector = '#' + CSS.escape(editBtn.id);
            else if (editBtn.getAttribute('aria-label')) {
              lapizSelector = 'button[aria-label="' + editBtn.getAttribute('aria-label').replace(/"/g, '\\\\"') + '"]';
            }
          }
          if (!lapizSelector) {
            const acciones = el.querySelector('.acciones-bloque, [class*="action"], [class*="toolbar"], [class*="controls"]');
            const firstBtn = (acciones || el).querySelector('button, [role="button"]');
            if (firstBtn && firstBtn.getAttribute('aria-label')) {
              lapizSelector = 'button[aria-label="' + firstBtn.getAttribute('aria-label').replace(/"/g, '\\\\"') + '"]';
            }
          }
          found.push({
            clave: item.clave,
            alias: item.alias,
            texto: titleText || dataName || item.alias,
            lapizSelector,
            tieneLapiz: !!(editBtn || lapizSelector),
          });
          seen.add(item.clave);
          break;
        }
      }
      return found;
    }"""


JS_DIAGNOSTICO_FRAME = """() => {
      const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim().slice(0, 160);
      const caja = (el) => {
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
      };
      const etiqueta = (el) => {
        if (el.id) {
          const lab = document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
          if (lab) return clean(lab.innerText);
        }
        const envoltorio = el.closest('label');
        if (envoltorio) return clean(envoltorio.innerText);
        const cerca = el.closest('div, td, li, section, form');
        const lab2 = cerca && cerca.querySelector('label, legend, [class*="label"]');
        return lab2 ? clean(lab2.innerText) : '';
      };
      const campos = [];
      document.querySelectorAll('input, textarea, select, [contenteditable="true"]').forEach((el) => {
        if (el.type === 'hidden' || el.type === 'password') return;
        campos.push({
          tag: el.tagName.toLowerCase(),
          type: el.type || (el.getAttribute('contenteditable') ? 'contenteditable' : ''),
          id: el.id || null,
          name: el.getAttribute('name'),
          placeholder: el.getAttribute('placeholder'),
          ariaLabel: el.getAttribute('aria-label'),
          testId: el.getAttribute('data-testid') || el.getAttribute('data-cy') || null,
          clase: clean(String(el.className || '')),
          label: etiqueta(el),
          requerido: !!el.required,
          deshabilitado: !!el.disabled,
          caja: caja(el),
        });
      });
      const botones = [];
      document.querySelectorAll('button, [role="button"], a[role="button"], input[type="submit"]').forEach((el) => {
        botones.push({
          texto: clean(el.innerText || el.value || ''),
          ariaLabel: el.getAttribute('aria-label'),
          title: el.getAttribute('title'),
          id: el.id || null,
          testId: el.getAttribute('data-testid') || null,
          clase: clean(String(el.className || '')),
          caja: caja(el),
        });
      });
      const SEL_LAPIZ =
        'button[aria-label*="Editar" i], button[title*="Editar" i], button[class*="lapiz" i], [data-testid*="edit" i]';
      const bloques = [];
      document.querySelectorAll('[data-component], [data-type], section, article, li, div').forEach((el) => {
        const dataName = clean(el.getAttribute('data-component') || el.getAttribute('data-type') || '');
        const lapiz = el.querySelector(SEL_LAPIZ);
        if (!dataName) {
          // Sin data-*, quedarse con el bloque más pequeño que contiene el lápiz.
          if (!lapiz) return;
          const anidado = Array.from(el.children).some((h) => h.querySelector(SEL_LAPIZ) || h.matches(SEL_LAPIZ));
          if (anidado) return;
        }
        const tituloEl = el.querySelector(
          '[class*="title"], [class*="name"], [class*="nombre"], h1, h2, h3, h4, strong'
        );
        let titulo = clean(tituloEl ? tituloEl.innerText : '');
        if (!titulo) {
          titulo = clean((el.innerText || '').split('\\n').find((l) => l.trim()) || '');
        }
        if (!dataName && !titulo) return;
        bloques.push({
          dataName: dataName || null,
          titulo: titulo || null,
          lapizAriaLabel: lapiz ? lapiz.getAttribute('aria-label') : null,
          lapizClase: lapiz ? clean(String(lapiz.className || '')) : null,
          caja: caja(el),
        });
      });
      return {
        titulo: document.title,
        campos: campos.slice(0, 150),
        botones: botones.slice(0, 150),
        bloques: bloques.slice(0, 80),
        totales: { campos: campos.length, botones: botones.length, bloques: bloques.length },
      };
    }"""


def dump_diagnostico_frames(page) -> dict:
    """Radiografía de cada frame: permite escribir selectores sin adivinar el DOM."""
    frames = []
    for fr in frames_unicos(page):
        info = {
            "url": getattr(fr, "url", None),
            "nombre": getattr(fr, "name", None),
            "principal": es_frame_principal(page, fr),
        }
        try:
            info.update(fr.evaluate(JS_DIAGNOSTICO_FRAME) or {})
        except Exception as e:
            info["error"] = str(e)
        frames.append(info)
    return {
        "capturadoEn": datetime.now(timezone.utc).isoformat(),
        "urlPagina": url_actual(page),
        "frames": frames,
    }


def listar_componentes_cms(page) -> list[dict]:
    """Detecta los bloques del Gestor de contenido (Cabecera, tags, listas, SEO…).

    Recorre todos los frames porque el lienzo del BM es un iframe.
    """
    aliases_flat = []
    for comp in COMPONENTES_CMS:
        for alias in comp["aliases"]:
            aliases_flat.append({"clave": comp["clave"], "alias": alias})

    encontrados: list[dict] = []
    vistos: set[str] = set()
    for frame in frames_unicos(page):
        principal = es_frame_principal(page, frame)
        payload = {"aliasesFlat": aliases_flat, "filtrarPaleta": principal}
        try:
            parciales = frame.evaluate(JS_LISTAR_COMPONENTES, payload)
        except Exception:
            continue
        for comp in parciales or []:
            clave = comp.get("clave")
            if not clave or clave in vistos:
                continue
            vistos.add(clave)
            comp = dict(comp)
            comp["frameUrl"] = None if principal else getattr(frame, "url", None)
            encontrados.append(comp)
    return encontrados


def resultado_clic_lapiz_ok(result) -> bool:
    if result is True:
        return True
    return isinstance(result, dict) and bool(result.get("ok"))


def _y_bajo_barra_vistas(page) -> float:
    """Debajo de default / Resolución. Un clic más arriba saca la vista."""
    y_min = 88.0
    get_by_text = getattr(page, "get_by_text", None)
    if not get_by_text:
        return y_min
    for texto, exacto in (
        ("default", True),
        ("Resolución", True),
        ("Zona de trabajo", True),
        ("Versión publicada", False),
    ):
        try:
            try:
                loc = get_by_text(texto, exact=exacto)
            except TypeError:
                loc = get_by_text(texto)
            n = loc.count() if hasattr(loc, "count") else 0
        except Exception:
            continue
        for i in range(min(n, 4)):
            box = _bounding_box(loc.nth(i))
            if not box:
                continue
            top = float(box.get("y") or 0)
            alto = float(box.get("height") or 0)
            if top > 150 or alto > 48:
                continue
            y_min = max(y_min, top + alto + 8)
    return y_min


def desplegable_vista_default(page) -> bool | None:
    """True si estamos en default. «Versión publicada» es solo la etiqueta del combo."""
    if _contar_placeholder_vacio(page) >= 3:
        return True
    if recoger_ids_componentes(page):
        return True
    get_by_text = getattr(page, "get_by_text", None)
    if not get_by_text:
        return None
    try:
        loc = get_by_text("default", exact=True)
        n = loc.count() if hasattr(loc, "count") else 0
    except Exception:
        n = 0
    for i in range(min(n, 6)):
        box = _bounding_box(loc.nth(i))
        if not box:
            continue
        if float(box.get("height") or 0) <= 48:
            return True
    return None


def avisar_si_salio_de_default(page) -> bool:
    """True = no hay lienzo default ni editor; no seguir."""
    if _contar_placeholder_vacio(page) >= 3 or recoger_ids_componentes(page):
        return False
    if editor_actual(page) is not None:
        return False
    if desplegable_vista_default(page) is not False:
        return False
    print(
        "\n  · El desplegable de vistas NO está en «default».\n"
        "    La cabecera (título y foto) vive en default: si lo sacás,\n"
        "    BM muestra otra vista vacía. No se borra; no se ve.\n"
        "    Poné el desplegable otra vez en default y reintentá.\n",
        file=sys.stderr,
    )
    return True


def _clic_editar_indice(page, index: int) -> bool:
    """Clic en el «Editar» del N-ésimo bloque, debajo de la barra default."""
    get_by_text = getattr(page, "get_by_text", None)
    if not get_by_text:
        return False
    y_min = _y_bajo_barra_vistas(page)
    try:
        loc = get_by_text("Editar", exact=True)
        n = loc.count() if hasattr(loc, "count") else 0
    except Exception:
        return False
    filas: list[tuple[float, object]] = []
    for i in range(n):
        item = loc.nth(i)
        box = _bounding_box(item)
        if box is None:
            continue
        if float(box.get("x") or 0) < 200:
            continue
        if float(box.get("y") or 0) < y_min:
            continue
        if float(box.get("height") or 0) > 40:
            continue
        filas.append((float(box["y"]), item))
    filas.sort(key=lambda p: p[0])
    uniq: list[tuple[float, object]] = []
    for y, item in filas:
        if any(abs(y - uy) < 14 for uy, _ in uniq):
            continue
        uniq.append((y, item))
    if index < 0 or index >= len(uniq):
        return False
    try:
        uniq[index][1].click(timeout=3_000)
        return True
    except Exception:
        return False


def _clic_svg_bloque_vacio(page, index: int) -> bool:
    """Lápiz SVG del N-ésimo «Edita este componente vacío», no el texto del centro."""
    get_by_text = getattr(page, "get_by_text", None)
    if not get_by_text:
        return False
    y_min = _y_bajo_barra_vistas(page)
    try:
        try:
            hints = get_by_text("Edita este componente vacío desde el lápiz", exact=False)
        except TypeError:
            hints = get_by_text("Edita este componente vacío desde el lápiz")
        n = hints.count() if hasattr(hints, "count") else 0
    except Exception:
        n = 0
    if n == 0:
        return False
    cards: list[tuple[float, object, dict]] = []
    for i in range(n):
        item = hints.nth(i)
        box = _bounding_box(item)
        if box is None or float(box.get("x") or 0) < 80:
            continue
        cards.append((float(box["y"]), item, box))
    cards.sort(key=lambda p: p[0])
    uniq: list[tuple[float, object, dict]] = []
    for y, item, box in cards:
        if any(abs(y - uy) < 16 for uy, _, _ in uniq):
            continue
        uniq.append((y, item, box))
    if index < 0 or index >= len(uniq):
        return False
    item, box = uniq[index][1], uniq[index][2]
    try:
        if hasattr(item, "hover"):
            item.hover(timeout=2_000)
            page.wait_for_timeout(250)
    except Exception:
        pass
    try:
        fila = item.locator("xpath=ancestor::*[count(.//svg)>=1][1]")
        svgs = fila.locator("svg")
        ns = svgs.count() if hasattr(svgs, "count") else 0
        derechos: list[tuple[float, object]] = []
        cx = float(box["x"]) + float(box.get("width") or 0) * 0.4
        for j in range(min(ns, 16)):
            nodo = svgs.nth(j)
            sbox = _bounding_box(nodo)
            if not sbox:
                continue
            if float(sbox.get("y") or 0) < y_min:
                continue
            if not (8 <= float(sbox.get("width") or 0) <= 40):
                continue
            if not (8 <= float(sbox.get("height") or 0) <= 40):
                continue
            if float(sbox["x"]) < cx:
                continue
            derechos.append((float(sbox["x"]), nodo))
        derechos.sort(key=lambda p: p[0])
        if derechos:
            derechos[0][1].click(timeout=3_000)
            return True
    except Exception:
        pass
    mouse = getattr(page, "mouse", None)
    if not mouse:
        return False
    try:
        fila = item.locator("xpath=ancestor::*[contains(., 'Id:')][1]")
        fbox = _bounding_box(fila) or box
        x = float(fbox["x"]) + float(fbox["width"]) - 40
        y = max(y_min, float(fbox["y"]) + 16)
        mouse.click(x, y)
        return True
    except Exception:
        return False


def _clic_titulo_bloque(page, aliases: list[str]) -> bool:
    """Clic en el título del bloque en el lienzo (Cabecera, tags…), no en la paleta."""
    get_by_text = getattr(page, "get_by_text", None)
    if not get_by_text:
        return False
    y_min = _y_bajo_barra_vistas(page)
    for alias in aliases:
        try:
            loc = get_by_text(alias, exact=True)
            n = loc.count() if hasattr(loc, "count") else 0
        except Exception:
            continue
        for i in range(n):
            item = loc.nth(i)
            box = _bounding_box(item)
            if box is None or float(box.get("x") or 0) < 220:
                continue
            if float(box.get("y") or 0) < y_min:
                continue
            try:
                item.click(timeout=3_000)
                return True
            except Exception:
                continue
    return False


def _clic_placeholder_texto(page, index: int) -> bool:
    """Clic en el texto vacío del N-ésimo bloque para abrir el editor."""
    get_by_text = getattr(page, "get_by_text", None)
    if not get_by_text:
        return False
    try:
        try:
            hints = get_by_text("Edita este componente vacío desde el lápiz", exact=False)
        except TypeError:
            hints = get_by_text("Edita este componente vacío desde el lápiz")
        n = hints.count() if hasattr(hints, "count") else 0
    except Exception:
        return False
    cards: list[tuple[float, object]] = []
    for i in range(n):
        item = hints.nth(i)
        box = _bounding_box(item)
        if box is None or float(box.get("x") or 0) < 80:
            continue
        cards.append((float(box["y"]), item))
    cards.sort(key=lambda p: p[0])
    uniq: list[object] = []
    ys: list[float] = []
    for y, item in cards:
        if any(abs(y - uy) < 16 for uy in ys):
            continue
        ys.append(y)
        uniq.append(item)
    if index < 0 or index >= len(uniq):
        return False
    try:
        uniq[index].click(timeout=3_000)
        return True
    except Exception:
        return False


def _contar_placeholder_vacio(page) -> int:
    get_by_text = getattr(page, "get_by_text", None)
    if not get_by_text:
        return -1
    try:
        try:
            return int(get_by_text("Edita este componente", exact=False).count())
        except TypeError:
            return int(get_by_text("Edita este componente").count())
    except Exception:
        return -1


def _frames_pagina(page) -> list:
    frames = [page]
    try:
        extra = list(getattr(page, "frames", None) or [])
    except Exception:
        extra = []
    for fr in extra:
        if fr is not None and fr not in frames:
            frames.append(fr)
    return frames


def _eval_en_frames(page, script, arg=None):
    ultimo = None
    for fr in _frames_pagina(page):
        try:
            ultimo = fr.evaluate(script, arg) if arg is not None else fr.evaluate(script)
        except Exception as e:
            ultimo = {"ok": False, "error": str(e)}
            continue
        if resultado_clic_lapiz_ok(ultimo):
            return ultimo
    return ultimo


def _editor_confirmado(page, clave: str) -> bool:
    _esperar_editor(page)
    if editor_actual(page) == clave:
        print(f"  · Editor «{clave}» abierto")
        return True
    try:
        page.wait_for_timeout(900)
    except Exception:
        pass
    if editor_actual(page) == clave:
        print(f"  · Editor «{clave}» abierto")
        return True
    return False


def _restaurar_si_lienzo_perdido(page, url_antes: str | None) -> None:
    """No recarga: un goto saca la vista default."""
    if en_vista_default_cms(page) or not url_antes:
        return
    if es_lista_proyectos_cms(url_actual(page)):
        print("  · Caí en Proyectos. No recargo; volvé a la receta (default) a mano.")


def abrir_lapiz_componente(page, clave: str, selector_guardado: str | None = None) -> bool:
    """Clic en el lápiz. Solo True si aparece «Edición de …» de ese bloque."""
    limpiar_busca_paleta(page)
    resolver_modal_cambios(page)
    url_antes = url_actual(page)

    def intentar(ok_clic: bool) -> bool:
        if not ok_clic:
            return False
        if _editor_confirmado(page, clave):
            return True
        _restaurar_si_lienzo_perdido(page, url_antes)
        return False

    if selector_guardado and not selector_es_generico(selector_guardado):
        try:
            if intentar(clic_locator_en_lienzo(page, selector_guardado)):
                return True
        except Exception:
            pass

    comp = next((c for c in COMPONENTES_CMS if c["clave"] == clave), None)
    if not comp:
        return False
    aliases = list(comp["aliases"])
    idx = next(i for i, c in enumerate(COMPONENTES_CMS) if c["clave"] == clave)
    payload = {"aliases": aliases, "index": idx}
    ids = recoger_ids_componentes(page)
    if ids:
        print("  · IDs lienzo: " + " ".join(f"{k}={v}" for k, v in ids.items()))
    print(f"  · Completando «{clave}»: abro el lápiz y escribo los campos…")
    if avisar_si_salio_de_default(page):
        return False
    if intentar(_clic_editar_indice(page, idx)):
        return True
    if intentar(_clic_svg_bloque_vacio(page, idx)):
        return True
    if intentar(_clic_titulo_bloque(page, aliases)):
        return True
    if intentar(_clic_placeholder_texto(page, idx)):
        return True
    comp_id = ids.get(clave)
    if comp_id and _abrir_por_id_visible(page, clave, comp_id):
        return True

    if intentar(_clic_lapiz_por_fila(page, aliases)):
        return True
    if intentar(_clic_lapiz_placeholder(page, idx)):
        return True

    clicked = _eval_en_frames(page, JS_CLIC_LAPIZ, payload)
    if intentar(resultado_clic_lapiz_ok(clicked)):
        return True
    try:
        page.wait_for_timeout(700)
    except Exception:
        pass
    if intentar(_clic_lapiz_por_fila(page, aliases)):
        return True
    if intentar(_clic_lapiz_placeholder(page, idx)):
        return True
    clicked = _eval_en_frames(page, JS_CLIC_LAPIZ, payload)
    if intentar(resultado_clic_lapiz_ok(clicked)):
        return True
    if isinstance(clicked, dict):
        titulos = clicked.get("titulos") or []
        n_ph = _contar_placeholder_vacio(page)
        print(
            f"  · Bloques vistos: {clicked.get('n', 0)} {titulos}"
            f" | textos vacíos: {n_ph}"
            + (f" ({clicked.get('error')})" if clicked.get("error") else "")
        )
        if intentar(_clic_lapiz_por_punto(page, clicked)):
            return True
    return pedir_lapiz_a_mano(page, clave)


def aliases_componente(clave: str) -> list[str]:
    meta = next((c for c in COMPONENTES_CMS if c["clave"] == clave), None)
    return list(meta["aliases"]) if meta else [clave]


def bloque_ya_cargado(page, clave: str) -> bool:
    """True si el bloque del lienzo ya muestra contenido (no «Edita este componente vacío»)."""
    return bloque_componente_vacio(page, aliases_componente(clave)) is False


def pedir_lapiz_a_mano(page, clave: str, *, headed: bool = True) -> bool:
    """Si el clic no abre el editor, la usuaria pulsa el lápiz y seguimos rellenando."""
    if editor_actual(page) == clave:
        print(f"  · Editor «{clave}» abierto")
        return True
    nombre = next(
        (c["aliases"][0] for c in COMPONENTES_CMS if c["clave"] == clave),
        clave,
    )
    if editor_actual(page) is None and bloque_ya_cargado(page, clave):
        print(f"  · «{nombre}» ya está cargada. No pido el lápiz.")
        return False
    if not headed or not sys.stdin.isatty():
        return False
    print(
        f"\n>>> Para COMPLETAR «{nombre}»: en el Chromium de Python\n"
        f"    un clic en el LÁPIZ a la derecha de ese bloque (centro, no la paleta).\n"
        f"    ENTER aquí cuando veas el formulario de {nombre}.\n"
    )
    try:
        input()
    except EOFError:
        return editor_actual(page) == clave
    return _editor_confirmado(page, clave)


def _esperar_editor(page) -> None:
    try:
        page.wait_for_timeout(800)
        page.wait_for_selector("input:visible, textarea:visible, select:visible", timeout=4_000)
    except Exception:
        try:
            page.wait_for_timeout(700)
        except Exception:
            pass


def _clic_lapiz_por_fila(page, aliases: list[str]) -> bool:
    get_by_text = getattr(page, "get_by_text", None)
    if not get_by_text:
        return False
    for alias in aliases:
        try:
            titulo = get_by_text(alias, exact=True)
            n_tit = titulo.count() if hasattr(titulo, "count") else 1
            if n_tit == 0:
                continue
            for i in range(n_tit):
                item = titulo.nth(i) if hasattr(titulo, "nth") else titulo
                box = _bounding_box(item)
                if box is None:
                    continue
                if not caja_en_lienzo(box):
                    continue
                fila = item.locator(
                    "xpath=ancestor::*["
                    "count(.//button)>=1 and count(.//button)<=8"
                    " or count(.//svg)>=1"
                    "][1]"
                )
                if hasattr(fila, "count") and fila.count() == 0:
                    continue
                if _bounding_box(fila) is not None and not caja_en_lienzo(_bounding_box(fila)):
                    continue
                get_edit = getattr(fila, "get_by_text", None)
                if get_edit:
                    try:
                        txt = get_edit("Editar", exact=True)
                        if txt.count() and clic_locator_en_lienzo_desde(txt):
                            return True
                    except Exception:
                        pass
                edit = fila.locator(
                    "button[aria-label*='Editar' i], button[title*='Editar' i], "
                    "button[aria-label*='edit' i], button[title*='edit' i], "
                    "button[aria-label*='lápiz' i], button[aria-label*='lapiz' i]"
                )
                if edit.count():
                    if clic_locator_en_lienzo_desde(edit):
                        return True
                    continue
                botones = fila.locator("button")
                n = botones.count()
                if n >= 1:
                    btn = botones.nth(0)
                    if not caja_en_lienzo(_bounding_box(btn)):
                        continue
                    btn.click(timeout=3_000)
                    return True
        except Exception:
            continue
    return False


def _clic_lapiz_placeholder(page, index: int) -> bool:
    """Lápiz del N-ésimo bloque vacío («Edita este componente vacío»), de arriba a abajo."""
    get_by_text = getattr(page, "get_by_text", None)
    mouse = getattr(page, "mouse", None)
    if not get_by_text or not mouse:
        return False
    cards: list[tuple[float, dict]] = []
    for texto in (
        "Edita este componente vacío desde el lápiz",
        "Edita este componente vacío",
    ):
        try:
            try:
                hints = get_by_text(texto, exact=False)
            except TypeError:
                hints = get_by_text(texto)
            n = hints.count() if hasattr(hints, "count") else 0
        except Exception:
            continue
        for i in range(n):
            item = hints.nth(i)
            box = _bounding_box(item)
            if box is None:
                continue
            try:
                if float(box.get("x") or 0) < 80:
                    continue
            except (TypeError, ValueError):
                continue
            cards.append((float(box["y"]), box))
        if cards:
            break
    if not cards:
        return False
    cards.sort(key=lambda p: p[0])
    uniq: list[dict] = []
    for _y, box in cards:
        if any(abs(box["y"] - u["y"]) < 16 for u in uniq):
            continue
        uniq.append(box)
    if index < 0 or index >= len(uniq):
        return False
    box = uniq[index]
    y_min = _y_bajo_barra_vistas(page)
    x = float(box["x"]) + float(box["width"]) - 34
    y = max(y_min, float(box["y"]) + min(20.0, float(box["height"]) / 3))
    if y < y_min:
        return False
    try:
        mouse.click(x, y)
        return True
    except Exception:
        return False


def _clic_lapiz_por_punto(page, info: dict) -> bool:
    mouse = getattr(page, "mouse", None)
    if not mouse:
        return False
    try:
        x = float(info.get("x") or 0)
        y = float(info.get("y") or 0)
    except (TypeError, ValueError):
        return False
    if x < 80 or y < 40:
        return False
    try:
        mouse.click(x, y)
        return True
    except Exception:
        return False


def clic_locator_en_lienzo_desde(loc) -> bool:
    try:
        n = loc.count()
    except Exception:
        return False
    for i in range(min(n, 8)):
        item = loc.nth(i)
        box = _bounding_box(item)
        if box is None:
            continue
        if caja_en_lienzo(box):
            item.click(timeout=3_000)
            return True
    return False


JS_CLIC_LAPIZ = """(payload) => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const norm = (s) => clean(s).toLowerCase();
  const textoDe = (el) => clean(el.innerText || el.textContent || '');
  const aliases = Array.isArray(payload) ? payload : ((payload && payload.aliases) || []);
  const index = Array.isArray(payload) ? -1 : Number(payload && payload.index);
  const wanted = aliases.map(norm);
  const hayPaleta = /paleta de componentes/i.test(textoDe(document.body));
  const minLeft = hayPaleta ? 200 : 0;
  let yBarra = 88;
  for (const el of document.querySelectorAll('*')) {
    const t = textoDe(el);
    if (!/^(default|resoluci[oó]n|zona de trabajo)$/i.test(t)) continue;
    const rb = el.getBoundingClientRect();
    if (rb.top > 150 || rb.height > 48 || rb.height < 8) continue;
    yBarra = Math.max(yBarra, rb.bottom + 8);
  }
  const enPaleta = (el) => {
    const r0 = el.getBoundingClientRect();
    if (hayPaleta && r0.left < minLeft) return true;
    let n = el;
    while (n && n !== document.body) {
      const lab = (n.getAttribute && (n.getAttribute('aria-label') || '')) || '';
      const t = textoDe(n).slice(0, 80);
      if (/paleta de componentes/i.test(lab) || /^paleta de componentes/i.test(t)) {
        const r = n.getBoundingClientRect();
        if (r.left < 280 && r.width < 480) return true;
      }
      n = n.parentElement;
    }
    return false;
  };
  const blobBtn = (b) => [
    b.getAttribute('aria-label') || '',
    b.getAttribute('title') || '',
    b.getAttribute('data-testid') || '',
    String(b.className || ''),
    b.innerHTML || '',
  ].join(' ');
  const esBasura = (b) => /trash|delete|eliminar|borrar|remove/i.test(blobBtn(b));
  const esHistorial = (b) => /clock|history|historial|time|version/i.test(blobBtn(b));
  const esLapiz = (b) => /edit|editar|pencil|lápiz|lapiz/i.test(blobBtn(b)) && !/create/i.test(blobBtn(b));
  const tituloDe = (crudo) => norm((crudo || '').split('\\n')[0]);
  const coincide = (linea) => wanted.some((w) => linea === w || linea.startsWith(w + ' '));
  const disparar = (el) => {
    try {
      el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, view: window }));
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
      el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      if (typeof el.click === 'function') el.click();
      return true;
    } catch (e) {
      return false;
    }
  };

  const hints = [];
  for (const el of Array.from(document.querySelectorAll('div, section, article, span, p, li'))) {
    const own = textoDe(el);
    if (!/Edita este componente vac/i.test(own)) continue;
    if (own.length > 420) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 30 || r.height < 12) continue;
    if (enPaleta(el)) continue;
    hints.push({ el, r, own });
  }
  const innermost = hints.filter((h) => !hints.some((o) => o.el !== h.el && h.el.contains(o.el)));
  const brutos = innermost.map((h) => {
    let card = h.el;
    for (let i = 0; i < 8 && card.parentElement; i++) {
      const p = card.parentElement;
      const pr = p.getBoundingClientRect();
      const pt = textoDe(p);
      if (enPaleta(p)) break;
      if (/\\bcabecera\\b/i.test(pt) && /\\btags\\b/i.test(pt)) break;
      if (/\\bdefault\\b/i.test(pt) && /resoluci[oó]n|zona de trabajo/i.test(pt)) break;
      if (pr.width > 160 && pr.width < 2400 && pt.length < 900) {
        card = p;
        if (pr.width >= 260) break;
      } else {
        break;
      }
    }
    const crudo = textoDe(card);
    const r = card.getBoundingClientRect();
    return { el: card, r, linea: tituloDe(crudo), vacio: true, h: r.height, w: r.width };
  });
  for (const el of Array.from(document.querySelectorAll('div, section, article, li'))) {
    const r = el.getBoundingClientRect();
    if (r.left < minLeft || r.top < 20) continue;
    if (r.width < 80 || r.width > 2400) continue;
    if (r.height < 24 || r.height > 800) continue;
    if (enPaleta(el)) continue;
    const crudo = textoDe(el);
    if (crudo.length > 2000) continue;
    const vacio = /Edita este componente vac/i.test(crudo);
    const linea = tituloDe(crudo);
    if (!vacio && !coincide(linea)) continue;
    brutos.push({ el, r, linea, vacio, h: r.height, w: r.width });
  }
  brutos.sort((a, b) => a.r.top - b.r.top || a.h - b.h || a.w - b.w);
  const idDe = (el) => {
    const m = textoDe(el).match(/\\b([a-f0-9]{6})\\b/i);
    return m ? m[1].toLowerCase() : '';
  };
  const uniq = [];
  for (const t of brutos) {
    const id = idDe(t.el);
    if (id && uniq.some((u) => idDe(u.el) === id)) continue;
    if (!id && uniq.some((u) => Math.abs(u.r.top - t.r.top) < 18)) continue;
    uniq.push(t);
  }
  const titulos = uniq.map((t) => t.linea);
  let chosen = uniq.find((t) => coincide(t.linea));
  if (!chosen && index >= 0 && uniq[index]) chosen = uniq[index];
  if (!chosen) return { ok: false, n: uniq.length, titulos };

  try { chosen.el.scrollIntoView({ block: 'center', inline: 'nearest' }); } catch (e) {}
  const r2 = chosen.el.getBoundingClientRect();
  for (const el of chosen.el.querySelectorAll('*')) {
    const t = textoDe(el);
    if (!/^editar$/i.test(t)) continue;
    const b = el.getBoundingClientRect();
    if (b.top < yBarra || b.left < 200 || enPaleta(el)) continue;
    if (disparar(el)) return { ok: true, via: 'editar', n: uniq.length, titulos };
  }
  const hits = [];
  for (const el of chosen.el.querySelectorAll('button, [role="button"], a, svg, i, span, div, img')) {
    const b = el.getBoundingClientRect();
    if (b.width < 8 || b.height < 8 || b.width > 72 || b.height > 72) continue;
    if (b.left < r2.right - 110) continue;
    if (b.top < Math.max(yBarra, r2.top - 10) || b.bottom > r2.bottom + 10) continue;
    if (esBasura(el) || esHistorial(el)) continue;
    hits.push({
      el,
      x: b.left,
      y: b.top,
      area: b.width * b.height,
      lapiz: esLapiz(el) ? 0 : 1,
    });
  }
  hits.sort((a, b) => a.lapiz - b.lapiz || a.x - b.x || a.area - b.area);
  if (hits[0] && disparar(hits[0].el)) {
    return { ok: true, via: 'icono', n: uniq.length, titulos };
  }
  const x = r2.right - 34;
  const y = Math.max(yBarra + 4, r2.top + Math.min(22, Math.max(12, r2.height / 3)));
  const hit = document.elementFromPoint(x, y);
  if (hit && !enPaleta(hit)) {
    const alvo = hit.closest('button, [role="button"], a, svg, [class*="icon"]') || hit;
    if (!esBasura(alvo) && disparar(alvo)) {
      return { ok: true, via: 'punto', n: uniq.length, titulos, x, y };
    }
  }
  return { ok: false, n: uniq.length, titulos, x, y };
}"""


JS_CLICK_GUARDAR = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const visibles = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 8 && r.height > 8;
  };
  const nodos = [...document.querySelectorAll('button, [role="button"], a')].filter(visibles);
  const btn = nodos.find((el) => {
    const t = clean(
      (el.innerText || '') + ' ' + (el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || '')
    );
    if (/publicar|acepto/i.test(t)) return false;
    return /^(guardar|save|aplicar)$/i.test(t) || /^guardar\\b/i.test(t);
  });
  if (btn) { btn.click(); return 'guardar'; }
  return false;
}"""


def _clic_guardar_editor(page) -> bool:
    for fr in _frames_pagina(page):
        try:
            if fr.evaluate(JS_CLICK_GUARDAR) == "guardar":
                print("  · Clic en Guardar")
                page.wait_for_timeout(700)
                return True
        except Exception:
            continue
    for fr in _frames_pagina(page):
        locator = getattr(fr, "locator", None)
        if not locator:
            continue
        for sel in (
            "button:has-text('Guardar')",
            "[role='button']:has-text('Guardar')",
            "button[type='submit']",
            "button:has-text('Aplicar')",
            "button:has-text('Listo')",
            "button:has-text('Done')",
        ):
            try:
                loc = locator(sel)
                n = loc.count()
                for i in range(n):
                    btn = loc.nth(i)
                    visible = True
                    try:
                        visible = btn.is_visible()
                    except Exception:
                        visible = True
                    if not visible:
                        continue
                    txt = ""
                    try:
                        txt = (btn.inner_text() or "").lower()
                    except Exception:
                        txt = ""
                    if "publicar" in txt or "acepto" in txt:
                        continue
                    btn.click(timeout=2_500)
                    print("  · Clic en Guardar")
                    page.wait_for_timeout(700)
                    return True
            except Exception:
                continue
    return False


def cerrar_editor_componente(page) -> None:
    """Guarda el editor del lápiz. Si aparece el modal, Cancelar (aún no es hora de salir)."""
    resolver_modal_cambios(page)
    _clic_guardar_editor(page)
    resolver_modal_cambios(page)
    _clic_guardar_editor(page)


JS_VOLVER_AL_LIENZO = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const visibles = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 6 && r.height > 6;
  };
  const esProyectos = (el) => {
    const t = clean(el.innerText || el.getAttribute('aria-label') || '');
    const href = el.getAttribute('href') || '';
    if (/view-manager/i.test(href)) return false;
    return /proyectos/i.test(t) || /\\/cms\\/projects\\/?$/i.test(href);
  };
  const nodos = [...document.querySelectorAll('button, [role="button"], a')].filter(visibles);
  const back = nodos.find((el) => {
    if (esProyectos(el)) return false;
    const lab = clean(
      el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || ''
    );
    if (/publicar/i.test(lab)) return false;
    return /^(volver|atrás|atras|back|cerrar|close)$/i.test(lab)
      || /volver|atrás|atras|arrow.?back|chevron.?left/i.test(
        el.getAttribute('aria-label') || el.getAttribute('title') || ''
      );
  });
  if (back) { back.click(); return 'back'; }
  const titulos = [...document.querySelectorAll('h1,h2,h3,h4,p,div,span')].filter((el) => {
    const linea = clean(el.innerText || '').split('\\n')[0];
    return /^Edici[oó]n de /i.test(linea) && linea.length < 80 && visibles(el);
  });
  titulos.sort((a, b) => a.getBoundingClientRect().height - b.getBoundingClientRect().height);
  const h = titulos[0];
  if (h) {
    const hR = h.getBoundingClientRect();
    const cands = [...document.querySelectorAll('button, [role="button"], a, svg')].filter((el) => {
      if (!visibles(el)) return false;
      const wrap = (el.closest && el.closest('a, button, [role="button"]')) || el;
      if (esProyectos(wrap) || esProyectos(el)) return false;
      const r = el.getBoundingClientRect();
      const mid = (r.top + r.bottom) / 2;
      const midH = (hR.top + hR.bottom) / 2;
      return r.right <= hR.left + 14 && r.left >= 4 && Math.abs(mid - midH) < 40;
    });
    cands.sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right);
    if (cands[0]) {
      const clickable = (cands[0].closest && cands[0].closest('button, [role="button"], a')) || cands[0];
      clickable.click();
      return 'flecha';
    }
  }
  const crumbs = [...document.querySelectorAll('nav a, [class*="breadcrumb"] a, [class*="Breadcrumb"] a')].filter(visibles);
  const gestor = crumbs.find((el) => {
    if (esProyectos(el)) return false;
    const t = clean(el.innerText || '');
    const href = el.getAttribute('href') || '';
    return /gestor|view-manager|contenido/i.test(t + ' ' + href);
  });
  if (gestor) { gestor.click(); return 'gestor'; }
  return false;
}"""

JS_SIGUE_REQUERIDO_VISIBLE = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const vh = window.innerHeight || 800;
  for (const el of document.querySelectorAll('p, span, div, label, small, li')) {
    const linea = clean(el.innerText || '').split('\\n')[0];
    if (!/^El dato es requerido$/i.test(linea) || linea.length > 40) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    if (r.bottom < 0 || r.top > vh) continue;
    try {
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') continue;
    } catch (e) {}
    return true;
  }
  return false;
}"""


def parece_guardado_ok(page) -> bool:
    return bool(re.search(r"guardado satisfactoriamente", texto_cuerpo(page), re.I))


def sigue_dato_requerido(page) -> bool:
    """True solo si el error «El dato es requerido» está visible en pantalla."""
    for fr in _frames_pagina(page):
        try:
            if fr.evaluate(JS_SIGUE_REQUERIDO_VISIBLE):
                return True
        except Exception:
            continue
    return False


JS_IDS_BLOQUES = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const hayPaleta = /paleta de componentes/i.test(document.body.innerText || '');
  const pares = [
    ['cabecera', /\\bcabecera\\b/i],
    ['tags', /\\btags?\\b/i],
    ['ingredientes', /ingredientes/i],
    ['instrucciones', /instrucciones/i],
    ['seo', /seo\\s*html|\\bseo\\b/i],
  ];
  const seen = new Map();
  for (const el of document.querySelectorAll('*')) {
    const t = clean(el.innerText || '');
    if (t.length < 4 || t.length > 220) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 16 || r.height < 8) continue;
    if (hayPaleta && r.left < 200) continue;
    const m = t.match(/\\b([a-f0-9]{6})\\b/i);
    if (!m) continue;
    const id = m[1].toLowerCase();
    for (const [clave, pat] of pares) {
      if (!pat.test(t)) continue;
      const prev = seen.get(clave);
      if (!prev || r.top < prev.y) seen.set(clave, { clave, id, y: r.top });
      break;
    }
  }
  return [...seen.values()].map(({ clave, id }) => ({ clave, id }));
}"""


def recoger_ids_componentes(page) -> dict[str, str]:
    ids: dict[str, str] = {}
    for fr in _frames_pagina(page):
        try:
            filas = fr.evaluate(JS_IDS_BLOQUES)
        except Exception:
            continue
        if not isinstance(filas, list):
            continue
        for fila in filas:
            if not isinstance(fila, dict):
                continue
            clave = str(fila.get("clave") or "")
            cid = str(fila.get("id") or "").lower()
            if clave and re.fullmatch(r"[a-f0-9]{6}", cid):
                ids.setdefault(clave, cid)
    return ids


def url_con_componente(url: str | None, comp_id: str) -> str | None:
    if not url or not comp_id:
        return None
    base = url.split("#")[0].split("?")[0].rstrip("/")
    if "view-manager" not in base:
        return None
    return f"{base}?component={comp_id}"


JS_CLIC_BLOQUE_ID = """(compId) => {
  const id = String(compId || '').toLowerCase();
  if (!id) return { ok: false };
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const hayPaleta = /paleta de componentes/i.test(document.body.innerText || '');
  let yBarra = 88;
  for (const el of document.querySelectorAll('*')) {
    const t = clean(el.innerText || '');
    if (!/^(default|resoluci[oó]n|zona de trabajo)$/i.test(t)) continue;
    const rb = el.getBoundingClientRect();
    if (rb.top > 150 || rb.height > 48 || rb.height < 8) continue;
    yBarra = Math.max(yBarra, rb.bottom + 8);
  }
  const blobBtn = (b) => [
    b.getAttribute('aria-label') || '',
    b.getAttribute('title') || '',
    b.getAttribute('data-testid') || '',
    String(b.className || ''),
    b.innerHTML || '',
  ].join(' ');
  const esBasura = (b) => /trash|delete|eliminar|borrar|remove/i.test(blobBtn(b));
  const esHistorial = (b) => /clock|history|historial|time|version/i.test(blobBtn(b));
  const esLapiz = (b) => /edit|editar|pencil|lápiz|lapiz/i.test(blobBtn(b)) && !/create/i.test(blobBtn(b));
  const disparar = (el) => {
    try {
      el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, view: window }));
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
      el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      if (typeof el.click === 'function') el.click();
      return true;
    } catch (e) {
      return false;
    }
  };
  let nodo = null;
  for (const el of document.querySelectorAll('*')) {
    const t = clean(el.innerText || '');
    if (t.toLowerCase() !== id) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    if (hayPaleta && r.left < 200) continue;
    nodo = el;
    break;
  }
  if (!nodo) return { ok: false, motivo: 'sin-id' };
  let card = nodo;
  for (let i = 0; i < 10 && card.parentElement; i++) {
    const p = card.parentElement;
    const pr = p.getBoundingClientRect();
    const pt = clean(p.innerText || '');
    if (hayPaleta && pr.left < 200) break;
    if (/\\bcabecera\\b/i.test(pt) && /\\btags\\b/i.test(pt)) break;
    if (/\\bdefault\\b/i.test(pt) && /resoluci[oó]n|zona de trabajo/i.test(pt)) break;
    if (/gestor de contenido/i.test(pt) && pr.height > 220) break;
    if (pr.width > 180 && pr.width < 2400 && pr.height > 36 && pr.height < 500 && pt.length < 900) {
      card = p;
      if (pr.width >= 260) break;
    } else {
      break;
    }
  }
  try { card.scrollIntoView({ block: 'center', inline: 'nearest' }); } catch (e) {}
  const r2 = card.getBoundingClientRect();
  for (const el of card.querySelectorAll('*')) {
    const t = clean(el.innerText || '');
    if (!/^editar$/i.test(t)) continue;
    const b = el.getBoundingClientRect();
    if (b.top < yBarra || b.left < 200) continue;
    if (disparar(el)) return { ok: true, via: 'id-editar' };
  }
  const hits = [];
  for (const el of card.querySelectorAll('button, [role="button"], a, svg, i, span, div, img')) {
    const b = el.getBoundingClientRect();
    if (b.width < 8 || b.height < 8 || b.width > 72 || b.height > 72) continue;
    if (b.left < r2.right - 110) continue;
    if (b.top < Math.max(yBarra, r2.top - 10) || b.bottom > r2.top + 44) continue;
    if (esBasura(el) || esHistorial(el)) continue;
    const lab = clean((el.innerText || el.getAttribute('aria-label') || ''));
    if (/^default$/i.test(lab) || /resoluci[oó]n|zona de trabajo/i.test(lab)) continue;
    hits.push({ el, x: b.left, lapiz: esLapiz(el) ? 0 : 1 });
  }
  hits.sort((a, b) => a.lapiz - b.lapiz || a.x - b.x);
  if (hits[0] && disparar(hits[0].el)) {
    return { ok: true, via: 'id-icono' };
  }
  const x = r2.right - 36;
  const y = Math.max(yBarra + 4, r2.top + Math.min(20, Math.max(12, r2.height / 4)));
  const hit = document.elementFromPoint(x, y);
  const alvo = hit && (hit.closest('svg, button, [role="button"], [class*="icon"]') || hit);
  const txtHit = clean((alvo && (alvo.innerText || alvo.getAttribute('aria-label'))) || '');
  if (/^default$/i.test(txtHit) || /resoluci[oó]n|zona de trabajo/i.test(txtHit)) {
    return { ok: false, motivo: 'vista-default', x, y };
  }
  if (alvo && disparar(alvo)) {
    return { ok: true, via: 'id-punto', x, y };
  }
  return { ok: false, via: 'id', x, y };
}"""


def _abrir_por_id_visible(page, clave: str, comp_id: str) -> bool:
    """Clic en el id del bloque y su lápiz. No navega: eso saca default."""
    if not comp_id:
        return False
    y_min = _y_bajo_barra_vistas(page)
    get_by_text = getattr(page, "get_by_text", None)
    if get_by_text:
        try:
            loc = get_by_text(comp_id, exact=True)
            n = loc.count() if hasattr(loc, "count") else 0
        except Exception:
            n = 0
        for i in range(n):
            item = loc.nth(i)
            box = _bounding_box(item)
            if box is None or float(box.get("x") or 0) < 80:
                continue
            try:
                item.click(timeout=2_500)
                if _editor_confirmado(page, clave):
                    return True
            except Exception:
                pass
            try:
                edit = item.locator(
                    "xpath=ancestor::*[contains(., 'Editar')][1]"
                    "//*[normalize-space()='Editar']"
                )
                if hasattr(edit, "count") and edit.count():
                    ebox = _bounding_box(edit.first if hasattr(edit, "first") else edit)
                    if (
                        ebox
                        and float(ebox.get("y") or 0) >= y_min
                        and float(ebox.get("x") or 0) >= 200
                    ):
                        edit.first.click(timeout=3_000)
                        if _editor_confirmado(page, clave):
                            return True
            except Exception:
                continue
    return False


def url_tiene_vista_receta(url: str | None) -> bool:
    """True si la URL es la ficha de UNA receta (/view-manager/view/…), no el Gestor vacío."""
    return bool(url and re.search(r"view-manager/view/", url))


def gestor_sin_ficha(url: str | None) -> bool:
    """Gestor del proyecto sin /view/{id}: lienzo vacío, no la receta guardada."""
    u = url or ""
    return "view-manager" in u and not url_tiene_vista_receta(u)


def _limpiar_url_editor(url: str) -> str:
    limpio = re.sub(r"#.*$", "", url)
    limpio = limpio.split("?")[0]
    limpio = re.sub(
        r"/(?:edit|edicion|edici[oó]n)(?:/.*)?$",
        "",
        limpio,
        flags=re.I,
    )
    return limpio.rstrip("/")


def url_lienzo_receta(url: str | None, url_ficha: str | None = None) -> str | None:
    """URL de la misma receta (conserva /view/id). Nunca baja a /view-manager pelado."""
    candidatos: list[str] = []
    for raw in (url, url_ficha):
        if not raw or es_lista_proyectos_cms(raw):
            continue
        if "view-manager" not in raw:
            continue
        candidatos.append(_limpiar_url_editor(raw))
    for c in candidatos:
        if url_tiene_vista_receta(c):
            return c
    return None


def lienzo_con_bloques_cms(page) -> bool:
    """True si se ven los bloques del Gestor (Cabecera + tags), no un formulario plano.

    Los 5 bloques viven en un iframe: Playwright los ve; innerText del frame
    principal solo muestra el chrome (Proyectos / JUMBO).
    """
    if editor_actual(page) is not None:
        return False
    if _contar_placeholder_vacio(page) >= 1:
        return True
    if recoger_ids_componentes(page):
        return True
    try:
        t = page.evaluate("() => (document.body && document.body.innerText) || ''")
    except Exception:
        return False
    if not isinstance(t, str):
        return False
    return bool(re.search(r"cabecera", t, re.I) and re.search(r"\btags\b", t, re.I))


JS_BLOQUE_VACIO = """(aliases) => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const wanted = (aliases || []).map((s) => clean(s).toLowerCase());
  const nodos = [...document.querySelectorAll('div, section, article, li, h2, h3, h4')];
  let vi = false;
  let algunoLleno = false;
  for (const el of nodos) {
    const r = el.getBoundingClientRect();
    if (r.left < 240 || r.width < 80) continue;
    const crudo = clean(el.innerText || '');
    const linea = crudo.split('\\n')[0].toLowerCase();
    if (!wanted.some((w) => linea === w || linea.startsWith(w + ' '))) continue;
    if (crudo.length > 400) continue;
    vi = true;
    if (!/edita este componente vac[ií]o/i.test(crudo)) algunoLleno = true;
  }
  if (!vi) return null;
  return !algunoLleno;
}"""


def bloque_componente_vacio(page, aliases: list[str]) -> bool | None:
    """True = bloque vacío; False = ya tiene contenido; None = no lo vi."""
    ultimo = None
    for fr in _frames_pagina(page):
        try:
            out = fr.evaluate(JS_BLOQUE_VACIO, list(aliases))
        except Exception:
            continue
        if out is False:
            return False
        if out is True:
            ultimo = True
    return ultimo


JS_LIMPIAR_BUSCA_PALETA = """() => {
  const inputs = [...document.querySelectorAll('input')].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.left < 240 && r.width > 40 && r.height > 10;
  });
  let n = 0;
  for (const el of inputs) {
    if (!el.value) continue;
    const proto = HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && desc.set) desc.set.call(el, '');
    else el.value = '';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    n += 1;
  }
  return n;
}"""


def limpiar_busca_paleta(page) -> None:
    try:
        n = page.evaluate(JS_LIMPIAR_BUSCA_PALETA)
        if n:
            print("  · Limpié la búsqueda de la paleta (no escribir ahí).")
            page.wait_for_timeout(250)
    except Exception:
        pass


def esperar_lienzo_bloques(page, intentos: int = 12) -> bool:
    """Espera a ver Cabecera + tags en el lienzo antes de buscar lápices."""
    for _ in range(intentos):
        if lienzo_con_bloques_cms(page):
            return True
        if editor_actual(page) is not None:
            return False
        try:
            page.wait_for_timeout(300)
        except Exception:
            break
    return editor_actual(page) is None


def _clic_flecha_volver(page) -> bool:
    """Pulsa la flecha Volver (a menudo un icono sin texto, dentro del iframe)."""
    for fr in _frames_pagina(page):
        try:
            out = fr.evaluate(JS_VOLVER_AL_LIENZO)
        except Exception:
            out = None
        if out in {"back", "flecha", "gestor"} or out is True:
            return True
        get_by_role = getattr(fr, "get_by_role", None)
        if get_by_role:
            try:
                loc = get_by_role("button", name=re.compile(r"volver|atrás|atras|back", re.I))
                if hasattr(loc, "count") and loc.count():
                    loc.first.click(timeout=2_000)
                    return True
            except Exception:
                pass
        locator = getattr(fr, "locator", None)
        if locator:
            try:
                loc = locator(
                    '[aria-label*="volver" i], [title*="volver" i], '
                    '[aria-label*="atrás" i], [aria-label*="back" i]'
                )
                if hasattr(loc, "count") and loc.count():
                    loc.first.click(timeout=2_000)
                    return True
            except Exception:
                pass
        get_by_text = getattr(fr, "get_by_text", None)
        if get_by_text:
            try:
                loc = get_by_text(re.compile(r"^Gestor$", re.I))
                if hasattr(loc, "count") and loc.count():
                    loc.first.click(timeout=2_000)
                    return True
            except Exception:
                pass
            try:
                titulo = get_by_text(re.compile(r"^Edici[oó]n de ", re.I))
                if hasattr(titulo, "count") and titulo.count():
                    box = titulo.first.bounding_box() if hasattr(titulo.first, "bounding_box") else None
                    mouse = getattr(fr, "mouse", None) or getattr(page, "mouse", None)
                    if box and mouse and hasattr(mouse, "click"):
                        mouse.click(float(box["x"]) - 28, float(box["y"]) + float(box.get("height") or 20) / 2)
                        return True
            except Exception:
                pass
    return False


def volver_al_lienzo(page, url_ficha: str | None = None, *, confirmar_salida: bool = False) -> bool:
    """Sale del editor (flecha Volver) al lienzo. No toca Proyectos ni la paleta."""
    if editor_actual(page) is None and not es_lista_proyectos_cms(url_actual(page)):
        return True
    _clic_flecha_volver(page)
    try:
        page.wait_for_timeout(700)
    except Exception:
        pass
    if confirmar_salida:
        if not resolver_modal_cambios(page, salir=True):
            try:
                page.wait_for_timeout(400)
            except Exception:
                pass
            resolver_modal_cambios(page, salir=True)
    else:
        resolver_modal_cambios(page)
    if editor_actual(page) is None and not es_lista_proyectos_cms(url_actual(page)):
        print("  · Volví al lienzo (5 bloques)")
        esperar_lienzo_bloques(page)
        return True
    actual = url_actual(page)
    destino = url_lienzo_receta(actual, url_ficha)
    if url_tiene_vista_receta(actual) and destino and not url_tiene_vista_receta(destino):
        destino = url_lienzo_receta(actual, None)
    if url_tiene_vista_receta(actual) and destino and not url_tiene_vista_receta(destino):
        destino = None
    if destino and not url_tiene_vista_receta(destino):
        destino = None
    if destino and hasattr(page, "goto"):
        try:
            print("  · Vuelvo al Gestor de la receta…")
            page.goto(destino, wait_until="domcontentloaded", timeout=60_000)
            page.wait_for_timeout(500)
        except TypeError:
            try:
                page.goto(destino)
                page.wait_for_timeout(500)
            except Exception:
                pass
        except Exception:
            pass
        if (
            es_lista_proyectos_cms(url_actual(page))
            and url_tiene_vista_receta(url_ficha)
        ):
            try:
                page.goto(url_ficha, wait_until="domcontentloaded", timeout=60_000)
            except Exception:
                pass
        if editor_actual(page) is None and not es_lista_proyectos_cms(url_actual(page)):
            print("  · Volví al lienzo (5 bloques)")
            esperar_lienzo_bloques(page)
            return True
    return editor_actual(page) is None and not es_lista_proyectos_cms(url_actual(page))


def guardar_editor_persistente(page) -> bool:
    """Pulsa Guardar hasta ver el aviso. Nunca «Sí, acepto» (eso descarta)."""
    if _hay_modal_sin_guardar(page):
        print("  · Modal abierto: Cancelar para no perder lo escrito.")
        resolver_modal_cambios(page, salir=False)
    for _intento in range(3):
        _clic_guardar_editor(page)
        try:
            page.wait_for_timeout(800)
        except Exception:
            pass
        if parece_guardado_ok(page):
            print("  · Guardado satisfactoriamente")
            return True
        if editor_actual(page) is None:
            return True
    return parece_guardado_ok(page)


def guardar_y_volver_al_lienzo(
    page, url_ficha: str | None = None, *, forzar_salida: bool = False
) -> bool:
    """Guarda de verdad y recién ahí pulsa Volver. «Sí, acepto» vacía el bloque."""
    if _hay_modal_sin_guardar(page):
        print("  · Modal abierto: Cancelar para no perder lo escrito.")
        resolver_modal_cambios(page, salir=False)
    guardar_editor_persistente(page)
    try:
        page.wait_for_timeout(400)
    except Exception:
        pass
    if editor_actual(page) is None:
        return True
    puede_salir = forzar_salida or parece_guardado_ok(page) or not sigue_dato_requerido(page)
    if not puede_salir:
        print(f"  · Sigo en Edición de {editor_actual(page)}; no abro otro bloque.")
        return False
    print("  · Guardé. Pulso Volver (sin Sí, acepto).")
    if volver_al_lienzo(page, url_ficha, confirmar_salida=False):
        if _hay_modal_sin_guardar(page):
            print("  · Salió el modal: Cancelar, Guardar otra vez y Volver.")
            resolver_modal_cambios(page, salir=False)
            guardar_editor_persistente(page)
            volver_al_lienzo(page, url_ficha, confirmar_salida=False)
        if editor_actual(page) is None and not es_lista_proyectos_cms(url_actual(page)):
            return True
    if url_ficha:
        restaurar_ficha_si_salio(page, url_ficha)
        if editor_actual(page) is None and not es_lista_proyectos_cms(url_actual(page)):
            return True
    print(f"  · Sigo en Edición de {editor_actual(page)}; no abro otro bloque.")
    return False


def capturar_cms_por_componentes(page) -> tuple[dict, dict]:
    """
    Abre solo el lápiz de cada componente CRC, vuelca campos y fusiona selectores.
    La usuaria no debe hacer clic en los lápices.
    """
    url_ficha = url_actual(page)
    antes = contar_campos_editables(page)
    componentes_vistos = listar_componentes_cms(page)
    print(f"Componentes CMS detectados: {len(componentes_vistos)}")
    for c in componentes_vistos:
        print(f"  · {c.get('clave')}: {c.get('texto')!r} lapiz={c.get('lapizSelector')}")

    merged_fields: list[dict] = []
    merged_buttons: list[dict] = []
    por_componente: dict[str, dict] = {}
    lapices: dict[str, str | None] = {}
    urls = []

    # Si ya hay muchos campos (formulario plano / editor ya abierto), capturar una vez.
    if antes >= 6 and not componentes_vistos:
        estructura = dump_estructura(page)
        return estructura, sugerir_selectores(estructura)

    orden = [c["clave"] for c in COMPONENTES_CMS]
    if componentes_vistos:
        # Mantener orden CRC pero solo los detectados + intentar los faltantes igual
        detectados = {c["clave"] for c in componentes_vistos}
        orden = [k for k in orden if k in detectados] + [k for k in orden if k not in detectados]

    for clave in orden:
        meta = next(c for c in COMPONENTES_CMS if c["clave"] == clave)
        visto = next((c for c in componentes_vistos if c["clave"] == clave), None)
        sel_lapiz = (visto or {}).get("lapizSelector")
        print(f"\n→ Abriendo lápiz «{clave}»…")
        ok = abrir_lapiz_componente(page, clave, sel_lapiz)
        if restaurar_ficha_si_salio(page, url_ficha):
            ok = False
        if not ok:
            print(f"  ✗ No se encontró lápiz para {clave}")
            lapices[meta["lapiz_key"]] = sel_lapiz
            continue
        page.wait_for_timeout(500)
        despues = contar_campos_editables(page)
        if despues <= 0:
            print(f"  ✗ Lápiz clicado pero sin inputs editables ({clave})")
        estructura = dump_estructura(page)
        fields = estructura.get("fields") or []
        for f in fields:
            f = dict(f)
            f["componente"] = clave
            merged_fields.append(f)
        for b in estructura.get("buttons") or []:
            b = dict(b)
            b["componente"] = clave
            merged_buttons.append(b)
        por_componente[clave] = {
            "fields": len(fields),
            "url": estructura.get("url"),
            "aliases": list(meta["aliases"]),
        }
        if estructura.get("url"):
            urls.append(estructura["url"])
        # Preferir selector de lápiz detectado o el que funcionó
        if sel_lapiz:
            lapices[meta["lapiz_key"]] = sel_lapiz
        else:
            # Re-listar tras abrir por si ahora hay aria-label estable
            relist = listar_componentes_cms(page)
            rel = next((c for c in relist if c["clave"] == clave), None)
            lapices[meta["lapiz_key"]] = (rel or {}).get("lapizSelector") or sel_lapiz
        print(f"  ✓ {clave}: {len(fields)} campos (editables≈{despues})")
        cerrar_editor_componente(page)

    # Botones globales (Guardar / Publicar) en la vista de lista
    estructura_lista = dump_estructura(page)
    for b in estructura_lista.get("buttons") or []:
        b = dict(b)
        b["componente"] = "global"
        merged_buttons.append(b)

    estructura_final = {
        "url": (urls[-1] if urls else estructura_lista.get("url")),
        "title": estructura_lista.get("title"),
        "fields": merged_fields,
        "buttons": merged_buttons[:120],
        "linksReceta": estructura_lista.get("linksReceta") or [],
        "nav": estructura_lista.get("nav") or [],
        "cms": {
            "modo": "componentes",
            "componentesDetectados": componentes_vistos,
            "porComponente": por_componente,
            "autoLapiz": True,
        },
    }
    sugeridos = sugerir_selectores(estructura_final)
    for k, v in lapices.items():
        if v:
            sugeridos[k] = v
        elif k not in sugeridos:
            sugeridos[k] = v
    return estructura_final, sugeridos


def abrir_componente_para_campos(page, selectores: dict, keys_campo: tuple[str, ...] | list[str]) -> bool:
    """Abre el lápiz del componente que contiene alguno de los campos indicados."""
    for comp in COMPONENTES_CMS:
        if not any(k in comp["campos"] for k in keys_campo):
            continue
        lapiz = selectores.get(comp["lapiz_key"])
        if abrir_lapiz_componente(page, comp["clave"], lapiz):
            return True
    return False


def selector_para_campo(field: dict) -> str | None:
    """Selector usable por Playwright aunque el BM no exponga id/name."""
    sel = field.get("selectorSugerido")
    if sel:
        return sel
    tag = (field.get("tag") or "input").lower()
    if field.get("id"):
        return f"#{field['id']}"
    if field.get("name"):
        return f'{tag}[name="{field["name"]}"]'
    if field.get("placeholder"):
        ph = str(field["placeholder"]).replace('"', '\\"')
        return f'{tag}[placeholder="{ph}"]'
    if field.get("ariaLabel"):
        aria = str(field["ariaLabel"]).replace('"', '\\"')
        return f'{tag}[aria-label="{aria}"]'
    label = clean_label(field.get("label"))
    if label:
        safe = label.replace('"', '\\"')[:90]
        return (
            'xpath=//label[contains(normalize-space(.), "'
            + safe
            + '")]/following::*[self::input or self::textarea or self::select or @contenteditable="true"][1]'
        )
    return None


def clean_label(raw: str | None) -> str:
    if not raw:
        return ""
    # Evita labels gigantes que incluyen el valor del input
    text = re.sub(r"\s+", " ", str(raw)).strip()
    return text[:90]


def selector_para_boton(btn: dict) -> str | None:
    sel = btn.get("selectorSugerido")
    if sel:
        return sel
    if btn.get("id"):
        return f"#{btn['id']}"
    text = clean_label(btn.get("text"))
    if text:
        return f"text={json.dumps(text, ensure_ascii=False)}"
    return None


def sugerir_selectores(estructura: dict) -> dict:
    """Heurística: empareja labels con claves JSON CRC."""
    mapa = {
        "field_titulo": None,
        "field_descripcion": None,
        "field_porciones": None,
        "field_dificultad": None,
        "field_tiempo": None,
        "field_tags": None,
        "field_ingredientes": None,
        "field_pasos": None,
        "field_meta_titulo": None,
        "field_meta_descripcion": None,
        "btn_guardar_borrador": None,
        "btn_publicar": None,
        "nav_nueva_receta": None,
        "lapiz_cabecera": None,
        "lapiz_tags": None,
        "lapiz_ingredientes": None,
        "lapiz_instrucciones": None,
        "lapiz_seo": None,
    }
    editorial_rules = [
        ("field_titulo", r"t[ií]tulo|nombre\s*(de\s*)?receta|^title$"),
        ("field_descripcion", r"descripci[oó]n|bajada|intro|resumen|summary"),
        ("field_porciones", r"porcion|rinde|servings|personas"),
        ("field_dificultad", r"dificultad|nivel|difficulty"),
        ("field_tiempo", r"tiempo|duraci[oó]n|minutos|prep"),
        ("field_tags", r"tag|etiqueta|categor|palabra"),
        ("field_ingredientes", r"ingrediente"),
        ("field_pasos", r"paso|instrucci|preparaci[oó]n|c[oó]mo\s+prepar"),
    ]
    meta_rules = [
        ("field_meta_titulo", r"(?:meta|seo)[\s_-]*(?:t[ií]tulo|title)"),
        ("field_meta_descripcion", r"(?:meta|seo)[\s_-]*(?:descripci|desc)"),
    ]
    selectores_asignados = set()
    for field in estructura.get("fields") or []:
        blob = " ".join(
            filter(
                None,
                [
                    field.get("label"),
                    field.get("placeholder"),
                    field.get("ariaLabel"),
                    field.get("name"),
                    field.get("id"),
                    field.get("className"),
                ],
            )
        ).lower()
        sel = selector_para_campo(field)
        if not sel:
            continue
        if sel in selectores_asignados:
            continue
        regla_meta = next(
            ((key, pat) for key, pat in meta_rules if re.search(pat, blob, re.I)),
            None,
        )
        reglas_candidatas = [regla_meta] if regla_meta else editorial_rules
        for key, pat in reglas_candidatas:
            if mapa[key]:
                continue
            if re.search(pat, blob, re.I):
                mapa[key] = sel
                selectores_asignados.add(sel)
                break
    for btn in estructura.get("buttons") or []:
        t = (btn.get("text") or "").lower()
        sel = selector_para_boton(btn)
        if not sel:
            continue
        es_publicar = re.search(r"publicar|publish", t)
        if es_publicar:
            if not mapa["btn_publicar"]:
                mapa["btn_publicar"] = sel
        elif not mapa["btn_guardar_borrador"] and re.search(r"guardar|borrador|save|draft", t):
            mapa["btn_guardar_borrador"] = sel
    for link in (estructura.get("linksReceta") or []) + (estructura.get("nav") or []):
        t = (link.get("text") or "").lower()
        if re.search(r"nueva\s+receta|crear\s+receta|new\s+recipe|agregar\s+receta", t):
            href = link.get("href")
            if href:
                mapa["nav_nueva_receta"] = href
            break
    return mapa


def remapear_desde_estructura() -> dict:
    if not ESTRUCTURA_PATH.exists():
        raise FileNotFoundError(ESTRUCTURA_PATH)
    estructura = json.loads(ESTRUCTURA_PATH.read_text(encoding="utf-8"))
    fields = estructura.get("fields") or []
    buttons = estructura.get("buttons") or []
    print(f"URL capturada: {estructura.get('url')}")
    print(f"Título página: {estructura.get('title')}")
    print(f"Fields en estructura: {len(fields)} · Botones: {len(buttons)}")
    if fields:
        print("Resumen fields (label / placeholder / name / id / selector):")
        for i, field in enumerate(fields[:40]):
            print(
                "  [{i}] label={label!r} ph={ph!r} name={name!r} id={id!r} sel={sel!r}".format(
                    i=i,
                    label=(field.get("label") or "")[:80],
                    ph=(field.get("placeholder") or "")[:40],
                    name=field.get("name"),
                    id=field.get("id"),
                    sel=(field.get("selectorSugerido") or "")[:60],
                )
            )
    if buttons:
        print("Resumen botones (text / sel):")
        for i, btn in enumerate(buttons[:30]):
            print(
                "  [{i}] text={text!r} sel={sel!r}".format(
                    i=i,
                    text=(btn.get("text") or "")[:80],
                    sel=(btn.get("selectorSugerido") or "")[:60],
                )
            )
    sugeridos = sugerir_selectores(estructura)
    if MAPA_SELECTORES_PATH.exists():
        prev = json.loads(MAPA_SELECTORES_PATH.read_text(encoding="utf-8"))
        for k, v in sugeridos.items():
            if v:
                prev[k] = v
            elif k not in prev:
                prev[k] = v
        sugeridos = prev
    MAPA_SELECTORES_PATH.write_text(
        json.dumps(sugeridos, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return sugeridos


def try_login(page, env: dict) -> None:
    user = env.get("CENCOSUD_BM_USER") or ""
    password = env.get("CENCOSUD_BM_PASSWORD") or ""
    if not user or not password:
        print("Sin USER/PASSWORD en .env → harás login manual en la ventana del navegador.")
        return
    user_sel = env.get("CENCOSUD_BM_LOGIN_USER_SEL") or 'input[type="email"], input[name="username"], input[name="loginfmt"], #userNameInput, input[type="text"]'
    pass_sel = env.get("CENCOSUD_BM_LOGIN_PASS_SEL") or 'input[type="password"], input[name="password"], #passwordInput'
    submit_sel = env.get("CENCOSUD_BM_LOGIN_SUBMIT_SEL") or 'button[type="submit"], input[type="submit"], #idSIButton9'
    try:
        page.wait_for_timeout(1500)
        u = page.locator(user_sel).first
        if u.count() and u.is_visible():
            u.fill(user)
            print("Usuario rellenado (si el formulario lo permite).")
            # a veces hay paso intermedio
            btn = page.locator(submit_sel).first
            if btn.count() and btn.is_visible():
                btn.click()
                page.wait_for_timeout(1500)
        p = page.locator(pass_sel).first
        if p.count() and p.is_visible():
            p.fill(password)
            btn = page.locator(submit_sel).first
            if btn.count() and btn.is_visible():
                btn.click()
            print("Contraseña enviada. Si pide MFA/ADFS, completa en la ventana.")
    except Exception as e:
        print(f"Login automático parcial falló ({e}). Continúa a mano en el navegador.")


LABEL_NOMBRE = re.compile(r"nombre|producto|ingrediente|item", re.I)
LABEL_CANTIDAD = re.compile(r"cantidad|quantity|amount|^cant\b|gramo|peso", re.I)
LABEL_UNIDAD = re.compile(r"unidad|unit|medida", re.I)
LABEL_SKU = re.compile(r"sku|ean|c[oó]digo|product.?id", re.I)
LABEL_PASO = re.compile(r"paso|instrucci|descripci[oó]n|texto|c[oó]mo", re.I)
LABEL_ORDEN = re.compile(r"orden|n[uú]mero|^#\s*$|order", re.I)
PLACEHOLDER_VACIO = re.compile(r"dale un valor|ingresa|escribe", re.I)
ETIQUETAS_CAMPO = {
    "field_titulo": re.compile(r"t[ií]tulo", re.I),
    "field_descripcion": re.compile(r"descripci[oó]n|bajada|intro|resumen", re.I),
    "field_porciones": re.compile(r"porcion|rinde|servings|personas", re.I),
    "field_dificultad": re.compile(r"dificultad|nivel|difficulty", re.I),
    "field_tiempo": re.compile(r"tiempo total|duraci[oó]n|^tiempo$", re.I),
    "field_tiempo_prep": re.compile(r"tiempo de preparaci[oó]n|preparaci[oó]n|prep", re.I),
    "field_tiempo_coccion": re.compile(r"tiempo de cocci[oó]n|cocci[oó]n|cook", re.I),
    "field_tags": re.compile(r"tags?|etiquetas?|categor", re.I),
    "field_tips": re.compile(r"tips?|consejos?", re.I),
    "field_meta_titulo": re.compile(r"meta\s*t[ií]tulo|seo title", re.I),
    "field_meta_descripcion": re.compile(r"meta\s*descripci[oó]n|seo desc", re.I),
    "field_alt": re.compile(r"texto alt|alt\s*text|alternativa|atributo alt", re.I),
}
# Etiquetas exactas del editor BM Jumbo (Edición de Cabecera / tags / listas).
LABELS_EDITOR_BM = {
    "field_titulo": r"^Título\b",
    "field_descripcion": r"^Descripción\b",
    "field_porciones": r"^Porciones\b",
    "field_tiempo": r"^Duración\b",
    "field_dificultad": r"^Dificultad\b",
    "field_alt": r"^(Texto alt|Alt)\b",
    "field_meta_titulo": r"Meta\s*título|SEO Title",
    "field_meta_descripcion": r"Meta\s*descripción|SEO Desc",
}
DIFICULTAD_BM = {
    "muy facil": "Muy Fácil",
    "muy fácil": "Muy Fácil",
    "facil": "Fácil",
    "fácil": "Fácil",
    "moderado": "Moderado",
    "media": "Moderado",
    "medio": "Moderado",
    "intermedio": "Intermedio",
    "dificil": "Difícil",
    "difícil": "Difícil",
    "muy dificil": "Muy Difícil",
    "muy difícil": "Muy Difícil",
    "absurdamente dificil": "Absolutamente difícil",
    "absolutamente dificil": "Absolutamente difícil",
    "absolutamente difícil": "Absolutamente difícil",
}


def normalizar_dificultad_bm(valor: str | None) -> str | None:
    if valor is None or str(valor).strip() == "":
        return None
    crudo = str(valor).strip()
    clave = crudo.lower()
    clave = (
        clave.replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
    )
    for k, etiqueta in DIFICULTAD_BM.items():
        k_norm = (
            k.replace("á", "a")
            .replace("é", "e")
            .replace("í", "i")
            .replace("ó", "o")
            .replace("ú", "u")
        )
        if clave == k_norm:
            return etiqueta
    return crudo


def esta_en_editor_componente(page) -> bool:
    u = url_actual(page)
    if re.search(r"edici[oó]n|edicion|/edit|component", u, re.I):
        return True
    get_by_text = getattr(page, "get_by_text", None)
    if not get_by_text:
        return False
    try:
        loc = get_by_text(re.compile(r"Edición de", re.I))
        return bool(hasattr(loc, "count") and loc.count())
    except Exception:
        return False


def label_coincide_campo(key: str, blob: str) -> bool:
    """Evita mezclar Título de cabecera con «Título de la sección» o meta SEO."""
    b = blob or ""
    if key == "field_titulo":
        if re.search(r"meta\s*t[ií]tulo|t[ií]tulo de la secci", b, re.I):
            return False
        return bool(re.search(r"t[ií]tulo", b, re.I))
    if key == "field_descripcion":
        if re.search(r"meta\s*descripci", b, re.I):
            return False
        return bool(re.search(r"descripci[oó]n|bajada|intro|resumen", b, re.I))
    patron = ETIQUETAS_CAMPO.get(key)
    return bool(patron and patron.search(b))


def numero_campo_bm(valor: str | None, *, minimo: float = 1) -> str | None:
    """Duración/porciones del BM piden número ≥ 1: '30 min' → '30'. Nunca 0."""
    if valor is None or str(valor).strip() == "":
        return None
    m = re.search(r"\d+[.,]?\d*", str(valor))
    if not m:
        return None
    try:
        n = float(m.group(0).replace(",", "."))
    except ValueError:
        return None
    if n < minimo:
        return None
    if n == int(n):
        return str(int(n))
    return str(n).replace(",", ".")


def duracion_receta(receta: dict) -> str | None:
    for clave in ("tiempoTotal", "tiempoPreparacion", "tiempoCoccion"):
        n = numero_campo_bm(receta.get(clave))
        if n:
            return n
    return None


TITULOS_EDITOR = {
    "cabecera": re.compile(
        r"edici[oó]n de\s+(cabecera|header)|editar\s+(la\s+)?(cabecera|header)", re.I
    ),
    "tags": re.compile(
        r"edici[oó]n de\s+(lista\s+)?(tags?|etiquetas?)"
        r"|editar\s+(lista\s+)?(tags?|etiquetas?)"
        r"|formulario\s+tags?",
        re.I,
    ),
    "ingredientes": re.compile(
        r"edici[oó]n de\s+lista\s+ingredientes|editar\s+lista\s+ingredientes|list_ingredients",
        re.I,
    ),
    "instrucciones": re.compile(
        r"edici[oó]n de\s+lista\s+de\s+instrucciones|editar\s+lista\s+de\s+instrucciones|list_instructions",
        re.I,
    ),
    "seo": re.compile(r"edici[oó]n de\s+seo|editar\s+seo", re.I),
}


JS_TEXTO_EDITOR = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const hs = [...document.querySelectorAll('h1,h2,h3,h4')]
    .map((el) => clean(el.innerText))
    .filter(Boolean);
  const extra = clean(document.body && document.body.innerText)
    .split('\\n')
    .map((s) => s.trim())
    .filter((s) => /edici[oó]n de|editar |formulario tags/i.test(s))
    .slice(0, 10);
  return [document.title || '', ...hs, ...extra].join(' | ');
}"""


def _textos_por_frame(page, script: str) -> list[str]:
    partes: list[str] = []
    for fr in _frames_pagina(page):
        try:
            raw = fr.evaluate(script)
        except Exception:
            continue
        if isinstance(raw, str) and raw.strip():
            partes.append(raw)
    return partes


def texto_cuerpo(page) -> str:
    return "\n".join(
        _textos_por_frame(page, "() => (document.body && document.body.innerText) || ''")
    )


def texto_editor(page) -> str:
    return " | ".join(_textos_por_frame(page, JS_TEXTO_EDITOR))


def _editor_por_texto(t: str) -> str | None:
    t = (t or "").lower()
    if not t or len(t) < 20:
        return None
    if "edita este componente vac" in t and "dificultad" not in t:
        return None
    if "dificultad" in t and ("duración" in t or "duracion" in t) and "porciones" in t:
        return "cabecera"
    if re.search(r"ingrediente\s*\*", t) and (
        "cantidad" in t
        or "unidad" in t
        or "título de la sección" in t
        or "titulo de la seccion" in t
        or "list_ingredients" in t
    ):
        return "ingredientes"
    if "list_ingredients" in t and "formulario ítem" in t:
        return "ingredientes"
    if "list_instructions" in t or (
        "lista de instrucciones" in t and "formulario ítem" in t
    ):
        return "instrucciones"
    if "instrucci" in t and ("paso" in t or "agregar" in t or "título" in t) and "dificultad" not in t:
        return "instrucciones"
    if (
        "seo html" in t
        or "seo_html" in t
        or "formulario seo" in t
        or (re.search(r"\bcontent\s*\*", t) and "html" in t and "script" in t)
    ):
        return "seo"
    if ("meta título" in t or "meta titulo" in t or "seo title" in t) and (
        "meta descripción" in t or "meta descripcion" in t or "seo desc" in t
    ):
        return "seo"
    if re.search(r"\btags?\b", t) and ("agregar" in t or "etiqueta" in t) and "dificultad" not in t:
        return "tags"
    if (
        "dificultad" not in t
        and (
            "formulario tags" in t
            or (re.search(r"\btag\s*\*", t) and "link" in t)
            or (re.search(r"\btags?\b", t) and ("arreglo" in t or "formulario ítem" in t or "formulario item" in t))
        )
    ):
        return "tags"
    return None


def editor_por_campos(page) -> str | None:
    """El panel del BM a veces no pone «Edición de …» en un h1. Mira cada iframe."""
    for t in _textos_por_frame(
        page, "() => (document.body && document.body.innerText) || ''"
    ):
        clave = _editor_por_texto(t)
        if clave:
            return clave
    return None


def editor_actual(page) -> str | None:
    t = texto_editor(page)
    if t:
        for clave, pat in TITULOS_EDITOR.items():
            if pat.search(t):
                return clave
    return editor_por_campos(page)


def parece_cms_vacio(page) -> bool:
    """Chrome del BM sin lienzo de 5 bloques ni editor (página en blanco)."""
    if editor_actual(page) or lienzo_con_bloques_cms(page):
        return False
    if _contar_placeholder_vacio(page) >= 3:
        return False
    if len(recoger_ids_componentes(page)) >= 3:
        return False
    t = texto_cuerpo(page).lower()
    if not t:
        return False
    return "proyectos" in t or "business-manager" in t or "jumbo" in t


def puede_rellenar_editor(page, clave: str) -> bool:
    """Solo escribir si el lápiz abrió ese editor. Nunca a ciegas en el lienzo."""
    actual = editor_actual(page)
    if actual is None:
        return not lienzo_con_bloques_cms(page) and not parece_cms_vacio(page)
    return actual == clave


JS_ABRIR_COMBO_DIFICULTAD = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const visibles = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 8 && r.height > 8;
  };
  const esControl = (el) => {
    if (!el || !visibles(el)) return false;
    const tag = (el.tagName || '').toLowerCase();
    const role = (el.getAttribute('role') || '').toLowerCase();
    const cls = String(el.className || '').toLowerCase();
    const aria = (el.getAttribute('aria-haspopup') || '').toLowerCase();
    if (tag === 'select') return true;
    if (role === 'combobox' || role === 'listbox' || role === 'button') return true;
    if (aria === 'listbox' || aria === 'true' || aria === 'menu') return true;
    if (cls.includes('select') || cls.includes('dropdown') || cls.includes('combo')) return true;
    return false;
  };
  const nodos = [...document.querySelectorAll('label, p, span, legend, h2, h3, h4, div')];
  let lab = null;
  for (const el of nodos) {
    const t = clean(el.innerText || el.textContent || '');
    const linea = t.split(' El dato')[0].replace(/\\*$/, '').trim();
    if (/^Dificultad$/i.test(linea) && t.length < 80) { lab = el; break; }
  }
  if (!lab) return { ok: false, via: 'sin-label' };
  const query = 'select, [role="combobox"], [aria-haspopup], [class*="select"], [class*="dropdown"], [class*="combo"], button, input';
  let control = null;
  let node = lab.parentElement;
  for (let i = 0; i < 10 && node && !control; i++) {
    const found = [...node.querySelectorAll(query)].filter((el) => el !== lab && visibles(el));
    control = found.find(esControl) || found.find((el) => el.tagName && el.tagName.toLowerCase() !== 'label') || null;
    node = node.parentElement;
  }
  if (!control) {
    let sib = lab.nextElementSibling;
    for (let i = 0; i < 8 && sib && !control; i++) {
      if (esControl(sib)) control = sib;
      else {
        const inner = [...sib.querySelectorAll(query)].find((el) => visibles(el));
        if (inner) control = inner;
        else if (visibles(sib) && (sib.tagName || '').toLowerCase() !== 'p') control = sib;
      }
      sib = sib.nextElementSibling;
    }
  }
  if (!control) {
    const r = lab.getBoundingClientRect();
    const puntos = [
      [r.left + Math.min(140, Math.max(24, r.width / 2)), r.bottom + 20],
      [r.left + 80, r.bottom + 40],
      [r.right + 36, r.top + r.height / 2],
    ];
    for (const [x, y] of puntos) {
      const el = document.elementFromPoint(x, y);
      if (el && el !== lab && !lab.contains(el)) { control = el; break; }
    }
  }
  if (!control) {
    lab.click();
    return { ok: true, via: 'label' };
  }
  control.click();
  return { ok: true, via: (control.tagName || '') + ':' + (control.getAttribute('role') || '') };
}"""


JS_CLICK_OPCION_EXACTA = """(etiqueta) => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const wanted = clean(etiqueta);
  if (!wanted) return false;
  const nodos = [...document.querySelectorAll(
    '[role="option"], [role="menuitem"], li, [class*="option"], [class*="menu"] *, [class*="listbox"] *'
  )];
  const hits = nodos.filter((el) => {
    const t = clean(el.innerText || el.textContent || '');
    return t === wanted;
  });
  hits.sort((a, b) => {
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    return (ra.width * ra.height) - (rb.width * rb.height);
  });
  if (!hits.length) return false;
  hits[0].click();
  return true;
}"""


def opcion_dificultad_exacta(visibles: list[str], etiqueta: str) -> str | None:
    """Elige 'Fácil' y no un contenedor 'Muy Fácil'."""
    wanted = (etiqueta or "").strip()
    if not wanted:
        return None
    for texto in visibles:
        if (texto or "").strip() == wanted:
            return wanted
    return None


def _clic_opcion_dificultad(page, etiqueta: str) -> bool:
    try:
        ok = page.evaluate(JS_CLICK_OPCION_EXACTA, etiqueta)
        if ok is True:
            return True
    except Exception:
        pass
    get_by_role = getattr(page, "get_by_role", None)
    if get_by_role:
        try:
            loc = get_by_role("option", name=etiqueta, exact=True)
            if hasattr(loc, "count") and loc.count():
                loc.first.click(timeout=2_500)
                return True
        except TypeError:
            try:
                loc = get_by_role("option", name=etiqueta)
                if hasattr(loc, "count") and loc.count():
                    loc.first.click(timeout=2_500)
                    return True
            except Exception:
                pass
        except Exception:
            pass
    try:
        loc = page.locator(f'[role="option"]')
        n = loc.count() if hasattr(loc, "count") else 0
        for i in range(n):
            item = loc.nth(i)
            txt = ""
            try:
                txt = (item.inner_text() or "").strip()
            except Exception:
                continue
            if opcion_dificultad_exacta([txt], etiqueta):
                item.click(timeout=2_500)
                return True
    except Exception:
        pass
    return False


def elegir_dificultad(page, valor: str | None) -> bool:
    etiqueta = normalizar_dificultad_bm(valor)
    if not etiqueta:
        return False
    try:
        page.evaluate(JS_ABRIR_COMBO_DIFICULTAD)
        page.wait_for_timeout(450)
    except Exception:
        pass
    try:
        loc = page.locator("select").first
        if loc.count():
            try:
                loc.select_option(label=etiqueta)
            except Exception:
                loc.select_option(value=etiqueta)
            print(f"  ✓ field_dificultad → {etiqueta}")
            return True
    except Exception:
        pass
    if _clic_opcion_dificultad(page, etiqueta):
        print(f"  ✓ field_dificultad → {etiqueta}")
        return True
    print(f"  ✗ field_dificultad (combo no eligió «{etiqueta}»)")
    return False


def alt_portada(receta: dict) -> str | None:
    for im in receta.get("imagenes") or []:
        alt = (im.get("alt") or "").strip()
        if alt:
            return alt
    return None


def extraer_imagenes_docx(
    path: Path, dest_dir: Path, omitidas: list[str] | None = None
) -> list[Path]:
    return _RUTAS.extraer_imagenes_docx(path, dest_dir, omitidas)


def resolver_docx_fuente(receta: dict) -> Path | None:
    for p in _RUTAS.candidatos_docx_fuente(receta, ROOT, CRC):
        if p.exists() and p.is_file() and p.suffix.lower() == ".docx":
            return p
    return None


def _fotos_en(carpeta: Path, *, recursivo: bool = False) -> list[Path]:
    if not carpeta.is_dir():
        return []
    hits: list[Path] = []
    for ext in _RUTAS.EXT_RASTER_BM:
        patron = f"*{ext}"
        hits.extend(carpeta.rglob(patron) if recursivo else carpeta.glob(patron))
    return sorted({p.resolve() for p in hits if p.is_file()})


def _buscar_foto_en_carpetas(receta: dict) -> Path | None:
    rid = (receta.get("id") or "").strip().lower()
    media_id = CRC / "out" / "media" / (receta.get("id") or "")
    propias = _fotos_en(media_id)
    if propias:
        return propias[0]
    media = CRC / "out" / "media"
    en_media = _fotos_en(media, recursivo=True)
    if rid:
        preferidas = [p for p in en_media if rid in p.as_posix().lower()]
        if preferidas:
            return preferidas[0]
    elif en_media:
        return en_media[0]
    if not rid:
        return None
    for carpeta in _RUTAS.carpetas_busqueda_foto(ROOT, CRC):
        if carpeta == media or carpeta == CRC / "out":
            continue
        for foto in _fotos_en(carpeta):
            if rid in foto.name.lower():
                return foto
    return None


def ruta_imagen_portada(receta: dict) -> Path | None:
    for im in receta.get("imagenes") or []:
        raw = im.get("rutaLocal") or ""
        if not raw:
            continue
        p = Path(raw)
        if not p.is_absolute():
            p = ROOT / p
        if p.exists() and p.is_file():
            return p
    dest = CRC / "out" / "media" / (receta.get("id") or "portada")
    docx = resolver_docx_fuente(receta)
    bajada, url = _RUTAS.asegurar_foto_desde_enlace(docx, dest, receta)
    if bajada:
        print(f"  · foto del enlace Foto → {bajada.name}" + (f" ({url})" if url else ""))
        return bajada
    hallada = _buscar_foto_en_carpetas(receta)
    if hallada:
        return hallada
    if docx:
        guardadas = extraer_imagenes_docx(docx, dest)
        if guardadas:
            return guardadas[0]
    return None


def _log_sin_foto(receta: dict) -> None:
    print("  · sin archivo de foto")
    fuente = receta.get("fuenteWord") or "(sin fuenteWord en el JSON)"
    print(f"    fuenteWord: {fuente}")
    docx = resolver_docx_fuente(receta)
    urls = [
        (im.get("urlFuente") or im.get("url") or "").strip()
        for im in (receta.get("imagenes") or [])
        if (im.get("urlFuente") or im.get("url") or "").strip()
    ]
    if docx:
        print(f"    Word hallado: {docx}")
        enlace = _RUTAS.elegir_enlace_foto(_RUTAS.extraer_enlaces_docx(docx))
        if enlace and enlace.get("url"):
            urls.insert(0, enlace["url"])
        omitidas: list[str] = []
        dest = CRC / "out" / "media" / (receta.get("id") or "portada")
        extraer_imagenes_docx(docx, dest, omitidas)
        if omitidas:
            print(f"    word/media omitidas: {', '.join(omitidas)}")
    elif not urls:
        print("    no hallé el .docx (Downloads / inbox / --force)")
    if urls:
        print(f"    enlace Foto: {urls[0]}")
        print("    no pude bajar esa URL (¿pide login o no es una imagen?)")
    elif docx:
        print("    el Word no tiene el enlace celeste «Foto»")


JS_MARCAR_FILE_IMAGEN = """() => {
  document.querySelectorAll('[data-crc-file-hit]').forEach((el) => el.removeAttribute('data-crc-file-hit'));
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const nodos = [...document.querySelectorAll('label, p, span, legend, h2, h3, h4, div')];
  let lab = null;
  for (const el of nodos) {
    const t = clean(el.innerText || el.textContent || '');
    const linea = t.split(' El dato')[0].replace(/\\*$/, '').trim();
    if (/^Imagen$/i.test(linea) && t.length < 80) { lab = el; break; }
  }
  let inputs = [];
  if (lab) {
    let node = lab;
    for (let i = 0; i < 10 && node; i++) {
      inputs = [...node.querySelectorAll('input[type="file"]')];
      if (inputs.length) break;
      node = node.parentElement;
    }
  }
  if (!inputs.length) inputs = [...document.querySelectorAll('input[type="file"]')];
  inputs.forEach((el, i) => el.setAttribute('data-crc-file-hit', String(i)));
  return inputs.length;
}"""


JS_CLICK_DROPZONE_IMAGEN = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const nodos = [...document.querySelectorAll('label, p, span, legend, h2, h3, h4, div, button')];
  let lab = null;
  for (const el of nodos) {
    const t = clean(el.innerText || el.textContent || '');
    const linea = t.split(' El dato')[0].replace(/\\*$/, '').trim();
    if (/^Imagen$/i.test(linea) && t.length < 80) { lab = el; break; }
  }
  if (!lab) return false;
  const r = lab.getBoundingClientRect();
  const el = document.elementFromPoint(r.left + 80, r.bottom + 40)
    || lab.nextElementSibling
    || lab;
  if (el) el.click();
  return true;
}"""


JS_HAY_MODAL_MEDIA = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const visibles = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 8 && r.height > 8;
  };
  const botones = [...document.querySelectorAll('button, [role="button"]')].filter(visibles);
  const hayConfirmar = botones.some((el) => /^Confirmar$/i.test(clean(el.innerText || el.getAttribute('aria-label') || '')));
  const txt = clean(document.body.innerText || '');
  return hayConfirmar && /Mi Equipo|portada-enlace|Selecciona|imagen/i.test(txt);
}"""


JS_ACTIVAR_TAB_MI_EQUIPO = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const tabs = [...document.querySelectorAll('button, [role="tab"], a, div')];
  const tab = tabs.find((el) => {
    const t = clean(el.innerText || '');
    return /^Mi Equipo$/i.test(t) && t.length < 40;
  });
  if (!tab) return false;
  tab.click();
  return true;
}"""


JS_SELECCIONAR_THUMB_IMAGEN = """(nombre) => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const wanted = clean(nombre || '').toLowerCase();
  const stem = wanted.replace(/\\.[a-z0-9]+$/, '');
  const visibles = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 8 && r.height > 8;
  };
  const roots = [...document.querySelectorAll('[role="dialog"], [class*="modal"], [class*="Modal"], [class*="overlay"], [class*="picker"], [class*="Media"]')];
  const scope = roots.find((el) => /Confirmar|Mi Equipo/i.test(el.innerText || '')) || document.body;
  const nodos = [...scope.querySelectorAll('img, figure, button, [role="button"], [class*="thumb"], [class*="card"], [class*="item"], div, span, p')];
  let hit = nodos.find((el) => {
    if (!visibles(el)) return false;
    const t = clean(
      el.innerText || el.getAttribute('alt') || el.getAttribute('title') || el.getAttribute('aria-label') || ''
    ).toLowerCase();
    return t && (t.includes(wanted) || (stem && t.includes(stem)));
  });
  if (!hit) hit = [...scope.querySelectorAll('img')].find(visibles) || null;
  if (!hit) return false;
  hit.click();
  return true;
}"""


JS_CLICK_CONFIRMAR_IMAGEN = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const visibles = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 8 && r.height > 8 && !el.disabled;
  };
  const roots = [...document.querySelectorAll('[role="dialog"], [class*="modal"], [class*="Modal"], [class*="overlay"], [class*="picker"]')];
  const scope = roots.find((el) => /Confirmar/i.test(el.innerText || '')) || document.body;
  const botones = [...scope.querySelectorAll('button, [role="button"], a')].filter(visibles);
  const btn = botones.find((el) => /^Confirmar$/i.test(clean(el.innerText || el.getAttribute('aria-label') || '')));
  if (!btn) return false;
  btn.click();
  return true;
}"""


def _hay_modal_media(page) -> bool:
    try:
        return page.evaluate(JS_HAY_MODAL_MEDIA) is True
    except Exception:
        return False


def _esperar_modal_media(page, intentos: int = 10) -> bool:
    for _ in range(intentos):
        if _hay_modal_media(page):
            return True
        try:
            page.wait_for_timeout(250)
        except Exception:
            break
    return _hay_modal_media(page)


def _clic_confirmar_playwright(page) -> bool:
    get_by_role = getattr(page, "get_by_role", None)
    if get_by_role:
        try:
            loc = get_by_role("button", name=re.compile(r"^Confirmar$", re.I))
            if hasattr(loc, "count") and loc.count():
                loc.last.click(timeout=2_500)
                return True
        except Exception:
            pass
    try:
        loc = page.locator("button:has-text('Confirmar')")
        n = loc.count() if hasattr(loc, "count") else 0
        if n:
            loc.last.click(timeout=2_500)
            return True
    except Exception:
        pass
    return False


def confirmar_imagen_en_modal(page, nombre: str) -> bool:
    """En el picker de BM: pestaña Mi Equipo → miniatura → Confirmar."""
    if not _esperar_modal_media(page):
        return True
    try:
        page.evaluate(JS_ACTIVAR_TAB_MI_EQUIPO)
        page.wait_for_timeout(200)
    except Exception:
        pass
    try:
        if page.evaluate(JS_SELECCIONAR_THUMB_IMAGEN, nombre) is True:
            print(f"  · seleccioné {nombre}")
    except Exception:
        pass
    get_by_text = getattr(page, "get_by_text", None)
    if get_by_text:
        try:
            loc = get_by_text(nombre, exact=False)
            if hasattr(loc, "count") and loc.count():
                loc.last.click(timeout=2_000)
                print(f"  · seleccioné {nombre}")
        except Exception:
            pass
    try:
        page.wait_for_timeout(300)
    except Exception:
        pass
    for _ in range(4):
        try:
            if page.evaluate(JS_CLICK_CONFIRMAR_IMAGEN) is True:
                print("  ✓ Confirmar imagen")
                page.wait_for_timeout(700)
                return True
        except Exception:
            pass
        if _clic_confirmar_playwright(page):
            print("  ✓ Confirmar imagen")
            try:
                page.wait_for_timeout(700)
            except Exception:
                pass
            return True
        try:
            page.wait_for_timeout(250)
        except Exception:
            break
    if _hay_modal_media(page):
        print("  ✗ modal de imagen: no pude pulsar Confirmar")
        return False
    return True


def _aplicar_archivo_imagen(page, ruta: Path) -> bool:
    try:
        n = page.evaluate(JS_MARCAR_FILE_IMAGEN)
    except Exception:
        n = 0
    if n:
        try:
            loc = page.locator('[data-crc-file-hit="0"]')
            setter = getattr(loc.first if hasattr(loc, "first") else loc, "set_input_files", None)
            if setter:
                setter(str(ruta))
                return True
        except Exception as e:
            print(f"  · input file: {e}")
    expect = getattr(page, "expect_file_chooser", None)
    if expect:
        try:
            with expect(timeout=4_000) as fc_info:
                page.evaluate(JS_CLICK_DROPZONE_IMAGEN)
            chooser = fc_info.value
            chooser.set_files(str(ruta))
            return True
        except Exception:
            pass
    try:
        loc = page.locator("input[type='file']")
        if loc.count():
            loc.first.set_input_files(str(ruta))
            return True
    except Exception as e:
        print(f"  ✗ imagen portada: {e}")
        return False
    return False


def subir_imagen_portada(page, receta: dict) -> bool:
    ruta = ruta_imagen_portada(receta)
    if not ruta:
        _log_sin_foto(receta)
        return False
    if not _aplicar_archivo_imagen(page, ruta):
        print(f"  ✗ imagen portada: sin input file ({ruta.name})")
        return False
    if not confirmar_imagen_en_modal(page, ruta.name):
        return False
    print(f"  ✓ imagen portada ({ruta.name})")
    return True


BOTONES_AGREGAR = (
    "button:has-text('Agregar nuevo ítem')",
    "button:has-text('Agregar nuevo item')",
    "[role='button']:has-text('Agregar nuevo ítem')",
    "button:has-text('Agregar')",
    "button:has-text('Añadir')",
    "button:has-text('Add')",
    "button:has-text('Nuevo')",
    "[aria-label*='Agregar' i]",
    "[aria-label*='Añadir' i]",
    "[aria-label*='Add' i]",
    "[aria-label*='Duplicar' i]",
    "[aria-label*='Duplicate' i]",
    "[title*='Duplicar' i]",
    "[title*='Duplicate' i]",
)


def blob_campo(field: dict) -> str:
    return " ".join(
        str(parte).strip()
        for parte in (
            field.get("label"),
            field.get("placeholder"),
            field.get("ariaLabel"),
            field.get("name"),
            field.get("id"),
        )
        if parte
    )


def linea_ingrediente(item: dict) -> str:
    """Línea tal cual el Word. Si no hay `linea`, arma cantidad + unidad + de + nombre."""
    cruda = str(item.get("linea") or "").strip()
    if cruda:
        return cruda
    cant = str(item.get("cantidad") or "").strip()
    unidad = str(item.get("unidad") or "").strip()
    nombre = str(item.get("nombre") or "").strip()
    if cant and unidad and nombre:
        if nombre.lower().startswith("de "):
            return f"{cant} {unidad} {nombre}"
        return f"{cant} {unidad} de {nombre}"
    return " ".join(filter(None, [cant, unidad, nombre])).strip()


JS_MARCAR_POR_LABEL = """(args) => {
  const patron = args.patron;
  const excluir = args.excluir || '';
  const re = new RegExp(patron, 'i');
  const reEx = excluir ? new RegExp(excluir, 'i') : null;
  document.querySelectorAll('[data-crc-label-hit]').forEach((el) => el.removeAttribute('data-crc-label-hit'));
  const visibles = (el) => {
    if (!el) return false;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.left >= 240;
  };
  const esControl = (el) => {
    if (!el || !visibles(el)) return false;
    const tag = (el.tagName || '').toLowerCase();
    if (tag === 'textarea' || tag === 'select') return true;
    if (tag === 'input') {
      const t = (el.type || 'text').toLowerCase();
      return !['hidden', 'checkbox', 'radio', 'file', 'submit', 'button'].includes(t);
    }
    return el.getAttribute('contenteditable') === 'true' || el.getAttribute('role') === 'combobox';
  };
  const seen = new Set();
  let n = 0;
  const nodos = document.querySelectorAll('label, legend, p, span, div, h2, h3, h4, h5');
  for (const lab of nodos) {
    const crudo = (lab.innerText || lab.textContent || '').replace(/\\s+/g, ' ').trim();
    if (!crudo || crudo.length > 90) continue;
    const linea = crudo.split(/El (dato|valor)/i)[0].replace(/\\*/g, ' ').replace(/\\s+/g, ' ').trim();
    if (linea.length > 40) continue;
    if (!re.test(linea)) continue;
    if (reEx && reEx.test(linea)) continue;
    const labR = lab.getBoundingClientRect();
    const inputEsLink = (el) => {
      if (!el) return false;
      if ((el.type || '').toLowerCase() === 'url') return true;
      let n = el;
      for (let i = 0; i < 5 && n; i++) {
        const t = (n.innerText || '').split('\\n')[0].replace(/\\*/g, ' ').trim();
        if (/^Link$|^Enlace$|^URL$/i.test(t) && t.length < 20) return true;
        n = n.parentElement;
      }
      return false;
    };
    let input = null;
    const htmlFor = lab.getAttribute && lab.getAttribute('for');
    if (htmlFor) input = document.getElementById(htmlFor);
    if (!esControl(input) || inputEsLink(input)) {
      const box = lab.closest('[class*="field"], [class*="Field"], [class*="form"], [class*="Form"], li, section, div');
      if (box) {
        const cand = Array.from(box.querySelectorAll('input, textarea, select, [contenteditable="true"], [role="combobox"], [role="textbox"]'))
          .filter(esControl)
          .filter((el) => !inputEsLink(el))
          .filter((el) => el.getBoundingClientRect().top >= labR.top - 12);
        cand.sort((a, b) => Math.abs(a.getBoundingClientRect().top - labR.bottom) - Math.abs(b.getBoundingClientRect().top - labR.bottom));
        input = cand[0] || null;
      }
    }
    if (!esControl(input)) {
      let sib = lab.nextElementSibling;
      for (let i = 0; i < 6 && sib && !esControl(input); i++) {
        if (esControl(sib)) input = sib;
        else input = Array.from(sib.querySelectorAll('input, textarea, select')).find(esControl) || null;
        sib = sib.nextElementSibling;
      }
    }
    if (!esControl(input) || seen.has(input)) continue;
    if (inputEsLink(input) && /link|enlace|url/i.test(excluir || '')) continue;
    seen.add(input);
    input.setAttribute('data-crc-label-hit', String(n));
    n += 1;
  }
  return n;
}"""

JS_MARCAR_CAMPOS_TAG = """() => {
  document.querySelectorAll('[data-crc-tag-hit]').forEach((el) => el.removeAttribute('data-crc-tag-hit'));
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const visibles = (el) => {
    if (!el) return false;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.left >= 40;
  };
  const esControl = (el) => {
    if (!el || !visibles(el)) return false;
    const tag = (el.tagName || '').toLowerCase();
    const tipo = (el.type || 'text').toLowerCase();
    if (tipo === 'url') return false;
    if (tag === 'textarea') return true;
    if (tag === 'input') return !['hidden', 'checkbox', 'radio', 'file', 'submit', 'button'].includes(tipo);
    return el.getAttribute('contenteditable') === 'true' || (el.getAttribute('role') || '') === 'textbox';
  };
  const lineaDe = (el) => clean((el.innerText || el.textContent || '')).split(' El dato')[0].replace(/\\*/g, ' ').trim();
  const esLabelTag = (el) => {
    const linea = lineaDe(el).split('\\n')[0].trim();
    return /^Tag$/i.test(linea) && linea.length < 12;
  };
  const esLabelLink = (el) => /^Link$|^Enlace$|^URL$/i.test(lineaDe(el).split('\\n')[0].trim());
  const nodos = [...document.querySelectorAll('label, legend, p, span, div, strong')]
    .filter(esLabelTag)
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  const seen = new Set();
  let n = 0;
  for (const lab of nodos) {
    const labR = lab.getBoundingClientRect();
    let input = null;
    const htmlFor = lab.getAttribute && lab.getAttribute('for');
    if (htmlFor) {
      const byId = document.getElementById(htmlFor);
      if (esControl(byId)) input = byId;
    }
    let node = lab;
    for (let i = 0; i < 8 && node && !input; i++) {
      const cand = Array.from(node.querySelectorAll('input, textarea, [role="textbox"]'))
        .filter(esControl)
        .filter((el) => !seen.has(el))
        .filter((el) => el.getBoundingClientRect().top >= labR.top - 8)
        .filter((el) => {
          const r = el.getBoundingClientRect();
          const links = [...document.querySelectorAll('label, p, span, strong')].filter(esLabelLink);
          const nextLink = links.find((l) => l.getBoundingClientRect().top > labR.bottom - 2);
          const limite = nextLink ? nextLink.getBoundingClientRect().top : labR.bottom + 90;
          return r.top - labR.bottom < 90 && r.bottom <= limite + 4 && Math.abs(r.left - labR.left) < 120;
        });
      if (cand.length) input = cand[0];
      node = node.parentElement;
    }
    if (!input || seen.has(input)) continue;
    let wrap = input.parentElement;
    let esLink = (input.type || '').toLowerCase() === 'url';
    for (let i = 0; i < 4 && wrap && !esLink; i++) {
      if ([...wrap.querySelectorAll('label, p, span, legend')].some(esLabelLink)
          && ![...wrap.querySelectorAll('label, p, span, legend')].some(esLabelTag)) {
        esLink = true;
      }
      wrap = wrap.parentElement;
    }
    if (esLink) continue;
    seen.add(input);
    input.setAttribute('data-crc-tag-hit', String(n));
    n += 1;
  }
  return n;
}"""

JS_LIMPIAR_LINKS_NO_URL = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const visibles = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.left >= 200;
  };
  const lineaDe = (el) => clean((el.innerText || '')).split(' El dato')[0].replace(/\\*/g, ' ').trim().split('\\n')[0];
  let n = 0;
  const labs = [...document.querySelectorAll('label, legend, p, span, strong')].filter((el) => /^Link$|^Enlace$|^URL$/i.test(lineaDe(el)));
  for (const lab of labs) {
    const labR = lab.getBoundingClientRect();
    let node = lab;
    let input = null;
    for (let i = 0; i < 6 && node && !input; i++) {
      input = Array.from(node.querySelectorAll('input, textarea')).find((el) => {
        if (!visibles(el)) return false;
        const r = el.getBoundingClientRect();
        return r.top >= labR.top - 8 && r.top - labR.bottom < 90;
      }) || null;
      node = node.parentElement;
    }
    if (!input) continue;
    const val = String(input.value || '').trim();
    if (!val) continue;
    if (/^https?:\\/\\//i.test(val) || /\\.[a-z]{2,}(\\/|$)/i.test(val)) continue;
    const proto = HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    const tracker = input._valueTracker;
    if (tracker && tracker.setValue) tracker.setValue(val);
    if (desc && desc.set) desc.set.call(input, '');
    else input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    n += 1;
  }
  return n;
}"""

JS_CONTAR_ITEMS_FORMULARIO = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const nums = new Set();
  for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,p,div,legend,span')) {
    const linea = clean(el.innerText || '').split('\\n')[0];
    const m = linea.match(/^formulario ítem\\s+(\\d+)$/i);
    if (m && linea.length < 40) nums.add(m[1]);
  }
  return nums.size;
}"""

JS_CRC_LABELS_TAG_LINK = """function crcLabelsTagLink() {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const lineaDe = (el) => clean((el.innerText || el.textContent || '')).split(/El (dato|valor)/i)[0].replace(/\\*/g, ' ').trim();
  const esCorto = (el, re) => {
    const linea = lineaDe(el);
    const primera = linea.split(/\\s+Dale/i)[0].trim();
    return (re.test(primera) || re.test(linea)) && primera.length < 20;
  };
  const uniq = (els) => {
    const seen = [];
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4 || r.left < 40) continue;
      if (seen.some((o) => Math.abs(o.getBoundingClientRect().top - r.top) < 6 && Math.abs(o.getBoundingClientRect().left - r.left) < 6)) continue;
      seen.push(el);
    }
    return seen.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  };
  const tags = uniq([...document.querySelectorAll('label, legend, p, span, strong, div')].filter((el) => esCorto(el, /^Tag$/i)));
  const links = uniq([...document.querySelectorAll('label, legend, p, span, strong, div')].filter((el) => esCorto(el, /^Link$|^Enlace$|^URL$/i)));
  return { tags, links };
}
function crcCabezalesItem() {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const map = new Map();
  for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,p,div,legend,span,button,[role="button"]')) {
    const linea = clean(el.innerText || '').split('\\n')[0];
    const m = linea.match(/^formulario ítem\\s+(\\d+)$/i);
    if (!m || linea.length > 40) continue;
    const num = parseInt(m[1], 10);
    const r = el.getBoundingClientRect();
    if (r.left < 40 || r.width < 16 || r.height < 8) continue;
    const prev = map.get(num);
    if (!prev || r.height < prev.getBoundingClientRect().height) map.set(num, el);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
}
function crcBandaTag(indice) {
  const { tags, links } = crcLabelsTagLink();
  const lab = tags[indice];
  if (!lab) return null;
  const labR = lab.getBoundingClientRect();
  const link = links.find((l) => l.getBoundingClientRect().top > labR.bottom - 2);
  const linkTop = link ? link.getBoundingClientRect().top : labR.bottom + 52;
  return { lab, labR, link, top: labR.bottom + 4, bottom: linkTop - 2, left: labR.left };
}
function crcInputEnBanda(banda) {
  if (!banda) return null;
  const els = [...document.querySelectorAll('input, textarea, [role="textbox"], [contenteditable="true"]')];
  const hits = els.filter((el) => {
    const r = el.getBoundingClientRect();
    const tipo = (el.type || 'text').toLowerCase();
    if (['hidden', 'checkbox', 'radio', 'file', 'url', 'submit', 'button'].includes(tipo)) return false;
    if (r.left < 200 || r.width < 8 || r.height < 8) return false;
    return r.top >= banda.labR.top && r.bottom <= banda.bottom + 8;
  });
  hits.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  return hits[0] || null;
}
function crcEsCajaTexto(el) {
  if (!el) return false;
  try {
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') return false;
  } catch (e) {}
  const r = el.getBoundingClientRect();
  if (r.width < 8 || r.height < 8 || r.left < 40) return false;
  const tag = (el.tagName || '').toLowerCase();
  const role = (el.getAttribute('role') || '').toLowerCase();
  const tipo = (el.type || 'text').toLowerCase();
  if (['hidden', 'checkbox', 'radio', 'file', 'submit', 'button', 'range'].includes(tipo)) return false;
  if (tag === 'textarea' || tag === 'input') return true;
  if (el.getAttribute && el.getAttribute('contenteditable') === 'true') return true;
  if (role === 'textbox' || role === 'searchbox') return true;
  return false;
}
function crcDeepAll(sel, root) {
  const out = [];
  const walk = (node) => {
    if (!node || !node.querySelectorAll) return;
    out.push(...node.querySelectorAll(sel));
    node.querySelectorAll('*').forEach((n) => { if (n.shadowRoot) walk(n.shadowRoot); });
  };
  walk(root || document);
  return out;
}
function crcEsLinkCaja(el) {
  if (!el) return false;
  if ((el.type || '').toLowerCase() === 'url') return true;
  const nombre = [
    el.getAttribute && el.getAttribute('name'),
    el.getAttribute && el.getAttribute('aria-label'),
    el.getAttribute && el.getAttribute('placeholder'),
  ].filter(Boolean).join(' ');
  if (/\\b(link|url|href|enlace)\\b/i.test(nombre)) return true;
  const r = el.getBoundingClientRect();
  const labs = crcDeepAll('label, legend, p, span, strong', document);
  return labs.some((l) => {
    const linea = (l.innerText || '').replace(/\\s+/g, ' ').replace(/\\*/g, ' ').split(/El (dato|valor)/i)[0].trim();
    const primera = linea.split(/\\s+Dale/i)[0].trim();
    if (!/^Link$|^Enlace$|^URL$/i.test(primera) || primera.length > 20) return false;
    const b = l.getBoundingClientRect();
    return r.top >= b.top - 8 && r.top - b.bottom < 90 && Math.abs(r.left - b.left) < 80;
  });
}
function crcCajasDelItem(indice) {
  const heads = crcCabezalesItem();
  const h = heads[indice];
  if (!h) return { tag: null, link: null, n: 0, reason: 'sin-cabezal', heads: heads.length };
  const next = heads[indice + 1];
  const hR = h.getBoundingClientRect();
  const limit = next ? next.getBoundingClientRect().top - 2 : hR.bottom + 520;
  const enRango = (el) => {
    const r = el.getBoundingClientRect();
    return r.top >= hR.bottom - 8 && r.top < limit && crcEsCajaTexto(el);
  };
  const uniqSort = (els) => {
    const out = [];
    for (const el of els) {
      if (!el || out.includes(el)) continue;
      out.push(el);
    }
    out.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    return out;
  };
  let cajas = [];
  let box = h.parentElement;
  for (let i = 0; i < 12 && box; i++) {
    const cand = uniqSort(
      crcDeepAll('input, textarea, [role="textbox"], [contenteditable="true"]', box).filter(enRango)
    );
    if (cand.length) { cajas = cand; break; }
    box = box.parentElement;
  }
  if (!cajas.length) {
    cajas = uniqSort(
      crcDeepAll('input, textarea, [role="textbox"], [contenteditable="true"]', document).filter(enRango)
    );
  }
  const tag = cajas.find((el) => !crcEsLinkCaja(el)) || null;
  const link = cajas.find((el) => el !== tag && crcEsLinkCaja(el)) || cajas.find((el) => el !== tag) || null;
  return { tag, link, n: cajas.length, reason: tag ? 'ok' : 'sin-caja' };
}
function crcLineaCorta(el) {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  return clean((el.innerText || el.textContent || '')).split(/El (dato|valor)/i)[0].replace(/\\*/g, ' ').trim().split('\\n')[0];
}
function crcTodosCabezalesItem() {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const out = [];
  for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,p,div,legend,span,button,[role="button"]')) {
    const linea = clean(el.innerText || '').split('\\n')[0];
    if (!/^formulario ítem\\s+\\d+$/i.test(linea) || linea.length > 40) continue;
    const r = el.getBoundingClientRect();
    if (r.left < 40 || r.width < 16 || r.height < 8) continue;
    if (out.some((o) => Math.abs(o.getBoundingClientRect().top - r.top) < 8 && Math.abs(o.getBoundingClientRect().left - r.left) < 8)) continue;
    out.push(el);
  }
  return out.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
}
function crcEtiquetaIngrediente(el) {
  return crcLineaCorta(el).split(/\\s+Dale/i)[0].trim();
}
function crcEsLabelIngredienteExacto(el) {
  if (!/^Ingrediente$/i.test(crcEtiquetaIngrediente(el))) return false;
  const r = el.getBoundingClientRect();
  if (r.width < 4 || r.height < 4 || r.left < 40) return false;
  if (r.width * r.height > 12000) return false;
  return true;
}
function crcInputDeLabelIng(lab) {
  const labR = lab.getBoundingClientRect();
  const htmlFor = lab.getAttribute && lab.getAttribute('for');
  if (htmlFor) {
    const el = document.getElementById(htmlFor);
    if (crcEsCajaTexto(el)) return el;
  }
  let node = lab;
  for (let i = 0; i < 8 && node; i++) {
    const hit = crcDeepAll('input, textarea, [role="textbox"]', node).find((c) => {
      if (!crcEsCajaTexto(c)) return false;
      const r = c.getBoundingClientRect();
      return r.top >= labR.top - 8 && r.top < labR.bottom + 90;
    });
    if (hit) return hit;
    node = node.parentElement;
  }
  return null;
}
function crcCajasIngrediente() {
  const labs = crcDeepAll('label, legend, p, span, strong', document)
    .filter(crcEsLabelIngredienteExacto)
    .sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const aa = ar.width * ar.height;
      const ba = br.width * br.height;
      if (Math.abs(ar.top - br.top) < 8) return aa - ba;
      return ar.top - br.top;
    });
  const seen = new Set();
  const out = [];
  for (const lab of labs) {
    const el = crcInputDeLabelIng(lab);
    if (!el || seen.has(el)) continue;
    seen.add(el);
    out.push({ lab, el });
  }
  out.sort((a, b) => a.lab.getBoundingClientRect().top - b.lab.getBoundingClientRect().top);
  return out;
}
function crcCabezalSobreCaja(el) {
  if (!el) return null;
  const top = el.getBoundingClientRect().top;
  const heads = crcTodosCabezalesItem().filter((h) => h.getBoundingClientRect().bottom <= top + 8);
  return heads.length ? heads[heads.length - 1] : null;
}
function crcEsCabezalIngrediente(h) {
  return crcCajasIngrediente().some((c) => crcCabezalSobreCaja(c.el) === h);
}
function crcCabezalesIngrediente() {
  const heads = [];
  const seen = new Set();
  for (const c of crcCajasIngrediente()) {
    const h = crcCabezalSobreCaja(c.el) || c.lab;
    if (seen.has(h)) continue;
    seen.add(h);
    heads.push(h);
  }
  return heads;
}
function crcCercaTituloSeccion(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return crcDeepAll('label, legend, p, span, strong', document).some((l) => {
    if (!/^Título de la sección$/i.test(crcEtiquetaIngrediente(l))) return false;
    const b = l.getBoundingClientRect();
    return r.top >= b.top - 8 && r.top < b.bottom + 90;
  });
}
function crcInputsIngredienteVisibles() {
  const via = crcCajasIngrediente();
  if (via.length) return via.map((c) => c.el);
  const inputs = crcDeepAll('input, textarea, [role="textbox"]', document).filter((el) => {
    if (!crcEsCajaTexto(el) || crcEsLinkCaja(el)) return false;
    const tipo = (el.type || 'text').toLowerCase();
    if (['checkbox', 'radio', 'hidden', 'file'].includes(tipo)) return false;
    if (crcCercaTituloSeccion(el)) return false;
    return true;
  });
  inputs.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  return inputs;
}
function crcCercaTituloLista(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return crcDeepAll('label, legend, p, span, strong', document).some((l) => {
    const t = crcEtiquetaIngrediente(l);
    if (!/^Título$/i.test(t) && !/^Título de la sección$/i.test(t)) return false;
    const b = l.getBoundingClientRect();
    return r.top >= b.top - 8 && r.top < b.bottom + 90;
  });
}
function crcInputsInstruccionVisibles() {
  const inputs = crcDeepAll('input, textarea, [role="textbox"]', document).filter((el) => {
    if (!crcEsCajaTexto(el) || crcEsLinkCaja(el)) return false;
    const tipo = (el.type || 'text').toLowerCase();
    if (['checkbox', 'radio', 'hidden', 'file'].includes(tipo)) return false;
    if (crcCercaTituloLista(el) || crcCercaTituloSeccion(el)) return false;
    return true;
  });
  inputs.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  return inputs;
}
function crcExpandirTodosItems() {
  let clicks = 0;
  const clickHead = (h) => {
    let exp = h.closest && h.closest('[aria-expanded]');
    if (!exp) {
      let n = h;
      for (let i = 0; i < 8 && n && !exp; i++) {
        if (n.getAttribute && n.getAttribute('aria-expanded') != null) exp = n;
        else exp = n.querySelector && n.querySelector('[aria-expanded]');
        n = n.parentElement;
      }
    }
    const ya = exp && String(exp.getAttribute('aria-expanded') || '') === 'true';
    if (ya) return;
    const chevron = (exp && exp.querySelector && exp.querySelector('[class*="chevron"], [class*="arrow"], svg')) || null;
    try { (exp || h).click(); clicks += 1; } catch (e) {}
    if (chevron && chevron !== exp) { try { chevron.click(); clicks += 1; } catch (e) {} }
    if (!exp) { try { h.click(); } catch (e) {} }
  };
  for (const h of crcTodosCabezalesItem()) clickHead(h);
  for (const el of document.querySelectorAll('[aria-expanded="false"]')) {
    const r = el.getBoundingClientRect();
    if (r.left < 40 || r.width < 8 || r.height < 8) continue;
    try { el.click(); clicks += 1; } catch (e) {}
  }
  return {
    clicks,
    heads: crcTodosCabezalesItem().length,
    cajas: crcInputsIngredienteVisibles().length,
    inst: crcInputsInstruccionVisibles().length,
  };
}"""

JS_MARCAR_TAGS_POR_ITEM = (
    "() => {\n"
    + JS_CRC_LABELS_TAG_LINK
    + """
  document.querySelectorAll('[data-crc-tag-hit]').forEach((el) => el.removeAttribute('data-crc-tag-hit'));
  let n = 0;
  const heads = crcCabezalesItem();
  for (let i = 0; i < heads.length; i++) {
    const c = crcCajasDelItem(i);
    if (c && c.tag) {
      c.tag.setAttribute('data-crc-tag-hit', String(n));
      n += 1;
    }
  }
  return n;
}"""
)

JS_EXPANDIR_ITEM_FORMULARIO = (
    "(indice) => {\n"
    + JS_CRC_LABELS_TAG_LINK
    + """
  const heads = crcCabezalesItem();
  const h = heads[indice];
  if (!h) return { ok: false, n: heads.length, reason: 'sin-cabezal' };
  let exp = h.closest && h.closest('[aria-expanded]');
  if (!exp) {
    let n = h;
    for (let i = 0; i < 8 && n && !exp; i++) {
      if (n.getAttribute && n.getAttribute('aria-expanded') != null) exp = n;
      else exp = n.querySelector && n.querySelector('[aria-expanded]');
      n = n.parentElement;
    }
  }
  const ya = exp && String(exp.getAttribute('aria-expanded') || '') === 'true';
  if (!ya) {
    const chevron = (exp && exp.querySelector && exp.querySelector('[class*="chevron"], [class*="arrow"], svg')) || null;
    try { (exp || h).click(); } catch (e) {}
    if (chevron && chevron !== exp) { try { chevron.click(); } catch (e) {} }
    try { h.click(); } catch (e) {}
  }
  return { ok: true, n: heads.length, expanded: true };
}"""
)

JS_EXPANDIR_ITEM_INGREDIENTE = (
    "(indice) => {\n"
    + JS_CRC_LABELS_TAG_LINK
    + """
  const heads = crcCabezalesIngrediente();
  const h = heads[indice];
  if (!h) return { ok: false, n: heads.length, reason: 'sin-cabezal-ing' };
  let exp = h.closest && h.closest('[aria-expanded]');
  if (!exp) {
    let n = h;
    for (let i = 0; i < 8 && n && !exp; i++) {
      if (n.getAttribute && n.getAttribute('aria-expanded') != null) exp = n;
      else exp = n.querySelector && n.querySelector('[aria-expanded]');
      n = n.parentElement;
    }
  }
  const ya = exp && String(exp.getAttribute('aria-expanded') || '') === 'true';
  if (!ya) {
    const chevron = (exp && exp.querySelector && exp.querySelector('[class*="chevron"], [class*="arrow"], svg')) || null;
    try { (exp || h).click(); } catch (e) {}
    if (chevron && chevron !== exp) { try { chevron.click(); } catch (e) {} }
    try { h.click(); } catch (e) {}
  }
  return { ok: true, n: heads.length, expanded: true };
}"""
)

JS_CLICK_AGREGAR_INGREDIENTE = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const btns = [...document.querySelectorAll('button, [role="button"], a')].filter((el) => {
    const t = clean(el.innerText || '');
    const r = el.getBoundingClientRect();
    return /agregar nuevo [ií]tem/i.test(t) && r.width > 8 && r.height > 8 && r.left >= 40;
  });
  btns.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  if (!btns.length) return false;
  const btn = btns[0];
  btn.click();
  return btns.length >= 2 ? 'interno' : 'unico';
}"""

JS_CONTAR_INGREDIENTES_INTERNOS = (
    "() => {\n"
    + JS_CRC_LABELS_TAG_LINK
    + """
  return crcInputsIngredienteVisibles().length;
}"""
)

JS_EXPANDIR_TODOS_ITEMS = (
    "() => {\n"
    + JS_CRC_LABELS_TAG_LINK
    + """
  return crcExpandirTodosItems();
}"""
)

JS_RESOLVER_BORRADOR = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const cuerpo = (document.body && document.body.innerText) || '';
  if (!/tienes un borrador/i.test(cuerpo)) return false;
  const cajas = [...document.querySelectorAll('div, section, aside, p, span')].filter((el) => {
    const t = clean(el.innerText || '');
    return /tienes un borrador/i.test(t) && t.length < 240;
  });
  cajas.sort((a, b) => clean(a.innerText || '').length - clean(b.innerText || '').length);
  const box = cajas[0] || document.body;
  const nodos = [...box.querySelectorAll('button, [role="button"], a, span, i, svg')];
  const textoDe = (el) => clean(
    (el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('title') || '')) + ' ' + (el.innerText || el.textContent || '')
  );
  const ok = nodos.find((el) => {
    const t = textoDe(el);
    return /retomar|resume|aceptar|aplicar/i.test(t) || /^(✓|✔|☑)$/.test(t);
  });
  if (ok) {
    (ok.closest('button, [role="button"], a') || ok).click();
    return 'retomar';
  }
  const icons = nodos.filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 6 && r.height > 6 && r.width < 52 && r.height < 52;
  });
  if (icons[0]) { icons[0].click(); return 'icono'; }
  return false;
}"""

JS_ACTIVAR_HTML_PASO = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const textoDe = (el) => clean(
    (el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('title') || '')) + ' ' + (el.innerText || el.textContent || '')
  );
  const visibles = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 6 && r.height > 6 && r.left >= 20;
  };
  const nodos = [...document.querySelectorAll('label, span, div, p, button, [role="switch"], [role="checkbox"]')].filter(visibles);
  const lab = nodos.find((el) => {
    const t = clean((el.innerText || '').split('\\n')[0]);
    return /html\\s*\\+\\s*script/i.test(t) && t.length < 48;
  });
  let via = '';
  if (lab) {
    const box = lab.closest('label, div, span') || lab;
    const sw = box.querySelector('input[type="checkbox"], [role="switch"], [role="checkbox"]')
      || (lab.parentElement && lab.parentElement.querySelector('input[type="checkbox"], [role="switch"]'));
    if (sw) {
      const on = !!(sw.checked || sw.getAttribute('aria-checked') === 'true' || sw.classList.contains('checked') || sw.classList.contains('active'));
      if (!on) { sw.click(); via = 'toggle'; }
      else via = 'ya-on';
    } else {
      lab.click();
      via = 'label';
    }
  }
  const code = [...document.querySelectorAll('button, [role="button"], span, i, a')].filter(visibles).find((el) => {
    const t = textoDe(el);
    return /source|c[oó]digo|html source|source code/i.test(t) || t.includes('</>') || t === '</>' || t === '<>';
  });
  if (code) { code.click(); via = via ? via + '+source' : 'source'; }
  return via || false;
}"""

JS_LEER_INGREDIENTE = (
    "(indice) => {\n"
    + JS_CRC_LABELS_TAG_LINK
    + """
  const hit = document.querySelector('[data-crc-ing-hit=\"' + String(indice) + '\"]');
  if (hit) return { ok: true, value: String(hit.value || hit.textContent || '') };
  return { ok: false, value: '' };
}"""
)


JS_FILL_INDEX = """([index, value]) => {
  const els = [...document.querySelectorAll('input, textarea, select, [contenteditable="true"]')].filter((el) => {
    if (el.type === 'hidden' || el.type === 'password' || el.disabled) return false;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.left >= 240 && (r.width > 0 || r.height > 0);
  });
  const el = els[index];
  if (!el) return false;
  const v = String(value);
  if ((el.tagName || '').toLowerCase() === 'select') {
    const opt = [...el.options].find((o) => (o.text || '').trim() === v || o.value === v);
    if (opt) el.value = opt.value;
    else el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  const proto = (el.tagName || '').toLowerCase() === 'textarea' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const desc = Object.getOwnPropertyDescriptor(proto, 'value');
  const last = el.value;
  const tracker = el._valueTracker;
  if (tracker && tracker.setValue) tracker.setValue(last == null ? '' : String(last));
  if (desc && desc.set) desc.set.call(el, v);
  else if (el.getAttribute('contenteditable') === 'true') el.textContent = v;
  else el.value = v;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}"""


def _leer_valor(loc) -> str | None:
    """Lee input_value. None = no se pudo leer (no inventar con evaluate)."""
    try:
        if hasattr(loc, "input_value"):
            return (loc.input_value() or "").strip()
    except Exception:
        return None
    return None


def _valor_quedo(leido: str | None, esperado: str) -> bool:
    if leido is None:
        return True
    bajo = leido.lower().strip()
    if not leido or bajo in {"dale un valor", "ingresa un valor", "ingresa"}:
        return False
    exp = (esperado or "").strip()
    if not exp:
        return False
    if bajo == exp.lower():
        return True
    try:
        return float(bajo.replace(",", ".")) == float(exp.replace(",", "."))
    except ValueError:
        pass
    # «0» no es un prefijo válido de «30»; el texto largo sí puede contener el esperado.
    return exp.lower() in bajo and len(bajo) >= len(exp) * 0.5


# HTML crudo (Paso a Paso): nunca textContent ni entidades &lt;p&gt;.
JS_CRC_SET_HTML = """function crcPareceHtml(s) {
  s = String(s || '');
  return /<(p|strong|ul|li|ol|br|em|h[1-6]|div|b|i)\\b/i.test(s);
}
function crcHtmlTieneTagsReales(s) {
  s = String(s || '');
  if (!s) return false;
  if (/&lt;(p|strong|ul|li)\\b/i.test(s) && !/<(p|strong|ul|li)\\b/i.test(s)) return false;
  return /<(p|strong|ul|li|ol|br|em|h[1-6]|div|b|i)\\b/i.test(s);
}
function crcLeerHtml(el) {
  if (!el) return '';
  const tag = (el.tagName || '').toLowerCase();
  if (tag === 'textarea' || tag === 'input') return String(el.value || '');
  const ce = el.getAttribute && el.getAttribute('contenteditable');
  if (ce && ce !== 'false' && ce !== 'plaintext-only') return String(el.innerHTML || '');
  if (el.isContentEditable) return String(el.innerHTML || '');
  return String(el.value || el.innerHTML || '');
}
function crcSetHtmlEditors(html) {
  html = String(html || '');
  try {
    const tm = window.tinymce || window.tinyMCE;
    if (tm) {
      const eds = tm.editors || [];
      for (let i = 0; i < eds.length; i++) {
        if (eds[i] && eds[i].setContent) {
          eds[i].setContent(html);
          return { ok: true, wrote: String((eds[i].getContent && eds[i].getContent()) || html), via: 'tinymce' };
        }
      }
    }
  } catch (e) {}
  try {
    if (window.CKEDITOR && window.CKEDITOR.instances) {
      for (const name in window.CKEDITOR.instances) {
        const ed = window.CKEDITOR.instances[name];
        if (ed && ed.setData) {
          ed.setData(html);
          return { ok: true, wrote: String((ed.getData && ed.getData()) || html), via: 'ckeditor' };
        }
      }
    }
  } catch (e) {}
  return null;
}
function crcSetHtml(el, html) {
  if (!el) return '';
  html = String(html);
  const tag = (el.tagName || '').toLowerCase();
  try { el.focus(); } catch (e) {}
  try {
    const tm = window.tinymce || window.tinyMCE;
    const id = el.id || '';
    const ed = tm && tm.get && id ? tm.get(id) : null;
    if (ed && ed.setContent) {
      ed.setContent(html);
      return String((ed.getContent && ed.getContent()) || html);
    }
  } catch (e) {}
  if (tag === 'textarea' || tag === 'input') {
    const proto = tag === 'textarea' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    const last = el.value;
    const tracker = el._valueTracker;
    if (tracker && tracker.setValue) tracker.setValue(last == null ? '' : String(last));
    if (desc && desc.set) desc.set.call(el, html);
    else el.value = html;
    try {
      el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, data: html, inputType: 'insertFromPaste' }));
    } catch (e) {}
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return String(el.value || '');
  }
  const ce = el.getAttribute && el.getAttribute('contenteditable');
  if ((ce && ce !== 'false' && ce !== 'plaintext-only') || el.isContentEditable) {
    try { el.innerHTML = html; } catch (e) { return ''; }
    try {
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste', data: html }));
    } catch (e) {
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return String(el.innerHTML || '');
  }
  return '';
}
"""

# React 16/17: fill() de Playwright no actualiza el state; hay que pasar por el setter nativo + _valueTracker.
JS_CRC_SET_REACT = JS_CRC_SET_HTML + """function crcSetReact(el, v) {
  if (!el) return '';
  v = String(v);
  if (crcPareceHtml(v)) return crcSetHtml(el, v);
  const tag = (el.tagName || '').toLowerCase();
  try { el.focus(); } catch (e) {}
  if (tag === 'select') {
    const opt = [...el.options].find((o) => (o.text || '').trim() === v || o.value === v);
    el.value = opt ? opt.value : v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return String(el.value || '');
  }
  if (el.getAttribute && el.getAttribute('contenteditable') === 'true') {
    el.textContent = v;
    el.dispatchEvent(new InputEvent('input', { bubbles: true, data: v, inputType: 'insertText' }));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return String(el.textContent || '');
  }
  const proto = tag === 'textarea' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const desc = Object.getOwnPropertyDescriptor(proto, 'value');
  const last = el.value;
  const tracker = el._valueTracker;
  if (tracker && tracker.setValue) tracker.setValue(last == null ? '' : String(last));
  if (desc && desc.set) desc.set.call(el, v);
  else el.value = v;
  const ev = new Event('input', { bubbles: true });
  ev.simulated = true;
  try {
    el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, data: v, inputType: 'insertText' }));
  } catch (e) {}
  el.dispatchEvent(ev);
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return String(el.value != null ? el.value : (el.textContent || ''));
}"""

JS_ESCRIBIR_TITULO_LISTA = (
    "(valor) => {\n"
    + JS_CRC_SET_REACT
    + "\n"
    + JS_CRC_LABELS_TAG_LINK
    + """
  const v = String(valor || '');
  const labs = crcDeepAll('label, legend, p, span, strong', document).filter((el) => {
    const t = crcEtiquetaIngrediente(el);
    const r = el.getBoundingClientRect();
    return /^Título$/i.test(t) && r.width > 4 && r.height > 4 && r.left >= 20;
  });
  labs.sort((a, b) => (a.getBoundingClientRect().width * a.getBoundingClientRect().height) - (b.getBoundingClientRect().width * b.getBoundingClientRect().height));
  const lab = labs[0];
  let el = crcInputDeLabelIng(lab);
  if (!el) {
    el = crcDeepAll('input, textarea, [role="textbox"]', document).find((c) => {
      if (!crcEsCajaTexto(c)) return false;
      return crcCercaTituloLista(c);
    }) || null;
  }
  if (!el) return { ok: false, reason: 'sin-titulo' };
  const wrote = crcSetReact(el, v);
  return { ok: true, wrote };
}"""
)

JS_ESCRIBIR_PASO_HTML = (
    "(html) => {\n"
    + JS_CRC_SET_REACT
    + "\n"
    + JS_CRC_LABELS_TAG_LINK
    + """
  const v = String(html || '');
  const eds = crcSetHtmlEditors(v);
  if (eds && crcHtmlTieneTagsReales(eds.wrote)) return Object.assign(eds, { tags: true });
  const esPaso = (t) => /^Paso a [Pp]aso$/i.test(t) || /^content$/i.test(t);
  const labs = crcDeepAll('label, legend, p, span, strong, h3, h4', document).filter((el) => {
    const t = crcEtiquetaIngrediente(el);
    const r = el.getBoundingClientRect();
    return esPaso(t) && r.width > 4 && r.height > 4 && r.left >= 20;
  });
  const lab = labs.sort((a, b) => (a.getBoundingClientRect().width * a.getBoundingClientRect().height) - (b.getBoundingClientRect().width * b.getBoundingClientRect().height))[0];
  const labR = lab ? lab.getBoundingClientRect() : { top: 0, bottom: 200 };
  let ta = null;
  if (lab) {
    const htmlFor = lab.getAttribute && lab.getAttribute('for');
    if (htmlFor) {
      const byId = document.getElementById(htmlFor);
      if (byId && (byId.tagName || '').toLowerCase() === 'textarea') ta = byId;
    }
    if (!ta) {
      let node = lab;
      for (let i = 0; i < 8 && node && !ta; i++) {
        const hit = crcDeepAll('textarea', node).find((c) => !crcCercaTituloLista(c));
        if (hit) ta = hit;
        node = node.parentElement;
      }
    }
  }
  if (!ta) {
    const textareas = crcDeepAll('textarea', document).filter((c) => {
      if (crcCercaTituloLista(c)) return false;
      const r = c.getBoundingClientRect();
      try {
        const st = getComputedStyle(c);
        if (st.display === 'none' || st.visibility === 'hidden' || c.hidden) return !!lab;
      } catch (e) {}
      return r.left >= 20 && r.top >= labR.top - 20;
    });
    if (textareas.length) ta = textareas[textareas.length - 1];
  }
  const enSeccionPaso = (c) => {
    if (!lab) return false;
    let node = lab;
    for (let i = 0; i < 8 && node; i++) {
      if (node.contains && node !== lab && node.contains(c)) return true;
      node = node.parentElement;
    }
    return false;
  };
  const ce = crcDeepAll('[contenteditable="true"], [role="textbox"]', document).find((c) => {
    if (crcCercaTituloLista(c)) return false;
    if (enSeccionPaso(c)) return true;
    const r = c.getBoundingClientRect();
    return r.width > 20 && r.height > 12 && r.left >= 20 && r.top >= labR.top - 20;
  }) || null;
  if (!ta && !ce) {
    for (const ifr of document.querySelectorAll('iframe')) {
      try {
        const doc = ifr.contentDocument;
        const body = doc && doc.body;
        if (body && (body.getAttribute('contenteditable') === 'true' || doc.designMode === 'on')) {
          body.innerHTML = v;
          const wrote = String(body.innerHTML || '');
          return { ok: crcHtmlTieneTagsReales(wrote), wrote, via: 'iframe', tags: crcHtmlTieneTagsReales(wrote) };
        }
        const ifTa = doc && doc.querySelector('textarea');
        if (ifTa) {
          const wrote = crcSetHtml(ifTa, v);
          return { ok: crcHtmlTieneTagsReales(wrote), wrote, via: 'iframe-ta', tags: crcHtmlTieneTagsReales(wrote) };
        }
      } catch (e) {}
    }
  }
  if (!ta && !ce) return { ok: false, reason: 'sin-paso', wrote: '', tags: false };
  let wrote = '';
  let via = '';
  if (ta) { wrote = crcSetHtml(ta, v); via = 'ta'; }
  if (ce) {
    const wce = crcSetHtml(ce, v);
    via = via ? via + '+ce' : 'ce';
    if (!wrote) wrote = wce;
  }
  const tags = crcHtmlTieneTagsReales(wrote);
  return { ok: tags, wrote, via, tags };
}"""
)

JS_CONTAR_INSTRUCCIONES_INTERNAS = (
    "() => {\n"
    + JS_CRC_LABELS_TAG_LINK
    + """
  return crcInputsInstruccionVisibles().length;
}"""
)

JS_FOCO_INSTRUCCION = (
    "(args) => {\n"
    + JS_CRC_SET_REACT
    + "\n"
    + JS_CRC_LABELS_TAG_LINK
    + """
  const indice = args.indice;
  const valor = args.valor == null ? '' : String(args.valor);
  const cajas = crcInputsInstruccionVisibles();
  const el = cajas[indice];
  if (!el) return { ok: false, reason: 'sin-caja', n: cajas.length };
  if (el.setAttribute) el.setAttribute('data-crc-inst-hit', String(indice));
  try { el.click(); } catch (e) {}
  try { el.focus(); } catch (e) {}
  const wrote = valor ? crcSetReact(el, valor) : '';
  return { ok: true, wrote, n: cajas.length };
}"""
)

JS_FOCO_INGREDIENTE = (
    "(args) => {\n"
    + JS_CRC_SET_REACT
    + "\n"
    + JS_CRC_LABELS_TAG_LINK
    + """
  const indice = args.indice;
  const valor = args.valor == null ? '' : String(args.valor);
  const cajas = crcInputsIngredienteVisibles();
  const el = cajas[indice];
  if (!el) return { ok: false, reason: 'sin-caja', n: cajas.length };
  if (el.setAttribute) el.setAttribute('data-crc-ing-hit', String(indice));
  try { el.click(); } catch (e) {}
  try { el.focus(); } catch (e) {}
  const wrote = valor ? crcSetReact(el, valor) : '';
  return { ok: true, wrote, n: cajas.length };
}"""
)

JS_FOCO_CAJA_TAG = (
    "(args) => {\n"
    + JS_CRC_SET_REACT
    + "\n"
    + JS_CRC_LABELS_TAG_LINK
    + """
  const indice = args.indice;
  const valor = args.valor == null ? '' : String(args.valor);
  document.querySelectorAll('[data-crc-tag-hit]').forEach((el) => {
    if (el.getAttribute('data-crc-tag-hit') === String(indice)) el.removeAttribute('data-crc-tag-hit');
  });
  let el = null;
  let via = '';
  const cajas = crcCajasDelItem(indice);
  if (cajas && cajas.tag) { el = cajas.tag; via = 'item'; }
  if (!el) {
    const banda = crcBandaTag(indice);
    el = crcInputEnBanda(banda);
    if (el) via = 'banda';
    if (!el && banda) {
      const x = banda.left + 90;
      const y = Math.max(banda.top + 10, Math.min((banda.top + banda.bottom) / 2, banda.bottom - 6));
      try { el = document.elementFromPoint(x, y); } catch (e) { el = null; }
      if (el) via = 'punto';
    }
  }
  if (!el) return { ok: false, reason: (cajas && cajas.reason) || 'sin-caja', n: (cajas && cajas.n) || 0 };
  try { el.click(); } catch (e) {}
  try { el.focus(); } catch (e) {}
  if (el.setAttribute) el.setAttribute('data-crc-tag-hit', String(indice));
  let wrote = '';
  const tag = (el.tagName || '').toLowerCase();
  const role = (el.getAttribute && el.getAttribute('role') || '').toLowerCase();
  if (valor && (tag === 'input' || tag === 'textarea' || role === 'textbox' || (el.getAttribute && el.getAttribute('contenteditable') === 'true'))) {
    wrote = crcSetReact(el, valor);
    if (String(el.value || '') !== valor) {
      try {
        el.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, valor);
        wrote = String(el.value || el.textContent || wrote || '');
      } catch (e) {}
    }
  }
  return { ok: true, tag, wrote, via, n: (cajas && cajas.n) || 0 };
}"""
)

JS_LEER_CAJA_TAG = (
    "(indice) => {\n"
    + JS_CRC_LABELS_TAG_LINK
    + """
  const cajas = crcCajasDelItem(indice);
  let el = cajas && cajas.tag;
  if (!el) el = crcInputEnBanda(crcBandaTag(indice));
  if (!el) return { ok: false, value: '' };
  return { ok: true, value: String(el.value || el.textContent || '') };
}"""
)

JS_LINK_TIENE_TEXTO = (
    "(texto) => {\n"
    + JS_CRC_LABELS_TAG_LINK
    + """
  const buscado = String(texto || '').trim().toLowerCase();
  if (!buscado) return false;
  const { links } = crcLabelsTagLink();
  for (const lab of links) {
    const labR = lab.getBoundingClientRect();
    let node = lab;
    for (let i = 0; i < 5 && node; i++) {
      const hit = Array.from(node.querySelectorAll('input, textarea')).find((el) => {
        const r = el.getBoundingClientRect();
        return r.top >= labR.top - 4 && r.top - labR.bottom < 80;
      });
      if (hit && String(hit.value || '').trim().toLowerCase() === buscado) return true;
      node = node.parentElement;
    }
  }
  return false;
}"""
)

JS_CRC_FIND_TITULO = """function crcFindTitulo() {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const visibles = (el) => {
    if (!el) return false;
    try {
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
    } catch (e) {}
    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 8 && r.left >= 200;
  };
  const deepAll = (sel) => {
    const out = [];
    const walk = (root) => {
      if (!root || !root.querySelectorAll) return;
      out.push(...root.querySelectorAll(sel));
      root.querySelectorAll('*').forEach((n) => { if (n.shadowRoot) walk(n.shadowRoot); });
    };
    walk(document);
    return out;
  };
  const esInputTexto = (el) => {
    if (!el || !visibles(el)) return false;
    const tag = (el.tagName || '').toLowerCase();
    const role = (el.getAttribute('role') || '').toLowerCase();
    const tipo = (el.type || 'text').toLowerCase();
    if (['hidden', 'checkbox', 'radio', 'file', 'submit', 'button', 'number', 'range'].includes(tipo)) return false;
    if (tag === 'textarea' || tag === 'input') return true;
    if (el.getAttribute('contenteditable') === 'true') return true;
    if (role === 'textbox' || role === 'searchbox') return true;
    return false;
  };
  const esTituloCabecera = (crudo) => {
    if (!crudo) return false;
    if (/meta\\s*t[ií]tulo|t[ií]tulo de la secci/i.test(crudo)) return false;
    const linea = crudo.split(/El dato/i)[0].replace(/\\*/g, ' ').replace(/\\s+/g, ' ').trim();
    return /^T[ií]tulo(\\s+Dale un valor)?$/i.test(linea);
  };
  const controlDesde = (lab) => {
    const htmlFor = lab.getAttribute && lab.getAttribute('for');
    if (htmlFor) {
      const byId = document.getElementById(htmlFor);
      if (esInputTexto(byId)) return byId;
    }
    const labR = lab.getBoundingClientRect();
    let node = lab;
    for (let i = 0; i < 10 && node; i++) {
      const hits = Array.from(node.querySelectorAll('input, textarea, [contenteditable="true"], [role="textbox"]'))
        .filter(esInputTexto)
        .filter((el) => el.getBoundingClientRect().top >= labR.top - 12);
      hits.sort((a, b) => {
        const da = Math.abs(a.getBoundingClientRect().top - labR.bottom);
        const db = Math.abs(b.getBoundingClientRect().top - labR.bottom);
        return da - db;
      });
      if (hits.length) return hits[0];
      node = node.parentElement;
    }
    let sib = lab.nextElementSibling;
    for (let i = 0; i < 8 && sib; i++) {
      if (esInputTexto(sib)) return sib;
      const inner = Array.from(sib.querySelectorAll('input, textarea, [role="textbox"]')).find(esInputTexto);
      if (inner) return inner;
      sib = sib.nextElementSibling;
    }
    return null;
  };
  const nodos = deepAll('label, legend, p, span, div, h2, h3, h4, h5, strong')
    .map((el) => ({ el, t: clean(el.innerText || el.textContent || '') }))
    .filter((x) => esTituloCabecera(x.t))
    .sort((a, b) => a.t.length - b.t.length);
  for (const { el: lab } of nodos) {
    const input = controlDesde(lab);
    if (input) return input;
  }
  const vacios = deepAll('input, textarea, [role="textbox"], [contenteditable="true"]').filter((el) => {
    if (!esInputTexto(el)) return false;
    const ph = (el.getAttribute('placeholder') || '').toLowerCase();
    const val = String(el.value || '').trim().toLowerCase();
    const txt = clean(el.innerText || '').toLowerCase();
    const vacio = !val || val === 'dale un valor';
    return vacio && (ph.includes('dale un valor') || txt === 'dale un valor');
  });
  vacios.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  return vacios[0] || null;
}"""

JS_ESCRIBIR_NATIVO = (
    "(el, v) => {\n"
    + JS_CRC_SET_REACT
    + "\n  return crcSetReact(el, String(v));\n}"
)

JS_ESCRIBIR_TITULO_CABECERA = (
    "(v) => {\n"
    + JS_CRC_SET_REACT
    + "\n"
    + JS_CRC_FIND_TITULO
    + """
  const el = crcFindTitulo();
  if (!el) return { ok: false, value: '' };
  const value = crcSetReact(el, String(v));
  return { ok: true, value: String(value || '') };
}"""
)

JS_LEER_TITULO_CABECERA = (
    "() => {\n"
    + JS_CRC_FIND_TITULO
    + """
  const el = crcFindTitulo();
  if (!el) return { ok: false, value: '' };
  return { ok: true, value: String(el.value || el.textContent || '') };
}"""
)

JS_MARCAR_TITULO = (
    "() => {\n"
    + JS_CRC_FIND_TITULO
    + """
  document.querySelectorAll('[data-crc-titulo]').forEach((el) => el.removeAttribute('data-crc-titulo'));
  const el = crcFindTitulo();
  if (!el) return { ok: false };
  el.setAttribute('data-crc-titulo', '1');
  try { el.click(); } catch (e) {}
  try { el.focus(); } catch (e) {}
  return { ok: true, tag: (el.tagName || '').toLowerCase() };
}"""
)

JS_CRC_FIND_NUMERO = """function crcFindNumero(patron) {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const re = new RegExp(patron, 'i');
  const visibles = (el) => {
    if (!el) return false;
    try {
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
    } catch (e) {}
    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 8 && r.left >= 200;
  };
  const esNumero = (el) => {
    if (!el || !visibles(el)) return false;
    const tag = (el.tagName || '').toLowerCase();
    const tipo = (el.type || 'text').toLowerCase();
    if (['hidden', 'checkbox', 'radio', 'file', 'submit', 'button'].includes(tipo)) return false;
    if (tag === 'input' || tag === 'textarea') return true;
    if (el.getAttribute('contenteditable') === 'true') return true;
    if ((el.getAttribute('role') || '') === 'textbox') return true;
    return false;
  };
  const esLabel = (crudo) => {
    if (!crudo || crudo.length > 80) return false;
    const linea = crudo.split(/El (dato|valor)/i)[0].replace(/\\*/g, ' ').replace(/\\s+/g, ' ').trim();
    return re.test(linea) && linea.length < 40;
  };
  const nodos = [...document.querySelectorAll('label, legend, p, span, div, h2, h3, strong')]
    .map((el) => ({ el, t: clean(el.innerText || el.textContent || '') }))
    .filter((x) => esLabel(x.t))
    .sort((a, b) => a.t.length - b.t.length);
  for (const { el: lab } of nodos) {
    const labR = lab.getBoundingClientRect();
    let node = lab;
    for (let i = 0; i < 10 && node; i++) {
      const hits = Array.from(node.querySelectorAll('input, textarea, [role="textbox"]'))
        .filter(esNumero)
        .filter((el) => el.getBoundingClientRect().top >= labR.top - 12);
      hits.sort((a, b) => Math.abs(a.getBoundingClientRect().top - labR.bottom) - Math.abs(b.getBoundingClientRect().top - labR.bottom));
      if (hits.length) return hits[0];
      node = node.parentElement;
    }
  }
  return null;
}"""

JS_ESCRIBIR_NUMERO = (
    "(args) => {\n"
    + JS_CRC_SET_REACT
    + "\n"
    + JS_CRC_FIND_NUMERO
    + """
  const el = crcFindNumero(args.patron);
  if (!el) return { ok: false, value: '' };
  const value = crcSetReact(el, String(args.valor));
  return { ok: true, value: String(value || '') };
}"""
)

JS_LEER_NUMERO = (
    "(patron) => {\n"
    + JS_CRC_FIND_NUMERO
    + """
  const el = crcFindNumero(patron);
  if (!el) return { ok: false, value: '' };
  return { ok: true, value: String(el.value || el.textContent || '') };
}"""
)

JS_MARCAR_NUMERO = (
    "(patron) => {\n"
    + JS_CRC_FIND_NUMERO
    + """
  document.querySelectorAll('[data-crc-numero]').forEach((el) => el.removeAttribute('data-crc-numero'));
  const el = crcFindNumero(patron);
  if (!el) return { ok: false };
  el.setAttribute('data-crc-numero', '1');
  try { el.click(); } catch (e) {}
  try { el.focus(); } catch (e) {}
  return { ok: true };
}"""
)


def escribir_valor(page, loc, value, *, exigir_lienzo: bool = True) -> bool:
    if loc is None or value is None or value == "":
        return False
    texto = str(value)
    if texto.strip().lower() in {"dale un valor", "ingresa un valor", "ingresa", "0"}:
        return False
    box = _bounding_box(loc)
    if exigir_lienzo and box is not None:
        try:
            if float(box.get("x") or 0) < LIENZO_MIN_X:
                print("  · No escribo en la paleta.")
                return False
        except (TypeError, ValueError):
            pass
    try:
        loc.fill(texto, timeout=3_000)
    except TypeError:
        try:
            loc.fill(texto)
        except Exception:
            pass
    except Exception:
        pass
    if _valor_quedo(_leer_valor(loc), texto):
        return True
    try:
        loc.evaluate(JS_ESCRIBIR_NATIVO, texto)
    except Exception:
        pass
    if _valor_quedo(_leer_valor(loc), texto):
        return True
    try:
        loc.click(timeout=2_000)
        if hasattr(loc, "press"):
            loc.press("Control+a")
        if hasattr(loc, "press_sequentially"):
            loc.press_sequentially(texto, delay=12)
        elif hasattr(loc, "type"):
            loc.type(texto, delay=12)
    except Exception:
        pass
    return _valor_quedo(_leer_valor(loc), texto)


def _tipear_teclado(page, loc, texto: str) -> bool:
    """Teclea de verdad: el BM React ignora fill() en Título y a veces deja Duración en 0."""
    if loc is None or not texto:
        return False
    try:
        loc.click(timeout=2_000)
    except TypeError:
        try:
            loc.click()
        except Exception:
            return False
    except Exception:
        return False
    try:
        if hasattr(loc, "press"):
            loc.press("Control+a")
            loc.press("Backspace")
    except Exception:
        pass
    kb = getattr(page, "keyboard", None)
    try:
        if kb is not None and hasattr(kb, "type"):
            kb.type(texto, delay=18)
        elif hasattr(loc, "press_sequentially"):
            loc.press_sequentially(texto, delay=18)
        elif hasattr(loc, "type"):
            loc.type(texto, delay=18)
        else:
            return False
    except Exception:
        return False
    try:
        page.wait_for_timeout(200)
    except Exception:
        pass
    return _valor_quedo(_leer_valor(loc), texto)


def _titulo_escrito_en_frame(fr, value: str) -> bool:
    try:
        out = fr.evaluate(JS_ESCRIBIR_TITULO_CABECERA, value)
    except Exception:
        return False
    if not isinstance(out, dict) or not out.get("ok"):
        return False
    if _valor_quedo(str(out.get("value") or ""), value):
        return True
    return False


def _titulo_sigue_en_frame(fr, value: str) -> bool:
    try:
        out = fr.evaluate(JS_LEER_TITULO_CABECERA)
    except Exception:
        return False
    return isinstance(out, dict) and out.get("ok") and _valor_quedo(
        str(out.get("value") or ""), value
    )


def _locators_titulo(fr) -> list:
    locs = []
    if hasattr(fr, "get_by_role"):
        try:
            locs.append(fr.get_by_role("textbox", name=re.compile(r"^T[ií]tulo", re.I)))
        except Exception:
            pass
    if hasattr(fr, "get_by_label"):
        try:
            locs.append(fr.get_by_label(re.compile(r"^T[ií]tulo", re.I)))
        except Exception:
            pass
    if hasattr(fr, "get_by_placeholder"):
        try:
            locs.append(fr.get_by_placeholder(re.compile(r"Dale un valor", re.I)))
        except Exception:
            pass
    return locs


def rellenar_titulo_cabecera(page, value) -> bool:
    """Título* vacío («Dale un valor» / dato requerido), no otro Título."""
    if not value:
        return False
    texto = str(value)
    for fr in _frames_pagina(page):
        if not _titulo_escrito_en_frame(fr, texto):
            continue
        try:
            page.wait_for_timeout(180)
        except Exception:
            pass
        if _titulo_sigue_en_frame(fr, texto):
            return True
    for fr in _frames_pagina(page):
        for loc in _locators_titulo(fr):
            try:
                n = loc.count() if hasattr(loc, "count") else 0
            except Exception:
                n = 0
            for i in range(min(n, 8)):
                item = loc.nth(i) if hasattr(loc, "nth") else loc
                box = _bounding_box(item)
                if box is not None and float(box.get("x") or 0) < LIENZO_MIN_X:
                    continue
                leido = _leer_valor(item)
                if leido and leido.lower() not in {"", "dale un valor"}:
                    continue
                if escribir_valor(page, item, texto) and _valor_quedo(_leer_valor(item), texto):
                    return True
                if _tipear_teclado(page, item, texto) and (
                    _valor_quedo(_leer_valor(item), texto) or _titulo_sigue_en_frame(fr, texto)
                ):
                    return True
    for fr in _frames_pagina(page):
        try:
            marcado = fr.evaluate(JS_MARCAR_TITULO)
        except Exception:
            marcado = None
        if not (isinstance(marcado, dict) and marcado.get("ok")):
            continue
        try:
            loc = fr.locator('[data-crc-titulo="1"]')
            item = loc.first if hasattr(loc, "first") else loc
            if _tipear_teclado(page, item, texto) and (
                _valor_quedo(_leer_valor(item), texto) or _titulo_sigue_en_frame(fr, texto)
            ):
                return True
        except Exception:
            pass
    if rellenar_por_label(
        page, r"^Título\b", texto, excluir=r"título de la sección|meta"
    ):
        return True
    return any(_titulo_sigue_en_frame(fr, texto) for fr in _frames_pagina(page))


def sigue_duracion_invalida(page) -> bool:
    t = texto_cuerpo(page).lower()
    return "inferior al mínimo" in t or "inferior al minimo" in t


def rellenar_numero_cabecera(page, patron: str, value) -> bool:
    """Duración/porciones: el BM muestra 0 si fill() no actualiza React."""
    if value is None or str(value).strip() == "":
        return False
    texto = str(numero_campo_bm(value) or value)
    if texto.strip() in {"", "0"}:
        return False
    for fr in _frames_pagina(page):
        try:
            out = fr.evaluate(JS_ESCRIBIR_NUMERO, {"patron": patron, "valor": texto})
        except Exception:
            out = None
        if isinstance(out, dict) and out.get("ok") and _valor_quedo(str(out.get("value") or ""), texto):
            try:
                page.wait_for_timeout(150)
            except Exception:
                pass
            try:
                leido = fr.evaluate(JS_LEER_NUMERO, patron)
            except Exception:
                leido = None
            if isinstance(leido, dict) and _valor_quedo(str(leido.get("value") or ""), texto):
                return True
        try:
            marcado = fr.evaluate(JS_MARCAR_NUMERO, patron)
        except Exception:
            marcado = None
        if isinstance(marcado, dict) and marcado.get("ok"):
            try:
                loc = fr.locator('[data-crc-numero="1"]')
                item = loc.first if hasattr(loc, "first") else loc
                if _tipear_teclado(page, item, texto) and _valor_quedo(_leer_valor(item), texto):
                    return True
            except Exception:
                pass
    return rellenar_por_label(page, patron, texto)


def fill_por_indice_visible(page, index, value) -> bool:
    try:
        return bool(page.evaluate(JS_FILL_INDEX, [int(index), str(value)]))
    except Exception:
        return False


def _locator_es_link(loc) -> bool:
    """True si el control es el campo Link/URL del ítem de tags."""
    try:
        tipo = (loc.get_attribute("type") or "").lower()
        nombre = " ".join(
            filter(
                None,
                (
                    loc.get_attribute("name"),
                    loc.get_attribute("placeholder"),
                    loc.get_attribute("aria-label"),
                ),
            )
        )
    except Exception:
        tipo, nombre = "", ""
    if tipo == "url" or re.search(r"\b(link|url|href|enlace)\b", nombre, re.I):
        return True
    try:
        return bool(
            loc.evaluate(
                """el => {
                  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
                  const r = el.getBoundingClientRect();
                  if ((el.type || '').toLowerCase() === 'url') return true;
                  const labs = [...document.querySelectorAll('label, p, span, legend, strong')];
                  return labs.some((l) => {
                    const linea = clean(l.innerText || '').split(' El dato')[0].replace(/\\*/g, ' ').trim();
                    if (!/^Link$|^Enlace$|^URL$/i.test(linea)) return false;
                    const b = l.getBoundingClientRect();
                    return r.top >= b.top - 8 && r.top - b.bottom < 90 && Math.abs(r.left - b.left) < 80;
                  });
                }"""
            )
        )
    except Exception:
        return False


def rellenar_por_label(
    page,
    patron: str,
    value,
    *,
    nth: int = 0,
    excluir: str | None = None,
    usar_get_by_label: bool = True,
) -> bool:
    """Rellena el input junto a la etiqueta visible, aunque el placeholder sea «Dale un valor»."""
    if value is None or value == "" or not patron:
        return False
    evita_link = bool(excluir and re.search(r"link|enlace|url", excluir, re.I))
    for fr in _frames_pagina(page):
        get_by_label = getattr(fr, "get_by_label", None)
        if get_by_label and not evita_link and usar_get_by_label:
            try:
                loc = get_by_label(re.compile(patron, re.I))
                n = loc.count() if hasattr(loc, "count") else 1
                if n and nth < n:
                    item = loc.nth(nth) if hasattr(loc, "nth") else loc
                    if not _locator_es_link(item) and escribir_valor(page, item, value):
                        return True
            except Exception:
                pass
        try:
            marcados = fr.evaluate(JS_MARCAR_POR_LABEL, {"patron": patron, "excluir": excluir or ""})
        except Exception:
            marcados = 0
        try:
            marcados = int(marcados)
        except (TypeError, ValueError):
            marcados = 0
        if not marcados or nth >= marcados:
            continue
        try:
            loc = fr.locator(f'[data-crc-label-hit="{nth}"]')
            item = loc.first if hasattr(loc, "first") else loc
            if evita_link and _locator_es_link(item):
                continue
            if escribir_valor(page, item, value):
                return True
        except Exception:
            continue
    return False


def contar_por_label(page, patron: str, excluir: str | None = None) -> int:
    try:
        return int(page.evaluate(JS_MARCAR_POR_LABEL, {"patron": patron, "excluir": excluir or ""}) or 0)
    except Exception:
        return 0


def fill_repetidos_por_label(page, patron: str, valores: list[str], *, excluir: str | None = None) -> int:
    valores = [v for v in valores if v]
    if not valores:
        return 0
    asegurar_n_campos_label(page, patron, len(valores), excluir=excluir)
    llenados = 0
    for i, valor in enumerate(valores):
        if rellenar_por_label(
            page,
            patron,
            valor,
            nth=i,
            excluir=excluir,
            usar_get_by_label=not bool(re.search(r"^Ingrediente\$", patron or "")),
        ):
            llenados += 1
            print(f"  ✓ ítem[{i}] ({patron}) → {valor[:60]}")
        else:
            print(f"  ✗ ítem[{i}] ({patron})")
    return llenados


def asegurar_n_campos_label(page, patron: str, n: int, *, excluir: str | None = None) -> int:
    actuales = contar_por_label(page, patron, excluir=excluir)
    intentos = 0
    while actuales < n and intentos < n + 4:
        es_ing = bool(re.search(r"^Ingrediente\$|Instrucci|Paso|Descripci", patron or ""))
        ok_add = (
            click_agregar_ingrediente_interno(page)
            if es_ing
            else click_agregar_item(page, preferir_ultimo=True)
        )
        if not ok_add:
            break
        intentos += 1
        try:
            page.wait_for_timeout(300)
        except Exception:
            pass
        actuales = contar_por_label(page, patron, excluir=excluir)
    return actuales


def tags_desde_receta(receta: dict) -> list[str]:
    """Tags del Word: «salmon, recetas a la parrilla, paltas, …»."""
    return [str(c).strip() for c in (receta.get("categorias") or []) if str(c).strip()]


JS_MARCAR_INPUTS_ITEM = """() => {
  document.querySelectorAll('[data-crc-item-hit]').forEach((el) => el.removeAttribute('data-crc-item-hit'));
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const visibles = (el) => {
    if (!el) return false;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.left >= 40;
  };
  const esControl = (el) => {
    if (!el || !visibles(el)) return false;
    const tag = (el.tagName || '').toLowerCase();
    const role = (el.getAttribute('role') || '').toLowerCase();
    if (tag === 'textarea') return true;
    if (tag === 'input') {
      const t = (el.type || 'text').toLowerCase();
      return !['hidden', 'checkbox', 'radio', 'file', 'submit', 'button'].includes(t);
    }
    return el.getAttribute('contenteditable') === 'true' || role === 'textbox';
  };
  const lineaLabel = (el) => clean((el.innerText || el.textContent || '')).split(' El dato')[0].replace(/\\*/g, ' ').trim();
  const esLink = (el) => {
    let n = el;
    for (let i = 0; i < 6 && n; i++) {
      const labs = [...n.querySelectorAll('label, p, span, legend')].map(lineaLabel);
      if (labs.some((t) => /^Link$|^Enlace$/i.test(t))) {
        const tagLabs = labs.filter((t) => /^Tag$/i.test(t));
        if (!tagLabs.length) return true;
      }
      n = n.parentElement;
    }
    return false;
  };
  const esTag = (el) => {
    let n = el;
    for (let i = 0; i < 6 && n; i++) {
      if ([...n.querySelectorAll('label, p, span, legend')].some((l) => /^Tag$/i.test(lineaLabel(l)))) return true;
      n = n.parentElement;
    }
    return false;
  };
  const tituloSeccion = (el) => {
    let n = el;
    for (let i = 0; i < 6 && n; i++) {
      const t = clean(n.innerText || '');
      if (/t[ií]tulo de la secci/i.test(t) && t.length < 80) return true;
      n = n.parentElement;
    }
    return false;
  };
  const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5,p,div,legend,span')].filter((el) => {
    const linea = clean(el.innerText || '').split('\\n')[0];
    return /^formulario ítem\\s+\\d+/i.test(linea) && linea.length < 60;
  });
  let n = 0;
  const seen = new Set();
  for (const h of heads) {
    let box = h.parentElement;
    let input = null;
    for (let i = 0; i < 8 && box && !input; i++) {
      const cand = [...box.querySelectorAll('input, textarea, [role="textbox"]')].filter((el) => (
        esControl(el) && !tituloSeccion(el) && !seen.has(el) && (esTag(el) || !esLink(el))
      ));
      const tags = cand.filter(esTag);
      if (tags.length) input = tags[0];
      else if (cand.length) input = cand[0];
      box = box.parentElement;
    }
    if (input) {
      seen.add(input);
      input.setAttribute('data-crc-item-hit', String(n));
      n += 1;
    }
  }
  return n;
}"""

JS_DUPLICAR_ULTIMO_ITEM = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5,p,div,legend,span')].filter((el) => {
    const linea = clean(el.innerText || '').split('\\n')[0];
    return /^formulario ítem\\s+\\d+/i.test(linea) && linea.length < 60;
  });
  const h = heads[heads.length - 1];
  if (!h) return false;
  let box = h.parentElement;
  for (let i = 0; i < 6 && box && box !== document.body; i++) {
    const r = box.getBoundingClientRect();
    if (r.height > 80 && r.width > 200) break;
    box = box.parentElement;
  }
  if (!box) return false;
  const textoDe = (el) => (
    (el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || '') + ' ' + (el.innerText || '')
  ).toLowerCase();
  const candidatos = [...box.querySelectorAll('button, [role="button"], [aria-label], [title]')];
  const dup = candidatos.find((el) => /duplic|clone|copiar|copy/.test(textoDe(el)) && !/elimina|delete|trash|basura|borrar/.test(textoDe(el)));
  if (dup) { (dup.closest('button, [role="button"]') || dup).click(); return 'duplicar'; }
  return false;
}"""

JS_BORRAR_ULTIMO_ITEM = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5,p,div,legend,span')].filter((el) => {
    const linea = clean(el.innerText || '').split('\\n')[0];
    return /^formulario ítem\\s+\\d+/i.test(linea) && linea.length < 60;
  });
  const h = heads[heads.length - 1];
  if (!h) return false;
  let box = h.parentElement;
  for (let i = 0; i < 6 && box && box !== document.body; i++) {
    const r = box.getBoundingClientRect();
    if (r.height > 80 && r.width > 200) break;
    box = box.parentElement;
  }
  if (!box) return false;
  const textoDe = (el) => (
    (el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || '') + ' ' + (el.innerText || '')
  ).toLowerCase();
  const candidatos = [...box.querySelectorAll('button, [role="button"], [aria-label], [title]')];
  const del = candidatos.find((el) => /elimina|delete|trash|basura|borrar/.test(textoDe(el)) && !/duplic|clone/.test(textoDe(el)));
  if (del) { (del.closest('button, [role="button"]') || del).click(); return 'borrar'; }
  return false;
}"""


def _marcar_items_formulario(page) -> tuple[object | None, int]:
    for fr in _frames_pagina(page):
        try:
            n = int(fr.evaluate(JS_MARCAR_TAGS_POR_ITEM) or 0)
        except (TypeError, ValueError):
            n = 0
        except Exception:
            n = 0
        if n:
            return fr, n
        try:
            n = int(fr.evaluate(JS_MARCAR_CAMPOS_TAG) or 0)
        except (TypeError, ValueError):
            continue
        except Exception:
            continue
        if n:
            return fr, n
    for fr in _frames_pagina(page):
        try:
            n = int(fr.evaluate(JS_MARCAR_INPUTS_ITEM) or 0)
        except Exception:
            continue
        if n:
            return fr, n
    return None, 0


def _contar_items_formulario(page) -> int:
    for fr in _frames_pagina(page):
        try:
            n = int(fr.evaluate(JS_CONTAR_ITEMS_FORMULARIO) or 0)
        except Exception:
            continue
        if n:
            return n
    _, n = _marcar_items_formulario(page)
    return n


def limpiar_links_que_no_son_url(page) -> int:
    total = 0
    for fr in _frames_pagina(page):
        try:
            n = int(fr.evaluate(JS_LIMPIAR_LINKS_NO_URL) or 0)
        except Exception:
            continue
        if n:
            print(f"  · Limpié {n} Link que no era URL (el tag iba ahí).")
            total += n
    return total


def asegurar_n_items_tags(page, n: int) -> int:
    actuales = _contar_items_formulario(page)
    intentos = 0
    while actuales < n and intentos < n + 2:
        if not click_agregar_item(page, preferir_ultimo=True):
            break
        intentos += 1
        try:
            page.wait_for_timeout(350)
        except Exception:
            pass
        actuales = _contar_items_formulario(page)
    while actuales > n and intentos < 8:
        borrado = False
        for fr in _frames_pagina(page):
            try:
                if fr.evaluate(JS_BORRAR_ULTIMO_ITEM):
                    borrado = True
                    break
            except Exception:
                continue
        if not borrado:
            break
        intentos += 1
        try:
            page.wait_for_timeout(300)
        except Exception:
            pass
        actuales = _contar_items_formulario(page)
    return actuales


def _tag_quedo_en_caja(fr, indice: int, valor: str) -> bool:
    try:
        leido = fr.evaluate(JS_LEER_CAJA_TAG, indice)
    except Exception:
        return False
    if not (isinstance(leido, dict) and _valor_quedo(str(leido.get("value") or ""), valor)):
        return False
    try:
        if fr.evaluate(JS_LINK_TIENE_TEXTO, valor):
            return False
    except Exception:
        pass
    return True


def expandir_item_formulario(page, indice: int) -> bool:
    """Abre «Formulario Ítem N» (acordeón). Sin esto Tag* no existe en el DOM."""
    nro = indice + 1
    for fr in _frames_pagina(page):
        try:
            out = fr.evaluate(JS_EXPANDIR_ITEM_FORMULARIO, indice)
        except Exception:
            out = None
        if isinstance(out, dict) and out.get("ok"):
            try:
                page.wait_for_timeout(400)
            except Exception:
                pass
            return True
        get_by_text = getattr(fr, "get_by_text", None)
        if get_by_text:
            try:
                loc = get_by_text(re.compile(rf"Formulario Ítem\s+{nro}\b", re.I))
                if hasattr(loc, "count") and loc.count():
                    loc.first.click(timeout=2_500)
                    page.wait_for_timeout(400)
                    return True
            except Exception:
                pass
    if expandir_acordeon(page, indice):
        try:
            page.wait_for_timeout(400)
        except Exception:
            pass
        return True
    return False


def _locator_count(loc) -> int:
    try:
        if loc is None:
            return 0
        if hasattr(loc, "count"):
            return int(loc.count())
        return 1
    except Exception:
        return 0


def _escribir_en_caja_tag(page, loc, valor: str) -> bool:
    """Escribe en Tag* ya abierto. No aplica el recorte del lienzo (el editor puede estar más a la izquierda)."""
    if loc is None or not valor or _locator_es_link(loc):
        return False
    if escribir_valor(page, loc, valor, exigir_lienzo=False):
        return True
    if _tipear_teclado(page, loc, valor):
        return True
    try:
        wrote = loc.evaluate(JS_ESCRIBIR_NATIVO, valor)
        if _valor_quedo(str(wrote or ""), valor) or _valor_quedo(_leer_valor(loc), valor):
            return True
    except Exception:
        pass
    return _valor_quedo(_leer_valor(loc), valor)


def _locators_tag_item(fr, indice: int) -> list:
    """Candidatos del campo Tag* del ítem i (el primero de cada par; nunca Link)."""
    out = []
    locator = getattr(fr, "locator", None)
    if locator:
        for sel in (f'[data-crc-tag-hit="{indice}"]', f'[data-crc-item-hit="{indice}"]'):
            try:
                loc = locator(sel)
            except Exception:
                continue
            if _locator_count(loc):
                out.append(loc.first if hasattr(loc, "first") else loc)
    get_by_role = getattr(fr, "get_by_role", None)
    if get_by_role:
        try:
            loc = get_by_role("textbox")
            n = _locator_count(loc)
            if n >= (indice + 1) * 2:
                out.append(loc.nth(indice * 2))
            elif n > indice:
                out.append(loc.nth(indice))
        except Exception:
            pass
    if locator:
        try:
            loc = locator(
                'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'
                ':not([type="file"]):not([type="submit"]), textarea'
            )
            n = _locator_count(loc)
            if n >= (indice + 1) * 2:
                out.append(loc.nth(indice * 2))
            elif n > indice:
                out.append(loc.nth(indice))
        except Exception:
            pass
    return out


def escribir_tag_entre_labels(page, indice: int, valor: str) -> bool:
    """Escribe en el primer campo del Formulario Ítem (Tag*), nunca en Link."""
    if not valor:
        return False
    for fr in _frames_pagina(page):
        out = None
        try:
            out = fr.evaluate(JS_FOCO_CAJA_TAG, {"indice": indice, "valor": valor})
        except Exception:
            out = None
        kb = getattr(page, "keyboard", None)
        try:
            if isinstance(out, dict) and out.get("ok") and kb is not None and hasattr(kb, "type"):
                kb.press("Control+a")
                kb.press("Backspace")
                kb.type(str(valor), delay=16)
            if hasattr(page, "wait_for_timeout"):
                page.wait_for_timeout(180)
        except Exception:
            pass
        if _tag_quedo_en_caja(fr, indice, valor):
            return True
        for loc in _locators_tag_item(fr, indice):
            if not _escribir_en_caja_tag(page, loc, valor):
                continue
            try:
                if fr.evaluate(JS_LINK_TIENE_TEXTO, valor):
                    limpiar_links_que_no_son_url(page)
                    if fr.evaluate(JS_LINK_TIENE_TEXTO, valor):
                        continue
            except Exception:
                pass
            if _tag_quedo_en_caja(fr, indice, valor) or _valor_quedo(_leer_valor(loc), valor):
                return True
        if isinstance(out, dict) and _valor_quedo(str(out.get("wrote") or ""), valor) and _tag_quedo_en_caja(
            fr, indice, valor
        ):
            return True
    return False


def rellenar_items_formulario(page, valores: list[str]) -> int:
    """Rellena Formulario Ítem 1..N, campo Tag* (nunca Link)."""
    valores = [v for v in valores if v]
    if not valores:
        return 0
    asegurar_n_items_tags(page, len(valores))
    fr, marcados = _marcar_items_formulario(page)
    print(f"  · Cajas Tag* visibles ahora: {marcados} (despliego cada ítem)")
    llenados = 0
    for i, valor in enumerate(valores):
        print(f"  · Despliego Formulario Ítem {i + 1}…")
        if not expandir_item_formulario(page, i):
            print(f"  ✗ tag[{i}]: no pude abrir el acordeón")
            continue
        fr, _ = _marcar_items_formulario(page)
        contexto = fr or page
        ok = escribir_tag_entre_labels(page, i, valor)
        if not ok:
            for loc in _locators_tag_item(contexto, i):
                if not _escribir_en_caja_tag(page, loc, valor):
                    continue
                ok = True
                try:
                    if contexto.evaluate(JS_LINK_TIENE_TEXTO, valor):
                        ok = False
                        limpiar_links_que_no_son_url(page)
                except Exception:
                    pass
                if ok:
                    break
        if not ok:
            for loc in _locators_tag_item(contexto, i):
                if _locator_es_link(loc):
                    continue
                if _valor_quedo(_leer_valor(loc), valor):
                    ok = True
                    break
            if not ok and _tag_quedo_en_caja(contexto, i, valor):
                ok = True
        if ok:
            print(f"  ✓ tag[{i}] → {valor}")
            llenados += 1
        else:
            print(f"  ✗ tag[{i}] (no pude escribir en Tag*)")
    return llenados


def fill_lista_tags(page, tags: list[str]) -> int:
    if editor_actual(page) != "tags":
        print("  · No relleno tags: no estoy en Edición de tags.")
        return 0
    tags = [t.strip() for t in tags if t and str(t).strip()]
    if not tags:
        return 0
    print("  · tags del Word: " + ", ".join(tags))
    print("  · Escribo en Tag* (nunca en Link).")
    limpiar_links_que_no_son_url(page)
    asegurar_n_items_tags(page, len(tags))
    n = rellenar_items_formulario(page, tags)
    if n:
        limpiar_links_que_no_son_url(page)
        return n
    excluir = r"título de la sección|ingrediente|meta|descripci|link|enlace|url"
    n = fill_repetidos_por_label(page, r"^Tag$", tags, excluir=excluir)
    limpiar_links_que_no_son_url(page)
    return n


def fill_inputs_texto_en_orden(page, valores: list[str]) -> int:
    """Rellena inputs de texto visibles (placeholder «Dale un valor») en orden."""
    valores = [v for v in valores if v]
    if not valores:
        return 0
    try:
        loc = page.locator(
            'input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="hidden"]), textarea'
        )
        n = loc.count()
    except Exception:
        return 0
    llenados = 0
    for i in range(n):
        if llenados >= len(valores):
            break
        item = loc.nth(i)
        try:
            if hasattr(item, "is_visible") and not item.is_visible():
                continue
            tipo = ""
            try:
                tipo = (item.get_attribute("type") or "").lower()
            except Exception:
                tipo = ""
            if tipo in {"checkbox", "radio", "file", "hidden", "submit"}:
                continue
            if escribir_valor(page, item, valores[llenados]):
                print(f"  ✓ texto[{llenados}] → {valores[llenados][:60]}")
                llenados += 1
        except Exception:
            continue
    return llenados


JS_CLICK_SI_ACEPTO = """() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const visibles = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 8 && r.height > 8;
  };
  const cuerpo = (document.body && document.body.innerText) || '';
  if (!/tienes cambios sin guardar/i.test(cuerpo)) return false;
  const nodos = [...document.querySelectorAll('button, [role="button"], a')].filter(visibles);
  const si = nodos.find((el) => {
    const t = clean(el.innerText || el.textContent || el.getAttribute('aria-label') || '');
    return /^s[ií],?\\s*acepto$/i.test(t);
  });
  if (si) { si.click(); return 'si-acepto'; }
  return false;
}"""


def _hay_modal_sin_guardar(page) -> bool:
    return "tienes cambios sin guardar" in texto_cuerpo(page).lower()


def resolver_modal_cambios(page, *, salir: bool = False) -> bool:
    """Modal «Tienes cambios sin guardar»: Cancelar para quedarse; «Sí, acepto» para volver al lienzo."""
    if salir:
        for fr in _frames_pagina(page):
            try:
                if fr.evaluate(JS_CLICK_SI_ACEPTO) == "si-acepto":
                    print("  · Modal: Sí, acepto")
                    page.wait_for_timeout(400)
                    return True
            except Exception:
                continue
        for fr in _frames_pagina(page):
            get_by_text = getattr(fr, "get_by_text", None)
            if not get_by_text:
                continue
            try:
                loc = get_by_text(re.compile(r"s[ií],?\s*acepto", re.I))
                if hasattr(loc, "count") and loc.count():
                    loc.last.click(timeout=2_000)
                    print("  · Modal: Sí, acepto")
                    page.wait_for_timeout(400)
                    return True
            except Exception:
                continue
            locator = getattr(fr, "locator", None)
            if not locator:
                continue
            for sel in (
                "button:has-text('Sí, acepto')",
                "button:has-text('Si, acepto')",
                "[role='button']:has-text('Sí, acepto')",
                "[role='button']:has-text('Si, acepto')",
            ):
                try:
                    loc = locator(sel)
                    if loc.count():
                        loc.last.click(timeout=2_000)
                        print("  · Modal: Sí, acepto")
                        page.wait_for_timeout(400)
                        return True
                except Exception:
                    continue
        return False
    get_by_text = getattr(page, "get_by_text", None)
    try:
        if get_by_text:
            aviso = get_by_text("Tienes cambios sin guardar", exact=False)
            if hasattr(aviso, "count") and aviso.count() == 0:
                return False
        for sel in (
            "button:has-text('Cancelar')",
            "[role='button']:has-text('Cancelar')",
        ):
            loc = page.locator(sel)
            if not loc.count():
                continue
            loc.last.click(timeout=2_000)
            page.wait_for_timeout(250)
            return True
    except Exception:
        return False
    return False


def texto_pasos(pasos: list[dict]) -> str:
    return "\n".join(f"{p.get('orden')}. {p.get('texto')}" for p in pasos if p.get("texto"))


def partir_paso(texto: str) -> tuple[str, str]:
    """«Sazona el salmón: Seca los filetes…» → título + cuerpo."""
    crudo = (texto or "").strip()
    m = re.match(r"^([^:]{3,70}):\s+(.+)$", crudo, re.S)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    return "", crudo


def linea_paso(item: dict) -> str:
    return (item.get("texto") or "").strip()


def items_instrucciones(pasos: list[dict], tips: list | None = None) -> list[dict]:
    """Pasos del Word + consejos al final (misma lista interna)."""
    out = [p for p in (pasos or []) if linea_paso(p)]
    for raw in tips or []:
        tip = str(raw).strip()
        if not tip:
            continue
        if not re.match(r"(?i)^consejo\b", tip):
            tip = f"Consejo: {tip}"
        out.append({"orden": len(out) + 1, "texto": tip})
    return out


def titulo_lista_instrucciones(receta: dict | None = None) -> str:
    return "Paso a paso"


def _esc_html(texto: str) -> str:
    return (
        (texto or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


_HTML_TAG_RE = re.compile(r"<(p|strong|ul|li|ol|br\s*/?|em|h[1-6]|div|b|i)\b", re.I)
_HTML_ESCAPED_RE = re.compile(r"&lt;(p|strong|ul|li|ol|br|em|h[1-6]|div|b|i)\b", re.I)


def parece_html(texto: str | None) -> bool:
    """True si el texto ya trae etiquetas reales (no &lt;p&gt;)."""
    s = texto or ""
    if not s or _HTML_ESCAPED_RE.search(s):
        return False
    return bool(_HTML_TAG_RE.search(s))


def html_quedo_con_etiquetas(escrito: str | None, original: str | None = None) -> bool:
    """El campo tiene <p>/<strong> de verdad, no entidades escapadas."""
    s = escrito or ""
    if not s:
        return False
    if _HTML_ESCAPED_RE.search(s) and not _HTML_TAG_RE.search(s):
        return False
    if _HTML_TAG_RE.search(s):
        return True
    if original and parece_html(original):
        return False
    return False


def html_pasos(items: list[dict]) -> str:
    """HTML para el editor «Paso a Paso» (modo HTML + Script). No reescapa tags."""
    pasos: list[str] = []
    consejos: list[str] = []
    for it in items or []:
        texto = linea_paso(it)
        if not texto:
            continue
        if parece_html(texto):
            pasos.append(texto.strip())
            continue
        if re.match(r"(?i)^consejo\b", texto):
            cuerpo = re.sub(r"(?i)^consejo:\s*", "", texto).strip()
            consejos.append(cuerpo if parece_html(cuerpo) else _esc_html(cuerpo))
            continue
        tit, cuerpo = partir_paso(texto)
        if tit:
            pasos.append(f"<p><strong>{_esc_html(tit)}:</strong> {_esc_html(cuerpo)}</p>")
        else:
            pasos.append(f"<p>{_esc_html(texto)}</p>")
    html = "\n".join(pasos)
    if consejos:
        lis = "".join(f"<li>{c}</li>" for c in consejos)
        html += f"\n<p><strong>Consejos</strong></p>\n<ul>{lis}</ul>"
    return html.strip()


HTML_SEO_SALMON_PALTA = (
    "<h2>Consejos para un salmón a la parrilla con salsa perfecto</h2>\n"
    "<ul>\n"
    "  <li>Cocina el salmón principalmente por el lado de la piel para proteger "
    "la carne y mantenerla jugosa. Dale vuelta una sola vez para evitar que se desarme.</li>\n"
    "  <li>Prepara la salsa de palta justo antes de servir para conservar su color. "
    "El limón también ayuda a retrasar que se oscurezca.</li>\n"
    "  <li>Retira el salmón cuando el centro aún esté ligeramente rosado. "
    "El calor residual terminará de cocinarlo fuera de la parrilla.</li>\n"
    "</ul>"
)


def titulo_seo_consejos(receta: dict | None = None) -> str:
    receta = receta or {}
    seo = receta.get("seo") or {}
    for cand in (receta.get("tipsTitulo"), seo.get("htmlTitulo")):
        if cand and str(cand).strip():
            return str(cand).strip()
    titulo = (receta.get("titulo") or "").strip()
    if titulo:
        plato = titulo[0].lower() + titulo[1:] if len(titulo) > 1 else titulo.lower()
        return f"Consejos para un {plato} perfecto"
    return "Consejos"


def _es_receta_salmon_palta(receta: dict | None) -> bool:
    receta = receta or {}
    blob = " ".join(
        [
            str(receta.get("id") or ""),
            str(receta.get("titulo") or ""),
            str((receta.get("seo") or {}).get("slugSugerido") or ""),
        ]
    ).lower()
    return "salm" in blob and "parrilla" in blob and "palta" in blob


def html_seo_consejos(receta: dict | None = None) -> str:
    """HTML del bloque SEO HTML (Consejos). Mantiene <h2>/<ul>/<li>."""
    receta = receta or {}
    seo = receta.get("seo") or {}
    crudo = (seo.get("html") or seo.get("contenidoHtml") or "").strip()
    if parece_html(crudo):
        return crudo
    if _es_receta_salmon_palta(receta):
        return HTML_SEO_SALMON_PALTA
    tips: list[str] = []
    for raw in receta.get("tips") or []:
        t = re.sub(r"(?i)^consejo:\s*", "", str(raw).strip()).strip()
        if t:
            tips.append(t)
    if not tips:
        return ""
    h2 = _esc_html(titulo_seo_consejos(receta))
    lis = "\n".join(f"  <li>{c if parece_html(c) else _esc_html(c)}</li>" for c in tips)
    return f"<h2>{h2}</h2>\n<ul>\n{lis}\n</ul>"


def valores_desde_item(item: dict, tipo: str) -> dict[str, str]:
    if tipo == "ingredientes":
        return {
            "nombre": (item.get("nombre") or "").strip(),
            "cantidad": str(item.get("cantidad") or "").strip(),
            "unidad": (item.get("unidad") or "").strip(),
            "sku": str(item.get("skuCencosud") or "").strip(),
            "notas": (item.get("notas") or "").strip(),
        }
    return {
        "texto": (item.get("texto") or "").strip(),
        "orden": "" if item.get("orden") is None else str(item.get("orden")),
    }


def asignar_campos_item(fields: list[dict], item: dict, tipo: str) -> list[tuple[str, str, str]]:
    """Empareja campos visibles de UN acordeón con un ítem del Word/JSON."""
    valores = {k: v for k, v in valores_desde_item(item, tipo).items() if v}
    usados: set[int] = set()
    asignados: list[tuple[str, str, str]] = []

    def tomar(predicado, rol: str) -> bool:
        valor = valores.get(rol)
        if not valor:
            return False
        for i, field in enumerate(fields):
            if i in usados:
                continue
            sel = field.get("selectorSugerido")
            if not sel:
                continue
            if predicado(field):
                usados.add(i)
                asignados.append((rol, sel, valor))
                return True
        return False

    if tipo == "ingredientes":
        tomar(lambda f: bool(LABEL_NOMBRE.search(blob_campo(f))), "nombre")
        tomar(lambda f: bool(LABEL_CANTIDAD.search(blob_campo(f))) or f.get("type") == "number", "cantidad")
        tomar(lambda f: bool(LABEL_UNIDAD.search(blob_campo(f))), "unidad")
        tomar(lambda f: bool(LABEL_SKU.search(blob_campo(f))), "sku")
        tomar(lambda f: bool(re.search(r"nota|tip", blob_campo(f), re.I)), "notas")
        for rol in ("nombre", "cantidad", "unidad"):
            if rol in valores and not any(a[0] == rol for a in asignados):
                tomar(
                    lambda f: not re.search(
                        r"t[ií]tulo de la secci", blob_campo(f), re.I
                    ),
                    rol,
                )
    else:
        tomar(lambda f: f.get("tag") == "textarea" or bool(LABEL_PASO.search(blob_campo(f))), "texto")
        tomar(lambda f: bool(LABEL_ORDEN.search(blob_campo(f))), "orden")
        if "texto" in valores and not any(a[0] == "texto" for a in asignados):
            tomar(lambda f: True, "texto")
    return asignados


def selector_es_generico(sel: str | None) -> bool:
    """El placeholder 'Dale un valor' aparece en muchos inputs; no sirve como mapa."""
    if not sel:
        return False
    bajo = sel.lower()
    return "dale un valor" in bajo or sel.strip() in ('input[placeholder="Dale un valor"]',)


def _fill_locator(page, sel: str, value) -> bool:
    if not sel or value is None or value == "":
        return False
    if selector_es_generico(sel):
        return False
    try:
        loc = page.locator(sel).first
        if not loc.count():
            return False
        return escribir_valor(page, loc, value)
    except Exception:
        return False


def campos_visibles(page) -> list[dict]:
    try:
        estructura = dump_estructura(page)
    except Exception:
        return []
    if not isinstance(estructura, dict):
        return []
    return list(estructura.get("fields") or [])


def fill_por_etiqueta(page, patron: re.Pattern, value, *, key: str | None = None) -> bool:
    if value is None or value == "":
        return False
    fields = campos_visibles(page)
    for field in fields:
        blob = blob_campo(field) or ""
        if key and not label_coincide_campo(key, blob):
            continue
        if not key and not patron.search(blob):
            continue
        sel = field.get("selectorSugerido")
        if sel and not selector_es_generico(sel) and _fill_locator(page, sel, value):
            return True
        idx = field.get("index")
        if idx is not None and fill_por_indice_visible(page, idx, value):
            return True
    if rellenar_por_label(page, patron.pattern, value):
        return True
    return False


def contar_acordeones(page) -> int:
    n_items = _contar_items_formulario(page)
    if n_items:
        return n_items
    for fr in _frames_pagina(page):
        try:
            n = fr.evaluate("() => document.querySelectorAll('[aria-expanded]').length")
        except Exception:
            continue
        if n:
            return int(n)
    return 0


def expandir_acordeon(page, indice: int) -> bool:
    for fr in _frames_pagina(page):
        try:
            ok = fr.evaluate(
                """(i) => {
                  const nodes = [...document.querySelectorAll('[aria-expanded]')];
                  const el = nodes[i];
                  if (!el) return false;
                  if (el.getAttribute('aria-expanded') !== 'true') el.click();
                  return true;
                }""",
                indice,
            )
        except Exception:
            ok = False
        if ok:
            return True
    return False


def click_agregar_item(page, preferir_ultimo: bool = False) -> bool:
    for fr in _frames_pagina(page):
        get_by_text = getattr(fr, "get_by_text", None)
        if get_by_text:
            try:
                loc = get_by_text(re.compile(r"Agregar nuevo [ií]tem", re.I))
                if hasattr(loc, "count") and loc.count():
                    loc.last.click(timeout=2_000)
                    page.wait_for_timeout(350)
                    return True
            except Exception:
                pass
        locator = getattr(fr, "locator", None)
        if not locator:
            continue
        for sel in BOTONES_AGREGAR:
            try:
                loc = locator(sel)
                total = loc.count()
                indices = range(total - 1, -1, -1) if preferir_ultimo else range(total)
                for i in indices:
                    btn = loc.nth(i)
                    visible = True
                    try:
                        visible = btn.is_visible()
                    except Exception:
                        visible = True
                    if visible:
                        btn.click(timeout=2_000)
                        page.wait_for_timeout(350)
                        return True
            except Exception:
                continue
        try:
            out = fr.evaluate(JS_DUPLICAR_ULTIMO_ITEM)
        except Exception:
            out = None
        if out:
            try:
                page.wait_for_timeout(350)
            except Exception:
                pass
            return True
    return False


def asegurar_filas_lista(page, n: int) -> int:
    actuales = contar_acordeones(page)
    intentos = 0
    while actuales < n and intentos < n + 3:
        if not click_agregar_item(page):
            break
        intentos += 1
        actuales = contar_acordeones(page)
    return actuales


def _contar_ingredientes_internos(page) -> int:
    for fr in _frames_pagina(page):
        try:
            n = int(fr.evaluate(JS_CONTAR_INGREDIENTES_INTERNOS) or 0)
        except Exception:
            continue
        if n:
            return n
    return 0


def activar_html_paso_a_paso(page) -> str | None:
    """Enciende «HTML + Script» y/o el </> del editor Paso a Paso."""
    ultimo = None
    for fr in _frames_pagina(page):
        try:
            out = fr.evaluate(JS_ACTIVAR_HTML_PASO)
        except Exception:
            out = None
        if out:
            ultimo = str(out)
            try:
                page.wait_for_timeout(400)
            except Exception:
                pass
            continue
        get_by_text = getattr(fr, "get_by_text", None)
        if get_by_text:
            try:
                loc = get_by_text(re.compile(r"HTML\s*\+\s*Script", re.I))
                if hasattr(loc, "count") and loc.count():
                    loc.first.click(timeout=2_000)
                    ultimo = ultimo or "html-script"
                    page.wait_for_timeout(300)
            except Exception:
                pass
            try:
                loc = get_by_text(re.compile(r"</>|source|c[oó]digo", re.I))
                if hasattr(loc, "count") and loc.count():
                    loc.last.click(timeout=1_500)
                    ultimo = (ultimo or "") + "+source"
            except Exception:
                pass
        locator = getattr(fr, "locator", None)
        if locator:
            for sel in (
                'button[aria-label*="HTML" i]',
                'button[title*="HTML" i]',
                'button[aria-label*="source" i]',
                '[role="switch"]',
            ):
                try:
                    loc = locator(sel)
                    if loc.count():
                        loc.last.click(timeout=1_500)
                        ultimo = ultimo or "switch"
                except Exception:
                    continue
    if ultimo:
        print(f"  · Modo HTML: {ultimo}")
    return ultimo


def escribir_titulo_lista_instrucciones(page, valor: str) -> bool:
    for fr in _frames_pagina(page):
        try:
            out = fr.evaluate(JS_ESCRIBIR_TITULO_LISTA, valor)
        except Exception:
            out = None
        if isinstance(out, dict) and _valor_quedo(str(out.get("wrote") or ""), valor):
            return True
        get_by_label = getattr(fr, "get_by_label", None)
        if get_by_label:
            try:
                loc = get_by_label(re.compile(r"^Título(\s*\*)?$", re.I))
                if loc.count():
                    if escribir_valor(page, loc.first, valor, exigir_lienzo=False):
                        return True
            except Exception:
                pass
    return rellenar_por_label(
        page,
        r"^Título$",
        valor,
        nth=0,
        excluir=r"meta|sección|cabecera|ingrediente",
        usar_get_by_label=False,
    )


def escribir_paso_a_paso_html(page, html: str) -> bool:
    """Pega HTML crudo. Falla si las etiquetas se escaparon o se perdieron."""
    if not html:
        return False
    for fr in _frames_pagina(page):
        try:
            out = fr.evaluate(JS_ESCRIBIR_PASO_HTML, html)
        except Exception:
            out = None
        wrote = str(out.get("wrote") or "") if isinstance(out, dict) else ""
        if isinstance(out, dict) and out.get("ok") and html_quedo_con_etiquetas(wrote, html):
            return True
        locator = getattr(fr, "locator", None)
        if locator:
            try:
                tas = locator("textarea")
                n = tas.count() if hasattr(tas, "count") else 0
                for i in range(n):
                    item = tas.nth(i)
                    try:
                        item.fill(html, timeout=3_000)
                    except Exception:
                        try:
                            item.evaluate(JS_ESCRIBIR_NATIVO, html)
                        except Exception:
                            continue
                    leido = _leer_valor(item)
                    if html_quedo_con_etiquetas(leido, html):
                        return True
                    try:
                        item.evaluate(JS_ESCRIBIR_NATIVO, html)
                    except Exception:
                        continue
                    if html_quedo_con_etiquetas(_leer_valor(item), html):
                        return True
            except Exception:
                pass
    return False


def rellenar_seo_html(page, receta: dict) -> bool:
    """Enciende HTML + Script y pega Consejos con etiquetas en content *."""
    html = html_seo_consejos(receta)
    if not html:
        print("  · Sin HTML de Consejos para SEO.")
        return False
    resolver_borrador_editor(page)
    activar_html_paso_a_paso(page)
    if escribir_paso_a_paso_html(page, html):
        print("  ✓ SEO HTML con etiquetas <h2>/<ul>/<li>")
        return True
    print("  ✗ SEO HTML no quedó con etiquetas. No escribo texto plano.")
    return False


def resolver_borrador_editor(page) -> bool:
    """El aviso «Tienes un borrador» tapa el formulario; retomar con ✓."""
    if "tienes un borrador" not in texto_cuerpo(page).lower():
        return False
    for fr in _frames_pagina(page):
        try:
            out = fr.evaluate(JS_RESOLVER_BORRADOR)
        except Exception:
            out = None
        if out:
            print(f"  · Borrador: retomo ({out})")
            try:
                page.wait_for_timeout(700)
            except Exception:
                pass
            return True
        get_by_text = getattr(fr, "get_by_text", None)
        if not get_by_text:
            continue
        try:
            aviso = get_by_text(re.compile(r"Tienes un borrador", re.I))
            if hasattr(aviso, "count") and aviso.count():
                for pat in (r"^[✓✔]$", r"retomar", r"^✓"):
                    loc = aviso.locator("xpath=ancestor::*[1]").get_by_text(
                        re.compile(pat, re.I)
                    )
                    if loc.count():
                        loc.first.click(timeout=2_000)
                        print("  · Borrador: retomo (clic ✓)")
                        page.wait_for_timeout(700)
                        return True
        except Exception:
            continue
    return False


def expandir_todos_items_formulario(page) -> dict:
    """Abre todos los «Formulario Ítem N» (sección + ingredientes). Si están cerrados no hay Ingrediente*."""
    ultimo = {"clicks": 0, "heads": 0, "cajas": 0}
    for fr in _frames_pagina(page):
        try:
            out = fr.evaluate(JS_EXPANDIR_TODOS_ITEMS)
        except Exception:
            out = None
        if isinstance(out, dict):
            ultimo = out
            try:
                page.wait_for_timeout(400)
            except Exception:
                pass
    if _contar_ingredientes_internos(page) > 0:
        return ultimo
    for nro in range(1, 4):
        for fr in _frames_pagina(page):
            get_by_text = getattr(fr, "get_by_text", None)
            if not get_by_text:
                continue
            try:
                loc = get_by_text(re.compile(rf"^Formulario Ítem\s+{nro}$", re.I))
                if hasattr(loc, "count") and loc.count():
                    loc.first.click(timeout=1_500)
                    page.wait_for_timeout(250)
                    if _contar_ingredientes_internos(page) > 0:
                        return ultimo
            except Exception:
                continue
    for fr in _frames_pagina(page):
        try:
            out = fr.evaluate(JS_EXPANDIR_TODOS_ITEMS)
        except Exception:
            out = None
        if isinstance(out, dict):
            ultimo = out
    return ultimo


def click_agregar_ingrediente_interno(page) -> bool:
    """Pulsa el + Agregar de la lista Ingredientes (el de arriba), no el de una sección nueva."""
    for fr in _frames_pagina(page):
        try:
            out = fr.evaluate(JS_CLICK_AGREGAR_INGREDIENTE)
        except Exception:
            out = None
        if out:
            try:
                page.wait_for_timeout(350)
            except Exception:
                pass
            return True
        get_by_text = getattr(fr, "get_by_text", None)
        if get_by_text:
            try:
                loc = get_by_text(re.compile(r"Agregar nuevo [ií]tem", re.I))
                n = loc.count() if hasattr(loc, "count") else 0
                if n:
                    (loc.first if n >= 2 else loc.last).click(timeout=2_000)
                    page.wait_for_timeout(350)
                    return True
            except Exception:
                pass
    return False


def asegurar_n_ingredientes(page, n: int) -> int:
    actuales = _contar_ingredientes_internos(page)
    if actuales == 0:
        expandir_todos_items_formulario(page)
        expandir_item_formulario(page, 0)
        try:
            page.wait_for_timeout(400)
        except Exception:
            pass
        actuales = _contar_ingredientes_internos(page)
        print(f"  · Tras abrir acordeones: {actuales} Ingrediente* visibles")
    intentos = 0
    while actuales < n and intentos < n + 2:
        if not click_agregar_ingrediente_interno(page):
            break
        intentos += 1
        expandir_todos_items_formulario(page)
        actuales = _contar_ingredientes_internos(page)
    return actuales


def expandir_item_ingrediente(page, indice: int) -> bool:
    for fr in _frames_pagina(page):
        try:
            out = fr.evaluate(JS_EXPANDIR_ITEM_INGREDIENTE, indice)
        except Exception:
            out = None
        if isinstance(out, dict) and out.get("ok"):
            try:
                page.wait_for_timeout(350)
            except Exception:
                pass
            return True
    return expandir_item_formulario(page, indice)


def escribir_ingrediente_asterisco(page, indice: int, valor: str) -> bool:
    if not valor:
        return False
    for fr in _frames_pagina(page):
        try:
            out = fr.evaluate(JS_FOCO_INGREDIENTE, {"indice": indice, "valor": valor})
        except Exception:
            out = None
        if isinstance(out, dict) and _valor_quedo(str(out.get("wrote") or ""), valor):
            return True
        try:
            loc = fr.locator(f'[data-crc-ing-hit="{indice}"]')
            if hasattr(loc, "count") and loc.count():
                item = loc.first if hasattr(loc, "first") else loc
                if escribir_valor(page, item, valor, exigir_lienzo=False) or _tipear_teclado(
                    page, item, valor
                ):
                    return True
        except Exception:
            pass
        try:
            leido = fr.evaluate(JS_LEER_INGREDIENTE, indice)
            if isinstance(leido, dict) and _valor_quedo(str(leido.get("value") or ""), valor):
                return True
        except Exception:
            pass
        get_by_label = getattr(fr, "get_by_label", None)
        if get_by_label:
            try:
                loc = get_by_label(re.compile(r"^Ingrediente(\s*\*)?$", re.I))
                n = loc.count() if hasattr(loc, "count") else 0
                if n and indice < n:
                    item = loc.nth(indice)
                    if escribir_valor(page, item, valor, exigir_lienzo=False) or _tipear_teclado(
                        page, item, valor
                    ):
                        return True
            except Exception:
                pass
    return rellenar_por_label(
        page,
        r"^Ingrediente$",
        valor,
        nth=indice,
        excluir=r"título de la sección|lista|ingredientes",
        usar_get_by_label=False,
    )


def _contar_instrucciones_internas(page) -> int:
    for fr in _frames_pagina(page):
        try:
            n = int(fr.evaluate(JS_CONTAR_INSTRUCCIONES_INTERNAS) or 0)
        except Exception:
            continue
        if n:
            return n
    return 0


def asegurar_n_instrucciones(page, n: int) -> int:
    actuales = _contar_instrucciones_internas(page)
    if actuales == 0:
        expandir_todos_items_formulario(page)
        expandir_item_formulario(page, 0)
        try:
            page.wait_for_timeout(400)
        except Exception:
            pass
        actuales = _contar_instrucciones_internas(page)
        print(f"  · Tras abrir acordeones: {actuales} instrucciones visibles")
    intentos = 0
    while actuales < n and intentos < n + 2:
        if not click_agregar_ingrediente_interno(page):
            break
        intentos += 1
        expandir_todos_items_formulario(page)
        actuales = _contar_instrucciones_internas(page)
    return actuales


def escribir_instruccion_interna(page, indice: int, valor: str) -> bool:
    if not valor:
        return False
    for fr in _frames_pagina(page):
        try:
            out = fr.evaluate(JS_FOCO_INSTRUCCION, {"indice": indice, "valor": valor})
        except Exception:
            out = None
        if isinstance(out, dict) and _valor_quedo(str(out.get("wrote") or ""), valor):
            return True
        try:
            loc = fr.locator(f'[data-crc-inst-hit="{indice}"]')
            if hasattr(loc, "count") and loc.count():
                item = loc.first if hasattr(loc, "first") else loc
                if escribir_valor(page, item, valor, exigir_lienzo=False) or _tipear_teclado(
                    page, item, valor
                ):
                    return True
        except Exception:
            pass
        get_by_label = getattr(fr, "get_by_label", None)
        if get_by_label:
            try:
                loc = get_by_label(
                    re.compile(r"^(Instrucci[oó]n|Paso|Descripci[oó]n|Texto)(\s*\*)?$", re.I)
                )
                n = loc.count() if hasattr(loc, "count") else 0
                if n and indice < n:
                    item = loc.nth(indice)
                    if escribir_valor(page, item, valor, exigir_lienzo=False) or _tipear_teclado(
                        page, item, valor
                    ):
                        return True
            except Exception:
                pass
    return rellenar_por_label(
        page,
        r"^(Instrucci|Paso|Descripción|Texto)\b",
        valor,
        nth=indice,
        excluir=r"título|meta|lista de instrucciones",
        usar_get_by_label=False,
    )


def rellenar_item_instruccion(page, indice: int, texto: str) -> bool:
    print(f"  · Despliego Instrucción {indice + 1}…")
    expandir_item_ingrediente(page, indice) or expandir_item_formulario(page, indice)
    ok = escribir_instruccion_interna(page, indice, texto)
    if ok:
        print(f"  ✓ instrucciones[{indice}] → {texto[:70]}")
    else:
        print(f"  ✗ instrucciones[{indice}] (no pude escribir el paso)")
    return ok


def rellenar_item_ingrediente(page, indice: int, item: dict) -> bool:
    """Despliega el ítem interno (Ingrediente*) y escribe la línea del Word."""
    print(f"  · Despliego Ingrediente {indice + 1}…")
    if not expandir_item_ingrediente(page, indice):
        print(f"  · ingredientes[{indice}]: sigo aunque no abrí el acordeón")
    texto = linea_ingrediente(item) or (item.get("nombre") or "").strip()
    if not texto:
        return False
    ok = escribir_ingrediente_asterisco(page, indice, texto)
    if ok:
        print(f"  ✓ ingredientes[{indice}] → {texto}")
    else:
        print(f"  ✗ ingredientes[{indice}] (no pude escribir en Ingrediente*)")
    return ok


def fill_lista_acordeones(page, items: list[dict], tipo: str) -> int:
    """Rellena 'Edición de Lista Ingredientes/Instrucciones' ítem a ítem."""
    clave = "ingredientes" if tipo == "ingredientes" else "instrucciones"
    if not puede_rellenar_editor(page, clave):
        print(f"  · No relleno {tipo}: no estoy en su editor (sigo en {editor_actual(page)}).")
        return 0
    if not items:
        return 0
    if tipo == "ingredientes":
        resolver_borrador_editor(page)
        info = expandir_todos_items_formulario(page)
        print(
            f"  · Abro Formulario Ítem (cerrado no hay Ingrediente*): "
            f"cabezales={info.get('heads')} cajas={info.get('cajas')}"
        )
        rellenar_por_label(
            page,
            r"Título de la sección",
            "Ingredientes",
            nth=0,
        )
        print("  · Completo la lista interna Ingrediente* (no una sección nueva).")
        expandir_todos_items_formulario(page)
        asegurar_n_ingredientes(page, len(items))
        llenados_dir = 0
        for i, item in enumerate(items):
            if rellenar_item_ingrediente(page, i, item):
                llenados_dir += 1
        if llenados_dir:
            return llenados_dir
        lineas = [linea_ingrediente(it) for it in items if linea_ingrediente(it)]
        n_lab = fill_repetidos_por_label(
            page,
            r"^Ingrediente$",
            lineas,
            excluir=r"título de la sección|lista|ingredientes",
        )
        if n_lab:
            return n_lab
    else:
        resolver_borrador_editor(page)
        info = expandir_todos_items_formulario(page)
        print(
            f"  · Abro Formulario Ítem (Título* es requerido): "
            f"cabezales={info.get('heads')} inst={info.get('inst')}"
        )
        titulo = titulo_lista_instrucciones()
        if escribir_titulo_lista_instrucciones(page, titulo):
            print(f"  ✓ Título de la lista → {titulo}")
        else:
            print("  · No pude escribir Título* (sigo con Paso a Paso en HTML).")
        html = html_pasos(items)
        activar_html_paso_a_paso(page)
        if html and escribir_paso_a_paso_html(page, html):
            print("  ✓ Paso a Paso (HTML) con etiquetas <p>/<strong>")
            return max(1, len([it for it in items if linea_paso(it)]))
        print("  ✗ Paso a Paso no quedó con etiquetas HTML. No escribo texto plano.")
        return 0

    n_acc = contar_acordeones(page)
    if n_acc <= 0:
        asegurar_filas_lista(page, len(items))
        n_acc = contar_acordeones(page)
    else:
        asegurar_filas_lista(page, len(items))
    llenados = 0
    for i, item in enumerate(items):
        if n_acc and not expandir_acordeon(page, i):
            print(f"  ✗ {tipo}[{i}]: no hay acordeón")
            continue
        try:
            page.wait_for_timeout(250)
        except Exception:
            pass
        fields = campos_visibles(page)
        pares = asignar_campos_item(fields, item, tipo)
        if tipo == "ingredientes" and not any(a[0] == "nombre" for a in pares):
            linea = linea_ingrediente(item)
            if linea:
                pares = [("nombre", "", linea)] + pares
        ok_item = False
        for rol, sel, valor in pares:
            if sel and not selector_es_generico(sel) and _fill_locator(page, sel, valor):
                print(f"  ✓ {tipo}[{i}].{rol}")
                ok_item = True
                continue
            field = next((f for f in fields if f.get("selectorSugerido") == sel), None)
            if field and field.get("index") is not None and fill_por_indice_visible(page, field["index"], valor):
                print(f"  ✓ {tipo}[{i}].{rol} (índice)")
                ok_item = True
                continue
            patron = r"^Ingrediente$" if tipo == "ingredientes" and rol == "nombre" else ""
            if patron and rellenar_por_label(page, patron, valor, nth=i):
                print(f"  ✓ {tipo}[{i}].{rol} (etiqueta)")
                ok_item = True
                continue
            print(f"  ✗ {tipo}[{i}].{rol} ({sel or 'sin selector'})")
        if ok_item:
            llenados += 1
        else:
            print(f"  ✗ {tipo}[{i}]: sin campos emparejados")
    return llenados


def fill_from_receta(
    page, receta: dict, selectores: dict, dry_run: bool, url_ficha: str | None = None
) -> bool:
    resultados = {}
    url_ficha = url_ficha or url_actual(page)
    if es_lista_proyectos_cms(url_ficha):
        print(
            "\nChromium está en «Proyectos en JUMBO», no en la receta.\n"
            "Abre Recetas_Jumbo → la receta (5 bloques al centro) y reintenta.\n"
            "Los 5 bloques van al centro (pueden estar vacíos).\n"
            "No pulses la paleta izquierda.",
            file=sys.stderr,
        )
        return False
    if avisar_si_salio_de_default(page):
        return False
    if gestor_sin_ficha(url_ficha) or en_vista_default_cms(page):
        print(
            "  · Completando los 5 bloques (Cabecera → tags → ingredientes → pasos → SEO)."
        )

    def fill(key: str, value: str | None) -> bool:
        if value is None or value == "":
            return False
        if key in ("field_tiempo", "field_porciones", "field_tiempo_prep", "field_tiempo_coccion"):
            value = numero_campo_bm(value) or value
        sel = selectores.get(key)
        if key == "field_dificultad":
            return elegir_dificultad(page, str(value))
        if key == "field_titulo":
            if rellenar_titulo_cabecera(page, value):
                print(f"  ✓ field_titulo → {value}")
                return True
            if sel and not selector_es_generico(sel) and _fill_locator(page, sel, value):
                print(f"  ✓ {key}")
                return True
            print("  ✗ field_titulo (el input sigue en «Dale un valor»)")
            return False
        if key in ("field_tiempo", "field_porciones", "field_tiempo_prep", "field_tiempo_coccion"):
            patron_n = LABELS_EDITOR_BM.get(key) or r"^Duración\b"
            if rellenar_numero_cabecera(page, patron_n, value):
                print(f"  ✓ {key} → {value}")
                return True
        if selector_es_generico(sel):
            sel = None
        label_dir = LABELS_EDITOR_BM.get(key)
        if label_dir and rellenar_por_label(
            page, label_dir, value, excluir=r"título de la sección|meta"
        ):
            print(f"  ✓ {key} (label BM)")
            return True
        if sel and _fill_locator(page, sel, value):
            print(f"  ✓ {key}")
            return True
        patron = ETIQUETAS_CAMPO.get(key)
        if patron and fill_por_etiqueta(page, patron, value, key=key):
            print(f"  ✓ {key} (por etiqueta)")
            return True
        if sel:
            print(f"  ✗ {key} (no encontrado: {sel})")
        else:
            print(f"  · omitido {key} (sin selector ni etiqueta)")
        return False

    def abrir_grupo(clave_comp: str, keys_campo: list[str]) -> bool:
        meta = next((c for c in COMPONENTES_CMS if c["clave"] == clave_comp), None)
        lapiz_key = meta["lapiz_key"] if meta else f"lapiz_{clave_comp}"
        print(f"  [CMS] Abriendo componente «{clave_comp}»…")
        actual = editor_actual(page)
        if actual is None:
            esperar_lienzo_bloques(page)
        if actual is None and bloque_ya_cargado(page, clave_comp):
            print(f"  · Bloque «{clave_comp}» ya tiene contenido. No pido el lápiz.")
            return False
        if actual and actual != clave_comp:
            print(f"  · Sigo en Edición de {actual}; pulso Volver antes de abrir «{clave_comp}».")
            if not guardar_y_volver_al_lienzo(page, url_ficha, forzar_salida=True):
                print(f"  · No salgo de {actual}: no relleno «{clave_comp}» en el header.")
                return False
        abierto = abrir_lapiz_componente(page, clave_comp, selectores.get(lapiz_key))
        if restaurar_ficha_si_salio(page, url_ficha):
            abierto = False
        if not abierto:
            abierto = abrir_componente_para_campos(page, selectores, keys_campo)
        if restaurar_ficha_si_salio(page, url_ficha):
            abierto = False
        actual = editor_actual(page)
        if actual == clave_comp:
            return True
        if actual and actual != clave_comp:
            print(f"  · Estoy en Edición de {actual}, no en {clave_comp}. No relleno aquí.")
            return False
        if parece_cms_vacio(page):
            print(
                f"  · La página está en blanco o sin editor. No relleno «{clave_comp}» a ciegas."
            )
            return False
        if not abierto and actual is None:
            if lienzo_con_bloques_cms(page):
                print(f"  · Sin lápiz para {clave_comp}; no relleno en el lienzo.")
                return False
            if any(selectores.get(k) for k in keys_campo):
                print(f"  · Sin lápiz para {clave_comp}; intento relleno en vista actual.")
                return True
            print(f"  · Sin lápiz para {clave_comp}; no relleno en el lienzo.")
            return False
        if not abierto:
            print(f"  · Sin lápiz para {clave_comp}; no relleno en otra pantalla.")
            return False
        return True

    def fill_grupo(clave_comp: str, pares: list[tuple[str, str | None]]) -> dict[str, bool]:
        pares_ok = [(k, v) for k, v in pares if v is not None and v != ""]
        if not pares_ok:
            return {}
        if not abrir_grupo(clave_comp, [k for k, _ in pares_ok]):
            return {}
        if not puede_rellenar_editor(page, clave_comp):
            return {}
        ok_keys = {}
        for key, value in pares_ok:
            ok_keys[key] = fill(key, value)
        guardar_y_volver_al_lienzo(page, url_ficha)
        return ok_keys

    print("Rellenando la receta completa (lápiz de cada bloque, Cabecera incluida)…")
    print(f"  · Textos «Edita este componente» visibles: {_contar_placeholder_vacio(page)}")
    if _hay_modal_sin_guardar(page):
        print("  · Modal abierto: Cancelar (Sí, acepto borra los tags).")
        resolver_modal_cambios(page, salir=False)
        try:
            page.wait_for_timeout(400)
        except Exception:
            pass
    if editor_actual(page) == "tags":
        print("  · Ya estoy en Formulario Tags. Escribo las etiquetas del Word.")
        n_tags_abierto = fill_lista_tags(page, tags_desde_receta(receta))
        if n_tags_abierto:
            print(f"  ✓ tags: {n_tags_abierto}/{len(tags_desde_receta(receta))}")
        else:
            print("  · Tags en pantalla. Los guardo para que el bloque quede cargado.")
        guardar_y_volver_al_lienzo(page, url_ficha, forzar_salida=True)
    if editor_actual(page) == "ingredientes":
        print("  · Ya estoy en Lista Ingredientes. Escribo los del Word.")
        ings_abiertos = receta.get("ingredientes") or []
        n_ing_abierto = fill_lista_acordeones(page, ings_abiertos, "ingredientes")
        if n_ing_abierto:
            resultados["ingredientes"] = True
            print(f"  ✓ ingredientes: {n_ing_abierto}/{len(ings_abiertos)} ítems")
            guardar_y_volver_al_lienzo(page, url_ficha, forzar_salida=True)
        else:
            print("  · No pude escribir los ingredientes. No pulso Volver ni abro otro bloque.")
            return False
    if editor_actual(page) == "instrucciones":
        print("  · Ya estoy en Lista de Instrucciones. Escribo los pasos del Word.")
        inst_abiertos = receta.get("pasos") or []
        n_inst_abierto = fill_lista_acordeones(page, inst_abiertos, "instrucciones")
        if n_inst_abierto:
            resultados["pasos"] = True
            print(f"  ✓ pasos: {n_inst_abierto}/{len(inst_abiertos)} ítems")
            guardar_y_volver_al_lienzo(page, url_ficha, forzar_salida=True)
        else:
            print("  · No pude escribir las instrucciones. No pulso Volver ni abro otro bloque.")
            return False
    if editor_actual(page) == "seo":
        print("  · Ya estoy en SEO HTML. Enciendo HTML + Script y pego las etiquetas.")
        if rellenar_seo_html(page, receta):
            resultados["seo"] = True
            guardar_y_volver_al_lienzo(page, url_ficha, forzar_salida=True)
        else:
            print("  · No pude escribir SEO HTML. No pulso Volver ni abro otro bloque.")
            return False
    if editor_actual(page) is None and bloque_ya_cargado(page, "cabecera"):
        print("  · Cabecera ya tiene contenido en el lienzo. Sigo con tags e ingredientes.")
        resultados["titulo"] = True
        resultados["descripcion"] = True
    elif abrir_grupo("cabecera", ["field_titulo", "field_descripcion", "field_dificultad"]):
        cabecera = {
            "field_titulo": fill("field_titulo", receta.get("titulo")),
            "field_descripcion": fill("field_descripcion", receta.get("descripcion")),
            "field_porciones": fill(
                "field_porciones", numero_campo_bm(receta.get("porciones"))
            ),
            "field_dificultad": fill("field_dificultad", receta.get("dificultad")),
            "field_tiempo": fill("field_tiempo", duracion_receta(receta)),
            "field_alt": fill("field_alt", alt_portada(receta)),
        }
        if sigue_dato_requerido(page):
            print("  · Título sigue vacío (dato requerido). Lo escribo otra vez.")
            cabecera["field_titulo"] = fill("field_titulo", receta.get("titulo"))
        if sigue_duracion_invalida(page):
            print("  · Duración quedó en 0. Escribo 30 (o el tiempo del Word).")
            cabecera["field_tiempo"] = fill("field_tiempo", duracion_receta(receta) or "30")
        subir_imagen_portada(page, receta)
        try:
            page.wait_for_timeout(800)
        except Exception:
            pass
        if not guardar_y_volver_al_lienzo(page, url_ficha):
            print("  · Cabecera incompleta o no pude volver al lienzo. Me detengo aquí.")
            resultados["titulo"] = cabecera.get("field_titulo", False)
            resultados["descripcion"] = cabecera.get("field_descripcion", False)
            llenados = sum(1 for v in resultados.values() if v)
            return llenados > 0
        resultados["titulo"] = cabecera.get("field_titulo", False)
        resultados["descripcion"] = cabecera.get("field_descripcion", False)
    else:
        cabecera = {}
        resultados["titulo"] = False
        resultados["descripcion"] = False

    cats = tags_desde_receta(receta)
    if abrir_grupo("tags", ["field_tags"]) and puede_rellenar_editor(page, "tags"):
        n_tags = fill_lista_tags(page, cats)
        if n_tags:
            print(f"  ✓ tags: {n_tags}/{len(cats)}")
        guardar_y_volver_al_lienzo(page, url_ficha, forzar_salida=True)
        vacio_tags = bloque_componente_vacio(page, ["tags", "Tags"])
        if vacio_tags:
            print("  · El bloque tags sigue vacío. Lo abro, guardo y vuelvo.")
            if abrir_grupo("tags", ["field_tags"]) and puede_rellenar_editor(page, "tags"):
                fill_lista_tags(page, cats)
                guardar_y_volver_al_lienzo(page, url_ficha, forzar_salida=True)
            vacio_tags = bloque_componente_vacio(page, ["tags", "Tags"])
        if vacio_tags is False:
            print("  ✓ Bloque tags cargado en el lienzo")
            resultados["tags"] = True

    ings = receta.get("ingredientes") or []
    if abrir_grupo("ingredientes", ["field_ingredientes"]) and puede_rellenar_editor(
        page, "ingredientes"
    ):
        n_ing = fill_lista_acordeones(page, ings, "ingredientes")
        if n_ing:
            resultados["ingredientes"] = True
            print(f"  ✓ ingredientes: {n_ing}/{len(ings)} ítems de acordeón")
            guardar_y_volver_al_lienzo(page, url_ficha, forzar_salida=True)
        elif editor_actual(page) is None and not lienzo_con_bloques_cms(page):
            resultados["ingredientes"] = fill(
                "field_ingredientes",
                "\n".join(linea_ingrediente(i) for i in ings if linea_ingrediente(i)),
            )
            guardar_y_volver_al_lienzo(page, url_ficha, forzar_salida=True)
        else:
            print("  · No pude escribir los ingredientes. No pulso Volver ni abro otro bloque.")
            return bool(sum(1 for v in resultados.values() if v))
    else:
        resultados.setdefault("ingredientes", False)

    pasos = receta.get("pasos") or []
    if abrir_grupo("instrucciones", ["field_pasos"]) and puede_rellenar_editor(
        page, "instrucciones"
    ):
        n_pas = fill_lista_acordeones(page, pasos, "instrucciones")
        if n_pas:
            resultados["pasos"] = True
            print(f"  ✓ pasos: {n_pas}/{len(pasos)} ítems de acordeón")
            guardar_y_volver_al_lienzo(page, url_ficha, forzar_salida=True)
        elif editor_actual(page) is None:
            resultados["pasos"] = fill("field_pasos", texto_pasos(pasos))
            guardar_y_volver_al_lienzo(page, url_ficha, forzar_salida=True)
        else:
            print("  · No pude escribir las instrucciones. No pulso Volver ni abro otro bloque.")
            return bool(sum(1 for v in resultados.values() if v))
    else:
        resultados.setdefault("pasos", False)

    if abrir_grupo("seo", ["field_seo_html"]) and puede_rellenar_editor(page, "seo"):
        if rellenar_seo_html(page, receta):
            resultados["seo"] = True
            guardar_y_volver_al_lienzo(page, url_ficha, forzar_salida=True)
        else:
            print("  · No pude escribir SEO HTML. No pulso Volver ni abro otro bloque.")
            return bool(sum(1 for v in resultados.values() if v))
    else:
        resultados.setdefault("seo", False)

    llenados = sum(1 for v in resultados.values() if v)
    if llenados == 0:
        print(
            "\nNo se rellenó ningún campo.\n"
            "En Chromium deja abierta la receta en el Gestor de contenido\n"
            "(5 bloques al CENTRO: Cabecera / tags / Ingredientes / Instrucciones / SEO).\n"
            "No pulses la paleta izquierda ni «Proyectos». No entres a «Edición de Lista…».",
            file=sys.stderr,
        )
        return False

    if dry_run:
        btn = selectores.get("btn_guardar_borrador")
        ambiguo = not btn or selector_es_generico(btn) or str(btn).strip() in (
            'text="Guardar"',
            "text=Guardar",
            'button:has-text("Guardar")',
        )
        if btn and not ambiguo:
            try:
                page.locator(btn).first.click(timeout=5_000)
                print("Clic en guardar borrador (dry-run).")
            except Exception as e:
                print(f"No se pudo guardar borrador: {e}")
        else:
            print("Dry-run: cada editor se guardó con su lápiz. No publico.")
        return True
    else:
        fallos_requeridos = [
            campo for campo in CAMPOS_REQUERIDOS_PUBLICACION if not resultados.get(campo, False)
        ]
        if fallos_requeridos:
            print(
                "Publicación abortada: falló el rellenado de campos requeridos: "
                + ", ".join(fallos_requeridos),
                file=sys.stderr,
            )
            return False
        btn = selectores.get("btn_publicar")
        if btn:
            page.locator(btn).first.click()
            print("Solicitud de publicación enviada; confirma el resultado en BM.")
            return True
        else:
            print("Sin selector btn_publicar.", file=sys.stderr)
            return False


def main() -> int:
    ap = argparse.ArgumentParser(description="Explorar / mapear Business Manager Cencosud en local")
    ap.add_argument("--fill-json", type=Path, help="Tras mapear, rellenar esta receta JSON")
    ap.add_argument("--publish", action="store_true", help="Permitir clic en Publicar (default: solo borrador/dry-run)")
    ap.add_argument("--reuse-session", action="store_true", help="Reutilizar secrets/bm-session.json si existe")
    ap.add_argument(
        "--remap",
        action="store_true",
        help="Solo regenera bm-selectores.json desde bm-estructura.json (sin abrir el navegador)",
    )
    ap.add_argument(
        "--no-auto-lapiz",
        action="store_true",
        help="No abrir lápices automáticamente (solo captura la vista actual)",
    )
    ap.add_argument("--timeout-ms", type=int, default=300_000, help="Espera máxima login manual")
    args = ap.parse_args()

    if args.remap:
        try:
            sugeridos = remapear_desde_estructura()
        except FileNotFoundError:
            print(
                f"No existe {ESTRUCTURA_PATH.relative_to(ROOT)}. Corre antes sin --remap.",
                file=sys.stderr,
            )
            return 1
        print(f"Selectores regenerados → {MAPA_SELECTORES_PATH.relative_to(ROOT)}")
        utiles = sum(1 for v in sugeridos.values() if v)
        print(f"Claves con valor: {utiles}/{len(sugeridos)}")
        for k, v in sugeridos.items():
            print(f"  {k}: {v}")
        if utiles < 2:
            print(
                "\nAún hay pocos selectores. Abre bm-estructura.json y revisa si los fields traen label/placeholder.\n"
                "Si capturaste una pantalla sin el formulario, vuelve a explorar con la ficha abierta.",
                file=sys.stderr,
            )
            return 2
        return 0

    receta = None
    if args.publish and not args.fill_json:
        print("--publish requiere --fill-json.", file=sys.stderr)
        return 2
    if args.fill_json:
        path = args.fill_json.expanduser().resolve()
        if not path.exists():
            print(f"No existe JSON: {path}", file=sys.stderr)
            return 1
        receta = json.loads(path.read_text(encoding="utf-8"))
        if args.publish:
            errores_preflight = errores_prepublicacion(receta)
            if errores_preflight:
                print("Publicación bloqueada antes de abrir el navegador:", file=sys.stderr)
                for error in errores_preflight:
                    print(f"  - {error}", file=sys.stderr)
                return 3

    SECRETS.mkdir(parents=True, exist_ok=True)
    env = load_env(ENV_PATH)
    base = _RUTAS.url_inicio_bm(env)
    dry_run = not args.publish

    if not ENV_PATH.exists():
        print(
            f"Crea {ENV_PATH.relative_to(ROOT)} copiando secrets/env.example\n"
            "Pon ahí CENCOSUD_BM_USER y CENCOSUD_BM_PASSWORD (solo en tu PC)."
        )

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Instala: pip install playwright && playwright install chromium", file=sys.stderr)
        return 1

    print("=== Exploración BM Cencosud (local) ===")
    print(f"Carpeta CRC: {CRC}")
    print(f"Secrets:     {SECRETS}")
    print(f"URL: {base}")
    print("1) Se abre Chromium.")
    print("2) Inicia sesión (automático si .env tiene user/pass; si no, a mano / MFA).")
    print("3) Quedas en el Gestor de recetas (view-manager). Abre la receta que ya existe.")
    print("4) Debes ver los 5 bloques al CENTRO (no la paleta). Pulsa ENTER.")
    print("5) El scraping abre SOLO cada lápiz (Cabecera, tags, ingredientes,")
    print("   instrucciones, SEO), captura campos y cierra el editor.")
    print("6) Tú no debes hacer clic en los lápices.")
    print("7) El navegador NO se cierra solo: revisa y pulsa ENTER otra vez.")
    print()

    resultado = 0
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context_kwargs = {"viewport": {"width": 1400, "height": 900}}
        if args.reuse_session and SESSION_PATH.exists():
            context_kwargs["storage_state"] = str(SESSION_PATH)
            print(f"Reusando sesión: {SESSION_PATH}")
        context = browser.new_context(**context_kwargs)
        page = context.new_page()
        page.goto(base, wait_until="domcontentloaded")
        try_login(page, env)

        print(MENSAJE_ENTER_FICHA)
        try:
            input()
        except EOFError:
            print("Sin TTY: esperando 60s para que completes login/navegación…")
            page.wait_for_timeout(60_000)
        url_ficha = esperar_ficha_en_lienzo(page, headed=True)

        if args.no_auto_lapiz:
            estructura = dump_estructura(page)
            sugeridos = sugerir_selectores(estructura)
        else:
            print("\nAbriendo lápices automáticamente…")
            estructura, sugeridos = capturar_cms_por_componentes(page)

        estructura["capturadoEn"] = datetime.now(timezone.utc).isoformat()
        ESTRUCTURA_PATH.write_text(json.dumps(estructura, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        DIAGNOSTICO_PATH.write_text(
            json.dumps(dump_diagnostico_frames(page), ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        page.screenshot(path=str(SCREENSHOT_PATH), full_page=True)
        context.storage_state(path=str(SESSION_PATH))

        # fusionar con mapa previo si existe
        if MAPA_SELECTORES_PATH.exists():
            prev = json.loads(MAPA_SELECTORES_PATH.read_text(encoding="utf-8"))
            for k, v in sugeridos.items():
                if v:
                    prev[k] = v
                elif k not in prev:
                    prev[k] = v
            sugeridos = prev
        MAPA_SELECTORES_PATH.write_text(json.dumps(sugeridos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        utiles = sum(1 for v in sugeridos.values() if v)
        print(f"\nGuardado:")
        print(f"  estructura: {ESTRUCTURA_PATH.relative_to(ROOT)}")
        print(f"  selectores: {MAPA_SELECTORES_PATH.relative_to(ROOT)}")
        print(f"  screenshot: {SCREENSHOT_PATH.relative_to(ROOT)}")
        print(f"  sesión:     {SESSION_PATH.relative_to(ROOT)}")
        print(f"  diagnóstico: {DIAGNOSTICO_PATH.relative_to(ROOT)}")
        print(
            "  ↑ este último es el que sirve para ajustar selectores: trae los campos\n"
            "    y botones de cada frame. No lleva contraseñas ni cookies\n"
            "    (esas están solo en bm-session.json, que no se comparte)."
        )
        print(f"\nURL: {estructura.get('url')}")
        print(f"Campos detectados: {len(estructura.get('fields') or [])}")
        print(f"Botones: {len(estructura.get('buttons') or [])}")
        print(f"Selectores con valor: {utiles}/{len(sugeridos)}")
        print("Selectores sugeridos:")
        for k, v in sugeridos.items():
            print(f"  {k}: {v}")

        # Diagnóstico corto de fields (ayuda si el CMS no expuso labels)
        fields = estructura.get("fields") or []
        if fields:
            print("\nResumen fields capturados:")
            for i, field in enumerate(fields[:30]):
                print(
                    "  [{i}] comp={comp!r} label={label!r} ph={ph!r} id={id!r}".format(
                        i=i,
                        comp=field.get("componente"),
                        label=(field.get("label") or "")[:70],
                        ph=(field.get("placeholder") or "")[:40],
                        id=field.get("id"),
                    )
                )

        cms_info = (estructura.get("cms") or {}) if isinstance(estructura.get("cms"), dict) else {}
        if utiles < 2:
            print(
                "\n⚠ Pocos selectores. Revisa que la receta esté abierta en el Gestor\n"
                "  de contenido y vuelve a explorar (el script abre los lápices solo).\n"
                "  Si el DOM del BM cambió, avisa para ajustar detectores.",
                file=sys.stderr,
            )
        elif cms_info.get("autoLapiz"):
            print(
                f"\n✓ Captura CMS por componentes ({len(cms_info.get('porComponente') or {})} editores)."
            )

        if args.fill_json:
            carga_exitosa = fill_from_receta(
                page, receta, sugeridos, dry_run=dry_run, url_ficha=url_ficha
            )
            if not carga_exitosa:
                resultado = 4
            elif args.publish:
                receta["estado"] = "cargado"
                path.write_text(json.dumps(receta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print("\nRevisa la ventana del BM. Si faltó algún campo, edita secrets/bm-selectores.json y reintenta.")

        print("\nPulsa ENTER para cerrar el navegador…")
        try:
            input()
        except EOFError:
            page.wait_for_timeout(10_000)

        browser.close()

    print(
        "\nSiguiente: si los selectores están bien,\n"
        "  python scripts\\publicar-receta-cencosud.py out\\….json --headed --dry-run\n"
        "El publicador también abre los lápices solo al rellenar."
    )
    return resultado


if __name__ == "__main__":
    raise SystemExit(main())
