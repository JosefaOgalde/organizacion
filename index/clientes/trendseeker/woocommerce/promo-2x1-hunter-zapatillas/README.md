# Trendseeker · Promo prueba 2×1 Hunter zapatillas

**Objetivo:** si el carrito lleva **2 productos elegibles**, el **más barato** queda con **100% de descuento** (gratis).

**Alcance de prueba:** solo **zapatillas de la marca Hunter** (no botas, no accesorios, no otras marcas).

**Estado:** prueba / borrador de regla — no ampliar a toda la tienda hasta validar.

---

## Resumen de la regla

| Campo | Valor |
|-------|--------|
| Nombre sugerido | `[PRUEBA] 2x1 Hunter Zapatillas — más barato 100%` |
| Lógica | Cada 2 elegibles → 1 (la más barata) a $0 · **Recursive ON** (4 pares → 2 gratis) |
| Marca | Hunter |
| Categoría | Zapatillas |
| Tipo descuento | 100% / Free sobre la unidad más barata |
| Plugin | **Discount Rules for WooCommerce PRO** (ya instalado: `woo-discount-rules` + `woo-discount-rules-pro`) |

---

## Si llevás 4 pares y solo descuenta 1

Con Recursive **OFF** solo regala 1, aunque lleven 4.

**Fix:** activá la casilla **Recursive?**

Con Min 2 + Free 1 + Cheapest + Recursive ON:
- 2 pares → 1 más barato a $0  
- 4 pares → **2** más baratos a $0  
- 6 pares → 3 a $0  

Get Y sigue en **Products** con las 11 zapatillas Hunter. Max = 999 o vacío.

Detalle: `FIX-RECURSIVE-4PARES.txt`

## Si descuenta otros productos (no solo Hunter)

`Buy X Get Y - All` puede regalar el más barato **de todo el carrito**.

**Fix:** Get Y = **`Buy X Get Y - Products`** + Select Product = solo las 11 zapatillas Hunter. Filtros Category + Brand en **Match all (AND)**.

Detalle: `FIX-SOLO-HUNTER.txt`

## Si ves «Buy X Get Y - Products» con Select Product en rojo

Para esta promo **sí** usá Products (no All) y llená Select Product con todas las zapatillas Hunter.

Dejá:
- Buy X Count = **Filters set above**
- Mode = **Cheapest**
- Min = **2** · Max = **vacío o 999** (no 0)
- Free qty = **1**
- Discount = **Free**
- Recursive = **ON** (para que 4 pares den 2 gratis)
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
2. **4 zapatillas Hunter** → **2** más baratas a $0 (Recursive ON).  
3. **2 unidades de la misma zapatilla Hunter** → 1 unidad gratis.  
4. **1 sola zapatilla Hunter** → sin descuento.  
5. **2 botas Hunter** (o calcetines) → **sin** descuento (fuera de alcance).  
6. **1 zapatilla Hunter + 1 de otra marca** → **sin** descuento (o solo cuenta la Hunter: no llega a 2 elegibles).  
7. **2 zapatillas otra marca** → sin descuento.  
8. **2 Hunter + 1 producto barato otra marca** → el gratis es Hunter, nunca el otro.

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
