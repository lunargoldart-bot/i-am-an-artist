# TODO

## Phase 4 — Capacitor Native [host-run completed]
- [x] Repair `package.json` (invalid JSON: duplicate `engines` + missing comma).
- [x] Install Capacitor 8.5.0 + plugins (app, network, status-bar, splash-screen, share, clipboard).
- [x] `capacitor.config.ts` (`com.iamanartist.app`, webDir `dist`).
- [x] `npx cap add android` + `npx cap add ios`.
- [x] `npx cap sync` — both platforms green (6 plugins each).
- [x] `cap doctor` — Android "looking great"; iOS: Xcode absent (Windows host).
- [x] Native assets: Android launcher/adaptive/splash + `styles.xml`; iOS AppIcon + Splash asset catalogs.
- [x] **Android debug build succeeded** — `app-debug.apk` (8.36 MB).
- [x] PWA `theme_color`/installability fixed; ESLint ignores for android/ios/dist added; `android/.gitignore` corrected.
- [x] Native docs regenerated; ROADMAP/TODO/CHANGELOG updated.

## Phase 4 — Firebase Native Android [COMPLETED — fingerprints registered]
- [x] Obtain correct `google-services.json` for Firebase project `i-am-an-artist-f3b0d` + package `com.iamanartist.app`.
  - Refreshed from `firebase apps:sdkconfig` on 2026-08-11 (now contains two `client_type: 1` Android OAuth clients).
- [x] Register Android SHA-1 + SHA-256 (debug + release signing certs) for native Google Sign-In —
  via Firebase Management API (`projects.androidApps.sha.create`), all four verified by `GET .../sha`
  and `apps:sdkconfig`. Native path uses `@capgo/capacitor-social-login` + `signInWithCredential`.
- [ ] (Optional) App Check not used; native FCM not integrated.

## Phase 4 — Gated / external
- [ ] iOS build/archive + App Store (macOS + Xcode + Apple Developer).

## Phase 5 — Store & Distribution [in progress]
- [x] Production signing config + keystore (dedicated key, env-driven, outside repo).
- [x] Signed release AAB + APK built & verified (post-facelift clean build).
- [x] Firebase SHA-1/SHA-256 registration (release + debug) verified.
- [ ] Google Play internal-test track upload (signed AAB) — DO NOT publish to production.
- [ ] Play App Signing pairing check (if Play rotates cert, register its SHA-1 in Firebase).
- [ ] App Store Connect app record + upload (macOS/Xcode gate).

## Phase 6 — Post-launch [planned]
- [ ] Native Crashlytics.
- [ ] App Check device attestation.
- [ ] Native performance baselines.

## Ongoing
- [x] Verify `functions/.env` not committed (gitignored) — confirmed: `.env*`, `functions/.env*` ignored.
- [x] Confirm `pwa-strategy` (non-existent npm pkg) is absent from package.json — absent.
- [x] Verify `google-services.json` is gitignored (`android/.gitignore`).
- [ ] Commit + push Phase 4 scaffolding (user decision on timing).
