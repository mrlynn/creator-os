import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getVoyageClient } from '@/lib/ai/embeddings';
import { ollamaEmbed } from '@/lib/ai/ollama-embed';
import { z } from 'zod';

export const maxDuration = 60;

const TestEmbeddingsSchema = z.object({
  provider: z.enum(['voyage', 'ollama']),
  model: z.string().min(1),
  dimensions: z.number().min(256).max(4096),
  ollamaBaseUrl: z.string().url().optional(),
});

/**
 * POST /api/settings/test-embeddings
 * Tests the embedding config with a simple embed. Uses the passed values, not saved config.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = TestEmbeddingsSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { provider, model, dimensions, ollamaBaseUrl } = parseResult.data;
    const testInput = 'Test embedding';

    if (provider === 'ollama') {
      const baseUrl = ollamaBaseUrl ?? 'http://localhost:11434';
      const embedding = await ollamaEmbed(baseUrl, model, testInput);
      const ok = Array.isArray(embedding) && embedding.length > 0;
      const dimMatch = embedding.length === dimensions;
      return NextResponse.json({
        success: ok,
        message: ok
          ? dimMatch
            ? `Embedding successful (${embedding.length} dimensions)`
            : `Embedding returned ${embedding.length} dims; expected ${dimensions}. Update Dimensions to match.`
          : 'Model returned empty embedding',
        dimensions: embedding.length,
      });
    }

    // Voyage
    if (!process.env.VOYAGE_API_KEY) {
      return NextResponse.json(
        { error: 'VOYAGE_API_KEY is not set in environment' },
        { status: 400 }
      );
    }
    const client = getVoyageClient();
    const res = await client.embed({
      input: testInput,
      model,
      inputType: 'document',
      outputDimension: dimensions,
    });
    const embedding = res.data?.[0]?.embedding;
    const ok = Array.isArray(embedding) && embedding.length > 0;
    const dimMatch = ok && embedding!.length === dimensions;
    return NextResponse.json({
      success: ok,
      message: ok
        ? dimMatch
          ? `Embedding successful (${embedding!.length} dimensions)`
          : `Embedding returned ${embedding!.length} dims; expected ${dimensions}`
        : 'Model returned empty embedding',
      dimensions: ok ? embedding!.length : 0,
    });
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    const is403 = err.statusCode === 403 || (err.message && err.message.includes('403'));
    const message = is403
      ? 'Voyage AI returned 403 Forbidden. Check VOYAGE_API_KEY at dash.voyageai.com, or try a different network (IP may be restricted). You can also use Ollama (local) with nomic-embed-text instead.'
      : error instanceof Error ? error.message : 'Unknown error';
    console.error('Embeddings test error:', error);
    return NextResponse.json(
      { error: 'Test failed', message },
      { status: 500 }
    );
  }
}
