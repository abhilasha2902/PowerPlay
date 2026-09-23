# Airbnb Listing Redesign (v2 spec) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a new, more detailed design spec to the already-shipped Airbnb listing clone (branch `feature/airbnb-listing-clone`, PR open): redesigned Navbar, refined hero gallery/title row, a full Photo Tour rewrite (room-directory + anchor-scroll instead of category filter), Lightbox header/layout updates, new mock listing content (new property, INR pricing, room-based photo data), and new responsive breakpoints for several sections.

**Architecture:** Same as the existing app — React 19 function components, co-located CSS, no UI framework, CSS custom properties for tokens (all required tokens already exist in `src/styles/tokens.css`, verified — no changes needed there). This plan extends existing components in place; no new top-level architecture.

**Tech Stack:** Same as existing (Vite, React 19, TypeScript, Vitest + RTL).

**Spec:** This plan argues from the user's pasted v2 spec (reproduced inline per task below, since it has no separate file) plus two explicit user rulings on assets:
- **Logo:** NOT the real Airbnb Bélo trademark. Use a plain text wordmark "airbnb", `color:#ff385c`, `font-weight:800`, `font-size:24px`, plus a simple flame-inspired geometric SVG icon in the same color — clearly not Airbnb's real logo.
- **Photos:** Real, verified Unsplash URLs (not scraped from the live reference site), one per new "room" category. Verified via curl (all HTTP 200) before this plan was written:
  - Living room 1: `https://images.unsplash.com/photo-1758448755856-01d3add0177b`
  - Living room 2: `https://images.unsplash.com/photo-1749930206000-179d0b85aa7e`
  - Full kitchen: `https://images.unsplash.com/photo-1764526624453-db32c24eca55`
  - Bedroom: `https://images.unsplash.com/photo-1746549855427-57e6da7040db`
  - Full bathroom: `https://images.unsplash.com/photo-1754574741164-a41418029cfb`
  - Gym: `https://images.unsplash.com/photo-1758957646695-ec8bce3df462`
  - Exterior: `https://images.unsplash.com/photo-1721815693498-cc28507c0ba2`
  - Pool: `https://images.unsplash.com/photo-1680013995061-2d6d1f3ab417`
  - Additional photos: `https://images.unsplash.com/photo-1645587593689-e7cde7c5d9db` (used twice, see Task 13 — the "Additional photos" room needs 2+ photos to exercise the extra-photos grid layout; reusing the exterior photo a second time for photo #2 rather than sourcing a 10th image)
  - All URLs get `?fm=jpg&q=80&w=1600&auto=format&fit=crop` appended for consistent sizing/quality.

## Global Constraints

- This plan supersedes the *content* of the original design-spec.md where they conflict (new property, new photos, new Photo Tour structure), but does NOT relitigate architecture decisions already reviewed and shipped (hooks, focus-trap, scroll-lock, overlay-stacking Escape guard, `inert` wrapping) — those stay as built unless a task below explicitly says otherwise.
- Desktop-first as before, but this v2 spec explicitly gives responsive breakpoint values for several sections (Navbar search pill/Become-a-host at ≤743px, Hero Gallery at ≤743px, two-column layout aside at ≤1128px, Photo Tour thumbnail grid at ≤1128px/≤743px, Photo Tour room sections at ≤1128px) — implement exactly these, matching the user's new explicit instruction. Do not add breakpoints beyond what's specified.
- No router, no backend — unchanged. "Become a host" link and the search pill remain non-navigating (real `<button>`, not `<a href="#">`, per the accessibility precedent established and fixed earlier this session).
- Every interactive element a real `<button>` (or `<a href>` only when it has a genuine target) — no `<div onClick>`, no dead `href="#"`. This bit the project twice already (Task 9's category nav, this same class of issue) — do not reintroduce it.
- Colors via `var(--token)` when a token exists; the spec's own literal values (`#222`, `#ccc`, `rgba(...)` overlays) that have no matching token stay literal, per the established precedent from the whole first round of this project.
- Save button's heart icon must turn `#ff385c` when active — this requires real toggle state (a `useState` in `ListingHeader`), reversing the earlier decision to leave Save non-interactive (that decision was correct given the old spec's silence; this new spec explicitly requires the visual state change).

---

## File Structure

```
src/
  types/listing.ts          # MODIFIED: Listing gains guests/bedrooms/beds/bathrooms; new Room/RoomPhoto types added; Photo type unchanged (category field repurposed to hold room name)
  data/
    listing.json             # MODIFIED: new title/property/price/guest counts
    rooms.json                 # NEW: 9 rooms, each with name/amenities/photos (real Unsplash URLs)
  components/
    Navbar/Navbar.tsx, Navbar.css                    # MODIFIED: full redesign
    ListingHeader/ListingHeader.tsx, ListingHeader.css  # MODIFIED: padding, Save toggle state
    HeroGallery/HeroGallery.tsx, HeroGallery.css       # MODIFIED: icon, padding, responsive
    ListingPage/ListingPage.tsx, ListingPage.css       # MODIFIED: responsive aside hiding
    PhotoTour/PhotoTourOverlay.tsx, PhotoTourOverlay.css  # REWRITTEN: room directory + sections
    Lightbox/LightboxOverlay.tsx, LightboxOverlay.css    # MODIFIED: header layout, image padding, arrow boundary style
  App.tsx                     # MODIFIED: build flat photos[] from rooms.json, pass rooms to PhotoTourOverlay
```

---

### Task 13: Mock Data & Types Overhaul

**Files:**
- Modify: `src/types/listing.ts`
- Modify: `src/data/listing.json`
- Create: `src/data/rooms.json`

**Interfaces:**
- Produces: `Room { id: string; name: string; amenities: string | null; photos: Photo[] }` — each room's `photos` array uses the existing `Photo` type (`id, url, alt, category`), with `category` set to the room's own `name` (so `LightboxOverlay`'s existing `photo.category` rendering — the room-name header — needs zero code changes).
- Produces: updated `Listing` with `guests: number; bedrooms: number; beds: number; bathrooms: number` added.
- Consumes (by later tasks): `App.tsx` (Task 20) flattens `rooms.json` into a single ordered `Photo[]` for Hero Gallery (first 5) and Lightbox (full array + index), and passes `rooms.json` as-is to `PhotoTourOverlay` (Task 18) for section rendering.

- [ ] **Step 1: Update `src/types/listing.ts`**

```ts
export interface Photo {
  id: string
  url: string
  alt: string
  category: string
}

export interface Room {
  id: string
  name: string
  amenities: string | null
  photos: Photo[]
}

export interface HostInfo {
  name: string
  avatarUrl: string
  meta: string
}

export interface GuestFavourite {
  title: string
  description: string
}

export interface Listing {
  id: string
  title: string
  propertyType: string
  guests: number
  bedrooms: number
  beds: number
  bathrooms: number
  rating: number
  reviewCount: number
  pricePerNight: number
  nights: number
  host: HostInfo
  guestFavourite: GuestFavourite
}
```

- [ ] **Step 2: Replace `src/data/listing.json`**

```json
{
  "id": "listing-1",
  "title": "Romantic Jacuzzi 1BHK Candolim | Mirashya UG10",
  "propertyType": "Entire serviced apartment in Candolim, India",
  "guests": 3,
  "bedrooms": 1,
  "beds": 1,
  "bathrooms": 1,
  "rating": 4.95,
  "reviewCount": 19,
  "pricePerNight": 4200,
  "nights": 5,
  "host": {
    "name": "Hosted by Sarah",
    "avatarUrl": "https://i.pravatar.cc/92?img=47",
    "meta": "Superhost · 4 years hosting"
  },
  "guestFavourite": {
    "title": "Guest favourite",
    "description": "One of the most loved homes on Airbnb, according to guests"
  }
}
```

(Price is a placeholder INR value — the pasted spec didn't give an exact nightly rate, only "use INR, match the reference currency display." ₹4,200/night is a reasonable placeholder for the property class; flag for the user to supply an exact figure if they have one.)

- [ ] **Step 3: Create `src/data/rooms.json`**

```json
[
  {
    "id": "living-room-1",
    "name": "Living room 1",
    "amenities": "Sofa · Air conditioning · Ceiling fan · TV",
    "photos": [
      { "id": "living-room-1-1", "url": "https://images.unsplash.com/photo-1758448755856-01d3add0177b?fm=jpg&q=80&w=1600&auto=format&fit=crop", "alt": "Living room 1", "category": "Living room 1" }
    ]
  },
  {
    "id": "living-room-2",
    "name": "Living room 2",
    "amenities": "Ceiling fan · Hot tub",
    "photos": [
      { "id": "living-room-2-1", "url": "https://images.unsplash.com/photo-1749930206000-179d0b85aa7e?fm=jpg&q=80&w=1600&auto=format&fit=crop", "alt": "Living room 2", "category": "Living room 2" }
    ]
  },
  {
    "id": "full-kitchen",
    "name": "Full kitchen",
    "amenities": "Refrigerator · Microwave · Cooking basics",
    "photos": [
      { "id": "full-kitchen-1", "url": "https://images.unsplash.com/photo-1764526624453-db32c24eca55?fm=jpg&q=80&w=1600&auto=format&fit=crop", "alt": "Full kitchen", "category": "Full kitchen" }
    ]
  },
  {
    "id": "bedroom",
    "name": "Bedroom",
    "amenities": "Bed · Air conditioning · Wardrobe",
    "photos": [
      { "id": "bedroom-1", "url": "https://images.unsplash.com/photo-1746549855427-57e6da7040db?fm=jpg&q=80&w=1600&auto=format&fit=crop", "alt": "Bedroom", "category": "Bedroom" }
    ]
  },
  {
    "id": "full-bathroom",
    "name": "Full bathroom",
    "amenities": "Bathtub · Hot water · Hair dryer",
    "photos": [
      { "id": "full-bathroom-1", "url": "https://images.unsplash.com/photo-1754574741164-a41418029cfb?fm=jpg&q=80&w=1600&auto=format&fit=crop", "alt": "Full bathroom", "category": "Full bathroom" }
    ]
  },
  {
    "id": "gym",
    "name": "Gym",
    "amenities": "Exercise equipment",
    "photos": [
      { "id": "gym-1", "url": "https://images.unsplash.com/photo-1758957646695-ec8bce3df462?fm=jpg&q=80&w=1600&auto=format&fit=crop", "alt": "Gym", "category": "Gym" }
    ]
  },
  {
    "id": "exterior",
    "name": "Exterior",
    "amenities": "Garden view · Parking",
    "photos": [
      { "id": "exterior-1", "url": "https://images.unsplash.com/photo-1721815693498-cc28507c0ba2?fm=jpg&q=80&w=1600&auto=format&fit=crop", "alt": "Exterior", "category": "Exterior" }
    ]
  },
  {
    "id": "pool",
    "name": "Pool",
    "amenities": "Pool",
    "photos": [
      { "id": "pool-1", "url": "https://images.unsplash.com/photo-1680013995061-2d6d1f3ab417?fm=jpg&q=80&w=1600&auto=format&fit=crop", "alt": "Pool", "category": "Pool" }
    ]
  },
  {
    "id": "additional-photos",
    "name": "Additional photos",
    "amenities": null,
    "photos": [
      { "id": "additional-1", "url": "https://images.unsplash.com/photo-1645587593689-e7cde7c5d9db?fm=jpg&q=80&w=1600&auto=format&fit=crop", "alt": "Additional photo 1", "category": "Additional photos" },
      { "id": "additional-2", "url": "https://images.unsplash.com/photo-1721815693498-cc28507c0ba2?fm=jpg&q=80&w=1600&auto=format&fit=crop", "alt": "Additional photo 2", "category": "Additional photos" }
    ]
  }
]
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc -p tsconfig.app.json --noEmit`
Expected: fails, because `App.tsx`, `ListingHeader.tsx`, and `ReserveWidget.tsx` still reference the old `Listing`/`Photo` shape (missing `guests`/`bedrooms`/etc. usage isn't required, but removed `GuestFavourite` fields and added `Listing` fields will not break compilation by themselves — TypeScript won't fail on unused new fields or on `photos.json` no longer being imported once Task 20 removes that import). This step is a checkpoint, not a hard gate — note any errors for Task 20 to resolve, don't fix other files' code in this task.

- [ ] **Step 5: Commit**

```bash
git add src/types/listing.ts src/data/listing.json src/data/rooms.json
git commit -m "feat: overhaul mock data — new listing content and room-based photo structure"
```

---

### Task 14: Navbar Redesign

**Files:**
- Modify: `src/components/Navbar/Navbar.tsx`
- Modify: `src/components/Navbar/Navbar.css`

**Interfaces:**
- Consumes: nothing (still a static component, no props).
- Produces: same default export, no prop changes — `ListingPage` (Task 17) renders it unchanged.

- [ ] **Step 1: Replace `Navbar.css` entirely**

```css
.navbar {
  position: relative;
  z-index: 50;
  border-bottom: 1px solid var(--line-soft);
  background: #ffffff;
  padding: 0 80px;
}

.navbar-inner {
  max-width: 1760px;
  margin: 0 auto;
  height: 88px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.navbar-logo {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--rausch);
}

.navbar-logo-icon {
  width: 24px;
  height: 24px;
}

.navbar-logo-text {
  font-size: 24px;
  font-weight: 800;
  color: var(--rausch);
}

.navbar-search {
  justify-self: center;
  display: inline-flex;
  align-items: center;
  height: 48px;
  padding: 0 8px;
  border: 1px solid var(--line);
  border-radius: 40px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.078);
  background: #ffffff;
  transition: box-shadow 0.2s ease;
}

.navbar-search:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.122);
}

.navbar-search-segment {
  border: none;
  background: none;
  padding: 0 16px;
  height: 48px;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 40px;
  color: var(--ink);
  cursor: pointer;
}

.navbar-search-segment.guests {
  color: var(--muted2);
  font-weight: 400;
}

.navbar-search-divider {
  width: 1px;
  height: 24px;
  background: var(--line);
}

.navbar-search-submit {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: var(--rausch);
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.navbar-right {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.navbar-host-link {
  font-size: 14px;
  font-weight: 500;
  padding: 12px 14px;
  border-radius: 22px;
  transition: background 0.18s;
  color: var(--ink);
  border: none;
  background: none;
  cursor: pointer;
}

.navbar-host-link:hover {
  background: var(--grey100);
}

.navbar-icon-button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: var(--grey200);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s;
  cursor: pointer;
  font-size: 16px;
}

.navbar-icon-button:hover {
  background: var(--grey300);
}

.navbar-icon-button:active {
  transform: scale(0.9);
}

@media (max-width: 743px) {
  .navbar-search,
  .navbar-host-link {
    display: none;
  }
}
```

- [ ] **Step 2: Replace `Navbar.tsx` entirely**

```tsx
import './Navbar.css'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button type="button" className="navbar-logo" aria-label="Airbnb clone home">
          <svg className="navbar-logo-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2c-2.5 3.5-6 8-6 12a6 6 0 0012 0c0-4-3.5-8.5-6-12zm0 15a3.5 3.5 0 01-3.5-3.5c0-.6.2-1.3.6-2.1.5.9 1.4 1.6 2.4 1.9-.1-1-.1-2.2.5-3.3.6 1.1.6 2.3.5 3.3 1-.3 1.9-1 2.4-1.9.4.8.6 1.5.6 2.1A3.5 3.5 0 0112 17z" />
          </svg>
          <span className="navbar-logo-text">airbnb</span>
        </button>

        <div className="navbar-search" role="search">
          <button type="button" className="navbar-search-segment">Anywhere</button>
          <span className="navbar-search-divider" aria-hidden="true" />
          <button type="button" className="navbar-search-segment">Anytime</button>
          <span className="navbar-search-divider" aria-hidden="true" />
          <button type="button" className="navbar-search-segment guests">Add guests</button>
          <button type="button" className="navbar-search-submit" aria-label="Search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="#ffffff" strokeWidth="2.5" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="navbar-right">
          <button type="button" className="navbar-host-link">Become a host</button>
          <button type="button" className="navbar-icon-button" aria-label="Change language and region">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <button type="button" className="navbar-icon-button" aria-label="Open main menu">
            <svg viewBox="0 0 32 32" width="16" height="16" aria-hidden="true">
              <line x1="4" y1="9" x2="28" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="4" y1="23" x2="28" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar
git commit -m "feat: redesign Navbar per v2 spec (grid layout, search pill, generic logo)"
```

- [ ] **Step 5: Checkpoint — dispatch `pixel-diff-reviewer` and `a11y-auditor` (via the general-purpose persona-embed workaround established earlier this session, since custom agent types aren't registered) against the new Navbar, comparing to this task's exact CSS values. Fix any reported deltas before moving to Task 15.**

---

### Task 15: ListingHeader — Padding + Interactive Save Toggle

**Files:**
- Modify: `src/components/ListingHeader/ListingHeader.tsx`
- Modify: `src/components/ListingHeader/ListingHeader.css`

**Interfaces:**
- Consumes: same props as before (`title, propertyType, rating, reviewCount`) — no prop shape change.
- Produces: same — used by `ListingPage` (Task 17) unchanged.

- [ ] **Step 1: Update `ListingHeader.css`** — change the row's padding and add the active-save-heart color rule

Find the existing `.listing-header` rule and change its `margin-bottom: 24px;` line to padding instead (per spec: "padding:32px 0 18px"):

```css
.listing-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 32px 0 18px;
}
```

Add a new rule (the existing `.action-button-icon` rule stays as-is):

```css
.action-button-icon.saved {
  color: #ff385c;
}
```

- [ ] **Step 2: Update `ListingHeader.tsx`** — add save toggle state, apply the `.saved` class and fill color conditionally

```tsx
import { useState } from 'react'

interface ListingHeaderProps {
  title: string
  propertyType: string
  rating: number
  reviewCount: number
}

import './ListingHeader.css'

export default function ListingHeader({ title, propertyType, rating, reviewCount }: ListingHeaderProps) {
  const [saved, setSaved] = useState(false)

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
          <span className="action-button-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M12 3v12M7 8l5-5 5 5M5 15v4a2 2 0 002 2h10a2 2 0 002-2v-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="action-button-label">Share</span>
        </button>
        <button
          type="button"
          className="action-button"
          aria-pressed={saved}
          onClick={() => setSaved((s) => !s)}
        >
          <span className={`action-button-icon${saved ? ' saved' : ''}`} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path
                d="M12 20s-7-4.35-9.5-8.5C1 8 2.5 4.5 6 4.5c2 0 3.5 1.2 4.5 2.7C11.5 5.7 13 4.5 15 4.5c3.5 0 5 3.5 3.5 7C19.5 15.65 12 20 12 20z"
                fill={saved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="action-button-label">Save</span>
        </button>
      </div>
    </div>
  )
}
```

Note: this reintroduces `aria-pressed`, which an earlier task review removed specifically because there was no toggle logic backing it (static `aria-pressed="false"` misrepresents state). That concern no longer applies — `saved` is real React state now, so `aria-pressed={saved}` is accurate.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Add a test** for the toggle behavior in a new `src/components/ListingHeader/ListingHeader.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ListingHeader from './ListingHeader'

describe('ListingHeader', () => {
  it('toggles the Save button\'s pressed state and heart fill on click', async () => {
    const user = userEvent.setup()
    render(<ListingHeader title="Test" propertyType="Test type" rating={4.5} reviewCount={10} />)
    const saveButton = screen.getByRole('button', { name: /save/i })
    expect(saveButton).toHaveAttribute('aria-pressed', 'false')
    await user.click(saveButton)
    expect(saveButton).toHaveAttribute('aria-pressed', 'true')
    await user.click(saveButton)
    expect(saveButton).toHaveAttribute('aria-pressed', 'false')
  })
})
```

- [ ] **Step 5: Run tests**

Run: `npm run test`
Expected: all pass including the new test.

- [ ] **Step 6: Commit**

```bash
git add src/components/ListingHeader
git commit -m "feat: add interactive Save toggle and update ListingHeader padding per v2 spec"
```

- [ ] **Step 7: Checkpoint — dispatch `pixel-diff-reviewer` and `a11y-auditor` against the updated `ListingHeader`. Fix any reported deltas before moving to Task 16.**

---

### Task 16: HeroGallery — Icon, Padding, Responsive

**Files:**
- Modify: `src/components/HeroGallery/HeroGallery.tsx`
- Modify: `src/components/HeroGallery/HeroGallery.css`

**Interfaces:** unchanged (`photos, onShowAllPhotos, onOpenLightboxAt`).

- [ ] **Step 1: Update `HeroGallery.css`** — change `.show-all-photos` padding to `7px 15px` (was `8px 12px`), and add the ≤743px responsive rule

Find `.show-all-photos { ... padding: 8px 12px; ... }` and change the padding line to `padding: 7px 15px;`.

Add at the end of the file:

```css
@media (max-width: 743px) {
  .hero-gallery {
    grid-template-columns: 1fr;
    grid-template-rows: 280px;
    height: 280px;
  }

  .hero-cell:not(:first-child) {
    display: none;
  }
}
```

- [ ] **Step 2: Update `HeroGallery.tsx`** — replace the show-all-photos icon with a 3×3 dot-grid SVG (9 circles), per spec

```tsx
      <button type="button" className="show-all-photos" onClick={onShowAllPhotos}>
        <svg viewBox="0 0 15 15" width="15" height="15" aria-hidden="true">
          {[2, 7.5, 13].flatMap((cy) =>
            [2, 7.5, 13].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.3" fill="currentColor" />)
          )}
        </svg>
        Show all photos
      </button>
```

(Replaces the existing 4-square grid SVG from the earlier icon-migration pass — the new spec is explicit about "3×3 dot-grid SVG (nine circles), 15×15px".)

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/HeroGallery
git commit -m "feat: update HeroGallery icon, padding, and responsive breakpoint per v2 spec"
```

- [ ] **Step 5: Checkpoint — dispatch `pixel-diff-reviewer` and `a11y-auditor` against the updated `HeroGallery`. Fix any reported deltas before moving to Task 17.**

---

### Task 17: Two-Column Layout Responsive Breakpoint

**Files:**
- Modify: `src/components/ListingPage/ListingPage.css`

**Interfaces:** unchanged.

- [ ] **Step 1: Add the ≤1128px responsive rule** to `ListingPage.css`

```css
@media (max-width: 1128px) {
  .listing-page-grid {
    grid-template-columns: 1fr;
  }

  .reserve-widget {
    display: none;
  }
}
```

(The `.reserve-widget` class lives in `ReserveWidget.css`, but this rule targets it from the layout file since it's a layout-level responsive decision, not a component-intrinsic style — consistent with how `.hero-cell` visibility was handled in Task 16.)

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/ListingPage/ListingPage.css
git commit -m "feat: hide reserve sidebar and collapse to single column at 1128px"
```

---

### Task 18: Photo Tour Overlay — Rewrite as Room Directory

**Files:**
- Modify: `src/components/PhotoTour/PhotoTourOverlay.tsx` (full rewrite)
- Modify: `src/components/PhotoTour/PhotoTourOverlay.css` (full rewrite)
- Modify: `src/components/PhotoTour/PhotoTourOverlay.test.tsx` (rewrite tests for the new structure)

**Interfaces:**
- Consumes: `photos: Photo[]` (flat, full list — for computing the global index passed to `onOpenLightboxAt`), `rooms: Room[]` (for rendering the thumbnail nav + room sections), `open: boolean`, `onClose: () => void`, `onOpenLightboxAt: (index: number) => void`. **Prop shape changes** — adds `rooms`. Task 20 (App.tsx) is the only caller and will be updated to match.
- Produces: same `PhotoTourOverlay` default export — used by `App.tsx` (Task 20).
- Behavior change: clicking a thumbnail-nav item now smooth-scrolls to that room's section instead of opening the Lightbox. Clicking an actual photo inside a room section opens the Lightbox at that photo's position in the full flat `photos` array.

- [ ] **Step 1: Write the failing tests first** — replace `PhotoTourOverlay.test.tsx` entirely

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PhotoTourOverlay from './PhotoTourOverlay'
import type { Photo, Room } from '../../types/listing'

const photos: Photo[] = [
  { id: 'p1', url: 'https://example.com/1.jpg', alt: 'Room A photo', category: 'Room A' },
  { id: 'p2', url: 'https://example.com/2.jpg', alt: 'Room B photo 1', category: 'Room B' },
  { id: 'p3', url: 'https://example.com/3.jpg', alt: 'Room B photo 2', category: 'Room B' },
]

const rooms: Room[] = [
  { id: 'room-a', name: 'Room A', amenities: 'Sofa · TV', photos: [photos[0]] },
  { id: 'room-b', name: 'Room B', amenities: 'Bed', photos: [photos[1], photos[2]] },
]

describe('PhotoTourOverlay', () => {
  it('does not render dialog content when closed', () => {
    render(<PhotoTourOverlay photos={photos} rooms={rooms} open={false} onClose={vi.fn()} onOpenLightboxAt={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when Escape is pressed while open', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<PhotoTourOverlay photos={photos} rooms={rooms} open={true} onClose={onClose} onOpenLightboxAt={vi.fn()} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders one thumbnail-nav button per room', () => {
    render(<PhotoTourOverlay photos={photos} rooms={rooms} open={true} onClose={vi.fn()} onOpenLightboxAt={vi.fn()} />)
    expect(screen.getAllByRole('button', { name: /^(Room A|Room B)$/ })).toHaveLength(2)
  })

  it('clicking a thumbnail-nav button does NOT open the lightbox', async () => {
    const user = userEvent.setup()
    const onOpenLightboxAt = vi.fn()
    // jsdom doesn't implement scrollIntoView; stub it so the click handler doesn't throw
    Element.prototype.scrollIntoView = vi.fn()
    render(<PhotoTourOverlay photos={photos} rooms={rooms} open={true} onClose={vi.fn()} onOpenLightboxAt={onOpenLightboxAt} />)
    await user.click(screen.getByRole('button', { name: 'Room B' }))
    expect(onOpenLightboxAt).not.toHaveBeenCalled()
  })

  it('clicking a room-section photo opens the lightbox at the correct global index', async () => {
    const user = userEvent.setup()
    const onOpenLightboxAt = vi.fn()
    render(<PhotoTourOverlay photos={photos} rooms={rooms} open={true} onClose={vi.fn()} onOpenLightboxAt={onOpenLightboxAt} />)
    await user.click(screen.getByRole('button', { name: 'Room B photo 2' }))
    expect(onOpenLightboxAt).toHaveBeenCalledWith(2)
  })

  it('renders room headings and amenities, omitting the amenities line when null', () => {
    const roomsWithNoAmenities: Room[] = [...rooms, { id: 'extra', name: 'Extra', amenities: null, photos: [photos[0]] }]
    render(<PhotoTourOverlay photos={photos} rooms={roomsWithNoAmenities} open={true} onClose={vi.fn()} onOpenLightboxAt={vi.fn()} />)
    expect(screen.getByText('Sofa · TV')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Extra' })).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -- PhotoTourOverlay`
Expected: FAIL — old component doesn't accept a `rooms` prop and has no thumbnail-nav/room-section structure.

- [ ] **Step 3: Rewrite `PhotoTourOverlay.css`**

```css
.photo-tour-overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: #ffffff;
  overflow-y: auto;
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
  display: flex;
  align-items: center;
  padding: 0 32px;
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.photo-tour-back {
  margin-left: -8px;
}

.photo-tour-title {
  position: absolute;
  left: 50%;
  transform: translate(-50%);
  font-size: 16px;
  font-weight: 500;
  color: var(--ink);
}

.photo-tour-header-actions {
  margin-left: auto;
  display: flex;
  gap: 2px;
}

.photo-tour-icon-button {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.16s, transform 0.08s;
}

.photo-tour-icon-button:hover {
  background: var(--grey200);
}

.photo-tour-icon-button:active {
  transform: scale(0.9);
}

.photo-tour-nav-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
  margin-bottom: 40px;
  padding: 0 32px;
}

.photo-tour-nav-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
}

.photo-tour-nav-item img {
  aspect-ratio: 106 / 100;
  border-radius: 8px;
  object-fit: cover;
  width: 100%;
  display: block;
  transition: transform 0.25s cubic-bezier(0.2, 0, 0, 1), filter 0.2s;
}

.photo-tour-nav-item:hover img {
  transform: scale(1.04);
  filter: brightness(0.94);
}

.photo-tour-nav-item:active img {
  transform: scale(0.99);
}

.photo-tour-nav-caption {
  font-size: 14px;
  color: var(--muted2);
}

@media (max-width: 1128px) {
  .photo-tour-nav-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 743px) {
  .photo-tour-nav-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.photo-tour-room {
  padding: 0 32px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 60px;
  align-items: start;
  padding-top: 16px;
  padding-bottom: 4px;
}

.photo-tour-room-info {
  position: sticky;
  top: 20px;
}

.photo-tour-room-heading {
  font-size: 32px;
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin: 0;
}

.photo-tour-room-amenities {
  font-size: 16px;
  color: var(--muted2);
  margin-top: 8px;
  line-height: 1.4;
}

.photo-tour-room-photos {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.photo-tour-room-photos-extra {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.photo-tour-photo {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  border-radius: 8px;
  overflow: hidden;
  background: #eeeeee;
  border: none;
  padding: 0;
  cursor: pointer;
}

.photo-tour-photo img {
  object-fit: cover;
  width: 100%;
  height: 100%;
  display: block;
}

@media (max-width: 1128px) {
  .photo-tour-room {
    grid-template-columns: 1fr;
  }

  .photo-tour-room-info {
    position: static;
  }
}
```

- [ ] **Step 4: Rewrite `PhotoTourOverlay.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import type { Photo, Room } from '../../types/listing'
import { useScrollLock } from '../../hooks/useScrollLock'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import './PhotoTourOverlay.css'

interface PhotoTourOverlayProps {
  photos: Photo[]
  rooms: Room[]
  open: boolean
  onClose: () => void
  onOpenLightboxAt: (index: number) => void
}

export default function PhotoTourOverlay({ photos, rooms, open, onClose, onOpenLightboxAt }: PhotoTourOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldRender, setShouldRender] = useState(open)

  useScrollLock(open)
  useFocusTrap(containerRef, open && shouldRender)

  useEffect(() => {
    if (open) {
      setShouldRender(true)
      return
    }
    const timer = setTimeout(() => setShouldRender(false), 300)
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  function scrollToRoom(roomId: string) {
    document.getElementById(`photo-tour-room-${roomId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div
      ref={containerRef}
      className={`photo-tour-overlay${open ? ' open' : ''}`}
      role={open ? 'dialog' : undefined}
      aria-modal={open ? true : undefined}
      aria-label="Photo tour"
      aria-hidden={!open}
    >
      {shouldRender && (
        <>
          <header className="photo-tour-header">
            <button type="button" className="photo-tour-icon-button photo-tour-back" onClick={onClose} aria-label="Close photo tour">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <polyline points="15 5 9 12 15 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h2 className="photo-tour-title">Photo tour</h2>
            <div className="photo-tour-header-actions">
              <button type="button" className="photo-tour-icon-button" aria-label="Share this listing">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M12 3v12M7 8l5-5 5 5M5 15v4a2 2 0 002 2h10a2 2 0 002-2v-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" className="photo-tour-icon-button" aria-label="Save this listing">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M12 20s-7-4.35-9.5-8.5C1 8 2.5 4.5 6 4.5c2 0 3.5 1.2 4.5 2.7C11.5 5.7 13 4.5 15 4.5c3.5 0 5 3.5 3.5 7C19.5 15.65 12 20 12 20z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </header>

          <nav className="photo-tour-nav-grid" aria-label="Jump to room">
            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                className="photo-tour-nav-item"
                onClick={() => scrollToRoom(room.id)}
              >
                <img src={room.photos[0].url} alt="" loading="lazy" />
                <span className="photo-tour-nav-caption">{room.name}</span>
              </button>
            ))}
          </nav>

          {rooms.map((room) => {
            const [firstPhoto, ...extraPhotos] = room.photos
            return (
              <section key={room.id} id={`photo-tour-room-${room.id}`} className="photo-tour-room">
                <div className="photo-tour-room-info">
                  <h3 className="photo-tour-room-heading">{room.name}</h3>
                  {room.amenities && <p className="photo-tour-room-amenities">{room.amenities}</p>}
                </div>
                <div className="photo-tour-room-photos">
                  <button
                    type="button"
                    className="photo-tour-photo"
                    onClick={() => onOpenLightboxAt(photos.findIndex((p) => p.id === firstPhoto.id))}
                    aria-label={firstPhoto.alt}
                  >
                    <img src={firstPhoto.url} alt="" loading="lazy" />
                  </button>
                  {extraPhotos.length > 0 && (
                    <div className="photo-tour-room-photos-extra">
                      {extraPhotos.map((photo) => (
                        <button
                          key={photo.id}
                          type="button"
                          className="photo-tour-photo"
                          onClick={() => onOpenLightboxAt(photos.findIndex((p) => p.id === photo.id))}
                          aria-label={photo.alt}
                        >
                          <img src={photo.url} alt="" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run test -- PhotoTourOverlay`
Expected: PASS (6 tests).

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/components/PhotoTour
git commit -m "feat: rewrite Photo Tour as a room directory with anchor-scroll navigation"
```

- [ ] **Step 8: Checkpoint — dispatch `pixel-diff-reviewer` and `a11y-auditor` against the rewritten `PhotoTourOverlay`. Pay particular attention to: focus trap now cycling through many more interactive elements (nav grid + every room photo), and whether the sticky room-info heading creates any focus-order surprises. Fix any reported deltas before moving to Task 19.**

---

### Task 19: Lightbox Overlay — Header Layout, Image Padding, Arrow Boundary Style

**Files:**
- Modify: `src/components/Lightbox/LightboxOverlay.tsx`
- Modify: `src/components/Lightbox/LightboxOverlay.css`

**Interfaces:** unchanged (`photos, open, index, onClose, onNavigate`) — this task is styling/copy only, no prop or behavior change. The existing focus-trap/scroll-lock/keyboard-nav/close-fade logic from the first round of this project is already correct per spec section 6 ("Escape closes lightbox, returns to Photo Tour, does not close Photo Tour" — already true, since `LightboxOverlay`'s `onClose` only ever sets `lightboxOpen=false` in `App.tsx`, never touching `photoTourOpen`) and needs no changes.

- [ ] **Step 1: Update `LightboxOverlay.css`** — image container padding and arrow boundary color

Find `.lightbox-image-wrap` and change to:

```css
.lightbox-image-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 88px 96px;
}

.lightbox-image-wrap img {
  max-width: min(1100px, 100%);
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}
```

(Replaces the old `max-width: 80vw; max-height: 80vh` rule — the new spec uses padding-based sizing instead of viewport units.)

Find `.lightbox-arrow[aria-disabled="true"]` and change to:

```css
.lightbox-arrow[aria-disabled="true"] {
  opacity: 0.28;
  cursor: default;
  border-color: #cccccc;
}
```

(Was `opacity: 0.4` with no border-color change — spec now gives an exact disabled-state opacity and border color.)

Find `.lightbox-arrow:active` (add it if it doesn't exist yet) and set:

```css
.lightbox-arrow:active {
  transform: translateY(-50%) scale(0.92);
}
```

- [ ] **Step 2: Update `LightboxOverlay.tsx`** — the close button's icon changes semantics (grid/back icon replaces the current X on the LEFT per spec section 6, keeping a real close X on the right alongside the counter)

Current header JSX has: counter span, sr-only live region, h2 title, then a `.lightbox-controls` div with Share + Close. The v2 spec wants: left = grid/back icon (returns to Photo Tour), center = room name (already `photo.category`, unchanged), right = counter + close (×). Replace the header's returned JSX with:

```tsx
          <header className="lightbox-header">
            <button type="button" className="lightbox-icon-button" onClick={onClose} aria-label="Back to photo tour">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <rect x="14" y="3" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <rect x="3" y="14" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <rect x="14" y="14" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <h2 id="lightbox-title" className="lightbox-title">{photo.category}</h2>
            <div className="lightbox-controls">
              <span className="lightbox-counter">{index + 1} of {photos.length}</span>
              <span className="sr-only" aria-live="polite" aria-atomic="true">{photo.alt}, {index + 1} of {photos.length}</span>
              <button ref={closeButtonRef} type="button" className="lightbox-icon-button" onClick={onClose} aria-label="Close lightbox">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </header>
```

Rename the existing `.lightbox-icon-button` class usage consistently (it already exists in the CSS from the first round — no new CSS rule needed, both buttons reuse it). Remove the old standalone Share button entirely (the v2 spec's Lightbox header has no Share control — Share lives on the Photo Tour header now, per Task 18).

`closeButtonRef` and the `initialFocusRef` wiring to `useFocusTrap` from the earlier fix round stay exactly as they are — both header buttons (back-icon and close) are still real focusable buttons in the same DOM order (back first, close second), so `closeButtonRef` still correctly points at "Close lightbox" and the existing focus-target test remains valid unchanged.

- [ ] **Step 3: Run tests**

Run: `npm run test -- LightboxOverlay`
Expected: PASS. If any existing test queries `getByRole('button', { name: 'Share this photo' })` (removed in this task), update that test to remove the assertion — the Share control no longer exists in the Lightbox.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/Lightbox
git commit -m "feat: update Lightbox header layout, image padding, and arrow boundary styling per v2 spec"
```

- [ ] **Step 6: Checkpoint — dispatch `pixel-diff-reviewer` and `a11y-auditor` against the updated `LightboxOverlay`. Confirm the back-to-Photo-Tour semantics are clear via the `aria-label`, and that removing Share didn't leave orphaned CSS. Fix any reported deltas before moving to Task 20.**

---

### Task 20: Wire Up App.tsx for the New Data Shape

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx` (update the 3 existing integration tests for the new room-based thumbnail structure)

**Interfaces:**
- Consumes: `Room[]` from `rooms.json` (Task 13), flattens into `Photo[]` for `HeroGallery`/`LightboxOverlay`, passes `rooms` array directly to `PhotoTourOverlay` (Task 18's new prop).
- Produces: the app's root render tree — no further consumers.

- [ ] **Step 1: Replace `src/App.tsx`**

```tsx
import { useMemo, useState } from 'react'
import ListingPage from './components/ListingPage/ListingPage'
import PhotoTourOverlay from './components/PhotoTour/PhotoTourOverlay'
import LightboxOverlay from './components/Lightbox/LightboxOverlay'
import { useKeyboardMode } from './hooks/useKeyboardMode'
import listingData from './data/listing.json'
import roomsData from './data/rooms.json'
import type { Listing, Room } from './types/listing'

const listing = listingData as Listing
const rooms = roomsData as Room[]

export default function App() {
  const photos = useMemo(() => rooms.flatMap((room) => room.photos), [])

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
      <div inert={photoTourOpen || lightboxOpen}>
        <ListingPage
          listing={listing}
          photos={photos}
          onShowAllPhotos={() => setPhotoTourOpen(true)}
          onOpenLightboxAt={openLightboxAt}
        />
      </div>
      <div inert={lightboxOpen}>
        <PhotoTourOverlay
          photos={photos}
          rooms={rooms}
          open={photoTourOpen}
          onClose={() => {
            if (!lightboxOpen) setPhotoTourOpen(false)
          }}
          onOpenLightboxAt={openLightboxAt}
        />
      </div>
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

- [ ] **Step 2: Update `src/App.test.tsx`**

The existing "thumbnail click opens Lightbox at correct global index" test clicked a Photo Tour thumbnail directly — under the new structure, thumbnails in the nav grid only scroll, and the lightbox-opening click happens on a room-section photo instead. Update that one test's interaction (keep the other two — Escape-stacking and hero-click — unchanged, they don't touch Photo Tour's internals):

```tsx
  it('opens the Lightbox at the correct global index when a room-section photo is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /show all photos/i }))
    // "Full kitchen" is the 3rd room in rooms.json; its one photo is global index 2
    const kitchenPhotoButton = screen.getByRole('button', { name: 'Full kitchen' })
    await user.click(kitchenPhotoButton)
    expect(screen.getByText('3 of 10')).toBeInTheDocument()
  })
```

(Adjust the exact counter text/button name if `rooms.json`'s actual room order or photo count differs from what Task 13 produced — verify against the real file rather than assuming.)

- [ ] **Step 3: Run the full test suite**

Run: `npm run test`
Expected: PASS, all suites.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Manual smoke test**

Run `npm run dev`, open the app, and verify: Navbar renders the new logo/search pill/right nav; hero gallery shows real Unsplash photos; Share/Save row shows the new padding and the Save heart turns red on click; "Show all photos" opens the room-directory Photo Tour (9 thumbnails, clicking one scrolls to that room, does not open Lightbox); clicking an actual room photo opens the Lightbox with the room name as the header title and the correct "N of 10" counter; ← → navigate, Escape returns to Photo Tour (not the listing page); closing Photo Tour from there returns to the listing page. Stop the dev server when done.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: wire App.tsx to the new room-based data model and Photo Tour structure"
```

---

## Self-Review Notes

- **Spec coverage:** All 7 numbered sections of the user's v2 spec are covered: CSS custom properties (already present, verified, no task needed) → Task 13 note; Navbar → Task 14; Title+Share/Save row → Task 15; Hero Gallery → Task 16; two-column layout → Task 17; Photo Tour → Task 18; Lightbox → Task 19; mock data → Task 13/20.
- **Deviations from the user's literal spec, both explicitly authorized in chat before this plan was written:** the real Airbnb Bélo logo → generic wordmark + flame icon; live-reference-site scraped photo URLs → verified real Unsplash URLs. Both documented in this plan's header.
- **Unresolved from the spec, flagged rather than guessed:** exact nightly price in INR (spec said "use INR, match the reference currency display" but gave no number) — placeholder ₹4,200 used, flagged in Task 13 for the user to correct if they have an exact figure.
- **Placeholder scan:** no TBD/TODO markers; every step has runnable code.
- **Type consistency:** `Room`/`Photo` field names used identically across Task 13 (definition), Task 18 (`PhotoTourOverlay` consumption), and Task 20 (`App.tsx` flattening) — `photos.findIndex((p) => p.id === X.id)` pattern preserved from the original project's already-reviewed index-space guarantee.
