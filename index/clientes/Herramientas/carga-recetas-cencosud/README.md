# Carga recetas Cencosud (CRC)

Automatiza **tu** Word → completar ficha → publicar en [Business Manager Cencosud](https://business-manager.ecomm.cencosud.com/), sin pedirle al cliente que cambie su proceso. El cliente no entrega el Word ni usa el BM: **tú** tienes el archivo y los accesos.

## Flujo

1. Copia el `.docx` a `inbox/`
2. Parsea: `python3 scripts/parse-receta-word.py inbox/TU-RECETA.docx`
3. Revisa `out/*.json` — el agente `@herramientas` completa `camposFaltantes`
4. Cuando el mapa BM esté listo: `python3 scripts/publicar-receta-cencosud.py out/TU-RECETA.json`

Credenciales: archivo local `secrets/.env` (nunca en Git). Plantilla: `secrets/env.example`.

## Carpetas

| Ruta | Uso |
|------|-----|
| `inbox/` | Word de entrada |
| `out/` | JSON + logs |
| `secrets/` | `.env` local (gitignored) |
| `ejemplos/` | Texto de ejemplo de estructura |
| `schema-receta.json` | Contrato del payload |
| `MAPA-CAMPOS-BM.md` | Word/JSON ↔ formulario BM |

## Agente

En Cursor: **`@herramientas`**

```
Cliente Herramientas · Proyecto CRC
Parsear inbox/[archivo].docx, completar campos faltantes y dejar JSON en listo-para-cargar.
```

## Portal

Hub: `Carga-recetas.html` · código proyecto **CRC**
