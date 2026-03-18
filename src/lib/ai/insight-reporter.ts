import { z } from 'zod';
import { getOpenAIClient } from './openai-client';
import { logAiUsage } from './usage-logger';
import { getProfileInstruction } from './instruction-profile';

const ReportResponseSchema = z.object({
  headline: z.string(),
  wins: z.array(z.string()),
  underperformers: z.array(z.string()),
  patterns: z.array(z.string()),
  recommendations: z.array(z.string()),
  momentumScore: z.number().min(1).max(10),
});

export async function generateWeeklyReport(
  params: {
    metricsData: string;
    previousWeekData: string;
    weekOf: string;
  },
  profileId?: string | null
): Promise<
  | {
      success: true;
      data: {
        headline: string;
        wins: string[];
        underperformers: string[];
        patterns: string[];
        recommendations: string[];
        momentumScore: number;
      };
    }
  | { success: false; error: string }
> {
  const client = getOpenAIClient();
  const start = Date.now();

  const userContent = `Week of: ${params.weekOf}

This week's performance data:
${params.metricsData}

Previous week for comparison:
${params.previousWeekData}

Generate a weekly performance report. Return valid JSON: { "headline": string, "wins": string[], "underperformers": string[], "patterns": string[], "recommendations": string[], "momentumScore": number (1-10) }`;

  try {
    const profilePrefix = profileId ? await getProfileInstruction(profileId) : '';
    const baseSystem =
      'You are a content analytics advisor for a developer education creator on YouTube and TikTok. Generate direct, actionable weekly reports. Be honest about what is not working. Return valid JSON only.';
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
      max_tokens: 1000,
    });

    const text = res.choices[0].message?.content || '{}';
    const stripped = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(stripped);
    const validated = ReportResponseSchema.parse(parsed);

    logAiUsage({
      category: 'insight-report',
      tokensUsed: res.usage?.total_tokens || 0,
      durationMs: Date.now() - start,
      success: true,
    }).catch(console.error);

    return {
      success: true,
      data: {
        headline: validated.headline,
        wins: validated.wins,
        underperformers: validated.underperformers,
        patterns: validated.patterns,
        recommendations: validated.recommendations,
        momentumScore: validated.momentumScore,
      },
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logAiUsage({
      category: 'insight-report',
      tokensUsed: 0,
      durationMs: Date.now() - start,
      success: false,
      errorMessage,
    }).catch(console.error);

    return { success: false, error: errorMessage };
  }
}
