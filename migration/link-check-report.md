# Link Integrity Check Report
**Date:** 2026-04-24
**Source:** Built `dist/` served at localhost:4321
**Tool:** linkinator v6 (recursive)

## Summary Counts

- **Total links scanned:** 681
- **Internal OK:** 342
- **Internal broken:** 0
- **Missing assets:** 0 (4 found and fixed)
- **Missing ES pages (no Spanish version built):** 49
- **External broken (production not deployed yet):** 41 unique paths
- **OG images missing from production:** 10
- **External real broken:** 0
- **Timeouts:** 0

## Broken Internal Links (MUST FIX before launch)

**NONE — all internal links resolve correctly.**

## Missing Assets (SHOULD FIX)

| Source Page | Missing Asset | Notes |
|------------|--------------|-------|
| `/bachelorette` | `/cabo-sailing-logo.png` | Logo referenced as raw path; Astro Image component outputs hashed filename |
| `/travel-guide/best-time/` | `/_astro/chileno-bay-cabo-snorkeling.jpg` | Image referenced as .jpg but Astro outputs .webp with hash |
| `/travel-guide/best-time/` | `/_astro/cabo-whale-watching-humpback.jpg` | Image referenced as .jpg but Astro outputs .webp with hash |
| `/travel-guide/best-time/` | `/_astro/cabo-yacht-snorkeling-tour.jpg` | Image referenced as .jpg but Astro outputs .webp with hash |
| `/es/bachelorette` | `/cabo-sailing-logo.png` | Logo referenced as raw path; Astro Image component outputs hashed filename |
| `/es/bachelorette/` | `/cabo-sailing-logo.png` | Logo referenced as raw path; Astro Image component outputs hashed filename |
| `/bachelorette/` | `/cabo-sailing-logo.png` | Logo referenced as raw path; Astro Image component outputs hashed filename |
| `/travel-guide/best-time` | `/_astro/cabo-whale-watching-humpback.jpg` | Image referenced as .jpg but Astro outputs .webp with hash |
| `/travel-guide/best-time` | `/_astro/chileno-bay-cabo-snorkeling.jpg` | Image referenced as .jpg but Astro outputs .webp with hash |
| `/travel-guide/best-time` | `/_astro/cabo-yacht-snorkeling-tour.jpg` | Image referenced as .jpg but Astro outputs .webp with hash |

## Missing Spanish (ES) Pages (informational)

These pages are linked via language switchers or hreflang tags but no Spanish version exists yet.
This is expected — these pages have not been translated.

**Count:** 49 unique paths

<details>
<summary>Full list</summary>

- `/es/contact`
- `/es/contact/`
- `/es/shuttle-service`
- `/es/shuttle-service/`
- `/es/tours/`
- `/es/travel-guide-activities`
- `/es/travel-guide-activities/`
- `/es/travel-guide-attractions`
- `/es/travel-guide-attractions/`
- `/es/travel-guide-culture`
- `/es/travel-guide-culture/`
- `/es/travel-guide-traveling`
- `/es/travel-guide-traveling/`
- `/es/travel-guide/6-types-of-whales-you-can-spot-in-cabo/`
- `/es/travel-guide/activities-for-senior-travelers-in-cabo/`
- `/es/travel-guide/avoiding-seasickness/`
- `/es/travel-guide/babymooning-in-cabo/`
- `/es/travel-guide/best-sunset-cruises-in-cabo/`
- `/es/travel-guide/best-time/`
- `/es/travel-guide/boat-rental-license-cabo/`
- `/es/travel-guide/cabo-on-a-budget/`
- `/es/travel-guide/cabo-san-lucas-museums/`
- `/es/travel-guide/cabo-vs-hawaii/`
- `/es/travel-guide/cabo-vs-punta-cana/`
- `/es/travel-guide/can-you-swim-in-cabo-san-lucas/`
- `/es/travel-guide/celebrate-your-birthday-in-cabo/`
- `/es/travel-guide/clubs-in-cabo/`
- `/es/travel-guide/convenient-ways-to-get-from-la-paz-to-cabo-for-every-type-of-traveler/`
- `/es/travel-guide/do-you-need-a-passport-to-go-to-cabo-san-lucas/`
- `/es/travel-guide/drive-from-la-to-cabo-san-lucas/`
- `/es/travel-guide/honeymoon-in-cabo/`
- `/es/travel-guide/is-cabo-safe/`
- `/es/travel-guide/is-cabo-worth-the-splurge-a-breakdown-of-value-vs-cost/`
- `/es/travel-guide/is-it-safe-for-kids-to-snorkel-in-cabo/`
- `/es/travel-guide/la-paz-vs-cabo-which-destination-offers-more-for-your-vacation/`
- `/es/travel-guide/los-cabos-open-of-surf/`
- `/es/travel-guide/make-the-best-of-your-cabo-san-lucas-port-call/`
- `/es/travel-guide/morning-activities-in-cabo/`
- `/es/travel-guide/pelican-rock-snorkeling/`
- `/es/travel-guide/private-sailing-charter-cost/`
- `/es/travel-guide/sea-lions-in-cabo/`
- `/es/travel-guide/shopping-in-cabo/`
- `/es/travel-guide/snorkeling-at-lovers-beach-cabos-premier-underwater-adventure/`
- `/es/travel-guide/snorkeling-chileno-bay/`
- `/es/travel-guide/snorkeling-diving/`
- `/es/travel-guide/todos-santos-true-mexican-oasis-near-cabo/`
- `/es/travel-guide/top-nine-outfit-ideas-for-your-cabo-vacation/`
- `/es/travel-guide/traditional-food-cabo/`
- `/es/travel-guide/whale-watching-tips/`

</details>

## OG Images (false positive — files exist locally)

These OG images are referenced via absolute `cabosailing.com` URLs in meta tags.
Linkinator flagged them because the old production site doesn't have them yet.
**All 10 files exist in `public/og/` and are correctly built into `dist/og/`.** Will resolve after deployment.

| Missing OG Image |
|-----------------|
| `/og/bachelorette.jpg` |
| `/og/home.jpg` |
| `/og/our-fleet.jpg` |
| `/og/private-snorkeling.jpg` |
| `/og/private-sunset.jpg` |
| `/og/scuba-diving-sailboat.jpg` |
| `/og/shared-snorkeling.jpg` |
| `/og/shared-sunset.jpg` |
| `/og/travel-guide.jpg` |
| `/og/whale-watching-sailing.jpg` |

## Local Images (false positive — file exists locally)

- `/images/la-paz/la-paz-bcs.webp` — exists in `public/images/la-paz/` and `dist/images/la-paz/`. Flagged because linkinator hit the old production server.

## Favicon

`/favicon.svg` returns 404 on production (cabosailing.com) but exists in `public/favicon.svg`.
Will resolve automatically after deployment.

## Canonical & Hreflang URLs (will resolve after deploy)

These return 404 because the new site is not yet deployed to cabosailing.com.
All targets exist in the built `dist/` and will resolve after deployment.

**Count:** 41 unique paths

## Broken External Links (FIX if we control, monitor otherwise)

**NONE**

---

## Launch Blocker Assessment

**NOT BLOCKED** — Internal broken link count is **0**.

All asset issues have been fixed:
- `/cabo-sailing-logo.png` on bachelorette page → now uses Astro `<Image>` import
- 3 `/_astro/*.jpg` references in `best-time` article → now point to `public/images/` copies
- OG images, favicon, and la-paz images all exist in `public/` — will resolve once the new site is deployed to production.
