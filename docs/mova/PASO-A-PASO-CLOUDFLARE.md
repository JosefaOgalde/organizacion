# Paso a paso — Activar Cloudflare (acme-chile.cl)

**No se hace desde cPanel.** Se hace en Cloudflare + GoDaddy (dominio).  
**Cuándo:** cuando el equipo decida. No bloquea bajar el espejo cPanel.  
**Plan:** Free alcanza para empezar.  
**Tiempo:** ~30–45 min de trabajo + propagación DNS (minutos a unas horas).

---

## Antes de tocar nada

- [ ] Tener acceso a la cuenta **GoDaddy** del dominio `acme-chile.cl` (donde se cambian nameservers).
- [ ] Tener un correo para crear/usar cuenta **Cloudflare**.
- [ ] Avisar al equipo: durante la propagación el sitio puede verse raro unos minutos.
- [ ] No hace falta bajar archivos de cPanel para esto.

---

## Paso 1 — Crear / entrar a Cloudflare

1. Abre https://dash.cloudflare.com  
2. Crea cuenta o inicia sesión.  
3. Plan: **Free**.

---

## Paso 2 — Agregar el dominio

1. Clic en **Add a site** / Agregar sitio.  
2. Escribe: `acme-chile.cl`  
3. Elige plan **Free** → Continue.  
4. Cloudflare escanea el DNS actual (A, CNAME, MX, etc.).  
5. Revisa que aparezcan los registros importantes (web + correo si usan MX de GoDaddy/Google).  
6. Continue hasta que te muestre los **nameservers** nuevos (algo como `xxx.ns.cloudflare.com` y `yyy.ns.cloudflare.com`).  
7. **Copia esos 2 nameservers** (los vas a pegar en GoDaddy).

---

## Paso 3 — Cambiar nameservers en GoDaddy

1. Entra a https://dcc.godaddy.com (o tu panel de dominios GoDaddy).  
2. Abre el dominio **acme-chile.cl**.  
3. Busca **DNS** → **Nameservers** / Servidores de nombres.  
4. Cambia de “GoDaddy / Default” a **Custom** / Personalizados.  
5. Pega los **2 nameservers** que te dio Cloudflare.  
6. Guarda.

> Esto no borra los archivos del hosting. Solo cambia quién responde el DNS.

---

## Paso 4 — Esperar a que Cloudflare diga “Active”

1. Vuelve al dashboard de Cloudflare.  
2. Estado del dominio: pasa de *Pending* a **Active** (puede tardar minutos u horas).  
3. No sigas al SSL fino hasta que esté Active (o al menos con DNS ya respondiendo por Cloudflare).

Comprobación rápida en el PC:

```bat
nslookup acme-chile.cl
```

Si ves IPs de Cloudflare (no solo las de GoDaddy directo), ya está entrando por el escudo.

---

## Paso 5 — SSL / HTTPS

En Cloudflare → dominio → **SSL/TLS**:

1. Empieza en modo **Full** (si el origen en GoDaddy ya tiene certificado).  
2. Cuando el candado del origen esté bien, sube a **Full (strict)**.  
3. Evita dejar **Flexible** a largo plazo (HTTPS al usuario pero HTTP al servidor = problemas raros).

Opcional útil:

- **Always Use HTTPS** = On  
- **Automatic HTTPS Rewrites** = On  

---

## Paso 6 — Protección básica (WAF / bots)

En el plan Free, al menos:

1. **Security** → deja el nivel de seguridad en **Medium** (o el que acuerden).  
2. Activa protecciones básicas anti-bot si Cloudflare las ofrece en el plan.  
3. No inventes reglas agresivas el primer día (pueden bloquear usuarios reales).

---

## Paso 7 — Probar que nada se rompió

Abre y verifica:

- [ ] https://acme-chile.cl abre  
- [ ] Candado HTTPS OK  
- [ ] Login / módulos M que usen hoy siguen entrando  
- [ ] Correo del dominio sigue llegando (si usan MX propios; si falla, revisar registros MX en Cloudflare DNS)

Si algo falla: en Cloudflare DNS revisa que el registro **A** / **CNAME** del sitio apunte al hosting GoDaddy correcto (la IP o el destino que tenían antes).

---

## Paso 8 — Cerrar el hito

- [ ] Captura: dominio **Active** en Cloudflare  
- [ ] Captura: SSL en Full o Full (strict)  
- [ ] Aviso al equipo: “Cloudflare activo delante de GoDaddy”  
- [ ] Marcar hito 1.2 en el seguimiento interno  

---

## Qué NO hacer

| No | Por qué |
|----|---------|
| Activarlo desde cPanel File Manager | Ahí no se configura Cloudflare |
| Mudar el hosting a IONOS “de paso” | El playbook lo descartó |
| Borrar registros MX sin mirar | Se cae el correo |
| Dejar Flexible para siempre | HTTPS a medias |

---

## Si no tienes acceso a GoDaddy DNS

Pídele a quien administra el dominio que haga solo el **Paso 3** (pegar nameservers). Tú puedes hacer Pasos 1–2 y 5–7 en Cloudflare.
