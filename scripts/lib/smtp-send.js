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
function sendMailSsl({ host, port = 465, user, pass, from, to, subject, html }) {
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
        const payload = [
          `From: ${from}`,
          `To: ${recipients.join(', ')}`,
          `Subject: =?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`,
          'MIME-Version: 1.0',
          'Content-Type: text/html; charset=UTF-8',
          'Content-Transfer-Encoding: base64',
          '',
          Buffer.from(html, 'utf8')
            .toString('base64')
            .replace(/(.{76})/g, '$1\r\n'),
          '.',
        ].join('\r\n');
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
