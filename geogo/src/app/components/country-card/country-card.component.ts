import { Component, input, output } from '@angular/core';
import { IonButton, IonCard, IonCardContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';

import type { Country } from '../../models/country';

@Component({
  selector: 'app-country-card',
  templateUrl: './country-card.component.html',
  styleUrl: './country-card.component.scss',
  imports: [IonButton, IonCard, IonCardContent, IonIcon],
})
export class CountryCardComponent {
  readonly country = input.required<Country>();
  readonly favorite = input(false);
  readonly details = output<Country>();
  readonly favoriteToggle = output<string>();

  constructor() {
    addIcons({ heart, heartOutline });
  }
}
