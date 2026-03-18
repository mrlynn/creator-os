import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Tag } from '@/lib/db/models/Tag';
import { CreateTagSchema } from '@/lib/db/schemas';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const q = searchParams.get('q')?.trim();

    const query: Record<string, any> = {};
    if (category) query.category = category;
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } },
      ];
    }

    const tags = await Tag.find(query).sort({ name: 1 }).lean();

    return Response.json({ data: tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return Response.json(
      { error: 'Failed to fetch tags', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const validationResult = CreateTagSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, slug, ...rest } = validationResult.data;
    const generatedSlug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const finalSlug = slug || generatedSlug || `tag-${Date.now()}`;

    const tag = await Tag.create({
      name,
      slug: finalSlug,
      ...rest,
    });

    return Response.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return Response.json(
      { error: 'Failed to create tag', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
