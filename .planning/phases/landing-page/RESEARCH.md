# Phase: Unauthenticated Marketing Landing Page - Research

**Researched:** 2025-03-19
**Domain:** Next.js App Router, Next-Auth, Material-UI, marketing page architecture
**Confidence:** HIGH

## Summary

Creator OS currently redirects unauthenticated visitors from `/` to `/login` and authenticated users to `/app/dashboard`. The middleware only protects `/app/*` routes; root and `/login` are already public. To add a marketing landing page, replace the redirect logic in `src/app/page.tsx` with conditional rendering: show the landing page when unauthenticated, redirect to `/app/dashboard` when authenticated. No middleware or auth config changes are required. The landing page should live at root `/`, inherit the existing root layout (ThemeProvider, no sidebar), and use the project's Material-UI theme and brand tokens.

**Primary recommendation:** Replace `src/app/page.tsx` with a server component that conditionally renders a new landing page component when unauthenticated; reuse theme, brandColors, and MUI patterns from the login page.

---

## Current Routing Structure

### Route Map

| Route | File | Auth | Layout |
|-------|------|------|--------|
| `/` | `src/app/page.tsx` | Redirects based on session | Root layout |
| `/login` | `src/app/(auth)/login/page.tsx` | Public | Root layout |
| `/app/*` | `src/app/app/**/*.tsx` | Protected | App layout (sidebar) |
| `/api/*` | `src/app/api/**/*.ts` | Per-route session checks | N/A |

### Key Files

```
src/app/
├── layout.tsx              # Root: ThemeProvider, Inter font, metadata
├── page.tsx                # Root page — CURRENTLY: redirect only
├── globals.css
├── (auth)/
│   └── login/
│       └── page.tsx        # Login UI (Container, Box, MUI)
└── app/
    ├── layout.tsx          # Protected: getServerSession, redirect to /login
    ├── page.tsx            # Redirects to /app/dashboard
    ├── dashboard/
    └── ...
```

### Where Unauthenticated Traffic Lands Today

- **`/`** → `getServerSession()` → if no session: `redirect('/login')`; if session: `redirect('/app/dashboard')`
- **`/login`** → Renders login form (GitHub + credentials)
- **`/app/*`** → Middleware + layout: redirect to `/login` if unauthenticated

---

## Auth Flow

### Middleware

**File:** `middleware.ts` (project root)

```typescript
import { auth } from '@/lib/auth';
export const middleware = auth(() => {});
export const config = {
  matcher: ['/app/:path*'],
};
```

- **Matcher:** Only `/app/*` routes run through middleware
- **`/` and `/login`:** Do NOT go through middleware — they are fully public
- **`/app/*`:** Middleware runs; `authorized` callback in auth config redirects to `/login` if not logged in

### Auth Config (`src/lib/auth.ts`)

- `authorized({ auth, request })` runs only for matcher routes (`/app/*`)
- If on `/app/*` and not logged in → redirect to `/login?callbackUrl=<pathname>`
- If on `/login` and logged in → redirect to `/app/dashboard`
- `pages.signIn: '/login'` — NextAuth uses `/login` as sign-in page

### Layout-Level Auth

- **`src/app/app/layout.tsx`:** `getServerSession()` → if no session, `redirect('/login')`
- **`src/app/page.tsx`:** `getServerSession()` → redirect based on session (no render)

### Implications for Landing Page

- Root `/` is already public; no middleware changes needed
- Change `src/app/page.tsx` from "redirect only" to "render landing when unauthenticated, redirect when authenticated"
- No changes to `middleware.ts`, `authConfig`, or app layout

---

## Landing Page Placement

### Recommended: Root `/` with Conditional Render

**Location:** `src/app/page.tsx` (modify) + new component(s)

**Rationale:**

1. Root `/` is the natural entry for marketing; no extra path needed
2. No route group required — root layout already provides ThemeProvider
3. Keeps landing outside `(app)` — no sidebar, no protected layout
4. Single source of truth: one page handles both states

**Alternative (not recommended):** Dedicated route group `(marketing)/page.tsx` at `/` — adds structure without benefit since root layout is shared.

### File Paths to Create/Modify

| Action | Path |
|--------|------|
| **Modify** | `src/app/page.tsx` — conditional render: landing vs redirect |
| **Create** | `src/components/landing/LandingPage.tsx` — main landing component |
| **Create** | `src/components/landing/LandingHero.tsx` — hero section (optional split) |
| **Create** | `src/components/landing/LandingFeatures.tsx` — features grid (optional) |
| **Create** | `src/components/landing/LandingCTA.tsx` — CTA section (optional) |

**Minimal approach:** Single `LandingPage.tsx` with inline sections. Split into subcomponents only if reuse or maintainability warrants it.

---

## Design Patterns

### Reusable from Existing Codebase

| Resource | Location | Use |
|----------|----------|-----|
| Theme | `src/styles/theme.ts` | `useTheme()`, `sx` prop, `theme.palette` |
| Brand colors | `brandColors` from theme.ts | Gradients, accents |
| ThemeProvider | `src/components/providers/ThemeProvider.tsx` | Already wraps root layout |
| Logo | `/creatoros.png` (public) | Same as login page |
| MUI components | Box, Container, Typography, Button, etc. | Same as login/dashboard |
| Inter font | Root layout `--font-inter` | Already applied |

### Login Page Pattern (Reference)

```tsx
// src/app/(auth)/login/page.tsx — structure to mirror
<Container maxWidth="sm">
  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', gap: 3 }}>
    <Image src="/creatoros.png" alt="Creator OS" width={80} height={80} />
    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>Creator OS</Typography>
    <Typography variant="body1" color="textSecondary">AI & Developer Content Creation Platform</Typography>
    <Button variant="contained" startIcon={<GitHubIcon />} onClick={...}>Sign in with GitHub</Button>
  </Box>
</Container>
```

### Landing Page Pattern

- Use `Container maxWidth="lg"` or `"md"` for wider hero
- Use `Box` for layout, `sx` for responsive spacing
- Use `Typography` with `variant="h1"`–`h6` for hierarchy
- Use `Button` with `variant="contained"` for primary CTA, `variant="outlined"` for secondary
- Use `Link` from `next/link` or MUI `Button component={Link}` for navigation

### Theme Tokens

```typescript
// From src/styles/theme.ts
brandColors: { orange, gold, purple, magenta, blue, cyan }
palette.primary.main: purple
palette.secondary.main: cyan
typography: h1–h6, body1, body2
shape.borderRadius: 12
```

---

## Content Structure

### Standard Marketing Hub Sections (for Content Creation Platform)

| Section | Purpose | Typical Elements |
|--------|---------|------------------|
| **Hero** | Value prop, primary CTA | Headline, subheadline, "Get started" / "Sign in" button |
| **Features** | Platform benefits | 3–6 feature cards (Ideas → Scripts → Episodes, AI assistance, multi-platform) |
| **CTA** | Conversion | Secondary CTA block ("Start creating today") |
| **Footer** (optional) | Legal, links | Login link, minimal footer |

### Creator OS–Specific Messaging

- **Headline:** Emphasize AI-powered content creation, developer advocates, YouTube/TikTok/long-form
- **Features:** Ideas → Scripts → Episodes workflow, AI script generation, platform publishing
- **CTA:** Link to `/login` ("Get started" or "Sign in")

---

## Navigation: Landing → Login/Signup

### Flow

1. Landing page CTA button → `href="/login"` or `onClick` with `router.push('/login')`
2. Login page → `signIn('github', { redirectTo: '/app/dashboard' })` or credentials
3. After auth → NextAuth redirects to `callbackUrl` or `/app/dashboard`

### Existing Auth UI

- **Login page:** `src/app/(auth)/login/page.tsx` — GitHub button, credentials form
- **No signup page:** GitHub OAuth handles signup; credentials are dev-only
- **Link component:** Use `NextLink` or MUI `Button component={Link} href="/login"`

### Recommended CTA

```tsx
<Button variant="contained" component={Link} href="/login" size="large">
  Get started
</Button>
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Unchanged
│   ├── page.tsx             # MODIFY: conditional landing vs redirect
│   ├── (auth)/login/...
│   └── app/...              # Unchanged
├── components/
│   └── landing/
│       └── LandingPage.tsx   # NEW: marketing page content
├── styles/
│   └── theme.ts             # Unchanged
└── lib/
    └── auth.ts              # Unchanged
```

### Pattern: Conditional Root Page

```tsx
// src/app/page.tsx
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LandingPage } from '@/components/landing/LandingPage';

export default async function Home() {
  const session = await getServerSession();

  if (session) {
    redirect('/app/dashboard');
  }

  return <LandingPage />;
}
```

### Anti-Patterns to Avoid

- **Don't** put landing under `src/app/app/` — it would get the sidebar and require auth
- **Don't** add `/` to middleware matcher — would run auth on every visit
- **Don't** create a separate `/landing` route as primary — `/` is the standard entry
- **Don't** use client components for the root page shell — keep session check server-side

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session check | Custom cookie parsing | `getServerSession()` from auth | NextAuth handles session, CSRF |
| Auth redirect | Manual redirect logic | `redirect()` from `next/navigation` | Correct Next.js behavior |
| Theme/styling | Custom CSS or Tailwind | MUI + theme.ts | Project standard, brand consistency |
| Routing | Custom route config | App Router file structure | Convention over configuration |

---

## Common Pitfalls

### Pitfall 1: Middleware Over-Protection

**What goes wrong:** Adding `/` to middleware matcher causes redirect loops or blocks public access.

**Why it happens:** Assuming all routes need auth middleware.

**How to avoid:** Middleware matcher stays `['/app/:path*']`. Root and login remain outside.

### Pitfall 2: Client-Side Session Check on Landing

**What goes wrong:** Flash of wrong content, layout shift, or hydration mismatch.

**Why it happens:** Using `useSession()` to conditionally render landing vs app.

**How to avoid:** Use server component with `getServerSession()` in `page.tsx`; render landing or redirect before sending HTML.

### Pitfall 3: Landing Inside App Layout

**What goes wrong:** Landing page shows sidebar, or requires auth.

**Why it happens:** Placing landing under `src/app/app/` or a shared layout that gates auth.

**How to avoid:** Keep landing at root; only `src/app/app/*` uses the app layout.

### Pitfall 4: Duplicate Theme Setup

**What goes wrong:** Landing uses different colors or fonts.

**Why it happens:** Creating standalone styles for marketing page.

**How to avoid:** Use `ThemeProvider` (already in root layout) and `theme` from `@/styles/theme`.

---

## Code Examples

### Root Page (Server Component)

```tsx
// src/app/page.tsx
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LandingPage } from '@/components/landing/LandingPage';

export default async function Home() {
  const session = await getServerSession();
  if (session) redirect('/app/dashboard');
  return <LandingPage />;
}
```

### Landing CTA to Login

```tsx
// In LandingPage.tsx
import NextLink from 'next/link';
import { Button } from '@mui/material';

<Button variant="contained" component={NextLink} href="/login" size="large">
  Get started
</Button>
```

### Reusing Brand and Theme

```tsx
// In LandingPage.tsx
import { useTheme } from '@mui/material/styles';
import { brandColors } from '@/styles/theme';

// Or use palette from theme
const theme = useTheme();
// theme.palette.primary.main, theme.typography.h1, etc.
```

---

## Dependencies and Constraints

### No New Dependencies

- Material-UI, Next.js, Next-Auth already in use
- No additional packages required for landing page

### Constraints

- **Next.js 14** App Router — use `app/` directory, Server Components by default
- **Next-Auth 5** (beta) — `getServerSession` is `auth` from `@/lib/auth`
- **Material-UI 5** — use `@mui/material` components
- **MongoDB Atlas** — no DB calls needed for static landing content

### Environment

- No new env vars
- `NEXTAUTH_URL` must be set for OAuth redirects (already required)

---

## Validation Architecture

> Skipped — no `workflow.nyquist_validation` in `.planning/config.json` (file not found)

---

## Sources

### Primary (HIGH confidence)

- Creator OS codebase: `src/app/page.tsx`, `src/app/app/layout.tsx`, `middleware.ts`, `src/lib/auth.ts`, `src/app/(auth)/login/page.tsx`, `src/styles/theme.ts`
- Next.js docs: [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups), [Public Static Pages](https://nextjs.org/docs/app/guides/public-static-pages)

### Secondary (MEDIUM confidence)

- Web search: Next.js 14 App Router public vs protected routes, route groups for (auth) and (app)

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — verified from package.json and codebase
- Architecture: HIGH — routing and auth flow traced in code
- Pitfalls: HIGH — derived from Next.js and Next-Auth patterns

**Research date:** 2025-03-19  
**Valid until:** ~30 days (stable stack)
