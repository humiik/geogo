import { Component, DestroyRef, Inject, inject, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { CountryService } from '../services/country.service';

type CountryLoadState = 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab1Page implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly state = signal<CountryLoadState>('loading');
  protected readonly countryCount = signal(0);

  // eslint-disable-next-line @angular-eslint/prefer-inject -- Requisito de evaluación: inyección por constructor.
  constructor(@Inject(CountryService) private readonly countryService: CountryService) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  protected loadCountries(): void {
    this.state.set('loading');
    this.countryService.countries$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (countries) => {
        this.countryCount.set(countries.length);
        this.state.set('loaded');
        console.info('GeoGo · Países recibidos', countries);
      },
      error: (error: unknown) => {
        this.state.set('error');
        console.error('GeoGo · Error al cargar países', error);
      },
    });
  }
}
