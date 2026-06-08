# 🎥 YouTube Translator

Приложение для екстракции транскрипцій з YouTube видео та їх AI-обробки. Дозволяє витягувати текст, знаходити фразові дієслова, перекладати та аналізувати контент.

## 🚀 Можливості

- ✅ **Екстракція транскрипцій** з YouTube (VTT, SRT, JSON формати)
- ✅ **Часові мітки** - відображення часу для кожного рядка
- ✅ **AI-аналіз тексту** через OpenAI ChatGPT
- ✅ **Пошук та фільтрація** за текстом
- ✅ **Копіювання та завантаження** транскрипцій
- ✅ **Статистика** - слова, символи, рядки
- ✅ **Швидкі дії**: Фразові дієслова, переклад, резюме, ключові слова

## 🛠️ Технологічний стек

- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **AI:** OpenAI ChatGPT API
- **Інструменти:** yt-dlp (для екстракції субтитрів)

## 📁 Структура проекту

### Фронтенд
```
app/
├── page.tsx                          ← Головна сторінка
├── layout.tsx                        ← Лаут
└── components/
    ├── URLInput.tsx                  ← Введення YouTube URL
    ├── VideoPlayer.tsx               ← YouTube плеєр
    ├── TranscriptDisplay.tsx         ← Відображення транскрипцій
    └── TextProcessor.tsx             ← AI-обробка тексту
```

### Бекенд
```
app/api/
├── transcript/
│   └── route.ts                      ← API екстракції транскрипцій
└── process-text/
    └── route.ts                      ← API обробки тексту (OpenAI)
```

### Конфіги
```
/root
├── package.json                      ← Залежності npm
├── tsconfig.json                     ← Конфіг TypeScript
├── next.config.ts                    ← Конфіг Next.js
├── tailwind.config.ts                ← Конфіг Tailwind CSS
├── postcss.config.mjs                ← Конфіг PostCSS
└── .env.local                        ← Секрети (API keys)
```

## 🚀 Швидкий старт

### 1. Встановлення залежностей
```bash
npm install
```

### 2. Встановлення yt-dlp (macOS)
```bash
brew install yt-dlp
```

### 3. Налаштування OpenAI API
1. Перейди на https://platform.openai.com/api-keys
2. Створи новий Secret key
3. Додай у `.env.local`:
```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

### 4. Запуск сервера
```bash
npm run dev
```

Відкрий [http://localhost:3000](http://localhost:3000)

## 📖 Як використовувати

1. **Введи YouTube URL** з однією з підтримуваних форм:
   - `https://youtube.com/watch?v=VIDEO_ID`
   - `https://youtu.be/VIDEO_ID`
   - `https://youtube.com/embed/VIDEO_ID`

2. **Переглянь відео та транскрипцію** з часовими мітками

3. **Використай Text Analysis** для:
   - Витягування фразових дієслів
   - Перекладу на українську
   - Створення резюме
   - Витягування ключових слів
   - Довільних запитів до AI

## 🔧 Розробка

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

## 📝 Ліцензія

MIT
