import contextlib
import importlib.util
import io
import json
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "scripts/parse-receta-word.py"
SCHEMA_PATH = ROOT / "index/clientes/Herramientas/carga-recetas-cencosud/schema-receta.json"


def cargar_modulo():
    spec = importlib.util.spec_from_file_location("parse_receta_word", SCRIPT_PATH)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


class ParseRecetaWordTests(unittest.TestCase):
    TEXTO = (
        "Título: Receta segura\n"
        "Descripción: Una receta de prueba\n"
        "Porciones: 4\n"
        "Dificultad: fácil\n"
        "Categorías: Cena\n"
        "Ingredientes:\n"
        "- 1 kg papas\n"
        "Pasos:\n"
        "1. Cocinar las papas"
    )

    def setUp(self):
        self.modulo = cargar_modulo()

    def ejecutar(self, root: Path, src: Path, *args: str):
        stdout = io.StringIO()
        stderr = io.StringIO()
        argv = ["parse-receta-word.py", str(src), *args]
        with (
            patch.object(self.modulo, "ROOT", root),
            patch.object(self.modulo, "OUT_DIR", root / "out"),
            patch.object(sys, "argv", argv),
            contextlib.redirect_stdout(stdout),
            contextlib.redirect_stderr(stderr),
        ):
            exit_code = self.modulo.main()
        return exit_code, stdout.getvalue(), stderr.getvalue()

    def preparar_fuente(self, root: Path) -> Path:
        src = root / "inbox" / "receta.txt"
        src.parent.mkdir()
        src.write_text(self.TEXTO, encoding="utf-8")
        return src

    def editar_salidas(self, root: Path):
        json_path = root / "out" / "receta-segura.json"
        raw_path = root / "out" / "receta-segura.raw.txt"
        receta = json.loads(json_path.read_text(encoding="utf-8"))
        receta["ingredientes"][0]["skuCencosud"] = "SKU-MANUAL-001"
        receta["camposFaltantes"] = []
        receta["estado"] = "cargado"
        json_path.write_text(
            json.dumps(receta, ensure_ascii=False, indent=4) + "\n",
            encoding="utf-8",
        )
        raw_path.write_text(
            raw_path.read_text(encoding="utf-8") + "EDICION MANUAL RAW\n",
            encoding="utf-8",
        )
        return json_path, raw_path

    def test_segundo_parse_sin_force_preserva_json_y_raw_exactamente(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            src = self.preparar_fuente(root)
            first_code, _, _ = self.ejecutar(root, src)
            json_path, raw_path = self.editar_salidas(root)
            expected_json = json_path.read_bytes()
            expected_raw = raw_path.read_bytes()

            second_code, _, stderr = self.ejecutar(root, src)

            self.assertEqual(first_code, 0)
            self.assertEqual(second_code, 3)
            self.assertEqual(json_path.read_bytes(), expected_json)
            self.assertEqual(raw_path.read_bytes(), expected_raw)
            self.assertIn("--force", stderr)
            self.assertIn("No se escribió ningún archivo", stderr)

    def test_force_reemplaza_json_y_raw(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            src = self.preparar_fuente(root)
            first_code, _, _ = self.ejecutar(root, src)
            json_path, raw_path = self.editar_salidas(root)
            edited_json = json_path.read_bytes()
            edited_raw = raw_path.read_bytes()

            force_code, _, _ = self.ejecutar(root, src, "--force")
            reemplazada = json.loads(json_path.read_text(encoding="utf-8"))

            self.assertEqual(first_code, 0)
            self.assertEqual(force_code, 0)
            self.assertNotEqual(json_path.read_bytes(), edited_json)
            self.assertNotEqual(raw_path.read_bytes(), edited_raw)
            self.assertIsNone(reemplazada["ingredientes"][0]["skuCencosud"])
            self.assertEqual(reemplazada["estado"], "listo-para-cargar")
            self.assertEqual(raw_path.read_text(encoding="utf-8"), self.TEXTO + "\n")

    def test_no_elimina_archivo_meta_titulo_no_relacionado(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            src = self.preparar_fuente(root)
            out_dir = root / "out"
            out_dir.mkdir()
            ajeno = out_dir / "meta-titulo.manual"
            contenido = b"contenido ajeno exacto\x00"
            ajeno.write_bytes(contenido)

            exit_code, _, _ = self.ejecutar(root, src)

            self.assertEqual(exit_code, 0)
            self.assertEqual(ajeno.read_bytes(), contenido)

    def test_help_documenta_force_destructivo_con_ejemplos(self):
        stdout = io.StringIO()
        argv = ["parse-receta-word.py", "--help"]
        with (
            patch.object(sys, "argv", argv),
            contextlib.redirect_stdout(stdout),
            self.assertRaises(SystemExit) as raised,
        ):
            self.modulo.main()

        help_text = stdout.getvalue()
        self.assertEqual(raised.exception.code, 0)
        self.assertIn("Ejemplos:", help_text)
        self.assertIn("--force", help_text)
        self.assertIn("destructiva", help_text)

    def test_jumbo_descripcion_sin_prefijo_meta_y_limon_y_consejos(self):
        texto = (
            "Meta título:\n"
            "Salmón a la parrilla con salsa de palta | Recetas Jumbo\n"
            "descripción:\n"
            "Prepara salmón a la parrilla con una salsa de palta cremosa y limón.\n"
            "Salmón a la parrilla con salsa de palta\n"
            "([Foto])\n"
            "Texto alt: Filete de salmón.\n"
            "30 min | Fácil | 4 porciones\n"
            "Tags: salmon, paltas\n"
            "Ingredientes:\n"
            "600 g de filete de salmón\n"
            "1 limón\n"
            "¿Cómo preparar salmón a la parrilla con salsa de palta?\n"
            "Paso a paso:\n"
            "Sazona el salmón: seca los filetes.\n"
            "Cocina el salmón: ásalo 4 minutos.\n"
            "Consejos para un salmón a la parrilla con salsa perfecto\n"
            "Cocina el salmón por el lado de la piel.\n"
            "Prepara la salsa justo antes de servir.\n"
        )
        lines = texto.splitlines()
        self.assertTrue(self.modulo.es_formato_jumbo(lines))
        receta = self.modulo.construir_receta_jumbo(lines, texto, "inbox/salmon.docx")
        self.assertEqual(receta["titulo"], "Salmón a la parrilla con salsa de palta")
        self.assertTrue(receta["descripcion"].startswith("Prepara salmón"))
        limon = next(i for i in receta["ingredientes"] if "lim" in (i["nombre"] or "").lower())
        self.assertEqual(limon["nombre"], "limón")
        self.assertIsNone(limon["unidad"])
        salmon = next(i for i in receta["ingredientes"] if "salm" in (i["nombre"] or "").lower())
        self.assertEqual(salmon["linea"], "600 g de filete de salmón")
        self.assertEqual(salmon["unidad"], "g")
        self.assertEqual(len(receta["pasos"]), 2)
        self.assertEqual(len(receta["tips"]), 2)
        self.assertEqual(
            receta["tipsTitulo"],
            "Consejos para un salmón a la parrilla con salsa perfecto",
        )
        self.assertEqual(receta["dificultad"], "facil")
        self.assertEqual(receta["estado"], "listo-para-cargar")
        self.assertEqual(
            self.modulo.parse_lista_csv(
                "salmon, recetas a la parrilla, paltas, recetas saludables, pescado, almuerzo"
            ),
            [
                "salmon",
                "recetas a la parrilla",
                "paltas",
                "recetas saludables",
                "pescado",
                "almuerzo",
            ],
        )

    def test_extrae_png_aunque_el_word_la_guarde_como_bin(self):
        png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 16
        with tempfile.TemporaryDirectory() as tmp:
            dest = Path(tmp) / "media"
            docx = Path(tmp) / "receta.docx"
            with zipfile.ZipFile(docx, "w") as zf:
                zf.writestr("word/document.xml", "<w:document/>")
                zf.writestr("word/media/image1.bin", png)
                zf.writestr("word/media/ole.emf", b"\x01\x00\x00\x00" + b"\x00" * 12)
            omitidas: list[str] = []
            guardadas = self.modulo.extraer_imagenes_docx(docx, dest, omitidas)
            self.assertEqual(len(guardadas), 1)
            self.assertEqual(guardadas[0].suffix, ".png")
            self.assertEqual(guardadas[0].read_bytes()[:8], png[:8])
            self.assertTrue(any("emf" in o for o in omitidas))

    def test_adjuntar_foto_usa_enlace_celeste(self):
        jpeg = b"\xff\xd8\xff\xe0" + b"\x00" * 20
        receta = {
            "id": "salmon",
            "imagenes": [{"rutaLocal": "", "alt": "Filete de salmón."}],
        }
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            docx = root / "receta.docx"
            doc = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:hyperlink r:id="rId5"><w:r><w:t>Foto</w:t></w:r></w:hyperlink>
    </w:p>
  </w:body>
</w:document>"""
            rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId5"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink"
    Target="https://cdn.ejemplo.cl/salmon.jpg" TargetMode="External"/>
</Relationships>"""
            with zipfile.ZipFile(docx, "w") as zf:
                zf.writestr("word/document.xml", doc)
                zf.writestr("word/_rels/document.xml.rels", rels)
            media = root / "media"

            def fake_dl(url, dest_dir, stem="portada-enlace", **_kwargs):
                dest_dir.mkdir(parents=True, exist_ok=True)
                out = dest_dir / f"{stem}.jpg"
                out.write_bytes(jpeg)
                return out

            with patch.object(self.modulo, "ROOT", root), patch.object(
                self.modulo._RUTAS, "descargar_imagen_url", fake_dl
            ):
                self.modulo.adjuntar_foto_portada(receta, docx, media)
            self.assertTrue(receta["imagenes"][0]["rutaLocal"].endswith("portada-enlace.jpg"))
            self.assertEqual(receta["imagenes"][0]["urlFuente"], "https://cdn.ejemplo.cl/salmon.jpg")
            self.assertEqual(receta["imagenes"][0]["textoEnlace"], "Foto")

    def test_titulo_de_la_seccion_tips_no_se_guarda_como_tip(self):
        bloque = (
            "Arma las brochetas y ásalas.\n"
            "Tips para unos anticuchos de verduras perfectos\n"
            "Remoja los palos de madera 30 minutos.\n"
            "Prefiere verduras firmes.\n"
        )
        pasos, tips, tips_titulo = self.modulo.parse_pasos_jumbo(bloque)

        self.assertEqual(len(pasos), 1)
        self.assertEqual(tips_titulo, "Tips para unos anticuchos de verduras perfectos")
        self.assertEqual(
            tips,
            ["Remoja los palos de madera 30 minutos.", "Prefiere verduras firmes."],
        )

    def test_tip_en_la_misma_linea_del_encabezado_si_hay_dos_puntos(self):
        _, tips, tips_titulo = self.modulo.parse_pasos_jumbo("Tip: deja reposar el chimichurri.\n")

        self.assertEqual(tips, ["deja reposar el chimichurri."])
        self.assertEqual(tips_titulo, "")

    def test_dificultad_usa_el_enum_sin_tildes_del_schema(self):
        texto_jumbo = (
            "Meta título:\n"
            "Papas al horno | Recetas Jumbo\n"
            "Papas al horno\n"
            "35 min | Fácil | 4 porciones\n"
            "Tags: Cena\n"
            "Ingredientes:\n"
            "1 kg papas\n"
            "Paso a paso:\n"
            "Cocinar las papas.\n"
        )
        enum_schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))["properties"]["dificultad"]["enum"]

        jumbo = self.modulo.construir_receta_jumbo(
            texto_jumbo.splitlines(), texto_jumbo, "inbox/papas.docx"
        )

        self.assertEqual(jumbo["dificultad"], "facil")
        self.assertIn(jumbo["dificultad"], enum_schema)


    def test_maremoto_jumbo_reconstruido(self):
        texto = (
            "Meta título:\n"
            "Maremoto | Recetas Jumbo\n"
            "Meta descripción:\n"
            "Prepara un maremoto chileno con vino pipeño, helado de piña y licor de menta. "
            "Un trago dulce y refrescante, ideal para las Fiestas Patrias.\n"
            "Maremoto\n"
            'Foto: "C:\\Users\\josef\\Downloads\\Maremoto.png"\n'
            "Texto alt: Vaso largo de maremoto, sobre una mesa de madera.\n"
            "10 min | Fácil | 4 porciones\n"
            "Tags: trago chileno, vino pipeño, helado de piña, fiestas patrias, recetas para el 18, vino\n"
            "Ingredientes:\n"
            "● 750 ml de vino pipeño\n"
            "● 400 g de helado de piña\n"
            "● 60 ml de licor de menta\n"
            "● Hielo a gusto\n"
            "¿Cómo preparar maremoto?\n"
            "Enfría los ingredientes: Mantén el vino (url: "
            "https://www.jumbo.cl/licores-bebidas-y-aguas/vinos) pipeño bien frío.\n"
            "Agrega el helado: Coloca una generosa bola de helado (url: "
            "https://www.jumbo.cl/lacteos-huevos-y-congelados/helados-y-postres) de piña.\n"
            "Vierte el pipeño: Agrega el vino pipeño bien frío.\n"
            "Termina con la menta: Añade un chorrito de licor (url: "
            "https://www.jumbo.cl/licores-bebidas-y-aguas/licores-y-spritz) de menta.\n"
            "Así queda mucho mejor\n"
            "● Usa un pipeño bien frío para que el helado se mantenga firme.\n"
            "● Agrega solo un chorrito de licor de menta.\n"
            "● Disfrútalo apenas esté listo.\n"
        )
        receta = self.modulo.construir_receta(texto, "inbox/Maremoto.pdf")
        self.assertEqual(receta["titulo"], "Maremoto")
        self.assertTrue(receta["descripcion"].startswith("Prepara un maremoto"))
        self.assertEqual(receta["porciones"], "4")
        self.assertEqual(receta["tiempoTotal"], "10 min")
        self.assertEqual(receta["dificultad"], "facil")
        self.assertEqual(receta["estado"], "listo-para-cargar")
        self.assertEqual(len(receta["ingredientes"]), 4)
        pipeño = receta["ingredientes"][0]
        self.assertEqual(pipeño["cantidad"], "750")
        self.assertEqual(pipeño["unidad"], "ml")
        self.assertIn("pipeño", pipeño["nombre"])
        self.assertEqual(len(receta["pasos"]), 4)
        self.assertNotIn("url:", receta["pasos"][0]["texto"].lower())
        self.assertNotIn("http", receta["pasos"][0]["texto"].lower())
        self.assertIn("vino pipeño", receta["pasos"][0]["texto"])
        self.assertEqual(receta["tipsTitulo"], "Así queda mucho mejor")
        self.assertEqual(len(receta["tips"]), 3)
        self.assertEqual(receta["preguntaPreparacion"], "¿Cómo preparar maremoto?")
        self.assertEqual(receta["formatoOrigen"], "jumbo-pdf")
        self.assertTrue(any("jumbo.cl" in u for u in receta["enlacesProductos"]))
        self.assertIn("Maremoto.png", receta["imagenes"][0]["rutaOrigen"])
        enlaces_p1 = receta["pasos"][0].get("enlaces") or []
        self.assertTrue(any("vinos" in (e.get("url") or "") for e in enlaces_p1))
        self.assertTrue(
            any("vino" in (e.get("texto") or "").lower() for e in enlaces_p1)
        )
        enlaces_p2 = receta["pasos"][1].get("enlaces") or []
        self.assertTrue(any("helado" in (e.get("url") or "") for e in enlaces_p2))
        enlaces_p4 = receta["pasos"][3].get("enlaces") or []
        self.assertTrue(any("licor" in (e.get("url") or "") for e in enlaces_p4))

    def test_unir_fragmentos_pdf_urls_y_pasos(self):
        paras = [
            ("Span", "Enfría los ingredientes: Mantén el"),
            ("Span", "vino"),
            ("Span", "(url:"),
            ("Span", "https://www.jumbo.cl/licores-bebidas-y-aguas/vinos"),
            ("Span", ") pipeño bien frío en el refrigerador."),
            ("Span", "Agrega el helado: Coloca una bola de helado."),
            ("H2", "Así queda mucho mejor"),
            ("LI", "●"),
            (None, "Usa un pipeño bien frío."),
        ]
        texto = self.modulo.reconstruir_texto_pdf(paras)
        self.assertIn("vino (url:https://www.jumbo.cl/licores-bebidas-y-aguas/vinos) pipeño", texto)
        self.assertIn("Así queda mucho mejor", texto)
        pasos, tips, tips_titulo = self.modulo.parse_pasos_jumbo(texto)
        self.assertEqual(len(pasos), 2)
        self.assertIn("vino pipeño", pasos[0]["texto"])
        self.assertNotIn("http", pasos[0]["texto"].lower())
        self.assertEqual(tips_titulo, "Así queda mucho mejor")
        self.assertEqual(tips, ["Usa un pipeño bien frío."])

    def test_texto_desde_pdf_maremoto_si_hay_fixture(self):
        fixture = ROOT / "tests/fixtures/crc/Maremoto.pdf"
        inbox = ROOT / "index/clientes/Herramientas/carga-recetas-cencosud/inbox/Maremoto.pdf"
        src = fixture if fixture.exists() else inbox
        if not src.exists():
            self.skipTest("No hay Maremoto.pdf de prueba")
        texto = self.modulo.texto_desde_pdf(src)
        receta = self.modulo.construir_receta(texto, str(src))
        self.assertIn("Meta título", texto)
        self.assertEqual(receta["titulo"], "Maremoto")
        self.assertGreaterEqual(len(receta["ingredientes"]), 4)
        self.assertGreaterEqual(len(receta["pasos"]), 4)
        self.assertEqual(receta["tipsTitulo"], "Así queda mucho mejor")
        self.assertEqual(receta["estado"], "listo-para-cargar")


if __name__ == "__main__":
    unittest.main()

