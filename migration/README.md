# Migration Data

This folder holds the travel-guide migration plan and its machine-readable derivatives.

## Files

| File | Purpose |
|------|---------|
| `Travel_Guide_Migration_Plan_v2.xlsx` | **Source of truth.** Downloaded from the Google Sheet. |
| `articles.json` | Array of ranked articles extracted from the "Articles — Ranked" sheet (non-article rows excluded). |
| `redirects.json` | Array of 301 redirects extracted from the "301 Redirects" sheet (empty-from rows excluded). |

## Re-generating the JSON files

After updating the Google Sheet:

1. File → Download → Microsoft Excel (.xlsx) and overwrite `Travel_Guide_Migration_Plan_v2.xlsx`.
2. Ask Claude Code to re-run the migration parse task, or run the same openpyxl script used to produce the JSONs initially.
