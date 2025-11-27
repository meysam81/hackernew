# HackerNew Product Roadmap

> A love letter to Hacker News - reimagined for 2025

## Vision

HackerNew respects what makes HN great while bringing thoughtful, modern enhancements that the community will genuinely appreciate. We're not trying to replace HN - we're celebrating it.

## Design Philosophy

1. **Respect the original** - Don't fix what isn't broken
2. **Enhance, don't clutter** - Every feature must be hidden until needed
3. **Keyboard-first** - Everything should be keyboard accessible
4. **Offline-first** - Assume spotty connectivity
5. **Privacy-respecting** - No tracking, optional accounts
6. **Developer-delighting** - Easter eggs, debug modes, view-source friendly
7. **Performance obsessed** - Sub-second loads, smooth animations
8. **Mobile excellent** - Not an afterthought

---

## Phase 1: Foundation (Quick Wins)

### 1.1 Algolia-Powered Search with Cmd+K
**Priority: Critical | Effort: Medium | Impact: Very High**

Full-text search across stories and comments with smart filters.

**Features:**
- `Cmd+K` / `/` keyboard shortcut to open search modal
- Filters: date range, story type, author, domain, min score
- Recent searches history
- Saved searches (stored locally)
- Instant results with debouncing

**Why:** "I remember a post about X from 2 years ago..." - this is the #1 missing feature. Algolia HN API is free and fast.

---

### 1.2 Extended Vim Keyboard Navigation
**Priority: High | Effort: Medium | Impact: High**

Full vim-like navigation with more shortcuts and command palette.

**New shortcuts:**
```
gg      - Jump to top
G       - Jump to bottom
{n}j    - Move down n stories (5j = move 5 down)
/       - Focus search
?       - Show keyboard help modal
[       - Previous page
]       - Next page
t       - Cycle through tabs (Top/New/Ask/etc)
m       - Mark as read without opening
u       - Open user profile of selected story author
s       - Share story
1-9     - Jump to nth story
```

**Why:** HN users LOVE vim. This is a cult favorite feature waiting to happen.

---

### 1.3 Auto-Refresh with New Stories Counter
**Priority: Medium | Effort: Low | Impact: Medium**

Badge showing "5 new stories" that appeared since page load.

**Features:**
- Non-intrusive badge/pill at top
- Click to load new stories without losing scroll position
- Configurable refresh interval (or disable)
- Sound notification option (off by default)

---

### 1.4 Reading Time Estimates
**Priority: Medium | Effort: Low-Medium | Impact: Medium**

Show estimated reading time for linked articles.

**Features:**
- "5 min read" badge on story items
- Calculated from article content length
- Fallback to URL metadata
- Configurable (can hide)

---

### 1.5 Night Owl Auto-Theming
**Priority: Low | Effort: Low | Impact: Low-Medium**

Auto-switch to dark mode based on time of day.

**Features:**
- Schedule-based (e.g., 8pm-7am)
- Sunrise/sunset based (using geolocation)
- Option in theme dropdown: "Auto (schedule)"

---

## Phase 2: Core Experience

### 2.1 Focus Mode / Zen Reader
**Priority: Critical | Effort: High | Impact: Very High**

Distraction-free reading mode that extracts and displays article content cleanly.

**Features:**
- Parse article content (Readability.js or similar)
- Clean typography-optimized presentation
- Keyboard shortcut: `r` for "Reader mode"
- Adjustable font size, line height, width
- Sepia/dark/light backgrounds
- Graceful fallback for paywalled/complex sites
- "View original" always accessible

**Why:** Killer feature that original HN doesn't have. Reduces context switching. Mobile game-changer.

---

### 2.2 Progressive Web App (PWA) with Offline Mode
**Priority: High | Effort: High | Impact: High**

Full PWA support - installable, offline reading, background sync.

**Features:**
- Service worker with smart caching
- Cache stories and comments for offline reading
- "Save for offline" button on stories
- Background sync for bookmarks when back online
- Subtle install prompts
- Queue actions when offline, sync when connected

**Why:** Many read during commute (subway, flights). Shows technical competence.

---

### 2.3 Thread Collapser with "Collapse Read"
**Priority: High | Effort: Medium | Impact: High**

Mark comments as read and collapse all read threads to focus on new content.

**Features:**
- Track read comments (extend readHistory)
- "Collapse read" toggle button
- Highlight new comments with subtle indicator
- Keyboard shortcut: `x` to collapse/expand thread
- Persist read state across sessions
- "Mark all as read" option

**Why:** Long threads are exhausting. "What's new since I last read?" is a real need.

---

### 2.4 Time Machine - Historical HN
**Priority: High | Effort: Medium | Impact: High**

Browse what the HN front page looked like on any given day.

**Features:**
- Date picker with calendar view
- Notable tech events marked on calendar
- "On this day X years ago" widget
- Shareable URLs: `/archive/2015-01-09`
- Keyboard navigation: `<` / `>` for prev/next day

**Why:** Nostalgia, research, discovery of timeless content. Viral/shareable potential.

---

### 2.5 Custom Feed Filters
**Priority: Medium | Effort: Medium | Impact: Medium**

Hide stories by domain, keyword, or author.

**Features:**
- Filter settings page
- Block domains (e.g., medium.com)
- Block keywords (e.g., "crypto", "AI")
- Block authors (rare, but useful)
- Regex support for power users
- Show filter count: "3 stories hidden"
- Quick toggle to disable filters

---

## Phase 3: Power User Features

### 3.1 Highlight & Note on Comments
**Priority: High | Effort: High | Impact: High**

Highlight text in comments and add personal notes. Like Kindle highlighting for HN discussions.

**Features:**
- Text selection to highlight
- Add notes to highlights
- Local storage for highlights
- Optional sync to Supabase
- Export as markdown
- View all highlights in dedicated page
- Search within highlights
- Keyboard shortcut: `h` to highlight selection

**Why:** HN discussions contain gems. Knowledge workers want to capture insights.

---

### 3.2 Similar Discussions Linking
**Priority: High | Effort: Medium | Impact: Medium-High**

Show previous HN discussions of the same URL or topic.

**Features:**
- "Previously discussed" section on story pages
- Link to related discussions
- Show score and comment count of previous posts
- Powered by Algolia search

**Why:** "This was posted before with great discussion" - surface that context.

---

### 3.3 Split View: Article + Comments
**Priority: Medium | Effort: High | Impact: Medium-High**

Side-by-side view of article content and HN comments on larger screens.

**Features:**
- Toggle split view mode
- Resizable panes
- Synced scrolling option
- Keyboard shortcuts for each pane
- Mobile: tabs instead of split

**Why:** Compare what article says vs. what HN thinks. Common workflow.

---

### 3.4 Thread Subscription / Watch
**Priority: Medium | Effort: High | Impact: Medium-High**

Subscribe to discussions and get notified when new comments arrive.

**Features:**
- "Watch" button on story pages
- Email notifications (digest or immediate)
- Push notifications (PWA)
- In-app notification center
- Manage subscriptions page

**Why:** Discussions evolve. Users want to follow interesting ones.

---

### 3.5 RSS Feed Generator
**Priority: Medium | Effort: Medium | Impact: Medium**

Generate personal RSS feeds from bookmarks, filters, or saved searches.

**Features:**
- RSS feed from bookmarks
- RSS feed from custom search queries
- Atom and JSON Feed support
- Configurable feed URL

**Why:** HN users are RSS people. Give them what they want.

---

## Phase 4: Delight & Community

### 4.1 HN Wrapped - Year in Review
**Priority: Medium | Effort: Medium | Impact: Medium (viral potential)**

End-of-year summary of HackerNew usage.

**Features:**
- Stories read count
- Time spent reading
- Favorite domains
- Most active days/hours
- Top bookmarked stories
- Shareable card/image
- Compare to previous year

**Why:** Spotify Wrapped for HN. Delightful, shareable, viral potential.

---

### 4.2 Konami Code Easter Egg
**Priority: Low | Effort: Very Low | Impact: Low (cult status)**

↑↑↓↓←→←→BA triggers something fun.

**Ideas:**
- Invert all colors
- Show famous dang quotes
- Retro HN theme (Comic Sans, marquee)
- Matrix rain effect
- "You found it!" achievement badge

**Why:** Classic developer easter egg. HN users will find and share it.

---

### 4.3 Terminal Theme
**Priority: Low | Effort: Low | Impact: Low (niche)**

CSS theme that looks like a terminal.

**Features:**
- Green/amber text on black
- Monospace everything
- Cursor blinking effect
- CRT scanline effect (optional)

**Why:** Peak aesthetic for certain HN users.

---

### 4.4 Weekly Digest Email
**Priority: Medium | Effort: Medium | Impact: Medium**

Opt-in email with top stories from the week.

**Features:**
- Configurable: daily/weekly
- Filter by score threshold
- Exclude already-read stories
- Unsubscribe link

---

### 4.5 Domain Reputation Indicators
**Priority: Low | Effort: Medium | Impact: Medium**

Small badge showing domain reputation.

**Features:**
- Trust indicators for known sources (GitHub, arxiv, NYT)
- Warning for known blogspam domains
- Community-driven reputation (future)
- Configurable (can hide)

---

## Phase 5: Long-Term Vision

### 5.1 Browser Extension: "HN Context"
Show if any website has been discussed on HN. Overlay with discussion links.

### 5.2 TUI/CLI Version
Terminal-based HackerNew client: `hackernew top`

### 5.3 Voice Navigation
Hands-free browsing with voice commands.

### 5.4 HN Radio - Text-to-Speech
Listen to HN articles during commute.

### 5.5 API for HackerNew
Public API for HackerNew-specific features.

---

## Implementation Priority Matrix

### Must-Have (P0)
- [ ] Algolia Search with Cmd+K
- [ ] Extended Vim Keyboard Navigation
- [ ] Focus Mode / Zen Reader

### Should-Have (P1)
- [ ] PWA with Offline Mode
- [ ] Thread Collapser with "Collapse Read"
- [ ] Time Machine - Historical HN
- [ ] Highlight & Note on Comments

### Nice-to-Have (P2)
- [ ] Auto-Refresh with New Stories Counter
- [ ] Reading Time Estimates
- [ ] Custom Feed Filters
- [ ] Similar Discussions Linking
- [ ] HN Wrapped

### Delighters (P3)
- [ ] Konami Code Easter Egg
- [ ] Terminal Theme
- [ ] Night Owl Auto-Theming
- [ ] Domain Reputation Indicators

---

## Success Metrics

1. **Engagement**
   - Daily active users
   - Stories read per session
   - Return visitor rate
   - Search queries per user

2. **Feature Adoption**
   - % users using keyboard navigation
   - % users with bookmarks
   - % users with saved searches
   - PWA install rate

3. **Community**
   - GitHub stars
   - Twitter mentions
   - HN front page appearances
   - Contributor count

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

Feature requests and ideas can be submitted as GitHub issues with the `enhancement` label.

---

*This roadmap is a living document. Last updated: November 2025*
