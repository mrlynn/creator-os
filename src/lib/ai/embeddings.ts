import { VoyageAIClient } from 'voyageai';
import { logAiUsage } from './usage-logger';
import { getAppConfig } from '@/lib/config/app-config';
import { ollamaEmbed } from './ollama-embed';

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

  const config = await getAppConfig();
  const { provider, model, dimensions, maxTextChars, ollamaBaseUrl } =
    config.embeddings;

  const truncated =
    text.length > maxTextChars ? text.slice(0, maxTextChars) : text;
  const start = Date.now();

  if (provider === 'ollama') {
    const baseUrl = ollamaBaseUrl ?? 'http://localhost:11434';
    const embedding = await ollamaEmbed(baseUrl, model, truncated);
    const durationMs = Date.now() - start;
    logAiUsage({
      category: 'embedding',
      tokensUsed: 0,
      durationMs,
      aiModel: model,
      provider: 'ollama',
      success: true,
    }).catch(console.error);
    return embedding;
  }

  const client = getVoyageClient();
  const res = await client.embed({
    input: truncated,
    model,
    inputType: options?.inputType ?? 'document',
    outputDimension: dimensions,
  });

  const durationMs = Date.now() - start;
  logAiUsage({
    category: 'embedding',
    tokensUsed: res.usage?.totalTokens ?? 0,
    durationMs,
    aiModel: model,
    provider: 'voyage',
    success: true,
  }).catch(console.error);

  const embedding = res.data?.[0]?.embedding;
  if (!embedding || !Array.isArray(embedding)) {
    throw new Error('Invalid embedding response');
  }
  return embedding;
}
