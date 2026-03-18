import { getOpenAIClient } from './openai-client';
import { logAiUsage } from './usage-logger';
import { getProfileInstruction } from './instruction-profile';

export async function generateScriptFromOutline(
  outline: string,
  audienceLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
  profileId?: string | null
) {
  const client = getOpenAIClient();
  const startTime = Date.now();

  try {
    const profilePrefix = profileId ? await getProfileInstruction(profileId) : '';
    const baseSystemPrompt = `You are an expert content creator and scriptwriter. Create engaging, structured scripts for developers.

The script should have these sections separated by clear markers:
- Hook: A compelling opening that grabs attention (1-2 sentences)
- Problem: The problem being solved (2-3 sentences)
- Solution: The solution approach (3-4 sentences)
- Demo: Code or visual demonstration (4-5 sentences)
- CTA: Call to action (1-2 sentences)
- Outro: Closing remarks (1-2 sentences)

Audience Level: ${audienceLevel}
- Beginner: Explain concepts clearly, assume minimal technical knowledge
- Intermediate: Balance detail with clarity, skip basics
- Advanced: Dive deep into nuances and edge cases`;
    const systemPrompt = profilePrefix
      ? `${profilePrefix}\n\n${baseSystemPrompt}`
      : baseSystemPrompt;

    const userPrompt = `Create a complete script based on this outline:

${outline}

Format the response with these exact markers on new lines:
[HOOK]
[PROBLEM]
[SOLUTION]
[DEMO]
[CTA]
[OUTRO]`;

    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content || '';
    const duration = Date.now() - startTime;

    // Fire-and-forget logging
    logAiUsage({
      category: 'script-generation',
      tokensUsed: response.usage?.total_tokens || 0,
      durationMs: duration,
      success: true,
    }).catch(console.error);

    // Parse sections
    const sections = {
      hook: extractSection(content, 'HOOK'),
      problem: extractSection(content, 'PROBLEM'),
      solution: extractSection(content, 'SOLUTION'),
      demo: extractSection(content, 'DEMO'),
      cta: extractSection(content, 'CTA'),
      outro: extractSection(content, 'OUTRO'),
    };

    return {
      success: true,
      script: content,
      sections,
      tokensUsed: response.usage?.total_tokens || 0,
      durationMs: duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logAiUsage({
      category: 'script-generation',
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

function extractSection(content: string, sectionName: string): string {
  const regex = new RegExp(`\\[${sectionName}\\]\\s*([\\s\\S]*?)(?=\\[|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}
