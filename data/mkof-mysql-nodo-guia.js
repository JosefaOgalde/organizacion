/**
 * MOVA · Guía — Agregar nodo MySQL en n8n (hito 3.2).
 * MySQL = fuente primaria · Google Sheets = vista de lectura.
 */
window.MKOF_MYSQL_NODO_GUIA = {
  version: '1.0',
  proyecto: 'MOVA',
  hito: '3.2 · MySQL fuente → Sheets vista',
  pptx: 'MOVA-Nodo-MySQL-n8n.pptx',
  requisitos: {
    titulo: 'Antes de empezar (hito 3.1 listo)',
    items: [
      'MySQL gestionada provisionada con esquema mova_datos (ingresos/egresos).',
      'IP de n8n (o rango) en whitelist de la base.',
      'Usuario con permisos mínimos (INSERT/UPDATE/SELECT).',
      'Host, database, user y password guardados en gestor del equipo.',
      'Acceso al workflow n8n que hoy escribe a Google Sheets.'
    ]
  },
  objetivo: {
    titulo: 'Qué lograremos',
    items: [
      'Agregar el nodo MySQL al workflow de MOVA.',
      'Crear y probar la credencial de conexión.',
      'Escribir primero a MySQL (fuente primaria).',
      'Replicar a Google Sheets solo como vista de lectura.'
    ]
  },
  pasos: [
    {
      num: 1,
      titulo: 'Abrir n8n y el workflow',
      texto: 'Entra a la instancia n8n de MOVA y abre el workflow que hoy escribe a Google Sheets (ingresos/egresos).',
      url: 'n8n → Workflows',
      destacar: 'Abrir el workflow que alimenta Sheets / MOVA MAESTRO',
      tip: 'Si hay varios, elige el de operación (ingresos/egresos), no uno de prueba suelto.'
    },
    {
      num: 2,
      titulo: 'Agregar un nodo nuevo',
      texto: 'En el canvas haz clic en ＋ (Add node) donde irá MySQL. Debe quedar antes de Google Sheets.',
      url: 'n8n → canvas',
      destacar: 'Botón ＋ Add node',
      tip: 'Orden correcto: lógica → MySQL → Sheets. Nunca Sheets antes que MySQL.'
    },
    {
      num: 3,
      titulo: 'Buscar el nodo MySQL',
      texto: 'En el buscador escribe MySQL y selecciona el nodo oficial MySQL (no Postgres ni MSSQL).',
      url: 'n8n → Add node',
      destacar: 'Search → MySQL → nodo oficial',
      tip: 'Evita nodos community no aprobados por el equipo técnico.'
    },
    {
      num: 4,
      titulo: 'Crear credencial MySQL',
      texto: 'En Credential elige Create New. Nombre sugerido: MOVA MySQL prod (o sandbox si es prueba).',
      url: 'n8n → MySQL → Credential',
      destacar: 'Create New → nombre de credencial del equipo',
      tip: 'Una credencial compartida por workflows. Nunca pegues la clave en chat ni en Git.'
    },
    {
      num: 5,
      titulo: 'Completar Host, Database, User, Password',
      texto: 'Usa los datos del hito 3.1: Host, Port 3306, Database mova_datos, User y Password del gestor.',
      url: 'n8n → MySQL credential',
      destacar: 'Host · Database · User · Password',
      tip: 'Si n8n no alcanza la BD: revisa whitelist de IP. Sin IP autorizada el Test falla.'
    },
    {
      num: 6,
      titulo: 'Probar la conexión (Test)',
      texto: 'Guarda la credencial y pulsa Test. Debe decir Connection successful antes de seguir.',
      url: 'n8n → Credential → Test',
      destacar: 'Test → Connection successful',
      tip: 'Si falla: IP, SSL, usuario/clave o firewall. No configures el query hasta que pase.'
    },
    {
      num: 7,
      titulo: 'Elegir la operación SQL',
      texto: 'Para escritura: Insert o Insert or Update. Para lecturas: Select / Execute SQL.',
      url: 'n8n → MySQL node',
      destacar: 'Insert or Update + tabla del esquema 3.1',
      tip: 'Usa clave única (ej. id_movimiento) para no duplicar filas.'
    },
    {
      num: 8,
      titulo: 'Mapear columnas desde el nodo anterior',
      texto: 'En Columns/Values mapea cada campo desde el JSON previo (fecha, monto, tipo, módulo…).',
      url: 'n8n → MySQL → Columns',
      destacar: 'Expresiones {{ $json.campo }}',
      tip: 'No hardcodees montos. Revisa tipos DATE / DECIMAL del esquema.'
    },
    {
      num: 9,
      titulo: 'Orden del flujo: MySQL → luego Sheets',
      texto: 'Conecta el canvas: … → MySQL → Google Sheets. MySQL es fuente; Sheets es vista.',
      url: 'n8n → canvas',
      destacar: 'MySQL antes de Sheets',
      tip: 'Si Sheets falla y MySQL ya escribió, los datos siguen en la BD.'
    },
    {
      num: 10,
      titulo: 'Configurar Sheets como réplica',
      texto: 'En Google Sheets: Append o Update con los mismos campos. Solo lectura operativa.',
      url: 'n8n → Google Sheets',
      destacar: 'Sheets = vista · MySQL = verdad',
      tip: 'Si alguien edita la hoja a mano, la base de datos manda.'
    },
    {
      num: 11,
      titulo: 'Ejecutar una prueba',
      texto: 'Execute Workflow (o Test step). Verifica fila en MySQL y réplica en Sheets.',
      url: 'n8n → Executions',
      destacar: 'Success en MySQL y en Sheets',
      tip: 'Prueba en sandbox primero. Luego activa el workflow en producción.'
    }
  ],
  checklist: [
    'Credencial MySQL creada y Test OK',
    'Nodo MySQL en el workflow (Insert or Update)',
    'Columnas mapeadas al esquema mova_datos',
    'Orden canvas: MySQL → Google Sheets',
    'Ejecución de prueba Success en ambos nodos',
    'Workflow Active en producción (o sandbox validado)',
    'Credenciales solo en gestor del equipo (no en repo)'
  ],
  siguiente: {
    titulo: 'Siguiente hito',
    texto: 'Con MySQL como fuente primaria, sigue el hito 4.0 — Rutinas de operación (revisión diaria de ejecuciones n8n + backups).'
  }
};
