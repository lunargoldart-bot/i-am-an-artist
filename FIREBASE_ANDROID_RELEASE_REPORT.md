# Firebase Android Release Report

**Project:** I Am An Artist
**Date:** 2026-08-10
**Status:** Android production signing configured & verified (release AAB/APK built with dedicated key).

## Identity (verified, no cross-project contamination)

| Field | Value |
|---|---|
| Project | I Am An Artist |
| Firebase project | `i-am-an-artist-f3b0d` |
| Firebase project number | `62156877090` |
| Android package | `com.iamanartist.app` |
| Firebase Android App ID | `1:62156877090:android:928d8c83e2ebb47cf0c97b` |
| Firebase Android app display name | `I Am An Artist Android` |
| Capacitor version | `8.5.0` |
| Version code | `1` |
| Version name | `1.0` |

`android/app/google-services.json` verified against the live server config
(`firebase apps:sdkconfig`): `project_id = i-am-an-artist-f3b0d`, `project_number = 62156877090`,
`package_name = com.iamanartist.app`, `mobilesdk_app_id = 1:62156877090:android:928d8c83e2ebb47cf0c97b`.
No `we-gat-u` / `com.wegatyou.app` / `819893585941` references exist in the Android config, source,
or tracked documentation content other than notes describing the rejected file.

## Certificates

### DEBUG (debug signing key, verified from `~/.android/debug.keystore`)

| Item | Value |
|---|---|
| SHA-1 | `4A:F1:2F:AD:D5:24:8B:FC:C0:9A:83:6E:16:93:10:C8:12:42:35:E1` |
| SHA-256 | `B9:F2:E3:10:C6:F4:CB:5A:1C:57:69:0B:B4:4B:11:3D:1B:0A:17:8A:78:85:A5:C0:1A:7A:DB:DC:BE:25:1A:3B` |

### RELEASE / PRODUCTION (dedicated I Am An Artist key)

| Item | Value |
|---|---|
| Keystore | `C:\Users\PC\keystores\iamanartist-release.keystore` (outside repo) |
| Alias | `iamanartist` |
| Key algorithm | RSA 4096-bit, SHA384withRSA |
| Validity | 10,000 days |
| SHA-1 | `B7:13:F1:7C:8C:DB:9E:5D:3D:8E:53:65:4D:51:8C:A3:10:C7:84:E1` |
| SHA-256 | `6F:44:D9:4C:4F:BB:E2:46:8C:28:E0:B8:35:A3:60:59:25:25:A4:C9:87:B0:ED:2C:33:80:DD:E7:EF:4D:47:15` |
| Credentials file | `C:\Users\PC\keystores\iamanartist-release.env` (outside repo, never committed) |

The keystore password is a 64-hex random secret. It is **not** printed here and is never committed.
Load it for builds via:

```powershell
Get-Content C:\Users\PC\keystores\iamanartist-release.env |
  ForEach-Object { $k,$v = $_ -split '=',2; Set-Item -Path "env:$k" -Value $v }
```

## Signing configuration

`android/app/build.gradle` now has an env-driven `signingConfigs.release` and `release {
signingConfig signingConfigs.release }`. No secrets live in the repo.

| Gradle field | Env var |
|---|---|
| `storeFile` | `KEYSTORE_PATH` |
| `storePassword` | `KEYSTORE_PASSWORD` |
| `keyAlias` | `KEY_ALIAS` |
| `keyPassword` | `KEY_PASSWORD` |

`android/gradle.properties` documents the contract. `android/.gitignore` and the repo
`.gitignore` ignore `*.keystore` / `*.jks` as defense in depth (repo root already ignored
`android/keystores/` and `android/app/release-keys.properties`).

## Google authentication

- **Web:** READY — `src/lib/firebaseAuth.js` uses `GoogleAuthProvider` + `signInWithPopup` (unchanged).
- **Native Android:** code READY, runtime gated on fingerprint registration.
  - Installed **`@capgo/capacitor-social-login@8.3.40`** — the official, actively maintained
    Capacitor plugin (peer dep `@capacitor/core >= 8.0.0`, compatible with Capacitor 8.5.0;
    the old `@codetrix-studio/capacitor-google-auth` peers on Capacitor 6 and is **not** used).
  - `MainActivity.java` updated per the plugin contract (implements
    `ModifiedMainActivityForSocialLoginPlugin`, forwards Google login intents).
  - `src/lib/firebaseAuth.js` `signInWithGoogle` now detects `Capacitor.isNative()`, calls
    `SocialLogin.login({ provider: 'google' })`, exchanges `result.idToken` via
    `signInWithCredential(auth, GoogleAuthProvider.credential(idToken))`, and falls back to the
    web popup flow otherwise. Firebase initialization is unchanged.
  - `VITE_FIREBASE_WEB_CLIENT_ID=62156877090-jo881bbvvpcetp522dgvptlb9um41m5g.apps.googleusercontent.com`
    (the project's web client ID from `google-services.json`, `oauth_client` `client_type: 3`)
    was added to `.env.example` and `.env.local`. It is passed to `SocialLogin.initialize()`.
- **Blocker to a working native sign-in (external gate):** Google Sign-In for Android requires an
  **Android OAuth client** whose `certificate_hash` matches the signing SHA-1. The Firebase
  Management API / CLI exposes no command to register SHA fingerprints; this is a **Firebase
  Console** operation. See "Remaining manual actions".

## Firebase configuration

- `google-services.json` is correctly placed and the Google Services Gradle plugin merges it.
  Verified merged resources (both debug & release builds) contain:
  `project_id = i-am-an-artist-f3b0d`, `gcm_defaultSenderId = 62156877090`,
  `google_app_id = 1:62156877090:android:928d8c83e2ebb47cf0c97b`,
  `google_storage_bucket = i-am-an-artist-f3b0d.firebasestorage.app`,
  `package_name = com.iamanartist.app`. **READY** ✅
- **App Check:** NOT implemented in the application (no `initializeAppCheck` /
  `AppCheckProviderFactory` usage). Documented as not required for this build.

## Build artifacts

| Artifact | Path | Size |
|---|---|---|
| Debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` | 8,367,611 bytes |
| Release AAB | `android/app/build/outputs/bundle/release/app-release.aab` | 8,465,588 bytes |
| Release APK | `android/app/build/outputs/apk/release/app-release.apk` | 8,785,363 bytes |

Build chain: `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run build` ✅ ·
`npx cap sync android` ✅ (7 plugins) · `./gradlew clean assembleDebug` ✅ ·
`./gradlew bundleRelease` ✅ · `./gradlew assembleRelease` ✅.

## Signature verification

### Release APK (`apksigner verify --verbose --print-certs`)

```
Verifies
Verified using v2 scheme (APK Signature Scheme v2): true
Signer #1 certificate SHA-1 digest:   b713f17c8cdb9e5d3d8e53654d518ca310c784e1
Signer #1 certificate SHA-256 digest: 6f44d94c4fbbe2468c28e0b835a360592525a4c987b0ed2c3380dde7ef4d4715
Signer #1 key algorithm: RSA  Signer #1 key size (bits): 4096
```

### Release AAB (`jarsigner -verify`)

`jar verified.` Signer: `CN=I Am An Artist, OU=Mobile, O=I Am An Artist`, SHA384withRSA, 4096-bit.

### Three-way cross-check

|                        | SHA-1                                   | SHA-256                                   |
|------------------------|-----------------------------------------|-------------------------------------------|
| Keystore (keytool)     | `B7:13:F1:7C:8C:DB:9E:5D:3D:8E:53:65:4D:51:8C:A3:10:C7:84:E1` | `6F:44:D9:4C:4F:BB:E2:46:8C:28:E0:B8:35:A3:60:59:25:25:A4:C9:87:B0:ED:2C:33:80:DD:E7:EF:4D:47:15` |
| APK signer (apksigner) | `b713f17c8cdb9e5d3d8e53654d518ca310c784e1` (= keystore) | `6f44d94c4fbbe2468c28e0b835a360592525a4c987b0ed2c3380dde7ef4d4715` (= keystore) |
| Firebase registered    | **NOT REGISTERED** (Console gate)       | **NOT REGISTERED** (Console gate)         |

**KEYS = APK SIGNER** ✅. Firebase registration is the only remaining step to declare
`KEYSTORE = APK SIGNER = FIREBASE`.

## Readiness verdict

| Area | Verdict |
|---|---|
| FIREBASE ANDROID CONFIG | **READY** |
| GOOGLE SIGN-IN | **PARTIALLY READY** (code wired; needs SHA registration in Firebase Console + Play App Signing SHA for the uploaded cert) |
| DEBUG BUILD | **READY** (debug APK built & apksigner-verified, v2) |
| PRODUCTION SIGNING | **READY** (dedicated keystore, env-driven signing, matches apksigner) |
| PRODUCTION SHA-1 | **NOT READY** (computed, not yet registered in Firebase) |
| PRODUCTION SHA-256 | **NOT READY** (computed, not yet registered in Firebase) |
| SIGNED AAB | **READY** (8.47 MB, `jar verified`, signed with production key) |
| SIGNATURE VERIFICATION | **READY** (v2 true; signer = keystore) |
| GOOGLE PLAY READINESS | **PARTIALLY READY** (final gate: fingerprint registration + Play-to-Firebase SHA pairing) |

## Remaining manual actions (genuinely require you)

1. **Register the SHA fingerprints in Firebase Console**
   - Console → Project Settings (`https://console.firebase.google.com/project/i-am-an-artist-f3b0d/settings/general/android:com.iamanartist.app`)
   - Under **SHA certificate fingerprints**, add BOTH for the package `com.iamanartist.app`:
     - Debug SHA-1: `4A:F1:2F:AD:D5:24:8B:FC:C0:9A:83:6E:16:93:10:C8:12:42:35:E1`
     - Production SHA-1: `B7:13:F1:7C:8C:DB:9E:5D:3D:8E:53:65:4D:51:8C:A3:10:C7:84:E1`
   - Optionally register SHA-256 too (used by App Check / Play Integrity if enabled later).
   - After saving, `firebase apps:sdkconfig` will start emitting an Android OAuth
     `client_type: 1` entry with the matching `certificate_hash` — that is the confirmation.
2. **Google Play App Signing:** in Play Console → Release → Setup → App integrity, check "App signing"
   certificate SHA-1/256, and if Play's upload/signing keys differ from the keystore above, register
   that Google Play SHA-1 in Firebase as well (the Capgo plugin requires the SHA of the cert that
   actually signs the installed build).
3. **Optional App Check:** if you later enforce App Check, add a Play Integrity provider and register
   the SHA-256; you will need API key restrictions in Google Cloud Console.

## Safety notes

- Keystore and credentials live outside the repository and are gitignored everywhere inside it.
- No passwords / private keys are stored in this repo or printed here.
- No We Gat You keystore, fingerprint, or Firebase credentials were used or referenced.
- `google-services.json` remains gitignored (it is intentionally local; the Google Services
  Gradle plugin merges it at build time).