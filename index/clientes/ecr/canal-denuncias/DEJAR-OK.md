# ECR · Canal de denuncias — dejar OK (checklist final)

**URL:** https://ecrgroup.cl/canaldenuncias/  
**Fecha:** 2026-07-27  
**Objetivo:** tipografía y layout responsive listos → **Actualizar** en Elementor.

Orden: **Móvil → Tablet → Escritorio → Grande** (ícono dispositivo en cada campo).

---

## Segmento 1 — H1

| Pantalla | Tamaño | Altura línea | Peso | Margen L/R | Padding L/R |
|----------|--------|--------------|------|------------|-------------|
| Grande | 40–44 px | 1.2 | 700 | 0 | 0–8 |
| Escritorio | 34–38 px | 1.2 | 700 | 0 | 0–8 |
| Tablet | 28–30 px | 1.25 | 700 | 0–8 | 8–12 |
| Móvil | **22–24 px** | **1.3** | 700 | **0–8** | **12–16** |

- [ ] H1 OK en los 4 breakpoints

---

## Segmento 2 — H2

| Pantalla | Tamaño | Altura línea |
|----------|--------|--------------|
| Grande | 28–30 px | 1.25 |
| Escritorio | 24–26 px | 1.3 |
| Tablet | 20–22 px | 1.35 |
| Móvil | **18–20 px** | **1.35** |

- [ ] Todos los H2 OK

---

## Segmento 3 — Párrafos

| Pantalla | Tamaño | Altura línea | Color |
|----------|--------|--------------|-------|
| Grande | 30 px | 40 px | `#556880` |
| Escritorio | 24 px | 35 px | `#556880` |
| Tablet | 20 px | 30 px | `#556880` |
| Móvil | **16 px** | **25 px** | `#556880` |

- [ ] Cuerpo OK · móvil 100% ancho · sin “una palabra por línea”

---

## Segmento 4 — CTA “Haz tu denuncia aquí”

| Pantalla | Texto | Padding V/H | Ancho |
|----------|-------|-------------|-------|
| Escritorio | 16–18 px | 14–16 / 28–32 | auto |
| Tablet | 15–16 px | 12–14 / 24–28 | auto |
| Móvil | **14–15 px** | **12 / 20–24** | **100%** o centrado |

- [ ] CTA tocable (≥44 px alto en móvil)

---

## Segmento 5 — 2 columnas (texto | imagen)

| Pantalla | Dirección | Cols |
|----------|-----------|------|
| Escritorio / Grande | Fila | 55% / 45% |
| Tablet / Móvil | **Columna** | **100% / 100%** |

Móvil: margen L/R `0` · padding `16–24` · overflow padre **Oculto**.

- [ ] Sin scroll horizontal

---

## Segmento 6 — Banner foto + overlay

| Pantalla | Overlay texto | Imagen |
|----------|---------------|--------|
| Escritorio | ~40% | absoluta Cover |
| Móvil | **100%** | **Por defecto** (no absoluta) |

- [ ] Banner OK

---

## Cierre

1. **Actualizar / Publicar** en Elementor  
2. Incógnito: `https://ecrgroup.cl/canaldenuncias/?nocache=1`  
3. Revisar móvil + desktop  
4. En organizador: marcar `[ECR] Landing canal denuncias` como hecha

Detalle tipográfico: [`RESPONSIVE-TEXTO.md`](./RESPONSIVE-TEXTO.md) · Ley Karin UI: [`../ley-karin/AJUSTES-ELEMENTOR.md`](../ley-karin/AJUSTES-ELEMENTOR.md)
