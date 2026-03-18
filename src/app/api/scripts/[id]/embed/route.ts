import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Script } from '@/lib/db/models/Script';
import { embed } from '@/lib/ai/embeddings';
import { Types } from 'mongoose';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    if (!Types.ObjectId.isValid(params.id)) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const script = await Script.findById(params.id);
    if (!script) {
      return Response.json({ error: 'Script not found' }, { status: 404 });
    }

    const sections = [
      script.hook,
      script.problem,
      script.solution,
      script.demo,
      script.cta,
      script.outro,
    ].filter(Boolean) as string[];

    const scriptText = sections.join('\n\n');
    const text = `${script.title || ''}\n\n${scriptText}`.trim();
    if (!text) {
      return Response.json({ error: 'Script has no content' }, { status: 400 });
    }

    const embedding = await embed(text);
    await Script.findByIdAndUpdate(params.id, { $set: { embedding } });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error embedding script:', error);
    return Response.json(
      {
        error: 'Failed to embed script',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
