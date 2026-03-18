import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Series } from '@/lib/db/models/Series';
import { CreateSeriesSchema } from '@/lib/db/schemas';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const validationResult = CreateSeriesSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const series = await Series.create(validationResult.data);
    return Response.json(series, { status: 201 });
  } catch (error) {
    console.error('Error creating series:', error);
    return Response.json(
      { error: 'Failed to create series', message: error instanceof Error ? error.message : 'Unknown error' },
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
    const status = searchParams.get('status') || 'active';
    const q = searchParams.get('q')?.trim();

    const query: Record<string, any> = {};
    if (status !== 'all') query.status = status;
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const seriesList = await Series.find(query).sort({ createdAt: -1 }).lean();

    return Response.json({ data: seriesList });
  } catch (error) {
    console.error('Error fetching series:', error);
    return Response.json(
      { error: 'Failed to fetch series', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
