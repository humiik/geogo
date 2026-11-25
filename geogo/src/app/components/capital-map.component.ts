import { Component, effect, input, signal, viewChild } from '@angular/core';
import type { ElementRef } from '@angular/core';
import type { Map as LeafletMap, TileEvent } from 'leaflet';

import { environment } from '../../environments/environment';
import type { Coordinates } from '../models/capital-weather';

@Component({
  selector: 'app-capital-map',
  template: `
    <div #canvas class="canvas" role="region" [attr.aria-label]="label()"></div>
    @if (unavailable()) {
      <p role="status">Parte del mapa no está disponible. Podés abrirlo en OpenStreetMap.</p>
    }
  `,
  styles: `
    .canvas {
      height: clamp(15rem, 48vw, 21rem);
      border: 1px solid var(--geo-border);
      border-radius: 0.9rem;
      background: var(--geo-tint);
      color: var(--geo-night);
      isolation: isolate;
      z-index: 0;
    }
  `,
})
export class CapitalMapComponent {
  readonly position = input.required<Coordinates>();
  readonly label = input.required<string>();
  protected readonly unavailable = signal(false);
  private readonly canvas = viewChild<ElementRef<HTMLDivElement>>('canvas');

  constructor() {
    effect((cleanup) => {
      const [latitude, longitude] = this.position();
      const label = this.label();
      const canvas = this.canvas()?.nativeElement;
      if (!canvas) return;
      let destroyed = false;
      let map: LeafletMap | undefined;
      let observer: ResizeObserver | undefined;
      this.unavailable.set(false);

      void import('leaflet/dist/leaflet-src.esm.js')
        .then((leaflet) => {
          if (destroyed) return;
          const point: [number, number] = [latitude, longitude];
          map = leaflet
            .map(canvas, { zoomControl: false, scrollWheelZoom: false, zoomAnimation: false })
            .setView(point, 10);
          leaflet.control.zoom({ zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' }).addTo(map);
          map.attributionControl.setPrefix(false);
          const failedTiles = new Set<HTMLElement>();
          const clearTileError = ({ tile }: TileEvent) => {
            if (!destroyed && failedTiles.delete(tile)) this.unavailable.set(failedTiles.size > 0);
          };
          leaflet
            .tileLayer(environment.mapTilesUrl, {
              maxZoom: 19,
              attribution: '© <a href="https://www.openstreetmap.org/copyright">colaboradores de OpenStreetMap</a>',
            })
            .on('tileerror', ({ tile }) => {
              failedTiles.add(tile);
              this.unavailable.set(true);
            })
            .on('tileload', clearTileError)
            .on('tileunload', clearTileError)
            .addTo(map);
          leaflet
            .marker(point, {
              title: label,
              alt: label,
              icon: leaflet.divIcon({ className: 'geo-map-pin', iconSize: [22, 22], iconAnchor: [11, 11] }),
            })
            .addTo(map);
          observer = new ResizeObserver(() => map?.invalidateSize({ pan: false }));
          observer.observe(canvas);
        })
        .catch(() => {
          if (!destroyed) this.unavailable.set(true);
        });

      cleanup(() => {
        destroyed = true;
        observer?.disconnect();
        map?.remove();
      });
    });
  }
}
