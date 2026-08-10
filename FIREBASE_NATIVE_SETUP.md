# Firebase Native Setup

Firebase Web SDK is already wired (`src/lib/firebase.js` reads `VITE_FIREBASE_*` env vars; `firebase.js` guards missing config). For Capacitor native builds you additionally need the Firebase **native** config files so Android/iOS SDKs initialize.

## Android — google-services.json
- **Destination**: `android/app/google-services.json`
- **Source**: Firebase console → Project settings → Your apps → (Android) → "Download google-services.json".
- Must match:
  - `applicationId` = `com.iamanartist.app` (matches `capacitor.config.ts` appId + `build.gradle` `applicationId`).
  - Package name: `com.iamanartist.app`.
- SHA-1/fingerprints to add (Project settings → App signatures):
  - **Debug**: from `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android`.
  - **Release**: from your release keystore (do NOT commit) — required for Play Asset Delivery and Phone-auth SHA-1.
- Plugin (deprecated GCM has been replaced by google-services Gradle plugin, already in template). The Capacitor Firebase plugins are NOT pre-linked; if you need Firestore/Auth/Analytics native, add:
  ```
  npm install @capacitor-firebase/app @capacitor-firebase/analytics @capacitor-firebase/auth @capacitor-firebase/firestore
  npx cap sync
  ```
  Then `firebase.json` → `emulator`/`functions` config unchanged.
- Apply: `npx cap sync android` after dropping the file.

## iOS — GoogleService-Info.plist
- **Destination**: `ios/App/App/GoogleService-Info.plist`
- **Source**: Firebase console → Project settings → Your apps → (iOS) → "Download GoogleService-Info.plist".
- Must match Bundle ID: `com.iamanartist.app`.
- SHA-256 (for Dynamic Links/Phone Auth) comes from the Xcode project signing cert.
- Add to target membership (checkbox) when prompted by Xcode.
- Apply: `npx cap sync ios`.

## Auth (important)
- Enable **Apple** sign-in in Firebase console → Authentication → Sign-in method (redirect URL = `https://YOUR_FIREBASE_PROJECT.firebaseapp.com/__/auth/iphone/cookbook/callback`).
- iOS **requires** Apple Sign-in if you offer any third-party or email auth.

## Remote Config / FCM (Android manifest)
- For FCM, ensure `android/app/src/main/AndroidManifest.xml` contains Firebase Messaging service entries (the Capacitor FCM plugin injects these; manual edit only if using raw FCM).
- `google-services.json` includes `mobilesdk_appid`, `api_key`, `project_number`; do not commit.

## Do NOT commit
- `android/app/google-services.json`
- `ios/App/App/GoogleService-Info.plist`
- Any keystore / release signing credentials

Add to `.gitignore` (already gitignored via `android/` + `ios/App/App/Pods`? verify):
```
# Firebase native config
/android/app/google-services.json
/ios/App/App/GoogleService-Info.plist
```
