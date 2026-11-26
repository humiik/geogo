import { DOCUMENT, DestroyRef, Injectable, inject, signal } from '@angular/core';

import type { GeoTheme } from './storage.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(StorageService);
  private readonly systemTheme = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
  private preference = this.storage.readTheme();
  private readonly current = signal<GeoTheme>(this.preference ?? (this.systemTheme?.matches ? 'dark' : 'light'));
  readonly active = this.current.asReadonly();

  constructor() {
    this.apply(this.current());
    const followSystem = (event: MediaQueryListEvent) => {
      if (!this.preference) this.apply(event.matches ? 'dark' : 'light');
    };
    this.systemTheme?.addEventListener('change', followSystem);
    inject(DestroyRef).onDestroy(() => this.systemTheme?.removeEventListener('change', followSystem));
  }

  toggle(): void {
    const theme = this.current() === 'dark' ? 'light' : 'dark';
    this.preference = theme;
    this.storage.saveTheme(theme);
    this.apply(theme);
  }

  private apply(theme: GeoTheme): void {
    this.current.set(theme);
    this.document.documentElement.classList.toggle('ion-palette-dark', theme === 'dark');
  }
}
