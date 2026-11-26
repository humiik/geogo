import { isGeographicValue } from './country-metrics';

interface CountryName {
  common: string;
  official: string;
}

export interface Country {
  cca3: string;
  name: CountryName & { nativeName?: Record<string, CountryName> };
  flags: { png: string; svg: string; alt?: string };
  region: string;
  subregion?: string;
  capital?: string[];
  population: number | null;
  area: number | null;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol?: string }>;
}

export type RestCountry = Omit<Country, 'name'> & {
  translations?: { spa?: Partial<CountryName> };
};

function readRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function readText(value: unknown): string | undefined {
  return typeof value === 'string' ? value.trim() || undefined : undefined;
}

export function readRestCountry(value: unknown): RestCountry | undefined {
  const data = readRecord(value);
  const cca3 = readText(data['cca3']);
  if (!cca3) return undefined;

  const flags = readRecord(data['flags']);
  const spanish = readRecord(readRecord(data['translations'])['spa']);
  const capital = data['capital'];
  const population = data['population'];
  const area = data['area'];

  return {
    cca3,
    translations: { spa: { common: readText(spanish['common']), official: readText(spanish['official']) } },
    flags: { png: readText(flags['png']) ?? '', svg: readText(flags['svg']) ?? '' },
    region: readText(data['region']) ?? '',
    subregion: readText(data['subregion']),
    capital: Array.isArray(capital) ? capital.map(readText).filter((city) => city !== undefined) : undefined,
    population: isGeographicValue(population) ? population : null,
    area: isGeographicValue(area) ? area : null,
    languages: Object.fromEntries(
      Object.entries(readRecord(data['languages'])).flatMap(([code, value]) => {
        const name = readText(value);
        return name ? [[code, name]] : [];
      }),
    ),
    currencies: Object.fromEntries(
      Object.entries(readRecord(data['currencies'])).map(([code, value]) => {
        const currency = readRecord(value);
        return [code, { name: readText(currency['name']) ?? '', symbol: readText(currency['symbol']) }];
      }),
    ),
  };
}
