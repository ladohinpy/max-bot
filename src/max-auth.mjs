import { createHmac, timingSafeEqual } from 'node:crypto';

export class MaxAuthError extends Error {
  constructor(code) {
    super(code);
    this.name = 'MaxAuthError';
    this.code = code;
  }
}

/** Validate MAX's raw initData on the server. Never trust initDataUnsafe. */
export function validateMaxInitData(initData, botToken, {
  nowSeconds = Math.floor(Date.now() / 1000),
  maxAgeSeconds = 3600,
  futureToleranceSeconds = 30,
} = {}) {
  if (typeof botToken !== 'string' || !botToken.trim()) throw new MaxAuthError('missing_bot_token');
  if (typeof initData !== 'string' || !initData || initData.length > 32768) {
    throw new MaxAuthError('invalid_input');
  }
  const fields = new URLSearchParams(initData);
  const seen = new Set();
  for (const [key] of fields) {
    if (seen.has(key)) throw new MaxAuthError('duplicate_field');
    seen.add(key);
  }
  const hash = fields.get('hash');
  if (!hash || !/^[a-f0-9]{64}$/i.test(hash)) throw new MaxAuthError('invalid_hash');
  const checkString = [...fields]
    .filter(([key]) => key !== 'hash')
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expected = createHmac('sha256', secret).update(checkString).digest();
  if (!timingSafeEqual(expected, Buffer.from(hash, 'hex'))) throw new MaxAuthError('signature_mismatch');

  const authDateRaw = fields.get('auth_date');
  if (!authDateRaw || !/^\d+$/.test(authDateRaw)) throw new MaxAuthError('invalid_auth_date');
  const authDate = Number(authDateRaw);
  if (!Number.isSafeInteger(authDate) || nowSeconds - authDate >= maxAgeSeconds) {
    throw new MaxAuthError('expired');
  }
  if (authDate > nowSeconds + futureToleranceSeconds) throw new MaxAuthError('future_auth_date');
  let user;
  try { user = JSON.parse(fields.get('user') ?? 'null'); } catch { throw new MaxAuthError('invalid_user'); }
  if (!user || Array.isArray(user) || !Number.isSafeInteger(user.id) || user.id <= 0) {
    throw new MaxAuthError('invalid_user');
  }
  return {
    identity: {
      maxUserId: String(user.id),
      firstName: typeof user.first_name === 'string' ? user.first_name.slice(0, 100) : '',
    },
    expiresAt: Math.min(authDate + maxAgeSeconds, nowSeconds + maxAgeSeconds),
  };
}
