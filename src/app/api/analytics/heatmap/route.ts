import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { AnalyticsSnapshot } from '@/lib/db/models/AnalyticsSnapshot';
import { Episode } from '@/lib/db/models/Episode';

interface TagMetrics {
  tagId: string;
  tagName: string;
  totalViews: number;
  totalLikes: number;
  episodeCount: number;
  avgEngagement: number;
}

interface EpisodeLean {
  _id: { toString(): string };
  tags?: { _id: string; name: string }[];
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const snapshots = await AnalyticsSnapshot.find()
      .populate('episodeId')
      .lean();

    const episodes = await Episode.find()
      .populate('tags')
      .lean();

    const episodeMap = new Map<string, { tags: { _id: string; name: string }[] }>();
    for (const ep of episodes as EpisodeLean[]) {
      const tags = ep.tags || [];
      episodeMap.set(ep._id.toString(), { tags });
    }

    const tagAgg: Record<
      string,
      { name: string; views: number; likes: number; engagementSum: number; engagementCount: number; episodeIds: Set<string> }
    > = {};

    for (const snap of snapshots) {
      const ep = snap.episodeId as { _id: string } | null;
      if (!ep) continue;

      const epData = episodeMap.get(ep._id.toString());
      if (!epData || epData.tags.length === 0) continue;

      const views = snap.viewCount ?? 0;
      const likes = snap.likeCount ?? 0;
      const comments = snap.commentCount ?? 0;
      const shares = snap.shareCount ?? 0;

      const engagement =
        snap.engagement ??
        (views > 0 ? (likes + comments + shares) / views : 0);

      for (const tag of epData.tags) {
        const id = tag._id.toString();
        if (!tagAgg[id]) {
          tagAgg[id] = {
            name: tag.name,
            views: 0,
            likes: 0,
            engagementSum: 0,
            engagementCount: 0,
            episodeIds: new Set(),
          };
        }
        tagAgg[id].views += views;
        tagAgg[id].likes += likes;
        tagAgg[id].engagementSum += engagement;
        tagAgg[id].engagementCount += 1;
        tagAgg[id].episodeIds.add(ep._id.toString());
      }
    }

    const byTag: TagMetrics[] = Object.entries(tagAgg).map(
      ([tagId, agg]) => ({
        tagId,
        tagName: agg.name,
        totalViews: agg.views,
        totalLikes: agg.likes,
        episodeCount: agg.episodeIds.size,
        avgEngagement:
          agg.engagementCount > 0
            ? agg.engagementSum / agg.engagementCount
            : 0,
      })
    );

    byTag.sort((a, b) => b.totalViews - a.totalViews);

    return Response.json({ byTag });
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    return Response.json(
      {
        error: 'Failed to fetch heatmap',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
