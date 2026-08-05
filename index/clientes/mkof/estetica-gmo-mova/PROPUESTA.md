# Propuesta estética · grupomakingof.com ↔ MOVA

**Objetivo:** alinear el sitio público [grupomakingof.com](https://grupomakingof.com) con la estética de [acme-chile.cl/mova](https://acme-chile.cl/mova/) (y el puente visual de ACME).

**Estado:** propuesta (no implementación en producción).

---

## 1. Hoy vs destino

| | GMO hoy | MOVA / ACME |
|--|---------|-------------|
| Fondo | Blanco / pastel menta | Verde bosque casi negro `#060E09` / `#091914` |
| Acento | Lima suave en barra | Lima `#93C64A` + celeste `#99EADA` + arena `#E1DFA7` |
| Tipografía | Sans genérica / logo custom | **Instrument Sans** + **IBM Plex Mono** |
| Mood | Marketing claro, amable | Operacional, tech, dark |
| Layout | Hero claro + arcos pastel | Card/panel oscuro, mucho aire, badges mono |

GMO y MOVA ya comparten el **logo MAKING OF** y un verde lima parecido. El gap es tema (light vs dark), tokens y tipografía.

---

## 2. Sistema a copiar de MOVA (tokens reales)

Extraídos de `acme-chile.cl/mova` (`:root`):

```css
--pt: #091914;   /* panel / superficie */
--pt2: #0d2318;
--pt3: #142e1f;
--verde: #93C64A;
--celeste: #99EADA;
--arena: #E1DFA7;
--t1: #E8F0E2;   /* texto principal */
--t2: #7A9878;   /* texto secundario */
--t3: #3A4E38;
--r: 10px;
fondo página: #060E09;
fuentes: Instrument Sans (UI) + IBM Plex Mono (labels, badges, nav caps)
```

---

## 3. Dirección recomendada para GMO

**Opción A — Alineación fuerte (recomendada)**  
Sitio público GMO en **dark MOVA**: mismo fondo, mismos acentos, mismas fuentes. ACME ya presenta al grupo en dark; GMO deja de verse “otra marca pastel”.

**Opción B — Híbrida**  
Hero dark MOVA + secciones de servicios en `--pt2`/`--pt3` (no blanco puro). Útil si quieren conservar sensación “aire”, pero sin pastel.

**No recomendado:** quedarse en blanco/pastel y solo cambiar el verde: sigue viéndose desconectado de MOVA.

### Qué cambia en GMO

1. Fondo global → `#060E09`  
2. Logo / wordmark → color `--verde` (como login MOVA)  
3. Nav → IBM Plex Mono, caps, color `--t2` / hover `--verde`  
4. Headline hero → Instrument Sans 600/700, `--t1`  
5. CTAs → fondo `--verde`, texto `#060E09`  
6. Chips de marcas/dominios → estilo badges MOVA (`@mkof.cl`…)  
7. Cards de servicios → superficie `--pt` / borde `--bd`, radio 10px  
8. Ilustraciones wireframe: pasar a stroke `--verde` / `--celeste` sobre dark (o simplificar)

### Qué se mantiene

- Estructura de contenidos (Servicios / Sobre / Contacto / Blog)  
- Mensaje “your next business partner” (se puede traducir o bilingual)  
- Identidad “Grupo Making Of” / logo geométrico  

---

## 4. Evidencia (pantallazos)

| Archivo | Qué muestra |
|---------|-------------|
| `evidencia/01-mova-hero.png` | Login MOVA dark + lima |
| `evidencia/02-mova-panel.png` | Panel / bienvenida MOVA |
| `evidencia/03-gmo-home.png` | Home GMO light actual |
| `evidencia/04-gmo-seccion.png` | Sección servicios GMO |
| `evidencia/05-acme-home.png` | ACME dark puente a MOVA |

---

## 5. Mock de dirección

Abrir en navegador:

`index/clientes/mkof/estetica-gmo-mova/mock-gmo-mova.html`

Muestra un **primer viewport** de GMO ya con tokens MOVA (hero + nav + CTA). No es el sitio final; es la referencia visual para acordar.

---

## 6. Alcance sugerido (si aprueban)

| Fase | Qué | Nota |
|------|-----|------|
| 1 | Acordar Opción A o B | Esta propuesta |
| 2 | Home + tipografía + tokens CSS | Prioridad |
| 3 | Servicios / Sobre / Contacto | Mismo sistema |
| 4 | Blog (si aplica) | Tipografía + dark cards |

---

## 7. Pedido

Validar si GMO público adopta **dark MOVA (Opción A)** como estándar de marca web del grupo, alineado a ACME + MOVA.
