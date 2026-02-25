import { createHmac, timingSafeEqual } from 'node:crypto';

export interface TelegramInitDataUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

type ValidateResult = {
  isValid: boolean;
  user?: TelegramInitDataUser;
};

const DEFAULT_MAX_AGE_SEC = 24 * 60 * 60;

const makeSecret = (botToken: string): Buffer =>
  createHmac('sha256', 'WebAppData').update(botToken).digest();

export function validateTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSec = DEFAULT_MAX_AGE_SEC,
): ValidateResult {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash') ?? '';

  if (!hash) {
    return { isValid: false };
  }

  const authDateRaw = params.get('auth_date');
  const authDate = Number(authDateRaw ?? '0');
  if (!Number.isFinite(authDate) || authDate <= 0) {
    return { isValid: false };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - authDate) > maxAgeSec) {
    return { isValid: false };
  }

  const dataCheckString = [...params.entries()]
    .filter(([key]) => key !== 'hash')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const expectedHash = createHmac('sha256', makeSecret(botToken)).update(dataCheckString).digest('hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');
  const actualBuffer = Buffer.from(hash, 'hex');

  if (expectedBuffer.length !== actualBuffer.length) {
    return { isValid: false };
  }

  if (!timingSafeEqual(expectedBuffer, actualBuffer)) {
    return { isValid: false };
  }

  const userRaw = params.get('user');
  if (!userRaw) {
    return { isValid: false };
  }

  try {
    const user = JSON.parse(userRaw) as TelegramInitDataUser;
    return { isValid: true, user };
  } catch {
    return { isValid: false };
  }
}

export const verifyTelegramInitData = validateTelegramInitData;
