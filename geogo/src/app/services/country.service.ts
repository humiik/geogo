import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, shareReplay, tap } from 'rxjs';
import type { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { localizeCountry } from '../i18n/localize-country';
import type { CountryCoordinates } from '../models/capital-weather';
import { readCoordinates } from '../models/capital-weather';
import type { Country, RestCountry } from '../models/country';

@Injectable({ providedIn: 'root' })
export class CountryService {
  private readonly positions = new Map<string, Observable<CountryCoordinates>>();
  readonly countries$: Observable<readonly Country[]>;

  // El catálogo se carga cuando una pestaña lo solicita por primera vez.
  constructor(@Inject(HttpClient) private readonly http: HttpClient) {
    this.countries$ = http
      .get<RestCountry[]>(`${environment.countriesApiUrl}/all`, {
        // REST Countries admite hasta diez campos. translations.spa incluye los nombres del país.
        params: { fields: 'cca3,translations,flags,region,subregion,capital,population,area,languages,currencies' },
        timeout: 15_000,
      })
      .pipe(
        map((countries) => {
          if (!Array.isArray(countries)) {
            throw new Error('REST Countries no devolvió una lista de países.');
          }
          return countries.map(localizeCountry);
        }),
        // Comparte la petición y conserva la última respuesta exitosa en memoria.
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  coordinates(code: string): Observable<CountryCoordinates> {
    const cached = this.positions.get(code);
    if (cached) return cached;
    const result = this.http
      .get<{ capitalInfo?: { latlng?: unknown }; latlng?: unknown }>(
        `${environment.countriesApiUrl}/alpha/${encodeURIComponent(code)}`,
        { params: { fields: 'capitalInfo,latlng' }, timeout: 12_000 },
      )
      .pipe(
        map((data) => ({
          capital: readCoordinates(data.capitalInfo?.latlng),
          country: readCoordinates(data.latlng),
        })),
        tap({ error: () => this.positions.delete(code) }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
    this.positions.set(code, result);
    return result;
  }
}
