import { connectToDatabase } from '@/lib/db/connection';
import { Episode } from '@/lib/db/models/Episode';
import { Tag } from '@/lib/db/models/Tag';
import { llmChat } from './llm-provider';
import { getProfileInstruction } from './instruction-profile';
import { getAppConfig } from '@/lib/config/app-config';
import { Types } from 'mongoose';

export async function autoTagEpisode(
  episodeId: string,
  profileId?: string | null
): Promise<void> {
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

    const config = await getAppConfig();
    const maxTextChars = config.tunables.autoTaggerMaxTextChars;

    const scriptText = sections.join('\n\n');
    const fullText = `${episode.title}\n\n${scriptText}`.trim();
    const text =
      fullText.length > maxTextChars
        ? fullText.slice(0, maxTextChars) + '...'
        : fullText;

    if (!text.trim()) return;

    const profilePrefix = profileId ? await getProfileInstruction(profileId) : '';
    const baseSystem =
      'Classify this content. Return a JSON object with a "tags" array of tag names (topics, technologies, audience level). Use lowercase, hyphenated names. Example: { "tags": ["mongodb", "rag", "beginner"] }';
    const systemContent = profilePrefix
      ? `${profilePrefix}\n\n${baseSystem}`
      : baseSystem;

    const res = await llmChat({
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: text },
      ],
      responseFormat: { type: 'json_object' },
      temperature: 0.3,
      maxTokens: 200,
      category: 'tagging',
    });

    const content = res.content || '{}';
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
  } catch (err) {
    console.error('Auto-tag failed:', err);
  }
}
