# Casco Sakura (Mega Man) — ranuras para collar

## Problema
Tinkercad solo acepta STL de hasta **25 MB**. El casco del prototipo pesa más.

## Entregar STL al agente / reducir en PC
1. Copiá el `.stl` a esta carpeta (ver `PONER-STL-AQUI.txt`).
2. En la raíz del repo:

```bat
REDUCIR-STL-TINKERCAD.bat index\clientes\impresoreando\casco-sakura\NOMBRE.stl
```

O arrastrá el `.stl` encima de `REDUCIR-STL-TINKERCAD.bat`.

3. Sale `NOMBRE-tinkercad.stl` (~20 MB) → importar en Tinkercad.

Manual:
```bat
python scripts\reducir-stl-tinkercad.py "C:\ruta\CASCO.stl" --max-mb 20
```

## Ranuras del collar (en Tinkercad)
1. Importá el STL liviano.
2. Dos cajas → **Agujero**.
3. Colocalas en la **nuca** (borde inferior trasero).
4. Ancho ≈ collar + 2–3 mm · alto ≈ grosor + 1–2 mm.
5. **Agrupar** con el casco → Exportar STL → Cura.

## Alternativa sin Tinkercad
**Meshmixer** (gratis) abre STL grandes sin el límite de 25 MB.

## Organizador
Respaldo vigente: `data/organizacion-respaldo-2026-07-24.json`  
`ABRIR-LARAVEL.bat` lo usa si falta `organizacion-live.json`.
