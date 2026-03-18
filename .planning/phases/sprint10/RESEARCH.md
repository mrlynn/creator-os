# Sprint 10: Extended Capture — Research

**Researched:** 2026-03-18  
**Domain:** Browser extension, Slack/Discord bots, PWA, content capture  
**Confidence:** HIGH

---

## Summary

Sprint 10 delivers three capture channels: a browser extension for capturing content from Twitter/X, Hacker News, and docs; Slack/Discord bots for `/idea [title]`; and a PWA for mobile install and offline capture. All three channels need to create ContentIdeas via the Creator OS API. The existing `POST /api/ideas` requires NextAuth session; external clients (extension, bots) require a new capture endpoint with API key authentication. The ContentIdea schema requires `title`, `description`, `platform`, `audience`, `format`—quick capture flows need a simplified schema or sensible defaults.

**Primary recommendation:** Implement a unified capture API (`POST /api/capture/idea`) with API key auth, then build the browser extension first (highest impact, reuses capture API), followed by Slack bot, then PWA.

---

## User Constraints

No CONTEXT.md exists for Sprint 10. Research scope is unrestricted.

---

## Phase Requirements (from ROADMAP)

| ID | Description | Research Support |
|----|-------------|------------------|
| CAP-01 | Browser extension — Capture from Twitter, HN, docs | §1: Manifest V3, content scripts, background worker, host_permissions, capture patterns |
| CAP-02 | Slack/Discord bot — `/idea [title]` to Idea Bank | §2: Slash commands, Request URL, user linking, Next.js API routes |
| CAP-03 | PWA — Mobile install, offline capture | §3: next-pwa, manifest, IndexedDB, Background Sync |

**Prerequisite:** Capture API (`POST /api/capture/idea`) with API key auth — required by all three.

---

## 1. Browser Extension

### Architecture Options

| Option | Manifest | Chrome | Firefox | Notes |
|--------|----------|--------|---------|-------|
| **Manifest V3** | `manifest_version: 3` | ✅ Required (Chrome 88+) | ✅ Supported | Use service worker for background; content scripts for DOM |
| Manifest V2 | `manifest_version: 2` | ⚠️ Deprecated | Legacy | Avoid—Chrome deprecating |

**Recommendation:** Manifest V3. Chrome Web Store requires it; Firefox supports it.

### Content Capture Patterns

| Source | Capture Method | Data Available |
|--------|----------------|----------------|
| **Twitter/X** | Content script on `twitter.com`, `x.com` | Page title, selected text, tweet text (DOM), URL |
| **Hacker News** | Content script on `news.ycombinator.com` | Title, URL, comment text (DOM), selected text |
| **Docs sites** | Generic: `document.title`, `window.location.href`, `window.getSelection().toString()` | URL, title, selected text |

**Content extraction (content script):**
```javascript
// Generic capture - works on any page
const capture = {
  url: window.location.href,
  title: document.title,
  selectedText: window.getSelection().toString().trim(),
  // Optional: page-specific extraction via match patterns
};
```

**Site-specific extraction:** Use `content_scripts` with `matches` for Twitter, HN, docs domains. Parse DOM for structured content (e.g., tweet text, HN post title).

### API Integration

- **Endpoint:** New `POST /api/capture/idea` (see §4)
- **Auth:** `Authorization: Bearer <API_KEY>` — extension stores API key in `chrome.storage.sync` (user configures in options page)
- **Request flow:** Content script → `chrome.runtime.sendMessage` → background service worker → `fetch()` to Creator OS API
- **Why background worker:** Content scripts are subject to CORS; background service workers bypass CORS when `host_permissions` includes the API domain

**manifest.json host_permissions:**
```json
{
  "host_permissions": [
    "https://your-creator-os-domain.com/*"
  ]
}
```

### Chrome Extension Structure

```
extension/
├── manifest.json          # manifest_version: 3, permissions, content_scripts
├── background.js          # Service worker: receives messages, fetches API
├── content.js             # Injected on match patterns, extracts content, sends to background
├── popup.html/js          # Quick capture UI (optional)
└── options.html/js       # User config: API key, Creator OS URL
```

**References:**
- [Chrome Extensions MV3 Intro](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Content Scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [Cross-origin requests](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests)

---

## 2. Slack / Discord Bot

### Slack: Slash Command vs Bot vs App

| Approach | Fit for `/idea [title]` | Effort |
|----------|-------------------------|--------|
| **Slash Command** | ✅ Perfect | Low — POST to Request URL, parse `text` |
| Bot (events) | Overkill for simple capture | Medium |
| Incoming Webhook | One-way only, no user context | N/A |

**Recommendation:** Slash command. Create command `/idea` with Request URL pointing to Creator OS `POST /api/capture/slack`.

### Discord: Slash Command vs Bot

| Approach | Fit for `/idea [title]` | Effort |
|----------|-------------------------|--------|
| **Slash Command (CHAT_INPUT)** | ✅ Perfect | Low — interaction payload to webhook |
| Bot (prefix commands) | Deprecated pattern | N/A |

**Recommendation:** Application command type `CHAT_INPUT`. Register via Discord API, receive interactions at webhook URL.

### Slack Slash Command Flow

1. User types `/idea My content idea here`
2. Slack POSTs to Request URL (form-urlencoded):
   - `user_id`, `team_id`, `channel_id`, `text`, `response_url`, `trigger_id`
3. Creator OS API: validate request (Slack signing secret), map `user_id` to Creator OS user, create ContentIdea, respond (ephemeral or in-channel)

**Slack payload example:**
```
token=xxx&team_id=T0001&user_id=U2147483697&command=/idea&text=My+content+idea+here&response_url=https://hooks.slack.com/...
```

### Discord Interaction Flow

1. User types `/idea title:My content idea`
2. Discord sends `POST` to Interaction Endpoint URL with `type: 4` (APPLICATION_COMMAND), `data.options`
3. Creator OS API: verify signature (Discord public key), map `member.user.id` to Creator OS user, create ContentIdea, return JSON response (required within 3 seconds)

**Discord interaction:** Uses Ed25519 signature verification. Must respond with `type: 5` (DEFERRED) if processing > 3s, then follow-up via webhook.

### User Linking: Slack/Discord → Creator OS

| Approach | Pros | Cons |
|----------|------|------|
| **API key per user** | Simple: user generates key in Creator OS, pastes into Slack/Discord app config | Manual; no automatic linking |
| **OAuth install + user mapping** | Automatic: Slack `user_id` → Creator OS user after OAuth | Higher complexity; need Slack OAuth app install flow |
| **Workspace-wide API key** | Easiest: one key for workspace, all ideas go to one Creator OS user | No multi-user support |

**Recommendation for MVP:** Workspace-wide API key. Creator OS user creates API key, configures Slack/Discord app with that key. All `/idea` from that workspace → that user. Add per-user OAuth linking in a later phase.

### Hosting

| Option | Fit | Notes |
|--------|-----|-------|
| **Next.js API routes** | ✅ Recommended | `src/app/api/capture/slack/route.ts`, `src/app/api/capture/discord/route.ts` — serverless, no extra infra |
| Separate service | Overkill | Only if high volume or different runtime |

---

## 3. PWA

### Next.js PWA Setup

| Library | Status | Notes |
|---------|--------|-------|
| **next-pwa** | Active (v5.6+) | Zero-config, Workbox v6, ~248K weekly downloads |
| @ducanh2912/next-pwa | Fork of next-pwa | Alternative if main unmaintained |
| vite-pwa | Vite-only | N/A for Next.js |

**Recommendation:** `next-pwa`. Configure in `next.config.js`.

**Installation:**
```bash
npm install next-pwa
```

**next.config.js:**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // existing Next.js config
});
```

### Mobile Install

- **Web App Manifest:** `public/manifest.json` — `name`, `short_name`, `icons`, `start_url`, `display: standalone`
- **Icons:** 192x192, 512x512 (required for install prompt)
- **Install prompt:** Use `beforeinstallprompt` event; show custom "Add to Home Screen" UI when available

### Offline Capture

| What | Offline? | Sync |
|------|----------|------|
| **Ideas (title + description)** | ✅ Yes | Queue in IndexedDB, sync when online |
| Script generation | ❌ No | Requires API |
| Full idea form (platform, audience, etc.) | ✅ Yes | Same queue |

**Service worker strategy:**
- **NetworkFirst** for API calls when online
- **CacheFirst** for static assets
- **Background Sync API** for queued idea creation when connection restored

**Offline capture flow:**
1. User opens PWA, goes offline
2. User enters idea (title, optional description)
3. App writes to IndexedDB (e.g., `pendingIdeas` store)
4. When online: Service Worker `sync` event fires, or app polls `navigator.onLine`, drain queue to `POST /api/capture/idea`

**IndexedDB library:** `idb` (Promise wrapper) — recommended in Google PWA codelabs.

### Data Sync When Online

- Use **Background Sync** (`registration.sync.register('sync-ideas')`) to retry failed requests
- Or: App-level queue that checks `navigator.onLine` and drains on reconnect
- Conflict resolution: Last-write-wins for simple idea capture (no collaborative editing)

**References:**
- [next-pwa GitHub](https://github.com/shadowwalker/next-pwa)
- [Workbox Strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/)
- [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Sync_API)
- [PWA IndexedDB (Google Codelabs)](https://developers.google.com/codelabs/pwa-training/pwa03--indexeddb)

---

## 4. Creator OS Integration

### Existing API

| Endpoint | Auth | Schema |
|----------|------|--------|
| `GET /api/ideas` | `getServerSession()` | Query params: status, platform, audience, q, page, limit |
| `POST /api/ideas` | `getServerSession()` | CreateIdeaSchema: title, description, platform, audience, format, tags?, notes? |

**CreateIdeaSchema (required):** `title`, `description`, `platform`, `audience`, `format`

### Capture API Design

**New endpoint:** `POST /api/capture/idea`

**Auth:** API key in `Authorization: Bearer <key>` or `X-API-Key: <key>`

**User association:** ContentIdea model currently has no `userId` field; GET /api/ideas returns all ideas. For capture, API key maps to a Creator OS user. Options: (a) Add `userId` to ContentIdea and filter GET by session user (multi-user); (b) Keep current model if app is single-user. **Recommendation:** Add optional `userId` to ContentIdea for capture; existing ideas remain without userId (backward compatible). ApiKey model: `{ userId, keyHash, name }`.

**Request body (simplified for quick capture):**
```json
{
  "title": "string (required)",
  "description": "string (optional, default: '')",
  "platform": "youtube|tiktok|long-form|multi (optional, default: 'multi')",
  "audience": "beginner|intermediate|advanced|mixed (optional, default: 'mixed')",
  "format": "tutorial|story|demo|interview|other (optional, default: 'other')",
  "sourceUrl": "string (optional - from extension)",
  "source": "extension|slack|discord|pwa (optional)"
}
```

**Schema:** New `CaptureIdeaSchema` in `schemas.ts` with optional platform/audience/format and defaults.

**API key storage:** New model or collection `ApiKey`: `{ userId, keyHash, name, createdAt }`. Keys are hashed (e.g., SHA-256); plain key shown once on creation.

### Auth Pattern

```javascript
// In route handler
const authHeader = request.headers.get('Authorization');
const apiKey = authHeader?.replace(/^Bearer\s+/i, '') || request.headers.get('X-API-Key');
if (!apiKey) return Response.json({ error: 'Unauthorized' }, { status: 401 });

const user = await validateApiKey(apiKey); // Lookup by hash, return user
if (!user) return Response.json({ error: 'Invalid API key' }, { status: 401 });
```

---

## 5. Technical Constraints

| Constraint | Value |
|------------|-------|
| Framework | Next.js 14 App Router |
| DB | MongoDB Atlas, Mongoose |
| Auth | NextAuth (GitHub, Credentials dev) |
| Connection | `connectToDatabase()` from `@/lib/db/connection` |
| User preferences | JavaScript over TypeScript, Material-UI |
| API routes | `src/app/api/[resource]/route.ts` |

---

## 6. Dependencies & Blockers

### External APIs

| Service | Requirement | Approval |
|---------|-------------|----------|
| **Slack** | Create app, Slash Command, Request URL | No app directory listing needed for workspace-only |
| **Discord** | Create application, register command, Interactions Endpoint URL | No approval for non-public bot |
| **Chrome Web Store** | Developer account ($5 one-time), extension submission | Review typically 1–3 days |
| **Firefox Add-ons** | Developer account (free), submission | Review varies |

### Security

| Concern | Mitigation |
|---------|------------|
| **CORS** | Extension: host_permissions; API: allow extension origin or rely on API key (no cookies) |
| **API key storage** | Extension: `chrome.storage.sync` (encrypted by Chrome); never in code |
| **Slack/Discord verification** | Verify request signatures (Slack: HMAC-SHA256; Discord: Ed25519) |
| **Rate limiting** | Consider rate limit on `/api/capture/idea` per API key |

---

## 7. Standard Stack

### Core

| Library | Version | Purpose |
|---------|---------|---------|
| next-pwa | ^5.6 | PWA, service worker, Workbox |
| idb | ^8 | IndexedDB Promise wrapper for offline queue |

### Browser Extension (separate package)

| Item | Purpose |
|------|---------|
| manifest.json | Manifest V3, content_scripts, host_permissions |
| Vanilla JS or minimal build | No framework required for simple extension |

### Slack/Discord

| Item | Purpose |
|------|---------|
| Slack API | Slash command docs, signing verification |
| Discord API | Application commands, interaction webhook, signature verification |

**No additional npm packages required** for Slack/Discord — use `crypto` for verification.

---

## 8. Architecture Patterns

### Capture API Flow

```
[Extension / Slack / Discord / PWA]
        │
        ▼
POST /api/capture/idea
        │
        ├─ Validate API key → get userId
        ├─ Validate body (CaptureIdeaSchema)
        ├─ connectToDatabase()
        ├─ ContentIdea.create({ ...data, userId from session/key })
        └─ Return 201 { idea }
```

### Extension Message Flow

```
Content Script (DOM) ──sendMessage──► Background Service Worker ──fetch──► Creator OS API
```

### PWA Offline Flow

```
User input → IndexedDB (pendingIdeas) → [Online] → Background Sync / Poll → POST /api/capture/idea
```

---

## 9. Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|--------------|
| Service worker | Custom SW logic | next-pwa + Workbox |
| IndexedDB raw API | Callback hell | idb library |
| Slack signature verification | Manual crypto | Standard HMAC-SHA256 (Node crypto) |
| Discord signature verification | Manual Ed25519 | `tweetnacl` or `@discordjs/rest` pattern |
| API key hashing | Custom hash | crypto.createHash('sha256').update(key).digest('hex') |

---

## 10. Common Pitfalls

### Extension

- **Content script CORS:** Content scripts cannot bypass CORS. Delegate `fetch` to background service worker.
- **Host permissions:** Must declare `host_permissions` for Creator OS API domain.
- **API key in code:** Never ship API key in extension bundle. User configures in options.

### Slack/Discord

- **Response time:** Slack expects response within 3 seconds; use `response_url` for async follow-up if needed.
- **Discord 3s limit:** Must respond within 3 seconds; use `type: 5` (DEFERRED) + follow-up webhook for slow operations.
- **Signature verification:** Always verify Slack/Discord signatures to prevent spoofing.

### PWA

- **Service worker scope:** Ensure SW scope includes API routes if caching; for capture, API calls typically go to network.
- **IndexedDB versioning:** Bump version when schema changes; handle upgrade in `onupgradeneeded`.

---

## 11. MVP Scope Recommendation

### Phased Approach

| Phase | Deliverable | Effort | Dependencies |
|-------|-------------|--------|--------------|
| **1. Capture API** | `POST /api/capture/idea`, API key model, CaptureIdeaSchema | 1–2 days | None |
| **2. Browser extension** | Manifest V3 extension, content capture, options for API key | 2–3 days | Phase 1 |
| **3. Slack bot** | `/idea` slash command, `POST /api/capture/slack` | 1 day | Phase 1 |
| **4. Discord bot** | `/idea` command, `POST /api/capture/discord` | 1 day | Phase 1 |
| **5. PWA** | next-pwa, manifest, offline capture + sync | 2–3 days | Phase 1 |

### Recommended Order

1. **Capture API** — Unblocks all three channels.
2. **Browser extension** — Highest impact; users capture while browsing Twitter, HN, docs daily.
3. **Slack bot** — Quick win; many teams use Slack; simple slash command.
4. **Discord bot** — Similar to Slack; can share most logic.
5. **PWA** — Valuable for mobile; offline adds complexity; do last.

### Effort Summary

| Item | Estimate |
|------|----------|
| Capture API + API keys | 1–2 days |
| Browser extension | 2–3 days |
| Slack + Discord | 1–2 days |
| PWA | 2–3 days |
| **Total** | ~7–10 days |

---

## 12. Code Examples

### Extension Background Worker (fetch to API)

```javascript
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'CAPTURE_IDEA') {
    chrome.storage.sync.get(['apiKey', 'apiUrl'], async (config) => {
      const res = await fetch(`${config.apiUrl}/api/capture/idea`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(msg.payload),
      });
      sendResponse({ ok: res.ok, status: res.status });
    });
  }
  return true; // Async response
});
```

### Slack Slash Command Handler (Next.js route)

```javascript
// Verify: crypto.createHmac('sha256', SLACK_SIGNING_SECRET).update(rawBody).digest('hex') === signature
// Parse: form-urlencoded → user_id, text
// Create idea: CaptureIdeaSchema with title = text, defaults for rest
// Respond: { response_type: 'ephemeral', text: 'Idea captured!' }
```

### CaptureIdeaSchema (Zod)

```javascript
export const CaptureIdeaSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional().default(''),
  platform: z.enum(['youtube', 'tiktok', 'long-form', 'multi']).optional().default('multi'),
  audience: z.enum(['beginner', 'intermediate', 'advanced', 'mixed']).optional().default('mixed'),
  format: z.enum(['tutorial', 'story', 'demo', 'interview', 'other']).optional().default('other'),
  sourceUrl: z.string().url().optional(),
  source: z.enum(['extension', 'slack', 'discord', 'pwa']).optional(),
});
```

---

## 13. Sources

### Primary (HIGH confidence)

- [Chrome Extensions MV3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Content Scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [Chrome Cross-origin requests](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests)
- [Slack Slash Commands](https://api.slack.com/interactivity/slash-commands)
- [Discord Application Commands](https://docs.discord.com/developers/interactions/application-commands)
- [next-pwa GitHub](https://github.com/shadowwalker/next-pwa)

### Secondary (MEDIUM confidence)

- WebSearch: Chrome extension CORS, PWA offline sync, Slack/Discord slash commands
- Creator OS codebase: ContentIdea model, ideas API, auth patterns

---

## 14. Metadata

**Confidence breakdown:**
- Standard stack: HIGH — next-pwa, idb, Chrome/Discord/Slack docs verified
- Architecture: HIGH — patterns from official docs
- Pitfalls: HIGH — CORS, signature verification, response limits documented

**Research date:** 2026-03-18  
**Valid until:** ~30 days (stable domain)
