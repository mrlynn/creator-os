import mongoose, { Schema, Document } from 'mongoose';

export interface IPrompt extends Document {
  name: string;
  template: string;
  variables: string[];
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  const names = matches.map((m) => m.slice(2, -2));
  return [...new Set(names)];
}

const PromptSchema = new Schema<IPrompt>(
  {
    name: {
      type: String,
      required: true,
    },
    template: {
      type: String,
      required: true,
    },
    variables: {
      type: [String],
      default: [],
    },
    category: String,
  },
  { timestamps: true }
);

PromptSchema.pre('save', function (next) {
  if (this.isModified('template')) {
    this.variables = extractVariables(this.template);
  }
  next();
});

PromptSchema.index({ name: 1 });
PromptSchema.index({ category: 1 });

export const Prompt =
  mongoose.models.Prompt || mongoose.model<IPrompt>('Prompt', PromptSchema);
