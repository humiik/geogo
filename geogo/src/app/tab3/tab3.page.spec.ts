import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import type { Country } from '../models/country';
import { quizModes } from '../models/quiz';
import { CountryService } from '../services/country.service';
import { QuizService } from '../services/quiz.service';
import { StorageService } from '../services/storage.service';

import { Tab3Page } from './tab3.page';

describe('Tab3Page', () => {
  let component: Tab3Page;
  let fixture: ComponentFixture<Tab3Page>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [{ provide: CountryService, useValue: { countries$: of([]) } }] });
    fixture = TestBed.createComponent(Tab3Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('genera cinco preguntas distintas con una única opción correcta en cada modalidad', () => {
    const countries: Country[] = ['ARG', 'AUS', 'BRA', 'CAN', 'CHL', 'COL', 'ESP', 'JPN'].map((code, index) => ({
      cca3: code,
      name: { common: code, official: code },
      flags: { svg: `${code}.svg`, png: '' },
      capital: [`Capital ${index}`, 'Capital compartida'],
      region: index % 2 ? 'América' : 'Asia',
      area: 1,
      population: 100 + index,
    }));
    const quiz = TestBed.inject(QuizService);
    for (const mode of quizModes) {
      const round = quiz.createRound(mode.id, countries);
      expect(round?.questions).toHaveLength(5);
      expect(new Set(round?.questions.map((question) => question.id)).size).toBe(5);
      for (const question of round?.questions ?? []) {
        expect(question.options.filter((option) => option.id === question.answerId)).toHaveLength(1);
        expect(new Set(question.options.map((option) => option.label)).size).toBe(question.options.length);
      }
    }
  });

  it('cuenta cada partida una sola vez incluso tras volver a leer el almacenamiento', () => {
    const key = 'geogo.result.v1.prueba';
    localStorage.removeItem(key);
    try {
      const storage = new StorageService();
      storage.recordRound({ id: 'prueba', mode: 'regions', correct: 5 });
      storage.recordRound({ id: 'prueba', mode: 'regions', correct: 1 });
      expect(new StorageService().progress()).toMatchObject({
        xp: 50,
        games: 1,
        accuracy: 100,
        records: { regions: 5 },
      });
    } finally {
      localStorage.removeItem(key);
    }
  });
});
