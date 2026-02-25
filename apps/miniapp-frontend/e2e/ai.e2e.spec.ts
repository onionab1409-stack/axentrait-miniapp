import { expect, test } from '@playwright/test';

test('ai sessions endpoint is protected', async ({ request }) => {
  const response = await request.get('https://api.axentrait.com/api/v1/ai/sessions');
  expect(response.status()).toBe(401);
});
