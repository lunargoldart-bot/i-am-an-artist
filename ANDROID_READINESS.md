# Android Readiness

Status: **READY FOR GOOGLE PLAY INTERNAL TESTING** (signed AAB built & verified; publish intentionally not done).

## Toolchain (present on host)
- Java 21 (Android Studio JBR) ✅
- Android SDK: build-tools 34, 35, 36.0, 36.1; platforms android-34, android-35, android-36 ✅
- `adb` available ✅
- Android Studio: Gradle wrapper present at `android/gradlew` (AGP/Capacitor template) ✅
- `ANDROID_SDK_ROOT` / `ANDROID_HOME`: configured for builds on this host ✅

## Project state
- `android/app/src/main/AndroidManifest.xml` ✅ (Capacitor config + `SplashScreen`-handled launch theme)
- `android/app/build.gradle` ✅ (env-driven `signingConfigs.release`; secrets via env, none in repo)
- `android/gradle.properties` ✅ (documents the signing env contract)
- 7 Capacitor plugins integrated: app, network, status-bar, splash-screen, share, clipboard,
  capgo-social-login ✅
- Native assets: launcher + adaptive icons, splash drawable, `Theme.SplashScreen` ✅

## Production signing
- Dedicated keystore `C:\Users\PC\keystores\iamanartist-release.keystore` (alias `iamanartist`,
  RSA 4096, SHA384withRSA, 10,000 days) — **outside the repo, never committed**.
- Credentials env file `C:\Users\PC\keystores\iamanartist-release.env` — outside repo.
- Release builds require the env loaded, e.g.:
  ```powershell
  Get-Content C:\Users\PC\keystores\iamanartist-release.env |
    ForEach-Object { $k,$v = $_ -split '=',2; Set-Item -Path "env:$k" -Value $v }
  cd android
  .\gradlew.bat clean :app:bundleRelease :app:assembleRelease
  ```
- Debug builds need no keystore (Android Studio debug key).

## Build verification (clean, post-facelift, 2026-08-11)
- `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run build` ✅ · `npx cap sync android` ✅
- `.\gradlew.bat clean :app:bundleRelease :app:assembleRelease` ✅
- Release AAB: `android/app/build/outputs/bundle/release/app-release.aab` (8,465,733 B, `jar verified`)
- Release APK: `android/app/build/outputs/apk/release/app-release.apk` (8,785,535 B,
  apksigner `Verifies`, v2 scheme, signer = production keystore)

## Firebase (Android) — COMPLETED
- `android/app/google-services.json` (gitignored) refreshed from live `apps:sdkconfig`;
  contains two `client_type: 1` Android OAuth clients + the web `client_type: 3` client.
- SHA fingerprints registered & verified (release + debug, SHA-1 + SHA-256) — see
  `FIREBASE_ANDROID_RELEASE_REPORT.md` for the full table and API verification.
- Native Google Sign-In uses `@capgo/capacitor-social-login@8.3.40` + `signInWithCredential`.

## Remaining before/at Play submission (user actions, not automated)
1. Upload `app-release.aab` to Google Play → Internal testing track (do NOT promote to production).
2. Play App Signing: verify Play's signing certificate SHA-1/256; if rotated, register that SHA-1
   in Firebase too.
3. Install the debug build on a device and smoke-test native "Continue with Google".
