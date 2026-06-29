# Handoff — MKOF · Proyecto MOVA (Auditoría Charlas)

Documento de continuidad: **todo lo acordado en la conversación** para retomar desde otro computador.

**Última actualización:** 29 jun 2026  
**Rama Git:** `cursor/mova-cliente-portal-agente-7749`  
**PR:** https://github.com/JosefaOgalde/organizacion/pull/18  
**Repo:** https://github.com/JosefaOgalde/organizacion

---

## 1. Contexto del proyecto

| Campo | Valor |
|-------|--------|
| **Cliente** | MKOF - Talk (full time) |
| **Subproyecto** | **MOVA** — Auditoría Charlas |
| **Workspace original** | `MOVA-Auditoria-Charlas` (carpeta aparte en Windows) |
| **Relación** | MOVA **no** es cliente aparte; vive **dentro de MKOF** (como CLA dentro de Desafío Latam) |
| **Agente Cursor** | `@mova` |
| **Qué hace MOVA** | Auditar charlas: contenido, calidad, criterios/rúbrica, hallazgos e informes |

---

## 2. Decisiones tomadas en la conversación

1. **Unir agente + organizador:** el workspace `MOVA-Auditoria-Charlas` debe integrarse en el repo `organizacion`, no abrirse solo.
2. **MOVA es subproyecto de MKOF**, no un cliente independiente (`cli-mova` eliminado).
3. **Portal:** tarjeta MOVA visible en `MKOF.html` → sección **Proyectos**.
4. **Servidor:** usar `SERVIR.bat` o `node scripts/organizacion-server.js` en puerto **3000** — no mezclar con `npx serve` (cambia de puerto).
5. **No abrir con `file://`** — siempre `http://localhost:3000/...`
6. **Resumen del agente:** visible en portal vía `index/clientes/MKOF/MOVA/RESUMEN.md`
7. **Estilo:** páginas MOVA con fondo claro y tarjeta blanca (legible).

---

## 3. Rutas importantes

```
organizacion/
├── index/clientes/MKOF.html              ← ficha cliente (tarjeta MOVA)
├── index/clientes/MKOF/MOVA.html         ← hub del subproyecto
├── index/clientes/MKOF/MOVA/RESUMEN.md   ← resumen (portal + edición manual)
├── index/clientes/MKOF/MOVA/auditoria-charlas/  ← PEGAR AQUÍ tu código
├── MOVA-Auditoria-Charlas/               ← alternativa raíz (README)
├── .cursor/rules/mova.mdc                ← regla agente @mova
├── docs/cursor/INVOCAR-AGENTE-MOVA.md
├── docs/MKOF-MOVA-HANDOFF.md             ← ESTE archivo
├── ABRIR-MOVA.bat
└── SERVIR.bat
```

---

## 4. URLs (con servidor en :3000)

| Página | URL |
|--------|-----|
| Listado clientes | http://localhost:3000/index/clientes/ |
| MKOF | http://localhost:3000/index/clientes/MKOF.html |
| MOVA | http://localhost:3000/index/clientes/MKOF/MOVA.html |
| Carpeta trabajo | http://localhost:3000/index/clientes/MKOF/MOVA/auditoria-charlas/ |
| Organizador | http://localhost:3000/index.html |
| Tarea MKOF | http://localhost:3000/index.html?tarea=mkof/01 |

---

## 5. Comandos — otro computador (Laragon / Cmder)

### Primera vez en un PC nuevo

```bat
cd /d "C:\Users\Josefa Ogalde\organizacion"
git fetch origin
git checkout cursor/mova-cliente-portal-agente-7749
git pull origin cursor/mova-cliente-portal-agente-7749
```

*(Ajusta la ruta si el usuario o carpeta cambia en el otro PC.)*

### Copiar proyecto MOVA-Auditoria-Charlas

```bat
xcopy "C:\Users\Josefa Ogalde\MOVA-Auditoria-Charlas\*" "C:\Users\Josefa Ogalde\organizacion\index\clientes\MKOF\MOVA\auditoria-charlas\" /E /I /Y
```

Si falla, buscar la carpeta:

```bat
dir "C:\Users\Josefa Ogalde" /s /b | findstr /i "MOVA-Auditoria"
```

O arrastrar manualmente:

```bat
explorer "C:\Users\Josefa Ogalde\organizacion\index\clientes\MKOF\MOVA\auditoria-charlas"
```

### Arrancar servidor

```bat
taskkill /F /IM node.exe
cd /d "C:\Users\Josefa Ogalde\organizacion"
SERVIR.bat
```

### Verificar archivos

```bat
dir index\clientes\MKOF\MOVA.html
dir index\clientes\MKOF\MOVA\RESUMEN.md
dir index\clientes\MKOF\MOVA\auditoria-charlas
```

---

## 6. Cursor — agente @mova

1. **File → Open Folder** → carpeta `organizacion` (raíz del repo).
2. **Ctrl+L** → `@mova` + pregunta.

**Plantilla:**

```
Cliente MKOF · Proyecto MOVA
[describe tarea concreta]
```

**Ejemplos:**

```
Cliente MKOF · Proyecto MOVA
Lee auditoria-charlas/ y actualiza RESUMEN.md con lo hecho.
```

```
Cliente MKOF · Proyecto MOVA
Audita la charla [título] según [criterios]. Entregable: informe con hallazgos.
```

---

## 7. Problemas resueltos en la conversación

| Problema | Causa | Solución |
|----------|-------|----------|
| No carga / página vacía | `npx serve` en puerto distinto (53880) | Solo `SERVIR.bat`; URL con `:3000` |
| No aparece MOVA | Rama `main` sin cambios | `git checkout cursor/mova-cliente-portal-agente-7749` |
| `xcopy` falla | Comando incompleto | Usar comando completo con comillas (sección 5) |
| Texto ilegible en MOVA | Fondo gris oscuro del portal | Corregido: `portal-page--light` + tarjeta blanca |
| Solo placeholder en auditoria-charlas | Código no copiado aún | Copiar `MOVA-Auditoria-Charlas` a la carpeta |
| Resumen del otro agente | No estaba en el repo | Editar `RESUMEN.md` o pedir a `@mova` que lo complete |

---

## 8. Estado actual (pendientes)

- [ ] Copiar **todo** el contenido real de `MOVA-Auditoria-Charlas` → `auditoria-charlas/`
- [ ] Completar `RESUMEN.md` con lo hecho por el agente anterior (chat o archivos)
- [ ] Mergear PR #18 a `main` cuando esté listo
- [ ] Definir rúbrica/criterios de auditoría de charlas (brief MKOF)
- [ ] Crear tareas en organizador para entregables MOVA

---

## 9. Archivos técnicos creados en el repo

| Archivo | Función |
|---------|---------|
| `index/assets/mkof-mova-data.js` | Datos fallback del resumen |
| `index/assets/mova-portal-page.js` | Carga y renderiza `RESUMEN.md` en el portal |
| `index/assets/clientes-data.js` | Proyecto MOVA bajo MKOF |
| `app.js` | Rol `rol-mkof-mova`, agente/skills MKOF |
| `data/agentes-ramas.json` | Entrada `@mova` → `cli-mkof` |
| `.cursor/rules/mova.mdc` | Regla del agente |

---

## 10. Organizador (calendario)

- Cliente: **MKOF** (`cli-mkof`)
- Rol MOVA: **MOVA — Auditoría Charlas** (`rol-mkof-mova`)
- Las tareas MOVA se crean bajo cliente MKOF, rol MOVA.

---

## 11. Cómo retomar en otro PC (checklist rápido)

1. Clonar o `git pull` del repo `organizacion`
2. `git checkout cursor/mova-cliente-portal-agente-7749`
3. Copiar carpeta `MOVA-Auditoria-Charlas` si no está en `auditoria-charlas/`
4. Laragon → **Start All**
5. `SERVIR.bat`
6. Abrir http://localhost:3000/index/clientes/MKOF/MOVA.html
7. Leer este handoff + `RESUMEN.md`
8. Cursor → carpeta `organizacion` → `@mova`

---

## 12. Enlaces útiles

- Guía preguntas por cliente: `docs/GUIA-PREGUNTAS-POR-CLIENTE.md`
- Invocar agente MOVA: `docs/cursor/INVOCAR-AGENTE-MOVA.md`
- README proyecto: `index/clientes/MKOF/MOVA/README.md`
