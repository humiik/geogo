import type { Country, RestCountry } from '../models/country';

import { capitalsEs, countryNamesEs, currenciesEs, languagesEs, regionsEs, subregionsEs } from './spanish-geography';

const languageNames = new Intl.DisplayNames('es', { type: 'language', fallback: 'none' });
const currencyNames = new Intl.DisplayNames('es', { type: 'currency', fallback: 'none' });

function displayName(names: Intl.DisplayNames, code: string): string {
  try {
    return names.of(code) ?? code;
  } catch (error) {
    if (error instanceof RangeError) return code;
    throw error;
  }
}

export function localizeCountry(country: RestCountry): Country {
  const { translations, ...data } = country;
  const spanish = translations?.spa;
  const adjustment = countryNamesEs[country.cca3];
  const common = adjustment?.common || spanish?.common || country.cca3;
  const official = adjustment?.official || spanish?.official || common;

  return {
    ...data,
    name: { common, official },
    flags: { ...data.flags, alt: `Bandera de ${common}` },
    region: regionsEs[data.region] ?? '',
    subregion: data.subregion ? subregionsEs[data.subregion] : undefined,
    capital: data.capital?.map((capital) => capitalsEs[capital] ?? capital),
    languages:
      data.languages &&
      Object.fromEntries(
        Object.keys(data.languages).map((code) => [code, languagesEs[code] ?? displayName(languageNames, code)]),
      ),
    currencies:
      data.currencies &&
      Object.fromEntries(
        Object.entries(data.currencies).map(([code, currency]) => [
          code,
          { ...currency, name: currenciesEs[code] ?? displayName(currencyNames, code) },
        ]),
      ),
  };
}
