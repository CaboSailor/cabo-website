# Cabo Sailing — Main Production Site

This is the main Cabo Sailing website, built with **Astro 6**. It lives in the root directory of this repository.

The `astro-test/` directory has been retired — all source code was moved to the root and the old static HTML files have been removed.

## Deployment

Deployment is automated via **GitHub Actions** to **FastComet** hosting (Apache).

- Pushing to `main` triggers a build and FTP deploy (`.github/workflows/deploy.yml`).
- The built site (`dist/`) is deployed straight to production at `cabosailing.com` (FTP path `/home/cabosail/public_html`).
- FTP credentials are stored as GitHub repository secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.
- 301 redirects are in `public/.htaccess` (Apache RewriteRule format). These only work on the deployed server, not the Astro dev/preview server.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Build for production (output in `dist/`)
- `npm run preview` — Preview the production build locally

## Key directories

- `src/pages/` — Page routes (standalone `.astro` files for tour/service pages)
- `src/content/travel-guide/` — Markdown content collection for travel guide articles
- `src/pages/travel-guide/[slug].astro` — Dynamic route that renders content collection articles
- `src/components/` — Reusable components (Header, Footer, MobileMenu, FloatingCTA, RezdyModal, SnorkelBoatCards)
- `src/layouts/BaseLayout.astro` — Single base layout used by all pages
- `src/assets/` — Images processed by Astro (hashed filenames at build time)
- `public/` — Static files served as-is (`data/`, `js/`, `.htaccess`, favicons)
- `migration/` — Migration data: `articles.json`, `redirects.json`, CSVs, and the source `.xlsx`

## Travel guide articles

Articles are **Markdown files** in `src/content/travel-guide/`, NOT standalone `.astro` pages. The filename becomes the URL slug: `la-paz-to-cabo.md` → `/travel-guide/la-paz-to-cabo/`.

### Frontmatter schema

```yaml
title: "Article Title Here"           # Rendered as H1 and <title> (template appends " | Cabo Sailing")
pubDate: 2026-04-23                   # ISO date
description: "Meta description"       # Used for <meta name="description">, og:description, twitter:description
heroImage: "https://..."              # Full URL to hero image
heroAlt: "Alt text"                   # Hero image alt text
category: "Traveling to Cabo"         # One of 4 categories (see below)
categoryLink: "/travel-guide-traveling" # Link to the category hub page
activeSubmenu: "traveling"            # Submenu highlight key
bestTime: "Year-round — ..."         # Sidebar "best time" text
relatedActivity: "/private-snorkeling" # Optional: sidebar link to a tour page
sidebarType: "default"               # "default" or "snorkeling" (shows boat cards)
hasBoatCards: false                   # Optional: show snorkel boat cards in sidebar
```

### The 4 categories

All articles must fit into one of these. Do not create new categories.
- **Activities** (`categoryLink: "/travel-guide-activities"`, `activeSubmenu: "activities"`)
- **Attractions** (`categoryLink: "/travel-guide-attractions"`, `activeSubmenu: "attractions"`)
- **Traveling to Cabo** (`categoryLink: "/travel-guide-traveling"`, `activeSubmenu: "traveling"`)
- **Culture & Food** (`categoryLink: "/travel-guide-culture"`, `activeSubmenu: "culture"`)

### Category hub pages

Each category has a hardcoded hub page (`src/pages/travel-guide-activities.astro`, etc.) with a grid of article cards. When adding a new article, you must also add a card to the appropriate hub page — articles won't appear automatically.

## Page structure (non-article pages)

Tour and service pages are standalone `.astro` files in `src/pages/`. Title and description are passed directly to `<BaseLayout>`:

```astro
<BaseLayout title="Page Title | Cabo Sailing" description="..." hreflangs={{ en: '/page', es: '/es/page' }}>
```

**Important:** The `[slug].astro` template already appends `" | Cabo Sailing"` to the article title. Don't include it in the frontmatter title or it will double up.

## Bilingual (EN/ES)

- English pages: `src/pages/*.astro`
- Spanish pages: `src/pages/es/*.astro` (manually maintained copies, not auto-translated)
- `hreflangs` prop on `<BaseLayout>` generates `<link rel="alternate" hreflang="en|es|x-default">` tags
- Language switcher is in the mobile header bar (Header.astro) and desktop nav
- When renaming an EN page, also rename the ES counterpart and add `.htaccess` redirects for both

## Styling

- **Tailwind CSS via CDN** (`<script src="https://cdn.tailwindcss.com">` in BaseLayout) — not installed as a build dependency
- Tailwind config is inline in `<script is:inline>` in BaseLayout.astro
- Custom colors: `navy`, `accent-gold`, `gold`, `warm-yellow`, `light-grey`, `bg-light`, `surface-light`, `border-light`
- Custom font families: `font-display` (Plus Jakarta Sans), `font-serif` (Playfair Display), `font-script` (Great Vibes), `font-heading` (Cinzel), `font-body` (Montserrat)
- Material Symbols Outlined icons via Google Fonts CDN
- Font Awesome icons via CDN

## Content formatting conventions (travel guide articles)

- Use `---` (horizontal rule) before every H2 heading
- Use `&mdash;` for em dashes, `&eacute;` / `&iacute;` for accented characters in HTML context
- Bold article titles in cards
- Breadcrumbs above the H1 on every page
- Standard footer on every page (Footer.astro component)
- Tables use Tailwind classes: `bg-navy text-white` header, alternating `bg-gray-50` rows, `border-gray-100` borders
- Callout boxes: colored `div` with `rounded-xl p-6 my-6 border` (green for positive, blue for info, yellow for caution)
- Lists use `<ul class="spot-list">` with bold labels and `&mdash;` separators
- Internal links: `class="text-accent-gold font-semibold hover:underline"`
- FAQ schema: JSON-LD `<script type="application/ld+json">` at the bottom of the article

## Images

- Tour/service page images: imported from `src/assets/images/` (Astro-processed, hashed URLs)
- Travel guide hero images: most use external URLs (old WordPress CDN), rendered as raw `<img src={heroImage}>` in `[slug].astro`. The template does NOT use Astro's `<Image>` component for heroes — it's a plain `<img>` tag, so local asset imports won't work. For local hero images, place them in `public/` and reference as `/images/...`
- Inline article images: use raw `<img>` tags in Markdown with either external URLs or `/public/` paths. Include `class="rounded-xl my-6"` for consistent styling
- When adding new local images for articles, place optimized WebP files in `public/images/<topic>/` (not `src/assets/`). Convert originals >500KB to WebP using Pillow or similar
- `og:image`: BaseLayout defaults to `/og/home.jpg` if no `ogImage` prop is passed. The `[slug].astro` template passes `heroImage` as og:image via Article JSON-LD but does NOT pass `ogImage` to BaseLayout — so travel guide articles get the default og:image. To override, add `ogImage` and `ogImageAlt` props to individual pages

## Image handling — known inconsistencies

- 2 articles use `" | Cabo Sailing"` in the frontmatter title (`can-you-swim-in-cabo-san-lucas.md`, `is-cabo-safe.md`) — this causes double-suffixing in `<title>`. These should be cleaned up
- 2 articles use local `/images/` paths for heroImage (`la-paz-to-cabo`, `la-paz-vs-cabo`); the other 19 use external WordPress CDN URLs. Both work, but local WebP is preferred for new articles
- Many articles reuse the same placeholder hero image (`fun-activities-cabo.jpg.webp` or `snorkeling-5.jpg.webp`). These should be replaced with article-specific images over time

## Migration data

- `migration/Travel_Guide_Migration_Plan_v2.xlsx` — source of truth (downloaded from Google Sheets)
- `migration/articles.json` — 128 ranked articles with action/category/rationale
- `migration/redirects.json` — 45 redirect mappings (from → to)
- `migration/ctr-meta-tags.csv` — pre-approved titles/descriptions for 38 CTR-fix articles
- `migration/priority-content.csv` — content refresh plan for priority articles
- `public/.htaccess` — Apache 301 redirects, grouped by topic with comments

## Migration workflow (established patterns)

When migrating an article from the old WordPress site:

1. **Create the content file** in `src/content/travel-guide/` with the old URL slug as filename
2. **Frontmatter**: use the pre-approved title/description from `priority-content.csv` or `ctr-meta-tags.csv` if available. Do NOT include `" | Cabo Sailing"` in the title — the template appends it
3. **Content**: strip all Divi shortcodes, wrapper divs, and inline classes. Preserve heading structure (H2/H3). Add `---` before every H2
4. **Internal links**: rewrite `cabosailing.com/transportation/` → `/shuttle-service/`, `cabosailing.com/luxury-yachts/` → `/yacht-charter-cabo/`, `cabosailing.com/luxury-sailboats/` → `/sailing-cabo-san-lucas/`, `cabosailing.com/book-now/` → `/contact/`. Check `migration/redirects.json` for other mappings. There is no `/fleet/` page — it's a dropdown label only (the nav label is "Yacht Rentals" and points to `/yacht-charter-cabo/`)
5. **Link styling**: all internal links in article body use `class="text-accent-gold font-semibold hover:underline"`
6. **301 redirect**: add a RewriteRule in `public/.htaccess` mapping the old slug to `/travel-guide/<slug>/`. Use `/?$` to match with or without trailing slash
7. **Hub page card**: add a card to the appropriate category hub page (`travel-guide-activities.astro`, `travel-guide-attractions.astro`, `travel-guide-traveling.astro`, or `travel-guide-culture.astro`). Articles do NOT appear on hub pages automatically
8. **FAQ schema**: add FAQ JSON-LD `<script type="application/ld+json">` at the bottom of the Markdown content. The `[slug].astro` template automatically adds Article JSON-LD and a canonical tag for all articles
9. **Build check**: run `npm run build` and verify the new page appears in the output with no errors

## SEO plumbing (wired in `[slug].astro`)

- **Canonical**: `<link rel="canonical">` auto-generated from `post.id` → `https://cabosailing.com/travel-guide/<slug>/`
- **Article JSON-LD**: auto-generated with headline, datePublished, author = "Cabo Sailing Ocean Adventures"
- **FAQ JSON-LD**: added manually in each article's Markdown content (not auto-generated)
- **og:image**: BaseLayout defaults to `/og/home.jpg`. 10 core pages pass explicit `ogImage`/`ogImageAlt` props. Travel guide articles inherit the default — they don't pass `ogImage` to BaseLayout

## Pricing

- Prices are in `public/data/prices.json` and loaded by `public/js/prices.js`
- Booking modals use Rezdy (RezdyModal.astro component)
