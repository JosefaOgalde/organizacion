# ECR · Canal de denuncias — tipografía responsive

**URL:** https://ecrgroup.cl/canaldenuncias/  
**Fecha:** 2026-07-27  
**Tarea:** `[ECR] Landing canal denuncias`

Página larga (Ley Karin): H1, H2, párrafos y CTAs. Objetivo: que el **texto** se lea bien en desktop / tablet / móvil sin desborde ni “una palabra por línea”.

Relacionado: [`../ley-karin/AJUSTES-ELEMENTOR.md`](../ley-karin/AJUSTES-ELEMENTOR.md) (hero, columnas, botones).

---

## Escala tipográfica recomendada (Elementor)

Aplicar **por breakpoint** (ícono dispositivo junto a Tipografía). Color cuerpo sugerido: `#556880` o el gris/azul del sitio.

### Título H1 (hero / “Canal de denuncia del Acoso…”)

| Pantalla | Tamaño | Altura de línea | Peso |
|----------|--------|-----------------|------|
| Grande | 40–44 px | 1.15–1.2 | 700 |
| Escritorio | 34–38 px | 1.2 | 700 |
| Tablet | 28–30 px | 1.25 | 700 |
| Móvil | **22–24 px** | 1.3 | 700 |

Móvil: margen izq/der `0–12 px`, padding horizontal `12–16`. Evitar márgenes laterales grandes.

### Subtítulos H2 (“Política, Protocolo…”, “Canal de Denuncias Ley Karin”)

| Pantalla | Tamaño | Altura de línea |
|----------|--------|-----------------|
| Grande | 28–30 px | 1.25 |
| Escritorio | 24–26 px | 1.3 |
| Tablet | 20–22 px | 1.35 |
| Móvil | **18–20 px** | 1.35 |

### Párrafos (cuerpo)

Misma proporción que Ley Karin:

| Pantalla | Tamaño | Altura de línea | Color |
|----------|--------|-----------------|-------|
| Grande | 30 px | 40 px | `#556880` |
| Escritorio | 24 px | 35 px | `#556880` |
| Tablet | 20 px | 30 px | `#556880` |
| Móvil | **16 px** | **25 px** | `#556880` |

Ancho máximo del bloque de texto (si el contenedor lo permite): ~720–800 px en desktop para no estirar líneas eternas; en móvil **100%**.

### Botones / CTA (“Haz tu denuncia aquí”)

| Pantalla | Texto botón | Padding vert / horiz |
|----------|-------------|----------------------|
| Escritorio | 16–18 px | 14–16 / 28–32 |
| Tablet | 15–16 px | 12–14 / 24–28 |
| Móvil | 14–15 px | 12 / 20–24 · ancho **100%** o centrado |

---

## Layout que suele romper el texto

1. **Dos columnas** (texto | imagen) que en tablet/móvil siguen en fila → texto aplastado.  
   → En Tablet/Móvil: contenedor **Dirección columna**, cada col **100%**.
2. **Anchos fijos en px** o márgenes negativos → scroll horizontal.  
   → En móvil: ancho `100%`, margen horizontal `0`, overflow del padre **Oculto** si hace falta.
3. **Título con el mismo tamaño que desktop** en móvil → pocas palabras por línea.  
   → Bajar a 22–24 px (H1) / 18–20 (H2).

---

## Checklist en Elementor (vista Móvil → Tablet → Desktop)

- [ ] H1 / H2 / párrafos con tamaños de la tabla **por dispositivo**
- [ ] Contenedores de 2 cols → columna en tablet/móvil
- [ ] Sin scroll horizontal en `canaldenuncias/`
- [ ] CTA visible y tocable (≥44 px alto en móvil)
- [ ] Hard refresh / purge caché tras **Actualizar**

---

## Contenido visto en la URL (referencia)

- H1 largo sobre acoso sexual/laboral y violencia (empresas ECR GROUP)
- CTA “Haz tu denuncia aquí”
- H2 Política/Protocolo/Procedimiento + párrafos Ley N° 21.643
- Bloque “Canal de Denuncias Ley Karin” (procedimiento, confidencialidad)
- Links a políticas PDF

No cambiar copy legal sin aprobación; solo **tamaño, interlineado, anchos y apilado**.
