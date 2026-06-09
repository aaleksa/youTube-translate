export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface VideoQuiz {
  questions: QuizQuestion[];
}

export interface QuizResult {
  total: number;
  correct: number;
  percentage: number;
}

export function parseQuizResponse(raw: string): VideoQuiz | null {
  try {
    const parsed = JSON.parse(raw) as {
      questions?: Array<{
        id?: string;
        question?: string;
        options?: string[];
        correctIndex?: number;
        explanation?: string;
      }>;
    };

    if (!Array.isArray(parsed.questions)) return null;

    const questions: QuizQuestion[] = [];

    for (let i = 0; i < parsed.questions.length; i++) {
      const item = parsed.questions[i];
      const question = item.question?.trim();
      const options = item.options?.map((o) => o.trim()).filter(Boolean);
      const correctIndex = item.correctIndex;
      const explanation = item.explanation?.trim();

      if (
        !question ||
        !options ||
        options.length < 2 ||
        options.length > 6 ||
        typeof correctIndex !== 'number' ||
        correctIndex < 0 ||
        correctIndex >= options.length ||
        !explanation
      ) {
        continue;
      }

      questions.push({
        id: item.id?.trim() || `q${i + 1}`,
        question,
        options,
        correctIndex,
        explanation,
      });
    }

    if (questions.length < 5) return null;

    return { questions: questions.slice(0, 10) };
  } catch {
    return null;
  }
}

export function scoreQuiz(
  questions: QuizQuestion[],
  answers: Record<string, number | undefined>
): QuizResult {
  let correct = 0;

  for (const question of questions) {
    if (answers[question.id] === question.correctIndex) {
      correct++;
    }
  }

  const total = questions.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return { total, correct, percentage };
}
