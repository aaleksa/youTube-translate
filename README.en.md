# YoyTube Translaty

**A platform for learning English from YouTube videos** — subtitle extraction, AI content analysis, flashcards, spaced repetition (SRS), quizzes, shadowing, pronunciation practice, and progress analytics.

The app runs as a **PWA** (Progressive Web App): data is stored locally in the browser, with no separate backend server for user data.

📖 **User guides:** [USER_GUIDE.en.md](./USER_GUIDE.en.md) (English) · [USER_GUIDE.md](./USER_GUIDE.md) (Ukrainian) — step-by-step feature overview without technical details.

🇺🇦 **Ukrainian README:** [README.md](./README.md)

---

## Project goals

### Main objective

Help users **learn English from real video content** — not just watch subtitles, but turn them into structured study material with progress tracking.

### Key goals

| Goal | Description |
|------|-------------|
| **Content extraction** | Fetch YouTube subtitles (manual and auto), normalize, split into sentences and phrases |
| **AI enhancement** | Transcript analysis: phrasal verbs, idioms, slang, grammar, key vocabulary, summaries, quizzes |
| **Active learning** | Flashcards with video context, SRS review, quizzes, shadowing, pronunciation checks |
| **Personalization** | Learning plan (Coach), weak words, adaptive intervals, level-based goals |
| **Autonomy** | Local storage, offline mode (PWA), import/export |
| **Multilingual** | Interface and translations: uk, en, pl, es, de, fr |

### Target audience

- Ukrainian-speaking (and other) English learners who use YouTube for study
- Levels: beginner → intermediate → advanced (configurable in learning goals)

---

## Tech stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.2.7 | App Router, SSR/CSR, API Routes |
| **React** | 19.2.4 | UI components |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Styling, dark/light theme |
| **Serwist** | 9.5.11 | PWA, Service Worker, offline cache |

### Backend (API Routes)

| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | REST endpoints for transcripts and AI |
| **OpenAI API** (`openai` 6.x) | ChatGPT for text analysis, card enrichment |
| **yt-dlp** (system dependency) | YouTube subtitle extraction |
| **youtube-transcript** / **youtube-transcript-api** | Alternative subtitle fetching |
| **yt-dlp-wrap** | Node.js wrapper for yt-dlp |
| **axios** | HTTP requests |
| **jsdom** + **@mozilla/readability** | Web content parsing (where needed) |
| **html2pdf.js** | PDF export |

### Development tools

| Tool | Purpose |
|------|---------|
| **ESLint** + `eslint-config-next` | Linting |
| **Playwright** | Responsive E2E tests (`npm run test:responsive`) |
| **sharp** | PWA icon generation |

### External services

| Service | Usage |
|---------|-------|
| **YouTube** | Video, subtitles (via yt-dlp / transcript API) |
| **OpenAI** | AI analysis, card enrichment, sentence explanations |
| **Web Speech API** | Speech recognition for pronunciation checker |

### Data storage

All user data lives in browser **localStorage** (no server database):

| Key | Data |
|-----|------|
| `yoytube-flashcards` | Flashcards |
| `yoytube-decks` | Decks |
| `yoytube-quiz-attempts` | Quiz attempts |
| `yoytube-pronunciation-attempts` | Pronunciation / shadowing attempts |
| `yoytube-daily-study-log` | Daily study log |
| `yoytube-learning-goals` | Goals (daily goal, vocabulary goal, level) |
| `yoytube-learning-settings` | Learning settings |
| `yoytube-transcript-cache-*` | Transcript cache |
| `yoytube-transcript-history` | Watched video history |
| AI caches (`*-cache-*`) | Cached AI analysis results per videoId |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (PWA)                            │
├─────────────────────────────────────────────────────────────────┤
│  page.tsx                                                       │
│    ├── URLInput / VideoPlayer / TranscriptDisplay               │
│    ├── QuickInfoAnalysis (AI panels)                            │
│    ├── ShadowingPanel / PronunciationChecker                    │
│    ├── LearningHubSection                                       │
│    │     ├── Coach (LearningCoachPanel)                         │
│    │     ├── Flashcards (FlashcardsPanel + Study/Quiz)          │
│    │     └── Analytics (LearningAnalyticsPanel)                 │
│    └── AppSettingsPanel (languages, import/export, goals)       │
├─────────────────────────────────────────────────────────────────┤
│  lib/ — business logic (flashcards, SRS, quiz, analytics…)    │
│  localStorage — persistence                                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP
┌──────────────────────────▼──────────────────────────────────────┐
│  app/api/ — Next.js API Routes                                  │
│    ├── transcript/        — subtitles (yt-dlp)                  │
│    ├── process-text/      — general AI chat                     │
│    ├── enrich-flashcard/  — AI card enrichment                  │
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

## Modules and features

### 1. Transcripts and video

**Files:** `app/api/transcript/`, `app/lib/youtubeSubtitles.ts`, `app/lib/normalizeCaptions.ts`, `app/lib/transcriptPipeline.ts`

- Extract subtitles from YouTube URL (VTT, SRT, JSON)
- Subtitle language selection (manual / auto-generated)
- Normalization: lines → sentences → phrases (chunks) → paragraphs
- Shadowing units: Easy (4–10 words), Normal (sentences), Advanced (paragraphs)
- Video player sync (active line, seek on click)
- Transcript cache and watch history
- Playlists: load a series of videos

**Components:** `URLInput`, `VideoPlayer`, `TranscriptDisplay`, `VideoControls`, `PlaylistPanel`, `TranscriptHistorySearch`

---

### 2. AI content analysis

**Files:** `app/lib/aiPrompts.ts`, `app/lib/aiChat.ts`, `app/api/*`

| Feature | API | Description |
|---------|-----|-------------|
| Phrasal verbs | `/api/find-phrasal-verbs` | Find phrasal verbs in transcript |
| Idioms | `/api/find-idioms` | Idiomatic expressions |
| Slang | `/api/find-slang` | Colloquial expressions |
| Key vocabulary | `/api/find-key-vocabulary` | 15–30 most useful words |
| Frequent words | `/api/find-frequent-words` | Top words with translation |
| Collocations | `/api/find-collocations` | Word combinations |
| Useful phrases | `/api/find-useful-phrases` | Ready-made phrases to learn |
| Grammar | `/api/grammar-highlights` | Grammar patterns |
| Video summary | `/api/video-summary` | Short overview |
| Difficulty | `/api/video-difficulty` | CEFR level estimate |
| Chapters | `/api/generate-chapters` | Split into sections |
| Timeline | `/api/generate-timeline` | Key moments |
| Notes | `/api/generate-notes` | Structured notes |
| Video quiz | `/api/generate-quiz` | Comprehension questions |
| Line translation | `/api/translate-lines` | Batch subtitle translation |
| Sentence explanation | `/api/explain-sentence` | AI grammar/vocabulary explanation |
| Free chat | `/api/process-text` | TextProcessor — custom prompts |

Results are cached in localStorage by `videoId` + language.

**Components:** `TextProcessor`, `QuickInfoAnalysis`, `VocabularyAnalysis`, `VideoDifficultyPanel`, `VideoChaptersPanel`, `VideoTimelinePanel`, `VideoNotesPanel`, `VideoQuizPanel`, `SentenceExplanation`, `SelectionAnalysis`, `SelectionTranslate`

---

### 3. Flashcards

**Files:** `app/lib/flashcards.ts`, `app/lib/decks.ts`, `app/lib/sentenceStore.ts`

#### Card model (`Flashcard`)

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

#### Capabilities

- Save words from transcript selection or AI lists
- Link to video, sentence, timestamp
- Decks and filters: all / due / video / deck
- Bulk save from vocabulary AI lists
- Edit, tags, multilingual translations
- Card actions: listen, watch in video, repeat, shadowing

**Components:** `SaveFlashcardModal`, `EditFlashcardModal`, `BulkSaveFlashcardModal`, `FlashcardsPanel`, `FlashcardExampleActions`

---

### 4. AI Card Enrichment (TASK-033)

**Files:** `app/lib/flashcardEnrichment.ts`, `app/api/enrich-flashcard/route.ts`, `app/hooks/useDebouncedCardEnrichment.ts`

Automatic enrichment of new cards via OpenAI:

| Field | Source |
|-------|--------|
| `translation` | AI (if not provided) |
| `example` | Subtitles (`originalExample`) preferred over AI |
| `explanation` | AI |
| `partOfSpeech` | AI |
| `level` (CEFR A1–C1) | AI |
| `synonyms`, `ipa` | AI |
| `tags` | AI (phrasal verb, etc.) |

- 800 ms debounce when typing in the modal
- Bulk enrich up to 20 cards
- Auto-enrich setting in `LearningSettings`
- Status: `pending` | `completed` | `failed`

---

### 5. Spaced Repetition (SRS)

#### TASK-027: Basic SRS ✅

**File:** `app/lib/flashcardSrs.ts`

| Field | Description |
|-------|-------------|
| `repetitions` | Number of successful reviews |
| `interval` | Current interval (days) |
| `ease` | Ease factor (default 2.5) |
| `nextReview` | Next review timestamp |

**Card states:** `new` → `learning` → `review` → `mastered` (repetitions ≥ 7)

**Due today:** `nextReview <= now`

**Queue:** sorted by `nextReview`, weak cards prioritized

#### TASK-032: Smart Review Engine (Advanced SRS) ✅

Instead of simple Know / Don't know — **4-level grading** (Anki-like SM-2):

| Rating | Effect |
|--------|--------|
| **Again** | repetitions = 0, ease −0.2, review in **10 min** |
| **Hard** | shorter interval, ease −0.15 |
| **Good** | standard SM-2 step (1d → 3d → interval × ease) |
| **Easy** | longer interval, ease +0.15 |

**Adaptive modifiers** (`getReviewModifiers`):

- `unknownCount > knownCount` → interval × 0.7
- Low quiz accuracy (`quizWrongCount`) → interval × 0.75
- Low pronunciation score (< 60%) → interval × 0.8

**Queue priority** (`getWeaknessScore`): weak words, quiz mistakes, poor pronunciation

**Component:** `FlashcardStudyMode` — Again / Hard / Good / Easy buttons

---

### 6. Flashcard quizzes

**File:** `app/lib/flashcardQuiz.ts`

| Option | Choices |
|--------|---------|
| Format | multiple-choice, typing, mixed |
| Question type | en→translation MC, translation→en MC, typing EN, typing translation |
| Source | due, video, deck, weak, all |

- Updates `quizCorrectCount` / `quizWrongCount` on the card
- Attempts stored in `yoytube-quiz-attempts`
- Affects Smart Review (interval modifiers)

**Component:** `FlashcardQuizMode`

---

### 7. Shadowing and pronunciation

**Files:** `app/lib/shadowingChunks.ts`, `app/lib/pronunciationCompare.ts`, `app/lib/pronunciationAttempts.ts`, `app/lib/speechRecognition.ts`

- **Shadowing:** listen to phrase → pause → user repeats
- Modes: Easy (chunks), Normal (sentences), Advanced (paragraphs)
- **Pronunciation Checker:** Web Speech API + comparison to reference
- Saves attempts and best score per phrase
- SRS integration (low score → more frequent review)

**Components:** `ShadowingPanel`, `PronunciationChecker`

---

### 8. Learning Analytics (TASK-034)

**Files:** `app/lib/learningAnalytics.ts`, `app/lib/dailyStudyLog.ts`

| Section | Metrics |
|---------|---------|
| Overview | cards, mastered, streak, quiz accuracy, SRS success rate |
| Recent activity | reviewed / correct / incorrect today |
| Weak words | words with unknownCount > knownCount |
| Hardest words | most mistakes |
| Video progress | progress per video (progress bar) |
| Deck progress | progress per deck |
| Phrasal verbs | dedicated section |
| Achievements | milestones (streak, mastered, etc.) |

**Mastered:** `getCardState(card) === 'mastered'` (repetitions ≥ 7)

**Component:** `LearningAnalyticsPanel`

---

### 9. Import / Export (TASK-035)

**Files:** `app/lib/flashcardImportExport.ts`, `app/lib/flashcardBackup.ts`, `app/lib/csvUtils.ts`

| Format | Description |
|--------|-------------|
| **CSV** | word, translation, example, tags, SRS fields (optional) |
| **Anki CSV** | Front, Back, Example, Tags |
| **JSON backup** | cards + decks + dailyStudyLog + quizAttempts |

- CSV import with column mapping
- Deduplication strategies: `skip` | `replace` | `merge`
- Full restore from JSON backup

**Component:** `ImportExportSettings` (in settings)

---

### 10. AI Learning Coach (TASK-036)

**Files:** `app/lib/learningPlan.ts`, `app/lib/learningGoals.ts`

Rule-based learning plan (no LLM):

| Data source | Generated output |
|-------------|------------------|
| Due cards | how many cards to review today |
| Weak words | priority words |
| Active video | recommended video to continue |
| Transcript history | unfinished videos |
| Phrasal verbs | phrasal verb progress |
| Quiz / pronunciation today | daily goal progress |

**Goals by level** (`beginner` / `intermediate` / `advanced`):

| Level | Review | New words | Shadowing | Quiz |
|-------|--------|-----------|-----------|------|
| Beginner | 5 | 2 | 2 | 5 |
| Intermediate | 15 | 5 | 3 | 10 |
| Advanced | 30 | 10 | 5 | 15 |

**Component:** `LearningCoachPanel` (Coach tab in Learning Hub)

**Not implemented:** LLM-generated advice (`/api/coach-advice`), automatic goal adaptation

---

### 11. Internationalization (i18n)

**Files:** `app/lib/i18n/messages.ts`, `app/components/InterfaceLanguageProvider.tsx`

| Language | Code | Interface | Card translations |
|----------|------|-----------|-------------------|
| Ukrainian | `uk` | ✅ full | ✅ |
| English | `en` | ✅ full | ✅ |
| Polish | `pl` | ✅ (fallback → en) | ✅ |
| Spanish | `es` | ✅ (fallback → en) | ✅ |
| German | `de` | ✅ (fallback → en) | ✅ |
| French | `fr` | ✅ (fallback → en) | ✅ |

Three independent language settings:
- **Interface language** — UI
- **Translation language** — card translations, subtitles
- **Task language** — AI task language (quizzes, explanations)

---

### 12. PWA and theme

- **Serwist** Service Worker: precache, offline page (`app/~offline/page.tsx`)
- **manifest.ts**: standalone app, 192/512 icons
- **Theme:** CSS `prefers-color-scheme` + `.dark` / `.light`, `ThemeProvider` syncs after mount
- **InstallAppButton** — install as app

---

## Project structure

```
yoytube-translaty/
├── app/
│   ├── page.tsx                    # Main page
│   ├── layout.tsx                  # Root layout, providers
│   ├── globals.css                 # Tailwind + theme
│   ├── manifest.ts                 # PWA manifest
│   ├── sw.ts                       # Service Worker (Serwist)
│   ├── ~offline/page.tsx           # Offline page
│   │
│   ├── api/                        # 21 API routes
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
│   ├── components/                 # 46 React components
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
│   └── lib/                        # Business logic (~80 modules)
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
└── .env.local                      # OPENAI_API_KEY (not in git)
```

---

## Quick start

### 1. Dependencies

```bash
npm install
```

### 2. yt-dlp (required for subtitles)

```bash
# macOS
brew install yt-dlp

# Linux
pip install yt-dlp
# or
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### 3. OpenAI API

1. Create a key at https://platform.openai.com/api-keys
2. Add to `.env.local`:

```env
OPENAI_API_KEY=sk-...
```

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000

### 5. Production build

```bash
npm run build
npm start
```

---

## Development commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (webpack) |
| `npm run build` | Production build + PWA icons |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run test:responsive` | Playwright responsive tests |
| `npm run generate:icons` | Generate PWA icons |

---

## How to use

1. **Paste a YouTube URL** — supports `watch?v=`, `youtu.be/`, `embed/`
2. **Browse the transcript** — click a line to seek the video
3. **AI analysis** — phrasal verbs, vocabulary, summary, quizzes
4. **Save words** — select text or save from AI lists
5. **Learning** — Learning Hub:
   - **Coach** — daily plan
   - **Flashcards** — review (SRS) and quizzes
   - **Analytics** — progress and weak spots
6. **Shadowing** — repeat phrases along with the video
7. **Settings** — languages, goals, import/export

---

## Roadmap / not implemented

| Feature | Status |
|---------|--------|
| Anki `.apkg` import | ❌ |
| LLM Coach advice (`/api/coach-advice`) | ❌ |
| Automatic goal adaptation (TASK-036.5) | ❌ |
| Separate shadowing score on card (besides pronunciation) | ❌ |
| Full Anki SM-2 learning steps in minutes | partial (Again = 10 min) |
| Server sync / accounts | ❌ |
| Detailed session stats (Hard/Good/Easy separately) | ❌ |

---

## License

MIT
