import { llmChat } from './llm-provider';
import { getProfileInstruction } from './instruction-profile';
import { getRagContext } from './rag-retrieval';

export async function generateOutlineFromIdea(idea: {
  title: string;
  description: string;
  platform: string;
  audience: string;
  format: string;
}): Promise<{ success: boolean; outline?: string; error?: string }> {
  try {
    const systemPrompt = `You are a content strategist for developer advocates. Given a content idea, create a brief bullet-point outline for a script. The outline should be 4-8 bullet points that will later be expanded into a full script with Hook, Problem, Solution, Demo, CTA, Outro. Keep each bullet concise (one line).`;

    const userPrompt = `Create a script outline for this idea:

Title: ${idea.title}
Description: ${idea.description}
Platform: ${idea.platform}
Audience: ${idea.audience}
Format: ${idea.format}

Return only the bullet-point outline, one point per line. No preamble.`;

    const result = await llmChat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      maxTokens: 500,
      category: 'script-generation',
    });

    const outline = result.content.trim() || '';
    return { success: true, outline };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

export async function generateScriptFromOutline(
  outline: string,
  audienceLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
  profileId?: string | null,
  options?: { includeRag?: boolean; ragLimit?: number }
) {
  try {
    const profilePrefix = profileId ? await getProfileInstruction(profileId) : '';
    const ragContext =
      options?.includeRag === true
        ? await getRagContext(
            outline.slice(0, 200),
            ['idea', 'episode', 'script'],
            options.ragLimit ?? 3
          )
        : '';
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
- Advanced: Dive deep into nuances and edge cases${ragContext ? `\n\n${ragContext}` : ''}`;
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

    const result = await llmChat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 2000,
      category: 'script-generation',
    });

    const content = result.content;

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
      tokensUsed: result.tokensUsed,
      durationMs: result.durationMs,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      durationMs: 0,
    };
  }
}

function extractSection(content: string, sectionName: string): string {
  const regex = new RegExp(`\\[${sectionName}\\]\\s*([\\s\\S]*?)(?=\\[|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}
