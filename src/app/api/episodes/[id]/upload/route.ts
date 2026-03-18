import { Readable } from 'stream';
import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Episode } from '@/lib/db/models/Episode';
import { PlatformConnection } from '@/lib/db/models/PlatformConnection';
import { PublishingRecord } from '@/lib/db/models/PublishingRecord';
import { Types } from 'mongoose';
import { google } from 'googleapis';

const UploadBodySchema = {
  platform: ['youtube', 'tiktok'] as const,
  videoUrl: (v: unknown) => typeof v === 'string' && v.length > 0,
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    if (!Types.ObjectId.isValid(params.id)) {
      return Response.json({ error: 'Invalid episode ID' }, { status: 400 });
    }

    const episode = await Episode.findById(params.id);
    if (!episode) {
      return Response.json({ error: 'Episode not found' }, { status: 404 });
    }

    let body: { platform?: string; videoUrl?: string } = {};
    try {
      body = await request.json();
    } catch {
      // empty body ok if episode has videoUrl
    }

    const platform = body.platform;
    if (!platform || !UploadBodySchema.platform.includes(platform as 'youtube' | 'tiktok')) {
      return Response.json(
        { error: 'Invalid platform. Use youtube or tiktok' },
        { status: 400 }
      );
    }

    const videoUrl = body.videoUrl?.trim() || episode.videoUrl?.trim();
    if (!videoUrl) {
      return Response.json(
        { error: 'videoUrl required. Set episode.videoUrl or pass videoUrl in request body.' },
        { status: 400 }
      );
    }

    const userId = session.user.id ?? session.user.email;
    const connection = await PlatformConnection.findOne({ userId, platform });
    if (!connection) {
      return Response.json(
        { error: `Not connected to ${platform}. Connect in Settings.` },
        { status: 401 }
      );
    }

    const title = episode.title || 'Untitled';
    const description = episode.description || '';

    if (platform === 'youtube') {
      const videoRes = await fetch(videoUrl);
      if (!videoRes.ok) {
        return Response.json(
          { error: `Failed to fetch video from URL: ${videoRes.status}` },
          { status: 400 }
        );
      }

      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: connection.accessToken,
        refresh_token: connection.refreshToken,
      });

      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
      const videoStream = Readable.from(videoBuffer);

      const insertRes = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description,
          },
          status: {
            privacyStatus: 'private',
          },
        },
        media: {
          body: videoStream,
        },
      });

      const videoId = insertRes.data.id;
      const publishedUrl = videoId
        ? `https://www.youtube.com/watch?v=${videoId}`
        : undefined;

      const record = await PublishingRecord.create({
        episodeId: episode._id,
        platform: 'youtube',
        status: 'live',
        publishedUrl,
        publishedDate: new Date(),
      });

      await Episode.findByIdAndUpdate(episode._id, {
        $push: { publishingRecords: record._id },
      });

      return Response.json({
        success: true,
        platform: 'youtube',
        publishedUrl,
      });
    }

    if (platform === 'tiktok') {
      const videoRes = await fetch(videoUrl);
      if (!videoRes.ok) {
        return Response.json(
          { error: `Failed to fetch video from URL: ${videoRes.status}` },
          { status: 400 }
        );
      }

      const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
      const videoSize = videoBuffer.length;

      const creatorRes = await fetch(
        'https://open.tiktokapis.com/v2/post/publish/creator_info/query/',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8',
          },
          body: JSON.stringify({}),
        }
      );

      if (!creatorRes.ok) {
        const errData = await creatorRes.json().catch(() => ({}));
        console.error('TikTok creator_info failed:', errData);
        return Response.json(
          { error: 'Failed to get TikTok creator info' },
          { status: 502 }
        );
      }

      const creatorData = await creatorRes.json();
      const privacyOptions = creatorData?.data?.privacy_level_options ?? ['SELF_ONLY'];
      const privacyLevel = privacyOptions.includes('SELF_ONLY')
        ? 'SELF_ONLY'
        : privacyOptions[0];

      const chunkSize = 10 * 1024 * 1024;
      const totalChunks = Math.ceil(videoSize / chunkSize);

      const initRes = await fetch(
        'https://open.tiktokapis.com/v2/post/publish/video/init/',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8',
          },
          body: JSON.stringify({
            post_info: {
              title,
              privacy_level: privacyLevel,
              disable_duet: false,
              disable_comment: false,
              disable_stitch: false,
            },
            source_info: {
              source: 'FILE_UPLOAD',
              video_size: videoSize,
              chunk_size: chunkSize,
              total_chunk_count: totalChunks,
            },
          }),
        }
      );

      if (!initRes.ok) {
        const errData = await initRes.json().catch(() => ({}));
        console.error('TikTok init failed:', errData);
        return Response.json(
          { error: errData?.error?.message || 'TikTok upload init failed' },
          { status: 502 }
        );
      }

      const initData = await initRes.json();
      const uploadUrl = initData?.data?.upload_url;

      if (!uploadUrl) {
        return Response.json(
          { error: 'TikTok did not return upload URL' },
          { status: 502 }
        );
      }

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, videoSize);
        const chunk = videoBuffer.subarray(start, end);

        const putRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Length': String(chunk.length),
            'Content-Range': `bytes ${start}-${end - 1}/${videoSize}`,
          },
          body: chunk,
        });

        if (!putRes.ok) {
          return Response.json(
            { error: `TikTok chunk upload failed: ${putRes.status}` },
            { status: 502 }
          );
        }
      }

      const publishId = initData?.data?.publish_id;
      const publishedUrl = publishId
        ? `https://www.tiktok.com/@creator/video/${publishId}`
        : undefined;

      const record = await PublishingRecord.create({
        episodeId: episode._id,
        platform: 'tiktok',
        status: 'live',
        publishedUrl,
        publishedDate: new Date(),
      });

      await Episode.findByIdAndUpdate(episode._id, {
        $push: { publishingRecords: record._id },
      });

      return Response.json({
        success: true,
        platform: 'tiktok',
        publishedUrl,
      });
    }

    return Response.json({ error: 'Unsupported platform' }, { status: 400 });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json(
      {
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
