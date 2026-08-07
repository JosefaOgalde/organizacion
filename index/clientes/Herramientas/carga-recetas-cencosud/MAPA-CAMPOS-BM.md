# Mapa de campos · Word → JSON → Business Manager Cencosud

Destino: https://business-manager.ecomm.cencosud.com/  
Público de referencia: https://www.jumbo.cl/recetas

> Los selectores exactos del formulario BM se completan en la **sesión de mapeo** (con tu login). Mientras tanto el JSON intermedio ya lleva todos los datos.

## Quién hace qué

| Actor | Rol |
|-------|-----|
| **Cliente final** | No envía Word ni entra al BM. No cambia su flujo. |
| **Tú (operadora)** | Tienes el `.docx` y los accesos ADFS al BM. |
| **Agente `@herramientas` + scripts** | Parsea Word → completa JSON → (fase 2) rellena BM y publica. |

## Campos

| Campo JSON | Suele venir del Word | Campo típico en ficha pública Jumbo | Campo BM (completar al mapear) | Selector Playwright (completar) |
|------------|----------------------|-------------------------------------|--------------------------------|----------------------------------|
| `titulo` | Título / primera línea | Título de receta | | |
| `descripcion` | Intro / bajada | Párrafo introductorio | | |
| `porciones` | «Rinde…» / «Porciones» | Porciones | | |
| `tiempoPreparacion` | Prep / preparación | Tiempo | | |
| `tiempoCoccion` | Cocción / horno | Tiempo | | |
| `tiempoTotal` | Total | Tiempo | | |
| `dificultad` | Fácil / media / difícil | Nivel | | |
| `categorias[]` | Pollo, carne, postre… | Filtros ingredientes / tipo | | |
| `ocasiones[]` | Menú semanal, 18, etc. | Ocasión | | |
| `ingredientes[].nombre` | Lista ingredientes | «Productos que necesitas» | | |
| `ingredientes[].cantidad` | 200 g, 2 cdas… | | | |
| `ingredientes[].skuCencosud` | Rara vez en Word | Link a producto carro | Buscar SKU en BM | |
| `pasos[].texto` | Paso a paso numerado | Instrucciones | | |
| `imagenes[]` | Adjuntos / carpeta local | Hero | Upload BM | |
| `seo.metaTitulo` | Opcional | SEO | | |
| `seo.metaDescripcion` | Opcional | SEO | | |
| `seo.slugSugerido` | Derivado del título | URL `/recetas/…` | | |

## Checklist de mapeo BM (una vez, con sesión abierta)

1. Login ADFS en Business Manager.
2. Ir al módulo donde se crean/editan **recetas** (anotar ruta del menú).
3. Abrir «Nueva receta» y anotar **cada label** del formulario.
4. Pegar label + tipo de control (input, rich text, select, upload) en la tabla de arriba.
5. En DevTools, copiar `name` / `id` / selector estable → columna Playwright.
6. Probar un borrador **sin publicar** con `scripts/publicar-receta-cencosud.py --dry-run`.

## Estados del JSON

- `borrador` — parseado, faltan campos (`camposFaltantes` no vacío)
- `listo-para-cargar` — agente completó huecos; listo para Playwright
- `cargado` — guardado en BM como borrador
- `publicado` — visible en bandera (ej. jumbo.cl/recetas)
- `error` — ver `publicacion.notas`
