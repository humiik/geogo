import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { compareMetric } from '../models/country-metrics';
import { CountryService } from '../services/country.service';

import { Tab2Page } from './tab2.page';

describe('Tab2Page', () => {
  let component: Tab2Page;
  let fixture: ComponentFixture<Tab2Page>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [{ provide: CountryService, useValue: { countries$: of([]) } }] });
    fixture = TestBed.createComponent(Tab2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calcula diferencias y protege los casos sin datos o con referencia cero', () => {
    expect(compareMetric(10, 20)).toMatchObject({ difference: 10, percent: 100, firstBar: 0.5, secondBar: 1 });
    expect(compareMetric(0, 20)).toMatchObject({ difference: 20, percent: null });
    expect(compareMetric(20, null)).toMatchObject({ difference: null, percent: null, firstBar: 0, secondBar: 0 });
  });
});
