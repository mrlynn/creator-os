import mongoose, { Schema, Document } from 'mongoose';

export interface ISeries extends Document {
  title: string;
  description?: string;
  episodeCount: number;
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const SeriesSchema = new Schema<ISeries>(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    episodeCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

SeriesSchema.index({ status: 1 });
SeriesSchema.index({ createdAt: -1 });

export const Series =
  mongoose.models.Series || mongoose.model<ISeries>('Series', SeriesSchema);
