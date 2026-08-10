# Changelog

All notable changes to this project are documented here. Format is loosely
["Keep a Changelog"](https://keepachangelog.com/) + [SemVer](https://semver.org/).

## [Unreleased]
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
