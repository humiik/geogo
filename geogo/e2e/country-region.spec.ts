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
  const select = page.locator('ion-select');
  const dialog = page.getByRole('alertdialog');
  await expect(cards).toHaveCount(3);
  await expect(select.getByRole('button', { name: 'Región, Todas las regiones' })).toBeVisible();

  await select.click();
  await expect(dialog.getByRole('radio')).toHaveCount(3);
  await expect(dialog.getByRole('radio', { name: 'América', exact: true })).toBeVisible();
  await dialog.getByRole('radio', { name: 'Europa', exact: true }).click();
  await dialog.getByRole('button', { name: 'Aplicar' }).click();
  await expect(dialog).toBeHidden();
  await expect(cards).toHaveCount(2);

  await search.fill('espana');
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText('España');

  await search.fill('mexico');
  await expect(page.getByRole('status')).toContainText('No encontramos países con estos filtros');

  await select.click();
  await dialog.getByRole('radio', { name: 'Todas las regiones' }).click();
  await dialog.getByRole('button', { name: 'Aplicar' }).click();
  await expect(dialog).toBeHidden();
  await expect(search).toHaveValue('mexico');
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText('México');

  await search.clear();
  await expect(cards).toHaveCount(3);
  expect(requests).toBe(1);
});
