# n8n — Agregar MySQL antes de Google Sheets

Guía operativa (no asume que “ya está”).  
Deck visual: `index/clientes/mkof/n8n-mysql-antes-sheets.html`

## Regla

**MySQL primero (fuente) → Google Sheets después (copia / reporte).**

## 6 pasos

1. **Abrir** el workflow en n8n que hoy escribe en Google Sheets.
2. **Crear credencial MySQL** (Credentials → Add → MySQL): host, database, user, password, port 3306.
3. **Agregar nodo MySQL** (+ → buscar “MySQL” → elegir credencial).
4. **Moverlo a la izquierda de Sheets** y reconectar: `… → MySQL → Google Sheets` (en serie, no en paralelo).
5. **Configurar** Insert (o Insert or Update) + mapear columnas (`{{ $json.campo }}`).
6. **Probar**: Execute MySQL → ver fila en la base → ver fila en Sheets → Save.

## Checklist de entrega

- [ ] Credencial con Test OK  
- [ ] Canvas: MySQL a la izquierda de Sheets  
- [ ] Fila nueva en MySQL  
- [ ] Fila en Sheets después  
- [ ] Workflow guardado + captura del canvas  

## Errores típicos

| Señal | Causa | Fix |
|-------|--------|-----|
| Sheets OK, MySQL vacío | Orden mal | Paso 4 |
| ECONNREFUSED / Access denied | Host/clave/firewall | Revisar credencial |
| Unknown column | Columna no existe | Alinear con la tabla |
| Sheets escribe si MySQL falla | Paralelo | Un solo cable en serie |
