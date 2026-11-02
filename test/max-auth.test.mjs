import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { validateMaxInitData } from '../src/max-auth.mjs';
import { createAppServer } from '../server.mjs';

const botToken = 'synthetic-test-bot-token';
const now = 1800000000;
function sign(fields, token = botToken) {
  const data = Object.entries(fields).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, value]) => `${key}=${value}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(token).digest();
  const hash = createHmac('sha256', secret).update(data).digest('hex');
  return new URLSearchParams({ ...fields, hash }).toString();
}
function launch(extra = {}, time = now) {
  return sign({ auth_date: String(time), query_id: 'synthetic-query', user: JSON.stringify({ id: 12345, first_name: 'Тест & + = Юникод' }), ...extra });
}
const opts = { nowSeconds: now };

test('accepts signed raw data, preserves escaped Unicode and exposes only minimal identity', () => {
  const result = validateMaxInitData(launch(), botToken, opts);
  assert.deepEqual(result, { identity: { maxUserId: '12345', firstName: 'Тест & + = Юникод' }, expiresAt: now + 3600 });
  assert.equal(JSON.stringify(result).includes('hash'), false);
});
test('rejects tampering and a different bot token', () => {
  const data = new URLSearchParams(launch());
  data.set('user', JSON.stringify({ id: 999, first_name: 'Injected' }));
  assert.throws(() => validateMaxInitData(data.toString(), botToken, opts), /signature_mismatch/);
  assert.throws(() => validateMaxInitData(launch(), 'other-token', opts), /signature_mismatch/);
});
test('checks freshness against original auth_date and rejects future launches', () => {
  assert.throws(() => validateMaxInitData(launch({}, now - 3601), botToken, opts), /expired/);
  assert.throws(() => validateMaxInitData(launch({}, now - 3600), botToken, opts), /expired/);
  assert.throws(() => validateMaxInitData(launch({}, now + 31), botToken, opts), /future_auth_date/);
  assert.equal(validateMaxInitData(launch({}, now + 30), botToken, opts).expiresAt, now + 3600);
});
test('rejects duplicate fields, missing or malformed signatures', () => {
  assert.throws(() => validateMaxInitData(launch() + '&user=%7B%7D', botToken, opts), /duplicate_field/);
  assert.throws(() => validateMaxInitData('auth_date=1800000000&hash=not-a-hash', botToken, opts), /invalid_hash/);
  assert.throws(() => validateMaxInitData('', botToken, opts), /invalid_input/);
});
test('rejects invalid signed user JSON and invalid dates', () => {
  assert.throws(() => validateMaxInitData(launch({ user: '{' }), botToken, opts), /invalid_user/);
  assert.throws(() => validateMaxInitData(launch({ user: '{"id":-1}' }), botToken, opts), /invalid_user/);
  assert.throws(() => validateMaxInitData(launch({ auth_date: 'NaN' }), botToken, opts), /invalid_auth_date/);
});

async function withServer(options, run) {
  const server = createAppServer(options);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve => server.close(resolve)); }
}
test('demo server reports no real Foxford connection and no configured MAX auth', async () => {
  await withServer({ botToken: '' }, async base => {
    const health = await (await fetch(base + '/api/health')).json();
    assert.deepEqual(health, { ok: true, mode: 'demo', maxConfigured: false, foxfordConnected: false });
    const response = await fetch(base + '/api/max/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error, 'max_not_configured');
  });
});
test('session cookie verifies MAX identity but never links a Foxford profile', async () => {
  await withServer({ botToken }, async base => {
    const response = await fetch(base + '/api/max/session', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: launch({}, Math.floor(Date.now() / 1000)), foxfordLinked: true }),
    });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.identityVerified, true);
    assert.equal(result.foxfordLinked, false);
    assert.equal(result.identity.maxUserId, '12345');
    const setCookie = response.headers.get('set-cookie');
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /SameSite=Lax/);
    assert.equal(setCookie.includes(botToken), false);
    const cookie = setCookie.split(';')[0];
    const current = await (await fetch(base + '/api/max/session', { headers: { Cookie: cookie } })).json();
    assert.equal(current.authenticated, true);
    await fetch(base + '/api/max/session', { method: 'DELETE', headers: { Cookie: cookie } });
    assert.equal((await (await fetch(base + '/api/max/session', { headers: { Cookie: cookie } })).json()).authenticated, false);
  });
});
test('session API rejects foreign origins, invalid signatures and invalid JSON', async () => {
  await withServer({ botToken }, async base => {
    const foreign = await fetch(base + '/api/max/session', { method: 'DELETE', headers: { Origin: 'https://foreign.example' } });
    assert.equal(foreign.status, 403);
    const unsigned = await fetch(base + '/api/max/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"initData":"user=123"}' });
    assert.equal(unsigned.status, 401);
    const invalidJson = await fetch(base + '/api/max/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(invalidJson.status, 400);
    const unsupported = await fetch(base + '/api/max/session', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '{}' });
    assert.equal(unsupported.status, 415);
  });
});
test('unknown APIs and source files cannot fall through to the app shell', async () => {
  await withServer({ botToken: '' }, async base => {
    assert.equal((await fetch(base + '/api/unknown')).status, 404);
    assert.equal((await fetch(base + '/server.mjs')).status, 404);
    assert.equal((await fetch(base + '/%2e%2e%2fserver.mjs')).status, 403);
    assert.equal((await fetch(base + '/%2e%2e%5cserver.mjs')).status, 400);
  });
});
