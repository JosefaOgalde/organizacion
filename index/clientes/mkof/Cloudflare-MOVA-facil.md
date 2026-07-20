# Cloudflare delante de GoDaddy — explicación fácil

**Cliente:** MKOF · MOVA · Hito Gantt `1.2`  
**Pregunta del equipo:** ¿para qué sirve y es necesario?

---

## En una frase

Cloudflare es un **escudo en la puerta de internet**: el visitante llega primero a Cloudflare, y Cloudflare habla con tu hosting GoDaddy. El sitio sigue en el mismo servidor; no migras nada.

```
Usuario  →  Cloudflare (escudo)  →  GoDaddy (donde viven los archivos)
```

Sin Cloudflare:

```
Usuario  →  GoDaddy (directo, más expuesto)
```

---

## ¿Para qué sirve? (3 beneficios)

| Beneficio | Qué significa en la práctica |
|-----------|------------------------------|
| **SSL / candado HTTPS** | El sitio viaja encriptado. Necesario para cookies `Secure` del login unificado. |
| **WAF + anti-bot** | Filtra ataques y bots tontos antes de que lleguen a GoDaddy. |
| **Menos golpes al hosting** | Cloudflare aguanta parte del tráfico malo; tu cPanel no es la primera línea. |

Lo que **no** hace:

- No cambia el código de MOVA.
- No reemplaza n8n.
- No es el servidor nuevo del proyecto a ~12 meses.
- No “arregla” el login fragmentado (eso es `mova_auth`).

---

## ¿Es necesario? — Conclusión

| Veredicto | Detalle |
|-----------|---------|
| **Sí, como quick win de seguridad** | El playbook del cliente lo marca **Inmediato / Correcto**. Tapa el hueco de seguridad **sin migrar dos veces**. |
| **No es obligatorio para que el sitio “funcione” hoy** | acme-chile.cl ya abre sin Cloudflare. |
| **No reemplaza migrar a VPS** | El salto real (servidor propio) es a ~12 meses. Cloudflare es el parche inteligente **hasta entonces**. |
| **Mejor que mudarse a otro shared hosting** | IONOS/Bluehost ahora = movimiento lateral. El cliente ya lo descartó. |

### Frase para la reunión

> “Cloudflare no es un proyecto grande: es poner un escudo delante de GoDaddy. Nos da HTTPS serio y filtro de ataques **sin tocar el código ni mudar el hosting**. Lo hacemos porque es barato en esfuerzo y tapa el riesgo que señaló la auditoría; el servidor nuevo sigue siendo en un año.”

---

## Qué hay que hacer (paso a paso)

**No se hace desde cPanel.** Guía completa: [`docs/mova/PASO-A-PASO-CLOUDFLARE.md`](../../../docs/mova/PASO-A-PASO-CLOUDFLARE.md)

Cuando el equipo decida activarlo:

1. Cuenta en https://dash.cloudflare.com (plan **Free**).
2. **Add a site** → `acme-chile.cl` → Free → revisar DNS escaneado.
3. Copiar los **2 nameservers** que da Cloudflare.
4. En **GoDaddy** → dominio → Nameservers → Custom → pegar esos 2 → Guardar.
5. Esperar dominio **Active** en Cloudflare.
6. **SSL/TLS** → Full, luego **Full (strict)** · Always Use HTTPS = On.
7. Security básico (Medium) · sin reglas agresivas el día 1.
8. Probar: sitio abre, HTTPS OK, login OK, correo (MX) OK.

**Tiempo estimado:** 30–45 min de trabajo + propagación DNS (minutos a unas horas).

---

## Relación con etapa 2 (mova_auth)

| Tema | Relación |
|------|----------|
| Cookie `Secure` | Requiere HTTPS bien puesto → Cloudflare ayuda |
| Login unificado | Independiente: se diseña/implementa igual |
| Respaldo n8n en Git | Independiente — **ya está hecho** |

Orden del playbook: (1) n8n→Git ✓ · (2) Cloudflare · (3) implementar mova_auth.

---

## Referencias

- Playbook cliente: https://acme-chile.cl/documentos/auditoria_mova.html
- Gantt interno: `data/mkof-mova-gantt.js` hito `1.2`
- HTML fácil: [cloudflare-mova.html](cloudflare-mova.html)
