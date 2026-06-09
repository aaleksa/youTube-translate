import { getAiResponseLanguageName } from './aiInterfaceLanguage';
import type { InterfaceLanguage } from './i18n';

export function buildExplainSentencePrompt(language: InterfaceLanguage): string {
  const target = getAiResponseLanguageName(language);

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

export function buildNotesPrompt(language: InterfaceLanguage): string {
  const target = getAiResponseLanguageName(language);

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

export function buildDifficultyPrompt(language: InterfaceLanguage): string {
  const target = getAiResponseLanguageName(language);

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

export function buildSummaryPrompt(language: InterfaceLanguage): string {
  const target = getAiResponseLanguageName(language);

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
