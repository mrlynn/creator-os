import { VoyageAIClient } from 'voyageai';
import { logAiUsage } from './usage-logger';

const MAX_TEXT_CHARS = 8000;

let voyageClient: VoyageAIClient | null = null;

export function getVoyageClient(): VoyageAIClient {
  if (!voyageClient) {
    const apiKey = process.env.VOYAGE_API_KEY;
    if (!apiKey) {
      throw new Error('VOYAGE_API_KEY is not set');
    }
    voyageClient = new VoyageAIClient({ apiKey });
  }
  return voyageClient;
}

export async function embed(
  text: string,
  options?: { inputType?: 'query' | 'document' }
): Promise<number[]> {
  if (!text || !text.trim()) {
    return [];
  }

  const truncated =
    text.length > MAX_TEXT_CHARS ? text.slice(0, MAX_TEXT_CHARS) : text;
  const start = Date.now();

  const client = getVoyageClient();
  const res = await client.embed({
    input: truncated,
    model: 'voyage-3-large',
    inputType: options?.inputType ?? 'document',
    outputDimension: 1024,
  });

  const durationMs = Date.now() - start;
  logAiUsage({
    category: 'embedding',
    tokensUsed: res.usage?.totalTokens ?? 0,
    durationMs,
    aiModel: 'voyage-3-large',
    success: true,
  }).catch(console.error);

  const embedding = res.data?.[0]?.embedding;
  if (!embedding || !Array.isArray(embedding)) {
    throw new Error('Invalid embedding response');
  }
  return embedding;
}
