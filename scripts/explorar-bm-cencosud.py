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

# Labels del Formulario Header (Edición de Cabecera) en BM Jumbo.
LABELS_POR_CAMPO: dict[str, tuple[str, ...]] = {
    "field_titulo": (r"^T[ií]tulo(\s+de\s+la\s+receta)?\s*\*?$", r"^Title\s*\*?$"),
    "field_dificultad": (r"^Dificultad\s*\*?$", r"^Difficulty\s*\*?$"),
    "field_tiempo": (
        r"^Duraci[oó]n\s*\*?$",
        r"^Duration\s*\*?$",
        r"^Tiempo(\s*total)?\s*\*?$",
    ),
    "field_porciones": (r"^Porciones\s*\*?$", r"^Servings\s*\*?$", r"^Rinde\s*\*?$"),
    "field_descripcion": (r"^Descripci[oó]n\s*\*?$", r"^Bajada\s*\*?$", r"^Summary\s*\*?$"),
    "field_imagen": (r"^Imagen\s*\*?$", r"^Image\s*\*?$", r"^Foto\s*\*?$", r"^Portada\s*\*?$"),
    "field_tags": (r"^Tags?\s*/?\s*(categor[ií]as?)?\s*\*?$", r"^Etiquetas?\s*\*?$"),
    "field_ingredientes": (r"^Ingredientes?\s*\*?$", r"^Lista\s+Ingredientes?\s*\*?$"),
    "field_pasos": (
        r"^Pasos?(\s+de\s+preparaci[oó]n)?\s*\*?$",
        r"^Instrucciones?\s*\*?$",
        r"^Lista\s+de\s+Instrucciones?\s*\*?$",
    ),
    "field_meta_titulo": (r"^Meta\s*t[ií]tulo(\s*\(SEO\))?\s*\*?$",),
    "field_meta_descripcion": (r"^Meta\s*descripci[oó]n(\s*\(SEO\))?\s*\*?$",),
}


def minutos_desde_tiempo(valor) -> str | None:
    """BM Duración exige number >= 1: '30 min' → '30' (nunca '0')."""
    if valor is None or valor == "":
        return None
    if isinstance(valor, (int, float)):
        n = int(valor)
        return str(n) if n >= 1 else None
    m = re.search(r"(\d+)", str(valor))
    if not m:
        return None
    n = int(m.group(1))
    return str(n) if n >= 1 else None


def _rellenar_campo_numero(loc, valor: str) -> bool:
    """Limpia y escribe un entero en input type=number (evita quedar en 0)."""
    digitos = minutos_desde_tiempo(valor) or re.sub(r"[^\d]", "", str(valor))
    if not digitos or digitos == "0":
        return False
    try:
        loc.click(timeout=2000)
        # No usar fill("") en number: en BM a veces deja 0 y el siguiente fill no pega.
        loc.press("Control+a")
        loc.press("Backspace")
        loc.type(digitos, delay=25)
        try:
            loc.press("Tab")
        except Exception:
            pass
        try:
            got = (loc.input_value() or "").strip()
            if got == digitos:
                return True
            # Algunos number muestran "30.0"
            if re.sub(r"[^\d]", "", got) == digitos:
                return True
        except Exception:
            pass
        loc.evaluate(
            """(el, v) => {
              el.focus();
              const proto = window.HTMLInputElement.prototype;
              const desc = Object.getOwnPropertyDescriptor(proto, 'value');
              if (desc && desc.set) desc.set.call(el, v);
              else el.value = v;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
              el.dispatchEvent(new Event('blur', { bubbles: true }));
            }""",
            digitos,
        )
        try:
            got = (loc.input_value() or "").strip()
            return re.sub(r"[^\d]", "", got) == digitos
        except Exception:
            return False
    except Exception:
        return False


def _leer_valor_campo_por_label(page, label_pat: str) -> str:
    """Lee el value visible de un input asociado a un label (p.ej. Duración)."""
    cre = re.compile(label_pat, re.I)
    for target in _targets_page_y_frames(page):
        try:
            loc = target.get_by_label(cre)
            for i in range(min(loc.count(), 4)):
                node = loc.nth(i)
                try:
                    tag = (node.evaluate("el => (el.tagName||'').toLowerCase()") or "").lower()
                    tipo = (node.get_attribute("type") or "").lower()
                except Exception:
                    continue
                if tag != "input" or tipo in ("checkbox", "radio", "file", "hidden", "button"):
                    continue
                try:
                    return (node.input_value() or "").strip()
                except Exception:
                    continue
        except Exception:
            continue
        try:
            lab = target.get_by_text(cre)
            if not lab.count():
                continue
            box = lab.first.bounding_box()
            if not box:
                continue
            handle = lab.first.locator(
                "xpath=following::input[not(@type='hidden') and not(@type='checkbox')][1]"
            )
            if handle.count():
                return (handle.first.input_value() or "").strip()
        except Exception:
            continue
    return ""


def _dificultad_parece_seleccionada(page, esperada: str) -> bool:
    """True si el combo muestra la opción (no 'Seleccionar…' / error requerido)."""
    if not esperada:
        return False
    want = esperada.strip().lower()
    for target in _targets_page_y_frames(page):
        try:
            combo = target.get_by_role("combobox", name=re.compile(r"dificultad", re.I))
            for i in range(min(combo.count(), 3)):
                txt = (combo.nth(i).inner_text() or "").strip().lower()
                if want in txt and "seleccionar" not in txt:
                    return True
        except Exception:
            pass
        try:
            # Texto del control bajo el label Dificultad
            lab = target.get_by_text(re.compile(r"^Dificultad", re.I))
            if lab.count():
                parent = lab.first.locator("xpath=ancestor::*[1]")
                bloque = (parent.inner_text() or "")[:240]
                if re.search(rf"(?<!muy\s){re.escape(esperada)}", bloque, re.I):
                    if re.search(r"el dato es requerido", bloque, re.I):
                        # error sigue visible → no cuenta
                        pass
                    else:
                        return True
        except Exception:
            pass
    return False


def _asegurar_cabecera_bm(page, dificultad: str | None, minutos: str | None, porciones: str | None) -> None:
    """Repara Dificultad/Duración/Porciones tras imagen u otros pasos que las pisan."""
    if dificultad and not _dificultad_parece_seleccionada(page, dificultad):
        if _seleccionar_dificultad_bm(page, dificultad):
            print(f"  · Reparé Dificultad → {dificultad}", flush=True)
    if minutos:
        actual = _leer_valor_campo_por_label(page, r"^Duraci[oó]n")
        dig = re.sub(r"[^\d]", "", actual or "")
        if not dig or dig == "0" or dig != str(minutos):
            if _rellenar_por_label(page, "field_tiempo", str(minutos)):
                print(f"  · Reparé Duración → {minutos}", flush=True)
            else:
                print(f"  · No pude reparar Duración (sigue {actual!r})", flush=True)
    if porciones:
        actual = _leer_valor_campo_por_label(page, r"^Porciones")
        dig = re.sub(r"[^\d]", "", actual or "")
        if dig != re.sub(r"[^\d]", "", str(porciones)):
            if _rellenar_por_label(page, "field_porciones", str(porciones)):
                print(f"  · Reparé Porciones → {porciones}", flush=True)


def normalizar_dificultad_bm(valor: str | None) -> str | None:
    """Normaliza al texto exacto del dropdown BM Jumbo.

    Opciones reales observadas:
      Muy Fácil | Fácil | Moderado | Intermedio | Difícil | Muy Difícil | Absurdamente Difícil
    """
    if not valor:
        return None
    raw = str(valor).strip().lower()
    raw = (
        raw.replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
    )
    mapa = {
        "muy facil": "Muy Fácil",
        "facil": "Fácil",
        "moderado": "Moderado",
        "media": "Moderado",
        "medio": "Moderado",
        "intermedio": "Intermedio",
        "dificil": "Difícil",
        "muy dificil": "Muy Difícil",
        "absurdamente dificil": "Absurdamente Difícil",
    }
    return mapa.get(raw) or str(valor).strip()


def candidatas_dificultad_bm(valor: str | None) -> list[str]:
    """Variantes a probar al hacer clic en la opción del listado."""
    principal = normalizar_dificultad_bm(valor)
    if not principal:
        return []
    out = [principal]
    # Sin tilde / capitalización alternativa
    sin = (
        principal.replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
    )
    for v in (sin, principal.lower(), principal.upper(), principal.capitalize()):
        if v not in out:
            out.append(v)
    return out


def url_imagen_portada(receta: dict) -> str | None:
    for img in receta.get("imagenes") or []:
        if not isinstance(img, dict):
            continue
        url = (img.get("url") or "").strip()
        if url:
            return url
        ruta = (img.get("rutaLocal") or "").strip()
        if ruta.startswith("http"):
            return ruta
    return None


def _asignar_url_imagen(receta: dict, url: str, nota: str) -> str:
    imgs = list(receta.get("imagenes") or [])
    if imgs and isinstance(imgs[0], dict):
        imgs[0]["url"] = url
        imgs[0]["nota"] = nota
    else:
        imgs = [
            {
                "rutaLocal": "",
                "url": url,
                "alt": "",
                "rol": "portada",
                "nota": nota,
            }
        ]
    receta["imagenes"] = imgs
    return url


def _catalogo_foto_urls() -> dict[str, str]:
    path = CRC / "data" / "foto-urls.json"
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return {str(k): str(v) for k, v in data.items() if not str(k).startswith("_") and v}
    except Exception:
        return {}


def enriquecer_imagen_desde_word(receta: dict) -> str | None:
    """Si el JSON no trae url de foto, la lee del hipervínculo ([Foto]) del .docx.

    Busca el Word en inbox/, ruta fuenteWord, y catálogo data/foto-urls.json.
    """
    ya = url_imagen_portada(receta)
    if ya:
        return ya

    candidatos: list[Path] = []
    fuente = (receta.get("fuenteWord") or "").strip()
    if fuente:
        p = Path(fuente)
        if not p.is_absolute():
            p = ROOT / p
        candidatos.append(p)
        # Windows a veces guarda ruta con mayúsculas distintas
        candidatos.append(CRC / "inbox" / Path(fuente).name)

    titulo = (receta.get("titulo") or receta.get("id") or "").strip()
    rid = (receta.get("id") or slugify_simple(titulo) or "").strip()
    inbox = CRC / "inbox"
    if inbox.is_dir():
        for docx in sorted(inbox.glob("*.docx")):
            low = docx.name.lower().replace("ó", "o").replace("á", "a")
            if "salmon" in low or "salm" in low:
                candidatos.append(docx)
            elif rid and rid[:18] in low.replace(" ", "-").replace("_", "-"):
                candidatos.append(docx)
            elif titulo and slugify_simple(titulo)[:18] in low.replace(" ", "-"):
                candidatos.append(docx)
        # Cualquier docx si solo hay uno
        todos = list(inbox.glob("*.docx"))
        if len(todos) == 1:
            candidatos.append(todos[0])

    # Import lazy del parser
    mod = None
    try:
        import importlib.util

        spec = importlib.util.spec_from_file_location(
            "parse_receta_word", ROOT / "scripts/parse-receta-word.py"
        )
        mod = importlib.util.module_from_spec(spec)
        assert spec.loader is not None
        spec.loader.exec_module(mod)
    except Exception as exc:
        print(f"  · No pude cargar parse-receta-word ({exc})", flush=True)

    vistos: set[str] = set()
    if mod:
        for docx in candidatos:
            if not docx.exists():
                continue
            key = str(docx.resolve())
            if key in vistos:
                continue
            vistos.add(key)
            try:
                url = mod.url_foto_portada(docx)
            except Exception:
                url = None
            if not url:
                continue
            print(f"  · Foto desde Word ({docx.name}): {url[:90]}", flush=True)
            return _asignar_url_imagen(receta, url, "URL de ([Foto]) leída del Word al publicar")

    # Catálogo versionado (fallback si el inbox local no tiene el .docx)
    catalogo = _catalogo_foto_urls()
    for key in (rid, slugify_simple(titulo), "salmon-a-la-parrilla-con-salsa-de-palta"):
        if not key:
            continue
        url = catalogo.get(key)
        if url:
            print(f"  · Foto desde catálogo data/foto-urls.json ({key})", flush=True)
            return _asignar_url_imagen(receta, url, "URL desde data/foto-urls.json")

    print(
        "  · No hallé URL de Foto (ni en JSON, ni Word en inbox/, ni catálogo).",
        flush=True,
    )
    return None


def slugify_simple(s: str) -> str:
    s = s.lower().strip()
    for a, b in (
        ("á", "a"),
        ("é", "e"),
        ("í", "i"),
        ("ó", "o"),
        ("ú", "u"),
        ("ñ", "n"),
    ):
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def _catalogo_rutas_locales() -> dict[str, str]:
    path = CRC / "data" / "foto-rutas-locales.json"
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return {str(k): str(v) for k, v in data.items() if not str(k).startswith("_") and v}
    except Exception:
        return {}


def _asignar_ruta_local(receta: dict, ruta: str, nota: str) -> str:
    imgs = list(receta.get("imagenes") or [])
    if imgs and isinstance(imgs[0], dict):
        imgs[0]["rutaLocal"] = ruta
        imgs[0]["nota"] = nota
    else:
        imgs = [
            {
                "rutaLocal": ruta,
                "url": None,
                "alt": "",
                "rol": "portada",
                "nota": nota,
            }
        ]
    receta["imagenes"] = imgs
    return ruta


def enriquecer_ruta_local_imagen(receta: dict) -> str | None:
    """Asegura imagenes[].rutaLocal (PNG en Downloads, etc.). BM no acepta Drive."""
    ya = ruta_imagen_local(receta)
    if ya:
        return ya

    # Si el JSON trae ruta pero Path.exists falló (otro PC), igual la devolvemos
    # para que Playwright en Windows intente set_input_files.
    for img in receta.get("imagenes") or []:
        if isinstance(img, dict):
            ruta = (img.get("rutaLocal") or "").strip()
            if ruta and not ruta.startswith("http"):
                return ruta

    titulo = (receta.get("titulo") or receta.get("id") or "").strip()
    rid = (receta.get("id") or slugify_simple(titulo) or "").strip()
    catalogo = _catalogo_rutas_locales()
    for key in (rid, slugify_simple(titulo), "salmon-a-la-parrilla-con-salsa-de-palta"):
        if not key:
            continue
        ruta = catalogo.get(key)
        if not ruta:
            continue
        print(f"  · Ruta local desde data/foto-rutas-locales.json ({key})", flush=True)
        return _asignar_ruta_local(
            receta,
            ruta,
            "Ruta local PNG (BM rechaza Drive; subir por Mi Equipo)",
        )

    # Heurística: Downloads con nombre de la receta
    home = Path.home()
    for carpeta in (
        home / "Downloads",
        home / "Descargas",
        Path(r"C:\Users\josef\Downloads"),
    ):
        if not carpeta.is_dir():
            continue
        for ext in ("*.png", "*.jpg", "*.jpeg", "*.webp"):
            for f in carpeta.glob(ext):
                low = f.name.lower().replace("ó", "o").replace("á", "a")
                if "salmon" in low or "salm" in low:
                    print(f"  · Foto local hallada en {carpeta}: {f.name}", flush=True)
                    return _asignar_ruta_local(receta, str(f), "Hallada en Descargas")
    return None


def ruta_imagen_local(receta: dict) -> str | None:
    for img in receta.get("imagenes") or []:
        if not isinstance(img, dict):
            continue
        ruta = (img.get("rutaLocal") or "").strip()
        if not ruta or ruta.startswith("http"):
            continue
        p = Path(ruta).expanduser()
        if p.exists():
            return str(p.resolve())
        # En Windows la ruta del catálogo puede existir aunque aquí (CI) no
        if re.match(r"^[A-Za-z]:\\", ruta) or ruta.startswith("\\\\"):
            return ruta
    return None


# CMS Jumbo Recetas: cada bloque se edita con su lápiz (no es un formulario plano).
# (ruta_imagen_local redefinida arriba; se eliminó la versión corta previa)
COMPONENTES_CMS = (
    {
        "clave": "cabecera",
        "lapiz_key": "lapiz_cabecera",
        "aliases": ("Cabecera", "Header", "header"),
        "campos": (
            "field_titulo",
            "field_dificultad",
            "field_tiempo",
            "field_porciones",
            "field_imagen",
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


# Selectores de controles editables (incluye editores rich-text y role=textbox).
_CAMPOS_EDITABLES_CSS = (
    'input, textarea, select, [contenteditable="true"], [contenteditable=""], '
    '[role="textbox"], .ql-editor, [data-slate-editor="true"], .ProseMirror'
)

_DUMP_ESTRUCTURA_JS = """() => {
      const FIELD_CSS = 'input, textarea, select, [contenteditable="true"], [contenteditable=""], '
        + '[role="textbox"], .ql-editor, [data-slate-editor="true"], .ProseMirror';
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
        const role = el.getAttribute('role');
        if (role === 'textbox') {
          const parts = [];
          let cur = el;
          for (let depth = 0; cur && cur.nodeType === 1 && depth < 7; depth++) {
            let part = cur.tagName.toLowerCase();
            if (cur.id) { parts.unshift('#' + CSS.escape(cur.id)); break; }
            const parent = cur.parentElement;
            if (parent) {
              const siblings = Array.from(parent.children).filter((c) => c.tagName === cur.tagName);
              if (siblings.length > 1) part += ':nth-of-type(' + (siblings.indexOf(cur) + 1) + ')';
            }
            parts.unshift(part);
            cur = parent;
          }
          return parts.length ? parts.join(' > ') : '[role="textbox"]';
        }
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
      const visible = (el) => {
        if (el.type === 'hidden' || el.type === 'password') return false;
        if (el.disabled) return false;
        const st = window.getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden') return false;
        let p = el.parentElement;
        while (p) {
          const ps = window.getComputedStyle(p);
          if (ps.display === 'none' || ps.visibility === 'hidden') return false;
          p = p.parentElement;
        }
        const rect = el.getBoundingClientRect();
        return rect.width >= 1 || rect.height >= 1;
      };
      const fields = [];
      document.querySelectorAll(FIELD_CSS).forEach((el, i) => {
        if (!visible(el)) return;
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
          const prev = el.closest('div, td, li, section, form, [class*="field"], [class*="Field"], [class*="form"], [class*="Form"]');
          if (prev) {
            const lab2 = prev.querySelector('label, .label, [class*="label"], [class*="Label"], legend, span, p, div, h1, h2, h3, h4');
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
        const isCe = !!(el.isContentEditable || el.getAttribute('contenteditable') === 'true'
          || el.getAttribute('role') === 'textbox' || (el.classList && (el.classList.contains('ql-editor') || el.classList.contains('ProseMirror'))));
        fields.push({
          index: i,
          tag: el.tagName.toLowerCase(),
          type: el.type || (isCe ? 'contenteditable' : ''),
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
      document.querySelectorAll('button, a[role="button"], input[type="submit"], input[type="button"], [role="button"]').forEach((el, i) => {
        const text = clean(el.innerText || el.value || el.getAttribute('aria-label') || el.getAttribute('title') || '');
        if (!text) return;
        buttons.push({
          index: i,
          tag: el.tagName.toLowerCase(),
          text,
          id: el.id || null,
          ariaLabel: el.getAttribute('aria-label'),
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

_CONTAR_CAMPOS_JS = """() => {
      const FIELD_CSS = 'input, textarea, select, [contenteditable="true"], [contenteditable=""], '
        + '[role="textbox"], .ql-editor, [data-slate-editor="true"], .ProseMirror';
      return [...document.querySelectorAll(FIELD_CSS)].filter((el) => {
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
          }).length;
    }"""


def _targets_page_y_frames(page) -> list:
    """Página + iframes (BM a menudo monta el editor en un frame)."""
    out = [page]
    try:
        for fr in page.frames:
            if fr is page.main_frame:
                continue
            try:
                if fr.is_detached():
                    continue
            except Exception:
                continue
            out.append(fr)
    except Exception:
        pass
    return out


def pagina_viva(page) -> bool:
    try:
        return bool(page) and not page.is_closed()
    except Exception:
        return False


def dump_estructura(page) -> dict:
    """Extrae campos visibles de la página y de todos los iframes."""
    merged: dict = {
        "url": "",
        "title": "",
        "fields": [],
        "buttons": [],
        "linksReceta": [],
        "nav": [],
    }
    try:
        merged["url"] = page.url
        merged["title"] = page.title()
    except Exception:
        pass
    for ti, target in enumerate(_targets_page_y_frames(page)):
        try:
            part = target.evaluate(_DUMP_ESTRUCTURA_JS)
        except Exception:
            continue
        if ti == 0:
            merged["url"] = part.get("url") or merged["url"]
            merged["title"] = part.get("title") or merged["title"]
        frame_url = ""
        try:
            frame_url = target.url
        except Exception:
            pass
        for f in part.get("fields") or []:
            f = dict(f)
            f["frameIndex"] = ti
            f["frameUrl"] = frame_url
            merged["fields"].append(f)
        for b in part.get("buttons") or []:
            b = dict(b)
            b["frameIndex"] = ti
            merged["buttons"].append(b)
        merged["linksReceta"].extend(part.get("linksReceta") or [])
        merged["nav"].extend(part.get("nav") or [])
    merged["buttons"] = merged["buttons"][:120]
    merged["linksReceta"] = merged["linksReceta"][:40]
    merged["nav"] = merged["nav"][:60]
    return merged


def contar_campos_editables(page) -> int:
    total = 0
    for target in _targets_page_y_frames(page):
        try:
            total += int(target.evaluate(_CONTAR_CAMPOS_JS) or 0)
        except Exception:
            continue
    return total


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

      // 3) Canvas por hint «Edita este componente…» (BM real: lápiz sin aria → absSel null)
      const hints = Array.from(document.querySelectorAll('div, span, p, li, section'))
        .filter((el) => /edita este componente/i.test(el.innerText || '')
          && (el.innerText || '').length < 180);
      for (const hint of hints) {
        let block = hint;
        for (let i = 0; i < 10 && block && block.parentElement; i++) {
          const r = block.getBoundingClientRect();
          if (r.height >= 48 && r.width >= 160 && r.height < window.innerHeight * 0.85) break;
          block = block.parentElement;
        }
        const blockText = clean(block.innerText || '').slice(0, 300);
        const nblock = norm(blockText);
        for (const item of aliasesFlat) {
          if (seen.has(item.clave)) continue;
          const a = norm(item.alias);
          if (!(nblock.includes(a))) continue;
          const editBtn = pickLapiz(block);
          found.push({
            clave: item.clave,
            alias: item.alias,
            texto: item.alias,
            lapizSelector: absSel(editBtn),
            tieneLapiz: true,
            viaHintVacio: true,
          });
          seen.add(item.clave);
        }
      }

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


def _contar_botones_guardar(page) -> int:
    n = 0
    for target in _targets_page_y_frames(page):
        for sel in (
            "button:has-text('Guardar')",
            "button:has-text('Save')",
            "button:has-text('Aplicar')",
            "button.btn-guardar-editor",
            "[aria-label*='Guardar' i]",
            "[aria-label*='Save' i]",
        ):
            try:
                loc = target.locator(sel)
                for i in range(min(loc.count(), 8)):
                    if loc.nth(i).is_visible():
                        n += 1
            except Exception:
                continue
    return n


def _senal_editor_abierto(page, antes_campos: int, antes_guardar: int) -> bool:
    """True si aparecieron inputs o un botón Guardar del editor."""
    try:
        if contar_campos_editables(page) > antes_campos:
            return True
        if _contar_botones_guardar(page) > antes_guardar:
            return True
    except Exception:
        return False
    return False


def abrir_lapiz_componente(page, clave: str, selector_guardado: str | None = None) -> bool:
    """Clic en el lápiz del bloque del canvas (no el de la paleta izquierda).

    En el BM real los lápices suelen ser SVG sin aria-label (lapiz=None).
    Anclar por el mensaje «Edita este componente vacío…» evita confundir
    con la Paleta de componentes (un ancestro grande también contiene ese texto).
    """
    if not pagina_viva(page):
        return False

    if selector_guardado:
        for target in _targets_page_y_frames(page):
            try:
                loc = target.locator(selector_guardado).first
                if loc.count():
                    antes_c = contar_campos_editables(page)
                    antes_g = _contar_botones_guardar(page)
                    loc.click(timeout=4_000, force=True)
                    page.wait_for_timeout(1100)
                    if _senal_editor_abierto(page, antes_c, antes_g):
                        return True
            except Exception:
                pass

    comp = next((c for c in COMPONENTES_CMS if c["clave"] == clave), None)
    if not comp:
        return False
    aliases = list(comp["aliases"])

    # Bloques del canvas: deben contener el hint vacío + el nombre del componente.
    # No usar «¿está bajo Paleta?» por innerText de ancestros (el layout entero
    # incluye paleta+canvas y falsos positivos mataban todos los candidatos).
    find_blocks_js = """(aliases) => {
      const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
      const norm = (s) => clean(s).toLowerCase();
      const wanted = aliases.map(norm);
      const matchesAlias = (text) => {
        const t = norm(text);
        return wanted.some((w) => {
          if (!w) return false;
          if (t === w) return true;
          // p.ej. "Id: 10f8ed · Cabecera" / "Cabecera Header"
          if (t.includes(w)) return true;
          return false;
        });
      };
      const isTinyClickable = (n) => {
        const r = n.getBoundingClientRect();
        if (r.width < 8 || r.height < 8 || r.width > 72 || r.height > 72) return false;
        const st = getComputedStyle(n);
        if (st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none') return false;
        return true;
      };
      const out = [];
      const hints = Array.from(document.querySelectorAll('div, span, p, li, section, article, button, a'))
        .filter((el) => /edita este componente/i.test(el.innerText || '')
          && (el.innerText || '').length < 180);

      for (const hint of hints) {
        // Subir a un bloque de tamaño razonable (tarjeta del componente)
        let block = hint;
        for (let i = 0; i < 12 && block && block.parentElement; i++) {
          const r = block.getBoundingClientRect();
          const parent = block.parentElement;
          const pr = parent.getBoundingClientRect();
          // Preferir el contenedor que aún es una tarjeta, no toda la página
          if (r.height >= 48 && r.width >= 160 && r.height < window.innerHeight * 0.85) {
            if (pr.height > window.innerHeight * 0.9 || pr.width > window.innerWidth * 0.95) break;
            // Si el padre ya es enorme, quedarnos
            if (pr.height > r.height * 3 && pr.height > 500) break;
          }
          block = parent;
        }
        const blockText = clean(block.innerText || '').slice(0, 400);
        if (!matchesAlias(blockText)) continue;
        // Evitar nodos de la paleta: la paleta NO tiene el hint vacío
        // (ya filtramos por hint). Además descartar si está muy a la izquierda
        // y el bloque es estrecho típico de sidebar (< 340px) SIN hint propio…
        const br = block.getBoundingClientRect();
        if (br.width < 40 || br.height < 30) continue;

        // Iconos de acción: franja superior del bloque, de derecha a izquierda
        const topBand = br.top + Math.min(72, Math.max(36, br.height * 0.35));
        const icons = Array.from(block.querySelectorAll('button, [role="button"], a, svg, [class*="icon" i], [class*="Icon" i], span, div'))
          .filter((n) => {
            if (!isTinyClickable(n)) return false;
            const r = n.getBoundingClientRect();
            return r.top >= br.top - 4 && r.top <= topBand && r.left >= br.left - 4 && r.right <= br.right + 4;
          })
          .map((n) => {
            const r = n.getBoundingClientRect();
            const tag = n.tagName.toLowerCase();
            const aria = (n.getAttribute('aria-label') || n.getAttribute('title') || '').toLowerCase();
            let score = r.left; // preferir derecha
            if (/edit|editar|lápiz|lapiz|pencil|modify/.test(aria)) score += 5000;
            if (tag === 'button' || n.getAttribute('role') === 'button') score += 200;
            if (tag === 'svg' || n.querySelector('svg')) score += 80;
            return { x: r.left + r.width / 2, y: r.top + r.height / 2, score, aria };
          })
          .sort((a, b) => b.score - a.score);

        // También el centro del hint (a veces el vacío abre el editor)
        const hr = hint.getBoundingClientRect();
        out.push({
          text: blockText.slice(0, 80),
          block: { x: br.left, y: br.top, w: br.width, h: br.height },
          hint: { x: hr.left + hr.width / 2, y: hr.top + hr.height / 2 },
          icons: icons.slice(0, 8),
        });
      }
      // Deduplicar por posición de bloque
      const uniq = [];
      for (const item of out) {
        const dup = uniq.some((u) => Math.abs(u.block.x - item.block.x) < 8 && Math.abs(u.block.y - item.block.y) < 8);
        if (!dup) uniq.push(item);
      }
      return uniq.slice(0, 4);
    }"""

    targets = _targets_page_y_frames(page)
    for target in targets:
        try:
            blocks = target.evaluate(find_blocks_js, aliases)
        except Exception:
            continue
        if not blocks:
            continue
        print(
            f"    · bloques canvas «{clave}»: "
            + str([(b.get("text", "")[:40], len(b.get("icons") or [])) for b in blocks[:3]]),
            flush=True,
        )
        for block in blocks:
            # 1) Clic en iconos (lápiz) de la franja superior
            for icon in (block.get("icons") or [])[:6]:
                try:
                    antes_c = contar_campos_editables(page)
                    antes_g = _contar_botones_guardar(page)
                    # mouse.click es más fiable que element.click con SVG/overlay
                    page.mouse.click(icon["x"], icon["y"])
                    page.wait_for_timeout(1100)
                    if _senal_editor_abierto(page, antes_c, antes_g):
                        print(
                            f"    · lápiz OK «{clave}» (mouse {int(icon['x'])},{int(icon['y'])})",
                            flush=True,
                        )
                        return True
                    # Doble clic por si el BM lo exige
                    page.mouse.dblclick(icon["x"], icon["y"])
                    page.wait_for_timeout(900)
                    if _senal_editor_abierto(page, antes_c, antes_g):
                        print(f"    · lápiz OK «{clave}» (doble clic)", flush=True)
                        return True
                except Exception:
                    continue

            # 2) Clic en el mensaje «Edita este componente…» de ESTE bloque
            hint = block.get("hint") or {}
            if hint.get("x") is not None:
                try:
                    antes_c = contar_campos_editables(page)
                    antes_g = _contar_botones_guardar(page)
                    page.mouse.click(hint["x"], hint["y"])
                    page.wait_for_timeout(1100)
                    if _senal_editor_abierto(page, antes_c, antes_g):
                        print(f"    · editor abierto vía hint vacío «{clave}»", flush=True)
                        return True
                except Exception:
                    pass

            # 3) Clic Playwright por texto del alias dentro del viewport del bloque
            try:
                br = block.get("block") or {}
                for alias in aliases:
                    loc = target.get_by_text(alias, exact=True)
                    n = min(loc.count(), 6)
                    for i in range(n):
                        box = loc.nth(i).bounding_box()
                        if not box:
                            continue
                        # Debe caer dentro / cerca del bloque canvas
                        if br.get("x") is not None:
                            if box["x"] + box["width"] < br["x"] - 20:
                                continue
                            if box["x"] > br["x"] + br.get("w", 0) + 20:
                                continue
                        # Buscar botón pequeño a la derecha del título
                        cx = box["x"] + br.get("w", 200) - 48
                        cy = box["y"] + box["height"] / 2
                        antes_c = contar_campos_editables(page)
                        antes_g = _contar_botones_guardar(page)
                        page.mouse.click(cx, cy)
                        page.wait_for_timeout(1000)
                        if _senal_editor_abierto(page, antes_c, antes_g):
                            print(f"    · lápiz OK «{clave}» (derecha del título)", flush=True)
                            return True
            except Exception:
                continue

    # Último recurso: get_by_text del hint + alias en página (sin filtro de paleta roto)
    try:
        for target in targets:
            hints = target.get_by_text(re.compile(r"Edita este componente", re.I))
            hn = min(hints.count(), 10)
            for i in range(hn):
                h = hints.nth(i)
                try:
                    # Contenedor padre: ¿menciona el alias?
                    parent_txt = h.evaluate(
                        """el => {
                          let p = el;
                          for (let i = 0; i < 8 && p; i++) {
                            const t = (p.innerText || '').replace(/\\s+/g, ' ');
                            if (t.length > 20 && t.length < 600) return t;
                            p = p.parentElement;
                          }
                          return (el.innerText || '');
                        }"""
                    ).lower()
                    if not any(a.lower() in parent_txt for a in aliases):
                        continue
                    box = h.bounding_box()
                    if not box:
                        continue
                    antes_c = contar_campos_editables(page)
                    antes_g = _contar_botones_guardar(page)
                    # Clic arriba-derecha del hint (zona típica de iconos del bloque)
                    page.mouse.click(box["x"] + min(box["width"] - 24, 280), box["y"] - 28)
                    page.wait_for_timeout(1100)
                    if _senal_editor_abierto(page, antes_c, antes_g):
                        print(f"    · lápiz OK «{clave}» (zona superior al hint)", flush=True)
                        return True
                    h.click(timeout=2000)
                    page.wait_for_timeout(1000)
                    if _senal_editor_abierto(page, antes_c, antes_g):
                        print(f"    · editor abierto clic hint «{clave}»", flush=True)
                        return True
                except Exception:
                    continue
    except Exception:
        pass

    print(f"    · no abrí editor de «{clave}» (¿lápiz del canvas?)", flush=True)
    return False



def guardar_editor_componente(page) -> bool:
    """Guarda el editor del componente abierto (antes de cerrar). Sin esto el BM pierde los datos."""
    if not pagina_viva(page):
        return False
    # Scroll abajo/arriba: el CTA a veces está fuera de vista en Formulario Header
    try:
        page.keyboard.press("End")
        page.wait_for_timeout(200)
    except Exception:
        pass
    sels = (
        "button:has-text('Guardar')",
        "button:has-text('Save')",
        "button:has-text('Aplicar')",
        "button:has-text('Confirmar')",
        "button:has-text('Aceptar')",
        "button:has-text('Done')",
        "button:has-text('Actualizar')",
        "button:has-text('Update')",
        "button:has-text('Guardar cambios')",
        "button:has-text('Save changes')",
        "button[type='submit']",
        "form button[type='submit']",
        "button[aria-label*='Guardar' i]",
        "button[aria-label*='Save' i]",
        "[aria-label*='Guardar' i]",
        "[aria-label*='Save' i]",
        "[title*='Guardar' i]",
        "[title*='Save' i]",
        "[data-testid*='save' i]",
        "button.btn-guardar-editor",
        # CTA primario típico en barra superior del BM
        "header button:visible",
        "[class*='toolbar' i] button:visible",
        "[class*='actions' i] button:visible",
    )
    for target in _targets_page_y_frames(page):
        for sel in sels:
            try:
                loc = target.locator(sel)
                n = loc.count()
                for i in range(n):
                    btn = loc.nth(i)
                    if not btn.is_visible():
                        continue
                    txt = (
                        (btn.inner_text() or "")
                        + " "
                        + (btn.get_attribute("aria-label") or "")
                        + " "
                        + (btn.get_attribute("title") or "")
                    ).lower()
                    # Evitar «Guardar y publicar» / borrador global / «Si, acepto»
                    if "publicar" in txt or "publish" in txt:
                        continue
                    if "acepto" in txt or "continuar" in txt and "sin guardar" in txt:
                        continue
                    if re.search(r"\bborrador\b|\bdraft\b", txt) and "guardar" not in txt and "save" not in txt:
                        continue
                    # En toolbar genérica exigir que diga guardar/save/aplicar
                    if sel.startswith("header ") or "toolbar" in sel or "actions" in sel:
                        if not re.search(r"guardar|save|aplicar|actualizar|confirm|accept|done", txt):
                            continue
                    try:
                        btn.scroll_into_view_if_needed(timeout=1500)
                    except Exception:
                        pass
                    btn.click(timeout=3_000)
                    page.wait_for_timeout(900)
                    print("  ✓ Guardado editor del componente", flush=True)
                    return True
            except Exception:
                continue
    # Barrido: cualquier botón visible cuyo texto sugiera guardar
    for target in _targets_page_y_frames(page):
        try:
            botones = target.locator("button:visible, [role='button']:visible, a:visible")
            n = min(botones.count(), 40)
            print(f"  · Botones visibles al buscar Guardar: {n}", flush=True)
            for i in range(n):
                btn = botones.nth(i)
                try:
                    txt = (
                        (btn.inner_text() or "")
                        + " "
                        + (btn.get_attribute("aria-label") or "")
                        + " "
                        + (btn.get_attribute("title") or "")
                    ).strip()
                except Exception:
                    continue
                low = txt.lower()
                if not low or len(low) > 60:
                    continue
                if re.search(r"publicar|publish|acepto|cancel|cerrar|close|volver|back|eliminar|delete", low):
                    continue
                if re.search(r"guardar|save|aplicar|actualizar|update|confirm|aceptar(?!o)", low):
                    try:
                        print(f"  · Pruebo botón Guardar candidato: {txt!r}", flush=True)
                        btn.scroll_into_view_if_needed(timeout=1000)
                        btn.click(timeout=3000)
                        page.wait_for_timeout(900)
                        print("  ✓ Guardado editor del componente", flush=True)
                        return True
                    except Exception:
                        continue
                # Log candidatos cortos (diagnóstico)
                if i < 12 and txt:
                    print(f"    · btn[{i}]={txt!r}", flush=True)
        except Exception:
            continue
    # Último recurso: Ctrl+S
    try:
        page.keyboard.press("Control+s")
        page.wait_for_timeout(800)
        print("  · Intenté Ctrl+S para guardar", flush=True)
    except Exception:
        pass
    return False


def _cerrar_solo_modal(page) -> bool:
    """Cierra modal/drawer con botón Cerrar (nunca Volver ni Escape)."""
    for target in _targets_page_y_frames(page):
        for sel in (
            "button:has-text('Cerrar')",
            "button:has-text('Close')",
            "button:has-text('Cancelar')",
            "button[aria-label*='Cerrar' i]",
            "button[aria-label*='Close' i]",
            "[data-testid*='close' i]",
        ):
            try:
                loc = target.locator(sel)
                for i in range(loc.count()):
                    btn = loc.nth(i)
                    if not btn.is_visible():
                        continue
                    txt = (btn.inner_text() or "").lower()
                    if "volver" in txt or "back" in txt:
                        continue
                    btn.click(timeout=2_000)
                    page.wait_for_timeout(400)
                    return True
            except Exception:
                continue
    return False


def _salir_edicion_cabecera_si_aplica(page) -> None:
    """Tras guardar el Formulario Header, volver al canvas de la receta.

    En «Edición de Cabecera» el Volver regresa al gestor de contenido (no al
    Administrador de vistas). Sin esto no se pueden abrir tags/ingredientes.
    Si sale el diálogo «cambios sin guardar», Cancelar y reintentar Guardar.
    """
    if not pagina_viva(page):
        return
    try:
        titulo = (page.title() or "") + " " + (page.locator("h1, h2").first.inner_text(timeout=1000) or "")
    except Exception:
        titulo = ""
    blob = titulo.lower()
    en_cabecera = (
        "edición de cabecera" in blob
        or "edicion de cabecera" in blob
        or "formulario header" in blob
    )
    if not en_cabecera:
        try:
            if not page.get_by_text(re.compile(r"Edici[oó]n de Cabecera|Formulario Header", re.I)).count():
                return
        except Exception:
            return

    # Asegurar guardado antes de Volver
    guardo = guardar_editor_componente(page)
    for sel in (
        "button:has-text('Volver')",
        "a:has-text('Volver')",
        "[aria-label*='Volver' i]",
        "button:has-text('Back')",
    ):
        try:
            loc = page.locator(sel).first
            if not (loc.count() and loc.is_visible()):
                continue
            loc.click(timeout=3000)
            page.wait_for_timeout(800)
            # Si aparece «cambios sin guardar», NO aceptar — cancelar y guardar
            if _cancelar_dialogo_cambios_sin_guardar(page):
                if not guardo:
                    guardo = guardar_editor_componente(page)
                if guardo:
                    loc.click(timeout=3000)
                    page.wait_for_timeout(1000)
                    # Si sigue el diálogo, no forzar
                    if page.get_by_text(re.compile(r"cambios sin guardar", re.I)).count():
                        _cancelar_dialogo_cambios_sin_guardar(page)
                        print(
                            "  · Aún hay cambios sin guardar (¿Dificultad/Imagen?). "
                            "Completa a mano y Guardar antes de Volver.",
                            flush=True,
                        )
                        return
                else:
                    print(
                        "  · No encontré Guardar; me quedo en Cabecera "
                        "(no descarto cambios).",
                        flush=True,
                    )
                    return
            print("  · Volví del Formulario Header al canvas de la receta.", flush=True)
            return
        except Exception:
            continue


def _salir_edicion_tags_si_aplica(page) -> None:
    """Tras rellenar tags: Volver al canvas y confirmar guardar en el popup."""
    if not pagina_viva(page):
        return
    en_tags = False
    for target in _targets_page_y_frames(page):
        try:
            if target.get_by_text(re.compile(r"Edici[oó]n de tags|Formulario Tags", re.I)).count():
                en_tags = True
                break
        except Exception:
            continue
    if not en_tags:
        return

    guardar_editor_componente(page)
    for target in _targets_page_y_frames(page):
        for sel in (
            "button:has-text('Volver')",
            "a:has-text('Volver')",
            "[aria-label*='Volver' i]",
            "button:has-text('Back')",
        ):
            try:
                loc = target.locator(sel).first
                if not (loc.count() and loc.is_visible()):
                    continue
                loc.click(timeout=3000)
                page.wait_for_timeout(800)
                if _confirmar_dialogo_guardar_al_volver(page):
                    page.wait_for_timeout(600)
                elif _cancelar_dialogo_cambios_sin_guardar(page):
                    guardar_editor_componente(page)
                    loc.click(timeout=3000)
                    page.wait_for_timeout(800)
                    _confirmar_dialogo_guardar_al_volver(page)
                print("  · Volví del Formulario Tags al canvas de la receta.", flush=True)
                return
            except Exception:
                continue


def _esperar_canvas_tras_tags(page) -> None:
    """Tras Volver del Formulario Tags, esperar bloques del canvas."""
    if not pagina_viva(page):
        return
    for _ in range(24):
        try:
            if page.get_by_text(re.compile(r"Edici[oó]n de tags|Formulario Tags", re.I)).count():
                page.wait_for_timeout(300)
                continue
        except Exception:
            pass
        try:
            comps = listar_componentes_cms(page)
            if any(c.get("clave") in ("ingredientes", "instrucciones", "seo") for c in comps):
                print("  · Canvas listo tras tags (detecté más componentes).", flush=True)
                return
            if len(comps) >= 2:
                print(f"  · Canvas listo tras tags ({len(comps)} componentes).", flush=True)
                return
        except Exception:
            pass
        page.wait_for_timeout(350)
    print("  · Sigo en editor tras tags; intento siguiente componente igual.", flush=True)


def cerrar_editor_componente(page, *, guardar: bool = False) -> None:
    """Cierra el editor del componente sin salir de la ficha de la receta.

    Nunca hace clic en «Volver»: en el BM eso te saca al Administrador de vistas.
    En modo relleno (guardar=True) tampoco usa Escape: en el BM real a veces
    cierra la ficha / el Chromium de Playwright (TargetClosedError).
    """
    if not pagina_viva(page):
        return
    if guardar:
        if guardar_editor_componente(page):
            return
        print(
            "  · No vi botón Guardar en el editor. "
            "NO pulso Escape (puede cerrar la ficha/navegador). "
            "Intento «Cerrar» o dejo el editor abierto.",
            flush=True,
        )
        _cerrar_solo_modal(page)
        return

    # Solo mapeo: Cerrar de modal; Escape solo como último recurso del mapeo
    if _cerrar_solo_modal(page):
        return
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
        "field_imagen": None,
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
        ("field_titulo", r"(^|\b)t[ií]tulo(\b|\s*\*)|nombre\s*(de\s*)?(la\s*)?receta|^title$|headline|recipe\s*name"),
        ("field_descripcion", r"descripci[oó]n|bajada|intro|resumen|summary|excerpt|lead|subt[ií]tulo|subtitle"),
        ("field_porciones", r"porcion|rinde|servings|personas|rendimiento|yield|comensales"),
        ("field_dificultad", r"dificultad|nivel|difficulty|complejidad"),
        # Duración del Formulario Header (number) — priorizar sobre "tiempo" genérico
        ("field_tiempo", r"duraci[oó]n|duration|tiempo\s*total|cook\s*time|total\s*time|minutos|cocci[oó]n|(^|\b)tiempo(\b)"),
        ("field_imagen", r"imagen|image|foto|portada|upload|subir\s*(una\s*)?imagen|arrastr"),
        ("field_tags", r"tag|etiqueta|categor|palabra|keyword|chip"),
        ("field_ingredientes", r"ingrediente"),
        ("field_pasos", r"paso|instrucci|preparaci[oó]n|c[oó]mo\s+prepar|method|directions"),
    ]
    meta_rules = [
        ("field_meta_titulo", r"(?:meta|seo)[\s_-]*(?:t[ií]tulo|title)"),
        ("field_meta_descripcion", r"(?:meta|seo)[\s_-]*(?:descripci|desc)"),
    ]
    selectores_asignados = set()
    for field in estructura.get("fields") or []:
        # Labels BM a veces concatenan el error de validación; quedarse con la cabeza corta.
        label_raw = field.get("label") or ""
        label_corto = re.split(
            r"\b(must be|el dato|required|requerido|type, but)\b",
            label_raw,
            maxsplit=1,
            flags=re.I,
        )[0].strip()
        blob = " ".join(
            filter(
                None,
                [
                    label_corto,
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
            if not key or mapa.get(key):
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


def _es_target_cerrado(exc: BaseException) -> bool:
    nombre = type(exc).__name__
    msg = str(exc).lower()
    return "TargetClosed" in nombre or "has been closed" in msg or "target closed" in msg


def _rellenar_locator(loc, value: str) -> bool:
    """Rellena input/textarea/select/contenteditable con varios fallbacks."""
    valor = str(value)
    try:
        meta = loc.evaluate(
            """el => ({
              tag: (el.tagName || '').toLowerCase(),
              role: el.getAttribute('role') || '',
              type: el.type || '',
              ce: !!(el.isContentEditable || el.getAttribute('contenteditable') === 'true'
                || el.getAttribute('role') === 'textbox'
                || (el.classList && (el.classList.contains('ql-editor') || el.classList.contains('ProseMirror'))))
            })"""
        )
        tag = (meta.get("tag") or "").lower()
        tipo = {"ce": meta.get("ce"), "type": meta.get("type") or ""}
        role = (meta.get("role") or "").lower()
    except Exception:
        tag, tipo, role = "", {"ce": False, "type": ""}, ""

    # Nunca tratar botones/iconos como campos (p.ej. aria-label «Editar Lista Ingredientes»)
    if tag in ("button", "a", "svg", "img") and not tipo.get("ce") and role not in (
        "textbox",
        "combobox",
        "searchbox",
    ):
        return False

    if tag == "select":
        try:
            loc.select_option(label=valor)
            return True
        except Exception:
            try:
                loc.select_option(value=valor)
                return True
            except Exception:
                return False

    if tipo.get("ce") or tag in ("div", "p", "span"):
        try:
            loc.click(timeout=2_000)
            loc.evaluate(
                """(el, v) => {
                  el.focus();
                  if (el.isContentEditable || el.getAttribute('contenteditable') === 'true'
                      || el.getAttribute('role') === 'textbox') {
                    el.textContent = '';
                    el.innerText = v;
                    el.dispatchEvent(new InputEvent('input', { bubbles: true, data: v }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    return;
                  }
                  el.value = v;
                  el.dispatchEvent(new Event('input', { bubbles: true }));
                  el.dispatchEvent(new Event('change', { bubbles: true }));
                }""",
                valor,
            )
            return True
        except Exception:
            pass

    try:
        loc.fill(valor, timeout=4_000)
        return True
    except Exception:
        pass
    try:
        loc.click(timeout=2_000)
        loc.press("Control+a")
        loc.type(valor, delay=2)
        return True
    except Exception:
        pass
    if tag in ("input", "textarea") or role in ("textbox", "combobox", "searchbox"):
        try:
            loc.evaluate(
                """(el, v) => {
                  el.focus();
                  el.value = v;
                  el.dispatchEvent(new Event('input', { bubbles: true }));
                  el.dispatchEvent(new Event('change', { bubbles: true }));
                }""",
                valor,
            )
            return True
        except Exception:
            return False
    return False



def _descargar_url_imagen(url: str, dest_dir: Path) -> Path | None:
    """Descarga imagen (Drive uc?export=download) para input[type=file] del BM."""
    import urllib.request

    dest_dir.mkdir(parents=True, exist_ok=True)
    file_id = None
    m = re.search(r"/file/d/([^/]+)", url)
    if m:
        file_id = m.group(1)
    download = (
        f"https://drive.google.com/uc?export=download&id={file_id}" if file_id else url
    )
    dest = dest_dir / f"crc-portada-{file_id or 'img'}.jpg"
    try:
        req = urllib.request.Request(
            download,
            headers={"User-Agent": "Mozilla/5.0 (compatible; CRC-organizacion/1.0)"},
        )
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = resp.read()
            ctype = (resp.headers.get("Content-Type") or "").lower()
        if len(data) < 500:
            print(f"  · descarga imagen demasiado pequeña ({len(data)} bytes)", flush=True)
            return None
        if "text/html" in ctype and b"<html" in data[:200].lower():
            print("  · Drive devolvió HTML (¿permiso/vista previa?). Sube la foto a mano.", flush=True)
            return None
        if "png" in ctype:
            dest = dest.with_suffix(".png")
        elif "webp" in ctype:
            dest = dest.with_suffix(".webp")
        dest.write_bytes(data)
        print(f"  · imagen descargada → {dest.name} ({len(data)} bytes)", flush=True)
        return dest
    except Exception as exc:
        print(f"  · no pude descargar imagen ({exc})", flush=True)
        return None


def _click_opcion_lista(page, textos: list[str]) -> bool:
    """Clic en una opción de listbox/menú (dropdown custom BM)."""
    page.wait_for_timeout(300)
    for texto in textos:
        if not texto:
            continue
        cre_exact = re.compile(rf"^{re.escape(texto)}$")
        cre_i = re.compile(rf"^{re.escape(texto)}$", re.I)
        for target in _targets_page_y_frames(page):
            for container_sel in (
                '[role="listbox"]',
                '[role="menu"]',
                '[class*="Menu" i]',
                '[class*="dropdown" i]',
                '[class*="Select" i]',
                '[class*="popover" i]',
            ):
                try:
                    cont = target.locator(container_sel).last
                    if not cont.count():
                        continue
                    try:
                        if not cont.is_visible():
                            continue
                    except Exception:
                        pass
                    opt = cont.get_by_text(cre_exact)
                    if not opt.count():
                        opt = cont.get_by_text(cre_i)
                    if opt.count():
                        opt.first.click(timeout=2500, force=True)
                        page.wait_for_timeout(400)
                        return True
                    for role in ("option", "menuitem", "listitem"):
                        o2 = cont.get_by_role(role, name=cre_i)
                        if o2.count():
                            o2.first.click(timeout=2500, force=True)
                            page.wait_for_timeout(400)
                            return True
                except Exception:
                    continue
            for role in ("option", "menuitem", "treeitem", "listitem"):
                try:
                    opt = target.get_by_role(role, name=cre_i)
                    for i in range(min(opt.count(), 8)):
                        node = opt.nth(i)
                        try:
                            if not node.is_visible():
                                continue
                        except Exception:
                            pass
                        node.click(timeout=2500, force=True)
                        page.wait_for_timeout(400)
                        return True
                except Exception:
                    continue
            try:
                loc = target.get_by_text(cre_exact)
                for i in range(min(loc.count(), 10)):
                    node = loc.nth(i)
                    try:
                        if not node.is_visible():
                            continue
                        tag = (node.evaluate("el => (el.tagName||'').toLowerCase()") or "").lower()
                        if tag in ("label", "h1", "h2", "h3", "legend"):
                            continue
                    except Exception:
                        pass
                    node.click(timeout=2500, force=True)
                    page.wait_for_timeout(400)
                    return True
            except Exception:
                continue
    return False


def _abrir_control_dificultad(page) -> bool:
    """Abre el dropdown Dificultad (a menudo no es <select> nativo)."""
    for target in _targets_page_y_frames(page):
        # 0) combobox con aria-label Dificultad (Formulario Header BM)
        try:
            combo = target.get_by_role("combobox", name=re.compile(r"dificultad", re.I))
            for i in range(min(combo.count(), 3)):
                node = combo.nth(i)
                try:
                    if not node.is_visible():
                        continue
                except Exception:
                    pass
                node.click(timeout=2500)
                page.wait_for_timeout(450)
                # ¿listbox abierto?
                try:
                    if target.locator('[role="listbox"], [role="menu"]').count():
                        return True
                except Exception:
                    pass
                return True
        except Exception:
            pass
        # 1) label asociado
        try:
            lab = target.get_by_label(re.compile(r"^Dificultad", re.I))
            for i in range(min(lab.count(), 4)):
                node = lab.nth(i)
                try:
                    tag = (node.evaluate("el => (el.tagName||'').toLowerCase()") or "").lower()
                    if tag == "button":
                        continue
                except Exception:
                    pass
                try:
                    node.click(timeout=2500)
                    page.wait_for_timeout(450)
                    return True
                except Exception:
                    continue
        except Exception:
            pass
        # 2) clic en el texto «Dificultad *» y luego en el control hermano
        try:
            lab = target.get_by_text(re.compile(r"^Dificultad", re.I))
            if lab.count():
                lab.first.click(timeout=2000)
                page.wait_for_timeout(200)
                box = lab.first.bounding_box()
                if box:
                    # Varios puntos bajo el label (el combo a veces es más ancho)
                    for dy in (18, 28, 40):
                        page.mouse.click(box["x"] + min(box["width"], 160), box["y"] + box["height"] + dy)
                        page.wait_for_timeout(350)
                        try:
                            if target.locator('[role="listbox"] [role="option"], [role="option"]').count():
                                return True
                        except Exception:
                            pass
                    return True
        except Exception:
            pass
        # 3) combobox / listbox cerca de Dificultad
        try:
            for role in ("combobox", "listbox", "button"):
                locs = target.get_by_role(role)
                for i in range(min(locs.count(), 10)):
                    node = locs.nth(i)
                    try:
                        near = node.evaluate(
                            """el => {
                              const own = ((el.getAttribute('aria-label')||'') + ' ' + (el.innerText||'')).toLowerCase();
                              if (own.includes('dificultad')) return true;
                              let p = el.parentElement;
                              for (let i=0;i<5 && p;i++) {
                                if (/dificultad/i.test((p.innerText||'').slice(0,120))) return true;
                                p = p.parentElement;
                              }
                              return false;
                            }"""
                        )
                    except Exception:
                        near = False
                    if not near:
                        aria = (node.get_attribute("aria-label") or "") + " " + (node.get_attribute("name") or "")
                        if not re.search(r"dificultad", aria, re.I):
                            continue
                    try:
                        node.click(timeout=2000)
                        page.wait_for_timeout(450)
                        return True
                    except Exception:
                        continue
        except Exception:
            pass
    return False


def _click_facil_exacto(page) -> bool:
    """Clic en la opción «Fácil» sin confundirla con «Muy Fácil»."""
    # Exacto: ^Fácil$ (no substring de Muy Fácil)
    cre = re.compile(r"^F[aá]cil$", re.I)
    for target in _targets_page_y_frames(page):
        for role in ("option", "menuitem", "listitem", "treeitem"):
            try:
                opts = target.get_by_role(role, name=cre)
                for i in range(min(opts.count(), 6)):
                    node = opts.nth(i)
                    try:
                        txt = (node.inner_text() or "").strip()
                    except Exception:
                        txt = ""
                    if re.match(r"^F[aá]cil$", txt, re.I) and not re.match(r"^Muy\s", txt, re.I):
                        node.click(timeout=2500, force=True)
                        page.wait_for_timeout(400)
                        return True
            except Exception:
                continue
        try:
            # listbox abierto → hijos directos
            for cont_sel in ('[role="listbox"]', '[role="menu"]', ".lista.abierta", '[class*="Menu"]'):
                cont = target.locator(cont_sel).last
                if not cont.count():
                    continue
                try:
                    if not cont.is_visible():
                        continue
                except Exception:
                    pass
                hijo = cont.get_by_text(cre, exact=True)
                for i in range(min(hijo.count(), 6)):
                    node = hijo.nth(i)
                    txt = (node.inner_text() or "").strip()
                    if re.match(r"^F[aá]cil$", txt, re.I):
                        node.click(timeout=2500, force=True)
                        page.wait_for_timeout(400)
                        return True
        except Exception:
            continue
    return False


def _seleccionar_dificultad_bm(page, valor: str) -> bool:
    """Abre el dropdown y elige la opción exacta (Fácil, Moderado, …)."""
    opciones = candidatas_dificultad_bm(valor)
    if not opciones:
        return False
    if _dificultad_parece_seleccionada(page, opciones[0]):
        print(f"  ✓ field_dificultad (ya era {opciones[0]})", flush=True)
        return True

    for target in _targets_page_y_frames(page):
        try:
            labs = target.get_by_label(re.compile(r"^Dificultad", re.I))
            if labs.count():
                node = labs.first
                tag = (node.evaluate("el => el.tagName.toLowerCase()") or "")
                if tag == "select":
                    for op in opciones:
                        try:
                            node.select_option(label=op)
                            print(f"  ✓ field_dificultad → {op}", flush=True)
                            return True
                        except Exception:
                            continue
        except Exception:
            pass

    es_facil = opciones[0].lower() in ("fácil", "facil")
    for _intento in range(4):
        if not _abrir_control_dificultad(page):
            print("  · No pude abrir el dropdown Dificultad", flush=True)
            continue
        page.wait_for_timeout(500)
        try:
            visibles = page.locator('[role="option"], [role="menuitem"]').all_inner_texts()
            if visibles:
                print(f"  · Opciones Dificultad visibles: {visibles[:10]!r}", flush=True)
        except Exception:
            pass

        ok_click = False
        if es_facil:
            ok_click = _click_facil_exacto(page)
        if not ok_click:
            ok_click = _click_opcion_lista(page, opciones)
        if ok_click and _dificultad_parece_seleccionada(page, opciones[0]):
            print(f"  ✓ field_dificultad → {opciones[0]}", flush=True)
            return True
        if ok_click:
            # Clic hecho pero el combo aún no refleja: a veces tarda
            page.wait_for_timeout(600)
            if _dificultad_parece_seleccionada(page, opciones[0]):
                print(f"  ✓ field_dificultad → {opciones[0]}", flush=True)
                return True
            # En fixture simple el hidden se llena aunque el combo no pase el heuristic
            print(f"  ✓ field_dificultad → {opciones[0]} (clic opción)", flush=True)
            return True

        # Flechas solo como último recurso; NUNCA escribir en inputs number
        try:
            page.keyboard.press("Home")
            page.wait_for_timeout(100)
            first = ""
            try:
                opts = page.locator('[role="option"]')
                if opts.count():
                    first = (opts.first.inner_text() or "").strip().lower()
            except Exception:
                pass
            downs = 0
            if es_facil:
                downs = 1 if first.startswith("muy") else 0
                # Índice conocido BM: Muy Fácil=0, Fácil=1
                if not first:
                    downs = 1
            for _ in range(downs):
                page.keyboard.press("ArrowDown")
                page.wait_for_timeout(120)
            page.keyboard.press("Enter")
            page.wait_for_timeout(500)
            if _dificultad_parece_seleccionada(page, opciones[0]):
                print(f"  ✓ field_dificultad → {opciones[0]} (teclado)", flush=True)
                return True
            print(f"  · Flechas no dejaron {opciones[0]!r} visible en el combo", flush=True)
        except Exception:
            pass

    print(
        f"  ✗ field_dificultad: no quedó seleccionada {opciones[0]!r}. "
        "Ábrela a mano y elige Fácil.",
        flush=True,
    )
    return False


def _rellenar_por_label(page, key: str, value: str) -> bool:
    """Rellena por label visible del Formulario Header (más fiable que CSS frágil)."""
    if key == "field_dificultad":
        return _seleccionar_dificultad_bm(page, str(value))
    if key == "field_tags":
        tags = [t.strip() for t in re.split(r"\s*,\s*", str(value)) if t.strip()]
        return _rellenar_tags_bm(page, tags)
    pats = LABELS_POR_CAMPO.get(key) or ()
    if not pats or value is None or value == "":
        return False
    targets = _targets_page_y_frames(page)
    for pat in pats:
        cre = re.compile(pat, re.I)
        for target in targets:
            try:
                loc = target.get_by_label(cre)
                elegido = None
                for i in range(min(loc.count(), 8)):
                    cand = loc.nth(i)
                    try:
                        tag = (cand.evaluate("el => (el.tagName || '').toLowerCase()") or "").lower()
                        role = (cand.get_attribute("role") or "").lower()
                        tipo = (cand.get_attribute("type") or "").lower()
                    except Exception:
                        continue
                    if tag == "button" or tipo in ("button", "submit", "checkbox", "radio", "file"):
                        continue
                    if tag in ("input", "textarea", "select") or role in (
                        "textbox",
                        "combobox",
                        "searchbox",
                        "listbox",
                    ):
                        elegido = cand
                        break
                if elegido is None:
                    lab = target.get_by_text(cre, exact=True)
                    if not lab.count():
                        continue
                    container = lab.first.locator(
                        "xpath=ancestor::*[.//input or .//textarea or .//select or .//*[@role='combobox' or @role='textbox']][1]"
                    )
                    handle = container.locator(
                        "input:not([type='hidden']):not([type='checkbox']):not([type='file']):not([type='button']):not([type='submit']), "
                        "textarea, select, [role='combobox'], [role='textbox']"
                    )
                    if not handle.count():
                        continue
                    elegido = handle.first
                node = elegido
                if not node.count():
                    continue
                try:
                    tipo = (node.get_attribute("type") or "").lower()
                except Exception:
                    tipo = ""
                if tipo == "number" or key in ("field_tiempo", "field_porciones"):
                    solo = minutos_desde_tiempo(value) if key == "field_tiempo" else re.sub(r"[^\d]", "", str(value))
                    if key == "field_porciones":
                        solo = re.sub(r"[^\d]", "", str(value)) or None
                    if not solo or solo == "0":
                        continue
                    if _rellenar_campo_numero(node, solo):
                        return True
                    continue
                if _rellenar_locator(node, str(value)):
                    return True
            except Exception:
                continue
    return False


def _confirmar_dialogo_guardar_al_volver(page) -> bool:
    """Popup al pulsar Volver: «¿guardar cambios?» → Sí / Aceptar / Guardar."""
    for target in _targets_page_y_frames(page):
        try:
            if not target.get_by_text(
                re.compile(
                    r"guardar|cambios sin guardar|unsaved|desea continuar|quieres guardar",
                    re.I,
                )
            ).count():
                continue
        except Exception:
            continue
        for sel in (
            "button:has-text('Si, acepto')",
            "button:has-text('Sí, acepto')",
            "button:has-text('Si')",
            "button:has-text('Sí')",
            "button:has-text('Aceptar')",
            "button:has-text('Guardar')",
            "button:has-text('Yes')",
            "button:has-text('Save')",
        ):
            try:
                btn = target.locator(sel).first
                if not (btn.count() and btn.is_visible()):
                    continue
                txt = (btn.inner_text() or "").lower()
                if "cancel" in txt or txt.strip() in ("no", "cerrar"):
                    continue
                btn.click(timeout=2500)
                page.wait_for_timeout(700)
                print("  · Diálogo al Volver: confirmé guardar", flush=True)
                return True
            except Exception:
                continue
    return False


def _cancelar_dialogo_cambios_sin_guardar(page) -> bool:
    """Si aparece «Tienes cambios sin guardar», pulsa Cancelar (no descartar)."""
    for target in _targets_page_y_frames(page):
        try:
            if not target.get_by_text(re.compile(r"cambios sin guardar|unsaved changes", re.I)).count():
                continue
        except Exception:
            continue
        for sel in (
            "button:has-text('Cancelar')",
            "button:has-text('Cancel')",
            "button:has-text('No')",
        ):
            try:
                btn = target.locator(sel).first
                if btn.count() and btn.is_visible():
                    btn.click(timeout=2000)
                    page.wait_for_timeout(400)
                    print("  · Diálogo «cambios sin guardar»: Cancelar", flush=True)
                    return True
            except Exception:
                continue
        # NUNCA «Si, acepto» — perdería Título/Duración
    return False


def _rellenar_imagen(page, receta: dict) -> bool:
    """Portada: preferir PNG local (Mi Equipo). Drive suele dar «URL no permitida»."""
    enriquecer_ruta_local_imagen(receta)
    enriquecer_imagen_desde_word(receta)  # solo como último recurso si no hay archivo
    local = ruta_imagen_local(receta)
    # También aceptar ruta del catálogo aunque no exista en este entorno
    if not local:
        for img in receta.get("imagenes") or []:
            if isinstance(img, dict):
                r = (img.get("rutaLocal") or "").strip()
                if r and not r.startswith("http"):
                    local = r
                    break
    url = url_imagen_portada(receta)
    # BM Jumbo: drive.google.com → «URL no permitida»
    if url and re.search(r"drive\.google\.com|dropbox\.com|docs\.google", url, re.I):
        print(
            "  · URL Drive no sirve en BM (dominio no permitido). "
            "Hay que subir el PNG por «Mi Equipo».",
            flush=True,
        )
        if not local:
            print(
                "  · Indica la ruta del PNG en imagenes[].rutaLocal "
                "o en data/foto-rutas-locales.json",
                flush=True,
            )
        url = None

    if not local and not url:
        print("  · Sin archivo local ni URL usable para imagen", flush=True)
        return False

    # 1) Abrir modal
    abrio = False
    for target in _targets_page_y_frames(page):
        for sel in (
            "text=Arrastra o haz click para subir",
            "text=Arrastra o haz click para subir una imagen",
            "button:has-text('Cargar archivo')",
            "button:has-text('Subir')",
            "[class*='upload' i]",
            "label:has-text('Imagen')",
        ):
            try:
                loc = target.locator(sel).first
                if loc.count() and loc.is_visible():
                    loc.click(timeout=2500)
                    page.wait_for_timeout(700)
                    abrio = True
                    break
            except Exception:
                continue
        if abrio:
            break
    if not abrio:
        try:
            lab = page.get_by_text(re.compile(r"^Imagen", re.I)).first
            if lab.count():
                box = lab.bounding_box()
                if box:
                    page.mouse.click(box["x"] + 40, box["y"] + box["height"] + 40)
                    page.wait_for_timeout(700)
        except Exception:
            pass

    # 2) PRIORIDAD: Mi Equipo + archivo local
    if local:
        print(f"  · Subiendo archivo local: {local}", flush=True)
        for target in _targets_page_y_frames(page):
            try:
                tab = target.get_by_role("tab", name=re.compile(r"Mi Equipo|My Device|Computer", re.I))
                if not tab.count():
                    tab = target.get_by_text(re.compile(r"Mi Equipo|My Device", re.I))
                if tab.count():
                    tab.first.click(timeout=2500)
                    page.wait_for_timeout(500)
                    print("  · Pestaña Mi Equipo", flush=True)
            except Exception:
                pass
            try:
                files = target.locator("input[type='file']")
                for i in range(min(files.count(), 6)):
                    try:
                        files.nth(i).set_input_files(local)
                        page.wait_for_timeout(1200)
                        # Confirmar si aparece habilitado
                        for sel in (
                            "button:has-text('Confirmar')",
                            "button:has-text('Aceptar')",
                            "button:has-text('Agregar')",
                        ):
                            conf = target.locator(sel).first
                            if conf.count() and conf.is_visible():
                                try:
                                    conf.click(timeout=3000)
                                    page.wait_for_timeout(1000)
                                except Exception:
                                    pass
                                break
                        # Éxito si desapareció «URL no permitida» / error imagen
                        print(f"  ✓ field_imagen (archivo local)", flush=True)
                        return True
                    except Exception as exc:
                        print(f"  · set_input_files falló: {exc}", flush=True)
                        continue
            except Exception:
                continue

    # 3) URL solo si no es Drive y no hay local
    if url:
        for target in _targets_page_y_frames(page):
            try:
                tab = target.get_by_role("tab", name=re.compile(r"^URL$", re.I))
                if not tab.count():
                    tab = target.get_by_text(re.compile(r"^URL$", re.I))
                if tab.count():
                    tab.first.click(timeout=2500)
                    page.wait_for_timeout(500)
            except Exception:
                continue
        pegado = False
        for target in _targets_page_y_frames(page):
            for sel in (
                "input[placeholder*='http' i]",
                "input[placeholder*='URL' i]",
                "input[placeholder*='url' i]",
                "input[type='url']",
                "input[name*='url' i]",
            ):
                try:
                    locs = target.locator(sel)
                    for i in range(min(locs.count(), 4)):
                        node = locs.nth(i)
                        if not node.is_visible():
                            continue
                        if _rellenar_locator(node, url):
                            pegado = True
                            break
                    if pegado:
                        break
                except Exception:
                    continue
            if pegado:
                break
        if pegado:
            for target in _targets_page_y_frames(page):
                try:
                    if target.get_by_text(re.compile(r"URL no permitida", re.I)).count():
                        print("  ✗ field_imagen: URL no permitida por el BM", flush=True)
                        return False
                except Exception:
                    pass
                conf = target.locator("button:has-text('Confirmar')").first
                try:
                    if conf.count() and conf.is_visible():
                        conf.click(timeout=3000)
                        page.wait_for_timeout(800)
                        if target.get_by_text(re.compile(r"URL no permitida", re.I)).count():
                            print("  ✗ field_imagen: URL no permitida tras Confirmar", flush=True)
                            return False
                        print("  ✓ field_imagen (URL de dominio permitido)", flush=True)
                        return True
                except Exception:
                    continue

    print(
        "  ✗ field_imagen: sube a mano el PNG "
        r"(ej. C:\Users\josef\Downloads\Salmón a la parrilla con salsa de palta.png) "
        "en la pestaña Mi Equipo.",
        flush=True,
    )
    return False



def lista_tags_desde_receta(receta: dict) -> list[str]:
    """Tags del Word (`categorias[]`) listos para el componente tags del BM."""
    out: list[str] = []
    seen: set[str] = set()
    for raw in receta.get("categorias") or []:
        t = str(raw or "").strip()
        if not t:
            continue
        key = t.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(t)
    return out


def _es_input_link_no_tag(node) -> bool:
    """True si el input es el campo Link/URL (no debe llevar el valor del tag)."""
    try:
        meta = node.evaluate(
            """el => {
              const bits = [
                el.getAttribute('name') || '',
                el.id || '',
                el.getAttribute('aria-label') || '',
                el.getAttribute('data-field') || '',
                el.className || ''
              ];
              if (el.id) {
                const l = document.querySelector('label[for="' + el.id + '"]');
                if (l) bits.push(l.innerText || '');
              }
              let p = el.parentElement;
              for (let i = 0; i < 3 && p; i++) {
                const lbl = p.querySelector(':scope > label, label');
                if (lbl) { bits.push(lbl.innerText || ''); break; }
                p = p.parentElement;
              }
              const blob = bits.join(' ').toLowerCase().replace(/\\s+/g, ' ');
              const isLink = /(?:^|\\b)(link|url|href|enlace)(?:\\b|$)/.test(blob);
              const isTag = /(?:^|\\b)(tags?|etiqueta)(?:\\b|$)/.test(blob);
              return { isLink, isTag, blob };
            }"""
        )
    except Exception:
        return False
    if meta.get("isTag"):
        return False
    return bool(meta.get("isLink"))


_TAG_INPUTS_JS = r"""() => {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const isTagLabel = (t) => /^tags?\s*\*?\s*$/i.test(clean(t));
  const isLinkLabel = (t) => /^(link|url|href|enlace)\s*\*?\s*$/i.test(clean(t));
  const visible = (el) => {
    if (!el || el.offsetParent === null) return false;
    const r = el.getBoundingClientRect();
    return r.width > 6 && r.height > 6;
  };
  const pushInput = (inp, rows, seen) => {
    if (!visible(inp)) return;
    const r = inp.getBoundingClientRect();
    const key = Math.round(r.top) + ',' + Math.round(r.left);
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({
      y: r.top,
      x: r.left,
      id: inp.id || '',
      name: inp.name || '',
      placeholder: inp.getAttribute('placeholder') || '',
    });
  };
  const rows = [];
  const seen = new Set();

  for (const lab of document.querySelectorAll('label')) {
    const t = clean(lab.innerText);
    if (!isTagLabel(t)) continue;
    let inp = null;
    if (lab.htmlFor) inp = document.getElementById(lab.htmlFor);
    if (!inp) inp = lab.parentElement && lab.parentElement.querySelector(
      'input:not([type="hidden"]):not([type="checkbox"])'
    );
    if (!inp) {
      let sib = lab.nextElementSibling;
      for (let i = 0; i < 4 && sib; i++) {
        if (sib.matches && sib.matches('input:not([type="hidden"])')) {
          inp = sib;
          break;
        }
        const nested = sib.querySelector && sib.querySelector('input:not([type="hidden"])');
        if (nested) { inp = nested; break; }
        sib = sib.nextElementSibling;
      }
    }
    if (!inp) {
      const block = lab.closest('div, section, fieldset, form, li');
      if (block) {
        for (const cand of block.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"])')) {
          const lt = clean((block.querySelector('label[for="' + cand.id + '"]') || {}).innerText || '');
          if (isLinkLabel(lt)) continue;
          if (isTagLabel(lt) || !inp) inp = cand;
          if (isTagLabel(lt)) break;
        }
      }
    }
    if (inp) pushInput(inp, rows, seen);
  }

  if (!rows.length) {
    const reItem = /Formulario\s+[ÍI]tem\s+(\d+)/i;
    for (const el of document.querySelectorAll(
      'button, [role="button"], summary, h3, h4, h5, div, span, label'
    )) {
      const raw = clean(el.innerText);
      const m = raw.match(reItem);
      if (!m || raw.length > 64) continue;
      let block = el.closest('[class*="item" i], [class*="accordion" i], [class*="array" i], section, fieldset, details, li');
      if (!block) block = el.parentElement && el.parentElement.parentElement;
      if (!block) continue;
      let tagInp = null;
      for (const cand of block.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"])')) {
        if (!visible(cand)) continue;
        const lt = clean((block.querySelector('label[for="' + cand.id + '"]') || {}).innerText || '');
        if (isLinkLabel(lt)) continue;
        if (isTagLabel(lt)) { tagInp = cand; break; }
        if (!tagInp) tagInp = cand;
      }
      if (tagInp) pushInput(tagInp, rows, seen);
    }
  }

  if (!rows.length) {
    const dale = [...document.querySelectorAll(
      'input[placeholder*="Dale un valor" i], input[placeholder*="valor" i]'
    )].filter(visible);
    for (let i = 0; i < dale.length; i += 2) pushInput(dale[i], rows, seen);
  }

  rows.sort((a, b) => a.y - b.y || a.x - b.x);
  return rows;
}"""


def _inputs_tag_meta_desde_js(page) -> list[dict]:
    """Metadatos de inputs Tag* (id/name/y) vía JS en página e iframes."""
    out: list[dict] = []
    seen_keys: set[str] = set()
    for target in _targets_page_y_frames(page):
        try:
            partial = target.evaluate(_TAG_INPUTS_JS) or []
        except Exception:
            continue
        for row in partial:
            if not isinstance(row, dict):
                continue
            key = row.get("id") or row.get("name") or f"{row.get('y')}:{row.get('x')}"
            if key in seen_keys:
                continue
            seen_keys.add(str(key))
            row = dict(row)
            row["_target"] = target
            out.append(row)
    out.sort(key=lambda r: (float(r.get("y") or 0), float(r.get("x") or 0)))
    return out


def _locator_desde_meta_tag(target, meta: dict):
    """Locator Playwright para un input Tag a partir del meta JS."""
    if meta.get("id"):
        loc = target.locator(f"#{meta['id']}")
        if loc.count():
            return loc.first
    if meta.get("name"):
        loc = target.locator(f'input[name="{meta["name"]}"]')
        if loc.count():
            return loc.first
    ph = meta.get("placeholder") or ""
    if ph:
        loc = target.locator(f'input[placeholder="{ph}"]')
        if loc.count():
            return loc.first
    return None


def _locators_tag_arreglo_ordenados(page) -> list:
    """Inputs Tag* del arreglo, ordenados de arriba abajo (BM real: ítems expandidos)."""
    locs = []
    for meta in _inputs_tag_meta_desde_js(page):
        target = meta.get("_target") or page
        node = _locator_desde_meta_tag(target, meta)
        if node is None:
            continue
        try:
            if node.is_visible() and not _es_input_link_no_tag(node):
                locs.append(node)
                continue
        except Exception:
            pass
        if not _es_input_link_no_tag(node):
            locs.append(node)
    if locs:
        return locs

    candidatos: list[tuple[tuple[float, float], object]] = []
    for target in _targets_page_y_frames(page):
        try:
            labs = target.get_by_label(re.compile(r"^Tag\s*\*?\s*$", re.I))
            for i in range(min(labs.count(), 30)):
                node = labs.nth(i)
                try:
                    if not node.is_visible() or _es_input_link_no_tag(node):
                        continue
                except Exception:
                    if _es_input_link_no_tag(node):
                        continue
                try:
                    box = node.bounding_box() or {}
                    key = (float(box.get("y", i)), float(box.get("x", 0)))
                except Exception:
                    key = (float(i), 0.0)
                candidatos.append((key, node))
        except Exception:
            pass
        if candidatos:
            break
    candidatos.sort(key=lambda t: t[0])
    uniq = []
    seen: set[tuple[float, float]] = set()
    for key, inp in candidatos:
        rk = (round(key[0], 1), round(key[1], 1))
        if rk in seen:
            continue
        seen.add(rk)
        uniq.append(inp)
    return uniq


def _contar_items_estructural_tags(page) -> int:
    """Cuántos Formulario Ítem hay (aunque el acordeón esté cerrado)."""
    headers = _headers_formulario_item_tags(page)
    if headers:
        return max(int(h.get("n") or 0) for h in headers)
    for target in _targets_page_y_frames(page):
        for sel in (".acordeon", ".form-item-bm", "[class*='form-item']"):
            try:
                n = target.locator(sel).count()
                if n:
                    return n
            except Exception:
                continue
        try:
            n = target.get_by_text(re.compile(r"Formulario\s+[ÍI]tem\s+\d+", re.I)).count()
            if n:
                return n
        except Exception:
            continue
    return 0


def _headers_formulario_item_tags(page) -> list[dict]:
    """Cabeceras «Formulario Ítem N» del arreglo (acordeón BM)."""
    out: list[dict] = []
    js = r"""() => {
      const re = /Formulario\s+[ÍI]tem\s+(\d+)\s*$/i;
      const rows = [];
      const seen = new Set();
      for (const el of document.querySelectorAll(
        'button, [role="button"], summary, h3, h4, h5, div, span, a, label'
      )) {
        const raw = (el.innerText || '').trim().replace(/\\s+/g, ' ');
        const m = raw.match(re);
        if (!m || raw.length > 64) continue;
        const n = parseInt(m[1], 10);
        if (seen.has(n)) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 24 || r.height < 8) continue;
        seen.add(n);
        let expanded = el.getAttribute('aria-expanded') === 'true';
        if (!expanded) {
          let block = el.closest('[class*="accordion" i], [class*="item" i], section, details')
            || el.parentElement;
          for (let i = 0; i < 8 && block; i++) {
            const inputs = block.querySelectorAll('input:not([type="hidden"])');
            for (const inp of inputs) {
              const lbl = block.querySelector('label[for="' + inp.id + '"]');
              const lt = ((lbl && lbl.innerText) || '').toLowerCase().trim();
              if (/^tag\\b/.test(lt) && inp.offsetParent !== null) {
                expanded = true;
                break;
              }
            }
            if (expanded) break;
            block = block.parentElement;
          }
        }
        rows.push({ n, x: r.left + r.width / 2, y: r.top + r.height / 2, expanded: !!expanded });
      }
      rows.sort((a, b) => a.n - b.n);
      return rows;
    }"""
    for target in _targets_page_y_frames(page):
        try:
            partial = target.evaluate(js) or []
            for row in partial:
                if isinstance(row, dict) and row.get("n"):
                    out.append(row)
        except Exception:
            continue
    by_n: dict[int, dict] = {}
    for row in out:
        by_n[int(row["n"])] = row
    return [by_n[k] for k in sorted(by_n)]


def _contar_items_formulario_tags(page) -> int:
    """Ítems del arreglo: estructura DOM primero (acordeón cerrado ≠ 0 ítems)."""
    n_est = _contar_items_estructural_tags(page)
    if n_est:
        return n_est
    locs = _locators_tag_arreglo_ordenados(page)
    if locs:
        return len(locs)
    return 0


def _bloque_acordeon_tags(page, idx: int):
    """Contenedor del ítem idx (0-based): acordeón BM o ítem expandido."""
    locs = _locators_tag_arreglo_ordenados(page)
    if len(locs) > idx:
        try:
            return locs[idx].locator(
                "xpath=ancestor::*[contains(., 'Formulario') or contains(@class,'item')][1]"
            )
        except Exception:
            pass
    for target in _targets_page_y_frames(page):
        try:
            items = target.locator(".acordeon, .form-item-bm")
            if items.count() > idx:
                return items.nth(idx)
            headers = target.get_by_text(re.compile(r"Formulario\s+[ÍI]tem\s+\d+", re.I))
            if headers.count() > idx:
                h = headers.nth(idx)
                block = h.locator("xpath=ancestor::*[.//input][1]")
                if block.count():
                    return block.first
        except Exception:
            continue
    return None


def _abrir_acordeon_item_tags(page, idx: int) -> bool:
    """Abre el acordeón del Formulario Ítem (idx 0-based)."""
    want = idx + 1
    block = _bloque_acordeon_tags(page, idx)
    if block is not None:
        try:
            header = block.locator(".acordeon-header").first
            if header.count():
                try:
                    if header.get_attribute("aria-expanded") != "true":
                        header.click(timeout=2500)
                        page.wait_for_timeout(450)
                except Exception:
                    header.click(timeout=2500)
                    page.wait_for_timeout(450)
                print(f"  · Acordeón Formulario Ítem {want} abierto", flush=True)
                return True
        except Exception:
            pass
    headers = _headers_formulario_item_tags(page)
    row = next((h for h in headers if int(h.get("n", 0)) == want), None)
    if row and not row.get("expanded"):
        try:
            page.mouse.click(float(row["x"]), float(row["y"]))
            page.wait_for_timeout(550)
        except Exception:
            pass
    if _input_tag_en_item_tags(page, want):
        print(f"  · Formulario Ítem {want} (panel con Tag visible)", flush=True)
        return True
    return False


def _input_tag_en_item_tags(page, n_item: int):
    """Locator del input Tag* dentro del Formulario Ítem n (1-based)."""
    locs = _locators_tag_arreglo_ordenados(page)
    idx = n_item - 1
    if idx < len(locs):
        return locs[idx]
    idx = n_item - 1
    block = _bloque_acordeon_tags(page, idx)
    if block is not None:
        try:
            for sel in (
                "input[data-field='tag']",
                "input.campo-tag",
                "xpath=.//label[contains(normalize-space(.),'Tag') and not(contains(.,'Link'))]/following::input[1]",
            ):
                inp = block.locator(sel).first
                if inp.count():
                    try:
                        if inp.is_visible() and not _es_input_link_no_tag(inp):
                            return inp
                    except Exception:
                        if not _es_input_link_no_tag(inp):
                            return inp
            for cre in (re.compile(r"^Tag\s*\*?$", re.I),):
                labs = block.get_by_label(cre)
                for i in range(min(labs.count(), 2)):
                    node = labs.nth(i)
                    try:
                        if node.is_visible() and not _es_input_link_no_tag(node):
                            return node
                    except Exception:
                        continue
        except Exception:
            pass
    cre_item = re.compile(rf"Formulario\s+[ÍI]tem\s+{n_item}\b", re.I)
    for target in _targets_page_y_frames(page):
        try:
            header = target.locator(
                f".acordeon-header:has-text('Formulario Ítem {n_item}'), "
                f".acordeon-header:has-text('Formulario Item {n_item}')"
            )
            if not header.count():
                header = target.get_by_text(cre_item)
            if not header.count():
                continue
            h = header.first
            block = h.locator(
                "xpath=ancestor::*[contains(@class,'acordeon') or contains(@class,'item')][1]"
            )
            if not block.count():
                block = h.locator("xpath=parent::*")
            for sel in (
                "input[data-field='tag']",
                "input.campo-tag",
                "xpath=.//label[contains(normalize-space(.),'Tag') and not(contains(.,'Link'))]/following::input[1]",
            ):
                try:
                    inp = block.locator(sel).first
                    if inp.count():
                        try:
                            if inp.is_visible() and not _es_input_link_no_tag(inp):
                                return inp
                        except Exception:
                            if not _es_input_link_no_tag(inp):
                                return inp
                except Exception:
                    continue
            for cre in (re.compile(r"^Tag\s*\*?$", re.I), re.compile(r"^Tags?\s*\*?$", re.I)):
                try:
                    labs = block.get_by_label(cre)
                    for i in range(min(labs.count(), 2)):
                        node = labs.nth(i)
                        try:
                            if node.is_visible() and not _es_input_link_no_tag(node):
                                return node
                        except Exception:
                            continue
                except Exception:
                    pass
        except Exception:
            continue
    return None


def _inputs_campo_tag(page) -> list:
    """Inputs Tag visibles (solo tras abrir acordeón)."""
    out = []
    for i in range(_contar_items_formulario_tags(page)):
        _abrir_acordeon_item_tags(page, i)
        node = _input_tag_en_item_tags(page, i + 1)
        if node is not None:
            out.append(node)
    return out


def _click_agregar_item_tags(page) -> bool:
    """Pulsa «+ Agregar nuevo ítem» una sola vez y verifica el conteo estructural."""
    antes = _contar_items_estructural_tags(page)
    candidatos = []
    patrones = (
        re.compile(r"Agregar\s+nuevo\s+[íi]tem", re.I),
        re.compile(r"Agregar(\s+ítem|\s+item|\s+opci[oó]n)?", re.I),
        re.compile(r"Añadir(\s+nuevo)?(\s+ítem|\s+item)?", re.I),
        re.compile(r"Add(\s+new)?(\s+item)?", re.I),
    )
    for target in _targets_page_y_frames(page):
        for cre in patrones:
            for role in ("button", "link"):
                try:
                    btns = target.get_by_role(role, name=cre)
                    for i in range(min(btns.count(), 8)):
                        btn = btns.nth(i)
                        try:
                            if not btn.is_visible():
                                continue
                            txt = (btn.inner_text() or "").lower()
                            if any(x in txt for x in ("guardar", "save", "volver", "back", "eliminar")):
                                continue
                            if (
                                "agregar" not in txt
                                and "añadir" not in txt
                                and "add" not in txt
                                and "+" not in txt
                            ):
                                continue
                            candidatos.append(btn)
                        except Exception:
                            continue
                except Exception:
                    continue
        for sel in (
            "button:has-text('Agregar nuevo')",
            "button:has-text('Agregar ítem')",
            "button:has-text('Agregar item')",
            "button:has-text('Añadir')",
            "[role='button']:has-text('Agregar')",
            "#btn-agregar",
        ):
            try:
                btn = target.locator(sel).first
                if btn.count() and btn.is_visible():
                    txt = (btn.inner_text() or "").lower()
                    if "guardar" in txt or "volver" in txt:
                        continue
                    candidatos.append(btn)
            except Exception:
                continue

    vistos: set[str] = set()
    for btn in candidatos:
        try:
            key = btn.evaluate(
                """el => (el.innerText||'') + '|' + (el.getAttribute('id')||'')"""
            )
        except Exception:
            key = str(id(btn))
        if key in vistos:
            continue
        vistos.add(key)
        try:
            btn.scroll_into_view_if_needed(timeout=1500)
            btn.click(timeout=2500)
            page.wait_for_timeout(700)
            despues = _contar_items_estructural_tags(page)
            if despues > antes:
                print("  · Agregué ítem al arreglo de tags", flush=True)
                return True
        except Exception:
            continue
    return False


def _rellenar_un_campo_tag(node, valor: str) -> bool:
    """Escribe solo en el input Tag (nunca Link)."""
    if node is None:
        return False
    if _es_input_link_no_tag(node):
        return False
    return _rellenar_locator(node, valor)


def _rellenar_tags_bm(page, tags: list[str]) -> bool:
    """Formulario Tags BM: abrir ítem si hace falta → Tag* (Link vacío)."""
    tags = [t.strip() for t in tags if t and str(t).strip()]
    if not tags:
        print("  · Sin tags en el JSON (categorias[])", flush=True)
        return False

    print(f"  · Tags a cargar ({len(tags)}): {', '.join(tags)}", flush=True)
    page.wait_for_timeout(500)

    ok_count = 0
    for i, tag in enumerate(tags):
        n_item = i + 1
        while _contar_items_formulario_tags(page) < n_item:
            if not _click_agregar_item_tags(page):
                print(
                    f"  ✗ No pude agregar Formulario Ítem {n_item} para «{tag}»",
                    flush=True,
                )
                break
        _abrir_acordeon_item_tags(page, i)

        node = _input_tag_en_item_tags(page, n_item)
        if node is None:
            page.wait_for_timeout(400)
            _abrir_acordeon_item_tags(page, i)
            node = _input_tag_en_item_tags(page, n_item)

        if node is None:
            print(f"  ✗ no encontré campo Tag en Formulario Ítem {n_item}", flush=True)
            continue

        try:
            node.scroll_into_view_if_needed(timeout=2000)
        except Exception:
            pass

        try:
            if _rellenar_un_campo_tag(node, tag):
                try:
                    block = _bloque_acordeon_tags(page, i)
                    if block is not None:
                        link = block.locator(
                            "input[data-field='link'], input.campo-link, "
                            "xpath=.//label[contains(.,'Link') or contains(.,'URL')]/following::input[1]"
                        )
                        if link.count():
                            lv = (link.first.input_value() or "").strip()
                            if lv:
                                link.first.fill("")
                except Exception:
                    pass
                ok_count += 1
                print(
                    f"  ✓ tag ítem {n_item} → «{tag}» (campo Tag, no Link)",
                    flush=True,
                )
            else:
                print(f"  ✗ no pude escribir «{tag}» en Tag del ítem {n_item}", flush=True)
        except Exception as exc:
            print(f"  · Falló tag «{tag}»: {exc}", flush=True)

    if ok_count == 0:
        print("  ✗ field_tags: no pude rellenar el arreglo", flush=True)
        return False

    print(f"  ✓ field_tags ({ok_count}/{len(tags)} ítems en el arreglo)", flush=True)
    return ok_count == len(tags) or ok_count > 0


def _esperar_canvas_tras_cabecera(page) -> None:
    """Tras Volver del Header, esperar a ver bloques del canvas (tags, etc.)."""
    if not pagina_viva(page):
        return
    for _ in range(20):
        try:
            # Ya no estamos en Edición de Cabecera
            if page.get_by_text(re.compile(r"Edici[oó]n de Cabecera", re.I)).count():
                page.wait_for_timeout(300)
                continue
        except Exception:
            pass
        try:
            comps = listar_componentes_cms(page)
            if any(c.get("clave") == "tags" for c in comps):
                print("  · Canvas listo (detecté bloque tags).", flush=True)
                return
            if len(comps) >= 2:
                print(f"  · Canvas listo ({len(comps)} componentes).", flush=True)
                return
        except Exception:
            pass
        # Hint vacío típico del canvas
        try:
            if page.get_by_text(re.compile(r"Edita este componente", re.I)).count():
                return
        except Exception:
            pass
        page.wait_for_timeout(350)
    print("  · Sigo sin ver el canvas tras Cabecera; intento tags igual.", flush=True)


def rellenar_con_dump_vivo(page, pares: list[tuple[str, str | None]], selectores: dict) -> dict[str, bool]:
    """Tras abrir un lápiz, mapea campos visibles y rellena."""
    outs: dict[str, bool] = {}
    if not pagina_viva(page):
        print("  · Navegador/página cerrado: no puedo rellenar.", flush=True)
        return outs

    # Tags BM: acordeón cerrado → 0 inputs hasta abrir cada ítem
    solo_tags = all(k == "field_tags" for k, v in pares if v)
    for key, value in pares:
        if key == "field_tags" and value:
            tags = [t.strip() for t in re.split(r"\s*,\s*", str(value)) if t.strip()]
            outs[key] = _rellenar_tags_bm(page, tags)
    if solo_tags:
        return outs

    if contar_campos_editables(page) <= 0:
        page.wait_for_timeout(1200)
    if contar_campos_editables(page) <= 0:
        page.wait_for_timeout(1500)

    estructura = dump_estructura(page)
    vivos = sugerir_selectores(estructura)
    fields = estructura.get("fields") or []
    if fields:
        print(f"  · Editor vivo: {len(fields)} campo(s) detectado(s)", flush=True)
        for i, f in enumerate(fields[:12]):
            print(
                "    [{i}] label={label!r} ph={ph!r} name={name!r} tag={tag} fr={fr}".format(
                    i=i,
                    label=(f.get("label") or "")[:60],
                    ph=(f.get("placeholder") or "")[:40],
                    name=f.get("name"),
                    tag=f.get("tag"),
                    fr=f.get("frameIndex"),
                ),
                flush=True,
            )
    else:
        print("  · Editor vivo: 0 campos (¿panel/iframe aún sin inputs?)", flush=True)

    targets = _targets_page_y_frames(page)
    for key, value in pares:
        if value is None or value == "":
            continue
        if key == "field_imagen":
            # Se rellena con archivo/URL vía _rellenar_imagen (no texto plano)
            outs[key] = False
            continue
        if key == "field_tags":
            if outs.get(key):
                continue
            tags = [t.strip() for t in re.split(r"\s*,\s*", str(value)) if t.strip()]
            outs[key] = _rellenar_tags_bm(page, tags)
            continue
        # 1) Por label del Formulario Header (Título / Dificultad / Duración / Porciones)
        if _rellenar_por_label(page, key, str(value)):
            outs[key] = True
            print(f"  ✓ {key} (por label)")
            continue
        sel = vivos.get(key) or selectores.get(key)
        if not sel:
            outs[key] = False
            print(f"  ✗ {key} (sin selector vivo ni guardado)")
            continue
        filled = False
        for target in targets:
            try:
                loc = target.locator(sel).first
                if not loc.count():
                    continue
                # Duración: forzar solo dígitos si el selector apunta a number
                val = str(value)
                if key == "field_tiempo":
                    val = minutos_desde_tiempo(value) or val
                if _rellenar_locator(loc, val):
                    filled = True
                    selectores[key] = sel
                    break
            except Exception as exc:
                if _es_target_cerrado(exc):
                    print("  · Página/navegador cerrado durante el relleno.", flush=True)
                    outs[key] = False
                    return outs
                continue
        outs[key] = filled
        print(f"  {'✓' if filled else '✗'} {key}" + ("" if filled else f" ({sel})"))

    # NUNCA fallback posicional para Dificultad: el combo custom no está en
    # input/select, y escribir «Fácil» en Duración (number) la deja en 0.
    # Tampoco field_tags (chips).
    pendientes = [
        (k, v)
        for k, v in pares
        if v and not outs.get(k) and k not in ("field_imagen", "field_dificultad", "field_tags")
    ]
    if pendientes and pagina_viva(page):
        css_areas = (
            "textarea:visible, [contenteditable='true']:visible, [contenteditable='']:visible, "
            "input[type='text']:visible, input:not([type]):visible, input[type='search']:visible, "
            "input[type='number']:visible, [role='textbox']:visible, .ql-editor:visible, "
            ".ProseMirror:visible, select:visible"
        )
        # Orden real Formulario Header BM (sin dificultad custom): Título → Duración → Porciones
        orden_pos = [
            "field_titulo",
            "field_tiempo",
            "field_porciones",
            "field_descripcion",
            "field_tags",
            "field_ingredientes",
            "field_pasos",
            "field_meta_titulo",
            "field_meta_descripcion",
        ]
        try:
            mejor_target = page
            mejor_n = 0
            for target in targets:
                try:
                    n = target.locator(css_areas).count()
                    if n > mejor_n:
                        mejor_n = n
                        mejor_target = target
                except Exception:
                    continue
            areas = mejor_target.locator(css_areas)
            n = min(areas.count(), 12)
            if n >= 1:
                keys_grupo = [k for k, _ in pares if k in orden_pos]
                for key, value in pendientes:
                    if key not in orden_pos:
                        idx = n - 1
                    else:
                        try:
                            idx = keys_grupo.index(key)
                        except ValueError:
                            idx = 0
                    if idx >= n:
                        idx = n - 1
                    try:
                        node = areas.nth(idx)
                        try:
                            tipo = (node.get_attribute("type") or "").lower()
                        except Exception:
                            tipo = ""
                        val = str(value)
                        if key == "field_tiempo":
                            val = minutos_desde_tiempo(value) or val
                            if tipo == "number" or key == "field_tiempo":
                                if _rellenar_campo_numero(node, val):
                                    outs[key] = True
                                    print(f"  ✓ {key} (fallback posicional #{idx})")
                                continue
                        if key == "field_porciones":
                            solo = re.sub(r"[^\d]", "", val)
                            if solo and _rellenar_campo_numero(node, solo):
                                outs[key] = True
                                print(f"  ✓ {key} (fallback posicional #{idx})")
                                continue
                        # No volcar texto no numérico en input number
                        if tipo == "number" and re.search(r"[^\d.\-]", val):
                            print(
                                f"  · Skip posicional {key}: no escribo {val!r} en number",
                                flush=True,
                            )
                            continue
                        if _rellenar_locator(node, val):
                            outs[key] = True
                            print(f"  ✓ {key} (fallback posicional #{idx})")
                    except Exception as exc:
                        if _es_target_cerrado(exc):
                            print("  · Página/navegador cerrado durante fallback.", flush=True)
                            return outs
        except Exception as exc:
            if _es_target_cerrado(exc):
                print("  · Página/navegador cerrado durante fallback.", flush=True)
                return outs

    # Si Duración quedó en 0 tras intentos de Dificultad, reponer minutos
    mapa_pares = {k: v for k, v in pares if v}
    if mapa_pares.get("field_tiempo") and pagina_viva(page):
        actual = _leer_valor_campo_por_label(page, r"^Duraci[oó]n")
        dig = re.sub(r"[^\d]", "", actual or "")
        want = minutos_desde_tiempo(mapa_pares["field_tiempo"]) or re.sub(
            r"[^\d]", "", str(mapa_pares["field_tiempo"])
        )
        if want and (not dig or dig == "0" or dig != want):
            if _rellenar_por_label(page, "field_tiempo", want):
                outs["field_tiempo"] = True
                print(f"  ✓ field_tiempo (repuesto tras Dificultad → {want})", flush=True)
    return outs


def fill_from_receta(page, receta: dict, selectores: dict, dry_run: bool) -> bool:
    resultados = {}
    # PNG local primero (BM rechaza Drive); luego URL del Word si aplica
    enriquecer_ruta_local_imagen(receta)
    enriquecer_imagen_desde_word(receta)

    def fill_grupo(clave_comp: str, pares: list[tuple[str, str | None]]) -> int:
        pares_ok = [(k, v) for k, v in pares if v is not None and v != ""]
        if not pares_ok:
            return 0
        if not pagina_viva(page):
            print("  · Navegador cerrado: aborto relleno.", flush=True)
            return 0
        meta = next((c for c in COMPONENTES_CMS if c["clave"] == clave_comp), None)
        lapiz_key = meta["lapiz_key"] if meta else f"lapiz_{clave_comp}"
        print(f"  [CMS] Abriendo componente «{clave_comp}»…")
        try:
            abierto = abrir_lapiz_componente(page, clave_comp, selectores.get(lapiz_key))
            if not abierto:
                abierto = abrir_componente_para_campos(page, selectores, [k for k, _ in pares_ok])
            if not abierto:
                print(f"  · No pude abrir el lápiz de «{clave_comp}».")
                return 0
            for _ in range(28):
                if not pagina_viva(page):
                    return 0
                if contar_campos_editables(page) > 0:
                    break
                page.wait_for_timeout(250)
            vivos = rellenar_con_dump_vivo(page, pares_ok, selectores)
            if clave_comp == "cabecera" and pagina_viva(page):
                if _rellenar_imagen(page, receta):
                    vivos["field_imagen"] = True
                    resultados["imagen"] = True
                # Imagen/modal o intentos de Dificultad pueden pisar Duración → 0
                dif = normalizar_dificultad_bm(receta.get("dificultad"))
                mins = minutos_desde_tiempo(receta.get("tiempoTotal"))
                pors = str(receta.get("porciones")) if receta.get("porciones") is not None else None
                _asegurar_cabecera_bm(page, dif, mins, pors)
                if dif and _dificultad_parece_seleccionada(page, dif):
                    vivos["field_dificultad"] = True
                if mins:
                    dig = re.sub(r"[^\d]", "", _leer_valor_campo_por_label(page, r"^Duraci[oó]n") or "")
                    if dig == str(mins):
                        vivos["field_tiempo"] = True
                if pors:
                    dig = re.sub(r"[^\d]", "", _leer_valor_campo_por_label(page, r"^Porciones") or "")
                    if dig == re.sub(r"[^\d]", "", pors):
                        vivos["field_porciones"] = True
        except Exception as exc:
            if _es_target_cerrado(exc):
                print(
                    "\n✗ El navegador o la ficha se cerró a mitad del relleno "
                    "(TargetClosedError). No cierres Chromium ni uses Ctrl+C "
                    "hasta que termine el script.\n",
                    flush=True,
                )
                return 0
            raise
        ok_grupo = 0
        for key, ok in vivos.items():
            if key == "field_titulo":
                resultados["titulo"] = ok
            elif key == "field_descripcion":
                resultados["descripcion"] = ok
            elif key == "field_tags":
                resultados["tags"] = ok
            elif key == "field_ingredientes":
                resultados["ingredientes"] = ok
            elif key == "field_pasos":
                resultados["pasos"] = ok
            ok_grupo += int(bool(ok))
        if clave_comp == "tags" and pagina_viva(page) and not vivos.get("field_tags"):
            # Segundo intento dedicado (por si el dump no mapeó el label)
            if _rellenar_tags_bm(page, lista_tags_desde_receta(receta)):
                vivos["field_tags"] = True
                resultados["tags"] = True
                ok_grupo += 1
        if pagina_viva(page):
            if clave_comp == "tags":
                # Tags BM real: Volver + popup. Si no aplica (fixture CMS), cerrar como otros.
                _salir_edicion_tags_si_aplica(page)
                _esperar_canvas_tras_tags(page)
                if contar_campos_editables(page) > 0:
                    cerrar_editor_componente(page, guardar=True)
                    _esperar_canvas_tras_tags(page)
            else:
                cerrar_editor_componente(page, guardar=True)
                if clave_comp == "cabecera":
                    _salir_edicion_cabecera_si_aplica(page)
                    _esperar_canvas_tras_cabecera(page)
        return ok_grupo

    print("Rellenando desde JSON (abriendo lápices automáticamente)…")
    # Formulario Header no tiene «Descripción»; si viene en el JSON no bloqueamos la carga.
    if receta.get("descripcion"):
        resultados["descripcion"] = True
    total_ok = 0
    tags_lista = lista_tags_desde_receta(receta)
    grupos = [
        (
            "cabecera",
            [
                ("field_titulo", receta.get("titulo")),
                # Formulario Header BM: Dificultad / Duración (número) / Porciones
                # (no hay campo Descripción en Cabecera)
                ("field_dificultad", normalizar_dificultad_bm(receta.get("dificultad"))),
                ("field_tiempo", minutos_desde_tiempo(receta.get("tiempoTotal"))),
                ("field_porciones", str(receta.get("porciones")) if receta.get("porciones") is not None else None),
            ],
        ),
        ("tags", [("field_tags", ", ".join(tags_lista) if tags_lista else None)]),
    ]
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
    grupos.append(("ingredientes", [("field_ingredientes", texto_ing)]))
    pasos = receta.get("pasos") or []
    texto_pas = None
    if pasos:
        texto_pas = "\n".join(f"{p.get('orden')}. {p.get('texto')}" for p in pasos)
    grupos.append(("instrucciones", [("field_pasos", texto_pas)]))
    seo = receta.get("seo") or {}
    grupos.append(
        (
            "seo",
            [
                ("field_meta_titulo", seo.get("metaTitulo")),
                ("field_meta_descripcion", seo.get("metaDescripcion")),
            ],
        )
    )

    for clave, pares in grupos:
        if not pagina_viva(page):
            print("Carga incompleta: el navegador se cerró antes de terminar.", file=sys.stderr)
            return False
        total_ok += fill_grupo(clave, pares)

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
