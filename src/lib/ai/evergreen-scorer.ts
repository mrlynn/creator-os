import { z } from 'zod';
import { getOpenAIClient } from './openai-client';
import { logAiUsage } from './usage-logger';
import { getProfileInstruction } from './instruction-profile';

const EvergreenResponseSchema = z.object({
  evergreenScore: z.number().min(0).max(100),
  reasoning: z.string(),
});

export async function scoreEvergreen(
  episode: {
    _id: string;
    title: string;
    scriptText?: string;
  },
  profileId?: string | null
): Promise<
  | { success: true; evergreenScore: number; reasoning: string }
  | { success: false; error: string }
> {
  const client = getOpenAIClient();
  const start = Date.now();

  const inputText = [
    episode.title,
    episode.scriptText ? episode.scriptText.slice(0, 500) : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  if (!inputText.trim()) {
    return { success: false, error: 'Episode has no content to score' };
  }

  try {
    const profilePrefix = profileId ? await getProfileInstruction(profileId) : '';
    const baseSystem =
      'You are a content strategist. Rate content longevity 0–100 (evergreen score). Consider: topic stability (does it date quickly?), search intent (evergreen queries?), tutorial vs news. Return valid JSON only: { "evergreenScore": number, "reasoning": string }.';
    const systemContent = profilePrefix
      ? `${profilePrefix}\n\n${baseSystem}`
      : baseSystem;

    const res = await client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: systemContent,
        },
        { role: 'user', content: inputText },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 300,
    });

    const text = res.choices[0].message?.content || '{}';
    const stripped = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(stripped);
    const validated = EvergreenResponseSchema.parse(parsed);

    logAiUsage({
      category: 'evergreen-scoring',
      tokensUsed: res.usage?.total_tokens || 0,
      durationMs: Date.now() - start,
      success: true,
      relatedDocumentId: episode._id,
      relatedDocumentType: 'Episode',
    }).catch(console.error);

    return {
      success: true,
      evergreenScore: validated.evergreenScore,
      reasoning: validated.reasoning,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logAiUsage({
      category: 'evergreen-scoring',
      tokensUsed: 0,
      durationMs: Date.now() - start,
      success: false,
      errorMessage,
      relatedDocumentId: episode._id,
      relatedDocumentType: 'Episode',
    }).catch(console.error);

    return { success: false, error: errorMessage };
  }
}
