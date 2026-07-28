# Tronwell · Cabecera Elementor + caché (22 jul 2026)

Registro de lo diagnosticado en la PC de pega (`C:\Users\josef\organizacion`) y en `tronwell.com`.

## Estado final

| URL | Resultado |
|-----|-----------|
| `https://tronwell.com/?nocache=1` | Cabecera **completa** (franja cursos, menú, botones) |
| `https://tronwell.com` | A veces **solo logo** → copia vieja en caché **fuera de WP** |

**Conclusión:** la cabecera buena **sí está publicada** en Elementor. Sin panel de hosting no se pudo vaciar la caché del servidor/CDN.

## Theme Builder (Elementor)

- Ruta: Plantillas → Maquetador de temas → **Cabecera**
- Quedó **1** cabecera activa (punto verde), condición **Todo el sitio**
- Miniatura: franja superior + INICIO / TUTOR IA / CONTACTO + Test de nivel / Acceso alumnos
- La cabecera **duplicada** (gris, sin condiciones) no se muestra; no reactivarla a ciegas (provocó error crítico al publicarla mal)

## Qué se hizo (y qué no)

Hecho:

1. `git checkout main` + `git reset --hard origin/main` en la PC josef (antes estaban en `cursor/jm-mobile-fixes-6a09` y `main` divergida).
2. Laravel unificado con `ABRIR-LARAVEL.bat` (data live desde respaldo 21 jul).
3. Diagnóstico cabecera: condiciones Theme Builder + LiteSpeed.
4. Purge LiteSpeed (“Todas las cachés purgadas”) — **no cambia** el HTML viejo en la URL limpia.
5. Aviso LiteSpeed Toolbox: LSCache de páginas **no disponible** sin servidor LiteSpeed ni QUIC.cloud → no activar QUIC.cloud solo por esto.
6. Elementor → Herramientas → **Vaciar archivos y datos** (regenera CSS; no despublica plantillas). Tras usarlo hubo un **error crítico** temporal; el admin volvió.
7. Desactivar LiteSpeed Cache (temporal) → **no** arregló la URL sin `nocache`.
8. Ajustes → Enlaces permanentes → Guardar → **no** arregló.

No se pudo (solo acceso WP, opción **C**):

- Vaciar caché de cPanel / Varnish / Cloudflare / CDN del hosting.

## Pedido al dueño del hosting

> En tronwell.com la cabecera nueva ya está publicada (se ve con ?nocache=1), pero sin eso a veces sale la vieja (solo logo). ¿Pueden vaciar la caché del servidor / CDN / Varnish / Cloudflare del sitio?

## Cómo revisar cambios de cabecera

1. Theme Builder → Cabecera → editar la **verde** (no duplicar otra a menos que sea necesario).
2. Publicar / Actualizar.
3. Probar: `https://tronwell.com/?nocache=1`
4. Pedir purge en hosting para que `https://tronwell.com` quede igual.
5. Evitar: publicar dos cabeceras con “Todo el sitio”; vaciar Elementor a lo loco si el sitio está inestable.

## Relacionado en el repo

- Landing portal: `index/clientes/tronwell/`
- Home Elementor FAQ (no tocar sin autorización): `index/clientes/tronwell/home/NO-EDITAR-SIN-AUTORIZACION.txt`
- Flujo Laravel local: `docs/laravel/EN-CUALQUIER-PC.md` · `ABRIR-LARAVEL.bat`
