# Joyas Mercury · Landing cliente — Handoff de sesión

Documento de continuidad para retomar el trabajo. Última actualización: **25 jun 2026**.

---

## Rama y PRs

| Item | Valor |
|------|--------|
| **Rama activa** | `cursor/jm-maqueta-diseno-d6a1` |
| **PR maqueta diseño Inicio** | (pendiente crear) |
| **PR mobile landings** | [#10](https://github.com/JosefaOgalde/organizacion/pull/10) |

### Al retomar

```bash
cd organizacion
git pull origin cursor/jm-maqueta-diseno-d6a1
SERVIR.bat
```

Landing: **http://localhost:3000/index/clientes/joyasmercury/**

Maqueta diseño Inicio: **http://localhost:3000/index/clientes/joyasmercury/interfaces/maqueta-diseno/index.html**

---

## Estado actual del proyecto

### Maqueta diseño · Inicio (NUEVO)

Carpeta: `interfaces/maqueta-diseno/`

Stack: Vite + HTML/CSS + tokens `default_shadcn_theme.css` (adaptación JM).

| Archivo | Rol |
|---------|-----|
| `index.html` | Landing completa desktop |
| `src/styles.css` | Estilos secciones |
| `jm-maqueta-diseno-inicio-desktop.png` | Captura full page |

**Secciones (idénticas a referencia):** hero joyería · trust bar · colecciones · novedades · últimas unidades · footer gold.

**Navbar:** isotipo arriba centrado · Inicio · Colecciones abajo derecha.

En landing JM: sección **Maqueta diseño · Inicio** con botón **Visualizar maqueta completa**.

```bash
python3 scripts/capturar-jm-maqueta-diseno.py
cd interfaces/maqueta-diseno && pnpm dev   # opcional
```

### Carrusel Desktop (7 pantallas)

Carpeta: `interfaces/referencia-landings/`

| # | Archivo | Pantalla |
|---|---------|----------|
| 1 | `01-inicio-referencia.png` | Inicio |
| 2 | `02-esencial-referencia.png` | Esencial |
| 3 | `03-gold-referencia.png` | Gold |
| 4 | `04-deluxe-referencia.png` | Deluxe |
| 5 | `05-carrito-referencia.png` | Carrito |
| 6 | `06-ayuda-referencia.png` | Ayuda |
| 7 | `07-productos-referencia.png` | Productos |

Sección en landing: **Landings referencia** · pestañas Desktop / Móvil · 390px

### Carrusel Móvil (7 pantallas)

Carpeta: `interfaces/referencia-landings-mobile/`

Mismas 7 pantallas en diagramación **390px** (wireframes responsive existentes).

Sección en landing: misma sección **Landings referencia** (pestaña Móvil)

| # | Archivo | Wireframe fuente |
|---|---------|------------------|
| 1 | `01-inicio-referencia-mobile.png` | `mockups-inicio/wireframe-inicio.html` |
| 2 | `02-esencial-referencia-mobile.png` | `mockups-coleccion/wireframe-coleccion.html` |
| 3 | `03-gold-referencia-mobile.png` | idem |
| 4 | `04-deluxe-referencia-mobile.png` | idem |
| 5 | `05-carrito-referencia-mobile.png` | `mockups-carrito/wireframe-carrito-landing.html` |
| 6 | `06-ayuda-referencia-mobile.png` | `mockups-ayuda/wireframe-ayuda-landing.html` |
| 7 | `07-productos-referencia-mobile.png` | `mockups-producto/wireframe-producto-landing.html` |

---

## Comandos clave

```bash
# Servidor con auto-guardado (recomendado)
SERVIR.bat

# Regenerar capturas MOBILE tras editar wireframes
python3 scripts/capturar-jm-referencia-landings-mobile.py
python3 scripts/sync-jm-landings-carrusel-mobile.py

# Regenerar capturas DESKTOP (inicio + colecciones)
python3 scripts/capturar-jm-referencia-landings.py
python3 scripts/sync-jm-landings-carrusel.py

# Subir a GitHub
SUBIR.bat
```

---

## Persistencia (no perder tareas ni imágenes)

Ver **`docs/PERSISTENCIA.md`**.

1. Usar **`SERVIR.bat`** → guarda en `data/organizacion-live.json`
2. Al cerrar: **↓ Respaldo** + **`SUBIR.bat`**

---

## Edición de imágenes en la landing

- **Editar datos** → reemplazar capturas desktop o mobile
- Persistencia: `localStorage` + `organizacion-live.json` (con servidor Node)
- Galería CRUD: `index/assets/cliente-landing-imagenes.js`

---

## Tareas JM (organizador)

20 tareas DEV JM D1–D20 sincronizadas con calendario (color rosa JM).

Completadas (última sesión):
- D1 Auditoría menú · D3 Menú objetivo · D4 Colecciones WC
- Sesión: **Validar carrusel desktop 7 pantallas** ✓ (paso 1 de hoy)

Pendiente inmediato:
- Ajustar wireframes mobile si el cliente pide cambios
- Validar paridad desktop ↔ mobile en las 7 pantallas

---

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `data/jm-backup-contenido.js` | Carruseles, prototipo, maqueta Inicio |
| `index/assets/jm-landing.js` | Landing JM |
| `index/assets/jm-landing.css` | Estilos landing JM |
| `scripts/capturar-jm-referencia-landings-mobile.py` | Genera 7 PNG mobile |
| `scripts/sync-jm-landings-carrusel-mobile.py` | Sync manifest mobile |
| `scripts/organizacion-server.js` | Auto-guardado disco |
| `docs/PERSISTENCIA.md` | Flujo gratis sin costo |

---

## Identidad de marca JM

| Token | Valor |
|-------|--------|
| Gold | `#ECC54A`, `#A97E23` |
| Pink | `#C88F9C` |
| Nude | `#D8BFB1` |
| Gray | `#C4C4C4` |

Logo + isotipo M en `index/clientes/joyasmercury/identidad/`

---

## Próximos pasos sugeridos

1. Revisar las 7 capturas mobile con el cliente
2. Continuar tareas D5+ (URLs/slugs, chips filtro, landings AJAX)
