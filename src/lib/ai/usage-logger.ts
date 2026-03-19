import { connectToDatabase } from '@/lib/db/connection';
import { AiUsageLog } from '@/lib/db/models/AiUsageLog';
import type { AiUsageProvider } from '@/lib/db/models/AiUsageLog';
import { estimateCost, estimateCostFromTotal } from './cost-pricing';

export async function logAiUsage(data: {
  category:
    | 'script-generation'
    | 'hook-generation'
    | 'virality-scoring'
    | 'semantic-search'
    | 'repurposing'
    | 'tagging'
    | 'seo-generation'
    | 'evergreen-scoring'
    | 'planner'
    | 'insight-report'
  | 'embedding'
  | 'prompt-run'
  | 'news-research'
  | 'other';
  tokensUsed: number;
  durationMs: number;
  aiModel?: string;
  provider?: AiUsageProvider;
  promptTokens?: number;
  completionTokens?: number;
  success?: boolean;
  errorMessage?: string;
  relatedDocumentId?: string;
  relatedDocumentType?: string;
}) {
  try {
    await connectToDatabase();

    const provider = data.provider ?? 'openai';
    const model = data.aiModel || 'gpt-4-turbo';

    let costEstimate: number;
    if (
      typeof data.promptTokens === 'number' &&
      typeof data.completionTokens === 'number' &&
      provider !== 'voyage'
    ) {
      costEstimate = estimateCost(
        provider,
        model,
        data.promptTokens,
        data.completionTokens
      );
    } else {
      costEstimate = estimateCostFromTotal(provider, model, data.tokensUsed);
    }

    await AiUsageLog.create({
      category: data.category,
      tokensUsed: data.tokensUsed,
      promptTokens: data.promptTokens,
      completionTokens: data.completionTokens,
      durationMs: data.durationMs,
      aiModel: model,
      provider,
      costEstimate,
      success: data.success !== false,
      errorMessage: data.errorMessage,
      relatedDocumentId: data.relatedDocumentId,
      relatedDocumentType: data.relatedDocumentType,
    });
  } catch (error) {
    console.error('Failed to log AI usage:', error);
  }
}
