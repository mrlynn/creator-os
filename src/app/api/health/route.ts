import { connectToDatabase } from '@/lib/db/connection';

export async function GET() {
  try {
    await connectToDatabase();
    return Response.json(
      {
        status: 'ok',
        message: 'Server is healthy, MongoDB connected'
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
