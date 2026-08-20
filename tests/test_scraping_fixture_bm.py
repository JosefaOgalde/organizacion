"""Prueba de scraping/mapeo CRC contra un HTML fixture (sin login BM real)."""
from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "scripts/explorar-bm-cencosud.py"
FIXTURE = Path(__file__).resolve().parent / "fixtures/bm-formulario-receta.html"
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
        receta = {
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


if __name__ == "__main__":
    unittest.main()
