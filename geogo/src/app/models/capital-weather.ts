export type Coordinates = readonly [latitude: number, longitude: number];

export interface CountryCoordinates {
  capital?: Coordinates;
  country?: Coordinates;
}

export interface WeatherSnapshot {
  temperature: number | null;
  feelsLike: number | null;
  humidity: number | null;
  description: string;
  icon: string;
  timezone?: string;
}

export function readCoordinates(value: unknown): Coordinates | undefined {
  if (!Array.isArray(value) || value.length !== 2) return undefined;
  const [lat, lon] = value;
  return typeof lat === 'number' && typeof lon === 'number' && Math.abs(lat) <= 90 && Math.abs(lon) <= 180
    ? [lat, lon]
    : undefined;
}
