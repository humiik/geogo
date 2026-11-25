import { Component, DestroyRef, Inject, computed, inject, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonProgressBar,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  compassOutline,
  flagOutline,
  locationOutline,
  peopleOutline,
  ribbonOutline,
  lockClosedOutline,
} from 'ionicons/icons';

import { AnimatedNumberComponent } from '../components/animated-number/animated-number.component';
import { ThemeToggleComponent } from '../components/theme-toggle/theme-toggle.component';
import type { Country } from '../models/country';
import { xpPerAnswer } from '../models/progress';
import type { QuizMode, QuizRound } from '../models/quiz';
import { questionsPerRound, quizModes } from '../models/quiz';
import { CountryService } from '../services/country.service';
import { QuizService } from '../services/quiz.service';
import { StorageService } from '../services/storage.service';

interface FlagImage {
  id: number;
  src: string;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    AnimatedNumberComponent,
    ThemeToggleComponent,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
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
  protected readonly modeIcons: Record<QuizMode, string> = {
    flags: 'flag-outline',
    capitals: 'location-outline',
    population: 'people-outline',
    regions: 'compass-outline',
  };
  protected readonly levelUp = signal(false);
  protected readonly questionCount = questionsPerRound;
  protected readonly countries = signal<readonly Country[]>([]);
  protected readonly state = signal<'loading' | 'loaded' | 'error'>('loading');
  protected readonly round = signal<QuizRound | null>(null);
  protected readonly index = signal(0);
  protected readonly selected = signal<string | null>(null);
  protected readonly score = signal(0);
  protected readonly modeError = signal(false);
  protected readonly flagImage = signal<FlagImage | null>(null);
  protected readonly flagStatus = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly question = computed(() => this.round()?.questions[this.index()]);
  protected readonly correctLabel = computed(() => {
    const question = this.question();
    return question?.options.find((option) => option.id === question.answerId)?.label;
  });

  // Las preguntas se generan con los países del catálogo.
  constructor(@Inject(CountryService) private readonly countryService: CountryService) {
    addIcons({ compassOutline, flagOutline, locationOutline, peopleOutline, ribbonOutline, lockClosedOutline });
  }

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
    this.levelUp.set(false);
    this.index.set(0);
    this.score.set(0);
    this.selected.set(null);
    const round = this.quiz.createRound(mode, this.countries());
    this.modeError.set(round === null);
    this.round.set(round);
    this.retryFlag();
  }

  protected retryFlag(): void {
    const flag = this.question()?.flag;
    if (flag) {
      this.showFlag(flag.primary);
    } else {
      this.flagImage.set(null);
    }
  }

  protected flagLoaded(image: FlagImage): void {
    if (image === this.flagImage()) this.flagStatus.set('ready');
  }

  protected flagFailed(image: FlagImage): void {
    if (image !== this.flagImage()) return;
    const fallback = this.question()?.flag?.fallback;
    if (fallback && fallback !== image.src) {
      this.showFlag(fallback);
    } else {
      this.flagStatus.set('error');
    }
  }

  protected setSegment(value: unknown): void {
    if (value === 'games' || value === 'stats') this.segment.set(value);
  }

  protected answer(id: string): void {
    const question = this.question();
    if (!question || this.selected() !== null || !question.options.some((option) => option.id === id)) return;
    if (question.flag && this.flagStatus() !== 'ready') return;
    this.selected.set(id);
    if (id === question.answerId) this.score.update((score) => score + 1);
    const round = this.round();
    if (round && this.index() + 1 === round.questions.length) {
      const levelBefore = this.progress().level.name;
      this.storage.recordRound({ id: round.id, mode: round.mode, correct: this.score() });
      this.levelUp.set(this.progress().level.name !== levelBefore);
    }
  }

  protected next(): void {
    if (this.selected() === null) return;
    this.selected.set(null);
    this.index.update((index) => index + 1);
    this.retryFlag();
  }

  private showFlag(src: string): void {
    this.flagStatus.set('loading');
    this.flagImage.update((image) => ({ id: (image?.id ?? 0) + 1, src }));
  }
}
