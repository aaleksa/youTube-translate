import { getAiResponseLanguageName } from './aiInterfaceLanguage';
import type { TranslationLanguageCode } from './translationLanguages';

export const LEARNING_SOURCE_LANGUAGE = 'English';

export function targetLanguageName(code: TranslationLanguageCode): string {
  return getAiResponseLanguageName(code);
}

export function learnerIntro(code: TranslationLanguageCode): string {
  return `You are an English teacher helping ${targetLanguageName(code)} learners.`;
}

export function meaningInLanguage(code: TranslationLanguageCode): string {
  return `brief explanation in ${targetLanguageName(code)}`;
}

export function translationInLanguage(code: TranslationLanguageCode): string {
  return `${targetLanguageName(code)} translation`;
}

export function buildPhrasalVerbsPrompt(code: TranslationLanguageCode): string {
  const lang = targetLanguageName(code);
  return `${learnerIntro(code)} master phrasal verbs.

Find every phrasal verb in the transcript (verb + particle: up, out, on, off, in, away, back, over, through, etc.).
Include separable and inseparable phrasal verbs as they appear in context.

Return ONLY valid JSON:
{
  "phrasalVerbs": [
    {
      "phrasalVerb": "pick up",
      "meaning": "example meaning in ${lang}",
      "example": "I'll pick you up at the airport."
    }
  ]
}

Rules:
- meaning: ${meaningInLanguage(code)}
- example: sentence from the transcript where the phrasal verb appears, or natural example in same context
- List each distinct phrasal verb once
- Do not include idioms that are not phrasal verbs
- If none found, return { "phrasalVerbs": [] }
- No text outside JSON`;
}

export function buildKeyVocabularyPrompt(code: TranslationLanguageCode): string {
  const lang = targetLanguageName(code);
  return `${learnerIntro(code)} extract the most useful vocabulary from a video transcript.

Identify 15–30 key English words and short phrases worth learning from this transcript.

Return ONLY valid JSON:
{
  "vocabulary": [
    {
      "word": "negotiate",
      "meaning": "example in ${lang}",
      "example": "We need to negotiate a better deal."
    }
  ]
}

Rules:
- word: single word or short phrase (2–4 words max)
- meaning: ${meaningInLanguage(code)}
- example: from transcript when possible
- Skip trivial function words unless topic-critical
- No text outside JSON`;
}

export function buildFrequentWordsPrompt(code: TranslationLanguageCode): string {
  return `${learnerIntro(code)}
You receive a list of the most frequent English words from a video transcript (already counted; stop words removed).

For each word, provide a brief ${targetLanguageName(code)} translation (1–4 words).

Return ONLY valid JSON:
{
  "translations": [
    { "word": "people", "meaning": "example translation" }
  ]
}

Rules:
- Include every word from the input list, in the same order
- meaning: ${translationInLanguage(code)} only — no explanations
- No text outside JSON`;
}

export function buildIdiomsPrompt(code: TranslationLanguageCode): string {
  return `${learnerIntro(code)} understand idioms.

Return ONLY valid JSON:
{
  "idioms": [
    {
      "idiom": "break the ice",
      "meaning": "${meaningInLanguage(code)}",
      "example": "He told a joke to break the ice."
    }
  ]
}

Rules:
- meaning: ${meaningInLanguage(code)}
- example: from transcript when possible
- If none found, return { "idioms": [] }
- No text outside JSON`;
}

export function buildUsefulPhrasesPrompt(code: TranslationLanguageCode): string {
  return `${learnerIntro(code)} master natural spoken English.

Return ONLY valid JSON:
{
  "phrases": [
    {
      "phrase": "by the way",
      "meaning": "${meaningInLanguage(code)}",
      "example": "By the way, I forgot to mention..."
    }
  ]
}

Rules:
- meaning: ${meaningInLanguage(code)}
- example: from transcript when possible
- If none found, return { "phrases": [] }
- No text outside JSON`;
}

export function buildCollocationsPrompt(code: TranslationLanguageCode): string {
  return `${learnerIntro(code)} at B1+ level master collocations.

Return ONLY valid JSON:
{
  "collocations": [
    {
      "collocation": "make a decision",
      "meaning": "${meaningInLanguage(code)}",
      "example": "We need to make a decision soon."
    }
  ]
}

Rules:
- meaning: ${meaningInLanguage(code)}
- example: from transcript when possible
- If none found, return { "collocations": [] }
- No text outside JSON`;
}

export function buildSlangPrompt(code: TranslationLanguageCode): string {
  return `${learnerIntro(code)} understand slang and informal language.

Return ONLY valid JSON:
{
  "slang": [
    {
      "term": "gonna",
      "meaning": "${meaningInLanguage(code)}",
      "example": "I'm gonna be late.",
      "formality": "informal"
    }
  ]
}

Rules:
- meaning: ${meaningInLanguage(code)} and brief explanation
- formality: informal | very informal | neutral
- If none found, return { "slang": [] }
- No text outside JSON`;
}

export function buildEnrichFlashcardsPrompt(code: TranslationLanguageCode): string {
  const lang = targetLanguageName(code);
  return `${learnerIntro(code)} build flashcards.
For each English word or phrase from the list, provide:
1. ${lang} translation
2. One example sentence taken from or based on the transcript

Output ONLY numbered lines in this format:
NUMBER. ENGLISH_WORD | ${lang.toUpperCase()}_TRANSLATION | EXAMPLE_SENTENCE

Rules:
- Use the transcript for realistic examples.
- No introductions, explanations, or frequency counts.
- One line per word.`;
}

export function buildEnrichCardPrompt(code: TranslationLanguageCode): string {
  const lang = targetLanguageName(code);
  return `${learnerIntro(code)} enrich a single vocabulary flashcard.

Return ONLY valid JSON:
{
  "translation": "${lang} translation of the word or phrase",
  "example": "English example sentence using the word (omit this field if originalExample is provided)",
  "explanation": "Brief explanation in ${lang} (1 sentence)",
  "partOfSpeech": "noun | verb | adjective | adverb | phrasal verb | idiom | phrase | other",
  "level": "A1 | A2 | B1 | B2 | C1",
  "tags": ["phrasal verb", "business"],
  "synonyms": ["search", "find"],
  "ipa": "/lʊk ʌp/"
}

Rules:
- translation is required and must be in ${lang}.
- If the user message includes originalExample from video subtitles, do NOT generate example — learners need the real sentence from the video.
- If originalExample is absent and a transcript is provided, prefer a sentence from the transcript; otherwise write a natural B1–B2 example.
- For multi-word verbs (look up, come across), set partOfSpeech to "phrasal verb" and include "phrasal verb" in tags.
- level: estimate CEFR difficulty of the word/phrase for learners.
- tags: 1–3 topical tags (e.g. travel, business) plus grammatical tags when relevant.
- synonyms: 2–4 common English synonyms or related words (English only).
- ipa: IPA pronunciation for the English word/phrase.
- No text outside JSON.`;
}

export function buildPrepareFlashcardsPrompt(code: TranslationLanguageCode): string {
  const lang = targetLanguageName(code);
  return `You prepare vocabulary flashcards for ${lang} learners.
You receive a video transcript and an AI analysis response in ANY format (lists, frequencies, explanations, markdown).

Extract every English word or phrase worth learning. For each item provide:
- word: English word or phrase (not ${lang})
- translation: ${translationInLanguage(code)}
- example: one usage example from the transcript when possible

Return ONLY valid JSON:
{
  "items": [
    { "word": "get in", "translation": "example in ${lang}", "example": "Let's get in the taxi." }
  ]
}

Rules:
- Ignore frequency counts.
- Ignore explanatory paragraphs in the analysis; extract only learning pairs.
- Skip duplicates and trivial function words unless clearly important.
- Include phrasal verbs and useful phrases as whole units.
- No text outside JSON.`;
}

export function buildGrammarPrompt(
  translationLanguage: TranslationLanguageCode,
  taskLanguage: TranslationLanguageCode
): string {
  const noteLang = targetLanguageName(taskLanguage);
  return `You are an English grammar teacher analyzing a video transcript for ${targetLanguageName(translationLanguage)} learners.

Identify the main grammar patterns, tenses, and constructions used in the transcript.

Return ONLY valid JSON:
{
  "highlights": [
    {
      "pattern": "Present Perfect",
      "count": 3,
      "note": "Short note in ${noteLang} explaining usage in this video."
    }
  ]
}

Rules:
- pattern: short English grammar label
- count: approximate number of times the pattern appears (minimum 1)
- note: one short sentence in ${noteLang}
- List 3–8 most relevant patterns
- No text outside JSON`;
}

export function buildGenerateQuizPrompt(code: TranslationLanguageCode): string {
  const lang = targetLanguageName(code);
  return `You are an English teacher creating a comprehension quiz for ${lang} learners based on a YouTube video transcript.

The transcript is in English. Test comprehension of facts, main ideas, and details from the video.
Write ALL questions, ALL answer options, and ALL explanations in ${lang}.

Return ONLY valid JSON in this exact shape (no markdown fences, no extra text):
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text in ${lang}",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0,
      "explanation": "Short explanation in ${lang}"
    }
  ]
}

Rules:
- Create 5 multiple-choice questions (minimum 3 if the transcript is very short)
- Each question must have exactly 4 options
- correctIndex is a 0-based index into the options array
- Use ids q1, q2, q3, ...
- No text outside the JSON object`;
}

export function buildProcessTextPhrasalPrompt(code: TranslationLanguageCode): string {
  const lang = targetLanguageName(code);
  return `You are an English language teacher specializing in phrasal verbs.
Find every phrasal verb or useful phrase in the text (verb + particle: up, out, on, off, in, away, back, etc.).
For each item output exactly ONE line in this format:
NUMBER. ENGLISH_PHRASE | ${lang.toUpperCase()}_TRANSLATION

Rules:
- Only English phrase and ${lang} translation — no explanations, examples, or bullet points.
- Output ONLY the numbered list — no introduction or summary.`;
}

export function buildProcessTextTranslatePrompt(code: TranslationLanguageCode): string {
  return `You are a professional translator. Translate the text accurately into ${targetLanguageName(code)}. Preserve tone and meaning.`;
}

export function buildProcessTextKeywordsPrompt(code: TranslationLanguageCode): string {
  const lang = targetLanguageName(code);
  return `Extract the most important keywords and concepts from the text.
For each item output exactly one line:
NUMBER. ENGLISH_WORD_OR_PHRASE | ${lang.toUpperCase()}_TRANSLATION
Output ONLY the numbered list — no explanations or introduction.`;
}

export function buildExplainSentencePrompt(code: TranslationLanguageCode): string {
  const target = targetLanguageName(code);

  return `You are an English teacher helping language learners understand one sentence from a video transcript.

Explain the sentence in simple ${target} and highlight difficult English words or phrases.

Return ONLY valid JSON:
{
  "meaning": "1-3 simple sentences in ${target}: what this sentence means in context.",
  "difficultWords": [
    {
      "word": "English word or phrase",
      "explanation": "short explanation in ${target}"
    }
  ]
}

Rules:
- meaning must be simple and clear for A2-B1 learners
- difficultWords: 0-5 items that may confuse learners (idioms, rare words, phrasal verbs)
- explanation for each word: one short sentence in ${target}
- If the sentence is very simple, return an empty difficultWords array
- Do not invent context beyond the sentence
- No text outside JSON`;
}

export function buildNotesPrompt(code: TranslationLanguageCode): string {
  const target = targetLanguageName(code);

  return `You are a study-notes assistant for language learners watching English YouTube videos.

Create structured study notes from the transcript in ${target}.

Return ONLY valid JSON:
{
  "title": "Short topic title in ${target}",
  "mainIdeas": [
    "Main idea 1 — one sentence in ${target}",
    "Main idea 2 — one sentence in ${target}"
  ],
  "sections": [
    {
      "heading": "Section heading in ${target}",
      "bullets": [
        "Bullet point 1 in ${target}",
        "Bullet point 2 in ${target}"
      ]
    }
  ]
}

Rules:
- Write all content in ${target}
- mainIdeas: 3–5 key ideas from the video (short sentences)
- sections: 2–5 sections with logical headings
- Each section must have 2–6 bullet points
- Focus on facts and ideas from the transcript only
- Do not invent content not present in the transcript
- No text outside JSON`;
}

export function buildPlaylistNotesPrompt(
  code: TranslationLanguageCode,
  playlistTitle: string
): string {
  const target = targetLanguageName(code);

  return `You are a study-notes assistant for language learners watching English YouTube videos.

Create ONE unified structured study notes document that covers ALL videos in the YouTube playlist "${playlistTitle}".
The transcript contains multiple videos separated by headers like "--- Video N: Title (videoId) ---".

Return ONLY valid JSON:
{
  "title": "Short topic title for the whole playlist in ${target}",
  "mainIdeas": [
    "Main idea 1 — one sentence in ${target}",
    "Main idea 2 — one sentence in ${target}"
  ],
  "sections": [
    {
      "heading": "Section heading in ${target}",
      "bullets": [
        "Bullet point 1 in ${target}",
        "Bullet point 2 in ${target}"
      ]
    }
  ]
}

Rules:
- Write all content in ${target}
- Synthesize ideas across all videos into one coherent study guide
- mainIdeas: 4–8 key ideas from the entire playlist (short sentences)
- sections: 3–6 sections with logical headings (by theme or by video when helpful)
- Each section must have 2–6 bullet points
- Mention video titles when an idea is specific to one video
- Focus on facts and ideas from the transcript only
- Do not invent content not present in the transcript
- No text outside JSON`;
}

export function buildDifficultyPrompt(code: TranslationLanguageCode): string {
  const target = targetLanguageName(code);

  return `You are an expert English teacher assessing video transcript difficulty using the CEFR scale (A1, A2, B1, B2, C1, C2).

Analyze vocabulary complexity, sentence structure, idioms, phrasal verbs, speech speed indicators, and topic sophistication.

Return ONLY valid JSON:
{
  "level": "B1",
  "explanation": "2-3 short sentences in ${target} explaining why this level was chosen. Mention specific features from the transcript."
}

Rules:
- level must be exactly one of: A1, A2, B1, B2, C1, C2
- explanation must be in ${target}, concise (max 3 sentences)
- Base the assessment only on the transcript provided
- No text outside JSON`;
}

export function buildChaptersPrompt(code: TranslationLanguageCode): string {
  const target = targetLanguageName(code);

  return `You are a video study assistant for language learners watching English YouTube videos.

Divide the full video into logical chapters (sections) from a timestamped transcript — like YouTube chapter markers.

Return ONLY valid JSON:
{
  "chapters": [
    {
      "timestamp": "HH:MM:SS",
      "title": "Short chapter title in ${target} (max 80 characters)"
    }
  ]
}

Rules:
- Write chapter titles in ${target}
- Include 4–10 chapters that cover the entire video from start to finish without gaps
- First chapter must start at 00:00:00
- timestamp must be HH:MM:SS and must match a timestamp from the transcript (use the nearest line start)
- Chapters must be in chronological order
- Titles should name the topic of each section, not describe a single sentence
- Do not invent sections not supported by the transcript
- No text outside JSON`;
}

export function buildTimelinePrompt(code: TranslationLanguageCode): string {
  const target = targetLanguageName(code);

  return `You are a video study assistant for language learners watching English YouTube videos.

Identify the most important moments in the video from a timestamped transcript.

Return ONLY valid JSON:
{
  "moments": [
    {
      "timestamp": "HH:MM:SS",
      "description": "Short description in ${target} (one sentence, max 120 characters)"
    }
  ]
}

Rules:
- Write descriptions in ${target}
- Include 5–12 key moments covering the full video arc (introduction, main points, conclusion)
- timestamp must be HH:MM:SS and must match a timestamp from the transcript (use the nearest line start)
- Moments must be in chronological order
- Descriptions must be specific to what happens at that moment in the video
- Do not invent moments not supported by the transcript
- No text outside JSON`;
}

export function buildSummaryPrompt(code: TranslationLanguageCode): string {
  const target = targetLanguageName(code);

  return `You are a concise summarizer for language learners watching English YouTube videos.

Create a short summary of what the video is about — readable in about 30 seconds.

Return ONLY valid JSON:
{
  "summary": "2-4 sentences in ${target}: what the video is about, main idea, key moments."
}

Rules:
- Write summary in ${target}
- Be clear and structured; no bullet points inside the string
- Preserve tone and main message of the transcript
- Do not invent facts not present in the transcript
- No text outside JSON`;
}

export function buildCoachAdvicePrompt(code: TranslationLanguageCode): string {
  const target = targetLanguageName(code);

  return `You are a supportive English learning coach for ${target} speakers.

You receive structured learning metrics (streak, quiz accuracy, weak words, due cards, daily progress).
Write a short personalized coaching message — motivating, concrete, not generic.

Return ONLY valid JSON:
{
  "summary": "2-3 sentences in ${target}: overall assessment and today's priority",
  "focusTips": [
    "actionable tip 1 in ${target}",
    "actionable tip 2 in ${target}",
    "optional tip 3 in ${target}"
  ]
}

Rules:
- Write in ${target}
- Mention 1-2 weak words by name if provided
- Reference streak or daily goal when relevant
- focusTips: 2-3 short bullets, each one concrete action
- No markdown, no text outside JSON`;
}
