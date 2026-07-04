# Invocar agente Joyas Mercury (JM)

Joyas Mercury es el cliente **JM** — rediseño Fase 2 de **joyasmercury.cl** (WooCommerce + Elementor).

## Forma más rápida

1. **Ctrl + L** (chat)
2. Escribe **`@joyas-mercury`**
3. Tu pregunta:

```
Cliente JM · Fase 2 · Día 11
Guía para Camila: cómo marcar y desmarcar productos destacados en WooCommerce.
Entregable: pasos con capturas + texto corto para enviarle.
```

## Arrancar el entorno (Windows)

Doble clic en **`ABRIR-JM.bat`** en la carpeta del repo.

Hace: cierra servidor viejo → sync respaldo → inicia `:3000` → abre portal JM y organizador.

## Ver en el navegador

Con el servidor en puerto 3000:

| Página | URL |
|--------|-----|
| Portal JM | http://localhost:3000/index/clientes/joyasmercury/ |
| Wireframes desktop (7 pantallas) | http://localhost:3000/index/clientes/joyasmercury/wireframes.html |
| Organizador (datos disco) | http://localhost:3000/index.html?disco=1 |
| Tarea del día (ej. día 11) | http://localhost:3000/index.html?tarea=joyas-mercury/11 |

## WordPress (fuera del repo)

El sitio real vive en tu backup local:

```
%USERPROFILE%\joyasmercury-backup\wordpress\
```

- **Producción:** https://joyasmercury.cl — no editar hasta aprobación.
- **Copia de trabajo:** página **Inicio v2** en WP Admin → Editar con Elementor.

## Activación automática

Abre archivos en `index/clientes/joyasmercury/` o `index/assets/jm-*.js` — Cursor activa la regla `@joyas-mercury`.

Regla: `.cursor/rules/joyas-mercury.mdc`

Rutina completa: `docs/JM-RUTINA.md`
