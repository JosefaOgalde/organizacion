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

**Importante:** los cambios actuales de Impresoreando (logo, PED-006, Fiados, Trade Marketing ECR, etc.) están en la rama  
`cursor/impresoreando-maria-paz-venta-4e97`, **no en `main`**.  
Si solo hacés `git pull` en `main`, vas a seguir viendo lo antiguo.

### Opción recomendada
Doble clic **`TRAER-CAMBIOS.bat`** (fetch + checkout de esa rama + pull + `ABRIR-LARAVEL.bat`).

### Opción manual
```bat
cd "C:\Users\Josefa Ogalde\organizacion"
git fetch
git checkout cursor/impresoreando-maria-paz-venta-4e97
git pull
ABRIR-LARAVEL.bat
```

Abre solo (con `?disco=1`):

- http://127.0.0.1:8000/index.html?disco=1  
- http://127.0.0.1:8000/api/clientes  

Si ves datos viejos: **Ctrl+Shift+R**. El sync de ABRIR solo usa `data\` del repo (ya no Descargas).

---

## Cómo no perder datos al cambiar de PC

Esos archivos **no van a Git** (privacidad). Llévatelos en la carpeta del proyecto (OneDrive) o cópialos a mano:

| Archivo | Qué guarda |
|---------|------------|
| `data/organizacion-live.json` | Calendario, madres, subtareas |
| `backend/database/database.sqlite` | Clientes de la API |

En un PC nuevo, si no tienes `organizacion-live.json`, `ABRIR-LARAVEL.bat` crea uno desde el respaldo `data/organizacion-respaldo-2026-07-17.json` (si está en la carpeta).

También puedes usar **↓ Respaldo** en el organizador, guardar el JSON, y en el otro PC reemplazar `data/organizacion-live.json`.

---

## PHP sin Laragon

Solo hace falta el ejecutable (no abras la app Laragon):

`C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe`

`ABRIR-LARAVEL.bat` ya lo busca solo.
