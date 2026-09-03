# Evaluación MOVA · ECR-NL v2

**Código:** ECR-NL  
**Responsable:** Josefa Ogalde · `rol-ecr-cm`  
**Reenvío:** 2026-09-03 (post Congelado 45%)

## Qué cambió vs v1

1. **Flujo real** (pizarra): fechas+copys → OK externo → portada MJ+Canva → VB int/ext → carrusel → VB → video+publicar.  
2. **Validación:** observaciones **solo si aplica** (no loops vacíos).  
3. **Consolidado SEO → JSON:** columnas con dueño, tickets VB, KPIs.  
4. **Autonomía redefinida:** producción texto/prompt/estado sin redacción humana; MJ/Canva humanos acotados.  
5. **Métricas + TCO + ROI** numéricos.  
6. **HTML + JSON** ya en MOVA.

## Archivos

| Pieza | Ruta |
|-------|------|
| Brief v2 | `../../ecr/newsletter/BRIEF-FACTIBILIDAD-ECR-NL-FLUJO-MOVA.md` |
| HTML | [`../ecr-nl/index.html`](../ecr-nl/index.html) |
| JSON | [`../ecr-nl/ecr-nl-flujo.json`](../ecr-nl/ecr-nl-flujo.json) |

## Invocar reevaluación

```
@mova
Reevaluar ECR-NL v2 según:
index/clientes/ecr/newsletter/BRIEF-FACTIBILIDAD-ECR-NL-FLUJO-MOVA.md
JSON/HTML: index/clientes/MKOF/MOVA/ecr-nl/

Entregar: nuevo score estimado + descongelar v1 sí/no + riesgos residuales.
```
