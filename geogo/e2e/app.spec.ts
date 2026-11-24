import { expect, test } from '@playwright/test';

test('loads Explorar, retries a failed request and opens the other tabs', async ({ page }) => {
  let attempts = 0;
  await page.route('https://restcountries.conventus.de/v3.1/all?**', async (route) => {
    attempts++;
    if (attempts === 1) {
      await route.fulfill({ status: 503, json: { message: 'Service unavailable' } });
      return;
    }

    await route.fulfill({
      json: [
        {
          cca3: 'ARG',
          name: { common: 'Argentina', official: 'Argentine Republic' },
          flags: { png: 'arg.png', svg: 'arg.svg' },
          capital: ['Buenos Aires'],
          region: 'Americas',
          population: 47000000,
          area: 2780400,
        },
      ],
    });
  });

  await page.goto('/');
  await expect(page).toHaveURL(/\/tabs\/tab1$/);
  await expect(page.getByRole('alert')).toContainText('No se pudieron cargar los países');
  await page.getByRole('button', { name: 'Reintentar' }).click();
  const card = page.getByRole('listitem').filter({ hasText: 'Argentina' });
  await expect(card.getByRole('heading', { name: 'Argentina' })).toBeVisible();
  await expect(card.getByRole('img', { name: 'Bandera de Argentina' })).toBeVisible();
  await expect(card).toContainText('Buenos Aires');
  await expect(card).toContainText('Americas');

  const tabs = page.locator('ion-tab-button');
  await expect(tabs).toHaveCount(3);
  await tabs.filter({ hasText: 'Comparar' }).click();
  await expect(page).toHaveURL(/\/tabs\/tab2$/);
  await tabs.filter({ hasText: 'Desafíos' }).click();
  await expect(page).toHaveURL(/\/tabs\/tab3$/);
  await tabs.filter({ hasText: 'Explorar' }).click();
  await expect(card).toBeVisible();
  expect(attempts).toBe(2);
});
