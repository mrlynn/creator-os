import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { PlatformConnection } from '@/lib/db/models/PlatformConnection';
import { NextRequest, NextResponse } from 'next/server';

const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';

export async function GET(request: NextRequest) {
  try {
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
          message: 'Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET in environment variables.',
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      const settingsUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/app/settings`;
      return NextResponse.redirect(`${settingsUrl}?tiktok_error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/tiktok/callback`;

    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.json().catch(() => ({}));
      console.error('TikTok token exchange failed:', errData);
      const settingsUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/app/settings`;
      return NextResponse.redirect(`${settingsUrl}?tiktok_error=token_exchange_failed`);
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    const expiresIn = tokens.expires_in ?? 86400;
    const openId = tokens.open_id ?? 'unknown';

    if (!accessToken) {
      const settingsUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/app/settings`;
      return NextResponse.redirect(`${settingsUrl}?tiktok_error=no_access_token`);
    }

    await connectToDatabase();

    const userId = session.user.id ?? session.user.email;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await PlatformConnection.findOneAndUpdate(
      { userId, platform: 'tiktok' },
      {
        userId,
        platform: 'tiktok',
        accessToken,
        refreshToken: refreshToken || '',
        expiresAt,
        platformUserId: openId,
      },
      { upsert: true, new: true }
    );

    const settingsUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/app/settings`;
    return NextResponse.redirect(`${settingsUrl}?tiktok_connected=1`);
  } catch (err) {
    console.error('TikTok callback error:', err);
    const settingsUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/app/settings`;
    return NextResponse.redirect(`${settingsUrl}?tiktok_error=callback_failed`);
  }
}
