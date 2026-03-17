import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { PublishingRecord } from '@/lib/db/models/PublishingRecord';
import { CreatePublishingRecordSchema } from '@/lib/db/schemas';
import { Types } from 'mongoose';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const validationResult = CreatePublishingRecordSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { episodeId } = validationResult.data;

    if (!Types.ObjectId.isValid(episodeId)) {
      return Response.json({ error: 'Invalid episode ID' }, { status: 400 });
    }

    const record = await PublishingRecord.create({
      ...validationResult.data,
      episodeId: new Types.ObjectId(episodeId),
    });

    return Response.json(record, { status: 201 });
  } catch (error) {
    console.error('Error creating publishing record:', error);
    return Response.json(
      { error: 'Failed to create record', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
