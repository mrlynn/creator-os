import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { ContentIdea } from '@/lib/db/models/ContentIdea';
import '@/lib/db/models/Tag'; // Ensure Tag model is registered for populate
import { CreateIdeaSchema } from '@/lib/db/schemas';
import { scoreVirality } from '@/lib/ai/virality-scorer';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    // Validate input
    const validationResult = CreateIdeaSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { tags: tagIds, ...ideaData } = validationResult.data;

    // Create the idea
    const idea = await ContentIdea.create({
      ...ideaData,
      tags: tagIds || [],
    });

    // Fire-and-forget virality scoring (non-blocking)
    void scoreVirality({
      _id: idea._id.toString(),
      title: idea.title,
      description: idea.description,
      platform: idea.platform,
      audience: idea.audience,
      format: idea.format,
    }).then((result) => {
      if (result.success && result.viralityScore != null) {
        return ContentIdea.findByIdAndUpdate(idea._id, {
          viralityScore: result.viralityScore,
          viralityReasoning: result.viralityReasoning,
        });
      }
      return undefined;
    }).catch(console.error);

    return Response.json(idea, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating idea:', error);
    return Response.json(
      {
        error: 'Failed to create idea',
        message,
        ...(process.env.NODE_ENV === 'development' && error instanceof Error && { stack: error.stack }),
      },
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
    const platform = searchParams.get('platform');
    const audience = searchParams.get('audience');
    const q = searchParams.get('q')?.trim();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    const query: Record<string, any> = {};
    if (status) query.status = status;
    if (platform) query.platform = platform;
    if (audience) query.audience = audience;
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    // Fetch ideas with pagination
    const ideas = await ContentIdea.find(query)
      .populate('tags')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await ContentIdea.countDocuments(query);

    return Response.json({
      data: ideas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('Error fetching ideas:', error);
    return Response.json(
      {
        error: 'Failed to fetch ideas',
        message,
        ...(process.env.NODE_ENV === 'development' && stack && { stack }),
      },
      { status: 500 }
    );
  }
}
