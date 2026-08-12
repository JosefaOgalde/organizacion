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
const os = require('os');
const path = require('path');
const http = require('http');
const { execFileSync, spawn } = require('child_process');
const { sendMailSsl } = require('./lib/smtp-send');

const ROOT = path.resolve(__dirname, '..');
const LIVE = path.join(ROOT, 'data', 'impresoreando-live.json');
const SEED = path.join(ROOT, 'data', 'impresoreando-seed.json');
const PREVIEW = path.join(ROOT, 'data', 'impresoreando-status-ultimo.html');
const ENV_PATH = path.join(ROOT, '.env');

function findHeadlessBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.EDGE_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);
  return candidates.find((p) => fs.existsSync(p)) || '';
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(d));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(String(ev.data));
      if (!msg.id || !this.pending.has(msg.id)) return;
      const { ok, fail } = this.pending.get(msg.id);
      this.pending.delete(msg.id);
      if (msg.error) fail(new Error(msg.error.message || JSON.stringify(msg.error)));
      else ok(msg.result);
    });
  }
  ready() {
    return new Promise((resolve, reject) => {
      this.ws.addEventListener('open', () => resolve());
      this.ws.addEventListener('error', (e) => reject(e));
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { ok: resolve, fail: reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  close() {
    try {
      this.ws.close();
    } catch (_) {
      /* ignore */
    }
  }
}

async function waitJson(url, tries = 50) {
  for (let i = 0; i < tries; i++) {
    try {
      return await httpGetJson(url);
    } catch (_) {
      await sleep(120);
    }
  }
  throw new Error('CDP no arrancó');
}

function estimatePageHeightMm(html) {
  const rows = (String(html || '').match(/<tr[\s>]/gi) || []).length;
  const lis = (String(html || '').match(/<li[\s>]/gi) || []).length;
  return Math.min(4000, Math.max(220, 120 + rows * 9 + lis * 7));
}

function pdfPageCount(pdfPath) {
  const text = fs.readFileSync(pdfPath, 'latin1');
  const pages = text.match(/\/Type\s*\/Page(?!s)\b/g);
  if (pages && pages.length) return pages.length;
  const m = text.match(/\/Type\s*\/Pages\b[\s\S]{0,200}?\/Count\s+(\d+)/);
  return m ? Number(m[1]) : 0;
}

function injectSinglePageCss(htmlPath, heightMm) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const css = `<style id="imp-pdf-page">
@page { size: 210mm ${Math.ceil(heightMm)}mm; margin: 6mm; }
html, body { margin: 0; padding: 0; background: #f4efe4; }
* { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.sheet, table, thead, tbody, tr, td, th, h1, h2, p, ol, li, div { break-inside: auto; page-break-inside: auto; page-break-after: auto; page-break-before: auto; }
</style>`;
  const next = /<head[^>]*>/i.test(html)
    ? html.replace(/<head[^>]*>/i, (m) => `${m}\n${css}`)
    : `${css}${html}`;
  fs.writeFileSync(htmlPath, next, 'utf8');
}

async function htmlFileToPdfCdp(browser, htmlPath, pdfPath) {
  const fileUrl = 'file:///' + path.resolve(htmlPath).replace(/\\/g, '/');
  const port = 9333 + Math.floor(Math.random() * 80);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'imp-pdf-'));
  const proc = spawn(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--allow-file-access-from-files',
      `--remote-debugging-port=${port}`,
      '--remote-allow-origins=*',
      `--user-data-dir=${profile}`,
      fileUrl,
    ],
    { stdio: 'ignore' }
  );
  try {
    const targets = await waitJson(`http://127.0.0.1:${port}/json/list`);
    const page = (Array.isArray(targets) ? targets : []).find(
      (t) => t && t.webSocketDebuggerUrl && (!t.type || t.type === 'page')
    );
    if (!page) throw new Error('Sin pestaña CDP');
    const cdp = new CdpClient(page.webSocketDebuggerUrl);
    await cdp.ready();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    try {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: 794,
        height: 24000,
        deviceScaleFactor: 1,
        mobile: false,
      });
    } catch (_) {
      /* ignore */
    }
    try {
      await cdp.send('Page.bringToFront');
    } catch (_) {
      /* ignore */
    }
    await sleep(900);
    let heightPx = 0;
    try {
      const metrics = await cdp.send('Page.getLayoutMetrics');
      heightPx = Number(
        (metrics.cssContentSize && metrics.cssContentSize.height) ||
          (metrics.contentSize && metrics.contentSize.height) ||
          0
      );
    } catch (_) {
      /* ignore */
    }
    if (!heightPx) {
      const measured = await cdp.send('Runtime.evaluate', {
        expression:
          'Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, document.documentElement.offsetHeight)',
        returnByValue: true,
      });
      heightPx = Number(measured && measured.result && measured.result.value) || 2200;
    }
    const heightIn = Math.min(200, Math.max(4, heightPx / 96 + 0.18));
    const printed = await cdp.send('Page.printToPDF', {
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: false,
      paperWidth: 8.27,
      paperHeight: heightIn,
      marginTop: 0.2,
      marginBottom: 0.12,
      marginLeft: 0.32,
      marginRight: 0.32,
    });
    cdp.close();
    const buf = Buffer.from(printed.data, 'base64');
    if (buf.length < 100) throw new Error('PDF CDP vacío');
    fs.writeFileSync(pdfPath, buf);
  } finally {
    try {
      proc.kill();
    } catch (_) {
      /* ignore */
    }
    await sleep(200);
    try {
      fs.rmSync(profile, { recursive: true, force: true });
    } catch (_) {
      /* ignore */
    }
  }
}

function htmlFileToPdfFallback(browser, htmlPath, pdfPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  injectSinglePageCss(htmlPath, estimatePageHeightMm(html));
  const fileUrl = 'file:///' + path.resolve(htmlPath).replace(/\\/g, '/');
  execFileSync(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--print-to-pdf=${pdfPath}`,
      fileUrl,
    ],
    { timeout: 90000, stdio: 'ignore' }
  );
}

async function htmlFileToPdf(htmlPath, pdfPath) {
  const browser = findHeadlessBrowser();
  if (!browser) {
    throw new Error('No se encontró Chrome ni Edge para generar el PDF');
  }
  try {
    await htmlFileToPdfCdp(browser, htmlPath, pdfPath);
  } catch (e) {
    console.error(`PDF CDP falló (${e.message || e}); usando fallback de una hoja alta…`);
    htmlFileToPdfFallback(browser, htmlPath, pdfPath);
  }
  if (!fs.existsSync(pdfPath) || fs.statSync(pdfPath).size < 100) {
    throw new Error('El PDF no se generó');
  }
  if (pdfPageCount(pdfPath) > 1) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    injectSinglePageCss(htmlPath, Math.ceil(estimatePageHeightMm(html) * 1.08));
    htmlFileToPdfFallback(browser, htmlPath, pdfPath);
  }
  if (pdfPageCount(pdfPath) > 1) {
    throw new Error(`El PDF sigue en ${pdfPageCount(pdfPath)} páginas`);
  }
}

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

function esGastoDeVentas(g) {
  if (!g) return false;
  if (g.pagadoConVentas === true) return true;
  return /^ventas$/i.test(String(g.pagadoPor || ''));
}

function chileYmd(d = new Date()) {
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
}

function parseYmd(s) {
  const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return { y: Number(m[1]), mo: Number(m[2]), d: Number(m[3]) };
}

function diffDaysYmd(a, b) {
  const A = parseYmd(a);
  const B = parseYmd(b);
  if (!A || !B) return 0;
  return Math.round((Date.UTC(B.y, B.mo - 1, B.d) - Date.UTC(A.y, A.mo - 1, A.d)) / 86400000);
}

function addMonthsYmd(ymd, months) {
  const p = parseYmd(ymd);
  if (!p) return ymd;
  const dt = new Date(Date.UTC(p.y, p.mo - 1 + Number(months || 0), p.d));
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${dt.getUTCFullYear()}-${mm}-${dd}`;
}

function fmtFechaCorta(ymd) {
  const p = parseYmd(ymd);
  if (!p) return String(ymd || '');
  return `${String(p.d).padStart(2, '0')}-${String(p.mo).padStart(2, '0')}`;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pedidoActivo(estado) {
  return ['pendiente', 'listo', 'en_impresion'].includes(estado || 'pendiente');
}

function itemsTxt(ped) {
  return (ped.items || [])
    .map((it) => `${it.cantidad || 1}× ${it.nombre || it.sku || 'ítem'}`)
    .join(', ');
}

function limpiaDescVenta(v) {
  let d = String(v.descripcion || '');
  d = d.replace(/\bPED-\d+\b/gi, '');
  d = d.replace(/pedido\s+transferido\/entregado/gi, '');
  d = d.replace(/transferido\/entregado/gi, '');
  d = d.replace(/venta directa/gi, '');
  d = d.replace(/\s*[·•|]+\s*/g, ' · ').replace(/^[·\s]+|[·\s]+$/g, '').trim();
  const cliente = String(v.cliente || '').trim();
  if (cliente) {
    const esc = cliente.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    d = d.replace(new RegExp(`(?:^|\\s*[·•]\\s*)${esc}\\s*$`, 'i'), '').trim();
    d = d.replace(new RegExp(`^${esc}\\s*[·•]\\s*`, 'i'), '').trim();
    if (d === cliente) d = '';
  }
  return d.replace(/^[·\s]+|[·\s]+$/g, '').trim();
}

function loadData() {
  const file = fs.existsSync(LIVE) ? LIVE : SEED;
  if (!fs.existsSync(file)) throw new Error(`No se encontró ${LIVE} ni ${SEED}`);
  return { data: JSON.parse(fs.readFileSync(file, 'utf8')), file };
}

function buildDigest(data, sourceFile) {
  const gastosLista = data.gastos || [];
  const opLista = data.operacion || [];
  const gastosDeVentasLista = gastosLista.filter(esGastoDeVentas);
  const opReinversionLista = opLista.filter(esGastoDeVentas);
  const listaReinversion = [...opReinversionLista, ...gastosDeVentasLista];
  const gastosCapitalLista = gastosLista.filter((g) => !esGastoDeVentas(g));
  const gastos = sum(gastosCapitalLista);
  const reinversionVentas = sum(listaReinversion);
  const ventas = sum(data.ventas);
  const operacion = sum(opLista.filter((x) => !esGastoDeVentas(x) && Number(x.montoNeto) !== 0));
  const metaRecuperar = gastos + operacion;
  const saldoPendiente = Math.max(0, metaRecuperar - ventas);
  const pctRecuperado = metaRecuperar > 0 ? Math.min(100, (ventas / metaRecuperar) * 100) : 100;
  const pctFalta = Math.max(0, 100 - pctRecuperado);
  const sinDeuda = saldoPendiente <= 0;
  const cap = data.meta?.capital || {};
  const capitalJosefa = gastosCapitalLista.reduce((a, g) => {
    if (/josefa/i.test(String(g.pagadoPor || ''))) return a + Number(g.montoNeto || 0);
    return a;
  }, 0);
  const deudaJosefa = Number(
    cap.deudaJosefaClp != null ? cap.deudaJosefaClp : Math.max(0, Math.round(gastos / 2 - capitalJosefa))
  );
  const cajaDecl = Number(data.meta?.caja?.saldoDeclaradoClp);
  const cajaDeclarado = Number.isFinite(cajaDecl) ? cajaDecl : null;
  const cajaTeorico = ventas - reinversionVentas;
  const cajaMostrar = cajaDeclarado != null ? cajaDeclarado : cajaTeorico;

  const pedidos = [...(data.pedidos || [])].sort((a, b) =>
    String(a.numero || '').localeCompare(String(b.numero || ''), 'es')
  );
  const pedidosActivos = pedidos.filter((p) => pedidoActivo(p.estado));
  const pedidosListos = pedidosActivos.filter((p) => p.estado === 'listo');
  const pedidosEnImpresion = pedidosActivos.filter((p) => p.estado === 'en_impresion');
  const pedidosDestacar = [...pedidosListos, ...pedidosEnImpresion].sort((a, b) => {
    const c = String(a.cliente || '').localeCompare(String(b.cliente || ''), 'es');
    if (c) return c;
    if ((a.estado || '') === (b.estado || '')) {
      return String(a.numero || '').localeCompare(String(b.numero || ''), 'es');
    }
    return a.estado === 'listo' ? -1 : 1;
  });
  const montoListos = sum(pedidosListos);
  const montoEnImpresion = sum(pedidosEnImpresion);
  const detalleEnImpresion = pedidosEnImpresion.map(itemsTxt).filter(Boolean).join(' · ');
  const montoPedidos = sum(pedidosActivos);
  const ventasMasPedidos = ventas + montoPedidos;
  const denomBarra = Math.max(metaRecuperar, ventas, ventasMasPedidos, 1);
  const pctVentasBar = Math.min(100, (ventas / denomBarra) * 100);
  const pctPedidosBar = Math.min(Math.max(0, 100 - pctVentasBar), (montoPedidos / denomBarra) * 100);
  const pctPipeline =
    metaRecuperar > 0 ? Math.min(100, (ventasMasPedidos / metaRecuperar) * 100) : 100;
  const ventasList = [...(data.ventas || [])].sort((a, b) =>
    String(b.fecha || '').localeCompare(String(a.fecha || ''))
  );

  const dia1 = [...(data.ventas || [])]
    .map((v) => String(v.fecha || '').slice(0, 10))
    .filter((f) => /^\d{4}-\d{2}-\d{2}$/.test(f))
    .sort()[0] || '2026-07-18';
  const hoyCl = chileYmd();
  const horizonteMeses = Number(data.meta?.proyeccion?.horizonteMeses) > 0
    ? Number(data.meta.proyeccion.horizonteMeses)
    : 2;
  const metaPctObjetivo = Number(data.meta?.proyeccion?.metaPct) > 0
    ? Number(data.meta.proyeccion.metaPct)
    : 30;
  const fechaMeta30 = addMonthsYmd(dia1, horizonteMeses);
  const meta30Clp = Math.round(metaRecuperar * (metaPctObjetivo / 100));
  const faltante30 = Math.max(0, meta30Clp - ventas);
  const diasAOmnium = diffDaysYmd(hoyCl, '2026-08-29');

  const ideas = Array.isArray(data.ideasImprimir) && data.ideasImprimir.length
    ? data.ideasImprimir
    : [
        { nombre: 'Llaveros Colo-Colo' },
        { nombre: 'Llaveros de la U' },
        { nombre: 'Llaveros de la Católica' },
        { nombre: 'Soporte tablet' },
        { nombre: 'Abrebotellas' },
        { nombre: 'Pastillero' },
      ];
  const ideasNombres = ideas.map((i) => i.nombre).filter(Boolean);
  const ideasListaHtml = ideasNombres.length
    ? `<ul style="margin:0;padding-left:1.2rem;font-size:14px;line-height:1.5;color:#3b2a14">${ideasNombres
        .map((n) => `<li style="margin:0 0 4px">${escapeHtml(n)}</li>`)
        .join('')}</ul>`
    : '<p style="margin:0;font-size:14px;color:#7a5c28">Sin ideas aún</p>';

  function personaPedido(p) {
    const cliente = String(p.cliente || '—').trim();
    const nombre =
      String(p.clienteNombre || '').trim() ||
      cliente.replace(/\s+(SIE|MKOF)\s*$/i, '').trim() ||
      cliente;
    const origen =
      String(p.clienteOrigen || '').trim() ||
      (/\bSIE\b/i.test(cliente) ? 'SIE' : /\bMKOF\b/i.test(cliente) ? 'MKOF' : '');
    return { cliente, nombre, origen, numero: String(p.numero || '').trim() || '—' };
  }

  const cardsListosHtml = pedidosDestacar.length
    ? `<div>${pedidosDestacar
        .map((p) => {
          const { nombre, origen, numero } = personaPedido(p);
          const enImp = p.estado === 'en_impresion';
          const estColor = enImp ? '#2f6f9f' : '#3d8b6e';
          const estTxt = enImp ? 'en impresión' : 'listo';
          return `<table role="presentation" style="width:100%;border:1px solid #c9b48a;border-radius:12px;border-collapse:separate;background:#fffdf7;margin:0 0 8px">
            <tr>
              <td style="width:42%;padding:10px 12px;vertical-align:top;background:#f7efe0;border-radius:12px 0 0 12px">
                <div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#7a5c28">Persona</div>
                <div style="margin-top:4px;font-size:16px;font-weight:800;color:#3b2a14">${escapeHtml(nombre)}</div>
                ${origen ? `<div style="display:inline-block;margin-top:6px;background:#7a5c28;color:#fffdf7;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px">${escapeHtml(origen)}</div>` : ''}
              </td>
              <td style="padding:10px 12px;vertical-align:top;border-left:1px solid #e0d0b0">
                <div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#2f6f9f">Pedido</div>
                <div style="display:inline-block;margin-top:4px;background:#eef4fa;color:#2f6f9f;font-size:12px;font-weight:800;padding:3px 9px;border-radius:999px">${escapeHtml(numero)}</div>
                <div style="margin-top:6px;font-size:14px;color:#3b2a14">${escapeHtml(itemsTxt(p) || '—')}</div>
                <div style="margin-top:4px;font-size:15px;font-weight:800;color:${estColor}">${money(p.montoNeto)} · ${estTxt}</div>
              </td>
            </tr>
          </table>`;
        })
        .join('')}</div>`
    : '<p style="margin:0;font-size:13px;color:#7a5c28">Ningún pedido listo ni en impresión ahora.</p>';

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

  const filasOpCaja = listaReinversion.length
    ? listaReinversion
        .map(
          (o) => `<tr>
            <td>${escapeHtml(o.fecha || '')}</td>
            <td>${escapeHtml(o.descripcion || o.categoria || '—')}</td>
            <td style="text-align:right">${money(o.montoNeto)}</td>
          </tr>`
        )
        .join('')
    : '<tr><td colspan="3">Sin operación pagada con caja de ventas</td></tr>';

  const filasVentas = ventasList.length
    ? ventasList
        .map((v) => {
          const det = limpiaDescVenta(v);
          return `<tr>
            <td>${escapeHtml(v.fecha || '')}</td>
            <td>${escapeHtml(v.cliente || '—')}${det ? `<br><span style="color:#7a5c28;font-size:12px">${escapeHtml(det)}</span>` : ''}</td>
            <td style="text-align:right">${money(v.montoNeto)}</td>
          </tr>`;
        })
        .join('')
    : '<tr><td colspan="3">Sin ventas contabilizadas aún</td></tr>';

  const subject = `Impresoreando · resumen ${fechaIso} · caja ${money(cajaMostrar)} · listos ${money(montoListos)}`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(subject)}</title>
  <style>
    html, body { margin: 0; padding: 0; background: #f4efe4; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { margin: 6mm; }
    .sheet { max-width: 720px; margin: 0 auto; padding: 16px 18px 4px; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4efe4;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#3b2a14">
  <div class="sheet">
    <div style="background:#fffdf7;border:1px solid #e0d0b0;border-radius:14px;padding:20px 22px">
      <p style="margin:0 0 4px;font-size:13px;color:#7a5c28;text-transform:capitalize">Status diario · ${escapeHtml(fechaTitulo)}</p>
      <h1 style="margin:0 0 12px;font-size:22px;color:#7a5c28">Impresoreando · @impresoreando</h1>
      <p style="margin:0 0 14px;font-size:14px;line-height:1.45;color:#5a4220">
        Resumen para Josefa y Nicolás. Fuente: <code>${escapeHtml(path.basename(sourceFile))}</code>
        · actualizado ${escapeHtml(String(actualizado))}
      </p>

      <div style="background:#fff8ec;border:1px solid #e0d0b0;border-radius:12px;padding:16px 18px;margin-bottom:18px">
        <div style="font-size:13px;color:#7a5c28;font-weight:700;margin-bottom:6px">Pedidos</div>
        <p style="margin:0 0 10px;font-size:13px;color:#7a5c28">Listo y en impresión. Si se cobran los listos, suman ${money(montoListos)} a ventas.</p>
        ${cardsListosHtml}
      </div>

      <div style="background:#eef4fa;border:1px solid #b7c9dc;border-radius:12px;padding:16px 18px;margin-bottom:18px">
        <div style="font-size:13px;color:#2f6f9f;font-weight:700;margin-bottom:8px">Recomendaciones de esta semana</div>
        <ol style="margin:0;padding-left:1.2rem;font-size:14px;line-height:1.5;color:#3b2a14">
          <li style="margin:0 0 8px"><strong>Subir contenido a Instagram</strong> (@impresoreando): 2–3 piezas esta semana (lun · mié · vie) o stories diarias. Mostrar lo que ya se vende o se está imprimiendo (lámpara honguito, posalibro Harry Potter, porta fotos burbuja) + 1 idea nueva. Foto/mockup producto, no ads Meta aún.</li>
          <li style="margin:0 0 8px"><strong>Entregar y cobrar lo listo</strong> (detalle arriba en Pedidos): lámpara Gianni $16.000 y posalibro Rebe $9.000. Si se cobran, suman ${money(montoListos)} a ventas. El porta fotos de Gianni sigue en impresión.</li>
          <li><strong>Evento 3D Omnium · sábado 29 de agosto</strong> (faltan ${diasAOmnium} días; entrada ya comprada $16.100). Esta semana: decidir qué muestras llevar, imprimir un kit chico (bestsellers + 1–2 ideas nuevas) y armar lista de precios / catálogo.</li>
        </ol>
      </div>

      <div style="background:#fffdf7;border:1px solid #e0d0b0;border-radius:12px;padding:14px 16px;margin-bottom:18px">
        <div style="font-size:13px;color:#7a5c28;font-weight:700;margin-bottom:8px">Ideas para imprimir</div>
        ${ideasListaHtml}
      </div>

      <div style="background:${sinDeuda ? '#eef7f2' : '#fff4e8'};border:1px solid ${sinDeuda ? '#9fcbb5' : '#e0b48a'};border-radius:12px;padding:16px 18px;margin-bottom:20px">
        <div style="font-size:13px;color:#7a5c28;font-weight:700;margin-bottom:4px">
          ${sinDeuda ? 'Sin números rojos' : 'Para salir de números rojos falta recuperar'}
        </div>
        <div style="font-size:28px;font-weight:800;color:${sinDeuda ? '#3d8b6e' : '#8b1a1a'}">${money(saldoPendiente)}</div>
        <p style="margin:8px 0 0;font-size:14px;line-height:1.45">
          Recuperaron <strong>${money(ventas)}</strong> de <strong>${money(metaRecuperar)}</strong>
          · progreso <strong>${pctRecuperado.toFixed(1)}%</strong>
          · aún falta <strong>${pctFalta.toFixed(1)}%</strong> de la meta.
        </p>
        <div style="margin-top:12px;height:10px;background:#f0e6d4;border-radius:999px;overflow:hidden">
          <div style="height:100%;width:${pctRecuperado.toFixed(1)}%;background:#3d8b6e"></div>
        </div>
        <p style="margin:16px 0 0;font-size:13px;color:#7a5c28;font-weight:700">Ventas + pedidos en curso</p>
        <div style="margin-top:6px;height:12px;background:#f0e6d4;border-radius:999px;overflow:hidden;font-size:0;line-height:0">
          <div style="display:inline-block;height:12px;width:${pctVentasBar.toFixed(2)}%;background:#3d8b6e"></div>
          <div style="display:inline-block;height:12px;width:${pctPedidosBar.toFixed(2)}%;background:#2f6f9f"></div>
        </div>
        <p style="margin:8px 0 0;font-size:13px;line-height:1.45">
          <span style="display:inline-block;width:8px;height:8px;border-radius:99px;background:#3d8b6e;margin-right:4px;vertical-align:middle"></span>
          Ventas <strong>${money(ventas)}</strong>
          · <span style="display:inline-block;width:8px;height:8px;border-radius:99px;background:#2f6f9f;margin-right:4px;vertical-align:middle"></span>
          Pedidos <strong>${money(montoPedidos)}</strong> (${pedidosActivos.length})
          · total <strong>${money(ventasMasPedidos)}</strong>
          · progreso proyectado <strong>${pctPipeline.toFixed(1)}%</strong>
        </p>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:18px">
        <tr><td style="padding:8px 0;color:#7a5c28">Gastos capital (socios)</td><td style="padding:8px 0;text-align:right;font-weight:700">${money(gastos)}</td></tr>
        <tr><td style="padding:8px 0;color:#7a5c28">Operación capital</td><td style="padding:8px 0;text-align:right;font-weight:700">${money(operacion)}</td></tr>
        <tr><td style="padding:8px 0;color:#7a5c28">Ventas contabilizadas</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#3d8b6e">${money(ventas)}</td></tr>
        <tr><td style="padding:8px 0;color:#7a5c28">Operación (caja ventas)</td><td style="padding:8px 0;text-align:right;font-weight:700">${money(reinversionVentas)}</td></tr>
        <tr><td style="padding:8px 0;color:#7a5c28">Caja (declarada / teórica)</td><td style="padding:8px 0;text-align:right;font-weight:700">${money(cajaMostrar)} / ${money(cajaTeorico)}</td></tr>
        <tr><td style="padding:8px 0;color:#7a5c28">En impresión (en curso)</td><td style="padding:8px 0;text-align:right;font-weight:700">${pedidosEnImpresion.length}${detalleEnImpresion ? ` · ${escapeHtml(detalleEnImpresion)}` : ''} · ${money(montoEnImpresion)}</td></tr>
        <tr><td style="padding:8px 0;color:#7a5c28">Listos para entregar</td><td style="padding:8px 0;text-align:right;font-weight:700">${pedidosListos.length} · ${money(montoListos)}</td></tr>
        <tr><td style="padding:8px 0;color:#7a5c28">Meta ${metaPctObjetivo}% al ${fmtFechaCorta(fechaMeta30)}</td><td style="padding:8px 0;text-align:right;font-weight:700">${money(meta30Clp)} · faltan ${money(faltante30)}</td></tr>
        <tr><td style="padding:8px 0;color:#7a5c28">Deuda Josefa → Nicolás (50% capital)</td><td style="padding:8px 0;text-align:right;font-weight:700">${money(deudaJosefa)}</td></tr>
      </table>

      <h2 style="margin:0 0 8px;font-size:16px;color:#7a5c28">Operación (caja de ventas)</h2>
      <p style="margin:0 0 10px;font-size:13px;color:#7a5c28">Reinversión de ventas: baja caja, no es capital de socios ni deuda entre Josefa y Nico.</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:22px">
        <thead>
          <tr style="background:#f7efe0;text-align:left">
            <th style="padding:8px;border-bottom:1px solid #e0d0b0">Fecha</th>
            <th style="padding:8px;border-bottom:1px solid #e0d0b0">Detalle</th>
            <th style="padding:8px;border-bottom:1px solid #e0d0b0;text-align:right">Monto</th>
          </tr>
        </thead>
        <tbody>${filasOpCaja}</tbody>
      </table>

      <h2 style="margin:0 0 8px;font-size:16px;color:#7a5c28">Ventas</h2>
      <p style="margin:0 0 10px;font-size:13px;color:#7a5c28">${ventasList.length} ventas · ${money(ventas)} cobrados.</p>
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
  const fechaIsoPdf = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
  const pdfPath = path.join(ROOT, 'data', `impresoreando-resumen-${fechaIsoPdf}.pdf`);
  try {
    await htmlFileToPdf(PREVIEW, pdfPath);
    console.log(`PDF: ${pdfPath}`);
  } catch (e) {
    console.error(`No se pudo generar PDF: ${e.message || e}`);
  }

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
  const attachments =
    fs.existsSync(pdfPath) && fs.statSync(pdfPath).size > 100
      ? [
          {
            filename: path.basename(pdfPath),
            content: fs.readFileSync(pdfPath),
            contentType: 'application/pdf',
          },
        ]
      : [];
  await sendMailSsl({
    host,
    port,
    user,
    pass: pass.replace(/\s+/g, ''),
    from,
    to,
    subject: digest.subject,
    html: digest.html,
    attachments,
  });
  console.log(attachments.length ? 'Correo enviado ✓ (con PDF)' : 'Correo enviado ✓ (sin PDF)');
}

main().catch((err) => {
  console.error(String(err && err.stack ? err.stack : err));
  process.exitCode = 1;
});
