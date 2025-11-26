# HackerNew

A modern, aesthetically refined reimagining of Hacker News. We use HN every day and wondered what it might feel like with modern tooling. Here's our take.

![HackerNew Screenshot](./docs/screenshot.png)

## Features

- **Modern Design** — Clean, minimal interface inspired by Linear, Vercel, and Raycast
- **Dark/Light Mode** — System detection with manual toggle
- **Density Options** — Comfortable or compact view modes
- **Keyboard Navigation** — `j`/`k` to navigate, `o` to open, `c` for comments, `b` to bookmark
- **Bookmarks** — Save stories locally or sync with your account
- **Reading History** — Track what you've already read
- **Fast & Static** — Pre-rendered pages with client-side data fetching

## Stack

- **[Astro](https://astro.build)** — Static site generation
- **[Vue.js](https://vuejs.org)** — Interactive components (islands architecture)
- **[Tailwind CSS v4](https://tailwindcss.com)** — Styling
- **[Supabase](https://supabase.com)** — Authentication & database
- **[Ky](https://github.com/sindresorhus/ky)** — HTTP client
- **[Lucide](https://lucide.dev)** — Icons

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (latest)
- [Supabase](https://supabase.com) account (optional, for auth features)

### Installation

```bash
# Clone the repository
git clone https://github.com/meysam81/hackernew.git
cd hackernew

# Install dependencies
bun install

# Start development server
bun dev
```

The app will be available at `http://localhost:4321/hackernew/`

### Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

For auth features, add your Supabase credentials:

```bash
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL from `supabase/schema.sql` to create tables
3. Enable GitHub and/or Google OAuth in Authentication > Providers
4. Add your site URL to Authentication > URL Configuration

### Building

```bash
# Type check and build
bun run build

# Preview production build
bun run preview
```

## Project Structure

```
src/
├── components/
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
├── pages/            # Astro pages (routes)
└── styles/           # Global CSS with design tokens
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `j` | Next story |
| `k` | Previous story |
| `o` | Open story link |
| `c` | Open comments |
| `b` | Toggle bookmark |
| `Esc` | Go back |

## Design Tokens

The design system is defined in `src/styles/global.css`:

- **Colors** — Semantic tokens for light/dark mode
- **Typography** — Inter (body) + JetBrains Mono (code)
- **Spacing** — 4px base unit
- **Shadows** — Subtle depth for cards and modals

## Deployment

### GitHub Pages

The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages on push to `main`.

1. Enable GitHub Pages in your repository settings
2. Set the source to "GitHub Actions"
3. Add these secrets in Settings > Secrets:
   - `PUBLIC_SUPABASE_URL` (optional)
   - `PUBLIC_SUPABASE_ANON_KEY` (optional)

### Other Platforms

Build the static site and deploy the `dist` folder:

```bash
bun run build
# Deploy dist/ to any static hosting
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Hacker News](https://news.ycombinator.com) for the inspiration and API
- [HN API Documentation](https://github.com/HackerNews/API)

---

Built with love for the HN community.
