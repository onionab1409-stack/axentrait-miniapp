import { expect, test } from '@playwright/test';

const QUESTIONS = [
  'Ваша роль в компании?',
  'Ваша отрасль?',
  'Размер компании?',
  'Где боль сильнее всего?',
  'Главная цель на 3–6 мес.?',
];

test('onboarding runs 5 steps one-by-one and reaches result', async ({ page }) => {
  await page.goto('https://app.axentrait.com/#/welcome', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Подобрать решение' }).click();

  for (let i = 0; i < QUESTIONS.length; i += 1) {
    await expect(page.getByText(QUESTIONS[i], { exact: true })).toBeVisible();
    await expect(page.getByText(`${i + 1}/5`, { exact: true })).toBeVisible();

    const expectedLabel = i === 4 ? 'Получить план' : 'Далее';
    const mainButton = page.getByRole('button', { name: expectedLabel, exact: true });
    await expect(mainButton).toBeVisible();

    await page.locator('button.ax-chip').first().click();
    await mainButton.click();
  }

  await expect(page).toHaveURL(/#\/onboarding\/result/);
  await expect(page.getByText('Рекомендации под вашу задачу')).toBeVisible();
});
