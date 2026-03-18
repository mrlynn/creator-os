import mongoose, { Schema, Document } from 'mongoose';

export type PlatformConnectionPlatform = 'youtube' | 'tiktok';

export interface IPlatformConnection extends Document {
  userId: string;
  platform: PlatformConnectionPlatform;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  platformUserId: string;
  platformUsername?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformConnectionSchema = new Schema<IPlatformConnection>(
  {
    userId: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      enum: ['youtube', 'tiktok'],
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    platformUserId: {
      type: String,
      required: true,
    },
    platformUsername: String,
  },
  { timestamps: true }
);

PlatformConnectionSchema.index({ userId: 1, platform: 1 }, { unique: true });

export const PlatformConnection =
  mongoose.models.PlatformConnection ||
  mongoose.model<IPlatformConnection>('PlatformConnection', PlatformConnectionSchema);
