import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { PlatformConnection } from '@/lib/db/models/PlatformConnection';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const userId = session.user.id ?? session.user.email;
    const connections = await PlatformConnection.find({ userId })
      .select('-accessToken -refreshToken')
      .lean();

    return Response.json(connections);
  } catch (error) {
    console.error('Error fetching platform connections:', error);
    return Response.json(
      {
        error: 'Failed to fetch connections',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');

    if (!platform || !['youtube', 'tiktok'].includes(platform)) {
      return Response.json(
        { error: 'Invalid or missing platform. Use ?platform=youtube or ?platform=tiktok' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const userId = session.user.id ?? session.user.email;
    const result = await PlatformConnection.deleteOne({ userId, platform });

    if (result.deletedCount === 0) {
      return Response.json({ error: 'Connection not found' }, { status: 404 });
    }

    return Response.json({ message: 'Connection removed' });
  } catch (error) {
    console.error('Error deleting platform connection:', error);
    return Response.json(
      {
        error: 'Failed to delete connection',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
