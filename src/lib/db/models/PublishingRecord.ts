import mongoose, { Schema, Document } from 'mongoose';

export interface IPublishingRecord extends Document {
  episodeId: mongoose.Types.ObjectId;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'custom';
  status: 'scheduled' | 'live' | 'processing' | 'failed';
  publishedUrl?: string;
  publishedDate?: Date;
  scheduledDate?: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PublishingRecordSchema = new Schema<IPublishingRecord>(
  {
    episodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Episode',
      required: true,
    },
    platform: {
      type: String,
      enum: ['youtube', 'tiktok', 'instagram', 'custom'],
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'processing', 'failed'],
      default: 'scheduled',
    },
    publishedUrl: String,
    publishedDate: Date,
    scheduledDate: Date,
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
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

PublishingRecordSchema.index({ episodeId: 1 });
PublishingRecordSchema.index({ platform: 1 });
PublishingRecordSchema.index({ status: 1 });
PublishingRecordSchema.index({ publishedDate: -1 });

export const PublishingRecord =
  mongoose.models.PublishingRecord ||
  mongoose.model<IPublishingRecord>(
    'PublishingRecord',
    PublishingRecordSchema
  );
