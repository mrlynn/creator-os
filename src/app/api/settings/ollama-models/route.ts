import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

/**
 * GET /api/settings/ollama-models?baseUrl=http://localhost:11434
 * Fetches the list of models available from the local Ollama instance.
 * Proxies the request to avoid CORS when the frontend calls from a different origin.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const baseUrl = searchParams.get('baseUrl') ?? 'http://localhost:11434';
    const url = `${baseUrl.replace(/\/$/, '')}/api/tags`;

    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: 'Failed to reach Ollama',
          message: `Ollama returned ${res.status}. Is Ollama running at ${baseUrl}?`,
        },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { models?: { name: string }[] };
    const models = (data.models ?? []).map((m) => ({
      value: m.name,
      label: m.name,
    }));

    return NextResponse.json({ models });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Ollama models fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Ollama models',
        message,
      },
      { status: 500 }
    );
  }
}
