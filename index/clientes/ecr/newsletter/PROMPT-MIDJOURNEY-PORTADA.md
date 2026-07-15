# Prompt Midjourney — Portada newsletter ECR

Ver siempre primero: [`BASE-ESTILO-PORTADAS.md`](./BASE-ESTILO-PORTADAS.md)  
(ahí está el ADN visual de las portadas de referencia: solo fondos, sin textos ni logos).

**Tamaño LinkedIn:** `--ar 1.91:1` · export ~1200×627  
**Ignorar siempre en refs:** logo ECR GROUP + tipografías.

---

## Flujo (obligatorio)

1. **Pedir el nombre del artículo** (no inventar el título).  
2. Con el título + la **base de estilo guardada**, armar el prompt.  
3. Entregar / visualizar en la landing del cliente ECR:

`http://localhost:3000/index/clientes/ecr/` → sección **Portada Midjourney**

Ahí se puede escribir el nombre, elegir (o auto-sugerir) el mundo visual A–P y copiar el prompt.

Archivo de la UI: [`ecr-portada-prompt.js`](./ecr-portada-prompt.js)

---

## Bloque BASE (siempre)

```
Editorial LinkedIn newsletter cover background illustration for ECR Capacitacion brand system, NO text, NO logos, NO letters, NO watermarks, modern corporate flat vector illustration with depth, stylized faceless characters, clean geometric shapes, high-contrast complementary palette of warm orange/amber (#E85D04 family) and deep teal/navy blue, generous negative space for later headline overlay, professional Chilean corporate learning mood, polished editorial composition, wide landscape --ar 1.91:1 --style raw --v 6.1 --no text, typography, letters, logo, watermark, signage, UI words, brand marks
```

## Prompt final

Se arma solo cuando el usuario entrega el **nombre del artículo**:

`BASE` + escena del mundo visual + concepto del título + flags.

---

## Checklist antes de generar

- [ ] Nombre del artículo confirmado por el usuario  
- [ ] Mundo visual elegido según tema  
- [ ] Sin texto / sin logos en el prompt  
- [ ] `--ar 1.91:1`  
- [ ] Espacio negativo para título en Canva después  
