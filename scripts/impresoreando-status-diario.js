#!/usr/bin/env node
/**
 * Status diario Impresoreando → correo a socios.
 *
 * Uso:
 *   node scripts/impresoreando-status-diario.js
 *   node scripts/impresoreando-status-diario.js --dry-run
 *
 * Variables (.env en la raíz del repo):
 *   STATUS_TO=romerosilvanicolas@gmail.com,josefa.ogalde@gmail.com
 *   MAIL_HOST=smtp.gmail.com
 *   MAIL_PORT=465
 *   MAIL_USER=tu@gmail.com
 *   MAIL_PASS=app-password-de-16-caracteres
 *   MAIL_FROM=Impresoreando <tu@gmail.com>
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { sendMailSsl } = require('./lib/smtp-send');

const ROOT = path.resolve(__dirname, '..');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const PREVIEW = path.join(ROOT, 'data', 'impresoreando-status-ultimo.html');
const ENV_PATH = path.join(ROOT, '.env');

const DEFAULT_TO = ['romerosilvanicolas@gmail.com', 'josefa.ogalde@gmail.com'];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === '') process.env[key] = val;
  }
}

function money(n) {
  return Number(n || 0).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });
}

function sum(arr, key = 'montoNeto') {
  return (arr || []).reduce((a, x) => a + Number(x[key] || 0), 0);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function labelEstado(estado) {
  const e = estado || 'pendiente';
  if (e === 'listo') return 'Listo para entregar';
  if (e === 'en_impresion') return 'En impresión';
  if (e === 'transferido') return 'Transferido → venta (entregado/cobrado)';
  if (e === 'cancelado') return 'Cancelado';
  return 'Pendiente';
}

function pedidoActivo(estado) {
  return ['pendiente', 'listo', 'en_impresion'].includes(estado || 'pendiente');
}

function itemsTxt(ped) {
  return (ped.items || [])
    .map((it) => `${it.cantidad || 1}× ${it.nombre || it.sku || 'ítem'}`)
    .join(', ');
}

function loadData() {
  const file = fs.existsSync(LIVE) ? LIVE : SEED;
  if (!fs.existsSync(file)) throw new Error(`No se encontró ${LIVE} ni ${SEED}`);
  return { data: JSON.parse(fs.readFileSync(file, 'utf8')), file };
}

function buildDigest(data, sourceFile) {
  const gastos = sum(data.gastos);
  const ventas = sum(data.ventas);
  const operacion = sum((data.operacion || []).filter((x) => Number(x.montoNeto) !== 0));
  const metaRecuperar = gastos + operacion;
  const saldoPendiente = Math.max(0, metaRecuperar - ventas);
  const pctRecuperado = metaRecuperar > 0 ? Math.min(100, (ventas / metaRecuperar) * 100) : 100;
  const pctFalta = Math.max(0, 100 - pctRecuperado);
  const sinDeuda = saldoPendiente <= 0;
  const cap = data.meta?.capital || {};
  const deudaJosefa = Number(cap.deudaJosefaClp != null ? cap.deudaJosefaClp : gastos / 2);

  const pedidos = [...(data.pedidos || [])].sort((a, b) =>
    String(a.numero || '').localeCompare(String(b.numero || ''), 'es')
  );
  const pedidosActivos = pedidos.filter((p) => pedidoActivo(p.estado));
  const pedidosTransferidos = pedidos.filter((p) => p.estado === 'transferido');
  const ventasList = [...(data.ventas || [])].sort((a, b) =>
    String(b.fecha || '').localeCompare(String(a.fecha || ''))
  );

  const hoy = new Date();
  const fechaTitulo = hoy.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Santiago',
  });
  const actualizado = data.meta?.actualizado || '—';
  const fechaIso = hoy.toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });

  const filasPedidos = pedidos.length
    ? pedidos
        .map(
          (p) => `<tr>
            <td><strong>${escapeHtml(p.numero || '')}</strong><br><span style="color:#7a5c28;font-size:12px">${escapeHtml(p.fecha || '')}</span></td>
            <td>${escapeHtml(p.cliente || '—')}<br><span style="color:#7a5c28;font-size:12px">${escapeHtml(itemsTxt(p))}</span></td>
            <td style="text-align:right">${money(p.montoNeto)}</td>
            <td>${escapeHtml(labelEstado(p.estado))}</td>
          </tr>`
        )
        .join('')
    : '<tr><td colspan="4">Sin pedidos registrados</td></tr>';

  const filasVentas = ventasList.length
    ? ventasList
        .map((v) => {
          const desde = v.pedidoNumero
            ? `Pedido ${v.pedidoNumero} (transferido/entregado)`
            : 'Venta directa';
          const extra =
            v.descripcion && v.cliente ? ` · ${escapeHtml(v.descripcion)}` : !v.cliente && v.descripcion ? '' : '';
          return `<tr>
            <td>${escapeHtml(v.fecha || '')}</td>
            <td>${escapeHtml(v.cliente || v.descripcion || '—')}<br><span style="color:#7a5c28;font-size:12px">${escapeHtml(desde)}${extra}</span></td>
            <td style="text-align:right">${money(v.montoNeto)}</td>
          </tr>`;
        })
        .join('')
    : '<tr><td colspan="3">Sin ventas contabilizadas aún</td></tr>';

  const subject = sinDeuda
    ? `Impresoreando · status ${fechaIso} · sin deuda`
    : `Impresoreando · status ${fechaIso} · falta ${money(saldoPendiente)} (${pctFalta.toFixed(1)}%)`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f4efe4;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#3b2a14">
  <div style="max-width:640px;margin:0 auto;padding:24px 16px">
    <div style="background:#fffdf7;border:1px solid #e0d0b0;border-radius:14px;padding:20px 22px">
      <p style="margin:0 0 4px;font-size:13px;color:#7a5c28;text-transform:capitalize">Status diario · ${escapeHtml(fechaTitulo)}</p>
      <h1 style="margin:0 0 12px;font-size:22px;color:#7a5c28">Impresoreando · @impresoreando</h1>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.45;color:#5a4220">
        Resumen para Josefa y Nicolás. Fuente: <code>${escapeHtml(path.basename(sourceFile))}</code>
        · actualizado ${escapeHtml(String(actualizado))}
      </p>

      <div style="background:${sinDeuda ? '#eef7f2' : '#fff4e8'};border:1px solid ${sinDeuda ? '#9fcbb5' : '#e0b48a'};border-radius:12px;padding:16px 18px;margin-bottom:20px">
        <div style="font-size:13px;color:#7a5c28;font-weight:700;margin-bottom:4px">
          ${sinDeuda ? 'Sin números rojos' : 'Para salir de números rojos falta recuperar'}
        </div>
        <div style="font-size:28px;font-weight:800">${money(saldoPendiente)}</div>
        <p style="margin:8px 0 0;font-size:14px;line-height:1.45">
          Recuperaron <strong>${money(ventas)}</strong> de <strong>${money(metaRecuperar)}</strong>
          · progreso <strong>${pctRecuperado.toFixed(1)}%</strong>
          · aún falta <strong>${pctFalta.toFixed(1)}%</strong> de la meta.
        </p>
        <div style="margin-top:12px;height:10px;background:#f0e6d4;border-radius:999px;overflow:hidden">
          <div style="height:100%;width:${pctRecuperado.toFixed(1)}%;background:#3d8b6e"></div>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:18px">
        <tr><td style="padding:8px 0;color:#7a5c28">Gastos (ambos)</td><td style="padding:8px 0;text-align:right;font-weight:700">${money(gastos)}</td></tr>
        <tr><td style="padding:8px 0;color:#7a5c28">Operación</td><td style="padding:8px 0;text-align:right;font-weight:700">${money(operacion)}</td></tr>
        <tr><td style="padding:8px 0;color:#7a5c28">Ventas contabilizadas</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#3d8b6e">${money(ventas)}</td></tr>
        <tr><td style="padding:8px 0;color:#7a5c28">Pedidos activos (aún no bajan deuda)</td><td style="padding:8px 0;text-align:right;font-weight:700">${pedidosActivos.length} · ${money(sum(pedidosActivos))}</td></tr>
        <tr><td style="padding:8px 0;color:#7a5c28">Deuda Josefa → Nicolás (50% capital)</td><td style="padding:8px 0;text-align:right;font-weight:700">${money(deudaJosefa)}</td></tr>
      </table>

      <h2 style="margin:0 0 8px;font-size:16px;color:#7a5c28">Pedidos y estados</h2>
      <p style="margin:0 0 10px;font-size:13px;color:#7a5c28">Activos: ${pedidosActivos.length} · Ya transferidos/entregados: ${pedidosTransferidos.length}</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:22px">
        <thead>
          <tr style="background:#f7efe0;text-align:left">
            <th style="padding:8px;border-bottom:1px solid #e0d0b0">ID</th>
            <th style="padding:8px;border-bottom:1px solid #e0d0b0">Cliente / ítems</th>
            <th style="padding:8px;border-bottom:1px solid #e0d0b0;text-align:right">Total</th>
            <th style="padding:8px;border-bottom:1px solid #e0d0b0">Estado</th>
          </tr>
        </thead>
        <tbody>${filasPedidos}</tbody>
      </table>

      <h2 style="margin:0 0 8px;font-size:16px;color:#7a5c28">Ventas entregadas / contabilizadas</h2>
      <p style="margin:0 0 10px;font-size:13px;color:#7a5c28">Solo estas bajan la deuda (pedido transferido → venta, o venta directa).</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="background:#f7efe0;text-align:left">
            <th style="padding:8px;border-bottom:1px solid #e0d0b0">Fecha</th>
            <th style="padding:8px;border-bottom:1px solid #e0d0b0">Detalle</th>
            <th style="padding:8px;border-bottom:1px solid #e0d0b0;text-align:right">Monto</th>
          </tr>
        </thead>
        <tbody>${filasVentas}</tbody>
      </table>
    </div>
    <p style="margin:14px 8px 0;font-size:11px;color:#9a7a48">Correo automático Impresoreando · script local diario.</p>
  </div>
</body>
</html>`;

  return {
    subject,
    html,
    stats: {
      gastos,
      ventas,
      operacion,
      metaRecuperar,
      saldoPendiente,
      pctRecuperado,
      pctFalta,
      pedidosActivos: pedidosActivos.length,
      ventasN: ventasList.length,
    },
  };
}

function parseRecipients() {
  return String(process.env.STATUS_TO || DEFAULT_TO.join(','))
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  loadEnvFile(ENV_PATH);
  const dry =
    process.argv.includes('--dry-run') ||
    process.env.DRY_RUN === '1' ||
    process.env.DRY_RUN === 'true';

  const { data, file } = loadData();
  const digest = buildDigest(data, file);
  fs.mkdirSync(path.dirname(PREVIEW), { recursive: true });
  fs.writeFileSync(PREVIEW, digest.html, 'utf8');

  console.log(`Vista previa: ${PREVIEW}`);
  console.log(`Asunto: ${digest.subject}`);
  console.log(
    `Deuda pendiente ${money(digest.stats.saldoPendiente)} · progreso ${digest.stats.pctRecuperado.toFixed(1)}% · falta ${digest.stats.pctFalta.toFixed(1)}%`
  );
  console.log(
    `Pedidos activos: ${digest.stats.pedidosActivos} · Ventas: ${digest.stats.ventasN} (${money(digest.stats.ventas)})`
  );

  const to = parseRecipients();
  if (dry) {
    console.log(`[dry-run] No se envió. Destinatarios: ${to.join(', ')}`);
    return;
  }

  const user = process.env.MAIL_USER || '';
  const pass = process.env.MAIL_PASS || '';
  const host = process.env.MAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.MAIL_PORT || 465);
  const from = process.env.MAIL_FROM || (user ? `Impresoreando <${user}>` : '');

  if (!user || !pass || !from) {
    console.error(`
Falta configurar correo en .env:

  MAIL_USER=tu@gmail.com
  MAIL_PASS=xxxx xxxx xxxx xxxx
  MAIL_FROM=Impresoreando <tu@gmail.com>
  STATUS_TO=${DEFAULT_TO.join(',')}

Gmail: cuenta → Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones.
Vista previa ya generada en data/impresoreando-status-ultimo.html
`);
    process.exitCode = 2;
    return;
  }

  console.log(`Enviando a: ${to.join(', ')} vía ${host}:${port}…`);
  await sendMailSsl({
    host,
    port,
    user,
    pass: pass.replace(/\s+/g, ''),
    from,
    to,
    subject: digest.subject,
    html: digest.html,
  });
  console.log('Correo enviado ✓');
}

main().catch((err) => {
  console.error(String(err && err.stack ? err.stack : err));
  process.exitCode = 1;
});
