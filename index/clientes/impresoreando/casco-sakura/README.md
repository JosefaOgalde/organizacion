# Casco Sakura (Mega Man) — ranuras para collar

## Problema
Tinkercad solo acepta STL de hasta **25 MB**. El casco del prototipo pesa más.

## Reducir peso (en tu PC)
1. Exportá el STL desde Cura (o usá el archivo original).
2. En la raíz del repo, arrastrá el `.stl` encima de:
   - `REDUCIR-STL-TINKERCAD.bat`
3. Se genera un archivo `…-tinkercad.stl` (&lt; 20 MB aprox.).
4. Importá ese archivo en Tinkercad.

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
