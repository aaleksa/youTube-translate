import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai';

// LM Studio config (uncomment AI_PROVIDER=lmstudio in .env.local to use):
const AI_API_BASE = process.env.AI_API_BASE ?? 'http://127.0.0.1:1234';
const AI_API_URL = process.env.AI_API_URL ?? `${AI_API_BASE}/api/v1/chat`;
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS) || 2048;
const OPENAI_MAX_INPUT_CHARS =
  Number(process.env.OPENAI_MAX_INPUT_CHARS) || 100_000;
const LMSTUDIO_MAX_INPUT_CHARS =
  Number(process.env.AI_MAX_INPUT_CHARS) || 3000;
const SEND_CONTEXT_LENGTH = process.env.AI_SEND_CONTEXT_LENGTH === 'true';
const CONTEXT_LENGTH = Number(process.env.AI_CONTEXT_LENGTH) || 4096;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getAuthHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(process.env.AI_API_KEY
      ? { Authorization: `Bearer ${process.env.AI_API_KEY}` }
      : {}),
  };
}

function sanitizeText(text: string): string {
  return text
    .replace(/\0/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

function getMaxInputChars(): number {
  return AI_PROVIDER === 'openai'
    ? OPENAI_MAX_INPUT_CHARS
    : LMSTUDIO_MAX_INPUT_CHARS;
}

function getSystemPrompt(query: string): string {
  const lower = query.toLowerCase();

  if (lower.includes('phrasal verb')) {
    return `You are an English language teacher specializing in phrasal verbs.
Find every phrasal verb in the text (verb + particle: up, out, on, off, in, away, back, etc.).
For each phrasal verb provide:
1. The phrasal verb
2. The sentence or phrase where it appears
3. A brief meaning in English

If the text is in another language, still list English phrasal verbs if present.
List results as a numbered list. Do not say "there are no phrasal verbs" without carefully reading the entire text.`;
  }

  if (lower.includes('translate') && lower.includes('ukrainian')) {
    return 'You are a professional translator. Translate the text accurately into Ukrainian. Preserve tone and meaning.';
  }

  if (lower.includes('summary') || lower.includes('summar')) {
    return 'You are a concise summarizer. Create a clear, structured summary of the key points.';
  }

  if (lower.includes('keyword') || lower.includes('key word')) {
    return 'Extract the most important keywords and concepts. Present them as a structured list with brief explanations.';
  }

  return 'You are a helpful assistant that processes and analyzes text. Respond in the same language as the input text. Provide clear, structured output.';
}

function truncateByChars(
  text: string,
  maxChars: number
): { text: string; truncated: boolean } {
  if (text.length <= maxChars) {
    return { text, truncated: false };
  }

  return {
    text: text.slice(0, maxChars),
    truncated: true,
  };
}

type OutputItem = {
  type?: string;
  content?: string;
  text?: string;
};

function getOutputText(item: OutputItem): string | undefined {
  const value = item.content ?? item.text;
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function extractLmStudioResult(data: Record<string, unknown>): string {
  const output = data.output as OutputItem[] | undefined;
  if (output?.length) {
    const messages = output
      .filter((item) => item.type === 'message')
      .map(getOutputText)
      .filter((text): text is string => Boolean(text));
    if (messages.length) return messages.join('\n\n');

    const reasoning = output
      .filter((item) => item.type === 'reasoning')
      .map(getOutputText)
      .filter((text): text is string => Boolean(text));
    if (reasoning.length) return reasoning.join('\n\n');
  }

  const choices = data.choices as Array<{
    message?: {
      content?: string;
      reasoning?: string;
      reasoning_content?: string;
    };
    text?: string;
  }> | undefined;

  const choice = choices?.[0];
  const message = choice?.message;
  if (message?.content?.trim()) return message.content.trim();
  if (message?.reasoning_content?.trim()) return message.reasoning_content.trim();
  if (message?.reasoning?.trim()) return message.reasoning.trim();
  if (choice?.text?.trim()) return choice.text.trim();

  for (const key of ['response', 'content', 'message', 'text', 'result', 'output_text']) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return '';
}

async function callOpenAi(
  systemPrompt: string,
  input: string
): Promise<{ result: string; model: string }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  const message = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: input },
    ],
    temperature: 0.7,
    max_tokens: MAX_OUTPUT_TOKENS,
  });

  const result = message.choices[0]?.message?.content?.trim() ?? '';
  return { result, model };
}

async function callLmStudio(
  systemPrompt: string,
  input: string
): Promise<{ result: string; model: string; errorText?: string }> {
  const model = process.env.AI_MODEL ?? 'gpt-oss-20b-turboquant-mlx';

  const body: Record<string, unknown> = {
    model,
    system_prompt: systemPrompt,
    input,
    max_output_tokens: MAX_OUTPUT_TOKENS,
    temperature: 0.7,
  };

  if (SEND_CONTEXT_LENGTH) {
    body.context_length = CONTEXT_LENGTH;
  }

  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return { result: '', model, errorText: await response.text() };
  }

  const data = (await response.json()) as Record<string, unknown>;
  return { result: extractLmStudioResult(data), model };
}

export async function POST(request: NextRequest) {
  try {
    const { text, query } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const cleanText = sanitizeText(String(text));
    const cleanQuery = sanitizeText(String(query));
    const systemPrompt = getSystemPrompt(cleanQuery);
    const queryBlock = `\n\nTask:\n${cleanQuery}`;

    const maxInputChars = getMaxInputChars();
    const charLimits =
      AI_PROVIDER === 'openai'
        ? [maxInputChars]
        : [
            maxInputChars,
            Math.floor(maxInputChars / 2),
            Math.floor(maxInputChars / 4),
          ];

    let truncated = false;
    let lastError = '';

    for (const charLimit of charLimits) {
      const { text: trimmedText, truncated: wasTruncated } = truncateByChars(
        cleanText,
        charLimit
      );
      truncated = wasTruncated;
      const input = `Text:\n${trimmedText}${queryBlock}${
        wasTruncated ? '\n\n(Note: only the beginning of a longer transcript was included.)' : ''
      }`;

      if (AI_PROVIDER === 'openai') {
        try {
          const { result, model } = await callOpenAi(systemPrompt, input);
          if (result) {
            return NextResponse.json({
              success: true,
              result,
              query: cleanQuery,
              truncated,
              model,
            });
          }
          lastError = 'OpenAI returned an empty response';
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'OpenAI API error';
          if (!lastError.includes('context') && !lastError.includes('maximum')) {
            break;
          }
        }
        continue;
      }

      const { result, model, errorText } = await callLmStudio(systemPrompt, input);
      if (result) {
        return NextResponse.json({
          success: true,
          result,
          query: cleanQuery,
          truncated,
          model,
        });
      }

      lastError = errorText ?? 'LM Studio returned an empty response';
      const lower = lastError.toLowerCase();
      const shouldRetry =
        lower.includes('context length') ||
        lower.includes('tokens to keep') ||
        lower.includes('crashed') ||
        lower.includes('exit code');

      if (!shouldRetry) break;
    }

    return NextResponse.json({ error: lastError || 'Failed to process text with AI' }, { status: 500 });
  } catch (error) {
    console.error('Error processing text:', error);

    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: `Cannot connect to AI API at ${AI_API_URL}` },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process text with AI' },
      { status: 500 }
    );
  }
}
