import { expect, test } from '@playwright/test';

test('aplica el tema del sistema y conserva la elección al navegar y recargar', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.route('https://restcountries.conventus.de/v3.1/all?**', (route) => route.fulfill({ json: [] }));
  await page.goto('/');

  const root = page.locator('html');
  await expect(root).toHaveCSS('color-scheme', 'dark');
  const explore = page.getByRole('region', { name: 'Países del mundo' });
  await expect(explore.getByRole('heading')).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: 'Activar tema claro' }).click();
  await expect(root).toHaveCSS('color-scheme', 'light');

  await page.getByRole('tab', { name: 'Comparar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Comparar países' })).toBeVisible();
  await page.reload();
  await expect(root).toHaveCSS('color-scheme', 'light');

  await page.getByRole('tab', { name: 'Desafíos', exact: true }).click();
  await page.getByRole('button', { name: 'Activar tema oscuro' }).click();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload();
  await expect(root).toHaveCSS('color-scheme', 'dark');
});
