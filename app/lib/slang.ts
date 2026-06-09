export interface SlangItem {
  expression: string;
  meaning: string;
  formality: string;
  example: string;
}

export function parseSlangResponse(raw: string): SlangItem[] {
  try {
    const parsed = JSON.parse(raw) as {
      slang?: Array<{
        expression?: string;
        word?: string;
        meaning?: string;
        translation?: string;
        formality?: string;
        example?: string;
      }>;
    };

    if (!Array.isArray(parsed.slang)) return [];

    const unique = new Map<string, SlangItem>();

    for (const item of parsed.slang) {
      const expression = (item.expression ?? item.word)?.trim();
      const meaning = (item.meaning ?? item.translation)?.trim();
      const formality = item.formality?.trim();
      const example = item.example?.trim();

      if (!expression || !meaning || !formality) continue;

      const key = expression.toLowerCase();
      if (!unique.has(key)) {
        unique.set(key, {
          expression,
          meaning,
          formality,
          example: example || expression,
        });
      }
    }

    return Array.from(unique.values());
  } catch {
    return [];
  }
}

export function getFormalityLabel(formality: string): string {
  const lower = formality.toLowerCase().trim();

  if (lower.includes('vulgar') || lower.includes('груб')) return 'Грубий';
  if (lower.includes('very informal') || lower.includes('дуже неформ'))
    return 'Дуже неформальний';
  if (lower.includes('informal') || lower.includes('неформ'))
    return 'Неформальний';
  if (lower.includes('slang') || lower.includes('сленг')) return 'Сленг';
  if (lower.includes('neutral') || lower.includes('нейтрал')) return 'Нейтральний';
  if (lower.includes('formal') || lower.includes('формальн')) return 'Формальний';

  return formality;
}

export function getFormalityStyle(formality: string): string {
  const lower = formality.toLowerCase();

  if (lower.includes('vulgar') || lower.includes('груб')) {
    return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
  }
  if (lower.includes('very informal') || lower.includes('дуже неформ')) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300';
  }
  if (lower.includes('slang') || lower.includes('сленг')) {
    return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
  }
  if (lower.includes('informal') || lower.includes('неформ')) {
    return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
  }

  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}
