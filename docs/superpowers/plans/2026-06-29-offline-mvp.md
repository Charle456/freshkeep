# FreshKeep Offline MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a useful single-device FreshKeep MVP with real secondary pages, data portability, persistent settings, and item resolution.

**Architecture:** Keep the existing React Router, localStorage-backed store, and Tailwind mobile UI. Add small pure modules for settings and data portability, expand the inventory model for resolved items, and wire new pages through `App.tsx` and Profile links.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Node built-in test runner.

---

### Task 1: Test Contracts

**Files:**
- Create: `tests/inventory-model.test.mjs`
- Create: `tests/settings-model.test.mjs`
- Modify: `package.json`

- [ ] Add Node tests for item resolution, import/export, CSV escaping, and settings normalization.
- [ ] Add `test:model` script using `node --experimental-strip-types --test tests/*.test.mjs`.
- [ ] Run `npm run test:model` and confirm the first run fails because the new APIs are not implemented yet.

### Task 2: Inventory Data Contracts

**Files:**
- Modify: `src/features/inventory/model.ts`
- Create: `src/features/inventory/data-portability.ts`

- [ ] Add optional resolution fields to inventory records.
- [ ] Add helpers to resolve and restore items.
- [ ] Add JSON import/export and CSV export helpers.
- [ ] Keep invalid imports from replacing user data.
- [ ] Run `npm run test:model` and confirm inventory tests pass.

### Task 3: Settings Model

**Files:**
- Create: `src/features/settings/model.ts`
- Create: `src/hooks/useAppSettings.ts`

- [ ] Add default settings and normalization.
- [ ] Persist settings in localStorage.
- [ ] Support reminder day changes and profile name edits.
- [ ] Run `npm run test:model` and confirm settings tests pass.

### Task 4: Store Operations

**Files:**
- Modify: `src/stores/useInventoryStore.ts`

- [ ] Add `replaceItems`, `resetSampleItems`, `clearItems`, `resolveItem`, and `restoreItem`.
- [ ] Preserve current localStorage behavior and initialization.
- [ ] Ensure import and reset update the same store state used by all pages.

### Task 5: Secondary Pages

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/app/AppShell.tsx`
- Modify: `src/pages/Profile.tsx`
- Create: `src/pages/ReminderSettings.tsx`
- Create: `src/pages/DataManagement.tsx`
- Create: `src/pages/CategoryManagement.tsx`
- Create: `src/pages/About.tsx`

- [ ] Add routes and titles for all secondary pages.
- [ ] Convert Profile settings rows into real links.
- [ ] Build Reminder Settings page with persistent local controls.
- [ ] Build Data Management page with JSON export/import, CSV export, reset, and clear actions.
- [ ] Build Category Management page with usage counts and rename support.
- [ ] Build About/Privacy page explaining local-only data.

### Task 6: Active/Resolved UI

**Files:**
- Modify: `src/pages/Home.tsx`
- Modify: `src/pages/Inventory.tsx`
- Modify: `src/pages/ItemDetail.tsx`
- Modify: `src/pages/Insights.tsx`
- Modify: `src/components/InventoryCard.tsx`
- Modify: `src/index.css`

- [ ] Exclude resolved items from urgent home tasks.
- [ ] Show resolved items as history in inventory filters.
- [ ] Add detail actions for used, discarded, donated, and restore.
- [ ] Update insights counts for active and handled items.
- [ ] Add CSS for resolved badges and danger actions.

### Task 7: Verification

**Commands:**
- Run: `npm run test:model`
- Run: `npm run check`
- Run: `npm run lint`
- Run: `npm run build`

- [ ] Fix any test, type, lint, or build failures.
- [ ] Start the dev server if browser verification is needed.
