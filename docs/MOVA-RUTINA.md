# Rutina MOVA — para que no se pierda nada

**Rama de trabajo:** `cursor/mova-trabajo-d6a1`  
**Agente Cursor:** `@mova`  
**Cliente:** MKOF · **Proyecto:** MOVA (Auditoría Charlas)

---

## Por qué existía el problema de hoy

1. **Código en ramas sin fusionar** — MOVA, Tendencias y Herramientas vivían en ramas distintas; `main` no tenía todo.
2. **Caché del navegador** — el organizador leía `localStorage` viejo en lugar del respaldo en disco.
3. **Solo `git pull` no basta** — hay que ejecutar `ABRIR-ORGANIZADOR.bat` o `ABRIR-MOVA.bat` para cargar datos y servidor.

---

## Al empezar a trabajar (cada día)

**Atajo recomendado (03/07 y siguientes):**

```bat
cd C:\Users\Josefa Ogalde\organizacion
ABRIR-ORGANIZADOR-HOY.bat
```

Hace `git pull`, sync del respaldo más reciente en Descargas/`data/` y abre el calendario con `?disco=1`.

O manualmente:

```bat
cd C:\Users\Josefa Ogalde\organizacion
git checkout cursor/mova-trabajo-d6a1
git pull origin cursor/mova-trabajo-d6a1
IMPORTAR-RESPALDO.bat
ABRIR-ORGANIZADOR.bat
```

En Cursor: **`@mova`** + describe la tarea.

| Qué | URL |
|-----|-----|
| MKOF (tarjeta MOVA) | http://localhost:3000/index/clientes/mkof/ |
| Hub MOVA | http://localhost:3000/index/clientes/MKOF/MOVA |
| Código charlas | http://localhost:3000/index/clientes/MKOF/MOVA/auditoria-charlas/ |
| Organizador | http://localhost:3000/index.html?disco=1 |

---

## Mientras trabajas

- Código MOVA: `index/clientes/MKOF/MOVA/auditoria-charlas/`
- Resumen visible en portal: `index/clientes/MKOF/MOVA/RESUMEN.md` (pide a `@mova` que lo actualice)
- Tareas en organizador: cliente **MKOF**, rol **MOVA**

---

## Al terminar el día

1. En el organizador: botón **↓ Respaldo** (guarda JSON en Descargas).
2. `FUSIONAR-MOVA-A-MAIN.bat` — commit + push de la rama MOVA.
3. En GitHub: **Pull Request** `cursor/mova-trabajo-d6a1` → `main` → **Merge**.
4. Vuelve a `main` en tu PC:

```bat
git checkout main
git pull origin main --no-rebase
```

Así el portal, el organizador y MOVA quedan **todos en main** y no se repite lo de hoy.

---

## Si solo usas el organizador (sin portal MOVA)

```bat
ABRIR-ORGANIZADOR.bat
```

Abre con `?disco=1` y sincroniza el respaldo más reciente desde Descargas.

---

## Archivos clave

| Archivo | Función |
|---------|---------|
| `ABRIR-MOVA.bat` | Servidor + sync + abre MKOF y MOVA |
| `ABRIR-ORGANIZADOR.bat` | Servidor + sync + calendario con datos de disco |
| `ACTUALIZAR-RAMA-MOVA.bat` | Trae `main` a tu rama MOVA |
| `FUSIONAR-MOVA-A-MAIN.bat` | Sube rama y recuerda crear PR |
| `IMPORTAR-RESPALDO.bat` | Importar JSON manual a disco |
| `CERRAR-SERVIDOR.bat` | Mata proceso en puerto 3000 |

---

## Handoff completo

Ver `docs/MKOF-MOVA-HANDOFF.md` y `docs/cursor/INVOCAR-AGENTE-MOVA.md`.
