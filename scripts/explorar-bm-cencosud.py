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
        "campos": ("field_meta_titulo", "field_meta_descripcion"),
    },
)

# El lienzo de la receta está al centro. A la izquierda está la paleta
# («Cabecera», «tags»…): un clic ahí saca a /cms/projects.
LIENZO_MIN_X = 240

MENSAJE_ENTER_FICHA = (
    "\n>>> En Chromium abre la receta YA guardada (no una ficha vacía).\n"
    "    Los 5 bloques van al CENTRO: Cabecera / tags / Ingredientes /\n"
    "    Instrucciones / SEO.\n"
    "    Si la Cabecera YA tiene título/foto (no dice «componente vacío»),\n"
    "    déjala así: el script no la toca y sigue con tags.\n"
    "    Si ves 5 bloques VACÍOS, no es esa ficha: volvé a Recetas_Jumbo\n"
    "    → la receta hasta la vista donde Cabecera ya está llena.\n"
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


def salio_de_la_ficha(actual: str | None, url_ficha: str | None) -> bool:
    if not url_ficha or not actual:
        return False
    a = actual.split("#")[0].rstrip("/")
    f = url_ficha.split("#")[0].rstrip("/")
    if a == f:
        return False
    if es_lista_proyectos_cms(actual):
        return True
    return "view-manager" in url_ficha and "view-manager" not in actual


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


def esperar_ficha_en_lienzo(page, *, headed: bool = True) -> str:
    """Tras ENTER: si Chromium está en Proyectos o el Gestor vacío, pedir la receta."""
    url_ficha = url_actual(page)
    if not es_lista_proyectos_cms(url_ficha) and not gestor_sin_ficha(url_ficha):
        return url_ficha
    if gestor_sin_ficha(url_ficha):
        print(
            "\n>>> Chromium está en el Gestor vacío (sin /view/id), no en la receta guardada.\n"
            "    Entrá a Recetas_Jumbo → la receta. Si la Cabecera ya tenía título/foto,\n"
            "    usá ESA vista (no una Cabecera que diga «componente vacío»).\n"
            "    No pulses la paleta izquierda. ENTER cuando la veas.\n"
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
    """Si un clic nos mandó a Proyectos, volver a la receta ya abierta."""
    if not url_ficha or page is None:
        return False
    actual = url_actual(page)
    if not salio_de_la_ficha(actual, url_ficha):
        return False
    print("  · El navegador salió de la receta; vuelvo a la ficha abierta.")
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


def contar_campos_editables(page) -> int:
    return page.evaluate(
        """() => [...document.querySelectorAll('input, textarea, select, [contenteditable="true"]')]
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
    )


def listar_componentes_cms(page) -> list[dict]:
    """Detecta bloques del Gestor de contenido (Cabecera, tags, listas, SEO…)."""
    aliases_flat = []
    for comp in COMPONENTES_CMS:
        for alias in comp["aliases"]:
            aliases_flat.append({"clave": comp["clave"], "alias": alias})
    return page.evaluate(
        """(aliasesFlat) => {
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
        if (box.left < 240 || enChrome(el)) continue;
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
    }""",
        aliases_flat,
    )


def abrir_lapiz_componente(page, clave: str, selector_guardado: str | None = None) -> bool:
    """Clic en el lápiz del lienzo (icono del medio). Nunca paleta ni basurero."""
    limpiar_busca_paleta(page)
    resolver_modal_cambios(page)
    if selector_guardado and not selector_es_generico(selector_guardado):
        try:
            if clic_locator_en_lienzo(page, selector_guardado):
                _esperar_editor(page)
                return True
        except Exception:
            pass

    comp = next((c for c in COMPONENTES_CMS if c["clave"] == clave), None)
    if not comp:
        return False
    aliases = list(comp["aliases"])

    if _clic_lapiz_por_fila(page, aliases):
        _esperar_editor(page)
        return True

    clicked = page.evaluate(JS_CLIC_LAPIZ, aliases)
    if clicked:
        _esperar_editor(page)
        return True
    try:
        page.wait_for_timeout(700)
    except Exception:
        pass
    if _clic_lapiz_por_fila(page, aliases):
        _esperar_editor(page)
        return True
    clicked = page.evaluate(JS_CLIC_LAPIZ, aliases)
    if clicked:
        _esperar_editor(page)
        return True
    return False


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
                    "xpath=ancestor::*[count(.//button)>=2 and count(.//button)<=6][1]"
                )
                if hasattr(fila, "count") and fila.count() == 0:
                    continue
                if _bounding_box(fila) is not None and not caja_en_lienzo(_bounding_box(fila)):
                    continue
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
                if n >= 2:
                    medio = 1 if n >= 3 else 1
                    btn = botones.nth(medio)
                    if not caja_en_lienzo(_bounding_box(btn)):
                        continue
                    btn.click(timeout=3_000)
                    return True
        except Exception:
            continue
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


JS_CLIC_LAPIZ = """(aliases) => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const norm = (s) => clean(s).toLowerCase();
  const textoDe = (el) => clean(el.innerText || el.textContent || '');
  const wanted = aliases.map(norm);
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
  const enPaleta = (el) => {
    const r0 = el.getBoundingClientRect();
    if (r0.left < 240) return true;
    let n = el;
    while (n && n !== document.body) {
      const lab = (n.getAttribute && (n.getAttribute('aria-label') || '')) || '';
      const t = textoDe(n).slice(0, 60);
      if (/paleta de componentes/i.test(lab) || /^paleta de componentes/i.test(t)) {
        const r = n.getBoundingClientRect();
        if (r.left < 280 && r.width < 480) return true;
      }
      n = n.parentElement;
    }
    return false;
  };
  const esIcono = (b) => {
    const r = b.getBoundingClientRect();
    const txt = textoDe(b);
    return r.width > 0 && r.height > 0 && r.width <= 64 && r.height <= 64 && txt.length <= 3;
  };
  const blobBtn = (b) => [
    b.getAttribute('aria-label') || '',
    b.getAttribute('title') || '',
    b.getAttribute('data-testid') || '',
    b.className || '',
    b.innerHTML || '',
  ].join(' ');
  const esBasura = (b) => /trash|delete|eliminar|borrar|remove/i.test(blobBtn(b));
  const esHistorial = (b) => /clock|history|historial|time|version/i.test(blobBtn(b));
  const esLapiz = (b) => /edit|editar|pencil|lápiz|lapiz/i.test(blobBtn(b)) && !/create/i.test(blobBtn(b));

  const nodos = Array.from(document.querySelectorAll(
    'div, section, article, li, h2, h3, h4, h5, h6, span, p, strong'
  ));
  const candidatos = [];
  for (const el of nodos) {
    const crudo = el.innerText || el.textContent || '';
    const linea = norm(crudo.split('\\n')[0]);
    if (!wanted.some((w) => linea === w || linea.startsWith(w + ' '))) continue;
    if (crudo.length > 220) continue;
    if (enChrome(el) || enPaleta(el)) continue;
    let cur = el;
    for (let d = 0; d < 10 && cur && cur !== document.body; d++) {
      const cr = cur.getBoundingClientRect();
      if (cr.left < 240 || cr.width > 1400) {
        cur = cur.parentElement;
        continue;
      }
      const iconos = Array.from(cur.querySelectorAll('button, [role="button"]')).filter(esIcono);
      if (iconos.length >= 2 && iconos.length <= 6) {
        const vacio = /Edita este componente/i.test(cur.innerText || cur.textContent || '') ? 10 : 0;
        candidatos.push({ cur, iconos, score: vacio + iconos.length + (cr.left > 280 ? 2 : 0) });
        break;
      }
      cur = cur.parentElement;
    }
  }
  candidatos.sort((a, b) => b.score - a.score);
  for (const c of candidatos) {
    const lapiz = c.iconos.find((b) => esLapiz(b) && !esBasura(b));
    const candidato = lapiz
      || c.iconos.filter((b) => !esBasura(b) && !esHistorial(b))[0]
      || (c.iconos.length >= 3 ? c.iconos[1] : null);
    if (candidato && !esBasura(candidato)) {
      try { c.cur.scrollIntoView({ block: 'center', inline: 'nearest' }); } catch (e) {}
      candidato.click();
      return true;
    }
  }
  return false;
}"""


def _clic_guardar_editor(page) -> bool:
    for sel in (
        "button:has-text('Guardar')",
        "[role='button']:has-text('Guardar')",
        "button[type='submit']",
        "button:has-text('Aplicar')",
        "button:has-text('Listo')",
        "button:has-text('Done')",
    ):
        try:
            loc = page.locator(sel)
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
                if "publicar" in txt:
                    continue
                btn.click(timeout=2_500)
                page.wait_for_timeout(600)
                return True
        except Exception:
            continue
    return False


def cerrar_editor_componente(page) -> None:
    """Guarda el editor del lápiz. Nunca «Sí, acepto»."""
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


def parece_guardado_ok(page) -> bool:
    try:
        t = page.evaluate("() => (document.body && document.body.innerText) || ''")
    except Exception:
        return False
    return isinstance(t, str) and bool(re.search(r"guardado satisfactoriamente", t, re.I))


def sigue_dato_requerido(page) -> bool:
    try:
        t = page.evaluate("() => (document.body && document.body.innerText) || ''")
    except Exception:
        return False
    return isinstance(t, str) and "el dato es requerido" in t.lower()


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
    """True si se ven los bloques del Gestor (Cabecera + tags), no un formulario plano."""
    try:
        t = page.evaluate("() => (document.body && document.body.innerText) || ''")
    except Exception:
        return False
    if not isinstance(t, str):
        return False
    return bool(
        re.search(r"cabecera", t, re.I)
        and re.search(r"\btags\b", t, re.I)
        and editor_actual(page) is None
    )


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
    try:
        return page.evaluate(JS_BLOQUE_VACIO, list(aliases))
    except Exception:
        return None


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
        try:
            t = page.evaluate("() => (document.body && document.body.innerText) || ''")
        except Exception:
            t = ""
        if (
            isinstance(t, str)
            and re.search(r"cabecera", t, re.I)
            and re.search(r"\btags\b", t, re.I)
            and editor_actual(page) is None
        ):
            return True
        try:
            page.wait_for_timeout(300)
        except Exception:
            break
    return editor_actual(page) is None


def volver_al_lienzo(page, url_ficha: str | None = None) -> bool:
    """Sale de «Edición de Cabecera» al lienzo. No toca Proyectos ni la paleta."""
    if editor_actual(page) is None and not es_lista_proyectos_cms(url_actual(page)):
        return True
    try:
        page.evaluate(JS_VOLVER_AL_LIENZO)
        page.wait_for_timeout(500)
    except Exception:
        pass
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
        if es_lista_proyectos_cms(url_actual(page)) and url_ficha and not es_lista_proyectos_cms(url_ficha):
            try:
                page.goto(url_ficha, wait_until="domcontentloaded", timeout=60_000)
            except Exception:
                pass
        if editor_actual(page) is None and not es_lista_proyectos_cms(url_actual(page)):
            print("  · Volví al lienzo (5 bloques)")
            esperar_lienzo_bloques(page)
            return True
    return editor_actual(page) is None and not es_lista_proyectos_cms(url_actual(page))


def guardar_y_volver_al_lienzo(page, url_ficha: str | None = None) -> bool:
    """Guarda el editor y vuelve a los 5 bloques. Si no sale, no abre el siguiente."""
    cerrar_editor_componente(page)
    try:
        page.wait_for_timeout(400)
    except Exception:
        pass
    if editor_actual(page) is None:
        return True
    resolver_modal_cambios(page)
    if _clic_guardar_editor(page):
        try:
            page.wait_for_timeout(500)
        except Exception:
            pass
    if editor_actual(page) is None:
        return True
    if parece_guardado_ok(page) or not sigue_dato_requerido(page):
        if volver_al_lienzo(page, url_ficha):
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
    "cabecera": re.compile(r"edici[oó]n de\s+(cabecera|header)", re.I),
    "tags": re.compile(r"edici[oó]n de\s+(lista\s+)?(tags?|etiquetas?)", re.I),
    "ingredientes": re.compile(r"edici[oó]n de\s+lista\s+ingredientes|list_ingredients", re.I),
    "instrucciones": re.compile(
        r"edici[oó]n de\s+lista\s+de\s+instrucciones|list_instructions", re.I
    ),
    "seo": re.compile(r"edici[oó]n de\s+seo", re.I),
}


def texto_editor(page) -> str:
    try:
        raw = page.evaluate(
            """() => {
              const hs = [...document.querySelectorAll('h1,h2,h3')]
                .map((el) => (el.innerText || '').replace(/\\s+/g, ' ').trim())
                .filter(Boolean);
              return [document.title || '', ...hs].join(' | ');
            }"""
        )
    except Exception:
        return ""
    return raw if isinstance(raw, str) else ""


def editor_actual(page) -> str | None:
    t = texto_editor(page)
    if not t:
        return None
    for clave, pat in TITULOS_EDITOR.items():
        if pat.search(t):
            return clave
    return None


def puede_rellenar_editor(page, clave: str) -> bool:
    """No escribir tags/ingredientes si seguimos en Edición de Cabecera."""
    actual = editor_actual(page)
    if actual is None:
        return True
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
    "button:has-text('Agregar')",
    "button:has-text('Añadir')",
    "button:has-text('Add')",
    "button:has-text('Nuevo')",
    "[aria-label*='Agregar' i]",
    "[aria-label*='Añadir' i]",
    "[aria-label*='Add' i]",
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
    return " ".join(
        filter(
            None,
            [
                str(item.get("cantidad") or "").strip(),
                str(item.get("unidad") or "").strip(),
                str(item.get("nombre") or "").strip(),
            ],
        )
    ).strip()


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
    const linea = crudo.split(' El dato')[0].replace(/\\*$/, '').trim();
    if (!re.test(linea) && !re.test(crudo)) continue;
    if (reEx && (reEx.test(linea) || reEx.test(crudo))) continue;
    let input = null;
    const htmlFor = lab.getAttribute && lab.getAttribute('for');
    if (htmlFor) input = document.getElementById(htmlFor);
    if (!esControl(input)) {
      const box = lab.closest('[class*="field"], [class*="Field"], [class*="form"], [class*="Form"], li, section, div');
      if (box) {
        input = Array.from(box.querySelectorAll('input, textarea, select, [contenteditable="true"], [role="combobox"]')).find(esControl) || null;
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
    seen.add(input);
    input.setAttribute('data-crc-label-hit', String(n));
    n += 1;
  }
  return n;
}"""


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
  if (desc && desc.set) desc.set.call(el, v);
  else if (el.getAttribute('contenteditable') === 'true') el.textContent = v;
  else el.value = v;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}"""


def escribir_valor(page, loc, value) -> bool:
    if loc is None or value is None or value == "":
        return False
    texto = str(value)
    if texto.strip().lower() in {"dale un valor", "ingresa un valor", "ingresa", "0"}:
        return False
    box = _bounding_box(loc)
    if box is not None:
        try:
            if float(box.get("x") or 0) < LIENZO_MIN_X:
                print("  · No escribo en la paleta.")
                return False
        except (TypeError, ValueError):
            pass
    try:
        loc.fill(texto, timeout=3_000)
        return True
    except TypeError:
        try:
            loc.fill(texto)
            return True
        except Exception:
            pass
    except Exception:
        pass
    try:
        loc.evaluate(
            """(el, v) => {
              const tag = (el.tagName || '').toLowerCase();
              if (tag === 'select') {
                const opt = [...el.options].find((o) => (o.text || '').trim() === v || o.value === v);
                el.value = opt ? opt.value : v;
              } else if (el.getAttribute('contenteditable') === 'true') {
                el.textContent = v;
              } else {
                const proto = tag === 'textarea' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
                const desc = Object.getOwnPropertyDescriptor(proto, 'value');
                if (desc && desc.set) desc.set.call(el, v);
                else el.value = v;
              }
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
            }""",
            texto,
        )
        return True
    except TypeError:
        return False
    except Exception:
        return False


def fill_por_indice_visible(page, index, value) -> bool:
    try:
        return bool(page.evaluate(JS_FILL_INDEX, [int(index), str(value)]))
    except Exception:
        return False


def rellenar_por_label(page, patron: str, value, *, nth: int = 0, excluir: str | None = None) -> bool:
    """Rellena el input junto a la etiqueta visible, aunque el placeholder sea «Dale un valor»."""
    if value is None or value == "" or not patron:
        return False
    get_by_label = getattr(page, "get_by_label", None)
    if get_by_label:
        try:
            loc = get_by_label(re.compile(patron, re.I))
            n = loc.count() if hasattr(loc, "count") else 1
            if n and nth < n:
                if escribir_valor(page, loc.nth(nth) if hasattr(loc, "nth") else loc, value):
                    return True
        except Exception:
            pass
    try:
        marcados = page.evaluate(JS_MARCAR_POR_LABEL, {"patron": patron, "excluir": excluir or ""})
    except Exception:
        marcados = 0
    if not marcados or nth >= int(marcados):
        return False
    try:
        loc = page.locator(f'[data-crc-label-hit="{nth}"]')
        return escribir_valor(page, loc.first if hasattr(loc, "first") else loc, value)
    except Exception:
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
        if rellenar_por_label(page, patron, valor, nth=i, excluir=excluir):
            llenados += 1
            print(f"  ✓ ítem[{i}] ({patron}) → {valor[:60]}")
        else:
            print(f"  ✗ ítem[{i}] ({patron})")
    return llenados


def asegurar_n_campos_label(page, patron: str, n: int, *, excluir: str | None = None) -> int:
    actuales = contar_por_label(page, patron, excluir=excluir)
    intentos = 0
    while actuales < n and intentos < n + 4:
        if not click_agregar_item(page, preferir_ultimo=True):
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
    return r.width > 0 && r.height > 0 && r.left >= 240;
  };
  const esControl = (el) => {
    if (!el || !visibles(el)) return false;
    const tag = (el.tagName || '').toLowerCase();
    if (tag === 'textarea') return true;
    if (tag === 'input') {
      const t = (el.type || 'text').toLowerCase();
      return !['hidden', 'checkbox', 'radio', 'file', 'submit', 'button'].includes(t);
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
      const cand = [...box.querySelectorAll('input, textarea')].filter((el) => esControl(el) && !tituloSeccion(el) && !seen.has(el));
      if (cand.length) input = cand[0];
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


def rellenar_items_formulario(page, valores: list[str]) -> int:
    """Rellena Formulario Ítem 1..N (no «Título de la sección»)."""
    valores = [v for v in valores if v]
    if not valores:
        return 0
    asegurar_n_campos_label(page, r"^(tags?|etiquetas?|nombre|valor|ingrediente)\b", len(valores), excluir=r"título de la sección|meta")
    try:
        marcados = page.evaluate(JS_MARCAR_INPUTS_ITEM)
    except Exception:
        marcados = 0
    while int(marcados or 0) < len(valores):
        if not click_agregar_item(page, preferir_ultimo=True):
            break
        try:
            page.wait_for_timeout(300)
            marcados = page.evaluate(JS_MARCAR_INPUTS_ITEM)
        except Exception:
            break
    llenados = 0
    for i, valor in enumerate(valores):
        try:
            loc = page.locator(f'[data-crc-item-hit="{i}"]')
            if loc.count() and escribir_valor(page, loc.first, valor):
                print(f"  ✓ tag[{i}] → {valor}")
                llenados += 1
                continue
        except Exception:
            pass
        print(f"  ✗ tag[{i}]")
    return llenados


def fill_lista_tags(page, tags: list[str]) -> int:
    if editor_actual(page) != "tags":
        print("  · No relleno tags: no estoy en Edición de tags.")
        return 0
    tags = [t.strip() for t in tags if t and str(t).strip()]
    if not tags:
        return 0
    print("  · tags del Word: " + ", ".join(tags))
    excluir = r"título de la sección|ingrediente|meta|descripci"
    for patron in (r"^(tags?|etiquetas?)\b", r"^nombre\b", r"^valor\b"):
        n = fill_repetidos_por_label(page, patron, tags, excluir=excluir)
        if n:
            return n
    return rellenar_items_formulario(page, tags)


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


def resolver_modal_cambios(page) -> bool:
    """Si aparece «Tienes cambios sin guardar», Cancelar para no perder el editor."""
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
            if loc.count():
                loc.last.click(timeout=2_000)
                page.wait_for_timeout(250)
                return True
    except Exception:
        return False
    return False


def texto_pasos(pasos: list[dict]) -> str:
    return "\n".join(f"{p.get('orden')}. {p.get('texto')}" for p in pasos if p.get("texto"))


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
    try:
        n = page.evaluate("() => document.querySelectorAll('[aria-expanded]').length")
        return int(n or 0)
    except Exception:
        return 0


def expandir_acordeon(page, indice: int) -> bool:
    try:
        return bool(
            page.evaluate(
                """(i) => {
                  const nodes = [...document.querySelectorAll('[aria-expanded]')];
                  const el = nodes[i];
                  if (!el) return false;
                  if (el.getAttribute('aria-expanded') !== 'true') el.click();
                  return true;
                }""",
                indice,
            )
        )
    except Exception:
        return False


def click_agregar_item(page, preferir_ultimo: bool = False) -> bool:
    for sel in BOTONES_AGREGAR:
        try:
            loc = page.locator(sel)
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


def fill_lista_acordeones(page, items: list[dict], tipo: str) -> int:
    """Rellena 'Edición de Lista Ingredientes/Instrucciones' ítem a ítem."""
    clave = "ingredientes" if tipo == "ingredientes" else "instrucciones"
    if not puede_rellenar_editor(page, clave):
        print(f"  · No relleno {tipo}: no estoy en su editor (sigo en {editor_actual(page)}).")
        return 0
    if not items:
        return 0
    if tipo == "ingredientes":
        rellenar_por_label(
            page,
            r"Título de la sección",
            "Ingredientes",
            nth=0,
        )
        lineas = [linea_ingrediente(it) for it in items if linea_ingrediente(it)]
        n_lab = fill_repetidos_por_label(
            page,
            r"^Ingrediente\b",
            lineas,
            excluir=r"título de la sección|lista",
        )
        if n_lab:
            return n_lab
    else:
        textos = [(p.get("texto") or "").strip() for p in items if (p.get("texto") or "").strip()]
        n_lab = fill_repetidos_por_label(
            page,
            r"^(Instrucci|Paso|Descripción|Texto)\b",
            textos,
        )
        if n_lab:
            return n_lab

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
            patron = r"^Ingrediente\b" if tipo == "ingredientes" and rol == "nombre" else ""
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
            "Si ves 5 bloques vacíos, no es la ficha guardada.\n"
            "No pulses la paleta izquierda.",
            file=sys.stderr,
        )
        return False
    if gestor_sin_ficha(url_ficha):
        print(
            "  · URL sin /view/id (Gestor pelado). No navego ahí: perdería la Cabecera."
        )

    def fill(key: str, value: str | None) -> bool:
        if value is None or value == "":
            return False
        if key in ("field_tiempo", "field_porciones", "field_tiempo_prep", "field_tiempo_coccion"):
            value = numero_campo_bm(value) or value
        sel = selectores.get(key)
        if key == "field_dificultad":
            return elegir_dificultad(page, str(value))
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
        if actual is None and clave_comp != "cabecera":
            esperar_lienzo_bloques(page)
        if actual and actual != clave_comp:
            print(f"  · Sigo en Edición de {actual}; guardo antes de abrir «{clave_comp}».")
            if not guardar_y_volver_al_lienzo(page, url_ficha):
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
        if actual and actual != clave_comp:
            print(f"  · Estoy en Edición de {actual}, no en {clave_comp}. No relleno aquí.")
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

    print("Rellenando desde JSON (lápiz de cada bloque + acordeones)…")
    cabecera_ya = (
        editor_actual(page) is None
        and bloque_componente_vacio(page, ["Cabecera", "cabecera", "Header"]) is False
    )
    if cabecera_ya:
        print("  · Cabecera ya está en el lienzo; no la relleno de nuevo.")
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
        guardar_y_volver_al_lienzo(page, url_ficha)

    ings = receta.get("ingredientes") or []
    if abrir_grupo("ingredientes", ["field_ingredientes"]) and puede_rellenar_editor(
        page, "ingredientes"
    ):
        n_ing = fill_lista_acordeones(page, ings, "ingredientes")
        if n_ing:
            resultados["ingredientes"] = True
            print(f"  ✓ ingredientes: {n_ing}/{len(ings)} ítems de acordeón")
        elif editor_actual(page) is None and not lienzo_con_bloques_cms(page):
            resultados["ingredientes"] = fill(
                "field_ingredientes",
                "\n".join(linea_ingrediente(i) for i in ings if linea_ingrediente(i)),
            )
        guardar_y_volver_al_lienzo(page, url_ficha)
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
        elif editor_actual(page) is None:
            resultados["pasos"] = fill("field_pasos", texto_pasos(pasos))
        guardar_y_volver_al_lienzo(page, url_ficha)
    else:
        resultados.setdefault("pasos", False)

    seo = receta.get("seo") or {}
    fill_grupo(
        "seo",
        [
            ("field_meta_titulo", seo.get("metaTitulo")),
            ("field_meta_descripcion", seo.get("metaDescripcion")),
        ],
    )

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
