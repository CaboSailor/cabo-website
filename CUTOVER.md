# Cutover Playbook — new.cabosailing.com to cabosailing.com

This document covers **repo/code-level cutover steps only**. For the full 49-step launch plan (DNS, backups, rollback, monitoring), see [Launch Checklist — new.cabosailing.com to cabosailing.com](#12-launch-checklist-reference) in Google Drive.

---

### 1. Preflight (5 min before cutover)

- [ ] Working directory is clean: `git status` shows nothing to commit
- [ ] On `main` branch: `git branch --show-current` returns `main`
- [ ] Build succeeds with zero errors:
  ```bash
  npm run build
  ```
  Expect `63 page(s) built` and `Complete!`
- [ ] `migration/link-check-report.md` shows **0 internal broken links**
- [ ] Open `https://new.cabosailing.com` in incognito — spot-check homepage, a tour page, and a travel guide article
- [ ] Confirm `public/robots.txt` contains:
  ```
  User-agent: *
  Allow: /
  Sitemap: https://cabosailing.com/sitemap-index.xml
  ```
- [ ] Confirm `public/.htaccess` has all 45 redirect rules from `migration/redirects.json`

---

### 2. Deploy to production (FastComet cPanel)

Deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`). Pushing to `main` triggers:

1. Checkout → install → `npm run build` → FTP deploy of `dist/` contents

**To trigger deployment:**

```bash
git push origin main
```

Monitor the deploy at: `https://github.com/<owner>/<repo>/actions`

**FTP target:** The GitHub Action deploys `dist/` contents to the FTP root (`server-dir: ./`). The FTP credentials in GitHub Secrets (`FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`) determine the landing directory — confirm this maps to `public_html/` or the subdomain's document root.

**Before deploying, rename the old site for rollback:**

1. cPanel → File Manager
2. Rename `public_html/` to `public_html-old-2026-04-XX/`
3. Create a fresh empty `public_html/`
4. Then push to `main` to trigger the FTP deploy into the new empty `public_html/`
5. Keep `public_html-old-*` for 90 days, then delete

---

### 3. Switch document root (if needed)

If the FTP deploy targets a subdomain folder (e.g., `new.cabosailing.com/`) rather than `public_html/`:

1. cPanel → Domains → Manage → find `cabosailing.com`
2. Change **Document Root** to the folder containing the deployed Astro build
3. Save and wait 1-2 minutes for propagation
4. Verify: `curl -sI https://cabosailing.com/ | head -5` should return `200 OK`

If the FTP already deploys to `public_html/`, skip this step.

---

### 4. Remove staging noindex

- [ ] **robots.txt** — Already correct in `public/robots.txt`:
  ```
  User-agent: *
  Allow: /
  Sitemap: https://cabosailing.com/sitemap-index.xml
  ```
- [ ] **No noindex meta tag** — `BaseLayout.astro` does not render any `<meta name="robots" content="noindex">`. Confirmed clean.
- [ ] **Verify live:** After deploy, fetch and confirm:
  ```bash
  curl -s https://cabosailing.com/robots.txt
  ```
  Should show the `Allow: /` version, not a staging block.

---

### 5. Force HTTPS + SSL

- [ ] FastComet AutoSSL should already cover `cabosailing.com` and `www.cabosailing.com`
- [ ] Verify cert: `curl -sI https://cabosailing.com/ | grep -i strict` — should show `Strict-Transport-Security` header
- [ ] If cert looks wrong or expired: cPanel → SSL/TLS Status → Run AutoSSL
- [ ] HTTPS redirect is handled in `.htaccess` — verify it's in the deployed `public_html/.htaccess`:
  ```bash
  curl -sI http://cabosailing.com/ | grep Location
  ```
  Should redirect to `https://cabosailing.com/`

---

### 6. Purge caches

- [ ] **FastComet LiteSpeed cache:**
  cPanel → LiteSpeed Web Cache Manager → Flush All
- [ ] **Cloudflare (if active):**
  https://dash.cloudflare.com → cabosailing.com → Caching → Purge Everything
- [ ] **Browser verification:**
  Open `https://cabosailing.com` in a **new incognito window** (not regular browser).
  Check page source — confirm Tailwind CSS is a local `/_astro/*.css` file, not `cdn.tailwindcss.com`.

---

### 7. Submit sitemap to Google Search Console

1. Go to https://search.google.com/search-console
2. Select property: `cabosailing.com`
3. Left nav → Sitemaps
4. Enter: `https://cabosailing.com/sitemap-index.xml`
5. Click Submit
6. Wait for status to show **"Success"** (may take a few minutes)
7. Note the discovered URL count — should be ~63 pages

---

### 8. Validate Open Graph images on social platforms

Test these 3 URLs on each platform:
- `https://cabosailing.com/`
- `https://cabosailing.com/private-sunset/`
- `https://cabosailing.com/travel-guide/is-cabo-safe/`

**Facebook Sharing Debugger:**
- https://developers.facebook.com/tools/debug/
- Paste each URL, click Debug
- If it shows old/cached data, click **"Scrape Again"**
- [ ] Confirm each shows 1200x630 preview image, not a tiny icon

**X (Twitter) Card Validator:**
- https://cards-dev.twitter.com/validator
- Paste each URL
- [ ] Confirm `summary_large_image` card renders with full preview

**LinkedIn Post Inspector:**
- https://www.linkedin.com/post-inspector/
- Paste each URL
- [ ] Confirm OG image, title, and description render correctly

---

### 9. Redirect spot-check (most important step)

Load each old URL in a browser. Confirm it 301-redirects to the expected target. These are the top 20 by Search Console click risk (`sc_clicks_at_risk`).

| # | Old URL | Expected 301 Target | Clicks at Risk | Result |
|---|---------|---------------------|----------------|--------|
| 1 | `https://cabosailing.com/15-bachelorette-boat-party-ideas-for-the-ultimate-celebration` | `/bachelorette/` | 134 | |
| 2 | `https://cabosailing.com/cabo-san-lucas-safe` | `/travel-guide/is-cabo-safe/` | 112 | |
| 3 | `https://cabosailing.com/13-best-all-inclusive-family-resorts-in-cabo-san-lucas` | `/travel-guide/` | 109 | |
| 4 | `https://cabosailing.com/how-to-make-the-most-of-a-snorkeling-trip-in-cabo-san-lucas` | `/snorkeling/` | 103 | |
| 5 | `https://cabosailing.com/cooking-classes-in-los-cabos` | `/travel-guide/` | 50 | |
| 6 | `https://cabosailing.com/20-all-inclusive-adult-only-resorts-in-cabo-san-lucas` | `/travel-guide/` | 34 | |
| 7 | `https://cabosailing.com/the-best-bars-in-cabo` | `/travel-guide/` | 33 | |
| 8 | `https://cabosailing.com/nightlife-in-cabo-san-lucas` | `/travel-guide/` | 32 | |
| 9 | `https://cabosailing.com/best-art-shops-in-cabo` | `/travel-guide/` | 32 | |
| 10 | `https://cabosailing.com/10-cabo-honeymoon-resorts-that-provide-the-perfect-romantic-atmosphere` | `/bachelorette/` | 28 | |
| 11 | `https://cabosailing.com/18-noteworthy-san-jose-del-cabo-restaurants-to-visit` | `/travel-guide/` | 27 | |
| 12 | `https://cabosailing.com/cabo-sailing-coupon-codes` | `/our-fleet/sailboats/` | 23 | |
| 13 | `https://cabosailing.com/15-spectacular-wedding-venues-in-cabo-san-lucas` | `/bachelorette/` | 23 | |
| 14 | `https://cabosailing.com/where-to-take-the-best-photos-in-cabo` | `/travel-guide/` | 22 | |
| 15 | `https://cabosailing.com/cabo-history-vacation` | `/travel-guide/` | 18 | |
| 16 | `https://cabosailing.com/21-best-hotels-to-stay-in-los-cabos` | `/travel-guide/` | 17 | |
| 17 | `https://cabosailing.com/romantic-getaway-in-los-cabos` | `/bachelorette/` | 17 | |
| 18 | `https://cabosailing.com/yacht-charter-costs-in-cabo-san-lucas-what-to-expect` | `/our-fleet/yachts/` | 16 | |
| 19 | `https://cabosailing.com/visiting-cabo-with-a-large-group` | `/travel-guide/` | 16 | |
| 20 | `https://cabosailing.com/cabo-san-lucas-activities` | `/travel-guide/` | 15 | |

**How to test:** Open each old URL in incognito. The browser should land on the target page. Check the address bar shows the new URL. Mark the Result column with a checkmark.

> **Note:** Redirects #4 targets `/snorkeling/` and #12 targets `/our-fleet/sailboats/` — these may need secondary redirects if those paths were renamed. Verify both resolve to a live page.

---

### 10. URL Inspection + Request Indexing

In Google Search Console (https://search.google.com/search-console):

1. Use **URL Inspection** on each of these 5 priority pages:
   - [ ] `https://cabosailing.com/`
   - [ ] `https://cabosailing.com/private-sunset/`
   - [ ] `https://cabosailing.com/private-snorkeling/`
   - [ ] `https://cabosailing.com/travel-guide/`
   - [ ] `https://cabosailing.com/travel-guide/is-cabo-safe/`
2. For each: click **"Request Indexing"**
3. This accelerates Google discovering the new pages (normal crawl can take days)

---

### 11. Post-cutover smoke test

**Mobile + Desktop (incognito):**
- [ ] Homepage loads on phone and desktop — no layout breaks, images visible
- [ ] Navigation menu opens and all links work
- [ ] Footer links resolve (tours, fleet, contact)

**Booking flow:**
- [ ] Click a CTA on `/private-sunset/` — Rezdy booking modal opens
- [ ] Submit a test inquiry on `/contact/` — confirm email received

**Content:**
- [ ] Load 5 random travel guide articles — no 404s:
  - `/travel-guide/is-cabo-safe/`
  - `/travel-guide/can-you-swim-in-cabo-san-lucas/`
  - `/travel-guide/best-time/`
  - `/travel-guide/pelican-rock-snorkeling/`
  - `/travel-guide/cabo-on-a-budget/`
- [ ] Language switcher: click ES on homepage → `/es/` loads in Spanish
- [ ] Language switcher: click EN on `/es/` → returns to English homepage

**Technical:**
- [ ] View page source on homepage — no `cdn.tailwindcss.com` reference
- [ ] `/_astro/*.css` stylesheet loads (build-time Tailwind)
- [ ] Prices display correctly on tour pages (prices.js fetches `/data/prices.json`)

---

### 12. Launch Checklist reference

See the **"Launch Checklist — new.cabosailing.com to cabosailing.com"** Google Sheet in the **Website - CaboSailing.com** Drive folder for the broader 49-step launch plan covering DNS records, MX handling, pre-cutover backup, rollback procedure, and first-2-weeks monitoring. This CUTOVER.md complements but does not replace that checklist.
