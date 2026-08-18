# Gastar pocos tokens en Cursor

El plan On-Demand cobra por uso. Menos contexto = menos plata.

## Cómo chatear (tú)

1. **Un tema por chat.** Impresoreando en un hilo; HER en otro (`@herramientas`).
2. **No pegues** PDFs, JSON live, capturas enormes ni `CONTEXTO.md` entero. El agente ya tiene el doc.
3. **Di el dato mínimo:** «PED-010 pagado $8000» basta. No reenvíes el historial.
4. Modelo **rápido/barato** para cambios chicos; el caro solo si se traba.
5. Cierra chats viejos. El hilo largo relee todo cada vez.

## Qué hace el repo

- `AGENTS.md` corto; detalle en docs (no duplicar).
- Reglas de cliente con `alwaysApply: false` + globs (no se cargan en todos los chats).
- `.cursorignore` deja fuera PDF, backups y exports pesados del índice.

## Agente

Si el agente empieza a listar archivos a ciegas: «para, lee solo CONTEXTO.md».
