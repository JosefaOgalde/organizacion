# Evaluación MOVA · ECR-NL (flujo newsletter)

**Código:** ECR-NL  
**Qué evaluar / operar:** playbook automatizable Copys → Portada → Carrusel → Video  
**Entregable MOVA:** HTML + JSON (no es CRC / carga de recetas)

## Archivos vivos

| Pieza | Ruta |
|-------|------|
| HTML operativo | [`../ecr-nl/index.html`](../ecr-nl/index.html) |
| JSON fuente de verdad | [`../ecr-nl/ecr-nl-flujo.json`](../ecr-nl/ecr-nl-flujo.json) |
| Brief completo | [`../../ecr/newsletter/BRIEF-FACTIBILIDAD-ECR-NL-FLUJO-MOVA.md`](../../ecr/newsletter/BRIEF-FACTIBILIDAD-ECR-NL-FLUJO-MOVA.md) |
| PDF (hasta §3) | [`../../ecr/newsletter/BRIEF-FACTIBILIDAD-ECR-NL-FLUJO-MOVA.pdf`](../../ecr/newsletter/BRIEF-FACTIBILIDAD-ECR-NL-FLUJO-MOVA.pdf) |

## URL

Con Laravel: `http://127.0.0.1:8000/index/clientes/MKOF/MOVA/ecr-nl/`

## Veredicto comité (registrado en JSON)

- Cuadrante: `proyecto_mayor` · Esfuerzo 5 · Impacto 8  
- Reduce costos: sí · Score principios: 45% · Estado: **congelado**  
- Condición: métricas + autonomía parcial vía HTML+JSON en MOVA (v1 Copys+Portada)

## Invocar

```
@mova
Operar / evaluar ECR-NL según:
index/clientes/MKOF/MOVA/ecr-nl/ecr-nl-flujo.json
HTML: index/clientes/MKOF/MOVA/ecr-nl/index.html
Brief: index/clientes/ecr/newsletter/BRIEF-FACTIBILIDAD-ECR-NL-FLUJO-MOVA.md
```
