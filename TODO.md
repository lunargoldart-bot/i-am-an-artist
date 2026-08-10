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

## Phase 4 — Firebase Native Android [BLOCKED — external credential]
- [ ] Obtain correct `google-services.json` for Firebase project `i-am-an-artist-f3b0d` + package `com.iamanartist.app`.
  - The file present in Downloads belongs to `we-gat-u` / `com.wegatyou.app` → **rejected, not placed**.
  - **Exact next step:** Download google-services.json from Firebase Console (Project Settings → Your apps → Android) and place at `android/app/google-services.json`, then `npx cap sync android`.
- [ ] Register Android SHA-1 (debug + release signing cert) for native Google Sign-In (or migrate to `@capacitor/google-auth` + `signInWithCredential`).
- [ ] (Optional) App Check not used; native FCM not integrated.

## Phase 4 — Gated / external
- [ ] Android release AAB + signing keystore (production credentials required).
- [ ] iOS build/archive + App Store (macOS + Xcode + Apple Developer).

## Phase 5 — Store & Distribution [planned]
- [ ] Google Play internal-test track (signed AAB).
- [ ] App Store Connect app record + upload.
- [ ] Production signing config + store metadata.

## Phase 6 — Post-launch [planned]
- [ ] Native Crashlytics.
- [ ] App Check device attestation.
- [ ] Native performance baselines.

## Ongoing
- [x] Verify `functions/.env` not committed (gitignored) — confirmed: `.env*`, `functions/.env*` ignored.
- [x] Confirm `pwa-strategy` (non-existent npm pkg) is absent from package.json — absent.
- [x] Verify `google-services.json` is gitignored (`android/.gitignore`).
- [ ] Commit + push Phase 4 scaffolding (user decision on timing).
