#!/usr/bin/env node
/**
 * Asegura el cliente Impresoreando en data/organizacion-live.json
 * sin borrar tareas ni otros clientes (útil tras importar un respaldo viejo).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LIVE = path.join(ROOT, 'data', 'organizacion-live.json');
const IMP_ID = 'cli-impresoreando';

const SEED = {
  id: IMP_ID,
  nombre: 'Impresoreando',
  abrev: 'IMP',
  tipo: 'freelance',
  color: 'ambar',
  roles: [
    {
      id: 'rol-imp-dis',
      nombre: 'Diseño e impresión',
      abrev: 'DIS',
      funciones:
        'Briefs de impresión\nPiezas gráficas\nMockups y formatos de producción\nIdentidad visual según encargo',
      tareasAlMes: 'Según encargos del momento',
      plazosEntregables: 'Agregar cada tarea en + Nueva tarea cuando llegue un encargo'
    }
  ],
  agente: {
    nombre: 'Agente Impresoreando',
    emoji: '🖨️',
    especialidad: 'Impresión, identidad y piezas gráficas',
    instrucciones:
      'Eres el asistente de Impresoreando. Ayudas con briefs de impresión, piezas gráficas, identidad visual, mockups, formatos de impresión y entregables para el cliente.'
  },
  manualMarca: { texto: '', archivos: [] },
  metas: '',
  contextoPrompt: '',
  ficha: { contacto: '', links: '', notas: '', seccionesExtra: [], documentos: [] }
};

function main() {
  if (!fs.existsSync(LIVE)) {
    console.error('[imp] No existe', LIVE);
    console.error('[imp] Primero importa un respaldo o abre el organizador una vez.');
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
  } catch (e) {
    console.error('[imp] JSON inválido:', e.message);
    process.exit(1);
  }

  if (!Array.isArray(data.clientes)) data.clientes = [];
  if (!Array.isArray(data.tareas)) data.tareas = [];

  const idx = data.clientes.findIndex((c) => c && c.id === IMP_ID);
  if (idx >= 0) {
    const cur = data.clientes[idx];
    data.clientes[idx] = {
      ...SEED,
      ...cur,
      id: IMP_ID,
      nombre: cur.nombre || SEED.nombre,
      abrev: cur.abrev || SEED.abrev,
      tipo: cur.tipo || SEED.tipo,
      color: cur.color || SEED.color,
      roles: Array.isArray(cur.roles) && cur.roles.length ? cur.roles : SEED.roles,
      agente: { ...SEED.agente, ...(cur.agente || {}) }
    };
    console.log('[imp] Impresoreando ya estaba — perfil actualizado');
  } else {
    data.clientes.push({ ...SEED, roles: SEED.roles.map((r) => ({ ...r })) });
    console.log('[imp] Impresoreando añadido a clientes');
  }

  fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(
    `[imp] Guardado ${LIVE} (${data.clientes.length} clientes, ${data.tareas.length} tareas)`
  );
}

main();
