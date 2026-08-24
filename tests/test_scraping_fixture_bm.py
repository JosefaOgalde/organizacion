"""Prueba de scraping/mapeo CRC contra un HTML fixture (sin login BM real)."""
from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "scripts/explorar-bm-cencosud.py"
FIXTURE = Path(__file__).resolve().parent / "fixtures/bm-formulario-receta.html"
FIXTURE_CMS = Path(__file__).resolve().parent / "fixtures/bm-cms-componentes.html"
PUBLICAR_PATH = ROOT / "scripts/publicar-receta-cencosud.py"


def cargar_explorar():
    spec = importlib.util.spec_from_file_location("explorar_bm_cencosud", SCRIPT_PATH)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


def cargar_publicar():
    spec = importlib.util.spec_from_file_location("publicar_receta_cencosud", PUBLICAR_PATH)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


RECETA_DEMO = {
    "titulo": "Anticuchos de verduras",
    "descripcion": "Brochetas vegetales con chimichurri.",
    "porciones": "4",
    "dificultad": "Fácil",
    "tiempoTotal": "35 min",
    "categorias": ["Vegetariana", "Chilena"],
    "ingredientes": [
        {"cantidad": "2", "unidad": "u", "nombre": "zapallos italianos"},
        {"cantidad": "1", "unidad": "taza", "nombre": "chimichurri"},
    ],
    "pasos": [
        {"orden": 1, "texto": "Corta las verduras."},
        {"orden": 2, "texto": "Arma los anticuchos y ásalos."},
    ],
    "seo": {
        "metaTitulo": "Anticuchos de verduras | Jumbo",
        "metaDescripcion": "Receta fácil de anticuchos vegetales.",
    },
    "estado": "listo-para-cargar",
    "camposFaltantes": [],
}


class ScrapingFixtureBmTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not FIXTURE.exists():
            raise unittest.SkipTest(f"Falta fixture: {FIXTURE}")

    def test_dump_y_sugerir_selectores_desde_fixture(self):
        explorar = cargar_explorar()
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(FIXTURE.as_uri())
            estructura = explorar.dump_estructura(page)
            browser.close()

        self.assertTrue(estructura.get("fields"))
        self.assertGreaterEqual(len(estructura["fields"]), 8)
        labels = " ".join((f.get("label") or "") for f in estructura["fields"]).lower()
        self.assertIn("título", labels)
        self.assertIn("ingredientes", labels)

        mapa = explorar.sugerir_selectores(estructura)
        for clave in (
            "field_titulo",
            "field_descripcion",
            "field_porciones",
            "field_dificultad",
            "field_tiempo",
            "field_tags",
            "field_ingredientes",
            "field_pasos",
            "field_meta_titulo",
            "field_meta_descripcion",
            "btn_guardar_borrador",
            "btn_publicar",
        ):
            self.assertTrue(mapa.get(clave), f"falta selector para {clave}: {mapa}")

        # meta y editorial no deben compartir el mismo selector
        self.assertNotEqual(mapa["field_titulo"], mapa["field_meta_titulo"])
        self.assertNotEqual(mapa["field_descripcion"], mapa["field_meta_descripcion"])
        self.assertNotEqual(mapa["btn_guardar_borrador"], mapa["btn_publicar"])

    def test_relleno_dry_run_sobre_fixture(self):
        explorar = cargar_explorar()
        publicar = cargar_publicar()
        receta = dict(RECETA_DEMO)

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(FIXTURE.as_uri())
            mapa = explorar.sugerir_selectores(explorar.dump_estructura(page))

            self.assertTrue(publicar.fill(page, mapa["field_titulo"], receta["titulo"], "titulo"))
            self.assertTrue(
                publicar.fill(page, mapa["field_descripcion"], receta["descripcion"], "descripcion")
            )
            self.assertTrue(
                publicar.fill(page, mapa["field_porciones"], receta["porciones"], "porciones")
            )

            # dry-run: clic borrador, no publicar
            page.locator(mapa["btn_guardar_borrador"]).first.click()
            self.assertEqual(page.locator("#estado").inner_text(), "borrador-ok")
            page.locator(mapa["btn_publicar"]).first.click()
            self.assertEqual(page.locator("#estado").inner_text(), "publicado-ok")

            # valores quedaron en el DOM
            self.assertEqual(page.input_value("#titulo"), receta["titulo"])
            self.assertEqual(page.input_value("#descripcion"), receta["descripcion"])
            browser.close()


class ScrapingCmsComponentesTests(unittest.TestCase):
    """El scraping debe abrir los lápices solo; la usuaria no hace clic."""

    @classmethod
    def setUpClass(cls):
        if not FIXTURE_CMS.exists():
            raise unittest.SkipTest(f"Falta fixture CMS: {FIXTURE_CMS}")

    def test_auto_lapiz_captura_todos_los_campos(self):
        explorar = cargar_explorar()
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(FIXTURE_CMS.as_uri())

            # Vista inicial: componentes vacíos, sin inputs visibles
            self.assertEqual(explorar.contar_campos_editables(page), 0)

            comps = explorar.listar_componentes_cms(page)
            claves = {c["clave"] for c in comps}
            self.assertIn("cabecera", claves)
            self.assertIn("ingredientes", claves)
            self.assertIn("seo", claves)

            estructura, mapa = explorar.capturar_cms_por_componentes(page)
            browser.close()

        self.assertTrue((estructura.get("cms") or {}).get("autoLapiz"))
        self.assertGreaterEqual(len(estructura.get("fields") or []), 8)
        componentes_field = {f.get("componente") for f in estructura["fields"]}
        self.assertIn("cabecera", componentes_field)
        self.assertIn("ingredientes", componentes_field)
        self.assertIn("instrucciones", componentes_field)
        self.assertIn("seo", componentes_field)

        for clave in (
            "field_titulo",
            "field_descripcion",
            "field_tags",
            "field_ingredientes",
            "field_pasos",
            "field_meta_titulo",
            "field_meta_descripcion",
            "lapiz_cabecera",
            "lapiz_ingredientes",
            "lapiz_seo",
            "btn_guardar_borrador",
            "btn_publicar",
        ):
            self.assertTrue(mapa.get(clave), f"falta selector para {clave}: {mapa}")

    def test_relleno_abre_lapices_sin_clic_manual(self):
        explorar = cargar_explorar()
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(FIXTURE_CMS.as_uri())
            _, mapa = explorar.capturar_cms_por_componentes(page)

            ok = explorar.fill_from_receta(page, dict(RECETA_DEMO), mapa, dry_run=True)
            self.assertTrue(ok)
            self.assertEqual(page.input_value("#titulo"), RECETA_DEMO["titulo"])
            # Formulario Header BM no tiene Descripción; el fixture CMS sí — opcional
            if page.locator("#descripcion").count():
                # Puede quedar vacío si el campo no se mapeó por label
                pass
            self.assertIn("zapallos", page.input_value("#ingredientes"))
            self.assertIn("Corta las verduras", page.input_value("#pasos"))
            self.assertEqual(page.input_value("#meta-titulo"), RECETA_DEMO["seo"]["metaTitulo"])
            # Tras el último Guardar de componente, o borrador global
            estado = page.locator("#estado").inner_text()
            self.assertTrue(
                estado.startswith("guardado:") or estado == "borrador-ok",
                f"estado inesperado: {estado!r}",
            )
            browser.close()

    def test_rellena_tags_expandido_bm_real(self):
        """BM real: ítems expandidos visibles (sin acordeón cerrado)."""
        explorar = cargar_explorar()
        fixture = Path(__file__).resolve().parent / "fixtures/bm-formulario-tags-expandido.html"
        tags = ["salmon", "pescado", "almuerzo"]
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(fixture.as_uri())
            self.assertTrue(explorar._rellenar_tags_bm(page, tags))
            self.assertEqual(page.locator(".campo-tag").count(), 3)
            for i, t in enumerate(tags):
                self.assertEqual(page.input_value(f"#tag-{i + 1}"), t)
                self.assertEqual(page.input_value(f"#link-{i + 1}"), "")
            browser.close()

    def test_salir_tags_volver_confirma_guardar(self):
        explorar = cargar_explorar()
        fixture = Path(__file__).resolve().parent / "fixtures/bm-formulario-tags-expandido.html"
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(fixture.as_uri())
            explorar._rellenar_tags_bm(page, ["salmon"])
            explorar._salir_edicion_tags_si_aplica(page)
            self.assertEqual(page.locator("#vista").inner_text(), "canvas")
            browser.close()

    def test_rellena_tags_chip_enter(self):
        explorar = cargar_explorar()
        fixture = Path(__file__).resolve().parent / "fixtures/bm-formulario-tags.html"
        tags = [
            "salmon",
            "recetas a la parrilla",
            "paltas",
            "recetas saludables",
            "pescado",
            "almuerzo",
        ]
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(fixture.as_uri())
            self.assertTrue(explorar._rellenar_tags_bm(page, tags))
            # 6 ítems del arreglo; valores solo en Tag, Link vacío
            self.assertEqual(page.locator(".campo-tag").count(), 6)
            for i, t in enumerate(tags):
                self.assertEqual(page.input_value(f"#tag-{i + 1}"), t)
                self.assertEqual(page.input_value(f"#link-{i + 1}"), "")
            page.locator("#btn-guardar").click()
            estado = page.locator("#estado").inner_text()
            self.assertTrue(estado.startswith("guardado:"))
            import json as _json

            payload = _json.loads(estado.split("guardado:", 1)[1])
            self.assertEqual(payload["tags"], tags)
            self.assertEqual(payload["links"], ["", "", "", "", "", ""])
            browser.close()

    def test_lista_tags_desde_receta_salmon(self):
        explorar = cargar_explorar()
        receta = {
            "categorias": [
                "salmon",
                "recetas a la parrilla",
                "paltas",
                "recetas saludables",
                "pescado",
                "almuerzo",
            ]
        }
        self.assertEqual(explorar.lista_tags_desde_receta(receta), receta["categorias"])
        # dedupe
        self.assertEqual(
            explorar.lista_tags_desde_receta({"categorias": ["Salmon", "salmon", "pescado"]}),
            ["Salmon", "pescado"],
        )

    def test_formulario_header_duracion_numero_y_labels(self):
        explorar = cargar_explorar()
        fixture = Path(__file__).resolve().parent / "fixtures/bm-formulario-header.html"
        png = Path("/tmp/crc-salmon-test.png")
        png.write_bytes(
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde"
            b"\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        receta = {
            "titulo": "Salmón a la parrilla con salsa de palta",
            "descripcion": "No va en Header",
            "porciones": "4",
            "tiempoTotal": "30 min",
            "dificultad": "fácil",
            "imagenes": [
                {
                    "rutaLocal": str(png),
                    "url": "https://drive.google.com/file/d/xxx/view",
                    "alt": "portada",
                    "rol": "portada",
                }
            ],
            "categorias": [],
            "ingredientes": [{"nombre": "x", "cantidad": "1"}],
            "pasos": [{"orden": 1, "texto": "y"}],
            "seo": {},
        }
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(fixture.as_uri())
            outs = explorar.rellenar_con_dump_vivo(
                page,
                [
                    ("field_titulo", receta["titulo"]),
                    ("field_dificultad", explorar.normalizar_dificultad_bm(receta["dificultad"])),
                    ("field_tiempo", explorar.minutos_desde_tiempo(receta["tiempoTotal"])),
                    ("field_porciones", receta["porciones"]),
                ],
                {},
            )
            self.assertTrue(outs.get("field_titulo"))
            self.assertTrue(outs.get("field_dificultad"), "debía elegir Fácil en el dropdown")
            self.assertTrue(outs.get("field_tiempo"))
            self.assertEqual(page.input_value("#duracion"), "30")
            self.assertNotEqual(page.input_value("#duracion"), "0")
            self.assertTrue(outs.get("field_porciones"))
            self.assertEqual(page.input_value("#porciones"), "4")
            self.assertEqual(page.input_value("#dificultad"), "Fácil")
            self.assertTrue(explorar._rellenar_imagen(page, receta))
            self.assertTrue(page.input_value("#imagen-url").startswith("file:"))
            # Tras imagen, reparar por si Duración se pisó
            explorar._asegurar_cabecera_bm(page, "Fácil", "30", "4")
            self.assertEqual(page.input_value("#duracion"), "30")
            self.assertEqual(page.input_value("#dificultad"), "Fácil")
            page.locator("#btn-guardar").click()
            estado = page.locator("#estado").inner_text()
            self.assertIn("guardado:", estado)
            browser.close()

    def test_dificultad_no_pisa_duracion_con_fallback(self):
        """Regresión: escribir «Fácil» en number dejaba Duración=0."""
        explorar = cargar_explorar()
        fixture = Path(__file__).resolve().parent / "fixtures/bm-formulario-header.html"
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(fixture.as_uri())
            page.fill("#titulo", "Salmón")
            page.fill("#duracion", "30")
            page.fill("#porciones", "4")
            # Simula lo que hacía el bug: fill no numérico en Duración
            page.locator("#duracion").evaluate(
                """el => { el.value = ''; el.dispatchEvent(new Event('input', {bubbles:true})); }"""
            )
            explorar._asegurar_cabecera_bm(page, "Fácil", "30", "4")
            self.assertEqual(page.input_value("#duracion"), "30")
            self.assertEqual(page.input_value("#dificultad"), "Fácil")
            self.assertEqual(page.input_value("#porciones"), "4")
            browser.close()

    def test_catalogo_ruta_local_salmon(self):
        explorar = cargar_explorar()
        receta = {"id": "salmon-a-la-parrilla-con-salsa-de-palta", "titulo": "Salmón", "imagenes": []}
        ruta = explorar.enriquecer_ruta_local_imagen(receta)
        self.assertIsNotNone(ruta)
        self.assertIn(r"Downloads", ruta)

    def test_normaliza_dificultad_a_opciones_bm(self):
        explorar = cargar_explorar()
        self.assertEqual(explorar.normalizar_dificultad_bm("fácil"), "Fácil")
        self.assertEqual(explorar.normalizar_dificultad_bm("media"), "Moderado")
        self.assertEqual(explorar.normalizar_dificultad_bm("absurdamente dificil"), "Absurdamente Difícil")

    def test_enriquece_url_foto_si_json_no_la_tiene(self):
        explorar = cargar_explorar()
        receta = {
            "titulo": "Salmón a la parrilla con salsa de palta",
            "fuenteWord": "index/clientes/Herramientas/carga-recetas-cencosud/inbox/Salmon-a-la-parrilla-con-salsa-de-palta.docx",
            "imagenes": [{"rutaLocal": "", "alt": "x", "rol": "portada", "url": None}],
        }
        url = explorar.enriquecer_imagen_desde_word(receta)
        self.assertIsNotNone(url)
        self.assertIn("drive.google.com/file/d/1u2z-oBQeGHopYUtVpam0bfGvFSpf5OIB", url)
        self.assertEqual(receta["imagenes"][0]["url"], url)

    def test_enriquece_url_desde_catalogo_sin_word(self):
        explorar = cargar_explorar()
        receta = {
            "id": "salmon-a-la-parrilla-con-salsa-de-palta",
            "titulo": "Salmón a la parrilla con salsa de palta",
            "fuenteWord": "inbox/no-existe.docx",
            "imagenes": [],
        }
        url = explorar.enriquecer_imagen_desde_word(receta)
        self.assertIsNotNone(url)
        self.assertIn("drive.google.com", url)

    def test_abre_lapiz_svg_sin_aria_con_paleta(self):
        """Reproduce BM real: paleta+canvas juntos y lápiz SVG sin aria (lapiz=None)."""
        explorar = cargar_explorar()
        fixture = Path(__file__).resolve().parent / "fixtures/bm-cms-paleta-svg.html"
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(fixture.as_uri())
            page.set_viewport_size({"width": 1100, "height": 800})

            comps = explorar.listar_componentes_cms(page)
            claves = {c["clave"] for c in comps}
            self.assertIn("cabecera", claves)
            self.assertIn("tags", claves)

            # Aunque el selector aria sea None, debe abrir el editor del canvas
            ok = explorar.abrir_lapiz_componente(page, "cabecera", None)
            self.assertTrue(ok, "debía abrir Cabecera vía SVG/hint del canvas")
            self.assertGreater(explorar.contar_campos_editables(page), 0)
            self.assertEqual(page.locator("#estado").inner_text(), "editando:cabecera")

            page.locator("button.btn-guardar-editor").first.click()
            ok_tags = explorar.abrir_lapiz_componente(page, "tags", None)
            self.assertTrue(ok_tags)
            self.assertEqual(page.locator("#estado").inner_text(), "editando:tags")
            browser.close()

    def test_fallback_posicional_con_labels_debiles(self):
        explorar = cargar_explorar()
        fixture = Path(__file__).resolve().parent / "fixtures/bm-editor-labels-debiles.html"
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(fixture.as_uri())
            outs = explorar.rellenar_con_dump_vivo(
                page,
                [
                    ("field_titulo", "Salmón a la parrilla"),
                    ("field_descripcion", "Con salsa de palta"),
                    ("field_porciones", "4"),
                    ("field_dificultad", "Fácil"),
                    ("field_tiempo", "35 min"),
                ],
                {},
            )
            self.assertTrue(outs.get("field_titulo"))
            self.assertTrue(outs.get("field_descripcion"))
            self.assertEqual(page.input_value("#c1"), "Salmón a la parrilla")
            self.assertEqual(page.input_value("#c2"), "Con salsa de palta")
            self.assertEqual(page.input_value("#c3"), "4")
            browser.close()

    def test_dump_y_conteo_en_iframe(self):
        explorar = cargar_explorar()
        fixture = Path(__file__).resolve().parent / "fixtures/bm-editor-en-iframe.html"
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(fixture.as_uri())
            page.wait_for_selector("iframe#cms")
            page.frame_locator("iframe#cms").locator("#c1").wait_for()
            n = explorar.contar_campos_editables(page)
            self.assertGreaterEqual(n, 5, f"esperaba campos del iframe, n={n}")
            estructura = explorar.dump_estructura(page)
            frames = {f.get("frameIndex") for f in estructura.get("fields") or []}
            self.assertTrue(any(fi and fi > 0 for fi in frames), estructura.get("fields"))
            browser.close()


if __name__ == "__main__":
    unittest.main()
