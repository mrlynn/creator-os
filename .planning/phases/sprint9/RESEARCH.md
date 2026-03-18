# Sprint 9: Publishing Integrations — Research

**Created:** 2026-03-18  
**Focus:** YouTube and TikTok publishing integrations for Creator OS

---

## 1. YouTube Data API v3

### OAuth Scopes for Upload

To upload videos via the YouTube Data API v3, authorization requires at least one of these OAuth 2.0 scopes:

| Scope | Use Case |
|-------|----------|
| `https://www.googleapis.com/auth/youtube.upload` | **Recommended** — Upload only, minimal permissions |
| `https://www.googleapis.com/auth/youtube` | Full read/write access |
| `https://www.googleapis.com/auth/youtube.force-ssl` | Same as youtube, HTTPS only |
| `https://www.googleapis.com/auth/youtubepartner` | Content partner / CMS use |

**Source:** [Videos: insert | YouTube Data API](https://developers.google.com/youtube/v3/docs/videos/insert)

### Quota Limits

| Item | Value |
|------|-------|
| **Default daily quota** | 10,000 units |
| **Quota reset** | Midnight Pacific Time (PT) |
| **`videos.insert` cost** | 100 units per upload |
| **`videos.list` cost** | 1 unit |
| **`search.list` cost** | 100 units |

**Implication:** ~100 video uploads/day within default quota. Additional quota requires [compliance audit](https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits).

**Source:** [Quota Calculator | YouTube Data API](https://developers.google.com/youtube/v3/determine_quota_cost)

### Resumable Upload Flow

YouTube supports resumable uploads for large files and unreliable connections:

1. **Initiate session:** `POST https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`
   - Headers: `Authorization`, `Content-Type: application/json`, `X-Upload-Content-Type`, `X-Upload-Content-Length`
   - Body: Video metadata (snippet, status)
   - Response: `Location` header with resumable upload URI

2. **Upload chunks:** PUT to the returned URI with `Content-Range` and binary data. Supports resume on failure.

**Constraints:**
- Max file size: 256 GB
- Accepted MIME: `video/*`, `application/octet-stream`

**Source:** [Resumable Uploads | YouTube Data API](https://developers.google.com/youtube/v3/guides/using_resumable_upload_protocol)

### Scheduling

**Supported.** Use `status.publishAt` (ISO 8601) with `status.privacyStatus: "private"`:

```json
{
  "snippet": { "title": "...", "description": "..." },
  "status": {
    "privacyStatus": "private",
    "publishAt": "2025-12-01T18:00:00.000Z"
  }
}
```

- Video must be `private` for scheduling to work
- Past `publishAt` → publishes immediately
- Can update via `videos.update` if video is already private

**Source:** [Videos: insert | YouTube Data API](https://developers.google.com/youtube/v3/docs/videos/insert)

### Official Documentation Links

- [YouTube Data API Overview](https://developers.google.com/youtube/v3/getting-started)
- [Authentication (OAuth 2.0)](https://developers.google.com/youtube/v3/guides/authentication)
- [Uploading a Video](https://developers.google.com/youtube/v3/guides/uploading_a_video)
- [Videos: insert](https://developers.google.com/youtube/v3/docs/videos/insert)
- [Resumable Upload Protocol](https://developers.google.com/youtube/v3/guides/using_resumable_upload_protocol)
- [Quota and Compliance Audits](https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits)

---

## 2. TikTok Content Posting API

### Availability

The **Content Posting API** is TikTok's official API for programmatic video publishing. It replaced the deprecated Share Video API (ended September 10, 2023).

**Two posting flows:**

| Flow | Description |
|------|-------------|
| **Direct Post** | Content goes live immediately to the creator's profile |
| **Upload to Inbox** | Content uploaded as draft to creator's TikTok inbox for manual editing/posting |

**Source:** [Content Posting API | TikTok for Developers](https://developers.tiktok.com/products/content-posting-api/)

### Auth & OAuth Scopes

- **Scope required:** `video.publish`
- **Auth:** OAuth 2.0 via [TikTok Login Kit](https://developers.tiktok.com/doc/oauth-user-access-token-management)
- **Token lifetime:** Access token 24 hours; refresh token 365 days
- **Endpoint:** `POST https://open.tiktokapis.com/v2/oauth/token/`

**Source:** [Content Posting API - Direct Post](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post)

### Creator Center API vs Content Posting API

The **Creator Center API** is a separate product for TikTok Creator Center features. TikTok's **Content Posting API** is the main API for programmatic video publishing. There is no direct "Creator Center API" for publishing; use **Content Posting API** for uploads.

### Direct Post Flow

1. **Query creator info:** `POST /v2/post/publish/creator_info/query/` — get `privacy_level_options`, `max_video_post_duration_sec`, etc.
2. **Initialize post:** `POST /v2/post/publish/video/init/` with:
   - `post_info`: `privacy_level`, `title` (caption), `disable_duet`, `disable_stitch`, `disable_comment`, etc.
   - `source_info`: `source` = `FILE_UPLOAD` or `PULL_FROM_URL`

3. **Upload:** If `FILE_UPLOAD`, PUT video chunks to `upload_url` from init response. Supports chunked upload.

**Source:** [Content Posting API - Direct Post](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post)

### Scheduling

**Not officially supported** in the Content Posting API Direct Post endpoint. The official docs do not document `postAt` or `scheduled_time`. Third-party sources (e.g., Postpone API, getlate.dev) may refer to other APIs or undocumented features. For MVP, assume **immediate post only** or **Upload to Inbox** (draft for manual scheduling in TikTok app).

### PULL_FROM_URL vs FILE_UPLOAD

| Method | Requirement |
|--------|-------------|
| `FILE_UPLOAD` | Upload video in chunks to TikTok-provided URL |
| `PULL_FROM_URL` | Requires **URL ownership verification** — developer must verify domain/URL prefix |

**Source:** `url_ownership_unverified` error in [Direct Post docs](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post)

---

## 3. MVP Scope Options

| Option | Description | Effort | Pros | Cons |
|--------|-------------|--------|------|------|
| **(a) OAuth connect + deep link to YouTube Studio with prefill** | Connect accounts, generate link to YouTube Studio upload with pre-filled metadata | Low | No API quota, no audit needed | **YouTube Studio has no documented URL parameters for prefill.** Deep links exist for playback (e.g., `#t=`) but not for upload form. |
| **(b) Actual upload via API** | Full OAuth + upload flow using `videos.insert` / Content Posting API | High | True one-click publish | YouTube: unverified projects → private-only; TikTok: unaudited → private-only. Both require audit for public posts. |
| **(c) Metadata export only** | Export title, description, tags, script as JSON/text/copy | Low | No OAuth, no API, no audit | User must manually paste into Creator Studio |

### Recommendation

- **Phase 1 (MVP):** **(c) Metadata export** — copy-to-clipboard or structured export (JSON, markdown) for title, description, tags. Zero API dependency. Ships immediately.
- **Phase 2:** **(b) OAuth connect + actual upload** — Start with **private** uploads (no audit required). Add YouTube and TikTok OAuth, store tokens, implement upload. Users can change visibility to public in Creator Studio.
- **Phase 2b:** If deep link prefill becomes available (e.g., `studio.youtube.com/upload?title=...`), add as fallback for users who prefer manual upload.

---

## 4. Data Model

### PlatformConnection vs OAuthToken Storage

Creator OS needs to store **platform-specific OAuth tokens** for YouTube and TikTok. These are **not** sign-in providers (GitHub is); they are **additional account connections** for publishing.

| Approach | Description | Fit for Creator OS |
|----------|-------------|--------------------|
| **NextAuth Account model** | NextAuth stores `Account` records per provider (providerId, userId, access_token, refresh_token). | Add Google and TikTok as **custom OAuth providers** used only for account linking. Requires `signIn` callback logic to link when user is already logged in. |
| **Custom PlatformConnection model** | MongoDB collection: `{ userId, platform, accessToken, refreshToken, expiresAt, platformUserId }` | Simpler, no NextAuth session coupling. Clear ownership of publishing tokens. |

### Recommendation

**Custom `PlatformConnection` model** — separate from NextAuth:

- **Why:** YouTube/TikTok are publishing connections, not login providers. NextAuth's Account model is for sign-in; linking logic adds complexity.
- **Schema:** `userId` (Creator OS user), `platform` (youtube | tiktok), `accessToken`, `refreshToken`, `expiresAt`, `platformUserId` (channel ID / open_id), `platformUsername` (optional)

### NextAuth Account Linking (Alternative)

If using NextAuth:

1. Add `Google` and custom `TikTok` providers with `video.publish` / `youtube.upload` scopes.
2. In `signIn` callback: if `getServerSession()` returns a user, treat as **account linking**; associate new provider with existing user.
3. Store tokens in NextAuth `Account` table via adapter (MongoDB adapter required).

**Reference:** [next-auth-account-linking](https://github.com/rexfordessilfie/next-auth-account-linking)

---

## 5. Constraints & Blockers

### YouTube

| Constraint | Detail |
|------------|--------|
| **Private-only for unverified projects** | Videos uploaded via API from projects created after July 28, 2020 are **restricted to private** until the project passes [audit](https://support.google.com/youtube/contact/yt_api_form). |
| **Quota** | 10,000 units/day default; ~100 uploads/day. More requires audit. |
| **No prefill URL** | Studio upload page has no documented URL parameters for pre-filled title/description. |

### TikTok

| Constraint | Detail |
|------------|--------|
| **Private-only for unaudited clients** | `unaudited_client_can_only_post_to_private_accounts` — must [undergo audit](https://developers.tiktok.com/application/content-posting-api) for public posts. |
| **Rate limits** | 6 requests per minute per user access token for `/publish/video/init/`; 20/min for `creator_info/query`. |
| **App review** | App must be submitted for review; demo video, Privacy Policy, Terms of Service required. Typically several days to two weeks. |
| **PULL_FROM_URL** | Requires URL ownership verification. |
| **No native scheduling** | Direct Post does not support `postAt` in official docs. |

### General

| Item | Notes |
|------|-------|
| **Token refresh** | Both platforms require background refresh of access tokens. YouTube: varies by library; TikTok: 24h access, 365d refresh. |
| **Video file handling** | Creator OS must store or stream video files for upload. Episodes may reference `videoUrl` or local path; need upload pipeline. |

---

## Summary Table

| Platform | OAuth Scope | Upload | Schedule | Audit for Public | Rate Limits |
|----------|-------------|--------|----------|------------------|-------------|
| **YouTube** | `youtube.upload` | ✅ `videos.insert` | ✅ `status.publishAt` | Yes | 10,000 units/day |
| **TikTok** | `video.publish` | ✅ Direct Post / Inbox | ❌ Not in official API | Yes | 6 req/min (init) |

---

## References

- [YouTube Data API v3 - Getting Started](https://developers.google.com/youtube/v3/getting-started)
- [YouTube Data API - Videos: insert](https://developers.google.com/youtube/v3/docs/videos/insert)
- [YouTube Data API - Resumable Upload Protocol](https://developers.google.com/youtube/v3/guides/using_resumable_upload_protocol)
- [Quota and Compliance Audits](https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits)
- [TikTok Content Posting API - Direct Post](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post)
- [TikTok Content Posting API - Query Creator Info](https://developers.tiktok.com/doc/content-posting-api-reference-query-creator-info)
- [TikTok OAuth User Access Token Management](https://developers.tiktok.com/doc/oauth-user-access-token-management)
- [TikTok App Review Guidelines](https://developers.tiktok.com/doc/app-review-guidelines)
