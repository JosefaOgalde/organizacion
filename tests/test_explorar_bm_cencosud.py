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
        return 0 if self.selector in self.runtime.selectores_ausentes else 1

    def fill(self, _value):
        return None

    def click(self):
        self.runtime.clicks.append(self.selector)


class PageFalsa:
    def __init__(self, runtime):
        self.runtime = runtime

    def locator(self, selector):
        return LocatorFalso(self.runtime, selector)

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


if __name__ == "__main__":
    unittest.main()
