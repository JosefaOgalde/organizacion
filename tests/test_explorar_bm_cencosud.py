import contextlib
import importlib.util
import inspect
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
            "6597f023fdc664839ccd2a37/view-manager/view/abc123"
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

    def test_restaurar_no_recarga_si_sigue_en_default(self):
        ficha = (
            "https://business-manager.ecomm.cencosud.com/cms/projects/"
            "6597f023fdc664839ccd2a37/view-manager"
        )

        class Loc:
            def count(self):
                return 5

        class Pagina:
            url = ficha

            def __init__(self):
                self.gotos = []

            def get_by_text(self, _texto, exact=False):
                return Loc()

            def goto(self, url, **_kwargs):
                self.gotos.append(url)

            def evaluate(self, script, *_args):
                texto = str(script)
                if "innerText" in texto:
                    return "Proyectos\nJUMBO\ndefault\nResolución"
                return []

            def wait_for_timeout(self, _ms):
                return None

        pagina = Pagina()
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertFalse(self.modulo.restaurar_ficha_si_salio(pagina, ficha))
            self.assertEqual(
                self.modulo.esperar_ficha_en_lienzo(pagina, headed=False),
                ficha,
            )
        self.assertEqual(pagina.gotos, [])
        self.assertTrue(self.modulo.en_vista_default_cms(pagina))

    def test_restaurar_no_recarga_gestor_pelado(self):
        gestor = (
            "https://business-manager.ecomm.cencosud.com/cms/projects/"
            "6597f023fdc664839ccd2a37/view-manager"
        )

        class Pagina:
            url = "https://business-manager.ecomm.cencosud.com/cms/projects"

            def __init__(self):
                self.gotos = []

            def goto(self, url, **_kwargs):
                self.gotos.append(url)

            def wait_for_timeout(self, _ms):
                return None

        pagina = Pagina()
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertFalse(self.modulo.restaurar_ficha_si_salio(pagina, gestor))
        self.assertEqual(pagina.gotos, [])

    def test_url_con_componente_abre_editor(self):
        vista = (
            "https://business-manager.ecomm.cencosud.com/cms/projects/"
            "6597f023fdc664839ccd2a37/view-manager/view/abc123"
        )
        self.assertEqual(
            self.modulo.url_con_componente(vista, "a3e7ad"),
            vista + "?component=a3e7ad",
        )
        self.assertIsNone(self.modulo.url_con_componente("https://example.com", "a3e7ad"))

    def test_no_parece_cms_vacio_si_hay_cinco_bloques_en_iframe(self):
        """El chrome del frame principal dice Proyectos; el lienzo está en iframe."""

        class Loc:
            def count(self):
                return 5

        class Pagina:
            def get_by_text(self, _texto, exact=False):
                return Loc()

            def evaluate(self, script, *_args):
                texto = str(script)
                if "h1,h2,h3" in texto:
                    return "Recetas_Jumbo | web"
                if "innerText" in texto:
                    return "Proyectos\nJUMBO\nRecetas_Jumbo"
                return []

        pagina = Pagina()
        self.assertTrue(self.modulo.lienzo_con_bloques_cms(pagina))
        self.assertFalse(self.modulo.parece_cms_vacio(pagina))

    def test_abrir_por_id_visible_nunca_recarga(self):
        clicks = []

        class Loc:
            def count(self):
                return 1

            def nth(self, _i):
                return self

            def bounding_box(self):
                return {"x": 420, "y": 140, "width": 48, "height": 16}

            def locator(self, _sel):
                return self

        class Mouse:
            def click(self, x, y):
                clicks.append((round(x), round(y)))

        class Pagina:
            def __init__(self):
                self.gotos = []
                self.mouse = Mouse()

            def get_by_text(self, texto, exact=True):
                self.last_text = texto
                return Loc()

            def goto(self, url, **_kwargs):
                self.gotos.append(url)

            def evaluate(self, script, *_args):
                return "Proyectos JUMBO"

            def wait_for_timeout(self, _ms):
                return None

        pagina = Pagina()
        with contextlib.redirect_stdout(io.StringIO()):
            ok = self.modulo._abrir_por_id_visible(pagina, "cabecera", "a3e7ad")
        self.assertFalse(ok)
        self.assertEqual(pagina.gotos, [])
        src = __import__("inspect").getsource(self.modulo._abrir_por_id_visible)
        self.assertNotIn("page.goto", src)
        self.assertNotIn("component=", src)
        self.assertEqual(pagina.gotos, [])

    def test_desplegable_default_y_version_publicada(self):
        class Loc:
            def __init__(self, items):
                self.items = items

            def count(self):
                return len(self.items)

            def nth(self, i):
                return self.items[i]

        class Nodo:
            def __init__(self, box):
                self._box = box

            def bounding_box(self):
                return self._box

        class ConDefault:
            def get_by_text(self, texto, exact=True):
                if texto == "default":
                    return Loc([Nodo({"x": 260, "y": 72, "width": 80, "height": 24})])
                return Loc([])

        class SoloPublicada:
            def get_by_text(self, texto, exact=True):
                if "publicada" in texto.lower():
                    return Loc([Nodo({"x": 260, "y": 90, "width": 120, "height": 18})])
                return Loc([])

        self.assertTrue(self.modulo.desplegable_vista_default(ConDefault()))
        self.assertIsNone(self.modulo.desplegable_vista_default(SoloPublicada()))
        self.assertFalse(self.modulo.avisar_si_salio_de_default(SoloPublicada()))
        self.assertFalse(self.modulo.avisar_si_salio_de_default(ConDefault()))

    def test_clic_editar_indice_bajo_la_barra(self):
        runtime = RuntimeFalso()
        barra = NodoCms(runtime, "default", {"x": 260, "y": 70, "width": 70, "height": 22}, 0)
        cab = NodoCms(runtime, "editar-cab", {"x": 820, "y": 160, "width": 48, "height": 18}, 0)
        tags = NodoCms(runtime, "editar-tags", {"x": 820, "y": 260, "width": 48, "height": 18}, 0)

        class Pagina:
            def get_by_text(self, texto, exact=True):
                if texto == "default":
                    return GrupoTextos([barra])
                if texto == "Editar":
                    return GrupoTextos([cab, tags])
                return GrupoTextos([])

        self.assertTrue(self.modulo._clic_editar_indice(Pagina(), 0))
        self.assertEqual(runtime.clicks, ["editar-cab"])
        runtime.clicks.clear()
        self.assertTrue(self.modulo._clic_editar_indice(Pagina(), 1))
        self.assertEqual(runtime.clicks, ["editar-tags"])

    def test_editor_en_iframe_aunque_el_chrome_diga_proyectos(self):
        class FrameEditor:
            def evaluate(self, script, *_args):
                texto = str(script)
                if "h1,h2,h3" in texto:
                    return "Edición de Cabecera"
                if "innerText" in texto:
                    return "Edición de Cabecera Título Duración Dificultad Porciones"
                return ""

        class Pagina:
            def __init__(self):
                self.frames = [FrameEditor()]

            def evaluate(self, script, *_args):
                texto = str(script)
                if "h1,h2,h3" in texto:
                    return "Recetas_Jumbo | web"
                if "innerText" in texto:
                    return "Proyectos JUMBO Versión publicada default"
                return ""

        self.assertEqual(self.modulo.editor_actual(Pagina()), "cabecera")

    def test_pedir_lapiz_a_mano_si_el_editor_ya_esta(self):
        class Pagina:
            def evaluate(self, script, *_args):
                texto = str(script)
                if "h1,h2,h3" in texto:
                    return "Edición de Cabecera"
                if "innerText" in texto:
                    return "Edición de Cabecera Título Duración Dificultad Porciones"
                return ""

        with contextlib.redirect_stdout(io.StringIO()):
            self.assertTrue(self.modulo.pedir_lapiz_a_mano(Pagina(), "cabecera"))

    def test_titulo_no_ok_si_sigue_dale_un_valor(self):
        self.assertFalse(self.modulo._valor_quedo("", "Salmón a la parrilla"))
        self.assertFalse(self.modulo._valor_quedo("Dale un valor", "Salmón a la parrilla"))
        self.assertFalse(self.modulo._valor_quedo("0", "30"))
        self.assertTrue(self.modulo._valor_quedo("30", "30"))
        self.assertTrue(self.modulo._valor_quedo(None, "Salmón"))
        self.assertTrue(
            self.modulo._valor_quedo(
                "Salmón a la parrilla con salsa de palta",
                "Salmón a la parrilla con salsa de palta",
            )
        )

        class LocVacio:
            def fill(self, *_a, **_k):
                return None

            def click(self, **_k):
                return None

            def input_value(self):
                return ""

            def bounding_box(self):
                return {"x": 400, "y": 200, "width": 280, "height": 36}

            def evaluate(self, *_a, **_k):
                return ""

        self.assertFalse(
            self.modulo.escribir_valor(
                object(), LocVacio(), "Salmón a la parrilla con salsa de palta"
            )
        )

        class LocTitulo:
            def __init__(self):
                self.val = ""

            def count(self):
                return 1

            def nth(self, _i):
                return self

            def fill(self, v, **_k):
                self.val = v

            def click(self, **_k):
                return None

            def input_value(self):
                return self.val

            def bounding_box(self):
                return {"x": 400, "y": 220, "width": 300, "height": 36}

            def evaluate(self, *_a, **_k):
                return self.val

        loc = LocTitulo()

        class Pagina:
            def get_by_placeholder(self, _p, exact=False):
                return loc

            def evaluate(self, script, *_args):
                return {"ok": False, "value": ""}

            def wait_for_timeout(self, _ms):
                return None

        self.assertTrue(
            self.modulo.rellenar_titulo_cabecera(
                Pagina(), "Salmón a la parrilla con salsa de palta"
            )
        )
        self.assertEqual(loc.val, "Salmón a la parrilla con salsa de palta")

        class LocReact:
            def __init__(self):
                self.val = ""

            def fill(self, *_a, **_k):
                return None

            def click(self, **_k):
                return None

            def input_value(self):
                return self.val

            def bounding_box(self):
                return {"x": 400, "y": 200, "width": 280, "height": 36}

            def evaluate(self, _script, arg=None):
                if arg is not None:
                    self.val = str(arg)
                    return arg
                return self.val

        self.assertTrue(
            self.modulo.escribir_valor(
                object(), LocReact(), "Salmón a la parrilla con salsa de palta"
            )
        )

    def test_titulo_js_react_en_frame(self):
        self.assertIn("_valueTracker", self.modulo.JS_CRC_SET_REACT)
        self.assertIn("crcFindTitulo", self.modulo.JS_ESCRIBIR_TITULO_CABECERA)
        self.assertIn("dale un valor", self.modulo.JS_CRC_FIND_TITULO)
        self.assertIn("Dale un valor", self.modulo.JS_CRC_FIND_TITULO)
        self.assertIn("role", self.modulo.JS_CRC_FIND_TITULO)
        self.assertIn("crcFindNumero", self.modulo.JS_ESCRIBIR_NUMERO)

        class Pagina:
            def evaluate(self, script, arg=None):
                texto = str(script)
                if "crcSetReact" in texto and arg:
                    return {"ok": True, "value": arg}
                if "crcFindTitulo" in texto:
                    return {"ok": True, "value": "Salmón a la parrilla con salsa de palta"}
                return {"ok": False, "value": ""}

            def wait_for_timeout(self, _ms):
                return None

        self.assertTrue(
            self.modulo.rellenar_titulo_cabecera(
                Pagina(), "Salmón a la parrilla con salsa de palta"
            )
        )

    def test_duracion_cero_no_es_treinta(self):
        self.assertFalse(self.modulo._valor_quedo("0", "30"))

        class Pagina:
            def evaluate(self, script, *_args):
                if "innerText" in str(script):
                    return "Duración El valor es inferior al mínimo: 1"
                return ""

        self.assertTrue(self.modulo.sigue_duracion_invalida(Pagina()))
        self.assertFalse(self.modulo.rellenar_numero_cabecera(Pagina(), r"^Duración\b", "0"))

    def test_fill_titulo_no_declara_ok_con_label_bm(self):
        runtime = RuntimeFalso()
        url = (
            "https://business-manager.ecomm.cencosud.com/cms/projects/"
            "6597f023fdc664839ccd2a37/view-manager/view/abc123"
        )

        class Pagina(PageFalsa):
            def evaluate(self, script, *_args):
                texto = str(script)
                if "h1,h2,h3" in texto:
                    return "Edición de Cabecera"
                if "innerText" in texto:
                    return "Edición de Cabecera Título Duración Dificultad Porciones"
                return super().evaluate(script, *_args)

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
        self.assertNotIn("field_titulo (label BM)", texto)
        self.assertIn("field_titulo", texto)

    def test_pedir_lapiz_a_mano_sin_tty_no_espera(self):
        class Pagina:
            def evaluate(self, *_args):
                return "Proyectos JUMBO"

        with contextlib.redirect_stdout(io.StringIO()):
            self.assertFalse(
                self.modulo.pedir_lapiz_a_mano(Pagina(), "cabecera", headed=False)
            )

    def test_editor_detecta_formulario_tags(self):
        self.assertRegex("Formulario Tags", self.modulo.TITULOS_EDITOR["tags"])
        self.assertIn("formulario tags", self.modulo.JS_TEXTO_EDITOR.lower())
        self.assertIn("Duplicar", " ".join(self.modulo.BOTONES_AGREGAR))
        self.assertIn("esTag", self.modulo.JS_MARCAR_INPUTS_ITEM)
        self.assertIn("Link", self.modulo.JS_MARCAR_INPUTS_ITEM)

        class Pagina:
            def evaluate(self, script, *_args):
                texto = str(script)
                if "h1,h2,h3" in texto:
                    return "Formulario Tags"
                if "innerText" in texto:
                    return (
                        "Formulario Tags Arreglo Formulario Ítem 1 "
                        "Tag * Dale un valor El dato es requerido Link"
                    )
                return ""

        self.assertEqual(self.modulo.editor_actual(Pagina()), "tags")
        self.assertEqual(self.modulo.editor_por_campos(Pagina()), "tags")

    def test_tags_no_se_escriben_en_link(self):
        self.assertIn("data-crc-tag-hit", self.modulo.JS_MARCAR_CAMPOS_TAG)
        self.assertIn("esLabelLink", self.modulo.JS_MARCAR_CAMPOS_TAG)
        self.assertIn("tipo === 'url'", self.modulo.JS_MARCAR_CAMPOS_TAG)
        self.assertIn("Link", self.modulo.JS_LIMPIAR_LINKS_NO_URL)
        self.assertIn("reEx.test(linea)", self.modulo.JS_MARCAR_POR_LABEL)
        self.assertNotIn("reEx.test(crudo)", self.modulo.JS_MARCAR_POR_LABEL)
        src = self.modulo.fill_lista_tags.__code__.co_consts
        self.assertTrue(any(isinstance(c, str) and "nunca en Link" in c for c in src))

        class LocLink:
            def get_attribute(self, name):
                return "url" if name == "type" else None

            def evaluate(self, *_a, **_k):
                return True

        self.assertTrue(self.modulo._locator_es_link(LocLink()))

        class LocTag:
            def get_attribute(self, _name):
                return None

            def evaluate(self, *_a, **_k):
                return False

        self.assertFalse(self.modulo._locator_es_link(LocTag()))

    def test_escribe_tag_entre_tag_y_link(self):
        self.assertIn("crcBandaTag", self.modulo.JS_FOCO_CAJA_TAG)
        self.assertIn("crcInputEnBanda", self.modulo.JS_LEER_CAJA_TAG)
        self.assertIn("buscado", self.modulo.JS_LINK_TIENE_TEXTO)

        class Pagina:
            def evaluate(self, script, arg=None):
                texto = str(script)
                if "buscado" in texto:
                    return False
                if "crcSetReact" in texto and isinstance(arg, dict):
                    return {"ok": True, "wrote": arg.get("valor"), "tag": "input"}
                if "crcInputEnBanda" in texto:
                    return {"ok": True, "value": "salmon"}
                return {"ok": False, "value": ""}

            def wait_for_timeout(self, _ms):
                return None

        self.assertTrue(self.modulo.escribir_tag_entre_labels(Pagina(), 0, "salmon"))

    def test_rellena_tag_del_item_abierto_no_siempre_el_primero(self):
        src = inspect.getsource(self.modulo.rellenar_items_formulario)
        self.assertIn("escribir_tag_entre_labels(page, i, valor)", src)
        self.assertNotIn("escribir_tag_entre_labels(page, 0, valor)", src)
        self.assertIn("crcCajasDelItem", self.modulo.JS_FOCO_CAJA_TAG)
        self.assertIn("crcCajasDelItem", self.modulo.JS_LEER_CAJA_TAG)
        self.assertIn("crcCajasDelItem", self.modulo.JS_MARCAR_TAGS_POR_ITEM)
        self.assertIn("exigir_lienzo", inspect.signature(self.modulo.escribir_valor).parameters)

        class LocTag:
            def __init__(self):
                self.val = ""

            def fill(self, v, **_k):
                self.val = v

            def click(self, **_k):
                return None

            def input_value(self):
                return self.val

            def bounding_box(self):
                return {"x": 120, "y": 200, "width": 280, "height": 36}

            def get_attribute(self, _n):
                return None

            def evaluate(self, *_a, **_k):
                return False

        loc = LocTag()
        self.assertTrue(
            self.modulo.escribir_valor(object(), loc, "salmon", exigir_lienzo=False)
        )
        self.assertEqual(loc.val, "salmon")

        vistos = []

        class PaginaIndice:
            def evaluate(self, script, arg=None):
                if isinstance(arg, dict) and "indice" in arg:
                    vistos.append(arg["indice"])
                    return {"ok": True, "wrote": arg.get("valor"), "tag": "input"}
                texto = str(script)
                if "buscado" in texto:
                    return False
                if "crcInputEnBanda" in texto or "crcCajasDelItem" in texto:
                    return {"ok": True, "value": arg if isinstance(arg, str) else "paltas"}
                return {"ok": False, "value": ""}

            def wait_for_timeout(self, _ms):
                return None

        self.assertTrue(self.modulo.escribir_tag_entre_labels(PaginaIndice(), 2, "paltas"))
        self.assertEqual(vistos, [2])

    def test_despliega_formulario_item_antes_de_tag(self):
        self.assertIn("crcCabezalesItem", self.modulo.JS_EXPANDIR_ITEM_FORMULARIO)
        self.assertIn("aria-expanded", self.modulo.JS_EXPANDIR_ITEM_FORMULARIO)

        class Pagina:
            def evaluate(self, script, arg=None):
                if "crcCabezalesItem" in str(script):
                    return {"ok": True, "n": 6, "expanded": True}
                return False

            def wait_for_timeout(self, _ms):
                return None

        self.assertTrue(self.modulo.expandir_item_formulario(Pagina(), 0))

    def test_editor_por_campos_detecta_lista_ingredientes_sin_cantidad(self):
        class Pagina:
            def evaluate(self, script, *_args):
                texto = str(script)
                if "h1,h2,h3" in texto:
                    return "Recetas_Jumbo | web"
                if "innerText" in texto:
                    return (
                        "Formulario list_ingredients Activo Items Formulario Ítem 1 "
                        "Título de la sección Ingrediente * Dale un valor"
                    )
                return ""

        pagina = Pagina()
        self.assertEqual(self.modulo.editor_por_campos(pagina), "ingredientes")
        self.assertEqual(self.modulo.editor_actual(pagina), "ingredientes")

    def test_editor_por_campos_detecta_cabecera(self):
        class Pagina:
            def evaluate(self, script, *_args):
                texto = str(script)
                if "h1,h2,h3" in texto:
                    return "Recetas_Jumbo | web"
                if "innerText" in texto:
                    return "Título Duración Dificultad Porciones Imagen"
                return ""

        pagina = Pagina()
        self.assertEqual(self.modulo.editor_por_campos(pagina), "cabecera")
        self.assertEqual(self.modulo.editor_actual(pagina), "cabecera")

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
        self.assertNotIn("sin recargar", texto.lower())

    def test_js_fill_index_excluye_paleta(self):
        self.assertIn("r.left >= 240", self.modulo.JS_FILL_INDEX)

    def test_js_bloque_vacio_prioriza_cabecera_llena(self):
        js = self.modulo.JS_BLOQUE_VACIO
        self.assertIn("algunoLleno", js)
        self.assertIn("return !algunoLleno", js)

    def test_js_clic_lapiz_excluye_paleta(self):
        js = self.modulo.JS_CLIC_LAPIZ
        self.assertIn("paleta", js.lower())
        self.assertIn("hayPaleta", js)
        self.assertIn("Edita este componente", js)
        self.assertIn("elementFromPoint", js)
        self.assertIn("yBarra", js)
        self.assertIn("^editar$", js)
        self.assertIn("[a-f0-9]{6}", js)
        self.assertNotIn("iconos[1]", js)
        self.assertNotRegex(js, r"esLapiz = \(b\) => /[^/]*create")

    def test_js_clic_bloque_id_no_recarga(self):
        js = self.modulo.JS_CLIC_BLOQUE_ID
        self.assertIn("id-icono", js)
        self.assertIn("id-editar", js)
        self.assertIn("esBasura", js)
        self.assertIn("default", js)
        self.assertIn("zona de trabajo", js)
        self.assertNotIn("location.href", js)
        self.assertNotIn("location.assign", js)

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
