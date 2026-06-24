const STORAGE_KEY = 'organizacion_data';
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

let semanaOffset = 0;

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return getDefaultData();
    }
  }
  return getDefaultData();
}

function getDefaultData() {
  return {
    clientes: [],
    tareas: [],
    ultimaVisita: null
  };
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function hoy() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatFecha(d) {
  return d.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISODate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function inicioSemana(fecha) {
  const d = new Date(fecha);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function finSemana(inicio) {
  const d = new Date(inicio);
  d.setDate(d.getDate() + 6);
  return d;
}

function moverTareasVencidas(data) {
  const hoyStr = toISODate(hoy());
  const ultima = data.ultimaVisita;

  if (ultima === hoyStr) return data;

  data.tareas.forEach(t => {
    if (!t.completada && t.fecha < hoyStr && !t.pendiente) {
      t.pendiente = true;
      t.fechaOriginal = t.fecha;
    }
  });

  data.ultimaVisita = hoyStr;
  return data;
}

function getSemanaActual() {
  const base = hoy();
  base.setDate(base.getDate() + semanaOffset * 7);
  const inicio = inicioSemana(base);
  const fin = finSemana(inicio);
  return { inicio, fin };
}

function renderFechaActual() {
  document.getElementById('fecha-actual').textContent = formatFecha(hoy());
}

function renderCalendario(data) {
  const { inicio, fin } = getSemanaActual();
  const contenedor = document.getElementById('calendario-semana');
  const rango = document.getElementById('rango-semana');
  const hoyStr = toISODate(hoy());

  rango.textContent = `${inicio.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} — ${fin.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  contenedor.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const dia = new Date(inicio);
    dia.setDate(dia.getDate() + i);
    const diaStr = toISODate(dia);
    const esHoy = diaStr === hoyStr;
    const esPasado = diaStr < hoyStr;

    const tareasDia = data.tareas.filter(t => t.fecha === diaStr && !t.pendiente);

    const el = document.createElement('div');
    el.className = `dia${esHoy ? ' dia--hoy' : ''}${esPasado ? ' dia--pasado' : ''}`;
    el.innerHTML = `
      <div class="dia__header">
        <div class="dia__nombre">${DIAS[i]}</div>
        <div class="dia__numero">${dia.getDate()}</div>
      </div>
      <div class="dia__tareas">
        ${tareasDia.length ? tareasDia.map(t => renderTareaCard(t, data)).join('') : '<p class="task-list--empty" style="font-size:0.75rem">Sin tareas</p>'}
      </div>
    `;
    contenedor.appendChild(el);
  }

  bindTareaAcciones(contenedor, data);
}

function renderTareaCard(t, data) {
  const cliente = data.clientes.find(c => c.id === t.clienteId);
  const nombreCliente = cliente ? cliente.nombre : 'Sin cliente';
  const tipo = cliente?.tipo || '';
  const hora = t.horaInicio ? `${t.horaInicio}${t.horaFin ? ' – ' + t.horaFin : ''}` : '';

  return `
    <div class="tarea ${t.completada ? 'tarea--completada' : ''} tarea--${t.prioridad} ${tipo === 'personal' ? 'tarea--personal' : ''}" data-id="${t.id}">
      <div class="tarea__titulo">${escapeHtml(t.titulo)}</div>
      <div class="tarea__meta">${escapeHtml(nombreCliente)}${hora ? ' · ' + hora : ''}</div>
      <div class="tarea__acciones">
        <button class="tarea__btn" data-action="toggle" data-id="${t.id}">${t.completada ? '↩ Deshacer' : '✓ Hecho'}</button>
        <button class="tarea__btn" data-action="pendiente" data-id="${t.id}">→ Pendiente</button>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function bindTareaAcciones(container, data) {
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      const tarea = data.tareas.find(t => t.id === id);
      if (!tarea) return;

      if (action === 'toggle') {
        tarea.completada = !tarea.completada;
      } else if (action === 'pendiente') {
        tarea.pendiente = true;
        tarea.fechaOriginal = tarea.fecha;
      }

      saveData(data);
      refresh(data);
    });
  });
}

function renderPendientes(data) {
  const lista = document.getElementById('lista-pendientes');
  const pendientes = data.tareas.filter(t => t.pendiente && !t.completada);

  if (!pendientes.length) {
    lista.innerHTML = '<p class="task-list--empty">No hay tareas pendientes 🎉</p>';
    return;
  }

  lista.innerHTML = pendientes.map(t => {
    const cliente = data.clientes.find(c => c.id === t.clienteId);
    const fechaOrig = t.fechaOriginal ? ` (era ${t.fechaOriginal})` : '';
    return `
      <div class="tarea tarea--${t.prioridad}" data-id="${t.id}">
        <div class="tarea__titulo">${escapeHtml(t.titulo)}</div>
        <div class="tarea__meta">${escapeHtml(cliente?.nombre || 'Sin cliente')}${fechaOrig}</div>
        <div class="tarea__acciones">
          <button class="tarea__btn" data-action="asignar-hoy" data-id="${t.id}">→ Hoy</button>
          <button class="tarea__btn" data-action="toggle" data-id="${t.id}">✓ Hecho</button>
        </div>
      </div>
    `;
  }).join('');

  lista.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const tarea = data.tareas.find(t => t.id === id);
      if (!tarea) return;

      if (btn.dataset.action === 'asignar-hoy') {
        tarea.fecha = toISODate(hoy());
        tarea.pendiente = false;
      } else if (btn.dataset.action === 'toggle') {
        tarea.completada = true;
      }

      saveData(data);
      refresh(data);
    });
  });
}

function renderClientes(data) {
  const grid = document.getElementById('lista-clientes');
  const select = document.getElementById('tarea-cliente');

  if (!data.clientes.length) {
    grid.innerHTML = '<p class="task-list--empty">Aún no hay clientes registrados. Usa el formulario de abajo.</p>';
  } else {
    grid.innerHTML = data.clientes.map(c => `
      <div class="cliente-card">
        <div class="cliente-card__nombre">${escapeHtml(c.nombre)}</div>
        <span class="cliente-card__tipo">${c.tipo}</span>
        <div class="cliente-card__meta">
          <strong>Entrega:</strong> ${c.fechaLimite || '—'}<br>
          <strong>Prioridad:</strong> ${c.prioridad}<br>
          ${c.horasSemanales ? `<strong>Horas/sem:</strong> ${c.horasSemanales}<br>` : ''}
          ${c.entregables ? `<strong>Entregables:</strong> ${escapeHtml(c.entregables.slice(0, 80))}${c.entregables.length > 80 ? '…' : ''}` : ''}
        </div>
      </div>
    `).join('');
  }

  select.innerHTML = '<option value="">Seleccionar...</option>' +
    data.clientes.map(c => `<option value="${c.id}">${escapeHtml(c.nombre)} (${c.tipo})</option>`).join('');
}

function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('tab--active'));
      document.querySelectorAll('.view').forEach(v => v.classList.remove('view--active'));
      tab.classList.add('tab--active');
      document.getElementById(`view-${tab.dataset.view}`).classList.add('view--active');
    });
  });
}

function setupForms(data) {
  document.getElementById('form-cliente').addEventListener('submit', e => {
    e.preventDefault();
    const cliente = {
      id: generarId(),
      nombre: document.getElementById('cliente-nombre').value.trim(),
      tipo: document.getElementById('cliente-tipo').value,
      color: document.getElementById('cliente-color').value,
      descripcion: document.getElementById('cliente-descripcion').value.trim(),
      fechaInicio: document.getElementById('cliente-fecha-inicio').value,
      fechaLimite: document.getElementById('cliente-fecha-limite').value,
      entregables: document.getElementById('cliente-entregables').value.trim(),
      horasSemanales: parseInt(document.getElementById('cliente-horas').value) || null,
      prioridad: document.getElementById('cliente-prioridad').value,
      notas: document.getElementById('cliente-notas').value.trim(),
      creado: toISODate(hoy())
    };
    data.clientes.push(cliente);
    saveData(data);
    e.target.reset();
    refresh(data);
    alert('Cliente guardado correctamente.');
  });

  document.getElementById('form-tarea').addEventListener('submit', e => {
    e.preventDefault();
    const tarea = {
      id: generarId(),
      titulo: document.getElementById('tarea-titulo').value.trim(),
      clienteId: document.getElementById('tarea-cliente').value,
      fecha: document.getElementById('tarea-fecha').value,
      horaInicio: document.getElementById('tarea-hora-inicio').value,
      horaFin: document.getElementById('tarea-hora-fin').value,
      descripcion: document.getElementById('tarea-descripcion').value.trim(),
      prioridad: document.getElementById('tarea-prioridad').value,
      estimadoMin: parseInt(document.getElementById('tarea-estimado').value) || null,
      completada: false,
      pendiente: false,
      creado: toISODate(hoy())
    };
    data.tareas.push(tarea);
    saveData(data);
    e.target.reset();
    document.getElementById('tarea-fecha').value = toISODate(hoy());
    refresh(data);
    alert('Tarea creada.');
  });

  document.getElementById('tarea-fecha').value = toISODate(hoy());
}

function setupWeekNav(data) {
  document.getElementById('btn-semana-anterior').addEventListener('click', () => {
    semanaOffset--;
    renderCalendario(data);
  });
  document.getElementById('btn-semana-siguiente').addEventListener('click', () => {
    semanaOffset++;
    renderCalendario(data);
  });
  document.getElementById('btn-semana-hoy').addEventListener('click', () => {
    semanaOffset = 0;
    renderCalendario(data);
  });
}

function setupModal() {
  const modal = document.getElementById('modal-info');
  const params = new URLSearchParams(window.location.search);
  const mostrar = !localStorage.getItem('organizacion_info_visto') || params.get('info') === '1';

  if (mostrar && !dataHasClientes()) {
    modal.classList.add('modal--open');
  }

  document.getElementById('cerrar-modal').addEventListener('click', () => {
    modal.classList.remove('modal--open');
    localStorage.setItem('organizacion_info_visto', '1');
  });

  document.getElementById('ir-clientes').addEventListener('click', () => {
    modal.classList.remove('modal--open');
    localStorage.setItem('organizacion_info_visto', '1');
    document.querySelector('[data-view="clientes"]').click();
  });
}

function dataHasClientes() {
  return loadData().clientes.length > 0;
}

function refresh(data) {
  renderCalendario(data);
  renderPendientes(data);
  renderClientes(data);
}

function init() {
  let data = loadData();
  data = moverTareasVencidas(data);
  saveData(data);

  renderFechaActual();
  setupTabs();
  setupForms(data);
  setupWeekNav(data);
  setupModal();
  refresh(data);
}

document.addEventListener('DOMContentLoaded', init);

// Exportar datos para el agente de Cursor
window.exportarDatos = function () {
  return loadData();
};

window.importarDatos = function (nuevoData) {
  saveData(nuevoData);
  location.reload();
};
