export const quizModes = [
  { id: 'flags', title: 'Adiviná la bandera', description: 'Identificá el país de cada bandera.' },
  { id: 'capitals', title: 'Capitales del mundo', description: 'Elegí una capital del país indicado.' },
  { id: 'population', title: 'Mayor población', description: 'Encontrá el país con más habitantes.' },
  { id: 'regions', title: 'Descubrí la región', description: 'Ubicá cada país en el mapa del mundo.' },
] as const;

export type QuizMode = (typeof quizModes)[number]['id'];

export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  answerId: string;
  flag?: { primary: string; fallback?: string };
}

export interface QuizRound {
  id: string;
  mode: QuizMode;
  questions: QuizQuestion[];
}

export const questionsPerRound = 5;
