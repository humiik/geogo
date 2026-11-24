import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  cloudOutline,
  moonOutline,
  partlySunnyOutline,
  rainyOutline,
  snowOutline,
  sunnyOutline,
  thunderstormOutline,
} from 'ionicons/icons';
import { catchError, map, of, startWith, switchMap, timer } from 'rxjs';
import type { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import type { CountryCoordinates, WeatherSnapshot } from '../models/capital-weather';
import type { Country } from '../models/country';
import { CountryService } from '../services/country.service';
import { WeatherService } from '../services/weather.service';

import { CapitalMapComponent } from './capital-map.component';

type Load<T> = { status: 'loading' | 'error' | 'idle' } | { status: 'ready'; value: T };

function load<T>(source: Observable<T>): Observable<Load<T>> {
  return source.pipe(
    map((value): Load<T> => ({ status: 'ready', value })),
    startWith({ status: 'loading' } as const),
    catchError(() => of({ status: 'error' } as const)),
  );
}

@Component({
  selector: 'app-capital-weather',
  imports: [CapitalMapComponent, DecimalPipe, IonButton, IonIcon, IonSpinner],
  template: `
    <section class="capital-weather" [attr.aria-label]="'Clima y ubicación de ' + country().name.common">
      <h3>{{ capitalLabel() }}</h3>
      @let location = coordinates();
      @if (location.status === 'loading') {
        <div class="geo-status" role="status">
          <ion-spinner aria-hidden="true"></ion-spinner> Consultando coordenadas…
        </div>
      } @else if (location.status === 'error') {
        <p role="status">No se pudieron consultar las coordenadas.</p>
        <ion-button size="small" fill="clear" (click)="retry()">Reintentar ubicación</ion-button>
      } @else if (location.status === 'ready') {
        @if (withMap() && point(); as coords) {
          <app-capital-map
            [position]="coords"
            [label]="location.value.capital ? capitalLabel() : country().name.common"
          ></app-capital-map>
          <p>
            Coordenadas {{ location.value.capital ? 'de la capital' : 'del país' }} {{ coords[0] | number: '1.2-4' }}°,
            {{ coords[1] | number: '1.2-4' }}°
          </p>
          <a [href]="mapLink()" target="_blank" rel="noopener noreferrer">Abrir en OpenStreetMap</a>
        }
        @if (!location.value.capital) {
          <p>Coordenadas de la capital no disponibles.</p>
        } @else {
          @let conditions = weather();
          @if (conditions.status === 'loading') {
            <div class="geo-status" role="status">
              <ion-spinner aria-hidden="true"></ion-spinner> Consultando clima…
            </div>
          } @else if (conditions.status === 'error') {
            <p role="status">El clima de la capital no está disponible.</p>
            <ion-button size="small" fill="clear" (click)="retry()">Reintentar clima</ion-button>
          } @else if (conditions.status === 'ready') {
            <div class="weather-main">
              <ion-icon [name]="conditions.value.icon" aria-hidden="true"></ion-icon>
              <strong>{{
                conditions.value.temperature === null
                  ? 'Sin temperatura'
                  : (conditions.value.temperature | number: '1.0-1') + ' °C'
              }}</strong>
            </div>
            <p>{{ conditions.value.description }}</p>
            @if (clock(); as time) {
              <p>
                Hora local <strong>{{ time }}</strong>
              </p>
            }
            @if (withMap()) {
              <p>
                Sensación térmica
                {{
                  conditions.value.feelsLike === null
                    ? 'sin datos'
                    : (conditions.value.feelsLike | number: '1.0-1') + ' °C'
                }}
              </p>
              <p>Humedad {{ conditions.value.humidity === null ? 'sin datos' : conditions.value.humidity + ' %' }}</p>
            }
            <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Datos de Open-Meteo</a>
          }
        }
      }
    </section>
  `,
  styles: `
    .capital-weather {
      min-width: 0;
    }
    h3 {
      margin: 0 0 0.55rem;
      overflow-wrap: anywhere;
    }
    p {
      margin: 0.4rem 0;
    }
    a {
      display: inline-block;
      font-size: 0.8rem;
      color: var(--geo-active);
    }
    app-capital-map {
      display: block;
      margin-block: 0.75rem;
    }
    .weather-main {
      display: flex;
      gap: 0.45rem;
      align-items: center;
      margin-block-start: 0.7rem;
    }
    .weather-main ion-icon {
      color: var(--geo-active);
      font-size: 1.5rem;
    }
    .weather-main strong {
      font-size: 1.25rem;
    }
  `,
})
export class CapitalWeatherComponent {
  readonly country = input.required<Country>();
  readonly withMap = input(false);
  private readonly countries = inject(CountryService);
  private readonly weatherService = inject(WeatherService);
  private readonly attempt = signal(0);
  private readonly request = computed(() => ({ code: this.country().cca3, attempt: this.attempt() }));
  protected readonly capitalLabel = computed(() =>
    this.country().capital?.length === 1 ? this.country().capital?.[0] || 'Capital registrada' : 'Capital registrada',
  );
  protected readonly coordinates = toSignal(
    toObservable(this.request).pipe(switchMap(({ code }) => load(this.countries.coordinates(code)))),
    { initialValue: { status: 'loading' } as Load<CountryCoordinates> },
  );
  protected readonly point = computed(() => {
    const location = this.coordinates();
    return location.status === 'ready' ? (location.value.capital ?? location.value.country) : undefined;
  });
  protected readonly mapLink = computed(() => {
    const point = this.point();
    return point ? `${environment.mapUrl}/?mlat=${point[0]}&mlon=${point[1]}#map=10/${point[0]}/${point[1]}` : '';
  });
  protected readonly weather = toSignal(
    toObservable(this.coordinates).pipe(
      switchMap((location) =>
        location.status === 'ready' && location.value.capital
          ? load(this.weatherService.current(location.value.capital))
          : of({ status: 'idle' } as const),
      ),
    ),
    { initialValue: { status: 'idle' } as Load<WeatherSnapshot> },
  );
  protected readonly clock = toSignal(
    toObservable(this.weather).pipe(
      switchMap((weather) => {
        const zone = weather.status === 'ready' ? weather.value.timezone : undefined;
        if (!zone) return of('');
        const format = new Intl.DateTimeFormat('es-AR', {
          timeZone: zone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        return timer(0, 1000).pipe(map(() => format.format(new Date())));
      }),
    ),
    { initialValue: '' },
  );

  constructor() {
    addIcons({
      cloudOutline,
      moonOutline,
      partlySunnyOutline,
      rainyOutline,
      snowOutline,
      sunnyOutline,
      thunderstormOutline,
    });
  }

  protected retry(): void {
    this.attempt.update((attempt) => attempt + 1);
  }
}
