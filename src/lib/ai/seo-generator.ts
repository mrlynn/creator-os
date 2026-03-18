import { z } from 'zod';
import { getOpenAIClient } from './openai-client';
import { logAiUsage } from './usage-logger';
import { getProfileInstruction } from './instruction-profile';

const SeoResponseSchema = z.object({
  titles: z.array(z.string()),
  recommendedTitle: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
});

export async function generateSeo(
  episode: {
    _id: string;
    title: string;
    scriptText: string;
    tags: string[];
  },
  profileId?: string | null
): Promise<
  | { success: true; data: { titles: string[]; recommendedTitle: string; description: string; tags: string[] } }
  | { success: false; error: string }
> {
  const client = getOpenAIClient();
  const start = Date.now();

  const scriptSummary = episode.scriptText
    ? episode.scriptText.split(/\s+/).slice(0, 500).join(' ')
    : '';
  const tagsStr = episode.tags.length > 0 ? episode.tags.join(', ') : '';

  if (!episode.title && !scriptSummary) {
    return { success: false, error: 'Episode has no content to generate SEO from' };
  }

  const userContent = `Video working title: ${episode.title}
Key topics covered: ${tagsStr}
Script summary or first 500 words: ${scriptSummary}`;

  try {
    const profilePrefix = profileId ? await getProfileInstruction(profileId) : '';
    const baseSystem =
      'You are a YouTube SEO specialist for developer and AI education content. Generate SEO-optimized titles, description, and tags. Return valid JSON only: { "titles": string[], "recommendedTitle": string, "description": string, "tags": string[] }. Titles: 5 variations (keyword-first, curiosity-gap, specific/numerical, pain-point, authority). Description: first 2 lines visible before "Show more", then full 300–500 words, [ADD TIMESTAMPS], [ADD REPO LINK]. Tags: 15–20 YouTube tags.';
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
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 1500,
    });

    const text = res.choices[0].message?.content || '{}';
    const stripped = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(stripped);
    const validated = SeoResponseSchema.parse(parsed);

    logAiUsage({
      category: 'seo-generation',
      tokensUsed: res.usage?.total_tokens || 0,
      durationMs: Date.now() - start,
      success: true,
      relatedDocumentId: episode._id,
      relatedDocumentType: 'Episode',
    }).catch(console.error);

    return {
      success: true,
      data: {
        titles: validated.titles,
        recommendedTitle: validated.recommendedTitle,
        description: validated.description,
        tags: validated.tags,
      },
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logAiUsage({
      category: 'seo-generation',
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
