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
  - Abre https://business-manager.ecomm.cencosud.com/
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
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CRC = ROOT / "index/clientes/Herramientas/carga-recetas-cencosud"
SECRETS = CRC / "secrets"
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
        ),
    },
    {
        "clave": "tags",
        "lapiz_key": "lapiz_tags",
        "aliases": ("tags", "Tags"),
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
        "CENCOSUD_BM_VIEW_MANAGER_URL",
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
    """Detecta bloques del Gestor de contenido (Cabecera, tags, listas, SEO…).

    Busca en la página y en iframes (el BM a menudo monta el CMS en un frame).
    """
    aliases_flat = []
    for comp in COMPONENTES_CMS:
        for alias in comp["aliases"]:
            aliases_flat.append({"clave": comp["clave"], "alias": alias})

    js = """(aliasesFlat) => {
      const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
      const norm = (s) => clean(s).toLowerCase();
      const found = [];
      const seen = new Set();

      const pickLapiz = (root) => {
        const editBtn = root.querySelector(
          'button.btn-lapiz, button[aria-label*="Editar" i], button[aria-label*="edit" i], button[title*="Editar" i], button[title*="edit" i], [data-testid*="edit" i], [aria-label*="lápiz" i], [aria-label*="lapiz" i], button[aria-label*="pencil" i]'
        );
        if (editBtn) return editBtn;
        // Iconos tipicos: primer boton de un grupo de 2-4 botones junto al titulo
        const buttons = Array.from(root.querySelectorAll('button, [role="button"]'))
          .filter((b) => {
            const st = getComputedStyle(b);
            if (st.display === 'none' || st.visibility === 'hidden') return false;
            const r = b.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && r.width < 64 && r.height < 64;
          });
        return buttons[0] || null;
      };

      const absSel = (el) => {
        if (!el) return null;
        if (el.id) return '#' + CSS.escape(el.id);
        const aria = el.getAttribute('aria-label');
        if (aria) return el.tagName.toLowerCase() + '[aria-label="' + aria.replace(/"/g, '\\\\"') + '"]';
        const title = el.getAttribute('title');
        if (title) return el.tagName.toLowerCase() + '[title="' + title.replace(/"/g, '\\\\"') + '"]';
        return null;
      };

      // 1) Nodos cuyo texto corto coincide con un alias (Cabecera, tags, …)
      const candidates = Array.from(document.querySelectorAll('div, span, p, li, section, article, h1, h2, h3, h4, h5, strong, label, button'));
      for (const el of candidates) {
        // Solo texto propio corto (evita contenedores gigantes)
        const direct = clean(
          Array.from(el.childNodes)
            .filter((n) => n.nodeType === 3)
            .map((n) => n.textContent)
            .join(' ')
        );
        const full = clean(el.innerText || '');
        const label = direct || (full.length <= 40 ? full : '');
        if (!label || label.length > 48) continue;
        const nlabel = norm(label);
        // Ignorar mensajes vacios del canvas
        if (/edita este componente/i.test(nlabel)) continue;

        for (const item of aliasesFlat) {
          const a = norm(item.alias);
          if (!(nlabel === a || nlabel.startsWith(a + ' ·') || nlabel.startsWith(a + ' |'))) continue;
          if (seen.has(item.clave)) break;

          // Subir hasta un bloque que tenga botones de accion
          let block = el;
          let editBtn = null;
          for (let i = 0; i < 10 && block; i++) {
            editBtn = pickLapiz(block);
            const btns = block.querySelectorAll('button, [role="button"]');
            if (editBtn || btns.length >= 2) break;
            block = block.parentElement;
          }
          found.push({
            clave: item.clave,
            alias: item.alias,
            texto: label,
            lapizSelector: absSel(editBtn),
            tieneLapiz: !!editBtn,
          });
          seen.add(item.clave);
          break;
        }
      }

      // 2) data-component / data-type
      document.querySelectorAll('[data-component], [data-type]').forEach((el) => {
        const dataName = clean(el.getAttribute('data-component') || el.getAttribute('data-type') || '');
        if (!dataName) return;
        for (const item of aliasesFlat) {
          if (norm(dataName) !== norm(item.alias)) continue;
          if (seen.has(item.clave)) return;
          const editBtn = pickLapiz(el);
          found.push({
            clave: item.clave,
            alias: item.alias,
            texto: dataName,
            lapizSelector: absSel(editBtn),
            tieneLapiz: !!editBtn,
          });
          seen.add(item.clave);
        }
      });

      return found;
    }"""

    merged: list[dict] = []
    seen = set()
    frames = []
    try:
        frames = list(page.frames)
    except Exception:
        frames = []
    targets = [page] + [f for f in frames if f != page.main_frame]

    for target in targets:
        try:
            partial = target.evaluate(js, aliases_flat)
        except Exception:
            continue
        for item in partial or []:
            if item.get("clave") in seen:
                continue
            item = dict(item)
            try:
                item["frameUrl"] = target.url
            except Exception:
                item["frameUrl"] = None
            merged.append(item)
            seen.add(item["clave"])
    return merged


def abrir_lapiz_componente(page, clave: str, selector_guardado: str | None = None) -> bool:
    """Clic en el lápiz del bloque del canvas (no el de la paleta izquierda)."""
    if selector_guardado:
        for target in [page] + list(page.frames):
            try:
                loc = target.locator(selector_guardado).first
                if loc.count():
                    loc.click(timeout=4_000, force=True)
                    page.wait_for_timeout(900)
                    if contar_campos_editables(page) > 0:
                        return True
            except Exception:
                pass

    comp = next((c for c in COMPONENTES_CMS if c["clave"] == clave), None)
    if not comp:
        return False
    aliases = list(comp["aliases"])

    # Encuentra títulos en el canvas: prioriza bloques con «Edita este componente vacío»
    # y descarta la «Paleta de componentes».
    find_js = """(aliases) => {
      const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
      const norm = (s) => clean(s).toLowerCase();
      const wanted = aliases.map(norm);
      const inPalette = (el) => {
        let cur = el;
        for (let i = 0; i < 14 && cur; i++) {
          const t = norm(cur.innerText || '').slice(0, 80);
          const cls = (typeof cur.className === 'string' ? cur.className : '').toLowerCase();
          if (t.includes('paleta de componentes') || cls.includes('palette') || cls.includes('sidebar')) return true;
          cur = cur.parentElement;
        }
        return false;
      };
      const hasEmptyHint = (el) => {
        let cur = el;
        for (let i = 0; i < 10 && cur; i++) {
          const t = norm(cur.innerText || '');
          if (t.includes('edita este componente')) return true;
          cur = cur.parentElement;
        }
        return false;
      };
      const out = [];
      const nodes = Array.from(document.querySelectorAll('div, span, p, li, h1, h2, h3, h4, strong, label'));
      for (const el of nodes) {
        const direct = clean(Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join(' '));
        const full = clean(el.innerText || '');
        const label = direct || (full.length <= 40 ? full : '');
        if (!label || label.length > 48) continue;
        if (!wanted.some((w) => norm(label) === w)) continue;
        if (inPalette(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        out.push({
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
          score: (hasEmptyHint(el) ? 1000 : 0) + r.left, // canvas a la derecha > paleta
          text: label,
        });
      }
      out.sort((a, b) => b.score - a.score);
      return out.slice(0, 6);
    }"""

    click_at_js = """({x, y, iconIndex}) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return false;
      // Subir al bloque del canvas
      let block = el;
      for (let i = 0; i < 12 && block; i++) {
        const t = (block.innerText || '');
        if (/edita este componente/i.test(t) || t.length > 20) break;
        block = block.parentElement;
      }
      block = block || el;
      const isSmall = (n) => {
        const r = n.getBoundingClientRect();
        return r.width > 8 && r.height > 8 && r.width < 72 && r.height < 72;
      };
      const icons = Array.from(block.querySelectorAll('button, [role="button"], svg, a, span, div'))
        .filter(isSmall)
        .sort((a, b) => {
          const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
          if (Math.abs(ra.top - rb.top) > 8) return ra.top - rb.top;
          return ra.left - rb.left;
        });
      const pick = icons[iconIndex] || icons[0];
      if (!pick) {
        // Clic en el área vacía del bloque (a veces abre el editor)
        const hint = Array.from(block.querySelectorAll('div, span, p'))
          .find((n) => /edita este componente/i.test(n.innerText || ''));
        if (hint) { hint.click(); return true; }
        block.click();
        return true;
      }
      const n = pick.tagName.toLowerCase() === 'svg'
        ? (pick.closest('button, [role="button"], a, div, span') || pick.parentElement)
        : pick;
      n.click();
      return true;
    }"""

    targets = [page] + [f for f in page.frames if f != page.main_frame]
    for target in targets:
        try:
            candidates = target.evaluate(find_js, aliases)
        except Exception:
            continue
        if not candidates:
            continue
        print(f"    · candidatos canvas «{clave}»: {[(c.get('text'), int(c.get('score', 0))) for c in candidates[:3]]}")
        for cand in candidates:
            for icon_i in (0, 1, 2):
                try:
                    antes = contar_campos_editables(page)
                    ok_click = target.evaluate(
                        click_at_js,
                        {"x": cand["x"], "y": cand["y"], "iconIndex": icon_i},
                    )
                    if not ok_click:
                        continue
                    page.wait_for_timeout(1000)
                    despues = contar_campos_editables(page)
                    if despues > antes:
                        print(f"    · lápiz OK «{clave}» (icono {icon_i}, campos {antes}→{despues})")
                        return True
                except Exception:
                    continue
            # Intento: clic directo en el texto «Edita este componente…» del mismo bloque
            try:
                hint = target.get_by_text(re.compile(r"Edita este componente", re.I))
                # Preferir el hint más cercano al candidato
                if hint.count():
                    hint.first.click(timeout=2000)
                    page.wait_for_timeout(1000)
                    if contar_campos_editables(page) > 0:
                        print(f"    · editor abierto vía mensaje vacío «{clave}»")
                        return True
            except Exception:
                pass

    print(f"    · no abrí editor de «{clave}» (¿lápiz del canvas?)")
    return False


def guardar_editor_componente(page) -> bool:
    """Guarda el editor del componente abierto (antes de cerrar). Sin esto el BM pierde los datos."""
    for sel in (
        "button:has-text('Guardar')",
        "button:has-text('Save')",
        "button:has-text('Aplicar')",
        "button:has-text('Confirmar')",
        "button:has-text('Aceptar')",
        "button:has-text('Done')",
        "button[aria-label*='Guardar' i]",
        "button[aria-label*='Save' i]",
        "[data-testid*='save' i]",
        "button.btn-guardar-editor",
    ):
        try:
            loc = page.locator(sel)
            n = loc.count()
            for i in range(n):
                btn = loc.nth(i)
                if not btn.is_visible():
                    continue
                txt = (btn.inner_text() or "").lower()
                # Evitar «Guardar y publicar» / borrador global en el editor de componente
                if "publicar" in txt or "publish" in txt or "borrador" in txt or "draft" in txt:
                    continue
                btn.click(timeout=3_000)
                page.wait_for_timeout(700)
                print("  ✓ Guardado editor del componente")
                return True
        except Exception:
            pass
    return False


def cerrar_editor_componente(page, *, guardar: bool = False) -> None:
    """Cierra el editor del componente sin salir de la ficha de la receta.

    Nunca hace clic en «Volver»: en el BM eso te saca al Administrador de vistas.
    """
    if guardar:
        if guardar_editor_componente(page):
            return
        print(
            "  · No vi botón Guardar en el editor; pruebo Escape "
            "(sin Volver, para no salir de la receta).",
            flush=True,
        )
        try:
            page.keyboard.press("Escape")
            page.wait_for_timeout(500)
        except Exception:
            pass
        return

    # Solo mapeo: Escape / Cerrar de modal (nunca Volver)
    for sel in (
        "button:has-text('Cerrar')",
        "button[aria-label*='Cerrar' i]",
        "button[aria-label*='Close' i]",
        "[data-testid*='close' i]",
    ):
        try:
            loc = page.locator(sel)
            for i in range(loc.count()):
                btn = loc.nth(i)
                if not btn.is_visible():
                    continue
                txt = (btn.inner_text() or "").lower()
                if "volver" in txt:
                    continue
                btn.click(timeout=2_000)
                page.wait_for_timeout(400)
                return
        except Exception:
            pass
    try:
        page.keyboard.press("Escape")
        page.wait_for_timeout(400)
    except Exception:
        pass


def capturar_cms_por_componentes(page) -> tuple[dict, dict]:
    """
    Abre solo el lápiz de cada componente CRC, vuelca campos y fusiona selectores.
    La usuaria no debe hacer clic en los lápices.
    """
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
        elif re.search(r"borrador|draft", t):
            # Solo borrador/draft globales — no el «Guardar» del editor de cada componente
            if not mapa["btn_guardar_borrador"]:
                mapa["btn_guardar_borrador"] = sel
        elif not mapa["btn_guardar_borrador"] and re.search(
            r"guardar\s+(cambios|ficha|receta)|save\s+(changes|recipe)", t
        ):
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


def rellenar_con_dump_vivo(page, pares: list[tuple[str, str | None]], selectores: dict) -> dict[str, bool]:
    """Tras abrir un lápiz, mapea campos visibles y rellena."""
    outs: dict[str, bool] = {}
    if contar_campos_editables(page) <= 0:
        page.wait_for_timeout(700)
    estructura = dump_estructura(page)
    vivos = sugerir_selectores(estructura)
    for key, value in pares:
        if value is None or value == "":
            continue
        sel = vivos.get(key) or selectores.get(key)
        if not sel:
            outs[key] = False
            print(f"  ✗ {key} (sin selector vivo ni guardado)")
            continue
        filled = False
        for target in [page] + list(page.frames):
            try:
                loc = target.locator(sel).first
                if not loc.count():
                    continue
                tag = loc.evaluate("el => el.tagName.toLowerCase()")
                if tag == "select":
                    try:
                        loc.select_option(label=str(value))
                    except Exception:
                        loc.select_option(value=str(value))
                else:
                    loc.fill(str(value))
                filled = True
                selectores[key] = sel
                break
            except Exception:
                continue
        outs[key] = filled
        print(f"  {'✓' if filled else '✗'} {key}" + ("" if filled else f" ({sel})"))

    if not any(outs.values()):
        try:
            areas = page.locator("textarea:visible, [contenteditable='true']:visible, input[type='text']:visible")
            n = min(areas.count(), 8)
            if n == 1 and len(pares) == 1:
                areas.first.fill(str(pares[0][1]))
                outs[pares[0][0]] = True
                print(f"  ✓ {pares[0][0]} (fallback único campo)")
            elif n >= 1:
                for key, value in pares:
                    if not value:
                        continue
                    if key == "field_titulo":
                        areas.nth(0).fill(str(value)); outs[key] = True; print(f"  ✓ {key} (fallback)")
                    elif key in ("field_descripcion", "field_meta_descripcion") and n >= 2:
                        areas.nth(1).fill(str(value)); outs[key] = True; print(f"  ✓ {key} (fallback)")
                    elif key in ("field_ingredientes", "field_pasos", "field_tags"):
                        areas.nth(n - 1).fill(str(value)); outs[key] = True; print(f"  ✓ {key} (fallback)")
        except Exception:
            pass
    return outs


def fill_from_receta(page, receta: dict, selectores: dict, dry_run: bool) -> bool:
    resultados = {}

    def fill_grupo(clave_comp: str, pares: list[tuple[str, str | None]]) -> int:
        pares_ok = [(k, v) for k, v in pares if v is not None and v != ""]
        if not pares_ok:
            return 0
        meta = next((c for c in COMPONENTES_CMS if c["clave"] == clave_comp), None)
        lapiz_key = meta["lapiz_key"] if meta else f"lapiz_{clave_comp}"
        print(f"  [CMS] Abriendo componente «{clave_comp}»…")
        abierto = abrir_lapiz_componente(page, clave_comp, selectores.get(lapiz_key))
        if not abierto:
            abierto = abrir_componente_para_campos(page, selectores, [k for k, _ in pares_ok])
        if not abierto:
            print(f"  · No pude abrir el lápiz de «{clave_comp}».")
            return 0
        for _ in range(20):
            if contar_campos_editables(page) > 0:
                break
            page.wait_for_timeout(250)
        vivos = rellenar_con_dump_vivo(page, pares_ok, selectores)
        ok_grupo = 0
        for key, ok in vivos.items():
            if key == "field_titulo":
                resultados["titulo"] = ok
            elif key == "field_descripcion":
                resultados["descripcion"] = ok
            elif key == "field_ingredientes":
                resultados["ingredientes"] = ok
            elif key == "field_pasos":
                resultados["pasos"] = ok
            ok_grupo += int(bool(ok))
        cerrar_editor_componente(page, guardar=True)
        return ok_grupo

    print("Rellenando desde JSON (abriendo lápices automáticamente)…")
    total_ok = 0
    total_ok += fill_grupo(
        "cabecera",
        [
            ("field_titulo", receta.get("titulo")),
            ("field_descripcion", receta.get("descripcion")),
            ("field_porciones", receta.get("porciones")),
            ("field_dificultad", receta.get("dificultad")),
            ("field_tiempo", receta.get("tiempoTotal")),
        ],
    )
    total_ok += fill_grupo("tags", [("field_tags", ", ".join(receta.get("categorias") or []))])
    ings = receta.get("ingredientes") or []
    texto_ing = None
    if ings:
        texto_ing = "\n".join(
            " ".join(
                filter(
                    None,
                    [
                        str(i.get("cantidad") or "").strip(),
                        str(i.get("unidad") or "").strip(),
                        str(i.get("nombre") or "").strip(),
                    ],
                )
            ).strip()
            for i in ings
        )
    total_ok += fill_grupo("ingredientes", [("field_ingredientes", texto_ing)])
    pasos = receta.get("pasos") or []
    texto_pas = None
    if pasos:
        texto_pas = "\n".join(f"{p.get('orden')}. {p.get('texto')}" for p in pasos)
    total_ok += fill_grupo("instrucciones", [("field_pasos", texto_pas)])
    seo = receta.get("seo") or {}
    total_ok += fill_grupo(
        "seo",
        [
            ("field_meta_titulo", seo.get("metaTitulo")),
            ("field_meta_descripcion", seo.get("metaDescripcion")),
        ],
    )

    fallos_requeridos = [
        campo for campo in CAMPOS_REQUERIDOS_PUBLICACION if not resultados.get(campo, False)
    ]
    if fallos_requeridos or total_ok == 0:
        print(
            "Carga incompleta: no se rellenaron campos requeridos: "
            + (", ".join(fallos_requeridos) if fallos_requeridos else "(ningún campo)"),
            file=sys.stderr,
        )
        return False

    if dry_run:
        print("Dry-run: componentes rellenados/guardados uno a uno.")
        return True

    btn = selectores.get("btn_publicar")
    if btn:
        page.locator(btn).first.click()
        print("Solicitud de publicación enviada; confirma el resultado en BM.")
        return True
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
    base = env.get("CENCOSUD_BM_URL") or "https://business-manager.ecomm.cencosud.com/"
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

    view_manager = env.get("CENCOSUD_BM_VIEW_MANAGER_URL") or (
        "https://business-manager.ecomm.cencosud.com/cms/projects/6597f023fdc664839ccd2a37/view-manager"
    )

    print("=== Exploración BM Cencosud (local) ===")
    print(f"URL: {base}")
    print(f"Vistas: {view_manager}")
    print("1) Se abre Chromium en el Administrador de vistas.")
    print("2) Inicia sesión (automático si .env tiene user/pass; si no, a mano / MFA).")
    print("3) Busca la receta, ábrela hasta ver Cabecera/tags/listas/SEO.")
    print("4) Vuelve aquí y pulsa ENTER.")
    print("5) El scraping abre SOLO cada lápiz, captura campos y guarda selectores.")
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
        page.goto(view_manager, wait_until="domcontentloaded")
        try_login(page, env)
        # Tras login ADFS a veces vuelve al home: forzar view-manager
        if "view-manager" not in (page.url or ""):
            page.goto(view_manager, wait_until="domcontentloaded")

        print(
            "\n>>> Estás en el Administrador de vistas.\n"
            "    Busca y abre la receta hasta ver los bloques del CMS,\n"
            "    luego pulsa ENTER aquí (sin tocar lápices)…"
        )
        try:
            input()
        except EOFError:
            print("Sin TTY: esperando 60s para que completes login/navegación…")
            page.wait_for_timeout(60_000)

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
            carga_exitosa = fill_from_receta(page, receta, sugeridos, dry_run=dry_run)
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
