# ECR · Landing MPD — bloque Descargas

**Cliente:** ECR  
**Página:** Landing MPD  
**Fecha:** 2026-07-24  
**Rama:** `cursor/ecr-landing-hero-texto-63e4`

## Objetivo

Dejar el bloque **Descargas** (estado actual ≈ ima 1) con el diseño de referencia (ima 3):

- Caja clara con borde azul fino
- Título “Descargas” centrado
- 4 botones en fila, forma **píldora**
- Estilo normal: fondo azul claro + texto/icono azul + borde azul
- Estilo activo/destacado (Procedimiento MPD): fondo azul oscuro + texto/icono blanco

## Estructura Elementor (ima 2)

```
Contenedor → Contenedor → Contenedor
Sección
  └─ Columna
       └─ Sección interior
            ├─ Columna → Botón  (Políticas del delito)
            ├─ Columna → Botón  (Manual del delito)
            ├─ Columna → Botón  (Procedimiento MPD)  ← destacado
            └─ Columna → Botón  (Tipos de delito)
```

## Configuración actual (referencia pantallazos)

### Primera columna de la sección (ima 4–5)
| Campo | Valor actual |
|-------|----------------|
| Ancho columna % | vacío (auto) |
| Alineación vertical / horizontal | Por defecto |
| Espacio entre widgets | 20 px |

### Sección interior (ima 6–7)
| Campo | Valor actual |
|-------|----------------|
| Ancho del contenido | Ancho completo |
| Espacio entre columnas | Por defecto |
| Margen | Der/Izq = `auto` (centra) |
| Relleno | vacío |

### Botones (ima 8–10)
| Campo | Valor actual | Problema vs ima 3 |
|-------|----------------|-------------------|
| Icono | None | Falta icono descarga |
| Alineación | Centro | OK |
| Tipografía / colores | Globales (casi default) | Texto blanco sobre azul muy claro → poco contraste |
| Radio borde | vacío | No es píldora |
| Padding | vacío | Botones “chatos” |
| Tipo borde | Por defecto | Falta borde azul fino |

---

## Pasos para igualar ima 3

### A) Caja contenedora (borde + fondo)
1. Selecciona la **Sección** (o el Contenedor exterior del bloque Descargas).
2. **Estilo** → Fondo: gris muy claro / off-white.
3. **Estilo** → Borde: sólido, 1–2 px, azul claro (`#7BA3C9` aprox. o el azul de marca MPD).
4. **Avanzado** → Relleno: ~24–40 px arriba/abajo y laterales.

### B) Título “Descargas”
- Ya centrado: mantener.
- Color: navy / gris oscuro (no el azul pálido de los botones actuales).

### C) Sección interior (fila de 4 botones)
1. Editar **Sección interior**.
2. Disposición → Espacio entre columnas: **Estrecho** o **Sin** (o 10–15 px si hay opción custom).
3. Avanzado → Relleno inferior ~16–24 px.
4. En **móvil**: columnas al 100% o 50% (2×2) para que no se aplasten.

### D) Cada columna de botón
1. Ancho: dejar vacío (4 columnas ≈ 25% c/u) o forzar **25** en desktop.
2. Alineación horizontal: **Centro**.

### E) Estilo de botón — estado Normal (los 4)
Aplicar a **Políticas / Manual / Tipos** (y base de Procedimiento):

1. **Contenido**
   - Icono: biblioteca → nube/flecha descarga (cloud download).
   - Posición icono: **Izquierda**.
   - Espaciado icono: 8–10 px.
2. **Estilo → Normal**
   - Color texto: azul medio/oscuro (`#1E4A7A` aprox.).
   - Fondo: azul muy claro (`#D6E6F5` / `#C5D9EE`).
   - Tipo borde: **Sólido**, 1 px, mismo azul del texto o un tono más claro.
   - Radio borde: **40–50 px** (píldora) en los 4 lados.
   - Relleno: Arriba/Abajo **12–14**, Izq/Der **18–22**.
3. **Estilo → Hover**
   - Fondo un poco más oscuro; texto blanco **o** mismo azul más intenso.
4. Tipografía: sans, peso 500–600, tamaño ~14–15 px.

### F) Botón destacado — Procedimiento MPD (ima 3)
Solo en ese botón (o Hover permanente / clase):

| Propiedad | Valor |
|-----------|--------|
| Color texto | Blanco |
| Fondo | Azul oscuro (`#1B3A6B` / navy MPD) |
| Icono | Blanco |
| Borde | Mismo azul oscuro o sin borde |
| Radio | Igual píldora 40–50 px |

Si Elementor no tiene “activo” nativo: deja estos colores en **Normal** solo en Procedimiento MPD.

### G) Contraste (por qué ima 1 se ve mal)
Hoy: fondo azul pálido + **texto blanco** → casi ilegible.  
Ima 3: fondo claro + **texto azul**, o fondo oscuro + **texto blanco**.

---

## Responsive — Botón (tabla por breakpoint)

Valores base Figma desktop: radio **16–20 px**, padding ~**16–20**, color `#0285E2`.  
En Elementor: icono de monitor / tablet / móvil junto a cada campo para cambiar breakpoint.

### Estilo del botón (los 4)

| Propiedad | Pantalla grande | Escritorio | Tablet | Móvil |
|-----------|-----------------|------------|--------|-------|
| Alineación | Centro | Centro | Centro | Centro |
| Color texto / icono (claros) | `#0285E2` | `#0285E2` | `#0285E2` | `#0285E2` |
| Fondo (claros) | `#E8F3FC` / blanco | igual | igual | igual |
| Fondo + texto (Procedimiento MPD) | `#0285E2` + blanco | igual | igual | igual |
| Borde | 2–3 px `#0285E2` | 2–3 px | 2 px | 2 px |
| Radio borde | **20 px** | **20 px** | **16 px** | **16 px** |
| Relleno (Estilo) | 16–20 todos | **20** todos | **14** vert / **16** horiz | **12** vert / **14** horiz |
| Tipografía tamaño | 15–16 px | **15 px** | **14 px** | **13–14 px** |
| Icono espaciado | 8–10 px | **8 px** | **8 px** | **6 px** |
| Ancho botón (Avanzado) | Por defecto / 100% col | Por defecto | **100%** | **100%** |

### Columnas / sección interior

| Propiedad | Pantalla grande | Escritorio | Tablet | Móvil |
|-----------|-----------------|------------|--------|-------|
| Ancho cada columna | 25% | 25% | **50%** (2×2) | **100%** (1 col) |
| Espacio entre columnas | Estrecho / 12–16 px | Estrecho | 10–12 px | 8–10 px |
| Margen sección interior | izq/der auto | izq/der auto | 0 / padding 16 | 0 / padding 12 |
| Relleno sección (caja) | 32–40 | **30 / 24** | **24 / 16** | **20 / 12** |

### Cómo aplicarlo en Elementor
1. Edita el botón → **Estilo** / **Avanzado**.
2. Clic en el icono de dispositivo junto al campo (escritorio → tablet → móvil → grande si aparece).
3. Pon el valor de la tabla en **ese** breakpoint (no pises todos con el mismo).
4. Replica con **Pegar estilo** en los otros botones; ajusta solo Procedimiento MPD (fondo azul + texto blanco).
5. En cada **Columna**: Ancho % → 25 / 25 / 50 / 100 según dispositivo.

## Ajustes hechos en sesión (2026-07-24)

| Tema | Cómo |
|------|------|
| Hover | Botón → Estilo → **Al pasar el cursor** (claros: fondo `#E8F4FC`; MPD: fondo `#026BB5`) |
| Tablet solapados | Vista Tablet → cada columna **50%** (2×2); tipografía ~14–15 si corta texto |
| Abrir aparte | Contenido → Enlace → engranaje → **Abrir en una ventana nueva** |
| Compartir borrador | Sin preview público nativo; publicar o dar usuario WP |

Si el sitio completo se desconfigura (header/logo encima): ver [`INCIDENTE-HEADER-2026-07-24.md`](./INCIDENTE-HEADER-2026-07-24.md).

## Checklist

- [ ] Caja con borde azul y padding
- [ ] 4 botones píldora en una fila (desktop)
- [ ] Icono descarga a la izquierda en los 4
- [ ] 3 botones estilo claro (texto azul)
- [ ] Procedimiento MPD estilo oscuro (texto blanco)
- [ ] Links PDF correctos en cada botón
- [ ] Responsive: columnas 25 / 50 / 100 según tabla
- [ ] Enlaces abren en ventana nueva
- [ ] Publicar + hard refresh / purge caché si aplica

## Archivos PDF (nombres de botones)

1. Políticas del delito  
2. Manual del delito  
3. Procedimiento MPD  
4. Tipos de delito  

*(Pegar URLs de Media Library cuando estén.)*
