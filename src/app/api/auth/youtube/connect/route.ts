import { getServerSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

const YOUTUBE_SCOPE = 'https://www.googleapis.com/auth/youtube.upload';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error: 'YouTube OAuth not configured',
        message: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables. Get credentials from Google Cloud Console.',
      },
      { status: 503 }
    );
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/youtube/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: YOUTUBE_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
  });

  return NextResponse.redirect(`${AUTH_URL}?${params.toString()}`);
}
