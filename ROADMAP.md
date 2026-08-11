# Roadmap

## Current phase: Phase 5 — Final production readiness (host-run completed)
Goal: package the PWA as native Android + iOS apps, wire Firebase native config, validate end-to-end,
and prepare store submission (without publishing).

### Phase 4 — Capacitor (host-run completed)
- [x] Capacitor 8.5.0 + plugins (app, network, status-bar, splash-screen, share, clipboard).
- [x] `capacitor.config.ts` (appId `com.iamanartist.app`, webDir `dist`).
- [x] `npx cap add android` + `npx cap add ios` — both scaffolded; `cap doctor` Android OK.
- [x] `npx cap sync` green (6 plugins/platform; iOS `Package.swift` written).
- [x] Native assets: Android launcher/adaptive/splash drawables + `styles.xml`; iOS AppIcon + Splash asset catalogs.
- [x] **Android debug build succeeded** — `app/build/outputs/apk/debug/app-debug.apk` (8.36 MB).
- [x] PWA manifest `theme_color` fixed; ESLint ignores added; `package.json` repaired.
- [x] `FIREBASE_NATIVE_ANDROID_REPORT.md` generated.

### Phase 4 — Firebase native config (COMPLETED)
- [x] `google-services.json` refreshed from `firebase apps:sdkconfig` (project `i-am-an-artist-f3b0d`,
      package `com.iamanartist.app`) — now includes two `client_type: 1` Android OAuth clients.
- [x] Register Android SHA-1 + SHA-256 (debug + release) for native Google Sign-In — done via
      Firebase Management API (`projects.androidApps.sha.create`), all four verified.
- [x] App Check: not used — optional, not required.
- [x] Native push (FCM): not integrated — optional.

### Phase 5 — Final production readiness (host-run completed)
- [x] Global UI facelift: light ivory/green/charcoal brand app-wide; gold retained as
      elite/premium/auction accent only.
- [x] Production signing: dedicated keystore (`iamanartist-release.keystore`, outside repo),
      env-driven `signingConfigs.release`; AAB + APK signed & verified.
- [x] Firebase SHA-1/SHA-256 registration (release + debug) — verified via API + sdkconfig.
- [x] Clean release build post-facelift: `clean :app:bundleRelease :app:assembleRelease` ✅.
- [ ] Google Play internal-test track: upload signed AAB (DO NOT publish).
- [ ] Play App Signing pairing check (register Play cert SHA-1 in Firebase if rotated).
- [ ] iOS build/archive + App Store (macOS + Xcode + Apple Developer).

## References
- Live prod: https://www.iamanartistapp.com
- DEPLOYMENT.md, CAPACITOR_REPORT.md, ANDROID_READINESS.md, IOS_READINESS.md,
  FIREBASE_NATIVE_SETUP.md, FIREBASE_NATIVE_ANDROID_REPORT.md.
