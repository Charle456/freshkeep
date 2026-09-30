# FreshKeep Offline MVP Design

## Goal

FreshKeep should become a useful single-device shelf-life manager before App Store packaging work begins. The MVP keeps all data local, works offline, and turns the current placeholder profile actions into real secondary pages.

## Scope

- Add secondary pages for reminder settings, data management, category management, and about/privacy.
- Add persistent local settings for reminder window, reminder toggles, digest toggle, display name, and theme preference.
- Add data portability for JSON import/export and CSV export.
- Add item resolution so a user can mark an item as used, discarded, donated, or restored to active tracking.
- Keep login, cloud sync, shared households, push notification delivery, barcode databases, and native iOS packaging out of this iteration.

## Architecture

The app remains React 18, Vite, React Router, Tailwind CSS, and localStorage. Pure behavior lives in small feature modules under `src/features`, with React pages calling those helpers through the existing store patterns. Inventory data remains the source of truth for dashboard, list, detail, and insights calculations.

## Data Model

Inventory records gain optional resolution fields:

- `resolvedAt`
- `resolution`
- `resolutionNote`

Resolved items stay in history and exports, but they are excluded from urgent home tasks and counted separately in insights. Restoring an item clears the resolution fields and returns it to active tracking.

## Testing

Because this repository does not yet include Vitest or Playwright, this iteration adds Node built-in tests that run TypeScript modules with Node 24's `--experimental-strip-types`. The suite covers pure model behavior: expiry decoration, item resolution, settings normalization, JSON import/export, and CSV escaping.

## Verification

Run:

- `npm run test:model`
- `npm run check`
- `npm run lint`
- `npm run build`

Manual smoke test:

- Add an item.
- Mark it handled from detail.
- Confirm the home task queue changes.
- Export JSON and CSV from data management.
- Import JSON back into local records.
- Change reminder settings and confirm they persist after reload.
