import mongoose, { Schema, Document } from 'mongoose';

export interface ITag extends Document {
  name: string;
  slug: string;
  description?: string;
  category: 'topic' | 'platform' | 'audience' | 'format';
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    category: {
      type: String,
      enum: ['topic', 'platform', 'audience', 'format'],
      required: true,
    },
  },
  { timestamps: true }
);

TagSchema.index({ slug: 1 });
TagSchema.index({ category: 1 });

export const Tag = mongoose.models.Tag || mongoose.model<ITag>('Tag', TagSchema);
