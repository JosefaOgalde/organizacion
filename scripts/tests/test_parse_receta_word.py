import importlib.util
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "parse-receta-word.py"
SPEC = importlib.util.spec_from_file_location("parse_receta_word", SCRIPT)
PARSER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PARSER)


class ParseIngredientesTest(unittest.TestCase):
    def test_unit_prefix_is_not_removed_from_ingredient_name(self):
        ingredientes = PARSER.parse_ingredientes(
            "1 lechuga\n"
            "2 galletas\n"
            "1 litro de leche\n"
            "1 uva"
        )

        self.assertEqual(
            [(i["cantidad"], i["unidad"], i["nombre"]) for i in ingredientes],
            [
                ("1", None, "lechuga"),
                ("2", None, "galletas"),
                ("1", None, "litro de leche"),
                ("1", None, "uva"),
            ],
        )

    def test_supported_units_still_parse_with_or_without_spaces(self):
        ingredientes = PARSER.parse_ingredientes(
            "500g arroz\n"
            "1 l de leche\n"
            "2 unidad huevo\n"
            "3 u. limones"
        )

        self.assertEqual(
            [(i["cantidad"], i["unidad"], i["nombre"]) for i in ingredientes],
            [
                ("500", "g", "arroz"),
                ("1", "l", "leche"),
                ("2", "unidad", "huevo"),
                ("3", "u.", "limones"),
            ],
        )


if __name__ == "__main__":
    unittest.main()
