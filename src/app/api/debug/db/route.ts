import { connectToDatabase } from '@/lib/db/connection';

/**
 * Debug endpoint to verify database connection and collection counts.
 * Hit GET /api/debug/db (while logged in) to see what DB we're connected to and document counts.
 */
export async function GET() {
  try {
    const db = await connectToDatabase();
    const conn = db.connection;
    const dbName = conn.db?.databaseName ?? conn.name ?? 'unknown';

    const collections = await conn.db?.listCollections().toArray() ?? [];
    const counts: Record<string, number> = {};

    for (const col of collections) {
      try {
        const count = await conn.db!.collection(col.name).countDocuments();
        counts[col.name] = count;
      } catch {
        counts[col.name] = -1;
      }
    }

    const rawUri = process.env.MONGODB_URI ?? 'not set';
    const parsedDb = rawUri !== 'not set'
      ? rawUri.split('/').pop()?.split('?')[0] ?? 'empty'
      : 'not set';

    return Response.json({
      database: dbName,
      mongodbUriDatabase: parsedDb,
      mongodbUriPreview: rawUri !== 'not set' ? rawUri.replace(/:[^:@]+@/, ':****@') : rawUri,
      collections: counts,
      env: {
        GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
        googleRelatedKeys: Object.keys(process.env).filter((k) =>
          k.toUpperCase().includes('GOOGLE')
        ),
      },
      note: 'If database is "test", another env file or shell env may be overriding .env.local. Restart dev server after fixing.',
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
