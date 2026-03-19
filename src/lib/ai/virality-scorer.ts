import { z } from 'zod';
import { llmChat } from './llm-provider';
import { getProfileInstruction } from './instruction-profile';

const ViralityResponseSchema = z.object({
  viralityScore: z.number().min(0).max(100),
  viralityReasoning: z.string(),
});

export async function scoreVirality(
  idea: {
    _id: string;
    title: string;
    description: string;
    platform: string;
    audience: string;
    format: string;
  },
  profileId?: string | null
): Promise<
  | { success: true; viralityScore: number; viralityReasoning: string }
  | { success: false; error: string }
> {
  try {
    const profilePrefix = profileId ? await getProfileInstruction(profileId) : '';
    const baseSystem =
      'You are an expert at assessing content virality for social media. Score content ideas 0-100 for virality potential. Consider: hook strength, shareability, emotional resonance, platform fit, and trend alignment. Return valid JSON only: { "viralityScore": number, "viralityReasoning": string }.';
    const systemContent = profilePrefix
      ? `${profilePrefix}\n\n${baseSystem}`
      : baseSystem;

    const res = await llmChat({
      messages: [
        { role: 'system', content: systemContent },
        {
          role: 'user',
          content: JSON.stringify({
            title: idea.title,
            description: idea.description,
            platform: idea.platform,
            audience: idea.audience,
            format: idea.format,
          }),
        },
      ],
      responseFormat: { type: 'json_object' },
      temperature: 0.3,
      maxTokens: 300,
      category: 'virality-scoring',
    });

    const text = res.content || '{}';
    const parsed = JSON.parse(text);
    const validated = ViralityResponseSchema.parse(parsed);

    return {
      success: true,
      viralityScore: validated.viralityScore,
      viralityReasoning: validated.viralityReasoning,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}
