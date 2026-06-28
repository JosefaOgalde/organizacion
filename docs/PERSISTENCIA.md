# Persistencia sin costo — Organización + Joyas Mercury

## Por qué se pierden datos al recargar

La app guarda en **localStorage** del navegador (`organizacion_v2`). Eso se borra si:

- limpias caché / datos del sitio,
- cambias de navegador o PC,
- abres con `?respaldo=1` (fuerza el JSON del repo),
- usas solo `npx serve` sin el servidor con auto-guardado.

Las **imágenes PNG** en carpetas del proyecto **sí** viven en disco y en Git. Los reemplazos hechos con «Editar datos» en el navegador van al JSON/localStorage hasta que respaldes.

---

## Recomendado (simple, gratis, Laragon o Windows)

### 1. Servidor con auto-guardado en disco

En lugar de `npx serve`, usa:

```bat
SERVIR.bat
```

o:

```bash
node scripts/organizacion-server.js
```

- Abre `http://localhost:3000/index/`
- Cada vez que guardas (tareas, fichas, imágenes en modo edición), se escribe **`data/organizacion-live.json`**
- Al abrir la app, si ese archivo es más reciente que localStorage, **se carga solo**

### 2. Respaldo en la nube (GitHub — gratis)

Al terminar el día:

1. Clic en **↓ Respaldo** en la app (descarga JSON con fecha).
2. Opcional: copia ese archivo a `data/organizacion-respaldo-AAAA-MM-DD.json`
3. Ejecuta **`SUBIR.bat`** (commit + push al repo).

Así tienes copia en GitHub sin pagar nada.

### 3. Imágenes del carrusel JM (archivos reales)

Carpeta:

`index/clientes/JoyasMercury/interfaces/referencia-landings/`

Tras agregar o cambiar PNG:

```bash
python3 scripts/sync-jm-landings-carrusel.py
SUBIR.bat
```

Los archivos en disco **no dependen** del navegador.

---

## Qué NO hace falta (por ahora)

| Opción | Veredicto |
|--------|-----------|
| **Kubernetes** | Demasiado complejo y con coste indirecto; no aplica. |
| **Laravel + MySQL** | Útil a futuro si quieres BD real; guía en `docs/laravel/`. No obligatorio hoy. |
| **Laragon** | Solo sirve para alojar PHP/MySQL local; tu app es estática + Node. Laragon puede convivir, pero el flujo actual es **Node + Git**. |

---

## Rutina diaria (2 minutos)

1. Abrir con **`SERVIR.bat`**
2. Trabajar con normalidad (tareas, landings, imágenes)
3. Antes de cerrar: **↓ Respaldo** + **`SUBIR.bat`** si quieres copia en la nube

---

## Archivos importantes

| Archivo | Qué guarda |
|---------|------------|
| `data/organizacion-live.json` | Auto-guardado local (servidor Node) |
| `data/organizacion-respaldo-*.json` | Respaldos manuales en el repo |
| `localStorage` `organizacion_v2` | Copia en el navegador (caché) |
| PNG en `referencia-landings/` | Carrusel JM en disco/Git |

---

## Recuperar si algo se rompe

- Forzar respaldo del repo: `http://localhost:3000/index/?respaldo=1`
- Restaurar desde archivo: en consola del navegador (F12), pegar el contenido de un JSON de respaldo en la variable y recargar — o reemplazar `data/organizacion-live.json` y recargar con el servidor Node.
