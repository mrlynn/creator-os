import { getServerSession } from '@/lib/auth';
import { getOpenAIClient } from '@/lib/ai/openai-client';
import { logAiUsage } from '@/lib/ai/usage-logger';
import {
  fetchNewsForTopics,
  fetchTikTokTrendNews,
  fetchYouTubeTrending,
  type NewsResearchResult,
} from '@/lib/ai/news-research';
import { z } from 'zod';

const NewsResearchSchema = z.object({
  topics: z.array(z.string().min(1)).min(1).max(5),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = NewsResearchSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { topics } = parseResult.data;
    const trimmedTopics = topics.map((t) => t.trim()).filter(Boolean);
    if (trimmedTopics.length === 0) {
      return Response.json({ error: 'At least one topic required' }, { status: 400 });
    }

    const startTime = Date.now();

    // Fetch from all sources in parallel
    const [newsItems, youtubeItems, tiktokItems] = await Promise.all([
      fetchNewsForTopics(trimmedTopics).catch(() => [] as { title: string; snippet: string }[]),
      fetchYouTubeTrending(trimmedTopics),
      fetchTikTokTrendNews(trimmedTopics),
    ]);

    const sections: string[] = [];
    if (newsItems.length > 0) {
      sections.push(
        'Recent news:\n' +
          newsItems.map((n) => `- ${n.title}${n.snippet ? ` - ${n.snippet}` : ''}`).join('\n')
      );
    }
    if (youtubeItems.length > 0) {
      sections.push(
        'Popular YouTube videos (last 7 days):\n' +
          youtubeItems
            .map(
              (v) =>
                `- ${v.title}${v.viewCount ? ` (${Number(v.viewCount).toLocaleString()} views)` : ''}${v.snippet ? ` - ${v.snippet}` : ''}`
            )
            .join('\n')
      );
    }
    if (tiktokItems.length > 0) {
      sections.push(
        'TikTok viral/trend news:\n' +
          tiktokItems.map((n) => `- ${n.title}${n.snippet ? ` - ${n.snippet}` : ''}`).join('\n')
      );
    }
    const context = sections.length > 0 ? sections.join('\n\n') : null;

    const client = getOpenAIClient();
    const systemPrompt = `You are a content strategist for developer advocates. Given news, popular YouTube videos, and TikTok viral trend coverage, create a short summary and 1-2 content ideas suitable for YouTube, TikTok, or long-form content. Prioritize ideas that tap into what's already going viral.

Format your response exactly as:
[SUMMARY]
(2-4 sentence summary of the news/trends)
[IDEAS]
[IDEA]
title: (short title)
description: (2-3 sentences)
platform: youtube|tiktok|long-form|multi
audience: beginner|intermediate|advanced|mixed
format: tutorial|story|demo|interview|other
[/IDEA]
(optional second [IDEA] block)
[/IDEAS]`;

    const userPrompt = context
      ? `Topics: ${trimmedTopics.join(', ')}\n\n${context}\n\nSummarize what's trending and create content ideas that could ride these trends.`
      : `Topics: ${trimmedTopics.join(', ')}\n\nNo recent news or viral content found. Based on these topics and what might be trending in AI/tech on YouTube and TikTok, create a brief summary and 1-2 content ideas.`;

    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const content = response.choices[0].message.content || '';
    const duration = Date.now() - startTime;

    logAiUsage({
      category: 'news-research',
      tokensUsed: response.usage?.total_tokens || 0,
      durationMs: duration,
      success: true,
    }).catch(console.error);

    const result = parseAiResponse(content);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('News research error:', error);
    return Response.json(
      { error: 'News research failed', message },
      { status: 500 }
    );
  }
}

const VALID_PLATFORMS = ['youtube', 'tiktok', 'long-form', 'multi'] as const;
const VALID_AUDIENCES = ['beginner', 'intermediate', 'advanced', 'mixed'] as const;
const VALID_FORMATS = ['tutorial', 'story', 'demo', 'interview', 'other'] as const;

function parseAiResponse(content: string): NewsResearchResult {
  const summaryMatch = content.match(/\[SUMMARY\]\s*([\s\S]*?)(?=\[IDEAS\]|$)/i);
  const summary = summaryMatch ? summaryMatch[1].trim() : '';

  const ideaBlocks = content.match(/\[IDEA\]([\s\S]*?)\[\/IDEA\]/gi) || [];
  const ideas = ideaBlocks.map((block) => {
    const getField = (key: string) => {
      const re = new RegExp(`${key}:\\s*(.+?)(?=\\n|$)`, 'i');
      const m = block.match(re);
      return m ? m[1].trim() : '';
    };
    const platform = getField('platform').toLowerCase();
    const audience = getField('audience').toLowerCase();
    const format = getField('format').toLowerCase();
    return {
      title: getField('title') || 'Untitled idea',
      description: getField('description') || 'Generated from news research.',
      platform: VALID_PLATFORMS.includes(platform as any) ? (platform as any) : 'youtube',
      audience: VALID_AUDIENCES.includes(audience as any) ? (audience as any) : 'mixed',
      format: VALID_FORMATS.includes(format as any) ? (format as any) : 'other',
    };
  });

  return { summary, ideas };
}
