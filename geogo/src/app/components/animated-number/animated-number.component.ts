import { Component, computed, effect, input, signal, untracked } from '@angular/core';

@Component({
  selector: 'app-animated-number',
  template: `<span aria-hidden="true">{{ visible() }}</span
    ><span class="geo-sr-only">{{ final() }}</span>`,
})
export class AnimatedNumberComponent {
  readonly value = input.required<number>();
  readonly digits = input(0);
  private readonly display = signal(0);
  private readonly formatter = computed(() => new Intl.NumberFormat('es-AR', { maximumFractionDigits: this.digits() }));
  protected readonly visible = computed(() => this.formatter().format(this.display()));
  protected readonly final = computed(() => this.formatter().format(this.value()));

  constructor() {
    effect((cleanup) => {
      const target = this.value();
      if (!globalThis.matchMedia?.('(prefers-reduced-motion: no-preference)').matches) {
        this.display.set(target);
        return;
      }
      const start = performance.now();
      const previous = untracked(this.display);
      let frame = requestAnimationFrame(function step(this: void, time: number) {
        const ratio = Math.min(1, (time - start) / 420);
        update(ratio);
        if (ratio < 1) frame = requestAnimationFrame(step);
      });
      const update = (ratio: number) => this.display.set(previous + (target - previous) * (1 - (1 - ratio) ** 3));
      cleanup(() => cancelAnimationFrame(frame));
    });
  }
}
