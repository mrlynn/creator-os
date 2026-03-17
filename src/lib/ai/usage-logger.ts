import { connectToDatabase } from '@/lib/db/connection';
import { AiUsageLog } from '@/lib/db/models/AiUsageLog';

export async function logAiUsage(data: {
  category:
    | 'script-generation'
    | 'hook-generation'
    | 'virality-scoring'
    | 'semantic-search'
    | 'repurposing'
    | 'tagging'
    | 'seo-generation'
    | 'other';
  tokensUsed: number;
  durationMs: number;
  aiModel?: string;
  success?: boolean;
  errorMessage?: string;
  relatedDocumentId?: string;
  relatedDocumentType?: string;
}) {
  try {
    await connectToDatabase();
    await AiUsageLog.create({
      category: data.category,
      tokensUsed: data.tokensUsed,
      durationMs: data.durationMs,
      aiModel: data.aiModel || 'gpt-4-turbo',
      success: data.success !== false,
      errorMessage: data.errorMessage,
      relatedDocumentId: data.relatedDocumentId,
      relatedDocumentType: data.relatedDocumentType,
    });
  } catch (error) {
    console.error('Failed to log AI usage:', error);
  }
}
