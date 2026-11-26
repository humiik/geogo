import { Component, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';
import type { Animation } from '@ionic/angular';
import { AnimationController, IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline } from 'ionicons/icons';

import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [IonButton, IonIcon],
  template: `
    @let dark = theme.active() === 'dark';
    <ion-button fill="clear" [attr.aria-label]="dark ? 'Activar tema claro' : 'Activar tema oscuro'" (click)="toggle()">
      <ion-icon #themeIcon slot="start" [name]="dark ? 'sunny-outline' : 'moon-outline'" aria-hidden="true"></ion-icon>
      {{ dark ? 'Claro' : 'Oscuro' }}
    </ion-button>
  `,
  styles: `
    :host {
      display: block;
      margin-inline-end: clamp(0.45rem, 3vw, 1rem);
    }

    ion-button {
      --background: var(--geo-tint);
      --color: var(--geo-active);
      --border-radius: 0.8rem;
      --padding-start: 0.55rem;
      --padding-end: 0.55rem;
      min-height: 2.75rem;
      margin: 0;
      font-size: 0.76rem;
      letter-spacing: 0;
      text-transform: none;
    }
  `,
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
  private readonly animations = inject(AnimationController);
  private readonly icon = viewChild.required<IonIcon, ElementRef<HTMLElement>>('themeIcon', { read: ElementRef });
  private animation?: Animation;

  constructor() {
    addIcons({ moonOutline, sunnyOutline });
    inject(DestroyRef).onDestroy(() => this.animation?.destroy());
  }

  protected toggle(): void {
    this.theme.toggle();
    if (!globalThis.matchMedia?.('(prefers-reduced-motion: no-preference)').matches) return;

    this.animation?.destroy();
    const animation = this.animations
      .create()
      .addElement(this.icon().nativeElement)
      .duration(190)
      .easing('ease-out')
      .fromTo('transform', 'rotate(-18deg) scale(0.82)', 'none');
    this.animation = animation;
    animation.onFinish(() => {
      if (this.animation === animation) this.animation = undefined;
      animation.destroy();
    });
    void animation.play();
  }
}
