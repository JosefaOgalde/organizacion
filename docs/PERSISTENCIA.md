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

`index/clientes/joyasmercury/interfaces/referencia-landings/`

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

## Rutina diaria (un clic)

1. Doble clic en **`ABRIR-ORGANIZADOR.bat`**
   - Busca el respaldo más reciente en `data/` y en **Descargas**
   - Actualiza `organizacion-live.json` si hay uno más nuevo
   - Abre el navegador en el organizador

2. Trabaja con normalidad (tareas, landings, imágenes) — cada guardado escribe en disco.

3. Al terminar el día: **↓ Respaldo** en la app (queda en Descargas para la próxima vez).

**No hace falta** `?respaldo=1` ni `IMPORTAR-RESPALDO.bat` cada día si usas `ABRIR-ORGANIZADOR.bat`.

### Regla para agentes y scripts

**Siempre usar el respaldo más actualizado**, no un archivo fijo por nombre. El proyecto ya lo resuelve así:

- Patrón: `organizacion-respaldo-*.json` en `data/` y en `Downloads` (`C:\Users\josef\Downloads\`)
- Criterio: mayor valor entre `respaldoActualizado` (dentro del JSON), fecha en el nombre del archivo y fecha de modificación del disco
- Comando: `node scripts/respaldo-reciente.js` (imprime la ruta ganadora)

Ejemplo conocido (jul 2026): `organizacion-respaldo-2026-07-06.json` — si aparece uno más nuevo, ignorar el viejo.

---

## Archivos importantes

| Archivo | Qué guarda |
|---------|------------|
| `data/organizacion-live.json` | Auto-guardado local (servidor Node) |
| `data/organizacion-respaldo-*.json` | Respaldos manuales en el repo |
| `localStorage` `organizacion_v2` | Copia en el navegador (caché) |
| `cli.ficha.landing.imagenesOverrides` | Reemplazos de imágenes (prototipo + carruseles) en JSON |
| PNG en `referencia-landings/` | Carrusel JM en disco/Git |

---

## Recuperar si algo se rompe

- Importar JSON desde Descargas: **`IMPORTAR-RESPALDO.bat`** (copia a `data/organizacion-respaldo-2026-07-01.json` y `organizacion-live.json`)
- Forzar respaldo del repo: `http://localhost:3000/index.html?respaldo=1`
- Restaurar desde archivo: en consola del navegador (F12), pegar el contenido de un JSON de respaldo en la variable y recargar — o reemplazar `data/organizacion-live.json` y recargar con el servidor Node.
