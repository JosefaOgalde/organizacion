# Ficha producto · Joyas Mercury Fase 2

Wireframe de **detalle de producto** (single product page) al hacer clic desde la grilla de colección o inicio.

## Flujo

```
Colección / Inicio → clic tarjeta producto → Ficha producto → Agregar al carrito → Mi Carrito
```

## URL

```
/index/clientes/JoyasMercury/interfaces/mockups-producto/wireframe-producto-landing.html
```

| Variante | Query |
|----------|-------|
| Esencial · Aros Corazón Rosa | `?coleccion=esencial&producto=aros-corazon` |
| Gold · Anillo Eternity | `?coleccion=gold&producto=anillo-eternity` |
| Deluxe · Aros Perla | `?coleccion=deluxe&producto=aros-perla` |

## Secciones

1. **Galería** — imagen principal + miniaturas
2. **Info** — colección, título, precio, descripción corta, SKU, cantidad, agregar al carrito, WhatsApp
3. **Tabs** — Descripción · Detalles · Cuidado
4. **También te puede gustar** — 4 productos relacionados
5. **Footer E** — igual colecciones

## Capturas

```bash
python3 scripts/capturar-jm-wireframe-producto.py
```

| Archivo | Vista |
|---------|-------|
| `jm-producto-landing-desktop.png` | Desktop full page |
| `jm-producto-landing-mobile.png` | Mobile full page |
