import contextlib
import importlib.util
import io
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts/explorar-bm-cencosud.py"


def cargar_modulo():
    spec = importlib.util.spec_from_file_location("explorar_bm_guardas", SCRIPT_PATH)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


class LocalizadorModal:
    def __init__(self, runtime, existe):
        self.runtime = runtime
        self.existe = existe

    @property
    def last(self):
        return self

    def count(self):
        return int(self.existe and self.runtime.modal)

    def click(self, **_kwargs):
        self.runtime.modal = False
        self.runtime.clicks.append("cancelar-iframe")


class FrameModal:
    def __init__(self, runtime):
        self.runtime = runtime

    def evaluate(self, script, *_args):
        if "innerText" in str(script):
            return "Tienes cambios sin guardar\nCancelar" if self.runtime.modal else ""
        return False

    def get_by_text(self, texto, **_kwargs):
        existe = "tienes cambios sin guardar" in str(texto).lower()
        return LocalizadorModal(self.runtime, existe)

    def locator(self, selector):
        return LocalizadorModal(self.runtime, "Cancelar" in selector)


class PaginaConModalEnIframe:
    def __init__(self):
        self.modal = True
        self.clicks = []
        self.frames = [FrameModal(self)]

    def evaluate(self, *_args):
        return ""

    def get_by_text(self, *_args, **_kwargs):
        return LocalizadorModal(self, False)

    def locator(self, _selector):
        return LocalizadorModal(self, False)

    def wait_for_timeout(self, _ms):
        return None


class CrcPublicationGuardsTests(unittest.TestCase):
    def setUp(self):
        self.explorar = cargar_modulo()

    def test_modal_iframe_se_cancela_y_finaliza_tags(self):
        pagina = PaginaConModalEnIframe()
        tags = ["once", "pan casero"]
        with (
            patch.object(self.explorar, "_contar_tags_ok", return_value=len(tags)),
            patch.object(self.explorar, "asegurar_n_items_tags"),
            patch.object(self.explorar, "guardar_editor_persistente", return_value=True),
            patch.object(self.explorar, "volver_al_lienzo", return_value=True),
            patch.object(self.explorar, "bloque_componente_vacio", return_value=False),
            contextlib.redirect_stdout(io.StringIO()),
        ):
            self.assertTrue(
                self.explorar.finalizar_editor_tags(pagina, "https://bm/receta", tags)
            )

        self.assertFalse(pagina.modal)
        self.assertEqual(pagina.clicks, ["cancelar-iframe"])


if __name__ == "__main__":
    unittest.main()
