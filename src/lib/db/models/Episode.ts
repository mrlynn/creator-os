import mongoose, { Schema, Document } from 'mongoose';

export interface IEpisode extends Document {
  ideaId: mongoose.Types.ObjectId;
  scriptId: mongoose.Types.ObjectId;
  seriesId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  recordingDate?: Date;
  editingStatus: 'not-started' | 'recording' | 'editing' | 'done';
  publishingStatus: 'draft' | 'scheduled' | 'published' | 'archived';
  tags: mongoose.Types.ObjectId[];
  publishingRecords: mongoose.Types.ObjectId[];
  aiMetadata?: {
    evergreenScore?: number;
    evergreenReasoning?: string;
  };
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

const EpisodeSchema = new Schema<IEpisode>(
  {
    ideaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContentIdea',
      required: true,
    },
    scriptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Script',
      required: true,
    },
    seriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Series',
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    thumbnailUrl: String,
    videoUrl: String,
    recordingDate: Date,
    editingStatus: {
      type: String,
      enum: ['not-started', 'recording', 'editing', 'done'],
      default: 'not-started',
    },
    publishingStatus: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'archived'],
      default: 'draft',
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    publishingRecords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PublishingRecord',
      },
    ],
    aiMetadata: {
      evergreenScore: Number,
      evergreenReasoning: String,
    },
    embedding: { type: [Number], select: false },
  },
  { timestamps: true }
);

EpisodeSchema.index({ editingStatus: 1 });
EpisodeSchema.index({ publishingStatus: 1 });
EpisodeSchema.index({ ideaId: 1 });
EpisodeSchema.index({ scriptId: 1 });
EpisodeSchema.index({ createdAt: -1 });

export const Episode =
  mongoose.models.Episode || mongoose.model<IEpisode>('Episode', EpisodeSchema);
