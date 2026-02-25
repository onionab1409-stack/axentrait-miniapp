import { expect, test } from '@playwright/test';

test('services catalog contains 7 services', async ({ request }) => {
  const response = await request.get('https://api.axentrait.com/api/v1/content/services');
  expect(response.status()).toBe(200);

  const payload = (await response.json()) as { data?: unknown[] };
  expect(Array.isArray(payload.data)).toBeTruthy();
  expect(payload.data?.length).toBe(7);
});
