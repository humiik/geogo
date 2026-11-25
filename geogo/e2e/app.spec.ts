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
          cca3: 'MEX',
          translations: { spa: { common: 'México', official: 'Estados Unidos Mexicanos' } },
          flags: { png: 'mex.png', svg: 'mex.svg' },
          capital: ['Mexico City'],
          region: 'Americas',
          population: 129000000,
          area: 1964375,
        },
      ],
    });
  });

  await page.goto('/');
  await expect(page).toHaveURL(/\/tabs\/tab1$/);
  await expect(page.getByRole('alert')).toContainText('No se pudieron cargar los países');
  await page.getByRole('button', { name: 'Reintentar' }).click();
  const card = page.getByRole('listitem').filter({ hasText: 'México' });
  await expect(card.getByRole('heading', { name: 'México' })).toBeVisible();
  await expect(card.getByRole('img', { name: 'Bandera de México' })).toBeVisible();
  await expect(card).toContainText('Ciudad de México');
  await expect(card).toContainText('América');

  const tabs = page.locator('ion-tab-button');
  await expect(tabs).toHaveCount(3);
  await tabs.filter({ hasText: 'Comparar' }).click();
  await expect(page).toHaveURL(/\/tabs\/tab2$/);
  await expect(page.getByRole('heading', { name: 'Comparar países' })).toBeVisible();
  await tabs.filter({ hasText: 'Desafíos' }).click();
  await expect(page).toHaveURL(/\/tabs\/tab3$/);
  await expect(page.getByRole('heading', { name: 'Desafíos de geografía' })).toBeVisible();
  await tabs.filter({ hasText: 'Explorar' }).click();
  await expect(card).toBeVisible();
  expect(attempts).toBe(2);
});

test('recupera una dirección desconocida y abre Explorar', async ({ page }) => {
  await page.route('https://restcountries.conventus.de/v3.1/all?**', (route) => route.fulfill({ json: [] }));
  await page.goto('/tabs/desconocida');
  await expect(page).toHaveURL(/\/tabs\/tab1$/);
  await expect(page.getByRole('heading', { name: 'Países del mundo' })).toBeVisible();
});
