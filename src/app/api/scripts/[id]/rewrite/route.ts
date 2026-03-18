import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Script } from '@/lib/db/models/Script';
import { RewriteScriptSchema } from '@/lib/db/schemas';
import { generateScriptFromOutline } from '@/lib/ai/script-generator';
import { Types } from 'mongoose';

function buildOutlineFromSections(script: {
  hook?: string;
  problem?: string;
  solution?: string;
  demo?: string;
  cta?: string;
  outro?: string;
}): string {
  const parts: string[] = [];
  if (script.hook) parts.push(`Hook: ${script.hook}`);
  if (script.problem) parts.push(`Problem: ${script.problem}`);
  if (script.solution) parts.push(`Solution: ${script.solution}`);
  if (script.demo) parts.push(`Demo: ${script.demo}`);
  if (script.cta) parts.push(`CTA: ${script.cta}`);
  if (script.outro) parts.push(`Outro: ${script.outro}`);
  return parts.join('\n\n') || '';
}

export async function POST(
  request: Request,
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

    const body = await request.json();

    const validationResult = RewriteScriptSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const script = await Script.findById(params.id);
    if (!script) {
      return Response.json({ error: 'Script not found' }, { status: 404 });
    }

    const outline = buildOutlineFromSections(script);
    if (!outline.trim()) {
      return Response.json(
        { error: 'Script has no content to rewrite. Generate a script first.' },
        { status: 400 }
      );
    }

    const audienceLevel =
      validationResult.data.audience === 'advanced' ? 'advanced' : 'beginner';

    const aiResult = await generateScriptFromOutline(outline, audienceLevel);

    if (!aiResult.success) {
      return Response.json(
        {
          error: 'Failed to rewrite script',
          message: aiResult.error,
        },
        { status: 500 }
      );
    }

    script.hook = aiResult.sections?.hook;
    script.problem = aiResult.sections?.problem;
    script.solution = aiResult.sections?.solution;
    script.demo = aiResult.sections?.demo;
    script.cta = aiResult.sections?.cta;
    script.outro = aiResult.sections?.outro;

    const allText = [
      script.hook,
      script.problem,
      script.solution,
      script.demo,
      script.cta,
      script.outro,
    ]
      .filter(Boolean)
      .join(' ');

    script.wordCount = allText.split(/\s+/).length;

    await script.save();
    await script.populate('ideaId');

    return Response.json({
      script,
      generation: {
        tokensUsed: aiResult.tokensUsed,
        durationMs: aiResult.durationMs,
      },
    });
  } catch (error) {
    console.error('Error rewriting script:', error);
    return Response.json(
      {
        error: 'Failed to rewrite script',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
