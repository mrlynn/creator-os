import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { PlatformConnection } from '@/lib/db/models/PlatformConnection';
import { NextRequest, NextResponse } from 'next/server';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

export async function GET(request: NextRequest) {
  try {
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
          message: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables.',
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      const settingsUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/app/settings`;
      return NextResponse.redirect(`${settingsUrl}?youtube_error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/youtube/callback`;

    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.json().catch(() => ({}));
      console.error('YouTube token exchange failed:', errData);
      const settingsUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/app/settings`;
      return NextResponse.redirect(`${settingsUrl}?youtube_error=token_exchange_failed`);
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    const expiresIn = tokens.expires_in ?? 3600;

    if (!accessToken) {
      const settingsUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/app/settings`;
      return NextResponse.redirect(`${settingsUrl}?youtube_error=no_access_token`);
    }

    // Fetch channel info for platformUserId and platformUsername
    let platformUserId = 'unknown';
    let platformUsername: string | undefined;
    try {
      const meRes = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (meRes.ok) {
        const meData = await meRes.json();
        const channel = meData?.items?.[0];
        if (channel) {
          platformUserId = channel.id;
          platformUsername = channel.snippet?.title;
        }
      }
    } catch {
      // Non-fatal; we can still store the connection
    }

    await connectToDatabase();

    const userId = session.user.id ?? session.user.email;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await PlatformConnection.findOneAndUpdate(
      { userId, platform: 'youtube' },
      {
        userId,
        platform: 'youtube',
        accessToken,
        refreshToken: refreshToken || '',
        expiresAt,
        platformUserId,
        platformUsername,
      },
      { upsert: true, new: true }
    );

    const settingsUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/app/settings`;
    return NextResponse.redirect(`${settingsUrl}?youtube_connected=1`);
  } catch (err) {
    console.error('YouTube callback error:', err);
    const settingsUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/app/settings`;
    return NextResponse.redirect(`${settingsUrl}?youtube_error=callback_failed`);
  }
}
