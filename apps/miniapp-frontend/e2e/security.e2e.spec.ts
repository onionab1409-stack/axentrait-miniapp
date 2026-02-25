import { expect, test } from '@playwright/test';

test('webhook requires secret token', async ({ request }) => {
  const response = await request.post('https://api.axentrait.com/api/v1/telegram/webhook', {
    data: {},
  });
  expect(response.status()).toBe(401);
});
