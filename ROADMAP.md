# HackerNew Product Roadmap

> **Last Updated**: November 2025
> **Version**: 2.0.0
> **Status**: Active Development

A strategic roadmap for HackerNew—a modern, open-source reimagining of Hacker News built with Astro, Vue 3, and Tailwind CSS v4. This document prioritizes features that strengthen our core value proposition: a keyboard-first, distraction-free reading experience for the HN community.

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Core Value Proposition](#core-value-proposition)
- [Ideal Customer Profiles](#ideal-customer-profiles)
- [Current State](#current-state)
- [Competitive Positioning](#competitive-positioning)
- [Phased Roadmap](#phased-roadmap)
- [Detailed Feature Analysis](#detailed-feature-analysis)
- [Anti-Roadmap: What We Won't Build](#anti-roadmap-what-we-wont-build)
- [Contributing](#contributing)
- [Changelog](#changelog)

---

## Executive Summary

- **Current State**: Core reading experience is complete—dark mode, vim-style navigation, bookmarks, reading history, and threaded comments are fully functional
- **Core Value**: The only HN client that combines keyboard-first navigation, modern aesthetics, and progressive enhancement without compromising content focus
- **Immediate Opportunity**: Algolia search integration leverages existing infrastructure for the #1 user-requested feature
- **Strategic Direction**: Deepen the reading experience (Focus Mode, PWA) before expanding horizontally (filters, notifications)
- **Key Principle**: Every feature must be discoverable without being intrusive—hidden until needed

---

## Core Value Proposition

**For developers and technologists who read Hacker News daily, HackerNew is the modern reading client that provides a keyboard-first, visually refined experience with dark mode, bookmarks, and reading history—unlike the official HN interface which prioritizes simplicity over power-user workflows, and unlike native apps which require installation and platform lock-in.**

What makes HackerNew defensible:

1. **Web-native**: Works everywhere, no installation, shareable URLs
2. **Open source**: Fork it, customize it, self-host it
3. **Progressive enhancement**: Works without JS, excellent with it
4. **Keyboard-first, not keyboard-only**: Power users get vim-style shortcuts; casual users get a clean UI
5. **Respect for content**: No engagement hacking, no algorithmic manipulation, just stories

---

## Ideal Customer Profiles

### ICP 1: The Daily HN Reader ("Alex")

**Who they are**: Senior software engineer at a mid-size tech company, 10+ years experience, reads HN during morning coffee and lunch breaks.

**Their context**: Uses HN as a curated news source and to stay connected to the tech community. Values signal-to-noise ratio. Typically reads 10-20 stories/day, comments occasionally.

**Jobs to be Done (JTBD)**:

1. Efficiently scan headlines to find interesting content
2. Track what they've already read across devices
3. Save stories for later when they don't have time to read now
4. Navigate quickly without touching the mouse

**Pain points with alternatives**:

- Official HN: No dark mode hurts eyes at night; no way to track read stories; bookmarks require account
- Native apps: Platform-specific, can't easily share URLs, often have ads

**What "exceptional" looks like for them**:

- Sub-second page loads so they can quickly scan during short breaks
- Keyboard navigation that matches their vim muscle memory
- "Continue where I left off" experience across devices

---

### ICP 2: The Deep Diver ("Jordan")

**Who they are**: Tech lead or architect who doesn't just skim headlines—they read the articles AND the comments. Often spends 30+ minutes on a single interesting thread.

**Their context**: Uses HN discussions as informal peer review. Trusts HN comments to surface nuance, counterpoints, and real-world experience that articles miss.

**Jobs to be Done (JTBD)**:

1. Read long-form articles without context-switching
2. Navigate deep comment threads efficiently
3. Find new comments on threads they've already read
4. Reference interesting discussions later (personal knowledge base)

**Pain points with alternatives**:

- Article + comments side-by-side is impossible without manual window management
- No way to track which comments are new in a thread they've visited before
- Can't highlight or annotate comments for future reference

**What "exceptional" looks like for them**:

- Focus mode that presents articles in clean, readable typography
- Clear visual indication of new comments since last visit
- Personal annotation system that exports to their knowledge tools

---

### ICP 3: The Mobile Commuter ("Sam")

**Who they are**: Product manager or designer who reads HN during commute (subway, bus, walking). Phone is primary device for content consumption.

**Their context**: Has 10-30 minute chunks of reading time with potentially spotty connectivity. Wants to catch up efficiently, then return to work/life.

**Jobs to be Done (JTBD)**:

1. Read HN content offline during subway commute
2. Quick one-thumb navigation and interaction
3. Save interesting stories to read more deeply on desktop later
4. Dark mode to not disturb other passengers

**Pain points with alternatives**:

- No offline support means subway dead zones = no reading
- Small tap targets and dense layouts are frustrating on mobile
- Bookmarks don't sync between mobile and desktop

**What "exceptional" looks like for them**:

- PWA with pre-cached content for offline reading
- Touch-optimized interface that doesn't feel like a desktop afterthought
- Cross-device bookmark sync that "just works"

---

### ICP 4: The Nostalgic Hacker ("Casey")

**Who they are**: Experienced developer (15+ years) who has been reading HN since the early days. Appreciates the original's simplicity but wouldn't mind some quality-of-life improvements.

**Their context**: Has a "if it ain't broke, don't fix it" mentality but secretly wishes for dark mode. Would never admit to wanting a "modern" interface but would appreciate one done right.

**Jobs to be Done (JTBD)**:

1. Not feel like they're betraying HN by using a third-party client
2. Get the nostalgia hit of the classic HN feel with modern conveniences
3. Discover old, timeless discussions they missed
4. Feel like a power user with keyboard shortcuts

**Pain points with alternatives**:

- Modern HN clients feel "too designed" or unfamiliar
- Don't want to lose the core HN experience
- Worried about privacy/tracking in third-party clients

**What "exceptional" looks like for them**:

- Can instantly switch to a minimal theme that feels like classic HN
- Time Machine feature to browse historical HN front pages
- Konami code easter egg that shows you "get it"

---

## Current State

### Fully Implemented ✅

| Feature | Implementation | ICP Served |
|---------|---------------|------------|
| **Dark/Light Mode** | System preference + manual toggle; CSS variables; smooth transitions | All |
| **Vim Keyboard Navigation** | j/k (navigate), o (open), c (comments), b (bookmark), Esc (back) | Alex, Casey |
| **Bookmarks** | Local storage + optional Supabase sync; bookmark list page | Alex, Sam |
| **Reading History** | Tracks read stories; 500-item local cap; optional cloud sync | Alex, Jordan |
| **Density Toggle** | Comfortable/Compact modes; persisted preference | Alex, Sam |
| **All Feed Types** | Top, New, Best, Ask, Show, Jobs with pagination | All |
| **User Profiles** | View any HN user's karma, about, and submissions | Jordan |
| **Threaded Comments** | Nested display with collapse/expand; depth limiting | Jordan, Casey |
| **OAuth Authentication** | GitHub and Google via Supabase; optional | Alex, Sam |
| **Loading Skeletons** | Story list and comment skeletons for perceived performance | All |
| **API Caching** | 5-minute in-memory cache for HN API requests | All |
| **Mobile Responsive** | Tailwind breakpoints; touch-friendly on small screens | Sam |
| **Keyboard Help Modal** | Press `?` to toggle modal; shows all shortcuts in grid layout; closes with Esc or click outside | Alex, Casey |

### Partially Implemented ⚠️

| Feature | Current State | Completion Needed | ICP Served |
|---------|--------------|-------------------|------------|
| **Email Digest** | Database schema has `email_digest` column | Build digest generation service; email integration | Alex, Jordan |
| **Comment Read Tracking** | `readStories` tracks stories, not individual comments | Extend to track comment IDs; show "new" badge | Jordan |

### Not Yet Implemented 📋

Features from ideation that have no code implementation yet. These are candidates for the roadmap phases below.

---

## Competitive Positioning

### Current Landscape

| Alternative                 | Strengths                                  | Weaknesses                                                                          | Our Advantage                              |
| --------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------ |
| **Official HN**             | Canonical, trusted, fast, simple           | No dark mode, no bookmarks without account, no keyboard shortcuts, no read tracking | All our core features                      |
| **Hacker News Mobile Apps** | Native performance, offline, notifications | Platform lock-in, no web sharing, often ad-supported, closed source                 | Web-native, open source, no ads            |
| **Hack (iOS)**              | Beautiful design, swipe gestures           | iOS only, $5 paid, can't self-host                                                  | Free, cross-platform, open source          |
| **Harmonic HN**             | AI summaries, modern design                | Heavy, slow, distracting from content                                               | Lightweight, content-first                 |
| **Algolia HN Search**       | Excellent search, historical access        | Search only—not a reading client                                                    | Full reading experience + search (planned) |

### Our Moat

1. **Open Source + Self-Hostable**: No vendor lock-in. Fork and customize.
2. **Web-First PWA**: Universal access without app store friction.
3. **Astro Islands Architecture**: Minimal JS until needed—unique technical approach.
4. **Keyboard-First Design**: Not an afterthought; core to the experience.
5. **No Tracking/Ads**: Supabase auth is optional; we don't monetize attention.

### Positioning Statement

"For **HN power users** who need **efficient daily reading workflows**, HackerNew is the **open-source HN client** that provides **keyboard navigation, dark mode, and cross-device sync**—unlike **native apps** which require installation and platform lock-in, and unlike **the official site** which lacks power-user features."

---

## Phased Roadmap

### Phase 1: Complete the Core

**Outcome**: The essential daily-driver reading experience is complete. Users have no reason to fall back to the official site.

**Target ICPs**: Alex (Daily Reader), Sam (Mobile Commuter)

| Priority | Feature | Score | Effort | Status | Notes |
|----------|---------|-------|--------|--------|-------|
| **P0** | Algolia Search with Cmd+K | 9.5 | M | Planned | #1 requested feature; Algolia API is free |
| **P0** | Keyboard Help Modal | 9.2 | XS | Complete | Press `?` to toggle; grid layout; Esc to close |
| **P1** | Extended Vim Navigation | 8.8 | S | Planned | gg/G, numbers, [/], etc. |
| **P1** | Auto-Refresh Badge | 8.0 | S | Planned | "5 new stories" non-intrusive indicator |
| **P2** | Night Owl Auto-Theming | 6.5 | XS | Planned | Schedule-based dark mode |

---

### Phase 2: Deep Reading Experience

**Outcome**: HackerNew becomes the best tool for consuming long-form content and deep comment discussions.

**Target ICPs**: Jordan (Deep Diver), Casey (Nostalgic Hacker)

| Priority | Feature                     | Score | Effort | Status  | Notes                                            |
| -------- | --------------------------- | ----- | ------ | ------- | ------------------------------------------------ |
| **P0**   | Focus Mode / Zen Reader     | 9.3   | L      | Planned | Readability.js extraction; killer differentiator |
| **P0**   | New Comment Indicators      | 9.0   | M      | Partial | Extend readHistory to comments                   |
| **P1**   | Thread Collapse Persistence | 8.5   | S      | Planned | Remember collapse state                          |
| **P1**   | Similar Discussions         | 8.2   | M      | Planned | "Previously discussed" via Algolia               |
| **P2**   | Reading Time Estimates      | 7.0   | S      | Planned | Article length estimation                        |

---

### Phase 3: Offline & Mobile Excellence

**Outcome**: HackerNew is a true PWA—installable, offline-capable, and mobile-first.

**Target ICPs**: Sam (Mobile Commuter), Alex (Daily Reader)

| Priority | Feature                 | Score | Effort | Status  | Notes                                  |
| -------- | ----------------------- | ----- | ------ | ------- | -------------------------------------- |
| **P0**   | PWA with Service Worker | 9.4   | L      | Planned | Offline caching, installable           |
| **P0**   | Save for Offline        | 8.8   | M      | Planned | Explicit "save this story" for offline |
| **P1**   | Background Sync         | 8.0   | M      | Planned | Sync bookmarks when back online        |
| **P2**   | Touch Gestures          | 7.5   | M      | Planned | Swipe to bookmark, dismiss             |

---

### Phase 4: Power User Features

**Outcome**: Advanced features that make power users advocates.

**Target ICPs**: Jordan (Deep Diver), Alex (Daily Reader)

| Priority | Feature                       | Score | Effort | Status  | Notes                                  |
| -------- | ----------------------------- | ----- | ------ | ------- | -------------------------------------- |
| **P0**   | Highlight & Annotate Comments | 8.6   | L      | Planned | Personal knowledge capture             |
| **P1**   | Custom Feed Filters           | 8.3   | M      | Planned | Block domains/keywords                 |
| **P1**   | Time Machine                  | 8.0   | M      | Planned | Historical HN front pages              |
| **P2**   | Split View                    | 7.2   | L      | Planned | Article + comments side-by-side        |
| **P2**   | RSS Feed Generator            | 7.0   | M      | Planned | Personal feeds from bookmarks/searches |

---

### Phase 5: Delight & Community

**Outcome**: Features that create emotional connection and viral potential.

**Target ICPs**: Casey (Nostalgic Hacker), All

| Priority | Feature                | Score | Effort | Status  | Notes                               |
| -------- | ---------------------- | ----- | ------ | ------- | ----------------------------------- |
| **P1**   | HN Wrapped             | 7.8   | M      | Planned | Year-in-review, shareable           |
| **P1**   | Terminal Theme         | 7.2   | S      | Planned | Green-on-black aesthetic            |
| **P2**   | Konami Code Easter Egg | 6.5   | XS     | Planned | Fun discovery moment                |
| **P2**   | Domain Reputation      | 6.0   | M      | Planned | Trust indicators                    |
| **P3**   | Weekly Digest Email    | 5.5   | L      | Partial | Schema exists; needs implementation |

---

## Detailed Feature Analysis

### Tier 1: Critical (P0 Features)

#### Algolia Search with Cmd+K

**Score**: 9.5/10

**Why it matters**: "I remember a post about X from 2 years ago..." is the #1 unmet need. The official HN has no search; users resort to Google with `site:news.ycombinator.com` which is suboptimal. Algolia's HN Search API is free and battle-tested.

| Pros                                   | Cons                                 |
| -------------------------------------- | ------------------------------------ |
| Fills obvious gap in HN experience     | External dependency on Algolia       |
| Algolia API is free for HN data        | Need to handle API rate limits       |
| Instant results possible               | Additional bundle size for search UI |
| Filters (date, type, author) add power |                                      |

**Current State**: No implementation exists.

**Implementation Approach**:

1. Add Algolia HN Search client (`algoliasearch` package or direct API calls via Ky)
2. Create `SearchModal.vue` component with Cmd+K / `/` trigger
3. Implement debounced search with instant results
4. Add filter UI (date range, story type, min score)
5. Store recent searches in localStorage
6. Keyboard navigation within results (j/k to select, Enter to open)

**Success Criteria**:

- Cmd+K opens search modal within 100ms
- Results appear within 300ms of typing pause
- Can find any historical HN post by title/keyword
- Keyboard-only workflow is possible

---

#### Keyboard Help Modal

**Score**: 9.2/10 — **COMPLETE**

**Why it matters**: Keyboard shortcuts are powerful but invisible. Users won't discover them without explicit help. This is a low-effort, high-impact completion of existing partial work.

| Pros                                  | Cons                       |
| ------------------------------------- | -------------------------- |
| Shortcut array already exists         | Minimal—just need modal UI |
| XS effort for immediate value         | None significant           |
| Establishes pattern for future modals |                            |

**Implementation**:
- `KeyboardHelpModal.vue` component with Teleport, grid layout, transitions
- Module-level `isHelpModalOpen` state in `useKeyboard.ts`
- `?` key toggles modal; Esc and click-outside close it
- Added `?` hint to keyboard hints bar for discoverability

**Success Criteria**: All met
- [x] Pressing `?` toggles modal visibility
- [x] Modal shows all shortcuts in scannable grid
- [x] Pressing `Esc` or clicking outside closes modal

---

#### Focus Mode / Zen Reader

**Score**: 9.3/10

**Why it matters**: The core HN use case is reading articles. Currently, users must context-switch to the article site (which may have ads, popups, bad typography). A built-in reader removes friction and keeps users in HackerNew.

| Pros                                                | Cons                                        |
| --------------------------------------------------- | ------------------------------------------- |
| Killer differentiator—official HN doesn't have this | Complex implementation (content extraction) |
| Reduces context switching                           | Won't work for all sites (paywalls, SPAs)   |
| Typography control (font size, width, theme)        | Additional dependency (Readability.js)      |
| Mobile game-changer                                 |                                             |

**Current State**: No implementation exists.

**Implementation Approach**:

1. Add `@mozilla/readability` package (MIT licensed, battle-tested)
2. Create `ReaderView.vue` component with clean typography
3. Fetch article via proxy or direct (CORS considerations)
4. Add keyboard shortcut `r` to toggle reader mode
5. Provide customization (font size, width, sepia mode)
6. Graceful fallback: "Reader mode unavailable" with link to original

**Success Criteria**:

- `r` key toggles reader mode on story detail page
- Article content displays in clean, adjustable typography
- Works for 80%+ of HN-linked articles
- Fallback is clear when extraction fails

---

#### PWA with Service Worker

**Score**: 9.4/10

**Why it matters**: Mobile Commuter (Sam) needs offline reading. PWA enables installability, offline caching, and faster repeat visits. Astro has good PWA support via workbox integration.

| Pros                              | Cons                             |
| --------------------------------- | -------------------------------- |
| Offline reading during commute    | Complex caching strategy design  |
| Installable on mobile home screen | Service worker debugging is hard |
| Faster repeat visits              | Cache invalidation edge cases    |
| Background sync for bookmarks     |                                  |

**Current State**: No PWA implementation; static site deploys to GitHub Pages.

**Implementation Approach**:

1. Add `@vite-pwa/astro` integration
2. Configure workbox with runtime caching for HN API
3. Implement "Save for Offline" button that pre-caches story + comments
4. Add install prompt on mobile (non-intrusive)
5. Handle offline state gracefully in UI

**Success Criteria**:

- Can install HackerNew from mobile browser
- Previously viewed stories load offline
- Explicitly saved stories are available offline with comments
- Offline state is clearly indicated in UI

---

### Tier 2: High Value (P1 Features)

#### Extended Vim Navigation

**Score**: 8.8/10

**Why it matters**: Current keyboard support (j/k/o/c/b) is good but incomplete. Vim users expect `gg`, `G`, numeric prefixes, etc.

| Pros                                         | Cons                                   |
| -------------------------------------------- | -------------------------------------- |
| Low effort, high satisfaction for target ICP | Scope creep risk (how much is enough?) |
| Differentiates from all competitors          | May conflict with browser shortcuts    |
| Builds on existing `useKeyboard` composable  |                                        |

**Current State**: Basic j/k/o/c/b/Esc implemented in `useKeyboard.ts`.

**Implementation Approach**:

1. Add state machine for multi-key sequences (g → g)
2. Implement: `gg` (top), `G` (bottom), `{n}j`/`{n}k` (move n), `[`/`]` (page)
3. Add `t` to cycle tabs, `m` to mark read, `u` to view author profile
4. Update keyboard help modal with new shortcuts

**Success Criteria**:

- `gg` scrolls to top, `G` to bottom
- `5j` moves down 5 stories
- No conflicts with browser defaults

---

#### New Comment Indicators

**Score**: 9.0/10

**Why it matters**: Deep Diver (Jordan) returns to threads and wants to see what's new. Currently impossible—must manually scan entire thread.

| Pros                                 | Cons                                  |
| ------------------------------------ | ------------------------------------- |
| High value for power users           | Storage/sync overhead for comment IDs |
| Extends existing readHistory pattern | Complex tree-diff logic               |
| "Collapse read" becomes possible     |                                       |

**Current State**: `useReadHistory` tracks story IDs only.

**Implementation Approach**:

1. Extend `readHistory` to track comment IDs per story
2. On revisit, compare comment tree to stored IDs
3. Add "new" badge CSS class to unseen comments
4. Add "Collapse read" toggle that hides seen comments
5. Add "Mark all as read" action

**Success Criteria**:

- Revisiting a thread shows visual indicator on new comments
- "Collapse read" hides all previously seen comments
- Comment read state syncs with Supabase if logged in

---

#### Similar Discussions (Previously Discussed)

**Score**: 8.2/10

**Why it matters**: URLs get resubmitted to HN. Previous discussions often have valuable context. Surfacing these enriches the reading experience.

| Pros                           | Cons                                     |
| ------------------------------ | ---------------------------------------- |
| Adds unique context to stories | Requires Algolia integration first       |
| Low effort once search exists  | May clutter UI if not designed carefully |
| Power users love this          |                                          |

**Current State**: No implementation; depends on Algolia integration.

**Implementation Approach**:

1. After Algolia search is implemented, query for URL matches
2. Display "Previously discussed" section on story detail page
3. Show date, score, and comment count for each previous post
4. Link to internal HackerNew item pages (not HN.com)

**Success Criteria**:

- Story detail page shows related discussions when they exist
- Links work within HackerNew (not external)

---

### Tier 3: Strategic (P2 Features)

#### Time Machine - Historical HN

**Score**: 8.0/10

**Why it matters**: Nostalgia, research, and content discovery. "What was on HN the day I joined my company?" is a compelling use case. Also serves as marketing hook.

| Pros                                  | Cons                                      |
| ------------------------------------- | ----------------------------------------- |
| Unique feature—no competitor has this | Requires historical data source           |
| Viral/shareable potential             | May not have complete historical coverage |
| Appeals to Nostalgic Hacker ICP       |                                           |

**Current State**: No implementation.

**Implementation Approach**:

1. Research data sources (HN Archive, BigQuery dataset, Algolia date filtering)
2. Create `/archive/[date].astro` route
3. Build date picker UI with notable tech events marked
4. Add "On this day X years ago" widget on homepage
5. Add keyboard navigation: `<`/`>` for prev/next day

**Success Criteria**:

- Can browse HN front page for any date (coverage TBD)
- URLs are shareable (e.g., `/archive/2015-01-09`)
- Notable tech events are annotated on calendar

---

#### Highlight & Annotate Comments

**Score**: 8.6/10

**Why it matters**: HN discussions contain gems. Knowledge workers want to capture insights, not just read them. This turns HackerNew into a learning tool.

| Pros                                           | Cons                                      |
| ---------------------------------------------- | ----------------------------------------- |
| Unique differentiator                          | Significant implementation complexity     |
| High value for Deep Diver ICP                  | Storage design decisions (local vs cloud) |
| Potential for export to Notion, Obsidian, etc. |                                           |

**Current State**: No implementation.

**Implementation Approach**:

1. Implement text selection handler in comment content
2. Create highlight storage structure (comment ID, text range, color, note)
3. Build highlights management page (`/highlights`)
4. Add export functionality (Markdown, JSON)
5. Optional Supabase sync for logged-in users

**Success Criteria**:

- Can select text in comments and create highlight
- Highlights persist across sessions
- Can add notes to highlights
- Export to Markdown works

---

#### HN Wrapped - Year in Review

**Score**: 7.8/10

**Why it matters**: Spotify Wrapped for HN. Delightful, shareable, creates emotional connection. Low effort with high viral potential.

| Pros                                                  | Cons                           |
| ----------------------------------------------------- | ------------------------------ |
| Viral marketing potential                             | Only relevant once per year    |
| Delightful user experience                            | Requires sufficient usage data |
| Builds on existing analytics (readHistory, bookmarks) |                                |

**Current State**: No implementation.

**Implementation Approach**:

1. Aggregate user data: stories read, time spent, top domains, top authors
2. Generate shareable image/card
3. Year-over-year comparison for returning users
4. Schedule annual availability (December)

**Success Criteria**:

- Users can view their HN year-in-review
- Shareable card generates correctly
- Works without login (uses local data)

---

### Tier 4: Future Consideration

These features are valuable but either depend on multiple prerequisites or have lower ICP alignment. They remain in the backlog for future evaluation.

| Feature                         | Score | Blockers/Notes                               |
| ------------------------------- | ----- | -------------------------------------------- |
| Split View (Article + Comments) | 7.2   | Depends on Focus Mode; complex layout        |
| Thread Subscription / Watch     | 7.0   | Requires notification infrastructure         |
| Weekly Digest Email             | 5.5   | Requires email infrastructure; schema exists |
| Browser Extension               | 6.0   | Separate codebase; maintenance burden        |
| TUI/CLI Version                 | 5.0   | Different target audience; separate project  |
| Voice Navigation                | 4.0   | Accessibility value but niche use case       |
| HN Radio (TTS)                  | 4.5   | Complex implementation; niche use case       |

---

## Anti-Roadmap: What We Won't Build

Explicitly defining what we won't build protects focus and sets expectations.

### ❌ Native Mobile Apps (iOS/Android)

**Why not**: The PWA approach gives us cross-platform coverage without maintaining separate codebases. Native apps would split focus and require app store management. Our ICPs are well-served by a great PWA.

### ❌ HN Account Integration / Posting

**Why not**: This would require HN credentials, introducing security concerns and complexity. HackerNew is a reading client. For posting/voting, users should use the official site.

### ❌ Algorithmic Feed Curation

**Why not**: This violates our core philosophy. HN's chronological/points-based ranking IS the feature. We won't second-guess it with "personalization."

### ❌ Social Features (Follow Users, Friend Lists)

**Why not**: This creates a parallel social network, which is not our mission. HN's community exists on HN.com. We're a client, not a platform.

### ❌ Monetization / Ads / Premium Tiers

**Why not**: This project is a love letter to HN, not a business. Introducing monetization would compromise trust and user experience. Sponsorship via GitHub Sponsors or Open Collective may be considered for hosting costs only.

### ❌ AI-Generated Summaries

**Why not**: While potentially useful, this adds significant complexity, API costs, and risks oversimplifying nuanced discussions. Users should read the actual content.

### ❌ Gamification (Badges, Streaks, Points)

**Why not**: This introduces dark patterns and engagement hacking—the opposite of our values. We want users to read what's valuable, not chase artificial rewards.

---

## Contributing

We welcome contributions! Here's how to pick up roadmap items:

### Picking a Feature

1. Check the [GitHub Issues](https://github.com/meysam81/hackernew/issues) for features labeled `roadmap`
2. Comment on an issue to claim it
3. If no issue exists for a roadmap feature, create one first

### Implementation Guidelines

- Follow the existing architecture patterns (Vue composables, Astro pages)
- Use TypeScript for all new code
- Match the existing code style (Composition API, scoped styles)
- Add tests if introducing complex logic
- Update ROADMAP.md if completing or significantly changing a feature

### PR Requirements

- Reference the related roadmap feature in the PR description
- Include screenshots for UI changes
- Ensure `bun run build` passes
- Keep PRs focused—one feature per PR

---

## Changelog

### v2.0.0 (November 2025)

- Complete rewrite of ROADMAP.md with ICP-driven prioritization
- Added competitive positioning analysis
- Defined Anti-Roadmap to protect focus
- Restructured phases by theme rather than arbitrary timelines
- Added detailed feature specifications for Tier 1 and Tier 2 features

### v1.0.0 (October 2025)

- Initial roadmap with feature brainstorm
- Basic phase structure

---

_This roadmap is a living document. Feature priorities may shift based on community feedback and contributor availability. For questions or suggestions, open an issue on [GitHub](https://github.com/meysam81/hackernew/issues)._
