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
        self.assertEqual(receta["seo"]["metaDescripcion"], receta["descripcion"])
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

    def test_jumbo_separa_meta_descripcion_de_bajada_editorial_al_ejecutar_parser(self):
        texto = (
            "Meta título:\n"
            "Papas doradas | Recetas Jumbo\n"
            "Meta descripción:\n"
            "Texto breve para buscadores.\n"
            "Descripción:\n"
            "Bajada editorial completa para presentar la receta.\n"
            "Papas doradas\n"
            "35 min | Fácil | 4 porciones\n"
            "Tags: Cena\n"
            "Ingredientes:\n"
            "1 kg papas\n"
            "Paso a paso:\n"
            "Cocinar las papas.\n"
        )
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            src = root / "inbox" / "papas.docx"
            src.parent.mkdir()
            document_xml = (
                '<?xml version="1.0" encoding="UTF-8"?>'
                '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
                "<w:body>"
                + "".join(f"<w:p><w:r><w:t>{line}</w:t></w:r></w:p>" for line in texto.splitlines())
                + "</w:body></w:document>"
            )
            with zipfile.ZipFile(src, "w") as zf:
                zf.writestr("word/document.xml", document_xml)

            with patch.object(self.modulo, "adjuntar_foto_portada"):
                exit_code, _, stderr = self.ejecutar(root, src)
            receta = json.loads((root / "out" / "papas-doradas.json").read_text(encoding="utf-8"))

        self.assertEqual(exit_code, 0, stderr)
        self.assertEqual(
            receta["descripcion"],
            "Bajada editorial completa para presentar la receta.",
        )
        self.assertEqual(receta["seo"]["metaDescripcion"], "Texto breve para buscadores.")

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


if __name__ == "__main__":
    unittest.main()
