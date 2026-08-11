# Changelog

All notable changes to this project are documented here. Format is loosely
["Keep a Changelog"](https://keepachangelog.com/) + [SemVer](https://semver.org/).

## [Unreleased]
### Phase 5 — Final production readiness: global UI facelift + Firebase SHA registration (host-run completed)
- **Global UI facelift:** flipped the app-wide theme to the new light brand —
  ivory (`#F9F8F5`) surfaces, emerald green (`#2E6B4E`-family) primary, deep charcoal text —
  unifying the public landing page with the internal app. Gold is retained **only** as an
  elite/premium/auction accent.
- `src/index.css`: `:root` and `.light` now define the light ivory/green/charcoal tokens;
  a brand-matched `.dark` variant was added; new `.green-gradient` utility; `.gold-gradient`,
  `.gallery-card-hover`, and `.shimmer` retuned (green ring/glow).
- `src/lib/AdminTheme.jsx`: default theme flipped to `light`; the admin dark toggle now uses the
  brand-matched dark palette.
- `index.html`: `theme-color` meta updated to ivory `#F9F8F5`.
- ~60 component/page files swept: general CTAs `gold-gradient` → `green-gradient` (20 files),
  gold accents → green `primary` on general surfaces (40 files). Kept gold: Elite badges,
  auction surfaces (BidModal, PlaceBidDialog, BidHistory, AuctionCountdown), premium
  (EliteMembershipBanner, EliteFeatureQueue, GalaInviteTeaser, MillionaireTrajectory,
  ProfileMonetization, ManageAds, SponsoredAdBanner, BuyArtworkModal, VirtualGalleryViewer),
  star ratings (ReviewsPage, CourierRatingModal, ArtistCard), Navbar Elite pill.
- Buttons on gradient surfaces now use `text-primary-foreground` (theme-independent white) or
  `text-[#1F1F1F]` on gold; fixed invisible `text-white` section headers on the light background
  (Home, AppFeatures, CategoryGallery, ZambianChangemakers); PageNotFound + ErrorBoundary
  converted to brand tokens; Dashboard spinner `border-t-gold` → `border-t-primary`.
- **Firebase SHA fingerprints registered (Management API) and verified** — all four certs
  (release + debug, SHA-1 + SHA-256) via `projects.androidApps.sha.create`; confirmed by
  `GET .../sha` and a fresh `apps:sdkconfig` now emitting two `client_type: 1` Android OAuth
  clients (`62156877090-4uhefao92m538gs19g2thvbe7bd3j7bv`, `62156877090-8jhf5a7qr0i4fnirgj19loc8hoe8id9a`).
- `android/app/google-services.json` refreshed from live sdkconfig (gitignored).
- Clean release build: `./gradlew clean :app:bundleRelease :app:assembleRelease` ✅
  (AAB 8,465,733 B `jar verified`; APK 8,785,535 B apksigner `Verifies`, v2, signer SHA-1/SHA-256
  = keystore = Firebase). Web build ✅, `cap sync android` ✅ (7 plugins), lint ✅, typecheck ✅.
- Full verification chain re-run post-facelift; `FIREBASE_ANDROID_RELEASE_REPORT.md` updated.

### Phase 4 — Capacitor Native Integration (host-run work completed)
- Repaired root `package.json` (was invalid JSON: duplicate `engines` + missing comma).
- Installed Capacitor 8.5.0 stack + plugins: app, network, status-bar, splash-screen, share, clipboard.
- Created `capacitor.config.ts` (`com.iamanartist.app`, webDir `dist`, SplashScreen + StatusBar).
- `npx cap add android` + `npx cap add ios` — both native projects scaffolded.
- `npx cap sync` green on both platforms (6 plugins each; iOS `Package.swift` written).
- Android debug build **succeeded**: `app/build/outputs/apk/debug/app-debug.apk` (8.36 MB).
- `cap doctor`: Android "looking great"; iOS reports Xcode absent (expected on Windows).
- Generated native assets: Android launcher/adaptive/splash drawables + `styles.xml` (`Theme.SplashScreen`); iOS AppIcon.appiconset + Splash.imageset.
- Fixed `android/.gitignore` (enabled `google-services.json` ignore); added eslint ignores for `android/**`,`ios/**`,`dist/**`,etc.
- PWA `manifest.webmanifest` now includes `theme_color`; generated icon set.
- **Firebase Android:** supplied `google-services.json` is for the wrong project (`we-gat-u`/`com.wegatyou.app`) — **rejected**, not placed.


### Gated (require external macOS/Windows-native + credential stop conditions)
- Android Gradle `./gradlew assembleRelease` / AAB signing — needs keystore + `ANDROID_SDK_ROOT`.
- iOS build/archive/App Store — requires macOS + Xcode + Apple Developer.
- Firebase native config: `google-services.json` + `GoogleService-Info.plist` not present (host-only guides written).

## [Phase 2.6 — RC1] — 2026 (released; commit 6e7cbc1)
### Backend (`functions/`)
- Added `MEMBERSHIP_TIERS` (pro 800 ZMW/30d, elite 2800 ZMW/30d) + `initiateMembershipPayment` callable returning a DPO checkout redirect.
- Refactored `verifyDPOPayment` + `dpoCallback` to share a single idempotent `finalizeApprovedSession` helper (dedup on `sessionId` / `tx_ref`) covering both membership subscriptions and artwork orders.
- Added in-memory `rateLimit` / `rateLimitUser` token-bucket helpers; applied limits: `invokeLLM` 20 req / 60 s, `sendMessage` 30 req / 60 s.
- `functions/.env` created (gitignored) with TEST DPO token fallback.
- `node --check functions/index.js` + `dpo.js` ✅.

## [Phase 2.5 — Production Hardening] (released; commit 6e7cbc1)
- DPO CompanyToken sourced from `process.env.DPO_COMPANY_TOKEN` (TEST fallback); service type via env.
- Rewired `BuyArtworkModal` → `createCheckoutSession` DPO redirect.
- `QuickContactCard`: deterministic sorted conversationId matching `MessageThread`.
- `ManageArtworks`: dual-schema normalization (price_zmw+price, images+image_urls) on read + write.
- `BidModal`: artwork price fallback.
- `VerifyUsers`: admin-only gate, loading skeleton.
- `ErrorBoundary` + 500 screen wired into `main.jsx`.
- SEO: `manifest.json`, `robots.txt`, `sitemap.xml`, canonical + absolute OG/Twitter meta.
