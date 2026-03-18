import { getOpenAIClient } from './openai-client';
import { logAiUsage } from './usage-logger';
import { getProfileInstruction } from './instruction-profile';
import { getRagContext } from './rag-retrieval';

export async function generateHooks(
  scriptContent: string,
  audienceLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
  profileId?: string | null,
  options?: { includeRag?: boolean; ragLimit?: number }
) {
  const client = getOpenAIClient();
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

    const [youtubeResponse, tiktokResponse] = await Promise.all([
      client.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: youtubeMessages,
        temperature: 0.8,
        max_tokens: 500,
      }),
      client.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: tiktokMessages,
        temperature: 0.8,
        max_tokens: 500,
      }),
    ]);

    const duration = Date.now() - startTime;
    const totalTokens = (youtubeResponse.usage?.total_tokens || 0) + (tiktokResponse.usage?.total_tokens || 0);

    const youtubeHooks = parseHooks(youtubeResponse.choices[0].message.content || '');
    const tiktokHooks = parseHooks(tiktokResponse.choices[0].message.content || '');

    // Fire-and-forget logging
    logAiUsage({
      category: 'hook-generation',
      tokensUsed: totalTokens,
      durationMs: duration,
      success: true,
    }).catch(console.error);

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

    logAiUsage({
      category: 'hook-generation',
      tokensUsed: 0,
      durationMs: duration,
      success: false,
      errorMessage,
    }).catch(console.error);

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
