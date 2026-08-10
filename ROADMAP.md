# Roadmap

## Current phase: Phase 4 — Capacitor + Firebase Native (host-run completed, config BLOCKED)
Goal: package the PWA as native Android + iOS apps, wire Firebase native config, validate end-to-end.

### Phase 4 — Capacitor (host-run completed)
- [x] Capacitor 8.5.0 + plugins (app, network, status-bar, splash-screen, share, clipboard).
- [x] `capacitor.config.ts` (appId `com.iamanartist.app`, webDir `dist`).
- [x] `npx cap add android` + `npx cap add ios` — both scaffolded; `cap doctor` Android OK.
- [x] `npx cap sync` green (6 plugins/platform; iOS `Package.swift` written).
- [x] Native assets: Android launcher/adaptive/splash drawables + `styles.xml`; iOS AppIcon + Splash asset catalogs.
- [x] **Android debug build succeeded** — `app/build/outputs/apk/debug/app-debug.apk` (8.36 MB).
- [x] PWA manifest `theme_color` fixed; ESLint ignores added; `package.json` repaired.
- [x] `FIREBASE_NATIVE_ANDROID_REPORT.md` generated.

### Phase 4 — Firebase native config (BLOCKED — external credential required)
- [ ] Place correct `google-services.json` (project `i-am-an-artist-f3b0d`, package `com.iamanartist.app`).
  - The file supplied for this pass belongs to `we-gat-u` — **rejected**, not placed.
  - **Stop condition:** correct file fetched from Firebase Console → Project Settings → Android app.
- [ ] Register Android SHA-1 (debug + release) for native Google Sign-In, **or** switch native auth to `@capacitor/google-auth`.
- [ ] App Check: not used — optional, not required.
- [ ] Native push (FCM): not integrated — optional.

### Phase 4 — gated / external
- [ ] Android release AAB + signing keystore (production credentials required).
- [ ] iOS build/archive + App Store (macOS + Xcode + Apple Developer).

## References
- Live prod: https://www.iamanartistapp.com
- DEPLOYMENT.md, CAPACITOR_REPORT.md, ANDROID_READINESS.md, IOS_READINESS.md,
  FIREBASE_NATIVE_SETUP.md, FIREBASE_NATIVE_ANDROID_REPORT.md.
