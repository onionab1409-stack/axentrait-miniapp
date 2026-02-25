import { getTg } from './tg';

export async function tgCloudGet(key: string): Promise<string | null> {
  const tg = getTg();
  if (!tg?.CloudStorage) return null;
  return await new Promise((resolve) => {
    tg.CloudStorage!.getItem(key, (err: unknown, value?: string) => {
      if (err) return resolve(null);
      resolve(value ?? '');
    });
  });
}

export async function tgCloudSet(key: string, value: string): Promise<boolean> {
  const tg = getTg();
  if (!tg?.CloudStorage) return false;
  return await new Promise((resolve) => {
    tg.CloudStorage!.setItem(key, value, (err: unknown, ok?: boolean) => {
      if (err) return resolve(false);
      resolve(Boolean(ok));
    });
  });
}
