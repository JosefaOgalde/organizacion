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

    def test_rechaza_id_que_escapa_del_directorio_de_salida(self):
        doc = json.loads(EJEMPLO.read_text(encoding="utf-8"))
        doc["id"] = "../../../../../data/organizacion-live"

        with self.assertRaisesRegex(ValueError, "id inválido"):
            mod.expandir_bloques(doc)


if __name__ == "__main__":
    unittest.main()
