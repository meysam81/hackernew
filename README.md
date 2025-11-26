<p align="center">
  <img src="assets/logo.svg" alt="HackerNew Logo" width="120" height="120">
</p>

<h1 align="center">HackerNew</h1>

<p align="center">
  <strong>What if HN was built today?</strong>
  <br>
  A modern, open-source reimagining of Hacker News
</p>

<p align="center">
  <a href="https://hackernew.dev">Live Demo</a> &bull;
  <a href="#-quick-start">Quick Start</a> &bull;
  <a href="#-features">Features</a> &bull;
  <a href="#-contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/Astro-4.16-BC52EE.svg" alt="Astro">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D.svg" alt="Vue">
  <img src="https://img.shields.io/badge/Tailwind-4.0-06B6D4.svg" alt="Tailwind">
</p>

---

We use Hacker News every single day. It's one of the best communities on the internet.

This project is a **love letter** to that community — a "what if" exploration of what HN might feel like if it were built with a modern 2025 stack. We're not here to replace it or critique it. Just to imagine, learn, and share.

<p align="center">
  <img src="assets/screenshots/hero-dark.png" alt="HackerNew Screenshot" width="800">
</p>

## Why?

- **To learn** — Building real projects is the best way to learn modern web development
- **To explore** — What does "modern" actually mean for a content-focused site?
- **To share** — Maybe some ideas here spark inspiration for others

HackerNew is intentionally minimal. No algorithmic feeds. No engagement hacking. Just content, presented cleanly.

---

## Quick Start

Three commands. That's it.

```bash
# 1. Clone
git clone https://github.com/meysam81/hackernew.git && cd hackernew

# 2. Install (requires Bun - see below if needed)
bun install

# 3. Run
bun dev
```

Open [localhost:4321/hackernew](http://localhost:4321/hackernew/) and you're in.

<details>
<summary><strong>Don't have Bun?</strong></summary>

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows
powershell -c "irm bun.sh/install.ps1 | iex"

# Or via npm
npm install -g bun
```

</details>

---

## Features

### For Readers

| Feature | Description |
|---------|-------------|
| **Dark/Light Mode** | Respects system preference, toggle anytime |
| **Keyboard Navigation** | `j`/`k` to move, `o` to open, `c` for comments |
| **Bookmarks** | Save stories for later (syncs with account) |
| **Reading History** | Keep track of what you've read |
| **Density Toggle** | Comfortable or compact view |

### For Developers

| Feature | Description |
|---------|-------------|
| **Island Architecture** | Static pages, hydrated components |
| **Type-Safe** | Full TypeScript throughout |
| **Modern CSS** | Tailwind v4 with design tokens |
| **Auth Ready** | Supabase OAuth (GitHub/Google) |
| **Zero Config Deploy** | Works on any static host |

### Keyboard Shortcuts

```
j / k       Navigate stories
o           Open story link
c           Open comments
b           Toggle bookmark
Esc         Go back
```

---

## Tech Stack

We picked tools we enjoy using:

- **[Astro](https://astro.build)** — Fast by default, islands architecture
- **[Vue 3](https://vuejs.org)** — Reactive components with Composition API
- **[Tailwind CSS v4](https://tailwindcss.com)** — Utility-first styling
- **[Supabase](https://supabase.com)** — Auth + Postgres (optional)
- **[Bun](https://bun.sh)** — Fast runtime and package manager

The official [Hacker News API](https://github.com/HackerNews/API) powers all the content.

---

## Project Structure

```
src/
├── components/
│   ├── auth/           # Login, user menu
│   ├── story/          # Feed, items, details
│   ├── comment/        # Threaded comments
│   └── ui/             # Buttons, skeletons
├── composables/        # Shared Vue logic
│   ├── useAuth.ts
│   ├── useTheme.ts
│   ├── useBookmarks.ts
│   └── useKeyboard.ts
├── lib/
│   ├── hn-client.ts    # HN API with caching
│   └── supabase.ts     # Auth client
├── pages/              # File-based routes
│   ├── index.astro     # Top stories
│   ├── new.astro       # New stories
│   ├── ask.astro       # Ask HN
│   ├── show.astro      # Show HN
│   └── item/[id].astro # Story details
└── styles/
    └── global.css      # Design tokens
```

---

## Configuration

### Basic Setup (No Auth)

Works out of the box! Just `bun dev` and go.

### With Authentication

Want bookmarks that sync across devices? Set up Supabase:

1. **Create a project** at [supabase.com](https://supabase.com)

2. **Run the schema** — Copy `supabase/schema.sql` into the SQL Editor

3. **Enable OAuth** — In Authentication → Providers, enable GitHub and/or Google

4. **Add your credentials**:
   ```bash
   cp .env.example .env
   ```

   ```env
   PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Configure URLs** — In Authentication → URL Configuration:
   - Site URL: `http://localhost:4321/hackernew`
   - Redirect URLs: `http://localhost:4321/hackernew/auth/callback`

---

## Deployment

### GitHub Pages (Automatic)

Push to `main` and the included GitHub Action handles it:

1. Go to Settings → Pages
2. Set Source to "GitHub Actions"
3. (Optional) Add secrets for auth: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`

### Any Static Host

```bash
bun run build
# Upload dist/ to Vercel, Netlify, Cloudflare Pages, anywhere
```

### Custom Domain

Update `astro.config.mjs`:

```js
export default defineConfig({
  site: 'https://your-domain.com',
  base: '/', // Remove /hackernew if using root domain
  // ...
});
```

---

## Contributing

We'd love your help! Here's how to get started:

1. **Fork** the repo
2. **Create** a branch: `git checkout -b my-feature`
3. **Make** your changes
4. **Test** locally with `bun dev`
5. **Push** and open a PR

### Ideas for Contributions

- [ ] RSS feed generation
- [ ] Offline support (PWA)
- [ ] Story sharing cards
- [ ] Comment collapse persistence
- [ ] Search functionality
- [ ] i18n support

Not sure where to start? Look for issues labeled `good first issue`.

---

## Design Philosophy

HackerNew follows a few principles:

1. **Content first** — UI should enhance reading, not distract
2. **Speed matters** — Static generation + minimal JS = fast loads
3. **Respect preferences** — Dark mode, density, keyboard users
4. **Progressive enhancement** — Works without JS, better with it

The design takes cues from tools we admire: Linear's clarity, Vercel's simplicity, Raycast's keyboard-first approach.

---

## FAQ

<details>
<summary><strong>Why not just use the official HN site?</strong></summary>

You should! The official site is great and we use it daily. This is just a learning project and design exploration.
</details>

<details>
<summary><strong>Will this replace my HN workflow?</strong></summary>

Probably not, and that's okay. It's meant for exploring what's possible, not replacing what works.
</details>

<details>
<summary><strong>Can I deploy my own instance?</strong></summary>

Absolutely! That's the whole point. Fork it, customize it, make it yours.
</details>

<details>
<summary><strong>Why Bun instead of npm/yarn/pnpm?</strong></summary>

Speed, mostly. But the project works with any package manager — just replace `bun` with your preferred tool.
</details>

---

## Acknowledgments

- **[Hacker News](https://news.ycombinator.com)** — For 18+ years of thoughtful discussion
- **[HN API](https://github.com/HackerNews/API)** — For making this possible
- **Everyone who reads HN** — You're what makes the community great

---

## License

[Apache 2.0](LICENSE) — Use it, learn from it, build on it.

---

<p align="center">
  <sub>Built with care for the HN community</sub>
  <br>
  <a href="https://hackernew.dev">hackernew.dev</a>
</p>
