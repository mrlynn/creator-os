import { connectToDatabase } from '@/lib/db/connection';
import { Episode } from '@/lib/db/models/Episode';
import { Tag } from '@/lib/db/models/Tag';
import { getOpenAIClient } from './openai-client';
import { logAiUsage } from './usage-logger';
import { getProfileInstruction } from './instruction-profile';
import { Types } from 'mongoose';

const MAX_TEXT_CHARS = 500;

export async function autoTagEpisode(
  episodeId: string,
  profileId?: string | null
): Promise<void> {
  const start = Date.now();

  try {
    await connectToDatabase();

    const episode = await Episode.findById(episodeId).populate('scriptId');
    if (!episode) return;

    const script = episode.scriptId as {
      hook?: string;
      problem?: string;
      solution?: string;
      demo?: string;
      cta?: string;
      outro?: string;
    } | null;

    const sections = script
      ? [
          script.hook,
          script.problem,
          script.solution,
          script.demo,
          script.cta,
          script.outro,
        ].filter(Boolean) as string[]
      : [];

    const scriptText = sections.join('\n\n');
    const fullText = `${episode.title}\n\n${scriptText}`.trim();
    const text =
      fullText.length > MAX_TEXT_CHARS
        ? fullText.slice(0, MAX_TEXT_CHARS) + '...'
        : fullText;

    if (!text.trim()) return;

    const profilePrefix = profileId ? await getProfileInstruction(profileId) : '';
    const baseSystem =
      'Classify this content. Return a JSON object with a "tags" array of tag names (topics, technologies, audience level). Use lowercase, hyphenated names. Example: { "tags": ["mongodb", "rag", "beginner"] }';
    const systemContent = profilePrefix
      ? `${profilePrefix}\n\n${baseSystem}`
      : baseSystem;

    const client = getOpenAIClient();
    const res = await client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: systemContent,
        },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 200,
    });

    const content = res.choices[0].message?.content || '{}';
    let parsed: { tags?: string[] };
    try {
      parsed = JSON.parse(content);
    } catch {
      return;
    }

    const tagNames = Array.isArray(parsed.tags) ? parsed.tags : [];
    if (tagNames.length === 0) return;

    const tagIds: Types.ObjectId[] = [];

    for (const name of tagNames) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (!slug) continue;

      let tag = await Tag.findOne({ $or: [{ slug }, { name }] });
      if (!tag) {
        tag = await Tag.findOneAndUpdate(
          { slug },
          {
            $setOnInsert: {
              name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
              slug,
              category: 'topic',
            },
          },
          { upsert: true, new: true }
        );
      }
      if (tag && !tagIds.some((id) => id.equals(tag!._id))) {
        tagIds.push(tag._id as Types.ObjectId);
      }
    }

    await Episode.findByIdAndUpdate(episodeId, { $set: { tags: tagIds } });

    logAiUsage({
      category: 'tagging',
      tokensUsed: res.usage?.total_tokens || 0,
      durationMs: Date.now() - start,
      success: true,
      relatedDocumentId: episode._id,
      relatedDocumentType: 'Episode',
    }).catch(console.error);
  } catch (err) {
    console.error('Auto-tag failed:', err);
    logAiUsage({
      category: 'tagging',
      tokensUsed: 0,
      durationMs: Date.now() - start,
      success: false,
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
      ...(Types.ObjectId.isValid(episodeId) && {
        relatedDocumentId: episodeId,
        relatedDocumentType: 'Episode',
      }),
    }).catch(console.error);
  }
}
