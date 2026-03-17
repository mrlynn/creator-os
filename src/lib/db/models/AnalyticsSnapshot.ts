import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsSnapshot extends Document {
  episodeId: mongoose.Types.ObjectId;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'overall';
  snapshotDate: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  watchTimeMinutes?: number;
  clickThroughRate?: number;
  engagement?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSnapshotSchema = new Schema<IAnalyticsSnapshot>(
  {
    episodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Episode',
      required: true,
    },
    platform: {
      type: String,
      enum: ['youtube', 'tiktok', 'instagram', 'overall'],
      required: true,
    },
    snapshotDate: {
      type: Date,
      required: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    watchTimeMinutes: Number,
    clickThroughRate: Number,
    engagement: Number,
  },
  { timestamps: true }
);

AnalyticsSnapshotSchema.index({ episodeId: 1, snapshotDate: -1 });
AnalyticsSnapshotSchema.index({ platform: 1 });
AnalyticsSnapshotSchema.index({ snapshotDate: -1 });

export const AnalyticsSnapshot =
  mongoose.models.AnalyticsSnapshot ||
  mongoose.model<IAnalyticsSnapshot>(
    'AnalyticsSnapshot',
    AnalyticsSnapshotSchema
  );
