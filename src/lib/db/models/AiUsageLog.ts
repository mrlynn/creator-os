import mongoose, { Schema, Document } from 'mongoose';

export type AiUsageProvider = 'openai' | 'voyage' | 'ollama';

export interface IAiUsageLog extends Document {
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
  promptTokens?: number;
  completionTokens?: number;
  durationMs: number;
  aiModel: string;
  provider?: AiUsageProvider;
  costEstimate?: number;
  relatedDocumentId?: mongoose.Types.ObjectId;
  relatedDocumentType?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const AiUsageLogSchema = new Schema<IAiUsageLog>(
  {
    category: {
      type: String,
      enum: [
        'script-generation',
        'hook-generation',
        'virality-scoring',
        'semantic-search',
        'repurposing',
        'tagging',
        'seo-generation',
        'evergreen-scoring',
        'planner',
        'insight-report',
        'embedding',
        'prompt-run',
        'news-research',
        'other',
      ],
      required: true,
    },
    tokensUsed: {
      type: Number,
      required: true,
    },
    promptTokens: Number,
    completionTokens: Number,
    durationMs: {
      type: Number,
      required: true,
    },
    aiModel: {
      type: String,
      default: 'gpt-4-turbo',
    },
    provider: {
      type: String,
      enum: ['openai', 'voyage', 'ollama'],
    },
    costEstimate: Number,
    relatedDocumentId: mongoose.Schema.Types.ObjectId,
    relatedDocumentType: String,
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

AiUsageLogSchema.index({ category: 1 });
AiUsageLogSchema.index({ createdAt: -1 });
AiUsageLogSchema.index({ provider: 1 });
AiUsageLogSchema.index({ relatedDocumentId: 1 });

export const AiUsageLog =
  mongoose.models.AiUsageLog ||
  mongoose.model<IAiUsageLog>('AiUsageLog', AiUsageLogSchema);
