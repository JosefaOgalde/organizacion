# Propuesta: plan más económico Metricool · MKOF  
## (compatible con Looker Studio)

**Fecha:** agosto 2026  
**De:** Community Manager  
**Para:** Dirección / Administración  
**Asunto:** Bajar costos **sin perder Looker Studio**

---

## 1. Situación actual

| Ítem | Detalle |
|------|---------|
| Herramienta | Metricool (RRSS) + reportes en **Looker Studio** |
| Gasto aproximado | **~USD 500 / año** |
| Problema | Plan / cupo posiblemente sobredimensionado vs clientes actuales |
| Objetivo | **Plan más económico posible que conserve Looker Studio** |

Metricool cobra por **marcas**. El **conector de Looker Studio** (y la API) están solo en **Advanced / Custom**, no en Starter.

---

## 2. Restricción clave: Looker Studio

| Plan | Looker Studio | API | ≈ / año (lista, anual) |
|------|---------------|-----|-------------------------|
| Starter 5 | No | No | ~USD 240 |
| Starter 10 | No | No | ~USD 432 |
| **Advanced 15** | **Sí** | **Sí** | **~USD 636** |
| Advanced 25 / 50 | Sí | Sí | ~USD 1.020 / ~USD 1.908 |

**Conclusión:** si seguimos trabajando con Looker Studio conectado a Metricool, el piso es **Advanced 15**. Starter es más barato, pero **rompe el flujo de Looker Studio**.

---

## 3. Qué necesitamos conservar

- Programar y publicar  
- Analítica e historial  
- Informes PDF/PPT cuando haga falta  
- **Looker Studio** (reportes / dashboards actuales)  
- LinkedIn cuando aplique  

**Bonus del mismo plan Advanced:** queda disponible la **API** (Make / Zapier / n8n) sin pagar un add-on aparte; se puede conectar después si hace falta.

---

## 4. Recomendación

**Advanced · hasta 15 marcas · facturación anual** — el **más económico compatible con Looker Studio**.

### Por qué

1. Es el tramo Advanced más bajo; alcanza para el volumen actual de clientes.  
2. Mantiene el **conector Looker Studio**.  
3. Incluye API por si más adelante automatizamos.  
4. Evita pagar Advanced 25/50 si no usamos tantas marcas.

### Cómo bajar el gasto real (aunque la lista diga ~USD 636)

El ~USD 500 actual puede ser un Advanced con otro tramo, add-ons o precio legado. Acciones:

1. Bajar al cupo de **15 marcas** (si hoy hay más contratadas).  
2. Desconectar marcas inactivas.  
3. Revisar y cancelar add-ons que no se usen (X/Twitter, Advanced Analytics, etc.).  
4. Confirmar facturación **anual** (suele ser más barata que mensual).

> Si al cotizar Advanced 15 la factura sube respecto a los ~USD 500 actuales, conviene pedir a Metricool el precio exacto de la cuenta / retención antes de confirmar, o evaluar si algún reporte de Looker Studio se puede reemplazar sin el conector nativo (solo en ese caso Starter volvería a ser opción).

---

## 5. Comparativa rápida

| Opción | Looker Studio | ≈ / año | Veredicto |
|--------|---------------|---------|-----------|
| Starter 5 | No | ~USD 240 | Más barato, **no viable** si dependemos de Looker Studio |
| **Advanced 15** | **Sí** | **~USD 636** | **Recomendada** — piso con Looker Studio |
| Advanced 25+ | Sí | más alto | Solo si necesitamos más de 15 marcas |

Precios referenciales [metricool.com/pricing](https://metricool.com/pricing/) (ago 2026).

---

## 6. Antes del cambio

- [ ] Confirmar que los dashboards de Looker Studio usan el **conector Metricool** (no solo CSV manual).  
- [ ] Contar marcas activas (objetivo: ≤ 15).  
- [ ] Revisar add-ons y cancelar lo innecesario.  
- [ ] Pedir / revisar el monto exacto al pasar a Advanced 15 anual.  
- [ ] Anotar si queremos activar la API más adelante (queda incluida).

---

## 7. Plan de acción

1. Aprobar **Advanced 15 anual** como plan objetivo.  
2. Limpiar marcas y add-ons.  
3. Ajustar suscripción en Metricool.  
4. Verificar que Looker Studio sigue trayendo datos.  
5. Revisar en 3–6 meses (clientes nuevos / uso de API).

---

## 8. Pedido

Solicito autorización para ir al **Advanced de 15 marcas (anual)** — el plan **más económico que mantiene Looker Studio** — y limpiar lo que no se use para acercar la factura lo máximo posible.

---

*Documento interno MKOF · Community Management · ago 2026*
