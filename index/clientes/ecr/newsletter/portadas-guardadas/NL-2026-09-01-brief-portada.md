# Brief de entrada — Portada NL 1 septiembre 2026

**Cliente:** ECR · Newsletter LinkedIn
**Alcance:** solo el **fondo** Midjourney (título/logo se montan después en Canva)
**Estado:** ⏳ esperando el artículo. Sin tema no se puede armar la escena del prompt.

---

## 1) Lo que necesito para generar (mínimo)

| # | Dato | Por qué |
|---|------|---------|
| 1 | **Artículo del NL 1 sep** en PDF (recomendado), DOCX o TXT · o el **título completo + 3-4 líneas del ángulo** | El mundo visual (A–P) se elige por el contenido, no a mano |
| 2 | Confirmar que el estándar visual sigue siendo el de **NL1 ago v5** (ver defaults abajo) | Evita repetir las 5 vueltas de julio |

Con eso entrego **3 opciones** de prompt pegable, sin texto ni logos, listas para Midjourney.

El `.doc` antiguo no se lee: convertir a PDF o DOCX. Dejar el archivo en
[`../articulos/`](../articulos/) con el nombre `ART-<tema>.pdf` (o `.docx`).

---

## 2) Defaults que aplico si no dices nada

Consolidado de lo que quedó aprobado en julio (v5 + variantes azure):

- **Composición:** horizonte bajo extremo — **70% superior de cielo plano vacío**, toda la escena comprimida en la franja inferior del 30%.
- **Cielo:** azul azure / steel-blue con saturación suficiente para que contraste con título blanco u oscuro. **No cream, no off-white, no beige** (ese fue el feedback explícito del 20-jul).
- **Paleta:** azure/azul brillante + naranja tangerina/ámbar descritos **en palabras**; teal-navy solo como sombra. Nunca hex en el prompt (Midjourney los dibuja).
- **Personas:** faceless estilizadas; si hay protagonista, **mujer** (así quedó la v5).
- **Vetado por defecto:** camiones, vans y cualquier lectura de flota de transporte, salvo que el artículo sea de transporte. El feedback fue *"simboliza más una flota que eficiencia operacional"*.
- **Cierre anti-tipografía:** siempre, en todas las opciones.
- **Tamaño de referencia LinkedIn:** ~1200×627 (fuera del prompt).

## 3) Afinaciones opcionales (solo si quieres cambiarlas)

- Proporción de cielo distinta a 70/30.
- Protagonista: mujer / hombre / equipo / sin personas.
- Elementos a excluir además de la flota.
- **Flags Midjourney:** el flujo de la landing va **sin flags**, pero tus prompts del 20-jul cerraban con `--ar 16:9 --profile v1uymsj`. Dime si esta vez quieres la versión con tu perfil personalizado y te entrego las 3 opciones en las dos variantes.
- Si además necesitas **copys** (feed / carrusel / video), se arman aparte con
  [`../copys/FORMATO-COPYS-ECR.md`](../copys/FORMATO-COPYS-ECR.md) — recordar que emojis y CTA no se repiten respecto del NL anterior.

---

## 4) Referencias

- Base de estilo: [`../BASE-ESTILO-PORTADAS.md`](../BASE-ESTILO-PORTADAS.md)
- Reglas del prompt: [`../PROMPT-MIDJOURNEY-PORTADA.md`](../PROMPT-MIDJOURNEY-PORTADA.md)
- Última versión aprobada: [`NL1-ago-tecnologia-sin-integracion-prompts-v5.md`](./NL1-ago-tecnologia-sin-integracion-prompts-v5.md)
- Variante azure con perfil: [`NL1-ago-memphis-logistica-cielo-azure.md`](./NL1-ago-memphis-logistica-cielo-azure.md)
- Generador en el portal: `http://127.0.0.1:8000/index/clientes/ecr/` → sección **Portada Midjourney**
