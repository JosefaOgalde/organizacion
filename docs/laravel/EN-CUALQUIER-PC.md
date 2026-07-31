# En cualquier computador — mismos pasos, una sola fuente

Para no duplicar datos ni dejar info en cachés distintas, **siempre** el mismo ritual.

## Reglas fijas

1. **Un solo proyecto:** `C:\Users\Josefa Ogalde\organizacion` (o la misma carpeta sincronizada en OneDrive/Git).
2. **Un solo servidor:** Laravel en `http://127.0.0.1:8000`
3. **Dos URLs de trabajo (y ninguna más):**
   - Organizador: http://127.0.0.1:8000/index.html
   - API clientes: http://127.0.0.1:8000/api/clientes
4. **No uses:** Laragon Start All, MySQL, Node, puerto 3000, `file://`, otra copia del repo.
5. **Fuentes de verdad (solo estas):**
   - Calendario / madres / tareas → `data/organizacion-live.json` (vía `/api/organizacion`)
   - Clientes API → `backend/database/database.sqlite`
6. El **navegador (localStorage)** es solo caché: al abrir, se pisa con lo del servidor.

---

## Pasos en cualquier PC (iguales siempre)

La entrega actual está en **`main`**.

### Opción recomendada (un solo doble clic)
**`EMPEZAR-AQUI.bat`** (o `TRAER-CAMBIOS.bat`) → `git pull` en main + restaura el calendario desde Descargas + abre Laravel.

**Para no buscarlos:** una vez, doble clic en **`CREAR-ACCESOS-ESCRITORIO.bat`**.  
Quedan 4 iconos en el Escritorio; el del día a día es **«1. Organizacion - Empezar aqui»**.

No hace falta pegar la ruta del JSON: Windows ya sabe tu carpeta  
(`C:\Users\Josefa Ogalde\Downloads\…` vía `%USERPROFILE%\Downloads`).

Guía corta en la raíz del repo: `00-LEEME-INICIO.txt` (aparece arriba en el Explorador).

### Opción manual
```bat
cd "C:\Users\Josefa Ogalde\organizacion"
git checkout main
git pull origin main
ABRIR-LARAVEL.bat restaurar
```

Abre solo (con `?disco=1`):

- http://127.0.0.1:8000/index.html?disco=1  
- http://127.0.0.1:8000/api/clientes  

Si ves datos viejos: **Ctrl+Shift+R**.

### Si algo falla

| Síntoma | Qué hacer |
|---------|-----------|
| `git pull` bloqueado por seed | `git checkout -- data\impresoreando-seed.json` → otra vez `TRAER-CAMBIOS.bat` |
| `SQLSTATE … no such column: activo` | `REPARAR-SQLITE-ACTIVO.bat` → `ABRIR-LARAVEL.bat` |
| Calendario viejo / faltan tareas | `ABRIR-LARAVEL.bat restaurar` / `RECUPERAR-CALENDARIO.bat` o `IMPORTAR-RESPALDO.bat` con el JSON de Descargas `(1)` → `?disco=1` + Ctrl+Shift+R |
| `Falta backend\artisan` | Crear Laravel local: `composer create-project laravel/laravel backend` (ver `BACKEND-README.md`) |

---

## Cómo no perder datos al cambiar de PC

Esos archivos **no van a Git** (privacidad). Llévatelos en la carpeta del proyecto (OneDrive) o cópialos a mano:

| Archivo | Qué guarda |
|---------|------------|
| `data/organizacion-live.json` | Calendario, madres, subtareas |
| `backend/database/database.sqlite` | Clientes de la API |

En un PC nuevo, si no tienes `organizacion-live.json`, `ABRIR-LARAVEL.bat` crea uno desde el respaldo más reciente (`Descargas` 31-jul `(1)` o `data/organizacion-respaldo-2026-07-31.json`; si no, 29/28-jul).

También puedes usar **↓ Respaldo** en el organizador, guardar el JSON, y en el otro PC: `ABRIR-LARAVEL.bat restaurar`.

---

## PHP sin Laragon

Solo hace falta el ejecutable (no abras la app Laragon):

`C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe`

`ABRIR-LARAVEL.bat` ya lo busca solo.
