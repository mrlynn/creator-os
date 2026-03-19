/**
 * Model-specific pricing for AI cost estimation.
 * Prices per 1M tokens (input, output). Sources: OpenAI, Voyage, Ollama (free).
 */

export type AiProvider = 'openai' | 'voyage' | 'ollama';

interface ModelPricing {
  provider: AiProvider;
  inputPer1M: number;
  outputPer1M: number;
}

const PRICING: Record<string, ModelPricing> = {
  // OpenAI
  'gpt-4-turbo': { provider: 'openai', inputPer1M: 10, outputPer1M: 30 },
  'gpt-4-turbo-2024-04-09': { provider: 'openai', inputPer1M: 10, outputPer1M: 30 },
  'gpt-4o': { provider: 'openai', inputPer1M: 2.5, outputPer1M: 10 },
  'gpt-4o-mini': { provider: 'openai', inputPer1M: 0.15, outputPer1M: 0.6 },
  'gpt-4': { provider: 'openai', inputPer1M: 30, outputPer1M: 60 },
  'gpt-3.5-turbo': { provider: 'openai', inputPer1M: 0.5, outputPer1M: 1.5 },

  // Voyage (embeddings - single rate, no input/output split)
  'voyage-3-large': { provider: 'voyage', inputPer1M: 0.12, outputPer1M: 0.12 },
  'voyage-3': { provider: 'voyage', inputPer1M: 0.06, outputPer1M: 0.06 },
  'voyage-3-lite': { provider: 'voyage', inputPer1M: 0.02, outputPer1M: 0.02 },
  'voyage-4-large': { provider: 'voyage', inputPer1M: 0.12, outputPer1M: 0.12 },
  'voyage-4': { provider: 'voyage', inputPer1M: 0.06, outputPer1M: 0.06 },
  'voyage-4-lite': { provider: 'voyage', inputPer1M: 0.02, outputPer1M: 0.02 },
  'voyage-4-nano': { provider: 'voyage', inputPer1M: 0.01, outputPer1M: 0.01 },
  'nomic-embed-text': { provider: 'ollama', inputPer1M: 0, outputPer1M: 0 },

  // Ollama - local, no cost
  'llama3.2': { provider: 'ollama', inputPer1M: 0, outputPer1M: 0 },
  'llama3.1': { provider: 'ollama', inputPer1M: 0, outputPer1M: 0 },
  'llama3': { provider: 'ollama', inputPer1M: 0, outputPer1M: 0 },
  'mistral': { provider: 'ollama', inputPer1M: 0, outputPer1M: 0 },
  'codellama': { provider: 'ollama', inputPer1M: 0, outputPer1M: 0 },
  'phi3': { provider: 'ollama', inputPer1M: 0, outputPer1M: 0 },
  'gemma': { provider: 'ollama', inputPer1M: 0, outputPer1M: 0 },
  'qwen': { provider: 'ollama', inputPer1M: 0, outputPer1M: 0 },
};

const OPENAI_DEFAULT = { provider: 'openai' as const, inputPer1M: 10, outputPer1M: 30 };
const VOYAGE_DEFAULT = { provider: 'voyage' as const, inputPer1M: 0.12, outputPer1M: 0.12 };
const OLLAMA_DEFAULT = { provider: 'ollama' as const, inputPer1M: 0, outputPer1M: 0 };

function getPricing(model: string, provider: AiProvider): ModelPricing {
  const norm = (s: string) => s.toLowerCase().replace(/[:.-]/g, '');
  const m = norm(model);

  if (provider === 'ollama') {
    for (const [pkey] of Object.entries(PRICING)) {
      if (PRICING[pkey].provider === 'ollama' && m.startsWith(norm(pkey))) {
        return PRICING[pkey];
      }
    }
    return OLLAMA_DEFAULT;
  }
  if (provider === 'voyage') {
    for (const [pkey] of Object.entries(PRICING)) {
      if (PRICING[pkey].provider === 'voyage' && m.includes(norm(pkey))) {
        return PRICING[pkey];
      }
    }
    return VOYAGE_DEFAULT;
  }
  for (const [pkey] of Object.entries(PRICING)) {
    if (PRICING[pkey].provider === 'openai' && (m.includes(norm(pkey)) || norm(pkey).includes(m))) {
      return PRICING[pkey];
    }
  }
  return OPENAI_DEFAULT;
}

/**
 * Compute cost estimate in USD from token counts.
 */
export function estimateCost(
  provider: AiProvider,
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const p = getPricing(model, provider);
  const inputCost = (promptTokens / 1_000_000) * p.inputPer1M;
  const outputCost = (completionTokens / 1_000_000) * p.outputPer1M;
  return inputCost + outputCost;
}

/**
 * For embeddings or when only total tokens known (e.g. Voyage).
 */
export function estimateCostFromTotal(
  provider: AiProvider,
  model: string,
  totalTokens: number
): number {
  const p = getPricing(model, provider);
  const cost = (totalTokens / 1_000_000) * p.inputPer1M;
  return cost;
}
