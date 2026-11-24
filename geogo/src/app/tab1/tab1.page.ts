import { Component, DestroyRef, Inject, computed, inject, signal } from '@angular/core';
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
  IonInput,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { CountryCardComponent } from '../components/country-card/country-card.component';
import type { Country } from '../models/country';
import { CountryService } from '../services/country.service';

type CountryLoadState = 'loading' | 'loaded' | 'error';

function normalizeSearch(text: string): string {
  return text.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    CountryCardComponent,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonInput,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab1Page implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly state = signal<CountryLoadState>('loading');
  protected readonly countries = signal<readonly Country[]>([]);
  protected readonly search = signal('');
  protected readonly visibleCountries = computed(() => {
    const query = normalizeSearch(this.search());
    const countries = this.countries();
    return query ? countries.filter((country) => normalizeSearch(country.name.common).includes(query)) : countries;
  });

  // eslint-disable-next-line @angular-eslint/prefer-inject -- Requisito de evaluación: inyección por constructor.
  constructor(@Inject(CountryService) private readonly countryService: CountryService) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  protected loadCountries(): void {
    this.state.set('loading');
    this.countryService.countries$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (countries) => {
        this.countries.set(countries);
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
