# Cómo descargar los archivos STL (si Cursor no deja bajar)

Los archivos están en GitHub, rama `cursor/sakura-cliente-prototipo-casco-aee0` · PR #19

---

## Opción 1 — Enlace directo (más fácil)

Abre en el navegador y guarda el archivo:

**Casco referencia para Cura (recomendado):**
https://github.com/JosefaOgalde/organizacion/raw/cursor/sakura-cliente-prototipo-casco-aee0/sakura-casco-cura.stl

**ZIP casco Cura:**
https://github.com/JosefaOgalde/organizacion/raw/cursor/sakura-cliente-prototipo-casco-aee0/sakura-casco-cura.zip

**ZIP panel nuca + anillo:**
https://github.com/JosefaOgalde/organizacion/raw/cursor/sakura-cliente-prototipo-casco-aee0/sakura-casco-impresora.zip

---

## Opción 2 — Desde el Pull Request

1. Abre https://github.com/JosefaOgalde/organizacion/pull/19
2. Pestaña **Files changed**
3. Busca `sakura-casco-cura.stl`
4. Clic en el archivo → botón **⋯** → **View raw** o **Download**

---

## Opción 3 — Git en tu PC

```bash
cd tu-carpeta-proyectos
git fetch origin cursor/sakura-cliente-prototipo-casco-aee0
git checkout cursor/sakura-cliente-prototipo-casco-aee0
```

Archivos locales después del checkout:

```
sakura-casco-cura.stl
sakura-casco-cura.zip
index/clientes/Sakura/prototipo-casco/cad/fase-2/modular/casco_sakura_referencia_cura.stl
```

---

## Abrir en Cura

1. Cura → **Abrir** → `sakura-casco-cura.stl`
2. Escala **100 %**
3. Si pide reparar malla → **Sí**
