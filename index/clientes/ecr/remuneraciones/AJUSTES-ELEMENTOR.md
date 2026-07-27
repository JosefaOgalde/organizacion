# Ajustes Elementor — Landing Remuneraciones (software)

**URL principal:** https://ecrgroup.cl/remuneraciones/  
**No confundir con:** https://ecrgroup.cl/soluciones/remuneraciones/ (servicio de outsourcing; página distinta, más corta).

**Fecha auditoría live:** 2026-07-27  
**Objetivo:** limpiar estructura Elementor + tipografía/layout responsive → **Actualizar**.

Relacionado: tipografía [`RESPONSIVE-TEXTO.md`](./RESPONSIVE-TEXTO.md) · checklist [`DEJAR-OK.md`](./DEJAR-OK.md) · patrón UI [`../ley-karin/AJUSTES-ELEMENTOR.md`](../ley-karin/AJUSTES-ELEMENTOR.md).

---

## Lo que ya está OK (no romper)

- Menú / header del sitio.
- Bloque **Beneficios** (4 ítems: Cálculo automático, Cumplimiento normativo, Ahorro de tiempo, Reportes).
- Bloque industrias (Retail, Logística, Telecom, Finanzas, Salud, Energía).
- CTA “Agenda una demo” / form de consulta (contenido).
- Blog relacionado con artículos (si se muestra con posts; ver punto 4).

---

## Problema 1 — H1 duplicado en el hero (prioridad alta)

En live el título aparece **dos veces** idéntico:

> Software de Remuneraciones Online | ECR Group

Mismo patrón que otras landings ECR (widget Heading duplicado o contenedor clonado).

### Arreglo

1. Abrí la página en Elementor → zoom al **hero** (primera sección bajo el menú).
2. En el **árbol de navegación**, buscá dos widgets **Título / Heading** con el mismo texto.
3. **Borralo uno** (dejá solo un H1). Preferí el que tenga la tipografía correcta.
4. El subtítulo / párrafo bajo el H1 debe quedar **una sola vez**.
5. Vista previa Desktop + Móvil: un solo título grande.

---

## Problema 2 — Headings vacíos (prioridad alta)

En el HTML live hay **títulos vacíos** antes de:

- “¿Qué es el Software de Remuneraciones?”
- “Beneficios”
- “¿Para quiénes está diseñado?”
- “Últimas entradas” (si el heading del blog está vacío o huérfano)

### Arreglo

1. Árbol → widgets Heading con texto en blanco o solo espacios.
2. **Eliminarlos** o pegar el texto real si eran placeholders.
3. Cada sección debe tener **un** H2 visible, no un H2 vacío + otro con texto.

---

## Problema 3 — Dos columnas que se aplastan en móvil

Secciones típicas: texto | imagen / mockup del software.

### Arreglo (modo Móvil → Tablet)

1. Contenedor padre de 2 cols → **Dirección: Columna**.
2. Cada columna → **Ancho 100%**, ancho mínimo vacío / `auto`.
3. Márgenes L/R `0`, padding horizontal `16–24`.
4. Overflow del padre: **Oculto** si hay scroll horizontal.
5. Imagen / mockup: ancho `100%` o máx. ~320 px centrado; **sin** `position: absolute` en móvil.

Desktop: pueden seguir en **fila** (55/45 o 50/50). No copiar valores de móvil a desktop.

---

## Problema 4 — Bloque “Últimas entradas” vacío o raro

Si en Elementor hay un widget de posts sin entradas / heading vacío:

- Ocultá la sección en móvil/desktop **o**
- Conectá el query a la categoría correcta **o**
- Eliminá el bloque si el blog relacionado de abajo ya cubre el caso.

No dejar un H2 “Últimas entradas” sin contenido.

---

## Problema 5 — Formulario (accesibilidad / UI)

Campos del form de consulta: Nombre, Email, Teléfono, Empresa, Mensaje, etc.

1. Cada campo con **etiqueta visible** (o placeholder + label en Elementor Form).
2. Botón envío tocable ≥ **44 px** de alto en móvil.
3. En móvil: campos **100%** ancho, sin dos columnas de inputs lado a lado.

---

## Problema 6 — CTA hero

Botón tipo “Agenda una demo” / similar:

| Pantalla | Texto | Padding V/H | Ancho |
|----------|-------|-------------|-------|
| Escritorio | 16–18 px | 14–16 / 28–32 | auto |
| Móvil | **14–15 px** | **12 / 20–24** | **100%** o centrado |

---

## Checklist rápido (Móvil primero)

- [ ] Un solo H1 en el hero
- [ ] Sin headings vacíos en el árbol
- [ ] 2 cols → columna en tablet/móvil
- [ ] Sin scroll horizontal
- [ ] Form usable en móvil
- [ ] Tipografía según [`RESPONSIVE-TEXTO.md`](./RESPONSIVE-TEXTO.md)
- [ ] **Actualizar** + `?nocache=1` en incógnito

---

## Página hermana (opcional, no mezclar)

`/soluciones/remuneraciones/` = servicio (“Gestionamos tu nómina…”).  
Si hay que ajustarla, abrir **esa** página en Elementor (otro post ID). No editar la de software pensando que es la misma.
