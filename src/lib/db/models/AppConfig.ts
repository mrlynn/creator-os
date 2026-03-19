import mongoose, { Schema, Document } from 'mongoose';

export interface IAppConfigLlm {
  provider: 'openai' | 'anthropic' | 'ollama';
  model: string;
  ollamaBaseUrl?: string;
}

export interface IAppConfigEmbeddings {
  provider: 'voyage' | 'ollama';
  model: string;
  dimensions: number;
  maxTextChars: number;
  ollamaBaseUrl?: string;
  ollamaCliPath?: string;
}

export interface IAppConfigRag {
  maxTotalChars: number;
  excerptChars: number;
  numCandidatesBase: number;
  numCandidatesMultiplier: number;
}

export interface IAppConfigTunables {
  repurposingMaxScriptChars: number;
  autoTaggerMaxTextChars: number;
  searchDefaultLimit: number;
  searchDefaultMode: 'vector' | 'hybrid';
  newsResearchCacheHours: number;
}

export interface IAppConfig extends Document {
  llm: IAppConfigLlm;
  embeddings: IAppConfigEmbeddings;
  rag: IAppConfigRag;
  tunables: IAppConfigTunables;
  updatedAt: Date;
}

const AppConfigLlmSchema = new Schema<IAppConfigLlm>(
  {
    provider: {
      type: String,
      enum: ['openai', 'anthropic', 'ollama'],
      default: 'openai',
    },
    model: {
      type: String,
      default: 'gpt-4-turbo',
    },
    ollamaBaseUrl: {
      type: String,
      default: 'http://localhost:11434',
    },
  },
  { _id: false }
);

const AppConfigEmbeddingsSchema = new Schema<IAppConfigEmbeddings>(
  {
    provider: {
      type: String,
      enum: ['voyage', 'ollama'],
      default: 'voyage',
    },
    model: {
      type: String,
      default: 'voyage-4-large',
    },
    dimensions: {
      type: Number,
      default: 1024,
    },
    maxTextChars: {
      type: Number,
      default: 8000,
    },
    ollamaBaseUrl: {
      type: String,
      default: 'http://localhost:11434',
    },
    ollamaCliPath: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const AppConfigRagSchema = new Schema<IAppConfigRag>(
  {
    maxTotalChars: {
      type: Number,
      default: 1500,
    },
    excerptChars: {
      type: Number,
      default: 200,
    },
    numCandidatesBase: {
      type: Number,
      default: 100,
    },
    numCandidatesMultiplier: {
      type: Number,
      default: 20,
    },
  },
  { _id: false }
);

const AppConfigTunablesSchema = new Schema<IAppConfigTunables>(
  {
    repurposingMaxScriptChars: {
      type: Number,
      default: 4000,
    },
    autoTaggerMaxTextChars: {
      type: Number,
      default: 500,
    },
    searchDefaultLimit: {
      type: Number,
      default: 10,
    },
    searchDefaultMode: {
      type: String,
      enum: ['vector', 'hybrid'],
      default: 'vector',
    },
    newsResearchCacheHours: {
      type: Number,
      default: 6,
    },
  },
  { _id: false }
);

const AppConfigSchema = new Schema<IAppConfig>(
  {
    llm: {
      type: AppConfigLlmSchema,
      default: () => ({}),
    },
    embeddings: {
      type: AppConfigEmbeddingsSchema,
      default: () => ({}),
    },
    rag: {
      type: AppConfigRagSchema,
      default: () => ({}),
    },
    tunables: {
      type: AppConfigTunablesSchema,
      default: () => ({}),
    },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const AppConfig =
  mongoose.models.AppConfig ||
  mongoose.model<IAppConfig>('AppConfig', AppConfigSchema);
