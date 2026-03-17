import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Script } from '@/lib/db/models/Script';
import { CreateScriptSchema } from '@/lib/db/schemas';
import { Types } from 'mongoose';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const validationResult = CreateScriptSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { ideaId, title } = validationResult.data;

    if (!Types.ObjectId.isValid(ideaId)) {
      return Response.json({ error: 'Invalid idea ID' }, { status: 400 });
    }

    const script = await Script.create({
      ideaId: new Types.ObjectId(ideaId),
      title: title || 'Untitled Script',
      status: 'outline',
      versions: [],
    });

    return Response.json(script, { status: 201 });
  } catch (error) {
    console.error('Error creating script:', error);
    return Response.json(
      { error: 'Failed to create script', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, any> = {};
    if (status) query.status = status;

    const scripts = await Script.find(query)
      .populate('ideaId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Script.countDocuments(query);

    return Response.json({
      data: scripts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching scripts:', error);
    return Response.json(
      { error: 'Failed to fetch scripts', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
