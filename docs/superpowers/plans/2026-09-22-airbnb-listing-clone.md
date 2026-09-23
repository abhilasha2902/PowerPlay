# Airbnb Listing Page Clone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pixel-perfect, desktop-only clone of an Airbnb listing page with three views — Listing Page, Photo Tour overlay, Lightbox overlay — driven entirely by static mock data, matching the extracted design spec exactly.

**Architecture:** React 19 function components with co-located CSS files (no CSS-in-JS, no UI framework — hand-written CSS so every value can be traced 1:1 to the spec table it came from). A single `App.tsx` owns overlay state (`photoTourOpen`, `lightboxOpen`, `lightboxIndex`) and renders `ListingPage` plus the two overlays conditionally. Design tokens (colors, font stack, container width, shadows) live in one `tokens.css` file as CSS custom properties, imported once globally, so every component references `var(--token)` instead of repeating literals. Interactive behavior (keyboard nav, focus trap, scroll lock) is factored into three small hooks shared by both overlays.

**Tech Stack:** Vite 8, React 19, TypeScript, Vitest + @testing-library/react for interaction tests, hand-written CSS (no framework/library).

**Spec:** `C:\Users\kumar\Downloads\airbnb-clone-design-spec.md`

## Global Constraints

- Desktop only — do not implement anything from Spec Section 5 (Responsive Breakpoints). No media queries, no mobile hero-grid collapse, no sidebar hiding.
- Container max-width: `1280px` (`--container`), side padding `80px` (only the `≥1129px` desktop rule from spec 1.4 applies).
- Global font stack (spec 1.1/1.2): `"Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, "system-ui", Roboto, "Helvetica Neue", sans-serif` — no font file is bundled (not provided by spec), so the stack falls through to system fonts; do not substitute a different primary family.
- All colors, shadows, and the container width must be defined once as CSS custom properties in `src/styles/tokens.css` (spec 1.2 table) and consumed via `var(--token)` everywhere — never re-declare a hex value in a component file.
- z-index: Photo Tour overlay `120` (spec 3.1), Lightbox overlay `140` (spec 4.1) — Lightbox must render above Photo Tour.
- Reduced motion (spec Appendix): under `prefers-reduced-motion: reduce`, all animation/transition durations collapse to `1ms`.
- No backend, no router — one `App.tsx` entry point, static imports from `src/data/*`.
- Mock data lives in `src/data/` as JSON/TS modules; components never hardcode listing content inline.
- Every interactive element (buttons, thumbnails, arrows) must be a real `<button>`/`<a>`, never a `<div onClick>` — this is required for the a11y-auditor checkpoints to pass.

---

## File Structure

```
src/
  styles/
    tokens.css              # :root custom properties (spec 1.2)
    global.css               # reset, body base type, focus-visible rules, scroll-lock class, reduced-motion
  types/
    listing.ts                # Listing, Photo, HostInfo, GuestFavourite interfaces
  data/
    generate-photos.mjs       # one-off script that writes photos.json (run once, not imported at runtime)
    photos.json                # 43 mock photo entries
    listing.json                # mock listing content (title, host, price, guest favourite)
  hooks/
    useScrollLock.ts
    useKeyboardMode.ts
    useFocusTrap.ts
  components/
    Navbar/Navbar.tsx, Navbar.css
    HeroGallery/HeroGallery.tsx, HeroGallery.css
    ListingHeader/ListingHeader.tsx, ListingHeader.css
    HostInfo/HostInfo.tsx, HostInfo.css
    GuestFavouriteCard/GuestFavouriteCard.tsx, GuestFavouriteCard.css
    ReserveWidget/ReserveWidget.tsx, ReserveWidget.css
    ListingPage/ListingPage.tsx, ListingPage.css
    PhotoTour/PhotoTourOverlay.tsx, PhotoTourOverlay.css, PhotoTourOverlay.test.tsx
    Lightbox/LightboxOverlay.tsx, LightboxOverlay.css, LightboxOverlay.test.tsx
  test/
    setup.ts                  # jest-dom matchers
  App.tsx
  main.tsx                    # existing Vite entry, updated to drop template boilerplate
```

---

### Task 1: Testing Foundation, Design Tokens & Mock Data

**Files:**
- Modify: `package.json`
- Create: `vite.config.ts` (extend existing with `test` block)
- Create: `src/test/setup.ts`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/types/listing.ts`
- Create: `src/data/generate-photos.mjs`
- Create: `src/data/photos.json`
- Create: `src/data/listing.json`
- Modify: `src/main.tsx`
- Note: `src/App.tsx`, `src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png` are left untouched in this task (the template `App.tsx` still imports them) — Task 11 replaces `App.tsx` and deletes the now-unused assets together

**Interfaces:**
- Produces: `Photo { id: string; url: string; alt: string; category: string }`, `HostInfo { name: string; avatarUrl: string; meta: string }`, `GuestFavourite { title: string; description: string; ratingsCount: number; reviewsCount: number }`, `Listing { id: string; title: string; propertyType: string; rating: number; reviewCount: number; pricePerNight: number; nights: number; host: HostInfo; guestFavourite: GuestFavourite }` — all downstream components consume these.
- Produces: `photos.json` — a `Photo[]` of length 43 (matches spec's "1 of 43" counter).
- Produces: `.scroll-locked` class and `body.kbd` focus-visible rules in `global.css` — consumed by `useScrollLock` and `useKeyboardMode` in Task 8.

- [ ] **Step 1: Install test dependencies**

Run: `npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`

- [ ] **Step 2: Add test config to `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **Step 3: Add test script to `package.json`**

Add under `"scripts"`: `"test": "vitest run"`

- [ ] **Step 4: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 5: Create `src/styles/tokens.css`** (values copied verbatim from spec 1.2)

```css
:root {
  --ink: #222222;
  --muted: #6a6a6a;
  --muted2: #717171;
  --line: #dddddd;
  --line-soft: #ebebeb;
  --card-border: rgba(0, 0, 0, 0.08);
  --rausch: #ff385c;
  --reserve: linear-gradient(to right, #e61e4d 0%, #e31c5f 50%, #d70466 100%);
  --reserve-hover: linear-gradient(to right, #d81b5f 0%, #c31a5b 50%, #bd0463 100%);
  --grey100: #f7f7f7;
  --grey200: #f2f2f2;
  --grey300: #ebebeb;
  --container: 1280px;
  --font: "Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, "system-ui", Roboto, "Helvetica Neue", sans-serif;
  --shadow-card: 0 6px 16px rgba(0, 0, 0, 0.12);
  --shadow-hover: 0 2px 4px rgba(0, 0, 0, 0.18);
}
```

- [ ] **Step 6: Create `src/styles/global.css`**

```css
@import './tokens.css';

* {
  box-sizing: border-box;
}

html, body, #root {
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font);
  font-size: 14px;
  line-height: 1.43;
  font-weight: 400;
  color: var(--ink);
  background: #ffffff;
}

a, button {
  font-family: inherit;
  color: inherit;
}

a:focus, button:focus {
  outline: none;
}

body.kbd a:focus-visible,
body.kbd button:focus-visible {
  outline: 2px solid #222222;
  outline-offset: 2px;
  border-radius: 6px;
}

body.scroll-locked {
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
  }
}
```

- [ ] **Step 7: Create `src/types/listing.ts`**

```ts
export interface Photo {
  id: string
  url: string
  alt: string
  category: string
}

export interface HostInfo {
  name: string
  avatarUrl: string
  meta: string
}

export interface GuestFavourite {
  title: string
  description: string
  ratingsCount: number
  reviewsCount: number
}

export interface Listing {
  id: string
  title: string
  propertyType: string
  rating: number
  reviewCount: number
  pricePerNight: number
  nights: number
  host: HostInfo
  guestFavourite: GuestFavourite
}
```

- [ ] **Step 8: Create `src/data/generate-photos.mjs` and run it once to produce `photos.json`**

```js
import { writeFileSync } from 'node:fs'

const categories = ['Living room', 'Bedroom', 'Kitchen', 'Bathroom', 'Exterior', 'Views']
const photos = Array.from({ length: 43 }, (_, i) => {
  const category = categories[i % categories.length]
  return {
    id: `photo-${i + 1}`,
    url: `https://picsum.photos/id/${(1000 + i) % 1084}/1200/800`,
    alt: `${category} — photo ${i + 1} of 43`,
    category,
  }
})

writeFileSync(new URL('./photos.json', import.meta.url), JSON.stringify(photos, null, 2) + '\n')
console.log(`Wrote ${photos.length} photos to photos.json`)
```

Run: `node src/data/generate-photos.mjs`
Expected: prints `Wrote 43 photos to photos.json` and creates `src/data/photos.json`.

- [ ] **Step 9: Create `src/data/listing.json`**

```json
{
  "id": "listing-1",
  "title": "Sunlit loft with skyline views",
  "propertyType": "Entire loft in Brooklyn, New York",
  "rating": 4.92,
  "reviewCount": 187,
  "pricePerNight": 120,
  "nights": 5,
  "host": {
    "name": "Hosted by Sarah",
    "avatarUrl": "https://i.pravatar.cc/92?img=47",
    "meta": "Superhost · 4 years hosting"
  },
  "guestFavourite": {
    "title": "Guest favourite",
    "description": "One of the most loved homes on Airbnb, according to guests",
    "ratingsCount": 187,
    "reviewsCount": 187
  }
}
```

- [ ] **Step 10: Point `src/main.tsx` at the new global stylesheet**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 11: Verify the app still builds**

Run: `npm run build`
Expected: build succeeds. `src/App.tsx` still has the Vite template content at this point (with its own imports of `App.css`, `react.svg`, `vite.svg`, `hero.png`) — do not delete any of those files in this task, or the template build breaks. Task 11 replaces `App.tsx` and deletes the now-unused template assets in the same step.

- [ ] **Step 12: Commit**

Git is already initialized (repo root has a `.git` directory and a baseline commit) — do not run `git init`.

```bash
git add -A
git commit -m "chore: project foundation — tokens, types, mock data, test setup"
```

---

### Task 2: Navbar

**Files:**
- Create: `src/components/Navbar/Navbar.tsx`
- Create: `src/components/Navbar/Navbar.css`

**Interfaces:**
- Consumes: nothing (static content — logo, search pill, icon buttons).
- Produces: `Navbar` component, default export, no props — rendered once at the top of `ListingPage` in Task 7.

- [ ] **Step 1: Create `Navbar.css`** (spec 1.4 navbar row: height 88px, side padding 80px, max-width 1760px; spec 2.5 icon buttons; spec 2.6 search pill; spec 1.2 `--line-soft` border)

```css
.navbar {
  height: 88px;
  padding: 0 80px;
  max-width: 1760px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ebebeb;
}

.navbar-logo {
  color: var(--rausch);
  font-size: 24px;
  font-weight: 700;
}

.navbar-search {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid var(--line);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.078);
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
  background: #ffffff;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.navbar-search:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.navbar-icon-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.16s, transform 0.08s;
}

.navbar-icon-button:hover {
  background: var(--grey200);
}

.navbar-icon-button:active {
  transform: scale(0.9);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
```

- [ ] **Step 2: Create `Navbar.tsx`**

```tsx
import './Navbar.css'

export default function Navbar() {
  return (
    <header className="navbar">
      <span className="navbar-logo" aria-label="Airbnb clone home">airbnb</span>
      <button type="button" className="navbar-search">
        <span>Anywhere</span>
        <span aria-hidden="true">·</span>
        <span>Any week</span>
        <span aria-hidden="true">·</span>
        <span>Add guests</span>
      </button>
      <div className="navbar-right">
        <button type="button" className="navbar-icon-button" aria-label="Change language and region">
          🌐
        </button>
        <button type="button" className="navbar-icon-button" aria-label="Open main menu">
          ☰
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar
git commit -m "feat: add Navbar component"
```

- [ ] **Step 5: Checkpoint — dispatch `pixel-diff-reviewer` and `a11y-auditor` against `Navbar.tsx`/`Navbar.css`, compared to spec sections 1.4, 2.5, 2.6. Fix any reported deltas before moving to Task 3.**

---

### Task 3: Hero Gallery

**Files:**
- Create: `src/components/HeroGallery/HeroGallery.tsx`
- Create: `src/components/HeroGallery/HeroGallery.css`

**Interfaces:**
- Consumes: `Photo[]` (first 5 entries of `photos.json`), `onShowAllPhotos: () => void`, `onOpenLightboxAt: (index: number) => void`.
- Produces: `HeroGallery` component — used by `ListingPage` (Task 7); its "Show all photos" button and image clicks are what open the Photo Tour / Lightbox in Task 11.

- [ ] **Step 1: Create `HeroGallery.css`** (spec 1.3 grid, spec 2.1 hover overlay, spec 2.2 show-all-photos button)

```css
.hero-gallery {
  position: relative;
  display: grid;
  grid-template-columns: 35fr 17fr 17fr;
  grid-template-rows: 1fr 1fr;
  gap: 8px;
  aspect-ratio: 1120 / 494;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 48px;
}

.hero-cell {
  position: relative;
  padding: 0;
  border: none;
  background: #eeeeee;
  cursor: pointer;
  overflow: hidden;
}

.hero-cell:first-child {
  grid-row: span 2;
}

.hero-cell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: filter 0.2s ease;
}

.hero-cell::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  transition: background 0.2s ease;
}

.hero-cell:hover::after {
  background: rgba(0, 0, 0, 0.102);
}

.hero-cell:active {
  transform: scale(0.997);
  transition: transform 0.05s;
}

.show-all-photos {
  position: absolute;
  right: 24px;
  bottom: 24px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  height: auto;
  border-radius: 8px;
  border: 1px solid var(--ink);
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.149);
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  color: var(--ink);
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.show-all-photos:hover {
  background: var(--grey100);
}

.show-all-photos:active {
  transform: scale(0.97);
}
```

- [ ] **Step 2: Create `HeroGallery.tsx`**

```tsx
import type { Photo } from '../../types/listing'
import './HeroGallery.css'

interface HeroGalleryProps {
  photos: Photo[]
  onShowAllPhotos: () => void
  onOpenLightboxAt: (index: number) => void
}

export default function HeroGallery({ photos, onShowAllPhotos, onOpenLightboxAt }: HeroGalleryProps) {
  const cells = photos.slice(0, 5)

  return (
    <div className="hero-gallery">
      {cells.map((photo, index) => (
        <button
          key={photo.id}
          type="button"
          className="hero-cell"
          onClick={() => onOpenLightboxAt(index)}
          aria-label={`Open photo ${index + 1} in lightbox: ${photo.alt}`}
        >
          <img src={photo.url} alt={photo.alt} loading={index === 0 ? 'eager' : 'lazy'} />
        </button>
      ))}
      <button type="button" className="show-all-photos" onClick={onShowAllPhotos}>
        <span aria-hidden="true">⊞</span>
        Show all photos
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/HeroGallery
git commit -m "feat: add HeroGallery component"
```

- [ ] **Step 5: Checkpoint — dispatch `pixel-diff-reviewer` and `a11y-auditor` against `HeroGallery.tsx`/`HeroGallery.css`, compared to spec sections 1.3, 2.1, 2.2. Fix any reported deltas before moving to Task 4.**

---

### Task 4: Listing Header

**Files:**
- Create: `src/components/ListingHeader/ListingHeader.tsx`
- Create: `src/components/ListingHeader/ListingHeader.css`

**Interfaces:**
- Consumes: `title: string`, `propertyType: string`, `rating: number`, `reviewCount: number`.
- Produces: `ListingHeader` component — used by `ListingPage` (Task 7), rendered directly below `HeroGallery`.

- [ ] **Step 1: Create `ListingHeader.css`** (spec 1.1 title/subtitle/rating/share-save rows, spec 1.5 share/save buttons, spec 2.3 hover)

```css
.listing-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.listing-header-title {
  font-size: 26px;
  line-height: 30px;
  font-weight: 500;
  color: var(--ink);
  margin: 0 0 4px;
}

.listing-header-subtitle {
  font-size: 16px;
  font-weight: 500;
  color: var(--ink);
  margin: 0;
}

.listing-header-rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--ink);
  margin-top: 8px;
}

.listing-header-rating svg {
  width: 14px;
  height: 14px;
  fill: var(--ink);
}

.listing-header-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
  cursor: pointer;
  transition: background 0.15s;
}

.action-button:hover {
  background: var(--grey200);
}

.action-button:active {
  transform: scale(0.96);
  transition: transform 0.05s;
}

.action-button-icon {
  width: 16px;
  height: 16px;
}

.action-button-label {
  text-decoration: underline;
  text-underline-offset: 2px;
}
```

- [ ] **Step 2: Create `ListingHeader.tsx`**

```tsx
interface ListingHeaderProps {
  title: string
  propertyType: string
  rating: number
  reviewCount: number
}

import './ListingHeader.css'

export default function ListingHeader({ title, propertyType, rating, reviewCount }: ListingHeaderProps) {
  return (
    <div className="listing-header">
      <div>
        <h1 className="listing-header-title">{title}</h1>
        <p className="listing-header-subtitle">{propertyType}</p>
        <div className="listing-header-rating">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M15.1 1.58l-4.13 8.88-9.57 1.2a1 1 0 00-.57 1.74l7.15 6.7-1.9 9.9a1 1 0 001.47 1.06L16 25.85l8.45 4.21a1 1 0 001.47-1.06l-1.9-9.9 7.15-6.7a1 1 0 00-.57-1.74l-9.57-1.2L16.9 1.58a1 1 0 00-1.8 0z" />
          </svg>
          <span>{rating.toFixed(2)} · {reviewCount} reviews</span>
        </div>
      </div>
      <div className="listing-header-actions">
        <button type="button" className="action-button">
          <span className="action-button-icon" aria-hidden="true">⇪</span>
          <span className="action-button-label">Share</span>
        </button>
        <button type="button" className="action-button" aria-pressed="false">
          <span className="action-button-icon" aria-hidden="true">♡</span>
          <span className="action-button-label">Save</span>
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/ListingHeader
git commit -m "feat: add ListingHeader component"
```

- [ ] **Step 5: Checkpoint — dispatch `pixel-diff-reviewer` and `a11y-auditor` against `ListingHeader.tsx`/`ListingHeader.css`, compared to spec sections 1.1, 1.5, 2.3. Fix any reported deltas before moving to Task 5.**

---

### Task 5: Host Info Row & Guest Favourite Card

**Files:**
- Create: `src/components/HostInfo/HostInfo.tsx`
- Create: `src/components/HostInfo/HostInfo.css`
- Create: `src/components/GuestFavouriteCard/GuestFavouriteCard.tsx`
- Create: `src/components/GuestFavouriteCard/GuestFavouriteCard.css`

**Interfaces:**
- Consumes (`HostInfo`): `host: HostInfo` (from `types/listing.ts`).
- Consumes (`GuestFavouriteCard`): `favourite: GuestFavourite`.
- Produces: both components — used by `ListingPage` (Task 7) in the main content column, between `ListingHeader` and `ReserveWidget`'s row.

- [ ] **Step 1: Create `HostInfo.css`** (spec 1.4 host row: padding 26px 0, gap 16px, avatar 46px circle; spec 1.1 subtitle style for name, `.meta` style for meta line)

```css
.host-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 26px 0;
  border-bottom: 1px solid var(--line);
}

.host-info-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
}

.host-info-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--ink);
  margin: 0;
}

.host-info-meta {
  font-size: 14px;
  font-weight: 400;
  color: var(--muted2);
  margin: 4px 0 0;
}
```

- [ ] **Step 2: Create `HostInfo.tsx`**

```tsx
import type { HostInfo as HostInfoType } from '../../types/listing'
import './HostInfo.css'

interface HostInfoProps {
  host: HostInfoType
}

export default function HostInfo({ host }: HostInfoProps) {
  return (
    <div className="host-info">
      <img className="host-info-avatar" src={host.avatarUrl} alt={`${host.name} profile photo`} />
      <div>
        <p className="host-info-name">{host.name}</p>
        <p className="host-info-meta">{host.meta}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `GuestFavouriteCard.css`** (spec 1.4 card: padding 16px 28px, gap 22px, radius 16px; spec 1.1 title style; `--line-soft` border)

```css
.guest-favourite-card {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 16px 28px;
  border-radius: 16px;
  border: 1px solid var(--line-soft);
  margin: 24px 0;
}

.guest-favourite-title {
  font-size: 15px;
  line-height: 1.15;
  font-weight: 500;
  color: var(--ink);
  margin: 0 0 4px;
}

.guest-favourite-description {
  font-size: 14px;
  color: var(--muted2);
  margin: 0;
}
```

- [ ] **Step 4: Create `GuestFavouriteCard.tsx`**

```tsx
import type { GuestFavourite } from '../../types/listing'
import './GuestFavouriteCard.css'

interface GuestFavouriteCardProps {
  favourite: GuestFavourite
}

export default function GuestFavouriteCard({ favourite }: GuestFavouriteCardProps) {
  return (
    <div className="guest-favourite-card">
      <span aria-hidden="true" style={{ fontSize: 32 }}>🏅</span>
      <div>
        <p className="guest-favourite-title">{favourite.title}</p>
        <p className="guest-favourite-description">{favourite.description}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/HostInfo src/components/GuestFavouriteCard
git commit -m "feat: add HostInfo and GuestFavouriteCard components"
```

- [ ] **Step 7: Checkpoint — dispatch `pixel-diff-reviewer` and `a11y-auditor` against both components, compared to spec section 1.4/1.1. Fix any reported deltas before moving to Task 6.**

---

### Task 6: Reserve Widget

**Files:**
- Create: `src/components/ReserveWidget/ReserveWidget.tsx`
- Create: `src/components/ReserveWidget/ReserveWidget.css`

**Interfaces:**
- Consumes: `pricePerNight: number`, `nights: number`, `rating: number`, `reviewCount: number`.
- Produces: `ReserveWidget` component — used by `ListingPage` (Task 7) as the sticky sidebar column.

- [ ] **Step 1: Create `ReserveWidget.css`** (spec 1.4 widget card, spec 1.1 price typography, spec 1.6 reserve button, spec 2.4 hover)

```css
.reserve-widget {
  width: 372px;
  position: sticky;
  top: 100px;
  padding: 22px 24px 24px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow-card);
}

.reserve-widget-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 18px;
}

.reserve-widget-price {
  font-size: 22px;
  font-weight: 500;
  color: var(--ink);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.reserve-widget-price-unit {
  font-size: 15px;
  font-weight: 400;
  color: var(--ink);
}

.reserve-widget-fields {
  border: 1px solid #b0b0b0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.reserve-widget-field {
  padding: 10px 12px;
  border-bottom: 1px solid #b0b0b0;
}

.reserve-widget-field:last-child {
  border-bottom: none;
}

.reserve-widget-field-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--ink);
  text-transform: uppercase;
  display: block;
  margin-bottom: 2px;
}

.reserve-widget-field-value {
  font-size: 14px;
  color: var(--ink);
}

.reserve-button {
  width: 100%;
  height: 48px;
  padding: 0 24px;
  border-radius: 999px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  background: var(--reserve);
  cursor: pointer;
  transition: filter 0.15s;
}

.reserve-button:hover {
  background: var(--reserve-hover);
}

.reserve-button:active {
  transform: scale(0.985);
  transition: transform 0.05s;
}

.reserve-widget-subtotal {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--ink);
  margin-top: 16px;
}
```

- [ ] **Step 2: Create `ReserveWidget.tsx`**

```tsx
import './ReserveWidget.css'

interface ReserveWidgetProps {
  pricePerNight: number
  nights: number
  rating: number
  reviewCount: number
}

export default function ReserveWidget({ pricePerNight, nights, rating, reviewCount }: ReserveWidgetProps) {
  const total = pricePerNight * nights

  return (
    <aside className="reserve-widget" aria-label="Reservation">
      <div className="reserve-widget-price-row">
        <span className="reserve-widget-price">${pricePerNight}</span>
        <span className="reserve-widget-price-unit">night</span>
      </div>
      <div className="reserve-widget-fields">
        <div className="reserve-widget-field">
          <span className="reserve-widget-field-label">Check-in</span>
          <span className="reserve-widget-field-value">Add date</span>
        </div>
        <div className="reserve-widget-field">
          <span className="reserve-widget-field-label">Check-out</span>
          <span className="reserve-widget-field-value">Add date</span>
        </div>
        <div className="reserve-widget-field">
          <span className="reserve-widget-field-label">Guests</span>
          <span className="reserve-widget-field-value">1 guest</span>
        </div>
      </div>
      <button type="button" className="reserve-button">Reserve</button>
      <div className="reserve-widget-subtotal">
        <span>${pricePerNight} x {nights} nights</span>
        <span>${total}</span>
      </div>
      <div className="reserve-widget-subtotal">
        <span aria-hidden="true">★</span>
        <span>{rating.toFixed(2)} · {reviewCount} reviews</span>
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/ReserveWidget
git commit -m "feat: add ReserveWidget component"
```

- [ ] **Step 5: Checkpoint — dispatch `pixel-diff-reviewer` and `a11y-auditor` against `ReserveWidget.tsx`/`ReserveWidget.css`, compared to spec sections 1.4, 1.6, 2.4. Fix any reported deltas before moving to Task 7.**

---

### Task 7: Compose ListingPage

**Files:**
- Create: `src/components/ListingPage/ListingPage.tsx`
- Create: `src/components/ListingPage/ListingPage.css`

**Interfaces:**
- Consumes: `listing: Listing`, `photos: Photo[]`, `onShowAllPhotos: () => void`, `onOpenLightboxAt: (index: number) => void`.
- Produces: `ListingPage` component — the top-level view rendered by `App.tsx` (Task 11).

- [ ] **Step 1: Create `ListingPage.css`** (spec 1.4 container + main grid)

```css
.listing-page-container {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 80px;
}

.listing-page-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 372px;
  column-gap: 96px;
  align-items: start;
}
```

- [ ] **Step 2: Create `ListingPage.tsx`**

```tsx
import type { Listing, Photo } from '../../types/listing'
import Navbar from '../Navbar/Navbar'
import HeroGallery from '../HeroGallery/HeroGallery'
import ListingHeader from '../ListingHeader/ListingHeader'
import HostInfo from '../HostInfo/HostInfo'
import GuestFavouriteCard from '../GuestFavouriteCard/GuestFavouriteCard'
import ReserveWidget from '../ReserveWidget/ReserveWidget'
import './ListingPage.css'

interface ListingPageProps {
  listing: Listing
  photos: Photo[]
  onShowAllPhotos: () => void
  onOpenLightboxAt: (index: number) => void
}

export default function ListingPage({ listing, photos, onShowAllPhotos, onOpenLightboxAt }: ListingPageProps) {
  return (
    <div>
      <Navbar />
      <div className="listing-page-container">
        <HeroGallery photos={photos} onShowAllPhotos={onShowAllPhotos} onOpenLightboxAt={onOpenLightboxAt} />
        <div className="listing-page-grid">
          <main>
            <ListingHeader
              title={listing.title}
              propertyType={listing.propertyType}
              rating={listing.rating}
              reviewCount={listing.reviewCount}
            />
            <HostInfo host={listing.host} />
            <GuestFavouriteCard favourite={listing.guestFavourite} />
          </main>
          <ReserveWidget
            pricePerNight={listing.pricePerNight}
            nights={listing.nights}
            rating={listing.rating}
            reviewCount={listing.reviewCount}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/ListingPage
git commit -m "feat: compose ListingPage from section components"
```

- [ ] **Step 5: Checkpoint — dispatch `pixel-diff-reviewer` against the full assembled Listing Page (compare to spec sections 1.3, 1.4 end-to-end: hero margin-bottom 48px, grid column-gap 96px, sidebar sticky top 100px) and `a11y-auditor` against the whole page (tab order top-to-bottom through navbar → hero → header actions → host → reserve widget). Fix any reported deltas before moving to Task 8.**

---

### Task 8: Shared Overlay Hooks

**Files:**
- Create: `src/hooks/useScrollLock.ts`
- Create: `src/hooks/useKeyboardMode.ts`
- Create: `src/hooks/useFocusTrap.ts`
- Create: `src/hooks/useFocusTrap.test.tsx`

**Interfaces:**
- Produces: `useScrollLock(active: boolean): void` — toggles `document.body.classList` `'scroll-locked'`.
- Produces: `useKeyboardMode(): void` — adds `body.kbd` on first Tab keydown, mirrors spec 4.6 trigger condition. Call once in `App.tsx`.
- Produces: `useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, active: boolean): void` — traps Tab/Shift+Tab focus inside `containerRef.current` while `active` is true, and focuses the first focusable element inside it when `active` becomes true.
- Consumes (all three): nothing external — pure DOM/React APIs.

- [ ] **Step 1: Create `useScrollLock.ts`**

```ts
import { useEffect } from 'react'

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    document.body.classList.add('scroll-locked')
    return () => {
      document.body.classList.remove('scroll-locked')
    }
  }, [active])
}
```

- [ ] **Step 2: Create `useKeyboardMode.ts`**

```ts
import { useEffect } from 'react'

export function useKeyboardMode() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Tab') {
        document.body.classList.add('kbd')
      }
    }
    function handleMouseDown() {
      document.body.classList.remove('kbd')
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])
}
```

- [ ] **Step 3: Write the failing test for `useFocusTrap`**

```tsx
// src/hooks/useFocusTrap.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef } from 'react'
import { useFocusTrap } from './useFocusTrap'

function TestOverlay({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, active)
  return (
    <div>
      <button>outside</button>
      <div ref={ref}>
        <button>first</button>
        <button>last</button>
      </div>
    </div>
  )
}

describe('useFocusTrap', () => {
  it('moves focus into the container when activated', () => {
    render(<TestOverlay active={true} />)
    expect(screen.getByText('first')).toHaveFocus()
  })

  it('wraps Tab from the last focusable element back to the first', async () => {
    const user = userEvent.setup()
    render(<TestOverlay active={true} />)
    screen.getByText('last').focus()
    await user.tab()
    expect(screen.getByText('first')).toHaveFocus()
  })

  it('wraps Shift+Tab from the first focusable element to the last', async () => {
    const user = userEvent.setup()
    render(<TestOverlay active={true} />)
    expect(screen.getByText('first')).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByText('last')).toHaveFocus()
  })
})
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npm run test -- useFocusTrap`
Expected: FAIL — `useFocusTrap` does not exist yet (`Cannot find module './useFocusTrap'`).

- [ ] **Step 5: Implement `useFocusTrap.ts`**

```ts
import { useEffect } from 'react'
import type { RefObject } from 'react'

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    const getFocusable = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    const focusable = getFocusable()
    focusable[0]?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return
      const items = getFocusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [active, containerRef])
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm run test -- useFocusTrap`
Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add src/hooks
git commit -m "feat: add scroll-lock, keyboard-mode, and focus-trap hooks"
```

---

### Task 9: Photo Tour Overlay

**Files:**
- Create: `src/components/PhotoTour/PhotoTourOverlay.tsx`
- Create: `src/components/PhotoTour/PhotoTourOverlay.css`
- Create: `src/components/PhotoTour/PhotoTourOverlay.test.tsx`

**Interfaces:**
- Consumes: `photos: Photo[]`, `open: boolean`, `onClose: () => void`, `onOpenLightboxAt: (index: number) => void`, hooks `useScrollLock`, `useFocusTrap` from Task 8.
- Produces: `PhotoTourOverlay` component — mounted by `App.tsx` (Task 11); clicking a thumbnail calls `onOpenLightboxAt`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/PhotoTour/PhotoTourOverlay.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PhotoTourOverlay from './PhotoTourOverlay'
import type { Photo } from '../../types/listing'

const photos: Photo[] = [
  { id: 'p1', url: 'https://example.com/1.jpg', alt: 'Photo 1', category: 'Living room' },
  { id: 'p2', url: 'https://example.com/2.jpg', alt: 'Photo 2', category: 'Bedroom' },
]

describe('PhotoTourOverlay', () => {
  it('does not render dialog content when closed', () => {
    render(<PhotoTourOverlay photos={photos} open={false} onClose={vi.fn()} onOpenLightboxAt={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when Escape is pressed while open', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<PhotoTourOverlay photos={photos} open={true} onClose={onClose} onOpenLightboxAt={vi.fn()} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onOpenLightboxAt with the clicked thumbnail index', async () => {
    const user = userEvent.setup()
    const onOpenLightboxAt = vi.fn()
    render(<PhotoTourOverlay photos={photos} open={true} onClose={vi.fn()} onOpenLightboxAt={onOpenLightboxAt} />)
    await user.click(screen.getByRole('button', { name: /Photo 2/i }))
    expect(onOpenLightboxAt).toHaveBeenCalledWith(1)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- PhotoTourOverlay`
Expected: FAIL — `PhotoTourOverlay` does not exist yet.

- [ ] **Step 3: Create `PhotoTourOverlay.css`** (spec 3.1 container, 3.2 entrance animation, 3.3 header, 3.4 thumbnail grid, 3.5 category nav, 4.6 thumbnail focus offset)

```css
.photo-tour-overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  opacity: 0;
  visibility: hidden;
  transform: translateY(28px);
  transition: opacity 0.3s cubic-bezier(0.2, 0, 0, 1),
              transform 0.3s cubic-bezier(0.2, 0, 0, 1),
              visibility 0s linear 0.3s;
}

.photo-tour-overlay.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  transition: opacity 0.3s cubic-bezier(0.2, 0, 0, 1),
              transform 0.3s cubic-bezier(0.2, 0, 0, 1);
}

.photo-tour-header {
  height: 88px;
  padding: 0 32px;
  background: #ffffff;
  position: relative;
  flex-shrink: 0;
  z-index: 5;
  display: flex;
  align-items: center;
}

.photo-tour-title {
  position: absolute;
  left: 50%;
  transform: translate(-50%);
  font-size: 16px;
  font-weight: 500;
  color: var(--ink);
}

.photo-tour-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.16s;
}

.photo-tour-close:hover {
  background: var(--grey200);
}

.photo-tour-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 32px 32px;
}

.photo-tour-nav {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--line-soft);
  margin-bottom: 24px;
}

.photo-tour-nav a {
  font-size: 14px;
  font-weight: 500;
  padding: 22px 8px;
  color: var(--ink);
  text-decoration: none;
  position: relative;
}

.photo-tour-nav a:hover {
  color: #000000;
}

.photo-tour-nav a.active::after {
  content: '';
  position: absolute;
  height: 2px;
  background: var(--ink);
  left: 8px;
  right: 8px;
  bottom: 12px;
}

.photo-tour-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.photo-tour-thumb {
  flex-basis: calc((100% - 80px) / 5);
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
}

.photo-tour-thumb-image {
  aspect-ratio: 3 / 2;
  border-radius: 8px;
  overflow: hidden;
  background: #eeeeee;
}

.photo-tour-thumb-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1);
}

.photo-tour-thumb:hover .photo-tour-thumb-image img {
  transform: scale(1.03);
}

.photo-tour-thumb-image:focus-visible,
.photo-tour-thumb:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}
```

- [ ] **Step 4: Create `PhotoTourOverlay.tsx`**

```tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Photo } from '../../types/listing'
import { useScrollLock } from '../../hooks/useScrollLock'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import './PhotoTourOverlay.css'

interface PhotoTourOverlayProps {
  photos: Photo[]
  open: boolean
  onClose: () => void
  onOpenLightboxAt: (index: number) => void
}

export default function PhotoTourOverlay({ photos, open, onClose, onOpenLightboxAt }: PhotoTourOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const categories = useMemo(() => ['All photos', ...Array.from(new Set(photos.map((p) => p.category)))], [photos])
  const [activeCategory, setActiveCategory] = useState('All photos')

  useScrollLock(open)
  useFocusTrap(containerRef, open)

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const visiblePhotos = activeCategory === 'All photos' ? photos : photos.filter((p) => p.category === activeCategory)

  return (
    <div
      ref={containerRef}
      className={`photo-tour-overlay${open ? ' open' : ''}`}
      role={open ? 'dialog' : undefined}
      aria-modal={open ? true : undefined}
      aria-label="Photo tour"
      aria-hidden={!open}
    >
      {open && (
        <>
          <header className="photo-tour-header">
            <button type="button" className="photo-tour-close" onClick={onClose} aria-label="Close photo tour">
              ✕
            </button>
            <h2 className="photo-tour-title">Photo tour</h2>
          </header>
          <div className="photo-tour-body">
            <nav className="photo-tour-nav" aria-label="Photo categories">
              {categories.map((category) => (
                <a
                  key={category}
                  href="#"
                  className={category === activeCategory ? 'active' : ''}
                  aria-current={category === activeCategory ? 'true' : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    setActiveCategory(category)
                  }}
                >
                  {category}
                </a>
              ))}
            </nav>
            <div className="photo-tour-grid">
              {visiblePhotos.map((photo) => {
                const globalIndex = photos.findIndex((p) => p.id === photo.id)
                return (
                  <button
                    key={photo.id}
                    type="button"
                    className="photo-tour-thumb"
                    onClick={() => onOpenLightboxAt(globalIndex)}
                    aria-label={photo.alt}
                  >
                    <span className="photo-tour-thumb-image">
                      <img src={photo.url} alt={photo.alt} loading="lazy" />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test -- PhotoTourOverlay`
Expected: PASS (3 tests).

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/components/PhotoTour
git commit -m "feat: add PhotoTourOverlay with Escape-to-close and focus trap"
```

- [ ] **Step 8: Checkpoint — dispatch `pixel-diff-reviewer` (spec sections 3.1–3.5) and `a11y-auditor` (Escape closes, focus trapped, tab order through nav → thumbnails, alt text) against `PhotoTourOverlay.tsx`/`.css`. Fix any reported deltas before moving to Task 10.**

---

### Task 10: Lightbox Overlay

**Files:**
- Create: `src/components/Lightbox/LightboxOverlay.tsx`
- Create: `src/components/Lightbox/LightboxOverlay.css`
- Create: `src/components/Lightbox/LightboxOverlay.test.tsx`

**Interfaces:**
- Consumes: `photos: Photo[]`, `open: boolean`, `index: number`, `onClose: () => void`, `onNavigate: (index: number) => void`, hooks `useScrollLock`, `useFocusTrap` from Task 8.
- Produces: `LightboxOverlay` component — mounted by `App.tsx` (Task 11), rendered after `PhotoTourOverlay` in the DOM so its `z-index: 140` sits above it.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/Lightbox/LightboxOverlay.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LightboxOverlay from './LightboxOverlay'
import type { Photo } from '../../types/listing'

const photos: Photo[] = [
  { id: 'p1', url: 'https://example.com/1.jpg', alt: 'Photo 1', category: 'Living room' },
  { id: 'p2', url: 'https://example.com/2.jpg', alt: 'Photo 2', category: 'Bedroom' },
  { id: 'p3', url: 'https://example.com/3.jpg', alt: 'Photo 3', category: 'Kitchen' },
]

describe('LightboxOverlay', () => {
  it('shows the counter for the current index', () => {
    render(<LightboxOverlay photos={photos} open={true} index={0} onClose={vi.fn()} onNavigate={vi.fn()} />)
    expect(screen.getByText('1 of 3')).toBeInTheDocument()
  })

  it('calls onNavigate with the next index on ArrowRight', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<LightboxOverlay photos={photos} open={true} index={0} onClose={vi.fn()} onNavigate={onNavigate} />)
    await user.keyboard('{ArrowRight}')
    expect(onNavigate).toHaveBeenCalledWith(1)
  })

  it('calls onNavigate with the previous index on ArrowLeft', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<LightboxOverlay photos={photos} open={true} index={1} onClose={vi.fn()} onNavigate={onNavigate} />)
    await user.keyboard('{ArrowLeft}')
    expect(onNavigate).toHaveBeenCalledWith(0)
  })

  it('does not navigate past the last photo on ArrowRight', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<LightboxOverlay photos={photos} open={true} index={2} onClose={vi.fn()} onNavigate={onNavigate} />)
    await user.keyboard('{ArrowRight}')
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('calls onClose on Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<LightboxOverlay photos={photos} open={true} index={0} onClose={onClose} onNavigate={vi.fn()} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- LightboxOverlay`
Expected: FAIL — `LightboxOverlay` does not exist yet.

- [ ] **Step 3: Create `LightboxOverlay.css`** (spec 4.1 container, 4.2 animation, 4.3 header, 4.4 arrows, 4.6 focus ring)

```css
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 140;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease, visibility 0s linear 0.25s;
}

.lightbox-overlay.open {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.25s ease;
}

.lightbox-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  padding: 0 24px;
  z-index: 3;
  display: flex;
  align-items: center;
}

.lightbox-counter {
  font-size: 14px;
  color: var(--ink);
}

.lightbox-title {
  position: absolute;
  left: 50%;
  transform: translate(-50%);
  font-size: 16px;
  font-weight: 500;
  color: var(--ink);
}

.lightbox-controls {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.lightbox-icon-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.16s;
}

.lightbox-icon-button:hover {
  background: var(--grey200);
}

.lightbox-image-wrap {
  max-width: 80vw;
  max-height: 80vh;
}

.lightbox-image-wrap img {
  max-width: 80vw;
  max-height: 80vh;
  object-fit: contain;
  display: block;
}

.lightbox-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--ink);
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}

.lightbox-arrow:hover {
  background: var(--grey100);
}

.lightbox-arrow:disabled {
  opacity: 0.4;
  cursor: default;
}

.lightbox-arrow-prev {
  left: 20px;
}

.lightbox-arrow-next {
  right: 20px;
}
```

- [ ] **Step 4: Create `LightboxOverlay.tsx`**

```tsx
import { useEffect, useRef } from 'react'
import type { Photo } from '../../types/listing'
import { useScrollLock } from '../../hooks/useScrollLock'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import './LightboxOverlay.css'

interface LightboxOverlayProps {
  photos: Photo[]
  open: boolean
  index: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function LightboxOverlay({ photos, open, index, onClose, onNavigate }: LightboxOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const photo = photos[index]

  useScrollLock(open)
  useFocusTrap(containerRef, open)

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowRight' && index < photos.length - 1) {
        onNavigate(index + 1)
      } else if (event.key === 'ArrowLeft' && index > 0) {
        onNavigate(index - 1)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, index, photos.length, onClose, onNavigate])

  if (!photo) return null

  return (
    <div
      ref={containerRef}
      className={`lightbox-overlay${open ? ' open' : ''}`}
      role={open ? 'dialog' : undefined}
      aria-modal={open ? true : undefined}
      aria-label="Photo lightbox"
      aria-hidden={!open}
    >
      {open && (
        <>
          <header className="lightbox-header">
            <span className="lightbox-counter">{index + 1} of {photos.length}</span>
            <h2 className="lightbox-title">{photo.category}</h2>
            <div className="lightbox-controls">
              <button type="button" className="lightbox-icon-button" aria-label="Share this photo">⇪</button>
              <button type="button" className="lightbox-icon-button" onClick={onClose} aria-label="Close lightbox">✕</button>
            </div>
          </header>
          <button
            type="button"
            className="lightbox-arrow lightbox-arrow-prev"
            onClick={() => onNavigate(index - 1)}
            disabled={index === 0}
            aria-label="Previous photo"
          >
            ‹
          </button>
          <div className="lightbox-image-wrap">
            <img src={photo.url} alt={photo.alt} />
          </div>
          <button
            type="button"
            className="lightbox-arrow lightbox-arrow-next"
            onClick={() => onNavigate(index + 1)}
            disabled={index === photos.length - 1}
            aria-label="Next photo"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test -- LightboxOverlay`
Expected: PASS (5 tests).

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/components/Lightbox
git commit -m "feat: add LightboxOverlay with keyboard navigation and focus trap"
```

- [ ] **Step 8: Checkpoint — dispatch `pixel-diff-reviewer` (spec sections 4.1–4.4) and `a11y-auditor` (Escape closes, ←/→ navigate, focus trapped, disabled-arrow semantics at first/last photo, alt text) against `LightboxOverlay.tsx`/`.css`. Fix any reported deltas before moving to Task 11.**

---

### Task 11: Wire Up App.tsx

**Files:**
- Modify: `src/App.tsx` (replace template content entirely)
- Delete: `src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png` (only used by the old template `App.tsx`; safe to delete once it's replaced)

**Interfaces:**
- Consumes: `ListingPage` (Task 7), `PhotoTourOverlay` (Task 9), `LightboxOverlay` (Task 10), `useKeyboardMode` (Task 8), `listing.json`, `photos.json`.
- Produces: the app's root render tree — no further consumers, this is the entry point.

- [ ] **Step 1: Delete the now-unused template assets**

Run: `rm src/App.css src/assets/react.svg src/assets/vite.svg src/assets/hero.png`

- [ ] **Step 2: Replace `src/App.tsx`**

```tsx
import { useState } from 'react'
import ListingPage from './components/ListingPage/ListingPage'
import PhotoTourOverlay from './components/PhotoTour/PhotoTourOverlay'
import LightboxOverlay from './components/Lightbox/LightboxOverlay'
import { useKeyboardMode } from './hooks/useKeyboardMode'
import listingData from './data/listing.json'
import photosData from './data/photos.json'
import type { Listing, Photo } from './types/listing'

const listing = listingData as Listing
const photos = photosData as Photo[]

export default function App() {
  const [photoTourOpen, setPhotoTourOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useKeyboardMode()

  function openLightboxAt(index: number) {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <ListingPage
        listing={listing}
        photos={photos}
        onShowAllPhotos={() => setPhotoTourOpen(true)}
        onOpenLightboxAt={openLightboxAt}
      />
      <PhotoTourOverlay
        photos={photos}
        open={photoTourOpen}
        onClose={() => setPhotoTourOpen(false)}
        onOpenLightboxAt={openLightboxAt}
      />
      <LightboxOverlay
        photos={photos}
        open={lightboxOpen}
        index={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </>
  )
}
```

- [ ] **Step 3: Run the full test suite**

Run: `npm run test`
Expected: PASS (all suites — `useFocusTrap`, `PhotoTourOverlay`, `LightboxOverlay`).

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Manual smoke test**

Run: `npm run dev`, open the printed local URL, and confirm: hero image click opens Lightbox at that index; "Show all photos" opens Photo Tour; a Photo Tour thumbnail click opens Lightbox at the matching global index; ←/→ move between photos and the counter updates; Escape closes whichever overlay is open.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: wire ListingPage, PhotoTour, and Lightbox together in App"
```

---

### Task 12: Full-App Review Pass

**Files:**
- Modify: any file flagged by the checkpoint reviews below.

**Interfaces:**
- Consumes: the entire app built in Tasks 1–11.
- Produces: nothing new — this task only fixes findings from the two review subagents.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (leave running)

- [ ] **Step 2: Dispatch `pixel-diff-reviewer` against the full running app**

Compare the Listing Page, Photo Tour overlay (opened via "Show all photos"), and Lightbox overlay (opened via a hero image click) against every value in spec sections 1–4. Record the numbered list of deltas it returns.

- [ ] **Step 3: Dispatch `a11y-auditor` against the full app**

Audit `ListingPage.tsx`, `PhotoTourOverlay.tsx`, and `LightboxOverlay.tsx` together for WCAG 2.1 AA: full keyboard tab order across all three views, focus-visible rings, ARIA roles/labels, Lightbox Escape/←/→/focus-trap behavior, alt text everywhere. Record the numbered list of violations it returns.

- [ ] **Step 4: Fix every reported finding**

Apply the exact fixes from both reports. Re-run `npm run test` and `npm run build` after each fix batch to confirm nothing regressed.

- [ ] **Step 5: Re-dispatch both subagents once to confirm a clean pass**

Expected: `pixel-diff-reviewer` reports no remaining deltas; `a11y-auditor` reports no remaining violations.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix: address pixel-diff and a11y review findings"
```

---

## Self-Review Notes

- **Spec coverage:** 1.1 typography → Tasks 2–7 (each component's CSS cites its exact table rows), **except** the "Price value" (`._aykCAY`, 15px/1.2/500) and "Price sub-label" (`._FVmwas`, 13px/1.2/400, `"for 5 nights"`) rows — the real site appears to render these as a distinct compact price display elsewhere on the page (not the `ReserveWidget`'s own 22px price or 14px subtotal line, both built from other spec rows), and no task in this plan builds that additional element; left unassigned, not applied anywhere. 1.2 color tokens → Task 1 `tokens.css`. 1.3 hero grid → Task 3. 1.4 layout/spacing → Tasks 2–7 (container/grid in Task 7, per-component spacing in Tasks 2–6). 1.5 share/save → Task 4. 1.6 reserve button → Task 6, **except** the "Small variant" (40px height/14px font/`0 20px` padding) — likely the mobile-breakpoint reserve control per spec Section 5, correctly out of scope under the desktop-only Global Constraint, but not explicitly named as such until this correction. 2.1–2.6 hover states → embedded in the CSS of the matching component task (2.1/2.2 → Task 3, 2.3 → Task 4, 2.4/1.6 → Task 6, 2.5 → Task 2, 2.6 → Task 2, 2.7 → Task 9). Section 3 (Photo Tour) → Task 9. Section 4 (Lightbox) → Task 10, including 4.5 keyboard nav and 4.6 focus rings (global rule in Task 1, thumbnail-specific offset in Task 9). Section 5 (Responsive) → intentionally excluded per Global Constraints (desktop only, per user scope). Appendix reduced-motion → Task 1 `global.css`.
- **Correction (found by the final whole-branch review, post-Task-12):** the two 1.1 rows and the 1.6 small-variant row above were originally omitted from this note entirely rather than declared out of scope like the sub-nav and amenities grid were — an inaccurate completeness claim that a final review, not any of the twelve task reviews, was the only gate positioned to catch. No code changed as a result: verified the app genuinely doesn't need these rows (no compact secondary price display or mobile reserve button exists anywhere in this desktop-only build), so this is a documentation-only fix.
- **Out of scope, by design:** the sticky sub-nav mentioned only by height in spec 1.4 (`_JXzroy`, 88px) and the amenities grid mentioned only in the responsive table (spec 5.2) are not built — neither has enough non-responsive spec detail to implement without inventing content not in the source of truth.
- **Placeholder scan:** no TBD/TODO markers; every step has runnable code or an exact shell command.
- **Type consistency:** `Photo`, `HostInfo`, `GuestFavourite`, `Listing` defined once in Task 1 and used with identical field names through Tasks 3–11 (`onOpenLightboxAt(index: number)` and `onNavigate(index: number)` signatures match between `HeroGallery`, `PhotoTourOverlay`, `LightboxOverlay`, and `App.tsx`).
