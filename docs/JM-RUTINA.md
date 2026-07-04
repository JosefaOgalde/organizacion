# Rutina Joyas Mercury — Fase 2

**Rama de trabajo:** `cursor/jm-trabajo-d6a1`  
**Agente Cursor:** `@joyas-mercury`  
**Cliente:** Joyas Mercury (Camila) · **Proyecto:** rediseño joyasmercury.cl

---

## Al empezar a trabajar (cada día)

**Atajo recomendado:**

```bat
cd C:\Users\Josefa Ogalde\organizacion
ABRIR-JM.bat
```

O si primero quieres el organizador con respaldo del día:

```bat
cd C:\Users\Josefa Ogalde\organizacion
ABRIR-ORGANIZADOR-HOY.bat
ABRIR-JM.bat
```

En Cursor: **`@joyas-mercury`** + describe la tarea del día (consulta el organizador).

| Qué | URL |
|-----|-----|
| Portal JM | http://localhost:3000/index/clientes/joyasmercury/ |
| Wireframes desktop | http://localhost:3000/index/clientes/joyasmercury/wireframes.html |
| Organizador | http://localhost:3000/index.html?disco=1 |
| Tarea N (ej. 11) | http://localhost:3000/index.html?tarea=joyas-mercury/11 |

---

## Dos mundos (importante)

| Mundo | Qué es | Qué haces |
|-------|--------|-----------|
| **Producción** | https://joyasmercury.cl | Solo mirar y capturar |
| **Copia WP** | Página **Inicio v2** + Elementor | Implementar rediseño |

Backup local: `%USERPROFILE%\joyasmercury-backup`

---

## Mientras trabajas

- Portal y wireframes: carpeta `index/clientes/joyasmercury/` en el repo
- Guías por día: `index/clientes/joyasmercury/GUIAS-FASE2.md`
- Checklist y Gantt: portal JM o `data/jm-backup-contenido.js`
- Cambios WordPress: en tu backup/staging (no en el repo organizacion)

---

## Al terminar el día

1. En el organizador: botón **↓ Respaldo** (guarda JSON en Descargas).
2. `FUSIONAR-JM-A-MAIN.bat` — commit + push de la rama JM (si hubo cambios en el repo).
3. En GitHub: **Pull Request** `cursor/jm-trabajo-d6a1` → `main` → **Merge**.
4. Vuelve a `main` en tu PC:

```bat
git checkout main
git pull origin main --no-rebase
```

---

## Archivos clave

| Archivo | Función |
|---------|---------|
| `ABRIR-JM.bat` | Servidor + sync + abre portal JM |
| `ABRIR-ORGANIZADOR-HOY.bat` | Pull main + sync + calendario |
| `ACTUALIZAR-RAMA-JM.bat` | Trae `main` a tu rama JM |
| `FUSIONAR-JM-A-MAIN.bat` | Sube rama y recuerda crear PR |
| `IMPORTAR-RESPALDO.bat` | Importar JSON manual a disco |
| `RECUPERAR-JM.bat` | Forzar código JM desde GitHub (emergencia) |

---

## Handoff y guías

- Invocar agente: `docs/cursor/INVOCAR-AGENTE-JM.md`
- Portal: `docs/JM-LANDING-HANDOFF.md`
- Día 1 menú: `index/clientes/joyasmercury/dia-1/README.md`
