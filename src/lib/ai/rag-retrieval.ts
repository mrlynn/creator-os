import { connectToDatabase } from '@/lib/db/connection';
import { embed } from '@/lib/ai/embeddings';
import { ContentIdea } from '@/lib/db/models/ContentIdea';
import { Script } from '@/lib/db/models/Script';
import { Episode } from '@/lib/db/models/Episode';

const MAX_TOTAL_CHARS = 1500;
const EXCERPT_CHARS = 200;

type RagType = 'idea' | 'episode' | 'script';

interface RagDoc {
  _id: unknown;
  title?: string;
  description?: string;
  hook?: string;
  problem?: string;
  solution?: string;
  demo?: string;
  cta?: string;
  outro?: string;
  outline?: string;
}

function getExcerpt(doc: RagDoc, type: RagType): string {
  let text = '';
  if (type === 'idea') {
    text = [doc.title, doc.description].filter(Boolean).join(' ');
  } else if (type === 'script') {
    text = [
      doc.title,
      doc.outline,
      doc.hook,
      doc.problem,
      doc.solution,
      doc.demo,
      doc.cta,
      doc.outro,
    ]
      .filter(Boolean)
      .join(' ');
  } else {
    text = [doc.title, doc.description].filter(Boolean).join(' ');
  }
  if (text.length <= EXCERPT_CHARS) return text;
  return text.slice(0, EXCERPT_CHARS).trim() + '…';
}

export async function getRagContext(
  query: string,
  types: RagType[] = ['idea', 'episode', 'script'],
  limit: number = 3
): Promise<string> {
  if (!query?.trim()) return '';

  await connectToDatabase();

  const queryEmbedding = await embed(query, { inputType: 'query' });
  if (!queryEmbedding || queryEmbedding.length === 0) return '';

  const numCandidates = Math.max(100, limit * 20);

  const runVectorSearch = async (
    Model: typeof ContentIdea | typeof Script | typeof Episode,
    indexName: string
  ) => {
    try {
      return await Model.aggregate([
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
    } catch {
      return [];
    }
  };

  const indexMap: Record<RagType, [typeof ContentIdea | typeof Script | typeof Episode, string]> = {
    idea: [ContentIdea, 'content_vector_index'],
    episode: [Episode, 'episode_vector_index'],
    script: [Script, 'script_vector_index'],
  };

  const results: { doc: RagDoc; type: RagType; score: number }[] = [];

  await Promise.all(
    types.map(async (type) => {
      const [Model, indexName] = indexMap[type];
      const hits = await runVectorSearch(Model, indexName);
      hits.forEach((h: { score?: number }) => {
        results.push({
          doc: h as RagDoc,
          type,
          score: h.score ?? 0,
        });
      });
    })
  );

  results.sort((a, b) => b.score - a.score);
  const top = results.slice(0, limit);

  if (top.length === 0) return '';

  const lines: string[] = [];
  let totalChars = 0;

  for (const { doc, type } of top) {
    const title = doc.title || `(${type})`;
    const excerpt = getExcerpt(doc, type);
    const line = `- [${title}]: ${excerpt}`;
    if (totalChars + line.length + 2 > MAX_TOTAL_CHARS) break;
    lines.push(line);
    totalChars += line.length + 1;
  }

  if (lines.length === 0) return '';
  return `Relevant past content for context:\n\n${lines.join('\n')}`;
}
