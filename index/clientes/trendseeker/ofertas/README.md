# Hunter · Ofertas carga masiva (2026-08-04)

## Reglas aplicadas
| Grupo | Regla |
|-------|-------|
| Botas mujer/hombre (incl. botines/zuecos) | **40% off** → Precio rebajado = 60% del normal |
| Accesorios | **40% off** |
| Chaquetas / abrigos | **15% off** |
| Zapatillas | **Sin dcto** (precio normal). 2x1 hasta agotar stock (configurar en WooCommerce; este CSV solo deja precio normal) |
| Botas niños | **No incluidas** (fuera de la regla mujer/hombre) |

## Posición oferta
En todas las filas ajustadas: **Posición = 1** (mismo criterio que productos ya en oferta).
En productos padre (variable/simple): etiqueta **Ofertas** agregada.

## Archivos
- `hunter-ofertas-woocommerce-import-2026-08-04.csv` ← **importar este** en WooCommerce
- `hunter-ofertas-import-2026-08-04.csv` ← mismo + columna `_regla_oferta` (auditoría)
- `hunter-ofertas-ids-2026-08-04.txt` ← listado de IDs por regla

## Conteos
| Grupo | Padres | Variaciones/filas precio | Total filas |
|-------|--------|--------------------------|-------------|
| Botas 40% | 82 | 454 | 536 |
| Accesorios 40% | 33 | 55 | 88 |
| Chaquetas 15% | 23 | 88 | 111 |
| Zapatillas normal | 12 | 60 | 72 |
| **Total** | | | **807** |

## Cómo importar
1. WP Admin → WooCommerce → Productos → Importar
2. Subir `hunter-ofertas-woocommerce-import-2026-08-04.csv`
3. Marcar **Actualizar productos existentes**
4. Mapear columnas (ID → ID, Precio rebajado, Precio normal, Posición, Etiquetas…)
5. El **2x1 de zapatillas** no va en el CSV de precios: crear cupón/regla “compra 2 paga 1” en WooCommerce / plugin de ofertas, válida hasta agotar stock.
