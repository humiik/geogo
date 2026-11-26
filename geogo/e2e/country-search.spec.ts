import { expect, test } from '@playwright/test';

test('filtra el catálogo por nombre y lo restaura al borrar la búsqueda', async ({ page }) => {
  await page.route('https://restcountries.conventus.de/v3.1/all?**', (route) =>
    route.fulfill({
      json: [
        {
          cca3: 'MEX',
          name: { common: 'México', official: 'Estados Unidos Mexicanos' },
          translations: { spa: { common: 'México', official: 'Estados Unidos Mexicanos' } },
          flags: { png: '', svg: '' },
          region: 'Americas',
          population: 129000000,
          area: 1964375,
        },
        {
          cca3: 'PER',
          name: { common: 'Perú', official: 'República del Perú' },
          translations: { spa: { common: 'Perú', official: 'República del Perú' } },
          flags: { png: '', svg: '' },
          region: 'Americas',
          population: 34000000,
          area: 1285216,
        },
      ],
    }),
  );

  await page.goto('/');
  const search = page.getByRole('textbox', { name: 'Buscar por nombre' });
  const cards = page.getByRole('listitem');
  await expect(cards).toHaveCount(2);

  await search.fill('  MEXI ');
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText('México');

  await search.fill('zzz');
  await expect(page.getByRole('status')).toContainText('No encontramos países');

  await search.fill('');
  await expect(cards).toHaveCount(2);
});
