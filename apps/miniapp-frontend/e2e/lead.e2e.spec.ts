import { expect, test } from '@playwright/test';

test('lead submission validates payload', async ({ request }) => {
  const response = await request.post('https://api.axentrait.com/api/v1/leads', {
    data: {},
  });
  expect([400, 401, 422]).toContain(response.status());
});
