import { z } from 'zod';
import { llmChat } from './llm-provider';
import { getProfileInstruction } from './instruction-profile';
import { getRagContext } from './rag-retrieval';

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
  profileId?: string | null,
  options?: { includeRag?: boolean; ragLimit?: number }
): Promise<
  | { success: true; data: { titles: string[]; recommendedTitle: string; description: string; tags: string[] } }
  | { success: false; error: string }
> {
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
    const ragContext =
      options?.includeRag === true
        ? await getRagContext(
            `${episode.title} ${episode.tags.join(' ')}`,
            ['idea', 'episode', 'script'],
            options.ragLimit ?? 3
          )
        : '';
    const baseSystem =
      'You are a YouTube SEO specialist for developer and AI education content. Generate SEO-optimized titles, description, and tags. Return valid JSON only: { "titles": string[], "recommendedTitle": string, "description": string, "tags": string[] }. Titles: 5 variations (keyword-first, curiosity-gap, specific/numerical, pain-point, authority). Description: first 2 lines visible before "Show more", then full 300–500 words, [ADD TIMESTAMPS], [ADD REPO LINK]. Tags: 15–20 YouTube tags.' +
      (ragContext ? `\n\n${ragContext}` : '');
    const systemContent = profilePrefix
      ? `${profilePrefix}\n\n${baseSystem}`
      : baseSystem;

    const res = await llmChat({
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent },
      ],
      responseFormat: { type: 'json_object' },
      temperature: 0.5,
      maxTokens: 1500,
      category: 'seo-generation',
    });

    const text = res.content || '{}';
    const stripped = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(stripped);
    const validated = SeoResponseSchema.parse(parsed);

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
    return { success: false, error: errorMessage };
  }
}
