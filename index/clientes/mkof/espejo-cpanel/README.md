# Espejo cPanel → repo (MOVA)

Copia de trabajo del hosting **GoDaddy** (`public_html/acme-chile.cl/`) para versionar en Git **sin secretos**.

## Para qué sirve

- Tener el código PHP/HTML del servidor en el repo (respaldo + revisión).
- Comparar lo que hay hoy vs el diseño de auditoría (D3: faltan `session.php`, `validate.php`, `guard.php`).
- **No** reemplaza el servidor: los cambios se suben a cPanel solo cuando el equipo lo decida.

## Dónde poner los archivos

```
espejo-cpanel/
├── README.md          ← este archivo
├── .gitignore         ← bloquea secretos
├── mova_auth/         ← pegar aquí el ZIP de mova_auth/
├── mova/              ← opcional: módulos prioritarios
└── (otras carpetas)   ← solo si el equipo las necesita
```

## Cómo descargar desde cPanel (resumen)

Guía completa: [Guia-descargar-cpanel-al-repo.md](../Guia-descargar-cpanel-al-repo.md) · HTML: [cpanel-espejo.html](../cpanel-espejo.html)

1. cPanel → **Administrador de archivos** → `public_html/acme-chile.cl/`
2. Seleccionar carpeta (empezar por `mova_auth/`) → **Comprimir** → ZIP
3. **Descargar** el ZIP al PC
4. Descomprimir **dentro** de esta carpeta `espejo-cpanel/`
5. Revisar que `config.php` **no** se suba a Git (está en `.gitignore`)
6. `git add` · `git commit` · `git push`

## Orden recomendado

| Prioridad | Carpeta | Motivo |
|-----------|---------|--------|
| 1 | `mova_auth/` | Núcleo login (auditoría D3–D5) |
| 2 | `mova/erp/` | Sandbox de primera migración |
| 3 | `mova/` (resto) | Portal y submódulos |
| 4 | Otras solo si hace falta | Evitar ZIP gigantes de multimedia |

## Nunca subir a Git

- `config.php` con claves / client secrets
- Archivos `.env`, `*.pem`, contraseñas
- Backups `.sql` con datos reales de clientes

Ver `.gitignore` en esta carpeta.
