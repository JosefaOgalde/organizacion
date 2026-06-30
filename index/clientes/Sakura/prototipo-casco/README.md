# Proyecto Prototipo Casco — Sakura

**Casco modular anti-rascado** para felina (3,5 kg). Barrera lisa en nuca/dorso — no encapsulamiento de orejas.

## Estado

| Fase | Estado |
|------|--------|
| 1 Medidas + video | ✅ |
| 2 Mockup digital + simulación pata | ✅ (28,7 g · alcance OK) |
| 2.1 Falda+anillo + flancos 18 mm | ⬜ siguiente |
| Impresión PLA prueba | ⬜ tras cartón 1:1 |

## Documentos

| Archivo | Contenido |
|---------|-----------|
| [FASE-2-RESULTADOS.md](./FASE-2-RESULTADOS.md) | Simulación, masas, checklist |
| [BRIEF-DISENO.md](./BRIEF-DISENO.md) | Principio rector y módulos |
| [medidas-gatita.md](./medidas-gatita.md) | Tabla de medidas |
| [VIDEO-ANALISIS.md](./VIDEO-ANALISIS.md) | Análisis video referencia |
| [parametros-cad.json](./parametros-cad.json) | Valores numéricos |

## CAD (Fase 2)

```
cad/fase-2/
├── replica_gata.stl
├── casco_AC_boveda.stl
├── anillo_D_cuello.stl
├── casco_ensamblado.stl
├── casco_parametrico.scad        ← maestro Fase 2
└── casco_parametrico_v2.1.scad   ← falda+anillo, flancos 18 mm
```

Abrir `.scad` en OpenSCAD → F6 → exportar STL.

## Portal

`index/clientes/Sakura/prototipo-casco.html`

## Cursor

`@sakura-casco`
