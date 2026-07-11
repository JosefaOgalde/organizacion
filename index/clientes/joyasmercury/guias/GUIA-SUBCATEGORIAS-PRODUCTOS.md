# Guía — Subcategorías y etiquetas (Camila + Josef)

**Objetivo:** Que el panel CATEGORÍAS filtre Pulseras, Aros, Anillos, Cadenas y Conjuntos en Esencial, Gold y Deluxe.

**Tiempo estimado:** 1–3 sesiones según cuántos productos falten.

---

## Regla de oro

Cada producto visible en una landing debe tener:

| Capa | Ejemplo producto «Argolla Milano» en Esencial |
|------|-----------------------------------------------|
| **Colección padre** | Esencial |
| **Subcategoría** | Aros (hija de Esencial) |
| **O etiqueta** | `aros` |

Sin la segunda capa, **Todas** funciona pero **Aros** queda vacío.

---

## Método A — Categorías (recomendado)

### Estructura WC (ya creada en D04/D05)

```
Esencial
├── esencial-aros
├── esencial-cadenas
├── esencial-anillos
├── esencial-pulseras
└── esencial-conjuntos

Gold → gold-aros, gold-cadenas, …
Deluxe → deluxe-aros, deluxe-cadenas, …
```

### Edición en lote (rápido)

1. **Productos → Todos los productos**
2. Filtro superior: categoría **Esencial**
3. Marca checkbox de todos los **aros** (revisa nombre/SKU)
4. **Acciones en lote → Editar → Aplicar**
5. En el desplegable **Categorías**, marca **Aros** (bajo Esencial)
6. **Actualizar**
7. Repite para Pulseras, Cadenas, Anillos, Conjuntos
8. Repite todo para **Gold** y **Deluxe**

### Edición individual

En la ficha del producto → **Categorías del producto** (columna derecha):

- [x] Esencial  
- [x] Anillos ← subcategoría correcta  
- [ ] Gold (si no aplica)

---

## Método B — Etiquetas (alternativa)

Si las subcategorías hijas dan problemas:

1. **Productos → Etiquetas**
2. Crear: `aros`, `anillos`, `pulseras`, `cadenas`, `conjuntos`
3. Asignar etiqueta a cada producto (individual o lote)
4. El CSS del sitio ya filtra por `product_tag-aros`, etc.

---

## Cómo verificar (obligatorio)

1. Abre `https://joyasmercury.cl/esencial/` (vista **Todas**)
2. Clic derecho en un producto que debería ser aro → **Inspeccionar**
3. Busca `<li class="product …">`

Debe incluir **al menos una** de:

- `product_cat-esencial-aros`
- `product_cat-aros`
- `product_tag-aros`

4. Clic en **Aros** en el panel → debe aparecer ese producto
5. Repite en `/gold/` y `/deluxe/`

---

## Errores frecuentes

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Todas OK, subcategoría vacía | Solo categoría padre | Añadir subcategoría o etiqueta |
| Dice «Esencial» en Gold | Producto mal asignado | Quitar Esencial; marcar Gold + sub |
| «Sin categorizar» en grid | Sin categoría | Asignar colección; CSS ya lo oculta |
| Panel no filtra nada | Query widget incorrecta | Query = colección padre |

---

## Checklist por colección

### Esencial

- [ ] Todos los aros → Esencial + Aros (o etiqueta `aros`)
- [ ] Todos los anillos → Esencial + Anillos
- [ ] Todas las pulseras → Esencial + Pulseras
- [ ] Todas las cadenas → Esencial + Cadenas
- [ ] Todos los conjuntos → Esencial + Conjuntos

### Gold

- [ ] (misma lógica con categorías Gold)

### Deluxe

- [ ] (misma lógica con categorías Deluxe)

---

## Tabla de ayuda (rellenar en sesión con Camila)

| Producto | SKU | Colección | Tipo | ¿Subcategoría OK? |
|----------|-----|-----------|------|-------------------|
| Argolla Milano | | Esencial | Aros | |
| Heart Honey | ESA015 | Esencial | Anillos | ✓ (ejemplo admin) |
| … | | | | |

---

## Cuando termines

1. Ctrl+F5 en las 3 landings
2. Probar los 6 botones del panel en cada una
3. Marcar D06 casi completo en organizador (falta solo cabecera + móvil)
4. Avanzar a D09 QA filtros
