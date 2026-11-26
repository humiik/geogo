import { expect, test } from '@playwright/test';

const api = 'https://restcountries.conventus.de/v3.1';
const countries = Array.from({ length: 25 }, (_, index) => ({
  cca3: `X${index.toString().padStart(2, '0')}`,
  translations: { spa: { common: `País ${index.toString().padStart(2, '0')}` } },
  flags: { svg: '', png: '' },
  capital: [`Capital ${index.toString().padStart(2, '0')}`],
  region: 'Americas',
  population: index + 1,
  area: 100,
}));

test('presenta doce países y carga otros doce al desplazarse', async ({ page }) => {
  await page.route(`${api}/all?**`, (route) => route.fulfill({ json: countries }));
  await page.goto('/');
  const cards = page.locator('app-country-card');
  await expect(cards).toHaveCount(12);
  await page.getByRole('button', { name: 'Lista', exact: true }).click();
  await expect(page.locator('.country-list')).toBeVisible();
  await page
    .locator('app-tab1 ion-content')
    .first()
    .evaluate(async (node) => {
      const content = node as HTMLElement & { getScrollElement(): Promise<HTMLElement> };
      const scroll = await content.getScrollElement();
      scroll.scrollTop = scroll.scrollHeight;
    });
  await expect(cards).toHaveCount(24);
  await page.getByRole('textbox', { name: 'Buscar por nombre' }).fill('País 01');
  await expect(cards).toHaveCount(1);
});

test('consulta el mapa, clima y hora al abrir la ficha y reutiliza la consulta', async ({ page }) => {
  let coordinates = 0;
  let weather = 0;
  await page.route(`${api}/all?**`, (route) => route.fulfill({ json: [countries[0]] }));
  await page.route(`${api}/alpha/**`, (route) => {
    coordinates++;
    return route.fulfill({ json: { capitalInfo: { latlng: [-34.6, -58.4] }, latlng: [-34, -64] } });
  });
  await page.route('https://api.open-meteo.com/v1/forecast?**', (route) => {
    weather++;
    return route.fulfill({
      json: {
        timezone: 'America/Argentina/Buenos_Aires',
        current: { temperature_2m: 22, apparent_temperature: 23, relative_humidity_2m: 61, weather_code: 0, is_day: 1 },
      },
    });
  });
  await page.route('https://tile.openstreetmap.org/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"/>',
    }),
  );
  await page.goto('/');
  const open = page.getByRole('button', { name: 'Ver detalles de País 00' });
  await expect(open).toBeVisible();
  expect(coordinates).toBe(0);
  expect(weather).toBe(0);

  await open.click();
  const modal = page.locator('ion-modal');
  await expect(modal.locator('.geo-map-pin')).toBeVisible();
  await expect(modal.getByText('22 °C', { exact: true })).toBeVisible();
  await expect(modal.getByText(/Humedad 61 %/)).toBeVisible();
  await expect(modal.getByText(/Hora local \d\d:\d\d:\d\d/)).toBeVisible();
  await expect(modal.getByRole('link', { name: 'Abrir en OpenStreetMap' })).toHaveAttribute('href', /mlat=-34.6/);
  await modal.getByRole('button', { name: 'Cerrar' }).click();
  await expect(modal).toBeHidden();
  await open.click();
  await expect(modal.getByText('22 °C', { exact: true })).toBeVisible();
  expect(coordinates).toBe(1);
  expect(weather).toBe(1);
});

test('retira el aviso del mapa cuando se descartan las teselas fallidas', async ({ page }) => {
  await page.route(`${api}/all?**`, (route) => route.fulfill({ json: [countries[0]] }));
  await page.route(`${api}/alpha/**`, (route) => route.fulfill({ json: { latlng: [-34, -64] } }));
  await page.route('https://tile.openstreetmap.org/**', (route) =>
    new URL(route.request().url()).pathname.startsWith('/10/')
      ? route.abort()
      : route.fulfill({
          contentType: 'image/svg+xml',
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"/>',
        }),
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'Ver detalles de País 00' }).click();
  const modal = page.locator('ion-modal');
  const warning = modal.getByText('Parte del mapa no está disponible.', { exact: false });
  await expect(warning).toBeVisible();
  await modal.getByRole('button', { name: 'Acercar' }).click();
  await expect(modal.locator('.leaflet-tile-loaded').first()).toBeVisible();
  await expect(warning).toBeHidden();
});
