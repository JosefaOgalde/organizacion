"""El lienzo del Gestor es un iframe: los bloques deben detectarse ahí dentro."""
from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "scripts/explorar-bm-cencosud.py"
FIXTURE = Path(__file__).resolve().parent / "fixtures/bm-gestor-iframe.html"


def cargar_explorar():
    spec = importlib.util.spec_from_file_location("explorar_bm_cencosud", SCRIPT_PATH)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


class BloquesEnIframeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not FIXTURE.exists():
            raise unittest.SkipTest(f"Falta fixture: {FIXTURE}")

    def test_detecta_los_cinco_bloques_dentro_del_iframe(self):
        explorar = cargar_explorar()
        with sync_playwright() as p:
            navegador = p.chromium.launch(headless=True)
            page = navegador.new_page()
            page.goto(FIXTURE.as_uri())
            page.wait_for_selector("#lienzo")

            solo_principal = page.evaluate(
                explorar.JS_LISTAR_COMPONENTES,
                {
                    "aliasesFlat": [
                        {"clave": c["clave"], "alias": a}
                        for c in explorar.COMPONENTES_CMS
                        for a in c["aliases"]
                    ],
                    "filtrarPaleta": True,
                },
            )
            componentes = explorar.listar_componentes_cms(page)
            navegador.close()

        # Mirando solo el documento principal no hay bloques: la paleta queda fuera
        # por el filtro de los 240px y el lienzo vive en el iframe.
        self.assertEqual(solo_principal, [])

        claves = {c["clave"] for c in componentes}
        self.assertEqual(
            claves,
            {"cabecera", "tags", "ingredientes", "instrucciones", "seo"},
        )
        for comp in componentes:
            self.assertTrue(comp["tieneLapiz"], f"sin lápiz: {comp}")
            self.assertIn("bm-gestor-lienzo.html", comp["frameUrl"] or "")

    def test_cuenta_campos_editables_del_iframe(self):
        explorar = cargar_explorar()
        with sync_playwright() as p:
            navegador = p.chromium.launch(headless=True)
            page = navegador.new_page()
            page.goto(FIXTURE.as_uri())
            page.wait_for_selector("#lienzo")

            # Documento principal: buscador de la paleta + los dos desplegables.
            antes = explorar.contar_campos_editables(page)
            page.frame_locator("#lienzo").locator("button[aria-label='Editar Cabecera']").click()
            page.wait_for_timeout(200)
            despues = explorar.contar_campos_editables(page)
            navegador.close()

        self.assertEqual(antes, 3)
        # Los dos campos nuevos (título y descripción) están dentro del iframe.
        self.assertEqual(despues, 5)

    def test_diagnostico_cubre_el_frame_del_lienzo(self):
        explorar = cargar_explorar()
        with sync_playwright() as p:
            navegador = p.chromium.launch(headless=True)
            page = navegador.new_page()
            page.goto(FIXTURE.as_uri())
            page.wait_for_selector("#lienzo")
            page.frame_locator("#lienzo").locator("button[aria-label='Editar SEO HTML']").click()
            page.wait_for_timeout(200)

            diagnostico = explorar.dump_diagnostico_frames(page)
            navegador.close()

        frames = diagnostico["frames"]
        self.assertEqual(len(frames), 2)

        principal = next(f for f in frames if f["principal"])
        lienzo = next(f for f in frames if not f["principal"])
        self.assertIn("bm-gestor-lienzo.html", lienzo["url"])

        # El buscador de la paleta esta en el principal; el campo del editor, en el iframe.
        self.assertIn("buscar-componente", [c["id"] for c in principal["campos"]])
        self.assertIn("seo-content", [c["id"] for c in lienzo["campos"]])

        campo_seo = next(c for c in lienzo["campos"] if c["id"] == "seo-content")
        self.assertEqual(campo_seo["label"], "content *")

        titulos = {b["titulo"] for b in lienzo["bloques"]}
        self.assertIn("Cabecera", titulos)
        self.assertIn("SEO HTML", titulos)
        lapices = {b["lapizAriaLabel"] for b in lienzo["bloques"]}
        self.assertIn("Editar Lista Ingredientes", lapices)


if __name__ == "__main__":
    unittest.main()
