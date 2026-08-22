import email.message
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


def docx_con_enlace_foto(dest: Path, url: str, texto: str = "Foto") -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    doc = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:r><w:t>([</w:t></w:r>
      <w:hyperlink r:id="rId5" w:history="1">
        <w:r><w:t>{texto}</w:t></w:r>
      </w:hyperlink>
      <w:r><w:t>])</w:t></w:r>
    </w:p>
  </w:body>
</w:document>"""
    rels = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId5"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink"
    Target="{url}" TargetMode="External"/>
</Relationships>"""
    with zipfile.ZipFile(dest, "w") as zf:
        zf.writestr("word/document.xml", doc)
        zf.writestr("word/_rels/document.xml.rels", rels)
    return dest


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

    def test_tags_desde_el_word(self):
        self.assertEqual(
            self.explorar.tags_desde_receta(
                {
                    "categorias": [
                        "salmon",
                        "recetas a la parrilla",
                        "paltas",
                        "recetas saludables",
                        "pescado",
                        "almuerzo",
                    ]
                }
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

    def test_no_rellena_tags_en_el_lienzo(self):
        class Pagina:
            def evaluate(self, script, *_args):
                if "h1,h2,h3" in str(script):
                    return "Recetas_Jumbo | web"
                return ""

        self.assertIsNone(self.explorar.editor_actual(Pagina()))
        self.assertEqual(self.explorar.fill_lista_tags(Pagina(), ["salmon"]), 0)

    def test_ingrediente_no_usa_titulo_de_seccion(self):
        fields = [
            {
                "label": "Título de la sección",
                "selectorSugerido": "#sec",
                "tag": "input",
            },
            {
                "label": "Ingrediente *",
                "selectorSugerido": "#ing",
                "tag": "input",
            },
        ]
        pares = self.explorar.asignar_campos_item(
            fields, {"nombre": "Pimienta a gusto"}, "ingredientes"
        )
        self.assertEqual(pares[0][2], "Pimienta a gusto")
        self.assertEqual(pares[0][1], "#ing")

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
        self.assertFalse(
            self.explorar.salio_de_la_ficha(ficha + "?component=a3e7ad", ficha)
        )

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

    def test_url_lienzo_no_es_lista_proyectos(self):
        ficha = (
            "https://business-manager.ecomm.cencosud.com/cms/projects/"
            "6597f023fdc664839ccd2a37/view-manager"
        )
        editor = ficha + "/edit"
        self.assertIsNone(self.explorar.url_lienzo_receta(editor, ficha))
        self.assertIsNone(
            self.explorar.url_lienzo_receta(
                "https://business-manager.ecomm.cencosud.com/cms/projects",
                None,
            )
        )

    def test_url_lienzo_conserva_view_de_la_receta(self):
        vista = (
            "https://business-manager.ecomm.cencosud.com/cms/projects/"
            "6597f023fdc664839ccd2a37/view-manager/view/salmon123"
        )
        corta = (
            "https://business-manager.ecomm.cencosud.com/cms/projects/"
            "6597f023fdc664839ccd2a37/view-manager"
        )
        self.assertTrue(self.explorar.url_tiene_vista_receta(vista))
        self.assertFalse(self.explorar.url_tiene_vista_receta(corta))
        self.assertEqual(
            self.explorar.url_lienzo_receta(vista + "/edit", corta),
            vista,
        )

    def test_volver_al_lienzo_tras_guardado(self):
        ficha = (
            "https://business-manager.ecomm.cencosud.com/cms/projects/"
            "6597f023fdc664839ccd2a37/view-manager/view/salmon123"
        )

        class Pagina:
            def __init__(self):
                self.url = ficha + "/edit"
                self.titulo = "Edición de Cabecera | Recetas_Jumbo"
                self.gotos = []

            def evaluate(self, script, *_args):
                texto = str(script)
                if "h1,h2,h3" in texto:
                    return self.titulo
                if "innerText" in texto and "querySelectorAll" not in texto:
                    return "Guardado satisfactoriamente. No olvides de publicar"
                if "volver" in texto.lower() or "Gestor" in texto:
                    return False
                return ""

            def goto(self, url, **_kwargs):
                self.gotos.append(url)
                self.url = url
                self.titulo = "Recetas_Jumbo | web"

            def wait_for_timeout(self, _ms):
                return None

            def locator(self, _sel):
                class Vacio:
                    def count(self):
                        return 0

                    def last(self):
                        return self

                    def click(self, **_k):
                        return None

                return Vacio()

        pagina = Pagina()
        self.assertTrue(self.explorar.parece_guardado_ok(pagina))
        self.assertTrue(self.explorar.volver_al_lienzo(pagina, ficha))
        self.assertEqual(pagina.gotos, [ficha])
        self.assertIsNone(self.explorar.editor_actual(pagina))

    def test_js_no_rellena_paleta_izquierda(self):
        self.assertIn("r.left >= 240", self.explorar.JS_MARCAR_POR_LABEL)
        self.assertIn("r.left < 240", self.explorar.JS_LIMPIAR_BUSCA_PALETA)
        self.assertIn("view-manager/view/", self.explorar.url_tiene_vista_receta.__doc__ or "view-manager/view/")

    def test_js_volver_no_clica_proyectos(self):
        js = self.explorar.JS_VOLVER_AL_LIENZO
        self.assertIn("proyectos", js.lower())
        self.assertIn("view-manager", js)
        self.assertIn("volver", js.lower())

    def test_js_modal_imagen_pide_confirmar(self):
        js = self.explorar.JS_CLICK_CONFIRMAR_IMAGEN
        self.assertIn("Confirmar", js)
        self.assertIn("Mi Equipo", self.explorar.JS_ACTIVAR_TAB_MI_EQUIPO)
        self.assertIn("portada-enlace", self.explorar.JS_HAY_MODAL_MEDIA)

    def test_confirmar_imagen_selecciona_y_confirma(self):
        class Pagina:
            def __init__(self):
                self.pasos = []

            def evaluate(self, script, *args):
                texto = str(script)
                if "hayConfirmar" in texto or "Mi Equipo|portada-enlace" in texto:
                    self.pasos.append("modal")
                    return True
                if "Mi Equipo" in texto and "tab" in texto.lower():
                    self.pasos.append("tab")
                    return True
                if "thumb" in texto.lower() or "stem" in texto:
                    self.pasos.append(("thumb", args[0] if args else None))
                    return True
                if "Confirmar" in texto and "btn.click" in texto:
                    self.pasos.append("confirmar")
                    return True
                return False

            def wait_for_timeout(self, _ms):
                return None

        pagina = Pagina()
        self.assertTrue(
            self.explorar.confirmar_imagen_en_modal(pagina, "portada-enlace.png")
        )
        self.assertIn("confirmar", pagina.pasos)
        self.assertIn(("thumb", "portada-enlace.png"), pagina.pasos)

    def test_ruta_imagen_baja_enlace_celeste_foto(self):
        jpeg = b"\xff\xd8\xff\xe0" + b"\x00" * 20
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            crc = root / "crc"
            (crc / "out" / "media").mkdir(parents=True)
            docx = docx_con_enlace_foto(
                root / "Downloads" / "salmon.docx",
                "https://cdn.ejemplo.cl/salmon.jpg",
            )
            bajada = crc / "out" / "media" / "otra" / "portada-enlace.jpg"

            def fake_dl(url, dest_dir, stem="portada-enlace", **_kwargs):
                dest_dir.mkdir(parents=True, exist_ok=True)
                out = dest_dir / f"{stem}.jpg"
                out.write_bytes(jpeg)
                return out

            with patch.object(self.explorar, "ROOT", root), patch.object(
                self.explorar, "CRC", crc
            ), patch.object(self.explorar._RUTAS, "descargar_imagen_url", fake_dl):
                hallada = self.explorar.ruta_imagen_portada(
                    {
                        "id": "otra",
                        "fuenteWord": str(docx),
                        "imagenes": [{"rutaLocal": "", "alt": "Filete"}],
                    }
                )
            self.assertIsNotNone(hallada)
            self.assertEqual(hallada.read_bytes()[:3], b"\xff\xd8\xff")
            self.assertTrue(hallada.name.startswith("portada-enlace"))

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

    def test_extrae_enlace_celeste_foto(self):
        with tempfile.TemporaryDirectory() as tmp:
            docx = docx_con_enlace_foto(
                Path(tmp) / "salmon.docx",
                "https://cdn.ejemplo.cl/salmon.jpg",
            )
            enlaces = self.rutas.extraer_enlaces_docx(docx)
            textos = [e["texto"] for e in enlaces]
            self.assertIn("Foto", textos)
            elegido = self.rutas.elegir_enlace_foto(enlaces)
            self.assertEqual(elegido["url"], "https://cdn.ejemplo.cl/salmon.jpg")
            self.assertEqual(elegido["texto"], "Foto")

    def test_elige_foto_y_no_otro_hipervinculo(self):
        enlaces = [
            {"texto": "Ingredientes", "url": "https://ejemplo.cl/ings"},
            {"texto": "Foto", "url": "https://cdn.ejemplo.cl/portada.png"},
        ]
        self.assertEqual(
            self.rutas.elegir_enlace_foto(enlaces)["url"],
            "https://cdn.ejemplo.cl/portada.png",
        )

    def test_url_descarga_drive_y_dropbox(self):
        self.assertEqual(
            self.rutas.url_descarga_directa(
                "https://drive.google.com/file/d/ABC123/view?usp=sharing"
            ),
            "https://drive.google.com/uc?export=download&id=ABC123",
        )
        self.assertIn(
            "dl=1",
            self.rutas.url_descarga_directa("https://www.dropbox.com/s/xx/f.jpg?dl=0"),
        )

    def test_descarga_enlace_foto_a_jpg(self):
        jpeg = b"\xff\xd8\xff\xe0" + b"\x00" * 20

        class Resp:
            def __init__(self):
                self.headers = email.message.EmailMessage()
                self.headers["Content-Type"] = "image/jpeg"

            def read(self):
                return jpeg

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

        with tempfile.TemporaryDirectory() as tmp:
            dest = Path(tmp) / "media"
            with patch.object(self.rutas.urllib.request, "urlopen", return_value=Resp()):
                out = self.rutas.descargar_imagen_url("https://cdn.ejemplo.cl/x", dest)
            self.assertIsNotNone(out)
            self.assertEqual(out.suffix, ".jpg")
            self.assertEqual(out.read_bytes()[:3], b"\xff\xd8\xff")

    def test_asegurar_foto_desde_word_con_enlace(self):
        jpeg = b"\xff\xd8\xff\xe0" + b"\x00" * 20
        with tempfile.TemporaryDirectory() as tmp:
            docx = docx_con_enlace_foto(
                Path(tmp) / "receta.docx",
                "https://cdn.ejemplo.cl/salmon.jpg",
            )
            dest = Path(tmp) / "out"
            with patch.object(
                self.rutas,
                "descargar_imagen_url",
                return_value=dest / "portada-enlace.jpg",
            ) as mock_dl:
                (dest / "portada-enlace.jpg").parent.mkdir(parents=True, exist_ok=True)
                (dest / "portada-enlace.jpg").write_bytes(jpeg)
                path, url = self.rutas.asegurar_foto_desde_enlace(docx, dest, {})
            self.assertEqual(url, "https://cdn.ejemplo.cl/salmon.jpg")
            self.assertEqual(path.name, "portada-enlace.jpg")
            mock_dl.assert_called()


if __name__ == "__main__":
    unittest.main()
