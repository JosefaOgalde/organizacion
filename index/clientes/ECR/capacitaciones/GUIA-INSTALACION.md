# Guía de instalación — ECR Capacitaciones

**Sitio:** web de **ECR Capacitaciones** (no ecrgroup.cl/blog)

---

## Resumen de lo implementado

- Grid de 8 sectores en Elementor (Contenedor → Grid → 8 tarjetas)
- Widget HTML con modal (estilos + datos + script)
- Cada tarjeta abre su ruta de aprendizaje en modal naranja

---

## Paso 1 — Widget HTML del modal

1. Editar página **Ruta de aprendizaje** en Elementor
2. Al final del **Contenedor** padre (debajo del Grid, no dentro de una tarjeta)
3. Agregar widget **HTML**
4. Copiar **todo** el archivo `sectores-widget.html`
5. Publicar

**Importante:** no editar solo el `<style>`; siempre pegar el archivo **completo** (style + 2 scripts).

---

## Paso 2 — Configurar tarjetas (una por una)

### Contenedor de la tarjeta

**Avanzado → Atributos personalizados** (formato `clave|valor`):

| # | Sector | Valor |
|---|--------|-------|
| 1 | Retail | `data-ecr-sector\|retail` |
| 2 | Financiero | `data-ecr-sector\|financiero` |
| 3 | Salud | `data-ecr-sector\|salud` |
| 4 | Tecnología | `data-ecr-sector\|tecnologia` |
| 5 | Gestión | `data-ecr-sector\|gestion` |
| 6 | Logística | `data-ecr-sector\|logistica` |
| 7 | Datos | `data-ecr-sector\|datos` |
| 8 | Soluciones In Company | `data-ecr-sector\|soluciones-in-company` |

### Botón «Ver más»

**Avanzado → Clases CSS:** `ecr-sector-ver-mas`

---

## Paso 3 — Probar

1. Actualizar → Ctrl+F5 en navegador (no solo vista previa Elementor)
2. Clic en cada sector
3. Verificar botones «Ir al curso» (blanco, texto azul)

---

## Errores comunes

| Problema | Solución |
|----------|----------|
| No abre modal | Pegar HTML completo; verificar 2 bloques `<script>` |
| Atributo no funciona | Usar `data-ecr-sector\|retail` con pipe `\|` |
| Clase en CSS personalizado | `ecr-sector-ver-mas` va en **Clases CSS** |
| Imágenes desaparecen | Quitar `display:none` del Contenedor del Grid |
| Modal no visible | Reemplazar HTML completo (versión con `display:flex` en `--abierto`) |

---

## Historial de ajustes estéticos

- Panel: borde blanco 2px, fondo naranja semitransparente
- Botones: fondo blanco `#ffffff`, texto azul `#1a6fa8` (como diseño referencia)
- Mobile: lista de cursos apilada, botón alineado a la derecha
