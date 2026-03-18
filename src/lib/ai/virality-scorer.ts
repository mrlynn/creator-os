import { z } from 'zod';
import { getOpenAIClient } from './openai-client';
import { logAiUsage } from './usage-logger';

const ViralityResponseSchema = z.object({
  viralityScore: z.number().min(0).max(100),
  viralityReasoning: z.string(),
});

export async function scoreVirality(idea: {
  _id: string;
  title: string;
  description: string;
  platform: string;
  audience: string;
  format: string;
}): Promise<
  | { success: true; viralityScore: number; viralityReasoning: string }
  | { success: false; error: string }
> {
  const client = getOpenAIClient();
  const start = Date.now();

  try {
    const res = await client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at assessing content virality for social media. Score content ideas 0-100 for virality potential. Consider: hook strength, shareability, emotional resonance, platform fit, and trend alignment. Return valid JSON only: { "viralityScore": number, "viralityReasoning": string }.',
        },
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
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 300,
    });

    const text = res.choices[0].message?.content || '{}';
    const parsed = JSON.parse(text);
    const validated = ViralityResponseSchema.parse(parsed);

    logAiUsage({
      category: 'virality-scoring',
      tokensUsed: res.usage?.total_tokens || 0,
      durationMs: Date.now() - start,
      success: true,
      relatedDocumentId: idea._id,
      relatedDocumentType: 'ContentIdea',
    }).catch(console.error);

    return {
      success: true,
      viralityScore: validated.viralityScore,
      viralityReasoning: validated.viralityReasoning,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logAiUsage({
      category: 'virality-scoring',
      tokensUsed: 0,
      durationMs: Date.now() - start,
      success: false,
      errorMessage,
      relatedDocumentId: idea._id,
      relatedDocumentType: 'ContentIdea',
    }).catch(console.error);

    return { success: false, error: errorMessage };
  }
}
