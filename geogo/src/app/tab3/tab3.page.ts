import { Component, DestroyRef, Inject, computed, inject, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonLabel,
  IonProgressBar,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import type { Country } from '../models/country';
import { xpPerAnswer } from '../models/progress';
import type { QuizMode, QuizRound } from '../models/quiz';
import { questionsPerRound, quizModes } from '../models/quiz';
import { CountryService } from '../services/country.service';
import { QuizService } from '../services/quiz.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonLabel,
    IonProgressBar,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab3Page implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly quiz = inject(QuizService);
  private readonly storage = inject(StorageService);
  protected readonly progress = this.storage.progress;
  protected readonly xpPerAnswer = xpPerAnswer;
  protected readonly segment = signal<'games' | 'stats'>('games');
  protected readonly modes = quizModes;
  protected readonly questionCount = questionsPerRound;
  protected readonly countries = signal<readonly Country[]>([]);
  protected readonly state = signal<'loading' | 'loaded' | 'error'>('loading');
  protected readonly round = signal<QuizRound | null>(null);
  protected readonly index = signal(0);
  protected readonly selected = signal<string | null>(null);
  protected readonly score = signal(0);
  protected readonly modeError = signal(false);
  protected readonly question = computed(() => this.round()?.questions[this.index()]);
  protected readonly correctLabel = computed(() => {
    const question = this.question();
    return question?.options.find((option) => option.id === question.answerId)?.label;
  });

  // eslint-disable-next-line @angular-eslint/prefer-inject -- Requisito de evaluación: inyección por constructor.
  constructor(@Inject(CountryService) private readonly countryService: CountryService) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  protected loadCountries(): void {
    this.state.set('loading');
    this.countryService.countries$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (countries) => {
        this.countries.set(countries);
        this.state.set('loaded');
      },
      error: () => this.state.set('error'),
    });
  }

  protected play(mode: QuizMode): void {
    this.index.set(0);
    this.score.set(0);
    this.selected.set(null);
    const round = this.quiz.createRound(mode, this.countries());
    this.modeError.set(round === null);
    this.round.set(round);
  }

  protected setSegment(value: unknown): void {
    if (value === 'games' || value === 'stats') this.segment.set(value);
  }

  protected answer(id: string): void {
    const question = this.question();
    if (!question || this.selected() !== null || !question.options.some((option) => option.id === id)) return;
    this.selected.set(id);
    if (id === question.answerId) this.score.update((score) => score + 1);
    const round = this.round();
    if (round && this.index() + 1 === round.questions.length) {
      this.storage.recordRound({ id: round.id, mode: round.mode, correct: this.score() });
    }
  }

  protected next(): void {
    if (this.selected() === null) return;
    this.selected.set(null);
    this.index.update((index) => index + 1);
  }
}
