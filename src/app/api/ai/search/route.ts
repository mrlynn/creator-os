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

    const { query, types, limit } = parseResult.data;
    const queryEmbedding = await embed(query, { inputType: 'query' });

    if (!queryEmbedding || queryEmbedding.length === 0) {
      return Response.json(
        { error: 'Failed to embed query' },
        { status: 500 }
      );
    }

    const numCandidates = Math.max(100, limit * 20);

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
              limit,
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
