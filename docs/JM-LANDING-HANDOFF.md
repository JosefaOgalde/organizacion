# Joyas Mercury · Landing cliente — Handoff de sesión

Documento de continuidad para retomar el trabajo. Última actualización: **28 jun 2026**.

---

## Rama y PRs

| Item | Valor |
|------|--------|
| **Rama activa** | `cursor/jm-landing-cliente-d6a1` |
| **Rama alternativa (fusionada)** | `cursor/landing-imagenes-clientes-d6a1` |
| **PR carrusel + imágenes** | [#9](https://github.com/JosefaOgalde/organizacion/pull/9) |
| **PR landing JM anterior** | [#8](https://github.com/JosefaOgalde/organizacion/pull/8) |

### Al retomar mañana

```bash
cd organizacion
git pull origin cursor/jm-landing-cliente-d6a1
npx serve .
```

Landing: **http://localhost:3000/index/clientes/joyasmercury/**

---

## URLs importantes

| Qué | Ruta |
|-----|------|
| Landing cliente JM | `/index/clientes/joyasmercury/` |
| Organizador | `/index.html` |
| Carpeta PNG carrusel | `/index/clientes/JoyasMercury/interfaces/referencia-landings/` |
| Listado carrusel (JSON) | `.../referencia-landings/carrusel.json` |
| Manifiesto JS | `.../referencia-landings/carrusel.manifest.js` |

---

## Carrusel «Landings referencia» (7 capturas)

### Archivos esperados en la carpeta

```
index/clientes/JoyasMercury/interfaces/referencia-landings/
├── 01-inicio-referencia.png
├── 02-esencial-referencia.png
├── 03-gold-referencia.png
├── 04-deluxe-referencia.png
├── 05-carrito-referencia.png
├── 06-ayuda-referencia.png
├── 07-productos-referencia.png
├── carrusel.json          ← lista para el navegador
├── carrusel.manifest.js   ← fallback estático
└── README.md
```

### Cómo se cargan las imágenes (orden de prioridad)

1. **Escaneo automático** de la carpeta vía listado HTML de `npx serve` (`jmCargarLandingsCarruselDesdeDirectorio`)
2. Si falla → **`carrusel.json`**
3. Si falla → **`carrusel.manifest.js`** (7 entradas por defecto)

Función principal: `window.jmActualizarLandingsCarrusel()` en `data/jm-backup-contenido.js`  
La landing espera `window.jmLandingsCarruselReady` antes de renderizar (`jm-landing.js`).

### Sincronizar después de agregar/reemplazar PNG

```bash
python3 scripts/sync-jm-landings-carrusel.py
```

Regenera `carrusel.manifest.js` + `carrusel.json` y sube `JM_LANDINGS_CARRUSEL_VERSION`.

### Problema que tuvo el usuario (resuelto)

- Estaba en rama vieja sin los cambios → solo veía **4** imágenes y contador **1/4**
- Los PNG 05–07 estaban en su PC pero no en git / no había hecho `git pull`
- **Solución:** `git pull origin cursor/jm-landing-cliente-d6a1` + reiniciar `npx serve` + Ctrl+Shift+R

---

## Edición de imágenes en la landing

### Modo edición JM

1. Abrir landing → botón **Editar datos** (arriba derecha)
2. En carrusel: recuadro **Reemplazar esta captura** bajo la imagen grande
3. En miniaturas: botones **Cambiar imagen · Editar · Restaurar · Borrar**
4. **Guardar datos** / **Guardar ficha**

### Persistencia (`localStorage` → `organizacion_v2`)

```javascript
cli.ficha.landing = {
  imagenes: [{ id, titulo, notas, dataUrl, creado }],  // galería propia (todos los clientes)
  imagenesOverrides: {},   // reemplazos capturas integradas JM
  imagenesOcultas: [],     // capturas JM ocultas
  imagenesMeta: {}         // título/notas de capturas JM
}
```

### Bug CSS corregido

Los botones no aparecían porque `ficha-doc:not(.ficha-doc--edicion)` ocultaba las barras.  
Fix: añadir `ficha-doc--edicion` al `<article>` cuando `modoEdicion` está activo (`jm-landing.js`).

---

## Galería «Imágenes cargadas» (todos los clientes)

- Módulo: `index/assets/cliente-landing-imagenes.js`
- Portal genérico: **Editar landing** en cada cliente (`portal-cliente.js`)
- Ficha modal organizador: sección imágenes en modo edición (`ficha-cliente.js`)

Acciones: **Agregar · Reemplazar · Editar título/notas · Borrar**

---

## Archivos clave del código

| Archivo | Rol |
|---------|-----|
| `index/clientes/joyasmercury/index.html` | Shell landing JM |
| `index/assets/jm-landing.js` | App landing (editar datos, render, guardar) |
| `index/assets/jm-landing.css` | Estilos landing + editor imágenes |
| `data/jm-backup-contenido.js` | HTML carruseles, prototipos, `jmActualizarLandingsCarrusel`, `initJMImagenesEditorUI` |
| `index/assets/cliente-landing-imagenes.js` | CRUD galería imágenes clientes |
| `index/assets/portal-cliente.js` | Portal por cliente + modo edición |
| `ficha-cliente.js` | Ficha modal organizador |
| `scripts/sync-jm-landings-carrusel.py` | Sync PNG → manifest + JSON |

---

## Commits relevantes (más recientes primero)

```
a0917b7 fix(jm): carrusel auto-detecta todos los PNG de referencia-landings
aa7e90e fix(jm): carrusel carga todos los PNG via carrusel.json
0927892 feat(jm): carrusel landings con Carrito, Ayuda y Productos
ff4f3c8 feat(jm): manifiesto carrusel landings + cache bust
1a484ea ux(jm): aclarar reemplazo de landings
6bfda7e fix(jm): mostrar botones cambiar imagen en modo edición
3073ebc feat(landings): galería imágenes CRUD todos los clientes
ba24a26 feat(jm): permitir reemplazar imágenes del prototipo
c8ed7c4 feat(jm): wireframe ficha producto
7612a6c fix(jm): carrusel mockups referencia Inicio-Esencial-Gold-Deluxe
```

---

## Pendiente / verificar mañana

- [ ] Confirmar que en PC local están los **7 PNG** en `referencia-landings/` (05, 06, 07)
- [ ] Ejecutar `python3 scripts/sync-jm-landings-carrusel.py` si se agregaron archivos nuevos
- [ ] `git pull` + `npx serve` + recarga forzada → contador debe decir **1 / 7** (o más si hay más PNG)
- [ ] Probar **Editar datos** → botones bajo visor grande y miniaturas
- [ ] Si las imágenes siguen en 4: revisar en DevTools → Network si se pide `carrusel.json` y los PNG 05–07
- [ ] Commitear los PNG nuevos al repo si aún no están en git (`git add` + `git push`)
- [ ] Fusionar PR #8 / #9 a `main` cuando esté validado

---

## Otras secciones de la landing JM (ya existentes)

- **Nuevo prototipo** — mockups inicio, colecciones, carrito, ayuda, producto
- **Wireframes / prototipo interactivo** — flujo pasos 1–8
- **Identidad, objetivos, menú, mapa, Gantt, checklist 20 tareas** — sincronizado con calendario organizador

---

## Comandos rápidos

```bash
# Servidor local
npx serve .

# Sync carrusel tras cambiar PNG
python3 scripts/sync-jm-landings-carrusel.py

# Actualizar código
git pull origin cursor/jm-landing-cliente-d6a1

# Ver PNG en carpeta
ls index/clientes/JoyasMercury/interfaces/referencia-landings/*.png
```

---

## Contacto / contexto cliente

- **Cliente:** Joyas Mercury (`cli-joyas-mercury`)
- **Sitio:** joyasmercury.cl
- **Tipo:** Freelance · Fase 2 diagramación e-commerce
