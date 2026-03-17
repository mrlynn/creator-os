# OpenClaw Agent Instructions - Creator OS

## Project Overview

**Creator OS** is a Next.js 14 + MongoDB platform for AI-powered content creation. The MVP pipeline allows users to:
1. Capture content ideas
2. Generate full scripts using GPT-4-turbo AI
3. Track content through a publishing pipeline

**Current Status:** MVP complete, all 3 core domains functional
**Tech Stack:** Next.js 14, MongoDB, MUI, NextAuth v5, OpenAI API

---

## OpenClaw Authority & Scope

### ✅ Autonomous Decisions (No approval needed)
- Bug fixes (TypeScript errors, broken routes, compilation failures)
- Code cleanup (unused imports, formatting, linting)
- Test execution and validation
- Database queries and data inspection
- Adding new routes/models following existing patterns
- Updating dependencies for security patches
- Writing documentation and comments

### ⚠️ Requires Approval (Ask Michael first)
- Major architectural changes
- Removing features or routes
- Changing database schemas
- Switching libraries/frameworks
- Adding new external dependencies
- Modifying authentication logic
- Changing API response structures

### ❌ Never Do
- Push to production without explicit approval
- Delete or archive code without git commits
- Modify .env values directly
- Run destructive git commands (reset --hard, force push)
- Create accounts or test data on real systems

---

## Priority Task Queue

### Tier 1: Critical (Do first)
1. **Create Script Creation Flow** - Add button/route to create scripts from ideas
   - Location: `/app/ideas/[id]` needs "Create Script" button
   - Should: POST to `/api/scripts` with ideaId
   - Redirect to `/app/scripts/[id]` editor
   - Files: `src/app/(app)/ideas/[id]/page.tsx`

2. **Fix Script Generation UI** - Make it actually usable
   - Current issue: "Generate Script with AI" works but UX needs:
     - Show loading state with countdown timer
     - Display tokens used after generation
     - Show error messages from GPT-4
   - Files: `src/app/(app)/scripts/[id]/page.tsx`

3. **Test MVP End-to-End**
   - Manual flow: Idea → Script → Pipeline
   - Document any breakage in `/TESTING.md`
   - Create sample data if needed

### Tier 2: High (Complete before Phase 3)
1. **Add Sidebar Navigation** - Connect all pages
   - Create `src/components/shared-ui/AppSidebar.tsx`
   - Add links: Dashboard, Ideas, Scripts, Pipeline, Analytics (stub)
   - File: `src/app/(app)/layout.tsx` - uncomment sidebar TODO

2. **Episode Creation from Scripts**
   - Add button in `/app/scripts/[id]` to "Create Episode"
   - Popup form: title, description, select series (optional)
   - POST to `/api/episodes` with scriptId + ideaId
   - Redirect to `/app/pipeline`

3. **Publishing Records UI**
   - Add form in `/app/pipeline` to create publishing records
   - Fields: platform (YouTube/TikTok/Instagram), status, URL, scheduled date
   - POST to `/api/publishing-records`

### Tier 3: Enhancement (Optional, Phase 3 prep)
1. **Add AI Usage Dashboard** - Track costs
   - Show total tokens used, estimated costs
   - Group by feature (script-generation, hook-generation)
   - Query `/api/ai-usage-logs` (route needs building)

2. **Improve Error Handling**
   - Add toast notifications (use sonner or MUI Snackbar)
   - Handle network failures gracefully
   - Retry failed API calls

3. **Performance Optimization**
   - Add React Query caching for list endpoints
   - Implement pagination in Ideas/Scripts lists
   - Add loading skeletons instead of spinners

---

## Key Files & Patterns

### Database Models Location
```
src/lib/db/models/
├── Tag.ts
├── ContentIdea.ts
├── Script.ts (key fields: hook, problem, solution, demo, cta, outro)
├── Series.ts
├── Episode.ts
├── PublishingRecord.ts
├── AnalyticsSnapshot.ts
└── AiUsageLog.ts
```

### API Route Pattern
```typescript
// Always follow this:
import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();
  // ... route logic
}
```

### UI Component Pattern
```typescript
// Client components use 'use client'
'use client';
import { useState } from 'react';
import { Button, TextField } from '@mui/material';

export function MyComponent() {
  // ... component logic
}
```

### AI Helper Pattern
```typescript
// src/lib/ai/
import { getOpenAIClient } from './openai-client';
import { logAiUsage } from './usage-logger';

export async function myAiFeature(input: string) {
  const client = getOpenAIClient();
  const startTime = Date.now();

  try {
    const response = await client.chat.completions.create({...});

    logAiUsage({
      category: 'feature-name',
      tokensUsed: response.usage?.total_tokens || 0,
      durationMs: Date.now() - startTime,
      success: true,
    }).catch(console.error); // Fire-and-forget

    return { success: true, data: response };
  } catch (error) {
    logAiUsage({ category: 'feature-name', success: false, errorMessage: error.message });
    return { success: false, error };
  }
}
```

---

## Testing & Validation

### Build Verification
```bash
npm run build
# Should complete with "✓ Compiled successfully"
# Check for any TypeScript errors
```

### Test Checklist
- [ ] Can log in with GitHub
- [ ] Can create an idea
- [ ] Can view idea list with filters
- [ ] Can create script from idea
- [ ] Can generate script (outline → full script with GPT-4)
- [ ] Can save script sections
- [ ] Can create episode from script
- [ ] Can see episode in Kanban pipeline
- [ ] Can move episode between statuses

### Data Inspection
```bash
# MongoDB queries (run in MongoDB Compass or mongosh)
db.ContentIdeas.find().limit(5)
db.Scripts.find().limit(5)
db.Episodes.find().limit(5)
db.AiUsageLogs.find().sort({createdAt: -1}).limit(10)
```

---

## Error Handling & Recovery

### If TypeScript Build Fails
1. Check the error message for file location
2. Read the file and identify unused imports or type mismatches
3. Remove unused imports or fix type signatures
4. Re-run `npm run build`

### If API Routes Return 401
- Verify `await getServerSession()` call exists
- Check NextAuth is properly configured in `src/lib/auth.ts`
- Test `/api/health` endpoint - should work without auth

### If MongoDB Connection Fails
- Verify `MONGODB_URI` in `.env.local` is correct
- Check MongoDB Atlas cluster is running
- Run `/api/health` endpoint to test connection

### If GPT-4 API Fails
- Check `OPENAI_API_KEY` in `.env.local` is valid
- Verify OpenAI account has available credits
- Check error message for rate limiting or quota

---

## Git Workflow

### Before Starting Work
```bash
git status          # See current state
git pull            # Get latest changes
npm run build       # Verify it compiles
```

### While Working
```bash
# Test as you go
npm run build

# Make atomic commits when features complete
git add [specific files]
git commit -m "Add [feature]: [what it does]"
```

### After Completing Tasks
```bash
# Document what was done
git log --oneline -5

# Create summary for Michael
# Include: what was built, what was tested, any blockers
```

---

## Communication & Escalation

### Report to Michael if:
1. **Blocker Found** - Something prevents progress
   - Example: Missing API key, unclear requirements
   - Action: Document the blocker, suggest solutions

2. **Design Question** - Multiple valid approaches exist
   - Example: Should we add caching or pagination first?
   - Action: Present options with pros/cons

3. **Security Concern** - Potential vulnerability found
   - Example: User data exposed in logs
   - Action: Stop work, document, escalate immediately

### Status Format (in commits/docs)
```
✅ COMPLETED: [Feature name]
- What it does
- How to test it
- Any caveats

⏳ IN PROGRESS: [Feature name]
- Current step
- Next step
- Estimated completion

❌ BLOCKED: [Feature name]
- Root cause
- Suggested solutions
```

---

## Quick Reference: Important Routes

### Authentication
- `POST /api/auth/callback/github` - GitHub OAuth callback
- `GET /api/auth/session` - Get current session

### Ideas Domain
- `POST /api/ideas` - Create idea
- `GET /api/ideas?status=raw&platform=youtube` - List with filters
- `GET /api/ideas/[id]` - Get idea detail
- `PUT /api/ideas/[id]` - Update idea
- `DELETE /api/ideas/[id]` - Soft-delete (archive)

### Scripts Domain
- `POST /api/scripts` - Create script (needs ideaId)
- `GET /api/scripts` - List scripts
- `GET /api/scripts/[id]` - Get script
- `PUT /api/scripts/[id]` - Save script (auto-versions)
- `POST /api/scripts/[id]/generate` - Generate from outline (GPT-4)
- `POST /api/scripts/[id]/hooks` - Generate hooks (GPT-4)

### Episodes Domain
- `POST /api/episodes` - Create episode (needs ideaId + scriptId)
- `GET /api/episodes?editingStatus=recording` - List with filters
- `GET /api/episodes/[id]` - Get episode
- `PUT /api/episodes/[id]` - Update status/metadata
- `POST /api/publishing-records` - Add publishing record (needs episodeId)

### Health & Status
- `GET /api/health` - Test MongoDB connection

---

## Environment Variables Needed

```env
# .env.local must have:
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
VOYAGE_API_KEY=pa-...
NEXTAUTH_SECRET=[random-string]
NEXTAUTH_URL=http://localhost:3000
GITHUB_ID=[github-oauth-id]
GITHUB_SECRET=[github-oauth-secret]
```

---

## Success Criteria for Phase 2 Completion

- [ ] All Tier 1 tasks complete
- [ ] MVP pipeline works end-to-end (Idea → Script → Episode → Pipeline)
- [ ] All APIs return correct status codes
- [ ] GPT-4 integration generates valid scripts
- [ ] No TypeScript errors on build
- [ ] User can complete full workflow in <5 minutes

---

## Next Steps (Phase 3)

Once MVP is solid:
1. Content Library with semantic search (Atlas Vector Search)
2. Analytics dashboard
3. Hook lab (5 YouTube + 5 TikTok hooks in parallel)
4. Virality scoring for ideas
5. Repurposing engine (one video → multiple TikTok clips)

---

**Questions or blockers?** Escalate to Michael with clear context and suggested solutions.

Good luck! 🚀
