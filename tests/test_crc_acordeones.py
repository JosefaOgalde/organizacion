import importlib.util
import os
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

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
        self.assertIn(
            "view-manager",
            self.rutas.url_inicio_bm(
                {"CENCOSUD_BM_URL": "https://business-manager.ecomm.cencosud.com/cms/projects"}
            ),
        )
        self.assertTrue(
            self.rutas.url_inicio_bm(
                {
                    "CENCOSUD_BM_URL": (
                        "https://business-manager.ecomm.cencosud.com/cms/projects/"
                        "6597f023fdc664839ccd2a37"
                    )
                }
            ).endswith("view-manager"),
        )
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

    def test_normalizar_dificultad_facil(self):
        self.assertEqual(self.explorar.normalizar_dificultad_bm("fácil"), "Fácil")
        self.assertEqual(self.explorar.normalizar_dificultad_bm("Fácil"), "Fácil")
        self.assertEqual(self.explorar.normalizar_dificultad_bm("facil"), "Fácil")
        self.assertEqual(
            self.explorar.normalizar_dificultad_bm("absolutamente dificil"),
            "Absolutamente difícil",
        )

    def test_linea_ingrediente_completa(self):
        linea = self.explorar.linea_ingrediente(
            {"cantidad": "200", "unidad": "g", "nombre": "choclo"}
        )
        self.assertEqual(linea, "200 g choclo")

    def test_numero_campo_bm_duracion_y_porciones(self):
        self.assertEqual(self.explorar.numero_campo_bm("30 min"), "30")
        self.assertEqual(self.explorar.numero_campo_bm("4 porciones"), "4")
        self.assertEqual(self.explorar.numero_campo_bm("1.2 kg"), "1.2")
        self.assertIsNone(self.explorar.numero_campo_bm(""))
        self.assertIsNone(self.explorar.numero_campo_bm("0"))
        self.assertEqual(self.explorar.duracion_receta({"tiempoTotal": "30 min"}), "30")

    def test_no_rellena_ingredientes_si_sigue_en_cabecera(self):
        class Pagina:
            def evaluate(self, script, *_args):
                if "h1,h2,h3" in str(script):
                    return "Edición de Cabecera | Recetas_Jumbo"
                return ""

        pagina = Pagina()
        self.assertEqual(self.explorar.editor_actual(pagina), "cabecera")
        self.assertFalse(self.explorar.puede_rellenar_editor(pagina, "tags"))
        self.assertFalse(self.explorar.puede_rellenar_editor(pagina, "ingredientes"))
        self.assertTrue(self.explorar.puede_rellenar_editor(pagina, "cabecera"))

    def test_label_titulo_no_confunde_seccion_ni_meta(self):
        self.assertTrue(
            self.explorar.label_coincide_campo("field_titulo", "Título El dato es requerido")
        )
        self.assertFalse(
            self.explorar.label_coincide_campo("field_titulo", "Título de la sección")
        )
        self.assertFalse(self.explorar.label_coincide_campo("field_titulo", "Meta título"))
        self.assertTrue(self.explorar.label_coincide_campo("field_tiempo", "Duración"))

    def test_ingrediente_label_asterisco(self):
        fields = [
            {
                "label": "Ingrediente * El dato es requerido",
                "placeholder": "Dale un valor",
                "selectorSugerido": 'input[placeholder="Dale un valor"]',
                "tag": "input",
                "index": 3,
            }
        ]
        item = {"nombre": "filete de salmón", "cantidad": "600", "unidad": "g"}
        pares = self.explorar.asignar_campos_item(fields, item, "ingredientes")
        self.assertEqual(pares[0][0], "nombre")
        self.assertEqual(pares[0][2], "filete de salmón")
        self.assertEqual(self.explorar.linea_ingrediente(item), "600 g filete de salmón")

    def test_caja_en_lienzo_ignora_paleta_izquierda(self):
        self.assertFalse(self.explorar.caja_en_lienzo({"x": 40, "width": 180, "height": 24}))
        self.assertTrue(self.explorar.caja_en_lienzo({"x": 360, "width": 220, "height": 28}))
        self.assertFalse(self.explorar.caja_en_lienzo(None))

    def test_lista_proyectos_no_es_ficha(self):
        proyectos = "https://business-manager.ecomm.cencosud.com/cms/projects"
        ficha = (
            "https://business-manager.ecomm.cencosud.com/cms/projects/"
            "6597f023fdc664839ccd2a37/view-manager"
        )
        self.assertTrue(self.explorar.es_lista_proyectos_cms(proyectos))
        self.assertFalse(self.explorar.es_lista_proyectos_cms(ficha))
        self.assertTrue(self.explorar.salio_de_la_ficha(proyectos, ficha))
        self.assertFalse(self.explorar.salio_de_la_ficha(ficha, ficha))

        class PaginaFicha:
            url = ficha

        self.assertEqual(
            self.explorar.esperar_ficha_en_lienzo(PaginaFicha(), headed=False),
            ficha,
        )

    def test_opcion_dificultad_no_confunde_muy_facil(self):
        self.assertEqual(
            self.explorar.opcion_dificultad_exacta(
                ["Muy Fácil", "Fácil", "Moderado"], "Fácil"
            ),
            "Fácil",
        )
        self.assertIsNone(
            self.explorar.opcion_dificultad_exacta(["Muy Fácil"], "Fácil")
        )

    def test_js_dificultad_abre_control_no_div_del_label(self):
        js = self.explorar.JS_ABRIR_COMBO_DIFICULTAD
        self.assertNotIn("closest(", js)
        self.assertIn("parentElement", js)
        self.assertIn("elementFromPoint", js)
        self.assertIn("=== wanted", self.explorar.JS_CLICK_OPCION_EXACTA)

    def test_elegir_dificultad_clic_exacto(self):
        class LocatorVacio:
            def count(self):
                return 0

            @property
            def first(self):
                return self

            def select_option(self, **_kwargs):
                raise RuntimeError("sin select")

        class Pagina:
            def __init__(self):
                self.evals = []

            def evaluate(self, script, *args):
                self.evals.append(args)
                if args:
                    return args[0] == "Fácil"
                return {"ok": True, "via": "DIV:combobox"}

            def wait_for_timeout(self, _ms):
                return None

            def locator(self, _sel):
                return LocatorVacio()

        pagina = Pagina()
        self.assertTrue(self.explorar.elegir_dificultad(pagina, "fácil"))
        self.assertEqual(pagina.evals[-1], ("Fácil",))

    def test_ruta_imagen_desde_json_y_desde_docx_bin(self):
        png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 16
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            crc = root / "crc"
            media = crc / "out" / "media" / "salmon"
            media.mkdir(parents=True)
            foto = media / "portada-1.png"
            foto.write_bytes(png)
            with patch.object(self.explorar, "ROOT", root), patch.object(
                self.explorar, "CRC", crc
            ):
                hallada = self.explorar.ruta_imagen_portada(
                    {
                        "id": "salmon",
                        "imagenes": [{"rutaLocal": str(foto.relative_to(root))}],
                    }
                )
                self.assertEqual(hallada, foto)

            docx = root / "Downloads" / "salmon.docx"
            docx.parent.mkdir()
            with zipfile.ZipFile(docx, "w") as zf:
                zf.writestr("word/document.xml", "<w:document/>")
                zf.writestr("word/media/image1.bin", png)
                zf.writestr("word/media/image2.emf", b"\x01\x00\x00\x00" + b"\x00" * 20)
            with patch.object(self.explorar, "ROOT", root), patch.object(
                self.explorar, "CRC", crc
            ):
                extraida = self.explorar.ruta_imagen_portada(
                    {
                        "id": "otra",
                        "fuenteWord": str(docx),
                        "imagenes": [{"rutaLocal": ""}],
                    }
                )
            self.assertIsNotNone(extraida)
            self.assertEqual(extraida.read_bytes()[:8], png[:8])
            self.assertEqual(extraida.suffix, ".png")

    def test_ext_por_magic_y_omitidas_emf(self):
        rutas = self.explorar._RUTAS
        self.assertEqual(rutas.ext_por_magic(b"\xff\xd8\xff\xe0" + b"\x00" * 12), ".jpg")
        self.assertEqual(rutas.ext_por_magic(b"\x89PNG\r\n\x1a\n" + b"\x00" * 8), ".png")
        self.assertIsNone(rutas.ext_por_magic(b"\x01\x00\x00\x00" + b"\x00" * 20))
        with tempfile.TemporaryDirectory() as tmp:
            dest = Path(tmp) / "out"
            docx = Path(tmp) / "a.docx"
            with zipfile.ZipFile(docx, "w") as zf:
                zf.writestr("word/media/dibujo.emf", b"\x01\x00\x00\x00" + b"\x00" * 20)
            omitidas: list[str] = []
            self.assertEqual(rutas.extraer_imagenes_docx(docx, dest, omitidas), [])
            self.assertTrue(any("emf" in o for o in omitidas))


class CrcRutasFotoTests(unittest.TestCase):
    def setUp(self):
        self.rutas = cargar(RUTAS_PATH, "crc_rutas_foto")

    def test_candidatos_docx_incluyen_downloads_y_nombre(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            crc = root / "crc"
            crc.mkdir()
            receta = {
                "id": "salmon-a-la-parrilla-con-salsa-de-palta",
                "fuenteWord": r"C:\Users\Josefa\Downloads\Salmón a la parrilla con salsa de palta.docx",
            }
            cands = self.rutas.candidatos_docx_fuente(receta, root, crc)
            nombres = [p.name for p in cands]
            self.assertIn("Salmón a la parrilla con salsa de palta.docx", nombres)
            self.assertTrue(any("Downloads" in str(p) or "Descargas" in str(p) for p in cands))


if __name__ == "__main__":
    unittest.main()
