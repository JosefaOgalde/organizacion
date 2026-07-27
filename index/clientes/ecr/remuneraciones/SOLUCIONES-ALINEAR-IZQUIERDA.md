# ECR · Soluciones / Remuneraciones — textos a la izquierda

**URL:** https://ecrgroup.cl/soluciones/remuneraciones/  
**Sección:** “¿Cómo te ayudamos…?” · widget **Pestañas anidadas** (`nested-tabs` / `e-n-tab-title`)

## CSS mínimo (pegar en el widget Pestañas)

Avanzado → CSS personalizado → **reemplazar** lo anterior por:

```css
selector {
  --n-tabs-title-text-align: left;
  --n-tabs-title-justify-content: flex-start;
  --n-tabs-title-align-items: flex-start;
  --n-tabs-title-width: 100%;
}

selector .e-n-tab-title-text {
  text-align: left !important;
  align-items: flex-start !important;
}
```

**Actualizar** → `?nocache=1`

### Por qué el CSS corto anterior no alcanzó

- El widget es **nested-tabs**, no tabs clásicas.
- El texto se alinea en `.e-n-tab-title-text` (no solo en el botón).
- Con ancho `content` el botón se encoge y en el live parece centrado; `width: 100%` lo corrige.
