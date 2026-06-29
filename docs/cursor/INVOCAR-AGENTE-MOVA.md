# Invocar agente MOVA (proyecto MKOF)

MOVA es un **subproyecto de MKOF**, no un cliente aparte.

## Forma más rápida

1. **Ctrl + L** (chat)
2. Escribe **`@mova`**
3. Tu pregunta:

```
Cliente MKOF · Proyecto MOVA
Auditar charla [título] según [criterios]. Entregable: informe con hallazgos.
```

## Ver en el navegador

Con `SERVIR.bat` (puerto 3000):

| Página | URL |
|--------|-----|
| MKOF (tarjeta + proyecto) | `http://localhost:3000/index/clientes/MKOF.html` |
| Proyecto MOVA | `http://localhost:3000/index/clientes/MKOF/MOVA.html` |
| Código | `http://localhost:3000/index/clientes/MKOF/MOVA/auditoria-charlas/` |

## Copiar tu workspace Windows

Pega el contenido de `MOVA-Auditoria-Charlas` en:

```
organizacion\index\clientes\MKOF\MOVA\auditoria-charlas\
```

## Activación automática

Abre archivos en `index/clientes/MKOF/` o `MOVA-Auditoria-Charlas/` — Cursor activa la regla `@mova`.

Regla: `.cursor/rules/mova.mdc`
