# ECR Capacitaciones — Modal ruta de aprendizaje

> **Sitio web:** ECR Capacitaciones *(WordPress + Elementor)*  
> **No confundir con:** https://ecrgroup.cl/blog/ (blog ECR Group — carpeta `../blog/`)

**Sección en Elementor:** «Sectores que abordamos en cada ruta»  
**Página de prueba:** rutas 2 pruebas *(o equivalente en producción)*

---

## Estado actual (implementado)

| Funcionalidad | Estado |
|---------------|--------|
| Modal al clic en tarjeta de sector | ✅ |
| Modal al clic en botón «Ver más» | ✅ |
| 8 sectores configurados | ✅ |
| Borde blanco en panel del modal | ✅ |
| Botones «Ir al curso» blancos + texto azul | ✅ |
| Responsive mobile | ✅ |
| Cerrar con X, clic fuera o Escape | ✅ |

---

## Estética del modal (referencia diseño)

| Elemento | Valor |
|----------|--------|
| Panel | Naranja semitransparente `rgba(232, 93, 4, 0.92)` |
| Borde panel | Blanco 2px, `border-radius: 20px` |
| Texto | Blanco |
| Botón «Ir al curso» | Fondo `#ffffff`, texto `#1a6fa8`, forma píldora |
| Título sección cursos | «Ruta de aprendizaje:» |

---

## Archivos en este repo

| Archivo | Uso |
|---------|-----|
| **`sectores-widget.html`** | **Copiar/pegar completo** en widget HTML de Elementor |
| `sectores-data.js` | Datos editables: textos y URLs por sector |
| `sectores-modal.js` | Lógica del modal |
| `sectores-modal.css` | Estilos (incluidos en el widget HTML) |
| `GUIA-INSTALACION.md` | Paso a paso de instalación en Elementor |

---

## Instalación rápida (Elementor)

### 1. Widget HTML

Al **final** de la sección de sectores (idealmente **fuera del Grid**):

1. Widget **HTML**
2. Pegar **todo** `sectores-widget.html`
3. Si queda dentro del Grid → **Avanzado → CSS personalizado** del HTML:

```css
selector {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
  padding: 0 !important;
  margin: 0 !important;
}
```

### 2. Cada tarjeta — Atributos personalizados

Formato Elementor: `nombre|valor`

| Tarjeta | Atributo personalizados |
|---------|-------------------------|
| Retail | `data-ecr-sector\|retail` |
| Financiero | `data-ecr-sector\|financiero` |
| Salud | `data-ecr-sector\|salud` |
| Tecnología | `data-ecr-sector\|tecnologia` |
| Gestión | `data-ecr-sector\|gestion` |
| Logística | `data-ecr-sector\|logistica` |
| Datos | `data-ecr-sector\|datos` |
| Soluciones In Company | `data-ecr-sector\|soluciones-in-company` |

### 3. Botón «Ver más» — Clases CSS

```
ecr-sector-ver-mas
```

*(En **Clases CSS**, no en CSS personalizado.)*

---

## Editar contenido de cursos

En `sectores-data.js` o dentro del primer `<script>` de `sectores-widget.html`:

```javascript
financiero: {
    ...
    cursos: [
        { nombre: 'Excel básico.', url: 'https://tu-url-real.cl/curso' },
    ]
}
```

---

## Verificación

1. **Actualizar** página en Elementor
2. Navegador → **Ctrl+F5**
3. Clic en **Financiero** → modal naranja, borde blanco, botones blancos/azules
4. Consola: `ECR.abrirRutaSector('financiero')` debe abrir el modal

---

## Rama Git

```bash
git checkout cursor/ecr-capacitaciones-modal-4d93
```

---

## API JavaScript

```javascript
ECR.abrirRutaSector('financiero');
ECR.cerrarRutaModal();
```
