# Assets

Marketing and branding assets for HackerNew.

## Directory Structure

```
assets/
├── logo.svg              # Main logo (240x240)
├── og-image.svg          # Open Graph image (1200x630)
├── producthunt/          # Product Hunt gallery images
│   ├── gallery-1-hero.svg
│   ├── gallery-2-dark-light.svg
│   ├── gallery-3-keyboard.svg
│   ├── gallery-4-techstack.svg
│   ├── gallery-5-features.svg
│   └── thumbnail.svg     # Square thumbnail (600x600)
└── screenshots/          # Real screenshots (to be captured)
    └── README.md         # Screenshot capture guide
```

## Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| Orange (Primary) | `#F97316` | Accent, links, CTAs |
| Orange (Light) | `#FB923C` | Hover states, gradients |
| Orange (Dark) | `#EA580C` | Pressed states |
| Background Dark | `#09090B` | Dark mode background |
| Background Light | `#FAFAFA` | Light mode background |
| Text Primary | `#FAFAFA` / `#18181B` | Main text (dark/light) |
| Text Secondary | `#A1A1AA` / `#71717A` | Secondary text |

## Typography

- **Display/Headings**: System UI (`system-ui, -apple-system, sans-serif`)
- **Body**: Inter Variable
- **Code/Monospace**: JetBrains Mono Variable, `ui-monospace`

## Converting SVGs

### To PNG (for Product Hunt, social media)

Using Inkscape (CLI):
```bash
inkscape -w 1270 -h 760 gallery-1-hero.svg -o gallery-1-hero.png
```

Using ImageMagick:
```bash
convert -density 300 gallery-1-hero.svg gallery-1-hero.png
```

Using Figma:
1. Import SVG
2. Export as PNG at 2x

### To WebP (for web optimization)

```bash
cwebp -q 90 gallery-1-hero.png -o gallery-1-hero.webp
```

## Usage Rights

All assets in this directory are part of the HackerNew project and are licensed under Apache 2.0.

Feel free to:
- Use for promoting HackerNew
- Modify for your own fork
- Reference in articles/tutorials about the project

## Creating New Assets

When creating new marketing assets:

1. **Use the brand colors** defined above
2. **Keep it minimal** — match the product's aesthetic
3. **Export as SVG** for scalability
4. **Test in dark/light modes** if applicable
5. **Optimize file size** before committing

## File Size Guidelines

- SVGs: Keep under 50KB if possible
- PNGs: Optimize with ImageOptim or similar
- Aim for web-friendly sizes

---

*Questions? Open an issue on GitHub.*
