import { OpenAI } from 'openai';

export const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai';
export const AI_API_BASE = process.env.AI_API_BASE ?? 'http://127.0.0.1:1234';
export const AI_API_URL = process.env.AI_API_URL ?? `${AI_API_BASE}/api/v1/chat`;
export const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS) || 4096;
export const SEND_CONTEXT_LENGTH = process.env.AI_SEND_CONTEXT_LENGTH === 'true';
export const CONTEXT_LENGTH = Number(process.env.AI_CONTEXT_LENGTH) || 4096;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type OutputItem = {
  type?: string;
  content?: string;
  text?: string;
};

function getAuthHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(process.env.AI_API_KEY
      ? { Authorization: `Bearer ${process.env.AI_API_KEY}` }
      : {}),
  };
}

function getOutputText(item: OutputItem): string | undefined {
  const value = item.content ?? item.text;
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function extractLmStudioResult(data: Record<string, unknown>): string {
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

export async function callOpenAi(
  systemPrompt: string,
  input: string,
  options?: { json?: boolean; temperature?: number }
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
    temperature: options?.temperature ?? (options?.json ? 0.2 : 0.7),
    max_tokens: MAX_OUTPUT_TOKENS,
    ...(options?.json ? { response_format: { type: 'json_object' as const } } : {}),
  });

  const result = message.choices[0]?.message?.content?.trim() ?? '';
  return { result, model };
}

export async function callLmStudio(
  systemPrompt: string,
  input: string,
  options?: { temperature?: number }
): Promise<{ result: string; model: string; errorText?: string }> {
  const model = process.env.AI_MODEL ?? 'gpt-oss-20b-turboquant-mlx';

  const body: Record<string, unknown> = {
    model,
    system_prompt: systemPrompt,
    input,
    max_output_tokens: MAX_OUTPUT_TOKENS,
    temperature: options?.temperature ?? 0.5,
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
