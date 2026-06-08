import { NextRequest, NextResponse } from 'next/server';

// OpenAI (uncomment to switch back):
// import { OpenAI } from 'openai';
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const message = await openai.chat.completions.create({
//   model: process.env.OPENAI_MODEL ?? 'gpt-3.5-turbo',
//   messages: [
//     { role: 'system', content: 'You are a helpful assistant...' },
//     { role: 'user', content: `Text:\n${text}\n\nQuery:\n${query}` },
//   ],
//   temperature: 0.7,
//   max_tokens: 2000,
// });
// const result = message.choices[0]?.message?.content || 'No response generated';

const AI_API_URL =
  process.env.AI_API_URL ?? 'http://localhost:1234/api/v1/chat';

function extractResult(data: Record<string, unknown>): string {
  const choices = data.choices as Array<{ message?: { content?: string } }> | undefined;
  const fromChoices = choices?.[0]?.message?.content;
  if (fromChoices) return fromChoices;

  for (const key of ['response', 'content', 'message', 'text', 'result']) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) return value;
  }

  return 'No response generated';
}

export async function POST(request: NextRequest) {
  try {
    const { text, query } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.AI_API_KEY
          ? { Authorization: `Bearer ${process.env.AI_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL ?? 'default',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that processes and analyzes text. Respond in the same language as the input text.',
          },
          {
            role: 'user',
            content: `Please process the following text and answer the query. Respond with clear, structured output.\n\nText:\n${text}\n\nQuery:\n${query}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `AI API error (${response.status}): ${errorText || response.statusText}` },
        { status: response.status }
      );
    }

    const data = (await response.json()) as Record<string, unknown>;
    const result = extractResult(data);

    return NextResponse.json({
      success: true,
      result,
      query,
    });
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
