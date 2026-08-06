# Release Phase 2.2 — Native Marketplace Experience

**Status:** Released ✅ &nbsp;|&nbsp; **Commit:** `f47c10e` &nbsp;|&nbsp; **Live:** https://www.iamanartistapp.com

All verification passed: `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run build` ✅ (only pre-existing chunk-size / dynamic-import warnings).

---

## What shipped (by priority)

### P1 · Sticky Marketplace Actions
New reusable **`StickyActionBar`** (native-style bottom bar: pinned via `sticky bottom-0`, backdrop blur, iOS safe-area padding, elevated shadow). Applied to:
- **Artwork Detail** — price/current-bid + Add to Cart / Buy Now (mobile) + Place Bid for auctions; stays visible while scrolling. Desktop keeps in-flow buttons.
- **Cart** — total + "Proceed to Checkout" bar.
- **Checkout** — total-due + "Pay with DPO" bar.
- **Wishlist** — saved count + "Explore Gallery" bar.
- **Artist Profile** — artist stats + "Contact Artist" bar (opens an in-page message dialog).

### P2 · Marketplace Navigation
- **`ScrollManager`** — saves each list route's scroll position to `sessionStorage` and restores it on return; scrolls to top on detail routes. Wired into `AppLayout`.
- **Page‑enter transition** — subtle opacity/slide on route change across all app pages.
- **Animated category/collection switching** — `Explore` (SwipeDeck) and `Gallery` (card grid) now cross‑fade with `AnimatePresence` per category/search; `VirtualGallery` artworks transition with a smooth 3D‑tilt swap and its previously dead *Fullscreen* button now opens the lightbox.

### P3 · Artist Experience
- **`Stepper`** — animated horizontal progress indicator (filled connecting bar, checkmarks, tap-to-return).
- **Sell Art** now a guided 3‑step flow (Image → Details → Pricing) with per‑step validation, Back/Continue, live preview, and auto scroll‑to‑top between steps.
- **Identity Verification** now a 3‑step flow (Identity → Documents → Review) with validation, review screen, and auto scroll‑to‑top.

### P4 · Image Experience
- **`SmartImage`** — lazy loading via `IntersectionObserver`, shimmer placeholder, progressive fade‑in on load, error fallback. Applied to Explore cards, Gallery cards, Artist galleries, and the swipe deck.
- **`ArtworkLightbox`** — fullscreen viewer with **pinch‑to‑zoom**, **double‑tap zoom toward tap point**, pan‑while‑zoomed (clamped), mouse‑wheel zoom, swipe‑down to dismiss, `Esc`/X/backdrop close, zoom control bar. Wired to Artwork Detail, Virtual Gallery, and its Fullscreen button.

### P5 · Messaging
- Sticky composer with **safe‑area bottom padding** in `ConversationThread`; `MessageInput` composer gains `inputMode` + safe‑area.
- Auto‑scroll to latest message already present and retained.
- **Wired `?open_messages=true`**: `Messages → Artwork Detail` now actually opens the contact/composer panel (previously ignored), and `QuickContactCard` is now controllable via `open`/`onOpenChange`.

### P6 · Checkout
- Field‑level **validation** with highlighting + friendly hints (name, valid phone).
- **Sticky pay bar** with total due + secure-checkout marker (replaces the scrolling in‑summary button).
- Loading spinner states retained; haptics on submit/success; `Lock` guard on summary.

### P7 · Native Polish
- **`src/utils/native.js`** — haptics pipeline **(structure only)** mapping `light/medium/heavy/selection/success/error` to the Vibration API (ready to swap for Capacitor ImpactFeedback), plus `copyToClipboard` and `shareContent` (Web Share API with clipboard fallback).
- **Share API** — native share sheet added to artwork share row (with clipboard fallback toast).
- **Haptics** hooked into: add‑to‑cart, wishlist toggle, explore swipe/pass, cart remove, checkout submit/success, gallery navigation.
- **Browser back** + scroll restoration handled by router + `ScrollManager`.

---

## Files
**Added (6):** `src/components/ui/{StickyActionBar,Stepper,SmartImage,ArtworkLightbox}.jsx`, `src/lib/ScrollManager.jsx`, `src/utils/native.js`

**Modified (19):** `AppLayout`, `ArtworkDetail`, `Cart`, `Checkout`, `Wishlist`, `ArtistProfile`, `Explore`, `Gallery`, `SellArt`, `VerificationForm`, `VirtualGalleryViewer`, `QuickContactCard`, `ConversationThread`, `MessageInput`, `ui/ArtworkCard`, `artwork/ArtworkCard`, `SwipeCard`, `SocialShareButtons`, `WishlistButton`

## Net diff
`25 files changed, +1359 / −335`

## Notes / out of scope
- Capacitor + PWA intentionally NOT installed (per spec). Haptics remain structural until a Capacitor build.
- Story continues as before: pre‑existing build warnings (2.5 MB main chunk, dynamic‑import notice for `ArtworkService`) are non‑blocking and tracked for a future code‑splitting pass.