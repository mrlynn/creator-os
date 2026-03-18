/**
 * News research: fetch news, YouTube trending, and TikTok viral topics.
 */

import { google } from 'googleapis';

const GOOGLE_NEWS_RSS = 'https://news.google.com/rss/search';

function buildNewsQuery(topics: string[], suffix = ''): string {
  const query = topics
    .map((t) => t.trim())
    .filter(Boolean)
    .join(' ');
  return encodeURIComponent(`${query}${suffix ? ` ${suffix}` : ''} when:7d`);
}

function parseRssItems(xml: string): { title: string; snippet: string }[] {
  const items: { title: string; snippet: string }[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const titleMatch = block.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>/i) ||
      block.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = block.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>/i) ||
      block.match(/<description[^>]*>([^<]+)<\/description>/i);
    const title = titleMatch ? titleMatch[1].replace(/&amp;#39;/g, "'").replace(/&amp;/g, '&').trim() : '';
    const snippet = descMatch
      ? descMatch[1]
          .replace(/<[^>]+>/g, '')
          .replace(/&amp;#39;/g, "'")
          .replace(/&amp;/g, '&')
          .trim()
          .slice(0, 300)
      : '';
    if (title) items.push({ title, snippet });
  }
  return items.slice(0, 15);
}

export async function fetchNewsForTopics(topics: string[]): Promise<{ title: string; snippet: string }[]> {
  if (topics.length === 0) return [];

  const query = buildNewsQuery(topics);
  const url = `${GOOGLE_NEWS_RSS}?q=${query}&hl=en-US&gl=US&ceid=US:en`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'CreatorOS/1.0 (Content creation research)',
    },
  });

  if (!res.ok) {
    throw new Error(`News fetch failed: ${res.status}`);
  }

  const xml = await res.text();
  return parseRssItems(xml);
}

/** Fetch news about TikTok viral trends for topics (via Google News) */
export async function fetchTikTokTrendNews(
  topics: string[]
): Promise<{ title: string; snippet: string }[]> {
  if (topics.length === 0) return [];
  const query = buildNewsQuery(topics, 'TikTok viral trend');
  const url = `${GOOGLE_NEWS_RSS}?q=${query}&hl=en-US&gl=US&ceid=US:en`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CreatorOS/1.0 (Content creation research)' },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRssItems(xml).slice(0, 10);
  } catch {
    return [];
  }
}

/** Fetch popular YouTube videos for topics (requires YOUTUBE_API_KEY) */
export async function fetchYouTubeTrending(
  topics: string[]
): Promise<{ title: string; snippet: string; viewCount?: string }[]> {
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || topics.length === 0) return [];

  try {
    const youtube = google.youtube({ version: 'v3', auth: apiKey });
    const query = topics.map((t) => t.trim()).filter(Boolean).join(' ');
    const publishedAfter = new Date();
    publishedAfter.setDate(publishedAfter.getDate() - 7);

    const res = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      order: 'viewCount',
      maxResults: 10,
      publishedAfter: publishedAfter.toISOString(),
    });

    const items = (res.data.items || []).filter((i) => i.id?.videoId);
    if (items.length === 0) return [];

    const videoIds = items.map((i) => i.id!.videoId!);
    const videosRes = await youtube.videos.list({
      part: ['statistics', 'snippet'],
      id: videoIds,
    });

    const statsMap = new Map<string, string>();
    for (const v of videosRes.data.items || []) {
      if (v.id && v.statistics?.viewCount) statsMap.set(v.id, v.statistics.viewCount);
    }

    return items.map((item) => ({
      title: item.snippet?.title || '',
      snippet: item.snippet?.description?.slice(0, 200) || '',
      viewCount: statsMap.get(item.id!.videoId!),
    })).filter((i) => i.title);
  } catch (err) {
    console.warn('YouTube trending fetch failed:', err);
    return [];
  }
}

export interface NewsResearchIdea {
  title: string;
  description: string;
  platform: 'youtube' | 'tiktok' | 'long-form' | 'multi';
  audience: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  format: 'tutorial' | 'story' | 'demo' | 'interview' | 'other';
}

export interface NewsResearchResult {
  summary: string;
  ideas: NewsResearchIdea[];
}
