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

## Cómo configurarlo en WordPress

Site: https://trendseeker.cl/

1. WP Admin → **WooCommerce → Discount Rules → Add New Rule**
2. **Discount type:** `Buy X Get Y`
3. **Rule name:** `[PRUEBA] 2x1 Hunter Zapatillas — más barato 100%`
4. **Filter (Buy X) — productos que cuentan para la promo**
   - Opción A (recomendada para la prueba):  
     - Filter type: **Category** → `Zapatillas`  
     - Y agregar condición / segundo filtro de **Brand** → `Hunter`  
       (Perfect WooCommerce Brands está activo; si “Brand” no aparece en Filters, usá Opción B)
   - Opción B (más segura para prueba corta):  
     - Filter type: **Products** → seleccionar solo las zapatillas Hunter Travel (lista abajo)
5. **Get Y / Discount**
   - Tipo: `Buy X get Y - All` (o Categories/Products **iguales** al filtro, para que el gratis también sea zapatilla Hunter)
   - Count quantities as: **Filter set above**
   - Mode of apply: **Cheapest**
   - Minimum quantity: **2**
   - Maximum quantity: vacío (o 2 si querés que solo aplique exactamente de a 2, sin escalar)
   - Free quantity: **1**
   - Discount type: **Free** (o Percentage **100%**)
   - Recursive:  
     - **Off** para la prueba (solo 1 gratis aunque lleven 4)  
     - **On** si querés 2 gratis al llevar 4, etc.
6. **Conditions (opcional)**
   - Dejar vacío en la prueba, o limitar a rol Admin / cupón secreto si no querés que clientes reales lo vean aún.
7. **Guardar** y dejar la regla **Enabled** solo mientras probás.

Doc oficial Flycart (Buy X Get Y + Cheapest):  
https://docs.flycart.org/en/articles/3810570-buy-x-get-y

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
