# Invocar agente Joyas Mercury en Cursor

## Forma más rápida

1. **Ctrl + L** (chat)
2. Escribe **`@joyas-mercury`**
3. Tu pregunta, por ejemplo:

```
@joyas-mercury Día 1: auditoría menú en Inicio v2 Elementor.
El sitio en producción no se toca.
```

## Activación automática

Abre en el editor cualquier archivo JM:

- `index/clientes/JoyasMercury/dia-1/README.md`
- `docs/joyas-mercury/`
- `data/jm-backup-contenido.js`

## Trabajar en paralelo con otro cliente

| Cliente | Invocar |
|---------|---------|
| Joyas Mercury | **`@joyas-mercury`** |
| ADL / CLA certificados | `@adl-cla` |
| Otros / organizador | `@organizacion-clientes` |

Cada agente tiene su regla en `.cursor/rules/` y **no mezcla** contexto.

## Atajo desde el organizador

```
http://localhost:3000/index.html?tarea=joyas-mercury/01
```

Día 1 → `joyas-mercury/01`  
Día 2 → `joyas-mercury/02`  
…

## Archivo de regla

`.cursor/rules/joyas-mercury.mdc`
