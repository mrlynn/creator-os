import { getServerSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  if (!clientKey || !clientSecret) {
    return NextResponse.json(
      {
        error: 'TikTok OAuth not configured',
        message:
          'Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET in environment variables. Get credentials from TikTok for Developers.',
      },
      { status: 503 }
    );
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/tiktok/callback`;

  const state = crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: 'video.publish',
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
  });

  return NextResponse.redirect(`${AUTH_URL}?${params.toString()}`);
}
