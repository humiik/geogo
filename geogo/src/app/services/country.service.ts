import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, shareReplay } from 'rxjs';
import type { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import type { Country } from '../models/country';

@Injectable({ providedIn: 'root' })
export class CountryService {
  readonly countries$: Observable<readonly Country[]>;

  // eslint-disable-next-line @angular-eslint/prefer-inject -- Requisito de evaluación: inyección por constructor.
  constructor(@Inject(HttpClient) http: HttpClient) {
    this.countries$ = http
      .get<Country[]>(`${environment.countriesApiUrl}/all`, {
        params: { fields: 'cca3,name,flags,region,subregion,capital,population,area,languages,currencies' },
        timeout: 15_000,
      })
      .pipe(
        map((countries) => {
          if (!Array.isArray(countries)) {
            throw new Error('REST Countries no devolvió una lista de países.');
          }
          return countries;
        }),
        // Comparte la petición y conserva la última respuesta exitosa en memoria.
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }
}
