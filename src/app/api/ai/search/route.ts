import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { ContentIdea } from '@/lib/db/models/ContentIdea';
import { Script } from '@/lib/db/models/Script';
import { Episode } from '@/lib/db/models/Episode';
import { embed } from '@/lib/ai/embeddings';
import { z } from 'zod';

const SearchBodySchema = z.object({
  query: z.string().min(1),
  types: z
    .array(z.enum(['idea', 'episode', 'script']))
    .optional()
    .default(['idea', 'episode', 'script']),
  limit: z.number().min(1).max(50).optional().default(10),
  mode: z.enum(['vector', 'hybrid']).optional().default('vector'),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json().catch(() => ({}));
    const parseResult = SearchBodySchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { query, types, limit, mode } = parseResult.data;
    const queryEmbedding = await embed(query, { inputType: 'query' });

    if (!queryEmbedding || queryEmbedding.length === 0) {
      return Response.json(
        { error: 'Failed to embed query' },
        { status: 500 }
      );
    }

    const numCandidates = Math.max(100, limit * 20);
    const RRF_K = 60;

    const runVectorSearch = async (
      Model: typeof ContentIdea | typeof Script | typeof Episode,
      indexName: string
    ) => {
      try {
        const results = await Model.aggregate([
          {
            $vectorSearch: {
              index: indexName,
              path: 'embedding',
              queryVector: queryEmbedding,
              numCandidates,
              limit: mode === 'hybrid' ? limit * 2 : limit,
            },
          },
          { $project: { embedding: 0 } },
          { $addFields: { score: { $meta: 'vectorSearchScore' } } },
        ]);
        return results;
      } catch {
        return [];
      }
    };

    const runTextSearch = async (
      Model: typeof ContentIdea | typeof Script | typeof Episode
    ) => {
      try {
        const docs = await Model.find(
          { $text: { $search: query } },
          { score: { $meta: 'textScore' }, embedding: 0 }
        )
          .limit(limit * 2)
          .lean();
        return docs.map((d: { _id: unknown; score?: number }) => ({
          ...d,
          score: d.score ?? 0,
        }));
      } catch {
        return [];
      }
    };

    const mergeWithRRF = (
      vectorResults: { _id: unknown; score?: number }[],
      textResults: { _id: unknown }[],
      topN: number
    ) => {
      const scoreMap = new Map<string, number>();
      vectorResults.forEach((doc, rank) => {
        const id = String(doc._id);
        scoreMap.set(id, (scoreMap.get(id) ?? 0) + 1 / (RRF_K + rank + 1));
      });
      textResults.forEach((doc, rank) => {
        const id = String(doc._id);
        scoreMap.set(id, (scoreMap.get(id) ?? 0) + 1 / (RRF_K + rank + 1));
      });
      const allIds = [...scoreMap.keys()];
      const merged = allIds
        .map((id) => {
          const doc =
            vectorResults.find((d) => String(d._id) === id) ||
            textResults.find((d) => String(d._id) === id);
          return doc ? { ...doc, score: scoreMap.get(id)! } : null;
        })
        .filter(Boolean) as { _id: unknown; score: number }[];
      merged.sort((a, b) => b.score - a.score);
      return merged.slice(0, topN);
    };

    if (mode === 'vector') {
      const [ideas, episodes, scripts] = await Promise.all([
        types.includes('idea')
          ? runVectorSearch(ContentIdea, 'content_vector_index')
          : Promise.resolve([]),
        types.includes('episode')
          ? runVectorSearch(Episode, 'episode_vector_index')
          : Promise.resolve([]),
        types.includes('script')
          ? runVectorSearch(Script, 'script_vector_index')
          : Promise.resolve([]),
      ]);
      return Response.json({ ideas, episodes, scripts });
    }

    const [vectorIdeas, vectorEpisodes, vectorScripts] = await Promise.all([
      types.includes('idea')
        ? runVectorSearch(ContentIdea, 'content_vector_index')
        : Promise.resolve([]),
      types.includes('episode')
        ? runVectorSearch(Episode, 'episode_vector_index')
        : Promise.resolve([]),
      types.includes('script')
        ? runVectorSearch(Script, 'script_vector_index')
        : Promise.resolve([]),
    ]);

    const [textIdeas, textEpisodes, textScripts] = await Promise.all([
      types.includes('idea') ? runTextSearch(ContentIdea) : Promise.resolve([]),
      types.includes('episode')
        ? runTextSearch(Episode)
        : Promise.resolve([]),
      types.includes('script') ? runTextSearch(Script) : Promise.resolve([]),
    ]);

    const ideas = mergeWithRRF(vectorIdeas, textIdeas, limit);
    const episodes = mergeWithRRF(vectorEpisodes, textEpisodes, limit);
    const scripts = mergeWithRRF(vectorScripts, textScripts, limit);

    return Response.json({ ideas, episodes, scripts });
  } catch (error) {
    console.error('Error in semantic search:', error);
    return Response.json(
      {
        error: 'Failed to search',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
