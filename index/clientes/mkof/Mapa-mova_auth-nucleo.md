# Día 3 — Carpetas y archivos núcleo de `mova_auth/`

**Cliente:** MKOF · **Proyecto:** MOVA (login unificado)  
**Tarea:** `[MOVA] D3 — Carpetas y archivos núcleo · auditoría` · `mkof/03`  
**Fecha:** 19 jul 2026  
**Regla del día:** solo documentar — **no subir ni modificar código en servidor**

---

## 1. Ruta base acordada

| Campo | Valor |
|-------|--------|
| Hosting | GoDaddy · cPanel |
| Ruta disco | `public_html/acme-chile.cl/mova_auth/` |
| URL base | `https://acme-chile.cl/mova_auth/` |
| Permisos carpeta | `755` |
| Permisos PHP públicos | `644` |
| Secretos | Solo en `config.php` (nunca en Git público ni en front) |

---

## 2. Los 6 archivos núcleo (objetivo)

| Archivo | Público | Responsabilidad |
|---------|---------|-----------------|
| `config.php` | **No** (solo include) | Secretos, whitelist, duración sesión, dominio cookie |
| `session.php` | **No** (solo include) | `session_start` con cookie HttpOnly+Secure+SameSite |
| `login.php` | Sí | Pantalla de entrada · Google opcional · redirect `?redirect=` |
| `validate.php` | Sí (API) | JSON `{ ok, usuario, permisos }` · HTTP 200 / 401 |
| `guard.php` | **No** (include en módulos) | Si no hay sesión → redirect a `login.php?redirect=` |
| `logout.php` | Sí | Destruye sesión + cookie · redirect a login |

### Pseudocódigo de referencia (no implementar hoy)

```php
// guard.php — incluir AL INICIO de cada módulo privado
<?php
require_once __DIR__ . '/../mova_auth/session.php';
if (!mova_session_valida()) {
  header('Location: /mova_auth/login.php?redirect=' . urlencode($_SERVER['REQUEST_URI']));
  exit;
}
```

```php
// session.php — cookie segura
session_set_cookie_params([
  'lifetime' => 0,
  'path' => '/',
  'secure' => true,
  'httponly' => true,
  'samesite' => 'Lax'
]);
session_start();
```

---

## 3. Árbol objetivo

```
public_html/acme-chile.cl/
├── mova_auth/                 ← núcleo
│   ├── config.php             ← secretos (no versionar en repo público)
│   ├── session.php            ← NUEVO / a crear
│   ├── login.php
│   ├── logout.php
│   ├── validate.php           ← NUEVO / a crear
│   └── guard.php              ← NUEVO / a crear
├── mova/                      ← módulos incluyen guard.php
│   └── erp/index.php          ← require guard al inicio
└── axon/ …
```

---

## 4. Gap analysis — lo que hay hoy en cPanel (D1)

Inventario D1 registró en `mova_auth/`:

```
mova_auth/
├── auth.php
├── config.php
├── google_login.php
├── login.php
├── logout.php
├── panel.php
└── setup.sql
```

| Archivo núcleo | ¿Existe hoy? | Acción futura (post-auditoría) |
|----------------|--------------|--------------------------------|
| `config.php` | Sí | Revisar secretos + whitelist; no exponer |
| `session.php` | **No** | Crear — cookie HttpOnly+Secure |
| `login.php` | Sí | Unificar con Google opcional vía tokeninfo |
| `validate.php` | **No** | Crear — API JSON 200/401 |
| `guard.php` | **No** | Crear — include en cada módulo M |
| `logout.php` | Sí | Alinear con destrucción de sesión PHP |

### Archivos extras actuales (decidir en implementación)

| Archivo | Rol probable hoy | Nota |
|---------|------------------|------|
| `auth.php` | Lógica auxiliar | Evaluar merge a `session.php` / `login.php` |
| `google_login.php` | OAuth Google | Debe alimentar sesión PHP, no JWT en cliente |
| `panel.php` | ¿UI post-login? | No es núcleo; no debe ser gate de módulos |
| `setup.sql` | Esquema BD | Fuera de auth runtime; conservar aparte |

---

## 5. Secretos vs públicos

| Tipo | Archivos | Regla |
|------|----------|-------|
| **Secretos** | `config.php` (client secret, claves, whitelist) | Solo include PHP · fuera de Git público · permisos restrictivos |
| **Públicos web** | `login.php`, `logout.php`, `validate.php` | Accesibles por HTTPS |
| **Solo include** | `session.php`, `guard.php` | No se llaman directo desde navegador (opcional: deny web) |

---

## 6. Permisos esperados

| Recurso | Permiso | Motivo |
|---------|---------|--------|
| Carpeta `mova_auth/` | `755` | Lectura/ejecución web |
| PHP públicos | `644` | Servidos por Apache/PHP |
| `config.php` | `640` o `644` según hosting | Minimizar lectura; GoDaddy shared a veces fuerza 644 |
| Sin escritura web | — | Nadie escribe desde HTTP en esta carpeta |

---

## 7. Checklist cierre Día 3

- [x] Ruta base acordada: `/mova_auth/` bajo `acme-chile.cl`
- [x] 6 archivos PHP núcleo listados y descritos (sin subirlos)
- [x] Secretos vs públicos documentados
- [x] Permisos esperados documentados
- [x] Gap vs cPanel (D1) documentado
- [x] Entregable en portal documentos MOVA
- [ ] Tarea `mkof/03` marcada completada en organizador (PC local)

---

## 8. Próximo paso — Día 4

Diseñar flujo de login único + especificación de cookie y sesión (sin tocar servidor).

Tarea: `index.html?tarea=mkof/04`

---

## Referencias

- Inventario D1: [Inventario-MOVA-modulos.md](Inventario-MOVA-modulos.md)
- Reglas D2: [Reglas-mova_auth.md](Reglas-mova_auth.md)
- Guía: [mova-auth-guia.html](mova-auth-guia.html)
- Diagramas: [guia-mova-auth/diagramas.html](guia-mova-auth/diagramas.html)
