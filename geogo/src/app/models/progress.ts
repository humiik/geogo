import type { QuizMode } from './quiz';
import { questionsPerRound, quizModes } from './quiz';

export interface QuizResult {
  id: string;
  mode: QuizMode;
  correct: number;
}

export const xpPerAnswer = 10;

const levels = [
  { name: 'Principiante', xp: 0 },
  { name: 'Explorador', xp: 100 },
  { name: 'Aventurero', xp: 250 },
  { name: 'Trotamundos', xp: 500 },
  { name: 'Maestro geográfico', xp: 1000 },
];

type PlayerLevel = (typeof levels)[number];

interface PlayerProgress {
  xp: number;
  games: number;
  correct: number;
  records: Record<QuizMode, number | null>;
  badges: { name: string; description: string; earned: boolean }[];
  level: PlayerLevel;
  nextLevel?: PlayerLevel;
  accuracy: number;
  levelProgress: number;
}

export function isQuizResult(value: unknown): value is QuizResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    'mode' in value &&
    quizModes.some((mode) => mode.id === value.mode) &&
    'correct' in value &&
    typeof value.correct === 'number' &&
    Number.isInteger(value.correct) &&
    value.correct >= 0 &&
    value.correct <= questionsPerRound
  );
}

export function playerProgress(results: readonly QuizResult[]): PlayerProgress {
  const records: Record<QuizMode, number | null> = { flags: null, capitals: null, population: null, regions: null };
  let correct = 0;
  for (const result of results) {
    correct += result.correct;
    records[result.mode] = Math.max(records[result.mode] ?? 0, result.correct);
  }
  const games = results.length;
  const xp = correct * xpPerAnswer;
  const level = levels.reduce((current, candidate) => (candidate.xp <= xp ? candidate : current), levels[0]);
  const nextLevel = levels.find((candidate) => candidate.xp > xp);
  const badges = [
    { name: 'Primer viaje', description: 'Completá una partida.', earned: games > 0 },
    {
      name: 'Sin escalas',
      description: 'Conseguí cinco aciertos en una partida.',
      earned: Object.values(records).includes(questionsPerRound),
    },
    {
      name: 'Cuatro rumbos',
      description: 'Jugá las cuatro modalidades.',
      earned: Object.values(records).every((record) => record !== null),
    },
    { name: 'Coleccionista de mapas', description: 'Alcanzá 250 XP.', earned: xp >= 250 },
  ];
  return {
    xp,
    games,
    correct,
    records,
    badges,
    level,
    nextLevel,
    accuracy: games ? Math.round((correct / (games * questionsPerRound)) * 100) : 0,
    levelProgress: nextLevel ? (xp - level.xp) / (nextLevel.xp - level.xp) : 1,
  };
}
