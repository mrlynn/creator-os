import { getOpenAIClient } from './openai-client';
import { logAiUsage } from './usage-logger';
import { getProfileInstruction } from './instruction-profile';
import { getRagContext } from './rag-retrieval';

const MAX_SCRIPT_CHARS = 4000;
const TIMESTAMP_REGEX = /^\d{1,2}:\d{2}$/;

function isValidTimestampRange(
  tr: unknown
): tr is { start: string; end: string } {
  if (!tr || typeof tr !== 'object') return false;
  const o = tr as Record<string, unknown>;
  return (
    typeof o.start === 'string' &&
    typeof o.end === 'string' &&
    TIMESTAMP_REGEX.test(o.start) &&
    TIMESTAMP_REGEX.test(o.end)
  );
}

export interface ClipConcept {
  clipNumber: number;
  conceptTitle: string;
  originalSection: string;
  estimatedDuration: string;
  newHook: string;
  script: string;
  onScreenTextSuggestions?: string[];
  whyItStandsAlone: string;
  timestampRange?: { start: string; end: string };
}

export async function generateClipConcepts(
  script: string,
  title: string,
  platform: string = 'tiktok',
  profileId?: string | null,
  options?: { includeRag?: boolean; ragLimit?: number }
): Promise<
  | { success: true; clips: ClipConcept[] }
  | { success: false; error: string }
> {
  const client = getOpenAIClient();
  const start = Date.now();

  const truncatedScript =
    script.length > MAX_SCRIPT_CHARS
      ? script.slice(0, MAX_SCRIPT_CHARS) + '...[truncated]'
      : script;

  const profilePrefix = profileId ? await getProfileInstruction(profileId) : '';
  const ragContext =
    options?.includeRag === true
      ? await getRagContext(
          `${title} ${script.slice(0, 200)}`,
          ['idea', 'episode', 'script'],
          options.ragLimit ?? 3
        )
      : '';
  const baseSystemPrompt = `You are a content repurposing specialist for developer education channels.
Your task is to identify 4–6 self-contained moments from a YouTube script that can stand alone as short-form clips for ${platform}.

Return a JSON object with a "clips" array. Each clip must have:
- clipNumber: number (1-based)
- conceptTitle: string
- originalSection: string (which section from the script)
- estimatedDuration: string (e.g. "30-60s")
- newHook: string (hook for the short clip)
- script: string (the clip script content)
- onScreenTextSuggestions: string[] (optional, text overlays)
- whyItStandsAlone: string
- timestampRange: { start: string, end: string } (optional, approximate timestamps in MM:SS format based on script position, e.g. "2:30", "3:45")

Return only valid JSON, no markdown.${ragContext ? `\n\n${ragContext}` : ''}`;
  const systemPrompt = profilePrefix
    ? `${profilePrefix}\n\n${baseSystemPrompt}`
    : baseSystemPrompt;

  const userContent = `Original YouTube script for "${title}":
---
${truncatedScript}
---
Target platform for clips: ${platform}

Identify 4–6 self-contained moments. Return JSON: { "clips": [ { clipNumber, conceptTitle, originalSection, estimatedDuration, newHook, script, onScreenTextSuggestions, whyItStandsAlone, timestampRange?: { start: "MM:SS", end: "MM:SS" } } ] }`;

  try {
    const res = await client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 4000,
    });

    const text = res.choices[0].message?.content || '{}';
    let clean = text.trim();
    if (clean.startsWith('```json')) {
      clean = clean.slice(7);
    } else if (clean.startsWith('```')) {
      clean = clean.slice(3);
    }
    if (clean.endsWith('```')) {
      clean = clean.slice(0, -3);
    }
    clean = clean.trim();

    const parsed = JSON.parse(clean);
    const clips = Array.isArray(parsed.clips) ? parsed.clips : parsed;

    if (!Array.isArray(clips) || clips.length === 0) {
      logAiUsage({
        category: 'repurposing',
        tokensUsed: res.usage?.total_tokens || 0,
        durationMs: Date.now() - start,
        success: false,
        errorMessage: 'No clips returned',
      }).catch(console.error);
      return { success: false, error: 'No clips returned from AI' };
    }

    logAiUsage({
      category: 'repurposing',
      tokensUsed: res.usage?.total_tokens || 0,
      durationMs: Date.now() - start,
      success: true,
    }).catch(console.error);

    const normalizedClips: ClipConcept[] = clips.map((c) => {
      const clip = { ...c } as ClipConcept;
      const tr = (c as Record<string, unknown>).timestampRange;
      if (isValidTimestampRange(tr)) {
        clip.timestampRange = { start: tr.start, end: tr.end };
      } else {
        delete clip.timestampRange;
      }
      return clip;
    });

    return {
      success: true,
      clips: normalizedClips,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logAiUsage({
      category: 'repurposing',
      tokensUsed: 0,
      durationMs: Date.now() - start,
      success: false,
      errorMessage,
    }).catch(console.error);
    return { success: false, error: errorMessage };
  }
}
