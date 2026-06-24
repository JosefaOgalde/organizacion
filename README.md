# Organización — Trabajo Diario

Organizador semanal (lunes a domingo) para gestionar trabajo full-time, clientes freelance y tareas personales.

## Uso

Abre `index.html` en el navegador. Los datos se guardan en `localStorage` del navegador.

```bash
# Servidor local opcional
npx serve .
```

## Flujo diario

1. Al abrir la app, se muestra la semana actual con el día de hoy resaltado.
2. Las tareas no completadas de días anteriores pasan automáticamente a **Pendientes**.
3. Registra clientes en la pestaña **Clientes**.
4. Crea tareas diarias en **+ Nueva tarea** o pídele al agente de Cursor que las genere según fechas de entrega.

## Información por cliente

Para planificar tareas, cada cliente necesita:

| Campo | Descripción |
|-------|-------------|
| Nombre | Cliente o proyecto |
| Tipo | freelance / full-time / personal |
| Descripción | Qué trabajo implica |
| Fecha límite | Entrega final |
| Entregables | Lista de lo que hay que entregar |
| Horas/semana | Tiempo disponible |
| Prioridad | alta / media / baja |
| Notas | Reuniones, contactos, restricciones |

## Estructura

```
organizacion/
├── index.html          # Vista principal
├── styles.css          # Estilos (gris, blanco, celeste)
├── app.js              # Lógica y localStorage
├── data/
│   ├── schema.json     # Esquema de datos
│   └── clientes-ejemplo.json
└── README.md
```

## Integración con Cursor

En la consola del navegador:

```js
exportarDatos()   // Ver datos actuales
importarDatos({ clientes: [...], tareas: [...] })  // Importar desde el agente
```
