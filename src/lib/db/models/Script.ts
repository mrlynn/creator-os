import mongoose, { Schema, Document } from 'mongoose';

export interface IScript extends Document {
  ideaId: mongoose.Types.ObjectId;
  title: string;
  outline?: string;
  hook?: string;
  problem?: string;
  solution?: string;
  demo?: string;
  cta?: string;
  outro?: string;
  youtubeHooks: string[];
  tiktokHooks: string[];
  wordCount: number;
  status: 'outline' | 'draft' | 'final' | 'archived';
  versions: IScriptVersion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IScriptVersion {
  version: number;
  content: string;
  createdAt: Date;
}

const ScriptVersionSchema = new Schema<IScriptVersion>({
  version: Number,
  content: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ScriptSchema = new Schema<IScript>(
  {
    ideaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContentIdea',
      required: true,
    },
    title: String,
    outline: String,
    hook: String,
    problem: String,
    solution: String,
    demo: String,
    cta: String,
    outro: String,
    youtubeHooks: [String],
    tiktokHooks: [String],
    wordCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['outline', 'draft', 'final', 'archived'],
      default: 'outline',
    },
    versions: [ScriptVersionSchema],
  },
  { timestamps: true }
);

ScriptSchema.index({ ideaId: 1 });
ScriptSchema.index({ status: 1 });
ScriptSchema.index({ createdAt: -1 });

export const Script =
  mongoose.models.Script || mongoose.model<IScript>('Script', ScriptSchema);
