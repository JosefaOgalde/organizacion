# MOVA · Día 1 (lunes) — Qué falta para cerrar la tarea `mkof/01`

> Basado en la plantilla del entregable del Día 1:
> - `index/clientes/mkof/Inventario-MOVA-modulos.md`
>
> **Estado actual esperado (según repo):** el archivo aún trae muchos `?` y placeholders.  
> **Cierre del Día 1 = completar esos campos + pasar checklist.**

---

## 0) Confirmación rápida (para alinearnos)

- Tarea del calendario: **`index.html?tarea=mkof/01`**
- Hito: **Día 1 — Inventario módulos M**
- Regla: **solo inventario, no tocar código**

Si esto es distinto al “lunes” que te refieres, dímelo y ajusto el doc a `mkof/02` o al que corresponda.

---

## 1) Lo que te falta (en orden de mayor a menor velocidad)

### 1.1 Completar la tabla (lo más importante)
Abre:
`index/clientes/mkof/Inventario-MOVA-modulos.md`

Y completa **todas** las columnas que están como `?` (salvo el **playbook público**, que puede quedar “público/no/n/a”).

Para cada módulo M registra:
1. **Carpeta cPanel** (ej: `MAESTRO/`, `INGRESOS/`, `mova/`, etc.)
2. **URL completa** (ej: `https://acme-chile.cl/mova/`)
3. **Auth actual** (¿cómo entra hoy? Google OAuth / mova_auth / sesión PHP / ninguno / otro)
4. **¿JWT/localStorage?** (sí/no; si es “parcial” describe dónde)
5. **¿n8n?** (si al cargar/validar hace requests a webhooks n8n)
6. **¿Pasa mova_auth?** (sí/parcial/no)
7. **Responsable** (quién revisó o quién atiende el módulo)
8. **Notas** (cualquier detalle relevante para migración)

**Criterio de cierre del Día 1:** que la tabla quede **sin `?`** en los módulos M (salvo el playbook público).

---

### 1.2 Pegar listado de carpetas desde cPanel
En el mismo markdown, completa la sección:
## Carpetas en servidor

Pegando el listado real de:
`public_html/`

Incluye exactamente cómo se ven las carpetas.

---

### 1.3 Detectar y listar endpoints n8n
En:
## Endpoints n8n detectados

Agrega filas con formato:
| Webhook / URL | Módulo que lo usa | ¿Auth? | Notas |

Cómo encontrarlos rápido:
1. Abre el módulo en navegador (logueado y en incógnito si aplica)
2. DevTools → **Network**
3. Filtra por `webhook`, `n8n`, `hook`, o por el dominio que use n8n
4. Copia la URL del request y anota a qué módulo pertenece

---

### 1.4 Terminar checklist de cierre

Marca cada ítem:
- [ ] Acceso cPanel / FTP GoDaddy confirmado
- [ ] Listado de carpetas en `public_html` pegado arriba
- [ ] URL completa de cada módulo M anotada
- [ ] Flujo actual documentado (Google / mova_auth / otro)
- [ ] JWT o localStorage identificados donde existan
- [ ] Endpoints n8n listados
- [ ] Tabla compartida con el equipo técnico

---

## 2) Mini-formulario para que lo llenes (copiar aquí)

### Tabla: ¿qué módulos siguen con `?`?
- [ ] ______________________
- [ ] ______________________

### ¿Qué endpoints n8n detectaste?
- [ ] ______________________
- [ ] ______________________

### ¿Qué consideras que “no pasa por mova_auth”?
- [ ] ______________________
- [ ] ______________________

### Confirmación para cerrar
- [ ] Todo módulo M completado (sin `?`) ✅
- [ ] Checklist D1 completo ✅

---

## 3) Para seguir (cuando termines)

Cuando quede todo completado, respóndeme:
1) **“OK Día 1”**  
2) Lista 2-3 módulos donde detectaron JWT/localStorage (si hubo)  
3) Qué módulo eligieron como sandbox para el **Día 2 (mkof/02)**

Y pasamos a **Paso siguiente** con el entregable del lunes siguiente (Día 2).

