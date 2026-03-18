import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Script } from '@/lib/db/models/Script';
import { UpdateScriptSchema } from '@/lib/db/schemas';
import { Types } from 'mongoose';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    if (!Types.ObjectId.isValid(params.id)) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const script = await Script.findById(params.id).populate('ideaId');

    if (!script) {
      return Response.json({ error: 'Script not found' }, { status: 404 });
    }

    return Response.json(script);
  } catch (error) {
    console.error('Error fetching script:', error);
    return Response.json(
      { error: 'Failed to fetch script', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    const validationResult = UpdateScriptSchema.safeParse(body);
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

    // Add version entry
    const fullContent = JSON.stringify({
      hook: body.hook,
      problem: body.problem,
      solution: body.solution,
      demo: body.demo,
      cta: body.cta,
      outro: body.outro,
    });

    script.versions.push({
      version: (script.versions.length || 0) + 1,
      content: fullContent,
      createdAt: new Date(),
    });

    // Update fields
    Object.assign(script, validationResult.data);

    // Update word count
    const allText = [
      validationResult.data.hook,
      validationResult.data.problem,
      validationResult.data.solution,
      validationResult.data.demo,
      validationResult.data.cta,
      validationResult.data.outro,
    ]
      .filter(Boolean)
      .join(' ');

    script.wordCount = allText.split(/\s+/).length;

    await script.save();
    await script.populate('ideaId');

    return Response.json(script);
  } catch (error) {
    console.error('Error updating script:', error);
    return Response.json(
      { error: 'Failed to update script', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    if (!Types.ObjectId.isValid(params.id)) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const script = await Script.findByIdAndUpdate(
      params.id,
      { status: 'archived' },
      { new: true }
    );

    if (!script) {
      return Response.json({ error: 'Script not found' }, { status: 404 });
    }

    return Response.json({ message: 'Script archived successfully', script });
  } catch (error) {
    console.error('Error archiving script:', error);
    return Response.json(
      { error: 'Failed to archive script', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
