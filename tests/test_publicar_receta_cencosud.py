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


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts/publicar-receta-cencosud.py"


def cargar_modulo():
    spec = importlib.util.spec_from_file_location("publicar_receta_cencosud", SCRIPT_PATH)
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

    def is_visible(self):
        return True

    def nth(self, _i):
        return self

    def evaluate(self, _script):
        return "input"

    def fill(self, _value):
        return None

    def select_option(self, **_kwargs):
        return None

    def click(self, **_kwargs):
        self.runtime.clicks.append(self.selector)


class PageFalsa:
    def __init__(self, runtime):
        self.runtime = runtime
        self.url = ""

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

    def goto(self, url, *_args, **_kwargs):
        self.runtime.gotos.append(url)
        self.url = url

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
        self.runtime.lanzamientos += 1
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
        self.gotos = []
        self.lanzamientos = 0

    def modulos(self):
        paquete = types.ModuleType("playwright")
        paquete.__path__ = []
        sync_api = types.ModuleType("playwright.sync_api")
        sync_api.sync_playwright = lambda: GestorPlaywrightFalso(self)
        return {"playwright": paquete, "playwright.sync_api": sync_api}


class PublicarRecetaTests(unittest.TestCase):
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
            "btn_guardar_borrador": "#borrador",
        }

    def ejecutar(self, receta, *, args=(), selectores_ausentes=()):
        runtime = RuntimeFalso(selectores_ausentes)
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            receta_path = tmp_path / "receta.json"
            receta_path.write_text(json.dumps(receta), encoding="utf-8")
            argv = ["publicar-receta-cencosud.py", str(receta_path), *args]
            env = {"CENCOSUD_BM_DRY_RUN": "false", "CENCOSUD_BM_HEADED": "false"}

            with (
                patch.object(self.modulo, "load_env", return_value=env),
                patch.object(self.modulo, "load_selectores", return_value=self.selectores),
                patch.object(self.modulo, "SESSION_PATH", tmp_path / "session.json"),
                patch.object(sys, "argv", argv),
                patch.dict(sys.modules, runtime.modulos()),
                contextlib.redirect_stdout(io.StringIO()),
                contextlib.redirect_stderr(io.StringIO()),
            ):
                exit_code = self.modulo.main()

            guardada = json.loads(receta_path.read_text(encoding="utf-8"))
        return exit_code, runtime, guardada

    def test_publicacion_bloquea_preflight_antes_de_abrir_navegador(self):
        casos = [
            {**self.receta_valida, "estado": "borrador"},
            {**self.receta_valida, "camposFaltantes": ["descripcion"]},
            {**self.receta_valida, "estado": "cargado"},
            {**self.receta_valida, "estado": "publicado"},
        ]

        for receta in casos:
            with self.subTest(receta=receta):
                exit_code, runtime, guardada = self.ejecutar(receta)
                self.assertEqual(exit_code, 3)
                self.assertEqual(runtime.lanzamientos, 0)
                self.assertEqual(guardada["estado"], receta["estado"])

    def test_sku_faltante_no_bloquea_publicacion(self):
        receta = {
            **self.receta_valida,
            "camposFaltantes": ["ingredientes.skuCencosud"],
        }

        exit_code, runtime, guardada = self.ejecutar(receta)

        self.assertEqual(exit_code, 0)
        self.assertEqual(runtime.clicks, ["#publicar"])
        self.assertEqual(guardada["estado"], "cargado")

    def test_publicacion_aborta_si_falla_rellenado_requerido(self):
        exit_code, runtime, guardada = self.ejecutar(
            self.receta_valida,
            selectores_ausentes={"#descripcion"},
        )

        self.assertEqual(exit_code, 4)
        self.assertEqual(runtime.clicks, [])
        self.assertEqual(guardada["estado"], "listo-para-cargar")

    def test_click_sin_confirmacion_deja_estado_cargado(self):
        exit_code, runtime, guardada = self.ejecutar(self.receta_valida)

        self.assertEqual(exit_code, 0)
        self.assertEqual(runtime.clicks, ["#publicar"])
        self.assertEqual(guardada["estado"], "cargado")

    def test_dry_run_conserva_flujo_de_borrador(self):
        receta = {
            **self.receta_valida,
            "descripcion": "",
            "estado": "borrador",
            "camposFaltantes": ["descripcion"],
        }
        exit_code, runtime, guardada = self.ejecutar(receta, args=("--dry-run",))

        self.assertEqual(exit_code, 0)
        self.assertEqual(runtime.clicks, ["#borrador"])
        self.assertEqual(guardada["estado"], "cargado")

    def test_no_sigue_nav_nueva_receta_hacia_proyectos(self):
        self.selectores["nav_nueva_receta"] = "/cms/projects"
        exit_code, runtime, _guardada = self.ejecutar(self.receta_valida, args=("--dry-run",))
        self.assertEqual(exit_code, 0)
        self.assertFalse(
            any(str(url).rstrip("/").endswith("/cms/projects") for url in runtime.gotos)
        )


if __name__ == "__main__":
    unittest.main()
