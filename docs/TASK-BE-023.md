# TASK-BE-023: Алгоритм повторення слів

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| Визначення наступної дати повторення | Done (`nextReview`) |
| Підтримка рівнів Easy / Medium / Hard | Done |
| Автоматичний розрахунок інтервалів | Done |

## Модуль

`v2-core/srs/spaced-repetition.ts` — спільний SRS-движок для API та сервісів.

## Рівні оцінки

| Рівень | API | UI (Smart Review) | Ефект |
|--------|-----|-------------------|--------|
| **Hard** | `hard` | Hard | Коротший інтервал, `ease − 0.15` |
| **Medium** | `medium` | Good | Стандартний SM-2 крок |
| **Easy** | `easy` | Easy | Довший інтервал, `ease + 0.15` |
| (додатково) | `again` | Again | Повтор через **10 хв**, скидання прогресу |

`normalizeReviewRating()` приймає також alias `good` → `medium`.

## Розрахунок інтервалів

Початковий стан: `repetitions = 0`, `ease = 2.5`, `interval = 0`.

| Рівень | Логіка інтервалу (дні) |
|--------|------------------------|
| **again** | `nextReview = now + 10 хв` |
| **hard** | `1` день (1-ше повторення), далі `interval × 1.2` |
| **medium** | `1` → `3` → `interval × ease` |
| **easy** | `3` → `interval × ease × 1.3` |

Інтервал обмежений **1–120 днів**. `nextReview` — початок календарного дня (00:00), крім `again` (точний час).

## API

```ts
import {
  applySpacedRepetition,
  calculateNextReview,
  type ReviewLevel,
  type SrsReviewState,
} from '../v2-core/srs/spaced-repetition';

const state: SrsReviewState = {
  repetitions: 2,
  ease: 2.5,
  interval: 3,
  nextReview: 1782298468333,
};

const outcome = applySpacedRepetition(state, 'medium');
// outcome.nextReview — наступна дата (Unix ms)
// outcome.intervalDays — інтервал у днях
// outcome.repetitions, outcome.ease — оновлений стан
```

Опційно: `ReviewModifiers` (`intervalMultiplier`, `easeDelta`) для слабких слів — як у `getReviewModifiers()` на фронтенді.

## Відповідність UI

Логіка ідентична `app/lib/flashcardSrs.ts` (`applySmartReview`), де `medium` = `good`.

## Файли

| Файл | Роль |
|------|------|
| `v2-core/srs/spaced-repetition.ts` | Алгоритм SRS |
| `app/lib/flashcardSrs.ts` | UI-обгортка (поки окремо) |

## Перевірка

```bash
# Після npm run build — модуль типізується разом із проєктом
node --input-type=module -e "
import {
  applySpacedRepetition,
  calculateNextReview,
} from './v2-core/srs/spaced-repetition.ts';

const base = { repetitions: 0, ease: 2.5, interval: 0 };
console.log('medium #1', applySpacedRepetition(base, 'medium').intervalDays);
console.log('easy #1', applySpacedRepetition(base, 'easy').intervalDays);
console.log('hard', applySpacedRepetition({ repetitions: 2, ease: 2.5, interval: 7 }, 'hard').intervalDays);
console.log('next', calculateNextReview(base, 'medium'));
"
```

Очікування: medium → 1 день, easy → 3 дні, hard після interval 7 → ~8 днів.
