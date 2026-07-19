# Guía — Descargar cPanel y dejarlo en el repo

**Cliente:** MKOF · MOVA  
**Objetivo:** tener una copia del código del servidor en Git (espejo), **sin secretos**.  
**Carpeta destino:** `index/clientes/mkof/espejo-cpanel/`

---

## Antes de empezar

| Pregunta | Respuesta |
|----------|-----------|
| ¿Esto cambia el sitio en producción? | **No.** Solo descargas una copia. |
| ¿Hay que subir todo el hosting? | **No.** Empieza por `mova_auth/`. |
| ¿Se puede subir `config.php`? | **No.** Tiene claves. El `.gitignore` lo bloquea. |
| ¿n8n va aquí? | **No.** Los workflows ya están en el repo GitHub `mova-n8n-workflows`. |

---

## Paso a paso (cPanel GoDaddy)

### 1. Entrar al File Manager

1. Abre cPanel de GoDaddy.
2. Clic en **Administrador de archivos** (File Manager).
3. Navega a: `public_html` → `acme-chile.cl/`

### 2. Comprimir la carpeta

1. Selecciona la carpeta (ej. `mova_auth`).
2. Menú → **Comprimir** / Compress.
3. Tipo: **ZIP**.
4. Confirma. Aparece un archivo tipo `mova_auth.zip` al lado.

### 3. Descargar

1. Clic derecho en el ZIP → **Descargar**.
2. Guárdalo en el PC (Descargas).

### 4. Pegar en el repo

En tu PC (carpeta del repo `organizacion`):

```
index/clientes/mkof/espejo-cpanel/
```

1. Descomprime el ZIP.
2. El contenido de `mova_auth/` debe quedar en `espejo-cpanel/mova_auth/`.
3. Borra el `.zip` (no hace falta en Git).

### 5. Revisar secretos (obligatorio)

Antes de `git add`:

- [ ] ¿Hay `config.php`? → debe quedar **fuera** de Git (`.gitignore` ya lo ignora).
- [ ] ¿Hay `.sql` con datos reales? → no subir.
- [ ] ¿Hay contraseñas en texto? → sacar o no versionar.

### 6. Commit

```bat
cd /d "C:\Users\Josefa Ogalde\organizacion"
git checkout cursor/mova-auditoria-etapa2-d3-d5-459d
git pull
git add index/clientes/mkof/espejo-cpanel/
git status
git commit -m "chore(mova): espejo cPanel mova_auth (sin secretos)"
git push
```

---

## Si el ZIP es muy grande

| Opción | Cuándo |
|--------|--------|
| Solo `mova_auth/` | Primera vez (recomendado) |
| + `mova/erp/` | Antes de migrar sandbox |
| Sin `multimedia/` | Evita fotos/videos pesados |
| Sin `pruebas/` | Obsoleto — no hace falta |

---

## Checklist de cierre

- [ ] ZIP descargado desde cPanel
- [ ] Archivos en `espejo-cpanel/`
- [ ] Secretos no van a Git
- [ ] Commit + push hechos
- [ ] Equipo sabe que el espejo **no** es producción

---

## Siguiente

Con el espejo en el repo, la etapa de **implementación** puede crear `session.php` / `validate.php` / `guard.php` primero en Git y después subirlos a cPanel.
