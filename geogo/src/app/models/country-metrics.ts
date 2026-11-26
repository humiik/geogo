import type { Country } from './country';

interface MetricComparison {
  first: number | null;
  second: number | null;
  difference: number | null;
  percent: number | null;
  firstBar: number;
  secondBar: number;
}

export function isGeographicValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function populationDensity(country: Country): number | null {
  const { area, population } = country;
  return isGeographicValue(area) && area > 0 && isGeographicValue(population) ? population / area : null;
}

export function compareMetric(firstValue: unknown, secondValue: unknown): MetricComparison {
  const first = isGeographicValue(firstValue) ? firstValue : null;
  const second = isGeographicValue(secondValue) ? secondValue : null;
  const difference = first !== null && second !== null ? Math.abs(second - first) : null;
  const highest = first !== null && second !== null ? Math.max(first, second) : 0;
  const percent = difference !== null && first !== null && first > 0 ? (difference / first) * 100 : null;
  return {
    first,
    second,
    difference,
    percent,
    firstBar: highest > 0 && first !== null ? first / highest : 0,
    secondBar: highest > 0 && second !== null ? second / highest : 0,
  };
}
