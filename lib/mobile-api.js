import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import webpush from 'web-push';

const MAX_NOTICES = 500;
const SENSOR_COUNT = 8;
const pushHosts = ['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com'];
let schemaReady;

function db() {
  if (!process.env.DATABASE_URL) throw new Error('Banco de dados não configurado.');
  return neon(process.env.DATABASE_URL);
}

async function ensureSchema(sql) {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS sc_devices (
        token_hash TEXT PRIMARY KEY, name VARCHAR(60) NOT NULL, subscription JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS sc_notices (
        id UUID PRIMARY KEY, title VARCHAR(120) NOT NULL, body VARCHAR(500) NOT NULL,
        severity TEXT NOT NULL CHECK (severity IN ('info','alert')),
        at TIMESTAMPTZ NOT NULL, source VARCHAR(32) NOT NULL
      )`;
      await sql`CREATE TABLE IF NOT EXISTS sc_reads (
        token_hash TEXT NOT NULL, notice_id UUID NOT NULL REFERENCES sc_notices(id) ON DELETE CASCADE,
        PRIMARY KEY(token_hash, notice_id)
      )`;
      await sql`CREATE TABLE IF NOT EXISTS sc_settings (key TEXT PRIMARY KEY, value JSONB NOT NULL)`;
      await sql`CREATE TABLE IF NOT EXISTS sc_admin_sessions (
        token_hash TEXT PRIMARY KEY, expires_at TIMESTAMPTZ NOT NULL
      )`;
      await sql`CREATE TABLE IF NOT EXISTS sc_login_attempts (
        ip_hash TEXT PRIMARY KEY, attempts INTEGER NOT NULL, reset_at TIMESTAMPTZ NOT NULL
      )`;
      await sql`CREATE TABLE IF NOT EXISTS sc_sensor_state (sensor_index INTEGER PRIMARY KEY, is_open BOOLEAN NOT NULL)`;
    })().catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }
  await schemaReady;
}

const digest = (value) => createHash('sha256').update(value).digest('hex');
const bearer = (req) => String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
const json = (res, status, body) => res.status(status).setHeader('Cache-Control', 'no-store').json(body);
const defaultConfig = () => ({ armed: false, sensors: [] });

async function config(sql) {
  const rows = await sql`SELECT value FROM sc_settings WHERE key='monitoring'`;
  return rows[0]?.value || defaultConfig();
}

async function contacts(sql) {
  const rows = await sql`SELECT value FROM sc_settings WHERE key='contacts'`;
  return rows[0]?.value || { phone: '', email: '' };
}

async function isAdmin(sql, token) {
  if (!token) return false;
  const rows = await sql`SELECT 1 FROM sc_admin_sessions WHERE token_hash=${digest(token)} AND expires_at > NOW()`;
  return rows.length > 0;
}

async function isClient(sql, token) {
  if (!token) return false;
  const rows = await sql`SELECT 1 FROM sc_devices WHERE token_hash=${digest(token)}`;
  return rows.length > 0;
}

function pushStatus() {
  const ready = Boolean(process.env.STAYCONTROL_VAPID_PUBLIC_KEY && process.env.STAYCONTROL_VAPID_PRIVATE_KEY && process.env.STAYCONTROL_VAPID_SUBJECT);
  return { ready, publicKey: ready ? process.env.STAYCONTROL_VAPID_PUBLIC_KEY : '', error: '' };
}

function validSubscription(subscription) {
  const endpoint = subscription?.endpoint;
  let host = '';
  try { host = new URL(endpoint).hostname; } catch { return false; }
  const allowed = pushHosts.some((name) => host === name || host.endsWith(`.${name}`)) || host.endsWith('.notify.windows.com');
  const keys = subscription?.keys || {};
  return allowed && Object.keys(subscription).length <= 8 && typeof keys.p256dh === 'string' && keys.p256dh.length > 8 && keys.p256dh.length < 512 && typeof keys.auth === 'string' && keys.auth.length > 8 && keys.auth.length < 512;
}

async function sendPush(sql, notice) {
  const status = pushStatus();
  if (!status.ready) return;
  try {
    webpush.setVapidDetails(process.env.STAYCONTROL_VAPID_SUBJECT, status.publicKey, process.env.STAYCONTROL_VAPID_PRIVATE_KEY);
  } catch {
    return;
  }
  const devices = await sql`SELECT token_hash, subscription FROM sc_devices WHERE subscription IS NOT NULL`;
  await Promise.allSettled(devices.map(async (device) => {
    try {
      if (!validSubscription(device.subscription)) throw new Error('Assinatura push inválida.');
      await webpush.sendNotification(device.subscription, JSON.stringify(notice), { TTL: 300 });
    } catch (error) {
      if ([404, 410].includes(error.statusCode)) {
        await sql`UPDATE sc_devices SET subscription=NULL WHERE token_hash=${device.token_hash}`;
      }
    }
  }));
}

async function sendAlertEmail(sql, notice) {
  const to = (await contacts(sql)).email;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.STAYCONTROL_ALERT_FROM_EMAIL;
  if (notice.severity !== 'alert' || !to || !apiKey || !from) return;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject: `STAYCONTROL · ${notice.title}`, text: `${notice.body}\n\nHorário: ${new Date(notice.at).toLocaleString('pt-BR')}` }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) console.error('STAYCONTROL email: provider rejected alert', response.status);
  } catch {
    console.error('STAYCONTROL email: delivery failed');
  }
}

async function record(sql, title, body, severity = 'info', source = 'central') {
  const notice = { id: randomUUID(), title: title.slice(0, 120), body: body.slice(0, 500), severity, at: new Date().toISOString(), source: source.slice(0, 32) };
  await sql`INSERT INTO sc_notices(id,title,body,severity,at,source) VALUES (${notice.id},${notice.title},${notice.body},${notice.severity},${notice.at},${notice.source})`;
  await sql`DELETE FROM sc_notices WHERE id IN (SELECT id FROM sc_notices ORDER BY at DESC OFFSET ${MAX_NOTICES})`;
  await sendPush(sql, notice);
  await sendAlertEmail(sql, notice);
  return notice;
}

async function pair(sql, name) {
  if (typeof name !== 'string' || !name.trim()) throw new Error('Informe o nome do celular.');
  const token = randomBytes(32).toString('base64url');
  await sql`INSERT INTO sc_devices(token_hash,name) VALUES (${digest(token)},${name.trim().slice(0, 60)})`;
  return token;
}

function validateConfig(payload) {
  if (typeof payload.armed !== 'boolean' || !Array.isArray(payload.sensors) || payload.sensors.length !== SENSOR_COUNT) throw new Error('Configuração de sensores inválida.');
  return {
    armed: payload.armed,
    sensors: payload.sensors.map((sensor) => {
      if (typeof sensor?.enabled !== 'boolean' || typeof sensor?.label !== 'string' || !sensor.label.trim()) throw new Error('Sensor inválido.');
      return { label: sensor.label.trim().slice(0, 50), enabled: sensor.enabled };
    }),
  };
}

async function sensor(sql, index, opened, source = 'hardware') {
  if (!Number.isInteger(index) || index < 1 || index > SENSOR_COUNT || typeof opened !== 'boolean') throw new Error('Entrada de sensor inválida.');
  const old = await sql`SELECT is_open FROM sc_sensor_state WHERE sensor_index=${index}`;
  await sql`INSERT INTO sc_sensor_state(sensor_index,is_open) VALUES (${index},${opened}) ON CONFLICT(sensor_index) DO UPDATE SET is_open=EXCLUDED.is_open`;
  if ((old.length && old[0].is_open === opened) || (!old.length && !opened)) return null;
  const current = await config(sql);
  const item = current.sensors[index - 1];
  if (!item?.enabled) return null;
  const alarm = opened && current.armed;
  return record(sql, alarm ? 'Abertura detectada' : `Sensor ${opened ? 'aberto' : 'fechado'}`, `${item.label} · ${opened ? 'aberto' : 'fechado'}${source === 'simulation' ? ' · demonstração' : ''}`, alarm ? 'alert' : 'info', source);
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a)); const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

async function handleGet(req, res, sql, route) {
  const token = bearer(req);
  if (route === 'health') {
    await sql`SELECT 1`;
    return json(res, 200, { ok: true, storage: 'connected' });
  }
  if (route === 'feed' && await isClient(sql, token)) {
    const items = await sql`
      SELECT n.id,n.title,n.body,n.severity,n.at,n.source,(r.notice_id IS NOT NULL) AS read
      FROM sc_notices n LEFT JOIN sc_reads r ON r.notice_id=n.id AND r.token_hash=${digest(token)}
      ORDER BY n.at DESC LIMIT ${MAX_NOTICES}`;
    const current = await config(sql);
    return json(res, 200, { items, push: pushStatus(), armed: current.armed });
  }
  if (route === 'admin/status' && await isAdmin(sql, token)) {
    const devices = await sql`SELECT token_hash AS id,name,(subscription IS NOT NULL) AS push FROM sc_devices ORDER BY created_at DESC`;
    return json(res, 200, { devices, push: pushStatus(), mail: { ready: Boolean(process.env.RESEND_API_KEY && process.env.STAYCONTROL_ALERT_FROM_EMAIL) }, contacts: await contacts(sql), config: await config(sql) });
  }
  return json(res, 403, { error: 'Acesso móvel não autorizado.' });
}

async function handlePost(req, res, sql, route) {
  const payload = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const token = bearer(req);
  if (route === 'login') {
    const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
    const ipHash = digest(ip);
    const attempts = await sql`
      INSERT INTO sc_login_attempts(ip_hash,attempts,reset_at) VALUES (${ipHash},1,NOW()+INTERVAL '1 minute')
      ON CONFLICT(ip_hash) DO UPDATE SET
        attempts=CASE WHEN sc_login_attempts.reset_at < NOW() THEN 1 ELSE sc_login_attempts.attempts+1 END,
        reset_at=CASE WHEN sc_login_attempts.reset_at < NOW() THEN NOW()+INTERVAL '1 minute' ELSE sc_login_attempts.reset_at END
      RETURNING attempts`;
    if (attempts[0].attempts > 5) return json(res, 429, { error: 'Aguarde um minuto antes de tentar novamente.' });
    const pin = process.env.STAYCONTROL_ADMIN_PIN || '1215';
    if (typeof payload.pin !== 'string' || !safeEqual(payload.pin, pin)) return json(res, 403, { error: 'PIN incorreto.' });
    const session = randomBytes(32).toString('base64url');
    await sql`INSERT INTO sc_admin_sessions(token_hash,expires_at) VALUES (${digest(session)},NOW()+INTERVAL '10 minutes')`;
    return json(res, 200, { ok: true, token: session });
  }
  if (route === 'read' || route === 'subscribe') {
    if (!await isClient(sql, token)) return json(res, 403, { ok: false, error: 'Celular não vinculado. Confira o código da central.' });
    if (route === 'read') {
      if (payload.id === 'all') await sql`INSERT INTO sc_reads(token_hash,notice_id) SELECT ${digest(token)},id FROM sc_notices ON CONFLICT DO NOTHING`;
      else {
        const exists = await sql`SELECT 1 FROM sc_notices WHERE id=${String(payload.id || '')}`;
        if (!exists.length) return json(res, 404, { error: 'Notificação não encontrada.' });
        await sql`INSERT INTO sc_reads(token_hash,notice_id) VALUES (${digest(token)},${payload.id}) ON CONFLICT DO NOTHING`;
      }
    } else {
      if (!validSubscription(payload.subscription)) return json(res, 400, { error: 'Assinatura inválida.' });
      await sql`UPDATE sc_devices SET subscription=${JSON.stringify(payload.subscription)}::jsonb WHERE token_hash=${digest(token)}`;
    }
    return json(res, 200, { ok: true });
  }
  if (route === 'pi/sensor') {
    if (!process.env.STAYCONTROL_PI_TOKEN) return json(res, 503, { error: 'Integração da central ainda não configurada.' });
    if (!safeEqual(token, process.env.STAYCONTROL_PI_TOKEN)) return json(res, 403, { error: 'Central não autorizada.' });
    const notice = await sensor(sql, Number(payload.index), payload.open, 'hardware');
    return json(res, 200, { ok: true, notice });
  }
  if (!await isAdmin(sql, token)) return json(res, 403, { ok: false, error: 'Entre como administrador para esta ação.' });
  if (route === 'pair') return json(res, 200, { ok: true, token: await pair(sql, payload.name) });
  if (route === 'contacts') {
    const phone = typeof payload.phone === 'string' ? payload.phone.trim().slice(0, 30) : '';
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase().slice(0, 254) : '';
    if (phone && !/^\+?[0-9 ()-]{8,30}$/.test(phone)) return json(res, 400, { error: 'Informe um telefone válido com DDD.' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { error: 'Informe um e-mail válido.' });
    await sql`INSERT INTO sc_settings(key,value) VALUES ('contacts',${JSON.stringify({ phone, email })}::jsonb) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value`;
    return json(res, 200, { ok: true });
  }
  if (route === 'revoke') {
    const id = String(payload.id || '');
    await sql`DELETE FROM sc_devices WHERE token_hash=${id}`;
    await sql`DELETE FROM sc_reads WHERE token_hash=${id}`;
  } else if (route === 'config') {
    const next = validateConfig(payload);
    if (next.armed) {
      const open = await sql`SELECT s.sensor_index FROM sc_sensor_state s JOIN sc_settings c ON c.key='monitoring' WHERE s.is_open=TRUE`;
      if (!next.sensors.some((item) => item.enabled) || open.some((item) => next.sensors[item.sensor_index - 1]?.enabled)) return json(res, 400, { error: 'Feche os sensores habilitados antes de ativar.' });
    }
    const previous = await config(sql);
    await sql`INSERT INTO sc_settings(key,value) VALUES ('monitoring',${JSON.stringify(next)}::jsonb) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value`;
    if (previous.armed !== next.armed) await record(sql, `Monitoramento ${next.armed ? 'ativado' : 'desativado'}`, 'Configuração atualizada pelo administrador.', 'info', 'central');
  } else if (route === 'sensor') {
    const notice = await sensor(sql, Number(payload.index), payload.open, 'simulation');
    return json(res, 200, { ok: true, notice });
  } else if (route === 'test') {
    await record(sql, 'Notificação de teste', 'A central está conectada ao aplicativo do celular.', 'info', 'test');
  } else return json(res, 404, { error: 'Recurso móvel não encontrado.' });
  return json(res, 200, { ok: true });
}

export async function handleMobile(req, res, routeOverride = '') {
  if (req.method !== 'GET' && req.method !== 'POST') return json(res, 405, { error: 'Método não permitido.' });
  if (req.method === 'POST' && !String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return json(res, 415, { error: 'Use JSON para enviar comandos.' });
  if (req.method === 'POST' && Buffer.byteLength(JSON.stringify(req.body || {})) > 32768) return json(res, 413, { error: 'Conteúdo muito grande.' });
  try {
    const sql = db();
    await ensureSchema(sql);
    const pathname = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`).pathname;
    const route = routeOverride || pathname.replace(/^\/api\/mobile\/?/, '').replace(/\/+$/, '');
    if (req.method === 'GET') return await handleGet(req, res, sql, route);
    return await handlePost(req, res, sql, route);
  } catch (error) {
    console.error('STAYCONTROL API: request failed', error?.name || 'Error');
    return json(res, 500, { error: 'Serviço móvel indisponível. Tente novamente.' });
  }
}

export default function handler(req, res) {
  return handleMobile(req, res);
}
