import importlib.util
import os
import tempfile
import unittest
from pathlib import Path

RUTAS_PATH = Path(__file__).resolve().parents[1] / "scripts/crc_rutas.py"
EXPLORAR_PATH = Path(__file__).resolve().parents[1] / "scripts/explorar-bm-cencosud.py"


def cargar(path, nombre):
    spec = importlib.util.spec_from_file_location(nombre, path)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


class CrcRutasTests(unittest.TestCase):
    def setUp(self):
        self.rutas = cargar(RUTAS_PATH, "crc_rutas_test")

    def test_prefiere_implementacion_recetas_jumbo(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            jumbo = root / "index/clientes/Herramientas/implementacion-recetas-jumbo"
            viejo = root / "index/clientes/Herramientas/carga-recetas-cencosud"
            jumbo.mkdir(parents=True)
            viejo.mkdir(parents=True)
            self.assertEqual(self.rutas.resolver_crc(root), jumbo)

    def test_usa_secret_singular_si_existe(self):
        with tempfile.TemporaryDirectory() as tmp:
            crc = Path(tmp) / "crc"
            (crc / "secret").mkdir(parents=True)
            self.assertEqual(self.rutas.resolver_secrets(crc), crc / "secret")

    def test_url_inicio_usa_gestor_de_recetas(self):
        self.assertIn("view-manager", self.rutas.url_inicio_bm({}))
        self.assertIn(
            "view-manager",
            self.rutas.url_inicio_bm({"CENCOSUD_BM_URL": "https://business-manager.ecomm.cencosud.com/"}),
        )
        custom = "https://business-manager.ecomm.cencosud.com/cms/otra"
        self.assertEqual(self.rutas.url_inicio_bm({"CENCOSUD_BM_URL": custom}), custom)
        with tempfile.TemporaryDirectory() as tmp:
            crc = Path(tmp)
            out = crc / "out"
            out.mkdir()
            viejo = out / "a.json"
            nuevo = out / "b.json"
            viejo.write_text("{}", encoding="utf-8")
            nuevo.write_text("{}", encoding="utf-8")
            os.utime(viejo, (1, 1))
            os.utime(nuevo, (100, 100))
            self.assertEqual(self.rutas.json_mas_reciente(crc), nuevo)


class AsignarCamposAcordeonTests(unittest.TestCase):
    def setUp(self):
        self.explorar = cargar(EXPLORAR_PATH, "explorar_bm_acordeon")

    def test_ingrediente_por_label(self):
        fields = [
            {"label": "Nombre", "selectorSugerido": "#n", "tag": "input"},
            {"label": "Cantidad", "selectorSugerido": "#c", "tag": "input", "type": "text"},
            {"label": "Unidad", "selectorSugerido": "#u", "tag": "input"},
        ]
        item = {"nombre": "limón", "cantidad": "1", "unidad": "unidad"}
        pares = self.explorar.asignar_campos_item(fields, item, "ingredientes")
        self.assertEqual(
            pares,
            [
                ("nombre", "#n", "limón"),
                ("cantidad", "#c", "1"),
                ("unidad", "#u", "unidad"),
            ],
        )

    def test_placeholder_generico_dale_un_valor(self):
        fields = [
            {"placeholder": "Dale un valor", "selectorSugerido": "#a", "tag": "input"},
            {"placeholder": "Dale un valor", "selectorSugerido": "#b", "tag": "input"},
            {"placeholder": "Dale un valor", "selectorSugerido": "#c", "tag": "input"},
        ]
        item = {"nombre": "aceite", "cantidad": "2", "unidad": "cdas"}
        pares = self.explorar.asignar_campos_item(fields, item, "ingredientes")
        roles = [p[0] for p in pares]
        self.assertEqual(roles, ["nombre", "cantidad", "unidad"])
        self.assertEqual([p[2] for p in pares], ["aceite", "2", "cdas"])

    def test_paso_textarea(self):
        fields = [
            {"label": "Instrucción", "tag": "textarea", "selectorSugerido": "#paso"},
        ]
        item = {"orden": 1, "texto": "Mezclar el chimichurri."}
        pares = self.explorar.asignar_campos_item(fields, item, "instrucciones")
        self.assertEqual(pares, [("texto", "#paso", "Mezclar el chimichurri.")])

    def test_linea_ingrediente_completa(self):
        linea = self.explorar.linea_ingrediente(
            {"cantidad": "200", "unidad": "g", "nombre": "choclo"}
        )
        self.assertEqual(linea, "200 g choclo")


if __name__ == "__main__":
    unittest.main()
