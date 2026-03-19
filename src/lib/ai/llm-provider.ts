import { getAppConfig } from '@/lib/config/app-config';
import { getOpenAIClient } from './openai-client';
import { ollamaChat } from './ollama-client';
import { logAiUsage } from './usage-logger';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMChatOptions {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
  category?: Parameters<typeof logAiUsage>[0]['category'];
  responseFormat?: { type: 'json_object' };
}

export interface LLMChatResult {
  content: string;
  tokensUsed: number;
  model: string;
  durationMs: number;
}

/**
 * Sends a chat completion request using the configured LLM provider and model.
 * Supports OpenAI and Ollama (local).
 */
export async function llmChat(options: LLMChatOptions): Promise<LLMChatResult> {
  const config = await getAppConfig();
  const provider = config.llm.provider;
  const model = options.model ?? config.llm.model;
  const category = options.category ?? 'other';
  const startTime = Date.now();

  if (provider === 'anthropic') {
    throw new Error('Anthropic provider not yet implemented. Use OpenAI or Ollama.');
  }

  if (provider === 'ollama') {
    const baseUrl = config.llm.ollamaBaseUrl ?? 'http://localhost:11434';
    try {
      const result = await ollamaChat(
        baseUrl,
        model,
        options.messages.map((m) => ({ role: m.role, content: m.content })),
        {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 2000,
          format: options.responseFormat?.type === 'json_object' ? 'json' : undefined,
        }
      );
      const durationMs = Date.now() - startTime;

      logAiUsage({
        category,
        tokensUsed: result.totalTokens,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        durationMs,
        aiModel: model,
        provider: 'ollama',
        success: true,
      }).catch(console.error);

      return {
        content: result.content,
        tokensUsed: result.totalTokens,
        model,
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logAiUsage({
        category,
        tokensUsed: 0,
        durationMs,
        aiModel: model,
        provider: 'ollama',
        success: false,
        errorMessage,
      }).catch(console.error);
      throw error;
    }
  }

  const client = getOpenAIClient();
  try {
    const createParams = {
      model,
      messages: options.messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      stream: false as const,
      ...(options.responseFormat && { response_format: options.responseFormat }),
    };
    const response = await client.chat.completions.create(createParams);

    const content =
      'choices' in response
        ? (response.choices[0]?.message?.content ?? '')
        : '';
    const usage = response.usage;
    const promptTokens = usage?.prompt_tokens ?? 0;
    const completionTokens = usage?.completion_tokens ?? 0;
    const tokensUsed = usage?.total_tokens ?? promptTokens + completionTokens;
    const durationMs = Date.now() - startTime;

    logAiUsage({
      category,
      tokensUsed,
      promptTokens,
      completionTokens,
      durationMs,
      aiModel: model,
      provider: 'openai',
      success: true,
    }).catch(console.error);

    return { content, tokensUsed, model, durationMs };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logAiUsage({
      category,
      tokensUsed: 0,
      durationMs,
      aiModel: model,
      provider: 'openai',
      success: false,
      errorMessage,
    }).catch(console.error);
    throw error;
  }
}
