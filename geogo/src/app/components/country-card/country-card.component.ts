import { Component, input } from '@angular/core';
import { IonCard, IonCardContent } from '@ionic/angular';

import type { Country } from '../../models/country';

@Component({
  selector: 'app-country-card',
  templateUrl: './country-card.component.html',
  styleUrl: './country-card.component.scss',
  imports: [IonCard, IonCardContent],
})
export class CountryCardComponent {
  readonly country = input.required<Country>();
}
