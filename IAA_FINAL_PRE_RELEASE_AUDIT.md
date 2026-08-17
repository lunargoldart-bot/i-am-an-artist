# IAA Final Pre-Release Audit (v1.0.2)

**App:** I Am An Artist — `com.iamanartist.app`
**Platforms:** Android (v3 / 1.0.2) · iOS (build 3 / 1.0.2)
**Backend:** Firebase (project `i-am-an-artist-f3b0d`, Cloud Functions v2)
**Payments:** DPO Pay (ZMW), hosted checkout — **DPO MODE = TEST/DEMO** (internal testing only; NOT production payment readiness)
**Audit date:** 2026-08-15
**Scope:** 31-phase pre-release audit — commerce, legal, privacy, security, release readiness. No store submission performed.

> **FINAL STATUS: READY FOR INTERNAL TESTING WITH TEST DETAILS**
> DPO hardcoded fallback: **REMOVED**. No hardcoded DPO token remains in source, docs, config, or Git. BLUE items below remain as pending manual verification.

---

## 1. Service Charge Model (client-approved)

Fixed, seller-paid, tiered platform service charge. Buyer pays the artwork price only; the fee is deducted from the artist payout. Applied per artwork piece (current order model = one order per artwork).

| Price range (ZMW) | Service charge |
|---|---|
| K1 – K250 | K2 |
| K251 – K1,000 | K5 |
| K1,001 – K2,500 | K10 |
| K2,501 – K5,000 | K20 |
| K5,001 – K10,000 | K40 |
| K10,001+ | K75 |

**Implementation**
- `functions/index.js`: `DEFAULT_SERVICE_CHARGE_TIERS`, `getServiceChargeTiers()` (reads `app_settings/platform.service_charge_tiers`, falls back to defaults), `calculateServiceCharge(price, tiers)`.
- `finalizeApprovedSession` writes `gross_amount`, `service_charge`, `artist_payout`, and `service_charge_model: 'tiered_fixed_seller_paid'` on orders, transactions, payments, and artist payouts for all new sales. Artist sale email itemises the fee.
- Server is the single source of truth for the charge — the client cannot influence the fee.
- NEW `getServiceChargeSchedule` callable exposes the current schedule to the app.

**UI**
- Admin: `src/components/admin/settings/SettingsPage.jsx` — editable tier table (min/max/charge/active, add/remove, wildcard max) persisted to `app_settings/platform.service_charge_tiers`.
- Buyer: `src/pages/Checkout.jsx` discloses that a fixed seller-paid service charge applies and links to Terms.
- Legal: full schedule published in `src/pages/TermsOfService.jsx`.

**Verdict: GREEN** — approved model implemented server-authoritatively.

---

## 2. Account & Authentication

| Item | Status |
|---|---|
| Auth methods | Email/password + Google Sign-In (native `@capgo/capacitor-social-login`), popup web fallback — GREEN |
| Forgot password | NEW self-service flow — `sendPasswordReset`/`completePasswordReset` in `src/lib/firebaseAuth.js`, dialog in `src/pages/Login.jsx`, `/reset-password` route in `src/pages/ResetPassword.jsx` — GREEN |
| Change password | NEW — reauth + `updatePassword` in Profile Account section — GREEN |
| Account deletion | NEW public `/delete-account` page + in-app confirm; `deleteUserAccount` callable anonymises retention collections (orders/transactions/payments/artistPayouts/grievances/membership_payments), deletes wishlists/buyer_preferences/collaborations/messages/feature_queue/artists/artist_registry/artworks/user_progress/user_verifications/notifications, then deletes the Firestore user doc and the Firebase Auth user — GREEN |
| Roles | Stored in `users` doc, enforced server-side via `firestore.rules` `isAdmin()` — GREEN |

**Verdict: GREEN**

---

## 3. Legal Pages (NEW)

| Page | Route | Notes |
|---|---|---|
| Privacy Policy | `/privacy` | Data inventory of all collections |
| Terms & Conditions | `/terms` | Includes service-charge schedule, payment terms |
| Marketplace Policies | `/marketplace-policies` | 11 sections: buyer/seller/service-charge/refund/shipping/cancellation/returns/IP/moderation/prohibited/disputes |
| Delete Account | `/delete-account` | Public standalone page |
| Access | App footer (both app + landing), Profile account section, checkout link | — |

**Open items (BLUE — require client legal confirmation):**
- Placeholder operator entity name and jurisdiction (Zambia assumed) in Privacy/Terms.
- Support/contact email flagged as `seantinashenyakutira@gmail.com` — confirm final address.

**Verdict: YELLOW** (structure complete; legal entity details pending confirmation)

---

## 4. Navigation / UX

- App footer dead links (`#`) replaced with real routes; legal links added (`src/components/layout/Footer.jsx`).
- Landing footer legal links mapped to `/privacy`, `/terms`, `/marketplace-policies` (`src/landing/components/LandingFooter.jsx`, `src/landing/data/data.js`).
- Social icons remain `href="#"` (BLUE — provide real profiles).

**Verdict: GREEN** (social URLs pending)

---

## 5. Security

- No `.env`, keystore, `.p12`, `.jks`, or `google-services.json` tracked by git — only `.env.example` placeholders. Verified via `git ls-files`.
- Release signing uses env vars only (`KEYSTORE_PATH/KEYSTORE_PASSWORD/KEY_ALIAS/KEY_PASSWORD`); no keys in repo. `.gitignore` covers `android/keystores/`, `release-keys.properties`, `google-services.json`, `*.keystore`.
- `functions/dpo.js` **hardcoded fallback REMOVED** ✅ — `DPO_COMPANY_TOKEN` is read exclusively from `process.env`; if unset, DPO operations throw a server-side configuration error (fail-safe, no fallback token). Token value does not appear anywhere in source, docs, config, or Git (verified via `git grep`).
- `functions/.env` (gitignored) contains a configured TEST `DPO_COMPANY_TOKEN`. **TEST DPO configuration status: CONFIGURED** (value not exposed). Runtime confirmation to be validated on first internal test deploy.
- `DPO MODE = TEST/DEMO` documented in `functions/.env.example`, `RELEASE_PHASE_2_5.md`, `CHANGELOG.md`, and this document.
- No other hardcoded secrets found (OpenAI/SendGrid keys read from env only). No We Gat You contamination: mentions are documentation-only, no runtime imports.

**Verdict: GREEN** (previously RED item resolved)

---

## 6. Release Readiness

| Check | Result |
|---|---|
| `npm run lint` | PASS (0 errors) |
| `npm run typecheck` | PASS |
| `npm run build` | PASS (chunk-size warnings only, pre-existing) |
| `node --check functions/index.js` | PASS (SYNTAX OK) |
| `npx cap sync android` | PASS (Google provider enabled; social assets copied) |
| Version bump | Android versionCode 2→3, versionName 1.0.1→1.0.2; iOS build 1→3, 1.0→1.0.2 |
| ios project | iOS folder present & versioned — iOS build requires macOS/Xcode to compile (out of scope on this machine) |

**BLUE (device-level, not run here):**
- Fresh-device install/upgrade validation.
- Google Sign-In + DPO hosted-checkout redirect retest on device.
- Firebase console: confirm authorized domains include the live URL and `iamanartistapp.com`.
- Play/App Store listing assets (screenshots, privacy-policy URL pointing to `/privacy`).

**Verdict: YELLOW** — build green; device validation pending.

---

## 7. Overall Verdict

> **READY FOR INTERNAL TESTING WITH TEST DETAILS**
> The RED security blocker (hardcoded DPO fallback token) is **REMOVED**. All code paths verify GREEN. No store upload / publish performed.

**Remaining manual verification (BLUE — pending, do not block internal testing):**
1. Confirm TEST `DPO_COMPANY_TOKEN` loads at functions runtime on first test deploy (value set in gitignored `functions/.env`; runtime check pending).
2. Confirm legal entity name, jurisdiction, and support email for Privacy/Terms.
3. Device-level smoke test (sign-in, DPO checkout round-trip with TEST details, password reset email, account deletion).
4. Provide real social profile URLs.
5. Firebase console authorized-domain + listing-asset confirmation.

All commerce-critical logic (tiered service charge, admin editing, buyer disclosure, legal schedule) is implemented, server-authoritative, lint/typecheck/build-clean, and both platform versions are bumped.