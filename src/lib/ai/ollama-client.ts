/**
 * Ollama client for local LLM inference.
 * API: POST {baseUrl}/api/chat
 */

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatResponse {
  message: { role: string; content?: string; thinking?: string };
  prompt_eval_count?: number;
  eval_count?: number;
  eval_duration?: number;
}

export async function ollamaChat(
  baseUrl: string,
  model: string,
  messages: OllamaMessage[],
  options?: { temperature?: number; num_predict?: number; format?: 'json'; think?: boolean }
): Promise<{
  content: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}> {
  const url = `${baseUrl.replace(/\/$/, '')}/api/chat`;
  const body: Record<string, unknown> = {
    model,
    messages,
    stream: false,
    format: options?.format,
    options: {
      temperature: options?.temperature ?? 0.7,
      num_predict: options?.num_predict ?? 2000,
    },
  };
  if (options?.think === false) {
    body.think = false;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama request failed: ${res.status} ${err}`);
  }

  const data: OllamaChatResponse = await res.json();
  const content =
    data.message?.content ??
    data.message?.thinking ??
    '';
  const promptTokens = data.prompt_eval_count ?? 0;
  const completionTokens = data.eval_count ?? 0;
  const totalTokens = promptTokens + completionTokens;

  return {
    content,
    promptTokens,
    completionTokens,
    totalTokens,
  };
}
