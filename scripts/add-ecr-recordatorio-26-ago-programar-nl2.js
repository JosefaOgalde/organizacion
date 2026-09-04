#!/usr/bin/env node
/**
 * 26 ago 2026 — Recordatorio ECR: programar carrusel (28) y video (31) NL2 ago.
 * El artículo ya debe estar publicado. Seguimiento 15:00: ¿ya programaste?
 *
 *   node scripts/add-ecr-recordatorio-26-ago-programar-nl2.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILES = [
  path.join(ROOT, 'data', 'organizacion-live.json'),
  path.join(ROOT, 'data', 'organizacion-respaldo-2026-07-31.json'),
];

const FECHA = '2026-08-26';
const CLIENTE = 'cli-ecr';
const ROL = 'rol-ecr-cm';
const SLUG = 'equipos-en-terreno';
const TITULO_ART = 'Equipos en terreno: la ventaja de ajustar a tiempo';
const ARCHIVO = 'index/clientes/ecr/newsletter/RECORDATORIO-26-AGO-PROGRAMAR-NL2.txt';
const DRIVE_CARRUSEL = 'https://drive.google.com/drive/folders/1tYRWUqAhmR3ZRwZlwg7BXoCk3PfHieGz';
const DRIVE_VIDEO = 'https://drive.google.com/drive/folders/1y0qD1q51J-6LEo0JqIPL4ulLyx3tuiFS';

const MADRE_ID = 'tarea-ecr-recordatorio-programar-nl2-2026-08-26';

const MADRE = {
  id: MADRE_ID,
  titulo: '[ECR] Recordatorio · programar NL2 ago (artículo ya publicado)',
  clienteId: CLIENTE,
  rolId: ROL,
  fecha: FECHA,
  horaInicio: '11:00',
  horaFin: '13:00',
  notas:
    `El artículo NL 2 ago ya debe estar publicado. Apenas se abra esta tarea, entregar ${ARCHIVO}. ` +
    `1) Programar carrusel 28 ago · imágenes ${DRIVE_CARRUSEL}. ` +
    `2) Programar video 31 ago · video ${DRIVE_VIDEO}.`,
  prioridad: 'alta',
  completada: false,
  pendiente: false,
  numeroHistorico: '20',
  tipoEntregable: 'programar',
  articuloSlug: SLUG,
  articuloPublicacion: '2026-08-26',
  articuloTitulo: TITULO_ART,
  parentId: null,
  agendaFijada: true,
};

const HIJOS = [
  {
    id: 'tarea-ecr-programar-nl2-carrusel-2026-08-26',
    titulo: '[ECR] Programar carrusel · 28 ago',
    horaInicio: '11:00',
    horaFin: '12:00',
    numeroHistorico: '21',
    tipoEntregable: 'programar-carrusel',
    ordenHijo: 1,
    notas:
      'Programar carrusel NL2 · Equipos en terreno para el 28 de agosto.\n\n' +
      'Copy:\n\n' +
      'Más personas no garantizan mejor resultado.\n' +
      'Mejor coordinación, sí. 🤝\n\n' +
      'Cuando la cobertura, la asistencia y el desempeño se leen mientras la operación ocurre, el equipo deja de apagar incendios… y empieza a moverse con ventaja.\n\n' +
      'Carrusel rapidito con lo clave de nuestro nuevo artículo sobre equipos en terreno 📲\n' +
      'Desliza y quédate con la idea.\n\n' +
      'Después lee el artículo completo aquí:\n' +
      '[LINK AL ARTÍCULO]\n\n' +
      'Guárdalo si te sirve para la próxima reunión de operaciones 🔖\n\n' +
      '#Staffing #Coordinacion #ECRGroup #LiderazgoOperativo\n\n' +
      `Imágenes: ${DRIVE_CARRUSEL}`,
  },
  {
    id: 'tarea-ecr-programar-nl2-video-2026-08-26',
    titulo: '[ECR] Programar video · 31 ago',
    horaInicio: '12:00',
    horaFin: '13:00',
    numeroHistorico: '22',
    tipoEntregable: 'programar-video',
    ordenHijo: 2,
    notas:
      'Programar video NL2 · Equipos en terreno para el 31 de agosto.\n\n' +
      'Copy:\n\n' +
      'Una campaña puede estar impecable en el PowerPoint. ✅\n' +
      'Pero si la ejecución en sala no se ajusta a tiempo… el resultado se complica. ⚠️\n\n' +
      'Eso pasa cuando la información llega después de la decisión —no antes.\n\n' +
      'En este video te dejamos la idea central (carrusel animado) de nuestro artículo:\n' +
      'equipos en terreno bien gestionados = operación que ajusta a tiempo. 🚀\n\n' +
      'Míralo y sigue en el artículo completo:\n' +
      '[LINK AL ARTÍCULO]\n\n' +
      'Si te resonó, compártelo con tu equipo de terreno 🙌\n\n' +
      '#Video #EquiposEnTerreno #ECRGroup #DecisionesEnTiempoReal\n\n' +
      `Video: ${DRIVE_VIDEO}`,
  },
];

const SEGUIMIENTO = {
  id: 'tarea-ecr-seguimiento-programar-nl2-2026-08-26',
  titulo: '[ECR] ¿Ya programaste carrusel 28 y video 31?',
  clienteId: CLIENTE,
  rolId: ROL,
  fecha: FECHA,
  horaInicio: '15:00',
  horaFin: '16:00',
  notas:
    'Preguntar si ya programó el carrusel del 28 ago y el video del 31 ago. ' +
    'Si SÍ → marcar hecha, no reenviar. Si NO → volver a entregar ' +
    ARCHIVO +
    ' (copys + Drive).',
  prioridad: 'alta',
  completada: false,
  pendiente: false,
  numeroHistorico: '23',
  tipoEntregable: 'programar',
  articuloSlug: SLUG,
  articuloPublicacion: '2026-08-26',
  articuloTitulo: TITULO_ART,
  parentId: null,
  agendaFijada: true,
};

function upsert(data, tarea) {
  data.tareas = Array.isArray(data.tareas) ? data.tareas : [];
  const i = data.tareas.findIndex((t) => t.id === tarea.id);
  if (i >= 0) {
    const prev = data.tareas[i];
    data.tareas[i] = {
      ...prev,
      ...tarea,
      completada: prev.completada === true ? true : !!tarea.completada,
      sesionAgente: prev.sesionAgente,
    };
    return 'upd';
  }
  data.tareas.push({ ...tarea, completada: false, pendiente: false });
  return 'add';
}

let touched = 0;
for (const file of FILES) {
  if (!fs.existsSync(file)) {
    console.warn('Skip (no existe):', path.basename(file));
    continue;
  }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const ops = [];
  ops.push(upsert(data, MADRE));
  for (const h of HIJOS) {
    ops.push(
      upsert(data, {
        ...h,
        clienteId: CLIENTE,
        rolId: ROL,
        fecha: FECHA,
        prioridad: 'alta',
        completada: false,
        pendiente: false,
        parentId: MADRE_ID,
        articuloSlug: SLUG,
        articuloPublicacion: '2026-08-26',
        articuloTitulo: TITULO_ART,
        agendaFijada: true,
      })
    );
  }
  ops.push(upsert(data, SEGUIMIENTO));
  if (data.respaldoActualizado !== undefined) data.respaldoActualizado = '2026-08-19';
  if (data.meta && typeof data.meta === 'object') {
    data.meta.actualizado = new Date().toISOString();
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  touched += 1;
  console.log(path.basename(file), ops.join('/'));
}

console.log(
  `OK (${touched} archivo/s) · ${FECHA} 11:00 recordatorio + 15:00 seguimiento`
);
console.log('Ver: http://127.0.0.1:8000/index.html?disco=1&tarea=ecr/20');
