# Trendseeker · Promo prueba 2×1 Hunter zapatillas

**Objetivo:** si el carrito lleva **2 productos elegibles**, el **más barato** queda con **100% de descuento** (gratis).

**Alcance de prueba:** solo **zapatillas de la marca Hunter** (no botas, no accesorios, no otras marcas).

**Estado:** prueba / borrador de regla — no ampliar a toda la tienda hasta validar.

---

## Resumen de la regla

| Campo | Valor |
|-------|--------|
| Nombre sugerido | `[PRUEBA] 2x1 Hunter Zapatillas — más barato 100%` |
| Lógica | Llevás 2 → 1 (la más barata) a $0 |
| Marca | Hunter |
| Categoría | Zapatillas |
| Tipo descuento | 100% / Free sobre la unidad más barata |
| Plugin | **Discount Rules for WooCommerce PRO** (ya instalado: `woo-discount-rules` + `woo-discount-rules-pro`) |

---

## Si ves «Buy X Get Y - Products» con Select Product en rojo

Eso pasa porque elegiste **Products** (pide elegir productos Get Y a mano).

**Opción recomendada (cambiar el tipo):**
1. En el desplegable de Discount (donde dice `Buy X Get Y - Products`) cambiá a **`Buy X get Y - All`** / Todos  
2. El campo rojo **Select Product** desaparece  
3. Dejá el resto igual:
   - Buy X Count = **Filters set above**
   - Mode = **Cheapest**
   - Min = **2** · Max = **0** (sin tope)
   - Free qty = **1**
   - Discount = **Free**
   - Recursive = **OFF**
4. Guardar

**Opción B (si no existe All):**  
Quedate en Products y en **Select Product** agregá **todas** las zapatillas Hunter Travel (las 11). Así el “gratis” solo puede ser una de esas.

No toques Recursive. No agregues condiciones de cantidad abajo.

---

## Productos de prueba (Hunter + Zapatillas)

Taxonomía viva en el sitio (ago 2026):

- Marca `Hunter` → `product_brand` id **424** · https://trendseeker.cl/marca/hunter/
- Categoría `Zapatillas` → `product_cat` id **145**
- Intersección actual: **11 productos** (Travel)

Ejemplos:

- https://trendseeker.cl/producto/zapatillas-deportivas-travel-para-hombre-black/
- https://trendseeker.cl/producto/zapatillas-deportivas-travel-para-mujer-black/
- https://trendseeker.cl/producto/zapatilla-travel-trainer-black-hombre/
- https://trendseeker.cl/producto/zapatillas-deportivas-travel-para-hombre-zesty-yellow/
- https://trendseeker.cl/producto/zapatillas-deportivas-travel-para-mujer-red/

> Nota: hoy varias Travel están al mismo precio (~$59.995). La regla igual aplica: al llevar 2, **una unidad** queda en $0. Para ver claro “el más barato”, bajá temporalmente el precio de una (o usá otra zapatilla Hunter más barata si existe).

---

## Checklist de prueba

Ver archivo: `CHECKLIST-PRUEBA.txt`

Casos mínimos:

1. **2 zapatillas Hunter distintas** → 1 con 100% off (la más barata).  
2. **2 unidades de la misma zapatilla Hunter** → 1 unidad gratis.  
3. **1 sola zapatilla Hunter** → sin descuento.  
4. **2 botas Hunter** (o calcetines) → **sin** descuento (fuera de alcance).  
5. **1 zapatilla Hunter + 1 de otra marca** → **sin** descuento (o solo cuenta la Hunter: no llega a 2 elegibles).  
6. **2 zapatillas otra marca** → sin descuento.

---

## Apagar / no publicar aún

- En Discount Rules → desactivar (**Disable**) la regla `[PRUEBA]…`  
- O poner fecha fin / condición de cupón si el plugin lo permite  
- No dejar la regla activa en producción si la prueba era solo interna

---

## Qué no hace esta regla

- No aplica a botas, zuecos, accesorios Hunter  
- No aplica a zapatillas de otras marcas  
- No requiere Looker / Metricool / nada externo  

Cuando la prueba esté OK, se puede ampliar (ej. todo Hunter calzado, o toda la tienda) en una regla nueva, sin tocar esta de prueba.
