import importlib.util
import os
import sys
import types
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts/bm_fill_acordeones.py"


def cargar_modulo():
    spec = importlib.util.spec_from_file_location("bm_fill_acordeones", SCRIPT_PATH)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


class BmFillAcordeonesTests(unittest.TestCase):
    def setUp(self):
        self.modulo = cargar_modulo()

    def test_publish_desactiva_dry_run_aunque_el_entorno_lo_active(self):
        observado = {}

        def main_publicador():
            observado["argv"] = list(sys.argv)
            observado["dry_run"] = os.environ.get("CENCOSUD_BM_DRY_RUN")
            return 0

        publicador = types.SimpleNamespace(main=main_publicador)
        with (
            patch.object(self.modulo, "_cargar_publicador", return_value=publicador),
            patch.object(
                sys,
                "argv",
                ["bm_fill_acordeones.py", "receta.json", "--publish"],
            ),
            patch.dict(os.environ, {"CENCOSUD_BM_DRY_RUN": "true"}),
        ):
            self.assertEqual(self.modulo.main(), 0)
            self.assertEqual(os.environ["CENCOSUD_BM_DRY_RUN"], "true")

        self.assertEqual(
            observado,
            {
                "argv": [
                    "publicar-receta-cencosud.py",
                    "receta.json",
                    "--headed",
                ],
                "dry_run": "false",
            },
        )

    def test_sin_publish_mantiene_dry_run_por_defecto(self):
        observado = {}

        def main_publicador():
            observado["argv"] = list(sys.argv)
            observado["dry_run"] = os.environ.get("CENCOSUD_BM_DRY_RUN")
            return 0

        publicador = types.SimpleNamespace(main=main_publicador)
        with (
            patch.object(self.modulo, "_cargar_publicador", return_value=publicador),
            patch.object(sys, "argv", ["bm_fill_acordeones.py", "receta.json"]),
            patch.dict(os.environ, {}, clear=True),
        ):
            self.assertEqual(self.modulo.main(), 0)

        self.assertEqual(
            observado,
            {
                "argv": [
                    "publicar-receta-cencosud.py",
                    "receta.json",
                    "--headed",
                    "--dry-run",
                ],
                "dry_run": None,
            },
        )


if __name__ == "__main__":
    unittest.main()
