import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import type { Country } from '../models/country';
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

  it('loads countries on entry and shares the response with later subscribers', () => {
    expect(component).toBeTruthy();
    const http = TestBed.inject(HttpTestingController);
    const request = http.expectOne((req) => req.method === 'GET' && req.url === `${environment.countriesApiUrl}/all`);
    const countries: Country[] = [
      {
        cca3: 'ARG',
        name: { common: 'Argentina', official: 'Argentine Republic' },
        flags: { png: 'arg.png', svg: 'arg.svg' },
        capital: ['Buenos Aires'],
        region: 'Americas',
        population: 47000000,
        area: 2780400,
      },
      {
        cca3: 'ATA',
        name: { common: 'Antarctica', official: 'Antarctica' },
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
    expect(cards[0].textContent).toContain('Argentina');
    expect(cards[0].textContent).toContain('Buenos Aires');
    expect(cards[0].textContent).toContain('Americas');
    expect(cards[0].querySelector('img')?.getAttribute('alt')).toBe('Bandera de Argentina');
    expect(cards[1].textContent).toContain('Sin datos');
    expect(cards[1].querySelector('img')?.getAttribute('src')).toBe('ata.png');
    const subscriber = vi.fn();
    TestBed.inject(CountryService).countries$.subscribe(subscriber);
    expect(subscriber).toHaveBeenCalledWith(countries);
    http.verify();
  });
});
