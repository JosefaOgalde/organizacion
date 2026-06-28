# Wireframe colecciones — Joyas Mercury Fase 2

Páginas de **Esencial · Gold · Deluxe** con la misma identidad visual del inicio aprobado.

## Abrir

```
http://localhost:3000/index/clientes/JoyasMercury/interfaces/mockups-coleccion/wireframe-coleccion.html
```

| Colección | URL |
|-----------|-----|
| Esencial | `?coleccion=esencial` |
| Gold | `?coleccion=gold` |
| Deluxe | `?coleccion=deluxe` |

## Estructura (de arriba hacia abajo)

1. **Header** — igual que inicio (logo, búsqueda, carrito, menú)
2. **Migas** — Inicio › Colecciones › Esencial/Gold/Deluxe
3. **Banner colección** — título serif + tagline · color según línea (rosa / dorado / mauve)
4. **Pills colección** — Esencial · Gold · Deluxe · cambio en misma vista (AJAX en WP)
5. **Filtros categoría** — Todos · Aros · Cadenas · Anillos · Pulseras · Conjuntos
6. **Grilla productos** — mismas tarjetas que «Novedades» en inicio
7. **También te puede gustar** — acceso a las otras 2 colecciones
8. **Footer E** — claro premium (igual inicio)

## Flujo usuario

```
Inicio → círculo Esencial/Gold/Deluxe → landing colección
  → pill otra colección (sin recargar en producción)
  → chip categoría (filtra grilla)
  → ficha producto → carrito
```

## Capturas

```bash
python3 scripts/capturar-jm-wireframe-coleccion.py
```
