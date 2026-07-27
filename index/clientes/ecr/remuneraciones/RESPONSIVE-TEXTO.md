# ECR · Remuneraciones (software) — tipografía responsive

**URL:** https://ecrgroup.cl/remuneraciones/  
**Fecha:** 2026-07-27  
**Tarea sugerida:** `[ECR] Landing remuneraciones`

Objetivo: texto legible en desktop / tablet / móvil sin desborde ni “una palabra por línea”.

Relacionado: [`AJUSTES-ELEMENTOR.md`](./AJUSTES-ELEMENTOR.md) · patrón [`../canal-denuncias/RESPONSIVE-TEXTO.md`](../canal-denuncias/RESPONSIVE-TEXTO.md).

---

## Escala tipográfica (Elementor, por breakpoint)

Color cuerpo sugerido: `#556880` o el gris/azul del sitio.

### H1 hero — “Software de Remuneraciones Online | ECR Group”

| Pantalla | Tamaño | Altura de línea | Peso |
|----------|--------|-----------------|------|
| Grande | 40–44 px | 1.15–1.2 | 700 |
| Escritorio | 34–38 px | 1.2 | 700 |
| Tablet | 28–30 px | 1.25 | 700 |
| Móvil | **22–24 px** | **1.3** | 700 |

Móvil: margen L/R `0–12`, padding horizontal `12–16`.

### H2 — “¿Qué es…?”, “Beneficios”, “¿Para quiénes…?”, industrias

| Pantalla | Tamaño | Altura de línea |
|----------|--------|-----------------|
| Grande | 28–30 px | 1.25 |
| Escritorio | 24–26 px | 1.3 |
| Tablet | 20–22 px | 1.35 |
| Móvil | **18–20 px** | **1.35** |

### Párrafos / cuerpo beneficios

| Pantalla | Tamaño | Altura de línea | Color |
|----------|--------|-----------------|-------|
| Grande | 30 px | 40 px | `#556880` |
| Escritorio | 24 px | 35 px | `#556880` |
| Tablet | 20 px | 30 px | `#556880` |
| Móvil | **16 px** | **25 px** | `#556880` |

Ancho bloque texto desktop ~720–800 px; móvil **100%**.

### Cards industrias (títulos de card)

Móvil: título **16–18 px**, descripción **14–15 px**. Evitar títulos en una sola columna estrecha con fuente de desktop.

### CTA / botones

| Pantalla | Texto | Padding V/H |
|----------|-------|-------------|
| Escritorio | 16–18 px | 14–16 / 28–32 |
| Tablet | 15–16 px | 12–14 / 24–28 |
| Móvil | **14–15 px** | **12 / 20–24** · ancho **100%** o centrado |

---

## Layout que suele romper el texto

1. **Dos columnas** (copy | mockup) en fila en tablet/móvil → texto aplastado.  
   → Dirección **columna**, cada col **100%**.
2. **Anchos fijos / márgenes negativos** → scroll horizontal.  
   → Móvil: `100%`, margen horizontal `0`.
3. **H1 con tamaño desktop en móvil** → pocas palabras por línea.  
   → Bajar a **22–24 px**.
4. **H1 duplicado** → parece “doble título” y empuja el layout.  
   → Ver [`AJUSTES-ELEMENTOR.md`](./AJUSTES-ELEMENTOR.md) problema 1.

---

## Checklist tipografía

- [ ] H1 / H2 / párrafos por dispositivo
- [ ] Cards industrias legibles en móvil
- [ ] CTA tocable (≥44 px alto)
- [ ] Sin scroll horizontal en `/remuneraciones/`
- [ ] Hard refresh / purge caché tras **Actualizar**

---

## Contenido de referencia (live)

- H1: Software de Remuneraciones Online | ECR Group
- Qué es el software + beneficios 1–4
- Industrias (6 cards)
- Blog / artículos relacionados
- Formulario de consulta

No cambiar claim comercial sin aprobación; solo **tamaño, interlineado, anchos y apilado** (+ limpiar widgets vacíos/duplicados).
