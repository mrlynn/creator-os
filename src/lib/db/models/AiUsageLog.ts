import mongoose, { Schema, Document } from 'mongoose';

export interface IAiUsageLog extends Document {
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
  aiModel: string;
  costEstimate?: number;
  relatedDocumentId?: mongoose.Types.ObjectId;
  relatedDocumentType?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
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
        'other',
      ],
      required: true,
    },
    tokensUsed: {
      type: Number,
      required: true,
    },
    durationMs: {
      type: Number,
      required: true,
    },
    aiModel: {
      type: String,
      default: 'gpt-4-turbo',
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
  { timestamps: false }
);

AiUsageLogSchema.index({ category: 1 });
AiUsageLogSchema.index({ createdAt: -1 });
AiUsageLogSchema.index({ relatedDocumentId: 1 });

export const AiUsageLog =
  mongoose.models.AiUsageLog ||
  mongoose.model<IAiUsageLog>('AiUsageLog', AiUsageLogSchema);
