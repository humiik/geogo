import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const examples = [
  { code: 'ARG', name: 'Argentina', capital: 'Buenos Aires', region: 'Americas', population: 45, area: 3 },
  { code: 'BRA', name: 'Brasil', capital: 'Brasília', region: 'Americas', population: 210, area: 10 },
  { code: 'ESP', name: 'España', capital: 'Madrid', region: 'Europe', population: 48, area: 1 },
  { code: 'JPN', name: 'Japón', capital: 'Tokyo', region: 'Asia', population: 125, area: 1 },
  { code: 'AUS', name: 'Australia', capital: 'Canberra', region: 'Oceania', population: 26, area: 8 },
];

const spanishRegions: Record<string, string> = {
  Americas: 'América',
  Europe: 'Europa',
  Asia: 'Asia',
  Oceania: 'Oceanía',
};

test.beforeEach(async ({ page }) => {
  await page.route('https://restcountries.conventus.de/v3.1/alpha/**', (route) => route.fulfill({ json: {} }));
  await page.route('https://restcountries.conventus.de/v3.1/all?**', (route) =>
    route.fulfill({
      json: examples.map((item) => ({
        cca3: item.code,
        translations: { spa: { common: item.name } },
        flags: { svg: '', png: '' },
        capital: [item.capital],
        region: item.region,
        population: item.population,
        area: item.area,
      })),
    }),
  );
});

async function choose(page: Page, label: string, option: string, confirm: string): Promise<void> {
  const dialog = page.getByRole('alertdialog');
  await page.locator(`ion-select[label="${label}"]`).click();
  await dialog.getByRole('radio', { name: option, exact: true }).click();
  await dialog.getByRole('button', { name: confirm, exact: true }).click();
  await expect(dialog).toBeHidden();
}

test('ordena, guarda un favorito y abre su ficha al descubrirlo', async ({ page }) => {
  await page.goto('/');
  const cards = page.getByRole('listitem');
  await expect(cards).toHaveCount(5);
  await choose(page, 'Ordenar por', 'Mayor población', 'Aplicar');
  await expect(cards.first()).toContainText('Brasil');

  await page.getByRole('button', { name: 'Agregar a favoritos Brasil' }).click();
  await expect(page.getByRole('button', { name: 'Quitar de favoritos Brasil' })).toBeVisible();
  await page.reload();
  await page.getByText('Solo favoritos', { exact: true }).click();
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText('Brasil');

  await page.getByRole('button', { name: 'Descubrir al azar' }).click();
  const modal = page.locator('ion-modal');
  await expect(modal.getByRole('heading', { name: 'Brasil', exact: true })).toBeVisible();
  await expect(modal).toContainText('Brasilia');
  await modal.getByRole('button', { name: 'Cerrar' }).click();
  await expect(modal).toBeHidden();
});

test('valida duplicados, calcula la diferencia e intercambia los países', async ({ page }) => {
  let weatherRequests = 0;
  await page.route('https://restcountries.conventus.de/v3.1/alpha/**', (route) =>
    route.fulfill({
      json: { capitalInfo: { latlng: route.request().url().includes('/ARG?') ? [-34.6, -58.4] : [-15.8, -47.9] } },
    }),
  );
  await page.route('https://api.open-meteo.com/v1/forecast?**', (route) => {
    weatherRequests++;
    const argentina = new URL(route.request().url()).searchParams.get('latitude') === '-34.6';
    return route.fulfill({
      json: {
        timezone: argentina ? 'America/Argentina/Buenos_Aires' : 'America/Sao_Paulo',
        current: { temperature_2m: argentina ? 17 : 25, weather_code: argentina ? 3 : 0 },
      },
    });
  });
  await page.goto('/tabs/tab2');
  await choose(page, 'Primer país', 'Argentina', 'Elegir');
  await choose(page, 'Segundo país', 'Argentina', 'Elegir');
  await expect(page.getByRole('alert')).toContainText('Elegí dos países distintos');
  expect(weatherRequests).toBe(0);
  await choose(page, 'Segundo país', 'Brasil', 'Elegir');
  const stats = page.getByRole('region', { name: 'Diferencias numéricas' });
  await expect(stats).toContainText('Diferencia de 165 hab.');
  await expect(stats.getByRole('progressbar')).toHaveCount(6);
  const capitals = page.getByRole('region', { name: 'Clima y hora de las capitales' });
  await expect(capitals.getByText('17 °C', { exact: true })).toBeVisible();
  await expect(capitals.getByText('25 °C', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Intercambiar' }).click();
  await expect(page.getByRole('button', { name: 'Primer país, Brasil' })).toBeVisible();
  await expect(capitals.getByRole('region', { name: /^Clima y ubicación/ }).first()).toHaveAttribute(
    'aria-label',
    'Clima y ubicación de Brasil',
  );
  expect(weatherRequests).toBe(2);
});

test('completa cinco preguntas y conserva los puntos al recargar', async ({ page }) => {
  await page.goto('/tabs/tab3');
  await page.getByRole('button', { name: 'Jugar: Descubrí la región' }).click();

  for (let index = 1; index <= 5; index++) {
    await expect(page.getByText(`Pregunta ${index} de 5`, { exact: true })).toBeVisible();
    const prompt = await page.getByRole('heading', { name: /^¿En qué región está/ }).innerText();
    const country = examples.find((item) => prompt.endsWith(` ${item.name}?`));
    if (!country) throw new Error(`País de prueba desconocido: ${prompt}`);
    await page.getByRole('button', { name: spanishRegions[country.region], exact: true }).click();
    await expect(page.getByRole('status')).toContainText('¡Correcto!');
    await page.getByRole('button', { name: index === 5 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
  }

  await expect(page.getByText('+50 XP', { exact: true })).toBeVisible();
  await page.reload();
  await page.locator('ion-segment-button[value="stats"]').click();
  await expect(page.getByRole('tab', { name: 'Estadísticas', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.xp app-animated-number .geo-sr-only')).toHaveText('50');
  await expect(page.getByText('100 %', { exact: true })).toBeVisible();
  await expect(page.getByText('Sin escalas', { exact: true }).locator('..')).toContainText('Obtenida');
});
