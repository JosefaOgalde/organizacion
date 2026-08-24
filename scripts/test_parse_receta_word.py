import importlib.util
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("parse-receta-word.py")
SPEC = importlib.util.spec_from_file_location("parse_receta_word", MODULE_PATH)
parser = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(parser)


def receta_jumbo(dificultad: str) -> str:
    return f"""Meta título: Receta de prueba | Recetas Jumbo
Meta descripción: Descripción de prueba
Receta de prueba
35 min | {dificultad} | 4 porciones
Tags: Cena
Ingredientes
1 kg tomate
¿Cómo preparar la receta?
Paso a paso
1. Cocinar
"""


def receta_simple(dificultad: str) -> str:
    return f"""Título: Receta simple
Descripción: Descripción de prueba
Porciones: 4
Dificultad: {dificultad}
Categorías: Cena
Ingredientes:
1 kg tomate
Pasos:
1. Cocinar
"""


class ParsePasosJumboTests(unittest.TestCase):
    def test_tip_inline_no_descarta_texto_ni_absorbe_paso_siguiente(self):
        pasos, tips = parser.parse_pasos_jumbo(
            "1. Marinar\nTip: dejar toda la noche\n2. Hornear 40 min"
        )

        self.assertEqual(
            pasos,
            [
                {"orden": 1, "texto": "Marinar"},
                {"orden": 2, "texto": "Hornear 40 min"},
            ],
        )
        self.assertEqual(tips, ["dejar toda la noche"])

    def test_encabezado_tips_terminal_conserva_lineas_siguientes(self):
        pasos, tips = parser.parse_pasos_jumbo(
            "1. Marinar\n2. Hornear 40 min\nTips\nServir con limón"
        )

        self.assertEqual(
            pasos,
            [
                {"orden": 1, "texto": "Marinar"},
                {"orden": 2, "texto": "Hornear 40 min"},
            ],
        )
        self.assertEqual(tips, ["Servir con limón"])


class DificultadTests(unittest.TestCase):
    def test_normaliza_dificultades_validas_al_enum(self):
        casos = {
            "Muy fácil": "muy facil",
            "Fácil": "facil",
            "MEDIA": "media",
            "Difícil": "dificil",
            "Absurdamente difícil": "absurdamente dificil",
        }

        for entrada, esperada in casos.items():
            with self.subTest(entrada=entrada):
                self.assertEqual(parser.normalizar_dificultad(entrada), esperada)

    def test_jumbo_desconocida_bloquea_estado_listo(self):
        receta = parser.construir_receta(
            receta_jumbo("Intermedia"), "receta-prueba.docx"
        )

        self.assertIsNone(receta["dificultad"])
        self.assertIn("dificultad", receta["camposFaltantes"])
        self.assertEqual(receta["estado"], "borrador")

    def test_jumbo_valida_normalizada_permite_estado_listo(self):
        receta = parser.construir_receta(
            receta_jumbo("Fácil"), "receta-prueba.docx"
        )

        self.assertEqual(receta["dificultad"], "facil")
        self.assertEqual(receta["camposFaltantes"], ["ingredientes.skuCencosud"])
        self.assertEqual(receta["estado"], "listo-para-cargar")

    def test_formato_simple_aplica_la_misma_validacion(self):
        valida = parser.construir_receta(
            receta_simple("Difícil"), "receta-simple.docx"
        )
        desconocida = parser.construir_receta(
            receta_simple("Intermedia"), "receta-simple.docx"
        )

        self.assertEqual(valida["dificultad"], "dificil")
        self.assertEqual(valida["estado"], "listo-para-cargar")
        self.assertIsNone(desconocida["dificultad"])
        self.assertIn("dificultad", desconocida["camposFaltantes"])
        self.assertEqual(desconocida["estado"], "borrador")


if __name__ == "__main__":
    unittest.main()
