# Menu Overhaul Research — Creator OS

**Researched:** 2025-03-19  
**Domain:** Sidebar navigation, Material-UI, content creation platform UX, accessibility  
**Confidence:** HIGH

## Summary

Creator OS uses a flat, single-level sidebar with 12 nav items (Dashboard, Ideas, Scripts, Pipeline, Library, Series, Tags, AI Toolkit, Analytics, AI Cost, Settings, Help). The current implementation is in `AppSidebar.tsx` using MUI Drawer, List, and ListItemButton with a green accent and white background. Research indicates the menu would benefit from: (1) grouping by workflow (Content Creation, Content Management, AI & Analytics, System), (2) optional collapsible/expandable sections or a mini-variant for desktop, (3) SwipeableDrawer for mobile, (4) improved accessibility (nav landmark, aria-current, keyboard), and (5) configuration-driven nav items for maintainability.

**Primary recommendation:** Introduce grouped navigation with ListSubheader, add optional mini-variant for desktop, switch mobile to SwipeableDrawer, and improve accessibility. Keep MUI Drawer + List; avoid hand-rolling collapsible logic—use MUI Collapse.

---

## Current Implementation

### File Structure

| File | Purpose |
|------|---------|
| `src/components/shared-ui/AppSidebar.tsx` | Sidebar component: Drawer, nav items, active state, search button |
| `src/components/shared-ui/AppLayoutClient.tsx` | Layout shell: AppSidebar, mobile AppBar, main content area, responsive toggle |
| `src/app/app/layout.tsx` | App layout: ThemeProvider, ToastProvider, GlobalSearchProvider, AppLayoutClient |
| `src/styles/theme.ts` | Theme: primary green (#13aa52), background.paper white |

### Component Architecture

```
AppLayoutClient (client)
├── AppSidebar (variant: permanent | temporary, open, onClose)
│   ├── Drawer (MUI)
│   │   ├── Box (header: "Creator OS" + Search IconButton)
│   │   ├── Divider
│   │   └── List (navItems.map → ListItem → ListItemButton)
│   └── SIDEBAR_WIDTH = 220
├── AppBar (mobile only, md breakpoint down)
│   └── MenuIcon → handleDrawerToggle
└── Box (main content, ml: SIDEBAR_WIDTH on desktop)
```

### Current Nav Items (flat array)

```javascript
// src/components/shared-ui/AppSidebar.tsx lines 37-49
const navItems = [
  { label: 'Dashboard', href: '/app/dashboard', icon: <DashboardIcon /> },
  { label: 'Ideas', href: '/app/ideas', icon: <LightbulbIcon /> },
  { label: 'Scripts', href: '/app/scripts', icon: <ArticleIcon /> },
  { label: 'Pipeline', href: '/app/pipeline', icon: <ViewKanbanIcon /> },
  { label: 'Library', href: '/app/library', icon: <VideoLibraryIcon /> },
  { label: 'Series', href: '/app/series', icon: <CollectionsBookmarkIcon /> },
  { label: 'Tags', href: '/app/tags', icon: <LocalOfferIcon /> },
  { label: 'AI Toolkit', href: '/app/ai-toolkit', icon: <PsychologyIcon /> },
  { label: 'Analytics', href: '/app/analytics', icon: <BarChartIcon /> },
  { label: 'AI Cost', href: '/app/ai-cost', icon: <RequestQuoteIcon /> },
  { label: 'Settings', href: '/app/settings', icon: <SettingsIcon /> },
  { label: 'Help', href: '/app/help', icon: <HelpOutlineIcon /> },
];
```

### Routing & Active State

- **Routing:** Next.js App Router; `usePathname()` for active detection.
- **Active logic:** `pathname === item.href` or `pathname.startsWith(item.href)` (excluding dashboard).
- **Styling:** `selected={isActive}` on ListItemButton; `&.Mui-selected` uses `bgcolor: 'primary.main'`, `color: 'primary.contrastText'`.

### Responsive Behavior

- **Desktop (md+):** `variant="permanent"`, always open, `SIDEBAR_WIDTH` margin on main.
- **Mobile (<md):** `variant="temporary"`, hamburger in AppBar, `mobileOpen` state, `onClose` after nav click.
- **Breakpoint:** `theme.breakpoints.up('md')` in AppLayoutClient.

### Dependencies

- **MUI:** `@mui/material` ^5.15.15, `@mui/icons-material` ^5.15.15
- **GlobalSearch:** `GlobalSearchContext` provides `openSearch`; Search IconButton in sidebar header triggers ⌘K.

---

## Standard Stack

### Core (Already in Use)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @mui/material | ^5.15.15 | Drawer, List, ListItemButton, Collapse | Material Design, built-in accessibility, theme integration |
| @mui/icons-material | ^5.15.15 | Nav icons | Consistent icon set |
| next/navigation | 14.x | usePathname | App Router integration |

### Supporting (Use for Overhaul)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| MUI ListSubheader | built-in | Group labels | Section headers in List |
| MUI Collapse | built-in | Expand/collapse sections | Nested/collapsible groups |
| MUI SwipeableDrawer | built-in | Swipe-to-open on mobile | Replace Drawer for temporary variant on mobile |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MUI Drawer | Custom sidebar | MUI handles transitions, accessibility, responsive variants |
| MUI List | Custom nav | ListItemButton has built-in selected state, focus handling |
| Flat nav | Nested only | Flat is simpler; grouping with ListSubheader adds structure without nesting complexity |

**Installation:** No new packages. All components from existing `@mui/material`.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   └── shared-ui/
│       ├── AppSidebar.tsx          # Main sidebar (refactor)
│       ├── AppLayoutClient.tsx     # Layout shell (minor updates)
│       └── nav-config.ts           # NEW: nav items + groups config
├── styles/
│   └── theme.ts                   # Theme (unchanged or accent tweaks)
└── app/app/
    └── layout.tsx                 # Unchanged
```

### Pattern 1: Configuration-Driven Nav

**What:** Define nav structure in a config file; map to UI components.  
**When to use:** Scalability, single source of truth, easier to add/remove items.  
**Example:**

```javascript
// nav-config.ts
export const navGroups = [
  {
    label: 'Content Creation',
    items: [
      { label: 'Dashboard', href: '/app/dashboard', icon: <DashboardIcon /> },
      { label: 'Ideas', href: '/app/ideas', icon: <LightbulbIcon /> },
      { label: 'Scripts', href: '/app/scripts', icon: <ArticleIcon /> },
      { label: 'Pipeline', href: '/app/pipeline', icon: <ViewKanbanIcon /> },
    ],
  },
  {
    label: 'Content Management',
    items: [
      { label: 'Library', href: '/app/library', icon: <VideoLibraryIcon /> },
      { label: 'Series', href: '/app/series', icon: <CollectionsBookmarkIcon /> },
      { label: 'Tags', href: '/app/tags', icon: <LocalOfferIcon /> },
    ],
  },
  {
    label: 'AI & Analytics',
    items: [
      { label: 'AI Toolkit', href: '/app/ai-toolkit', icon: <PsychologyIcon /> },
      { label: 'Analytics', href: '/app/analytics', icon: <BarChartIcon /> },
      { label: 'AI Cost', href: '/app/ai-cost', icon: <RequestQuoteIcon /> },
    ],
  },
  {
    label: null, // Ungrouped or "System"
    items: [
      { label: 'Settings', href: '/app/settings', icon: <SettingsIcon /> },
      { label: 'Help', href: '/app/help', icon: <HelpOutlineIcon /> },
    ],
  },
];
```

### Pattern 2: ListSubheader for Grouping

**What:** Use `ListSubheader` inside `List` to separate groups.  
**When to use:** Visual grouping without collapsible behavior.  
**Example:**

```jsx
// Source: MUI List docs - List Subheader
<List>
  <ListSubheader>Content Creation</ListSubheader>
  {items.map((item) => (
    <ListItem key={item.href}>...</ListItem>
  ))}
  <ListSubheader>Content Management</ListSubheader>
  ...
</List>
```

### Pattern 3: Collapsible Groups with Collapse

**What:** Track `open` state per group; wrap nested items in `Collapse`.  
**When to use:** When groups should be expandable/collapsible.  
**Key:** Use object keyed by group ID to avoid all groups opening/closing together.

```jsx
// Source: Stack Overflow - MUI nested collapsible lists
const [open, setOpen] = useState({ contentCreation: true, contentMgmt: true });
<ListItemButton onClick={() => setOpen(s => ({ ...s, contentCreation: !s.contentCreation }))}>
  <ListItemText primary="Content Creation" />
  {open.contentCreation ? <ExpandLess /> : <ExpandMore />}
</ListItemButton>
<Collapse in={open.contentCreation} timeout="auto" unmountOnExit>
  <List disablePadding>
    {items.map(...)}
  </List>
</Collapse>
```

### Pattern 4: Mini-Variant Drawer (Desktop)

**What:** Drawer width animates between collapsed (icons only) and expanded (icons + labels).  
**When to use:** Maximize content area while keeping quick access.  
**Source:** MUI MiniDrawer example (GitHub).

```javascript
// Key: styled Drawer with openedMixin / closedMixin
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }),
  overflowX: 'hidden',
});
const closedMixin = (theme) => ({
  width: `calc(${theme.spacing(7)} + 1px)`,
  overflowX: 'hidden',
  transition: theme.transitions.create('width', { ... }),
});
// Apply to Drawer paper via sx or styled()
```

### Pattern 5: SwipeableDrawer for Mobile

**What:** Replace `Drawer variant="temporary"` with `SwipeableDrawer` on mobile for swipe-to-open.  
**When to use:** Mobile; improves discoverability of drawer.  
**Note:** `disableSwipeToOpen` is true on iOS by default (avoids conflict with back gesture).

```jsx
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
// Use when variant === 'temporary'
<SwipeableDrawer
  open={mobileOpen}
  onClose={onClose}
  onOpen={() => setMobileOpen(true)}
  disableDiscovery={iOS}  // iOS: disable edge-swipe discovery
  disableBackdropTransition={!iOS}
>
  {drawerContent}
</SwipeableDrawer>
```

### Anti-Patterns to Avoid

- **role="menu" for nav:** Use semantic `<nav>` and standard links; `role="menu"` expects arrow-key navigation and confuses screen readers for typical site nav.
- **Single open state for all groups:** Causes all collapsible sections to expand/collapse together; use per-group state.
- **Hand-rolling collapse animation:** Use MUI `Collapse`; it handles height transitions and unmount correctly.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collapsible sections | Custom height animation | MUI Collapse | Handles height calc, overflow, unmount |
| Swipe gesture on mobile | Custom touch handlers | SwipeableDrawer | Handles hysteresis, velocity, iOS quirks |
| Mini-variant width transition | Custom CSS width animation | MUI theme.transitions | Consistent with MUI, easing built-in |
| Active route detection | Custom router logic | usePathname + startsWith | Next.js built-in |
| Focus management in drawer | Manual focus trap | MUI Drawer/Modal | Modal manages focus when open |

**Key insight:** MUI components already handle transitions, focus, and touch behavior. Custom implementations risk edge cases (e.g., iOS swipe conflicts, focus trap on close).

---

## Common Pitfalls

### Pitfall 1: Nested ListItem Closes Drawer on Click

**What goes wrong:** When using nested ListItemButton inside a temporary Drawer, clicking a nested item may not close the drawer if the click handler is not propagated.  
**Why it happens:** Drawer `onClose` is typically triggered by backdrop click or explicit close; nested link clicks may not call `onClose`.  
**How to avoid:** Pass `onClick={variant === 'temporary' ? onClose : undefined}` to each ListItemButton (Creator OS already does this).  
**Warning signs:** Mobile drawer stays open after navigating.

### Pitfall 2: All Collapsible Groups Open/Close Together

**What goes wrong:** Using a single `open: boolean` state for all groups.  
**Why it happens:** One state variable toggles all Collapse `in` props.  
**How to avoid:** Use `Record<string, boolean>` keyed by group ID; toggle only the clicked group.  
**Warning signs:** Clicking "Content Creation" expands "AI & Analytics" too.

### Pitfall 3: Mini-Variant Without Main Content Margin Update

**What goes wrong:** Main content `ml` stays fixed when drawer collapses, causing overlap or gap.  
**Why it happens:** AppBar/Drawer and main Box need to respond to `open` state.  
**How to avoid:** Pass `sidebarOpen` to AppLayoutClient; set `ml: sidebarOpen ? SIDEBAR_WIDTH : MINI_WIDTH` on main.  
**Warning signs:** Content jumps or overlaps when toggling mini-variant.

### Pitfall 4: Missing Nav Landmark for Screen Readers

**What goes wrong:** Sidebar is a `<div>` with no semantic meaning.  
**Why it happens:** Drawer renders a div by default.  
**How to avoid:** Wrap List in `<nav aria-label="Main navigation">` or use Drawer's `PaperProps` to add role/aria-label.  
**Warning signs:** Screen reader doesn't announce "navigation" or "12 items".

### Pitfall 5: SwipeableDrawer Performance on Low-End Mobile

**What goes wrong:** `disableBackdropTransition: false` on low-end devices causes dropped frames.  
**Why it happens:** Backdrop animation is expensive.  
**How to avoid:** Use `disableBackdropTransition={!iOS}` (enable only on iOS); or detect low-end and disable.  
**Warning signs:** Janky drawer animation on Android budget devices.

---

## Best Practices: Sidebar UX in Content Creation Platforms

### Information Architecture

- **Group by workflow:** Ideas → Scripts → Pipeline (creation flow); Library, Series, Tags (management); AI Toolkit, Analytics, AI Cost (AI/analytics); Settings, Help (system).
- **Prioritize top:** Most-used items at top of each group.
- **Consistent structure:** Same order across sessions; avoid dynamic reordering without user control.

### Visual Hierarchy

- **ListSubheader:** Slightly smaller, muted color; sufficient contrast for readability.
- **Icons:** Keep at 24px (or `fontSize="small"`); consistent across items.
- **Active state:** Clear visual (e.g., background + contrast text); avoid subtle underline only.

### Responsive Behavior

- **Desktop:** Permanent or mini-variant; no overlay.
- **Tablet:** Consider persistent drawer or mini-variant.
- **Mobile:** Temporary drawer; hamburger in AppBar; close on nav. SwipeableDrawer improves discoverability.

### Wayfinding

- Users should answer: Where am I? Where can I go? What can I do here?
- **Where am I:** `aria-current="page"` on active link; selected ListItemButton styling.
- **Where to go:** Clear labels; optional tooltips when mini-variant collapsed.

---

## Accessibility Considerations

### Semantic HTML

- Wrap nav in `<nav aria-label="Main navigation">` (or similar).
- Use `<ul>`/`<li>` or ensure List/ListItem render semantic structure (MUI List renders `<ul>` by default).

### ARIA

- **aria-current="page"** on the active link (Next.js Link or ListItemButton).
- **Avoid role="menu"** for typical nav; use Disclosure pattern for expandable sections: `aria-expanded`, `aria-controls`, `aria-haspopup` if needed.
- **aria-label** on IconButton (e.g., "Open search", "Open menu")—Creator OS already has these.

### Keyboard

- **Tab:** Move between nav items (native for links/buttons).
- **Enter/Space:** Activate link or expand/collapse.
- **Escape:** Close temporary drawer (MUI Drawer handles this via Modal).
- **Skip link:** Consider "Skip to main content" for keyboard users (optional enhancement).

### Focus Management

- When drawer opens (mobile): focus can stay on trigger or move to first nav item—both acceptable.
- When drawer closes: focus returns to trigger (MUI Modal does this).
- Visible focus indicators: ensure `:focus-visible` is styled (MUI default).

### WCAG Alignment

- 2.4.1 Bypass Blocks: Skip link (optional).
- 2.4.3 Focus Order: Logical tab order.
- 2.1.1 Keyboard: All nav operable via keyboard.

---

## Mobile/Responsive Behavior

### Current

- Breakpoint: `md` (960px) via `useMediaQuery(theme.breakpoints.up('md'))`.
- Mobile: Temporary Drawer, AppBar with MenuIcon, `mobileOpen` state.
- Drawer closes on item click (`onClose` in ListItemButton).

### Recommended Enhancements

1. **SwipeableDrawer:** Use for `variant="temporary"` to allow swipe-from-edge to open. Improves discoverability.
2. **SwipeAreaWidth:** Default 20px; consider 24–32px for easier touch target.
3. **iOS:** `disableSwipeToOpen` is true by default; keep it to avoid conflict with Safari back gesture.
4. **disableDiscovery:** Set `true` on iOS to avoid drawer peeking on edge swipe (can interfere with navigation).
5. **Safe area:** AppBar already uses `paddingTop: 'env(safe-area-inset-top)'`; main uses `paddingBottom: 'env(safe-area-inset-bottom)'`—keep these.

### Drawer Width on Mobile

- Full width or near-full (e.g., 280px max) is common; current 220px is fine.
- Consider `maxWidth: '85vw'` for very small screens.

---

## Suggested Grouping for Creator OS

| Group | Items | Rationale |
|-------|-------|-----------|
| **Content Creation** | Dashboard, Ideas, Scripts, Pipeline | Core workflow: ideas → scripts → pipeline |
| **Content Management** | Library, Series, Tags | Organize and manage content |
| **AI & Analytics** | AI Toolkit, Analytics, AI Cost | AI features and metrics |
| **System** | Settings, Help | App-level configuration and support |

---

## Code Examples

### Grouped Nav with ListSubheader (Simple)

```jsx
// src/components/shared-ui/AppSidebar.tsx
import ListSubheader from '@mui/material/ListSubheader';

{navGroups.map((group) => (
  <React.Fragment key={group.label || 'system'}>
    {group.label && <ListSubheader sx={{ py: 1 }}>{group.label}</ListSubheader>}
    {group.items.map((item) => (
      <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton component={Link} href={item.href} selected={isActive(item.href)} ...>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      </ListItem>
    ))}
  </React.Fragment>
))}
```

### Nav Landmark + aria-current

```jsx
<Drawer ...>
  <Box component="nav" aria-label="Main navigation" sx={{ flex: 1, overflow: 'auto' }}>
    <List>
      {navItems.map((item) => (
        <ListItemButton
          component={Link}
          href={item.href}
          aria-current={isActive ? 'page' : undefined}
          ...
        />
      ))}
    </List>
  </Box>
</Drawer>
```

### SwipeableDrawer for Mobile (AppLayoutClient)

```jsx
// In AppLayoutClient, when !isDesktop:
import SwipeableDrawer from '@mui/material/SwipeableDrawer';

const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

{!isDesktop ? (
  <SwipeableDrawer
    variant="temporary"
    open={mobileOpen}
    onClose={handleDrawerToggle}
    onOpen={() => setMobileOpen(true)}
    disableDiscovery={iOS}
    disableBackdropTransition={!iOS}
    ModalProps={{ keepMounted: true }}
    sx={{ '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, top: 56, height: 'calc(100vh - 56px)' } }}
  >
    <SidebarContent onClose={handleDrawerToggle} />
  </SwipeableDrawer>
) : (
  <AppSidebar variant="permanent" open={true} />
)}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| role="menu" for nav | Semantic nav + Disclosure for expandables | WCAG 2.2 / ARIA APG | Avoids incorrect keyboard expectations |
| Fixed sidebar only | Responsive: permanent + temporary | Material Design 2 | Mobile-first support |
| No swipe | SwipeableDrawer | MUI v4+ | Better mobile UX |

**Deprecated/outdated:**
- `ListItem` with `button` prop: Use `ListItemButton` instead (MUI v5).
- Inline nav config in component: Move to `nav-config.ts` for maintainability.

---

## Open Questions

1. **Mini-variant: default open or closed?**
   - What we know: Mini-variant saves space; user preference varies.
   - What's unclear: Whether to persist state (localStorage) or default to expanded.
   - Recommendation: Default expanded; add localStorage persistence if users request it.

2. **Collapsible groups: default expanded or collapsed?**
   - What we know: All expanded = current behavior; collapsed reduces scroll.
   - What's unclear: Which groups to collapse by default.
   - Recommendation: All expanded by default; persist per-group state in localStorage for returning users.

3. **SwipeableDrawer bundle size:**
   - What we know: SwipeableDrawer adds ~2 kB gzipped (react-swipeable-views).
   - What's unclear: Whether to lazy-load for mobile only.
   - Recommendation: Use directly; 2 kB is acceptable for improved mobile UX.

---

## Validation Architecture

> Skipped—no `workflow.nyquist_validation` in .planning/config.json (or not found). Phase plan can add manual verification steps.

---

## Sources

### Primary (HIGH confidence)

- MUI Drawer docs: https://mui.com/material-ui/react-drawer/
- MUI List docs: https://mui.com/material-ui/react-list/
- MUI Collapse API: https://mui.com/material-ui/api/collapse/
- MUI SwipeableDrawer API: https://mui.com/material-ui/api/swipeable-drawer/
- MUI MiniDrawer example: https://github.com/mui/material-ui/blob/v5.2.1/docs/src/pages/components/drawers/MiniDrawer.js
- Creator OS: AppSidebar.tsx, AppLayoutClient.tsx, theme.ts

### Secondary (MEDIUM confidence)

- Pope Tech: Accessible navigations and sub-menus (2024)
- UX Planet: Best UX practices for designing a sidebar
- W3C ARIA APG: Menubar navigation example
- Stack Overflow: MUI nested collapsible lists, Drawer closes on nested click

### Tertiary (LOW confidence)

- Notion: Sidebar organization (product-specific)
- Drawer navigation best practices (generic)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — MUI v5 in use; all patterns from official docs
- Architecture: HIGH — Current implementation analyzed; patterns verified
- Pitfalls: MEDIUM — Based on Stack Overflow and docs; project-specific testing recommended

**Research date:** 2025-03-19  
**Valid until:** ~30 days for stable MUI; re-verify if upgrading to MUI v6+
