import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, shareReplay, tap } from 'rxjs';
import type { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import type { Coordinates, WeatherSnapshot } from '../models/capital-weather';

interface Forecast {
  timezone?: string;
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
    is_day?: number;
  };
}

const descriptions: Readonly<Record<number, readonly [string, string] | undefined>> = {
  1: ['Mayormente despejado', 'partly-sunny-outline'],
  2: ['Parcialmente nublado', 'partly-sunny-outline'],
  3: ['Cubierto', 'cloud-outline'],
  45: ['Niebla', 'cloud-outline'],
  48: ['Niebla con escarcha', 'cloud-outline'],
  51: ['Llovizna leve', 'rainy-outline'],
  53: ['Llovizna', 'rainy-outline'],
  55: ['Llovizna intensa', 'rainy-outline'],
  56: ['Llovizna helada', 'rainy-outline'],
  57: ['Llovizna helada intensa', 'rainy-outline'],
  61: ['Lluvia leve', 'rainy-outline'],
  63: ['Lluvia', 'rainy-outline'],
  65: ['Lluvia intensa', 'rainy-outline'],
  66: ['Lluvia helada', 'rainy-outline'],
  67: ['Lluvia helada intensa', 'rainy-outline'],
  71: ['Nevada leve', 'snow-outline'],
  73: ['Nevada', 'snow-outline'],
  75: ['Nevada intensa', 'snow-outline'],
  77: ['Granos de nieve', 'snow-outline'],
  85: ['Chubascos de nieve', 'snow-outline'],
  86: ['Chubascos fuertes de nieve', 'snow-outline'],
  80: ['Chubascos leves', 'rainy-outline'],
  81: ['Chubascos', 'rainy-outline'],
  82: ['Chubascos intensos', 'rainy-outline'],
  95: ['Tormenta eléctrica', 'thunderstorm-outline'],
  96: ['Tormenta con granizo', 'thunderstorm-outline'],
  99: ['Tormenta con granizo fuerte', 'thunderstorm-outline'],
};

function numberOrNull(value: number | undefined): number | null {
  return value !== undefined && Number.isFinite(value) ? value : null;
}

function validZone(timezone?: string): string | undefined {
  if (!timezone) return undefined;
  try {
    new Intl.DateTimeFormat('es', { timeZone: timezone });
    return timezone;
  } catch {
    return undefined;
  }
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly cache = new Map<string, { expires: number; value: Observable<WeatherSnapshot> }>();

  constructor(@Inject(HttpClient) private readonly http: HttpClient) {}

  current([latitude, longitude]: Coordinates): Observable<WeatherSnapshot> {
    const key = `${latitude},${longitude}`;
    const now = Date.now();
    const cached = this.cache.get(key);
    if (cached && cached.expires > now) return cached.value;
    const value = this.http
      .get<Forecast>(environment.weatherApiUrl, {
        params: {
          latitude,
          longitude,
          timezone: 'auto',
          current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day',
        },
        timeout: 12_000,
      })
      .pipe(
        map(({ current, timezone }) => {
          if (!current) throw new Error('Open-Meteo no devolvió condiciones actuales.');
          const [description, icon] =
            current.weather_code === 0
              ? ['Despejado', current.is_day === 0 ? 'moon-outline' : 'sunny-outline']
              : (descriptions[current.weather_code ?? -1] ?? ['Condición no disponible', 'cloud-outline']);
          return {
            temperature: numberOrNull(current.temperature_2m),
            feelsLike: numberOrNull(current.apparent_temperature),
            humidity: numberOrNull(current.relative_humidity_2m),
            description,
            icon,
            timezone: validZone(timezone),
          };
        }),
        tap({
          error: () => {
            if (this.cache.get(key)?.value === value) this.cache.delete(key);
          },
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
    this.cache.set(key, { expires: now + 10 * 60_000, value });
    return value;
  }
}
