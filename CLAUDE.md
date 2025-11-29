# HackerNew - Claude Development Guide

## Project Overview

HackerNew is a modern, aesthetically refined reimagining of Hacker News built with Astro, Vue.js 3, and Tailwind CSS v4. It provides a clean, minimal interface with features like dark/light mode, keyboard navigation, bookmarks, and reading history.

**Live Site:** https://hackernew.dev
**Repository:** https://github.com/meysam81/hackernew

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Astro** | 4.16.x | Static site generation with islands architecture |
| **Vue.js 3** | 3.5.x | Interactive components (Composition API only) |
| **Tailwind CSS** | 4.0 beta | Styling via `@tailwindcss/vite` plugin |
| **Supabase** | 2.47.x | Authentication & database (optional) |
| **Ky** | 1.7.x | HTTP client for HN API |
| **Bun** | latest | Package manager and runtime |
| **TypeScript** | 5.7.x | Type safety throughout |
| **lucide-vue-next** | 0.460.x | Icon library |
| **loglevel** | 1.9.x | Logging utility |
| **sharp** | 0.33.x | Image processing |

## Project Structure

```
hackernew/
├── src/
│   ├── components/           # Vue and Astro components
│   │   ├── auth/             # AuthButton.vue, AuthCallback.vue, UserMenu.vue
│   │   ├── bookmarks/        # BookmarksList.vue
│   │   ├── comment/          # CommentItem.vue, CommentThread.vue, CommentSkeleton.vue
│   │   ├── layout/           # Header.astro, Footer.astro
│   │   ├── story/            # StoryFeed.vue, StoryItem.vue, StoryDetail.vue, StoryListSkeleton.vue
│   │   ├── ui/               # Button.vue, Skeleton.vue, Toast.vue, HeaderActions.vue
│   │   └── user/             # UserProfile.vue
│   ├── composables/          # Vue composables for shared state
│   │   ├── useAuth.ts        # Authentication state management
│   │   ├── useBookmarks.ts   # Local + synced bookmarks
│   │   ├── useDensity.ts     # Comfortable/compact view modes
│   │   ├── useKeyboard.ts    # Keyboard navigation handlers
│   │   ├── useReadHistory.ts # Track read stories
│   │   └── useTheme.ts       # Dark/light mode toggle
│   ├── layouts/
│   │   └── BaseLayout.astro  # Main page layout with header/footer
│   ├── lib/                  # Utilities and API clients
│   │   ├── hn-client.ts      # Hacker News API client with caching
│   │   ├── supabase.ts       # Supabase client setup + types
│   │   └── utils.ts          # Shared utilities (timeAgo, formatNumber, etc.)
│   ├── pages/                # Astro pages (file-based routing)
│   │   ├── index.astro       # Top stories (/)
│   │   ├── new.astro         # New stories (/new)
│   │   ├── ask.astro         # Ask HN (/ask)
│   │   ├── show.astro        # Show HN (/show)
│   │   ├── jobs.astro        # Job posts (/jobs)
│   │   ├── bookmarks.astro   # User bookmarks (/bookmarks)
│   │   ├── privacy.astro     # Privacy policy (/privacy)
│   │   ├── terms.astro       # Terms of service (/terms)
│   │   ├── 404.astro         # 404 page
│   │   ├── item/[id].astro   # Story detail page
│   │   ├── user/[username].astro  # User profile page
│   │   └── auth/             # Auth pages
│   │       ├── signin.astro  # Sign in page (/auth/signin)
│   │       └── callback.astro # OAuth callback (/auth/callback)
│   └── styles/
│       └── global.css        # Design tokens, CSS variables, base styles
├── public/                   # Static assets (favicon, og-image)
├── supabase/
│   └── schema.sql            # Database schema for Supabase
├── assets/                   # Project assets, screenshots, logo
├── .github/workflows/
│   └── ci.yml                # GitHub Pages deployment workflow
├── astro.config.mjs          # Astro configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
├── ROADMAP.md                # Project roadmap and planned features
├── LAUNCH.md                 # Launch checklist and notes
├── SHOW_HN.md                # Show HN submission template
└── PRODUCT_HUNT.md           # Product Hunt launch materials
```

## Development Commands

```bash
bun install          # Install dependencies
bun dev              # Start dev server at localhost:4321
bun start            # Alias for bun dev
bun run build        # Type check (astro check) and build for production
bun run preview      # Preview production build locally
```

## Architecture Patterns

### Astro Islands Architecture

- **Pages** are static Astro files (`.astro`) that render at build time
- **Interactive components** use Vue with hydration directives:
  - `client:load` - Hydrate immediately on page load (used for above-the-fold interactive content)
  - `client:visible` - Hydrate when component enters viewport
- **Data fetching** happens client-side via the HN API client (no SSR data fetching)

### Vue Composables Pattern

All composables in `src/composables/` use shared reactive state at module level:

```typescript
// Pattern: Module-level shared state
const state = ref<Type>(initialValue);

export function useComposable() {
  // Functions that modify state
  const doSomething = () => { ... };

  onMounted(() => {
    // Initialize on first mount
  });

  return { state, doSomething };
}
```

Key composables:
- `useAuth()` - Manages Supabase auth state, provides `signInWithGitHub`, `signInWithGoogle`, `signOut`
- `useTheme()` - Manages theme preference (`light`, `dark`, `system`), persists to localStorage
- `useDensity()` - Toggles between `comfortable` and `compact` view densities
- `useBookmarks()` - Manages bookmarks with local storage + optional Supabase sync
- `useReadHistory()` - Tracks which stories have been read
- `useKeyboard()` - Provides keyboard navigation hooks (j/k navigation, o/c/b actions)

### HN API Client

Located in `src/lib/hn-client.ts`:

- Uses **Ky** HTTP client with retry logic
- Implements **5-minute in-memory cache** for all requests
- API base URL: `https://hacker-news.firebaseio.com/v0`
- Exports typed functions:
  - `getStories(type, limit, offset)` - Fetch paginated stories
  - `getStory(id)` - Fetch single story
  - `getComment(id)` - Fetch single comment
  - `getCommentTree(ids, depth, maxDepth)` - Fetch nested comment tree
  - `getUser(username)` - Fetch user profile
- Feed types: `top`, `new`, `best`, `ask`, `show`, `job`

### Styling System

**Design tokens** defined in `src/styles/global.css` using Tailwind CSS v4's `@theme` directive:

- **Colors**: Semantic variables (`--bg-primary`, `--text-secondary`, `--accent`, etc.)
- **Spacing**: 4px base unit (`--spacing-1` = 4px, `--spacing-2` = 8px, etc.)
- **Typography**: Inter (body), JetBrains Mono (code)
- **Font scale**: 1.2 modular scale with 15px base
- **Dark mode**: Applied via `.dark` class on `<html>` element

**Use CSS custom properties** for component styles, not Tailwind utilities directly for colors.

## Configuration

### Environment Variables

```bash
# .env (copy from .env.example)
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Authentication is **optional**. The app works fully without Supabase (bookmarks stored locally).

### Astro Configuration (`astro.config.mjs`)

```javascript
export default defineConfig({
  output: 'static',           // Static site generation
  site: 'https://hackernew.dev',
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') }
    },
    ssr: { noExternal: ['ky'] }  // Required for Ky compatibility
  }
});
```

### TypeScript Configuration

- Extends `astro/tsconfigs/strict`
- Path alias: `@/*` maps to `src/*`
- JSX configured for Vue

## Code Conventions

### TypeScript

- **Always use TypeScript** for new code
- Define interfaces for all props, API responses, and state shapes
- Use `type` for unions/intersections, `interface` for object shapes
- Prefer explicit return types on exported functions

### Vue Components

- **Use Composition API exclusively** (`<script setup lang="ts">`)
- Define props with `withDefaults(defineProps<Props>(), { ... })`
- Use `ref()` for primitive state, `reactive()` sparingly
- Emit events with typed `defineEmits<{ (e: 'eventName', payload: Type): void }>()`
- Keep components focused - split into smaller components when >150 lines

### File Naming

- Vue components: `PascalCase.vue`
- Composables: `useCamelCase.ts`
- Utilities: `camelCase.ts`
- Astro pages: `kebab-case.astro` or `[param].astro` for dynamic routes

### CSS/Styling

- Use **scoped styles** in Vue components (`<style scoped>`)
- Reference design tokens via CSS custom properties: `var(--spacing-4)`
- Prefer semantic color variables over raw colors
- Mobile-first responsive design with `@media (min-width: ...)` breakpoints

### Error Handling

- Use try/catch for async operations
- Log errors to console with context: `console.error('Error fetching stories:', error)`
- Display user-friendly error messages in UI
- Provide retry mechanisms for network failures

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/hn-client.ts` | HN API types and fetching logic |
| `src/lib/supabase.ts` | Database types and Supabase client |
| `src/lib/utils.ts` | Common utilities (timeAgo, sanitizeHtml, localStorage helpers) |
| `src/styles/global.css` | All design tokens and base styles |
| `src/layouts/BaseLayout.astro` | Main layout with theme initialization |
| `supabase/schema.sql` | Database schema with RLS policies |
| `ROADMAP.md` | Planned features and project roadmap |

## Database Schema (Supabase)

Three tables with Row Level Security:

1. **profiles** - User profiles (extends auth.users)
2. **bookmarks** - Saved stories per user
3. **read_stories** - Reading history per user

Auto-creates profile on user signup via trigger.

## Deployment

**GitHub Pages** via GitHub Actions (`.github/workflows/ci.yml`):
- Triggers on push to `main` branch
- Uses Bun for build
- Deploys `dist/` directory
- Optional secrets: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`

## Testing

Currently no automated tests. When adding tests:
- Use Vitest for unit tests
- Use Playwright for E2E tests
- Test composables independently
- Mock HN API responses

## Security Considerations

- **HTML sanitization**: `sanitizeHtml()` in `utils.ts` strips unsafe tags from HN comment HTML
- **External links**: Always use `target="_blank" rel="noopener noreferrer"`
- **Auth**: Handled entirely by Supabase with RLS policies
- **Environment variables**: Only `PUBLIC_*` prefixed vars are exposed to client

## Common Tasks

### Adding a New Page

1. Create `src/pages/page-name.astro`
2. Import and use `BaseLayout`
3. Add any Vue components with appropriate `client:*` directive

### Adding a New Composable

1. Create `src/composables/useFeatureName.ts`
2. Follow the module-level shared state pattern
3. Export a single `useFeatureName()` function
4. Handle SSR safety with `typeof window` checks

### Adding a New Component

1. Create in appropriate `src/components/` subdirectory
2. Use `<script setup lang="ts">` with typed props
3. Add scoped styles using design tokens
4. Consider mobile responsiveness

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `j` / `k` | Navigate stories up/down |
| `o` / `Enter` | Open story link |
| `c` | Open comments |
| `b` | Toggle bookmark |
| `Esc` | Go back |
