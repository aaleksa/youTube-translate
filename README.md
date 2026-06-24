# YoyTube Translaty

**Платформа для вивчення англійської мови з YouTube-відео** — екстракція субтитрів, AI-аналіз контенту, флешкартки, інтервальне повторення (SRS), квізи, shadowing, вимова та аналітика прогресу.

Додаток працює як **PWA** (Progressive Web App): дані зберігаються локально в браузері, без окремого бекенд-сервера для користувацьких даних.

📖 **Посібник для користувачів:** [USER_GUIDE.md](./USER_GUIDE.md) (українською) · [USER_GUIDE.en.md](./USER_GUIDE.en.md) (English) — покроковий опис усіх функцій без технічних деталей.

🇬🇧 **English README:** [README.en.md](./README.en.md)

🗄️ **Локальний backend (без AWS):** [docs/LOCAL_BACKEND.md](./docs/LOCAL_BACKEND.md)

---

## Цілі проєкту

### Головна мета

Допомогти користувачам **вивчати англійську з реального відеоконтенту** — не просто переглядати субтитри, а перетворювати їх на структурований навчальний матеріал з відстеженням прогресу.

### Ключові цілі

| Ціль | Опис |
|------|------|
| **Екстракція контенту** | Отримання субтитрів з YouTube (ручні та автоматичні), нормалізація, розбиття на речення та фрази |
| **AI-підсилення** | Аналіз транскрипту: фразові дієслова, ідіоми, сленг, граматика, ключова лексика, резюме, тести |
| **Активне навчання** | Флешкартки з контекстом відео, SRS-повторення, квізи, shadowing, перевірка вимови |
| **Персоналізація** | План навчання (Coach), слабкі слова, адаптивні інтервали, цілі за рівнем |
| **Автономність** | Локальне зберігання, офлайн-режим (PWA), імпорт/експорт даних |
| **Багатомовність** | Інтерфейс і переклади: uk, en, pl, es, de, fr |

### Цільова аудиторія

- Україномовні (та інші) вчні англійської, які дивляться YouTube для навчання
- Рівні: beginner → intermediate → advanced (налаштовується в цілях навчання)

---

## Технологічний стек

### Frontend

| Технологія | Версія | Призначення |
|------------|--------|-------------|
| **Next.js** | 16.2.7 | App Router, SSR/CSR, API Routes |
| **React** | 19.2.4 | UI-компоненти |
| **TypeScript** | 5.x | Типізація |
| **Tailwind CSS** | 4.x | Стилізація, dark/light theme |
| **Serwist** | 9.5.11 | PWA, Service Worker, офлайн-кеш |

### Backend (API Routes)

| Технологія | Призначення |
|------------|-------------|
| **Next.js API Routes** | REST-ендпоінти для транскриптів та AI |
| **OpenAI API** (`openai` 6.x) | ChatGPT для аналізу тексту, збагачення карток |
| **yt-dlp** (системна залежність) | Екстракція субтитрів з YouTube |
| **youtube-transcript** / **youtube-transcript-api** | Альтернативні методи отримання субтитрів |
| **yt-dlp-wrap** | Node.js обгортка для yt-dlp |
| **axios** | HTTP-запити |
| **jsdom** + **@mozilla/readability** | Парсинг веб-контенту (де потрібно) |
| **html2pdf.js** | Експорт у PDF |

### Інструменти розробки

| Інструмент | Призначення |
|------------|-------------|
| **ESLint** + `eslint-config-next` | Лінтинг |
| **Playwright** | Responsive E2E тести (`npm run test:responsive`) |
| **sharp** | Генерація PWA-іконок |

### Зовнішні сервіси

| Сервіс | Використання |
|--------|--------------|
| **YouTube** | Відео, субтитри (через yt-dlp / transcript API) |
| **OpenAI** | AI-аналіз, збагачення карток, пояснення речень |
| **Web Speech API** | Розпізнавання мови для pronunciation checker |

### Зберігання даних

Усі користувацькі дані — **localStorage** у браузері (без серверної БД):

| Ключ | Дані |
|------|------|
| `yoytube-flashcards` | Флешкартки |
| `yoytube-decks` | Колоди |
| `yoytube-quiz-attempts` | Спроби квізів |
| `yoytube-pronunciation-attempts` | Спроби вимови / shadowing |
| `yoytube-daily-study-log` | Щоденний журнал навчання |
| `yoytube-learning-goals` | Цілі (daily goal, vocabulary goal, рівень) |
| `yoytube-learning-settings` | Налаштування навчання |
| `yoytube-transcript-cache-*` | Кеш транскриптів |
| `yoytube-transcript-history` | Історія переглянутих відео |
| AI-кеші (`*-cache-*`) | Кеш результатів AI-аналізу по videoId |

---

## Архітектура

```
┌─────────────────────────────────────────────────────────────────┐
│                        Браузер (PWA)                            │
├─────────────────────────────────────────────────────────────────┤
│  page.tsx                                                       │
│    ├── URLInput / VideoPlayer / TranscriptDisplay               │
│    ├── QuickInfoAnalysis (AI-панелі)                            │
│    ├── ShadowingPanel / PronunciationChecker                    │
│    ├── LearningHubSection                                       │
│    │     ├── Coach (LearningCoachPanel)                         │
│    │     ├── Flashcards (FlashcardsPanel + Study/Quiz)          │
│    │     └── Analytics (LearningAnalyticsPanel)                 │
│    └── AppSettingsPanel (мови, імпорт/експорт, цілі)            │
├─────────────────────────────────────────────────────────────────┤
│  lib/ — бізнес-логіка (flashcards, SRS, quiz, analytics…)     │
│  localStorage — персистентність                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP
┌──────────────────────────▼──────────────────────────────────────┐
│  app/api/ — Next.js API Routes                                  │
│    ├── transcript/        — субтитри (yt-dlp)                   │
│    ├── process-text/      — загальний AI-чат                    │
│    ├── enrich-flashcard/  — AI-збагачення карток                │
│    ├── find-phrasal-verbs/, find-idioms/, find-slang/…          │
│    ├── generate-quiz/, generate-chapters/, video-summary/…      │
│    └── translate-lines/, explain-sentence/…                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │  YouTube  │  OpenAI   │
              └───────────┴───────────┘
```

---

## Модулі та функціональність

### 1. Транскрипції та відео

**Файли:** `app/api/transcript/`, `app/lib/youtubeSubtitles.ts`, `app/lib/normalizeCaptions.ts`, `app/lib/transcriptPipeline.ts`

- Витягування субтитрів з YouTube URL (VTT, SRT, JSON)
- Вибір мови субтитрів (ручні / auto-generated)
- Нормалізація: рядки → речення → фрази (chunks) → абзаци
- Shadowing units: Easy (4–10 слів), Normal (речення), Advanced (абзаци)
- Синхронізація з відеоплеєром (активний рядок, seek по кліку)
- Кеш транскриптів та історія переглядів
- Плейлисти: завантаження серії відео

**Компоненти:** `URLInput`, `VideoPlayer`, `TranscriptDisplay`, `VideoControls`, `PlaylistPanel`, `TranscriptHistorySearch`

---

### 2. AI-аналіз контенту

**Файли:** `app/lib/aiPrompts.ts`, `app/lib/aiChat.ts`, `app/api/*`

| Функція | API | Опис |
|---------|-----|------|
| Фразові дієслова | `/api/find-phrasal-verbs` | Пошук phrasal verbs у транскрипті |
| Ідіоми | `/api/find-idioms` | Ідіоматичні вирази |
| Сленг | `/api/find-slang` | Розмовні вирази |
| Ключова лексика | `/api/find-key-vocabulary` | 15–30 найкорисніших слів |
| Частотні слова | `/api/find-frequent-words` | Топ слів з перекладом |
| Колокації | `/api/find-collocations` | Словосполучення |
| Корисні фрази | `/api/find-useful-phrases` | Готові фрази для вивчення |
| Граматика | `/api/grammar-highlights` | Граматичні конструкції |
| Резюме відео | `/api/video-summary` | Короткий зміст |
| Складність | `/api/video-difficulty` | Оцінка CEFR-рівня відео |
| Глави | `/api/generate-chapters` | Розбиття на розділи |
| Таймлайн | `/api/generate-timeline` | Ключові моменти |
| Нотатки | `/api/generate-notes` | Конспект |
| Квіз по відео | `/api/generate-quiz` | Питання по контенту |
| Переклад рядків | `/api/translate-lines` | Пакетний переклад субтитрів |
| Пояснення речення | `/api/explain-sentence` | AI-пояснення граматики/лексики |
| Довільний чат | `/api/process-text` | TextProcessor — вільні запити |

Результати кешуються в localStorage по `videoId` + мова.

**Компоненти:** `TextProcessor`, `QuickInfoAnalysis`, `VocabularyAnalysis`, `VideoDifficultyPanel`, `VideoChaptersPanel`, `VideoTimelinePanel`, `VideoNotesPanel`, `VideoQuizPanel`, `SentenceExplanation`, `SelectionAnalysis`, `SelectionTranslate`

---

### 3. Флешкартки

**Файли:** `app/lib/flashcards.ts`, `app/lib/decks.ts`, `app/lib/sentenceStore.ts`

#### Модель картки (`Flashcard`)

```ts
{
  id, word, translation, translations?, translationLanguage?,
  example, originalExample?, tags[], videoId?, videoUrl?, videoTitle?,
  deckIds[], sentenceId?, timestamp?,
  explanation?, partOfSpeech?, level?, synonyms?, ipa?, enrichmentStatus?,
  knownCount, unknownCount, quizCorrectCount, quizWrongCount,
  repetitions, ease, interval, nextReview?,
  createdAt, updatedAt?, lastReviewedAt?
}
```

#### Можливості

- Збереження слова з виділення в транскрипті або AI-списків
- Прив'язка до відео, речення, таймкоду
- Колоди (decks) та фільтри: all / due / video / deck
- Bulk save з AI-списків vocabulary
- Редагування, теги, багатомовні переклади
- Дії на картці: слухати, дивитись у відео, повторити, shadowing

**Компоненти:** `SaveFlashcardModal`, `EditFlashcardModal`, `BulkSaveFlashcardModal`, `FlashcardsPanel`, `FlashcardExampleActions`

---

### 4. AI Card Enrichment (TASK-033)

**Файли:** `app/lib/flashcardEnrichment.ts`, `app/api/enrich-flashcard/route.ts`, `app/hooks/useDebouncedCardEnrichment.ts`

Автоматичне збагачення нових карток через OpenAI:

| Поле | Джерело |
|------|---------|
| `translation` | AI (якщо не вказано) |
| `example` | Субтитри (`originalExample`) пріоритетніше за AI |
| `explanation` | AI |
| `partOfSpeech` | AI |
| `level` (CEFR A1–C1) | AI |
| `synonyms`, `ipa` | AI |
| `tags` | AI (phrasal verb тощо) |

- Debounce 800 ms при введенні в модалці
- Bulk enrich до 20 карток
- Налаштування auto-enrich у `LearningSettings`
- Статус: `pending` | `completed` | `failed`

---

### 5. Spaced Repetition (SRS)

#### TASK-027: Basic SRS ✅

**Файл:** `app/lib/flashcardSrs.ts`

| Поле | Опис |
|------|------|
| `repetitions` | Кількість успішних повторень |
| `interval` | Поточний інтервал (дні) |
| `ease` | Коефіцієнт легкості (default 2.5) |
| `nextReview` | Timestamp наступного повторення |

**Стани картки:** `new` → `learning` → `review` → `mastered` (repetitions ≥ 7)

**Due Today:** `nextReview <= now`

**Черга:** сортування за `nextReview`, пріоритет слабких карток

#### TASK-032: Smart Review Engine (Advanced SRS) ✅

Замість простого Know / Don't know — **4-рівнева оцінка** (Anki-подібний SM-2):

| Оцінка | Ефект |
|--------|-------|
| **Again** | repetitions = 0, ease −0.2, повтор через **10 хв** |
| **Hard** | коротший інтервал, ease −0.15 |
| **Good** | стандартний SM-2 крок (1d → 3d → interval × ease) |
| **Easy** | довший інтервал, ease +0.15 |

**Адаптивні модифікатори** (`getReviewModifiers`):

- `unknownCount > knownCount` → interval × 0.7
- Низька точність квізу (`quizWrongCount`) → interval × 0.75
- Низький pronunciation score (< 60%) → interval × 0.8

**Пріоритет черги** (`getWeaknessScore`): слабкі слова, помилки в квізі, погана вимова

**Компонент:** `FlashcardStudyMode` — 4 кнопки Again / Hard / Good / Easy

---

### 6. Квізи по флешкартках

**Файл:** `app/lib/flashcardQuiz.ts`

| Параметр | Варіанти |
|----------|----------|
| Формат | multiple-choice, typing, mixed |
| Тип питання | en→translation MC, translation→en MC, typing EN, typing translation |
| Джерело | due, video, deck, weak, all |

- Оновлює `quizCorrectCount` / `quizWrongCount` на картці
- Спроби зберігаються в `yoytube-quiz-attempts`
- Впливає на Smart Review (модифікатори інтервалу)

**Компонент:** `FlashcardQuizMode`

---

### 7. Shadowing та вимова

**Файли:** `app/lib/shadowingChunks.ts`, `app/lib/pronunciationCompare.ts`, `app/lib/pronunciationAttempts.ts`, `app/lib/speechRecognition.ts`

- **Shadowing:** прослуховування фрази → пауза → повторення користувачем
- Режими: Easy (chunks), Normal (речення), Advanced (абзаци)
- **Pronunciation Checker:** Web Speech API + порівняння з еталоном
- Збереження спроб і best score по фразі
- Інтеграція з SRS (низький score → частіше повторення)

**Компоненти:** `ShadowingPanel`, `PronunciationChecker`

---

### 8. Learning Analytics (TASK-034)

**Файли:** `app/lib/learningAnalytics.ts`, `app/lib/dailyStudyLog.ts`

| Розділ | Метрики |
|--------|---------|
| Overview | картки, mastered, streak, quiz accuracy, SRS success rate |
| Recent activity | reviewed / correct / incorrect сьогодні |
| Weak words | слова з unknownCount > knownCount |
| Hardest words | найбільше помилок |
| Video progress | прогрес по відео (progress bar) |
| Deck progress | прогрес по колодах |
| Phrasal verbs | окремий розділ |
| Achievements | досягнення (streak, mastered тощо) |

**Mastered:** `getCardState(card) === 'mastered'` (repetitions ≥ 7)

**Компонент:** `LearningAnalyticsPanel`

---

### 9. Import / Export (TASK-035)

**Файли:** `app/lib/flashcardImportExport.ts`, `app/lib/flashcardBackup.ts`, `app/lib/csvUtils.ts`

| Формат | Опис |
|--------|------|
| **CSV** | word, translation, example, tags, SRS-поля (опційно) |
| **Anki CSV** | Front, Back, Example, Tags |
| **JSON backup** | cards + decks + dailyStudyLog + quizAttempts |

- Імпорт CSV з маппінгом колонок
- Стратегії дедуплікації: `skip` | `replace` | `merge`
- Повне відновлення з JSON backup

**Компонент:** `ImportExportSettings` (в налаштуваннях)

---

### 10. AI Learning Coach (TASK-036)

**Файли:** `app/lib/learningPlan.ts`, `app/lib/learningGoals.ts`

Rule-based план навчання (без LLM):

| Джерело даних | Що генерується |
|---------------|----------------|
| Due cards | скільки карток повторити сьогодні |
| Weak words | пріоритетні слова |
| Active video | рекомендоване відео для продовження |
| Transcript history | незавершені відео |
| Phrasal verbs | прогрес по фразових дієсловах |
| Quiz / pronunciation today | прогрес денних цілей |

**Цілі за рівнем** (`beginner` / `intermediate` / `advanced`):

| Рівень | Review | New words | Shadowing | Quiz |
|--------|--------|-----------|-----------|------|
| Beginner | 5 | 2 | 2 | 5 |
| Intermediate | 15 | 5 | 3 | 10 |
| Advanced | 30 | 10 | 5 | 15 |

**Компонент:** `LearningCoachPanel` (вкладка Coach у Learning Hub)

**Не реалізовано:** LLM-generated advice (`/api/coach-advice`), автоматична адаптація цілей

---

### 11. Інтернаціоналізація (i18n)

**Файли:** `app/lib/i18n/messages.ts`, `app/components/InterfaceLanguageProvider.tsx`

| Мова | Код | Інтерфейс | Переклади карток |
|------|-----|-----------|------------------|
| Українська | `uk` | ✅ повний | ✅ |
| English | `en` | ✅ повний | ✅ |
| Polski | `pl` | ✅ (fallback → en) | ✅ |
| Español | `es` | ✅ (fallback → en) | ✅ |
| Deutsch | `de` | ✅ (fallback → en) | ✅ |
| Français | `fr` | ✅ (fallback → en) | ✅ |

Три незалежні налаштування мови:
- **Interface language** — UI
- **Translation language** — переклади на картках, субтитри
- **Task language** — мова AI-завдань (тести, пояснення)

---

### 12. PWA та тема

- **Serwist** Service Worker: precache, offline page (`app/~offline/page.tsx`)
- **manifest.ts**: standalone app, іконки 192/512
- **Theme:** CSS `prefers-color-scheme` + `.dark` / `.light`, `ThemeProvider` синхронізує після mount
- **InstallAppButton** — встановлення як додаток

---

## Структура проєкту

```
yoytube-translaty/
├── app/
│   ├── page.tsx                    # Головна сторінка
│   ├── layout.tsx                  # Root layout, providers
│   ├── globals.css                 # Tailwind + theme
│   ├── manifest.ts                 # PWA manifest
│   ├── sw.ts                       # Service Worker (Serwist)
│   ├── ~offline/page.tsx           # Офлайн-сторінка
│   │
│   ├── api/                        # 21 API route
│   │   ├── transcript/
│   │   ├── enrich-flashcard/
│   │   ├── process-text/
│   │   ├── find-phrasal-verbs/
│   │   ├── find-idioms/
│   │   ├── find-slang/
│   │   ├── find-key-vocabulary/
│   │   ├── find-frequent-words/
│   │   ├── find-collocations/
│   │   ├── find-useful-phrases/
│   │   ├── grammar-highlights/
│   │   ├── video-summary/
│   │   ├── video-difficulty/
│   │   ├── generate-chapters/
│   │   ├── generate-timeline/
│   │   ├── generate-notes/
│   │   ├── generate-quiz/
│   │   ├── translate-lines/
│   │   ├── explain-sentence/
│   │   └── playlist/
│   │
│   ├── components/                 # 46 React-компонентів
│   │   ├── LearningHubSection.tsx
│   │   ├── FlashcardsPanel.tsx
│   │   ├── FlashcardStudyMode.tsx
│   │   ├── FlashcardQuizMode.tsx
│   │   ├── LearningAnalyticsPanel.tsx
│   │   ├── LearningCoachPanel.tsx
│   │   ├── ShadowingPanel.tsx
│   │   ├── PronunciationChecker.tsx
│   │   └── …
│   │
│   ├── hooks/
│   │   └── useDebouncedCardEnrichment.ts
│   │
│   └── lib/                        # Бізнес-логіка (~80 модулів)
│       ├── flashcards.ts
│       ├── flashcardSrs.ts         # Basic SRS + Smart Review Engine
│       ├── flashcardQuiz.ts
│       ├── flashcardEnrichment.ts
│       ├── flashcardImportExport.ts
│       ├── flashcardBackup.ts
│       ├── learningAnalytics.ts
│       ├── learningPlan.ts
│       ├── learningGoals.ts
│       ├── dailyStudyLog.ts
│       ├── pronunciationAttempts.ts
│       ├── aiPrompts.ts
│       ├── normalizeCaptions.ts
│       ├── transcriptPipeline.ts
│       └── i18n/
│
├── public/
│   └── icons/                      # PWA icons
├── scripts/
│   ├── generate-pwa-icons.mjs
│   └── check-changes.sh
├── tests/
│   └── responsive.spec.ts
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── playwright.config.ts
└── .env.local                      # OPENAI_API_KEY (не в git)
```

---

## Швидкий старт

### 1. Залежності

```bash
npm install
```

### 2. yt-dlp (обов'язково для субтитрів)

```bash
# macOS
brew install yt-dlp

# Linux
pip install yt-dlp
# або
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### 3. OpenAI API

1. Створи ключ на https://platform.openai.com/api-keys
2. Додай у `.env.local`:

```env
OPENAI_API_KEY=sk-...
```

### 4. Запуск

```bash
npm run dev
```

Відкрий http://localhost:3000

### 5. Production build

```bash
npm run build
npm start
```

---

## Команди розробки

| Команда | Опис |
|---------|------|
| `npm run dev` | Dev-сервер (webpack) |
| `npm run build` | Production build + PWA icons |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run test:responsive` | Playwright responsive tests |
| `npm run generate:icons` | Генерація PWA-іконок |

---

## Як користуватися

1. **Встав YouTube URL** — підтримуються `watch?v=`, `youtu.be/`, `embed/`
2. **Переглянь транскрипт** — клік по рядку перемотує відео
3. **AI-аналіз** — фразові дієслова, лексика, резюме, тести
4. **Збережи слова** — виділи текст або збережи з AI-списку
5. **Навчання** — Learning Hub:
   - **Coach** — денний план
   - **Flashcards** — повторення (SRS) та квізи
   - **Analytics** — прогрес і слабкі місця
6. **Shadowing** — повторюй фрази вслід за відео
7. **Налаштування** — мови, цілі, імпорт/експорт

---

## Roadmap / не реалізовано

| Функція | Статус |
|---------|--------|
| Anki `.apkg` імпорт | ❌ |
| LLM Coach advice (`/api/coach-advice`) | ❌ |
| Автоматична адаптація цілей (TASK-036.5) | ❌ |
| Окремий shadowing score на картці (окрім pronunciation) | ❌ |
| Повний Anki SM-2 learning steps у хвилинах | частково (Again = 10 хв) |
| Серверна синхронізація / акаунти | ❌ |
| Детальна статистика сесії (Hard/Good/Easy окремо) | ❌ |

---

## Ліцензія

MIT
