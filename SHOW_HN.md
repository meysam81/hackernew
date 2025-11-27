# Show HN Post Materials

Everything you need to submit HackerNew to Hacker News.

---

## Post Title

```
Show HN: HackerNew – A modern, open-source reimagining of Hacker News
```

Alternative titles (pick one):

```
Show HN: I built a modern HN client with Astro, Vue, and Tailwind
Show HN: HackerNew – What if HN was built with a 2025 stack?
Show HN: Open-source HN reader with dark mode and vim keybindings
```

---

## Post URL

```
https://hackernew.dev
```

---

## Post Text (if submitting as text post instead of link)

Leave this blank and submit as a URL post. The URL (`https://hackernew.dev`) speaks for itself. You can add context in comments.

---

## First Comment (Post immediately)

```
Hi HN! Long-time reader here.

I use HN every day and genuinely love it. This project started as a "what if" exploration—what would HN feel like if it were built with modern web tooling?

A few things about HackerNew:

- **Stack**: Astro 4, Vue 3, Tailwind CSS v4, optional Supabase auth
- **Keyboard navigation**: j/k to move, o to open, c for comments, b to bookmark (vim-style)
- **Dark mode**: Respects system preference, manual toggle available
- **Bookmarks**: Save stories locally or sync with an account
- **Fast**: Static site generation, minimal JS, islands architecture

What it's NOT:
- Not trying to replace HN (I still use news.ycombinator.com daily)
- Not affiliated with YC in any way
- Not a startup—just a learning project

The code is fully open source (Apache 2.0): https://github.com/meysam81/hackernew

Three commands to run it yourself:
  git clone https://github.com/meysam81/hackernew.git && cd hackernew
  bun install
  bun dev

Happy to answer questions about the technical implementation!

What features would you want in a modern HN reader?
```

---

## Responses to Anticipated Questions

### "Why?"

```
Honestly? To learn. I wanted to build something real with Astro's island architecture and see how Vue 3's Composition API works in practice.

Also, I was curious what HN would feel like with dark mode and keyboard shortcuts. Turns out I use both constantly now.

No grand ambitions—just a fun side project.
```

### "The original is fine, why change it?"

```
Totally agree! The original is great and I use it every day. This isn't about fixing something broken—it's about exploring "what if."

Think of it like when people rebuild classic games in modern engines. The original is still great; the rebuild is just a different lens to appreciate it through.
```

### "Why Astro/Vue/Tailwind?"

```
Astro: I wanted to try islands architecture. The idea of static pages with hydrated interactive components makes a lot of sense for content-heavy sites. Results: most pages ship almost zero JS.

Vue 3: Composition API is genuinely pleasant to work with. Reactivity "just works" without much boilerplate.

Tailwind v4: The new CSS-first approach with @theme is cleaner than v3. Design tokens in CSS variables made theming straightforward.

Bun: Fast. Really fast. `bun install` takes ~2 seconds. Could swap for npm/yarn/pnpm without issues though.
```

### "What about the API rate limits?"

```
The official HN API (Firebase-based) is pretty generous. I added a 5-minute in-memory cache to reduce requests for frequently accessed stories. For a personal reader, you won't hit any limits.

If you're worried, the caching layer in `src/lib/hn-client.ts` is easy to adjust.
```

### "Will you add search?"

```
Maybe? Algolia has the HN search API which works great. Main reason I haven't added it yet: scope creep. Wanted to ship something focused first.

Open to PRs if someone wants to tackle it: https://github.com/meysam81/hackernew/issues
```

### "Dark mode is the only feature?"

```
Ha, fair point. Here's the full list:

- Dark/light mode (system + manual)
- Vim-style keyboard navigation (j/k/o/c/b/esc)
- Bookmarks (local + cloud sync)
- Reading history (track what you've read)
- Density toggle (comfortable vs compact)
- All feed types (top/new/best/ask/show/jobs)
- User profiles
- Threaded comments

Plus the technical bits: TypeScript throughout, static generation, minimal bundle size, works offline for cached content.
```

### "How's performance?"

```
Pretty good actually:

- Lighthouse: 95+ across the board
- First Contentful Paint: ~0.5s
- Time to Interactive: ~0.8s
- Bundle: ~40KB gzipped (including Vue runtime)

The trick is Astro's partial hydration. Static pages load instantly; only interactive components (like the feed) get JavaScript.
```

### "Can I self-host?"

```
Absolutely! That's the whole point.

    bun run build
    # Deploy dist/ anywhere: Vercel, Netlify, Cloudflare Pages, your own server

The GitHub repo includes a working GitHub Actions workflow for GitHub Pages if you want automated deploys on push.
```

### "Why Apache 2.0 instead of MIT?"

```
Apache 2.0 includes explicit patent grants, which provides slightly more protection. For a project like this, either would work fine. Went with Apache because it's what I'm used to.

Feel free to fork and use however you like.
```

---

## Technical Details (if asked for specifics)

### Architecture

```
- Static site generation (Astro)
- Island hydration for interactive components
- Vue 3 with Composition API
- Tailwind CSS v4 with design tokens
- Supabase for optional auth/data sync
- Official HN API (Firebase) for content
```

### Key Files

```
src/lib/hn-client.ts - HN API client with 5-min cache
src/composables/useKeyboard.ts - Keyboard shortcut handling
src/composables/useTheme.ts - Dark mode management
src/styles/global.css - Design tokens and theming
```

### Deployment

```
Works on any static host. Included GitHub Actions workflow
deploys to GitHub Pages automatically.

No server required. No database required (unless you want auth).
```

---

## Engagement Tips

1. **Be humble**: This is a side project, not a product launch
2. **Acknowledge HN**: Express genuine appreciation for the community
3. **Answer questions thoroughly**: HN appreciates technical depth
4. **Don't be defensive**: If someone criticizes, thank them for the feedback
5. **Share learnings**: What did you discover while building this?
6. **Stay engaged**: Reply to comments throughout the day

---

## Best Times to Post

Show HN posts do best when posted:

- **Weekdays** (Tue-Thu tend to perform best)
- **Morning US time** (8-10 AM ET / 5-7 AM PT)

Avoid:

- Weekends
- US holidays
- Late night PT

---

## What NOT to Do

- Don't ask for upvotes (violates HN guidelines)
- Don't post from multiple accounts
- Don't over-hype ("revolutionizing" / "disrupting" / etc.)
- Don't be defensive about criticism
- Don't spam the same thing multiple times

---

## Follow-up Blog Post Ideas

If the Show HN does well, consider writing:

1. **"Building a modern HN reader with Astro"** — Technical deep dive
2. **"What I learned from redesigning Hacker News"** — Design decisions
3. **"Islands architecture in practice"** — Astro patterns
4. **"Vue 3 Composition API: A practical guide"** — Using composables

These can be submitted to HN separately and drive more traffic to the project.

---

## Sample Reply Templates

### For positive feedback:

```
Thanks! Glad you like it. If you have feature ideas, feel free to open an issue: https://github.com/meysam81/hackernew/issues
```

### For constructive criticism:

```
Good point, thanks for the feedback. [Address the specific issue]. I'll think about how to improve that.
```

### For "why bother" comments:

```
Fair question! Mostly to learn—building real projects is how I pick up new tools. Sharing it in case others find it useful or want to learn from the code.
```

### For technical questions:

```
[Answer thoroughly with code snippets if relevant]

The implementation is in `src/[relevant-path]` if you want to dig deeper: https://github.com/meysam81/hackernew
```

---

_Good luck with the Show HN post!_
