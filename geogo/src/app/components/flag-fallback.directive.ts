import { Directive, ElementRef, inject } from '@angular/core';

const fallback = 'assets/geo/flag-unavailable.svg';

@Directive({ selector: 'img[appFlagFallback]', host: { '(error)': 'replace()' } })
export class FlagFallbackDirective {
  private readonly image = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;

  protected replace(): void {
    if (this.image.getAttribute('src') !== fallback) this.image.src = fallback;
  }
}
