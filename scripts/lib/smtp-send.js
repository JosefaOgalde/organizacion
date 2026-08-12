'use strict';

const tls = require('tls');

function extractEmail(from) {
  const m = String(from).match(/<([^>]+)>/);
  return m ? m[1] : String(from).trim();
}

/**
 * Envío SMTP implícito SSL (puerto 465), AUTH LOGIN.
 * Suficiente para Gmail con contraseña de aplicación.
 */
function encodeSubject(subject) {
  return `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`;
}

function wrap76(b64) {
  return String(b64 || '').replace(/(.{76})/g, '$1\r\n');
}

function buildMime({ from, to, subject, html, attachments }) {
  const recipients = Array.isArray(to) ? to : [to];
  const files = Array.isArray(attachments) ? attachments.filter(Boolean) : [];
  if (!files.length) {
    return [
      `From: ${from}`,
      `To: ${recipients.join(', ')}`,
      `Subject: ${encodeSubject(subject)}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      wrap76(Buffer.from(html, 'utf8').toString('base64')),
      '.',
    ].join('\r\n');
  }
  const boundary = `imp-${Date.now().toString(36)}`;
  const parts = [
    `From: ${from}`,
    `To: ${recipients.join(', ')}`,
    `Subject: ${encodeSubject(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap76(Buffer.from(html, 'utf8').toString('base64')),
  ];
  for (const att of files) {
    const filename = String(att.filename || 'adjunto').replace(/["\r\n]/g, '');
    const ctype = att.contentType || 'application/octet-stream';
    const buf = Buffer.isBuffer(att.content)
      ? att.content
      : Buffer.from(att.content || '', att.encoding || 'utf8');
    parts.push(
      `--${boundary}`,
      `Content-Type: ${ctype}; name="${filename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${filename}"`,
      '',
      wrap76(buf.toString('base64'))
    );
  }
  parts.push(`--${boundary}--`, '.');
  return parts.join('\r\n');
}

function sendMailSsl({ host, port = 465, user, pass, from, to, subject, html, attachments }) {
  const recipients = (Array.isArray(to) ? to : [to]).map(String);
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host, port: Number(port), servername: host });
    let buf = '';
    let settled = false;
    const fail = (err) => {
      if (settled) return;
      settled = true;
      try {
        socket.destroy();
      } catch (_) {
        /* ignore */
      }
      reject(err instanceof Error ? err : new Error(String(err)));
    };
    const ok = () => {
      if (settled) return;
      settled = true;
      try {
        socket.end();
      } catch (_) {
        /* ignore */
      }
      resolve();
    };

    const readResponse = () =>
      new Promise((res, rej) => {
        const pump = () => {
          for (;;) {
            const nl = buf.indexOf('\n');
            if (nl < 0) return;
            const line = buf.slice(0, nl).replace(/\r$/, '');
            buf = buf.slice(nl + 1);
            if (/^\d{3}-/.test(line)) continue;
            const code = Number(line.slice(0, 3));
            if (!Number.isFinite(code)) {
              rej(new Error(`SMTP inválido: ${line}`));
              return;
            }
            if (code >= 400) {
              rej(new Error(`SMTP ${line}`));
              return;
            }
            socket.off('data', onData);
            res({ code, line });
            return;
          }
        };
        const onData = (chunk) => {
          buf += chunk;
          try {
            pump();
          } catch (e) {
            socket.off('data', onData);
            rej(e);
          }
        };
        socket.on('data', onData);
        try {
          pump();
        } catch (e) {
          socket.off('data', onData);
          rej(e);
        }
      });

    const write = (s) =>
      new Promise((res, rej) => {
        socket.write(s + '\r\n', (err) => (err ? rej(err) : res()));
      });

    socket.setEncoding('utf8');
    socket.on('error', fail);
    socket.on('secureConnect', async () => {
      try {
        await readResponse(); // 220
        await write('EHLO impresoreando.local');
        await readResponse(); // 250
        await write('AUTH LOGIN');
        await readResponse(); // 334
        await write(Buffer.from(user, 'utf8').toString('base64'));
        await readResponse(); // 334
        await write(Buffer.from(pass, 'utf8').toString('base64'));
        await readResponse(); // 235
        await write(`MAIL FROM:<${extractEmail(from)}>`);
        await readResponse();
        for (const r of recipients) {
          await write(`RCPT TO:<${extractEmail(r)}>`);
          await readResponse();
        }
        await write('DATA');
        await readResponse(); // 354
        const payload = buildMime({ from, to: recipients, subject, html, attachments });
        await write(payload);
        await readResponse(); // 250
        await write('QUIT');
        try {
          await readResponse();
        } catch (_) {
          /* ignore */
        }
        ok();
      } catch (err) {
        fail(err);
      }
    });
  });
}

module.exports = { sendMailSsl, extractEmail };
