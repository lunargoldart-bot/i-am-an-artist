# Android Readiness

Status: **Native project scaffolded — awaiting host-side Gradle build & signing.**

## Toolchain (present on host)
- Java 21 (Android Studio JBR) ✅
- Android SDK: build-tools 34, 35, 36.0, 36.1; platforms android-34, android-35, android-36 ✅
- `adb` available ✅
- Android Studio: Gradle wrapper present at `android/gradlew` (AGP/Capacitor template) ✅
- `ANDROID_SDK_ROOT` / `ANDROID_HOME`: **unset** ❌ → must export before building.

## Project state (scaffolded by `npx cap add android` + `npx cap sync`)
- `android/app/src/main/AndroidManifest.xml` ✅ (Capacitor config + `SplashScreen`-handled launch theme)
- `android/app/build.gradle` ✅
- `android/gradle.properties`, `gradle/libs.versions.toml` ✅
- 6 Capacitor plugins integrated (app, network, status-bar, splash-screen, share, clipboard) ✅

## Native assets (generated this pass)
- Launcher icons: `mipmap-{ldpi,mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/ic_launcher.png` (+ `_round`, `ic_launcher_foreground.png`) ✅
- Adaptive icon XML: `mipmap-anydpi-v26/ic_launcher.xml` (bg @color, fg @drawable) ✅
- Splash: `drawable/splash.xml` (layer-list bg + centered `ic_splash_logo`), `drawable/ic_splash_logo.png` ✅
- `values/ic_launcher_background.xml` (`#0A0A0A`) ✅
- Theme: `AppTheme.NoActionBarLaunch` → `Theme.SplashScreen` with `windowSplashScreenBackground` + `windowSplashScreenAnimatedIcon` + `postSplashScreenTheme` ✅

## Required before build (host)
1. `export ANDROID_SDK_ROOT="/path/to/Android/Sdk"` (and/or `ANDROID_HOME`).
2. Connect a device or start an AVD (none currently registered).
3. App signing config: create `android/keystore.jks` (do NOT commit) + add `signingConfigs` to `build.gradle` → **stop condition: production signing credentials**.

## To build (macOS/Windows, once SDK env ready)
```
cd android
./gradlew assembleRelease     # debug: assembleDebug
./gradlew bundleRelease       # AAB for Play
```
Then `npx cap copy android && npx cap open android` to open in Studio for run/debug.

## Firebase (Android)
- Add `google-services.json` to `android/app/` (see FIREBASE_NATIVE_SETUP.md).
