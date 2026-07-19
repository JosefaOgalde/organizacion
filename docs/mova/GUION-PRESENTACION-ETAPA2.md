# Guion · Presentación MOVA Etapa 2 (~20 min)

**Deck:** `index/clientes/mkof/mova-etapa2-presentacion.html`  
**Imprimir PDF:** abrir el HTML → Ctrl+P → Guardar como PDF (una slide por página).  
**Audiencia:** equipo técnico + stakeholders MKOF/MOVA.

---

## Distribución de tiempo

| Minutos | Bloque | Slides | % |
|---------|--------|--------|---|
| 0:00–3:00 | Etapa 1 — lo acordado | 1–4 | 15% |
| 3:00–6:00 | Cloudflare — fácil + conclusión | 5–6 | 15% |
| **6:00–17:00** | **Etapa 2 — lo realizado** | **7–16** | **55%** |
| 17:00–20:00 | Siguientes pasos + cierre | 17–19 | 15% |

> Más de la mitad del tiempo (11 min) habla de lo hecho en etapa 2.

---

## Bloque 1 — Etapa 1 (0:00–3:00)

### Slide 1 · Portada (~30 s)
“Segunda etapa de la auditoría MOVA. Hoy cerramos el diseño del login unificado y dejamos claro Cloudflare y el respaldo.”

### Slide 2 · Agenda (~45 s)
Recorrer los 4 bloques. Enfatizar: “la mayor parte del tiempo es lo que hicimos este mes en etapa 2.”

### Slide 3 · Veredicto etapa 1 (~1 min)
Leer la tabla:
- n8n→Git y login unificado = lo importante.
- Migrar hosting ya = **no**.
- VPS = en un año.
Frase: “Acordamos no migrar dos veces.”

### Slide 4 · Orden de ejecución (~45 s)
Señalar que el paso 1 (n8n) **ya está hecho**. Cloudflare es el siguiente quick win. mova_auth es el diseño que presentamos ahora.

---

## Bloque 2 — Cloudflare (3:00–6:00)

### Slide 5 · Qué es (~1,5 min)
Analogía del escudo. Dibujar en el aire: Usuario → Cloudflare → GoDaddy.  
Tres beneficios: HTTPS, filtro ataques, menos golpes al hosting.  
Decir explícitamente qué **no** hace (no arregla login, no es el VPS).

### Slide 6 · ¿Es necesario? (~1,5 min)
Leer conclusión:
- Sí como quick win.
- No es proyecto enorme.
- Mejor que mudarse a IONOS.
Frase literal del slide. Ofrecer la guía `cloudflare-mova.html` para cuando lo activen.

---

## Bloque 3 — Etapa 2 (6:00–17:00) · ~11 min

### Slide 7 · Entramos a etapa 2 (~45 s)
Definir el límite: “documentar y acordar, **sin tocar el servidor**.” Listar D1–D5 en una respiración.

### Slide 8 · Mapa del mes (~1 min)
Tabla de estados. Celebrar: D1–D5 hechos + n8n en GitHub + guía espejo cPanel.  
“Esto es el entregable de la etapa 2.”

### Slide 9 · D1 fragmentación (~1,5 min)
Contar las 4 puertas con ejemplos reales (`/mova/`, `mova_auth`, ERP, AXON).  
Frase del cliente: el problema no es falta de validación backend, es fragmentación.

### Slide 10 · D2 regla de oro (~1,5 min)
“Si no pasó por mova_auth, no entra.”  
Explicar guard.php en una analogía: guardia en cada oficina, un solo recepcionista.  
Mencionar excepción `/documentos/`. Pedir firma/correo si aún no está.

### Slide 11 · D3 gap de archivos (~1,5 min)
Mostrar qué existe y qué falta (`session`, `validate`, `guard`).  
“Ya sabemos exactamente qué hay que crear en la siguiente etapa.”

### Slide 12 · D4 cookie (~1,5 min)
Recorrer el flujo en 5 pasos. Insistir: HttpOnly + Secure, sin JWT en el navegador.  
Google puede seguir, pero termina en la misma sesión PHP.

### Slide 13 · D5 sandbox (~1,5 min)
Orden de migración. Por qué ERP primero.  
“No migramos todo el mismo día.”

### Slide 14 · n8n GitHub (~1 min)
Confirmar: los flujos ya están en el repo. Riesgo de perder automatizaciones bajó.  
Opcional: automatizar backup semanal después.

### Slide 15 · Espejo cPanel (~1 min)
Cómo bajar ZIPs al repo. Carpeta `espejo-cpanel/`. No subir `config.php`.  
“Con esto el equipo de implementación trabaja sobre código versionado.”

### Slide 16 · Qué no hicimos (~45 s)
Repetir el límite a propósito. Transición: “plano de obra listo → ahora construir.”

---

## Bloque 4 — Cierre (17:00–20:00)

### Slide 17 · Dónde ver todo (~45 s)
Apuntar al portal documentos. Quien quiera profundidad abre D3–D5 o Cloudflare.

### Slide 18 · Siguientes pasos (~1,5 min)
Asignar dueños en la sala:
1. Firma D2  
2. Bajar espejo mova_auth  
3. Activar Cloudflare  
4. Implementar 3 PHP faltantes  
5. Sandbox ERP  

### Slide 19 · Cierre (~45 s)
“Diseño cerrado. Listos para construir.” Abrir preguntas.

---

## Tips de facilitación

- Si se alargan preguntas en Cloudflare, cortar a los 6:00 y volver al final.
- Si piden detalle técnico de cookie, abrir `mova-d4-login-cookie.html` después — no improvisar código en vivo.
- Si preguntan “¿cuándo se sube al servidor?”: “Eso es la siguiente etapa; hoy cerramos el plano.”

## Material de apoyo (dejar en el chat / pantalla 2)

| Tema | Link relativo |
|------|----------------|
| Deck | `index/clientes/mkof/mova-etapa2-presentacion.html` |
| Cloudflare | `index/clientes/mkof/cloudflare-mova.html` |
| cPanel espejo | `index/clientes/mkof/cpanel-espejo.html` |
| D5 cierre | `…/documentos/ver.html?id=d5-validacion-modulos` |
| Playbook cliente | https://acme-chile.cl/documentos/auditoria_mova.html |
