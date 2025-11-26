# Launch Checklist

Everything you need to launch HackerNew.

---

## Pre-Launch

### Assets Ready
- [x] Logo (`assets/logo.svg`)
- [x] Open Graph image (`assets/og-image.svg`)
- [x] Product Hunt gallery images (`assets/producthunt/`)
- [x] Thumbnail (`assets/producthunt/thumbnail.svg`)
- [ ] Real screenshots (`assets/screenshots/`) — **Capture these!**

### Convert SVGs to PNG
Social platforms need PNG images. Convert SVGs before launch:

```bash
# Using Inkscape
inkscape -w 1200 -h 630 assets/og-image.svg -o public/og-image.png
inkscape -w 240 -h 240 assets/logo.svg -o public/logo.png

# Product Hunt gallery (1270x760)
for f in assets/producthunt/gallery-*.svg; do
  inkscape -w 1270 -h 760 "$f" -o "${f%.svg}.png"
done

# Thumbnail (600x600)
inkscape -w 600 -h 600 assets/producthunt/thumbnail.svg -o assets/producthunt/thumbnail.png
```

Or use [CloudConvert](https://cloudconvert.com/svg-to-png), [Figma](https://figma.com), or any design tool.

### Documentation Ready
- [x] README.md — Exceptional first-time experience
- [x] PRODUCT_HUNT.md — Full submission materials
- [x] SHOW_HN.md — Hacker News post materials
- [x] LICENSE — Apache 2.0

### Technical Checks
- [ ] Site deployed and working (`hackernew.dev`)
- [ ] All links in README work
- [ ] Mobile responsive works
- [ ] Dark/light mode works
- [ ] Keyboard shortcuts work
- [ ] No console errors

---

## Launch Day

### Product Hunt (if launching)
1. Go to [producthunt.com/posts/new](https://www.producthunt.com/posts/new)
2. Fill in details from `PRODUCT_HUNT.md`
3. Upload gallery images (PNG versions)
4. Schedule for 12:01 AM PT
5. Post first comment immediately after going live
6. Engage with ALL comments throughout the day

### Show HN
1. Go to [news.ycombinator.com/submit](https://news.ycombinator.com/submit)
2. Use title from `SHOW_HN.md`
3. Submit URL: `https://hackernew.dev`
4. Post first comment immediately
5. Engage genuinely with feedback
6. Best times: Tue-Thu, 8-10 AM ET

### Social Media
Post to these platforms (copy in `PRODUCT_HUNT.md`):
- [ ] Twitter/X
- [ ] LinkedIn
- [ ] Mastodon
- [ ] Reddit (r/webdev, r/opensource, r/programming)
- [ ] Discord servers (where appropriate)

---

## Post-Launch

### Monitor
- [ ] Respond to all comments (be genuine, be humble)
- [ ] Fix any bugs reported ASAP
- [ ] Note feature requests for later

### Follow Up
- [ ] Thank the community
- [ ] Write a blog post about what you learned
- [ ] Consider a "lessons learned" Show HN/blog post
- [ ] Update README with any new screenshots or feedback

---

## Files Overview

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation |
| `PRODUCT_HUNT.md` | Product Hunt submission materials |
| `SHOW_HN.md` | Hacker News Show HN materials |
| `LAUNCH.md` | This checklist |
| `assets/` | All visual assets |

---

## Key URLs

| Resource | URL |
|----------|-----|
| Live Site | https://hackernew.dev |
| GitHub | https://github.com/meysam81/hackernew |
| Product Hunt | *(after submission)* |
| Show HN | *(after submission)* |

---

## Tone Reminders

- **Humble**: This is a side project, not a startup
- **Grateful**: Thank the HN community genuinely
- **Helpful**: Answer questions thoroughly
- **Open**: Welcome criticism gracefully
- **Fun**: Enjoy the process!

---

*Good luck with the launch!*
