# App Store Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move FreshKeep from a web MVP toward an iOS App Store-ready codebase by addressing release bundle hygiene, mobile packaging, storage, notifications, and failure handling.

**Architecture:** Keep the React app as the UI layer and add small platform adapters for app metadata, native capability detection, notifications, image storage, and persistence. Web remains a working fallback; Capacitor provides the iOS shell foundation when native dependencies are available.

**Tech Stack:** React, Vite, TypeScript, React Router, Node test runner, Capacitor.

---

### Task 1: Release Bundle And Compliance Basics

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/index.css`
- Modify: `src/features/inventory/model.ts`
- Modify: `src/app/AppShell.tsx`
- Modify: `src/pages/Profile.tsx`
- Modify: `src/pages/About.tsx`
- Create: `src/data/app-metadata.ts`
- Test: `tests/app-store-readiness.test.mjs`

- [ ] Write tests that assert fallback/sample data and metadata do not depend on external demo asset URLs.
- [ ] Verify the tests fail before implementation because the app still references external demo URLs or missing metadata.
- [ ] Add local metadata and deterministic local placeholder assets.
- [ ] Gate `react-dev-locator` to development only and disable production sourcemaps.
- [ ] Update About/Profile to expose version, privacy/support contact, and local data deletion guidance.
- [ ] Run tests, lint, and build.

### Task 2: Capacitor Packaging Foundation

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `capacitor.config.ts`
- Modify: `src/App.tsx`
- Test: `tests/app-store-readiness.test.mjs`

- [ ] Add a test that verifies mobile builds use hash routing when enabled.
- [ ] Verify the test fails before the router helper exists.
- [ ] Install Capacitor dependencies if network access is approved.
- [ ] Add `capacitor.config.ts` with app id, app name, web dir, and iOS scheme.
- [ ] Add scripts for `cap:sync` and `cap:open:ios`.
- [ ] Introduce a router selector so web uses BrowserRouter and Capacitor/file builds can use HashRouter.
- [ ] Run tests, lint, and build.

### Task 3: Mobile-Ready Runtime Resilience

**Files:**
- Create: `src/app/ErrorBoundary.tsx`
- Create: `src/features/platform/runtime.ts`
- Create: `src/features/inventory/image-storage.ts`
- Create: `src/features/notifications/reminders.ts`
- Modify: `src/main.tsx`
- Modify: `src/stores/useInventoryStore.ts`
- Modify: `src/hooks/useAppSettings.ts`
- Modify: `src/pages/ItemForm.tsx`
- Modify: `src/pages/ReminderSettings.tsx`
- Modify: `src/pages/DataManagement.tsx`
- Test: `tests/app-store-readiness.test.mjs`

- [ ] Write tests for safe storage fallback, image size validation, and reminder scheduling plan generation.
- [ ] Verify the tests fail before implementation.
- [ ] Add safe localStorage wrappers that fail gracefully on quota/security errors.
- [ ] Add image upload validation and local object cleanup; keep filesystem integration behind a platform adapter.
- [ ] Add notification scheduling helpers and wire settings changes to explicit permission/scheduling flows.
- [ ] Add ErrorBoundary and user-facing failure states for share/import/storage errors.
- [ ] Run all tests, lint, and build.

### Self-Review

- Coverage: The plan maps to all previously listed code risks: production debug leakage, external demo assets, missing iOS packaging, route behavior, notification placeholders, fragile local storage, image Data URL risk, and missing failure handling.
- Scope: App Store Connect assets, certificates, TestFlight, screenshots, and actual Xcode archive remain outside this code-only plan.
- Ambiguity: iOS project generation depends on whether Capacitor dependencies can be installed and whether the current machine can run the iOS tooling.
