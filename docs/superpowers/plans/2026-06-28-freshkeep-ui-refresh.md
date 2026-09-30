# FreshKeep UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle FreshKeep to match the provided rounded mobile wellness-app reference and make inventory care feel more playful.

**Architecture:** Keep the existing React Router, Zustand store, and inventory model intact. Refresh the presentation layer through focused edits to the shell, home dashboard, shared cards, bottom navigation, insights, profile, and global CSS.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, lucide-react, Vite.

---

### Task 1: Visual System

**Files:**
- Modify: `src/index.css`

- [ ] Replace the glass/ambient style with a white mobile-app canvas, softer shadows, candy card tones, black bottom navigation, compact rounded controls, and stable mobile dimensions.
- [ ] Keep existing utility class names where possible so form/detail pages inherit the new style without broad rewrites.

### Task 2: App Shell And Bottom Navigation

**Files:**
- Modify: `src/app/AppShell.tsx`
- Modify: `src/components/BottomNav.tsx`

- [ ] Replace the oversized page header with a compact mobile header inspired by the reference image.
- [ ] Use avatar, greeting, page title, search, notifications, and add buttons as route-appropriate controls.
- [ ] Restyle bottom navigation as a black pill with icon-only visual controls and accessible labels.

### Task 3: Fun Home Dashboard

**Files:**
- Modify: `src/pages/Home.tsx`

- [ ] Add a Daily Fresh Quest hero card with playful progress copy, overlapping item avatars, and food imagery.
- [ ] Add a date strip and "your plan" cards that turn expiring inventory into friendly tasks.
- [ ] Keep links to inventory and item details functional.

### Task 4: Shared Cards And Secondary Pages

**Files:**
- Modify: `src/components/InventoryCard.tsx`
- Modify: `src/components/OverviewMetric.tsx`
- Modify: `src/pages/Inventory.tsx`
- Modify: `src/pages/Insights.tsx`
- Modify: `src/pages/Profile.tsx`

- [ ] Make item cards more tactile and colorful with image bubbles, status chips, and concise task language.
- [ ] Align inventory filters, metric cards, insights cards, and profile settings with the same rounded wellness-app language.

### Task 5: Verify

**Commands:**
- Run: `npm run check`
- Run: `npm run build`
- Start: `npm run dev -- --host 127.0.0.1`
- Browser verify the home page in the in-app browser.
