import { expect, test } from '@playwright/test';

test('combina el filtro por región con el buscador y permite volver a todas las regiones', async ({ page }) => {
  let requests = 0;
  await page.route('https://restcountries.conventus.de/v3.1/all?**', (route) => {
    requests++;
    return route.fulfill({
      json: [
        {
          cca3: 'ESP',
          translations: { spa: { common: 'España' } },
          flags: { png: '', svg: '' },
          region: 'Europe',
        },
        {
          cca3: 'FRA',
          translations: { spa: { common: 'Francia' } },
          flags: { png: '', svg: '' },
          region: 'Europe',
        },
        {
          cca3: 'MEX',
          translations: { spa: { common: 'México' } },
          flags: { png: '', svg: '' },
          region: 'Americas',
        },
      ],
    });
  });

  await page.goto('/');
  const cards = page.getByRole('listitem');
  const search = page.getByRole('textbox', { name: 'Buscar por nombre' });
  const chips = page.getByRole('group', { name: 'Filtrar por región' });
  await expect(cards).toHaveCount(3);
  await expect(chips.getByRole('button', { name: 'Todas las regiones' })).toHaveAttribute('aria-pressed', 'true');

  await expect(chips.getByRole('button')).toHaveCount(3);
  await expect(chips.getByRole('button', { name: 'América', exact: true })).toBeVisible();
  await chips.getByRole('button', { name: 'Europa', exact: true }).click();
  await expect(cards).toHaveCount(2);

  await search.fill('espana');
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText('España');

  await search.fill('mexico');
  await expect(page.getByRole('status')).toContainText('No encontramos países con estos filtros');

  await chips.getByRole('button', { name: 'Todas las regiones' }).click();
  await expect(search).toHaveValue('mexico');
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText('México');

  await search.clear();
  await expect(cards).toHaveCount(3);
  expect(requests).toBe(1);
});
