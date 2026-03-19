import { connectToDatabase } from '@/lib/db/connection';
import { AppConfig } from '@/lib/db/models/AppConfig';
import type {
  IAppConfigLlm,
  IAppConfigEmbeddings,
  IAppConfigRag,
  IAppConfigTunables,
} from '@/lib/db/models/AppConfig';

export type AppConfigData = {
  llm: IAppConfigLlm;
  embeddings: IAppConfigEmbeddings;
  rag: IAppConfigRag;
  tunables: IAppConfigTunables;
};

const DEFAULTS: AppConfigData = {
  llm: {
    provider: 'openai',
    model: 'gpt-4-turbo',
    ollamaBaseUrl: 'http://localhost:11434',
  },
  embeddings: {
    provider: 'voyage',
    model: 'voyage-4-large',
    dimensions: 1024,
    maxTextChars: 8000,
    ollamaBaseUrl: 'http://localhost:11434',
    ollamaCliPath: '',
  },
  rag: {
    maxTotalChars: 1500,
    excerptChars: 200,
    numCandidatesBase: 100,
    numCandidatesMultiplier: 20,
  },
  tunables: {
    repurposingMaxScriptChars: 4000,
    autoTaggerMaxTextChars: 500,
    searchDefaultLimit: 10,
    searchDefaultMode: 'vector',
    newsResearchCacheHours: 6,
  },
};

let cachedConfig: AppConfigData | null = null;

/**
 * Resolves the current AppConfig from MongoDB. Seeds with defaults if empty.
 * Used by all AI code to get llm, embeddings, rag, and tunables.
 */
export async function getAppConfig(): Promise<AppConfigData> {
  if (cachedConfig) {
    return cachedConfig;
  }

  await connectToDatabase();

  let doc = await AppConfig.findOne().lean() as Record<string, unknown> | null;
  if (!doc) {
    const created = await AppConfig.create(DEFAULTS);
    doc = created.toObject() as Record<string, unknown>;
  }
  const d = doc as { llm?: { provider?: string; model?: string; ollamaBaseUrl?: string }; embeddings?: { provider?: string; model?: string; dimensions?: number; maxTextChars?: number; ollamaBaseUrl?: string; ollamaCliPath?: string }; rag?: { maxTotalChars?: number; excerptChars?: number; numCandidatesBase?: number; numCandidatesMultiplier?: number }; tunables?: { repurposingMaxScriptChars?: number; autoTaggerMaxTextChars?: number; searchDefaultLimit?: number; searchDefaultMode?: string; newsResearchCacheHours?: number } };

  const config: AppConfigData = {
    llm: {
      provider: (d.llm?.provider as 'openai' | 'anthropic' | 'ollama') ?? DEFAULTS.llm.provider,
      model: d.llm?.model ?? DEFAULTS.llm.model,
      ollamaBaseUrl: d.llm?.ollamaBaseUrl ?? DEFAULTS.llm.ollamaBaseUrl,
    },
    embeddings: {
      provider: (d.embeddings?.provider as 'voyage' | 'ollama') ?? DEFAULTS.embeddings.provider,
      model: d.embeddings?.model ?? DEFAULTS.embeddings.model,
      dimensions: d.embeddings?.dimensions ?? DEFAULTS.embeddings.dimensions,
      maxTextChars: d.embeddings?.maxTextChars ?? DEFAULTS.embeddings.maxTextChars,
      ollamaBaseUrl: d.embeddings?.ollamaBaseUrl ?? DEFAULTS.embeddings.ollamaBaseUrl,
      ollamaCliPath: d.embeddings?.ollamaCliPath ?? DEFAULTS.embeddings.ollamaCliPath,
    },
    rag: {
      maxTotalChars: d.rag?.maxTotalChars ?? DEFAULTS.rag.maxTotalChars,
      excerptChars: d.rag?.excerptChars ?? DEFAULTS.rag.excerptChars,
      numCandidatesBase: d.rag?.numCandidatesBase ?? DEFAULTS.rag.numCandidatesBase,
      numCandidatesMultiplier: d.rag?.numCandidatesMultiplier ?? DEFAULTS.rag.numCandidatesMultiplier,
    },
    tunables: {
      repurposingMaxScriptChars: d.tunables?.repurposingMaxScriptChars ?? DEFAULTS.tunables.repurposingMaxScriptChars,
      autoTaggerMaxTextChars: d.tunables?.autoTaggerMaxTextChars ?? DEFAULTS.tunables.autoTaggerMaxTextChars,
      searchDefaultLimit: d.tunables?.searchDefaultLimit ?? DEFAULTS.tunables.searchDefaultLimit,
      searchDefaultMode: (d.tunables?.searchDefaultMode as 'vector' | 'hybrid') ?? DEFAULTS.tunables.searchDefaultMode,
      newsResearchCacheHours: d.tunables?.newsResearchCacheHours ?? DEFAULTS.tunables.newsResearchCacheHours,
    },
  };

  cachedConfig = config;
  return config;
}

/**
 * Clears the config cache. Call after PUT /api/settings to ensure next read gets fresh data.
 */
export function clearAppConfigCache(): void {
  cachedConfig = null;
}
