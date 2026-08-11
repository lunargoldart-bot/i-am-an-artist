# CAPACITOR REPORT

Generated: Phase 4 — Capacitor Native Integration (updated Phase 5).
Status: **ANDROID PRODUCTION-READY** (synced, signed release AAB/APK built & verified);
iOS remains scaffolded & synced (macOS/Xcode required to build/archive).

## Environment
- Windows 10/11 host (PowerShell 5.1).
- Node v24.12.0 (project `engines.node` = `22.x` → `EBADENGINE` warning only, non-blocking).
- Java 21 (Android Studio JBR), Android SDK present (build-tools + platforms 34–36.1, adb); `ANDROID_SDK_ROOT` unset; no AVDs registered.
- Firebase CLI 15.2.1 authenticated; Vercel CLI 56.5.0.
- Xcode/Apple Developer tools **not available** on this host (macOS required for iOS archive / App Store).

## Installed packages (package.json)
```
@capacitor/core@8.5.0
@capacitor/cli@8.5.0
@capacitor/android@8.5.0
@capacitor/ios@8.5.0
@capacitor/app@8.1.1
@capacitor/network@8.0.1
@capacitor/status-bar@8.0.3
@capacitor/splash-screen@8.0.2
@capacitor/share@8.0.1
@capacitor/clipboard@8.0.1
@capgo/capacitor-social-login@8.3.40
```

## Config
- `capacitor.config.ts` — appId `com.iamanartist.app`, appName "I Am An Artist", webDir `dist`, SplashScreen + StatusBar plugin config, `SocialLogin` plugin (`providers.google = true`).
- Vite `webDir`/PWA manifest (`vite-plugin-pwa`) consistent.

## Native platforms
| Platform | `npx cap add` | `npx cap sync` | Status |
|---|---|---|---|
| Android `android/` | ✅ | ✅ (7 plugins) | production-ready; signed release AAB/APK built & verified |
| iOS `ios/App/App.xcodeproj` | ✅ | ✅ (6 plugins, Package.swift written) | scaffolded; needs macOS/Xcode to build/archive |

Plugin integration confirmed on both platforms (Android 7 incl. social-login; iOS 6).

## Native assets generated
- Android: `mipmap-{ldpi..xxxhdpi}/ic_launcher(.png|_round|foreground)`, `mipmap-anydpi-v26/ic_launcher.xml`, `values/ic_launcher_background.xml`, `drawable/splash.xml` + `ic_splash_logo.png`; `styles.xml` wired to `Theme.SplashScreen`.
- iOS: `AppIcon.appiconset/` (20/29/40/60/1024 pt, @1x@2x@3x, universal+marketing+ipad), `Splash.imageset/` PNGs + `Contents.json`, `LaunchScreen.storyboard` references asset "Splash".

## Native bridge / JS shim
- `src/utils/native.js` intentionally remains the **web-only shim** (haptics/share/clipboard degrade gracefully). Native plugins are invoked via the Capacitor native bridge rather than imported into the shared web module — this keeps the PWA/web Vite build green (`npm run build` ✅; `vite-plugin-pwa` precache 12 entries; no `@capacitor/*` in web graph).

## Verification (host-run)
- `npm run lint` ✅
- `npm run typecheck` ✅ (`tsc -p ./jsconfig.json`)
- `npm run build` ✅ (vite v5.0.0; `manifest.webmanifest` generated)
- `npx cap sync` ✅ (Android 7 plugins incl. `@capgo/capacitor-social-login@8.3.40`)
- `.\gradlew.bat clean :app:bundleRelease :app:assembleRelease` ✅ (env-driven signing; AAB `jar
  verified`; APK apksigner `Verifies` v2, signer = production keystore = Firebase-registered SHAs)

## Known limitations / stop conditions
- Android: fully built & verified on this host. Signing keystore + credentials live **outside** the
  repo (`C:\Users\PC\keystores\iamanartist-release.*`), env-driven via `build.gradle`. SHA-1/256
  fingerprints registered in Firebase (see `FIREBASE_ANDROID_RELEASE_REPORT.md`). Play upload
  intentionally not performed.
- iOS: build/archive/App Store submission requires macOS + Xcode + Apple Developer; impossible on
  this Windows host. Xcode project generated but unverified for compile.
- Firebase native config files (`google-services.json`, `GoogleService-Info.plist`) absent — see `FIREBASE_NATIVE_SETUP.md`.
