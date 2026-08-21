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
      const found = [];
      const seen = new Set();
      const nodes = Array.from(
        document.querySelectorAll(
          '[data-component], [data-type], [class*="component"], [class*="Component"], section, article, li, div'
        )
      );
      for (const el of nodes) {
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
    """Hace clic en el lápiz del componente. No requiere acción manual."""
    if selector_guardado:
        try:
            loc = page.locator(selector_guardado).first
            if loc.count():
                loc.click(timeout=5_000)
                page.wait_for_timeout(600)
                return True
        except Exception:
            pass

    comp = next((c for c in COMPONENTES_CMS if c["clave"] == clave), None)
    if not comp:
        return False

    aliases = list(comp["aliases"])
    clicked = page.evaluate(
        """(aliases) => {
      const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
      const norm = (s) => clean(s).toLowerCase();
      const wanted = aliases.map(norm);
      const blocks = Array.from(
        document.querySelectorAll('[data-component], [data-type], section, article, div, li')
      );
      for (const el of blocks) {
        const dataName = clean(el.getAttribute('data-component') || el.getAttribute('data-type') || '');
        const titleEl = el.querySelector(
          '.bloque-nombre, [class*="title"], [class*="Title"], [class*="name"], h1, h2, h3, h4, h5, strong'
        );
        const titleText = clean(titleEl ? titleEl.innerText : '');
        const hit = wanted.some((w) => norm(dataName) === w || norm(titleText) === w);
        if (!hit) continue;
        const editBtn = el.querySelector(
          'button.btn-lapiz, button[aria-label*="Editar" i], button[aria-label*="edit" i], button[title*="Editar" i], button[title*="edit" i], [data-testid*="edit" i]'
        );
        if (editBtn) {
          editBtn.click();
          return true;
        }
        const acciones = el.querySelector('.acciones-bloque, [class*="action"], [class*="toolbar"], [class*="controls"]');
        const firstBtn = (acciones || el).querySelector('button, [role="button"]');
        if (firstBtn) {
          firstBtn.click();
          return true;
        }
      }
      // Fallback: texto exacto del alias + botón Editar cercano
      for (const alias of aliases) {
        const nodes = Array.from(document.querySelectorAll('div, span, p, h1, h2, h3, h4, strong, label'));
        const title = nodes.find((n) => norm(n.innerText) === norm(alias) && (n.innerText || '').length < 60);
        if (!title) continue;
        let cur = title;
        for (let i = 0; i < 8 && cur; i++) {
          const btn = cur.querySelector(
            'button.btn-lapiz, button[aria-label*="Editar" i], button[aria-label*="edit" i], button[title*="Editar" i]'
          ) || (cur.querySelector('.acciones-bloque, [class*="action"]') || cur).querySelector('button');
          if (btn) {
            btn.click();
            return true;
          }
          cur = cur.parentElement;
        }
      }
      return false;
    }""",
        aliases,
    )
    if clicked:
        page.wait_for_timeout(700)
    return bool(clicked)


def cerrar_editor_componente(page) -> None:
    """Intenta salir del editor del componente (Cerrar / Escape / Volver)."""
    for sel in (
        "button:has-text('Cerrar')",
        "button:has-text('Cancelar')",
        "button:has-text('Volver')",
        "button[aria-label*='Cerrar' i]",
        "button[aria-label*='Close' i]",
        "[data-testid*='close' i]",
    ):
        try:
            loc = page.locator(sel).first
            if loc.count() and loc.is_visible():
                loc.click(timeout=2_000)
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
    "field_titulo": re.compile(r"t[ií]tulo de la receta|^t[ií]tulo$|nombre de la receta", re.I),
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
}
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
                tomar(lambda f: True, rol)
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
    if not sel or value is None or value == "" or selector_es_generico(sel):
        return False
    try:
        loc = page.locator(sel).first
        if not loc.count():
            return False
        tag = "input"
        try:
            tag = loc.evaluate("el => el.tagName.toLowerCase()")
        except Exception:
            pass
        if tag == "select":
            try:
                loc.select_option(label=str(value))
            except Exception:
                loc.select_option(value=str(value))
        else:
            loc.fill(str(value))
        return True
    except Exception:
        return False


def fill_por_etiqueta(page, patron: re.Pattern, value) -> bool:
    if value is None or value == "":
        return False
    try:
        fields = dump_estructura(page).get("fields") or []
    except Exception:
        return False
    for field in fields:
        if patron.search(blob_campo(field) or ""):
            sel = field.get("selectorSugerido")
            if sel and _fill_locator(page, sel, value):
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


def click_agregar_item(page) -> bool:
    for sel in BOTONES_AGREGAR:
        try:
            loc = page.locator(sel)
            total = loc.count()
            for i in range(total):
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
    if not items:
        return 0
    n_acc = contar_acordeones(page)
    if n_acc <= 0:
        return 0
    asegurar_filas_lista(page, len(items))
    llenados = 0
    for i, item in enumerate(items):
        if not expandir_acordeon(page, i):
            print(f"  ✗ {tipo}[{i}]: no hay acordeón")
            continue
        try:
            page.wait_for_timeout(250)
        except Exception:
            pass
        try:
            fields = dump_estructura(page).get("fields") or []
        except Exception:
            fields = []
        pares = asignar_campos_item(fields, item, tipo)
        ok_item = False
        for rol, sel, valor in pares:
            if _fill_locator(page, sel, valor):
                print(f"  ✓ {tipo}[{i}].{rol}")
                ok_item = True
            else:
                print(f"  ✗ {tipo}[{i}].{rol} ({sel})")
        if ok_item:
            llenados += 1
        else:
            print(f"  ✗ {tipo}[{i}]: sin campos emparejados")
    return llenados


def fill_from_receta(page, receta: dict, selectores: dict, dry_run: bool) -> bool:
    resultados = {}

    def fill(key: str, value: str | None) -> bool:
        if value is None or value == "":
            return False
        sel = selectores.get(key)
        if selector_es_generico(sel):
            sel = None
        if sel and _fill_locator(page, sel, value):
            print(f"  ✓ {key}")
            return True
        patron = ETIQUETAS_CAMPO.get(key)
        if patron and fill_por_etiqueta(page, patron, value):
            print(f"  ✓ {key} (por etiqueta)")
            return True
        if sel:
            print(f"  ✗ {key} (no encontrado: {sel})")
        else:
            print(f"  · omitido {key} (sin selector ni etiqueta)")
        return False

    def abrir_grupo(clave_comp: str, keys_campo: list[str]) -> None:
        meta = next((c for c in COMPONENTES_CMS if c["clave"] == clave_comp), None)
        lapiz_key = meta["lapiz_key"] if meta else f"lapiz_{clave_comp}"
        print(f"  [CMS] Abriendo componente «{clave_comp}»…")
        abierto = abrir_lapiz_componente(page, clave_comp, selectores.get(lapiz_key))
        if not abierto:
            abierto = abrir_componente_para_campos(page, selectores, keys_campo)
        if not abierto:
            print(f"  · Sin lápiz para {clave_comp}; intento relleno en vista actual.")

    def fill_grupo(clave_comp: str, pares: list[tuple[str, str | None]]) -> dict[str, bool]:
        pares_ok = [(k, v) for k, v in pares if v is not None and v != ""]
        if not pares_ok:
            return {}
        abrir_grupo(clave_comp, [k for k, _ in pares_ok])
        ok_keys = {}
        for key, value in pares_ok:
            ok_keys[key] = fill(key, value)
        cerrar_editor_componente(page)
        return ok_keys

    print("Rellenando desde JSON (lápices + acordeones, todos los campos del Word)…")
    cabecera = fill_grupo(
        "cabecera",
        [
            ("field_titulo", receta.get("titulo")),
            ("field_descripcion", receta.get("descripcion")),
            ("field_porciones", receta.get("porciones")),
            ("field_dificultad", receta.get("dificultad")),
            ("field_tiempo", receta.get("tiempoTotal")),
            ("field_tiempo_prep", receta.get("tiempoPreparacion")),
            ("field_tiempo_coccion", receta.get("tiempoCoccion")),
            ("field_tips", "\n".join(receta.get("tips") or [])),
        ],
    )
    resultados["titulo"] = cabecera.get("field_titulo", False)
    resultados["descripcion"] = cabecera.get("field_descripcion", False)

    fill_grupo("tags", [("field_tags", ", ".join(receta.get("categorias") or []))])

    ings = receta.get("ingredientes") or []
    abrir_grupo("ingredientes", ["field_ingredientes"])
    n_ing = fill_lista_acordeones(page, ings, "ingredientes")
    if n_ing:
        resultados["ingredientes"] = True
        print(f"  ✓ ingredientes: {n_ing}/{len(ings)} ítems de acordeón")
    else:
        resultados["ingredientes"] = fill(
            "field_ingredientes",
            "\n".join(linea_ingrediente(i) for i in ings if linea_ingrediente(i)),
        )
    cerrar_editor_componente(page)

    pasos = receta.get("pasos") or []
    abrir_grupo("instrucciones", ["field_pasos"])
    n_pas = fill_lista_acordeones(page, pasos, "instrucciones")
    if n_pas:
        resultados["pasos"] = True
        print(f"  ✓ pasos: {n_pas}/{len(pasos)} ítems de acordeón")
    else:
        resultados["pasos"] = fill("field_pasos", texto_pasos(pasos))
    cerrar_editor_componente(page)

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
            "(bloques Cabecera / tags / Lista Ingredientes / Instrucciones / SEO).\n"
            "No entres a «Edición de Lista…». Luego reintenta.",
            file=sys.stderr,
        )
        return False

    if dry_run:
        btn = selectores.get("btn_guardar_borrador")
        if btn and not selector_es_generico(btn):
            try:
                page.locator(btn).first.click(timeout=5_000)
                print("Clic en guardar borrador (dry-run).")
            except Exception as e:
                print(f"No se pudo guardar borrador: {e}")
        else:
            print("Dry-run: campos rellenados; guarda a mano en el BM si hace falta.")
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
    print("3) Quedas en el Gestor de recetas (view-manager). Abre la receta o Nueva receta.")
    print("4) Debes ver bloques Cabecera / tags / Lista Ingredientes. Pulsa ENTER.")
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

        print(
            "\n>>> Estás en el Gestor de recetas. Abre la ficha (bloques Cabecera…).\n"
            "    NO entres a «Edición de Lista». NO toques los lápices. ENTER aquí…"
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
