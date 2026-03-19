import { llmChat } from './llm-provider';
import { getProfileInstruction } from './instruction-profile';
import { getRagContext } from './rag-retrieval';

export async function generateHooks(
  scriptContent: string,
  audienceLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
  profileId?: string | null,
  options?: { includeRag?: boolean; ragLimit?: number }
) {
  const startTime = Date.now();

  try {
    const profileInstruction = profileId
      ? await getProfileInstruction(profileId)
      : '';
    const ragContext =
      options?.includeRag === true
        ? await getRagContext(
            scriptContent.slice(0, 200),
            ['idea', 'episode', 'script'],
            options.ragLimit ?? 3
          )
        : '';
    const ragSuffix = ragContext ? `\n\n${ragContext}` : '';

    const youtubePrompt = `Based on this script content, generate 5 compelling YouTube video hooks (opening lines that make viewers click and watch):

${scriptContent}

Audience Level: ${audienceLevel}
Return exactly 5 hooks, one per line, numbered 1-5.${ragSuffix}`;

    const tiktokPrompt = `Based on this script content, generate 5 punchy, attention-grabbing TikTok hooks (first 3 seconds that stop scrolling):

${scriptContent}

Audience Level: ${audienceLevel}
Return exactly 5 hooks, one per line, numbered 1-5. Keep each under 20 words.${ragSuffix}`;

    const youtubeMessages = profileInstruction
      ? [
          { role: 'system' as const, content: profileInstruction },
          { role: 'user' as const, content: youtubePrompt },
        ]
      : [{ role: 'user' as const, content: youtubePrompt }];

    const tiktokMessages = profileInstruction
      ? [
          { role: 'system' as const, content: profileInstruction },
          { role: 'user' as const, content: tiktokPrompt },
        ]
      : [{ role: 'user' as const, content: tiktokPrompt }];

    const [youtubeResult, tiktokResult] = await Promise.all([
      llmChat({
        messages: youtubeMessages,
        temperature: 0.8,
        maxTokens: 500,
        category: 'hook-generation',
      }),
      llmChat({
        messages: tiktokMessages,
        temperature: 0.8,
        maxTokens: 500,
        category: 'hook-generation',
      }),
    ]);

    const duration = Date.now() - startTime;
    const totalTokens = youtubeResult.tokensUsed + tiktokResult.tokensUsed;

    const youtubeHooks = parseHooks(youtubeResult.content);
    const tiktokHooks = parseHooks(tiktokResult.content);

    return {
      success: true,
      youtubeHooks,
      tiktokHooks,
      tokensUsed: totalTokens,
      durationMs: duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      durationMs: duration,
    };
  }
}

function parseHooks(content: string): string[] {
  return content
    .split('\n')
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter((line) => line.length > 0);
}
