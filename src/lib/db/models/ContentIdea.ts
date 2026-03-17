import mongoose, { Schema, Document } from 'mongoose';

export interface IContentIdea extends Document {
  title: string;
  description: string;
  platform: 'youtube' | 'tiktok' | 'long-form' | 'multi';
  audience: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  format: 'tutorial' | 'story' | 'demo' | 'interview' | 'other';
  tags: mongoose.Types.ObjectId[];
  status: 'raw' | 'validated' | 'scripted' | 'published' | 'archived';
  viralityScore?: number;
  viralityReasoning?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContentIdeaSchema = new Schema<IContentIdea>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      enum: ['youtube', 'tiktok', 'long-form', 'multi'],
      required: true,
    },
    audience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
      required: true,
    },
    format: {
      type: String,
      enum: ['tutorial', 'story', 'demo', 'interview', 'other'],
      required: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    status: {
      type: String,
      enum: ['raw', 'validated', 'scripted', 'published', 'archived'],
      default: 'raw',
    },
    viralityScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    viralityReasoning: String,
    notes: String,
  },
  { timestamps: true }
);

ContentIdeaSchema.index({ status: 1 });
ContentIdeaSchema.index({ platform: 1 });
ContentIdeaSchema.index({ audience: 1 });
ContentIdeaSchema.index({ createdAt: -1 });

export const ContentIdea =
  mongoose.models.ContentIdea ||
  mongoose.model<IContentIdea>('ContentIdea', ContentIdeaSchema);
