import mongoose, { Schema, Document } from 'mongoose';

export interface INewsResearchCacheItem {
  title: string;
  snippet: string;
  viewCount?: string;
}

export interface INewsResearchCache extends Document {
  topicKey: string;
  newsItems: INewsResearchCacheItem[];
  youtubeItems: INewsResearchCacheItem[];
  tiktokItems: INewsResearchCacheItem[];
  fetchedAt: Date;
  expiresAt: Date;
}

const NewsResearchCacheItemSchema = new Schema(
  {
    title: { type: String, required: true },
    snippet: { type: String, default: '' },
    viewCount: { type: String },
  },
  { _id: false }
);

const NewsResearchCacheSchema = new Schema<INewsResearchCache>(
  {
    topicKey: { type: String, required: true, unique: true },
    newsItems: {
      type: [NewsResearchCacheItemSchema],
      default: [],
    },
    youtubeItems: {
      type: [NewsResearchCacheItemSchema],
      default: [],
    },
    tiktokItems: {
      type: [NewsResearchCacheItemSchema],
      default: [],
    },
    fetchedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: false }
);

// TTL index: MongoDB automatically removes documents when expiresAt has passed
NewsResearchCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const NewsResearchCache =
  mongoose.models.NewsResearchCache ||
  mongoose.model<INewsResearchCache>('NewsResearchCache', NewsResearchCacheSchema);
