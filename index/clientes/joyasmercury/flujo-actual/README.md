# Flujo actual — joyasmercury.cl

Capturas del **sitio en producción** (jun 2026), ordenadas para recorrer el prototipo interactivo de arriba hacia abajo.

**Agente:** `@joyas-mercury`  
**Prototipo:** [prototipo.html](../prototipo.html) · [wireframes.html](../wireframes.html)

---

## Capturas reales (producción)

Las imágenes de esta carpeta son **capturas del sitio en vivo** (`joyasmercury.cl`), las mismas pantallas que ves en producción.

Regenerar desde el sitio:

```bash
pip install playwright
python3 -m playwright install chromium
python3 scripts/capturar-jm-flujo-actual.py
```

Si prefieres pegar tus propios PNG, usa los mismos nombres de la tabla y reemplaza los archivos aquí.

---

## Orden del recorrido

| Paso | Archivo | Pantalla | Qué muestra |
|------|---------|----------|-------------|
| 1 | `01-inicio-home.png` | **Inicio** | Hero «Joyas que te hacen brillar», barra de valor, círculos **Esencial / Gold / Deluxe**, nav inferior móvil |
| 2 | `02-coleccion-esencial.png` | **Esencial** | Banner colección, categorías (Pulseras, Conjuntos, Cadenas, Anillos, Aros), productos destacados |
| 3 | `03-coleccion-gold.png` | **Gold** | Misma estructura · línea Gold · «Mayor resistencia y duración» |
| 4 | `04-coleccion-deluxe.png` | **Deluxe** | Misma estructura · línea premium · diseños exclusivos |
| 5 | `05-tienda-catalogo.png` | **Tienda** | Catálogo WooCommerce · grilla 4 columnas · etiquetas Esencial/Deluxe · paginación |
| 6 | `06-mi-carrito.png` | **Mi Carrito** | Carrito vacío · alertas WC · «Volver a la tienda» · galería sugeridos · newsletter |
| 7 | `07-nosotros.png` | **Nosotros** | Página editorial / entradas (estado actual WP) |
| 8 | `08-pie-garantia-footer.png` | **Pie y garantía** | Texto garantía fábrica · footer dorado · redes · WhatsApp flotante |

---

## Mapa de navegación (clic en prototipo)

```
                    ┌─────────────┐
                    │   INICIO    │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
      ESENCIAL           GOLD            DELUXE
           │               │               │
           └───────────────┼───────────────┘
                           ▼
                        TIENDA
                           │
                           ▼
                      MI CARRITO
                           
   Nav superior (todas): Nosotros · Mi Cuenta · Mi Carrito · Contacto
```

---

## Menú actual (producción)

Barra superior en todas las pantallas:

- **Nosotros** → paso 7  
- **Mi Cuenta** → (cuenta WC, fuera de este flujo)  
- **Mi Carrito** → paso 6  
- **Contacto** → footer / WhatsApp  

Iconos: redes (FB, IG, TikTok) · corona/logo · bolsa con contador.

---

## Reemplazar manualmente (opcional)

1. Guarda tus PNG con **exactamente** los nombres de la tabla.
2. Copia en esta carpeta: `index/clientes/joyasmercury/flujo-actual/`
3. Recarga el prototipo en el navegador.

---

## Links locales

```
http://localhost:3000/prototipo-joyas-mercury.html
http://localhost:3000/index/clientes/joyasmercury.html
http://localhost:3000/index/clientes/joyasmercury/flujo-actual/01-inicio-home.png
```
