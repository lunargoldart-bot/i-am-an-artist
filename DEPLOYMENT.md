# Deployment Guide

## Architecture

```
GitHub ──► Vercel (frontend)
Frontend ──► Firebase services (Auth, Firestore, Storage, Functions)
Firebase CLI ──► Rules, indexes, Storage, Functions
```

The frontend is hosted on **Vercel**. Firebase handles Authentication, Firestore, Storage, Cloud Functions (including scheduled functions), Firestore rules, Storage rules, and Firestore indexes.

Firebase Hosting is **not** used for this deployment (the configuration remains in `firebase.json` for local emulator support).

## 1. Create and select the Firebase project

```bash
npm install -g firebase-tools
firebase login
cp .firebaserc.example .firebaserc
firebase use --add
```

Use a separate staging project before production.

## 2. Enable Firebase products

In Firebase Console:

1. Add a web application.
2. Enable Email/Password and Google sign-in.
3. Create Firestore in the intended region.
4. Create the default Storage bucket.
5. Upgrade billing if required for Functions and outbound network calls.

Copy the web values into a local `.env.local` based on `.env.example`.

## 3. Configure Function environment

Create `functions/.env.<project-id>` using `functions/.env.example` as the template. Configure the services actually being deployed:

- `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`, `OPENROUTER_MODEL`
- `SENDGRID_API_KEY`, `FROM_EMAIL`, `FROM_NAME`
- `LIPILA_API_KEY`, charge URL, callback URLs, and `LIPILA_WEBHOOK_SECRET`
- `ADMIN_REPORT_EMAIL`

Never place service-account JSON, API secrets, signing keys, or live webhook secrets in the frontend `.env`.

Never copy backend secrets (OpenRouter, SendGrid, Lipila, etc.) into Vercel frontend environment variables.

## 4. Install and validate

```bash
npm install
npm --prefix functions install
npm run lint
npm run typecheck
npm run build
npm run functions:check
```

## 5. Deploy the Firebase backend

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage,functions
```

Indexes can take time to finish building. Do not open production traffic until required indexes show `Enabled`.

## 6. Deploy the frontend to Vercel

Connect the GitHub repository to Vercel, or deploy via CLI:

```bash
npx vercel --prod
```

Set all `VITE_*` environment variables in Vercel for Production and Preview. Do not add backend secrets.

After first deployment, set `VITE_APP_BASE_URL` to the production Vercel URL and redeploy.

## 7. Configure Firebase Authentication authorized domains

Add the Vercel production domain (and any custom domain) to Firebase Console > Authentication > Settings > Authorized domains.

## 8. Create the initial administrator

Register normally, then update only the trusted administrator's `users/{uid}` document from Firebase Console or an Admin SDK script:

```json
{
  "role": "admin"
}
```

Do not expose a client-side administrator registration route.

## 9. Configure callbacks

After Functions deployment, copy the deployed HTTPS callback URLs into Lipila. Ensure the provider signs callbacks and that `LIPILA_WEBHOOK_SECRET` matches. Test successful, failed, repeated, delayed, and tampered callbacks in staging.

## 10. Import original data

Before importing:

- Map original entity names to the Firestore collection names used in `src/services`.
- Preserve stable relationships such as user email or UID, artwork IDs, order IDs, and conversation IDs.
- Upload files to owner-scoped Storage paths and replace old file URLs.
- Normalize timestamps to the ISO strings used by the current code.
- Import users through Firebase Admin Authentication tooling rather than writing password data to Firestore.
- Reconcile payment records without triggering duplicate paid-state transitions.

Back up both source and destination before cutover.

## 11. Production checks

- Test registration, login, Google login, logout, and protected routes.
- Test artist verification and private document access.
- Test artwork creation, media upload, auction bidding, purchasing, escrow, delivery, and release.
- Test buyer/seller messaging and realtime updates with two separate accounts.
- Test admin pages with an administrator and a normal user.
- Confirm Firestore and Storage deny unauthorized direct writes.
- Enable App Check, logging alerts, billing alerts, backups, and retention policies.
- Verify Vercel direct route refreshes do not return 404.
