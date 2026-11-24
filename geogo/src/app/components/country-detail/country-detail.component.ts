import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import type { Country } from '../../models/country';
import { isGeographicValue, populationDensity } from '../../models/country-metrics';

@Component({
  selector: 'app-country-detail',
  imports: [DecimalPipe],
  templateUrl: './country-detail.component.html',
  styleUrl: './country-detail.component.scss',
})
export class CountryDetailComponent {
  readonly country = input.required<Country>();
  protected readonly density = computed(() => populationDensity(this.country()));
  protected readonly languages = computed(() => Object.values(this.country().languages ?? {}).join(', '));
  protected readonly currencies = computed(() =>
    Object.entries(this.country().currencies ?? {})
      .map(([code, currency]) => `${currency.name} (${currency.symbol || code})`)
      .join(', '),
  );
  protected readonly hasValue = isGeographicValue;
}
