# IAA_ANDROID_MAINTENANCE_FIX_REPORT

## 1. Root Cause

The I Am An Artist release AAB (versionCode 1) was built with
**build-time maintenance mode enabled**.

The maintenance gate is implemented in
`src/lib/MaintenanceProvider.jsx`:

```js
const isMaintenanceMode = () => {
  const value = String(import.meta.env.VITE_MAINTENANCE_MODE || '').trim().toLowerCase();
  return ['true', '1', 'yes'].includes(value);
};
const maintenanceEnabled = isMaintenanceMode();
const MaintenanceProvider = ({ children }) => {
  const path = window.location.pathname;
  const adminBypass = path.startsWith('/admin') || path.startsWith('/login');
  if (maintenanceEnabled && !adminBypass) return <MaintenancePage />;
  return children;
};
```

`Vite` inlines `import.meta.env.VITE_MAINTENANCE_MODE` at build time as a string
literal. The locally-built AAB was compiled with `.env.local` containing:

```
VITE_MAINTENANCE_MODE=true
```

Because Vite loads `.env.local` in **every** mode (including `vite build` /
production), and no `.env.production` override existed, the `true` value was
baked into the release bundle. Extraction of the previous AAB confirmed the
compiled gate:

```
const Cbe=()=>{const t="true".trim().toLowerCase();return["true","1","yes"].includes(t)}
```

`["true","1","yes"].includes("true")` evaluates to **TRUE**, so
`Obe = Cbe() = true` and every route except `/admin` and `/login` renders
`<MaintenancePage />` (the "Website Under Construction" screen with the gold
"Preparing something extraordinary…" progress bar). On Android the Capacitor app
launches at `/` → construction screen shown.

> Note: `/login` and `/admin` already bypass maintenance, so a user could still
> reach the login screen via a deep link, but the default launch route showed the
> maintenance page.

## 2. Previous AAB Maintenance State

**Maintenance WAS ON (`TRUE`).** Proven from the previous versionCode-1 AAB
(`android/app/build/outputs/bundle/release/app-release.aab`) by extracting its
bundled JS and reading the inlined literal: `const t="true"`.

## 3. Current Source Maintenance State

- `.env.local` (gitignored) still contained `VITE_MAINTENANCE_MODE=true`
  (developer convenience / maintenance-on for local dev).
- `.env.example` documents the production default: `VITE_MAINTENANCE_MODE=false`.
- **No `.env.production` existed** as of commit `ff81f1c`, so production builds
  inherited the `true` from `.env.local`.

## 4. Exact Fix

Added the mode-scoped production override (gitignored, like `.env.local`,
consistent with the repo's env-file policy):

`/.env.production`  (new, gitignored)
```
VITE_MAINTENANCE_MODE=false
```

Vite environment-file precedence (highest → lowest): existing process env vars
> `.env.production.local` > `.env.production` > `.env.local` > `.env`. During
`vite build` (mode = `production`), `.env.production` overrides `.env.local`,
so the release bundle now bakes `false`. This keeps the maintenance feature
fully reversible (flip `.env.local` for dev, set Vercel's
`VITE_MAINTENANCE_MODE=true` in the dashboard for an intentional production
maintenance window, or edit `.env.production`) without hardcoding anything in
source.

Additionally bumped the Android version code so Play accepts the new upload
(`versionCode` 1 was already consumed by the maintenance-enabled build):

`android/app/build.gradle`
```diff
-        versionCode 1
-        versionName "1.0"
+        versionCode 2
+        versionName "1.0.1"
```

## 5. Artifact Metadata

| Field | Value |
| --- | --- |
| versionName | `1.0.1` |
| versionCode | `2` |
| AAB path | `android/app/build/outputs/bundle/release/app-release.aab` |
| AAB size | 8,465,751 bytes (8.07 MB) |
| APK path | `android/app/build/outputs/apk/release/app-release.apk` |
| APK size | 8,785,543 bytes (8.38 MB) |
| Firebase project | `i-am-an-artist-f3b0d` |
| Package | `com.iamanartist.app` |
| Application label | `I Am An Artist` |

## 6. Signing

Existing production keystore reused (NOT regenerated):
`C:\Users\PC\keystores\iamanartist-release.keystore` (alias `iamanartist`).

| Fingerprint | Value |
| --- | --- |
| SHA-1 | `B7:13:F1:7C:8C:DB:9E:5D:3D:8E:53:65:4D:51:8C:A3:10:C7:84:E1` |
| SHA-256 | `6F:44:D9:4C:4F:BB:E2:46:8C:28:E0:B8:35:A3:60:59:25:25:A4:C9:87:B0:ED:2C:33:80:DD:E7:EF:4D:47:15` |
| Certificate DN | `CN=I Am An Artist, OU=Mobile, O=I Am An Artist, L=, ST=, C=` |

- `apksigner verify app-release.apk` → **Verifies**, v2 scheme, 1 signer, DN &
  fingerprints exactly match the production keystore / Firebase-registered
  release fingerprints.
- `jarsigner -verify app-release.aab` → **jar verified**
  (self-signed cert warning is expected for a production app keystore).

## 7. Maintenance OFF Evidence (from the ACTUAL release artifact)

Extracted the bundled JS from the new release **APK** (`app-release.apk`) and the
new **AAB** (`app-release.aab`). In both, the inlined gate literal is `"false"`:

```
const Cbe=()=>{const t="false".trim().toLowerCase();return["true","1","yes"].includes(t)}
```

`["true","1","yes"].includes("false")` → **FALSE**. `maintenanceEnabled =
false`. The "Website Under Construction" `MaintenancePage` is never rendered on
launch. (The component source is still bundled — only the gate value changed;
the feature is preserved.)

## 8. Facelift Evidence (in release artifact)

`index-BranLO9F.css` packaged inside both APK and AAB contains the green/ivory
design tokens:

- `45 25% 97%` (ivory background) — present
- `151 40% 30%` (emerald primary) — present (`--primary`, `--ring`, etc.)
- `.green-gradient` utility — present
- Old gold `#42 78% 58%` retained as the `--gold` token only (used by the
  intentionally gold-only elite/auction/premium components; not a regression).

## 9. Native Auth Fix Verification

Packaged JS in both APK and AAB:
- `isNativePlatform` (correct Capacitor 8 API) present.
- `isNative()` (the removed broken call) **not present** (`0` matches).

`src/lib/firebaseAuth.js` (commit `ff81f1c`, line 53):
```js
if (!Capacitor.isNativePlatform()) return null;
```

## 10. Validation Commands / Results

| Command | Result |
| --- | --- |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm run build` | Pass — gate baked as `"false"` |
| `npx cap sync android` | Pass — 7 plugins, Google provider enabled |
| `gradlew clean` | BUILD SUCCESSFUL |
| `gradlew bundleRelease` | BUILD SUCCESSFUL (signed AAB) |
| `gradlew assembleRelease` | BUILD SUCCESSFUL (signed APK) |
| `aapt2 dump badging` | `package='com.iamanartist.app' versionCode='2' versionName='1.0.1'`, label `I Am An Artist` |
| `apksigner verify --print-certs` (APK) | Verifies (v2); DN `CN=I Am An Artist`; SHA-1 `b713f17c…`; SHA-256 `6f44d94c…` |
| `jarsigner -verify` (AAB) | jar verified |
| Gate literal in APK/AAB JS | `"false"` → OFF |
| `isNativePlatform` in APK/AAB JS | present |
| `isNative()` in APK/AAB JS | absent |

## 11. Cross-Project Contamination Scan

Searched the full extracted APK and full extracted AAB for:
`wegatyou`, `we-gat-u`, `WeGatYou`, `We Gat You`, `com.wegatyou.app`.

**Result: NONE FOUND (clean)** in both artifacts.

Confirmed the only app identity present:
- `com.iamanartist.app` in 4 files (APK) / 4 files (AAB)
- `i-am-an-artist-f3b0d` in 3 files (APK) / 2 files (AAB)

No We Gat You keystore, Firebase project, package name, or branding exists in
the artifacts.

## 12. Device Test

**DEVICE TEST NOT PERFORMED.** No Android device or emulator was attached to
this host at build time (`adb devices` → `List of devices attached` empty; no
`adb` on PATH, platform-tools present but no device). The author of this report
has therefore **not** verified native Google Sign-In on a physical device, and
does not claim it as passing. Required on-device checklist:

1. Launch app (root `/`) — expect the green/ivory/charcoal home, NOT
   "Website Under Construction".
2. `/login` loads with the new facelift.
3. "Continue with Google" opens the native account picker (no
   `t.isNative is not a function` error).
4. Sign-in succeeds with a Google account and Firebase reflects the user.

## 13. Git State

HEAD = `ff81f1c`. This task added:
- `.env.production` (gitignored — not committed)
- `android/app/build.gradle` versionCode 1→2 / versionName 1.0 → 1.0.1
- `IAA_ANDROID_MAINTENANCE_FIX_REPORT.md`

README.md / functions/index.js pre-existing working-tree changes left untouched.

## FINAL VERDICT

**READY FOR MANUAL GOOGLE PLAY INTERNAL TESTING UPDATE** (with the mandatory
on-device Google Sign-In smoke test from section 12 performed first).

This build is **NOT uploaded**. Stopped after artifact verification.
