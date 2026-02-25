import { tgInitData } from '../telegram/tg';
import { apiFetch, setAccessToken } from './apiClient';

let pending: Promise<boolean> | null = null;

export async function initAuth(): Promise<boolean> {
  if (pending) return pending;

  pending = (async () => {
    const initData = tgInitData();
    if (!initData) return false;

    try {
      const data = await apiFetch<{ accessToken: string; user: Record<string, unknown> }>('/auth/telegram', {
        method: 'POST',
        body: JSON.stringify({ initData }),
      });

      if (!data.accessToken) return false;
      setAccessToken(data.accessToken);
      return true;
    } catch {
      return false;
    }
  })();

  try {
    return await pending;
  } finally {
    pending = null;
  }
}
