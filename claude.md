# HackerNew - Claude Development Guide

## Project Overview

HackerNew is a modern, aesthetically refined reimagining of Hacker News built with Astro, Vue.js, and Tailwind CSS v4. It provides a clean, minimal interface with features like dark/light mode, keyboard navigation, bookmarks, and reading history.

## Tech Stack

- **Astro** - Static site generation with islands architecture
- **Vue.js 3** - Interactive components (Composition API)
- **Tailwind CSS v4** - Styling (beta, using `@tailwindcss/vite`)
- **Supabase** - Authentication & database (optional)
- **Ky** - HTTP client for HN API
- **Bun** - Package manager and runtime
- **TypeScript** - Type safety throughout

## Project Structure

```
src/
├── components/       # Vue and Astro components
│   ├── auth/         # Auth components (AuthButton, AuthCallback)
│   ├── bookmarks/    # Bookmarks list
│   ├── comment/      # Comment thread components
│   ├── layout/       # Header, Footer
│   ├── story/        # Story feed and detail components
│   ├── ui/           # Base UI components (Button, Skeleton)
│   └── user/         # User profile components
├── composables/      # Vue composables (useAuth, useTheme, etc.)
├── layouts/          # Astro layouts
├── lib/              # Utilities, API clients
│   ├── hn-client.ts  # Hacker News API client with caching
│   ├── supabase.ts   # Supabase client setup
│   └── utils.ts      # Shared utilities
├── pages/            # Astro pages (file-based routing)
└── styles/           # Global CSS with design tokens
```

## Development Commands

```bash
bun install          # Install dependencies
bun dev              # Start dev server at localhost:4321/hackernew/
bun run build        # Type check and build for production
bun run preview      # Preview production build
```

## Key Patterns

### Astro Islands Architecture
- Pages are static Astro files (`.astro`)
- Interactive components use Vue with `client:load` or `client:visible` directives
- Data fetching happens client-side via the HN API client

### Vue Composables
Located in `src/composables/`:
- `useAuth.ts` - Authentication state management
- `useTheme.ts` - Dark/light mode toggle
- `useDensity.ts` - Comfortable/compact view modes
- `useBookmarks.ts` - Local and synced bookmarks
- `useReadHistory.ts` - Track read stories
- `useKeyboard.ts` - Keyboard navigation

### HN API Client
Located in `src/lib/hn-client.ts`:
- Uses Ky for HTTP requests to `hacker-news.firebaseio.com/v0`
- Implements 5-minute in-memory caching
- Exports typed functions: `getStories()`, `getStory()`, `getComment()`, `getUser()`
- Feed types: `top`, `new`, `best`, `ask`, `show`, `job`

### Styling
- Global styles in `src/styles/global.css`
- Uses CSS custom properties for design tokens
- Fonts: Inter (body), JetBrains Mono (code)
- 4px base spacing unit

## Configuration

### Environment Variables
```bash
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Astro Config
- Output: `static`
- Base path: `/hackernew`
- Site: `https://meysam81.github.io`

## Deployment

Deploys to GitHub Pages via `.github/workflows/deploy.yml` on push to `main`.

## Code Conventions

- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns
- Use Tailwind utility classes for styling
- Keep components focused and composable
- Prefer `async/await` over Promise chains
