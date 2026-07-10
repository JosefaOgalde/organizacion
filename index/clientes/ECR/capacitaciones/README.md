# ECR Capacitaciones — Modal ruta de aprendizaje

**Sitio:** ecrcapacitaciones (WordPress + Elementor)  
**Sección:** «Sectores que abordamos en cada ruta»

---

## Qué hace

Al hacer clic en una tarjeta de sector (o en **Ver más**), se abre un modal naranja con:

- Título y subtítulo del sector
- Descripción
- Competencias SENCE
- Lista de cursos con botón **Ir al curso →**

---

## Archivos

| Archivo | Uso |
|---------|-----|
| **`sectores-widget.html`** | Pegar en Elementor (widget HTML al final de la sección) |
| `sectores-data.js` | Editar textos y URLs de cada sector |
| `sectores-modal.js` | Lógica del modal (no editar salvo custom) |
| `sectores-modal.css` | Estilos del modal |

---

## Instalación en Elementor

### Paso 1 — Widget HTML

1. Editar la página de **Ruta de aprendizaje** en Elementor
2. Al **final de la sección** de sectores, agregar widget **HTML**
3. Pegar **todo** el contenido de `sectores-widget.html`
4. Publicar

### Paso 2 — Atributos en cada tarjeta

En cada tarjeta del grid, ir a **Avanzado → Atributos** y agregar:

| Tarjeta | Atributo | Valor |
|---------|----------|-------|
| Retail | `data-ecr-sector` | `retail` |
| Financiero | `data-ecr-sector` | `financiero` |
| Salud | `data-ecr-sector` | `salud` |
| Tecnología | `data-ecr-sector` | `tecnologia` |
| Gestión | `data-ecr-sector` | `gestion` |
| Logística | `data-ecr-sector` | `logistica` |
| Datos | `data-ecr-sector` | `datos` |
| Soluciones In Company | `data-ecr-sector` | `soluciones-in-company` |

**Opcional:** clase CSS `ecr-sector-card` en el contenedor de cada tarjeta (borde naranja al hover).

### Paso 3 — Botón «Ver más»

En el botón **Ver más** de cada tarjeta, agregar clase CSS:

```
ecr-sector-ver-mas
```

(O atributo `data-ecr-sector-trigger` sin valor.)

### Paso 4 — Editar contenido

Editar `sectores-data.js` (o el bloque `<script>` dentro de `sectores-widget.html`):

- Textos de descripción y competencias
- URLs reales en cada curso (`url: 'https://...'`)

---

## Slugs disponibles

```
retail | financiero | salud | tecnologia | gestion | logistica | datos | soluciones-in-company
```

---

## Probar

1. Ctrl+F5 en la página
2. Clic en **Financiero** → modal con Excel, Power BI, etc.
3. Clic en **Ir al curso** → abre URL del curso
4. Cerrar con **X**, clic fuera o **Escape**

---

## API JavaScript (opcional)

```javascript
ECR.abrirRutaSector('financiero');  // abrir modal programáticamente
ECR.cerrarRutaModal();              // cerrar
```

---

## Rama Git

```bash
git checkout cursor/ecr-capacitaciones-modal-4d93
```

Carpeta: `index/clientes/ECR/capacitaciones/`
