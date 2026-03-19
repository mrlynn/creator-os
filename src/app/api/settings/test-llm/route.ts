import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

export const maxDuration = 120;
import { getOpenAIClient } from '@/lib/ai/openai-client';
import { ollamaChat } from '@/lib/ai/ollama-client';
import { z } from 'zod';

const TestLlmSchema = z.object({
  provider: z.enum(['openai', 'ollama']),
  model: z.string().min(1),
  ollamaBaseUrl: z.string().url().optional(),
});

/**
 * POST /api/settings/test-llm
 * Tests the configured LLM with a simple prompt. Uses the passed values, not saved config.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = TestLlmSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { provider, model, ollamaBaseUrl } = parseResult.data;
    const testPrompt = 'Reply with exactly: OK';

    if (provider === 'ollama') {
      const baseUrl = ollamaBaseUrl ?? 'http://localhost:11434';
      const result = await ollamaChat(
        baseUrl,
        model,
        [{ role: 'user', content: testPrompt }],
        { temperature: 0, num_predict: 50, think: false }
      );
      const content = result.content?.trim() ?? '';
      const ok = content.length > 0;
      return NextResponse.json({
        success: ok,
        message: ok ? 'Model responded successfully' : 'Model returned empty response',
        response: content.slice(0, 200),
      });
    }

    // OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not set in environment' },
        { status: 400 }
      );
    }
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: testPrompt }],
      temperature: 0,
      max_tokens: 50,
    });
    const content = (response.choices?.[0]?.message?.content ?? '').trim();
    const ok = content.length > 0;
    return NextResponse.json({
      success: ok,
      message: ok ? 'Model responded successfully' : 'Model returned empty response',
      response: content.slice(0, 200),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('LLM test error:', error);
    return NextResponse.json(
      { error: 'Test failed', message },
      { status: 500 }
    );
  }
}
