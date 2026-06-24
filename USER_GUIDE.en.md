# User Guide — YouTube Translator

This document explains **how to use the app** to learn English from YouTube videos. Technical details for developers are in [README.md](./README.md).

📖 **Ukrainian version:** [USER_GUIDE.md](./USER_GUIDE.md) · **Developer docs:** [README.en.md](./README.en.md)

---

## What is this app?

**YouTube Translator** helps you turn any YouTube video with subtitles into study material:

- read and listen to the transcript in sync with the video;
- find useful vocabulary with AI;
- save words as flashcards with examples from the video;
- review words on a smart schedule;
- take quizzes, practice pronunciation, and do shadowing;
- track progress and get a daily learning plan.

All your cards, decks, and statistics are stored **in your browser** on your device. You can install the app on your phone or computer like a regular program (PWA).

---

## Getting started

### 1. Open the app

Go to the app website in your browser (Chrome, Safari, Firefox, Edge).

### 2. Paste a YouTube link

Supported formats:

- `https://youtube.com/watch?v=...`
- `https://youtu.be/...`
- `https://youtube.com/embed/...`

Click the load button — the app will fetch subtitles and show the transcript next to the video.

### 3. Choose subtitle language

If the video has multiple subtitle tracks, you can pick the one you need (manual or auto-generated English).

### 4. Configure languages (⚙️)

In the top-right corner, click **⚙️ Settings**:

| Setting | Purpose |
|---------|---------|
| **Interface language** | Language of buttons and menus (Ukrainian, English, Polish, etc.) |
| **Translation language** | Language of translations on cards and in subtitles |
| **Task language** | Language of AI explanations, quizzes, and notes |

These three languages are **independent**. For example, the interface can be in Ukrainian while card translations are in Polish.

---

## Working with video and transcript

### Watching video

- Video plays in the embedded YouTube player.
- The current transcript line is **highlighted** during playback.
- **Click a line** — the video seeks to that moment.

### Quick info

In the **Quick info** block you will see:

- word, character, and line counts;
- video duration;
- speaking speed (WPM);
- estimated reading time for the transcript;
- AI video summary (short overview);
- grammar highlights.

### Bookmarks

You can save a **bookmark at the current moment** in the video — handy for returning to an important part later.

### Text selection

Select a word or phrase in the transcript — a menu appears:

- **translate** the selection;
- **explain** the sentence;
- **save to flashcard**.

### Playlists

If you paste a **YouTube playlist** link, the app can load a series of videos for sequential study.

---

## AI tools for video analysis

After loading the transcript, AI analysis panels become available. They help you quickly find what is worth learning.

| Tool | What it does |
|------|--------------|
| **Phrasal verbs** | Finds phrasal verbs (pick up, give up, etc.) with explanations |
| **Key vocabulary** | 15–30 most useful words and phrases from the video |
| **Idioms** | Idiomatic expressions with context |
| **Slang** | Informal and colloquial expressions |
| **Frequent words** | Most common words with translation |
| **Collocations** | Typical word combinations |
| **Useful phrases** | Ready-made phrases to memorize |
| **Grammar** | Grammar patterns with explanation |
| **Video difficulty** | Level estimate (A1–C2) |
| **Chapters** | Video split into logical sections |
| **Timeline** | Key moments with timestamps |
| **Notes** | Structured notes for the video |
| **Video quiz** | Questions to check comprehension |
| **Text Analysis** | Free AI chat about the transcript |

From AI lists you can **save multiple words at once** to flashcards (bulk save).

> **Note:** AI features require an internet connection. Results are cached — reopening the same video loads analysis faster.

---

## Flashcards

### How to create a card

1. **From transcript** — select a word → “Save to flashcard”.
2. **From AI list** — click save next to a word or select several words for bulk save.
3. **Manually** — in the Flashcards section you can add a card yourself.

### What is stored on a card

- **Word** in English;
- **Translation** in your chosen language;
- **Example** — a sentence from the video (if available);
- **Video link** — watch the moment in context;
- **Tags** — e.g. `phrasal verb`;
- **Extra (AI):** explanation, part of speech, CEFR level, synonyms, IPA transcription.

When saving a new card, AI can **automatically fill in** translation and metadata (if enabled in settings).

### Decks

Cards can be grouped into **decks** — e.g. “IT vocabulary”, “Travel”, “Phrasal verbs”. Useful for filtering and quizzes.

### View filters

| Filter | Shows |
|--------|-------|
| **All** | All saved cards |
| **Due today** | Cards to review today |
| **From video** | Cards from the current video |
| **From deck** | Cards from the selected deck |

### Actions on a card

On the back of the card during study:

- **▶ Listen** — hear the example;
- **🎬 Watch** — jump to the moment in the video;
- **🔁 Repeat** — play the sentence again;
- **🎙 Shadowing** — go to pronunciation practice.

---

## Learning Hub

The **Learning** section on the main page is the center of your progress. When collapsed, it shows a short summary: how many cards saved, how many due today, how many mastered.

Three tabs:

### 🧭 Coach

A personal **plan for today**, built from your real data:

- how many cards to review;
- which weak words need attention;
- how many new words to add;
- how many sentences for shadowing;
- how many quiz questions;
- which video to continue;
- weekly plan by day.

The plan depends on your **level** (beginner / intermediate / advanced) — change it in learning settings.

### 📇 Flashcards

Card list, **Study** and **Quiz** buttons, edit, delete, bulk AI enrichment.

### 📊 Analytics

Detailed progress statistics (see section below).

---

## Study mode (card review)

Click **📖 Study** in Flashcards to start a review session.

### How a session works

1. You see the **English word** on the front.
2. Click **Flip** — translation, example, and actions appear.
3. Rate how well you knew the word.

### Four rating levels

| Button | When to press | What happens |
|--------|---------------|--------------|
| **Again** | Did not remember at all | Word returns in ~10 minutes |
| **Hard** | Recalled with difficulty | Shorter interval until next review |
| **Good** | Recalled normally | Standard interval (1 day → 3 days → further) |
| **Easy** | Knew confidently | Longer interval, word appears less often |

### Smart review

The app **does not show all cards equally often**:

- words you often confuse appear **more often**;
- words with poor quiz results are reviewed **sooner**;
- words with low pronunciation scores also get **priority**;
- well-learned words gradually move to **mastered** (after several successful reviews).

If a card is marked as weak, a hint appears under the translation: *“Weak word — reviewed more often”*.

### After the session

You see a summary: how many cards reviewed, how many known / unknown, how many cards scheduled for tomorrow.

---

## Quizzes

Click the **quiz button** in Flashcards.

### Quiz settings

| Option | Choices |
|--------|---------|
| **Format** | Multiple choice, typing, mixed |
| **Source** | Due today, from video, from deck, weak words, all |
| **Count** | How many questions in the session |

### Question types

- English word → choose translation;
- translation → choose English word;
- type translation manually;
- type English word manually.

Quiz results affect **review priority** — words you often get wrong appear more often.

---

## Shadowing and pronunciation

### Shadowing

**Shadowing** is a technique where you repeat a phrase right after the speaker.

1. Open the Shadowing panel below the video.
2. Choose a mode:
   - **Easy** — short 4–10 word chunks (for beginners);
   - **Normal** — full sentences (recommended);
   - **Advanced** — whole paragraphs (for advanced learners).
3. Click **Start shadowing**.
4. Listen to the phrase → repeat in the pause → move on.

You can also start shadowing **from a card** — the 🎙 button on the back of the card.

### Pronunciation check

The app uses your browser microphone to compare your pronunciation to the reference text. The score is saved and used when scheduling reviews.

> Shadowing and pronunciation require **microphone permission** in the browser.

---

## Learning analytics

The **Analytics** tab shows your progress.

### Overview

- words saved;
- cards reviewed;
- words **mastered**;
- quiz accuracy;
- review success rate (SRS);
- **streak** — how many days in a row you studied.

### Today’s activity

- cards reviewed today;
- correct / incorrect answers.

### Weak and hardest words

- **Weak words** — where mistakes outnumber correct answers;
- **Hardest** — words with the most mistakes.

### Progress by video and deck

Visual bars: how many words from each video or deck are mastered.

### Phrasal verbs

A separate section to track progress on phrasal verbs.

### Achievements

Milestones: first 100 words, first mastered word, 30-day streak, 50 phrasal verbs mastered, 80%+ quiz accuracy, and more.

### Daily goal

You can set how many cards to review per day (default — 30). Progress appears in analytics and the coach.

---

## Learning settings

In **⚙️ Settings → Learning**:

| Option | Description |
|--------|-------------|
| **Daily goal** | How many cards to review each day |
| **Vocabulary goal** | Overall target (e.g. 1000 words) |
| **Level** | Beginner / Intermediate / Advanced — affects the coach plan |
| **Auto-enrich** | AI automatically fills new cards with translation and metadata |

---

## Import, export, and backup

In **⚙️ Settings → Import / Export**:

### Export

| Format | Contents |
|--------|----------|
| **CSV** | Words, translations, examples, tags, SRS data (optional) |
| **Anki CSV** | Format for import into Anki (Front, Back, Example, Tags) |
| **JSON backup** | Full copy: cards, decks, statistics, quizzes |

### Import

- **CSV** — upload a file, map columns (word, translation, example…), choose duplicate strategy:
  - **Skip** — do not import words that already exist;
  - **Replace** — update existing cards;
  - **Merge** — add new fields to existing cards.
- **JSON backup** — full restore from a backup file.

> **Recommendation:** download a JSON backup regularly — data lives only in your browser. Clearing cache or switching devices means losing data without a backup.

---

## Install as an app (PWA)

You can install the app on your device:

1. In Chrome / Edge — “Install” icon in the address bar or **📲 Install app** in the UI.
2. On iPhone (Safari) — Share → Add to Home Screen.
3. On Android (Chrome) — Add to home screen.

After installation, the app opens in its own window like a native app. Some features work **offline** (viewing saved cards, cached transcripts).

---

## Dark and light theme

Theme toggle in the UI. By default, the theme follows your device system settings.

---

## Tips for effective learning

### Daily routine (15–30 minutes)

1. Open **Coach** — check today’s plan.
2. Complete **review** (cards due today).
3. Add **2–5 new words** from the video you are watching.
4. Take a **quiz** on weak words.
5. **5 minutes of shadowing** — 2–3 sentences from the video.

### Choosing videos

- Start with videos **slightly below** your level — easier to build vocabulary.
- Check **video difficulty** in the AI panel.
- Better **one video over several days** than ten videos with one word each.

### Working with cards

- Always save an **example from the video** — context helps memory.
- Do not hesitate to press **Again** — honest ratings mean a better schedule.
- Once a week, check **Analytics** and quiz weak words.

### Using AI

- Start with **key vocabulary** and **phrasal verbs**.
- **Summary** — before watching, to understand the topic.
- **Video quiz** — after watching, to check comprehension.
- Do not try to save **everything** — pick 5–10 most useful words per session.

---

## Frequently asked questions (FAQ)

### Do I need an account?

It depends on the mode. **V2** (cloud account) requires sign-in — data syncs across devices after login.

### Does data sync between devices?

**Yes**, when signed in (V2):

- flashcards, decks, bookmarks, video history;
- learning settings, goals, languages, theme;
- quiz session summaries, daily study log, pronunciation attempts;
- video playback position.

Top-right **sync indicator**:

| State | Meaning |
|-------|---------|
| **Synced** | Data is up to date on the server |
| **Saving…** | Pushing local changes |
| **Syncing…** | Loading after sign-in |
| **Offline** | No network; session is kept, sync resumes when online |

If the same card differed on two devices, a **“Cloud data merged”** banner appears — merge rules apply (higher SRS counts, etc.).

**JSON backup** in settings is still available for manual export.

### Premium and AI

- **Free plan:** ~20 AI requests per day.
- **Premium:** unlimited AI, priority, **AI coach advice** (Coach tab).
- After Stripe checkout you return to `?premium=success` — subscription refreshes automatically.

### Why won’t subtitles load?

- Check that the video has subtitles on YouTube.
- Try a different subtitle language.
- Some videos restrict subtitle access.

### Why doesn’t AI work?

AI features need an **internet connection** and a configured API key on the server (for self-hosting). If you use a public deployment, contact the administrator.

### What does “mastered” mean?

A word is considered mastered after **several successful reviews** in study mode (`mastered` state). It still appears, but less often.

### Can I import from Anki?

Direct `.apkg` import is not supported. Export from Anki to CSV and import via **Import CSV** in settings.

### Does it work offline?

**Partially.** If you are already signed in:

- an **Offline** banner and sync badge appear;
- your session **stays active** (network error ≠ logout);
- you can view saved cards and cached transcripts;
- new videos, AI, and sync require network.

You can install the PWA — the shell is cached locally.

### How do I delete all data?

Clear site data in browser settings (Application / Storage → Clear site data). Back up first if the data matters.

---

## Quick cheat sheet

```
1. Paste video URL
2. Read / listen to transcript
3. AI → key vocabulary → save words
4. Learning → Flashcards → Study
5. Rate: Again / Hard / Good / Easy
6. Quiz on weak words
7. Shadowing — 2–3 sentences
8. Coach → check plan for tomorrow
```

---

*This guide matches the current YouTube Translator feature set. If you spot an inaccuracy, please let the developer know.*
