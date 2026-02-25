import { expect, test } from '@playwright/test';

test('onboarding content is available', async ({ request }) => {
  const response = await request.get('https://api.axentrait.com/api/v1/content/onboarding');
  expect(response.status()).toBe(200);

  const payload = (await response.json()) as { ok?: boolean; data?: unknown };
  expect(payload.ok).toBeTruthy();
  expect(payload.data).toBeTruthy();
});
