# Organización — Trabajo Diario

Organizador semanal (lunes a domingo) para gestionar trabajo full-time, clientes freelance y tareas personales.

## Uso

Abre `index.html` en el navegador. Los datos se guardan en `localStorage` del navegador.

```bash
# Servidor local (recomendado para abrir tareas por enlace)
npx serve .
```

Para ir directo a una tarea, usa el enlace con `?tarea=` (funciona siempre):

```
index.html?tarea=joyas-mercury/01
```

Ejemplo con servidor en el puerto 3000:

```
http://localhost:3000/index.html?tarea=joyas-mercury/01
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
│   ├── schema.json
│   ├── clientes-ejemplo.json
│   └── organizacion-respaldo-2026-06-24.json   # Respaldo oficial
└── README.md
```

## Respaldo (importante)

El respaldo más actualizado está en:

```
data/organizacion-respaldo-2026-06-24.json
```

(123 tareas · 8 clientes · ficha JM completa)

### Primera vez en un PC nuevo

```powershell
cd "C:\Users\Josefa Ogalde\organizacion"
npx serve .
```

Abre `http://localhost:3000` — si el navegador no tiene datos guardados, **carga el respaldo automáticamente**.

Para forzar reimportar (pisar lo del navegador):

```
http://localhost:3000/index.html?respaldo=importar
```

O en consola (F12):

```js
importarRespaldoDefecto()
```

### Guardar cambios nuevos

Los datos del día a día viven en **localStorage del navegador**. Antes de cambiar de PC:

```js
descargarRespaldo()   // Descarga JSON con todo
```

Guarda el archivo en `data/` y haz commit con **SUBIR.bat**.

Para restaurar manualmente:

```js
importarDatos(/* objeto JSON */)
```

## Integración con Cursor

En la consola del navegador:

```js
exportarDatos()   // Ver datos actuales
importarDatos({ clientes: [...], tareas: [...] })  // Importar desde el agente
```
