import { z } from 'zod';
import { llmChat } from './llm-provider';
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

    const res = await llmChat({
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: inputText },
      ],
      responseFormat: { type: 'json_object' },
      temperature: 0.3,
      maxTokens: 300,
      category: 'evergreen-scoring',
    });

    const text = res.content || '{}';
    const stripped = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(stripped);
    const validated = EvergreenResponseSchema.parse(parsed);

    return {
      success: true,
      evergreenScore: validated.evergreenScore,
      reasoning: validated.reasoning,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}
