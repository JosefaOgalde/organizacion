import contextlib
import importlib.util
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts/parse-receta-word.py"


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
        self.assertEqual(len(receta["pasos"]), 2)
        self.assertEqual(len(receta["tips"]), 2)
        self.assertEqual(receta["estado"], "listo-para-cargar")

    def test_extrae_url_foto_drive_del_docx_salmon(self):
        docx = (
            Path(__file__).resolve().parents[1]
            / "index/clientes/Herramientas/carga-recetas-cencosud/inbox"
            / "Salmon-a-la-parrilla-con-salsa-de-palta.docx"
        )
        if not docx.exists():
            self.skipTest("Falta Word de salmón en inbox")
        url = self.modulo.url_foto_portada(docx)
        self.assertIsNotNone(url)
        self.assertIn("drive.google.com", url)
        texto = self.modulo.texto_desde_docx(docx)
        receta = self.modulo.construir_receta(
            texto,
            "inbox/salmon.docx",
            docx_path=docx,
        )
        self.assertTrue(receta["imagenes"])
        self.assertEqual(receta["imagenes"][0].get("url"), url)


if __name__ == "__main__":
    unittest.main()
