import { Injectable } from '@angular/core';

import type { Country } from '../models/country';
import { isGeographicValue } from '../models/country-metrics';
import type { QuizMode, QuizOption, QuizQuestion, QuizRound } from '../models/quiz';
import { questionsPerRound } from '../models/quiz';

// Este conjunto evita banderas idénticas o casi idénticas entre las opciones.
const flagCodes = new Set([
  'ARG',
  'AUT',
  'AUS',
  'BRA',
  'CAN',
  'CHE',
  'CHL',
  'CHN',
  'COL',
  'DEU',
  'DNK',
  'ESP',
  'FIN',
  'FRA',
  'GBR',
  'GRC',
  'IND',
  'ISL',
  'ITA',
  'JPN',
  'KEN',
  'KOR',
  'MEX',
  'NGA',
  'NOR',
  'PAK',
  'PER',
  'POL',
  'PRT',
  'SWE',
  'THA',
  'TUN',
  'TUR',
  'UKR',
  'URY',
  'USA',
  'VNM',
  'ZAF',
]);

function shuffle<T>(values: readonly T[]): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function key(text: string): string {
  return text.trim().normalize('NFC').toLocaleLowerCase('es');
}

function countryOption(country: Country): QuizOption {
  return { id: country.cca3, label: country.name.common };
}

@Injectable({ providedIn: 'root' })
export class QuizService {
  createRound(mode: QuizMode, countries: readonly Country[]): QuizRound | null {
    const uniqueCountries = [
      ...new Map(shuffle(countries).map((country) => [key(country.name.common), country])).values(),
    ];
    const questions = this.questionsFor(mode, uniqueCountries);
    if (questions.length < questionsPerRound) return null;

    return {
      id: Array.from(globalThis.crypto.getRandomValues(new Uint32Array(4))).join('-'),
      mode,
      questions: questions.slice(0, questionsPerRound),
    };
  }

  private questionsFor(mode: QuizMode, countries: Country[]): QuizQuestion[] {
    switch (mode) {
      case 'flags': {
        const flagged = countries.filter(
          (country) => flagCodes.has(country.cca3) && (country.flags.svg || country.flags.png),
        );
        return flagged
          .map((country) =>
            this.question(
              country.cca3,
              '¿A qué país pertenece esta bandera?',
              countryOption(country),
              shuffle(flagged.filter((other) => other.cca3 !== country.cca3)).map(countryOption),
              { primary: country.flags.svg || country.flags.png, fallback: country.flags.png || undefined },
            ),
          )
          .filter((question) => question.options.length === 4);
      }
      case 'capitals': {
        const capitals = [
          ...new Map(
            countries
              .flatMap((country) => country.capital ?? [])
              .filter((capital) => capital.trim())
              .map((capital) => [key(capital), { id: key(capital), label: capital }]),
          ).values(),
        ];
        return countries.flatMap((country) => {
          const valid = (country.capital ?? []).filter((capital) => capital.trim()).map(key);
          if (!valid.length) return [];
          const correct = shuffle(capitals.filter((capital) => valid.includes(capital.id)))[0];
          const others = shuffle(capitals.filter((capital) => !valid.includes(capital.id)));
          return others.length >= 3
            ? [this.question(country.cca3, `¿Cuál es una capital de ${country.name.common}?`, correct, others)]
            : [];
        });
      }
      case 'population': {
        const ordered = [
          ...new Map(
            countries.flatMap((country) => {
              const { population } = country;
              return isGeographicValue(population) ? [[population, { population, country }] as const] : [];
            }),
          ).values(),
        ].sort((a, b) => a.population - b.population);
        return shuffle(ordered.slice(3)).map(({ country, population }) =>
          this.question(
            country.cca3,
            '¿Cuál de estos países tiene más habitantes?',
            countryOption(country),
            shuffle(ordered.filter((other) => other.population < population)).map((other) =>
              countryOption(other.country),
            ),
          ),
        );
      }
      case 'regions': {
        const regions = [...new Set(countries.map((country) => country.region).filter(Boolean))];
        if (regions.length < 2) return [];
        return countries
          .filter((country) => country.region)
          .map((country) =>
            this.question(
              country.cca3,
              `¿En qué región está ${country.name.common}?`,
              { id: country.region, label: country.region },
              shuffle(regions.filter((region) => region !== country.region)).map((region) => ({
                id: region,
                label: region,
              })),
            ),
          );
      }
    }
  }

  private question(
    id: string,
    prompt: string,
    answer: QuizOption,
    alternatives: QuizOption[],
    flag?: QuizQuestion['flag'],
  ): QuizQuestion {
    return { id, prompt, answerId: answer.id, options: shuffle([answer, ...alternatives.slice(0, 3)]), flag };
  }
}
