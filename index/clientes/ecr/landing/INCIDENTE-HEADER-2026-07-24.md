# ECR · Incidente layout / Header — 2026-07-24

**Sitio:** ecrgroup.cl  
**Usuaria:** Josefa Ogalde  
**Hora aprox.:** ~20:30–21:00 (hora local sesión)  
**Rama docs:** `cursor/ecr-landing-hero-texto-63e4`

## Qué se vio

- Home / páginas con **logo, menú y bloques superpuestos**.
- Botones flotantes (“Trabaja con nosotros”, “Contacto”, “Ley Karin”) amontonados.
- En el editor aparecía widget **Slide Everything** (`#jumbo-slider`) en la vista previa.

## Dónde se estaba editando

- Elementor → **Header principal** (Theme Builder), no solo una página suelta.
- URL editor con `active-document` del header.

## Revisiones Elementor (Header)

| Revisión | Cuándo | Autor | Nota |
|----------|--------|-------|------|
| #3992 | hace segundos (sesión) | Josefa Ogalde | Post-bug |
| #134 y anteriores | hace **~3 semanas** (ej. 6 jul) | nalvarez | No hay punto intermedio |

**No existe revisión de “hace 1 hora”.** Por eso restaurar “una más antigua” no recupera el estado de hace una hora: salta de la sesión actual a hace semanas.

## Por qué “aunque restauro, sigue desconfigurado”

1. Al editar el **Header**, Elementor muestra la **página de fondo** debajo → parece que “todo” está roto aunque solo se vea mal el preview.
2. El bug puede estar en la **página** (Home / Canal de Denuncia / otra), no solo en el Header.
3. Puede haber **CSS cache** o conflicto de plugin (Slide Everything / etc.).
4. Sin backup de hace 1 h, Elementor **no puede** volver a ese minuto exacto.

## Pasos de recuperación (orden)

1. Header → Historial → dejar la revisión **nalvarez (hace ~3 semanas)** si era la estable → **Publicar**.
2. Ver el sitio en **ventana de incógnito** (no solo el editor).
3. Si sigue mal: **Páginas → Home** (u otra rota) → Editar con Elementor → Reloj → Revisiones → aplicar → Publicar.
4. **Elementor → Herramientas → Regenerar archivos CSS** → hard refresh / purge caché.
5. Si no alcanza: **Jetpack → Backup** o backup del hosting (~1 h atrás).  
   En el admin también está **All-in-One WP Migration** (útil si hay export previo).

## Qué no hacer

- Seguir saltando revisiones del Header sin mirar el frontend en incógnito.
- Borrar secciones a ciegas.
- Confundir **Elementor → Ajustes** con el historial de una página (ahí no están las revisiones de contenido).

## Contexto del mismo día (antes del incidente)

Trabajo en landing **Modelo Prevención / MPD · Descargas** (post Elementor ~3878 / borrador en sesión previa):

- Botones píldora, hover, tablet 50% (2×2), móvil 100%.
- Enlaces: abrir en **ventana nueva** (engranaje del enlace).
- Compartir sin publicar: WP/Elementor **no** dan link público de borrador; hace falta usuario WP o publicar.

Detalle de diseño Descargas: [`MPD-DESCARGAS-ELEMENTOR.md`](./MPD-DESCARGAS-ELEMENTOR.md).
