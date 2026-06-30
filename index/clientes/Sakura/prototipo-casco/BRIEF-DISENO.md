# Brief de diseño — Casco barrera anti-rascado

## Problema

Gatita de 3,5 kg se rasca detrás de las orejas hasta lastimarse. El collar isabelino protege pero es incómodo. Se busca un **casco modular impreso en 3D** más liviano y ergonómico.

## Principio rector

Ver **`CONCEPTO-CASCO.md`** — bóveda minimalista, orejas por ranuras, secciones para collar. **No espartano.**

```
Pata trasera ──► arco hacia nuca
                      │
                      ▼
              ┌───────────────┐
              │  Bóveda A+C   │  superficie lisa → la pata RESBALA
              │  (no llega    │
              │   a la piel)  │
              └───────┬───────┘
                      │ ranuras B (orejas libres)
              ┌───────▼───────┐
              │  Anillo D TPU │  evita que la bóveda se desplace
              └───────────────┘
```

- **Cobertura prioritaria:** 30 mm detrás de la base de oreja (zona de rascado) + **20 mm de margen** = panel C generoso.
- **Orejas:** ranuras abiertas en la cúpula; nunca copas cerradas.
- **Cuello:** anillo flexible (TPU), nunca collar rígido cerrado.
- **Peso:** objetivo <100 g.

## Flujo Fase 1 → 2

1. ✅ Medidas base registradas (`medidas-gatita.md`, `parametros-cad.json`)
2. ⬜ Completar medidas bigotes / mandíbula / bostezo
3. ⬜ Fotos + video con escala
4. ⬜ Réplica 3D (escaneo o elipsoide paramétrico en Fusion)
5. ⬜ Validación ±2 mm + plantilla cartón 1:1
6. ⬜ Mockup digital A+C sobre réplica (Fase 2)
7. ⬜ Chequeo interferencias pata simulada
8. ⬜ STL prototipo PLA → prueba física → PETG+TPU

## Prompt Fase 2 (modelar bóveda)

```
Cliente: Sakura · Proyecto Prototipo Casco
Fase: 2 — Mockup digital modular sobre réplica 3D

Medidas en: index/clientes/Sakura/prototipo-casco/parametros-cad.json

Diseña en Fusion 360 (paramétrico):
1. Réplica cráneo elipsoide 60×50×30 mm semiejes + ranuras oreja
2. Módulo A+C: bóveda continua PETG, superficie exterior lisa
   - Cubre dorso + nuca con extensión posterior ≥50 mm desde base oreja
   - Interior offset +3 mm sobre réplica
3. Módulo B: dos ranuras 80×25 mm
4. Módulo D: anillo TPU circ. interior 207 mm, altura 15–20 mm
5. Ventilación: perforaciones 4–6 mm en cúpula
6. Exportar STEP + STL; simular arco de pata trasera (radio ~80–100 mm)

No imprimir hasta validar mockup digital y plantilla cartón.
```
