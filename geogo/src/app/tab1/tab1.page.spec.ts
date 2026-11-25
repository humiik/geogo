import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import type { RestCountry } from '../models/country';
import { CountryService } from '../services/country.service';

import { Tab1Page } from './tab1.page';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carga y comparte los datos en español sin cambiar sus códigos ni cifras', () => {
    expect(component).toBeTruthy();
    const http = TestBed.inject(HttpTestingController);
    const request = http.expectOne((req) => req.method === 'GET' && req.url === `${environment.countriesApiUrl}/all`);
    expect(request.request.params.get('fields')?.split(',')).toContain('translations');
    const countries: RestCountry[] = [
      {
        cca3: 'ARG',
        translations: { spa: { common: 'Argentina', official: 'República Argentina' } },
        flags: { png: 'arg.png', svg: 'arg.svg', alt: 'The flag of Argentina' },
        capital: ['Buenos Aires'],
        region: 'Americas',
        subregion: 'South America',
        languages: { spa: 'Spanish', glc: 'Galician', dzo: 'Dzongkha' },
        currencies: { ARS: { name: 'Argentine peso', symbol: '$' } },
        population: 47000000,
        area: 2780400,
      },
      {
        cca3: 'ATA',
        translations: { spa: { common: 'Antártida' } },
        flags: { png: 'ata.png', svg: '' },
        capital: [],
        region: 'Antarctic',
        population: 0,
        area: 14000000,
      },
    ];
    request.flush(countries);
    fixture.detectChanges();

    const view: HTMLElement = fixture.nativeElement;
    const cards = view.querySelectorAll('app-country-card');
    expect(cards).toHaveLength(2);
    expect(cards[0].textContent).toContain('Sin datos');
    expect(cards[0].querySelector('img')?.getAttribute('src')).toBe('ata.png');
    expect(cards[1].textContent).toContain('Argentina');
    expect(cards[1].textContent).toContain('Buenos Aires');
    expect(cards[1].textContent).toContain('América');
    expect(cards[1].querySelector('img')?.getAttribute('alt')).toBe('Bandera de Argentina');
    const subscriber = vi.fn();
    TestBed.inject(CountryService).countries$.subscribe(subscriber);
    expect(subscriber).toHaveBeenCalledWith([
      expect.objectContaining({
        cca3: 'ARG',
        name: { common: 'Argentina', official: 'República Argentina' },
        region: 'América',
        subregion: 'América del Sur',
        languages: { spa: 'español', glc: 'gallego', dzo: 'dzongkha' },
        currencies: { ARS: { name: 'peso argentino', symbol: '$' } },
        population: 47000000,
        area: 2780400,
      }),
      expect.objectContaining({ name: { common: 'Antártida', official: 'Antártida' }, capital: [] }),
    ]);
    http.verify();
  });

  it('conserva los países identificables cuando el catálogo trae registros incompletos', () => {
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((req) => req.url === `${environment.countriesApiUrl}/all`)
      .flush([
        null,
        { cca3: '', capital: ['Sin país'] },
        {
          cca3: 'ARG',
          translations: { spa: { common: 'Argentina' } },
          capital: 'Buenos Aires',
          population: '47000000',
          area: -1,
          flags: { svg: false },
        },
        { cca3: 'JPN', translations: { spa: { common: 'Japón' } }, capital: ['Tokyo', null], population: 0 },
      ]);
    fixture.detectChanges();

    const view: HTMLElement = fixture.nativeElement;
    expect(view.querySelectorAll('app-country-card')).toHaveLength(2);
    expect(view.querySelector('[role="alert"]')).toBeNull();
    const subscriber = vi.fn();
    TestBed.inject(CountryService).countries$.subscribe(subscriber);
    expect(subscriber).toHaveBeenCalledWith([
      expect.objectContaining({ cca3: 'ARG', capital: undefined, population: null, area: null }),
      expect.objectContaining({ cca3: 'JPN', capital: ['Tokio'], population: 0 }),
    ]);
    http.verify();
  });
});
