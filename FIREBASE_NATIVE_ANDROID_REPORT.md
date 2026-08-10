# Firebase Native Android Configuration Report

**Generated:** Phase 4 — Firebase Native Android Configuration pass
**App ID:** `com.iamanartist.app`
**Firebase project:** `i-am-an-artist-f3b0d` (project_number / FCM sender `62156877090`)
**Host:** Windows (Java 21 via Android Studio JBR, Android SDK present; macOS/Xcode absent)

## Step 1 — Firebase configuration verification ✅
- File placed at: `android/app/google-services.json`
- `google-services.json` content (project + package only, no secrets printed):
  - `project_id` = `i-am-an-artist-f3b0d` ✅
  - `project_number` = `62156877090` ✅ (matches `.env.local` `VITE_FIREBASE_MESSAGING_SENDER_ID=62156877090`)
  - `storage_bucket` = `i-am-an-artist-f3b0d.firebasestorage.app` ✅ (matches `.env.local`)
  - `package_name` (android client) = `com.iamanartist.app` ✅ (matches app `applicationId`)
- Cross-check vs existing web config (`.env.local`): same project, same sender id, same bucket → **identical Firebase backend**. ✅
- Contamination check: **no `we-gat-u` / `wegatyou` / `819893585941` references** in `google-services.json` or anywhere in `src/`. ✅

## Step 2 — Gradle Firebase integration ✅
- `npx cap sync android` → Sync finished in 0.287s, 6 plugins; `google-services.json` left in place under `android/app/`. ✅
- `app/build.gradle` conditional apply (template) now **activates** because the file exists:
  ```gradle
  try {
      def servicesJSON = file('google-services.json')
      if (servicesJSON.text) { apply plugin: 'com.google.gms.google-services' }
  } catch(Exception e) { logger.info("google-services.json not found ...") }
  ```
- Root `build.gradle` classpath present: `classpath 'com.google.gms:google-services:4.4.4'`. ✅
- **Merge proof:** after `./gradlew clean assembleDebug`, Google Services generated
  `app/build/intermediates/.../values/values.xml` containing:
  ```
  project_id            = i-am-an-artist-f3b0d
  gcm_defaultSenderId     = 62156877090
  google_app_id           = 1:62156877090:android:928d8c83e2ebb47cf0c97b
  google_storage_bucket   = i-am-an-artist-f3b0d.firebasestorage.app
  package_name            = com.iamanartist.app
  ```
  → the correct Firebase native config is baked into the APK. ✅

## Step 3 — Firebase services audit ✅
The merged native resources confirm the Android app points to the production project:
- **Firebase Authentication** → `default_web_client_id` = `62156877090-jo881bbvvpcetp522dgvptlb9um41m5g.apps.googleusercontent.com` (project `62156877090`) ✅
- **Firestore** → client initialized from env `VITE_FIREBASE_PROJECT_ID=i-am-an-artist-f3b0d`; rules `firestore.rules` sound ✅
- **Firebase Storage** → bucket `i-am-an-artist-f3b0d.firebasestorage.app` ✅
- **Firebase Functions** → `firebase.json` region `us-central1`, default project `i-am-an-artist-f3b0d` ✅
- **No `we-gat-u` connectivity** anywhere. ✅

## Step 4 — Google (Sign-In) authentication
- Web app uses `src/lib/firebaseAuth.js`: `GoogleAuthProvider` + `signInWithPopup`, email/password, Firestore user hydration.
- **Native caveat:** `signInWithPopup` does **not** work inside the Capacitor Android WebView — native Google Sign-In is required for the Android app.
- **Plugin status:** `@capacitor/google-auth` is the desired package but is **not published** (404 from npm). The community package `@codetrix-studio/capacitor-google-auth@3.4.0-rc.4` exists but its peer dependency is `@capacitor/core@^6` while the project uses **Capacitor 8.5.0** → a hard version conflict (ERESOLVE). Installing with `--legacy-peer-deps` would risk the working dependency tree.
- **Decision:** To honor "do NOT modify working dependencies unless a genuine error requires it," the incompatible plugin was **not** force-installed. Native Google Sign-In is deferred to an external gate.
- **SHA-1 / SHA-256 (debug signing cert, computed via Android Studio JBR keytool):**
  - SHA-1: `4A:F1:2F:AD:D5:24:8B:FC:C0:9A:83:6E:16:93:10:C8:12:42:35:E1`
  - SHA-256: `B9:F2:E3:10:C6:F4:CB:5A:1C:57:69:0B:B4:4B:11:3D:1B:0A:17:8A:78:85:A5:C0:1A:7A:DB:DC:BE:25:1A:3B`
- These must be registered in **Firebase Console → Project Settings → Your apps → (Android) → SHA certificate fingerprints** (debug + release). **This is the external gate.**

### Native Google Sign-In — exact required configuration
1. Register the debug SHA-1 (and release SHA-1 once a release keystore exists) in Firebase Console → Android app → "SHA certificate fingerprints" (creates the Android OAuth client used by `default_web_client_id` above).
2. In Firebase Console → Authentication → Sign-in method → Google — ensure the Android client OAuth ID is listed as an authorized client.
3. Install a Capacitor 8-compatible Google Auth plugin (when `@codetrix-studio/capacitor-google-auth` publishes a Cap-8-compatible release, or use the official Firebase native flow):
   ```bash
   npm install @capacitor/google-auth
   npx cap sync android
   ```
4. Wire the sign-in path (preserving the web popup flow):
   ```js
   // src/lib/firebaseAuth.js
   import { Capacitor } from '@capacitor/core';
   import { GoogleAuth } from '@capacitor/google-auth';
   import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

   export async function signInWithGoogle() {
     if (Capacitor.isNative()) {
       const res = await GoogleAuth.signIn();
       const cred = GoogleAuthProvider.credential(res.authentication.idToken, res.authentication.accessToken);
       return hydrateUser((await signInWithCredential(auth, cred)).user);
     }
     return signInWithPopup(auth, googleProvider).then(r => hydrateUser(r.user));
   }
   ```
5. iOS: add `REVERSED_CLIENT_ID` to `ios/App/App/Info.plist` (from `GoogleService-Info.plist`).
6. After placing `google-services.json` and registering SHA-1, `npx cap sync android` and rebuild.

## Step 5 — App Check
- App Check is **not implemented** in the app (no `provideAppCheck` / `initializeAppCheck` / `ReCaptchaV3Provider` usage in `src/`).
- ⇒ App Check is **not enforced** and not required for this build. SHA-256 registration for App Check is therefore **not required** (SHA-256 above is informational/for future App Check + Play Integrity).

## Step 6 — Build validation ✅
| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | ✅ clean |
| Typecheck | `npm run typecheck` (tsc) | ✅ clean |
| Web build | `npm run build` (vite v5.0.0) | ✅ built, `manifest.webmanifest` (theme_color present) |
| Cap sync | `npx cap sync android` | ✅ 6 plugins synced |
| Debug build | `./gradlew clean assembleDebug` (Java 21, AGP 8.13) | ✅ BUILD SUCCESSFUL |
| APK | `app/build/outputs/apk/debug/app-debug.apk` | ✅ 8,367,611 bytes |

Release build readiness: `./gradlew bundleRelease` is **ready to attempt** once a release signing config is added to `build.gradle`. **No production keystore exists** — do NOT generate one without team approval (stop condition for actual release signing); use it only for local AAB validation if provided.

## Step 7 — Security check ✅
- `google-services.json` is listed in `android/.gitignore`. ✅
- No Firebase credentials hardcoded in source (`src/`). ✅
- No `we-gat-u` Firebase IDs present anywhere. ✅
- No keystore / passwords committed (no `*.jks`/`*.keystore` present). ✅
- `functions/.env` (TEST DPO token) is gitignored. ✅

## Step 8 — Report fields (required)
- **Firebase project:** `i-am-an-artist-f3b0d` ✅
- **Android package:** `com.iamanartist.app` ✅
- **google-services.json verification:** present, correct project/package/sender, merged into APK ✅
- **Authentication status:** Web auth works (env-driven, production project). Native Google Sign-In requires the gated steps above.
- **Firestore status:** connected to `i-am-an-artist-f3b0d`, rules sound ✅
- **Storage status:** `i-am-an-artist-f3b0d.firebasestorage.app` ✅
- **Functions status:** 33 functions on `i-am-an-artist-f3b0d` ✅
- **Google Sign-In status:** Web popup ✅; native ⚠️ gated (plugin peer conflict + SHA-1 registration).
- **App Check status:** Not implemented / not required.
- **SHA-1 requirement:** YES (for native Google Sign-In) — debug computed; register in Firebase Console (external gate).
- **SHA-256 requirement:** NO (App Check not used).
- **Build status:** Debug BUILD SUCCESSFUL (APK 8.37 MB).
- **Remaining manual actions:** see "Exact next step" below.

## Remaining manual actions
1. **Register Android SHA-1** (debug + release) in Firebase Console → Project Settings → Android app → SHA fingerprints (for native Google Sign-In). **External gate.**
2. **Choose + install a Capacitor 8-compatible native Google Auth plugin** (current `@codetrix-studio/capacitor-google-auth` peers on Cap 6) OR author an in-house `@capacitor/google-auth` replacement + `signInWithCredential` flow. **External gate (plugin availability).**
3. Once SHA-1 is registered, rebuild → the OAuth client id will resolve and native Google Sign-In will work.
4. **Release AAB**: provide a production signing keystore → add `signingConfigs` to `android/app/build.gradle` → `./gradlew bundleRelease`. **External gate (credentials).**
5. (Optional) App Links for `https://www.iamanartistapp.com`: serve `/.well-known/assetlinks.json` on the domain.

## Exact next step
```bash
# 1. (external) Register the SHA-1
#    SHA-1 (debug): 4A:F1:2F:AD:D5:24:8B:FC:C0:9A:83:6E:16:93:10:C8:12:42:35:E1
#    -> Firebase Console > Project Settings > Your apps > (Android) > SHA fingerprints
# 2. (external) Install a Capacitor 8-compatible Google Auth plugin
# 3. After the above, sync + rebuild:
cd i-am-an-artist
npx cap sync android
cd android && ./gradlew clean assembleDebug
```

## Readiness verdict
- **FIREBASE ANDROID:** READY ✅ (correct `google-services.json` placed + merged; project/package verified)
- **GOOGLE AUTH:** NOT READY ⚠️ (web auth works; native Google Sign-In gated on SHA-1 registration + a Cap-8-compatible auth plugin)
- **ANDROID DEBUG BUILD:** PASS ✅ (`app-debug.apk` built with Firebase native config merged)
- **ANDROID RELEASE BUILD:** NOT TESTED ❌ (no production signing keystore provided — stop condition)
- **READY FOR PRODUCTION SIGNING:** NO (no release keystore; stop condition: credentials)
- **READY FOR GOOGLE PLAY TESTING:** NO (debug APK is fine for local testing; Play Store needs signed AAB + (optional) native Google Auth + App Check; not uploading per instructions)
