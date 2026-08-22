import contextlib
import importlib.util
import io
import json
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts/explorar-bm-cencosud.py"


def cargar_modulo():
    spec = importlib.util.spec_from_file_location("explorar_bm_cencosud", SCRIPT_PATH)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


class LocatorFalso:
    def __init__(self, runtime, selector):
        self.runtime = runtime
        self.selector = selector

    @property
    def first(self):
        return self

    def count(self):
        if self.selector in self.runtime.selectores_ausentes:
            return 0
        if self.selector.startswith("#") or self.selector.startswith("text="):
            return 1
        return 0

    def evaluate(self, _script):
        return "input"

    def is_visible(self):
        return True

    def nth(self, _i):
        return self

    def select_option(self, **_kwargs):
        return None

    def fill(self, _value):
        return None

    def click(self, **_kwargs):
        self.runtime.clicks.append(self.selector)


class PageFalsa:
    def __init__(self, runtime):
        self.runtime = runtime

    def locator(self, selector):
        return LocatorFalso(self.runtime, selector)

    def evaluate(self, script, *_args):
        texto = str(script)
        if "[aria-expanded]" in texto:
            return 0
        if _args or "aliasesFlat" in texto or "wanted" in texto:
            return []
        if "querySelectorAll" in texto and "filter" in texto:
            return 0
        return {"fields": [], "buttons": [], "linksReceta": [], "nav": []}

    def goto(self, *_args, **_kwargs):
        return None

    def screenshot(self, **_kwargs):
        return None

    def wait_for_timeout(self, _milliseconds):
        return None


class ContextoFalso:
    def __init__(self, runtime):
        self.runtime = runtime

    def new_page(self):
        return PageFalsa(self.runtime)

    def storage_state(self, **_kwargs):
        return None


class BrowserFalso:
    def __init__(self, runtime):
        self.runtime = runtime

    def new_context(self, **_kwargs):
        return ContextoFalso(self.runtime)

    def close(self):
        return None


class ChromiumFalso:
    def __init__(self, runtime):
        self.runtime = runtime

    def launch(self, **_kwargs):
        return BrowserFalso(self.runtime)


class PlaywrightFalso:
    def __init__(self, runtime):
        self.chromium = ChromiumFalso(runtime)


class GestorPlaywrightFalso:
    def __init__(self, runtime):
        self.runtime = runtime

    def __enter__(self):
        return PlaywrightFalso(self.runtime)

    def __exit__(self, *_args):
        return False


class RuntimeFalso:
    def __init__(self, selectores_ausentes=()):
        self.selectores_ausentes = set(selectores_ausentes)
        self.clicks = []

    def modulos(self):
        paquete = types.ModuleType("playwright")
        paquete.__path__ = []
        sync_api = types.ModuleType("playwright.sync_api")
        sync_api.sync_playwright = lambda: GestorPlaywrightFalso(self)
        return {"playwright": paquete, "playwright.sync_api": sync_api}


class ExplorarBmTests(unittest.TestCase):
    def setUp(self):
        self.modulo = cargar_modulo()
        self.receta_valida = {
            "titulo": "Receta segura",
            "descripcion": "Descripción",
            "ingredientes": [{"nombre": "Ingrediente"}],
            "pasos": [{"orden": 1, "texto": "Preparar"}],
            "estado": "listo-para-cargar",
            "camposFaltantes": [],
        }
        self.selectores = {
            "field_titulo": "#titulo",
            "field_descripcion": "#descripcion",
            "field_ingredientes": "#ingredientes",
            "field_pasos": "#pasos",
            "btn_publicar": "#publicar",
        }
        self.estructura_meta_primero = {
            "fields": [
                {
                    "label": "Meta título",
                    "id": "meta-title",
                    "selectorSugerido": "#meta-title",
                },
                {
                    "label": "Meta descripción",
                    "id": "meta-desc",
                    "selectorSugerido": "#meta-desc",
                },
                {
                    "label": "Título",
                    "id": "titulo",
                    "selectorSugerido": "#titulo",
                },
                {
                    "label": "Descripción",
                    "id": "desc",
                    "selectorSugerido": "#desc",
                },
            ],
            "buttons": [
                {
                    "text": "Guardar y publicar",
                    "selectorSugerido": "#guardar-publicar",
                }
            ],
        }

    def test_sugerir_selectores_separa_meta_editoriales_aunque_meta_aparezca_primero(self):
        mapa = self.modulo.sugerir_selectores(self.estructura_meta_primero)

        selectores_campos = {
            mapa["field_titulo"],
            mapa["field_descripcion"],
            mapa["field_meta_titulo"],
            mapa["field_meta_descripcion"],
        }
        self.assertEqual(
            {
                "field_titulo": mapa["field_titulo"],
                "field_descripcion": mapa["field_descripcion"],
                "field_meta_titulo": mapa["field_meta_titulo"],
                "field_meta_descripcion": mapa["field_meta_descripcion"],
            },
            {
                "field_titulo": "#titulo",
                "field_descripcion": "#desc",
                "field_meta_titulo": "#meta-title",
                "field_meta_descripcion": "#meta-desc",
            },
        )
        self.assertEqual(len(selectores_campos), 4)

    def test_sugerir_selectores_usa_label_si_no_hay_id_name(self):
        estructura = {
            "fields": [
                {
                    "tag": "input",
                    "label": "Título de la receta",
                    "placeholder": None,
                    "ariaLabel": None,
                    "name": None,
                    "id": None,
                    "selectorSugerido": None,
                },
                {
                    "tag": "textarea",
                    "label": "Descripción",
                    "placeholder": None,
                    "ariaLabel": None,
                    "name": None,
                    "id": None,
                    "selectorSugerido": None,
                },
            ],
            "buttons": [
                {"text": "Guardar borrador", "selectorSugerido": None, "id": None},
                {"text": "Publicar", "selectorSugerido": None, "id": None},
            ],
            "linksReceta": [],
            "nav": [],
        }
        mapa = self.modulo.sugerir_selectores(estructura)
        self.assertIn("xpath=", mapa["field_titulo"] or "")
        self.assertIn("Título", mapa["field_titulo"] or "")
        self.assertIn("xpath=", mapa["field_descripcion"] or "")
        self.assertEqual(mapa["btn_guardar_borrador"], 'text="Guardar borrador"')
        self.assertEqual(mapa["btn_publicar"], 'text="Publicar"')

    def test_dry_run_no_hace_click_en_boton_que_tambien_publica(self):
        mapa = self.modulo.sugerir_selectores(self.estructura_meta_primero)
        runtime = RuntimeFalso()

        with contextlib.redirect_stdout(io.StringIO()):
            resultado = self.modulo.fill_from_receta(
                PageFalsa(runtime),
                {
                    **self.receta_valida,
                    "seo": {
                        "metaTitulo": "Título SEO",
                        "metaDescripcion": "Descripción SEO",
                    },
                },
                mapa,
                dry_run=True,
            )

        self.assertTrue(resultado)
        self.assertEqual(mapa["btn_publicar"], "#guardar-publicar")
        self.assertIsNone(mapa["btn_guardar_borrador"])
        self.assertEqual(runtime.clicks, [])

    def test_sugerir_selectores_conserva_alias_seo_en_ingles(self):
        estructura = {
            "fields": [
                {"label": "SEO Title", "selectorSugerido": "#seo-title"},
                {"label": "SEO Description", "selectorSugerido": "#seo-description"},
            ]
        }

        mapa = self.modulo.sugerir_selectores(estructura)

        self.assertEqual(mapa["field_meta_titulo"], "#seo-title")
        self.assertEqual(mapa["field_meta_descripcion"], "#seo-description")
        self.assertIsNone(mapa["field_titulo"])
        self.assertIsNone(mapa["field_descripcion"])

    def test_main_bloquea_borrador_antes_de_importar_playwright(self):
        receta = {
            **self.receta_valida,
            "estado": "borrador",
            "camposFaltantes": ["descripcion"],
        }
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "receta.json"
            path.write_text(json.dumps(receta), encoding="utf-8")
            argv = ["explorar-bm-cencosud.py", "--fill-json", str(path), "--publish"]
            with (
                patch.object(sys, "argv", argv),
                contextlib.redirect_stdout(io.StringIO()),
                contextlib.redirect_stderr(io.StringIO()),
            ):
                exit_code = self.modulo.main()

        self.assertEqual(exit_code, 3)

    def test_publicacion_aborta_si_falla_rellenado_requerido(self):
        runtime = RuntimeFalso({"#pasos"})

        with (
            contextlib.redirect_stdout(io.StringIO()),
            contextlib.redirect_stderr(io.StringIO()),
        ):
            resultado = self.modulo.fill_from_receta(
                PageFalsa(runtime),
                self.receta_valida,
                self.selectores,
                dry_run=False,
            )

        self.assertFalse(resultado)
        self.assertEqual(runtime.clicks, [])

    def test_publicacion_valida_envia_un_solo_click(self):
        runtime = RuntimeFalso()

        with contextlib.redirect_stdout(io.StringIO()):
            resultado = self.modulo.fill_from_receta(
                PageFalsa(runtime),
                self.receta_valida,
                self.selectores,
                dry_run=False,
            )

        self.assertTrue(resultado)
        self.assertEqual(runtime.clicks, ["#publicar"])

    def test_main_marca_cargado_y_evitar_republicacion(self):
        runtime = RuntimeFalso()
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            secrets_path = tmp_path / "secrets"
            secrets_path.mkdir()
            env_path = secrets_path / ".env"
            env_path.write_text("", encoding="utf-8")
            receta_path = tmp_path / "receta.json"
            receta_path.write_text(json.dumps(self.receta_valida), encoding="utf-8")
            argv = ["explorar-bm-cencosud.py", "--fill-json", str(receta_path), "--publish"]

            with (
                patch.object(sys, "argv", argv),
                patch.dict(sys.modules, runtime.modulos()),
                patch.object(self.modulo, "load_env", return_value={}),
                patch.object(self.modulo, "dump_estructura", return_value={"fields": [], "buttons": []}),
                patch.object(self.modulo, "sugerir_selectores", return_value=self.selectores),
                patch.object(self.modulo, "ROOT", tmp_path),
                patch.object(self.modulo, "SECRETS", secrets_path),
                patch.object(self.modulo, "ENV_PATH", env_path),
                patch.object(self.modulo, "SESSION_PATH", secrets_path / "session.json"),
                patch.object(self.modulo, "ESTRUCTURA_PATH", secrets_path / "estructura.json"),
                patch.object(self.modulo, "SCREENSHOT_PATH", secrets_path / "screenshot.png"),
                patch.object(self.modulo, "MAPA_SELECTORES_PATH", secrets_path / "selectores.json"),
                patch("builtins.input", return_value=""),
                contextlib.redirect_stdout(io.StringIO()),
                contextlib.redirect_stderr(io.StringIO()),
            ):
                exit_code = self.modulo.main()

            guardada = json.loads(receta_path.read_text(encoding="utf-8"))

        self.assertEqual(exit_code, 0)
        self.assertEqual(runtime.clicks, ["#publicar"])
        self.assertEqual(guardada["estado"], "cargado")

    def test_fill_no_rellena_pagina_en_blanco(self):
        runtime = RuntimeFalso()

        class Pagina(PageFalsa):
            url = (
                "https://business-manager.ecomm.cencosud.com/cms/projects/"
                "6597f023fdc664839ccd2a37/view-manager/view/660f47f182f32694e4a6e2a4"
            )

            def evaluate(self, script, *_args):
                texto = str(script)
                if "h1,h2,h3" in texto:
                    return "CMS | Proyectos"
                if "innerText" in texto:
                    return "CMS Proyectos JUMBO Chile PRODUCTION"
                return super().evaluate(script, *_args)

        with (
            contextlib.redirect_stdout(io.StringIO()),
            contextlib.redirect_stderr(io.StringIO()),
        ):
            resultado = self.modulo.fill_from_receta(
                Pagina(runtime),
                self.receta_valida,
                self.selectores,
                dry_run=True,
                url_ficha=Pagina.url,
            )
        self.assertFalse(resultado)
        self.assertEqual(runtime.clicks, [])
        self.assertTrue(
            self.modulo.parece_cms_vacio(Pagina(RuntimeFalso()))
        )

    def test_fill_no_rellena_si_esta_en_lista_proyectos(self):
        runtime = RuntimeFalso()
        with (
            contextlib.redirect_stdout(io.StringIO()),
            contextlib.redirect_stderr(io.StringIO()),
        ):
            resultado = self.modulo.fill_from_receta(
                PageFalsa(runtime),
                self.receta_valida,
                self.selectores,
                dry_run=True,
                url_ficha="https://business-manager.ecomm.cencosud.com/cms/projects",
            )
        self.assertFalse(resultado)
        self.assertEqual(runtime.clicks, [])

    def test_restaurar_ficha_vuelve_desde_proyectos(self):
        ficha = (
            "https://business-manager.ecomm.cencosud.com/cms/projects/"
            "6597f023fdc664839ccd2a37/view-manager"
        )

        class Pagina:
            url = "https://business-manager.ecomm.cencosud.com/cms/projects"

            def __init__(self):
                self.gotos = []

            def goto(self, url, **_kwargs):
                self.gotos.append(url)
                self.url = url

            def wait_for_timeout(self, _ms):
                return None

        pagina = Pagina()
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertTrue(self.modulo.restaurar_ficha_si_salio(pagina, ficha))
        self.assertEqual(pagina.gotos, [ficha])

    def test_url_lienzo_conserva_vista_y_no_baja_al_gestor_vacio(self):
        vista = (
            "https://business-manager.ecomm.cencosud.com/cms/projects/"
            "6597f023fdc664839ccd2a37/view-manager/view/abc123?component=e45e7e"
        )
        gestor = (
            "https://business-manager.ecomm.cencosud.com/cms/projects/"
            "6597f023fdc664839ccd2a37/view-manager"
        )
        self.assertTrue(self.modulo.url_tiene_vista_receta(vista))
        self.assertFalse(self.modulo.url_tiene_vista_receta(gestor))
        self.assertTrue(self.modulo.gestor_sin_ficha(gestor))
        self.assertFalse(self.modulo.gestor_sin_ficha(vista))
        destino = self.modulo.url_lienzo_receta(vista, gestor)
        self.assertIsNotNone(destino)
        self.assertIn("/view/abc123", destino)
        self.assertNotIn("component=", destino)
        self.assertIsNone(self.modulo.url_lienzo_receta(gestor, gestor))

    def test_fill_siempre_recarga_cabecera(self):
        runtime = RuntimeFalso()
        url = (
            "https://business-manager.ecomm.cencosud.com/cms/projects/"
            "6597f023fdc664839ccd2a37/view-manager/view/abc123"
        )

        class Pagina(PageFalsa):
            pass

        pagina = Pagina(runtime)
        pagina.url = url
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            self.modulo.fill_from_receta(
                pagina,
                self.receta_valida,
                self.selectores,
                dry_run=True,
                url_ficha=url,
            )
        texto = buf.getvalue()
        self.assertIn("receta completa", texto)
        self.assertIn("cabecera", texto.lower())
        self.assertNotIn("Cabecera ya está", texto)

    def test_js_fill_index_excluye_paleta(self):
        self.assertIn("r.left >= 240", self.modulo.JS_FILL_INDEX)

    def test_js_bloque_vacio_prioriza_cabecera_llena(self):
        js = self.modulo.JS_BLOQUE_VACIO
        self.assertIn("algunoLleno", js)
        self.assertIn("return !algunoLleno", js)

    def test_js_clic_lapiz_excluye_paleta(self):
        js = self.modulo.JS_CLIC_LAPIZ
        self.assertIn("paleta", js.lower())
        self.assertIn("left < 240", js)
        self.assertIn("Edita este componente", js)
        self.assertIn("elementFromPoint", js)
        self.assertNotIn("iconos[1]", js)
        self.assertNotRegex(js, r"esLapiz = \(b\) => /[^/]*create")

    def test_resultado_clic_lapiz_ok(self):
        self.assertTrue(self.modulo.resultado_clic_lapiz_ok(True))
        self.assertTrue(self.modulo.resultado_clic_lapiz_ok({"ok": True}))
        self.assertFalse(self.modulo.resultado_clic_lapiz_ok({"ok": False, "n": 5}))
        self.assertFalse(self.modulo.resultado_clic_lapiz_ok([]))
        self.assertFalse(self.modulo.resultado_clic_lapiz_ok(None))

    def test_clic_lapiz_por_fila_salta_paleta(self):
        runtime = RuntimeFalso()
        paleta = NodoCms(runtime, "paleta-cabecera", {"x": 48, "width": 160, "height": 22}, 2)
        lienzo = NodoCms(runtime, "lienzo-cabecera", {"x": 380, "width": 240, "height": 24}, 3)
        pagina = PaginaTextos({"Cabecera": [paleta, lienzo]})
        self.assertTrue(self.modulo._clic_lapiz_por_fila(pagina, ["Cabecera"]))
        self.assertEqual(runtime.clicks, ["edit-lienzo-cabecera"])

    def test_clic_lapiz_placeholder_usa_orden_vertical(self):
        runtime = RuntimeFalso()
        cab = NodoCms(runtime, "cab", {"x": 400, "y": 120, "width": 520, "height": 70}, 0)
        tags = NodoCms(runtime, "tags", {"x": 400, "y": 220, "width": 520, "height": 70}, 0)

        class Mouse:
            def click(self, x, y):
                runtime.clicks.append((round(x), round(y)))

        class Pagina:
            def __init__(self):
                self.mouse = Mouse()

            def get_by_text(self, _texto, exact=True):
                return GrupoTextos([cab, tags])

        self.assertTrue(self.modulo._clic_lapiz_placeholder(Pagina(), 0))
        self.assertEqual(runtime.clicks, [(886, 140)])
        runtime.clicks.clear()
        self.assertTrue(self.modulo._clic_lapiz_placeholder(Pagina(), 1))
        self.assertEqual(runtime.clicks, [(886, 240)])


class NodoCms:
    def __init__(self, runtime, nombre, box, n_botones):
        self.runtime = runtime
        self.nombre = nombre
        self._box = box
        self.n_botones = n_botones

    def bounding_box(self):
        return self._box

    def locator(self, selector):
        if "xpath=ancestor" in selector:
            return FilaCms(self)
        if "Editar" in selector or "edit" in selector or "lápiz" in selector or "lapiz" in selector:
            return GrupoBotones(self.runtime, f"edit-{self.nombre}", 1, self._box)
        if selector == "button":
            return GrupoBotones(self.runtime, f"btn-{self.nombre}", self.n_botones, self._box)
        return GrupoBotones(self.runtime, selector, 0, self._box)

    def click(self, **_kwargs):
        self.runtime.clicks.append(self.nombre)

    def nth(self, _i):
        return self

    def count(self):
        return 1


class FilaCms:
    def __init__(self, nodo):
        self.nodo = nodo

    def bounding_box(self):
        box = dict(self.nodo._box)
        box["width"] = max(box.get("width") or 0, 400)
        return box

    def locator(self, selector):
        return self.nodo.locator(selector)

    def count(self):
        return 1


class GrupoBotones:
    def __init__(self, runtime, nombre, n, box):
        self.runtime = runtime
        self.nombre = nombre
        self.n = n
        self._box = box

    def count(self):
        return self.n

    def first(self):
        return self

    def nth(self, _i):
        return self

    def bounding_box(self):
        return self._box

    def click(self, **_kwargs):
        self.runtime.clicks.append(self.nombre)


class PaginaTextos:
    def __init__(self, por_texto):
        self.por_texto = por_texto

    def get_by_text(self, alias, exact=True):
        return GrupoTextos(self.por_texto.get(alias, []))


class GrupoTextos:
    def __init__(self, items):
        self.items = items

    def count(self):
        return len(self.items)

    def nth(self, i):
        return self.items[i]


if __name__ == "__main__":
    unittest.main()
