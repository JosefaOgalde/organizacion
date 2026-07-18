#!/usr/bin/env node
/**
 * ECR — nombres de tareas madre según artículo:
 *   1) «Tecnología sin integración…» → NL 1 de agosto
 *   2) «Equipos en terreno…» (ART 23) → NL 2 de agosto
 *
 * Renombra/actualiza madres NL 1 y NL 2 con subtareas indexadas el mismo día.
 * Fechas calendario: NL 1 = 21 jul · NL 2 = 23 jul (pub LinkedIn 1/2 ago).
 *   node scripts/renombrar-ecr-madres-articulos.js
 * Luego: http://127.0.0.1:8000/index.html?disco=1 → vista Semana o Día
 */
const fs = require('fs');
const path = require('path');

const LIVE = path.join(__dirname, '..', 'data', 'organizacion-live.json');
const CLIENTE = 'cli-ecr';
const ROL = 'rol-ecr-cm';

const MADRE_TI_ID = 'tarea-ecr-ecosistema-nl-agosto-2026-07-17';
const FECHA_TI = '2026-07-21';
const PUB_TI = '2026-08-01';

const MADRE_ET_ID = 'tarea-ecr-ecosistema-equipos-terreno-2026-07-24';
const FECHA_ET = '2026-07-23';
const PUB_ET = '2026-08-02';
/** Subtareas ET el mismo día que la madre (como NL 1), para verlas indexadas 1–4 debajo. */
const FECHA_ET_HIJOS = FECHA_ET;

if (!fs.existsSync(LIVE)) {
  console.error('No existe data/organizacion-live.json');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
data.tareas = Array.isArray(data.tareas) ? data.tareas : [];

function upsert(tarea) {
  const i = data.tareas.findIndex((t) => t.id === tarea.id);
  if (i >= 0) {
    const prev = data.tareas[i];
    const { resetEstado, ...campos } = tarea;
    data.tareas[i] = {
      ...prev,
      ...campos,
      // resetEstado: respeta completada de la plantilla (nuevas = false)
      completada: resetEstado
        ? !!tarea.completada
        : prev.completada === true || tarea.completada === true,
      pendiente: resetEstado ? !!tarea.pendiente : prev.pendiente,
      sesionAgente: prev.sesionAgente || tarea.sesionAgente,
      agendaFijada: prev.agendaFijada,
      estadoFijado: resetEstado ? false : prev.estadoFijado,
      articuloArchivo: tarea.articuloArchivo || prev.articuloArchivo,
    };
    console.log('Actualizada:', data.tareas[i].titulo, data.tareas[i].completada ? '[x]' : '[ ]');
  } else {
    const { resetEstado, ...campos } = tarea;
    data.tareas.push({ ...campos, completada: !!campos.completada });
    console.log('Agregada:', campos.titulo);
  }
}

/** —— 1) NL 1 agosto · Tecnología sin integración —— */
const ART_TI_TITULO = 'Tecnología sin integración: el principal freno de la eficiencia';
const ART_TI_DOC = 'index/clientes/ecr/newsletter/articulos/ART-tecnologia-sin-integracion.docx';
const ART_TI_TXT = 'index/clientes/ecr/newsletter/articulos/ART-tecnologia-sin-integracion.txt';
const COPY_TI = 'index/clientes/ecr/newsletter/copys/COPY-tecnologia-sin-integracion.txt';

upsert({
  id: MADRE_TI_ID,
  titulo: '[ECR] NL 1 ago · Tecnología sin integración',
  clienteId: CLIENTE,
  rolId: ROL,
  fecha: FECHA_TI,
  horaInicio: '09:00',
  horaFin: '18:00',
  notas:
    `Tarea madre · artículo «${ART_TI_TITULO}» (NL LinkedIn · calendario ${FECHA_TI}). ` +
    `Word/TXT: articulos/ART-tecnologia-sin-integracion.* ` +
    'Subtareas indexadas: 1 Copys · 2 Portada · 3 Carrusel · 4 Video. ' +
    'La madre se completa cuando termine la última subtarea.',
  prioridad: 'alta',
  completada: false,
  pendiente: false,
  numeroHistorico: '04',
  tipoEntregable: 'ecosistema',
  articuloSlug: 'tecnologia-sin-integracion',
  articuloTitulo: ART_TI_TITULO,
  articuloPublicacion: PUB_TI,
  entregableArchivo: ART_TI_DOC,
  articuloArchivo: {
    nombre: 'ART-tecnologia-sin-integracion.docx',
    url: '/' + ART_TI_DOC,
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    kind: 'articulo',
    subido: FECHA_TI,
  },
  fechaFin: FECHA_TI,
  parentId: null,
});

const hijosTI = [
  {
    id: 'tarea-ecr-nl-agosto-copys-2026-07-17',
    titulo: '[ECR] TI — Copys (TXT)',
    horaInicio: '09:00',
    horaFin: '11:00',
    numeroHistorico: '05',
    tipoEntregable: 'copys-txt',
    ordenHijo: 1,
    entregableArchivo: COPY_TI,
    articuloSlug: 'tecnologia-sin-integracion',
    notas: `Copys feed / carrusel / video del artículo «${ART_TI_TITULO}» (NL 1 ago). Archivo: ${COPY_TI}`,
  },
  {
    id: 'tarea-ecr-nl-agosto-portada-2026-07-17',
    titulo: '[ECR] TI — Portada (fondos)',
    horaInicio: '11:00',
    horaFin: '13:00',
    numeroHistorico: '06',
    tipoEntregable: 'portada-imgs',
    ordenHijo: 2,
    entregableArchivo:
      'index/clientes/ecr/newsletter/portadas-guardadas/NL1-ago-portadas-canva-finales.md',
    notas:
      `Portadas Canva finales NL 1 · «${ART_TI_TITULO}». Carpeta nl1-ago-finales/ + NL1-ago-portadas-canva-finales.md.`,
  },
  {
    id: 'tarea-ecr-nl-agosto-carrusel-2026-07-17',
    titulo: '[ECR] TI — Carrusel',
    horaInicio: '13:00',
    horaFin: '15:30',
    numeroHistorico: '07',
    tipoEntregable: 'carrusel',
    ordenHijo: 3,
    entregableArchivo: ART_TI_TXT,
    notas: `Carrusel Canva del artículo «${ART_TI_TITULO}».`,
  },
  {
    id: 'tarea-ecr-nl-agosto-video-2026-07-17',
    titulo: '[ECR] TI — Video',
    horaInicio: '15:30',
    horaFin: '18:00',
    numeroHistorico: '08',
    tipoEntregable: 'video',
    ordenHijo: 4,
    entregableArchivo: ART_TI_TXT,
    notas: `Video = carrusel animado · «${ART_TI_TITULO}».`,
  },
];

for (const h of hijosTI) {
  upsert({
    ...h,
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: FECHA_TI,
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    resetEstado: true,
    parentId: MADRE_TI_ID,
    articuloSlug: 'tecnologia-sin-integracion',
  });
}

/** —— 2) NL 2 agosto · Equipos en terreno (ART 23) —— */
const ART_ET_TITULO = 'Equipos en terreno: la ventaja de ajustar a tiempo';
const ART_ET_DOC = 'index/clientes/ecr/newsletter/articulos/ART23-equipos-en-terreno.docx';
const ART_ET_TXT = 'index/clientes/ecr/newsletter/articulos/ART23-equipos-en-terreno.txt';
const ART_ET_COPY = 'index/clientes/ecr/newsletter/copys/COPY-equipos-en-terreno.txt';

upsert({
  id: MADRE_ET_ID,
  titulo: '[ECR] NL 2 ago · Equipos en terreno',
  clienteId: CLIENTE,
  rolId: ROL,
  fecha: FECHA_ET,
  horaInicio: '09:00',
  horaFin: '18:00',
  notas:
    `Tarea madre · ART 23 · artículo «${ART_ET_TITULO}» (calendario ${FECHA_ET}). ` +
    `Madre + subtareas indexadas el ${FECHA_ET} (Copys · Portada · Carrusel · Video). ` +
    `Word/TXT: articulos/ART23-equipos-en-terreno.* · Copys: copys/COPY-equipos-en-terreno.txt. ` +
    'La madre se completa cuando termine la última subtarea.',
  prioridad: 'alta',
  completada: false,
  pendiente: false,
  numeroHistorico: '09',
  tipoEntregable: 'ecosistema',
  articuloSlug: 'equipos-en-terreno',
  articuloTitulo: ART_ET_TITULO,
  articuloPublicacion: PUB_ET,
  articuloCodigo: 'ART23',
  entregableArchivo: ART_ET_DOC,
  articuloArchivo: {
    nombre: 'ART23-equipos-en-terreno.docx',
    url: '/' + ART_ET_DOC,
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    kind: 'articulo',
    subido: FECHA_ET,
  },
  fechaFin: FECHA_ET_HIJOS,
  parentId: null,
});

const hijosET = [
  {
    id: 'tarea-ecr-et-copys-2026-07-24',
    titulo: '[ECR] ET — Copys (TXT)',
    horaInicio: '09:00',
    horaFin: '11:00',
    numeroHistorico: '10',
    tipoEntregable: 'copys-txt',
    ordenHijo: 1,
    entregableArchivo: ART_ET_COPY,
    notas: `Copys feed / carrusel / video · «${ART_ET_TITULO}» (NL 2 ago). Archivo: ${ART_ET_COPY}`,
  },
  {
    id: 'tarea-ecr-et-portada-2026-07-24',
    titulo: '[ECR] ET — Portada (fondos)',
    horaInicio: '11:00',
    horaFin: '13:00',
    numeroHistorico: '11',
    tipoEntregable: 'portada-imgs',
    ordenHijo: 2,
    entregableArchivo: 'index/clientes/ecr/newsletter/portadas-guardadas/ART23-equipos-en-terreno.md',
    notas: `Prompts/fondos ART23 · «${ART_ET_TITULO}» (NL 2 ago). Artículo: ART23-equipos-en-terreno.docx`,
  },
  {
    id: 'tarea-ecr-et-carrusel-2026-07-24',
    titulo: '[ECR] ET — Carrusel',
    horaInicio: '13:00',
    horaFin: '15:30',
    numeroHistorico: '12',
    tipoEntregable: 'carrusel',
    ordenHijo: 3,
    entregableArchivo: ART_ET_TXT,
    notas: `Carrusel con slides del artículo «${ART_ET_TITULO}».`,
  },
  {
    id: 'tarea-ecr-et-video-2026-07-24',
    titulo: '[ECR] ET — Video',
    horaInicio: '15:30',
    horaFin: '18:00',
    numeroHistorico: '13',
    tipoEntregable: 'video',
    ordenHijo: 4,
    entregableArchivo: ART_ET_TXT,
    notas: `Video = carrusel animado · «${ART_ET_TITULO}».`,
  },
];

for (const h of hijosET) {
  upsert({
    ...h,
    clienteId: CLIENTE,
    rolId: ROL,
    fecha: FECHA_ET_HIJOS,
    prioridad: 'alta',
    completada: false,
    pendiente: false,
    resetEstado: true,
    parentId: MADRE_ET_ID,
    articuloSlug: 'equipos-en-terreno',
  });
}

data.respaldoActualizado = new Date().toISOString().slice(0, 10);

// Madre: solo fechaFin (cierre con modal en la UI)
data.tareas.forEach((m) => {
  if (!m || m.parentId) return;
  const hijos = data.tareas.filter((h) => h && h.parentId === m.id);
  if (!hijos.length) return;
  const fechas = hijos.map((h) => h.fecha).filter(Boolean).sort();
  if (fechas.length) m.fechaFin = fechas[fechas.length - 1];
});

fs.writeFileSync(LIVE, JSON.stringify(data, null, 2) + '\n', 'utf8');

const madres = data.tareas.filter((t) => t.clienteId === CLIENTE && !t.parentId && t.tipoEntregable === 'ecosistema');
console.log('\nMadres ecosistema ECR:');
madres.forEach((m) => {
  const kids = data.tareas
    .filter((h) => h.parentId === m.id)
    .sort((a, b) => (a.ordenHijo || 0) - (b.ordenHijo || 0));
  console.log(`  ${m.fecha}  ${m.titulo}  (${kids.length} subtareas)`);
  kids.forEach((k, i) => console.log(`    ${i + 1}. ${k.titulo}`));
});
console.log('\nAbre Semana o Día: http://localhost:3000/index.html?disco=1');
