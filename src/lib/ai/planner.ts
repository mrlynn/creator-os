import { z } from 'zod';
import { llmChat } from './llm-provider';
import { getProfileInstruction } from './instruction-profile';

const PlannerItemSchema = z.object({
  day: z.string(),
  ideaId: z.string().optional(),
  title: z.string(),
  rationale: z.string().optional(),
  derivedFrom: z.string().optional(),
});

const PlannerResponseSchema = z.object({
  youtube: z.array(PlannerItemSchema),
  tiktok: z.array(PlannerItemSchema),
  warnings: z.array(z.string()),
  suggestedNewIdeas: z.array(z.string()),
});

export async function generateWeeklyPlan(
  params: {
    ideas: string;
    publishedRecently: string;
    weekOf: string;
  },
  profileId?: string | null
): Promise<
  | {
      success: true;
      data: {
        youtube: Array<{ day: string; ideaId?: string; title: string; rationale?: string }>;
        tiktok: Array<{ day: string; ideaId?: string; title: string; derivedFrom?: string }>;
        warnings: string[];
        suggestedNewIdeas: string[];
      };
    }
  | { success: false; error: string }
> {
  const userContent = `Publishing targets: 3 YouTube videos/week + 5 TikToks/week
Week of: ${params.weekOf}

Available ideas in backlog (title | audience | platform | viralityScore | _id):
${params.ideas || '(No ideas in backlog)'}

Recently published:
${params.publishedRecently || '(None)'}

Create an optimal week plan. Return valid JSON: { "youtube": [{ "day": string, "ideaId": string, "title": string, "rationale": string }], "tiktok": [{ "day": string, "ideaId": string, "title": string, "derivedFrom": string|null }], "warnings": string[], "suggestedNewIdeas": string[] }`;

  try {
    const profilePrefix = profileId ? await getProfileInstruction(profileId) : '';
    const baseSystem =
      'You are a content calendar strategist for a developer advocate creating AI & software development content. Create optimal week plans. Use ideaId from the ideas list when matching. Return valid JSON only.';
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
      category: 'planner',
    });

    const text = res.content || '{}';
    const stripped = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(stripped);
    const validated = PlannerResponseSchema.parse(parsed);

    return {
      success: true,
      data: {
        youtube: validated.youtube,
        tiktok: validated.tiktok,
        warnings: validated.warnings,
        suggestedNewIdeas: validated.suggestedNewIdeas,
      },
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}
