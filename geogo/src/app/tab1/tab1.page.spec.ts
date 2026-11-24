import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
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
    const countries = [
      {
        cca3: 'ARG',
        name: { common: 'Argentina', official: 'Argentine Republic' },
        flags: { png: 'arg.png', svg: 'arg.svg' },
        region: 'Americas',
        population: 47000000,
        area: 2780400,
      },
    ];
    request.flush(countries);
    fixture.detectChanges();

    const view: HTMLElement = fixture.nativeElement;
    expect(view.querySelector('[role="status"]')?.textContent).toContain('1');
    const subscriber = vi.fn();
    TestBed.inject(CountryService).countries$.subscribe(subscriber);
    expect(subscriber).toHaveBeenCalledWith(countries);
    http.verify();
  });
});
