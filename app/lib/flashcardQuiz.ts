import {
  getDueFlashcards,
  shuffleFlashcards,
  type Flashcard,
  type FlashcardView,
} from './flashcards';
import {
  getFlashcardTranslation,
  isTranslationSuitableForReverseQuiz,
} from './flashcardTranslations';
import type { TranslationLanguageCode } from './translationLanguages';

export type QuizQuestionType =
  | 'en-to-ua-mc'
  | 'ua-to-en-mc'
  | 'typing-en'
  | 'typing-ua';

export type QuizFormat = 'multiple-choice' | 'typing' | 'mixed';

export type QuizSource = 'due' | 'video' | 'deck' | 'weak' | 'all';

export interface QuizQuestion {
  id: string;
  cardId: string;
  card: Flashcard;
  type: QuizQuestionType;
  prompt: string;
  correctAnswer: string;
  options?: string[];
}

export interface QuizSessionSummary {
  total: number;
  correct: number;
  wrong: number;
  scorePercent: number;
  weakCards: Flashcard[];
}

export interface QuizAttempt {
  id: string;
  cardId: string;
  isCorrect: boolean;
  questionType: QuizQuestionType;
  createdAt: number;
}

const ATTEMPTS_KEY = 'yoytube-quiz-attempts';
const DEFAULT_QUESTION_COUNT = 10;
const MC_OPTION_COUNT = 4;

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function normalizeQuizAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isQuizAnswerCorrect(userAnswer: string, correctAnswer: string): boolean {
  return normalizeQuizAnswer(userAnswer) === normalizeQuizAnswer(correctAnswer);
}

export function getWeakFlashcards(cards: Flashcard[]): Flashcard[] {
  return cards.filter((card) => card.quizWrongCount > card.quizCorrectCount);
}

export function getQuizPool(
  cards: Flashcard[],
  options: {
    source: QuizSource;
    videoId?: string;
    deckId?: string;
    translationLanguage?: TranslationLanguageCode;
  }
): Flashcard[] {
  const translationLanguage = options.translationLanguage ?? 'uk';
  let pool = cards.filter(
    (card) =>
      card.word.trim() &&
      getFlashcardTranslation(card, translationLanguage).trim()
  );

  switch (options.source) {
    case 'due':
      pool = getDueFlashcards(pool);
      break;
    case 'video':
      if (!options.videoId) {
        pool = [];
      } else {
        pool = pool.filter((card) => card.videoId === options.videoId);
      }
      break;
    case 'deck': {
      const deckId = options.deckId;
      if (!deckId) {
        pool = [];
      } else {
        pool = pool.filter((card) => card.deckIds.includes(deckId));
      }
      break;
    }
    case 'weak':
      pool = getWeakFlashcards(pool);
      break;
    case 'all':
      break;
  }

  return pool;
}

export function resolveQuizSourceFromView(
  view: FlashcardView,
  selectedVideoId: string | null,
  selectedDeckId: string | null,
  activeVideoId?: string
): { source: QuizSource; videoId?: string; deckId?: string } {
  switch (view) {
    case 'due':
      return { source: 'due' };
    case 'video':
      return {
        source: 'video',
        videoId: selectedVideoId ?? activeVideoId,
      };
    case 'deck':
      return {
        source: 'deck',
        deckId: selectedDeckId ?? undefined,
      };
    default:
      return { source: 'all' };
  }
}

function pickDistractors(
  pool: Flashcard[],
  card: Flashcard,
  pickField: 'translation' | 'word',
  count: number,
  translationLanguage: TranslationLanguageCode
): string[] {
  const correct =
    pickField === 'translation'
      ? getFlashcardTranslation(card, translationLanguage)
      : card.word;
  const correctNorm = normalizeQuizAnswer(correct);

  const candidates = shuffleFlashcards(
    pool.filter((item) => {
      if (item.id === card.id) return false;
      const value =
        pickField === 'translation'
          ? getFlashcardTranslation(item, translationLanguage)
          : item.word;
      return (
        value.trim().length > 0 &&
        normalizeQuizAnswer(value) !== correctNorm
      );
    })
  );

  const unique = new Set<string>();
  const result: string[] = [];

  for (const item of candidates) {
    const value = (
      pickField === 'translation'
        ? getFlashcardTranslation(item, translationLanguage)
        : item.word
    ).trim();
    const key = normalizeQuizAnswer(value);
    if (unique.has(key)) continue;
    unique.add(key);
    result.push(value);
    if (result.length >= count) break;
  }

  return result;
}

function buildMultipleChoiceQuestion(
  card: Flashcard,
  pool: Flashcard[],
  type: 'en-to-ua-mc' | 'ua-to-en-mc',
  index: number,
  translationLanguage: TranslationLanguageCode
): QuizQuestion | null {
  const translation = getFlashcardTranslation(card, translationLanguage);
  const pickField = type === 'en-to-ua-mc' ? 'translation' : 'word';
  const prompt = type === 'en-to-ua-mc' ? card.word : translation;
  const correctAnswer = type === 'en-to-ua-mc' ? translation : card.word;

  if (!prompt.trim() || !correctAnswer.trim()) return null;

  if (
    type === 'ua-to-en-mc' &&
    !isTranslationSuitableForReverseQuiz(
      translation,
      card.word,
      translationLanguage
    )
  ) {
    return null;
  }

  const distractors = pickDistractors(
    pool,
    card,
    pickField,
    MC_OPTION_COUNT - 1,
    translationLanguage
  );
  if (distractors.length < MC_OPTION_COUNT - 1) return null;

  const options = shuffleArray(
    [correctAnswer.trim(), ...distractors].filter((value) => value.trim())
  );
  if (options.length < MC_OPTION_COUNT) return null;

  return {
    id: `quiz-${card.id}-${type}-${index}`,
    cardId: card.id,
    card,
    type,
    prompt: prompt.trim(),
    correctAnswer: correctAnswer.trim(),
    options,
  };
}

function buildTypingQuestion(
  card: Flashcard,
  type: 'typing-en' | 'typing-ua',
  index: number,
  translationLanguage: TranslationLanguageCode
): QuizQuestion {
  const translation = getFlashcardTranslation(card, translationLanguage);
  const prompt = type === 'typing-en' ? translation : card.word;
  const correctAnswer = type === 'typing-en' ? card.word : translation;

  return {
    id: `quiz-${card.id}-${type}-${index}`,
    cardId: card.id,
    card,
    type,
    prompt: prompt.trim(),
    correctAnswer: correctAnswer.trim(),
  };
}

function candidateQuestionTypes(
  format: QuizFormat,
  index: number,
  canUseMultipleChoice: boolean,
  card: Flashcard,
  translationLanguage: TranslationLanguageCode
): QuizQuestionType[] {
  const translation = getFlashcardTranslation(card, translationLanguage);
  const reverseOk = isTranslationSuitableForReverseQuiz(
    translation,
    card.word,
    translationLanguage
  );

  if (format === 'multiple-choice') {
    return canUseMultipleChoice ? ['en-to-ua-mc', 'typing-ua'] : ['typing-ua'];
  }

  if (format === 'typing') {
    const forward = index % 2 === 0 ? 'typing-ua' : 'typing-en';
    const backward = index % 2 === 0 ? 'typing-en' : 'typing-ua';
    return reverseOk ? [forward, backward] : ['typing-ua'];
  }

  const cycle: QuizQuestionType[] = ['en-to-ua-mc'];
  if (reverseOk) cycle.push('ua-to-en-mc');
  cycle.push('typing-ua');
  if (reverseOk) cycle.push('typing-en');

  const start = index % cycle.length;
  return [...cycle.slice(start), ...cycle.slice(0, start)];
}

function tryBuildQuestion(
  card: Flashcard,
  pool: Flashcard[],
  type: QuizQuestionType,
  index: number,
  translationLanguage: TranslationLanguageCode
): QuizQuestion | null {
  if (type === 'en-to-ua-mc' || type === 'ua-to-en-mc') {
    return buildMultipleChoiceQuestion(
      card,
      pool,
      type,
      index,
      translationLanguage
    );
  }

  const translation = getFlashcardTranslation(card, translationLanguage);
  if (type === 'typing-en') {
    if (
      !isTranslationSuitableForReverseQuiz(
        translation,
        card.word,
        translationLanguage
      )
    ) {
      return null;
    }
  }
  if (type === 'typing-ua' && (!card.word.trim() || !translation.trim())) {
    return null;
  }

  return buildTypingQuestion(card, type, index, translationLanguage);
}

export function buildQuizQuestions(
  pool: Flashcard[],
  options: {
    count?: number;
    format?: QuizFormat;
    translationLanguage?: TranslationLanguageCode;
  } = {}
): QuizQuestion[] {
  const translationLanguage = options.translationLanguage ?? 'uk';
  const count = Math.min(options.count ?? DEFAULT_QUESTION_COUNT, pool.length);
  if (count === 0) return [];

  const format = options.format ?? 'multiple-choice';
  const selectedCards = shuffleFlashcards(pool).slice(0, count);
  const canUseMultipleChoice = pool.length >= MC_OPTION_COUNT;

  const questions: QuizQuestion[] = [];

  for (const [index, card] of selectedCards.entries()) {
    const types = candidateQuestionTypes(
      format,
      index,
      canUseMultipleChoice,
      card,
      translationLanguage
    );

    let question: QuizQuestion | null = null;
    for (const type of types) {
      question = tryBuildQuestion(
        card,
        pool,
        type,
        index,
        translationLanguage
      );
      if (question) break;
    }

    if (question) {
      questions.push(question);
    }
  }

  return questions;
}

export function summarizeQuizSession(
  results: Array<{ card: Flashcard; isCorrect: boolean }>
): QuizSessionSummary {
  const correct = results.filter((item) => item.isCorrect).length;
  const wrong = results.length - correct;
  const weakCards = results
    .filter((item) => !item.isCorrect)
    .map((item) => item.card);

  const uniqueWeak = new Map<string, Flashcard>();
  for (const card of weakCards) {
    uniqueWeak.set(card.id, card);
  }

  return {
    total: results.length,
    correct,
    wrong,
    scorePercent: results.length > 0 ? Math.round((correct / results.length) * 100) : 0,
    weakCards: [...uniqueWeak.values()],
  };
}

export function getQuizAttempts(): QuizAttempt[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as QuizAttempt[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function restoreQuizAttempts(attempts: QuizAttempt[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    ATTEMPTS_KEY,
    JSON.stringify(Array.isArray(attempts) ? attempts.slice(0, 200) : [])
  );
}

export function saveQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'createdAt'>): void {
  if (typeof window === 'undefined') return;

  const entry: QuizAttempt = {
    id: `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    ...attempt,
  };

  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as QuizAttempt[]) : [];
    const next = Array.isArray(parsed) ? [entry, ...parsed].slice(0, 200) : [entry];
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(next));
  } catch {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify([entry]));
  }
}
