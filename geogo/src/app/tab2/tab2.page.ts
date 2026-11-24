import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, Inject, computed, inject, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonProgressBar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { AnimatedNumberComponent } from '../components/animated-number/animated-number.component';
import { CapitalWeatherComponent } from '../components/capital-weather.component';
import { FlagFallbackDirective } from '../components/flag-fallback.directive';
import { ThemeToggleComponent } from '../components/theme-toggle/theme-toggle.component';
import type { Country } from '../models/country';
import { compareMetric, populationDensity } from '../models/country-metrics';
import { CountryService } from '../services/country.service';

const facts = [
  { label: 'Capitales', value: (country: Country) => country.capital?.join(', ') },
  { label: 'Región', value: (country: Country) => country.region },
  { label: 'Subregión', value: (country: Country) => country.subregion },
  { label: 'Idiomas', value: (country: Country) => Object.values(country.languages ?? {}).join(', ') },
  {
    label: 'Monedas',
    value: (country: Country) =>
      Object.values(country.currencies ?? {})
        .map((currency) => currency.name)
        .join(', '),
  },
];

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    AnimatedNumberComponent,
    CapitalWeatherComponent,
    FlagFallbackDirective,
    ThemeToggleComponent,
    DecimalPipe,
    IonButton,
    IonContent,
    IonHeader,
    IonProgressBar,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly state = signal<'loading' | 'loaded' | 'error'>('loading');
  protected readonly countries = signal<readonly Country[]>([]);
  protected readonly firstCode = signal('');
  protected readonly secondCode = signal('');
  protected readonly active = signal(false);
  protected readonly swapped = signal(false);
  protected readonly first = computed(() => this.countries().find((country) => country.cca3 === this.firstCode()));
  protected readonly second = computed(() => this.countries().find((country) => country.cca3 === this.secondCode()));
  protected readonly facts = facts;
  protected readonly metrics = computed(() => {
    const first = this.first();
    const second = this.second();
    if (!first || !second) return [];
    return [
      { label: 'Población', unit: 'hab.', ...compareMetric(first.population, second.population) },
      { label: 'Superficie', unit: 'km²', ...compareMetric(first.area, second.area) },
      { label: 'Densidad', unit: 'hab./km²', ...compareMetric(populationDensity(first), populationDensity(second)) },
    ];
  });

  // eslint-disable-next-line @angular-eslint/prefer-inject -- Requisito de evaluación: inyección por constructor.
  constructor(@Inject(CountryService) private readonly countryService: CountryService) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  ionViewWillEnter(): void {
    this.active.set(true);
  }

  ionViewWillLeave(): void {
    this.active.set(false);
  }

  protected loadCountries(): void {
    this.state.set('loading');
    this.countryService.countries$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (countries) => {
        this.countries.set(
          [...countries].sort((first, second) => first.name.common.localeCompare(second.name.common, 'es')),
        );
        this.state.set('loaded');
      },
      error: () => this.state.set('error'),
    });
  }

  protected selectCountry(slot: 'first' | 'second', code: unknown): void {
    if (typeof code !== 'string') return;
    (slot === 'first' ? this.firstCode : this.secondCode).set(code);
  }

  protected swap(): void {
    const first = this.firstCode();
    this.firstCode.set(this.secondCode());
    this.secondCode.set(first);
    this.swapped.update((swapped) => !swapped);
  }
}
