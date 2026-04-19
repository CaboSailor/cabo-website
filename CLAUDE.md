# Cabo Sailing — Main Production Site

This is the main Cabo Sailing website, built with **Astro 6**. It lives in the root directory of this repository.

The `astro-test/` directory has been retired — all source code was moved to the root and the old static HTML files have been removed.

## Deployment

Deployment is automated via **GitHub Actions** to **FastComet** hosting.

- Pushing to `main` triggers a build and FTP deploy (`.github/workflows/deploy.yml`).
- The built site (`dist/`) is deployed to the `new.cabosailing.com` subdomain.
- FTP credentials are stored as GitHub repository secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Build for production (output in `dist/`)
- `npm run preview` — Preview the production build locally

## Key directories

- `src/pages/` — Page routes
- `src/components/` — Reusable components
- `src/layouts/` — Layout templates
- `src/assets/` — Images, styles, and other assets
- `public/` — Static files served as-is (including `data/` and `js/`)
