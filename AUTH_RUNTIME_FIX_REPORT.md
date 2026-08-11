# AUTH_RUNTIME_FIX_REPORT

## Root Cause

`src/lib/firebaseAuth.js` called a non-existent Capacitor API:

```js
if (!Capacitor.isNative()) return null;
```

`Capacitor.isNative()` does not exist in `@capacitor/core`. Verified against the
installed package (`@capacitor/core@8.5.0`) type definitions and built output:
the only native-detection methods exported are `Capacitor.isNativePlatform()`
and `Capacitor.getPlatform()`. Calling the undefined `isNative()` threw
`t.isNative is not a function` in the browser whenever the Google sign-in path
(`ensureNativeGoogle()`) was exercised. The error surfaced in the browser on
`/login` after interacting with the form (Google button path). The
`auth/invalid-credential` response seen in a separate test is **expected and
correct** — it confirms Firebase email/password authentication is responding
normally for bad credentials.

The rest of the native Google flow was verified correct against the installed
`@capgo/capacitor-social-login@8.3.40` TypeScript definitions
(`dist/esm/definitions.d.ts`): `SocialLogin.initialize({ google: { webClientId,
mode } })`, `SocialLogin.login({ provider: 'google', options: { scopes } })`,
and `result.idToken` all match the current code. Only the Capacitor
platform-detection call was wrong.

## Exact File(s) Changed

| File | Change |
| --- | --- |
| `src/lib/firebaseAuth.js` | Line 53: `Capacitor.isNative()` → `Capacitor.isNativePlatform()` |
| `FIREBASE_ANDROID_RELEASE_REPORT.md` | Documentation reference updated to the correct API name (no code) |

No other source files were modified. Pre-existing uncommitted working-tree
changes in `README.md` and `functions/index.js` were left untouched.

## Exact API Correction

```diff
  const { Capacitor } = await import('@capacitor/core');
- if (!Capacitor.isNative()) return null;
+ if (!Capacitor.isNativePlatform()) return null;
```

`Capacitor.isNativePlatform()` returns `true` only inside a native Capacitor
container (Android/iOS WebView) and `false` in the plain browser — exactly the
semantic the code intended.

## Web Authentication Behavior (unchanged, now correct)

On the web, `Capacitor.isNativePlatform()` returns `false`, so
`ensureNativeGoogle()` returns `null` and `signInWithGoogle()` falls through to
the existing Firebase web flow:

- Google: `signInWithPopup(auth, googleProvider)` (existing `GoogleAuthProvider`)
- Email/password: `signInWithEmailAndPassword` / `createUserWithEmailAndPassword`
  (unaffected; confirms `auth/invalid-credential` behavior for bad passwords)

The browser never executes the `@capgo/capacitor-social-login` code path because
it is only reached after the native check returns `true`. No native-only API is
required or invoked in the browser.

## Native Android Authentication Behavior (unchanged, preserved)

On Android inside the Capacitor WebView, `Capacitor.isNativePlatform()` returns
`true`, so the native path runs:

1. `SocialLogin.initialize({ google: { webClientId: VITE_FIREBASE_WEB_CLIENT_ID, mode: 'online' } })`
2. `SocialLogin.login({ provider: 'google', options: { scopes: ['email', 'profile'] } })`
3. `GoogleAuthProvider.credential(result.idToken)`
4. `signInWithCredential(auth, credential)`

`MainActivity.java` still implements
`ModifiedMainActivityForSocialLoginPlugin` and forwards Google login intents;
`capacitor.config.ts` still enables the `google` provider for `SocialLogin`;
`npx cap sync android` reports Google enabled.

## Validation Commands / Results

| Command | Result |
| --- | --- |
| `npm run lint` | Pass (no errors) |
| `npm run typecheck` | Pass |
| `npm run build` (Vite) | Pass — `dist/` generated; `@capgo/capacitor-social-login` stays out of the eager web bundle (dynamically imported only on native) |
| `npx cap sync android` | Pass — 7 Capacitor plugins synced, Google provider configured |
| Built JS inspection | `dist/assets/index-CLhRXM0M.js` contains `isNativePlatform`; no `isNative()` remains |
| Built CSS inspection | Green/ivory facelift tokens (`45 25% 97%`, `151 40% 30%`, `.green-gradient`) present |
| Runtime platform check (Node/web) | `Capacitor.getPlatform()` → `web`; `typeof Capacitor.isNativePlatform === 'function'` → `true`; `isNativePlatform() === false` in web env → `true`; `typeof Capacitor.isNative === 'function'` → `false` (confirms the bug) |

Source-tree grep for `isNative(` returns **no matches** in `*.{js,jsx,ts,tsx}` —
no remaining incorrect native checks.

## Cross-Project Contamination Check

Searched all source/config for `we-gat-u`, `wegatyou`, `We Gat You`,
`com.wegatyou.app`. Only documentation notes stating contamination was
previously rejected appear in the docs; no actual config reference exists.
Verified clean:

- `android/app/google-services.json` → `project_id: i-am-an-artist-f3b0d`,
  `package_name: com.iamanartist.app`
- `src/lib/firebase.js` → reads `VITE_FIREBASE_*` (env: project
  `i-am-an-artist-f3b0d`, sender `62156877090`)
- `capacitor.config.ts` → `appId: com.iamanartist.app`, app `I Am An Artist`
- `.env.local` → `VITE_FIREBASE_AUTH_DOMAIN=i-am-an-artist-f3b0d.firebaseapp.com`

## Remaining Manual Device Test

Native Google Sign-In on a **physical Android device** has not been executed in
this session and is **not claimed** as verified. Before Google Play internal
testing:

1. Build/install the debug or signed release APK on a device with a Google
   account.
2. Open the app → `/login` → "Continue with Google".
3. Confirm the native Google account chooser appears and login succeeds.
4. Confirm the web `/login` still uses the green/ivory facelift and Google
   popup flow in a normal browser.
