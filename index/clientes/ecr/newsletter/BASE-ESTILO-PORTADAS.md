# Base de estilo — Portadas newsletter ECR (solo fondo)

**Uso:** base fija para prompts Midjourney.  
**Ignorar siempre:** logos ECR GROUP, títulos, subtítulos, cajas de texto, watermarks.  
**Export LinkedIn:** `--ar 1.91:1` · objetivo final ~1200×627 px.

Esta base se armó a partir del set de portadas de referencia (retail, industria, logística, data/cyber, warehouse, oficina, conceptual).

---

## 1) Qué se conserva SIEMPRE (ADN visual)

### Estilo
- Ilustración digital moderna **vector / flat con profundidad** (no fotografía stock)
- Personajes **estilizados, faceless / siluetas**, sin hiperrealismo fotográfico
- Líneas limpias, formas geométricas, aspecto editorial-corporativo
- A veces textura sutil (papel, grano, pigmento) — nunca sucio ni caótico

### Paleta (firma ECR)
- **Naranja / ámbar / amarillo cálido** ≈ energía, luz, acento de marca (`#E85D04` y vecinos)
- **Azul / teal / navy** ≈ estructura, sombra, frío complementario
- Alto contraste **naranja ↔ azul** (duotone o casi duotone)
- Fondos limpios o bloques de color con **espacio negativo** arriba o a un lado (para tipografía posterior)

### Composición
- Formato horizontal / wide editorial
- Un concepto visual claro (una escena = una idea)
- **Espacio libre** (cielo sólido, bloque de color, negative space) para overlay de título en Canva/Photoshop
- Perspectiva con profundidad (pasillo, warehouse, path, isometric) o bloque diagonal limpio

### Iluminación / mood
- Luz direccional fuerte (glow naranja, rim light, backlit aisle, screens glowing)
- Atmósfera productiva, operativa, tecnológica, profesional
- Optimista / energica, nunca oscura tipo terror ni caótica

### Prohibido en la generación
- Texto, letras, tipografía legible
- Logos, isologos, wordmarks
- UI fake con palabras
- Collage desordenado, clipart genérico, foto realista stock

---

## 2) Motivos / mundos visuales del set (usar según temática)

| # | Mundo visual | Elementos de fondo (sin texto) |
|---|--------------|--------------------------------|
| A | **Retail / supermercado bajo presión** | Pasillo largo, estanterías, carritos, muchedumbre estilizada, piso reflectante, backlight naranja al fondo |
| B | **Sala de control / industria tech** | Monitores con glow naranja, cascos, puestos de trabajo, mitad superior bloque naranja limpio |
| C | **Liderazgo sobre operación** | Figura líder en perfil (traje), boxes/logística al fondo, skyline/industrial simplificado, luz sunset |
| D | **Data / ciber / infraestructura** | Isométrico 3D, cubos/bloques, grid tipo motherboard, líneas naranjas glowing, keyhole/security opcional |
| E | **Bodega / stockroom** | Shelving con cajas naranjas, workers flat, pasillo central, duotone teal+orange |
| F | **Mapa / ruta logística** | Path cinta naranja sobre masa teal, pines, vehículos mini, tablet con charts, fondo ámbar |
| G | **Warehouse + retail humano** | Cajas + flores/mostrador, lámparas colgantes naranjas, bloque superior cyan limpio |
| H | **Automatización logística** | Isométrico navy+orange glow, conveyors, AGV, plataformas, racking de fondo |
| I | **Crecimiento / ambición** | Escalones/bloques tipo barra, siluetas en traje ascendiendo, cielo naranja, nubes estilizadas |
| J | **Retail costero / temporada** | Interior tienda azul + vista playa por cristal, acentos naranja, flat minimal |
| K | **Oficina colaborativa** | Perfiles en laptops, diagonal beige/teal, naranja+teal, textura papel |
| L | **Logística urbana limpia** | Camión naranja, edificio sage/teal, árboles finos, glow en entrada |
| M | **Equipo diverso** | Grupo de workers centrado, fondo beige sólido, props industriales simples |
| N | **Warehouse texturizado** | Cajas apiladas, piso reflectante, lámpara cenital, textura pigmento, orange+blue |
| O | **Cerebro / ideas / IA** | Brain 3D soft peach + redes blue + nodos naranja, fondo cream limpio |
| P | **Seguridad / data urbana** | Servidor/cilindro central, escudos keyhole, skyline flat, navy+orange+beige |

---

## 3) Bloque BASE para Midjourney (pegar siempre)

```
Editorial LinkedIn newsletter cover background illustration for ECR Capacitacion brand system, NO text, NO logos, NO letters, NO watermarks, modern corporate flat vector illustration with depth, stylized faceless characters, clean geometric shapes, high-contrast complementary palette of warm orange/amber (#E85D04 family) and deep teal/navy blue, generous negative space for later headline overlay, professional Chilean corporate learning mood, polished editorial composition, wide landscape --ar 1.91:1 --style raw --v 6.1 --no text, typography, letters, logo, watermark, signage, UI words, brand marks
```

---

## 4) Cómo se usa con la temática

Cuando llegue la temática del newsletter:

1. Se elige **1 mundo visual** de la tabla (A–P) que mejor calce con el tema.  
2. Se une: **bloque BASE** + **escena del mundo** + **concepto de la temática**.  
3. Se confirma que no haya texto/logos.  
4. Se entrega el prompt final listo para Midjourney.

---

## 5) Estado

✅ Base de estilo recopilada y guardada.  
✅ Visualización en landing ECR (`ecr/index.html` → Portada Midjourney).  
⏳ El **nombre del artículo** lo entrega siempre el usuario antes de generar el prompt.
