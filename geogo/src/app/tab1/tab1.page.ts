import { Component, DestroyRef, Inject, computed, inject, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular';
import type { InfiniteScrollCustomEvent } from '@ionic/angular';

import { AnimatedNumberComponent } from '../components/animated-number/animated-number.component';
import { CountryCardComponent } from '../components/country-card/country-card.component';
import { CountryDetailComponent } from '../components/country-detail/country-detail.component';
import { ThemeToggleComponent } from '../components/theme-toggle/theme-toggle.component';
import type { Country } from '../models/country';
import { isGeographicValue } from '../models/country-metrics';
import { CountryService } from '../services/country.service';
import { StorageService } from '../services/storage.service';

type CountryLoadState = 'loading' | 'loaded' | 'error';
type CountryOrder = 'name' | 'population' | 'area';
const batchSize = 12;

const byName = new Intl.Collator('es').compare;

function compareCountries(first: Country, second: Country, order: CountryOrder): number {
  if (order !== 'name') {
    const firstValue = isGeographicValue(first[order]) ? first[order] : -1;
    const secondValue = isGeographicValue(second[order]) ? second[order] : -1;
    if (firstValue !== secondValue) return secondValue - firstValue;
  }
  return byName(first.name.common, second.name.common);
}

function normalizeSearch(text: string): string {
  return text.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    AnimatedNumberComponent,
    ThemeToggleComponent,
    CountryCardComponent,
    CountryDetailComponent,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonInput,
    IonModal,
    IonSelect,
    IonSelectOption,
    IonSkeletonText,
    IonTitle,
    IonToggle,
    IonToolbar,
  ],
})
export class Tab1Page implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly state = signal<CountryLoadState>('loading');
  protected readonly countries = signal<readonly Country[]>([]);
  protected readonly search = signal('');
  protected readonly region = signal('');
  protected readonly order = signal<CountryOrder>('name');
  protected readonly selectedCountry = signal<Country | null>(null);
  protected readonly favoritesOnly = signal(false);
  protected readonly view = signal<'cards' | 'list'>('cards');
  protected readonly limit = signal(batchSize);
  protected readonly skeletons = [0, 1, 2, 3, 4, 5];
  protected readonly storage = inject(StorageService);
  protected readonly regions = computed(() =>
    [
      ...new Set(
        this.countries()
          .map((country) => country.region)
          .filter(Boolean),
      ),
    ].sort((first, second) => first.localeCompare(second, 'es')),
  );
  protected readonly visibleCountries = computed(() => {
    const query = normalizeSearch(this.search());
    const region = this.region();
    const order = this.order();
    const favoritesOnly = this.favoritesOnly();
    const favorites = this.storage.favorites();
    return this.countries()
      .filter(
        (country) =>
          (!favoritesOnly || favorites.has(country.cca3)) &&
          (!region || country.region === region) &&
          (!query || normalizeSearch(country.name.common).includes(query)),
      )
      .sort((first, second) => compareCountries(first, second, order));
  });
  protected readonly pageCountries = computed(() => this.visibleCountries().slice(0, this.limit()));
  protected readonly hasMore = computed(() => this.visibleCountries().length > this.limit());

  // Explorar usa el catálogo compartido para mostrar y filtrar países.
  constructor(@Inject(CountryService) private readonly countryService: CountryService) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  protected setRegion(region: string): void {
    this.region.set(region);
    this.limit.set(batchSize);
  }

  protected setSearch(search: string): void {
    this.search.set(search);
    this.limit.set(batchSize);
  }

  protected setFavorites(checked: boolean): void {
    this.favoritesOnly.set(checked);
    this.limit.set(batchSize);
  }

  protected showMore(event?: InfiniteScrollCustomEvent): void {
    if (this.hasMore()) this.limit.update((limit) => limit + batchSize);
    void event?.target.complete();
  }

  protected setOrder(value: unknown): void {
    if (value === 'name' || value === 'population' || value === 'area') {
      this.order.set(value);
      this.limit.set(batchSize);
    }
  }

  protected discoverCountry(): void {
    const countries = this.visibleCountries();
    if (countries.length) {
      this.selectedCountry.set(countries[Math.floor(Math.random() * countries.length)]);
    }
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
