import contextlib
import email.message
import importlib.util
import inspect
import io
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
        self.assertEqual(linea, "200 g de choclo")
        self.assertEqual(
            self.explorar.linea_ingrediente(
                {
                    "cantidad": "600",
                    "unidad": "g",
                    "nombre": "filete de salmón",
                    "linea": "600 g de filete de salmón",
                }
            ),
            "600 g de filete de salmón",
        )

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

    def test_rellena_ingredientes_si_ya_estoy_en_la_lista(self):
        src = inspect.getsource(self.explorar.fill_from_receta)
        src_fill = inspect.getsource(self.explorar.fill_lista_acordeones)
        src_item = inspect.getsource(self.explorar.rellenar_item_ingrediente)
        self.assertIn("Ya estoy en Lista Ingredientes", src)
        self.assertIn("rellenar_item_ingrediente", src_fill)
        self.assertIn("asegurar_n_ingredientes", src_fill)
        self.assertIn("expandir_item_ingrediente", src_item)
        self.assertIn("crcCabezalesIngrediente", self.explorar.JS_EXPANDIR_ITEM_INGREDIENTE)
        self.assertIn("crcCajasIngrediente", self.explorar.JS_FOCO_INGREDIENTE)
        self.assertIn("crcInputsIngredienteVisibles", self.explorar.JS_FOCO_INGREDIENTE)
        self.assertIn("crcEsLabelIngredienteExacto", self.explorar.JS_FOCO_INGREDIENTE)
        self.assertIn("crcExpandirTodosItems", self.explorar.JS_EXPANDIR_TODOS_ITEMS)
        self.assertIn("tienes un borrador", self.explorar.JS_RESOLVER_BORRADOR.lower())
        self.assertIn("No pude escribir los ingredientes", src)
        self.assertIn("Ya estoy en Lista de Instrucciones", src)
        self.assertIn("Ya estoy en SEO HTML", src)
        self.assertIn("No pude escribir las instrucciones", src)
        self.assertIn("No pude escribir SEO HTML", src)
        self.assertIn("crcInputsInstruccionVisibles", self.explorar.JS_FOCO_INSTRUCCION)
        self.assertIn("interno", self.explorar.JS_CLICK_AGREGAR_INGREDIENTE)
        self.assertIn("Agregar nuevo ítem", " ".join(self.explorar.BOTONES_AGREGAR))

        class Pagina:
            def evaluate(self, script, *_args):
                if "h1,h2,h3" in str(script):
                    return "Edición de Lista Ingredientes | Recetas_Jumbo"
                return ""

        pagina = Pagina()
        self.assertEqual(self.explorar.editor_actual(pagina), "ingredientes")
        self.assertTrue(self.explorar.puede_rellenar_editor(pagina, "ingredientes"))

    def test_rellena_instrucciones_si_ya_estoy_en_la_lista(self):
        self.assertEqual(
            self.explorar.partir_paso(
                "Sazona el salmón: Seca los filetes de pescado con papel absorbente."
            ),
            (
                "Sazona el salmón",
                "Seca los filetes de pescado con papel absorbente.",
            ),
        )
        self.assertEqual(
            self.explorar.titulo_lista_instrucciones({"titulo": "Salmón a la parrilla con salsa de palta"}),
            "¿Cómo preparar salmón a la parrilla con salsa de palta?",
        )
        receta_salmon = {"titulo": "Salmón a la parrilla con salsa de palta"}
        html = self.explorar.html_pasos(
            [
                {"texto": "Sazona el salmón: Seca los filetes."},
                {"texto": "Consejo: Cocina el salmón por el lado de la piel."},
            ],
            receta_salmon,
        )
        self.assertIn("<h3>¿Cómo preparar salmón a la parrilla con salsa de palta?</h3>", html)
        self.assertIn("<strong>Sazona el salmón:</strong>", html)
        self.assertIn("Consejos", html)
        self.assertNotIn("&lt;p&gt;", html)
        self.assertNotIn("&lt;strong", html)
        html_enlaces = self.explorar.html_pasos(
            [
                {
                    "texto": "Sazona el salmón: Seca los filetes de pescado con papel absorbente.",
                    "enlaces": [{"texto": "pescado", "url": "https://www.jumbo.cl/pescado"}],
                }
            ]
        )
        self.assertIn('<a href="https://www.jumbo.cl/pescado">pescado</a>', html_enlaces)
        salmon = self.explorar.html_pasos(
            [
                {
                    "orden": 1,
                    "texto": (
                        "Sazona el salmón: Seca los filetes de pescado con papel "
                        "absorbente y úntalos con la mitad del aceite de oliva."
                    ),
                },
                {
                    "orden": 6,
                    "texto": (
                        "Termina la receta: Acomoda el salmón en los platos y agrega "
                        "una buena cucharada de salsa de palta."
                    ),
                },
            ]
        )
        self.assertEqual(salmon.lower().count("<p>"), 2)
        self.assertIn("Termina la receta", salmon)
        ya_html = "<p><strong>Sazona el salmón:</strong> Seca los filetes.</p>"
        self.assertEqual(self.explorar.html_pasos([{"texto": ya_html}]), ya_html)
        self.assertTrue(self.explorar.parece_html(ya_html))
        self.assertFalse(self.explorar.parece_html("&lt;p&gt;Sazona&lt;/p&gt;"))
        self.assertTrue(self.explorar.html_quedo_con_etiquetas(ya_html, ya_html))
        self.assertFalse(
            self.explorar.html_quedo_con_etiquetas("&lt;p&gt;Sazona&lt;/p&gt;", ya_html)
        )
        self.assertIn("crcSetHtml", self.explorar.JS_ESCRIBIR_PASO_HTML)
        self.assertIn("crcHtmlTieneTagsReales", self.explorar.JS_ESCRIBIR_PASO_HTML)
        src_fill = inspect.getsource(self.explorar.fill_lista_acordeones)
        self.assertIn("etiquetas", src_fill)
        self.assertNotIn("Intento ítem a ítem", src_fill)
        self.assertIn("html", self.explorar.JS_ACTIVAR_HTML_PASO.lower())
        self.assertIn("script", self.explorar.JS_ACTIVAR_HTML_PASO.lower())
        items = self.explorar.items_instrucciones(
            [{"orden": 1, "texto": "Sazona el salmón: Seca los filetes."}],
            ["Cocina el salmón por el lado de la piel."],
        )
        self.assertEqual(len(items), 2)
        self.assertTrue(items[1]["texto"].startswith("Consejo:"))

        class Pagina:
            def evaluate(self, script, *_args):
                if "h1,h2,h3" in str(script):
                    return "Edición de Lista de Instrucciones | Recetas_Jumbo"
                return ""

        pagina = Pagina()
        self.assertEqual(self.explorar.editor_actual(pagina), "instrucciones")
        self.assertTrue(self.explorar.puede_rellenar_editor(pagina, "instrucciones"))
        self.assertFalse(self.explorar.puede_rellenar_editor(pagina, "ingredientes"))
        receta_seo = {
            "id": "salmon_a_la_parrilla_palta",
            "titulo": "Salmón a la parrilla con salsa de palta",
            "tipsTitulo": "Consejos para un salmón a la parrilla con salsa perfecto",
            "tips": [
                "Cocina el salmón principalmente por el lado de la piel.",
            ],
        }
        seo_html = self.explorar.html_seo_consejos(receta_seo)
        self.assertIn("<h2>Consejos para un salmón a la parrilla con salsa perfecto</h2>", seo_html)
        self.assertIn("<ul>", seo_html)
        self.assertIn("<li>", seo_html)
        self.assertIn("lado de la piel", seo_html)
        salmon_tips = {
            "titulo": "Salmón a la parrilla con salsa de palta",
            "tipsTitulo": "Consejos para un salmón a la parrilla con salsa perfecto",
            "tips": [
                "Cocina el salmón principalmente por el lado de la piel para proteger la carne y mantenerla jugosa. Dale vuelta una sola vez para evitar que se desarme.",
                "Prepara la salsa de palta justo antes de servir para conservar su color. El limón también ayuda a retrasar que se oscurezca.",
                "Retira el salmón cuando el centro aún esté ligeramente rosado. El calor residual terminará de cocinarlo fuera de la parrilla.",
            ],
        }
        seo_salmon = self.explorar.html_seo_consejos(salmon_tips)
        self.assertEqual(seo_salmon.count("<li>"), 3)
        self.assertIn("salsa de palta justo antes", seo_salmon)
        self.assertIn("calor residual", seo_salmon)
        self.assertNotIn("&lt;h2", seo_html)
        self.assertTrue(self.explorar.parece_html(seo_html))
        self.assertTrue(self.explorar.html_quedo_con_etiquetas(seo_html, seo_html))
        self.assertIn("content", self.explorar.JS_ESCRIBIR_PASO_HTML)

        class PaginaSeo:
            def evaluate(self, script, *_args):
                if "h1,h2,h3" in str(script):
                    return "Edición de SEO HTML | Recetas_Jumbo | Formulario seo_html | content *"
                return ""

        pagina_seo = PaginaSeo()
        self.assertEqual(self.explorar.editor_actual(pagina_seo), "seo")
        self.assertTrue(self.explorar.puede_rellenar_editor(pagina_seo, "seo"))

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
        self.assertEqual(self.explorar.linea_ingrediente(item), "600 g de filete de salmón")

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
        self.assertFalse(
            self.explorar.salio_de_la_ficha(ficha + "/edit", ficha),
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

        class PaginaTags:
            def __init__(self):
                self.url = ficha + "/edit"
                self.titulo = "Edición de tags | Recetas_Jumbo"
                self.volver = 0

            def evaluate(self, script, *_args):
                texto = str(script)
                if "flecha" in texto or ("volver" in texto.lower() and "Edici" in texto):
                    self.volver += 1
                    self.titulo = "Recetas_Jumbo | web"
                    self.url = ficha
                    return "flecha"
                if "h1,h2,h3" in texto:
                    return self.titulo
                if "innerHeight" in texto:
                    return "Edición de tags" in self.titulo
                if "innerText" in texto:
                    if "Edición de tags" in self.titulo:
                        return "Formulario Tags El dato es requerido"
                    return "Cabecera tags Ingredientes Instrucciones SEO"
                return ""

            def goto(self, url, **_kwargs):
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

                    def nth(self, _i):
                        return self

                    def is_visible(self):
                        return False

                    def inner_text(self):
                        return ""

                return Vacio()

        tags = PaginaTags()
        self.assertTrue(
            self.explorar.guardar_y_volver_al_lienzo(tags, ficha, forzar_salida=True)
        )
        self.assertGreaterEqual(tags.volver, 1)
        self.assertIsNone(self.explorar.editor_actual(tags))

    def test_no_pide_lapiz_si_cabecera_ya_esta_cargada(self):
        src = inspect.getsource(self.explorar.fill_from_receta)
        src_pedir = inspect.getsource(self.explorar.pedir_lapiz_a_mano)
        self.assertIn("Cabecera ya tiene contenido", src)
        self.assertIn("bloque_ya_cargado", src_pedir)
        self.assertIn("No pido el lápiz", src_pedir)

        class Pagina:
            def evaluate(self, script, *_args):
                texto = str(script)
                if "h1,h2,h3" in texto:
                    return "Recetas_Jumbo | web"
                if "edita este componente vac" in texto.lower() or "wanted" in texto:
                    return False
                return ""

        pagina = Pagina()
        self.assertTrue(self.explorar.bloque_ya_cargado(pagina, "cabecera"))
        self.assertFalse(self.explorar.pedir_lapiz_a_mano(pagina, "cabecera"))

    def test_js_no_rellena_paleta_izquierda(self):
        self.assertIn("r.left >= 240", self.explorar.JS_MARCAR_POR_LABEL)
        self.assertIn("r.left < 240", self.explorar.JS_LIMPIAR_BUSCA_PALETA)
        self.assertIn("view-manager/view/", self.explorar.url_tiene_vista_receta.__doc__ or "view-manager/view/")

    def test_js_volver_no_clica_proyectos(self):
        js = self.explorar.JS_VOLVER_AL_LIENZO
        self.assertIn("proyectos", js.lower())
        self.assertIn("view-manager", js)
        self.assertIn("volver", js.lower())
        self.assertIn("flecha", js)
        self.assertIn("Edici", js)
        self.assertIn("El dato es requerido", self.explorar.JS_SIGUE_REQUERIDO_VISIBLE)

    def test_guardar_tags_fuerza_volver_al_siguiente(self):
        src_guardar = inspect.getsource(self.explorar.guardar_y_volver_al_lienzo)
        src_fill = inspect.getsource(self.explorar.fill_from_receta)
        src_finalizar = inspect.getsource(self.explorar.finalizar_editor_tags)
        src_modal = inspect.getsource(self.explorar.resolver_modal_cambios)
        src_volver = inspect.getsource(self.explorar.volver_al_lienzo)
        self.assertIn("forzar_salida", src_guardar)
        self.assertIn("guardar_editor_persistente", src_guardar)
        self.assertIn("confirmar_salida=False", src_guardar)
        self.assertIn("_clic_flecha_volver", src_volver)
        self.assertIn("finalizar_editor_tags", src_fill)
        self.assertIn("sin «Sí, acepto»", src_finalizar)
        self.assertIn("guardar_editor_persistente", src_finalizar)
        self.assertIn("confirmar_salida=False", src_finalizar)
        self.assertIn("Bloque tags cargado", src_finalizar)
        self.assertIn("salir", src_modal)
        self.assertIn("guardar", self.explorar.JS_CLICK_GUARDAR.lower())
        self.assertIn("publicar", self.explorar.JS_CLICK_GUARDAR.lower())
        self.assertIn("acepto", src_modal.lower())
        self.assertIn("acepto", self.explorar.JS_CLICK_SI_ACEPTO.lower())
        self.assertIn("tienes cambios sin guardar", self.explorar.JS_CLICK_SI_ACEPTO.lower())

        class PaginaModal:
            def __init__(self):
                self.clicks = []

            def evaluate(self, script, *_args):
                texto = str(script).lower()
                if "acepto" in texto and "tienes cambios" in texto:
                    self.clicks.append("si-acepto")
                    return "si-acepto"
                return False

            def wait_for_timeout(self, _ms):
                return None

        modal = PaginaModal()
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertTrue(self.explorar.resolver_modal_cambios(modal, salir=True))
        self.assertEqual(modal.clicks, ["si-acepto"])

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


class JsIngredienteExactoTests(unittest.TestCase):
    def setUp(self):
        self.explorar = cargar(EXPLORAR_PATH, "explorar_bm_ing_js")

    def test_js_escribe_los_tres_ingrediente_asterisco(self):
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            self.skipTest("playwright no instalado")
        html = (
            Path(__file__).resolve().parent / "fixtures" / "bm-lista-ingredientes.html"
        )
        self.assertTrue(html.is_file())
        lineas = [
            "600 g de filete de salmón",
            "2 paltas",
            "1 limón",
        ]
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(html.as_uri())
            self.assertEqual(
                page.evaluate(self.explorar.JS_CONTAR_INGREDIENTES_INTERNOS),
                0,
                "cerrado no debe ver Ingrediente*",
            )
            self.assertEqual(page.evaluate(self.explorar.JS_RESOLVER_BORRADOR), "retomar")
            self.assertEqual(page.locator("#borrador").count(), 0)
            abierto = page.evaluate(self.explorar.JS_EXPANDIR_TODOS_ITEMS)
            self.assertGreaterEqual(abierto.get("cajas"), 3, abierto)
            n = page.evaluate(self.explorar.JS_CONTAR_INGREDIENTES_INTERNOS)
            self.assertEqual(n, 3, "wrappers «Ingrediente Dale un valor» no deben contar")
            for i, texto in enumerate(lineas):
                out = page.evaluate(
                    self.explorar.JS_FOCO_INGREDIENTE,
                    {"indice": i, "valor": texto},
                )
                self.assertTrue(out.get("ok"), out)
                self.assertEqual(out.get("wrote"), texto)
            valores = page.evaluate(
                """() => [...document.querySelectorAll('input[id^="ing-"]')].map((el) => el.value)"""
            )
            self.assertEqual(valores, lineas)
            browser.close()

    def test_fill_lista_retoma_borrador_abre_y_escribe(self):
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            self.skipTest("playwright no instalado")
        html = (
            Path(__file__).resolve().parent / "fixtures" / "bm-lista-ingredientes.html"
        )
        items = [
            {"linea": "600 g de filete de salmón"},
            {"linea": "2 paltas"},
            {"linea": "1 limón"},
        ]
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(html.as_uri())
            n = self.explorar.fill_lista_acordeones(page, items, "ingredientes")
            self.assertEqual(n, 3)
            valores = page.evaluate(
                """() => [...document.querySelectorAll('input[id^="ing-"]')].map((el) => el.value)"""
            )
            self.assertEqual(valores, [it["linea"] for it in items])
            titulo = page.evaluate("() => document.getElementById('titulo-seccion').value")
            self.assertEqual(titulo, "Ingredientes")
            browser.close()

    def test_fill_lista_elimina_ingredientes_sobrantes_de_una_receta_existente(self):
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            self.skipTest("playwright no instalado")
        html = (
            Path(__file__).resolve().parent / "fixtures" / "bm-lista-ingredientes.html"
        )
        items = [{"linea": "1 taza de harina"}]
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(html.as_uri())
            n = self.explorar.fill_lista_acordeones(page, items, "ingredientes")
            self.assertEqual(n, 1)
            self.assertEqual(
                page.evaluate(
                    "() => [...document.querySelectorAll('input[id^=\"ing-\"]')].map((el) => el.value)"
                ),
                ["1 taza de harina"],
            )
            browser.close()

    def test_fill_lista_instrucciones_titulo_y_pasos(self):
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            self.skipTest("playwright no instalado")
        html = (
            Path(__file__).resolve().parent / "fixtures" / "bm-lista-instrucciones.html"
        )
        items = [
            {
                "orden": 1,
                "texto": (
                    "Sazona el salmón: Seca los filetes de pescado con papel "
                    "absorbente y úntalos con la mitad del aceite de oliva."
                ),
            },
            {
                "orden": 2,
                "texto": (
                    "Prepara la salsa de palta: Muele la pulpa de las paltas "
                    "con un tenedor hasta obtener una textura cremosa."
                ),
            },
        ]
        receta = {"titulo": "Salmón a la parrilla con salsa de palta"}
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(html.as_uri())
            n = self.explorar.fill_lista_acordeones(page, items, "instrucciones", receta)
            self.assertEqual(n, 2)
            self.assertEqual(
                page.evaluate("() => document.getElementById('titulo-lista').value"),
                "¿Cómo preparar salmón a la parrilla con salsa de palta?",
            )
            self.assertTrue(
                page.evaluate("() => document.getElementById('html-script').checked")
            )
            html_out = page.evaluate("() => document.getElementById('paso-html').value")
            self.assertIn("<h3>¿Cómo preparar salmón a la parrilla con salsa de palta?</h3>", html_out)
            self.assertIn("<strong>Sazona el salmón:</strong>", html_out)
            self.assertIn("Prepara la salsa de palta", html_out)
            self.assertNotIn("&lt;p&gt;", html_out)
            self.assertNotIn("&lt;strong", html_out)
            self.assertGreaterEqual(
                page.evaluate("() => document.querySelectorAll('#wysiwyg strong').length"),
                1,
            )
            browser.close()

    def test_paso_html_mantiene_etiquetas_en_contenteditable(self):
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            self.skipTest("playwright no instalado")
        fixture = (
            Path(__file__).resolve().parent / "fixtures" / "bm-lista-instrucciones.html"
        )
        crudo = "<p><strong>Sazona el salmón:</strong> Seca los filetes.</p>"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(fixture.as_uri())
            wrote = page.evaluate(
                "([sel, v]) => { "
                + self.explorar.JS_CRC_SET_REACT
                + " return crcSetReact(document.querySelector(sel), v); }",
                ["#wysiwyg", crudo],
            )
            self.assertIn("<strong>", wrote)
            self.assertNotIn("&lt;strong", wrote)
            self.assertEqual(
                page.evaluate("() => document.querySelectorAll('#wysiwyg strong').length"),
                1,
            )
            out = page.evaluate(self.explorar.JS_ESCRIBIR_PASO_HTML, crudo)
            self.assertTrue(out.get("ok"), out)
            self.assertTrue(out.get("tags"), out)
            self.assertIn("<strong>", str(out.get("wrote") or ""))
            self.assertNotIn("&lt;p&gt;", str(out.get("wrote") or ""))
            ta = page.evaluate("() => document.getElementById('paso-html').value")
            self.assertIn("<p>", ta)
            self.assertIn("<strong>Sazona el salmón:</strong>", ta)
            self.assertNotIn("&lt;p&gt;", ta)
            browser.close()

    def test_rellena_seo_html_con_etiquetas(self):
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            self.skipTest("playwright no instalado")
        fixture = Path(__file__).resolve().parent / "fixtures" / "bm-seo-html.html"
        receta = {
            "id": "salmon_a_la_parrilla_palta",
            "titulo": "Salmón a la parrilla con salsa de palta",
        }
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(fixture.as_uri())
            self.assertEqual(self.explorar.editor_actual(page), "seo")
            self.assertTrue(self.explorar.rellenar_seo_html(page, receta))
            self.assertTrue(
                page.evaluate("() => document.getElementById('html-script').checked")
            )
            html = page.evaluate("() => document.getElementById('seo-content').value")
            self.assertIn("<h2>Consejos para un salmón a la parrilla con salsa perfecto</h2>", html)
            self.assertIn("<li>", html)
            self.assertIn("calor residual", html)
            self.assertNotIn("&lt;h2", html)
            self.assertGreaterEqual(
                page.evaluate("() => document.querySelectorAll('#wysiwyg h2').length"),
                1,
            )
            browser.close()


if __name__ == "__main__":
    unittest.main()
