/**
 * Ollama embeddings client.
 * API: POST {baseUrl}/api/embed
 * See: https://docs.ollama.com/api/embed
 *
 * Note: nomic-embed-text outputs 768 dimensions. Atlas vector indexes must use
 * numDimensions: 768 when using Ollama embeddings. Voyage models use 1024.
 */

export async function ollamaEmbed(
  baseUrl: string,
  model: string,
  input: string
): Promise<number[]> {
  const url = `${baseUrl.replace(/\/$/, '')}/api/embed`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama embed failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { embeddings?: number[][] };
  const embedding = data.embeddings?.[0];
  if (!embedding || !Array.isArray(embedding)) {
    throw new Error('Invalid Ollama embedding response');
  }
  return embedding;
}
