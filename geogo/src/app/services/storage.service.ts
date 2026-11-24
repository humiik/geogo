import { Injectable, computed, signal } from '@angular/core';

import type { QuizResult } from '../models/progress';
import { isQuizResult, playerProgress } from '../models/progress';

const favoritesKey = 'geogo.favorites.v1';
const resultPrefix = 'geogo.result.v1.';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly memory = new Map<string, unknown>();
  private readonly favoriteCodes = signal<ReadonlySet<string>>(new Set(this.readFavorites()));
  private readonly results = signal<readonly QuizResult[]>(this.readResults());
  readonly favorites = this.favoriteCodes.asReadonly();
  readonly progress = computed(() => playerProgress(this.results()));

  toggleFavorite(code: string): void {
    const codes = new Set(this.readFavorites());
    if (codes.has(code)) codes.delete(code);
    else codes.add(code);
    this.write(favoritesKey, [...codes]);
    this.favoriteCodes.set(codes);
  }

  recordRound(result: QuizResult): void {
    if (!isQuizResult(result)) return;
    const key = resultPrefix + result.id;
    // Cada partida tiene su propia clave y solo puede contabilizarse una vez.
    if (!isQuizResult(this.read(key))) this.write(key, result);
    this.results.set(this.readResults());
  }

  private readResults(): QuizResult[] {
    const keys = new Set(this.memory.keys());
    try {
      for (const key of Object.keys(globalThis.localStorage)) keys.add(key);
    } catch {
      // Se conservan los resultados de esta sesión.
    }
    return [...keys]
      .filter((key) => key.startsWith(resultPrefix))
      .map((key) => this.read(key))
      .filter(isQuizResult);
  }

  private readFavorites(): string[] {
    const saved = this.read(favoritesKey);
    return Array.isArray(saved) ? saved.filter((code): code is string => typeof code === 'string') : [];
  }

  private read(key: string): unknown {
    if (this.memory.has(key)) return this.memory.get(key);
    try {
      const saved = globalThis.localStorage.getItem(key);
      return saved === null ? undefined : JSON.parse(saved);
    } catch {
      return undefined;
    }
  }

  private write(key: string, value: unknown): void {
    try {
      globalThis.localStorage.setItem(key, JSON.stringify(value));
      this.memory.delete(key);
    } catch {
      // La sesión sigue funcionando si el navegador restringe el almacenamiento.
      this.memory.set(key, value);
    }
  }
}
