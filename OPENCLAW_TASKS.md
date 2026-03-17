# OpenClaw Autonomous Tasks - Creator OS

## 🎯 Start Here - Tier 1 Priority

### Task 1: Create Script from Idea Button
**Status:** READY TO BUILD
**Priority:** HIGH
**Estimated Time:** 30 minutes

**What to do:**
1. Open `/src/app/(app)/ideas/[id]/page.tsx`
2. Find the detail page component
3. Add a blue Button below the idea description:
   - Label: "Create Script"
   - Icon: `<AutoFixHighIcon />`
   - onClick: Call `/api/scripts` with ideaId
   - After success: Navigate to `/app/scripts/[id]`

**Files to modify:**
- `src/app/(app)/ideas/[id]/page.tsx`

**Test it:**
1. Create an idea
2. Go to idea detail
3. Click "Create Script"
4. Should redirect to new script editor

**Success:** Button works, script creates, redirects to editor

---

### Task 2: Fix Script Generation Loading State
**Status:** READY TO BUILD
**Priority:** HIGH
**Estimated Time:** 20 minutes

**What to do:**
1. Open `/src/app/(app)/scripts/[id]/page.tsx` (the editor page)
2. Find the "Generate Script with AI" button
3. Improve the loading state:
   - Add a countdown timer: "Generating... 30s"
   - Show estimated tokens after completion
   - Add success toast: "Script generated! X words"
   - Add error alert with retry button

**Files to modify:**
- `src/app/(app)/scripts/[id]/page.tsx`

**Testing:**
1. Go to script editor
2. Enter outline
3. Click "Generate Script with AI"
4. Watch for loading state and completion messages

**Success:** Loading state looks good, user sees feedback

---

### Task 3: Run Full E2E Test & Document Results
**Status:** READY TO TEST
**Priority:** HIGH
**Estimated Time:** 15 minutes

**What to do:**
1. Start dev server: `npm run dev`
2. Log in with GitHub
3. Follow this flow:
   - Create idea: "AI tutorials for beginners"
   - Navigate to idea detail
   - Click "Create Script" (once Task 1 is done)
   - Enter outline: "Explain how transformers work in 10 minutes"
   - Click "Generate Script with AI"
   - Wait for completion
   - Save the script
   - Navigate to Pipeline
   - Check if episode appears (may need manual episode creation)

4. Document in `TESTING.md`:
   - ✅ What worked
   - ❌ What broke
   - 🐛 Any errors
   - 💡 Suggestions

**Files to create:**
- `TESTING.md` (new file)

**Success:** E2E flow completes, all steps documented

---

## 📋 Tier 2 - Do After Tier 1

### Task 4: Add Sidebar Navigation
**Status:** READY TO BUILD
**Priority:** MEDIUM
**Estimated Time:** 45 minutes

**What to do:**
1. Create `src/components/shared-ui/AppSidebar.tsx`
2. Add navigation links:
   - Dashboard → `/app/dashboard`
   - Ideas → `/app/ideas`
   - Scripts → `/app/scripts`
   - Pipeline → `/app/pipeline`
   - Analytics → `/app/analytics` (stub)
3. Update `src/app/(app)/layout.tsx` to show sidebar
4. Add active route highlighting

**Files to create:**
- `src/components/shared-ui/AppSidebar.tsx` (new)

**Files to modify:**
- `src/app/(app)/layout.tsx`
- `src/styles/theme.ts` (if needed for colors)

**Success:** Sidebar appears, navigation works, active routes highlighted

---

### Task 5: Create Episode from Script Button
**Status:** READY TO BUILD
**Priority:** MEDIUM
**Estimated Time:** 35 minutes

**What to do:**
1. Add "Create Episode" button in `/src/app/(app)/scripts/[id]/page.tsx`
2. Button opens a dialog/modal form with fields:
   - Title (required)
   - Description (optional)
   - Series (optional dropdown)
3. On submit:
   - POST to `/api/episodes` with ideaId + scriptId + title
   - Show success message
   - Redirect to `/app/pipeline`

**Files to modify:**
- `src/app/(app)/scripts/[id]/page.tsx`

**Testing:**
1. Go to script editor
2. Click "Create Episode"
3. Fill form
4. Submit
5. Should redirect to pipeline with new episode

**Success:** Episode creates and appears in pipeline

---

### Task 6: Publish Record Creation UI
**Status:** READY TO BUILD
**Priority:** MEDIUM
**Estimated Time:** 30 minutes

**What to do:**
1. In `/src/app/(app)/pipeline/page.tsx`
2. Add "Add Publishing Record" button on each episode card
3. Opens modal form with:
   - Platform: dropdown (YouTube, TikTok, Instagram)
   - Status: dropdown (scheduled, live)
   - URL: text input (optional)
   - Scheduled Date: date input
4. On submit: POST to `/api/publishing-records`

**Files to modify:**
- `src/app/(app)/pipeline/page.tsx`

**Success:** Can add publishing records from UI

---

## 🔧 Maintenance Tasks (Anytime)

### Task M1: Clean Up Unused Imports
**When:** During any file edits
**How:** Remove imports not used in file
**Example:** `Dialog`, `DialogTitle` in pipeline page

### Task M2: Fix TypeScript Errors
**When:** Build fails with type errors
**How:** Read error, fix type signature or remove unused code
**Files:** Check build output for locations

### Task M3: Update Documentation
**When:** Features are added
**How:** Update OPENCLAW_INSTRUCTIONS.md with new routes/patterns
**Pattern:** Keep reference sections in sync with code

---

## 🧪 Testing Checklist

Run this to verify everything works:

```bash
# 1. Build check
npm run build
# Should: "✓ Compiled successfully"

# 2. Visual check
npm run dev
# Visit: http://localhost:3000

# 3. Auth check
# Login → Should redirect to /app/dashboard

# 4. Data flow
# Ideas → Scripts → Episodes → Pipeline

# 5. AI check
# Generate script with outline → Wait for GPT-4 response
```

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Build fails: "Property not found" | Unused import | Remove the import line |
| Button doesn't navigate | Missing Next Link or router | Use `useRouter().push()` or Next `<Link>` |
| API returns 401 | No session check | Add `if (!session)` guard |
| GPT-4 times out | Long outline | Test with shorter text first |
| Redirect loops | Middleware misconfiguration | Check `middleware.ts` matcher |

---

## 📊 Progress Tracking

**Tier 1 (MVP Critical):**
- [ ] Task 1: Create Script Button
- [ ] Task 2: Loading States
- [ ] Task 3: E2E Testing

**Tier 2 (Enhancement):**
- [ ] Task 4: Sidebar
- [ ] Task 5: Episode Creation
- [ ] Task 6: Publishing Records

**Status:** Track with git commits
- Use format: `feat: [task-name] - quick summary`
- Example: `feat: add create-script-button - allows creating scripts from ideas`

---

## 📞 Need Help?

1. **Stuck on TypeScript?** → Check `src/lib/db/models` for type examples
2. **API not working?** → Test with curl or Postman first
3. **Build failing?** → Read full error message, Google error code
4. **Feature unclear?** → Review OPENCLAW_INSTRUCTIONS.md patterns
5. **Still blocked?** → Escalate to Michael with:
   - What you tried
   - Error message
   - Suggested solution

---

**Ready to start? Begin with Task 1!** 🚀
