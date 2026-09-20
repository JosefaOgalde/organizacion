"""Tests expandir-bloques-receta.py"""
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXP = ROOT / "scripts" / "expandir-bloques-receta.py"
spec = importlib.util.spec_from_file_location("expandir_bloques_receta", EXP)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

EJEMPLO = (
    ROOT
    / "index/clientes/Herramientas/carga-recetas-cencosud/ejemplos/churrascas-bloques.json"
)


class TestExpandirBloques(unittest.TestCase):
    def test_churrascas_expande_5_bloques(self):
        doc = json.loads(EJEMPLO.read_text(encoding="utf-8"))
        self.assertTrue(mod.es_formato_bloques(doc))
        receta = mod.expandir_bloques(doc)
        self.assertEqual(receta["titulo"], "Churrascas")
        self.assertEqual(receta["estado"], "listo-para-cargar")
        self.assertEqual(len(receta["ingredientes"]), 5)
        self.assertEqual(len(receta["pasos"]), 6)
        self.assertEqual(len(receta["tips"]), 3)
        self.assertEqual(receta["categorias"][0], "once")
        self.assertIn("bloques", receta)

    def test_rechaza_sin_bloques(self):
        with self.assertRaises(ValueError):
            mod.expandir_bloques({"titulo": "Solo titulo"})

    def test_porciones_sin_numero_de_bm_deja_receta_en_borrador(self):
        doc = json.loads(EJEMPLO.read_text(encoding="utf-8"))
        doc["bloques"]["cabecera"]["porciones"] = "cuatro personas"

        receta = mod.expandir_bloques(doc)

        self.assertIn("porciones", receta["camposFaltantes"])
        self.assertEqual(receta["estado"], "borrador")

    def test_porciones_con_numero_en_texto_siguen_publicables(self):
        doc = json.loads(EJEMPLO.read_text(encoding="utf-8"))
        doc["bloques"]["cabecera"]["porciones"] = "6 personas"

        receta = mod.expandir_bloques(doc)

        self.assertNotIn("porciones", receta["camposFaltantes"])
        self.assertEqual(receta["estado"], "listo-para-cargar")

    def test_sin_consejos_seo_deja_receta_en_borrador(self):
        doc = json.loads(EJEMPLO.read_text(encoding="utf-8"))
        doc["bloques"]["seo"]["consejos"] = []

        receta = mod.expandir_bloques(doc)

        self.assertIn("tips", receta["camposFaltantes"])
        self.assertEqual(receta["estado"], "borrador")


if __name__ == "__main__":
    unittest.main()
